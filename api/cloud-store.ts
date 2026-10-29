let firebaseConfig: any = {
  apiKey: "AIzaSyCF6iHdbCygnQDxzhrQWhEqd9kDx2DQtjQ",
  projectId: "gen-lang-client-0118328707",
  firestoreDatabaseId: "ai-studio-barassociationba-b253281c-6ea1-4dcf-81b2-fa0bab8786df"
};

try {
  // Safe runtime reading for Node.js Vercel Serverless Function without ERR_IMPORT_ATTRIBUTE_MISSING
  const fs = require('fs');
  const path = require('path');
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }
} catch {
  // fallback to inline defaults
}

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
    const fetchDoc = async (docName: string) => {
      try {
        const u = `${FIRESTORE_BASE}/settings/${docName}?key=${FIRESTORE_API_KEY}`;
        const f = await fetch(u);
        if (!f.ok) return [];
        const j = await f.json();
        const raw = j?.fields?.data?.stringValue;
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    };

    const saveDoc = async (docName: string, items: any[]) => {
      try {
        const u = `${FIRESTORE_BASE}/settings/${docName}?key=${FIRESTORE_API_KEY}`;
        await fetch(u, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fields: {
              data: { stringValue: JSON.stringify(items) },
              updatedAt: { stringValue: new Date().toISOString() },
              count: { integerValue: String(items.length) }
            }
          })
        });
      } catch {}
    };

    if (req.method === 'GET') {
      const [advocates, earnings, expenses, notifications] = await Promise.all([
        fetchDoc('vault_advocates'),
        fetchDoc('vault_earnings'),
        fetchDoc('vault_expenses'),
        fetchDoc('vault_notifications')
      ]);

      return res.status(200).json({
        status: 'ok',
        version: Date.now(),
        data: {
          _sys_vault_v2_advocates: advocates,
          _sys_vault_v2_earnings: earnings,
          _sys_vault_v2_expenses: expenses,
          _sys_vault_v2_notifications: notifications
        }
      });
    }

    if (req.method === 'POST') {
      const { bulk, key, value } = req.body || {};
      const tasks = [];

      if (bulk && typeof bulk === 'object') {
        if (Array.isArray(bulk._sys_vault_v2_advocates)) tasks.push(saveDoc('vault_advocates', bulk._sys_vault_v2_advocates));
        if (Array.isArray(bulk._sys_vault_v2_earnings)) tasks.push(saveDoc('vault_earnings', bulk._sys_vault_v2_earnings));
        if (Array.isArray(bulk._sys_vault_v2_expenses)) tasks.push(saveDoc('vault_expenses', bulk._sys_vault_v2_expenses));
        if (Array.isArray(bulk._sys_vault_v2_notifications)) tasks.push(saveDoc('vault_notifications', bulk._sys_vault_v2_notifications));
      } else if (key && Array.isArray(value)) {
        if (key === '_sys_vault_v2_advocates') tasks.push(saveDoc('vault_advocates', value));
        if (key === '_sys_vault_v2_earnings') tasks.push(saveDoc('vault_earnings', value));
        if (key === '_sys_vault_v2_expenses') tasks.push(saveDoc('vault_expenses', value));
        if (key === '_sys_vault_v2_notifications') tasks.push(saveDoc('vault_notifications', value));
      }

      await Promise.all(tasks);
      return res.status(200).json({ status: 'ok', version: Date.now(), data: req.body });
    }

    return res.status(200).json({ status: 'ok' });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Server error' });
  }
}
