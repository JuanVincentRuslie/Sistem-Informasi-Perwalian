import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { MENU_BY_ROLE } from './menuConfig.js';

const DRAWER_WIDTH = 240;

function DashboardLayout() {
  // useState: simpan referensi elemen yang diklik (untuk posisi dropdown menu).
  // null = menu tertutup, event.currentTarget = menu terbuka di dekat avatar.
  const [anchorEl, setAnchorEl] = useState(null);

  // useAuth: ambil data user yang login dan fungsi logout dari AuthContext global.
  // Kalau user null, ProtectedRoute di router akan redirect ke /login duluan.
  const { user, logout } = useAuth();

  // useNavigate: fungsi navigasi programmatic. Dipakai di handler (bukan JSX),
  // karena kita butuh navigasi setelah logika tertentu (logout, klik menu).
  const navigate = useNavigate();

  const menuItems = MENU_BY_ROLE[user?.role] ?? [];
  const isUserMenuOpen = Boolean(anchorEl);

  const handleOpenUserMenu = (event) => setAnchorEl(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorEl(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* AppBar: fixed di atas, z-index lebih tinggi dari Drawer biar tidak ketutupan */}
      <AppBar position="fixed" 
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 ,
      bgcolor: 'primary.main',
      color: 'primary.contrastText',


      }}>
        <Toolbar>
          <Box
            component="img"
            src="/Logo-Informatika.jpg"
            alt="Logo Informatika"
            sx={{
              width: 180,
              maxWidth: '45vw',
              height: 'auto',
              mr: 'auto',
            }}
          />

          <Typography variant="body2" sx={{ mr: 1 }}>
            {user?.nama}
          </Typography>

          <IconButton onClick={handleOpenUserMenu} color="inherit" size="small">
            <Avatar sx={{ width: 32, height: 32 }}>
              {user?.nama?.[0]?.toUpperCase()}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={isUserMenuOpen}
            onClose={handleCloseUserMenu}
          >
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Drawer: sidebar permanen, tidak bisa ditutup user */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
      >
        {/* Toolbar kosong: spacer agar konten drawer tidak tertutup AppBar yang fixed */}
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map(({ label, path, icon: Icon }) => (
              <ListItem key={path} disablePadding>
                <ListItemButton onClick={() => navigate(path)}>
                  <ListItemIcon>
                    <Icon />
                  </ListItemIcon>
                  <ListItemText primary={label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main content: flexGrow:1 supaya memenuhi sisa lebar setelah Drawer */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {/* Toolbar kosong: spacer agar konten tidak tertutup AppBar yang fixed */}
        <Toolbar />
        {/* Outlet: tempat React Router merender child route yang aktif */}
        <Outlet />
      </Box>
    </Box>
  );
}

export default DashboardLayout;
