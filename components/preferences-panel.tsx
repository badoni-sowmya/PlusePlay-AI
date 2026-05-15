"use client";

import { Settings2, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { MatchState, Preferences, Tone } from "@/lib/types";

const tones: Array<{ value: Tone; label: string }> = [
  { value: "analytical", label: "Analytical" },
  { value: "funny", label: "Funny" },
  { value: "emotional", label: "Emotional" },
  { value: "genz", label: "Gen Z" }
];

export function PreferencesPanel({
  match,
  preferences,
  setPreferences
}: {
  match: MatchState;
  preferences: Preferences;
  setPreferences: (preferences: Preferences) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Personalized Feed</CardTitle>
        <Settings2 className="h-4 w-4 text-cyan-200" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="mb-2 text-xs font-bold uppercase text-white/44">Favorite team</div>
          <div className="grid grid-cols-2 gap-2">
            {(["home", "away"] as const).map((team) => (
              <Button
                key={team}
                variant={preferences.favoriteTeam === team ? "primary" : "secondary"}
                size="sm"
                onClick={() => setPreferences({ ...preferences, favoriteTeam: team })}
              >
                <Star className="h-4 w-4" />
                {match[team].shortName}
              </Button>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-2 text-xs font-bold uppercase text-white/44">Commentary tone</div>
          <div className="grid grid-cols-2 gap-2">
            {tones.map((tone) => (
              <Button
                key={tone.value}
                variant={preferences.tone === tone.value ? "primary" : "secondary"}
                size="sm"
                onClick={() => setPreferences({ ...preferences, tone: tone.value })}
              >
                {tone.label}
              </Button>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-2 text-xs font-bold uppercase text-white/44">Favorite players</div>
          <div className="flex flex-wrap gap-2">
            {match.players.map((player) => {
              const active = preferences.favoritePlayers.includes(player.name);
              return (
                <button
                  key={player.name}
                  onClick={() =>
                    setPreferences({
                      ...preferences,
                      favoritePlayers: active
                        ? preferences.favoritePlayers.filter((name) => name !== player.name)
                        : [...preferences.favoritePlayers, player.name]
                    })
                  }
                  className={`rounded-full border px-3 py-1 text-xs transition ${active ? "border-cyan-200 bg-cyan-300/16 text-cyan-50" : "border-white/12 bg-white/[0.04] text-white/62 hover:text-white"}`}
                >
                  {player.name}
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
