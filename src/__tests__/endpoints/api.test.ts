/**
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { invoke, server } from '../../libraries/server';

function api(
  method: string,
  path: string,
  opts?: { body?: object; headers?: Record<string, string>; queryParams?: Record<string, string> }
) {
  return invoke(method, path, opts);
}

function withAuth(token: string) {
  return (
    method: string,
    path: string,
    opts?: { body?: object; queryParams?: Record<string, string> }
  ) =>
    api(method, path, {
      ...opts,
      headers: { Authorization: `Bearer ${token}` }
    });
}

function getCookie(res: Response, name: string): string | null {
  const setCookie = res.headers.get('set-cookie');
  if (!setCookie) return null;
  const match = setCookie.match(new RegExp(`${name}=([^;]+)`));
  return match ? match[1].trim() : null;
}

describe('Auth endpoints', () => {
  it('POST /auth/login - succeeds with valid credentials', async () => {
    const res = await api('POST', '/auth/login', {
      body: { email: 'admin@example.com', password: 'password123' }
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.token).toBeDefined();
    expect(data.user).toMatchObject({
      email: 'admin@example.com',
      role: 'Admin',
      permissions: expect.any(Array)
    });
    expect(getCookie(res, 'refreshToken')).toBeTruthy();
  });

  it('POST /auth/login - fails with invalid credentials', async () => {
    const res = await api('POST', '/auth/login', {
      body: { email: 'admin@example.com', password: 'wrong' }
    });
    expect(res.status).toBe(401);
  });

  it('POST /auth/signup - creates user and returns token', async () => {
    const res = await api('POST', '/auth/signup', {
      body: { email: 'new@example.com', password: 'password123', role: 'Viewer' }
    });
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.token).toBeDefined();
    expect(data.user).toMatchObject({
      email: 'new@example.com',
      role: 'Viewer'
    });
  });

  it('POST /auth/signup - fails when email exists', async () => {
    await api('POST', '/auth/signup', {
      body: { email: 'dup@example.com', password: 'password123' }
    });
    const res = await api('POST', '/auth/signup', {
      body: { email: 'dup@example.com', password: 'password123' }
    });
    expect(res.status).toBe(409);
  });

  it('POST /auth/signup - fails with missing email or password', async () => {
    const res1 = await api('POST', '/auth/signup', { body: { password: 'password123' } });
    expect(res1.status).toBe(400);
    const res2 = await api('POST', '/auth/signup', { body: { email: 'a@b.com' } });
    expect(res2.status).toBe(400);
  });

  it('POST /auth/signup - fails with short password', async () => {
    const res = await api('POST', '/auth/signup', {
      body: { email: 'short@example.com', password: 'short' }
    });
    expect(res.status).toBe(400);
  });

  it('POST /auth/signup - fails with invalid email format', async () => {
    const res = await api('POST', '/auth/signup', {
      body: { email: 'notanemail', password: 'password123' }
    });
    expect(res.status).toBe(400);
  });

  it('POST /auth/login - fails with missing email or password', async () => {
    const res = await api('POST', '/auth/login', { body: { email: 'admin@example.com' } });
    expect(res.status).toBe(400);
  });

  it('POST /auth/refresh - fails with invalid refresh token', async () => {
    const res = await api('POST', '/auth/refresh', {
      headers: { Cookie: 'refreshToken=invalid-jwt-token' }
    });
    expect(res.status).toBe(401);
  });

  it('GET /auth/me - returns user with valid token', async () => {
    const loginRes = await api('POST', '/auth/login', {
      body: { email: 'admin@example.com', password: 'password123' }
    });
    const { token } = await loginRes.json();
    const res = await api('GET', '/auth/me', { headers: { Authorization: `Bearer ${token}` } });
    expect(res.status).toBe(200);
    const user = await res.json();
    expect(user.email).toBe('admin@example.com');
    expect(user.role).toBe('Admin');
  });

  it('GET /auth/me - returns 401 without token', async () => {
    const res = await api('GET', '/auth/me');
    expect(res.status).toBe(401);
  });

  it('POST /auth/refresh - returns new access token with valid refresh cookie', async () => {
    const loginRes = await api('POST', '/auth/login', {
      body: { email: 'admin@example.com', password: 'password123' }
    });
    const refreshToken = getCookie(loginRes, 'refreshToken');
    expect(refreshToken).toBeTruthy();

    const refreshRes = await api('POST', '/auth/refresh', {
      headers: { Cookie: `refreshToken=${refreshToken!}` }
    });
    expect(refreshRes.status).toBe(200);
    const data = await refreshRes.json();
    expect(data.token).toBeDefined();
    expect(data.user).toMatchObject({ email: 'admin@example.com', role: 'Admin' });
  });

  it('POST /auth/refresh - fails without refresh cookie', async () => {
    const res = await api('POST', '/auth/refresh');
    expect(res.status).toBe(401);
  });

  it('POST /auth/refresh - returns 401 when user no longer exists', async () => {
    const signupRes = await api('POST', '/auth/signup', {
      body: { email: 'ghost@example.com', password: 'password123' }
    });
    const { user } = await signupRes.json();
    const refreshToken = getCookie(signupRes, 'refreshToken');
    expect(refreshToken).toBeTruthy();

    const userRecord = server.schema.findBy('user', { id: user.id });
    if (userRecord) (userRecord as { destroy: () => void }).destroy();

    const res = await api('POST', '/auth/refresh', {
      headers: { Cookie: `refreshToken=${refreshToken!}` }
    });
    expect(res.status).toBe(401);
  });

  it('GET /auth/me - returns 404 when user no longer exists', async () => {
    const signupRes = await api('POST', '/auth/signup', {
      body: { email: 'ghost2@example.com', password: 'password123' }
    });
    const { token, user } = await signupRes.json();

    const userRecord = server.schema.findBy('user', { id: user.id });
    if (userRecord) (userRecord as { destroy: () => void }).destroy();

    const res = await api('GET', '/auth/me', { headers: { Authorization: `Bearer ${token}` } });
    expect(res.status).toBe(404);
  });
});

describe('Invoice CRUD by role', () => {
  let adminToken: string;
  let accountantToken: string;
  let viewerToken: string;

  beforeEach(async () => {
    const [adminRes, accountantRes, viewerRes] = await Promise.all([
      api('POST', '/auth/login', { body: { email: 'admin@example.com', password: 'password123' } }),
      api('POST', '/auth/login', { body: { email: 'accountant@example.com', password: 'password123' } }),
      api('POST', '/auth/login', { body: { email: 'viewer@example.com', password: 'password123' } })
    ]);

    adminToken = (await adminRes.json()).token;
    accountantToken = (await accountantRes.json()).token;
    viewerToken = (await viewerRes.json()).token;
  });

  it('Admin - can create, read, update, delete invoices', async () => {
    const authed = withAuth(adminToken);

    const createRes = await authed('POST', '/invoices', {
      body: { customerName: 'Test Corp', amount: 1000 }
    });
    expect(createRes.status).toBe(201);
    const created = await createRes.json();
    expect(created.invoiceNumber).toBeDefined();
    expect(created.status).toBe('Draft');

    const listRes = await authed('GET', '/invoices');
    expect(listRes.status).toBe(200);
    const list = await listRes.json();
    expect(list.items.length).toBeGreaterThan(0);

    const updateRes = await authed('PATCH', `/invoices/${created.id}`, {
      body: { status: 'Sent' }
    });
    expect(updateRes.status).toBe(200);

    const deleteRes = await authed('DELETE', `/invoices/${created.id}`);
    expect(deleteRes.status).toBe(204);
  });

  it('Accountant - can create, read, update but NOT delete', async () => {
    const authed = withAuth(accountantToken);

    const createRes = await authed('POST', '/invoices', {
      body: { customerName: 'Acct Corp', amount: 500 }
    });
    expect(createRes.status).toBe(201);
    const created = await createRes.json();

    const updateRes = await authed('PATCH', `/invoices/${created.id}`, {
      body: { status: 'Sent' }
    });
    expect(updateRes.status).toBe(200);

    const deleteRes = await authed('DELETE', `/invoices/${created.id}`);
    expect(deleteRes.status).toBe(403);
  });

  it('Viewer - can only read, cannot create, update, or delete', async () => {
    const authed = withAuth(viewerToken);

    const listRes = await authed('GET', '/invoices');
    expect(listRes.status).toBe(200);
    const { items } = await listRes.json();

    const createRes = await authed('POST', '/invoices', {
      body: { customerName: 'View Corp', amount: 100 }
    });
    expect(createRes.status).toBe(403);

    if (items.length > 0) {
      const updateRes = await authed('PATCH', `/invoices/${items[0].id}`, {
        body: { customerName: 'Hacked' }
      });
      expect(updateRes.status).toBe(403);

      const deleteRes = await authed('DELETE', `/invoices/${items[0].id}`);
      expect(deleteRes.status).toBe(403);
    }
  });
});

describe('Authorization restrictions', () => {
  it('GET /invoices - returns 401 without token', async () => {
    const res = await api('GET', '/invoices');
    expect(res.status).toBe(401);
  });

  it('GET /invoices/:id - returns 401 without token', async () => {
    const loginRes = await api('POST', '/auth/login', {
      body: { email: 'admin@example.com', password: 'password123' }
    });
    const { token } = await loginRes.json();
    const authed = withAuth(token);
    const listRes = await authed('GET', '/invoices');
    const { items } = await listRes.json();
    const invoiceId = items[0]?.id;
    expect(invoiceId).toBeDefined();
    const noAuthRes = await api('GET', `/invoices/${invoiceId}`);
    expect(noAuthRes.status).toBe(401);
  });

  it('Invalid token - returns 401', async () => {
    const res = await api('GET', '/invoices', {
      headers: { Authorization: 'Bearer invalid-token' }
    });
    expect(res.status).toBe(401);
  });
});

describe('Invoice edge cases', () => {
  let adminToken: string;

  beforeEach(async () => {
    const res = await api('POST', '/auth/login', {
      body: { email: 'admin@example.com', password: 'password123' }
    });
    adminToken = (await res.json()).token;
  });

  const authed = (token: string) => (method: string, path: string, opts?: { body?: object; queryParams?: Record<string, string> }) =>
    api(method, path, { ...opts, headers: { Authorization: `Bearer ${token}` } });

  it('GET /invoices - filters by search', async () => {
    const res = await authed(adminToken)('GET', '/invoices', { queryParams: { search: 'Acme' } });
    expect(res.status).toBe(200);
    const { items } = await res.json();
    expect(items.every((i: { customerName: string }) => i.customerName.toLowerCase().includes('acme'))).toBe(true);
  });

  it('GET /invoices - filters by status', async () => {
    const res = await authed(adminToken)('GET', '/invoices', { queryParams: { status: 'Draft' } });
    expect(res.status).toBe(200);
    const { items } = await res.json();
    expect(items.every((i: { status: string }) => i.status === 'Draft')).toBe(true);
  });

  it('GET /invoices - pagination with page and limit', async () => {
    const res = await authed(adminToken)('GET', '/invoices', { queryParams: { page: '2', limit: '1' } });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.page).toBe(2);
    expect(data.limit).toBe(1);
  });

  it('POST /invoices - fails when customerName or amount missing', async () => {
    const r1 = await authed(adminToken)('POST', '/invoices', { body: { amount: 100 } });
    expect(r1.status).toBe(400);
    const r2 = await authed(adminToken)('POST', '/invoices', { body: { customerName: 'Test' } });
    expect(r2.status).toBe(400);
  });

  it('PATCH /invoices/:id - invalid status value', async () => {
    const listRes = await authed(adminToken)('GET', '/invoices');
    const { items } = await listRes.json();
    const draftId = items.find((i: { status: string }) => i.status === 'Draft')?.id;
    const res = await authed(adminToken)('PATCH', `/invoices/${draftId}`, { body: { status: 'Invalid' } });
    expect(res.status).toBe(400);
  });

  it('PATCH /invoices/:id - invalid status transition Draft to Paid', async () => {
    const listRes = await authed(adminToken)('GET', '/invoices');
    const { items } = await listRes.json();
    const draftId = items.find((i: { status: string }) => i.status === 'Draft')?.id;
    const res = await authed(adminToken)('PATCH', `/invoices/${draftId}`, { body: { status: 'Paid' } });
    expect(res.status).toBe(400);
  });

  it('PATCH /invoices/:id - updates customerName and amount', async () => {
    const createRes = await authed(adminToken)('POST', '/invoices', { body: { customerName: 'Patch Corp', amount: 999 } });
    const { id } = await createRes.json();
    const res = await authed(adminToken)('PATCH', `/invoices/${id}`, {
      body: { customerName: 'Updated Corp', amount: 1234 }
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.customerName).toBe('Updated Corp');
    expect(data.amount).toBe(1234);
  });

  it('PATCH /invoices/:id - 404 when invoice not found', async () => {
    const res = await authed(adminToken)('PATCH', '/invoices/nonexistent-id', { body: { status: 'Sent' } });
    expect(res.status).toBe(404);
  });

  it('PATCH /invoices/:id - 404 when invoice was deleted', async () => {
    const createRes = await authed(adminToken)('POST', '/invoices', { body: { customerName: 'To Delete', amount: 1 } });
    const { id } = await createRes.json();
    await authed(adminToken)('DELETE', `/invoices/${id}`);
    const res = await authed(adminToken)('PATCH', `/invoices/${id}`, { body: { status: 'Sent' } });
    expect(res.status).toBe(404);
  });

  it('GET /invoices/:id - 404 when invoice not found', async () => {
    const res = await authed(adminToken)('GET', '/invoices/nonexistent-id');
    expect(res.status).toBe(404);
  });

  it('DELETE /invoices/:id - 404 when invoice not found', async () => {
    const res = await authed(adminToken)('DELETE', '/invoices/nonexistent-id');
    expect(res.status).toBe(404);
  });

  it('DELETE /invoices/:id - 404 when invoice was already deleted', async () => {
    const createRes = await authed(adminToken)('POST', '/invoices', { body: { customerName: 'To Delete', amount: 1 } });
    const { id } = await createRes.json();
    await authed(adminToken)('DELETE', `/invoices/${id}`);
    const res = await authed(adminToken)('DELETE', `/invoices/${id}`);
    expect(res.status).toBe(404);
  });

  it('PATCH /invoices/:id - valid transition Sent to Paid', async () => {
    const listRes = await authed(adminToken)('GET', '/invoices');
    const { items } = await listRes.json();
    const sentId = items.find((i: { status: string }) => i.status === 'Sent')?.id;
    expect(sentId).toBeDefined();
    const res = await authed(adminToken)('PATCH', `/invoices/${sentId}`, { body: { status: 'Paid' } });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('Paid');
  });
});
