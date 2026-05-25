/**
 * Parser jadwal Excel untuk backend.
 *
 * Template TA (custom, bukan template kampus) — 3 sheet wajib:
 *  1. "Jadwal Kelas"  — kuliah & praktikum, 1 sesi = 1 dosen koordinator
 *  2. "Jadwal UTS"    — jadwal Ujian Tengah Semester, bisa multi-shift per matkul
 *  3. "Jadwal UAS"    — jadwal Ujian Akhir Semester, bisa multi-shift per matkul
 *
 * Bisa terima `buffer` (Excel di memory) selain `input` (file path).
 * `output` opsional (tidak nulis ke disk kalau tidak diminta).
 */
const fs = require('node:fs/promises');
const ExcelJS = require('exceljs');

const SHEET_KELAS = 'Jadwal Kelas';
const SHEET_UTS = 'Jadwal UTS';
const SHEET_UAS = 'Jadwal UAS';

const KELAS_REQUIRED_HEADERS = [
  'Kode Mata Kuliah',
  'sks',
  'Nama Mata Kuliah',
  'Kelas',
  'Sesi Kelas',
  'Hari',
  'Jam Mulai',
  'Jam Selesai',
  'Bentuk Pembelajaran',
  'Dosen Koordinator',
];

const UJIAN_REQUIRED_HEADERS = [
  'Kode Mata Kuliah',
  'Nama Mata Kuliah',
  'Tanggal',
  'Jam Mulai',
  'Jam Selesai',
];

function cellText(cell) {
  if (!cell) return null;
  const value = cell.value;
  if (value == null) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'string') return normalizeBlank(value);
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (value.text) return normalizeBlank(value.text);
  if (value.richText) return normalizeBlank(value.richText.map((part) => part.text).join(''));
  if (value.result != null) return value.result;
  if (value.hyperlink && value.text) return normalizeBlank(value.text);
  return normalizeBlank(String(value));
}

function normalizeBlank(value) {
  if (value == null) return null;
  const text = String(value).trim();
  if (!text || text === '-') return null;
  return text;
}

function asString(value) {
  const normalized = normalizeBlank(value);
  return normalized == null ? null : String(normalized);
}

