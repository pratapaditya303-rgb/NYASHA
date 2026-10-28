import firebaseConfig from '../../firebase-applet-config.json';

const PROJECT_ID = firebaseConfig.projectId;
const DATABASE_ID = firebaseConfig.firestoreDatabaseId;
const FIRESTORE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents`;

// Helper: Fetch sync metadata
export const fetchMetadataFromCloud = async () => {
  const metadataRefUrl = `${FIRESTORE_URL}/settings/sync_metadata`;
  const response = await fetch(metadataRefUrl, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (!response.ok) return { lastUpdatedAt: 0, lastUpdatedCollection: '' };
  
  const data = await response.json();
  return {
    lastUpdatedAt: parseInt(data.fields.lastUpdatedAt.integerValue) || 0,
    lastUpdatedCollection: data.fields.lastUpdatedCollection.stringValue
  };
};

// Helper: Pull all from Cloud
export const pullAllFromCloud = async () => {
    // NOTE: This implementation assumes data fetching logic is handled 
    // or needs to be specific to the collections. 
    // This is a simplified placeholder.
    console.log("Pulling all from cloud...");
    
    // Example: await fetchCollection('advocates');
    
    localStorage.setItem('sahayogi_last_sync_time', Date.now().toString());
    window.dispatchEvent(new Event('sahayogi_storage_updated'));
};

// Central sync metadata timestamp update
export const touchSyncMetadata = async (collectionName: string) => {
  const metadataRefUrl = `${FIRESTORE_URL}/settings/sync_metadata`;
  const payload = {
    fields: {
      lastUpdatedAt: { integerValue: Date.now().toString() },
      lastUpdatedCollection: { stringValue: collectionName }
    }
  };
  
  await fetch(`${metadataRefUrl}?updateMask.fieldPaths=lastUpdatedAt&updateMask.fieldPaths=lastUpdatedCollection`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
};

export const checkSmartSync = async (): Promise<boolean> => {
  const metadata = await fetchMetadataFromCloud();
  const localSyncTime = parseInt(localStorage.getItem('sahayogi_last_sync_time') || '0');

  if (metadata.lastUpdatedAt > localSyncTime) {
    await pullAllFromCloud();
    return true; 
  }
  return false;
}
