
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  username: string;
  role: 'coach' | 'admin';
  full_name: string;
  email?: string;
  team_id?: string;
  is_active: boolean;
  permissions?: {
    tournaments: boolean;
    teams: boolean;
    players: boolean;
    matches: boolean;
    statistics: boolean;
    player_tracking: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
  checkPermission: (page: string) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activityTimeout, setActivityTimeout] = useState<NodeJS.Timeout | null>(null);

  // Auto-logout after 2 hours of inactivity for coaches
  const resetActivityTimer = () => {
    if (activityTimeout) {
      clearTimeout(activityTimeout);
    }
    
    if (user?.role === 'coach') {
      const timeout = setTimeout(() => {
        logout();
      }, 2 * 60 * 60 * 1000); // 2 hours
      setActivityTimeout(timeout);
    }
  };

  useEffect(() => {
    const handleActivity = () => {
      resetActivityTimer();
    };

    if (user?.role === 'coach') {
      document.addEventListener('mousedown', handleActivity);
      document.addEventListener('keydown', handleActivity);
      resetActivityTimer();
    }

    return () => {
      document.removeEventListener('mousedown', handleActivity);
      document.removeEventListener('keydown', handleActivity);
      if (activityTimeout) {
        clearTimeout(activityTimeout);
      }
    };
  }, [user]);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('rugby_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      // Simple password check for demo - in production use proper hashing
      if (password !== 'password123') {
        return { success: false, error: 'Invalid password' };
      }

      // Check if user is a coach
      const { data: coaches, error: coachError } = await supabase
        .from('coaches')
        .select(`
          *,
          teams (
            id,
            name
          )
        `)
        .eq('username', username)
        .single();

      if (!coachError && coaches) {
        if (!coaches.is_active) {
          return { success: false, error: 'Your account has been temporarily disabled. Please contact admin.' };
        }

        // Get coach permissions
        const { data: permissions } = await supabase
          .from('coach_permissions')
          .select('*')
          .eq('coach_id', coaches.id)
          .single();

        const userData: User = {
          id: coaches.id,
          username: coaches.username,
          role: 'coach',
          full_name: coaches.full_name,
          email: coaches.email,
          team_id: coaches.team_id,
          is_active: coaches.is_active,
          permissions: permissions || {
            tournaments: false,
            teams: false,
            players: false,
            matches: false,
            statistics: false,
            player_tracking: false
          }
        };

        setUser(userData);
        localStorage.setItem('rugby_user', JSON.stringify(userData));
        return { success: true };
      }

      // Check if user is an admin
      const { data: admin, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('username', username)
        .single();

      if (!adminError && admin) {
        if (!admin.is_active) {
          return { success: false, error: 'Your account has been disabled.' };
        }

        const userData: User = {
          id: admin.id,
          username: admin.username,
          role: 'admin',
          full_name: admin.full_name,
          email: admin.email,
          is_active: admin.is_active,
          permissions: {
            tournaments: true,
            teams: true,
            players: true,
            matches: true,
            statistics: true,
            player_tracking: true
          }
        };

        setUser(userData);
        localStorage.setItem('rugby_user', JSON.stringify(userData));
        return { success: true };
      }

      return { success: false, error: 'Invalid username or credentials' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  };

  const refreshUser = async () => {
    if (!user) return;

    try {
      if (user.role === 'coach') {
        const { data: coach } = await supabase
          .from('coaches')
          .select(`
            *,
            teams (
              id,
              name
            )
          `)
          .eq('id', user.id)
          .single();

        if (coach) {
          const { data: permissions } = await supabase
            .from('coach_permissions')
            .select('*')
            .eq('coach_id', coach.id)
            .single();

          const updatedUser = {
            ...user,
            is_active: coach.is_active,
            permissions: permissions || user.permissions
          };

          setUser(updatedUser);
          localStorage.setItem('rugby_user', JSON.stringify(updatedUser));
        }
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const checkPermission = (page: string) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.permissions?.[page as keyof typeof user.permissions] || false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('rugby_user');
    if (activityTimeout) {
      clearTimeout(activityTimeout);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, checkPermission, refreshUser }}>
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
