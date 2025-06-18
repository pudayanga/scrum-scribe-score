
export interface Player {
  id: string;
  name: string;
  number: number;
  tries: number;
  conversions: number;
  penalties: number;
  dropGoals: number;
}

export interface Team {
  id: string;
  name: string;
  logo: string;
  score: number;
  players: Player[];
}

export interface MatchData {
  id: string;
  title: string;
  date: string;
  status: 'live' | 'half-time' | 'upcoming' | 'ended';
  half: number;
  time: number;
}

export interface ScoringEvent {
  id: string;
  teamId: string;
  teamName: string;
  playerId: string;
  playerName: string;
  playerNumber: number;
  type: 'try' | 'conversion' | 'penalty' | 'drop-goal';
  points: number;
  timestamp: string;
  comment?: string;
}
