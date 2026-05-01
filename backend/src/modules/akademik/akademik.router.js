const { Router } = require('express');
const { authenticate } = require('../../middleware/authenticate');
const { authorize } = require('../../middleware/authorize');
const ctrl = require('./akademik.controller');

const router = Router();

// Mahasiswa - data sendiri
router.get('/saya/ringkasan', authenticate, authorize('mahasiswa'), ctrl.getRingkasanSaya);
router.get('/saya/pohon-kurikulum', authenticate, authorize('mahasiswa'), ctrl.getPohonSaya);

// Dosen wali / kaprodi - data mahasiswa lain
router.get('/mahasiswa/:id/ringkasan', authenticate, authorize('dosen_wali', 'kaprodi'), ctrl.getRingkasanMahasiswa);
router.get('/mahasiswa/:id/pohon-kurikulum', authenticate, authorize('dosen_wali', 'kaprodi'), ctrl.getPohonMahasiswa);

module.exports = router;
