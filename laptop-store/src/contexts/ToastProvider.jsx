import { useCallback, useMemo, useRef, useState } from 'react';
import ToastContext from './toastContext';
import ToastContainer from '../components/common/ToastContainer';

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const showToast = useCallback((message, variant = 'info') => {
    const id = ++nextId.current;
    setToasts((current) => [...current, { id, message, variant }]);
    return id;
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}
