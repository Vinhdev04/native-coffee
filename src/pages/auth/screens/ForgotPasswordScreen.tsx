import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, KeyboardAvoidingView,
  Platform, ScrollView, StatusBar, useWindowDimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '@/styles/theme';
import { forgotPasswordApi } from '@/services/authService';
import Toast from 'react-native-toast-message';
import LinearGradient from 'react-native-linear-gradient';
import { Mail, ChevronLeft, CheckCircle, KeyRound } from 'lucide-react-native';
import { s } from '../styles/ForgotPasswordScreen.styles';

// TODO: Thành phần chính ForgotPasswordScreen dùng để khôi phục mật khẩu tài khoản
const ForgotPasswordScreen = () => {
  const { width } = useWindowDimensions();
  // todo: kiểm tra kích thước màn hình nhỏ
  const isSmallScreen = width < 360;
  
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  // todo: lưu trữ email người dùng nhập
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // TODO: Hàm xử lý gửi yêu cầu khôi phục mật khẩu tới API
  const handleSubmit = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      Toast.show({ type: 'error', text1: t('common.error'), text2: 'Vui lòng nhập email', position: 'bottom' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await forgotPasswordApi({ email: trimmedEmail });

      if (response?.res_code === 0) {
        setIsSuccess(true);
        Toast.show({ type: 'success', text1: 'Yêu cầu thành công!', text2: 'Vui lòng kiểm tra email của bạn.', position: 'bottom' });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Yêu cầu thất bại',
          text2: response?.error_cont || 'Không thể gửi yêu cầu, vui lòng thử lại sau.',
          position: 'bottom',
        });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi kết nối',
        text2: error?.message || 'Vui lòng thử lại sau',
        position: 'bottom',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <LinearGradient colors={['#FEF9F5', '#FFF0E5']} style={[s.gradient, { paddingHorizontal: isSmallScreen ? 16 : 24 }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={s.keyboardView}
        >
          <ScrollView
            contentContainerStyle={s.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={[s.card, { padding: isSmallScreen ? 18 : 28 }]}>
              <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
                <View style={s.backIconWrapper}>
                  <ChevronLeft size={20} color={COLORS.textPrimary} />
                </View>
              </TouchableOpacity>

              <View style={[s.iconContainer, isSmallScreen && { marginBottom: 12 }]}>
                <KeyRound size={32} color={COLORS.primary} />
              </View>

              <Text style={[s.title, { fontSize: isSmallScreen ? 20 : 24 }]}>Quên mật khẩu?</Text>
              <Text style={[s.subtitle, { fontSize: isSmallScreen ? 13 : 15, marginBottom: isSmallScreen ? 18 : 28 }]}>
                Nhập email đã đăng ký, chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu cho bạn.
              </Text>

              {!isSuccess ? (
                <>
                  <View style={[s.inputContainer, { marginBottom: isSmallScreen ? 16 : 24 }]}>
                    <Mail size={20} color={COLORS.textMuted} />
                    <TextInput
                      style={s.input}
                      placeholder="Email của bạn"
                      placeholderTextColor={COLORS.textMuted}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>

                  <TouchableOpacity
                    style={[s.submitBtn, isLoading && s.btnDisabled]}
                    onPress={handleSubmit}
                    disabled={isLoading}
                    activeOpacity={0.85}
                  >
                    {isLoading ? (
                      <ActivityIndicator color={COLORS.white} />
                    ) : (
                      <Text style={s.submitBtnText}>Gửi yêu cầu</Text>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                <View style={s.successContainer}>
                  <View style={s.checkCircle}>
                    <CheckCircle size={48} color={COLORS.success} />
                  </View>
                  <Text style={s.successTitle}>Đã gửi yêu cầu!</Text>
                  <Text style={s.successDesc}>
                    Vui lòng kiểm tra email <Text style={s.successEmail}>{email}</Text> và làm theo hướng dẫn để đặt lại mật khẩu.
                  </Text>
                  <TouchableOpacity
                    style={s.backToLoginBtn}
                    onPress={() => navigation.navigate('Login')}
                    activeOpacity={0.85}
                  >
                    <Text style={s.backToLoginText}>Quay lại đăng nhập</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
};

export default ForgotPasswordScreen;
