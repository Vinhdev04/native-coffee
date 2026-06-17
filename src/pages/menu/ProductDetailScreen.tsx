import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  StatusBar, ScrollView, Platform,
  Dimensions, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { COLORS, FONTS } from '@/styles/theme';
import { formatCurrency } from '@/utils';
import { useCart } from '@/context/CartContext';
import { fetchAttributes, fetchProductById } from '@/services/productService';
import {
  ChevronLeft, Minus, Plus, ShoppingBag, Heart, CheckCircle2, Circle, CheckSquare, Square
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
  const [fullProduct, setFullProduct] = useState<any>(product);
  const [loadingProduct, setLoadingProduct] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingAttr(true);
        setLoadingProduct(true);
        
        // Lấy cả ánh xạ thuộc tính và thông tin chi tiết đầy đủ của sản phẩm
        const [attrRes, prodRes] = await Promise.all([
          fetchAttributes(),
          fetchProductById(product.id),
        ]);

        // Ánh xạ các thuộc tính toàn cục (ví dụ: id 1 -> "Size")
        const attrData = attrRes.data?.rows || attrRes.data || [];
        const mapping: Record<number, string> = {};
        attrData.forEach((a: any) => {
          mapping[a.id] = a.name;
        });
        setAttributeGroups(mapping);

        // Cập nhật sản phẩm với chi tiết đầy đủ bao gồm productAttributes
        if (prodRes.data) {
          setFullProduct(prodRes.data);
        }
      } catch (err) {
        console.error('[Chi tiết sản phẩm] Lỗi khi tải dữ liệu sản phẩm:', err);
      } finally {
        setLoadingAttr(false);
        setLoadingProduct(false);
      }
    };
    loadData();
  }, [product.id]);

  const attributes = fullProduct.options || fullProduct.productAttributes || [];

  /* Gom nhóm các thuộc tính theo nhóm của chúng (attributeName hoặc attributeId) */
  const groupedAttributes = React.useMemo(() => {
    const groups: Record<string, any[]> = {};
    attributes.forEach((attr: any) => {
      const gid = attr.attributeName || attr.attributeId || 'Tùy chọn';
      if (!groups[gid]) groups[gid] = [];
      groups[gid].push(attr);
    });
    return groups;
  }, [attributes]);

  // Từ khóa nhận diện nhóm TOPPING (chọn nhiều)
  const TOPPING_KEYWORDS = ['topping', 'TOP PING'];
  const isToppingGroup = (name: string) =>
    TOPPING_KEYWORDS.some((kw) => name.toLowerCase().includes(kw.toLowerCase()));

  const getGroupDisplayName = (groupKey: string) => {
    const isNumeric = !isNaN(Number(groupKey));
    return isNumeric && attributeGroups[Number(groupKey)]
      ? attributeGroups[Number(groupKey)]
      : groupKey;
  };

  const toggleAttribute = (attr: any) => {
    const groupKey = attr.attributeId || attr.attributeName || 'Tùy chọn';
    const groupName = getGroupDisplayName(String(groupKey));
    const isTopping = isToppingGroup(groupName);
    const alreadySelected = selectedAttributes.find((a) => a.id === attr.id);

    if (alreadySelected) {
      // Bỏ chọn nếu đã chọn (áp dụng cho cả radio và checkbox)
      setSelectedAttributes(selectedAttributes.filter((a) => a.id !== attr.id));
    } else if (isTopping) {
      // TOPPING: checkbox — chọn nhiều được
      setSelectedAttributes([...selectedAttributes, attr]);
    } else {
      // Các nhóm khác: radio — chỉ chọn 1
      const withoutSameGroup = selectedAttributes.filter((a) => {
        const aGroup = a.attributeId || a.attributeName || 'Tùy chọn';
        return aGroup !== groupKey;
      });
      setSelectedAttributes([...withoutSameGroup, attr]);
    }
  };


  const extraPrice = selectedAttributes.reduce((sum, attr) => sum + (Number(attr.priceDelta) || 0), 0);
  const basePrice  = Number(product.basePrice) || Number(product.price) || 0;
  const totalPrice = (basePrice + extraPrice) * quantity;

  const [note, setNote] = useState('');

  const handleAddToCart = () => {
    addToCart({ ...product, quantity, selectedAttributes, totalPrice: basePrice + extraPrice, note });
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
        {/* Ảnh sản phẩm */}
        <View style={s.heroContainer}>
          <Image
            source={{ uri: product.imageUrl || product.image || FALLBACK_IMAGE }}
            style={s.heroImage}
            resizeMode="cover"
          />
          {/* Hiệu ứng làm mờ đè lên hình ảnh */}
          <View style={s.heroOverlay} />

          {/* Nút quay lại */}
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <ChevronLeft size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>

          {/* Nút yêu thích */}
          <TouchableOpacity style={s.favBtn} onPress={() => setIsFavorited(!isFavorited)}>
            <Heart size={20} color={isFavorited ? '#EF4444' : COLORS.textPrimary} fill={isFavorited ? '#EF4444' : 'transparent'} />
          </TouchableOpacity>
        </View>

        {/* Thẻ thông tin */}
        <View style={s.infoCard}>
          {/* Hàng chứa tên sản phẩm + giá */}
          <View style={s.titleRow}>
            <Text style={s.productName}>{product.name}</Text>
            <Text style={s.productPrice}>{formatCurrency(basePrice)}</Text>
          </View>

          {/* Mô tả sản phẩm */}
          <Text style={s.description}>
            {product.description ||
              'Hương vị thức uống nguyên bản được pha chế từ nguyên liệu tươi ngon, mang đến trải nghiệm sảng khoái và đầy hương vị.'}
          </Text>

          {/* Thanh phân cách */}
          <View style={s.divider} />

          {/* Các thuộc tính đã gom nhóm */}
          {Object.entries(groupedAttributes).map(([groupKey, items]) => {
            const groupName = getGroupDisplayName(groupKey);
            const isTopping = isToppingGroup(groupName);

            return (
              <View key={groupKey} style={s.section}>
                {/* Tiêu đề nhóm thuộc tính kèm nhãn */}
                <View style={s.sectionHeader}>
                  <Text style={s.sectionTitle}>{groupName.toUpperCase()}</Text>
                  {isTopping && (
                    <View style={s.badgeMulti}>
                      <Text style={s.badgeMultiText}>Chọn nhiều</Text>
                    </View>
                  )}
                </View>

                <View style={s.chipRow}>
                  {items.map((attr: any) => {
                    const isActive = !!selectedAttributes.find((a) => a.id === attr.id);
                    return (
                      <TouchableOpacity
                        key={attr.id}
                        style={[
                          s.chip,
                          isActive && (isTopping ? s.chipActiveTopping : s.chipActive),
                        ]}
                        onPress={() => toggleAttribute(attr)}
                        activeOpacity={0.7}
                      >
                        {/* Icon: checkbox cho topping, hình tròn chọn một cho các nhóm khác */}
                        {isTopping ? (
                          isActive ? (
                            <CheckSquare size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
                          ) : (
                            <Square size={16} color="#D1D5DB" style={{ marginRight: 6 }} />
                          )
                        ) : (
                          isActive ? (
                            <CheckCircle2 size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
                          ) : (
                            <Circle size={16} color="#D1D5DB" style={{ marginRight: 6 }} />
                          )
                        )}
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

          {/* Phần ghi chú */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>GHI CHÚ</Text>
            <TextInput
              style={s.noteInput}
              placeholder="Ví dụ: Ít đường, nhiều đá..."
              placeholderTextColor={COLORS.textMuted}
              value={note}
              onChangeText={setNote}
              multiline
            />
          </View>

          {/* Thanh phân cách */}
          <View style={s.divider} />

          {/* Số lượng */}
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

      {/* Nút hành động ở dưới cùng */}
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

  description: {
    fontFamily: FONTS.regular, fontSize: 14,
    color: COLORS.textSecondary, lineHeight: 22,
    marginBottom: 24,
  },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginBottom: 22 },

  section: { marginBottom: 22 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  sectionTitle: { fontFamily: FONTS.semiBold, fontSize: 15, color: COLORS.textPrimary },
  badgeMulti: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  badgeMultiText: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: COLORS.primary,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    flexDirection: 'row',
    paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 20, borderWidth: 1.5, borderColor: '#E5E7EB',
    backgroundColor: '#FAFAFA',
  },
  chipActive: { borderColor: COLORS.primary, backgroundColor: '#FFF7ED' },
  chipActiveTopping: { borderColor: '#10B981', backgroundColor: '#ECFDF5' },
  chipText: { fontFamily: FONTS.medium, fontSize: 13, color: COLORS.textSecondary },
  chipPrice: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textMuted },
  chipTextActive: { color: COLORS.primary },

  noteInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 12,
    fontFamily: FONTS.regular, fontSize: 14, color: COLORS.textPrimary,
    minHeight: 46, textAlignVertical: 'top',
  },

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
