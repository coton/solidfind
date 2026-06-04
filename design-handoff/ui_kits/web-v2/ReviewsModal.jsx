// SolidFind — All-reviews popup
const SF_REVIEW_SAMPLES = [
  { author: 'Pak Andi', context: 'Renovation · 2 months ago',  rating: 5, text: 'Quiet, careful, and absolutely on time. Solid work from first visit to handover.' },
  { author: 'Bu Maya',  context: 'New build · 5 months ago',   rating: 5, text: 'Patient through every iteration. Drawings were clear, the build was clean.' },
  { author: 'Pak Joko', context: 'Interior · 3 weeks ago',     rating: 4, text: 'Great communication and a calm, organised process the whole way through.' },
  { author: 'Bu Sari',  context: 'Extension · 6 months ago',   rating: 5, text: 'They handled the permits and contractors so we never had to chase anyone.' },
  { author: 'Pak Gede', context: 'Villa · 4 months ago',       rating: 5, text: 'Budget held to the rupiah. Site was tidy every time we visited.' },
  { author: 'Bu Wayan', context: 'Kitchen · 1 month ago',      rating: 4, text: 'Lovely detailing and good taste. A couple of small delays but well managed.' },
  { author: 'Pak Made', context: 'Office fit-out · 7 months ago', rating: 5, text: 'Responsive, professional, and the finishes have held up beautifully.' },
  { author: 'Bu Putu',  context: 'Renovation · 2 weeks ago',   rating: 5, text: 'Felt looked after the entire way. Would gladly work with them again.' },
];

function ReviewsModal({ open, pro, onClose }) {
  if (!open || !pro) return null;
  const count = pro.reviewCount || SF_REVIEW_SAMPLES.length;
  const list = Array.from({ length: Math.min(count, 12) }, (_, i) => SF_REVIEW_SAMPLES[i % SF_REVIEW_SAMPLES.length]);
  const Stars = ({ n }) => <SFStars n={n} size={13} />;
  return (
    <div className="sf-modal-scrim" onClick={onClose}>
      <div className="sf-modal sf-modal-reviews" role="dialog" aria-modal="true" aria-label="All reviews" onClick={(e) => e.stopPropagation()}>
        <button className="sf-modal-x" aria-label="Close" onClick={onClose}>✕</button>
        <div className="sf-modal-head">
          <span className="sf-tag-mono">{count} reviews</span>
          <h2>★ {pro.rating} · {pro.name}</h2>
          <p>Verified reviews from clients who already worked with this company.</p>
        </div>
        <div className="sf-modal-reviews-list">
          {list.map((r, i) => (
            <div className="sf-review" key={i}>
              <div className="sf-review-top">
                <Stars n={r.rating} />
                <span className="sf-review-when">{r.context}</span>
              </div>
              <p>"{r.text}"</p>
              <div className="sf-review-by">{r.author}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
window.ReviewsModal = ReviewsModal;
