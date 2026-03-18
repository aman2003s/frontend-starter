const API_BASE = 'https://backend-starter-nu.vercel.app/api';

const request = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = localStorage.getItem('access_token');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle token refresh on 401
  if (response.status === 401 && options.method !== 'POST' && options.method !== 'PATCH') {
    try {
      const refreshResponse = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        localStorage.setItem('access_token', data.access_token);
        if (data.refresh_token) {
          localStorage.setItem('refresh_token', data.refresh_token);
        }

        headers.Authorization = `Bearer ${data.access_token}`;
        response = await fetch(`${API_BASE}${endpoint}`, {
          ...options,
          headers,
        });
      } else {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.dispatchEvent(new Event('auth:logout'));
      }
    } catch (error) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.dispatchEvent(new Event('auth:logout'));
      throw error;
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const err = new Error(error.message || `API Error: ${response.statusText}`);
    err.response = { status: response.status, data: error };
    throw err;
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }

  return response.json();
};

export const invoiceService = {
  // GET /invoices?page=1&limit=10&search=&status=
  // Get all invoices with pagination, search, and filter
  async getInvoices(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);

    const query = queryParams.toString();
    return request(`/invoices${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
  },

  // GET /invoices/:id
  // Get single invoice by ID
  async getInvoice(id) {
    return request(`/invoices/${id}`, {
      method: 'GET',
    });
  },

  // POST /invoices
  // Create new invoice
  // Required fields: customerName, amount
  async createInvoice(data) {
    const payload = {
      customerName: data.customerName,
      amount: data.amount,
    };
    
    return request('/invoices', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // PATCH /invoices/:id
  // Update invoice with customerName, amount, and status
  async updateInvoice(id, data) {
    const payload = {
      customerName: data.customerName,
      amount: data.amount,
      ...(data.status && { status: data.status }),
    };

    return request(`/invoices/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  // DELETE /invoices/:id
  // Delete invoice
  async deleteInvoice(id) {
    return request(`/invoices/${id}`, {
      method: 'DELETE',
    });
  },

  // PATCH /invoices/:id
  // Update invoice status
  async updateInvoiceStatus(id, status) {
    return request(`/invoices/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};
