import Box from '@mui/material/Box';

/**
 * Wrapper standar untuk semua halaman dashboard.
 * Memberikan padding yang konsisten agar konten tidak nempel ke tepi.
 *
 * @param {{ children: React.ReactNode }} props
 */
function PageContainer({ children }) {
  return <Box sx={{ p: 3 }}>{children}</Box>;
}

export default PageContainer;
