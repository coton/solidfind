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
| Reviews modal/list | profile actions, `/reviews`, profile review pages | `ReviewsModal.jsx` | profile review section in `mobile-profile.jsx` | Modal designed; full review pages need design decision |
| Share modal | profile/card action | `ShareModal.jsx` | icon/action exists; no full mobile share modal beyond popup system | Needs visual shell port |
| Ad purchase modal | ad slot action | `AdModal.jsx` | `PopupGetAds` in `mobile-popups.jsx` | Needs visual shell port |
| Pro subscription | `/upgrade`, modal action | `ProModal.jsx`, `Legal.jsx` for pro terms | `PopupGetPro`, `mobile-pro-guidelines.jsx` | Needs visual shell port |

## Back Office To Keep

- Convex schema, queries, mutations, and admin data operations.
- Clerk auth, magic-link, secure sign-in, SSO callback, and account onboarding logic.
- Image upload/storage logic and the edit-profile no-refresh persistence behavior.
- Admin pages under `/admin/*` unless a new admin design is supplied.
- Feature flags/settings for Pro, reviews, visible categories, legal content, featured articles, and page visibility.

## Visual Gaps To Design

- Admin/back-office UI for companies, users, reviews, reports, settings, pages, legal, waitlist, and audit log.
- Full-page `/reviews` design and profile-specific reviews page design. The kit includes modal/review sections, but not a dedicated reviews route.
- Secure sign-in, auth-complete, SSO callback, loading, error, and expired-link states.
- Coming-soon page and any domain/maintenance fallback page.
- Empty states beyond the simple WebKit "No matches" result state.
- Payment checkout success, failure, pending, and renewal/cancel states for Pro.
- Ad purchase checkout success, failure, pending, and inventory-unavailable states.
- Report-listing confirmation and moderation outcome states.
- Delete-account confirmation success/failure states beyond the mobile popup.
- Email templates and transactional notification visuals.
- 404/global error pages in final WebKit styling.

## Implementation Order

1. Build a WebKit adapter layer that maps current Convex data to the WebKit view model.
2. Replace public browse/results with Desktop WebKit and Mobile WebKit structures.
3. Replace company profile with WebKit desktop/mobile structures.
4. Replace about, article, legal, footer, and modal surfaces.
5. Replace company/user dashboards and edit profile while preserving existing mutations and uploads.
6. Leave admin/back-office logic intact until dedicated designs exist.
