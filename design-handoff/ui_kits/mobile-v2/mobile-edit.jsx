// SolidFind mobile — Company edit profile.
function MobileEdit() {
  const c = COMPANY;
  const langs = ['Bahasa', 'English'];
  const SF_LANGS = ['Bahasa', 'English', 'Mandarin', 'Japanese', 'French', 'Dutch'];
  const [active, setActive] = React.useState([c.main]);
  const [openCat, setOpenCat] = React.useState(c.main);
  const toggleActive = (n) => setActive(a => a.includes(n) ? a.filter(x => x !== n) : [...a, n]);
  const socials = [
    { k: 'email',     label: 'Email',     ico: MGLYPHS.email,     v: c.contact.email,            req: true },
    { k: 'phone',     label: 'Phone',     ico: MGLYPHS.phone,     v: '+62 361 555 0142',          req: true },
    { k: 'whatsapp',  label: 'WhatsApp',  ico: MGLYPHS.whatsapp,  v: c.contact.whatsapp,          req: true },
    { k: 'facebook',  label: 'Facebook',  ico: MGLYPHS.facebook,  v: c.contact.facebook },
    { k: 'instagram', label: 'Instagram', ico: MGLYPHS.instagram, v: c.contact.instagram },
    { k: 'linkedin',  label: 'LinkedIn',  ico: MGLYPHS.linkedin,  v: c.contact.linkedin },
  ];
  const about = c.name + ' is a ' + c.discipline.toLowerCase() + ' based in ' + c.city + ', working between architecture, build and renovation across residential and small-scale commercial projects. Known for tropical-modern detailing and locally-sourced materials.';
  const gallery = c.gallery.slice(0, 5);
  return (
    <div className="m-screen">
      <div className="m-edit-bar">
        <div>
          <span className="m-eyebrow" style={{ fontSize: 10 }}>Editing profile</span>
          <div className="title">{c.name}</div>
        </div>
        <button className="m-btn m-btn-pri" style={{ padding: '10px 16px', fontSize: 14 }}>Save →</button>
      </div>

      <div className="m-scroll">
        {/* cover */}
        <div className="m-edit-cover" style={{ backgroundImage: `url(${c.photo})` }}>
          <div className="shade"/>
          <button className="replace">{I.camera}Replace cover</button>
        </div>

        {/* logo */}
        <div className="m-section">
          <span className="m-eyebrow">Company logo</span>
          <div className="m-logo-row">
            <span className="m-logo">{c.name.charAt(0)}</span>
            <div style={{ flex: 1 }}>
              <p className="m-logo-hint">Optional — we'll use your initial if you don't upload one. Square, min 240×240px.</p>
              <div className="m-logo-btns">
                <button className="m-btn m-btn-ghost" style={{ padding: '9px 14px', fontSize: 13 }}>Upload logo</button>
                <button className="m-logo-rm">Remove</button>
              </div>
            </div>
          </div>
        </div>

        {/* basics */}
        <div className="m-section">
          <span className="m-eyebrow">Basics</span>
          <label className="m-field"><span>Company name <span className="req">*</span></span><input defaultValue={c.name}/></label>
          <label className="m-field"><span>Role / discipline</span><input defaultValue={c.discipline}/></label>
          <label className="m-field"><span>Primary category <span className="req">*</span></span>
            <select defaultValue={c.main}>{MAIN_CATS.map(m => <option key={m.name}>{m.name}</option>)}</select></label>

          <span className="m-sublabel">Contact channels</span>
          {socials.map(f => (
            <div className="m-social" key={f.k}>{f.ico}<input defaultValue={f.v} aria-label={f.label}/>{f.req && <span className="req" style={{ color: 'var(--sf-orange)' }}>*</span>}</div>
          ))}

          <span className="m-sublabel">Company details</span>
          <div className="m-grid2">
            <label className="m-field"><span>Region</span><select defaultValue={c.city}>{LOCATIONS.map(l => <option key={l}>{l}</option>)}</select></label>
            <label className="m-field"><span>Address <span className="req">*</span></span><input defaultValue="Jl. Raya Ubud No. 12"/></label>
          </div>
          <div className="m-grid3">
            <label className="m-field"><span>Projects <span className="req">*</span></span><input defaultValue={c.projects}/></label>
            <label className="m-field"><span>Team <span className="req">*</span></span><input defaultValue={c.team}/></label>
            <label className="m-field"><span>Founded</span><input defaultValue={c.founded}/></label>
          </div>

          <span className="m-sublabel">Average project value</span>
          <MBudgetScale value={[2, 7]} />
        </div>

        {/* description + languages */}
        <div className="m-section">
          <span className="m-eyebrow">Description <span className="req" style={{ color: 'var(--sf-orange)' }}>*</span></span>
          <textarea className="" style={{ width: '100%', border: '1px solid var(--sf-border-2)', borderRadius: 9, padding: '11px 12px', font: 'inherit', fontSize: 14, lineHeight: 1.5, resize: 'none', marginTop: 12 }} rows={6} defaultValue={about}/>
          <div style={{ fontSize: 11, color: 'var(--sf-fg-3)', marginTop: 6 }}>{about.length} characters · appears on your public profile</div>

          <span className="m-sublabel">Languages spoken</span>
          <div className="m-langchips">
            {SF_LANGS.map(l => {
              const on = langs.includes(l);
              return <button type="button" key={l} className={'m-langchip' + (on ? ' on' : '')}>{on && <span className="tick">✓</span>}{l}</button>;
            })}
          </div>
        </div>

        {/* services & coverage — accordion per category with activation switch */}
        <div className="m-section">
          <span className="m-eyebrow">Services &amp; coverage <span className="req" style={{ color: 'var(--sf-orange)' }}>*</span></span>
          <p style={{ fontSize: 12, color: 'var(--sf-fg-3)', lineHeight: 1.5, margin: '8px 0 14px' }}>Switch on every category you work in, then tap to choose the exact services you offer.</p>
          {MAIN_CATS.map(m => {
            const on = active.includes(m.name);
            const open = openCat === m.name;
            return (
              <div className={'m-acc2' + (open ? ' open' : '')} key={m.name}>
                <div className="m-acc2-head">
                  <button type="button" className="t" style={{ background: 'none', border: 'none', font: 'inherit', cursor: 'pointer', padding: 0 }} onClick={() => setOpenCat(open ? null : m.name)}>
                    <span className="n">{m.num}</span>{m.name}
                  </button>
                  <span className={'m-switch' + (on ? ' on' : '')} onClick={() => toggleActive(m.name)}><span className="knob"/></span>
                  <span className="chev" onClick={() => setOpenCat(open ? null : m.name)}>{I.chevD}</span>
                </div>
                {open && (
                  <div className="m-acc2-body">
                    <div className="m-cov-subs">
                      {m.subs.map((s, j) => (
                        <div className="m-cov-sub" key={s}>
                          <span>{s}</span>
                          <span className={'m-switch' + (on && j < 2 ? ' on' : '')}><span className="knob"/></span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* photos */}
        <div className="m-section">
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
            <span className="m-eyebrow">Photos &amp; videos</span>
            <span className="m-eyebrow">{gallery.length} / 12 used</span>
          </div>
          <div className="m-gallery">
            {gallery.map((src, i) => (
              <div className="m-thumb" key={i} style={{ backgroundImage: `url(${src})` }}>
                <button className="m-thumb-rm">{I.close}</button>
              </div>
            ))}
            <button className="m-thumb-add"><span>＋</span><small>Add</small></button>
          </div>
        </div>

        {/* footer */}
        <div className="m-edit-foot">
          <button className="m-btn m-btn-pri m-btn-block">Save changes →</button>
          <button className="m-btn m-btn-ghost m-btn-block">Discard</button>
          <button className="m-edit-delete">Delete profile</button>
        </div>

        <MFooter/>
      </div>
    </div>
  );
}

Object.assign(window, { MobileEdit });
