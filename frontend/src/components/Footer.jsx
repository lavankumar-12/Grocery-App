import { Link } from 'react-router-dom'
import { Leaf, ShieldCheck, Truck, Sparkles } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-stone-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white">
                <Leaf className="h-5 w-5" />
              </span>
              <span className="text-lg font-extrabold tracking-tight text-stone-900">
                Fresh<span className="text-emerald-700">Basket</span>
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-stone-500">
              Daily farm-sourced vegetables, seasonal fruits, and wholesome food grains delivered
              fresh to your kitchen.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-bold text-stone-900">Shop</h3>
              <ul className="mt-3 space-y-2 text-stone-500">
                <li>
                  <Link to="/" className="transition hover:text-emerald-700">
                    All Groceries
                  </Link>
                </li>
                <li>
                  <Link to="/cart" className="transition hover:text-emerald-700">
                    My Basket
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="transition hover:text-emerald-700">
                    Customer Sign In
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="transition hover:text-emerald-700">
                    Register User
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-stone-900">Store Management</h3>
              <ul className="mt-3 space-y-2 text-stone-500">
                <li>
                  <Link to="/admin/login" className="transition hover:text-emerald-700">
                    Admin Login
                  </Link>
                </li>
                <li>
                  <Link to="/admin/dashboard" className="transition hover:text-emerald-700">
                    Inventory Dashboard
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-stone-200/80 bg-stone-50 p-4 text-xs text-stone-600">
            <div className="flex items-center gap-2.5">
              <Truck className="h-4 w-4 text-emerald-700" />
              <span>Free delivery on orders above ₹499</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Sparkles className="h-4 w-4 text-amber-600" />
              <span>Fresh morning harvest stocked daily</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 text-emerald-700" />
              <span>Passwordless Email OTP login for fast checkout</span>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-stone-100 pt-6 text-center text-xs text-stone-400">
          © {new Date().getFullYear()} FreshBasket Grocery Store. Built with React & Tailwind CSS.
        </div>
      </div>
    </footer>
  )
}
