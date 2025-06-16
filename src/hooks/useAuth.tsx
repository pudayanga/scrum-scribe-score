
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  username: string;
  role: 'coach' | 'viewer' | 'admin';
  full_name: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string, role: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('rugby_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string, role: string) => {
    try {
      // Simple password check for demo - in production use proper hashing
      if (password !== 'password123') {
        return { success: false, error: 'Invalid password' };
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('role', role)
        .single();

      if (error || !data) {
        return { success: false, error: 'Invalid username or role' };
      }

      const userData: User = {
        id: data.id,
        username: data.username,
        role: data.role,
        full_name: data.full_name,
        email: data.email
      };

      setUser(userData);
      localStorage.setItem('rugby_user', JSON.stringify(userData));
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('rugby_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
