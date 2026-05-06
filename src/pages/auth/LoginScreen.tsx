/**
 * @file LoginScreen.tsx
 * @desc Màn hình đăng nhập — xử lý form xác thực, mã hóa mật khẩu RSA
 *       và điều hướng vào ứng dụng sau khi login thành công.
 * @layer pages/auth
 */

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Image,
  KeyboardAvoidingView, Platform, ScrollView,
  ImageBackground, StatusBar,
} from 'react-native';
import { useTranslation }  from 'react-i18next';
import { useNavigation }   from '@react-navigation/native';
import { useAuth }         from '@/context/AuthContext';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '@/styles/theme';
import { encryptWithRSA }  from '@/utils/encryption';
import { loginApi }      from '@/services/authService';
import Toast               from 'react-native-toast-message';
import LinearGradient     from 'react-native-linear-gradient';
import { User, Lock, Eye, EyeOff, ChevronRight, ShieldCheck, Users } from 'lucide-react-native';

const BG_IMAGE = 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1000&auto=format&fit=crop';


const LoginScreen = () => {
  const { t }    = useTranslation();
  const { login } = useAuth();
  const navigation = useNavigation<any>();

  const [userName,  setUserName]  = useState('');
  const [password,  setPassword]  = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPass,  setShowPass]  = useState(false);
  const [selectedRole, setSelectedRole] = useState<'ADMIN' | 'STAFF' | null>(null);

  const handleLogin = async () => {
    if (!userName.trim() || !password.trim()) {
      Toast.show({ type: 'error', text1: 'Vui lòng nhập đầy đủ thông tin', position: 'bottom' });
      return;
    }

    setIsLoading(true);
    try {
      const cleanPassword = password.trim();
      let encryptedPassword = cleanPassword;
      try { 
        encryptedPassword = await encryptWithRSA(cleanPassword); 
      } catch (_) {
        console.warn('RSA encryption failed');
      }

      const response = await loginApi({
        userName: userName.trim(),
        password: encryptedPassword,
      });

      // Hỗ trợ cả cấu trúc rows (legacy) và user/data (new chips api)
      const userDataFromRows = response?.rows?.[0];
      const userDataFromData = response?.user || response?.data;
      const finalUserData = userDataFromRows || userDataFromData;
      const token = response?.token || finalUserData?.token;

      if ((response?.res_code === 0 || token) && finalUserData) {
        if (token) {
          await login(token, finalUserData);
          Toast.show({ type: 'success', text1: '☕ Chào mừng đến Bill Chips!', position: 'bottom' });
        } else {
          Toast.show({ type: 'error', text1: 'Không tìm thấy Token xác thực', position: 'bottom' });
        }
      } else {
        const errorMsg = response?.data?.message || response?.error_cont || 'Đăng nhập không thành công';
        const errorCode = response?.error_code ? `[${response.error_code}] ` : '';
        Toast.show({ 
          type: 'error', 
          text1: 'Đăng nhập thất bại', 
          text2: `${errorCode}${errorMsg}`,
          position: 'bottom' 
        });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      Toast.show({ 
        type: 'error', 
        text1: 'Lỗi kết nối', 
        text2: error.message || 'Vui lòng thử lại sau',
        position: 'bottom' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderRoleSelection = () => (
    <View style={styles.roleContainer}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('@/assets/images/logo.png')} 
            style={styles.logoImg} 
            resizeMode="contain" 
          />
        </View>
        <Text style={styles.brandName}>Bill Chips</Text>
        <Text style={styles.tagline}>Chọn vai trò để bắt đầu làm việc</Text>
      </View>

      <View style={styles.cardsWrapper}>
        <TouchableOpacity 
          style={styles.roleCard}
          activeOpacity={0.8}
          onPress={() => setSelectedRole('ADMIN')}
        >
          <View style={styles.roleIconWrapper}>
            <ShieldCheck size={24} color={COLORS.white} />
          </View>
          <View style={styles.roleTextWrapper}>
            <Text style={styles.roleTitle}>Quản Lý (Admin)</Text>
            <Text style={styles.roleDesc}>Dashboard, thống kê, quản lý thực đơn</Text>
          </View>
          <View style={styles.roleArrow}>
            <ChevronRight size={16} color={COLORS.primary} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.roleCard}
          activeOpacity={0.8}
          onPress={() => setSelectedRole('STAFF')}
        >
          <View style={[styles.roleIconWrapper, { backgroundColor: '#E06B22' }]}>
            <Users size={24} color={COLORS.white} />
          </View>
          <View style={styles.roleTextWrapper}>
            <Text style={styles.roleTitle}>Nhân Viên</Text>
            <Text style={styles.roleDesc}>Đặt hàng, theo dõi đơn, thanh toán</Text>
          </View>
          <View style={styles.roleArrow}>
            <ChevronRight size={16} color={COLORS.primary} />
          </View>
        </TouchableOpacity>
      </View>

      <Text style={styles.footerBranding}>Bill Chips v1.0 • Made with love</Text>
    </View>
  );

  const renderLoginForm = () => (
    <View style={styles.formContainer}>
      <TouchableOpacity style={styles.backButton} onPress={() => setSelectedRole(null)} activeOpacity={0.7}>
        <View style={styles.backIconWrapper}>
          <ChevronRight size={18} color={COLORS.textPrimary} style={{ transform: [{ rotate: '180deg' }] }} />
        </View>
        <Text style={styles.backText}>Quay lại</Text>
      </TouchableOpacity>
      
      <Text style={styles.welcomeText}>
        Đăng nhập {selectedRole === 'ADMIN' ? 'Quản lý' : 'Nhân viên'}
      </Text>
      
      <View style={styles.inputContainer}>
        <User size={20} color={COLORS.textMuted} />
        <TextInput
          style={styles.input}
          placeholder="Tên đăng nhập"
          placeholderTextColor={COLORS.textMuted}
          value={userName}
          onChangeText={setUserName}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Lock size={20} color={COLORS.textMuted} />
        <TextInput
          style={styles.input}
          placeholder="Mật khẩu"
          placeholderTextColor={COLORS.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPass}
        />
        <TouchableOpacity onPress={() => setShowPass(!showPass)}>
          {showPass ? <EyeOff size={20} color={COLORS.textMuted} /> : <Eye size={20} color={COLORS.textMuted} />}
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.forgotPass}>
        <Text style={styles.forgotPassText}>Quên mật khẩu?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.loginBtn, isLoading && styles.btnDisabled]}
        onPress={handleLogin}
        disabled={isLoading}
        activeOpacity={0.85}
      >
        {isLoading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.loginBtnText}>Đăng nhập</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" transparent backgroundColor="transparent" />
      <LinearGradient
        colors={['#FEF9F5', '#FFF0E5']}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {!selectedRole ? renderRoleSelection() : renderLoginForm()}
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF9F5',
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 24,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  roleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 8,
  },
  logoImg: {
    width: 60,
    height: 60,
  },
  brandName: {
    fontFamily: 'GreatVibes-Regular', // Dùng font cách điệu nếu có, nếu không thì fallback
    fontSize: 36,
    fontWeight: '800',
    color: '#A15112', // Màu nâu đất
    marginBottom: 8,
  },
  tagline: {
    fontFamily: FONTS.medium,
    fontSize: 15,
    color: '#8B7B71',
  },
  cardsWrapper: {
    width: '100%',
    gap: 16,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 20,
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  roleIconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#E65100', // Cam đậm cho Admin
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleTextWrapper: {
    flex: 1,
    paddingHorizontal: 16,
  },
  roleTitle: {
    fontFamily: FONTS.bold,
    fontSize: 17,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  roleDesc: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  roleArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF0E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerBranding: {
    position: 'absolute',
    bottom: 0,
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: '#B0A299',
  },

  // LoginForm Styles
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 24,
    paddingVertical: 4,
    paddingRight: 12,
  },
  backIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  backText: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  welcomeText: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: COLORS.textPrimary,
    marginBottom: 25,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  forgotPass: {
    alignSelf: 'flex-end',
    marginBottom: 25,
  },
  forgotPassText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.primary,
  },
  loginBtn: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  loginBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.white,
  },
});

export default LoginScreen;
