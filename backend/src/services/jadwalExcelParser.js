/**
 * Parser jadwal Excel untuk backend.
 * Disalin dari parser_for_backend/Jadwal_excel_parser/parse-jadwal.js
 * dengan dua perubahan:
 *  - Bisa terima `buffer` (Excel di memory) selain `input` (file path)
 *  - `output` opsional (tidak nulis ke disk kalau tidak diminta)
 */
const fs = require('node:fs/promises');
const ExcelJS = require('exceljs');

const DEFAULT_SHEET = 'Template';

const REQUIRED_HEADERS = [
  'Kode Mata Kuliah',
  'sks',
  'Nama Mata Kuliah',
  'Kelas',
  'Sesi Kelas',
  'Hari',
  'Jam Mulai',
  'Jam Selesai',
  'Bentuk Pembelajaran',
  'Nama Dosen',
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

function buildHeaderMap(worksheet) {
  const headerMap = new Map();
  const headerRow = worksheet.getRow(1);

  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    const header = asString(cellText(cell));
    if (header) headerMap.set(header, colNumber);
  });

  return headerMap;
}

function requireHeaders(headerMap) {
  const missing = REQUIRED_HEADERS.filter((header) => !headerMap.has(header));
  if (missing.length > 0) {
    throw new Error(`Header wajib tidak ditemukan: ${missing.join(', ')}`);
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

function pushUniqueDosen(session, row) {
  const nama = asString(row.namaDosen);
  if (!nama) return;

  const nik = row.nikDosen == null ? null : String(row.nikDosen);
  const jenis = asString(row.jenisDosen);
  const exists = session.dosen.some((dosen) => dosen.nama === nama && dosen.nik === nik);

  if (!exists) {
    session.dosen.push({ nik, nama, jenis });
  }
}

function chooseDosenUtama(session, coordinatorName) {
  const coordinator = asString(coordinatorName);
  if (coordinator) {
    const matched = session.dosen.find((dosen) => dosen.nama === coordinator);
    if (matched) return matched.nama;
  }

  const lecturer = session.dosen.find((dosen) => dosen.jenis?.toLowerCase() === 'dosen');
  return lecturer?.nama ?? session.dosen[0]?.nama ?? null;
}

function compareKelas(a, b) {
  return a.kode_matkul.localeCompare(b.kode_matkul) || a.nama_kelas.localeCompare(b.nama_kelas);
}

function compareSesi(a, b) {
  return a.nomor_sesi - b.nomor_sesi || a.hari.localeCompare(b.hari) || a.jam_mulai.localeCompare(b.jam_mulai);
}

/**
 * Parse Excel jadwal kelas.
 *
 * @param {object} opts
 * @param {string} [opts.input]      Path file Excel (kalau parse dari disk)
 * @param {Buffer} [opts.buffer]     Buffer Excel (kalau parse langsung dari upload)
 * @param {string} [opts.sheet]      Nama sheet, default "Template"
 * @param {number} [opts.periodeId]  ID periode target
 * @param {string} [opts.output]     Path output JSON. Kalau null/undefined → tidak nulis file.
 * @returns {Promise<{metadata, kelas, warnings}>}
 */
async function parseJadwal({ input, buffer, sheet = DEFAULT_SHEET, periodeId = null, output = null } = {}) {
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

  const worksheet = workbook.getWorksheet(sheet);
  if (!worksheet) {
    const names = workbook.worksheets.map((item) => item.name).join(', ');
    throw new Error(`Sheet "${sheet}" tidak ditemukan. Sheet tersedia: ${names}`);
  }

  const headerMap = buildHeaderMap(worksheet);
  requireHeaders(headerMap);

  const warnings = [];
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
    const namaDosen = asString(rowValue(row, headerMap, 'Nama Dosen'));
    const jenisDosen = asString(rowValue(row, headerMap, 'Jenis Dosen'));
    const nikDosen = rowValue(row, headerMap, 'NIK Dosen');
    const ruangan = asString(rowValue(row, headerMap, 'Ruangan (khusus untuk Praktikum)'));
    const dosenKoordinator = asString(rowValue(row, headerMap, 'Dosen Koordinator'));

    if (
      isTemplateHintRow([
        kodeMatkul, namaMatkul, namaKelas, nomorSesi, hari,
        jamMulai, jamSelesai, bentukPembelajaran, namaDosen,
      ])
    ) {
      ignoredRows += 1;
      return;
    }

    const requiredValues = {
      kodeMatkul, namaMatkul, sks, namaKelas, nomorSesi,
      hari, jamMulai, jamSelesai, bentukPembelajaran, namaDosen,
    };

    const missingFields = Object.entries(requiredValues)
      .filter(([, value]) => value == null)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      skippedRows += 1;
      warnings.push({
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

    let session = kelas._sessionMap.get(sessionKey);
    if (!session) {
      session = {
        nomor_sesi: nomorSesi,
        hari,
        jam_mulai: jamMulai,
        jam_selesai: jamSelesai,
        bentuk_pembelajaran: bentukPembelajaran,
        dosen_utama: null,
        ruangan,
        dosen: [],
        _dosenKoordinator: dosenKoordinator,
      };
      kelas._sessionMap.set(sessionKey, session);
      kelas.sesi.push(session);
    }

    pushUniqueDosen(session, { nikDosen, namaDosen, jenisDosen });

    if (!session._dosenKoordinator && dosenKoordinator) {
      session._dosenKoordinator = dosenKoordinator;
    }
  });

  const kelas = [...kelasMap.values()].sort(compareKelas).map((item) => {
    item.sesi = item.sesi.sort(compareSesi).map((session) => {
      session.dosen_utama = chooseDosenUtama(session, session._dosenKoordinator);

      if (session.dosen.length > 1) {
        warnings.push({
          type: 'multiple_dosen_in_session',
          kode_matkul: item.kode_matkul,
          nama_kelas: item.nama_kelas,
          nomor_sesi: session.nomor_sesi,
          hari: session.hari,
          jam_mulai: session.jam_mulai,
          message: `Sesi punya ${session.dosen.length} dosen. dosen_utama dipilih: ${session.dosen_utama}`,
        });
      }

      delete session._dosenKoordinator;
      return session;
    });

    delete item._sessionMap;
    return item;
  });

  const result = {
    metadata: {
      source_file: input ? input.split(/[\\/]/).pop() : 'upload-buffer',
      sheet,
      periode_id: periodeId,
      parsed_rows: parsedRows,
      ignored_rows: ignoredRows,
      skipped_rows: skippedRows,
      total_kelas: kelas.length,
      total_sesi: kelas.reduce((total, item) => total + item.sesi.length, 0),
    },
    kelas,
    warnings,
  };

  if (output) {
    await fs.writeFile(output, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  }

  return result;
}

module.exports = { parseJadwal };
