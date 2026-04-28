import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Image,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useTranslation }  from 'react-i18next';
import { useAuth }         from '~/context/AuthContext';
import { COLORS, FONTS, SPACING } from '~/styles/theme';
import { encryptWithRSA }  from '~/utils/encryption';
import axiosClient         from '~/api/axiosClient';
import Toast               from 'react-native-toast-message';

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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>☕</Text>
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

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('auth.password')}</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                value={password}
                onChangeText={setPassword}
                placeholder="Nhập mật khẩu"
                placeholderTextColor={COLORS.placeholder}
                secureTextEntry={!showPass}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass(!showPass)}>
                <Text style={styles.eyeIcon}>{showPass ? '🙈' : '👁️'}</Text>
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
              <Text style={styles.loginBtnText}>☕ {t('auth.loginButton')}</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>© 2025 Native Coffee. All rights reserved.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logoContainer: {
    width:           100,
    height:          100,
    borderRadius:    50,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent:  'center',
    alignItems:      'center',
    marginBottom:    SPACING.md,
  },
  logoEmoji: {
    fontSize: 52,
  },
  brandName: {
    fontFamily: FONTS.bold,
    fontSize:   28,
    color:      COLORS.white,
    letterSpacing: 1,
  },
  tagline: {
    fontFamily: FONTS.regular,
    fontSize:   13,
    color:      'rgba(255,255,255,0.7)',
    marginTop:  6,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius:    24,
    padding:         SPACING.lg,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 8 },
    shadowOpacity:   0.15,
    shadowRadius:    20,
    elevation:       10,
  },
  cardTitle: {
    fontFamily:   FONTS.bold,
    fontSize:     22,
    color:        COLORS.primary,
    marginBottom: SPACING.lg,
    textAlign:    'center',
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    fontFamily:   FONTS.semiBold,
    fontSize:     13,
    color:        COLORS.textSecondary,
    marginBottom: 6,
  },
  input: {
    height:           52,
    borderWidth:      1.5,
    borderColor:      COLORS.border,
    borderRadius:     12,
    paddingHorizontal: SPACING.md,
    fontFamily:       FONTS.regular,
    fontSize:         15,
    color:            COLORS.textPrimary,
    backgroundColor:  COLORS.surfaceWarm,
  },
  passwordWrapper: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeBtn: {
    position:     'absolute',
    right:        14,
    top:          14,
  },
  eyeIcon: {
    fontSize: 20,
  },
  loginBtn: {
    height:         54,
    backgroundColor: COLORS.accent,
    borderRadius:   14,
    justifyContent: 'center',
    alignItems:     'center',
    marginTop:      SPACING.sm,
  },
  loginBtnDisabled: {
    opacity: 0.7,
  },
  loginBtnText: {
    fontFamily: FONTS.bold,
    fontSize:   16,
    color:      COLORS.white,
    letterSpacing: 0.5,
  },
  footer: {
    textAlign:    'center',
    fontFamily:   FONTS.regular,
    fontSize:     11,
    color:        'rgba(255,255,255,0.5)',
    marginTop:    SPACING.xl,
  },
});

export default LoginScreen;
