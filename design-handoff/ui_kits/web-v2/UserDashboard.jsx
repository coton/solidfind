// SolidFind — Individual dashboard ("For individuals")

// A saved company card. Un-bookmarking flags it for removal (controlled by the
// parent) and shows an Undo overlay; the removal only becomes permanent on logout.
function SavedCard({ pro, onOpen, pending, onRemove, onUndo }) {
  return (
    <div className="sf-saved-cardwrap">
      <ProCard key={pending ? 'rm' : 'mk'} pro={pro} onOpen={onOpen} defaultMarked={!pending}
        onToggleSave={(p, nowMarked) => { if (nowMarked) onUndo(p.id); else onRemove(p.id); }} />
      {pending && (
        <div className="sf-saved-removed">
          <p>Removed <b>{pro.name}</b> from your saved companies.</p>
          <button className="sf-saved-undo" onClick={() => onUndo(pro.id)}>
            <svg width="15" height="15" viewBox="0 0 21 21" fill="currentColor" aria-hidden="true"><path d="M7.07812 0.547852C9.47004 -0.260526 12.0746 -0.171686 14.4062 0.796875C16.7379 1.76567 18.639 3.54903 19.7539 5.81445C20.8688 8.0801 21.1218 10.6746 20.4668 13.1133C19.8116 15.5518 18.2924 17.6693 16.1924 19.0713C14.0923 20.4731 11.5541 21.0644 9.05078 20.7344C6.5475 20.4042 4.24892 19.1756 2.58398 17.2773C0.91918 15.379 0.000793815 12.9399 0 10.415C-3.13726e-06 9.863 0.447968 9.41441 1 9.41406C1.55203 9.41406 1.99964 9.86205 2 10.4141C2.00058 12.4539 2.74294 14.4243 4.08789 15.958C5.43302 17.4917 7.29005 18.4843 9.3125 18.751C11.3349 19.0176 13.3854 18.5407 15.082 17.4082C16.7788 16.2755 18.0059 14.564 18.5352 12.5938C19.0643 10.6237 18.8596 8.52857 17.959 6.69824C17.0583 4.868 15.5234 3.42629 13.6396 2.64355C11.7559 1.861 9.65119 1.78937 7.71875 2.44238C6.37519 2.89652 5.17904 3.68073 4.23047 4.70898H6.88281C7.43502 4.70908 7.88281 5.15676 7.88281 5.70898C7.88269 6.26111 7.43494 6.70889 6.88281 6.70898H2.17676C1.62458 6.70895 1.17688 6.26114 1.17676 5.70898V1.00293C1.17676 0.450664 1.6245 0.00296074 2.17676 0.00292969C2.72904 0.00292969 3.17676 0.450645 3.17676 1.00293V2.92773C4.27706 1.86378 5.60585 1.04549 7.07812 0.547852Z"/></svg>
            Undo
          </button>
        </div>
      )}
    </div>
  );
}
window.SavedCard = SavedCard;

