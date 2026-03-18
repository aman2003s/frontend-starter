import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Chip,
  TablePagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { usePermission } from '../hooks/usePermission';
import {
  fetchInvoices,
  deleteInvoice,
  setFilters,
} from '../store/invoicesSlice';
import {
  openInvoiceForm,
  closeInvoiceForm,
  openDeleteInvoiceDialog,
  closeDeleteInvoiceDialog
} from '../store/uiSlice';
import { InvoiceForm } from '../components/InvoiceForm';
import { useDispatch, useSelector } from 'react-redux';

export function Invoices() {
  const { can } = usePermission();
  const dispatch = useDispatch();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const {
    invoices,
    totalCount,
    loading,
    error,
    filters
  } = useSelector((state) => state.invoices);
  console.log(invoices,
    totalCount,
    loading,
    error,
    filters)
  const {
    invoiceFormOpen,
    editingInvoiceId,
    deleteInvoiceDialogOpen,
    deleteInvoiceId
  } = useSelector((state) => state.ui);

  useEffect(() => {
    dispatch(fetchInvoices(filters));
  }, [dispatch, filters]);

  const handleDeleteInvoice = async (id) => {
    setDeleteLoading(true);
    try {
      await dispatch(deleteInvoice(id)).unwrap();
      console.log('Invoice deleted successfully');
      dispatch(closeDeleteInvoiceDialog());
      dispatch(fetchInvoices(filters));
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCreateClick = () => {
    dispatch(openInvoiceForm(null));
  };

  const handleEditClick = (id) => {
    dispatch(openInvoiceForm(id));
  };

  const handleDeleteClick = (id) => {
    dispatch(openDeleteInvoiceDialog(id));
  };

  const handleCloseForm = () => {
    dispatch(closeInvoiceForm());
  };

  const handleSuccess = () => {
    dispatch(fetchInvoices(filters));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Draft':
        return 'default';
      case 'Sent':
        return 'warning';
      case 'Paid':
        return 'success';
      default:
        return 'default';
    }
  };

  if (!can('viewInvoices')) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Alert severity="error">
            You don't have permission to view invoices
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <h1 style={{ margin: 0 }}>Invoices</h1>
          {can('createInvoice') && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateClick}
            >
              Create Invoice
            </Button>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || 'Failed to load invoices'}
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search by customer name"
            value={filters.search || ''}
            onChange={(e) => dispatch(setFilters({ ...filters, search: e.target.value, page: 1 }))}
            sx={{ flex: 1, minWidth: '200px' }}
            size="small"
          />
          <FormControl sx={{ minWidth: '150px' }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status || ''}
              label="Status"
              onChange={(e) => dispatch(setFilters({ ...filters, status: e.target.value, page: 1 }))}
              size="small"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Draft">Draft</MenuItem>
              <MenuItem value="Sent">Sent</MenuItem>
              <MenuItem value="Paid">Paid</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell>Invoice Number</TableCell>
                    <TableCell>Customer Name</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created Date</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoices.length > 0 ? (
                    invoices.map((invoice) => (
                      <TableRow key={invoice.id} hover>
                        <TableCell>{invoice.invoiceNumber || `INV-${invoice.id}`}</TableCell>
                        <TableCell>{invoice.customerName}</TableCell>
                        <TableCell align="right">${invoice.amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Chip
                            label={invoice.status}
                            color={getStatusColor(invoice.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(parseInt(invoice.createdAt, 10)).toLocaleDateString()}
                        </TableCell>
                        <TableCell align="center" sx={{flexDirection:'row', display: 'flex', justifyContent: 'center'}}>
                          {can('editInvoice') && (
                            <IconButton
                              size="small"
                              onClick={() => handleEditClick(invoice.id)}
                              title="Edit"
                            >
                              <EditIcon />
                            </IconButton>
                          )}
                          {can('deleteInvoice') && (
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteClick(invoice.id)}
                              title="Delete"
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        No invoices found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={totalCount}
              rowsPerPage={filters.limit || 10}
              page={(filters.page || 1) - 1}
              onPageChange={(event, newPage) => dispatch(setFilters({ ...filters, page: newPage + 1 }))}
              onRowsPerPageChange={(event) => dispatch(setFilters({ ...filters, limit: parseInt(event.target.value, 10), page: 1 }))}
            />
          </>
        )}
      </Box>

      <InvoiceForm
        open={invoiceFormOpen}
        onClose={handleCloseForm}
        invoiceId={editingInvoiceId}
        onSuccess={handleSuccess}
      />

      <Dialog open={deleteInvoiceDialogOpen} onClose={() => !deleteLoading && dispatch(closeDeleteInvoiceDialog())}>
        <DialogTitle>Delete Invoice</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this invoice? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => dispatch(closeDeleteInvoiceDialog())} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button
            onClick={() => handleDeleteInvoice(deleteInvoiceId)}
            color="error"
            variant="contained"
            disabled={deleteLoading}
          >
            {deleteLoading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
