import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  StatusBar, ScrollView, Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { COLORS, FONTS } from '@/styles/theme';
import { formatCurrency } from '@/utils';
import { useCart } from '@/context/CartContext';
import { fetchAttributes } from '@/services/productService';
import {
  ChevronLeft, Star, Minus, Plus, ShoppingBag, Heart,
} from 'lucide-react-native';
import Toast from '@/components/common/Toast';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ProductDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { addToCart } = useCart();
  const { product } = route.params;

  const [quantity, setQuantity] = useState(1);
  const [selectedAttributes, setSelectedAttributes] = useState<any[]>([]);
  const [isFavorited, setIsFavorited] = useState(false);
  const [toast, setToast] = useState({ visible: false, type: 'success' as 'success' | 'error' | 'info', title: '', message: '' });
  const [attributeGroups, setAttributeGroups] = useState<Record<number, string>>({});
  const [loadingAttr, setLoadingAttr] = useState(false);

  useEffect(() => {
    const loadAttributes = async () => {
      try {
        setLoadingAttr(true);
        const res = await fetchAttributes();
        const data = res.data?.rows || res.data || [];
        const mapping: Record<number, string> = {};
        data.forEach((a: any) => {
          mapping[a.id] = a.name;
        });
        setAttributeGroups(mapping);
      } catch (err) {
        console.error('[ProductDetail] fetch attributes error:', err);
      } finally {
        setLoadingAttr(false);
      }
    };
    loadAttributes();
  }, []);

  const attributes = product.productAttributes || [];

  /* Group attributes by their group (attributeId) */
  const groupedAttributes = React.useMemo(() => {
    const groups: Record<number, any[]> = {};
    attributes.forEach((attr: any) => {
      const gid = attr.attributeId || 0;
      if (!groups[gid]) groups[gid] = [];
      groups[gid].push(attr);
    });
    return groups;
  }, [attributes]);

  const toggleAttribute = (attr: any) => {
    if (selectedAttributes.find((a) => a.id === attr.id)) {
      setSelectedAttributes(selectedAttributes.filter((a) => a.id !== attr.id));
    } else {
      setSelectedAttributes([...selectedAttributes, attr]);
    }
  };

  const extraPrice = selectedAttributes.reduce((sum, attr) => sum + (Number(attr.priceDelta) || 0), 0);
  const basePrice  = Number(product.basePrice) || Number(product.price) || 0;
  const totalPrice = (basePrice + extraPrice) * quantity;

  const handleAddToCart = () => {
    addToCart({ ...product, quantity, selectedAttributes, totalPrice: basePrice + extraPrice });
    setToast({
      visible: true,
      type: 'success',
      title: 'Đã thêm vào giỏ hàng! 🎉',
      message: `${quantity} x ${product.name}`,
    });
    setTimeout(() => navigation.goBack(), 1500);
  };

  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=800&q=80';

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Toast */}
      <Toast
        visible={toast.visible}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onHide={() => setToast(t => ({ ...t, visible: false }))}
      />

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Hero Image */}
        <View style={s.heroContainer}>
          <Image
            source={{ uri: product.imageUrl || product.image || FALLBACK_IMAGE }}
            style={s.heroImage}
            resizeMode="cover"
          />
          {/* Overlay gradient effect */}
          <View style={s.heroOverlay} />

          {/* Back button */}
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <ChevronLeft size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>

          {/* Favorite button */}
          <TouchableOpacity style={s.favBtn} onPress={() => setIsFavorited(!isFavorited)}>
            <Heart size={20} color={isFavorited ? '#EF4444' : COLORS.textPrimary} fill={isFavorited ? '#EF4444' : 'transparent'} />
          </TouchableOpacity>
        </View>

        {/* Info Card */}
        <View style={s.infoCard}>
          {/* Product name + price row */}
          <View style={s.titleRow}>
            <Text style={s.productName}>{product.name}</Text>
            <Text style={s.productPrice}>{formatCurrency(basePrice)}</Text>
          </View>

          {/* Rating */}
          <View style={s.ratingRow}>
            {[1,2,3,4,5].map(i => (
              <Star key={i} size={14} color="#F59E0B" fill="#F59E0B" />
            ))}
            <Text style={s.ratingText}>4.8  •  120+ đánh giá</Text>
          </View>

          {/* Description */}
          <Text style={s.description}>
            {product.description ||
              'Hương vị thức uống nguyên bản được pha chế từ nguyên liệu tươi ngon, mang đến trải nghiệm sảng khoái và đầy hương vị.'}
          </Text>

          {/* Divider */}
          <View style={s.divider} />

          {/* Grouped Attributes */}
          {Object.entries(groupedAttributes).map(([gid, items]) => {
            const groupName = attributeGroups[Number(gid)] || 'Tùy chọn';
            return (
              <View key={gid} style={s.section}>
                <Text style={s.sectionTitle}>{groupName}</Text>
                <View style={s.chipRow}>
                  {items.map((attr: any) => {
                    const isActive = !!selectedAttributes.find((a) => a.id === attr.id);
                    return (
                      <TouchableOpacity
                        key={attr.id}
                        style={[s.chip, isActive && s.chipActive]}
                        onPress={() => toggleAttribute(attr)}
                      >
                        <Text style={[s.chipText, isActive && s.chipTextActive]}>
                          {attr.name}
                        </Text>
                        {attr.priceDelta > 0 && (
                          <Text style={[s.chipPrice, isActive && s.chipTextActive]}>
                            {' '}+{formatCurrency(attr.priceDelta)}
                          </Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
          })}

          <View style={s.divider} />

          {/* Quantity */}
          <View style={s.qtySection}>
            <Text style={s.sectionTitle}>Số lượng</Text>
            <View style={s.qtyControls}>
              <TouchableOpacity
                style={[s.qtyBtn, quantity <= 1 && s.qtyBtnDisabled]}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus size={16} color={quantity > 1 ? COLORS.primary : '#D1D5DB'} />
              </TouchableOpacity>
              <Text style={s.qtyText}>{quantity}</Text>
              <TouchableOpacity style={s.qtyBtn} onPress={() => setQuantity(quantity + 1)}>
                <Plus size={16} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={s.divider} />
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <SafeAreaView style={s.footer} edges={['bottom', 'left', 'right']}>
        <View style={s.footerContent}>
          <View style={s.totalBlock}>
            <Text style={s.totalLabel}>Tổng cộng</Text>
            <Text style={s.totalPrice}>{formatCurrency(totalPrice)}</Text>
          </View>
          <TouchableOpacity style={s.addBtn} onPress={handleAddToCart}>
            <ShoppingBag size={18} color={COLORS.white} />
            <Text style={s.addBtnText}>Thêm vào giỏ</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.white },

  heroContainer: { width: SCREEN_WIDTH, height: SCREEN_WIDTH * 0.85, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 55 : 45,
    left: 16,
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.92)',
    justifyContent: 'center', alignItems: 'center',
  },
  favBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 55 : 45,
    right: 16,
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.92)',
    justifyContent: 'center', alignItems: 'center',
  },

  infoCard: {
    marginTop: -24,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  productName: { fontFamily: FONTS.bold, fontSize: 24, color: COLORS.textPrimary, flex: 1, marginRight: 12 },
  productPrice: { fontFamily: FONTS.bold, fontSize: 22, color: COLORS.primary },

  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 16 },
  ratingText: { fontFamily: FONTS.medium, fontSize: 13, color: COLORS.textMuted, marginLeft: 4 },

  description: {
    fontFamily: FONTS.regular, fontSize: 14,
    color: COLORS.textSecondary, lineHeight: 22,
    marginBottom: 24,
  },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginBottom: 22 },

  section: { marginBottom: 22 },
  sectionTitle: { fontFamily: FONTS.semiBold, fontSize: 15, color: COLORS.textPrimary, marginBottom: 14 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    flexDirection: 'row',
    paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 20, borderWidth: 1.5, borderColor: '#E5E7EB',
    backgroundColor: '#FAFAFA',
  },
  chipActive: { borderColor: COLORS.primary, backgroundColor: '#FFF7ED' },
  chipText: { fontFamily: FONTS.medium, fontSize: 13, color: COLORS.textSecondary },
  chipPrice: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textMuted },
  chipTextActive: { color: COLORS.primary },

  qtySection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  qtyControls: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 50, borderWidth: 1, borderColor: '#E5E7EB',
    paddingHorizontal: 4, paddingVertical: 4, gap: 4,
  },
  qtyBtn: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  qtyBtnDisabled: { borderColor: '#F3F4F6' },
  qtyText: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.textPrimary, paddingHorizontal: 10, minWidth: 30, textAlign: 'center' },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: 1, borderTopColor: '#F3F4F6',
  },
  footerContent: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14, gap: 20,
  },
  totalBlock: {},
  totalLabel: { fontFamily: FONTS.regular, fontSize: 11, color: COLORS.textMuted, marginBottom: 2 },
  totalPrice: { fontFamily: FONTS.bold, fontSize: 20, color: COLORS.textPrimary },
  addBtn: {
    flex: 1, height: 54, borderRadius: 18,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center', gap: 10,
  },
  addBtnText: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.white },
});

export default ProductDetailScreen;
