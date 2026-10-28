import React from 'react';
import { Scale, MapPin, Phone, Globe, Mail, ShieldCheck, Download, ExternalLink, Landmark, Vote, ArrowRight, Lock } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { db } from '../lib/store';

export const Footer: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const stateElectionConfig = db.getStateBarElectionConfig();
  const isElectionLive = stateElectionConfig.status === 'VotingOpen';

  const districtElectionConfig = db.getDistrictBarElectionConfig();
  const isDistrictElectionLive = districtElectionConfig.status === 'VotingOpen' || districtElectionConfig.isEnabled;
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-300 text-xs mt-auto">
      {/* Upper Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Col 1: Platform & Association Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-sm">NYAAY SAHAYOGI</h3>
                <p className="text-[11px] text-amber-400 font-semibold">न्याय सहयोगी • BAR &amp; LEGAL ERP</p>
              </div>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              India&apos;s unified digital platform for State Bar Councils, District Bar Associations, learned advocates, and litigants — delivering verified digital IDs, elections, drafting, and transparent court services.
            </p>
            <div className="pt-2">
              <PWAInstallButton variant="header" />
            </div>
          </div>

          {/* Col 2: Member & Admin Access */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-100 text-xs uppercase tracking-wider text-amber-400">
              Admin &amp; Portals (लॉगिन एवं सेवाएँ)
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button
                  onClick={() => onNavigate('state-bar-login')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg bg-red-950/70 hover:bg-red-900 border border-red-500/60 hover:border-red-400 text-red-200 hover:text-white font-bold flex items-center justify-between gap-1.5 transition-all shadow-md group"
                >
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                    <span>🔴 State Bar Council Login (राज्य बार)</span>
                  </span>
                  <span className="text-[9px] bg-red-600 text-white px-1.5 py-0.5 rounded font-black tracking-wide">
                    75 Districts
                  </span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('admin')}
                  className="text-slate-400 hover:text-amber-300 font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Scale className="w-3.5 h-3.5 text-amber-400" />
                  <span>Bar Association Admin</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('login')} className="hover:text-amber-300 transition-colors">
                  Advocate Sign In (अधिवक्ता लॉगिन)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('register')} className="hover:text-amber-300 transition-colors">
                  New Advocate Registration (नया पंजीकरण)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('client-status')} className="hover:text-amber-300 transition-colors">
                  Client Case Status (मुवक्किल केस स्थिति)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('advocates')} className="hover:text-amber-300 transition-colors">
                  Advocate Directory (अधिवक्ता सूची)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('causelist')} className="hover:text-amber-300 transition-colors">
                  Daily Cause List (दैनिक वाद सूची)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('election')} className="hover:text-amber-300 transition-colors">
                  Bar Election &amp; Voting Portal (चुनाव)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('verify')} className="hover:text-amber-300 transition-colors">
                  Verify QR Bar ID Card (सत्यापन)
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Judicial Jurisdiction */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-100 text-xs uppercase tracking-wider text-amber-400">
              Judicial Jurisdiction
            </h4>
            <div className="text-slate-400 space-y-2 text-[11px] leading-relaxed">
              <p>• District &amp; Sessions Court, Ballia</p>
              <p>• Collectorate &amp; Revenue Court (DM Ballia)</p>
              <p>• Sub-Divisional Magistrate (SDM) Courts: Sadar, Bansdih, Rasra, Bairia, Sikanderpur, Belthara Road</p>
              <p>• Motor Accident Claims Tribunal (MACT)</p>
              <p>• Family Courts &amp; Juvenile Justice Board</p>
            </div>
          </div>

          {/* Col 4: Contact & Office */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-100 text-xs uppercase tracking-wider text-amber-400">
              Bar Secretariat (कार्यालय)
            </h4>
            <div className="space-y-2.5 text-slate-400 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>District Court Campus, Bahadurpur, Ballia, Uttar Pradesh - 277001</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <a href="tel:9415988800" className="text-slate-200 hover:text-amber-300 font-semibold">
                  +91 9415988800
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <a href="https://sahayogifoundation.in" target="_blank" rel="noreferrer" className="text-slate-200 hover:text-amber-300">
                  sahayogifoundation.in
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>contact@barballia.com</span>
              </div>
            </div>
          </div>

        </div>

        {/* DEDICATED DISTRICT BAR ASSOCIATION ELECTION LIVE FLAG IN FOOTER (Only when District Bar Voting is Live) */}
        {isDistrictElectionLive && (
          <div className="mt-10 pt-8 border-t border-slate-800/80">
            <div className="rounded-3xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border-2 border-amber-500/60 p-5 sm:p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
              
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                    <span className="text-[11px] font-black uppercase tracking-wider bg-amber-600/30 text-amber-200 border border-amber-500/50 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                      <Vote className="w-3.5 h-3.5 text-amber-400" />
                      <span>Criminal &amp; Revenue Bar Association, Ballia</span>
                    </span>
                    <span className="text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>🟢 District Bar E-Voting LIVE (2026-2027)</span>
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <span>🏛️ जिला बार एसोसिएशन वार्षिक चुनाव मतदान पोर्टल चालू है</span>
                  </h3>

                  <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                    फौजदारी एवं राजस्व बार एसोसिएशन बलिया के सभी मतदाता अधिवक्तागण अपने Bar Registration No. और COP No. से सत्यापित होकर अपने मताधिकार का प्रयोग करें।
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => onNavigate('election')}
                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-xl shadow-amber-500/30 flex items-center gap-2 transition-all transform active:scale-95"
                  >
                    <Vote className="w-4 h-4 text-slate-950" />
                    <span>🗳️ Cast District Bar Ballot (मतदान करें)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DEDICATED SEPARATE STATE BAR COUNCIL LOGIN & ELECTION CONTROL TAB/CARD IN FOOTER (Only when Voting is Live) */}
        {isElectionLive && (
          <div className="mt-10 pt-8 border-t border-slate-800/80">
            <div className="rounded-3xl bg-gradient-to-r from-red-950/80 via-slate-900 to-red-950/80 border-2 border-red-500/60 p-5 sm:p-6 shadow-2xl relative overflow-hidden">
              {/* Subtle background glow */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
              
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                
                {/* Left Details */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    <span className="text-[11px] font-black uppercase tracking-wider bg-red-600/30 text-red-200 border border-red-500/50 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                      <Landmark className="w-3.5 h-3.5 text-red-400" />
                      <span>State Bar Council of Uttar Pradesh</span>
                    </span>
                    
                    <span className="text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>🟢 Live State Voting Open across 75 Districts</span>
                    </span>
                    
                    <span className="text-[10px] bg-red-500/20 text-red-300 border border-red-500/40 px-2 py-0.5 rounded-full font-bold">
                      Statutory Regulatory Council
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <span>🏛️ राज्य बार काउंसिल चुनाव नियंत्रण एवं 75 जिला मतदाता डायरेक्टरी पोर्टल</span>
                  </h3>

                  <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                    पूरे प्रदेश के सभी 75 जिलों की बार एसोसिएशनों के अधिवक्ताओं के लिए अधिकृत चुनाव नियंत्रण कक्ष। राज्य बार एडमिन यहाँ से संपूर्ण प्रदेश के चुनाव को <strong className="text-amber-300">ON / OFF</strong> कर सकते हैं और 75 जिलों की मतदाता सूची प्रबंधित कर सकते हैं।
                  </p>
                </div>

                {/* Right Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => onNavigate('state-bar-portal')}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-extrabold text-xs shadow-lg shadow-red-600/30 border border-red-400 flex items-center gap-2 transition-all transform active:scale-95"
                  >
                    <Landmark className="w-4 h-4 text-white" />
                    <span>🏛️ State Bar Council Portal (75 Districts)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('state-bar-login')}
                    className="px-3.5 py-2.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/50 hover:border-red-400 text-red-200 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow"
                  >
                    <span>🔴 State Admin Login</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('election')}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-400 text-slate-200 hover:text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-all"
                  >
                    <Vote className="w-4 h-4 text-amber-400" />
                    <span>राज्य मतपत्र (Vote)</span>
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>

      {/* Copyright Bar */}
      <div className="bg-slate-900/90 border-t border-slate-800/80 py-3.5 px-4 text-slate-500 text-[11px]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-semibold text-slate-400">
            © {new Date().getFullYear()} <strong className="text-amber-400">NYAAY SAHAYOGI (न्याय सहयोगी)</strong> — Judicial, Bar Council &amp; Advocate ERP Platform. All Rights Reserved.
          </p>
          <div className="flex items-center flex-wrap justify-center gap-3 sm:gap-4 text-slate-400">
            <span>A Venture by Sahayogi Foundation</span>
            <span>•</span>
            <span className="text-amber-400/90">Official Legal Tech &amp; Bar SaaS</span>
            <span>•</span>
            <button
              onClick={() => onNavigate('state-bar-login')}
              className="inline-flex items-center gap-1 text-red-400 hover:text-red-300 hover:underline transition-colors cursor-pointer text-[11px] font-bold"
              title="State Bar Council Election Administration Room"
            >
              <span>🏛️ State Bar Council</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
