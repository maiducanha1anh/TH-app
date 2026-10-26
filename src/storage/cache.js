import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './keys.js';

/**
 * Lấy dữ liệu từ bộ nhớ đệm AsyncStorage
 * @param {string} key - Khóa lưu trữ trong keys.js
 * @returns {Promise<{ data: any, savedAt: number } | null>}
 */
export async function getCache(key) {
  if (!key) return null;
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);

    // Xác thực cấu trúc đối tượng cache
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    // Xác thực savedAt phải là timestamp số hợp lệ > 0
    if (
      typeof parsed.savedAt !== 'number' ||
      !Number.isFinite(parsed.savedAt) ||
      parsed.savedAt <= 0
    ) {
      return null;
    }

    // Xác thực có thuộc tính data và khác null/undefined
    // Chấp nhận mọi giá trị hợp lệ kể cả mảng rỗng [] hoặc đối tượng {}
    if (!('data' in parsed) || parsed.data === undefined || parsed.data === null) {
      return null;
    }

    return {
      data: parsed.data,
      savedAt: parsed.savedAt,
    };
  } catch (error) {
    console.warn(`[storage/cache] Lỗi khi đọc cache key "${key}":`, error);
    return null;
  }
}

/**
 * Lưu dữ liệu vào bộ nhớ đệm AsyncStorage kèm mốc thời gian
 * @param {string} key - Khóa lưu trữ
 * @param {any} data - Dữ liệu cần lưu
 * @returns {Promise<{ data: any, savedAt: number }>}
 */
export async function setCache(key, data) {
  if (!key) throw new Error('Khóa cache không được để trống.');
  const payload = {
    data,
    savedAt: Date.now(),
  };
  try {
    await AsyncStorage.setItem(key, JSON.stringify(payload));
    return payload;
  } catch (error) {
    console.warn(`[storage/cache] Lỗi khi ghi cache key "${key}":`, error);
    throw error;
  }
}

/**
 * Xóa một khóa cache
 * @param {string} key
 */
export async function removeCache(key) {
  if (!key) return;
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.warn(`[storage/cache] Lỗi khi xóa cache key "${key}":`, error);
  }
}

/**
 * Kiểm tra xem cache đã quá thời gian TTL hay chưa
 * @param {number} savedAt - Timestamp lúc lưu cache
 * @param {number} [ttl=300000] - Thời gian sống tính bằng ms (mặc định 5 phút)
 * @returns {boolean}
 */
export function isCacheExpired(savedAt, ttl = 5 * 60 * 1000) {
  if (!savedAt) return true;
  return Date.now() - savedAt > ttl;
}

export default {
  getCache,
  setCache,
  removeCache,
  isCacheExpired,
};
