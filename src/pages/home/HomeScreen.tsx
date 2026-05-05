import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, Image, SectionList, Dimensions,
  ActivityIndicator, Platform, TextInput, ScrollView,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS } from '@/styles/theme';
import { Search, Bell, ShoppingBag, Plus, X } from 'lucide-react-native';
import { fetchCategories, fetchProducts } from '@/services/productService';
import { formatCurrency } from '@/utils';
import { useCart } from '@/context/CartContext';
import Toast from '@/components/common/Toast';

const { width: SW } = Dimensions.get('window');

const FALLBACKS = [
  'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1515823064-d6e0c04616a4?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1558857563-b37102e99e00?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=200&q=80',
];
const fallback = (id: number) => FALLBACKS[id % FALLBACKS.length];

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

// ─── Product Card ─────────────────────────────────────────────────────────────
const ProductCard = ({
  item, onPress, onAdd, searchText,
}: { item: any; onPress: () => void; onAdd: () => void; searchText: string }) => (
  <TouchableOpacity style={pc.card} onPress={onPress} activeOpacity={0.88}>
    <Image
      source={{ uri: item.imageUrl || item.image || fallback(item.id) }}
      style={pc.image} resizeMode="cover"
    />
    <View style={pc.info}>
      <HighlightText
        text={item.name}
        highlight={searchText}
        style={pc.name}
        highlightStyle={pc.nameHighlight}
      />
      <Text style={pc.cat} numberOfLines={2}>{item.description || item.categoryName || 'Thức uống'}</Text>
      <Text style={pc.price}>{formatCurrency(item.basePrice || item.price || 0)}</Text>
    </View>
    <TouchableOpacity style={pc.addBtn} onPress={onAdd}>
      <Text style={pc.addBtnText}>Thêm</Text>
    </TouchableOpacity>
  </TouchableOpacity>
);

const pc = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 16, padding: 12,
    marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
  },
  image: { width: 80, height: 80, borderRadius: 12, backgroundColor: '#F3F4F6', flexShrink: 0 },
  info: { flex: 1, marginLeft: 14, gap: 3 },
  name: { fontFamily: FONTS.semiBold, fontSize: 15, color: '#111827' },
  nameHighlight: {
    backgroundColor: '#FFF3CD', color: COLORS.primary,
    fontFamily: FONTS.bold, borderRadius: 3,
  },
  cat: { fontFamily: FONTS.regular, fontSize: 12, color: '#9CA3AF', lineHeight: 17 },
  price: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.primary, marginTop: 2 },
  addBtn: {
    backgroundColor: COLORS.primary, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8, marginLeft: 10,
  },
  addBtnText: { fontFamily: FONTS.bold, fontSize: 13, color: '#fff' },
});

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionHeader = ({ title }: { title: string }) => (
  <View style={sh.wrap}>
    <Text style={sh.title}>{title}</Text>
  </View>
);
const sh = StyleSheet.create({
  wrap: { backgroundColor: '#F7F7F8', paddingHorizontal: 14, paddingTop: 16, paddingBottom: 8 },
  title: { fontFamily: FONTS.bold, fontSize: 15, color: '#374151' },
});

