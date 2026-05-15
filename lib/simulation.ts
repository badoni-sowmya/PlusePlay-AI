import { clamp } from "@/lib/utils";
import { eventScripts, openingPoll } from "@/lib/mock-data";
import type { MatchEvent, MatchState, Poll } from "@/lib/types";

export function nextSimulationTick(match: MatchState, tick: number): { match: MatchState; majorEvent?: MatchEvent } {
  const nextClock = match.clock + 18;
  const minute = Math.max(1, Math.floor(nextClock / 60));
  
  // Match phases: opening (0-15), buildup (15-30), climax (30-38), with intensity patterns
  const phaseIntensity = Math.sin((minute % 38) * 0.165) * 1.2 + 1;
  
  // Much more dynamic momentum with swings
  const drift = Math.sin(tick * 0.42) * 12 + Math.cos(tick * 0.18) * 8;
  
  // Random events without strict scripting (more organic)
  const randomEventChance = 0.08 * phaseIntensity; // Higher during intense phases
  const triggersEvent = Math.random() < randomEventChance && tick > 5;
  
  const randomEvent = triggersEvent ? getRandomEvent(match, tick, minute) : undefined;
  const scriptedTemplate = !triggersEvent && tick % 4 === 0 ? eventScripts[(tick / 4) % eventScripts.length] : undefined;
  const scripted: MatchEvent | undefined = scriptedTemplate
    ? {
        ...scriptedTemplate,
        id: `e-${Date.now()}-${tick}`,
        minute
      }
    : undefined;
  const majorEvent = scripted ?? randomEvent;
  
  const momentum = clamp(
    match.momentum + 
    drift + 
    (majorEvent?.team === "home" ? 10 : majorEvent?.team === "away" ? -10 : 0) +
    (randomEvent ? 5 : 0),
    0,
    100
  );
  
  // Possession swings with more variance
  const basePossession = 50 + (momentum - 50) * 0.6;
  const possessionVariance = Math.sin(tick * 0.25) * 8;
  const homePossession = clamp(basePossession + possessionVariance, 30, 70);
  
  // Dynamic stat accumulation
  const homeScored = majorEvent?.type === "goal" && majorEvent.team === "home";
  const awayScored = majorEvent?.type === "goal" && majorEvent.team === "away";
  const homeShot = majorEvent?.team === "home" && ["shot", "goal"].includes(majorEvent.type ?? "");
  const awayShot = majorEvent?.team === "away" && ["shot", "goal"].includes(majorEvent.type ?? "");
  
  // Win probability with more dramatic swings
  const momentum_factor = (momentum - 50) / 12;
  const nextHomeWin = clamp(
    match.home.winProbability + 
    (homeScored ? 18 : awayScored ? -16 : momentum_factor) +
    (homeShot ? 2 : 0),
    5,
    92
  );
  const nextAwayWin = clamp(
    match.away.winProbability + 
    (awayScored ? 18 : homeScored ? -14 : -momentum_factor) +
    (awayShot ? 2 : 0),
    5,
    92
  );
  
  // Crowd and sentiment tied to events
  const crowdBoost = majorEvent ? majorEvent.intensity / 10 : Math.sin(tick * 0.12) * 2;
  const sentimentShift = majorEvent 
    ? (majorEvent.team === "home" ? 12 : -8)
    : Math.random() * 2 - 1;

  return {
    majorEvent,
    match: {
      ...match,
      status: minute >= 45 ? "halftime" : minute >= 90 ? "fulltime" : "live",
      clock: nextClock,
      momentum: Math.round(momentum),
      crowd: clamp(match.crowd + crowdBoost, 15, 100),
      sentiment: clamp(match.sentiment + sentimentShift, 10, 98),
      home: {
        ...match.home,
        score: match.home.score + (homeScored ? 1 : 0),
        possession: Math.round(homePossession),
        shots: match.home.shots + (homeShot ? 1 : 0),
        shotsOnTarget: match.home.shotsOnTarget + (homeScored || (majorEvent?.type === "save" && majorEvent.team === "away") ? 1 : 0),
        passes: match.home.passes + Math.round(12 + homePossession / 3.5 + (majorEvent ? 3 : 0)),
        fouls: match.home.fouls + (majorEvent?.team === "home" && majorEvent.type === "foul" ? 1 : 0),
        xg: Number((match.home.xg + (homeScored ? 0.45 : homeShot ? 0.14 : 0.03)).toFixed(2)),
        winProbability: Math.round(nextHomeWin)
      },
      away: {
        ...match.away,
        score: match.away.score + (awayScored ? 1 : 0),
        possession: Math.round(100 - homePossession),
        shots: match.away.shots + (awayShot ? 1 : 0),
        shotsOnTarget: match.away.shotsOnTarget + (awayScored || (majorEvent?.type === "save" && majorEvent.team === "home") ? 1 : 0),
        passes: match.away.passes + Math.round(10 + (100 - homePossession) / 3.5 + (majorEvent ? 3 : 0)),
        fouls: match.away.fouls + (majorEvent?.team === "away" && majorEvent.type === "foul" ? 1 : 0),
        xg: Number((match.away.xg + (awayScored ? 0.42 : awayShot ? 0.13 : 0.03)).toFixed(2)),
        winProbability: Math.round(nextAwayWin)
      },
      events: majorEvent ? [majorEvent, ...match.events].slice(0, 12) : match.events,
      poll: majorEvent ? makeEventPoll(majorEvent, match.poll) : nudgePoll(match.poll, tick),
      winProbabilityHistory: [
        ...match.winProbabilityHistory,
        { minute, home: Math.round(nextHomeWin), away: Math.round(nextAwayWin) }
      ].slice(-16),
      heatmap: match.heatmap.map((row, y) =>
        row.map((cell, x) => {
          const heat = Math.sin(tick + x + y) * 0.12 + (majorEvent?.team === "home" ? 0.04 : majorEvent?.team === "away" ? -0.02 : 0);
          return clamp(cell + heat, 0.06, 1);
        })
      )
    }
  };
}

