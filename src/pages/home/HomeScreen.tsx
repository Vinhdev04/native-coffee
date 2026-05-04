import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar, ScrollView, Image, FlatList,
  Dimensions, Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS } from '@/styles/theme';
import { MapPin, ChevronDown, Bell, Heart, Search, Plus, ShoppingBag } from 'lucide-react-native';
import { fetchCategories, fetchProducts } from '@/services/productService';
import { formatCurrency } from '@/utils';
import { useCart } from '@/context/CartContext';
import Toast from '@/components/common/Toast';

const { width: SW } = Dimensions.get('window');

/* ─── Auto-rotating promo banners ─── */
const BANNERS = [
  {
    id: '1',
    title: 'Trà Sữa Hảo Hạng',
    subtitle: 'Giảm 30% lần đầu đặt hàng',
    bg: '#FF7A00',
    image: 'https://images.unsplash.com/photo-1558857563-b37102e99e00?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: '2',
    title: 'Cà Phê Đặc Biệt',
    subtitle: 'Mua 2 tặng 1 mỗi ngày',
    bg: '#1E3A5F',
    image: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a4?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: '3',
    title: 'Matcha Tươi Mát',
    subtitle: 'Thức uống giải nhiệt mùa hè',
    bg: '#134E4A',
    image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=400&q=80',
  },
];

/* ─── Drink fallback images ─── */
const FALLBACKS = [
  'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1515823064-d6e0c04616a4?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1558857563-b37102e99e00?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=200&q=80',
];
const fallback = (id: number) => FALLBACKS[id % FALLBACKS.length];

/* ─── Mini product card for quick order (horizontal) ─── */
const MiniProductCard = ({
  item,
  onPress,
  onAdd,
}: {
  item: any;
  onPress: () => void;
  onAdd: () => void;
}) => (
  <TouchableOpacity style={mp.card} onPress={onPress} activeOpacity={0.88}>
    <Image
      source={{ uri: item.imageUrl || item.image || fallback(item.id) }}
      style={mp.image}
      resizeMode="cover"
    />
    <View style={mp.info}>
      <Text style={mp.name} numberOfLines={1}>{item.name}</Text>
      <Text style={mp.price}>{formatCurrency(item.basePrice || item.price || 0)}</Text>
    </View>
    <TouchableOpacity style={mp.addBtn} onPress={onAdd}>
      <Plus size={14} color={COLORS.white} />
    </TouchableOpacity>
  </TouchableOpacity>
);

const mp = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  image: {
    width: 54,
    height: 54,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    flexShrink: 0,
  },
  info: { flex: 1, marginLeft: 10 },
  name: { fontFamily: FONTS.semiBold, fontSize: 13, color: COLORS.textPrimary, marginBottom: 3 },
  price: { fontFamily: FONTS.bold, fontSize: 13, color: COLORS.primary },
  addBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
    marginLeft: 8,
  },
});

