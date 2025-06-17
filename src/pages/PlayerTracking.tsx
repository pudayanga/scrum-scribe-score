
import { useState, useEffect, useRef } from 'react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, AlertCircle } from 'lucide-react';
import { VideoPlayerSection } from '../components/VideoPlayerSection';
import { PlayerTrackingForm } from '../components/PlayerTrackingForm';
import { PlayerTrackingTable } from '../components/PlayerTrackingTable';
import { RugbyFieldPositions } from '../components/RugbyFieldPositions';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Team {
  id: string;
  name: string;
  logo: string;
}

interface Tournament {
  id: string;
  name: string;
  status: string;
}

const PlayerTracking = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [selectedTournament, setSelectedTournament] = useState<string>('');
  const [capturedTime, setCapturedTime] = useState<number>(0);
  const [selectedPosition, setSelectedPosition] = useState<string>('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchTeams();
    fetchTournaments();
  }, []);

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

  const handleTeamChange = (teamId: string) => {
    setSelectedTeam(teamId);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleTimeCapture = (time: number) => {
    setCapturedTime(time);
  };

  const handlePositionSelect = (position: string) => {
    setSelectedPosition(position);
  };

  const handleTrackingAdded = () => {
    setRefreshTrigger(prev => prev + 1);
    setSelectedPosition('');
    setCapturedTime(0);
  };

  const handleEditRecord = (recordData: any) => {
    // Use the global method to set editing data in the form
    if ((window as any).setPlayerTrackingEditData) {
      (window as any).setPlayerTrackingEditData(recordData);
    }
  };

  const downloadTrackingData = async () => {
    if (!selectedTeam || !selectedTournament) {
      toast({
        title: "Selection Required",
        description: "Please select both tournament and team before downloading.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('player_tracking')
        .select(`
          *,
          players (
            name,
            jersey_number
          ),
          teams (
            name
          )
        `)
        .eq('team_id', selectedTeam);

      if (error) throw error;

      if (!data || data.length === 0) {
        toast({
          title: "No Data",
          description: "No tracking data records found for the selected team and tournament.",
          variant: "destructive",
        });
        return;
      }

      // Convert to CSV
      const headers = ['Time', 'Player', 'Jersey Number', 'Action', 'Description', 'Field Position', 'Points H', 'Points V', 'Created At'];
      const csvContent = [
        headers.join(','),
        ...data.map(record => [
          `${Math.floor(record.tracking_time / 60)}:${(record.tracking_time % 60).toFixed(2).padStart(5, '0')}`,
          `"${record.players.name}"`,
          record.players.jersey_number,
          `"${record.action}"`,
          `"${record.description || ''}"`,
          `"${record.field_position || ''}"`,
          record.points_h || '',
          record.points_v || '',
          new Date(record.created_at).toISOString()
        ].join(','))
      ].join('\n');

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `tracking_data_${selectedTeam}_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

      toast({
        title: "Success",
        description: "Tracking data downloaded successfully!",
      });
    } catch (error) {
      console.error('Error downloading tracking data:', error);
      toast({
        title: "Error",
        description: "Failed to download tracking data. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Player Tracking</h1>
            <p className="text-gray-600 mt-2">Track player actions and positions during matches</p>
          </div>
          <Button 
            onClick={downloadTrackingData}
            disabled={!selectedTeam || !selectedTournament}
            className="bg-green-500 hover:bg-green-600"
          >
            <Download className="h-4 w-4 mr-2" />
            Download CSV
          </Button>
        </div>

        {/* Team and Tournament Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Selection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tournament *</label>
                <Select value={selectedTournament} onValueChange={setSelectedTournament}>
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
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Team *</label>
                <Select value={selectedTeam} onValueChange={handleTeamChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.logo} {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {(!selectedTeam || !selectedTournament) && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                <span className="text-yellow-800">Please select both tournament and team to continue</span>
              </div>
            )}
          </CardContent>
        </Card>

        {selectedTeam && selectedTournament && (
          <>
            {/* Video Players */}
            <VideoPlayerSection onTimeCapture={handleTimeCapture} />

            {/* Rugby Field Positions */}
            <RugbyFieldPositions 
              onPositionSelect={handlePositionSelect}
              selectedPosition={selectedPosition}
            />

            {/* Tracking Form */}
            <PlayerTrackingForm
              teamId={selectedTeam}
              tournamentId={selectedTournament}
              capturedTime={capturedTime}
              selectedPosition={selectedPosition}
              onTrackingAdded={handleTrackingAdded}
            />

            {/* Tracking Table */}
            <PlayerTrackingTable
              teamId={selectedTeam}
              tournamentId={selectedTournament}
              refreshTrigger={refreshTrigger}
              onEditRecord={handleEditRecord}
            />
          </>
        )}
      </div>
    </Layout>
  );
};

export default PlayerTracking;
