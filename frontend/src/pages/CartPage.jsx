import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ShoppingBasket,
  Trash2,
  Plus,
  Minus,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Sprout,
  Truck,
  CheckCircle2,
  Lock,
} from 'lucide-react'
import { getImageUrl } from '../api/client'
import { formatCategoryLabel, formatPrice } from '../constants/catalog'
import { useAuth, useCart, useToast } from '../context/hooks'

const FREE_DELIVERY_THRESHOLD = 499
const DELIVERY_FEE = 40

export default function CartPage() {
  const { isUserAuthenticated, userProfile } = useAuth()
  const { items, itemCount, subtotal, loading, updatingIds, addItem, decrementItem, removeItem } =
    useCart()
  const { showToast } = useToast()
  const [orderPlaced, setOrderPlaced] = useState(false)

  const deliveryFee = subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
  const total = subtotal + deliveryFee
  const remainingForFree = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal)
  const progress = Math.min(100, Math.round((subtotal / FREE_DELIVERY_THRESHOLD) * 100))

  const handleCheckout = () => {
    setOrderPlaced(true)
    showToast('Order summary confirmed!', 'success')
  }

  if (!isUserAuthenticated) {
    return (
      <div className="mx-auto flex max-w-7xl flex-1 items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <Lock className="h-8 w-8" />
          </div>
          <h1 className="mt-5 text-2xl font-extrabold text-stone-900">Sign in to view your basket</h1>
          <p className="mt-2 text-sm text-stone-500">
            Your shopping cart is saved securely to your email account. Verify with a quick OTP to
            continue.
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <Link
              to="/login"
              state={{ from: '/cart' }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-800"
            >
              <span>Sign In with Email OTP</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/register"
              state={{ from: '/cart' }}
              className="inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-2.5 text-sm font-bold text-emerald-800 hover:bg-emerald-100"
            >
              Register New Account
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-semibold text-stone-600 hover:bg-stone-100"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Store
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Continue Shopping
          </Link>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-stone-900 sm:text-3xl">
            Shopping Basket
          </h1>
          <p className="text-sm text-stone-500">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} for {userProfile?.email}
          </p>
        </div>
      </div>

      {loading && items.length === 0 ? (
        <div className="mt-12 flex justify-center py-16 text-emerald-700">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-3xl border border-stone-200 bg-white px-6 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-100 text-stone-400">
            <ShoppingBasket className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-stone-900">Your basket is empty</h2>
          <p className="mt-1.5 max-w-sm text-sm text-stone-500">
            Looks like you haven&apos;t added any fresh produce yet. Browse our catalog and fill your
            basket!
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-800"
          >
            <span>Explore Groceries</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          {/* Items List */}
          <div className="space-y-4 lg:col-span-8">
            {/* Delivery Progress Bar */}
            <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-950">
                <Truck className="h-4 w-4 text-emerald-700" />
                <span>
                  {remainingForFree === 0
                    ? 'Awesome! Your order qualifies for FREE express delivery.'
                    : `Add ${formatPrice(remainingForFree)} more to unlock FREE express delivery`}
                </span>
              </div>
              <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-emerald-200/70">
                <div
                  className="h-full rounded-full bg-emerald-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="space-y-3">
              {items.map((entry) => {
                const product = entry.product
                const productId = product?._id
                const isUpdating = Boolean(updatingIds[productId])
                const imgUrl = getImageUrl(product?.image)

                return (
                  <div
                    key={productId || entry._id}
                    className="flex flex-col gap-4 rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs sm:flex-row sm:items-center"
                  >
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={product?.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-emerald-50 text-emerald-700/50">
                          <Sprout className="h-8 w-8" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-semibold text-stone-600">
                          {formatCategoryLabel(product?.category)}
                        </span>
                        {product?.unit && (
                          <span className="text-xs font-medium text-stone-400">
                            {product.unit}
                          </span>
                        )}
                      </div>
                      <h3 className="mt-1 text-base font-bold text-stone-900">{product?.name}</h3>
                      <p className="mt-0.5 line-clamp-1 text-xs text-stone-500">{product?.desc}</p>
                      <p className="mt-2 text-sm font-bold text-emerald-700">
                        {formatPrice(product?.price)}{' '}
                        <span className="text-xs font-normal text-stone-400">each</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-4 border-t border-stone-100 pt-3 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
                      <span className="text-base font-extrabold text-stone-900">
                        {formatPrice((Number(product?.price) || 0) * entry.quantity)}
                      </span>

                      <div className="flex items-center gap-2">
                        <div className="inline-flex items-center rounded-xl border border-stone-200 bg-stone-50 p-1">
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => decrementItem(productId, entry.quantity)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-stone-700 shadow-xs hover:bg-stone-100 disabled:opacity-50"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="min-w-8 text-center text-sm font-bold text-stone-900">
                            {isUpdating ? (
                              <Loader2 className="mx-auto h-4 w-4 animate-spin text-emerald-700" />
                            ) : (
                              entry.quantity
                            )}
                          </span>
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => addItem(productId, 1, { silent: true })}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-700 text-white shadow-xs hover:bg-emerald-800 disabled:opacity-50"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => removeItem(productId)}
                          className="rounded-xl border border-stone-200 p-2.5 text-stone-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          aria-label={`Remove ${product?.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 rounded-3xl border border-stone-200/90 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-extrabold text-stone-900">Order Summary</h2>

              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between text-stone-600">
                  <dt>Subtotal ({itemCount} items)</dt>
                  <dd className="font-semibold text-stone-900">{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex items-center justify-between text-stone-600">
                  <dt>Delivery Fee</dt>
                  <dd className="font-semibold text-emerald-700">
                    {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
                  </dd>
                </div>
                <div className="border-t border-stone-200 pt-3">
                  <div className="flex items-center justify-between text-base">
                    <dt className="font-bold text-stone-900">Total</dt>
                    <dd className="text-xl font-extrabold text-stone-900">{formatPrice(total)}</dd>
                  </div>
                </div>
              </dl>

              {orderPlaced ? (
                <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" />
                  <p className="mt-2 text-sm font-bold text-emerald-950">Order Confirmed!</p>
                  <p className="mt-1 text-xs text-emerald-800">
                    Thank you for shopping with FreshBasket. Your fresh groceries are being packed.
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleCheckout}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3.5 text-sm font-bold text-white shadow-sm shadow-emerald-700/20 transition hover:bg-emerald-800"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}

              <p className="mt-4 text-center text-xs text-stone-400">
                Freshness guaranteed • Hygienically packed produce
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
