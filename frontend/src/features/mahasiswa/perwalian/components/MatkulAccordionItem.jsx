import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KelasJadwalTable from './KelasJadwalTable.jsx';

/**
 * Accordion row untuk satu matakuliah di halaman Tambah Matkul.
 * Collapsed: tampil nama matkul + status terpilih.
 * Expanded: tampil KelasJadwalTable per kelas yang tersedia.
 *
 * @param {{ kode_matkul, nama_matkul, sks, kelas_list }} matkul
 * @param {number|null} selectedKelasId - id kelas yang dipilih, null jika belum pilih
 * @param {Function} onPilih - callback(kelasId)
 */
function MatkulAccordionItem({ matkul, selectedKelasId, onPilih }) {
  const isSelected = selectedKelasId !== null;

  return (
    <Accordion
      elevation={0}
      disableGutters
      sx={{
        border: '1px solid',
        borderColor: 'grey.300',
        borderRadius: '8px !important',
        '&:before': { display: 'none' },
        overflow: 'hidden',
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              bgcolor: isSelected ? 'primary.main' : 'grey.300',
              borderRadius: 1,
              flexShrink: 0,
            }}
          />
          <Typography>{matkul.nama_matkul}</Typography>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ px: 2, pt: 1, display: 'block' }}>
          Jadwal :
        </Typography>
        {matkul.kelas_list.map((kelas) => (
          <KelasJadwalTable
            key={kelas.id}
            kelas={kelas}
            isSelected={selectedKelasId === kelas.id}
            onPilih={() => onPilih(kelas.id)}
          />
        ))}
      </AccordionDetails>
    </Accordion>
  );
}

export default MatkulAccordionItem;