function UserDashboard({ user, savedByCat, pendingRemoved, onRemoveSaved, onUndoSaved, onOpen, onBrowse }) {
  const u = user;
  const CAP = 5;
  const S = (typeof SETTINGS !== 'undefined') ? SETTINGS : { reviewsEnabled: true, activeCategories: ['Construction', 'Renovation', 'Architecture', 'Interior', 'Real Estate'] };
  const activeCats = (S.activeCategories || MAIN_CATS.map(m => m.name));
  const catListText = activeCats.length > 1
    ? activeCats.slice(0, -1).map(c => c.toLowerCase()).join(', ') + ' and ' + activeCats[activeCats.length - 1].toLowerCase()
    : (activeCats[0] || 'construction').toLowerCase();
  const [expanded, setExpanded] = React.useState({});   // catName -> bool
  const [allReviews, setAllReviews] = React.useState(false);
  const [confirmDel, setConfirmDel] = React.useState(false);
  const [delReason, setDelReason] = React.useState('');
  const [delPick, setDelPick] = React.useState('');
  const DEL_REASONS = ['Found what I needed', 'Not useful enough', 'Too many emails', 'Privacy concerns', 'Other'];
  const totalSaved = savedByCat.reduce((n, g) => n + g.items.length, 0);
  const Stars = ({ n }) => <SFStars n={n} size={13} />;
  const reviews = u.reviews.slice(0, 3);

  return (
    <main className="sf-dash" data-screen-label="Individual dashboard">
      <div className="sf-dash-intro">
        <div className="sf-user-eyebrow">
          <span className="sf-tag-mono">Individual account · <span className="sf-eyebrow-pro">{u.email}</span></span>
          <button className="sf-user-delete" onClick={() => setConfirmDel(true)}>Delete account</button>
        </div>
        <h1 className="sf-dash-hi">Hi, {u.name.split(' ')[0]}.</h1>
        <p className="sf-dash-sub">Everything you've saved while planning, in one place. Pick up where you left off, compare companies and revisit the reviews you've written.</p>
      </div>

      <div className="sf-dash-layout">
        {/* ── left: saved listings, grouped by category ───────── */}
        <div className="sf-dash-main">
          <div className="sf-saved-head">
            <h2 className="sf-h2-static" style={{ margin: 0 }}>Saved companies</h2>
            <span className="sf-saved-count">{totalSaved} saved across {savedByCat.length} categories</span>
          </div>

          {savedByCat.map((g) => {
            const isOpen = expanded[g.cat];
            const shown = isOpen ? g.items : g.items.slice(0, CAP);
            return (
              <section className="sf-saved-group" key={g.cat}>
                <div className="sf-saved-group-head">
                  <span className="sf-saved-num">{g.num}</span>
                  <h3>{g.cat}</h3>
                  <span className="sf-saved-tag">{g.items.length} saved</span>
                </div>
                <div className="sf-saved-grid">
                  {shown.map(p => <SavedCard key={p.id} pro={p} onOpen={onOpen} pending={!!(pendingRemoved && pendingRemoved.has(p.id))} onRemove={onRemoveSaved} onUndo={onUndoSaved} />)}
                </div>
                {g.items.length > CAP && (
                  <button className="sf-saved-seeall" onClick={() => setExpanded(e => ({ ...e, [g.cat]: !isOpen }))}>
                    {isOpen ? 'Show less' : 'See all ' + g.items.length + ' ' + g.cat.toLowerCase() + ' →'}
                  </button>
                )}
              </section>
            );
          })}

          <div className="sf-saved-empty-cta">
            <div>
              <h3>Looking for something else?</h3>
              <p>Browse all {catListText} companies across Bali.</p>
            </div>
            <button className="sf-btn sf-btn-lg sf-btn-pri" onClick={onBrowse}>Browse companies →</button>
          </div>
        </div>

        {/* ── right: my reviews + ad ──────────────────────────── */}
        <aside className="sf-dash-side">
          {S.reviewsEnabled && (
          <React.Fragment>
          <div className="sf-dash-side-head">
            <h2 className="sf-h2-static" style={{ margin: 0 }}>Your reviews</h2>
            <span className="sf-pro-pill">{u.reviews.length}</span>
          </div>
          <p className="sf-results-sub" style={{ margin: '0 0 14px' }}>Latest reviews you've posted</p>
          <div className="sf-myrev-list">
            {reviews.map((r, i) => (
              <div className="sf-myrev" key={i}>
                <div className="sf-myrev-top">
                  <div>
                    <div className="sf-myrev-company">{r.company}</div>
                    <span className="sf-tag-mono">{r.main}</span>
                  </div>
                  <Stars n={r.rating} />
                </div>
                <p>"{r.text}"</p>
                <div className="sf-myrev-foot">
                  <span className="sf-review-when">{r.when}</span>
                  <button className="sf-myrev-link" onClick={() => { const p = SAVED.find(x => x.id === r.companyId); if (p) onOpen(p); }}>View company →</button>
                </div>
              </div>
            ))}
          </div>
          {u.reviews.length > 3 && (
            <button className="sf-saved-seeall" style={{ marginTop: 12 }} onClick={() => setAllReviews(true)}>
              See all {u.reviews.length} reviews →
            </button>
          )}
          </React.Fragment>
          )}

          <AdSlot variant="box" size="300 × 250" headline="Find your next pro" />
        </aside>
      </div>

      {confirmDel && (
        <div className="sf-modal-scrim" onClick={() => setConfirmDel(false)}>
          <div className="sf-modal sf-modal-confirm" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
            <div className="sf-confirm-ico" aria-hidden="true">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M10 11v6M14 11v6"/></svg>
            </div>
            <h2>Delete your account?</h2>
            <p>This permanently removes <b>{u.email}</b> — your saved companies and the reviews you've written. This can't be undone.</p>
            <div className="sf-del-reason">
              <span className="sf-tag-mono">Mind sharing why? (optional)</span>
              <div className="sf-del-chips">
                {DEL_REASONS.map(r => (
                  <button type="button" key={r} className={'sf-del-chip' + (delPick === r ? ' on' : '')} onClick={() => setDelPick(p => p === r ? '' : r)}>{r}</button>
                ))}
              </div>
              <textarea className="sf-edit-textarea" rows={3} value={delReason} onChange={e => setDelReason(e.target.value)} placeholder="Tell us what we could have done better — this helps us improve SolidFind." />
            </div>
            <div className="sf-confirm-actions">
              <button className="sf-btn sf-btn-lg sf-btn-ghost" onClick={() => setConfirmDel(false)}>Keep account</button>
              <button className="sf-btn sf-btn-lg sf-btn-danger" onClick={() => { setConfirmDel(false); onBrowse && onBrowse(); }}>Delete permanently</button>
            </div>
          </div>
        </div>
      )}
      {allReviews && (
        <div className="sf-modal-scrim" onClick={() => setAllReviews(false)}>
          <div className="sf-modal sf-modal-reviews" role="dialog" aria-modal="true" aria-label="Your reviews" onClick={e => e.stopPropagation()}>
            <button className="sf-modal-x" aria-label="Close" onClick={() => setAllReviews(false)}>✕</button>
            <div className="sf-modal-head">
              <span className="sf-tag-mono">{u.reviews.length} reviews</span>
              <h2>Reviews you've written</h2>
              <p>Every review you've posted on SolidFind, newest first.</p>
            </div>
            <div className="sf-modal-reviews-list">
              {u.reviews.map((r, i) => (
                <div className="sf-review" key={i}>
                  <div className="sf-review-top">
                    <Stars n={r.rating} />
                    <span className="sf-review-when">{r.when}</span>
                  </div>
                  <p>"{r.text}"</p>
                  <div className="sf-myrev-foot">
                    <span className="sf-review-by" style={{ marginTop: 0 }}>{r.company} · {r.main}</span>
                    <button className="sf-myrev-link" onClick={() => { setAllReviews(false); const p = SAVED.find(x => x.id === r.companyId); if (p) onOpen(p); }}>View company →</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
window.UserDashboard = UserDashboard;
