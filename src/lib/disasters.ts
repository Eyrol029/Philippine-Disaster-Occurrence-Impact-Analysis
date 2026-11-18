// Sample disaster records shaped like EM-DAT exports for the Philippines.
// Values are generated deterministically (plus a few well-known events) for prototyping only.

export const DISASTER_TYPES = [
  "Storm",
  "Flood",
  "Earthquake",
  "Landslide",
  "Volcanic activity",
  "Epidemic",
  "Drought",
  "Extreme temperature",
] as const;
export type DisasterType = (typeof DISASTER_TYPES)[number];

export const SUBGROUPS = [
  "Meteorological",
  "Hydrological",
  "Geophysical",
  "Biological",
  "Climatological",
] as const;
export type Subgroup = (typeof SUBGROUPS)[number];

export const TYPE_SUBGROUP: Record<DisasterType, Subgroup> = {
  Storm: "Meteorological",
  "Extreme temperature": "Meteorological",
  Flood: "Hydrological",
  Landslide: "Hydrological",
  Earthquake: "Geophysical",
  "Volcanic activity": "Geophysical",
  Epidemic: "Biological",
  Drought: "Climatological",
};

export const YEAR_MIN = 1905;
export const YEAR_MAX = 2026;
export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Benchmark exchange rate for EM-DAT USD to Philippine Peso */
export const USD_TO_PHP = 58;

export interface DisasterRecord {
  id: string;
  name: string;
  year: number;
  month: number; // 1-12
  type: DisasterType;
  subgroup: Subgroup;
  deaths: number;
  affected: number;
  /** Total damage in '000 US$; null when not recorded. */
  damage: number | null;
}

export interface Filters {
  yearFrom: number;
  yearTo: number;
  type: DisasterType | "All";
  subgroup: Subgroup | "All";
}

export const DEFAULT_FILTERS: Filters = {
  yearFrom: YEAR_MIN,
  yearTo: YEAR_MAX,
  type: "All",
  subgroup: "All",
};

export function filterRecords(records: DisasterRecord[], f: Filters): DisasterRecord[] {
  return records.filter(
    (r) =>
      r.year >= f.yearFrom &&
      r.year <= f.yearTo &&
      (f.type === "All" || r.type === f.type) &&
      (f.subgroup === "All" || r.subgroup === f.subgroup),
  );
}

export function summarize(records: DisasterRecord[]) {
  let deaths = 0;
  let affected = 0;
  let damage = 0;
  for (const r of records) {
    deaths += r.deaths;
    affected += r.affected;
    damage += r.damage ?? 0;
  }
  return { count: records.length, deaths, affected, damage };
}

/* ---------- deterministic sample generation ---------- */

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0)/4294967296;
  };
}

function pickWeighted<T>(rand: () => number, items: readonly T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let x = rand() * total;
  for (let i = 0; i < items.length; i++) {
    x -= weights[i] ?? 0;
    if (x <= 0) return items[i] as T;
  }
  return items[items.length - 1] as T;
}

const NOTABLE: Omit<DisasterRecord, "id" | "subgroup">[] = [
  { name: "Typhoon Haiyan/Yolanda (2013)", year: 2013, month: 11, type: "Storm", deaths: 7354, affected: 16106870, damage: 10000000 },
  { name: "Typhoon Bopha/Pablo (2012)", year: 2012, month: 12, type: "Storm", deaths: 1901, affected: 6246664, damage: 1040000 },
  { name: "Typhoon Rai/Odette (2021)", year: 2021, month: 12, type: "Storm", deaths: 410, affected: 9948000, damage: 1000000 },
  { name: "TS Ketsana/Ondoy (2009)", year: 2009, month: 9, type: "Storm", deaths: 501, affected: 4901763, damage: 1090000 },
  { name: "Typhoon Rammasun/Glenda (2014)", year: 2014, month: 7, type: "Storm", deaths: 106, affected: 4650000, damage: 871000 },
  { name: "Typhoon Mangkhut/Ompong (2018)", year: 2018, month: 9, type: "Storm", deaths: 82, affected: 3800000, damage: 627000 },
  { name: "Typhoon Parma/Pepeng (2009)", year: 2009, month: 10, type: "Storm", deaths: 465, affected: 4478491, damage: 608000 },
  { name: "Typhoon Vamco/Ulysses (2020)", year: 2020, month: 11, type: "Storm", deaths: 101, affected: 4200000, damage: 450000 },
  { name: "Typhoon Goni/Rolly (2020)", year: 2020, month: 11, type: "Storm", deaths: 25, affected: 2000000, damage: 415000 },
  { name: "Typhoon Mike/Ruping (1990)", year: 1990, month: 11, type: "Storm", deaths: 748, affected: 4100000, damage: 389000 },
  { name: "Luzon Earthquake (1990)", year: 1990, month: 7, type: "Earthquake", deaths: 1621, affected: 1597000, damage: 369600 },
  { name: "Typhoon Fengshen/Frank (2008)", year: 2008, month: 6, type: "Storm", deaths: 1410, affected: 4785460, damage: 280000 },
  { name: "Mount Pinatubo Eruption (1991)", year: 1991, month: 6, type: "Volcanic activity", deaths: 640, affected: 1036065, damage: 211000 },
  { name: "Moro Gulf Earthquake (1976)", year: 1976, month: 8, type: "Earthquake", deaths: 6000, affected: 175000, damage: 134000 },
  { name: "Typhoon Ike/Nitang (1984)", year: 1984, month: 9, type: "Storm", deaths: 1492, affected: 1850000, damage: 111000 },
  { name: "Typhoon Durian/Reming (2006)", year: 2006, month: 11, type: "Storm", deaths: 1399, affected: 2562517, damage: 66000 },
  { name: "Bohol Earthquake (2013)", year: 2013, month: 10, type: "Earthquake", deaths: 222, affected: 3221000, damage: 52000 },
  { name: "TS Washi/Sendong (2011)", year: 2011, month: 12, type: "Storm", deaths: 1439, affected: 1150300, damage: 38000 },
  { name: "TS Thelma/Uring (1991)", year: 1991, month: 11, type: "Storm", deaths: 5956, affected: 600000, damage: 27000 },
];

