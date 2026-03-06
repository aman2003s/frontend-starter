import { describe, expect, it } from 'vitest';
import { ROLE_PERMISSIONS } from '../types';

describe('ROLE_PERMISSIONS', () => {
  it('Admin has all permissions', () => {
    const adminPerms = ROLE_PERMISSIONS.Admin as string[];
    expect(adminPerms).toContain('users:manage');
    expect(adminPerms).toContain('invoices:create');
    expect(adminPerms).toContain('invoices:read');
    expect(adminPerms).toContain('invoices:update');
    expect(adminPerms).toContain('invoices:delete');
  });

  it('Accountant has create, read, update', () => {
    const perms = ROLE_PERMISSIONS.Accountant as string[];
    expect(perms).toContain('invoices:create');
    expect(perms).toContain('invoices:read');
    expect(perms).toContain('invoices:update');
    expect(perms).not.toContain('invoices:delete');
  });

  it('Viewer has read only', () => {
    const perms = ROLE_PERMISSIONS.Viewer as string[];
    expect(perms).toEqual(['invoices:read']);
  });
});
