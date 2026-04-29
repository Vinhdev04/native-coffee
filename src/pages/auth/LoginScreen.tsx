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
} from 'react-native';
import { useTranslation }  from 'react-i18next';
import { useAuth }         from '~/context/AuthContext';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '~/styles/theme';
import { encryptWithRSA }  from '~/utils/encryption';
import axiosClient         from '~/api/axiosClient';
import Toast               from 'react-native-toast-message';
import LinearGradient     from 'react-native-linear-gradient';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  Coffee as CoffeeIcon, 
  ChevronRight 
} from 'lucide-react-native';

const LoginScreen = () => {
  const { t }    = useTranslation();
  const { login } = useAuth();

  const [username,  setUsername]  = useState('');
  const [password,  setPassword]  = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPass,  setShowPass]  = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Toast.show({ type: 'error', text1: 'Vui lòng nhập đầy đủ thông tin', position: 'bottom' });
      return;
    }

    setIsLoading(true);
    try {
      // Mã hóa password nếu có publicKey, không thì gửi thẳng
      let encryptedPassword = password;
      try { encryptedPassword = await encryptWithRSA(password); } catch (_) {}

      const response: any = await axiosClient.post('/auth/login', {
        username: username.trim(),
        password: encryptedPassword,
      });

      if (response?.res_code === 0 && response?.rows?.[0]) {
        const { token, ...userData } = response.rows[0];
        await login(token, userData);
        Toast.show({ type: 'success', text1: '☕ Chào mừng đến Native Coffee!', position: 'bottom' });
      }
    } catch (error: any) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
                value={username}
                onChangeText={setUsername}
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
                style={[styles.input, { flex: 1 }]}
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
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.loginBtnContent}>
                <Text style={styles.loginBtnText}>{t('auth.loginButton')}</Text>
                <ChevronRight size={18} color={COLORS.white} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>© 2025 Native Coffee. All rights reserved.</Text>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width:           100,
    height:          100,
    borderRadius:    32,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent:  'center',
    alignItems:      'center',
    marginBottom:    SPACING.lg,
  },
  brandName: {
    fontFamily: FONTS.bold,
    fontSize:   32,
    color:      COLORS.white,
    letterSpacing: 2,
  },
  tagline: {
    fontFamily: FONTS.regular,
    fontSize:   14,
    color:      'rgba(255,255,255,0.7)',
    marginTop:  8,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius:    32,
    padding:         SPACING.xl,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 10 },
    shadowOpacity:   0.2,
    shadowRadius:    20,
    elevation:       12,
  },
  cardTitle: {
    fontFamily:   FONTS.bold,
    fontSize:     24,
    color:        COLORS.primary,
    marginBottom: 30,
    textAlign:    'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily:   FONTS.semiBold,
    fontSize:     14,
    color:        COLORS.textSecondary,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceWarm,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontFamily:       FONTS.regular,
    fontSize:         15,
    color:            COLORS.textPrimary,
  },
  eyeBtn: {
    padding: 8,
  },
  loginBtn: {
    height:         56,
    backgroundColor: COLORS.accent,
    borderRadius:   18,
    justifyContent: 'center',
    alignItems:     'center',
    marginTop:      10,
    elevation: 4,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  loginBtnDisabled: {
    opacity: 0.7,
  },
  loginBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loginBtnText: {
    fontFamily: FONTS.bold,
    fontSize:   17,
    color:      COLORS.white,
  },
  footer: {
    textAlign:    'center',
    fontFamily:   FONTS.regular,
    fontSize:     12,
    color:        'rgba(255,255,255,0.5)',
    marginTop:    40,
  },
});

export default LoginScreen;
