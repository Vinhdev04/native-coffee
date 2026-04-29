/**
 * UI: App Loading (Native Version)
 * Chức năng: Cung cấp các component hiển thị trạng thái loading (toàn trang, transition, nút bấm).
 * Nội dung: FullScreenLoadingOverlay, ButtonLoadingContent components.
 */

import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Modal,
} from 'react-native';
import { COLORS, FONTS } from '@/styles/theme';

interface FullScreenLoadingOverlayProps {
  show: boolean;
  title?: string;
  description?: string;
}

export function FullScreenLoadingOverlay({
  show,
  title = 'Đang xử lý',
  description = 'Vui lòng chờ trong giây lát.',
}: FullScreenLoadingOverlayProps) {
  return (
    <Modal visible={show} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
      </View>
    </Modal>
  );
}

interface ButtonLoadingContentProps {
  loading: boolean;
  loadingText: string;
  children: React.ReactNode;
}

export function ButtonLoadingContent({ loading, loadingText, children }: ButtonLoadingContentProps) {
  return (
    <View style={styles.buttonContent}>
      {loading && (
        <ActivityIndicator size="small" color={COLORS.white} style={styles.spinner} />
      )}
      <Text style={styles.buttonText}>{loading ? loadingText : children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(16, 24, 40, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.milk.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.black,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: COLORS.gray[500],
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    marginRight: 8,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
});
