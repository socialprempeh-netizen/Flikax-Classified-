import { ChevronDown } from "lucide-react";

export type TocItem = { id: string; title: string };

function TocNav({ toc }: { toc: TocItem[] }) {
  return (
    <ul className="space-y-1">
      {toc.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            className="block rounded-lg px-3 py-1.5 text-sm text-neutral-600 hover:bg-brand-light hover:text-brand"
          >
            {item.title}
          </a>
        </li>
      ))}
    </ul>
  );
}

// Shared "long-form info page" shell: sticky sidebar TOC on desktop, a
// collapsible <details> TOC on mobile. Used by /terms and /trust-safety (and
// any future footer info page — FAQ, Contact Us, etc.) so the TOC pattern
// only has to be built and fixed once.
export function TocLayout({ toc, children }: { toc: TocItem[]; children: React.ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-4 py-10 sm:flex-row sm:px-6">
      <details className="mb-6 h-fit rounded-2xl bg-white p-4 shadow-md sm:hidden">
        <summary className="flex cursor-pointer items-center justify-between text-sm font-bold text-neutral-800">
          Table of Contents
          <ChevronDown className="size-4" />
        </summary>
        <div className="mt-3 border-t border-neutral-100 pt-3">
          <TocNav toc={toc} />
        </div>
      </details>

      <aside className="hidden w-64 shrink-0 sm:block">
        <div className="sticky top-24 rounded-2xl bg-white p-4 shadow-md">
          <h2 className="mb-2 px-3 text-sm font-bold text-neutral-800">Table of Contents</h2>
          <TocNav toc={toc} />
        </div>
      </aside>

      <article className="min-w-0 max-w-3xl flex-1">{children}</article>
    </main>
  );
}
