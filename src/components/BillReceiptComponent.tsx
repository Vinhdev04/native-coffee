/**
 * @file BillReceiptComponent.tsx
 * @desc Component hóa đơn (bill) có thể chụp ảnh bằng react-native-view-shot
 *       hoặc in trực tiếp lên máy Sunmi POS.
 *       FIX: Tên món dài sẽ xuống dòng; SL và Thành tiền luôn căn đỉnh dòng đầu.
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
  attributes?: { name: string; price: number }[];
}

export interface BillData {
  id?: string | number;
  orderId: string | number;
  orderCode?: string;
  customerName?: string;
  createdAt?: string;
  items: BillItem[];
  subTotal: number;
  discount?: number;
  vatAmount?: number;
  vatRate?: number;
  vatType?: string;
  totalAmount: number;
  paymentMethod?: string;
  cashReceived?: number;
  cashChange?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const vnd = (n: number) => `${Math.round(n).toLocaleString("vi-VN")}`;
const hasBillVat = (data: BillData) =>
  Boolean(data.vatType && data.vatType !== "none") ||
  Number(data.vatAmount ?? 0) > 0;
const vatLabel = (data: BillData) =>
  data.vatRate && data.vatRate > 0 ? `VAT (${data.vatRate}%)` : "VAT";

// ─── Sub-components ───────────────────────────────────────────────────────────
const Divider = ({ thick = false }: { thick?: boolean }) => (
  <View style={thick ? s.dividerThick : s.divider} />
);

const InfoRow = ({
  label,
  value,
  valueStyle,
}: {
  label: string;
  value: string;
  valueStyle?: any;
}) => (
  <View style={s.infoRow}>
    <Text style={s.infoLabel}>{label}</Text>
    <Text style={[s.infoValue, valueStyle]} numberOfLines={1} ellipsizeMode="tail">
      {value}
    </Text>
  </View>
);

// ─── Item Row — KEY FIX ───────────────────────────────────────────────────────
// Tên món có thể xuống nhiều dòng; SL và Giá luôn ở trên đỉnh (alignSelf: flex-start)
const ItemRow = ({
  name,
  qty,
  price,
  isAttr = false,
}: {
  name: string;
  qty: number;
  price: string;
  isAttr?: boolean;
}) => (
  <View style={s.itemRow}>
    {/* Cột tên — flex:1 cho phép wrap nhiều dòng */}
    <View style={s.itemNameWrap}>
      <Text style={isAttr ? s.itemAttrName : s.itemName}>{name}</Text>
    </View>
    {/* SL — width cố định, alignSelf:flex-start → luôn dòng 1 */}
    <Text style={[s.itemQty, isAttr && s.itemAttrMuted]} numberOfLines={1}>
      {qty}
    </Text>
    {/* Giá — width cố định, alignSelf:flex-start → luôn dòng 1 */}
    <Text style={[s.itemPrice, isAttr && s.itemAttrMuted]} numberOfLines={1}>
      {price}
    </Text>
  </View>
);

// ─── Component ────────────────────────────────────────────────────────────────
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
              source={require("@/assets/images/chips-invoice-logo.png")}
              style={s.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={s.shopName}>CHIPS BILL</Text>
          <Text style={s.shopTagline}>chips.vn  •  0966 966 247</Text>
        </View>

        <Divider thick />
        <Text style={s.billTitle}>HÓA ĐƠN BÁN HÀNG</Text>
        <Divider thick />

        {/* ── THÔNG TIN ĐƠN ── */}
        <View style={s.section}>
          <InfoRow label="Mã đơn" value={data.orderCode ? `#${data.orderCode}` : `#${data.orderId}`} />
          {!!data.createdAt && (
            <InfoRow label="Ngày" value={data.createdAt} />
          )}
          <InfoRow label="Khách" value={data.customerName || "Khách vãng lai"} />
          <InfoRow label="Hình thức" value={payMethodLabel} />
        </View>

        <Divider />

        {/* ── BẢNG MÓN ── */}
        {/* Header */}
        <View style={s.tableHeader}>
          <Text style={[s.tableHeaderText, { flex: 1 }]}>Tên món</Text>
          <Text style={[s.tableHeaderText, s.thQty]}>SL</Text>
          <Text style={[s.tableHeaderText, s.thPrice]}>Thành tiền</Text>
        </View>

        <Divider />

        {/* Rows */}
        {data.items.map((item, idx) => {
          const lineTotal = item.unitPrice * item.quantity;
          return (
            <View key={idx}>
              <ItemRow
                name={item.name}
                qty={item.quantity}
                price={vnd(lineTotal)}
              />
              {item.attributes?.map((attr, ai) =>
                attr.price > 0 ? (
                  <ItemRow
                    key={ai}
                    name={`+ ${attr.name}`}
                    qty={item.quantity}
                    price={vnd(attr.price * item.quantity)}
                    isAttr
                  />
                ) : null,
              )}
              {idx < data.items.length - 1 && (
                <View style={s.itemSeparator} />
              )}
            </View>
          );
        })}

        <Divider />

        {/* ── TỔNG KẾT ── */}
        <View style={s.section}>
          <InfoRow label="Tổng tiền" value={`${vnd(data.subTotal)}đ`} />
          {(data.discount ?? 0) > 0 && (
            <InfoRow
              label="Khuyến mãi"
              value={`-${vnd(data.discount ?? 0)}đ`}
              valueStyle={{ color: "#EF4444" }}
            />
          )}
        </View>

        <Divider thick />

        {/* TỔNG CỘNG */}
        <View style={s.totalRow}>
          <Text style={s.totalLabel}>TỔNG CỘNG</Text>
          <Text style={s.totalValue}>{vnd(data.totalAmount)}đ</Text>
        </View>

        <Divider thick />

        {/* VAT */}
        {hasBillVat(data) ? (
          <View style={s.vatBox}>
            <Text style={s.vatNote}>
              {data.vatType === "inclusive" ? "(Đã bao gồm)" : "(Chưa bao gồm)"}
            </Text>
            <InfoRow
              label={vatLabel(data)}
              value={`${vnd(data.vatAmount || 0)}đ`}
              valueStyle={{ color: "#6B7280" }}
            />
          </View>
        ) : (
          <Text style={s.vatNote}>Không tính VAT</Text>
        )}

        {/* Tiền mặt */}
        {data.paymentMethod === "CASH" && data.cashReceived != null && (
          <View style={s.section}>
            <Divider />
            <InfoRow
              label="Tiền khách đưa"
              value={`${vnd(data.cashReceived)}đ`}
            />
            <InfoRow
              label="Tiền thừa"
              value={`${vnd(data.cashChange ?? 0)}đ`}
              valueStyle={{ color: "#10B981", fontFamily: FONTS.bold }}
            />
          </View>
        )}

        <Divider />

        {/* ── FOOTER ── */}
        <View style={s.footer}>
          <Text style={s.footerThanks}>Cảm ơn Quý khách! Hẹn gặp lại 🙏</Text>
          <Text style={s.footerPowered}>Phần mềm: Chips Bill POS</Text>
        </View>
      </View>
    );
  },
);

