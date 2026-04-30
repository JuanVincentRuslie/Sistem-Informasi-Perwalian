const { Router } = require('express');
const { authenticate } = require('../../middleware/authenticate');
const { authorize } = require('../../middleware/authorize');
const ctrl = require('./periode.controller');

const router = Router();

// /aktif harus di atas /:id supaya tidak tertangkap sebagai param
router.get('/aktif', authenticate, ctrl.getAktif);

router.get('/', authenticate, ctrl.list);
router.post('/', authenticate, authorize('kaprodi'), ctrl.create);

router.put('/:id', authenticate, authorize('kaprodi'), ctrl.update);
router.patch('/:id/aktivasi', authenticate, authorize('kaprodi'), ctrl.aktivasi);
router.delete('/:id', authenticate, authorize('kaprodi'), ctrl.remove);

module.exports = router;
