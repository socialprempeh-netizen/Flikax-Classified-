import { Wrench } from "lucide-react";

export default function MaintenancePage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center bg-neutral-50 px-4 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-brand-light text-brand">
        <Wrench className="size-8" />
      </span>
      <h1 className="mt-6 font-logo text-2xl font-bold text-neutral-800">We&apos;ll be right back</h1>
      <p className="mt-2 max-w-md text-sm text-neutral-600">
        Flikax is undergoing scheduled maintenance. We won&apos;t be long — check back shortly.
      </p>
    </div>
  );
}
