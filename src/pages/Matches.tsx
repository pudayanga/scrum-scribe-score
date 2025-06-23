import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Edit, Trash2, Plus, Play, Square } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';

interface Match {
  id: string;
  tournament_id: string;
  team1_id: string;
  team2_id: string;
  scheduled_date: string;
  status: string;
  venue?: string;
  team1_score?: number;
  team2_score?: number;
  coach_id?: string;
  tournaments?: {
    name: string;
  };
  team1?: {
    name: string;
    logo: string;
  };
  team2?: {
    name: string;
    logo: string;
  };
}

interface Tournament {
  id: string;
  name: string;
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
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [formData, setFormData] = useState({
    tournament_id: '',
    team1_id: '',
    team2_id: '',
    scheduled_date: '',
    venue: '',
    status: 'upcoming'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const { user } = useAuth();
  const isCoach = user?.role === 'coach';

  useEffect(() => {
    fetchMatches();
    fetchTournaments();
    fetchTeams();
  }, []);

  const fetchMatches = async () => {
    try {
      let query = supabase
        .from('matches')
        .select(`
          *,
          tournaments (name),
          team1:teams!matches_team1_id_fkey (name, logo),
          team2:teams!matches_team2_id_fkey (name, logo)
        `);

      // Filter matches by coach_id for coaches
      if (isCoach && user?.id) {
        query = query.eq('coach_id', user.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      setMatches(data || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast({
        title: "Error",
        description: "Failed to fetch matches.",
        variant: "destructive",
      });
    }
  };

  const fetchTournaments = async () => {
    try {
      let query = supabase.from('tournaments').select('id, name');
      
      // Filter tournaments by coach_id for coaches
      if (isCoach && user?.id) {
        query = query.eq('coach_id', user.id);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      setTournaments(data || []);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    }
  };

  const fetchTeams = async () => {
    try {
      let query = supabase.from('teams').select('id, name, logo');
      
      // Filter teams by coach_id for coaches
      if (isCoach && user?.id) {
        query = query.eq('coach_id', user.id);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.tournament_id) {
      newErrors.tournament_id = 'Tournament is required';
    }

    if (!formData.team1_id) {
      newErrors.team1_id = 'Team 1 is required';
    }

    if (!formData.team2_id) {
      newErrors.team2_id = 'Team 2 is required';
    }

    if (formData.team1_id === formData.team2_id) {
      newErrors.team2_id = 'Team 2 must be different from Team 1';
    }

    if (!formData.scheduled_date) {
      newErrors.scheduled_date = 'Scheduled date is required';
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
        status: formData.status,
        coach_id: user?.id || null // Set coach_id to current user's id
      };

      if (editingMatch) {
        const { error } = await supabase
          .from('matches')
          .update(matchData)
          .eq('id', editingMatch.id);
        
        if (error) throw error;
        toast({ title: "Success", description: "Match updated successfully!" });
      } else {
        const { error } = await supabase
          .from('matches')
          .insert([matchData]);
        
        if (error) throw error;
        toast({ title: "Success", description: "Match created successfully!" });
      }
      
      resetForm();
      setIsAddOpen(false);
      fetchMatches();
    } catch (error) {
      console.error('Error saving match:', error);
      toast({ 
        title: "Error", 
        description: "Failed to save match. Please try again.", 
        variant: "destructive" 
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this match?')) return;
    
    try {
      const { error } = await supabase.from('matches').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Success", description: "Match deleted successfully!" });
      fetchMatches();
    } catch (error) {
      console.error('Error deleting match:', error);
      toast({ 
        title: "Error", 
        description: "Failed to delete match.", 
        variant: "destructive" 
      });
    }
  };

  const handleEdit = (match: Match) => {
    setEditingMatch(match);
    setFormData({
      tournament_id: match.tournament_id,
      team1_id: match.team1_id,
      team2_id: match.team2_id,
      scheduled_date: match.scheduled_date.split('T')[0],
      venue: match.venue || '',
      status: match.status
    });
    setIsAddOpen(true);
  };

  const resetForm = () => {
    setFormData({
      tournament_id: '',
      team1_id: '',
      team2_id: '',
      scheduled_date: '',
      venue: '',
      status: 'upcoming'
    });
    setEditingMatch(null);
    setErrors({});
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Matches Management</h1>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Match
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingMatch ? 'Edit Match' : 'Add New Match'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tournament_id">Tournament *</Label>
                    <Select 
                      value={formData.tournament_id} 
                      onValueChange={(value) => setFormData({...formData, tournament_id: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select tournament" />
                      </SelectTrigger>
                      <SelectContent>
                        {tournaments.map((tournament) => (
                          <SelectItem key={tournament.id} value={tournament.id}>
                            {tournament.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.tournament_id && <p className="text-red-500 text-xs mt-1">{errors.tournament_id}</p>}
                  </div>

                  <div>
                    <Label htmlFor="scheduled_date">Scheduled Date *</Label>
                    <Input
                      id="scheduled_date"
                      type="date"
                      value={formData.scheduled_date}
                      onChange={(e) => setFormData({...formData, scheduled_date: e.target.value})}
                    />
                    {errors.scheduled_date && <p className="text-red-500 text-xs mt-1">{errors.scheduled_date}</p>}
                  </div>

                  <div>
                    <Label htmlFor="team1_id">Team 1 *</Label>
                    <Select 
                      value={formData.team1_id} 
                      onValueChange={(value) => setFormData({...formData, team1_id: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select team 1" />
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
                    <Label htmlFor="team2_id">Team 2 *</Label>
                    <Select 
                      value={formData.team2_id} 
                      onValueChange={(value) => setFormData({...formData, team2_id: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select team 2" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.logo} {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.team2_id && <p className="text-red-500 text-xs mt-1">{errors.team2_id}</p>}
                  </div>

                  <div>
                    <Label htmlFor="venue">Venue</Label>
                    <Input
                      id="venue"
                      value={formData.venue}
                      onChange={(e) => setFormData({...formData, venue: e.target.value})}
                      placeholder="Match venue"
                    />
                  </div>

                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value) => setFormData({...formData, status: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="live">Live</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingMatch ? 'Update Match' : 'Create Match'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Matches</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tournament</TableHead>
                  <TableHead>Teams</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matches.map((match) => (
                  <TableRow key={match.id}>
                    <TableCell>{match.tournaments?.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="flex items-center">
                          {match.team1?.logo} {match.team1?.name}
                        </span>
                        <span className="text-gray-500">vs</span>
                        <span className="flex items-center">
                          {match.team2?.logo} {match.team2?.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(match.scheduled_date)}</TableCell>
                    <TableCell>{match.venue || '-'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        match.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                        match.status === 'live' ? 'bg-green-100 text-green-800' :
                        match.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {match.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(match)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(match.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Matches;
