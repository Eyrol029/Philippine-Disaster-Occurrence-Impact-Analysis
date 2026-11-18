import { CalendarDays, Filter, LayoutGrid, RotateCcw, Tag } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DISASTER_TYPES,
  SUBGROUPS,
  TYPE_SUBGROUP,
  YEAR_MAX,
  YEAR_MIN,
  type Filters,
} from "@/lib/disasters";

const allYears = Array.from({ length: YEAR_MAX - YEAR_MIN + 1 }, (_, i) => YEAR_MIN + i);

function Label({ icon: Icon, children }: { icon: typeof Tag; children: string }) {
  return (
    <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-foreground">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      {children}
    </p>
  );
}

export function FilterSidebar({
  filters,
  onChange,
  onReset,
  shown,
  total,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  onReset: () => void;
  shown: number;
  total: number;
}) {
  const types = DISASTER_TYPES.filter(
    (t) => filters.subgroup === "All" || TYPE_SUBGROUP[t] === filters.subgroup,
  );

  return (
    <aside className="panel flex flex-col p-4 lg:min-h-full">
      <div className="mb-4 flex items-center justify-between border-b border-border/60 pb-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
          <Filter className="h-4 w-4 text-primary" />
          Filters
        </h2>
        <span className="rounded bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
          {shown.toLocaleString()} / {total.toLocaleString()}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <Label icon={CalendarDays}>Year Range</Label>
          <div className="flex items-center gap-2">
            <Select
              value={String(filters.yearFrom)}
              onValueChange={(v) => onChange({ ...filters, yearFrom: Number(v) })}
            >
              <SelectTrigger className="h-9 bg-background text-xs" aria-label="From year">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {allYears
                  .filter((y) => y <= filters.yearTo)
                  .map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground">–</span>
            <Select
              value={String(filters.yearTo)}
              onValueChange={(v) => onChange({ ...filters, yearTo: Number(v) })}
            >
              <SelectTrigger className="h-9 bg-background text-xs" aria-label="To year">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {allYears
                  .filter((y) => y >= filters.yearFrom)
                  .map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label icon={Tag}>Disaster Type</Label>
          <Select
            value={filters.type}
            onValueChange={(v) => onChange({ ...filters, type: v as Filters["type"] })}
          >
            <SelectTrigger className="h-9 bg-background text-xs" aria-label="Disaster type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Types</SelectItem>
              {types.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label icon={LayoutGrid}>Disaster Subgroup</Label>
          <Select
            value={filters.subgroup}
            onValueChange={(v) => {
              const subgroup = v as Filters["subgroup"];
              const keepType =
                filters.type === "All" || subgroup === "All" || TYPE_SUBGROUP[filters.type] === subgroup;
              onChange({ ...filters, subgroup, type: keepType ? filters.type : "All" });
            }}
          >
            <SelectTrigger className="h-9 bg-background text-xs" aria-label="Disaster subgroup">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Subgroups</SelectItem>
              {SUBGROUPS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="flex h-9 w-full items-center justify-center gap-2 rounded-md border border-border bg-secondary text-xs font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset Filters
        </button>

        <div className="border-t border-border/60 pt-3 text-[11px] leading-relaxed text-muted-foreground">
          Tip: Click on any chart element (bars or donut slices) to filter data directly.
        </div>
      </div>
    </aside>
  );
}
