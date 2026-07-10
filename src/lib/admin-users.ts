export type AdminUserRow = {
  id: string;
  fullName: string | null;
  phone: string | null;
  role: string | null;
  createdAt: string;
  suspendedUntil: string | null;
  email: string | null;
  bannedUntil: string | null;
  lastSignInAt: string | null;
};

export function isSuspended(suspendedUntil: string | null): boolean {
  return Boolean(suspendedUntil && new Date(suspendedUntil).getTime() > Date.now());
}

export function isBanned(bannedUntil: string | null): boolean {
  if (!bannedUntil) return false;
  // GoTrue represents "not banned" both as null and as a far-past sentinel
  // timestamp depending on version, so a plain future/past check covers both.
  return new Date(bannedUntil).getTime() > Date.now();
}

export function accountStatus(row: Pick<AdminUserRow, "suspendedUntil" | "bannedUntil">): "banned" | "suspended" | "active" {
  if (isBanned(row.bannedUntil)) return "banned";
  if (isSuspended(row.suspendedUntil)) return "suspended";
  return "active";
}
