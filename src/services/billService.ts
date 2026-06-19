/**
 * @file billService.ts
 * @desc Service xử lý in hóa đơn (Sunmi POS) và chia sẻ ảnh bill (ViewShot).
 *       - printBill() → in trực tiếp lên máy in Sunmi, tự động fetch dữ liệu mới nhất từ backend
 *       - shareBill() → chụp ảnh component bill → share qua app khác
 * @layer services
 */

import { Platform, NativeModules, Share, InteractionManager } from "react-native";
import type { RefObject } from "react";
import Toast from "react-native-toast-message";
import { BillData } from "@/components/BillReceiptComponent";
import { captureRef } from "react-native-view-shot";

import { LOGO_BASE64 } from "@/constants/logoBase64";
import { fetchOrderById } from "@/services/orderService";
import { createVNPayUrl } from "@/services/paymentService";

const hasVat = (data: BillData) =>
  Boolean(data.vatType && data.vatType !== "none") ||
  Number(data.vatAmount ?? 0) > 0;

const SunmiPrinter = NativeModules.SunmiPrinter;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const vnd = (n: number) => `${Math.round(n).toLocaleString("vi-VN")}đ`;
const RECEIPT_BRANCH_NAME = "CHI NHÁNH QUẬN 12";
const RECEIPT_BRANCH_ADDRESS = "456 Lê Lợi, Q.12, TP.HCM";
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

/**
 * Tạo dòng căn phải trên máy in nhiệt (32 ký tự).
 * Ưu tiên căn theo độ rộng ký tự (1/2 cột) để tránh lệch cột khi có Unicode.
 */
const thermalRow = (label: string, value: string, maxW = 32): string => {
  const spaces = Math.max(1, maxW - thermalTextWidth(label) - thermalTextWidth(value));
  return label + " ".repeat(spaces) + value;
};

/**
 * Format 1 dòng item: [Tên 18] [SL 4] [Giá 10] = 32 ký tự
 */
const thermalTextWidth = (value: string) =>
  Array.from(value).reduce((sum, char) => {
    const code = char.codePointAt(0) ?? 0;
    const isWide =
      (code >= 0x1100 && code <= 0x115f) ||
      (code >= 0x2329 && code <= 0x232a) ||
      (code >= 0x2e80 && code <= 0xa4cf) ||
      (code >= 0xac00 && code <= 0xd7a3) ||
      (code >= 0xf900 && code <= 0xfaff) ||
      (code >= 0xfe10 && code <= 0xfe19) ||
      (code >= 0xfe30 && code <= 0xfe6f) ||
      (code >= 0xff00 && code <= 0xff60) ||
      (code >= 0xffe0 && code <= 0xffe6);
    return sum + (isWide ? 2 : 1);
  }, 0);

