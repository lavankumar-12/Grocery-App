import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ToastProvider } from './context/ToastContext'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import Navbar from './components/Navbar'
import CartDrawer from './components/CartDrawer'
import Footer from './components/Footer'
import ProtectedAdminRoute from './components/ProtectedAdminRoute'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import CartPage from './pages/CartPage'
import AdminAuthPage from './pages/AdminAuthPage'
import AdminDashboardPage from './pages/AdminDashboardPage'

function AppShell() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="flex min-h-screen flex-col bg-[#fafaf7] text-stone-900">
      <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <main className="flex flex-1 flex-col">
        <Routes>
          <Route
            path="/"
            element={<HomePage searchQuery={searchQuery} onSearchChange={setSearchQuery} />}
          />
          <Route path="/login" element={<LoginPage initialMode="login" />} />
          <Route path="/register" element={<LoginPage initialMode="register" />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/admin/login" element={<AdminAuthPage />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedAdminRoute>
                <AdminDashboardPage />
              </ProtectedAdminRoute>
            }
          />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <AppShell />
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