function asInt(value) {
  if (value == null || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? Math.trunc(number) : null;
}

function normalizeHari(value) {
  const hari = asString(value)?.toLowerCase();
  const allowed = new Set(['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu']);
  return allowed.has(hari) ? hari : null;
}

function pad2(value) {
  return String(value).padStart(2, '0');
}

function formatTime(value) {
  if (value == null || value === '') return null;

  if (value instanceof Date) {
    // ExcelJS menyimpan time-only cell sebagai Date di epoch 1899-12-30 UTC.
    // Pakai getUTC* supaya tidak digeser oleh timezone OS (mis. 13:00 jadi 19:42 di Asia/Bangkok).
    return `${pad2(value.getUTCHours())}:${pad2(value.getUTCMinutes())}`;
  }

  if (typeof value === 'number') {
    const totalMinutes = Math.round(value * 24 * 60);
    const hours = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;
    return `${pad2(hours)}:${pad2(minutes)}`;
  }

  const text = String(value).trim();
  const match = text.match(/^(\d{1,2})[:.](\d{2})(?::\d{2})?$/);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return `${pad2(hours)}:${pad2(minutes)}`;
}

function formatDate(value) {
  if (!(value instanceof Date)) return null;
  return `${value.getUTCFullYear()}-${pad2(value.getUTCMonth() + 1)}-${pad2(value.getUTCDate())}`;
}

function buildHeaderMap(worksheet) {
  const headerMap = new Map();
  worksheet.getRow(1).eachCell({ includeEmpty: false }, (cell, colNumber) => {
    const header = asString(cellText(cell));
    if (header) headerMap.set(header, colNumber);
  });
  return headerMap;
}

function requireHeaders(headerMap, required, sheetName) {
  const missing = required.filter((header) => !headerMap.has(header));
  if (missing.length > 0) {
    throw new Error(`Sheet "${sheetName}" — header wajib tidak ditemukan: ${missing.join(', ')}`);
  }
}

function rowValue(row, headerMap, header) {
  const column = headerMap.get(header);
  if (!column) return null;
  return cellText(row.getCell(column));
}

function makeClassKey({ periodeId, kodeMatkul, namaKelas }) {
  return [periodeId ?? 'null', kodeMatkul, namaKelas].join('|');
}

function makeSessionKey({ nomorSesi, hari, jamMulai, jamSelesai, bentukPembelajaran, ruangan }) {
  return [nomorSesi, hari, jamMulai, jamSelesai, bentukPembelajaran ?? '', ruangan ?? ''].join('|');
}

function isTemplateHintRow(values) {
  const text = values
    .filter((value) => value != null)
    .map((value) => String(value).toLowerCase())
    .join(' ');
  return text.includes('ketik kode') || text.includes('otomatis terisi') || text.includes('format hh:mm');
}

function compareKelas(a, b) {
  return a.kode_matkul.localeCompare(b.kode_matkul) || a.nama_kelas.localeCompare(b.nama_kelas);
}

function compareSesi(a, b) {
  return a.nomor_sesi - b.nomor_sesi || a.hari.localeCompare(b.hari) || a.jam_mulai.localeCompare(b.jam_mulai);
}

function compareUjian(a, b) {
  return a.tanggal.localeCompare(b.tanggal)
    || a.jam_mulai.localeCompare(b.jam_mulai)
    || a.kode_matkul.localeCompare(b.kode_matkul)
    || a.shift - b.shift;
}

function parseKelasSheet(worksheet, periodeId, warnings) {
  const headerMap = buildHeaderMap(worksheet);
  requireHeaders(headerMap, KELAS_REQUIRED_HEADERS, SHEET_KELAS);

  const kelasMap = new Map();
  let ignoredRows = 0;
  let skippedRows = 0;
  let parsedRows = 0;

  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return;

    const kodeMatkul = asString(rowValue(row, headerMap, 'Kode Mata Kuliah'));
    const namaMatkul = asString(rowValue(row, headerMap, 'Nama Mata Kuliah'));
    const sks = asInt(rowValue(row, headerMap, 'sks'));
    const namaKelas = asString(rowValue(row, headerMap, 'Kelas'));
    const nomorSesi = asInt(rowValue(row, headerMap, 'Sesi Kelas'));
    const hari = normalizeHari(rowValue(row, headerMap, 'Hari'));
    const jamMulai = formatTime(rowValue(row, headerMap, 'Jam Mulai'));
    const jamSelesai = formatTime(rowValue(row, headerMap, 'Jam Selesai'));
    const bentukPembelajaran = asString(rowValue(row, headerMap, 'Bentuk Pembelajaran'));
    const dosenUtama = asString(rowValue(row, headerMap, 'Dosen Koordinator'));
    const ruangan = asString(rowValue(row, headerMap, 'Ruangan (khusus untuk Praktikum)'));

    if (
      isTemplateHintRow([
        kodeMatkul, namaMatkul, namaKelas, nomorSesi, hari,
        jamMulai, jamSelesai, bentukPembelajaran, dosenUtama,
      ])
    ) {
      ignoredRows += 1;
      return;
    }

    const requiredValues = {
      kodeMatkul, namaMatkul, sks, namaKelas, nomorSesi,
      hari, jamMulai, jamSelesai, bentukPembelajaran, dosenUtama,
    };
    const missingFields = Object.entries(requiredValues)
      .filter(([, value]) => value == null)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      skippedRows += 1;
      warnings.push({
        sheet: SHEET_KELAS,
        row: rowNumber,
        type: 'skipped_row',
        message: `Baris dilewati karena field wajib kosong/tidak valid: ${missingFields.join(', ')}`,
      });
      return;
    }

    parsedRows += 1;

    const classKey = makeClassKey({ periodeId, kodeMatkul, namaKelas });
    let kelas = kelasMap.get(classKey);
    if (!kelas) {
      kelas = {
        periode_id: periodeId,
        kode_matkul: kodeMatkul,
        nama_matkul: namaMatkul,
        sks,
        nama_kelas: namaKelas,
        tipe: null,
        sesi: [],
        _sessionMap: new Map(),
        _rowExcel: rowNumber,
      };
      kelasMap.set(classKey, kelas);
    }

    const sessionKey = makeSessionKey({
      nomorSesi, hari, jamMulai, jamSelesai, bentukPembelajaran, ruangan,
    });

    if (!kelas._sessionMap.has(sessionKey)) {
      const session = {
        nomor_sesi: nomorSesi,
        hari,
        jam_mulai: jamMulai,
        jam_selesai: jamSelesai,
        bentuk_pembelajaran: bentukPembelajaran,
        dosen_utama: dosenUtama,
        ruangan,
      };
      kelas._sessionMap.set(sessionKey, session);
      kelas.sesi.push(session);
    }
  });

  const kelas = [...kelasMap.values()].sort(compareKelas).map((item) => {
    item.sesi.sort(compareSesi);
    delete item._sessionMap;
    return item;
  });

  return { kelas, parsedRows, ignoredRows, skippedRows };
}

