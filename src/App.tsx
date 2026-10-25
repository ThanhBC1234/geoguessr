import { useCallback, useEffect, useState } from "react";
import { Game } from "./components/Game";
import { Home } from "./components/Home";
import { Summary } from "./components/Summary";
import type { RoundResult, Settings } from "./game/types";
import { loadSettings, loadStats, recordGame, saveSettings } from "./storage";

type Screen = { name: "home" } | { name: "game"; id: number } | { name: "summary"; results: RoundResult[]; newRecord: boolean };

export function App() {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [stats, setStats] = useState(loadStats);
  const [screen, setScreen] = useState<Screen>({ name: "home" });

  useEffect(() => saveSettings(settings), [settings]);

  const play = useCallback(() => setScreen({ name: "game", id: Date.now() }), []);
  const home = useCallback(() => setScreen({ name: "home" }), []);
  const finish = useCallback((results: RoundResult[]) => {
    const total = results.reduce((s, r) => s + r.score, 0);
    const newRecord = total > 0 && total > loadStats().bestScore;
    setStats(recordGame(total));
    setScreen({ name: "summary", results, newRecord });
  }, []);

  if (screen.name === "game") {
    return <Game key={screen.id} settings={settings} onFinish={finish} onQuit={home} />;
  }
  if (screen.name === "summary") {
    return <Summary results={screen.results} newRecord={screen.newRecord} onPlayAgain={play} onHome={home} />;
  }
  return <Home settings={settings} stats={stats} onChange={setSettings} onPlay={play} />;
}
