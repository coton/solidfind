// SolidFind — Purchase ad space popup (consistent with site modal UI)
function AdModal({ open, onClose }) {
  if (!open) return null;
  const points = [
    { h: 'Reach a highly targeted audience', s: 'Get in front of people actively searching for professionals like you.' },
    { h: 'Increased visibility at key decision moments', s: 'Appear exactly where clients are choosing who to contact.' },
    { h: 'Simple and cost-effective exposure', s: 'Flat, transparent placements — no auctions, no surprises.' },
  ];
  const Check = () => (
    <span className="sf-adm-check" aria-hidden="true">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
    </span>
  );
  return (
    <div className="sf-modal-scrim" onClick={onClose}>
      <div className="sf-modal sf-modal-ad" role="dialog" aria-modal="true" aria-label="Ad space" onClick={e => e.stopPropagation()}>
        <button className="sf-modal-x" aria-label="Close" onClick={onClose}>✕</button>

        <div className="sf-modal-head">
          <span className="sf-tag-mono">Advertising</span>
          <h2>Buy ad space</h2>
        </div>

        <div className="sf-adm-points">
          {points.map((p, i) => (
            <div className="sf-adm-point" key={i}>
              <Check />
              <div>
                <div className="sf-adm-point-h">{p.h}</div>
                <div className="sf-adm-point-s">{p.s}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="sf-adm-foot">
          <span className="sf-adm-foot-note">Contact us to learn more about pricing options.</span>
          <a className="sf-btn sf-btn-pri sf-btn-lg" href="mailto:hello@solidfind.id?subject=Ad%20space%20enquiry">Get in touch →</a>
        </div>
      </div>
    </div>
  );
}
window.AdModal = AdModal;
