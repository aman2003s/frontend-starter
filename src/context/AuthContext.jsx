import { createContext, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authService } from '../services/authService';

export const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const { data: userData, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const token = authService.getToken();
      if (!token) {
        return null;
      }
      try {
        const data = await authService.getMe();
        console.log('User data fetched:', data);
        return data;
      } catch (error) {
        console.error('Failed to fetch user:', error);
        authService.logout();
        return null;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    setUser(userData || null);
    console.log('User state updated:', userData);
  }, [userData]);

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
