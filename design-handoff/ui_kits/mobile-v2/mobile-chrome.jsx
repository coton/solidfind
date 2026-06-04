// SolidFind mobile — shared chrome. Consumes data.jsx globals.

// ── utility icons ─────────────────────────────────────────────
const I = {
  search:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>,
  menu:    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>,
  user:    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
  star:    <svg width="13" height="13" viewBox="0 0 18 17" fill="currentColor" stroke="currentColor" strokeWidth="0"><path d="M17.5,7.1c.4-.3.2-1-.3-1h-5.4c-.2,0-.4-.1-.5-.4l-1.7-5.2c-.2-.5-.8-.5-1,0l-1.7,5.2c0,.2-.3.4-.5.4H.9c-.5,0-.7.7-.3,1l4.4,3.2c.2.1.3.4.2.6l-1.7,5.2c-.2.5.4.9.8.6l4.4-3.2c.2-.1.4-.1.6,0l4.4,3.2c.4.3,1-.1.8-.6l-1.7-5.2c0-.2,0-.5.2-.6l4.4-3.2Z"/></svg>,
  starOut: <svg width="15" height="15" viewBox="0 0 18 17" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"><path d="M17.5,7.1c.4-.3.2-1-.3-1h-5.4c-.2,0-.4-.1-.5-.4l-1.7-5.2c-.2-.5-.8-.5-1,0l-1.7,5.2c0,.2-.3.4-.5.4H.9c-.5,0-.7.7-.3,1l4.4,3.2c.2.1.3.4.2.6l-1.7,5.2c-.2.5.4.9.8.6l4.4-3.2c.2-.1.4-.1.6,0l4.4,3.2c.4.3,1-.1.8-.6l-1.7-5.2c0-.2,0-.5.2-.6l4.4-3.2Z"/></svg>,
  bookmark:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>,
  share:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>,
  sliders: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M4 6h11M4 12h7M4 18h13"/><circle cx="18" cy="6" r="2"/><circle cx="14" cy="12" r="2"/><circle cx="19" cy="18" r="2"/></svg>,
  chevD:   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 9l6 6 6-6"/></svg>,
  close:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>,
  camera:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
};

// ── SolidFind icon mark (from brand assets) ─────────────────
const MSFIcon = ({ size = 28 }) => (
  <svg viewBox="0 0 83.88 83.88" width={size} height={size} fill="currentColor" aria-hidden="true">
    <path d="M65.19,0H18.69c-2.4,0-4.69.95-6.39,2.65L2.65,12.3c-1.69,1.69-2.65,3.99-2.65,6.39v46.5c0,2.4.95,4.69,2.65,6.39l9.66,9.66c1.69,1.69,3.99,2.65,6.39,2.65h48.61c1.04,0,2.04-.41,2.78-1.15h0c1.53-1.53,1.53-4.02,0-5.55l-8.98-8.98c-1.23-1.23-3.14-1.54-4.65-.68-5.01,2.85-10.79,4.19-16.77,3.74-6.16-.46-12.06-2.89-16.76-6.9-13.2-11.25-13.78-31.18-1.76-43.2,5.55-5.55,12.93-8.61,20.79-8.61s15.23,3.06,20.79,8.61h0c9.58,9.58,11.15,24.17,4.71,35.4-.87,1.52-.59,3.44.65,4.69l8.96,8.96c1.53,1.53,4.02,1.53,5.55,0l.12-.12c.74-.74,1.15-1.74,1.15-2.78V18.69c0-2.4-.95-4.69-2.65-6.39l-9.66-9.66c-1.69-1.69-3.99-2.65-6.39-2.65Z"/>
    <path d="M41.94,23.25c-4.79,0-9.58,1.82-13.22,5.47-7.29,7.29-7.29,19.15,0,26.44,7.29,7.29,19.15,7.29,26.44,0,7.29-7.29,7.29-19.15,0-26.44-3.64-3.65-8.43-5.47-13.22-5.47Z"/>
  </svg>
);

