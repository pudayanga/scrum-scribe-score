
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PlayerTrackingFormProps {
  teamId: string;
  tournamentId: string;
  capturedTime: number;
  selectedPosition: string;
  onTrackingAdded: () => void;
}

interface Player {
  id: string;
  name: string;
  jersey_number: number;
}

export const PlayerTrackingForm = ({ 
  teamId, 
  tournamentId, 
  capturedTime, 
  selectedPosition, 
  onTrackingAdded 
}: PlayerTrackingFormProps) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [formData, setFormData] = useState({
    time: '',
    player_id: '',
    action: '',
    description: '',
    field_position: selectedPosition,
    points_h: '',
    points_v: '',
    id: '' // for editing
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (teamId) {
      fetchPlayers();
    }
  }, [teamId]);

  useEffect(() => {
    if (capturedTime > 0 && !isEditing) {
      const mins = Math.floor(capturedTime / 60);
      const secs = (capturedTime % 60).toFixed(2);
      setFormData(prev => ({ ...prev, time: `${mins}:${secs.padStart(5, '0')}` }));
    }
  }, [capturedTime, isEditing]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, field_position: selectedPosition }));
  }, [selectedPosition]);

  // Method to set editing data from parent component
  const setEditingData = (data: any) => {
    setFormData({
      time: data.time,
      player_id: data.player_id,
      action: data.action,
      description: data.description,
      field_position: data.field_position,
      points_h: data.points_h,
      points_v: data.points_v,
      id: data.id
    });
    setIsEditing(true);
  };

  // Expose this method to parent
  useEffect(() => {
    (window as any).setPlayerTrackingEditData = setEditingData;
    return () => {
      delete (window as any).setPlayerTrackingEditData;
    };
  }, []);

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!tournamentId) newErrors.tournament = 'Tournament is required';
    if (!teamId) newErrors.team = 'Team is required';
    if (!formData.time.trim()) newErrors.time = 'Time is required';
    if (!formData.player_id) newErrors.player_id = 'Player is required';
    if (!formData.action.trim()) newErrors.action = 'Action is required';
    if (!formData.field_position.trim()) newErrors.field_position = 'Field position is required';
    
    // Validate time format (MM:SS.ss) only if not editing
    if (!isEditing) {
      const timeRegex = /^\d{1,2}:\d{2}(\.\d{2})?$/;
      if (formData.time && !timeRegex.test(formData.time)) {
        newErrors.time = 'Time format should be MM:SS.ss';
      }
    }

    // Validate points if provided
    if (formData.points_h && (isNaN(parseFloat(formData.points_h)) || parseFloat(formData.points_h) < 0)) {
      newErrors.points_h = 'Invalid horizontal position';
    }
    if (formData.points_v && (isNaN(parseFloat(formData.points_v)) || parseFloat(formData.points_v) < 0)) {
      newErrors.points_v = 'Invalid vertical position';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const convertTimeToSeconds = (timeStr: string): number => {
    const parts = timeStr.split(':');
    if (parts.length !== 2) return 0;
    
    const minutes = parseInt(parts[0]);
    const seconds = parseFloat(parts[1]);
    return minutes * 60 + seconds;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (isEditing) {
        // Update existing record
        const updateData = {
          player_id: formData.player_id,
          action: formData.action.trim(),
          description: formData.description.trim() || null,
          field_position: formData.field_position.trim(),
          points_h: formData.points_h ? parseFloat(formData.points_h) : null,
          points_v: formData.points_v ? parseFloat(formData.points_v) : null
        };

        const { error } = await supabase
          .from('player_tracking')
          .update(updateData)
          .eq('id', formData.id);
        
        if (error) throw error;

        toast({
          title: "Success",
          description: "Player tracking data updated successfully!",
        });
      } else {
        // Create new record
        const trackingData = {
          team_id: teamId,
          player_id: formData.player_id,
          tracking_time: convertTimeToSeconds(formData.time),
          action: formData.action.trim(),
          description: formData.description.trim() || null,
          field_position: formData.field_position.trim(),
          points_h: formData.points_h ? parseFloat(formData.points_h) : null,
          points_v: formData.points_v ? parseFloat(formData.points_v) : null
        };

        const { error } = await supabase
          .from('player_tracking')
          .insert([trackingData]);
        
        if (error) throw error;

        toast({
          title: "Success",
          description: "Player tracking data saved successfully!",
        });
      }

      resetForm();
      onTrackingAdded();
    } catch (error) {
      console.error('Error saving tracking data:', error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'save'} tracking data. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      time: '',
      player_id: '',
      action: '',
      description: '',
      field_position: '',
      points_h: '',
      points_v: '',
      id: ''
    });
    setErrors({});
    setIsEditing(false);
  };

  const handleCancel = () => {
    resetForm();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Tracking Data' : 'Add Tracking Data'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Time *</label>
              <Input
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                placeholder="MM:SS.ss"
                readOnly={isEditing}
                className={isEditing ? 'bg-gray-100' : ''}
              />
              {errors.time && <p className="text-red-500 text-xs mt-1">{errors.time}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Player *</label>
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
              {errors.player_id && <p className="text-red-500 text-xs mt-1">{errors.player_id}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Action *</label>
              <Input
                value={formData.action}
                onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                placeholder="e.g., Try, Tackle, Pass"
              />
              {errors.action && <p className="text-red-500 text-xs mt-1">{errors.action}</p>}
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
              <label className="block text-sm font-medium mb-1">Field Position *</label>
              <Input
                value={formData.field_position}
                onChange={(e) => setFormData({ ...formData, field_position: e.target.value })}
                placeholder="Select from rugby field above"
                readOnly
              />
              {errors.field_position && <p className="text-red-500 text-xs mt-1">{errors.field_position}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Points H (Horizontal)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.points_h}
                onChange={(e) => setFormData({ ...formData, points_h: e.target.value })}
                placeholder="0.00"
              />
              {errors.points_h && <p className="text-red-500 text-xs mt-1">{errors.points_h}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Points V (Vertical)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.points_v}
                onChange={(e) => setFormData({ ...formData, points_v: e.target.value })}
                placeholder="0.00"
              />
              {errors.points_v && <p className="text-red-500 text-xs mt-1">{errors.points_v}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            {isEditing && (
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
              {isEditing ? 'Update Tracking Data' : 'Add Tracking Data'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
