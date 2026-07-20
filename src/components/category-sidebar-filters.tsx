"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { LocationPickerModal } from "@/components/location-picker-modal";
import { useRegions } from "@/lib/use-regions";
import type { SidebarFilterField } from "@/lib/category-filters";

export function CategorySidebarFilters({
  categorySlug,
  fields,
  activeLocationSlug,
}: {
  categorySlug: string;
  fields: SidebarFilterField[];
  activeLocationSlug?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const regions = useRegions();
  const [locationOpen, setLocationOpen] = useState(false);

  const allDistricts = regions.flatMap((r) => r.districts);
  const activeDistrict = allDistricts.find((d) => d.slug === activeLocationSlug);
  const locationDisplayName = activeDistrict?.name ?? searchParams.get("location") ?? "All Ghana";

  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {
      minPrice: searchParams.get("minPrice") ?? "",
      maxPrice: searchParams.get("maxPrice") ?? "",
    };
    for (const field of fields) {
      if (field.type === "range") {
        initial[`${field.key}_min`] = searchParams.get(`attr_${field.key}_min`) ?? "";
        initial[`${field.key}_max`] = searchParams.get(`attr_${field.key}_max`) ?? "";
      } else {
        initial[field.key] = searchParams.get(`attr_${field.key}`) ?? "";
      }
    }
    return initial;
  });

  function setValue(key: string, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function applyFilters() {
    const params = new URLSearchParams(searchParams);
    params.delete("page");

    if (values.minPrice) params.set("minPrice", values.minPrice);
    else params.delete("minPrice");
    if (values.maxPrice) params.set("maxPrice", values.maxPrice);
    else params.delete("maxPrice");

    for (const field of fields) {
      if (field.type === "range") {
        const min = values[`${field.key}_min`];
        const max = values[`${field.key}_max`];
        if (min) params.set(`attr_${field.key}_min`, min);
        else params.delete(`attr_${field.key}_min`);
        if (max) params.set(`attr_${field.key}_max`, max);
        else params.delete(`attr_${field.key}_max`);
      } else {
        const value = values[field.key];
        if (value) params.set(`attr_${field.key}`, value);
        else params.delete(`attr_${field.key}`);
      }
    }

    const qs = params.toString();
    router.push(qs ? `?${qs}` : "?");
  }

  function handleLocationSelect(name?: string) {
    const target = name ? allDistricts.find((d) => d.name === name) : undefined;
    const params = new URLSearchParams(searchParams);
    params.delete("location");

    if (target) {
      const qs = params.toString();
      router.push(qs ? `/${categorySlug}/${target.slug}?${qs}` : `/${categorySlug}/${target.slug}`);
      return;
    }

    // Not a district -- either a suburb (no dedicated SEO subpage of its own)
    // or a cleared/"All Ghana" selection. A suburb still filters correctly
    // via the plain `location` query param since listings match on it with
    // exact string equality, same as a district does.
    if (name) params.set("location", name);
    const qs = params.toString();
    router.push(qs ? `/${categorySlug}?${qs}` : `/${categorySlug}`);
  }

  return (
    <div className="hidden w-64 shrink-0 lg:block">
      <div className="rounded-xl border border-neutral-300 bg-white p-3 shadow-md">
        <h3 className="mb-1 text-sm font-bold text-neutral-800">Filters</h3>

        <button
          type="button"
          onClick={() => setLocationOpen(true)}
          className="flex w-full items-center justify-between border-b border-neutral-100 py-2 text-left"
        >
          <span className="text-sm font-semibold text-neutral-700">Location</span>
          <span className="flex items-center gap-1 text-sm text-neutral-500">
            {locationDisplayName}
            <ChevronRight className="size-4" />
          </span>
        </button>

        <div className="border-b border-neutral-100 py-2">
          <p className="mb-1.5 text-sm font-semibold text-neutral-700">Price, GH₵</p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="min"
              value={values.minPrice}
              onChange={(e) => setValue("minPrice", e.target.value)}
              className="w-full min-w-0 rounded-lg border border-neutral-200 px-2 py-1.5 text-sm outline-none focus:border-brand"
            />
            <span className="shrink-0 text-neutral-400">–</span>
            <input
              type="number"
              placeholder="max"
              value={values.maxPrice}
              onChange={(e) => setValue("maxPrice", e.target.value)}
              className="w-full min-w-0 rounded-lg border border-neutral-200 px-2 py-1.5 text-sm outline-none focus:border-brand"
            />
          </div>
        </div>

        {fields.map((field) => (
          <div key={field.key} className="border-b border-neutral-100 py-2 last:border-b-0">
            <p className="mb-1.5 text-sm font-semibold text-neutral-700">{field.label}</p>

            {field.type === "select" && (
              <select
                value={values[field.key]}
                onChange={(e) => setValue(field.key, e.target.value)}
                className="w-full rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-sm text-neutral-700 outline-none focus:border-brand"
              >
                <option value="">Any</option>
                {(field.options ?? []).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )}

            {field.type === "text" && (
              <input
                type="text"
                placeholder={`Find ${field.label.toLowerCase()}`}
                value={values[field.key]}
                onChange={(e) => setValue(field.key, e.target.value)}
                className="w-full rounded-lg border border-neutral-200 px-2 py-1.5 text-sm outline-none focus:border-brand"
              />
            )}

            {field.type === "range" && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="min"
                  value={values[`${field.key}_min`]}
                  onChange={(e) => setValue(`${field.key}_min`, e.target.value)}
                  className="w-full min-w-0 rounded-lg border border-neutral-200 px-2 py-1.5 text-sm outline-none focus:border-brand"
                />
                <span className="shrink-0 text-neutral-400">–</span>
                <input
                  type="number"
                  placeholder="max"
                  value={values[`${field.key}_max`]}
                  onChange={(e) => setValue(`${field.key}_max`, e.target.value)}
                  className="w-full min-w-0 rounded-lg border border-neutral-200 px-2 py-1.5 text-sm outline-none focus:border-brand"
                />
              </div>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={applyFilters}
          className="mt-3 w-full rounded-lg bg-brand px-3 py-2 text-sm font-bold text-white hover:bg-brand-dark"
        >
          Apply Filters
        </button>
      </div>

      <LocationPickerModal open={locationOpen} onClose={() => setLocationOpen(false)} onSelect={handleLocationSelect} />
    </div>
  );
}
