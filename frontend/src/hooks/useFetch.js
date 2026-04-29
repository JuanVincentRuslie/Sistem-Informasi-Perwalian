import { useState, useEffect, useCallback } from 'react';

// Custom hook adalah function JavaScript biasa yang:
//   1. Namanya diawali "use" (konvensi React, wajib)
//   2. Di dalamnya boleh pakai hooks lain (useState, useEffect, dll)
//   3. Bisa di-reuse di banyak component, beda dari utils biasa
//
// useFetch: reusable hook untuk handle lifecycle fetch data dari API.
// Setiap component yang butuh data dari server cukup pakai hook ini,
// tanpa perlu nulis ulang loading/error handling dari nol.
//
// @param {() => Promise} fetcher - async function yang return data (dari api/)
// @param {Array} deps - dependency array, seperti di useEffect
// @returns {{ data, loading, error, refetch }}
function useFetch(fetcher, deps = []) {
  // useState [data]: simpan response dari fetcher.
  // Null dulu karena data belum ada sebelum fetch selesai.
  const [data, setData] = useState(null);

  // useState [loading]: true selama fetch berjalan, false setelah selesai.
  // Dipakai component untuk tampilkan spinner atau skeleton.
  const [loading, setLoading] = useState(true);

  // useState [error]: simpan error kalau fetch gagal.
  // Null kalau sukses, berisi object Error kalau gagal.
  const [error, setError] = useState(null);

  // useState [trigger]: counter untuk memaksa useEffect jalan ulang.
  // Increment lewat refetch() tanpa harus ubah deps dari luar.
  const [trigger, setTrigger] = useState(0);

  // useEffect: jalanin fetcher otomatis pas component mount,
  // dan re-fetch tiap kali deps atau trigger berubah.
  //
  // 'cancelled' flag: pengaman supaya gak setState kalau component
  // sudah unmount sebelum fetch selesai (avoid memory leak warning di console).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    fetcher()
      .then((response) => {
        if (cancelled) return;
        setData(response.data);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      });

    // Cleanup function: jalan pas component unmount atau sebelum useEffect
    // jalan ulang (misal karena deps berubah). Set cancelled = true biar
    // setState di .then/.catch di atas di-skip kalau fetch belum selesai.
    return () => {
      cancelled = true;
    };
    // deps dari luar digabung dengan trigger internal
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, trigger]);

  // useCallback: bikin reference function yang stabil antar render.
  // Tanpa ini, refetch jadi object function baru tiap render —
  // kalau dipakai sebagai dep di useEffect lain, bisa infinite loop.
  const refetch = useCallback(() => {
    setTrigger((t) => t + 1);
  }, []);

  return { data, loading, error, refetch };
}

export default useFetch;

/*
 * CONTOH PENGGUNAAN:
 *
 * function PohonKurikulumPage() {
 *   const { user } = useAuth();
 *   const { data, loading, error, refetch } = useFetch(
 *     () => getPohonKurikulum(user.id),
 *     [user.id]  // re-fetch otomatis kalau user berubah
 *   );
 *
 *   if (loading) return <CircularProgress />;
 *   if (error) return <Alert severity="error">{error.message}</Alert>;
 *   return <div>{data.summary.ipk}</div>;
 * }
 */
