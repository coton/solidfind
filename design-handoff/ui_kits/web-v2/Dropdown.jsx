// SolidFind — Dropdown (single- or multi-select filter menu)
function Dropdown({ label, value, options, onChange, multi, placeholder, align, allLabel, size }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    function onDoc(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const arr = multi ? (value || []) : null;
  const allOn = multi && allLabel && arr.length === options.length && options.length > 0;
  const summary = multi
    ? (arr.length === 0 ? (placeholder || 'Any') : allOn ? allLabel : arr.length === 1 ? arr[0] : arr.length + ' selected')
    : value;

  const toggle = (o) => {
    if (arr.includes(o)) onChange(arr.filter(x => x !== o));
    else onChange([...arr, o]);
  };

  return (
    <div className={'sf-dd' + (open ? ' open' : '')} ref={ref}>
      <button type="button" className="sf-dd-trigger" onClick={() => setOpen(o => !o)}>
        <span className="sf-dd-k">{label}</span>
        <span className={'sf-dd-v' + (multi && arr.length === 0 ? ' is-ph' : '')}>
          {summary}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="6 9 12 15 18 9"/></svg>
        </span>
      </button>
      {open && (
        <div className={'sf-dd-menu' + (multi ? ' sf-dd-menu-multi' : '') + (align === 'right' ? ' align-right' : '') + (size === 'sm' ? ' sf-dd-menu-sm' : '')}>
          {multi && allLabel && (
            <button type="button" className={'sf-dd-opt is-multi sf-dd-all' + (allOn ? ' sel' : '')}
              onClick={() => onChange(allOn ? [] : [...options])}>
              <span className="sf-dd-opt-label">{allLabel}</span>
              <span className="sf-switch" aria-hidden="true"><span className="sf-switch-knob"/></span>
            </button>
          )}
          {multi && !allLabel && arr.length > 0 && (
            <button type="button" className="sf-dd-clear" onClick={() => onChange([])}>Clear selection</button>
          )}
          {options.map(o => {
            const sel = multi ? arr.includes(o) : o === value;
            return (
              <button
                type="button"
                key={o}
                className={'sf-dd-opt' + (sel ? ' sel' : '') + (multi ? ' is-multi' : '')}
                onClick={() => { multi ? toggle(o) : (onChange?.(o), setOpen(false)); }}
              >
                <span className="sf-dd-opt-label">{o}</span>
                {multi && <span className="sf-switch" aria-hidden="true"><span className="sf-switch-knob"/></span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
window.Dropdown = Dropdown;
