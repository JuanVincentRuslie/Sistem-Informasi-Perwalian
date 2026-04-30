import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import PersonRemoveAlt1Icon from '@mui/icons-material/PersonRemoveAlt1';
import SearchIcon from '@mui/icons-material/Search';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

function MahasiswaTransferList({ title, subtitle, items, emptyText, onSelect, mode, framed = true }) {
  return (
    <Box
      sx={{
        border: framed ? '1px solid' : 'none',
        borderColor: 'divider',
        borderRadius: framed ? 2 : 0,
        p: framed ? 2 : 0,
        minHeight: framed ? 420 : 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Box>
        <Typography variant="h6" component="h2">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      </Box>

      <Stack spacing={1.5}>
        {items.map((item) => (
          <ButtonBase
            key={item.id}
            onClick={() => onSelect(item)}
            sx={{
              width: '100%',
              textAlign: 'left',
              borderRadius: 1.5,
            }}
          >
            <Box
              sx={{
                width: '100%',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1.5,
                px: 2,
                py: 1.5,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 2,
                transition: 'border-color 120ms ease, background-color 120ms ease',
                '&:hover': {
                  borderColor: mode === 'assign' ? 'primary.main' : 'warning.main',
                  bgcolor: 'action.hover',
                },
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography fontWeight={600}>
                  {item.nama}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.nim}
                </Typography>
              </Box>

              {mode === 'assign' ? (
                <PersonAddAlt1Icon color="primary" />
              ) : (
                <PersonRemoveAlt1Icon color="warning" />
              )}
            </Box>
          </ButtonBase>
        ))}

        {items.length === 0 && (
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              textAlign: 'center',
              color: 'text.secondary',
              bgcolor: 'background.default',
            }}
          >
            {emptyText}
          </Paper>
        )}
      </Stack>
    </Box>
  );
}

function KaprodiAssignmentPanel({
  dosenWali,
  assignedItems,
  availableItems,
  searchQuery,
  onSearchChange,
  onAssign,
  onUnassign,
}) {
  return (
    <Stack spacing={3}>
      <Alert severity="info">
        Klik mahasiswa di kiri untuk melepas dari dosen wali ini. Klik mahasiswa di kanan untuk menambahkan ke dosen wali terpilih.
      </Alert>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
          gap: 3,
        }}
      >
        <MahasiswaTransferList
          title={`Mahasiswa ${dosenWali.nama}`}
          subtitle={`${assignedItems.length} mahasiswa saat ini berada di bawah dosen wali terpilih.`}
          items={assignedItems}
          emptyText="Belum ada mahasiswa yang terassign ke dosen wali ini."
          onSelect={onUnassign}
          mode="unassign"
        />

        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            p: 2,
            minHeight: 420,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h6" component="h2">
              Mahasiswa Belum Punya Dosen Wali
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Hanya mahasiswa yang belum terassign yang muncul di sisi ini.
            </Typography>
          </Box>

          <TextField
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            size="small"
            placeholder="Cari nama atau NIM"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <MahasiswaTransferList
            title="Daftar tersedia"
            subtitle={`${availableItems.length} mahasiswa tersedia untuk dipindahkan.`}
            items={availableItems}
            emptyText="Tidak ada mahasiswa tanpa dosen wali yang cocok dengan pencarian."
            onSelect={onAssign}
            mode="assign"
            framed={false}
          />
        </Box>
      </Box>
    </Stack>
  );
}

export default KaprodiAssignmentPanel;
