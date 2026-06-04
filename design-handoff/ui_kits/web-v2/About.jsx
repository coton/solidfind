// SolidFind — About page (acts as its own header; global header hidden)
// Renders **bold** spans and splits paragraphs on blank lines.
function sfRich(text) {
  return text.split('**').map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : <React.Fragment key={i}>{part}</React.Fragment>);
}

// Shared page header bar (mirrors the main header top row) for About / Legal pages
function SFPageHeaderBar({ onHome, onAccount, onListService }) {
  const [lang, setLang] = React.useState('EN');
  return (
    <div className="sf-about-hero-bar">
      <a className="sf-shell-brand" onClick={onHome}>
        <img src="../../assets/solidfind-logo.svg" alt="SolidFind" />
        <span className="sf-brand-id sf-about-hero-id">.id</span>
      </a>
      <div className="sf-shell-actions">
        <div className="sf-lang" role="group" aria-label="Language">
          <button className={lang === 'EN' ? 'on' : ''} onClick={() => setLang('EN')}>EN</button>
          <button className={lang === 'ID' ? 'on' : ''} onClick={() => setLang('ID')}>ID</button>
        </div>
        <button className="sf-icon-btn" aria-label="Log in / account" onClick={onAccount}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></svg>
        </button>
        <button className="sf-btn sf-btn-pri" onClick={onListService}>List your services</button>
      </div>
    </div>
  );
}
window.SFPageHeaderBar = SFPageHeaderBar;

function About({ onBack, onHome, onAccount, onBrowse, onListService }) {
  const A = (typeof ABOUT_CONTENT !== 'undefined') ? ABOUT_CONTENT : {};
  const S = (typeof SETTINGS !== 'undefined') ? SETTINGS : { proEnabled: true };
  const paras = (A.description || '').split(/\n\n+/);
  const accounts = [
    { k: 'Individual account', t: A.individualDesc },
    { k: 'Company account', t: A.companyDesc },
    ...(S.proEnabled ? [{ k: 'Pro company account', t: A.proDesc }] : []),
  ];
  return (
    <main className="sf-about" data-screen-label="About">
      {/* orange block doubles as the page header */}
      <div className="sf-about-hero">
        <div className="sf-about-hero-bg" aria-hidden="true"/>
        <SFPageHeaderBar onHome={onHome} onAccount={onAccount} onListService={onListService} />
        <div className="sf-about-hero-copy">
          <span className="sf-tag-light">About</span>
          <h1>{sfRich(A.tagline || '')}</h1>
          <p>{A.heroSub}</p>
        </div>
      </div>

      <button className="sf-about-back" onClick={onBack}>← Back</button>

      <div className="sf-about-body">
        <section className="sf-about-main">
          <h2 className="sf-h2-static">Why we exist</h2>
          <div className="sf-about-prose">
            {paras.map((p, i) => <p key={i}>{sfRich(p)}</p>)}
          </div>

          <h2 className="sf-h2-static">What we believe</h2>
          <ul className="sf-about-list">
            <li>Visibility should be earned through clarity.</li>
            <li>Trust should be built through transparency.</li>
            <li>Access should be available to anyone.</li>
          </ul>
          <div className="sf-about-prose"><p>SolidFind.id is a neutral platform. A curated environment. A structured starting point — for those looking to build, and for those building.</p></div>

          <h2 className="sf-h2-static">How it works</h2>
          <div className="sf-about-cards">
            {accounts.map((a, i) => (
              <div className="sf-about-card" key={i}>
                <span className="sf-about-card-n">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <span className="sf-tag-mono">{a.k}</span>
                  <p>{a.t}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="sf-about-back sf-legal-totop" style={{ marginTop: 48 }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>↑ Back to top</button>
        </section>

        {/* sticky sidebar */}
        <aside className="sf-about-side">
          <div className="sf-detail-card">
            <span className="sf-tag-mono">Get in touch</span>
            <p className="sf-about-contact">{A.contactText}</p>
            <a className="sf-btn sf-btn-pri sf-btn-lg" href={'mailto:' + (A.contactEmail || '')} style={{ width: '100%', justifyContent: 'center' }}>{A.contactEmail}</a>
          </div>
          <div className="sf-about-jump">
            <button className="sf-about-jump-btn" onClick={onBrowse}><b>Start browsing listings</b><span>Find professionals across Bali →</span></button>
            <button className="sf-about-jump-btn" onClick={onListService}><b>List your services</b><span>Create a company profile →</span></button>
          </div>
        </aside>
      </div>
    </main>
  );
}
window.About = About;
