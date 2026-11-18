import { useState } from 'react';

const TYPES = [
  { value: 'RESTOCK', label: 'Add stock (new arrivals)' },
  { value: 'BORROW', label: 'Deduct stock (borrowed)' },
  { value: 'RETURN', label: 'Return (add back)' },
];

export default function TransactionForm({ books, users, onSubmit }) {
  const blank = { book_id: '', type: 'RESTOCK', quantity: 1, user_id: '', notes: '' };
  const [values, setValues] = useState(blank);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);

  const needsUser = values.type !== 'RESTOCK';
  const handleChange = (e) => setValues({ ...values, [e.target.name]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    const found = {};
    if (!values.book_id) found.book_id = 'Choose a book';
    if (!Number.isInteger(Number(values.quantity)) || Number(values.quantity) < 1) found.quantity = 'Use a whole number, 1 or more';
    if (needsUser && !values.user_id) found.user_id = 'Choose a member';
    setErrors(found);
    if (Object.keys(found).length) return;
    setSaving(true);
    setServerError('');
    try {
      await onSubmit({ ...values, quantity: Number(values.quantity), user_id: needsUser ? values.user_id : null });
      setValues({ ...blank, type: values.type });
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit} noValidate>
      <label className="field">
        <span>Action</span>
        <select name="type" value={values.type} onChange={handleChange}>
          {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </label>
      <label className="field">
        <span>Book</span>
        <select name="book_id" value={values.book_id} onChange={handleChange} aria-invalid={Boolean(errors.book_id)}>
          <option value="">Select a book…</option>
          {books.map((b) => <option key={b.id} value={b.id}>{b.title} ({b.quantity} in stock)</option>)}
        </select>
        {errors.book_id && <small className="error">{errors.book_id}</small>}
      </label>
      <label className="field">
        <span>Quantity</span>
        <input type="number" min="1" name="quantity" value={values.quantity} onChange={handleChange} aria-invalid={Boolean(errors.quantity)} />
        {errors.quantity && <small className="error">{errors.quantity}</small>}
      </label>
      {needsUser && (
        <label className="field">
          <span>Member</span>
          <select name="user_id" value={values.user_id} onChange={handleChange} aria-invalid={Boolean(errors.user_id)}>
            <option value="">Select a member…</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.membership_id})</option>)}
          </select>
          {errors.user_id && <small className="error">{errors.user_id}</small>}
        </label>
      )}
      <label className="field form-wide">
        <span>Note (optional)</span>
        <input name="notes" value={values.notes} onChange={handleChange} maxLength={255} />
      </label>
      <div className="form-actions">
        <button className="btn" disabled={saving}>{saving ? 'Recording…' : 'Record transaction'}</button>
      </div>
      {serverError && <p className="alert form-wide" role="alert">{serverError}</p>}
    </form>
  );
}
