import { hasPermission, canCreate, canRead, ROLES, PERMISSIONS } from '../utils/roles';

describe('roles', () => {
  describe('hasPermission', () => {
    test('returns true for admin with create_invoice permission', () => {
      expect(hasPermission(ROLES.ADMIN, PERMISSIONS.CREATE_INVOICE)).toBe(true);
    });

    test('returns false for viewer with create_invoice permission', () => {
      expect(hasPermission(ROLES.VIEWER, PERMISSIONS.CREATE_INVOICE)).toBe(false);
    });

    test('returns true for accountant with read_invoice permission', () => {
      expect(hasPermission(ROLES.ACCOUNTANT, PERMISSIONS.READ_INVOICE)).toBe(true);
    });
  });

  describe('canCreate', () => {
    test('returns true for admin', () => {
      expect(canCreate(ROLES.ADMIN)).toBe(true);
    });

    test('returns true for accountant', () => {
      expect(canCreate(ROLES.ACCOUNTANT)).toBe(true);
    });

    test('returns false for viewer', () => {
      expect(canCreate(ROLES.VIEWER)).toBe(false);
    });
  });

  describe('canRead', () => {
    test('returns true for all roles', () => {
      expect(canRead(ROLES.ADMIN)).toBe(true);
      expect(canRead(ROLES.ACCOUNTANT)).toBe(true);
      expect(canRead(ROLES.VIEWER)).toBe(true);
    });
  });
});