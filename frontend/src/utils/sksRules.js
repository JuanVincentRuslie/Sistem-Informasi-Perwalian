// Aturan jatah SKS maksimal per IPS terakhir (dari pedoman kampus).
// IPS null = mahasiswa baru / belum ada nilai → konservatif 18.
export function getMaxSks(ipsTerakhir) {
  if (ipsTerakhir == null) return 18;
  if (ipsTerakhir >= 3.0) return 24;
  if (ipsTerakhir >= 2.5) return 21;
  return 18;
}
