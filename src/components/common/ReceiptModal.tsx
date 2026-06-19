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
import BillReceiptComponent, { BillData } from "@/components/BillReceiptComponent";
import { printBillOnSunmi, shareBillImage } from "@/services/billService";

// todo: các thuộc tính props cho component ReceiptModal
interface ReceiptModalProps {
  visible: boolean;
  onClose: () => void;
  order: any; // Mapped data
  title?: string;
}

// TODO: Hàm phụ trợ để phân tích các giá trị số hợp lệ từ nhiều trường nguồn khác nhau
const numberFrom = (...values: any[]) => {
  for (const value of values) {
    if (value === null || value === undefined || value === "") continue;
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return 0;
};

// Hàm format tiền Việt Nam
const vnd = (n: number) => `${Math.round(n).toLocaleString("vi-VN")}đ`;

// TODO: Suy đoán loại VAT (đã bao gồm hay chưa bao gồm) dựa trên số tiền
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

// TODO: Tính toán thuế suất VAT thực tế dựa trên tổng doanh thu chịu thuế và số tiền VAT tính toán
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

// TODO: Component chính ReceiptModal hiển thị hộp thoại xem trước hóa đơn và hỗ trợ in/chia sẻ
const ReceiptModal = ({
  visible,
  onClose,
  order,
}: ReceiptModalProps) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [receiptReady, setReceiptReady] = useState(false);
  const viewShotRef = useRef<any>(null);

  // todo: Ánh xạ dữ liệu đơn hàng thô thành cấu trúc BillData nhất quán của BillReceiptComponent
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

    const rawItems = Array.isArray(order.items) ? order.items : 
                     Array.isArray(order.orderItems) ? order.orderItems : [];
    const items = rawItems.map((item: any) => {
      const qty = item.qty || item.quantity || 1;
      const totalItemPrice = parseFloat(item.lineTotal || item.unitPriceSnapshot || "0");
      const unitPrice = totalItemPrice > 0 ? (totalItemPrice / qty) : parseFloat(item.unitPrice || "0");
      
      // Extract attributes from item (customize based on your actual data structure)
      const attributes: any[] = [];
      
      // Use selectedOptionsSnapshot or selectedAttributes (from OrderDetailScreen.tsx)
      const selectedOptions = item.selectedOptionsSnapshot || item.selectedAttributes || [];
      selectedOptions.forEach((opt: any) => {
        attributes.push({ 
          name: opt.name || opt.value, 
          price: opt.price || opt.priceAmount || 0 
        });
      });
      
      // Also add item-level VAT if available
      if (item.vatAmount || item.taxAmount) {
        const vatAmt = item.vatAmount || item.taxAmount;
        const vatRate = item.vatRate || item.taxRate || 0;
        attributes.push({ 
          name: `Thuế VAT (${vatRate}% đã gồm: ${vnd(vatAmt)})`, 
          price: 0 
        });
      }
      
      return {
        name: item.productNameSnapshot || item.productName || item.name || "Món",
        quantity: qty,
        unitPrice: unitPrice,
        attributes,
      };
    });

    return {
      id: order.id,
      orderId: order.id || order.orderId,
      orderCode: order.orderCode,
      customerName: order.customerName || "Khách vãng lai",
      createdAt: order.createdAt,
      items,
      subTotal: sub,
      vatAmount: vatAmount,
      vatRate: vatRate,
      vatType: vatType,
      discount: discount,
      totalAmount: total,
      paymentMethod: order.paymentMethod || "CASH",
      cashReceived: order.cashReceived,
      cashChange: order.cashChange,
      cashierName: order.cashierName || order.createdByName || order.createdBy || "admin",
      branchName: order.branchName,
      branchAddress: order.branchAddress,
      hotline: order.branchPhone || order.hotline,
      taxCode: order.taxCode || order.branchTaxCode,
      qrValue: `https://bill.chips.vn/pay/${order.id || order.orderId}`,
    };
  }, [order]);

  if (!order || !billData) return null;

  // TODO: Kích hoạt luồng in nhiệt hóa đơn vật lý
  const handlePrint = async () => {
    setIsPrinting(true);
    await printBillOnSunmi(billData);
    setIsPrinting(false);
  };

  // TODO: Chụp lại vùng màn hình hiển thị hóa đơn và mở hộp thoại chia sẻ của hệ thống
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
          <View style={s.topActions}>
            <TouchableOpacity style={s.closeBtn} onPress={onClose}>
              <X size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={s.headerTitle}>Xem hóa đơn</Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity 
                style={[s.actionBtn, isSharing && { opacity: 0.6 }]} 
                onPress={handleShare}
                disabled={isSharing || !receiptReady}
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
            {/* todo: truyền ref trực tiếp vào BillReceiptComponent để captureRef khi cần chia sẻ, tránh bọc bằng ViewShot gây lỗi kích thước 0 trên thiết bị POS */}
            <BillReceiptComponent
              ref={viewShotRef}
              data={billData}
              onLayout={(e) => {
                const { width, height } = e?.nativeEvent?.layout ?? {};
                setReceiptReady(Boolean(width > 0 && height > 0));
              }}
            />
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
