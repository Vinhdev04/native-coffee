import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { COLORS, FONTS } from '@/styles/theme';
import { X, Share2, Circle, CheckCircle, Square, Plus, Minus } from 'lucide-react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
  product?: any;
}

const ProductOptionsBottomSheet = ({ visible, onClose, product }: Props) => {
  const [selectedDrink, setSelectedDrink] = useState('1');
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');

  // Mock data representing what would come from product.productAttributes
  const drinkOptions = [
    { id: '1', name: '1 7up vừa', priceDelta: 0 },
    { id: '2', name: '1 Mirinda cam vừa', priceDelta: 0 },
    { id: '3', name: '1 Pepsi lớn', priceDelta: 5000 },
    { id: '4', name: '1 Cacao sữa đá vừa', priceDelta: 10000 },
    { id: '5', name: '1 Cacao sữa đá lớn', priceDelta: 15000 },
    { id: '6', name: '1 Nước xoài đào lớn', priceDelta: 15000 },
  ];

  const extraOptions = [
    { id: 'ex1', name: 'Thêm 2 gói tương chua ngọt', priceDelta: 1000 },
    { id: 'ex2', name: 'Thêm 2 gói tương cà', priceDelta: 1000 },
  ];

  const toggleExtra = (id: string) => {
    if (selectedExtras.includes(id)) {
      setSelectedExtras(selectedExtras.filter(e => e !== id));
    } else {
      if (selectedExtras.length < 2) {
        setSelectedExtras([...selectedExtras, id]);
      }
    }
  };

  const calculateTotal = () => {
    let base = product?.basePrice || 140000;
    const drink = drinkOptions.find(d => d.id === selectedDrink);
    if (drink) base += drink.priceDelta;
    extraOptions.forEach(ex => {
      if (selectedExtras.includes(ex.id)) base += ex.priceDelta;
    });
    return base * quantity;
  };

  const formatPrice = (price: number) => {
    if (price === 0) return '';
    return `+${price.toLocaleString('vi-VN')}đ`;
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.sheet}>
          <View style={s.header}>
            <TouchableOpacity onPress={onClose} style={s.iconBtn}>
              <X size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={s.headerTitle} numberOfLines={1}>
              {product?.name || 'Combo Gà Giòn Vui Vẻ'}
            </Text>
            <TouchableOpacity style={s.iconBtn}>
              <Share2 size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
            {/* Drink Selection */}
            <View style={s.section}>
              {drinkOptions.map(opt => (
                <TouchableOpacity 
                  key={opt.id} 
                  style={s.optionRow}
                  onPress={() => setSelectedDrink(opt.id)}
                >
                  <View style={s.radioContainer}>
                    {selectedDrink === opt.id ? (
                      <CheckCircle size={24} color={COLORS.primary} />
                    ) : (
                      <Circle size={24} color={COLORS.border} />
                    )}
                  </View>
                  <Text style={s.optionName}>{opt.name}</Text>
                  <Text style={s.optionPrice}>{formatPrice(opt.priceDelta)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={s.divider} />

            {/* Extras Selection */}
            <View style={s.section}>
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>Mua Thêm Tương:</Text>
                <View style={s.badge}>
                  <Text style={s.badgeText}>Không bắt buộc, tối đa 2</Text>
                </View>
              </View>
              {extraOptions.map(opt => (
                <TouchableOpacity 
                  key={opt.id} 
                  style={s.optionRow}
                  onPress={() => toggleExtra(opt.id)}
                >
                  <View style={s.radioContainer}>
                    {selectedExtras.includes(opt.id) ? (
                      <CheckCircle size={24} color={COLORS.primary} />
                    ) : (
                      <Square size={24} color={COLORS.border} borderRadius={4} />
                    )}
                  </View>
                  <Text style={s.optionName}>{opt.name}</Text>
                  <Text style={s.optionPrice}>{formatPrice(opt.priceDelta)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={s.divider} />

            {/* Note Section */}
            <View style={s.section}>
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>Thêm lưu ý cho quán</Text>
                <View style={s.badge}>
                  <Text style={s.badgeText}>Không bắt buộc</Text>
                </View>
              </View>
              <TextInput
                style={s.noteInput}
                placeholder="Việc thực hiện yêu cầu còn tùy thuộc vào khả năng của quán."
                placeholderTextColor={COLORS.textMuted}
                multiline
                numberOfLines={3}
                value={note}
                onChangeText={setNote}
                textAlignVertical="top"
              />
            </View>
            
            <View style={{height: 100}} />
          </ScrollView>

          {/* Bottom Fixed Area */}
          <View style={s.bottomContainer}>
            <View style={s.qtyRow}>
              <TouchableOpacity 
                style={[s.qtyBtn, quantity <= 1 && s.qtyBtnDisabled]}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus size={20} color={quantity > 1 ? COLORS.success : COLORS.border} />
              </TouchableOpacity>
              <Text style={s.qtyText}>{quantity}</Text>
              <TouchableOpacity 
                style={s.qtyBtn}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Plus size={20} color={COLORS.success} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={s.addBtn}>
              <Text style={s.addBtnText}>Thêm vào giỏ hàng - {calculateTotal().toLocaleString('vi-VN')}đ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.white, // Match full screen modal or bottom sheet. Screenshot looks like full screen modal with close button
  },
  sheet: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 50, // Safe area
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  iconBtn: {
    padding: 5,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingVertical: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  badge: {
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  radioContainer: {
    marginRight: 15,
  },
  optionName: {
    flex: 1,
    fontFamily: FONTS.medium,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  optionPrice: {
    fontFamily: FONTS.medium,
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  divider: {
    height: 6,
    backgroundColor: COLORS.backgroundSecondary,
  },
  noteInput: {
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 15,
    height: 100,
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingBottom: 30,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 10,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    gap: 20,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F5E9', // Light green bg for the buttons as in screenshot
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnDisabled: {
    backgroundColor: COLORS.backgroundSecondary,
  },
  qtyText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.textPrimary,
    minWidth: 20,
    textAlign: 'center',
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  addBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.white,
  },
});

export default ProductOptionsBottomSheet;
