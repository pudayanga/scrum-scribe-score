
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Player {
  id: string;
  name: string;
  jersey_number: number;
  position?: string;
  age?: number;
  height?: number;
  weight?: number;
  email?: string;
  phone?: string;
  team_id: string;
  teams?: { name: string };
}

export const PlayerManagement = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    jersey_number: '',
    position: '',
    age: '',
    height: '',
    weight: '',
    email: '',
    phone: '',
    team_id: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { user } = useAuth();

  useEffect(() => {
    fetchPlayers();
    fetchTeams();
  }, []);

  const fetchPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select(`
          *,
          teams (name)
        `)
        .order('jersey_number');

      if (error) throw error;
      setPlayers(data || []);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('name');

      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.jersey_number) newErrors.jersey_number = 'Jersey number is required';
    if (!formData.team_id) newErrors.team_id = 'Team is required';
    
    const jerseyNum = parseInt(formData.jersey_number);
    if (isNaN(jerseyNum) || jerseyNum < 1 || jerseyNum > 99) {
      newErrors.jersey_number = 'Jersey number must be between 1 and 99';
    }

    if (formData.age && (parseInt(formData.age) < 16 || parseInt(formData.age) > 50)) {
      newErrors.age = 'Age must be between 16 and 50';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
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
        age: formData.age ? parseInt(formData.age) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        email: formData.email || null,
        phone: formData.phone || null,
        team_id: formData.team_id
      };

      if (editingPlayer) {
        const { error } = await supabase
          .from('players')
          .update(playerData)
          .eq('id', editingPlayer.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('players')
          .insert([playerData]);
        
        if (error) throw error;
      }

      fetchPlayers();
      resetForm();
      setIsOpen(false);
    } catch (error) {
      console.error('Error saving player:', error);
    }
  };

  const handleEdit = (player: Player) => {
    setEditingPlayer(player);
    setFormData({
      name: player.name,
      jersey_number: player.jersey_number.toString(),
      position: player.position || '',
      age: player.age?.toString() || '',
      height: player.height?.toString() || '',
      weight: player.weight?.toString() || '',
      email: player.email || '',
      phone: player.phone || '',
      team_id: player.team_id
    });
    setIsOpen(true);
  };

  const handleDelete = async (playerId: string) => {
    if (confirm('Are you sure you want to delete this player?')) {
      try {
        const { error } = await supabase
          .from('players')
          .delete()
          .eq('id', playerId);
        
        if (error) throw error;
        fetchPlayers();
      } catch (error) {
        console.error('Error deleting player:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      jersey_number: '',
      position: '',
      age: '',
      height: '',
      weight: '',
      email: '',
      phone: '',
      team_id: ''
    });
    setEditingPlayer(null);
    setErrors({});
  };

  if (user?.role !== 'coach' && user?.role !== 'admin') {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Player Management</CardTitle>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Player
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPlayer ? 'Edit Player' : 'Add New Player'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Player name"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Jersey Number *</label>
                  <Input
                    type="number"
                    value={formData.jersey_number}
                    onChange={(e) => setFormData({ ...formData, jersey_number: e.target.value })}
                    placeholder="1-99"
                    min="1"
                    max="99"
                  />
                  {errors.jersey_number && <p className="text-red-500 text-xs mt-1">{errors.jersey_number}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Team *</label>
                  <select
                    value={formData.team_id}
                    onChange={(e) => setFormData({ ...formData, team_id: e.target.value })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select team</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                  </select>
                  {errors.team_id && <p className="text-red-500 text-xs mt-1">{errors.team_id}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Position</label>
                  <Input
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="e.g., Forward, Back"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Age</label>
                    <Input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      placeholder="16-50"
                    />
                    {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Height (cm)</label>
                    <Input
                      type="number"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      placeholder="170"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Weight (kg)</label>
                  <Input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="70"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="player@example.com"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Phone number"
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingPlayer ? 'Update' : 'Add'} Player
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {players.map((player) => (
            <div key={player.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <Badge variant="outline">#{player.jersey_number}</Badge>
                <div>
                  <div className="font-semibold">{player.name}</div>
                  <div className="text-sm text-gray-600">
                    {player.teams?.name} • {player.position || 'No position'}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(player)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(player.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