// ── desktop-identical SFStar ───────────────────────────────────
const STAR_PATH = "M17.5,7.1c.4-.3.2-1-.3-1h-5.4c-.2,0-.4-.1-.5-.4l-1.7-5.2c-.2-.5-.8-.5-1,0l-1.7,5.2c0,.2-.3.4-.5.4H.9c-.5,0-.7.7-.3,1l4.4,3.2c.2.1.3.4.2.6l-1.7,5.2c-.2.5.4.9.8.6l4.4-3.2c.2-.1.4-.1.6,0l4.4,3.2c.4.3,1-.1.8-.6l-1.7-5.2c0-.2,0-.5.2-.6l4.4-3.2Z";
function MSFStar({ size = 14, outline = false }) {
  return (
    <svg viewBox="0 0 18 17" width={size} height={size}
      fill={outline ? 'none' : 'currentColor'} stroke="currentColor"
      strokeWidth={outline ? 1.4 : 0} strokeLinejoin="round" aria-hidden="true">
      <path d={STAR_PATH}/>
    </svg>
  );
}

// ── check icon (matches desktop sf-adm-check) ─────────────────
function MCheck() {
  return (
    <span style={{ flex: 'none', width: 24, height: 24, borderRadius: '50%', border: '1.5px solid var(--sf-orange)', color: 'var(--sf-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
    </span>
  );
}

// ── social glyphs ──────────────────────────────────────────────
const MGLYPHS = {
  email:    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4 7 8 6 8-6"/></svg>,
  phone:    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.1-1.1a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2z"/></svg>,
  whatsapp: <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.05L2 22l5.07-1.33A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3 .79.8-2.93-.2-.31A8.2 8.2 0 1 1 12 20.2Zm4.5-6.13c-.25-.13-1.46-.72-1.69-.8-.23-.08-.39-.13-.56.13-.16.25-.64.8-.78.97-.14.16-.29.18-.54.06a6.73 6.73 0 0 1-1.98-1.22 7.4 7.4 0 0 1-1.37-1.7c-.14-.25 0-.38.11-.5.11-.12.25-.29.37-.43.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.13-.56-1.34-.76-1.84-.2-.48-.4-.41-.56-.42h-.48c-.16 0-.43.06-.65.31-.23.25-.86.84-.86 2.05s.88 2.38 1 2.54c.13.17 1.74 2.65 4.2 3.72.59.25 1.05.4 1.4.52.6.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.18.2-.58.2-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z"/></svg>,
  facebook: <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M14 8.5V7c0-.7.3-1 1-1h1.5V3H14c-2.2 0-3.5 1.4-3.5 3.7V8.5H8V11.5h2.5V21H14v-9.5h2.4l.4-3H14Z"/></svg>,
  instagram:<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none"/></svg>,
  linkedin: <svg viewBox="0 0 20 20" width="18" height="18" fill="none"><rect x="1" y="1" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2"/><path fillRule="evenodd" clipRule="evenodd" d="M4 11.1942H6.31836V19H4V11.1942ZM11.4785 13.1344C10.2734 13.1344 10.0879 14.1199 10.0879 15.138V19H7.77148V11.1942H9.99609V12.2614H10.0273C10.3379 11.6481 11.0938 11 12.2207 11C14.5664 11 15 12.6172 15 14.7189V19H12.6836V15.2034C12.6836 14.2977 12.666 13.1344 11.4785 13.1344Z" fill="currentColor"/><circle cx="5" cy="9" r="1" fill="currentColor"/></svg>,
};

function MStars({ n }) {
  return (
    <span className="stars" style={{ display: 'inline-flex', gap: 2, alignItems: 'center' }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= n ? 'var(--sf-orange)' : 'var(--sf-stone-400)' }}>
          <MSFStar size={12} outline={i > n}/>
        </span>
      ))}
    </span>
  );
}

function MStatus({ light }) {
  return (
    <div className={'m-status ' + (light ? 'on-light' : 'on-orange')}>
      <span>9:41</span>
      <span className="m-status-r">
        <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor"><rect x="0" y="7" width="3" height="4" rx="1"/><rect x="4.5" y="5" width="3" height="6" rx="1"/><rect x="9" y="2.5" width="3" height="8.5" rx="1"/><rect x="13.5" y="0" width="3" height="11" rx="1"/></svg>
        <svg width="16" height="11" viewBox="0 0 16 12" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M1 4.5a10 10 0 0 1 14 0M3.5 7a6.5 6.5 0 0 1 9 0M8 9.7l.01 0"/></svg>
        <svg width="24" height="12" viewBox="0 0 26 13" fill="none"><rect x="1" y="1" width="21" height="11" rx="3" stroke="currentColor" strokeOpacity="0.5"/><rect x="3" y="3" width="16" height="7" rx="1.5" fill="currentColor"/><rect x="23" y="4" width="2" height="5" rx="1" fill="currentColor"/></svg>
      </span>
    </div>
  );
}

