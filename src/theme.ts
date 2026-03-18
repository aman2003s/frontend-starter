import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: { main: '#6b48ff' },
    secondary: { main: '#9c27b0' },
    background: {
      default: '#f5f6f8',
    },
    text: {
      primary: '#111827',
      secondary: '#6b7280',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    body2: {
      lineHeight: 1.6,
    },
  },
});
