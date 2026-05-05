import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { X, User, Mail, Phone, Calendar, Store, Smile } from 'lucide-react-native';
import { COLORS, FONTS } from '@/styles/theme';
import { useAuth } from '@/context/AuthContext';
import dayjs from 'dayjs';

const AccountInfoScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  const displayName = user?.fullName || user?.username || 'Chưa cập nhật';
  const displayEmail = user?.email || 'Chưa cập nhật';
  const displayPhone = user?.phone || user?.phone_number || 'Chưa cập nhật';
  const displayDate = user?.created_at ? dayjs(user.created_at).format('DD/MM/YYYY') : 'N/A';
  const displayRole = user?.permissions?.[0]?.roleName?.trim() || user?.role || 'Nhân viên';

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Thông Tin Tài Khoản</Text>
        <TouchableOpacity style={s.closeBtn} onPress={() => navigation.goBack()}>
          <X size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={s.avatarSection}>
          <View style={s.avatarWrap}>
            <Smile size={36} color="#F97316" />
          </View>
          <Text style={s.profileName}>{displayName}</Text>
          <Text style={s.profileEmail}>{displayEmail}</Text>
        </View>

        {/* Info Cards */}
        <View style={s.cardsWrap}>
          <View style={s.infoCard}>
            <View style={s.iconBox}>
              <User size={18} color="#F97316" />
            </View>
            <View style={s.cardBody}>
              <Text style={s.cardLabel}>Họ và tên</Text>
              <Text style={s.cardValue}>{displayName}</Text>
            </View>
          </View>

          <View style={s.infoCard}>
            <View style={s.iconBox}>
              <Mail size={18} color="#F97316" />
            </View>
            <View style={s.cardBody}>
              <Text style={s.cardLabel}>Email</Text>
              <Text style={s.cardValue}>{displayEmail}</Text>
            </View>
          </View>

          <View style={s.infoCard}>
            <View style={s.iconBox}>
              <Phone size={18} color="#F97316" />
            </View>
            <View style={s.cardBody}>
              <Text style={s.cardLabel}>Số điện thoại</Text>
              <Text style={s.cardValue}>{displayPhone}</Text>
            </View>
          </View>

          <View style={s.infoCard}>
            <View style={s.iconBox}>
              <Calendar size={18} color="#F97316" />
            </View>
            <View style={s.cardBody}>
              <Text style={s.cardLabel}>Ngày tham gia</Text>
              <Text style={s.cardValue}>{displayDate}</Text>
            </View>
          </View>

          <View style={s.infoCard}>
            <View style={s.iconBox}>
              <Store size={18} color="#F97316" />
            </View>
            <View style={s.cardBody}>
              <Text style={s.cardLabel}>Chức vụ</Text>
              <Text style={s.cardValue}>{displayRole}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 12 : 16,
    paddingBottom: 16,
  },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 18, color: '#111827' },
  closeBtn: {
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center', alignItems: 'center',
  },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  
  avatarSection: { alignItems: 'center', marginTop: 10, marginBottom: 32 },
  avatarWrap: {
    width: 80, height: 80,
    borderRadius: 24,
    backgroundColor: '#FFEDD5',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
  },
  profileName: { fontFamily: FONTS.bold, fontSize: 18, color: '#111827', marginBottom: 4 },
  profileEmail: { fontFamily: FONTS.regular, fontSize: 13, color: '#9CA3AF' },

  cardsWrap: { gap: 12 },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
  },
  iconBox: {
    width: 44, height: 44,
    borderRadius: 12,
    backgroundColor: '#FFF',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02, shadowRadius: 4, elevation: 1,
  },
  cardBody: { flex: 1 },
  cardLabel: { fontFamily: FONTS.medium, fontSize: 12, color: '#9CA3AF', marginBottom: 2 },
  cardValue: { fontFamily: FONTS.semiBold, fontSize: 15, color: '#111827' },
});

export default AccountInfoScreen;