/* ══════════════════════════════════════════════════════════ */

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const { totalItems, addToCart } = useCart();

  const [categories, setCategories] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [activeCat, setActiveCat] = useState<number | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState(0);
  const [toast, setToast] = useState({ visible: false, title: '', msg: '' });

  const bannerRef = useRef<ScrollView>(null);

  useEffect(() => { loadData(); }, []);

  /* Auto-rotate banner */
  useEffect(() => {
    const t = setInterval(() => {
      setBanner((prev) => {
        const next = (prev + 1) % BANNERS.length;
        bannerRef.current?.scrollTo({ x: next * (SW - 32), animated: true });
        return next;
      });
    }, 3500);
    return () => clearInterval(t);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [catRes, prodRes] = await Promise.all([
        fetchCategories({ branchId: 1 }),
        fetchProducts({ branchId: 1, limit: 50 }),
      ]);
      setCategories(catRes.data?.rows || catRes.data || []);
      setAllProducts(prodRes.data?.rows || prodRes.data || []);
    } catch (err) {
      console.error('[HomeScreen] load error:', err);
    } finally {
      setLoading(false);
    }
  };

  /* Filter products by active category */
  const displayProducts = activeCat === 'all'
    ? allProducts
    : allProducts.filter((p) => p.categoryId === activeCat);

  const handleAdd = (item: any) => {
    addToCart(item);
    setToast({ visible: true, title: 'Đã thêm vào giỏ! 🎉', msg: item.name });
  };

  /* Category chips */
  const allCats = [{ id: 'all', name: 'Tất cả', imageUrl: null }, ...categories];

  return (
    <SafeAreaView style={s.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#D8F1F3" />

      <Toast
        visible={toast.visible}
        type="success"
        title={toast.title}
        message={toast.msg}
        onHide={() => setToast(t => ({ ...t, visible: false }))}
      />

      <ScrollView style={s.container} showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]}>

        {/* ── Sticky Header ── */}
        <View style={s.stickyHeader}>
          <View style={s.headerRow}>
            <View style={s.locationBox}>
              <View style={s.locationDot}><MapPin size={12} color={COLORS.primary} /></View>
              <View>
                <Text style={s.locationLabel}>Bán tại quán</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                  <Text style={s.locationName}>Native Coffee</Text>
                  <ChevronDown size={13} color={COLORS.textPrimary} />
                </View>
              </View>
            </View>
            <View style={s.headerRight}>
              <TouchableOpacity style={s.iconBtn}>
                <Bell size={17} color={COLORS.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity style={s.cartIconBtn} onPress={() => navigation.navigate('Cart')}>
                <ShoppingBag size={17} color={COLORS.textPrimary} />
                {totalItems > 0 && (
                  <View style={s.cartBadge}>
                    <Text style={s.cartBadgeText}>{totalItems}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
          {/* Search bar */}
          <TouchableOpacity style={s.search} onPress={() => navigation.navigate('Menu')}>
            <Search size={16} color={COLORS.textMuted} />
            <Text style={s.searchText}>Tìm kiếm thức uống...</Text>
          </TouchableOpacity>
        </View>

        {/* ── Banner Slider ── */}
        <View style={s.bannerSection}>
          <ScrollView
            ref={bannerRef}
            horizontal pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={s.bannerScroll}
            onMomentumScrollEnd={(e) => {
              setBanner(Math.round(e.nativeEvent.contentOffset.x / (SW - 32)));
            }}
          >
            {BANNERS.map((b) => (
              <View key={b.id} style={[s.bannerCard, { backgroundColor: b.bg }]}>
                <View style={s.bannerText}>
                  <Text style={s.bannerTitle}>{b.title}</Text>
                  <Text style={s.bannerSub}>{b.subtitle}</Text>
                  <TouchableOpacity style={s.bannerBtn} onPress={() => navigation.navigate('Menu')}>
                    <Text style={s.bannerBtnTxt}>Đặt ngay →</Text>
                  </TouchableOpacity>
                </View>
                <Image source={{ uri: b.image }} style={s.bannerImg} />
              </View>
            ))}
          </ScrollView>
          {/* Dots */}
          <View style={s.dots}>
            {BANNERS.map((_, i) => (
              <View key={i} style={[s.dot, i === banner && s.dotActive]} />
            ))}
          </View>
        </View>

        {/* ── Category chips ── */}
        {categories.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionHead}>
              <Text style={s.sectionTitle}>Danh mục</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Menu')}>
                <Text style={s.sectionMore}>Xem thực đơn →</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.catScroll}>
              {allCats.map((cat) => {
                const isActive = cat.id === activeCat || (cat.id === 'all' && activeCat === 'all');
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[s.catChip, isActive && s.catChipActive]}
                    onPress={() => setActiveCat(cat.id as any)}
                  >
                    {cat.imageUrl ? (
                      <Image source={{ uri: cat.imageUrl }} style={s.catIcon} />
                    ) : null}
                    <Text style={[s.catText, isActive && s.catTextActive]}>{cat.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* ── Quick Order: Product rows ── */}
        <View style={s.section}>
          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>Đặt ngay tại quán</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Menu')}>
              <Text style={s.sectionMore}>Xem thêm →</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={s.loadingBox}>
              <View style={s.skeleton} />
              <View style={s.skeleton} />
              <View style={s.skeleton} />
            </View>
          ) : displayProducts.length === 0 ? (
            <View style={s.emptyBox}>
              <Text style={s.emptyText}>Không có sản phẩm</Text>
            </View>
          ) : (
            <View>
              {displayProducts.slice(0, 8).map((item) => (
                <MiniProductCard
                  key={item.id}
                  item={item}
                  onPress={() => navigation.navigate('ProductDetail', { product: item })}
                  onAdd={() => handleAdd(item)}
                />
              ))}
              {displayProducts.length > 8 && (
                <TouchableOpacity style={s.viewAllBtn} onPress={() => navigation.navigate('Menu')}>
                  <Text style={s.viewAllText}>Xem tất cả {displayProducts.length} sản phẩm →</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* ── Big promo footer banner ── */}
        <View style={s.bigBanner}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=800&q=80' }}
            style={s.bigBannerImg}
          />
          <View style={s.bigBannerOverlay}>
            <Text style={s.bigBannerTitle}>Native Coffee</Text>
            <Text style={s.bigBannerSub}>Thức uống ngon, phục vụ tận tâm</Text>
            <TouchableOpacity style={s.bigBannerCta} onPress={() => navigation.navigate('Menu')}>
              <Text style={s.bigBannerCtaTxt}>Xem thực đơn</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safeArea:  { flex: 1, backgroundColor: '#D8F1F3' },
  container: { flex: 1, backgroundColor: '#F2F3F5' },

  /* Sticky header */
  stickyHeader: {
    backgroundColor: '#D8F1F3',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
    borderBottomWidth: 0,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  locationBox: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  locationDot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.5)', justifyContent: 'center', alignItems: 'center',
  },
  locationLabel: { fontFamily: FONTS.regular, fontSize: 10, color: COLORS.primary, textTransform: 'uppercase', letterSpacing: 0.4 },
  locationName: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.textPrimary },
  headerRight: { flexDirection: 'row', gap: 6 },
  iconBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.65)', justifyContent: 'center', alignItems: 'center',
    borderWidth: 0,
  },
  cartIconBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.65)', justifyContent: 'center', alignItems: 'center',
    borderWidth: 0,
  },
  cartBadge: {
    position: 'absolute', top: -2, right: -2,
    backgroundColor: COLORS.primary, borderRadius: 8,
    minWidth: 15, height: 15,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.white,
  },
  cartBadgeText: { fontFamily: FONTS.bold, fontSize: 8, color: COLORS.white },
  search: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.white,
    borderRadius: 24, paddingHorizontal: 14, height: 44,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  searchText: { fontFamily: FONTS.regular, fontSize: 14, color: COLORS.textMuted, flex: 1 },

  /* Banner */
  bannerSection: { paddingHorizontal: 16, paddingTop: 16 },
  bannerScroll:  { borderRadius: 16 },
  bannerCard: {
    width: SW - 32, height: 148,
    borderRadius: 16, flexDirection: 'row',
    alignItems: 'center', paddingLeft: 18, overflow: 'hidden',
  },
  bannerText: { flex: 1 },
  bannerTitle:  { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.white, marginBottom: 4 },
  bannerSub:    { fontFamily: FONTS.regular, fontSize: 11, color: 'rgba(255,255,255,0.85)', marginBottom: 12 },
  bannerBtn:    { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  bannerBtnTxt: { fontFamily: FONTS.semiBold, fontSize: 11, color: COLORS.white },
  bannerImg:    { width: 120, height: 148, resizeMode: 'cover' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 5, marginTop: 10 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: 'rgba(0,0,0,0.18)' },
  dotActive: { width: 16, backgroundColor: COLORS.primary, borderRadius: 3 },

  /* Sections */
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.textPrimary },
  sectionMore:  { fontFamily: FONTS.medium, fontSize: 12, color: COLORS.primary },

  /* Category chips */
  catScroll: { gap: 8, paddingRight: 4 },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 18, backgroundColor: '#F0F0F0',
    borderWidth: 1.5, borderColor: 'transparent',
  },
  catChipActive: { backgroundColor: '#FFF3E8', borderColor: COLORS.primary },
  catIcon: { width: 16, height: 16, borderRadius: 8 },
  catText: { fontFamily: FONTS.medium, fontSize: 12, color: COLORS.textSecondary },
  catTextActive: { fontFamily: FONTS.semiBold, color: COLORS.primary },

  /* Loading skeletons */
  loadingBox: { gap: 8 },
  skeleton: { height: 72, borderRadius: 12, backgroundColor: '#F0F0F0' },

  /* Empty */
  emptyBox:  { alignItems: 'center', paddingVertical: 24 },
  emptyText: { fontFamily: FONTS.medium, fontSize: 14, color: COLORS.textMuted },

  /* View all */
  viewAllBtn: {
    marginTop: 4, paddingVertical: 12,
    backgroundColor: '#FFF3E8',
    borderRadius: 12, alignItems: 'center',
    borderWidth: 1, borderColor: '#FFE0C2',
  },
  viewAllText: { fontFamily: FONTS.semiBold, fontSize: 13, color: COLORS.primary },

  /* Big banner */
  bigBanner: { marginHorizontal: 16, marginTop: 24, borderRadius: 18, overflow: 'hidden', height: 160 },
  bigBannerImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  bigBannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.42)',
    padding: 18, justifyContent: 'flex-end',
  },
  bigBannerTitle: { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.white, marginBottom: 2 },
  bigBannerSub:   { fontFamily: FONTS.regular, fontSize: 11, color: 'rgba(255,255,255,0.85)', marginBottom: 10 },
  bigBannerCta:   { alignSelf: 'flex-start', backgroundColor: COLORS.primary, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16 },
  bigBannerCtaTxt:{ fontFamily: FONTS.bold, fontSize: 12, color: COLORS.white },
});

export default HomeScreen;
