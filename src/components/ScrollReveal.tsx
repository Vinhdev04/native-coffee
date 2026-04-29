/**
 * UI: Scroll Reveal (Native Version)
 * Chức năng: Tạo hiệu ứng xuất hiện (fade, slide) khi scroll tới component trên di động.
 * Nội dung: Sử dụng View và Text cơ bản (có thể nâng cấp lên Reanimated sau).
 */

import React from 'react';
import { View, ViewProps } from 'react-native';

interface ScrollRevealProps extends ViewProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  duration?: number;
}

export function ScrollReveal({
  children,
  style,
  ...props
}: ScrollRevealProps) {
  // Hiện tại hiển thị View tĩnh để đảm bảo preview hoạt động trên Metro
  return (
    <View style={style} {...props}>
      {children}
    </View>
  );
}

interface StaggerContainerProps extends ViewProps {
  children: React.ReactNode;
  staggerDelay?: number;
}

export function StaggerContainer({ children, style, ...props }: StaggerContainerProps) {
  return (
    <View style={style} {...props}>
      {children}
    </View>
  );
}

export function StaggerItem({ children, style, ...props }: { children: React.ReactNode; style?: any }) {
  return (
    <View style={style} {...props}>
      {children}
    </View>
  );
}
