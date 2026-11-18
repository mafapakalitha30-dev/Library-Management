import { useState } from 'react';
import { useFetch } from '../hooks/useFetch.js';
import { api } from '../api.js';
import BookForm from '../components/BookForm.jsx';
import BookList from '../components/BookList.jsx';
import SearchBox, { filterBooks } from '../components/SearchBox.jsx';
import Status from '../components/Status.jsx';

export default function BooksPage() {
  const { data: books, loading, error, reload } = useFetch('/books');
  const [query, setQuery] = useState('');
  const visible = filterBooks(books, query);

  async function addBook(values) {
    await api.post('/books', { ...values, quantity: Number(values.quantity) });
    await reload();
  }
  async function updateBook(id, values) {
    await api.put(`/books/${id}`, values);
    await reload();
  }
  async function deleteBook(book) {
    if (!window.confirm(`Delete "${book.title}" and its transaction history?`)) return;
    try {
      await api.del(`/books/${book.id}`);
      await reload();
    } catch (err) {
      window.alert(err.message);
    }
  }

  return (
    <>
      <h1>Books</h1>
      <section className="panel">
        <h2>Add a book</h2>
        <BookForm onSubmit={addBook} />
      </section>
      <section className="panel">
        <h2>Catalogue</h2>
        <SearchBox value={query} onChange={setQuery} />
        <Status loading={loading} error={error} />
        {!loading && !error && (
          visible.length || !query ? (
            <BookList books={visible} onUpdate={updateBook} onDelete={deleteBook} />
          ) : (
            <p className="muted">No books match your search.</p>
          )
        )}
      </section>
    </>
  );
}