// SolidFind — budget "average project" range scale (entry / exit handles)
const SF_BUDGET = [50, 100, 150, 250, 400, 600, 800, 1200, 2000, 3000]; // juta IDR
const sfFmt = (jt) => jt >= 1000 ? (jt / 1000).toString().replace(/\.0$/, '') + ' M' : jt + ' jt';
const sfBudgetLabel = ([lo, hi]) => 'IDR ' + sfFmt(SF_BUDGET[lo]) + ' – ' + sfFmt(SF_BUDGET[hi]) + (hi === SF_BUDGET.length - 1 ? '+' : '');

function BudgetScale({ value, onChange }) {
  const [lo, hi] = value;
  const max = SF_BUDGET.length - 1;
  const pct = (i) => (i / max) * 100;
  return (
    <div className="sf-range">
      <div className="sf-range-vals">
        <div><span className="sf-range-cap">Entry</span><b>IDR {sfFmt(SF_BUDGET[lo])}</b></div>
        <div className="r"><span className="sf-range-cap">Exit</span><b>IDR {sfFmt(SF_BUDGET[hi])}{hi === max ? '+' : ''}</b></div>
      </div>
      <div className="sf-range-track">
        <div className="sf-range-rail"/>
        <div className="sf-range-fill" style={{ left: pct(lo) + '%', right: (100 - pct(hi)) + '%' }}/>
        <input type="range" min="0" max={max} step="1" value={lo}
          onChange={(e) => onChange([Math.min(+e.target.value, hi), hi])} aria-label="Minimum budget"/>
        <input type="range" min="0" max={max} step="1" value={hi}
          onChange={(e) => onChange([lo, Math.max(+e.target.value, lo)])} aria-label="Maximum budget"/>
      </div>
    </div>
  );
}

// header filter variant — styled like the other search dropdowns
function BudgetDropdown({ value, onChange, align }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    function onDoc(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);
  return (
    <div className={'sf-dd' + (open ? ' open' : '')} ref={ref}>
      <button type="button" className="sf-dd-trigger" onClick={() => setOpen(o => !o)}>
        <span className="sf-dd-k">Avg. project</span>
        <span className="sf-dd-v">
          {sfBudgetLabel(value)}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="6 9 12 15 18 9"/></svg>
        </span>
      </button>
      {open && (
        <div className={'sf-dd-menu sf-dd-menu-budget' + (align === 'right' ? ' align-right' : '')}>
          <BudgetScale value={value} onChange={onChange} />
        </div>
      )}
    </div>
  );
}

Object.assign(window, { SF_BUDGET, sfFmt, sfBudgetLabel, BudgetScale, BudgetDropdown });
