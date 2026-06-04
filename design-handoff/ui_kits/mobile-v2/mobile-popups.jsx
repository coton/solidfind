// SolidFind mobile — popup / modal system

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

// field label: ALL CAPS mono subtitle style
function FL({ children }) {
  return <span style={{ fontFamily: 'var(--sf-font-mono)', fontSize: 9, fontWeight: 500, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--sf-fg-3)', display: 'block', marginBottom: 6 }}>{children}</span>;
}

function MPopupBg({ children }) {
  return (
    <div style={{
      width: '100%', height: '100%', minHeight: '100%',
      background: 'rgba(35,31,32,0.58)', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px 20px', boxSizing: 'border-box',
    }}>
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', boxShadow: '0 24px 60px rgba(35,31,32,0.28)', overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
}

function MPopupHead({ eyebrow, title, onClose }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, padding: '20px 20px 0' }}>
      <div>
        {eyebrow && <span className="m-eyebrow">{eyebrow}</span>}
        <h2 style={{ fontFamily: 'var(--sf-font-display)', fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em', margin: '4px 0 0', color: 'var(--sf-ink)' }}>{title}</h2>
      </div>
      <button style={{ width: 34, height: 34, borderRadius: '50%', flex: 'none', border: '1px solid var(--sf-border-1)', background: 'var(--sf-stone-200)', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sf-fg-2)' }}>✕</button>
    </div>
  );
}

// ── 1. Log in ──────────────────────────────────────────────────
function PopupLogin() {
  const [step, setStep] = React.useState('options');
  const [remember, setRemember] = React.useState(true);
  return (
    <MPopupBg>
      <MPopupHead eyebrow="Welcome back" title="Log in" />
      <div style={{ padding: '4px 20px 0' }}>
        <p style={{ fontSize: 13, color: 'var(--sf-fg-2)', margin: '6px 0 16px', lineHeight: 1.4 }}>Welcome to the best Bali directory.</p>
      </div>
      {step === 'options' ? (
        <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button className="m-btn m-btn-ghost m-btn-center" style={{ gap: 10 }}><GoogleG/> Continue with Google</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--sf-border-1)' }}/>
            <span style={{ fontFamily: 'var(--sf-font-mono)', fontSize: 10, color: 'var(--sf-fg-3)', letterSpacing: '.06em' }}>OR</span>
            <div style={{ flex: 1, height: 1, background: 'var(--sf-border-1)' }}/>
          </div>
          <button className="m-btn m-btn-pri m-btn-center" onClick={() => setStep('email')}>Continue with email</button>
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--sf-fg-3)', margin: '4px 0 0' }}>
            New here? <a style={{ color: 'var(--sf-orange)', cursor: 'pointer', fontWeight: 500, textDecoration: 'none' }}>Sign up!</a>
          </p>
        </div>
      ) : (
        <div style={{ padding: '0 20px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label className="m-field"><FL>Email</FL><input type="email" placeholder="you@company.id" defaultValue="hello@studiotarra.id"/></label>
          <label className="m-field"><FL>Password</FL><input type="password" defaultValue="password"/></label>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" checked={remember} onChange={() => setRemember(r => !r)} style={{ accentColor: 'var(--sf-orange)', width: 16, height: 16 }}/> Remember me
            </label>
            <a style={{ fontSize: 13, color: 'var(--sf-orange)', cursor: 'pointer', textDecoration: 'none', fontWeight: 500 }}>Forgot password?</a>
          </div>
          <button className="m-btn m-btn-pri m-btn-block">Log in →</button>
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--sf-orange)', margin: 0, fontWeight: 600, cursor: 'pointer' }}
            onClick={() => setStep('options')}>← Other options</p>
        </div>
      )}
      <div style={{ margin: '0 20px 20px', background: 'var(--sf-stone-200)', border: '1px dashed var(--sf-stone-400)', borderRadius: 10, padding: '12px 14px' }}>
        <span style={{ fontFamily: 'var(--sf-font-mono)', fontSize: 9, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--sf-fg-3)' }}>Sponsored</span>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--sf-ink)', marginTop: 6 }}>Grow your studio — advertise on SolidFind</div>
        <div style={{ fontSize: 12, color: 'var(--sf-orange)', fontWeight: 500, marginTop: 2 }}>Learn about ad placements →</div>
      </div>
    </MPopupBg>
  );
}

