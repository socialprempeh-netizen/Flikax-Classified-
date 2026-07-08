import { StarOff } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function DisableFeedbackPage() {
  return (
    <ComingSoon
      icon={StarOff}
      title="Disable Feedback"
      description="Hide the Feedback & Ratings section from your public profile."
    />
  );
}
