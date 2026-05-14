/**
 * @file BillReceiptComponent.tsx
 * @desc Component hóa đơn (bill) có thể chụp ảnh bằng react-native-view-shot
 *       hoặc in trực tiếp lên máy Sunmi POS.
 * @layer components
 */

import React, { forwardRef } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { FONTS } from "@/styles/theme";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface BillItem {
  name: string;
  quantity: number;
  unitPrice: number;
  /** Tên thuộc tính / topping đi kèm, ví dụ: "Sữa tươi", "Đá viên" */
  attributes?: { name: string; price: number }[];
}

export interface BillData {
  orderId: string | number;
  customerName?: string;
  createdAt?: string;
  items: BillItem[];
  subTotal: number;
  discount?: number;
  vatAmount?: number; // VAT (ví dụ: 10% của subTotal)
  totalAmount: number;
  paymentMethod?: string; // 'CASH' | 'VNPAY'
  cashReceived?: number;
  cashChange?: number;
}

// ─── Helper ───────────────────────────────────────────────────────────────────
// const vnd = (n: number) => `${Math.round(n).toLocaleString("vi-VN")}đ`;
const vnd = (n: number) => `${Math.round(n).toLocaleString("vi-VN")}`;

// ─── Component ────────────────────────────────────────────────────────────────
/**
 * BillReceiptComponent — dùng forwardRef để ViewShot wrap từ bên ngoài.
 *
 * @example
 * const ref = useRef<View>(null);
 * <ViewShot ref={ref} options={{ format: 'jpg', quality: 0.9 }}>
 *   <BillReceiptComponent data={billData} />
 * </ViewShot>
 */
