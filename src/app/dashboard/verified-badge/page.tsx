import { ShieldCheck } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function VerifiedBadgePage() {
  return (
    <ComingSoon
      icon={ShieldCheck}
      title="Verified User Badge"
      description="Verify your identity to build buyer trust and stand out with a verified badge on your listings."
    />
  );
}
