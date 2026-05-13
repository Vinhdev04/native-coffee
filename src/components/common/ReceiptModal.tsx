import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  Image,
  ActivityIndicator,
} from "react-native";
import { X, Printer, Share2, CheckCircle2 } from "lucide-react-native";
import { COLORS, FONTS } from "@/styles/theme";
import { formatCurrency } from "@/utils";
import QRCode from "react-native-qrcode-svg";
import { printerService } from "@/services/printerService";

const { width: SW } = Dimensions.get("window");

interface ReceiptModalProps {
  visible: boolean;
  onClose: () => void;
  order: {
    id?: string | number;
    items: any[];
    totalPrice: number;
    customerName?: string;
    createdAt?: string;
  };
  title?: string;
}

const ReceiptModal = ({
  visible,
  onClose,
  order,
  title = "HÓA ĐƠN TẠM TÍNH",
}: ReceiptModalProps) => {
  const [isPrinting, setIsPrinting] = React.useState(false);

  if (!order) return null;

  const today = new Date();
  const dateStr =
    order.createdAt ||
    `${today.getHours()}:${today.getMinutes()} - ${today.getDate()}/${
      today.getMonth() + 1
    }/${today.getFullYear()}`;

  const handlePrint = async () => {
    setIsPrinting(true);
    await printerService.print(order);
    setIsPrinting(false);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={s.overlay}>
        <View style={s.container}>
          {/* Header Actions */}
          <View style={s.topActions}>
            <TouchableOpacity style={s.actionBtn} onPress={onClose}>
              <X size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity style={s.actionBtn}>
                <Share2 size={20} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  s.actionBtn,
                  s.printBtn,
                  isPrinting && { opacity: 0.6 },
                ]}
                onPress={handlePrint}
                disabled={isPrinting}
              >
                {isPrinting ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Printer size={20} color={COLORS.white} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={s.scrollContent}
          >
            {/* The actual Receipt UI */}
            <View style={s.receiptBody}>
              {/* Logo & Brand */}
              <View style={s.brandSection}>
                <Image
                  source={require("@/public/logo.png")}
                  style={s.logo}
                  resizeMode="contain"
                />
                <Text style={s.brandName}>CHIPS BILL</Text>
                <Text style={s.brandAddress}>
                  L3-19 - Tầng 19 - Block Lucky, số 207C Nguyễn Xí, P. Bình
                  Thạnh, TP. Hồ Chí Minh
                </Text>
                <Text style={s.brandPhone}>Hotline: 0966966247</Text>
              </View>

              <View style={s.divider} />

              {/* Bill Info */}
              <View style={s.infoSection}>
                <Text style={s.receiptTitle}>{title}</Text>
                <View style={s.infoRow}>
                  <Text style={s.infoLabel}>Mã đơn:</Text>
                  <Text style={s.infoValue}>
                    {order.id && !String(order.id).includes("DRAFT")
                      ? order.id
                      : "DRAFT"}
                  </Text>
                </View>
                <View style={s.infoRow}>
                  <Text style={s.infoLabel}>Ngày:</Text>
                  <Text style={s.infoValue}>{dateStr}</Text>
                </View>
                <View style={s.infoRow}>
                  <Text style={s.infoLabel}>Khách hàng:</Text>
                  <Text style={s.infoValue}>
                    {order.customerName || "Khách vãng lai"}
                  </Text>
                </View>
              </View>

              <View style={s.dashedDivider} />

              {/* Items List */}
              <View style={s.itemsSection}>
                <View style={s.itemHeader}>
                  <Text style={[s.itemHeadLabel, { flex: 1.2 }]}>Tên món</Text>
                  <Text
                    style={[
                      s.itemHeadLabel,
                      { flex: 0.4, textAlign: "center" },
                    ]}
                  >
                    SL
                  </Text>
                  <Text
                    style={[s.itemHeadLabel, { flex: 1.6, textAlign: "right" }]}
                  >
                    Thành tiền
                  </Text>
                </View>
                {order.items.map((item, idx) => (
                  <View key={idx} style={s.itemRow}>
                    <View style={{ flex: 1.2 }}>
                      <Text style={s.itemName}>{item.name}</Text>
                      {item.selectedAttributes?.length > 0 && (
                        <Text style={s.itemAttr}>
                          {item.selectedAttributes
                            .map((a: any) => a.name)
                            .join(", ")}
                        </Text>
                      )}
                    </View>
                    <Text style={[s.itemQty, { flex: 0.4 }]}>
                      {item.quantity}
                    </Text>
                    <Text style={[s.itemTotal, { flex: 1.6 }]}>
                      {formatCurrency(Math.round(item.price * item.quantity))}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={s.dashedDivider} />

              {/* Totals */}
              <View style={s.totalSection}>
                <View style={s.totalRow}>
                  <Text style={s.totalLabel}>Tạm tính:</Text>
                  <Text style={s.totalValue}>
                    {formatCurrency(order.totalPrice)}
                  </Text>
                </View>
                <View style={s.totalRow}>
                  <Text style={s.totalLabel}>Khuyến mãi:</Text>
                  <Text style={s.totalValue}>{formatCurrency(0)}</Text>
                </View>
                <View style={[s.totalRow, { marginTop: 10 }]}>
                  <Text style={s.grandTotalLabel}>TỔNG CỘNG:</Text>
                  <Text style={s.grandTotalValue}>
                    {formatCurrency(Math.round(order.totalPrice))}
                  </Text>
                </View>
              </View>

              <View style={s.dashedDivider} />

              {/* QR & Footer */}
              <View style={s.footerSection}>
                <View style={s.qrBox}>
                  <QRCode
                    value={`https://bill.chips.vn/pay/${
                      order.id || "draft"
                    }?method=vnpay`}
                    size={60}
                    color="#000"
                    backgroundColor="transparent"
                  />
                </View>
                <Text style={s.footerThank}>
                  Cảm ơn Quý khách. Hẹn gặp lại!
                </Text>
                <Text style={s.footerPowered}>
                  Phần mềm được tạo bởi Chips Bill POS
                </Text>
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity style={s.bottomCta} onPress={onClose}>
            <Text style={s.bottomCtaText}>Đóng bản xem trước</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: SW * 0.9,
    height: "85%",
    backgroundColor: "#F3F4F6",
    borderRadius: 24,
    overflow: "hidden",
    elevation: 20,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  topActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  printBtn: { backgroundColor: COLORS.primary },

  scrollContent: { padding: 16 },
  receiptBody: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 4, // Thermal paper usually looks flat
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },

  brandSection: { alignItems: "center", marginBottom: 15 },
  logo: { width: 60, height: 60, marginBottom: 8 },
  brandName: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: "#111827",
    letterSpacing: 1,
  },
  brandAddress: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: 4,
  },
  brandPhone: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  divider: { height: 1, backgroundColor: "#E5E7EB", marginVertical: 15 },
  dashedDivider: {
    height: 1,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginVertical: 15,
    borderRadius: 1,
  },

  infoSection: { marginBottom: 10 },
  receiptTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: "#111827",
    textAlign: "center",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  infoLabel: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  infoValue: { fontFamily: FONTS.bold, fontSize: 13, color: "#111827" },

  itemsSection: { marginBottom: 5 },
  itemHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingBottom: 8,
    marginBottom: 10,
  },
  itemHeadLabel: { fontFamily: FONTS.bold, fontSize: 12, color: "#6B7280" },
  itemRow: { flexDirection: "row", marginBottom: 12, alignItems: "flex-start" },
  itemName: { fontFamily: FONTS.bold, fontSize: 13, color: "#111827" },
  itemAttr: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  itemQty: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: "#111827",
    textAlign: "center",
  },
  itemTotal: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: "#111827",
    textAlign: "right",
  },

  totalSection: { paddingVertical: 5 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  totalLabel: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.textMuted,
  },
  totalValue: { fontFamily: FONTS.bold, fontSize: 14, color: "#111827" },
  grandTotalLabel: { fontFamily: FONTS.bold, fontSize: 16, color: "#111827" },
  grandTotalValue: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.primary,
  },

  footerSection: { alignItems: "center", marginTop: 10 },
  qrBox: {
    padding: 8,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  footerThank: { fontFamily: FONTS.bold, fontSize: 13, color: "#111827" },
  footerPowered: {
    fontFamily: FONTS.regular,
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 6,
  },

  bottomCta: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    alignItems: "center",
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  bottomCtaText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.primary,
  },
});

export default ReceiptModal;
