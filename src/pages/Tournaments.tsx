
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Edit, Trash2, Plus, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';

interface Tournament {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  status: string;
  coach_id?: string;
}

const Tournaments = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'upcoming'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const { user } = useAuth();
  const isCoach = user?.role === 'coach';

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      let query = supabase.from('tournaments').select('*');
      
      // Filter tournaments by coach_id for coaches
      if (isCoach && user?.id) {
        query = query.eq('coach_id', user.id);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      setTournaments(data || []);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tournaments.",
        variant: "destructive",
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tournament name is required';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }

    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    }

    if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
      newErrors.end_date = 'End date must be after start date';
    }

    // Check for duplicate tournament name
    const duplicateName = tournaments.find(t => 
      t.name.toLowerCase() === formData.name.toLowerCase().trim() && 
      t.id !== editingTournament?.id
    );
    if (duplicateName) {
      newErrors.name = 'Tournament name already exists';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const tournamentData = {
        name: formData.name.trim(),
        description: formData.description || null,
        start_date: formData.start_date,
        end_date: formData.end_date,
        status: formData.status,
        coach_id: user?.id || null // Set coach_id to current user's id
      };

      if (editingTournament) {
        const { error } = await supabase
          .from('tournaments')
          .update(tournamentData)
          .eq('id', editingTournament.id);
        
        if (error) throw error;
        toast({ title: "Success", description: "Tournament updated successfully!" });
      } else {
        const { error } = await supabase
          .from('tournaments')
          .insert([tournamentData]);
        
        if (error) throw error;
        toast({ title: "Success", description: "Tournament created successfully!" });
      }
      
      resetForm();
      setIsAddOpen(false);
      fetchTournaments();
    } catch (error) {
      console.error('Error saving tournament:', error);
      toast({ 
        title: "Error", 
        description: "Failed to save tournament. Please try again.", 
        variant: "destructive" 
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tournament?')) return;
    
    try {
      const { error } = await supabase.from('tournaments').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Success", description: "Tournament deleted successfully!" });
      fetchTournaments();
    } catch (error) {
      console.error('Error deleting tournament:', error);
      toast({ 
        title: "Error", 
        description: "Failed to delete tournament.", 
        variant: "destructive" 
      });
    }
  };

  const handleEdit = (tournament: Tournament) => {
    setEditingTournament(tournament);
    setFormData({
      name: tournament.name,
      description: tournament.description || '',
      start_date: tournament.start_date,
      end_date: tournament.end_date,
      status: tournament.status
    });
    setIsAddOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      start_date: '',
      end_date: '',
      status: 'upcoming'
    });
    setEditingTournament(null);
    setErrors({});
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Tournaments Management</h1>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Tournament
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingTournament ? 'Edit Tournament' : 'Add New Tournament'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Tournament Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter tournament name"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Tournament description"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date">Start Date *</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    />
                    {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="end_date">End Date *</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    />
                    {errors.end_date && <p className="text-red-500 text-xs mt-1">{errors.end_date}</p>}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingTournament ? 'Update Tournament' : 'Create Tournament'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tournaments</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tournaments.map((tournament) => (
                  <TableRow key={tournament.id}>
                    <TableCell className="font-medium">{tournament.name}</TableCell>
                    <TableCell>{formatDate(tournament.start_date)}</TableCell>
                    <TableCell>{formatDate(tournament.end_date)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        tournament.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                        tournament.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {tournament.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(tournament)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(tournament.id)}>
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
      </div>
    </Layout>
  );
};

export default Tournaments;
