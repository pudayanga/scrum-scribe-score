
import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Users, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Player {
  id: string;
  name: string;
  jersey_number: number;
  position: string;
  age: number;
  weight: number;
  height: number;
  email: string;
  phone: string;
  team_id: string;
  teams?: {
    name: string;
    logo: string;
  };
}

interface Team {
  id: string;
  name: string;
}

const Players = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
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
  const { toast } = useToast();

  useEffect(() => {
    fetchPlayers();
    fetchTeams();
  }, []);

  useEffect(() => {
    filterPlayers();
  }, [players, searchTerm, selectedTeam]);

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

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const filterPlayers = () => {
    let filtered = players;

    if (searchTerm) {
      filtered = filtered.filter(player => 
        player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.jersey_number.toString().includes(searchTerm)
      );
    }

    if (selectedTeam) {
      filtered = filtered.filter(player => player.team_id === selectedTeam);
    }

    setFilteredPlayers(filtered);
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
        
        toast({
          title: "Success",
          description: "Player updated successfully!",
        });
      } else {
        const { error } = await supabase
          .from('players')
          .insert([playerData]);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Player added successfully!",
        });
      }

      fetchPlayers();
      resetForm();
      setIsOpen(false);
    } catch (error) {
      console.error('Error saving player:', error);
      toast({
        title: "Error",
        description: "Failed to save player. Please try again.",
        variant: "destructive",
      });
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
        
        toast({
          title: "Success",
          description: "Player deleted successfully!",
        });
        
        fetchPlayers();
      } catch (error) {
        console.error('Error deleting player:', error);
        toast({
          title: "Error",
          description: "Failed to delete player. Please try again.",
          variant: "destructive",
        });
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
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-500 hover:bg-purple-600" onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Player
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPlayer ? 'Edit Player' : 'Add New Player'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Form fields - same as in AddPlayerModal but inline */}
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
                  <Select value={formData.team_id} onValueChange={(value) => setFormData({ ...formData, team_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by name or jersey number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-64">
                <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Teams</SelectItem>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Players Table */}
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Height/Weight</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlayers.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell>
                      <Badge variant="outline">#{player.jersey_number}</Badge>
                    </TableCell>
                    <TableCell className="font-semibold">{player.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="mr-1">{player.teams?.logo}</span>
                        <span>{player.teams?.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{player.position || '-'}</TableCell>
                    <TableCell>{player.age || '-'}</TableCell>
                    <TableCell>
                      {(player.height || player.weight) ? 
                        `${player.height || '?'}cm / ${player.weight || '?'}kg` : 
                        '-'
                      }
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="text-sm">
                        <div>{player.email || '-'}</div>
                        <div className="text-gray-500">{player.phone || '-'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(player)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(player.id)}
                        >
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

        {filteredPlayers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {players.length === 0 ? 'No players yet' : 'No players found'}
            </h3>
            <p className="text-gray-600 mb-4">
              {players.length === 0 ? 
                'Add your first player to get started' : 
                'Try adjusting your search or filter criteria'
              }
            </p>
            {players.length === 0 && (
              <Button className="bg-purple-500 hover:bg-purple-600" onClick={() => setIsOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Player
              </Button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Players;
