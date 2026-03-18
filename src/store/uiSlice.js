import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  invoiceFormOpen: false,
  editingInvoiceId: null,
  deleteInvoiceDialogOpen: false,
  deleteInvoiceId: null,
  userFormOpen: false,
  editingUserId: null,
  deleteUserDialogOpen: false,
  deleteUserId: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openInvoiceForm: (state, action) => {
      state.invoiceFormOpen = true;
      state.editingInvoiceId = action.payload || null;
    },
    closeInvoiceForm: (state) => {
      state.invoiceFormOpen = false;
      state.editingInvoiceId = null;
    },
    openDeleteInvoiceDialog: (state, action) => {
      state.deleteInvoiceDialogOpen = true;
      state.deleteInvoiceId = action.payload;
    },
    closeDeleteInvoiceDialog: (state) => {
      state.deleteInvoiceDialogOpen = false;
      state.deleteInvoiceId = null;
    },
    openUserForm: (state, action) => {
      state.userFormOpen = true;
      state.editingUserId = action.payload || null;
    },
    closeUserForm: (state) => {
      state.userFormOpen = false;
      state.editingUserId = null;
    },
    openDeleteUserDialog: (state, action) => {
      state.deleteUserDialogOpen = true;
      state.deleteUserId = action.payload;
    },
    closeDeleteUserDialog: (state) => {
      state.deleteUserDialogOpen = false;
      state.deleteUserId = null;
    },
  },
});

export const {
  openInvoiceForm,
  closeInvoiceForm,
  openDeleteInvoiceDialog,
  closeDeleteInvoiceDialog,
  openUserForm,
  closeUserForm,
  openDeleteUserDialog,
  closeDeleteUserDialog,
} = uiSlice.actions;

export default uiSlice.reducer;