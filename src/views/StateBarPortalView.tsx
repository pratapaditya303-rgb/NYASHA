import React, { useState, useEffect } from 'react';
import {
  Landmark,
  ShieldCheck,
  Users,
  Vote,
  UserPlus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  PauseCircle,
  RefreshCw,
  Plus,
  Crown,
  Printer,
  Download,
  KeyRound,
  SlidersHorizontal,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Check,
  Eye,
  FileText,
  BadgeCheck,
  HelpCircle,
  Lock,
  Scale,
  Bell
} from 'lucide-react';
import {
  StateBarElectionConfig,
  StateBarElectionPost,
  StateBarElectionCandidate,
  StateBarVoterEligibility,
  Advocate
} from '../types';
import { db } from '../lib/store';

interface StateBarPortalViewProps {
  currentUser: Advocate | null;
  onNavigate: (route: string) => void;
  onLogout?: () => void;
}

const UP_75_DISTRICTS = [
  'Ballia (बलिया)',
  'Prayagraj / Allahabad (प्रयागराज)',
  'Lucknow (लखनऊ)',
  'Varanasi (वाराणसी)',
  'Gorakhpur (गोरखपुर)',
  'Azamgarh (आजमगढ़)',
  'Mau (मऊ)',
  'Ghazipur (गाजीपुर)',
  'Jaunpur (जौनपुर)',
  'Deoria (देवरिया)',
  'Kushinagar (कुशीनगर)',
  'Maharajganj (महराजगंज)',
  'Basti (बस्ती)',
  'Sant Kabir Nagar (संत कबीर नगर)',
  'Siddharthnagar (सिद्धार्थनगर)',
  'Ayodhya / Faizabad (अयोध्या)',
  'Ambedkar Nagar (अम्बेडकर नगर)',
  'Sultanpur (सुल्तानपुर)',
  'Amethi (अमेठी)',
  'Pratapgarh (प्रतापगढ़)',
  'Mirzapur (मिर्ज़ापुर)',
  'Sonbhadra (सोनभद्र)',
  'Bhadohi (भदोही)',
  'Kanpur Nagar (कानपुर नगर)',
  'Kanpur Dehat (कानपुर देहात)',
  'Fatehpur (फतेहपुर)',
  'Kaushambi (कौशाम्बी)',
  'Agra (आगरा)',
  'Mathura (मथुरा)',
  'Firozabad (फिरोजाबाद)',
  'Mainpuri (मैनपुरी)',
  'Aligarh (अलीगढ़)',
  'Hathras (हाथरस)',
  'Etah (एटा)',
  'Kasganj (कासगंज)',
  'Bareilly (बरेली)',
  'Budaun (बदायूँ)',
  'Pilibhit (पीलीभीत)',
  'Shahjahanpur (शाहजहाँपुर)',
  'Moradabad (मुरादाबाद)',
  'Bijnor (बिजनौर)',
  'Rampur (रामपुर)',
  'Amroha (अमरोहा)',
  'Sambhal (सम्भल)',
  'Meerut (मेरठ)',
  'Bulandshahr (बुलन्दशहर)',
  'Gautam Buddha Nagar / Noida (गौतम बुद्ध नगर)',
  'Ghaziabad (गाजियाबाद)',
  'Hapur (हापुड़)',
  'Baghpat (बागपत)',
  'Saharanpur (सहारनपुर)',
  'Muzaffarnagar (मुजफ्फरनगर)',
  'Shamli (शामली)',
  'Jhansi (झांसी)',
  'Lalitpur (ललितपुर)',
  'Jalaun (जालौन)',
  'Banda (बांदा)',
  'Chitrakoot (चित्रकूट)',
  'Hamirpur (हमीरपुर)',
  'Mahoba (महोबा)',
  'Hardoi (हरदोई)',
  'Lakhimpur Kheri (लखीमपुर खीरी)',
  'Raebareli (रायबरेली)',
  'Sitapur (सीतापुर)',
  'Unnao (उन्नाव)',
  'Barabanki (बाराबंकी)',
  'Bahraich (बहराइच)',
  'Shravasti (श्रावस्ती)',
  'Balrampur (बलरामपुर)',
  'Gonda (गोंडा)',
  'Farrukhabad (फर्रुखाबाद)',
  'Kannauj (कन्नौज)',
  'Etawah (इटावा)',
  'Auraiya (औरैया)'
];

