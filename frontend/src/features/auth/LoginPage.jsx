import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';

const DUMMY_USERS = {
  mahasiswa: {
    id: 1,
    nama: 'Budi Santoso',
    email: 'budi@student.kampus.ac.id',
    role: 'mahasiswa',
    avatar_url: null,
  },
  dosen_wali: {
    id: 5,
    nama: 'Dr. Sari Wijaya',
    email: 'sari@kampus.ac.id',
    role: 'dosen_wali',
    avatar_url: null,
  },
  kaprodi: {
    id: 99,
    nama: 'Prof. Ahmad',
    email: 'ahmad@kampus.ac.id',
    role: 'kaprodi',
    avatar_url: null,
  },
};

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (role) => {
    const userData = DUMMY_USERS[role];
    login(userData);
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
      <Stack spacing={2} sx={{ width: 280 }}>
        <Button
          variant="contained"
          size="large"
          onClick={() => handleLogin('mahasiswa')}
        >
          Login sebagai Mahasiswa
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={() => handleLogin('dosen_wali')}
        >
          Login sebagai Dosen Wali
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={() => handleLogin('kaprodi')}
        >
          Login sebagai Kaprodi
        </Button>
      </Stack>
    </Box>
  );
}

export default LoginPage;
