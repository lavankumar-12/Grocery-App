import { apiRequest } from './client'

export function sendOtp({ name = '', email, mode }) {
  const payload = { email: email.trim() }
  if (name.trim()) payload.name = name.trim()
  if (mode) payload.mode = mode
  return apiRequest('/email/send-otp', {
    method: 'POST',
    body: payload,
  })
}

export function verifyOtp({ email, otp }) {
  return apiRequest('/email/verify-otp', {
    method: 'POST',
    body: { email: email.trim(), otp: String(otp).trim() },
  })
}

export function adminRegister({ name, email, password }) {
  return apiRequest('/admin/admin-register', {
    method: 'POST',
    body: { name: name.trim(), email: email.trim(), password },
  })
}

export function adminLogin({ email, password }) {
  return apiRequest('/admin/admin-login', {
    method: 'POST',
    body: { email: email.trim(), password },
  })
}

export function verifyAdminSession(adminToken) {
  return apiRequest('/admin/verify', {
    method: 'GET',
    token: adminToken,
  })
}
