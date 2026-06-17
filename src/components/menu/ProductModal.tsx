import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  Modal, ScrollView, TextInput, ActivityIndicator,
  Platform, Dimensions
} from 'react-native';
import { X, Minus, Plus, Check } from 'lucide-react-native';
import { COLORS, FONTS } from '@/styles/theme';
import { formatCurrency } from '@/utils';
import { fetchProductById } from '@/services/productService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ProductModalProps {
  visible: boolean;
  product: any;
  onClose: () => void;
  onAddToCart: (item: any) => void;
}

const ProductModal = ({ visible, product, onClose, onAddToCart }: ProductModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedAttributes, setSelectedAttributes] = useState<any[]>([]);
  const [note, setNote] = useState('');
  const [fullProduct, setFullProduct] = useState<any>(product);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && product?.id) {
      setQuantity(1);
      setSelectedAttributes([]);
      setNote('');
      loadProductDetails();
    }
  }, [visible, product?.id]);

  const loadProductDetails = async () => {
    try {
      setLoading(true);
      const res = await fetchProductById(product.id);
      if (res.data) {
        setFullProduct(res.data);
      }
    } catch (err) {
      console.error('[ProductModal] Lỗi khi tải chi tiết sản phẩm:', err);
    } finally {
      setLoading(false);
    }
  };

  const attributes = fullProduct?.options || fullProduct?.productAttributes || [];
  const groupedAttributes = React.useMemo(() => {
    const groups: Record<string, any[]> = {};
    attributes.forEach((attr: any) => {
      const gid = attr.attributeName || attr.attributeId || 'Tùy chọn';
      if (!groups[gid]) groups[gid] = [];
      groups[gid].push(attr);
    });
    return groups;
  }, [attributes]);

  const toggleAttribute = (attr: any, groupName: string) => {
    const groupNameUpper = String(groupName).toUpperCase().trim();
    
    // Kiểm tra xem đó có phải là nhóm chọn một (hành vi Radio)
    // Chúng ta khớp theo từ khóa để xác định các nhóm như Size, Đá, Đường, v.v.
    const singleChoiceKeywords = ['SIZE', 'ĐÁ', 'ICE', 'ĐƯỜNG', 'SUGAR', 'PHÂN LOẠI', 'MỨC', 'MÓN', 'LOẠI', 'KÍCH', 'CHỌN'];
    const isSingleChoice = singleChoiceKeywords.some(kw => groupNameUpper.includes(kw));

    if (isSingleChoice) {
      // If clicking what's already selected, do nothing (maintain selection)
      const isAlreadySelected = selectedAttributes.some(a => a.id === attr.id);
      if (isAlreadySelected) return;

      // Xóa mọi lựa chọn hiện có khỏi CÙNG nhóm (khớp theo groupName)
      const otherGroups = selectedAttributes.filter(a => {
        const aGroupName = (a.attributeName || a.attributeId || 'Tùy chọn').toUpperCase().trim();
        return aGroupName !== groupNameUpper;
      });
      
      setSelectedAttributes([...otherGroups, attr]);
    } else {
      // Chọn nhiều (hành vi Checkbox)
      const isExist = selectedAttributes.find(a => a.id === attr.id);
      if (isExist) {
        setSelectedAttributes(selectedAttributes.filter(a => a.id !== attr.id));
      } else {
        setSelectedAttributes([...selectedAttributes, attr]);
      }
    }
  };

  const extraPrice = selectedAttributes.reduce((sum, attr) => sum + (Number(attr.priceDelta) || 0), 0);
  const basePrice  = Number(product?.basePrice) || Number(product?.price) || 0;
  const unitPrice = basePrice + extraPrice;
  const totalPrice = unitPrice * quantity;

  const handleConfirm = () => {
    onAddToCart({
      ...product,
      quantity,
      selectedAttributes,
      totalPrice: unitPrice,
      note
    });
    onClose();
  };

  if (!product) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.overlay}>
        <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={s.content}>
          <View style={s.handle} />
          
          <View style={s.header}>
            <Text style={s.title}>{product.name}</Text>
            <TouchableOpacity style={s.closeBtn} onPress={onClose}>
              <X size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
            {/* Tóm tắt sản phẩm */}
            <View style={s.summary}>
              <Image 
                source={{ uri: product.imageUrl || product.image }} 
                style={s.image} 
                resizeMode="cover" 
              />
              <View style={s.summaryInfo}>
                <Text style={s.desc} numberOfLines={3}>
                  {product.description || 'Sản phẩm truyền thống với hương vị đậm đà, thơm ngon.'}
                </Text>
                <Text style={s.price}>{formatCurrency(basePrice)}</Text>
              </View>
            </View>

            {loading ? (
              <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 20 }} />
            ) : (
              Object.entries(groupedAttributes).map(([groupName, items], index) => (
                <View key={groupName} style={[s.section, index % 2 !== 0 && s.sectionAlt]}>
                  <View style={s.sectionHeader}>
                    <View style={s.sectionAccent} />
                    <Text style={s.sectionTitle}>{groupName.toUpperCase()}</Text>
                  </View>
                  <View style={s.chipRow}>
                    {items.map((attr: any) => {
                      const isActive = !!selectedAttributes.find((a) => a.id === attr.id);
                      return (
                        <TouchableOpacity
                          key={attr.id}
                          style={[s.chip, isActive && s.chipActive]}
                          onPress={() => toggleAttribute(attr, groupName)}
                          activeOpacity={0.8}
                        >
                          <View style={[s.circle, isActive && s.circleActive]}>
                            {isActive && <Check size={12} color="#F97316" strokeWidth={3} />}
                          </View>
                          <Text style={[s.chipText, isActive && s.chipTextActive]}>
                            {attr.name}
                            {attr.priceDelta > 0 && ` (+${formatCurrency(attr.priceDelta)})`}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))
            )}

            <View style={[s.section, s.sectionAlt]}>
              <View style={s.sectionHeader}>
                <View style={s.sectionAccent} />
                <Text style={s.sectionTitle}>GHI CHÚ</Text>
              </View>
              <TextInput
                style={s.noteInput}
                placeholder="Ví dụ: Ít đường, nhiều đá..."
                placeholderTextColor="#D1D5DB"
                value={note}
                onChangeText={setNote}
                multiline
              />
            </View>
            <View style={{ height: 160 }} />
          </ScrollView>

          {/* Phần chân trang dưới cùng */}
          <View style={s.footer}>
            <View style={s.footerTop}>
              <View style={s.qtyControls}>
                <TouchableOpacity style={s.qtyBtn} onPress={() => setQuantity(Math.max(1, quantity - 1))}>
                  <Minus size={20} color={quantity > 1 ? '#111827' : '#D1D5DB'} />
                </TouchableOpacity>
                <Text style={s.qtyText}>{quantity}</Text>
                <TouchableOpacity style={s.qtyBtn} onPress={() => setQuantity(quantity + 1)}>
                  <Plus size={20} color="#111827" />
                </TouchableOpacity>
              </View>
              <View style={s.totalContainer}>
                <Text style={s.totalLabel}>Tổng</Text>
                <Text style={s.totalPrice}>{formatCurrency(totalPrice)}</Text>
              </View>
            </View>

            <TouchableOpacity style={s.confirmBtn} onPress={handleConfirm}>
              <Text style={s.confirmBtnText}>Thêm vào giỏ hàng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject },
  content: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: SCREEN_HEIGHT * 0.9,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center', marginTop: 12,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingTop: 16, paddingBottom: 12,
  },
  title: { fontFamily: FONTS.bold, fontSize: 18, color: '#111827', flex: 1, marginRight: 10 },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center',
  },
  scroll: { paddingHorizontal: 24, paddingTop: 12 },
  
  summary: { flexDirection: 'row', marginBottom: 20 },
  image: { width: 90, height: 90, borderRadius: 20, backgroundColor: '#F3F4F6' },
  summaryInfo: { flex: 1, marginLeft: 16, justifyContent: 'flex-start' },
  desc: { fontFamily: FONTS.regular, fontSize: 12, color: '#9CA3AF', lineHeight: 16, marginBottom: 8 },
  price: { fontFamily: FONTS.bold, fontSize: 18, color: '#F97316' },

  section: { paddingVertical: 18, paddingHorizontal: 24, marginHorizontal: -24 },
  sectionAlt: { backgroundColor: '#F8FAFC' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 8 },
  sectionAccent: { width: 3, height: 14, backgroundColor: '#F98B3F', borderRadius: 2 },
  sectionTitle: { fontFamily: FONTS.bold, fontSize: 11, color: '#111827', letterSpacing: 0.5 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 14, backgroundColor: COLORS.white,
    minWidth: '47%', justifyContent: 'flex-start',
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  chipActive: { 
    backgroundColor: '#FFF7ED', 
    borderColor: '#F97316',
    shadowColor: '#F97316', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 1,
  }, 
  circle: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 1.5, borderColor: '#CBD5E1',
    marginRight: 8, justifyContent: 'center', alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  circleActive: { borderColor: '#F97316' },
  chipText: { fontFamily: FONTS.medium, fontSize: 13, color: '#64748B' },
  chipTextActive: { color: '#F97316', fontFamily: FONTS.bold },

  noteInput: {
    backgroundColor: COLORS.white, borderRadius: 12,
    padding: 14, minHeight: 48,
    fontFamily: FONTS.regular, fontSize: 13, color: COLORS.textPrimary,
    textAlignVertical: 'top',
    borderWidth: 1, borderColor: '#E5E7EB',
  },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 24, paddingVertical: 20,
    backgroundColor: COLORS.white,
    borderTopWidth: 1, borderTopColor: '#F3F4F6',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  footerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  qtyControls: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8FAFC', borderRadius: 16,
    padding: 6,
  },
  qtyBtn: { 
    width: 42, height: 42, borderRadius: 12, 
    backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  qtyText: { fontFamily: FONTS.bold, fontSize: 18, color: '#111827', marginHorizontal: 16, minWidth: 20, textAlign: 'center' },
  
  totalContainer: { alignItems: 'flex-end' },
  totalLabel: { fontFamily: FONTS.regular, fontSize: 12, color: '#9CA3AF' },
  totalPrice: { fontFamily: FONTS.bold, fontSize: 22, color: '#F97316' },

  confirmBtn: {
    backgroundColor: '#F98B3F',
    height: 58, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#F98B3F', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25, shadowRadius: 10, elevation: 6,
  },
  confirmBtnText: { fontFamily: FONTS.bold, fontSize: 17, color: COLORS.white },
});

export default ProductModal;
