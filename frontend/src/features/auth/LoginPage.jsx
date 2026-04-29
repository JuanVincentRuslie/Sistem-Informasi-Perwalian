import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import GoogleIcon from '@mui/icons-material/Google';

function LoginPage() {
  const handleLogin = () => {
    console.log('Login dengan Google clicked');
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
      <Button
        variant="contained"
        size="large"
        startIcon={<GoogleIcon />}
        onClick={handleLogin}
      >
        Login dengan Google
      </Button>
    </Box>
  );
}

export default LoginPage;
