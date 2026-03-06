import bcrypt from 'bcryptjs';
import dayjs from 'dayjs';
import { createServer, Model } from 'miragejs';
import { runSeeds } from './seeds';
import { signAccessToken, signRefreshToken, verify } from './jwt';
import type { InvoiceStatus, UserRole } from '../../types';
import { ROLE_PERMISSIONS } from '../../types';

const STATUS_ORDER: Record<InvoiceStatus, number> = {
  Draft: 0,
  Sent: 1,
  Paid: 2
};

type InvoiceModel = {
  invoiceNumber: string;
  customerName: string;
  amount: number;
  status: InvoiceStatus;
  createdAt: number;
};

type SignupBody = { email?: string; password?: string; role?: string };
type LoginBody = { email?: string; password?: string };
type CreateInvoiceBody = { customerName?: string; amount?: number };
type UpdateInvoiceBody = { customerName?: string; amount?: number; status?: string };

const VALID_STATUSES: InvoiceStatus[] = ['Draft', 'Sent', 'Paid'];

const getAuthUser = async (authHeader: string | null): Promise<{ id: string } | null> => {
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const token = authHeader.slice(7);
    const payload = await verify(token);
    return payload as { id: string };
  } catch {
    return null;
  }
};

const getAuthHeader = (request: { requestHeaders: Record<string, string> }): string | null =>
  request.requestHeaders?.Authorization ?? request.requestHeaders?.authorization ?? null;

const REFRESH_COOKIE = 'refreshToken';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getRefreshTokenFromCookie(request: { requestHeaders: Record<string, string> }): string | null {
  const cookie = request.requestHeaders?.Cookie ?? request.requestHeaders?.cookie ?? '';
  const match = cookie.match(new RegExp(`${REFRESH_COOKIE}=([^;]+)`));
  return match ? match[1].trim() : null;
}

function authResponseHeaders(refreshToken: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'Set-Cookie': `${REFRESH_COOKIE}=${refreshToken}; HttpOnly; Path=/api; SameSite=Strict; Max-Age=${COOKIE_MAX_AGE}`
  };
}

function getQueryParam(
  params: Record<string, string[] | string | null | undefined>,
  key: string,
  fallback: string
): string {
  const val = params[key];
  if (val == null) return fallback;
  return Array.isArray(val) ? val[0] ?? fallback : val;
}

function toAuthUser(user: { id: string; email: string; role: UserRole; createdAt: number }) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    permissions: ROLE_PERMISSIONS[user.role],
    createdAt: user.createdAt
  };
}

function toJwtPayload(user: { id: string; email: string }) {
  return { id: user.id, email: user.email };
}

type SchemaLike = {
  findBy: (model: string, query: Record<string, unknown>) => { attrs: Record<string, unknown>; update: (attrs: Record<string, unknown>) => void; destroy: () => void } | null;
  all: (model: string) => { models: unknown[]; length: number };
  create: (model: string, attrs: Record<string, unknown>) => unknown;
};

type RouteHandler = (
  schema: SchemaLike,
  request: {
    requestBody: string;
    requestHeaders: Record<string, string>;
    params: Record<string, string>;
    queryParams: Record<string, string | string[] | null | undefined>;
  }
) => Promise<Response>;

const routeHandlers = new Map<string, RouteHandler>();

function reg(key: string, fn: RouteHandler): RouteHandler {
  routeHandlers.set(key, fn);
  return fn;
}

