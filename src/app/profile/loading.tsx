export default function Loading() {
  return (
    <main className="sf-detail">
      <div className="sf-skel sf-skel-back" />
      <section className="sf-detail-hero sf-skel" />
      <div className="sf-detail-body">
        <section className="sf-detail-main">
          <div className="sf-skel sf-skel-title" />
          <div className="sf-skel-lines">
            <span />
            <span />
            <span />
          </div>
          <div className="sf-work-head">
            <div className="sf-skel sf-skel-title" />
            <div className="sf-skel sf-skel-chip" />
          </div>
          <div className="sf-gallery">
            {Array.from({ length: 8 }).map((_, index) => (
              <div className="sf-thumb sf-skel" key={index} />
            ))}
          </div>
        </section>
        <aside className="sf-detail-side">
          <div className="sf-detail-card">
            <div className="sf-skel sf-skel-chip" />
            <div className="sf-skel-lines">
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}
