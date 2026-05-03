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
  ImageBackground, StatusBar
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

const BG_IMAGE = 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1000&auto=format&fit=crop';

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
    <View style={s.container}>
      <StatusBar barStyle="light-content" transparent backgroundColor="transparent" />
      <ImageBackground source={{ uri: BG_IMAGE }} style={s.bgImage}>
        <LinearGradient
          colors={['rgba(17, 9, 5, 0.4)', 'rgba(17, 9, 5, 0.9)', COLORS.primary]}
          style={s.gradient}
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
                  <Text style={s.title}>Tạo tài khoản</Text>
                  <Text style={s.subtitle}>Khởi đầu hành trình thưởng thức cà phê cùng Native Coffee</Text>
                </View>

                {/* Form Card */}
                <View style={s.form}>
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
                    style={[s.registerBtn, isLoading && s.btnDisabled]}
                    onPress={handleRegister}
                    disabled={isLoading}
                    activeOpacity={0.85}
                  >
                    {isLoading ? (
                      <ActivityIndicator color={COLORS.white} />
                    ) : (
                      <Text style={s.registerBtnText}>Đăng ký ngay</Text>
                    )}
                  </TouchableOpacity>

                  <View style={s.footer}>
                    <Text style={s.footerText}>Đã có tài khoản? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                      <Text style={s.loginText}>Đăng nhập</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  bgImage: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 24,
  },
  safe: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  backBtn: {
    marginTop: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
  },
  header: {
    marginTop: 30,
    marginBottom: 40,
  },
  logoMini: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 32,
    color: COLORS.white,
  },
  subtitle: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 8,
  },
  form: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 30,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  inputIcon: {
    marginRight: 4,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.white,
  },
  registerBtn: {
    backgroundColor: COLORS.accent,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    elevation: 5,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  registerBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.white,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
  },
  footerText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  loginText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.accent,
  },
});

export default RegisterScreen;
