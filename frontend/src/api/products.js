import { apiRequest, ApiError } from './client'

export async function fetchProducts() {
  const data = await apiRequest('/api/show-products')
  return Array.isArray(data?.products) ? data.products : []
}

export async function searchProducts(query) {
  const trimmed = query.trim()
  if (!trimmed) return fetchProducts()
  const encoded = encodeURIComponent(trimmed)
  const data = await apiRequest(`/api/search?search=${encoded}`)
  return Array.isArray(data?.search) ? data.search : []
}

export async function createProduct(formData, adminToken) {
  const data = await apiRequest('/api/add-product', {
    method: 'POST',
    body: formData,
    token: adminToken,
    isFormData: true,
  })
  // Backend returns 200 with { msg: "product already exists" } when duplicate
  if (!data?.products) {
    throw new ApiError(data?.msg || 'Could not create product', 400, data)
  }
  return data
}