BillReceiptComponent.displayName = "BillReceiptComponent";
export default BillReceiptComponent;

// ─── Styles ───────────────────────────────────────────────────────────────────
const COL_QTY_W  = 26;
const COL_PRICE_W = 82;

const s = StyleSheet.create({
  wrapper: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 32,
    width: 320,
  },

  // ── Header
  header: { alignItems: "center", marginBottom: 10 },
  logoBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFF7F0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  logoImage: { width: 52, height: 52 },
  shopName: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: "#111827",
    letterSpacing: 1.5,
  },
  shopTagline: {
    fontFamily: FONTS.regular,
    fontSize: 10,
    color: "#FF7A00",
    marginTop: 3,
  },
  billTitle: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: "#111827",
    textAlign: "center",
    marginVertical: 7,
    letterSpacing: 1,
  },

  // ── Dividers
  divider: {
    height: 1,
    backgroundColor: "#D1D5DB",
    marginVertical: 7,
  },
  dividerThick: {
    height: 2,
    backgroundColor: "#111827",
    marginVertical: 5,
  },

  // ── Section
  section: { marginVertical: 2 },

  // ── Info rows
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 2,
  },
  infoLabel: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: "#6B7280",
    flex: 1,
  },
  infoValue: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: "#111827",
    maxWidth: "60%",
    textAlign: "right",
  },

  // ── Table header
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  tableHeaderText: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: "#374151",
  },
  thQty: {
    width: COL_QTY_W,
    textAlign: "center",
  },
  thPrice: {
    width: COL_PRICE_W,
    textAlign: "right",
  },

  // ── Item rows — KEY FIX
  itemRow: {
    flexDirection: "row",
    alignItems: "flex-start",   // ← Căn tất cả cột theo đỉnh
    paddingVertical: 3,
  },
  // Bọc tên để flex-start không conflict
  itemNameWrap: {
    flex: 1,
    paddingRight: 6,
  },
  itemName: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: "#111827",
    lineHeight: 17,
    // KHÔNG có numberOfLines — cho phép wrap tự nhiên
  },
  // SL: width cố định, alignSelf flex-start → luôn ở dòng 1
  itemQty: {
    width: COL_QTY_W,
    flexShrink: 0,
    alignSelf: "flex-start",
    textAlign: "center",
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: "#111827",
    lineHeight: 17,
  },
  // Giá: width cố định, alignSelf flex-start → luôn ở dòng 1
  itemPrice: {
    width: COL_PRICE_W,
    flexShrink: 0,
    alignSelf: "flex-start",
    textAlign: "right",
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: "#111827",
    lineHeight: 17,
  },

  // Attribute (topping)
  itemAttrName: {
    fontFamily: FONTS.regular,
    fontSize: 10,
    color: "#9CA3AF",
    lineHeight: 15,
  },
  itemAttrMuted: {
    fontSize: 10,
    color: "#9CA3AF",
    lineHeight: 15,
  },

  // Separator between items
  itemSeparator: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 1,
  },

  // ── Total
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  totalLabel: { fontFamily: FONTS.bold, fontSize: 14, color: "#111827" },
  totalValue: { fontFamily: FONTS.bold, fontSize: 20, color: "#FF7A00" },

  // ── VAT
  vatBox: { marginTop: 2 },
  vatNote: {
    fontFamily: FONTS.regular,
    fontSize: 10,
    color: "#9CA3AF",
    marginBottom: 2,
  },

  // ── Footer
  footer: { alignItems: "center", marginTop: 14, gap: 4 },
  footerThanks: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: "#111827",
    textAlign: "center",
  },
  footerPowered: {
    fontFamily: FONTS.regular,
    fontSize: 9,
    color: "#9CA3AF",
  },
});
