/**
 * UI: QR Modal (Native Version)
 * Chức năng: Modal hiển thị chi tiết sản phẩm, cho phép chọn size, độ ngọt và thêm vào giỏ hàng.
 * Nội dung: Sử dụng View, Text, TouchableOpacity, Image, TextInput và StyleSheet.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { COLORS, FONTS } from '~/styles/theme';
import { Minus, Plus, ShoppingBag, X } from 'lucide-react-native';
import { formatPrice, products } from '~/constants/products';
import { useCart } from '~/context/CartContext';
import { ButtonLoadingContent } from '~/components/AppLoading';

const { width, height } = Dimensions.get('window');

const SIZES = [
  { id: 'S', label: 'Nhỏ', priceAdd: -5000 },
  { id: 'M', label: 'Vừa', priceAdd: 0 },
  { id: 'L', label: 'Lớn', priceAdd: 10000 },
];

const SWEETNESS_LEVELS = ['0%', '25%', '50%', '75%', '100%'];

interface QRModalProps {
  productId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QRModal({ productId, isOpen, onClose }: QRModalProps) {
  const { dispatch } = useCart();
  const product = products.find((p) => p.id === productId) || products[0];

  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedSweetness, setSelectedSweetness] = useState('50%');
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (isOpen && product) {
      setSelectedSize('M');
      setSelectedSweetness('50%');
      setQuantity(1);
      setNote('');
      setIsAdding(false);
    }
  }, [isOpen, product]);

  if (!product) return null;

  const sizeAdd = SIZES.find((size) => size.id === selectedSize)?.priceAdd ?? 0;
  const itemPrice = product.price + sizeAdd;
  const totalPrice = itemPrice * quantity;

  const handleAddToCart = () => {
    if (isAdding) return;

    setIsAdding(true);
    const sizeName = SIZES.find((size) => size.id === selectedSize)?.label ?? selectedSize;

    dispatch({
      type: 'ADD_ITEM',
      item: {
        cartId: `${product.id}-${selectedSize}-${selectedSweetness}-${note.trim()}`,
        id: product.id,
        name: product.name,
        price: itemPrice,
        image: product.image,
        quantity,
        size: sizeName,
        sweetness: selectedSweetness,
        toppings: [],
        note: note.trim() || undefined,
      },
    });

    setTimeout(() => {
      setIsAdding(false);
      onClose();
    }, 420);
  };

  return (
    <Modal visible={isOpen} transparent animationType="slide">
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.dismissArea} onPress={onClose} activeOpacity={1} />
        <View style={styles.card}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <X size={20} color={COLORS.black} />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Image source={{ uri: product.image }} style={styles.productImage} />
            <View style={styles.content}>
              <View style={styles.header}>
                <View style={styles.headerInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productMeta}>100+ đã bán | {product.categoryLabel}</Text>
                </View>
                <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>
              </View>

              <View style={styles.optionGroup}>
                <Text style={styles.optionTitle}>Kích cỡ</Text>
                <View style={styles.sizeGrid}>
                  {SIZES.map((size) => {
                    const isActive = selectedSize === size.id;
                    return (
                      <TouchableOpacity
                        key={size.id}
                        style={[styles.sizeItem, isActive && styles.activeOption]}
                        onPress={() => setSelectedSize(size.id)}
                      >
                        <Text style={[styles.sizeLabel, isActive && styles.activeText]}>{size.label}</Text>
                        <Text style={[styles.sizeAdd, isActive && styles.activeSubtext]}>
                          {size.priceAdd !== 0 ? (size.priceAdd > 0 ? `+${formatPrice(size.priceAdd)}` : formatPrice(size.priceAdd)) : ' '}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.optionGroup}>
                <View style={styles.optionHeader}>
                  <Text style={styles.optionTitle}>Độ ngọt</Text>
                  <Text style={styles.optionSelection}>{selectedSweetness}</Text>
                </View>
                <View style={styles.sweetnessGrid}>
                  {SWEETNESS_LEVELS.map((level) => {
                    const isActive = selectedSweetness === level;
                    return (
                      <TouchableOpacity
                        key={level}
                        style={[styles.sweetnessItem, isActive && styles.activeOption]}
                        onPress={() => setSelectedSweetness(level)}
                      >
                        <Text style={[styles.sweetnessText, isActive && styles.activeText]}>{level}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.optionGroup}>
                <Text style={styles.optionTitle}>Ghi chú cho quán</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ví dụ: ít đá, không đường..."
                  placeholderTextColor={COLORS.gray[400]}
                  value={note}
                  onChangeText={setNote}
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <View style={styles.qtyContainer}>
              <TouchableOpacity 
                style={styles.qtyBtn}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus size={18} color={COLORS.gray[600]} />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{quantity}</Text>
              <TouchableOpacity 
                style={styles.qtyBtn}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Plus size={18} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.addBtn} onPress={handleAddToCart}>
              <ButtonLoadingContent loading={isAdding} loadingText="Đang thêm...">
                Thêm - {formatPrice(totalPrice)}
              </ButtonLoadingContent>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
  },
  card: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: height * 0.85,
  },
  closeBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImage: {
    width: '100%',
    height: 300,
  },
  content: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerInfo: {
    flex: 1,
    marginRight: 16,
  },
  productName: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.black,
    marginBottom: 4,
  },
  productMeta: {
    fontSize: 14,
    color: COLORS.gray[500],
  },
  productPrice: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  optionGroup: {
    marginBottom: 24,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.black,
  },
  optionSelection: {
    fontSize: 14,
    color: COLORS.primary,
    fontFamily: FONTS.semiBold,
  },
  sizeGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  sizeItem: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  sizeLabel: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: COLORS.black,
  },
  sizeAdd: {
    fontSize: 10,
    color: COLORS.gray[500],
    marginTop: 2,
  },
  sweetnessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sweetnessItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.gray[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  sweetnessText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.black,
  },
  activeOption: {
    backgroundColor: COLORS.milk.light,
    borderColor: COLORS.primary,
  },
  activeText: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
  activeSubtext: {
    color: COLORS.primary,
  },
  input: {
    backgroundColor: COLORS.gray[50],
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: COLORS.black,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
    flexDirection: 'row',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  qtyBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.black,
    width: 30,
    textAlign: 'center',
  },
  addBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default QRModal;
