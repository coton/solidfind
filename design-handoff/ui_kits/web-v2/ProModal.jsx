// SolidFind — Get Pro popup (Pro advantages + plan selection; mirrors the site modal UI)
function ProModal({ open, onClose, onGuidelines, onCheckout }) {
  const [plan, setPlan] = React.useState('year');
  if (!open) return null;
  const points = [
    { h: 'Priority placement in search', s: 'Your listing ranks above non-Pro companies within your category — seen first by clients searching your area.' },
    { h: 'Visibility analytics', s: 'A dashboard of profile views, where viewers found you, and the regions driving the most interest.' },
    { h: 'Up to 12 photos or videos', s: 'Show four times more work than a free account — full projects, walkthroughs and detail shots.' },
    { h: 'Ad placements across the platform', s: 'Eligible for sponsored slots on category pages and search results, subject to available inventory.' },
    { h: 'AI-ready profile formatting', s: 'Structured fields optimised for AI-assisted search, so your studio surfaces in the right results.' },
  ];
  const plans = [
    { id: 'month', title: 'Monthly', price: 'Rp 600.000', per: 'per month', note: 'Billed every month' },
    { id: 'year',  title: 'Yearly',  price: 'Rp 6,5jt',   per: 'per year',  note: 'Save Rp 700.000 a year' },
  ];
  const Check = () => (
    <span className="sf-adm-check" aria-hidden="true">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
    </span>
  );
  return (
    <div className="sf-modal-scrim" onClick={onClose}>
      <div className="sf-modal sf-modal-ad sf-modal-pro" role="dialog" aria-modal="true" aria-label="Get Pro" onClick={e => e.stopPropagation()}>
        <button className="sf-modal-x" aria-label="Close" onClick={onClose}>✕</button>

        <div className="sf-modal-head">
          <span className="sf-tag-mono">Pro subscription</span>
          <h2>Get Pro</h2>
          <p>Everything in a free profile, plus the visibility tools companies use to be found and chosen.</p>
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

        <span className="sf-tag-mono sf-pro-plans-label">Choose your plan</span>
        <div className="sf-su-opts sf-pro-plans">
          {plans.map(pl => (
            <button type="button" key={pl.id} className={'sf-su-opt sf-pro-plan' + (plan === pl.id ? ' on' : '')} onClick={() => setPlan(pl.id)}>
              <div className="sf-su-opt-top">
                <span className="sf-su-opt-title">{pl.title}</span>
                <span className="sf-switch" aria-hidden="true"><span className="sf-switch-knob"/></span>
              </div>
              <span className="sf-pro-plan-price">{pl.price}<em> {pl.per}</em></span>
              <span className="sf-su-opt-sub">{pl.note}</span>
            </button>
          ))}
        </div>

        <div className="sf-adm-foot sf-pro-foot-pay">
          <button className="sf-btn sf-btn-pri sf-btn-lg" onClick={() => onCheckout && onCheckout(plan)}>Buy now →</button>
        </div>

        <p className="sf-modal-foot sf-pro-legend">
          Secure payment via Midtrans. By subscribing you agree to the <a className="sf-modal-link" onClick={() => onGuidelines && onGuidelines()}>Pro Terms of Service</a>.
        </p>
      </div>
    </div>
  );
}
window.ProModal = ProModal;
