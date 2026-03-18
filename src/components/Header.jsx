import React from 'react';
import { Box, Button, Typography, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CenterFocusWeakIcon from '@mui/icons-material/CenterFocusWeak';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import { authService } from '../services/authService';

export function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleProfile = () => {
  };

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

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={handleProfile} sx={{ color: '#6b7280' }} data-testid="profile-button">
          <PersonIcon />
        </IconButton>
        <Button
          onClick={handleLogout}
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
    </Box>
  );
}