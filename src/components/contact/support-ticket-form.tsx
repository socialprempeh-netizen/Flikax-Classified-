"use client";

import { useState, useTransition, type FormEvent } from "react";
import { submitSupportTicketAction } from "@/app/contact/actions";

const TOPICS = [
  "Account issues",
  "Login & password assistance",
  "Reporting scams or suspicious listings",
  "Payment enquiries",
  "Premium listings",
  "Technical issues",
  "General questions and feedback",
];

export function SupportTicketForm({ defaultEmail }: { defaultEmail?: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [topic, setTopic] = useState(TOPICS[0]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await submitSupportTicketAction({ name, email, topic, message });
      if (result.error) {
        setError(result.error);
        return;
      }
      setMessage("");
      setSuccess(true);
    });
  }

  if (success) {
    return (
      <section className="rounded-2xl bg-green-50 p-6 text-center sm:p-8">
        <h2 className="font-logo text-xl font-bold text-neutral-800">Message sent</h2>
        <p className="mt-2 text-sm text-neutral-600">
          Thanks — our support team will get back to you soon.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow-md sm:p-8">
      <h2 className="font-logo text-xl font-bold text-neutral-800">Send us a message</h2>
      <p className="mt-1 text-sm text-neutral-500">We&apos;ll get back to you by email.</p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-700">Name</span>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border-2 border-slate-strong px-3 py-2 text-sm text-neutral-800 outline-none focus:border-brand"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-700">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border-2 border-slate-strong px-3 py-2 text-sm text-neutral-800 outline-none focus:border-brand"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-neutral-700">Topic</span>
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full rounded-lg border-2 border-slate-strong px-3 py-2 text-sm text-neutral-800 outline-none focus:border-brand"
          >
            {TOPICS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-neutral-700">Message</span>
          <textarea
            required
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-lg border-2 border-slate-strong px-3 py-2 text-sm text-neutral-800 outline-none focus:border-brand"
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {isPending ? "Sending..." : "Send message"}
        </button>
      </form>
    </section>
  );
}
