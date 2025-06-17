
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
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    if (selectedTeam && selectedTeam !== 'all') {
      fetchPlayers();
    } else {
      setPlayers([]);
      setFilteredPlayers([]);
    }
  }, [selectedTeam]);

  useEffect(() => {
    filterPlayers();
  }, [players, searchTerm]);

  const fetchPlayers = async () => {
    if (!selectedTeam || selectedTeam === 'all') return;
    
    setLoading(true);
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
        .eq('team_id', selectedTeam)
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
    if (selectedTeam === 'all') {
      toast({
        title: "Team Selection Required",
        description: "Please select a team before adding a player.",
        variant: "destructive",
      });
      return;
    }
    setEditingPlayer(null);
    setIsOpen(true);
  };

  const handlePlayerSaved = () => {
    fetchPlayers();
  };

  const handleTeamChange = (teamId: string) => {
    setSelectedTeam(teamId);
    setSearchTerm(''); // Reset search when team changes
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Players</h1>
            <p className="text-gray-600 mt-2">Manage player profiles and information</p>
          </div>
          <Button 
            className="bg-purple-500 hover:bg-purple-600" 
            onClick={handleAddPlayer}
            disabled={selectedTeam === 'all'}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Player
          </Button>
        </div>

        {/* Filters */}
        <PlayerFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedTeam={selectedTeam}
          onTeamChange={handleTeamChange}
          teams={teams}
        />

        {/* Team Selection Notice */}
        {selectedTeam === 'all' && (
          <div className="text-center py-12">
            <div className="bg-blue-50 rounded-lg p-8 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Select a Team</h3>
              <p className="text-blue-700">
                Please select a team from the filter above to view and manage players.
              </p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && selectedTeam !== 'all' && (
          <div className="text-center py-8">Loading players...</div>
        )}

        {/* Players Table */}
        {selectedTeam !== 'all' && !loading && (
          <>
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
          </>
        )}

        {/* Player Form Modal */}
        <PlayerForm
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          editingPlayer={editingPlayer}
          onPlayerSaved={handlePlayerSaved}
          teams={teams}
          players={players}
          preselectedTeamId={selectedTeam !== 'all' ? selectedTeam : undefined}
        />
      </div>
    </Layout>
  );
};

export default Players;
