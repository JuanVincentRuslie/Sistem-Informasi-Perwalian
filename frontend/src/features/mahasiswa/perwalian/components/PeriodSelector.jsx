import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import StatusChip from './StatusChip.jsx';

function PeriodRow({
  item,
  selected,
  onClick,
}) {
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        width: '100%',
        textAlign: 'left',
        borderRadius: 1,
        border: '1px solid',
        borderColor: selected ? 'primary.main' : 'divider',
        bgcolor: selected ? 'action.selected' : 'background.paper',
        p: 1.5,
        justifyContent: 'flex-start',
      }}
    >
      <Stack spacing={1} sx={{ width: '100%' }}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Typography variant="subtitle2" component="p" fontWeight={700}>
            {item.periode.nama}
          </Typography>
          {item.periode.is_active && <Chip label="Aktif" size="small" color="primary" />}
        </Stack>
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'center', justifyContent: 'space-between' }}
        >
          <StatusChip status={item.status} size="small" />
          <Typography variant="body2" color="text.secondary">
            {item.total_sks} SKS
          </Typography>
        </Stack>
      </Stack>
    </ButtonBase>
  );
}

function PeriodSelector({
  riwayat,
  selectedPeriodeId,
  emptyActivePeriod,
  onSelectPeriode,
  onSelectPeriodeAktif,
}) {
  const hasActiveFrs = riwayat.some((item) => item.periode.is_active);
  const showEmptyActive = emptyActivePeriod && !hasActiveFrs;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
      }}
    >
      <Typography variant="h6" component="h2" gutterBottom>
        Riwayat FRS
      </Typography>
      <Stack spacing={1.25}>
        {showEmptyActive && (
          <ButtonBase
            onClick={onSelectPeriodeAktif}
            sx={{
              width: '100%',
              textAlign: 'left',
              borderRadius: 1,
              border: '1px dashed',
              borderColor: selectedPeriodeId === null ? 'primary.main' : 'divider',
              p: 1.5,
              justifyContent: 'flex-start',
            }}
          >
            <Box sx={{ width: '100%' }}>
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Typography variant="subtitle2" component="p" fontWeight={700}>
                  {emptyActivePeriod.nama}
                </Typography>
                <Chip label="Aktif" size="small" color="primary" />
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                Belum ada FRS
              </Typography>
            </Box>
          </ButtonBase>
        )}

        {riwayat.map((item) => {
          const selected = selectedPeriodeId === item.periode.id
            || (selectedPeriodeId === null && item.periode.is_active);

          return (
            <PeriodRow
              key={item.id}
              item={item}
              selected={selected}
              onClick={() => onSelectPeriode(item.periode.id)}
            />
          );
        })}

        {riwayat.length === 0 && !showEmptyActive && (
          <Typography variant="body2" color="text.secondary">
            Riwayat FRS belum tersedia.
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}

export default PeriodSelector;
