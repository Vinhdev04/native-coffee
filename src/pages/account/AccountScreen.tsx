import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, SafeAreaView, Alert, StatusBar,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { COLORS, FONTS, SPACING } from '@/styles/theme';
import {
  User, Lock, Bell, Globe, Palette, HelpCircle, Info,
  LogOut, ChevronRight, ShoppingBag, Heart, Award,
} from 'lucide-react-native';
import Toast from '@/components/common/Toast';

/* ── Avatar initials ── */
const Avatar = ({ name }: { name: string }) => {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('');

  return (
    <View style={s.avatar}>
      <Text style={s.avatarText}>{initials || 'U'}</Text>
    </View>
  );
};

/* ── Single menu row ── */
const MenuRow = ({
  icon, label, onPress, danger, value,
}: {
  icon: any; label: string; onPress: () => void; danger?: boolean; value?: string;
}) => (
  <TouchableOpacity style={s.menuRow} onPress={onPress} activeOpacity={0.7}>
    <View style={[s.menuIconWrap, danger && s.menuIconDanger]}>
      {icon}
    </View>
    <Text style={[s.menuLabel, danger && { color: COLORS.error }]}>{label}</Text>
    {value && <Text style={s.menuValue}>{value}</Text>}
    <ChevronRight size={16} color={danger ? COLORS.error : '#D1D5DB'} />
  </TouchableOpacity>
);

const AccountScreen = () => {
  const { user, logout } = useAuth();
  const [toast, setToast] = useState({ visible: false, type: 'info' as 'success' | 'error' | 'info', title: '', message: '' });

  const displayName = user?.fullName || user?.username || 'Người dùng';
  const displayRole = user?.role || 'Nhân viên';

  const showComingSoon = () => {
    setToast({ visible: true, type: 'info', title: 'Sắp ra mắt', message: 'Tính năng này đang được phát triển.' });
  };

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: () => {
            setToast({ visible: true, type: 'info', title: 'Đang đăng xuất...', message: '' });
            setTimeout(() => logout(), 1000);
          },
        },
      ]
    );
  };

  const STATS = [
    { label: 'Đơn hàng', value: '24', icon: <ShoppingBag size={20} color={COLORS.primary} /> },
    { label: 'Yêu thích', value: '8',  icon: <Heart size={20} color='#EF4444' /> },
    { label: 'Điểm tích', value: '320', icon: <Award size={20} color='#F59E0B' /> },
  ];

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#D8F1F3" />

      {/* Toast */}
      <Toast
        visible={toast.visible}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onHide={() => setToast(t => ({ ...t, visible: false }))}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Profile Header ── */}
        <View style={s.profileHeader}>
          <Avatar name={displayName} />
          <Text style={s.userName}>{displayName}</Text>
          <View style={s.roleBadge}>
            <Text style={s.roleText}>{displayRole}</Text>
          </View>
        </View>

        {/* ── Stats Cards ── */}
        <View style={s.statsCard}>
          {STATS.map((stat, i) => (
            <React.Fragment key={stat.label}>
              <View style={s.statItem}>
                {stat.icon}
                <Text style={s.statValue}>{stat.value}</Text>
                <Text style={s.statLabel}>{stat.label}</Text>
              </View>
              {i < STATS.length - 1 && <View style={s.statDivider} />}
            </React.Fragment>
          ))}
        </View>

        {/* ── Menu Groups ── */}
        <View style={s.groupCard}>
          <Text style={s.groupTitle}>Tài khoản</Text>
          <MenuRow icon={<User size={18} color="#0B7F8C" />}     label="Thông tin cá nhân" onPress={showComingSoon} />
          <MenuRow icon={<Lock size={18} color="#0B7F8C" />}     label="Đổi mật khẩu"     onPress={showComingSoon} />
          <MenuRow icon={<Bell size={18} color="#0B7F8C" />}     label="Thông báo"          onPress={showComingSoon} />
        </View>

        <View style={s.groupCard}>
          <Text style={s.groupTitle}>Ứng dụng</Text>
          <MenuRow icon={<Globe size={18} color="#6B7280" />}    label="Ngôn ngữ"          onPress={showComingSoon} value="Tiếng Việt" />
          <MenuRow icon={<Palette size={18} color="#6B7280" />}  label="Giao diện"         onPress={showComingSoon} />
          <MenuRow icon={<HelpCircle size={18} color="#6B7280" />} label="Trợ giúp & Hỗ trợ" onPress={showComingSoon} />
          <MenuRow icon={<Info size={18} color="#6B7280" />}     label="Về ứng dụng"       onPress={showComingSoon} value="v1.0.0" />
        </View>

        <View style={s.groupCard}>
          <MenuRow icon={<LogOut size={18} color={COLORS.error} />} label="Đăng xuất" onPress={handleLogout} danger />
        </View>

        <Text style={s.footerVersion}>Native Coffee © 2026</Text>
        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F3F5' },

  profileHeader: {
    backgroundColor: '#D8F1F3',
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 44,
  },
  avatar: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 14,
    borderWidth: 4, borderColor: COLORS.white,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarText: { fontFamily: FONTS.bold, fontSize: 32, color: COLORS.white },
  userName: { fontFamily: FONTS.bold, fontSize: 20, color: COLORS.textPrimary, marginBottom: 8 },
  roleBadge: {
    backgroundColor: 'rgba(255,122,0,0.12)',
    paddingHorizontal: 14, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,122,0,0.25)',
  },
  roleText: { fontFamily: FONTS.medium, fontSize: 12, color: COLORS.primary },

  statsCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginTop: -24,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1, borderColor: '#EDEDED',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 6 },
  statValue: { fontFamily: FONTS.bold, fontSize: 20, color: COLORS.textPrimary },
  statLabel: { fontFamily: FONTS.regular, fontSize: 11, color: COLORS.textMuted },
  statDivider: { width: 1, backgroundColor: '#F0F0F0', marginVertical: 6 },

  groupCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20, marginBottom: 10,
    borderRadius: 18, overflow: 'hidden',
    borderWidth: 1, borderColor: '#EDEDED',
  },
  groupTitle: {
    fontFamily: FONTS.semiBold, fontSize: 10,
    color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 1,
    paddingHorizontal: 18, paddingTop: 14, paddingBottom: 2,
  },
  menuRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 18, paddingVertical: 14,
    borderTopWidth: 1, borderTopColor: '#F8F8F8', gap: 12,
  },
  menuIconWrap: {
    width: 36, height: 36, borderRadius: 11,
    backgroundColor: '#EBF8FA',
    justifyContent: 'center', alignItems: 'center',
  },
  menuIconDanger: { backgroundColor: '#FFF1F2' },
  menuLabel: { flex: 1, fontFamily: FONTS.medium, fontSize: 14, color: COLORS.textPrimary },
  menuValue: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textMuted, marginRight: 2 },

  footerVersion: {
    textAlign: 'center', fontFamily: FONTS.regular,
    fontSize: 12, color: COLORS.textMuted, marginTop: 12,
  },
});

export default AccountScreen;
