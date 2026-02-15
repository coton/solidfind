"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type AuthMode = "login" | "register";
type AccountType = "company" | "individual";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
  onAuthSuccess?: (accountType: AccountType) => void;
}

export function AuthModal({ isOpen, onClose, initialMode = "register", onAuthSuccess }: AuthModalProps) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [accountType, setAccountType] = useState<AccountType>("company");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(false);

  // Reset mode when initialMode changes
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mock authentication - in real app, this would call an API
    console.log({ mode, accountType, email, password, companyName, subscribeNewsletter });

    // Store user type in localStorage for demo purposes
    localStorage.setItem("userType", accountType);
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userEmail", email);

    // Call success callback if provided
    if (onAuthSuccess) {
      onAuthSuccess(accountType);
    }

    // Close modal
    onClose();

    // Redirect based on account type
    if (accountType === "company") {
      router.push("/company-dashboard");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#f8f8f8] w-full max-w-[400px] rounded-[6px] shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#333]/50 hover:text-[#333] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        <div className="p-8">
          {/* Title */}
          <h2 className="text-[18px] font-bold text-[#333] text-center mb-6 tracking-[0.36px]">
            {mode === "login" ? "LOGIN" : "CREATE AN ACCOUNT"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-[10px] font-medium text-[#333]/70 mb-1 tracking-[0.2px]">
                E-MAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-[#e4e4e4] rounded-[6px] text-[12px] text-[#333] outline-none focus:border-[#f14110] transition-colors"
                required
              />
            </div>

            {/* Account Type (Register only) */}
            {mode === "register" && (
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={accountType === "company"}
                    onChange={() => setAccountType("company")}
                    className="w-4 h-4 accent-[#f14110]"
                  />
                  <span className="text-[11px] font-medium text-[#333] tracking-[0.22px]">COMPANY</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={accountType === "individual"}
                    onChange={() => setAccountType("individual")}
                    className="w-4 h-4 accent-[#f14110]"
                  />
                  <span className="text-[11px] font-medium text-[#333] tracking-[0.22px]">INDIVIDUAL</span>
                </label>
              </div>
            )}

            {/* Company Name (Company only) */}
            {mode === "register" && accountType === "company" && (
              <div>
                <label className="block text-[10px] font-medium text-[#333]/70 mb-1 tracking-[0.2px]">
                  (COMPANY) NAME
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-[#e4e4e4] rounded-[6px] text-[12px] text-[#333] outline-none focus:border-[#f14110] transition-colors"
                  required={accountType === "company"}
                />
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-[10px] font-medium text-[#333]/70 mb-1 tracking-[0.2px]">
                PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-[#e4e4e4] rounded-[6px] text-[12px] text-[#333] outline-none focus:border-[#f14110] transition-colors"
                required
              />
            </div>

            {/* Newsletter (Register only) */}
            {mode === "register" && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={subscribeNewsletter}
                  onChange={(e) => setSubscribeNewsletter(e.target.checked)}
                  className="w-4 h-4 accent-[#f14110]"
                />
                <span className="text-[11px] text-[#333]/70 tracking-[0.22px]">Subscribe to newsletter</span>
              </label>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full h-10 bg-white border border-[#333] text-[#333] text-[12px] font-medium tracking-[0.24px] rounded-[6px] hover:bg-[#333] hover:text-white transition-colors"
            >
              {mode === "login" ? "LOGIN" : "REGISTER"}
            </button>

            {/* Forgot Password (Login only) */}
            {mode === "login" && (
              <button
                type="button"
                className="block w-full text-center text-[11px] text-[#f14110] underline tracking-[0.22px]"
              >
                Forgot Password
              </button>
            )}
          </form>

          {/* Switch Mode */}
          <div className="mt-6 text-center">
            {mode === "login" ? (
              <p className="text-[11px] text-[#333]/70 tracking-[0.22px]">
                Don&apos;t have an account?{" "}
                <button
                  onClick={() => setMode("register")}
                  className="text-[#333] underline font-medium"
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p className="text-[11px] text-[#333]/70 tracking-[0.22px]">
                Already have an account?{" "}
                <button
                  onClick={() => setMode("login")}
                  className="text-[#333] underline font-medium"
                >
                  Log in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
