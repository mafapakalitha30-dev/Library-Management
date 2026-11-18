import { useState } from 'react';
import { useFetch } from '../hooks/useFetch.js';
import Status from '../components/Status.jsx';
import SearchBox, { filterBooks } from '../components/SearchBox.jsx';
import StockBadge, { LOW_STOCK_LIMIT } from '../components/StockBadge.jsx';

export default function Dashboard() {
  const { data: books, loading, error } = useFetch('/books');
  const [query, setQuery] = useState('');
  const low = books.filter((b) => b.quantity < LOW_STOCK_LIMIT);
  const copies = books.reduce((sum, b) => sum + b.quantity, 0);
  const visible = filterBooks(books, query);

  return (
    <>
      <h1>Stock on the shelves</h1>
      <Status loading={loading} error={error} />
      {!loading && !error && (
        <>
          <p className="summary">
            {books.length} titles, {copies} copies.{' '}
            {low.length ? <strong className="warn">{low.length} need restocking.</strong> : 'Everything is well stocked.'}
          </p>
          {low.length > 0 && (
            <section className="panel panel-warn">
              <h2>Running low</h2>
              <ul className="low-list">
                {low.map((b) => (
                  <li key={b.id}>{b.title} <span className="muted">by {b.author}</span> <StockBadge quantity={b.quantity} /></li>
                ))}
              </ul>
            </section>
          )}
          <SearchBox value={query} onChange={setQuery} />
          <section className="card-grid">
            {visible.map((b) => (
              <article key={b.id} className={`card ${b.quantity < LOW_STOCK_LIMIT ? 'card-low' : ''}`}>
                <h3>{b.title}</h3>
                <p className="muted">{b.author}</p>
                <p className="genre">{b.genre}</p>
                <StockBadge quantity={b.quantity} />
              </article>
            ))}
            {!visible.length && (
              <p className="muted">{books.length ? 'No books match your search.' : 'No books in the catalogue yet.'}</p>
            )}
          </section>
        </>
      )}
    </>
  );
}