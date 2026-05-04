import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import * as authApi from '../../api/auth.js';

// Email seed yang match dengan backend/src/seeds/seed-*.js.
// Kalau seed berubah, update mapping ini.
const DEV_EMAILS = {
  mahasiswa: '6180000001@student.unpar.ac.id',
  dosen_wali: 'husnul.hakim@unpar.ac.id',
  kaprodi: 'kaprodi@unpar.ac.id',
};

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  // useState: track role yang sedang login. Disable semua tombol selama 1 login aktif.
  const [loadingRole, setLoadingRole] = useState(null);

  // useState: error message dari backend kalau login gagal.
  const [error, setError] = useState(null);

  const handleLogin = async (role) => {
    setError(null);
    setLoadingRole(role);
    try {
      const res = await authApi.login(DEV_EMAILS[role]);
      // res.data = { token, user } — pass langsung ke AuthContext.login
      login(res.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message ?? 'Login gagal');
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
      }}
    >
      <Typography variant="h4" component="h1" fontWeight="bold">
        Login
      </Typography>
      <Typography variant="subtitle1" color="text.secondary">
        Sistem Informasi Perwalian (Dev Mode)
      </Typography>

      {error && (
        <Alert severity="error" sx={{ width: 280 }}>
          {error}
        </Alert>
      )}

      <Stack spacing={2} sx={{ width: 280 }}>
        <Button
          variant="contained"
          size="large"
          disabled={loadingRole !== null}
          onClick={() => handleLogin('mahasiswa')}
          startIcon={loadingRole === 'mahasiswa' ? <CircularProgress size={16} /> : null}
        >
          Login sebagai Mahasiswa
        </Button>
        <Button
          variant="contained"
          size="large"
          disabled={loadingRole !== null}
          onClick={() => handleLogin('dosen_wali')}
          startIcon={loadingRole === 'dosen_wali' ? <CircularProgress size={16} /> : null}
        >
          Login sebagai Dosen Wali
        </Button>
        <Button
          variant="contained"
          size="large"
          disabled={loadingRole !== null}
          onClick={() => handleLogin('kaprodi')}
          startIcon={loadingRole === 'kaprodi' ? <CircularProgress size={16} /> : null}
        >
          Login sebagai Kaprodi
        </Button>
      </Stack>
    </Box>
  );
}

export default LoginPage;
