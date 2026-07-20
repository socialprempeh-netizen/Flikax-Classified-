import { MessageCircle } from "lucide-react";
import { startOrGetConversationAction } from "@/app/messages/actions";

export function StartChatButton({ listingId }: { listingId: string }) {
  return (
    <form action={startOrGetConversationAction.bind(null, listingId)}>
      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-200 px-4 py-2.5 text-base font-bold text-neutral-700 hover:bg-neutral-50"
      >
        <MessageCircle className="size-4" />
        Send Message
      </button>
    </form>
  );
}
