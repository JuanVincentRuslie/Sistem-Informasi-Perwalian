import { useMemo } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import ReactFlow, { Background, Controls } from 'reactflow';
import { useAuth } from '../../../contexts/AuthContext.jsx';
import useFetch from '../../../hooks/useFetch.js';
import { getPohonKurikulum } from '../../../api/akademik.js';
import MatkulNode from '../pohon-kurikulum/components/MatkulNode.jsx';
import StudiSummaryBar from './components/StudiSummaryBar.jsx';
import StatCard from './components/StatCard.jsx';

// nodeTypes di luar component: referensi stabil, tidak di-recreate tiap render.
// Kalau taruh di dalam component tanpa useMemo, React Flow print warning setiap re-render.
const nodeTypes = { matkulNode: MatkulNode };

function ReportPage() {
  // useAuth: ambil id mahasiswa untuk query pohon kurikulum per-user.
  const { user } = useAuth();

  // useFetch: panggil getPohonKurikulum sekali saat mount.
  // [user.id] sebagai deps — kalau user berubah, data ikut re-fetch.
  const { data, loading, error } = useFetch(() => getPohonKurikulum(user.id), [user.id]);

  // useMemo: transform data API → format nodes React Flow.
  // Hanya jalan ulang kalau data.nodes berubah, bukan setiap render.
  const rfNodes = useMemo(() => {
    if (!data?.nodes) return [];
    return data.nodes.map((n) => ({
      id: String(n.id),
      type: 'matkulNode',
      position: { x: n.kolom * 180, y: (n.semester - 1) * 160 },
      data: n,
    }));
  }, [data]);

  // useMemo: transform data API → format edges React Flow.
  const rfEdges = useMemo(() => {
    if (!data?.edges) return [];
    return data.edges.map((e) => ({
      id: String(e.id),
      source: String(e.source_id),
      target: String(e.target_id),
    }));
  }, [data]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 3 }}>{error.message}</Alert>;
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h5" fontWeight="bold" sx={{ p: 2, pb: 1 }}>
        PROGRES STUDI SAYA
      </Typography>

      <Box sx={{ flex: 1, minHeight: 400 }}>
        <ReactFlow nodes={rfNodes} edges={rfEdges} nodeTypes={nodeTypes} fitView>
          <Background />
          <Controls />
        </ReactFlow>
      </Box>

      <StudiSummaryBar totalSksLulus={data.summary.total_sks_lulus} />

      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <StatCard label="IPK" value={data.summary.ipk.toFixed(2)} />
        <StatCard label="IPS" value={data.summary.ips_terakhir.toFixed(2)} />
      </Box>
    </Box>
  );
}

export default ReportPage;
