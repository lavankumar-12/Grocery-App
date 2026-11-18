import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  X,
  ShoppingBasket,
  Trash2,
  Plus,
  Minus,
  Loader2,
  ArrowRight,
  Sprout,
  Lock,
} from 'lucide-react'
import { getImageUrl } from '../api/client'
import { formatPrice } from '../constants/catalog'
import { useAuth, useCart } from '../context/hooks'

const FREE_DELIVERY_THRESHOLD = 499

export default function CartDrawer() {
  const { isUserAuthenticated } = useAuth()
  const {
    items,
    itemCount,
    subtotal,
    loading,
    updatingIds,
    isDrawerOpen,
    closeDrawer,
    addItem,
    decrementItem,
    removeItem,
  } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isDrawerOpen) return
    const handleKey = (e) => {
      if (e.key === 'Escape') closeDrawer()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isDrawerOpen, closeDrawer])

  if (!isDrawerOpen) return null

  const remainingForFree = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal)
  const progress = Math.min(100, Math.round((subtotal / FREE_DELIVERY_THRESHOLD) * 100))

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-stone-950/45 backdrop-blur-xs"
      onClick={closeDrawer}
      role="dialog"
      aria-modal="true"
      aria-label="Shopping basket"
    >
      <aside
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <ShoppingBasket className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-stone-900">Your Basket</h2>
              <p className="text-xs text-stone-500">
                {itemCount} {itemCount === 1 ? 'item' : 'items'} selected
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            className="rounded-xl p-2 text-stone-500 transition hover:bg-stone-100 hover:text-stone-900"
            aria-label="Close basket"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Free Delivery Progress */}
        {isUserAuthenticated && items.length > 0 && (
          <div className="border-b border-stone-100 bg-emerald-50/70 px-5 py-3">
            <p className="text-xs font-semibold text-emerald-900">
              {remainingForFree === 0
                ? 'You unlocked FREE express delivery!'
                : `Add ${formatPrice(remainingForFree)} more for FREE delivery`}
            </p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-emerald-200/70">
              <div
                className="h-full rounded-full bg-emerald-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {!isUserAuthenticated ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <Lock className="h-8 w-8" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-stone-900">Sign in to view your basket</h3>
              <p className="mt-1.5 max-w-xs text-sm text-stone-500">
                Sign in quickly with a one-time email passcode to save items and manage your cart.
              </p>
              <div className="mt-5 flex w-full max-w-xs flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    closeDrawer()
                    navigate('/login')
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-800"
                >
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    closeDrawer()
                    navigate('/register')
                  }}
                  className="inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-2.5 text-sm font-bold text-emerald-800 hover:bg-emerald-100"
                >
                  Register New Account
                </button>
              </div>
            </div>
          ) : loading && items.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-emerald-700">
              <Loader2 className="h-7 w-7 animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-100 text-stone-400">
                <ShoppingBasket className="h-8 w-8" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-stone-900">Your basket is empty</h3>
              <p className="mt-1.5 max-w-xs text-sm text-stone-500">
                Explore fresh vegetables, juicy fruits, and pantry staples to get started.
              </p>
              <button
                type="button"
                onClick={closeDrawer}
                className="mt-5 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-800"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((entry) => {
                const product = entry.product
                const productId = product?._id
                const isUpdating = Boolean(updatingIds[productId])
                const imgUrl = getImageUrl(product?.image)

                return (
                  <li
                    key={productId || entry._id}
                    className="flex gap-3.5 rounded-2xl border border-stone-200/80 bg-stone-50/60 p-3"
                  >
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white">
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={product?.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-emerald-50 text-emerald-700/50">
                          <Sprout className="h-7 w-7" />
                        </div>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="truncate text-sm font-bold text-stone-900">
                            {product?.name || 'Product'}
                          </h4>
                          <p className="text-xs text-stone-500">
                            {formatPrice(product?.price)} {product?.unit ? `• ${product.unit}` : ''}
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => removeItem(productId)}
                          className="rounded-lg p-1.5 text-stone-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          aria-label={`Remove ${product?.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <div className="inline-flex items-center rounded-lg border border-stone-200 bg-white p-0.5">
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => decrementItem(productId, entry.quantity)}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-stone-700 hover:bg-stone-100 disabled:opacity-50"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="min-w-7 text-center text-xs font-bold text-stone-900">
                            {isUpdating ? (
                              <Loader2 className="mx-auto h-3.5 w-3.5 animate-spin text-emerald-700" />
                            ) : (
                              entry.quantity
                            )}
                          </span>
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => addItem(productId, 1, { silent: true })}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <span className="text-sm font-extrabold text-stone-900">
                          {formatPrice((Number(product?.price) || 0) * entry.quantity)}
                        </span>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {isUserAuthenticated && items.length > 0 && (
          <div className="border-t border-stone-200 bg-stone-50/80 px-5 py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-600">Subtotal</span>
              <span className="text-lg font-extrabold text-stone-900">{formatPrice(subtotal)}</span>
            </div>
            <p className="mt-1 text-xs text-stone-500">
              Delivery fee calculated at checkout
            </p>
            <div className="mt-4 flex gap-2.5">
              <Link
                to="/cart"
                onClick={closeDrawer}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white shadow-sm shadow-emerald-700/20 transition hover:bg-emerald-800"
              >
                <span>View Full Basket</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </aside>
    </div>
  )
}
