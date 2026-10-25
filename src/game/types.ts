export interface LatLng {
  lat: number;
  lng: number;
}

/** Move = free walking, No Move = look around only, NMPZ = no move, pan or zoom. */
export type Mode = "move" | "nomove" | "nmpz";

export type ProviderId = "google" | "mapillary" | "mock";

export interface Settings {
  provider: ProviderId;
  googleKey: string;
  mapillaryToken: string;
  mode: Mode;
  /** Seconds per round. 0 means no limit. */
  timeLimit: number;
  rounds: number;
}

export interface GameLocation {
  position: LatLng;
  /** Provider-specific id of the panorama / image. */
  panoId: string;
  heading: number;
}

export interface RoundResult {
  location: GameLocation;
  guess: LatLng | null;
  distanceKm: number | null;
  score: number;
  seconds: number;
}

export interface Stats {
  gamesPlayed: number;
  bestScore: number;
  totalScore: number;
}
