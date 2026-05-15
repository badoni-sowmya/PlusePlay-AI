import type { MatchEvent, MatchState, Preferences } from "@/lib/types";

export function buildInsightPrompt(match: MatchState, preferences: Preferences) {
  return `You are Coach AI inside PulsePlay AI, a live second-screen sports app.
Tone: ${preferences.tone}. Favorite team: ${match[preferences.favoriteTeam].name}.
Score: ${match.home.name} ${match.home.score}-${match.away.score} ${match.away.name}.
Clock: ${Math.floor(match.clock / 60)}'. Momentum favors ${match.momentum >= 50 ? match.home.name : match.away.name} at ${Math.round(match.momentum)}.
Recent events: ${match.events.slice(0, 4).map((event) => `${event.minute}' ${event.title}`).join("; ")}.
Generate five compact JSON fields: tacticalInsight, momentumShift, playerSummary, changedGame, predictedNextEvent. Keep each field under 20 words.`;
}

export function localInsights(match: MatchState, preferences: Preferences) {
  const favorite = match[preferences.favoriteTeam];
  const opponent = match[preferences.favoriteTeam === "home" ? "away" : "home"];
  const leader = match.momentum >= 50 ? match.home : match.away;
  const trailing = match.momentum < 50 ? match.home : match.away;
  const isTrailing = favorite.score < opponent.score;
  const isLeading = favorite.score > opponent.score;
  const isDraw = favorite.score === opponent.score;
  
  const momentumText = match.momentum > 65 ? "decisively in control" : match.momentum > 55 ? "slight advantage" : match.momentum < 35 ? "under pressure" : "evenly poised";
  const toneTwist = preferences.tone === "funny"
    ? isTrailing ? "and the panic is real" : "and the chat is undefeated"
    : preferences.tone === "emotional"
      ? isTrailing ? "and the crowd holds its breath" : "and the stadium is electric"
      : preferences.tone === "genz"
        ? isTrailing ? "and the group chat is in shambles" : "and we're the main character"
        : "through systematic pressure";

  const passCompletion = Math.round((favorite.passes / (favorite.passes + opponent.passes)) * 100);
  const shotEff = favorite.shots > 0 ? Math.round((favorite.shotsOnTarget / favorite.shots) * 100) : 0;
  const topPerformer = match.players.filter(p => p.team === preferences.favoriteTeam).sort((a, b) => b.rating - a.rating)[0];

  return {
    tacticalInsight: `${leader.shortName} are ${momentumText} with ${Math.round(match.momentum)}% momentum. ${favorite.shortName} ${passCompletion}% pass accuracy under ${toneTwist}.`,
    momentumShift: `Shot efficiency at ${shotEff}%. ${isLeading ? `${favorite.shortName} lead comfortably.` : isTrailing ? `${favorite.shortName} must attack now.` : `Dead even—next goal decisive.`}`,
    playerSummary: `${topPerformer?.name} (${topPerformer?.rating}/10): ${topPerformer?.note}`,
    changedGame: `${leader.name} dominant in possession (${leader.possession}%). xG gap favors ${leader.shortName} at ${Math.abs(match.home.xg - match.away.xg).toFixed(2)}.`,
    predictedNextEvent: `Watch for ${favorite.shortName} to ${match.momentum >= 50 ? "push for a breakthrough" : "break on the counter"}—next 10 minutes critical.`
  };
}

export function hypeLine(event: MatchEvent | undefined, match: MatchState, preferences: Preferences) {
  if (!event) {
    const score = `${match.home.score}-${match.away.score}`;
    const momentum_state = match.momentum > 65 ? "the home crowd senses blood" : match.momentum < 35 ? "pressure is suffocating" : "it's wide open";
    const base = `${match.home.shortName} ${score} ${match.away.shortName}, ${momentum_state}.`;
    
    if (preferences.tone === "funny") return `${base} Somebody mute the calm analysts, the vibe is shifting.`;
    if (preferences.tone === "emotional") return `${base} You can feel every heartbeat in the stadium.`;
    if (preferences.tone === "genz") return `${base} The energy is different right now fr.`;
    return `${base} Next phase will reveal the match's true narrative.`;
  }

  const base = `${event.title}: ${event.detail}`;
  const intensity_word = event.intensity > 85 ? "HUGE" : event.intensity > 70 ? "crucial" : event.intensity > 50 ? "significant" : "notable";
  
  if (event.type === "goal") {
    if (preferences.tone === "funny") return `GOAL! ${base} The roof just left the stadium—absolute scenes.`;
    if (preferences.tone === "emotional") return `GOAL! ${base} The place is shaking. Absolute pandemonium.`;
    if (preferences.tone === "genz") return `GOAL! ${base} Bro we're cooked... wait we scored! NOOO SHOT.`;
    return `GOAL! ${base} The balance has fundamentally shifted.`;
  }
  
  if (event.type === "penalty") {
    if (preferences.tone === "funny") return `${base} The ice is on. Keeper vs striker. One moment changes everything.`;
    if (preferences.tone === "emotional") return `${base} All eyes on the penalty spot. The entire stadium holds its breath.`;
    if (preferences.tone === "genz") return `${base} This is it. This is THE moment. No cap.`;
    return `${base} Pressure at its peak. Execution decides.`;
  }
  
  if (event.type === "save") {
    if (preferences.tone === "funny") return `${base} The keeper said NO. Denied with prejudice.`;
    if (preferences.tone === "emotional") return `${base} What a stop. The hero emerges in the moment.`;
    if (preferences.tone === "genz") return `${base} Save? More like that was UNHINGED defense.`;
    return `${base} Crucial intervention. Shot expected to score.`;
  }
  
  if (event.type === "shot") {
    if (preferences.tone === "funny") return `${base} Close! The post said 'not today.'`;
    if (preferences.tone === "emotional") return `${base} So close. The drama builds.`;
    if (preferences.tone === "genz") return `${base} Bro what a chance. Wide though??? Pain.`;
    return `${base} Quality chance. Expected goals climbing.`;
  }
  
  if (event.type === "injury") {
    if (preferences.tone === "funny") return `${base} Not who you wanted to lose. This could shift everything.`;
    if (preferences.tone === "emotional") return `${base} Oh no. A key player down. Prayers for recovery.`;
    if (preferences.tone === "genz") return `${base} Not him bro. The squad depth is about to be tested.`;
    return `${base} Personnel change incoming. Tactical readjustment required.`;
  }

  if (preferences.tone === "funny") return `${base} ${intensity_word} moment. The chaos continues.`;
  if (preferences.tone === "emotional") return `${base} ${intensity_word} moment that could define this match.`;
  if (preferences.tone === "genz") return `${base} ${intensity_word} moment and the timeline is WATCHING.`;
  return `${base} Key moment. Impact: ${intensity_word}.`;
}
