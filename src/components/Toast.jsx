import { useCallback, useEffect, useRef, useState } from 'react'

const ICONS = {
  success: (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
        clipRule="evenodd"
      />
    </svg>
  ),
  error: (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
        clipRule="evenodd"
      />
    </svg>
  ),
  info: (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
        clipRule="evenodd"
      />
    </svg>
  ),
  warning: (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
        clipRule="evenodd"
      />
    </svg>
  ),
}

const TYPE_STYLES = {
  success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  error: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
  info: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
  warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
}

const PROGRESS_STYLES = {
  success: 'bg-emerald-400',
  error: 'bg-rose-400',
  info: 'bg-blue-400',
  warning: 'bg-amber-400',
}

function ToastItem({ toast, onDismiss }) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setIsVisible(true))

    // Auto-dismiss
    timerRef.current = setTimeout(() => {
      setIsLeaving(true)
      setTimeout(() => onDismiss(toast.id), 300)
    }, toast.duration ?? 3000)

    return () => clearTimeout(timerRef.current)
  }, [onDismiss, toast.duration, toast.id])

  const handleDismiss = () => {
    clearTimeout(timerRef.current)
    setIsLeaving(true)
    setTimeout(() => onDismiss(toast.id), 300)
  }

  const type = toast.type ?? 'info'

  return (
    <div
      role="alert"
      className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-2xl border px-4 py-3 shadow-lg backdrop-blur-sm transition-all duration-300 ease-out ${TYPE_STYLES[type]} ${
        isVisible && !isLeaving
          ? 'translate-y-0 opacity-100'
          : 'translate-y-2 opacity-0'
      }`}
    >
      <span className="mt-0.5">{ICONS[type]}</span>

      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="text-sm font-semibold leading-tight">{toast.title}</p>
        )}
        <p className={`text-sm ${toast.title ? 'mt-0.5 opacity-80' : 'font-medium'}`}>
          {toast.message}
        </p>
      </div>

      <button
        type="button"
        onClick={handleDismiss}
        className="mt-0.5 shrink-0 rounded-lg p-0.5 opacity-50 transition hover:opacity-100"
        aria-label="Dismiss notification"
      >
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
        </svg>
      </button>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden bg-black/5">
        <div
          className={`h-full ${PROGRESS_STYLES[type]}`}
          style={{
            animation: `toast-progress ${toast.duration ?? 3000}ms linear forwards`,
          }}
        />
      </div>
    </div>
  )
}

function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) {
    return null
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 sm:bottom-auto sm:right-0 sm:top-0 sm:items-end sm:p-6">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

/** Custom hook – returns [toasts, addToast, dismissToast] */
function useToasts() {
  const [toasts, setToasts] = useState([])
  const counterRef = useRef(0)

  const addToast = useCallback(({ type = 'info', title, message, duration = 3000 }) => {
    counterRef.current += 1
    const id = `toast-${counterRef.current}-${Date.now()}`
    setToasts((current) => [...current, { id, type, title, message, duration }])
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id))
  }, [])

  return [toasts, addToast, dismissToast]
}

export { ToastContainer, useToasts }
