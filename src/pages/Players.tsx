
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Edit, Trash2, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Layout } from '@/components/Layout';
import { useTeamFilter } from '@/hooks/useAuth';

interface Player {
  id: string;
  name: string;
  jersey_number: number;
  position: string;
  team_id: string;
  age?: number;
  weight?: number;
  height?: number;
  email?: string;
  phone?: string;
  teams?: {
    name: string;
  };
}

interface Team {
  id: string;
  name: string;
}

const Players = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    jersey_number: '',
    position: '',
    team_id: '',
    age: '',
    weight: '',
    height: '',
    email: '',
    phone: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const { applyTeamFilter, getTeamFilter, isCoach } = useTeamFilter();

  useEffect(() => {
    fetchPlayers();
    fetchTeams();
  }, []);

  const fetchPlayers = async () => {
    try {
      let query = supabase
        .from('players')
        .select(`
          *,
          teams (
            name
          )
        `);
      
      query = applyTeamFilter(query);
      
      const { data, error } = await query;
      if (error) throw error;
      setPlayers(data || []);
    } catch (error) {
      console.error('Error fetching players:', error);
      toast({
        title: "Error",
        description: "Failed to fetch players.",
        variant: "destructive",
      });
    }
  };

  const fetchTeams = async () => {
    try {
      let query = supabase.from('teams').select('id, name');
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
      newErrors.name = 'Name is required';
    }

    if (!formData.jersey_number) {
      newErrors.jersey_number = 'Jersey number is required';
    } else {
      const jerseyNum = parseInt(formData.jersey_number);
      if (isNaN(jerseyNum) || jerseyNum < 1 || jerseyNum > 99) {
        newErrors.jersey_number = 'Jersey number must be between 1 and 99';
      } else {
        // Check for duplicate jersey number in same team
        const duplicateJersey = players.find(p => 
          p.jersey_number === jerseyNum && 
          p.team_id === formData.team_id && 
          p.id !== editingPlayer?.id
        );
        if (duplicateJersey) {
          newErrors.jersey_number = 'Jersey number already exists in this team';
        }
      }
    }

    if (!formData.team_id) {
      newErrors.team_id = 'Team selection is required';
    }

    if (formData.age && (parseInt(formData.age) < 16 || parseInt(formData.age) > 50)) {
      newErrors.age = 'Age must be between 16 and 50';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (formData.weight && parseFloat(formData.weight) <= 0) {
      newErrors.weight = 'Weight must be a positive number';
    }

    if (formData.height && parseFloat(formData.height) <= 0) {
      newErrors.height = 'Height must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const playerData = {
        name: formData.name.trim(),
        jersey_number: parseInt(formData.jersey_number),
        position: formData.position || null,
        team_id: isCoach ? getTeamFilter() || formData.team_id : formData.team_id,
        age: formData.age ? parseInt(formData.age) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        email: formData.email || null,
        phone: formData.phone || null
      };

      if (editingPlayer) {
        const { error } = await supabase
          .from('players')
          .update(playerData)
          .eq('id', editingPlayer.id);
        
        if (error) throw error;
        toast({ title: "Success", description: "Player updated successfully!" });
      } else {
        const { error } = await supabase
          .from('players')
          .insert([playerData]);
        
        if (error) throw error;
        toast({ title: "Success", description: "Player created successfully!" });
      }
      
      resetForm();
      setIsAddOpen(false);
      fetchPlayers();
    } catch (error) {
      console.error('Error saving player:', error);
      toast({ 
        title: "Error", 
        description: "Failed to save player. Please try again.", 
        variant: "destructive" 
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this player?')) return;
    
    try {
      const { error } = await supabase.from('players').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Success", description: "Player deleted successfully!" });
      fetchPlayers();
    } catch (error) {
      console.error('Error deleting player:', error);
      toast({ 
        title: "Error", 
        description: "Failed to delete player.", 
        variant: "destructive" 
      });
    }
  };

  const handleEdit = (player: Player) => {
    setEditingPlayer(player);
    setFormData({
      name: player.name,
      jersey_number: player.jersey_number.toString(),
      position: player.position || '',
      team_id: player.team_id,
      age: player.age?.toString() || '',
      weight: player.weight?.toString() || '',
      height: player.height?.toString() || '',
      email: player.email || '',
      phone: player.phone || ''
    });
    setIsAddOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      jersey_number: '',
      position: '',
      team_id: '',
      age: '',
      weight: '',
      height: '',
      email: '',
      phone: ''
    });
    setEditingPlayer(null);
    setErrors({});
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Players Management</h1>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Player
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPlayer ? 'Edit Player' : 'Add New Player'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Player name"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="jersey_number">Jersey Number *</Label>
                    <Input
                      id="jersey_number"
                      type="number"
                      value={formData.jersey_number}
                      onChange={(e) => setFormData({...formData, jersey_number: e.target.value})}
                      placeholder="1-99"
                      min="1"
                      max="99"
                    />
                    {errors.jersey_number && <p className="text-red-500 text-xs mt-1">{errors.jersey_number}</p>}
                  </div>

                  {!isCoach && (
                    <div>
                      <Label htmlFor="team_id">Team *</Label>
                      <Select value={formData.team_id} onValueChange={(value) => setFormData({...formData, team_id: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a team" />
                        </SelectTrigger>
                        <SelectContent>
                          {teams.map((team) => (
                            <SelectItem key={team.id} value={team.id}>
                              {team.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.team_id && <p className="text-red-500 text-xs mt-1">{errors.team_id}</p>}
                    </div>
                  )}

                  <div>
                    <Label htmlFor="position">Position</Label>
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={(e) => setFormData({...formData, position: e.target.value})}
                      placeholder="e.g., Forward, Back"
                    />
                  </div>

                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                      placeholder="16-50"
                    />
                    {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
                  </div>

                  <div>
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      value={formData.weight}
                      onChange={(e) => setFormData({...formData, weight: e.target.value})}
                      placeholder="70"
                    />
                    {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight}</p>}
                  </div>

                  <div>
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      step="0.1"
                      value={formData.height}
                      onChange={(e) => setFormData({...formData, height: e.target.value})}
                      placeholder="170"
                    />
                    {errors.height && <p className="text-red-500 text-xs mt-1">{errors.height}</p>}
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="player@example.com"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="Phone number"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingPlayer ? 'Update Player' : 'Create Player'}
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
            <CardTitle>Players</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Jersey #</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {players.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell>{player.jersey_number}</TableCell>
                    <TableCell>{player.name}</TableCell>
                    <TableCell>{player.position || '-'}</TableCell>
                    <TableCell>{player.teams?.name || '-'}</TableCell>
                    <TableCell>{player.age || '-'}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(player)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(player.id)}>
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

export default Players;
