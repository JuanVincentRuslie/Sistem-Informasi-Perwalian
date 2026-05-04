const express = require('express');
const authRouter = require('./modules/auth/auth.router');
const dosenWaliRouter = require('./modules/dosen-wali/dosen-wali.router');
const mahasiswaRouter = require('./modules/mahasiswa/mahasiswa.router');
const periodeRouter = require('./modules/periode/periode.router');
const kelasRouter = require('./modules/kelas/kelas.router');
const rencanaStudiRouter = require('./modules/rencana-studi/rencana-studi.router');
const masterMatkulRouter = require('./modules/master-matkul/master-matkul.router');
const akademikRouter = require('./modules/akademik/akademik.router');
const riwayatNilaiRouter = require('./modules/riwayat-nilai/riwayat-nilai.router');

const app = express();

app.use(express.json());

app.get('/api/v1/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok' }, message: 'Server sehat' });
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/dosen-wali', dosenWaliRouter);
app.use('/api/v1/mahasiswa', mahasiswaRouter);
app.use('/api/v1/periode', periodeRouter);
app.use('/api/v1/kelas', kelasRouter);
app.use('/api/v1/rencana-studi', rencanaStudiRouter);
app.use('/api/v1/master-matkul', masterMatkulRouter);
app.use('/api/v1/akademik', akademikRouter);
app.use('/api/v1/riwayat-nilai', riwayatNilaiRouter);

// 404 fallback
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan' });
});

module.exports = { app };
