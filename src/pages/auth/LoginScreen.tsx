import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Image,
  KeyboardAvoidingView, Platform, ScrollView,
  StatusBar, Animated, Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/context/AuthContext';
import { COLORS, FONTS, SPACING } from '@/styles/theme';
import { encryptWithRSA } from '@/utils/encryption';
import { loginApi } from '@/services/authService';
import Toast from 'react-native-toast-message';
import LinearGradient from 'react-native-linear-gradient';
import {
  User, Lock, Eye, EyeOff, ChevronRight,
  ShieldCheck, Users, Coffee,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const LoginScreen = () => {
  const { login } = useAuth();
  const navigation = useNavigation<any>();

  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'ADMIN' | 'STAFF' | null>(null);

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const animateToForm = (role: 'ADMIN' | 'STAFF') => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setSelectedRole(role);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleBack = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setSelectedRole(null);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });
  };

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

      const userDataFromRows = response?.rows?.[0];
      const userDataFromData = response?.user || response?.data;
      const finalUserData = userDataFromRows || userDataFromData;
      const token = response?.token || finalUserData?.token;

      if ((response?.res_code === 0 || token) && finalUserData) {
        if (token) {
          await login(token, finalUserData);
          Toast.show({ type: 'success', text1: '🍟 Chào mừng đến Chips Bill!', position: 'bottom' });
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
          position: 'bottom',
        });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi kết nối',
        text2: error.message || 'Vui lòng thử lại sau',
        position: 'bottom',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderRoleSelection = () => (
    <Animated.View style={[styles.animatedContainer, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <Image
          source={require('@/public/logo.png')}
          style={styles.mainLogo}
          resizeMode="contain"
        />
        <Text style={styles.brandName}>Chips Bill</Text>
        <Text style={styles.tagline}>Chọn vai trò để bắt đầu làm việc</Text>
      </View>

      <View style={styles.cardsWrapper}>
        <TouchableOpacity
          style={styles.roleCard}
          activeOpacity={0.7}
          onPress={() => animateToForm('ADMIN')}
        >
          <View style={styles.roleCardContent}>
            <View style={[styles.roleIconWrapper, { backgroundColor: '#E65100' }]}>
              <ShieldCheck size={24} color={COLORS.white} />
            </View>
            <View style={styles.roleTextWrapper}>
              <Text style={styles.roleTitle}>Quản Lý (Admin)</Text>
              <Text style={styles.roleDesc}>Dashboard, thống kê, quản lý thực đơn</Text>
            </View>
          </View>
          <View style={styles.roleArrow}>
            <ChevronRight size={18} color={COLORS.primary} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.roleCard}
          activeOpacity={0.7}
          onPress={() => animateToForm('STAFF')}
        >
          <View style={styles.roleCardContent}>
            <View style={[styles.roleIconWrapper, { backgroundColor: '#E06B22' }]}>
              <Users size={24} color={COLORS.white} />
            </View>
            <View style={styles.roleTextWrapper}>
              <Text style={styles.roleTitle}>Nhân Viên</Text>
              <Text style={styles.roleDesc}>Đặt hàng, theo dõi đơn, thanh toán</Text>
            </View>
          </View>
          <View style={styles.roleArrow}>
            <ChevronRight size={18} color={COLORS.primary} />
          </View>
        </TouchableOpacity>
      </View>

      <Text style={styles.footerBranding}>Chips Bill v1.0  •  Made with love</Text>
    </Animated.View>
  );

  const renderLoginForm = () => (
    <Animated.View style={[styles.animatedContainer, { opacity: fadeAnim }]}>
      <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.7}>
        <View style={styles.backBtnInner}>
          <ChevronRight size={20} color={COLORS.textPrimary} style={{ transform: [{ rotate: '180deg' }] }} />
        </View>
      </TouchableOpacity>

      <View style={styles.formCard}>
        <View style={styles.formIconRow}>
          <View style={styles.formIcon}>
            <Image
              source={require('@/public/logo.png')}
              style={{ width: 32, height: 32 }}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.formRole}>
            {selectedRole === 'ADMIN' ? 'Quản lý' : 'Nhân viên'}
          </Text>
        </View>

        <Text style={styles.formTitle}>Đăng nhập</Text>
        <Text style={styles.formSubtitle}>Nhập thông tin tài khoản của bạn</Text>

        <View style={styles.inputGroup}>
          <View style={styles.inputContainer}>
            <User size={18} color="#9CA3AF" />
            <TextInput
              style={styles.input}
              placeholder="Tên đăng nhập"
              placeholderTextColor="#9CA3AF"
              value={userName}
              onChangeText={setUserName}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Lock size={18} color="#9CA3AF" />
            <TextInput
              style={styles.input}
              placeholder="Mật khẩu"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              {showPass ? (
                <EyeOff size={18} color="#9CA3AF" />
              ) : (
                <Eye size={18} color="#9CA3AF" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.forgotPass}
          onPress={() => navigation.navigate('ForgotPassword')}
          hitSlop={{ top: 8, bottom: 8 }}
        >
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
            <View style={styles.loginBtnInner}>
              <Text style={styles.loginBtnText}>Đăng nhập</Text>
              <ChevronRight size={20} color={COLORS.white} />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={['#FEF9F5', '#FFF0E5']}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flex}
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
  flex: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 24,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 48,
  },
  animatedContainer: {
    flex: 1,
    justifyContent: 'center',
  },

  // Role Selection
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 96,
    height: 96,
    backgroundColor: COLORS.white,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  mainLogo: {
    width: width * 0.6,
    height: 80,
    marginBottom: 10,
  },
  logoImg: {
    width: 32,
    height: 32,
  },
  brandName: {
    fontFamily: 'GreatVibes-Regular',
    fontSize: 38,
    fontWeight: '800',
    color: '#F7941D', // Vibrant Chips Orange
    marginBottom: 8,
    textShadowColor: 'rgba(247, 148, 29, 0.2)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  tagline: {
    fontFamily: FONTS.medium,
    fontSize: 15,
    color: '#8B7B71',
  },
  cardsWrapper: {
    width: '100%',
    gap: 14,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: 22,
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 4,
  },
  roleCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  roleIconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleTextWrapper: {
    flex: 1,
    paddingHorizontal: 14,
  },
  roleTitle: {
    fontFamily: FONTS.bold,
    fontSize: 17,
    color: COLORS.textPrimary,
    marginBottom: 3,
  },
  roleDesc: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  roleArrow: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFF0E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerBranding: {
    textAlign: 'center',
    marginTop: 48,
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: '#B0A299',
  },

  // Login Form
  backBtn: {
    marginBottom: 20,
  },
  backBtnInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 28,
    padding: 28,
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  formIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  formIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  formRole: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  formTitle: {
    fontFamily: FONTS.bold,
    fontSize: 26,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  formSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 28,
  },
  inputGroup: {
    gap: 14,
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.textPrimary,
    height: '100%',
  },
  forgotPass: {
    alignSelf: 'flex-end',
    marginTop: 14,
    marginBottom: 28,
  },
  forgotPassText: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.primary,
  },
  loginBtn: {
    backgroundColor: COLORS.primary,
    height: 58,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  loginBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loginBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.white,
  },
});

export default LoginScreen;
