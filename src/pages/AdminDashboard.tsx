
import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, MessageSquare, Bell, Users, Activity, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Coach {
  id: string;
  username: string;
  full_name: string;
  email: string;
  phone?: string;
  team_id?: string;
  is_active: boolean;
  teams?: {
    name: string;
  };
}

interface Message {
  id: string;
  coach_id: string;
  message: string;
  admin_response?: string;
  status: string;
  created_at: string;
  coaches: {
    full_name: string;
    username: string;
  };
}

const AdminDashboard = () => {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [isCoachDialogOpen, setIsCoachDialogOpen] = useState(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState(false);
  const { toast } = useToast();

  const [coachForm, setCoachForm] = useState({
    username: '',
    full_name: '',
    email: '',
    phone: '',
    team_id: '',
    permissions: {
      tournaments: false,
      teams: false,
      players: false,
      matches: false,
      statistics: false,
      player_tracking: false
    }
  });

  const [notificationForm, setNotificationForm] = useState({
    coach_id: '',
    title: '',
    message: ''
  });

  useEffect(() => {
    fetchCoaches();
    fetchTeams();
    fetchMessages();
  }, []);

  const fetchCoaches = async () => {
    try {
      const { data, error } = await supabase
        .from('coaches')
        .select(`
          *,
          teams (name)
        `)
        .order('full_name');

      if (error) throw error;
      setCoaches(data || []);
    } catch (error) {
      console.error('Error fetching coaches:', error);
    }
  };

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('name');

      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('coach_messages')
        .select(`
          *,
          coaches (
            full_name,
            username
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSaveCoach = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const coachData = {
        username: coachForm.username,
        password_hash: '$2b$10$rQZ8kqXz5rq3Q3q3Q3q3Q3q3Q3q3Q3q3Q3q3Q3q3Q3q3Q3q3Q',
        full_name: coachForm.full_name,
        email: coachForm.email,
        phone: coachForm.phone || null,
        team_id: coachForm.team_id || null
      };

      let coachId;
      if (selectedCoach) {
        const { error } = await supabase
          .from('coaches')
          .update(coachData)
          .eq('id', selectedCoach.id);
        
        if (error) throw error;
        coachId = selectedCoach.id;
      } else {
        const { data, error } = await supabase
          .from('coaches')
          .insert([coachData])
          .select()
          .single();
        
        if (error) throw error;
        coachId = data.id;
      }

      // Update permissions
      const { error: permError } = await supabase
        .from('coach_permissions')
        .upsert({
          coach_id: coachId,
          ...coachForm.permissions
        });

      if (permError) throw permError;

      toast({
        title: "Success",
        description: `Coach ${selectedCoach ? 'updated' : 'added'} successfully!`,
      });

      fetchCoaches();
      resetCoachForm();
      setIsCoachDialogOpen(false);
    } catch (error) {
      console.error('Error saving coach:', error);
      toast({
        title: "Error",
        description: "Failed to save coach. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleCoachStatus = async (coach: Coach) => {
    try {
      const { error } = await supabase
        .from('coaches')
        .update({ is_active: !coach.is_active })
        .eq('id', coach.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Coach ${coach.is_active ? 'deactivated' : 'activated'} successfully!`,
      });

      fetchCoaches();
    } catch (error) {
      console.error('Error updating coach status:', error);
    }
  };

  const handleDeleteCoach = async (coachId: string) => {
    if (confirm('Are you sure you want to delete this coach?')) {
      try {
        const { error } = await supabase
          .from('coaches')
          .delete()
          .eq('id', coachId);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Coach deleted successfully!",
        });

        fetchCoaches();
      } catch (error) {
        console.error('Error deleting coach:', error);
      }
    }
  };

  const handleRespondToMessage = async (messageId: string, response: string) => {
    try {
      const { error } = await supabase
        .from('coach_messages')
        .update({
          admin_response: response,
          status: 'responded'
        })
        .eq('id', messageId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Response sent successfully!",
      });

      fetchMessages();
    } catch (error) {
      console.error('Error responding to message:', error);
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('notifications')
        .insert([{
          coach_id: notificationForm.coach_id,
          title: notificationForm.title,
          message: notificationForm.message,
          is_read: false
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Notification sent successfully!",
      });

      setNotificationForm({ coach_id: '', title: '', message: '' });
      setIsNotificationDialogOpen(false);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const resetCoachForm = () => {
    setCoachForm({
      username: '',
      full_name: '',
      email: '',
      phone: '',
      team_id: '',
      permissions: {
        tournaments: false,
        teams: false,
        players: false,
        matches: false,
        statistics: false,
        player_tracking: false
      }
    });
    setSelectedCoach(null);
  };

  const editCoach = (coach: Coach) => {
    setSelectedCoach(coach);
    setCoachForm({
      username: coach.username,
      full_name: coach.full_name,
      email: coach.email,
      phone: coach.phone || '',
      team_id: coach.team_id || '',
      permissions: {
        tournaments: false,
        teams: false,
        players: false,
        matches: false,
        statistics: false,
        player_tracking: false
      }
    });
    setIsCoachDialogOpen(true);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage coaches, permissions, and system activities</p>
          </div>
        </div>

        <Tabs defaultValue="coaches" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="coaches">Coaches</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="coaches">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Coach Management</CardTitle>
                  <Button onClick={() => { resetCoachForm(); setIsCoachDialogOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Coach
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {coaches.map((coach) => (
                    <div key={coach.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{coach.full_name}</h3>
                        <p className="text-sm text-gray-600">@{coach.username} • {coach.email}</p>
                        {coach.teams && (
                          <p className="text-sm text-gray-500">Team: {coach.teams.name}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={coach.is_active ? "default" : "secondary"}>
                          {coach.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Button variant="outline" size="sm" onClick={() => editCoach(coach)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleCoachStatus(coach)}
                        >
                          {coach.is_active ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCoach(coach.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>Coach Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{message.coaches.full_name}</span>
                        <Badge variant={message.status === 'pending' ? "destructive" : "default"}>
                          {message.status}
                        </Badge>
                      </div>
                      <p className="text-gray-700 mb-2">{message.message}</p>
                      {message.admin_response && (
                        <div className="bg-blue-50 p-2 rounded">
                          <strong>Admin Response:</strong> {message.admin_response}
                        </div>
                      )}
                      {message.status === 'pending' && (
                        <div className="mt-2">
                          <Input
                            placeholder="Type your response..."
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleRespondToMessage(message.id, (e.target as HTMLInputElement).value);
                              }
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activities">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Coach Activities</CardTitle>
                  <Button>
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Coach activity tracking will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Send Notifications</CardTitle>
                  <Button onClick={() => setIsNotificationDialogOpen(true)}>
                    <Bell className="h-4 w-4 mr-2" />
                    Send Notification
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Manage and send notifications to coaches.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Coach Form Dialog */}
        <Dialog open={isCoachDialogOpen} onOpenChange={setIsCoachDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedCoach ? 'Edit Coach' : 'Add New Coach'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveCoach} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Username *</label>
                  <Input
                    value={coachForm.username}
                    onChange={(e) => setCoachForm({ ...coachForm, username: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name *</label>
                  <Input
                    value={coachForm.full_name}
                    onChange={(e) => setCoachForm({ ...coachForm, full_name: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <Input
                    type="email"
                    value={coachForm.email}
                    onChange={(e) => setCoachForm({ ...coachForm, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <Input
                    value={coachForm.phone}
                    onChange={(e) => setCoachForm({ ...coachForm, phone: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Team</label>
                <Select value={coachForm.team_id} onValueChange={(value) => setCoachForm({ ...coachForm, team_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Permissions</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(coachForm.permissions).map(([key, value]) => (
                    <label key={key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setCoachForm({
                          ...coachForm,
                          permissions: {
                            ...coachForm.permissions,
                            [key]: e.target.checked
                          }
                        })}
                      />
                      <span className="text-sm capitalize">{key.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {selectedCoach ? 'Update' : 'Add'} Coach
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsCoachDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Notification Dialog */}
        <Dialog open={isNotificationDialogOpen} onOpenChange={setIsNotificationDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Notification</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSendNotification} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Coach</label>
                <Select value={notificationForm.coach_id} onValueChange={(value) => setNotificationForm({ ...notificationForm, coach_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select coach" />
                  </SelectTrigger>
                  <SelectContent>
                    {coaches.map((coach) => (
                      <SelectItem key={coach.id} value={coach.id}>{coach.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <Input
                  value={notificationForm.title}
                  onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <Textarea
                  value={notificationForm.message}
                  onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">Send Notification</Button>
                <Button type="button" variant="outline" onClick={() => setIsNotificationDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
