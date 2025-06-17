
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PlayerTrackingTableProps {
  teamId: string;
  tournamentId: string;
  refreshTrigger: number;
}

interface TrackingRecord {
  id: string;
  tracking_time: number;
  action: string;
  description: string;
  field_position: string;
  points_h: number;
  points_v: number;
  created_at: string;
  players: {
    id: string;
    name: string;
    jersey_number: number;
  };
}

interface Player {
  id: string;
  name: string;
  jersey_number: number;
}

export const PlayerTrackingTable = ({ teamId, tournamentId, refreshTrigger }: PlayerTrackingTableProps) => {
  const [records, setRecords] = useState<TrackingRecord[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingRecord, setEditingRecord] = useState<TrackingRecord | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formData, setFormData] = useState({
    time: '',
    player_id: '',
    action: '',
    description: '',
    field_position: '',
    points_h: '',
    points_v: ''
  });
  const { toast } = useToast();

  const pageSize = 15;

  useEffect(() => {
    if (teamId && tournamentId) {
      fetchRecords();
      fetchPlayers();
    }
  }, [teamId, tournamentId, currentPage, refreshTrigger]);

  const fetchRecords = async () => {
    try {
      const { data, error, count } = await supabase
        .from('player_tracking')
        .select(`
          *,
          players (
            id,
            name,
            jersey_number
          )
        `, { count: 'exact' })
        .eq('team_id', teamId)
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

      if (error) throw error;
      
      setRecords(data || []);
      setTotalPages(Math.ceil((count || 0) / pageSize));
    } catch (error) {
      console.error('Error fetching tracking records:', error);
    }
  };

  const fetchPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('id, name, jersey_number')
        .eq('team_id', teamId)
        .order('jersey_number');

      if (error) throw error;
      setPlayers(data || []);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(2);
    return `${mins}:${secs.padStart(5, '0')}`;
  };

  const convertTimeToSeconds = (timeStr: string): number => {
    const parts = timeStr.split(':');
    if (parts.length !== 2) return 0;
    
    const minutes = parseInt(parts[0]);
    const seconds = parseFloat(parts[1]);
    return minutes * 60 + seconds;
  };

  const handleEdit = (record: TrackingRecord) => {
    setEditingRecord(record);
    setFormData({
      time: formatTime(record.tracking_time),
      player_id: record.players.id,
      action: record.action,
      description: record.description || '',
      field_position: record.field_position || '',
      points_h: record.points_h?.toString() || '',
      points_v: record.points_v?.toString() || ''
    });
    setIsEditOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this tracking record?')) {
      try {
        const { error } = await supabase
          .from('player_tracking')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Tracking record deleted successfully!",
        });
        
        fetchRecords();
      } catch (error) {
        console.error('Error deleting record:', error);
        toast({
          title: "Error",
          description: "Failed to delete record. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingRecord) return;

    try {
      const updateData = {
        tracking_time: convertTimeToSeconds(formData.time),
        player_id: formData.player_id,
        action: formData.action.trim(),
        description: formData.description.trim() || null,
        field_position: formData.field_position.trim() || null,
        points_h: formData.points_h ? parseFloat(formData.points_h) : null,
        points_v: formData.points_v ? parseFloat(formData.points_v) : null
      };

      const { error } = await supabase
        .from('player_tracking')
        .update(updateData)
        .eq('id', editingRecord.id);
      
      if (error) throw error;

      toast({
        title: "Success",
        description: "Tracking record updated successfully!",
      });

      setIsEditOpen(false);
      setEditingRecord(null);
      fetchRecords();
    } catch (error) {
      console.error('Error updating record:', error);
      toast({
        title: "Error",
        description: "Failed to update record. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Tracking Data Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Player</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Field Position</TableHead>
                <TableHead>Points (H-V)</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-mono">
                    {formatTime(record.tracking_time)}
                  </TableCell>
                  <TableCell>
                    #{record.players.jersey_number} {record.players.name}
                  </TableCell>
                  <TableCell>{record.action}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {record.description || '-'}
                  </TableCell>
                  <TableCell>{record.field_position || '-'}</TableCell>
                  <TableCell>
                    {record.points_h !== null && record.points_v !== null
                      ? `${record.points_h} - ${record.points_v}`
                      : '-'
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(record)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(record.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Tracking Record</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Time</label>
                <Input
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  placeholder="MM:SS.ss"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Player</label>
                <Select value={formData.player_id} onValueChange={(value) => setFormData({ ...formData, player_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select player" />
                  </SelectTrigger>
                  <SelectContent>
                    {players.map((player) => (
                      <SelectItem key={player.id} value={player.id}>
                        #{player.jersey_number} {player.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Action</label>
                <Input
                  value={formData.action}
                  onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                  placeholder="e.g., Try, Tackle, Pass"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Additional details about the action"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Field Position</label>
                <Input
                  value={formData.field_position}
                  onChange={(e) => setFormData({ ...formData, field_position: e.target.value })}
                  placeholder="e.g., 22m line, Try line"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Points H</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.points_h}
                  onChange={(e) => setFormData({ ...formData, points_h: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Points V</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.points_v}
                  onChange={(e) => setFormData({ ...formData, points_v: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Update Record
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
