import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { randomWorldPoint } from "../game/regions";
import type { GameLocation, Mode } from "../game/types";
import {
  ProviderError,
  randomHeading,
  throwIfAborted,
  type StreetProvider,
  type ViewerCallbacks,
  type ViewerHandle,
} from "./types";

const MAX_ATTEMPTS = 60;
const SEARCH_RADIUS_M = 50_000;

let configuredKey: string | null = null;
let authFailed = false;

/**
 * One panorama object is reused for every round. Google bills per panorama
 * object created and never frees them, so one per round would leak memory
 * and cost more.
 */
let shared: { panorama: google.maps.StreetViewPanorama; el: HTMLDivElement } | null = null;
let mountSerial = 0;

/** The Maps API can only be configured once per page load. */
export function googleKeyNeedsReload(key: string) {
  return configuredKey !== null && configuredKey !== key;
}

function configure(key: string) {
  if (configuredKey === key) return;
  if (configuredKey !== null) {
    throw new ProviderError("auth", "Đã đổi API key. Hãy tải lại trang để dùng key mới.");
  }
  configuredKey = key;
  // Google calls this global when the key is invalid or not allowed for this site.
  (window as unknown as { gm_authFailure: () => void }).gm_authFailure = () => {
    authFailed = true;
    window.dispatchEvent(new CustomEvent("terraguess:auth-failure"));
  };
  setOptions({ key, v: "weekly", language: "vi" });
}

function authError() {
  return new ProviderError(
    "auth",
    "Google từ chối API key. Kiểm tra key đã bật “Maps JavaScript API”, đã gắn thanh toán và cho phép tên miền này.",
  );
}

async function loadStreetView(key: string) {
  configure(key);
  try {
    return await importLibrary("streetView");
  } catch {
    throw new ProviderError("network", "Không tải được Google Maps. Kiểm tra kết nối mạng.");
  }
}

function getSharedPanorama(lib: google.maps.StreetViewLibrary, parent: HTMLElement) {
  if (!shared) {
    const el = document.createElement("div");
    el.style.cssText = "position:absolute;inset:0";
    parent.appendChild(el);
    const panorama = new lib.StreetViewPanorama(el, {
      visible: false,
      disableDefaultUI: true,
      addressControl: false,
      showRoadLabels: false,
      motionTracking: false,
      motionTrackingControl: false,
      fullscreenControl: false,
      enableCloseButton: false,
      imageDateControl: false,
    });
    shared = { panorama, el };
  } else if (shared.el.parentElement !== parent) {
    parent.appendChild(shared.el);
  }
  return shared;
}

export function createGoogleProvider(key: string): StreetProvider {
  return {
    id: "google",

    async findLocation(signal: AbortSignal): Promise<GameLocation> {
      const lib = await loadStreetView(key);
      const service = new lib.StreetViewService();
      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        throwIfAborted(signal);
        if (authFailed) throw authError();
        try {
          const { data } = await service.getPanorama({
            location: randomWorldPoint(),
            radius: SEARCH_RADIUS_M,
            // Official Google imagery only, outdoors only (no user photospheres or shop interiors).
            sources: [lib.StreetViewSource.GOOGLE, lib.StreetViewSource.OUTDOOR],
            preference: lib.StreetViewPreference.NEAREST,
          });
          const latLng = data.location?.latLng;
          const pano = data.location?.pano;
          // Skip isolated panoramas so Move mode always has somewhere to go.
          if (!latLng || !pano || (data.links?.length ?? 0) === 0) continue;
          return { position: latLng.toJSON(), panoId: pano, heading: randomHeading() };
        } catch (err) {
          const code = (err as { code?: string }).code;
          if (code === "ZERO_RESULTS" || code === "NOT_FOUND") continue;
          if (authFailed || code === "REQUEST_DENIED") throw authError();
          if (code === "OVER_QUERY_LIMIT") {
            throw new ProviderError("network", "Đã vượt hạn mức truy vấn của API key. Thử lại sau.");
          }
          // Transient errors: keep trying a few more points.
        }
      }
      throw new ProviderError("coverage", "Không tìm được địa điểm có ảnh đường phố. Thử lại nhé.");
    },

    async mount(container, location, mode: Mode, callbacks: ViewerCallbacks): Promise<ViewerHandle> {
      const lib = await loadStreetView(key);
      if (authFailed) throw authError();
      const serial = ++mountSerial;
      const { panorama, el } = getSharedPanorama(lib, container);
      const canMove = mode === "move";
      const canLook = mode !== "nmpz";
      const startPov = { heading: location.heading, pitch: 0 };

      panorama.setOptions({
        linksControl: canMove,
        clickToGo: canMove,
        scrollwheel: canLook,
        disableDoubleClickZoom: !canLook,
      });
      const goToStart = () => {
        panorama.setPano(location.panoId);
        panorama.setPov(startPov);
        panorama.setZoom(0);
      };
      goToStart();
      panorama.setVisible(true);
      google.maps.event.trigger(panorama, "resize");

      // Arrow up/down (and W/S) walk along the road even when the arrows are hidden.
      const blockWalkKeys = (e: KeyboardEvent) => {
        if (!canMove && ["ArrowUp", "ArrowDown", "KeyW", "KeyS"].includes(e.code)) e.stopPropagation();
        if (!canLook) e.stopPropagation();
      };
      el.addEventListener("keydown", blockWalkKeys, true);
      const listener = panorama.addListener("pov_changed", () => {
        callbacks.onHeading(panorama.getPov().heading ?? 0);
      });
      callbacks.onHeading(location.heading);

      return {
        returnToStart: goToStart,
        destroy() {
          listener.remove();
          el.removeEventListener("keydown", blockWalkKeys, true);
          // A newer round may already own the shared panorama.
          if (serial !== mountSerial) return;
          panorama.setVisible(false);
          el.remove();
        },
      };
    },
  };
}
