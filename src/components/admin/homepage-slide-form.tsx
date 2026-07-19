"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Upload } from "lucide-react";
import {
  createSlideAction,
  updateSlideAction,
  type SlideFormInput,
} from "@/app/admin/homepage-slider/actions";
import type { HomepageSlide } from "@/lib/homepage-slides";

const FIELD_CLASS =
  "w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-brand";

// Slots straight into a datetime-local input, which needs "YYYY-MM-DDTHH:mm" -- an
// ISO timestamp's trailing "Z"/offset and seconds aren't valid there.
function toDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 16);
}

function slideToForm(slide: HomepageSlide | null): SlideFormInput {
  if (!slide) {
    return { image_path: "", headline: "", link_url: "", is_active: true, starts_at: "", ends_at: "" };
  }
  return {
    image_path: slide.image_path,
    headline: slide.headline ?? "",
    link_url: slide.link_url ?? "",
    is_active: slide.is_active,
    starts_at: toDatetimeLocal(slide.starts_at),
    ends_at: toDatetimeLocal(slide.ends_at),
  };
}

export function HomepageSlideForm({
  editingSlide,
  onSaved,
  onCancelEdit,
}: {
  editingSlide: HomepageSlide | null;
  onSaved: (slide: HomepageSlide) => void;
  onCancelEdit: () => void;
}) {
  const [form, setForm] = useState<SlideFormInput>(() => slideToForm(editingSlide));
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setPreviewUrl(URL.createObjectURL(file));
    setIsUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/homepage-slides/upload", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed");
      setForm((f) => ({ ...f, image_path: json.path }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.image_path) {
      setError("Upload a banner image first.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const saved = editingSlide
          ? await updateSlideAction(editingSlide.id, form)
          : await createSlideAction(form);
        onSaved(saved);
        if (!editingSlide) {
          setForm(slideToForm(null));
          setPreviewUrl(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save slide.");
      }
    });
  }

  const imageToShow =
    previewUrl ??
    (form.image_path
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/homepage-slides/${form.image_path}`
      : null);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <span className="mb-1 block text-xs font-medium text-neutral-600">
          Banner image (auto-cropped to 1600×480)
        </span>
        <div className="flex items-center gap-4">
          <div className="relative flex h-24 w-40 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-neutral-300 bg-neutral-50">
            {imageToShow ? (
              // eslint-disable-next-line @next/next/no-img-element -- local blob preview / already-optimized storage image, not worth next/image here
              <img src={imageToShow} alt="" className="size-full object-cover" />
            ) : (
              <Upload className="size-5 text-neutral-300" />
            )}
          </div>
          <label className="cursor-pointer rounded-lg border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
            {isUploading ? "Uploading..." : "Choose image"}
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileSelect} className="hidden" />
          </label>
        </div>
      </div>

      <label className="block">
        <span className="mb-1 block text-xs font-medium text-neutral-600">Headline (optional)</span>
        <input
          type="text"
          value={form.headline}
          onChange={(e) => setForm((f) => ({ ...f, headline: e.target.value }))}
          className={FIELD_CLASS}
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-medium text-neutral-600">Link URL (optional)</span>
        <input
          type="text"
          placeholder="/premium or https://..."
          value={form.link_url}
          onChange={(e) => setForm((f) => ({ ...f, link_url: e.target.value }))}
          className={FIELD_CLASS}
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-neutral-600">Starts (optional)</span>
          <input
            type="datetime-local"
            value={form.starts_at}
            onChange={(e) => setForm((f) => ({ ...f, starts_at: e.target.value }))}
            className={FIELD_CLASS}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-neutral-600">Ends (optional)</span>
          <input
            type="datetime-local"
            value={form.ends_at}
            onChange={(e) => setForm((f) => ({ ...f, ends_at: e.target.value }))}
            className={FIELD_CLASS}
          />
        </label>
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={form.is_active}
          onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
          className="size-4 rounded border-neutral-300 text-brand focus:ring-brand"
        />
        <span className="text-sm font-medium text-neutral-700">Active</span>
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending || isUploading}
          className="rounded-lg bg-brand px-4 py-1.5 text-sm font-bold text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {isPending ? "Saving..." : editingSlide ? "Save changes" : "Add slide"}
        </button>
        {editingSlide && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="rounded-lg border border-neutral-200 px-4 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
