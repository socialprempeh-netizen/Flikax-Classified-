import { Wallet } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function GhcBalancePage() {
  return (
    <ComingSoon
      icon={Wallet}
      title="GHC Balance"
      description="Manage your Flikax wallet balance for featured ads and other paid boosts."
    />
  );
}
