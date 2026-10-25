import type { LatLng } from "./types";

const EARTH_RADIUS_KM = 6371.0088;

/** Diagonal of the world map in km, used to scale the score curve. */
export const WORLD_SCALE_KM = 14916.862;
export const MAX_ROUND_SCORE = 5000;
/** Guesses closer than this always get full points. */
const PERFECT_RADIUS_KM = 0.025;

const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Great-circle distance in kilometres. */
export function distanceKm(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Points for a guess: 5000 at the spot, decaying exponentially with distance. */
export function scoreForDistance(km: number, scaleKm = WORLD_SCALE_KM): number {
  if (!Number.isFinite(km) || km < 0) return 0;
  if (km <= PERFECT_RADIUS_KM) return MAX_ROUND_SCORE;
  return Math.round(MAX_ROUND_SCORE * Math.exp((-10 * km) / scaleKm));
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km).toLocaleString("vi-VN")} km`;
}

export function formatScore(points: number): string {
  return points.toLocaleString("vi-VN");
}

/** Wrap longitude into [-180, 180). */
export function wrapLng(lng: number): number {
  return ((((lng + 180) % 360) + 360) % 360) - 180;
}
