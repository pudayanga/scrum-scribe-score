import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Square } from 'lucide-react';
import type { MatchData } from '../types/rugby';

interface MatchHeaderProps {
  match: MatchData;
  isTimerRunning: boolean;
  onTimerToggle: () => void;
  onStatusChange: (status: MatchData['status']) => void;
  formatTime: (seconds: number) => string;
  userRole: 'coach' | 'viewer' | 'admin';
}

export const MatchHeader = ({ 
  match, 
  isTimerRunning, 
  onTimerToggle, 
  onStatusChange, 
  formatTime,
  userRole 
}: MatchHeaderProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-red-500';
      case 'half-time': return 'bg-yellow-500';
      case 'upcoming': return 'bg-gray-500';
      case 'ended': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'live': return 'LIVE';
      case 'half-time': return 'HALF-TIME';
      case 'upcoming': return 'UPCOMING';
      case 'ended': return 'ENDED';
      default: return status.toUpperCase();
    }
  };

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{match.title}</h2>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0 text-sm text-gray-600">
              <span>{new Date(match.date).toLocaleDateString()} at {new Date(match.date).toLocaleTimeString()}</span>
              <Badge className={`${getStatusColor(match.status)} text-white`}>
                {getStatusText(match.status)}
              </Badge>
              <span>Half {match.half}</span>
            </div>
          </div>

          <div className="flex flex-col items-center space-y-4">
            <div className="text-center">
              <div className="text-4xl font-mono font-bold text-gray-900">
                {formatTime(match.time)}
              </div>
              <div className="text-sm text-gray-600">Match Time</div>
            </div>

            {(userRole === 'admin' || userRole === 'coach') && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onTimerToggle}
                  disabled={match.status !== 'live'}
                >
                  {isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                
                {userRole === 'admin' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onStatusChange('live')}
                      disabled={match.status === 'live'}
                    >
                      Start
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onStatusChange('half-time')}
                      disabled={match.status !== 'live'}
                    >
                      Half-Time
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onStatusChange('ended')}
                    >
                      <Square className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
