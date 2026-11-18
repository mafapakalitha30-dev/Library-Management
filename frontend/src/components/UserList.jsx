import { useState } from 'react';
import UserForm from './UserForm.jsx';

export default function UserList({ users, currentUserId, onUpdate, onDelete }) {
  const [editingId, setEditingId] = useState(null);
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr><th>Name</th><th>Membership ID</th><th>Role</th><th></th></tr>
        </thead>
        <tbody>
          {users.map((u) =>
            editingId === u.id ? (
              <tr key={u.id}>
                <td colSpan="4">
                  <UserForm
                    initial={u}
                    submitLabel="Save changes"
                    onCancel={() => setEditingId(null)}
                    onSubmit={async (values) => { await onUpdate(u.id, values); setEditingId(null); }}
                  />
                </td>
              </tr>
            ) : (
              <tr key={u.id}>
                <td data-label="Name">{u.name}</td>
                <td data-label="Membership ID">{u.membership_id}</td>
                <td data-label="Role">{u.role}</td>
                <td className="row-actions">
                  <button className="btn btn-small" onClick={() => setEditingId(u.id)}>Update</button>
                  <button className="btn btn-small btn-danger" disabled={u.id === currentUserId} onClick={() => onDelete(u)}>Delete</button>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}
