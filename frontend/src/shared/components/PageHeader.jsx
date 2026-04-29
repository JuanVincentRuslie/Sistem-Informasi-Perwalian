import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

/**
 * Header standar untuk tiap halaman.
 * Title di kiri, optional actions (misal: tombol) di kanan.
 *
 * @param {{ title: string, subtitle?: string, actions?: React.ReactNode }} props
 */
function PageHeader({ title, subtitle, actions }) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        mb: 3,
      }}
    >
      <Box>
        <Typography variant="h4" component="h1" gutterBottom={Boolean(subtitle)}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
      {actions && <Box>{actions}</Box>}
    </Box>
  );
}

export default PageHeader;