function parseUjianSheet(worksheet, jenis, knownKodeMatkul, warnings) {
  const headerMap = buildHeaderMap(worksheet);
  requireHeaders(headerMap, UJIAN_REQUIRED_HEADERS, worksheet.name);

  const rows = [];
  // Dedupe by (kode_matkul, shift) — jadwal ujian unik per matkul+shift, bukan per kelas.
  // Kalau kaprodi salah listing baris per kelas, baris kedua dst dilewati + warning.
  const seen = new Map();

  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return;

    const kodeMatkul = asString(rowValue(row, headerMap, 'Kode Mata Kuliah'));
    const namaMatkul = asString(rowValue(row, headerMap, 'Nama Mata Kuliah'));
    const tanggalRaw = rowValue(row, headerMap, 'Tanggal');
    const tanggal = formatDate(tanggalRaw);
    const jamMulai = formatTime(rowValue(row, headerMap, 'Jam Mulai'));
    const jamSelesai = formatTime(rowValue(row, headerMap, 'Jam Selesai'));
    const shiftRaw = rowValue(row, headerMap, 'shift');
    const shift = asInt(shiftRaw) ?? 1;

    if (isTemplateHintRow([kodeMatkul, namaMatkul, tanggal, jamMulai, jamSelesai])) {
      return;
    }

    const missingFields = [];
    if (kodeMatkul == null) missingFields.push('kodeMatkul');
    if (namaMatkul == null) missingFields.push('namaMatkul');
    if (tanggal == null) {
      missingFields.push(
        tanggalRaw instanceof Date ? 'tanggal' : 'tanggal (cell harus bertipe Date)',
      );
    }
    if (jamMulai == null) missingFields.push('jamMulai');
    if (jamSelesai == null) missingFields.push('jamSelesai');

    if (missingFields.length > 0) {
      warnings.push({
        sheet: worksheet.name,
        row: rowNumber,
        type: 'skipped_row',
        message: `Baris dilewati karena field wajib kosong/tidak valid: ${missingFields.join(', ')}`,
      });
      return;
    }

    if (!knownKodeMatkul.has(kodeMatkul)) {
      warnings.push({
        sheet: worksheet.name,
        row: rowNumber,
        type: 'missing_jadwal_kelas',
        kode_matkul: kodeMatkul,
        message: `kode_matkul "${kodeMatkul}" tidak ada di sheet "${SHEET_KELAS}", baris ujian dilewati.`,
      });
      return;
    }

    const dedupeKey = `${kodeMatkul}|${shift}`;
    if (seen.has(dedupeKey)) {
      warnings.push({
        sheet: worksheet.name,
        row: rowNumber,
        type: 'duplicate_ujian',
        kode_matkul: kodeMatkul,
        message: `Baris duplikat untuk kode_matkul "${kodeMatkul}" shift ${shift} (sudah ada di baris ${seen.get(dedupeKey)}), dilewati.`,
      });
      return;
    }
    seen.set(dedupeKey, rowNumber);

    rows.push({
      kode_matkul: kodeMatkul,
      jenis,
      shift,
      tanggal,
      jam_mulai: jamMulai,
      jam_selesai: jamSelesai,
    });
  });

  return rows;
}

