import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, User, Mail, Save, Smile } from 'lucide-react-native';
import { COLORS, FONTS } from '@/styles/theme';
import { useAuth } from '@/context/AuthContext';
import { updateProfileApi } from '@/services/authService';
import Toast from 'react-native-toast-message';

const UpdateProfileScreen = () => {
  const navigation = useNavigation();
  const { user, login, token } = useAuth(); 

  const [name, setName] = useState(user?.fullName || user?.name || user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [username, setUsername] = useState(user?.username || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Toast.show({ type: 'error', text1: 'Vui lòng nhập họ tên' });
      return;
    }
    if (!user?.id) {
      Toast.show({ type: 'error', text1: 'Không tìm thấy ID người dùng' });
      return;
    }
    try {
      setLoading(true);
      const payload = {
        name: name.trim(),
        email: email.trim(),
        username: username.trim() || user?.username,
      };
      
      const response: any = await updateProfileApi(user.id, payload);
      if (response && (response.res_code === 0 || response.status === 200 || response.message === "Cập nhật thành công")) {
        Toast.show({ type: 'success', text1: 'Cập nhật thành công' });
        
        // Cập nhật local context
        if (token && user) {
          await login(token, { ...user, fullName: payload.name, name: payload.name, email: payload.email });
        }
        
        setTimeout(() => navigation.goBack(), 1000);
      } else {
        Toast.show({ type: 'error', text1: response?.message || response?.error_cont || 'Cập nhật thất bại' });
      }
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: error.message || 'Lỗi kết nối máy chủ' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Cập Nhật Hồ Sơ</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={s.avatarSection}>
          <View style={s.avatarWrap}>
            <Smile size={36} color="#F97316" />
          </View>
          <Text style={s.profileEmail}>{user?.username || 'user'}</Text>
        </View>

        <View style={s.form}>
          <View style={s.inputGroup}>
            <Text style={s.label}>HỌ VÀ TÊN</Text>
            <View style={s.inputBox}>
              <User size={20} color="#9CA3AF" />
              <TextInput
                style={s.input}
                value={name}
                onChangeText={setName}
                placeholder="Nhập họ và tên"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <View style={s.inputGroup}>
            <Text style={s.label}>EMAIL</Text>
            <View style={s.inputBox}>
              <Mail size={20} color="#9CA3AF" />
              <TextInput
                style={s.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Nhập địa chỉ email"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <TouchableOpacity
            style={s.saveBtn}
            onPress={handleSave}
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
  
  avatarSection: { alignItems: 'center', marginTop: 10, marginBottom: 32 },
  avatarWrap: {
    width: 80, height: 80,
    borderRadius: 24,
    backgroundColor: '#FFEDD5',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
  },
  profileEmail: { fontFamily: FONTS.regular, fontSize: 14, color: '#6B7280' },

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
  saveBtnText: { fontFamily: FONTS.bold, fontSize: 16, color: '#FFF', marginLeft: 8 },
});

export default UpdateProfileScreen;
