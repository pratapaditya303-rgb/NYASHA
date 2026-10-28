import React, { useState } from 'react';
import {
  Vote,
  CheckCircle2,
  ShieldCheck,
  Award,
  AlertCircle,
  BarChart3,
  Lock,
  Building2,
  Landmark,
  Users,
  Search,
  FileText,
  QrCode,
  Printer,
  BadgeCheck,
  KeyRound,
  ChevronRight,
  RefreshCw,
  Globe,
  MapPin,
  Sparkles,
  ExternalLink,
  HelpCircle
} from 'lucide-react';
import {
  ElectionCandidate,
  Advocate,
  StateBarElectionPost,
  StateBarElectionCandidate,
  StateBarVote,
  StateBarVoterEligibility,
  ALL_UP_DISTRICTS
} from '../types';
import { db } from '../lib/store';

interface ElectionViewProps {
  currentUser: Advocate | null;
  onNavigate: (route: string) => void;
}

export const ElectionView: React.FC<ElectionViewProps> = ({ currentUser, onNavigate }) => {
  // Mode: 'state' (State Bar Council) vs 'district' (District Bar Association)
  const [electionSystemMode, setElectionSystemMode] = useState<'district' | 'state'>('state');

  // =========================================================================
  // 1. DISTRICT BAR ELECTION STATE & HANDLERS (KEPT AS IS)
  // =========================================================================
  const currentTenant = db.getCurrentTenant();
  const [electionPosts, setElectionPosts] = useState(db.getElectionPosts());
  const [candidates, setCandidates] = useState<ElectionCandidate[]>(db.getElectionCandidates());
  const [selectedPost, setSelectedPost] = useState<string>(() => {
    const list = db.getElectionPosts();
    return list.length > 0 ? list[0].key : 'PRESIDENT';
  });
  const [voterBarNo, setVoterBarNo] = useState(currentUser ? currentUser.barNo : '');
  const [votedSuccess, setVotedSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ballot' | 'results'>('ballot');

  const activePostObj = electionPosts.find(p => p.key === selectedPost);
  const seatsCount = activePostObj?.seatsCount || 1;

  const posts = electionPosts.map(p => ({
    key: p.key,
    label: `${p.title} (${p.hindiTitle})`,
    seatsCount: p.seatsCount || 1
  }));

  const filteredCandidates = candidates.filter(c => c.post === selectedPost);
  const totalVotesForPost = filteredCandidates.reduce((sum, c) => sum + c.votesCount, 0);

  const handleCastVote = (candidateId: string) => {
    setErrorMessage(null);
    const barNo = (voterBarNo || '').trim().toUpperCase();

    if (!barNo) {
      setErrorMessage('Please enter your registered District Bar Registration No (e.g. UP/4321/2005) to verify voting eligibility.');
      return;
    }

    const adv = db.getAdvocateByBarNo(barNo);
    if (!adv || adv.status !== 'APPROVED') {
      setErrorMessage(`Bar Registration No "${barNo}" is not verified or approved as an active voting member.`);
      return;
    }

    const success = db.castVote(candidateId, barNo);
    if (success) {
      setCandidates(db.getElectionCandidates());
      setVotedSuccess(`Your ballot for ${selectedPost} has been securely registered in the digital ballot box.`);
      setTimeout(() => setVotedSuccess(null), 4000);
    } else {
      setErrorMessage(`Voter with Bar No "${barNo}" has already cast a vote for this post.`);
    }
  };

  // =========================================================================
  // 2. STATE LEVEL BAR COUNCIL VOTING STATE & HANDLERS
  // =========================================================================
  const stateConfig = db.getStateBarConfig();
  const [statePosts, setStatePosts] = useState<StateBarElectionPost[]>(db.getStateBarElectionPosts());
  const [stateCandidates, setStateCandidates] = useState<StateBarElectionCandidate[]>(db.getStateBarElectionCandidates());
  const [selectedStatePost, setSelectedStatePost] = useState<string>(() => {
    const list = db.getStateBarElectionPosts();
    return list.length > 0 ? list[0].key : 'STATE_CHAIRMAN';
  });

  const [stateActiveTab, setStateActiveTab] = useState<'ballot' | 'results' | 'roll' | 'rules'>('ballot');

  // Voter Credentials for State Voting (State Reg No + COP No)
  const [stateRegNo, setStateRegNo] = useState<string>(() => {
    if (currentUser?.barNo) {
      return currentUser.barNo.startsWith('UP/') ? currentUser.barNo : `UP/${currentUser.barNo}`;
    }
    return '';
  });
  const [stateCopNo, setStateCopNo] = useState<string>(currentUser?.copNo || '');
  const [stateDistrict, setStateDistrict] = useState<string>(() => {
    if (currentUser?.address?.district) {
      const match = ALL_UP_DISTRICTS.find(d => d.toLowerCase().includes(currentUser.address.district.toLowerCase()));
      if (match) return match;
    }
    return 'Ballia (बलिया)';
  });

  const [voterVerified, setVoterVerified] = useState<boolean>(false);
  const [verifiedVoterInfo, setVerifiedVoterInfo] = useState<{ name: string; district: string; copValid: boolean } | null>(null);
  const [stateErrorMessage, setStateErrorMessage] = useState<string | null>(null);
  const [stateVotedSuccess, setStateVotedSuccess] = useState<string | null>(null);
  const [activeReceiptModal, setActiveReceiptModal] = useState<StateBarVote | null>(null);

  // OTP Verification Simulation State
  const [otpModalOpen, setOtpModalOpen] = useState<boolean>(false);
  const [generatedOtp, setGeneratedOtp] = useState<string>('8921');
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [pendingVoteCand, setPendingVoteCand] = useState<StateBarElectionCandidate | null>(null);

  // Roll Search & Filters
  const [rollSearchQuery, setRollSearchQuery] = useState<string>('');
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState<string>('ALL');

  const activeStatePostObj = statePosts.find(p => p.key === selectedStatePost);
  const stateSeatsCount = activeStatePostObj?.seatsCount || 1;

  const filteredStateCandidates = stateCandidates.filter(c => {
    const matchesPost = c.post === selectedStatePost;
    if (!matchesPost) return false;
    if (selectedDistrictFilter === 'ALL') return true;
    return c.districtBar.toLowerCase().includes(selectedDistrictFilter.toLowerCase());
  });

  const totalStateVotesForPost = filteredStateCandidates.reduce((sum, c) => sum + c.votesCount, 0);

  // Fast verify handler
  const handleVerifyVoter = () => {
    setStateErrorMessage(null);
    if (!stateRegNo.trim() || !stateCopNo.trim()) {
      setStateErrorMessage('Please enter both State Bar Registration No (e.g. UP/1084/1990) and COP Number (e.g. COP/UP/1990/1084).');
      return;
    }

    const res = db.verifyStateBarVoter(stateRegNo, stateCopNo, stateDistrict);
    if (res.eligible) {
      setVoterVerified(true);
      setVerifiedVoterInfo({
        name: res.advocateName,
        district: res.districtBar,
        copValid: res.isCopValid
      });
      setStateVotedSuccess(`Advocate Credentials Verified: ${res.advocateName} (${res.districtBar}) • Active COP Authenticated.`);
      setTimeout(() => setStateVotedSuccess(null), 4000);
    } else {
      setVoterVerified(false);
      setVerifiedVoterInfo(null);
      setStateErrorMessage(res.message);
    }
  };

  // Quick fill sample advocate credentials for seamless testing across districts
  const handleQuickFillSample = (reg: string, cop: string, dist: string) => {
    setStateRegNo(reg);
    setStateCopNo(cop);
    setStateDistrict(dist);
    setStateErrorMessage(null);
    const res = db.verifyStateBarVoter(reg, cop, dist);
    if (res.eligible) {
      setVoterVerified(true);
      setVerifiedVoterInfo({
        name: res.advocateName,
        district: res.districtBar,
        copValid: res.isCopValid
      });
    }
  };

  // Initiate Vote
  const handleInitiateStateVote = (cand: StateBarElectionCandidate) => {
    setStateErrorMessage(null);
    if (!stateRegNo.trim() || !stateCopNo.trim()) {
      setStateErrorMessage('Please authenticate your State Bar Registration No. and COP No. first.');
      return;
    }

    // Check if already voted
    if (db.hasVotedStatePost(stateRegNo, stateCopNo, selectedStatePost)) {
      setStateErrorMessage(`You have already cast your ballot for the post of "${activeStatePostObj?.title || selectedStatePost}". One-Voter-One-Vote rule is strictly enforced.`);
      return;
    }

    // Verify voter
    const res = db.verifyStateBarVoter(stateRegNo, stateCopNo, stateDistrict);
    if (!res.eligible) {
      setStateErrorMessage(res.message);
      return;
    }

    // Open security OTP / Confirmation Modal
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(code);
    setEnteredOtp(code); // Pre-fill for smooth instant testing
    setPendingVoteCand(cand);
    setOtpModalOpen(true);
  };

  // Confirm State Vote
  const handleConfirmStateVote = () => {
    if (!pendingVoteCand) return;
    if (enteredOtp !== generatedOtp) {
      setStateErrorMessage('Invalid OTP / Verification PIN entered.');
      return;
    }

    const voterName = verifiedVoterInfo?.name || currentUser?.name || `Adv. Member (${stateRegNo})`;
    const result = db.castStateBarVote({
      candidateId: pendingVoteCand.id,
      postKey: selectedStatePost,
      voterStateRegNo: stateRegNo,
      voterCopNo: stateCopNo,
      voterDistrictBar: stateDistrict,
      voterName
    });

    if (result.success) {
      setStateCandidates(db.getStateBarElectionCandidates());
      setOtpModalOpen(false);
      setPendingVoteCand(null);
      if (result.receipt) {
        setActiveReceiptModal(result.receipt);
      } else {
        setStateVotedSuccess(`Digital Ballot cast successfully for ${pendingVoteCand.name}!`);
        setTimeout(() => setStateVotedSuccess(null), 5000);
      }
    } else {
      setOtpModalOpen(false);
      setStateErrorMessage(result.message);
    }
  };

  // State Voter Roll Filtered list
  const voterRollList = db.getStateBarVoterRoll().filter(v => {
    if (!rollSearchQuery.trim()) return true;
    const q = rollSearchQuery.toLowerCase();
    return (
      v.advocateName.toLowerCase().includes(q) ||
      v.stateRegNo.toLowerCase().includes(q) ||
      v.copNo.toLowerCase().includes(q) ||
      v.districtBar.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* TOP SYSTEM SWITCHER (DISTRICT BAR vs STATE BAR COUNCIL) */}
      <div className="bg-slate-900 border border-slate-800 p-2 sm:p-2.5 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-xs text-slate-300 font-semibold px-2">
          <Vote className="w-4 h-4 text-amber-400" />
          <span>Election Jurisdiction Switcher (चुनाव प्रणाली चयन):</span>
        </div>

        <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
          <button
            onClick={() => setElectionSystemMode('state')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              electionSystemMode === 'state'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20 ring-2 ring-amber-400'
                : 'bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Landmark className="w-4 h-4" />
            <span>State Bar Council (राज्य बार काउंसिल)</span>
            <span className="text-[10px] uppercase tracking-wider font-extrabold bg-slate-950/80 text-amber-300 px-1.5 py-0.5 rounded ml-1">
              75 Districts
            </span>
          </button>

          <button
            onClick={() => setElectionSystemMode('district')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              electionSystemMode === 'district'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20 ring-2 ring-amber-400'
                : 'bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>District Bar Association (जिला बार)</span>
            <span className="text-[10px] uppercase tracking-wider font-extrabold bg-slate-950/80 text-amber-300 px-1.5 py-0.5 rounded ml-1">
              Local Bar
            </span>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 1. STATE BAR COUNCIL E-VOTING SYSTEM PORTAL VIEW */}
      {/* ===================================================================== */}
      {electionSystemMode === 'state' ? (
        <div className="space-y-8">
          
          {/* State Bar Banner */}
          <div className="rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-amber-500/40 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/20 flex-shrink-0">
                  <Landmark className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded border border-amber-500/30">
                      {stateConfig.termYear}
                    </span>
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                      <ShieldCheck className="w-3.5 h-3.5" /> Advocates Act 1961 Statutory Elections
                    </span>
                    <span className="text-xs text-blue-300 font-bold bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      All 75 UP Districts Active
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-100 mt-1.5">
                    {stateConfig.stateBarCouncilName}
                  </h1>
                  <p className="text-xs sm:text-sm text-amber-300/90 font-medium mt-1">
                    State Bar Council General Elections • Universal State-Wide E-Voting Portal for All District Bar Members
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Voters authenticate using their <strong className="text-slate-200">State Bar Registration Number</strong> &amp; <strong className="text-slate-200">COP (Certificate of Practice) Number</strong>.
                  </p>
                </div>
              </div>

              {/* State Tab Switchers */}
              <div className="flex flex-wrap items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-700 shadow-inner">
                <button
                  onClick={() => setStateActiveTab('ballot')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    stateActiveTab === 'ballot'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Vote className="w-3.5 h-3.5" />
                  <span>State Digital Ballot</span>
                </button>

                <button
                  onClick={() => setStateActiveTab('results')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    stateActiveTab === 'results'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>State Results &amp; Districts</span>
                </button>

                <button
                  onClick={() => setStateActiveTab('roll')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    stateActiveTab === 'roll'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>State Voter Roll (मतदाता सूची)</span>
                </button>
              </div>
            </div>
          </div>

          {/* TWO-FACTOR STATE VOTER AUTHENTICATION PANEL */}
          <div className="bg-slate-900 border-2 border-slate-800 hover:border-amber-500/30 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4 transition-all">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                    State Bar Voter Two-Factor Authentication (मतदाता सत्यापन)
                    {voterVerified && (
                      <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <BadgeCheck className="w-3 h-3" /> Certified Active Voter
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Verify using your State Bar Council Registration / Enrollment No. and Certificate of Practice (COP) No.
                  </p>
                </div>
              </div>

              {/* Sample Quick-fill for Demo/Testing */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400">Quick Test Profile:</span>
                <select
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'ballia_op') handleQuickFillSample('UP/1084/1990', 'COP/UP/1990/1084', 'Ballia (बलिया)');
                    if (val === 'ballia_arvind') handleQuickFillSample('UP/4321/2005', 'COP/UP/2005/4321', 'Ballia (बलिया)');
                    if (val === 'prayagraj_dr') handleQuickFillSample('UP/3412/1992', 'COP/UP/1992/3412', 'Prayagraj / Allahabad (प्रयागराज)');
                    if (val === 'lucknow_sunita') handleQuickFillSample('UP/4421/1998', 'COP/UP/1998/4421', 'Lucknow (लखनऊ)');
                    if (val === 'varanasi_vikram') handleQuickFillSample('UP/5610/2001', 'COP/UP/2001/5610', 'Varanasi (वाराणसी)');
                    if (val === 'gorakhpur_mahendra') handleQuickFillSample('UP/7820/2003', 'COP/UP/2003/7820', 'Gorakhpur (गोरखपुर)');
                    if (val === 'kanpur_rajeshwar') handleQuickFillSample('UP/2190/1988', 'COP/UP/1988/2190', 'Kanpur Nagar (कानपुर नगर)');
                    if (val === 'agra_tariq') handleQuickFillSample('UP/6710/1995', 'COP/UP/1995/6710', 'Agra (आगरा)');
                    if (val === 'meerut_rituraj') handleQuickFillSample('UP/9912/2004', 'COP/UP/2004/9912', 'Meerut (मेरठ)');
                  }}
                  className="bg-slate-950 border border-slate-700 text-amber-300 text-[11px] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
                >
                  <option value="">Select District Bar Advocate Demo...</option>
                  <option value="ballia_op">Ballia Bar - Adv. Shri O. P. Singh (UP/1084/1990)</option>
                  <option value="ballia_arvind">Ballia Bar - Adv. Arvind Tiwari (UP/4321/2005)</option>
                  <option value="prayagraj_dr">Prayagraj / HC Bar - Dr. D. P. Singh (UP/3412/1992)</option>
                  <option value="lucknow_sunita">Lucknow Bar - Smt. Sunita Srivastava (UP/4421/1998)</option>
                  <option value="varanasi_vikram">Varanasi Central Bar - Adv. Vikramaditya Shukla (UP/5610/2001)</option>
                  <option value="gorakhpur_mahendra">Gorakhpur Bar - Adv. Mahendra Singh (UP/7820/2003)</option>
                  <option value="kanpur_rajeshwar">Kanpur Bar - Dr. Rajeshwar Mishra (UP/2190/1988)</option>
                  <option value="agra_tariq">Agra Bar - Adv. Tariq Anwar Khan (UP/6710/1995)</option>
                  <option value="meerut_rituraj">Meerut Bar - Adv. Ritu Raj Sharma (UP/9912/2004)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Field 1: State Registration No */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1">
                  <span>State Bar Council Reg / Enrollment No *</span>
                </label>
                <input
                  type="text"
                  value={stateRegNo}
                  onChange={(e) => {
                    setStateRegNo(e.target.value);
                    setVoterVerified(false);
                  }}
                  placeholder="e.g. UP/1084/1990"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono uppercase focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Field 2: COP No */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1">
                  <span>COP (Certificate of Practice) No *</span>
                </label>
                <input
                  type="text"
                  value={stateCopNo}
                  onChange={(e) => {
                    setStateCopNo(e.target.value);
                    setVoterVerified(false);
                  }}
                  placeholder="e.g. COP/UP/1990/1084"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono uppercase focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Field 3: District Bar Association */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>Your District Bar Association *</span>
                </label>
                <select
                  value={stateDistrict}
                  onChange={(e) => {
                    setStateDistrict(e.target.value);
                    setVoterVerified(false);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  {ALL_UP_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Verify Button */}
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleVerifyVoter}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Credentials (सत्यापित करें)</span>
                </button>
              </div>
            </div>

            {/* Verified Details Card */}
            {verifiedVoterInfo && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <div>
                    <span className="text-emerald-300 font-bold">
                      Authenticated: {verifiedVoterInfo.name}
                    </span>
                    <span className="text-slate-400 text-[11px] ml-2 font-mono">
                      (State Reg: {stateRegNo} • COP: {stateCopNo})
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[11px] font-bold border border-emerald-500/40">
                    {verifiedVoterInfo.district}
                  </span>
                  <span className="text-[11px] text-slate-300 font-medium">
                    Eligible to vote in all State Council Posts
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Feedback Alerts */}
          {stateConfig.status !== 'VotingOpen' && (
            <div className="p-4 rounded-xl bg-amber-500/15 border-2 border-amber-500/40 text-amber-200 text-xs font-semibold flex items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <div>
                  <span className="font-bold text-amber-300">
                    State Bar Council E-Voting Notice:
                  </span>
                  <span className="ml-1 text-slate-200">
                    {stateConfig.status === 'Closed' && 'Electronic voting is currently CLOSED / PAUSED (मतदान बंद है). You can explore live tallies in the Results tab.'}
                    {stateConfig.status === 'NominationOpen' && 'Candidate Nominations are currently OPEN. Electronic Voting will commence shortly.'}
                    {stateConfig.status === 'Upcoming' && 'State Bar Council elections are scheduled. Voting portal is in preview mode.'}
                    {stateConfig.status === 'ResultDeclared' && 'State Bar Council General Election Results have been declared officially.'}
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 font-extrabold text-[10px] uppercase tracking-wider text-amber-400 border border-amber-500/30 whitespace-nowrap">
                Status: {stateConfig.status}
              </span>
            </div>
          )}

          {stateVotedSuccess && (
            <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-lg">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>{stateVotedSuccess}</span>
            </div>
          )}

          {stateErrorMessage && (
            <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold flex items-center gap-2 shadow-lg">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span>{stateErrorMessage}</span>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 1: STATE DIGITAL BALLOT */}
          {/* ================================================================= */}
          {stateActiveTab === 'ballot' && (
            <div className="space-y-6">
              {/* Post Tabs */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Vote className="w-4 h-4 text-amber-400" />
                    Select State Bar Council Post (पद चुनें):
                  </span>
                  <span className="text-[11px] text-amber-400 font-bold">
                    {statePosts.length} State Council Posts Active
                  </span>
                </div>

                <div className="flex items-center gap-2.5 overflow-x-auto pb-2">
                  {statePosts.map((p) => {
                    const isVoted = stateRegNo && stateCopNo ? db.hasVotedStatePost(stateRegNo, stateCopNo, p.key) : false;
                    return (
                      <button
                        key={p.key}
                        onClick={() => {
                          setSelectedStatePost(p.key);
                          setStateErrorMessage(null);
                        }}
                        className={`text-xs px-4 py-3 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-2.5 ${
                          selectedStatePost === p.key
                            ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 ring-1 ring-amber-400'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                        }`}
                      >
                        <span>{p.title} ({p.hindiTitle})</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-extrabold ${
                          selectedStatePost === p.key ? 'bg-slate-950 text-amber-300' : 'bg-slate-800 text-amber-400'
                        }`}>
                          {p.seatsCount} {p.seatsCount > 1 ? 'Seats' : 'Seat'}
                        </span>
                        {isVoted && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-extrabold flex items-center gap-0.5 ${
                            selectedStatePost === p.key ? 'bg-emerald-950 text-emerald-300' : 'bg-emerald-500/20 text-emerald-300'
                          }`}>
                            <CheckCircle2 className="w-3 h-3" /> Voted
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Active Post Banner */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-400 text-sm">
                      {activeStatePostObj?.title} ({activeStatePostObj?.hindiTitle})
                    </span>
                    {activeStatePostObj?.description && (
                      <span className="text-slate-400 hidden sm:inline">• {activeStatePostObj.description}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Total Council Seats:</span>
                      <span className="font-extrabold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/40">
                        {stateSeatsCount} {stateSeatsCount > 1 ? 'Seats (स्थान)' : 'Seat (स्थान)'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* District Filter for Candidates */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  Nominated State Candidates for <strong className="text-amber-400">{activeStatePostObj?.title}</strong> ({filteredStateCandidates.length} Nominees)
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-[11px]">Filter by District:</span>
                  <select
                    value={selectedDistrictFilter}
                    onChange={(e) => setSelectedDistrictFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 text-[11px] focus:outline-none focus:border-amber-500"
                  >
                    <option value="ALL">All UP Districts</option>
                    <option value="Ballia">Ballia (बलिया)</option>
                    <option value="Prayagraj">Prayagraj / Allahabad (प्रयागराज)</option>
                    <option value="Lucknow">Lucknow (लखनऊ)</option>
                    <option value="Varanasi">Varanasi (वाराणसी)</option>
                    <option value="Gorakhpur">Gorakhpur (गोरखपुर)</option>
                    <option value="Kanpur">Kanpur (कानपुर)</option>
                    <option value="Agra">Agra (आगरा)</option>
                    <option value="Meerut">Meerut (मेरठ)</option>
                    <option value="Ghazipur">Ghazipur (गाजीपुर)</option>
                    <option value="Mau">Mau (मऊ)</option>
                    <option value="Deoria">Deoria (देवरिया)</option>
                    <option value="Azamgarh">Azamgarh (आजमगढ़)</option>
                    <option value="Ayodhya">Ayodhya (अयोध्या)</option>
                  </select>
                </div>
              </div>

              {/* STATE CANDIDATES GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredStateCandidates.map((cand) => {
                  const hasVotedForPost = stateRegNo && stateCopNo ? db.hasVotedStatePost(stateRegNo, stateCopNo, selectedStatePost) : false;
                  return (
                    <div
                      key={cand.id}
                      className="rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 p-6 shadow-xl transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3.5">
                        <div className="flex items-start gap-4">
                          <img
                            src={cand.photoUrl}
                            alt={cand.name}
                            className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-500/40 shadow-md flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 mb-1">
                              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                {cand.districtBar}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                                {cand.standingYears} Yrs Standing
                              </span>
                            </div>

                            <h3 className="font-bold text-base sm:text-lg text-slate-100">{cand.name}</h3>
                            {cand.hindiName && (
                              <p className="text-xs text-amber-300 font-semibold">{cand.hindiName}</p>
                            )}
                            {cand.designation && (
                              <p className="text-[11px] text-slate-400 mt-0.5">{cand.designation}</p>
                            )}

                            <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 font-mono mt-1.5">
                              <span>State Reg: <strong className="text-slate-200">{cand.stateRegNo}</strong></span>
                              <span>•</span>
                              <span>COP: <strong className="text-slate-200">{cand.copNo}</strong></span>
                            </div>
                          </div>
                        </div>

                        {/* Manifesto Agenda */}
                        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
                          <p className="font-bold text-amber-300 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            State Election Manifesto &amp; Key Agenda (घोषणा पत्र):
                          </p>
                          <p className="italic leading-relaxed text-slate-300 text-[11px]">
                            "{cand.agenda}"
                          </p>
                        </div>
                      </div>

                      {/* Vote Action Bar */}
                      <div className="pt-3.5 border-t border-slate-800 flex items-center justify-between">
                        <div className="text-xs">
                          <span className="text-slate-400 block text-[11px]">Current State Tally:</span>
                          <span className="font-extrabold text-amber-400 text-sm">
                            {cand.votesCount} <span className="text-xs font-normal text-slate-400">Votes Polled</span>
                          </span>
                        </div>

                        {hasVotedForPost ? (
                          <div className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Ballot Already Cast</span>
                          </div>
                        ) : stateConfig.status !== 'VotingOpen' ? (
                          <div className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 text-xs font-semibold flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-slate-500" />
                            <span>Voting Closed (बंद)</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleInitiateStateVote(cand)}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 transform hover:scale-105 cursor-pointer"
                          >
                            <Vote className="w-4 h-4" />
                            <span>Cast State Ballot</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 2: STATE RESULTS & DISTRICT WISE BREAKDOWN */}
          {/* ================================================================= */}
          {stateActiveTab === 'results' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-amber-400" />
                      State Bar Council Live Results Tally ({activeStatePostObj?.title})
                    </h3>
                    <p className="text-xs text-slate-400">
                      Total Valid Electronic Ballots Cast State-Wide: <strong className="text-amber-400">{totalStateVotesForPost}</strong> across 75 District Bar Associations
                    </p>
                  </div>

                  {/* Post Switcher for Results */}
                  <select
                    value={selectedStatePost}
                    onChange={(e) => setSelectedStatePost(e.target.value)}
                    className="bg-slate-950 border border-slate-700 text-amber-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
                  >
                    {statePosts.map(p => (
                      <option key={p.key} value={p.key}>
                        {p.title} ({p.hindiTitle}) - {p.seatsCount} Seats
                      </option>
                    ))}
                  </select>
                </div>

                {/* Candidate Vote Tallies */}
                <div className="space-y-5">
                  {[...filteredStateCandidates]
                    .sort((a, b) => b.votesCount - a.votesCount)
                    .map((cand, idx) => {
                      const percentage = totalStateVotesForPost > 0 ? Math.round((cand.votesCount / totalStateVotesForPost) * 100) : 0;
                      const isLeading = idx < stateSeatsCount && cand.votesCount > 0;
                      return (
                        <div
                          key={cand.id}
                          className={`space-y-3 p-4 rounded-xl transition-all ${
                            isLeading ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-slate-950/40 border border-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[11px] font-bold ${
                                isLeading ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                              }`}>
                                #{idx + 1}
                              </span>
                              <img
                                src={cand.photoUrl}
                                alt={cand.name}
                                className="w-10 h-10 rounded-xl object-cover border border-amber-500/30"
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-sm text-slate-100">{cand.name}</span>
                                  {isLeading && (
                                    <span className="text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
                                      Leading (अग्रणी)
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                  <span>{cand.districtBar}</span>
                                  <span>•</span>
                                  <span className="font-mono">{cand.stateRegNo}</span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="font-extrabold text-amber-400 text-base">{cand.votesCount} Votes</span>
                              <span className="text-xs text-slate-400 block font-semibold">{percentage}% of Polled Ballots</span>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700">
                            <div
                              className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>

                          {/* District-wise Breakdown Pills */}
                          {cand.districtVoteBreakdown && Object.keys(cand.districtVoteBreakdown).length > 0 && (
                            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-[11px]">
                              <span className="text-slate-400 font-semibold">District Breakdown:</span>
                              {Object.entries(cand.districtVoteBreakdown).map(([dist, vCount]) => (
                                <span
                                  key={dist}
                                  className="bg-slate-900 border border-slate-700/80 text-slate-300 px-2 py-0.5 rounded-lg text-[10px]"
                                >
                                  {dist.split(' ')[0]}: <strong className="text-amber-400">{vCount}</strong>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 3: STATE VOTER ROLL (ROLL OF ADVOCATES) */}
          {/* ================================================================= */}
          {stateActiveTab === 'roll' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                      <Users className="w-5 h-5 text-amber-400" />
                      State Bar Council Voter Roll &amp; Roll of Advocates (राज्य अधिवक्ता मतदाता सूची)
                    </h3>
                    <p className="text-xs text-slate-400">
                      Search eligible legal practitioners across all 75 District Bar Associations verified under Advocates Act 1961
                    </p>
                  </div>

                  {/* Search Bar */}
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={rollSearchQuery}
                      onChange={(e) => setRollSearchQuery(e.target.value)}
                      placeholder="Search Name, Reg No, COP, District..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300 border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 text-[11px] uppercase tracking-wider">
                        <th className="py-3 px-3.5">#</th>
                        <th className="py-3 px-3.5">Advocate Name</th>
                        <th className="py-3 px-3.5">State Bar Reg No</th>
                        <th className="py-3 px-3.5">COP Number</th>
                        <th className="py-3 px-3.5">District Bar</th>
                        <th className="py-3 px-3.5">COP Status</th>
                        <th className="py-3 px-3.5">Voting Eligibility</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {voterRollList.map((v, i) => (
                        <tr key={v.stateRegNo + i} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-3.5 font-mono text-slate-500">{i + 1}</td>
                          <td className="py-3 px-3.5 font-bold text-slate-100">{v.advocateName}</td>
                          <td className="py-3 px-3.5 font-mono text-amber-300">{v.stateRegNo}</td>
                          <td className="py-3 px-3.5 font-mono text-blue-300">{v.copNo}</td>
                          <td className="py-3 px-3.5 text-slate-300">{v.districtBar}</td>
                          <td className="py-3 px-3.5">
                            <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40">
                              Active &amp; Valid
                            </span>
                          </td>
                          <td className="py-3 px-3.5">
                            <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40 flex items-center gap-1 w-fit">
                              <CheckCircle2 className="w-3 h-3" /> Eligible
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      ) : (
        /* ===================================================================== */
        /* 2. DISTRICT BAR ASSOCIATION ELECTIONS (ORIGINAL - KEPT AS IS)        */
        /* ===================================================================== */
        <div className="space-y-8">
          
          {/* Header Banner */}
          <div className="rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-amber-500/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
                  <Vote className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded border border-amber-500/30">
                      Annual Bar Elections 2026-2027
                    </span>
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Certified One-Member-One-Vote
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-100 mt-1">
                    {currentTenant.name} Election Portal
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Official democratic voting platform under the supervision of the Chief Election Officer, {currentTenant.shortName || 'Ballia Bar'}
                  </p>
                </div>
              </div>

              {/* View Toggle Tabs */}
              <div className="flex items-center gap-2 bg-slate-900/90 p-1 rounded-xl border border-slate-700">
                <button
                  onClick={() => setActiveTab('ballot')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'ballot'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Cast Digital Ballot
                </button>
                <button
                  onClick={() => setActiveTab('results')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'results'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Live Result Tally
                </button>
              </div>
            </div>
          </div>

          {/* Post Selector Tabs */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {posts.map((p) => (
                <button
                  key={p.key}
                  onClick={() => {
                    setSelectedPost(p.key);
                    setErrorMessage(null);
                  }}
                  className={`text-xs px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                    selectedPost === p.key
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  <span>{p.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-extrabold ${
                    selectedPost === p.key ? 'bg-slate-950 text-amber-300' : 'bg-slate-800 text-amber-400'
                  }`}>
                    {p.seatsCount} {p.seatsCount > 1 ? 'पद' : 'पद'}
                  </span>
                </button>
              ))}
            </div>

            {/* Post Info Bar */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-400">{activePostObj?.title} ({activePostObj?.hindiTitle})</span>
                {activePostObj?.description && (
                  <span className="text-slate-400 hidden sm:inline">• {activePostObj.description}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">कुल पद संख्या (Total Available Seats):</span>
                <span className="font-extrabold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/40">
                  {seatsCount} {seatsCount > 1 ? 'Seats / पद' : 'Seat / पद'}
                </span>
              </div>
            </div>
          </div>

          {/* Voter Authentication Box (for Ballot Mode) */}
          {activeTab === 'ballot' && (
            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Lock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Voter Authentication: Enter your enrolled Bar Registration No before voting:</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={voterBarNo}
                  onChange={(e) => setVoterBarNo(e.target.value)}
                  placeholder="e.g. UP/4321/2005"
                  className="bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 font-mono uppercase focus:outline-none focus:border-amber-500 w-44"
                />
                {currentUser && (
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded">
                    Logged in
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Alerts */}
          {votedSuccess && (
            <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{votedSuccess}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* CANDIDATES LIST */}
          {activeTab === 'ballot' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCandidates.map((cand) => (
                <div
                  key={cand.id}
                  className="rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 p-6 shadow-xl transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <img
                        src={cand.photoUrl}
                        alt={cand.name}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/40 shadow"
                      />
                      <div>
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          Candidate for {cand.post}
                        </span>
                        <h3 className="font-bold text-base text-slate-100 mt-1">{cand.name}</h3>
                        <p className="text-xs text-slate-400 font-mono">Bar Reg: {cand.barNo}</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                      <p className="font-semibold text-amber-300 mb-1">Key Agenda / घोषणा पत्र:</p>
                      <p className="italic leading-relaxed">"{cand.agenda}"</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">
                      Current Tally: <strong className="text-amber-400">{cand.votesCount}</strong> Votes
                    </span>

                    <button
                      onClick={() => handleCastVote(cand.id)}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 transform hover:scale-105"
                    >
                      <Vote className="w-4 h-4" />
                      <span>Vote for {cand.name.split(' ')[1] || cand.name}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* LIVE RESULTS TAB */
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-amber-400" />
                      Live Voting Percentage &amp; Vote Count ({selectedPost})
                    </h3>
                    <p className="text-xs text-slate-400">Total Valid Votes Polled: {totalVotesForPost}</p>
                  </div>
                </div>

                <div className="space-y-5">
                  {[...filteredCandidates]
                    .sort((a, b) => b.votesCount - a.votesCount)
                    .map((cand, idx) => {
                      const percentage = totalVotesForPost > 0 ? Math.round((cand.votesCount / totalVotesForPost) * 100) : 0;
                      const isLeading = idx < seatsCount && cand.votesCount > 0;
                      return (
                        <div key={cand.id} className={`space-y-2 p-3 rounded-xl transition-all ${
                          isLeading ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-slate-950/40 border border-slate-800'
                        }`}>
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2.5">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold ${
                                isLeading ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                              }`}>
                                #{idx + 1}
                              </span>
                              <img src={cand.photoUrl} alt={cand.name} className="w-8 h-8 rounded-lg object-cover border border-amber-500/30" />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-100">{cand.name}</span>
                                  {isLeading && (
                                    <span className="text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30">
                                      Leading (अग्रणी)
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-400 block">{cand.barNo}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-extrabold text-amber-400 text-sm">{cand.votesCount} Votes</span>
                              <span className="text-xs text-slate-400 block font-semibold">{percentage}%</span>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full bg-slate-800 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-700">
                            <div
                              className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 1: OTP & DIGITAL BALLOT CONFIRMATION MODAL                      */}
      {/* ===================================================================== */}
      {otpModalOpen && pendingVoteCand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border-2 border-amber-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-slate-100">Confirm Digital State Ballot</h3>
              </div>
              <button
                onClick={() => {
                  setOtpModalOpen(false);
                  setPendingVoteCand(null);
                }}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center gap-3">
                <img
                  src={pendingVoteCand.photoUrl}
                  alt={pendingVoteCand.name}
                  className="w-12 h-12 rounded-xl object-cover border border-amber-500/40"
                />
                <div>
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                    {activeStatePostObj?.title}
                  </span>
                  <h4 className="font-bold text-sm text-slate-100 mt-0.5">{pendingVoteCand.name}</h4>
                  <p className="text-[11px] text-slate-400">{pendingVoteCand.districtBar}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-center justify-between">
                <span>Voter Authorization OTP (Simulated):</span>
                <span className="font-mono text-sm font-extrabold bg-slate-950 px-2.5 py-1 rounded text-amber-400 border border-amber-500/40">
                  {generatedOtp}
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Enter 4-Digit Security PIN / OTP
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-center font-mono text-base font-bold text-slate-100 tracking-widest focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="text-[11px] text-slate-400 space-y-1">
                <p>• Voter: <strong className="text-slate-200">{verifiedVoterInfo?.name || stateRegNo}</strong></p>
                <p>• State Reg: <strong className="text-slate-200">{stateRegNo}</strong> | COP: <strong className="text-slate-200">{stateCopNo}</strong></p>
                <p>• District: <strong className="text-slate-200">{stateDistrict}</strong></p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setOtpModalOpen(false);
                  setPendingVoteCand(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmStateVote}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20"
              >
                Confirm &amp; Cast Ballot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: VERIFIABLE DIGITAL STATE BALLOT RECEIPT                      */}
      {/* ===================================================================== */}
      {activeReceiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <BadgeCheck className="w-6 h-6" />
                <h3 className="font-bold text-base text-slate-100">Digital State Ballot Slip (मतदान पर्ची)</h3>
              </div>
              <button
                onClick={() => setActiveReceiptModal(null)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            {/* Printable Slip Body */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 text-xs font-sans text-slate-200">
              <div className="text-center border-b border-slate-800 pb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Bar Council of Uttar Pradesh
                </span>
                <h4 className="font-extrabold text-sm text-slate-100 mt-1">Official E-Voting Ballot Receipt</h4>
                <p className="text-[10px] text-slate-400">Advocates Act 1961 • Secure Cryptographic Vault</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div>
                  <span className="text-slate-500 block text-[10px]">Voter Name:</span>
                  <span className="font-bold text-slate-100">{activeReceiptModal.voterName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">District Bar:</span>
                  <span className="font-bold text-slate-100">{activeReceiptModal.voterDistrictBar}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">State Reg No:</span>
                  <span className="font-mono text-amber-300 font-bold">{activeReceiptModal.voterStateRegNo}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">COP Number:</span>
                  <span className="font-mono text-blue-300 font-bold">{activeReceiptModal.voterCopNo}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Elected Post:</span>
                  <span className="font-bold text-slate-200">{activeReceiptModal.postKey}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Vote Cast For:</span>
                  <span className="font-bold text-emerald-300">{activeReceiptModal.candidateName}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block">Cryptographic Ballot Hash:</span>
                  <span className="font-mono text-xs font-bold text-amber-400">
                    {activeReceiptModal.ballotHash}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">{activeReceiptModal.timestamp}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-300">
                  <QrCode className="w-8 h-8 text-amber-400" />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>Print Digital Slip</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveReceiptModal(null);
                  setStateVotedSuccess('Your state vote has been recorded. You can view real-time tally in the Results tab.');
                  setTimeout(() => setStateVotedSuccess(null), 5000);
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
