import { createContext, useContext, useState } from 'react';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // useState initializer: baca user dari localStorage saat first mount.
  // Pattern: sekali baca, state ini yang dipakai sampai login/logout berikutnya.
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // useState initializer: baca token dari localStorage saat first mount.
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));

  // Terima { token, user } dari response login (dev-login atau google).
  // Simpan di localStorage + state.
  const login = ({ token: newToken, user: newUser }) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
