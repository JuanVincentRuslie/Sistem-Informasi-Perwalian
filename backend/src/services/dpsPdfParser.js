/**
 * Parser DPS PDF untuk backend.
 * Disalin dari parser_for_backend/Dps_parser/index.js dengan modifikasi:
 *  - Terima `buffer` (PDF di memory) selain `filePath`
 *  - Tidak nulis JSON ke disk (skip saveParsedJson)
 *  - Export `parseDpsBuffer(buffer)` yang return parsed object langsung
 */
const fs = require('node:fs/promises');
const { PDFParse } = require('pdf-parse');

const GRADE_TO_SCORE_ID = Object.freeze({
  A: 10, 'A-': 9, 'B+': 8, B: 7, 'B-': 6,
  'C+': 5, C: 4, 'C-': 3, D: 2, E: 1,
});

const GRADE_RANK = Object.freeze({
  A: 10, 'A-': 9, 'B+': 8, B: 7, 'B-': 6,
  'C+': 5, C: 4, 'C-': 3, D: 2, E: 1, P: 0, F: 0,
});

const COURSE_LINE =
  /^([A-Z]{3}\d{6})\s+(.+?)(?:\s+(A-|B\+|B-|C\+|C-|A|B|C|D|E|P|F)\s+(\d{5}))?$/;

const IP_LINE = /^(IPK|IPS)\(([^)]+)\)\s+\((\d+)\)\s*:\s*([\d.]+)$/i;

const ACADEMIC_FIELD_MAP = Object.freeze({
  Ditempuh: 'ditempuh',
  'Lulus Wajib': 'lulusWajib',
  'Lulus Pilihan': 'lulusPilihan',
  'Lulus Wajib Peminatan': 'lulusWajibPeminatan',
  'Lulus Pilihan Peminatan': 'lulusPilihanPeminatan',
  'Total Lulus': 'totalLulus',
  'Ditempuh Semester ini': 'ditempuhSemesterIni',
  'Diizinkan untuk semester yad.': 'diizinkanUntukSemesterYad',
  'Cuti Studi': 'cutiStudi',
  'Akhir masa Studi': 'akhirMasaStudi',
});

async function extractTextFromBuffer(buffer) {
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  return result.pages.map((page) => page.text).join('\n');
}

async function extractTextFromFile(filePath) {
  const buffer = await fs.readFile(filePath);
  return extractTextFromBuffer(buffer);
}

function findLineValue(lines, label) {
  const line = lines.find((item) => item.startsWith(`${label} `));
  return line ? line.slice(label.length).trim() : null;
}

function parseCourses(lines) {
  const start = lines.findIndex((line) => line.startsWith('Kode Mata Kuliah'));
  const end = lines.findIndex(
    (line, index) => index > start && line === 'Kode Semester:',
  );

  if (start === -1 || end === -1) {
    return { courses: [], unparsedCourseLines: [] };
  }

  const courses = [];
  const unparsedCourseLines = [];
  let semester = null;

  for (const line of lines.slice(start + 1, end)) {
    const semesterMatch = /^Semester(\d+)$/i.exec(line);
    if (semesterMatch) {
      semester = Number(semesterMatch[1]);
      continue;
    }

    const courseMatch = COURSE_LINE.exec(line);
    if (!courseMatch) {
      unparsedCourseLines.push(line);
      continue;
    }

    const [, kode, nama, nilai = null, tahunSemester = null] = courseMatch;

    courses.push({
      semester,
      kode,
      nama,
      nilai,
      scoreId: nilai ? GRADE_TO_SCORE_ID[nilai] ?? null : null,
      tahunSemester,
    });
  }

  return { courses, unparsedCourseLines };
}

function parseAcademicValue(value) {
  return /^\d+$/.test(value) ? Number(value) : value;
}

function parseAcademicInfo(lines) {
  const academic = { ipk: null, ips: null, sks: {} };

  for (const line of lines) {
    const ipMatch = IP_LINE.exec(line);
    if (ipMatch) {
      const [, label, periode, sks, nilai] = ipMatch;
      academic[label.toLowerCase()] = {
        periode,
        sks: Number(sks),
        nilai: Number(nilai),
      };
      continue;
    }

    const fieldMatch = /^(.+?)\s*:\s*(.+)$/.exec(line);
    if (!fieldMatch) continue;

    const [, label, value] = fieldMatch;
    const key = ACADEMIC_FIELD_MAP[label];
    if (key) academic.sks[key] = parseAcademicValue(value);
  }

  return academic;
}

function isBetterScore(candidate, existing) {
  const candidateRank = GRADE_RANK[candidate.nilai] ?? -1;
  const existingRank = GRADE_RANK[existing.nilai] ?? -1;
  if (candidateRank !== existingRank) return candidateRank > existingRank;
  return Number(candidate.tahunSemester) > Number(existing.tahunSemester);
}

function chooseBestScores(courses) {
  const byCode = new Map();
  for (const course of courses) {
    const existing = byCode.get(course.kode);
    if (!existing || isBetterScore(course, existing)) byCode.set(course.kode, course);
  }
  return [...byCode.values()].map((course) => ({
    kode: course.kode,
    nama: course.nama,
    nilai: course.nilai,
    scoreId: course.scoreId,
    tahunSemester: course.tahunSemester,
    semester: course.semester,
  }));
}

function parseDps(rawText) {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const profile = {
    npm: findLineValue(lines, 'NPM'),
    name: findLineValue(lines, 'NAMA'),
    email: findLineValue(lines, 'EMAIL'),
  };

  const { courses, unparsedCourseLines } = parseCourses(lines);
  const completedCourses = courses.filter((course) => course.nilai);
  const transcript = chooseBestScores(completedCourses);

  return {
    profile,
    academic: parseAcademicInfo(lines),
    stats: {
      totalCourses: courses.length,
      gradedCourses: completedCourses.length,
      ungradedCourses: courses.length - completedCourses.length,
      transcriptEntries: transcript.length,
      unparsedCourseLines: unparsedCourseLines.length,
    },
    courses,
    transcript,
    unparsedCourseLines,
  };
}

/**
 * Parse PDF DPS dari buffer (langsung di memory).
 * Tidak ada I/O ke disk.
 *
 * @param {Buffer} buffer
 * @returns {Promise<{profile, academic, stats, courses, transcript, unparsedCourseLines}>}
 */
async function parseDpsBuffer(buffer) {
  const rawText = await extractTextFromBuffer(buffer);
  return parseDps(rawText);
}

/**
 * Parse PDF DPS dari file path (untuk testing / CLI).
 */
async function parseDpsFile(filePath) {
  const rawText = await extractTextFromFile(filePath);
  return parseDps(rawText);
}

module.exports = { parseDps, parseDpsBuffer, parseDpsFile };
