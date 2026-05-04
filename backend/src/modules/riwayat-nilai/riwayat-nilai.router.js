const { Router } = require('express');
const { authenticate } = require('../../middleware/authenticate');
const { authorize } = require('../../middleware/authorize');
const { uploadPdf } = require('../../middleware/upload');
const ctrl = require('./riwayat-nilai.controller');

const router = Router();

// Wrap multer untuk format error sesuai response API
function handleUpload(req, res, next) {
  uploadPdf(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
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
