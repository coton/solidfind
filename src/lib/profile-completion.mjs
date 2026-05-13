export function getProfileCompletionStatus(score) {
  if (score < 40) {
    return {
      key: "incomplete",
      label: "Incomplete",
      legend: 'Profile visible but shows "Incomplete" badge. Not eligible for search ranking or Pro features. Company prompted to complete required fields.',
    };
  }

  if (score < 65) {
    return {
      key: "basic",
      label: "Basic",
      legend: 'Profile is active and searchable. No badge shown. Eligible for standard placement. Dashboard shows "Add more to improve visibility."',
    };
  }

  if (score < 85) {
    return {
      key: "good",
      label: "Good",
      legend: "Solid profile. Eligible for standard search ranking. Dashboard shows remaining optional fields with their point values.",
    };
  }

  return {
    key: "complete",
    label: "Complete",
    legend: 'Fully optimised. Eligible for all ranking features. Shows "Complete" badge on the public profile. 100% requires Pro (photo fields).',
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

  if (isPro) {
    const photoCount = Number(profile.projectPhotoCount ?? 0);
    if (photoCount >= 4) score += 10;
    else if (photoCount >= 1) score += 5;
  }

  if (profile.isReviewed === true) score += 5;

  return Math.min(isPro ? 100 : 85, score);
}
