import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { getAll, remove, replaceTempId } from '../storage/outbox.js';
import { useNetworkStatus } from './useNetworkStatus.js';
import { request } from '../api/client.js';

/**
 * Hook tự động đồng bộ hàng đợi Outbox khi có mạng trở lại
 * Tuân thủ đúng hợp đồng mục 5.6: trả về { pendingCount, syncing, syncNow }
 *
 * @param {object} [options]
 * @param {() => Promise<void>} [options.onSyncSuccess] - Callback kích hoạt làm mới sau khi đồng bộ
 * @returns {{ pendingCount: number, syncing: boolean, syncNow: () => Promise<number> }}
 */
export function useOutboxSync(options = {}) {
  const { isOnline, isDetermined } = useNetworkStatus();
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  // Ref chống đồng bộ chạy trùng (Lock)
  const isSyncingRef = useRef(false);
  const onSyncSuccessRef = useRef(options?.onSyncSuccess);
  onSyncSuccessRef.current = options?.onSyncSuccess;

  /**
   * Cập nhật số lượng thao tác đang chờ trong outbox
   */
  const updatePendingCount = useCallback(async () => {
    try {
      const queue = await getAll();
      setPendingCount(queue.length);
      return queue.length;
    } catch {
      return 0;
    }
  }, []);

  // Đọc số lượng thao tác khi khởi tạo
  useEffect(() => {
    updatePendingCount();
  }, [updatePendingCount]);

  /**
   * Thực hiện đồng bộ toàn bộ hàng đợi outbox tuần tự (FIFO)
   */
  const syncNow = useCallback(async () => {
    if (isSyncingRef.current) {
      return 0; // Đang có tiến trình đồng bộ khác chạy
    }

    const queue = await getAll();
    if (queue.length === 0) {
      setPendingCount(0);
      return 0;
    }

    isSyncingRef.current = true;
    setSyncing(true);

    let syncedCount = 0;
    let conflictCount = 0;

    try {
      // Gửi tuần tự theo đúng thứ tự hàng đợi
      for (const action of queue) {
        try {
          // BƯỚC 1: Xử lý xung đột theo quy tắc B5 đối với thao tác cập nhật (PATCH/PUT)
          if ((action.method === 'PATCH' || action.method === 'PUT') && action.body?.updatedAt) {
            try {
              // Lấy dữ liệu mới nhất trên server để đối chiếu mốc thời gian
              const serverRecord = await request('GET', action.url);
              const serverTime = serverRecord?.updatedAt ? new Date(serverRecord.updatedAt).getTime() : 0;
              const localTime = new Date(action.body.updatedAt).getTime();

              // Nếu server mới hơn: Ưu tiên dữ liệu server, hủy thao tác cục bộ
              if (serverTime > localTime) {
                console.log(`[useOutboxSync] Xung đột: Server (${serverRecord.updatedAt}) mới hơn Local (${action.body.updatedAt}). Bỏ qua action ${action.id}`);
                await remove(action.id);
                conflictCount++;
                continue;
              }
            } catch (checkErr) {
              // Nếu kiểm tra lỗi 404 (bản ghi không còn trên server): xóa action
              if (checkErr?.status === 404) {
                await remove(action.id);
                continue;
              }
            }
          }

          // BƯỚC 2: Gửi request lên máy chủ
          // Lưu ý: Nếu là POST tạo bài tập có ID tạm, cần loại bỏ ID tạm khỏi payload gửi lên server
          let sendBody = action.body;
          if (action.method === 'POST' && sendBody && typeof sendBody === 'object') {
            const { id: _ignoreId, ...rest } = sendBody;
            sendBody = rest;
          }

          const response = await request(action.method, action.url, sendBody);

          // BƯỚC 3: Nếu là tạo bài tập mới, thay thế ID tạm sang ID thật cho các action sau
          if (action.method === 'POST' && action.body?.id && response?.id) {
            const tempId = action.body.id;
            const realId = response.id;
            await replaceTempId(tempId, realId);

            // Cập nhật ngay các action còn lại trong danh sách in-memory queue
            for (let i = 0; i < queue.length; i++) {
              if (queue[i].url && queue[i].url.includes(String(tempId))) {
                queue[i].url = queue[i].url.replace(String(tempId), String(realId));
              }
              if (queue[i].body && typeof queue[i].body === 'object') {
                if (String(queue[i].body.id) === String(tempId)) {
                  queue[i].body = { ...queue[i].body, id: realId };
                }
              }
            }
          }

          // BƯỚC 4: Gửi thành công -> Xóa khỏi hàng đợi outbox
          await remove(action.id);
          syncedCount++;
        } catch (actionErr) {
          console.warn(`[useOutboxSync] Lỗi khi đồng bộ action ${action.id}:`, actionErr.message);
          // Nếu là lỗi 4xx (ngoại trừ 408 timeout): Thao tác không hợp lệ, xóa khỏi hàng đợi
          if (actionErr?.status >= 400 && actionErr?.status < 500 && actionErr?.status !== 408) {
            await remove(action.id);
          } else {
            // Lỗi mạng hoặc 5xx: Giữ lại trong hàng đợi để thử lại lần sau và dừng vòng lặp
            break;
          }
        }
      }
    } finally {
      isSyncingRef.current = false;
      setSyncing(false);
      const remaining = await updatePendingCount();

      // Nếu có ít nhất 1 thay đổi được đồng bộ hoặc có xung đột
      if (syncedCount > 0 || conflictCount > 0) {
        if (typeof onSyncSuccessRef.current === 'function') {
          try {
            await onSyncSuccessRef.current();
          } catch (e) {
            console.warn('[useOutboxSync] Lỗi callback onSyncSuccess:', e);
          }
        }

        // B5: Thông báo kết quả đồng bộ cho người dùng
        if (conflictCount > 0 && syncedCount > 0) {
          Alert.alert(
            'Đồng bộ hoàn tất',
            `Đã đồng bộ thành công ${syncedCount} thay đổi.\nCó ${conflictCount} thay đổi bị xung đột đã được ưu tiên giữ theo máy chủ.`
          );
        } else if (conflictCount > 0) {
          Alert.alert(
            'Xung đột dữ liệu',
            `Có ${conflictCount} thay đổi ngoại tuyến cũ hơn dữ liệu trên máy chủ. Ứng dụng đã tự động ưu tiên cập nhật theo máy chủ.`
          );
        } else if (syncedCount > 0) {
          Alert.alert('Đồng bộ thành công', `Đã đồng bộ ${syncedCount} thay đổi lên máy chủ.`);
        }
      }
    }

    return syncedCount;
  }, [updatePendingCount]);

  // B4: Tự động kích hoạt đồng bộ khi isOnline chuyển sang true
  const prevOnlineRef = useRef(isOnline);
  useEffect(() => {
    if (isDetermined && isOnline && !prevOnlineRef.current) {
      // Vừa chuyển từ Offline sang Online -> Tự động kích hoạt đồng bộ
      syncNow();
    }
    if (isDetermined) {
      prevOnlineRef.current = isOnline;
    }
  }, [isOnline, isDetermined, syncNow]);

  return {
    pendingCount,
    syncing,
    syncNow,
    updatePendingCount,
  };
}

export default useOutboxSync;