export const server = createServer({
  models: {
    user: Model.extend({
      email: '',
      passwordHashed: '',
      role: 'Viewer' as UserRole,
      createdAt: 0
    }),
    invoice: Model.extend({
      invoiceNumber: '',
      customerName: '',
      amount: 0,
      status: 'Draft' as InvoiceStatus,
      createdAt: 0
    })
  },

  routes() {
    this.namespace = 'api';

    this.post('/auth/signup', reg('POST /auth/signup', async (schema, request) => {
      const { email, password, role = 'Viewer' } = JSON.parse(
        request.requestBody
      ) as SignupBody;
      if (!email || !password) {
        return new Response(JSON.stringify({ error: 'Email and password are required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      if (password.length < 8) {
        return new Response(
          JSON.stringify({ error: 'Password must contain at least 8 characters' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return new Response(JSON.stringify({ error: 'Invalid email format' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      // MirageJS types are overly strict for findBy with dynamic attributes
      const existing = (schema as { findBy: (t: string, q: Record<string, unknown>) => unknown }).findBy('user', { email });
      if (existing) {
        return new Response(JSON.stringify({ error: 'Email already exists' }), {
          status: 409,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      const passwordHashed = bcrypt.hashSync(password, 8);
      const now = dayjs().valueOf();
      const user = (schema as { create: (t: string, a: Record<string, unknown>) => { id: string; email: string; role: UserRole; createdAt: number } }).create('user', {
        email,
        passwordHashed,
        role: role as UserRole,
        createdAt: now
      });
      const jwtPayload = toJwtPayload(user);
      const [accessToken, refreshToken] = await Promise.all([
        signAccessToken(jwtPayload),
        signRefreshToken(jwtPayload)
      ]);
      return new Response(
        JSON.stringify({
          token: accessToken,
          user: toAuthUser(user)
        }),
        { status: 201, headers: authResponseHeaders(refreshToken) }
      );
    }));

    this.post('/auth/login', reg('POST /auth/login', async (schema, request) => {
      const { email, password } = JSON.parse(request.requestBody) as LoginBody;
      if (!email || !password) {
        return new Response(JSON.stringify({ error: 'Email and password are required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      const user = (schema as { findBy: (t: string, q: Record<string, unknown>) => unknown }).findBy('user', { email }) as {
        id: string;
        email: string;
        passwordHashed: string;
        role: UserRole;
        createdAt: number;
      } | null;
      if (!user || !bcrypt.compareSync(password, user.passwordHashed)) {
        return new Response(
          JSON.stringify({ error: 'Invalid email or password' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
      const jwtPayload = toJwtPayload(user);
      const [accessToken, refreshToken] = await Promise.all([
        signAccessToken(jwtPayload),
        signRefreshToken(jwtPayload)
      ]);
      return new Response(
        JSON.stringify({
          token: accessToken,
          user: toAuthUser(user)
        }),
        { status: 200, headers: authResponseHeaders(refreshToken) }
      );
    }));

    this.post('/auth/refresh', reg('POST /auth/refresh', async (schema, request) => {
      const refreshToken = getRefreshTokenFromCookie(request);
      if (!refreshToken) {
        return new Response(JSON.stringify({ error: 'Refresh token required' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      try {
        const payload = await verify(refreshToken) as { id: string; email: string };
        const user = (schema as { findBy: (t: string, q: Record<string, unknown>) => unknown }).findBy('user', { id: payload.id }) as {
          id: string;
          email: string;
          role: UserRole;
          createdAt: number;
        } | null;
        if (!user) {
          return new Response(JSON.stringify({ error: 'User not found' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        const jwtPayload = toJwtPayload(user);
        const [newAccessToken, newRefreshToken] = await Promise.all([
          signAccessToken(jwtPayload),
          signRefreshToken(jwtPayload)
        ]);
        return new Response(
          JSON.stringify({
            token: newAccessToken,
            user: toAuthUser(user)
          }),
          { status: 200, headers: authResponseHeaders(newRefreshToken) }
        );
      } catch {
        return new Response(JSON.stringify({ error: 'Invalid or expired refresh token' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }));

    this.get('/auth/me', reg('GET /auth/me', async (schema, request) => {
      const payload = await getAuthUser(getAuthHeader(request));
      if (!payload) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      const user = (schema as { findBy: (t: string, q: Record<string, unknown>) => unknown }).findBy('user', { id: payload.id }) as {
        id: string;
        email: string;
        role: UserRole;
        createdAt: number;
      } | null;
      if (!user) {
        return new Response(JSON.stringify({ error: 'User not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return new Response(
        JSON.stringify(toAuthUser(user)),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }));

    this.get('/invoices', reg('GET /invoices', async (schema, request) => {
      const payload = await getAuthUser(getAuthHeader(request));
      if (!payload) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      const page = Math.max(
        1,
        parseInt(getQueryParam(request.queryParams, 'page', '1'), 10)
      );
      const limit = Math.min(
        50,
        Math.max(1, parseInt(getQueryParam(request.queryParams, 'limit', '10'), 10))
      );
      const search = getQueryParam(request.queryParams, 'search', '').toLowerCase().trim();
      const statusFilter = getQueryParam(request.queryParams, 'status', '');

      const invoiceModels = schema.all('invoice').models;
      let invoices = invoiceModels as unknown as Array<{
        id: string;
        invoiceNumber: string;
        customerName: string;
        amount: number;
        status: InvoiceStatus;
        createdAt: number;
      }>;

      if (search) {
        invoices = invoices.filter((inv) => inv.customerName.toLowerCase().includes(search));
      }
      if (statusFilter) {
        invoices = invoices.filter((inv) => inv.status === statusFilter);
      }

      invoices = [...invoices].sort((a, b) => {
        const statusDiff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
        if (statusDiff !== 0) return statusDiff;
        return b.createdAt - a.createdAt;
      });

      const totalCount = invoices.length;
      const start = (page - 1) * limit;
      const items = invoices.slice(start, start + limit).map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        customerName: inv.customerName,
        amount: inv.amount,
        status: inv.status,
        createdAt: inv.createdAt
      }));

      return new Response(
        JSON.stringify({ items, totalCount, page, limit }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }));

    this.get('/invoices/:id', reg('GET /invoices/:id', async (schema, request) => {
      const payload = await getAuthUser(getAuthHeader(request));
      if (!payload) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      const invoice = schema.findBy('invoice', { id: request.params.id });
      if (!invoice) {
        return new Response(JSON.stringify({ error: 'Invoice not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      const inv = invoice.attrs as InvoiceModel & { id: string };
      return new Response(
        JSON.stringify({
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          customerName: inv.customerName,
          amount: inv.amount,
          status: inv.status,
          createdAt: inv.createdAt
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }));

    this.post('/invoices', reg('POST /invoices', async (schema, request) => {
      const payload = await getAuthUser(getAuthHeader(request));
      if (!payload) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      const user = schema.findBy('user', { id: payload.id }) as { role: UserRole } | null;
      if (!user || (user.role !== 'Admin' && user.role !== 'Accountant')) {
        return new Response(JSON.stringify({ error: 'Forbidden: insufficient permissions' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      const { customerName, amount } = JSON.parse(
        request.requestBody
      ) as CreateInvoiceBody;
      if (!customerName || amount == null) {
        return new Response(
          JSON.stringify({ error: 'Customer name and amount are required' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      const count = schema.all('invoice').length;
      const invoiceNumber = `INV-${String(count + 1).padStart(5, '0')}`;
      const now = dayjs().valueOf();
      const db = schema as { create: (t: string, a: Record<string, unknown>) => Record<string, unknown> & { id: string } };
      const invoice = db.create('invoice', {
        invoiceNumber,
        customerName: String(customerName).trim(),
        amount: Number(amount),
        status: 'Draft',
        createdAt: now
      }) as { id: string } & InvoiceModel;
      return new Response(
        JSON.stringify({
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          customerName: invoice.customerName,
          amount: invoice.amount,
          status: invoice.status,
          createdAt: invoice.createdAt
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      );
    }));

    this.patch('/invoices/:id', reg('PATCH /invoices/:id', async (schema, request) => {
      const payload = await getAuthUser(getAuthHeader(request));
      if (!payload) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      const user = schema.findBy('user', { id: payload.id }) as { role: UserRole } | null;
      if (!user || (user.role !== 'Admin' && user.role !== 'Accountant')) {
        return new Response(JSON.stringify({ error: 'Forbidden: insufficient permissions' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      const invoice = schema.findBy('invoice', { id: request.params.id });
      if (!invoice) {
        return new Response(JSON.stringify({ error: 'Invoice not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      const body = JSON.parse(request.requestBody) as UpdateInvoiceBody;
      const updates: Partial<InvoiceModel> = {};
      if (body.customerName != null) updates.customerName = String(body.customerName).trim();
      if (body.amount != null) updates.amount = Number(body.amount);
      if (body.status != null) {
        const newStatus = body.status;
        if (!VALID_STATUSES.includes(newStatus as InvoiceStatus)) {
          return new Response(
            JSON.stringify({ error: `Invalid status: ${newStatus}` }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }
        const current = (invoice.attrs as InvoiceModel).status;
        const validTransitions: Record<InvoiceStatus, InvoiceStatus[]> = {
          Draft: ['Sent'],
          Sent: ['Paid'],
          Paid: []
        };
        if (!validTransitions[current]?.includes(newStatus as InvoiceStatus)) {
          return new Response(
            JSON.stringify({ error: `Invalid status transition: ${current} -> ${newStatus}` }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }
        updates.status = newStatus as InvoiceStatus;
      }
      invoice.update(updates);
      const inv = invoice.attrs as InvoiceModel & { id: string; invoiceNumber: string; createdAt: number };
      return new Response(
        JSON.stringify({
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          customerName: inv.customerName,
          amount: inv.amount,
          status: inv.status,
          createdAt: inv.createdAt
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }));

    this.delete('/invoices/:id', reg('DELETE /invoices/:id', async (schema, request) => {
      const payload = await getAuthUser(getAuthHeader(request));
      if (!payload) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      const user = schema.findBy('user', { id: payload.id }) as { role: UserRole } | null;
      if (!user || user.role !== 'Admin') {
        return new Response(JSON.stringify({ error: 'Forbidden: only Admin can delete invoices' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      const invoice = schema.findBy('invoice', { id: request.params.id });
      if (!invoice) {
        return new Response(JSON.stringify({ error: 'Invoice not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      invoice.destroy();
      return new Response(null, { status: 204 });
    }));
  },

  seeds(mirageServer) {
    runSeeds(mirageServer as { create: (type: string, attrs: Record<string, unknown>) => void });
  }
});

export async function invoke(
  method: string,
  path: string,
  opts?: {
    body?: object;
    headers?: Record<string, string>;
    params?: Record<string, string>;
    queryParams?: Record<string, string>;
  }
): Promise<Response> {
  const pathKey =
    path.match(/^\/invoices\/([^/]+)$/) && path !== '/invoices'
      ? '/invoices/:id'
      : path;
  const key = `${method} ${pathKey}`;
  const handler = routeHandlers.get(key);
  if (!handler) throw new Error(`No handler for ${key}`);
  const params =
    pathKey === '/invoices/:id'
      ? { id: opts?.params?.id ?? path.split('/').pop() ?? '' }
      : opts?.params ?? {};
  const request = {
    requestBody: opts?.body ? JSON.stringify(opts.body) : '{}',
    requestHeaders: opts?.headers ?? {},
    params,
    queryParams: (opts?.queryParams ?? {}) as Record<
      string,
      string | string[] | null | undefined
    >
  };
  return handler(server.schema as SchemaLike, request);
}
