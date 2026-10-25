import { useEffect, useRef, useState } from "react";
import type { GameLocation, Mode } from "../game/types";
import type { StreetProvider, ViewerHandle } from "../providers/types";

interface Props {
  provider: StreetProvider;
  location: GameLocation;
  mode: Mode;
  onError(err: unknown): void;
}

export function StreetView({ provider, location, mode, onError }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const handle = useRef<ViewerHandle | null>(null);
  const [heading, setHeading] = useState(location.heading);
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  useEffect(() => {
    const container = el.current;
    if (!container) return;
    let cancelled = false;
    provider
      .mount(container, location, mode, { onHeading: (h) => !cancelled && setHeading(h) })
      .then((h) => {
        if (cancelled) h.destroy();
        else handle.current = h;
      })
      .catch((err) => !cancelled && onErrorRef.current(err));
    return () => {
      cancelled = true;
      handle.current?.destroy();
      handle.current = null;
    };
  }, [provider, location, mode]);

  return (
    <div className="street">
      <div className="street__view" ref={el} />
      {/* NMPZ: a transparent layer swallows drags and scrolls so the view stays fixed. */}
      {mode === "nmpz" && <div className="street__lock" aria-hidden="true" />}
      <div className="compass" title="La bàn" aria-label={`Hướng ${Math.round(heading)}°`}>
        <div className="compass__rose" style={{ transform: `rotate(${-heading}deg)` }}>
          <span className="compass__n">B</span>
          <svg viewBox="0 0 40 40" aria-hidden="true">
            <path d="M20 4 25 20H15z" fill="#ef4444" />
            <path d="M20 36 15 20h10z" fill="#e2e8f0" />
          </svg>
        </div>
      </div>
      <div className="street__controls">
        <button
          type="button"
          className="icon-btn icon-btn--round"
          title="Quay về điểm xuất phát"
          onClick={() => handle.current?.returnToStart()}
        >
          <svg viewBox="0 0 24 24"><path d="M5 21V4m0 0h11l-2 4 2 4H5" /></svg>
        </button>
      </div>
    </div>
  );
}
