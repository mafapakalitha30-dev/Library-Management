import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function NavBar() {
  const { user, logout } = useAuth();
  return (
    <header className="nav">
      <span className="brand">Stacks</span>
      <nav>
        <NavLink to="/" end>Dashboard</NavLink>
        <NavLink to="/books">Books</NavLink>
        <NavLink to="/transactions">Transactions</NavLink>
        <NavLink to="/users">Users</NavLink>
      </nav>
      {user && (
        <div className="nav-user">
          <span>{user.name} ({user.role})</span>
          <button className="btn btn-ghost" onClick={logout}>Log out</button>
        </div>
      )}
    </header>
  );
}
