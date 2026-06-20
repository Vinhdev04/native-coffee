import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, TouchableOpacity,
  StatusBar, SectionList,
  ActivityIndicator, TextInput, FlatList, Image,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '@/styles/theme';
import { useTranslation } from 'react-i18next';
import { Search, ShoppingBag, X, QrCode, LayoutGrid } from 'lucide-react-native';
import { fetchCategories, fetchProducts } from '@/services/productService';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import Toast from '@/components/common/Toast';
import ProductCardHorizontal from '@/components/home/ProductCardHorizontal';
import ProductModal from '@/components/menu/ProductModal';
import ReceiptModal from '@/components/common/ReceiptModal';
import { s, sh } from '../styles/HomeScreen.styles';

const SectionHeader = ({ title }: { title: string }) => (
  <View style={sh.wrap}>
    <Text style={sh.title}>{title}</Text>
  </View>
);

const HomeScreen = () => {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 360;

  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { items, totalItems, addToCart, updateQuantity, activeTable, clearActiveTable } = useCart();
  const { user } = useAuth();
  const branchId = user?.branchId || (user as any)?.branchId || (user as any)?.branch_id || 1;

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
        fetchCategories({ branchId }),
        fetchProducts({ branchId, limit: 100 }),
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
        ? [{ catId: 'search', title: `${t('search_results_for')} "${searchText}"`, data: matched }]
        : [];
    }
    return categories
      .map(cat => ({ catId: cat.id, title: cat.name, data: allProducts.filter(p => p.categoryId === cat.id) }))
      .filter(s => s.data.length > 0);
  }, [categories, allProducts, searchText]);

  const allCats = useMemo(() => [{ id: 'all', name: t('all') }, ...categories], [categories, t]);

  const handleCatPress = useCallback((catId: number | 'all') => {
    setActiveCatId(catId);
    if (catId === 'all') {
      sectionListRef.current?.scrollToLocation({ sectionIndex: 0, itemIndex: 0, animated: true, viewOffset: 0 });
      return;
    }
    const idx = sections.findIndex(s => s.catId === catId);
    if (idx >= 0) {
      isScrollingFromPress.current = true;
      try { sectionListRef.current?.scrollToLocation({ sectionIndex: idx, itemIndex: 0, animated: true, viewOffset: 0 }); } catch {}
      setTimeout(() => { isScrollingFromPress.current = false; }, 800);
    }
  }, [sections]);

  const scrollCatBarToActive = useCallback((catId: number | 'all') => {
    const idx = allCats.findIndex(c => c.id === catId);
    if (idx >= 0) catBarRef.current?.scrollToIndex({ index: idx, animated: true, viewPosition: 0.3 });
  }, [allCats]);

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (isScrollingFromPress.current || searchText) return;
    if (viewableItems.length > 0) {
      const catId = viewableItems[0].section?.catId;
      if (catId && catId !== activeCatId) { setActiveCatId(catId); scrollCatBarToActive(catId); }
    }
  }, [activeCatId, searchText, scrollCatBarToActive]);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 20 });

  const handleAddToCart = (item: any) => {
    addToCart(item);
    setToast({ visible: true, title: t('added_to_cart'), msg: `${item.name}. ${t('tap_to_view_cart')}` });
  };

  return (
    <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <Toast
        visible={toast.visible} type="success"
        title={toast.title} message={toast.msg}
        onHide={() => setToast(t => ({ ...t, visible: false }))}
        onPress={() => { setToast(t => ({ ...t, visible: false })); navigation.navigate('Cart'); }}
      />

      {/* Header */}
      <View style={[s.topBar, { paddingHorizontal: isSmallScreen ? 12 : 16 }]}>
        <View style={s.headerLeft}>
          <Image source={require('@/assets/images/logo.png')} style={s.headerLogo} resizeMode="contain" />
        </View>
        <View style={s.headerRight}>
          <TouchableOpacity style={s.headerBtn} onPress={() => navigation.navigate('TableList')}>
            <LayoutGrid size={isSmallScreen ? 17 : 20} color={COLORS.primary} />
          </TouchableOpacity>
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
            <View style={s.activeBannerDot} />
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
      <View style={[s.searchSection, { paddingHorizontal: isSmallScreen ? 12 : 16, paddingTop: 10 }]}>
        <View style={s.searchBar}>
          <Search size={18} color="#9CA3AF" />
          <TextInput
            style={s.searchInput}
            placeholder={t('search_placeholder')}
            placeholderTextColor="#9CA3AF"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}><X size={16} color="#9CA3AF" /></TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Bar */}
      {!searchText && (
        <View style={s.catBar}>
          <FlatList
            ref={catBarRef}
            data={allCats}
            keyExtractor={i => i.id.toString()}
            horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
            onScrollToIndexFailed={() => {}}
            renderItem={({ item }) => {
              const isActive = item.id === activeCatId || (item.id === 'all' && activeCatId === 'all');
              return (
                <TouchableOpacity
                  style={[s.catChip, isActive && s.catChipActive, { paddingHorizontal: isSmallScreen ? 12 : 16 }]}
                  onPress={() => handleCatPress(item.id as any)}
                >
                  <Text style={[s.catText, isActive && s.catTextActive]}>{item.name}</Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      )}

      {/* Products */}
      {loading ? (
        <View style={s.loadingWrap}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={s.loadingText}>{t('loading')}</Text>
        </View>
      ) : sections.length === 0 && searchText ? (
        <View style={s.emptyWrap}>
          <Text style={s.emptyIcon}>🔍</Text>
          <Text style={s.emptyTitle}>{t('no_products_found_for')} "{searchText}"</Text>
          <Text style={s.emptyText}>{t('try_another_search')}</Text>
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
              .filter(ci => Number(ci.id) === Number(item.id))
              .reduce((sum, ci) => sum + ci.quantity, 0);
            return (
              <View style={{ paddingHorizontal: 16, paddingTop: 4 }}>
                <ProductCardHorizontal
                  product={item} searchText={searchText} cartQuantity={cartQty}
                  onPress={() => { setSelectedProduct(item); setIsModalVisible(true); }}
                  onAddPress={() => handleAddToCart(item)}
                  onMinusPress={() => {
                    const cartItem = items.find(i => Number(i.id) === Number(item.id));
                    if (cartItem) updateQuantity(cartItem.cartId, cartItem.quantity - 1);
                  }}
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
      <ReceiptModal visible={isReceiptVisible} onClose={() => setIsReceiptVisible(false)} order={receiptOrder} title={t('preview_receipt_title')} />
    </SafeAreaView>
  );
};

export default HomeScreen;
