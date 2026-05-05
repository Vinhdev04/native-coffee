import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
} from "react-native";
import MaterialIcon from "react-native-vector-icons/MaterialCommunityIcons";
import { Colors } from "~/constants/Colors";
import { Layout } from "~/constants/Constants";
import { Typography } from "~/constants/Typography";
import { useAuth } from "~/context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import { launchImageLibrary } from "react-native-image-picker";
import { ActivityIndicator } from "react-native";
import { AccountSocket } from "~/socket/modules/AccountSocket";

const UpdateProfileScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const { login, token } = useAuth();
  const [avatar, setAvatar] = useState(user?.avatar || null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  React.useEffect(() => {
    if (user) {
      setAvatar(user.avatar || null);
      setName(user.name || user.full_name || user.userName || "");
      setEmail(user.email || "");
      setPhone(user.phone || user.phone_number || "");
    }
  }, [user]);

  const handleSelectAvatar = async () => {
    const result = await launchImageLibrary({
      mediaType: "photo",
      quality: 0.8,
    });

    if (result.assets && result.assets.length > 0) {
      setAvatar(result.assets[0].uri || null);
    }
  };

  const handleUpdate = async () => {
    if (!user || !name) return;

    try {
      setLoading(true);
      const payload = {
        id: user.id,
        name: name,
        phone: phone,
        email: email,
        staff_id: user.staff_id || 0,
        permission_level: user.permission_level || "0",
      };

      const response: any = await AccountSocket.update(payload);

      if (response && (response.res_code === 0 || response.status === 200)) {
        Toast.show({
          type: "success",
          text1: t("success"),
          text2: "Thông tin cá nhân đã được cập nhật",
        });

        // Cập nhật lại AuthContext
        if (token) {
          // Ở đây ta có thể giả định server trả về user mới hoặc ta tự merge
          const updatedUser = { ...user, name, phone, email };
          await login(token, updatedUser);
        }

        navigation.goBack();
      } else {
        Toast.show({
          type: "error",
          text1: t("failed"),
          text2: response?.message || "Không thể cập nhật thông tin",
        });
      }
    } catch (error) {
      console.error("Update profile error", error);
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: t("conn_error_msg"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcon name="arrow-left" size={28} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("update_profile")}</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarLarge}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatarImage} />
            ) : (
              <MaterialIcon name="account" size={60} color={Colors.primary} />
            )}
          </View>
          {/* <TouchableOpacity style={styles.changeAvatarBtn} onPress={handleSelectAvatar}>
               <Text style={styles.changeAvatarText}>{t('change_avatar')}</Text>
            </TouchableOpacity> */}
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("full_name")}</Text>
            <View style={styles.inputBox}>
              <MaterialIcon
                name="account-outline"
                size={20}
                color={Colors.secondary}
              />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder={t("enter_full_name")}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("email")}</Text>
            <View style={styles.inputBox}>
              <MaterialIcon
                name="email-outline"
                size={20}
                color={Colors.secondary}
              />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                placeholder={t("enter_email")}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("phone")}</Text>
            <View style={styles.inputBox}>
              <MaterialIcon
                name="phone-outline"
                size={20}
                color={Colors.secondary}
              />
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder={t("enter_phone")}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, loading && { opacity: 0.7 }]}
            onPress={handleUpdate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.saveBtnText}>{t("save_changes")}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Layout.headerPaddingHorizontal,
    paddingTop: Layout.headerPaddingTop,
    paddingBottom: Layout.headerPaddingBottom,
    backgroundColor: Colors.white,
  },
  headerTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 18,
    color: Colors.primary,
  },
  content: { padding: 20 },
  avatarSection: { alignItems: "center", marginBottom: 30 },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.surfaceContainerLow,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.primary,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  changeAvatarBtn: { marginTop: 10 },
  changeAvatarText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 13,
    color: Colors.primary,
  },
  form: { gap: 20 },
  inputGroup: { gap: 8 },
  label: { fontFamily: Typography.fontFamily.bold, fontSize: 14, color: Colors.onSurface },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontFamily: Typography.fontFamily.medium,
    fontSize: 15,
    color: Colors.onSurface,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  saveBtnText: { fontFamily: Typography.fontFamily.bold, fontSize: 16, color: Colors.white },
});

export default UpdateProfileScreen;
