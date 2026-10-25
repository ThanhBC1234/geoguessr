import L from "leaflet";
import { useEffect, useRef } from "react";
import type { RoundResult } from "../game/types";
import { createMap, guessIcon, linkLine, shiftedGuess, targetIcon, toLeaflet } from "./leaflet";

interface Props {
  results: RoundResult[];
  /** Show round numbers on the pins (summary view). */
  numbered?: boolean;
}

export function ResultMap({ results, numbered = false }: Props) {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!el.current) return;
    const map = createMap(el.current, { zoomControl: true, worldCopyJump: false });
    const points: L.LatLngExpression[] = [];
    results.forEach((r, i) => {
      const label = numbered ? String(i + 1) : "";
      const target = r.location.position;
      L.marker(toLeaflet(target), { icon: targetIcon(label), interactive: false }).addTo(map);
      points.push(toLeaflet(target));
      if (r.guess) {
        const g = shiftedGuess(r.guess, target);
        linkLine(r.guess, target).addTo(map);
        L.marker(toLeaflet(g), { icon: guessIcon(label), interactive: false }).addTo(map);
        points.push(toLeaflet(g));
      }
    });
    const fit = () => {
      map.invalidateSize({ pan: false });
      if (points.length === 1) map.setView(points[0], 6);
      else if (points.length > 1) map.fitBounds(L.latLngBounds(points), { padding: [60, 60], maxZoom: 15 });
    };
    fit();
    // Re-fit once layout has settled (the panel animates in).
    const t = window.setTimeout(fit, 250);
    return () => {
      window.clearTimeout(t);
      map.remove();
    };
  }, [results, numbered]);

  return <div className="result-map" ref={el} />;
}
