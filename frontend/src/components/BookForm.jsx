import { useState } from 'react';

const EMPTY = { title: '', author: '', genre: '', isbn: '', quantity: 1 };

// Used both to add a book and to edit one (pass `initial` to edit).
export default function BookForm({ initial, onSubmit, onCancel, submitLabel = 'Add book' }) {
  const editing = Boolean(initial);
  const [values, setValues] = useState(initial || EMPTY);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setValues({ ...values, [e.target.name]: e.target.value });

  function validate() {
    const e = {};
    if (!values.title.trim()) e.title = 'Enter a title';
    if (!values.author.trim()) e.author = 'Enter an author';
    if (!values.isbn.trim()) e.isbn = 'Enter an ISBN';
    else if (!/^[\d-]{10,17}X?$/i.test(values.isbn.trim())) e.isbn = 'ISBN should be 10 or 13 digits';
    if (!editing && (values.quantity === '' || Number(values.quantity) < 0 || !Number.isInteger(Number(values.quantity))))
      e.quantity = 'Use a whole number, 0 or more';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;
    setSaving(true);
    setServerError('');
    try {
      await onSubmit(values);
      if (!editing) setValues(EMPTY);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const field = (name, label, props = {}) => (
    <label className="field">
      <span>{label}</span>
      <input name={name} value={values[name]} onChange={handleChange} aria-invalid={Boolean(errors[name])} {...props} />
      {errors[name] && <small className="error">{errors[name]}</small>}
    </label>
  );

  return (
    <form className="form-grid" onSubmit={handleSubmit} noValidate>
      {field('title', 'Title')}
      {field('author', 'Author')}
      {field('genre', 'Genre', { placeholder: 'e.g. Fiction' })}
      {field('isbn', 'ISBN')}
      {!editing && field('quantity', 'Initial quantity', { type: 'number', min: 0 })}
      <div className="form-actions">
        <button className="btn" disabled={saving}>{saving ? 'Saving…' : submitLabel}</button>
        {onCancel && <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>}
      </div>
      {serverError && <p className="alert form-wide" role="alert">{serverError}</p>}
    </form>
  );
}
