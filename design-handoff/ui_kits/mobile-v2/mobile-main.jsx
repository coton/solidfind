// SolidFind mobile — main page + states.

function MainA() {
  const [activeCat, setActiveCat] = React.useState('Construction');
  const [openSeg, setOpenSeg] = React.useState(null);
  const article = (typeof ARTICLES !== 'undefined') ? ARTICLES.find(a => (a.cats || []).includes(activeCat)) : null;
  const featureCount = 1 + (article ? 1 : 0); // about card + optional article
  const proCount = 5 - featureCount;           // always 5 total slots
  const pros = PROS.filter(p => p.main === activeCat).slice(0, proCount);

  return (
    <div className="m-screen">
      <MSearchHeader activeCat={activeCat} onActiveCat={setActiveCat} openSeg={openSeg} onSegToggle={setOpenSeg} />
      <div className="m-scroll" style={{ position: 'relative' }}>
        {openSeg === 'Location' && <MFilterMenu />}
        {openSeg === 'Size'     && <MSizeMenu />}
        {openSeg === 'Type'     && <MTypeMenu activeCat={activeCat} />}
        <MResultsBar count={pros.length} />
        <div className="m-list">
          <MAboutCard />
          {article && <MArticleCard article={article} />}
          {pros.map(p => <MCardH key={p.id} pro={p} />)}
        </div>
        <MPager />
        <MAdSlot />
        <MFooter />
      </div>
    </div>
  );
}

function MainAScrolled() {
  const pros = PROS.filter(p => p.main === 'Construction').slice(3, 9);
  return (
    <div className="m-screen">
      <MMiniHeader />
      <div className="m-scroll">
        <div className="m-list" style={{ paddingTop: 16 }}>{pros.map(p => <MCardH key={p.id} pro={p} />)}</div>
        <MPager />
        <MAdSlot />
        <MFooter />
      </div>
    </div>
  );
}

function MainFilters() {
  const [activeCat, setActiveCat] = React.useState('Construction');
  const [openSeg, setOpenSeg] = React.useState('Location');
  const pros = PROS.filter(p => p.main === activeCat).slice(0, 3);
  return (
    <div className="m-screen">
      <MSearchHeader activeCat={activeCat} onActiveCat={setActiveCat} openSeg={openSeg} onSegToggle={setOpenSeg} />
      <div className="m-scroll" style={{ position: 'relative' }}>
        {openSeg === 'Location' && <MFilterMenu />}
        {openSeg === 'Size'     && <MSizeMenu />}
        {openSeg === 'Type'     && <MTypeMenu activeCat={activeCat} />}
        <MResultsBar count={pros.length} />
        <div className="m-list">{pros.map(p => <MCardH key={p.id} pro={p} />)}</div>
      </div>
    </div>
  );
}

function MainMenu() {
  const pros = PROS.filter(p => p.main === 'Construction').slice(0, 5);
  return (
    <div className="m-screen" style={{ position: 'relative' }}>
      <MSearchHeader activeCat="Construction" />
      <div className="m-scroll">
        <MResultsBar count={pros.length} />
        <div className="m-list">{pros.map(p => <MCardH key={p.id} pro={p} />)}</div>
      </div>
      <MMenuDrawer />
    </div>
  );
}

Object.assign(window, { MainA, MainAScrolled, MainFilters, MainMenu });
