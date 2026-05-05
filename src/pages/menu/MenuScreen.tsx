import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, SectionList, Image,
  TextInput, ActivityIndicator,
  FlatList, RefreshControl, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS } from '@/styles/theme';
import { Search, X, Plus, ShoppingBag, Coffee as CoffeeIcon } from 'lucide-react-native';
import { fetchCategories, fetchProducts } from '@/services/productService';
import { formatCurrency } from '@/utils';
import { useCart } from '@/context/CartContext';
import { useDebounce } from '@/hooks/useDebounce';
import Toast from '@/components/common/Toast';



/* ── Fallback images by drink type ── */
const DRINK_FALLBACKS = [
  'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1515823064-d6e0c04616a4?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1558857563-b37102e99e00?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1622597467836-f3e5474e4b61?auto=format&fit=crop&w=200&q=80',
];
const getFallback = (id: number) => DRINK_FALLBACKS[id % DRINK_FALLBACKS.length];

/* ── Product row card (GrabFood style) ── */
const ProductRow = ({
  item,
  onPress,
  onAddCart,
}: {
  item: any;
  onPress: () => void;
  onAddCart: () => void;
}) => (
  <TouchableOpacity style={pr.card} activeOpacity={0.85} onPress={onPress}>
    <Image
      source={{ uri: item.imageUrl || item.image || getFallback(item.id) }}
      style={pr.image}
      resizeMode="cover"
    />
    <View style={pr.info}>
      <Text style={pr.name} numberOfLines={1}>{item.name}</Text>
      <Text style={pr.desc} numberOfLines={1}>{item.categoryName || 'Sản phẩm'}</Text>
      <View style={pr.bottom}>
        <Text style={pr.price}>{formatCurrency(item.basePrice || item.price || 0)}</Text>
        <TouchableOpacity style={pr.addBtn} onPress={onAddCart}>
          <Plus size={16} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </View>
  </TouchableOpacity>
);

const pr = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F9FAFB',
  },
  image: {
    width: 84,
    height: 84,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    flexShrink: 0,
  },
  info: { flex: 1, marginLeft: 16, justifyContent: 'center' },
  name: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.textPrimary, marginBottom: 2 },
  desc: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textMuted, marginBottom: 8 },
  bottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.primary },
  addBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
});

/* ── Section header ── */
const SectionHeader = ({ title }: { title: string }) => (
  <View style={sh.wrap}>
    <View style={sh.accent} />
    <Text style={sh.title}>{title}</Text>
  </View>
);
const sh = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
    gap: 8,
  },
  accent: {
    width: 3, height: 16,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },
  title: { fontFamily: FONTS.bold, fontSize: 13, color: COLORS.textPrimary },
});

/* ═══════════════════════════════════════════════════════ */

