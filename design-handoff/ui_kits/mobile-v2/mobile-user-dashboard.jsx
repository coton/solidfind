// SolidFind mobile — individual user dashboard
function ReviewsSection({ reviews }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="m-pad" style={{ paddingBottom: 24 }}>
      <button
        style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: open ? 14 : 0 }}
        onClick={() => setOpen(o => !o)}>
        <h2 className="m-h2" style={{ margin: 0 }}>Your reviews</h2>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--sf-orange)' }}>
          {open ? 'Collapse ↑' : 'Show all ' + reviews.length + ' ↓'}
        </span>
      </button>
      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {reviews.map((r, i) => (
            <div className="m-review" key={i}>
              <div className="m-review-top">
                <MStars n={r.rating}/>
                <span className="m-review-when">{r.company} · {r.when}</span>
              </div>
              <p>"{r.text}"</p>
              <div className="m-review-by" style={{ fontSize: 11, fontWeight: 400, color: 'var(--sf-fg-3)' }}>{r.main}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MobileUserDashboard() {
  const u = USER;
  const groups = SAVED_BY_CAT;
  const [activeTab, setActiveTab] = React.useState(groups[0]?.cat || 'Construction');
  const [expanded, setExpanded]   = React.useState(false);
  const currentGroup = groups.find(g => g.cat === activeTab) || groups[0];
  const shown = currentGroup ? currentGroup.items.slice(0, 2) : [];

  return (
    <div className="m-screen">
      {/* orange header */}
      <div style={{ background: 'linear-gradient(165deg,#F14110 0%,#EC5A2C 52%,#E9A28E 100%)', borderRadius: '0 0 18px 18px' }}>
        <div className="m-dash-bar">
          <span className="m-brand" style={{ cursor: 'pointer' }}>
            <img src="../../assets/solidfind-logo.svg" alt="SolidFind"/><span className="id">.id</span>
          </span>
          <span className="m-topbar-sp"/>
          <button className="m-iconbtn" aria-label="Account">
            {I.user}
          </button>
          <button className="m-btn" style={{ background: '#fff', color: 'var(--sf-orange)', padding: '8px 14px', fontSize: 13, minHeight: 'unset' }}>Log out</button>
        </div>
      </div>

      <div className="m-scroll">
        {/* intro */}
        <div className="m-pad" style={{ paddingTop: 18, paddingBottom: 10 }}>
          <span className="m-eyebrow">Individual account · <span style={{ color: 'var(--sf-orange)' }}>{u.email}</span></span>
          <h1 className="m-dash-hi">Hi, {u.name.split(' ')[0]}.</h1>
          <p className="m-dash-sub">Everything you've saved while planning. Pick up where you left off and compare companies.</p>
        </div>

        {/* horizontal category tab bar */}
        <div className="m-htabs">
          {groups.map(g => (
            <button key={g.cat} className={'m-htab' + (activeTab === g.cat ? ' on' : '')} onClick={() => { setActiveTab(g.cat); setExpanded(false); }}>
              <span className="m-htab-n">{g.num}</span>
              {g.cat}
              <span className="m-htab-cnt">{g.items.length}</span>
            </button>
          ))}
        </div>

        {/* bookmarks under selected tab */}
        <div className="m-pad" style={{ paddingTop: 16, paddingBottom: 8 }}>
          <div className="m-list" style={{ padding: 0, gap: 8 }}>
            {shown.map(p => <MCardH key={p.id} pro={p} />)}
          </div>
          {currentGroup && currentGroup.items.length > 2 && (
            <button style={{ fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: 'var(--sf-orange)', background: 'none', border: 'none', padding: '12px 0 0', cursor: 'pointer' }}
              onClick={() => setExpanded(true)}>
              See all {currentGroup.items.length} {activeTab.toLowerCase()}
            </button>
          )}
        </div>

        {/* browse CTA */}
        <div className="m-pad" style={{ paddingBottom: 24 }}>
          <div className="m-card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Looking for more?</div>
              <p style={{ fontSize: 13, color: 'var(--sf-fg-2)', margin: 0, lineHeight: 1.4 }}>Browse all companies across Bali</p>
            </div>
            <button className="m-btn" style={{ flexShrink: 0, padding: '10px 16px', fontSize: 13, background: 'var(--sf-orange)', color: '#fff', minHeight: 'unset' }}>Browse</button>
          </div>
        </div>

        {/* your reviews — collapsible, only if reviews feature is active */}
        {(typeof SETTINGS !== 'undefined' ? SETTINGS.reviewsEnabled : true) && u.reviews && u.reviews.length > 0 && (
          <ReviewsSection reviews={u.reviews} />
        )}

        <MFooter/>
      </div>
    </div>
  );
}

Object.assign(window, { MobileUserDashboard });
