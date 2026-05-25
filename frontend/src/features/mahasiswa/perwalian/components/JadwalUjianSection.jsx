import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { formatTanggal } from '../../../../utils/formatDate.js';

const JENIS_LABEL = {
  UTS: 'Ujian Tengah Semester',
  UAS: 'Ujian Akhir Semester',
};

function groupByJenis(ujian) {
  const map = new Map();
  for (const u of ujian) {
    if (!map.has(u.jenis)) map.set(u.jenis, []);
    map.get(u.jenis).push(u);
  }
  // Urutkan tiap group by shift supaya shift 1 muncul duluan.
  for (const list of map.values()) {
    list.sort((a, b) => a.shift - b.shift);
  }
  return map;
}

function UjianGroup({ jenis, rows }) {
  // Kalau hanya 1 shift, label shift tidak perlu ditampilkan (mengurangi noise).
  const showShiftLabel = rows.length > 1;

  return (
    <Box sx={{ mb: 1 }}>
      <Box sx={{ px: 2, py: 1, bgcolor: 'grey.100' }}>
        <Typography fontWeight="bold" variant="body2">
          {JENIS_LABEL[jenis] ?? jenis}
        </Typography>
      </Box>

      {rows.map((row, idx) => (
        <Box
          key={`${jenis}-${row.shift}`}
          sx={{
            display: 'flex',
            alignItems: 'center',
            px: 2,
            py: 1,
            bgcolor: idx % 2 === 0 ? 'grey.50' : 'white',
          }}
        >
          <Typography variant="body2" sx={{ flex: 1 }}>
            {formatTanggal(row.tanggal)}
          </Typography>
          <Typography variant="body2" sx={{ flex: 1 }}>
            {showShiftLabel ? `Shift ${row.shift}` : ''}
          </Typography>
          <Typography variant="body2">
            {row.jam_mulai} - {row.jam_selesai}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

/**
 * Section "Jadwal Ujian" di MatkulAccordionItem.
 * Group ujian per jenis (UTS lalu UAS), render sebagai mini-table mirip KelasJadwalTable.
 *
 * @param {{ ujian: { jenis, shift, tanggal, jam_mulai, jam_selesai }[] }} props
 */
function JadwalUjianSection({ ujian }) {
  // useMemo tidak perlu — input pendek, recompute murah.
  const groups = groupByJenis(ujian ?? []);

  if (groups.size === 0) return null;

  // Render UTS dulu, baru UAS. Jenis lain (kalau ada) di-append setelahnya.
  const order = ['UTS', 'UAS', ...Array.from(groups.keys()).filter((j) => j !== 'UTS' && j !== 'UAS')];

  return (
    <>
      <Typography variant="caption" color="text.secondary" sx={{ px: 2, pt: 1, display: 'block' }}>
        Jadwal Ujian :
      </Typography>
      {order
        .filter((jenis) => groups.has(jenis))
        .map((jenis) => (
          <UjianGroup key={jenis} jenis={jenis} rows={groups.get(jenis)} />
        ))}
    </>
  );
}

export default JadwalUjianSection;
