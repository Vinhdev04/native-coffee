const fs = require("fs");
const path = require("path");

const logoPath = path.join(__dirname, "src/public/CHIPS-logo.png");
const outPath = path.join(__dirname, "src/constants/logoBase64.ts");

try {
  const base64 = fs.readFileSync(logoPath, "base64");

  // Tạo thư mục nếu chưa có
  const dir = path.dirname(outPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const content = `export const LOGO_BASE64 = '${base64}';\n`;
  fs.writeFileSync(outPath, content, "utf8");
  console.log("✅ Đã tạo file src/constants/logoBase64.ts thành công!");
} catch (e) {
  console.error("❌ Lỗi:", e.message);
}
