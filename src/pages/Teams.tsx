
import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Mail, Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Team {
  id: string;
  name: string;
  logo: string;
  coach_email: string;
  tournament_id: string;
  created_at: string;
  tournaments?: {
    name: string;
  };
}

const Teams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          tournaments (
            name
          )
        `)
        .order('name');

      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-8">Loading teams...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
            <p className="text-gray-600 mt-2">Manage rugby teams and their details</p>
          </div>
          <Button className="bg-blue-500 hover:bg-blue-600">
            <Plus className="h-4 w-4 mr-2" />
            Add Team
          </Button>
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <Card key={team.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center space-x-3 mb-2">
                  <span className="text-4xl">{team.logo}</span>
                  <CardTitle className="text-xl">{team.name}</CardTitle>
                </div>
                {team.tournaments && (
                  <Badge variant="outline" className="w-fit mx-auto">
                    <Trophy className="h-3 w-3 mr-1" />
                    {team.tournaments.name}
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    <span>Players: 0</span>
                  </div>
                  {team.coach_email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      <span className="truncate">{team.coach_email}</span>
                    </div>
                  )}
                  <div className="pt-2 space-y-2">
                    <Button variant="outline" size="sm" className="w-full">
                      View Players
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      Edit Team
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {teams.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No teams yet</h3>
            <p className="text-gray-600 mb-4">Add your first team to get started</p>
            <Button className="bg-blue-500 hover:bg-blue-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Team
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Teams;
