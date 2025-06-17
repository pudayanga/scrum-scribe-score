
import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { MatchHeader } from '../components/MatchHeader';
import { TeamPanel } from '../components/TeamPanel';
import { ScoreInput } from '../components/ScoreInput';
import { ScoringTimeline } from '../components/ScoringTimeline';
import { MatchStatistics } from '../components/MatchStatistics';
import { QuickActions } from '../components/QuickActions';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Team {
  id: string;
  name: string;
  logo: string;
  score: number;
  players: Player[];
}

export interface Player {
  id: string;
  number: number;
  name: string;
  tries: number;
  conversions: number;
  penalties: number;
  dropGoals: number;
}

export interface ScoringEvent {
  id: string;
  timestamp: string;
  teamId: string;
  teamName: string;
  playerId: string;
  playerName: string;
  playerNumber: number;
  type: 'try' | 'conversion' | 'penalty' | 'drop-goal';
  points: number;
  comment?: string;
}

export interface MatchData {
  id: string;
  title: string;
  date: string;
  status: 'upcoming' | 'live' | 'half-time' | 'ended';
  half: 1 | 2;
  time: number;
  teams: [Team, Team];
}

const Index = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [match, setMatch] = useState<MatchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [scoringEvents, setScoringEvents] = useState<ScoringEvent[]>([]);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    fetchLatestTournamentMatch();
  }, []);

  const fetchLatestTournamentMatch = async () => {
    try {
      // First, get the latest tournament (ongoing > upcoming > completed)
      let { data: tournaments, error: tournamentsError } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false });

      if (tournamentsError) throw tournamentsError;

      if (!tournaments || tournaments.length === 0) {
        setLoading(false);
        return;
      }

      // Prioritize ongoing, then upcoming, then completed
      const ongoingTournament = tournaments.find(t => t.status === 'ongoing');
      const upcomingTournament = tournaments.find(t => t.status === 'upcoming');
      const completedTournament = tournaments.find(t => t.status === 'completed');
      
      const selectedTournament = ongoingTournament || upcomingTournament || completedTournament;

      if (!selectedTournament) {
        setLoading(false);
        return;
      }

      // Get matches for this tournament
      const { data: matches, error: matchesError } = await supabase
        .from('matches')
        .select(`
          *,
          team1:teams!team1_id(id, name, logo),
          team2:teams!team2_id(id, name, logo)
        `)
        .eq('tournament_id', selectedTournament.id)
        .order('scheduled_date', { ascending: false })
        .limit(1);

      if (matchesError) throw matchesError;

      if (!matches || matches.length === 0) {
        setLoading(false);
        return;
      }

      const latestMatch = matches[0];

      // Get players for both teams
      const [team1Players, team2Players] = await Promise.all([
        supabase
          .from('players')
          .select('*')
          .eq('team_id', latestMatch.team1_id),
        supabase
          .from('players')
          .select('*')
          .eq('team_id', latestMatch.team2_id)
      ]);

      // Get player statistics for this match
      const { data: playerStats } = await supabase
        .from('player_statistics')
        .select('*')
        .eq('match_id', latestMatch.id);

      // Transform data to match the interface
      const transformPlayers = (players: any[], stats: any[]) => {
        return players.data?.map((player: any) => {
          const playerStat = stats?.find(s => s.player_id === player.id) || {};
          return {
            id: player.id,
            number: player.jersey_number,
            name: player.name,
            tries: playerStat.tries || 0,
            conversions: playerStat.conversions || 0,
            penalties: playerStat.penalties || 0,
            dropGoals: playerStat.drop_goals || 0
          };
        }) || [];
      };

      const matchData: MatchData = {
        id: latestMatch.id,
        title: `${latestMatch.team1.name} vs ${latestMatch.team2.name}`,
        date: latestMatch.scheduled_date,
        status: latestMatch.status || 'upcoming',
        half: latestMatch.half || 1,
        time: latestMatch.match_time || 0,
        teams: [
          {
            id: latestMatch.team1_id,
            name: latestMatch.team1.name,
            logo: latestMatch.team1.logo,
            score: latestMatch.team1_score || 0,
            players: transformPlayers(team1Players, playerStats || [])
          },
          {
            id: latestMatch.team2_id,
            name: latestMatch.team2.name,
            logo: latestMatch.team2.logo,
            score: latestMatch.team2_score || 0,
            players: transformPlayers(team2Players, playerStats || [])
          }
        ]
      };

      setMatch(matchData);

      // Get scoring events for this match
      const { data: events } = await supabase
        .from('scoring_events')
        .select(`
          *,
          player:players(name, jersey_number),
          team:teams(name)
        `)
        .eq('match_id', latestMatch.id)
        .order('created_at', { ascending: false });

      if (events) {
        const transformedEvents: ScoringEvent[] = events.map(event => ({
          id: event.id,
          timestamp: event.match_time,
          teamId: event.team_id,
          teamName: event.team.name,
          playerId: event.player_id,
          playerName: event.player.name,
          playerNumber: event.player.jersey_number,
          type: event.event_type as any,
          points: event.points,
          comment: event.comment
        }));
        setScoringEvents(transformedEvents);
      }

    } catch (error) {
      console.error('Error fetching tournament match:', error);
      toast({
        title: "Error",
        description: "Failed to load tournament data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && match?.status === 'live') {
      interval = setInterval(() => {
        setMatch(prev => prev ? ({
          ...prev,
          time: prev.time + 1
        }) : null);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, match?.status]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPointsForScoreType = (type: string) => {
    switch (type) {
      case 'try': return 5;
      case 'conversion': return 2;
      case 'penalty': return 3;
      case 'drop-goal': return 3;
      default: return 0;
    }
  };

  const handleScoreAdd = async (event: Omit<ScoringEvent, 'id' | 'timestamp'>) => {
    if (!match) return;

    try {
      // Save to database
      const { error } = await supabase
        .from('scoring_events')
        .insert({
          match_id: match.id,
          team_id: event.teamId,
          player_id: event.playerId,
          event_type: event.type,
          points: event.points,
          match_time: formatTime(match.time),
          comment: event.comment
        });

      if (error) throw error;

      // Update local state
      const newEvent: ScoringEvent = {
        ...event,
        id: Date.now().toString(),
        timestamp: formatTime(match.time)
      };

      setScoringEvents(prev => [newEvent, ...prev]);

      // Update match score and player stats
      setMatch(prev => {
        if (!prev) return null;
        
        const updatedTeams = prev.teams.map(team => {
          if (team.id === event.teamId) {
            return {
              ...team,
              score: team.score + event.points,
              players: team.players.map(player => {
                if (player.id === event.playerId) {
                  return {
                    ...player,
                    [event.type === 'drop-goal' ? 'dropGoals' : event.type + 's']: 
                      player[event.type === 'drop-goal' ? 'dropGoals' : event.type + 's' as keyof Player] as number + 1
                  };
                }
                return player;
              })
            };
          }
          return team;
        }) as [Team, Team];

        return {
          ...prev,
          teams: updatedTeams
        };
      });

      toast({
        title: "Success",
        description: "Score added successfully!",
      });

    } catch (error) {
      console.error('Error adding score:', error);
      toast({
        title: "Error",
        description: "Failed to add score",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = (status: MatchData['status']) => {
    if (!match) return;
    
    setMatch(prev => prev ? ({ ...prev, status }) : null);
    if (status === 'live') {
      setIsTimerRunning(true);
    } else {
      setIsTimerRunning(false);
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-8">Loading tournament data...</div>
      </Layout>
    );
  }

  if (!match) {
    return (
      <Layout>
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Rugby Scoring System</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            A modern rugby scoring application for tournaments, teams, and 
            matches with live updates and statistics.
          </p>
          <div className="bg-gray-50 rounded-lg p-8">
            <h2 className="text-xl font-semibold mb-2">No Tournament Data Available</h2>
            <p className="text-gray-600">Create a tournament and schedule matches to get started.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Main Title */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Rugby Scoring System</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          A modern rugby scoring application for tournaments, teams, and 
          matches with live updates and statistics.
        </p>
      </div>

      {/* Match Header */}
      <MatchHeader 
        match={match}
        isTimerRunning={isTimerRunning}
        onTimerToggle={() => setIsTimerRunning(!isTimerRunning)}
        onStatusChange={handleStatusChange}
        formatTime={formatTime}
        userRole={user?.role || 'viewer'}
      />

      {/* Team Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <TeamPanel team={match.teams[0]} />
        <TeamPanel team={match.teams[1]} />
      </div>

      {/* Score Input and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {(user?.role === 'coach' || user?.role === 'admin') && (
          <div className="lg:col-span-2">
            <ScoreInput 
              teams={match.teams}
              onScoreAdd={handleScoreAdd}
              userRole={user.role}
              userTeamId={undefined}
              getPointsForScoreType={getPointsForScoreType}
              isMatchLive={match.status === 'live'}
            />
          </div>
        )}
        <QuickActions userRole={user?.role || 'viewer'} />
      </div>

      {/* Timeline and Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ScoringTimeline events={scoringEvents} teams={match.teams} />
        <MatchStatistics teams={match.teams} />
      </div>

      {/* Footer */}
      <div className="text-center mt-12 pt-8 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          © 2025 Rugby Scorer • Modern rugby scoring application
        </p>
      </div>
    </Layout>
  );
};

export default Index;
