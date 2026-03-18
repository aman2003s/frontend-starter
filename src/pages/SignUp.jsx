import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Link as MuiLink,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { Header } from '../components/Header';

export function SignUp() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      role: 'Viewer',
    },
  });

  const password = watch('password');

  const signupMutation = useMutation({
    mutationFn: async (data) => {
      const { confirmPassword, ...signupData } = data;
      return authService.signup(signupData);
    },
    onSuccess: async (data) => {
      console.log('Signup successful, data:', data);
      await new Promise(resolve => setTimeout(resolve, 200));
      console.log('Invalidating and refetching auth query');
      const result = await queryClient.refetchQueries({ queryKey: ['auth', 'me'] });
      console.log('Auth query refetch result:', result);
      console.log('Navigating to invoices');
      navigate('/invoices');
    },
    onError: (error) => {
      console.error('Signup failed:', error.message);
    },
  });

  const onSubmit = (data) => {
    signupMutation.mutate(data);
  };

  return (
    <Box>
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <Header minimal />
      </Box>
      <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          py: 4,
        }}
      >
        <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 'bold' }}>
          Sign Up
        </Typography>

        {signupMutation.isError && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {signupMutation.error?.response?.data?.message ||
              'Sign up failed. Please try again.'}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            margin="normal"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email format',
              },
            })}
            error={!!errors.email}
            helperText={errors.email?.message}
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            margin="normal"
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters',
              },
            })}
            error={!!errors.password}
            helperText={errors.password?.message}
          />

          <TextField
            fullWidth
            label="Confirm Password"
            type="password"
            margin="normal"
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (value) => value === password || 'Passwords do not match',
            })}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel id="role-label">Role</InputLabel>
            <Select
              labelId="role-label"
              label="Role"
              {...register('role')}
              defaultValue="Viewer"
            >
              <MenuItem value="Viewer">Viewer</MenuItem>
              <MenuItem value="Editor">Editor</MenuItem>
              <MenuItem value="Admin">Admin</MenuItem>
            </Select>
          </FormControl>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={signupMutation.isPending}
          >
            {signupMutation.isPending ? <CircularProgress size={24} /> : 'Sign Up'}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2">
              Already have an account?{' '}
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <MuiLink component="span" sx={{ cursor: 'pointer' }}>
                  Log In
                </MuiLink>
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Container>
    </Box>
  );
}
