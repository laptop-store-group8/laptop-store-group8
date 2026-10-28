import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { Toast, ToastContainer } from 'react-bootstrap'

// Temporary #12-compatible provider until the shared toast implementation is available.
const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const nextId = useRef(0)

  const showToast = useCallback((message, variant = 'info') => {
    const id = nextId.current++
    setToasts((currentToasts) => [...currentToasts, { id, message, variant }])
  }, [])

  function dismissToast(id) {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id),
    )
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer position="top-end" className="p-3">
        {toasts.map(({ id, message, variant }) => (
          <Toast
            key={id}
            bg={variant}
            onClose={() => dismissToast(id)}
            delay={3000}
            autohide
          >
            <Toast.Body>{message}</Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }

  return context
}
