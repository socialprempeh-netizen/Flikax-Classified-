"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, ImagePlus, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { GHANA_REGIONS, GHANA_ALL_DISTRICTS } from "@/lib/locations";
import { getFieldsForCategory } from "@/lib/listing-fields";
import { toGhanaE164, toGhanaLocal } from "@/lib/phone";
import { VehicleSpecFields } from "@/components/listings/vehicle-spec-fields";

// Rendered via the dedicated cascading VehicleSpecFields component instead of
// the generic field loop below when the category is Vehicles.
const VEHICLE_CASCADE_KEYS = ["make", "model", "year", "trim"];

type Category = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
};

type ImageSlot = {
  id: string;
  previewUrl: string;
  status: "uploading" | "done" | "error";
  path?: string;
  error?: string;
  isExisting?: boolean;
};

export type ExistingListing = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  location: string;
  negotiable: string | null;
  category_id: string;
  attributes: Record<string, string>;
  video_url: string | null;
  contact_phone: string | null;
  images: { id: string; storage_path: string; url: string }[];
};

const MAX_IMAGES = 16;
const NEGOTIABLE_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "not_sure", label: "Not sure" },
];

export function ListingForm({
  categories,
  existingListing,
  posterName,
  defaultContactPhone,
}: {
  categories: Category[];
  existingListing?: ExistingListing;
  posterName?: string | null;
  defaultContactPhone?: string | null;
}) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const isEditing = Boolean(existingListing);

  const parentCategories = categories.filter((c) => c.parent_id === null);
  const initialCategory = existingListing
    ? categories.find((c) => c.id === existingListing.category_id)
    : undefined;

  const [step, setStep] = useState<1 | 2>(1);
  const [parentId, setParentId] = useState(initialCategory?.parent_id ?? "");
  const [categoryId, setCategoryId] = useState(existingListing?.category_id ?? "");
  const [attributes, setAttributes] = useState<Record<string, string>>(
    existingListing?.attributes ?? {}
  );
  const [description, setDescription] = useState(existingListing?.description ?? "");
  const [price, setPrice] = useState(existingListing ? String(existingListing.price) : "");
  const [negotiable, setNegotiable] = useState(existingListing?.negotiable ?? "not_sure");
  const [contactPhoneRaw, setContactPhoneRaw] = useState(
    toGhanaLocal(existingListing?.contact_phone ?? defaultContactPhone)
  );

  const [title, setTitle] = useState(existingListing?.title ?? "");
  const [location, setLocation] = useState(existingListing?.location ?? GHANA_ALL_DISTRICTS[0].name);
  const [videoUrl, setVideoUrl] = useState(existingListing?.video_url ?? "");
  const [images, setImages] = useState<ImageSlot[]>(
    existingListing?.images.map((img) => ({
      id: img.id,
      previewUrl: img.url,
      status: "done" as const,
      path: img.storage_path,
      isExisting: true,
    })) ?? []
  );
  const [removedExistingIds, setRemovedExistingIds] = useState<string[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posted, setPosted] = useState(false);

  const childCategories = categories.filter((c) => c.parent_id === parentId);
  const parentCategory = categories.find((c) => c.id === parentId);
  const selectedCategory = categories.find((c) => c.id === categoryId);
  const isVehicles = parentCategory?.slug === "vehicles";
  const dynamicFields = useMemo(
    () => getFieldsForCategory(parentCategory?.slug),
    [parentCategory]
  );
  const genericFields = isVehicles
    ? dynamicFields.filter((field) => !VEHICLE_CASCADE_KEYS.includes(field.key))
    : dynamicFields;

  function setAttribute(key: string, value: string) {
    setAttributes((prev) => ({ ...prev, [key]: value }));
  }

  async function uploadOne(file: File, accessToken: string | undefined) {
    // A short retry backstops plain network blips; it's not load-bearing for
    // auth anymore now that every file in the batch reuses the one token
    // fetched up front in handleFiles (see comment there).
    const MAX_ATTEMPTS = 2;
    let lastBody: { error?: string } = {};
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/listings/images", {
        method: "POST",
        body: formData,
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      });
      const body = await res.json();
      if (res.ok) return { ok: true as const, body };
      lastBody = body;
      if (res.status !== 401 || attempt === MAX_ATTEMPTS) break;
      await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
    }
    return { ok: false as const, body: lastBody };
  }

  async function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    const files = Array.from(fileList).slice(0, MAX_IMAGES - images.length);

    // Fetch the access token once for the whole batch rather than letting
    // each of the (possibly 16) individual upload requests independently
    // decide whether its cookie-based session needs refreshing. With that
    // many requests firing in quick succession, those independent refresh
    // decisions raced each other (and Supabase's own refresh-token rate
    // limit) badly enough that some uploads failed with "Not authenticated"
    // in the middle of an otherwise-successful batch — reproduced live with
    // 13-photo batches even on a correctly-synced clock. getSession() here
    // refreshes at most once, through the single browser client instance,
    // and every upload below reuses that same already-valid token.
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const accessToken = session?.access_token;

    for (const file of files) {
      const id = crypto.randomUUID();
      const previewUrl = URL.createObjectURL(file);
      setImages((prev) => [...prev, { id, previewUrl, status: "uploading" }]);

      try {
        const result = await uploadOne(file, accessToken);

        if (!result.ok) {
          setImages((prev) =>
            prev.map((img) => (img.id === id ? { ...img, status: "error", error: result.body.error } : img))
          );
          continue;
        }

        setImages((prev) =>
          prev.map((img) => (img.id === id ? { ...img, status: "done", path: result.body.path } : img))
        );
      } catch {
        setImages((prev) =>
          prev.map((img) =>
            img.id === id ? { ...img, status: "error", error: "Upload failed" } : img
          )
        );
      }
    }
  }

  function removeImage(id: string) {
    setImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target?.isExisting) {
        setRemovedExistingIds((ids) => [...ids, id]);
      }
      return prev.filter((img) => img.id !== id);
    });
  }

  function handleNext(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!categoryId) {
      setError("Choose a category and subcategory.");
      return;
    }
    for (const field of dynamicFields) {
      if (field.required && !attributes[field.key]?.trim()) {
        setError(`${field.label} is required.`);
        return;
      }
    }
    const priceValue = Number(price);
    if (!Number.isFinite(priceValue) || priceValue < 0) {
      setError("Enter a valid price.");
      return;
    }
    if (!toGhanaE164(contactPhoneRaw)) {
      setError("Enter a valid Ghana contact phone number, e.g. 024 123 4567.");
      return;
    }

    setError(null);
    setStep(2);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const uploadedImages = images.filter((img) => img.status === "done" && img.path);
    if (uploadedImages.length === 0) {
      setError("Add at least one photo.");
      return;
    }
    if (!title.trim()) {
      setError("Enter a title.");
      return;
    }

    setSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSubmitting(false);
      router.push("/auth/login");
      return;
    }

    const payload = {
      user_id: user.id,
      category_id: categoryId,
      title: title.trim(),
      description: description.trim() || null,
      price: Number(price),
      location,
      negotiable,
      attributes,
      video_url: videoUrl.trim() || null,
      contact_phone: toGhanaE164(contactPhoneRaw),
    };

    let listingId = existingListing?.id;

    if (isEditing && listingId) {
      const { error: updateError } = await supabase
        .from("listings")
        .update(payload)
        .eq("id", listingId);

      if (updateError) {
        setSubmitting(false);
        setError(updateError.message);
        return;
      }

      if (removedExistingIds.length > 0) {
        await supabase.from("listing_images").delete().in("id", removedExistingIds);
      }

      const newImages = uploadedImages.filter((img) => !img.isExisting);
      const existingCount = uploadedImages.length - newImages.length;

      if (newImages.length > 0) {
        const { error: imagesError } = await supabase.from("listing_images").insert(
          newImages.map((img, index) => ({
            listing_id: listingId!,
            storage_path: img.path!,
            position: existingCount + index,
          }))
        );
        if (imagesError) {
          setSubmitting(false);
          setError(imagesError.message);
          return;
        }
      }
    } else {
      const { data: listing, error: listingError } = await supabase
        .from("listings")
        .insert(payload)
        .select()
        .single();

      if (listingError || !listing) {
        setSubmitting(false);
        setError(listingError?.message ?? "Could not create listing.");
        return;
      }
      listingId = listing.id;

      const { error: imagesError } = await supabase.from("listing_images").insert(
        uploadedImages.map((img, index) => ({
          listing_id: listingId!,
          storage_path: img.path!,
          position: index,
        }))
      );

      if (imagesError) {
        setSubmitting(false);
        setError(imagesError.message);
        return;
      }
    }

    setSubmitting(false);
    setPosted(true);
  }

  if (posted) {
    return (
      <div className="rounded-2xl border border-neutral-100 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold text-neutral-800">
          {isEditing ? "Listing updated!" : "Listing posted!"}
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          {isEditing ? "Your changes have been saved." : "Your listing is live on the homepage."}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-full bg-brand px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-dark"
          >
            View my adverts
          </Link>
          <Link
            href="/"
            className="rounded-full border border-neutral-200 px-6 py-2.5 text-sm font-bold text-neutral-700 hover:border-brand hover:text-brand"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-neutral-500">Step {step} of 2</p>

      {step === 1 && (
        <form
          onSubmit={handleNext}
          className="space-y-6 rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm"
        >
          <div>
            <h1 className="text-xl font-bold text-neutral-800">
              {isEditing ? "Edit listing" : "Post a listing"}
            </h1>
            <p className="mt-1 text-sm text-neutral-500">Tell us what you&apos;re selling.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-neutral-700">Category</span>
              <select
                required
                value={parentId}
                onChange={(e) => {
                  setParentId(e.target.value);
                  setCategoryId("");
                  setAttributes({});
                }}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-brand"
              >
                <option value="" disabled>
                  Select category
                </option>
                {parentCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-neutral-700">Subcategory</span>
              <select
                required
                disabled={!parentId}
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-brand disabled:bg-neutral-50"
              >
                <option value="" disabled>
                  {parentId ? "Select subcategory" : "Choose category first"}
                </option>
                {childCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {isVehicles && categoryId && (
            <VehicleSpecFields attributes={attributes} setAttribute={setAttribute} />
          )}

          {genericFields.length > 0 && categoryId && (
            <div className="grid grid-cols-2 gap-4">
              {genericFields.map((field) => (
                <label
                  key={field.key}
                  className={field.type === "boolean" ? "flex items-center gap-2 pt-6" : "block"}
                >
                  {field.type !== "boolean" && (
                    <span className="mb-1 block text-sm font-medium text-neutral-700">
                      {field.label}
                      {field.required && "*"}
                    </span>
                  )}
                  {field.type === "text" && (
                    <input
                      type="text"
                      required={field.required}
                      value={attributes[field.key] ?? ""}
                      onChange={(e) => setAttribute(field.key, e.target.value)}
                      className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-brand"
                    />
                  )}
                  {field.type === "number" && (
                    <input
                      type="number"
                      required={field.required}
                      value={attributes[field.key] ?? ""}
                      onChange={(e) => setAttribute(field.key, e.target.value)}
                      className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-brand"
                    />
                  )}
                  {field.type === "select" && (
                    <select
                      required={field.required}
                      value={attributes[field.key] ?? ""}
                      onChange={(e) => setAttribute(field.key, e.target.value)}
                      className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-brand"
                    >
                      <option value="" disabled>
                        Select {field.label.toLowerCase()}
                      </option>
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  )}
                  {field.type === "boolean" && (
                    <>
                      <input
                        type="checkbox"
                        checked={attributes[field.key] === "yes"}
                        onChange={(e) => setAttribute(field.key, e.target.checked ? "yes" : "no")}
                        className="size-4 accent-brand"
                      />
                      <span className="text-sm font-medium text-neutral-700">{field.label}</span>
                    </>
                  )}
                </label>
              ))}
            </div>
          )}

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-700">Description</span>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Condition, features, reason for selling..."
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-brand"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-700">Price (GHS)</span>
            <input
              type="number"
              min={0}
              step="0.01"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-brand"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-700">
              Contact phone number*
            </span>
            <div className="flex items-center rounded-lg border border-neutral-200 focus-within:border-brand">
              <span className="border-r border-neutral-200 px-3 py-2 text-sm text-neutral-500">
                +233
              </span>
              <input
                type="tel"
                inputMode="tel"
                required
                value={contactPhoneRaw}
                onChange={(e) => setContactPhoneRaw(e.target.value)}
                placeholder="024 123 4567"
                className="min-w-0 flex-1 rounded-r-lg px-3 py-2 text-sm text-neutral-800 outline-none"
              />
            </div>
            <span className="mt-1 block text-xs text-neutral-400">
              Buyers will see this number when they tap &quot;Contact Seller.&quot; It can be
              different from your account phone.
            </span>
          </label>

          <div>
            <span className="mb-1 block text-sm font-medium text-neutral-700">
              Are you open to negotiation?
            </span>
            <div className="flex gap-4 text-sm text-neutral-700">
              {NEGOTIABLE_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-center gap-1.5">
                  <input
                    type="radio"
                    name="negotiable"
                    value={opt.value}
                    checked={negotiable === opt.value}
                    onChange={(e) => setNegotiable(e.target.value)}
                    className="accent-brand"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          {posterName && (
            <p className="rounded-lg bg-neutral-50 px-3 py-2 text-sm text-neutral-500">
              Posting as <span className="font-medium text-neutral-700">{posterName}</span>. Your
              phone number stays hidden until a buyer starts a chat.
            </p>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-lg bg-brand py-2.5 text-sm font-bold text-white hover:bg-brand-dark"
          >
            Next
          </button>
        </form>
      )}

      {step === 2 && (
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm"
        >
          <div>
            <h1 className="text-xl font-bold text-neutral-800">
              {isEditing ? "Edit listing" : "Post a listing"}
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              Every photo is automatically watermarked with the Flikax logo.
            </p>
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-700">Title</span>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. iPhone 13 Pro, 256GB"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-brand"
            />
          </label>

          <div>
            <span className="mb-1 block text-sm font-medium text-neutral-700">Category</span>
            <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
              <span>
                {parentCategory?.name}
                {selectedCategory ? ` / ${selectedCategory.name}` : ""}
              </span>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm font-medium text-brand hover:underline"
              >
                Change
              </button>
            </div>
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-700">Location</span>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-brand"
            >
              {GHANA_REGIONS.map((region) => (
                <optgroup key={region.slug} label={region.name}>
                  {region.districts.map((district) => (
                    <option key={district.slug} value={district.name}>
                      {district.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>

          <div>
            <span className="mb-2 block text-sm font-medium text-neutral-700">
              Photos ({images.length}/{MAX_IMAGES})
            </span>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="relative aspect-square overflow-hidden rounded-lg border border-neutral-200"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.previewUrl} alt="" className="size-full object-cover" />
                  {img.status === "uploading" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Loader2 className="size-5 animate-spin text-white" />
                    </div>
                  )}
                  {img.status === "error" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-red-600/70 p-1 text-center text-[10px] text-white">
                      {img.error ?? "Failed"}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    aria-label="Remove photo"
                    className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}

              {images.length < MAX_IMAGES && (
                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-neutral-300 text-neutral-400 hover:border-brand hover:text-brand">
                  <ImagePlus className="size-5" />
                  <span className="text-xs">Add photo</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                  />
                </label>
              )}
            </div>
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-700">
              Link to video (optional)
            </span>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/..."
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-brand"
            />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-brand py-2.5 text-sm font-bold text-white hover:bg-brand-dark disabled:opacity-60"
          >
            {submitting ? "Saving..." : isEditing ? "Save changes" : "Post ad"}
          </button>
        </form>
      )}
    </div>
  );
}
