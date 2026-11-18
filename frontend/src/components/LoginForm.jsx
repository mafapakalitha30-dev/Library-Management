import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginForm() {
  const { login } = useAuth();
  const [values, setValues] = useState({ membership_id: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!values.membership_id.trim() || !values.password) {
      setError('Enter your membership ID and password');
      return;
    }
    setBusy(true);
    try {
      await login(values.membership_id, values.password);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  const handleChange = (e) => setValues({ ...values, [e.target.name]: e.target.value });

  return (
    <form className="panel login" onSubmit={handleSubmit} noValidate>
      <h2>Log in</h2>
      <label className="field">
        <span>Membership ID</span>
        <input name="membership_id" value={values.membership_id} onChange={handleChange} autoComplete="username" />
      </label>
      <label className="field">
        <span>Password</span>
        <input type="password" name="password" value={values.password} onChange={handleChange} autoComplete="current-password" />
      </label>
      {error && <p className="alert" role="alert">{error}</p>}
      <button className="btn" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
    </form>
  );
}
