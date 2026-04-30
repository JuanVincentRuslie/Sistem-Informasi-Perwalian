const { PDFParse } = require("pdf-parse");
const fs = require("node:fs/promises");
const path = require("node:path");

// Mapping ini mengikuti ID nilai yang dipakai di logic server lama.
const GRADE_TO_SCORE_ID = Object.freeze({
  A: 10,
  "A-": 9,
  "B+": 8,
  B: 7,
  "B-": 6,
  "C+": 5,
  C: 4,
  "C-": 3,
  D: 2,
  E: 1,
});

// Rank dipakai untuk memilih nilai terbaik saat satu kode mata kuliah muncul lebih dari sekali.
const GRADE_RANK = Object.freeze({
  A: 10,
  "A-": 9,
  "B+": 8,
  B: 7,
  "B-": 6,
  "C+": 5,
  C: 4,
  "C-": 3,
  D: 2,
  E: 1,
  P: 0,
  F: 0,
});

// Format baris mata kuliah dari hasil ekstraksi PDF DPS tidak memakai tab.
// Contoh dengan nilai:
//   AIF181101 Pemodelan untuk Komputasi A 20221
// Contoh tanpa nilai:
//   AIF234002 Tugas Akhir 2
//
// Capture group:
//   1. ([A-Z]{3}\d{6})                  -> kode mata kuliah, contoh AIF181101
//   2. (.+?)                            -> nama mata kuliah, dibuat non-greedy
//   3. (A-|B+|B-|C+|C-|A|B|C|D|E|P|F)   -> nilai huruf, opsional
//   4. (\d{5})                          -> tahun semester, contoh 20221, opsional
//
// Bagian nilai dan tahun semester dibuat satu grup opsional supaya mata kuliah
// yang belum punya nilai tetap masuk ke `courses` dengan nilai/tahunSemester null.
const COURSE_LINE =
  /^([A-Z]{3}\d{6})\s+(.+?)(?:\s+(A-|B\+|B-|C\+|C-|A|B|C|D|E|P|F)\s+(\d{5}))?$/;
// Format IP di DPS:
//   IPK(2025-1) (130) : 3.17
//   IPS(2025-1) (15) : 3.60
// Capture-nya dipakai untuk mengambil jenis IP, periode, jumlah SKS, dan nilai IP.
const IP_LINE = /^(IPK|IPS)\(([^)]+)\)\s+\((\d+)\)\s*:\s*([\d.]+)$/i;

const ACADEMIC_FIELD_MAP = Object.freeze({
  Ditempuh: "ditempuh",
  "Lulus Wajib": "lulusWajib",
  "Lulus Pilihan": "lulusPilihan",
  "Lulus Wajib Peminatan": "lulusWajibPeminatan",
  "Lulus Pilihan Peminatan": "lulusPilihanPeminatan",
  "Total Lulus": "totalLulus",
  "Ditempuh Semester ini": "ditempuhSemesterIni",
  "Diizinkan untuk semester yad.": "diizinkanUntukSemesterYad",
  "Cuti Studi": "cutiStudi",
  "Akhir masa Studi": "akhirMasaStudi",
});

if (require.main === module) {
  runCli().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exit(1);
  });
}

async function runCli() {
  const args = process.argv.slice(2);
  const inputPath = args.find((arg) => !arg.startsWith("--"));
  const outputRaw = args.includes("--raw");
  const outputJson = args.includes("--json");

  if (!inputPath) {
    process.stderr.write(await getUsageText());
    process.exit(1);
  }

  const rawText = await extractPdfText(inputPath);

  if (outputRaw) {
    process.stdout.write(rawText);
    return;
  }

  const parsed = parseDps(rawText);
  const jsonOutputPath = await saveParsedJson(inputPath, parsed);

  if (outputJson) {
    process.stdout.write(`${JSON.stringify(parsed, null, 2)}\n`);
    return;
  }

  process.stdout.write(`JSON tersimpan: ${jsonOutputPath}\n`);
}

async function getUsageText() {
  const pdfFiles = (await fs.readdir("."))
    .filter((file) => file.toLowerCase().endsWith(".pdf"))
    .map((file) => `  ${file}`)
    .join("\n");

  return `Usage: node index.js <file-pdf> [--json|--raw]

Contoh:
  node index.js DPS_6182201039.pdf
  node index.js DPS_6182201039.pdf --json
  node index.js DPS_6182201039.pdf --raw

PDF yang tersedia:
${pdfFiles || "  (tidak ada PDF di folder ini)"}\n`;
}

async function parseDpsFile(filePath) {
  const rawText = await extractPdfText(filePath);
  const parsed = parseDps(rawText);
  const jsonOutputPath = await saveParsedJson(filePath, parsed);

  return {
    parsed,
    jsonOutputPath,
  };
}

async function extractPdfText(filePath) {
  const buffer = await fs.readFile(filePath);
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();

  return result.pages.map((page) => page.text).join("\n");
}

async function saveParsedJson(filePath, parsed) {
  const outputPath = getJsonOutputPath(filePath);
  const content = `${JSON.stringify(parsed, null, 2)}\n`;

  await fs.writeFile(outputPath, content, "utf8");

  return outputPath;
}

function getJsonOutputPath(filePath) {
  const parsedPath = path.parse(filePath);
  const directory = parsedPath.dir || ".";

  return path.resolve(directory, `${parsedPath.name}.json`);
}

function parseDps(rawText) {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const profile = {
    npm: findLineValue(lines, "NPM"),
    name: findLineValue(lines, "NAMA"),
    email: findLineValue(lines, "EMAIL"),
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
    // Transcript hanya berisi mata kuliah yang sudah punya nilai dan siap dipetakan ke DB.
    transcript,
    unparsedCourseLines,
  };
}

function findLineValue(lines, label) {
  const line = lines.find((item) => item.startsWith(`${label} `));
  return line ? line.slice(label.length).trim() : null;
}

function parseCourses(lines) {
  const start = lines.findIndex((line) => line.startsWith("Kode Mata Kuliah"));
  const end = lines.findIndex(
    (line, index) => index > start && line === "Kode Semester:",
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

function parseAcademicInfo(lines) {
  const academic = {
    ipk: null,
    ips: null,
    sks: {},
  };

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
    if (!fieldMatch) {
      continue;
    }

    const [, label, value] = fieldMatch;
    const key = ACADEMIC_FIELD_MAP[label];
    if (key) {
      academic.sks[key] = parseAcademicValue(value);
    }
  }

  return academic;
}

function parseAcademicValue(value) {
  return /^\d+$/.test(value) ? Number(value) : value;
}

function chooseBestScores(courses) {
  const byCode = new Map();

  for (const course of courses) {
    const existing = byCode.get(course.kode);
    if (!existing || isBetterScore(course, existing)) {
      byCode.set(course.kode, course);
    }
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

function isBetterScore(candidate, existing) {
  const candidateRank = GRADE_RANK[candidate.nilai] ?? -1;
  const existingRank = GRADE_RANK[existing.nilai] ?? -1;

  if (candidateRank !== existingRank) {
    return candidateRank > existingRank;
  }

  return Number(candidate.tahunSemester) > Number(existing.tahunSemester);
}

module.exports = {
  parseDpsFile,
  extractPdfText,
  parseDps,
  saveParsedJson,
  getJsonOutputPath,
};
