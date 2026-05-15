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

const numberFrom = (...values: any[]) => {
  for (const value of values) {
    if (value === null || value === undefined || value === "") continue;
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return 0;
};

const inferVatType = (
  rawVatType: any,
  vatAmount: number,
  subTotal: number,
  discount: number,
  totalAmount: number,
) => {
  if (rawVatType === "exclusive" || rawVatType === "inclusive") return rawVatType;
  if (vatAmount <= 0) return "none";

  const exclusiveTotal = subTotal - discount + vatAmount;
  return Math.abs(totalAmount - exclusiveTotal) <= 1 ? "exclusive" : "inclusive";
};

const inferVatRate = (
  rawVatRate: number,
  vatAmount: number,
  subTotal: number,
  discount: number,
  vatType: string,
) => {
  if (rawVatRate > 0 || vatAmount <= 0) return rawVatRate;
  const taxableAmount = Math.max(0, subTotal - discount);
  if (taxableAmount <= 0) return 0;

  const base =
    vatType === "inclusive" ? Math.max(1, taxableAmount - vatAmount) : taxableAmount;
  return Number(((vatAmount / base) * 100).toFixed(2));
};

const ReceiptModal = ({
  visible,
  onClose,
  order,
}: ReceiptModalProps) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const viewShotRef = useRef<any>(null);

  // Map order sang định dạng BillData của BillReceiptComponent
  // Đã tính toán VAT đồng bộ
  const billData: BillData | null = useMemo(() => {
    if (!order) return null;
    const discount = numberFrom(order.discount, order.discountAmount, order.totalDiscount);
    const vatAmount = numberFrom(order.vatAmount, order.taxAmount);
    const rawVatRate = numberFrom(order.vatRate, order.taxRate);
    const rawVatType = order.vatType || order.taxType;
    const sub = numberFrom(
      order.subTotal,
      order.subtotalAmount,
      order.totalPrice,
    );
    const total = numberFrom(
      order.grandTotal,
      order.totalAmount,
      order.total,
      sub - discount + (rawVatType === "exclusive" ? vatAmount : 0),
    );
    const vatType = inferVatType(rawVatType, vatAmount, sub, discount, total);
    const vatRate = inferVatRate(rawVatRate, vatAmount, sub, discount, vatType);

    return {
      id: order.id,
      orderId: order.id || order.orderId,
      customerName: order.customerName || "Khách vãng lai",
      createdAt: order.createdAt,
      items: order.items || [],
      subTotal: sub,
      vatAmount: vatAmount,
      vatRate: vatRate,
      vatType: vatType,
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
