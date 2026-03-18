import { authService } from '../services/authService';

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('authService', () => {
  beforeEach(() => {
    localStorageMock.clear.mockClear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  describe('logout', () => {
    test('removes access_token and refresh_token from localStorage', () => {
      authService.logout();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('access_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('refresh_token');
    });
  });

  describe('isAuthenticated', () => {
    test('returns true when access_token exists', () => {
      localStorageMock.getItem.mockReturnValue('test-token');
      expect(authService.isAuthenticated()).toBe(true);
    });

    test('returns false when access_token does not exist', () => {
      localStorageMock.getItem.mockReturnValue(null);
      expect(authService.isAuthenticated()).toBe(false);
    });
  });

  describe('getToken', () => {
    test('returns the access_token from localStorage', () => {
      const token = 'test-token';
      localStorageMock.getItem.mockReturnValue(token);
      expect(authService.getToken()).toBe(token);
    });

    test('returns null when no token exists', () => {
      localStorageMock.getItem.mockReturnValue(null);
      expect(authService.getToken()).toBeNull();
    });
  });
});