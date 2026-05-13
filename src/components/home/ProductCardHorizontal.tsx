import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS } from '@/styles/theme';
import { formatCurrency } from '@/utils';
import { Plus, Minus } from 'lucide-react-native';

interface ProductCardHorizontalProps {
  product: any;
  onPress: () => void;
  onAddPress: () => void;
  onMinusPress?: () => void;
  searchText?: string;
  cartQuantity?: number;
}

const HighlightText = ({
  text, highlight, style, highlightStyle,
}: { text: string; highlight?: string; style?: any; highlightStyle?: any }) => {
  if (!highlight || !highlight.trim()) return <Text style={style}>{text}</Text>;
  const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return (
    <Text style={style}>
      {parts.map((part, i) =>
        regex.test(part)
          ? <Text key={i} style={[highlightStyle]}>{part}</Text>
          : <Text key={i}>{part}</Text>
      )}
    </Text>
  );
};

const ProductCardHorizontal = ({ 
  product, onPress, onAddPress, onMinusPress, searchText, cartQuantity = 0 
}: ProductCardHorizontalProps) => {
  const imageUrl = product.imageUrl || product.image || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=300&auto=format&fit=crop';
  
  return (
    <TouchableOpacity style={s.container} onPress={onPress} activeOpacity={0.9}>
      <View style={s.imageWrap}>
        <Image source={{ uri: imageUrl }} style={s.image} resizeMode="cover" />
        {cartQuantity > 0 && (
          <View style={s.qtyBadge}>
            <Text style={s.qtyBadgeText}>{cartQuantity}</Text>
          </View>
        )}
      </View>
      <View style={s.info}>
        <View>
          <HighlightText
            text={product.name}
            highlight={searchText}
            style={s.name}
            highlightStyle={s.nameHighlight}
          />
          <Text style={s.category} numberOfLines={1}>
            {product.categoryName || 'trà sữa'}
          </Text>
        </View>
        <Text style={s.price}>{formatCurrency(product.basePrice || product.price || 0)}</Text>
      </View>
      <View style={s.btnRow}>
        {cartQuantity > 0 ? (
          <>
            <TouchableOpacity style={s.minusBtn} onPress={onMinusPress} activeOpacity={0.7}>
              <Minus size={18} color={COLORS.primary} strokeWidth={3} />
            </TouchableOpacity>
            <Text style={s.qtyText}>{cartQuantity}</Text>
          </>
        ) : null}
        <TouchableOpacity style={s.addBtn} onPress={onAddPress} activeOpacity={0.7}>
          <Plus size={20} color={COLORS.white} strokeWidth={3} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const s = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: 8,
    borderRadius: 16,
    marginBottom: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  imageWrap: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 14,
    backgroundColor: '#F9FAFB',
  },
  qtyBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.primary,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  qtyBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.white,
  },
  info: {
    flex: 1,
    marginLeft: 12,
    height: 65,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  name: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  nameHighlight: {
    backgroundColor: '#FDE68A',
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    borderRadius: 4,
  },
  category: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  price: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.primary,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  minusBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  qtyText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.textPrimary,
    minWidth: 20,
    textAlign: 'center',
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
});

export default ProductCardHorizontal;
