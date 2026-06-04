// SolidFind — SearchBar (page-level, in browse view)
function SearchBar({ value, onChange, onSubmit }) {
  return (
    <form className="sf-search" onSubmit={(e) => { e.preventDefault(); onSubmit?.(value); }}>
      <div className="sf-search-field">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
        <input
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder="Architect, contractor, kitchen renovation…"
        />
      </div>
      <div className="sf-search-divider"/>
      <div className="sf-search-loc">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        <span>Bandung, West Java</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><polyline points="6 9 12 15 18 9"/></svg>
      </div>
      <button type="submit" className="sf-btn sf-btn-pri">Search</button>
    </form>
  );
}
window.SearchBar = SearchBar;