function getRandomEvent(match: MatchState, tick: number, minute: number): MatchEvent | undefined {
  const eventTypePool: Array<[MatchEvent["type"], number]> = [
    ["shot", 35],
    ["clutch", 25],
    ["foul", 20],
    ["corner", 15],
    ["save", 12],
    ["goal", 8],
    ["substitution", 6],
    ["injury", 4],
    ["card", 3],
    ["penalty", 2]
  ];
  
  const total = eventTypePool.reduce((sum, [, weight]) => sum + weight, 0);
  let rand = Math.random() * total;
  
  let eventType: MatchEvent["type"] = "shot";
  for (const [type, weight] of eventTypePool) {
    rand -= weight;
    if (rand <= 0) {
      eventType = type;
      break;
    }
  }
  
  const team = Math.random() > 0.52 ? "home" : "away";
  const teamState = match[team];
  const eventData = generateEventDetails(eventType, team, teamState.name, minute);
  
  return {
    id: `e-${Date.now()}-${tick}`,
    minute,
    team,
    type: eventType,
    ...eventData
  };
}

function generateEventDetails(
  type: MatchEvent["type"],
  team: "home" | "away",
  teamName: string,
  minute: number
): { title: string; detail: string; intensity: number } {
  const eventMap: Record<MatchEvent["type"], (t: string, m: number) => { title: string; detail: string; intensity: number }> = {
    goal: (t, m) => ({
      title: `${t} strike gold`,
      detail: `Clinical finish caps a swift sequence. Moment of the match?`,
      intensity: 95
    }),
    shot: (t, m) => ({
      title: `${t} test the keeper`,
      detail: `Long-range attempt demands a sharp save.`,
      intensity: 55
    }),
    save: (t, m) => ({
      title: `${t} keeper stands tall`,
      detail: `Reflex stop from a point-blank chance.`,
      intensity: 70
    }),
    foul: (t, m) => ({
      title: `Tactical foul stops ${t}`,
      detail: `Hard challenge disrupts the play. Card coming?`,
      intensity: 50
    }),
    substitution: (t, m) => ({
      title: `${t} refresh their attack`,
      detail: `Fresh legs enter. Tactical shift incoming.`,
      intensity: 40
    }),
    clutch: (t, m) => ({
      title: `${t} moment of urgency`,
      detail: `High-intensity sequence with multiple chances.`,
      intensity: 75
    }),
    card: (t, m) => ({
      title: `Yellow shown to ${t}`,
      detail: `Second yellow threat now a factor.`,
      intensity: 65
    }),
    wicket: (t, m) => ({
      title: `${t} breakthrough`,
      detail: `Key player caught out. Balance shifts.`,
      intensity: 60
    }),
    corner: (t, m) => ({
      title: `${t} earn a set piece`,
      detail: `Corner kick from the right. Danger zone activated.`,
      intensity: 35
    }),
    injury: (t, m) => ({
      title: `${t} face an injury concern`,
      detail: `Player down. Assessment underway.`,
      intensity: 68
    }),
    penalty: (t, m) => ({
      title: `Penalty awarded to ${t}`,
      detail: `Clear contact in the box. Stakes raised.`,
      intensity: 92
    }),
    clearance: (t, m) => ({
      title: `${t} defend under pressure`,
      detail: `Last-ditch clearance averts danger.`,
      intensity: 45
    }),
    interception: (t, m) => ({
      title: `${t} cut out the pass`,
      detail: `Reading the game. Possession shifts.`,
      intensity: 30
    })
  };
  
  return eventMap[type](teamName, minute);
}

function makeEventPoll(event: MatchEvent, fallback: Poll): Poll {
  if (event.type === "goal") {
    return {
      id: `poll-${event.id}`,
      question: "Was that the match-defining moment?",
      options: [
        { label: "Absolutely", votes: 57 },
        { label: "Too early", votes: 26 },
        { label: "Need the replay", votes: 17 }
      ]
    };
  }

  if (event.type === "substitution") {
    return {
      id: `poll-${event.id}`,
      question: "Best tactical response?",
      options: [
        { label: "Press higher", votes: 39 },
        { label: "Protect midfield", votes: 34 },
        { label: "Go direct", votes: 27 }
      ]
    };
  }

  return { ...openingPoll, id: fallback.id === openingPoll.id ? "poll-live" : openingPoll.id };
}

function nudgePoll(poll: Poll, tick: number): Poll {
  return {
    ...poll,
    options: poll.options.map((option, index) => ({
      ...option,
      votes: option.votes + ((tick + index) % 2 === 0 ? 1 : 0)
    }))
  };
}
