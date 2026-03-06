# Invoice Management - Frontend Task

Starter boilerplate for the Invoice Management Web Application task.

## Setup

- **MUI** – Material UI for components
- **Airbnb** – ESLint style guide (airbnb, airbnb-typescript, airbnb/hooks)
- **Prettier** – Code formatting
- **Commitizen** – Conventional commits (`pnpm commit`)
- **lint-staged** – Lint/format on commit
- **Vitest** – Unit testing

## Run

```bash
pnpm install
pnpm dev
```

## Mock API (REST)

Base URL: `/api`. All protected routes require `Authorization: Bearer <token>`.

### Auth

| Method | Endpoint         | Body                          | Response              |
|--------|------------------|-------------------------------|-----------------------|
| POST   | `/api/auth/signup`   | `{ email, password, role? }` | `{ token, user }` + `Set-Cookie: refreshToken` (HttpOnly) |
| POST   | `/api/auth/login`   | `{ email, password }`         | `{ token, user }` + `Set-Cookie: refreshToken` (HttpOnly) |
| POST   | `/api/auth/refresh` | - (sends `refreshToken` cookie) | `{ token, user }` + new `Set-Cookie` |
| GET    | `/api/auth/me`      | -                             | `{ id, email, role, createdAt }` |

- **Access token** (`token`): 15 min expiry, returned in JSON body. Use in `Authorization: Bearer <token>`.
- **Refresh token**: 7 day expiry, sent via HttpOnly cookie. Call `/auth/refresh` with `credentials: 'include'` to get a new access token.

**Roles:** `Admin` \| `Accountant` \| `Viewer`

### Invoices

| Method | Endpoint           | Query / Body | RBAC                    |
|--------|--------------------|--------------|-------------------------|
| GET    | `/api/invoices`    | `page`, `limit`, `search`, `status` | All authenticated      |
| GET    | `/api/invoices/:id`| -            | All authenticated      |
| POST   | `/api/invoices`    | `{ customerName, amount }` | Admin, Accountant      |
| PATCH  | `/api/invoices/:id`| `{ customerName?, amount?, status? }` | Admin, Accountant      |
| DELETE | `/api/invoices/:id`| -            | Admin only              |

**Status:** `Draft` → `Sent` → `Paid`

**List response:** `{ items, totalCount, page, limit }`

### Seeded Users (password: `password123`)

- `admin@example.com` – Admin
- `accountant@example.com` – Accountant
- `viewer@example.com` – Viewer

## Types

See `src/types/index.ts` for `User`, `Invoice`, `AuthResponse`, `PaginatedInvoices`.
