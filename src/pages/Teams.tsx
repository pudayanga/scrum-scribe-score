
import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Users, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Team {
  id: string;
  name: string;
  logo: string;
  coach_email?: string;
  tournament_id?: string;
  created_at: string;
  tournaments?: {
    name: string;
  } | null;
}

const Teams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    logo: '🏉',
    coach_email: '',
    tournament_id: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { user } = useAuth();

  useEffect(() => {
    fetchTeams();
    fetchTournaments();
  }, []);

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          tournaments (name)
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

  const fetchTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('name');

      if (error) throw error;
      setTournaments(data || []);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Team name is required';
    
    if (formData.coach_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.coach_email)) {
      newErrors.coach_email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const teamData = {
        name: formData.name.trim(),
        logo: formData.logo || '🏉',
        coach_email: formData.coach_email || null,
        tournament_id: formData.tournament_id || null
      };

      if (editingTeam) {
        const { error } = await supabase
          .from('teams')
          .update(teamData)
          .eq('id', editingTeam.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('teams')
          .insert([teamData]);
        
        if (error) throw error;
      }

      fetchTeams();
      resetForm();
      setIsOpen(false);
    } catch (error) {
      console.error('Error saving team:', error);
    }
  };

  const handleEdit = (team: Team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      logo: team.logo,
      coach_email: team.coach_email || '',
      tournament_id: team.tournament_id || ''
    });
    setIsOpen(true);
  };

  const handleDelete = async (teamId: string) => {
    if (confirm('Are you sure you want to delete this team?')) {
      try {
        const { error } = await supabase
          .from('teams')
          .delete()
          .eq('id', teamId);
        
        if (error) throw error;
        fetchTeams();
      } catch (error) {
        console.error('Error deleting team:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      logo: '🏉',
      coach_email: '',
      tournament_id: ''
    });
    setEditingTeam(null);
    setErrors({});
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
            <p className="text-gray-600 mt-2">Manage rugby teams and players</p>
          </div>
          {user?.role === 'coach' && (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-500 hover:bg-blue-600" onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Team
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingTeam ? 'Edit Team' : 'Add New Team'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Team Name *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter team name"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Logo (Emoji)</label>
                    <Input
                      value={formData.logo}
                      onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                      placeholder="🏉"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Coach Email</label>
                    <Input
                      type="email"
                      value={formData.coach_email}
                      onChange={(e) => setFormData({ ...formData, coach_email: e.target.value })}
                      placeholder="coach@example.com"
                    />
                    {errors.coach_email && <p className="text-red-500 text-xs mt-1">{errors.coach_email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Tournament</label>
                    <select
                      value={formData.tournament_id}
                      onChange={(e) => setFormData({ ...formData, tournament_id: e.target.value })}
                      className="w-full p-2 border rounded"
                    >
                      <option value="">Select tournament (optional)</option>
                      {tournaments.map((tournament) => (
                        <option key={tournament.id} value={tournament.id}>{tournament.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {editingTeam ? 'Update' : 'Add'} Team
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <Card key={team.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{team.logo}</span>
                    <CardTitle className="text-xl">{team.name}</CardTitle>
                  </div>
                  {user?.role === 'coach' && (
                    <div className="flex space-x-1">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(team)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(team.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {team.tournaments && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      <span>Tournament: {team.tournaments.name}</span>
                    </div>
                  )}
                  {team.coach_email && (
                    <div className="text-sm text-gray-600">
                      Coach: {team.coach_email}
                    </div>
                  )}
                  <div className="pt-2">
                    <Button variant="outline" size="sm" className="w-full">
                      View Players
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
            {user?.role === 'coach' && (
              <Button className="bg-blue-500 hover:bg-blue-600" onClick={() => setIsOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Team
              </Button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Teams;
