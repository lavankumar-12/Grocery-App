import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Search,
  SlidersHorizontal,
  X,
  RefreshCw,
  AlertTriangle,
  Sprout,
  Apple,
  Wheat,
  Sparkles,
  Truck,
  ShieldCheck,
  Clock,
} from 'lucide-react'
import { fetchProducts, searchProducts } from '../api/products'
import { CATEGORIES, UNITS } from '../constants/catalog'
import ProductCard from '../components/ProductCard'
import ProductModal from '../components/ProductModal'

const CATEGORY_CARDS = [
  {
    value: 'all',
    label: 'All Fresh Items',
    subtitle: 'Full store catalog',
    icon: Sparkles,
    colors: 'from-emerald-700 to-teal-700 text-white',
  },
  {
    value: 'vegetables',
    label: 'Vegetables',
    subtitle: 'Farm-picked greens & roots',
    icon: Sprout,
    colors: 'from-emerald-50 to-green-100 text-emerald-950 border border-emerald-200/80',
  },
  {
    value: 'fruits',
    label: 'Fresh Fruits',
    subtitle: 'Seasonal & orchard ripe',
    icon: Apple,
    colors: 'from-amber-50 to-orange-100 text-amber-950 border border-amber-200/80',
  },
  {
    value: 'food grains',
    label: 'Food Grains',
    subtitle: 'Wholesome pantry staples',
    icon: Wheat,
    colors: 'from-orange-50 to-yellow-100 text-orange-950 border border-orange-200/80',
  },
]

