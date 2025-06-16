import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { MatchHeader } from '../components/MatchHeader';
import { TeamPanel } from '../components/TeamPanel';
import { ScoreInput } from '../components/ScoreInput';
import { ScoringTimeline } from '../components/ScoringTimeline';
import { MatchStatistics } from '../components/MatchStatistics';
import { QuickActions } from '../components/QuickActions';
import { useAuth } from '../hooks/useAuth';

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
  time: number; // in seconds
  teams: [Team, Team];
}

const Index = () => {
  const { user } = useAuth();
  
  const [match, setMatch] = useState<MatchData>({
    id: '1',
    title: 'Dragons vs Lions',
    date: new Date().toISOString(),
    status: 'upcoming',
    half: 1,
    time: 0,
    teams: [
      {
        id: 'team1',
        name: 'Dragons',
        logo: '🐉',
        score: 0,
        players: [
          { id: 'p1', number: 1, name: 'John Smith', tries: 0, conversions: 0, penalties: 0, dropGoals: 0 },
          { id: 'p2', number: 2, name: 'Mike Johnson', tries: 0, conversions: 0, penalties: 0, dropGoals: 0 },
          { id: 'p3', number: 3, name: 'Tom Wilson', tries: 0, conversions: 0, penalties: 0, dropGoals: 0 },
          { id: 'p4', number: 7, name: 'David Brown', tries: 0, conversions: 0, penalties: 0, dropGoals: 0 },
          { id: 'p5', number: 9, name: 'Chris Davis', tries: 0, conversions: 0, penalties: 0, dropGoals: 0 },
        ]
      },
      {
        id: 'team2',
        name: 'Lions',
        logo: '🦁',
        score: 0,
        players: [
          { id: 'p6', number: 1, name: 'Alex Miller', tries: 0, conversions: 0, penalties: 0, dropGoals: 0 },
          { id: 'p7', number: 2, name: 'Sam Taylor', tries: 0, conversions: 0, penalties: 0, dropGoals: 0 },
          { id: 'p8', number: 3, name: 'Ryan Anderson', tries: 0, conversions: 0, penalties: 0, dropGoals: 0 },
          { id: 'p9', number: 7, name: 'Luke Thomas', tries: 0, conversions: 0, penalties: 0, dropGoals: 0 },
          { id: 'p10', number: 9, name: 'Jake Martin', tries: 0, conversions: 0, penalties: 0, dropGoals: 0 },
        ]
      }
    ]
  });
  
  const [scoringEvents, setScoringEvents] = useState<ScoringEvent[]>([]);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && match.status === 'live') {
      interval = setInterval(() => {
        setMatch(prev => ({
          ...prev,
          time: prev.time + 1
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, match.status]);

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

  const handleScoreAdd = (event: Omit<ScoringEvent, 'id' | 'timestamp'>) => {
    const newEvent: ScoringEvent = {
      ...event,
      id: Date.now().toString(),
      timestamp: formatTime(match.time)
    };

    setScoringEvents(prev => [newEvent, ...prev]);

    // Update team score and player stats
    setMatch(prev => {
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
  };

  const handleStatusChange = (status: MatchData['status']) => {
    setMatch(prev => ({ ...prev, status }));
    if (status === 'live') {
      setIsTimerRunning(true);
    } else {
      setIsTimerRunning(false);
    }
  };

  if (!user) {
    return null; // This will be handled by the protected route
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
