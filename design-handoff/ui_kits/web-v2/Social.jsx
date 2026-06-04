// SolidFind — social/contact icons + reusable ad slot

// ── social glyphs (monochrome, take currentColor) ──────────────
const SF_GLYPHS = {
  email: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4 7 8 6 8-6"/>
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.1-1.1a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2z"/>
    </svg>
  ),
  whatsapp: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M12 2a10 10 0 0 0-8.6 15.05L2 22l5.07-1.33A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3 .79.8-2.93-.2-.31A8.2 8.2 0 1 1 12 20.2Zm4.5-6.13c-.25-.13-1.46-.72-1.69-.8-.23-.08-.39-.13-.56.13-.16.25-.64.8-.78.97-.14.16-.29.18-.54.06a6.73 6.73 0 0 1-1.98-1.22 7.4 7.4 0 0 1-1.37-1.7c-.14-.25 0-.38.11-.5.11-.12.25-.29.37-.43.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.13-.56-1.34-.76-1.84-.2-.48-.4-.41-.56-.42h-.48c-.16 0-.43.06-.65.31-.23.25-.86.84-.86 2.05s.88 2.38 1 2.54c.13.17 1.74 2.65 4.2 3.72.59.25 1.05.4 1.4.52.6.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.18.2-.58.2-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z"/>
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M14 8.5V7c0-.7.3-1 1-1h1.5V3H14c-2.2 0-3.5 1.4-3.5 3.7V8.5H8V11.5h2.5V21H14v-9.5h2.4l.4-3H14Z"/>
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none"/>
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none">
      <rect x="1" y="1" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M4 11.1942H6.31836V19H4V11.1942ZM11.4785 13.1344C10.2734 13.1344 10.0879 14.1199 10.0879 15.138V19H7.77148V11.1942H9.99609V12.2614H10.0273C10.3379 11.6481 11.0938 11 12.2207 11C14.5664 11 15 12.6172 15 14.7189V19H12.6836V15.2034C12.6836 14.2977 12.666 13.1344 11.4785 13.1344Z" fill="currentColor"/>
      <circle cx="5" cy="9" r="1" fill="currentColor"/>
    </svg>
  ),
};

// order is fixed by the brief: email · whatsapp · FB · IG · LinkedIn
const SF_SOCIAL_ORDER = [
  { key: 'email',     label: 'Email',     href: (c) => 'mailto:' + c.email },
  { key: 'whatsapp',  label: 'WhatsApp',  href: (c) => 'https://wa.me/' + (c.whatsapp || '').replace(/[^0-9]/g, '') },
  { key: 'facebook',  label: 'Facebook',  href: (c) => 'https://facebook.com/' + c.facebook },
  { key: 'instagram', label: 'Instagram', href: (c) => 'https://instagram.com/' + c.instagram },
  { key: 'linkedin',  label: 'LinkedIn',  href: (c) => 'https://linkedin.com/company/' + c.linkedin },
];

function SocialBar({ contact }) {
  if (!contact) return null;
  // only render channels that actually have content
  const shown = SF_SOCIAL_ORDER.filter(s => contact[s.key]);
  if (shown.length === 0) return null;
  return (
    <div className="sf-social">
      {shown.map(s => (
        <a key={s.key} className="sf-social-btn" href={s.href(contact)}
           target="_blank" rel="noopener noreferrer"
           aria-label={s.label} title={s.label} onClick={(e) => e.stopPropagation()}>
          {SF_GLYPHS[s.key]}
        </a>
      ))}
    </div>
  );
}

// ── star icon (brand mark) — filled or outline ────────────────
function SFStar({ size = 14, outline = false, className = '' }) {
  return (
    <svg className={'sf-star ' + className} viewBox="0 0 18 17" width={size} height={size}
      fill={outline ? 'none' : 'currentColor'} stroke="currentColor"
      strokeWidth={outline ? 1.4 : 0} strokeLinejoin="round" aria-hidden="true">
      <path d="M17.5,7.1c.4-.3.2-1-.3-1h-5.4c-.2,0-.4-.1-.5-.4l-1.7-5.2c-.2-.5-.8-.5-1,0l-1.7,5.2c0,.2-.3.4-.5.4H.9c-.5,0-.7.7-.3,1l4.4,3.2c.2.1.3.4.2.6l-1.7,5.2c-.2.5.4.9.8.6l4.4-3.2c.2-.1.4-.1.6,0l4.4,3.2c.4.3,1-.1.8-.6l-1.7-5.2c0-.2,0-.5.2-.6l4.4-3.2Z"/>
    </svg>
  );
}

// a row of N filled stars out of 5 (used in reviews)
function SFStars({ n, size = 13 }) {
  return (
    <span className="sf-stars" aria-label={n + ' out of 5'}>
      {[1,2,3,4,5].map(i => (
        <span key={i} className={'sf-stars-i' + (i <= n ? ' on' : '')}><SFStar size={size} outline={i > n} /></span>
      ))}
    </span>
  );
}

// ── reusable sponsored ad slot ─────────────────────────────────
// variant: 'banner' (wide), 'box' (sidebar square-ish), 'inline' (grid card)
function AdSlot({ variant = 'banner', size, headline }) {
  return (
    <div className={'sf-ad sf-ad-' + variant} role="complementary" aria-label="Advertisement">
      <span className="sf-ad-tag">Sponsored</span>
      <div className="sf-ad-body">
        <span className="sf-ad-ico" aria-hidden="true">
          <svg viewBox="0 0 26 21" width="26" height="21" fill="none" stroke="currentColor" strokeWidth="1.2">
            <rect x="1" y="1.1" width="18" height="18.8" rx="1.8"/><path d="M1 4h18"/>
            <path d="M21 11v8M17 15h8"/>
          </svg>
        </span>
        <div className="sf-ad-copy">
          <div className="sf-ad-head">{headline || 'Your ad here'}</div>
          {size && <div className="sf-ad-size">{size}</div>}
        </div>
        <button className="sf-btn sf-btn-ghost sf-ad-cta" onClick={(e) => { e.stopPropagation(); window.dispatchEvent(new CustomEvent('sf-open-ad')); }}>Advertise →</button>
      </div>
    </div>
  );
}

Object.assign(window, { SocialBar, AdSlot, SF_GLYPHS, SF_SOCIAL_ORDER, SFStar, SFStars });
