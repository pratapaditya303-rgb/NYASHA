import React, { useState } from 'react';
import { Download, Smartphone, X, ExternalLink, Copy, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ variant?: 'header' | 'hero' | 'banner' }> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, isInIframe, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // If already installed on this device, hide the install button completely
  if (isInstalled) {
    return null;
  }

  const directAppUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-m2hianf52lltsc3zo7hk5v-410124294442.asia-southeast1.run.app';

  const handleInstallClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (!ok) {
        setShowAndroidGuide(true);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      setShowAndroidGuide(true);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(directAppUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (variant === 'hero') {
    return (
      <>
        <button
          onClick={handleInstallClick}
          className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20 border border-amber-300/40 transition-all transform hover:-translate-y-0.5"
        >
          <Download className="w-5 h-5" />
          <span>Install Nyaay Sahayogi App (PWA)</span>
        </button>

        {renderModals()}
      </>
    );
  }

  if (variant === 'banner') {
    return (
      <>
        <button
          onClick={handleInstallClick}
          className="w-full text-left px-3.5 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 text-sm font-bold flex items-center justify-between shadow"
        >
          <span className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-amber-400" />
            <span>📲 Install Nyaay Sahayogi App (PWA)</span>
          </span>
          <span className="text-xs bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-black">Install</span>
        </button>

        {renderModals()}
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleInstallClick}
        title="Install Nyaay Sahayogi App on Android/iOS/Tablet/Desktop"
        className="flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 text-xs font-bold tracking-wide transition-colors shadow-sm"
      >
        <Smartphone className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
        <span className="hidden md:inline">Install PWA App</span>
        <span className="md:hidden">Install App</span>
      </button>

      {renderModals()}
    </>
  );

  function renderModals() {
    return (
      <>
        {/* iOS Guide */}
        {showIOSGuide && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/90 p-4">
            <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-amber-500/40 p-6 shadow-2xl text-slate-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    iOS
                  </div>
                  <h3 className="font-bold text-base text-slate-100">Install on iPhone / iPad</h3>
                </div>
                <button onClick={() => setShowIOSGuide(false)} className="text-slate-400 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-sm text-slate-300">
                {isInIframe && (
                  <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 space-y-2">
                    <p className="text-xs text-amber-200 font-semibold">
                      ⚠️ आप अभी AI Studio Preview Frame के अंदर हैं। ऐप इंस्टॉल करने के लिए पहले नीचे बटन दबाकर सीधा लिंक खोलें:
                    </p>
                    <a
                      href={directAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>🚀 Step 1: Open Direct App Link</span>
                    </a>
                  </div>
                )}
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 text-amber-400 text-xs flex items-center justify-center font-bold">1</span>
                  <p>In Safari, tap the <strong className="text-amber-300">Share</strong> icon at the bottom toolbar.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 text-amber-400 text-xs flex items-center justify-center font-bold">2</span>
                  <p>Scroll down and tap <strong className="text-amber-300">Add to Home Screen (होम स्क्रीन में जोड़ें)</strong>.</p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm"
              >
                Got It / समझ गया
              </button>
            </div>
          </div>
        )}

        {/* Android / Tablet / Desktop Direct Install Modal */}
        {showAndroidGuide && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/90 p-4">
            <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-amber-500/40 p-6 shadow-2xl text-slate-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-base text-slate-100">Install Nyaay Sahayogi App (PWA)</h3>
                </div>
                <button onClick={() => setShowAndroidGuide(false)} className="text-slate-400 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-4 text-sm text-slate-300">
                {isInIframe && (
                  <div className="p-4 rounded-2xl bg-amber-500/15 border-2 border-amber-500/50 space-y-3">
                    <p className="text-xs text-amber-200 leading-relaxed font-semibold">
                      💡 <strong>Direct Install क्यों नहीं हुआ?</strong><br />
                      आपने अभी ऐप को <code>aistudio.google.com</code> (Preview Bar) के अंदर खोल रखा है। Chrome सुरक्षा नियमों के कारण Preview Frame के अंदर डायरेक्ट ऐप इंस्टॉल ब्लॉक रहता है।
                    </p>
                    <a
                      href={directAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>🚀 1-Click: सीधा ऐप लिंक खोलें और Install करें</span>
                    </a>
                    <button
                      type="button"
                      onClick={handleCopyUrl}
                      className="w-full py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 flex items-center justify-center gap-1.5"
                    >
                      {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                      <span>{copiedLink ? 'Direct App Link Copied!' : 'Copy Direct App Link (सीधा लिंक कॉपी करें)'}</span>
                    </button>
                  </div>
                )}

                <div className="space-y-2.5 text-xs sm:text-sm">
                  <p className="font-bold text-amber-300">सीधे लिंक पर जाने के बाद (Direct App Tab में):</p>
                  <div className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 text-amber-400 text-xs flex items-center justify-center font-bold">1</span>
                    <p>ऊपर <strong className="text-amber-300">Install App</strong> बटन दबाते ही सीधे फोन/टैब में ऐप इंस्टॉल हो जाएगा।</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 text-amber-400 text-xs flex items-center justify-center font-bold">2</span>
                    <p>या Chrome के कोने में <strong>3 डॉट्स (⋮)</strong> दबाकर <strong className="text-amber-300">Install app / Add to Home screen</strong> चुनें।</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowAndroidGuide(false)}
                className="mt-5 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm"
              >
                Close / बंद करें
              </button>
            </div>
          </div>
        )}
      </>
    );
  }
};


