import { useState } from 'react';

const EMPTY = { name: '', membership_id: '', role: 'member', password: '' };

export default function UserForm({ initial, onSubmit, onCancel, submitLabel = 'Add user' }) {
  const editing = Boolean(initial);
  const [values, setValues] = useState(initial ? { ...initial, password: '' } : EMPTY);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setValues({ ...values, [e.target.name]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    const found = {};
    if (!values.name.trim()) found.name = 'Enter a name';
    if (!values.membership_id.trim()) found.membership_id = 'Enter a membership ID';
    if (!editing && values.password.length < 6) found.password = 'Use at least 6 characters';
    if (editing && values.password && values.password.length < 6) found.password = 'Use at least 6 characters';
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

  return (
    <form className="form-grid" onSubmit={handleSubmit} noValidate>
      <label className="field">
        <span>Name</span>
        <input name="name" value={values.name} onChange={handleChange} aria-invalid={Boolean(errors.name)} />
        {errors.name && <small className="error">{errors.name}</small>}
      </label>
      <label className="field">
        <span>Membership ID</span>
        <input name="membership_id" value={values.membership_id} onChange={handleChange} aria-invalid={Boolean(errors.membership_id)} />
        {errors.membership_id && <small className="error">{errors.membership_id}</small>}
      </label>
      <label className="field">
        <span>Role</span>
        <select name="role" value={values.role} onChange={handleChange}>
          <option value="member">Member</option>
          <option value="librarian">Librarian</option>
          <option value="admin">Admin</option>
        </select>
      </label>
      <label className="field">
        <span>{editing ? 'New password (leave blank to keep)' : 'Password'}</span>
        <input type="password" name="password" value={values.password} onChange={handleChange} autoComplete="new-password" aria-invalid={Boolean(errors.password)} />
        {errors.password && <small className="error">{errors.password}</small>}
      </label>
      <div className="form-actions">
        <button className="btn" disabled={saving}>{saving ? 'Saving…' : submitLabel}</button>
        {onCancel && <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>}
      </div>
      {serverError && <p className="alert form-wide" role="alert">{serverError}</p>}
    </form>
  );
}
