import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar, ScrollView, Image, FlatList,
  Dimensions, Animated, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS } from '@/styles/theme';
import { MapPin, ChevronDown, Bell, Heart, Search, Plus, ShoppingBag, Coffee as CoffeeIcon } from 'lucide-react-native';
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
      <Text style={mp.cat} numberOfLines={1}>{item.categoryName || 'Sản phẩm'}</Text>
      <Text style={mp.price}>{formatCurrency(item.basePrice || item.price || 0)}</Text>
    </View>
    <TouchableOpacity style={mp.addBtn} onPress={onAdd}>
      <Plus size={18} color={COLORS.white} />
    </TouchableOpacity>
  </TouchableOpacity>
);

const mp = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F8F8F8',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 14,
    backgroundColor: '#F9FAFB',
    flexShrink: 0,
  },
  info: { flex: 1, marginLeft: 16, justifyContent: 'center' },
  name: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.textPrimary, marginBottom: 2 },
  cat: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textMuted, marginBottom: 6 },
  price: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.primary },
  addBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
});

/* ══════════════════════════════════════════════════════════ */

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const { totalItems, addToCart } = useCart();

  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [activeCat, setActiveCat] = useState<number | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [banner, setBanner] = useState(0);
  const [toast, setToast] = useState({ visible: false, title: '', msg: '' });

  const bannerRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadCategories();
    loadProducts(1, true);
  }, []);

  /* Auto-rotate banner */
  useEffect(() => {
    const t = setInterval(() => {
      setBanner((prev) => {
        const next = (prev + 1) % BANNERS.length;
        bannerRef.current?.scrollTo({ x: next * (SW - 32), animated: true });
        return next;
      });
    }, 4500);
    return () => clearInterval(t);
  }, []);

  const loadCategories = async () => {
    try {
      const res = await fetchCategories({ branchId: 1 });
      setCategories(res.data?.rows || res.data || []);
    } catch (err) {
      console.error('[HomeScreen] cat error:', err);
    }
  };

  const loadProducts = async () => {
    if (loadingMore) return;

    try {
      setLoading(true);

      const res = await fetchProducts({
        branchId: 1,
        limit: 50,
        categoryId: activeCat === 'all' ? undefined : activeCat,
      });

      const newItems = res.data?.rows || res.data || [];
      // Remove duplicates just in case
      const uniqueItems = newItems.reduce((acc: any[], current: any) => {
        const x = acc.find(item => item.id === current.id);
        if (!x) {
          return acc.concat([current]);
        } else {
          return acc;
        }
      }, []);

      setProducts(uniqueItems);
      setHasMore(false); // API doesn't support pagination currently
    } catch (err) {
      console.error('[HomeScreen] prod error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (catId: number | 'all') => {
    setActiveCat(catId);
    setProducts([]);
  };

  useEffect(() => {
    if (loading) return;
    loadProducts();
  }, [activeCat]);

  const handleAdd = (item: any) => {
    addToCart(item);
    setToast({ visible: true, title: 'Đã thêm vào giỏ! 🎉', msg: item.name });
  };

  const renderCategory = ({ item }: { item: any }) => {
    const isActive = item.id === activeCat || (item.id === 'all' && activeCat === 'all');
    return (
      <TouchableOpacity
        style={[s.catChip, isActive && s.catChipActive]}
        onPress={() => handleCategoryChange(item.id)}
      >
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={s.catIcon} />
        ) : (
          item.id === 'all' ? null : <CoffeeIcon size={16} color={isActive ? COLORS.white : COLORS.textSecondary} />
        )}
        <Text style={[s.catText, isActive && s.catTextActive]}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  const allCategoryData = [{ id: 'all', name: 'Tất cả', imageUrl: null }, ...categories];

  const renderHeader = () => (
    <View>
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
                <TouchableOpacity style={s.bannerBtn} onPress={() => navigation.navigate('MenuTab')}>
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

      <View style={[s.section, { marginBottom: 10 }]}>
        <Text style={s.sectionTitle}>Đặt ngay tại quán</Text>
      </View>
    </View>
  );

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

      {/* Sticky Header remains separate from FlatList for best performance */}
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
        <TouchableOpacity style={s.search} onPress={() => navigation.navigate('MenuTab')}>
          <Search size={16} color={COLORS.textMuted} />
          <Text style={s.searchText}>Tìm kiếm thức uống...</Text>
        </TouchableOpacity>
      </View>

      {/* ── Sticky Categories (Horizontal Scroll) ── */}
      <View style={s.catBar}>
        <FlatList
          data={allCategoryData}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.catScroll}
        />
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 16 }}>
            <MiniProductCard
              item={item}
              onPress={() => navigation.navigate('ProductDetail', { product: item })}
              onAdd={() => handleAdd(item)}
            />
          </View>
        )}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={() => (
          loading ? <ActivityIndicator style={{ marginVertical: 20 }} color={COLORS.primary} /> : <View style={{ height: 100 }} />
        )}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={() => loadProducts()}
      />
    </SafeAreaView>
  );
};

// ... keep BANNERS, FALLBACKS, fallback ...

const s = StyleSheet.create({
  safeArea:  { flex: 1, backgroundColor: '#D8F1F3' },
  container: { flex: 1, backgroundColor: '#F2F3F5' },

  /* Sticky header */
  stickyHeader: {
    backgroundColor: '#D8F1F3',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
    zIndex: 10,
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
  },
  cartIconBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.65)', justifyContent: 'center', alignItems: 'center',
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
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
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

  /* Category Scroll (Sticky) */
  catBar: {
    backgroundColor: COLORS.white,
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 2,
    zIndex: 9,
  },
  catScroll: { paddingHorizontal: 16, gap: 8 },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, backgroundColor: '#F0F0F0',
    borderWidth: 1.5, borderColor: 'transparent',
  },
  catChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catIcon: { width: 18, height: 18, borderRadius: 9 },
  catText: { fontFamily: FONTS.medium, fontSize: 13, color: COLORS.textSecondary },
  catTextActive: { fontFamily: FONTS.semiBold, color: COLORS.white },

  /* Sections */
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  sectionTitle: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.textPrimary },
});

export default HomeScreen;

