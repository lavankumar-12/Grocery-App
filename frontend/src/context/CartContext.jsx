import { useCallback, useEffect, useMemo, useState } from 'react'
import { addToCart, getCart, removeCartItem } from '../api/cart'
import { CartContext, useAuth, useToast } from './hooks'

export function CartProvider({ children }) {
  const { userToken, isUserAuthenticated, logoutUser } = useAuth()
  const { showToast } = useToast()

  const [cartState, setCartState] = useState({ token: null, items: [] })
  const [loading, setLoading] = useState(false)
  const [updatingIds, setUpdatingIds] = useState({})
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const setProductUpdating = useCallback((productId, value) => {
    setUpdatingIds((prev) => {
      const next = { ...prev }
      if (value) next[productId] = true
      else delete next[productId]
      return next
    })
  }, [])

  const refreshCart = useCallback(async () => {
    if (!userToken) return
    setLoading(true)
    try {
      const cart = await getCart(userToken)
      const validItems = Array.isArray(cart?.items)
        ? cart.items.filter((entry) => entry && entry.product)
        : []
      setCartState({ token: userToken, items: validItems })
    } catch (err) {
      if (err.status === 403 || err.status === 401) {
        logoutUser()
        showToast('Your session expired. Please sign in again.', 'info')
      } else {
        showToast(err.message || 'Failed to load cart', 'error')
      }
    } finally {
      setLoading(false)
    }
  }, [userToken, logoutUser, showToast])

  useEffect(() => {
    if (!isUserAuthenticated || !userToken) return
    let cancelled = false
    getCart(userToken)
      .then((cart) => {
        if (cancelled) return
        const validItems = Array.isArray(cart?.items)
          ? cart.items.filter((entry) => entry && entry.product)
          : []
        setCartState({ token: userToken, items: validItems })
      })
      .catch((err) => {
        if (cancelled) return
        if (err.status === 403 || err.status === 401) {
          logoutUser()
          showToast('Your session expired. Please sign in again.', 'info')
        } else {
          showToast(err.message || 'Failed to load cart', 'error')
        }
      })
    return () => {
      cancelled = true
    }
  }, [isUserAuthenticated, userToken, logoutUser, showToast])

  const items = useMemo(
    () => (isUserAuthenticated && cartState.token === userToken ? cartState.items : []),
    [isUserAuthenticated, cartState, userToken]
  )

  const addItem = useCallback(
    async (productId, quantity = 1, { silent = false } = {}) => {
      if (!userToken) return { requiresAuth: true }
      setProductUpdating(productId, true)
      try {
        await addToCart({ productId, quantity }, userToken)
        await refreshCart()
        if (!silent) {
          showToast('Added to your basket!', 'success')
        }
        return { ok: true }
      } catch (err) {
        if (err.status === 403 || err.status === 401) {
          logoutUser()
          showToast('Session expired. Please sign in again.', 'info')
          return { requiresAuth: true }
        }
        showToast(err.message || 'Could not add item to cart', 'error')
        return { ok: false, error: err }
      } finally {
        setProductUpdating(productId, false)
      }
    },
    [userToken, refreshCart, setProductUpdating, showToast, logoutUser]
  )

  const removeItem = useCallback(
    async (productId, { silent = false } = {}) => {
      if (!userToken) return { requiresAuth: true }
      setProductUpdating(productId, true)
      try {
        await removeCartItem(productId, userToken)
        await refreshCart()
        if (!silent) {
          showToast('Item removed from basket', 'info')
        }
        return { ok: true }
      } catch (err) {
        if (err.status === 403 || err.status === 401) {
          logoutUser()
          showToast('Session expired. Please sign in again.', 'info')
          return { requiresAuth: true }
        }
        showToast(err.message || 'Could not remove item', 'error')
        return { ok: false, error: err }
      } finally {
        setProductUpdating(productId, false)
      }
    },
    [userToken, refreshCart, setProductUpdating, showToast, logoutUser]
  )

  const decrementItem = useCallback(
    async (productId, currentQty) => {
      if (!userToken) return { requiresAuth: true }
      if (currentQty <= 1) {
        return removeItem(productId)
      }
      setProductUpdating(productId, true)
      try {
        await removeCartItem(productId, userToken)
        await addToCart({ productId, quantity: currentQty - 1 }, userToken)
        await refreshCart()
        return { ok: true }
      } catch (err) {
        showToast(err.message || 'Could not update quantity', 'error')
        await refreshCart()
        return { ok: false, error: err }
      } finally {
        setProductUpdating(productId, false)
      }
    },
    [userToken, removeItem, refreshCart, setProductUpdating, showToast]
  )

  const getProductQuantity = useCallback(
    (productId) => {
      const found = items.find((entry) => {
        const id = typeof entry.product === 'string' ? entry.product : entry.product?._id
        return id === productId
      })
      return found ? found.quantity : 0
    },
    [items]
  )

  const itemCount = useMemo(
    () => items.reduce((sum, entry) => sum + (Number(entry.quantity) || 0), 0),
    [items]
  )

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, entry) => sum + (Number(entry.product?.price) || 0) * (Number(entry.quantity) || 0),
        0
      ),
    [items]
  )

  const value = useMemo(
    () => ({
      items,
      itemCount,
      subtotal,
      loading,
      updatingIds,
      isDrawerOpen,
      openDrawer: () => setIsDrawerOpen(true),
      closeDrawer: () => setIsDrawerOpen(false),
      refreshCart,
      addItem,
      removeItem,
      decrementItem,
      getProductQuantity,
    }),
    [
      items,
      itemCount,
      subtotal,
      loading,
      updatingIds,
      isDrawerOpen,
      refreshCart,
      addItem,
      removeItem,
      decrementItem,
      getProductQuantity,
    ]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
