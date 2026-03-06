import type React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { describe, expect, it } from 'vitest';
import { Root } from '../Root';
import { theme } from '../theme';

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

describe('Root', () => {
  it('renders counter starting at 0', () => {
    renderWithTheme(<Root />);
    expect(screen.getByTestId('counter-value')).toHaveTextContent('0');
  });

  it('increments counter when + is clicked', () => {
    renderWithTheme(<Root />);
    fireEvent.click(screen.getByRole('button', { name: /increment/i }));
    expect(screen.getByTestId('counter-value')).toHaveTextContent('1');
  });

  it('decrements counter when - is clicked', () => {
    renderWithTheme(<Root />);
    fireEvent.click(screen.getByRole('button', { name: /decrement/i }));
    expect(screen.getByTestId('counter-value')).toHaveTextContent('-1');
  });
});
