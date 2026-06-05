# SolidFind WebKit Clean Rebuild Audit

This is the working checklist for rebuilding the public UI from the Desktop WebKit and Mobile WebKit while keeping the current database, query, auth, and back-office logic.

## Source Kits

- Desktop source: `/tmp/solidfind-desktop-kit/ui_kits/web-v2`
- Mobile source: `/tmp/solidfind-mobile-kit/ui_kits/mobile-v2`
- Current branch: `sandbox`
- Test domain: `https://nbeta.solidfind.id`

## Rebuild Rule

Use WebKit component structure and CSS as the visual source of truth. Existing app code should only supply data, routing, auth state, Convex queries/mutations, uploads, admin/back-office behavior, and persistence.

## Route Map

| App surface | Current route | Desktop kit source | Mobile kit source | Rebuild status |
|---|---|---|---|---|
| Landing/results | `/` | `Header.jsx`, `Filters.jsx`, `SearchBar.jsx`, `ProCard.jsx`, `ArticleCard.jsx`, `Footer.jsx` | `mobile-main.jsx`, `mobile-chrome.jsx` | Partial port; needs full WebKit replacement pass |
| Mobile scrolled results header | `/` while scrolled | no separate desktop source | `MainAScrolled`, `MMiniHeader` in `mobile-main.jsx`/`mobile-chrome.jsx` | Partial port; needs exact behavior pass |
| Company profile | `/[companySlug]`, `/profile/[id]` | `ProDetail.jsx`, `ServiceMatrix.jsx`, `ReviewsModal.jsx`, `LeaveReviewModal.jsx`, `ShareModal.jsx` | `mobile-profile.jsx` | Partial port; needs exact WebKit replacement pass |
| About | `/about` | `About.jsx` | `mobile-about.jsx` | Existing route present; needs WebKit replacement pass |
| Article detail | `/article/[id]` | `ArticleCard.jsx` / `ArticlePage` | `mobile-article.jsx` | Existing route present; needs WebKit replacement pass |
| Legal/terms | `/terms` | `Legal.jsx` | `mobile-legal.jsx` | Existing route present; needs WebKit replacement pass |
| Company dashboard, Pro | `/company-dashboard` | `Dashboard.jsx` | `mobile-dashboard.jsx` | Existing route present; needs WebKit replacement pass |
| Company dashboard, Free | `/company-dashboard` | `FreeDashboard.jsx` | `mobile-dashboard-free.jsx` | Existing route present; needs WebKit replacement pass |
| Edit profile | `/company-dashboard/edit` | `EditProfile.jsx`, `ServiceMatrix.jsx`, `BudgetRange.jsx` | `mobile-edit.jsx` | Existing route present; needs WebKit replacement pass; keep upload/form persistence fixes |
| Individual dashboard | `/dashboard`, `/dashboard/[category]` | `UserDashboard.jsx` | `mobile-user-dashboard.jsx` | Existing route present; needs WebKit replacement pass |
| Login | modal + Clerk routes | `LoginModal.jsx` | `PopupLogin` in `mobile-popups.jsx` | Existing auth logic present; needs visual shell port |
| Sign up | modal + Clerk routes | `SignUpModal.jsx` | `PopupSignup` in `mobile-popups.jsx` | Existing auth logic present; needs visual shell port |
| Write review | modal/profile action | `LeaveReviewModal.jsx` | `PopupWriteReview` in `mobile-popups.jsx` | Existing logic partial; needs visual shell port |
| Reviews modal/list | profile "All reviews" action; legacy `/reviews` and profile review routes | `ReviewsModal.jsx` | profile review section in `mobile-profile.jsx` | Treat as popup-first; no new full-page design needed unless SEO/back-compat routes stay public |
| Share modal | profile/card action | `ShareModal.jsx` | icon/action exists; no full mobile share modal beyond popup system | Needs visual shell port |
| Ad purchase modal | ad slot action | `AdModal.jsx` | `PopupGetAds` in `mobile-popups.jsx` | Needs visual shell port |
| Pro subscription | `/upgrade`, modal action, `/company-dashboard?pro=1`, `/company-dashboard?proSuccess=1` | `ProModal.jsx`, `Legal.jsx` for pro terms, supplied purchase confirmation HTML | `PopupGetPro`, `mobile-pro-guidelines.jsx` | Buy popup needs WebKit port; purchase confirmation preview is wired |
| No results | empty search state on `/` | supplied `No Results.html` | supplied responsive HTML | Wired from supplied HTML; needs visual QA |
| 404 | `/_not-found` / app not found | supplied `404 Error Page.html` | supplied responsive HTML | Wired from supplied HTML; needs visual QA |

## Back Office To Keep

- Convex schema, queries, mutations, and admin data operations.
- Clerk auth, magic-link, secure sign-in, SSO callback, and account onboarding logic.
- Image upload/storage logic and the edit-profile no-refresh persistence behavior.
- Admin pages under `/admin/*`; no new admin/back-office UI is requested. Keep existing admin UI and make sure content/data links are accurate.
- Feature flags/settings for Pro, reviews, visible categories, legal content, featured articles, and page visibility.

## Visual Gaps To Design

- Secure sign-in, auth-complete, SSO callback, loading, error, and expired-link states. Reuse popup templates where possible.
- Coming-soon page and any domain/maintenance fallback page.
- Payment checkout failure, pending, renewal, and cancel states for Pro. Purchase confirmation is now covered by supplied HTML.
- Ad purchase checkout success, failure, pending, and inventory-unavailable states.
- Report-listing public confirmation should use a popup-style state; moderation itself is existing admin flow at `/admin/reports`.
- Delete-account confirmation success/failure states beyond the mobile popup.
- Email templates and transactional notification visuals only if we send branded emails outside Clerk/Midtrans defaults.
- Global runtime error page in final WebKit styling. 404 is now covered by supplied HTML.

## Direct Review Links

- Buy Pro popup: `/company-dashboard?pro=1`
- Pro purchase confirmation popup: `/company-dashboard?proSuccess=1`
- Secure sign-in state: `/secure-sign-in?next=/company-dashboard/edit`

## Implementation Order

1. Build a WebKit adapter layer that maps current Convex data to the WebKit view model.
2. Replace public browse/results with Desktop WebKit and Mobile WebKit structures.
3. Replace company profile with WebKit desktop/mobile structures.
4. Replace about, article, legal, footer, and modal surfaces.
5. Replace company/user dashboards and edit profile while preserving existing mutations and uploads.
6. Leave admin/back-office logic intact until dedicated designs exist.
