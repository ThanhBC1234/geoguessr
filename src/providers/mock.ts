import type { GameLocation } from "../game/types";
import type { StreetProvider, ViewerHandle } from "./types";

/**
 * Development-only provider: fixed places and a drawn "panorama",
 * so the UI can be exercised without API keys or network access.
 */
const PLACES: GameLocation[] = [
  { position: { lat: 48.8584, lng: 2.2945 }, panoId: "paris", heading: 30 },
  { position: { lat: 35.6595, lng: 139.7005 }, panoId: "tokyo", heading: 120 },
  { position: { lat: -33.8568, lng: 151.2153 }, panoId: "sydney", heading: 200 },
  { position: { lat: 40.758, lng: -73.9855 }, panoId: "new-york", heading: 300 },
  { position: { lat: -22.9519, lng: -43.2105 }, panoId: "rio", heading: 90 },
  { position: { lat: 21.0285, lng: 105.8542 }, panoId: "hanoi", heading: 10 },
];

export function createMockProvider(): StreetProvider {
  let next = 0;
  return {
    id: "mock",
    async findLocation() {
      await new Promise((r) => setTimeout(r, 150));
      return PLACES[next++ % PLACES.length];
    },
    async mount(container, location, _mode, callbacks): Promise<ViewerHandle> {
      const el = document.createElement("div");
      el.style.cssText =
        "position:absolute;inset:0;display:grid;place-items:center;color:#fff8;font:600 20px sans-serif;" +
        "background:linear-gradient(180deg,#7dd3fc 0%,#bae6fd 45%,#65a30d 46%,#3f6212 100%)";
      el.textContent = `Ảnh giả lập (dev) – ${location.panoId}`;
      container.replaceChildren(el);
      callbacks.onHeading(location.heading);
      return {
        returnToStart() {
          callbacks.onHeading(location.heading);
        },
        destroy() {
          container.replaceChildren();
        },
      };
    },
  };
}
