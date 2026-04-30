const express = require('express');
const authRouter = require('./modules/auth/auth.router');
const dosenWaliRouter = require('./modules/dosen-wali/dosen-wali.router');
const mahasiswaRouter = require('./modules/mahasiswa/mahasiswa.router');
const periodeRouter = require('./modules/periode/periode.router');

const app = express();

app.use(express.json());

app.get('/api/v1/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok' }, message: 'Server sehat' });
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/dosen-wali', dosenWaliRouter);
app.use('/api/v1/mahasiswa', mahasiswaRouter);
app.use('/api/v1/periode', periodeRouter);

// 404 fallback
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan' });
});

module.exports = { app };
