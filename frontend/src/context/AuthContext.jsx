import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('got_token');
    const savedUser = localStorage.getItem('got_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await api.post('/api/auth/login', { email, password });
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('got_token', data.token);
    localStorage.setItem('got_user', JSON.stringify(data.user));
    return data;
  };

  const register = async (name, email, password, phone) => {
    const data = await api.post('/api/auth/register', { name, email, password, phone });
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('got_token', data.token);
    localStorage.setItem('got_user', JSON.stringify(data.user));
    return data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('got_token');
    localStorage.removeItem('got_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
