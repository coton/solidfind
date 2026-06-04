// SolidFind mobile — About page.
function mRich(text) {
  return text.split('**').map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : <React.Fragment key={i}>{part}</React.Fragment>);
}

function MobileAbout() {
  const A = ABOUT_CONTENT;
  const paras = (A.description || '').split(/\n\n+/);
  const accounts = [
    { k: 'Individual account', t: A.individualDesc },
    { k: 'Company account', t: A.companyDesc },
    { k: 'Pro company account', t: A.proDesc },
  ];
  return (
    <div className="m-screen">
      <div className="m-about-hero">
        <div className="m-topbar">
          <span className="m-brand"><img src="../../assets/solidfind-logo.svg" alt="SolidFind"/><span className="id">.id</span></span>
          <span className="m-topbar-sp"/>
          <button className="m-iconbtn" aria-label="Account">{I.user}</button>
          <button className="m-iconbtn" aria-label="Menu">{I.menu}</button>
        </div>
        <span className="m-eyebrow light" style={{ margin: '14px 20px 0' }}>About</span>
        <h1>{mRich(A.tagline || '')}</h1>
        <p>{A.heroSub}</p>
      </div>

      <div className="m-scroll">
        <button className="m-back">← Back</button>

        <div className="m-pad" style={{ marginTop: 8 }}>
          <h2 className="m-h2">Why we exist</h2>
          <div className="m-prose">{paras.map((p, i) => <p key={i}>{mRich(p)}</p>)}</div>
        </div>

        <div className="m-pad" style={{ marginTop: 22 }}>
          <h2 className="m-h2">What we believe</h2>
          <ul className="m-belief">
            <li>Visibility should be earned through clarity.</li>
            <li>Trust should be built through transparency.</li>
            <li>Access should be available to anyone.</li>
          </ul>
          <div className="m-prose" style={{ marginTop: 12 }}>
            <p>SolidFind.id is a neutral platform. A curated environment. A structured starting point — for those looking to build, and for those building.</p>
          </div>
        </div>

        <div className="m-pad" style={{ marginTop: 22 }}>
          <h2 className="m-h2">How it works</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {accounts.map((a, i) => (
              <div className="m-acct-card" key={i}>
                <span className="n" style={{ color: 'var(--sf-orange)', opacity: 1 }}>{String(i + 1).padStart(2, '0')}</span>
                <div><span className="m-eyebrow">{a.k}</span><p>{a.t}</p></div>
              </div>
            ))}
          </div>
        </div>

        <div className="m-pad" style={{ marginTop: 22 }}>
          <div className="m-card">
            <span className="m-eyebrow">Get in touch</span>
            <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--sf-ink-soft)', margin: '8px 0 14px' }}>{A.contactText}</p>
            {/* email button: centered, not left-aligned */}
            <a className="m-btn m-btn-pri" href={'mailto:' + A.contactEmail}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', textDecoration: 'none', boxSizing: 'border-box' }}>
              {A.contactEmail}
            </a>
          </div>
        </div>

        <div className="m-pad" style={{ margin: '14px 0 28px' }}>
          <div className="m-jump">
            <button style={{ opacity: 1 }}><b>Start browsing listings</b><span>Find professionals across Bali →</span></button>
            <button style={{ opacity: 1 }}><b>List your services</b><span>Create a company profile →</span></button>
          </div>
        </div>

        <MFooter/>
      </div>
    </div>
  );
}

Object.assign(window, { MobileAbout });
