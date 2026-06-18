import React, { useContext, useReducer, ReactNode } from 'react';
import { CartContext } from './CartContext';
import { cartReducer } from './cartReducer';
import { CartItem, CartState, ActiveTable } from './types';

// TODO: Thành phần Provider để bọc ứng dụng và chia sẻ trạng thái giỏ hàng
export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], isOpen: false, activeTable: null });

  // todo: tính toán thông tin tóm tắt tổng số lượng và tổng giá trị từ trạng thái
  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ state, dispatch, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

// TODO: Hook React tùy chỉnh để tương tác với trạng thái giỏ hàng và kích hoạt các hành động phụ trợ
export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  
  const { state, dispatch, totalItems, totalPrice } = context;

  // TODO: Thêm sản phẩm vào giỏ hàng, thực hiện tính toán giá và thuộc tính đi kèm
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

  // TODO: Xóa một mặt hàng khỏi giỏ hàng thông qua cartId của nó
  const removeItem = (cartId: string) => {
    dispatch({ type: 'REMOVE_ITEM', cartId });
  };

  // TODO: Cập nhật số lượng của một mặt hàng cụ thể trong giỏ hàng
  const updateQuantity = (cartId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', cartId, quantity });
  };

  // TODO: Cập nhật ghi chú hoặc hướng dẫn tùy chỉnh cho mặt hàng trong giỏ
  const updateNote = (cartId: string, note: string) => {
    dispatch({ type: 'UPDATE_NOTE', cartId, note });
  };

  // TODO: Xóa toàn bộ sản phẩm có trong giỏ hàng
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  // TODO: Cập nhật thông tin toàn bộ mặt hàng trong giỏ hàng
  const updateItem = (cartId: string, updatedItem: CartItem) => {
    dispatch({ type: 'UPDATE_ITEM', cartId, item: updatedItem });
  };

  // TODO: Cập nhật bàn ăn đang hoạt động
  const setActiveTable = (table: ActiveTable) => {
    dispatch({ type: 'SET_ACTIVE_TABLE', table });
  };

  // TODO: Xóa bàn ăn đang hoạt động
  const clearActiveTable = () => {
    dispatch({ type: 'CLEAR_ACTIVE_TABLE' });
  };

  return {
    items: state.items,
    isOpen: state.isOpen,
    activeTable: state.activeTable,
    totalItems,
    totalPrice,
    addToCart,
    removeItem,
    updateQuantity,
    updateNote,
    updateItem,
    clearCart,
    setActiveTable,
    clearActiveTable,
    dispatch
  };
}
