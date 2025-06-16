
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AddPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Team {
  id: string;
  name: string;
}

export const AddPlayerModal = ({ isOpen, onClose }: AddPlayerModalProps) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    jersey_number: '',
    position: '',
    age: '',
    height: '',
    weight: '',
    email: '',
    phone: '',
    team_id: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.jersey_number) newErrors.jersey_number = 'Jersey number is required';
    if (!formData.team_id) newErrors.team_id = 'Team is required';
    
    const jerseyNum = parseInt(formData.jersey_number);
    if (isNaN(jerseyNum) || jerseyNum < 1 || jerseyNum > 99) {
      newErrors.jersey_number = 'Jersey number must be between 1 and 99';
    }

    if (formData.age && (parseInt(formData.age) < 16 || parseInt(formData.age) > 50)) {
      newErrors.age = 'Age must be between 16 and 50';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const playerData = {
        name: formData.name.trim(),
        jersey_number: parseInt(formData.jersey_number),
        position: formData.position || null,
        age: formData.age ? parseInt(formData.age) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        email: formData.email || null,
        phone: formData.phone || null,
        team_id: formData.team_id
      };

      const { error } = await supabase
        .from('players')
        .insert([playerData]);
      
      if (error) throw error;

      toast({
        title: "Success",
        description: "Player added successfully!",
      });

      resetForm();
      onClose();
    } catch (error) {
      console.error('Error saving player:', error);
      toast({
        title: "Error",
        description: "Failed to add player. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      jersey_number: '',
      position: '',
      age: '',
      height: '',
      weight: '',
      email: '',
      phone: '',
      team_id: ''
    });
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Player</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Player name"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Jersey Number *</label>
            <Input
              type="number"
              value={formData.jersey_number}
              onChange={(e) => setFormData({ ...formData, jersey_number: e.target.value })}
              placeholder="1-99"
              min="1"
              max="99"
            />
            {errors.jersey_number && <p className="text-red-500 text-xs mt-1">{errors.jersey_number}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Team *</label>
            <Select value={formData.team_id} onValueChange={(value) => setFormData({ ...formData, team_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.team_id && <p className="text-red-500 text-xs mt-1">{errors.team_id}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Position</label>
            <Input
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              placeholder="e.g., Forward, Back"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium mb-1">Age</label>
              <Input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="16-50"
              />
              {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Height (cm)</label>
              <Input
                type="number"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                placeholder="170"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Weight (kg)</label>
            <Input
              type="number"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              placeholder="70"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="player@example.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Phone number"
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              Add Player
            </Button>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
