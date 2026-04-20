"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import { useConvex, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { OAuthStrategy } from "@clerk/types";
import {
  AD_VERTICAL_PLATFORM_SETTING_KEY,
  resolveMediaSetting,
} from "@/lib/platform-settings.mjs";
import {
  getAuthStatusMessage,
  getVerificationErrorMessage,
  isVerificationCodeComplete,
  sanitizeVerificationCode,
} from "@/lib/auth-verification.mjs";

type AuthMode = "login" | "register";
type AccountType = "company" | "individual";
type AuthStep = "method" | "email";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
  initialAccountType?: AccountType;
  onAuthSuccess?: (accountType: AccountType) => void;
}

// Pill toggle switch component
// Toggle sized to match the filter dropdown toggles (24×12px, 8×8px thumb)
function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      style={{
        width: '24px',
        height: '12px',
        borderRadius: '6px',
        background: checked ? 'linear-gradient(to left, #F14110, #E9A28E)' : 'rgba(51,51,51,0.25)',
        position: 'relative',
        border: 'none',
        cursor: 'pointer',
        transition: 'background 0.2s ease',
        flexShrink: 0,
      }}
    >
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: 'white',
        position: 'absolute',
        top: '2px',
        left: checked ? '14px' : '2px',
        transition: 'left 0.2s ease',
      }} />
    </button>
  );
}

function SocialButton({ label, icon, onClick, disabled }: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        height: '38px',
        borderRadius: '6px',
        border: '1px solid #E4E4E4',
        backgroundColor: hovered ? '#F0F0F0' : 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background-color 0.15s ease',
        fontSize: '12px',
        fontWeight: 500,
        color: '#333',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {icon}
      {label}
    </button>
  );
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

function AppleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#333">
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <rect x="1" y="1" width="10" height="10" fill="#F25022"/>
      <rect x="13" y="1" width="10" height="10" fill="#7FBA00"/>
      <rect x="1" y="13" width="10" height="10" fill="#00A4EF"/>
      <rect x="13" y="13" width="10" height="10" fill="#FFB900"/>
    </svg>
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
  const { signIn, setActive: setSignInActive, isLoaded: isSignInLoaded } = useSignIn();
  const { signUp, setActive: setSignUpActive, isLoaded: isSignUpLoaded } = useSignUp();
  const convex = useConvex();
  const verticalAdValue = useQuery(api.platformSettings.get, { key: AD_VERTICAL_PLATFORM_SETTING_KEY });
  const verticalAdState = resolveMediaSetting(verticalAdValue, { url: "", type: "image" });
  const verticalAdMedia = verticalAdState.media;

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [accountType, setAccountType] = useState<AccountType>(initialAccountType);
  const [step, setStep] = useState<AuthStep>("method");
  const [closeHovered, setCloseHovered] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(false);
  const [submitHovered, setSubmitHovered] = useState(false);

  // Clerk flow states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [pendingReset, setPendingReset] = useState(false);
  const [newPassword, setNewPassword] = useState("");

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
    setStep("method");
  }, [mode]);

  if (!isOpen) return null;

  const handleSocialAuth = async (strategy: OAuthStrategy) => {
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

      if (result.status === "complete" && setSignInActive) {
        await setSignInActive({ session: result.createdSessionId });
        if (onAuthSuccess) onAuthSuccess(accountType);
        onClose();
        router.push(accountType === "company" ? "/company-dashboard" : "/dashboard");
        return;
      }

      setError(
        getAuthStatusMessage(result.status, {
          fallbackMessage: "Login requires additional verification before it can continue.",
          needsSecondFactorMessage:
            "This account requires two-factor authentication. The current popup cannot complete the second step yet.",
        })
      );
    } catch (err: unknown) {
      const clerkError = err as { errors?: Array<{ message: string }> };
      setError(clerkError.errors?.[0]?.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
        router.push(accountType === "company" ? "/company-dashboard" : "/dashboard");
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
      const clerkError = err as { errors?: Array<{ message: string }> };
      setError(clerkError.errors?.[0]?.message || "Failed to send reset code.");
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
  const modalShell = (content: React.ReactNode) => (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(51, 51, 51, 0.85)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'relative',
          display: 'flex',
          width: '100%',
          maxWidth: '500px',
          height: '500px',
          borderRadius: '6px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          margin: '0 16px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── LEFT: Ad space — hidden on mobile ── */}
        <div className="hidden sm:flex" style={{
          width: '150px',
          flexShrink: 0,
          backgroundColor: '#D9D9D9',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {verticalAdMedia.url ? (
            verticalAdMedia.type === 'video' ? (
              <video src={verticalAdMedia.url} className="w-full h-full object-cover" muted autoPlay loop playsInline />
            ) : (
              <Image
                src={verticalAdMedia.url}
                alt="Advertisement"
                fill
                className="object-cover"
                unoptimized={verticalAdMedia.url.startsWith('data:')}
              />
            )
          ) : verticalAdState.isLoading ? (
            <div className="w-full h-full bg-[#e4e4e4]" />
          ) : (
            <span style={{ color: '#999', fontSize: '10px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase' }}>
              AD SPACE
            </span>
          )}
        </div>

        {/* ── RIGHT: Content ── */}
        <div style={{
          flex: 1,
          backgroundColor: '#F8F8F8',
          padding: '20px 28px',
          position: 'relative',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          {/* Close button */}
          <button
            onClick={onClose}
            onMouseEnter={() => setCloseHovered(true)}
            onMouseLeave={() => setCloseHovered(false)}
            style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: closeHovered ? '#F14110' : '#999', lineHeight: 1, transition: 'color 0.15s ease', zIndex: 1 }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>

          {content}
        </div>
      </div>
    </div>
  );

  // ── Email verification view ──
  if (pendingVerification) {
    return modalShell(
      <>
        <button
          type="button"
          onClick={() => { setPendingVerification(false); setError(""); }}
          style={{ position: 'absolute', top: '18px', left: '28px', background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: '11px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px', zIndex: 1 }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M6.5 1.5L3 5L6.5 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>

        <div style={{ width: '100%', maxWidth: '320px', margin: '0 auto', paddingTop: '28px' }}>
          <h2 style={{ textAlign: 'center', fontSize: '18px', fontWeight: 600, color: '#333', letterSpacing: '0.36px', fontFamily: 'var(--font-sora), sans-serif', marginBottom: '6px', marginTop: 0 }}>
            VERIFY EMAIL
          </h2>

          <p style={{ textAlign: 'center', fontSize: '9px', color: '#999', lineHeight: 1.5, marginBottom: '20px', marginTop: 0 }}>
            We sent a verification code to<br /><strong style={{ color: '#333' }}>{email}</strong>
          </p>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: '#333', marginBottom: '5px', letterSpacing: '0.22px' }}>
              Verification Code
            </label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={verificationCode}
              onChange={(e) => setVerificationCode(sanitizeVerificationCode(e.target.value))}
              placeholder="Enter 6-digit code"
              style={{ width: '100%', height: '38px', backgroundColor: 'white', border: '1px solid #E4E4E4', borderRadius: '6px', padding: '0 10px', fontSize: '12px', color: '#333', outline: 'none', boxSizing: 'border-box', textAlign: 'center', letterSpacing: '4px' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '28px', marginBottom: '12px' }}>
            <button
              type="button"
              disabled={isLoading}
              onClick={handleVerifyEmail}
              onMouseEnter={() => setSubmitHovered(true)}
              onMouseLeave={() => setSubmitHovered(false)}
              style={{
                width: '145px',
                height: '40px',
                borderRadius: '20px',
                border: submitHovered ? 'none' : '1px solid #F14110',
                background: submitHovered ? 'linear-gradient(to right, #E9A28E, #F14110)' : 'transparent',
                color: submitHovered ? 'white' : '#F14110',
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '0.5px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              {isLoading ? "Verifying..." : "Verify"}
            </button>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '12px' }}>
            <button
              type="button"
              disabled={isLoading}
              onClick={handleResendVerificationCode}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                color: '#F14110',
                fontSize: '10px',
                fontWeight: 600,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              {isLoading ? 'Sending...' : 'Request a new code'}
            </button>
          </div>

          {error && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#F14110', fontSize: '9px', margin: '2px 0' }}>*{error}</p>
            </div>
          )}
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
          style={{ position: 'absolute', top: '18px', left: '28px', background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: '11px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px', zIndex: 1 }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M6.5 1.5L3 5L6.5 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>

        <div style={{ width: '100%', maxWidth: '320px', margin: '0 auto', paddingTop: '28px' }}>
          <h2 style={{ textAlign: 'center', fontSize: '18px', fontWeight: 600, color: '#333', letterSpacing: '0.36px', fontFamily: 'var(--font-sora), sans-serif', marginBottom: '6px', marginTop: 0 }}>
            RESET PASSWORD
          </h2>

          <p style={{ textAlign: 'center', fontSize: '9px', color: '#999', lineHeight: 1.5, marginBottom: '12px', marginTop: 0 }}>
            Enter the code sent to<br /><strong style={{ color: '#333' }}>{email}</strong><br />and your new password.
          </p>

          <form onSubmit={handleResetPassword}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: '#333', marginBottom: '5px', letterSpacing: '0.22px' }}>
                Verification Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(sanitizeVerificationCode(e.target.value))}
                placeholder="Enter 6-digit code"
                required
                style={{ width: '100%', height: '38px', backgroundColor: 'white', border: '1px solid #E4E4E4', borderRadius: '6px', padding: '0 10px', fontSize: '12px', color: '#333', outline: 'none', boxSizing: 'border-box', textAlign: 'center', letterSpacing: '4px' }}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: '#333', marginBottom: '5px', letterSpacing: '0.22px' }}>
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                style={{ width: '100%', height: '38px', backgroundColor: 'white', border: '1px solid #E4E4E4', borderRadius: '6px', padding: '0 10px', fontSize: '12px', color: '#333', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '28px', marginBottom: '12px' }}>
              <button
                type="submit"
                disabled={isLoading}
                onMouseEnter={() => setSubmitHovered(true)}
                onMouseLeave={() => setSubmitHovered(false)}
                style={{
                  width: '145px',
                  height: '40px',
                  borderRadius: '20px',
                  border: submitHovered ? 'none' : '1px solid #F14110',
                  background: submitHovered ? 'linear-gradient(to right, #E9A28E, #F14110)' : 'transparent',
                  color: submitHovered ? 'white' : '#F14110',
                  fontSize: '13px',
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: isLoading ? 0.6 : 1,
                }}
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </form>

          <div style={{ textAlign: 'center', marginBottom: '12px' }}>
            <button
              type="button"
              disabled={isLoading}
              onClick={handleResendResetCode}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                color: '#F14110',
                fontSize: '10px',
                fontWeight: 600,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              {isLoading ? 'Sending...' : 'Request a new code'}
            </button>
          </div>

          {error && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#F14110', fontSize: '9px', margin: '2px 0' }}>*{error}</p>
            </div>
          )}
        </div>
      </>
    );
  }

  // ── Step 1: Method selection ──
  if (step === "method") {
    return modalShell(
      <>
        <h2 style={{ textAlign: 'center', fontSize: '18px', fontWeight: 600, color: '#333', letterSpacing: '0.36px', fontFamily: 'var(--font-sora), sans-serif', marginBottom: '6px', marginTop: 0 }}>
          {mode === "login" ? "LOGIN" : "CREATE AN ACCOUNT"}
        </h2>

        <p style={{ textAlign: 'center', fontSize: '9px', color: '#999', lineHeight: 1.5, marginBottom: '16px', marginTop: 0 }}>
          {mode === "register" ? (
            <>Welcome to the best Bali Directory.<br />Selamat datang di direktori Bali terbaik.</>
          ) : (
            <>Welcome back!<br />Selamat Datang kembali!</>
          )}
        </p>

        {/* Account type toggle (register only) */}
        {mode === "register" && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 500, color: '#333', letterSpacing: '0.22px', fontFamily: 'var(--font-sora), sans-serif' }}>COMPANY</span>
                <Toggle
                  checked={accountType === "company"}
                  onChange={() => setAccountType("company")}
                />
              </div>
              <p style={{ fontSize: '9px', color: '#999', margin: 0, lineHeight: 1.4 }}>
                Create a profile page/<br />Buat halaman
              </p>
            </div>

            <div style={{ textAlign: 'left', marginLeft: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 500, color: '#333', letterSpacing: '0.22px', fontFamily: 'var(--font-sora), sans-serif' }}>INDIVIDUAL</span>
                <Toggle
                  checked={accountType === "individual"}
                  onChange={() => setAccountType("individual")}
                />
              </div>
              <p style={{ fontSize: '9px', color: '#999', margin: 0, lineHeight: 1.4 }}>
                Save listings/<br />Simpan daftar
              </p>
            </div>
          </div>
        )}

        {/* Social auth buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
          <SocialButton
            label="Continue with Google"
            icon={<GoogleIcon />}
            onClick={() => handleSocialAuth("oauth_google")}
            disabled={isLoading}
          />
          <SocialButton
            label="Continue with Apple"
            icon={<AppleIcon />}
            onClick={() => handleSocialAuth("oauth_apple")}
            disabled={isLoading}
          />
          <SocialButton
            label="Continue with Microsoft"
            icon={<MicrosoftIcon />}
            onClick={() => handleSocialAuth("oauth_microsoft")}
            disabled={isLoading}
          />
        </div>

        {/* OR divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#E4E4E4' }} />
          <span style={{ fontSize: '10px', color: '#999', fontWeight: 500, letterSpacing: '0.5px' }}>OR</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#E4E4E4' }} />
        </div>

        {/* Continue with email button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
          <button
            type="button"
            onClick={() => { setStep("email"); setError(""); }}
            onMouseEnter={() => setSubmitHovered(true)}
            onMouseLeave={() => setSubmitHovered(false)}
            style={{
              width: '100%',
              height: '40px',
              borderRadius: '20px',
              border: submitHovered ? 'none' : '1px solid #F14110',
              background: submitHovered ? 'linear-gradient(to right, #E9A28E, #F14110)' : 'transparent',
              color: submitHovered ? 'white' : '#F14110',
              fontSize: '13px',
              fontWeight: 600,
              letterSpacing: '0.5px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Continue with email
          </button>
        </div>

        {error && (
          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <p style={{ color: '#F14110', fontSize: '11px', fontWeight: 500, margin: '4px 0' }}>*{error}</p>
          </div>
        )}

        {/* Switch mode */}
        <p style={{ textAlign: 'center', fontSize: '10px', color: '#999', margin: 0 }}>
          {mode === "login" ? (
            <>
              Don&apos;t have an account?
              <br />
              <button onClick={() => { setMode("register"); setError(""); }} style={{ color: '#F14110', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', letterSpacing: '0.22px', marginTop: '4px', textDecoration: 'underline' }}>
                Sign up!
              </button>
            </>
          ) : (
            <>
              Already have an account?
              <br />
              <button onClick={() => { setMode("login"); setError(""); }} style={{ color: '#F14110', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', letterSpacing: '0.22px', marginTop: '4px', textDecoration: 'underline' }}>
                Log in
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
      {/* Back to method selection */}
      <button
        type="button"
        onClick={() => { setStep("method"); setError(""); }}
        style={{ position: 'absolute', top: '18px', left: '28px', background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: '11px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px', zIndex: 1 }}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M6.5 1.5L3 5L6.5 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back
      </button>

      <div style={{ width: '100%', maxWidth: '320px', margin: '0 auto', paddingTop: '28px' }}>
        <h2 style={{ textAlign: 'center', fontSize: '18px', fontWeight: 600, color: '#333', letterSpacing: '0.36px', fontFamily: 'var(--font-sora), sans-serif', marginBottom: '6px', marginTop: 0 }}>
          {mode === "login" ? "LOGIN" : "CREATE AN ACCOUNT"}
        </h2>

        <p style={{ textAlign: 'center', fontSize: '9px', color: '#999', lineHeight: 1.5, marginBottom: '12px', marginTop: 0 }}>
          {mode === "register" ? (
            <>Continue with your email address.<br />Lanjutkan dengan alamat email Anda.</>
          ) : (
            <>Sign in with your email and password.<br />Masuk dengan email dan kata sandi Anda.</>
          )}
        </p>

        <form onSubmit={mode === "login" ? handleSignIn : handleSignUp} style={{ marginBottom: 0 }}>

        {/* Clerk CAPTCHA widget container (required for bot protection in Custom Flows) */}
        {mode === "register" && <div id="clerk-captcha" />}

        {/* E-mail */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: '#333', marginBottom: '5px', letterSpacing: '0.22px' }}>
            E-mail <span style={{ color: '#F14110' }}>(*)</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', height: '38px', backgroundColor: 'white', border: '1px solid #E4E4E4', borderRadius: '6px', padding: '0 10px', fontSize: '12px', color: '#333', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        {/* Account type toggles (register only) — shown in step 2 only if coming back to change */}
        {mode === "register" && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 500, color: '#333', letterSpacing: '0.22px', fontFamily: 'var(--font-sora), sans-serif' }}>COMPANY</span>
                <Toggle
                  checked={accountType === "company"}
                  onChange={() => setAccountType("company")}
                />
              </div>
              <p style={{ fontSize: '9px', color: '#999', margin: 0, lineHeight: 1.4 }}>
                Create a profile page/<br />Buat halaman
              </p>
            </div>

            <div style={{ textAlign: 'left', marginLeft: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 500, color: '#333', letterSpacing: '0.22px', fontFamily: 'var(--font-sora), sans-serif' }}>INDIVIDUAL</span>
                <Toggle
                  checked={accountType === "individual"}
                  onChange={() => setAccountType("individual")}
                />
              </div>
              <p style={{ fontSize: '9px', color: '#999', margin: 0, lineHeight: 1.4 }}>
                Save listings/<br />Simpan daftar
              </p>
            </div>
          </div>
        )}

        {/* Name or Company Name (register only) */}
        {mode === "register" && (
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: '#333', marginBottom: '5px', letterSpacing: '0.22px' }}>
              {accountType === "company" ? "Company Name" : "Name"} <span style={{ color: '#F14110' }}>(*)</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ width: '100%', height: '38px', backgroundColor: 'white', border: '1px solid #E4E4E4', borderRadius: '6px', padding: '0 10px', fontSize: '12px', color: '#333', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        )}

        {/* Password */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: '#333', marginBottom: '5px', letterSpacing: '0.22px' }}>
            Password <span style={{ color: '#F14110' }}>(*)</span>
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', height: '38px', backgroundColor: 'white', border: '1px solid #E4E4E4', borderRadius: '6px', padding: '0 10px', fontSize: '12px', color: '#333', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        {/* Subscribe to newsletter (register only) */}
        {mode === "register" && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '9px' }}>
            <span style={{ fontSize: '11px', color: '#333', letterSpacing: '0.22px' }}>Subscribe to newsletter</span>
            <Toggle
              checked={subscribeNewsletter}
              onChange={() => setSubscribeNewsletter(!subscribeNewsletter)}
            />
          </div>
        )}

        {/* Register / Login button — 145×40, centered, gradient on hover only */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: mode === 'login' ? '28px' : '14px', marginBottom: '12px' }}>
        <button
          type="submit"
          disabled={isLoading}
          onMouseEnter={() => setSubmitHovered(true)}
          onMouseLeave={() => setSubmitHovered(false)}
          style={{
            width: '145px',
            height: '40px',
            borderRadius: '20px',
            border: submitHovered ? 'none' : '1px solid #F14110',
            background: submitHovered ? 'linear-gradient(to right, #E9A28E, #F14110)' : 'transparent',
            color: submitHovered ? 'white' : '#F14110',
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '0.5px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            opacity: isLoading ? 0.6 : 1,
          }}
        >
          {isLoading
            ? "Loading..."
            : mode === "login" ? "Login" : "Register"
          }
        </button>
        </div>

        {/* Error message — right below button for visibility */}
        {error && (
          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <p style={{ color: '#F14110', fontSize: '11px', fontWeight: 500, margin: '4px 0' }}>*{error}</p>
          </div>
        )}

        {/* Forgot password (login only) */}
        {mode === "login" && (
          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={isLoading}
            style={{ display: 'block', width: '100%', textAlign: 'center', fontSize: '11px', color: '#F14110', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', marginBottom: '8px' }}
          >
            Forgot Password
          </button>
        )}

        {/* Switch mode */}
        {mode === "login" && (
          <p style={{ textAlign: 'center', fontSize: '10px', color: '#999', margin: 0 }}>
            Don&apos;t have an account?
            <br />
            <button onClick={() => { setMode("register"); setError(""); }} style={{ color: '#F14110', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', letterSpacing: '0.22px', marginTop: '4px', textDecoration: 'underline' }}>
              Sign up!
            </button>
          </p>
        )}
      </form>
      </div>
    </>
  );
}
