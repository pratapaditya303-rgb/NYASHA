import { useState, useEffect, useCallback } from 'react';
import {
  getLocalData,
  pushEntity,
  deleteEntity,
  pullCollection,
  SYNC_EVENTS
} from '../services/RealtimeSyncEngine';

/**
 * useRealtimeCollection: Single-line hook for real-time synced collections
 * @param collectionName e.g., 'broadcasts', 'notices', 'causelist', 'emergency'
 */
export function useRealtimeCollection<T extends { id: string }>(collectionName: string) {
  const [data, setData] = useState<T[]>(() => getLocalData<T>(collectionName));
  const [loading, setLoading] = useState(false);

  // Sync on local or cloud updates
  useEffect(() => {
    setData(getLocalData<T>(collectionName));

    const handleUpdate = (e: any) => {
      if (e.detail?.collection === collectionName) {
        setData(e.detail.data || []);
      }
    };

    window.addEventListener(SYNC_EVENTS.DATA_UPDATED, handleUpdate);
    return () => window.removeEventListener(SYNC_EVENTS.DATA_UPDATED, handleUpdate);
  }, [collectionName]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const fresh = await pullCollection<T>(collectionName);
      setData(fresh);
    } finally {
      setLoading(false);
    }
  }, [collectionName]);

  const addOrUpdate = useCallback(
    async (item: T) => {
      return await pushEntity<T>(collectionName, item);
    },
    [collectionName]
  );

  const remove = useCallback(
    async (id: string) => {
      return await deleteEntity(collectionName, id);
    },
    [collectionName]
  );

  return {
    data,
    loading,
    refresh,
    addOrUpdate,
    remove
  };
}
