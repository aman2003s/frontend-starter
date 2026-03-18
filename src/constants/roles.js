// Define all available roles
export const ROLES = {
  ADMIN: 'Admin',
  ACCOUNTANT: 'Accountant',
  VIEWER: 'Viewer',
};

// Define permissions for each role
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: {
    // User Management
    viewUsers: true,
    createUser: true,
    editUser: true,
    deleteUser: true,
    
    // Invoice Management
    viewInvoices: true,
    createInvoice: true,
    editInvoice: true,
    deleteInvoice: true,
    markAsPaid: true,
  },
  
  [ROLES.ACCOUNTANT]: {
    // User Management
    viewUsers: false,
    createUser: false,
    editUser: false,
    deleteUser: false,
    
    // Invoice Management
    viewInvoices: true,
    createInvoice: true,
    editInvoice: true,
    deleteInvoice: false,
    markAsPaid: true,
  },
  
  [ROLES.VIEWER]: {
    // User Management
    viewUsers: false,
    createUser: false,
    editUser: false,
    deleteUser: false,
    
    // Invoice Management
    viewInvoices: true,
    createInvoice: false,
    editInvoice: false,
    deleteInvoice: false,
    markAsPaid: false,
  },
};

// Role descriptions for UI
export const ROLE_DESCRIPTIONS = {
  [ROLES.ADMIN]: 'Full access to all features including user management',
  [ROLES.ACCOUNTANT]: 'Can create and edit invoices, mark as paid',
  [ROLES.VIEWER]: 'Can only view invoices',
};
