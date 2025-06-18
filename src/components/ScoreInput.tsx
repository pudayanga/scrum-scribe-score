import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import type { Team, ScoringEvent } from '../types/rugby';

interface ScoreInputProps {
  teams: [Team, Team];
  onScoreAdd: (event: Omit<ScoringEvent, 'id' | 'timestamp'>) => void;
  userRole: 'coach' | 'viewer' | 'admin';
  userTeamId?: string;
  getPointsForScoreType: (type: string) => number;
  isMatchLive: boolean;
}

export const ScoreInput = ({ 
  teams, 
  onScoreAdd, 
  userRole, 
  userTeamId, 
  getPointsForScoreType,
  isMatchLive 
}: ScoreInputProps) => {
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [scoreType, setScoreType] = useState<string>('');
  const [comment, setComment] = useState<string>('');

  const availableTeams = userRole === 'coach' && userTeamId 
    ? teams.filter(team => team.id === userTeamId)
    : teams;

  const selectedTeamData = teams.find(team => team.id === selectedTeam);
  const selectedPlayerData = selectedTeamData?.players.find(player => player.id === selectedPlayer);

  const handleSubmit = () => {
    if (!selectedTeam || !selectedPlayer || !scoreType || !selectedTeamData || !selectedPlayerData) {
      return;
    }

    const event = {
      teamId: selectedTeam,
      teamName: selectedTeamData.name,
      playerId: selectedPlayer,
      playerName: selectedPlayerData.name,
      playerNumber: selectedPlayerData.number,
      type: scoreType as 'try' | 'conversion' | 'penalty' | 'drop-goal',
      points: getPointsForScoreType(scoreType),
      comment: comment || undefined
    };

    onScoreAdd(event);

    // Reset form
    setSelectedPlayer('');
    setScoreType('');
    setComment('');
  };

  const isFormValid = selectedTeam && selectedPlayer && scoreType;

  if (!isMatchLive) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Score input is only available during live matches</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Add Score</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Team
          </label>
          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger>
              <SelectValue placeholder="Select team" />
            </SelectTrigger>
            <SelectContent>
              {availableTeams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.logo} {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedTeam && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Player
            </label>
            <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
              <SelectTrigger>
                <SelectValue placeholder="Select player" />
              </SelectTrigger>
              <SelectContent>
                {selectedTeamData?.players.map((player) => (
                  <SelectItem key={player.id} value={player.id}>
                    #{player.number} {player.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Score Type
          </label>
          <Select value={scoreType} onValueChange={setScoreType}>
            <SelectTrigger>
              <SelectValue placeholder="Select score type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="try">Try (5 points)</SelectItem>
              <SelectItem value="conversion">Conversion (2 points)</SelectItem>
              <SelectItem value="penalty">Penalty (3 points)</SelectItem>
              <SelectItem value="drop-goal">Drop Goal (3 points)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comment (Optional)
          </label>
          <Textarea
            placeholder="e.g., counter-attack, kick from 22m..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
          />
        </div>

        <Button 
          onClick={handleSubmit}
          disabled={!isFormValid}
          className="w-full"
        >
          Add Score
        </Button>
      </CardContent>
    </Card>
  );
};
