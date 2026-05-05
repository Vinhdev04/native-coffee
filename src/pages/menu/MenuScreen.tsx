import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, SectionList, Image,
  TextInput, ActivityIndicator,
  FlatList, RefreshControl, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, FONTS } from '@/styles/theme';
import { Search, X, Plus, ShoppingBag, Coffee as CoffeeIcon } from 'lucide-react-native';
import { fetchCategories, fetchProducts } from '@/services/productService';
import { formatCurrency } from '@/utils';
import { useCart } from '@/context/CartContext';
import { useDebounce } from '@/hooks/useDebounce';
import Toast from '@/components/common/Toast';
import ProductModal from '@/components/menu/ProductModal';

/* ── Fallback images ── */
const DRINK_FALLBACKS = [
  'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1515823064-d6e0c04616a4?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1558857563-b37102e99e00?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1622597467836-f3e5474e4b61?auto=format&fit=crop&w=200&q=80',
];
const getFallback = (id: number) => DRINK_FALLBACKS[id % DRINK_FALLBACKS.length];

// ─── Highlight Text Component ─────────────────────────────────────────────────
const HighlightText = ({
  text, highlight, style, highlightStyle,
}: { text: string; highlight: string; style?: any; highlightStyle?: any }) => {
  if (!highlight.trim()) return <Text style={style}>{text}</Text>;
  const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return (
    <Text style={style}>
      {parts.map((part, i) =>
        regex.test(part)
          ? <Text key={i} style={[highlightStyle]}>{part}</Text>
          : <Text key={i}>{part}</Text>
      )}
    </Text>
  );
};

const ProductRow = ({ item, onPress, onAddCart, searchText }: { item: any; onPress: () => void; onAddCart: () => void; searchText: string }) => {
  const isMatch = searchText.trim() && item.name.toLowerCase().includes(searchText.toLowerCase().trim());
  return (
    <TouchableOpacity 
      style={[pr.card, isMatch && pr.cardHighlight]} 
      activeOpacity={0.9} 
      onPress={onPress}
    >
      <Image source={{ uri: item.imageUrl || item.image || getFallback(item.id) }} style={pr.image} resizeMode="cover" />
      <View style={pr.info}>
        <View style={{ flex: 1 }}>
          <HighlightText
            text={item.name}
            highlight={searchText}
            style={pr.name}
            highlightStyle={pr.nameHighlight}
          />
          <Text style={pr.desc} numberOfLines={2}>
            {item.description || item.categoryName || 'Hương vị tươi ngon mỗi ngày.'}
          </Text>
        </View>
        <View style={pr.bottom}>
          <Text style={pr.price}>{formatCurrency(item.basePrice || item.price || 0)}</Text>
          <TouchableOpacity style={pr.addBtn} onPress={onAddCart}>
            <Text style={pr.addBtnText}>Thêm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const pr = StyleSheet.create({
  card: {
    flexDirection: 'row', padding: 12, marginHorizontal: 16, marginVertical: 8,
    backgroundColor: COLORS.white, borderRadius: 22, shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
    borderWidth: 1.5, borderColor: 'transparent',
  },
  cardHighlight: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  image: { width: 95, height: 95, borderRadius: 18, backgroundColor: '#F3F4F6' },
  info: { flex: 1, marginLeft: 14, justifyContent: 'space-between', paddingVertical: 2 },
  name: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.textPrimary },
  nameHighlight: {
    backgroundColor: '#FDE68A', color: COLORS.primary,
    fontFamily: FONTS.bold, borderRadius: 3,
  },
  desc: { fontFamily: FONTS.regular, fontSize: 12, color: '#9CA3AF', lineHeight: 16 },
  bottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.primary },
  addBtn: {
    paddingHorizontal: 18, paddingVertical: 7, borderRadius: 16, backgroundColor: COLORS.primary,
  },
  addBtnText: { fontFamily: FONTS.bold, fontSize: 13, color: COLORS.white },
});

const SectionHeader = ({ title }: { title: string }) => (
  <View style={sh.wrap}>
    <Text style={sh.title}>{title}</Text>
    <View style={sh.line} />
  </View>
);
const sh = StyleSheet.create({
  wrap: { backgroundColor: '#F8F9FA', paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontFamily: FONTS.bold, fontSize: 14, color: '#111827', letterSpacing: 0.3 },
  line: { flex: 1, height: 1, backgroundColor: '#E5E7EB', opacity: 0.6 },
});

const MenuScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { totalItems, addToCart } = useCart();

  const [categories, setCategories] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [searchText, setSearchText] = useState(route.params?.search || '');
  const [activeCategory, setActiveCategory] = useState<number | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState({ visible: false, title: '', message: '' });
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const sectionListRef = useRef<SectionList>(null);
  const categoryListRef = useRef<FlatList>(null);
  const isScrollingFromPress = useRef(false);
  const debouncedSearch = useDebounce(searchText, 350);

  useEffect(() => {
    if (route.params?.search !== undefined) {
      setSearchText(route.params.search);
    }
  }, [route.params?.search]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [catRes, prodRes] = await Promise.all([
        fetchCategories({ branchId: 1 }),
        fetchProducts({ branchId: 1, limit: 100 }),
      ]);
      setCategories(catRes.data?.rows || catRes.data || []);
      setAllProducts(prodRes.data?.rows || prodRes.data || []);
    } catch (err) {
      console.error('[MenuScreen] load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const allCats = React.useMemo(() => [{ id: 'all', name: 'Tất cả', imageUrl: null }, ...categories], [categories]);

  // Auto scroll category bar to show active pill
  const scrollCatBarToActive = React.useCallback((catId: number | 'all') => {
    const idx = allCats.findIndex(c => c.id === catId);
    if (idx >= 0) {
      categoryListRef.current?.scrollToIndex({ index: idx, animated: true, viewPosition: 0.3 });
    }
  }, [allCats]);

  const sections = React.useMemo(() => {
    const searchLower = debouncedSearch.toLowerCase();
    return categories
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

  const handleCategoryPress = (catId: number | 'all') => {
    setActiveCategory(catId);
    if (catId === 'all') {
      sectionListRef.current?.scrollToLocation({ sectionIndex: 0, itemIndex: 0, animated: true, viewPosition: 0 });
      return;
    }
    const idx = sections.findIndex((s) => s.catId === catId);
    if (idx >= 0) {
      isScrollingFromPress.current = true;
      sectionListRef.current?.scrollToLocation({ sectionIndex: idx, itemIndex: 0, animated: true, viewPosition: 0 });
      setTimeout(() => { isScrollingFromPress.current = false; }, 600);
    }
  };

  // Detect visible section when scrolling → update active category
  const onViewableItemsChanged = React.useCallback(({ viewableItems }: any) => {
    if (isScrollingFromPress.current || debouncedSearch) return;
    if (viewableItems.length > 0) {
      const topItem = viewableItems[0];
      const catId = topItem.section?.catId;
      if (catId && catId !== activeCategory) {
        setActiveCategory(catId);
        scrollCatBarToActive(catId);
      }
    }
  }, [activeCategory, debouncedSearch, scrollCatBarToActive]);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 20 });

  const renderCategory = ({ item }: { item: any }) => {
    const isActive = item.id === activeCategory || (item.id === 'all' && activeCategory === 'all');
    return (
      <TouchableOpacity style={[s.catChip, isActive && s.catChipActive]} onPress={() => handleCategoryPress(item.id)}>
        {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={s.catIcon} />}
        <Text style={[s.catText, isActive && s.catTextActive]} numberOfLines={1}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  const handleAddToCart = (item: any) => {
    addToCart(item);
    setToast({ visible: true, title: 'Đã thêm vào giỏ! 🎉', message: item.name });
  };

  const handleProductPress = (product: any) => {
    setSelectedProduct(product);
    setIsModalVisible(true);
  };

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
      <StatusBar barStyle="light-content" backgroundColor="#1A1A2E" />
      <Toast visible={toast.visible} type="success" title={toast.title} message={toast.message} onHide={() => setToast(t => ({ ...t, visible: false }))} />

      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Thực đơn</Text>
          <Text style={s.headerSub}>{allProducts.length} món</Text>
        </View>
        <TouchableOpacity style={s.cartBtn} onPress={() => navigation.navigate('Cart')}>
          <ShoppingBag size={20} color="#fff" />
          {totalItems > 0 && <View style={s.badge}><Text style={s.badgeText}>{totalItems}</Text></View>}
        </TouchableOpacity>
      </View>

      <View style={s.searchRow}>
        <View style={s.searchInputWrap}>
          <Search size={17} color="#9CA3AF" />
          <TextInput
            style={s.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Tìm kiếm đồ uống..."
            placeholderTextColor="#9CA3AF"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}><X size={16} color="#9CA3AF" /></TouchableOpacity>
          )}
        </View>
      </View>

      <View style={s.catBar}>
        <FlatList
          ref={categoryListRef}
          data={[{ id: 'all', name: 'Tất cả', imageUrl: null }, ...categories]}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.catScroll}
        />
      </View>

      {sections.length === 0 ? (
        <View style={s.emptyWrap}>
          <CoffeeIcon size={52} color="#E5E7EB" />
          <Text style={s.emptyTitle}>Không tìm thấy sản phẩm</Text>
        </View>
      ) : (
        <SectionList
          ref={sectionListRef}
          sections={sections}
          keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
          renderItem={({ item }) => <ProductRow item={item} onPress={() => handleProductPress(item)} onAddCart={() => handleProductPress(item)} searchText={debouncedSearch} />}
          renderSectionHeader={({ section }) => <SectionHeader title={section.title} />}
          stickySectionHeadersEnabled
          showsVerticalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig.current}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}
        />
      )}

      <ProductModal visible={isModalVisible} product={selectedProduct} onClose={() => setIsModalVisible(false)} onAddToCart={handleAddToCart} />
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F8' },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontFamily: FONTS.medium, fontSize: 14, color: COLORS.textMuted },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 14,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 10,
    backgroundColor: '#1A1A2E',
  },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 24, color: '#fff' },
  headerSub: { fontFamily: FONTS.regular, fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  cartBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  badge: { position: 'absolute', top: -2, right: -2, backgroundColor: COLORS.primary, borderRadius: 8, minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#1A1A2E' },
  badgeText: { fontFamily: FONTS.bold, fontSize: 9, color: '#fff' },

  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A2E', paddingHorizontal: 16, paddingTop: 4, paddingBottom: 14 },
  searchInputWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 14, height: 46 },
  searchInput: { flex: 1, fontFamily: FONTS.medium, fontSize: 14, color: '#374151' },

  catBar: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  catScroll: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1.5, borderColor: 'transparent' },
  catChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catIcon: { width: 18, height: 18, borderRadius: 9 },
  catText: { fontFamily: FONTS.semiBold, fontSize: 13, color: '#6B7280' },
  catTextActive: { color: '#fff' },

  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10, paddingBottom: 80 },
  emptyTitle: { fontFamily: FONTS.semiBold, fontSize: 16, color: COLORS.textSecondary },
});

export default MenuScreen;
