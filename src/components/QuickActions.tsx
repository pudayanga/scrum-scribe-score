
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Target, Settings, BarChart3, Users } from 'lucide-react';
import { AddPlayerModal } from './AddPlayerModal';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface QuickActionsProps {
  userRole: string;
}

export const QuickActions = ({ userRole }: QuickActionsProps) => {
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);
  const navigate = useNavigate();

  const handleTrackPlayer = () => {
    navigate('/player-tracking');
  };

  const handleScheduleMatch = () => {
    navigate('/matches');
  };

  const handleAddPlayer = () => {
    navigate('/players');
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(userRole === 'coach' || userRole === 'admin') && (
            <>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={handleAddPlayer}
              >
                <Users className="h-4 w-4 mr-2" />
                Add Player
              </Button>
              
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={handleTrackPlayer}
              >
                <Target className="h-4 w-4 mr-2" />
                Track Player
              </Button>
              
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={handleScheduleMatch}
              >
                <Plus className="h-4 w-4 mr-2" />
                Schedule Match
              </Button>
            </>
          )}
          
          <Button className="w-full justify-start" variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            View Statistics
          </Button>
          
          <Button className="w-full justify-start" variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </CardContent>
      </Card>

      <AddPlayerModal 
        isOpen={isAddPlayerOpen} 
        onClose={() => setIsAddPlayerOpen(false)} 
      />
    </>
  );
};
