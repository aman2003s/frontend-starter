import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';
import { Index } from './components/Index';
import { RoleProtectedRoute } from './components/RoleProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import { Invoices } from './pages/Invoices';
import { CreateInvoice } from './pages/CreateInvoice';
import { EditInvoice } from './pages/EditInvoice';
import { ManageUsers } from './pages/ManageUsers';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignUp />
          </PublicRoute>
        }
      />

      <Route path="/" element={<Index />} />

      <Route
        path="/invoices"
        element={
          <ProtectedRoute>
            <Layout>
              <Invoices />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/invoices/create"
        element={
          <RoleProtectedRoute requiredRoles={['Admin', 'Accountant']}>
            <Layout>
              <CreateInvoice />
            </Layout>
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/invoices/:id/edit"
        element={
          <RoleProtectedRoute requiredRoles={['Admin', 'Accountant']}>
            <Layout>
              <EditInvoice />
            </Layout>
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/manage-users"
        element={
          <RoleProtectedRoute requiredRoles={['Admin']}>
            <Layout>
              <ManageUsers />
            </Layout>
          </RoleProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export function Root() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
