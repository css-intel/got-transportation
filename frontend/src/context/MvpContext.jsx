import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const MvpContext = createContext(null);

export function MvpProvider({ children }) {
  const [mvpPaid, setMvpPaid] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkMvpStatus = async () => {
    try {
      const data = await api.get('/api/payments/mvp-status');
      setMvpPaid(data.paid);
    } catch {
      setMvpPaid(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkMvpStatus();
  }, []);

  return (
    <MvpContext.Provider value={{ mvpPaid, loading, checkMvpStatus, setMvpPaid }}>
      {children}
    </MvpContext.Provider>
  );
}

export function useMvp() {
  const context = useContext(MvpContext);
  if (!context) throw new Error('useMvp must be used within MvpProvider');
  return context;
}
