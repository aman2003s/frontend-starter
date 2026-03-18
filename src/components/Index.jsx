import { CircularProgress, Box } from '@mui/material';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return <Navigate to={isAuthenticated ? '/invoices' : '/login'} replace />;
}
