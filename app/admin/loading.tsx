export default function AdminLoading() {
  return (
    <section className="surface-grid">
      <div className="card page-hero loading-card" aria-hidden="true">
        <div className="loading-line loading-line-wide" />
        <div className="loading-line loading-line-medium" />
        <div className="loading-chip-row">
          <div className="loading-chip" />
          <div className="loading-chip" />
        </div>
      </div>

      <div className="stats-grid" aria-hidden="true">
        {Array.from({ length: 8 }).map((_, index) => (
          <div className="card stat-card loading-card" key={index}>
            <div className="loading-line loading-line-short" />
            <div className="loading-line loading-line-value" />
          </div>
        ))}
      </div>
    </section>
  );
}
