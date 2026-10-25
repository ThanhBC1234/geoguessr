import type { LatLng } from "./types";

/**
 * Areas with good street-level imagery, as rough bounding boxes
 * [minLat, minLng, maxLat, maxLng] with a weight that sets how often each is picked.
 * Boxes cover some sea or empty land; the provider retries when no imagery is found.
 */
export interface Region {
  name: string;
  weight: number;
  box: [number, number, number, number];
}

export const WORLD_REGIONS: Region[] = [
  // North America
  { name: "USA West", weight: 8, box: [32, -124, 49, -104] },
  { name: "USA Central", weight: 6, box: [29, -104, 49, -90] },
  { name: "USA East", weight: 7, box: [30, -90, 45, -70] },
  { name: "Canada", weight: 5, box: [43, -125, 55, -60] },
  { name: "Mexico", weight: 4, box: [15, -117, 32, -87] },
  { name: "Guatemala", weight: 0.8, box: [13.8, -92, 17.8, -88.3] },
  { name: "Dominican Republic", weight: 0.5, box: [17.6, -72, 19.9, -68.3] },
  { name: "Puerto Rico", weight: 0.3, box: [17.9, -67.3, 18.5, -65.6] },
  // South America
  { name: "Colombia", weight: 2, box: [-4, -79, 12, -67] },
  { name: "Ecuador", weight: 1, box: [-5, -81, 1.5, -75.2] },
  { name: "Peru", weight: 2, box: [-18, -81, -0.1, -69] },
  { name: "Bolivia", weight: 1, box: [-22.9, -69.6, -9.7, -57.5] },
  { name: "Chile", weight: 2, box: [-55, -75.6, -17.5, -66.5] },
  { name: "Argentina", weight: 3, box: [-55, -73.5, -21.8, -53.6] },
  { name: "Uruguay", weight: 1, box: [-35, -58.4, -30, -53] },
  { name: "Brazil", weight: 6, box: [-33.7, -73.9, 5.2, -34.8] },
  // Europe
  { name: "United Kingdom", weight: 4, box: [50, -6, 58.6, 1.8] },
  { name: "Ireland", weight: 1.5, box: [51.4, -10.5, 55.4, -6] },
  { name: "Iceland", weight: 0.5, box: [63.3, -24.5, 66.5, -13.5] },
  { name: "Portugal", weight: 1.5, box: [37, -9.5, 42.1, -6.2] },
  { name: "Spain", weight: 3, box: [36, -9.3, 43.8, 3.3] },
  { name: "France", weight: 4, box: [42.3, -4.8, 51.1, 8.2] },
  { name: "Belgium", weight: 1, box: [49.5, 2.5, 51.5, 6.4] },
  { name: "Netherlands", weight: 1, box: [50.8, 3.3, 53.5, 7.2] },
  { name: "Germany", weight: 3, box: [47.3, 5.9, 55, 15] },
  { name: "Switzerland", weight: 1, box: [45.8, 5.9, 47.8, 10.5] },
  { name: "Austria", weight: 1, box: [46.4, 9.5, 49, 17.1] },
  { name: "Italy", weight: 3, box: [37, 7, 46.5, 18.5] },
  { name: "Denmark", weight: 1, box: [54.6, 8, 57.7, 12.6] },
  { name: "Norway", weight: 2, box: [58, 5, 70, 30] },
  { name: "Sweden", weight: 2, box: [55.3, 11, 68, 24] },
  { name: "Finland", weight: 2, box: [60, 21, 69, 31] },
  { name: "Estonia", weight: 0.5, box: [57.5, 21.8, 59.7, 28.2] },
  { name: "Latvia", weight: 0.5, box: [55.7, 21, 58, 28.2] },
  { name: "Lithuania", weight: 0.5, box: [53.9, 21, 56.4, 26.8] },
  { name: "Poland", weight: 2.5, box: [49, 14.1, 54.8, 24.1] },
  { name: "Czechia", weight: 1, box: [48.6, 12.1, 51, 18.8] },
  { name: "Slovakia", weight: 0.7, box: [47.7, 16.8, 49.6, 22.5] },
  { name: "Hungary", weight: 1, box: [45.7, 16.1, 48.6, 22.9] },
  { name: "Slovenia", weight: 0.4, box: [45.4, 13.4, 46.9, 16.6] },
  { name: "Croatia", weight: 0.8, box: [42.4, 13.5, 46.5, 19.4] },
  { name: "Serbia", weight: 0.8, box: [42.2, 18.8, 46.2, 23] },
  { name: "Albania", weight: 0.4, box: [39.6, 19.3, 42.6, 21.1] },
  { name: "North Macedonia", weight: 0.4, box: [40.9, 20.5, 42.4, 23] },
  { name: "Bulgaria", weight: 1, box: [41.2, 22.4, 44.2, 28.6] },
  { name: "Romania", weight: 1.5, box: [43.6, 20.3, 48.3, 29.7] },
  { name: "Greece", weight: 1.2, box: [35, 19.4, 41.7, 28.2] },
  { name: "Turkey", weight: 2.5, box: [36, 26, 42, 45] },
  { name: "Ukraine", weight: 1.5, box: [45, 22.2, 52.3, 40.2] },
  { name: "Russia West", weight: 4, box: [43, 28, 62, 60] },
  { name: "Russia Siberia", weight: 1.5, box: [50, 60, 57, 105] },
  // Asia
  { name: "Japan", weight: 4, box: [31, 129.5, 45.5, 145.8] },
  { name: "South Korea", weight: 1.5, box: [34.3, 126, 38.6, 129.6] },
  { name: "Taiwan", weight: 1, box: [21.9, 120, 25.3, 122] },
  { name: "Philippines", weight: 1.5, box: [5.5, 117, 18.6, 126.6] },
  { name: "Thailand", weight: 2, box: [5.6, 97.3, 20.5, 105.6] },
  { name: "Cambodia", weight: 0.5, box: [10.4, 102.3, 14.7, 107.6] },
  { name: "Malaysia", weight: 1, box: [1.3, 99.6, 6.7, 104.3] },
  { name: "Malaysian Borneo", weight: 0.5, box: [1, 109.6, 7, 119.3] },
  { name: "Singapore", weight: 0.2, box: [1.24, 103.6, 1.47, 104] },
  { name: "Java", weight: 1.5, box: [-8.8, 105, -5.8, 114.6] },
  { name: "Sumatra", weight: 0.8, box: [-6, 95, 6, 106] },
  { name: "India", weight: 3, box: [8, 68, 32, 89] },
  { name: "Sri Lanka", weight: 0.5, box: [5.9, 79.6, 9.8, 81.9] },
  { name: "Bangladesh", weight: 0.5, box: [20.7, 88, 26.6, 92.7] },
  { name: "Mongolia", weight: 0.7, box: [41.6, 87.7, 52.1, 119.9] },
  { name: "Kazakhstan", weight: 1, box: [40.6, 46.5, 55.4, 87.3] },
  { name: "Kyrgyzstan", weight: 0.4, box: [39.2, 69.3, 43.2, 80.2] },
  { name: "Israel", weight: 0.5, box: [29.5, 34.3, 33.3, 35.9] },
  { name: "Jordan", weight: 0.4, box: [29.2, 34.9, 33.4, 39.3] },
  { name: "United Arab Emirates", weight: 0.4, box: [22.6, 51.6, 26.1, 56.4] },
  // Africa
  { name: "South Africa", weight: 3, box: [-34.8, 16.5, -22.1, 32.9] },
  { name: "Botswana", weight: 0.6, box: [-26.9, 20, -17.8, 29.4] },
  { name: "Lesotho", weight: 0.3, box: [-30.7, 27, -28.6, 29.5] },
  { name: "Eswatini", weight: 0.2, box: [-27.3, 30.8, -25.7, 32.1] },
  { name: "Kenya", weight: 0.8, box: [-4.7, 33.9, 5, 41.9] },
  { name: "Uganda", weight: 0.6, box: [-1.5, 29.6, 4.2, 35] },
  { name: "Rwanda", weight: 0.2, box: [-2.8, 28.9, -1, 30.9] },
  { name: "Ghana", weight: 0.6, box: [4.7, -3.3, 11.2, 1.2] },
  { name: "Nigeria", weight: 0.6, box: [4.3, 2.7, 13.9, 14.7] },
  { name: "Senegal", weight: 0.4, box: [12.3, -17.5, 16.7, -11.4] },
  { name: "Tunisia", weight: 0.4, box: [30.2, 7.5, 37.4, 11.6] },
  // Oceania
  { name: "Australia East", weight: 3, box: [-38, 140, -17, 153.6] },
  { name: "Australia South & West", weight: 2, box: [-35, 114, -20, 140] },
  { name: "Tasmania", weight: 0.3, box: [-43.6, 144.6, -40.6, 148.5] },
  { name: "New Zealand", weight: 1.5, box: [-46.7, 166.4, -34.4, 178.6] },
];

