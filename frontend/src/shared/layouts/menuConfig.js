import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import EventNoteIcon from '@mui/icons-material/EventNote';
import EventIcon from '@mui/icons-material/Event';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import DateRangeIcon from '@mui/icons-material/DateRange';

export const MENU_BY_ROLE = {
  mahasiswa: [
    { label: 'Dashboard', path: '/dashboard', icon: DashboardIcon },
    { label: 'Pohon Kurikulum', path: '/dashboard/pohon-kurikulum', icon: AccountTreeIcon },
    { label: 'Perwalian Saya', path: '/dashboard/perwalian', icon: EventNoteIcon },
  ],
  dosen_wali: [
    { label: 'Dashboard', path: '/dashboard', icon: DashboardIcon },
    { label: 'Jadwal Perwalian', path: '/dashboard/jadwal-perwalian', icon: EventIcon },
  ],
  kaprodi: [
    { label: 'Dashboard', path: '/dashboard', icon: DashboardIcon },
    { label: 'Dosen Wali', path: '/dashboard/dosen-wali', icon: GroupIcon },
    { label: 'Mahasiswa', path: '/dashboard/mahasiswa', icon: PersonIcon },
    { label: 'Periode', path: '/dashboard/periode', icon: DateRangeIcon },
  ],
};
