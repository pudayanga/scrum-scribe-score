
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  message: string;
  admin_response?: string;
  status: string;
  created_at: string;
}

export const CoachMessaging = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
  }, [user?.id]);

  const fetchMessages = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('coach_messages')
        .select('*')
        .eq('coach_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user?.id) return;

    try {
      const { error } = await supabase
        .from('coach_messages')
        .insert([{
          coach_id: user.id,
          message: newMessage.trim(),
          status: 'pending'
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Message sent to admin successfully!",
      });

      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageSquare className="h-5 w-5 mr-2" />
          Messages with Admin
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
          {messages.map((message) => (
            <div key={message.id} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">
                  {new Date(message.created_at).toLocaleDateString()}
                </span>
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
            </div>
          ))}
        </div>

        <form onSubmit={handleSendMessage} className="space-y-3">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message to admin..."
            rows={3}
            required
          />
          <Button type="submit" className="w-full">
            <Send className="h-4 w-4 mr-2" />
            Send Message
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
