import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, SectionList, Dimensions,
  ActivityIndicator, Platform, TextInput, FlatList, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS } from '@/styles/theme';
import { Search, Bell, ShoppingBag, X } from 'lucide-react-native';
import { fetchCategories, fetchProducts } from '@/services/productService';
import { useCart } from '@/context/CartContext';
import Toast from '@/components/common/Toast';
import ProductCardHorizontal from '@/components/home/ProductCardHorizontal';
import ProductModal from '@/components/menu/ProductModal';
import ReceiptModal from '@/components/common/ReceiptModal';

const SectionHeader = ({ title }: { title: string }) => (
  <View style={sh.wrap}>
    <Text style={sh.title}>{title}</Text>
  </View>
);
const sh = StyleSheet.create({
  wrap: { backgroundColor: '#F7F7F8', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  title: { fontFamily: FONTS.bold, fontSize: 13, color: '#374151' },
});

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const { items, totalItems, addToCart } = useCart();

  const [categories, setCategories] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [activeCatId, setActiveCatId] = useState<number | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [toast, setToast] = useState({ visible: false, title: '', msg: '' });
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isReceiptVisible, setIsReceiptVisible] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState<any>(null);

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

  const sections = useMemo(() => {
    if (searchText.trim()) {
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

  const scrollCatBarToActive = useCallback((catId: number | 'all') => {
    const idx = allCats.findIndex(c => c.id === catId);
    if (idx >= 0) {
      catBarRef.current?.scrollToIndex({ index: idx, animated: true, viewPosition: 0.3 });
    }
  }, [allCats]);

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

  const handleAddToCart = (item: any) => {
    addToCart(item);
    setToast({
      visible: true,
      title: 'Đã thêm vào giỏ! 🎉',
      msg: `${item.name}. Chạm để xem giỏ hàng.`
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

  return (
    <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A2E" />
      <Toast
        visible={toast.visible} type="success"
        title={toast.title} message={toast.msg}
        onHide={() => setToast(t => ({ ...t, visible: false }))}
        onPress={() => {
          setToast(t => ({ ...t, visible: false }));
          navigation.navigate('Cart');
        }}
      />

      <View style={s.topBar}>
        <View style={s.headerLeft}>
          <Image
            source={require('@/public/logo.png')}
            style={s.headerLogo}
            resizeMode="contain"
          />
        </View>
        <View style={s.headerRight}>
          <TouchableOpacity style={s.headerBtn} onPress={() => navigation.navigate('Cart')}>
            <ShoppingBag size={20} color={COLORS.primary} />
            {totalItems > 0 && <View style={s.badge}><Text style={s.badgeText}>{totalItems > 9 ? '9+' : totalItems}</Text></View>}
          </TouchableOpacity>
        </View>
      </View>

      <View style={s.searchSection}>
        <View style={s.searchBar}>
          <Search size={18} color="#9CA3AF" />
          <TextInput
            style={s.searchInput}
            placeholder="Tìm kiếm đồ uống..."
            placeholderTextColor="#9CA3AF"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <X size={16} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {!searchText && (
        <View style={s.catBar}>
          <FlatList
            ref={catBarRef}
            data={allCats}
            keyExtractor={i => i.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
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
          renderItem={({ item }) => {
            const cartQty = items
              .filter(cartItem => Number(cartItem.id) === Number(item.id))
              .reduce((sum, cartItem) => sum + cartItem.quantity, 0);
              
            return (
              <View style={{ paddingHorizontal: 16, paddingTop: 4 }}>
                <ProductCardHorizontal
                  product={item}
                  searchText={searchText}
                  cartQuantity={cartQty}
                  onPress={() => handleProductPress(item)}
                  onAddPress={() => handleAddToCart(item)}
                  onPrintPress={() => handlePrintProduct(item)}
                />
              </View>
            );
          }}
          refreshing={loading}
          onRefresh={loadData}
          ListFooterComponent={<View style={{ height: 110 }} />}
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
  safe: { flex: 1, backgroundColor: COLORS.white },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, 
    paddingVertical: Platform.OS === 'android' ? 10 : 15, 
    backgroundColor: COLORS.white,
  },
  headerLeft: { width: 80, height: 40 },
  headerLogo: { width: '100%', height: '100%' },
  brandName: { 
    fontFamily: FONTS.bold, 
    fontSize: 22, 
    color: '#F7941D', 
    flex: 1, 
    textAlign: 'center' 
  },
  headerRight: { width: 44, alignItems: 'flex-end' },
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

  searchSection: { paddingHorizontal: 16, paddingBottom: 16, backgroundColor: COLORS.white },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#F9FAFB', borderRadius: 14, paddingHorizontal: 14, height: 48,
    borderWidth: 1, borderColor: '#F3F4F6'
  },
  searchInput: { fontFamily: FONTS.medium, fontSize: 14, color: '#111827', flex: 1 },
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
  listContent: { backgroundColor: '#F7F7F8', paddingBottom: 30 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, backgroundColor: '#F7F7F8' },
  loadingText: { fontFamily: FONTS.medium, fontSize: 14, color: '#9CA3AF' },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8, backgroundColor: '#F7F7F8', paddingBottom: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 4 },
  emptyTitle: { fontFamily: FONTS.semiBold, fontSize: 16, color: '#374151' },
  emptyText: { fontFamily: FONTS.regular, fontSize: 13, color: '#9CA3AF' },
});

export default HomeScreen;
