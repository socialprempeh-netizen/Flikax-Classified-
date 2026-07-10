import { useEffect, useState } from "react";
import { GHANA_REGIONS, type Region } from "@/lib/locations";

/** Enabled/edited regions come from the DB via /api/locations (Phase 4C, admin-editable);
 * GHANA_REGIONS is the initial render and the fallback if that fetch ever fails. */
export function useRegions(): Region[] {
  const [regions, setRegions] = useState<Region[]>(GHANA_REGIONS);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/locations")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("bad response"))))
      .then((data: Region[]) => {
        if (!cancelled && Array.isArray(data) && data.length > 0) setRegions(data);
      })
      .catch(() => {
        // keep the static GHANA_REGIONS fallback already in state
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return regions;
}
