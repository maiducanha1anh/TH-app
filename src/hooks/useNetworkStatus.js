import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

/**
 * Kiểm tra trạng thái mạng thực tế tại một thời điểm (dùng cho các luồng async độc lập)
 * Không phụ thuộc vào state của React component hay giá trị mặc định lúc khởi tạo
 * @returns {Promise<boolean>}
 */
export async function checkOnlineStatus() {
  try {
    const state = await NetInfo.fetch();
    const offline = state.isConnected === false || state.isInternetReachable === false;
    return !offline;
  } catch {
    return false;
  }
}

/**
 * Hook theo dõi trạng thái kết nối mạng của thiết bị
 * Tuân thủ hợp đồng đề mục 5.6: trả về { isOnline }
 * Bổ sung { isDetermined } để các luồng gọi API và outbox biết khi nào NetInfo đã thực sự xác định xong.
 *
 * @returns {{ isOnline: boolean, isDetermined: boolean }}
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [isDetermined, setIsDetermined] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Đọc trạng thái mạng ban đầu
    NetInfo.fetch().then(state => {
      if (!mounted) return;
      const offline = state.isConnected === false || state.isInternetReachable === false;
      setIsOnline(!offline);
      setIsDetermined(true);
    });

    // Lắng nghe sự kiện thay đổi mạng từ hệ điều hành
    const unsubscribe = NetInfo.addEventListener(state => {
      if (!mounted) return;
      const offline = state.isConnected === false || state.isInternetReachable === false;
      setIsOnline(!offline);
      setIsDetermined(true);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return { isOnline, isDetermined };
}

export default useNetworkStatus;