// ── filter menus ──────────────────────────────────────────────
function MFilterMenu() {
  const locs = LOCATIONS.slice(0, 7);
  const [on, setOn] = React.useState(['Badung', 'Denpasar']);
  const toggle = (l) => setOn(a => a.includes(l) ? a.filter(x => x !== l) : [...a, l]);
  return (
    <div className="m-ddmenu">
      <button className="m-ddopt all"><span className="lbl">Bali — all regions</span><span className="m-switch"><span className="knob"/></span></button>
      {locs.map(l => (
        <button key={l} className="m-ddopt" onClick={() => toggle(l)}>
          <span className="lbl">{l}</span>
          <span className={'m-switch' + (on.includes(l) ? ' on' : '')}><span className="knob"/></span>
        </button>
      ))}
    </div>
  );
}

function MSizeMenu() {
  const [sel, setSel] = React.useState([]);
  const toggle = (s) => setSel(a => a.includes(s) ? a.filter(x => x !== s) : [...a, s]);
  return (
    <div className="m-ddmenu">
      <button className="m-ddopt all"><span className="lbl">Any size</span><span className={'m-switch' + (sel.length === 0 ? ' on' : '')}><span className="knob"/></span></button>
      {SIZE_OPTS.map(s => (
        <button key={s} className="m-ddopt" onClick={() => toggle(s)}>
          <span className="lbl">{s}</span>
          <span className={'m-switch' + (sel.includes(s) ? ' on' : '')}><span className="knob"/></span>
        </button>
      ))}
    </div>
  );
}

// Type filter — switch style, consistent with Location + Size
function MTypeMenu({ activeCat = 'Construction' }) {
  const cat = MAIN_CATS.find(c => c.name === activeCat) || MAIN_CATS[0];
  const [sel, setSel] = React.useState([]);
  const toggle = (s) => setSel(a => a.includes(s) ? a.filter(x => x !== s) : [...a, s]);
  return (
    <div className="m-ddmenu">
      <button className="m-ddopt all"><span className="lbl">All types</span><span className={'m-switch' + (sel.length === 0 ? ' on' : '')}><span className="knob"/></span></button>
      {(cat.subs || []).map(s => (
        <button key={s} className="m-ddopt" onClick={() => toggle(s)}>
          <span className="lbl">{s}</span>
          <span className={'m-switch' + (sel.includes(s) ? ' on' : '')}><span className="knob"/></span>
        </button>
      ))}
    </div>
  );
}

// inline filter bar
function MFilterBlock({ openSeg, onToggle }) {
  const segs = [
    { k: 'Size', v: 'Any size', ph: true },
    { k: 'Type', v: 'All types', ph: true },
    { k: 'Location', v: '2 areas', ph: false },
  ];
  return (
    <div className="m-filterblock">
      {segs.map(s => (
        <button key={s.k} className={'m-filterseg' + (openSeg === s.k ? ' open' : '')}
          onClick={() => onToggle && onToggle(openSeg === s.k ? null : s.k)}>
          <span className="k">{s.k}</span>
          <span className={'v' + (s.ph ? ' ph' : '')}>{s.v}{I.chevD}</span>
        </button>
      ))}
    </div>
  );
}

