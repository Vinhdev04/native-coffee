/**
 * @file SocketClient.ts
 * @desc WebSocket client singleton (Socket.IO) — khởi tạo kết nối,
 *       gắn auth token, xử lý lỗi authen và tự động gọi logout callback.
 * @layer socket
 */

import { io, Socket } from 'socket.io-client';
import Toast from 'react-native-toast-message';

class SocketClient {
  private socket: Socket | null = null;
  private url: string = '';
  private onAuthErrorCallback: (() => void) | null = null;

  private AUTH_ERROR_CODES = ['AUTHEN000', 'AUTHEN001', 'AUTHEN002', 'AUTHEN003'];

  initialize(url: string, token?: string | null) {
    this.url = url;

    if (this.socket) {
      console.log('[Socket đang khởi tạo lại] với token mới');
      this.socket.disconnect();
      this.socket = null;
    }

    this.socket = io(this.url, {
      transports: ['websocket'],
      autoConnect: true,
      auth: {
        token: token ? `Bearer ${token}` : undefined,
      },
    });

    this.socket.on('connect', () => {
      console.log('[Socket đã kết nối]:', this.url);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[Socket đã ngắt kết nối]:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('[Lỗi kết nối Socket]:', error);
    });

    this.socket.on('exception', (data: any) => {
      console.error('[Ngoại lệ Socket]:', data);
      this.handleError(data);
    });

    return this.socket;
  }

  private handleError(data: any) {
    const errorCode = data?.error_code;
    const errorMsg = data?.error_cont || data?.message || 'Lỗi hệ thống';

    if (this.AUTH_ERROR_CODES.includes(errorCode)) {
      console.warn('[Lỗi xác thực] Đang đăng xuất do:', errorCode);
      Toast.show({
        type: 'error',
        text1: 'Phiên đăng nhập hết hạn',
        text2: 'Vui lòng đăng nhập lại.',
        position: 'bottom',
      });
      if (this.onAuthErrorCallback) {
        this.onAuthErrorCallback();
      }
      return true;
    }

    Toast.show({
      type: 'error',
      text1: 'Lỗi hệ thống',
      text2: errorMsg,
      position: 'bottom',
    });
    return false;
  }

  setOnAuthError(callback: () => void) {
    this.onAuthErrorCallback = callback;
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  async emit(event: string, data: any): Promise<any> {
    if (this.socket && !this.socket.connected) {
      console.log(`[Socket đang đợi] sự kiện ${event}...`);
      let waitCount = 0;
      while (!this.socket.connected && waitCount < 50) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        waitCount++;
      }
    }

    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        console.log(`[Socket gửi dữ liệu] ${event}:`, data);

        const timeout = setTimeout(() => {
          console.warn(`[Socket hết hạn] sự kiện ${event} mất quá nhiều thời gian!`);
          reject(new Error('Socket timeout'));
        }, 10000);

        this.socket.emit(event, data, (response: any) => {
          clearTimeout(timeout);
          console.log(`[Socket nhận phản hồi] ${event}:`, response);

          if (response && response.res_code !== 0) {
            const isAuthError = this.handleError(response);
            if (isAuthError) {
              reject(new Error('Unauthorized'));
            } else {
              resolve(response);
            }
          } else {
            resolve(response);
          }
        });
      } else {
        console.warn(`[Gửi dữ liệu Socket thất bại] ${event}: Socket chưa kết nối.`);
        reject(new Error('Socket not connected'));
      }
    });
  }

  on(event: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on(event, (data) => {
        console.log(`[Socket lắng nghe] sự kiện ${event}:`, data);
        callback(data);
      });
    }
  }

  off(event: string) {
    if (this.socket) {
      this.socket.off(event);
    }
  }
}

const socketClient = new SocketClient();
export default socketClient;
