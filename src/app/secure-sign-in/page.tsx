"use client";

import { useSignIn } from "@clerk/nextjs";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAuthStatusMessage, getVerificationErrorMessage, isVerificationCodeComplete, sanitizeVerificationCode } from "@/lib/auth-verification.mjs";
import { sanitizeNextPath } from "@/lib/magic-link-login.mjs";
import { useSiteLanguage } from "@/components/LanguageProvider";

export default function SecureSignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, setActive, isLoaded } = useSignIn();
  const { t } = useSiteLanguage();
  const identifier = searchParams.get("identifier")?.trim() || "";
  const nextPath = useMemo(() => sanitizeNextPath(searchParams.get("next")) || "/auth-complete", [searchParams]);
  const language = searchParams.get("lang") === "id" ? "id" : "en";
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const hasPrepared = useRef(false);

  const emailFactor = useMemo(() => {
    return signIn?.supportedSecondFactors?.find(
      (factor) => factor.strategy === "email_code"
    );
  }, [signIn?.supportedSecondFactors]);
  const safeIdentifier = emailFactor && "safeIdentifier" in emailFactor ? emailFactor.safeIdentifier : identifier;

  useEffect(() => {
    if (!isLoaded || !signIn || hasPrepared.current) return;
    const signInStatus = signIn.status as string | null;

    if (signInStatus !== "needs_second_factor" && signInStatus !== "needs_client_trust") {
      setError(
        language === "id"
          ? "Mulai secure sign in dari pop-up login."
          : "Please start secure sign in from the login pop-up."
      );
      return;
    }

    if (!emailFactor) {
      setError(
        language === "id"
          ? "Metode secure sign in ini tidak tersedia untuk akun ini."
          : "This secure sign in method is not available for this account."
      );
      return;
    }

    hasPrepared.current = true;
    void signIn.prepareSecondFactor({
      strategy: "email_code",
      emailAddressId: "emailAddressId" in emailFactor ? emailFactor.emailAddressId : undefined,
    }).catch((clerkError) => {
      hasPrepared.current = false;
      setError(
        getVerificationErrorMessage(clerkError, {
          fallbackMessage:
            language === "id"
              ? "Tidak dapat mengirim kode secure sign in. Silakan coba lagi."
              : "Unable to send the secure sign-in code. Please try again.",
          expiredMessage:
            language === "id"
              ? "Kode ini kedaluwarsa. Silakan minta kode baru di bawah."
              : "This code expired. Please request a new one below.",
        })
      );
    });
  }, [emailFactor, isLoaded, language, signIn]);

  const handleSubmit = async () => {
    if (!signIn || !setActive) return;

    const normalizedCode = sanitizeVerificationCode(code);
    if (!isVerificationCodeComplete(normalizedCode)) {
      setError(language === "id" ? "Masukkan kode verifikasi 6 digit." : "Please enter the 6-digit verification code.");
      return;
    }

    setIsBusy(true);
    setError("");
    try {
      const result = await signIn.attemptSecondFactor({
        strategy: "email_code",
        code: normalizedCode,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace(nextPath);
        return;
      }

      setError(
        getAuthStatusMessage(result.status, {
          fallbackMessage:
            language === "id"
              ? "Secure sign in memerlukan langkah tambahan sebelum dapat dilanjutkan."
              : "Secure sign in needs another step before it can continue.",
        })
      );
    } catch (clerkError) {
      setError(
        getVerificationErrorMessage(clerkError, {
          fallbackMessage:
            language === "id" ? "Kode verifikasi tidak valid." : "Invalid verification code.",
          expiredMessage:
            language === "id"
              ? "Kode ini kedaluwarsa. Silakan minta kode baru di bawah."
              : "This code expired. Please request a new one below.",
        })
      );
    } finally {
      setIsBusy(false);
    }
  };

  const handleResend = async () => {
    if (!signIn || !emailFactor) return;

    setIsBusy(true);
    setError("");
    try {
      await signIn.prepareSecondFactor({
        strategy: "email_code",
        emailAddressId: "emailAddressId" in emailFactor ? emailFactor.emailAddressId : undefined,
      });
    } catch (clerkError) {
      setError(
        getVerificationErrorMessage(clerkError, {
          fallbackMessage:
            language === "id"
              ? "Gagal mengirim ulang kode secure sign in."
              : "Failed to resend the secure sign-in code.",
          expiredMessage:
            language === "id"
              ? "Kode sebelumnya kedaluwarsa. Kode baru belum bisa dikirim. Silakan coba lagi."
              : "Your previous code expired. A fresh code could not be sent yet. Please try again.",
        })
      );
    } finally {
      setIsBusy(false);
    }
  };

  const handleOtherOptions = () => {
    const params = new URLSearchParams();
    params.set("next", nextPath);
    router.replace(`/sign-in?${params.toString()}`);
  };

  return (
    <main className="min-h-screen bg-[#f8f8f8]">
      <div className="sf-modal-scrim open">
        <div className="sf-modal sf-auth-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
          <button type="button" className="sf-modal-x" onClick={handleOtherOptions} aria-label="Close">×</button>
          <div className="sf-modal-head sf-auth-step-head">
            <span className="sf-tag-mono">{t("Welcome back", "Selamat datang kembali")}</span>
            <h2>{t("Secure sign in", "Secure sign in")}</h2>
            <p>{t("Complete the extra verification step to access your SolidFind account.", "Selesaikan langkah verifikasi tambahan untuk mengakses akun SolidFind Anda.")}</p>
          </div>

          <form
            className="sf-modal-form"
            onSubmit={(event) => {
              event.preventDefault();
              void handleSubmit();
            }}
          >
            <label className="sf-field">
              <span>{t("Verification Code", "Kode verifikasi")}</span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(event) => setCode(sanitizeVerificationCode(event.target.value))}
                placeholder={t("Enter 6-digit code", "Masukkan 6 digit kode")}
                className="sf-code-input"
              />
            </label>

            <p className="sf-auth-note" style={{ marginTop: -8, marginBottom: 0 }}>
              {t("We sent the code to", "Kami mengirim kode ke")} <b>{safeIdentifier || t("your email", "email Anda")}</b>
            </p>

            {error && <p className="sf-auth-note">*{error}</p>}

            <button type="submit" disabled={isBusy || !isLoaded} className="sf-btn sf-btn-pri sf-btn-lg sf-auth-email-btn">
              {isBusy ? t("Verifying...", "Memverifikasi...") : t("Continue", "Lanjutkan")}
            </button>

            <button
              type="button"
              disabled={isBusy || !emailFactor}
              onClick={handleResend}
              className="sf-modal-link sf-link-button sf-auth-inline-link"
            >
              {t("Request a new code", "Minta kode baru")}
            </button>

            <p className="sf-modal-foot sf-auth-alt-foot">
              <button type="button" onClick={handleOtherOptions} className="sf-modal-link sf-link-button sf-auth-other">
                ← {t("Other options", "Opsi lain")}
              </button>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
