import React from 'react';
import {
  View, Text, StyleSheet, FlatList, 
  TouchableOpacity, Image, SafeAreaView, ActivityIndicator,
  Platform, StatusBar
} from 'react-native';
import { useCart } from '@/context/CartContext';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, BORDER_RADIUS } from '@/styles/theme';
import { formatCurrency } from '@/utils';
import { ChevronLeft, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react-native';
import { createOrder } from '@/services/orderService';
import Toast from 'react-native-toast-message';

const CartScreen = () => {
  const navigation = useNavigation<any>();
  const { items, totalPrice, updateQuantity, removeItem, clearCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = React.useState(false);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    try {
      setIsCheckingOut(true);
      const payload = {
        branchId: 1,
        items: items.map(item => ({
          productId: item.id,
          qty: item.quantity,
          selectedProductAttributeIds: item.selectedAttributes?.map((a: any) => a.id) || [],
          note: item.note || ''
        }))
      };

      await createOrder(payload as any);
      
      Toast.show({
        type: 'success',
        text1: 'Đặt hàng thành công!',
        text2: 'Đơn hàng của bạn đang được xử lý.',
      });
      
      clearCart();
      navigation.navigate('Orders');
    } catch (error) {
      console.error('Checkout error:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi đặt hàng',
        text2: 'Vui lòng thử lại sau.',
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={s.cartItem}>
      <Image 
        source={{ uri: item.imageUrl || item.image || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=300&auto=format&fit=crop' }} 
        style={s.image} 
      />
      <View style={s.itemInfo}>
        <View style={s.titleRow}>
          <Text style={s.itemName} numberOfLines={1}>{item.name}</Text>
          <TouchableOpacity style={s.deleteBtn} onPress={() => removeItem(item.cartId)}>
            <Trash2 size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
        <Text style={s.itemOptions} numberOfLines={2}>
          {[
            item.selectedAttributes?.map((a: any) => a.name).join(' • '),
            item.note ? `Ghi chú: ${item.note}` : null
          ].filter(Boolean).join(' • ') || 'Không có tùy chọn'}
        </Text>
        <View style={s.priceQtyRow}>
          <Text style={s.itemPrice}>{formatCurrency(item.totalPrice || item.price)}</Text>
          <View style={s.quantityControl}>
            <TouchableOpacity 
              style={s.qtyBtn} 
              onPress={() => updateQuantity(item.cartId, Math.max(0, item.quantity - 1))}
            >
              <Minus size={14} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={s.qtyText}>{item.quantity}</Text>
            <TouchableOpacity 
              style={s.qtyBtn} 
              onPress={() => updateQuantity(item.cartId, item.quantity + 1)}
            >
              <Plus size={14} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Giỏ hàng</Text>
        <TouchableOpacity onPress={clearCart}>
          <Text style={s.clearText}>Xóa hết</Text>
        </TouchableOpacity>
      </View>

      {items.length > 0 ? (
        <>
          <FlatList
            data={items}
            renderItem={renderItem}
            keyExtractor={(item) => item.cartId}
            contentContainerStyle={s.listContent}
          />
          <View style={s.footer}>
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Tổng cộng</Text>
              <Text style={s.totalValue}>{formatCurrency(totalPrice)}</Text>
            </View>
            <TouchableOpacity 
              style={[s.checkoutBtn, isCheckingOut && { opacity: 0.7 }]} 
              onPress={handleCheckout}
              disabled={isCheckingOut}
            >
              {isCheckingOut ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={s.checkoutText}>Thanh toán ngay</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={s.emptyContainer}>
          <ShoppingBag size={80} color={COLORS.borderLight} />
          <Text style={s.emptyTitle}>Giỏ hàng trống</Text>
          <Text style={s.emptySubtitle}>Hãy chọn những món cà phê thơm ngon nhất nhé!</Text>
          <TouchableOpacity 
            style={s.shopBtn} 
            onPress={() => navigation.navigate('Main')}
          >
            <Text style={s.shopBtnText}>Quay lại thực đơn</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 10,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.backgroundSecondary, borderRadius: 12 },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.textPrimary },
  clearText: { fontFamily: FONTS.medium, fontSize: 14, color: COLORS.error },

  listContent: { padding: 16 },
  cartItem: { 
    flexDirection: 'row', 
    padding: 16, 
    marginBottom: 16, 
    backgroundColor: COLORS.white, 
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  image: { width: 80, height: 80, borderRadius: 12, backgroundColor: COLORS.backgroundSecondary },
  itemInfo: { flex: 1, marginLeft: 14, justifyContent: 'space-between' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  itemName: { flex: 1, fontFamily: FONTS.bold, fontSize: 15, color: '#111827', marginRight: 8 },
  deleteBtn: { padding: 2 },
  itemOptions: { fontFamily: FONTS.regular, fontSize: 12, color: '#6B7280', marginTop: 4, marginBottom: 8 },
  priceQtyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemPrice: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.primary },
  quantityControl: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.white, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#F3F4F6' 
  },
  qtyBtn: { width: 28, height: 28, justifyContent: 'center', alignItems: 'center' },
  qtyText: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.textPrimary, paddingHorizontal: 6 },

  footer: { padding: 20, borderTopWidth: 1, borderTopColor: COLORS.borderLight, backgroundColor: COLORS.white },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  totalLabel: { fontFamily: FONTS.medium, fontSize: 16, color: COLORS.textMuted },
  totalValue: { fontFamily: FONTS.bold, fontSize: 22, color: COLORS.textPrimary },
  checkoutBtn: { backgroundColor: COLORS.primary, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  checkoutText: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.white },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyTitle: { fontFamily: FONTS.bold, fontSize: 20, color: COLORS.textPrimary, marginTop: 20 },
  emptySubtitle: { fontFamily: FONTS.regular, fontSize: 14, color: COLORS.textMuted, textAlign: 'center', marginTop: 10 },
  shopBtn: { marginTop: 30, backgroundColor: COLORS.accent, paddingHorizontal: 30, paddingVertical: 12, borderRadius: 12 },
  shopBtnText: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.white },
});

export default CartScreen;
