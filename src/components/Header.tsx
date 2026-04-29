/**
 * UI: Header (Native Version)
 * Chức năng: Thanh đầu trang với logo và nút giỏ hàng/thông báo.
 * Nội dung: Sử dụng View, Text, TouchableOpacity và StyleSheet.
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { COLORS, FONTS } from '~/styles/theme';
import { Bell, ShoppingBag } from 'lucide-react-native';
import { useCart } from '~/context/CartContext';

export function Header() {
  const { totalItems } = useCart();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoRow}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>F</Text>
          </View>
          <Text style={styles.brandName}>Fresh Bubble</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn}>
            <Bell size={24} color={COLORS.black} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.cartBtn}>
            <ShoppingBag size={24} color={COLORS.black} />
            {totalItems > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{totalItems}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
    paddingTop: 10,
    paddingBottom: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 36,
    height: 36,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: COLORS.white,
    fontFamily: FONTS.bold,
    fontSize: 20,
  },
  brandName: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.black,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionBtn: {
    padding: 4,
  },
  cartBtn: {
    padding: 4,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.primary,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontFamily: FONTS.bold,
  },
});
