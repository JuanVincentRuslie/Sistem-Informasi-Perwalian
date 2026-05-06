import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import GoogleIcon from '@mui/icons-material/Google';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import * as authApi from '../../api/auth.js';
import DevLoginFallback from './components/DevLoginFallback.jsx';

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  // useState: tandai saat user sudah klik Google supaya tombol tidak bisa diklik berkali-kali
  // sebelum browser pindah ke halaman OAuth Google.
  const [googleLoading, setGoogleLoading] = useState(false);

  // useState: error message dari backend kalau login gagal.
  const [error, setError] = useState(null);

  // useState: dev-login disimpan sebagai fallback lokal, bukan jalur utama user demo.
  const [showDevLogin, setShowDevLogin] = useState(false);

  const handleGoogleLogin = () => {
    setError(null);
    setGoogleLoading(true);
    try {
      window.location.assign(authApi.createGoogleAuthUrl());
    } catch (err) {
      setError(err.message ?? 'Login Google gagal dimulai');
      setGoogleLoading(false);
    }
  };

  const handleLoginSuccess = (loginData) => {
    login(loginData);
    navigate('/dashboard');
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
        Sistem Informasi Perwalian
      </Typography>

      {error && (
        <Alert severity="error" sx={{ width: 320 }}>
          {error}
        </Alert>
      )}

      <Stack spacing={2} sx={{ width: 320 }}>
        <Button
          variant="contained"
          size="large"
          disabled={googleLoading}
          onClick={handleGoogleLogin}
          startIcon={googleLoading ? <CircularProgress size={16} color="inherit" /> : <GoogleIcon />}
        >
          Login dengan Google
        </Button>
        <Button
          variant="text"
          size="small"
          disabled={googleLoading}
          onClick={() => setShowDevLogin((value) => !value)}
        >
          {showDevLogin ? 'Sembunyikan dev-login' : 'Gunakan dev-login'}
        </Button>

        <Collapse in={showDevLogin}>
          <DevLoginFallback
            disabled={googleLoading}
            onError={setError}
            onSuccess={handleLoginSuccess}
          />
        </Collapse>
      </Stack>
    </Box>
  );
}

export default LoginPage;
