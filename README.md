# SolidFind

Bali business directory website built with Next.js, Clerk authentication, and Convex backend.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org) 16 (App Router)
- **Authentication**: [Clerk](https://clerk.com)
- **Backend / Database**: [Convex](https://convex.dev)
- **Styling**: Tailwind CSS 4 + Radix UI
- **Payments**: Stripe
- **Font**: Sora (Google Fonts)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in the required values:

```bash
cp .env.example .env.local
```

### 3. Clerk Authentication

Clerk handles user authentication (sign-in, sign-up, session management).

1. Create an account at [dashboard.clerk.com](https://dashboard.clerk.com)
2. Create a new application
3. Copy the keys into `.env.local`:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
   CLERK_SECRET_KEY=sk_test_xxxxx
   ```
4. Configure sign-in/sign-up redirect URLs in the Clerk dashboard to match:
   ```
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   ```

**Architecture — Custom Flows (non-prebuilt UI)**:

This project uses [Clerk Custom Flows](https://clerk.com/docs/custom-flows/overview) instead of Clerk's prebuilt `<SignIn/>` / `<SignUp/>` components. This approach gives full control over the UI to match the Figma design exactly, while still using Clerk's authentication backend.

| | Prebuilt (`<SignIn/>`) | Custom Flows (`useSignIn()`) — **our choice** |
|---|---|---|
| UI control | Limited (colors/fonts only) | 100% custom |
| Clerk branding | "Secured by Clerk" watermark | None |
| Social login | Auto-rendered | Manual via `authenticateWithRedirect` |
| Email verification | Auto-handled | Manual (verification code step) |

**Key hooks used**:
- `useSignIn()` — custom login flow (email + password)
- `useSignUp()` — custom registration flow (email + password + email verification code)
- `useUser()` — access current user data
- `useClerk()` — Clerk instance (signOut, etc.)

**File structure**:
- `ClerkProvider` wraps the app in `src/app/layout.tsx`
- **Custom auth modal**: `src/components/AuthModal.tsx` — main login/register UI (matches Figma design, uses Custom Flows)
- Fallback sign-in page: `src/app/sign-in/[[...sign-in]]/page.tsx` (prebuilt, for direct URL access)
- Fallback sign-up page: `src/app/sign-up/[[...sign-up]]/page.tsx` (prebuilt, for direct URL access)
- User sync hook: `src/hooks/useStoreUserEffect.ts` (syncs Clerk user to Convex on login)

**Auth flow**:
1. User clicks login/register in the Header → opens `AuthModal`
2. **Login**: `signIn.create({ identifier, password })` → `setActive({ session })` → redirect to dashboard
3. **Register**: `signUp.create({ emailAddress, password })` → email verification code → `attemptEmailAddressVerification` → `setActive({ session })` → `useStoreUserEffect` syncs user to Convex → redirect to dashboard

### 4. Convex Backend

Convex is used as the real-time backend database.

1. Create an account at [dashboard.convex.dev](https://dashboard.convex.dev)
2. Create a new project
3. Copy the deployment URL into `.env.local`:
   ```
   NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
   ```
4. Run the Convex dev server alongside Next.js:
   ```bash
   npx convex dev
   ```

**Architecture**:
- Convex functions are in the `convex/` directory
- `ConvexClientProvider` in `src/components/ConvexClientProvider.tsx` wraps the app
- User data is synced from Clerk to Convex via `useStoreUserEffect` hook
- Schema and mutations/queries are defined in `convex/` (e.g., `convex/users.ts`)

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Deployment

The app can be deployed on [Vercel](https://vercel.com). Make sure to set all environment variables in the Vercel dashboard.

See [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying) for details.
