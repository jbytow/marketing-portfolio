import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User } from '@/types';
import { authApi } from '@/services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (provider: 'google' | 'github') => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check for token in URL (from OAuth callback)
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('auth_token', token);
      // Remove token from URL
      window.history.replaceState({}, '', window.location.pathname);
    }

    checkAuth();
  }, [searchParams]);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setUser(null);
        return;
      }

      const response = await authApi.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data);
      } else {
        setUser(null);
        localStorage.removeItem('auth_token');
      }
    } catch {
      setUser(null);
      localStorage.removeItem('auth_token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = (provider: 'google' | 'github') => {
    window.location.href = `/oauth2/authorization/${provider}`;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      localStorage.removeItem('auth_token');
      setUser(null);
      navigate('/admin/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
