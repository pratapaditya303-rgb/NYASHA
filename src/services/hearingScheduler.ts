import { Advocate, Client } from '../types';
import { db } from '../lib/store';
import { sendLocalPushNotification } from './fcmService';

const SENT_LOGS_KEY = '_nyaay_sent_hearing_alert_logs';

function getSentLogs(): string[] {
  try {
    const raw = localStorage.getItem(SENT_LOGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSentLogs(logs: string[]): void {
  try {
    localStorage.setItem(SENT_LOGS_KEY, JSON.stringify(logs.slice(-500))); // keep last 500 logs
  } catch {
    // ignore storage error
  }
}

function normalizeDateStr(dateStr: string): string {
  if (!dateStr) return '';
  const trimmed = dateStr.trim();
  // If YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split('-');
    return `${d}/${m}/${y}`;
  }
  return trimmed;
}

/**
 * Checks open cases for the logged-in advocate and triggers:
 * 1. Evening Alert (1 day before hearing @ 6:00 PM)
 * 2. Morning Alert (Same day of hearing @ 6:00 AM)
 */
export function checkAndTriggerHearingAlerts(advocate: Advocate): void {
  if (!advocate || !advocate.id) return;

  const clients: Client[] = db.getClientsByAdvocate(advocate.id);
  const sentLogs = getSentLogs();
  const logsSet = new Set(sentLogs);

  const now = new Date();
  const currentHours = now.getHours();

  // Today string: DD/MM/YYYY
  const todayDay = now.getDate().toString().padStart(2, '0');
  const todayMonth = (now.getMonth() + 1).toString().padStart(2, '0');
  const todayYear = now.getFullYear();
  const todayStr = `${todayDay}/${todayMonth}/${todayYear}`;

  // Tomorrow string: DD/MM/YYYY
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const tomorrowDay = tomorrow.getDate().toString().padStart(2, '0');
  const tomorrowMonth = (tomorrow.getMonth() + 1).toString().padStart(2, '0');
  const tomorrowYear = tomorrow.getFullYear();
  const tomorrowStr = `${tomorrowDay}/${tomorrowMonth}/${tomorrowYear}`;

  let newlyAddedLog = false;

  clients.forEach((c) => {
    if (c.status !== 'Open' || !c.nextHearingDate) return;

    const hearingDateStr = normalizeDateStr(c.nextHearingDate);

    // 1. EVENING ALERT: 1 Day Before @ 6:00 PM (18:00 or later)
    if (hearingDateStr === tomorrowStr && currentHours >= 18) {
      const eveKey = `eve_${c.id}_${tomorrowStr}`;
      if (!logsSet.has(eveKey)) {
        logsSet.add(eveKey);
        newlyAddedLog = true;

        const title = `⚖️ कल शाम 6:00 PM अलर्ट: कल केस सुनवाई है!`;
        const message = `कल (${c.nextHearingDate}) को ${c.courtName} में केस "${c.caseTitle || c.caseNo}" (मुवक्किल: ${c.clientName}) सूचीबद्ध है। Stage: ${c.caseStage || 'Hearing'}`;

        // Add private notification to store
        db.addNotification({
          id: 'notif_eve_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          title,
          message,
          targetAudience: 'Selected',
          recipientIds: [advocate.id, advocate.barNo],
          targetRole: 'advocate',
          isRead: false,
          createdAt: new Date().toLocaleString('en-IN')
        });

        // Trigger Mobile / System Web Push Notification
        sendLocalPushNotification(title, message, eveKey);
      }
    }

    // 2. MORNING ALERT: Same Day @ 6:00 AM (06:00 or later)
    if (hearingDateStr === todayStr && currentHours >= 6) {
      const mornKey = `morn_${c.id}_${todayStr}`;
      if (!logsSet.has(mornKey)) {
        logsSet.add(mornKey);
        newlyAddedLog = true;

        const title = `⚖️ आज सुबह 6:00 AM अलर्ट: आज कोर्ट सुनवाई है!`;
        const message = `आज (${c.nextHearingDate}) को ${c.courtName} में केस "${c.caseTitle || c.caseNo}" (मुवक्किल: ${c.clientName}) की तारीख है। समय पर कोर्ट पहुंचें।`;

        // Add private notification to store
        db.addNotification({
          id: 'notif_morn_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          title,
          message,
          targetAudience: 'Selected',
          recipientIds: [advocate.id, advocate.barNo],
          targetRole: 'advocate',
          isRead: false,
          createdAt: new Date().toLocaleString('en-IN')
        });

        // Trigger Mobile / System Web Push Notification
        sendLocalPushNotification(title, message, mornKey);
      }
    }
  });

  if (newlyAddedLog) {
    saveSentLogs(Array.from(logsSet));
  }
}
