export type UserRole = 'Admin' | 'Accountant' | 'Viewer';

export type Permission =
  | 'users:manage'
  | 'invoices:create'
  | 'invoices:read'
  | 'invoices:update'
  | 'invoices:delete';

export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  Admin: ['users:manage', 'invoices:create', 'invoices:read', 'invoices:update', 'invoices:delete'],
  Accountant: ['invoices:create', 'invoices:read', 'invoices:update'],
  Viewer: ['invoices:read']
};

export interface User {
  id: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  createdAt: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  amount: number;
  status: InvoiceStatus;
  createdAt: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface PaginatedInvoices {
  items: Invoice[];
  totalCount: number;
  page: number;
  limit: number;
}
