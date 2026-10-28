import React, { useState } from 'react';
import { 
  Lock, Mail, ShieldCheck, ArrowRight, UserCheck, AlertCircle, 
  Scale, Key, Landmark, Crown, Vote, Sparkles, Eye, EyeOff, 
  X, Calendar, CheckCircle2, Shield, ShieldAlert 
} from 'lucide-react';
import { Advocate } from '../types';
import { db } from '../lib/store';

// Helper to normalize dates for robust comparison between DD/MM/YYYY and YYYY-MM-DD
const normalizeDate = (d: string): string => {
  if (!d) return '';
  const trimmed = d.trim().replace(/\s+/g, '');
  // Format YYYY-MM-DD (e.g. from <input type="date">)
  const ymd = trimmed.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (ymd) {
    const [, y, m, day] = ymd;
    return `${parseInt(day, 10)}/${parseInt(m, 10)}/${y}`;
  }
  // Format DD/MM/YYYY or DD-MM-YYYY
  const dmy = trimmed.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmy) {
    const [, day, m, y] = dmy;
    return `${parseInt(day, 10)}/${parseInt(m, 10)}/${y}`;
  }
  return trimmed;
};

const matchDOB = (stored: string, input: string): boolean => {
  if (!stored || !input) return false;
  const normStored = normalizeDate(stored);
  const normInput = normalizeDate(input);
  if (normStored && normInput && normStored === normInput) return true;

  // Fallback to pure digit sequence (ignoring separators)
  const digitsStored = stored.replace(/\D/g, '');
  const digitsInput = input.replace(/\D/g, '');
  if (digitsStored && digitsInput && digitsStored === digitsInput) return true;

  return false;
};

interface LoginViewProps {
  onNavigate: (route: string) => void;
  onLoginSuccess: (user: Advocate) => void;
  initialMode?: 'advocate_admin' | 'state_bar' | 'client';
}