// ── 2. Sign up ─────────────────────────────────────────────────
function PopupSignup() {
  const [role, setRole]   = React.useState('individual');
  const [step, setStep]   = React.useState('options');
  const [news, setNews]   = React.useState(true);
  const roles = [
    { id: 'company',    title: 'Company',    sub: 'Create a profile page & get discovered' },
    { id: 'individual', title: 'Individual', sub: 'Save listings & review companies' },
  ];
  return (
    <MPopupBg>
      <MPopupHead eyebrow="Get started" title="Create an account" />
      <div style={{ padding: '6px 20px 0' }}>
        <p style={{ fontSize: 13, color: 'var(--sf-fg-2)', margin: '0 0 14px', lineHeight: 1.4 }}>Welcome to the best Bali directory — for the people who build, and the people building.</p>
      </div>
      {step === 'options' ? (
        <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {roles.map(r => (
            <button key={r.id} type="button" onClick={() => setRole(r.id)}
              style={{ width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', border: '1px solid ' + (role === r.id ? 'var(--sf-orange)' : 'var(--sf-border-1)'), borderRadius: 12, padding: '12px 14px', background: role === r.id ? 'var(--sf-peach-100)' : '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--sf-ink)', display: 'block' }}>{r.title}</span>
                  <span style={{ fontSize: 12, color: 'var(--sf-fg-3)', marginTop: 3, display: 'block' }}>{r.sub}</span>
                </div>
                <span className={'m-switch' + (role === r.id ? ' on' : '')} style={{ marginTop: 4, flexShrink: 0 }}><span className="knob"/></span>
              </div>
            </button>
          ))}
          <button type="button" onClick={() => setNews(n => !n)}
            style={{ width: '100%', cursor: 'pointer', fontFamily: 'inherit', border: 'none', borderRadius: 10, padding: '4px 0', background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <span className={'m-switch' + (news ? ' on' : '')}><span className="knob"/></span>
            <span style={{ fontSize: 13, color: 'var(--sf-ink)' }}>Subscribe to newsletter</span>
          </button>
          <button className="m-btn m-btn-ghost m-btn-center" style={{ gap: 10 }}><GoogleG/> Continue with Google</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--sf-border-1)' }}/>
            <span style={{ fontFamily: 'var(--sf-font-mono)', fontSize: 10, color: 'var(--sf-fg-3)', letterSpacing: '.06em' }}>OR</span>
            <div style={{ flex: 1, height: 1, background: 'var(--sf-border-1)' }}/>
          </div>
          <button className="m-btn m-btn-pri m-btn-center" onClick={() => setStep('email')}>Continue with email</button>
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--sf-fg-3)', margin: '2px 0 0' }}>
            Already have an account? <a style={{ color: 'var(--sf-orange)', cursor: 'pointer', fontWeight: 500, textDecoration: 'none' }}>Log in</a>
          </p>
        </div>
      ) : (
        <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontFamily: 'var(--sf-font-display)', fontSize: 15, fontWeight: 600, color: 'var(--sf-ink)', display: 'block', marginBottom: 2 }}>
            {role === 'company' ? 'Company account' : 'Individual account'}
          </span>
          <label className="m-field"><FL>{role === 'company' ? 'Company name' : 'Full name'}</FL><input placeholder={role === 'company' ? 'Studio name' : 'Your name'} defaultValue={role === 'company' ? 'Studio Tarra' : 'Andi Pratama'}/></label>
          <label className="m-field"><FL>Email</FL><input type="email" placeholder="you@email.id" defaultValue={role === 'company' ? 'hello@studiotarra.id' : 'andi.pratama@gmail.com'}/></label>
          <label className="m-field"><FL>Password</FL><input type="password" defaultValue="password"/></label>
          <button className="m-btn m-btn-pri m-btn-block" style={{ marginTop: 4 }}>Create account →</button>
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--sf-orange)', margin: '4px 0 0', fontWeight: 600, cursor: 'pointer' }}
            onClick={() => setStep('options')}>← Other sign-up options</p>
        </div>
      )}
    </MPopupBg>
  );
}

