import { TrendingUp } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function PerformanceInsightsPage() {
  return (
    <ComingSoon
      icon={TrendingUp}
      title="Performance Insights"
      description="See views, saves, and contact clicks across all your listings over time."
    />
  );
}