const BillReceiptComponent = forwardRef<View, { data: BillData }>(
  ({ data }, _ref) => {
    const payMethodLabel =
      data.paymentMethod === "VNPAY" ? "VNPay" : "Tiền mặt";

    return (
      <View style={s.wrapper} ref={_ref as any} collapsable={false}>
        {/* ── HEADER ── */}
        <View style={s.header}>
          <View style={s.logoBox}>
            <Image
              source={require("@/assets/images/chips.png")}
              style={s.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={s.shopName}>CHIPS BILL</Text>
        </View>

        <View style={s.dividerDouble} />
        <Text style={s.billTitle}>HÓA ĐƠN BÁN HÀNG</Text>
        <View style={s.dividerDouble} />

        {/* ── THÔNG TIN ĐƠN ── */}
        <View style={s.section}>
          <Row label="Mã đơn" value={`#${data.orderId}`} />
          {!!data.createdAt && <Row label="Ngày" value={data.createdAt} />}
          <Row label="Khách" value={data.customerName || "Khách vãng lai"} />
          <Row label="Hình thức" value={payMethodLabel} />
        </View>

        <View style={s.divider} />

        {/* ── BẢNG MÓN ── */}
        <View style={[s.tableRow, s.tableHeader]}>
          <Text style={[s.colName, s.tableHeaderText]}>Tên món</Text>
          <Text style={[s.colQty, s.tableHeaderText]}>SL</Text>
          <Text style={[s.colPrice, s.tableHeaderText]}>Thành tiền</Text>
        </View>
        <View style={s.divider} />

        {data.items.map((item, idx) => (
          <View key={idx}>
            <View style={s.tableRow}>
              <Text style={s.colName} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={s.colQty}>{item.quantity}</Text>
              <Text style={s.colPrice}>
                {vnd(item.unitPrice * item.quantity)}
              </Text>
            </View>
            {/* Thuộc tính / topping */}
            {item.attributes?.map((attr, ai) => (
              <View key={ai} style={s.tableRow}>
                <Text style={s.colAttrName}>{`+ ${attr.name}`}</Text>
                <Text style={s.colQty}>{item.quantity}</Text>
                <Text style={s.colAttrPrice}>
                  {attr.price > 0 ? vnd(attr.price * item.quantity) : "—"}
                </Text>
              </View>
            ))}
          </View>
        ))}

        <View style={s.divider} />

        {/* TỔNG KẾT */}
        <View style={s.section}>
          <View style={s.dividerDouble} />
          <Row label="Tổng tiền" value={vnd(data.subTotal)} />
          <Row
            label="Khuyến mãi"
            value={vnd(data.discount ?? 0)}
            valueStyle={{ color: "#EF4444" }}
          />
        </View>

        <View style={s.dividerDouble} />

        <View style={[s.totalRow]}>
          <Text style={s.totalLabel}>TỔNG CỘNG</Text>
          <Text style={s.totalValue}>{vnd(data.totalAmount)}</Text>
        </View>

        {/* VAT INFO */}
        <View style={{ marginTop: 4 }}>
          <Text
            style={{
              fontFamily: FONTS.italic,
              fontSize: 11,
              color: "#6B7280",
              marginBottom: 2,
            }}
          >
            Đã bao gồm
          </Text>
          <Row
            label="  VAT (8%)"
            value={vnd(0)}
            valueStyle={{ color: "#6B7280" }}
          />
          <Row
            label="  VAT (10%)"
            value={vnd(Math.round((data.totalAmount * 10) / 110))}
            valueStyle={{ color: "#6B7280" }}
          />
        </View>

        {/* Tiền mặt — tiền khách đưa & tiền thừa */}
        {data.paymentMethod === "CASH" && data.cashReceived != null && (
          <View style={s.section}>
            <View style={s.dividerDouble} />
            <Row label="Tiền khách đưa" value={vnd(data.cashReceived)} />
            <Row
              label="Tiền thừa"
              value={vnd(data.cashChange ?? 0)}
              valueStyle={{ color: "#10B981", fontFamily: FONTS.bold }}
            />
          </View>
        )}

        <View style={s.divider} />

        {/* ── FOOTER ── */}
        <View style={s.footer}>
          <Text style={s.footerThanks}>Cảm ơn Quý khách! Hẹn gặp lại </Text>
          <Text style={s.footerHotline}>chips.vn - 0966 966 247</Text>
          <Text style={s.footerPowered}>Phần mềm: Chips Bill POS</Text>
        </View>
      </View>
    );
  },
);

BillReceiptComponent.displayName = "BillReceiptComponent";
export default BillReceiptComponent;

// ─── Sub-component Row ────────────────────────────────────────────────────────
const Row = ({
  label,
  value,
  valueStyle,
}: {
  label: string;
  value: string;
  valueStyle?: any;
}) => (
  <View style={s.row}>
    <Text style={s.rowLabel}>{label}</Text>
    <Text style={[s.rowValue, valueStyle]}>{value}</Text>
  </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  wrapper: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
    width: 320, // tương đương 58mm POS
  },

  // Header
  header: { alignItems: "center", marginBottom: 12 },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFF7F0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  logoImage: { width: 56, height: 56 },
  shopName: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: "#111827",
    letterSpacing: 1,
  },
  shopPhone: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: "#FF7A00",
    marginTop: 4,
  },

  billTitle: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: "#111827",
    textAlign: "center",
    marginVertical: 8,
    letterSpacing: 1,
  },

  // Dividers
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 8,
  },
  dividerDouble: {
    height: 2,
    backgroundColor: "#111827",
    marginVertical: 6,
  },

  // Section
  section: { marginVertical: 4 },

  // Row key-value
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 3,
  },
  rowLabel: { fontFamily: FONTS.regular, fontSize: 12, color: "#6B7280" },
  rowValue: { fontFamily: FONTS.medium, fontSize: 12, color: "#111827" },

  // Table
  tableRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginVertical: 3,
  },
  tableHeader: { marginBottom: 2 },
  tableHeaderText: { fontFamily: FONTS.bold, fontSize: 11, color: "#374151" },
  colName: {
    flex: 2,
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: "#111827",
  },
  colQty: {
    width: 28,
    textAlign: "center",
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: "#111827",
  },
  colPrice: {
    flex: 1,
    textAlign: "right",
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: "#111827",
  },
  // Attribute rows
  colAttrName: {
    flex: 2,
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: "#9CA3AF",
  },
  colAttrPrice: {
    flex: 1,
    textAlign: "right",
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: "#9CA3AF",
  },

  // Total
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },
  totalLabel: { fontFamily: FONTS.bold, fontSize: 15, color: "#111827" },
  totalValue: { fontFamily: FONTS.bold, fontSize: 18, color: "#FF7A00" },

  // Footer
  footer: { alignItems: "center", marginTop: 16 },
  footerThanks: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: "#111827",
    textAlign: "center",
  },
  footerHotline: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: "#FF7A00",
    marginTop: 6,
  },
  footerPowered: {
    fontFamily: FONTS.regular,
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 4,
  },
});
