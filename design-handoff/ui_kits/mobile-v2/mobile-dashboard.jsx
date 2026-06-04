// SolidFind mobile — Company dashboard.
function MobileDashboard() {
  const c = COMPANY;
  const a = c.analytics;
  const ring = { background: 'conic-gradient(var(--sf-peach-300) 0deg, var(--sf-orange) ' + (c.completion * 3.6) + 'deg, var(--sf-stone-300) ' + (c.completion * 3.6) + 'deg 360deg)' };
  const maxV = Math.max(...a.byMonth.map(d => d.v));
  return (
    <div className="m-screen">
      <div style={{ background: 'linear-gradient(165deg,#F14110 0%,#EC5A2C 52%,#E9A28E 100%)', borderRadius: '0 0 18px 18px' }}>
        <div className="m-dash-bar">
          <span className="m-brand"><img src="../../assets/solidfind-logo.svg" alt="SolidFind"/><span className="id">.id</span></span>
          <span className="m-topbar-sp"/>
          <button className="m-iconbtn m-notif" style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '50%' }} aria-label="Account">{I.user}<span className="m-notif-dot">3</span></button>
          <button className="m-btn" style={{ background: '#fff', color: 'var(--sf-orange)', padding: '8px 14px', fontSize: 13 }}>Log out</button>
        </div>
      </div>

      <div className="m-scroll">
        <div className="m-pad" style={{ paddingTop: 18, paddingBottom: 6 }}>
          <span className="m-eyebrow">Company dashboard · <span style={{ color: 'var(--sf-orange)' }}>Pro Account</span></span>
          <h1 className="m-dash-hi">Welcome back, {c.name}.</h1>
          <p className="m-dash-sub">Here's how your profile is performing on SolidFind this month. Pro ranks you above free listings and unlocks the insights below.</p>
        </div>

        <div className="m-pad" style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 14, paddingBottom: 28 }}>
          {/* profile completion */}
          <section className="m-card">
            <span className="m-eyebrow">Profile completion</span>
            <div className="m-complete" style={{ marginTop: 14 }}>
              <div className="m-ring" style={ring}><div className="inner">{c.completion}%</div></div>
              <ul>
                <li className="done">Company details</li>
                <li className="done">Portfolio photos</li>
                <li>Licenses &amp; documents</li>
                <li>Service areas</li>
              </ul>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button className="m-btn m-btn-ghost" style={{ flex: 1 }}>View profile</button>
              <button className="m-btn m-btn-pri" style={{ flex: 1 }}>Edit profile →</button>
            </div>
          </section>

          {/* views this month + chart */}
          <section className="m-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="m-eyebrow">Profile views · June</span>
              <span className="m-pill-pro">Pro</span>
            </div>
            <div className="m-insight-row" style={{ marginTop: 10 }}>
              <span className="m-stat-num">{a.viewsThisMonth.toLocaleString()}</span>
              <span className="m-delta">▲ {a.viewsMonthDelta}%</span>
            </div>
            <div className="m-stat-label">vs. last month · {a.totalViews.toLocaleString()} all-time</div>
            <div className="m-chart">
              {a.byMonth.map((d, i) => (
                <div className="m-chart-col" key={i}>
                  <div className={'m-chart-bar' + (i === a.byMonth.length - 1 ? ' last' : '')} style={{ height: Math.round((d.v / maxV) * 100) + '%' }}/>
                  <span className="m-chart-m">{d.m}</span>
                </div>
              ))}
            </div>
          </section>

          <div style={{ display: 'flex', gap: 12 }}>
            {/* bookmarks stat */}
            <section className="m-card" style={{ flex: 1 }}>
              <span className="m-eyebrow">Saved by clients</span>
              <div className="m-stat-num" style={{ marginTop: 12 }}>{c.bookmarks}</div>
              <div className="m-stat-label">times bookmarked</div>
              <div className="m-trend"><span className="up">▲ {c.bookmarksWeek}</span> this week</div>
            </section>
            {/* found-through */}
            <section className="m-card" style={{ flex: 1 }}>
              <span className="m-eyebrow">Found via</span>
              <div className="m-stat-num" style={{ marginTop: 12, fontSize: 22 }}>{a.topLocations[0].city}</div>
              <div className="m-stat-label">top region this month · {a.topLocations[0].pct}%</div>
            </section>
          </div>

          {/* promote / buy ad */}
          <section className="m-card m-pro-card">
            <span className="m-eyebrow" style={{ color: 'var(--sf-peach-300)' }}>Promote</span>
            <h3>Buy ad space</h3>
            <p>Sponsored slots on category pages and company profiles put your studio in front of more clients.</p>
            <button className="m-btn m-btn-pri m-btn-block">Purchase ad space →</button>
          </section>

          {/* latest reviews */}
          <div style={{ marginTop: 6 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
              <h2 className="m-h2" style={{ margin: 0 }}>Latest reviews</h2>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--sf-orange)' }}>All {c.reviewCount} →</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {c.reviews.slice(0, 3).map((r, i) => (
                <div className={'m-review' + (r.isNew ? ' new' : '')} key={i}>
                  <div className="m-review-top">
                    <MStars n={r.rating} />
                    <span className="m-review-when">{r.isNew && <span className="m-newtag" style={{ marginRight: 6 }}>New</span>}{r.context}</span>
                  </div>
                  <p>"{r.text}"</p>
                  <div className="m-review-by">{r.author}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <MFooter/>
      </div>
    </div>
  );
}

Object.assign(window, { MobileDashboard });
