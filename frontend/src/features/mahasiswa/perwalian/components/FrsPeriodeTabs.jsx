import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

/**
 * Tab row untuk memilih periode FRS yang ingin dilihat.
 * @param {object[]} riwayat - List ringkasan FRS (sudah di-sort terbaru duluan)
 * @param {number} activeTabIndex
 * @param {Function} onChange - callback(newIndex)
 */
function FrsPeriodeTabs({ riwayat, activeTabIndex, onChange }) {
  return (
    <Tabs
      value={activeTabIndex}
      onChange={(_, newValue) => onChange(newValue)}
      sx={{ borderBottom: 1, borderColor: 'divider', mb: 1 }}
    >
      {riwayat.map((item, idx) => (
        <Tab key={item.id} label={item.periode.nama} value={idx} />
      ))}
    </Tabs>
  );
}

export default FrsPeriodeTabs;
