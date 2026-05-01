/**
 * @file RegisterScreen.tsx
 * @desc Màn hình đăng ký tài khoản mới.
 * @layer pages/auth
 */

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, 
  Platform, ScrollView, SafeAreaView,
} from 'react-native';
import { useTranslation }  from 'react-i18next';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '@/styles/theme';
import { registerApi }     from '@/services/authService';
import { encryptWithRSA }  from '@/utils/encryption';
import Toast               from 'react-native-toast-message';
import LinearGradient     from 'react-native-linear-gradient';
import { 
  User, 
  Lock, 
  Mail, 
  Phone, 
  UserPlus, 
  ChevronLeft,
  ChevronRight,
  Coffee as CoffeeIcon
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const RegisterScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail]       = useState('');
  const [phone, setPhone]       = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!userName.trim() || !password.trim() || !fullName.trim()) {
      Toast.show({ type: 'error', text1: 'Vui lòng nhập các trường bắt buộc (*)', position: 'bottom' });
      return;
    }

    setIsLoading(true);
    try {
      // Mã hóa password giống màn hình Login
      let encryptedPassword = password;
      try { 
        encryptedPassword = await encryptWithRSA(password); 
      } catch (err) {
        console.warn('RSA Encryption failed, sending plain password', err);
      }

      const response = await registerApi({
        userName: userName.trim(),
        password: encryptedPassword,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
      });

      if (response?.res_code === 0) {
        Toast.show({ type: 'success', text1: 'Đăng ký thành công! Hãy đăng nhập.', position: 'bottom' });
        navigation.navigate('Login');
      } else {
        Toast.show({ type: 'error', text1: response?.error_cont || 'Đăng ký thất bại', position: 'bottom' });
      }
    } catch (error) {
      console.error('Register error:', error);
      Toast.show({ type: 'error', text1: 'Có lỗi xảy ra, vui lòng thử lại sau', position: 'bottom' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[COLORS.primary, COLORS.primaryDark]}
      style={s.container}
    >
      <SafeAreaView style={s.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={s.keyboardView}
        >
          <ScrollView 
            contentContainerStyle={s.scrollContent} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={s.header}>
              <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
                <ChevronLeft size={28} color={COLORS.white} />
              </TouchableOpacity>
              <View style={s.logoMini}>
                <CoffeeIcon size={24} color={COLORS.white} />
              </View>
              <Text style={s.brandTitle}>Tạo tài khoản</Text>
              <Text style={s.brandSub}>Khởi đầu hành trình thưởng thức cà phê cùng Native Coffee</Text>
            </View>

            {/* Form Card */}
            <View style={s.card}>
              {/* Full Name */}
              <View style={s.inputGroup}>
                <Text style={s.label}>Họ và tên *</Text>
                <View style={s.inputWrapper}>
                  <User size={20} color={COLORS.textSecondary} style={s.inputIcon} />
                  <TextInput
                    style={s.input}
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Nhập họ tên đầy đủ"
                    placeholderTextColor={COLORS.placeholder}
                  />
                </View>
              </View>

              {/* Username */}
              <View style={s.inputGroup}>
                <Text style={s.label}>Tên đăng nhập *</Text>
                <View style={s.inputWrapper}>
                  <UserPlus size={20} color={COLORS.textSecondary} style={s.inputIcon} />
                  <TextInput
                    style={s.input}
                    value={userName}
                    onChangeText={setUserName}
                    placeholder="Chọn tên đăng nhập"
                    placeholderTextColor={COLORS.placeholder}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Password */}
              <View style={s.inputGroup}>
                <Text style={s.label}>Mật khẩu *</Text>
                <View style={s.inputWrapper}>
                  <Lock size={20} color={COLORS.textSecondary} style={s.inputIcon} />
                  <TextInput
                    style={s.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Nhập mật khẩu"
                    placeholderTextColor={COLORS.placeholder}
                    secureTextEntry
                  />
                </View>
              </View>

              {/* Email */}
              <View style={s.inputGroup}>
                <Text style={s.label}>Email (không bắt buộc)</Text>
                <View style={s.inputWrapper}>
                  <Mail size={20} color={COLORS.textSecondary} style={s.inputIcon} />
                  <TextInput
                    style={s.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="example@gmail.com"
                    placeholderTextColor={COLORS.placeholder}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Phone */}
              <View style={s.inputGroup}>
                <Text style={s.label}>Số điện thoại</Text>
                <View style={s.inputWrapper}>
                  <Phone size={20} color={COLORS.textSecondary} style={s.inputIcon} />
                  <TextInput
                    style={s.input}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="Nhập số điện thoại"
                    placeholderTextColor={COLORS.placeholder}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              {/* Register Button */}
              <TouchableOpacity
                style={[s.registerBtn, isLoading && s.registerBtnDisabled]}
                onPress={handleRegister}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <View style={s.btnContent}>
                    <Text style={s.btnText}>Đăng ký ngay</Text>
                    <ChevronRight size={18} color={COLORS.white} />
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={s.loginLink} onPress={() => navigation.navigate('Login')}>
                <Text style={s.loginLinkText}>
                  Đã có tài khoản? <Text style={s.loginLinkBold}>Đăng nhập</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const s = StyleSheet.create({
  container:    { flex: 1 },
  safe:         { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent:{ padding: SPACING.lg, paddingBottom: 60 },
  header:       { marginBottom: 30, marginTop: 10 },
  backBtn:      { width: 40, height: 40, justifyContent: 'center', marginBottom: 15 },
  logoMini:     { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  brandTitle:   { fontFamily: FONTS.bold, fontSize: 28, color: COLORS.white },
  brandSub:     { fontFamily: FONTS.regular, fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 8 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius:    32,
    padding:         SPACING.xl,
    elevation:       12,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 10 },
    shadowOpacity:   0.2,
    shadowRadius:    20,
  },
  inputGroup:   { marginBottom: 18 },
  label:        { fontFamily: FONTS.semiBold, fontSize: 13, color: COLORS.textSecondary, marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surfaceWarm, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 16, paddingHorizontal: 16, height: 52 },
  inputIcon:    { marginRight: 12 },
  input:        { flex: 1, fontFamily: FONTS.regular, fontSize: 14, color: COLORS.textPrimary },
  registerBtn:  { height: 56, backgroundColor: COLORS.accent, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginTop: 10, elevation: 4, shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6 },
  registerBtnDisabled: { opacity: 0.7 },
  btnContent:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnText:      { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.white },
  loginLink:    { marginTop: 24, alignItems: 'center' },
  loginLinkText:{ fontFamily: FONTS.regular, fontSize: 14, color: COLORS.textSecondary },
  loginLinkBold:{ fontFamily: FONTS.bold, color: COLORS.accent },
});

export default RegisterScreen;
