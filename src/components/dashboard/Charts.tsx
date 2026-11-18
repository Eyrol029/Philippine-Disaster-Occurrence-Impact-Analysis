import { useMemo } from "react";
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  LabelList,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { MONTHS, SUBGROUPS, USD_TO_PHP, type DisasterRecord, type DisasterType, type Subgroup } from "@/lib/disasters";

const nf = new Intl.NumberFormat("en-US");
const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

const axisTick = { fill: "var(--muted-foreground)", fontSize: 11 };
const tooltipStyle = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 6,
  boxShadow: "var(--shadow-panel)",
  color: "var(--foreground)",
  fontSize: 12,
};

export const SUBGROUP_COLORS: Record<Subgroup, string> = {
  Meteorological: "var(--chart-1)",
  Hydrological: "var(--chart-2)",
  Geophysical: "var(--chart-3)",
  Biological: "var(--chart-4)",
  Climatological: "var(--chart-5)",
};

/* ---------- Occurrences by type ---------- */
export function TypeBarChart({
  records,
  activeType,
  onSelect,
}: {
  records: DisasterRecord[];
  activeType: DisasterType | "All";
  onSelect: (t: DisasterType) => void;
}) {
  const data = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of records) counts.set(r.type, (counts.get(r.type) ?? 0) + 1);
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    const top = sorted.slice(0, 4).map(([name, value]) => ({ name, value, clickable: true }));
    const rest = sorted.slice(4).reduce((s, [, v]) => s + v, 0);
    if (rest > 0) top.push({ name: "Others", value: rest, clickable: false });
    return top;
  }, [records]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 8, left: -12, bottom: 4 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
        <XAxis dataKey="name" tick={axisTick} axisLine={false} tickLine={false} interval={0} />
        <YAxis tick={axisTick} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ fill: "var(--muted)", opacity: 0.5 }}
          formatter={(v: number) => [nf.format(v), "Records"]}
        />
        <Bar
          dataKey="value"
          radius={[3, 3, 0, 0]}
          maxBarSize={60}
          onClick={(d: { name: string; clickable: boolean }) => d.clickable && onSelect(d.name as DisasterType)}
          className="cursor-pointer"
        >
          {data.map((d) => (
            <Cell
              key={d.name}
              fill="var(--primary)"
              fillOpacity={activeType === "All" || activeType === d.name ? 1 : 0.25}
            />
          ))}
          <LabelList dataKey="value" position="top" fill="var(--foreground)" fontSize={11} fontWeight={600} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ---------- Occurrences over the years ---------- */
