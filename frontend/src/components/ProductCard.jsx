import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Minus, ShoppingBag, Loader2, Eye, Sprout } from 'lucide-react'
import { getImageUrl } from '../api/client'
import { formatCategoryLabel, formatPrice, getCategoryStyle } from '../constants/catalog'
import { useAuth, useCart, useToast } from '../context/hooks'

export default function ProductCard({ product, onQuickView }) {
  const { isUserAuthenticated } = useAuth()
  const { addItem, decrementItem, getProductQuantity, updatingIds } = useCart()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [imgError, setImgError] = useState(false)

  const qty = getProductQuantity(product._id)
  const isUpdating = Boolean(updatingIds[product._id])
  const imageSrc = !imgError ? getImageUrl(product.image) : ''

  const handleAdd = async (e) => {
    e.stopPropagation()
    if (!isUserAuthenticated) {
      showToast('Please sign in with your email to add items to your basket', 'info')
      navigate('/login', { state: { from: '/' } })
      return
    }
    await addItem(product._id, 1)
  }

  const handleDecrement = async (e) => {
    e.stopPropagation()
    await decrementItem(product._id, qty)
  }

  return (
    <article
      onClick={() => onQuickView?.(product)}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-950/5"
    >
      {/* Product Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={product.name}
            onError={() => setImgError(true)}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-emerald-50 via-stone-50 to-amber-50 text-emerald-700/60">
            <Sprout className="h-12 w-12" />
            <span className="mt-1.5 text-xs font-medium text-stone-400">Fresh Produce</span>
          </div>
        )}

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold backdrop-blur-sm ${getCategoryStyle(
              product.category
            )}`}
          >
            {formatCategoryLabel(product.category)}
          </span>
        </div>

        {product.unit && (
          <span className="absolute right-3 bottom-3 rounded-lg bg-stone-900/75 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            {product.unit}
          </span>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onQuickView?.(product)
          }}
          className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-stone-700 opacity-0 shadow-sm backdrop-blur-sm transition group-hover:opacity-100 hover:bg-white hover:text-emerald-700"
          aria-label={`Quick view ${product.name}`}
        >
          <Eye className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-1 text-base font-bold text-stone-900 transition group-hover:text-emerald-800">
          {product.name}
        </h3>
        <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-xs leading-relaxed text-stone-500">
          {product.desc || 'Handpicked fresh quality grocery item.'}
        </p>

        <div className="mt-4 flex items-center justify-between gap-2 pt-2">
          <div>
            <span className="block text-lg font-extrabold text-stone-900">
              {formatPrice(product.price)}
            </span>
            {product.unit && (
              <span className="text-[11px] font-medium text-stone-400">per {product.unit}</span>
            )}
          </div>

          {qty > 0 ? (
            <div
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center rounded-xl border border-emerald-200 bg-emerald-50 p-1"
            >
              <button
                type="button"
                disabled={isUpdating}
                onClick={handleDecrement}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-emerald-800 shadow-xs transition hover:bg-emerald-100 disabled:opacity-50"
                aria-label="Decrease quantity"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="min-w-8 text-center text-sm font-bold text-emerald-950">
                {isUpdating ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : qty}
              </span>
              <button
                type="button"
                disabled={isUpdating}
                onClick={handleAdd}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-700 text-white shadow-xs transition hover:bg-emerald-800 disabled:opacity-50"
                aria-label="Increase quantity"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={isUpdating}
              onClick={handleAdd}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-sm shadow-emerald-700/15 transition hover:bg-emerald-800 active:scale-95 disabled:opacity-60"
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShoppingBag className="h-3.5 w-3.5" />
              )}
              <span>Add</span>
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
