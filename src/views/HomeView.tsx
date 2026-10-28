import React, { useState } from 'react';
import {
  Scale,
  ShieldCheck,
  Award,
  Users,
  Calendar,
  BookOpen,
  ArrowRight,
  Phone,
  MapPin,
  Star,
  Search,
  CheckCircle2,
  TrendingUp,
  FileText,
  AlertTriangle,
  Download,
  FileSignature
} from 'lucide-react';
import { Advocate, OfficeBearer } from '../types';
import { db } from '../lib/store';
import { PWAInstallButton } from '../components/PWAInstallButton';

interface HomeViewProps {
  onNavigate: (route: string) => void;
  onSelectAdvocate?: (adv: Advocate) => void;
  onOpenEmergency: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onSelectAdvocate,
  onOpenEmergency
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [advocates, setAdvocates] = useState<Advocate[]>(() => db.getAdvocates().filter(a => a.status === 'APPROVED'));
  const [committeeMembers, setCommitteeMembers] = useState(() => db.getCommittee().filter(c => c.isCurrent));
  const officeBearers = db.getOfficeBearers();
  const clients = db.getClients();

  React.useEffect(() => {
    const refresh = () => {
      setAdvocates(db.getAdvocates().filter(a => a.status === 'APPROVED'));
      setCommitteeMembers(db.getCommittee().filter(c => c.isCurrent));
    };
    window.addEventListener('crba_state_updated', refresh);
    const interval = setInterval(refresh, 2000);
    return () => {
      window.removeEventListener('crba_state_updated', refresh);
      clearInterval(interval);
    };
  }, []);

  const handleSelectAdvocate = (adv: Advocate) => {
    if (typeof onSelectAdvocate === 'function') {
      onSelectAdvocate(adv);
    } else {
      onNavigate('advocates');
    }
  };

  const totalMembers = advocates.length;
  const totalCases = clients.length;

  const topRatedAdvocates = [...advocates].sort((a, b) => b.rating - a.rating).slice(0, 4);

  const filteredAdvocates = searchQuery.trim()
    ? advocates.filter(a => {
        const q = searchQuery.toLowerCase();
        const nameMatch = (a.name || '').toLowerCase().includes(q);
        const barMatch = (a.barNo || '').toLowerCase().includes(q);
        const specMatch = (a.specialization || []).some(s => (s || '').toLowerCase().includes(q));
        return nameMatch || barMatch || specMatch;
      })
    : [];

