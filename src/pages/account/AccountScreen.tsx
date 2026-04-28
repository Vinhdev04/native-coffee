import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, SafeAreaView, Alert,
} from 'react-native';
import { useAuth } from '~/context/AuthContext';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '~/styles/theme';

const MenuItem = ({
  icon, label, onPress, danger,
}: {
  icon: string; label: string; onPress: () => void; danger?: boolean;
}) => (
  <TouchableOpacity style={s.menuItem} onPress={onPress} activeOpacity={0.75}>
    <Text style={s.menuIcon}>{icon}</Text>
    <Text style={[s.menuLabel, danger && { color: COLORS.error }]}>{label}</Text>
    <Text style={s.menuArrow}>›</Text>
  </TouchableOpacity>
);

const AccountScreen = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đăng xuất', style: 'destructive', onPress: logout },
      ]
    );
  };

  return (
    <SafeAreaView style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={s.profileHeader}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>
              {(user?.fullName || user?.username || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={s.userName}>{user?.fullName || user?.username}</Text>
          <Text style={s.userRole}>{user?.role || 'Nhân viên'}</Text>
        </View>

        {/* Stats Row */}
        <View style={s.statsRow}>
          {[
            { label: 'Đơn hàng', value: '24' },
            { label: 'Yêu thích', value: '8'  },
            { label: 'Điểm tích', value: '320' },
          ].map((stat) => (
            <View key={stat.label} style={s.statItem}>
              <Text style={s.statValue}>{stat.value}</Text>
              <Text style={s.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu Group */}
        <View style={s.menuGroup}>
          <Text style={s.groupTitle}>Tài khoản</Text>
          <MenuItem icon="👤" label="Thông tin cá nhân" onPress={() => {}} />
          <MenuItem icon="🔑" label="Đổi mật khẩu"     onPress={() => {}} />
          <MenuItem icon="🔔" label="Thông báo"          onPress={() => {}} />
        </View>

        <View style={s.menuGroup}>
          <Text style={s.groupTitle}>Ứng dụng</Text>
          <MenuItem icon="🌐" label="Ngôn ngữ"      onPress={() => {}} />
          <MenuItem icon="🎨" label="Giao diện"     onPress={() => {}} />
          <MenuItem icon="❓" label="Trợ giúp & Hỗ trợ" onPress={() => {}} />
          <MenuItem icon="ℹ️"  label="Về ứng dụng"  onPress={() => {}} />
        </View>

        <View style={s.menuGroup}>
          <MenuItem icon="🚪" label="Đăng xuất" onPress={handleLogout} danger />
        </View>

        <Text style={s.version}>Native Coffee v1.0.0</Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container:     { flex: 1, backgroundColor: COLORS.background },
  profileHeader: { backgroundColor: COLORS.primary, alignItems: 'center', paddingTop: SPACING.xl, paddingBottom: SPACING.xl },
  avatar:        { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.accent, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.sm },
  avatarText:    { fontFamily: FONTS.bold, fontSize: 32, color: COLORS.white },
  userName:      { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.white },
  userRole:      { fontFamily: FONTS.regular, fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  statsRow:      { flexDirection: 'row', backgroundColor: COLORS.white, marginHorizontal: SPACING.md, marginTop: -20, borderRadius: 16, padding: SPACING.md, elevation: 4, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
  statItem:      { flex: 1, alignItems: 'center' },
  statValue:     { fontFamily: FONTS.bold, fontSize: 20, color: COLORS.primary },
  statLabel:     { fontFamily: FONTS.regular, fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  menuGroup:     { backgroundColor: COLORS.white, marginHorizontal: SPACING.md, marginTop: SPACING.sm, borderRadius: 16, overflow: 'hidden' },
  groupTitle:    { fontFamily: FONTS.semiBold, fontSize: 12, color: COLORS.textMuted, paddingHorizontal: SPACING.md, paddingTop: SPACING.sm, paddingBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  menuItem:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: 14, borderTopWidth: 1, borderTopColor: COLORS.divider },
  menuIcon:      { fontSize: 18, width: 30 },
  menuLabel:     { flex: 1, fontFamily: FONTS.medium, fontSize: 15, color: COLORS.textPrimary },
  menuArrow:     { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.textMuted },
  version:       { textAlign: 'center', fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textMuted, marginTop: SPACING.lg },
});

export default AccountScreen;
