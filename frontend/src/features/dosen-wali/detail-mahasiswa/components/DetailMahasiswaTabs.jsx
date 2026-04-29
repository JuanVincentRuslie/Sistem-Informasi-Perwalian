import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

const DETAIL_TABS = [
  { label: 'Dashboard' },
  { label: 'Pohon Kurikulum' },
  { label: 'Rencana Studi' },
];

function DetailMahasiswaTabs({ activeTab, onChange }) {
  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
      <Tabs
        value={activeTab}
        onChange={(_event, nextTab) => onChange(nextTab)}
        aria-label="Tab detail mahasiswa"
      >
        {DETAIL_TABS.map((tab) => (
          <Tab key={tab.label} label={tab.label} />
        ))}
      </Tabs>
    </Box>
  );
}

export default DetailMahasiswaTabs;
