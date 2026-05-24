import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

function DpsReplaceConfirmDialog({
  open,
  periodeName,
  loading,
  onCancel,
  onConfirm,
}) {
  return (
    <Dialog open={open} onClose={loading ? undefined : onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>Ganti data DPS?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Data nilai untuk periode {periodeName} akan diganti dengan hasil preview ini.
          Lanjutkan simpan?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={loading}>
          Batal
        </Button>
        <Button onClick={onConfirm} variant="contained" color="warning" disabled={loading}>
          Ya, Simpan
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DpsReplaceConfirmDialog;
