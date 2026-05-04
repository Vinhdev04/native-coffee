import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, DimensionValue } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '@/styles/theme';

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: any;
}

const Skeleton = ({ width, height, borderRadius = 4, style }: SkeletonProps) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();
  }, [animatedValue]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <View style={[s.container, { width, height, borderRadius }, style]}>
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateX }] }]}>
        <LinearGradient
          colors={[COLORS.backgroundSecondary, '#E1E9EE', COLORS.backgroundSecondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={s.gradient}
        />
      </Animated.View>
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    backgroundColor: COLORS.backgroundSecondary,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
  },
});

export default Skeleton;
