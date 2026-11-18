import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PlusCircle,
  Upload,
  Package,
  Sprout,
  Apple,
  Wheat,
  Search,
  LogOut,
  Loader2,
  X,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react'
import { createProduct, fetchProducts } from '../api/products'
import { getImageUrl } from '../api/client'
import {
  CATEGORIES,
  UNITS,
  formatCategoryLabel,
  formatPrice,
  getCategoryStyle,
} from '../constants/catalog'
import { useAuth, useToast } from '../context/hooks'

const INITIAL_FORM = {
  name: '',
  desc: '',
  price: '',
  category: 'vegetables',
  unit: '1kg',
}

export default function AdminDashboardPage() {
  const { adminToken, adminProfile, logoutAdmin } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [products, setProducts] = useState([])
  const [loadingList, setLoadingList] = useState(true)
  const [form, setForm] = useState(INITIAL_FORM)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const [inventorySearch, setInventorySearch] = useState('')
  const [inventoryCategory, setInventoryCategory] = useState('all')
  const fileInputRef = useRef(null)

  const loadInventory = useCallback(async () => {
    setLoadingList(true)
    try {
      const list = await fetchProducts()
      setProducts(list)
    } catch (err) {
      showToast(err.message || 'Could not load inventory', 'error')
    } finally {
      setLoadingList(false)
    }
  }, [showToast])

  useEffect(() => {
    let cancelled = false
    fetchProducts()
      .then((list) => {
        if (!cancelled) setProducts(list)
      })
      .catch((err) => {
        if (!cancelled) showToast(err.message || 'Could not load inventory', 'error')
      })
      .finally(() => {
        if (!cancelled) setLoadingList(false)
      })
    return () => {
      cancelled = true
    }
  }, [showToast])

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview)
    }
  }, [imagePreview])

  const handleImageSelect = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setFormError('Please select a valid image file (JPG, PNG, WEBP)')
      return
    }
    setFormError('')
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const clearImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImageFile(null)
    setImagePreview('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!form.name.trim() || !form.desc.trim()) {
      setFormError('Product name and description are required')
      return
    }
    const numericPrice = Number(form.price)
    if (!form.price || Number.isNaN(numericPrice) || numericPrice <= 0) {
      setFormError('Please enter a valid price greater than 0')
      return
    }

    const formData = new FormData()
    formData.append('name', form.name.trim())
    formData.append('desc', form.desc.trim())
    formData.append('price', String(numericPrice))
    formData.append('category', form.category)
    formData.append('unit', form.unit)
    if (imageFile) {
      formData.append('image', imageFile)
    }

    setSubmitting(true)
    try {
      await createProduct(formData, adminToken)
      showToast(`"${form.name.trim()}" added to inventory!`, 'success')
      setForm(INITIAL_FORM)
      clearImage()
      await loadInventory()
    } catch (err) {
      if (err.status === 403 || err.status === 401) {
        logoutAdmin()
        showToast('Admin session expired. Please sign in again.', 'info')
        navigate('/admin/login')
        return
      }
      setFormError(err.message || 'Failed to add product')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAdminLogout = () => {
    logoutAdmin()
    showToast('Signed out of Admin Portal', 'info')
    navigate('/admin/login')
  }

  const stats = useMemo(() => {
    const countBy = (cat) =>
      products.filter((p) => (p.category || '').toLowerCase() === cat).length
    return {
      total: products.length,
      vegetables: countBy('vegetables'),
      fruits: countBy('fruits'),
      grains: countBy('food grains'),
    }
  }, [products])

  const visibleProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCat =
        inventoryCategory === 'all' ||
        (p.category || '').toLowerCase() === inventoryCategory.toLowerCase()
      const matchesSearch =
        !inventorySearch.trim() ||
        (p.name || '').toLowerCase().includes(inventorySearch.trim().toLowerCase()) ||
        (p.desc || '').toLowerCase().includes(inventorySearch.trim().toLowerCase())
      return matchesCat && matchesSearch
    })
  }, [products, inventoryCategory, inventorySearch])

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-stone-200 bg-white p-6 shadow-xs">
        <div className="flex items-center gap-3.5">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-sm">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-stone-900 sm:text-2xl">
              Store Inventory Dashboard
            </h1>
            <p className="text-xs text-stone-500">
              Signed in as <span className="font-semibold text-stone-800">{adminProfile?.email}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadInventory}
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2 text-xs font-bold text-stone-700 transition hover:bg-stone-100"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loadingList ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            type="button"
            onClick={handleAdminLogout}
            className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100"
          >
            <LogOut className="h-3.5 w-3.5" />
            Admin Logout
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500">Total Products</span>
            <Package className="h-4 w-4 text-emerald-700" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-stone-900">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500">Vegetables</span>
            <Sprout className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-stone-900">{stats.vegetables}</p>
        </div>
        <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500">Fruits</span>
            <Apple className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-stone-900">{stats.fruits}</p>
        </div>
        <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500">Food Grains</span>
            <Wheat className="h-4 w-4 text-orange-500" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-stone-900">{stats.grains}</p>
        </div>
      </div>

      {/* Two-Column Main Area */}
      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        {/* Add Product Form */}
        <section className="lg:col-span-5">
          <div className="sticky top-24 rounded-3xl border border-stone-200 bg-white p-6 shadow-xs">
            <div className="flex items-center gap-2.5">
              <PlusCircle className="h-5 w-5 text-emerald-700" />
              <h2 className="text-lg font-extrabold text-stone-900">Add New Product</h2>
            </div>
            <p className="mt-1 text-xs text-stone-500">
              Publish a new grocery item directly to the storefront.
            </p>

            <form onSubmit={handleAddProduct} className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-stone-700">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Organic Red Tomato"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-sm text-stone-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-stone-700">Description</label>
                <textarea
                  rows={3}
                  required
                  value={form.desc}
                  onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
                  placeholder="Describe freshness, origin, or taste..."
                  className="w-full resize-none rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-sm text-stone-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-stone-700">Price (₹)</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    placeholder="80"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-900 outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-stone-700">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-2.5 py-2.5 text-sm text-stone-900 outline-none focus:border-emerald-500 focus:bg-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-stone-700">Pack Unit</label>
                  <select
                    value={form.unit}
                    onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-2.5 py-2.5 text-sm text-stone-900 outline-none focus:border-emerald-500 focus:bg-white"
                  >
                    {UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-stone-700">
                  Product Photo
                </label>
                {imagePreview ? (
                  <div className="relative overflow-hidden rounded-2xl border border-stone-200 bg-stone-50">
                    <img
                      src={imagePreview}
                      alt="Product preview"
                      className="h-44 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute top-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-stone-900/75 text-white transition hover:bg-red-600"
                      aria-label="Remove selected image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault()
                      handleImageSelect(e.dataTransfer.files?.[0])
                    }}
                    className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50/70 px-4 py-7 text-center transition hover:border-emerald-400 hover:bg-emerald-50/40"
                  >
                    <Upload className="h-6 w-6 text-emerald-700" />
                    <span className="mt-2 text-xs font-bold text-stone-700">
                      Click to upload or drag & drop
                    </span>
                    <span className="mt-0.5 text-[11px] text-stone-400">JPG, PNG, or WEBP</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageSelect(e.target.files?.[0])}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {formError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700">
                  {formError}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-sm shadow-emerald-700/20 transition hover:bg-emerald-800 disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Uploading Product...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="h-4 w-4" />
                    <span>Add Product to Store</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </section>

        {/* Live Inventory List */}
        <section className="lg:col-span-7">
          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-stone-900">Catalog Inventory</h2>
                <p className="text-xs text-stone-500">
                  {visibleProducts.length} of {products.length} items shown
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
                  <input
                    type="search"
                    value={inventorySearch}
                    onChange={(e) => setInventorySearch(e.target.value)}
                    placeholder="Filter catalog..."
                    className="w-44 rounded-xl border border-stone-200 bg-stone-50 py-2 pr-3 pl-8 text-xs outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>
                <select
                  value={inventoryCategory}
                  onChange={(e) => setInventoryCategory(e.target.value)}
                  className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-700 outline-none focus:border-emerald-500 focus:bg-white"
                >
                  <option value="all">All Categories</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loadingList ? (
              <div className="flex justify-center py-16 text-emerald-700">
                <Loader2 className="h-7 w-7 animate-spin" />
              </div>
            ) : visibleProducts.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-stone-200 py-14 text-center">
                <Sprout className="mx-auto h-9 w-9 text-stone-300" />
                <p className="mt-2 text-sm font-bold text-stone-700">No products in this view</p>
                <p className="mt-1 text-xs text-stone-400">
                  Add a product on the left or clear your search filter.
                </p>
              </div>
            ) : (
              <div className="mt-5 divide-y divide-stone-100">
                {visibleProducts.map((product) => {
                  const imgUrl = getImageUrl(product.image)
                  return (
                    <div
                      key={product._id}
                      className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0"
                    >
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-emerald-50 text-emerald-700/50">
                            <Sprout className="h-6 w-6" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-sm font-bold text-stone-900">
                            {product.name}
                          </h3>
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getCategoryStyle(
                              product.category
                            )}`}
                          >
                            {formatCategoryLabel(product.category)}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-xs text-stone-500">{product.desc}</p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-sm font-extrabold text-stone-900">
                          {formatPrice(product.price)}
                        </p>
                        <p className="text-[11px] font-medium text-stone-400">
                          {product.unit || 'Standard'}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
