import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, TextInput, FlatList, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS } from '@/styles/theme';
import { ArrowLeft, Search, SlidersHorizontal, Star, ShieldCheck, ChevronDown, ArrowRight } from 'lucide-react-native';
import FilterBottomSheet from '@/components/FilterBottomSheet';

const VendorListScreen = () => {
  const navigation = useNavigation();
  const [filterVisible, setFilterVisible] = useState(false);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Fallback: Using mock data since we might not have a full branch API populated
      // Real app: await fetchBranches()
      console.warn("No data for [VendorList] from API. Using mock data for UI.");
      setVendors([
        {
          id: 1,
          name: 'Cà Phê Muối Chú Long - Trần Hư...',
          rating: '4.7',
          reviews: '715',
          distance: '6.2 km',
          time: '31 phút trở lên',
          image: 'https://cdn.tgdd.vn/Files/2021/08/10/1374187/tim-hieu-ve-ca-phe-muoi-cach-pha-ca-phe-muoi-chuan-vi-xu-hue-202108101037599763.jpg',
          promos: ['Giảm 15.000đ', 'Giảm 22.000đ'],
        },
        {
          id: 2,
          name: 'Jollibee',
          rating: '4.6',
          reviews: '1K+',
          distance: '2.3 km',
          time: '19 phút trở lên',
          image: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/84/Jollibee_2011_logo.svg/1200px-Jollibee_2011_logo.svg.png',
          promos: ['Giảm 14.000đ', 'Giảm 15.000đ'],
        },
        {
          id: 3,
          name: 'CHÁO LÒNG A CƯỜNG 54G',
          rating: '3.9',
          reviews: '24',
          distance: '2.3 km',
          time: '18 phút trở lên',
          image: 'https://cdn.tgdd.vn/2021/04/CookRecipe/Avatar/chao-long-mien-bac-thumbnail.jpg',
          promos: ['Giảm 13.000đ'],
        }
      ]);
    } catch (error) {
      console.error('Error loading vendors', error);
    } finally {
      setLoading(false);
    }
  };

  const renderVendor = ({ item }: { item: any }) => (
    <TouchableOpacity style={s.vendorCard}>
      <Image source={{ uri: item.image }} style={s.vendorImage} />
      <View style={s.vendorInfo}>
        <Text style={s.vendorName} numberOfLines={1}>{item.name}</Text>
        
        <View style={s.ratingRow}>
          <Star size={14} color={COLORS.gold} fill={COLORS.gold} />
          <Text style={s.ratingText}>{item.rating} ({item.reviews})</Text>
          <Text style={s.dot}>•</Text>
          <Text style={s.timeText}>Đã từng đặt</Text>
        </View>

        <View style={s.deliveryRow}>
           <Text style={s.feeText}>Miễn phí</Text>
           <Text style={s.dot}>•</Text>
           <Text style={s.distanceText}>{item.time}</Text>
        </View>

        <View style={s.shieldRow}>
           <ShieldCheck size={14} color={COLORS.info} />
           <Text style={s.shieldText}>Top Dễ Vàng</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.promoScroll}>
           {item.promos.map((promo: string, index: number) => (
             <View key={index} style={s.promoBadge}>
                <Image source={{uri: 'https://cdn-icons-png.flaticon.com/512/726/726443.png'}} style={s.promoIcon} />
                <View>
                   <Text style={s.promoBadgeTitle}>{promo}</Text>
                   <Text style={s.promoBadgeSub}>Đơn hàng từ...</Text>
                </View>
             </View>
           ))}
        </ScrollView>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={s.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={s.searchContainer}>
          <Search size={20} color={COLORS.textMuted} />
          <TextInput 
            style={s.searchInput}
            placeholder="Bạn đang thèm gì nào?"
            placeholderTextColor={COLORS.textMuted}
          />
        </View>
      </View>

      {/* Filter Chips */}
      <View style={s.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterScroll}>
          <TouchableOpacity style={s.filterChipOutline} onPress={() => setFilterVisible(true)}>
            <SlidersHorizontal size={16} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={s.filterChip} onPress={() => setFilterVisible(true)}>
            <Text style={s.filterChipText}>↑↓ Lọc theo</Text>
            <ChevronDown size={14} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={s.filterChip}>
            <Text style={s.filterChipText}>Dưới 18.000đ</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.filterChip}>
            <Text style={s.filterChipText}>Freeship</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <FlatList
        data={vendors}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderVendor}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={() => (
           <View style={s.flashDealSection}>
              <View style={s.flashDealHeader}>
                 <Text style={s.flashDealTitle}>Ưu đãi chớp nhoáng!</Text>
                 <ArrowRight size={20} color={COLORS.textPrimary} />
              </View>
              <Text style={s.flashDealSub}>Ưu đãi giờ vàng, đặt ngay kẻo lỡ!</Text>
              {/* Add a banner card here if needed */}
              <View style={s.flashDealCard}>
                 {/* Empty state logging already done */}
                 <Text style={{fontFamily: FONTS.medium, color: COLORS.textMuted}}>No data for [Flash Deals]</Text>
              </View>
           </View>
        )}
      />

      <FilterBottomSheet 
        visible={filterVisible} 
        onClose={() => setFilterVisible(false)} 
      />
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backBtn: {
    padding: 5,
    marginRight: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  filterContainer: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  filterScroll: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    gap: 10,
  },
  filterChipOutline: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    paddingHorizontal: 15,
    borderRadius: 18,
    backgroundColor: COLORS.backgroundSecondary,
    gap: 5,
  },
  filterChipText: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  listContent: {
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 40,
  },
  vendorCard: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  vendorImage: {
    width: 90,
    height: 90,
    borderRadius: 8,
    backgroundColor: COLORS.backgroundSecondary,
  },
  vendorInfo: {
    flex: 1,
    marginLeft: 15,
  },
  vendorName: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  dot: {
    color: COLORS.textMuted,
    marginHorizontal: 6,
  },
  timeText: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  feeText: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.primary, // Orange
  },
  distanceText: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  shieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  shieldText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.info,
    marginLeft: 4,
  },
  promoScroll: {
    flexDirection: 'row',
  },
  promoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginRight: 10,
  },
  promoIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
  promoBadgeTitle: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.textPrimary,
  },
  promoBadgeSub: {
    fontFamily: FONTS.regular,
    fontSize: 10,
    color: COLORS.textMuted,
  },
  flashDealSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  flashDealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flashDealTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.textPrimary,
  },
  flashDealSub: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: 15,
  },
  flashDealCard: {
    width: 200,
    height: 120,
    borderRadius: 12,
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default VendorListScreen;
