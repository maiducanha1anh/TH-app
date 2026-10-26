import { useState, useEffect, useCallback, useRef } from 'react';
import { getCache, setCache } from '../storage/cache.js';
import { useNetworkStatus } from './useNetworkStatus.js';

/**
 * Hook truy vấn dữ liệu theo chiến lược "Cache trước, Mạng sau" (Stale-While-Revalidate)
 * Tuân thủ đúng hợp đồng mục 5.6: trả về { data, loading, error, refreshing, lastUpdated, refresh }
 *
 * @param {string} key - Khóa cache lưu trữ trong AsyncStorage (storage/keys.js)
 * @param {() => Promise<any>} fetcher - Hàm async gọi API lấy dữ liệu mới nhất
 * @returns {{
 *   data: any,
 *   loading: boolean,
 *   error: string | null,
 *   refreshing: boolean,
 *   lastUpdated: number | null,
 *   refresh: () => Promise<void>
 * }}
 */
export function useCachedQuery(key, fetcher) {
  const { isOnline, isDetermined } = useNetworkStatus();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Dùng ref để theo dõi dữ liệu hiện thời mà không gây re-render vòng lặp
  const currentDataRef = useRef(null);
  currentDataRef.current = data;

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  /**
   * Thực hiện chiến lược: Đọc cache trước -> Gọi API sau
   */
  const executeQuery = useCallback(async () => {
    if (!key) {
      setLoading(false);
      return;
    }

    let hasCachedData = false;

    // BƯỚC 1: Luôn đọc cache từ bộ nhớ đệm trước (Cache First)
    try {
      const cached = await getCache(key);
      if (cached && cached.data !== undefined && cached.data !== null) {
        hasCachedData = true;
        setData(cached.data);
        setLastUpdated(cached.savedAt);
        // Đã có dữ liệu cache, tắt trạng thái chờ loading để người dùng thấy ngay
        setLoading(false);
      }
    } catch (cacheErr) {
      console.warn(`[useCachedQuery] Lỗi đọc cache key "${key}":`, cacheErr);
    }

    // Nếu chưa từng có cache, bật loading trong lúc chờ mạng
    if (!hasCachedData) {
      setLoading(true);
    }

    // Nếu NetInfo chưa xác định xong trạng thái mạng ban đầu, chưa kích hoạt gọi API
    if (!isDetermined) {
      return;
    }

    // BƯỚC 2: Chỉ gọi API khi NetInfo đã xác định và thiết bị thực sự Online
    if (isOnline) {
      try {
        if (typeof fetcherRef.current === 'function') {
          const freshData = await fetcherRef.current();
          // Lưu cache mới vào storage
          await setCache(key, freshData);
          setData(freshData);
          setLastUpdated(Date.now());
          setError(null);
        }
      } catch (apiErr) {
        // Phân biệt: Nếu ĐÃ CÓ cache thì giữ dữ liệu và thông báo nhẹ, không xóa data
        if (hasCachedData || currentDataRef.current !== null) {
          setError(apiErr?.message || 'Không thể đồng bộ dữ liệu mới nhất từ máy chủ.');
        } else {
          // Chưa có cache và API lỗi -> báo lỗi không có dữ liệu
          setError(apiErr?.message || 'Không thể tải dữ liệu.');
        }
      } finally {
        setLoading(false);
      }
    } else {
      // Mất kết nối mạng (Offline)
      if (!hasCachedData && currentDataRef.current === null) {
        setError('Bạn đang offline và chưa có dữ liệu lưu tạm cho mục này.');
      } else {
        // Đã có cache: Cache hết TTL vẫn được dùng bình thường khi offline theo yêu cầu đề
        setError(null);
      }
      setLoading(false);
    }
  }, [key, isOnline, isDetermined]);

  useEffect(() => {
    executeQuery();
  }, [executeQuery]);

  /**
   * Kéo để làm mới (Pull-to-refresh)
   */
  const refresh = useCallback(async () => {
    if (!key || typeof fetcherRef.current !== 'function') return;

    setRefreshing(true);
    try {
      const freshData = await fetcherRef.current();
      await setCache(key, freshData);
      setData(freshData);
      setLastUpdated(Date.now());
      setError(null);
    } catch (apiErr) {
      setError(apiErr?.message || 'Lỗi khi làm mới dữ liệu.');
    } finally {
      setRefreshing(false);
    }
  }, [key]);

  return {
    data,
    loading,
    error,
    refreshing,
    lastUpdated,
    refresh,
  };
}

export default useCachedQuery;
