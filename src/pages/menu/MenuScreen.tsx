import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, FlatList, TextInput,
  TouchableOpacity, StyleSheet, Image,
  ActivityIndicator, RefreshControl, SafeAreaView,
} from 'react-native';
import { useTranslation }      from 'react-i18next';
import { useNavigation }       from '@react-navigation/native';
import { COLORS, FONTS, BORDER_RADIUS } from '@/styles/theme';
import { useDebounce }         from '@/hooks/useDebounce';
import { fetchCategories, fetchProducts } from '@/services/productService';
import { formatCurrency }      from '@/utils';
import { useCart }             from '@/context/CartContext';
import { 
  Search, 
  X, 
  Plus, 
  ShoppingBag, 
  Coffee as CoffeeIcon,
} from 'lucide-react-native';

const MenuScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { totalItems, addToCart } = useCart();

  const [categories,       setCategories]       = useState<any[]>([]);
  const [products,         setProducts]         = useState<any[]>([]);
  const [searchText,       setSearchText]       = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [loading,          setLoading]          = useState(true);
  const [refreshing,       setRefreshing]        = useState(false);

  const debouncedSearch = useDebounce(searchText, 400);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [catRes, prodRes] = await Promise.all([
        fetchCategories({ branchId: 1 }),
        fetchProducts({ branchId: 1, limit: 100 })
      ]);
      setCategories(catRes.data?.rows || catRes.data || []);
      setProducts(prodRes.data?.rows || prodRes.data || []);
    } catch (error) {
      console.error('Error loading menu data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Filter products
  const filtered = products.filter((p) => {
    const matchCat    = selectedCategory === 'all' || p.categoryId === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(debouncedSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  const getCategoryIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('cà phê') || n.includes('coffee')) return 'https://cdn-icons-png.flaticon.com/512/924/924514.png';
    if (n.includes('trà sữa') || n.includes('milk tea')) return 'https://cdn-icons-png.flaticon.com/512/3029/3029337.png';
    if (n.includes('nước ngọt') || n.includes('soda')) return 'https://cdn-icons-png.flaticon.com/512/2722/2722527.png';
    if (n.includes('matcha')) return 'https://cdn-icons-png.flaticon.com/512/9355/9355646.png';
    return 'https://cdn-icons-png.flaticon.com/512/3121/3121768.png';
  };

  const renderCategory = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.catChip, selectedCategory === item.id && styles.catChipActive]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <View style={styles.catContent}>
        {item.id !== 'all' && (
          <Image 
            source={{ uri: item.imageUrl || item.image || getCategoryIcon(item.name) }} 
            style={styles.catIcon} 
          />
        )}
        <Text style={[styles.catChipText, selectedCategory === item.id && styles.catChipTextActive]}>
          {item.name}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderProduct = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.productCard} 
      activeOpacity={0.9}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
    >
      <Image 
        source={{ uri: item.imageUrl || item.image || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=300&auto=format&fit=crop' }} 
        style={styles.productImage} 
        resizeMode="cover" 
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.productDesc} numberOfLines={1}>{item.description}</Text>
        <View style={styles.productBottom}>
          <Text style={styles.productPrice}>{formatCurrency(item.basePrice || item.price)}</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => addToCart(item)}>
            <Plus size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const categoriesWithAll = [{ id: 'all', name: 'Tất cả' }, ...categories];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('menu.title')}</Text>
        <TouchableOpacity style={styles.cartBtn} onPress={() => navigation.navigate('Cart')}>
          <ShoppingBag size={24} color={COLORS.primary} />
          {totalItems > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{totalItems}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <Search size={20} color={COLORS.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
          placeholder={t('menu.search')}
          placeholderTextColor={COLORS.placeholder}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <X size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Categories */}
      <View>
        <FlatList
          data={categoriesWithAll}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        />
      </View>

      {/* Products Grid */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.productRow}
          contentContainerStyle={styles.productList}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <CoffeeIcon size={64} color={COLORS.border} />
              <Text style={styles.emptyText}>Không tìm thấy sản phẩm</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: COLORS.background },
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10 },
  headerTitle:   { fontFamily: FONTS.bold, fontSize: 24, color: COLORS.primary },
  cartBtn:       { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  cartBadge:     { position: 'absolute', top: 0, right: 0, backgroundColor: COLORS.accent, borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: COLORS.white },
  cartBadgeText: { fontFamily: FONTS.bold, fontSize: 10, color: COLORS.white },
  searchWrapper: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 16, backgroundColor: COLORS.white, borderRadius: 16, paddingHorizontal: 16, height: 52, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  searchIcon:    { marginRight: 10 },
  searchInput:   { flex: 1, fontFamily: FONTS.regular, fontSize: 15, color: COLORS.textPrimary },
  categoryList:  { paddingHorizontal: 20, paddingBottom: 16, gap: 10 },
  catChip:       { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, backgroundColor: COLORS.white, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, marginRight: 10 },
  catChipActive: { backgroundColor: COLORS.primary },
  catChipText:   { fontFamily: FONTS.medium, fontSize: 14, color: COLORS.textSecondary },
  catChipTextActive: { color: COLORS.white },
  catContent:    { flexDirection: 'row', alignItems: 'center', gap: 6 },
  catIcon:       { width: 20, height: 20, borderRadius: 10 },
  productList:   { paddingHorizontal: 12, paddingBottom: 100 },
  productRow:    { justifyContent: 'space-between', paddingHorizontal: 8, marginBottom: 16 },
  productCard:   { width: '48%', backgroundColor: COLORS.white, borderRadius: 20, overflow: 'hidden', elevation: 4, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8 },
  productImage:  { width: '100%', height: 150 },
  productInfo:   { padding: 12 },
  productName:   { fontFamily: FONTS.semiBold, fontSize: 14, color: COLORS.textPrimary, marginBottom: 4 },
  productDesc:   { fontFamily: FONTS.regular, fontSize: 11, color: COLORS.textMuted, marginBottom: 12 },
  productBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  productPrice:  { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.accent },
  addBtn:        { width: 36, height: 36, borderRadius: 12, backgroundColor: COLORS.accent, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  emptyContainer: { alignItems: 'center', paddingTop: 100, opacity: 0.5 },
  emptyText:     { fontFamily: FONTS.regular, fontSize: 16, color: COLORS.textMuted, marginTop: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default MenuScreen;
