import { ROLE_PERMISSIONS } from '../constants/roles';

/**
 * Permission mapping between UI names and backend permission strings
 */
export const PERMISSION_MAP = {
  viewInvoices: 'invoices:read',
  createInvoice: 'invoices:create',
  editInvoice: 'invoices:update',
  deleteInvoice: 'invoices:delete',
  markAsPaid: 'invoices:update',
  viewUsers: 'users:read',
  manageUsers: 'users:manage',
};

/**
 * Check if a user has a specific permission
 * Works with both role-based permissions (legacy) and user permission arrays (backend)
 * @param {string} roleOrPermissions - User role (string) or permissions array
 * @param {string} permission - Permission to check
 * @returns {boolean}
 * @deprecated Use usePermission hook instead for new code
 */
export function hasPermission(roleOrPermissions, permission) {
  // If it's an array of permissions (from user object)
  if (Array.isArray(roleOrPermissions)) {
    const backendPermission = PERMISSION_MAP[permission];
    if (backendPermission) {
      return roleOrPermissions.includes(backendPermission);
    }
    return roleOrPermissions.includes(permission);
  }

  // Legacy role-based checking
  const role = roleOrPermissions;
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.[permission] || false;
}

/**
 * Check if a user has any of the provided permissions
 * @param {string|string[]} roleOrPermissions - User role or permissions array
 * @param {string[]} permissions - Permissions to check
 * @returns {boolean}
 * @deprecated Use usePermission hook instead for new code
 */
export function hasAnyPermission(roleOrPermissions, permissions) {
  return permissions.some((permission) => hasPermission(roleOrPermissions, permission));
}

/**
 * Check if a user has all of the provided permissions
 * @param {string|string[]} roleOrPermissions - User role or permissions array
 * @param {string[]} permissions - Permissions to check
 * @returns {boolean}
 * @deprecated Use usePermission hook instead for new code
 */
export function hasAllPermissions(roleOrPermissions, permissions) {
  return permissions.every((permission) => hasPermission(roleOrPermissions, permission));
}

/**
 * Get all permissions for a role (legacy)
 * @param {string} role - User role
 * @returns {Object}
 * @deprecated Use user.permissions from user object instead
 */
export function getRolePermissions(role) {
  return ROLE_PERMISSIONS[role] || {};
}
