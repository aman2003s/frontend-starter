const API_URL = 'https://backend-starter-nu.vercel.app/api/auth';

const createApiClient = () => {
  const getToken = () => localStorage.getItem('access_token');
  const getRefreshToken = () => localStorage.getItem('refresh_token');

  const request = async (endpoint, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    let response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle token refresh on 401
    if (response.status === 401 && options.method !== 'POST') {
      try {
        const refreshToken = getRefreshToken();
        const refreshResponse = await fetch(`${API_URL}/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: refreshToken ? JSON.stringify({ refresh_token: refreshToken }) : undefined,
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          localStorage.setItem('access_token', data.access_token);
          if (data.refresh_token) {
            localStorage.setItem('refresh_token', data.refresh_token);
          }

          // Retry original request with new token
          headers.Authorization = `Bearer ${data.access_token}`;
          response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
          });
        } else {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      } catch (error) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        throw error;
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const err = new Error(error.message || `API Error: ${response.statusText}`);
      err.response = { status: response.status, data: error };
      throw err;
    }

    return response.json();
  };

  return { request, getToken };
};

const { request, getToken } = createApiClient();

export const authService = {
  async signup(data) {
    try {
      console.log('Signing up with:', data);
      const response = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('Signup response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Signup error response:', errorData);
        throw new Error(errorData.message || 'Signup failed');
      }

      const responseData = await response.json();
      console.log('Signup response data:', responseData);

      // Backend returns 'token' not 'access_token'
      const accessToken = responseData.token || responseData.access_token;
      if (accessToken) {
        console.log('Saving access token');
        localStorage.setItem('access_token', accessToken);
        if (responseData.refresh_token) {
          console.log('Saving refresh token');
          localStorage.setItem('refresh_token', responseData.refresh_token);
        }
      } else {
        console.warn('No token in signup response');
      }

      return responseData;
    } catch (error) {
      console.error('Signup error:', error.message);
      throw error;
    }
  },

  async login(data) {
    try {
      console.log('Logging in with email:', data.email);
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('Login response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Login error response:', errorData);
        throw new Error(errorData.message || 'Login failed');
      }

      const responseData = await response.json();
      console.log('Login response data keys:', Object.keys(responseData));
      console.log('Login response:', responseData);

      // Backend returns 'token' not 'access_token'
      const accessToken = responseData.token || responseData.access_token;
      if (accessToken) {
        console.log('Saving access token from login:', accessToken.substring(0, 20) + '...');
        localStorage.setItem('access_token', accessToken);
        if (responseData.refresh_token) {
          console.log('Saving refresh token from login');
          localStorage.setItem('refresh_token', responseData.refresh_token);
        }
      } else {
        console.warn('No token in login response');
      }

      return responseData;
    } catch (error) {
      console.error('Login error:', error.message);
      throw error;
    }
  },

  async refresh() {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      const body = refreshToken ? JSON.stringify({ refresh_token: refreshToken }) : undefined;

      console.log('Refreshing token');
      const response = await fetch(`${API_URL}/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      });

      if (!response.ok) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        if (data.refresh_token) {
          localStorage.setItem('refresh_token', data.refresh_token);
        }
      }
      return data;
    } catch (error) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      console.error('Refresh error:', error);
      throw error;
    }
  },

  async getMe() {
    try {
      console.log('Fetching user data');
      return await request('/me', {
        method: 'GET',
      });
    } catch (error) {
      console.error('GetMe error:', error);
      throw error;
    }
  },

  logout() {
    console.log('Logging out');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
  },

  getToken() {
    return getToken();
  },

  isAuthenticated() {
    const token = getToken();
    console.log('isAuthenticated:', !!token);
    return !!token;
  },
};
