import { Platform, NativeModules } from "react-native";
import Toast from "react-native-toast-message";

// Lấy module Native trực tiếp để tránh lỗi Host Object trên RN mới
const SunmiPrinter = NativeModules.SunmiPrinter;
const LOGO_CHIPS_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAHgAAAB4CAYAAAA5ZDbSAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAGXRFWHRTb2Z0d2FyZSBAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAN0SURBVHic7Z29SxtRFMe/M7uJSYIuCGoE8U8QG0XFRitBEMGAtRAsLALW9hZpLdaCvY0p0mgl6S0sAmIh8U8QG0XFRitBEMGAtRAsLALW9hZpLdaCvY0p0mgl6S0sAmIh8U8QG0XFRitBEMGAtRAsLALW9hZpLdaCvY0p0mgl6S0sAmIh8U8QG0XFRitBEMGAtRAsLALW9hZpLdaCvY0p0mgl6S0sAmIh8U8QG0XFRitBEMGAtRAsLALW9hZpLdaCvY0p0mgl6S0sAmIh8U8QG0XFRitBEMGAtRAsLALW9hZpLdaCvY0p0mgl6S0sAmIh8U8QG0XFRitBEMGAtRAsLALW9hZpLdaCvY0p0mgl6S0sAmIh8U8QG0XFRitBEMGAtRAsLALW9hZpLdaCvY0p0mgl6S0sAmIh8U8QG0XFRitBEMGAtRAsLALW9hZpLdaCvY0p0mgl6S0sAmIh8U8QG0XFRitBEMGAtRAsLALW9hZpLdaCvY0p0mgl6S0sAmIh8U8QG0XFRitBEMGAtRAsLALW9hZpLdaCvY0p0mgl6S0sAmIh8U8QG0XFRitBEMGAtRAsLALW9hZpLdaCvY0p0mgl6S0sAmIh8U8QG0XFRitBEMGAtRAsLALW9hZpLdaCvY0p0mgl6S0sAmIh8U8QG0XFRitBEMGAtRAsLALW9hZpLdaCvY0p0mgl6S0sAmIh8U8QG0XFRitBEMGAtRAsLALW9hZpLdaCvY0p0mgl6S0sAmIh8U8QG0XFRitBEMGAtRAsLALW9hZpLdaCvY0p0mgl6S0sAmIh8U8QG0XFRitBEMGAtRAsLALW9hZpLdaCvY0p0mgl6S0sAmIh8U8QG0XFRitBEMGAtRAsLALW9hZpLdaCvY0p0mgl6S0sAmIh8U8QG0XFRitBEMGAtRAsLALW9hZpLdaCvY0p0mgl6S0sAmIh8U8QG0XFRitBEMGAtRAsLALW9hZpLdaCvY0p0mgl6S0sAmIh8U8QG0XFRitBEMGAtRAsLALW9hZpLdaCvY0p0mgl6S0sAmIh8U8QG0XFRitBEMGAtRAsLALW9hZpLdaCvY0p0mgl6S0sAmIh8U8QG0XFRitBEMGAtRAsLALW9hZpLdaCvY0p0mgl6S0sAmIh8U8QG0XFRitBEMGAtRAsLALW9hZpLdaCvY0p0mgl6S0sAmIh8U/8BynR25YvXy0QAAAAASUVORK5CYII=";

/**
 * @file printerService.ts
 * @desc Xử lý kết nối và in ấn trên máy VNPAY/Sunmi POS (58mm).
 *
 * Lưu ý quan trọng về máy in nhiệt:
 * - Chữ tiếng Việt (Unicode > 127) chiếm 2 đơn vị độ rộng khi in
 * - Tổng độ rộng dòng = 32 đơn vị (font size 24)
 * - Tránh dùng printColumnsText cho text tiếng Việt → dễ vỡ cột
 */

export interface PrintData {
  id?: string | number;
  items: any[];
  totalPrice: number;
  customerName?: string;
  createdAt?: string;
}

class PrinterService {
  /** Tính độ rộng thực tế khi in: Unicode (tiếng Việt) = 2 đơn vị, ASCII = 1 */
  private pw(str: string): number {
    let w = 0;
    for (const c of str) {
      w += c.charCodeAt(0) > 127 ? 2 : 1;
    }
    return w;
  }

