const service = require('./rencana-studi.service');
const { ok, created, fail } = require('../../utils/respond');

/* ---------- mahasiswa ---------- */

async function getSaya(req, res) {
  let periodeId = null;
  if (req.query.periode_id !== undefined) {
    periodeId = Number(req.query.periode_id);
    if (!Number.isInteger(periodeId) || periodeId <= 0) {
      return fail(res, 'periode_id harus berupa angka positif');
    }
  }
  try {
    const data = await service.getRencanaStudiSaya({ mahasiswaId: req.user.id, periodeId });
    return ok(res, data);
  } catch (err) {
    return fail(res, err.message, err.statusCode ?? 500);
  }
}

async function getRiwayatSaya(req, res) {
  try {
    const data = await service.listRiwayatSaya(req.user.id);
    return ok(res, data);
  } catch (err) {
    return fail(res, 'Gagal mengambil riwayat FRS', 500, { detail: err.message });
  }
}

async function create(req, res) {
  const periodeId = Number(req.body?.periode_id);
  if (!Number.isInteger(periodeId) || periodeId <= 0) {
    return fail(res, 'Field periode_id wajib diisi dan berupa angka positif');
  }
  try {
    const data = await service.createRencanaStudi({ mahasiswaId: req.user.id, periodeId });
    return created(res, data, 'FRS berhasil dibuat');
  } catch (err) {
    return fail(res, err.message, err.statusCode ?? 500);
  }
}

async function addItem(req, res) {
  const kelasId = Number(req.body?.kelas_id);
  if (!Number.isInteger(kelasId) || kelasId <= 0) {
    return fail(res, 'Field kelas_id wajib diisi dan berupa angka positif');
  }
  try {
    const data = await service.addItem({
      rsId: Number(req.params.id),
      kelasId,
      mahasiswaId: req.user.id,
    });
    return created(res, data, 'Kelas berhasil ditambahkan ke FRS');
  } catch (err) {
    return fail(res, err.message, err.statusCode ?? 500);
  }
}

async function removeItem(req, res) {
  try {
    const data = await service.removeItem({
      rsId: Number(req.params.id),
      itemId: Number(req.params.item_id),
      mahasiswaId: req.user.id,
    });
    return ok(res, data, 'Kelas berhasil dihapus dari FRS');
  } catch (err) {
    return fail(res, err.message, err.statusCode ?? 500);
  }
}

async function submit(req, res) {
  try {
    const data = await service.submitRencanaStudi({
      rsId: Number(req.params.id),
      mahasiswaId: req.user.id,
    });
    return ok(res, data, 'FRS berhasil disubmit untuk review');
  } catch (err) {
    return fail(res, err.message, err.statusCode ?? 500);
  }
}

/* ---------- dosen wali ---------- */

async function listBimbingan(req, res) {
  let periodeId = null;
  if (req.query.periode_id !== undefined) {
    periodeId = Number(req.query.periode_id);
    if (!Number.isInteger(periodeId) || periodeId <= 0) {
      return fail(res, 'periode_id harus berupa angka positif');
    }
  }
  const status = req.query.status ?? null;
  if (status && !['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'].includes(status)) {
    return fail(res, 'status harus salah satu dari DRAFT/SUBMITTED/APPROVED/REJECTED');
  }
  try {
    const result = await service.listBimbinganFrs({ dosenId: req.user.id, periodeId, status });
    return res.json({ success: true, data: result.data, summary: result.summary, message: 'OK' });
  } catch (err) {
    return fail(res, err.message, err.statusCode ?? 500);
  }
}

async function getProfilBimbingan(req, res) {
  try {
    const data = await service.getProfilMahasiswaBimbingan({
      dosenId: req.user.id,
      mahasiswaId: Number(req.params.mahasiswa_id),
    });
    return ok(res, data);
  } catch (err) {
    return fail(res, err.message, err.statusCode ?? 500);
  }
}

async function getRiwayatBimbingan(req, res) {
  try {
    const data = await service.listRiwayatMahasiswaBimbingan({
      dosenId: req.user.id,
      mahasiswaId: Number(req.params.mahasiswa_id),
    });
    return ok(res, data);
  } catch (err) {
    return fail(res, err.message, err.statusCode ?? 500);
  }
}

async function setujui(req, res) {
  try {
    const data = await service.setujuiRencanaStudi({
      rsId: Number(req.params.id),
      dosenId: req.user.id,
      catatan: req.body?.catatan,
    });
    return ok(res, data, 'FRS berhasil disetujui');
  } catch (err) {
    return fail(res, err.message, err.statusCode ?? 500);
  }
}

async function revisi(req, res) {
  try {
    const data = await service.revisiRencanaStudi({
      rsId: Number(req.params.id),
      dosenId: req.user.id,
      catatan: req.body?.catatan,
    });
    return ok(res, data, 'FRS dikembalikan untuk revisi');
  } catch (err) {
    return fail(res, err.message, err.statusCode ?? 500);
  }
}

/* ---------- multi-role ---------- */

async function detail(req, res) {
  try {
    const data = await service.getRencanaStudiByIdForCaller(Number(req.params.id), {
      callerRole: req.user.role,
      callerId: req.user.id,
    });
    return ok(res, data);
  } catch (err) {
    return fail(res, err.message, err.statusCode ?? 500);
  }
}

module.exports = {
  getSaya, getRiwayatSaya, create, addItem, removeItem, submit,
  listBimbingan, getProfilBimbingan, getRiwayatBimbingan, setujui, revisi,
  detail,
};
