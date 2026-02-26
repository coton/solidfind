"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type AuthMode = "login" | "register";
type AccountType = "company" | "individual";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
  initialAccountType?: AccountType;
  onAuthSuccess?: (accountType: AccountType) => void;
}

// Pill toggle switch component
function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      style={{
        width: '36px',
        height: '20px',
        borderRadius: '10px',
        background: checked ? 'linear-gradient(to right, #E9A28E, #F14110)' : '#ccc',
        position: 'relative',
        border: 'none',
        cursor: 'pointer',
        transition: 'background 0.2s ease',
        flexShrink: 0,
      }}
    >
      <div style={{
        width: '14px',
        height: '14px',
        borderRadius: '50%',
        backgroundColor: 'white',
        position: 'absolute',
        top: '3px',
        left: checked ? '19px' : '3px',
        transition: 'left 0.2s ease',
      }} />
    </button>
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
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [accountType, setAccountType] = useState<AccountType>(initialAccountType);
  const [closeHovered, setCloseHovered] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(false);
  const [validationError, setValidationError] = useState(false);
  const [submitHovered, setSubmitHovered] = useState(false);

  // Sync when props change (e.g. re-opening with different defaults)
  useEffect(() => { setMode(initialMode); }, [initialMode]);
  useEffect(() => { setAccountType(initialAccountType); }, [initialAccountType]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setValidationError(true); return; }
    setValidationError(false);
    localStorage.setItem("userType", accountType);
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userEmail", email);
    if (onAuthSuccess) onAuthSuccess(accountType);
    onClose();
    router.push(accountType === "company" ? "/company-dashboard" : "/dashboard");
  };

  return (
    // Overlay: #333 at 85% opacity
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
      {/* Modal container */}
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
        }}>
          <span style={{ color: '#999', fontSize: '10px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase' }}>
            AD SPACE
          </span>
        </div>

        {/* ── RIGHT: Form ── */}
        <div style={{
          flex: 1,
          backgroundColor: '#F8F8F8',
          padding: '32px 28px',
          position: 'relative',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: mode === 'login' ? 'center' : 'flex-start',
        }}>

          {/* Close button */}
          <button
            onClick={onClose}
            onMouseEnter={() => setCloseHovered(true)}
            onMouseLeave={() => setCloseHovered(false)}
            style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: closeHovered ? '#F14110' : '#999', lineHeight: 1, transition: 'color 0.15s ease' }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>

          {/* Title */}
          <h2 style={{ textAlign: 'center', fontSize: '16px', fontWeight: 700, color: '#333', letterSpacing: '0.5px', marginBottom: '6px', marginTop: 0 }}>
            {mode === "login" ? "LOGIN" : "CREATE AN ACCOUNT"}
          </h2>

          {/* Subtitle */}
          <p style={{ textAlign: 'center', fontSize: '9px', color: '#999', lineHeight: 1.5, marginBottom: '20px', marginTop: 0 }}>
            {mode === "register" ? (
              <>Welcome to the best Bali Directory.<br />Selamat datang di direktori Bali terbaik.</>
            ) : (
              <>Welcome back!<br />Selamat Datang kembali!</>
            )}
          </p>

          <form onSubmit={handleSubmit} style={{ marginBottom: 0 }}>

            {/* E-mail */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: '#333', marginBottom: '5px', letterSpacing: '0.22px' }}>
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%', height: '38px', backgroundColor: 'white', border: '1px solid #E4E4E4', borderRadius: '6px', padding: '0 10px', fontSize: '12px', color: '#333', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* COMPANY / INDIVIDUAL toggles (register only) */}
            {mode === "register" && (
              <div style={{ display: 'flex', gap: '20px', marginBottom: '14px', alignItems: 'flex-start' }}>
                {/* Company */}
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

                {/* Individual */}
                <div>
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
                  Name or Company Name
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
                Password
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '18px' }}>
                <span style={{ fontSize: '11px', color: '#333', letterSpacing: '0.22px' }}>Subscribe to newsletter</span>
                <Toggle
                  checked={subscribeNewsletter}
                  onChange={() => setSubscribeNewsletter(!subscribeNewsletter)}
                />
              </div>
            )}

            {/* Register / Login button — 145×40, centered, gradient on hover only */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '28px', marginBottom: '12px' }}>
            <button
              type="submit"
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
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {mode === "login" ? "Login" : "Register"}
            </button>
            </div>

            {/* Forgot password (login only) */}
            {mode === "login" && (
              <button type="button" style={{ display: 'block', width: '100%', textAlign: 'center', fontSize: '11px', color: '#F14110', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', marginBottom: '8px' }}>
                Forgot Password
              </button>
            )}
          </form>

          {/* Switch mode */}
          <p style={{ textAlign: 'center', fontSize: '10px', color: '#999', margin: '0 0 10px 0' }}>
            {mode === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <button onClick={() => { setMode("register"); setValidationError(false); }} style={{ color: '#F14110', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: '10px' }}>
                  Sign up!
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button onClick={() => { setMode("login"); setValidationError(false); }} style={{ color: '#333', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: '10px' }}>
                  Log in
                </button>
              </>
            )}
          </p>

          {/* Validation error */}
          {validationError && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#F14110', fontSize: '9px', margin: '2px 0' }}>*Please fill in all fields</p>
              <p style={{ color: '#F14110', fontSize: '9px', margin: '2px 0' }}>*Mohon isi semua kolom teks</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
