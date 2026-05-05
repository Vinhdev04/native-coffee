/**
 * @file Toast.tsx
 * @desc Animated toast notification component (no external libraries).
 *       Uses only Animated.spring to avoid Easing conflicts with reanimated/plugin.
 * @layer components/common
 */

import React, { useEffect, useRef } from 'react';
import { Animated, Text, View, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '@/styles/theme';
import { CheckCircle, AlertCircle, Info } from 'lucide-react-native';

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  visible: boolean;
  type?: ToastType;
  title: string;
  message?: string;
  onHide: () => void;
  duration?: number;
}

/* Static config to avoid JSX inside data being treated as worklets */
const CONFIGS: Record<ToastType, { bg: string; border: string; titleColor: string; iconType: ToastType }> = {
  success: { bg: '#F0FDF4', border: '#22C55E', titleColor: '#166534', iconType: 'success' },
  error:   { bg: '#FFF1F2', border: '#EF4444', titleColor: '#991B1B', iconType: 'error'   },
  info:    { bg: '#EFF6FF', border: COLORS.primary, titleColor: COLORS.primary, iconType: 'info' },
};

/* Separate icon component to avoid JSX in config object */
const ToastIcon = ({ type }: { type: ToastType }) => {
  if (type === 'success') return <CheckCircle size={20} color="#22C55E" />;
  if (type === 'error')   return <AlertCircle size={20} color="#EF4444" />;
  return <Info size={20} color={COLORS.primary} />;
};

const Toast = ({
  visible,
  type = 'success',
  title,
  message,
  onHide,
  duration = 3000,
}: ToastProps) => {
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      /* Clear any pending hide timer */
      if (timerRef.current) clearTimeout(timerRef.current);

      /* Slide in */
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 70,
          friction: 12,
        }),
        Animated.spring(opacity, {
          toValue: 1,
          useNativeDriver: true,
          tension: 70,
          friction: 12,
        }),
      ]).start();

      /* Auto-hide after duration */
      timerRef.current = setTimeout(() => {
        slideOut();
      }, duration);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible]);

  const slideOut = () => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: -120,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.spring(opacity, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
    ]).start(() => onHide());
  };

  if (!visible) return null;

  const cfg = CONFIGS[type];

  return (
    <Animated.View
      style={[
        s.container,
        {
          backgroundColor: cfg.bg,
          borderLeftColor: cfg.border,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View style={s.iconWrap}>
        <ToastIcon type={type} />
      </View>
      <View style={s.textGroup}>
        <Text style={[s.title, { color: cfg.titleColor }]} numberOfLines={2}>
          {title}
        </Text>
        {!!message && (
          <Text style={s.message} numberOfLines={2}>
            {message}
          </Text>
        )}
      </View>
    </Animated.View>
  );
};

const s = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 12,
  },
  iconWrap:  { marginRight: 12 },
  textGroup: { flex: 1 },
  title:   { fontFamily: FONTS.semiBold, fontSize: 14, lineHeight: 20 },
  message: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
});

export default Toast;
