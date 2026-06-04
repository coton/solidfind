// SolidFind — Sign-up + Email-auth popups
function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#4285F4" d="M45.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h11.8c-.5 2.7-2 5-4.4 6.6v5.5h7.1c4.1-3.8 6.6-9.4 6.6-16.1z"/>
      <path fill="#34A853" d="M24 46c5.9 0 10.9-2 14.5-5.4l-7.1-5.5c-2 1.3-4.5 2.1-7.4 2.1-5.7 0-10.5-3.8-12.2-9H4.5v5.7C8.1 41.1 15.4 46 24 46z"/>
      <path fill="#FBBC05" d="M11.8 28.2c-.4-1.3-.7-2.7-.7-4.2s.3-2.9.7-4.2v-5.7H4.5C3 17.1 2.2 20.4 2.2 24s.8 6.9 2.3 9.9l7.3-5.7z"/>
      <path fill="#EA4335" d="M24 10.8c3.2 0 6.1 1.1 8.4 3.3l6.3-6.3C34.9 4.1 29.9 2 24 2 15.4 2 8.1 6.9 4.5 14.1l7.3 5.7c1.7-5.2 6.5-9 12.2-9z"/>
    </svg>
  );
}

function SignUpModal({ open, initialRole, onClose, onLogin, onEmail, onContinue }) {
  const [role, setRole] = React.useState(initialRole || 'individual');
  const [news, setNews] = React.useState(true);
  React.useEffect(() => { if (open) { setRole(initialRole || 'individual'); setNews(true); } }, [open, initialRole]);
  if (!open) return null;

  const Opt = ({ id, title, sub }) => (
    <button type="button" className={'sf-su-opt' + (role === id ? ' on' : '')} onClick={() => setRole(id)}>
      <div className="sf-su-opt-top">
        <span className="sf-su-opt-title">{title}</span>
        <span className="sf-switch" aria-hidden="true"><span className="sf-switch-knob"/></span>
      </div>
      <span className="sf-su-opt-sub">{sub}</span>
    </button>
  );

  return (
    <div className="sf-modal-scrim" onClick={onClose}>
      <div className="sf-modal sf-modal-signup" role="dialog" aria-modal="true" aria-label="Create an account" onClick={e => e.stopPropagation()}>
        <button className="sf-modal-x" aria-label="Close" onClick={onClose}>✕</button>
        <div className="sf-modal-head">
          <span className="sf-tag-mono">Get started</span>
          <h2>Create an account</h2>
          <p>Welcome to the best Bali directory — for the people who build, and the people building.</p>
        </div>

        <div className="sf-su-opts">
          <Opt id="company" title="Company" sub="Create a profile page & get discovered" />
          <Opt id="individual" title="Individual" sub="Save listings & review companies" />
        </div>

        <button type="button" className="sf-su-news" onClick={() => setNews(n => !n)} aria-pressed={news}>
          <span>Subscribe to the SolidFind newsletter</span>
          <span className={'sf-switch' + (news ? ' on' : '')} aria-hidden="true"><span className="sf-switch-knob"/></span>
        </button>

        <button className="sf-btn sf-btn-lg sf-su-google" onClick={() => onContinue && onContinue(role)}>
          <GoogleG /> Continue with Google
        </button>
        <div className="sf-su-or"><span>or</span></div>
        <button className="sf-btn sf-btn-lg sf-btn-pri sf-su-email" onClick={() => onEmail && onEmail(role)}>Continue with email</button>

        <p className="sf-modal-foot">Already have an account? <a className="sf-modal-link" onClick={onLogin}>Log in</a></p>
      </div>
    </div>
  );
}
window.SignUpModal = SignUpModal;

function EmailAuthModal({ open, role, onClose, onBack, onComplete }) {
  if (!open) return null;
  const isCompany = role === 'company';
  return (
    <div className="sf-modal-scrim" onClick={onClose}>
      <div className="sf-modal sf-modal-login" role="dialog" aria-modal="true" aria-label="Continue with email" onClick={e => e.stopPropagation()}>
        <button className="sf-modal-x" aria-label="Close" onClick={onClose}>✕</button>
        <div className="sf-modal-head">
          <span className="sf-tag-mono">{isCompany ? 'Company account' : 'Individual account'}</span>
          <h2>Continue with email</h2>
          <p>Create your {isCompany ? 'company' : 'personal'} account to start on SolidFind<span className="sf-modal-id">.id</span></p>
        </div>
        <form className="sf-modal-form" onSubmit={(e) => { e.preventDefault(); onComplete && onComplete(role); }}>
          <label className="sf-field"><span>{isCompany ? 'Company name' : 'Full name'}</span>
            <input placeholder={isCompany ? 'Studio name' : 'Your name'} defaultValue={isCompany ? 'Studio Tarra' : 'Andi Pratama'} /></label>
          <label className="sf-field"><span>Email</span>
            <input type="email" placeholder="you@email.id" defaultValue={isCompany ? 'hello@studiotarra.id' : 'andi.pratama@gmail.com'} /></label>
          <label className="sf-field"><span>Password</span>
            <input type="password" placeholder="Create a password" defaultValue="password" /></label>
          <button type="submit" className="sf-btn sf-btn-pri sf-btn-lg" style={{ width: '100%' }}>Create account →</button>
          <p className="sf-modal-foot"><a className="sf-modal-link" onClick={onBack}>← Other sign-up options</a></p>
        </form>
      </div>
    </div>
  );
}
window.EmailAuthModal = EmailAuthModal;
