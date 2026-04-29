/**
 * UI: Bottom Nav (Native Version)
 * Chức năng: Thanh điều hướng dưới cùng với thiết kế nổi cao cấp.
 * Nội dung: Sử dụng View, Text, TouchableOpacity và StyleSheet.
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { COLORS, FONTS } from '@/styles/theme';
import { Home, LayoutGrid, User, History } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export function BottomNav() {
  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        <NavItem icon={Home} label="Trang chủ" active />
        <NavItem icon={LayoutGrid} label="Thực đơn" />
        <View style={styles.qrPlaceholder}>
          <TouchableOpacity style={styles.qrBtn}>
            <View style={styles.qrIcon} />
          </TouchableOpacity>
        </View>
        <NavItem icon={History} label="Lịch sử" />
        <NavItem icon={User} label="Hội viên" />
      </View>
    </View>
  );
}

function NavItem({ icon: Icon, label, active = false }: any) {
  return (
    <TouchableOpacity style={styles.navItem}>
      <Icon size={24} color={active ? COLORS.primary : COLORS.gray[400]} />
      <Text style={[styles.navLabel, active && styles.activeLabel]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: 'transparent',
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 24,
    height: 72,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navLabel: {
    fontSize: 10,
    fontFamily: FONTS.medium,
    color: COLORS.gray[400],
    marginTop: 4,
  },
  activeLabel: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
  qrPlaceholder: {
    width: 60,
    height: 60,
    marginTop: -40,
  },
  qrBtn: {
    width: 60,
    height: 60,
    backgroundColor: COLORS.primary,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 5,
    borderColor: COLORS.background,
    elevation: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  qrIcon: {
    width: 24,
    height: 24,
    backgroundColor: COLORS.white,
    borderRadius: 4,
  },
});
