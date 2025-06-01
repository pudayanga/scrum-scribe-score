
import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Clock, MapPin, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Match {
  id: string;
  scheduled_date: string;
  status: string;
  half: number;
  match_time: number;
  team1_score: number;
  team2_score: number;
  venue: string;
  team1: {
    name: string;
    logo: string;
  } | null;
  team2: {
    name: string;
    logo: string;
  } | null;
  tournaments?: {
    name: string;
  } | null;
}

const Matches = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          team1:teams!matches_team1_id_fkey (
            name,
            logo
          ),
          team2:teams!matches_team2_id_fkey (
            name,
            logo
          ),
          tournaments (
            name
          )
        `)
        .order('scheduled_date', { ascending: false });

      if (error) throw error;
      console.log('Fetched matches:', data);
      setMatches(data || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-red-500';
      case 'half-time': return 'bg-yellow-500';
      case 'ended': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-8">Loading matches...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Matches</h1>
            <p className="text-gray-600 mt-2">Schedule and manage rugby matches</p>
          </div>
          <Button className="bg-orange-500 hover:bg-orange-600">
            <Plus className="h-4 w-4 mr-2" />
            Schedule Match
          </Button>
        </div>

        {/* Matches List */}
        <div className="space-y-4">
          {matches.map((match) => (
            <Card key={match.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <Badge className={`${getStatusColor(match.status)} text-white`}>
                          {match.status.toUpperCase()}
                        </Badge>
                        {match.tournaments && (
                          <span className="text-sm text-gray-600">{match.tournaments.name}</span>
                        )}
                      </div>
                      {match.status === 'live' && (
                        <div className="text-right">
                          <div className="text-2xl font-mono font-bold text-gray-900">
                            {formatTime(match.match_time)}
                          </div>
                          <div className="text-sm text-gray-600">Half {match.half}</div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        {/* Team 1 */}
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{match.team1?.logo || '🏉'}</span>
                          <div>
                            <div className="font-semibold">{match.team1?.name || 'Team 1'}</div>
                            <div className="text-2xl font-bold text-blue-600">{match.team1_score}</div>
                          </div>
                        </div>

                        <div className="text-gray-400 font-bold text-xl">VS</div>

                        {/* Team 2 */}
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{match.team2?.logo || '🏉'}</span>
                          <div>
                            <div className="font-semibold">{match.team2?.name || 'Team 2'}</div>
                            <div className="text-2xl font-bold text-blue-600">{match.team2_score}</div>
                          </div>
                        </div>
                      </div>

                      <div className="text-right space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(match.scheduled_date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-1" />
                          {new Date(match.scheduled_date).toLocaleTimeString()}
                        </div>
                        {match.venue && (
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-1" />
                            {match.venue}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="ml-6 space-y-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    {match.status === 'upcoming' && (
                      <Button size="sm" className="w-full bg-green-500 hover:bg-green-600">
                        <Play className="h-4 w-4 mr-1" />
                        Start Match
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {matches.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No matches scheduled</h3>
            <p className="text-gray-600 mb-4">Schedule your first match to get started</p>
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Plus className="h-4 w-4 mr-2" />
              Schedule Match
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Matches;
