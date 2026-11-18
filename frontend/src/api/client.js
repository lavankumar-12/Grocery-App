const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

export function getImageUrl(imagePath) {
  if (!imagePath) return ''
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  const normalized = imagePath.startsWith('/') ? imagePath : `/${imagePath}`
  return `${API_BASE}${normalized}`
}

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

export async function apiRequest(path, options = {}) {
  const { method = 'GET', body, token, isFormData = false } = options
  const headers = {}

  if (!isFormData && body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  let response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(
      'Unable to reach the server. Please make sure the backend is running on port 3000.',
      0,
      null
    )
  }

  const contentType = response.headers.get('content-type') || ''
  let data
  if (contentType.includes('application/json')) {
    try {
      data = await response.json()
    } catch {
      data = null
    }
  } else {
    const text = await response.text()
    data = text ? { msg: text } : null
  }

  if (!response.ok) {
    const message = data?.msg || data?.message || `Request failed (${response.status})`
    throw new ApiError(message, response.status, data)
  }

  return data
}
