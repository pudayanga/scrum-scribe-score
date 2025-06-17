
import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Calendar, Clock, MapPin, Play, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Match {
  id: string;
  scheduled_date: string;
  status: string;
  half: number;
  match_time: number;
  team1_score: number;
  team2_score: number;
  venue: string;
  tournament_id: string;
  team1_id: string;
  team2_id: string;
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

interface Tournament {
  id: string;
  name: string;
  status: string;
}

interface Team {
  id: string;
  name: string;
  logo: string;
}

const Matches = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [formData, setFormData] = useState({
    tournament_id: '',
    team1_id: '',
    team2_id: '',
    scheduled_date: '',
    venue: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchMatches();
    fetchTournaments();
    fetchTeams();
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
      toast({
        title: "Error",
        description: "Failed to fetch matches. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('id, name, status')
        .order('name');

      if (error) throw error;
      setTournaments(data || []);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    }
  };

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('id, name, logo')
        .order('name');

      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.tournament_id) newErrors.tournament_id = 'Tournament selection is required';
    if (!formData.team1_id) newErrors.team1_id = 'Team 1 selection is required';
    if (!formData.team2_id) newErrors.team2_id = 'Team 2 selection is required';
    if (!formData.scheduled_date) newErrors.scheduled_date = 'Scheduled date is required';

    if (formData.team1_id === formData.team2_id) {
      newErrors.team2_id = 'Team 2 must be different from Team 1';
    }

    // Check if date is in the past
    const selectedDate = new Date(formData.scheduled_date);
    const now = new Date();
    if (selectedDate < now && !editingMatch) {
      newErrors.scheduled_date = 'Scheduled date cannot be in the past';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const matchData = {
        tournament_id: formData.tournament_id,
        team1_id: formData.team1_id,
        team2_id: formData.team2_id,
        scheduled_date: formData.scheduled_date,
        venue: formData.venue || null,
        status: 'upcoming',
        team1_score: 0,
        team2_score: 0,
        half: 1,
        match_time: 0
      };

      if (editingMatch) {
        const { error } = await supabase
          .from('matches')
          .update(matchData)
          .eq('id', editingMatch.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Match updated successfully!",
        });
      } else {
        const { error } = await supabase
          .from('matches')
          .insert([matchData]);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Match scheduled successfully!",
        });
      }

      fetchMatches();
      resetForm();
      setIsOpen(false);
    } catch (error) {
      console.error('Error saving match:', error);
      toast({
        title: "Error",
        description: "Failed to save match. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (match: Match) => {
    setEditingMatch(match);
    setFormData({
      tournament_id: match.tournament_id,
      team1_id: match.team1_id,
      team2_id: match.team2_id,
      scheduled_date: new Date(match.scheduled_date).toISOString().slice(0, 16),
      venue: match.venue || ''
    });
    setIsOpen(true);
  };

  const handleDelete = async (matchId: string) => {
    if (confirm('Are you sure you want to delete this match?')) {
      try {
        const { error } = await supabase
          .from('matches')
          .delete()
          .eq('id', matchId);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Match deleted successfully!",
        });
        
        fetchMatches();
      } catch (error) {
        console.error('Error deleting match:', error);
        toast({
          title: "Error",
          description: "Failed to delete match. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      tournament_id: '',
      team1_id: '',
      team2_id: '',
      scheduled_date: '',
      venue: ''
    });
    setEditingMatch(null);
    setErrors({});
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
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-500 hover:bg-orange-600" onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Match
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingMatch ? 'Edit Match' : 'Schedule New Match'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tournament *</label>
                  <Select value={formData.tournament_id} onValueChange={(value) => setFormData({ ...formData, tournament_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tournament" />
                    </SelectTrigger>
                    <SelectContent>
                      {tournaments.map((tournament) => (
                        <SelectItem key={tournament.id} value={tournament.id}>
                          {tournament.name} ({tournament.status})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.tournament_id && <p className="text-red-500 text-xs mt-1">{errors.tournament_id}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Team 1 *</label>
                  <Select value={formData.team1_id} onValueChange={(value) => setFormData({ ...formData, team1_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select first team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.logo} {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.team1_id && <p className="text-red-500 text-xs mt-1">{errors.team1_id}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Team 2 *</label>
                  <Select value={formData.team2_id} onValueChange={(value) => setFormData({ ...formData, team2_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select second team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.filter(team => team.id !== formData.team1_id).map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.logo} {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.team2_id && <p className="text-red-500 text-xs mt-1">{errors.team2_id}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Scheduled Date & Time *</label>
                  <Input
                    type="datetime-local"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                  />
                  {errors.scheduled_date && <p className="text-red-500 text-xs mt-1">{errors.scheduled_date}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Venue</label>
                  <Input
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="Match venue (optional)"
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingMatch ? 'Update' : 'Schedule'} Match
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
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
                      <>
                        <Button size="sm" className="w-full bg-green-500 hover:bg-green-600">
                          <Play className="h-4 w-4 mr-1" />
                          Start Match
                        </Button>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(match)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(match.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
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
            <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => setIsOpen(true)}>
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
