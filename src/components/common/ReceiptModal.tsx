import React, { useRef, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Platform,
} from "react-native";
import { X, Printer, Share2 } from "lucide-react-native";
import { COLORS, FONTS } from "@/styles/theme";
import ViewShot from "react-native-view-shot";
import BillReceiptComponent, { BillData } from "@/components/BillReceiptComponent";
import { printBillOnSunmi, shareBillImage } from "@/services/billService";

interface ReceiptModalProps {
  visible: boolean;
  onClose: () => void;
  order: any; // Mapped data
  title?: string;
}

const ReceiptModal = ({
  visible,
  onClose,
  order,
}: ReceiptModalProps) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const viewShotRef = useRef<ViewShot>(null);

  // Map order sang định dạng BillData của BillReceiptComponent
  // Đã tính toán VAT đồng bộ
  const billData: BillData | null = useMemo(() => {
    if (!order) return null;
    const total = parseFloat(order.totalPrice || "0");
    const discount = parseFloat(order.discount || "0");
    const sub = total + discount;
    const vat = 0;

    return {
      id: order.id,
      orderId: order.id,
      customerName: order.customerName || "Khách vãng lai",
      createdAt: order.createdAt,
      items: order.items || [],
      subTotal: sub,
      vatAmount: vat,
      discount: discount,
      totalAmount: total,
      paymentMethod: order.paymentMethod || "CASH",
      cashReceived: order.cashReceived,
      cashChange: order.cashChange,
    };
  }, [order]);

  if (!order || !billData) return null;

  const handlePrint = async () => {
    setIsPrinting(true);
    await printBillOnSunmi(billData);
    setIsPrinting(false);
  };

  const handleShare = async () => {
    setIsSharing(true);
    await shareBillImage(viewShotRef);
    setIsSharing(false);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={s.overlay}>
        <SafeAreaView style={s.container}>
          {/* Header Actions */}
          <View style={s.topActions}>
            <TouchableOpacity style={s.closeBtn} onPress={onClose}>
              <X size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={s.headerTitle}>Xem hóa đơn</Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity 
                style={[s.actionBtn, isSharing && { opacity: 0.6 }]} 
                onPress={handleShare}
                disabled={isSharing}
              >
                {isSharing ? <ActivityIndicator size="small" color={COLORS.primary} /> : <Share2 size={20} color={COLORS.primary} />}
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.actionBtn, s.printBtn, isPrinting && { opacity: 0.6 }]}
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
            <ViewShot
              ref={viewShotRef}
              options={{ format: "jpg", quality: 0.95 }}
            >
              <BillReceiptComponent data={billData} />
            </ViewShot>
          </ScrollView>

          <TouchableOpacity style={s.bottomCta} onPress={onClose}>
            <Text style={s.bottomCtaText}>Đóng</Text>
          </TouchableOpacity>
        </SafeAreaView>
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
    width: "90%",
    height: "85%",
    backgroundColor: "#F3F4F6",
    borderRadius: 24,
    overflow: "hidden",
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
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  closeBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
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
  scrollContent: { 
    padding: 20, 
    alignItems: 'center' 
  },
  bottomCta: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    alignItems: "center",
  },
  bottomCtaText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.primary,
  },
});

export default ReceiptModal;
