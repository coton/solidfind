// SolidFind mobile — company profile (detail) page. Adapts desktop ProDetail.
function MobileProfile() {
  const c = COMPANY;
  const services = c.services || [{ name: c.main, subs: c.subs || [] }];
  const allAreas = (c.areas || []).length >= LOCATIONS.length;
  const sizeLabel = (s) => s + (SIZE_RANGE[s] ? ' (' + SIZE_RANGE[s] + ')' : '');
  const gallery = c.gallery.slice(0, 12);
  const [svcOpen, setSvcOpen] = React.useState(false);
  const socials = [
    { k: 'email', ico: MGLYPHS.email }, { k: 'whatsapp', ico: MGLYPHS.whatsapp },
    { k: 'facebook', ico: MGLYPHS.facebook }, { k: 'instagram', ico: MGLYPHS.instagram },
    { k: 'linkedin', ico: MGLYPHS.linkedin },
  ].filter(s => c.contact[s.k]);
  const flag = <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22V4M4 4h13l-2 4 2 4H4"/></svg>;

  return (
    <div className="m-screen">
      <div className="m-scroll">
        {/* hero */}
        <div className="m-pf-hero" style={{ backgroundImage: `url(${c.photo})` }}>
          <div className="shade"/>
          <button className="m-pf-back">← Back</button>
          <div className="m-pf-hero-acts">
            <button aria-label="Share">{I.share}</button>
            <button aria-label="Bookmark">{I.bookmark}</button>
          </div>
          <div className="m-pf-lockup">
            <span className="m-pf-logo">{c.name.charAt(0)}</span>
            <div className="m-pf-lockup-text">
              <h1>{c.name}</h1>
              <div className="m-pf-meta">
                <span>{c.city}</span>
                <span className="dotsep"/>
                <span className="score">{I.star} {c.rating} · {c.reviewCount} reviews</span>
                <span className="dotsep"/>
                <span>{c.verified ? 'Pro Account' : 'Free account'}</span>
                <span className="cat">{c.main}</span>
              </div>
            </div>
          </div>
        </div>

        {/* about — with a jump-to-details link top-right */}
        <div className="m-pf-section">
          <div className="m-pf-h2row">
            <h2 className="m-h2" style={{ margin: 0 }}>About</h2>
            <a className="m-pf-detailbtn" href="#m-company-details">Company details ↓</a>
          </div>
          <div className="m-pf-prose">
            <p>{c.name} is a {c.discipline.toLowerCase()} based in {c.city}, working between architecture, build and renovation across residential and small-scale commercial projects. The studio is known for tropical-modern detailing and a steady preference for locally-sourced materials.</p>
            <p>Every engagement starts with a measured brief: site visits, a clear scope, and a fixed schedule before a single drawing is committed. The team handles permitting, contractor coordination and on-site supervision in-house, which keeps the chain of accountability short.</p>
          </div>
        </div>

        {/* services & coverage — collapsed accordion */}
        <div className="m-pf-section">
          <div className={'m-acc2' + (svcOpen ? ' open' : '')}>
            <button className="m-acc2-head" onClick={() => setSvcOpen(o => !o)}>
              <span className="t">Services &amp; coverage</span>
              <span className="chev">{I.chevD}</span>
            </button>
            {svcOpen && (
              <div className="m-acc2-body">
                <div className="m-svc-row">
                  <span className="m-svc-term">Provided services</span>
                  <div style={{ marginTop: 6 }}>
                    {services.map(svc => (
                      <div className="m-svc-svc" key={svc.name}>
                        <span className="m-svc-name">{svc.name}</span>
                        {svc.subs && svc.subs.length > 0 && <p className="m-svc-desc">{svc.subs.join(' · ')}</p>}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="m-svc-row">
                  <span className="m-svc-term">Project size</span>
                  <p className="m-svc-desc">{(c.sizes || []).map(sizeLabel).join(' · ')}</p>
                </div>
                <div className="m-svc-row">
                  <span className="m-svc-term">Locations</span>
                  <p className="m-svc-desc">{allAreas ? 'Bali — all regions' : (c.areas || []).join(' · ')}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* recent work — 12 projects, one line, horizontal scroll */}
        <div className="m-pf-section">
          <div className="m-pf-h2row">
            <h2 className="m-h2" style={{ margin: 0 }}>Recent work</h2>
            {gallery.length > 0 && <span className="m-eyebrow">{gallery.length} projects</span>}
          </div>
          <div className="m-hscroll">
            {gallery.map((src, i) => (
              <div className="m-thumb" key={i} style={{ backgroundImage: `url(${src})` }}>
                {i % 5 === 2 && <span className="play">▶</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="m-pf-section" id="m-company-details">
          <h2 className="m-h2">Company details</h2>
          <div className="m-pf-social">{socials.map(s => <a key={s.k} aria-label={s.k}>{s.ico}</a>)}</div>
          <dl className="m-pf-kv">
            <dt>Region</dt><dd>{c.city}</dd>
            {c.projects > 0 && <React.Fragment><dt>Projects</dt><dd>{c.projects}+ completed</dd></React.Fragment>}
            <dt>Team size</dt><dd>{c.team}+ people</dd>
            <dt>Founded</dt><dd>{c.founded}</dd>
            <dt>Avg. project</dt><dd>IDR 250–600 jt</dd>
            <dt>Languages</dt><dd>Bahasa, English</dd>
          </dl>
        </div>

        {/* reviews */}
        <div className="m-pf-section">
          <div className="m-pf-h2row">
            <h2 className="m-h2" style={{ margin: 0 }}>Reviews</h2>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--sf-orange)' }}>All {c.reviewCount} →</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {c.reviews.slice(0, 2).map((r, i) => (
              <div className="m-review" key={i}>
                <div className="m-review-top">
                  <MStars n={r.rating} />
                  <span className="m-review-when">{r.context}</span>
                </div>
                <p>"{r.text}"</p>
                <div className="m-review-by">{r.author}</div>
              </div>
            ))}
          </div>
        </div>

        {/* actions — mirror desktop */}
        <div className="m-pf-section">
          <div className="m-pf-actions">
            <button className="m-btn m-btn-ghost m-btn-block">Save to shortlist</button>
            <button className="m-btn m-btn-ghost m-btn-block">Write a review <MSFStar size={15} outline/></button>
            <div className="m-pf-actions-row">
              <button className="m-iconbtn-o" aria-label="Share">{I.share}</button>
              <button className="m-iconbtn-o" aria-label="Report">{flag}</button>
            </div>
          </div>
        </div>

        <MFooter/>
      </div>
    </div>
  );
}

Object.assign(window, { MobileProfile });