export function pickWeighted<T extends { weight: number }>(items: T[], rand = Math.random): T {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let r = rand() * total;
  for (const item of items) {
    r -= item.weight;
    if (r < 0) return item;
  }
  return items[items.length - 1];
}

/** Uniform-by-area random point inside a lat/lng box. */
export function randomPointInBox(box: Region["box"], rand = Math.random): LatLng {
  const [minLat, minLng, maxLat, maxLng] = box;
  const toRad = Math.PI / 180;
  const s1 = Math.sin(minLat * toRad);
  const s2 = Math.sin(maxLat * toRad);
  const lat = Math.asin(s1 + rand() * (s2 - s1)) / toRad;
  const lng = minLng + rand() * (maxLng - minLng);
  return { lat, lng };
}

export function randomWorldPoint(rand = Math.random): LatLng {
  return randomPointInBox(pickWeighted(WORLD_REGIONS, rand).box, rand);
}

/**
 * Large cities, used to seed searches for providers whose coverage is
 * concentrated in towns (Mapillary). [lat, lng]
 */
export const CITY_SEEDS: [number, number][] = [
  [40.71, -74.0], [34.05, -118.24], [41.88, -87.63], [29.76, -95.37], [33.45, -112.07],
  [39.95, -75.17], [29.42, -98.49], [32.72, -117.16], [37.77, -122.42], [47.61, -122.33],
  [39.74, -104.99], [42.36, -71.06], [25.76, -80.19], [33.75, -84.39], [45.52, -122.68],
  [36.17, -115.14], [44.98, -93.27], [35.23, -80.84], [43.65, -79.38], [45.5, -73.57],
  [49.28, -123.12], [51.05, -114.07], [45.42, -75.7], [19.43, -99.13], [20.67, -103.35],
  [25.69, -100.32], [14.63, -90.51], [18.47, -69.9], [4.71, -74.07], [6.24, -75.58],
  [-0.18, -78.47], [-12.05, -77.04], [-16.5, -68.15], [-33.45, -70.67], [-34.6, -58.38],
  [-31.42, -64.18], [-34.9, -56.16], [-23.55, -46.63], [-22.91, -43.17], [-19.92, -43.94],
  [-25.43, -49.27], [-30.03, -51.23], [-15.79, -47.88], [-3.73, -38.53], [-8.05, -34.88],
  [51.51, -0.13], [53.48, -2.24], [52.49, -1.89], [55.95, -3.19], [53.35, -6.26],
  [64.15, -21.94], [38.72, -9.14], [41.15, -8.61], [40.42, -3.7], [41.39, 2.17],
  [37.39, -5.98], [39.47, -0.38], [48.86, 2.35], [45.76, 4.84], [43.3, 5.37],
  [43.6, 1.44], [47.22, -1.55], [50.85, 4.35], [51.22, 4.4], [52.37, 4.9],
  [51.92, 4.48], [52.52, 13.4], [48.14, 11.58], [50.11, 8.68], [53.55, 9.99],
  [50.94, 6.96], [47.38, 8.54], [46.2, 6.14], [48.21, 16.37], [41.9, 12.5],
  [45.46, 9.19], [40.85, 14.27], [43.77, 11.26], [45.44, 12.32], [55.68, 12.57],
  [59.91, 10.75], [60.39, 5.32], [59.33, 18.07], [57.71, 11.97], [60.17, 24.94],
  [59.44, 24.75], [56.95, 24.11], [54.69, 25.28], [52.23, 21.01], [50.06, 19.94],
  [50.08, 14.44], [48.15, 17.11], [47.5, 19.04], [46.06, 14.51], [45.81, 15.98],
  [44.79, 20.45], [41.33, 19.82], [41.99, 21.43], [42.7, 23.32], [44.43, 26.1],
  [46.77, 23.6], [37.98, 23.73], [40.64, 22.94], [41.01, 28.98], [39.93, 32.86],
  [38.42, 27.14], [50.45, 30.52], [49.84, 24.03], [55.76, 37.62], [59.94, 30.31],
  [56.84, 60.6], [55.03, 82.92], [35.68, 139.69], [34.69, 135.5], [35.18, 136.91],
  [43.06, 141.35], [33.59, 130.4], [37.57, 126.98], [35.18, 129.08], [25.03, 121.57],
  [22.63, 120.3], [14.6, 120.98], [10.32, 123.89], [13.76, 100.5], [18.79, 98.98],
  [11.56, 104.92], [3.14, 101.69], [5.41, 100.33], [1.35, 103.82], [-6.21, 106.85],
  [-7.25, 112.75], [-8.65, 115.22], [3.59, 98.67], [28.61, 77.21], [19.08, 72.88],
  [12.97, 77.59], [13.08, 80.27], [22.57, 88.36], [17.39, 78.49], [6.93, 79.85],
  [23.81, 90.41], [47.89, 106.91], [43.24, 76.89], [51.17, 71.45], [42.87, 74.59],
  [32.09, 34.78], [31.95, 35.93], [25.2, 55.27], [-26.2, 28.05], [-33.92, 18.42],
  [-29.86, 31.02], [-25.75, 28.19], [-24.65, 25.91], [-1.29, 36.82], [0.35, 32.58],
  [-1.95, 30.06], [5.6, -0.19], [6.52, 3.38], [14.72, -17.47], [36.81, 10.18],
  [21.03, 105.85], [10.78, 106.7], [16.05, 108.2], [-33.87, 151.21], [-37.81, 144.96],
  [-27.47, 153.03], [-31.95, 115.86], [-34.93, 138.6], [-42.88, 147.33], [-36.85, 174.76],
  [-41.29, 174.78], [-43.53, 172.64],
];

export function randomCityPoint(spreadDeg = 0.15, rand = Math.random): LatLng {
  const [lat, lng] = CITY_SEEDS[Math.floor(rand() * CITY_SEEDS.length)];
  return {
    lat: lat + (rand() * 2 - 1) * spreadDeg,
    lng: lng + (rand() * 2 - 1) * spreadDeg,
  };
}
