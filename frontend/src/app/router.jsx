import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import LoginPage from '../features/auth/LoginPage.jsx';
import DashboardLayout from '../shared/layouts/DashboardLayout.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

function ProtectedRoute() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function PublicOnlyRoute() {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

function RootRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? '/dashboard' : '/login'} replace />;
}

const router = createBrowserRouter([
  { path: '/', element: <RootRedirect /> },
  {
    element: <PublicOnlyRoute />,
    children: [{ path: '/login', element: <LoginPage /> }],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/dashboard',
        element: <DashboardLayout />,
        children: [
          // index route: yang dirender di <Outlet /> saat path persis "/dashboard"
          { index: true, element: <Typography>Dashboard</Typography> },
        ],
      },
    ],
  },
]);

export default router;
