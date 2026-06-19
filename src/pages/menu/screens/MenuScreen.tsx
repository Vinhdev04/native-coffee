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
import { useTheme } from '@/context/ThemeContext';
import { useDebounce } from '@/hooks/useDebounce';
import Toast from '@/components/common/Toast';
import ProductModal from '@/components/menu/ProductModal';
import ProductCardHorizontal from '@/components/home/ProductCardHorizontal';
import ReceiptModal from '@/components/common/ReceiptModal';
import { makeMenuStyles } from '../styles/MenuScreen.styles';

const MenuScreen = () => {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 360;

  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { t } = useTranslation();
  const { colors: c, isDark } = useTheme();
  const styles = useMemo(() => makeMenuStyles(c), [c]);

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
    if (catId === 'all') { sectionListRef.current?.scrollToLocation({ sectionIndex: 0, itemIndex: 0, animated: true, viewPosition: 0 }); return; }
    const idx = sections.findIndex(s => s.catId === catId);
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
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={c.headerBg} />
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={c.primary} />
          <Text style={styles.loadingText}>{t('loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={c.headerBg} />
      <Toast
        visible={toast.visible} type="success" title={toast.title} message={toast.message}
        onHide={() => setToast(t => ({ ...t, visible: false }))}
        onPress={() => { setToast(t => ({ ...t, visible: false })); navigation.navigate('Cart'); }}
      />

      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: isSmallScreen ? 12 : 16 }]}>
        <View style={styles.headerLeft} />
        <Text style={styles.headerTitle}>{t('menu_title')}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.navigate('ScanQR', { scanType: 'table' })}>
            <QrCode size={isSmallScreen ? 17 : 20} color={c.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.navigate('Cart')}>
            <ShoppingBag size={isSmallScreen ? 17 : 20} color={c.primary} />
            {totalItems > 0 && <View style={styles.badge}><Text style={styles.badgeText} adjustsFontSizeToFit numberOfLines={1}>{totalItems > 9 ? '9+' : totalItems}</Text></View>}
          </TouchableOpacity>
        </View>
      </View>

      {/* Active Table Banner */}
      {activeTable && (
        <View style={styles.activeBanner}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF7A00', marginRight: 8 }} />
            <Text style={styles.activeBannerText} numberOfLines={1}>
              Đang gọi món tại: {activeTable.name || activeTable.qrToken}
            </Text>
          </View>
          <TouchableOpacity style={styles.activeBannerBtn} onPress={clearActiveTable}>
            <Text style={styles.activeBannerBtnText}>Hủy chọn</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Search */}
      <View style={[styles.searchRow, { paddingHorizontal: isSmallScreen ? 12 : 16 }]}>
        <View style={styles.searchInputWrap}>
          <Search size={17} color={c.placeholder} />
          <TextInput
            style={styles.searchInput} value={searchText} onChangeText={setSearchText}
            placeholder={t('search_placeholder')} placeholderTextColor={c.placeholder}
          />
          {searchText.length > 0 && <TouchableOpacity onPress={() => setSearchText('')}><X size={16} color={c.placeholder} /></TouchableOpacity>}
        </View>
      </View>

      {/* Category Bar */}
      <View style={styles.catBar}>
        <FlatList
          ref={categoryListRef}
          data={allCats}
          renderItem={({ item }) => {
            const isActive = item.id === activeCategory || (item.id === 'all' && activeCategory === 'all');
            return (
              <TouchableOpacity
                style={[styles.catChip, isActive && styles.catChipActive, { paddingHorizontal: isSmallScreen ? 12 : 16 }]}
                onPress={() => handleCategoryPress(item.id)}
              >
                {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.catIcon} />}
                <Text style={[styles.catText, isActive && styles.catTextActive]} numberOfLines={1}>{item.name}</Text>
              </TouchableOpacity>
            );
          }}
          keyExtractor={item => item.id.toString()}
          horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catScroll}
        />
      </View>

      {/* Product List */}
      {sections.length === 0 ? (
        <View style={styles.emptyWrap}>
          <CoffeeIcon size={52} color={c.border} />
          <Text style={styles.emptyTitle}>{t('no_products_found')}</Text>
        </View>
      ) : (
        <SectionList
          ref={sectionListRef}
          sections={sections}
          keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
          renderItem={({ item }) => {
            const cartQty = items.filter(ci => Number(ci.id) === Number(item.id)).reduce((s, ci) => s + ci.quantity, 0);
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
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.sectionLine} />
            </View>
          )}
          stickySectionHeadersEnabled
          showsVerticalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig.current}
          contentContainerStyle={{ paddingBottom: 100, backgroundColor: c.sectionBg }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={c.primary} />}
        />
      )}

      <ProductModal visible={isModalVisible} product={selectedProduct} onClose={() => setIsModalVisible(false)} onAddToCart={handleAddToCart} />
      <ReceiptModal visible={isReceiptVisible} onClose={() => setIsReceiptVisible(false)} order={receiptOrder} title="PHIẾU XEM TRƯỚC MÓN" />
    </SafeAreaView>
  );
};

export default MenuScreen;
