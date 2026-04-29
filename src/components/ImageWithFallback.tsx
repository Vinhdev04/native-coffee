/**
 * UI: Image With Fallback (Native Version)
 * Chức năng: Hiển thị hình ảnh với xử lý lỗi và placeholder.
 * Nội dung: Sử dụng Image component của React Native.
 */

import React, { useState } from 'react';
import { Image, ImageProps, View, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS } from '~/styles/theme';

interface ImageWithFallbackProps extends Omit<ImageProps, 'source'> {
  src: string;
}

export function ImageWithFallback({ src, style, ...props }: ImageWithFallbackProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const source = hasError || !src
    ? require('~/assets/images/logo.png') // Sử dụng logo làm placeholder
    : { uri: src };

  return (
    <View style={[styles.container, style]}>
      <Image
        {...props}
        source={source}
        style={[StyleSheet.absoluteFill, style]}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
      />
      {isLoading && (
        <View style={styles.loader}>
          <ActivityIndicator color={COLORS.primary} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: COLORS.gray[100],
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gray[100],
  },
});
