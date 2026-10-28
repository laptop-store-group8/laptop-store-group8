import './App.css'
import { Route, Routes } from 'react-router-dom'
import AdminLayout from './components/layout/AdminLayout'
import MainLayout from './components/layout/MainLayout'
import ToastProvider from './contexts/ToastProvider'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminLaptopFormPage from './pages/admin/AdminLaptopFormPage'
import AdminLaptopListPage from './pages/admin/AdminLaptopListPage'
import AdminOrderListPage from './pages/admin/AdminOrderListPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import HomePage from './pages/HomePage'
import LaptopDetailPage from './pages/LaptopDetailPage'
import LaptopFilterDemoPage from './pages/LaptopFilterDemoPage'
import LaptopListPage from './pages/LaptopListPage'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'
import OrderListPage from './pages/OrderListPage'
import ToastDemoPage from './pages/ToastDemoPage'

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="laptops" element={<LaptopListPage />} />
          <Route path="laptops/:id" element={<LaptopDetailPage />} />
          {import.meta.env.DEV && (
            <Route
              path="dev/laptop-filter"
              element={<LaptopFilterDemoPage />}
            />
          )}
          <Route path="login" element={<LoginPage />} />
          {import.meta.env.DEV && (
            <Route path="dev/toast-demo" element={<ToastDemoPage />} />
          )}
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="orders" element={<OrderListPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="laptops" element={<AdminLaptopListPage />} />
          <Route path="laptops/new" element={<AdminLaptopFormPage />} />
          <Route path="laptops/:id" element={<AdminLaptopFormPage />} />
          <Route path="laptops/:id/edit" element={<AdminLaptopFormPage />} />
          <Route path="orders" element={<AdminOrderListPage />} />
        </Route>
      </Routes>
    </ToastProvider>
  )
}
