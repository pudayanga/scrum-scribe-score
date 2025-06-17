
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash2, Users } from 'lucide-react';

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

interface PlayerTableProps {
  players: Player[];
  onEdit: (player: Player) => void;
  onDelete: (playerId: string) => void;
}

export const PlayerTable = ({ players, onEdit, onDelete }: PlayerTableProps) => {
  const formatHeight = (height: number) => {
    if (!height) return '-';
    return `${height} cm`;
  };

  const formatWeight = (weight: number) => {
    if (!weight) return '-';
    return `${weight} kg`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>Players ({players.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Jersey #</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Height/Weight</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map((player) => (
              <TableRow key={player.id}>
                <TableCell>
                  <Badge variant="outline" className="font-mono">
                    #{player.jersey_number}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{player.name}</TableCell>
                <TableCell>{player.position || '-'}</TableCell>
                <TableCell>{player.age || '-'}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{formatHeight(player.height)}</div>
                    <div className="text-gray-500">{formatWeight(player.weight)}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{player.email || '-'}</div>
                    <div className="text-gray-500">{player.phone || '-'}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(player)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(player.id)}
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
  );
};
