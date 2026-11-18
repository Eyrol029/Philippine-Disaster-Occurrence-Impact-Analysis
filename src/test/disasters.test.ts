import { describe, expect, it } from "vitest";
import { DEFAULT_FILTERS, DISASTERS, filterRecords, summarize, TOTAL_RECORDS } from "@/lib/disasters";

describe("disaster filters", () => {
  it("shows every record with default filters", () => {
    expect(filterRecords(DISASTERS, DEFAULT_FILTERS)).toHaveLength(TOTAL_RECORDS);
  });

  it("includes both ends of the year range", () => {
    const out = filterRecords(DISASTERS, { ...DEFAULT_FILTERS, yearFrom: 2013, yearTo: 2013 });
    expect(out.length).toBeGreaterThan(0);
    expect(out.every((r) => r.year === 2013)).toBe(true);
    expect(out.some((r) => r.name.includes("Haiyan"))).toBe(true);
  });

  it("filters by type and subgroup together", () => {
    const out = filterRecords(DISASTERS, { ...DEFAULT_FILTERS, type: "Earthquake", subgroup: "Geophysical" });
    expect(out.every((r) => r.type === "Earthquake")).toBe(true);
    expect(filterRecords(DISASTERS, { ...DEFAULT_FILTERS, type: "Storm", subgroup: "Geophysical" })).toHaveLength(0);
  });

  it("treats missing damage as zero in totals", () => {
    const t = summarize([
      { id: "a", name: "a", year: 2000, month: 1, type: "Flood", subgroup: "Hydrological", deaths: 2, affected: 10, damage: null },
      { id: "b", name: "b", year: 2000, month: 2, type: "Flood", subgroup: "Hydrological", deaths: 3, affected: 5, damage: 100 },
    ]);
    expect(t).toEqual({ count: 2, deaths: 5, affected: 15, damage: 100 });
  });
});