export function YearLineChart({ records, from, to }: { records: DisasterRecord[]; from: number; to: number }) {
  const data = useMemo(() => {
    const counts = new Map<number, number>();
    for (const r of records) counts.set(r.year, (counts.get(r.year) ?? 0) + 1);
    const rows = [];
    for (let y = from; y <= to; y++) rows.push({ year: y, value: counts.get(y) ?? 0 });
    return rows;
  }, [records, from, to]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 12, right: 12, left: -12, bottom: 4 }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.12} />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
        <XAxis dataKey="year" tick={axisTick} tickLine={false} minTickGap={28} />
        <YAxis tick={axisTick} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [nf.format(v), "Records"]} />
        <Area type="monotone" dataKey="value" stroke="none" fill="url(#areaGrad)" />
        <Line
          type="linear"
          dataKey="value"
          stroke="var(--primary)"
          strokeWidth={1.5}
          dot={data.length < 50 ? { r: 2.5, fill: "var(--primary)" } : false}
          activeDot={{ r: 4, fill: "var(--primary)" }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

/* ---------- Heatmap ---------- */
export function MonthYearHeatmap({ records, from, to }: { records: DisasterRecord[]; from: number; to: number }) {
  const { grid, max } = useMemo(() => {
    const cols = to - from + 1;
    const g = Array.from({ length: 12 }, () => new Array<number>(cols).fill(0));
    let m = 0;
    for (const r of records) {
      const row = g[r.month - 1];
      if (!row) continue;
      const v = (row[r.year - from] ?? 0) + 1;
      row[r.year - from] = v;
      if (v > m) m = v;
    }
    return { grid: g, max: Math.max(m, 1) };
  }, [records, from, to]);

  const cols = to - from + 1;
  const tickCount = Math.min(6, cols);
  const ticks = Array.from({ length: tickCount }, (_, i) =>
    Math.round(from + (i * (to - from)) / Math.max(tickCount - 1, 1)),
  );

  const color = (v: number) =>
    v === 0
      ? "var(--heat-low)"
      : `color-mix(in oklab, var(--heat-high) ${Math.round(20 + (v / max) * 80)}%, var(--heat-low))`;

  return (
    <div className="flex h-full gap-3">
      <div className="flex flex-1 gap-2">
        <div className="grid grid-rows-12 pb-5 text-[10px] leading-none text-muted-foreground">
          {MONTHS.map((m) => (
            <span key={m} className="flex items-center">
              {m}
            </span>
          ))}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div
            className="grid flex-1 gap-px"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gridTemplateRows: "repeat(12, minmax(0, 1fr))" }}
          >
            {grid.map((row, mi) =>
              row.map((v, yi) => (
                <div
                  key={`${mi}-${yi}`}
                  title={`${MONTHS[mi]} ${from + yi}: ${v} record${v === 1 ? "" : "s"}`}
                  className="rounded-[1px] transition-transform hover:scale-125"
                  style={{ backgroundColor: color(v), gridRow: mi + 1, gridColumn: yi + 1 }}
                />
              )),
            )}
          </div>
          <div className="relative mt-1 h-4 text-[10px] text-muted-foreground">
            {ticks.map((t) => (
              <span
                key={t}
                className="absolute -translate-x-1/2 first:translate-x-0 last:-translate-x-full"
                style={{ left: `${((t - from) / Math.max(cols - 1, 1)) * 100}%` }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center gap-1 pb-5 text-[10px] text-muted-foreground">
        <span>{max}</span>
        <div
          className="w-2 flex-1 rounded-sm"
          style={{ backgroundImage: "linear-gradient(to bottom, var(--heat-high), var(--heat-low))" }}
        />
        <span>0</span>
      </div>
    </div>
  );
}

/* ---------- Subgroup donut ---------- */
export function SubgroupDonut({
  records,
  active,
  onSelect,
}: {
  records: DisasterRecord[];
  active: Subgroup | "All";
  onSelect: (s: Subgroup) => void;
}) {
  const data = useMemo(() => {
    const counts = new Map<Subgroup, number>();
    for (const r of records) counts.set(r.subgroup, (counts.get(r.subgroup) ?? 0) + 1);
    return SUBGROUPS.map((s) => ({ name: s, value: counts.get(s) ?? 0 })).filter((d) => d.value > 0);
  }, [records]);
  const total = records.length;

  return (
    <div className="flex h-full flex-col items-center gap-4 sm:flex-row">
      <div className="relative h-40 w-40 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius="65%"
              outerRadius="100%"
              startAngle={90}
              endAngle={-270}
              stroke="var(--card)"
              strokeWidth={2}
              onClick={(d: { name: Subgroup }) => onSelect(d.name)}
              className="cursor-pointer"
            >
              {data.map((d) => (
                <Cell
                  key={d.name}
                  fill={SUBGROUP_COLORS[d.name]}
                  fillOpacity={active === "All" || active === d.name ? 1 : 0.25}
                />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => nf.format(v)} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-xl font-bold tracking-tight text-foreground">{nf.format(total)}</span>
          <span className="text-[11px] text-muted-foreground">Records</span>
        </div>
      </div>
      <ul className="w-full flex-1 space-y-1.5">
        {data.map((d) => (
          <li key={d.name}>
            <button
              type="button"
              onClick={() => onSelect(d.name)}
              className="flex w-full items-center gap-2.5 rounded-md px-2 py-1 text-xs transition-colors hover:bg-secondary"
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: SUBGROUP_COLORS[d.name] }} />
              <span className="flex-1 text-left font-medium text-foreground">{d.name}</span>
              <span className="tabular-nums text-muted-foreground">
                {total ? ((d.value / total) * 100).toFixed(1) : "0.0"}%
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- Deaths vs affected ---------- */
export function DeathsScatter({ records }: { records: DisasterRecord[] }) {
  const data = useMemo(
    () => records.filter((r) => r.affected > 0 || r.deaths > 0).map((r) => ({ x: r.deaths, y: r.affected, name: r.name, sub: r.subgroup })),
    [records],
  );
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 8, right: 16, left: -10, bottom: 4 }}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
        <XAxis
          type="number"
          dataKey="x"
          name="Deaths"
          scale="sqrt"
          domain={[0, "auto"]}
          tick={axisTick}
          tickFormatter={(v) => compact.format(v)}
        />
        <YAxis
          type="number"
          dataKey="y"
          name="Affected"
          scale="sqrt"
          domain={[0, "auto"]}
          tick={axisTick}
          tickFormatter={(v) => compact.format(v)}
          width={44}
        />
        <ZAxis range={[24, 24]} />
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ strokeDasharray: "3 3" }}
          content={({ payload }) => {
            const p = payload?.[0]?.payload as (typeof data)[number] | undefined;
            if (!p) return null;
            return (
              <div style={tooltipStyle} className="px-3 py-2">
                <p className="font-semibold">{p.name}</p>
                <p className="text-muted-foreground">Deaths: {nf.format(p.x)}</p>
                <p className="text-muted-foreground">Affected: {nf.format(p.y)}</p>
              </div>
            );
          }}
        />
        <Scatter data={data} fill="var(--primary)" fillOpacity={0.45} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

/* ---------- Top 10 by damage ---------- */
export function TopDamageChart({ records }: { records: DisasterRecord[] }) {
  const data = useMemo(
    () =>
      records
        .filter((r) => r.damage)
        .sort((a, b) => (b.damage ?? 0) - (a.damage ?? 0))
        .slice(0, 10)
        .map((r) => ({ name: r.name, value: (r.damage ?? 0) * USD_TO_PHP })),
    [records],
  );
  if (!data.length)
    return <p className="flex h-full items-center justify-center text-xs text-muted-foreground">No damage recorded for this selection.</p>;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 75, left: 4, bottom: 0 }}>
        <CartesianGrid horizontal={false} stroke="var(--border)" strokeDasharray="3 3" />
        <XAxis type="number" tick={axisTick} tickFormatter={(v) => `₱${compact.format(v)}`} />
        <YAxis
          type="category"
          dataKey="name"
          width={180}
          tick={({ x, y, payload }: { x: number; y: number; payload: { value: string } }) => (
            <text x={x - 6} y={y} dy={4} textAnchor="end" fill="var(--foreground)" fontSize={11}>
              {payload.value.length > 28 ? `${payload.value.slice(0, 27)}…` : payload.value}
            </text>
          )}
          tickLine={false}
          axisLine={false}
          interval={0}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ fill: "var(--muted)", opacity: 0.5 }}
          formatter={(v: number) => [`₱${nf.format(v)}`, "Damage ('000 PHP)"]}
        />
        <Bar dataKey="value" fill="var(--primary)" radius={[0, 2, 2, 0]} barSize={10}>
          <LabelList
            dataKey="value"
            position="right"
            formatter={(v: number) => `₱${compact.format(v)}`}
            fill="var(--muted-foreground)"
            fontSize={10}
            fontWeight={500}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
