import { useState } from 'react';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import * as authApi from '../../../api/auth.js';

const DEV_LOGIN_OPTIONS = [
  { role: 'mahasiswa', label: 'Login sebagai Mahasiswa' },
  { role: 'dosen_wali', label: 'Login sebagai Dosen Wali' },
  { role: 'kaprodi', label: 'Login sebagai Kaprodi' },
];

// Email seed yang match dengan backend/src/seeds/seed-*.js.
// Kalau seed berubah, update mapping ini.
const DEV_EMAILS = {
  mahasiswa: '6180000001@student.unpar.ac.id',
  dosen_wali: 'husnul.hakim@unpar.ac.id',
  kaprodi: 'kaprodi@unpar.ac.id',
};

function DevLoginFallback({ disabled, onError, onSuccess }) {
  // useState: track role yang sedang login. Disable semua tombol selama 1 login aktif.
  const [loadingRole, setLoadingRole] = useState(null);

  const handleLogin = async (role) => {
    onError(null);
    setLoadingRole(role);
    try {
      const res = await authApi.login(DEV_EMAILS[role]);
      // res.data = { token, user } - pass langsung ke AuthContext.login.
      onSuccess(res.data);
    } catch (err) {
      onError(err.message ?? 'Login gagal');
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <Stack spacing={1.5}>
      {DEV_LOGIN_OPTIONS.map((option) => (
        <Button
          key={option.role}
          variant="outlined"
          disabled={disabled || loadingRole !== null}
          onClick={() => handleLogin(option.role)}
          startIcon={loadingRole === option.role ? <CircularProgress size={16} /> : null}
        >
          {option.label}
        </Button>
      ))}
    </Stack>
  );
}

export default DevLoginFallback;