const MenuScreen = () => {
  const navigation = useNavigation<any>();
  const { totalItems, addToCart } = useCart();

  const [categories, setCategories] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [activeCategory, setActiveCategory] = useState<number | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState({ visible: false, title: '', message: '' });

  const sectionListRef = useRef<SectionList>(null);
  const categoryListRef = useRef<FlatList>(null);
  const isScrollingFromPress = useRef(false);
  const debouncedSearch = useDebounce(searchText, 350);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [catRes, prodRes] = await Promise.all([
        fetchCategories({ branchId: 1 }),
        fetchProducts({ branchId: 1, limit: 100 }),
      ]);
      const cats = catRes.data?.rows || catRes.data || [];
      const prods = prodRes.data?.rows || prodRes.data || [];
      setCategories(cats);
      setAllProducts(prods);
    } catch (err) {
      console.error('[MenuScreen] load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* Build sections: group products by category */
  const sections = React.useMemo(() => {
    const searchLower = debouncedSearch.toLowerCase();

    // Always show all categories, do NOT filter by activeCategory 
    // so the user can scroll through the entire list continuously.
    const relevantCats = categories;

    return relevantCats
      .map((cat) => {
        const items = allProducts.filter((p) => {
          const matchCat = p.categoryId === cat.id;
          const matchSearch = !debouncedSearch || p.name.toLowerCase().includes(searchLower);
          return matchCat && matchSearch;
        });
        return { title: cat.name, catId: cat.id, data: items };
      })
      .filter((s) => s.data.length > 0);
  }, [categories, allProducts, debouncedSearch]);

  /* Pressing a category chip -> scroll SectionList */
  const handleCategoryPress = (catId: number | 'all') => {
    setActiveCategory(catId);
    if (catId === 'all') {
      sectionListRef.current?.scrollToLocation({ sectionIndex: 0, itemIndex: 0, animated: true, viewPosition: 0 });
      return;
    }
    const idx = sections.findIndex((s) => s.catId === catId);
    if (idx >= 0) {
      isScrollingFromPress.current = true;
      sectionListRef.current?.scrollToLocation({
        sectionIndex: idx,
        itemIndex: 0,
        animated: true,
        viewPosition: 0,
      });
      /* Reset flag after animation */
      setTimeout(() => { isScrollingFromPress.current = false; }, 600);
    }
    /* Scroll category chip into view */
    const catIdx = categories.findIndex((c) => c.id === catId);
    categoryListRef.current?.scrollToIndex({ index: Math.max(0, catIdx), animated: true, viewPosition: 0.3 });
  };

  /* SectionList viewable change -> sync active category chip */
  const scrollY = useRef(0);
  
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (isScrollingFromPress.current || searchText.length > 0) return;
    
    // If we are at the very top, force "Tất cả"
    if (scrollY.current < 20) {
      if (activeCategory !== 'all') {
        setActiveCategory('all');
        categoryListRef.current?.scrollToIndex({ index: 0, animated: true, viewPosition: 0.5 });
      }
      return;
    }

    const first = viewableItems.find((vi: any) => vi.isViewable && vi.section);
    if (first) {
      const sectionCatId = first.section.catId;
      if (sectionCatId !== activeCategory) {
        setActiveCategory(sectionCatId);

        // Scroll category chip into view
        const idx = categories.findIndex((c: any) => c.id === sectionCatId);
        if (idx >= 0) {
          categoryListRef.current?.scrollToIndex({
            index: idx + 1, // +1 because 'all' is at index 0
            animated: true,
            viewPosition: 0.5
          });
        }
      }
    }
  }).current;

  const handleScroll = (e: any) => {
    scrollY.current = e.nativeEvent.contentOffset.y;
  };

  const handleAddToCart = (item: any) => {
    addToCart(item);
    setToast({ visible: true, title: 'Đã thêm vào giỏ! 🎉', message: item.name });
  };

  const renderCategory = ({ item }: { item: any }) => {
    const isActive = item.id === activeCategory || (item.id === 'all' && activeCategory === 'all');
    return (
      <TouchableOpacity
        style={[s.catChip, isActive && s.catChipActive]}
        onPress={() => handleCategoryPress(item.id)}
      >
        {item.imageUrl && (
          <Image source={{ uri: item.imageUrl }} style={s.catIcon} />
        )}
        <Text style={[s.catText, isActive && s.catTextActive]} numberOfLines={1}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  const allCategoryData = [{ id: 'all', name: 'Tất cả', imageUrl: null }, ...categories];

  if (loading) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.loadingWrap}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={s.loadingText}>Đang tải thực đơn...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.teal} />

      <Toast
        visible={toast.visible}
        type="success"
        title={toast.title}
        message={toast.message}
        onHide={() => setToast(t => ({ ...t, visible: false }))}
      />

      {/* ── Header ── */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Thực đơn</Text>
        <TouchableOpacity style={s.cartBtn} onPress={() => navigation.navigate('Cart')}>
          <ShoppingBag size={20} color={COLORS.textPrimary} />
          {totalItems > 0 && (
            <View style={s.badge}>
              <Text style={s.badgeText}>{totalItems > 99 ? '99+' : totalItems}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Search ── */}
      <View style={s.searchRow}>
        <View style={s.searchInputWrap}>
          <Search size={17} color={COLORS.textMuted} />
          <TextInput
            style={s.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Tìm kiếm đồ uống..."
            placeholderTextColor={COLORS.textMuted}
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <X size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Category chips (horizontal scroll) ── */}
      <View style={s.catBar}>
        <FlatList
          ref={categoryListRef}
          data={allCategoryData as any[]}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.catScroll}
          onScrollToIndexFailed={() => {}}
        />
      </View>

      {/* ── Products SectionList ── */}
      {sections.length === 0 ? (
        <View style={s.emptyWrap}>
          <CoffeeIcon size={52} color="#E5E7EB" />
          <Text style={s.emptyTitle}>Không tìm thấy sản phẩm</Text>
          <Text style={s.emptyText}>Thử từ khóa khác hoặc chọn danh mục khác</Text>
        </View>
      ) : (
        <SectionList
          ref={sectionListRef}
          sections={sections}
          keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
          renderItem={({ item }) => (
            <ProductRow
              item={item}
              onPress={() => navigation.navigate('ProductDetail', { product: item })}
              onAddCart={() => handleAddToCart(item)}
            />
          )}
          renderSectionHeader={({ section }) => <SectionHeader title={section.title} />}
          stickySectionHeadersEnabled
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={COLORS.primary} colors={[COLORS.primary]} />
          }
          onScroll={handleScroll}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ itemVisiblePercentThreshold: 20 }}
          onScrollToIndexFailed={() => {}}
        />
      )}
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#F2F3F5' },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontFamily: FONTS.medium, fontSize: 14, color: COLORS.textMuted },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 14,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 14,
    backgroundColor: COLORS.teal,
    borderBottomWidth: 0,
  },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 22, color: COLORS.textPrimary },
  cartBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.65)', justifyContent: 'center', alignItems: 'center',
    borderWidth: 0,
  },
  badge: {
    position: 'absolute', top: -2, right: -2,
    backgroundColor: COLORS.primary, borderRadius: 9,
    minWidth: 17, height: 17,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: COLORS.white,
  },
  badgeText: { fontFamily: FONTS.bold, fontSize: 9, color: COLORS.white },

  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.teal,
    paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12,
    gap: 8,
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.white,
    borderRadius: 22, paddingHorizontal: 12, height: 42,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 0,
  },
  searchInput: { flex: 1, fontFamily: FONTS.regular, fontSize: 14, color: COLORS.textPrimary },

  catBar: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1, borderBottomColor: '#EBEBEB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  catScroll: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 12, backgroundColor: COLORS.white,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  catChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catIcon: { width: 18, height: 18, borderRadius: 9 },
  catText: { fontFamily: FONTS.semiBold, fontSize: 13, color: '#6B7280' },
  catTextActive: { color: COLORS.white },

  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10, paddingBottom: 80 },
  emptyTitle: { fontFamily: FONTS.semiBold, fontSize: 16, color: COLORS.textSecondary },
  emptyText:  { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.textMuted, textAlign: 'center', paddingHorizontal: 30 },
});

export default MenuScreen;
