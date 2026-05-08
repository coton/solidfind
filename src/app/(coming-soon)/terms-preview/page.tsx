import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#E4E4E4] py-16 px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-12">
        {/* Back to Home */}
        <Link
          href="/"
          className="inline-flex items-center text-sm text-[#333]/70 hover:text-[#F14110] mb-8 transition-colors"
        >
          ← Back to Home
        </Link>

        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[#333]">SOLIDFIND.id</h1>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-[#333] mb-8">
          Terms & Conditions
        </h2>

        {/* Content */}
        <div className="space-y-8 text-[#333]">
          <section>
            <h3 className="text-xl font-semibold mb-4">Terms of Use</h3>
            <div className="space-y-4 text-sm leading-relaxed">
              <p>
                Welcome to SOLIDFIND.ID. By accessing and using this platform, you agree to be bound by these Terms & Conditions. 
                If you do not agree with any part of these terms, please do not use our services.
              </p>
              <p>
                SOLIDFIND.ID is an independent platform built to bring clarity, trust, and perspective to the construction and 
                renovation industry in Indonesia. We reserve the right to modify these terms at any time. Continued use of the 
                platform after changes constitutes acceptance of the updated terms.
              </p>
              <p>
                Users must be at least 18 years of age to create an account. All information provided during registration must 
                be accurate and up to date.
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-4">Privacy Policy</h3>
            <div className="space-y-4 text-sm leading-relaxed">
              <p>
                We value your privacy. SOLIDFIND.ID collects personal information necessary to provide our services, including 
                your name, email address, and account preferences.
              </p>
              <p>
                Your data is stored securely and is never sold to third parties. We may use anonymized, aggregated data to 
                improve our platform and services.
              </p>
              <p>
                You have the right to request access to, correction of, or deletion of your personal data at any time by 
                contacting our support team.
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-4">Cookie Policy</h3>
            <div className="space-y-4 text-sm leading-relaxed">
              <p>
                SOLIDFIND.ID uses cookies and similar technologies to enhance your browsing experience. Cookies help us 
                understand how you interact with our platform and allow us to remember your preferences.
              </p>
              <p>
                By using our platform, you consent to our use of cookies in accordance with this policy. You can manage 
                cookie preferences through your browser settings.
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-4">User Responsibilities</h3>
            <div className="space-y-4 text-sm leading-relaxed">
              <p>
                Users are responsible for maintaining the confidentiality of their account credentials. You agree not to 
                share your account with others or engage in fraudulent activities.
              </p>
              <p>
                Any content you submit (reviews, listings, messages) must be truthful, accurate, and not infringe on the 
                rights of others. We reserve the right to remove content that violates these terms.
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-4">Limitation of Liability</h3>
            <div className="space-y-4 text-sm leading-relaxed">
              <p>
                SOLIDFIND.ID acts as a platform connecting users with construction and renovation professionals. We do not 
                guarantee the quality, safety, or legality of services provided by listed companies.
              </p>
              <p>
                Users engage with listed professionals at their own risk. SOLIDFIND.ID is not liable for any damages, losses, 
                or disputes arising from transactions or interactions facilitated through our platform.
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
            <div className="space-y-4 text-sm leading-relaxed">
              <p>
                If you have any questions about these Terms & Conditions, please contact us at:{" "}
                <a href="mailto:support@solidfind.id" className="text-[#F14110] hover:underline">
                  support@solidfind.id
                </a>
              </p>
            </div>
          </section>

          {/* Last Updated */}
          <div className="pt-8 border-t border-gray-200">
            <p className="text-xs text-[#333]/50">
              Last updated: February 2026
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <p className="text-sm text-[#333]/70">
            © 2026 SOLIDFIND.ID. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