  /**
   * Tạo dòng "label   value" căn phải sát lề
   * Lưu ý: ký tự "đ" (U+0111) in 2 đơn vị trên máy in nhiệt → trừ thêm 1
   */
  private row(label: string, value: string, maxW = 32): string {
    const vLen = value.length + (value.endsWith("đ") ? 1 : 0);
    const spaces = Math.max(1, maxW - label.length - vLen);
    return label + " ".repeat(spaces) + value;
  }

  /** Format số tiền VND */
  private vnd(amount: number): string {
    return `${Math.round(amount).toLocaleString("vi-VN")}đ`;
  }

  /**
   * Format 1 dòng item: [Tên món (16)] [SL (3)] [Giá (13)] = 32 ký tự
   * VNPAY POS render Unicode 1-width → dùng .length không dùng pw().
   */
  private formatItemRow(name: string, qty: number, price: string): string {
    const NAME_W = 16;
    const QTY_W = 3;
    const PRICE_W = 13; // 16+3+13 = 32

    // Cắt tên nếu quá dài
    let n = name;
    if (n.length > NAME_W) {
      n = n.slice(0, NAME_W - 2) + "..";
    }
    const namePad = " ".repeat(Math.max(0, NAME_W - n.length));
    const qtyStr = String(qty);
    const qtyPad = " ".repeat(Math.max(0, QTY_W - qtyStr.length));
    // "đ" in 2 đơn vị trên máy in → trừ thêm 1 khi tính padding
    const priceVisual = price.length + (price.endsWith("đ") ? 1 : 0);
    const pricePad = " ".repeat(Math.max(0, PRICE_W - priceVisual));

    return `${n}${namePad}${qtyPad}${qtyStr}${pricePad}${price}`;
  }

  /**
   * Format dòng thuộc tính: "   + {Tên}" + SL + Giá
   * VNPAY POS render Unicode 1-width → dùng .length.
   */
  private formatAttrRow(attrName: string, qty: number, price: string): string {
    const PREFIX = "   + ";
    const NAME_W = 11; // 16 - 5 (prefix)
    const QTY_W = 3;
    const PRICE_W = 13;

    let n = attrName;
    if (n.length > NAME_W) {
      n = n.slice(0, NAME_W - 2) + "..";
    }
    const namePad = " ".repeat(Math.max(0, NAME_W - n.length));
    const qtyStr = String(qty);
    const qtyPad = " ".repeat(Math.max(0, QTY_W - qtyStr.length));
    const pricePad = " ".repeat(Math.max(0, PRICE_W - price.length));

    return `${PREFIX}${n}${namePad}${qtyPad}${qtyStr}${pricePad}${price}`;
  }