// orange search header — category row horizontally scrollable, persists active
function MSearchHeader({ activeCat = 'Construction', onActiveCat, onMenu, openSeg, onSegToggle }) {
  const cats = MAIN_CATS;
  const active = cats.find(c => c.name === activeCat) || cats[0];
  const catsRef = React.useRef(null);

  // Scroll active cat into view on mount/change using scrollLeft (no scrollIntoView)
  React.useEffect(() => {
    if (!catsRef.current) return;
    const btn = catsRef.current.querySelector('.m-cat.on');
    if (!btn) return;
    const container = catsRef.current;
    const btnLeft = btn.offsetLeft;
    const btnW = btn.offsetWidth;
    const containerW = container.offsetWidth;
    container.scrollLeft = btnLeft - (containerW - btnW) / 2;
  }, [activeCat]);

  return (
    <div className="m-head">
      <div className="m-topbar">
        <span className="m-brand"><img src="../../assets/solidfind-logo.svg" alt="SolidFind"/><span className="id">.id</span></span>
        <span className="m-topbar-sp"/>
        <button className="m-iconbtn" aria-label="Account">{I.user}</button>
        <button className="m-iconbtn" aria-label="Menu" onClick={onMenu}>{I.menu}</button>
      </div>
      <h1 className="m-head-lead">{active.tagline.split('.')[0]}.</h1>
      <div className="m-cats" ref={catsRef}>
        {cats.map(c => (
          <button key={c.name} className={'m-cat' + (c.name === activeCat ? ' on' : '')}
            onClick={() => onActiveCat && onActiveCat(c.name)}>
            <span className="n">{c.num}</span>{c.name}
          </button>
        ))}
      </div>
      <div className="m-search">
        {I.search}
        <input placeholder={'Search ' + active.name.toLowerCase() + ' pros…'} readOnly/>
        <button className="m-search-btn">Search</button>
      </div>
      <MFilterBlock openSeg={openSeg} onToggle={onSegToggle} />
    </div>
  );
}

