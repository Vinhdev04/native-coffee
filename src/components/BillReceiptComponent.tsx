/**
 * @file BillReceiptComponent.tsx
 * @desc Component hóa đơn (bill) có thể chụp ảnh bằng react-native-view-shot
 *       hoặc in trực tiếp lên máy Sunmi POS.
 *       FIX: Tên món dài sẽ xuống dòng; SL và Thành tiền luôn căn đỉnh dòng đầu.
 * @layer components
 */

import React, { forwardRef } from "react";
import { View, Text, StyleSheet, Image, Platform } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { FONTS } from "@/styles/theme";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface BillItem {
  name: string;
  quantity: number;
  unitPrice: number;
  attributes?: { name: string; price: number; groupName?: string }[];
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
  cashierName?: string;
  branchName?: string;
  branchAddress?: string;
  hotline?: string;
  taxCode?: string;
  qrValue?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const vnd = (n: number) => `${Math.round(n).toLocaleString("vi-VN")}`;
const RECEIPT_BRANCH_NAME = "CHI NHANH QUAN 12";
const RECEIPT_BRANCH_ADDRESS = "456 Le Loi, Q.1, TP.HCM";
const RECEIPT_HOTLINE = "0909999999";
const RECEIPT_TAX_CODE = "9999999999";

const normalizeReceiptText = (value?: string | null) =>
  String(value ?? "")
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .trim();

const formatReceiptDate = (value?: string) => {
  if (!value) return "";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return normalizeReceiptText(value);
  }

  return parsed
    .toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    .replace(", ", " - ");
};

const hasBillVat = (data: BillData) =>
  Boolean(data.vatType && data.vatType !== "none") ||
  Number(data.vatAmount ?? 0) > 0;
const vatLabel = (data: BillData) =>
  data.vatRate && data.vatRate > 0 ? `VAT (${data.vatRate}%)` : "VAT";
const getReceiptQrValue = (data: BillData) =>
  normalizeReceiptText(data.qrValue) || `https://bill.chips.vn/pay/${data.orderId}`;

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
    <Text style={[s.infoValue, valueStyle]}>
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
}: {
  name: string;
  qty: number;
  price: string;
}) => (
  <View style={s.itemRow}>
    {/* Cột tên — flex:1 cho phép wrap nhiều dòng */}
    <View style={s.itemNameWrap}>
      <Text style={s.itemName}>{name}</Text>
    </View>
    {/* SL — width cố định, alignSelf:flex-start → luôn dòng 1 */}
    <Text style={s.itemQty} numberOfLines={1}>
      {qty}
    </Text>
    {/* Giá — width cố định, alignSelf:flex-start → luôn dòng 1 */}
    <Text style={s.itemPrice} numberOfLines={1}>
      {price}
    </Text>
  </View>
);

