import L from "leaflet";
import { useEffect, useRef, useState } from "react";
import { wrapLng } from "../game/geo";
import type { LatLng } from "../game/types";
import { createMap, guessIcon, toLeaflet } from "./leaflet";

type Size = 1 | 2 | 3;

interface Props {
  guess: LatLng | null;
  onGuess(p: LatLng): void;
  onSubmit(): void;
  disabled: boolean;
}

/** Minimap in the corner: grows on hover, click to place a pin, then press Guess. */
export function GuessMap({ guess, onGuess, onSubmit, disabled }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const marker = useRef<L.Marker | null>(null);
  const onGuessRef = useRef(onGuess);
  onGuessRef.current = onGuess;
  const [size, setSize] = useState<Size>(1);
  const [pinned, setPinned] = useState(false);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    if (!el.current) return;
    const m = createMap(el.current);
    m.on("click", (e: L.LeafletMouseEvent) => {
      onGuessRef.current({ lat: e.latlng.lat, lng: wrapLng(e.latlng.lng) });
    });
    map.current = m;
    return () => {
      m.remove();
      map.current = null;
      marker.current = null;
    };
  }, []);

  useEffect(() => {
    const m = map.current;
    if (!m) return;
    if (!guess) {
      marker.current?.remove();
      marker.current = null;
      return;
    }
    if (marker.current) marker.current.setLatLng(toLeaflet(guess));
    else marker.current = L.marker(toLeaflet(guess), { icon: guessIcon(), interactive: false }).addTo(m);
  }, [guess]);

  const expanded = pinned || hover;
  const effectiveSize = expanded ? Math.max(size, 2) : 1;

  // Leaflet must re-measure after the container is resized by CSS.
  useEffect(() => {
    const t = window.setTimeout(() => map.current?.invalidateSize({ pan: false }), 220);
    return () => window.clearTimeout(t);
  }, [effectiveSize]);

  return (
    <div
      className={`guess-map guess-map--s${effectiveSize}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="guess-map__tools" aria-label="Kích thước bản đồ">
        <button
          type="button"
          className="icon-btn"
          title="Phóng to bản đồ"
          onClick={() => {
            setSize((s) => (Math.min(3, s + 1) as Size));
            setPinned(true);
          }}
        >
          <svg viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg>
        </button>
        <button
          type="button"
          className="icon-btn"
          title="Thu nhỏ bản đồ"
          onClick={() => {
            setSize((s) => (Math.max(1, s - 1) as Size));
            if (size <= 2) setPinned(false);
          }}
        >
          <svg viewBox="0 0 24 24"><path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" /></svg>
        </button>
        <button
          type="button"
          className={`icon-btn ${pinned ? "is-active" : ""}`}
          title={pinned ? "Bỏ ghim" : "Ghim bản đồ mở rộng"}
          onClick={() => setPinned((p) => !p)}
        >
          <svg viewBox="0 0 24 24"><path d="M12 17v5M9 3h6l-1 6 4 4H6l4-4z" /></svg>
        </button>
      </div>
      <div className="guess-map__map" ref={el} />
      <button type="button" className="btn btn--primary guess-map__submit" disabled={!guess || disabled} onClick={onSubmit}>
        {guess ? "Đoán" : "Đặt ghim lên bản đồ"}
      </button>
    </div>
  );
}
