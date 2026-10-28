import React, { useState, useEffect } from 'react';
import {
  Bell,
  Volume2,
  CheckCircle,
  Radio,
  Send,
  X,
  AlertOctagon,
  Sparkles,
  Info,
  Calendar,
  Clock
} from 'lucide-react';
import {
  broadcastMessage,
  playNotificationChime,
  requestPushPermission,
  getSyncEngineStatus,
  SYNC_EVENTS,
  BroadcastMessage,
  SyncEngineStatus
} from '../services/RealtimeSyncEngine';
import { Advocate } from '../types';

interface BroadcastAlertBannerProps {
  currentUser?: Advocate | null;
  onNavigate?: (route: string) => void;
}

export const BroadcastAlertBanner: React.FC<BroadcastAlertBannerProps> = ({
  currentUser,
  onNavigate
}) => {
  const [activeAlert, setActiveAlert] = useState<BroadcastMessage | null>(null);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [pushGranted, setPushGranted] = useState<boolean>(() => {
    return typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
  });
  const [engineStatus, setEngineStatus] = useState<SyncEngineStatus>(getSyncEngineStatus());

  // Form State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<'alert' | 'notice' | 'news' | 'update'>('alert');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    // 1. Listen for incoming broadcasts
    const handleBroadcast = (e: any) => {
      const msg: BroadcastMessage = e.detail;
      if (msg) {
        setActiveAlert(msg);
      }
    };

    // 2. Listen for engine status changes
    const handleStatus = (e: any) => {
      if (e.detail) {
        setEngineStatus(e.detail);
      }
    };

    window.addEventListener(SYNC_EVENTS.BROADCAST_RECEIVED, handleBroadcast);
    window.addEventListener(SYNC_EVENTS.STATUS_CHANGED, handleStatus);

    return () => {
      window.removeEventListener(SYNC_EVENTS.BROADCAST_RECEIVED, handleBroadcast);
      window.removeEventListener(SYNC_EVENTS.STATUS_CHANGED, handleStatus);
    };
  }, []);

  const handleRequestPush = async () => {
    const granted = await requestPushPermission();
    setPushGranted(granted);
    playNotificationChime();
    if (granted) {
      setSuccessToast('🔔 सिस्टम पुश सूचनाएं सफलतापूर्वक सक्षम कर दी गईं!');
      setTimeout(() => setSuccessToast(null), 4000);
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setIsSending(true);
    try {
      const sender = currentUser?.name
        ? `${currentUser.name} (${currentUser.role === 'bar_admin' ? 'बार पदाधिकारी' : 'अधिवक्ता'})`
        : 'जिला बार एसोसिएशन (Bar Association)';

      await broadcastMessage(title.trim(), message.trim(), {
        category,
        senderName: sender,
        actionUrl: window.location.origin
      });

      setSuccessToast('📢 सूचना सभी कनेक्टेड डिवाइसों पर सफलतापूर्वक प्रसारित कर दी गई!');
      setTitle('');
      setMessage('');
      setIsBroadcastModalOpen(false);
      setTimeout(() => setSuccessToast(null), 5000);
    } catch (err) {
      console.error('Broadcast error:', err);
    } finally {
      setIsSending(false);
    }
  };

  const getCategoryBadge = (cat?: string) => {
    switch (cat) {
      case 'alert':
        return { label: 'हड़ताल / आपातकालीन सूचना', bg: 'bg-red-500/20 text-red-400 border-red-500/40' };
      case 'notice':
        return { label: 'बार एसोसिएशन नोटिस', bg: 'bg-amber-500/20 text-amber-400 border-amber-500/40' };
      case 'update':
        return { label: 'दैनिक वाद सूची अपडेट', bg: 'bg-blue-500/20 text-blue-400 border-blue-500/40' };
      default:
        return { label: 'सामान्य परिपत्र', bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' };
    }
  };

  return (
    <>
      {/* Top Real-time Bar Status Strip */}
      <div className="bg-slate-900/90 border-b border-slate-800 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${engineStatus.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-slate-300 font-medium">
              {engineStatus.isOnline ? 'क्लाउड सिंक लाइव' : 'ऑफलाइन मोड'}
            </span>
          </div>

          <span className="hidden sm:inline text-slate-600">|</span>

          <span className="text-slate-400 hidden sm:inline flex items-center gap-1">
            <Radio className="w-3 h-3 text-amber-400 inline animate-spin" style={{ animationDuration: '6s' }} />
            रियल-टाइम ब्रॉडकास्ट इंजन सक्रिय (Firestore Cloud REST)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!pushGranted && (
            <button
              onClick={handleRequestPush}
              className="flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded text-[11px] transition-all cursor-pointer font-medium"
              title="पुश सूचनाएं सक्रिय करें"
            >
              <Bell className="w-3 h-3" />
              सूचनाएं सक्षम करें
            </button>
          )}

          <button
            onClick={() => playNotificationChime()}
            className="text-slate-400 hover:text-amber-400 transition-colors p-1 rounded"
            title="ऑडियो अलर्ट टोन टेस्ट करें"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>

          {/* Quick Broadcast Button (Visible for all logged in bar members & admins) */}
          <button
            onClick={() => setIsBroadcastModalOpen(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-semibold px-2.5 py-0.5 rounded shadow-sm text-[11px] transition-all cursor-pointer"
          >
            <Radio className="w-3 h-3" />
            सूचना प्रसारित करें
          </button>
        </div>
      </div>

      {/* Pop-up Live Broadcast Modal for Urgent Alerts */}
      {activeAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 animate-bounce">
                  <AlertOctagon className="w-6 h-6" />
                </div>
                <div>
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider mb-1 ${getCategoryBadge(activeAlert.category).bg}`}>
                    {getCategoryBadge(activeAlert.category).label}
                  </span>
                  <h3 className="text-lg font-bold text-white leading-snug">
                    {activeAlert.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setActiveAlert(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 mb-4">
              <p className="text-slate-200 text-sm whitespace-pre-wrap leading-relaxed">
                {activeAlert.message}
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 mb-5">
              <span>प्रेषक: <strong className="text-slate-300">{activeAlert.senderName || 'बार एसोसिएशन'}</strong></span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                {new Date(activeAlert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setActiveAlert(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                बंद करें (Dismiss)
              </button>
              {activeAlert.actionUrl && onNavigate && (
                <button
                  onClick={() => {
                    setActiveAlert(null);
                    onNavigate('causelist');
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-colors shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  विवरण देखें
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Send Broadcast Modal */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">बार सूचना प्रसारित करें</h3>
                  <p className="text-xs text-slate-400">सभी कनेक्टेड अधिवक्ता डिवाइसों पर तुरंत अलर्ट भेजें</p>
                </div>
              </div>
              <button
                onClick={() => setIsBroadcastModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  सूचना की श्रेणी (Category)
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setCategory('alert')}
                    className={`py-2 px-3 rounded-lg border text-left transition-all cursor-pointer ${
                      category === 'alert'
                        ? 'bg-red-500/20 border-red-500/60 text-red-300 font-semibold'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
                    }`}
                  >
                    🔴 हड़ताल / आपात बैठक
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategory('notice')}
                    className={`py-2 px-3 rounded-lg border text-left transition-all cursor-pointer ${
                      category === 'notice'
                        ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 font-semibold'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
                    }`}
                  >
                    🟡 बार नोटिस / परिपत्र
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategory('update')}
                    className={`py-2 px-3 rounded-lg border text-left transition-all cursor-pointer ${
                      category === 'update'
                        ? 'bg-blue-500/20 border-blue-500/60 text-blue-300 font-semibold'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
                    }`}
                  >
                    🔵 वाद सूची / बेंच अपडेट
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategory('news')}
                    className={`py-2 px-3 rounded-lg border text-left transition-all cursor-pointer ${
                      category === 'news'
                        ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 font-semibold'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
                    }`}
                  >
                    🟢 सामान्य विधिक समाचार
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  शीर्षक (Title) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. कल सिविल कोर्ट में न्यायिक कार्य से विरत रहने का निर्णय"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  सूचना का विस्तृत विवरण (Message) *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="विस्तृत संदेश लिखें जो सभी सदस्यों के मोबाइल और डेस्कटॉप पर दिखाई देगा..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-300/90 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  यह संदेश भेजते ही सभी जुड़े अधिवक्ताओं के फोन पर हार्मोनिक साउंड अलर्ट और पुश नोटिफिकेशन ट्रिगर होगा।
                </span>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsBroadcastModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-60"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSending ? 'प्रसारित किया जा रहा है...' : 'अभी प्रसारित करें (Broadcast Now)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Success Toast */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/50 text-emerald-300 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-medium animate-in slide-in-from-bottom duration-300">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}
    </>
  );
};
