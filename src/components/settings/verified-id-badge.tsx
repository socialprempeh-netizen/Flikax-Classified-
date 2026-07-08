export function VerifiedIdBadge() {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-md">
      <div>
        <h2 className="text-sm font-bold text-neutral-800">&quot;Verified ID&quot; badge</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Verify your identity to build buyer trust. Not available yet.
        </p>
      </div>
      <span className="shrink-0 rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-500">
        Not verified
      </span>
    </div>
  );
}
