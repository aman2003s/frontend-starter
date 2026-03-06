import bcrypt from 'bcryptjs';
import dayjs from 'dayjs';

export function runSeeds(mirageServer: { create: (type: string, attrs: Record<string, unknown>) => void }) {
  const now = dayjs().valueOf();
  const create = mirageServer.create.bind(mirageServer);
  create('user', {
    email: 'admin@example.com',
    passwordHashed: bcrypt.hashSync('password123', 8),
    role: 'Admin',
    createdAt: now
  } as Record<string, unknown>);
  create('user', {
    email: 'accountant@example.com',
    passwordHashed: bcrypt.hashSync('password123', 8),
    role: 'Accountant',
    createdAt: now
  } as Record<string, unknown>);
  create('user', {
    email: 'viewer@example.com',
    passwordHashed: bcrypt.hashSync('password123', 8),
    role: 'Viewer',
    createdAt: now
  } as Record<string, unknown>);
  create('invoice', {
    invoiceNumber: 'INV-00001',
    customerName: 'Acme Corp',
    amount: 1500,
    status: 'Paid',
    createdAt: now - 86400000 * 3
  } as Record<string, unknown>);
  create('invoice', {
    invoiceNumber: 'INV-00002',
    customerName: 'Beta Inc',
    amount: 2300,
    status: 'Sent',
    createdAt: now - 86400000 * 2
  } as Record<string, unknown>);
  create('invoice', {
    invoiceNumber: 'INV-00003',
    customerName: 'Gamma LLC',
    amount: 890,
    status: 'Draft',
    createdAt: now - 86400000
  } as Record<string, unknown>);
}
