"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import { useConvex } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { OAuthStrategy } from "@clerk/types";
import {
  getAuthStatusMessage,
  getVerificationErrorMessage,
  isVerificationCodeComplete,
  sanitizeVerificationCode,
} from "@/lib/auth-verification.mjs";
import { useSiteLanguage } from "./LanguageProvider";

type AuthMode = "login" | "register";
type AccountType = "company" | "individual";
type AuthStep = "method" | "email";
type AuthOAuthStrategy = Extract<OAuthStrategy, "oauth_google">;

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
  initialAccountType?: AccountType;
  onAuthSuccess?: (accountType: AccountType) => void;
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function getPrimaryClerkMessage(err: unknown, fallback: string) {
  const clerkError = err as { errors?: Array<{ message?: string }> };
  return clerkError.errors?.[0]?.message || fallback;
}

function shouldOfferPasswordReset(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("data breach") ||
    normalized.includes("breach") ||
    normalized.includes("reset your password") ||
    normalized.includes("reset password") ||
    normalized.includes("password has been found")
  );
}

export function AuthModal({
  isOpen,
  onClose,
  initialMode = "register",
  initialAccountType = "individual",
  onAuthSuccess,
}: AuthModalProps) {
  const router = useRouter();
  const { t } = useSiteLanguage();
  const { signIn, setActive: setSignInActive, isLoaded: isSignInLoaded } = useSignIn();
  const { signUp, setActive: setSignUpActive, isLoaded: isSignUpLoaded } = useSignUp();
  const convex = useConvex();

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [accountType, setAccountType] = useState<AccountType>(initialAccountType);
  const [step, setStep] = useState<AuthStep>("method");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(false);
  // Clerk flow states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [pendingReset, setPendingReset] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [needsSecureSignIn, setNeedsSecureSignIn] = useState(false);
  const [needsPasswordReset, setNeedsPasswordReset] = useState(false);
  const portalElement = typeof document !== "undefined" ? document.body : null;

  // Sync when props change (e.g. re-opening with different defaults)
  useEffect(() => { setMode(initialMode); }, [initialMode]);
  useEffect(() => { setAccountType(initialAccountType); }, [initialAccountType]);

  // Reset state when modal opens/closes or mode changes
  useEffect(() => {
    if (!isOpen) {
      setError("");
      setPendingVerification(false);
      setPendingReset(false);
      setVerificationCode("");
      setNewPassword("");
      setNeedsSecureSignIn(false);
      setNeedsPasswordReset(false);
      setIsLoading(false);
      setStep("method");
    }
  }, [isOpen]);

  useEffect(() => {
    setError("");
    setPendingVerification(false);
    setPendingReset(false);
    setVerificationCode("");
    setNewPassword("");
    setNeedsSecureSignIn(false);
    setNeedsPasswordReset(false);
    setStep("method");
  }, [mode]);

  if (!isOpen) return null;

  const handleSocialAuth = async (strategy: AuthOAuthStrategy) => {
    if (!isSignInLoaded || !isSignUpLoaded) return;

    setIsLoading(true);
    setError("");

    try {
      sessionStorage.setItem("solidfind_accountType", accountType);
      if (accountType === "company" && name) {
        sessionStorage.setItem("solidfind_companyName", name);
      }

      const redirectUrl = "/sso-callback";
      const redirectUrlComplete = "/auth-complete";

      if (mode === "login") {
        await signIn!.authenticateWithRedirect({
          strategy,
          redirectUrl,
          redirectUrlComplete,
        });
      } else {
        await signUp!.authenticateWithRedirect({
          strategy,
          redirectUrl,
          redirectUrlComplete,
        });
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: Array<{ message: string }> };
      setError(clerkError.errors?.[0]?.message || "Social login failed. Please try again.");
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignInLoaded || !signIn) return;
    if (!email || !password) { setError("Please fill in all fields / Mohon isi semua kolom"); return; }

    setIsLoading(true);
    setError("");

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });
      const resultStatus = result.status as string | null;

      if (result.status === "complete" && setSignInActive) {
        await setSignInActive({ session: result.createdSessionId });
        if (onAuthSuccess) onAuthSuccess(accountType);
        onClose();
        router.push(accountType === "company" ? "/company-dashboard" : "/dashboard");
        return;
      }

      if (resultStatus === "needs_second_factor" || resultStatus === "needs_client_trust") {
        setNeedsSecureSignIn(true);
      }

      setError(
        getAuthStatusMessage(resultStatus, {
          fallbackMessage: "Login requires additional verification before it can continue.",
          needsSecondFactorMessage:
            "This account needs an extra secure verification step. Continue with secure sign in to finish.",
          needsClientTrustMessage:
            "This sign in is from a new device. Continue with secure sign in to verify it is you.",
        })
      );
    } catch (err: unknown) {
      const message = getPrimaryClerkMessage(err, "Login failed. Please try again.");
      setNeedsPasswordReset(shouldOfferPasswordReset(message));
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSecureSignIn = () => {
    const params = new URLSearchParams();
    const trimmedEmail = email.trim();
    if (trimmedEmail) {
      params.set("identifier", trimmedEmail);
    }
    params.set("next", accountType === "company" ? "/company-dashboard" : "/dashboard");
    params.set("lang", document.documentElement.lang === "id" ? "id" : "en");
    onClose();
    router.push(`/secure-sign-in?${params.toString()}`);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignUpLoaded || !signUp) return;
    if (!email || !password) { setError("Please fill in all fields / Mohon isi semua kolom"); return; }

    setIsLoading(true);
    setError("");

    try {
      // Check if email is already used with a different account type
      const emailCheck = await convex.query(api.users.checkEmailAccountType, {
        email: email.toLowerCase().trim(),
        accountType,
      });
      if (!emailCheck.available) {
        setError(emailCheck.message || "This email is already registered with a different account type.");
        setIsLoading(false);
        return;
      }

      await signUp.create({
        emailAddress: email,
        password,
        firstName: name || undefined,
        unsafeMetadata: {
          accountType,
          companyName: accountType === "company" ? name : undefined,
        },
      });

      if (subscribeNewsletter) {
        await convex.mutation(api.waitlist.addToWaitlist, {
          email: email.toLowerCase().trim(),
        });
      }

      // Send email verification code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: unknown) {
      const clerkError = err as { errors?: Array<{ message: string }> };
      setError(clerkError.errors?.[0]?.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isSignUpLoaded || !signUp) return;

    const normalizedCode = sanitizeVerificationCode(verificationCode);
    if (!isVerificationCodeComplete(normalizedCode)) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: normalizedCode,
      });

      if (result.status === "complete" && setSignUpActive) {
        await setSignUpActive({ session: result.createdSessionId });

        // Write accountType to publicMetadata via server API route
        await fetch("/api/set-account-type", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accountType,
            companyName: accountType === "company" ? name : undefined,
          }),
        });

        if (onAuthSuccess) onAuthSuccess(accountType);
        onClose();
        router.push(accountType === "company" ? "/register-business" : "/dashboard");
      }
    } catch (err: unknown) {
      setError(
        getVerificationErrorMessage(err, {
          fallbackMessage: "Invalid verification code.",
          expiredMessage: "This code expired. Please request a new one below.",
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerificationCode = async () => {
    if (!isSignUpLoaded || !signUp) return;

    setIsLoading(true);
    setError("");

    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerificationCode("");
    } catch (err: unknown) {
      setError(
        getVerificationErrorMessage(err, {
          fallbackMessage: "Failed to resend verification code.",
          expiredMessage: "Your previous code expired. A fresh code could not be sent yet. Please try again.",
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!isSignInLoaded || !signIn) return;
    if (!email) { setError("Please enter your email first / Mohon masukkan email terlebih dahulu"); return; }

    setIsLoading(true);
    setError("");

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      setPendingReset(true);
    } catch (err: unknown) {
      const message = getPrimaryClerkMessage(err, "Failed to send reset code.");
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignInLoaded || !signIn) return;

    const normalizedCode = sanitizeVerificationCode(verificationCode);
    if (!isVerificationCodeComplete(normalizedCode) || !newPassword) {
      setError(!newPassword ? "Please fill in all fields / Mohon isi semua kolom" : "Please enter the 6-digit verification code.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: normalizedCode,
        password: newPassword,
      });

      if (result.status === "complete" && setSignInActive) {
        await setSignInActive({ session: result.createdSessionId });
        if (onAuthSuccess) onAuthSuccess(accountType);
        onClose();
        router.push(accountType === "company" ? "/company-dashboard" : "/dashboard");
      }
    } catch (err: unknown) {
      setError(
        getVerificationErrorMessage(err, {
          fallbackMessage: "Failed to reset password.",
          expiredMessage: "This reset code expired. Please request a new one below.",
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendResetCode = async () => {
    if (!isSignInLoaded || !signIn || !email) return;

    setIsLoading(true);
    setError("");

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      setVerificationCode("");
      setNewPassword("");
    } catch (err: unknown) {
      setError(
        getVerificationErrorMessage(err, {
          fallbackMessage: "Failed to resend reset code.",
          expiredMessage: "Your previous reset code expired. A fresh code could not be sent yet. Please try again.",
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ── Shared modal shell ──
  const modalShell = (content: React.ReactNode) => {
    const shell = (
      <div
        className="sf-modal-scrim open"
        onClick={onClose}
      >
        <div
          className={`sf-modal sf-auth-modal ${mode === "register" ? "sf-modal-signup" : "sf-modal-login"}`}
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            className="sf-modal-x"
            aria-label="Close"
          >
            ×
          </button>

          {content}
        </div>
      </div>
    );

    return portalElement ? createPortal(shell, portalElement) : shell;
  };

  // ── Email verification view ──
  if (pendingVerification) {
    return modalShell(
      <>
        <button
          type="button"
          onClick={() => { setPendingVerification(false); setError(""); }}
          className="sf-modal-back"
        >
          ← Back
        </button>

        <div className="sf-modal-head sf-auth-step-head">
          <span className="sf-tag-mono">Check your email</span>
          <h2>Verify email</h2>
          <p>We sent a verification code to <b>{email}</b>.</p>
        </div>

        <div className="sf-modal-form">
          <label className="sf-field">
            <span>Verification code</span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={verificationCode}
              onChange={(e) => setVerificationCode(sanitizeVerificationCode(e.target.value))}
              placeholder="Enter 6-digit code"
              className="sf-code-input"
            />
          </label>

          <button type="button" disabled={isLoading} onClick={handleVerifyEmail} className="sf-btn sf-btn-pri sf-btn-lg sf-auth-email-btn">
            {isLoading ? "Verifying..." : "Verify"}
          </button>

          <button type="button" disabled={isLoading} onClick={handleResendVerificationCode} className="sf-modal-link sf-link-button sf-auth-inline-link">
            {isLoading ? 'Sending...' : 'Request a new code'}
          </button>

          {error && <p className="sf-auth-note">*{error}</p>}
        </div>
      </>
    );
  }

  // ── Reset password view ──
  if (pendingReset) {
    return modalShell(
      <>
        <button
          type="button"
          onClick={() => { setPendingReset(false); setError(""); setVerificationCode(""); setNewPassword(""); }}
          className="sf-modal-back"
        >
          ← Back
        </button>

        <div className="sf-modal-head sf-auth-step-head">
          <span className="sf-tag-mono">Password reset</span>
          <h2>Reset password</h2>
          <p>Enter the code sent to <b>{email}</b> and choose a new password.</p>
        </div>

        <form onSubmit={handleResetPassword} className="sf-modal-form">
            <label className="sf-field">
              <span>Verification code</span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(sanitizeVerificationCode(e.target.value))}
                placeholder="Enter 6-digit code"
                required
                className="sf-code-input"
              />
            </label>

            <label className="sf-field">
              <span>New password</span>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </label>

            <button type="submit" disabled={isLoading} className="sf-btn sf-btn-pri sf-btn-lg sf-auth-email-btn">
              {isLoading ? "Resetting..." : "Reset password"}
            </button>
        </form>

        <button type="button" disabled={isLoading} onClick={handleResendResetCode} className="sf-modal-link sf-link-button sf-auth-inline-link">
          {isLoading ? 'Sending...' : 'Request a new code'}
        </button>

        {error && <p className="sf-auth-note">*{error}</p>}
      </>
    );
  }

  // ── Step 1: Method selection ──
  if (step === "method") {
    return modalShell(
      <>
        <div className="sf-modal-head">
          <span className="sf-tag-mono">{mode === "login" ? t("Welcome back") : t("Get started")}</span>
          <h2>{mode === "login" ? t("Log in") : t("Create an account")}</h2>
          <p>
            {mode === "login"
              ? t("Find the right people. Build something solid.")
              : t("Welcome to the best Bali directory — for the people who build, and the people building.")}
          </p>
        </div>

        {/* Account type toggle (register only) */}
        {mode === "register" && (
          <div className="sf-su-opts" style={{ marginTop: 16 }}>
            <button type="button" className={`sf-su-opt ${accountType === "company" ? "on" : ""}`} onClick={() => setAccountType("company")}>
              <div className="sf-su-opt-top">
                <span className="sf-su-opt-title">{t("Company")}</span>
                <span className={`sf-switch ${accountType === "company" ? "on" : ""}`} aria-hidden="true"><span className="sf-switch-knob" /></span>
              </div>
              <span className="sf-su-opt-sub">{t("Create a profile page & get discovered")}</span>
            </button>
            <button type="button" className={`sf-su-opt ${accountType === "individual" ? "on" : ""}`} onClick={() => setAccountType("individual")}>
              <div className="sf-su-opt-top">
                <span className="sf-su-opt-title">{t("Individual")}</span>
                <span className={`sf-switch ${accountType === "individual" ? "on" : ""}`} aria-hidden="true"><span className="sf-switch-knob" /></span>
              </div>
              <span className="sf-su-opt-sub">{t("Save listings & review companies")}</span>
            </button>
          </div>
        )}

        {mode === "register" && (
          <button type="button" className={`sf-su-news ${subscribeNewsletter ? "on" : ""}`} onClick={() => setSubscribeNewsletter((value) => !value)}>
            <span>{t("Subscribe to the SolidFind newsletter")}</span>
            <span className={`sf-switch ${subscribeNewsletter ? "on" : ""}`} aria-hidden="true"><span className="sf-switch-knob" /></span>
          </button>
        )}

        <div className="sf-auth-options">
          <button type="button" className="sf-btn sf-btn-ghost sf-auth-oauth" onClick={() => handleSocialAuth("oauth_google")} disabled={isLoading}>
            <GoogleIcon /> {t("Continue with Google")}
          </button>
          <div className="sf-su-or"><span>{t("or")}</span></div>
          <button type="button" className="sf-btn sf-btn-pri sf-btn-lg sf-auth-email-btn" onClick={() => { setStep("email"); setError(""); }}>
            {t("Continue with email")}
          </button>
        </div>

        {error && (
          <p className="sf-auth-note">{error}</p>
        )}

        {/* Switch mode */}
        <p className="sf-modal-foot">
          {mode === "login" ? (
            <>
              {t("New here?")}{" "}
              <button type="button" onClick={() => { setMode("register"); setError(""); }} className="sf-modal-link sf-link-button">
                {t("Sign up!")}
              </button>
            </>
          ) : (
            <>
              {t("Already have an account?")}{" "}
              <button type="button" onClick={() => { setMode("login"); setError(""); }} className="sf-modal-link sf-link-button">
                {t("Log in")}
              </button>
            </>
          )}
        </p>
      </>
    );
  }

  // ── Step 2: Email/password form ──
  return modalShell(
    <>
      <div className="sf-modal-head sf-auth-step-head">
        <span className="sf-tag-mono">{mode === "login" ? t("Welcome back") : t("Get started")}</span>
        <h2>{mode === "login" ? t("Log in", "Masuk") : t("Create an account", "Buat akun")}</h2>
        <p>
          {mode === "register"
            ? t("Continue with your email address.", "Lanjutkan dengan alamat email Anda.")
            : t("Sign in with your email and password.", "Masuk dengan email dan kata sandi Anda.")}
        </p>
      </div>

        <form onSubmit={mode === "login" ? handleSignIn : handleSignUp} className="sf-modal-form">

        {/* Clerk CAPTCHA widget container (required for bot protection in Custom Flows) */}
        {mode === "register" && <div id="clerk-captcha" />}

        {/* E-mail */}
        <label className="sf-field">
          <span>E-mail (*)</span>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setNeedsSecureSignIn(false); setNeedsPasswordReset(false); }}
            required
          />
        </label>

        {/* Account type toggles (register only) — shown in step 2 only if coming back to change */}
        {mode === "register" && (
          <div className="sf-su-opts sf-su-opts-compact">
            <button type="button" className={`sf-su-opt ${accountType === "company" ? "on" : ""}`} onClick={() => setAccountType("company")}>
              <div className="sf-su-opt-top">
                <span className="sf-su-opt-title">Company</span>
                <span className={`sf-switch ${accountType === "company" ? "on" : ""}`} aria-hidden="true"><span className="sf-switch-knob" /></span>
              </div>
              <span className="sf-su-opt-sub">Create a profile page</span>
            </button>

            <button type="button" className={`sf-su-opt ${accountType === "individual" ? "on" : ""}`} onClick={() => setAccountType("individual")}>
              <div className="sf-su-opt-top">
                <span className="sf-su-opt-title">Individual</span>
                <span className={`sf-switch ${accountType === "individual" ? "on" : ""}`} aria-hidden="true"><span className="sf-switch-knob" /></span>
              </div>
              <span className="sf-su-opt-sub">Save listings</span>
            </button>
          </div>
        )}

        {/* Name or Company Name (register only) */}
        {mode === "register" && (
          <label className="sf-field">
            <span>{accountType === "company" ? "Company name" : "Name"} (*)</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
        )}

        {/* Password */}
        <label className="sf-field">
          <span>Password (*)</span>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setNeedsSecureSignIn(false); setNeedsPasswordReset(false); }}
            required
          />
        </label>

        {/* Subscribe to newsletter (register only) */}
        {mode === "register" && (
          <button type="button" className={`sf-su-news ${subscribeNewsletter ? "on" : ""}`} onClick={() => setSubscribeNewsletter(!subscribeNewsletter)}>
            <span>Subscribe to the newsletter</span>
            <span className={`sf-switch ${subscribeNewsletter ? "on" : ""}`} aria-hidden="true"><span className="sf-switch-knob" /></span>
          </button>
        )}

        {!needsSecureSignIn && (
            <button type="submit" disabled={isLoading} className="sf-btn sf-btn-pri sf-btn-lg sf-auth-email-btn">
              {isLoading
                ? t("Loading...", "Memuat...")
                : mode === "login" ? t("Login", "Masuk") : t("Register", "Daftar")
              }
            </button>
        )}

        {/* Error message — right below button for visibility */}
        {error && <p className="sf-auth-note">*{error}</p>}

        {mode === "login" && needsPasswordReset && (
            <button type="button" onClick={handleForgotPassword} disabled={isLoading} className="sf-btn sf-btn-ghost sf-auth-email-btn">
              Reset password
            </button>
        )}

        {needsSecureSignIn && (
            <button type="button" onClick={handleSecureSignIn} className="sf-btn sf-btn-ghost sf-auth-email-btn">
              Continue secure sign in
            </button>
        )}

        {/* Forgot password (login only) */}
        {mode === "login" && (
          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={isLoading}
            className="sf-modal-link sf-link-button sf-auth-inline-link"
          >
            Forgot password
          </button>
        )}

        {/* Switch mode */}
        {mode === "login" && (
          <p className="sf-modal-foot sf-auth-alt-foot">
            <button
              type="button"
              onClick={() => { setStep("method"); setError(""); }}
              className="sf-modal-link sf-link-button"
            >
              ← Other options
            </button>
          </p>
        )}
      </form>
    </>
  );
}
