import firebaseConfig from '../firebase-applet-config.json';

const FIRESTORE_API_KEY = firebaseConfig.apiKey || 'AIzaSyCF6iHdbCygnQDxzhrQWhEqd9kDx2DQtjQ';
const FIRESTORE_PROJECT = firebaseConfig.projectId || 'gen-lang-client-0118328707';
const FIRESTORE_DB = firebaseConfig.firestoreDatabaseId || 'ai-studio-barassociationba-b253281c-6ea1-4dcf-81b2-fa0bab8786df';
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT}/databases/${FIRESTORE_DB}/documents`;

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const url = `${FIRESTORE_BASE}/settings/vault_advocates?key=${FIRESTORE_API_KEY}`;

    if (req.method === 'GET') {
      const fRes = await fetch(url);
      if (fRes.ok) {
        const doc = await fRes.json();
        const raw = doc?.fields?.data?.stringValue;
        const advocates = raw ? JSON.parse(raw) : [];
        return res.status(200).json({
          status: 'ok',
          version: Date.now(),
          data: {
            _sys_vault_v2_advocates: advocates
          }
        });
      }
      return res.status(200).json({ status: 'ok', data: {} });
    }

    if (req.method === 'POST') {
      const { bulk } = req.body || {};
      const advocates = bulk?._sys_vault_v2_advocates;
      if (Array.isArray(advocates)) {
        await fetch(url, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fields: {
              data: { stringValue: JSON.stringify(advocates) },
              updatedAt: { stringValue: new Date().toISOString() },
              count: { integerValue: String(advocates.length) }
            }
          })
        });
      }
      return res.status(200).json({ status: 'ok', version: Date.now(), data: req.body });
    }

    return res.status(200).json({ status: 'ok' });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Server error' });
  }
}
