import { createContext, useContext, useState } from 'react';
import { api } from '../api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('user')); } catch { return null; }
  });

  async function login(membership_id, password) {
    const u = await api.post('/auth/login', { membership_id, password });
    sessionStorage.setItem('user', JSON.stringify(u));
    setUser(u);
  }

  function logout() {
    sessionStorage.removeItem('user');
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
