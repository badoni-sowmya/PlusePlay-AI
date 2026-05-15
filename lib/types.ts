export type TeamKey = "home" | "away";
export type Tone = "analytical" | "funny" | "emotional" | "genz";

export type MatchEventType =
  | "goal"
  | "shot"
  | "save"
  | "foul"
  | "substitution"
  | "clutch"
  | "card"
  | "wicket"
  | "corner"
  | "injury"
  | "penalty"
  | "clearance"
  | "interception";

export type TeamState = {
  name: string;
  shortName: string;
  color: string;
  score: number;
  possession: number;
  shots: number;
  shotsOnTarget: number;
  passes: number;
  fouls: number;
  xg: number;
  winProbability: number;
};

export type MatchEvent = {
  id: string;
  minute: number;
  team: TeamKey;
  type: MatchEventType;
  title: string;
  detail: string;
  intensity: number;
};

export type Poll = {
  id: string;
  question: string;
  options: Array<{ label: string; votes: number }>;
};

export type Player = {
  name: string;
  team: TeamKey;
  rating: number;
  note: string;
};

export type MatchState = {
  status: "pre" | "live" | "halftime" | "fulltime";
  clock: number;
  home: TeamState;
  away: TeamState;
  momentum: number;
  crowd: number;
  sentiment: number;
  events: MatchEvent[];
  poll: Poll;
  players: Player[];
  winProbabilityHistory: Array<{ minute: number; home: number; away: number }>;
  heatmap: number[][];
};

export type Preferences = {
  favoriteTeam: TeamKey;
  favoritePlayers: string[];
  tone: Tone;
};
