import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './keys.js';

// Chuỗi promise đảm bảo tuần tự hóa các thao tác đọc/ghi hàng đợi (tránh race condition)
let queueLock = Promise.resolve();

function withQueueLock(fn) {
  const next = queueLock.then(() => fn()).catch(err => {
    console.warn('[storage/outbox] Lỗi trong thao tác hàng đợi:', err);
    throw err;
  });
  queueLock = next.catch(() => {});
  return next;
}

/**
 * Đọc toàn bộ các hành động đang chờ trong hàng đợi (FIFO)
 * @returns {Promise<Array<{ id: string | number, method: string, url: string, body: any, createdAt: number }>>}
 */
export async function getAll() {
  return withQueueLock(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.OUTBOX_QUEUE);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return [];
    } catch (err) {
      console.warn('[storage/outbox] Lỗi đọc danh sách outbox:', err);
      return [];
    }
  });
}

/**
 * Thêm một hành động vào cuối hàng đợi (Enqueue)
 * @param {object} action
 * @param {string | number} [action.id] - Định danh duy nhất của action
 * @param {'POST' | 'PUT' | 'PATCH' | 'DELETE'} action.method - Phương thức HTTP
 * @param {string} action.url - Đường dẫn endpoint (ví dụ: '/assignments/1')
 * @param {any} action.body - Dữ liệu payload
 * @param {number} [action.createdAt] - Thời điểm tạo thao tác
 * @param {string} [action.type] - Loại hành động nghiệp vụ (tiện ích mở rộng)
 * @returns {Promise<object>} Action đã được thêm
 */
export async function enqueue(action) {
  if (!action || !action.method || !action.url) {
    throw new Error('Action không hợp lệ: phải có method và url.');
  }

  return withQueueLock(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.OUTBOX_QUEUE);
      const list = raw ? JSON.parse(raw) : [];

      const newAction = {
        id: action.id || `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        method: action.method.toUpperCase(),
        url: action.url,
        body: action.body || null,
        createdAt: action.createdAt || Date.now(),
        type: action.type || 'CUSTOM',
      };

      list.push(newAction);
      await AsyncStorage.setItem(STORAGE_KEYS.OUTBOX_QUEUE, JSON.stringify(list));
      return newAction;
    } catch (err) {
      console.warn('[storage/outbox] Lỗi thêm action vào outbox:', err);
      throw err;
    }
  });
}

/**
 * Xóa một hành động khỏi hàng đợi theo ID sau khi gửi thành công
 * @param {string | number} id - ID của action cần xóa
 * @returns {Promise<boolean>}
 */
export async function remove(id) {
  if (!id) return false;

  return withQueueLock(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.OUTBOX_QUEUE);
      if (!raw) return true;
      const list = JSON.parse(raw);
      const filtered = list.filter(item => String(item.id) !== String(id));
      await AsyncStorage.setItem(STORAGE_KEYS.OUTBOX_QUEUE, JSON.stringify(filtered));
      return true;
    } catch (err) {
      console.warn(`[storage/outbox] Lỗi xóa action "${id}" khỏi outbox:`, err);
      return false;
    }
  });
}

/**
 * Cập nhật ID tạm sang ID thật của server cho các action còn lại trong hàng đợi
 * (Ví dụ: tạo bài tập offline với id temp-xxx, sau đó đổi trạng thái bài đó khi chưa online)
 * @param {string | number} tempId - ID tạm thời
 * @param {string | number} realId - ID thật được server sinh ra
 */
export async function replaceTempId(tempId, realId) {
  if (!tempId || !realId) return;

  return withQueueLock(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.OUTBOX_QUEUE);
      if (!raw) return;
      const list = JSON.parse(raw);
      let changed = false;

      const updated = list.map(item => {
        let itemChanged = false;
        let newUrl = item.url;
        let newBody = item.body;

        // Thay URL nếu url chứa tempId
        if (newUrl.includes(String(tempId))) {
          newUrl = newUrl.replace(String(tempId), String(realId));
          itemChanged = true;
        }

        // Thay trong body nếu body có id = tempId
        if (newBody && typeof newBody === 'object') {
          if (String(newBody.id) === String(tempId)) {
            newBody = { ...newBody, id: realId };
            itemChanged = true;
          }
        }

        if (itemChanged) {
          changed = true;
          return { ...item, url: newUrl, body: newBody };
        }
        return item;
      });

      if (changed) {
        await AsyncStorage.setItem(STORAGE_KEYS.OUTBOX_QUEUE, JSON.stringify(updated));
      }
    } catch (err) {
      console.warn('[storage/outbox] Lỗi thay thế tempId trong outbox:', err);
    }
  });
}

/**
 * Xóa sạch toàn bộ hàng đợi
 */
export async function clearOutbox() {
  return withQueueLock(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.OUTBOX_QUEUE);
      return true;
    } catch (err) {
      return false;
    }
  });
}

export default {
  getAll,
  enqueue,
  remove,
  replaceTempId,
  clearOutbox,
};
