const reviewedIndonesianCopyMap = new Map([
  [
    "Temukan profesional interior untuk perencanaan ruang, styling, furnitur, dan proyek interior penuh.",
    "Temukan profesional interior untuk perencanaan ruang, styling, furnitur, dan proyek interior lengkap.",
  ],
  ["Rumah lengkap", "Seluruh Rumah"],
  ["RUMAH LENGKAP", "SELURUH RUMAH"],
  [
    "Platform independen yang dibangun untuk membawa kejelasan, kepercayaan & perspektif ke tempat-tempat yang orang tinggali.",
    "Platform independen yang dibangun untuk menghadirkan kejelasan, kepercayaan, dan perspektif pada tempat-tempat yang kita tinggali.",
  ],
  [
    "Untuk individu menemukan profesional — dan agar profesional mudah ditemukan.",
    "Untuk membantu individu menemukan profesional — dan membantu profesional agar mudah ditemukan.",
  ],
  [
    "Menemukan profesional yang tepat seharusnya tidak terasa acak. Dan menjadi profesional yang baik seharusnya tidak hanya bergantung pada algoritma atau dari mulut ke mulut.",
    "Menemukan profesional yang tepat seharusnya tidak terasa seperti tebak-tebakan. Dan menjadi profesional yang baik seharusnya tidak hanya bergantung pada algoritma atau rekomendasi dari mulut ke mulut.",
  ],
  [
    "Saat ini, sebagai individu, tidak mudah menemukan kontak yang dapat dipercaya. Bagi profesional, tidak mudah terlihat selain melalui mulut ke mulut dan jejaring sosial. Pasarnya terfragmentasi. Informasi tersebar. Visibilitas tidak konsisten. SolidFind hadir untuk menstrukturkan ruang itu — bukan untuk menggantikan hubungan, bukan untuk ikut campur dalam proyek, tetapi untuk membuat penemuan menjadi jelas, profesional, dan mudah diakses.",
    "Saat ini, bagi individu, menemukan kontak yang dapat dipercaya tidaklah mudah. Bagi profesional, mudah ditemukan di luar rekomendasi dari mulut ke mulut dan jejaring sosial juga tidak mudah. Pasar terfragmentasi. Informasi tersebar. Visibilitas tidak konsisten. SolidFind hadir untuk menata ruang ini — bukan untuk menggantikan hubungan, bukan untuk ikut campur dalam proyek, tetapi untuk membuat pencarian menjadi jelas, profesional, dan mudah diakses.",
  ],
  ["Yang kami percaya", "Yang kami yakini"],
  [
    "Untuk pemilik properti & penyewa — jelajahi listing, simpan perusahaan, dan temukan profesional yang tepat untuk proyek Anda. Pilih tipe hunian Anda: Solo / Pasangan, Keluarga / Co-Hosting, atau Bersama / Komunitas dan mulai dari sana.",
    "Untuk pemilik properti & penyewa — jelajahi listing, simpan perusahaan, dan temukan profesional yang tepat untuk proyek Anda. Pilih tipe hunian Anda: Solo / Pasangan, Keluarga / Co-Hosting, atau Bersama / Komunitas, lalu mulai dari sana.",
  ],
  [
    "Untuk profesional konstruksi & renovasi — buat profil perusahaan Anda, tampilkan hingga 4 foto proyek, deskripsikan layanan terbaik Anda beserta lokasinya, dan ditemukan oleh calon klien di seluruh Bali.",
    "Untuk profesional konstruksi & renovasi — buat profil perusahaan Anda, tampilkan hingga 4 foto proyek, jelaskan layanan terbaik Anda beserta lokasinya, dan ditemukan oleh calon klien di seluruh Bali.",
  ],
  [
    "Profil Anda, sepenuhnya milik Anda. Pro memberikan Anda penempatan teratas di hasil pencarian, analitik visibilitas terperinci, hingga 12 foto proyek, dan akses ke penempatan iklan di seluruh platform. Dirancang untuk perusahaan yang serius dengan reputasinya.",
    "Profil Anda, sepenuhnya milik Anda. Pro memberi Anda penempatan teratas di hasil pencarian, analitik visibilitas terperinci, hingga 12 foto proyek, dan akses ke penempatan iklan di seluruh platform. Dirancang untuk perusahaan yang serius menjaga reputasinya.",
  ],
  [
    "SolidFind masih dalam fase peluncuran. Pertanyaan, masukan, atau pertanyaan kemitraan sangat kami sambut — dan tolong beri tahu kami jika Anda menemukan bug.",
    "SolidFind masih dalam fase peluncuran. Pertanyaan, masukan, atau pertanyaan seputar kemitraan sangat kami sambut — dan beri tahu kami jika Anda menemukan bug.",
  ],
]);

export function normalizeReviewedIndonesianText(value) {
  if (typeof value !== "string") return value;
  return reviewedIndonesianCopyMap.get(value) ?? value;
}
