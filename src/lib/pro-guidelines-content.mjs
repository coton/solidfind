export const DEFAULT_PRO_GUIDELINES_EN_TITLE = "More visibility.\nSame standards.";
export const DEFAULT_PRO_GUIDELINES_ID_TITLE = "Visibilitas lebih besar.\nStandar tetap sama.";

export const DEFAULT_PRO_GUIDELINES_EN_INTRO = "Pro helps verified professionals present richer profiles and appear in stronger discovery positions. The same listing standards still apply to every account.";
export const DEFAULT_PRO_GUIDELINES_ID_INTRO = "Pro membantu profesional terverifikasi menampilkan profil yang lebih lengkap dan muncul di posisi penemuan yang lebih kuat. Standar listing yang sama tetap berlaku untuk setiap akun.";

export const DEFAULT_PRO_GUIDELINES_EN_ITEMS = [
  {
    title: "Profile accuracy",
    body: "Keep your public details, service coverage, photos, and contact links accurate. SolidFind may pause visibility for profiles that contain misleading or outdated information.",
  },
  {
    title: "Portfolio quality",
    body: "Use real project references, clear captions, and relevant imagery. Logos stay as profile pictures; project or placeholder imagery should be used for covers.",
  },
  {
    title: "Reviews",
    body: "Testimonials must come from real client experiences. Companies may not create, buy, or pressure users into inaccurate reviews.",
  },
  {
    title: "Sponsored placements",
    body: "Ads and sponsored positions remain subject to availability, relevance, and platform moderation.",
  },
  {
    title: "Billing",
    body: "Pro subscriptions use Indonesian rupiah pricing and are processed securely via Midtrans. Changes apply to the next billing cycle unless otherwise stated.",
  },
];

export const DEFAULT_PRO_GUIDELINES_ID_ITEMS = [
  {
    title: "Akurasi profil",
    body: "Pastikan detail publik, cakupan layanan, foto, dan tautan kontak Anda selalu akurat. SolidFind dapat menghentikan visibilitas profil yang memuat informasi menyesatkan atau tidak lagi diperbarui.",
  },
  {
    title: "Kualitas portofolio",
    body: "Gunakan referensi proyek nyata, keterangan yang jelas, dan gambar yang relevan. Logo tetap digunakan sebagai foto profil; gambar proyek atau placeholder sebaiknya dipakai untuk cover.",
  },
  {
    title: "Ulasan",
    body: "Testimoni harus berasal dari pengalaman klien yang nyata. Perusahaan tidak boleh membuat, membeli, atau menekan pengguna untuk memberikan ulasan yang tidak akurat.",
  },
  {
    title: "Penempatan bersponsor",
    body: "Iklan dan posisi bersponsor tetap bergantung pada ketersediaan, relevansi, dan moderasi platform.",
  },
  {
    title: "Penagihan",
    body: "Langganan Pro menggunakan harga dalam rupiah Indonesia dan diproses secara aman melalui Midtrans. Perubahan berlaku pada siklus penagihan berikutnya kecuali dinyatakan lain.",
  },
];

export function getDefaultProGuidelines(language) {
  if (language === "id") {
    return {
      title: DEFAULT_PRO_GUIDELINES_ID_TITLE,
      intro: DEFAULT_PRO_GUIDELINES_ID_INTRO,
      items: DEFAULT_PRO_GUIDELINES_ID_ITEMS,
    };
  }
  return {
    title: DEFAULT_PRO_GUIDELINES_EN_TITLE,
    intro: DEFAULT_PRO_GUIDELINES_EN_INTRO,
    items: DEFAULT_PRO_GUIDELINES_EN_ITEMS,
  };
}

export function parseProGuidelinesItems(value, fallback) {
  if (!value?.trim()) return fallback;
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return fallback;
    const normalized = parsed
      .map((item) => ({
        title: String(item?.title ?? "").trim(),
        body: String(item?.body ?? "").trim(),
      }))
      .filter((item) => item.title && item.body);
    return normalized.length ? normalized : fallback;
  } catch {
    return fallback;
  }
}
