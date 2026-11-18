import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Plus, Minus, ShoppingBag, Loader2, Sprout, CheckCircle2, Truck } from 'lucide-react'
import { getImageUrl } from '../api/client'
import { formatCategoryLabel, formatPrice, getCategoryStyle } from '../constants/catalog'
import { useAuth, useCart, useToast } from '../context/hooks'

export default function ProductModal({ product, onClose }) {
  const { isUserAuthenticated } = useAuth()
  const { addItem, getProductQuantity, updatingIds } = useCart()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [quantity, setQuantity] = useState(1)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    if (!product) return
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [product, onClose])

  if (!product) return null

  const inCartQty = getProductQuantity(product._id)
  const isUpdating = Boolean(updatingIds[product._id])
  const imageSrc = !imgError ? getImageUrl(product.image) : ''

  const handleAddToCart = async () => {
    if (!isUserAuthenticated) {
      showToast('Please sign in with your email to add items to your basket', 'info')
      onClose()
      navigate('/login', { state: { from: '/' } })
      return
    }
    const res = await addItem(product._id, quantity)
    if (res?.ok) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/50 p-4 backdrop-blur-xs"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative grid w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl sm:grid-cols-2"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-stone-600 shadow-sm transition hover:bg-stone-100 hover:text-stone-900"
          aria-label="Close product preview"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Image side */}
        <div className="relative aspect-square bg-stone-100 sm:aspect-auto">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={product.name}
              onError={() => setImgError(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full min-h-[240px] w-full flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-amber-50 text-emerald-700/60">
              <Sprout className="h-16 w-16" />
              <span className="mt-2 text-xs font-medium text-stone-400">No image uploaded</span>
            </div>
          )}
        </div>

        {/* Details side */}
        <div className="flex flex-col justify-between p-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getCategoryStyle(
                  product.category
                )}`}
              >
                {formatCategoryLabel(product.category)}
              </span>
              {product.unit && (
                <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-semibold text-stone-700">
                  Pack: {product.unit}
                </span>
              )}
            </div>

            <h2
              id="product-modal-title"
              className="mt-3 text-2xl font-extrabold tracking-tight text-stone-900"
            >
              {product.name}
            </h2>

            <p className="mt-2 text-2xl font-extrabold text-emerald-700">
              {formatPrice(product.price)}
              {product.unit && (
                <span className="ml-1.5 text-xs font-medium text-stone-400">/ {product.unit}</span>
              )}
            </p>

            <p className="mt-4 text-sm leading-relaxed text-stone-600">
              {product.desc || 'Freshly sourced produce delivered straight from local farms.'}
            </p>

            <div className="mt-5 space-y-2 rounded-2xl bg-stone-50 p-3.5 text-xs text-stone-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Quality checked & hygienically packed</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-emerald-600" />
                <span>Same-day express doorstep delivery</span>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-stone-100 pt-5">
            {inCartQty > 0 && (
              <p className="mb-2.5 text-xs font-semibold text-emerald-700">
                Currently {inCartQty} in your basket
              </p>
            )}
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center rounded-xl border border-stone-200 bg-stone-50 p-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-stone-700 shadow-xs transition hover:bg-stone-100"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-10 text-center text-sm font-bold text-stone-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-stone-700 shadow-xs transition hover:bg-stone-100"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <button
                type="button"
                disabled={isUpdating}
                onClick={handleAddToCart}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white shadow-sm shadow-emerald-700/20 transition hover:bg-emerald-800 disabled:opacity-60"
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ShoppingBag className="h-4 w-4" />
                )}
                <span>Add • {formatPrice((Number(product.price) || 0) * quantity)}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
