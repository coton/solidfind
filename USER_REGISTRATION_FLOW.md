# SolidFind User Registration Flow

## Overview

The system supports two registration paths:

- **Social OAuth**
- **Email/Password**

Both paths converge on the same post-auth pipeline.

---

## Path A: Social OAuth (Google / Apple / Microsoft)

### 1. `AuthModal` (`src/components/AuthModal.tsx`) — Step 1: Method Selection

- User chooses **Company** or **Individual** via toggle switches
- User clicks one of:
  - `Continue with Google`
  - `Continue with Apple`
  - `Continue with Microsoft`
- The chosen account type (and company name, if provided) is saved to `sessionStorage` as:
  - `solidfind_accountType`
  - `solidfind_companyName`
- Clerk redirects via `authenticateWithRedirect` → `/sso-callback` → `/auth-complete`

### 2. `AuthCompletePage` (`src/app/auth-complete/page.tsx`)

- Checks `user.publicMetadata.accountType`
- If metadata exists (**returning user**): redirects immediately to the appropriate dashboard
- If metadata does not exist (**new user**): shows `AccountTypeSelectionCard`

### 3. `AccountTypeSelectionCard` (`src/components/AccountTypeSelectionCard.tsx`)

- Greets the user by name/email from Clerk
- Shows Company/Individual toggle (pre-selected from `sessionStorage`)
- If **Company**: requires company name input
- On submit: calls `persistAccountType`

### 4. `persistAccountType` (in `src/app/auth-complete/page.tsx`)

- `POST`s to `/api/set-account-type` to write Clerk `publicMetadata`
- Calls `api.users.createOrGetUser` Convex mutation to sync the user record:
  - `clerkId`
  - `email`
  - `name`
  - `accountType`
  - `companyName`
- Clears `sessionStorage`
- Redirects:
  - **Individual** → `/dashboard`
  - **Company** → `/register-business` (via `getPostAuthRedirectPath`)

### 5. `RegisterBusinessPage` (`src/app/register-business/page.tsx`) — Company users only

- Verifies the user is a company account
- Checks if a company record already exists in Convex
- If not: creates a blank company record (`api.companies.create`) with the user as owner
- Redirects to `/company-dashboard/edit?firstConnection=1`

---

## Path B: Email/Password Registration

### 1. `AuthModal` — Step 1: Method Selection

- User chooses Company/Individual toggle
- Clicks `Continue with email` → Step 2

### 2. `AuthModal` — Step 2: Email Form

User enters:

- Email
- Name / Company Name (depending on account type)
- Password

Optional:

- `Subscribe to newsletter` toggle

On submit (`handleSignUp`):

- Checks `api.users.checkEmailAccountType` in Convex to prevent cross-type email reuse
- Calls `signUp.create()` with `unsafeMetadata` containing `accountType` + `companyName`
- Calls `signUp.prepareEmailAddressVerification({ strategy: "email_code" })`
- Sets `pendingVerification = true`

### 3. `AuthModal` — Step 3: Verify Email

- Shows 6-digit code input (sanitized, numeric-only)
- User enters the code from their email
- On verify (`handleVerifyEmail`):
  - Calls `signUp.attemptEmailAddressVerification({ code })`
  - On success:
    - Calls `setActive({ session })`
    - `POST`s to `/api/set-account-type`
    - Closes modal
  - Redirects based on account type:
    - **Company** → `/company-dashboard`
    - **Individual** → `/dashboard`
- Expired codes: `Request a new code` button resends via `signUp.prepareEmailAddressVerification`

---

## Key Architecture Notes

| Layer | Role |
|---|---|
| **Clerk** | Identity provider — handles OAuth, email/password, sessions, user metadata (`publicMetadata`, `unsafeMetadata`) |
| **Convex** (`convex/users.ts`) | Application user store — `createOrGetUser`, `getCurrentUser`, `updateAccountType`, `checkEmailAccountType` |
| **`useStoreUserEffect`** | Auto-syncs Clerk user → Convex on every session load, reading accountType from `publicMetadata` (authoritative) → `unsafeMetadata` (fallback) → `"individual"` (default) |
| **`/api/set-account-type`** (`src/app/api/set-account-type/route.ts`) | Server route that writes Clerk `publicMetadata` — authenticates via Clerk `auth()`, validates `accountType`, and calls `clerkClient.users.updateUserMetadata` to persist `accountType` (and optional `companyName`) to `publicMetadata` |