export default function HomePage({ searchQuery, onSearchChange }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedUnit, setSelectedUnit] = useState('all')
  const [sortBy, setSortBy] = useState('featured')
  const [previewProduct, setPreviewProduct] = useState(null)

  const loadProducts = useCallback(async (query) => {
    setLoading(true)
    setError('')
    try {
      const list = query?.trim() ? await searchProducts(query) : await fetchProducts()
      setProducts(list)
    } catch (err) {
      setError(err.message || 'Could not load products')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const trimmed = (searchQuery || '').trim()
    const timer = setTimeout(
      () => {
        loadProducts(trimmed)
      },
      trimmed ? 320 : 0
    )
    return () => clearTimeout(timer)
  }, [searchQuery, loadProducts])

  const filteredProducts = useMemo(() => {
    let list = [...products]

    if (selectedCategory !== 'all') {
      list = list.filter(
        (p) => (p.category || '').toLowerCase() === selectedCategory.toLowerCase()
      )
    }

    if (selectedUnit !== 'all') {
      list = list.filter((p) => (p.unit || '').toLowerCase() === selectedUnit.toLowerCase())
    }

    if (sortBy === 'price-asc') {
      list.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0))
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0))
    } else if (sortBy === 'name-asc') {
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    }

    return list
  }, [products, selectedCategory, selectedUnit, sortBy])

  const hasActiveFilters =
    selectedCategory !== 'all' || selectedUnit !== 'all' || Boolean(searchQuery?.trim())

  const clearFilters = () => {
    setSelectedCategory('all')
    setSelectedUnit('all')
    setSortBy('featured')
    onSearchChange?.('')
  }

  return (
    <div className="pb-16">
      {/* Hero Banner */}
      <section className="relative overflow-hidden border-b border-emerald-900/10 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-amber-400/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-28 left-1/4 h-72 w-72 rounded-full bg-emerald-400/15 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="grid items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-800/60 px-3.5 py-1 text-xs font-semibold tracking-wide text-emerald-100">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                Harvested fresh every morning
              </span>

              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl sm:leading-[1.1]">
                Farm-fresh groceries,{' '}
                <span className="text-amber-300">delivered in minutes.</span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-relaxed text-emerald-100/85 sm:text-base">
                Shop crisp vegetables, orchard-ripe fruits, and wholesome food grains directly from
                trusted local growers — cleanly packed and brought to your doorstep.
              </p>

              {/* Hero Search Input */}
              <div className="mt-7 flex max-w-lg flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    placeholder="What are you craving? Try 'Apple', 'Tomato'..."
                    className="w-full rounded-2xl border-0 bg-white py-3.5 pr-10 pl-11 text-sm font-medium text-stone-900 placeholder-stone-400 shadow-lg shadow-emerald-950/20 outline-none focus:ring-4 focus:ring-amber-300/40"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => onSearchChange?.('')}
                      className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <a
                  href="#catalog"
                  className="inline-flex items-center justify-center rounded-2xl bg-amber-400 px-6 py-3.5 text-sm font-extrabold text-stone-950 shadow-lg shadow-emerald-950/20 transition hover:bg-amber-300"
                >
                  Shop Now
                </a>
              </div>
            </div>

            {/* Trust Highlights */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:col-span-5 lg:grid-cols-1">
              <div className="flex items-center gap-3.5 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-400/20 text-amber-300">
                  <Truck className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-bold text-white">Free Express Delivery</p>
                  <p className="text-xs text-emerald-100/75">On every order over ₹499</p>
                </div>
              </div>
              <div className="flex items-center gap-3.5 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-400/20 text-emerald-200">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-bold text-white">100% Quality Checked</p>
                  <p className="text-xs text-emerald-100/75">Hand-sorted fresh produce daily</p>
                </div>
              </div>
              <div className="flex items-center gap-3.5 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-400/20 text-teal-200">
                  <Clock className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-bold text-white">Instant OTP Sign-In</p>
                  <p className="text-xs text-emerald-100/75">No passwords to remember</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div id="catalog" className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        {/* Category Quick Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {CATEGORY_CARDS.map((card) => {
            const Icon = card.icon
            const isActive = selectedCategory === card.value
            return (
              <button
                key={card.value}
                type="button"
                onClick={() => setSelectedCategory(card.value)}
                className={`group flex items-center gap-3 rounded-2xl bg-gradient-to-br p-4 text-left transition ${
                  card.colors
                } ${
                  isActive
                    ? 'ring-2 ring-emerald-700 ring-offset-2 ring-offset-[#fafaf7]'
                    : 'opacity-90 hover:opacity-100 hover:shadow-md'
                }`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    card.value === 'all' ? 'bg-white/15 text-amber-300' : 'bg-white/80 text-current'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold">{card.label}</p>
                  <p
                    className={`truncate text-xs ${
                      card.value === 'all' ? 'text-emerald-100/80' : 'opacity-70'
                    }`}
                  >
                    {card.subtitle}
                  </p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Filter & Sort Toolbar */}
        <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wide text-stone-500 uppercase">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters:
            </span>

            {/* Category pills */}
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  selectedCategory === 'all'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                All
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    selectedCategory === cat.value
                      ? 'bg-emerald-700 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              aria-label="Filter by pack size"
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-700 outline-none focus:border-emerald-500 focus:bg-white"
            >
              <option value="all">All Pack Sizes</option>
              {UNITS.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>

            <select
              aria-label="Sort products"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-700 outline-none focus:border-emerald-500 focus:bg-white"
            >
              <option value="featured">Sort: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1 rounded-xl px-2.5 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
              >
                <X className="h-3.5 w-3.5" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Section Heading */}
        <div className="mt-7 flex items-baseline justify-between">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-stone-900">
              {searchQuery?.trim()
                ? `Search results for "${searchQuery.trim()}"`
                : selectedCategory === 'all'
                  ? 'Fresh Groceries'
                  : CATEGORIES.find((c) => c.value === selectedCategory)?.label || 'Groceries'}
            </h2>
            {!loading && !error && (
              <p className="mt-0.5 text-xs font-medium text-stone-500">
                Showing {filteredProducts.length}{' '}
                {filteredProducts.length === 1 ? 'product' : 'products'}
              </p>
            )}
          </div>
        </div>

        {/* Product Grid States */}
        {loading ? (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white"
              >
                <div className="aspect-[4/3] animate-pulse bg-stone-200/70" />
                <div className="space-y-3 p-4">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-stone-200/80" />
                  <div className="h-3 w-full animate-pulse rounded bg-stone-100" />
                  <div className="flex items-center justify-between pt-2">
                    <div className="h-5 w-16 animate-pulse rounded bg-stone-200/80" />
                    <div className="h-8 w-20 animate-pulse rounded-xl bg-stone-200/80" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="mt-6 flex flex-col items-center justify-center rounded-3xl border border-red-200 bg-red-50/70 px-6 py-14 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-stone-900">Could not load groceries</h3>
            <p className="mt-1.5 max-w-md text-sm text-stone-600">{error}</p>
            <button
              type="button"
              onClick={() => loadProducts(searchQuery)}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-800"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="mt-6 flex flex-col items-center justify-center rounded-3xl border border-stone-200 bg-white px-6 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <Sprout className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-stone-900">No matching groceries found</h3>
            <p className="mt-1.5 max-w-sm text-sm text-stone-500">
              Try adjusting your search keywords, pack size, or category filter to explore more
              fresh items.
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-800"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onQuickView={setPreviewProduct}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Quick View Modal */}
      <ProductModal
        key={previewProduct?._id || 'closed'}
        product={previewProduct}
        onClose={() => setPreviewProduct(null)}
      />
    </div>
  )
}
