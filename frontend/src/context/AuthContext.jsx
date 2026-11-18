import { useCallback, useMemo, useState } from 'react'
import { AuthContext } from './hooks'

const USER_TOKEN_KEY = 'freshbasket_user_token'
const USER_PROFILE_KEY = 'freshbasket_user_profile'
const ADMIN_TOKEN_KEY = 'freshbasket_admin_token'
const ADMIN_PROFILE_KEY = 'freshbasket_admin_profile'

// Clean up any legacy persistent admin token from localStorage
try {
  localStorage.removeItem(ADMIN_TOKEN_KEY)
  localStorage.removeItem(ADMIN_PROFILE_KEY)
} catch {
  // ignore storage errors
}

function decodeJwtPayload(token) {
  try {
    if (typeof token !== 'string') return null
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = atob(base64)
    return JSON.parse(json)
  } catch {
    return null
  }
}

function isTokenValid(token, requiredClaim) {
  if (!token) return false
  const payload = decodeJwtPayload(token)
  if (!payload) return false
  if (requiredClaim && !payload[requiredClaim]) return false
  if (payload.exp && payload.exp * 1000 < Date.now()) {
    return false
  }
  return true
}

function readStoredJson(storage, key) {
  try {
    const raw = storage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function readValidToken(storage, tokenKey, profileKey, requiredClaim) {
  try {
    const token = storage.getItem(tokenKey)
    if (!isTokenValid(token, requiredClaim)) {
      storage.removeItem(tokenKey)
      storage.removeItem(profileKey)
      return null
    }
    return token
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [userToken, setUserToken] = useState(() =>
    readValidToken(localStorage, USER_TOKEN_KEY, USER_PROFILE_KEY, '_id')
  )
  const [userProfile, setUserProfile] = useState(() => {
    const token = readValidToken(localStorage, USER_TOKEN_KEY, USER_PROFILE_KEY, '_id')
    if (!token) return null
    const saved = readStoredJson(localStorage, USER_PROFILE_KEY)
    if (saved) return saved
    const payload = decodeJwtPayload(token)
    return payload?.email ? { email: payload.email, name: payload.email.split('@')[0] } : null
  })

  const [adminToken, setAdminToken] = useState(() =>
    readValidToken(sessionStorage, ADMIN_TOKEN_KEY, ADMIN_PROFILE_KEY, 'adminId')
  )
  const [adminProfile, setAdminProfile] = useState(() => {
    const token = readValidToken(sessionStorage, ADMIN_TOKEN_KEY, ADMIN_PROFILE_KEY, 'adminId')
    if (!token) return null
    return readStoredJson(sessionStorage, ADMIN_PROFILE_KEY) || { email: 'Admin' }
  })

  const loginUser = useCallback((token, profile) => {
    if (!isTokenValid(token, '_id')) return
    const payload = decodeJwtPayload(token)
    const resolvedProfile = {
      name: profile?.name || payload?.email?.split('@')[0] || 'Customer',
      email: profile?.email || payload?.email || '',
    }
    localStorage.setItem(USER_TOKEN_KEY, token)
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(resolvedProfile))
    setUserToken(token)
    setUserProfile(resolvedProfile)
  }, [])

  const logoutUser = useCallback(() => {
    localStorage.removeItem(USER_TOKEN_KEY)
    localStorage.removeItem(USER_PROFILE_KEY)
    setUserToken(null)
    setUserProfile(null)
  }, [])

  const loginAdmin = useCallback((token, profile) => {
    if (!isTokenValid(token, 'adminId')) return
    const resolvedProfile = {
      name: profile?.name || 'Store Admin',
      email: profile?.email || '',
    }
    sessionStorage.setItem(ADMIN_TOKEN_KEY, token)
    sessionStorage.setItem(ADMIN_PROFILE_KEY, JSON.stringify(resolvedProfile))
    setAdminToken(token)
    setAdminProfile(resolvedProfile)
  }, [])

  const logoutAdmin = useCallback(() => {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY)
    sessionStorage.removeItem(ADMIN_PROFILE_KEY)
    localStorage.removeItem(ADMIN_TOKEN_KEY)
    localStorage.removeItem(ADMIN_PROFILE_KEY)
    setAdminToken(null)
    setAdminProfile(null)
  }, [])

  const value = useMemo(
    () => ({
      userToken,
      userProfile,
      isUserAuthenticated: Boolean(userToken),
      loginUser,
      logoutUser,
      adminToken,
      adminProfile,
      isAdminAuthenticated: Boolean(adminToken),
      loginAdmin,
      logoutAdmin,
    }),
    [
      userToken,
      userProfile,
      loginUser,
      logoutUser,
      adminToken,
      adminProfile,
      loginAdmin,
      logoutAdmin,
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
