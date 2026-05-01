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
  IceCream 
} from 'lucide-react-native';

const HomeScreen = () => {
  const { user }         = useAuth();
  const navigation       = useNavigation<any>();
  const { totalItems }   = useCart();
  const featured         = mockProducts.filter((p) => p.isBestSeller).slice(0, 3);

  return (
    <SafeAreaView style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          style={s.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={s.headerRow}>
            <View>
              <Text style={s.greeting}>Xin chào, {user?.fullName || user?.username || 'Barista'} ☕</Text>
              <Text style={s.subtitle}>Hôm nay bạn muốn uống gì?</Text>
            </View>
            <TouchableOpacity style={s.searchCircle}>
              <Search size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          
          {totalItems > 0 && (
            <View style={s.cartPill}>
              <ShoppingBag size={14} color={COLORS.white} />
              <Text style={s.cartPillText}>{totalItems} món trong giỏ</Text>
            </View>
          )}
        </LinearGradient>

        {/* Promo Banner */}
        <LinearGradient
          colors={[COLORS.accent, '#A0522D']}
          style={s.banner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={s.bannerContent}>
            <Text style={s.bannerTitle}>Khuyến mãi hôm nay</Text>
            <Text style={s.bannerDesc}>Giảm 20% cho tất cả Cà phê</Text>
            <TouchableOpacity style={s.bannerBtn}>
              <Text style={s.bannerBtnText}>Xem ngay</Text>
              <ArrowRight size={14} color={COLORS.accent} style={s.bannerBtnIcon} />
            </TouchableOpacity>
          </View>
          <CoffeeIcon size={60} color="rgba(255,255,255,0.2)" style={s.bannerIcon} />
        </LinearGradient>

        {/* Best Sellers */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>⭐ Bán chạy nhất</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {featured.map((p) => (
              <TouchableOpacity 
                key={p.id} 
                style={s.featCard}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('ProductDetail', { product: p })}
              >
                <Image source={{ uri: p.image }} style={s.featImg} resizeMode="cover" />
                <View style={s.featDetails}>
                  <Text style={s.featName} numberOfLines={1}>{p.name}</Text>
                  <Text style={s.featPrice}>{formatCurrency(p.price)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Category Grid */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Danh mục</Text>
          <View style={s.catGrid}>
            {[
              { icon: <CoffeeIcon size={28} color={COLORS.primary} />, name: 'Cà phê',  count: 12 },
              { icon: <Leaf size={28} color={COLORS.primary} />,      name: 'Trà trái cây', count: 8  },
              { icon: <IceCream size={28} color={COLORS.primary} />,  name: 'Đá xay',  count: 6  },
              { icon: <Zap size={28} color={COLORS.primary} />,       name: 'Năng lượng', count: 5  },
            ].map((c) => (
              <TouchableOpacity key={c.name} style={s.catCard}>
                <View style={s.catIconBg}>{c.icon}</View>
                <Text style={s.catName}>{c.name}</Text>
                <Text style={s.catCount}>{c.count} món</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={s.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container:   { flex: 1, backgroundColor: COLORS.background },
  hero:        { paddingHorizontal: SPACING.lg, paddingTop: 60, paddingBottom: 60, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  headerRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  searchCircle:{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  greeting:    { fontFamily: FONTS.bold, fontSize: 24, color: COLORS.white },
  subtitle:    { fontFamily: FONTS.regular, fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  cartPill:    { backgroundColor: COLORS.accent, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start', marginTop: 20, flexDirection: 'row', alignItems: 'center', gap: 6 },
  cartPillText:{ fontFamily: FONTS.semiBold, fontSize: 12, color: COLORS.white },
  banner:      { marginHorizontal: 20, marginTop: -30, borderRadius: 24, padding: 20, flexDirection: 'row', alignItems: 'center', overflow: 'hidden', elevation: 8, shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  bannerTitle: { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.white },
  bannerDesc:  { fontFamily: FONTS.regular, fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  bannerBtn:   { backgroundColor: COLORS.white, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8, alignSelf: 'flex-start', marginTop: 15, flexDirection: 'row', alignItems: 'center' },
  bannerBtnText: { fontFamily: FONTS.bold, fontSize: 12, color: COLORS.accent },
  bannerContent: { flex: 1 },
  bannerBtnIcon: { marginLeft: 4 },
  bannerIcon:  { position: 'absolute', right: -10, bottom: -10 },
  section:     { paddingHorizontal: SPACING.lg, marginTop: 30 },
  sectionTitle:{ fontFamily: FONTS.bold, fontSize: 18, color: COLORS.primary, marginBottom: SPACING.md },
  featCard:    { width: 180, backgroundColor: COLORS.white, borderRadius: 20, marginRight: 16, overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  featImg:     { width: '100%', height: 140 },
  featDetails: { padding: 8 },
  featName:    { fontFamily: FONTS.semiBold, fontSize: 14, color: COLORS.textPrimary },
  featPrice:   { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.accent, marginTop: 4 },
  catGrid:     { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  catCard:     { width: '47%', backgroundColor: COLORS.white, borderRadius: 20, padding: 20, alignItems: 'center', marginBottom: 15, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  catIconBg:   { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  catName:     { fontFamily: FONTS.semiBold, fontSize: 14, color: COLORS.textPrimary },
  catCount:    { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  bottomSpacer:{ height: 40 },
});

export default HomeScreen;
