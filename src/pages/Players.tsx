
import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, UserPlus, Users, Hash } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Player {
  id: string;
  name: string;
  jersey_number: number;
  position: string;
  age: number;
  weight: number;
  height: number;
  team_id: string;
  teams?: {
    name: string;
    logo: string;
  };
}

const Players = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select(`
          *,
          teams (
            name,
            logo
          )
        `)
        .order('jersey_number');

      if (error) throw error;
      setPlayers(data || []);
    } catch (error) {
      console.error('Error fetching players:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-8">Loading players...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Players</h1>
            <p className="text-gray-600 mt-2">Manage player profiles and information</p>
          </div>
          <Button className="bg-purple-500 hover:bg-purple-600">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Player
          </Button>
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {players.map((player) => (
            <Card key={player.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center pb-3">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <div className="bg-gray-100 px-3 py-1 rounded-full">
                    <span className="font-bold text-lg">#{player.jersey_number}</span>
                  </div>
                </div>
                <CardTitle className="text-lg">{player.name}</CardTitle>
                {player.position && (
                  <Badge variant="outline" className="w-fit mx-auto">
                    {player.position}
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {player.teams && (
                    <div className="flex items-center justify-center text-sm text-gray-600">
                      <span className="mr-1">{player.teams.logo}</span>
                      <span>{player.teams.name}</span>
                    </div>
                  )}
                  {player.age && (
                    <div className="text-center text-sm text-gray-600">
                      Age: {player.age}
                    </div>
                  )}
                  {(player.height || player.weight) && (
                    <div className="text-center text-sm text-gray-600">
                      {player.height && `${player.height}cm`}
                      {player.height && player.weight && ' • '}
                      {player.weight && `${player.weight}kg`}
                    </div>
                  )}
                  <div className="pt-2">
                    <Button variant="outline" size="sm" className="w-full">
                      View Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {players.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No players yet</h3>
            <p className="text-gray-600 mb-4">Add your first player to get started</p>
            <Button className="bg-purple-500 hover:bg-purple-600">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Player
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Players;
