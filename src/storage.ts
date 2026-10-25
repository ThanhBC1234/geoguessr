import type { Settings, Stats } from "./game/types";

const SETTINGS_KEY = "terraguess:settings";
const STATS_KEY = "terraguess:stats";

export const DEFAULT_SETTINGS: Settings = {
  provider: "google",
  googleKey: "",
  mapillaryToken: "",
  mode: "move",
  timeLimit: 0,
  rounds: 5,
};

const DEFAULT_STATS: Stats = { gamesPlayed: 0, bestScore: 0, totalScore: 0 };

function read<T extends object>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return { ...fallback };
    return { ...fallback, ...(JSON.parse(raw) as Partial<T>) };
  } catch {
    return { ...fallback };
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable (private mode); the game still works without it.
  }
}

export function loadSettings(): Settings {
  return read(SETTINGS_KEY, DEFAULT_SETTINGS);
}

export const saveSettings = (s: Settings) => write(SETTINGS_KEY, s);
export const loadStats = (): Stats => read(STATS_KEY, DEFAULT_STATS);

export function recordGame(score: number): Stats {
  const stats = loadStats();
  const next: Stats = {
    gamesPlayed: stats.gamesPlayed + 1,
    bestScore: Math.max(stats.bestScore, score),
    totalScore: stats.totalScore + score,
  };
  write(STATS_KEY, next);
  return next;
}
