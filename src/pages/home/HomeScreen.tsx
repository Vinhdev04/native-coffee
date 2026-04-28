import React from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Image, SafeAreaView,
} from 'react-native';
import { useAuth }        from '~/context/AuthContext';
import { useCart }        from '~/context/CartContext';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '~/styles/theme';
import { formatCurrency } from '~/utils';
import { mockProducts }   from '~/data/mockData';

const HomeScreen = () => {
  const { user }         = useAuth();
  const { totalItems }   = useCart();
  const featured         = mockProducts.filter((p) => p.isBestSeller).slice(0, 3);

  return (
    <SafeAreaView style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={s.hero}>
          <Text style={s.greeting}>Xin chào, {user?.fullName || user?.username || 'Barista'} ☕</Text>
          <Text style={s.subtitle}>Hôm nay bạn muốn uống gì?</Text>
          {totalItems > 0 && (
            <View style={s.cartPill}>
              <Text style={s.cartPillText}>🛒 {totalItems} sản phẩm trong giỏ</Text>
            </View>
          )}
        </View>

        {/* Promo Banner */}
        <View style={s.banner}>
          <View style={{ flex: 1 }}>
            <Text style={s.bannerTitle}>Khuyến mãi hôm nay</Text>
            <Text style={s.bannerDesc}>Giảm 20% cho tất cả Cà phê</Text>
            <TouchableOpacity style={s.bannerBtn}>
              <Text style={s.bannerBtnText}>Xem ngay →</Text>
            </TouchableOpacity>
          </View>
          <Text style={{ fontSize: 52 }}>☕</Text>
        </View>

        {/* Best Sellers */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>⭐ Bán chạy nhất</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {featured.map((p) => (
              <View key={p.id} style={s.featCard}>
                <Image source={{ uri: p.image }} style={s.featImg} resizeMode="cover" />
                <View style={{ padding: 8 }}>
                  <Text style={s.featName} numberOfLines={1}>{p.name}</Text>
                  <Text style={s.featPrice}>{formatCurrency(p.price)}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Category Grid */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Danh mục</Text>
          <View style={s.catGrid}>
            {[
              { icon: '☕', name: 'Cà phê',  count: 12 },
              { icon: '🧋', name: 'Trà sữa', count: 8  },
              { icon: '🍵', name: 'Trà cây', count: 6  },
              { icon: '🥤', name: 'Đá xay',  count: 5  },
            ].map((c) => (
              <TouchableOpacity key={c.name} style={s.catCard}>
                <Text style={{ fontSize: 30 }}>{c.icon}</Text>
                <Text style={s.catName}>{c.name}</Text>
                <Text style={s.catCount}>{c.count} món</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container:   { flex: 1, backgroundColor: COLORS.background },
  hero:        { backgroundColor: COLORS.primary, paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, paddingBottom: 40 },
  greeting:    { fontFamily: FONTS.bold, fontSize: 22, color: COLORS.white },
  subtitle:    { fontFamily: FONTS.regular, fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  cartPill:    { backgroundColor: COLORS.accent, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start', marginTop: 10 },
  cartPillText:{ fontFamily: FONTS.semiBold, fontSize: 12, color: COLORS.white },
  banner:      { marginHorizontal: 16, marginTop: -24, backgroundColor: COLORS.accent, borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bannerTitle: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.white },
  bannerDesc:  { fontFamily: FONTS.regular, fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  bannerBtn:   { backgroundColor: COLORS.white, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start', marginTop: 10 },
  bannerBtnText: { fontFamily: FONTS.bold, fontSize: 12, color: COLORS.accent },
  section:     { paddingHorizontal: SPACING.md, marginTop: SPACING.lg },
  sectionTitle:{ fontFamily: FONTS.bold, fontSize: 17, color: COLORS.primary, marginBottom: SPACING.sm },
  featCard:    { width: 160, backgroundColor: COLORS.white, borderRadius: 16, marginRight: 12, overflow: 'hidden', elevation: 3 },
  featImg:     { width: '100%', height: 120 },
  featName:    { fontFamily: FONTS.semiBold, fontSize: 12, color: COLORS.textPrimary },
  featPrice:   { fontFamily: FONTS.bold, fontSize: 13, color: COLORS.accent, marginTop: 2 },
  catGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  catCard:     { width: '47%', backgroundColor: COLORS.white, borderRadius: 16, padding: 16, alignItems: 'center', elevation: 2 },
  catName:     { fontFamily: FONTS.semiBold, fontSize: 13, color: COLORS.textPrimary, marginTop: 6 },
  catCount:    { fontFamily: FONTS.regular, fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
});

export default HomeScreen;
