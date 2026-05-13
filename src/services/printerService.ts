import { Platform, NativeModules } from "react-native";
import Toast from "react-native-toast-message";

// Lấy module Native trực tiếp để tránh lỗi Host Object trên RN mới
const SunmiPrinter = NativeModules.SunmiPrinter;

/**
 * @file printerService.ts
 * @desc Xử lý kết nối và in ấn trên máy VNPAY/Sunmi POS.
 */

export interface PrintData {
  id?: string | number;
  items: any[];
  totalPrice: number;
  customerName?: string;
  createdAt?: string;
}

class PrinterService {
  /**
   * Thực hiện in hóa đơn thực tế qua Sunmi Printer SDK
   * @param data Dữ liệu hóa đơn
   */
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
        console.error("❌ [PrinterService] SunmiPrinter module not found");
        Toast.show({
          type: "error",
          text1: "Không tìm thấy máy in",
          text2: "Vui lòng kiểm tra lại phần cứng POS hoặc driver",
          position: "bottom",
        });
        return false;
      }

      console.log("🖨️ [PrinterService] Starting Sunmi Print...");

      // 1. Kiểm tra trạng thái máy in (Nếu thư viện hỗ trợ)
      // const status = await SunmiPrinter.getPrinterStatus();
      // if (status !== 'NORMAL') { ... }

      // 2. Bắt đầu in
      // Header
      SunmiPrinter.setAlignment(1); // Center
      SunmiPrinter.setFontSize(32);
      SunmiPrinter.printerText("CHIPS BILL\n");
      SunmiPrinter.setFontSize(20);
      SunmiPrinter.printerText("Hotline: 0966966247\n");
      SunmiPrinter.setFontSize(24);
      SunmiPrinter.printerText("--------------------------------\n");

      /* 
      // QR Code (Tạm thời ẩn theo yêu cầu)
      SunmiPrinter.setAlignment(1);
      SunmiPrinter.printQRCode(`https://bill.chips.vn/pay/${data.id || 'draft'}`, 8, 2);
      SunmiPrinter.printerText('\n');
      */

      // Order Info
      const now = new Date();
      const currentDateTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} - ${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
      
      const displayId = data.id && !String(data.id).includes('DRAFT') ? data.id : 'DRAFT';

      SunmiPrinter.setAlignment(0); // Left
      SunmiPrinter.printerText(`Mã đơn: ${displayId}\n`);
      SunmiPrinter.printerText(`Ngày in: ${currentDateTime}\n`);
      SunmiPrinter.printerText(
        `Khách: ${data.customerName || "Khách vãng lai"}\n`,
      );
      SunmiPrinter.printerText("--------------------------------\n");

      // Items Table
      SunmiPrinter.setFontWeight(true);
      SunmiPrinter.printColumnsText(
        ["Tên món", "SL", "T.Tiền"],
        [18, 4, 10],
        [0, 1, 2],
      );
      SunmiPrinter.setFontWeight(false);

      data.items.forEach((item: any) => {
        const name = item.name || item.productName || "Món";
        const qty = parseInt(String(item.quantity || item.qty || 1));
        const unitPrice = parseFloat(String(item.price || item.unitPrice || 0));
        const lineTotal = (unitPrice * qty).toLocaleString("vi-VN");

        SunmiPrinter.printColumnsText(
          [name, String(qty), lineTotal],
          [18, 4, 10],
          [0, 1, 2],
        );

        // In options nếu có
        if (item.selectedAttributes && item.selectedAttributes.length > 0) {
          const optStr = item.selectedAttributes
            .map((a: any) => a.name)
            .join(", ");
          SunmiPrinter.printerText(` (${optStr})\n`);
        }
      });

      SunmiPrinter.printerText("--------------------------------\n");

      // Total
      SunmiPrinter.setAlignment(2); // Right
      SunmiPrinter.setFontSize(28);
      SunmiPrinter.setFontWeight(true);
      SunmiPrinter.printerText(
        `TỔNG CỘNG: ${data.totalPrice.toLocaleString("vi-VN")}đ\n`,
      );
      SunmiPrinter.setFontWeight(false);
      SunmiPrinter.setFontSize(24);

      // Footer
      SunmiPrinter.setAlignment(1); // Center
      SunmiPrinter.printerText("\nCảm ơn Quý khách!\n");
      SunmiPrinter.printerText("Hẹn gặp lại!\n\n");
      SunmiPrinter.printerText("\nPhần mềm được tạo bởi Chips Bill POS\n");

      // Cắt giấy / Đẩy giấy
      SunmiPrinter.lineWrap(3);

      Toast.show({
        type: "success",
        text1: "In hóa đơn thành công",
        position: "bottom",
      });

      return true;
    } catch (error) {
      console.error("❌ [PrinterService] Sunmi Print error:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi máy in Sunmi",
        text2: "Vui lòng kiểm tra kết nối máy in hoặc giấy in",
        position: "bottom",
      });
      return false;
    }
  }
}

export const printerService = new PrinterService();