// ── 3. Get Pro ─────────────────────────────────────────────────
function PopupGetPro() {
  const [plan, setPlan]    = React.useState('year');
  const [expanded, setExp] = React.useState(false);
  const points = [
    { h: 'Priority placement in search', s: 'Your listing ranks above non-Pro companies within your category — seen first by clients searching your area.' },
    { h: 'Visibility analytics',         s: 'A dashboard of profile views, where viewers found you, and the regions driving the most interest.' },
    { h: 'Up to 12 photos or videos',    s: 'Show four times more work than a free account — full projects, walkthroughs and detail shots.' },
    { h: 'Ad placements across the platform', s: 'Eligible for sponsored slots on category pages and search results, subject to available inventory.' },
    { h: 'AI-ready profile formatting',  s: 'Structured fields optimised for AI-assisted search, so your studio surfaces in the right results.' },
  ];
  const plans = [
    { id: 'month', title: 'Monthly', price: 'Rp 600.000', per: 'per month', note: 'Billed every month' },
    { id: 'year',  title: 'Yearly',  price: 'Rp 6,5jt',   per: 'per year',  note: 'Save Rp 700.000 a year' },
  ];
  return (
    <MPopupBg>
      <MPopupHead eyebrow="Pro subscription" title="Get Pro" />
      <div style={{ padding: '4px 20px 0' }}>
        <p style={{ fontSize: 13, color: 'var(--sf-fg-2)', margin: '6px 0 14px', lineHeight: 1.4 }}>Everything in a free profile, plus the visibility tools companies use to be found and chosen. Visibility can be improved — credibility has to be earned.</p>
      </div>
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {points.map((p, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span style={{ paddingTop: 2, flexShrink: 0 }}><MCheck/></span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--sf-ink)', lineHeight: 1.3 }}>{p.h}</div>
              {expanded && <div style={{ fontSize: 12, color: 'var(--sf-ink-soft)', marginTop: 3, lineHeight: 1.4 }}>{p.s}</div>}
            </div>
          </div>
        ))}
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, color: 'var(--sf-orange)', fontWeight: 500, padding: '2px 0', textAlign: 'left' }}
          onClick={() => setExp(e => !e)}>{expanded ? 'Show less ↑' : 'See all features ↓'}</button>
      </div>
      <div style={{ padding: '12px 20px 0' }}>
        <FL>Choose your plan</FL>
        <div style={{ display: 'flex', gap: 10 }}>
          {plans.map(pl => (
            <button key={pl.id} type="button" onClick={() => setPlan(pl.id)}
              style={{ flex: 1, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', border: '1.5px solid ' + (plan === pl.id ? 'var(--sf-orange)' : 'var(--sf-border-1)'), borderRadius: 12, padding: '10px 12px', background: plan === pl.id ? 'var(--sf-peach-100)' : '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--sf-ink)' }}>{pl.title}</span>
                <span className={'m-switch' + (plan === pl.id ? ' on' : '')} style={{ transform: 'scale(0.85)' }}><span className="knob"/></span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--sf-orange)' }}>{pl.price}</div>
              <div style={{ fontSize: 11, color: 'var(--sf-fg-3)', marginTop: 1 }}>{pl.per}</div>
              <div style={{ fontSize: 11, color: 'var(--sf-fg-3)', marginTop: 2 }}>{pl.note}</div>
            </button>
          ))}
        </div>
      </div>
      <div style={{ padding: '14px 20px 6px' }}>
        <button className="m-btn m-btn-pri m-btn-block">Buy now →</button>
      </div>
      <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--sf-fg-3)', padding: '0 20px 18px', margin: 0, lineHeight: 1.5 }}>
        Secure payment via Midtrans. By subscribing you agree to the <a style={{ color: 'var(--sf-orange)', cursor: 'pointer', textDecoration: 'none', fontWeight: 500 }}>Pro Terms of Service</a>.
      </p>
    </MPopupBg>
  );
}

