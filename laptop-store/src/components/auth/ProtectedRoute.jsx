import { useEffect, useRef } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useToast from '../../hooks/useToast';

export default function ProtectedRoute({
  roles,
  guestOnly = false,
  children,
}) {
  const { user } = useAuth();
  const location = useLocation();
  const { showToast } = useToast();
  const hasAccess = !roles || roles.includes(user?.role);
  const hasNotified = useRef(false);

  useEffect(() => {
    if (user && !guestOnly && !hasAccess && !hasNotified.current) {
      hasNotified.current = true;
      showToast('Bạn không có quyền truy cập', 'warning');
    }
  }, [guestOnly, hasAccess, showToast, user]);

  if (guestOnly) {
    return user ? <Navigate to="/" replace /> : children || <Outlet />;
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  if (!hasAccess) {
    return <Navigate to="/" replace />;
  }

  return children || <Outlet />;
}
