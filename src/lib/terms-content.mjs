/**
 * @typedef {{ type: "paragraph", content: string }} TermsParagraphBlock
 * @typedef {{ type: "list", items: string[] }} TermsListBlock
 * @typedef {TermsParagraphBlock | TermsListBlock} TermsBlock
 * @typedef {{ title: string, blocks: TermsBlock[] }} TermsSection
 */

export const TERMS_TEXT_PLATFORM_SETTING_KEY = "termsText";
export const TERMS_ID_TEXT_PLATFORM_SETTING_KEY = "termsTextId";
export const PRO_TERMS_EN_PLATFORM_SETTING_KEY = "proTermsEnglish";
export const PRO_TERMS_ID_PLATFORM_SETTING_KEY = "proTermsIndonesian";

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

export const DEFAULT_TERMS_ID_TEXT = `[TITLE] Ketentuan Penggunaan
[COPY] Selamat datang di SOLIDFIND.ID. Dengan mengakses dan menggunakan platform ini, Anda setuju untuk terikat oleh Syarat & Ketentuan ini. Jika Anda tidak setuju dengan bagian mana pun dari ketentuan ini, mohon untuk tidak menggunakan layanan kami.
[COPY] SOLIDFIND.ID adalah platform independen yang dibangun untuk menghadirkan kejelasan, kepercayaan, dan perspektif bagi industri konstruksi dan renovasi di Indonesia. Kami berhak mengubah ketentuan ini kapan saja. Penggunaan platform secara berkelanjutan setelah perubahan berarti Anda menerima ketentuan yang diperbarui.
[COPY] Pengguna harus berusia minimal 18 tahun untuk membuat akun. Semua informasi yang diberikan saat pendaftaran harus akurat dan terbaru.

[TITLE] Kebijakan Privasi
[COPY] Kami menghargai privasi Anda. SOLIDFIND.ID mengumpulkan informasi pribadi yang diperlukan untuk menyediakan layanan kami, termasuk nama, alamat email, dan preferensi akun Anda.
[COPY] Data Anda disimpan dengan aman dan tidak pernah dijual kepada pihak ketiga. Kami dapat menggunakan data anonim dan agregat untuk meningkatkan platform dan layanan kami.
[COPY] Anda berhak meminta akses, koreksi, atau penghapusan data pribadi Anda kapan saja dengan menghubungi tim dukungan kami.

[TITLE] Kebijakan Cookie
[COPY] SOLIDFIND.ID menggunakan cookie dan teknologi serupa untuk meningkatkan pengalaman browsing Anda. Cookie membantu kami memahami cara Anda berinteraksi dengan platform dan memungkinkan kami mengingat preferensi Anda.
[COPY] Anda dapat mengatur preferensi cookie melalui pengaturan browser Anda. Menonaktifkan cookie dapat memengaruhi fitur tertentu di platform.

[TITLE] Tanggung Jawab Pengguna
[COPY] Sebagai pengguna SOLIDFIND.ID, Anda setuju untuk:
- Memberikan informasi yang akurat dan benar di profil dan testimonial Anda
- Menghormati pengguna dan perusahaan lain di platform
- Tidak memposting konten yang mencemarkan nama baik, menyesatkan, atau curang
- Tidak mencoba memanipulasi rating atau testimonial
- Mematuhi semua hukum dan peraturan lokal yang berlaku
[COPY] SOLIDFIND.ID berhak menangguhkan atau menghentikan akun yang melanggar tanggung jawab ini tanpa pemberitahuan sebelumnya.`;

export const DEFAULT_PRO_TERMS_EN_TEXT = `[TITLE] Pro Terms of Services
[COPY] These Pro Terms of Services apply to companies subscribing to SolidFind Pro features. By subscribing, you agree to the billing, visibility, and platform-use conditions attached to Pro access.
[COPY] Pro features may include priority positioning in search results, profile visibility analytics, additional project media, and access to ad placement options. Feature availability may change as the platform evolves.
[COPY] Subscription fees are billed through SolidFind's payment provider. Access may be paused or cancelled if payment fails, if account information is inaccurate, or if the company violates SolidFind policies.`;

export const DEFAULT_PRO_TERMS_ID_TEXT = `[TITLE] Ketentuan Penggunaan Pro
[COPY] Ketentuan Penggunaan Pro ini berlaku untuk perusahaan yang berlangganan fitur SolidFind Pro. Dengan berlangganan, Anda menyetujui ketentuan pembayaran, visibilitas, dan penggunaan platform yang terkait dengan akses Pro.
[COPY] Fitur Pro dapat mencakup penempatan prioritas dalam hasil pencarian, analitik visibilitas profil, media proyek tambahan, dan akses ke opsi penempatan iklan. Ketersediaan fitur dapat berubah seiring perkembangan platform.
[COPY] Biaya langganan diproses melalui penyedia pembayaran SolidFind. Akses dapat dijeda atau dibatalkan jika pembayaran gagal, informasi akun tidak akurat, atau perusahaan melanggar kebijakan SolidFind.`;

/**
 * @param {string | null | undefined} value
 * @returns {string}
 */
export function normalizeTermsText(value) {
  return typeof value === "string" && value.trim() ? value.trim() : DEFAULT_TERMS_TEXT;
}

/**
 * @param {string} line
 * @returns {string | null}
 */
function parseBulletLine(line) {
  const match = line.trim().match(/^[-•▪*]\s+(.+)$/);
  return match ? match[1].trim() : null;
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

    const bulletItem = parseBulletLine(line);
    if (bulletItem) {
      const lastBlock = section.blocks[section.blocks.length - 1];

      if (lastBlock?.type === "list") {
        lastBlock.items.push(bulletItem);
      } else {
        section.blocks.push({ type: "list", items: [bulletItem] });
      }
      continue;
    }

    section.blocks.push({ type: "paragraph", content: line });
  }

  return sections;
}
