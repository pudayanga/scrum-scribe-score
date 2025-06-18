
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/Layout';
import { QuickActions } from '@/components/QuickActions';
import { NotificationPanel } from '@/components/NotificationPanel';
import { CoachMessaging } from '@/components/CoachMessaging';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Trophy, Calendar, BarChart3, MessageSquare, Bell } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalCoaches: number;
  activeTournaments: number;
  scheduledMatches: number;
  totalPlayers: number;
  pendingMessages: number;
  unreadNotifications: number;
}

interface CoachStats {
  teamPlayers: number;
  upcomingMatches: number;
  completedMatches: number;
  totalPoints: number;
}

const Index = () => {
  const { user } = useAuth();
  const [adminStats, setAdminStats] = useState<DashboardStats>({
    totalCoaches: 0,
    activeTournaments: 0,
    scheduledMatches: 0,
    totalPlayers: 0,
    pendingMessages: 0,
    unreadNotifications: 0
  });
  const [coachStats, setCoachStats] = useState<CoachStats>({
    teamPlayers: 0,
    upcomingMatches: 0,
    completedMatches: 0,
    totalPoints: 0
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAdminStats();
    } else if (user?.role === 'coach') {
      fetchCoachStats();
    }
  }, [user]);

  const fetchAdminStats = async () => {
    try {
      // Fetch coaches count
      const { count: coachesCount } = await supabase
        .from('coaches')
        .select('*', { count: 'exact', head: true });

      // Fetch tournaments count
      const { count: tournamentsCount } = await supabase
        .from('tournaments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Fetch matches count
      const { count: matchesCount } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'upcoming');

      // Fetch players count
      const { count: playersCount } = await supabase
        .from('players')
        .select('*', { count: 'exact', head: true });

      // Fetch pending messages count
      const { count: messagesCount } = await supabase
        .from('coach_messages')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      setAdminStats({
        totalCoaches: coachesCount || 0,
        activeTournaments: tournamentsCount || 0,
        scheduledMatches: matchesCount || 0,
        totalPlayers: playersCount || 0,
        pendingMessages: messagesCount || 0,
        unreadNotifications: 0
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    }
  };

  const fetchCoachStats = async () => {
    if (!user?.team_id) return;

    try {
      // Fetch team players count
      const { count: playersCount } = await supabase
        .from('players')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', user.team_id);

      // Fetch upcoming matches for coach's team
      const { count: upcomingCount } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .or(`team1_id.eq.${user.team_id},team2_id.eq.${user.team_id}`)
        .eq('status', 'upcoming');

      // Fetch completed matches for coach's team
      const { count: completedCount } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .or(`team1_id.eq.${user.team_id},team2_id.eq.${user.team_id}`)
        .eq('status', 'completed');

      // Fetch total points scored by team
      const { data: teamMatches } = await supabase
        .from('matches')
        .select('team1_id, team2_id, team1_score, team2_score')
        .or(`team1_id.eq.${user.team_id},team2_id.eq.${user.team_id}`)
        .eq('status', 'completed');

      let totalPoints = 0;
      teamMatches?.forEach(match => {
        if (match.team1_id === user.team_id) {
          totalPoints += match.team1_score || 0;
        } else if (match.team2_id === user.team_id) {
          totalPoints += match.team2_score || 0;
        }
      });

      setCoachStats({
        teamPlayers: playersCount || 0,
        upcomingMatches: upcomingCount || 0,
        completedMatches: completedCount || 0,
        totalPoints
      });
    } catch (error) {
      console.error('Error fetching coach stats:', error);
    }
  };

  if (user?.role === 'admin') {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Coaches</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminStats.totalCoaches}</div>
                <p className="text-xs text-muted-foreground">Active coaches</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Tournaments</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminStats.activeTournaments}</div>
                <p className="text-xs text-muted-foreground">Currently running</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Scheduled Matches</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminStats.scheduledMatches}</div>
                <p className="text-xs text-muted-foreground">Upcoming matches</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Players</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminStats.totalPlayers}</div>
                <p className="text-xs text-muted-foreground">Registered players</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Messages</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminStats.pendingMessages}</div>
                <p className="text-xs text-muted-foreground">From coaches</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Notifications</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminStats.unreadNotifications}</div>
                <p className="text-xs text-muted-foreground">Unread</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {user?.full_name}</h1>
            <p className="text-gray-600">Rugby Scoring System - Coach Dashboard</p>
          </div>
          <Badge variant="outline" className="px-3 py-1">
            Role: {user?.role}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dashboard Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{coachStats.teamPlayers}</div>
                    <div className="text-sm text-gray-600">Team Players</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{coachStats.upcomingMatches}</div>
                    <div className="text-sm text-gray-600">Upcoming Matches</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{coachStats.completedMatches}</div>
                    <div className="text-sm text-gray-600">Completed Matches</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{coachStats.totalPoints}</div>
                    <div className="text-sm text-gray-600">Total Points Scored</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <NotificationPanel />
              <CoachMessaging />
            </div>
          </div>

          <div className="space-y-6">
            <QuickActions userRole={user?.role || 'coach'} />
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Team data updated</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Match schedule available</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm">New tournament notifications</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
