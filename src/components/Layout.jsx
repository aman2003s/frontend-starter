import React from 'react';
import { Box } from '@mui/material';
import { Header } from './Header';

export function Layout({ children }) {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f6f8' }}>
      <Header />
      <Box sx={{ p: 4 }}>
        {children}
      </Box>
    </Box>
  );
}