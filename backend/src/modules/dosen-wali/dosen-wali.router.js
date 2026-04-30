const { Router } = require('express');
const { authenticate } = require('../../middleware/authenticate');
const { authorize } = require('../../middleware/authorize');
const ctrl = require('./dosen-wali.controller');

const router = Router();

// PENTING: /me harus di atas /:id agar Express tidak salah tangkap
router.patch('/me', authenticate, authorize('dosen_wali'), ctrl.updateMe);

router.get('/', authenticate, authorize('kaprodi'), ctrl.list);
router.post('/', authenticate, authorize('kaprodi'), ctrl.create);
router.get('/:id', authenticate, authorize('kaprodi'), ctrl.detail);
router.put('/:id', authenticate, authorize('kaprodi'), ctrl.update);
router.delete('/:id', authenticate, authorize('kaprodi'), ctrl.remove);

module.exports = router;
