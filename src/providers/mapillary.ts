import { randomCityPoint } from "../game/regions";
import type { GameLocation, Mode } from "../game/types";
import {
  ProviderError,
  randomHeading,
  throwIfAborted,
  type StreetProvider,
  type ViewerCallbacks,
  type ViewerHandle,
} from "./types";

const API = "https://graph.mapillary.com/images";
const MAX_ATTEMPTS = 50;
/** Prefer 360° panoramas for this many attempts before accepting flat photos. */
const PANO_ONLY_ATTEMPTS = 35;
/** Half-size of the search box in degrees (the API rejects large boxes). */
const BOX_HALF_DEG = 0.02;

interface MapillaryImage {
  id: string;
  is_pano?: boolean;
  compass_angle?: number;
  geometry?: { coordinates: [number, number] };
  computed_geometry?: { coordinates: [number, number] };
}

async function searchImages(token: string, lat: number, lng: number, signal: AbortSignal) {
  const bbox = [lng - BOX_HALF_DEG, lat - BOX_HALF_DEG, lng + BOX_HALF_DEG, lat + BOX_HALF_DEG]
    .map((n) => n.toFixed(5))
    .join(",");
  const url = `${API}?access_token=${encodeURIComponent(token)}&fields=id,is_pano,compass_angle,geometry,computed_geometry&bbox=${bbox}&limit=50`;
  let res: Response;
  try {
    res = await fetch(url, { signal });
  } catch (err) {
    if ((err as Error).name === "AbortError") throw err;
    throw new ProviderError("network", "Không kết nối được Mapillary. Kiểm tra mạng.");
  }
  if (res.status === 400 || res.status === 401 || res.status === 403) {
    throw new ProviderError("auth", "Mapillary từ chối token. Kiểm tra lại Client Token.");
  }
  if (!res.ok) return [];
  const body = (await res.json()) as { data?: MapillaryImage[] };
  return body.data ?? [];
}

export function createMapillaryProvider(token: string): StreetProvider {
  return {
    id: "mapillary",

    async findLocation(signal: AbortSignal): Promise<GameLocation> {
      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        throwIfAborted(signal);
        const seed = randomCityPoint();
        const images = (await searchImages(token, seed.lat, seed.lng, signal)).filter(
          (img) => img.computed_geometry ?? img.geometry,
        );
        const panos = images.filter((img) => img.is_pano);
        const pool = panos.length > 0 || attempt < PANO_ONLY_ATTEMPTS ? panos : images;
        if (pool.length === 0) continue;
        const img = pool[Math.floor(Math.random() * pool.length)];
        const [lng, lat] = (img.computed_geometry ?? img.geometry)!.coordinates;
        return {
          position: { lat, lng },
          panoId: img.id,
          heading: img.is_pano ? randomHeading() : (img.compass_angle ?? 0),
        };
      }
      throw new ProviderError("coverage", "Không tìm được ảnh Mapillary phù hợp. Thử lại nhé.");
    },

    async mount(container, location, mode: Mode, callbacks: ViewerCallbacks): Promise<ViewerHandle> {
      const [{ Viewer }] = await Promise.all([
        import("mapillary-js"),
        import("mapillary-js/dist/mapillary.css"),
      ]);
      const canMove = mode === "move";
      const canLook = mode !== "nmpz";
      const viewer = new Viewer({
        accessToken: token,
        container,
        imageId: location.panoId,
        component: {
          cover: false,
          attribution: true,
          bearing: false,
          direction: canMove,
          sequence: false,
          keyboard: canMove,
          pointer: canLook,
          zoom: false,
          spatial: false,
          tag: false,
          popup: false,
          marker: false,
          slider: false,
        },
      });
      viewer.on("bearing", (event) => callbacks.onHeading(event.bearing));
      callbacks.onHeading(location.heading);
      return {
        returnToStart() {
          viewer.moveTo(location.panoId).catch(() => undefined);
        },
        destroy() {
          viewer.remove();
          container.replaceChildren();
        },
      };
    },
  };
}
