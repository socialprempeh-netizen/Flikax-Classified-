"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function NotificationSettingsForm({
  initialNewMessage,
  initialNewCall,
}: {
  initialNewMessage: boolean;
  initialNewCall: boolean;
}) {
  const [supabase] = useState(() => createClient());
  const [newMessage, setNewMessage] = useState(initialNewMessage);
  const [newCall, setNewCall] = useState(initialNewCall);
  const [saving, setSaving] = useState(false);

  async function toggle(key: "notify_new_message" | "notify_new_call", value: boolean) {
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const update =
        key === "notify_new_message" ? { notify_new_message: value } : { notify_new_call: value };
      await supabase.from("profiles").update(update).eq("id", user.id);
    }
    setSaving(false);
  }

  return (
    <div className="space-y-3 rounded-2xl bg-white p-5 shadow-md">
      <h2 className="text-sm font-bold text-neutral-800">Manage notifications</h2>

      <label className="flex items-center justify-between">
        <span className="text-sm text-neutral-700">New message</span>
        <input
          type="checkbox"
          checked={newMessage}
          disabled={saving}
          onChange={(e) => {
            setNewMessage(e.target.checked);
            toggle("notify_new_message", e.target.checked);
          }}
          className="size-4 accent-brand"
        />
      </label>

      <label className="flex items-center justify-between">
        <span className="text-sm text-neutral-700">New call</span>
        <input
          type="checkbox"
          checked={newCall}
          disabled={saving}
          onChange={(e) => {
            setNewCall(e.target.checked);
            toggle("notify_new_call", e.target.checked);
          }}
          className="size-4 accent-brand"
        />
      </label>
    </div>
  );
}
