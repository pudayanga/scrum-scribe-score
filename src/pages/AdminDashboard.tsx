
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, UserPlus, Settings, MessageSquare, Bell, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Layout } from '@/components/Layout';

interface Coach {
  id: string;
  username: string;
  full_name: string;
  email: string;
  is_active: boolean;
  team_id?: string;
  permissions?: {
    tournaments: boolean;
    teams: boolean;
    players: boolean;
    matches: boolean;
    statistics: boolean;
    player_tracking: boolean;
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
  };
}

const AdminDashboard = () => {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAddCoachOpen, setIsAddCoachOpen] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [newCoach, setNewCoach] = useState({
    username: '',
    full_name: '',
    email: '',
    password: 'password123'
  });
  const [notificationData, setNotificationData] = useState({
    coach_id: '',
    title: '',
    message: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCoaches();
    fetchMessages();
  }, []);

  const fetchCoaches = async () => {
    try {
      const { data: coachesData, error } = await supabase
        .from('coaches')
        .select(`
          *,
          coach_permissions (*)
        `);

      if (error) throw error;

      const formattedCoaches = coachesData?.map(coach => ({
        ...coach,
        permissions: coach.coach_permissions?.[0] || {
          tournaments: false,
          teams: false,
          players: false,
          matches: false,
          statistics: false,
          player_tracking: false
        }
      })) || [];

      setCoaches(formattedCoaches);
    } catch (error) {
      console.error('Error fetching coaches:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('coach_messages')
        .select(`
          *,
          coaches (
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleAddCoach = async () => {
    try {
      const { data: coach, error: coachError } = await supabase
        .from('coaches')
        .insert([{
          username: newCoach.username,
          password_hash: 'hashed_password', // In production, hash the password
          full_name: newCoach.full_name,
          email: newCoach.email,
          is_active: true
        }])
        .select()
        .single();

      if (coachError) throw coachError;

      // Create default permissions
      const { error: permError } = await supabase
        .from('coach_permissions')
        .insert([{
          coach_id: coach.id,
          tournaments: false,
          teams: false,
          players: false,
          matches: false,
          statistics: false,
          player_tracking: false
        }]);

      if (permError) throw permError;

      toast({
        title: "Success",
        description: "Coach added successfully!",
      });

      setNewCoach({ username: '', full_name: '', email: '', password: 'password123' });
      setIsAddCoachOpen(false);
      fetchCoaches();
    } catch (error) {
      console.error('Error adding coach:', error);
      toast({
        title: "Error",
        description: "Failed to add coach.",
        variant: "destructive",
      });
    }
  };

  const handleToggleCoachStatus = async (coachId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('coaches')
        .update({ is_active: !isActive })
        .eq('id', coachId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Coach ${!isActive ? 'activated' : 'deactivated'} successfully!`,
      });

      fetchCoaches();
    } catch (error) {
      console.error('Error updating coach status:', error);
      toast({
        title: "Error",
        description: "Failed to update coach status.",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePermissions = async (coachId: string, permissions: any) => {
    try {
      const { error } = await supabase
        .from('coach_permissions')
        .upsert({
          coach_id: coachId,
          ...permissions
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Permissions updated successfully!",
      });

      fetchCoaches();
    } catch (error) {
      console.error('Error updating permissions:', error);
      toast({
        title: "Error",
        description: "Failed to update permissions.",
        variant: "destructive",
      });
    }
  };

  const handleSendNotification = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert([{
          coach_id: notificationData.coach_id,
          title: notificationData.title,
          message: notificationData.message
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Notification sent successfully!",
      });

      setNotificationData({ coach_id: '', title: '', message: '' });
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: "Error",
        description: "Failed to send notification.",
        variant: "destructive",
      });
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
      toast({
        title: "Error",
        description: "Failed to send response.",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>

        <Tabs defaultValue="coaches" className="space-y-4">
          <TabsList>
            <TabsTrigger value="coaches">Coaches</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="coaches">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Coach Management
                  </CardTitle>
                  <Dialog open={isAddCoachOpen} onOpenChange={setIsAddCoachOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Coach
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Coach</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="username">Username</Label>
                          <Input
                            id="username"
                            value={newCoach.username}
                            onChange={(e) => setNewCoach({...newCoach, username: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="full_name">Full Name</Label>
                          <Input
                            id="full_name"
                            value={newCoach.full_name}
                            onChange={(e) => setNewCoach({...newCoach, full_name: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={newCoach.email}
                            onChange={(e) => setNewCoach({...newCoach, email: e.target.value})}
                          />
                        </div>
                        <Button onClick={handleAddCoach} className="w-full">
                          Add Coach
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coaches.map((coach) => (
                      <TableRow key={coach.id}>
                        <TableCell>{coach.full_name}</TableCell>
                        <TableCell>{coach.username}</TableCell>
                        <TableCell>{coach.email}</TableCell>
                        <TableCell>
                          <Badge variant={coach.is_active ? "default" : "destructive"}>
                            {coach.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant={coach.is_active ? "destructive" : "default"}
                              onClick={() => handleToggleCoachStatus(coach.id, coach.is_active)}
                            >
                              {coach.is_active ? "Deactivate" : "Activate"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Coach Permissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {coaches.map((coach) => (
                    <div key={coach.id} className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-3">{coach.full_name}</h4>
                      <div className="grid grid-cols-3 gap-4">
                        {Object.entries(coach.permissions || {}).map(([permission, enabled]) => (
                          <div key={permission} className="flex items-center space-x-2">
                            <Switch
                              checked={enabled}
                              onCheckedChange={(checked) => 
                                handleUpdatePermissions(coach.id, {
                                  ...coach.permissions,
                                  [permission]: checked
                                })
                              }
                            />
                            <Label className="capitalize">{permission.replace('_', ' ')}</Label>
                          </div>
                        ))}
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
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Coach Messages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <strong>{message.coaches.full_name}</strong>
                        <Badge variant={message.status === 'pending' ? "destructive" : "default"}>
                          {message.status}
                        </Badge>
                      </div>
                      <p className="text-gray-700 mb-3">{message.message}</p>
                      {message.admin_response && (
                        <div className="bg-blue-50 p-2 rounded mb-3">
                          <strong>Your Response:</strong> {message.admin_response}
                        </div>
                      )}
                      {message.status === 'pending' && (
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Type your response..."
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleRespondToMessage(message.id, e.currentTarget.value);
                                e.currentTarget.value = '';
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

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Send Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="coach_select">Select Coach</Label>
                    <Select
                      value={notificationData.coach_id}
                      onValueChange={(value) => setNotificationData({...notificationData, coach_id: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a coach" />
                      </SelectTrigger>
                      <SelectContent>
                        {coaches.map((coach) => (
                          <SelectItem key={coach.id} value={coach.id}>
                            {coach.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={notificationData.title}
                      onChange={(e) => setNotificationData({...notificationData, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={notificationData.message}
                      onChange={(e) => setNotificationData({...notificationData, message: e.target.value})}
                      rows={3}
                    />
                  </div>
                  <Button onClick={handleSendNotification} className="w-full">
                    Send Notification
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