  return (
    <div className="space-y-12 pb-16">
      
      {/* HERO SECTION - NYAAY SAHAYOGI FLAGSHIP SAAS BRANDING */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-b border-amber-500/25 py-14 sm:py-20 px-4 sm:px-6 lg:px-8">
        
        {/* Subtle decorative background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[32rem] h-[32rem] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center relative z-10 space-y-6">
          
          {/* Grand Ceremonial Justice Scale Emblem */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative group">
              <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-amber-500/40 via-yellow-400/30 to-amber-600/40 blur-xl opacity-85 group-hover:opacity-100 transition-opacity" />
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 p-1.5 shadow-2xl shadow-amber-500/40 ring-4 ring-amber-400/40">
                <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center border-2 border-amber-400/50 overflow-hidden shadow-inner relative">
                  <img
                    src="/assets/aistudio/IMG-20261015-WA5879_d8e26e79.jpg"
                    alt="Nyaay Sahayogi Official Judicial Emblem - यतो धर्मस्ततो जयः"
                    className="w-full h-full object-cover rounded-full transform group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]"
                  />
                </div>
              </div>
            </div>

            <p className="mt-4 text-xs sm:text-sm font-bold tracking-[0.18em] uppercase text-amber-400">
              INDIA&apos;S PREMIER JUDICIAL, BAR COUNCIL &amp; ADVOCATE ERP PLATFORM
            </p>
          </div>

          {/* Main Flagship Title */}
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-100 tracking-tight leading-none">
              NYAAY{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500">
                SAHAYOGI
              </span>
            </h1>
            <p className="text-lg sm:text-2xl font-extrabold text-amber-400 tracking-wide">
              न्याय सहयोगी — डिजिटल बार काउंसिल, बार एसोसिएशन एवं अधिवक्ता पोर्टल
            </p>
          </div>

          <p className="max-w-3xl mx-auto text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
            Unified cloud technology powering <strong className="text-slate-100">State Bar Councils, 75+ District Bar Associations, and Learned Advocates</strong> with QR-Verified Digital ID Cards, Tamper-Proof Bar Elections, Legal Drafting Studio, Daily Cause Lists, Audited Financial Ledgers &amp; Client Case Tracking.
          </p>

          {/* SaaS Capability Pillars */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-300 pt-1">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              State &amp; District Bar ERP
            </span>
            <span aria-hidden="true" className="text-slate-600 hidden sm:inline">·</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              QR Digital ID &amp; COP Verification
            </span>
            <span aria-hidden="true" className="text-slate-600 hidden sm:inline">·</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              Live Bar Elections &amp; e-Voting
            </span>
            <span aria-hidden="true" className="text-slate-600 hidden sm:inline">·</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              8.5&quot;×14&quot; Legal Drafting &amp; Case CRM
            </span>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-3">
            <button
              onClick={() => onNavigate('login')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 transition-all transform hover:-translate-y-0.5"
            >
              <ShieldCheck className="w-4 h-4 text-slate-950" />
              <span>Bar / Advocate Login (लॉगिन पोर्टल)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('advocates')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-100 font-bold text-sm border border-slate-700 shadow-xl transition-all transform hover:-translate-y-0.5"
            >
              <Users className="w-4 h-4 text-amber-400" />
              <span>Find an Advocate (वकील खोजें)</span>
            </button>

            <button
              onClick={() => onNavigate('client-status')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-sm border border-amber-500/50 shadow-xl transition-all transform hover:-translate-y-0.5"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span>मुवक्किल केस स्थिति (Case Status)</span>
            </button>

            <button
              onClick={onOpenEmergency}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-xl shadow-red-600/30 transition-all transform hover:-translate-y-0.5"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Emergency Lawyer (तुरंत वकील)</span>
            </button>

            <PWAInstallButton variant="hero" />
          </div>

          {/* Search Box on Hero */}
          <div className="max-w-xl mx-auto pt-6">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Advocate by Name, Bar Registration No or Specialization..."
                className="w-full bg-slate-900/90 border border-slate-700 focus:border-amber-500 text-slate-100 text-xs sm:text-sm rounded-2xl pl-11 pr-4 py-3.5 shadow-2xl focus:outline-none placeholder-slate-500"
              />
              <Search className="w-5 h-5 text-amber-400 absolute left-3.5 top-3.5" />
            </div>

            {/* Quick Live Search Results Dropdown */}
            {searchQuery.trim() && (
              <div className="mt-2 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 max-h-64 overflow-y-auto text-left divide-y divide-slate-800">
                {filteredAdvocates.length > 0 ? (
                  filteredAdvocates.map(adv => (
                    <div
                      key={adv.id}
                      onClick={() => handleSelectAdvocate(adv)}
                      className="p-2.5 hover:bg-slate-800 rounded-xl cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <img src={adv.photoUrl} alt={adv.name} className="w-8 h-8 rounded-full object-cover border border-amber-500/40" />
                        <div>
                          <p className="font-bold text-xs text-slate-100">{adv.name}</p>
                          <p className="text-[10px] text-amber-400">Bar No: {adv.barNo}</p>
                        </div>
                      </div>
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                        {(adv.specialization || ['CRIMINAL'])[0]}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 p-3 text-center">No advocates found matching "{searchQuery}"</p>
                )}
              </div>
            )}
          </div>

        </div>
      </section>

      {/* STATS STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl text-center">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-2">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-100">{totalMembers}+</div>
            <div className="text-xs text-slate-400 font-semibold mt-0.5">Enrolled Advocates</div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl text-center">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-2">
              <FileText className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-100">{totalCases * 40}+</div>
            <div className="text-xs text-slate-400 font-semibold mt-0.5">Active Court Cases</div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl text-center">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto mb-2">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-100">100%</div>
            <div className="text-xs text-slate-400 font-semibold mt-0.5">QR Verified ID Cards</div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl text-center">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-2">
              <Award className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-100">74 Yrs</div>
            <div className="text-xs text-slate-400 font-semibold mt-0.5">Judicial Legacy (1950)</div>
          </div>

        </div>
      </section>

      {/* OFFICE BEARERS (LEADERSHIP) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
              Executive Committee &amp; Office Bearers (कार्यकारिणी)
            </h2>
            <p className="text-xs text-slate-400">
              Leadership of Criminal &amp; Revenue Bar Association Ballia for the Session 2026-2027
            </p>
          </div>
          <button
            onClick={() => onNavigate('election')}
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-xl border border-amber-500/30 transition-all"
          >
            <span>State Bar &amp; District Election Portal (चुनाव)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {(committeeMembers.length > 0 ? committeeMembers : officeBearers.map(ob => ({
            id: ob.id,
            name: ob.name,
            post: ob.designation,
            hindiPost: '',
            sessionYear: ob.term,
            photo: ob.photoUrl,
            barNo: '1084/1990',
            mobile: ob.mobile,
            isCurrent: true
          }))).slice(0, 8).map((mem) => (
            <div
              key={mem.id}
              className="rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 p-5 shadow-lg transition-all text-center space-y-3 flex flex-col justify-between"
            >
              <div>
                <img
                  src={mem.photo}
                  alt={mem.name}
                  className="w-20 h-20 rounded-2xl mx-auto object-cover border-2 border-amber-500/50 shadow-md mb-2.5"
                />
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  {mem.post}
                </span>
                <h3 className="font-bold text-sm text-slate-100 mt-2">{mem.name}</h3>
                {mem.hindiPost && (
                  <p className="text-[11px] text-amber-400 font-medium">{mem.hindiPost}</p>
                )}
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">Bar No: {mem.barNo}</p>
              </div>

              <div className="pt-2.5 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <a href={`tel:${mem.mobile}`} className="hover:text-amber-300">{mem.mobile}</a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TOP RATED ADVOCATES & DIRECTORY PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
              Senior Advocates &amp; Legal Specialists (वरिष्ठ अधिवक्तागण)
            </h2>
            <p className="text-xs text-slate-400">
              Verified legal practitioners for Criminal, Revenue, Bail, Civil, and Matrimonial cases in Ballia
            </p>
          </div>
          <button
            onClick={() => onNavigate('advocates')}
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            <span>View All Advocates ({totalMembers})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {topRatedAdvocates.map((adv) => (
            <div
              key={adv.id}
              onClick={() => handleSelectAdvocate(adv)}
              className="rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 p-5 shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={adv.photoUrl}
                    alt={adv.name}
                    className="w-12 h-12 rounded-xl object-cover border border-amber-500/40"
                  />
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-slate-100 group-hover:text-amber-300 transition-colors">
                      {adv.name}
                    </h3>
                    <p className="text-[10px] text-amber-400 font-semibold">{adv.barNo}</p>
                    <div className="flex items-center gap-1 text-amber-400 text-[11px] mt-0.5">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span className="font-bold">{adv.rating}</span>
                      <span className="text-slate-500 text-[9px]">({adv.reviewsCount || 8})</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {(adv.specialization || ['CRIMINAL', 'CIVIL']).map((spec) => (
                    <span
                      key={spec}
                      className="text-[9px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700"
                    >
                      {spec}
                    </span>
                  ))}
                </div>

                <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                  {adv.chamberNo || 'District Court Bar Hall, Ballia'} • Tahsil {adv.address?.tahsil || 'Sadar'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Verified Member
                </span>
                <span className="text-amber-400 font-bold group-hover:underline">
                  View Profile →
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* QUICK ACCESS FEATURE BENTO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div
            onClick={() => onNavigate('drafting')}
            className="rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/40 hover:border-amber-400 p-6 shadow-xl cursor-pointer group transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
              <FileSignature className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-100 group-hover:text-amber-300 transition-colors">
              Legal Drafting (ड्राफ्टिंग)
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Legal Page size (8.5"x14") drafting with Hindi/English voice typing, court templates, and direct print/download.
            </p>
            <div className="mt-4 text-xs font-bold text-amber-400 flex items-center gap-1">
              <span>Open Drafting Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div
            onClick={() => onNavigate('causelist')}
            className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 hover:border-amber-500/40 p-6 shadow-xl cursor-pointer group transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-100 group-hover:text-amber-300 transition-colors">
              Daily Cause List (दैनिक वाद सूची)
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Real-time daily listing of cases scheduled in District Court, Sessions Court, CJM Court, and SDM Revenue Courts Ballia.
            </p>
            <div className="mt-4 text-xs font-bold text-amber-400 flex items-center gap-1">
              <span>View Today's Cause List</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div
            onClick={() => onNavigate('elibrary')}
            className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 hover:border-amber-500/40 p-6 shadow-xl cursor-pointer group transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-100 group-hover:text-amber-300 transition-colors">
              Legal e-Library &amp; UP Revenue Code
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Complete act references for BNS, BNSS, IPC, CrPC, UP Revenue Code 2006 (Sections 34, 24, 116), CPC and drafted formats.
            </p>
            <div className="mt-4 text-xs font-bold text-blue-400 flex items-center gap-1">
              <span>Access Legal Library</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div
            onClick={() => onNavigate('verify')}
            className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 hover:border-amber-500/40 p-6 shadow-xl cursor-pointer group transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-100 group-hover:text-amber-300 transition-colors">
              Official Bar QR ID Verification
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Instant digital verification of membership, COP validity, and credentials for administrative and judicial offices.
            </p>
            <div className="mt-4 text-xs font-bold text-emerald-400 flex items-center gap-1">
              <span>Verify Bar ID Card</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

        </div>
      </section>

      {/* MEMBER & SUPER ADMIN PORTAL ACCESS BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-amber-500/30 p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>BAR ASSOCIATION SECURE PORTAL</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-100">
              Advocate Member &amp; Bar Association Portal
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
              Access the Bar Management Console, Digital ID Cards, Vakalatnama Generator, Case &amp; Client CRM, Accounts Ledger, and Membership Renewals.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('login')}
              className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-slate-950" />
              <span>Sign In (एडमिन / अधिवक्ता लॉगिन)</span>
            </button>
            <button
              onClick={() => onNavigate('register')}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs sm:text-sm transition-all"
            >
              <span>New Advocate Registration</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
