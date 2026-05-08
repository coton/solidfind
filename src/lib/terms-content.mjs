/**
 * @typedef {{ type: "paragraph", content: string }} TermsParagraphBlock
 * @typedef {{ type: "list", items: string[] }} TermsListBlock
 * @typedef {TermsParagraphBlock | TermsListBlock} TermsBlock
 * @typedef {{ title: string, blocks: TermsBlock[] }} TermsSection
 */

export const TERMS_TEXT_PLATFORM_SETTING_KEY = "termsText";

export const DEFAULT_TERMS_TEXT = `[TITLE] Terms of Use
[COPY] Welcome to SOLIDFIND.ID. By accessing and using this platform, you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, please do not use our services.
[COPY] SOLIDFIND.ID is an independent platform built to bring clarity, trust, and perspective to the construction and renovation industry in Indonesia. We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the updated terms.
[COPY] Users must be at least 18 years of age to create an account. All information provided during registration must be accurate and up to date.

[TITLE] Privacy Policy
[COPY] We value your privacy. SOLIDFIND.ID collects personal information necessary to provide our services, including your name, email address, and account preferences.
[COPY] Your data is stored securely and is never sold to third parties. We may use anonymized, aggregated data to improve our platform and services.
[COPY] You have the right to request access to, correction of, or deletion of your personal data at any time by contacting our support team.

[TITLE] Cookie Policy
[COPY] SOLIDFIND.ID uses cookies and similar technologies to enhance your browsing experience. Cookies help us understand how you interact with our platform and allow us to remember your preferences.
[COPY] You can manage your cookie preferences through your browser settings. Disabling cookies may affect certain features of the platform.

[TITLE] User Responsibilities
[COPY] As a user of SOLIDFIND.ID, you agree to:
- Provide accurate and truthful information in your profile and testimonials
- Respect other users and companies on the platform
- Not post defamatory, misleading, or fraudulent content
- Not attempt to manipulate ratings or testimonials
- Comply with all applicable local laws and regulations
[COPY] SOLIDFIND.ID reserves the right to suspend or terminate accounts that violate these responsibilities without prior notice.`;

/**
 * @param {string | null | undefined} value
 * @returns {string}
 */
export function normalizeTermsText(value) {
  return typeof value === "string" && value.trim() ? value.trim() : DEFAULT_TERMS_TEXT;
}

/**
 * @param {string | null | undefined} value
 * @returns {TermsSection[]}
 */
export function parseTermsContent(value) {
  const text = normalizeTermsText(value);
  const lines = text.split(/\r?\n/);
  /** @type {TermsSection[]} */
  const sections = [];
  /** @type {TermsSection | null} */
  let currentSection = null;

  /** @returns {TermsSection} */
  const ensureSection = () => {
    if (!currentSection) {
      currentSection = { title: "Terms & Conditions", blocks: [] };
      sections.push(currentSection);
    }
    return currentSection;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith("[TITLE]")) {
      currentSection = {
        title: line.replace("[TITLE]", "").trim() || "Terms & Conditions",
        blocks: [],
      };
      sections.push(currentSection);
      continue;
    }

    const section = ensureSection();

    if (line.startsWith("[COPY]")) {
      const content = line.replace("[COPY]", "").trim();
      if (content) {
        section.blocks.push({ type: "paragraph", content });
      }
      continue;
    }

    if (line.startsWith("- ")) {
      const lastBlock = section.blocks[section.blocks.length - 1];
      const item = line.slice(2).trim();
      if (!item) continue;

      if (lastBlock?.type === "list") {
        lastBlock.items.push(item);
      } else {
        section.blocks.push({ type: "list", items: [item] });
      }
      continue;
    }

    section.blocks.push({ type: "paragraph", content: line });
  }

  return sections;
}
