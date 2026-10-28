import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminLayout from './components/layout/AdminLayout';
import MainLayout from './components/layout/MainLayout';
import AdminLaptopFormPage from './pages/admin/AdminLaptopFormPage';
import AdminLaptopPage from './pages/admin/AdminLaptopPage';
import AdminOrderPage from './pages/admin/AdminOrderPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import HomePage from './pages/HomePage';
import LaptopDetailPage from './pages/LaptopDetailPage';
import LaptopListPage from './pages/LaptopListPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import OrderListPage from './pages/OrderListPage';
import ToastDemoPage from './pages/ToastDemoPage';
import ToastProvider from './contexts/ToastProvider';

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="laptops" element={<LaptopListPage />} />
          <Route path="laptops/:id" element={<LaptopDetailPage />} />
          <Route element={<ProtectedRoute guestOnly />}>
            <Route path="login" element={<LoginPage />} />
          </Route>
          {import.meta.env.DEV && (
            <Route path="dev/toast-demo" element={<ToastDemoPage />} />
          )}
          <Route element={<ProtectedRoute roles={['customer']} />}>
            <Route path="cart" element={<CartPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="orders" element={<OrderListPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route
          path="admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="laptops" replace />} />
          <Route path="laptops" element={<AdminLaptopPage />} />
          <Route path="laptops/new" element={<AdminLaptopFormPage />} />
          <Route path="laptops/:id/edit" element={<AdminLaptopFormPage />} />
          <Route path="orders" element={<AdminOrderPage />} />
        </Route>
      </Routes>
    </ToastProvider>
  );
}
