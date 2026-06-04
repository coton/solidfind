// SolidFind — Edit Profile page (editable mirror of the company profile)
const SF_LANGS = ['Bahasa', 'English', 'Mandarin', 'Japanese', 'French', 'Dutch'];

function SwitchRow({ label, on, onToggle, strong }) {
  return (
    <button type="button" className={'sf-switchrow' + (on ? ' on' : '') + (strong ? ' strong' : '')} onClick={onToggle}>
      <span>{label}</span>
      <span className="sf-switch" aria-hidden="true"><span className="sf-switch-knob"/></span>
    </button>
  );
}

function EditProfile({ company, onCancel, onSave }) {
  const c = company;
  const [name, setName]       = React.useState(c.name);
  const [role, setRole]       = React.useState(c.discipline);
  const [main, setMain]       = React.useState(c.main);
  const [langs, setLangs]     = React.useState(['Bahasa', 'English']);
  const [budget, setBudget]   = React.useState([3, 5]);
  const [about, setAbout]     = React.useState(
    c.name + ' is a ' + c.discipline.toLowerCase() + ' based in ' + c.city + ', working between architecture, build and renovation across residential and small-scale commercial projects. The studio is known for tropical-modern detailing and a steady preference for locally-sourced materials.\n\nEvery engagement starts with a measured brief: site visits, a clear scope, and a fixed schedule before a single drawing is committed.'
  );
  const [gallery, setGallery] = React.useState(c.gallery || []);
  const [contact, setContact] = React.useState({ phone: '+62 361 555 0142', ...c.contact });
  const [region, setRegion]   = React.useState(c.city);
  const [address, setAddress] = React.useState('Jl. Raya Ubud No. 12, Gianyar, Bali');
  const [projects, setProjects] = React.useState(c.projects);
  const [team, setTeam]       = React.useState(c.team);
  const [founded, setFounded] = React.useState(c.founded);
  const [confirmDel, setConfirmDel] = React.useState(false);
  const [delReason, setDelReason] = React.useState('');
  const [delPick, setDelPick] = React.useState('');
  const DEL_REASONS = ['No longer taking clients', 'Not enough leads', 'Using another platform', 'Just testing', 'Other'];
  const [coverage, setCoverage] = React.useState({ sizes: [...SIZE_OPTS], areas: [c.city], activeCats: [c.main] });

  // portfolio cap depends on account tier: free = 4 photos, Pro = 12 photos or videos
  const isPro = !!c.verified;
  const cap = isPro ? 12 : 4;

  // mandatory fields — Save stays disabled until all are present
  const missing = [];
  if (!String(name).trim()) missing.push('Company name');
  if (!String(contact.email || '').trim()) missing.push('Email');
  if (!String(contact.phone || '').trim()) missing.push('Phone');
  if (!String(contact.whatsapp || '').trim()) missing.push('WhatsApp');
  if (!String(address).trim()) missing.push('Address');
  if (!String(projects).trim()) missing.push('Projects');
  if (!String(team).trim()) missing.push('Team size');
  if (!String(about).trim()) missing.push('Description');
  if (coverage.sizes.length === 0) missing.push('Project size');
  if (coverage.areas.length === 0) missing.push('Location');
  if (coverage.activeCats.length === 0) missing.push('at least one main category');
  const canSave = missing.length === 0;

  const toggle = (arr, set) => (x) => set(arr.includes(x) ? arr.filter(v => v !== x) : [...arr, x]);
  const removeShot = (i) => setGallery(g => g.filter((_, k) => k !== i));
  const setC = (k, v) => setContact(o => ({ ...o, [k]: v }));
  const slots = cap - gallery.length;

  const SOCIAL_FIELDS = [
    { key: 'email',     label: 'Email',     ph: 'hello@company.id',     req: true },
    { key: 'phone',     label: 'Phone',     ph: '+62 361 000 0000',     req: true },
    { key: 'whatsapp',  label: 'WhatsApp',  ph: '+62 812 0000 0000',    req: true },
    { key: 'facebook',  label: 'Facebook',  ph: 'facebook.com/handle' },
    { key: 'instagram', label: 'Instagram', ph: 'instagram.com/handle' },
    { key: 'linkedin',  label: 'LinkedIn',  ph: 'company name' },
  ];

  const matrixInitial = { sizes: [...SIZE_OPTS], areas: [c.city], cats: { [c.main]: c.subs || [] } };

  return (
    <main className="sf-edit" data-screen-label="Edit profile">
      {/* sticky action bar */}
      <div className="sf-edit-bar">
        <div>
          <span className="sf-tag-mono">Editing profile</span>
          <h1 className="sf-edit-title">{name || 'Your company'}</h1>
        </div>
        <div className="sf-edit-actions">
          <button className="sf-btn sf-btn-lg sf-btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="sf-btn sf-btn-lg sf-btn-pri" disabled={!canSave} onClick={() => canSave && onSave()}>Save changes →</button>
        </div>
      </div>

      {/* cover photo */}
      <div className="sf-edit-cover" style={{ backgroundImage: `url(${c.photo})` }}>
        <div className="sf-edit-cover-shade"/>
        <button className="sf-btn sf-edit-replace">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
          Replace cover photo
        </button>
      </div>

      {/* 1 · company logo */}
      <div className="sf-edit-section">
        <span className="sf-tag-mono">Company logo</span>
        <div className="sf-edit-logo-row">
          <span className="sf-edit-logo" aria-hidden="true">{(name || '?').trim().charAt(0).toUpperCase()}</span>
          <div className="sf-edit-logo-copy">
            <p className="sf-edit-logo-hint">Optional — we'll use your initial if you don't upload one. Square image, min 240×240px. Shown on your profile and listing card.</p>
            <div className="sf-edit-logo-btns">
              <button type="button" className="sf-btn sf-btn-ghost">Upload logo</button>
              <button type="button" className="sf-edit-logo-remove">Remove</button>
            </div>
          </div>
        </div>
      </div>

      {/* 2 · basics */}
      <div className="sf-edit-section">
        <span className="sf-tag-mono">Basics</span>
        <div className="sf-edit-grid3">
          <label className="sf-field"><span>Company name <span className="req">*</span></span>
            <input value={name} onChange={e => setName(e.target.value)} /></label>
          <label className="sf-field"><span>Role / discipline</span>
            <input value={role} onChange={e => setRole(e.target.value)} /></label>
          <label className="sf-field"><span>Primary category <span className="req">*</span></span>
            <select value={main} onChange={e => setMain(e.target.value)}>
              {MAIN_CATS.map(m => <option key={m.name}>{m.name}</option>)}
            </select></label>
        </div>

        <div className="sf-edit-2col" style={{ marginTop: 20 }}>
          <div>
            <span className="sf-edit-sublabel sf-tag-mono">Contact channels</span>
            <div className="sf-edit-socials">
              {SOCIAL_FIELDS.map(f => (
                <label className="sf-social-field" key={f.key}>
                  <span className="sf-social-field-ico">{SF_GLYPHS[f.key]}</span>
                  <input value={contact[f.key] || ''} placeholder={f.ph}
                         onChange={e => setC(f.key, e.target.value)} aria-label={f.label}/>
                  {f.req && <span className="req sf-social-req">*</span>}
                </label>
              ))}
            </div>
          </div>
          <div>
            <span className="sf-edit-sublabel sf-tag-mono">Company details</span>
            <div className="sf-edit-details">
              <div className="sf-edit-grid2">
                <label className="sf-field"><span>Head-office region</span>
                  <select value={region} onChange={e => setRegion(e.target.value)}>
                    {LOCATIONS.map(l => <option key={l}>{l}</option>)}
                  </select></label>
                <label className="sf-field"><span>Address <span className="req">*</span></span>
                  <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Street, area, regency" /></label>
              </div>
              <div className="sf-edit-grid3">
                <label className="sf-field"><span>Projects <span className="req">*</span></span>
                  <input type="number" min="0" value={projects} onChange={e => setProjects(e.target.value.replace(/[^0-9]/g, ''))} /></label>
                <label className="sf-field"><span>Team size <span className="req">*</span></span>
                  <input type="number" min="0" value={team} onChange={e => setTeam(e.target.value.replace(/[^0-9]/g, ''))} /></label>
                <label className="sf-field"><span>Founded</span>
                  <input type="number" value={founded} onChange={e => setFounded(e.target.value)} /></label>
              </div>
            </div>
            <span className="sf-edit-sublabel sf-tag-mono" style={{ marginTop: 14 }}>Average project value</span>
            <div className="sf-edit-budget"><BudgetScale value={budget} onChange={setBudget} /></div>
          </div>
        </div>
      </div>

      {/* 2 · description + languages */}
      <div className="sf-edit-section">
        <div className="sf-edit-2col sf-edit-desc">
          <div>
            <span className="sf-tag-mono">Description <span className="req">*</span></span>
            <textarea className="sf-edit-textarea" value={about} onChange={e => setAbout(e.target.value)} rows={7}/>
            <div className="sf-edit-hint">{about.length} characters · appears on your public profile</div>
          </div>
          <div>
            <span className="sf-tag-mono">Languages spoken</span>
            <div className="sf-langchips">
              {SF_LANGS.map(l => {
                const on = langs.includes(l);
                return (
                  <button type="button" key={l} className={'sf-langchip' + (on ? ' on' : '')} onClick={() => toggle(langs, setLangs)(l)}>
                    {on && <span className="sf-langchip-tick">✓</span>}{l}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 3 · sub-filters (services & coverage) */}
      <div className="sf-edit-section">
        <span className="sf-tag-mono">Services &amp; coverage <span className="req">*</span></span>
        <ServiceMatrix initial={matrixInitial} onChange={setCoverage} lead="Activate every category you work in and switch on the exact services you offer — at least one main category is required. These are the same filters individuals use to find you." />
      </div>

      {/* 4 · portfolio / upload */}
      <div className="sf-edit-section sf-edit-section-last">
        <div className="sf-work-head" style={{ margin: '0 0 14px' }}>
          <span className="sf-tag-mono">Photos &amp; videos</span>
          <span className="sf-tag-mono">{gallery.length} / {cap} used · {isPro ? 'Pro Account — photos or videos' : 'Free account — photos only'}</span>
        </div>
        <div className="sf-gallery">
          {gallery.slice(0, cap).map((src, i) => (
            <div className="sf-thumb sf-thumb-edit" key={i} style={{ backgroundImage: `url(${src})` }}>
              <button className="sf-thumb-remove" aria-label="Remove" onClick={() => removeShot(i)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
              </button>
            </div>
          ))}
          {Array.from({ length: Math.max(slots, 0) }).map((_, i) => (
            <button className="sf-thumb sf-thumb-add" key={'add' + i}>
              <span>＋</span><small>Add photo / video</small>
            </button>
          ))}
        </div>
      </div>

      {/* bottom actions */}
      <div className="sf-edit-foot">
        <button className="sf-edit-delete" onClick={() => setConfirmDel(true)}>Delete profile</button>
        <div className="sf-edit-foot-save">
          {!canSave && <span className="sf-edit-missing">Missing required: {missing.join(', ')}</span>}
          <div className="sf-edit-actions">
            <button className="sf-btn sf-btn-lg sf-btn-ghost" onClick={onCancel}>Discard</button>
            <button className="sf-btn sf-btn-lg sf-btn-pri" disabled={!canSave} onClick={() => canSave && onSave()}>Save changes →</button>
          </div>
        </div>
      </div>

      {confirmDel && (
        <div className="sf-modal-scrim" onClick={() => setConfirmDel(false)}>
          <div className="sf-modal sf-modal-confirm" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
            <div className="sf-confirm-ico" aria-hidden="true">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M10 11v6M14 11v6"/></svg>
            </div>
            <h2>Delete this profile?</h2>
            <p>This permanently removes <b>{name}</b> from SolidFind — your listing, portfolio, reviews and Pro insights. This can't be undone.</p>
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
              <button className="sf-btn sf-btn-lg sf-btn-ghost" onClick={() => setConfirmDel(false)}>Keep profile</button>
              <button className="sf-btn sf-btn-lg sf-btn-danger" onClick={() => { setConfirmDel(false); onCancel && onCancel(); }}>Delete permanently</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
window.EditProfile = EditProfile;
