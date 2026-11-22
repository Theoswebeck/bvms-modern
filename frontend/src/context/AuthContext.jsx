import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('uok_bvms_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('uok_bvms_token');
    if (token && !user) {
      api.get('/auth/me')
        .then((res) => {
          setUser(res.data.user);
          localStorage.setItem('uok_bvms_user', JSON.stringify(res.data.user));
        })
        .catch(() => {
          localStorage.removeItem('uok_bvms_token');
          localStorage.removeItem('uok_bvms_user');
          setUser(null);
        });
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('uok_bvms_token', res.data.token);
      localStorage.setItem('uok_bvms_user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('uok_bvms_token');
    localStorage.removeItem('uok_bvms_user');
    setUser(null);
  };

  const updateUserState = (updatedFields) => {
    const nextUser = { ...user, ...updatedFields };
    setUser(nextUser);
    localStorage.setItem('uok_bvms_user', JSON.stringify(nextUser));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUserState }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
