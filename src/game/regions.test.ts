import { describe, expect, it } from "vitest";
import { pickWeighted, randomPointInBox, randomWorldPoint, WORLD_REGIONS } from "./regions";

describe("regions", () => {
  it("has valid boxes", () => {
    for (const r of WORLD_REGIONS) {
      const [minLat, minLng, maxLat, maxLng] = r.box;
      expect(minLat, r.name).toBeLessThan(maxLat);
      expect(minLng, r.name).toBeLessThan(maxLng);
      expect(r.weight, r.name).toBeGreaterThan(0);
    }
  });
  it("picks points inside the box", () => {
    for (let i = 0; i < 500; i++) {
      const p = randomPointInBox([10, 20, 30, 40]);
      expect(p.lat).toBeGreaterThanOrEqual(10);
      expect(p.lat).toBeLessThanOrEqual(30);
      expect(p.lng).toBeGreaterThanOrEqual(20);
      expect(p.lng).toBeLessThanOrEqual(40);
    }
  });
  it("respects weights", () => {
    const items = [{ weight: 1, id: "a" }, { weight: 3, id: "b" }];
    expect(pickWeighted(items, () => 0.1).id).toBe("a");
    expect(pickWeighted(items, () => 0.5).id).toBe("b");
    expect(pickWeighted(items, () => 0.9999).id).toBe("b");
  });
  it("returns finite world points", () => {
    for (let i = 0; i < 200; i++) {
      const p = randomWorldPoint();
      expect(Number.isFinite(p.lat) && Number.isFinite(p.lng)).toBe(true);
    }
  });
});