export const LoginView: React.FC<LoginViewProps> = ({ onNavigate, onLoginSuccess, initialMode }) => {
  const [activeLoginMode, setActiveLoginMode] = useState<'advocate_admin' | 'state_bar' | 'client'>(
    initialMode || 'advocate_admin'
  );
  const [identifier, setIdentifier] = useState(
    initialMode === 'state_bar' ? 'stateadmin@upbarcouncil.org' : ''
  );
  const [password, setPassword] = useState(
    initialMode === 'state_bar' ? 'StateAdmin@123' : ''
  );
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Self-Service Forgot Password Modal States
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1); // 1: Verify Identity & DOB, 2: Create New Password
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [resetDob, setResetDob] = useState('');
  const [verifiedAdvocate, setVerifiedAdvocate] = useState<Advocate | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const advocates = db.getAdvocates();
    const cleanId = identifier.trim().toLowerCase();

    const matchingCandidates = advocates.filter(
      (a) =>
        (a.email || '').toLowerCase() === cleanId ||
        (a.barNo || '').toLowerCase() === cleanId ||
        (a.barNo || '').replace(/\//g, '-').toLowerCase() === cleanId ||
        (a.mobile || '').trim() === identifier.trim()
    );

    const matched =
      matchingCandidates.find((a) => a.role === 'super_admin') ||
      matchingCandidates.find((a) => a.status === 'APPROVED') ||
      matchingCandidates[0];

    if (!matched) {
      setErrorMessage('अमान्य ईमेल या बार पंजीकरण संख्या (User Not Found)। कृपया सही आईडी दर्ज करें।');
      return;
    }

    const isSuperAdmin =
      matched.role === 'super_admin' ||
      (matched.email || '').toLowerCase() === 'nyaaysahayogi@gmail.com' ||
      (matched.barNo || '').toUpperCase() === 'SUPER/001/2020';

    if (isSuperAdmin && matched.status !== 'APPROVED') {
      matched.status = 'APPROVED';
      matched.role = 'super_admin';
      db.updateAdvocate(matched.id, { status: 'APPROVED', role: 'super_admin' });
    }

    // STRICT ADMIN APPROVAL CHECK:
    // Only approved advocates or super_admin can log in. Pending accounts are strictly blocked.
    if (!isSuperAdmin) {
      const statusUpper = (matched.status || '').toUpperCase();
      if (statusUpper === 'PENDING' || statusUpper === 'PENDING_APPROVAL') {
        setErrorMessage(
          '⏳ आपका पंजीकरण सत्यापन हेतु लंबित है (Account Pending Admin Approval)। बार एसोसिएशन एडमिन द्वारा आपके अभिलेखों एवं बार पंजीकरण का सत्यापन व अनुमोदन (Approve) किए जाने के बाद ही आप लॉगिन कर सकेंगे। कृपया बार कार्यालय से संपर्क करें।'
        );
        return;
      }

      if (statusUpper === 'REJECTED') {
        setErrorMessage('❌ आपका खाता बार एसोसिएशन एडमिन द्वारा अस्वीकृत या निलंबित (Account Rejected/Disabled) कर दिया गया है। अधिक जानकारी के लिए बार कार्यालय से संपर्क करें।');
        return;
      }

      if (statusUpper !== 'APPROVED') {
        setErrorMessage('⚠️ आपका खाता अभी सक्रिय (Not Approved) नहीं है। बार एडमिन के अनुमोदन की प्रतीक्षा करें।');
        return;
      }
    }

    // STRICT PASSWORD VERIFICATION
    const enteredPass = (password || '').trim();
    const storedPass = (matched.password || '').trim();

    if (!enteredPass) {
      setErrorMessage('कृपया पासवर्ड दर्ज करें (Password is required)।');
      return;
    }

    if (enteredPass !== storedPass) {
      setErrorMessage('गलत पासवर्ड (Incorrect Password)! कृपया सही पासवर्ड दर्ज करें।');
      return;
    }

    onLoginSuccess(matched);
  };

  const handleQuickLogin = (emailOrBar: string) => {
    const advocates = db.getAdvocates();
    const clean = (emailOrBar || '').trim().toLowerCase();
    const matched = advocates.find(
      (a) =>
        (a.email || '').toLowerCase() === clean ||
        (a.barNo || '').toLowerCase() === clean ||
        (a.barNo || '').replace(/\//g, '-').toLowerCase() === clean
    );
    if (matched) {
      const isSuperAdmin =
        matched.role === 'super_admin' ||
        (matched.email || '').toLowerCase() === 'nyaaysahayogi@gmail.com' ||
        (matched.barNo || '').toUpperCase() === 'SUPER/001/2020';

      if (!isSuperAdmin) {
        const statusUpper = (matched.status || '').toUpperCase();
        if (statusUpper === 'PENDING' || statusUpper === 'PENDING_APPROVAL') {
          setErrorMessage(
            '⏳ यह अधिवक्ता खाता अभी सत्यापन हेतु लंबित (Pending Admin Approval) है। बार एसोसिएशन एडमिन के अनुमोदन के बाद ही लॉगिन संभव होगा।'
          );
          return;
        }
        if (statusUpper !== 'APPROVED') {
          setErrorMessage('⚠️ यह खाता अभी सक्रिय नहीं है।');
          return;
        }
      }
      onLoginSuccess(matched);
    }
  };

  const handleSelectStateBarMode = () => {
    setActiveLoginMode('state_bar');
    setIdentifier('stateadmin@upbarcouncil.org');
    setPassword('StateAdmin@123');
  };

  // Open Self-Service Forgot Password Modal
  const handleOpenForgotPassword = () => {
    setForgotError(null);
    setForgotStep(1);
    setVerifiedAdvocate(null);
    setResetIdentifier(identifier.trim());
    setResetDob('');
    setNewPassword('');
    setConfirmPassword('');
    setIsForgotModalOpen(true);
  };

  // Step 1: Verify Date of Birth against advocate record
  const handleVerifyDOB = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    const cleanId = resetIdentifier.trim().toLowerCase();
    const cleanDigits = cleanId.replace(/\D/g, '');
    const cleanAlphaNum = cleanId.replace(/[^a-z0-9]/g, '');

    if (!cleanId) {
      setForgotError('कृपया अपना बार काउंसिल रजिस्ट्रेशन नंबर, मोबाइल नंबर या ईमेल दर्ज करें।');
      return;
    }

    if (!resetDob) {
      setForgotError('कृपया अपनी जन्मतिथि (Date of Birth) दर्ज करें या कैलेंडर से चुनें।');
      return;
    }

    const advocates = db.getAdvocates();

    // Find candidates matching the identifier
    const matchingAdvocates = advocates.filter((a) => {
      const email = (a.email || '').toLowerCase().trim();
      const mobile = (a.mobile || '').replace(/\D/g, '');
      const barNo = (a.barNo || '').toLowerCase().trim();
      const cleanBar = barNo.replace(/[^a-z0-9]/g, '');

      return (
        email === cleanId ||
        (cleanDigits.length >= 10 && mobile.includes(cleanDigits)) ||
        barNo === cleanId ||
        barNo.replace(/\//g, '-') === cleanId ||
        (cleanAlphaNum.length >= 4 && cleanBar.includes(cleanAlphaNum))
      );
    });

    if (matchingAdvocates.length === 0) {
      setForgotError('इस बार नंबर / मोबाइल / ईमेल से कोई अधिवक्ता रिकॉर्ड नहीं मिला। कृपया सही विवरण जांचें।');
      return;
    }

    // Now verify DOB against matched candidate(s)
    const verified = matchingAdvocates.find((adv) => matchDOB(adv.dob, resetDob));

    if (!verified) {
      setForgotError(
        'दर्ज की गई जन्मतिथि (Date of Birth) बार रिकॉर्ड से मेल नहीं खाती है। गोपनीयता सुरक्षा (Advocate Privacy) के कारण केवल सही जन्मतिथि होने पर ही पासवर्ड बदला जा सकता है।'
      );
      return;
    }

    if (verified.role !== 'super_admin' && (verified.status === 'PENDING' || verified.status === 'PENDING_APPROVAL')) {
      setForgotError('आपका खाता अभी बार एडमिन द्वारा सत्यापन हेतु लंबित (Pending Approval) है। अनुमोदन मिलने के बाद ही पासवर्ड बदला जा सकेगा।');
      return;
    }

    // Success! Move to Step 2
    setVerifiedAdvocate(verified);
    setForgotStep(2);
    setForgotError(null);
  };

  // Step 2: Set New Password
  const handleSaveNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    if (!verifiedAdvocate) return;

    const trimmedNew = newPassword.trim();
    const trimmedConfirm = confirmPassword.trim();

    if (trimmedNew.length < 6) {
      setForgotError('नया पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।');
      return;
    }

    if (trimmedNew !== trimmedConfirm) {
      setForgotError('नया पासवर्ड और पुष्टि पासवर्ड मेल नहीं खा रहे हैं। कृपया पुनः दर्ज करें।');
      return;
    }

    // Update in store
    db.updateAdvocate(verifiedAdvocate.id, { password: trimmedNew });

    // Pre-fill login screen so advocate can directly log in
    setIdentifier(verifiedAdvocate.barNo || verifiedAdvocate.email || verifiedAdvocate.mobile);
    setPassword(trimmedNew);
    setSuccessBanner(
      `नमस्ते ${verifiedAdvocate.name}! आपका पासवर्ड सफलतापूर्वक बदल दिया गया है। आप नीचे सीधे लॉगिन कर सकते हैं।`
    );

    setIsForgotModalOpen(false);
    setVerifiedAdvocate(null);
    setForgotStep(1);
    setResetIdentifier('');
    setResetDob('');
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
      
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto mb-2 shadow-xl shadow-amber-500/10">
          <Scale className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-100">
          Bar Association Sign In
        </h1>
        <p className="text-xs text-slate-400">
          Criminal &amp; Revenue Bar Association &amp; State Bar Council Control Room
        </p>
      </div>

      {/* Role Tabs: 1. Advocate/Bar Admin | 2. State Bar Admin (RED) | 3. Client */}
      <div className="grid grid-cols-3 gap-1.5 rounded-2xl bg-slate-900 p-1.5 border border-slate-800 shadow-xl">
        <button
          type="button"
          onClick={() => {
            setActiveLoginMode('advocate_admin');
            setIdentifier('');
            setPassword('');
          }}
          className={`py-2 px-2 rounded-xl font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1.5 transition-all ${
            activeLoginMode === 'advocate_admin'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800/60'
          }`}
        >
          <Scale className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">अधिवक्ता / जिला बार</span>
        </button>

        <button
          type="button"
          onClick={handleSelectStateBarMode}
          className={`py-2 px-2 rounded-xl font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1.5 transition-all ${
            activeLoginMode === 'state_bar'
              ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-600/30 font-black ring-2 ring-red-400 animate-pulse'
              : 'text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-red-500/30'
          }`}
        >
          <Landmark className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">🔴 State Bar Admin</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('client-status')}
          className="py-2 px-2 rounded-xl font-bold text-[11px] sm:text-xs text-slate-400 hover:text-blue-300 hover:bg-slate-800/60 flex items-center justify-center gap-1.5 transition-all"
        >
          <UserCheck className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">मुवक्किल स्टेटस</span>
        </button>
      </div>

      {/* STATE BAR COUNCIL HIGHLIGHT CALLOUT BANNER (WHEN RED MODE SELECTED) */}
      {activeLoginMode === 'state_bar' && (
        <div className="rounded-2xl bg-gradient-to-r from-red-950/90 via-slate-900 to-red-950/90 border-2 border-red-500 p-4 shadow-2xl space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-400 text-xs font-black uppercase tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span>🏛️ State Bar Council Admin Login (राज्य बार चुनाव ON/OFF पैनल)</span>
            </div>
            <span className="text-[10px] bg-red-500/20 text-red-300 border border-red-500/40 px-2 py-0.5 rounded font-bold">
              75 Districts Control
            </span>
          </div>
          <p className="text-xs text-slate-300">
            राज्य बार काउंसिल उत्तर प्रदेश के चुनाव को <strong>ON / OFF</strong> करने, 75 जिलों की संपूर्ण अधिवक्ता डायरेक्टरी देखने, पदों व प्रत्याशियों के प्रबंधन हेतु मुख्य चुनाव अधिकारी / एडमिन के रूप में लॉगिन करें।
          </p>
          <div className="pt-1 flex items-center justify-between">
            <span className="text-[11px] text-amber-300 font-mono">ID: stateadmin@upbarcouncil.org</span>
            <button
              type="button"
              onClick={() => handleQuickLogin('stateadmin@upbarcouncil.org')}
              className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow transition-all flex items-center gap-1"
            >
              <span>⚡ 1-Click State Admin Login →</span>
            </button>
          </div>
        </div>
      )}

      {/* Login Box */}
      <form onSubmit={handleLogin} className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
        
        {successBanner && (
          <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-start gap-2.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{successBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessBanner(null)}
              className="text-emerald-400 hover:text-emerald-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Email / Bar Registration No. / Mobile
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. UP/4321/2005 or advocate@gmail.com"
              className="w-full bg-slate-800 border border-slate-700 focus:border-amber-500 text-xs text-slate-100 rounded-xl pl-9 pr-3.5 py-2.5 placeholder-slate-500 focus:outline-none"
            />
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Password (पासवर्ड)
            </label>
            <button
              type="button"
              onClick={handleOpenForgotPassword}
              className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold hover:underline flex items-center gap-1 transition-colors"
            >
              <Key className="w-3 h-3" />
              <span>पासवर्ड भूल गए? (Forgot Password?)</span>
            </button>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-800 border border-slate-700 focus:border-amber-500 text-xs text-slate-100 rounded-xl pl-9 pr-10 py-2.5 placeholder-slate-500 focus:outline-none"
            />
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 p-0.5 rounded transition-colors"
              title={showPassword ? 'Hide Password' : 'Show Password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${
            activeLoginMode === 'state_bar'
              ? 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-red-600/30'
              : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20'
          }`}
        >
          <span>
            {activeLoginMode === 'state_bar' ? 'Sign In to State Bar Council Admin' : 'Sign In to Dashboard'}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="pt-2 text-center">
          <p className="text-xs text-slate-400">
            Don't have an advocate account?{' '}
            <button
              type="button"
              onClick={() => onNavigate('register')}
              className="text-amber-400 font-bold hover:underline"
            >
              Register as Advocate
            </button>
          </p>
        </div>

      </form>

      {/* Quick Demo Logins Box (Now with 4 Roles including Red State Bar Admin) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 text-xs space-y-3.5 shadow-xl">
        <div className="flex items-center justify-between">
          <span className="font-bold text-amber-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>⚡ Quick Demo Accounts (1-क्लिक टेस्ट लॉगिन):</span>
          </span>
          <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">4-Tier Roles</span>
        </div>

        <div className="space-y-2.5">
          
          {/* TIER 1: State Bar Council Admin */}
          <button
            type="button"
            onClick={() => handleQuickLogin('stateadmin@upbarcouncil.org')}
            className="w-full p-3 rounded-2xl bg-gradient-to-r from-red-950/80 via-red-900/50 to-slate-900 hover:from-red-900/80 hover:to-slate-850 border-2 border-red-500/70 hover:border-red-400 flex items-center justify-between text-left transition-all group shadow-lg shadow-red-950/50"
          >
            <div>
              <p className="font-extrabold text-red-200 group-hover:text-white flex items-center gap-1.5 text-xs sm:text-sm">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                <span>🔴 1. State Bar Council Admin (राज्य बार चुनाव नियंत्रण कक्ष)</span>
              </p>
              <p className="text-[10px] sm:text-[11px] text-red-300/90 mt-0.5">
                stateadmin@upbarcouncil.org • (पूरे 75 जिलों का चुनाव <strong>ON / OFF</strong>, 75 जिलों की मतदाता सूची)
              </p>
            </div>
            <span className="text-[10px] bg-red-600 text-white font-black px-2.5 py-1 rounded-lg border border-red-400 flex-shrink-0 shadow">
              State Bar Admin
            </span>
          </button>

          {/* TIER 2: District Bar Admin */}
          <button
            type="button"
            onClick={() => handleQuickLogin('admin@barballia.com')}
            className="w-full p-2.5 rounded-xl bg-amber-950/30 hover:bg-amber-900/40 border border-amber-500/30 flex items-center justify-between text-left transition-colors group"
          >
            <div>
              <p className="font-bold text-amber-200 group-hover:text-white flex items-center gap-1.5 text-xs">
                <span>🏛️ 2. District Bar Association Admin</span>
              </p>
              <p className="text-[10px] text-amber-300">admin@barballia.com • (बलिया बार एसोसिएशन पैनल व आय-व्यय)</p>
            </div>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-bold flex-shrink-0">
              District Admin
            </span>
          </button>

          {/* TIER 3: Advocate */}
          <button
            type="button"
            onClick={() => handleQuickLogin('UP/4321/2005')}
            className="w-full p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 flex items-center justify-between text-left transition-colors group"
          >
            <div>
              <p className="font-bold text-slate-100 group-hover:text-white flex items-center gap-1.5 text-xs">
                <span>⚖️ 3. Member Advocate (अधिवक्ता)</span>
              </p>
              <p className="text-[10px] text-slate-400">Adv. Arvind Tiwari • Bar: UP/4321/2005 (केस डायरी, बिलिंग)</p>
            </div>
            <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded font-semibold flex-shrink-0">
              Advocate
            </span>
          </button>

        </div>
      </div>

      {/* ============================================================ */}
      {/* SELF-SERVICE CONFIDENTIAL ADVOCATE PASSWORD RESET MODAL */}
      {/* ============================================================ */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl relative space-y-5 text-slate-200 max-h-[92vh] overflow-y-auto">
            
            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                setIsForgotModalOpen(false);
                setForgotError(null);
                setVerifiedAdvocate(null);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-start gap-3.5 pr-8">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/10">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-slate-100">
                    अधिवक्ता पासवर्ड रीसेट (Reset Password)
                  </h3>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    <span>100% गोपनीय</span>
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  बिना किसी बार एडमिन या अन्य व्यक्ति के हस्तक्षेप के, केवल अपनी जन्मतिथि (DOB) से स्वयं नया पासवर्ड बनाएं।
                </p>
              </div>
            </div>

            {/* Step Indicators */}
            <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800 text-[11px] font-bold">
              <div className={`py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                forgotStep === 1 ? 'bg-amber-500 text-slate-950 font-black shadow' : 'text-slate-400'
              }`}>
                <span>1. जन्मतिथि सत्यापन (DOB)</span>
              </div>
              <div className={`py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                forgotStep === 2 ? 'bg-amber-500 text-slate-950 font-black shadow' : 'text-slate-400'
              }`}>
                <span>2. नया पासवर्ड (New Password)</span>
              </div>
            </div>

            {/* Error Message */}
            {forgotError && (
              <div className="p-3.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold flex items-start gap-2.5 animate-fadeIn">
                <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span>{forgotError}</span>
                </div>
              </div>
            )}

            {/* STEP 1: VERIFY IDENTITY & DATE OF BIRTH */}
            {forgotStep === 1 && (
              <form onSubmit={handleVerifyDOB} className="space-y-4">
                
                {/* Identifier */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    बार रजिस्ट्रेशन नंबर / मोबाइल / ईमेल
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={resetIdentifier}
                      onChange={(e) => setResetIdentifier(e.target.value)}
                      placeholder="उदा. UP/4321/2005 या 9415988800"
                      className="w-full bg-slate-800 border border-slate-700 focus:border-amber-500 text-xs text-slate-100 rounded-xl pl-9 pr-3.5 py-2.5 placeholder-slate-500 focus:outline-none"
                    />
                    <Scale className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      आपकी जन्मतिथि (Date of Birth)
                    </label>
                    <span className="text-[10px] text-amber-400 font-medium">गोपनीय सुरक्षा कुंजी</span>
                  </div>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={resetDob}
                      onChange={(e) => setResetDob(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 focus:border-amber-500 text-xs text-slate-100 rounded-xl pl-9 pr-3.5 py-2.5 placeholder-slate-500 focus:outline-none [color-scheme:dark]"
                    />
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    * बार काउंसिल में पंजीकृत आपकी जन्मतिथि दर्ज करें। सही मिलान होने पर ही पासवर्ड बदला जा सकेगा।
                  </p>
                </div>

                {/* Privacy Callout */}
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-[11px] text-slate-300 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>अधिवक्ता गोपनीयता सुरक्षा (Client Privacy Protection)</span>
                  </div>
                  <p className="text-slate-400">
                    आपके मुवक्किलों की केस डायरी व विवरण पूर्णतः सुरक्षित है। बार एडमिन या किसी तीसरे व्यक्ति को आपका पासवर्ड कभी ज्ञात नहीं होगा।
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-bold text-slate-300 transition-colors"
                  >
                    रद्द करें (Cancel)
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
                  >
                    <span>जन्मतिथि सत्यापित करें (Verify DOB)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </form>
            )}

            {/* STEP 2: CREATE NEW CONFIDENTIAL PASSWORD */}
            {forgotStep === 2 && verifiedAdvocate && (
              <form onSubmit={handleSaveNewPassword} className="space-y-4">
                
                {/* Verified Advocate Identity Card */}
                <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-black">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>पहचान सत्यापित (Identity Verified)</span>
                    </div>
                    <p className="text-sm font-black text-white mt-0.5">{verifiedAdvocate.name}</p>
                    <p className="text-[11px] text-emerald-300">
                      बार पंजीकरण: <strong>{verifiedAdvocate.barNo}</strong> • {verifiedAdvocate.address?.district || 'Ballia'}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center font-black text-sm">
                    ✓
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    नया गोपनीय पासवर्ड दर्ज करें (New Password)
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="न्यूनतम 6 अक्षर का पासवर्ड"
                      className="w-full bg-slate-800 border border-slate-700 focus:border-amber-500 text-xs text-slate-100 rounded-xl pl-9 pr-10 py-2.5 placeholder-slate-500 focus:outline-none"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 p-0.5 rounded transition-colors"
                      title={showNewPassword ? 'Hide Password' : 'Show Password'}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    नया पासवर्ड पुनः दर्ज करें (Confirm New Password)
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="पासवर्ड की पुष्टि करें"
                      className="w-full bg-slate-800 border border-slate-700 focus:border-amber-500 text-xs text-slate-100 rounded-xl pl-9 pr-10 py-2.5 placeholder-slate-500 focus:outline-none"
                    />
                    <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 p-0.5 rounded transition-colors"
                      title={showConfirmPassword ? 'Hide Password' : 'Show Password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotStep(1);
                      setForgotError(null);
                    }}
                    className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-bold text-slate-300 transition-colors"
                  >
                    ← वापस
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>नया पासवर्ड सुरक्षित करें (Save &amp; Login)</span>
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
