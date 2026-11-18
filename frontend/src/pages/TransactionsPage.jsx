import { useState } from 'react';
import { useFetch } from '../hooks/useFetch.js';
import { api } from '../api.js';
import TransactionForm from '../components/TransactionForm.jsx';
import TransactionHistory from '../components/TransactionHistory.jsx';
import Status from '../components/Status.jsx';

export default function TransactionsPage() {
  const books = useFetch('/books');
  const users = useFetch('/users');
  const history = useFetch('/transactions');
  const [message, setMessage] = useState('');

  async function record(values) {
    await api.post('/transactions', values);
    await Promise.all([books.reload(), history.reload()]); // stock and log both changed
    setMessage('Transaction recorded.');
  }

  async function undo(t) {
    if (!window.confirm('Undo this transaction? Stock will be adjusted back.')) return;
    try {
      await api.del(`/transactions/${t.id}`);
      await Promise.all([books.reload(), history.reload()]);
      setMessage('Transaction undone.');
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <>
      <h1>Transactions</h1>
      <section className="panel">
        <h2>Record stock movement</h2>
        <Status loading={books.loading || users.loading} error={books.error || users.error} />
        <TransactionForm books={books.data} users={users.data} onSubmit={record} />
        {message && <p className="notice" role="status">{message}</p>}
      </section>
      <section className="panel">
        <h2>History</h2>
        <Status loading={history.loading} error={history.error} />
        {!history.loading && !history.error && <TransactionHistory transactions={history.data} onDelete={undo} />}
      </section>
    </>
  );
}
