import { useFetch } from '../hooks/useFetch.js';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import LoginForm from '../components/LoginForm.jsx';
import UserForm from '../components/UserForm.jsx';
import UserList from '../components/UserList.jsx';
import Status from '../components/Status.jsx';

function AdminView() {
  const { user } = useAuth();
  const { data: users, loading, error, reload } = useFetch('/users');

  async function addUser(values) { await api.post('/users', values); await reload(); }
  async function updateUser(id, values) { await api.put(`/users/${id}`, values); await reload(); }
  async function deleteUser(u) {
    if (!window.confirm(`Delete ${u.name}?`)) return;
    try { await api.del(`/users/${u.id}`); await reload(); } catch (err) { window.alert(err.message); }
  }

  return (
    <>
      <section className="panel">
        <h2>Add a user</h2>
        <UserForm onSubmit={addUser} />
      </section>
      <section className="panel">
        <h2>All users</h2>
        <Status loading={loading} error={error} />
        {!loading && !error && <UserList users={users} currentUserId={user.id} onUpdate={updateUser} onDelete={deleteUser} />}
      </section>
    </>
  );
}

export default function UsersPage() {
  const { user } = useAuth();
  return (
    <>
      <h1>Users</h1>
      {!user && <LoginForm />}
      {user && user.role !== 'admin' && (
        <section className="panel">
          <h2>Your account</h2>
          <p>{user.name} · {user.membership_id} · {user.role}</p>
          <p className="muted">Only admins can manage other users.</p>
        </section>
      )}
      {user?.role === 'admin' && <AdminView />}
    </>
  );
}
