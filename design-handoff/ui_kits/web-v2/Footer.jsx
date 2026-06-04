// SolidFind — Footer
function Footer({ onHome, onAbout, onIndividuals, onTerms, onPro, onCategory, onListService }) {
  const S = (typeof SETTINGS !== 'undefined') ? SETTINGS : { proEnabled: true, activeCategories: ['Construction', 'Renovation', 'Architecture', 'Interior', 'Real Estate'] };
  const cats = (MAIN_CATS || []).filter(c => (S.activeCategories || []).includes(c.name)).map(c => c.name);
  return (
    <footer className="sf-footer">
      <div className="sf-footer-inner">
        <div className="sf-footer-brand">
          <a className="sf-footer-lockup" onClick={onHome} style={{ cursor: 'pointer' }}><img src="../../assets/solidfind-logo.svg" alt="SolidFind" height="20" /><span className="sf-brand-id">.id</span></a>
          <p>An independent platform for the places we live in.</p>
        </div>
        <div className="sf-footer-cols">
          <div>
            <span className="sf-tag-mono">Categories</span>
            {cats.map((c, i) => (
              <a key={c} onClick={() => onCategory && onCategory(c)}>{String(i + 1).padStart(2, '0')} · {c}</a>
            ))}
          </div>
          <div>
            <span className="sf-tag-mono">Build</span>
            <a onClick={onIndividuals}>For individuals</a><a onClick={onListService}>For professionals</a><a onClick={onListService}>List your services</a>{S.proEnabled && <a onClick={onPro}>Pro guidelines</a>}
          </div>
          <div>
            <span className="sf-tag-mono">Solid</span>
            <a onClick={onAbout}>About</a><a onClick={onTerms}>Terms &amp; Conditions</a><a href="mailto:hello@solidfind.id">Contact</a>
          </div>
        </div>
      </div>
      <div className="sf-footer-bar">
        <span>© 2026 SolidFind.id</span>
        <a href="https://instagram.com/solidfind.id" target="_blank" rel="noopener noreferrer">Instagram</a>
      </div>
    </footer>
  );
}
window.Footer = Footer;
