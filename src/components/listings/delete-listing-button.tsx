"use client";

export function DeleteListingButton() {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!confirm("Delete this listing? This can't be undone.")) {
          e.preventDefault();
        }
      }}
      className="text-sm font-medium text-red-600 hover:underline"
    >
      Delete
    </button>
  );
}
