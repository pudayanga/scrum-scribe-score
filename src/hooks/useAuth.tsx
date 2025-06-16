
import { useState, useEffect, createContext, useContext } from 'react';

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

      // Demo users for testing
      const demoUsers = [
        {
          id: '1',
          username: 'coach1',
          role: 'coach',
          full_name: 'John Smith',
          email: 'john.smith@example.com'
        },
        {
          id: '2',
          username: 'coach2',
          role: 'coach',
          full_name: 'Sarah Johnson',
          email: 'sarah.johnson@example.com'
        },
        {
          id: '3',
          username: 'admin1',
          role: 'admin',
          full_name: 'Admin User',
          email: 'admin@example.com'
        }
      ];

      const foundUser = demoUsers.find(u => u.username === username && u.role === role);
      
      if (!foundUser) {
        return { success: false, error: 'Invalid username or role' };
      }

      const userData: User = {
        id: foundUser.id,
        username: foundUser.username,
        role: foundUser.role as 'coach' | 'viewer' | 'admin',
        full_name: foundUser.full_name,
        email: foundUser.email
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