// results bar with sort
function MResultsBar({ count = 5 }) {
  const S = (typeof SETTINGS !== 'undefined') ? SETTINGS : { proEnabled: true, reviewsEnabled: true };
  const opts = [
    'Latest',
    ...(S.proEnabled    ? ['Ranking']   : []),
    ...(S.reviewsEnabled ? ['Favorites'] : []),
    'Team size: Smallest first',
    'Team size: Largest first',
    'Projects: Few → More',
    'Projects: More → Few',
  ];
  const [sort, setSort] = React.useState('Latest');
  const [open, setOpen] = React.useState(false);
  const [proOnly, setProOnly] = React.useState(false);
  return (
    <div className="m-results" style={{ position: 'relative' }}>
      <span className="m-results-count">{count}</span>
      <span className="m-results-sub">solidfinds</span>
      <span className="m-results-sp"/>
      {S.proEnabled && (
        <button
          className="m-pill"
          style={proOnly
            ? { background: 'var(--sf-ink)', color: '#fff', borderColor: 'var(--sf-ink)', alignItems: 'center' }
            : { alignItems: 'center' }}
          onClick={() => setProOnly(o => !o)}
        >
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: proOnly ? '#fff' : 'var(--sf-orange)', display: 'inline-block', flexShrink: 0 }}/>
          PRO
        </button>
      )}
      <button className={'m-pill' + (open ? ' open' : '')} onClick={() => setOpen(o => !o)}>
        <span className="k">Sort by</span><span className="v">{sort}</span>{I.chevD}
      </button>
      {open && (
        <div className="m-sort-menu">
          {opts.map(o => (
            <button key={o} className={'m-sort-opt' + (sort === o ? ' on' : '')}
              onClick={() => { setSort(o); setOpen(false); }}>{o}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function MPager() {
  return (
    <div className="m-pager">
      <button className="m-page arrow">‹</button>
      <button className="m-page on">1</button>
      <button className="m-page">2</button>
      <button className="m-page">3</button>
      <button className="m-page dots">…</button>
      <button className="m-page">8</button>
      <button className="m-page arrow">›</button>
    </div>
  );
}

// compact horizontal card — no "0 projects" if no count
function MCardH({ pro }) {
  const S = (typeof SETTINGS !== 'undefined') ? SETTINGS : { proEnabled: true, reviewsEnabled: true };
  const hasR = pro.reviewCount > 0 && S.reviewsEnabled;
  const hasP = pro.projects > 0;
  return (
    <article className="m-card-h">
      <div className="m-card-h-top">
        <div className="thumb" style={{ backgroundImage: `url(${pro.photo})` }}/>
        <div className="body">
          <div className="m-card-head">
            <h3 className="m-card-name">{pro.name}</h3>
            {hasR && <span className="m-card-rating"><MSFStar size={12}/>{pro.rating}</span>}
          </div>
          <div className="m-card-meta">{pro.discipline} · {pro.city}</div>
          <p className="m-card-desc">{pro.desc}</p>
        </div>
      </div>
      <div className="m-card-foot">
        <span className="m-card-tag">
          {hasR ? pro.reviewCount + ' reviews' : (hasP ? pro.projects + '+ projects' : '')}
        </span>
        {S.proEnabled && pro.verified && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'var(--sf-font-mono)', fontSize: 9, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--sf-fg-3)', background: 'var(--sf-stone-200)', padding: '3px 7px', borderRadius: 999 }}>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--sf-orange)', display: 'inline-block', flexShrink: 0, alignSelf: 'center' }}/>PRO
          </span>
        )}
        <span className="m-card-view">View →</span>
      </div>
    </article>
  );
}

// About card
function MAboutCard() {
  const A = (typeof ABOUT_CONTENT !== 'undefined') ? ABOUT_CONTENT : {};
  return (
    <article className="m-card-h m-card-feature">
      <div className="m-card-h-top">
        <div className="thumb m-feature-art"/>
        <div className="body">
          <div className="m-card-head">
            <h3 className="m-card-name">SolidFind<span style={{ color: 'var(--sf-orange)' }}>.id</span></h3>
          </div>
          <div className="m-card-meta">About the platform</div>
          <p className="m-card-desc">{A.tagline || 'An independent platform for the places we live in.'}</p>
        </div>
      </div>
      <div className="m-card-foot">
        <span className="m-card-tag" style={{ fontFamily: 'var(--sf-font-mono)', fontSize: 9, letterSpacing: '.08em', textTransform: 'uppercase' }}>About</span>
        <span className="m-card-view">Read →</span>
      </div>
    </article>
  );
}

// Article card — ARTICLE label in same slot as reviews, same mono style
function MArticleCard({ article }) {
  if (!article) return null;
  return (
    <article className="m-card-h m-card-feature">
      <div className="m-card-h-top">
        <div className="thumb" style={{ backgroundImage: `url(${article.cover})` }}/>
        <div className="body">
          <h3 className="m-card-name">{article.title}</h3>
          <p className="m-card-desc">{article.subtitle}</p>
        </div>
      </div>
      <div className="m-card-foot">
        <span className="m-card-tag" style={{ fontFamily: 'var(--sf-font-mono)', fontSize: 9, letterSpacing: '.08em', textTransform: 'uppercase' }}>Article</span>
        <span className="m-card-view">Read →</span>
      </div>
    </article>
  );
}

// menu drawer — icon mark in white, one-at-a-time accordions, light grey on open section
function MMenuDrawer() {
  const cats = MAIN_CATS;
  const accs = [
    { id: 'cat',   lbl: 'Categories', items: cats.map((c, i) => String(i + 1).padStart(2, '0') + ' · ' + c.name) },
    { id: 'build', lbl: 'Build',      items: ['For individuals', 'For professionals', 'List your services', 'Pro guidelines'] },
    { id: 'solid', lbl: 'Solid',      items: ['About', 'Terms and Conditions', 'Contact'] },
  ];
  const [open, setOpen] = React.useState({ cat: true });
  const toggle = (id) => setOpen(o => o[id] ? {} : { [id]: true });
  return (
    <div className="m-overlay">
      <div className="m-scrim"/>
      <div className="m-drawer">
        <div className="m-drawer-top">
          <div className="m-drawer-head">
            {/* icon mark white — same size as close button (36px) */}
            <span style={{ color: '#fff', display: 'flex', alignItems: 'center', width: 36, height: 36, justifyContent: 'center' }}><MSFIcon size={36}/></span>
            <span className="m-topbar-sp"/>
            <span className="m-lang m-drawer-lang"><button className="on">EN</button><button>ID</button></span>
            <button className="m-iconbtn m-drawer-close" aria-label="Close" style={{ flexShrink: 0, width: 36, height: 36 }}>{I.close}</button>
          </div>
        </div>
        <div className="m-drawer-nav">
          {accs.map(a => (
            <div key={a.id} className={'m-acc' + (open[a.id] ? ' open' : '')}>
              <button className="m-acc-head" onClick={() => toggle(a.id)}>
                <span className="lbl">{a.lbl}</span>{I.chevD}
              </button>
              {open[a.id] && <div className="m-acc-body">{a.items.map(it => <a key={it}>{it}</a>)}</div>}
            </div>
          ))}
        </div>
        <div className="m-drawer-foot">
          <button className="m-btn m-btn-pri m-btn-block">List your services</button>
          <button className="m-btn m-btn-ghost m-btn-block">Log in</button>
        </div>
        <div className="m-drawer-divide"/>
        <div className="m-drawer-legal">
          <span className="cc">© 2026 SolidFind.id</span>
          <a href="https://instagram.com/solidfind.id" target="_blank" rel="noopener noreferrer">Instagram</a>
        </div>
      </div>
    </div>
  );
}

function MMiniHeader({ onMenu }) {
  return (
    <div className="m-mini m-mini-grad">
      <span className="m-brand" style={{ color: '#fff' }}><img src="../../assets/solidfind-logo.svg" alt="SolidFind" style={{ filter: 'brightness(0) invert(1)' }}/></span>
      <span style={{ flex: 1 }}/>
      <button className="m-iconbtn" style={{ color: '#fff' }} aria-label="Search">{I.search}</button>
      <button className="m-mini-filters" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.12)' }}>{I.sliders}Filters</button>
      <button className="m-iconbtn" style={{ color: '#fff' }} aria-label="Menu" onClick={onMenu}>{I.menu}</button>
    </div>
  );
}

