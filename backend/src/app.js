const express = require('express');
const authRouter = require('./modules/auth/auth.router');

const app = express();

app.use(express.json());

app.get('/api/v1/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok' }, message: 'Server sehat' });
});

app.use('/api/v1/auth', authRouter);

// 404 fallback
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan' });
});

module.exports = { app };
