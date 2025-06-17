
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface Team {
  id: string;
  name: string;
}

interface PlayerFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedTeam: string;
  onTeamChange: (value: string) => void;
  teams: Team[];
}

export const PlayerFilters = ({ 
  searchTerm, 
  onSearchChange, 
  selectedTeam, 
  onTeamChange, 
  teams 
}: PlayerFiltersProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name or jersey number..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="w-64">
            <Select value={selectedTeam} onValueChange={onTeamChange}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
