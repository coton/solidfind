"use client";

import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#f8f8f8] flex flex-col">
      <Header />

      <main className="max-w-[900px] mx-auto px-4 sm:px-0 py-8 flex-grow w-full">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[11px] text-[#333]/50 hover:text-[#333] transition-colors tracking-[0.22px]"
          >
            <ArrowLeft className="w-4 h-4" />
            BACK
          </Link>
        </div>

        <h1 className="text-[32px] font-bold text-[#333] tracking-[0.64px] mb-8">
          SOLIDFIND.ID Terms &amp; Conditions
        </h1>

        <div className="space-y-8 text-[11px] text-[#333]/70 leading-[18px] tracking-[0.22px] mb-12">
          {/* Terms of Use */}
          <section>
            <h2 className="text-[18px] font-semibold text-[#333] tracking-[0.36px] mb-3">
              Terms of Use
            </h2>
            <p className="mb-2">
              Welcome to SOLIDFIND.ID. By accessing and using this platform, you agree to be bound by these Terms &amp; Conditions. If you do not agree with any part of these terms, please do not use our services.
            </p>
            <p className="mb-2">
              SOLIDFIND.ID is an independent platform built to bring clarity, trust, and perspective to the construction and renovation industry in Indonesia. We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the updated terms.
            </p>
            <p>
              Users must be at least 18 years of age to create an account. All information provided during registration must be accurate and up to date.
            </p>
          </section>

          {/* Privacy Policy */}
          <section>
            <h2 className="text-[18px] font-semibold text-[#333] tracking-[0.36px] mb-3">
              Privacy Policy
            </h2>
            <p className="mb-2">
              We value your privacy. SOLIDFIND.ID collects personal information necessary to provide our services, including your name, email address, and account preferences.
            </p>
            <p className="mb-2">
              Your data is stored securely and is never sold to third parties. We may use anonymized, aggregated data to improve our platform and services.
            </p>
            <p>
              You have the right to request access to, correction of, or deletion of your personal data at any time by contacting our support team.
            </p>
          </section>

          {/* Cookie Policy */}
          <section>
            <h2 className="text-[18px] font-semibold text-[#333] tracking-[0.36px] mb-3">
              Cookie Policy
            </h2>
            <p className="mb-2">
              SOLIDFIND.ID uses cookies and similar technologies to enhance your browsing experience. Cookies help us understand how you interact with our platform and allow us to remember your preferences.
            </p>
            <p>
              You can manage your cookie preferences through your browser settings. Disabling cookies may affect certain features of the platform.
            </p>
          </section>

          {/* User Responsibilities */}
          <section>
            <h2 className="text-[18px] font-semibold text-[#333] tracking-[0.36px] mb-3">
              User Responsibilities
            </h2>
            <p className="mb-2">
              As a user of SOLIDFIND.ID, you agree to:
            </p>
            <ul className="space-y-1 ml-4 mb-2">
              <li className="flex items-start gap-2">
                <span className="text-[#333]">•</span>
                <span>Provide accurate and truthful information in your profile and reviews</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#333]">•</span>
                <span>Respect other users and companies on the platform</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#333]">•</span>
                <span>Not post defamatory, misleading, or fraudulent content</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#333]">•</span>
                <span>Not attempt to manipulate ratings or reviews</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#333]">•</span>
                <span>Comply with all applicable local laws and regulations</span>
              </li>
            </ul>
            <p>
              SOLIDFIND.ID reserves the right to suspend or terminate accounts that violate these responsibilities without prior notice.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
