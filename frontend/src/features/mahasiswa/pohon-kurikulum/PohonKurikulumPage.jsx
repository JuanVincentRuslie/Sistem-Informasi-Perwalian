import Typography from '@mui/material/Typography';
import PageContainer from '../../../shared/components/PageContainer.jsx';
import PageHeader from '../../../shared/components/PageHeader.jsx';

function PohonKurikulumPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Pohon Kurikulum"
        subtitle="Visualisasi mata kuliah dan prasyaratnya"
      />
      <Typography color="text.secondary">
        Pohon kurikulum dengan React Flow akan diimplementasi di milestone 3.
      </Typography>
    </PageContainer>
  );
}

export default PohonKurikulumPage;
