import Chip from '@mui/material/Chip';
import { getStatusConfig } from './statusConfig.js';

function StatusChip({ status, size = 'medium' }) {
  const statusConfig = getStatusConfig(status);

  return (
    <Chip
      label={statusConfig.label}
      color={statusConfig.color}
      size={size}
      variant={status === 'DRAFT' ? 'outlined' : 'filled'}
    />
  );
}

export default StatusChip;
