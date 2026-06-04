// SolidFind — Results toolbar (count + verified toggle + sort)
function Filters({ count, total, verifiedOnly, onVerified, sort, onSort }) {
  const S = (typeof SETTINGS !== 'undefined') ? SETTINGS : { proEnabled: true, reviewsEnabled: true };
  // sort options gate on back-office switches: Ranking = Pro feature, Favorites = review feature
  const opts = [
    'Latest',
    ...(S.proEnabled ? ['Ranking'] : []),
    ...(S.reviewsEnabled ? ['Favorites'] : []),
    'Team size: Smallest first',
    'Team size: Largest first',
    'Projects: Few → More',
    'Projects: More → Few',
  ];
  return (
    <div className="sf-results-bar">
      <span className="sf-results-count"><b>{count}</b></span>
      <span className="sf-results-sub">solidfinds</span>
      <div className="sf-results-meta">
        {S.proEnabled && (
        <button
          className={'sf-chip-ghost' + (verifiedOnly ? ' active' : '')}
          onClick={() => onVerified?.(!verifiedOnly)}
          style={verifiedOnly ? { background: 'var(--sf-ink)', color: '#fff', borderColor: 'var(--sf-ink)' } : null}
        ><span className="d"/>Pro Account only</button>
        )}
        <Dropdown
          label="Sort by"
          value={sort}
          options={opts}
          onChange={onSort}
          align="right"
          size="sm"
        />
      </div>
    </div>
  );
}
window.Filters = Filters;