  async print(data: PrintData): Promise<boolean> {
    try {
      if (Platform.OS !== "android") {
        Toast.show({
          type: "info",
          text1: "Tính năng in chỉ hỗ trợ trên thiết bị Android",
        });
        return false;
      }

      if (!SunmiPrinter) {
        Toast.show({
          type: "error",
          text1: "Không tìm thấy máy in",
          text2: "Vui lòng kiểm tra phần cứng POS",
          position: "bottom",
        });
        return false;
      }

      console.log("🖨️ [PrinterService] Bắt đầu in hóa đơn...");

      const SEP = "--------------------------------\n"; // 32 dashes
      const SEP2 = "================================\n"; // 32 equals

      // ══ HEADER ════════════════════════════════════════════════
      SunmiPrinter.setAlignment(1); // Căn giữa

      // Logo (nếu lỗi thì bỏ qua, không ảnh hưởng phần còn lại)
      try {
        if (LOGO_CHIPS_BASE64) {
          SunmiPrinter.printBitmap(LOGO_CHIPS_BASE64, 120, 120);
          SunmiPrinter.printerText("\n");
        }
      } catch (e) {
        console.warn("⚠️ Logo printing failed:", e);
      }

      SunmiPrinter.setFontSize(28);
      SunmiPrinter.setFontWeight(true);
      SunmiPrinter.printerText("CHIPS BILL\n");
      SunmiPrinter.setFontWeight(false);
      SunmiPrinter.setFontSize(20);
      SunmiPrinter.printerText("207C Nguyễn Xí, P.Bình Thạnh\n");
      SunmiPrinter.printerText("TP. Hồ Chí Minh\n");
      SunmiPrinter.printerText("Hotline: 0966 966 247\n");
      SunmiPrinter.setFontSize(24);
      SunmiPrinter.printerText(SEP2);
      SunmiPrinter.setFontWeight(true);
      SunmiPrinter.printerText("HÓA ĐƠN BÁN HÀNG\n");
      SunmiPrinter.setFontWeight(false);
      SunmiPrinter.printerText(SEP2);

      // ══ THÔNG TIN ĐƠN HÀNG ════════════════════════════════════
      SunmiPrinter.setAlignment(0); // Căn trái
      SunmiPrinter.printerText(`Mã đơn: ${data.id || "N/A"}\n`);
      SunmiPrinter.printerText(`Ngày:   ${data.createdAt || ""}\n`);
      SunmiPrinter.printerText(
        `Khách:  ${data.customerName || "Khách vãng lai"}\n`,
      );
      SunmiPrinter.printerText(SEP);

      // ══ BẢNG MÓN ══════════════════════════════════════════════
      SunmiPrinter.setAlignment(0);
      SunmiPrinter.setFontWeight(true);
      // Header căn đúng cột [16, 3, 13] = 32 ký tự
      // "Tên món"(7) + 9sp = 16 | " SL"(3) | "   Thành tiền"(13)
      SunmiPrinter.printerText("Tên món          SL      T.Tiền\n");
      SunmiPrinter.setFontWeight(false);
      SunmiPrinter.printerText(SEP);

      data.items.forEach((item: any) => {
        const name = String(item.name || item.productName || "Món");
        const qty = parseInt(String(item.quantity || item.qty || 1));
        const unitPrice = Math.round(
          parseFloat(String(item.price || item.unitPrice || 0)),
        );
        const lineTotal = this.vnd(unitPrice * qty);

        // 1 dòng duy nhất: tên cắt bớt nếu dài, SL và giá luôn cùng hàng
        SunmiPrinter.printerText(
          this.formatItemRow(name, qty, lineTotal) + "\n",
        );
      });

      // ══ TỔNG CỘNG ══════════════════════════════════════════════
      SunmiPrinter.printerText(SEP);
      // Dùng this.row() để tính đúng độ rộng tiếng Việt
      SunmiPrinter.printerText(
        this.row("Tạm tính:", this.vnd(data.totalPrice)) + "\n",
      );
      SunmiPrinter.printerText(this.row("Khuyến mãi:", "0đ") + "\n");
      SunmiPrinter.printerText(SEP2);
      SunmiPrinter.setFontWeight(true);
      SunmiPrinter.printerText(
        this.row("TỔNG CỘNG:", this.vnd(data.totalPrice)) + "\n",
      );
      SunmiPrinter.setFontWeight(false);
      SunmiPrinter.printerText(SEP2);

      // ══ MÃ QR ══════════════════════════════════════════════════
      SunmiPrinter.printerText("\n");
      SunmiPrinter.setAlignment(1);
      SunmiPrinter.printQRCode(
        `https://bill.chips.vn/pay/${data.id || "draft"}?method=vnpay`,
        4,
        2,
      );
      SunmiPrinter.printerText("\n");

      // ══ FOOTER ════════════════════════════════════════════════
      SunmiPrinter.setAlignment(1);
      SunmiPrinter.setFontWeight(true);
      SunmiPrinter.printerText("Cảm ơn Quý khách! Hẹn gặp lại!\n");
      SunmiPrinter.setFontWeight(false);
      SunmiPrinter.setFontSize(20);
      SunmiPrinter.printerText("Phần mềm được viết bởi Chips Bill POS\n");

      // Đẩy giấy ra
      SunmiPrinter.lineWrap(5);

      Toast.show({
        type: "success",
        text1: "In hóa đơn thành công",
        position: "bottom",
      });
      return true;
    } catch (error) {
      console.error("❌ [PrinterService] Lỗi khi in:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi máy in",
        text2: "Vui lòng kiểm tra kết nối máy in hoặc giấy in",
        position: "bottom",
      });
      return false;
    }
  }
}

export const printerService = new PrinterService();
