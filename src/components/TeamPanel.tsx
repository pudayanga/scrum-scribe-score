import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Team } from '../types/rugby';

interface TeamPanelProps {
  team: Team;
}

export const TeamPanel = ({ team }: TeamPanelProps) => {
  return (
    <Card>
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center space-x-3 mb-2">
          <span className="text-4xl">{team.logo}</span>
          <CardTitle className="text-2xl font-bold">{team.name}</CardTitle>
        </div>
        <div className="text-5xl font-bold text-blue-600">{team.score}</div>
        <div className="text-sm text-gray-600">Total Score</div>
      </CardHeader>
      <CardContent>
        <h4 className="font-semibold text-gray-900 mb-3">Players</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {team.players.map((player) => (
            <div key={player.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center space-x-3">
                <span className="font-mono font-bold text-sm bg-white px-2 py-1 rounded">
                  #{player.number}
                </span>
                <span className="font-medium">{player.name}</span>
              </div>
              <div className="text-xs text-gray-600">
                {player.tries > 0 && <span className="mr-2">T:{player.tries}</span>}
                {player.conversions > 0 && <span className="mr-2">C:{player.conversions}</span>}
                {player.penalties > 0 && <span className="mr-2">P:{player.penalties}</span>}
                {player.dropGoals > 0 && <span>DG:{player.dropGoals}</span>}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
