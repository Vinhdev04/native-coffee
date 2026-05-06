import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, ActivityIndicator, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, ShieldCheck, Lock, EyeOff, Eye, Save } from 'lucide-react-native';
import { COLORS, FONTS } from '@/styles/theme';
import Toast from '@/components/common/Toast';
import { useAuth } from '@/context/AuthContext';
import { changePasswordApi } from '@/services/authService';
import { encryptWithRSA } from '@/utils/encryption';
import { Formik } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
  oldPassword: Yup.string()
    .required('Vui lòng nhập mật khẩu hiện tại'),
  newPassword: Yup.string()
    .min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự')
    .required('Vui lòng nhập mật khẩu mới'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null as any], 'Xác nhận mật khẩu không khớp')
    .required('Vui lòng xác nhận mật khẩu'),
});

const ChangePasswordScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; type: 'success' | 'error' | 'info'; title: string; message: string }>({ 
    visible: false, type: 'success', title: '', message: '' 
  });

  const handleSubmit = async (values: any, { resetForm }: any) => {
    try {
      setLoading(true);
      
      let encryptedOld = values.oldPassword;
      let encryptedNew = values.newPassword;
      let encryptedConfirm = values.confirmPassword;
      
      try {
        encryptedOld = await encryptWithRSA(values.oldPassword.trim());
        encryptedNew = await encryptWithRSA(values.newPassword.trim());
        encryptedConfirm = await encryptWithRSA(values.confirmPassword.trim());
      } catch (err) {
        console.warn('RSA encryption failed', err);
      }

      const response: any = await changePasswordApi({
        oldPassword: encryptedOld,
        newPassword: encryptedNew,
        confirmPassword: encryptedConfirm,
      });

      if (response && (response.res_code === 0 || response.status === 200)) {
        setToast({ visible: true, type: 'success', title: 'Thành công', message: 'Đã đổi mật khẩu thành công' });
        setTimeout(() => navigation.goBack(), 1500);
      } else {
        setToast({ visible: true, type: 'error', title: 'Thất bại', message: response?.message || response?.error_cont || 'Không thể đổi mật khẩu' });
      }
    } catch (error) {
      console.error('Change password error', error);
      setToast({ visible: true, type: 'error', title: 'Lỗi', message: 'Lỗi kết nối máy chủ' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <Toast
        visible={toast.visible}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onHide={() => setToast(t => ({ ...t, visible: false }))}
      />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Đổi Mật Khẩu</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Banner Info */}
        <View style={s.banner}>
          <View style={s.bannerIconBox}>
            <ShieldCheck size={24} color="#EA580C" />
          </View>
          <View style={s.bannerTextWrap}>
            <Text style={s.bannerTitle}>Bảo mật tài khoản</Text>
            <Text style={s.bannerDesc}>Đổi mật khẩu định kỳ giúp bảo vệ dữ liệu của bạn</Text>
          </View>
        </View>

        <Formik
          initialValues={{ oldPassword: '', newPassword: '', confirmPassword: '' }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <View style={s.form}>
              {/* Old Password */}
              <View style={s.inputGroup}>
                <Text style={s.label}>MẬT KHẨU HIỆN TẠI</Text>
                <View style={[s.inputBox, touched.oldPassword && errors.oldPassword ? s.inputError : null]}>
                  <Lock size={20} color={touched.oldPassword && errors.oldPassword ? "#EF4444" : "#9CA3AF"} />
                  <TextInput
                    style={s.input}
                    value={values.oldPassword}
                    onChangeText={handleChange('oldPassword')}
                    onBlur={handleBlur('oldPassword')}
                    secureTextEntry={!showOld}
                    placeholder="Nhập mật khẩu hiện tại"
                    placeholderTextColor="#9CA3AF"
                  />
                  <TouchableOpacity onPress={() => setShowOld(!showOld)} style={s.eyeBtn}>
                    {showOld ? <Eye size={20} color="#9CA3AF" /> : <EyeOff size={20} color="#9CA3AF" />}
                  </TouchableOpacity>
                </View>
                {touched.oldPassword && errors.oldPassword && (
                  <Text style={s.errorText}>{errors.oldPassword as string}</Text>
                )}
              </View>

              {/* New Password */}
              <View style={s.inputGroup}>
                <Text style={s.label}>MẬT KHẨU MỚI</Text>
                <View style={[s.inputBox, touched.newPassword && errors.newPassword ? s.inputError : null]}>
                  <Lock size={20} color={touched.newPassword && errors.newPassword ? "#EF4444" : "#9CA3AF"} />
                  <TextInput
                    style={s.input}
                    value={values.newPassword}
                    onChangeText={handleChange('newPassword')}
                    onBlur={handleBlur('newPassword')}
                    secureTextEntry={!showNew}
                    placeholder="Tối thiểu 8 ký tự"
                    placeholderTextColor="#9CA3AF"
                  />
                  <TouchableOpacity onPress={() => setShowNew(!showNew)} style={s.eyeBtn}>
                    {showNew ? <Eye size={20} color="#9CA3AF" /> : <EyeOff size={20} color="#9CA3AF" />}
                  </TouchableOpacity>
                </View>
                {touched.newPassword && errors.newPassword && (
                  <Text style={s.errorText}>{errors.newPassword as string}</Text>
                )}
              </View>

              {/* Confirm Password */}
              <View style={s.inputGroup}>
                <Text style={s.label}>XÁC NHẬN MẬT KHẨU</Text>
                <View style={[s.inputBox, touched.confirmPassword && errors.confirmPassword ? s.inputError : null]}>
                  <ShieldCheck size={20} color={touched.confirmPassword && errors.confirmPassword ? "#EF4444" : "#9CA3AF"} />
                  <TextInput
                    style={s.input}
                    value={values.confirmPassword}
                    onChangeText={handleChange('confirmPassword')}
                    onBlur={handleBlur('confirmPassword')}
                    secureTextEntry={!showConfirm}
                    placeholder="Nhập lại mật khẩu mới"
                    placeholderTextColor="#9CA3AF"
                  />
                  <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={s.eyeBtn}>
                    {showConfirm ? <Eye size={20} color="#9CA3AF" /> : <EyeOff size={20} color="#9CA3AF" />}
                  </TouchableOpacity>
                </View>
                {touched.confirmPassword && errors.confirmPassword && (
                  <Text style={s.errorText}>{errors.confirmPassword as string}</Text>
                )}
              </View>

              <TouchableOpacity
                style={s.saveBtn}
                onPress={() => handleSubmit()}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Save size={20} color="#fff" />
                    <Text style={s.saveBtnText}>Lưu thay đổi</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </Formik>
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FEF9F6' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 12 : 0,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 18, color: '#111827' },
  
  content: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 10 },
  
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEDD5',
    padding: 16,
    borderRadius: 16,
    marginBottom: 32,
  },
  bannerIconBox: {
    width: 48, height: 48,
    borderRadius: 16,
    backgroundColor: '#FFF',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 16,
  },
  bannerTextWrap: { flex: 1 },
  bannerTitle: { fontFamily: FONTS.bold, fontSize: 15, color: '#9A3412', marginBottom: 4 },
  bannerDesc: { fontFamily: FONTS.regular, fontSize: 12, color: '#C2410C', lineHeight: 18 },

  form: { gap: 20 },
  inputGroup: { gap: 8 },
  label: { fontFamily: FONTS.bold, fontSize: 11, color: '#6B7280', letterSpacing: 0.5 },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingLeft: 16,
    height: 56,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02, shadowRadius: 4, elevation: 1,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontFamily: FONTS.medium,
    fontSize: 15,
    color: '#111827',
  },
  eyeBtn: { padding: 16 },
  
  saveBtn: {
    flexDirection: 'row',
    backgroundColor: '#F97316',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#F97316', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  saveBtnText: { fontFamily: FONTS.bold, fontSize: 16, color: '#FFF' },
});

export default ChangePasswordScreen;
