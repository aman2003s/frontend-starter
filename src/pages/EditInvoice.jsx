import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { invoiceService } from '../services/invoiceService';

export function EditInvoice() {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      customerName: '',
      amount: '',
      status: '',
    },
  });

  const statusValue = watch('status');

  const invoiceQuery = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => invoiceService.getInvoice(id),
    onSuccess: (data) => {
      reset({
        customerName: data.customerName || '',
        amount: data.amount || '',
        status: data.status || '',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => invoiceService.updateInvoice(id, data),
    onSuccess: () => {
      navigate('/invoices');
    },
  });

  const onSubmit = (data) => {
    updateMutation.mutate({
      customerName: data.customerName,
      amount: parseFloat(data.amount),
      ...(statusValue && { status: statusValue }),
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
              Edit Invoice
            </Typography>

            {updateMutation.isError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {updateMutation.error?.response?.data?.message ||
                  'Failed to update invoice. Please try again.'}
              </Alert>
            )}

            {updateMutation.isSuccess && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Invoice updated successfully!
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

              <FormControl fullWidth margin="normal">
                <InputLabel>Status (Optional)</InputLabel>
                <Select
                  label="Status (Optional)"
                  {...register('status')}
                  value={statusValue}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value="Draft">Draft</MenuItem>
                  <MenuItem value="Sent">Sent</MenuItem>
                  <MenuItem value="Paid">Paid</MenuItem>
                </Select>
              </FormControl>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? <CircularProgress size={24} /> : 'Update Invoice'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
