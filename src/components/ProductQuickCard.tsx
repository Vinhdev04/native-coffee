import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Plus, Star, Package } from 'lucide-react-native';
import { COLORS, FONTS } from '@/styles/theme';
import { formatCurrency } from '@/utils';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 48 - 16) / 2;

interface ProductQuickCardProps {
  id: string | number;
  name: string;
  description?: string;
  price: number;
  image?: string;
  rating?: string | number;
  onPress: () => void;
  onQuickAdd: () => void;
}

export const ProductQuickCard = ({
  name,
  description,
  price,
  image,
  rating = '5.0',
  onPress,
  onQuickAdd,
}: ProductQuickCardProps) => {
  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={styles.imageContainer}>
        {image ? (
          <Image
            source={{ uri: image }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Package size={32} color={COLORS.gray[300]} />
          </View>
        )}
        
        {/* Rating Badge */}
        <View style={styles.ratingBadge}>
          <Star size={10} color={COLORS.warning} fill={COLORS.warning} />
          <Text style={styles.ratingText}>{rating}</Text>
        </View>

        {/* Quick Add Button */}
        <TouchableOpacity 
          style={styles.quickAddBtn}
          activeOpacity={0.7}
          onPress={onQuickAdd}
        >
          <Plus size={16} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{name}</Text>
        <Text style={styles.description} numberOfLines={1}>
          {description || 'Sản phẩm tuyệt hảo từ Chips'}
        </Text>
        <Text style={styles.price}>
          {formatCurrency(price)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: COLUMN_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
    overflow: 'hidden',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 16,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: COLORS.gray[50],
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },
  ratingText: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    color: COLORS.black,
  },
  quickAddBtn: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.gray[900],
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: COLORS.gray[900],
    marginBottom: 4,
  },
  description: {
    fontSize: 10,
    color: COLORS.gray[400],
    fontFamily: FONTS.regular,
    marginBottom: 8,
  },
  price: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.gray[900],
  },
});
