import Image from "next/image";
import { resolveCategoryImage } from "@/lib/category-images";
import { resolveCategoryIcon } from "@/lib/category-icons";
import { getCategoryColorClasses } from "@/lib/category-colors";

type CategoryLike = { slug: string; parent_id: string | null; icon?: string | null; name: string };

/** Real photo when one exists for this category/subcategory; otherwise the
 * icon+color chip it replaces. Used everywhere a category renders so every
 * surface stays in sync automatically as the image set grows. */
export function CategoryThumb({
  category,
  size,
  iconSize,
  rounded = "rounded-lg",
  sizes,
  className = "",
  eager = false,
}: {
  category: CategoryLike;
  size: string;
  iconSize: string;
  rounded?: string;
  sizes: string;
  className?: string;
  /** Chromium's native loading="lazy" unreliably detects visibility for images
   * inside an overflow-x-auto row, leaving some in-viewport thumbnails stuck
   * unloaded. Set this for horizontally-scrolling strips (few, small images
   * where eager-loading all of them is cheap) to bypass that heuristic. */
  eager?: boolean;
}) {
  const imagePath = resolveCategoryImage(category);

  if (imagePath) {
    return (
      <span className={`relative ${size} shrink-0 overflow-hidden ${rounded} ${className}`}>
        <Image
          src={imagePath}
          alt={category.name}
          fill
          sizes={sizes}
          loading={eager ? "eager" : "lazy"}
          className="object-cover"
        />
      </span>
    );
  }

  const Icon = resolveCategoryIcon(category);
  return (
    <span
      className={`flex ${size} shrink-0 items-center justify-center ${rounded} ${getCategoryColorClasses(category)} ${className}`}
    >
      <Icon className={iconSize} />
    </span>
  );
}