export const TOTAL_RECORDS = 986;

function generate(): DisasterRecord[] {
  const rand = mulberry32(20261117);
  const normal = () => {
    const u = Math.max(rand(), 1e-9);
    const v = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };

  const years: number[] = [];
  const yearWeights: number[] = [];
  for (let y = YEAR_MIN; y <= YEAR_MAX; y++) {
    const t = (y - YEAR_MIN)/(YEAR_MAX - YEAR_MIN);
    let w = (0.08 + Math.pow(t, 1.7) * 1.1) * (0.55 + rand() * 0.9);
    if (y > 2005) w *= 0.95 - (y - 2005) * 0.012; // recent plateau
    if (y === YEAR_MAX) w *= 0.35; // partial year
    years.push(y);
    yearWeights.push(w);
  }

  const typeWeights = [46, 20, 6, 8, 4, 7, 4, 2];
  const stormMonths = [1, 0.8, 0.7, 1.2, 2.5, 5, 9, 11, 10, 10, 8, 4];
  const floodMonths = [3, 2, 1, 1, 1.5, 3, 6, 8, 7, 6, 5, 4];
  const flatMonths = Array(12).fill(1);
  const monthIdx = MONTHS.map((_, i) => i + 1);

  const profile: Record<DisasterType, { d: number; a: number; dm: number }> = {
    Storm: { d: 2.6, a: 10.6, dm: 8.4 },
    Flood: { d: 1.9, a: 9.8, dm: 7.2 },
    Earthquake: { d: 1.4, a: 8.6, dm: 7.0 },
    Landslide: { d: 2.4, a: 6.5, dm: 5.5 },
    "Volcanic activity": { d: 0.5, a: 9.2, dm: 6.0 },
    Epidemic: { d: 3.0, a: 7.0, dm: 4.0 },
    Drought: { d: -1, a: 12.0, dm: 9.0 },
    "Extreme temperature": { d: 1.0, a: 6.0, dm: 4.0 },
  };

  const out: DisasterRecord[] = NOTABLE.map((n, i) => ({
    ...n,
    id: `PH-N${i}`,
    subgroup: TYPE_SUBGROUP[n.type],
  }));

  const n = TOTAL_RECORDS - NOTABLE.length;
  for (let i = 0; i < n; i++) {
    const year = pickWeighted(rand, years, yearWeights);
    const type = pickWeighted(rand, DISASTER_TYPES, typeWeights);
    const mw = type === "Storm" ? stormMonths : type === "Flood" || type === "Landslide" ? floodMonths : flatMonths;
    const month = pickWeighted(rand, monthIdx, mw);
    const p = profile[type];
    const deaths = Math.min(900, Math.max(0, Math.round(Math.exp(p.d + normal() * 1.4)) - 1));
    const recordedAffected = year >= 1950 || rand() < 0.3;
    const affected = recordedAffected ? Math.min(2_500_000, Math.round(Math.exp(p.a + normal() * 1.6))) : 0;
    const damageMissing = rand() < (year < 1970 ? 0.85 : 0.5);
    const damage = damageMissing ? null : Math.min(250_000, Math.round(Math.exp(p.dm + normal() * 1.3)));
    out.push({
      id: `PH-${String(i).padStart(4, "0")}`,
      name: `${type} · ${MONTHS[month - 1]} ${year}`,
      year,
      month,
      type,
      subgroup: TYPE_SUBGROUP[type],
      deaths,
      affected,
      damage,
    });
  }
  return out.sort((a, b) => a.year - b.year || a.month - b.month);
}

export const DISASTERS: DisasterRecord[] = generate();
