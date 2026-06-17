import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, User, Mail, Save, Smile } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { updateProfileApi } from '@/services/authService';
import Toast from 'react-native-toast-message';
import { s } from '../styles/UpdateProfileScreen.styles';

const UpdateProfileScreen = () => {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 360;

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
        
        if (token && user) {
          await login(token, { ...user, fullName: payload.name, name: payload.name, email: payload.email });
        }
        
        setTimeout(() => navigation.goBack(), 1000);
      } else {
        Toast.show({ type: 'error', text1: response?.message || response?.error_cont || 'Cập nhật thất bại' });
      }
    } catch (error: any) {
      console.error("Lỗi cập nhật thông tin cá nhân:", error);
      Toast.show({ type: 'error', text1: 'Lỗi', text2: error.message || 'Lỗi kết nối máy chủ' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <View style={[s.header, { paddingHorizontal: isSmallScreen ? 12 : 16 }]}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Cập Nhật Hồ Sơ</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={[s.content, { paddingHorizontal: isSmallScreen ? 16 : 20 }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
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

export default UpdateProfileScreen;
