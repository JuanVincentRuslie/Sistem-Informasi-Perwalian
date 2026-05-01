const { Router } = require('express');
const { authenticate } = require('../../middleware/authenticate');
const ctrl = require('./master-matkul.controller');

const router = Router();

// /edges harus di atas /:id supaya tidak tertangkap sebagai param
router.get('/edges', authenticate, ctrl.listEdges);

router.get('/', authenticate, ctrl.list);
router.get('/:id', authenticate, ctrl.detail);

module.exports = router;
