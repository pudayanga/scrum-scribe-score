
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import type { ScoringEvent, Team } from '../pages/Index';

interface ScoringTimelineProps {
  events: ScoringEvent[];
  teams: [Team, Team];
}

export const ScoringTimeline = ({ events, teams }: ScoringTimelineProps) => {
  const getTeamColor = (teamId: string) => {
    const teamIndex = teams.findIndex(team => team.id === teamId);
    return teamIndex === 0 ? 'bg-green-500' : 'bg-blue-500';
  };

  const getScoreTypeLabel = (type: string) => {
    switch (type) {
      case 'try': return 'Try';
      case 'conversion': return 'Conversion';
      case 'penalty': return 'Penalty';
      case 'drop-goal': return 'Drop Goal';
      default: return type;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Live Scoring Timeline</span>
        </CardTitle>
        <p className="text-sm text-gray-600">Currently tracking scoring events</p>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No scoring events yet</p>
            <p className="text-sm">Events will appear here as they happen</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {events.map((event) => (
              <div key={event.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <Badge className={`${getTeamColor(event.teamId)} text-white text-xs`}>
                    {event.timestamp}
                  </Badge>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold text-gray-900">{event.teamName}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-sm font-medium text-gray-700">
                      {getScoreTypeLabel(event.type)}
                    </span>
                    <span className="text-sm text-gray-500">
                      (+{event.points} pts)
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    #{event.playerNumber} {event.playerName}
                  </div>
                  {event.comment && (
                    <div className="text-xs text-gray-500 mt-1 italic">
                      {event.comment}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
