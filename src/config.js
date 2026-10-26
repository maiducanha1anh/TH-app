/**
 * Cấu hình kết nối API & Cache
 * Tuân thủ yêu cầu đề bài mục 2: BASE_URL đặt trong file cấu hình riêng.
 *
 * HƯỚNG DẪN CẤU HÌNH THIẾT BỊ:
 * - 'device': Điện thoại Android thật cắm cáp USB (đã chạy lệnh: adb reverse tcp:3000 tcp:3000)
 *             hoặc máy ảo iOS -> Kết nối tới: 'http://localhost:3000'
 * - 'emulator': Máy ảo Android Emulator (Android Studio) -> Kết nối tới: 'http://10.0.2.2:3000'
 * - 'lan': Điện thoại thật kết nối cùng Wi-Fi với máy tính -> Kết nối tới IP máy tính: 'http://<IP-LAN>:3000'
 */
const SERVER_MODE = 'emulator'; // 'device' | 'emulator' | 'lan'
const LAN_IP = '192.168.1.15'; // Điền IP máy tính nếu chọn SERVER_MODE = 'lan'

let defaultHost = 'http://10.0.2.2:3000';

const isNodeEnvironment =
  typeof process !== 'undefined' &&
  process.versions &&
  process.versions.node &&
  typeof __fbBatchedBridge === 'undefined';

if (isNodeEnvironment) {
  defaultHost = process.env.BASE_URL || 'http://localhost:3000';
} else {
  if (SERVER_MODE === 'device') {
    // Điện thoại Android thật cắm USB qua adb reverse tcp:3000 tcp:3000
    defaultHost = 'http://localhost:3000';
  } else if (SERVER_MODE === 'emulator') {
    // Máy ảo Android Emulator
    defaultHost = 'http://10.0.2.2:3000';
  } else if (SERVER_MODE === 'lan') {
    defaultHost = `http://${LAN_IP}:3000`;
  }
}

export let BASE_URL = process.env.BASE_URL || defaultHost;

export function setBaseUrl(url) {
  BASE_URL = url;
}

// Thời gian chờ tối đa khi gọi API (10 giây theo hợp đồng đề bài mục 5.6)
export const TIMEOUT = 10000;

// Thời gian hết hạn cache (5 phút)
export const CACHE_TTL = 5 * 60 * 1000;

export default {
  BASE_URL,
  setBaseUrl,
  TIMEOUT,
  CACHE_TTL,
};