// ─── HomeScreen ───────────────────────────────────────────────────────────────
const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const { totalItems, addToCart } = useCart();

  const [categories, setCategories] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [activeCatId, setActiveCatId] = useState<number | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [toast, setToast] = useState({ visible: false, title: '', msg: '' });

  const sectionListRef = useRef<SectionList>(null);
  const catBarRef = useRef<FlatList>(null);
  const isScrollingFromPress = useRef(false);

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
    } catch {} finally { setLoading(false); }
  };

  // Build sections grouped by category
  const sections = useMemo(() => {
    if (searchText.trim()) {
      // Khi search: 1 section duy nhất chứa tất cả kết quả phù hợp
      const q = searchText.toLowerCase();
      const matched = allProducts.filter(p => p.name.toLowerCase().includes(q));
      return matched.length > 0
        ? [{ catId: 'search', title: `Kết quả cho "${searchText}"`, data: matched }]
        : [];
    }
    return categories
      .map(cat => ({
        catId: cat.id,
        title: cat.name,
        data: allProducts.filter(p => p.categoryId === cat.id),
      }))
      .filter(s => s.data.length > 0);
  }, [categories, allProducts, searchText]);

  const allCats = useMemo(() => [{ id: 'all', name: 'Tất cả' }, ...categories], [categories]);

  // Scroll list to category section when tapping pill
  const handleCatPress = useCallback((catId: number | 'all') => {
    setActiveCatId(catId);
    if (catId === 'all') {
      sectionListRef.current?.scrollToLocation({ sectionIndex: 0, itemIndex: 0, animated: true, viewOffset: 0 });
      return;
    }
    const idx = sections.findIndex(s => s.catId === catId);
    if (idx >= 0) {
      isScrollingFromPress.current = true;
      try {
        sectionListRef.current?.scrollToLocation({ sectionIndex: idx, itemIndex: 0, animated: true, viewOffset: 0 });
      } catch {}
      setTimeout(() => { isScrollingFromPress.current = false; }, 800);
    }
  }, [sections]);

  // Auto scroll category bar to show active pill
  const scrollCatBarToActive = useCallback((catId: number | 'all') => {
    const idx = allCats.findIndex(c => c.id === catId);
    if (idx >= 0) {
      catBarRef.current?.scrollToIndex({ index: idx, animated: true, viewPosition: 0.3 });
    }
  }, [allCats]);

  // Detect visible section when scrolling → update active category
  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (isScrollingFromPress.current || searchText) return;
    if (viewableItems.length > 0) {
      const topItem = viewableItems[0];
      const catId = topItem.section?.catId;
      if (catId && catId !== activeCatId) {
        setActiveCatId(catId);
        scrollCatBarToActive(catId);
      }
    }
  }, [activeCatId, searchText, scrollCatBarToActive]);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 20 });

  const handleAdd = (item: any) => {
    addToCart(item);
    setToast({ visible: true, title: 'Đã thêm vào giỏ! 🎉', msg: item.name });
  };

  return (
    <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A2E" />
      <Toast
        visible={toast.visible} type="success"
        title={toast.title} message={toast.msg}
        onHide={() => setToast(t => ({ ...t, visible: false }))}
      />

      {/* ── Header (sticky, không scroll) ── */}
      <View style={s.topBar}>
        {/* Title Row */}
        <View style={s.titleRow}>
          <View>
            <Text style={s.brandName}>Native Coffee</Text>
            <Text style={s.brandSub}>Đặt món tại quán</Text>
          </View>
          <View style={s.headerRight}>
            <TouchableOpacity style={s.iconBtn}><Bell size={18} color="rgba(255,255,255,0.75)" /></TouchableOpacity>
            <TouchableOpacity style={s.cartBtn} onPress={() => navigation.navigate('Cart')}>
              <ShoppingBag size={18} color="#fff" />
              {totalItems > 0 && <View style={s.badge}><Text style={s.badgeText}>{totalItems > 9 ? '9+' : totalItems}</Text></View>}
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}
        <View style={s.searchBar}>
          <Search size={16} color={searchText ? COLORS.primary : '#9CA3AF'} />
          <TextInput
            style={s.searchInput}
            placeholder="Tìm món..."
            placeholderTextColor="#9CA3AF"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <X size={15} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Category Bar (sticky dưới header) ── */}
      {!searchText && (
        <View style={s.catBar}>
          <FlatList
            ref={catBarRef}
            data={allCats}
            keyExtractor={i => i.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 14, gap: 8 }}
            onScrollToIndexFailed={() => {}}
            renderItem={({ item }) => {
              const isActive = item.id === activeCatId || (item.id === 'all' && activeCatId === 'all');
              return (
                <TouchableOpacity
                  style={[s.catChip, isActive && s.catChipActive]}
                  onPress={() => handleCatPress(item.id as any)}
                >
                  <Text style={[s.catText, isActive && s.catTextActive]}>{item.name}</Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      )}

      {/* ── Product Sections ── */}
      {loading ? (
        <View style={s.loadingWrap}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={s.loadingText}>Đang tải thực đơn...</Text>
        </View>
      ) : sections.length === 0 && searchText ? (
        <View style={s.emptyWrap}>
          <Text style={s.emptyIcon}>🔍</Text>
          <Text style={s.emptyTitle}>Không tìm thấy "{searchText}"</Text>
          <Text style={s.emptyText}>Thử tìm kiếm với từ khóa khác</Text>
        </View>
      ) : (
        <SectionList
          ref={sectionListRef}
          sections={sections}
          keyExtractor={(item, idx) => item?.id?.toString() || idx.toString()}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.listContent}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig.current}
          onScrollToIndexFailed={() => {}}
          renderSectionHeader={({ section }) => <SectionHeader title={section.title} />}
          renderItem={({ item }) => (
            <View style={{ paddingHorizontal: 14 }}>
              <ProductCard
                item={item}
                searchText={searchText}
                onPress={() => navigation.navigate('ProductDetail', { product: item })}
                onAdd={() => handleAdd(item)}
              />
            </View>
          )}
          refreshing={loading}
          onRefresh={loadData}
          ListFooterComponent={<View style={{ height: 110 }} />}
        />
      )}
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#1A1A2E' },

  // Top bar (fixed)
  topBar: {
    backgroundColor: '#1A1A2E',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 4 : 0,
    paddingBottom: 12,
    gap: 10,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandName: { fontFamily: FONTS.bold, fontSize: 18, color: '#fff' },
  brandSub: { fontFamily: FONTS.regular, fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 1 },
  headerRight: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  cartBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  badge: { position: 'absolute', top: -3, right: -3, backgroundColor: '#fff', borderRadius: 9, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.primary },
  badgeText: { fontFamily: FONTS.bold, fontSize: 9, color: COLORS.primary },

  // Search
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 14, height: 46,
  },
  searchInput: { fontFamily: FONTS.regular, fontSize: 14, color: '#111827', flex: 1 },

  // Category bar (sticky)
  catBar: {
    backgroundColor: '#fff', paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 3,
  },
  catChip: {
    paddingHorizontal: 18, paddingVertical: 8, borderRadius: 22,
    backgroundColor: '#F3F4F6', borderWidth: 1.5, borderColor: 'transparent',
  },
  catChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catText: { fontFamily: FONTS.semiBold, fontSize: 13, color: '#6B7280' },
  catTextActive: { color: '#fff' },

  // List
  listContent: { backgroundColor: '#F7F7F8', paddingBottom: 30 },

  // States
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, backgroundColor: '#F7F7F8' },
  loadingText: { fontFamily: FONTS.medium, fontSize: 14, color: '#9CA3AF' },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8, backgroundColor: '#F7F7F8', paddingBottom: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 4 },
  emptyTitle: { fontFamily: FONTS.semiBold, fontSize: 16, color: '#374151' },
  emptyText: { fontFamily: FONTS.regular, fontSize: 13, color: '#9CA3AF' },
});

export default HomeScreen;
