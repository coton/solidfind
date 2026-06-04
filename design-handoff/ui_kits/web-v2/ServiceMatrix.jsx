// SolidFind — condensed services / coverage matrix (edit profile)
// Every group has an over-arching master switch that flips all rows beneath it.

function MxRow({ label, hint, on, onToggle, master, disabled }) {
  return (
    <button type="button"
      className={'sf-mx-row' + (on ? ' on' : '') + (master ? ' master' : '') + (disabled ? ' is-off' : '')}
      onClick={onToggle} disabled={disabled}>
      <span className="sf-mx-row-label">{label}{hint && <em>{hint}</em>}</span>
      <span className="sf-switch" aria-hidden="true"><span className="sf-switch-knob"/></span>
    </button>
  );
}

function ServiceMatrix({ initial, lead, onChange }) {
  const [sizes, setSizes] = React.useState(initial?.sizes || []);
  const [areas, setAreas] = React.useState(initial?.areas || []);
  // cats: { [name]: { on: bool, subs: [] } }
  const [cats, setCats] = React.useState(() => {
    const o = {};
    MAIN_CATS.forEach(m => { o[m.name] = { on: !!(initial?.cats && initial.cats[m.name]), subs: (initial?.cats && initial.cats[m.name]) || [] }; });
    return o;
  });

  // report coverage up so the parent can validate (at least one of each is required)
  React.useEffect(() => {
    if (!onChange) return;
    const activeCats = MAIN_CATS.filter(m => cats[m.name].on).map(m => m.name);
    onChange({ sizes, areas, activeCats });
  }, [sizes, areas, cats]);

  const inList = (list, x) => list.includes(x);
  const flip = (list, set) => (x) => set(list.includes(x) ? list.filter(v => v !== x) : [...list, x]);

  const anySize = sizes.length === SIZE_OPTS.length;
  const allBali = areas.length === LOCATIONS.length;

  const setCat = (name, patch) => setCats(c => ({ ...c, [name]: { ...c[name], ...patch } }));
  const toggleCat = (name) => setCat(name, { on: !cats[name].on });
  const catSubs = (name) => cats[name].subs;
  const realSubs = (m) => m.subs;
  const allTypesOn = (m) => m.subs.every(s => cats[m.name].subs.includes(s));
  const toggleAllTypes = (m) => setCat(m.name, { subs: allTypesOn(m) ? [] : [...m.subs] });
  const toggleSub = (m, s) => {
    const cur = cats[m.name].subs;
    setCat(m.name, { subs: cur.includes(s) ? cur.filter(x => x !== s) : [...cur, s] });
  };

  return (
    <div className="sf-matrix">
      {/* lead text (half width) sits beside project-size + location */}
      <div className="sf-matrix-head">
        {lead && <p className="sf-edit-lead">{lead}</p>}
        <div className="sf-matrix-top">
          <div className="sf-mx-block sf-mx-block-static">
            <div className="sf-mx-blockhead"><h4>Project size <span className="req">*</span></h4></div>
            <MxRow master label="Any size" on={anySize} onToggle={() => setSizes(anySize ? [] : [...SIZE_OPTS])} />
            {SIZE_OPTS.map(s => (
              <MxRow key={s} label={s} hint={' (' + SIZE_RANGE[s] + ')'} on={inList(sizes, s)} onToggle={() => flip(sizes, setSizes)(s)} />
            ))}
          </div>
          <div className="sf-mx-block sf-mx-block-static">
            <div className="sf-mx-blockhead"><h4>Location <span className="req">*</span></h4></div>
            <MxRow master label="Bali — all regions" on={allBali} onToggle={() => setAreas(allBali ? [] : [...LOCATIONS])} />
            {LOCATIONS.map(l => (
              <MxRow key={l} label={l} on={inList(areas, l)} onToggle={() => flip(areas, setAreas)(l)} />
            ))}
          </div>
        </div>
      </div>

      {/* categories + services — full width, 5 across */}
      <div className="sf-matrix-cats">
        {MAIN_CATS.map(m => {
          const on = cats[m.name].on;
          return (
            <div className={'sf-mx-block sf-mx-cat' + (on ? ' on' : '')} key={m.name}>
              <button type="button" className="sf-mx-cathead" onClick={() => toggleCat(m.name)}>
                <h4>{m.name}</h4>
                <span className="sf-switch" aria-hidden="true"><span className="sf-switch-knob"/></span>
              </button>
              <div className={'sf-mx-catbody' + (on ? '' : ' is-off')}>
                <MxRow master label="All types" on={allTypesOn(m)} onToggle={() => toggleAllTypes(m)} disabled={!on} />
                {realSubs(m).map(s => (
                  <MxRow key={s} label={s} on={catSubs(m.name).includes(s)} onToggle={() => toggleSub(m, s)} disabled={!on} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
window.ServiceMatrix = ServiceMatrix;