export const StateBarPortalView: React.FC<StateBarPortalViewProps> = ({
  currentUser,
  onNavigate,
  onLogout
}) => {
  // Access Control: Only State Bar Apex Super Admin (role === 'state_bar_admin') can perform state administrative actions
  const isStateBarAdmin = currentUser?.role === 'state_bar_admin';

  // Navigation Tabs: 'enrollment' | 'directory' | 'election' | 'governance' | 'broadcast'
  const [activeTab, setActiveTab] = useState<'directory' | 'enrollment' | 'election' | 'governance' | 'broadcast'>('directory');

  // State Bar Broadcast Notice Form State
  const [sbNotifTitle, setSbNotifTitle] = useState('');
  const [sbNotifMessage, setSbNotifMessage] = useState('');
  const [sbTargetDistrict, setSbTargetDistrict] = useState('ALL');
  const [sbNotifSuccess, setSbNotifSuccess] = useState(false);

  // State Data
  const [electionConfig, setElectionConfig] = useState<StateBarElectionConfig>(db.getStateBarElectionConfig());
  const [voterRoll, setVoterRoll] = useState<StateBarVoterEligibility[]>(db.getStateBarVoterRoll());
  const [electionPosts, setElectionPosts] = useState<StateBarElectionPost[]>(db.getStateBarElectionPosts());
  const [candidates, setCandidates] = useState<StateBarElectionCandidate[]>(db.getStateBarElectionCandidates());
  const [stats, setStats] = useState(db.getStateBarElectionStats());

  const refreshData = () => {
    setElectionConfig(db.getStateBarElectionConfig());
    setVoterRoll(db.getStateBarVoterRoll());
    setElectionPosts(db.getStateBarElectionPosts());
    setCandidates(db.getStateBarElectionCandidates());
    setStats(db.getStateBarElectionStats());
  };

  React.useEffect(() => {
    const handleSync = () => {
      refreshData();
    };
    window.addEventListener('crba_state_updated', handleSync);
    const interval = setInterval(refreshData, 2000);
    return () => {
      window.removeEventListener('crba_state_updated', handleSync);
      clearInterval(interval);
    };
  }, []);

  // Search & Filters for 75 Districts Directory
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'HOLD' | 'SUSPENDED'>('ALL');
  const [votingFilter, setVotingFilter] = useState<'ALL' | 'VOTED' | 'PENDING'>('ALL');

  // New Enrollment Form State
  const [enrollForm, setEnrollForm] = useState({
    advocateName: '',
    hindiName: '',
    fatherName: '',
    dob: '10/05/1992',
    stateRegNo: '',
    copNo: '',
    districtBar: 'Ballia (बलिया)',
    tahsil: 'Ballia Sadar',
    mobile: '',
    email: '',
    chamberNo: 'Chamber 14, Bar Hall',
    experienceYears: 5,
    specializations: ['CRIMINAL', 'CIVIL']
  });
  const [enrollSuccessModal, setEnrollSuccessModal] = useState<{
    open: boolean;
    advocateName: string;
    stateRegNo: string;
    copNo: string;
    districtBar: string;
  } | null>(null);

  // New Post Creation Modal State
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [postForm, setPostForm] = useState({
    key: '',
    title: '',
    hindiTitle: '',
    description: '',
    seatsCount: 1,
    category: 'Apex' as 'Apex' | 'Council' | 'Welfare' | 'Disciplinary'
  });

  // Candidate Nomination Modal State
  const [isNominateModalOpen, setIsNominateModalOpen] = useState(false);
  const [candidateForm, setCandidateForm] = useState({
    name: '',
    hindiName: '',
    stateRegNo: '',
    copNo: '',
    districtBar: 'Ballia (बलिया)',
    postKey: '',
    standingYears: 15,
    agenda: '',
    photoUrl: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&auto=format&fit=crop&q=80'
  });

  // Search Roll Verifier Tool
  const [verifySearchQuery, setVerifySearchQuery] = useState('');
  const [verifiedResult, setVerifiedResult] = useState<StateBarVoterEligibility | null>(null);
  const [hasSearchedVerify, setHasSearchedVerify] = useState(false);

  // Feedback Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const reloadData = () => {
    setElectionConfig(db.getStateBarElectionConfig());
    setVoterRoll(db.getStateBarVoterRoll());
    setElectionPosts(db.getStateBarElectionPosts());
    setCandidates(db.getStateBarElectionCandidates());
    setStats(db.getStateBarElectionStats());
  };

  useEffect(() => {
    reloadData();
    const handleCloudSync = (e: Event) => {
      const customEvt = e as CustomEvent<{ key?: string }>;
      if (!customEvt.detail || customEvt.detail.key === 'CLOUD_SYNC') {
        reloadData();
      }
    };
    window.addEventListener('crba_state_updated', handleCloudSync);
    return () => window.removeEventListener('crba_state_updated', handleCloudSync);
  }, []);

  // Update Status for Individual Member (Active, Hold, Suspended)
  const handleUpdateMemberStatus = (stateRegNo: string, newStatus: 'ACTIVE' | 'HOLD' | 'SUSPENDED') => {
    db.setAdvocateStatusByStateBar(stateRegNo, newStatus);
    reloadData();
    const statusText = newStatus === 'ACTIVE' ? '🟢 Active (सक्रिय)' : newStatus === 'HOLD' ? '🟡 On Hold (सत्यापन अधीन)' : '🔴 Suspended (निलंबित)';
    showToast(`अधिवक्ता (${stateRegNo}) की स्थिति सफलतापूर्वक ${statusText} कर दी गई।`);
  };

  // Toggle COP Validity
  const handleToggleCop = (stateRegNo: string) => {
    const isNowValid = db.toggleStateBarVoterCop(stateRegNo);
    reloadData();
    showToast(`COP स्थिति अपडेट: ${isNowValid ? 'सत्यापित (Valid COP)' : 'अमान्य / लंबित (Invalid COP)'}`);
  };

  // Bulk District Update
  const handleBulkDistrictStatus = (status: 'ACTIVE' | 'HOLD' | 'SUSPENDED') => {
    if (selectedDistrict === 'ALL') {
      if (!confirm(`क्या आप पूरे उत्तर प्रदेश के सभी 75 जिलों के सदस्यों को सामूहिक रूप से ${status} करना चाहते हैं?`)) return;
    } else {
      if (!confirm(`क्या आप ${selectedDistrict} जिले के सभी सदस्यों को ${status} करना चाहते हैं?`)) return;
    }
    const updatedCount = db.bulkSetDistrictAdvocatesStatus(selectedDistrict, status);
    reloadData();
    showToast(`${selectedDistrict === 'ALL' ? 'समस्त 75 जिलों' : selectedDistrict} के ${updatedCount} अधिवक्ताओं को ${status} किया गया।`);
  };

  // Submit Enrollment on State Roll
  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollForm.advocateName.trim()) {
      showToast('कृपया अधिवक्ता का नाम दर्ज करें');
      return;
    }

    const res = db.enrollNewAdvocateAtStateBar({
      advocateName: enrollForm.advocateName,
      hindiName: enrollForm.hindiName,
      fatherName: enrollForm.fatherName,
      dob: enrollForm.dob,
      stateRegNo: enrollForm.stateRegNo,
      copNo: enrollForm.copNo,
      districtBar: enrollForm.districtBar,
      tahsil: enrollForm.tahsil,
      mobile: enrollForm.mobile,
      email: enrollForm.email,
      chamberNo: enrollForm.chamberNo,
      experienceYears: Number(enrollForm.experienceYears) || 5,
      specialization: enrollForm.specializations
    });

    reloadData();
    setEnrollSuccessModal({
      open: true,
      advocateName: enrollForm.advocateName,
      stateRegNo: res.stateRegNo,
      copNo: res.copNo,
      districtBar: enrollForm.districtBar
    });

    // Reset Form
    setEnrollForm({
      advocateName: '',
      hindiName: '',
      fatherName: '',
      dob: '10/05/1992',
      stateRegNo: '',
      copNo: '',
      districtBar: 'Ballia (बलिया)',
      tahsil: 'Ballia Sadar',
      mobile: '',
      email: '',
      chamberNo: 'Chamber 14, Bar Hall',
      experienceYears: 5,
      specializations: ['CRIMINAL', 'CIVIL']
    });
  };

  // Create Election Post
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postForm.title.trim()) {
      showToast('कृपया पद का शीर्षक दर्ज करें');
      return;
    }

    const postKey = (postForm.key.trim() || postForm.title.trim().toUpperCase().replace(/\s+/g, '_')).replace(/[^A-Z0-9_]/g, '');
    const newPost: StateBarElectionPost = {
      id: 'sb_post_' + Date.now(),
      key: postKey,
      title: postForm.title.trim(),
      hindiTitle: postForm.hindiTitle.trim() || postForm.title.trim(),
      description: postForm.description.trim() || 'Bar Council of Uttar Pradesh Electoral Post',
      order: electionPosts.length + 1,
      seatsCount: Number(postForm.seatsCount) || 1,
      category: postForm.category
    };

    db.addStateBarElectionPost(newPost);
    reloadData();
    setIsCreatePostModalOpen(false);
    setPostForm({
      key: '',
      title: '',
      hindiTitle: '',
      description: '',
      seatsCount: 1,
      category: 'Apex'
    });
    showToast(`नया चुनावी पद '${newPost.title}' सफलतापूर्वक बनाया गया!`);
  };

  // Nominate Candidate
  const handleNominateCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateForm.name.trim() || !candidateForm.postKey) {
      showToast('कृपया प्रत्याशी का नाम और पद चुनें');
      return;
    }

    const newCandidate: StateBarElectionCandidate = {
      id: 'sb_cand_' + Date.now(),
      name: candidateForm.name.trim(),
      hindiName: candidateForm.hindiName.trim() || candidateForm.name.trim(),
      stateRegNo: candidateForm.stateRegNo.trim() || `UP/${Math.floor(1000 + Math.random() * 9000)}/2000`,
      copNo: candidateForm.copNo.trim() || `COP/UP/2000/${Math.floor(1000 + Math.random() * 9000)}`,
      districtBar: candidateForm.districtBar,
      post: candidateForm.postKey,
      photoUrl: candidateForm.photoUrl || 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&auto=format&fit=crop&q=80',
      agenda: candidateForm.agenda.trim() || 'Advocate welfare, health insurance and judicial dignity protection.',
      standingYears: Number(candidateForm.standingYears) || 15,
      votesCount: 0,
      districtVoteBreakdown: {},
      status: 'ACTIVE'
    };

    db.addStateBarElectionCandidate(newCandidate);
    reloadData();
    setIsNominateModalOpen(false);
    setCandidateForm({
      name: '',
      hindiName: '',
      stateRegNo: '',
      copNo: '',
      districtBar: 'Ballia (बलिया)',
      postKey: '',
      standingYears: 15,
      agenda: '',
      photoUrl: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&auto=format&fit=crop&q=80'
    });
    showToast(`प्रत्याशी '${newCandidate.name}' का नामांकन सफलतापूर्वक दर्ज हुआ!`);
  };

  // Toggle State Election Status
  const handleToggleElection = (newStatus: 'VotingOpen' | 'VotingClosed' | 'ResultsDeclared' | 'NominationsOpen') => {
    const isLive = newStatus === 'VotingOpen';
    const updated = db.updateStateBarElectionConfig({
      status: newStatus,
      isVotingLive: isLive
    });
    db.broadcastStateElectionLiveNotification(isLive);
    setElectionConfig({ ...updated });
    reloadData();
    showToast(`राज्य चुनाव स्थिति अपडेट: ${newStatus === 'VotingOpen' ? '🟢 E-Voting LIVE ON' : newStatus}`);
  };

  // Verify State Roll Tool Search
  const handleSearchVerify = () => {
    if (!verifySearchQuery.trim()) return;
    const clean = verifySearchQuery.trim().toLowerCase();
    const found = voterRoll.find(v => 
      v.stateRegNo.toLowerCase().includes(clean) ||
      v.copNo.toLowerCase().includes(clean) ||
      v.advocateName.toLowerCase().includes(clean) ||
      (v.mobile && v.mobile.includes(clean))
    );
    setVerifiedResult(found || null);
    setHasSearchedVerify(true);
  };

  // State Bar Broadcast Notice Handler
  const handleSendStateBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sbNotifTitle.trim() || !sbNotifMessage.trim()) return;

    const timeStr = new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    db.addNotification({
      id: 'notif_sb_' + Date.now(),
      title: `🏛️ [Bar Council UP] ${sbNotifTitle.trim()}`,
      message: `${sbNotifMessage.trim()} ${sbTargetDistrict !== 'ALL' ? `(Targeted District: ${sbTargetDistrict})` : '(Applicable across all 75 Districts of UP)'}`,
      targetRole: 'all',
      isRead: false,
      createdAt: timeStr
    });

    setSbNotifSuccess(true);
    setSbNotifTitle('');
    setSbNotifMessage('');
    setTimeout(() => setSbNotifSuccess(false), 4000);
    showToast(`राज्य बार काउंसिल विज्ञप्ति ${sbTargetDistrict === 'ALL' ? 'समस्त 75 जिलों में' : sbTargetDistrict} सफलतापूर्वक प्रसारित कर दी गई!`);
  };

  // Filtered Advocates in Directory
  const filteredAdvocates = voterRoll.filter(v => {
    const matchDistrict = selectedDistrict === 'ALL' || v.districtBar.toLowerCase().includes(selectedDistrict.toLowerCase());
    
    // Status match: map 'APPROVED' and 'ACTIVE' together
    let matchStatus = true;
    if (statusFilter === 'ACTIVE') {
      matchStatus = v.status === 'ACTIVE' || v.status === 'APPROVED';
    } else if (statusFilter === 'HOLD') {
      matchStatus = v.status === 'HOLD' || v.status === 'PENDING';
    } else if (statusFilter === 'SUSPENDED') {
      matchStatus = v.status === 'SUSPENDED';
    }

    // Voting match
    const hasVoted = db.hasAdvocateVotedAnyStatePost(v.stateRegNo, v.copNo);
    let matchVoting = true;
    if (votingFilter === 'VOTED') {
      matchVoting = hasVoted || v.votingStatus === 'VOTED';
    } else if (votingFilter === 'PENDING') {
      matchVoting = !hasVoted && v.votingStatus !== 'VOTED';
    }

    // Text match
    const query = searchQuery.toLowerCase().trim();
    const matchQuery = !query || 
      (v.advocateName || '').toLowerCase().includes(query) ||
      (v.hindiName || '').toLowerCase().includes(query) ||
      (v.stateRegNo || '').toLowerCase().includes(query) ||
      (v.copNo || '').toLowerCase().includes(query) ||
      (v.districtBar || '').toLowerCase().includes(query) ||
      (v.mobile || '').includes(query);

    return matchDistrict && matchStatus && matchVoting && matchQuery;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 selection:bg-red-600 selection:text-white">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border-2 border-red-500 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-slideUp">
          <BadgeCheck className="w-5 h-5 text-red-400 flex-shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* TOP INSTITUTIONAL BAR: BAR COUNCIL OF UTTAR PRADESH */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-red-950 border-b-2 border-red-600/70 shadow-2xl sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 p-0.5 shadow-xl shadow-red-700/30 flex-shrink-0">
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center">
                <Landmark className="w-7 h-7 text-red-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                  <span>BAR COUNCIL OF UTTAR PRADESH</span>
                  <span className="text-xs bg-red-600/40 text-red-200 border border-red-500/60 px-2 py-0.5 rounded-full font-bold">
                    राज्य विधिज्ञ परिषद
                  </span>
                </h1>
              </div>
              <p className="text-[11px] text-slate-300 font-medium">
                High Court Campus, Prayagraj • Apex Statutory Regulator (The Advocates Act, 1961)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Live Election Pill */}
            {electionConfig.status === 'VotingOpen' ? (
              <span className="text-xs font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-lg animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>E-Voting LIVE across 75 Districts</span>
              </span>
            ) : (
              <span className="text-xs font-bold uppercase bg-slate-900 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <PauseCircle className="w-3.5 h-3.5 text-slate-400" />
                <span>Election: {electionConfig.status}</span>
              </span>
            )}

            <button
              onClick={reloadData}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Switch to District Bar or Super Admin */}
            <button
              onClick={() => onNavigate('admin')}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all flex items-center gap-1.5 shadow"
              title="District Bar Association Admin"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>District Bar Panel</span>
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                className="px-3 py-1.5 rounded-xl bg-red-950 hover:bg-red-900 text-red-200 border border-red-500/40 text-xs font-bold transition-all"
              >
                लॉगआउट
              </button>
            )}
          </div>

        </div>

        {/* 4 Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 sm:space-x-3 overflow-x-auto border-t border-red-900/50 pt-2 pb-1">
          <button
            onClick={() => setActiveTab('directory')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'directory'
                ? 'border-red-500 text-white bg-red-950/40 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4 text-red-400" />
            <span>1. 75 Districts Master Directory ({voterRoll.length} Advocates)</span>
          </button>

          <button
            onClick={() => setActiveTab('enrollment')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'enrollment'
                ? 'border-red-500 text-white bg-red-950/40 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-4 h-4 text-amber-400" />
            <span>2. State Roll Enrollment</span>
            {!isStateBarAdmin && <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 font-normal">🔒 Admin Only</span>}
          </button>

          <button
            onClick={() => setActiveTab('election')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'election'
                ? 'border-red-500 text-white bg-red-950/40 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Vote className="w-4 h-4 text-purple-400" />
            <span>3. State Election Master</span>
            {!isStateBarAdmin && <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 font-normal">🔒 Admin Only</span>}
          </button>

          <button
            onClick={() => setActiveTab('governance')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'governance'
                ? 'border-red-500 text-white bg-red-950/40 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-4 h-4 text-amber-400" />
            <span>4. Council SaaS License Details</span>
            {!isStateBarAdmin && <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 font-normal">🔒 Admin Only</span>}
          </button>

          <button
            onClick={() => setActiveTab('broadcast')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'broadcast'
                ? 'border-red-500 text-white bg-red-950/40 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bell className="w-4 h-4 text-amber-400" />
            <span>5. 75 Districts Notice &amp; News Broadcast</span>
          </button>
        </div>
      </div>

      {/* District Bar Read-Only Verification Banner */}
      {!isStateBarAdmin && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-gradient-to-r from-slate-900 via-red-950/60 to-slate-900 border border-red-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
                  <span>🏛️ जिला बार एसोसिएशन - केवल पठन एवं अधिवक्ता/मतदाता सत्यापन पोर्टल</span>
                </h4>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  जिला बार एडमिन पैनल केवल राज्य बार अधिवक्ता सूची (75 जिला), COP सत्यापन और मतदान स्थिति देख सकता है। राज्य बार रोल एनरोलमेंट, चुनाव नियंत्रण व कौंसिल लाइसेंस संशोधन केवल राज्य बार काउंसिल प्रयागराज द्वारा संपन्न किए जाते हैं।
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-xl whitespace-nowrap">
              ✓ Read &amp; Verification Mode
            </span>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">

        {/* ============================================================== */}
        {/* TAB 1: 75 DISTRICTS MASTER DIRECTORY & STATUS CONTROLS */}
        {/* ============================================================== */}
        {activeTab === 'directory' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Top KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-lg">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                  <span>Total Enrolled</span>
                  <Users className="w-4 h-4 text-blue-400" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-white mt-2">{voterRoll.length}</p>
                <p className="text-[11px] text-slate-400 mt-1">Across all 75 Districts</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-lg">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                  <span>Active &amp; Verified COP</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-emerald-400 mt-2">
                  {voterRoll.filter(v => v.status === 'ACTIVE' || v.status === 'APPROVED').length}
                </p>
                <p className="text-[11px] text-emerald-300/80 mt-1">Eligible to Vote &amp; Practice</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-lg">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                  <span>On Hold / Suspended</span>
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-amber-400 mt-2">
                  {voterRoll.filter(v => v.status === 'HOLD' || v.status === 'PENDING' || v.status === 'SUSPENDED').length}
                </p>
                <p className="text-[11px] text-amber-300/80 mt-1">Under Verification / Action</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-lg">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                  <span>Total Votes Cast</span>
                  <Vote className="w-4 h-4 text-purple-400" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-purple-300 mt-2">
                  {stats.totalVotesPolled}
                </p>
                <p className="text-[11px] text-purple-300/80 mt-1">Digital Audited Ballots</p>
              </div>
            </div>

            {/* Filter & Control Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <Filter className="w-4 h-4 text-red-400" />
                    <span>75 ज़िलों की विस्तृत अधिवक्ता सूची (District-wise Directory)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    पूरे उत्तर प्रदेश के अधिवक्ताओं की सक्रियता, होल्ड, निलंबन और मतदान स्थिति नियंत्रित करें।
                  </p>
                </div>

                {/* Bulk Actions for Selected District (State Admin Only) */}
                <div className="flex flex-wrap items-center gap-2">
                  {isStateBarAdmin ? (
                    <>
                      <span className="text-[11px] text-slate-400 font-bold uppercase">सामूहिक कार्रवाई:</span>
                      <button
                        type="button"
                        onClick={() => handleBulkDistrictStatus('ACTIVE')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all"
                      >
                        ✓ Approve All ({selectedDistrict === 'ALL' ? '75 Districts' : selectedDistrict.split(' ')[0]})
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBulkDistrictStatus('HOLD')}
                        className="px-3 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all"
                      >
                        ⏸ Hold All
                      </button>
                    </>
                  ) : (
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/30">
                      🔍 Read-Only Voter Verification Mode
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      window.print();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all flex items-center gap-1.5"
                    title="Print Certified District Roll"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Roll</span>
                  </button>
                </div>
              </div>

              {/* 4 Interactive Dropdown / Search Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-800">
                {/* 1. District Dropdown */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    ज़िला बार चुनें (Select District):
                  </label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-xs text-amber-300 font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:border-red-500 cursor-pointer"
                  >
                    <option value="ALL">🌟 समस्त 75 जिले (All 75 Districts)</option>
                    {UP_75_DISTRICTS.map((dist, idx) => (
                      <option key={`dist-${idx}`} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Status Filter */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    सदस्यता स्थिति (Member Status):
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-200 font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:border-red-500 cursor-pointer"
                  >
                    <option value="ALL">सभी स्थितियाँ (All Statuses)</option>
                    <option value="ACTIVE">🟢 ACTIVE (सक्रिय सदस्य)</option>
                    <option value="HOLD">🟡 HOLD (सत्यापन अधीन / होल्ड)</option>
                    <option value="SUSPENDED">🔴 SUSPENDED (निलंबित)</option>
                  </select>
                </div>

                {/* 3. Voting Filter */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    मतदान स्थिति (Voting Done/Pending):
                  </label>
                  <select
                    value={votingFilter}
                    onChange={(e) => setVotingFilter(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-200 font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:border-red-500 cursor-pointer"
                  >
                    <option value="ALL">सभी मतदान स्थिति (All)</option>
                    <option value="VOTED">🟢 VOTED (मतदान संपन्न)</option>
                    <option value="PENDING">⚪ PENDING (मतदान शेष)</option>
                  </select>
                </div>

                {/* 4. Search Input */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    खोजें (Name, Reg No, COP):
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="वकील का नाम, UP/..., COP..."
                      className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-100 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-red-500"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>
              </div>
            </div>

            {/* Members Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-300">
                    प्रदर्शित अधिवक्ता रिकॉर्ड्स:
                  </span>
                  <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                    {filteredAdvocates.length} Advocates Found
                  </span>
                </div>
                <span className="text-xs text-slate-400 hidden sm:inline">
                  जिला: <strong className="text-white">{selectedDistrict === 'ALL' ? 'उत्तर प्रदेश (75 जिले)' : selectedDistrict}</strong>
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4">अधिवक्ता विवरण</th>
                      <th className="py-3.5 px-4">State Reg No.</th>
                      <th className="py-3.5 px-4">COP No. &amp; स्थिति</th>
                      <th className="py-3.5 px-4">जिला बार एसोसिएशन</th>
                      <th className="py-3.5 px-4 text-center">वोटिंग स्थिति</th>
                      <th className="py-3.5 px-4 text-center">वर्तमान स्थिति</th>
                      <th className="py-3.5 px-4 text-right">कार्रवाई (Actions)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
                    {filteredAdvocates.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                          कोई अधिवक्ता रिकॉर्ड नहीं मिला। कृपया फ़िल्टर बदलें।
                        </td>
                      </tr>
                    ) : (
                      filteredAdvocates.map((adv, idx) => {
                        const isVoted = db.hasAdvocateVotedAnyStatePost(adv.stateRegNo, adv.copNo) || adv.votingStatus === 'VOTED';
                        const isMemberActive = adv.status === 'ACTIVE' || adv.status === 'APPROVED';
                        const isMemberHold = adv.status === 'HOLD' || adv.status === 'PENDING';
                        const isMemberSuspended = adv.status === 'SUSPENDED';

                        return (
                          <tr key={adv.id || adv.stateRegNo || `adv-${idx}`} className="hover:bg-slate-850/50 transition-colors">
                            
                            {/* 1. Name & Photo */}
                            <td className="py-3 px-4 font-bold text-slate-100 flex items-center gap-2.5">
                              <img
                                src={adv.photoUrl || 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=100&fit=crop&q=80'}
                                alt={adv.advocateName}
                                className="w-8 h-8 rounded-full object-cover border border-slate-700 flex-shrink-0"
                              />
                              <div>
                                <span className="text-white text-xs block">{adv.advocateName}</span>
                                {adv.hindiName && (
                                  <span className="text-[10px] text-slate-400 font-normal">{adv.hindiName}</span>
                                )}
                                <span className="text-[10px] text-slate-500 block font-mono">📱 {adv.mobile || 'No Mobile'}</span>
                              </div>
                            </td>

                            {/* 2. State Reg No */}
                            <td className="py-3 px-4 font-mono font-bold text-amber-300">
                              {adv.stateRegNo}
                            </td>

                            {/* 3. COP No & Validity */}
                            <td className="py-3 px-4">
                              <span className="font-mono text-slate-200 block text-[11px]">{adv.copNo}</span>
                              <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded mt-0.5 ${
                                adv.isCopValid
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-red-500/20 text-red-300 border border-red-500/40'
                              }`}>
                                {adv.isCopValid ? '✓ Verified COP' : '⚠ COP Pending'}
                              </span>
                            </td>

                            {/* 4. District Bar */}
                            <td className="py-3 px-4">
                              <span className="text-slate-200 font-semibold block">{adv.districtBar}</span>
                              <span className="text-[10px] text-slate-400">{adv.tahsil || 'Sadar'}</span>
                            </td>

                            {/* 5. Voting Status */}
                            <td className="py-3 px-4 text-center">
                              {isVoted ? (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 inline-flex items-center gap-1 shadow-sm">
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span>VOTED / मत दिया</span>
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                                  PENDING
                                </span>
                              )}
                            </td>

                            {/* 6. Member Status Badge */}
                            <td className="py-3 px-4 text-center">
                              {isMemberActive && (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/50">
                                  🟢 ACTIVE
                                </span>
                              )}
                              {isMemberHold && (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/50">
                                  🟡 ON HOLD
                                </span>
                              )}
                              {isMemberSuspended && (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-red-500/20 text-red-300 border border-red-500/50">
                                  🔴 SUSPENDED
                                </span>
                              )}
                            </td>

                            {/* 7. Action Buttons (State Bar Admin Only) */}
                            <td className="py-3 px-4 text-right">
                              {isStateBarAdmin ? (
                                <div className="inline-flex items-center gap-1">
                                  {!isMemberActive && (
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateMemberStatus(adv.stateRegNo, 'ACTIVE')}
                                      className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white text-[11px] font-bold transition-all border border-emerald-500/40"
                                      title="Set Active (सक्रिय करें)"
                                    >
                                      Approve
                                    </button>
                                  )}

                                  {!isMemberHold && (
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateMemberStatus(adv.stateRegNo, 'HOLD')}
                                      className="p-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white text-[11px] font-bold transition-all border border-amber-500/40"
                                      title="Put on Hold (सत्यापन अधीन रखें)"
                                    >
                                      Hold
                                    </button>
                                  )}

                                  {!isMemberSuspended && (
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateMemberStatus(adv.stateRegNo, 'SUSPENDED')}
                                      className="p-1.5 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white text-[11px] font-bold transition-all border border-red-500/40"
                                      title="Suspend Member (निलंबित करें)"
                                    >
                                      Suspend
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => handleToggleCop(adv.stateRegNo)}
                                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold border border-slate-700"
                                    title="Toggle COP Status"
                                  >
                                    COP
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30 inline-flex items-center gap-1">
                                  ✓ Verified Advocate
                                </span>
                              )}
                            </td>

                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: STATE ROLL ENROLLMENT */}
        {activeTab === 'enrollment' && (
          !isStateBarAdmin ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-2xl">
              <div className="w-16 h-16 bg-red-500/20 border border-red-500/40 rounded-3xl flex items-center justify-center mx-auto text-red-400 shadow-lg">
                <Lock className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-black text-white">State Bar Council Admin Privileges Required</h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                District Bar Association members have Read-Only access to <strong>Advocate &amp; COP Verification (Tab 1)</strong>. State Bar Council Enrollments are restricted to Apex State Bar Council Super Admins.
              </p>
              <button
                onClick={() => setActiveTab('directory')}
                className="mt-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg transition-all"
              >
                ← Go to Advocate &amp; COP Verification (Tab 1)
              </button>
            </div>
          ) : (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Legal Foundation Banner */}
            <div className="rounded-3xl bg-gradient-to-r from-red-950 via-slate-900 to-amber-950 border-2 border-red-500/70 p-6 sm:p-8 shadow-2xl space-y-3">
              <div className="flex items-center gap-2 text-red-400 text-xs font-black uppercase tracking-wider">
                <Landmark className="w-5 h-5 text-red-400" />
                <span>The Advocates Act, 1961 • Statutory State Roll Enrollment Process</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                राज्य विधिज्ञ परिषद (State Bar Council) द्वारा अधिवक्ता का प्रथम पंजीकरण
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-4xl leading-relaxed">
                कानून के अनुसार किसी भी नए अधिवक्ता का <strong>सर्वप्रथम पंजीकरण राज्य बार काउंसिल (Bar Council of Uttar Pradesh)</strong> में ही होता है। राज्य बार काउंसिल ही अधिवक्ता को <strong>State Registration Number (उदा. UP/1084/1990)</strong> और <strong>COP (Certificate of Practice)</strong> जारी करती है। इसी पंजीकरण संख्या के आधार पर अधिवक्ता किसी भी ज़िला बार एसोसिएशन (जैसे बलिया, लखनऊ, प्रयागराज आदि) में सदस्य बनकर वकालत कर सकता है।
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left 2 Cols: Enrollment Form */}
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
                <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-amber-400" />
                    <span>नया अधिवक्ता एनरोल करें (Issue State Bar Registration)</span>
                  </h3>
                  <span className="text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/30">
                    ✓ Official State Roll Entry
                  </span>
                </div>

                <form onSubmit={handleEnrollSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Name English */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        अधिवक्ता का नाम (English) *
                      </label>
                      <input
                        type="text"
                        required
                        value={enrollForm.advocateName}
                        onChange={(e) => setEnrollForm({ ...enrollForm, advocateName: e.target.value })}
                        placeholder="e.g. Adv. Rajesh Kumar Yadav"
                        className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-100 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-red-500"
                      />
                    </div>

                    {/* Name Hindi */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        अधिवक्ता का नाम (हिंदी)
                      </label>
                      <input
                        type="text"
                        value={enrollForm.hindiName}
                        onChange={(e) => setEnrollForm({ ...enrollForm, hindiName: e.target.value })}
                        placeholder="उदा. राजेश कुमार यादव"
                        className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-100 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-red-500"
                      />
                    </div>

                    {/* Father Name */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        पिता का नाम (Father's Name)
                      </label>
                      <input
                        type="text"
                        value={enrollForm.fatherName}
                        onChange={(e) => setEnrollForm({ ...enrollForm, fatherName: e.target.value })}
                        placeholder="उदा. श्री रामेश्वर यादव"
                        className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-100 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-red-500"
                      />
                    </div>

                    {/* DOB */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        जन्म तिथि (Date of Birth)
                      </label>
                      <input
                        type="text"
                        value={enrollForm.dob}
                        onChange={(e) => setEnrollForm({ ...enrollForm, dob: e.target.value })}
                        placeholder="DD/MM/YYYY"
                        className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-100 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-red-500 font-mono"
                      />
                    </div>

                    {/* Designated District Bar */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        गृह जिला बार एसोसिएशन (Allotted District Bar) *
                      </label>
                      <select
                        value={enrollForm.districtBar}
                        onChange={(e) => setEnrollForm({ ...enrollForm, districtBar: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 text-xs text-amber-300 font-bold rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-red-500 cursor-pointer"
                      >
                        {UP_75_DISTRICTS.map((d, i) => (
                          <option key={`reg-d-${i}`} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Tehsil */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        तहसील / उप-मंडल (Tehsil)
                      </label>
                      <input
                        type="text"
                        value={enrollForm.tahsil}
                        onChange={(e) => setEnrollForm({ ...enrollForm, tahsil: e.target.value })}
                        placeholder="उदा. Ballia Sadar"
                        className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-100 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-red-500"
                      />
                    </div>

                    {/* Mobile */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        मोबाइल नंबर (10 अंक) *
                      </label>
                      <input
                        type="tel"
                        required
                        value={enrollForm.mobile}
                        onChange={(e) => setEnrollForm({ ...enrollForm, mobile: e.target.value })}
                        placeholder="9415XXXXXX"
                        className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-100 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-red-500 font-mono"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        ईमेल पता (Email)
                      </label>
                      <input
                        type="email"
                        value={enrollForm.email}
                        onChange={(e) => setEnrollForm({ ...enrollForm, email: e.target.value })}
                        placeholder="advocate@upbarcouncil.org"
                        className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-100 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-red-500"
                      />
                    </div>

                    {/* Custom State Reg No or Auto */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        State Registration No. (खाली छोड़ने पर स्वतः जेनरेट होगा)
                      </label>
                      <input
                        type="text"
                        value={enrollForm.stateRegNo}
                        onChange={(e) => setEnrollForm({ ...enrollForm, stateRegNo: e.target.value })}
                        placeholder="उदा. UP/5421/2026"
                        className="w-full bg-slate-800 border border-slate-700 text-xs text-amber-300 font-mono rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-red-500"
                      />
                    </div>

                    {/* Custom COP No or Auto */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        COP Number (खाली छोड़ने पर स्वतः जेनरेट होगा)
                      </label>
                      <input
                        type="text"
                        value={enrollForm.copNo}
                        onChange={(e) => setEnrollForm({ ...enrollForm, copNo: e.target.value })}
                        placeholder="उदा. COP/UP/2026/5421"
                        className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-red-500"
                      />
                    </div>

                  </div>

                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                    <p className="text-[11px] text-slate-400">
                      पंजीकरण करते ही अधिवक्ता का नाम <strong>State Roll</strong> और <strong>District Bar Records</strong> दोनों में सिंक हो जाएगा।
                    </p>
                    <button
                      type="submit"
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-extrabold text-xs shadow-xl shadow-red-600/30 flex items-center gap-2 transition-all transform active:scale-95"
                    >
                      <BadgeCheck className="w-4 h-4 text-white" />
                      <span>जारी करें State Reg No. व एनरोल करें →</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Col: Instant Verification Tool */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
                <div className="pb-3 border-b border-slate-800">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Search className="w-4 h-4 text-blue-400" />
                    <span>State Roll Search &amp; Verification</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    किसी भी अधिवक्ता के रजिस्ट्रेशन नंबर या COP नंबर से स्टेट रोल प्रमाण पत्र देखें।
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={verifySearchQuery}
                      onChange={(e) => setVerifySearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchVerify()}
                      placeholder="उदा. UP/1084/1990 या O. P. Singh"
                      className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-100 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-blue-500"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>

                  <button
                    type="button"
                    onClick={handleSearchVerify}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>सत्यापित करें (Verify Advocate)</span>
                  </button>
                </div>

                {/* Verification Result Card */}
                {hasSearchedVerify && (
                  <div className="pt-2">
                    {verifiedResult ? (
                      <div className="bg-slate-950 border border-emerald-500/40 rounded-2xl p-4 space-y-3 shadow-lg">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                          <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                            ✓ VERIFIED ON STATE ROLL
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">UP BAR COUNCIL</span>
                        </div>

                        <div className="space-y-1.5 text-xs">
                          <p className="font-bold text-white text-sm">{verifiedResult.advocateName}</p>
                          <p className="text-amber-300 font-mono font-bold">Reg: {verifiedResult.stateRegNo}</p>
                          <p className="text-slate-300 font-mono">COP: {verifiedResult.copNo}</p>
                          <p className="text-slate-400">Bar: {verifiedResult.districtBar}</p>
                          <p className="text-slate-400">Status: <strong className="text-emerald-400">{verifiedResult.status}</strong></p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-950 border border-red-500/30 rounded-2xl p-4 text-center text-xs text-red-300 space-y-1">
                        <AlertTriangle className="w-6 h-6 text-red-400 mx-auto" />
                        <p className="font-bold">कोई रिकॉर्ड नहीं मिला</p>
                        <p className="text-[11px] text-slate-400">दर्ज किया गया रजिस्ट्रेशन नंबर राज्य रोल में पंजीकृत नहीं है।</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>

          </div>
        )
      )}

        {/* ============================================================== */}
        {/* TAB 3: STATE BAR ELECTION MASTER & LIVE RESULTS */}
        {activeTab === 'election' && (
          !isStateBarAdmin ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-2xl">
              <div className="w-16 h-16 bg-red-500/20 border border-red-500/40 rounded-3xl flex items-center justify-center mx-auto text-red-400 shadow-lg">
                <Lock className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-black text-white">State Bar Council Admin Privileges Required</h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                District Bar Association members have Read-Only access to <strong>Advocate &amp; COP Verification (Tab 1)</strong>. State Bar Council Elections are restricted to Apex State Bar Council Super Admins.
              </p>
              <button
                onClick={() => setActiveTab('directory')}
                className="mt-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg transition-all"
              >
                ← Go to Advocate &amp; COP Verification (Tab 1)
              </button>
            </div>
          ) : (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Master Switchboard */}
            <div className="bg-slate-900 border border-red-500/50 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Vote className="w-5 h-5 text-red-400" />
                    <span>75 जिलों का राज्य बार चुनाव मास्टर स्विच (ON / OFF / RESULTS)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    यहाँ से बटन दबाते ही पूरे प्रदेश के सभी 75 जिलों में ई-वोटिंग चालू या बंद हो जाती है।
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-bold">स्थिति:</span>
                  <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase ${
                    electionConfig.status === 'VotingOpen'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 animate-pulse'
                      : electionConfig.status === 'ResultsDeclared'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                      : 'bg-red-500/20 text-red-300 border border-red-500/50'
                  }`}>
                    {electionConfig.status === 'VotingOpen' ? '🟢 E-VOTING ON' : electionConfig.status}
                  </span>
                </div>
              </div>

              {/* 4 State Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => handleToggleElection('VotingOpen')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    electionConfig.status === 'VotingOpen'
                      ? 'bg-emerald-950/80 border-emerald-400 ring-2 ring-emerald-500/40 shadow-lg'
                      : 'bg-slate-950 hover:bg-emerald-950/30 border-slate-800'
                  }`}
                >
                  <span className="text-xs font-black text-white block mb-1">1. TURN VOTING ON</span>
                  <span className="text-[11px] text-slate-300">75 जिलों में मतदान सक्रिय करें।</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleElection('VotingClosed')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    electionConfig.status === 'VotingClosed'
                      ? 'bg-red-950/80 border-red-400 ring-2 ring-red-500/40 shadow-lg'
                      : 'bg-slate-950 hover:bg-red-950/30 border-slate-800'
                  }`}
                >
                  <span className="text-xs font-black text-white block mb-1">2. TURN VOTING OFF</span>
                  <span className="text-[11px] text-slate-300">मतदान का समय समाप्त करें।</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleElection('ResultsDeclared')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    electionConfig.status === 'ResultsDeclared'
                      ? 'bg-purple-950/80 border-purple-400 ring-2 ring-purple-500/40 shadow-lg'
                      : 'bg-slate-950 hover:bg-purple-950/30 border-slate-800'
                  }`}
                >
                  <span className="text-xs font-black text-white block mb-1">3. DECLARE RESULTS</span>
                  <span className="text-[11px] text-slate-300">मतगणना परिणाम जारी करें।</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleElection('NominationsOpen')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    electionConfig.status === 'NominationsOpen'
                      ? 'bg-amber-950/80 border-amber-400 ring-2 ring-amber-500/40 shadow-lg'
                      : 'bg-slate-950 hover:bg-amber-950/30 border-slate-800'
                  }`}
                >
                  <span className="text-xs font-black text-white block mb-1">4. NOMINATIONS STAGE</span>
                  <span className="text-[11px] text-slate-300">पर्चा दाखिला प्रक्रिया चालू करें।</span>
                </button>
              </div>
            </div>

            {/* ELECTORAL POSTS SECTION (पद निर्माण का विकल्प) */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <Crown className="w-5 h-5 text-amber-400" />
                    <span>राज्य बार चुनावी पद (Electoral Posts Management)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    चेयरमैन, वाइस चेयरमैन, सदस्य बार काउंसिल ऑफ इंडिया आदि पद बनाएँ और प्रबंधित करें।
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatePostModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg flex items-center gap-1.5 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ नया चुनावी पद बनाएँ (Create Post)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsNominateModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-extrabold text-xs shadow-lg flex items-center gap-1.5 transition-all"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>+ प्रत्याशी नामांकित करें (Add Candidate)</span>
                  </button>
                </div>
              </div>

              {/* Posts Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {electionPosts.map((post, idx) => {
                  const postCandidates = candidates.filter(c => c.post === post.key);
                  return (
                    <div
                      key={post.id || `post-${idx}`}
                      className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2 relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                            {post.category || 'Apex Post'}
                          </span>
                          <h4 className="text-sm font-bold text-white mt-1.5">{post.title}</h4>
                          <p className="text-xs text-amber-300 font-semibold">{post.hindiTitle}</p>
                        </div>
                        <span className="text-xs font-bold text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                          {post.seatsCount || 1} Seat(s)
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                        {post.description}
                      </p>

                      <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-xs text-slate-400">
                        <span>नामांकित प्रत्याशी: <strong className="text-white">{postCandidates.length}</strong></span>
                        <span className="font-mono text-[10px] text-slate-500">Key: {post.key}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* LIVE CANDIDATES & ELECTION RESULTS OVERVIEW */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <Vote className="w-5 h-5 text-purple-400" />
                    <span>लाइव मतगणना व प्रत्याशी वोट शेयर (Live Counting &amp; Results)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    75 जिलों से प्राप्त कुल वोट: <strong className="text-amber-300 font-bold">{stats.totalVotesPolled} Votes</strong>
                  </p>
                </div>
                <span className="text-xs font-bold text-purple-300 bg-purple-500/10 px-3 py-1 rounded-xl border border-purple-500/30">
                  {candidates.length} Nominated Candidates
                </span>
              </div>

              {/* Candidates Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {candidates.map((cand, idx) => {
                  const matchingPost = electionPosts.find(p => p.key === cand.post);
                  return (
                    <div
                      key={cand.id || cand.stateRegNo || `cand-${idx}`}
                      className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={cand.photoUrl}
                          alt={cand.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-700 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">{cand.name}</h4>
                          <p className="text-[10px] text-amber-400 font-bold uppercase truncate">
                            {matchingPost?.title || cand.post}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {cand.districtBar} • {cand.stateRegNo}
                          </p>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-300 line-clamp-2 italic bg-slate-900/60 p-2 rounded-xl border border-slate-850">
                        "{cand.agenda}"
                      </p>

                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">Votes Polled</span>
                          <span className="text-lg font-black text-amber-400">{cand.votesCount || 0}</span>
                        </div>
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                          {cand.standingYears} Yrs Standing
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )
      )}

        {/* ============================================================== */}
        {/* TAB 4: COUNCIL SAAS LICENSE DETAILS & COMPLIANCE */}
        {activeTab === 'governance' && (
          !isStateBarAdmin ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-2xl">
              <div className="w-16 h-16 bg-red-500/20 border border-red-500/40 rounded-3xl flex items-center justify-center mx-auto text-red-400 shadow-lg">
                <Lock className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-black text-white">State Bar Council Admin Privileges Required</h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                District Bar Association members have Read-Only access to <strong>Advocate &amp; COP Verification (Tab 1)</strong>. Council SaaS License details are restricted to Apex State Bar Council Super Admins.
              </p>
              <button
                onClick={() => setActiveTab('directory')}
                className="mt-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg transition-all"
              >
                ← Go to Advocate &amp; COP Verification (Tab 1)
              </button>
            </div>
          ) : (
          <div className="space-y-6 animate-fadeIn">
            
            <div className="bg-slate-900 border border-red-500/40 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-amber-400" />
                    <span>Statutory Council Software License &amp; Compliance (सॉफ्टवेयर लाइसेंस विवरण)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Bar Council of Uttar Pradesh के लिए अधिकृत एंटरप्राइज सॉफ्टवेयर लाइसेंस, 75 ज़िला बार एसोसिएशन संबद्धता व डिजिटल सुरक्षा मानक।
                  </p>
                </div>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verified Active Statutory License</span>
                </span>
              </div>

              {/* Internal License Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Left Card: Official License Specs */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                    🏛️ State Bar Council Official SaaS License Record
                  </span>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-400">Jurisdiction Entity:</span>
                      <span className="font-bold text-slate-100">Bar Council of Uttar Pradesh</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-400">Master License Key:</span>
                      <span className="font-mono font-bold text-amber-300">LIC-STATE-BAR-UP-2026-9901</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-400">Statutory Tier:</span>
                      <span className="font-bold text-red-300">CONSTITUTIONAL_APEX_COUNCIL</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-400">Authorized Territory:</span>
                      <span className="font-bold text-emerald-400">All 75 District Bar Associations</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-400">Licensed Admin ID:</span>
                      <span className="font-mono text-slate-200">stateadmin@upbarcouncil.org</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-400">License Status:</span>
                      <span className="font-bold text-emerald-400">🟢 ACTIVE &amp; VERIFIED</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Validity Period:</span>
                      <span className="font-semibold text-slate-200">Perpetual Statutory Enterprise (31-12-2099)</span>
                    </div>
                  </div>
                </div>

                {/* Right Card: Technical Compliance & Security */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block">
                    🛡️ Digital Audit &amp; Regulatory Compliance
                  </span>
                  
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-400">Statutory Standard:</span>
                      <span className="font-bold text-slate-200">The Advocates Act, 1961</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-400">Digital Ballot Security:</span>
                      <span className="font-bold text-purple-300">SHA-256 Cryptographic Hash</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-400">Data Architecture:</span>
                      <span className="font-bold text-slate-200">Multi-Tenant 75 District Partitioning</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-400">COP Authentication:</span>
                      <span className="font-bold text-emerald-400">Real-time Cross-Verification Active</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-400">Audit Trail:</span>
                      <span className="font-bold text-slate-200">Immutable State Roll Logs</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Platform Provider:</span>
                      <span className="font-semibold text-amber-300">Nyaay Sahayogi Judicial Software Systems</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-900">
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      यह लाइसेंस उत्तर प्रदेश राज्य विधिज्ञ परिषद को 75 ज़िलों की अधिवक्ता मतदाता सूची एवं राज्य चुनाव संचालन का पूर्ण वैधानिक अधिकार प्रदान करता है।
                    </p>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )
      )}

        {/* ============================================================== */}
        {/* TAB 5: STATE-WIDE NOTICE & NEWS CIRCULAR BROADCAST */}
        {/* ============================================================== */}
        {activeTab === 'broadcast' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-gradient-to-r from-red-950 via-slate-900 to-red-950 border-2 border-red-500/50 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Bell className="w-5 h-5 text-amber-400" />
                    <span>उत्तर प्रदेश राज्य विधिज्ञ परिषद - राज्यव्यापी विज्ञप्ति व नोटिस प्रसारण</span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    यहाँ से जारी की गई विज्ञप्ति/सर्कुलर उत्तर प्रदेश के सभी 75 जिला बार संघों के अधिवक्ताओं के मोबाइल ऐप में तुरंत पुश नोटिफिकेशन के रूप में पहुँचती है।
                  </p>
                </div>
                <span className="text-xs bg-red-600/30 text-red-200 border border-red-500/50 px-3 py-1 rounded-full font-bold flex items-center gap-1.5 whitespace-nowrap">
                  <Landmark className="w-3.5 h-3.5 text-red-400" />
                  <span>Apex Bar Circular System</span>
                </span>
              </div>

              {isStateBarAdmin ? (
                <form onSubmit={handleSendStateBroadcast} className="space-y-4 text-xs pt-2">
                  {sbNotifSuccess && (
                    <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-lg animate-fadeIn">
                      <BadgeCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      <span>विज्ञप्ति/सूचना समस्त 75 जिलों के अधिवक्ताओं के ऐप पर लाइव प्रसारित हो गई!</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        विज्ञप्ति का विषय / शीर्षक (Notice Title) *
                      </label>
                      <input
                        type="text"
                        required
                        value={sbNotifTitle}
                        onChange={(e) => setSbNotifTitle(e.target.value)}
                        placeholder="उदा. राज्य बार काउंसिल साधारण सभा बैठक / अधिवक्ता कल्याण निधि दिशानिर्देश"
                        className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-100 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        लक्षित जिला (Target District Jurisdiction)
                      </label>
                      <select
                        value={sbTargetDistrict}
                        onChange={(e) => setSbTargetDistrict(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 text-xs text-amber-300 font-bold rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-red-500 cursor-pointer"
                      >
                        <option value="ALL">🌟 समस्त 75 जिले (All 75 UP Districts)</option>
                        {UP_75_DISTRICTS.map((d, i) => (
                          <option key={`sb-notif-d-${i}`} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      विज्ञप्ति का पूरा संदेश (Detailed Official Message) *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={sbNotifMessage}
                      onChange={(e) => setSbNotifMessage(e.target.value)}
                      placeholder="उत्तर प्रदेश राज्य विधिज्ञ परिषद द्वारा सर्वसम्मति से प्रस्ताव पारित किया जाता है कि..."
                      className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-100 rounded-xl p-3.5 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-extrabold text-xs shadow-xl shadow-red-600/30 flex items-center gap-2 transition-all transform active:scale-95"
                  >
                    <Bell className="w-4 h-4 text-white" />
                    <span>📢 प्रसारण करें (Broadcast Official Notice)</span>
                  </button>
                </form>
              ) : (
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300">
                  <p className="font-semibold text-amber-400">
                    ℹ️ जिला बार संघ केवल राज्य बार द्वारा जारी विज्ञप्तियाँ व परिपत्र (Read-Only Bulletins) प्राप्त कर सकते हैं।
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    नया राज्यस्तरीय परिपत्र जारी करने का अधिकार केवल राज्य बार काउंसिल प्रयागराज मुख्यालय के पास है।
                  </p>
                </div>
              )}
            </div>

            {/* List of Recent State Bar Notifications */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <h4 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
                <FileText className="w-4 h-4 text-red-400" />
                <span>हाल ही में जारी राज्य बार परिपत्र व विज्ञप्तियाँ (Official State Circulars Log)</span>
              </h4>

              <div className="space-y-3">
                {db.getNotifications().map((n) => (
                  <div key={n.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1.5 hover:border-red-500/30 transition-all">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-red-300 bg-red-950/60 px-2.5 py-0.5 rounded-full border border-red-500/40">
                        {n.title}
                      </span>
                      <span className="text-slate-500 font-mono">{n.createdAt}</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed pt-1">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ============================================================== */}
      {/* MODAL: SUCCESSFUL ENROLLMENT ON STATE ROLL */}
      {/* ============================================================== */}
      {enrollSuccessModal?.open && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-emerald-500 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <BadgeCheck className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-lg font-black text-white">पंजीकरण सफलतापूर्वक संपन्न!</h3>
              <p className="text-xs text-slate-300 mt-1">
                अधिवक्ता का प्रथम पंजीकरण <strong>Bar Council of Uttar Pradesh</strong> के स्टेट रोल में दर्ज हो चुका है।
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">अधिवक्ता:</span>
                <span className="font-bold text-white">{enrollSuccessModal.advocateName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">State Registration No:</span>
                <span className="font-mono font-bold text-amber-300">{enrollSuccessModal.stateRegNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">COP Number:</span>
                <span className="font-mono text-emerald-400 font-bold">{enrollSuccessModal.copNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Allotted District Bar:</span>
                <span className="font-bold text-slate-200">{enrollSuccessModal.districtBar}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              इस <strong>State Registration No ({enrollSuccessModal.stateRegNo})</strong> का उपयोग करके अधिवक्ता अब अपनी जिला बार एसोसिएशन में पंजीकृत होकर प्रैक्टिस कर सकता है।
            </p>

            <button
              type="button"
              onClick={() => setEnrollSuccessModal(null)}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg transition-all"
            >
              पूर्ण हुआ (Done)
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: CREATE NEW ELECTORAL POST */}
      {/* ============================================================== */}
      {isCreatePostModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <span>नया राज्य बार चुनावी पद जोड़ें (Create Post)</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCreatePostModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  पद का नाम (Title in English) *
                </label>
                <input
                  type="text"
                  required
                  value={postForm.title}
                  onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                  placeholder="e.g. Chairman / Vice Chairman / Member BCI / Treasurer"
                  className="w-full bg-slate-800 border border-slate-700 text-xs text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  पद का नाम (हिंदी)
                </label>
                <input
                  type="text"
                  value={postForm.hindiTitle}
                  onChange={(e) => setPostForm({ ...postForm, hindiTitle: e.target.value })}
                  placeholder="उदा. अध्यक्ष / उपाध्यक्ष / सदस्य बार काउंसिल ऑफ इंडिया"
                  className="w-full bg-slate-800 border border-slate-700 text-xs text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    श्रेणी (Category)
                  </label>
                  <select
                    value={postForm.category}
                    onChange={(e) => setPostForm({ ...postForm, category: e.target.value as any })}
                    className="w-full bg-slate-800 border border-slate-700 text-xs text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-red-500 cursor-pointer"
                  >
                    <option value="Apex">Apex (शीर्ष पद)</option>
                    <option value="Council">Council Member (परिषद सदस्य)</option>
                    <option value="Welfare">Welfare Committee (कल्याण समिति)</option>
                    <option value="Disciplinary">Disciplinary (अनुशासनात्मक समिति)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    सीटों की संख्या (Seats)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={25}
                    value={postForm.seatsCount}
                    onChange={(e) => setPostForm({ ...postForm, seatsCount: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 text-xs text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  पद विवरण (Description)
                </label>
                <textarea
                  rows={2}
                  value={postForm.description}
                  onChange={(e) => setPostForm({ ...postForm, description: e.target.value })}
                  placeholder="e.g. Constitutional executive head of the Bar Council of Uttar Pradesh."
                  className="w-full bg-slate-800 border border-slate-700 text-xs text-white rounded-xl px-3.5 py-2 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatePostModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg"
                >
                  पद सेव करें (Save Post)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: NOMINATE CANDIDATE */}
      {/* ============================================================== */}
      {isNominateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-red-400" />
                <span>प्रत्याशी नामांकन (Nominate Candidate)</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsNominateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleNominateCandidate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  प्रत्याशी का नाम (Candidate Name) *
                </label>
                <input
                  type="text"
                  required
                  value={candidateForm.name}
                  onChange={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })}
                  placeholder="उदा. Adv. Dr. Dharmendra Pratap Singh"
                  className="w-full bg-slate-800 border border-slate-700 text-xs text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    चुनावी पद (Select Post) *
                  </label>
                  <select
                    required
                    value={candidateForm.postKey}
                    onChange={(e) => setCandidateForm({ ...candidateForm, postKey: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-xs text-amber-300 font-bold rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-red-500 cursor-pointer"
                  >
                    <option value="">-- पद चुनें --</option>
                    {electionPosts.map((p, idx) => (
                      <option key={`p-opt-${idx}`} value={p.key}>
                        {p.title} ({p.hindiTitle})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    गृह जिला बार एसोसिएशन
                  </label>
                  <select
                    value={candidateForm.districtBar}
                    onChange={(e) => setCandidateForm({ ...candidateForm, districtBar: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-xs text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-red-500 cursor-pointer"
                  >
                    {UP_75_DISTRICTS.map((d, idx) => (
                      <option key={`c-dist-${idx}`} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    State Reg No (UP/...)
                  </label>
                  <input
                    type="text"
                    value={candidateForm.stateRegNo}
                    onChange={(e) => setCandidateForm({ ...candidateForm, stateRegNo: e.target.value })}
                    placeholder="UP/3412/1992"
                    className="w-full bg-slate-800 border border-slate-700 text-xs text-amber-300 font-mono rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    वकालत अनुभव (Standing Years)
                  </label>
                  <input
                    type="number"
                    value={candidateForm.standingYears}
                    onChange={(e) => setCandidateForm({ ...candidateForm, standingYears: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 text-xs text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  चुनावी घोषणा पत्र / संकल्प (Manifesto / Agenda)
                </label>
                <textarea
                  rows={2}
                  value={candidateForm.agenda}
                  onChange={(e) => setCandidateForm({ ...candidateForm, agenda: e.target.value })}
                  placeholder="उदा. Advocate Protection Act implementation, Health Insurance ₹10 Lakh..."
                  className="w-full bg-slate-800 border border-slate-700 text-xs text-white rounded-xl px-3.5 py-2 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNominateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg"
                >
                  नामांकन दर्ज करें (Nominate)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
