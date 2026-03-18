import { Box, Button, Typography, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CenterFocusWeakIcon from '@mui/icons-material/CenterFocusWeak';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../hooks/useAuth';

export function Header({ minimal = false }) {
  const { user, logout } = useAuth();

  const firstLetter = user?.email?.charAt(0).toUpperCase() || '?';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 4,
        py: 2,
        bgcolor: 'white',
        borderBottom: '1px solid #e5e7eb',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CenterFocusWeakIcon sx={{ color: '#6b48ff' }} fontSize="large" />
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', letterSpacing: 1, color: '#111827' }}>
          EAZYCAPTURE
        </Typography>
      </Box>

      {!minimal && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            src={user?.profileImage || undefined}
            sx={{ width: 36, height: 36, bgcolor: '#6b48ff', fontSize: 16, cursor: 'pointer' }}
          >
            {!user?.profileImage && firstLetter}
          </Avatar>
          <Button
            onClick={logout}
            variant="outlined"
            startIcon={<LogoutIcon />}
            sx={{
              color: '#6b48ff',
              borderColor: '#6b48ff',
              textTransform: 'none',
              '&:hover': {
                bgcolor: '#f3f4f6',
                borderColor: '#5936e0',
              },
            }}
          >
            Logout
          </Button>
        </Box>
      )}
    </Box>
  );
}