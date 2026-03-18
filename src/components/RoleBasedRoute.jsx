import { CircularProgress, Box, Alert } from '@mui/material';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function RoleBasedRoute({ children, requiredRole = null, requiredPermission = null }) {
  const { isAuthenticated, isLoading, user } = useAuth();

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
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          You don't have permission to access this page. Required role: {requiredRole}
        </Alert>
      </Box>
    );
  }

  if (requiredPermission) {
    const { hasPermission } = require('../utils/roles');
    if (!hasPermission(user?.role, requiredPermission)) {
      return (
        <Box sx={{ p: 3 }}>
          <Alert severity="error">
            You don't have permission to access this page.
          </Alert>
        </Box>
      );
    }
  }

  return <>{children}</>;
}
