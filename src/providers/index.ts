import type { Settings } from "../game/types";
import { createGoogleProvider } from "./google";
import { createMapillaryProvider } from "./mapillary";
import { createMockProvider } from "./mock";
import type { StreetProvider } from "./types";

export function providerIsReady(settings: Settings): boolean {
  if (settings.provider === "google") return settings.googleKey.trim().length > 0;
  if (settings.provider === "mapillary") return settings.mapillaryToken.trim().length > 0;
  return true;
}

export function createProvider(settings: Settings): StreetProvider {
  switch (settings.provider) {
    case "google":
      return createGoogleProvider(settings.googleKey.trim());
    case "mapillary":
      return createMapillaryProvider(settings.mapillaryToken.trim());
    case "mock":
      return createMockProvider();
  }
}
