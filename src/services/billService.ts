/**
 * @file billService.ts
 * @desc Service xử lý in hóa đơn (Sunmi POS) và chia sẻ ảnh bill (ViewShot).
 *       - printBill() → in trực tiếp lên máy in Sunmi, tự động fetch dữ liệu mới nhất từ backend
 *       - shareBill() → chụp ảnh component bill → share qua app khác
 * @layer services
 */

import { Platform, NativeModules, Share } from "react-native";
import type { RefObject } from "react";
import Toast from "react-native-toast-message";
import { BillData } from "@/components/BillReceiptComponent";

import { LOGO_BASE64 } from "@/constants/logoBase64";
import { fetchOrderById } from "@/services/orderService";

const hasVat = (data: BillData) =>
  Boolean(data.vatType && data.vatType !== "none") ||
  Number(data.vatAmount ?? 0) > 0;
const vatLabel = (data: BillData) =>
  data.vatRate && data.vatRate > 0 ? `  VAT (${data.vatRate}%):` : "  VAT:";

const SunmiPrinter = NativeModules.SunmiPrinter;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const vnd = (n: number) => `${Math.round(n).toLocaleString("vi-VN")}đ`;

/**
 * Tạo dòng căn phải trên máy in nhiệt (32 ký tự).
 * Ký tự tiếng Việt Unicode > 127 chiếm 2 đơn vị.
 */
const thermalRow = (label: string, value: string, maxW = 32): string => {
  const vLen = value.length + (value.endsWith("đ") ? 1 : 0);
  const spaces = Math.max(1, maxW - label.length - vLen);
  return label + " ".repeat(spaces) + value;
};

/**
 * Format 1 dòng item: [Tên 18] [SL 4] [Giá 10] = 32 ký tự
 */
const thermalTextWidth = (value: string) =>
  Array.from(value).reduce(
    (sum, char) => sum + (char.charCodeAt(0) > 127 ? 2 : 1),
    0,
  );

const sliceByThermalWidth = (value: string, width: number): string[] => {
  const chunks: string[] = [];
  let current = "";
  let currentWidth = 0;

  Array.from(value).forEach((char) => {
    const charWidth = char.charCodeAt(0) > 127 ? 2 : 1;
    if (current && currentWidth + charWidth > width) {
      chunks.push(current);
      current = "";
      currentWidth = 0;
    }
    current += char;
    currentWidth += charWidth;
  });

  if (current) chunks.push(current);
  return chunks;
};

const padRight = (value: string, width: number) =>
  value + " ".repeat(Math.max(0, width - thermalTextWidth(value)));

const padLeft = (value: string, width: number) =>
  " ".repeat(Math.max(0, width - thermalTextWidth(value))) + value;

const wrapText = (value: string, width: number): string[] => {
  const words = value.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  words.forEach((word) => {
    if (thermalTextWidth(word) > width) {
      if (current) {
        lines.push(current);
        current = "";
      }
      lines.push(...sliceByThermalWidth(word, width));
      return;
    }

    const next = current ? `${current} ${word}` : word;
    if (thermalTextWidth(next) <= width) {
      current = next;
    } else {
      lines.push(current);
      current = word;
    }
  });

  if (current) lines.push(current);
  return lines.length ? lines : [""];
};

const thermalItemRows = (name: string, qty: number, price: string): string[] => {
  const MAX_W = 32;
  const QTY_W = 4;
  const PRICE_W = 10;
  const NAME_W = MAX_W - QTY_W - PRICE_W; // 18 chars for Name
  const qtyStr = `${qty}`; 
  const nameLines = wrapText(name, NAME_W);

  return nameLines.map((line, index) => {
    // Chỉ hiển thị SL và Giá ở dòng đầu tiên của tên món
    const qtyCol = index === 0 ? padLeft(qtyStr, QTY_W) : " ".repeat(QTY_W);
    const priceCol = index === 0 ? padLeft(price, PRICE_W) : " ".repeat(PRICE_W);
    
    return `${padRight(line, NAME_W)}${qtyCol}${priceCol}`;
  });
};

// ─── Print (Sunmi) ────────────────────────────────────────────────────────────

