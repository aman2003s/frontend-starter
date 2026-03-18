import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Link as MuiLink,
  OutlinedInput,
  InputAdornment,
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';

import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import CenterFocusWeakIcon from '@mui/icons-material/CenterFocusWeak';

export function Login() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: async (data) => {
      console.log('Login successful, data:', data);
      await new Promise(resolve => setTimeout(resolve, 200));
      console.log('Invalidating and refetching auth query');
      const result = await queryClient.refetchQueries({ queryKey: ['auth', 'me'] });
      console.log('Auth query refetch result:', result);
      console.log('Navigating to invoices');
      navigate('/invoices');
    },
    onError: (error) => {
      console.error('Login failed:', error.message);
    },
  });

  const onSubmit = (data) => {
    loginMutation.mutate(data);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100vw' }}>
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          width: '50%',
          bgcolor: '#6b48ff',
          color: 'white',
          flexDirection: 'column',
          justifyContent: 'space-between',
          px: 8,
          py: 6,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative Background Circles */}
        <Box sx={{ position: 'absolute', top: '15%', left: '15%', width: 120, height: 120, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.03)' }} />
        <Box sx={{ position: 'absolute', bottom: '25%', right: '20%', width: 80, height: 80, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.03)' }} />
        <Box sx={{ position: 'absolute', top: '40%', right: '-5%', width: 250, height: 250, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)' }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, zIndex: 1 }}>
          <CenterFocusWeakIcon fontSize="large" />
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', letterSpacing: 1 }}>
            EAZYCAPTURE
          </Typography>
        </Box>

        <Box sx={{ zIndex: 1, maxWidth: '80%' }}>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, lineHeight: 1.2 }}>
            Accounting, <br />
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>automated</span> with Intelligence.
          </Typography>
          <Typography variant="body1" sx={{ mt: 3, opacity: 0.8, lineHeight: 1.6, maxWidth: 400 }}>
            Transform your accounting practice with intelligent automation. Let AI handle the routine while you focus on what matters.
          </Typography>
        </Box>

        {/* Footer Stats */}
        <Box sx={{ zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.1)', pt: 4, display: 'flex', gap: 6 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>98%</Typography>
            <Typography variant="body2" sx={{ opacity: 0.7, mt: 0.5 }}>Time saved on<br />data entry</Typography>
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>500+</Typography>
            <Typography variant="body2" sx={{ opacity: 0.7, mt: 0.5 }}>Firms<br />transformed</Typography>
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>99.9%</Typography>
            <Typography variant="body2" sx={{ opacity: 0.7, mt: 0.5 }}>Accuracy<br />rate</Typography>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          width: { xs: '100%', md: '50%' },
          bgcolor: '#f5f6f8',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          px: 4,
          py: 8,
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 420 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', mb: 1 }}>
            Welcome back
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280', mb: 4 }}>
            Sign in to your account to continue
          </Typography>

          {loginMutation.isError && (
            <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
              {loginMutation.error?.response?.data?.message || 'Invalid email or password'}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 1, display: 'block' }}>
                Email address
              </Typography>
              <OutlinedInput
                fullWidth
                placeholder="you@company.com"
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email format',
                  },
                })}
                error={!!errors.email}
                startAdornment={
                  <InputAdornment position="start">
                    <MailOutlineIcon sx={{ color: '#9ca3af' }} fontSize="small" />
                  </InputAdornment>
                }
                sx={{
                  bgcolor: 'white',
                  borderRadius: 2,
                  '& fieldset': { borderColor: '#e5e7eb' },
                }}
              />
              {errors.email && (
                <Typography color="error" variant="caption" sx={{ mt: 0.5, display: 'block' }}>
                  {errors.email.message}
                </Typography>
              )}
            </Box>

            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151' }}>
                  Password
                </Typography>
                <MuiLink href="#" underline="none" variant="caption" sx={{ color: '#6b48ff', fontWeight: 600 }}>
                  Forgot password?
                </MuiLink>
              </Box>
              <OutlinedInput
                fullWidth
                placeholder="Enter your password"
                type="password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  },
                })}
                error={!!errors.password}
                startAdornment={
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: '#9ca3af' }} fontSize="small" />
                  </InputAdornment>
                }
                endAdornment={
                  <InputAdornment position="end">
                    <VisibilityOffOutlinedIcon sx={{ color: '#9ca3af', cursor: 'pointer' }} fontSize="small" />
                  </InputAdornment>
                }
                sx={{
                  bgcolor: 'white',
                  borderRadius: 2,
                  '& fieldset': { borderColor: '#e5e7eb' },
                }}
              />
              {errors.password && (
                <Typography color="error" variant="caption" sx={{ mt: 0.5, display: 'block' }}>
                  {errors.password.message}
                </Typography>
              )}
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loginMutation.isPending}
              sx={{
                bgcolor: '#6b48ff',
                color: 'white',
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                '&:hover': {
                  bgcolor: '#5936e0',
                },
              }}
            >
              {loginMutation.isPending ? <CircularProgress size={24} color="inherit" /> : 'Sign in →'}
            </Button>

            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                Don't have an account?{' '}
                <Link to="/signup" style={{ textDecoration: 'none' }}>
                  <MuiLink component="span" sx={{ color: '#6b48ff', fontWeight: 600, cursor: 'pointer', underline: 'none' }}>
                    Create one
                  </MuiLink>
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}