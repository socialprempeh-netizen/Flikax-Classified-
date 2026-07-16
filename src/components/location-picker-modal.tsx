"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import type { District, Region } from "@/lib/locations";
import { useRegions } from "@/lib/use-regions";

function groupByLetter<T extends { name: string }>(items: T[]) {
  const groups: { letter: string; items: T[] }[] = [];
  for (const item of items) {
    const letter = item.name[0]?.toUpperCase() ?? "#";
    const last = groups[groups.length - 1];
    if (last && last.letter === letter) {
      last.items.push(item);
    } else {
      groups.push({ letter, items: [item] });
    }
  }
  return groups;
}

// Split an already-sorted list into `columnCount` contiguous chunks so columns
// render reliably across browsers, instead of relying on CSS column-balancing
// (which doesn't distribute evenly when items use break-inside-avoid).
function splitIntoColumns<T>(items: T[], columnCount: number): T[][] {
  const perColumn = Math.ceil(items.length / columnCount) || 1;
  return Array.from({ length: columnCount }, (_, i) =>
    items.slice(i * perColumn, (i + 1) * perColumn)
  );
}

type SearchResult =
  | { kind: "region"; region: Region }
  | { kind: "district"; district: District; region: Region };

export function LocationPickerModal({
  open,
  onClose,
  onSelect,
  locationCounts,
  totalListingsCount,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (name?: string) => void;
  locationCounts: Record<string, number>;
  totalListingsCount: number;
}) {
  const regions = useRegions();
  const [activeRegionSlug, setActiveRegionSlug] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const activeRegion = regions.find((r) => r.slug === activeRegionSlug) ?? null;

  function districtCount(name: string) {
    return locationCounts[name] ?? 0;
  }

  function regionCount(region: Region) {
    return region.districts.reduce((sum, district) => sum + districtCount(district.name), 0);
  }

  function close() {
    onClose();
    setActiveRegionSlug(null);
    setQuery("");
  }

  function selectLocation(name?: string) {
    onSelect(name);
    close();
  }

  function openRegion(slug: string) {
    setActiveRegionSlug(slug);
    setQuery("");
  }

  const searchResults = useMemo<SearchResult[] | null>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    const results: SearchResult[] = [];
    for (const region of regions) {
      if (region.name.toLowerCase().includes(q)) {
        results.push({ kind: "region", region });
      }
      for (const district of region.districts) {
        if (district.name.toLowerCase().includes(q)) {
          results.push({ kind: "district", district, region });
        }
      }
    }
    return results;
  }, [query, regions]);

  const regionColumns = useMemo(() => {
    const sorted = [...regions].sort((a, b) => a.name.localeCompare(b.name));
    return splitIntoColumns(sorted, 2).map(groupByLetter);
  }, [regions]);

  const districtColumns = useMemo(() => {
    if (!activeRegion) return [];
    const sorted = [...activeRegion.districts].sort((a, b) => a.name.localeCompare(b.name));
    return splitIntoColumns(sorted, 3).map(groupByLetter);
  }, [activeRegion]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-neutral-900/70 p-4"
      onClick={close}
    >
      <div
        className="flex max-h-[75vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-neutral-100 px-5 py-4">
          {activeRegion ? (
            <button
              type="button"
              onClick={() => {
                setActiveRegionSlug(null);
                setQuery("");
              }}
              className="flex shrink-0 cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-base font-medium text-neutral-700 hover:bg-neutral-50 hover:text-brand"
            >
              <ChevronLeft className="size-4" />
              Back
            </button>
          ) : (
            <span className="shrink-0 text-base font-bold text-neutral-800">Select location</span>
          )}

          <div className="ml-auto flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2">
            <Search className="size-4 shrink-0 text-neutral-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find state, city or district..."
              className="w-40 min-w-0 text-base text-neutral-700 outline-none placeholder:text-neutral-400 sm:w-56"
            />
          </div>

          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
          >
            <X className="size-4.5" />
          </button>
        </div>

        <div className="overflow-y-auto p-5">
          {searchResults ? (
            <div className="flex flex-col divide-y divide-neutral-100">
              {searchResults.length === 0 && (
                <p className="py-6 text-center text-base text-neutral-400">No matches found.</p>
              )}
              {searchResults.map((result) =>
                result.kind === "region" ? (
                  <button
                    key={`region-${result.region.slug}`}
                    type="button"
                    onClick={() => openRegion(result.region.slug)}
                    className="flex cursor-pointer items-center justify-between px-2 py-3 text-left transition-colors hover:bg-neutral-50"
                  >
                    <span className="text-base font-medium text-neutral-800">{result.region.name}</span>
                    <ChevronRight className="size-4 text-neutral-400" />
                  </button>
                ) : (
                  <button
                    key={`district-${result.district.slug}`}
                    type="button"
                    onClick={() => selectLocation(result.district.name)}
                    className="block cursor-pointer px-2 py-3 text-left transition-colors hover:bg-neutral-50"
                  >
                    <div className="text-base text-neutral-800">{result.district.name}</div>
                    <div className="text-sm text-neutral-400">{result.region.name}</div>
                  </button>
                )
              )}
            </div>
          ) : activeRegion ? (
            <>
              <button
                type="button"
                onClick={() => selectLocation(activeRegion.name)}
                className="mb-4 block w-full cursor-pointer rounded-lg px-3 py-2.5 text-left text-base font-semibold text-brand transition-colors hover:bg-brand-light"
              >
                All {activeRegion.name} · {regionCount(activeRegion)} ads
              </button>
              <div className="flex flex-col gap-6 sm:flex-row">
                {districtColumns.map((groups, columnIndex) => (
                  <div key={columnIndex} className="flex-1">
                    {groups.map((group) => (
                      <div key={group.letter} className="mb-4">
                        <div className="mb-1 px-2 text-xs font-bold uppercase tracking-wide text-neutral-400">
                          {group.letter}
                        </div>
                        <div className="flex flex-col divide-y divide-neutral-100">
                          {group.items.map((district) => (
                            <button
                              key={district.slug}
                              type="button"
                              onClick={() => selectLocation(district.name)}
                              className="block cursor-pointer rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-neutral-50"
                            >
                              <div className="text-sm leading-tight text-neutral-700">
                                {district.name} · {districtCount(district.name)} ads
                              </div>
                              <div className="text-xs text-neutral-400">{activeRegion.name}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => selectLocation(undefined)}
                className="mb-4 block w-full cursor-pointer rounded-lg px-3 py-2.5 text-left text-base font-semibold text-brand transition-colors hover:bg-brand-light"
              >
                All Ghana · {totalListingsCount} Ads
              </button>
              <div className="flex flex-col gap-6 sm:flex-row">
                {regionColumns.map((groups, columnIndex) => (
                  <div key={columnIndex} className="flex-1">
                    {groups.map((group) => (
                      <div key={group.letter} className="mb-4">
                        <div className="mb-1 px-2 text-xs font-bold uppercase tracking-wide text-neutral-400">
                          {group.letter}
                        </div>
                        <div className="flex flex-col divide-y divide-neutral-100">
                          {group.items.map((region) => (
                            <button
                              key={region.slug}
                              type="button"
                              onClick={() => openRegion(region.slug)}
                              className="flex w-full cursor-pointer items-center justify-between rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-neutral-50"
                            >
                              <span className="text-base text-neutral-700">
                                {region.name} · {regionCount(region)} ads
                              </span>
                              <ChevronRight className="size-3.5 shrink-0 text-neutral-300" />
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
