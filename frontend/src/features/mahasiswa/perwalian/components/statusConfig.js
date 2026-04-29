export const RENCANA_STUDI_STATUS = {
  DRAFT: {
    label: 'Draft',
    color: 'default',
    helper: 'FRS masih bisa diubah sebelum dikirim ke dosen wali.',
  },
  SUBMITTED: {
    label: 'Menunggu Review',
    color: 'warning',
    helper: 'FRS sudah dikirim dan menunggu review dosen wali.',
  },
  APPROVED: {
    label: 'Disetujui',
    color: 'success',
    helper: 'FRS sudah disetujui dan bersifat read-only.',
  },
  REJECTED: {
    label: 'Perlu Revisi',
    color: 'error',
    helper: 'FRS perlu diperbaiki, lalu dikirim ulang.',
  },
};

export function getStatusConfig(status) {
  return RENCANA_STUDI_STATUS[status] ?? RENCANA_STUDI_STATUS.DRAFT;
}

export function isEditableRencanaStudi(status) {
  return status === 'DRAFT' || status === 'REJECTED';
}
