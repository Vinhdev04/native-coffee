import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Image, StatusBar, Platform, Modal, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { 
  User, Lock, Printer, Globe, Headset, 
  LogOut, ChevronRight, ArrowLeft, Check 
} from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { COLORS, FONTS } from '@/styles/theme';
import Toast from '@/components/common/Toast';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

const AccountScreen = () => {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 360;

  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const [toast, setToast] = useState({ visible: false, title: '', message: '' });
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [langModalVisible, setLangModalVisible] = useState(false);

  const displayName = user?.fullName || user?.username || t('anonymous_customer');
  const displayRole = user?.role || t('staff_role');

  const MenuItem = ({ icon: Icon, label, onPress }: any) => (
    <TouchableOpacity style={s.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={s.menuIconBox}>
        <Icon size={20} color="#F97316" />
      </View>
      <Text style={s.menuLabel}>{label}</Text>
      <ChevronRight size={18} color="#D1D5DB" />
    </TouchableOpacity>
  );

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setLangModalVisible(false);
  };

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
              <Text style={s.headerTitle}>{t('profile')}</Text>
              <View style={{ width: 40 }} />
            </View>

            <View style={s.profileInfo}>
              <View style={s.avatarContainer}>
                <Image 
                  source={require('@/assets/images/logo.png')} 
                  style={s.avatar} 
                  resizeMode="contain"
                />
              </View>
              <View style={s.nameContainer}>
                <Text style={s.profileName}>{displayName}</Text>
                <Text style={s.profileRole}>{displayRole}</Text>
                <View style={s.badge}>
                  <Text style={s.badgeText}>{t('staff_badge')}</Text>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* ── Stats Bar ── */}
        <View style={[s.statsContainer, isSmallScreen && { paddingHorizontal: 12 }]}>
          <View style={[s.statCard, isSmallScreen && { paddingVertical: 12 }]}>
            <Text style={s.statValue} adjustsFontSizeToFit numberOfLines={1}>128</Text>
            <Text style={s.statLabel} adjustsFontSizeToFit numberOfLines={1}>{t('today_orders')}</Text>
          </View>
          <View style={[s.statCard, isSmallScreen && { paddingVertical: 12 }]}>
            <Text style={s.statValue} adjustsFontSizeToFit numberOfLines={1}>4.9</Text>
            <Text style={s.statLabel} adjustsFontSizeToFit numberOfLines={1}>{t('rating')}</Text>
          </View>
          <View style={[s.statCard, isSmallScreen && { paddingVertical: 12 }]}>
            <Text style={s.statValue} adjustsFontSizeToFit numberOfLines={1}>92%</Text>
            <Text style={s.statLabel} adjustsFontSizeToFit numberOfLines={1}>{t('completed')}</Text>
          </View>
        </View>

        {/* ── Settings List ── */}
        <View style={s.menuSection}>
          <Text style={s.sectionTitle}>{t('settings_uppercase')}</Text>
          <MenuItem icon={User} label={t('account_info')} onPress={() => navigation.navigate('UpdateProfile' as never)} />
          <MenuItem icon={Lock} label={t('change_password')} onPress={() => navigation.navigate('ChangePassword' as never)} />
          <MenuItem icon={Printer} label={t('printer_settings')} onPress={() => {}} />
          <MenuItem icon={Globe} label={t('language')} onPress={() => setLangModalVisible(true)} />
          <MenuItem icon={Headset} label={t('support')} onPress={() => {}} />
        </View>

        {/* ── Logout Button ── */}
        <TouchableOpacity style={s.logoutBtn} onPress={() => setLogoutModalVisible(true)}>
          <LogOut size={22} color="#EF4444" />
          <Text style={s.logoutText}>{t('logout')}</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Language Modal ── */}
      <Modal
        visible={langModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLangModalVisible(false)}
      >
        <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setLangModalVisible(false)}>
          <View style={[s.modalContent, { padding: 0, overflow: 'hidden' }]}>
            <View style={{ padding: 20, backgroundColor: '#FFF7ED', width: '100%', alignItems: 'center' }}>
              <Globe size={28} color="#F97316" style={{ marginBottom: 10 }} />
              <Text style={s.modalTitle}>{t('change_language')}</Text>
            </View>
            <View style={{ width: '100%', padding: 16 }}>
              <TouchableOpacity 
                style={[s.langOption, i18n.language === 'vn' && s.langOptionActive]} 
                onPress={() => changeLanguage('vn')}
              >
                <Text style={[s.langText, i18n.language === 'vn' && s.langTextActive]}>{t('vietnamese')}</Text>
                {i18n.language === 'vn' && <Check size={20} color="#F97316" />}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[s.langOption, i18n.language === 'en' && s.langOptionActive]} 
                onPress={() => changeLanguage('en')}
              >
                <Text style={[s.langText, i18n.language === 'en' && s.langTextActive]}>{t('english')}</Text>
                {i18n.language === 'en' && <Check size={20} color="#F97316" />}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── Custom Logout Modal ── */}
      <Modal
        visible={logoutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalIconWrap}>
              <LogOut size={28} color="#EF4444" />
            </View>
            <Text style={s.modalTitle}>{t('logout_confirm_title')}</Text>
            <Text style={s.modalSub}>{t('logout_confirm_desc')}</Text>
            
            <View style={s.modalActions}>
              <TouchableOpacity style={s.btnCancel} onPress={() => setLogoutModalVisible(false)}>
                <Text style={s.btnCancelText}>{t('stay')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.btnConfirm} onPress={() => {
                setLogoutModalVisible(false);
                logout();
              }}>
                <Text style={s.btnConfirmText}>{t('logout')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    width: 72, height: 72, borderRadius: 16,
    borderWidth: 2, borderColor: '#FFF',
    overflow: 'hidden',
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
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

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalIconWrap: {
    width: 60, height: 60,
    borderRadius: 30,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontFamily: FONTS.bold, fontSize: 20, color: '#111827', marginBottom: 6 },
  modalSub: { fontFamily: FONTS.regular, fontSize: 13, color: '#6B7280', textAlign: 'center', marginBottom: 24 },
  modalActions: { flexDirection: 'row', gap: 12, width: '100%' },
  btnCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  btnCancelText: { fontFamily: FONTS.semiBold, fontSize: 15, color: '#374151' },
  btnConfirm: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  btnConfirmText: { fontFamily: FONTS.bold, fontSize: 15, color: '#FFF' },
  langOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#F3F4F6'
  },
  langOptionActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA'
  },
  langText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: '#4B5563'
  },
  langTextActive: {
    fontFamily: FONTS.bold,
    color: '#F97316'
  }
});

export default AccountScreen;
