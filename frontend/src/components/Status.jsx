// Shows loading text or an error banner for any data-driven section.
export default function Status({ loading, error }) {
  if (loading) return <p className="muted">Loading…</p>;
  if (error) return <p className="alert" role="alert">{error}</p>;
  return null;
}
