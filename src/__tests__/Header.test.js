import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Header } from '../components/Header';

const MockHeader = () => (
  <BrowserRouter>
    <Header />
  </BrowserRouter>
);

describe('Header', () => {
  test('renders logo correctly', () => {
    render(<MockHeader />);
    expect(screen.getByText('EAZYCAPTURE')).toBeInTheDocument();
  });

  test('renders logout button', () => {
    render(<MockHeader />);
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  test('renders profile button', () => {
    render(<MockHeader />);
    expect(screen.getByTestId('profile-button')).toBeInTheDocument();
  });
});