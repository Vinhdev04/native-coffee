import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import MaterialIcon from "react-native-vector-icons/MaterialCommunityIcons";
import { Colors } from "~/constants/Colors";
import { Layout } from "~/constants/Constants";
import { Typography } from "~/constants/Typography";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import { useAuth } from "~/context/AuthContext";
import { ActivityIndicator } from "react-native";
import { AccountSocket } from "~/socket/modules/AccountSocket";

const ChangePasswordScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Mật khẩu mới phải có ít nhất 6 ký tự",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Mật khẩu xác nhận không khớp",
      });
      return;
    }

    try {
      setLoading(true);
      const response: any = await AccountSocket.changePassword({
        id: user?.id || 0,
        new_password: newPassword,
      });

      if (response && (response.res_code === 0 || response.status === 200)) {
        Toast.show({
          type: "success",
          text1: t("success"),
          text2: "Đã đổi mật khẩu thành công",
        });
        navigation.goBack();
      } else {
        Toast.show({
          type: "error",
          text1: t("failed"),
          text2: response?.message || "Không thể đổi mật khẩu",
        });
      }
    } catch (error) {
      console.error("Change password error", error);
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
        <Text style={styles.headerTitle}>{t("change_password")}</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoBox}>
          <MaterialIcon
            name="shield-lock-outline"
            size={40}
            color={Colors.primary}
          />
          <Text style={styles.infoText}>
            Mật khẩu mới phải có ít nhất 6 ký tự để đảm bảo bảo mật.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mật khẩu cũ</Text>
            <View style={styles.inputBox}>
              <MaterialIcon
                name="lock-outline"
                size={20}
                color={Colors.secondary}
              />
              <TextInput
                style={styles.input}
                value={oldPassword}
                onChangeText={setOldPassword}
                secureTextEntry={!showOld}
                placeholder="Nhập mật khẩu hiện tại"
              />
              <TouchableOpacity onPress={() => setShowOld(!showOld)}>
                <MaterialIcon
                  name={showOld ? "eye-off" : "eye"}
                  size={20}
                  color={Colors.gray}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mật khẩu mới</Text>
            <View style={styles.inputBox}>
              <MaterialIcon
                name="lock-reset"
                size={20}
                color={Colors.secondary}
              />
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNew}
                placeholder="Nhập mật khẩu mới"
              />
              <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                <MaterialIcon
                  name={showNew ? "eye-off" : "eye"}
                  size={20}
                  color={Colors.gray}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Xác nhận mật khẩu</Text>
            <View style={styles.inputBox}>
              <MaterialIcon
                name="lock-check-outline"
                size={20}
                color={Colors.secondary}
              />
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showNew}
                placeholder="Nhập lại mật khẩu mới"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, loading && { opacity: 0.7 }]}
            onPress={handleChangePassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.saveBtnText}>Cập nhật mật khẩu</Text>
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
  infoBox: {
    backgroundColor: Colors.primary + "10",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 30,
    gap: 10,
  },
  infoText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 13,
    color: Colors.primary,
    textAlign: "center",
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

export default ChangePasswordScreen;
