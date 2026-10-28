import { useContext } from 'react';
import ToastContext from '../contexts/ToastContextValue';

export default function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast phải được sử dụng bên trong ToastProvider');
  }
  return context;
}
