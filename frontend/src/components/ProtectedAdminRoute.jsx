import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Loader2, ShieldCheck } from 'lucide-react'
import { verifyAdminSession } from '../api/auth'
import { useAuth, useToast } from '../context/hooks'

export default function ProtectedAdminRoute({ children }) {
  const { adminToken, isAdminAuthenticated, logoutAdmin } = useAuth()
  const { showToast } = useToast()
  const location = useLocation()

  const [verifiedToken, setVerifiedToken] = useState(null)

  useEffect(() => {
    if (!adminToken) return
    let cancelled = false

    verifyAdminSession(adminToken)
      .then((res) => {
        if (cancelled) return
        if (res?.authenticated) {
          setVerifiedToken(adminToken)
        } else {
          logoutAdmin()
          showToast('Please sign in with admin credentials to continue.', 'info')
        }
      })
      .catch(() => {
        if (cancelled) return
        logoutAdmin()
        showToast('Admin authentication required. Please sign in.', 'info')
      })

    return () => {
      cancelled = true
    }
  }, [adminToken, logoutAdmin, showToast])

  if (!isAdminAuthenticated || !adminToken) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />
  }

  if (verifiedToken !== adminToken) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-20 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
          <ShieldCheck className="h-6 w-6" />
        </span>
        <div className="flex items-center gap-2 text-sm font-bold text-stone-700">
          <Loader2 className="h-4 w-4 animate-spin text-emerald-700" />
          <span>Verifying admin access...</span>
        </div>
      </div>
    )
  }

  return children
}
