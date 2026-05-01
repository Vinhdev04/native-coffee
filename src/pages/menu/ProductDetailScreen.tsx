/**
 * @file ProductDetailScreen.tsx
 * @desc Màn hình chi tiết sản phẩm — cho phép chọn size, mức đường/đá và topping.
 * @layer pages/menu
 */

import React, { useState } from 'react';
import {
  View, Text, Image, StyleSheet, 
  TouchableOpacity, ScrollView, SafeAreaView,
  Dimensions, Platform
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '@/styles/theme';
import { formatCurrency } from '@/utils';
import { useCart } from '@/context/CartContext';
import LinearGradient from 'react-native-linear-gradient';
import { 
  ChevronLeft, 
  Minus, 
  Plus, 
  Star, 
  Clock, 
  Info,
  ShoppingBag
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

const ProductDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { dispatch } = useCart();
  const { product } = route.params;

  const [quantity, setQuantity]   = useState(1);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedSugar, setSelectedSugar] = useState('100%');
  const [selectedIce, setSelectedIce] = useState('100%');

  const sizes = [
    { id: 'S', label: 'Small',  price: 0 },
    { id: 'M', label: 'Medium', price: 5000 },
    { id: 'L', label: 'Large',  price: 10000 },
  ];

  const totalProductPrice = (product.price + (sizes.find(s => s.id === selectedSize)?.price || 0)) * quantity;

  const handleAddToCart = () => {
    dispatch({
      type: 'ADD_ITEM',
      item: {
        cartId:    `${product.id}_${selectedSize}_${selectedSugar}_${selectedIce}`,
        id:        product.id,
        name:      product.name,
        price:     product.price + (sizes.find(s => s.id === selectedSize)?.price || 0),
        image:     product.image,
        quantity:  quantity,
        size:      selectedSize,
        sweetness: selectedSugar,
        ice:       selectedIce,
        toppings:  [],
      },
    });
    Toast.show({
      type: 'success',
      text1: 'Đã thêm vào giỏ hàng',
      text2: `${quantity} x ${product.name} (${selectedSize})`,
      position: 'bottom',
    });
    navigation.goBack();
  };

  return (
    <View style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
        {/* Image Header */}
        <View style={s.imageContainer}>
          <Image source={{ uri: product.image }} style={s.image} resizeMode="cover" />
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <ChevronLeft size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <View style={s.infoCard}>
          {/* Title & Price */}
          <View style={s.headerRow}>
            <View style={s.titleGroup}>
              <Text style={s.name}>{product.name}</Text>
              <View style={s.ratingRow}>
                <Star size={14} color={COLORS.gold} fill={COLORS.gold} />
                <Text style={s.ratingText}>4.8 (120+ đánh giá)</Text>
              </View>
            </View>
            <Text style={s.price}>{formatCurrency(product.price)}</Text>
          </View>

          <Text style={s.description}>{product.description || 'Hương vị cà phê nguyên bản được pha chế từ những hạt cà phê Arabica thượng hạng, mang đến trải nghiệm tỉnh táo và đầy sảng khoái.'}</Text>

          {/* Sizing */}
          <View style={s.optionSection}>
            <Text style={s.optionTitle}>Chọn kích cỡ</Text>
            <View style={s.sizeRow}>
              {sizes.map((size) => (
                <TouchableOpacity
                  key={size.id}
                  style={[s.sizeBtn, selectedSize === size.id && s.sizeBtnActive]}
                  onPress={() => setSelectedSize(size.id)}
                >
                  <Text style={[s.sizeLabel, selectedSize === size.id && s.sizeLabelActive]}>{size.id}</Text>
                  <Text style={[s.sizeSub, selectedSize === size.id && s.sizeSubActive]}>{size.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sugar/Ice Options */}
          <View style={s.optionSection}>
            <Text style={s.optionTitle}>Mức đường</Text>
            <View style={s.chipRow}>
              {['0%', '30%', '50%', '70%', '100%'].map((val) => (
                <TouchableOpacity
                  key={val}
                  style={[s.chip, selectedSugar === val && s.chipActive]}
                  onPress={() => setSelectedSugar(val)}
                >
                  <Text style={[s.chipText, selectedSugar === val && s.chipTextActive]}>{val}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={s.optionSection}>
            <Text style={s.optionTitle}>Mức đá</Text>
            <View style={s.chipRow}>
              {['Ít đá', 'Vừa', 'Nhiều đá', 'Không đá'].map((val) => (
                <TouchableOpacity
                  key={val}
                  style={[s.chip, selectedIce === val && s.chipActive]}
                  onPress={() => setSelectedIce(val)}
                >
                  <Text style={[s.chipText, selectedIce === val && s.chipTextActive]}>{val}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer Actions */}
      <SafeAreaView style={s.footer}>
        <View style={s.footerContent}>
          <View style={s.qtyControls}>
            <TouchableOpacity 
              style={s.qtyBtn} 
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Minus size={20} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={s.qtyText}>{quantity}</Text>
            <TouchableOpacity 
              style={s.qtyBtn} 
              onPress={() => setQuantity(quantity + 1)}
            >
              <Plus size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={s.addBtn} onPress={handleAddToCart}>
            <LinearGradient
              colors={[COLORS.accent, '#A0522D']}
              style={s.addBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <ShoppingBag size={20} color={COLORS.white} style={s.addIcon} />
              <Text style={s.addBtnText}>Thêm • {formatCurrency(totalProductPrice)}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.white },
  scrollContent:{ paddingBottom: 120 },
  imageContainer: { width: '100%', height: width * 0.9, backgroundColor: COLORS.surfaceWarm },
  image:        { width: '100%', height: '100%' },
  backBtn:      { position: 'absolute', top: 50, left: 20, width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  infoCard:     { padding: 24, marginTop: -30, backgroundColor: COLORS.white, borderTopLeftRadius: 32, borderTopRightRadius: 32 },
  headerRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  titleGroup:   { flex: 1 },
  name:         { fontFamily: FONTS.bold, fontSize: 26, color: COLORS.primary },
  ratingRow:    { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 4 },
  ratingText:   { fontFamily: FONTS.medium, fontSize: 13, color: COLORS.textMuted },
  price:        { fontFamily: FONTS.bold, fontSize: 22, color: COLORS.accent },
  description:  { fontFamily: FONTS.regular, fontSize: 15, color: COLORS.textSecondary, lineHeight: 22, marginBottom: 30 },
  optionSection:{ marginBottom: 24 },
  optionTitle:  { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.primary, marginBottom: 16 },
  sizeRow:      { flexDirection: 'row', gap: 12 },
  sizeBtn:      { flex: 1, height: 70, borderRadius: 16, borderWidth: 1.5, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white },
  sizeBtnActive:{ borderColor: COLORS.accent, backgroundColor: 'rgba(139, 69, 19, 0.05)' },
  sizeLabel:    { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.textPrimary },
  sizeLabelActive: { color: COLORS.accent },
  sizeSub:      { fontFamily: FONTS.regular, fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  sizeSubActive:{ color: COLORS.accent },
  chipRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip:         { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surfaceWarm },
  chipActive:   { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText:     { fontFamily: FONTS.medium, fontSize: 14, color: COLORS.textSecondary },
  chipTextActive: { color: COLORS.white },
  footer:       { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border },
  footerContent:{ padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16 },
  qtyControls:  { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, borderRadius: 16, padding: 4 },
  qtyBtn:       { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  qtyText:      { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.primary, paddingHorizontal: 12 },
  addBtn:       { flex: 1, height: 56, borderRadius: 18, overflow: 'hidden' },
  addBtnGradient: { width: '100%', height: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  addIcon:      { marginRight: 4 },
  addBtnText:   { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.white },
});

export default ProductDetailScreen;
