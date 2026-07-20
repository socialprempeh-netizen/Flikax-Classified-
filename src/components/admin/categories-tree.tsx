"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, ChevronUp, Pencil, Plus, Trash2 } from "lucide-react";
import { CATEGORY_ICON_MAP, CATEGORY_ICON_OPTIONS } from "@/lib/category-icons";
import {
  createCategoryAction,
  updateCategoryAction,
  reorderCategoryAction,
  deleteCategoryAction,
} from "@/app/admin/categories/actions";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { withAuthRetry } from "@/lib/auth-retry";

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  icon: string | null;
  display_order: number;
};

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

type FormTarget = { mode: "create"; parentId: string | null } | { mode: "edit"; category: AdminCategory };

export function CategoriesTree({
  parents,
  allCategories,
}: {
  parents: AdminCategory[];
  allCategories: AdminCategory[];
}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<Set<string>>(new Set(parents.map((p) => p.id)));
  const [formTarget, setFormTarget] = useState<FormTarget | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminCategory | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function run(action: () => Promise<void>, onDone?: () => void) {
    setError(null);
    startTransition(async () => {
      try {
        await withAuthRetry(action);
        onDone?.();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Action failed.");
      }
    });
  }

  function childrenOf(parentId: string) {
    return allCategories.filter((c) => c.parent_id === parentId);
  }

  function renderIcon(icon: string | null) {
    const Icon = (icon && CATEGORY_ICON_MAP[icon]) || null;
    return Icon ? <Icon className="size-4" /> : <span className="size-4" />;
  }

  return (
    <div>
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={() => setFormTarget({ mode: "create", parentId: null })}
        className="mb-3 flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white hover:bg-brand-dark"
      >
        <Plus className="size-4" />
        Add top-level category
      </button>

      <div className="divide-y divide-neutral-100 overflow-hidden rounded-2xl border-2 border-slate-strong bg-white">
        {parents.map((parent, index) => {
          const children = childrenOf(parent.id);
          const isOpen = expanded.has(parent.id);

          return (
            <div key={parent.id}>
              <div className="flex items-center gap-2 p-3">
                <button
                  type="button"
                  onClick={() => toggle(parent.id)}
                  className="flex size-7 shrink-0 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100"
                >
                  {isOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                </button>
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand">
                  {renderIcon(parent.icon)}
                </span>
                <span className="flex-1 text-sm font-bold text-neutral-800">{parent.name}</span>
                <span className="text-xs text-neutral-400">{children.length} sub</span>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    disabled={isPending || index === 0}
                    onClick={() => run(() => reorderCategoryAction(parent.id, "up"))}
                    className="flex size-7 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"
                  >
                    <ChevronUp className="size-4" />
                  </button>
                  <button
                    type="button"
                    disabled={isPending || index === parents.length - 1}
                    onClick={() => run(() => reorderCategoryAction(parent.id, "down"))}
                    className="flex size-7 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"
                  >
                    <ChevronDown className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormTarget({ mode: "create", parentId: parent.id })}
                    className="rounded-lg border-2 border-slate-strong px-2 py-1 text-xs font-bold text-neutral-700 hover:bg-neutral-50"
                  >
                    <Plus className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormTarget({ mode: "edit", category: parent })}
                    className="rounded-lg border-2 border-slate-strong px-2 py-1 text-xs font-bold text-neutral-700 hover:bg-neutral-50"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(parent)}
                    className="rounded-lg border border-red-200 px-2 py-1 text-xs font-bold text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>

              {isOpen && children.length > 0 && (
                <div className="divide-y divide-neutral-50 bg-neutral-50/50 pl-12">
                  {children.map((child, childIndex) => (
                    <div key={child.id} className="flex items-center gap-2 py-2 pr-3">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-white text-neutral-500">
                        {renderIcon(child.icon)}
                      </span>
                      <span className="flex-1 text-sm text-neutral-700">{child.name}</span>

                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          disabled={isPending || childIndex === 0}
                          onClick={() => run(() => reorderCategoryAction(child.id, "up"))}
                          className="flex size-6 items-center justify-center rounded-md text-neutral-500 hover:bg-white disabled:opacity-30"
                        >
                          <ChevronUp className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={isPending || childIndex === children.length - 1}
                          onClick={() => run(() => reorderCategoryAction(child.id, "down"))}
                          className="flex size-6 items-center justify-center rounded-md text-neutral-500 hover:bg-white disabled:opacity-30"
                        >
                          <ChevronDown className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormTarget({ mode: "edit", category: child })}
                          className="rounded-lg border-2 border-slate-strong px-2 py-1 text-xs font-bold text-neutral-700 hover:bg-white"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(child)}
                          className="rounded-lg border border-red-200 px-2 py-1 text-xs font-bold text-red-600 hover:bg-white"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {formTarget && (
        <CategoryFormModal
          target={formTarget}
          parents={parents}
          pending={isPending}
          onCancel={() => setFormTarget(null)}
          onSubmit={(input) => {
            if (formTarget.mode === "create") {
              run(() => createCategoryAction({ ...input, parentId: formTarget.parentId }), () => setFormTarget(null));
            } else {
              run(() => updateCategoryAction(formTarget.category.id, input), () => setFormTarget(null));
            }
          }}
        />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title={`Delete "${deleteTarget?.name}"?`}
        message="This can't be undone. Blocked automatically if listings or subcategories still use it."
        confirmLabel="Delete"
        pending={isPending}
        onConfirm={() => deleteTarget && run(() => deleteCategoryAction(deleteTarget.id), () => setDeleteTarget(null))}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function CategoryFormModal({
  target,
  parents,
  pending,
  onCancel,
  onSubmit,
}: {
  target: FormTarget;
  parents: AdminCategory[];
  pending: boolean;
  onCancel: () => void;
  onSubmit: (input: { name: string; slug: string; icon: string | null; parentId: string | null }) => void;
}) {
  const editing = target.mode === "edit" ? target.category : null;
  const [name, setName] = useState(editing?.name ?? "");
  const [slug, setSlug] = useState(editing?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(editing));
  const [icon, setIcon] = useState<string | null>(editing?.icon ?? null);
  const [parentId, setParentId] = useState<string | null>(
    editing ? editing.parent_id : target.mode === "create" ? target.parentId : null
  );

  const isTopLevelForm = target.mode === "create" ? target.parentId === null : editing?.parent_id === null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-neutral-900/70 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <h2 className="text-base font-bold text-neutral-800">
          {target.mode === "create" ? "Add category" : "Edit category"}
        </h2>

        <label className="mt-4 block">
          <span className="mb-1 block text-sm font-medium text-neutral-700">Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            className="w-full rounded-lg border-2 border-slate-strong px-3 py-2 text-sm text-neutral-800 outline-none focus:border-brand"
          />
        </label>

        <label className="mt-3 block">
          <span className="mb-1 block text-sm font-medium text-neutral-700">Slug</span>
          <input
            type="text"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
            className="w-full rounded-lg border-2 border-slate-strong px-3 py-2 text-sm text-neutral-800 outline-none focus:border-brand"
          />
        </label>

        {!isTopLevelForm && (
          <label className="mt-3 block">
            <span className="mb-1 block text-sm font-medium text-neutral-700">Parent category</span>
            <select
              value={parentId ?? ""}
              onChange={(e) => setParentId(e.target.value || null)}
              className="w-full rounded-lg border-2 border-slate-strong px-3 py-2 text-sm text-neutral-800 outline-none focus:border-brand"
            >
              {parents
                .filter((p) => p.id !== editing?.id)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </select>
          </label>
        )}

        <div className="mt-3">
          <span className="mb-1 block text-sm font-medium text-neutral-700">Icon</span>
          <div className="grid grid-cols-8 gap-1.5">
            {CATEGORY_ICON_OPTIONS.map(({ name: iconName, Icon }) => (
              <button
                key={iconName}
                type="button"
                onClick={() => setIcon(iconName)}
                className={`flex size-8 items-center justify-center rounded-lg border-2 ${
                  icon === iconName ? "border-brand bg-brand-light text-brand" : "border-slate-strong text-neutral-500 hover:bg-neutral-50"
                }`}
              >
                <Icon className="size-4" />
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="rounded-lg border-2 border-slate-strong px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={pending || !name.trim() || !slug.trim()}
            onClick={() => onSubmit({ name: name.trim(), slug: slug.trim(), icon, parentId: isTopLevelForm ? null : parentId })}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white hover:bg-brand-dark disabled:opacity-60"
          >
            {pending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
