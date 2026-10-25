import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { LatLng } from "../game/types";

export const TILE_URL = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a>';

export function createMap(el: HTMLElement, options: L.MapOptions = {}) {
  const map = L.map(el, {
    center: [20, 0],
    zoom: 1,
    minZoom: 1,
    worldCopyJump: true,
    zoomControl: false,
    attributionControl: true,
    ...options,
  });
  L.tileLayer(TILE_URL, { attribution: TILE_ATTRIBUTION, subdomains: "abcd", maxZoom: 19 }).addTo(map);
  map.attributionControl.setPrefix(false);
  return map;
}

export function guessIcon(label = "") {
  return L.divIcon({
    className: "pin pin--guess",
    html: `<span>${label}</span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

export function targetIcon(label = "") {
  return L.divIcon({
    className: "pin pin--target",
    html: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 21V4m0 0h11l-2 4 2 4H5" /></svg>${label ? `<b>${label}</b>` : ""}`,
    iconSize: [34, 34],
    iconAnchor: [9, 31],
  });
}

export function toLeaflet(p: LatLng): L.LatLngExpression {
  return [p.lat, p.lng];
}

/** Guess longitude shifted so a line to the target takes the short way round the globe. */
export function shiftedGuess(guess: LatLng, target: LatLng): LatLng {
  let lng = guess.lng;
  while (lng - target.lng > 180) lng -= 360;
  while (target.lng - lng > 180) lng += 360;
  return { lat: guess.lat, lng };
}

export function linkLine(guess: LatLng, target: LatLng) {
  return L.polyline([toLeaflet(shiftedGuess(guess, target)), toLeaflet(target)], {
    color: "#0f172a",
    weight: 3,
    dashArray: "2 8",
    lineCap: "round",
    opacity: 0.85,
  });
}
