import type { GameLocation, Mode } from "../game/types";

export type ProviderErrorKind = "auth" | "network" | "coverage";

export class ProviderError extends Error {
  readonly kind: ProviderErrorKind;
  constructor(kind: ProviderErrorKind, message: string) {
    super(message);
    this.kind = kind;
    this.name = "ProviderError";
  }
}

export interface ViewerHandle {
  /** Jump back to the round's starting panorama and view. */
  returnToStart(): void;
  destroy(): void;
}

export interface ViewerCallbacks {
  onHeading(degrees: number): void;
}

export interface StreetProvider {
  readonly id: string;
  /** Find a random location that has street-level imagery. */
  findLocation(signal: AbortSignal): Promise<GameLocation>;
  /** Show the location's imagery inside the container. */
  mount(
    container: HTMLElement,
    location: GameLocation,
    mode: Mode,
    callbacks: ViewerCallbacks,
  ): Promise<ViewerHandle>;
}

export function throwIfAborted(signal: AbortSignal) {
  if (signal.aborted) throw new DOMException("Aborted", "AbortError");
}

export function randomHeading() {
  return Math.floor(Math.random() * 360);
}
