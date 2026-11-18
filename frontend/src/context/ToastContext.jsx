import { useCallback, useState } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { ToastContext } from './hooks'

let toastIdCounter = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(
    (message, type = 'success', duration = 3500) => {
      const id = ++toastIdCounter
      setToasts((prev) => [...prev, { id, message, type }])
      if (duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id))
        }, duration)
      }
      return id
    },
    []
  )

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed right-4 bottom-4 z-50 flex w-full max-w-sm flex-col gap-2.5 sm:right-6 sm:bottom-6"
      >
        {toasts.map((toast) => {
          const styles =
            toast.type === 'error'
              ? 'border-red-200 bg-red-50 text-red-900'
              : toast.type === 'info'
                ? 'border-sky-200 bg-sky-50 text-sky-900'
                : 'border-emerald-200 bg-emerald-50 text-emerald-950'

          const Icon =
            toast.type === 'error'
              ? AlertCircle
              : toast.type === 'info'
                ? Info
                : CheckCircle2

          const iconColor =
            toast.type === 'error'
              ? 'text-red-600'
              : toast.type === 'info'
                ? 'text-sky-600'
                : 'text-emerald-600'

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg shadow-stone-900/5 transition-all ${styles}`}
            >
              <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${iconColor}`} />
              <p className="flex-1 text-sm font-medium leading-snug">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="rounded-md p-0.5 opacity-60 transition hover:opacity-100"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
