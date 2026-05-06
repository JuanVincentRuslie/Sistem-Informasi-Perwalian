import { useMemo } from 'react';
import ReactFlow, { Background, Controls, MarkerType } from 'reactflow';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MatkulNode from './MatkulNode.jsx';
import PohonKurikulumLegend from './PohonKurikulumLegend.jsx';

// Warna edge per relation_type: menunjukkan "kekuatan" prasyarat.
// Diletakkan di luar component supaya tidak dibuat ulang tiap render.
const EDGE_COLORS = {
  prasyarat_lulus: '#1976d2',
  prasyarat_tempuh: '#9c27b0',
  prasyarat_tempuh_atau_tempuh_bersama: '#ff9800',
  prasyarat_lulus_atau_tempuh_bersama: '#4caf50',
};

function getEdgeColor(relationType) {
  return EDGE_COLORS[relationType] ?? '#999';
}

// Transform: data dari API -> format yang dimengerti React Flow.
// React Flow butuh id string, field `position`, dan `data` untuk custom node.
function toFlowNodes(nodes) {
  return (nodes ?? []).map((node) => ({
    id: String(node.id),
    type: 'matkul',
    data: node,
    position: {
      // spacing diperbesar supaya edges yang melintasi banyak semester
      // punya ruang routing yang cukup, ngurangin tabrakan visual
      x: (node.kolom ?? 1) * 300,
      y: (node.semester - 1) * 250,
    },
  }));
}

function toFlowEdges(edges) {
  return (edges ?? []).map((edge) => ({
    id: String(edge.id),
    source: String(edge.source_id),
    target: String(edge.target_id),
    type: 'smoothstep',
    animated: false,
    style: { stroke: getEdgeColor(edge.relation_type), strokeWidth: 2 },
    // markerEnd: arrow di ujung edge (pointing ke target node).
    // ArrowClosed = arrow solid (filled triangle).
    // color disamain sama warna edge biar konsisten visual.
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: getEdgeColor(edge.relation_type),
      width: 20,
      height: 20,
    },
  }));
}

function PohonKurikulumFlow({ data }) {
  // useMemo: memoize nodeTypes biar reference-nya stabil antar render.
  // Tanpa ini, React Flow anggap nodeTypes baru tiap render -> re-mount semua custom node.
  const nodeTypes = useMemo(() => ({ matkul: MatkulNode }), []);

  const flowNodes = toFlowNodes(data?.nodes);
  const flowEdges = toFlowEdges(data?.edges);
  const { total_sks_lulus, ipk, ips_terakhir } = data?.summary ?? {};

  return (
    <>
      {/* Canvas React Flow butuh height eksplisit, tidak bisa auto */}
      <Box sx={{ height: '70vh', border: '1px solid #e0e0e0', borderRadius: 1, mb: 3 }}>
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-right"
        >
          {/* Background: grid pattern di belakang canvas */}
          <Background />
          {/* Controls: tombol zoom in/out/fit di pojok kiri bawah */}
          <Controls />
        </ReactFlow>
      </Box>

      {/* Summary akademik dari data.summary. Field nilai bisa null kalau
          mahasiswa belum upload DPS — fallback ke '-' biar tidak crash. */}
      <Stack direction="row" spacing={4}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Total SKS Lulus
          </Typography>
          <Typography variant="h6" fontWeight="bold">
            {total_sks_lulus ?? 0}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            IPK
          </Typography>
          <Typography variant="h6" fontWeight="bold">
            {ipk == null ? '-' : ipk.toFixed(2)}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            IPS Terakhir
          </Typography>
          <Typography variant="h6" fontWeight="bold">
            {ips_terakhir == null ? '-' : ips_terakhir.toFixed(2)}
          </Typography>
        </Box>
      </Stack>

      <PohonKurikulumLegend />
    </>
  );
}

export default PohonKurikulumFlow;
