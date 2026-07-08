import { MessageSquareOff } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function DisableChatsPage() {
  return (
    <ComingSoon
      icon={MessageSquareOff}
      title="Disable chats"
      description="Turn off in-app messaging from buyers if you'd rather be contacted by phone only."
    />
  );
}
