import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Leaf,
  Search,
  ShoppingBasket,
  User,
  UserPlus,
  ShieldCheck,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { useAuth, useCart, useToast } from '../context/hooks'

export default function Navbar({ searchQuery, onSearchChange }) {
  const { isUserAuthenticated, userProfile, logoutUser, isAdminAuthenticated } = useAuth()
  const { itemCount, openDrawer } = useCart()
  const { showToast } = useToast()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (location.pathname !== '/') {
      navigate('/')
    }
    setMobileMenuOpen(false)
  }

  const handleUserLogout = () => {
    logoutUser()
    showToast('Signed out successfully', 'info')
    setMobileMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link
          to="/"
          onClick={() => onSearchChange?.('')}
          className="group flex shrink-0 items-center gap-2.5"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-sm shadow-emerald-700/20 transition group-hover:scale-105 group-hover:bg-emerald-800">
            <Leaf className="h-5 w-5" />
          </span>
          <div className="leading-tight">
            <span className="block text-lg font-extrabold tracking-tight text-stone-900">
              Fresh<span className="text-emerald-700">Basket</span>
            </span>
            <span className="hidden text-[11px] font-medium text-stone-500 sm:block">
              Farm-fresh groceries
            </span>
          </div>
        </Link>

        {/* Desktop Search */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative hidden max-w-md flex-1 md:block"
        >
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => {
              onSearchChange?.(e.target.value)
              if (location.pathname !== '/') navigate('/')
            }}
            placeholder="Search tomatoes, apples, grains..."
            className="w-full rounded-xl border border-stone-200 bg-stone-50/80 py-2.5 pr-4 pl-10 text-sm text-stone-800 placeholder-stone-400 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
          />
        </form>

        {/* Desktop Actions */}
        <nav className="hidden items-center gap-2 md:flex">
          <Link
            to={isAdminAuthenticated ? '/admin/dashboard' : '/admin/login'}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition ${
              location.pathname.startsWith('/admin')
                ? 'bg-emerald-50 text-emerald-800'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>{isAdminAuthenticated ? 'Admin Panel' : 'Admin'}</span>
          </Link>

          {isUserAuthenticated ? (
            <div className="flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                {(userProfile?.name || userProfile?.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="max-w-[130px] leading-tight">
                <p className="truncate text-xs font-bold text-stone-800">
                  {userProfile?.name || 'Customer'}
                </p>
                <p className="truncate text-[11px] text-stone-500">{userProfile?.email}</p>
              </div>
              <button
                type="button"
                onClick={handleUserLogout}
                title="Sign out"
                className="ml-1 rounded-lg p-1.5 text-stone-500 transition hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm font-semibold text-stone-700 transition hover:border-emerald-300 hover:bg-emerald-50/60 hover:text-emerald-800"
              >
                <User className="h-4 w-4" />
                <span>Sign In</span>
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-sm font-semibold text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-100"
              >
                <UserPlus className="h-4 w-4" />
                <span>Register</span>
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={openDrawer}
            className="relative inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-700/20 transition hover:bg-emerald-800 active:scale-[0.98]"
          >
            <ShoppingBasket className="h-4 w-4" />
            <span>Basket</span>
            {itemCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1.5 text-xs font-extrabold text-stone-950">
                {itemCount}
              </span>
            )}
          </button>
        </nav>

        {/* Mobile Actions */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={openDrawer}
            className="relative inline-flex items-center justify-center rounded-xl bg-emerald-700 p-2.5 text-white shadow-sm"
            aria-label="Open basket"
          >
            <ShoppingBasket className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1 text-[11px] font-extrabold text-stone-950">
                {itemCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="rounded-xl border border-stone-200 p-2 text-stone-700"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="border-t border-stone-200 bg-white px-4 py-4 md:hidden">
          <form onSubmit={handleSearchSubmit} className="relative mb-3">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange?.(e.target.value)
                if (location.pathname !== '/') navigate('/')
              }}
              placeholder="Search fresh produce..."
              className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2.5 pr-4 pl-10 text-sm outline-none focus:border-emerald-500 focus:bg-white"
            />
          </form>
          <div className="flex flex-col gap-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl px-3 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-100"
            >
              Shop Groceries
            </Link>
            <Link
              to="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl px-3 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-100"
            >
              Full Basket ({itemCount})
            </Link>
            <Link
              to={isAdminAuthenticated ? '/admin/dashboard' : '/admin/login'}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-100"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-700" />
              <span>{isAdminAuthenticated ? 'Admin Dashboard' : 'Admin Portal'}</span>
            </Link>
            {isUserAuthenticated ? (
              <div className="mt-1 flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-stone-800">
                    {userProfile?.name || 'Customer'}
                  </p>
                  <p className="truncate text-xs text-stone-500">{userProfile?.email}</p>
                </div>
                <button
                  type="button"
                  onClick={handleUserLogout}
                  className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="mt-1 grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm font-semibold text-stone-800"
                >
                  <User className="h-4 w-4" />
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-700 px-3 py-2.5 text-sm font-semibold text-white"
                >
                  <UserPlus className="h-4 w-4" />
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
