import { createContext, useContext } from 'react'

// Temporary empty cart; #22 replaces this provider while keeping the same fields.
const EMPTY_CART = {
  items: [],
  totalQuantity: 0,
  totalPrice: 0,
  loading: false,
  error: null,
}

const CartContext = createContext(EMPTY_CART)

export function CartProvider({ children }) {
  return <CartContext.Provider value={EMPTY_CART}>{children}</CartContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  return useContext(CartContext)
}
