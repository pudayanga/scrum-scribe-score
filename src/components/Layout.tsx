
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  children: React.ReactNode;
  user?: { role: 'coach' | 'viewer' | 'admin'; teamId?: string } | null;
  onLogout?: () => void;
}

export const Layout = ({ children, user, onLogout }: LayoutProps) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/tournaments', label: 'Tournaments' },
    { path: '/teams', label: 'Teams' },
    { path: '/players', label: 'Players' },
    { path: '/matches', label: 'Matches' },
    { path: '/statistics', label: 'Statistics' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-800">Rugby Scoring</h1>
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
          {user && onLogout && (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Role: {user.role}</span>
              <Button variant="outline" size="sm" onClick={onLogout}>
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
