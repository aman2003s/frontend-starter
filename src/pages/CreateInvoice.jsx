import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { invoiceService } from '../services/invoiceService';

export function CreateInvoice() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      customerName: '',
      amount: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => invoiceService.createInvoice(data),
    onSuccess: () => {
      navigate('/invoices');
    },
  });

  const onSubmit = (data) => {
    createMutation.mutate({
      customerName: data.customerName,
      amount: parseFloat(data.amount),
    });
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/invoices')}
          sx={{ mb: 3 }}
        >
          Back to Invoices
        </Button>

        <Card>
          <CardContent>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
              Create Invoice
            </Typography>

            {createMutation.isError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {createMutation.error?.response?.data?.message ||
                  'Failed to create invoice. Please try again.'}
              </Alert>
            )}

            {createMutation.isSuccess && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Invoice created successfully!
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <TextField
                fullWidth
                label="Customer Name"
                margin="normal"
                {...register('customerName', {
                  required: 'Customer name is required',
                })}
                error={!!errors.customerName}
                helperText={errors.customerName?.message}
              />

              <TextField
                fullWidth
                label="Invoice Amount"
                type="number"
                margin="normal"
                inputProps={{ step: '0.01', min: '0' }}
                {...register('amount', {
                  required: 'Amount is required',
                  min: { value: 0.01, message: 'Amount must be greater than 0' },
                })}
                error={!!errors.amount}
                helperText={errors.amount?.message}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? <CircularProgress size={24} /> : 'Create Invoice'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
