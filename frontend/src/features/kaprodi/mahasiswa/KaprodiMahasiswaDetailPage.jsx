import DetailMahasiswaPage from '../../dosen-wali/detail-mahasiswa/DetailMahasiswaPage.jsx';

function KaprodiMahasiswaDetailPage() {
  return (
    <DetailMahasiswaPage
      readOnly
      defaultBackTo="/dashboard/mahasiswa"
      subtitle="Detail mahasiswa untuk kaprodi"
    />
  );
}

export default KaprodiMahasiswaDetailPage;
