import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput,
  TouchableOpacity, StyleSheet, Image,
  ActivityIndicator, RefreshControl, SafeAreaView,
} from 'react-native';
import { useTranslation }      from 'react-i18next';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '~/styles/theme';
import { useDebounce }         from '~/hooks/useDebounce';
import { mockProducts, mockCategories } from '~/data/mockData';
import { formatCurrency }      from '~/utils';
import { useCart }             from '~/context/CartContext';

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
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>☕ {t('menu.title')}</Text>
        {totalItems > 0 && (
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{totalItems}</Text>
          </View>
        )}
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
          placeholder={t('menu.search')}
          placeholderTextColor={COLORS.placeholder}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Text style={styles.clearIcon}>✕</Text>
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
            <Text style={styles.emptyIcon}>☕</Text>
            <Text style={styles.emptyText}>Không tìm thấy sản phẩm</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: COLORS.background },
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingTop: SPACING.md, paddingBottom: SPACING.sm },
  headerTitle:   { fontFamily: FONTS.bold, fontSize: 22, color: COLORS.primary },
  cartBadge:     { backgroundColor: COLORS.accent, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  cartBadgeText: { fontFamily: FONTS.bold, fontSize: 12, color: COLORS.white },
  searchWrapper: { flexDirection: 'row', alignItems: 'center', marginHorizontal: SPACING.md, marginBottom: SPACING.sm, backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, borderWidth: 1.5, borderColor: COLORS.border, paddingHorizontal: SPACING.sm, height: 48 },
  searchIcon:    { fontSize: 16, marginRight: 6 },
  searchInput:   { flex: 1, fontFamily: FONTS.regular, fontSize: 14, color: COLORS.textPrimary },
  clearIcon:     { fontSize: 14, color: COLORS.textMuted, paddingHorizontal: 4 },
  categoryList:  { paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm, gap: 8 },
  catChip:       { paddingHorizontal: 14, paddingVertical: 8, borderRadius: BORDER_RADIUS.full, backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: COLORS.border },
  catChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catChipText:   { fontFamily: FONTS.medium, fontSize: 13, color: COLORS.textSecondary },
  catChipTextActive: { color: COLORS.white },
  productList:   { paddingHorizontal: SPACING.sm, paddingBottom: SPACING.xxl },
  productRow:    { justifyContent: 'space-between', paddingHorizontal: SPACING.sm, marginBottom: SPACING.sm },
  productCard:   { width: '48%', backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, overflow: 'hidden', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  productImage:  { width: '100%', height: 140 },
  badge:         { position: 'absolute', top: 8, left: 8, backgroundColor: COLORS.gold, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText:     { fontFamily: FONTS.bold, fontSize: 10, color: COLORS.white },
  productInfo:   { padding: SPACING.sm },
  productName:   { fontFamily: FONTS.semiBold, fontSize: 13, color: COLORS.textPrimary, marginBottom: 4 },
  productDesc:   { fontFamily: FONTS.regular, fontSize: 11, color: COLORS.textMuted, marginBottom: 8 },
  productBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  productPrice:  { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.accent },
  addBtn:        { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.accent, justifyContent: 'center', alignItems: 'center' },
  addBtnText:    { fontFamily: FONTS.bold, fontSize: 20, color: COLORS.white, lineHeight: 22 },
  emptyContainer: { alignItems: 'center', paddingTop: 60 },
  emptyIcon:     { fontSize: 48, marginBottom: 12 },
  emptyText:     { fontFamily: FONTS.regular, fontSize: 15, color: COLORS.textMuted },
});

export default MenuScreen;
