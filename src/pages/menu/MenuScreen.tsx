import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, SectionList, Image,
  TextInput, ActivityIndicator,
  FlatList, RefreshControl, Platform, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, FONTS } from '@/styles/theme';
import { useTranslation } from 'react-i18next';
import { Search, X, ShoppingBag, Coffee as CoffeeIcon } from 'lucide-react-native';
import { fetchCategories, fetchProducts } from '@/services/productService';
import { useCart } from '@/context/CartContext';
import { useDebounce } from '@/hooks/useDebounce';
import Toast from '@/components/common/Toast';
import ProductModal from '@/components/menu/ProductModal';
import ProductCardHorizontal from '@/components/home/ProductCardHorizontal';
import ReceiptModal from '@/components/common/ReceiptModal';


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
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 360;

  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { t } = useTranslation();
  const { items, totalItems, addToCart } = useCart();

  const [categories, setCategories] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [searchText, setSearchText] = useState(route.params?.search || '');
  const [activeCategory, setActiveCategory] = useState<number | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState({ visible: false, title: '', message: '' });
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isReceiptVisible, setIsReceiptVisible] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState<any>(null);

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
      console.error('[MenuScreen] Lỗi khi tải dữ liệu thực đơn:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const allCats = React.useMemo(() => [{ id: 'all', name: t('all'), imageUrl: null }, ...categories], [categories, t]);

  // Tự động cuộn thanh danh mục để hiển thị mục đang hoạt động
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

  // Phát hiện phần hiển thị khi cuộn để cập nhật danh mục hoạt động
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
      <TouchableOpacity style={[s.catChip, isActive && s.catChipActive, { paddingHorizontal: isSmallScreen ? 12 : 16 }]} onPress={() => handleCategoryPress(item.id)}>
        {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={s.catIcon} />}
        <Text style={[s.catText, isActive && s.catTextActive]} numberOfLines={1}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  const handleAddToCart = (item: any) => {
    addToCart(item);
    setToast({
      visible: true,
      title: t('added_to_cart'),
      message: `${item.name}. ${t('tap_to_view_cart')}`
    });
  };

  const handlePrintProduct = (item: any) => {
    setReceiptOrder({
      id: 'DRAFT-' + Math.floor(Math.random() * 1000),
      items: [{ ...item, quantity: 1, price: item.basePrice || item.price }],
      totalPrice: item.basePrice || item.price,
      customerName: 'Khách xem mẫu',
    });
    setIsReceiptVisible(true);
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
          <Text style={s.loadingText}>{t('loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A2E" />
      <Toast 
        visible={toast.visible} type="success" title={toast.title} message={toast.message} 
        onHide={() => setToast(t => ({ ...t, visible: false }))} 
        onPress={() => {
          setToast(t => ({ ...t, visible: false }));
          navigation.navigate('Cart');
        }}
      />

      <View style={[s.header, { paddingHorizontal: isSmallScreen ? 12 : 20 }]}>
        <View style={s.headerLeft} />
        <Text style={s.headerTitle}>{t('menu_title')}</Text>
        <TouchableOpacity style={s.headerBtn} onPress={() => navigation.navigate('Cart')}>
          <ShoppingBag size={20} color={COLORS.primary} />
          {totalItems > 0 && <View style={s.badge}><Text style={s.badgeText} adjustsFontSizeToFit numberOfLines={1}>{totalItems}</Text></View>}
        </TouchableOpacity>
      </View>

      <View style={[s.searchRow, { paddingHorizontal: isSmallScreen ? 12 : 16 }]}>
        <View style={s.searchInputWrap}>
          <Search size={17} color="#9CA3AF" />
          <TextInput
            style={s.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder={t('search_placeholder')}
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
          data={[{ id: 'all', name: t('all'), imageUrl: null }, ...categories]}
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
          <Text style={s.emptyTitle}>{t('no_products_found')}</Text>
        </View>
      ) : (
        <SectionList
          ref={sectionListRef}
          sections={sections}
          keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
          renderItem={({ item }) => {
            const cartQty = items
              .filter(cartItem => Number(cartItem.id) === Number(item.id))
              .reduce((sum, cartItem) => sum + cartItem.quantity, 0);

            return (
              <View style={{ paddingHorizontal: 16, paddingTop: 4 }}>
                <ProductCardHorizontal 
                  product={item} 
                  onPress={() => handleProductPress(item)} 
                  onAddPress={() => handleAddToCart(item)} 
                  onPrintPress={() => handlePrintProduct(item)}
                  searchText={debouncedSearch} 
                  cartQuantity={cartQty}
                />
              </View>
            );
          }}
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
      <ReceiptModal 
        visible={isReceiptVisible} 
        onClose={() => setIsReceiptVisible(false)} 
        order={receiptOrder}
        title="PHIẾU XEM TRƯỚC MÓN"
      />
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F8' },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontFamily: FONTS.medium, fontSize: 14, color: COLORS.textMuted },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, 
    paddingVertical: Platform.OS === 'android' ? 10 : 15, 
    backgroundColor: COLORS.white,
  },
  headerLeft: { width: 44 },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.textPrimary, flex: 1, textAlign: 'center' },
  headerBtn: { 
    width: 44, height: 44, justifyContent: 'center', alignItems: 'center', 
    backgroundColor: '#F9FAFB', borderRadius: 14,
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  badge: { 
    position: 'absolute', top: -4, right: -4, backgroundColor: COLORS.primary, borderRadius: 10, 
    minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.white 
  },
  badgeText: { fontFamily: FONTS.bold, fontSize: 9, color: COLORS.white },

  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, paddingHorizontal: 16, paddingBottom: 14 },
  searchInputWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F9FAFB', borderRadius: 14, paddingHorizontal: 14, height: 46, borderWidth: 1, borderColor: '#F3F4F6' },
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
