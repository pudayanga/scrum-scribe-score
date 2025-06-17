
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2 } from 'lucide-react';

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
  return (
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
            {players.map((player) => (
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
