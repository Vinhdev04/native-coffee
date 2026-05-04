import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, 
  SafeAreaView, StatusBar, ScrollView, Image, FlatList, TextInput
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SPACING } from '@/styles/theme';
import { MapPin, ChevronDown, Heart, Search, ClipboardList, ArrowRight, Clock, ArrowLeft } from 'lucide-react-native';
import { fetchCategories, fetchProducts } from '@/services/productService';
import CategoryItem from '@/components/home/CategoryItem';

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [catRes, prodRes] = await Promise.all([
        fetchCategories({ branchId: 1 }),
        fetchProducts({ branchId: 1, limit: 10 })
      ]);
      const catData = catRes.data?.rows || catRes.data || [];
      const prodData = prodRes.data?.rows || prodRes.data || [];
      
      setCategories(catData);
      setProducts(prodData);
      
      if (prodData.length === 0) {
        console.log("No data for [Products/Gần tôi section]");
      }
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderSectionHeader = (title: string, subtitle?: string) => (
    <View style={s.sectionHeader}>
      <View>
        <Text style={s.sectionTitle}>{title}</Text>
        {subtitle && <Text style={s.sectionSubtitle}>{subtitle}</Text>}
      </View>
      <TouchableOpacity>
        <ChevronDown style={{ transform: [{ rotate: '-90deg' }] }} size={20} color={COLORS.textSecondary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={s.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#D8F1F3" />
      <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
        
        {/* Top Header Section with light blue background */}
        <View style={s.topBackground}>
          {/* Header Row */}
          <View style={s.headerRow}>
            <View style={s.locationContainer}>
              <ArrowLeft size={20} color={COLORS.textPrimary} />
              <View style={s.locationTextWrap}>
                <Text style={s.deliveryLabel}>GIAO TỚI</Text>
                <View style={s.locationSelector}>
                  <Text style={s.locationText} numberOfLines={1}>11 Đường E - KP.Nhị Đồng 2</Text>
                  <ChevronDown size={16} color={COLORS.textPrimary} />
                </View>
              </View>
            </View>
            <View style={s.headerActions}>
              <TouchableOpacity style={s.iconBtn}>
                <Heart size={20} color={COLORS.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity style={s.iconBtn}>
                <ClipboardList size={20} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Bar */}
          <View style={s.searchContainer}>
            <Search size={20} color={COLORS.textMuted} />
            <TextInput 
              placeholder="Bạn đang thèm gì nào?"
              placeholderTextColor={COLORS.textMuted}
              style={s.searchInput}
            />
          </View>

          {/* Banner Deal */}
          <View style={s.bannerContainer}>
             <View style={{flex: 1}}>
                <Text style={s.bannerTitle}>Deal Siêu Mát</Text>
                <View style={s.bannerSubtitleWrap}>
                   <Text style={s.bannerSubtitle}>Giảm đến 50% món giải nhiệt</Text>
                   <ArrowRight size={14} color={COLORS.textPrimary} />
                </View>
             </View>
             {/* Note: In real app use an Image, leaving placeholder log if empty */}
             <View style={s.bannerImagePlaceholder} />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={s.actionButtonsRow}>
          <TouchableOpacity style={[s.actionBtn, s.actionBtnActive]}>
            <Image source={{uri: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png'}} style={s.actionIcon} />
            <Text style={s.actionBtnTextActive}>Giao hàng</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.actionBtn}>
            <Image source={{uri: 'https://cdn-icons-png.flaticon.com/512/3233/3233446.png'}} style={s.actionIcon} />
            <Text style={s.actionBtnText}>Đi Ăn Nhà Hàng</Text>
          </TouchableOpacity>
        </View>

        {/* Veggie Promo Banner */}
        <View style={s.veggieBanner}>
          <View style={s.veggieIconPlaceholder}>
            <Image source={{uri: 'https://cdn-icons-png.flaticon.com/512/2917/2917629.png'}} style={{width: 40, height: 40}} />
          </View>
          <View style={{flex: 1, marginLeft: 10}}>
            <Text style={s.veggieTitle}>Bạn theo chế độ ăn chay?</Text>
            <Text style={s.veggieSubtitle}>Thiết lập chế độ ăn uống</Text>
          </View>
        </View>

        {/* Categories */}
        <View style={s.categoriesContainer}>
          <FlatList
            data={categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <CategoryItem
                name={item.name}
                image={item.imageUrl}
                isActive={false}
                onPress={() => {}}
              />
            )}
            ListEmptyComponent={() => {
              console.log("No data for [Categories]");
              return null;
            }}
          />
        </View>

        {/* Sections: Gần tôi, Giải đấu quán đỉnh, Bữa xế */}
        <View style={s.horizontalSectionsContainer}>
           <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.horizontalSectionsPad}>
              {/* Card 1 */}
              <TouchableOpacity style={s.highlightCard}>
                 <View style={s.highlightCardImagePlaceholder}>
                    {products[0]?.imageUrl && <Image source={{uri: products[0].imageUrl}} style={s.highlightImage} />}
                 </View>
                 <Text style={s.highlightCardTitle}>Gần tôi</Text>
                 <Text style={s.highlightCardSub}>Get it quick</Text>
              </TouchableOpacity>
              
              {/* Card 2 */}
              <TouchableOpacity style={s.highlightCard}>
                 <View style={s.highlightCardImagePlaceholder}>
                    {products[1]?.imageUrl && <Image source={{uri: products[1].imageUrl}} style={s.highlightImage} />}
                 </View>
                 <Text style={s.highlightCardTitle}>Giải đấu quán đỉnh</Text>
                 <Text style={s.highlightCardSub}>Giảm đến 50%</Text>
              </TouchableOpacity>

              {/* Card 3 */}
              <TouchableOpacity style={s.highlightCard}>
                 <View style={s.highlightCardImagePlaceholder}>
                    {products[2]?.imageUrl && <Image source={{uri: products[2].imageUrl}} style={s.highlightImage} />}
                 </View>
                 <Text style={s.highlightCardTitle}>Bữa xế</Text>
                 <Text style={s.highlightCardSub}>Quảng cáo</Text>
              </TouchableOpacity>
           </ScrollView>
        </View>

        {/* Đắm chìm vào mĩ vị */}
        <View style={s.promoSection}>
           {renderSectionHeader('Đắm chìm vào mĩ vị')}
           <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginTop: 10}}>
              <View style={s.promoCardBig} />
              <View style={s.promoCardBig} />
           </ScrollView>
        </View>
        <View style={{height: 100}} />
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.white },
  container: { flex: 1, backgroundColor: COLORS.background },
  topBackground: {
    backgroundColor: '#D8F1F3', // Light blue background from screenshot
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 10,
    justifyContent: 'space-between'
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1
  },
  locationTextWrap: {
    flex: 1
  },
  deliveryLabel: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    color: COLORS.textSecondary,
    marginBottom: 2
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  locationText: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    maxWidth: '85%'
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.textPrimary
  },
  bannerContainer: {
    flexDirection: 'row',
    marginHorizontal: 15,
    marginTop: 20,
    alignItems: 'center'
  },
  bannerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.textPrimary,
    marginBottom: 5
  },
  bannerSubtitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  bannerSubtitle: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.textSecondary
  },
  bannerImagePlaceholder: {
    width: 100,
    height: 80,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    marginHorizontal: 15,
    marginTop: 15,
    gap: 10
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2
  },
  actionBtnActive: {
    backgroundColor: '#1E4040', // Dark green matching screenshot
  },
  actionIcon: {
    width: 20,
    height: 20,
    marginRight: 8
  },
  actionBtnTextActive: {
    fontFamily: FONTS.bold,
    color: COLORS.white,
    fontSize: 13
  },
  actionBtnText: {
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    fontSize: 13
  },
  veggieBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
    marginTop: 20,
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2
  },
  veggieIconPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF0E6',
    justifyContent: 'center',
    alignItems: 'center'
  },
  veggieTitle: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.textPrimary,
    marginBottom: 4
  },
  veggieSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textSecondary
  },
  categoriesContainer: {
    marginTop: 25,
    paddingLeft: 15
  },
  horizontalSectionsContainer: {
    marginTop: 25
  },
  horizontalSectionsPad: {
    paddingHorizontal: 15,
    gap: 15
  },
  highlightCard: {
    width: 140,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2
  },
  highlightCardImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.backgroundSecondary,
    marginBottom: 10,
    overflow: 'hidden'
  },
  highlightImage: {
    width: '100%',
    height: '100%'
  },
  highlightCardTitle: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 4
  },
  highlightCardSub: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center'
  },
  promoSection: {
    marginTop: 30,
    paddingHorizontal: 15
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.textPrimary
  },
  sectionSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2
  },
  promoCardBig: {
    width: 280,
    height: 160,
    backgroundColor: '#C82B32', // Red mock
    borderRadius: 16,
    marginRight: 15
  }
});

export default HomeScreen;
