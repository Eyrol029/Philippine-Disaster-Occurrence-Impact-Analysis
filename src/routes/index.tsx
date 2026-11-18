import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  BarChart3,
  CalendarRange,
  Coins,
  Database,
  Info,
  PieChart as PieIcon,
  ScatterChart as ScatterIcon,
  Skull,
  TrendingUp,
  Trophy,
  TriangleAlert,
  Users,
} from "lucide-react";
import { FilterSidebar } from "@/components/dashboard/FilterSidebar";
import { KpiCard, Panel } from "@/components/dashboard/Panel";
import {
  DeathsScatter,
  MonthYearHeatmap,
  SubgroupDonut,
  TopDamageChart,
  TypeBarChart,
  YearLineChart,
} from "@/components/dashboard/Charts";
import { DEFAULT_FILTERS, DISASTERS, USD_TO_PHP, filterRecords, summarize, TYPE_SUBGROUP, type Filters } from "@/lib/disasters";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Philippine Disaster Occurrence & Impact Analysis" },
      {
        name: "description",
        content: "Interactive dashboard of Philippine disasters since 1905: occurrences, deaths, people affected and economic damage.",
      },
      { property: "og:title", content: "Philippine Disaster Occurrence & Impact Analysis" },
      {
        property: "og:description",
        content: "Explore storms, floods, earthquakes and more across the Philippines with interactive EM-DAT style charts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const nf = new Intl.NumberFormat("en-US");

function Dashboard() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const records = useMemo(() => filterRecords(DISASTERS, filters), [filters]);
  const totals = useMemo(() => summarize(records), [records]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-primary" />
              <span className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">
                EM-DAT International Disaster Database
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Philippine Disaster Occurrence & Impact Analysis
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Historical analysis of disaster events, casualties, and economic impacts (1905–2024)
            </p>
          </div>
          <div className="flex items-center gap-2 self-start rounded-md border border-border bg-secondary/50 px-3 py-1.5 text-xs font-medium text-foreground sm:self-center">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span>1905 – Present</span>
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-[1600px] flex-1 gap-4 p-4 lg:grid-cols-[250px_1fr]">
        <FilterSidebar
          filters={filters}
          onChange={setFilters}
          onReset={() => setFilters(DEFAULT_FILTERS)}
          shown={records.length}
          total={DISASTERS.length}
        />

        <div className="flex min-w-0 flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard icon={TriangleAlert} label="Total Disasters" value={nf.format(totals.count)} />
            <KpiCard icon={Skull} label="Total Deaths" value={nf.format(totals.deaths)} />
            <KpiCard icon={Users} label="Total Affected" value={nf.format(totals.affected)} />
            <KpiCard icon={Coins} label="Total Economic Damage ('000 PHP)" value={`₱${nf.format(totals.damage * USD_TO_PHP)}`} />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <Panel title="Disaster Occurrences by Type" icon={BarChart3} className="h-72">
              <TypeBarChart
                records={records}
                activeType={filters.type}
                onSelect={(type) =>
                  setFilters((f) =>
                    f.type === type
                      ? { ...f, type: "All" }
                      : { ...f, type, subgroup: f.subgroup === "All" ? "All" : TYPE_SUBGROUP[type] },
                  )
                }
              />
            </Panel>
            <Panel title="Disaster Occurrences Over the Years" icon={TrendingUp} className="h-72">
              <YearLineChart records={records} from={filters.yearFrom} to={filters.yearTo} />
            </Panel>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
            <Panel title="Disaster Occurrences by Month and Year" icon={CalendarRange} className="h-64">
              <MonthYearHeatmap records={records} from={filters.yearFrom} to={filters.yearTo} />
            </Panel>
            <Panel title="Disaster Subgroup Distribution" icon={PieIcon} className="min-h-64">
              <SubgroupDonut
                records={records}
                active={filters.subgroup}
                onSelect={(subgroup) =>
                  setFilters((f) =>
                    f.subgroup === subgroup
                      ? { ...f, subgroup: "All" }
                      : {
                          ...f,
                          subgroup,
                          type: f.type !== "All" && TYPE_SUBGROUP[f.type] !== subgroup ? "All" : f.type,
                        },
                  )
                }
              />
            </Panel>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <Panel title="Deaths vs Total Affected" icon={ScatterIcon} className="h-80">
              <DeathsScatter records={records} />
            </Panel>
            <Panel title="Top 10 Recorded Disasters by Economic Damage" icon={Trophy} className="h-80">
              <TopDamageChart records={records} />
            </Panel>
          </div>
        </div>
      </main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-2 px-4 py-3.5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2">
            <Database className="h-3.5 w-3.5 text-primary" />
            Data Source: EM-DAT · CRED, UCLouvain, Brussels, Belgium
          </p>
          <p className="flex items-center gap-2 opacity-80">
            <Info className="h-3.5 w-3.5" />
            Historical records may contain missing values for earlier events.
          </p>
        </div>
      </footer>
    </div>
  );
}
