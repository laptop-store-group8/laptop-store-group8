import './App.css'
import { Route, Routes } from 'react-router-dom'
import AppNavbar from './components/layout/AppNavbar.jsx'
import Footer from './components/layout/Footer.jsx'
import HomePage from './pages/HomePage.jsx'
import LaptopDetailPage from './pages/LaptopDetailPage.jsx'
import LaptopListPage from './pages/LaptopListPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import OrderListPage from './pages/OrderListPage.jsx'

function App() {
  return (
    <>
      <AppNavbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/laptops" element={<LaptopListPage />} />
        <Route path="/laptops/:id" element={<LaptopDetailPage />} />
        <Route path="/orders" element={<OrderListPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
    </>
  )
}

export default App
