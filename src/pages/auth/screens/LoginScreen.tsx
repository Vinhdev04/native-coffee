import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, Image, KeyboardAvoidingView,
  Platform, ScrollView, StatusBar, Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/context/AuthContext';
import { COLORS } from '@/styles/theme';
import { encryptWithRSA } from '@/utils/encryption';
import { loginApi } from '@/services/authService';
import Toast from 'react-native-toast-message';
import LinearGradient from 'react-native-linear-gradient';
import {
  User, Lock, Eye, EyeOff, ChevronRight,
  ShieldCheck, Users,
} from 'lucide-react-native';
import { s } from '../styles/LoginScreen.styles';

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
        console.warn('Mã hóa RSA thất bại');
      }

      const response = await loginApi({
        userName: userName.trim(),
        password: encryptedPassword,
      });

      // Hỗ trợ cả cấu trúc rows cũ và user/data mới từ API
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
      console.error('Lỗi đăng nhập:', error);
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
    <Animated.View style={[s.animatedContainer, { opacity: fadeAnim }]}>
      <View style={s.header}>
        <Image
          source={require('@/assets/images/logo.png')}
          style={s.mainLogo}
          resizeMode="contain"
        />
        <Text style={s.tagline}>Chọn vai trò để bắt đầu làm việc</Text>
      </View>

      <View style={s.cardsWrapper}>
        <TouchableOpacity
          style={s.roleCard}
          activeOpacity={0.7}
          onPress={() => animateToForm('ADMIN')}
        >
          <View style={s.roleCardContent}>
            <View style={[s.roleIconWrapper, { backgroundColor: '#E65100' }]}>
              <ShieldCheck size={24} color={COLORS.white} />
            </View>
            <View style={s.roleTextWrapper}>
              <Text style={s.roleTitle}>Quản Lý (Admin)</Text>
              <Text style={s.roleDesc}>Dashboard, thống kê, quản lý thực đơn</Text>
            </View>
          </View>
          <View style={s.roleArrow}>
            <ChevronRight size={18} color={COLORS.primary} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.roleCard}
          activeOpacity={0.7}
          onPress={() => animateToForm('STAFF')}
        >
          <View style={s.roleCardContent}>
            <View style={[s.roleIconWrapper, { backgroundColor: '#E06B22' }]}>
              <Users size={24} color={COLORS.white} />
            </View>
            <View style={s.roleTextWrapper}>
              <Text style={s.roleTitle}>Nhân Viên</Text>
              <Text style={s.roleDesc}>Đặt hàng, theo dõi đơn, thanh toán</Text>
            </View>
          </View>
          <View style={s.roleArrow}>
            <ChevronRight size={18} color={COLORS.primary} />
          </View>
        </TouchableOpacity>
      </View>

      <Text style={s.footerBranding}>Chips Bill v1.0  •  Made with love</Text>
    </Animated.View>
  );

  const renderLoginForm = () => (
    <Animated.View style={[s.animatedContainer, { opacity: fadeAnim }]}>
      <TouchableOpacity style={s.backBtn} onPress={handleBack} activeOpacity={0.7}>
        <View style={s.backBtnInner}>
          <ChevronRight size={20} color={COLORS.textPrimary} style={{ transform: [{ rotate: '180deg' }] }} />
        </View>
      </TouchableOpacity>

      <View style={s.formCard}>
        <View style={s.formIconRow}>
          <View style={s.formIcon}>
            <Image
              source={require('@/assets/images/logo.png')}
              style={{ width: 32, height: 32 }}
              resizeMode="contain"
            />
          </View>
          <Text style={s.formRole}>
            {selectedRole === 'ADMIN' ? 'Quản lý' : 'Nhân viên'}
          </Text>
        </View>

        <Text style={s.formTitle}>Đăng nhập</Text>
        <Text style={s.formSubtitle}>Nhập thông tin tài khoản của bạn</Text>

        <View style={s.inputGroup}>
          <View style={s.inputContainer}>
            <User size={18} color="#9CA3AF" />
            <TextInput
              style={s.input}
              placeholder="Tên đăng nhập"
              placeholderTextColor="#9CA3AF"
              value={userName}
              onChangeText={setUserName}
              autoCapitalize="none"
            />
          </View>

          <View style={s.inputContainer}>
            <Lock size={18} color="#9CA3AF" />
            <TextInput
              style={s.input}
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
          style={s.forgotPass}
          onPress={() => navigation.navigate('ForgotPassword')}
          hitSlop={{ top: 8, bottom: 8 }}
        >
          <Text style={s.forgotPassText}>Quên mật khẩu?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.loginBtn, isLoading && s.btnDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <View style={s.loginBtnInner}>
              <Text style={s.loginBtnText}>Đăng nhập</Text>
              <ChevronRight size={20} color={COLORS.white} />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={['#FEF9F5', '#FFF0E5']}
        style={s.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={s.flex}
        >
          <ScrollView
            contentContainerStyle={s.scrollContent}
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

export default LoginScreen;
