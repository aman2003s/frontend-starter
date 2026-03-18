import { hasPermission, hasAnyPermission, PERMISSION_MAP } from '../utils/permissions';

describe('permissions', () => {
  describe('hasPermission', () => {
    test('returns true for admin role with viewInvoices permission', () => {
      expect(hasPermission('Admin', 'viewInvoices')).toBe(true);
    });

    test('returns false for accountant role with manageUsers permission', () => {
      expect(hasPermission('Accountant', 'manageUsers')).toBe(false);
    });

    test('returns true for permissions array containing the required permission', () => {
      const permissions = ['invoices:read', 'invoices:create'];
      expect(hasPermission(permissions, 'viewInvoices')).toBe(true);
    });

    test('returns false for permissions array not containing the required permission', () => {
      const permissions = ['invoices:read'];
      expect(hasPermission(permissions, 'manageUsers')).toBe(false);
    });
  });

  describe('hasAnyPermission', () => {
    test('returns true if user has at least one of the permissions', () => {
      expect(hasAnyPermission('Admin', ['viewInvoices', 'manageUsers'])).toBe(true);
    });

    test('returns false if user has none of the permissions', () => {
      expect(hasAnyPermission('Accountant', ['manageUsers'])).toBe(false);
    });
  });

  describe('PERMISSION_MAP', () => {
    test('maps viewInvoices to invoices:read', () => {
      expect(PERMISSION_MAP.viewInvoices).toBe('invoices:read');
    });
  });
});