import { Phone } from "lucide-react";
import { GoogleIcon, FacebookIcon } from "@/components/icons/social-icons";

function ToggleDot({ on }: { on: boolean }) {
  return (
    <span
      className={`flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors ${
        on ? "bg-brand" : "bg-neutral-200"
      }`}
    >
      <span className={`size-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : ""}`} />
    </span>
  );
}

export function ConnectedAccounts({ connectedGoogle }: { connectedGoogle: boolean }) {
  const rows = [
    { key: "truecaller", label: "Truecaller", icon: Phone, connected: false, available: false },
    { key: "google", label: "Google", icon: GoogleIcon, connected: connectedGoogle, available: true },
    { key: "facebook", label: "Facebook", icon: FacebookIcon, connected: false, available: false },
  ];

  return (
    <div className="space-y-3 rounded-2xl bg-white p-5 shadow-md">
      <div className="flex items-center gap-3 rounded-xl bg-brand-light p-3">
        <span className="text-lg">🤝</span>
        <p className="text-sm text-neutral-700">Connect your social media accounts for a smoother experience!</p>
      </div>

      {rows.map((row) => (
        <div key={row.key} className="flex items-center justify-between py-1">
          <div className="flex items-center gap-3">
            <row.icon className="size-5 text-neutral-500" />
            <span className={`text-sm font-medium ${row.connected ? "text-green-700" : "text-neutral-700"}`}>
              {row.label}
            </span>
          </div>
          {row.available ? (
            <ToggleDot on={row.connected} />
          ) : (
            <span
              title="Not available yet"
              className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-400"
            >
              Coming soon
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
