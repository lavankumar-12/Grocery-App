import { apiRequest } from './client'

export async function getCart(userToken) {
  try {
    const data = await apiRequest('/cart/cart-details', {
      method: 'GET',
      token: userToken,
    })
    return data?.cart || { items: [] }
  } catch (err) {
    // Backend responds with 400 "Cart not found" before a user adds their first item
    if (err.status === 400 && (err.message || '').toLowerCase().includes('cart not found')) {
      return { items: [] }
    }
    throw err
  }
}

export function addToCart({ productId, quantity = 1 }, userToken) {
  return apiRequest('/cart/add-to-cart', {
    method: 'POST',
    body: { productId, quantity },
    token: userToken,
  })
}

export function removeCartItem(productId, userToken) {
  return apiRequest(`/cart/remove-item/${productId}`, {
    method: 'DELETE',
    token: userToken,
  })
}
