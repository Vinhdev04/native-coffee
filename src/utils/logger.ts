// todo: cấu hình ghi log toàn cục và ghi đè các hàm console mặc định
const originalLog = console.log;
const originalWarn = console.warn;
const originalError = console.error;

// TODO: Tạo hàm định dạng các bản in của console thành các khối logic trực quan
const formatLog = (prefix: string, symbol: string, ...args: any[]) => {
  const firstArg = args[0];
  let tag = "LOG";
  let contentArgs = args;

  if (typeof firstArg === "string") {
    // todo: kiểm tra xem chuỗi có chứa tiền tố nhãn dạng [Socket] hoặc biểu tượng như 📡 không
    const match = firstArg.match(/^([^a-zA-Z0-9]*\[[^\]]+\]|[^a-zA-Z0-9\s]+)\s*(.*)/);
    if (match) {
      tag = match[1].trim();
      const rest = match[2].trim();
      contentArgs = rest ? [rest, ...args.slice(1)] : args.slice(1);
    }
  }

  originalLog(`\n${symbol} ─── [${prefix}: ${tag}] ──────────────────────────────`);
  contentArgs.forEach((arg) => {
    if (arg && typeof arg === "object") {
      try {
        originalLog(JSON.stringify(arg, null, 2));
      } catch {
        originalLog(arg);
      }
    } else {
      originalLog(`  ${arg}`);
    }
  });
  originalLog(`───────────────────────────────────────────────────────\n`);
};

// TODO: Ghi đè hàm console.log toàn cục
console.log = (...args) => formatLog("INFO", "ℹ️", ...args);

// TODO: Ghi đè hàm console.warn toàn cục
console.warn = (...args) => formatLog("WARN", "⚠️", ...args);

// TODO: Ghi đè hàm console.error toàn cục
console.error = (...args) => formatLog("ERROR", "❌", ...args);
