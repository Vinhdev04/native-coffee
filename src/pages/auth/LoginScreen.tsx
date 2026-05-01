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
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  Coffee as CoffeeIcon, 
  ChevronRight,
  Fingerprint
} from 'lucide-react-native';

const BG_IMAGE = 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1000&auto=format&fit=crop';

const LoginScreen = () => {
  const { t }    = useTranslation();
  const { login } = useAuth();
  const navigation = useNavigation<any>();

  const [userName,  setUserName]  = useState('');
  const [password,  setPassword]  = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPass,  setShowPass]  = useState(false);

  const handleLogin = async () => {
    if (!userName.trim() || !password.trim()) {
      Toast.show({ type: 'error', text1: 'Vui lòng nhập đầy đủ thông tin', position: 'bottom' });
      return;
    }

    setIsLoading(true);
    try {
      let encryptedPassword = password;
      try { encryptedPassword = await encryptWithRSA(password); } catch (_) {}

      const response = await loginApi({
        userName: userName.trim(),
        password: encryptedPassword,
      });

<<<<<<< HEAD
      if (response?.res_code === 0 && response?.rows?.[0]) {
        const { token, ...userData } = response.rows[0];
        await login(token, userData);
        Toast.show({ type: 'success', text1: '☕ Chào mừng đến Native Coffee!', position: 'bottom' });
      } else {
        Toast.show({ type: 'error', text1: response?.error_cont || 'Đăng nhập thất bại', position: 'bottom' });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      Toast.show({ type: 'error', text1: 'Có lỗi kết nối, vui lòng thử lại', position: 'bottom' });
=======
      // Hỗ trợ cả cấu trúc rows (legacy) và data (new chips api)
      const userDataFromRows = response?.rows?.[0];
      const userDataFromData = response?.user || response?.data;
      const finalUserData = userDataFromRows || userDataFromData;
      const token = response?.token || finalUserData?.token;

      if ((response?.res_code === 0 || token) && finalUserData) {
        if (token) {
          await login(token, finalUserData);
          Toast.show({ type: 'success', text1: '☕ Chào mừng đến Native Coffee!', position: 'bottom' });
        } else {
          Toast.show({ type: 'error', text1: 'Không tìm thấy Token xác thực', position: 'bottom' });
        }
      } else {
        // Lấy thông báo lỗi chi tiết nhất có thể
        const errorMsg = response?.data?.message || response?.error_cont || 'Đăng nhập không thành công';
        const errorCode = response?.error_code ? `[${response.error_code}] ` : '';
        
        console.log('--- LOGIN FAILED ---');
        console.log('Response:', JSON.stringify(response, null, 2));

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
        text2: error.message,
        position: 'bottom' 
      });
>>>>>>> 6976078b349132f627fc11d294182dc03d5eb3ab
    } finally {
      setIsLoading(false);
    }
  };

  return (
<<<<<<< HEAD
    <View style={styles.container}>
      <StatusBar barStyle="light-content" transparent backgroundColor="transparent" />
      <ImageBackground source={{ uri: BG_IMAGE }} style={styles.bgImage}>
        <LinearGradient
          colors={['transparent', 'rgba(17, 9, 5, 0.8)', COLORS.primary]}
          style={styles.gradient}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
=======
    <LinearGradient
      colors={[COLORS.primary, COLORS.primaryDark]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <CoffeeIcon size={52} color={COLORS.white} />
          </View>
          <Text style={styles.brandName}>Native Coffee</Text>
          <Text style={styles.tagline}>Hương vị đỉnh cao, phục vụ tận tâm</Text>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Đăng nhập</Text>

          {/* Username */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('auth.username')}</Text>
            <View style={styles.inputWrapper}>
              <User size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={userName}
                onChangeText={setUserName}
                placeholder="Nhập tên đăng nhập"
                placeholderTextColor={COLORS.placeholder}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('auth.password')}</Text>
            <View style={styles.inputWrapper}>
              <Lock size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Nhập mật khẩu"
                placeholderTextColor={COLORS.placeholder}
                secureTextEntry={!showPass}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={20} color={COLORS.textSecondary} /> : <Eye size={20} color={COLORS.textSecondary} />}
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginBtn, isLoading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.85}
>>>>>>> 6976078b349132f627fc11d294182dc03d5eb3ab
          >
            <ScrollView 
              contentContainerStyle={styles.scrollContent} 
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Header / Logo */}
              <View style={styles.header}>
                <View style={styles.logoBadge}>
                  <CoffeeIcon size={40} color={COLORS.white} />
                </View>
                <Text style={styles.brandName}>NATIVE{'\n'}COFFEE</Text>
                <View style={styles.divider} />
                <Text style={styles.tagline}>Premium Coffee Experience</Text>
              </View>

              {/* Form Section */}
              <View style={styles.formContainer}>
                <Text style={styles.welcomeText}>Chào mừng trở lại!</Text>
                
                {/* Username Input */}
                <View style={styles.inputContainer}>
                  <User size={20} color={COLORS.textMuted} />
                  <TextInput
                    style={styles.input}
                    placeholder="Tên đăng nhập"
                    placeholderTextColor={COLORS.textMuted}
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                  />
                </View>

                {/* Password Input */}
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

                {/* Action Buttons */}
                <TouchableOpacity
                  style={[styles.loginBtn, isLoading && styles.btnDisabled]}
                  onPress={handleLogin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <Text style={styles.loginBtnText}>Đăng nhập</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.footerRow}>
                  <Text style={styles.footerText}>Chưa có tài khoản? </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                    <Text style={styles.registerText}>Đăng ký ngay</Text>
                  </TouchableOpacity>
                </View>

                {/* Bio Login Placeholder */}
                <TouchableOpacity style={styles.bioBtn}>
                  <Fingerprint size={32} color={COLORS.accent} />
                  <Text style={styles.bioText}>Sử dụng vân tay</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  bgImage: {
    flex: 1,
    width: '100%',
    height: '100%',
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
    justifyContent: 'flex-end',
    paddingBottom: 40,
    paddingTop: 80,
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 10,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  brandName: {
    fontFamily: FONTS.bold,
    fontSize: 40,
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: 45,
    letterSpacing: 4,
  },
  divider: {
    width: 50,
    height: 3,
    backgroundColor: COLORS.accent,
    marginVertical: 15,
    borderRadius: 2,
  },
  tagline: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  formContainer: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 30,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backdropFilter: 'blur(10px)', // Note: Only works on some platforms/libs, but good for design intent
  },
  welcomeText: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: COLORS.white,
    marginBottom: 25,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.white,
  },
  forgotPass: {
    alignSelf: 'flex-end',
    marginBottom: 25,
  },
  forgotPassText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.accentLight,
  },
  loginBtn: {
    backgroundColor: COLORS.accent,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  loginBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.white,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
  },
  footerText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  registerText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.accent,
  },
  bioBtn: {
    marginTop: 30,
    alignItems: 'center',
    gap: 8,
  },
  bioText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
  },
});

export default LoginScreen;
