import { useState } from 'react';
import BookForm from './BookForm.jsx';
import StockBadge from './StockBadge.jsx';

export default function BookList({ books, onUpdate, onDelete }) {
  const [editingId, setEditingId] = useState(null);

  if (!books.length) return <p className="muted">No books yet. Add the first one above.</p>;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr><th>Title</th><th>Author</th><th>Genre</th><th>ISBN</th><th>Stock</th><th></th></tr>
        </thead>
        <tbody>
          {books.map((b) =>
            editingId === b.id ? (
              <tr key={b.id}>
                <td colSpan="6">
                  <BookForm
                    initial={b}
                    submitLabel="Save changes"
                    onCancel={() => setEditingId(null)}
                    onSubmit={async (values) => { await onUpdate(b.id, values); setEditingId(null); }}
                  />
                </td>
              </tr>
            ) : (
              <tr key={b.id}>
                <td data-label="Title">{b.title}</td>
                <td data-label="Author">{b.author}</td>
                <td data-label="Genre">{b.genre}</td>
                <td data-label="ISBN">{b.isbn}</td>
                <td data-label="Stock"><StockBadge quantity={b.quantity} /></td>
                <td className="row-actions">
                  <button className="btn btn-small" onClick={() => setEditingId(b.id)}>Update</button>
                  <button className="btn btn-small btn-danger" onClick={() => onDelete(b)}>Delete</button>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}
