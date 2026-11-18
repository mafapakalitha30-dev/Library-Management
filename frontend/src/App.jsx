import { Navigate, Route, Routes } from 'react-router-dom';
import NavBar from './components/NavBar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import BooksPage from './pages/BooksPage.jsx';
import TransactionsPage from './pages/TransactionsPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import { useAuth } from './context/AuthContext.jsx';

// Pages that need a signed-in user send everyone else to the login form.
function Protected({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/users" replace />;
}

export default function App() {
  return (
    <>
      <NavBar />
      <main className="page">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/books" element={<Protected><BooksPage /></Protected>} />
          <Route path="/transactions" element={<Protected><TransactionsPage /></Protected>} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
