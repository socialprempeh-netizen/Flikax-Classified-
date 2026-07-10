"use server";

import { getUser, createClient } from "@/lib/supabase/server";

export async function submitSupportTicketAction(input: {
  name: string;
  email: string;
  topic: string;
  message: string;
}): Promise<{ error?: string }> {
  if (!input.name.trim()) return { error: "Enter your name." };
  if (!input.email.trim()) return { error: "Enter your email." };
  if (!input.topic.trim()) return { error: "Choose a topic." };
  if (!input.message.trim()) return { error: "Enter a message." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await getUser();

  const { error } = await supabase.from("support_tickets").insert({
    user_id: user?.id ?? null,
    name: input.name.trim(),
    email: input.email.trim(),
    topic: input.topic.trim(),
    message: input.message.trim(),
  });

  if (error) return { error: error.message };
  return {};
}