// ── 4. Get Ads ─────────────────────────────────────────────────
function PopupGetAds() {
  const points = [
    { h: 'Reach a highly targeted audience',          s: 'Get in front of people actively searching for professionals like you.' },
    { h: 'Increased visibility at key decision moments', s: 'Appear exactly where clients are choosing who to contact.' },
    { h: 'Simple and cost-effective exposure',        s: 'Flat, transparent placements — no auctions, no surprises.' },
  ];
  return (
    <MPopupBg>
      <MPopupHead eyebrow="Advertising" title="Buy ad space" />
      <div style={{ padding: '4px 20px 0' }}>
        <p style={{ fontSize: 13, color: 'var(--sf-fg-2)', margin: '6px 0 16px', lineHeight: 1.4 }}>Sponsored placements on category pages and search results — clearly visible to people actively looking for professionals.</p>
      </div>
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {points.map((p, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span style={{ paddingTop: 2, flexShrink: 0 }}><MCheck/></span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--sf-ink)', lineHeight: 1.3 }}>{p.h}</div>
              <div style={{ fontSize: 12, color: 'var(--sf-ink-soft)', marginTop: 3, lineHeight: 1.4 }}>{p.s}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: '20px 20px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ fontSize: 13, color: 'var(--sf-fg-3)', lineHeight: 1.4, margin: 0 }}>Contact us to learn more about pricing options.</p>
        <button className="m-btn m-btn-pri m-btn-block"
          onClick={() => { window.location.href = 'mailto:hello@solidfind.id?subject=Ad%20space%20enquiry'; }}>
          Get in touch →
        </button>
      </div>
    </MPopupBg>
  );
}

// ── 5. Delete account ──────────────────────────────────────────
function PopupDeleteAccount() {
  const reasons = ['Found what I needed', 'Not useful enough', 'Too many emails', 'Privacy concerns', 'Other'];
  const [pick, setPick] = React.useState('');
  return (
    <MPopupBg>
      <MPopupHead eyebrow="Careful" title="Delete account?" />
      <div style={{ padding: '4px 20px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ fontSize: 13, color: 'var(--sf-ink-soft)', lineHeight: 1.5, margin: 0 }}>
          This permanently removes your account, saved companies and all reviews. This can't be undone.
        </p>
        <div>
          <FL>Reason (optional)</FL>
          <div className="m-langchips" style={{ marginBottom: 12 }}>
            {reasons.map(r => (
              <button key={r} type="button" className={'m-langchip' + (pick === r ? ' on' : '')}
                onClick={() => setPick(p => p === r ? '' : r)} style={{ fontSize: 12, padding: '6px 12px' }}>{r}</button>
            ))}
          </div>
        </div>
        <label className="m-field">
          <FL>Tell us what we could have done better</FL>
          <textarea rows={3} placeholder="Your feedback helps us improve…"
            style={{ resize: 'none', fontFamily: 'inherit', fontSize: 14, lineHeight: 1.5, border: '1px solid var(--sf-border-2)', borderRadius: 9, padding: '10px 12px', width: '100%', boxSizing: 'border-box' }}/>
        </label>
        <button className="m-btn m-btn-center m-btn-block" style={{ background: '#D93025', color: '#fff', justifyContent: 'center' }}>Delete permanently</button>
        <button className="m-btn m-btn-ghost m-btn-center m-btn-block" style={{ justifyContent: 'center' }}>Keep my account</button>
      </div>
    </MPopupBg>
  );
}

// ── 6. Write review ────────────────────────────────────────────
function PopupWriteReview() {
  const u = (typeof USER !== 'undefined') ? USER : { name: 'Andi Pratama' };
  const [rating, setRating] = React.useState(0);
  const [hover, setHover]   = React.useState(0);
  const labels = ['', 'Very bad', 'Poor', 'OK', 'Good', 'Excellent'];
  return (
    <MPopupBg>
      <MPopupHead eyebrow="Write a review" title="How was working with Studio Tarra?" />
      <div style={{ padding: '4px 20px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ fontSize: 13, color: 'var(--sf-fg-2)', margin: 0, lineHeight: 1.4 }}>Your honest review helps other people in Bali find the right professionals.</p>
        <div style={{ display: 'flex', gap: 4, justifyContent: 'center', margin: '4px 0' }}>
          {[1, 2, 3, 4, 5].map(n => (
            <button key={n} type="button"
              onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
              onClick={() => setRating(n)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: n <= (hover || rating) ? 'var(--sf-orange)' : 'var(--sf-stone-400)' }}>
              <MSFStar size={32} outline={n > (hover || rating)}/>
            </button>
          ))}
        </div>
        {(hover || rating) > 0 && <div style={{ textAlign: 'center', marginTop: -6 }}><span className="m-eyebrow">{labels[hover || rating]}</span></div>}
        <label className="m-field">
          <FL>Your review <span style={{ color: 'var(--sf-orange)' }}>*</span></FL>
          <textarea rows={4} placeholder="What was the process like? Quality, communication, timing…"
            style={{ resize: 'none', fontFamily: 'inherit', fontSize: 14, lineHeight: 1.5, border: '1px solid var(--sf-border-2)', borderRadius: 9, padding: '10px 12px', width: '100%', boxSizing: 'border-box' }}/>
        </label>
        <label className="m-field">
          <FL>Context</FL>
          <input placeholder="e.g. Renovation · 3 months ago"/>
        </label>
        <button className="m-btn m-btn-pri m-btn-block">Post review →</button>
        <p style={{ fontSize: 12, color: 'var(--sf-fg-3)', margin: 0, lineHeight: 1.4 }}>
          Posting as <b>{u.name}</b>. We review every post before it goes live.
        </p>
      </div>
    </MPopupBg>
  );
}

Object.assign(window, { PopupLogin, PopupSignup, PopupGetPro, PopupGetAds, PopupDeleteAccount, PopupWriteReview });
