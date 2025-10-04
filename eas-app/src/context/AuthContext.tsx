import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { apiService } from '../services/api';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isEmployee: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setLoading(false);
      return;
    }

    const response = await apiService.getCurrentUser();
    if (response.success && response.data) {
      setUser(response.data);
    } else {
      localStorage.removeItem('auth_token');
    }
    setLoading(false);
  };

  const login = async (email: string, password: string) => {
    const response = await apiService.login({ email, password });

    if (response.success && response.data) {
      localStorage.setItem('auth_token', response.data.token);
      setUser(response.data.user);
      return { success: true };
    }

    return { success: false, error: response.error || 'Login failed' };
  };

  const logout = async () => {
    await apiService.logout();
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'hr';
  const isEmployee = user?.role === 'employee';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isEmployee }}>
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
