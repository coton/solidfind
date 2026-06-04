// SolidFind mobile — Company dashboard (Free account tier)
function MobileDashboardFree() {
  const c = COMPANY;
  const ring = { background: 'conic-gradient(var(--sf-peach-300) 0deg, var(--sf-orange) ' + (c.completion * 3.6) + 'deg, var(--sf-stone-300) ' + (c.completion * 3.6) + 'deg 360deg)' };
  return (
    <div className="m-screen">
      <div style={{ background: 'linear-gradient(165deg,#F14110 0%,#EC5A2C 52%,#E9A28E 100%)', borderRadius: '0 0 18px 18px' }}>
        <div className="m-dash-bar">
          <span className="m-brand"><img src="../../assets/solidfind-logo.svg" alt="SolidFind"/><span className="id">.id</span></span>
          <span className="m-topbar-sp"/>
          <button className="m-iconbtn m-notif" style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '50%' }} aria-label="Account">{I.user}</button>
          <button className="m-btn" style={{ background: '#fff', color: 'var(--sf-orange)', padding: '8px 14px', fontSize: 13 }}>Log out</button>
        </div>
      </div>

      <div className="m-scroll">
        <div className="m-pad" style={{ paddingTop: 18, paddingBottom: 6 }}>
          <span className="m-eyebrow">Company dashboard · <span style={{ color: 'var(--sf-stone-500)' }}>Free account</span></span>
          <h1 className="m-dash-hi">Welcome back, {c.name}.</h1>
          <p className="m-dash-sub">You're listed on SolidFind. Complete your profile and upgrade to Pro to get more visibility.</p>
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

          {/* saved by clients — the only stat visible on free tier */}
          <section className="m-card">
            <span className="m-eyebrow">Saved by clients</span>
            <div className="m-insight-row" style={{ marginTop: 10 }}>
              <span className="m-stat-num">{c.bookmarks}</span>
            </div>
            <div className="m-stat-label">times bookmarked by individuals</div>
          </section>

          {/* upgrade to Pro */}
          <section className="m-card m-pro-card">
            <span className="m-eyebrow" style={{ color: 'var(--sf-peach-300)' }}>Go further</span>
            <h3>Get Pro</h3>
            <p>Priority placement, analytics, up to 12 photos and ad placements — for companies that take their visibility seriously.</p>
            <button className="m-btn m-btn-pri m-btn-block">Upgrade to Pro →</button>
          </section>



        </div>
        <MFooter/>
      </div>
    </div>
  );
}

Object.assign(window, { MobileDashboardFree });
