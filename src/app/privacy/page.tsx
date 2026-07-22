import { Lock } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { TocLayout } from "@/components/legal/toc-layout";

const TOC = [
  { id: "introduction", title: "1. Introduction" },
  { id: "who-we-are", title: "2. Who We Are" },
  { id: "information-we-collect", title: "3. Information We Collect" },
  { id: "how-we-use-your-information", title: "4. How We Use Your Information" },
  { id: "legal-basis-for-processing", title: "5. Legal Basis for Processing" },
  { id: "who-we-share-your-data-with", title: "6. Who We Share Your Data With" },
  { id: "data-retention", title: "7. Data Retention" },
  { id: "your-privacy-rights", title: "8. Your Privacy Rights" },
  { id: "international-data-transfers", title: "9. International Data Transfers" },
  { id: "childrens-privacy", title: "10. Children's Privacy" },
  { id: "data-security", title: "11. Data Security" },
  { id: "changes-to-this-privacy-policy", title: "12. Changes to This Privacy Policy" },
  { id: "contact-us", title: "13. Contact Us" },
];

export default async function PrivacyPolicyPage() {
  return (
    <div className="flex flex-1 flex-col bg-background">
      <SiteHeader />

      <TocLayout toc={TOC}>
        <div className="mb-8 flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand">
            <Lock className="size-5" />
          </span>
          <div>
            <h1 className="font-logo text-3xl font-bold text-neutral-800">Privacy Policy</h1>
            <p className="text-sm text-neutral-500">Effective Date: 20th August, 2026</p>
          </div>
        </div>

        <div className="space-y-10 rounded-2xl bg-white p-6 shadow-md sm:p-8">
          <section id="introduction" className="scroll-mt-24">
            <h2 className="font-logo text-xl font-bold text-neutral-800">1. Introduction</h2>
            <p className="mt-3 text-neutral-700">
              Flikax (&quot;we,&quot; &quot;us,&quot; &quot;our&quot;) operates the Flikax website, mobile
              applications, and related services (the &quot;Platform&quot;). This Privacy Policy explains
              what personal data we collect when you use Flikax, how we use it, and how we protect it.
            </p>
            <p className="mt-3 text-neutral-700">
              By creating an account or otherwise using Flikax, you agree to the collection and use of
              information as described in this Privacy Policy. If you do not agree, please do not use the
              Platform.
            </p>
          </section>

          <section id="who-we-are" className="scroll-mt-24">
            <h2 className="font-logo text-xl font-bold text-neutral-800">2. Who We Are</h2>
            <p className="mt-3 text-neutral-700">Flikax is the data controller responsible for your personal data.</p>
            <dl className="mt-3 space-y-1 text-neutral-700">
              <div className="flex gap-2">
                <dt className="font-semibold">Company:</dt>
                <dd>Flikax</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-semibold">Address:</dt>
                <dd>Tema, Accra - Ghana</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-semibold">Support Email:</dt>
                <dd>
                  <a href="mailto:flikaxsupport@gmail.com" className="text-brand hover:underline">
                    flikaxsupport@gmail.com
                  </a>
                </dd>
              </div>
            </dl>
          </section>

          <section id="information-we-collect" className="scroll-mt-24">
            <h2 className="font-logo text-xl font-bold text-neutral-800">3. Information We Collect</h2>

            <h3 className="font-logo mt-5 text-base font-bold text-neutral-800">
              3.1 Information You Provide Directly
            </h3>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-neutral-700">
              <li>
                <span className="font-semibold">Account Information:</span> name, phone number, email
                address, and password (if you sign up with email/password), or basic profile information
                from Google if you sign in with Google.
              </li>
              <li>
                <span className="font-semibold">Listings:</span> photos, title, description, price,
                category, and location for any item or service you post. Photos are automatically
                watermarked with the Flikax logo when uploaded.
              </li>
              <li>
                <span className="font-semibold">Messages:</span> content of messages you send through Flikax
                Chat to other users regarding a listing.
              </li>
              <li>
                <span className="font-semibold">Payment-Related Information:</span> if you purchase a
                premium plan (featured listing, bump, or subscription), your payment is processed by
                Paystack or Flutterwave. We do not collect or store your full card number — we receive
                limited transaction details (amount, status, date) from these providers to confirm your
                purchase.
              </li>
              <li>
                <span className="font-semibold">Support Requests:</span> any information you submit through
                our Contact Us form or in communication with our support team.
              </li>
            </ul>

            <h3 className="font-logo mt-5 text-base font-bold text-neutral-800">
              3.2 Information Collected Automatically
            </h3>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-neutral-700">
              <li>
                <span className="font-semibold">Usage Data:</span> pages you visit, listings you view or
                save, and general activity on the Platform, used to keep the Service working properly and to
                improve it.
              </li>
              <li>
                <span className="font-semibold">Device and Log Data:</span> IP address, browser type, and
                similar technical information, collected as part of normal website operation and security
                monitoring.
              </li>
              <li>
                <span className="font-semibold">Cookies and Session Data:</span> we use cookies and similar
                technologies strictly necessary to keep you logged in and to operate core Platform features
                (such as your authentication session). We do not currently use cookies for third-party
                advertising or ad personalization.
              </li>
            </ul>

            <h3 className="font-logo mt-5 text-base font-bold text-neutral-800">
              3.3 Information from Third-Party Sign-In
            </h3>
            <p className="mt-2 text-neutral-700">
              If you choose to sign in with Google, we receive your name, email address, and profile picture
              from Google, in accordance with Google&apos;s own privacy practices. We use this only to create
              and manage your Flikax account.
            </p>
          </section>

          <section id="how-we-use-your-information" className="scroll-mt-24">
            <h2 className="font-logo text-xl font-bold text-neutral-800">4. How We Use Your Information</h2>
            <p className="mt-3 text-neutral-700">We use your personal data to:</p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-neutral-700">
              <li>Create and manage your account, and verify your identity during sign-up and login.</li>
              <li>Allow you to post, browse, and manage listings.</li>
              <li>
                Enable chat between buyers and sellers, including the mutual phone-number reveal feature
                (your phone number is never shown to another user unless you and they both agree to share
                it).
              </li>
              <li>Process payments for premium features through Paystack and Flutterwave.</li>
              <li>Send you service-related notifications (such as new messages or new calls).</li>
              <li>Detect and prevent fraud, spam, duplicate or stolen images, and abuse of the Platform.</li>
              <li>Respond to support requests and enforce our Terms of Service.</li>
              <li>Maintain the security and proper functioning of the Platform.</li>
            </ul>
            <p className="mt-3 text-neutral-700">
              We do not sell your personal data. We do not currently use your data for targeted third-party
              advertising.
            </p>
          </section>

          <section id="legal-basis-for-processing" className="scroll-mt-24">
            <h2 className="font-logo text-xl font-bold text-neutral-800">5. Legal Basis for Processing</h2>
            <p className="mt-3 text-neutral-700">We process your personal data based on:</p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-neutral-700">
              <li>Your consent, where you have actively provided information (such as at sign-up).</li>
              <li>
                The performance of our agreement with you (our Terms of Service), to provide the Service you
                have requested.
              </li>
              <li>Our legitimate interest in keeping Flikax secure, functional, and free of fraud and abuse.</li>
              <li>Compliance with legal obligations, where applicable under Ghanaian law.</li>
            </ul>
          </section>

          <section id="who-we-share-your-data-with" className="scroll-mt-24">
            <h2 className="font-logo text-xl font-bold text-neutral-800">6. Who We Share Your Data With</h2>
            <p className="mt-3 text-neutral-700">
              We share personal data only with the following categories of third parties, and only as
              necessary to operate the Platform:
            </p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-neutral-700">
              <li>
                <span className="font-semibold">Infrastructure and hosting providers:</span> Supabase
                (database, authentication, and file storage) and Vercel (application hosting). Your data may
                be processed and stored outside Ghana as a result of these providers&apos; infrastructure
                (see Section 9).
              </li>
              <li>
                <span className="font-semibold">Payment processors:</span> Paystack and Flutterwave, solely
                to process payments for premium features.
              </li>
              <li>
                <span className="font-semibold">SMS/verification providers:</span> Twilio, solely to deliver
                phone verification codes during sign-up and login.
              </li>
              <li>
                <span className="font-semibold">Law enforcement or regulators:</span> only where required by
                Ghanaian law or a valid legal request.
              </li>
            </ul>
            <p className="mt-3 text-neutral-700">
              We do not share your data with data brokers, advertising networks, or marketing partners.
            </p>
          </section>

          <section id="data-retention" className="scroll-mt-24">
            <h2 className="font-logo text-xl font-bold text-neutral-800">7. Data Retention</h2>
            <p className="mt-3 text-neutral-700">
              We retain your personal data for as long as your account remains active, and for a reasonable
              period afterward to comply with legal obligations, resolve disputes, and enforce our
              agreements. If you delete your account, we will remove or anonymize your personal data, except
              where retention is required by law.
            </p>
          </section>

          <section id="your-privacy-rights" className="scroll-mt-24">
            <h2 className="font-logo text-xl font-bold text-neutral-800">8. Your Privacy Rights</h2>
            <p className="mt-3 text-neutral-700">You have the right to:</p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-neutral-700">
              <li>Access, review, or correct your personal data through your account settings.</li>
              <li>Request a copy of the personal data we hold about you.</li>
              <li>
                Request deletion of your account and associated personal data by contacting{" "}
                <a href="mailto:flikaxsupport@gmail.com" className="text-brand hover:underline">
                  flikaxsupport@gmail.com
                </a>{" "}
                or using the delete-account option in Settings.
              </li>
              <li>Object to or ask us to restrict certain processing of your data.</li>
              <li>
                Lodge a complaint with a relevant supervisory authority if you believe your data protection
                rights have been violated.
              </li>
            </ul>
            <p className="mt-3 text-neutral-700">
              To exercise any of these rights, contact us at{" "}
              <a href="mailto:flikaxsupport@gmail.com" className="text-brand hover:underline">
                flikaxsupport@gmail.com
              </a>
              .
            </p>
          </section>

          <section id="international-data-transfers" className="scroll-mt-24">
            <h2 className="font-logo text-xl font-bold text-neutral-800">9. International Data Transfers</h2>
            <p className="mt-3 text-neutral-700">
              Some of our service providers (such as our hosting and database infrastructure) may store or
              process data outside Ghana. Where this occurs, we take reasonable steps to ensure your data
              continues to be protected consistently with this Privacy Policy.
            </p>
          </section>

          <section id="childrens-privacy" className="scroll-mt-24">
            <h2 className="font-logo text-xl font-bold text-neutral-800">10. Children&apos;s Privacy</h2>
            <p className="mt-3 text-neutral-700">
              Flikax is not intended for use by anyone under 18 years of age, consistent with our Terms of
              Service. We do not knowingly collect personal data from anyone under 18. If you believe a
              minor has provided us with personal data, please contact us at{" "}
              <a href="mailto:flikaxsupport@gmail.com" className="text-brand hover:underline">
                flikaxsupport@gmail.com
              </a>{" "}
              so we can remove it.
            </p>
          </section>

          <section id="data-security" className="scroll-mt-24">
            <h2 className="font-logo text-xl font-bold text-neutral-800">11. Data Security</h2>
            <p className="mt-3 text-neutral-700">
              We take reasonable technical and organizational measures to protect your personal data against
              unauthorized access, alteration, disclosure, or destruction. However, no method of
              transmission or storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section id="changes-to-this-privacy-policy" className="scroll-mt-24">
            <h2 className="font-logo text-xl font-bold text-neutral-800">12. Changes to This Privacy Policy</h2>
            <p className="mt-3 text-neutral-700">
              We may update this Privacy Policy from time to time. If we make material changes, we will
              notify you through the Platform or by other reasonable means. Continued use of Flikax after
              changes take effect constitutes acceptance of the revised policy.
            </p>
          </section>

          <section id="contact-us" className="scroll-mt-24">
            <h2 className="font-logo text-xl font-bold text-neutral-800">13. Contact Us</h2>
            <p className="mt-3 text-neutral-700">
              If you have questions about this Privacy Policy or how we handle your personal data, contact
              us at:
            </p>
            <dl className="mt-3 space-y-1 text-neutral-700">
              <div className="flex gap-2">
                <dt className="font-semibold">Support Email:</dt>
                <dd>
                  <a href="mailto:flikaxsupport@gmail.com" className="text-brand hover:underline">
                    flikaxsupport@gmail.com
                  </a>
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-semibold">Company:</dt>
                <dd>Flikax</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-semibold">Company Address:</dt>
                <dd>Tema, Accra - Ghana</dd>
              </div>
            </dl>
          </section>

          <div className="border-t border-neutral-100 pt-6 text-center">
            <p className="font-logo font-bold text-neutral-800">Flikax — Buy. Sell. Discover.</p>
            <p className="mt-1 text-sm text-neutral-500">A trusted marketplace for local commerce.</p>
          </div>
        </div>
      </TocLayout>

      <SiteFooter />
    </div>
  );
}
