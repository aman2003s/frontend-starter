// Role definitions and permissions
export const ROLES = {
  ADMIN: 'Admin',
  ACCOUNTANT: 'Accountant',
  VIEWER: 'Viewer',
};

// Permission definitions
export const PERMISSIONS = {
  CREATE_INVOICE: 'create_invoice',
  READ_INVOICE: 'read_invoice',
  UPDATE_INVOICE: 'update_invoice',
  DELETE_INVOICE: 'delete_invoice',
  MARK_PAID: 'mark_paid',
  MANAGE_USERS: 'manage_users',
};

// Role to permissions mapping
export const rolePermissions = {
  [ROLES.ADMIN]: [
    PERMISSIONS.CREATE_INVOICE,
    PERMISSIONS.READ_INVOICE,
    PERMISSIONS.UPDATE_INVOICE,
    PERMISSIONS.DELETE_INVOICE,
    PERMISSIONS.MARK_PAID,
    PERMISSIONS.MANAGE_USERS,
  ],
  [ROLES.ACCOUNTANT]: [
    PERMISSIONS.CREATE_INVOICE,
    PERMISSIONS.READ_INVOICE,
    PERMISSIONS.UPDATE_INVOICE,
    PERMISSIONS.MARK_PAID,
  ],
  [ROLES.VIEWER]: [PERMISSIONS.READ_INVOICE],
};

// Helper function to check if user has permission
export function hasPermission(userRole, permission) {
  const permissions = rolePermissions[userRole] || [];
  return permissions.includes(permission);
}

// Helper function to check if user can perform action
export function canCreate(userRole) {
  return hasPermission(userRole, PERMISSIONS.CREATE_INVOICE);
}

export function canRead(userRole) {
  return hasPermission(userRole, PERMISSIONS.READ_INVOICE);
}

export function canUpdate(userRole) {
  return hasPermission(userRole, PERMISSIONS.UPDATE_INVOICE);
}

export function canDelete(userRole) {
  return hasPermission(userRole, PERMISSIONS.DELETE_INVOICE);
}

export function canMarkPaid(userRole) {
  return hasPermission(userRole, PERMISSIONS.MARK_PAID);
}

export function canManageUsers(userRole) {
  return hasPermission(userRole, PERMISSIONS.MANAGE_USERS);
}
