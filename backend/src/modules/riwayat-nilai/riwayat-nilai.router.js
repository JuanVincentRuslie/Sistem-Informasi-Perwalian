const { Router } = require('express');
const { authenticate } = require('../../middleware/authenticate');
const { authorize } = require('../../middleware/authorize');
const { uploadPdf } = require('../../middleware/upload');
const { fail } = require('../../utils/respond');
const ctrl = require('./riwayat-nilai.controller');

const router = Router();

// Wrap multer untuk format error sesuai response API
function handleUpload(req, res, next) {
  uploadPdf(req, res, (err) => {
    if (err) {
      const message = err.code === 'LIMIT_FILE_SIZE'
        ? 'File PDF terlalu besar. Maksimal 10 MB.'
        : err.message;
      return fail(res, message);
    }
    next();
  });
}

// Mahasiswa
router.get('/saya', authenticate, authorize('mahasiswa'), ctrl.getSaya);
router.post('/upload-dps', authenticate, authorize('mahasiswa'), handleUpload, ctrl.uploadDps);
router.post('/upload-dps/confirm', authenticate, authorize('mahasiswa'), ctrl.uploadDpsConfirm);
router.post('/manual', authenticate, authorize('mahasiswa'), ctrl.manualEntry);

// Dosen wali / kaprodi
router.get('/mahasiswa/:id', authenticate, authorize('dosen_wali', 'kaprodi'), ctrl.getMahasiswa);

module.exports = router;
