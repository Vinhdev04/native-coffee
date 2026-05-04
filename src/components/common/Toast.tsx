/**
 * @file Toast.tsx
 * @desc A simple, beautiful toast notification component built without external libraries.
 * @layer components/common
 */

import React, { useEffect, useRef } from 'react';
import { Animated, Text, View, StyleSheet, Easing } from 'react-native';
import { COLORS, FONTS } from '@/styles/theme';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react-native';

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  visible: boolean;
  type?: ToastType;
  title: string;
  message?: string;
  onHide: () => void;
  duration?: number;
}

const CONFIGS = {
  success: {
    bg: '#F0FDF4',
    border: '#22C55E',
    icon: <CheckCircle size={20} color="#22C55E" />,
    titleColor: '#166534',
  },
  error: {
    bg: '#FFF1F2',
    border: '#EF4444',
    icon: <AlertCircle size={20} color="#EF4444" />,
    titleColor: '#991B1B',
  },
  info: {
    bg: '#EFF6FF',
    border: COLORS.primary,
    icon: <Info size={20} color={COLORS.primary} />,
    titleColor: COLORS.primary,
  },
};

const Toast = ({ visible, type = 'success', title, message, onHide, duration = 3000 }: ToastProps) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 10,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        hide();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hide = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 250,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
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
      <View style={s.icon}>{cfg.icon}</View>
      <View style={s.textGroup}>
        <Text style={[s.title, { color: cfg.titleColor }]}>{title}</Text>
        {message ? <Text style={s.message} numberOfLines={2}>{message}</Text> : null}
      </View>
    </Animated.View>
  );
};

const s = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 55,
    left: 16,
    right: 16,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 10,
  },
  icon: { marginRight: 12 },
  textGroup: { flex: 1 },
  title: { fontFamily: FONTS.semiBold, fontSize: 14 },
  message: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
});

export default Toast;