// ─── Component ────────────────────────────────────────────────────────────────
const BillReceiptComponent = forwardRef<View, { data: BillData }>(
  ({ data }, _ref) => {
    const payMethodLabel =
      data.paymentMethod === "VNPAY" ? "VNPay" : "Tiền mặt";
    const receiptDate = formatReceiptDate(data.createdAt);
    const branchName = normalizeReceiptText(data.branchName) || RECEIPT_BRANCH_NAME;
    const branchAddress =
      normalizeReceiptText(data.branchAddress) || RECEIPT_BRANCH_ADDRESS;
    const hotline = normalizeReceiptText(data.hotline) || RECEIPT_HOTLINE;
    const taxCode = normalizeReceiptText(data.taxCode) || RECEIPT_TAX_CODE;
    const cashierName = normalizeReceiptText(data.cashierName) || "admin";

    return (
      <View style={s.wrapper} ref={_ref as any} collapsable={false}>
        {/* ── HEADER ── */}
        <Divider />
        <View style={s.header}>
          <View style={s.logoBox}>
            <Image
              source={require("@/assets/images/chips-invoice-logo.png")}
              style={s.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={s.branchName}>{branchName}</Text>
          <Text style={s.branchText}>{branchAddress}</Text>
          <Text style={s.branchText}>Hotline: {hotline}</Text>
          <Text style={s.branchText}>Ma so thue: {taxCode}</Text>
        </View>

        <Text style={s.billTitle}>HÓA ĐƠN BÁN HÀNG</Text>
        <Divider />

        {/* ── THÔNG TIN ĐƠN ── */}
        <View style={s.section}>
          <InfoRow label="Mã đơn:" value={normalizeReceiptText(data.orderCode || String(data.orderId))} />
          {!!data.createdAt && (
            <InfoRow label="Ngày:" value={receiptDate} />
          )}
          <InfoRow label="Thu ngân:" value={cashierName} />
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
                name={normalizeReceiptText(item.name) || "Mon"}
                qty={item.quantity}
                price={vnd(lineTotal)}
              />
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
            <InfoRow
              label="Tổng tiền thuế VAT (đã gồm):"
              value={`${vnd(data.vatAmount || 0)}đ`}
              valueStyle={s.vatValue}
            />
            <Text style={s.vatNote}>(Giá bán toàn bộ đã bao gồm thuế VAT)</Text>
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
          <View style={s.qrWrap}>
            <QRCode
              value={getReceiptQrValue(data)}
              size={76}
              color="#111827"
              backgroundColor="#FFFFFF"
            />
          </View>
          <Text style={s.footerThanks}>Hẹn gặp lại quý khách!</Text>
          <Text style={s.footerPowered}>Phần mềm được viết bởi ChipsBill Pos</Text>
        </View>
        <Divider />
      </View>
    );
  },
);

BillReceiptComponent.displayName = "BillReceiptComponent";
export default BillReceiptComponent;

// ─── Styles ───────────────────────────────────────────────────────────────────
const COL_QTY_W  = 26;
const COL_PRICE_W = 82;
const RECEIPT_TEXT_FIX = Platform.OS === "android"
  ? { includeFontPadding: false as const, textAlignVertical: "top" as const }
  : {};

const s = StyleSheet.create({
  wrapper: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 32,
    width: 332,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  // ── Header
  header: { alignItems: "center", marginBottom: 12 },
  logoBox: {
    width: 140,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  logoImage: { width: 120, height: 60 },
  branchName: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: "#111827",
    textAlign: "center",
    marginBottom: 6,
    ...RECEIPT_TEXT_FIX,
  },
  branchText: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: "#111827",
    textAlign: "center",
    marginTop: 2,
    ...RECEIPT_TEXT_FIX,
  },
  billTitle: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: "#111827",
    textAlign: "center",
    marginVertical: 9,
  },

  // ── Dividers
  divider: {
    height: 1,
    backgroundColor: "#D1D5DB",
    marginVertical: 9,
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
    alignItems: "flex-start",
    paddingVertical: 3,
    gap: 12,
  },
  infoLabel: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: "#111827",
    flex: 1,
    ...RECEIPT_TEXT_FIX,
  },
  infoValue: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: "#111827",
    flex: 1.5,
    textAlign: "left",
    ...RECEIPT_TEXT_FIX,
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
    paddingVertical: 4,
  },
  // Bọc tên để flex-start không conflict
  itemNameWrap: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
  },
  itemName: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: "#111827",
    lineHeight: 17,
    ...RECEIPT_TEXT_FIX,
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
    ...RECEIPT_TEXT_FIX,
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
    ...RECEIPT_TEXT_FIX,
  },

  // Separator between items
  itemSeparator: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 1,
  },
  // Attributes
  attributesContainer: {
    paddingLeft: 0,
    paddingTop: 2,
  },
  attributeText: {
    fontFamily: FONTS.regular,
    fontSize: 10,
    color: "#4B5563",
    lineHeight: 14,
    ...RECEIPT_TEXT_FIX,
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
    color: "#6B7280",
    marginTop: 6,
    textAlign: "center",
    ...RECEIPT_TEXT_FIX,
  },
  vatValue: { fontFamily: FONTS.bold, color: "#111827" },

  // ── Footer
  footer: { alignItems: "center", marginTop: 14, gap: 8 },
  qrWrap: {
    borderWidth: 1,
    borderColor: "#94A3B8",
    padding: 8,
    backgroundColor: "#FFFFFF",
  },
  footerThanks: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: "#111827",
    textAlign: "center",
  },
  footerPowered: {
    fontFamily: FONTS.regular,
    fontSize: 10,
    color: "#6B7280",
    textAlign: "center",
  },
});
