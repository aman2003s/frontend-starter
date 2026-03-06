import { Box, Button, Typography } from '@mui/material';
import { useState } from 'react';

export function Root() {
  const [count, setCount] = useState(0);

  return (
    <Box sx={{ p: 3 }}>
      <Typography>Implement the Invoice Management app here.</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
        <Button variant="contained" onClick={() => setCount((c) => c - 1)} aria-label="decrement">
          -
        </Button>
        <Typography component="span" data-testid="counter-value">
          {count}
        </Typography>
        <Button variant="contained" onClick={() => setCount((c) => c + 1)} aria-label="increment">
          +
        </Button>
      </Box>
    </Box>
  );
}
