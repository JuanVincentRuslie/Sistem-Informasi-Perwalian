import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

/**
 * Card ringkas untuk menampilkan satu angka akademik penting.
 * @param {{ label: string, value: string|number, color?: string }} props
 */
function MetricCard({ label, value, color = 'primary' }) {
  return (
    <Paper
      elevation={0}
      sx={(theme) => {
        const accentColor = theme.palette[color]?.main ?? theme.palette.primary.main;

        return {
          p: 2.5,
          height: '100%',
          border: '1px solid',
          borderColor: 'divider',
          borderLeft: `4px solid ${accentColor}`,
          borderRadius: 1,
        };
      }}
    >
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {label}
      </Typography>
      <Typography variant="h4" component="p" fontWeight={700}>
        {value}
      </Typography>
    </Paper>
  );
}

export default MetricCard;
