export const CATEGORIES = [
  { value: 'vegetables', label: 'Vegetables', accent: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  { value: 'fruits', label: 'Fruits', accent: 'bg-amber-50 text-amber-800 border-amber-200' },
  { value: 'food grains', label: 'Food Grains', accent: 'bg-orange-50 text-orange-800 border-orange-200' },
]

export const UNITS = ['500g', '1kg', '2kg', '5kg']

export function formatCategoryLabel(category) {
  if (!category) return 'Fresh Produce'
  const match = CATEGORIES.find((c) => c.value.toLowerCase() === category.toLowerCase())
  if (match) return match.label
  return category
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function getCategoryStyle(category) {
  const match = CATEGORIES.find((c) => c.value.toLowerCase() === (category || '').toLowerCase())
  return match ? match.accent : 'bg-stone-100 text-stone-700 border-stone-200'
}

export function formatPrice(amount) {
  const num = Number(amount)
  if (Number.isNaN(num)) return '₹0'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: num % 1 === 0 ? 0 : 2,
  }).format(num)
}
