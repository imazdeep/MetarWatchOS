import { MetarData } from '../types';

/** One physical runway (both ends). Positions in decametres east/north of the airport. */
export interface Runway {
  a: string; // low end ident, e.g. "09L"
  b: string; // high end ident, e.g. "27R"
  hdg: number; // true heading when landing on `a`
  lengthFt: number;
  p1: [number, number] | null; // threshold of `a`
  p2: [number, number] | null; // threshold of `b`
}

export interface AirportData {
  icao: string;
  name: string;
  elevFt: number | null;
  lat: number;
  lon: number;
  runways: Runway[];
}

type RawRunway = [string, string, number, number, number | null, number | null, number | null, number | null];
type RawAirport = [string, number | null, number, number, RawRunway[]];

const shards = new Map<string, Promise<Record<string, RawAirport> | null>>();

/** Loads one airport from the bundled OurAirports shards (public/runways/XX.json). */
export async function loadAirport(icao: string): Promise<AirportData | null> {
  if (!/^[A-Z0-9]{4}$/.test(icao)) return null;
  const key = icao.slice(0, 2);
  if (!shards.has(key)) {
    const p = fetch(`${import.meta.env.BASE_URL}runways/${key}.json`)
      .then(r => (r.ok ? r.json() : null))
      .catch(() => {
        shards.delete(key); // network error: allow a retry later
        return null;
      });
    shards.set(key, p);
  }
  const shard = await shards.get(key)!;
  const raw = shard?.[icao];
  if (!raw) return null;
  const [name, elevFt, lat, lon, rws] = raw;
  return {
    icao,
    name,
    elevFt,
    lat,
    lon,
    runways: rws.map(([a, b, hdg, lengthFt, x1, y1, x2, y2]) => ({
      a,
      b,
      hdg,
      lengthFt,
      p1: x1 !== null && y1 !== null ? [x1, y1] : null,
      p2: x2 !== null && y2 !== null ? [x2, y2] : null,
    })),
  };
}

/* ------------------------------------------------------------------------ */
/* Wind                                                                      */
/* ------------------------------------------------------------------------ */

export interface WindInfo {
  dir: number | null; // true direction the wind blows FROM
  speed: number;
  gust: number | null;
  unit: string;
  vrb: boolean;
  calm: boolean;
  varFrom: number | null;
  varTo: number | null;
}

export function windInfo(metar: MetarData | null): WindInfo | null {
  const w = metar?.wind;
  if (!w) return null;
  const speed = parseInt(w.speed, 10) || 0;
  const gust = w.gusts ? parseInt(w.gusts, 10) : null;
  const vrb = w.direction === 'VRB';
  const dir = vrb ? null : parseInt(w.direction, 10) % 360;
  return {
    dir,
    speed,
    gust,
    unit: w.unit,
    vrb,
    calm: speed === 0 && !gust,
    varFrom: w.varFrom ?? null,
    varTo: w.varTo ?? null,
  };
}

const rad = (d: number) => (d * Math.PI) / 180;
const norm = (d: number) => ((d % 360) + 360) % 360;
const angDist = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);

export interface ActiveRunway {
  ident: string;
  heading: number;
  /** Positive = headwind. */
  headwind: number | null;
  /** Positive = wind from the right. */
  crosswind: number | null;
}

/** The runway end most into the wind (or the longest, west-flow, when calm/variable). */
export function pickActive(runways: Runway[], wind: WindInfo | null): ActiveRunway | null {
  if (!runways.length) return null;
  const ends = runways.flatMap(r => [
    { ident: r.a, heading: norm(r.hdg), len: r.lengthFt },
    { ident: r.b, heading: norm(r.hdg + 180), len: r.lengthFt },
  ]);

  const directional = wind && wind.dir !== null && wind.speed >= 3;
  let best = ends[0];
  let bestScore = -Infinity;
  for (const e of ends) {
    const score = directional
      ? wind!.speed * Math.cos(rad(wind!.dir! - e.heading)) + e.len / 1e6
      : e.len / 1000 - angDist(e.heading, 270) / 10;
    if (score > bestScore) {
      bestScore = score;
      best = e;
    }
  }

  let headwind: number | null = null;
  let crosswind: number | null = null;
  if (wind && wind.dir !== null) {
    headwind = Math.round(wind.speed * Math.cos(rad(wind.dir - best.heading)));
    crosswind = Math.round(wind.speed * Math.sin(rad(wind.dir - best.heading)));
  }
  return { ident: best.ident, heading: best.heading, headwind, crosswind };
}

/* ------------------------------------------------------------------------ */
/* Diagram layout                                                            */
/* ------------------------------------------------------------------------ */

