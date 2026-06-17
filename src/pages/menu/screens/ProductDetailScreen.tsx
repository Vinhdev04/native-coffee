import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, Image,
  StatusBar, ScrollView,
  TextInput, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { COLORS } from '@/styles/theme';
import { formatCurrency } from '@/utils';
import { useCart } from '@/context/CartContext';
import { fetchAttributes, fetchProductById } from '@/services/productService';
import {
  ChevronLeft, Minus, Plus, ShoppingBag, Heart, CheckCircle2, Circle, CheckSquare, Square
} from 'lucide-react-native';
import Toast from '@/components/common/Toast';
import { s } from '../styles/ProductDetailScreen.styles';

const ProductDetailScreen = () => {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 360;
  const contentPadding = isSmallScreen ? 16 : 24;
  const nameSize = isSmallScreen ? 20 : 24;
  const priceSize = isSmallScreen ? 18 : 22;
  const footerGap = isSmallScreen ? 12 : 20;

  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { addToCart } = useCart();
  const { product } = route.params;

  const [quantity, setQuantity] = useState(1);
  const [selectedAttributes, setSelectedAttributes] = useState<any[]>([]);
  const [isFavorited, setIsFavorited] = useState(false);
  const [toast, setToast] = useState({ visible: false, type: 'success' as 'success' | 'error' | 'info', title: '', message: '' });
  const [attributeGroups, setAttributeGroups] = useState<Record<number, string>>({});
  const [note, setNote] = useState('');
  const [fullProduct, setFullProduct] = useState<any>(product);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [attrRes, prodRes] = await Promise.all([
          fetchAttributes(),
          fetchProductById(product.id),
        ]);

        const attrData = attrRes.data?.rows || attrRes.data || [];
        const mapping: Record<number, string> = {};
        attrData.forEach((a: any) => {
          mapping[a.id] = a.name;
        });
        setAttributeGroups(mapping);

        if (prodRes.data) {
          setFullProduct(prodRes.data);
        }
      } catch (err) {
        console.error('[Chi tiết sản phẩm] Lỗi khi tải dữ liệu sản phẩm:', err);
      }
    };
    loadData();
  }, [product.id]);

  const attributes = fullProduct.options || fullProduct.productAttributes || [];

  const groupedAttributes = React.useMemo(() => {
    const groups: Record<string, any[]> = {};
    attributes.forEach((attr: any) => {
      const gid = attr.attributeName || attr.attributeId || 'Tùy chọn';
      if (!groups[gid]) groups[gid] = [];
      groups[gid].push(attr);
    });
    return groups;
  }, [attributes]);

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
      setSelectedAttributes(selectedAttributes.filter((a) => a.id !== attr.id));
    } else if (isTopping) {
      setSelectedAttributes([...selectedAttributes, attr]);
    } else {
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

      <Toast
        visible={toast.visible}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onHide={() => setToast(t => ({ ...t, visible: false }))}
      />

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        <View style={[s.heroContainer, { width: width, height: width * 0.85 }]}>
          <Image
            source={{ uri: product.imageUrl || product.image || FALLBACK_IMAGE }}
            style={s.heroImage}
            resizeMode="cover"
          />
          <View style={s.heroOverlay} />

          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <ChevronLeft size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity style={s.favBtn} onPress={() => setIsFavorited(!isFavorited)}>
            <Heart size={20} color={isFavorited ? '#EF4444' : COLORS.textPrimary} fill={isFavorited ? '#EF4444' : 'transparent'} />
          </TouchableOpacity>
        </View>

        <View style={[s.infoCard, { paddingHorizontal: contentPadding }]}>
          <View style={s.titleRow}>
            <Text style={[s.productName, { fontSize: nameSize }]} numberOfLines={2} adjustsFontSizeToFit>{product.name}</Text>
            <Text style={[s.productPrice, { fontSize: priceSize }]}>{formatCurrency(basePrice)}</Text>
          </View>

          <Text style={s.description}>
            {product.description ||
              'Hương vị thức uống nguyên bản được pha chế từ nguyên liệu tươi ngon, mang đến trải nghiệm sảng khoái và đầy hương vị.'}
          </Text>

          <View style={s.divider} />

          {Object.entries(groupedAttributes).map(([groupKey, items]) => {
            const groupName = getGroupDisplayName(groupKey);
            const isTopping = isToppingGroup(groupName);

            return (
              <View key={groupKey} style={s.section}>
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

          <View style={s.divider} />

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

      <SafeAreaView style={s.footer} edges={['bottom', 'left', 'right']}>
        <View style={[s.footerContent, { gap: footerGap, paddingHorizontal: contentPadding }]}>
          <View style={s.totalBlock}>
            <Text style={s.totalLabel}>Tổng cộng</Text>
            <Text style={s.totalPrice}>{formatCurrency(totalPrice)}</Text>
          </View>
          <TouchableOpacity style={s.addBtn} onPress={handleAddToCart}>
            <ShoppingBag size={18} color={COLORS.white} />
            <Text style={[s.addBtnText, isSmallScreen && { fontSize: 14 }]}>Thêm vào giỏ</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default ProductDetailScreen;
