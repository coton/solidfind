// SolidFind — Login popup (two-step: options → email form)
function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path fill="#4285F4" d="M45.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h11.8c-.5 2.7-2 5-4.4 6.6v5.5h7.1c4.1-3.8 6.6-9.4 6.6-16.1z"/>
      <path fill="#34A853" d="M24 46c5.9 0 10.9-2 14.5-5.4l-7.1-5.5c-2 1.3-4.5 2.1-7.4 2.1-5.7 0-10.5-3.8-12.2-9H4.5v5.7C8.1 41.1 15.4 46 24 46z"/>
      <path fill="#FBBC05" d="M11.8 28.2c-.4-1.3-.7-2.7-.7-4.2s.3-2.9.7-4.2v-5.7H4.5C3 17.1 2.2 20.4 2.2 24s.8 6.9 2.3 9.9l7.3-5.7z"/>
      <path fill="#EA4335" d="M24 10.8c3.2 0 6.1 1.1 8.4 3.3l6.3-6.3C34.9 4.1 29.9 2 24 2 15.4 2 8.1 6.9 4.5 14.1l7.3 5.7c1.7-5.2 6.5-9 12.2-9z"/>
    </svg>
  );
}

function LoginModal({ open, onClose, onLogin, onSignup }) {
  const [step, setStep] = React.useState('options');
  React.useEffect(() => { if (open) setStep('options'); }, [open]);
  if (!open) return null;

  return (
    <div className="sf-modal-scrim" onClick={onClose}>
      <div className="sf-modal sf-modal-login" role="dialog" aria-modal="true" aria-label="Log in" onClick={(e) => e.stopPropagation()}>
        <button className="sf-modal-x" aria-label="Close" onClick={onClose}>✕</button>

        <div className="sf-modal-head">
          <span className="sf-tag-mono">Welcome back</span>
          <h2>Log in</h2>
          <p>Find the right people. Build something solid.</p>
        </div>

        {step === 'options' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '20px 0 0' }}>
            <button className="sf-btn sf-btn-ghost" style={{ width: '100%', justifyContent: 'center', gap: 10 }} onClick={() => {}}>
              <GoogleG /> Continue with Google
            </button>
            <div className="sf-su-or">OR</div>
            <button className="sf-btn sf-btn-pri sf-btn-lg" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setStep('email')}>
              Continue with email
            </button>
            <p className="sf-modal-foot">New here? <a className="sf-modal-link" onClick={onSignup}>Sign up!</a></p>
          </div>
        ) : (
          <form className="sf-modal-form" onSubmit={(e) => { e.preventDefault(); onLogin && onLogin(); }}>
            <label className="sf-field">
              <span>Email</span>
              <input type="email" placeholder="you@company.id" defaultValue="hello@studiotarra.id" />
            </label>
            <label className="sf-field">
              <span>Password</span>
              <input type="password" placeholder="••••••••" defaultValue="password" />
            </label>
            <div className="sf-modal-row">
              <label className="sf-check"><input type="checkbox" defaultChecked /> Remember me</label>
              <a className="sf-modal-link">Forgot password?</a>
            </div>
            <button type="submit" className="sf-btn sf-btn-pri sf-btn-lg" style={{ width: '100%' }}>Log in →</button>
            <p className="sf-modal-foot" style={{ margin: '4px 0 0' }}>
              <a className="sf-modal-link" style={{ fontWeight: 500 }} onClick={() => setStep('options')}>← Other options</a>
            </p>
          </form>
        )}

        <AdSlot variant="banner" size="468 × 60" headline="Grow your studio — advertise on SolidFind" />
      </div>
    </div>
  );
}
window.LoginModal = LoginModal;
