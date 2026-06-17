// todo: giao diện CartItem đại diện cho một sản phẩm trong giỏ hàng
export interface CartItem {
  cartId:    string;
  id:        string;
  name:      string;
  price:     number;
  image:     string;
  quantity:  number;
  size?:      string;
  sweetness?: string;
  toppings?:  string[];
  selectedAttributes?: any[];
  totalPrice?: number;
  note?:     string;
}

// todo: cấu trúc trạng thái CartState trong reducer
export interface CartState {
  items:  CartItem[];
  isOpen: boolean;
}

// todo: kiểu dữ liệu hợp nhất CartAction cho các thao tác trong reducer
export type CartAction =
  | { type: 'ADD_ITEM';       item: CartItem }
  | { type: 'REMOVE_ITEM';    cartId: string }
  | { type: 'UPDATE_ITEM';    cartId: string; item: CartItem }
  | { type: 'UPDATE_QUANTITY'; cartId: string; quantity: number }
  | { type: 'UPDATE_NOTE';    cartId: string; note: string }
  | { type: 'TOGGLE_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'CLEAR_CART' };
