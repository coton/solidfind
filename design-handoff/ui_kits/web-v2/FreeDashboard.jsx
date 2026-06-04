// SolidFind — Free Company Dashboard (shown when company has no Pro subscription)
function FreeDashboard({ company, onEditProfile, onViewProfile, onSeeReviews, onGetPro }) {
  const c = company;
  const S = (typeof SETTINGS !== 'undefined') ? SETTINGS : { reviewsEnabled: true };
  const ring = {
    background: 'conic-gradient(var(--sf-peach-300) 0deg, var(--sf-orange) ' + (c.completion * 3.6) + 'deg, var(--sf-stone-300) ' + (c.completion * 3.6) + 'deg 360deg)',
  };
  const Stars = ({ n }) => <SFStars n={n} size={13} />;

  const proPerks = [
    { h: 'Priority placement in search', s: 'Rank above free listings in your category.' },
    { h: 'Up to 12 portfolio photos or videos', s: 'Show four times more work.' },
    { h: 'Full analytics dashboard', s: 'See profile views, reach data and location insights.' },
    { h: 'Ad placement access', s: 'Sponsor slots on category pages and profiles.' },
    { h: 'AI-ready profile formatting', s: 'Optimised for AI-assisted search.' },
  ];

  return (
    <main className="sf-dash" data-screen-label="Free company dashboard">
      <div className="sf-dash-intro">
        <span className="sf-tag-mono">Company dashboard · <span style={{ color: 'var(--sf-fg-3)' }}>Free Account</span></span>
        <h1 className="sf-dash-hi">Welcome back, {c.name}.</h1>
        <p className="sf-dash-sub">Your free profile is live and searchable. Upgrade to Pro to unlock priority placement, analytics and advertising tools.</p>
      </div>

      <div className="sf-dash-layout">
        {/* ── left: profile + reviews ──── */}
        <div className="sf-dash-main">
          <div className="sf-dash-cards">
            {/* Profile completion */}
            <section className="sf-dash-card">
              <span className="sf-tag-mono">Profile completion</span>
              <div className="sf-completion">
                <div className="sf-ring" style={ring}><span>{c.completion}%</span></div>
                <ul className="sf-completion-list">
                  <li className="done">Company details</li>
                  <li className="done">Portfolio photos</li>
                  <li>Licenses &amp; documents</li>
                  <li>Service areas</li>
                </ul>
              </div>
              <div className="sf-card-btns">
                <button className="sf-btn sf-btn-lg sf-btn-ghost" onClick={onViewProfile}>View profile</button>
                <button className="sf-btn sf-btn-lg sf-btn-pri" onClick={onEditProfile}>Edit profile →</button>
              </div>
            </section>

            {/* Get Pro CTA */}
            <section className="sf-dash-card sf-dash-card-pro">
              <span className="sf-tag-light">Upgrade</span>
              <h3>Get Pro</h3>
              <p>Unlock the visibility tools companies use to be found and chosen.</p>
              <button className="sf-btn sf-btn-lg sf-dash-getpro" onClick={onGetPro || (() => window.dispatchEvent(new CustomEvent('sf-open-pro')))}>Get Pro →</button>
            </section>

            {/* Bookmarks */}
            <section className="sf-dash-card sf-dash-card-stat">
              <span className="sf-tag-mono">Saved by clients</span>
              <div className="sf-stat-num">{c.bookmarks}</div>
              <div className="sf-stat-label">times your company was bookmarked</div>
              <div className="sf-stat-trend"><span className="up">▲ {c.bookmarksWeek}</span> this week</div>
            </section>
          </div>

          {S.reviewsEnabled && (
            <section className="sf-dash-reviews">
              <div className="sf-dash-reviews-head">
                <h2 className="sf-h2-static" style={{ margin: 0 }}>Latest reviews</h2>
                <button className="sf-btn sf-btn-lg sf-btn-ghost" onClick={onSeeReviews}>See all {c.reviewCount} reviews →</button>
              </div>
              <div className="sf-reviews-grid">
                {c.reviews.map((r, i) => (
                  <div className={'sf-review' + (r.isNew ? ' is-new' : '')} key={i}>
                    <div className="sf-review-top">
                      <Stars n={r.rating} />
                      <span className="sf-review-when">{r.isNew && <span className="sf-review-newtag">New</span>}{r.context}</span>
                    </div>
                    <p>"{r.text}"</p>
                    <div className="sf-review-by">{r.author}</div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ── right: Get Pro benefits ───── */}
        <aside className="sf-dash-side">
          <div className="sf-dash-side-head">
            <h2 className="sf-h2-static" style={{ margin: 0 }}>What's included in Pro</h2>
          </div>

          <div className="sf-insight-card">
            <div className="sf-adm-points">
              {proPerks.map((p, i) => (
                <div className="sf-adm-point" key={i}>
                  <span className="sf-adm-check">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </span>
                  <div>
                    <div className="sf-adm-point-h">{p.h}</div>
                    <div className="sf-adm-point-s">{p.s}</div>
                  </div>
                </div>
              ))}
            </div>
            <button className="sf-btn sf-btn-pri sf-btn-lg" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
              onClick={onGetPro || (() => window.dispatchEvent(new CustomEvent('sf-open-pro')))}>
              Get Pro →
            </button>
            <p style={{ fontSize: 12, color: 'var(--sf-fg-3)', marginTop: 10, lineHeight: 1.5, textAlign: 'center' }}>
              Secure payment via Midtrans · cancel any time
            </p>
          </div>

          {/* compare plans removed — Get Pro button opens modal */}
        </aside>
      </div>
    </main>
  );
}
window.FreeDashboard = FreeDashboard;
