import { useAuth } from './useAuth';

/**
 * Map UI permission names to backend permission strings
 */
const PERMISSION_MAP = {
  viewInvoices: 'invoices:read',
  createInvoice: 'invoices:create',
  editInvoice: 'invoices:update',
  deleteInvoice: 'invoices:delete',
  markAsPaid: 'invoices:update',
  viewUsers: 'users:read',
  manageUsers: 'users:manage',
};

/**
 * Custom hook to check user permissions
 * Uses the actual permissions from the user object returned by the backend
 * @returns {Object} Permission checking utilities
 */
export function usePermission() {
  const { user } = useAuth();
  const userPermissions = user?.permissions || [];

  /**
   * Check if user has a specific permission
   * @param {string} permission - Permission name (UI name, e.g., 'viewInvoices')
   * @returns {boolean}
   */
  const can = (permission) => {
    const backendPermission = PERMISSION_MAP[permission];
    if (!backendPermission) {
      // If no mapping exists, check directly
      return userPermissions.includes(permission);
    }
    return userPermissions.includes(backendPermission);
  };

  /**
   * Check if user has any of the provided permissions
   * @param {string[]} permissions - Permission names to check
   * @returns {boolean}
   */
  const canAny = (permissions) => {
    return permissions.some((permission) => can(permission));
  };

  /**
   * Check if user has all of the provided permissions
   * @param {string[]} permissions - Permission names to check
   * @returns {boolean}
   */
  const canAll = (permissions) => {
    return permissions.every((permission) => can(permission));
  };

  /**
   * Check if user has a specific role
   * @param {string|string[]} roles - Role(s) to check
   * @returns {boolean}
   */
  const isRole = (roles) => {
    const role = user?.role;
    if (!role) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(role);
  };

  return {
    can,
    canAny,
    canAll,
    isRole,
    role: user?.role,
    permissions: userPermissions,
  };
}
