export function EmojiCard({
  emoji,
  title,
  children,
}: {
  emoji: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-md">
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-light text-lg">
          {emoji}
        </span>
        <h3 className="font-logo text-base font-bold text-neutral-800">{title}</h3>
      </div>
      <div className="mt-3 text-sm text-neutral-700">{children}</div>
    </div>
  );
}
