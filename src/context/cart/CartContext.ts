import { createContext } from 'react';
import { CartState, CartAction } from './types';

// todo: giao diện định nghĩa kiểu dữ liệu của Cart react context
export interface CartContextType {
  state:      CartState;
  dispatch:   React.Dispatch<CartAction>;
  totalItems: number;
  totalPrice: number;
}

// todo: Tạo thực thể React context cho giỏ hàng
export const CartContext = createContext<CartContextType | null>(null);
