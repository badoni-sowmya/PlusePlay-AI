import type { MatchEvent, MatchState, Poll } from "@/lib/types";

export const openingPoll: Poll = {
  id: "poll-kickoff",
  question: "Who owns the next five minutes?",
  options: [
    { label: "NYC Velocity", votes: 42 },
    { label: "Miami Solar", votes: 35 },
    { label: "Chaos ball", votes: 23 }
  ]
};

export const initialMatch: MatchState = {
  status: "pre",
  clock: 17 * 60 + 34,
  home: {
    name: "NYC Velocity",
    shortName: "NYC",
    color: "#22d3ee",
    score: 1,
    possession: 57,
    shots: 7,
    shotsOnTarget: 4,
    passes: 248,
    fouls: 5,
    xg: 1.42,
    winProbability: 58
  },
  away: {
    name: "Miami Solar",
    shortName: "MIA",
    color: "#ff8b3d",
    score: 1,
    possession: 43,
    shots: 5,
    shotsOnTarget: 2,
    passes: 189,
    fouls: 7,
    xg: 0.91,
    winProbability: 26
  },
  momentum: 64,
  crowd: 78,
  sentiment: 61,
  events: [
    {
      id: "e-1",
      minute: 4,
      team: "home",
      type: "shot",
      title: "Early press creates a chance",
      detail: "Ramos forced the turnover and bent one just wide.",
      intensity: 42
    },
    {
      id: "e-2",
      minute: 11,
      team: "away",
      type: "goal",
      title: "Solar counter strikes",
      detail: "Okafor finished a two-pass break from the left channel.",
      intensity: 88
    },
    {
      id: "e-3",
      minute: 16,
      team: "home",
      type: "goal",
      title: "Velocity equalize",
      detail: "Chen attacked the near post and redirected the cross.",
      intensity: 92
    }
  ],
  poll: openingPoll,
  players: [
    { name: "Maya Chen", team: "home", rating: 8.8, note: "Timing every near-post run perfectly." },
    { name: "Leo Ramos", team: "home", rating: 8.1, note: "Press trigger and first pass are sharp." },
    { name: "Kira Santos", team: "home", rating: 7.9, note: "Covering ground defensively all match." },
    { name: "Jude Wallace", team: "home", rating: 7.4, note: "Creative in midfield but loose in defense." },
    { name: "Alex Rivera", team: "home", rating: 8.3, note: "Left-back overlapping constantly." },
    { name: "Tariq Okafor", team: "away", rating: 8.6, note: "Punishing space behind the high line." },
    { name: "Nina Vale", team: "away", rating: 7.7, note: "Keeping Miami alive with recovery saves." },
    { name: "Jasper King", team: "away", rating: 8.0, note: "Right winger finding pockets of space." },
    { name: "Sofia Mendes", team: "away", rating: 7.5, note: "Distributing from the back under pressure." },
    { name: "Dakota Lee", team: "away", rating: 7.8, note: "Box-to-box intensity never drops." }
  ],
  winProbabilityHistory: [
    { minute: 1, home: 44, away: 32 },
    { minute: 6, home: 49, away: 28 },
    { minute: 11, home: 31, away: 49 },
    { minute: 16, home: 51, away: 29 },
    { minute: 18, home: 58, away: 26 }
  ],
  heatmap: [
    [0.14, 0.18, 0.3, 0.44, 0.5, 0.34, 0.22],
    [0.2, 0.28, 0.48, 0.72, 0.68, 0.4, 0.25],
    [0.32, 0.46, 0.7, 0.92, 0.78, 0.48, 0.3],
    [0.18, 0.34, 0.56, 0.62, 0.52, 0.36, 0.2]
  ]
};

export const eventScripts: Omit<MatchEvent, "id" | "minute">[] = [
  {
    team: "home",
    type: "clutch",
    title: "Velocity overload the right side",
    detail: "Three runners rotate through the half-space and drag Miami narrow.",
    intensity: 72
  },
  {
    team: "away",
    type: "save",
    title: "Vale denies the tap-in",
    detail: "A reflex stop turns a certain goal into a corner.",
    intensity: 79
  },
  {
    team: "home",
    type: "goal",
    title: "Chen breaks the line again",
    detail: "The favorite finds the far corner after a disguised through ball.",
    intensity: 96
  },
  {
    team: "away",
    type: "substitution",
    title: "Solar add vertical speed",
    detail: "A fresh winger arrives to attack the tired fullback.",
    intensity: 48
  },
  {
    team: "away",
    type: "foul",
    title: "Tactical foul stops the break",
    detail: "Miami choose the yellow-card math over a three-on-two sprint.",
    intensity: 58
  },
  {
    team: "home",
    type: "shot",
    title: "Ramos rattles the bar",
    detail: "The stadium lifted before the ball kissed the crossbar.",
    intensity: 83
  },
  {
    team: "home",
    type: "corner",
    title: "Velocity earn a set piece",
    detail: "A driven cross forces Miami wide, and the corner flag is up.",
    intensity: 35
  },
  {
    team: "away",
    type: "injury",
    title: "Solar midfielder goes down",
    detail: "Miami's playmaker limps off after a hard challenge.",
    intensity: 62
  },
  {
    team: "home",
    type: "penalty",
    title: "Handball in the box",
    detail: "Chen's shot hits an outstretched arm, and the ref points to the spot.",
    intensity: 95
  },
  {
    team: "away",
    type: "clearance",
    title: "Vale clears under pressure",
    detail: "Miami's keeper punches a dangerous cross away from goal.",
    intensity: 41
  }
];
