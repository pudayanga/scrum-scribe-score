
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { VideoPlayerSection } from './VideoPlayerSection';
import { PlayerTrackingForm } from './PlayerTrackingForm';
import { PlayerTrackingTable } from './PlayerTrackingTable';
import { RugbyFieldPositions } from './RugbyFieldPositions';

interface PlayerTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Team {
  id: string;
  name: string;
}

interface Tournament {
  id: string;
  name: string;
  status: string;
}

export const PlayerTrackingModal = ({ isOpen, onClose }: PlayerTrackingModalProps) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [selectedTournamentId, setSelectedTournamentId] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedPosition, setSelectedPosition] = useState('');
  const [refreshTable, setRefreshTable] = useState(0);

  useEffect(() => {
    if (isOpen) {
      fetchTeams();
      fetchTournaments();
    }
  }, [isOpen]);

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

  const fetchTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('id, name, status')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTournaments(data || []);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    }
  };

  const handleTimeCapture = (time: number) => {
    setCurrentTime(time);
  };

  const handlePositionSelect = (position: string) => {
    setSelectedPosition(position);
  };

  const handleTrackingAdded = () => {
    setRefreshTable(prev => prev + 1);
    setSelectedPosition('');
    setCurrentTime(0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Player Tracking System</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Tournament and Team Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Tournament</label>
              <Select value={selectedTournamentId} onValueChange={setSelectedTournamentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a tournament" />
                </SelectTrigger>
                <SelectContent>
                  {tournaments.map((tournament) => (
                    <SelectItem key={tournament.id} value={tournament.id}>
                      {tournament.name} ({tournament.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Select Team</label>
              <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedTeamId && selectedTournamentId && (
            <>
              {/* Video Players Section */}
              <VideoPlayerSection onTimeCapture={handleTimeCapture} />

              {/* Rugby Field Positions */}
              <RugbyFieldPositions 
                onPositionSelect={handlePositionSelect}
                selectedPosition={selectedPosition}
              />

              {/* Tracking Form */}
              <PlayerTrackingForm 
                teamId={selectedTeamId}
                tournamentId={selectedTournamentId}
                capturedTime={currentTime}
                selectedPosition={selectedPosition}
                onTrackingAdded={handleTrackingAdded}
              />

              {/* Tracking Data Table */}
              <PlayerTrackingTable 
                teamId={selectedTeamId}
                tournamentId={selectedTournamentId}
                refreshTrigger={refreshTable}
              />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
