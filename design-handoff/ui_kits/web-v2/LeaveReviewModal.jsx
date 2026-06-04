// SolidFind — Leave a review popup (logged-in individuals, from a company page)
function LeaveReviewModal({ open, pro, onClose }) {
  const [rating, setRating] = React.useState(5);
  const [hover, setHover] = React.useState(0);
  const [text, setText] = React.useState('');
  const [done, setDone] = React.useState(false);
  React.useEffect(() => { if (open) { setRating(5); setHover(0); setText(''); setDone(false); } }, [open]);
  if (!open || !pro) return null;

  return (
    <div className="sf-modal-scrim" onClick={onClose}>
      <div className="sf-modal sf-modal-review" role="dialog" aria-modal="true" aria-label="Write a review" onClick={e => e.stopPropagation()}>
        <button className="sf-modal-x" aria-label="Close" onClick={onClose}>✕</button>
        {done ? (
          <div className="sf-rev-done">
            <div className="sf-confirm-ico" style={{ background: 'var(--sf-peach-100)', color: 'var(--sf-orange)' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h2>Thank you</h2>
            <p>Your review of <b>{pro.name}</b> has been submitted.</p>
            <div className="sf-rev-moderation">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 2 4 5v6c0 5 3.5 8 8 11 4.5-3 8-6 8-11V5z"/><path d="m9 12 2 2 4-4"/></svg>
              <span>We review every new post before it goes live to keep ratings honest. Yours will appear shortly once approved.</span>
            </div>
            <button className="sf-btn sf-btn-lg sf-btn-pri" style={{ width: '100%' }} onClick={onClose}>Done</button>
          </div>
        ) : (
          <React.Fragment>
            <div className="sf-modal-head">
              <span className="sf-tag-mono">Write a review</span>
              <h2>How was working with {pro.name}?</h2>
              <p>Your honest review helps other people in Bali find the right professionals.</p>
            </div>
            <div className="sf-rev-stars" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button" className={'sf-rev-star' + ((hover || rating) >= n ? ' on' : '')}
                  onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} onClick={() => setRating(n)}
                  aria-label={n + ' stars'}><SFStar size={28} outline={(hover || rating) < n} /></button>
              ))}
              <span className="sf-rev-rating-label">{rating} / 5</span>
            </div>
            <label className="sf-field" style={{ marginTop: 4 }}>
              <span>Your review</span>
              <textarea className="sf-edit-textarea" rows={5} value={text} onChange={e => setText(e.target.value)}
                placeholder="What was the process like? Quality, communication, timing…" />
            </label>
            <button className="sf-btn sf-btn-lg sf-btn-pri" style={{ width: '100%', marginTop: 16 }}
              onClick={() => setDone(true)}>Post review →</button>
          </React.Fragment>
        )}
      </div>
    </div>
  );
}
window.LeaveReviewModal = LeaveReviewModal;
