const { Router } = require('express');
const { authenticate } = require('../../middleware/authenticate');
const { authorize } = require('../../middleware/authorize');
const { uploadExcel } = require('../../middleware/upload');
const ctrl = require('./kelas.controller');

const router = Router();

// Bungkus middleware multer agar error multer (file size, mime, dll) jadi response API
function handleUpload(req, res, next) {
  uploadExcel(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}

router.get('/', authenticate, ctrl.list);

// Upload routes harus di atas /:id supaya tidak dianggap param
router.post('/upload', authenticate, authorize('kaprodi'), handleUpload, ctrl.uploadPreview);
router.post('/upload/confirm', authenticate, authorize('kaprodi'), ctrl.uploadConfirm);

router.get('/:id', authenticate, ctrl.detail);

module.exports = router;
