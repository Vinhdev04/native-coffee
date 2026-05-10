import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView,
  Platform, ScrollView, StatusBar,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '@/styles/theme';
import { forgotPasswordApi } from '@/services/authService';
import Toast from 'react-native-toast-message';
import LinearGradient from 'react-native-linear-gradient';
import { Mail, ChevronLeft, CheckCircle, KeyRound } from 'lucide-react-native';

const ForgotPasswordScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" transparent backgroundColor="transparent" />
      <LinearGradient colors={['#FEF9F5', '#FFF0E5']} style={styles.gradient}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.card}>
              <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
                <View style={styles.backIconWrapper}>
                  <ChevronLeft size={20} color={COLORS.textPrimary} />
                </View>
              </TouchableOpacity>

              <View style={styles.iconContainer}>
                <KeyRound size={32} color={COLORS.primary} />
              </View>

              <Text style={styles.title}>Quên mật khẩu?</Text>
              <Text style={styles.subtitle}>
                Nhập email đã đăng ký, chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu cho bạn.
              </Text>

              {!isSuccess ? (
                <>
                  <View style={styles.inputContainer}>
                    <Mail size={20} color={COLORS.textMuted} />
                    <TextInput
                      style={styles.input}
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
                    style={[styles.submitBtn, isLoading && styles.btnDisabled]}
                    onPress={handleSubmit}
                    disabled={isLoading}
                    activeOpacity={0.85}
                  >
                    {isLoading ? (
                      <ActivityIndicator color={COLORS.white} />
                    ) : (
                      <Text style={styles.submitBtnText}>Gửi yêu cầu</Text>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.successContainer}>
                  <View style={styles.checkCircle}>
                    <CheckCircle size={48} color={COLORS.success} />
                  </View>
                  <Text style={styles.successTitle}>Đã gửi yêu cầu!</Text>
                  <Text style={styles.successDesc}>
                    Vui lòng kiểm tra email <Text style={styles.successEmail}>{email}</Text> và làm theo hướng dẫn để đặt lại mật khẩu.
                  </Text>
                  <TouchableOpacity
                    style={styles.backToLoginBtn}
                    onPress={() => navigation.navigate('Login')}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.backToLoginText}>Quay lại đăng nhập</Text>
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
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 28,
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#FFF0E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 28,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 24,
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
  submitBtn: {
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
  submitBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.white,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  checkCircle: {
    marginBottom: 16,
  },
  successTitle: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  successDesc: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    paddingHorizontal: 10,
  },
  successEmail: {
    fontFamily: FONTS.semiBold,
    color: COLORS.primary,
  },
  backToLoginBtn: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 24,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backToLoginText: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
});

export default ForgotPasswordScreen;
