import { useEffect } from 'react';
import { checkSmartSync } from '../utils/firebaseSync';

export const useSyncManager = () => {
  useEffect(() => {
    const sync = async () => {
      const synced = await checkSmartSync();
      if (synced) {
        console.log("Smart Sync: Data updated from cloud.");
      }
    };

    sync();

    const handleStorageUpdate = () => {
      // Logic to trigger UI update (if not already handled by components)
      console.log("Storage updated event received");
    };

    window.addEventListener('sahayogi_storage_updated', handleStorageUpdate);

    return () => {
      window.removeEventListener('sahayogi_storage_updated', handleStorageUpdate);
    };
  }, []);
};