export interface DrawnRunway {
  cx: number;
  cy: number;
  length: number;
  /** Screen bearing (deg, clockwise from up) from the `a` threshold to the `b` threshold. */
  angle: number;
  a: string;
  b: string;
  active: boolean;
  width: number;
}

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Runways without surveyed coordinates: lay parallels out by L/C/R suffix. */
function synthesize(rws: Runway[]): { p1: [number, number]; p2: [number, number]; r: Runway }[] {
  return rws.map(r => {
    const len = Math.max(60, (r.lengthFt * 0.3048) / 10);
    const h = rad(r.hdg);
    const dx = Math.sin(h);
    const dy = Math.cos(h);
    const side = /L$/.test(r.a) ? -1 : /R$/.test(r.a) ? 1 : 0;
    // Facing heading h, "right" is (cos h, -sin h).
    const ox = side * 70 * Math.cos(h);
    const oy = side * 70 * -Math.sin(h);
    return {
      r,
      p1: [ox - (dx * len) / 2, oy - (dy * len) / 2],
      p2: [ox + (dx * len) / 2, oy + (dy * len) / 2],
    };
  });
}

/**
 * Lays out the runway diagram for heading `up` (true) at the top of the
 * screen, inside `box` (SVG units).
 */
export function layoutRunways(runways: Runway[], up: number, box: Box): DrawnRunway[] {
  if (!runways.length) return [];
  const surveyed = runways.every(r => r.p1 && r.p2);
  const segs = surveyed ? runways.map(r => ({ r, p1: r.p1!, p2: r.p2! })) : synthesize(runways);

  const c = Math.cos(rad(up));
  const s = Math.sin(rad(up));
  // Rotate so bearing `up` maps to screen-up; returns SVG coords (y down).
  const rot = ([x, y]: [number, number]): [number, number] => [x * c - y * s, -(x * s + y * c)];

  const pts = segs.map(g => ({ r: g.r, p1: rot(g.p1), p2: rot(g.p2) }));

  const activeAxis = norm(up) % 180;
  const isActive = (r: Runway) => {
    const d = angDist(norm(r.hdg) % 180, activeAxis);
    return d < 12 || d > 168;
  };

  // The runways in use are drawn as a clean schematic: wide strips side by
  // side, ordered by their true lateral position. Other directions are
  // faint strips behind them, so the diagram stays readable at any airport.
  const inUse = pts.filter(p => isActive(p.r)).sort((p, q) => p.p1[0] + p.p2[0] - (q.p1[0] + q.p2[0]));
  const n = inUse.length;
  const gap = n > 1 ? 2.4 : 0;
  const w = Math.min(12.5, (box.w - gap * (n - 1)) / n);
  const total = n * w + gap * (n - 1);
  const maxLen = Math.max(...inUse.map(p => p.r.lengthFt || 1));
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;

  const seen = new Set<number>();
  const others: DrawnRunway[] = [];
  for (const { r } of pts) {
    if (isActive(r)) continue;
    const axis = Math.round((norm(r.hdg) % 180) / 10);
    if (seen.has(axis)) continue;
    seen.add(axis);
    const angle = norm(r.hdg - up);
    const sin = Math.abs(Math.sin(rad(angle)));
    others.push({ cx, cy, length: Math.min(box.h * 0.72, (box.w + 10) / Math.max(sin, 0.01)), angle, a: r.a, b: r.b, active: false, width: 4.5 });
  }

  const active = inUse.map(({ r }, i): DrawnRunway => ({
    cx: box.x + (box.w - total) / 2 + w / 2 + i * (w + gap),
    cy,
    length: box.h * (0.8 + 0.2 * ((r.lengthFt || maxLen) / maxLen)),
    angle: angDist(norm(r.hdg - up), 0) < 90 ? 0 : 180,
    a: r.a,
    b: r.b,
    active: true,
    width: w,
  }));

  return [...others, ...active];
}

/* ------------------------------------------------------------------------ */
/* Sun (for day / night weather icons)                                       */
/* ------------------------------------------------------------------------ */

export function sunElevation(lat: number, lon: number, date: Date): number {
  const d = (date.getTime() - 946728000000) / 86400000; // days since J2000.0
  const g = rad(357.529 + 0.98560028 * d);
  const q = 280.459 + 0.98564736 * d;
  const L = rad(q + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g));
  const e = rad(23.439 - 0.00000036 * d);
  const ra = Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L));
  const dec = Math.asin(Math.sin(e) * Math.sin(L));
  const gmst = norm((18.697374558 + 24.06570982441908 * d) * 15);
  const ha = rad(gmst + lon) - ra;
  return (Math.asin(Math.sin(rad(lat)) * Math.sin(dec) + Math.cos(rad(lat)) * Math.cos(dec) * Math.cos(ha)) * 180) / Math.PI;
}
