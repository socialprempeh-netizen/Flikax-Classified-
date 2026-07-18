import {
  Mail,
  UserCog,
  KeyRound,
  ShieldAlert,
  CreditCard,
  Gem,
  Wrench,
  HelpCircle,
  Flag,
  type LucideIcon,
} from "lucide-react";
import { getUser } from "@/lib/supabase/server";
import { getSiteSetting } from "@/lib/site-settings";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SupportCta, SUPPORT_EMAIL } from "@/components/cta/support-cta";
import { SupportTicketForm } from "@/components/contact/support-ticket-form";

const HELP_TOPICS: { icon: LucideIcon; label: string }[] = [
  { icon: UserCog, label: "Account issues" },
  { icon: KeyRound, label: "Login & password assistance" },
  { icon: ShieldAlert, label: "Reporting scams or suspicious listings" },
  { icon: CreditCard, label: "Payment enquiries" },
  { icon: Gem, label: "Premium listings" },
  { icon: Wrench, label: "Technical issues" },
  { icon: HelpCircle, label: "General questions and feedback" },
];

export default async function ContactPage() {
  const [{ data: { user } }, supportEmailSetting] = await Promise.all([getUser(), getSiteSetting("support_email")]);
  const supportEmail = supportEmailSetting ?? SUPPORT_EMAIL;

  return (
    <div className="flex flex-1 flex-col bg-neutral-50">
      <SiteHeader />

      <main className="mx-auto w-full max-w-2xl flex-1 space-y-10 px-4 py-12 sm:px-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="font-logo text-3xl font-bold text-neutral-800">Need help? We&apos;re here for you.</h1>
          <p className="mx-auto mt-3 max-w-lg text-neutral-600">
            Whether you have a question, need support, want to report a listing, or have feedback, we&apos;d
            love to hear from you.
          </p>
        </div>

        <SupportTicketForm defaultEmail={user?.email} />

        {/* Customer Support */}
        <section className="rounded-2xl bg-white p-6 shadow-md sm:p-8">
          <div className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand">
              <Mail className="size-5" />
            </span>
            <h2 className="font-logo text-xl font-bold text-neutral-800">Customer Support</h2>
          </div>
          <p className="mt-4 text-sm text-neutral-500">Email us anytime at</p>
          <a href={`mailto:${supportEmail}`} className="text-base font-semibold text-brand hover:underline">
            {supportEmail}
          </a>
          <div className="mt-5">
            <SupportCta subject="Support request" />
          </div>
        </section>

        {/* We Can Help With */}
        <section>
          <h2 className="font-logo text-xl font-bold text-neutral-800">We Can Help With</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {HELP_TOPICS.map((topic) => (
              <div key={topic.label} className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-md">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand">
                  <topic.icon className="size-4" />
                </span>
                <span className="text-sm font-medium text-neutral-700">{topic.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Report a Listing */}
        <section className="rounded-2xl bg-amber-50 p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <Flag className="size-5" />
            </span>
            <h2 className="font-logo text-xl font-bold text-neutral-800">Report a Listing</h2>
          </div>
          <p className="mt-4 text-sm text-neutral-700">
            If you come across a listing or user that violates our policies, please report it through the
            platform or email us with the listing details.
          </p>
          <div className="mt-5">
            <SupportCta label="Report a Listing" subject="Reporting a listing" />
          </div>
        </section>

        {/* Business Enquiries */}
        <section className="rounded-2xl bg-white p-6 shadow-md sm:p-8">
          <h2 className="font-logo text-xl font-bold text-neutral-800">Business Enquiries</h2>
          <p className="mt-3 text-sm text-neutral-700">
            For partnerships, advertising, or media enquiries, contact:
          </p>
          <a href={`mailto:${supportEmail}`} className="mt-1 block text-base font-semibold text-brand hover:underline">
            {supportEmail}
          </a>
          <div className="mt-5">
            <SupportCta label="Contact Business Team" subject="Business enquiry" />
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
