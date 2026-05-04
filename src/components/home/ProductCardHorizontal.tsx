import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, BORDER_RADIUS } from '@/styles/theme';
import { formatCurrency } from '@/utils';
import { Plus } from 'lucide-react-native';

interface ProductCardHorizontalProps {
  product: any;
  onPress: () => void;
  onAddPress: () => void;
}

const ProductCardHorizontal = ({ product, onPress, onAddPress }: ProductCardHorizontalProps) => {
  return (
    <TouchableOpacity style={s.container} onPress={onPress} activeOpacity={0.8}>
      <Image 
        source={{ 
          uri: product.imageUrl || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=300&auto=format&fit=crop' 
        }} 
        style={s.image} 
      />
      <View style={s.info}>
        <Text style={s.name} numberOfLines={1}>{product.name}</Text>
        <Text style={s.description} numberOfLines={2}>
          {product.description || 'Hương vị đậm đà, thơm ngon khó cưỡng...'}
        </Text>
        <View style={s.footer}>
          <Text style={s.price}>{formatCurrency(product.basePrice || product.price)}</Text>
          <TouchableOpacity style={s.addBtn} onPress={onAddPress}>
            <Plus size={18} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const s = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.backgroundSecondary,
  },
  info: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'space-between',
  },
  name: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  description: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  price: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.accent,
  },
  addBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProductCardHorizontal;
