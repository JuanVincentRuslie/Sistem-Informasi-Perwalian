import { useEffect, useRef, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import * as authApi from '../../api/auth.js';

function AuthCallbackPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // useRef: cegah exchange code terkirim dua kali saat React Strict Mode menjalankan effect ulang.
  const hasExchangedCode = useRef(false);

  // useState: simpan error callback supaya user dapat feedback tanpa alert() browser.
  const [error, setError] = useState(null);

  // useEffect: callback OAuth hanya berjalan saat halaman ini dibuka oleh redirect Google.
  // Setelah token tersimpan di AuthContext, router index akan mengarahkan sesuai role user.
  useEffect(() => {
    if (hasExchangedCode.current) return;
    hasExchangedCode.current = true;

    const googleError = searchParams.get('error');
    const code = searchParams.get('code');
    const returnedState = searchParams.get('state');
    const expectedState = authApi.consumeGoogleOAuthState();
    const showError = (message) => {
      Promise.resolve().then(() => setError(message));
    };

    if (googleError) {
      showError('Login Google dibatalkan atau ditolak.');
      return;
    }

    if (!code) {
      showError('Kode login Google tidak ditemukan.');
      return;
    }

    if (expectedState && returnedState !== expectedState) {
      showError('Sesi login Google tidak valid. Silakan coba lagi.');
      return;
    }

    authApi.exchangeGoogleCode(code)
      .then((res) => {
        login(res.data);
        navigate('/dashboard', { replace: true });
      })
      .catch((err) => {
        setError(err.message ?? 'Login Google gagal.');
      });
  }, [login, navigate, searchParams]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      <Stack spacing={2.5} alignItems="center" sx={{ width: '100%', maxWidth: 360 }}>
        {error ? (
          <>
            <Alert severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
            <Button variant="contained" onClick={() => navigate('/login', { replace: true })}>
              Kembali ke Login
            </Button>
          </>
        ) : (
          <>
            <CircularProgress />
            <Typography variant="body1" color="text.secondary" textAlign="center">
              Menyelesaikan login Google...
            </Typography>
          </>
        )}
      </Stack>
    </Box>
  );
}

export default AuthCallbackPage;
