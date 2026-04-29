import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import EmptyRencanaStudi from './EmptyRencanaStudi.jsx';
import KelasPicker from './KelasPicker.jsx';
import PeriodSelector from './PeriodSelector.jsx';
import RencanaStudiDetail from './RencanaStudiDetail.jsx';

function PerwalianWorkspace({
  riwayat,
  selectedPeriodeId,
  rencanaStudi,
  emptyActivePeriod,
  kelas,
  kelasLoading,
  kelasError,
  editable,
  mutation,
  notice,
  onSelectPeriode,
  onSelectPeriodeAktif,
  onCreateRencanaStudi,
  onAddKelas,
  onRemoveItem,
  onSubmit,
}) {
  const selectedKelasIds = rencanaStudi?.items.map((item) => item.kelas.id) ?? [];

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 4 }}>
        <PeriodSelector
          riwayat={riwayat}
          selectedPeriodeId={selectedPeriodeId}
          emptyActivePeriod={emptyActivePeriod}
          onSelectPeriode={onSelectPeriode}
          onSelectPeriodeAktif={onSelectPeriodeAktif}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 8 }}>
        <Stack spacing={2}>
          {notice && (
            <Alert severity={notice.severity}>
              {notice.message}
            </Alert>
          )}

          {rencanaStudi ? (
            <>
              <RencanaStudiDetail
                rencanaStudi={rencanaStudi}
                editable={editable}
                mutation={mutation}
                onRemoveItem={onRemoveItem}
                onSubmit={onSubmit}
              />

              {editable && (
                <KelasPicker
                  kelas={kelas}
                  selectedKelasIds={selectedKelasIds}
                  loading={kelasLoading}
                  error={kelasError}
                  addingKelasId={mutation.type === 'add' ? mutation.targetId : null}
                  onAddKelas={onAddKelas}
                />
              )}
            </>
          ) : (
            <EmptyRencanaStudi
              periode={emptyActivePeriod}
              creating={mutation.type === 'create'}
              onCreate={onCreateRencanaStudi}
            />
          )}
        </Stack>
      </Grid>
    </Grid>
  );
}

export default PerwalianWorkspace;
