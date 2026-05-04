/**
 * @file HomeScreen.tsx
 * @desc Màn hình chính (Dashboard) — hiển thị banner khuyến mãi,
 *       sản phẩm nổi bật và danh mục sản phẩm nhanh.
 * @layer pages/home
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, 
  SafeAreaView, StatusBar, SectionList, FlatList,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '@/context/CartContext';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '@/styles/theme';
import { MapPin, ChevronDown, Bell, Search } from 'lucide-react-native';
import { fetchCategories, fetchProducts } from '@/services/productService';

import CategoryItem from '@/components/home/CategoryItem';
import ProductCardHorizontal from '@/components/home/ProductCardHorizontal';
import HomeSkeleton from '@/components/home/HomeSkeleton';

const HomeScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const { totalItems, addToCart } = useCart();

  const [categories, setCategories] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  
  const sectionListRef = useRef<SectionList>(null);
  const categoryListRef = useRef<FlatList>(null);
  const isAutoScrolling = useRef(false);

  useEffect(() => {
    loadData();
  }, []);

  const getCategoryIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('cà phê') || n.includes('coffee')) return 'https://cdn-icons-png.flaticon.com/512/924/924514.png';
    if (n.includes('trà sữa') || n.includes('milk tea')) return 'https://cdn-icons-png.flaticon.com/512/3029/3029337.png';
    if (n.includes('nước ngọt') || n.includes('soda')) return 'https://cdn-icons-png.flaticon.com/512/2722/2722527.png';
    if (n.includes('matcha')) return 'https://cdn-icons-png.flaticon.com/512/9355/9355646.png';
    return 'https://cdn-icons-png.flaticon.com/512/3121/3121768.png'; // Default
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [catRes, prodRes] = await Promise.all([
        fetchCategories({ branchId: 1 }),
        fetchProducts({ branchId: 1, limit: 100 })
      ]);

      const catData = catRes.data?.rows || catRes.data || [];
      const prodData = prodRes.data?.rows || prodRes.data || [];

      console.log('--- DEBUG CATEGORIES ---', JSON.stringify(catData[0], null, 2));
      console.log('--- DEBUG PRODUCTS ---', JSON.stringify(prodData[0], null, 2));

      setCategories(catData);
      
      const newSections = catData.map((cat: any) => ({
        id: cat.id,
        title: cat.name,
        data: prodData.filter((p: any) => p.categoryId === cat.id)
      })).filter((section: any) => section.data.length > 0);

      setSections(newSections);
      if (catData.length > 0) setActiveCategoryId(catData[0].id);
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const onEndReached = () => {
    // Không làm gì vì BE không hỗ trợ phân trang qua tham số page
  };

  const onCategoryPress = (categoryId: number, index: number) => {
    isAutoScrolling.current = true;
    setActiveCategoryId(categoryId);
    
    // Find section index
    const sectionIndex = sections.findIndex(s => s.id === categoryId);
    if (sectionIndex !== -1) {
      sectionListRef.current?.scrollToLocation({
        sectionIndex,
        itemIndex: 0,
        animated: true,
        viewOffset: 0
      });
    }

    // Auto scroll category list
    categoryListRef.current?.scrollToIndex({
      index,
      animated: true,
      viewPosition: 0.5
    });

    setTimeout(() => {
      isAutoScrolling.current = false;
    }, 1000);
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (isAutoScrolling.current || viewableItems.length === 0) return;

    const topSection = viewableItems[0].section;
    if (topSection && topSection.id !== activeCategoryId) {
      setActiveCategoryId(topSection.id);
      
      // Sync category list
      const catIndex = categories.findIndex(c => c.id === topSection.id);
      if (catIndex !== -1) {
        categoryListRef.current?.scrollToIndex({
          index: catIndex,
          animated: true,
          viewPosition: 0.5
        });
      }
    }
  }).current;

  if (loading) {
    return (
      <SafeAreaView style={s.container}>
        <HomeSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={s.topBar}>
        <View style={s.locationContainer}>
          <MapPin size={16} color={COLORS.accent} />
          <View style={s.locationTextContainer}>
            <Text style={s.deliveryLabel}>Giao đến • Bây giờ</Text>
            <Text style={s.locationText} numberOfLines={1}>123 Đường Cà Phê, Quận 1, TP.HCM</Text>
          </View>
          <ChevronDown size={16} color={COLORS.textPrimary} />
        </View>
        <TouchableOpacity style={s.iconBtn}>
          <Bell size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Sticky Categories */}
      <View style={s.categorySticky}>
        <FlatList
          ref={categoryListRef}
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={s.catList}
          renderItem={({ item, index }) => (
            <CategoryItem
              name={item.name}
              image={item.imageUrl || item.image || getCategoryIcon(item.name)}
              isActive={activeCategoryId === item.id}
              onPress={() => onCategoryPress(item.id, index)}
            />
          )}
        />
      </View>

      {/* Product List */}
      <SectionList
        ref={sectionListRef}
        sections={sections}
        keyExtractor={(item) => item.id.toString()}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={s.sectionTitle}>{title}</Text>
        )}
        renderItem={({ item }) => (
          <ProductCardHorizontal
            product={item}
            onPress={() => navigation.navigate('ProductDetail', { product: item })}
            onAddPress={() => addToCart(item)}
          />
        )}
        ListHeaderComponent={() => (
          <View style={s.searchContainer}>
            <TouchableOpacity style={s.searchBar} activeOpacity={0.9}>
              <Search size={20} color={COLORS.textMuted} />
              <Text style={s.placeholderText}>Tìm kiếm món ngon...</Text>
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={<View style={s.bottomSpacer} />}
        contentContainerStyle={s.listContent}
      />

      {/* Floating Cart Pill */}
      {totalItems > 0 && (
        <TouchableOpacity style={s.floatingCart} onPress={() => navigation.navigate('Cart')}>
          <View style={s.cartInfo}>
            <View style={s.cartCount}>
              <Text style={s.cartCountText}>{totalItems}</Text>
            </View>
            <Text style={s.cartTotalText}>Xem giỏ hàng</Text>
          </View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15, backgroundColor: COLORS.white },
  locationContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  locationTextContainer: { flex: 1 },
  deliveryLabel: { fontFamily: FONTS.medium, fontSize: 12, color: COLORS.textMuted },
  locationText: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.textPrimary },
  iconBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.backgroundSecondary, borderRadius: 12 },
  
  categorySticky: { backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight, paddingBottom: 10 },
  catList: { paddingHorizontal: 20, paddingTop: 15 },
  
  searchContainer: { paddingHorizontal: 20, marginVertical: 15 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.backgroundSecondary, borderRadius: 12, paddingHorizontal: 15, height: 45, gap: 10 },
  placeholderText: { fontFamily: FONTS.regular, fontSize: 14, color: COLORS.textMuted },

  listContent: { paddingHorizontal: 20 },
  sectionTitle: { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.textPrimary, marginTop: 20, marginBottom: 15 },
  
  floatingCart: { position: 'absolute', bottom: 30, left: 20, right: 20, height: 56, backgroundColor: COLORS.primary, borderRadius: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, elevation: 8 },
  cartInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  cartCount: { width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center' },
  cartCountText: { fontFamily: FONTS.bold, fontSize: 12, color: COLORS.primary },
  cartTotalText: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.white },
  
  bottomSpacer: { height: 100 },
});

export default HomeScreen;
