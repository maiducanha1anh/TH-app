import React, { createContext, useContext, useEffect } from 'react';
import { useNetworkStatus } from '../hooks/useNetworkStatus.js';
import { useOutboxSync } from '../hooks/useOutboxSync.js';
import { useAppData } from './AppDataContext.js';

const SyncContext = createContext(null);

export function SyncProvider({ children }) {
  const { isOnline } = useNetworkStatus();
  const { refreshAll } = useAppData();

  const { pendingCount, syncing, syncNow, updatePendingCount } = useOutboxSync({
    onSyncSuccess: async () => {
      // Làm mới toàn bộ dữ liệu ứng dụng sau khi đồng bộ xong
      await refreshAll();
    },
  });

  const value = {
    isOnline,
    pendingCount,
    syncing,
    syncNow,
    updatePendingCount,
  };

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

export function useSync() {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync phải được sử dụng bên trong SyncProvider');
  }
  return context;
}

export default SyncContext;
