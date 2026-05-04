import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Image } from 'react-native';
import { COLORS, FONTS } from '@/styles/theme';

interface CategoryItemProps {
  name: string;
  image?: string;
  isActive: boolean;
  onPress: () => void;
}

const CategoryItem = ({ name, image, isActive, onPress }: CategoryItemProps) => {
  return (
    <TouchableOpacity style={s.container} onPress={onPress} activeOpacity={0.7}>
      <View style={[s.imageContainer, isActive && s.activeImageContainer]}>
        {image ? (
          <Image source={{ uri: image }} style={s.image} />
        ) : (
          <View style={s.placeholder} />
        )}
      </View>
      <Text style={[s.name, isActive && s.activeName]} numberOfLines={1}>
        {name}
      </Text>
    </TouchableOpacity>
  );
};

const s = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 75,
    marginRight: 15,
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
    marginBottom: 8,
  },
  activeImageContainer: {
    borderColor: COLORS.primary,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.borderLight,
  },
  name: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  activeName: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
});

export default CategoryItem;
