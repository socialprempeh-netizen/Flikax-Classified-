import { Scale } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { TocLayout } from "@/components/legal/toc-layout";

const TOC = [
  { id: "introduction", title: "1. Introduction" },
  { id: "eligibility", title: "2. Eligibility" },
  { id: "account-registration", title: "3. Account Registration" },
  { id: "using-flikax", title: "4. Using Flikax" },
  { id: "listings", title: "5. Listings" },
  { id: "prohibited-items", title: "6. Prohibited Items" },
  { id: "payments-premium-services", title: "7. Payments & Premium Services" },
  { id: "user-communication", title: "8. User Communication" },
  { id: "safety-disclaimer", title: "9. Safety Disclaimer" },
  { id: "intellectual-property", title: "10. Intellectual Property" },
  { id: "account-suspension-termination", title: "11. Account Suspension & Termination" },
  { id: "limitation-of-liability", title: "12. Limitation of Liability" },
  { id: "indemnification", title: "13. Indemnification" },
  { id: "changes-to-terms", title: "14. Changes to These Terms" },
  { id: "governing-law", title: "15. Governing Law" },
  { id: "contact-us", title: "16. Contact Us" },
];

export default async function TermsPage() {
  return (
    <div className="flex flex-1 flex-col bg-background">
      <SiteHeader />

      <TocLayout toc={TOC}>
        <div className="mb-8 flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand">
            <Scale className="size-5" />
          </span>
          <div>
            <h1 className="font-logo text-3xl font-bold text-neutral-800">Terms of Service</h1>
            <p className="text-sm text-neutral-500">Effective Date: 20th August, 2026</p>
          </div>
        </div>

        <div className="space-y-10 rounded-2xl bg-white p-6 shadow-md sm:p-8">
          <section id="introduction" className="scroll-mt-24">
            <h2 className="font-logo text-xl font-bold text-neutral-800">1. Introduction</h2>
            <p className="mt-3 text-neutral-700">
              Welcome to Flikax. These Terms of Service (&quot;Terms&quot;) govern your access to and use
              of the Flikax website, mobile applications, and related services (collectively, the
              &quot;Platform&quot;).
            </p>
            <p className="mt-3 text-neutral-700">
              By creating an account, posting a listing, or using Flikax in any way, you agree to be bound
              by these Terms. If you do not agree, you must not use the Platform.
            </p>
          </section>

          <section id="eligibility" className="scroll-mt-24">
            <h2 className="font-logo text-xl font-bold text-neutral-800">2. Eligibility</h2>
            <p className="mt-3 text-neutral-700">To use Flikax, you must:</p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-neutral-700">
              <li>Be at least 18 years old, or use the Platform under the supervision of a parent or legal guardian.</li>
              <li>Provide accurate and truthful information.</li>
              <li>Comply with all applicable laws and regulations.</li>
            </ul>
          </section>

          <section id="account-registration" className="scroll-mt-24">
            <h2 className="font-logo text-xl font-bold text-neutral-800">3. Account Registration</h2>
            <p className="mt-3 text-neutral-700">
              You may register using email/password or supported third-party sign-in providers such as
              Google.
            </p>
            <p className="mt-3 text-neutral-700">You are responsible for:</p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-neutral-700">
              <li>Keeping your login credentials secure.</li>
              <li>All activity that occurs under your account.</li>
              <li>Immediately notifying us of any unauthorized access.</li>
            </ul>
          </section>

          <section id="using-flikax" className="scroll-mt-24">
            <h2 className="font-logo text-xl font-bold text-neutral-800">4. Using Flikax</h2>
            <p className="mt-3 text-neutral-700">
              Flikax is a marketplace that allows users to buy, sell, rent, and advertise goods and
              services. When using the Platform, you agree not to:
            </p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-neutral-700">
              <li>Post false, misleading, or fraudulent listings.</li>
              <li>Sell prohibited or illegal items.</li>
              <li>Impersonate another person or business.</li>
              <li>Spam, harass, or abuse other users.</li>
              <li>Attempt to hack, disrupt, or misuse the Platform.</li>
              <li>Post content that infringes intellectual property rights.</li>
            </ul>
          </section>

          <section id="listings" className="scroll-mt-24">
            <h2 className="font-logo text-xl font-bold text-neutral-800">5. Listings</h2>
            <p className="mt-3 text-neutral-700">
              Users are solely responsible for the content of their listings. By posting a listing, you
              confirm that:
            </p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-neutral-700">
              <li>You own the item or have the right to advertise it.</li>
              <li>The description and photos are accurate.</li>
              <li>The listing complies with these Terms and applicable laws.</li>
            </ul>
            <p className="mt-3 text-neutral-700">
              Flikax may review, edit, reject, or remove listings at its discretion.
            </p>
          </section>

          <section id="prohibited-items" className="scroll-mt-24">
            <h2 className="font-logo text-xl font-bold text-neutral-800">6. Prohibited Items</h2>
            <p className="mt-3 text-neutral-700">Examples of prohibited items include:</p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-neutral-700">
              <li>Illegal drugs</li>
              <li>Counterfeit goods</li>
              <li>Stolen property</li>
              <li>Weapons prohibited by law</li>
              <li>Human organs</li>
              <li>Fraudulent financial services</li>
              <li>Adult content prohibited by local law</li>
              <li>Any item that violates applicable regulations</li>
            </ul>
          </section>

          <section id="payments-premium-services" className="scroll-mt-24">
            <h2 className="font-logo text-xl font-bold text-neutral-800">7. Payments &amp; Premium Services</h2>
            <p className="mt-3 text-neutral-700">
              Flikax may offer paid features such as promoted listings and advertising services. Payments
              may be processed through third-party providers including Flutterwave and Paystack.
            </p>
            <p className="mt-3 text-neutral-700">By purchasing a paid service, you agree that:</p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-neutral-700">
              <li>Fees are displayed before payment.</li>
              <li>Payments are processed securely by third-party payment providers.</li>
              <li>Promotional services may begin immediately after purchase.</li>
              <li>Refunds are subject to Flikax&apos;s refund policy.</li>
            </ul>
          </section>

          <section id="user-communication" className="scroll-mt-24">
            <h2 className="font-logo text-xl font-bold text-neutral-800">8. User Communication</h2>
            <p className="mt-3 text-neutral-700">
              Flikax may provide chat or messaging features. You agree not to use these features for:
            </p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-neutral-700">
              <li>Harassment</li>
              <li>Scams</li>
              <li>Spam</li>
              <li>Illegal transactions</li>
              <li>Sharing malicious links</li>
            </ul>
          </section>

          <section id="safety-disclaimer" className="scroll-mt-24">
            <h2 className="font-logo text-xl font-bold text-neutral-800">9. Safety Disclaimer</h2>
            <p className="mt-3 text-neutral-700">
              Flikax is a platform connecting buyers and sellers. We do not own, inspect, or guarantee the
              items listed by users.
            </p>
            <p className="mt-3 text-neutral-700">Users should:</p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-neutral-700">
              <li>Meet in safe public places.</li>
              <li>Inspect items before payment.</li>
              <li>Avoid paying in advance unless they fully trust the seller.</li>
              <li>Report suspicious activity.</li>
            </ul>
          </section>

          <section id="intellectual-property" className="scroll-mt-24">
            <h2 className="font-logo text-xl font-bold text-neutral-800">10. Intellectual Property</h2>
            <p className="mt-3 text-neutral-700">
              Flikax and its logos, designs, and software are owned by Flikax and protected by applicable
              intellectual property laws.
            </p>
            <p className="mt-3 text-neutral-700">
              You retain ownership of content you upload, but grant Flikax a non-exclusive license to
              display, distribute, and promote that content on the Platform.
            </p>
          </section>

          <section id="account-suspension-termination" className="scroll-mt-24">
            <h2 className="font-logo text-xl font-bold text-neutral-800">
              11. Account Suspension &amp; Termination
            </h2>
            <p className="mt-3 text-neutral-700">We may suspend or terminate accounts that:</p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-neutral-700">
              <li>Violate these Terms.</li>
              <li>Engage in fraud or abuse.</li>
              <li>Post prohibited content.</li>
              <li>Threaten the safety of other users.</li>
            </ul>
          </section>

          <section id="limitation-of-liability" className="scroll-mt-24">
            <h2 className="font-logo text-xl font-bold text-neutral-800">12. Limitation of Liability</h2>
            <p className="mt-3 text-neutral-700">
              To the maximum extent permitted by law, Flikax shall not be liable for:
            </p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-neutral-700">
              <li>Losses arising from transactions between users.</li>
              <li>Fraud committed by third parties.</li>
              <li>Lost profits or business opportunities.</li>
              <li>Service interruptions.</li>
              <li>Indirect or consequential damages.</li>
            </ul>
          </section>

          <section id="indemnification" className="scroll-mt-24">
            <h2 className="font-logo text-xl font-bold text-neutral-800">13. Indemnification</h2>
            <p className="mt-3 text-neutral-700">
              You agree to indemnify and hold Flikax harmless from claims arising from:
            </p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-neutral-700">
              <li>Your use of the Platform.</li>
              <li>Your listings or content.</li>
              <li>Your violation of these Terms or applicable laws.</li>
            </ul>
          </section>

          <section id="changes-to-terms" className="scroll-mt-24">
            <h2 className="font-logo text-xl font-bold text-neutral-800">14. Changes to These Terms</h2>
            <p className="mt-3 text-neutral-700">
              We may update these Terms from time to time. Continued use of Flikax after changes become
              effective constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section id="governing-law" className="scroll-mt-24">
            <h2 className="font-logo text-xl font-bold text-neutral-800">15. Governing Law</h2>
            <p className="mt-3 text-neutral-700">These Terms shall be governed by the laws of Ghana.</p>
          </section>

          <section id="contact-us" className="scroll-mt-24">
            <h2 className="font-logo text-xl font-bold text-neutral-800">16. Contact Us</h2>
            <p className="mt-3 text-neutral-700">For questions about these Terms, contact:</p>
            <dl className="mt-3 space-y-1 text-neutral-700">
              <div className="flex gap-2">
                <dt className="font-semibold">Support Email:</dt>
                <dd>
                  <a href="mailto:vonfon41@gmail.com" className="text-brand hover:underline">
                    vonfon41@gmail.com
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
