// SolidFind — Hero
function Hero({ onSearch, onBrowse }) {
  return (
    <section className="sf-hero">
      <div className="sf-hero-frame">
        <div className="sf-hero-block">
          <span className="sf-tag-light">Welcome : )</span>
          <h1 className="sf-hero-title">
            A neutral platform.<br/>
            A curated environment.<br/>
            <span className="hl">For those building<span className="dot"/></span>
          </h1>
          <p className="sf-hero-sub">
            SolidFind brings clarity, trust, and perspective to the places we live in.
            Find verified professionals across construction, renovation, and real estate
            in Indonesia.
          </p>
          <div className="sf-hero-cta">
            <button className="sf-btn sf-btn-pri sf-btn-lg" onClick={onBrowse}>Find a pro →</button>
            <button className="sf-btn sf-btn-ghost sf-btn-lg">Become a partner</button>
          </div>
          <div className="sf-hero-meta">
            <span><b>1,240</b> verified pros</span>
            <span className="dotsep"/>
            <span><b>34</b> regions</span>
            <span className="dotsep"/>
            <span><b>12,800</b> reviews</span>
          </div>
        </div>
      </div>
    </section>
  );
}
window.Hero = Hero;
