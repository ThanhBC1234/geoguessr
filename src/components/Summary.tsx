import { formatDistance, formatScore, MAX_ROUND_SCORE } from "../game/geo";
import type { RoundResult } from "../game/types";
import { ResultMap } from "./ResultMap";

interface Props {
  results: RoundResult[];
  newRecord: boolean;
  onPlayAgain(): void;
  onHome(): void;
}

export function Summary({ results, newRecord, onPlayAgain, onHome }: Props) {
  const total = results.reduce((s, r) => s + r.score, 0);
  const max = results.length * MAX_ROUND_SCORE;

  return (
    <div className="summary">
      <ResultMap results={results} numbered />
      <div className="summary__panel">
        <p className="summary__eyebrow">{newRecord ? "Kỷ lục mới!" : "Kết thúc ván"}</p>
        <div className="round-result__score">
          <b>{formatScore(total)}</b> / {formatScore(max)} điểm
        </div>
        <div className="progress" aria-hidden="true">
          <div className="progress__bar" style={{ width: `${(total / max) * 100}%` }} />
        </div>
        <ol className="summary__rounds">
          {results.map((r, i) => (
            <li key={i}>
              <span className="summary__n">{i + 1}</span>
              <span>{r.distanceKm === null ? "Không đoán" : formatDistance(r.distanceKm)}</span>
              <b>{formatScore(r.score)}</b>
            </li>
          ))}
        </ol>
        <div className="row">
          <button type="button" className="btn btn--primary btn--lg" onClick={onPlayAgain} autoFocus>
            Chơi ván mới
          </button>
          <button type="button" className="btn btn--ghost btn--lg" onClick={onHome}>
            Trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}
