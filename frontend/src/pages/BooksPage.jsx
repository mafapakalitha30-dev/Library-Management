import { useFetch } from '../hooks/useFetch.js';
import { api } from '../api.js';
import BookForm from '../components/BookForm.jsx';
import BookList from '../components/BookList.jsx';
import Status from '../components/Status.jsx';

export default function BooksPage() {
  const { data: books, loading, error, reload } = useFetch('/books');

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
        <Status loading={loading} error={error} />
        {!loading && !error && <BookList books={books} onUpdate={updateBook} onDelete={deleteBook} />}
      </section>
    </>
  );
}
