// SolidFind — ProDetail
function ProDetail({ pro, onBack, onSeeReviews, account, onReview, onLogin }) {
  const S = (typeof SETTINGS !== 'undefined') ? SETTINGS : { proEnabled: true, reviewsEnabled: true };
  const contact = pro.contact || {};
  const hasReviews = pro.reviewCount > 0;
  const showReviews = S.reviewsEnabled && hasReviews;
  const share = () => window.dispatchEvent(new CustomEvent('sf-share', { detail: pro }));
  const [shortlisted, setShortlisted] = React.useState(false);
  const saveShortlist = () => account ? setShortlisted(s => !s) : (onLogin && onLogin());
  const [lightbox, setLightbox] = React.useState(null);
  React.useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e) => {
      if (e.key === 'ArrowRight') setLightbox(i => (i + 1) % gallery.length);
      if (e.key === 'ArrowLeft')  setLightbox(i => (i - 1 + gallery.length) % gallery.length);
      if (e.key === 'Escape')     setLightbox(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox]);
  // Pro Accounts may show up to 12 project pictures / videos; free accounts are capped.
  const DEFAULT_GALLERY = [
    '../../assets/photo-architecture.jpg', '../../assets/photo-bricks.jpg',
    '../../assets/photo-house.jpg', '../../assets/photo-detail.jpg',
    '../../assets/photo-warm.jpg', '../../assets/concrete-1.jpg',
    '../../assets/concrete-2.jpg', '../../assets/photo-construction-wide.jpg',
    '../../assets/photo-architecture.jpg', '../../assets/photo-house.jpg',
    '../../assets/photo-detail.jpg', '../../assets/photo-warm.jpg',
  ];
  const fullGallery = pro.gallery || DEFAULT_GALLERY;
  const cap = pro.verified ? 12 : 4;
  const gallery = fullGallery.slice(0, cap);

  // services & coverage — mirrors what the company entered on their profile edit page
  const services = pro.services || [{ name: pro.main, subs: pro.subs || [] }];
  const sizes = pro.sizes || (pro.size ? [pro.size] : []);
  const areas = pro.areas || (pro.city ? [pro.city] : []);
  const sizeLabel = (s) => s + ((typeof SIZE_RANGE !== 'undefined' && SIZE_RANGE[s]) ? ' (' + SIZE_RANGE[s] + ')' : '');

  return (
    <React.Fragment>
    <div className="sf-detail">
      <button className="sf-back" onClick={onBack}>← Back to results</button>
      <div className="sf-detail-hero" style={{ backgroundImage: `url(${pro.photo})` }}>
        <div className="sf-detail-hero-shade"/>
        <div className="sf-detail-hero-copy">
          <div className="sf-detail-lockup">
            <span className="sf-detail-logo" aria-hidden="true">{(typeof sfInitials !== 'undefined' ? sfInitials(pro.name) : (pro.name || '?').trim().charAt(0).toUpperCase())}</span>
            <div className="sf-detail-lockup-text">
              <h1>{pro.name}<span className="dot"/></h1>
              <div className="sf-detail-meta">
                <span>{pro.city}</span>
                {showReviews && <React.Fragment><span className="dotsep"/><span className="sf-meta-score"><SFStar size={13} /> {pro.rating} · {pro.reviewCount} reviews</span></React.Fragment>}
                {S.proEnabled && <React.Fragment><span className="dotsep"/><span>{pro.verified ? 'Pro Account' : 'Free account'}</span></React.Fragment>}
                <span className="sf-detail-title">{pro.main}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="sf-detail-body">
        <section className="sf-detail-main">
          <h2 className="sf-h2-static" style={{ marginTop: 0 }}>About</h2>
          <div className="sf-detail-p">
            <p>{pro.name} is a {pro.discipline.toLowerCase()} based in {pro.city}, working between architecture, build and renovation across residential and small-scale commercial projects. The studio is known for tropical-modern detailing and a steady preference for locally-sourced materials.</p>
            <p>Every engagement starts with a measured brief: site visits, a clear scope, and a fixed schedule before a single drawing is committed. Clients are walked through each decision — layout, structure, finishes, and budget — so there are no surprises once work begins on site.</p>
            <p>The team handles permitting, contractor coordination and on-site supervision in-house, which keeps the chain of accountability short. Most projects run between three and nine months depending on size, and the studio caps active work so each build gets proper attention.</p>
            <p>Holds a Pro Account on SolidFind, with documents, past projects and client references on file — backed by a track record of clean handovers and responsive aftercare.</p>
          </div>

          <h2 className="sf-h2-static">Services &amp; coverage</h2>
          <dl className="sf-svc">
            <div className="sf-svc-row">
              <dt className="sf-svc-term">Provided services</dt>
              <dd className="sf-svc-def">
                {services.map(svc => (
                  <div className="sf-svc-service" key={svc.name}>
                    <span className="sf-svc-name">{svc.name}</span>
                    {svc.subs && svc.subs.length > 0 && (
                      <p className="sf-svc-desc">{svc.subs.join(' · ')}</p>
                    )}
                  </div>
                ))}
              </dd>
            </div>
            <div className="sf-svc-row">
              <dt className="sf-svc-term">Project size</dt>
              <dd className="sf-svc-def">
                <p className="sf-svc-desc sf-svc-inline">{sizes.map(sizeLabel).join(' · ')}</p>
              </dd>
            </div>
            <div className="sf-svc-row">
              <dt className="sf-svc-term">Locations</dt>
              <dd className="sf-svc-def">
                <p className="sf-svc-desc sf-svc-inline">{areas.length >= (typeof LOCATIONS !== 'undefined' ? LOCATIONS.length : 99) ? 'Bali — all regions' : areas.join(' · ')}</p>
              </dd>
            </div>
          </dl>

          <div className="sf-work-head">
            <h2 className="sf-h2-static" style={{ margin: 0 }}>Recent work</h2>
            {gallery.length > 0 && <span className="sf-tag-mono">{gallery.length} {gallery.length === 1 ? 'project' : 'projects'}</span>}
          </div>
          {gallery.length > 0 && (
            <div className="sf-gallery">
              {gallery.map((src, i) => (
                <div className="sf-thumb sf-thumb-clickable" key={i} style={{ backgroundImage: `url(${src})` }} onClick={() => setLightbox(i)}>
                  {i % 5 === 2 && <span className="sf-thumb-play" aria-hidden="true">▶</span>}
                </div>
              ))}
            </div>
          )}

          {showReviews && (
          <React.Fragment>
          <div className="sf-reviews-head">
            <h2 className="sf-h2-static" style={{ margin: 0 }}>Reviews</h2>
            <button className="sf-btn sf-btn-ghost" onClick={onSeeReviews}>See all {pro.reviewCount} reviews →</button>
          </div>
          <div className="sf-reviews">
            <div className="sf-review">
              <div className="sf-review-head"><b>Pak Andi</b><span>· Renovation · 2 months ago</span></div>
              <p>"Quiet, careful, and absolutely on time. Solid work."</p>
            </div>
            <div className="sf-review">
              <div className="sf-review-head"><b>Bu Maya</b><span>· New build · 5 months ago</span></div>
              <p>"Patient through every iteration. Drawings were clear, the build was clean."</p>
            </div>
          </div>
          </React.Fragment>
          )}
        </section>

        <aside className="sf-detail-side">
          <div className="sf-detail-card">
            <span className="sf-tag-mono">Company details</span>
            <SocialBar contact={contact} />
            <hr/>
            <dl className="sf-kv">
              <dt>Region</dt><dd>{pro.city}</dd>
              <dt>Projects</dt><dd>{pro.projects != null ? pro.projects + '+ completed' : '—'}</dd>
              <dt>Team size</dt><dd>{pro.team != null ? pro.team + '+ people' : '—'}</dd>
              <dt>Founded</dt><dd>{pro.founded || '—'}</dd>
              <dt>Avg. project</dt><dd>IDR 250–600 jt</dd>
              <dt>Languages</dt><dd>Bahasa, English</dd>
            </dl>
            <hr/>
            <button className={'sf-btn ' + (shortlisted ? 'sf-btn-pri' : 'sf-btn-ghost')} style={{width:'100%'}} onClick={saveShortlist}>{shortlisted ? 'Saved to shortlist ✓' : 'Save to shortlist'}</button>
            {S.reviewsEnabled && account !== 'company' && (
              <button className="sf-btn sf-btn-ghost" style={{width:'100%', marginTop:8}}
                onClick={() => account === 'individual' ? (onReview && onReview(pro)) : (onLogin && onLogin())}>
                Write a review
                <SFStar size={15} outline />
              </button>
            )}
            <div className="sf-detail-share-row">
              <button className="sf-btn sf-btn-ghost sf-share-btn" onClick={share}>
                Share
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>
              </button>
              <a className="sf-report" href={'mailto:hello@solidfind.id?subject=' + encodeURIComponent('Report: ' + pro.name)}>
                Report
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22V4M4 4h13l-2 4 2 4H4"/></svg>
              </a>
            </div>
          </div>

          <AdSlot variant="box" size="300 × 250" headline="Reach clients in Bali" />
        </aside>
      </div>
    </div>
    {lightbox !== null && (
      <div className="sf-lightbox" onClick={() => setLightbox(null)}>
        <button className="sf-lightbox-close" onClick={() => setLightbox(null)}>✕</button>
        <button className="sf-lightbox-prev" onClick={(e) => { e.stopPropagation(); setLightbox(i => (i - 1 + gallery.length) % gallery.length); }}>‹</button>
        <div className="sf-lightbox-img" onClick={e => e.stopPropagation()} style={{ backgroundImage: `url(${gallery[lightbox]})` }} />
        <button className="sf-lightbox-next" onClick={(e) => { e.stopPropagation(); setLightbox(i => (i + 1) % gallery.length); }}>›</button>
        <div className="sf-lightbox-count">{lightbox + 1} / {gallery.length}</div>
      </div>
    )}
    </React.Fragment>
  );
}
window.ProDetail = ProDetail;
