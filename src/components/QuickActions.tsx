
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, UserPlus, Calendar, BarChart3 } from 'lucide-react';

interface QuickActionsProps {
  userRole: 'coach' | 'viewer' | 'admin';
}

export const QuickActions = ({ userRole }: QuickActionsProps) => {
  const actions = [
    {
      label: 'Create Tournament',
      icon: Plus,
      color: 'bg-green-500 hover:bg-green-600',
      roles: ['admin']
    },
    {
      label: 'Add Team',
      icon: Users,
      color: 'bg-green-500 hover:bg-green-600',
      roles: ['admin']
    },
    {
      label: 'Add Player',
      icon: UserPlus,
      color: 'bg-blue-500 hover:bg-blue-600',
      roles: ['admin', 'coach']
    },
    {
      label: 'Schedule Match',
      icon: Calendar,
      color: 'bg-orange-500 hover:bg-orange-600',
      roles: ['admin']
    },
    {
      label: 'View Statistics',
      icon: BarChart3,
      color: 'bg-gray-500 hover:bg-gray-600',
      roles: ['admin', 'coach', 'viewer']
    }
  ];

  const availableActions = actions.filter(action => action.roles.includes(userRole));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <p className="text-sm text-gray-600">Manage tournaments, teams, players and matches</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {availableActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.label}
                className={`w-full justify-start text-white ${action.color}`}
                variant="default"
              >
                <Icon className="h-4 w-4 mr-2" />
                {action.label}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
