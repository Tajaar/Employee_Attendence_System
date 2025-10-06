// eas-app/src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { apiService } from '../services/api';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string) => Promise<{ success: boolean; error?: string }>;
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
    const storedUser = localStorage.getItem('user_data');
    if (!storedUser) {
      setLoading(false);
      return;
    }

    try {
      const userData = JSON.parse(storedUser);
      setUser(userData);
    } catch {
      localStorage.removeItem('user_data');
    }
    setLoading(false);
  };

  const login = async (email: string) => {
    const response = await apiService.login({ email });

    if (response.success && response.data) {
      const { user } = response.data;
      if (user) {
        localStorage.setItem('user_data', JSON.stringify(user));
        setUser(user);
        return { success: true };
      }
    }

    return { success: false, error: response.error || 'Login failed' };
  };

  const logout = async () => {
    await apiService.logout();
    localStorage.removeItem('user_data');
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
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
