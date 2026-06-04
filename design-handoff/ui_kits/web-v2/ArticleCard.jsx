// SolidFind — About card + Article card (sit in the listing grid) + Article page

// About card — same shape/size as a company card, links to the About page
function AboutCard({ onOpen }) {
  const A = (typeof ABOUT_CONTENT !== 'undefined') ? ABOUT_CONTENT : {};
  return (
    <article className="sf-pro-card sf-feature-card" onClick={onOpen}>
      <div className="sf-pro-photo sf-aboutcard-art"></div>
      <div className="sf-pro-body">
        <div className="sf-pro-head"><h3 className="sf-pro-name">SolidFind<span className="sf-feature-id">.id</span></h3></div>
        <p className="sf-pro-desc sf-feature-desc">{A.tagline}</p>
        <div className="sf-pro-foot">
          <span style={{ fontFamily: 'var(--sf-font-mono)', fontSize: 10, fontWeight: 500, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--sf-fg-3)' }}>About</span>
          <span className="sf-pri-link">About →</span>
        </div>
      </div>
    </article>
  );
}
window.AboutCard = AboutCard;

// Article card — same shape/size as a company card; cover = article cover image
function ArticleCard({ article, onOpen }) {
  return (
    <article className="sf-pro-card sf-feature-card sf-article-card" onClick={onOpen}>
      <div className="sf-pro-photo" style={{ backgroundImage: `url(${article.cover})` }}></div>
      <div className="sf-pro-body">
        <div className="sf-pro-head"><h3 className="sf-pro-name">{article.title}</h3></div>
        <p className="sf-pro-desc">{article.subtitle}</p>
        <div className="sf-pro-foot">
          <span style={{ fontFamily: 'var(--sf-font-mono)', fontSize: 10, fontWeight: 500, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--sf-fg-3)' }}>Article</span>
          <span className="sf-pri-link">Read →</span>
        </div>
      </div>
    </article>
  );
}
window.ArticleCard = ArticleCard;

// Article reading page — cover hero + editorial two-column body (sticky meta rail)
function ArticlePage({ article, onBack, onHome, onAccount, onListService }) {
  const blocks = article.blocks || [];
  // estimate read time from the prose
  const words = blocks.filter(b => b.type === 'text' || b.type === 'heading')
    .reduce((n, b) => n + (b.text || '').split(/\s+/).length, 0);
  const readTime = Math.max(2, Math.round(words / 180));
  const shareUrl = 'https://solidfind.id/journal/' + (article.id || '');
  const shares = [
    { k: 'whatsapp', label: 'WhatsApp', href: 'https://wa.me/?text=' + encodeURIComponent(article.title + ' ' + shareUrl) },
    { k: 'facebook', label: 'Facebook', href: 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(shareUrl) },
    { k: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(shareUrl) },
    { k: 'email',    label: 'Email',    href: 'mailto:?subject=' + encodeURIComponent(article.title) + '&body=' + encodeURIComponent(shareUrl) },
  ];
  let firstText = true;
  return (
    <main className="sf-about sf-article" data-screen-label="Article">
      <div className="sf-article-hero" style={{ backgroundImage: `url(${article.cover})` }}>
        <div className="sf-article-hero-shade" aria-hidden="true"/>
        <SFPageHeaderBar onHome={onHome} onAccount={onAccount} onListService={onListService} />
        <div className="sf-article-hero-copy">
          <span className="sf-tag-light">{(article.cats || []).join(' · ')}</span>
          <h1>{article.title}</h1>
          <p>{article.subtitle}</p>
        </div>
      </div>

      <div className="sf-article-wrap">
        <button className="sf-about-back" onClick={onBack}>← Back</button>

        <div className="sf-article-grid">
          <aside className="sf-article-meta">
            <div className="sf-article-meta-block">
              <span className="sf-tag-mono">Filed under</span>
              <div className="sf-article-cats">{(article.cats || []).map(c => <span key={c}>{c}</span>)}</div>
            </div>
            <div className="sf-article-meta-block">
              <span className="sf-tag-mono">Reading time</span>
              <p className="sf-article-meta-val">{readTime} min read</p>
            </div>
            <div className="sf-article-meta-block">
              <span className="sf-tag-mono">Share this story</span>
              <div className="sf-social sf-article-share">
                {shares.map(s => (
                  <a key={s.k} className="sf-social-btn" href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} title={s.label}>{SF_GLYPHS[s.k]}</a>
                ))}
              </div>
            </div>
          </aside>

          <div className="sf-article-col">
            {blocks.map((b, i) => {
              if (b.type === 'heading') return <h2 className="sf-article-h2" key={i}>{b.text}</h2>;
              if (b.type === 'text') {
                const lead = firstText; firstText = false;
                return <p className={'sf-article-p' + (lead ? ' is-lead' : '')} key={i}>{b.text}</p>;
              }
              if (b.type === 'quote')   return <blockquote className="sf-article-quote" key={i}>{b.text}{b.cite && <cite>— {b.cite}</cite>}</blockquote>;
              if (b.type === 'image')   return <figure className="sf-article-fig" key={i}><img src={b.src} alt={b.caption || ''}/>{b.caption && <figcaption>{b.caption}</figcaption>}</figure>;
              if (b.type === 'video')   return (
                <figure className="sf-article-fig sf-article-video" key={i}>
                  <div className="sf-article-videobox" style={{ backgroundImage: b.poster ? `url(${b.poster})` : 'none' }}>
                    <span className="sf-article-play" aria-hidden="true">▶</span>
                  </div>
                  {b.caption && <figcaption>{b.caption}</figcaption>}
                </figure>
              );
              return null;
            })}
            <button className="sf-about-back sf-legal-totop" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>↑ Back to top</button>
          </div>
        </div>
        <AdSlot variant="banner" size="970 × 120" headline={'Sponsored · top ' + 'professionals advertise here'} />
      </div>
    </main>
  );
}
window.ArticlePage = ArticlePage;
