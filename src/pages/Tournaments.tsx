
import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Calendar, Trophy, Users, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Tournament {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
}

const Tournaments = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'upcoming'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { user } = useAuth();

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) throw error;
      setTournaments(data || []);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Tournament name is required';
    if (!formData.start_date) newErrors.start_date = 'Start date is required';
    if (!formData.end_date) newErrors.end_date = 'End date is required';
    
    if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
      newErrors.end_date = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const tournamentData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        start_date: formData.start_date,
        end_date: formData.end_date,
        status: formData.status
      };

      if (editingTournament) {
        const { error } = await supabase
          .from('tournaments')
          .update(tournamentData)
          .eq('id', editingTournament.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('tournaments')
          .insert([tournamentData]);
        
        if (error) throw error;
      }

      fetchTournaments();
      resetForm();
      setIsOpen(false);
    } catch (error) {
      console.error('Error saving tournament:', error);
    }
  };

  const handleEdit = (tournament: Tournament) => {
    setEditingTournament(tournament);
    setFormData({
      name: tournament.name,
      description: tournament.description || '',
      start_date: tournament.start_date,
      end_date: tournament.end_date,
      status: tournament.status
    });
    setIsOpen(true);
  };

  const handleDelete = async (tournamentId: string) => {
    if (confirm('Are you sure you want to delete this tournament?')) {
      try {
        const { error } = await supabase
          .from('tournaments')
          .delete()
          .eq('id', tournamentId);
        
        if (error) throw error;
        fetchTournaments();
      } catch (error) {
        console.error('Error deleting tournament:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      start_date: '',
      end_date: '',
      status: 'upcoming'
    });
    setEditingTournament(null);
    setErrors({});
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing': return 'bg-green-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-8">Loading tournaments...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tournaments</h1>
            <p className="text-gray-600 mt-2">Manage rugby tournaments and competitions</p>
          </div>
          {user?.role === 'coach' && (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-500 hover:bg-green-600" onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Tournament
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingTournament ? 'Edit Tournament' : 'Create New Tournament'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tournament Name *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter tournament name"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <Input
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Tournament description"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Start Date *</label>
                      <Input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      />
                      {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">End Date *</label>
                      <Input
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      />
                      {errors.end_date && <p className="text-red-500 text-xs mt-1">{errors.end_date}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full p-2 border rounded"
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {editingTournament ? 'Update' : 'Create'} Tournament
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

        {/* Tournament Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament) => (
            <Card key={tournament.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <Trophy className="h-5 w-5 text-orange-500" />
                    <CardTitle className="text-lg">{tournament.name}</CardTitle>
                  </div>
                  <Badge className={`${getStatusColor(tournament.status)} text-white`}>
                    {tournament.status}
                  </Badge>
                </div>
                {tournament.description && (
                  <p className="text-sm text-gray-600 mt-2">{tournament.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                      {new Date(tournament.start_date).toLocaleDateString()} - {' '}
                      {new Date(tournament.end_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    <span>Teams: 0</span>
                  </div>
                  <div className="pt-2 space-y-2">
                    <Button variant="outline" size="sm" className="w-full">
                      View Details
                    </Button>
                    {user?.role === 'coach' && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(tournament)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => handleDelete(tournament.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {tournaments.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tournaments yet</h3>
            <p className="text-gray-600 mb-4">Create your first tournament to get started</p>
            {user?.role === 'coach' && (
              <Button className="bg-green-500 hover:bg-green-600" onClick={() => setIsOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Tournament
              </Button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Tournaments;
