/**
 * @file billService.ts
 * @desc Service xử lý in hóa đơn (Sunmi POS) và chia sẻ ảnh bill (ViewShot).
 *       - printBill()  → in trực tiếp lên máy in Sunmi
 *       - shareBill()  → chụp ảnh component bill → share qua app khác
 * @layer services
 */

import { Platform, NativeModules, Share } from "react-native";
import ViewShot from "react-native-view-shot";
import Toast from "react-native-toast-message";
import { BillData } from "@/components/BillReceiptComponent";

import { LOGO_BASE64 } from "@/constants/logoBase64";

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
const thermalItemRow = (name: string, qty: number, price: string): string => {
  const MAX_W = 32;
  const QTY_W = 4;
  const PRICE_W = 10;
  const NAME_W = MAX_W - QTY_W - PRICE_W; // 18 chars for Name

  let truncatedName = name;
  if (truncatedName.length > NAME_W - 1) {
    truncatedName = truncatedName.substring(0, NAME_W - 2) + ".";
  }

  // Tên món căn trái
  const namePad = " ".repeat(Math.max(0, NAME_W - truncatedName.length));

  // Số lượng căn phải
  const qtyStr = String(qty);
  const qtyPad = " ".repeat(Math.max(0, QTY_W - qtyStr.length));

  // Giá căn phải (xử lý Unicode chữ đ để đếm đúng chiều dài)
  let priceLen = price.length;
  const pricePad = " ".repeat(Math.max(0, PRICE_W - priceLen));

  return `${truncatedName}${namePad}${qtyPad}${qtyStr}${pricePad}${price}`;
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
    }

    console.log("🖨️ [BillService] Bắt đầu in hóa đơn Sunmi...");

    // Khởi tạo máy in (Quan trọng để tránh in ra giấy trắng)
    if (SunmiPrinter.printerInit) {
      SunmiPrinter.printerInit();
    }

    const SEP = "--------------------------------\n"; // 32 dashes
    const SEP2 = "================================\n"; // 32 equals

    // ── HEADER ──
    SunmiPrinter.setAlignment(1); // center

    // In Logo Base64 (width: 250px)
    if (SunmiPrinter.printBitmap) {
      SunmiPrinter.printBitmap(LOGO_BASE64, 250);
      SunmiPrinter.printerText("\n");
    } else {
      SunmiPrinter.setFontSize(28);
      SunmiPrinter.setFontWeight(true);
      SunmiPrinter.printerText("CHIPS BILL\n");
    }

    SunmiPrinter.setFontSize(24);
    SunmiPrinter.setFontWeight(true);
    SunmiPrinter.printerText("HÓA ĐƠN BÁN HÀNG\n");
    SunmiPrinter.setFontWeight(false);
    SunmiPrinter.printerText(SEP);

    // ── THÔNG TIN ĐƠN ──
    SunmiPrinter.setAlignment(0); // left
    SunmiPrinter.printerText(`Mã đơn: #${data.orderId}\n`);
    const dateStr = new Date().toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    });
    SunmiPrinter.printerText(`Ngày:   ${dateStr}\n`);
    SunmiPrinter.printerText(
      `Khách:  ${data.customerName || "Khách vãng lai"}\n`,
    );
    SunmiPrinter.printerText(
      `Hình thức: ${data.paymentMethod === "VNPAY" ? "VNPay" : "Tiền mặt"}\n`,
    );
    SunmiPrinter.printerText(SEP);

    // ── BẢNG MÓN ──
    SunmiPrinter.setFontWeight(true);
    SunmiPrinter.printerText("Tên món             SL    TTiền\n");
    SunmiPrinter.setFontWeight(false);
    SunmiPrinter.printerText(SEP);

    data.items.forEach((item) => {
      const qty = item.quantity;
      const price = vnd(item.unitPrice * qty);
      SunmiPrinter.printerText(thermalItemRow(item.name, qty, price) + "\n");

      item.attributes?.forEach((attr) => {
        if (attr.price > 0) {
          const attrPrice = vnd(attr.price * qty);
          SunmiPrinter.printerText(
            thermalItemRow(`+ ${attr.name}`, qty, attrPrice) + "\n",
          );
        }
      });
    });

    // ── TỔNG ──
    SunmiPrinter.printerText(SEP);
    SunmiPrinter.printerText(
      thermalRow("Tổng tiền:", vnd(data.subTotal)) + "\n",
    );
    SunmiPrinter.printerText(
      thermalRow("Khuyến mãi:", vnd(data.discount ?? 0)) + "\n",
    );

    SunmiPrinter.printerText(SEP2);
    SunmiPrinter.setFontWeight(true);
    SunmiPrinter.printerText(
      thermalRow("TỔNG CỘNG:", vnd(data.totalAmount)) + "\n",
    );
    SunmiPrinter.setFontWeight(false);
    SunmiPrinter.printerText("Đã bao gồm:\n");
    // Tạm thời giả lập VAT (Backend sẽ trả chi tiết sau)
    const vat10 = 0;
    const vat8 = 0;
    SunmiPrinter.printerText(thermalRow("  VAT (8%):", vnd(vat8)) + "\n");
    SunmiPrinter.printerText(thermalRow("  VAT (10%):", vnd(vat10)) + "\n");
    SunmiPrinter.printerText(SEP2);

    // Tiền mặt: khách đưa & thừa
    if (data.paymentMethod === "CASH" && data.cashReceived != null) {
      SunmiPrinter.printerText(
        thermalRow("Tiền khách đưa:", vnd(data.cashReceived)) + "\n",
      );
      SunmiPrinter.printerText(
        thermalRow("Tiền thừa:", vnd(data.cashChange ?? 0)) + "\n",
      );
      SunmiPrinter.printerText(SEP);
    }

    // ── QR ──
    SunmiPrinter.setAlignment(1);
    SunmiPrinter.printQRCode(
      `https://bill-dev.chips.com.vn/pay/${data.orderId}?method=vnpay`,
      4,
      2,
    );
    SunmiPrinter.printerText("\n");

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
  viewShotRef: React.RefObject<ViewShot>,
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
