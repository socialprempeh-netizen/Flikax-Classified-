import { Gift } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function ReferralProgramPage() {
  return (
    <ComingSoon
      icon={Gift}
      title="Referral Program"
      description="Invite friends to Flikax and earn rewards when they post their first ad."
    />
  );
}
