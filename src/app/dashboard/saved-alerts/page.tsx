import { BellRing } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function SavedSearchAlertsPage() {
  return (
    <ComingSoon
      icon={BellRing}
      title="Saved Search Alerts"
      description="Save a search and get notified the moment a matching listing goes live."
    />
  );
}
