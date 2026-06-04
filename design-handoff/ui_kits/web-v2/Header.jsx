// SolidFind — Header (orange band). Two modes:
//  · full    → brand + actions + tagline + category nav + search row (browse)
//  · compact → thin bar: brand + Log out (dashboard)
function Header({ filters, setFilters, onHome, onAccount, compact, onLogout, onBrowse, onListService }) {
  const { query, main, sizes, subs, locations, budget } = filters || {};
  const set = (patch) => setFilters(f => ({ ...f, ...patch }));
  const active = filters ? (MAIN_CATS.find(m => m.name === main) || MAIN_CATS[0]) : null;
  const [lang, setLang] = React.useState('EN');
  const [notifOpen, setNotifOpen] = React.useState(false);
  const S = (typeof SETTINGS !== 'undefined') ? SETTINGS : { reviewsEnabled: true, activeCategories: ['Construction', 'Renovation', 'Architecture', 'Interior', 'Real Estate'] };
  const activeCats = MAIN_CATS.filter(c => (S.activeCategories || []).includes(c.name));
  const getInitials = (name) => name.split(/\s+/).map(w => w[0]).join('').toUpperCase();
  const notifs = (typeof COMPANY !== 'undefined' && COMPANY.notifications) || [];

  // switching main category resets the sub-category selection (subs depend on main)
  const pickMain = (name) => { set({ main: name, subs: [] }); if (onBrowse) onBrowse(); };

  return (
    <header className={'sf-shell' + (compact ? ' sf-shell-compact' : '')} data-screen-label="Header">
      <div className="sf-shell-bg" aria-hidden="true"></div>
      <div className="sf-shell-top">
        <a className="sf-shell-brand" onClick={onHome}>
          <img src="../../assets/solidfind-logo.svg" alt="SolidFind" />
          <span className="sf-brand-id">.id</span>
        </a>
        <div className="sf-shell-actions">
          <div className="sf-lang" role="group" aria-label="Language">
            <button className={lang === 'EN' ? 'on' : ''} onClick={() => setLang('EN')}>EN</button>
            <button className={lang === 'ID' ? 'on' : ''} onClick={() => setLang('ID')}>ID</button>
          </div>
          {compact ? (
            <React.Fragment>
              {/* account avatar circle — always visible when logged in;
                  when reviews are enabled it also acts as the notification trigger */}
              <div className={'sf-notif' + (notifOpen ? ' open' : '')}>
                <div style={{ position: 'relative', display: 'inline-flex' }}>
                  <button
                    className="sf-icon-btn sf-account-circle"
                    aria-label={S.reviewsEnabled && notifs.length > 0 ? notifs.length + ' new reviews' : 'Account'}
                    onClick={() => S.reviewsEnabled && setNotifOpen(o => !o)}
                    style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: 'rgba(255,255,255,0.18)', border: '1.5px solid rgba(255,255,255,0.55)',
                      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--sf-font-display)', fontWeight: 700, fontSize: 13, letterSpacing: 0,
                      cursor: S.reviewsEnabled ? 'pointer' : 'default', flexShrink: 0,
                    }}
                  >
                    {(typeof COMPANY !== 'undefined' && COMPANY.name) ? getInitials(COMPANY.name) : (
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                    )}
                  </button>
                  {S.reviewsEnabled && notifs.length > 0 && (
                    <span style={{
                      position: 'absolute', top: -3, right: -3, minWidth: 16, height: 16,
                      borderRadius: 999, background: '#fff', color: 'var(--sf-orange)',
                      fontFamily: 'var(--sf-font-mono)', fontWeight: 700, fontSize: 9,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '1.5px solid var(--sf-orange)', padding: '0 3px', lineHeight: 1,
                      pointerEvents: 'none',
                    }}>{notifs.length}</span>
                  )}
                </div>
                {S.reviewsEnabled && notifOpen && (
                  <div className="sf-notif-menu">
                    <div className="sf-notif-head">
                      <span className="sf-tag-mono">New reviews</span>
                      <span className="sf-notif-count">{notifs.length}</span>
                    </div>
                    {notifs.map((n, i) => (
                      <div className="sf-notif-item" key={i}>
                        <div className="sf-notif-top">
                          <b>{n.author}</b>
                          <span className="sf-notif-stars"><SFStars n={n.rating} size={11} /></span>
                        </div>
                        <p>"{n.text}"</p>
                        <span className="sf-notif-when">{n.when}</span>
                      </div>
                    ))}
                    <button className="sf-notif-all" onClick={() => { setNotifOpen(false); window.dispatchEvent(new CustomEvent('sf-see-reviews')); }}>See all reviews →</button>
                  </div>
                )}
              </div>
              <button className="sf-btn sf-btn-pri" onClick={onLogout}>Log out</button>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <button className="sf-icon-btn" aria-label="Log in / account" onClick={onAccount}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></svg>
              </button>
              <button className="sf-btn sf-btn-pri" onClick={onListService}>List your services</button>
            </React.Fragment>
          )}
        </div>
      </div>

      {!compact && (
        <React.Fragment>
          <h1 className="sf-shell-lead">{active.tagline}</h1>

          <nav className="sf-catnav">
            {activeCats.map(c => (
              <button
                key={c.name}
                className={'sf-cat' + (main === c.name ? ' active' : '')}
                onClick={() => pickMain(c.name)}
              >
                <span className="num">{c.num}</span>{c.name}
              </button>
            ))}
          </nav>

          <form className="sf-searchrow" onSubmit={(e) => e.preventDefault()}>
            <div className="sf-search-textbox">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
              <input
                value={query}
                onChange={(e) => set({ query: e.target.value })}
                placeholder={'Search ' + main.toLowerCase() + ' pros…'}
              />
              <button type="submit" className="sf-btn sf-btn-pri sf-btn-lg">Search</button>
            </div>

            <div className="sf-search-filters">
              <Dropdown label="Project size" multi value={sizes}     options={SIZE_OPTS}   onChange={(v) => set({ sizes: v })}     placeholder="Any size" allLabel="Any size" />
              <div className="sf-fdiv"/>
              <Dropdown label="Categories"   multi value={subs}      options={active.subs} onChange={(v) => set({ subs: v })}      placeholder="All types" allLabel="All types" />
              <div className="sf-fdiv"/>
              <Dropdown label="Location"     multi value={locations} options={LOCATIONS}   onChange={(v) => set({ locations: v })} placeholder="Anywhere" allLabel="Bali — all regions" align="right" />
            </div>
          </form>
        </React.Fragment>
      )}
    </header>
  );
}
window.Header = Header;
