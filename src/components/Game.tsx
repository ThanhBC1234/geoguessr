import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { distanceKm, formatDistance, formatScore, MAX_ROUND_SCORE, scoreForDistance } from "../game/geo";
import type { GameLocation, LatLng, RoundResult, Settings } from "../game/types";
import { createProvider } from "../providers";
import { ProviderError } from "../providers/types";
import { GuessMap } from "./GuessMap";
import { Logo } from "./Logo";
import { ResultMap } from "./ResultMap";
import { StreetView } from "./StreetView";

type Phase = "loading" | "playing" | "result" | "error";

export const MODE_LABELS = { move: "Di chuyển", nomove: "Không di chuyển", nmpz: "NMPZ" } as const;

interface Props {
  settings: Settings;
  onFinish(results: RoundResult[]): void;
  onQuit(): void;
}

function errorMessage(err: unknown) {
  if (err instanceof ProviderError) return err.message;
  return "Đã xảy ra lỗi không mong muốn. Thử lại nhé.";
}

function formatClock(seconds: number) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function Game({ settings, onFinish, onQuit }: Props) {
  const provider = useMemo(() => createProvider(settings), [settings]);
  const [round, setRound] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [phase, setPhase] = useState<Phase>("loading");
  const [location, setLocation] = useState<GameLocation | null>(null);
  const [guess, setGuess] = useState<LatLng | null>(null);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(settings.timeLimit);

  const queue = useRef<(Promise<GameLocation> | undefined)[]>([]);
  const abort = useRef<AbortController | null>(null);
  const roundStart = useRef(0);
  const guessRef = useRef(guess);
  guessRef.current = guess;

  const fail = useCallback((err: unknown) => {
    if ((err as Error)?.name === "AbortError") return;
    setError(errorMessage(err));
    setPhase("error");
  }, []);

  // One abort controller per provider; cancels outstanding searches on exit.
  useEffect(() => {
    const ac = new AbortController();
    abort.current = ac;
    queue.current = [];
    return () => ac.abort();
  }, [provider]);

  /** Locations are searched one after another so the next round is ready in the background. */
  const ensureLocation = useCallback(
    (i: number) => {
      if (i >= settings.rounds || !abort.current) return undefined;
      if (!queue.current[i]) {
        const signal = abort.current.signal;
        const prev = queue.current[i - 1] ?? Promise.resolve();
        const p = prev.catch(() => undefined).then(() => provider.findLocation(signal));
        p.catch(() => undefined);
        queue.current[i] = p;
      }
      return queue.current[i];
    },
    [provider, settings.rounds],
  );

  useEffect(() => {
    let stale = false;
    setPhase("loading");
    setLocation(null);
    setGuess(null);
    ensureLocation(round)
      ?.then((loc) => {
        if (stale) return;
        // The round starts (and the clock) once the viewer reports it is ready.
        setLocation(loc);
        ensureLocation(round + 1);
      })
      .catch((err) => {
        if (stale) return;
        queue.current[round] = undefined;
        fail(err);
      });
    return () => {
      stale = true;
    };
  }, [round, attempt, ensureLocation, fail]);

  const onViewerReady = useCallback(() => {
    roundStart.current = performance.now();
    setTimeLeft(settings.timeLimit);
    setPhase((p) => (p === "loading" ? "playing" : p));
  }, [settings.timeLimit]);

  useEffect(() => {
    const onAuth = () =>
      fail(new ProviderError("auth", "Google từ chối API key. Kiểm tra key và các giới hạn tên miền của key."));
    window.addEventListener("terraguess:auth-failure", onAuth);
    return () => window.removeEventListener("terraguess:auth-failure", onAuth);
  }, [fail]);

  const submit = useCallback(() => {
    if (phase !== "playing" || !location) return;
    const g = guessRef.current;
    const d = g ? distanceKm(g, location.position) : null;
    const result: RoundResult = {
      location,
      guess: g,
      distanceKm: d,
      score: d === null ? 0 : scoreForDistance(d),
      seconds: (performance.now() - roundStart.current) / 1000,
    };
    setResults((r) => [...r, result]);
    setPhase("result");
  }, [phase, location]);

  const next = useCallback(() => {
    if (phase !== "result") return;
    if (round + 1 >= settings.rounds) onFinish(results);
    else setRound((r) => r + 1);
  }, [phase, round, settings.rounds, onFinish, results]);

  // Countdown: when time runs out the placed pin (if any) is submitted.
  useEffect(() => {
    if (phase !== "playing" || settings.timeLimit <= 0) return;
    const id = window.setInterval(() => {
      const left = settings.timeLimit - (performance.now() - roundStart.current) / 1000;
      setTimeLeft(left);
      if (left <= 0) {
        window.clearInterval(id);
        submit();
      }
    }, 200);
    return () => window.clearInterval(id);
  }, [phase, settings.timeLimit, submit]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("button, input, select, textarea")) return;
      if (e.code !== "Space" && e.code !== "Enter") return;
      if (phase === "playing" && guessRef.current) {
        e.preventDefault();
        submit();
      } else if (phase === "result") {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, submit, next]);

  const total = results.reduce((s, r) => s + r.score, 0);
  const last = results[results.length - 1];
  const isLastRound = round + 1 >= settings.rounds;
  const lowTime = settings.timeLimit > 0 && timeLeft <= 10;

  return (
    <div className="game">
      {location && phase !== "error" && (
        <StreetView
          key={`view-${round}`}
          provider={provider}
          location={location}
          mode={settings.mode}
          onReady={onViewerReady}
          onError={fail}
        />
      )}

      <header className="hud">
        <div className="hud__left">
          <Logo small />
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => {
              if (phase === "error" || window.confirm("Thoát ván này? Điểm của ván sẽ không được lưu.")) onQuit();
            }}
          >
            Thoát
          </button>
        </div>
        {settings.timeLimit > 0 && phase === "playing" && (
          <div className={`timer ${lowTime ? "timer--low" : ""}`} role="timer">
            {formatClock(timeLeft)}
          </div>
        )}
        <div className="status">
          <div className="status__item">
            <span>Chế độ</span>
            <b>{MODE_LABELS[settings.mode]}</b>
          </div>
          <div className="status__item">
            <span>Vòng</span>
            <b>
              {round + 1} / {settings.rounds}
            </b>
          </div>
          <div className="status__item">
            <span>Điểm</span>
            <b>{formatScore(total)}</b>
          </div>
        </div>
      </header>

      {phase === "playing" && (
        <GuessMap key={`map-${round}`} guess={guess} onGuess={setGuess} onSubmit={submit} disabled={false} />
      )}

      {phase === "loading" && (
        <div className="overlay overlay--center">
          <div className="spinner" aria-hidden="true" />
          <p>Đang tìm một nơi bất kỳ trên thế giới…</p>
        </div>
      )}

      {phase === "error" && (
        <div className="overlay overlay--center">
          <div className="card card--narrow">
            <h2>Không thể tiếp tục</h2>
            <p>{error}</p>
            <div className="row">
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => {
                  setError("");
                  setAttempt((a) => a + 1);
                }}
              >
                Thử lại
              </button>
              <button type="button" className="btn btn--ghost" onClick={onQuit}>
                Về trang chủ
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === "result" && last && (
        <div className="round-result">
          <ResultMap results={[last]} />
          <div className="round-result__panel">
            <div className="round-result__score">
              <b>{formatScore(last.score)}</b> điểm
            </div>
            <div className="progress" aria-hidden="true">
              <div className="progress__bar" style={{ width: `${(last.score / MAX_ROUND_SCORE) * 100}%` }} />
            </div>
            <p className="round-result__text">
              {last.distanceKm === null
                ? "Hết giờ mà bạn chưa đặt ghim."
                : `Bạn đoán cách vị trí đúng ${formatDistance(last.distanceKm)}.`}
            </p>
            <button type="button" className="btn btn--primary btn--lg" onClick={next} autoFocus>
              {isLastRound ? "Xem kết quả" : "Vòng tiếp theo"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
