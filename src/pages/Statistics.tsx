
import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Trophy, Target, Users, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PlayerStats {
  id: string;
  name: string;
  jersey_number: number;
  team_name: string;
  team_logo: string;
  total_tries: number;
  total_conversions: number;
  total_penalties: number;
  total_drop_goals: number;
  total_points: number;
}

const Statistics = () => {
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      // For now, we'll show empty state since we don't have actual match data
      // In a real implementation, you would aggregate data from scoring_events and player_statistics
      setPlayerStats([]);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-8">Loading statistics...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Statistics</h1>
          <p className="text-gray-600 mt-2">Player and team performance analytics</p>
        </div>

        {/* Stats Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Trophy className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Matches</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Tries</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Players</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Points/Game</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Scorers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Top Scorers</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {playerStats.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No statistics available</h3>
                <p className="text-gray-600">Statistics will appear here once matches are played</p>
              </div>
            ) : (
              <div className="space-y-4">
                {playerStats.map((player, index) => (
                  <div key={player.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full">
                        <span className="text-sm font-bold">#{index + 1}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{player.team_logo}</span>
                        <div>
                          <div className="font-semibold">
                            #{player.jersey_number} {player.name}
                          </div>
                          <div className="text-sm text-gray-600">{player.team_name}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="font-bold text-lg">{player.total_tries}</div>
                        <div className="text-xs text-gray-600">Tries</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-lg">{player.total_conversions}</div>
                        <div className="text-xs text-gray-600">Conv</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-lg">{player.total_penalties}</div>
                        <div className="text-xs text-gray-600">Pen</div>
                      </div>
                      <Badge className="bg-blue-500 text-white">
                        {player.total_points} pts
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Team Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Team performance data will appear here</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Match Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Match trend analysis will appear here</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Statistics;
