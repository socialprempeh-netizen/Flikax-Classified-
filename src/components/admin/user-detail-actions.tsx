"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  suspendUserAction,
  restoreUserAction,
  banUserAction,
  unbanUserAction,
  deleteUserAction,
  logWarningAction,
} from "@/app/admin/users/actions";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { withAuthRetry } from "@/lib/auth-retry";

const SUSPEND_DURATIONS = [3, 7, 14, 30];

export function UserDetailActions({
  userId,
  suspended,
  banned,
}: {
  userId: string;
  suspended: boolean;
  banned: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<"ban" | "delete" | null>(null);
  const [suspendDays, setSuspendDays] = useState(7);
  const [warningMessage, setWarningMessage] = useState("");

  function run(action: () => Promise<void>, onDone?: () => void) {
    setError(null);
    startTransition(async () => {
      try {
        await withAuthRetry(action);
        setConfirm(null);
        onDone?.();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Action failed.");
      }
    });
  }

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-5">
      <h2 className="text-sm font-bold text-neutral-800">Account actions</h2>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-3 border-t border-neutral-100 pt-4">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Suspend posting
        </span>
        {suspended ? (
          <button
            type="button"
            disabled={isPending}
            onClick={() => run(() => restoreUserAction(userId))}
            className="rounded-lg border border-green-200 px-3 py-1.5 text-xs font-bold text-green-700 hover:bg-green-50 disabled:opacity-60"
          >
            Restore (lift suspension)
          </button>
        ) : (
          <div className="flex gap-2">
            <select
              value={suspendDays}
              onChange={(e) => setSuspendDays(Number(e.target.value))}
              className="rounded-lg border border-neutral-200 px-2 py-1.5 text-xs text-neutral-800 outline-none focus:border-brand"
            >
              {SUSPEND_DURATIONS.map((d) => (
                <option key={d} value={d}>
                  {d} days
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={isPending}
              onClick={() => run(() => suspendUserAction(userId, suspendDays))}
              className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-700 disabled:opacity-60"
            >
              Suspend
            </button>
          </div>
        )}
        <p className="mt-1 text-xs text-neutral-400">Blocks new listings and plan purchases. Login stays open.</p>
      </div>

      <div className="mt-4 border-t border-neutral-100 pt-4">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Login access
        </span>
        {banned ? (
          <button
            type="button"
            disabled={isPending}
            onClick={() => run(() => unbanUserAction(userId))}
            className="rounded-lg border border-green-200 px-3 py-1.5 text-xs font-bold text-green-700 hover:bg-green-50 disabled:opacity-60"
          >
            Unban
          </button>
        ) : (
          <button
            type="button"
            disabled={isPending}
            onClick={() => setConfirm("ban")}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-60"
          >
            Ban
          </button>
        )}
        <p className="mt-1 text-xs text-neutral-400">Blocks login entirely until unbanned.</p>
      </div>

      <div className="mt-4 border-t border-neutral-100 pt-4">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Log a warning
        </span>
        <textarea
          rows={2}
          value={warningMessage}
          onChange={(e) => setWarningMessage(e.target.value)}
          placeholder="Recorded on this profile — not delivered to the user (no notification system exists yet)."
          className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs text-neutral-800 outline-none focus:border-brand"
        />
        <button
          type="button"
          disabled={isPending || !warningMessage.trim()}
          onClick={() => run(() => logWarningAction(userId, warningMessage), () => setWarningMessage(""))}
          className="mt-2 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-bold text-neutral-700 hover:bg-neutral-50 disabled:opacity-60"
        >
          Log warning
        </button>
      </div>

      <div className="mt-4 border-t border-neutral-100 pt-4">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Danger zone
        </span>
        <button
          type="button"
          disabled={isPending}
          onClick={() => setConfirm("delete")}
          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-60"
        >
          Delete account
        </button>
      </div>

      <ConfirmDialog
        open={confirm !== null}
        title={confirm === "ban" ? "Ban this user?" : "Delete this account?"}
        message={
          confirm === "ban"
            ? "They will be immediately signed out and unable to log in until unbanned."
            : "This permanently deletes the account and cascades to their listings, payments, purchases, and feedback. This can't be undone."
        }
        confirmLabel={confirm === "ban" ? "Ban" : "Delete"}
        pending={isPending}
        onConfirm={() =>
          confirm === "ban"
            ? run(() => banUserAction(userId))
            : run(() => deleteUserAction(userId), () => router.push("/admin/users"))
        }
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
