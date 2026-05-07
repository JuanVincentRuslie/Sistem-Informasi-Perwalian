const { Router } = require('express');
const { authenticate } = require('../../middleware/authenticate');
const { authorize } = require('../../middleware/authorize');
const { uploadExcel } = require('../../middleware/upload');
const { fail } = require('../../utils/respond');
const ctrl = require('./kelas.controller');

const router = Router();

// Bungkus middleware multer agar error multer (file size, mime, dll) jadi response API
function handleUpload(req, res, next) {
  uploadExcel(req, res, (err) => {
    if (err) {
      const message = err.code === 'LIMIT_FILE_SIZE'
        ? 'File Excel terlalu besar. Maksimal 5 MB.'
        : err.message;
      return fail(res, message);
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
