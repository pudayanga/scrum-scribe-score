
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  // Different navigation items based on user role
  const getNavItems = () => {
    if (user?.role === 'admin') {
      return [
        { path: '/', label: 'Dashboard' },
        { path: '/admin/coaches', label: 'Coaches' },
        { path: '/admin/permissions', label: 'Permissions' },
        { path: '/admin/messages', label: 'Messages' },
        { path: '/admin/notifications', label: 'Notifications' },
      ];
    } else {
      return [
        { path: '/', label: 'Home' },
        { path: '/tournaments', label: 'Tournaments' },
        { path: '/teams', label: 'Teams' },
        { path: '/players', label: 'Players' },
        { path: '/matches', label: 'Matches' },
        { path: '/statistics', label: 'Statistics' },
      ];
    }
  };

  const navItems = getNavItems();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-800">
              {user?.role === 'admin' ? 'Rugby Admin Panel' : 'Rugby Scoring'}
            </h1>
            <div className="flex items-center space-x-6 text-sm">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-1 rounded font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          {user && (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user.role === 'admin' ? `Admin: ${user.full_name}` : `Welcome ${user.full_name}`}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </div>
    </div>
  );
};
