/**
 * @file HomeScreen.tsx
 * @desc Màn hình chính (Dashboard) — hiển thị banner khuyến mãi,
 *       sản phẩm nổi bật và danh mục sản phẩm nhanh.
 * @layer pages/home
 */

import React from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Image, SafeAreaView,
  StatusBar,
} from 'react-native';
import { useAuth }        from '@/context/AuthContext';
import { useNavigation }  from '@react-navigation/native';
import { useCart }        from '@/context/CartContext';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '@/styles/theme';
import { formatCurrency } from '@/utils';
import { mockProducts }   from '@/data/mockData';
import LinearGradient     from 'react-native-linear-gradient';
import { 
  ShoppingBag, 
  Search, 
  ArrowRight, 
  Coffee as CoffeeIcon, 
  Zap, 
  Leaf, 
  IceCream,
  MapPin,
  ChevronDown,
  Bell,
  Plus
} from 'lucide-react-native';

const HomeScreen = () => {
  const { user }         = useAuth();
  const navigation       = useNavigation<any>();
  const { totalItems }   = useCart();
  const featured         = mockProducts.filter((p) => p.isBestSeller).slice(0, 4);

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Grab-style Header */}
      <View style={s.topBar}>
        <View style={s.locationContainer}>
          <MapPin size={16} color={COLORS.accent} />
          <View style={s.locationTextContainer}>
            <Text style={s.deliveryLabel}>Giao đến • Bây giờ</Text>
            <Text style={s.locationText} numberOfLines={1}>123 Đường Cà Phê, Quận 1, TP.HCM</Text>
          </View>
          <ChevronDown size={16} color={COLORS.textPrimary} />
        </View>
        <View style={s.headerActions}>
          <TouchableOpacity style={s.iconBtn}>
            <Bell size={22} color={COLORS.textPrimary} />
            <View style={s.dot} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[1]}>
        {/* Search Bar (Static) */}
        <View style={s.searchContainer}>
          <View style={s.searchBar}>
            <Search size={20} color={COLORS.textMuted} />
            <Text style={s.placeholderText}>Bạn muốn uống gì hôm nay?</Text>
          </View>
        </View>


        {/* Sticky Categories Bar */}
        <View style={s.stickyCatContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.catList}>
            {[
              { icon: <CoffeeIcon size={24} color={COLORS.white} />, name: 'Cà phê', color: '#6F4E37' },
              { icon: <Leaf size={24} color={COLORS.white} />,      name: 'Trà trái cây', color: '#4CAF50' },
              { icon: <IceCream size={24} color={COLORS.white} />,  name: 'Đá xay', color: '#2196F3' },
              { icon: <Zap size={24} color={COLORS.white} />,       name: 'Năng lượng', color: '#FF9800' },
              { icon: <ShoppingBag size={24} color={COLORS.white} />, name: 'Đồ ăn', color: '#E91E63' },
            ].map((c, i) => (
              <TouchableOpacity key={i} style={s.catItem}>
                <View style={[s.catIcon, { backgroundColor: c.color }]}>{c.icon}</View>
                <Text style={s.catLabel}>{c.name}</Text>

              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Promotions Carousel Placeholder */}
        <View style={s.promoSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} pagingEnabled snapToInterval={340} decelerationRate="fast">
            <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={s.promoCard}>
              <View style={s.promoInfo}>
                <Text style={s.promoTag}>ƯU ĐÃI KHỦNG</Text>
                <Text style={s.promoTitle}>Giảm 50% cho{'\n'}đơn đầu tiên</Text>
                <TouchableOpacity style={s.promoBtn}>
                  <Text style={s.promoBtnText}>Lấy mã ngay</Text>
                </TouchableOpacity>
              </View>
              <Image source={{ uri: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=300' }} style={s.promoImg} />
            </LinearGradient>
            
            <LinearGradient colors={['#AF693E', '#8D6E63']} style={s.promoCard}>
              <View style={s.promoInfo}>
                <Text style={s.promoTag}>MỚI RA MẮT</Text>
                <Text style={s.promoTitle}>Espresso Muối{'\n'}Đậm đà lôi cuốn</Text>
                <TouchableOpacity style={s.promoBtn}>
                  <Text style={s.promoBtnText}>Thử ngay</Text>
                </TouchableOpacity>
              </View>
              <Image source={{ uri: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=300' }} style={s.promoImg} />
            </LinearGradient>
          </ScrollView>
        </View>


        {/* Best Sellers */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Sản phẩm nổi bật ⚡</Text>
            <TouchableOpacity><Text style={s.seeAll}>Xem tất cả</Text></TouchableOpacity>
          </View>
          <View style={s.productGrid}>
            {featured.map((p) => (
              <TouchableOpacity 
                key={p.id} 
                style={s.productCard}
                onPress={() => navigation.navigate('ProductDetail', { product: p })}
              >
                <View style={s.imgContainer}>
                  <Image source={{ uri: p.image }} style={s.productImg} />
                  {p.isBestSeller && (
                    <View style={s.bestSellerBadge}>
                      <Text style={s.bestSellerText}>Bán chạy</Text>
                    </View>
                  )}
                </View>
                <View style={s.productInfo}>
                  <Text style={s.productName} numberOfLines={2}>{p.name}</Text>
                  <View style={s.priceRow}>
                    <Text style={s.productPrice}>{formatCurrency(p.price)}</Text>
                    <TouchableOpacity style={s.addBtn}>
                      <Plus size={20} color={COLORS.white} />
                    </TouchableOpacity>
                  </View>
                </View>

              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Promotions Carousel Placeholder */}
        <View style={s.promoSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} pagingEnabled snapToInterval={340} decelerationRate="fast">
            <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={s.promoCard}>
              <View style={s.promoInfo}>
                <Text style={s.promoTag}>ƯU ĐÃI KHỦNG</Text>
                <Text style={s.promoTitle}>Giảm 50% cho{'\n'}đơn đầu tiên</Text>
                <TouchableOpacity style={s.promoBtn}>
                  <Text style={s.promoBtnText}>Lấy mã ngay</Text>
                </TouchableOpacity>
              </View>
              <Image source={{ uri: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=300' }} style={s.promoImg} />
            </LinearGradient>
            
            <LinearGradient colors={['#AF693E', '#8D6E63']} style={s.promoCard}>
              <View style={s.promoInfo}>
                <Text style={s.promoTag}>MỚI RA MẮT</Text>
                <Text style={s.promoTitle}>Espresso Muối{'\n'}Đậm đà lôi cuốn</Text>
                <TouchableOpacity style={s.promoBtn}>
                  <Text style={s.promoBtnText}>Thử ngay</Text>
                </TouchableOpacity>
              </View>
              <Image source={{ uri: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=300' }} style={s.promoImg} />
            </LinearGradient>
          </ScrollView>
        </View>

        {/* Best Sellers */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Sản phẩm nổi bật ⚡</Text>
            <TouchableOpacity><Text style={s.seeAll}>Xem tất cả</Text></TouchableOpacity>
          </View>
          <View style={s.productGrid}>
            {featured.map((p) => (
              <TouchableOpacity 
                key={p.id} 
                style={s.productCard}
                onPress={() => navigation.navigate('ProductDetail', { product: p })}
              >
                <View style={s.imgContainer}>
                  <Image source={{ uri: p.image }} style={s.productImg} />
                  {p.isBestSeller && (
                    <View style={s.bestSellerBadge}>
                      <Text style={s.bestSellerText}>Bán chạy</Text>
                    </View>
                  )}
                </View>
                <View style={s.productInfo}>
                  <Text style={s.productName} numberOfLines={2}>{p.name}</Text>
                  <View style={s.priceRow}>
                    <Text style={s.productPrice}>{formatCurrency(p.price)}</Text>
                    <TouchableOpacity style={s.addBtn}>
                      <Plus size={20} color={COLORS.white} />
                    </TouchableOpacity>
                  </View>
                </View>

              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={s.bottomSpacer} />
      </ScrollView>

      {/* Floating Cart Pill */}
      {totalItems > 0 && (
        <TouchableOpacity style={s.floatingCart} onPress={() => navigation.navigate('Cart')}>
          <View style={s.cartInfo}>
            <View style={s.cartCount}>
              <Text style={s.cartCountText}>{totalItems}</Text>
            </View>
            <Text style={s.cartTotalText}>Xem giỏ hàng</Text>
          </View>
          <ArrowRight size={20} color={COLORS.white} />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container:   { flex: 1, backgroundColor: COLORS.white },
  topBar:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15, backgroundColor: COLORS.white },
  locationContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  locationTextContainer: { flex: 1 },
  deliveryLabel: { fontFamily: FONTS.medium, fontSize: 12, color: COLORS.textMuted },
  locationText: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.textPrimary },
  headerActions: { flexDirection: 'row', gap: 15 },
  iconBtn:     { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.backgroundSecondary, borderRadius: 12 },
  dot:         { position: 'absolute', top: 10, right: 10, width: 8, height: 8, backgroundColor: COLORS.error, borderRadius: 4, borderWidth: 2, borderColor: COLORS.white },
  
  searchContainer: { paddingHorizontal: 20, paddingBottom: 15, backgroundColor: COLORS.white },
  searchBar:   { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.backgroundSecondary, borderRadius: 12, paddingHorizontal: 15, height: 50, gap: 10 },
  placeholderText: { fontFamily: FONTS.regular, fontSize: 15, color: COLORS.textMuted },

  stickyCatContainer: { backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  catList:     { paddingHorizontal: 15, paddingVertical: 15, gap: 20 },
  catItem:     { alignItems: 'center', width: 75 },
  catIcon:     { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 8, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3 },
  catLabel:    { fontFamily: FONTS.medium, fontSize: 12, color: COLORS.textPrimary, textAlign: 'center' },

  promoSection: { paddingVertical: 20 },
  promoCard:   { width: 320, height: 160, marginLeft: 20, borderRadius: 24, padding: 20, flexDirection: 'row', overflow: 'hidden' },
  promoInfo:   { flex: 1.5, justifyContent: 'center' },
  promoTag:    { fontFamily: FONTS.bold, fontSize: 10, color: 'rgba(255,255,255,0.7)', letterSpacing: 1 },
  promoTitle:  { fontFamily: FONTS.bold, fontSize: 20, color: COLORS.white, marginTop: 5 },
  promoBtn:    { backgroundColor: COLORS.white, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10, alignSelf: 'flex-start', marginTop: 15 },
  promoBtnText:{ fontFamily: FONTS.bold, fontSize: 12, color: COLORS.primary },
  promoImg:    { flex: 1, width: 120, height: 120, borderRadius: 60, position: 'absolute', right: -20, bottom: -20, transform: [{ rotate: '-15deg' }] },

  section:     { paddingHorizontal: 20, marginTop: 10 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle:{ fontFamily: FONTS.bold, fontSize: 18, color: COLORS.textPrimary },
  seeAll:      { fontFamily: FONTS.medium, fontSize: 14, color: COLORS.accent },

  productGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  productCard: { width: '47%', backgroundColor: COLORS.white, borderRadius: 20, marginBottom: 20, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6 },
  imgContainer:{ width: '100%', height: 160, borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden' },
  productImg:  { width: '100%', height: '100%' },
  bestSellerBadge: { position: 'absolute', top: 10, left: 10, backgroundColor: COLORS.gold, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  bestSellerText: { fontFamily: FONTS.bold, fontSize: 10, color: COLORS.white },
  productInfo: { padding: 12 },
  productName: { fontFamily: FONTS.semiBold, fontSize: 15, color: COLORS.textPrimary, height: 40 },
  priceRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  productPrice:{ fontFamily: FONTS.bold, fontSize: 16, color: COLORS.accent },
  addBtn:      { width: 32, height: 32, borderRadius: 10, backgroundColor: COLORS.accent, justifyContent: 'center', alignItems: 'center' },

  floatingCart:{ position: 'absolute', bottom: 30, left: 20, right: 20, height: 60, backgroundColor: COLORS.primary, borderRadius: 20, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, elevation: 10, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.5, shadowRadius: 10 },
  cartInfo:    { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  cartCount:   { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center' },
  cartCountText:{ fontFamily: FONTS.bold, fontSize: 14, color: COLORS.primary },
  cartTotalText:{ fontFamily: FONTS.bold, fontSize: 16, color: COLORS.white },
  
  bottomSpacer:{ height: 100 },
});

export default HomeScreen;
