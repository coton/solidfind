"use client";

import { useSignIn } from "@clerk/nextjs";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAuthStatusMessage, getVerificationErrorMessage, isVerificationCodeComplete, sanitizeVerificationCode } from "@/lib/auth-verification.mjs";
import { sanitizeNextPath } from "@/lib/magic-link-login.mjs";

export default function SecureSignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, setActive, isLoaded } = useSignIn();
  const identifier = searchParams.get("identifier")?.trim() || "";
  const nextPath = useMemo(() => sanitizeNextPath(searchParams.get("next")) || "/auth-complete", [searchParams]);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [submitHovered, setSubmitHovered] = useState(false);
  const [resendHovered, setResendHovered] = useState(false);
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
      setError("Please start secure sign in from the login pop-up.\nMulai secure sign in dari pop-up login.");
      return;
    }

    if (!emailFactor) {
      setError("This secure sign in method is not available for this account.\nMetode secure sign in ini tidak tersedia untuk akun ini.");
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
          fallbackMessage: "Unable to send the secure sign-in code. Please try again.",
          expiredMessage: "This code expired. Please request a new one below.",
        })
      );
    });
  }, [emailFactor, isLoaded, signIn]);

  const handleSubmit = async () => {
    if (!signIn || !setActive) return;

    const normalizedCode = sanitizeVerificationCode(code);
    if (!isVerificationCodeComplete(normalizedCode)) {
      setError("Please enter the 6-digit verification code.");
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
          fallbackMessage: "Secure sign in needs another step before it can continue.",
        })
      );
    } catch (clerkError) {
      setError(
        getVerificationErrorMessage(clerkError, {
          fallbackMessage: "Invalid verification code.",
          expiredMessage: "This code expired. Please request a new one below.",
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
          fallbackMessage: "Failed to resend the secure sign-in code.",
          expiredMessage: "Your previous code expired. A fresh code could not be sent yet. Please try again.",
        })
      );
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f8f8] px-4 py-10">
      <div className="w-full max-w-[420px]">
        <div className="mb-5 text-center">
          <h1 className="text-[24px] font-semibold tracking-[0.48px] text-[#333]">
            Secure sign in
          </h1>
          <p className="mt-2 text-[10px] leading-[16px] text-[#999]">
            Complete the extra verification step to access your SolidFind account.
            <br />
            Selesaikan langkah verifikasi tambahan untuk mengakses akun SolidFind Anda.
          </p>
        </div>

        <div className="rounded-[6px] bg-[#f8f8f8] px-7 py-8">
          <h2 className="text-center text-[18px] font-semibold tracking-[0.36px] text-[#333]">
            CHECK YOUR EMAIL
          </h2>
          <p className="mt-2 text-center text-[10px] leading-[15px] text-[#999]">
            Enter the verification code sent to
            <br />
            <strong className="text-[13px] font-medium text-[#333]">{safeIdentifier || "your email"}</strong>
          </p>

          <div className="mt-6">
            <label className="mb-[5px] block text-[11px] font-medium tracking-[0.22px] text-[#333]">
              Verification Code
            </label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(event) => setCode(sanitizeVerificationCode(event.target.value))}
              placeholder="Enter 6-digit code"
              className="h-[38px] w-full rounded-[6px] border border-[#e4e4e4] bg-white px-2.5 text-center text-[12px] tracking-[4px] text-[#333] outline-none"
            />
          </div>

          {error && (
            <p className="mt-3 whitespace-pre-line text-center text-[10px] leading-[15px] text-[#f14110]">
              *{error}
            </p>
          )}

          <div className="mt-7 flex justify-center">
            <button
              type="button"
              disabled={isBusy || !isLoaded}
              onClick={handleSubmit}
              onMouseEnter={() => setSubmitHovered(true)}
              onMouseLeave={() => setSubmitHovered(false)}
              className="h-10 w-[145px] rounded-full text-[13px] font-semibold tracking-[0.5px] transition-all disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                border: submitHovered ? "none" : "1px solid #F14110",
                background: submitHovered ? "linear-gradient(to right, #E9A28E, #F14110)" : "transparent",
                color: submitHovered ? "white" : "#F14110",
              }}
            >
              {isBusy ? "Verifying..." : "Continue"}
            </button>
          </div>

          <div className="mt-3 text-center">
            <button
              type="button"
              disabled={isBusy || !emailFactor}
              onClick={handleResend}
              onMouseEnter={() => setResendHovered(true)}
              onMouseLeave={() => setResendHovered(false)}
              className="bg-transparent text-[10px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              style={{ color: resendHovered ? "#333" : "#F14110" }}
            >
              Request a new code
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
