import { MessageCircle } from "lucide-react";
import { startOrGetConversationAction } from "@/app/messages/actions";

export function StartChatButton({ listingId }: { listingId: string }) {
  return (
    <form action={startOrGetConversationAction.bind(null, listingId)}>
      <button
        type="submit"
        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border-2 border-brand bg-white px-3 py-2 text-sm font-bold text-brand hover:bg-brand-light"
      >
        <MessageCircle className="size-4" />
        Send Message
      </button>
    </form>
  );
}
