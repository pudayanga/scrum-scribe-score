import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PlayerForm } from '@/components/PlayerForm';
import { PlayerFilters } from '@/components/PlayerFilters';
import { PlayerTable } from '@/components/PlayerTable';
import { PlayerEmptyState } from '@/components/PlayerEmptyState';

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
  const [selectedTeam, setSelectedTeam] = useState('all');
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
      toast({
        title: "Error",
        description: "Failed to fetch players. Please try again.",
        variant: "destructive",
      });
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
      toast({
        title: "Error",
        description: "Failed to fetch teams. Please try again.",
        variant: "destructive",
      });
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

    if (selectedTeam && selectedTeam !== 'all') {
      filtered = filtered.filter(player => player.team_id === selectedTeam);
    }

    setFilteredPlayers(filtered);
  };

  const handleEdit = (player: Player) => {
    setEditingPlayer(player);
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

  const handleAddPlayer = () => {
    setEditingPlayer(null);
    setIsOpen(true);
  };

  const handlePlayerSaved = () => {
    fetchPlayers();
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
          <Button className="bg-purple-500 hover:bg-purple-600" onClick={handleAddPlayer}>
            <Plus className="h-4 w-4 mr-2" />
            Add Player
          </Button>
        </div>

        {/* Filters */}
        <PlayerFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedTeam={selectedTeam}
          onTeamChange={setSelectedTeam}
          teams={teams}
        />

        {/* Players Table */}
        {filteredPlayers.length > 0 ? (
          <PlayerTable
            players={filteredPlayers}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ) : (
          <PlayerEmptyState
            hasPlayers={players.length > 0}
            hasFilteredResults={filteredPlayers.length > 0}
            onAddPlayer={handleAddPlayer}
          />
        )}

        {/* Player Form Modal */}
        <PlayerForm
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          editingPlayer={editingPlayer}
          onPlayerSaved={handlePlayerSaved}
          teams={teams}
          players={players}
        />
      </div>
    </Layout>
  );
};

export default Players;
