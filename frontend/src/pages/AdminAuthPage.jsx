import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ShieldCheck,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  LogOut,
} from 'lucide-react'
import { adminLogin, adminRegister } from '../api/auth'
import { useAuth, useToast } from '../context/hooks'

export default function AdminAuthPage() {
  const { isAdminAuthenticated, adminProfile, loginAdmin, logoutAdmin } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from || '/admin/dashboard'

  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (mode === 'register' && !name.trim()) {
      setError('Please enter admin name')
      return
    }
    if (!email.trim() || !password) {
      setError('Email and password are required')
      return
    }

    setLoading(true)
    try {
      if (mode === 'register') {
        await adminRegister({ name, email, password })
        showToast('Admin account registered! You can now sign in.', 'success')
        setMode('login')
        setPassword('')
      } else {
        const data = await adminLogin({ email, password })
        if (!data?.token) {
          throw new Error(data?.msg || 'Login failed: no token received')
        }
        loginAdmin(data.token, {
          name: data?.admin?.name || name.trim() || 'Store Admin',
          email: data?.admin?.email || email.trim(),
        })
        showToast('Signed in to Admin Dashboard', 'success')
        navigate(redirectTo, { replace: true })
      }
    } catch (err) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-xl shadow-stone-900/5">
        {/* Top Banner */}
        <div className="bg-gradient-to-br from-stone-900 via-emerald-950 to-emerald-900 px-8 py-7 text-white">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-amber-300">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight">Admin Portal</h1>
          <p className="mt-1 text-xs text-emerald-100/80">
            Sign in with authorized admin credentials to access the inventory dashboard.
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="p-6 sm:p-8">
          {isAdminAuthenticated && (
            <div className="mb-5 flex items-center justify-between gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs">
              <div className="min-w-0">
                <p className="font-bold text-emerald-950">Active admin session</p>
                <p className="truncate text-emerald-800">{adminProfile?.email}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <Link
                  to="/admin/dashboard"
                  className="rounded-lg bg-emerald-700 px-2.5 py-1.5 font-bold text-white hover:bg-emerald-800"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logoutAdmin()
                    showToast('Admin signed out', 'info')
                  }}
                  className="rounded-lg border border-red-200 bg-white p-1.5 text-red-600 hover:bg-red-50"
                  title="Sign out admin"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 rounded-xl bg-stone-100 p-1">
            <button
              type="button"
              onClick={() => {
                setMode('login')
                setError('')
              }}
              className={`rounded-lg py-2 text-xs font-bold transition ${
                mode === 'login'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Admin Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register')
                setError('')
              }}
              className={`rounded-lg py-2 text-xs font-bold transition ${
                mode === 'register'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Register Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === 'register' && (
              <div>
                <label className="mb-1.5 block text-xs font-bold text-stone-700">Admin Name</label>
                <div className="relative">
                  <User className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Store Manager"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 py-3 pr-4 pl-10 text-sm text-stone-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-bold text-stone-700">Admin Email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@freshbasket.com"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 py-3 pr-4 pl-10 text-sm text-stone-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-stone-700">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={4}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 py-3 pr-11 pl-10 text-sm text-stone-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 rounded-lg p-1 text-stone-400 hover:text-stone-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-sm shadow-emerald-700/20 transition hover:bg-emerald-800 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In to Dashboard' : 'Create Admin Account'}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-stone-100 pt-5 text-center text-xs text-stone-500">
            Looking to shop?{' '}
            <Link to="/" className="font-bold text-emerald-700 hover:underline">
              Return to Storefront
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
