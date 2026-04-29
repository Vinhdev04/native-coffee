/**
 * @file MenuScreen.tsx
 * @desc Màn hình thực đơn — danh sách sản phẩm phân loại theo category,
 *       hỗ trợ tìm kiếm và thêm sản phẩm vào giỏ hàng.
 * @layer pages/menu
 */

import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput,
  TouchableOpacity, StyleSheet, Image,
  ActivityIndicator, RefreshControl, SafeAreaView,
} from 'react-native';
import { useTranslation }      from 'react-i18next';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '@/styles/theme';
import { useDebounce }         from '@/hooks/useDebounce';
import { mockProducts, mockCategories } from '@/data/mockData';
import { formatCurrency }      from '@/utils';
import { useCart }             from '@/context/CartContext';
import { 
  Search, 
  X, 
  Plus, 
  ShoppingBag, 
  Coffee as CoffeeIcon,
  Filter
} from 'lucide-react-native';

interface Product {
  id:          string;
  name:        string;
  categoryId:  string;
  category:    string;
  price:       number;
  description: string;
  image:       string;
  isBestSeller?: boolean;
}

const MenuScreen = () => {
  const { t } = useTranslation();
  const { dispatch, totalItems } = useCart();

  const [searchText,       setSearchText]       = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshing,       setRefreshing]        = useState(false);

  const debouncedSearch = useDebounce(searchText, 400);

  // Filter products
  const filtered = mockProducts.filter((p) => {
    const matchCat    = selectedCategory === 'all' || p.categoryId === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(debouncedSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleAddToCart = (product: Product) => {
    dispatch({
      type: 'ADD_ITEM',
      item: {
        cartId:    `${product.id}_M_100%_`,
        id:        product.id,
        name:      product.name,
        price:     product.price,
        image:     product.image,
        quantity:  1,
        size:      'M',
        sweetness: '100%',
        toppings:  [],
      },
    });
  };

  const renderCategory = ({ item }: { item: typeof mockCategories[0] }) => (
    <TouchableOpacity
      style={[styles.catChip, selectedCategory === item.id && styles.catChipActive]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Text style={[styles.catChipText, selectedCategory === item.id && styles.catChipTextActive]}>
        {item.icon} {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <Image source={{ uri: item.image }} style={styles.productImage} resizeMode="cover" />
      {item.isBestSeller && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>⭐ Best</Text>
        </View>
      )}
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.productDesc} numberOfLines={1}>{item.description}</Text>
        <View style={styles.productBottom}>
          <Text style={styles.productPrice}>{formatCurrency(item.price)}</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => handleAddToCart(item)}>
            <Plus size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('menu.title')}</Text>
        <TouchableOpacity style={styles.cartBtn}>
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
      <FlatList
        data={mockCategories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
      />

      {/* Products Grid */}
      <FlatList
        data={filtered}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
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
  catChip:       { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, backgroundColor: COLORS.white, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  catChipActive: { backgroundColor: COLORS.primary },
  catChipText:   { fontFamily: FONTS.medium, fontSize: 14, color: COLORS.textSecondary },
  catChipTextActive: { color: COLORS.white },
  productList:   { paddingHorizontal: 12, paddingBottom: 100 },
  productRow:    { justifyContent: 'space-between', paddingHorizontal: 8, marginBottom: 16 },
  productCard:   { width: '48%', backgroundColor: COLORS.white, borderRadius: 20, overflow: 'hidden', elevation: 4, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8 },
  productImage:  { width: '100%', height: 150 },
  badge:         { position: 'absolute', top: 10, left: 10, backgroundColor: COLORS.gold, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, elevation: 2 },
  badgeText:     { fontFamily: FONTS.bold, fontSize: 10, color: COLORS.white },
  productInfo:   { padding: 12 },
  productName:   { fontFamily: FONTS.semiBold, fontSize: 14, color: COLORS.textPrimary, marginBottom: 4 },
  productDesc:   { fontFamily: FONTS.regular, fontSize: 11, color: COLORS.textMuted, marginBottom: 12 },
  productBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  productPrice:  { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.accent },
  addBtn:        { width: 36, height: 36, borderRadius: 12, backgroundColor: COLORS.accent, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  emptyContainer: { alignItems: 'center', paddingTop: 100, opacity: 0.5 },
  emptyText:     { fontFamily: FONTS.regular, fontSize: 16, color: COLORS.textMuted, marginTop: 16 },
});

export default MenuScreen;
