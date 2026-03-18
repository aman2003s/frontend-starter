import { Box, Typography, Button } from '@mui/material';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Provider } from 'react-redux';
import { store } from '../store/store';

export function RoleProtectedRoute({ children, requiredRoles = [] }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        Loading...
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const hasRole = requiredRoles.length === 0 || requiredRoles.includes(user?.role);

  if (!hasRole) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          textAlign: 'center',
          p: 3,
        }}
      >
        <Typography variant="h4" sx={{ mb: 2 }}>
          Access Denied
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          You don't have permission to access this page. Your role is:{' '}
          <strong>{user?.role}</strong>
        </Typography>
        <Button variant="contained" href="/">
          Go to Dashboard
        </Button>
      </Box>
    );
  }

  return <><Provider store={store}>{children}</Provider></>;
}