const sliceByThermalWidth = (value: string, width: number): string[] => {
  const chunks: string[] = [];
  let current = "";
  let currentWidth = 0;

  Array.from(value).forEach((char) => {
    const code = char.codePointAt(0) ?? 0;
    const charWidth =
      (code >= 0x1100 && code <= 0x115f) ||
      (code >= 0x2329 && code <= 0x232a) ||
      (code >= 0x2e80 && code <= 0xa4cf) ||
      (code >= 0xac00 && code <= 0xd7a3) ||
      (code >= 0xf900 && code <= 0xfaff) ||
      (code >= 0xfe10 && code <= 0xfe19) ||
      (code >= 0xfe30 && code <= 0xfe6f) ||
      (code >= 0xff00 && code <= 0xff60) ||
      (code >= 0xffe0 && code <= 0xffe6)
        ? 2
        : 1;
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
    const logPrefix = `[BillService][Print][orderId=${String(data?.orderId ?? "")}]`;
    let lastPrinterMethod = "";
    const callPrinter = async (method: string, ...args: any[]) => {
      lastPrinterMethod = method;
      const fn = (SunmiPrinter as any)?.[method];
      if (typeof fn !== "function") {
        console.log(`${logPrefix} SKIP ${method} (not a function)`);
        return undefined;
      }
      try {
        const argPreview = args
          .map((a) => {
            if (typeof a === "string") {
              const trimmed = a.length > 120 ? `${a.slice(0, 120)}…` : a;
              return `"${trimmed}"(len=${a.length})`;
            }
            if (typeof a === "number" || typeof a === "boolean") return String(a);
            if (a == null) return String(a);
            return Object.prototype.toString.call(a);
          })
          .join(", ");
        console.log(`${logPrefix} CALL ${method}(${argPreview})`);
        const res = fn(...args);
        await Promise.resolve(res);
        console.log(`${logPrefix} OK   ${method}`);
        return res;
      } catch (err: any) {
        console.error(`${logPrefix} FAIL ${method}:`, err);
        const message = err?.message ? String(err.message) : String(err);
        const wrapped: any = new Error(`[SunmiPrinter.${method}] ${message}`);
        wrapped.cause = err;
        wrapped._sunmiMethod = method;
        throw wrapped;
      }
    };

    if (Platform.OS !== "android") {
      Toast.show({ type: "info", text1: "Tính năng in chỉ hỗ trợ Android!" });
      return false;
    }
    if (!SunmiPrinter) {
      Toast.show({
        type: "error",
        text1: "Không tìm thấy máy in",
        text2: "Vui lòng kiểm tra phần cứng POS!",
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
            text1: "Lỗi kết nối máy in!",
            text2:
              "Chưa kết nối được với dịch vụ in Sunmi (hoặc không phải thiết bị Sunmi).!",
          });
          return false;
        }
      } catch (printerError) {
        console.error("❌ [BillService] Lỗi kiểm tra máy in:", printerError);
        Toast.show({
          type: "error",
          text1: "Lỗi kiểm tra máy in!",
          text2: "Không thể xác nhận kết nối máy in Sunmi.!",
        });
        return false;
      }
    }

    if (SunmiPrinter.printerInit) {
      await callPrinter("printerInit");
    }

    if (typeof SunmiPrinter.printerText !== "function" || typeof SunmiPrinter.setAlignment !== "function") {
      Toast.show({
        type: "error",
        text1: "Máy in không hỗ trợ!",
        text2: "Thiết bị này không có chức năng in hóa đơn Sunmi!.",
      });
      return false;
    }

    console.log("🖨️ [BillService] Bắt đầu in hóa đơn Sunmi...");
    try {
      await callPrinter("enterPrinterBuffer", true);
    } catch {}

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
        console.error("❌ [BillService] API Error:", errorMsg);
        console.error("❌ [BillService] Chi tiết phản hồi:", JSON.stringify(response, null, 2));
        Toast.show({
          type: "error",
          text1: "Lỗi lấy dữ liệu đơn hàng!",
          text2: errorMsg,
        });
        return false;
      }

      latestOrder = response.data;
      if (!latestOrder) {
        Toast.show({
          type: "error",
          text1: "Không thể lấy dữ liệu đơn hàng mới nhất từ database!",
        });
        return false;
      }
    } catch (fetchError: any) {
      console.error("❌ [BillService] Lỗi fetch đơn hàng:", fetchError);
      if (fetchError && fetchError.response) {
        console.error("❌ [BillService] Chi tiết lỗi API (status code):", fetchError.response.status);
        console.error("❌ [BillService] Dữ liệu phản hồi lỗi:", JSON.stringify(fetchError.response.data, null, 2));
      }
      if (fetchError && fetchError.config) {
        console.error("❌ [BillService] Request Config URL:", fetchError.config.url);
        console.error("❌ [BillService] Request Config Method:", fetchError.config.method);
        console.error("❌ [BillService] Request Config Params:", JSON.stringify(fetchError.config.params, null, 2));
        console.error("❌ [BillService] Request Config Data:", JSON.stringify(fetchError.config.data, null, 2));
      }
      Toast.show({
        type: "error",
        text1: "Lỗi kết nối backend",
        text2: fetchError instanceof Error ? fetchError.message : "Không xác định!",
      });
      return false;
    }

    if (!latestOrder) {
      Toast.show({
        type: "error",
        text1: "Dữ liệu đơn hàng trống!",
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

    const rawItems = Array.isArray(latestOrder.items) ? latestOrder.items : 
                     Array.isArray(latestOrder.orderItems) ? latestOrder.orderItems : [];
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

    const updatedData: BillData = {
      id: latestOrder.id,
      orderId: latestOrder.id || latestOrder.orderId,
      orderCode: latestOrder.orderCode || latestOrder.order_code,
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
      cashierName: latestOrder.cashierName || latestOrder.createdByName || latestOrder.createdBy || "admin",
      branchName: latestOrder.branchName || RECEIPT_BRANCH_NAME,
      branchAddress: latestOrder.branchAddress || RECEIPT_BRANCH_ADDRESS,
      hotline: latestOrder.branchPhone || latestOrder.hotline || RECEIPT_HOTLINE,
      taxCode: latestOrder.taxCode || latestOrder.branchTaxCode || RECEIPT_TAX_CODE,
      qrValue: `https://bill.chips.vn/pay/${latestOrder.id || latestOrder.orderId}`,
    };

    // Use updatedData for printing
    const billData = updatedData;

    const SEP = "--------------------------------\n"; // 32 dashes
    const SEP2 = "================================\n"; // 32 equals
    const MAX_W = 32;
    const QTY_W = 4;
    const PRICE_W = 10;
    const NAME_W = MAX_W - QTY_W - PRICE_W;

    // ── HEADER ──
    await callPrinter("setAlignment", 1);
    await callPrinter("printerText", SEP);

    // In Logo Base64 (width: 250px)
    if (SunmiPrinter.printBitmap) {
      try {
        const logo =
          LOGO_BASE64.startsWith("data:image/")
            ? LOGO_BASE64
            : `data:image/png;base64,${LOGO_BASE64}`;
        console.log(
          `${logPrefix} LOGO base64Len=${LOGO_BASE64.length} hasDataPrefix=${LOGO_BASE64.startsWith("data:image/")}`,
        );
        await callPrinter("printBitmap", logo, 250);
        await callPrinter("printerText", "\n");
      } catch (bitmapError) {
        console.warn("⚠️ [BillService] In logo thất bại:", bitmapError);
        try {
          await callPrinter("setFontSize", 28);
          await callPrinter("setFontWeight", true);
          await callPrinter("printerText", "CHIPS BILL\n");
          await callPrinter("setFontWeight", false);
        } catch {}
      }
    } else {
      await callPrinter("setFontSize", 28);
      await callPrinter("setFontWeight", true);
      await callPrinter("printerText", "CHIPS BILL\n");
      await callPrinter("setFontWeight", false);
    }

    await callPrinter("setFontSize", 24);
    await callPrinter("setFontWeight", true);
    await callPrinter(
      "printerText",
      `${normalizeReceiptText(billData.branchName) || RECEIPT_BRANCH_NAME}\n`,
    );
    await callPrinter("setFontWeight", false);
    await callPrinter("setFontSize", 20);
    await callPrinter(
      "printerText",
      `${normalizeReceiptText(billData.branchAddress) || RECEIPT_BRANCH_ADDRESS}\n`,
    );
    await callPrinter(
      "printerText",
      `Hotline: ${normalizeReceiptText(billData.hotline) || RECEIPT_HOTLINE}\n`,
    );
    await callPrinter(
      "printerText",
      `Mã số thuế: ${normalizeReceiptText(billData.taxCode) || RECEIPT_TAX_CODE}\n`,
    );
    await callPrinter("printerText", "\n");
    await callPrinter("setFontSize", 24);
    await callPrinter("setFontWeight", true);
    await callPrinter("printerText", "HÓA ĐƠN BÁN HÀNG\n");
    await callPrinter("setFontWeight", false);
    await callPrinter("printerText", SEP);

    // ── THÔNG TIN ĐƠN ──
    await callPrinter("setAlignment", 0);
    await callPrinter(
      "printerText",
      `Mã đơn: ${normalizeReceiptText(billData.orderCode || String(billData.orderId))}\n`,
    );
    const dateStr = formatReceiptDate(billData.createdAt) || formatReceiptDate(new Date().toISOString());
    await callPrinter("printerText", `Ngày:   ${dateStr}\n`);
    await callPrinter(
      "printerText",
      `Thu ngân: ${normalizeReceiptText(billData.cashierName) || "admin"}\n`,
    );
    await callPrinter("printerText", SEP);

    // ── BẢNG MÓN ──
    await callPrinter("setFontWeight", true);
    await callPrinter(
      "printerText",
      `${padRight("Tên món", NAME_W)}${padLeft("SL", QTY_W)}${padLeft("TTiền", PRICE_W)}\n`,
    );
    await callPrinter("setFontWeight", false);
    await callPrinter("printerText", SEP);

    billData.items.forEach((item) => {
      const qty = item.quantity;
      const price = vnd(item.unitPrice * qty);
      thermalItemRows(normalizeReceiptText(item.name) || "Món", qty, price).forEach((row) => {
        callPrinter("printerText", row + "\n").catch(() => {});
      });
    });

    // ── TỔNG ──
    await callPrinter("printerText", SEP);
    await callPrinter(
      "printerText",
      thermalRow("Tổng tiền:", vnd(billData.subTotal)) + "\n",
    );
    await callPrinter(
      "printerText",
      thermalRow("Khuyến mãi:", vnd(billData.discount ?? 0)) + "\n",
    );

    await callPrinter("printerText", SEP2);
    await callPrinter("setFontWeight", true);
    await callPrinter(
      "printerText",
      thermalRow("TỔNG CỘNG:", vnd(billData.totalAmount)) + "\n",
    );
    await callPrinter("setFontWeight", false);
    if (hasVat(billData)) {
      await callPrinter(
        "printerText",
        thermalRow("Tổng tiền thuế VAT:", vnd(billData.vatAmount ?? 0)) + "\n",
      );
      await callPrinter("printerText", "Giá bán đã bao gồm thuế VAT\n");
    } else {
      await callPrinter("printerText", "Không tính VAT\n");
    }
    await callPrinter("printerText", SEP2);

    // Tiền mặt: khách đưa & thừa
    if (billData.paymentMethod === "CASH" && billData.cashReceived != null) {
      await callPrinter(
        "printerText",
        thermalRow("Tiền khách đưa:", vnd(billData.cashReceived)) + "\n",
      );
      await callPrinter(
        "printerText",
        thermalRow("Tiền thừa:", vnd(billData.cashChange ?? 0)) + "\n",
      );
      await callPrinter("printerText", SEP);
    }

    // ── QR ──
    await callPrinter("setAlignment", 1);
    if (SunmiPrinter.printQRCode) {
      try {
        let qrCodeUrl = normalizeReceiptText(billData.qrValue) || `https://bill.chips.vn/pay/${billData.orderId}`;
        
        try {
          console.log(`📡 [BillService] Đang lấy VNPay payment URL để in QR thanh toán...`);
          const vnpayRes = await createVNPayUrl(billData.orderId);
          const url =
            (vnpayRes as any)?.data?.paymentUrl ||
            (vnpayRes as any)?.paymentUrl ||
            (vnpayRes as any)?.data?.url ||
            (vnpayRes as any)?.url;
          
          if (url) {
            qrCodeUrl = url;
            console.log(`📡 [BillService] Đã lấy thành công VNPay payment URL để in QR: ${url}`);
          }
        } catch (vnpayError) {
          console.warn("⚠️ [BillService] Lấy VNPay URL thất bại, dùng URL mặc định:", vnpayError);
        }

        await callPrinter("printQRCode", qrCodeUrl, 4, 2);
        await callPrinter("printerText", "\n");
      } catch (qrError) {
        console.warn("⚠️ [BillService] In QR code thất bại:", qrError);
      }
    } else {
      console.warn("⚠️ [BillService] printQRCode không hỗ trợ trên thiết bị này.");
    }

    // ── FOOTER ──
    await callPrinter("setFontWeight", true);
    await callPrinter("printerText", "Hẹn gặp lại quý khách!\n");
    await callPrinter("setFontWeight", false);
    await callPrinter("setFontSize", 20);
    await callPrinter("printerText", "Phần mềm được viết bởi ChipsBill POS\n");

    // Đẩy giấy ra đủ để xé
    if (SunmiPrinter.lineWrap) {
      await callPrinter("lineWrap", 6);
    } else {
      await callPrinter("printerText", "\n\n\n\n\n\n");
    }
    try {
      await callPrinter("commitPrinterBuffer");
    } catch {}
    try {
      await callPrinter("exitPrinterBuffer", true);
    } catch {}
    try {
      await callPrinter("cutPaper");
    } catch {}

    Toast.show({
      type: "success",
      text1: "🖨️ In hóa đơn thành công!",
      position: "bottom",
    });
    return true;
  } catch (error) {
    console.error("❌ [BillService] Lỗi in Sunmi:", error);
    const errAny: any = error;
    const message = errAny?.message ? String(errAny.message) : String(error);
    const method = errAny?._sunmiMethod ? String(errAny._sunmiMethod) : "";
    Toast.show({
      type: "error",
      text1: "Lỗi máy in",
      text2: `${method ? `${method}: ` : ""}${message}`,
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
    if (!viewShotRef?.current) {
      Toast.show({ type: "error", text1: "Không thể chụp ảnh hóa đơn" });
      return false;
    }

    console.log("📸 [BillService] Chụp ảnh bill...");
    await new Promise<void>((resolve) =>
      InteractionManager.runAfterInteractions(() => resolve()),
    );

    const target = viewShotRef.current;
    const tryCapture = async () =>
      (await captureRef(target, {
        format: "jpg",
        quality: 0.95,
      })) as string;

    let uri = "";
    let lastErr: any = null;
    for (let attempt = 0; attempt < 4; attempt += 1) {
      try {
        uri = await tryCapture();
        if (uri) break;
      } catch (err: any) {
        lastErr = err;
        await new Promise((r) => setTimeout(r, 120));
      }
    }
    if (!uri) {
      console.error("❌ [BillService] Capture bill failed:", lastErr);
      Toast.show({
        type: "error",
        text1: "Không thể chụp ảnh hóa đơn",
        text2:
          lastErr?.message?.includes("width and height must be > 0")
            ? "Hóa đơn chưa render xong, hãy thử lại sau 1 giây"
            : "Vui lòng thử lại",
      });
      return false;
    }
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
