// SolidFind mobile — Article reading page (uses ARTICLES[0] from data.jsx)
function MobileArticle({ article: propArticle }) {
  const article = propArticle || (typeof ARTICLES !== 'undefined' ? ARTICLES[0] : null);
  if (!article) return null;
  const blocks = article.blocks || [];
  let firstText = true;

  const renderBlock = (b, i) => {
    if (b.type === 'heading') return <h2 key={i} className="m-art-h2">{b.text}</h2>;
    if (b.type === 'text') {
      const lead = firstText; firstText = false;
      return <p key={i} className={'m-art-p' + (lead ? ' lead' : '')}>{b.text}</p>;
    }
    if (b.type === 'quote') return (
      <blockquote key={i} className="m-art-quote">
        <p>"{b.text}"</p>
        {b.cite && <cite>— {b.cite}</cite>}
      </blockquote>
    );
    if (b.type === 'image') return (
      <figure key={i} className="m-art-fig">
        <div className="m-art-img" style={{ backgroundImage: `url(${b.src})` }}/>
        {b.caption && <figcaption>{b.caption}</figcaption>}
      </figure>
    );
    if (b.type === 'video') return (
      <figure key={i} className="m-art-fig">
        <div className="m-art-video" style={{ backgroundImage: b.poster ? `url(${b.poster})` : 'none' }}>
          <span className="play">▶</span>
        </div>
        {b.caption && <figcaption>{b.caption}</figcaption>}
      </figure>
    );
    return null;
  };

  return (
    <div className="m-screen">
      {/* cover hero — topbar floats over the cover image */}
      <div className="m-art-hero" style={{ backgroundImage: `url(${article.cover})` }}>
        <div className="shade"/>
        {/* topbar sits at very top, z-index 2, above the shade */}
        <div className="m-topbar" style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2 }}>
          <span className="m-brand"><img src="../../assets/solidfind-logo.svg" alt="SolidFind"/><span className="id">.id</span></span>
          <span className="m-topbar-sp"/>
          <button className="m-iconbtn" aria-label="Account">{I.user}</button>
          <button className="m-iconbtn" aria-label="Menu">{I.menu}</button>
        </div>
        <div className="m-art-hero-copy">
          <div className="m-art-cats">
            {(article.cats || []).map(c => <span key={c}>{c}</span>)}
          </div>
          <h1>{article.title}</h1>
          <p>{article.subtitle}</p>
        </div>
      </div>

      <div className="m-scroll">
        <button className="m-back">← Back</button>
        <div className="m-art-body">{blocks.map(renderBlock)}</div>
        <button
          className="m-back"
          onClick={() => { const el = document.querySelector('.m-scroll'); if (el) el.scrollTop = 0; }}
        >↑ Back to top</button>
        <div className="m-pad" style={{ paddingTop: 28, paddingBottom: 32 }}>
          <div className="m-art-share">
            <span className="m-eyebrow">Share this story</span>
            <div className="m-pf-social" style={{ marginBottom: 0 }}>
              {['whatsapp', 'facebook', 'linkedin', 'email'].map(k => (
                <a key={k} aria-label={k} style={{ background: 'var(--sf-stone-200)' }}>{MGLYPHS[k]}</a>
              ))}
            </div>
          </div>
        </div>
        {/* ad slot at bottom before footer */}
        <MAdSlot />
        <MFooter/>
      </div>
    </div>
  );
}

Object.assign(window, { MobileArticle });
