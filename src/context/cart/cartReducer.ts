import { CartState, CartAction } from './types';

// TODO: Hàm reducer để chuyển đổi trạng thái của giỏ hàng dựa trên các hành động
export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      // todo: tìm kiếm sản phẩm đã tồn tại có cùng mã cartId
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

    case 'UPDATE_NOTE':
      return {
        ...state,
        items: state.items.map((item) =>
          item.cartId === action.cartId ? { ...item, note: action.note } : item
        ),
      };

    // todo: thay đổi hiển thị ngăn kéo (drawer) của giỏ hàng
    case 'TOGGLE_CART': return { ...state, isOpen: !state.isOpen };
    case 'OPEN_CART':   return { ...state, isOpen: true };
    case 'CLOSE_CART':  return { ...state, isOpen: false };
    case 'CLEAR_CART':  return { ...state, items: [] };
    default:            return state;
  }
}
