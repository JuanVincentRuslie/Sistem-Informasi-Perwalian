const multer = require('multer');

// Memory storage: file masuk ke req.file.buffer, tidak menulis ke disk.
// Cocok untuk parse Excel langsung lalu dibuang.
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

const ALLOWED_MIME = new Set([
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // .xls (kadang dipakai meski parser khusus xlsx)
  'application/octet-stream', // beberapa browser kirim ini
]);

const uploadExcel = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    const okMime = ALLOWED_MIME.has(file.mimetype);
    const okExt = /\.xlsx?$/i.test(file.originalname);
    if (!okMime && !okExt) {
      return cb(new Error('File harus berformat Excel (.xlsx)'));
    }
    cb(null, true);
  },
}).single('file');

module.exports = { uploadExcel };
