// SolidFind — Share popup (copy link + social share)
function ShareModal({ open, pro, onClose }) {
  const [copied, setCopied] = React.useState(false);
  React.useEffect(() => { if (open) setCopied(false); }, [open]);
  if (!open || !pro) return null;

  const url = 'https://solidfind.id/c/' + (pro.id || '').replace(/[^a-z0-9]+/gi, '');
  const copy = () => {
    try { navigator.clipboard && navigator.clipboard.writeText(url); } catch (e) {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  const channels = [
    { k: 'whatsapp', label: 'WhatsApp', href: 'https://wa.me/?text=' + encodeURIComponent(url) },
    { k: 'facebook', label: 'Facebook', href: 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url) },
    { k: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url) },
    { k: 'email',    label: 'Email',    href: 'mailto:?subject=' + encodeURIComponent(pro.name + ' on SolidFind') + '&body=' + encodeURIComponent(url) },
  ];

  return (
    <div className="sf-modal-scrim" onClick={onClose}>
      <div className="sf-modal sf-modal-share" role="dialog" aria-modal="true" aria-label="Share" onClick={e => e.stopPropagation()}>
        <button className="sf-modal-x" aria-label="Close" onClick={onClose}>✕</button>
        <div className="sf-modal-head">
          <span className="sf-tag-mono">Share</span>
          <h2>Share {pro.name}</h2>
          <p>Send this company to a friend, or copy the link to share anywhere.</p>
        </div>

        <div className="sf-share-channels">
          {channels.map(c => (
            <a key={c.k} className="sf-share-channel" href={c.href} target="_blank" rel="noopener noreferrer">
              <span className="sf-share-channel-ico">{SF_GLYPHS[c.k]}</span>
              <span>{c.label}</span>
            </a>
          ))}
        </div>

        <div className="sf-share-link">
          <input readOnly value={url} onFocus={e => e.target.select()} />
          <button className={'sf-btn ' + (copied ? 'sf-btn-pri' : 'sf-btn-ghost')} onClick={copy}>
            {copied ? 'Copied ✓' : 'Copy link'}
          </button>
        </div>
      </div>
    </div>
  );
}
window.ShareModal = ShareModal;
