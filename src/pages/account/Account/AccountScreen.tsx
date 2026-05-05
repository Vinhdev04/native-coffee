import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Image, StatusBar, Alert, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { 
  User, Lock, Printer, Globe, Headset, 
  LogOut, ChevronRight, ArrowLeft 
} from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { COLORS, FONTS } from '@/styles/theme';
import Toast from '@/components/common/Toast';

const AccountScreen = () => {
  const { user, logout } = useAuth();
  const [toast, setToast] = useState({ visible: false, title: '', message: '' });

  const displayName = user?.fullName || user?.username || 'Trần Thị Nhân Viên';
  const displayRole = user?.role || 'Nhân viên bán hàng';

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn chắc chắn muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: logout },
    ]);
  };

  const MenuItem = ({ icon: Icon, label, onPress }: any) => (
    <TouchableOpacity style={s.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={s.menuIconBox}>
        <Icon size={20} color="#F97316" />
      </View>
      <Text style={s.menuLabel}>{label}</Text>
      <ChevronRight size={18} color="#D1D5DB" />
    </TouchableOpacity>
  );

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <Toast
        visible={toast.visible}
        title={toast.title}
        message={toast.message}
        onHide={() => setToast(t => ({ ...t, visible: false }))}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
        {/* ── Header with Gradient ── */}
        <LinearGradient
          colors={['#F97316', '#FB923C']}
          style={s.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <SafeAreaView edges={['top']}>
            <View style={s.topNav}>
              <TouchableOpacity style={s.backBtn}>
                <ArrowLeft size={24} color="#FFF" />
              </TouchableOpacity>
              <Text style={s.headerTitle}>Hồ Sơ</Text>
              <View style={{ width: 40 }} />
            </View>

            <View style={s.profileInfo}>
              <View style={s.avatarContainer}>
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80' }} 
                  style={s.avatar} 
                />
              </View>
              <View style={s.nameContainer}>
                <Text style={s.profileName}>{displayName}</Text>
                <Text style={s.profileRole}>{displayRole}</Text>
                <View style={s.badge}>
                  <Text style={s.badgeText}>Staff</Text>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* ── Stats Bar ── */}
        <View style={s.statsContainer}>
          <View style={s.statCard}>
            <Text style={s.statValue}>128</Text>
            <Text style={s.statLabel}>Đơn hôm nay</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statValue}>4.9</Text>
            <Text style={s.statLabel}>Đánh giá</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statValue}>92%</Text>
            <Text style={s.statLabel}>Hoàn thành</Text>
          </View>
        </View>

        {/* ── Settings List ── */}
        <View style={s.menuSection}>
          <Text style={s.sectionTitle}>CÀI ĐẶT</Text>
          <MenuItem icon={User} label="Thông Tin Tài Khoản" onPress={() => {}} />
          <MenuItem icon={Lock} label="Đổi Mật Khẩu" onPress={() => {}} />
          <MenuItem icon={Printer} label="Cài Đặt Máy In" onPress={() => {}} />
          <MenuItem icon={Globe} label="Ngôn Ngữ" onPress={() => {}} />
          <MenuItem icon={Headset} label="Hỗ Trợ" onPress={() => {}} />
        </View>

        {/* ── Logout Button ── */}
        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
          <LogOut size={22} color="#EF4444" />
          <Text style={s.logoutText}>Đăng Xuất</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FEF9F6' },
  scrollContent: { paddingBottom: 40 },
  
  headerGradient: {
    paddingBottom: 60,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 10 : 0,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: {
    fontFamily: FONTS.bold, fontSize: 18, color: '#FFF',
  },
  
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 24,
  },
  avatarContainer: {
    width: 72, height: 72, borderRadius: 36,
    borderWidth: 3, borderColor: '#FFF',
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  avatar: { width: '100%', height: '100%' },
  nameContainer: { marginLeft: 16 },
  profileName: { fontFamily: FONTS.bold, fontSize: 20, color: '#FFF' },
  profileRole: { fontFamily: FONTS.regular, fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 12, marginTop: 8,
  },
  badgeText: { fontFamily: FONTS.semiBold, fontSize: 11, color: '#FFF' },

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: -35,
  },
  statCard: {
    backgroundColor: '#FFF',
    width: '31%',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  statValue: { fontFamily: FONTS.bold, fontSize: 18, color: '#F97316' },
  statLabel: { fontFamily: FONTS.regular, fontSize: 10, color: '#9CA3AF', marginTop: 4 },

  menuSection: { paddingHorizontal: 16, marginTop: 32 },
  sectionTitle: {
    fontFamily: FONTS.bold, fontSize: 12, color: '#9CA3AF',
    marginBottom: 16, marginLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  menuIconBox: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
  },
  menuLabel: { flex: 1, fontFamily: FONTS.medium, fontSize: 15, color: '#1E293B' },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 18,
    marginTop: 20,
    gap: 10,
    borderWidth: 1, borderColor: '#FEE2E2',
  },
  logoutText: { fontFamily: FONTS.bold, fontSize: 16, color: '#EF4444' },
});

export default AccountScreen;
