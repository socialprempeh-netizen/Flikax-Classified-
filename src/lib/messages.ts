type ConversationReadState = {
  buyer_id: string;
  seller_id: string;
  last_message_at: string;
  last_read_by_buyer_at: string | null;
  last_read_by_seller_at: string | null;
};

/** A conversation is unread for a viewer once the last message postdates
 * whichever "last read" column belongs to their side (buyer vs. seller). */
export function isConversationUnread(conversation: ConversationReadState, viewerId: string): boolean {
  const lastReadAt =
    conversation.buyer_id === viewerId ? conversation.last_read_by_buyer_at : conversation.last_read_by_seller_at;
  if (!lastReadAt) return true;
  return new Date(conversation.last_message_at) > new Date(lastReadAt);
}
