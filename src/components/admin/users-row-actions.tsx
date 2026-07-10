"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  suspendUserAction,
  restoreUserAction,
  banUserAction,
  unbanUserAction,
  deleteUserAction,
} from "@/app/admin/users/actions";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { withAuthRetry } from "@/lib/auth-retry";

type PendingConfirm = { type: "ban" | "delete" };

export function UsersRowActions({
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
  const [confirm, setConfirm] = useState<PendingConfirm | null>(null);

  function run(action: () => Promise<void>) {
    setError(null);
    startTransition(async () => {
      try {
        await withAuthRetry(action);
        setConfirm(null);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Action failed.");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex flex-wrap justify-end gap-1.5">
        {suspended ? (
          <button
            type="button"
            disabled={isPending}
            onClick={() => run(() => restoreUserAction(userId))}
            className="rounded-lg border border-green-200 px-2.5 py-1.5 text-xs font-bold text-green-700 hover:bg-green-50 disabled:opacity-60"
          >
            Restore
          </button>
        ) : (
          <button
            type="button"
            disabled={isPending}
            onClick={() => run(() => suspendUserAction(userId, 7))}
            className="rounded-lg border border-amber-200 px-2.5 py-1.5 text-xs font-bold text-amber-700 hover:bg-amber-50 disabled:opacity-60"
          >
            Suspend 7d
          </button>
        )}

        {banned ? (
          <button
            type="button"
            disabled={isPending}
            onClick={() => run(() => unbanUserAction(userId))}
            className="rounded-lg border border-green-200 px-2.5 py-1.5 text-xs font-bold text-green-700 hover:bg-green-50 disabled:opacity-60"
          >
            Unban
          </button>
        ) : (
          <button
            type="button"
            disabled={isPending}
            onClick={() => setConfirm({ type: "ban" })}
            className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-60"
          >
            Ban
          </button>
        )}

        <button
          type="button"
          disabled={isPending}
          onClick={() => setConfirm({ type: "delete" })}
          className="rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-60"
        >
          Delete
        </button>
      </div>

      <ConfirmDialog
        open={confirm !== null}
        title={confirm?.type === "ban" ? "Ban this user?" : "Delete this account?"}
        message={
          confirm?.type === "ban"
            ? "They will be immediately signed out and unable to log in until unbanned."
            : "This permanently deletes the account and cascades to their listings, payments, purchases, and feedback. This can't be undone."
        }
        confirmLabel={confirm?.type === "ban" ? "Ban" : "Delete"}
        pending={isPending}
        onConfirm={() =>
          confirm?.type === "ban" ? run(() => banUserAction(userId)) : run(() => deleteUserAction(userId))
        }
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
