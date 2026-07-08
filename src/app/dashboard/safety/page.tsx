import { ShieldAlert } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function SafetyCentrePage() {
  return (
    <ComingSoon
      icon={ShieldAlert}
      title="Safety Centre"
      description="Tips and resources to help you buy and sell safely on Flikax."
    />
  );
}
