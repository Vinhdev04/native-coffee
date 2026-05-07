import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { X, Minus, Plus } from 'lucide-react-native';
import { COLORS, FONTS } from '@/styles/theme';
import { formatCurrency } from '@/utils';

const { height } = Dimensions.get('window');

// Mock data based on the image
const MOCK_TOPPINGS = [
  { id: '1', name: 'Trân Châu Đen', price: 5000 },
  { id: '2', name: 'Thạch Dừa', price: 4000 },
  { id: '3', name: 'Kem Cheese', price: 7000 },
  { id: '4', name: 'Red Bean', price: 6000 },
];

const SIZE_OPTIONS = [
  { id: 'M', name: 'M', price: 0 },
  { id: 'L', name: 'L', price: 7000 },
];

interface ProductModalProps {
  product: any;
  isVisible: boolean;
  onClose: () => void;
  onAddToCart: (itemData: any) => void;
  editItem?: any;
}

export const ProductModal = ({
  product,
  isVisible,
  onClose,
  onAddToCart,
  editItem,
}: ProductModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState('M');
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (isVisible && product) {
      if (editItem) {
        setQuantity(editItem.quantity || 1);
        setSize(editItem.size || 'M');
        setSelectedToppings(editItem.toppings?.map((t: any) => t.id) || []);
        setNote(editItem.note || '');
      } else {
        setQuantity(1);
        setSize('M');
        setSelectedToppings([]);
        setNote('');
      }
    }
  }, [isVisible, product, editItem]);

  if (!product) return null;

  const selectedSizeData = SIZE_OPTIONS.find((s) => s.id === size) || SIZE_OPTIONS[0];
  const toppingsPrice = selectedToppings.reduce((acc, id) => {
    const t = MOCK_TOPPINGS.find((top) => top.id === id);
    return acc + (t ? t.price : 0);
  }, 0);

  const unitPrice = (product.price || 38000) + selectedSizeData.price + toppingsPrice;
  const totalPrice = unitPrice * quantity;

  const toggleTopping = (id: string) => {
    setSelectedToppings((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleAction = () => {
    onAddToCart({
      productId: product.id || product._id,
      name: product.name,
      price: unitPrice,
      image: product.image,
      quantity,
      size,
      note,
      selectedAttributes: [
        { id: size, name: size, type: 'Size' },
        ...selectedToppings.map(id => {
          const t = MOCK_TOPPINGS.find(top => top.id === id);
          return { id, name: t?.name, type: 'Topping' };
        })
      ],
    });
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlayTouchable} onPress={onClose} activeOpacity={1} />
        
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalContainer}
        >
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{product.name || 'Trà Sữa Matcha'}</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Product Basic Info */}
            <View style={styles.productInfoRow}>
              <Image 
                source={{ uri: product.image || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=300&auto=format&fit=crop' }} 
                style={styles.productImage} 
              />
              <View style={styles.productDetails}>
                <Text style={styles.productDesc} numberOfLines={3}>
                  {product.description || 'Matcha Nhật Bản nguyên chất kết hợp sữa tươi, thơm béo, đậm đà hương trà xanh'}
                </Text>
                <Text style={styles.basePrice}>{formatCurrency(product.price || 38000)}</Text>
              </View>
            </View>

            <View style={styles.content}>
              {/* SIZE Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>SIZE</Text>
                <View style={styles.row}>
                  {SIZE_OPTIONS.map((opt) => {
                    const isSelected = size === opt.id;
                    return (
                      <TouchableOpacity
                        key={opt.id}
                        style={[styles.sizeBtn, isSelected && styles.activeBtn]}
                        onPress={() => setSize(opt.id)}
                      >
                        <Text style={[styles.btnText, isSelected && styles.activeBtnText]}>
                          {opt.name} {opt.price > 0 ? `(+${formatCurrency(opt.price)})` : ''}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* TOPPING Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>TOPPING</Text>
                <View style={styles.wrapRow}>
                  {MOCK_TOPPINGS.map((top) => {
                    const isSelected = selectedToppings.includes(top.id);
                    return (
                      <TouchableOpacity
                        key={top.id}
                        style={[styles.toppingBtn, isSelected && styles.activeBtn]}
                        onPress={() => toggleTopping(top.id)}
                      >
                        <Text style={[styles.btnText, isSelected && styles.activeBtnText]}>
                          {top.name} (+{formatCurrency(top.price)})
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* NOTE Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>GHI CHÚ</Text>
                <TextInput
                  style={styles.noteInput}
                  value={note}
                  onChangeText={setNote}
                  placeholder="Ví dụ: Ít đường, nhiều đá..."
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerRow}>
              <View style={styles.qtyContainer}>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(Math.max(1, quantity - 1))}>
                  <Minus size={18} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{quantity}</Text>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(quantity + 1)}>
                  <Plus size={18} color={COLORS.textPrimary} />
                </TouchableOpacity>
              </View>
              <View style={styles.totalInfo}>
                <Text style={styles.totalLabel}>Tổng</Text>
                <Text style={styles.totalValue}>{formatCurrency(totalPrice)}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.addBtn} onPress={handleAction}>
              <Text style={styles.addBtnText}>Thêm vào giỏ hàng</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  overlayTouchable: { ...StyleSheet.absoluteFillObject },
  modalContainer: { 
    backgroundColor: COLORS.white, 
    borderTopLeftRadius: 30, borderTopRightRadius: 30, 
    maxHeight: height * 0.85 
  },
  handle: { 
    width: 50, height: 5, backgroundColor: '#E5E7EB', 
    borderRadius: 5, alignSelf: 'center', marginTop: 15 
  },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: 24, paddingTop: 20, paddingBottom: 15 
  },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 22, color: COLORS.textPrimary },
  closeBtn: { 
    width: 36, height: 36, borderRadius: 18, 
    backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' 
  },
  scrollView: { flexGrow: 0 },
  productInfoRow: { 
    flexDirection: 'row', paddingHorizontal: 24, marginBottom: 20, gap: 15 
  },
  productImage: { width: 110, height: 110, borderRadius: 20, backgroundColor: '#F9FAFB' },
  productDetails: { flex: 1, justifyContent: 'space-between' },
  productDesc: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.textMuted, lineHeight: 18 },
  basePrice: { fontFamily: FONTS.bold, fontSize: 20, color: COLORS.primary, marginTop: 5 },
  
  content: { paddingHorizontal: 24 },
  section: { marginBottom: 25 },
  sectionTitle: { fontFamily: FONTS.bold, fontSize: 12, color: COLORS.textMuted, marginBottom: 12, letterSpacing: 0.5 },
  row: { flexDirection: 'row', gap: 12 },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  
  sizeBtn: { 
    flex: 1, height: 48, borderRadius: 12, 
    backgroundColor: '#F9FAFB', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#F3F4F6'
  },
  toppingBtn: { 
    paddingHorizontal: 15, height: 40, borderRadius: 10, 
    backgroundColor: '#F9FAFB', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#F3F4F6'
  },
  activeBtn: { backgroundColor: '#FF8A00', borderColor: '#FF8A00' },
  btnText: { fontFamily: FONTS.medium, fontSize: 14, color: COLORS.textMuted },
  activeBtnText: { color: COLORS.white, fontFamily: FONTS.bold },
  
  noteInput: { 
    height: 50, backgroundColor: '#F9FAFB', borderRadius: 12, 
    paddingHorizontal: 15, fontFamily: FONTS.regular, fontSize: 14, color: COLORS.textPrimary 
  },
  
  footer: { 
    padding: 24, borderTopWidth: 1, borderTopColor: '#F3F4F6', 
    backgroundColor: COLORS.white, paddingBottom: Platform.OS === 'ios' ? 35 : 24 
  },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  qtyContainer: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', 
    borderRadius: 12, padding: 5, borderWidth: 1, borderColor: '#F3F4F6' 
  },
  qtyBtn: { 
    width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.white, 
    justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 
  },
  qtyText: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.textPrimary, paddingHorizontal: 15 },
  totalInfo: { alignItems: 'flex-end' },
  totalLabel: { fontFamily: FONTS.medium, fontSize: 13, color: COLORS.textMuted },
  totalValue: { fontFamily: FONTS.bold, fontSize: 24, color: COLORS.primary },
  
  addBtn: { 
    height: 56, backgroundColor: '#FF8A00', borderRadius: 18, 
    justifyContent: 'center', alignItems: 'center',
    elevation: 4, shadowColor: '#FF8A00', shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, shadowRadius: 8
  },
  addBtnText: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.white },
});
