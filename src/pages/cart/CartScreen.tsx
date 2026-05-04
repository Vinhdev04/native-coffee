import React from 'react';
import {
  View, Text, StyleSheet, FlatList, 
  TouchableOpacity, Image, SafeAreaView
} from 'react-native';
import { useCart } from '@/context/CartContext';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, BORDER_RADIUS } from '@/styles/theme';
import { formatCurrency } from '@/utils';
import { ChevronLeft, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react-native';

const CartScreen = () => {
  const navigation = useNavigation();
  const { items, totalPrice, updateQuantity, removeItem, clearCart } = useCart();

  const renderItem = ({ item }: { item: any }) => (
    <View style={s.cartItem}>
      <Image source={{ uri: item.image }} style={s.itemImage} />
      <View style={s.itemInfo}>
        <Text style={s.itemName} numberOfLines={1}>{item.name}</Text>
        <Text style={s.itemOptions}>{item.size} | {item.sweetness} đường</Text>
        <Text style={s.itemPrice}>{formatCurrency(item.price)}</Text>
      </View>
      <View style={s.quantityControl}>
        <TouchableOpacity 
          style={s.qtyBtn} 
          onPress={() => updateQuantity(item.cartId, item.quantity - 1)}
        >
          <Minus size={16} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={s.qtyText}>{item.quantity}</Text>
        <TouchableOpacity 
          style={s.qtyBtn} 
          onPress={() => updateQuantity(item.cartId, item.quantity + 1)}
        >
          <Plus size={16} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={s.deleteBtn} onPress={() => removeItem(item.cartId)}>
        <Trash2 size={18} color={COLORS.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Giỏ hàng của bạn</Text>
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
            <TouchableOpacity style={s.checkoutBtn}>
              <Text style={s.checkoutText}>Thanh toán ngay</Text>
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.backgroundSecondary, borderRadius: 12 },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.textPrimary },
  clearText: { fontFamily: FONTS.medium, fontSize: 14, color: COLORS.error },

  listContent: { padding: 20 },
  cartItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, backgroundColor: COLORS.white, borderRadius: 16 },
  itemImage: { width: 70, height: 70, borderRadius: 12, backgroundColor: COLORS.backgroundSecondary },
  itemInfo: { flex: 1, marginLeft: 12 },
  itemName: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.textPrimary },
  itemOptions: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  itemPrice: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.accent, marginTop: 4 },
  
  quantityControl: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.backgroundSecondary, borderRadius: 10, padding: 4, marginRight: 10 },
  qtyBtn: { width: 28, height: 28, justifyContent: 'center', alignItems: 'center' },
  qtyText: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.textPrimary, paddingHorizontal: 8 },
  deleteBtn: { padding: 8 },

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
