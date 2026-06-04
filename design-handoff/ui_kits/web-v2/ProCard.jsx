// SolidFind — ProCard
const sfInitials = (name) => (name || '').split(/\s+/).filter(Boolean).map(w => w[0]).join('').toUpperCase();
window.sfInitials = sfInitials;

function ProCard({ pro, onOpen, defaultMarked, onToggleSave }) {
  const stop = (e) => e.stopPropagation();
  const S = (typeof SETTINGS !== 'undefined') ? SETTINGS : { proEnabled: true, reviewsEnabled: true };
  const [marked, setMarked] = React.useState(!!defaultMarked);
  const toggleMark = (e) => { e.stopPropagation(); setMarked(m => { const nv = !m; onToggleSave && onToggleSave(pro, nv); return nv; }); };
  const share = (e) => { e.stopPropagation(); window.dispatchEvent(new CustomEvent('sf-share', { detail: pro })); };
  const hasReviews = pro.reviewCount > 0;
  return (
    <article className="sf-pro-card" onClick={() => onOpen?.(pro)}>
      <div className="sf-pro-photo" style={{ backgroundImage: pro.photo ? `url(${pro.photo})` : 'none' }}>
        {!pro.photo && (
          <div className="sf-pro-monogram" aria-hidden="true">{sfInitials(pro.name)}</div>
        )}
        {S.proEnabled && pro.verified && (
          <span className="sf-pro-badge"><span className="d"/>Pro Account</span>
        )}
        <div className="sf-pro-actions">
          <button className="sf-pro-iconbtn" aria-label="Share" onClick={share}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>
          </button>
          <button className={'sf-pro-iconbtn sf-bookmark' + (marked ? ' is-marked' : '')} aria-label={marked ? 'Remove bookmark' : 'Bookmark'} aria-pressed={marked} onClick={toggleMark}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill={marked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.7"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          </button>
        </div>
      </div>
      <div className="sf-pro-body">
        <div className="sf-pro-head">
          <h3 className="sf-pro-name">{pro.name}</h3>
          {S.reviewsEnabled && hasReviews && <span className="sf-pro-rating"><SFStar size={12} /> {pro.rating}</span>}
        </div>
        <div className="sf-pro-meta">{pro.discipline} · {pro.city}</div>
        <p className="sf-pro-desc">{pro.desc}</p>
        <div className="sf-pro-foot">
          <span className="sf-tag-mono">{S.reviewsEnabled && hasReviews ? pro.reviewCount + ' reviews' : (pro.projects > 0 ? pro.projects + '+ projects' : '')}</span>
          <span className="sf-pri-link">View →</span>
        </div>
      </div>
    </article>
  );
}
window.ProCard = ProCard;
