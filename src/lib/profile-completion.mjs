export function getProfileCompletionStatus(score) {
  if (score < 40) {
    return {
      key: "incomplete",
      label: "Incomplete",
      legend: "Please look for missing informations and add them in. Silakan cari informasi yang hilang dan tambahkan.",
    };
  }

  if (score < 65) {
    return {
      key: "basic",
      label: "Basic",
      legend: "Add more to improve visibility. Tambahkan lebih banyak untuk meningkatkan visibilitas.",
    };
  }

  if (score < 85) {
    return {
      key: "good",
      label: "Good",
      legend: "Solid profile! Some more projects should show up soon : ) Profil yang solid! Beberapa proyek lagi akan segera muncul : )",
    };
  }

  return {
    key: "complete",
    label: "Complete",
    legend: "Fully optimised! Dioptimalkan sepenuhnya!",
  };
}

export function calculateProfileCompletionScore(profile, isPro) {
  let score = 0;

  if (profile.companyName?.trim().length >= 2) score += 15;
  if (profile.categories?.length > 0) score += 10;
  if (profile.locations?.length > 0) score += 10;

  if (profile.description?.trim().length >= 80) score += 15;

  if (profile.phone?.trim() || profile.whatsapp?.trim()) score += 12;
  if (profile.email?.includes("@")) score += 5;
  if (profile.website || profile.instagram || profile.facebook || profile.linkedin) score += 3;

  const foundedYear = Number.parseInt(String(profile.foundedYear ?? ""), 10);
  const currentYear = new Date().getFullYear();
  if (foundedYear >= 1980 && foundedYear <= currentYear) score += 5;
  if (Number(profile.teamSize) >= 1) score += 5;
  if (profile.projects !== undefined && profile.projects !== "" && Number(profile.projects) >= 0) score += 5;

  if (profile.hasLogo) score += 5;

  const photoCount = Number(profile.projectPhotoCount ?? 0);
  if (isPro) {
    if (photoCount >= 4) score += 10;
    else if (photoCount >= 1) score += 5;
  } else if (photoCount >= 4) {
    score += 8;
  } else if (photoCount >= 1) {
    score += 4;
  }

  if (profile.isReviewed === true) score += 5;

  return Math.min(isPro ? 100 : 85, score);
}
