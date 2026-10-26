import { BASE_URL, TIMEOUT } from '../config.js';

/**
 * Hàm chung để gọi REST API
 * @param {'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'} method - Phương thức HTTP
 * @param {string} endpoint - Đường dẫn API (ví dụ '/courses')
 * @param {object} [body] - Dữ liệu gửi kèm (cho POST, PATCH, PUT)
 * @param {number} [customTimeout] - Timeout tùy chọn (dùng cho test hoặc custom request)
 * @returns {Promise<any>} Dữ liệu JSON trả về từ server
 * @throws {{ type: 'network' | 'timeout' | 'http', status: number, message: string }}
 */
export async function request(method, endpoint, body = null, customTimeout = TIMEOUT) {
  const fullUrl = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  const controller = new AbortController();
  const timeoutMs = customTimeout || TIMEOUT;
  const timer = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  const options = {
    method: method.toUpperCase(),
    headers,
    signal: controller.signal,
  };

  if (body && ['POST', 'PATCH', 'PUT'].includes(options.method)) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(fullUrl, options);

    if (!response.ok) {
      let errorMessage = `Lỗi máy chủ (${response.status})`;
      try {
        const errorJson = await response.json();
        if (errorJson && errorJson.message) {
          errorMessage = errorJson.message;
        }
      } catch {
        // Giữ thông báo mặc định nếu không parse được json
      }

      clearTimeout(timer);
      const httpError = {
        type: 'http',
        status: response.status,
        message: errorMessage,
      };
      throw httpError;
    }

    if (response.status === 204) {
      clearTimeout(timer);
      return null;
    }

    // Đảm bảo timeout vẫn bao quát cả quá trình nhận và parse response body
    const data = await response.json();
    clearTimeout(timer);
    return data;
  } catch (err) {
    clearTimeout(timer);

    // Nếu lỗi đã là định dạng chuẩn của http
    if (err && err.type === 'http') {
      throw err;
    }

    // Nếu bị timeout do AbortController (cả khi kết nối hoặc khi đang tải body)
    if (err && (err.name === 'AbortError' || err.message?.includes('aborted'))) {
      const timeoutError = {
        type: 'timeout',
        status: 408,
        message: 'Yêu cầu vượt quá thời gian chờ (10 giây).',
      };
      throw timeoutError;
    }

    // Lỗi mạng hoặc server không phản hồi
    const networkError = {
      type: 'network',
      status: 0,
      message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng hoặc server json-server.',
    };
    throw networkError;
  }
}

export default {
  request,
};
