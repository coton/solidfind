const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const editPagePath = path.join(projectRoot, 'src/app/company-dashboard/edit/page.tsx');
const dashboardPagePath = path.join(projectRoot, 'src/app/company-dashboard/page.tsx');

function read(relativePath) {
  return fs.readFileSync(relativePath, 'utf8');
}

test('company edit page keeps imported external media visible and editable', () => {
  const source = read(editPagePath);

  assert.match(
    source,
    /setProjectImageUrls\(company\.projectImageUrls \?\? \[\]\);/,
    'Expected the edit page to hydrate imported external project image URLs from the company record'
  );

  assert.match(
    source,
    /const totalProjectImages = projectImageUrls\.length \+ projectImageIds\.length;/,
    'Expected upload slot calculations to account for both imported external URLs and uploaded storage images'
  );

  assert.match(
    source,
    /updateCompany\(\{ id: company\._id, projectImageIds: newIds, projectImageUrls \}\);/,
    'Expected project image uploads to preserve previously imported external URLs when saving'
  );

  assert.match(
    source,
    /updateCompany\(\{ id: company\._id, projectImageIds, projectImageUrls: nextExternalUrls \}\);/,
    'Expected removing an imported external image to keep storage-backed images untouched'
  );

  assert.match(
    source,
    /updateCompany\(\{ id: company\._id, projectImageIds: nextStorageIds, projectImageUrls: projectImageUrls \}\);/,
    'Expected removing an uploaded storage image to keep imported external URLs untouched'
  );

  assert.match(
    source,
    /const logoPreviewUrl = logoUrl \?\? company\?\.imageUrl;/,
    'Expected the edit page logo preview to fall back to imported external company logos'
  );

  assert.match(
    source,
    /function ExternalImagePreview\(\{ src, alt \}[\s\S]*<img[\s\S]*src=\{src\}[\s\S]*onError=\{\(\) => setFailed\(true\)\}/,
    'Expected imported external media previews to use a native image fallback so protected URLs do not render broken alt text'
  );
});

test('company edit page stays on the editor after saving profile changes', () => {
  const source = read(editPagePath);
  const handleSaveStart = source.indexOf('const handleSave = async () => {');
  const maxImagesStart = source.indexOf('const maxImages = company?.isPro ? 12 : 4;');

  assert.ok(handleSaveStart !== -1, 'Expected the edit page save handler to exist');
  assert.ok(maxImagesStart !== -1, 'Expected the edit page image-slot section to follow the save handler');

  const handleSaveSource = source.slice(handleSaveStart, maxImagesStart);

  assert.match(
    handleSaveSource,
    /setIsDirty\(false\);/,
    'Expected saving to still mark the form as clean'
  );

  assert.doesNotMatch(
    handleSaveSource,
    /router\.push\("\/company-dashboard"\)|router\.replace\("\/company-dashboard"\)/,
    'Expected saving profile edits to stay on the edit page instead of redirecting to the dashboard'
  );
});

test('company edit page keeps legacy location field in sync with selected locations', () => {
  const source = read(editPagePath);

  assert.match(
    source,
    /location: selectedLocations\.join\(","\) \|\| undefined,[\s\S]*constructionLocations: selectedLocations,[\s\S]*renovationLocations: selectedLocations,[\s\S]*architectureLocations: selectedLocations,[\s\S]*interiorLocations: selectedLocations,[\s\S]*realEstateLocations: selectedLocations,/,
    'Expected saving company edits to update both the legacy location field and category location arrays'
  );
});

test('company edit page saves the active category derived from selected service groups', () => {
  const source = read(editPagePath);

  assert.match(
    source,
    /const categoryPriority = \["construction", "renovation", "architecture", "interior", "real-estate"\] as const;/,
    'Expected the edit page to define the public category priority order'
  );

  assert.match(
    source,
    /function getPrimaryActiveCategory\(categories: Record<\(typeof categoryPriority\)\[number\], string\[\]>\) \{\s*return categoryPriority\.find\(\(category\) => categories\[category\]\.length > 0\) \?\? "construction";\s*\}/,
    'Expected the primary category to come from the active saved service arrays'
  );

  assert.match(
    source,
    /const primaryCategory = getPrimaryActiveCategory\(\{[\s\S]*construction: savedConstruction,[\s\S]*renovation: savedRenovation,[\s\S]*architecture: savedArchitecture,[\s\S]*interior: savedInterior,[\s\S]*"real-estate": savedRealEstate,[\s\S]*\}\);[\s\S]*updateCompany\(\{[\s\S]*category: primaryCategory,/,
    'Expected every company update save to refresh the legacy category from the activated service groups'
  );
});

test('company edit page warns before internal navigation with unsaved changes', () => {
  const source = read(editPagePath);

  assert.match(
    source,
    /const \[pendingNavigationHref, setPendingNavigationHref\] = useState<string \| null>\(null\);/,
    'Expected edit page to track pending internal navigation while dirty'
  );

  assert.match(
    source,
    /window\.addEventListener\("beforeunload", handleBeforeUnload\);/,
    'Expected browser/tab exits to trigger the native unsaved changes warning'
  );

  assert.match(
    source,
    /const requestNavigation = \(href: string\) => \{[\s\S]*if \(isDirty\) \{[\s\S]*setPendingNavigationHref\(href\);[\s\S]*return;[\s\S]*\}[\s\S]*router\.push\(href\);[\s\S]*\};/,
    'Expected guarded internal navigation to open the warning instead of immediately leaving'
  );

  assert.match(
    source,
    /pendingNavigationHref && \([\s\S]*Unsaved changes[\s\S]*rounded-full[\s\S]*Stay[\s\S]*rounded-full[\s\S]*Leave/,
    'Expected an on-brand pill-button modal for unsaved changes'
  );
});

test('company edit page validates address format before saving', () => {
  const source = read(editPagePath);

  assert.match(
    source,
    /import \{ COMPANY_ADDRESS_VALIDATION_MESSAGE, isLikelyCompanyAddress, normalizeCompanyAddress \} from "@\/lib\/company-address-validation\.mjs";/,
    'Expected company edit page to use the shared address validator'
  );

  assert.match(
    source,
    /const normalizedAddress = normalizeCompanyAddress\(address\);[\s\S]*const invalidAddress = Boolean\(normalizedAddress && !isLikelyCompanyAddress\(normalizedAddress\)\);/,
    'Expected company edit page to detect invalid non-empty addresses'
  );

  assert.match(
    source,
    /const canSave = hasCategory && !missingProjectSize && !missingLocation && !missingDescription && !missingEmail && !missingAddress && !invalidAddress && !invalidFoundedYear && !hasInvalidContactField;/,
    'Expected invalid addresses to block saving'
  );

  assert.match(
    source,
    /address: normalizedAddress \|\| undefined/,
    'Expected saved company addresses to be normalized before mutation'
  );

  assert.match(
    source,
    /aria-invalid=\{invalidAddress\}/,
    'Expected address input to expose invalid state to the UI'
  );
});

test('company edit page only accepts four-digit founded years from 1980 to present', () => {
  const source = read(editPagePath);

  assert.match(
    source,
    /import \{ MIN_COMPANY_SINCE_YEAR, getMaxCompanySinceYear, isValidCompanySinceYear, normalizeCompanySinceYearInput \} from "@\/lib\/company-since-year-validation\.mjs";/,
    'Expected company edit page to use the shared founded-year validator'
  );

  assert.match(
    source,
    /const invalidFoundedYear = Boolean\(foundedYear && !isValidCompanySinceYear\(foundedYear, maxCompanySinceYear\)\);/,
    'Expected company edit page to reject out-of-range or incomplete founded years'
  );

  assert.match(
    source,
    /const canSave = hasCategory && !missingProjectSize && !missingLocation && !missingDescription && !missingEmail && !missingAddress && !invalidAddress && !invalidFoundedYear && !hasInvalidContactField;/,
    'Expected invalid founded years to block saving'
  );

  assert.match(
    source,
    /type="text"[\s\S]*inputMode="numeric"[\s\S]*pattern="\[0-9\]\{4\}"[\s\S]*maxLength=\{4\}/,
    'Expected the founded year field to accept only four numeric characters'
  );

  assert.match(
    source,
    /setFoundedYear\(normalizeCompanySinceYearInput\(e\.target\.value\)\);/,
    'Expected founded year input to strip non-digits and cap at four characters'
  );
});

test('company edit page requires email and shows the public profile explainer in two languages', () => {
  const source = read(editPagePath);

  assert.match(
    source,
    /const missingEmail = !email\.trim\(\);[\s\S]*Company email is required[\s\S]*!missingEmail/,
    'Expected company email to be required before saving'
  );

  assert.match(
    source,
    /E-mail <span className="text-\[#f14110\]">\(\*\)<\/span>[\s\S]*required/,
    'Expected the email field to show the orange required marker'
  );

  assert.match(
    source,
    /ProfileAccordion[\s\S]*What appears on your public profile:[\s\S]*Yang ditampilkan di profil publik Anda:/,
    'Expected the edit page explainer to use stacked English and Indonesian accordions'
  );

  assert.match(
    source,
    /CompletionLine complete=\{profileCompletionItems\.identity\}[\s\S]*RequiredStar[\s\S]*CompletionLine complete=\{profileCompletionItems\.projectMedia\}/,
    'Expected profile explainer list items to show completion ticks and orange required stars'
  );

  assert.match(
    source,
    /Profile completion \/ Penyelesaian profil[\s\S]*\{profileCompletionScore\}[\s\S]*\{profileCompletionStatus\.label\}/,
    'Expected the edit page to show a live profile completion score above the accordions'
  );

  assert.match(
    source,
    /<span className="block sm:inline">Company<\/span>[\s\S]*<span className="block sm:inline sm:ml-2">profile<\/span>[\s\S]*shrink-0 pt-1 text-right[\s\S]*PRO ACCOUNT[\s\S]*DELETE PROFILE/,
    'Expected the mobile title to split into two lines opposite account status/delete controls'
  );
});

test('company edit page calculates profile completion score without blocking saves on stored fields', () => {
  const source = read(editPagePath);
  const schemaSource = read('convex/schema.ts');
  const mutationSource = read('convex/companies.ts');
  const scoreSource = read('src/lib/profile-completion.mjs');
  const handleSaveStart = source.indexOf('const handleSave = async () => {');
  const maxImagesStart = source.indexOf('const maxImages = company?.isPro ? 12 : 4;');
  const handleSaveSource = source.slice(handleSaveStart, maxImagesStart);

  assert.match(
    scoreSource,
    /export function calculateProfileCompletionScore[\s\S]*return Math\.min\(isPro \? 100 : 85, score\);/,
    'Expected completion score helper to cap free accounts at 85 and pro accounts at 100'
  );

  assert.match(
    source,
    /calculateProfileCompletionScore\([\s\S]*const profileCompletionStatus = getProfileCompletionStatus\(profileCompletionScore\);/,
    'Expected company edit page to calculate the live completion score and status'
  );

  assert.doesNotMatch(
    handleSaveSource,
    /profileCompletionScore|profileCompletionStatus/,
    'Expected company save payloads to avoid completion fields that may not exist on older deployed Convex validators'
  );

  assert.match(
    schemaSource,
    /profileCompletionScore: v\.optional\(v\.number\(\)\),[\s\S]*profileCompletionStatus: v\.optional\(v\.string\(\)\),/,
    'Expected company records to store completion score and status'
  );

  assert.match(
    mutationSource,
    /profileCompletionScore: v\.optional\(v\.number\(\)\),[\s\S]*profileCompletionStatus: v\.optional\(v\.string\(\)\),/,
    'Expected company mutations to accept completion score and status'
  );
});

test('company dashboard replaces included pro services with profile completion reminder', () => {
  const source = read(dashboardPagePath);

  assert.match(
    source,
    /Profile completion \/ Penyelesaian profil[\s\S]*\{profileCompletionScore\}[\s\S]*\{profileCompletionStatus\.legend\}/,
    'Expected company dashboard to display the profile completion reminder block'
  );

  assert.doesNotMatch(
    source,
    /Services included with PRO account[\s\S]*proFeatures\.map/,
    'Expected the old included PRO services dashboard block to be removed'
  );

  assert.doesNotMatch(
    source,
    /company\?\.profileCompletionScore \?\?/,
    'Expected dashboard and editor scores to use the same live completion calculation instead of stale stored score'
  );
});

test('company dashboard keeps bookmark and completion paired while pro analytics wrap below', () => {
  const source = read(dashboardPagePath);

  assert.match(
    source,
    /<div className="grid grid-cols-2 gap-4 sm:gap-6 mb-6">[\s\S]*Company bookmarked \/[\s\S]*Profile completion \/ Penyelesaian profil/,
    'Expected bookmark and profile completion cards to share the first dashboard stats row'
  );

  assert.match(
    source,
    /showProAnalytics[\s\S]*grid grid-cols-1 gap-4 sm:grid-cols-2[\s\S]*Most frequent location searched\/[\s\S]*View within the last month \//,
    'Expected pro-only analytics to wrap onto their own responsive rows instead of the bookmark/completion row'
  );
});

test('company dashboard pro modal reads platform pricing and starts Xendit checkout', () => {
  const source = read(dashboardPagePath);

  assert.match(
    source,
    /useAction\(api\.xendit\.createInvoice\)/,
    'Expected the Buy now button to call the Xendit invoice action'
  );

  assert.match(
    source,
    /platformSettings = useQuery\(api\.platformSettings\.getAll\)[\s\S]*pricingPhase[\s\S]*monthly_price_\$\{pricingPhase\}[\s\S]*yearly_price_\$\{pricingPhase\}/,
    'Expected displayed pricing to follow the active admin pricing phase'
  );

  assert.match(
    source,
    /handleBuyPro[\s\S]*plan: billingPlan/,
    'Expected checkout to use the currently selected billing plan'
  );

  assert.match(
    source,
    /billingPlan === "monthly"[\s\S]*setBillingPlan\("yearly"\)/,
    'Expected monthly/yearly pricing switches to be mutually exclusive and passed to checkout'
  );
});

test('company dashboard aligns most frequent location with numeric stats', () => {
  const source = read(dashboardPagePath);

  assert.match(
    source,
    /h-\[42px\][\s\S]*Most frequent location searched\/[\s\S]*text-\[24px\] font-bold text-\[#f14110\] tracking-\[0\.48px\] leading-\[38px\]/,
    'Expected most frequent location value to keep its old font size while aligning with the views stat row'
  );
});

test('company dashboard completion score uses category locations like the editor', () => {
  const source = read(dashboardPagePath);

  assert.match(
    source,
    /const companyProfileLocations = company[\s\S]*constructionLocations[\s\S]*renovationLocations[\s\S]*architectureLocations[\s\S]*interiorLocations[\s\S]*realEstateLocations[\s\S]*locations: Array\.from\(new Set\(companyProfileLocations\)\),/,
    'Expected dashboard completion score to use the same category locations as the edit page'
  );
});

test('company edit header uses score and accordion columns', () => {
  const source = read(editPagePath);

  assert.match(
    source,
    /grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-8[\s\S]*Profile completion \/ Penyelesaian profil[\s\S]*ProfileAccordion/,
    'Expected score and description accordions to sit in two columns on desktop'
  );
});

test('profile completion bars use the monthly recap gradient', () => {
  const editSource = read(editPagePath);
  const dashboardSource = read(dashboardPagePath);

  assert.match(
    editSource,
    /width: `\$\{profileCompletionScore\}%`,[\s\S]*background: "linear-gradient\(to right, #e9a28e, #f14110\)"/,
    'Expected edit page profile completion bar to use the monthly recap gradient'
  );

  assert.match(
    dashboardSource,
    /width: `\$\{profileCompletionScore\}%`,[\s\S]*background: "linear-gradient\(to right, #e9a28e, #f14110\)"/,
    'Expected dashboard profile completion bar to use the monthly recap gradient'
  );
});

test('company edit project size switches to any size when all concrete sizes are active', () => {
  const source = read(editPagePath);

  assert.match(
    source,
    /const concreteProjectSizeIds = projectSizeOptions[\s\S]*option\.id !== "any"[\s\S]*const hasAllConcreteSizes = concreteProjectSizeIds\.every\(\(id\) => next\.includes\(id\)\);[\s\S]*setSelectedProjectSizes\(hasAllConcreteSizes \? \["any"\] : next\);/,
    'Expected selecting solo, family, and shared to collapse project size to any'
  );
});

test("company dashboard mirrors the individual dashboard greeting UI while keeping the company name clickable", () => {
  const source = read(dashboardPagePath);

  assert.match(
    source,
    /<p className="text-\[11px\] text-\[#333\]\/70 tracking-\[0\.22px\]">Hello<\/p>/,
    "Expected the company dashboard to render the same small Hello label used on the individual dashboard"
  );

  assert.match(
    source,
    /buildCompanyProfilePath, buildCompanyReviewsPath/,
    "Expected the company dashboard to import the company profile path helper so the heading can stay clickable"
  );

  assert.match(
    source,
    /<Link href=\{buildCompanyProfilePath\(company\)\} className="hover:text-\[#f14110\] transition-colors">\s*\{data\.name\}\s*<\/Link>/,
    "Expected the company name heading to remain clickable and route to the public company profile"
  );

  assert.doesNotMatch(
    source,
    /Hello \{data\.name\}/,
    "Expected the old combined Hello + company name heading to remain removed"
  );
});

test("company dashboard testimonial score matches the public profile typography", () => {
  const source = read(dashboardPagePath);

  assert.match(
    source,
    /import \{ starColor \} from "@\/lib\/starColors";/,
    "Expected the company dashboard to use the same testimonial star color helper as the public profile"
  );

  assert.match(
    source,
    /<svg width="16" height="15" viewBox="0 0 18 17"[\s\S]*M7\.93511 0\.71955[\s\S]*fill=\{starColor\(data\.rating\)\}/,
    "Expected the company dashboard testimonial score to use the same custom star shape as the public profile"
  );

  assert.match(
    source,
    /<span className="font-bam text-\[18px\] font-bold tracking-\[-0\.2em\]" style=\{\{ color: starColor\(data\.rating\) \}\}>\{data\.rating\}<\/span>/,
    "Expected the company dashboard score to use the JetBrains-backed font-bam profile typography"
  );

  assert.match(
    source,
    /<span className="text-\[10px\] tracking-\[0\.2px\]" style=\{\{ color: starColor\(data\.rating\) \+ 'B3' \}\}>\(\{data\.reviewCount\}\)<\/span>/,
    "Expected the company dashboard review count to use the same small tracked formatting as the public profile"
  );
});
