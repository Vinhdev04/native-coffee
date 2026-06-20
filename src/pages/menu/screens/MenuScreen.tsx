import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View, Text, TouchableOpacity,
  StatusBar, SectionList, Image,
  TextInput, ActivityIndicator,
  FlatList, RefreshControl, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Search, X, ShoppingBag, Coffee as CoffeeIcon, QrCode } from 'lucide-react-native';
import { fetchCategories, fetchProducts } from '@/services/productService';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { COLORS } from '@/styles/theme';
import { useDebounce } from '@/hooks/useDebounce';
import Toast from '@/components/common/Toast';
import ProductModal from '@/components/menu/ProductModal';
import ProductCardHorizontal from '@/components/home/ProductCardHorizontal';
import ReceiptModal from '@/components/common/ReceiptModal';
import { s, sh } from '../styles/MenuScreen.styles';

const SectionHeader = ({ title }: { title: string }) => (
  <View style={sh.wrap}>
    <Text style={sh.title}>{title}</Text>
    <View style={sh.line} />
  </View>
);

const MenuScreen = () => {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 360;

  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { t } = useTranslation();
  const { items, totalItems, addToCart, activeTable, clearActiveTable } = useCart();
  const { user } = useAuth();
  const branchId = user?.branchId || (user as any)?.branchId || (user as any)?.branch_id || 1;

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
    if (route.params?.search !== undefined) setSearchText(route.params.search);
  }, [route.params?.search]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [catRes, prodRes] = await Promise.all([
        fetchCategories({ branchId }),
        fetchProducts({ branchId, limit: 100 }),
      ]);
      setCategories(catRes.data?.rows || catRes.data || []);
      setAllProducts(prodRes.data?.rows || prodRes.data || []);
    } catch (err) {
      console.error('[MenuScreen] Lỗi:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const allCats = useMemo(() => [{ id: 'all', name: t('all'), imageUrl: null }, ...categories], [categories, t]);

  const scrollCatBarToActive = React.useCallback((catId: number | 'all') => {
    const idx = allCats.findIndex(c => c.id === catId);
    if (idx >= 0) categoryListRef.current?.scrollToIndex({ index: idx, animated: true, viewPosition: 0.3 });
  }, [allCats]);

  const sections = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return categories
      .map(cat => ({
        title: cat.name, catId: cat.id,
        data: allProducts.filter(p => p.categoryId === cat.id && (!q || p.name.toLowerCase().includes(q))),
      }))
      .filter(s => s.data.length > 0);
  }, [categories, allProducts, debouncedSearch]);

  const handleCategoryPress = (catId: number | 'all') => {
    setActiveCategory(catId);
    if (catId === 'all') {
      sectionListRef.current?.scrollToLocation({ sectionIndex: 0, itemIndex: 0, animated: true, viewPosition: 0 });
      return;
    }
    const idx = sections.findIndex(sec => sec.catId === catId);
    if (idx >= 0) {
      isScrollingFromPress.current = true;
      sectionListRef.current?.scrollToLocation({ sectionIndex: idx, itemIndex: 0, animated: true, viewPosition: 0 });
      setTimeout(() => { isScrollingFromPress.current = false; }, 600);
    }
  };

  const onViewableItemsChanged = React.useCallback(({ viewableItems }: any) => {
    if (isScrollingFromPress.current || debouncedSearch) return;
    if (viewableItems.length > 0) {
      const catId = viewableItems[0].section?.catId;
      if (catId && catId !== activeCategory) { setActiveCategory(catId); scrollCatBarToActive(catId); }
    }
  }, [activeCategory, debouncedSearch, scrollCatBarToActive]);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 20 });

  const handleAddToCart = (item: any) => {
    addToCart(item);
    setToast({ visible: true, title: t('added_to_cart'), message: `${item.name}. ${t('tap_to_view_cart')}` });
  };

  if (loading) {
    return (
      <SafeAreaView style={s.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <View style={s.loadingWrap}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={s.loadingText}>{t('loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <Toast
        visible={toast.visible} type="success" title={toast.title} message={toast.message}
        onHide={() => setToast(t => ({ ...t, visible: false }))}
        onPress={() => { setToast(t => ({ ...t, visible: false })); navigation.navigate('Cart'); }}
      />

      {/* Header */}
      <View style={[s.header, { paddingHorizontal: isSmallScreen ? 12 : 16 }]}>
        <View style={s.headerLeft} />
        <Text style={s.headerTitle}>{t('menu_title')}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity style={s.headerBtn} onPress={() => navigation.navigate('ScanQR', { scanType: 'table' })}>
            <QrCode size={isSmallScreen ? 17 : 20} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={s.headerBtn} onPress={() => navigation.navigate('Cart')}>
            <ShoppingBag size={isSmallScreen ? 17 : 20} color={COLORS.primary} />
            {totalItems > 0 && (
              <View style={s.badge}>
                <Text style={s.badgeText} adjustsFontSizeToFit numberOfLines={1}>{totalItems > 9 ? '9+' : totalItems}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Active Table Banner */}
      {activeTable && (
        <View style={s.activeBanner}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary, marginRight: 8 }} />
            <Text style={s.activeBannerText} numberOfLines={1}>
              Đang gọi món tại: {activeTable.name || activeTable.qrToken}
            </Text>
          </View>
          <TouchableOpacity style={s.activeBannerBtn} onPress={clearActiveTable}>
            <Text style={s.activeBannerBtnText}>Hủy chọn</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Search */}
      <View style={[s.searchRow, { paddingHorizontal: isSmallScreen ? 12 : 16 }]}>
        <View style={s.searchInputWrap}>
          <Search size={17} color="#9CA3AF" />
          <TextInput
            style={s.searchInput} value={searchText} onChangeText={setSearchText}
            placeholder={t('search_placeholder')} placeholderTextColor="#9CA3AF"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}><X size={16} color="#9CA3AF" /></TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Bar */}
      <View style={s.catBar}>
        <FlatList
          ref={categoryListRef}
          data={allCats}
          renderItem={({ item }) => {
            const isActive = item.id === activeCategory || (item.id === 'all' && activeCategory === 'all');
            return (
              <TouchableOpacity
                style={[s.catChip, isActive && s.catChipActive, { paddingHorizontal: isSmallScreen ? 12 : 16 }]}
                onPress={() => handleCategoryPress(item.id)}
              >
                {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={s.catIcon} />}
                <Text style={[s.catText, isActive && s.catTextActive]} numberOfLines={1}>{item.name}</Text>
              </TouchableOpacity>
            );
          }}
          keyExtractor={item => item.id.toString()}
          horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.catScroll}
        />
      </View>

      {/* Product List */}
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
            const cartQty = items.filter(ci => Number(ci.id) === Number(item.id)).reduce((sum, ci) => sum + ci.quantity, 0);
            return (
              <View style={{ paddingHorizontal: 16, paddingTop: 4 }}>
                <ProductCardHorizontal
                  product={item}
                  onPress={() => { setSelectedProduct(item); setIsModalVisible(true); }}
                  onAddPress={() => handleAddToCart(item)}
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
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={COLORS.primary} />
          }
        />
      )}

      <ProductModal visible={isModalVisible} product={selectedProduct} onClose={() => setIsModalVisible(false)} onAddToCart={handleAddToCart} />
      <ReceiptModal visible={isReceiptVisible} onClose={() => setIsReceiptVisible(false)} order={receiptOrder} title="PHIẾU XEM TRƯỚC MÓN" />
    </SafeAreaView>
  );
};

export default MenuScreen;
