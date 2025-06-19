
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Edit, Trash2, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Layout } from '@/components/Layout';
import { useTeamFilter } from '@/hooks/useAuth';

interface Team {
  id: string;
  name: string;
  logo: string;
  coach_email: string;
}

const Teams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    logo: '🏉',
    coach_email: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const { applyTeamFilter, isCoach } = useTeamFilter();

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      let query = supabase.from('teams').select('*');
      query = applyTeamFilter(query, 'id');
      
      const { data, error } = await query;
      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast({
        title: "Error",
        description: "Failed to fetch teams.",
        variant: "destructive",
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Team name is required';
    }

    if (!formData.logo.trim()) {
      newErrors.logo = 'Team logo is required';
    }

    if (formData.coach_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.coach_email)) {
      newErrors.coach_email = 'Invalid email format';
    }

    // Check for duplicate team name
    const duplicateName = teams.find(t => 
      t.name.toLowerCase() === formData.name.toLowerCase().trim() && 
      t.id !== editingTeam?.id
    );
    if (duplicateName) {
      newErrors.name = 'Team name already exists';
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
        logo: formData.logo.trim(),
        coach_email: formData.coach_email || null,
        tournament_id: null // As requested, no tournament selection during team creation
      };

      if (editingTeam) {
        const { error } = await supabase
          .from('teams')
          .update(teamData)
          .eq('id', editingTeam.id);
        
        if (error) throw error;
        toast({ title: "Success", description: "Team updated successfully!" });
      } else {
        const { error } = await supabase
          .from('teams')
          .insert([teamData]);
        
        if (error) throw error;
        toast({ title: "Success", description: "Team created successfully!" });
      }
      
      resetForm();
      setIsAddOpen(false);
      fetchTeams();
    } catch (error) {
      console.error('Error saving team:', error);
      toast({ 
        title: "Error", 
        description: "Failed to save team. Please try again.", 
        variant: "destructive" 
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this team? This will also delete all associated players.')) return;
    
    try {
      const { error } = await supabase.from('teams').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Success", description: "Team deleted successfully!" });
      fetchTeams();
    } catch (error) {
      console.error('Error deleting team:', error);
      toast({ 
        title: "Error", 
        description: "Failed to delete team.", 
        variant: "destructive" 
      });
    }
  };

  const handleEdit = (team: Team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      logo: team.logo,
      coach_email: team.coach_email || ''
    });
    setIsAddOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      logo: '🏉',
      coach_email: ''
    });
    setEditingTeam(null);
    setErrors({});
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Teams Management</h1>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
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
                  <Label htmlFor="name">Team Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter team name"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                
                <div>
                  <Label htmlFor="logo">Logo *</Label>
                  <Input
                    id="logo"
                    value={formData.logo}
                    onChange={(e) => setFormData({...formData, logo: e.target.value})}
                    placeholder="🏉"
                  />
                  {errors.logo && <p className="text-red-500 text-xs mt-1">{errors.logo}</p>}
                </div>
                
                <div>
                  <Label htmlFor="coach_email">Coach Email</Label>
                  <Input
                    id="coach_email"
                    type="email"
                    value={formData.coach_email}
                    onChange={(e) => setFormData({...formData, coach_email: e.target.value})}
                    placeholder="coach@example.com"
                  />
                  {errors.coach_email && <p className="text-red-500 text-xs mt-1">{errors.coach_email}</p>}
                </div>
                
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingTeam ? 'Update Team' : 'Create Team'}
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
            <CardTitle>Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Logo</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Coach Email</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell className="text-2xl">{team.logo}</TableCell>
                    <TableCell>{team.name}</TableCell>
                    <TableCell>{team.coach_email || '-'}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(team)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(team.id)}>
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

export default Teams;
