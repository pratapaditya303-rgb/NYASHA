import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Smartphone, 
  FileText, 
  Calendar, 
  Scale, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Download, 
  Phone, 
  MessageSquare, 
  User, 
  Building, 
  ChevronRight, 
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  Printer
} from 'lucide-react';
import { Client, Advocate } from '../types';
import { db } from '../lib/store';
import { generateAdvocateSlipPDF } from '../lib/pdfGenerator';

interface ClientCaseStatusViewProps {
  onNavigate: (route: string, param?: string) => void;
  initialQuery?: string;
}

export const ClientCaseStatusView: React.FC<ClientCaseStatusViewProps> = ({ 
  onNavigate, 
  initialQuery = '' 
}) => {
  const [searchType, setSearchType] = useState<'mobile' | 'caseNo'>('mobile');
  const [mobileNumber, setMobileNumber] = useState(initialQuery || '');
  const [caseNumber, setCaseNumber] = useState('');
  
  // OTP flow for mobile
  const [otpStep, setOtpStep] = useState<'input' | 'otp' | 'verified'>('input');
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState<string>('1234');
  
  const [matchedClients, setMatchedClients] = useState<Client[]>([]);
  const [selectedCase, setSelectedCase] = useState<Client | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-fill if query passed
  useEffect(() => {
    if (initialQuery) {
      if (/^\d{10}$/.test(initialQuery.trim())) {
        setSearchType('mobile');
        setMobileNumber(initialQuery.trim());
      } else {
        setSearchType('caseNo');
        setCaseNumber(initialQuery.trim());
      }
    }
  }, [initialQuery]);

  // Request OTP for mobile
  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const cleanMobile = mobileNumber.trim().replace(/\D/g, '');

    if (cleanMobile.length < 10) {
      setErrorMessage('कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें (Please enter a valid 10-digit mobile number)');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const allClients = db.getClients();
      const found = allClients.filter(c => c.clientMobile && c.clientMobile.includes(cleanMobile));

      if (found.length === 0) {
        setErrorMessage(`मोबाइल नंबर +91-${cleanMobile} से कोई केस पंजीकृत नहीं मिला। कृपया अपने अधिवक्ता या बार कार्यालय से संपर्क करें।`);
        return;
      }

      // Generate 4-digit demo OTP
      const demoCode = '1234';
      setGeneratedOtp(demoCode);
      setOtpStep('otp');
    }, 400);
  };

  // Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (otpCode.trim() !== generatedOtp && otpCode.trim() !== '1234') {
      setErrorMessage('गलत OTP! कृपया स्क्रीन पर दिए गए डेमो कोड (1234) का उपयोग करें।');
      return;
    }

    const cleanMobile = mobileNumber.trim().replace(/\D/g, '');
    const allClients = db.getClients();
    const found = allClients.filter(c => c.clientMobile && c.clientMobile.includes(cleanMobile));

    setMatchedClients(found);
    if (found.length > 0) {
      setSelectedCase(found[0]);
    }
    setOtpStep('verified');
  };

  // Direct Search by Case Number (No OTP required)
  const handleSearchByCase = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const q = caseNumber.trim().toLowerCase();

    if (!q) {
      setErrorMessage('कृपया वाद संख्या (Case Number) या पार्टी का नाम दर्ज करें');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const allClients = db.getClients();
      const found = allClients.filter(c => 
        (c.caseNo && c.caseNo.toLowerCase().includes(q)) ||
        (c.caseTitle && c.caseTitle.toLowerCase().includes(q)) ||
        (c.clientName && c.clientName.toLowerCase().includes(q))
      );

      if (found.length === 0) {
        setErrorMessage(`वाद संख्या या नाम "${caseNumber}" से कोई केस रिकॉर्ड नहीं मिला।`);
        return;
      }

      setMatchedClients(found);
      setSelectedCase(found[0]);
      setOtpStep('verified');
    }, 300);
  };

  // Quick Demo Login for instant testing
  const handleQuickDemoClient = (mobile: string) => {
    setSearchType('mobile');
    setMobileNumber(mobile);
    const allClients = db.getClients();
    const found = allClients.filter(c => c.clientMobile && c.clientMobile.includes(mobile));
    setMatchedClients(found);
    if (found.length > 0) {
      setSelectedCase(found[0]);
    }
    setOtpStep('verified');
  };

  // Download PDF slip
  const handleDownloadSlip = (client: Client) => {
    const advocates = db.getAdvocates();
    const adv = advocates.find(a => a.id === client.advocateId) || advocates[0];
    generateAdvocateSlipPDF(adv, client);
  };

  // Open WhatsApp with advocate
  const handleWhatsAppAdvocate = (client: Client) => {
    const advocates = db.getAdvocates();
    const adv = advocates.find(a => a.id === client.advocateId);
    const advMobile = adv?.mobile || '9415988800';
    const text = encodeURIComponent(
      `नमस्ते अधिवक्ता ${client.advocateName} जी, मैं आपका मुवक्किल ${client.clientName} बात कर रहा हूँ। मेरे केस (वाद संख्या: ${client.caseNo}) की अगली तारीख ${client.nextHearingDate} के संबंध में आवश्यक जानकारी चाहिए। धन्यवाद।`
    );
    window.open(`https://wa.me/91${advMobile}?text=${text}`, '_blank');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-full bg-amber-500/5 blur-3xl rounded-full pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full text-[11px] font-bold text-amber-300">
              <Scale className="w-3.5 h-3.5" />
              <span>मुवक्किल नागरिक सेवा पोर्टल (Client Case Tracking Portal)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
              अपने मुकदमे की स्थिति व अगली तारीख जानें
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              दीवानी व राजस्व न्यायालय, कलेक्ट्रेट व जिला न्यायालय बलिया (U.P.)
            </p>
          </div>

          <button
            onClick={() => onNavigate('login')}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
            <span>अधिवक्ता लॉगिन पर जाएं</span>
          </button>
        </div>
      </div>

      {/* ================= STEP 1: LOGIN / SEARCH BOX ================= */}
      {otpStep !== 'verified' ? (
        <div className="max-w-xl mx-auto space-y-6">
          
          {/* Toggle Search Mode */}
          <div className="flex rounded-2xl bg-slate-900 p-1.5 border border-slate-800">
            <button
              type="button"
              onClick={() => { setSearchType('mobile'); setErrorMessage(null); }}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                searchType === 'mobile'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>मोबाइल नंबर से लॉगिन (OTP)</span>
            </button>

            <button
              type="button"
              onClick={() => { setSearchType('caseNo'); setErrorMessage(null); }}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                searchType === 'caseNo'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>वाद संख्या (Case No) से खोजें</span>
            </button>
          </div>

          {/* Form Container */}
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
            
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Mobile Number Flow */}
            {searchType === 'mobile' && (
              <>
                {otpStep === 'input' ? (
                  <form onSubmit={handleRequestOtp} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        रजिस्टर्ड मोबाइल नंबर (10 Digit Mobile Number)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-2.5 text-xs font-bold text-amber-400">
                          +91
                        </span>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          placeholder="9839443322"
                          className="w-full bg-slate-800 border border-slate-700 focus:border-amber-500 text-sm text-slate-100 rounded-xl pl-13 pr-4 py-2.5 placeholder-slate-500 focus:outline-none font-mono"
                        />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        वही नंबर दर्ज करें जो आपने अपने अधिवक्ता के पास वकालतनामे में दिया है।
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      <span>{isLoading ? 'जांच हो रही है...' : 'ओटीपी प्राप्त करें (Get OTP)'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  /* OTP Verification Screen */
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 text-center">
                      <p className="text-xs text-slate-200">
                        मोबाइल <strong className="text-amber-300">+91-{mobileNumber}</strong> पर 4 अंकों का OTP भेजा गया।
                      </p>
                      <p className="text-[11px] text-amber-400 font-bold mt-1">
                        ⚡ डेमो कोड (Demo OTP): <span className="bg-amber-500/20 px-2 py-0.5 rounded font-mono text-sm">1234</span>
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-center">
                        4 अंकों का OTP दर्ज करें
                      </label>
                      <input
                        type="text"
                        maxLength={4}
                        required
                        autoFocus
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="1234"
                        className="w-40 mx-auto block bg-slate-800 border-2 border-amber-500/70 text-center font-mono text-xl tracking-widest text-slate-100 rounded-xl py-2 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setOtpStep('input')}
                        className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                      >
                        नंबर बदलें
                      </button>
                      <button
                        type="submit"
                        className="flex-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all"
                      >
                        केस विवरण देखें (View Status)
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}

            {/* Direct Case Number Flow */}
            {searchType === 'caseNo' && (
              <form onSubmit={handleSearchByCase} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    वाद संख्या / केस नंबर या पार्टी का नाम
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={caseNumber}
                      onChange={(e) => setCaseNumber(e.target.value)}
                      placeholder="उदा. 412/2024 या Revenue Suit 89/2025"
                      className="w-full bg-slate-800 border border-slate-700 focus:border-amber-500 text-xs text-slate-100 rounded-xl pl-10 pr-4 py-2.5 placeholder-slate-500 focus:outline-none"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    केस संख्या दर्ज करके बिना पासवर्ड तुरंत अगली तारीख व स्थिति देखें।
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>{isLoading ? 'खोज रहे हैं...' : 'केस खोजें (Search Case)'}</span>
                </button>
              </form>
            )}

          </div>

          {/* Quick Demo Litigant Accounts */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-xs space-y-2.5">
            <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px] block">
              ⚡ टेस्ट हेतु सैंपल मुवक्किल (Click for Instant Demo):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoClient('9839443322')}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-left transition-colors"
              >
                <p className="font-bold text-slate-100 text-xs">धर्मेन्द्र कुमार राय (Criminal Case)</p>
                <p className="text-[10px] text-slate-400 font-mono">Mobile: 9839443322</p>
                <span className="text-[9px] text-amber-400">अगली तारीख: 12/09/2026</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoClient('9450332211')}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-left transition-colors"
              >
                <p className="font-bold text-slate-100 text-xs">राम सेवक गोंड (Revenue Case)</p>
                <p className="text-[10px] text-slate-400 font-mono">Mobile: 9450332211</p>
                <span className="text-[9px] text-emerald-400">अगली तारीख: 10/09/2026 (आज)</span>
              </button>
            </div>
          </div>

        </div>
      ) : (
        /* ================= STEP 2: CLIENT CASE DASHBOARD ================= */
        <div className="space-y-6">
          
          {/* Top Bar with Logged In User and Logout */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg">
                <User className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-base text-slate-100">
                    मुवक्किल: {selectedCase?.clientName}
                  </h2>
                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    सत्यापित मुवक्किल (Verified)
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  मोबाइल: +91-{selectedCase?.clientMobile} • {selectedCase?.address?.village}, {selectedCase?.address?.tahsil}, बलिया
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setOtpStep('input');
                setOtpCode('');
                setMatchedClients([]);
                setSelectedCase(null);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700"
            >
              लॉगआउट / दूसरा केस देखें
            </button>
          </div>

          {/* Multiple Cases Selector (if client has more than 1 case) */}
          {matchedClients.length > 1 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                आपके पंजीकृत मुकदमे ({matchedClients.length} Cases Found):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {matchedClients.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCase(c)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      selectedCase?.id === c.id
                        ? 'bg-amber-500/15 border-amber-500 shadow-md'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <p className="font-bold text-xs text-slate-200">{c.caseTitle || c.caseNo}</p>
                    <p className="text-[11px] text-slate-400">{c.courtName}</p>
                    <p className="text-[11px] text-amber-400 font-semibold mt-1">
                      अगली तारीख: {c.nextHearingDate}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ACTIVE SELECTED CASE DETAILS */}
          {selectedCase && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left 2 Columns: Core Case Status & Hearing Info */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Highlight Next Hearing Card */}
                <div className="bg-gradient-to-br from-amber-500/20 via-slate-900 to-slate-950 border-2 border-amber-500/60 rounded-3xl p-6 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="bg-amber-500 text-slate-950 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                      Next Court Hearing (अगली तारीख पेशी)
                    </span>
                    <span className="text-xs font-mono text-slate-300">
                      Case Status: <strong className="text-emerald-400">{selectedCase.status}</strong>
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
                    <div className="text-3xl sm:text-4xl font-black text-amber-300 tracking-tight font-mono">
                      {selectedCase.nextHearingDate}
                    </div>
                    <div className="text-xs text-slate-300">
                      (पिछली तारीख: <span className="font-mono text-slate-400">{selectedCase.previousDate || 'N/A'}</span>)
                    </div>
                  </div>

                  <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 space-y-2">
                    <div className="text-xs text-slate-400 font-semibold">न्यायालय / Court Room:</div>
                    <div className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      <Building className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span>{selectedCase.courtName}</span>
                    </div>

                    <div className="text-xs text-slate-400 font-semibold pt-1">कार्यवाही की स्थिति (Case Stage):</div>
                    <div className="text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl">
                      {selectedCase.caseStage || 'नियमित सुनवाई एवं साक्ष्य'}
                    </div>

                    {selectedCase.notes && (
                      <div className="pt-2 text-xs text-slate-300">
                        <span className="text-slate-400 font-medium">अधिवक्ता का निर्देश / Note: </span>
                        <span className="text-slate-100 font-semibold">{selectedCase.notes}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions for Hearing */}
                  <div className="flex flex-wrap gap-2.5 pt-2">
                    <button
                      onClick={() => handleDownloadSlip(selectedCase)}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>तारीख पर्ची (Hearing Slip) डाउनलोड करें</span>
                    </button>

                    <button
                      onClick={() => window.print()}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 border border-slate-700"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-400" />
                      <span>प्रिंट करें</span>
                    </button>
                  </div>

                </div>

                {/* Case Particulars Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                  <h3 className="font-bold text-sm text-slate-100 border-b border-slate-800 pb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span>मुकदमा विवरण (Case Particulars)</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block">वाद शीर्षक / Case Title:</span>
                      <span className="font-bold text-slate-100 text-sm mt-0.5 block">
                        {selectedCase.caseTitle || selectedCase.caseNameVsName || 'N/A'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block">वाद संख्या / Case No:</span>
                      <span className="font-mono font-bold text-amber-400 text-sm mt-0.5 block">
                        {selectedCase.caseNo}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block">केस की प्रकृति (Nature):</span>
                      <span className="inline-block mt-1 font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                        {selectedCase.caseNature}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block">मुवक्किल पिता/पति का नाम:</span>
                      <span className="font-semibold text-slate-200 mt-0.5 block">
                        {selectedCase.clientFatherName || 'N/A'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block">निवास स्थान / Address:</span>
                      <span className="font-medium text-slate-300 mt-0.5 block">
                        ग्राम {selectedCase.address?.village}, तहसील {selectedCase.address?.tahsil}, थाना {selectedCase.address?.policeStation || 'N/A'}, जिला बलिया
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block">पंजीकरण तिथि:</span>
                      <span className="font-mono text-slate-300 mt-0.5 block">
                        {selectedCase.createdAt}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right 1 Column: Assigned Advocate & Fee Ledger */}
              <div className="space-y-6">
                
                {/* Assigned Advocate Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                  <h3 className="font-bold text-sm text-slate-100 border-b border-slate-800 pb-3 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>आपके पैरवीकार अधिवक्ता</span>
                  </h3>

                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-500/40 mx-auto flex items-center justify-center font-bold text-xl text-amber-400">
                      {selectedCase.advocateName?.charAt(0) || 'A'}
                    </div>
                    <h4 className="font-bold text-base text-slate-100">
                      {selectedCase.advocateName}
                    </h4>
                    <p className="text-xs text-amber-400 font-mono">
                      Bar No: {selectedCase.advocateBarNo}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      चैम्बर: दीवानी कचहरी परिसर, बलिया
                    </p>
                  </div>

                  {/* Direct Contact Buttons */}
                  <div className="space-y-2 pt-2">
                    <button
                      onClick={() => handleWhatsAppAdvocate(selectedCase)}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow transition-all"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>अधिवक्ता को WhatsApp संदेश भेजें</span>
                    </button>

                    <button
                      onClick={() => {
                        const advocates = db.getAdvocates();
                        const adv = advocates.find(a => a.id === selectedCase.advocateId);
                        window.location.href = `tel:+91${adv?.mobile || '9415988800'}`;
                      }}
                      className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors"
                    >
                      <Phone className="w-4 h-4 text-amber-400" />
                      <span>कॉल करें (+91 9415988800)</span>
                    </button>
                  </div>
                </div>

                {/* Fees & Payment Status Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
                  <h3 className="font-bold text-sm text-slate-100 border-b border-slate-800 pb-2 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-amber-400" />
                    <span>फीस विवरण (Fee Ledger)</span>
                  </h3>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>कुल तय फीस (Total Fee):</span>
                      <span className="font-bold text-slate-200 font-mono">₹{selectedCase.totalFees?.toLocaleString('en-IN') || 0}</span>
                    </div>

                    <div className="flex justify-between text-slate-400">
                      <span>जमा की गई फीस (Received):</span>
                      <span className="font-bold text-emerald-400 font-mono">₹{selectedCase.feesReceived?.toLocaleString('en-IN') || 0}</span>
                    </div>

                    <div className="flex justify-between text-slate-400 pt-2 border-t border-slate-800">
                      <span className="font-bold text-slate-200">शेष बकाया (Pending Balance):</span>
                      <span className="font-black text-amber-400 font-mono text-sm">
                        ₹{(selectedCase.feesPending || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500 pt-1">
                    * फीस रसीद व लेखा अधिवक्ता कार्यालय द्वारा प्रमाणित है।
                  </p>
                </div>

              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
};
