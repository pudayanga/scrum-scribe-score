
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { VideoPlayerSection } from './VideoPlayerSection';
import { PlayerTrackingForm } from './PlayerTrackingForm';
import { PlayerTrackingTable } from './PlayerTrackingTable';

interface PlayerTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Team {
  id: string;
  name: string;
}

export const PlayerTrackingModal = ({ isOpen, onClose }: PlayerTrackingModalProps) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [refreshTable, setRefreshTable] = useState(0);

  useEffect(() => {
    if (isOpen) {
      fetchTeams();
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

  const handleTimeCapture = (time: number) => {
    setCurrentTime(time);
  };

  const handleTrackingAdded = () => {
    setRefreshTable(prev => prev + 1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Player Tracking System</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Team Selection */}
          <div className="w-64">
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

          {selectedTeamId && (
            <>
              {/* Video Players Section */}
              <VideoPlayerSection onTimeCapture={handleTimeCapture} />

              {/* Tracking Form */}
              <PlayerTrackingForm 
                teamId={selectedTeamId}
                capturedTime={currentTime}
                onTrackingAdded={handleTrackingAdded}
              />

              {/* Tracking Data Table */}
              <PlayerTrackingTable 
                teamId={selectedTeamId}
                refreshTrigger={refreshTable}
              />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
