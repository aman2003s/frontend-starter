import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { invoiceService } from '../services/invoiceService';

export function InvoiceForm({ open, onClose, invoiceId = null, onSuccess = null }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      customerName: '',
      amount: '',
      status: 'Draft',
    },
  });

  const { data: invoiceData } = useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: () => invoiceService.getInvoice(invoiceId),
    enabled: !!invoiceId,
  });

  useEffect(() => {
    if (invoiceData) {
      reset({
        customerName: invoiceData.customerName,
        amount: invoiceData.amount,
        status: invoiceData.status,
      });
    } else if (!invoiceId) {
      reset({
        customerName: '',
        amount: '',
        status: 'Draft',
      });
    }
  }, [invoiceData, invoiceId, reset]);

  const createMutation = useMutation({
    mutationFn: (data) => invoiceService.createInvoice(data),
    onSuccess: () => {
      onSuccess?.();
      onClose();
      reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => invoiceService.updateInvoice(invoiceId, data),
    onSuccess: () => {
      onSuccess?.();
      onClose();
      reset();
    },
  });

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  const onSubmit = (data) => {
    const submitData = {
      customerName: data.customerName,
      amount: parseFloat(data.amount),
      status: data.status,
    };

    if (invoiceId) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{invoiceId ? 'Edit Invoice' : 'Create Invoice'}</DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error?.response?.data?.message || 'An error occurred'}
          </Alert>
        )}

        <form>
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
              min: { value: 0, message: 'Amount must be greater than 0' },
            })}
            error={!!errors.amount}
            helperText={errors.amount?.message}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label"
              label="Status"
              {...register('status')}
              defaultValue="Draft"
            >
              <MenuItem value="Draft">Draft</MenuItem>
              <MenuItem value="Sent">Sent</MenuItem>
              <MenuItem value="Paid">Paid</MenuItem>
            </Select>
          </FormControl>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
