import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Mail,
  User,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Leaf,
  RefreshCw,
  UserPlus,
} from 'lucide-react'
import { sendOtp, verifyOtp } from '../api/auth'
import { useAuth, useToast } from '../context/hooks'

const OTP_LENGTH = 6

export default function LoginPage({ initialMode = 'login' }) {
  const { isUserAuthenticated, loginUser } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from || '/'

  const mode = initialMode // 'login' | 'register'
  const isRegister = mode === 'register'

  const [step, setStep] = useState('email') // 'email' | 'otp'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [resolvedName, setResolvedName] = useState('')
  const [otpDigits, setOtpDigits] = useState(Array(OTP_LENGTH).fill(''))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(0)

  const inputRefs = useRef([])

  useEffect(() => {
    if (isUserAuthenticated) {
      navigate(redirectTo, { replace: true })
    }
  }, [isUserAuthenticated, navigate, redirectTo])

  useEffect(() => {
    if (step !== 'otp' || secondsLeft <= 0) return
    const timer = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [step, secondsLeft])

  const switchMode = (targetMode) => {
    setError('')
    setStep('email')
    setOtpDigits(Array(OTP_LENGTH).fill(''))
    navigate(targetMode === 'register' ? '/register' : '/login', {
      replace: true,
      state: location.state,
    })
  }

  const handleSendOtp = async (e, { isResend = false } = {}) => {
    e?.preventDefault()
    setError('')

    if (isRegister && !name.trim()) {
      setError('Please enter your full name')
      return
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    try {
      const res = await sendOtp({
        name: isRegister ? name : '',
        email,
        mode: isResend ? undefined : mode,
      })
      if (res?.name) {
        setResolvedName(res.name)
      }
      setStep('otp')
      setOtpDigits(Array(OTP_LENGTH).fill(''))
      setSecondsLeft(300) // 5 minutes matching backend
      showToast(
        isRegister && !isResend
          ? 'Account created! Enter the 6-digit OTP sent to your email.'
          : 'A 6-digit OTP has been sent to your email!',
        'success'
      )
      setTimeout(() => inputRefs.current[0]?.focus(), 50)
    } catch (err) {
      setError(err.message || 'Could not send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (index, value) => {
    const clean = value.replace(/\D/g, '')
    if (!clean) {
      setOtpDigits((prev) => {
        const next = [...prev]
        next[index] = ''
        return next
      })
      return
    }

    if (clean.length > 1) {
      const next = Array(OTP_LENGTH).fill('')
      clean
        .slice(0, OTP_LENGTH)
        .split('')
        .forEach((ch, idx) => {
          next[idx] = ch
        })
      setOtpDigits(next)
      const focusIdx = Math.min(clean.length, OTP_LENGTH - 1)
      inputRefs.current[focusIdx]?.focus()
      return
    }

    setOtpDigits((prev) => {
      const next = [...prev]
      next[index] = clean
      return next
    })
    if (index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setError('')
    const otp = otpDigits.join('')
    if (otp.length !== OTP_LENGTH) {
      setError('Please enter the complete 6-digit OTP')
      return
    }

    setLoading(true)
    try {
      const data = await verifyOtp({ email, otp })
      if (!data?.token) {
        throw new Error('Authentication token missing from response')
      }
      const displayName =
        data?.user?.name || resolvedName || name.trim() || email.trim().split('@')[0]
      loginUser(data.token, { name: displayName, email: data?.user?.email || email.trim() })
      showToast(
        isRegister ? `Welcome to FreshBasket, ${displayName}!` : `Welcome back, ${displayName}!`,
        'success'
      )
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP')
    } finally {
      setLoading(false)
    }
  }

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}:${String(s).padStart(2, '0')}`
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-xl shadow-stone-900/5 md:grid-cols-12">
        {/* Left Visual Panel */}
        <div className="hidden flex-col justify-between bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 p-8 text-white md:col-span-5 md:flex">
          <div>
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-amber-300">
              {isRegister ? <UserPlus className="h-6 w-6" /> : <Leaf className="h-6 w-6" />}
            </div>
            <h2 className="mt-6 text-2xl font-extrabold leading-tight">
              {isRegister
                ? 'Join FreshBasket in seconds.'
                : 'Passwordless grocery shopping.'}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-emerald-100/80">
              {isRegister
                ? 'Create your customer account with just your name and email. Verify with a one-time code to start filling your basket.'
                : 'Enter your registered email to receive an instant 6-digit verification code. Your basket stays synced across visits.'}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-xs text-emerald-100">
            <p className="font-bold text-amber-300">Fast & Secure</p>
            <p className="mt-1 opacity-85">
              One-time codes expire automatically after 5 minutes to keep your account safe.
            </p>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="p-6 sm:p-10 md:col-span-7">
          {step === 'email' ? (
            <>
              {/* Sign In / Register Switcher */}
              <div className="mb-6 grid grid-cols-2 rounded-xl bg-stone-100 p-1">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className={`rounded-lg py-2 text-xs font-bold transition ${
                    !isRegister
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className={`rounded-lg py-2 text-xs font-bold transition ${
                    isRegister
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Register User
                </button>
              </div>

              <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                {isRegister ? 'New Customer' : 'Returning Customer'}
              </span>
              <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-stone-900">
                {isRegister ? 'Create your account' : 'Sign in with Email OTP'}
              </h1>
              <p className="mt-1.5 text-sm text-stone-500">
                {isRegister
                  ? "Enter your details below and we'll send a 6-digit verification code."
                  : "Enter your registered email and we'll send a 6-digit login code."}
              </p>

              <form onSubmit={handleSendOtp} className="mt-6 space-y-4">
                {isRegister && (
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-stone-700">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-stone-400" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Lavanya Sharma"
                        className="w-full rounded-xl border border-stone-200 bg-stone-50 py-3 pr-4 pl-10 text-sm text-stone-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-stone-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-stone-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 py-3 pr-4 pl-10 text-sm text-stone-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                    />
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700">
                    <p>{error}</p>
                    {!isRegister && error.toLowerCase().includes('register') && (
                      <button
                        type="button"
                        onClick={() => switchMode('register')}
                        className="mt-1.5 font-bold text-emerald-800 underline"
                      >
                        Create a new account now →
                      </button>
                    )}
                    {isRegister && error.toLowerCase().includes('sign in') && (
                      <button
                        type="button"
                        onClick={() => switchMode('login')}
                        className="mt-1.5 font-bold text-emerald-800 underline"
                      >
                        Switch to Sign In →
                      </button>
                    )}
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
                      <span>{isRegister ? 'Register & Send OTP' : 'Send Verification Code'}</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              <p className="mt-5 text-center text-xs text-stone-500">
                {isRegister ? (
                  <>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="font-bold text-emerald-700 hover:underline"
                    >
                      Sign In
                    </button>
                  </>
                ) : (
                  <>
                    New to FreshBasket?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('register')}
                      className="font-bold text-emerald-700 hover:underline"
                    >
                      Register as a new user
                    </button>
                  </>
                )}
              </p>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  setStep('email')
                  setError('')
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 transition hover:text-emerald-700"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Change email
              </button>

              <div className="mt-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <KeyRound className="h-5 w-5" />
                </span>
                <div>
                  <h1 className="text-xl font-extrabold text-stone-900">
                    {isRegister ? 'Verify your new account' : 'Enter 6-digit OTP'}
                  </h1>
                  <p className="text-xs text-stone-500">
                    Sent to <span className="font-semibold text-stone-800">{email}</span>
                  </p>
                </div>
              </div>

              <form onSubmit={handleVerifyOtp} className="mt-6 space-y-5">
                <div className="flex justify-between gap-2">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={OTP_LENGTH}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      aria-label={`OTP digit ${index + 1}`}
                      className="h-13 w-full max-w-[3.25rem] rounded-xl border border-stone-200 bg-stone-50 text-center text-lg font-extrabold text-stone-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/15"
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-500">
                    {secondsLeft > 0 ? (
                      <>
                        Code expires in{' '}
                        <span className="font-bold text-stone-800">
                          {formatTimer(secondsLeft)}
                        </span>
                      </>
                    ) : (
                      <span className="font-semibold text-amber-700">OTP may have expired</span>
                    )}
                  </span>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleSendOtp(null, { isResend: true })}
                    className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-800 disabled:opacity-50"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Resend OTP
                  </button>
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
                      <span>{isRegister ? 'Complete Registration' : 'Verify & Sign In'}</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          <div className="mt-7 border-t border-stone-100 pt-5 text-center text-xs text-stone-500">
            Are you a store administrator?{' '}
            <Link to="/admin/login" className="font-bold text-emerald-700 hover:underline">
              Go to Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
