import { describe, expect, it } from "vitest";
import { distanceKm, formatDistance, scoreForDistance, wrapLng } from "./geo";

describe("distanceKm", () => {
  it("is zero for the same point", () => {
    expect(distanceKm({ lat: 10, lng: 20 }, { lat: 10, lng: 20 })).toBe(0);
  });
  it("matches Hanoi to Ho Chi Minh City (~1,140 km)", () => {
    const d = distanceKm({ lat: 21.0285, lng: 105.8542 }, { lat: 10.7769, lng: 106.7009 });
    expect(d).toBeGreaterThan(1130);
    expect(d).toBeLessThan(1150);
  });
  it("handles the antimeridian", () => {
    const d = distanceKm({ lat: 0, lng: 179.5 }, { lat: 0, lng: -179.5 });
    expect(d).toBeCloseTo(111.2, 0);
  });
  it("is half the circumference for antipodes", () => {
    expect(distanceKm({ lat: 0, lng: 0 }, { lat: 0, lng: 180 })).toBeCloseTo(20015, -1);
  });
});

describe("scoreForDistance", () => {
  it("gives 5000 for a perfect guess", () => {
    expect(scoreForDistance(0)).toBe(5000);
    expect(scoreForDistance(0.02)).toBe(5000);
  });
  it("decays with distance", () => {
    expect(scoreForDistance(100)).toBeLessThan(5000);
    expect(scoreForDistance(100)).toBeGreaterThan(4600);
    expect(scoreForDistance(1000)).toBeGreaterThan(2500);
    expect(scoreForDistance(1000)).toBeLessThan(2700);
    expect(scoreForDistance(20000)).toBe(0);
  });
  it("is monotonic", () => {
    let prev = Infinity;
    for (let km = 0; km < 20000; km += 250) {
      const s = scoreForDistance(km);
      expect(s).toBeLessThanOrEqual(prev);
      prev = s;
    }
  });
  it("returns 0 for invalid input", () => {
    expect(scoreForDistance(Number.NaN)).toBe(0);
    expect(scoreForDistance(-5)).toBe(0);
  });
});

describe("formatting", () => {
  it("formats distances", () => {
    expect(formatDistance(0.4)).toBe("400 m");
    expect(formatDistance(3.25)).toBe("3.3 km");
  });
  it("wraps longitude", () => {
    expect(wrapLng(190)).toBe(-170);
    expect(wrapLng(-190)).toBe(170);
    expect(wrapLng(45)).toBe(45);
  });
});
