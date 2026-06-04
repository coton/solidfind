// SolidFind — Company Dashboard (shown when the account button is clicked)
function Dashboard({ company, onEditProfile, onViewProfile, onSeeReviews }) {
  const c = company;
  const S = (typeof SETTINGS !== 'undefined') ? SETTINGS : { proEnabled: true, reviewsEnabled: true };
  const a = c.analytics || {};
  const ring = {
    background: 'conic-gradient(var(--sf-peach-300) 0deg, var(--sf-orange) ' + (c.completion * 3.6) + 'deg, var(--sf-stone-300) ' + (c.completion * 3.6) + 'deg 360deg)',
  };
  const isPro = S.proEnabled && c.verified;
  const maxV = Math.max(...(a.byMonth || [{ v: 1 }]).map(d => d.v));

  return (
    <main className="sf-dash" data-screen-label="Company dashboard">
      <div className="sf-dash-intro">
        <span className="sf-tag-mono">Company dashboard{isPro && <React.Fragment> · <span className="sf-eyebrow-pro">Pro Account</span></React.Fragment>}{!isPro && <React.Fragment> · <span style={{ color: 'var(--sf-fg-3)' }}>Free account</span></React.Fragment>}</span>
        <h1 className="sf-dash-hi">Welcome back, {c.name}.</h1>
        <p className="sf-dash-sub">{isPro ? "Here's how your profile is performing on SolidFind this month. Your Pro Account ranks you above free listings and unlocks the insights below." : "You're listed on SolidFind. Complete your profile to make a strong impression — upgrade to Pro to unlock visibility insights."}</p>
      </div>

      <div className="sf-dash-layout">
        {/* ── left: profile + reviews ──────────────────────────── */}
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

            {/* Buy ad space — Pro only */}
            {isPro && (
            <section className="sf-dash-card sf-dash-card-pro">
              <span className="sf-tag-light">Promote</span>
              <h3>Buy ad space</h3>
              <p>Place sponsored slots on category pages and company profiles to put your studio in front of more clients.</p>
              <button className="sf-btn sf-btn-lg sf-dash-getpro" onClick={() => window.dispatchEvent(new CustomEvent('sf-open-ad'))}>Purchase ad space →</button>
            </section>
            )}

            {/* Saved by clients — visible on all tiers */}
            <section className="sf-dash-card sf-dash-card-stat">
              <span className="sf-tag-mono">Saved by clients</span>
              <div className="sf-stat-num">{c.bookmarks}</div>
              <div className="sf-stat-label">times your company was bookmarked</div>
              {isPro && <div className="sf-stat-trend"><span className="up">▲ {c.bookmarksWeek}</span> this week</div>}
            </section>

            {/* Get Pro prompt — free only */}
            {!isPro && (
            <section className="sf-dash-card sf-dash-card-pro">
              <span className="sf-tag-light">Go further</span>
              <h3>Get Pro</h3>
              <p>Priority placement, profile analytics, up to 12 photos and ad placements across the platform.</p>
              <button className="sf-btn sf-btn-lg sf-dash-getpro" onClick={() => window.dispatchEvent(new CustomEvent('sf-open-pro'))}>Upgrade to Pro →</button>
            </section>
            )}
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

        {/* Pro insights sidebar — Pro accounts only */}
        {isPro && (
        <aside className="sf-dash-side" id="sf-insights">
          <div className="sf-dash-side-head">
            <h2 className="sf-h2-static" style={{ margin: 0 }}>Pro insights</h2>
            <span className="sf-pro-pill">Pro</span>
          </div>

          {/* views this month */}
          <div className="sf-insight-card">
            <span className="sf-tag-mono">Profile views · June</span>
            <div className="sf-insight-row">
              <div className="sf-stat-num sf-stat-num-sm">{a.viewsThisMonth.toLocaleString()}</div>
              <span className="sf-insight-delta up">▲ {a.viewsMonthDelta}%</span>
            </div>
            <div className="sf-stat-label">vs. last month · {a.totalViews.toLocaleString()} views all-time</div>

            <div className="sf-chart" role="img" aria-label="Monthly profile views">
              {a.byMonth.map((d, i) => (
                <div className="sf-chart-col" key={i}>
                  <div className="sf-chart-bar" style={{ height: Math.round((d.v / maxV) * 100) + '%' }}>
                    <span className="sf-chart-val">{d.v}</span>
                  </div>
                  <span className="sf-chart-m">{d.m}</span>
                </div>
              ))}
            </div>
          </div>

          {/* found through location */}
          <div className="sf-insight-card">
            <span className="sf-tag-mono">Found through location</span>
            <div className="sf-toploc-big">{a.topLocations[0].city}</div>
            <p className="sf-toploc-note">The region most clients found you through this month. Keep your service areas complete to stay visible here.</p>
          </div>

          {/* buy ad space */}
          <div className="sf-insight-card sf-buyad">
            <div>
              <span className="sf-tag-mono">Advertising</span>
              <div className="sf-buyad-head">Promote your profile</div>
              <p>Sponsored placements across SolidFind.</p>
            </div>
            <button className="sf-btn sf-btn-pri sf-btn-lg" onClick={() => window.dispatchEvent(new CustomEvent('sf-open-ad'))}>Buy ad space →</button>
          </div>
        </aside>
        )}
      </div>
    </main>
  );
}
window.Dashboard = Dashboard;