/**
 * In hóa đơn trực tiếp lên máy Sunmi POS.
 * @returns true nếu in thành công
 */
export const printBillOnSunmi = async (data: BillData): Promise<boolean> => {
  try {
    if (Platform.OS !== "android") {
      Toast.show({ type: "info", text1: "Tính năng in chỉ hỗ trợ Android" });
      return false;
    }
    if (!SunmiPrinter) {
      Toast.show({
        type: "error",
        text1: "Không tìm thấy máy in",
        text2: "Vui lòng kiểm tra phần cứng POS",
      });
      return false;
    }

    // ── KIỂM TRA DỊCH VỤ MÁY IN ĐÃ KẾT NỐI CHƯA (Chống Crash) ──
    if (SunmiPrinter.hasPrinter) {
      try {
        const isConnected = await SunmiPrinter.hasPrinter();
        if (!isConnected) {
          Toast.show({
            type: "error",
            text1: "Lỗi kết nối máy in",
            text2:
              "Chưa kết nối được với dịch vụ in Sunmi (hoặc không phải thiết bị Sunmi).",
          });
          return false;
        }
      } catch (printerError) {
        console.error("❌ [BillService] Lỗi kiểm tra máy in:", printerError);
        Toast.show({
          type: "error",
          text1: "Lỗi kiểm tra máy in",
          text2: "Không thể xác nhận kết nối máy in Sunmi.",
        });
        return false;
      }
    }

    if (SunmiPrinter.printerInit) {
      SunmiPrinter.printerInit();
    }

    if (typeof SunmiPrinter.printerText !== "function" || typeof SunmiPrinter.setAlignment !== "function") {
      Toast.show({
        type: "error",
        text1: "Máy in không hỗ trợ",
        text2: "Thiết bị này không có chức năng in hóa đơn Sunmi.",
      });
      return false;
    }

    console.log("🖨️ [BillService] Bắt đầu in hóa đơn Sunmi...");

    // Fetch latest order data from backend for accurate VAT and details
    let latestOrder: any = null;
    try {
      // FIX: Đảm bảo orderId là chuỗi số (numeric string) để tránh lỗi Validation 400
      const orderId = String(data.orderId);
      if (!orderId || orderId === "undefined" || orderId === "null") {
        Toast.show({
          type: "error",
          text1: "Mã đơn hàng không hợp lệ",
          text2: `Mã đơn: ${orderId}`,
        });
        return false;
      }

      console.log(`📡 [BillService] Fetching order from backend: orderId=${orderId}`);
      const response: any = await fetchOrderById(orderId);
      console.log(`📡 [BillService] Backend response:`, response);
      
      // Check if response is valid (res_code === 0 means success)
      if (!response || response.res_code !== 0 || !response.data) {
        const errorMsg = response?.error_cont || "Không thể lấy dữ liệu từ backend";
        console.error("❌ [BillService] API Error:", errorMsg, "Response:", response);
        Toast.show({
          type: "error",
          text1: "Lỗi lấy dữ liệu đơn hàng",
          text2: errorMsg,
        });
        return false;
      }

      latestOrder = response.data;
      if (!latestOrder) {
        Toast.show({
          type: "error",
          text1: "Không thể lấy dữ liệu đơn hàng mới nhất từ backend",
        });
        return false;
      }
    } catch (fetchError) {
      console.error("❌ [BillService] Lỗi fetch đơn hàng:", fetchError);
      Toast.show({
        type: "error",
        text1: "Lỗi kết nối backend",
        text2: fetchError instanceof Error ? fetchError.message : "Không xác định",
      });
      return false;
    }

    if (!latestOrder) {
      Toast.show({
        type: "error",
        text1: "Dữ liệu đơn hàng trống",
      });
      return false;
    }


    // Map latestOrder to BillData format
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

    const discount = numberFrom(latestOrder.discount, latestOrder.discountAmount, latestOrder.totalDiscount);
    const vatAmount = numberFrom(latestOrder.vatAmount, latestOrder.taxAmount);
    const rawVatRate = numberFrom(latestOrder.vatRate, latestOrder.taxRate);
    const rawVatType = latestOrder.vatType || latestOrder.taxType;
    const sub = numberFrom(
      latestOrder.subTotal,
      latestOrder.subtotalAmount,
      latestOrder.totalPrice,
    );
    const total = numberFrom(
      latestOrder.grandTotal,
      latestOrder.totalAmount,
      latestOrder.total,
      sub - discount + (rawVatType === "exclusive" ? vatAmount : 0),
    );
    const vatType = inferVatType(rawVatType, vatAmount, sub, discount, total);
    const vatRate = inferVatRate(rawVatRate, vatAmount, sub, discount, vatType);

    const items = Array.isArray(latestOrder.items) ? latestOrder.items : [];
    const updatedData: BillData = {
      id: latestOrder.id,
      orderId: latestOrder.id || latestOrder.orderId,
      customerName: latestOrder.customerName || "Khách vãng lai",
      createdAt: latestOrder.createdAt,
      items,
      subTotal: sub,
      vatAmount: vatAmount,
      vatRate: vatRate,
      vatType: vatType,
      discount: discount,
      totalAmount: total,
      paymentMethod: latestOrder.paymentMethod || "CASH",
      cashReceived: latestOrder.cashReceived,
      cashChange: latestOrder.cashChange,
    };

    // Use updatedData for printing
    const billData = updatedData;

    const SEP = "--------------------------------\n"; // 32 dashes
    const SEP2 = "================================\n"; // 32 equals

    // ── HEADER ──
    SunmiPrinter.setAlignment(1); // center

    // In Logo Base64 (width: 250px)
    if (SunmiPrinter.printBitmap) {
      try {
        SunmiPrinter.printBitmap(LOGO_BASE64, 250);
        SunmiPrinter.printerText("\n");
      } catch (bitmapError) {
        console.warn("⚠️ [BillService] In logo thất bại:", bitmapError);
        SunmiPrinter.setFontSize(28);
        SunmiPrinter.setFontWeight(true);
        SunmiPrinter.printerText("CHIPS BILL\n");
        SunmiPrinter.setFontWeight(false);
      }
    } else {
      SunmiPrinter.setFontSize(28);
      SunmiPrinter.setFontWeight(true);
      SunmiPrinter.printerText("CHIPS BILL\n");
      SunmiPrinter.setFontWeight(false);
    }

    SunmiPrinter.setFontSize(24);
    SunmiPrinter.setFontWeight(true);
    SunmiPrinter.printerText("HÓA ĐƠN BÁN HÀNG\n");
    SunmiPrinter.setFontWeight(false);
    SunmiPrinter.printerText(SEP);

    // ── THÔNG TIN ĐƠN ──
    SunmiPrinter.setAlignment(0); // left
    SunmiPrinter.printerText(`Mã đơn: #${billData.orderId}\n`);
    const dateStr = new Date().toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    });
    SunmiPrinter.printerText(`Ngày:   ${dateStr}\n`);
    SunmiPrinter.printerText(
      `NV:  ${billData.customerName || "Khách vãng lai"}\n`,
    );
    SunmiPrinter.printerText(
      `Hình thức: ${billData.paymentMethod === "VNPAY" ? "VNPay" : "Tiền mặt"}\n`,
    );
    SunmiPrinter.printerText(SEP);

    // ── BẢNG MÓN ──
    SunmiPrinter.setFontWeight(true);
    SunmiPrinter.printerText("Tên món             SL    TTiền\n");
    SunmiPrinter.setFontWeight(false);
    SunmiPrinter.printerText(SEP);

    billData.items.forEach((item) => {
      const qty = item.quantity;
      const price = vnd(item.unitPrice * qty);
      thermalItemRows(item.name, qty, price).forEach((row) => {
        SunmiPrinter.printerText(row + "\n");
      });

      item.attributes?.forEach((attr) => {
        if (attr.price > 0) {
          const attrPrice = vnd(attr.price * qty);
          thermalItemRows(`+ ${attr.name}`, qty, attrPrice).forEach((row) => {
            SunmiPrinter.printerText(row + "\n");
          });
        }
      });
    });

    // ── TỔNG ──
    SunmiPrinter.printerText(SEP);
    SunmiPrinter.printerText(
      thermalRow("Tổng tiền:", vnd(billData.subTotal)) + "\n",
    );
    SunmiPrinter.printerText(
      thermalRow("Khuyến mãi:", vnd(billData.discount ?? 0)) + "\n",
    );

    SunmiPrinter.printerText(SEP2);
    SunmiPrinter.setFontWeight(true);
    SunmiPrinter.printerText(
      thermalRow("TỔNG CỘNG:", vnd(billData.totalAmount)) + "\n",
    );
    SunmiPrinter.setFontWeight(false);
    if (hasVat(billData)) {
      SunmiPrinter.printerText(
        billData.vatType === "inclusive" ? "Da bao gom:\n" : "Chua bao gom:\n",
      );
      SunmiPrinter.printerText(
        thermalRow(vatLabel(billData), vnd(billData.vatAmount ?? 0)) + "\n",
      );
    } else {
      SunmiPrinter.printerText("Khong tinh VAT\n");
    }
    SunmiPrinter.printerText(SEP2);

    // Tiền mặt: khách đưa & thừa
    if (billData.paymentMethod === "CASH" && billData.cashReceived != null) {
      SunmiPrinter.printerText(
        thermalRow("Tiền khách đưa:", vnd(billData.cashReceived)) + "\n",
      );
      SunmiPrinter.printerText(
        thermalRow("Tiền thừa:", vnd(billData.cashChange ?? 0)) + "\n",
      );
      SunmiPrinter.printerText(SEP);
    }

    // ── QR ──
    SunmiPrinter.setAlignment(1);
    if (SunmiPrinter.printQRCode) {
      try {
        SunmiPrinter.printQRCode(
          `https://bill-dev.chips.com.vn/pay/${billData.orderId}?method=vnpay`,
          4,
          2,
        );
        SunmiPrinter.printerText("\n");
      } catch (qrError) {
        console.warn("⚠️ [BillService] In QR code thất bại:", qrError);
      }
    } else {
      console.warn("⚠️ [BillService] printQRCode không hỗ trợ trên thiết bị này.");
    }

    // ── FOOTER ──
    SunmiPrinter.setFontWeight(true);
    SunmiPrinter.printerText("Cảm ơn Quý khách! Hẹn gặp lại!\n");
    SunmiPrinter.printerText("Chips.vn - 0966 966 247\n");
    SunmiPrinter.setFontWeight(false);
    SunmiPrinter.setFontSize(20);
    SunmiPrinter.printerText("Phần mềm Chips Bill POS\n");

    // Đẩy giấy ra đủ để xé
    if (SunmiPrinter.lineWrap) {
      SunmiPrinter.lineWrap(4);
    } else {
      SunmiPrinter.printerText("\n\n\n\n");
    }

    Toast.show({
      type: "success",
      text1: "🖨️ In hóa đơn thành công!",
      position: "bottom",
    });
    return true;
  } catch (error) {
    console.error("❌ [BillService] Lỗi in Sunmi:", error);
    Toast.show({
      type: "error",
      text1: "Lỗi máy in",
      text2: "Kiểm tra kết nối hoặc giấy in",
    });
    return false;
  }
};

// ─── Share (ViewShot) ─────────────────────────────────────────────────────────

/**
 * Chụp ảnh component bill và share.
 * @param viewShotRef — ref của <ViewShot> đang wrap <BillReceiptComponent>
 */
export const shareBillImage = async (
  viewShotRef: RefObject<any>,
): Promise<boolean> => {
  try {
    if (!viewShotRef.current) {
      Toast.show({ type: "error", text1: "Không thể chụp ảnh hóa đơn" });
      return false;
    }

    console.log("📸 [BillService] Chụp ảnh bill...");
    // capture() trả về URI file ảnh (jpg)
    const uri: string = await (viewShotRef.current as any).capture();
    console.log("📸 [BillService] captured URI:", uri);

    await Share.share({
      title: "Hóa đơn Chips Bill",
      message: `Hóa đơn thanh toán từ Chips Bill POS. Chi tiết xem tại: ${uri}`,
      url: uri, // iOS
    });

    return true;
  } catch (error: any) {
    if (error?.message !== "User did not share") {
      console.error("❌ [BillService] Share error:", error);
      Toast.show({ type: "error", text1: "Không thể chia sẻ hóa đơn" });
    }
    return false;
  }
};
