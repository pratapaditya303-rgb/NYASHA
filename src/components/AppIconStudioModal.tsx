import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  Check,
  Smartphone,
  Globe,
  Sparkles,
  Download,
  Image as ImageIcon,
  Shield,
  Layers,
  RotateCcw
} from 'lucide-react';
import { AdvocateLogo, AdvocateLogoVariant } from './AdvocateLogo';
import { db } from '../lib/store';

interface AppIconStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIconUpdated?: () => void;
}

export const AppIconStudioModal: React.FC<AppIconStudioModalProps> = ({
  isOpen,
  onClose,
  onIconUpdated
}) => {
  const [selectedVariant, setSelectedVariant] = useState<AdvocateLogoVariant>('bands');
  const [customImageData, setCustomImageData] = useState<string>('');
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'presets' | 'upload'>('presets');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize from storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedPreset = (localStorage.getItem('nyaay_icon_preset') as AdvocateLogoVariant) || 'bands';
      const storedCustom = localStorage.getItem('nyaay_custom_logo_data') || '';
      setSelectedVariant(storedPreset);
      setCustomImageData(storedCustom);
      if (storedCustom) {
        setCustomUrlInput(storedCustom.startsWith('http') ? storedCustom : '');
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const presets: {
    id: AdvocateLogoVariant;
    title: string;
    hindiTitle: string;
    desc: string;
    badge: string;
  }[] = [
    {
      id: 'official',
      title: 'Supreme 3D Gold Medal',
      hindiTitle: 'न्याय सहयोगी 3D स्वर्ण राजमुद्रा (शेर, तराजू व यतो धर्मस्ततो जयः)',
      desc: 'Bespoke 3D Gold Circular Seal with Twin Lions Rampant, Laurel Wreath, Scales of Justice & Yato Dharmastato Jayah',
      badge: 'OFFICIAL EMBLEM • मुख्य राजमुद्रा'
    },
    {
      id: 'royal',
      title: 'Royal Judicial Seal',
      hindiTitle: 'राजकीय न्याय प्रतीक (स्वर्ण व गहरा नीला)',
      desc: '3D Gold Scales of Justice, Ashoka Chakra, White Advocate Bands & Law Codex',
      badge: 'CLASSIC GOLD • आधिकारिक'
    },
    {
      id: 'bands',
      title: 'Bar Council Advocate Bands',
      hindiTitle: 'अधिवक्ता श्वेत बैंड प्रतीक',
      desc: 'Classic Indian Advocate neckband and collar on deep obsidian seal',
      badge: 'HERITAGE • बार काउंसिल'
    },
    {
      id: 'court',
      title: 'High Court & Justice Pillars',
      hindiTitle: 'उच्च न्यायालय स्तंभ व तराजू',
      desc: 'Grand Colonnade courtroom architecture with balanced golden scales',
      badge: 'PRESTIGE • न्यायालय'
    },
    {
      id: 'tricolor',
      title: 'Tricolor National Shield',
      hindiTitle: 'तिरंगा व सत्यमेव जयते ढाल',
      desc: 'Indian Saffron, White & Green with Ashoka Navy Chakra and Justice Scales',
      badge: 'PATRIOTIC • राष्ट्रीय'
    }
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, SVG, WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setCustomImageData(result);
      setSelectedVariant('auto');
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = () => {
    if (!customUrlInput.trim()) return;
    setCustomImageData(customUrlInput.trim());
    setSelectedVariant('auto');
  };

  const handleSaveAndApply = () => {
    try {
      if (selectedVariant === 'auto' && customImageData) {
        localStorage.setItem('nyaay_icon_preset', 'auto');
        localStorage.setItem('nyaay_custom_logo_data', customImageData);
        
        // Update live favicon if data is available
        const faviconLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
        if (faviconLink) {
          faviconLink.href = customImageData;
        }

        // Update DB settings
        const currentSettings = db.getSettings();
        db.updateSettings({
          ...currentSettings,
          logoUrl: customImageData
        });

        // Update Super Admin Platform Settings
        const platformCfg = db.getPlatformSettings();
        db.updatePlatformSettings({
          ...platformCfg,
          appIconPreset: 'auto',
          customLogoData: customImageData
        });
      } else {
        localStorage.setItem('nyaay_icon_preset', selectedVariant);
        localStorage.removeItem('nyaay_custom_logo_data');

        // Reset favicon to default SVG/PNG
        const faviconLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
        if (faviconLink) {
          faviconLink.href = '/icon.svg';
        }

        const currentSettings = db.getSettings();
        db.updateSettings({
          ...currentSettings,
          logoUrl: '/icon.svg'
        });

        // Update Super Admin Platform Settings
        const platformCfg = db.getPlatformSettings();
        db.updatePlatformSettings({
          ...platformCfg,
          appIconPreset: selectedVariant,
          customLogoData: ''
        });
      }

      // Notify entire app of icon change
      window.dispatchEvent(new Event('app_icon_changed'));
      if (onIconUpdated) onIconUpdated();

      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 900);
    } catch (err) {
      console.error('Error saving app icon:', err);
    }
  };

  const handleResetDefault = () => {
    setSelectedVariant('bands');
    setCustomImageData('');
    setCustomUrlInput('');
    localStorage.setItem('nyaay_icon_preset', 'bands');
    localStorage.removeItem('nyaay_custom_logo_data');
    
    const faviconLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (faviconLink) {
      faviconLink.href = '/icon.svg';
    }

    const currentSettings = db.getSettings();
    db.updateSettings({
      ...currentSettings,
      logoUrl: '/icon.svg'
    });

    const platformCfg = db.getPlatformSettings();
    db.updatePlatformSettings({
      ...platformCfg,
      appIconPreset: 'bands',
      customLogoData: ''
    });

    window.dispatchEvent(new Event('app_icon_changed'));
    if (onIconUpdated) onIconUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-amber-500/20 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-md">
              <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  App Icon &amp; Logo Branding Studio
                </h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  👑 Super Admin Master
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Centrally deploy PWA home screen icon, browser favicon, and header logo across all bar associations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Two Columns */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Icon Options & Customizer */}
          <div className="lg:col-span-7 space-y-5">
            {/* Tab Switcher */}
            <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('presets')}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'presets'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-4 h-4" />
                4 Curated Legal Styles (आधिकारिक शैलियाँ)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'upload'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Upload className="w-4 h-4" />
                Upload Custom Logo (कस्टम लोगो)
              </button>
            </div>

            {/* Tab 1: Presets Selection */}
            {activeTab === 'presets' && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Select Official Icon Preset:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {presets.map((preset) => {
                    const isSelected = selectedVariant === preset.id && !customImageData;
                    return (
                      <div
                        key={preset.id}
                        onClick={() => {
                          setSelectedVariant(preset.id);
                          setCustomImageData('');
                        }}
                        className={`relative p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 flex-shrink-0 rounded-xl overflow-hidden shadow-md border border-slate-700 bg-slate-950 p-1 flex items-center justify-center">
                            <AdvocateLogo variant={preset.id} className="w-full h-full" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="inline-block text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 mb-1">
                              {preset.badge}
                            </span>
                            <h3 className="text-xs font-bold text-white truncate">
                              {preset.title}
                            </h3>
                            <p className="text-[11px] text-amber-300 font-medium leading-tight">
                              {preset.hindiTitle}
                            </p>
                          </div>
                        </div>

                        <p className="text-[10px] text-slate-400 mt-2.5 leading-relaxed">
                          {preset.desc}
                        </p>

                        {isSelected && (
                          <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 2: Upload Custom Logo */}
            {activeTab === 'upload' && (
              <div className="space-y-4 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <div>
                  <h3 className="text-xs font-bold text-white mb-1">
                    Upload Your Bar / Chamber Logo (PNG, SVG, JPG, WebP)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Upload an emblem or photo from your phone or PC. Recommended square ratio 1:1, minimum 512x512.
                  </p>
                </div>

                {/* Upload Drag/Click Zone */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-amber-500/40 hover:border-amber-400 bg-slate-900/60 rounded-xl p-6 text-center cursor-pointer transition group"
                >
                  <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6 text-amber-400" />
                  </div>
                  <p className="text-xs font-bold text-slate-200">
                    Click to browse or upload logo file
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Supports high-resolution PNG, SVG, or JPG
                  </p>
                </div>

                {/* Or enter Image URL */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <label className="text-xs font-semibold text-slate-300">
                    Or paste online Logo Image URL:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://example.com/bar-association-logo.png"
                      value={customUrlInput}
                      onChange={(e) => setCustomUrlInput(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCustomUrl}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold rounded-lg transition"
                    >
                      Load URL
                    </button>
                  </div>
                </div>

                {customImageData && (
                  <div className="flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <img
                        src={customImageData}
                        alt="Custom Logo Preview"
                        className="w-10 h-10 object-contain rounded-lg border border-amber-400/40 bg-slate-950 p-0.5"
                      />
                      <div>
                        <p className="text-xs font-bold text-white">Custom Logo Loaded</p>
                        <p className="text-[10px] text-amber-300">Ready to set as active app icon</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomImageData('');
                        setCustomUrlInput('');
                        setSelectedVariant('royal');
                      }}
                      className="text-xs text-red-400 hover:text-red-300 underline"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Quick Actions / Reset */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleResetDefault}
                className="text-xs text-slate-400 hover:text-amber-300 flex items-center gap-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset to Default Royal Emblem (डिफ़ॉल्ट रीसेट)
              </button>

              <a
                href="/icon.svg"
                download="nyaay-sahayogi-icon.svg"
                className="text-xs text-amber-400/80 hover:text-amber-300 flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                Download Current Icon SVG
              </a>
            </div>
          </div>

          {/* Right Column: Real-Time Multi-Device Preview */}
          <div className="lg:col-span-5 bg-slate-950/80 rounded-2xl p-4 sm:p-5 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  Live Device Previews
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  REAL-TIME
                </span>
              </div>

              {/* 1. Android / Phone Home Screen Icon Preview */}
              <div className="mb-5 bg-slate-900/90 rounded-xl p-3 border border-slate-800">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1">
                  📱 Mobile Home Screen App Icon (Android &amp; iOS PWA)
                </p>
                <div className="flex items-center gap-4 bg-slate-950/80 p-3 rounded-lg border border-slate-800/80">
                  <div className="w-16 h-16 rounded-2xl shadow-2xl p-0.5 bg-gradient-to-br from-amber-400 to-amber-700 flex-shrink-0">
                    <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center overflow-hidden p-1">
                      {customImageData ? (
                        <img src={customImageData} alt="Preview" className="w-full h-full object-contain rounded-xl" />
                      ) : (
                        <AdvocateLogo variant={selectedVariant} className="w-full h-full" />
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white tracking-wide">Nyaay Sahayogi</h4>
                    <p className="text-[11px] text-amber-400 font-semibold">न्याय सहयोगी</p>
                    <span className="text-[9px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded mt-1 inline-block">
                      192×192 &amp; 512×512 HD
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Browser Tab Preview */}
              <div className="mb-5 bg-slate-900/90 rounded-xl p-3 border border-slate-800">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  Browser Tab Favicon
                </p>
                <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2 max-w-[240px]">
                  <div className="w-4 h-4 rounded overflow-hidden flex-shrink-0">
                    {customImageData ? (
                      <img src={customImageData} alt="Favicon" className="w-full h-full object-contain" />
                    ) : (
                      <AdvocateLogo variant={selectedVariant} className="w-full h-full" />
                    )}
                  </div>
                  <span className="text-[11px] text-slate-300 font-medium truncate">
                    Nyaay Sahayogi - Bar...
                  </span>
                  <X className="w-3 h-3 text-slate-500 ml-auto" />
                </div>
              </div>

              {/* 3. Header Navbar Badge Preview */}
              <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Top Header Logo Appearance
                </p>
                <div className="flex items-center gap-2.5 bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-md flex-shrink-0">
                    <div className="w-full h-full rounded-[9px] bg-slate-950 flex items-center justify-center p-0.5 overflow-hidden">
                      {customImageData ? (
                        <img src={customImageData} alt="Header Preview" className="w-full h-full object-contain rounded-lg" />
                      ) : (
                        <AdvocateLogo variant={selectedVariant} className="w-full h-full" />
                      )}
                    </div>
                  </div>
                  <div>
                    <h5 className="text-[11px] font-bold text-white leading-tight">NYAAY SAHAYOGI</h5>
                    <p className="text-[9px] text-amber-400 font-semibold">BAR &amp; ADVOCATE PORTAL</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Apply Button */}
            <div className="mt-6 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={handleSaveAndApply}
                className={`w-full py-3 px-4 rounded-xl font-black text-sm tracking-wide transition-all shadow-xl flex items-center justify-center gap-2 ${
                  savedSuccess
                    ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-400'
                    : 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-slate-950 hover:brightness-110 active:scale-[0.98]'
                }`}
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-5 h-5 stroke-[3]" />
                    Icon Updated Successfully! (आइकन सेव हो गया)
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5 stroke-[2.5]" />
                    Set As Active App Icon (सक्रिय आइकन बनाएं)
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
