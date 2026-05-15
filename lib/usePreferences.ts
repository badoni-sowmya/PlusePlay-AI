import { useState, useEffect } from "react";
import type { Preferences } from "@/lib/types";

const defaultPreferences: Preferences = {
  favoriteTeam: "home",
  favoritePlayers: ["Maya Chen", "Leo Ramos"],
  tone: "analytical"
};

export function usePreferences() {
  const [preferences, setPreferencesState] = useState<Preferences>(defaultPreferences);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem("pulseplay-preferences");
      if (saved) {
        setPreferencesState(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Failed to load preferences:", e);
    }
    setLoaded(true);
  }, []);

  // Save to localStorage whenever preferences change
  const setPreferences = (prefs: Preferences) => {
    setPreferencesState(prefs);
    if (typeof window !== "undefined") {
      localStorage.setItem("pulseplay-preferences", JSON.stringify(prefs));
    }
  };

  return { preferences, setPreferences, loaded };
}
