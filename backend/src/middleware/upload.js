const multer = require('multer');

// Memory storage: file masuk ke req.file.buffer, tidak menulis ke disk.
const MAX_BYTES_EXCEL = 5 * 1024 * 1024; // 5 MB
const MAX_BYTES_PDF = 10 * 1024 * 1024; // 10 MB

const ALLOWED_MIME_EXCEL = new Set([
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // .xls
  'application/octet-stream', // beberapa browser kirim ini
]);

const ALLOWED_MIME_PDF = new Set([
  'application/pdf',
  'application/octet-stream',
]);

const uploadExcel = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES_EXCEL, files: 1 },
  fileFilter: (_req, file, cb) => {
    const okMime = ALLOWED_MIME_EXCEL.has(file.mimetype);
    const okExt = /\.xlsx?$/i.test(file.originalname);
    if (!okMime && !okExt) {
      return cb(new Error('File harus berformat Excel (.xlsx)'));
    }
    cb(null, true);
  },
}).single('file');

const uploadPdf = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES_PDF, files: 1 },
  fileFilter: (_req, file, cb) => {
    const okMime = ALLOWED_MIME_PDF.has(file.mimetype);
    const okExt = /\.pdf$/i.test(file.originalname);
    if (!okMime && !okExt) {
      return cb(new Error('File harus berformat PDF'));
    }
    cb(null, true);
  },
}).single('file');

module.exports = { uploadExcel, uploadPdf };
