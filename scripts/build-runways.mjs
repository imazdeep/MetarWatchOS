#!/usr/bin/env node
/**
 * Builds the bundled runway database from OurAirports (public domain,
 * https://ourairports.com/data/).
 *
 *   node scripts/build-runways.mjs            # downloads the CSVs
 *   node scripts/build-runways.mjs <dir>      # uses airports.csv + runways.csv in <dir>
 *
 * Output: public/runways/<first two letters>.json, one shard per ICAO prefix so
 * the watch only downloads a few KB for the airport it is showing.
 *
 * Shard format: { "EGLL": [name, elevFt, lat, lon, runways[]] }
 * runway: [leIdent, heIdent, leHeadingTrue, lengthFt, x1, y1, x2, y2]
 *   x/y are threshold positions in decametres east/north of the airport
 *   reference point (null when OurAirports has no coordinates).
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = 'https://raw.githubusercontent.com/davidmegginson/ourairports-data/main';
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'runways');
const KEEP = new Set(['large_airport', 'medium_airport', 'small_airport']);

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (c !== '\r') field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [head, ...body] = rows;
  return body.map(r => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ''])));
}

async function load(name, dir) {
  if (dir) return readFileSync(join(dir, `${name}.csv`), 'utf8');
  const res = await fetch(`${SRC}/${name}.csv`);
  if (!res.ok) throw new Error(`${name}.csv: HTTP ${res.status}`);
  return res.text();
}

const num = s => (s === '' ? null : Number(s));
const icaoOf = a => [a.icao_code, a.gps_code, a.ident].find(v => /^[A-Z]{4}$/.test(v || ''));

const dir = process.argv[2];
const airports = parseCsv(await load('airports', dir));
const runways = parseCsv(await load('runways', dir));

const byRef = new Map();
for (const r of runways) {
  if (r.closed === '1' || !r.le_ident || !r.he_ident || /^H/.test(r.le_ident)) continue;
  if (/WATER/i.test(r.surface)) continue;
  if (!byRef.has(r.airport_ref)) byRef.set(r.airport_ref, []);
  byRef.get(r.airport_ref).push(r);
}

const shards = {};
let count = 0;
for (const a of airports) {
  if (!KEEP.has(a.type)) continue;
  const icao = icaoOf(a);
  const rws = byRef.get(a.id);
  if (!icao || !rws) continue;

  const lat0 = Number(a.latitude_deg);
  const lon0 = Number(a.longitude_deg);
  const kx = 111320 * Math.cos((lat0 * Math.PI) / 180);
  const toLocal = (lat, lon) =>
    lat === null || lon === null ? [null, null] : [Math.round(((lon - lon0) * kx) / 10), Math.round(((lat - lat0) * 111320) / 10)];

  const list = rws.map(r => {
    const [x1, y1] = toLocal(num(r.le_latitude_deg), num(r.le_longitude_deg));
    const [x2, y2] = toLocal(num(r.he_latitude_deg), num(r.he_longitude_deg));
    let hdg = num(r.le_heading_degT);
    if (hdg === null && x1 !== null && x2 !== null) hdg = ((Math.atan2(x2 - x1, y2 - y1) * 180) / Math.PI + 360) % 360;
    if (hdg === null) {
      const n = parseInt(r.le_ident, 10);
      hdg = Number.isFinite(n) ? (n * 10) % 360 : null;
    }
    if (hdg === null) return null;
    return [r.le_ident, r.he_ident, Math.round(hdg * 10) / 10, num(r.length_ft) ?? 0, x1, y1, x2, y2];
  }).filter(Boolean);
  if (!list.length) continue;

  const key = icao.slice(0, 2);
  (shards[key] ||= {})[icao] = [a.name.slice(0, 48), num(a.elevation_ft), Math.round(lat0 * 1e4) / 1e4, Math.round(lon0 * 1e4) / 1e4, list];
  count++;
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
let bytes = 0;
for (const [k, v] of Object.entries(shards).sort()) {
  const json = JSON.stringify(v);
  bytes += json.length;
  writeFileSync(join(OUT, `${k}.json`), json);
}
console.log(`${count} airports in ${Object.keys(shards).length} shards, ${(bytes / 1024).toFixed(0)} KB total`);
