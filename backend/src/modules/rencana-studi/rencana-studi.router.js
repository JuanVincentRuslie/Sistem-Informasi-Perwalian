const { Router } = require('express');
const { authenticate } = require('../../middleware/authenticate');
const { authorize } = require('../../middleware/authorize');
const ctrl = require('./rencana-studi.controller');

const router = Router();

/* ---------- Static / specific routes harus DI ATAS /:id ---------- */

// Mahasiswa-side
router.get('/saya', authenticate, authorize('mahasiswa'), ctrl.getSaya);
router.get('/saya/riwayat', authenticate, authorize('mahasiswa'), ctrl.getRiwayatSaya);

// Dosen-side
router.get('/dosen/bimbingan', authenticate, authorize('dosen_wali'), ctrl.listBimbingan);
// Profil + riwayat juga boleh diakses kaprodi (read-only) untuk halaman detail mahasiswa kaprodi.
router.get('/dosen/mahasiswa/:mahasiswa_id/profil', authenticate, authorize('dosen_wali', 'kaprodi'), ctrl.getProfilBimbingan);
router.get('/dosen/mahasiswa/:mahasiswa_id/riwayat', authenticate, authorize('dosen_wali', 'kaprodi'), ctrl.getRiwayatBimbingan);

/* ---------- Mutation endpoints ---------- */

router.post('/', authenticate, authorize('mahasiswa'), ctrl.create);
router.post('/:id/items', authenticate, authorize('mahasiswa'), ctrl.addItem);
router.delete('/:id/items/:item_id', authenticate, authorize('mahasiswa'), ctrl.removeItem);
router.post('/:id/submit', authenticate, authorize('mahasiswa'), ctrl.submit);
router.post('/:id/setujui', authenticate, authorize('dosen_wali'), ctrl.setujui);
router.post('/:id/revisi', authenticate, authorize('dosen_wali'), ctrl.revisi);

/* ---------- Generic detail (multi-role) ---------- */
router.get('/:id', authenticate, ctrl.detail);

module.exports = router;
