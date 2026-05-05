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
import { X, Minus, Plus, Edit3 } from 'lucide-react-native';
import { COLORS, FONTS } from '@/styles/theme';
import { formatCurrency } from '@/utils';

const { height } = Dimensions.get('window');

const SIZE_OPTIONS = [
  { value: 'S', label: 'Nhỏ', volume: '350ml', priceModifier: -5000, note: 'Nhẹ bụng' },
  { value: 'M', label: 'Vừa', volume: '500ml', priceModifier: 0, note: 'Phổ biến nhất' },
  { value: 'L', label: 'Lớn', volume: '700ml', priceModifier: 5000, note: 'Uống đã hơn' },
];

const SUGAR_OPTIONS = ['30%', '50%', '70%', '100%'];
const ICE_OPTIONS = ['Không đá', '50%', '70%', '100%'];

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
  const [sugar, setSugar] = useState('50%');
  const [ice, setIce] = useState('50%');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (isVisible && product) {
      if (editItem) {
        setQuantity(editItem.quantity || 1);
        setSize(editItem.size || 'M');
        setSugar(editItem.sugar || '50%');
        setIce(editItem.ice || '50%');
        setNote(editItem.note || '');
      } else {
        setQuantity(1);
        setSize('M');
        setSugar('50%');
        setIce('50%');
        setNote('');
      }
    }
  }, [isVisible, product, editItem]);

  if (!product) return null;

  const selectedSize = SIZE_OPTIONS.find((item) => item.value === size) || SIZE_OPTIONS[1];
  const unitPrice = (product.price || 0) + selectedSize.priceModifier;
  const totalPrice = unitPrice * quantity;

  const handleAction = () => {
    onAddToCart({
      productId: product.id || product._id,
      name: product.name,
      price: unitPrice,
      image: product.image,
      quantity,
      size,
      sugar,
      ice,
      note,
      toppings: [],
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
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={20} color={COLORS.gray[500]} />
          </TouchableOpacity>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Image Section */}
            <View style={styles.imageContainer}>
              {product.image ? (
                <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />
              ) : (
                <View style={styles.imagePlaceholder} />
              )}
            </View>

            <View style={styles.contentContainer}>
              {/* Header Info */}
              <View style={styles.headerInfo}>
                <View style={styles.titleRow}>
                  {editItem && <Edit3 size={16} color={COLORS.primary} style={styles.editIcon} />}
                  <Text style={styles.productName}>{product.name}</Text>
                </View>
                <Text style={styles.productDescription}>{product.description}</Text>
                <Text style={styles.productPrice}>{formatCurrency(unitPrice)}</Text>
              </View>

              {/* Options Section */}
              <View style={styles.optionsSection}>
                {/* Size */}
                <View style={styles.optionGroup}>
                  <Text style={styles.optionTitle}>KÍCH CỠ</Text>
                  <View style={styles.row}>
                    {SIZE_OPTIONS.map((opt) => {
                      const isSelected = size === opt.value;
                      return (
                        <TouchableOpacity
                          key={opt.value}
                          style={[styles.sizeBtn, isSelected && styles.sizeBtnActive]}
                          onPress={() => setSize(opt.value)}
                        >
                          <Text style={[styles.sizeLabel, isSelected && styles.sizeLabelActive]}>
                            {opt.label}
                          </Text>
                          <Text style={[styles.sizeVolume, isSelected && styles.sizeVolumeActive]}>
                            {opt.volume}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Sugar */}
                <View style={styles.optionGroup}>
                  <Text style={styles.optionTitle}>ĐƯỜNG</Text>
                  <View style={styles.wrapRow}>
                    {SUGAR_OPTIONS.map((level) => {
                      const isSelected = sugar === level;
                      return (
                        <TouchableOpacity
                          key={level}
                          style={[styles.pillBtn, isSelected && styles.pillBtnActive]}
                          onPress={() => setSugar(level)}
                        >
                          <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                            {level}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Ice */}
                <View style={styles.optionGroup}>
                  <Text style={styles.optionTitle}>ĐÁ</Text>
                  <View style={styles.wrapRow}>
                    {ICE_OPTIONS.map((level) => {
                      const isSelected = ice === level;
                      return (
                        <TouchableOpacity
                          key={level}
                          style={[styles.pillBtn, isSelected && styles.pillBtnActive]}
                          onPress={() => setIce(level)}
                        >
                          <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                            {level}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Note */}
                <View style={styles.optionGroup}>
                  <Text style={styles.optionTitle}>GHI CHÚ</Text>
                  <TextInput
                    style={styles.textInput}
                    value={note}
                    onChangeText={setNote}
                    placeholder="Ít đá, ít ngọt..."
                    placeholderTextColor={COLORS.gray[400]}
                    multiline
                    textAlignVertical="top"
                  />
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Footer Action */}
          <View style={styles.footer}>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.quantityBtn}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus size={16} color={COLORS.gray[900]} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityBtn}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Plus size={16} color={COLORS.gray[900]} />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.actionBtn} onPress={handleAction}>
              <Text style={styles.actionBtnText}>
                {editItem ? 'Cập nhật đơn hàng' : `Thêm ${formatCurrency(totalPrice)}`}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  overlayTouchable: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.9,
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flexGrow: 0,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 16 / 10,
    backgroundColor: COLORS.gray[50],
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.gray[100],
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  headerInfo: {
    marginBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  editIcon: {
    marginRight: 8,
  },
  productName: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.gray[900],
    flex: 1,
  },
  productDescription: {
    fontSize: 12,
    color: COLORS.gray[400],
    fontFamily: FONTS.regular,
    lineHeight: 18,
    marginTop: 4,
  },
  productPrice: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginTop: 12,
  },
  optionsSection: {
    gap: 32,
  },
  optionGroup: {},
  optionTitle: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: COLORS.gray[400],
    marginBottom: 12,
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  wrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sizeBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
    alignItems: 'center',
  },
  sizeBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  sizeLabel: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.gray[500],
  },
  sizeLabelActive: {
    color: COLORS.primary,
  },
  sizeVolume: {
    fontSize: 10,
    color: COLORS.gray[400],
    marginTop: 2,
  },
  sizeVolumeActive: {
    color: COLORS.primary,
    opacity: 0.8,
  },
  pillBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  pillBtnActive: {
    backgroundColor: COLORS.gray[900],
    borderColor: COLORS.gray[900],
  },
  pillText: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: COLORS.gray[500],
  },
  pillTextActive: {
    color: COLORS.white,
  },
  textInput: {
    backgroundColor: COLORS.gray[50],
    borderRadius: 12,
    padding: 12,
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.gray[900],
    height: 80,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[50],
    gap: 16,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    borderRadius: 12,
    padding: 4,
  },
  quantityBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quantityText: {
    width: 24,
    textAlign: 'center',
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.gray[900],
  },
  actionBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  actionBtnText: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
});
