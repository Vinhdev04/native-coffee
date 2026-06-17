import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity,
  ScrollView, Image, StatusBar, Modal, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { 
  User, Lock, Printer, Globe, Headset, 
  LogOut, ChevronRight, ArrowLeft, Check 
} from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import Toast from '@/components/common/Toast';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { s } from '../styles/AccountScreen.styles';

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

  // TODO: Hàm changeLanguage thay đổi ngôn ngữ hiển thị của ứng dụng thông qua thư viện i18n
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

        <View style={s.menuSection}>
          <Text style={s.sectionTitle}>{t('settings_uppercase')}</Text>
          <MenuItem icon={User} label={t('account_info')} onPress={() => navigation.navigate('UpdateProfile' as never)} />
          <MenuItem icon={Lock} label={t('change_password')} onPress={() => navigation.navigate('ChangePassword' as never)} />
          <MenuItem icon={Printer} label={t('printer_settings')} onPress={() => {}} />
          <MenuItem icon={Globe} label={t('language')} onPress={() => setLangModalVisible(true)} />
          <MenuItem icon={Headset} label={t('support')} onPress={() => {}} />
        </View>

        <TouchableOpacity style={s.logoutBtn} onPress={() => setLogoutModalVisible(true)}>
          <LogOut size={22} color="#EF4444" />
          <Text style={s.logoutText}>{t('logout')}</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

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

export default AccountScreen;