/**
 * Parse Excel jadwal kelas + ujian.
 *
 * @param {object} opts
 * @param {string} [opts.input]      Path file Excel (kalau parse dari disk)
 * @param {Buffer} [opts.buffer]     Buffer Excel (kalau parse langsung dari upload)
 * @param {number} [opts.periodeId]  ID periode target
 * @param {string} [opts.output]     Path output JSON. Kalau null/undefined → tidak nulis file.
 * @returns {Promise<{metadata, kelas, ujian, warnings}>}
 */
async function parseJadwal({ input, buffer, periodeId = null, output = null } = {}) {
  if (!input && !buffer) {
    throw new Error('Argumen `input` (path) atau `buffer` wajib diisi.');
  }
  if (periodeId != null && (!Number.isInteger(periodeId) || periodeId <= 0)) {
    throw new Error('Argumen periodeId harus berupa angka positif.');
  }

  const workbook = new ExcelJS.Workbook();
  if (buffer) {
    await workbook.xlsx.load(buffer);
  } else {
    await workbook.xlsx.readFile(input);
  }

  const sheetKelas = workbook.getWorksheet(SHEET_KELAS);
  if (!sheetKelas) {
    throw new Error(`Sheet "${SHEET_KELAS}" tidak ditemukan.`);
  }

  const warnings = [];
  const { kelas, parsedRows, ignoredRows, skippedRows } = parseKelasSheet(
    sheetKelas,
    periodeId,
    warnings,
  );

  const knownKodeMatkul = new Set(kelas.map((k) => k.kode_matkul));

  const ujian = [];
  const sheetUts = workbook.getWorksheet(SHEET_UTS);
  if (sheetUts) {
    ujian.push(...parseUjianSheet(sheetUts, 'UTS', knownKodeMatkul, warnings));
  } else {
    warnings.push({
      sheet: SHEET_UTS,
      type: 'sheet_missing',
      message: `Sheet "${SHEET_UTS}" tidak ditemukan — jadwal UTS dilewati.`,
    });
  }

  const sheetUas = workbook.getWorksheet(SHEET_UAS);
  if (sheetUas) {
    ujian.push(...parseUjianSheet(sheetUas, 'UAS', knownKodeMatkul, warnings));
  } else {
    warnings.push({
      sheet: SHEET_UAS,
      type: 'sheet_missing',
      message: `Sheet "${SHEET_UAS}" tidak ditemukan — jadwal UAS dilewati.`,
    });
  }

  ujian.sort(compareUjian);

  const result = {
    metadata: {
      source_file: input ? input.split(/[\\/]/).pop() : 'upload-buffer',
      periode_id: periodeId,
      parsed_rows: parsedRows,
      ignored_rows: ignoredRows,
      skipped_rows: skippedRows,
      total_kelas: kelas.length,
      total_sesi: kelas.reduce((total, item) => total + item.sesi.length, 0),
      total_ujian: ujian.length,
    },
    kelas,
    ujian,
    warnings,
  };

  if (output) {
    await fs.writeFile(output, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  }

  return result;
}

module.exports = { parseJadwal };
