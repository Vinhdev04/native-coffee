/**
 * @file CartContext.tsx
 * @desc Context giỏ hàng toàn cục — thêm, xóa, cập nhật sản phẩm
 *       và đóng/mở cart drawer qua reducer pattern.
 * @layer context
 */

import { createContext, useContext, useReducer, ReactNode } from 'react';

export interface CartItem {
  cartId:    string;
  id:        string;
  name:      string;
  price:     number;
  image:     string;
  quantity:  number;
  selectedAttributes?: any[];
  totalPrice?: number;
  note?:     string;
}

interface CartState {
  items:  CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: 'ADD_ITEM';       item: CartItem }
  | { type: 'REMOVE_ITEM';    cartId: string }
  | { type: 'UPDATE_ITEM';    cartId: string; item: CartItem }
  | { type: 'UPDATE_QUANTITY'; cartId: string; quantity: number }
  | { type: 'TOGGLE_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'CLEAR_CART' };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingIndex = state.items.findIndex((item) => item.cartId === action.item.cartId);
      if (existingIndex >= 0) {
        const newItems = [...state.items];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + action.item.quantity,
        };
        return { ...state, items: newItems };
      }
      return { ...state, items: [...state.items, action.item] };
    }

    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((item) => item.cartId !== action.cartId) };

    case 'UPDATE_ITEM': {
      if (action.item.quantity <= 0) {
        return { ...state, items: state.items.filter((item) => item.cartId !== action.cartId) };
      }
      const targetIndex = state.items.findIndex((item) => item.cartId === action.cartId);
      if (targetIndex < 0) return state;

      const nextItems  = state.items.filter((item) => item.cartId !== action.cartId);
      const mergeIndex = nextItems.findIndex((item) => item.cartId === action.item.cartId);

      if (mergeIndex >= 0) {
        nextItems[mergeIndex] = {
          ...nextItems[mergeIndex],
          quantity: nextItems[mergeIndex].quantity + action.item.quantity,
        };
        return { ...state, items: nextItems };
      }
      nextItems.splice(targetIndex, 0, action.item);
      return { ...state, items: nextItems };
    }

    case 'UPDATE_QUANTITY':
      if (action.quantity <= 0) {
        return { ...state, items: state.items.filter((item) => item.cartId !== action.cartId) };
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item.cartId === action.cartId ? { ...item, quantity: action.quantity } : item
        ),
      };

    case 'TOGGLE_CART': return { ...state, isOpen: !state.isOpen };
    case 'OPEN_CART':   return { ...state, isOpen: true };
    case 'CLOSE_CART':  return { ...state, isOpen: false };
    case 'CLEAR_CART':  return { ...state, items: [] };
    default:            return state;
  }
}

const CartContext = createContext<{
  state:      CartState;
  dispatch:   React.Dispatch<CartAction>;
  totalItems: number;
  totalPrice: number;
} | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], isOpen: false });

  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ state, dispatch, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  
  const { state, dispatch, totalItems, totalPrice } = context;

  const addToCart = (product: any) => {
    const quantity = product.quantity || 1;
    const selectedAttributes = product.selectedAttributes || [];
    const basePrice = Number(product.basePrice || product.price || 0);
    const extraPrice = selectedAttributes.reduce((sum: number, attr: any) => sum + (Number(attr.priceDelta) || 0), 0);
    const itemPrice = basePrice + extraPrice;

    dispatch({
      type: 'ADD_ITEM',
      item: {
        cartId: `${product.id}-${selectedAttributes.map((a: any) => a.id).join('-') || 'default'}`,
        id: product.id,
        name: product.name,
        price: itemPrice,
        image: product.imageUrl || product.image,
        quantity: quantity,
        selectedAttributes,
        totalPrice: itemPrice,
        note: product.note || ''
      }
    });
  };

  const removeItem = (cartId: string) => {
    dispatch({ type: 'REMOVE_ITEM', cartId });
  };

  const updateQuantity = (cartId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', cartId, quantity });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  return {
    items: state.items,
    isOpen: state.isOpen,
    totalItems,
    totalPrice,
    addToCart,
    removeItem,
    updateQuantity,
    clearCart,
    dispatch
  };
}
