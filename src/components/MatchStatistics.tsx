
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3 } from 'lucide-react';
import type { Team } from '../pages/Index';

interface MatchStatisticsProps {
  teams: [Team, Team];
}

export const MatchStatistics = ({ teams }: MatchStatisticsProps) => {
  const getTeamStats = (team: Team) => {
    const totalTries = team.players.reduce((sum, player) => sum + player.tries, 0);
    const totalConversions = team.players.reduce((sum, player) => sum + player.conversions, 0);
    const totalPenalties = team.players.reduce((sum, player) => sum + player.penalties, 0);
    const totalDropGoals = team.players.reduce((sum, player) => sum + player.dropGoals, 0);

    const topScorer = team.players.reduce((top, player) => {
      const playerPoints = (player.tries * 5) + (player.conversions * 2) + (player.penalties * 3) + (player.dropGoals * 3);
      const topPoints = (top.tries * 5) + (top.conversions * 2) + (top.penalties * 3) + (top.dropGoals * 3);
      return playerPoints > topPoints ? player : top;
    }, team.players[0]);

    return {
      tries: totalTries,
      conversions: totalConversions,
      penalties: totalPenalties,
      dropGoals: totalDropGoals,
      topScorer
    };
  };

  const team1Stats = getTeamStats(teams[0]);
  const team2Stats = getTeamStats(teams[1]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5" />
          <span>Match Statistics</span>
        </CardTitle>
        <p className="text-sm text-gray-600">Real-time team and player statistics</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Team Statistics */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Team Statistics</h4>
            <div className="grid grid-cols-2 gap-4">
              {teams.map((team, index) => {
                const stats = index === 0 ? team1Stats : team2Stats;
                return (
                  <div key={team.id} className="space-y-2">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">{team.logo}</span>
                      <span className="font-medium">{team.name}</span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Tries:</span>
                        <Badge variant="outline">{stats.tries}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Conversions:</span>
                        <Badge variant="outline">{stats.conversions}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Penalties:</span>
                        <Badge variant="outline">{stats.penalties}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Drop Goals:</span>
                        <Badge variant="outline">{stats.dropGoals}</Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Scorers */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Top Scorers</h4>
            <div className="space-y-2">
              {teams.map((team, index) => {
                const stats = index === 0 ? team1Stats : team2Stats;
                const topScorerPoints = (stats.topScorer.tries * 5) + 
                                      (stats.topScorer.conversions * 2) + 
                                      (stats.topScorer.penalties * 3) + 
                                      (stats.topScorer.dropGoals * 3);
                
                return (
                  <div key={team.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{team.logo}</span>
                      <span className="font-medium text-sm">
                        #{stats.topScorer.number} {stats.topScorer.name}
                      </span>
                    </div>
                    <Badge className={index === 0 ? 'bg-green-500' : 'bg-blue-500'}>
                      {topScorerPoints} pts
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Possession (Placeholder) */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Possession</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <span>{teams[0].logo}</span>
                  <span className="text-sm">{teams[0].name}</span>
                </span>
                <span className="text-sm font-medium">52%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <span>{teams[1].logo}</span>
                  <span className="text-sm">{teams[1].name}</span>
                </span>
                <span className="text-sm font-medium">48%</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
