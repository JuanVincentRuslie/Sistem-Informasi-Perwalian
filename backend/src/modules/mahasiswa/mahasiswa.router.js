const { Router } = require('express');
const { authenticate } = require('../../middleware/authenticate');
const { authorize } = require('../../middleware/authorize');
const ctrl = require('./mahasiswa.controller');

const router = Router();

router.get('/', authenticate, authorize('kaprodi', 'dosen_wali'), ctrl.list);
router.post('/', authenticate, authorize('kaprodi'), ctrl.create);

router.get('/:id', authenticate, authorize('kaprodi', 'dosen_wali', 'mahasiswa'), ctrl.detail);
router.put('/:id', authenticate, authorize('kaprodi'), ctrl.update);
router.patch('/:id/dosen-wali', authenticate, authorize('kaprodi'), ctrl.assignDosenWali);
router.delete('/:id', authenticate, authorize('kaprodi'), ctrl.remove);

module.exports = router;