// collapsed footer
function MFooter() {
  return (
    <footer className="m-footer">
      <div className="m-footer-top">
        <span className="m-footer-brand" style={{ cursor: 'pointer' }}>
          <img src="../../assets/solidfind-logo.svg" alt="SolidFind"/>
          <span className="id">.id</span>
        </span>
        <span className="m-lang m-footer-lang">
          <button className="on">EN</button>
          <button>ID</button>
        </span>
      </div>
      <p className="m-footer-tag">An independent platform for the places we live in.</p>
      <div className="m-footer-bar">
        <span className="cc">© 2026 SolidFind.id</span>
        <a href="https://instagram.com/solidfind.id" target="_blank" rel="noopener noreferrer">Instagram</a>
      </div>
    </footer>
  );
}

// budget range scale
const M_BUDGET = [50, 100, 150, 250, 400, 600, 800, 1200, 2000, 3000];
const mFmt = (jt) => jt >= 1000 ? (jt / 1000).toString().replace(/\.0$/, '') + ' M' : jt + ' jt';
function MBudgetScale({ value, onChange }) {
  const [lo, hi] = value || [2, 7];
  const max = M_BUDGET.length - 1;
  const pct = (i) => (i / max) * 100;
  return (
    <div className="m-range">
      <div className="m-range-vals">
        <div><span className="m-range-cap">Entry</span><b>IDR {mFmt(M_BUDGET[lo])}</b></div>
        <div className="r"><span className="m-range-cap">Exit</span><b>IDR {mFmt(M_BUDGET[hi])}{hi === max ? '+' : ''}</b></div>
      </div>
      <div className="m-range-track">
        <div className="m-range-rail"/>
        <div className="m-range-fill" style={{ left: pct(lo) + '%', right: (100 - pct(hi)) + '%' }}/>
        <input type="range" min="0" max={max} step="1" defaultValue={lo}
          onChange={onChange ? e => onChange([Math.min(+e.target.value, hi), hi]) : undefined} aria-label="Min"/>
        <input type="range" min="0" max={max} step="1" defaultValue={hi}
          onChange={onChange ? e => onChange([lo, Math.max(+e.target.value, lo)]) : undefined} aria-label="Max"/>
      </div>
    </div>
  );
}

// ad slot
function MAdSlot() {
  return (
    <div className="m-ad-slot">
      <span className="m-ad-label">Sponsored</span>
      <div className="m-ad-body">
        <div className="m-ad-icon">
          <svg viewBox="0 0 26 21" width="26" height="21" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="1" y="1.1" width="18" height="18.8" rx="1.8"/><path d="M1 4h18"/><path d="M21 11v8M17 15h8"/></svg>
        </div>
        <div>
          <div className="m-ad-head">Your studio here</div>
          <div className="m-ad-sub">Advertise on SolidFind →</div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  I, MGLYPHS, MSFIcon, MSFStar, MCheck, MStars, MStatus,
  MSearchHeader, MFilterBlock, MFilterMenu, MSizeMenu, MTypeMenu, MMiniHeader,
  MFooter, MResultsBar, MPager, MCardH, MAboutCard, MArticleCard, MMenuDrawer, MAdSlot,
  MBudgetScale, M_BUDGET, mFmt,
});
