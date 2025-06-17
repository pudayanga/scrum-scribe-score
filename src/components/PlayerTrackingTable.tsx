
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, ChevronLeft, ChevronRight, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PlayerTrackingTableProps {
  teamId: string;
  tournamentId: string;
  refreshTrigger: number;
  onEditRecord?: (record: any) => void;
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

export const PlayerTrackingTable = ({ teamId, tournamentId, refreshTrigger, onEditRecord }: PlayerTrackingTableProps) => {
  const [records, setRecords] = useState<TrackingRecord[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
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

  const handleEdit = (record: TrackingRecord) => {
    if (onEditRecord) {
      // Pass the record data to the form
      onEditRecord({
        time: formatTime(record.tracking_time),
        player_id: record.players.id,
        action: record.action,
        description: record.description || '',
        field_position: record.field_position || '',
        points_h: record.points_h?.toString() || '',
        points_v: record.points_v?.toString() || '',
        id: record.id
      });
    } else {
      // Fallback to inline editing
      setEditingId(record.id);
      setEditData({
        player_id: record.players.id,
        action: record.action,
        description: record.description || '',
        field_position: record.field_position || '',
        points_h: record.points_h?.toString() || '',
        points_v: record.points_v?.toString() || ''
      });
    }
  };

  const handleSave = async (recordId: string) => {
    try {
      const updateData = {
        player_id: editData.player_id,
        action: editData.action.trim(),
        description: editData.description.trim() || null,
        field_position: editData.field_position.trim() || null,
        points_h: editData.points_h ? parseFloat(editData.points_h) : null,
        points_v: editData.points_v ? parseFloat(editData.points_v) : null
      };

      const { error } = await supabase
        .from('player_tracking')
        .update(updateData)
        .eq('id', recordId);
      
      if (error) throw error;

      toast({
        title: "Success",
        description: "Tracking record updated successfully!",
      });

      setEditingId(null);
      setEditData({});
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

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
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

  return (
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
                  {editingId === record.id ? (
                    <Select value={editData.player_id} onValueChange={(value) => setEditData({ ...editData, player_id: value })}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {players.map((player) => (
                          <SelectItem key={player.id} value={player.id}>
                            #{player.jersey_number} {player.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    `#${record.players.jersey_number} ${record.players.name}`
                  )}
                </TableCell>
                <TableCell>
                  {editingId === record.id ? (
                    <Input
                      value={editData.action}
                      onChange={(e) => setEditData({ ...editData, action: e.target.value })}
                      className="w-24"
                    />
                  ) : (
                    record.action
                  )}
                </TableCell>
                <TableCell className="max-w-xs">
                  {editingId === record.id ? (
                    <Textarea
                      value={editData.description}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      className="w-32 h-16"
                      rows={2}
                    />
                  ) : (
                    <div className="truncate" title={record.description || ''}>
                      {record.description || '-'}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {editingId === record.id ? (
                    <Input
                      value={editData.field_position}
                      onChange={(e) => setEditData({ ...editData, field_position: e.target.value })}
                      className="w-24"
                    />
                  ) : (
                    record.field_position || '-'
                  )}
                </TableCell>
                <TableCell>
                  {editingId === record.id ? (
                    <div className="flex gap-1">
                      <Input
                        type="number"
                        step="0.01"
                        value={editData.points_h}
                        onChange={(e) => setEditData({ ...editData, points_h: e.target.value })}
                        className="w-16"
                        placeholder="H"
                      />
                      <Input
                        type="number"
                        step="0.01"
                        value={editData.points_v}
                        onChange={(e) => setEditData({ ...editData, points_v: e.target.value })}
                        className="w-16"
                        placeholder="V"
                      />
                    </div>
                  ) : (
                    record.points_h !== null && record.points_v !== null
                      ? `${record.points_h} - ${record.points_v}`
                      : '-'
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {editingId === record.id ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSave(record.id)}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancel}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
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
                      </>
                    )}
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
  );
};
