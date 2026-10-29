import React, { useState } from 'react';
import {
  ShieldAlert,
  Users,
  CheckCircle2,
  XCircle,
  IndianRupee,
  FileSpreadsheet,
  Plus,
  BarChart3,
  PieChart as PieIcon,
  Search,
  AlertTriangle,
  Bell,
  Calendar,
  Vote,
  Award,
  Trash2,
  Edit3,
  Layers,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Clock,
  RotateCcw,
  Check,
  Briefcase,
  Phone,
  Mail,
  UserPlus,
  Upload,
  Image as ImageIcon,
  Scale,
  Gavel,
  Building2,
  ListChecks,
  KeyRound,
  Lock,
  Crown,
  SlidersHorizontal,
  Landmark,
  BadgeCheck,
  ShieldCheck,
  Printer,
  Download,
  Filter,
  ChevronRight,
  Eye,
  FileText,
  ExternalLink
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Advocate,
  Earning,
  Expense,
  FinanceCategory,
  ElectionPost,
  ElectionCandidate,
  CommitteeMember,
  CourtMaster,
  CaseStageMaster,
  CourtType,
  TenantOrganization,
  StateBarElectionPost,
  StateBarElectionCandidate,
  StateBarVote,
  StateBarElectionConfig,
  StateBarVoterEligibility,
  ALL_UP_DISTRICTS,
  NotificationItem
} from '../types';
import { db } from '../lib/store';
import { sendLocalPushNotification } from '../services/fcmService';
import { ALL_FEATURE_MODULES } from '../lib/modulesConfig';
import { exportFinanceLedgerToExcel } from '../lib/excelExport';
import { TenantDropdownCustomizer } from '../components/TenantDropdownCustomizer';
import { AdvocateLogo } from '../components/AdvocateLogo';
import { broadcastMessage } from '../services/RealtimeSyncEngine';

interface AdminPanelViewProps {
  onLogout: () => void;
  onNavigateToSuperAdmin?: () => void;
  onNavigateToStateBarPortal?: () => void;
  currentUser?: Advocate | null;
  initialTab?: 'members' | 'finance' | 'categories' | 'elections' | 'state_bar' | 'committee' | 'broadcast' | 'courts_stages' | 'license_profile';
}

const COLORS = ['#d4af37', '#3b82f6', '#10b981', '#f43f5e', '#8b5cf6', '#ec4899', '#06b6d4', '#f59e0b'];

export const AdminPanelView: React.FC<AdminPanelViewProps> = ({
  onLogout,
  onNavigateToSuperAdmin,
  onNavigateToStateBarPortal,
  currentUser,
  initialTab
}) => {
  const [advocates, setAdvocates] = useState<Advocate[]>(db.getAdvocates());
  const [earnings, setEarnings] = useState<Earning[]>(db.getEarnings());
  const [expenses, setExpenses] = useState<Expense[]>(db.getExpenses());
  const [categories, setCategories] = useState<FinanceCategory[]>(db.getFinanceCategories());
  const [electionPosts, setElectionPosts] = useState<ElectionPost[]>(db.getElectionPosts());
  const [candidates, setCandidates] = useState<ElectionCandidate[]>(db.getElectionCandidates());
  const [committee, setCommittee] = useState<CommitteeMember[]>(db.getCommittee());
  const [courts, setCourts] = useState<CourtMaster[]>(db.getCourts());
  const [caseStages, setCaseStages] = useState<CaseStageMaster[]>(db.getCaseStages());
  const [currentTenant, setCurrentTenant] = useState<TenantOrganization>(db.getCurrentTenant());

  // Elections Subtab Switcher: District Bar vs State Bar Council
  const [electionAdminSubTab, setElectionAdminSubTab] = useState<'district' | 'state'>('state');
  const [stateConfig, setStateConfig] = useState<StateBarElectionConfig>(db.getStateBarConfig());
  const [statePosts, setStatePosts] = useState<StateBarElectionPost[]>(db.getStateBarElectionPosts());
  const [stateCandidates, setStateCandidates] = useState<StateBarElectionCandidate[]>(db.getStateBarElectionCandidates());
  const [stateVotes, setStateVotes] = useState<StateBarVote[]>(db.getStateBarVotes());

  // State Election Post Modal State
  const [isStatePostModalOpen, setIsStatePostModalOpen] = useState(false);
  const [editingStatePost, setEditingStatePost] = useState<StateBarElectionPost | null>(null);
  const [statePostTitle, setStatePostTitle] = useState('');
  const [statePostHindiTitle, setStatePostHindiTitle] = useState('');
  const [statePostKey, setStatePostKey] = useState('');
  const [statePostSeats, setStatePostSeats] = useState<number>(1);
  const [statePostOrder, setStatePostOrder] = useState<number>(1);
  const [statePostDesc, setStatePostDesc] = useState('');
  const [statePostCategory, setStatePostCategory] = useState<'Apex' | 'Council' | 'Welfare' | 'Disciplinary'>('Council');

  // State Election Candidate Modal State
  const [isStateCandModalOpen, setIsStateCandModalOpen] = useState(false);
  const [editingStateCand, setEditingStateCand] = useState<StateBarElectionCandidate | null>(null);
  const [stateCandName, setStateCandName] = useState('');
  const [stateCandHindiName, setStateCandHindiName] = useState('');
  const [stateCandStateReg, setStateCandStateReg] = useState('');
  const [stateCandCopNo, setStateCandCopNo] = useState('');
  const [stateCandDistrict, setStateCandDistrict] = useState('Ballia (बलिया)');
  const [stateCandPost, setStateCandPost] = useState('STATE_CHAIRMAN');
  const [stateCandStanding, setStateCandStanding] = useState<number>(15);
  const [stateCandDesignation, setStateCandDesignation] = useState('');
  const [stateCandPhoto, setStateCandPhoto] = useState('');
  const [stateCandAgenda, setStateCandAgenda] = useState('');

  // State Bar 75 Districts Master Voter Roll State
  const [stateVoters, setStateVoters] = useState<StateBarVoterEligibility[]>(db.getStateBarVoterRoll());
  const [stateVoterDistrictFilter, setStateVoterDistrictFilter] = useState<string>('ALL');
  const [stateVoterSearch, setStateVoterSearch] = useState('');
  const [stateVoterStatusFilter, setStateVoterStatusFilter] = useState<'ALL' | 'VOTED' | 'NOT_VOTED' | 'COP_VALID' | 'COP_INVALID'>('ALL');
  const [isStateVoterModalOpen, setIsStateVoterModalOpen] = useState(false);
  const [editingStateVoter, setEditingStateVoter] = useState<StateBarVoterEligibility | null>(null);
  const [stateVoterFormName, setStateVoterFormName] = useState('');
  const [stateVoterFormHindiName, setStateVoterFormHindiName] = useState('');
  const [stateVoterFormRegNo, setStateVoterFormRegNo] = useState('');
  const [stateVoterFormCopNo, setStateVoterFormCopNo] = useState('');
  const [stateVoterFormDistrict, setStateVoterFormDistrict] = useState('Ballia (बलिया)');
  const [stateVoterFormTahsil, setStateVoterFormTahsil] = useState('Ballia Sadar');
  const [stateVoterFormMobile, setStateVoterFormMobile] = useState('');
  const [stateVoterFormEmail, setStateVoterFormEmail] = useState('');
  const [stateVoterFormChamber, setStateVoterFormChamber] = useState('');
  const [stateVoterFormExp, setStateVoterFormExp] = useState<number>(10);
  const [stateVoterFormSpec, setStateVoterFormSpec] = useState('CRIMINAL, CIVIL');
  const [stateVoterFormStatus, setStateVoterFormStatus] = useState<'APPROVED' | 'PENDING' | 'SUSPENDED'>('APPROVED');
  const [stateVoterFormCopValid, setStateVoterFormCopValid] = useState<boolean>(true);

  // Print Voter Roll Modal
  const [isPrintRollModalOpen, setIsPrintRollModalOpen] = useState(false);
  const [printRollDistrict, setPrintRollDistrict] = useState<string>('Ballia (बलिया)');

  const [activeTab, setActiveTab] = useState<'members' | 'finance' | 'categories' | 'elections' | 'state_bar' | 'committee' | 'broadcast' | 'courts_stages' | 'license_profile'>(
    (initialTab as any) || (currentUser?.role === 'state_bar_admin' ? 'state_bar' : 'members')
  );
  const [memberFilter, setMemberFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [searchMember, setSearchMember] = useState('');
  const [financePeriodFilter, setFinancePeriodFilter] = useState<'ALL' | 'TODAY' | 'MONTH'>('ALL');

  // Courts & Case Stages Management State
  const [courtsSubTab, setCourtsSubTab] = useState<'customizer' | 'courts' | 'stages'>('customizer');
  const [courtSearch, setCourtSearch] = useState('');
  const [courtTypeFilter, setCourtTypeFilter] = useState<string>('ALL');
  const [stageSearch, setStageSearch] = useState('');
  const [stageCategoryFilter, setStageCategoryFilter] = useState<string>('ALL');

  // Court Modal State
  const [isCourtModalOpen, setIsCourtModalOpen] = useState(false);
  const [editingCourt, setEditingCourt] = useState<CourtMaster | null>(null);
  const [courtFormName, setCourtFormName] = useState('');
  const [courtFormHindiName, setCourtFormHindiName] = useState('');
  const [courtFormType, setCourtFormType] = useState<CourtType>('District & Sessions Court');
  const [courtFormRoomNo, setCourtFormRoomNo] = useState('');
  const [courtFormPresidingOfficer, setCourtFormPresidingOfficer] = useState('');
  const [courtFormOrder, setCourtFormOrder] = useState<number>(1);
  const [courtFormIsActive, setCourtFormIsActive] = useState<boolean>(true);

  // Case Stage Modal State
  const [isStageModalOpen, setIsStageModalOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<CaseStageMaster | null>(null);
  const [stageFormName, setStageFormName] = useState('');
  const [stageFormHindiName, setStageFormHindiName] = useState('');
  const [stageFormCategory, setStageFormCategory] = useState<'General' | 'Criminal' | 'Civil' | 'Revenue'>('General');
  const [stageFormOrder, setStageFormOrder] = useState<number>(1);
  const [stageFormDescription, setStageFormDescription] = useState('');
  const [stageFormIsActive, setStageFormIsActive] = useState<boolean>(true);

  // Record Expense Modal State
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState<number>(2500);
  const [expCategory, setExpCategory] = useState<string>('Bar Maintenance');
  const [expMode, setExpMode] = useState('Bank Transfer');
  const [expVoucher, setExpVoucher] = useState('');
  const [expDate, setExpDate] = useState(new Date().toLocaleDateString('en-GB'));

  // Record Earning / Income Modal State
  const [isAddEarningOpen, setIsAddEarningOpen] = useState(false);
  const [earnAdvName, setEarnAdvName] = useState('');
  const [earnBarNo, setEarnBarNo] = useState('');
  const [earnAmount, setEarnAmount] = useState<number>(1200);
  const [earnPurpose, setEarnPurpose] = useState<string>('Annual Membership Subscription');
  const [earnMode, setEarnMode] = useState('UPI / QR');
  const [earnTxnId, setEarnTxnId] = useState('');
  const [earnDate, setEarnDate] = useState(new Date().toLocaleDateString('en-GB'));

  // Category Management Modal & Edit state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<FinanceCategory | null>(null);
  const [catName, setCatName] = useState('');
  const [catHindiName, setCatHindiName] = useState('');
  const [catType, setCatType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [catDesc, setCatDesc] = useState('');

  // Election Post Modal & State
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<ElectionPost | null>(null);
  const [postTitle, setPostTitle] = useState('');
  const [postHindiTitle, setPostHindiTitle] = useState('');
  const [postKey, setPostKey] = useState('');
  const [postDesc, setPostDesc] = useState('');
  const [postOrder, setPostOrder] = useState<number>(1);
  const [postSeatsCount, setPostSeatsCount] = useState<number>(1);

  // In-App Confirm Modal State (Safe for iframe preview, replaces window.confirm)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    danger?: boolean;
    onConfirm: () => void;
  } | null>(null);

  // Candidate Modal & State
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<ElectionCandidate | null>(null);
  const [candName, setCandName] = useState('');
  const [candBarNo, setCandBarNo] = useState('');
  const [candPost, setCandPost] = useState('PRESIDENT');
  const [candPhoto, setCandPhoto] = useState('');
  const [candAgenda, setCandAgenda] = useState('');

  // Committee Member Modal & State
  const [isCommitteeModalOpen, setIsCommitteeModalOpen] = useState(false);
  const [editingCommittee, setEditingCommittee] = useState<CommitteeMember | null>(null);
  const [commName, setCommName] = useState('');
  const [commPost, setCommPost] = useState('');
  const [commHindiPost, setCommHindiPost] = useState('');
  const [commSession, setCommSession] = useState('2026-2027');
  const [commBarNo, setCommBarNo] = useState('');
  const [commMobile, setCommMobile] = useState('');
  const [commEmail, setCommEmail] = useState('');
  const [commPhoto, setCommPhoto] = useState('');
  const [commIsCurrent, setCommIsCurrent] = useState(true);
  const [commOrder, setCommOrder] = useState<number>(1);
  const [selectedCommitteeSession, setSelectedCommitteeSession] = useState<string>('ALL');

  // Broadcast state
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifSuccess, setNotifSuccess] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(db.getNotifications());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const refreshData = () => {
    setAdvocates(db.getAdvocates());
    setEarnings(db.getEarnings());
    setExpenses(db.getExpenses());
    setCategories(db.getFinanceCategories());
    setElectionPosts(db.getElectionPosts());
    setCandidates(db.getElectionCandidates());
    setStatePosts(db.getStateBarElectionPosts());
    setStateCandidates(db.getStateBarElectionCandidates());
    setStateVotes(db.getStateBarVotes());
    setStateVoters(db.getStateBarVoterRoll());
    setStateConfig(db.getStateBarConfig());
    setCommittee(db.getCommittee());
    setCourts(db.getCourts());
    setCaseStages(db.getCaseStages());
    setCurrentTenant(db.getCurrentTenant());
    setNotifications(db.getNotifications());
  };

  React.useEffect(() => {
    const handleSync = () => {
      refreshData();
    };
    window.addEventListener('crba_state_updated', handleSync);
    // Continuous smart synchronization polling across devices (mobile <-> laptop)
    const interval = setInterval(refreshData, 2500);
    return () => {
      window.removeEventListener('crba_state_updated', handleSync);
      clearInterval(interval);
    };
  }, []);

  // Helper date checking
  const todayStr = new Date().toLocaleDateString('en-GB'); // "DD/MM/YYYY"
  const currentMonthStr = `${(new Date().getMonth() + 1).toString().padStart(2, '0')}/${new Date().getFullYear()}`;

  const isToday = (dateStr?: string) => {
    if (!dateStr) return false;
    return dateStr.trim().startsWith(todayStr);
  };

  const isCurrentMonth = (dateStr?: string) => {
    if (!dateStr) return false;
    return dateStr.includes(currentMonthStr) || dateStr.endsWith(`/${new Date().getFullYear()}`);
  };

  // Financial Calculations
  const totalRevenue = earnings.reduce((sum, e) => sum + e.amount, 0);
  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netReserve = totalRevenue - totalExpense;

  // Today's Financial Activity
  const todayEarnings = earnings
    .filter(e => isToday(e.date) || isToday(e.createdAt))
    .reduce((sum, e) => sum + e.amount, 0);

  const todayExpenses = expenses
    .filter(e => isToday(e.date) || isToday(e.createdAt))
    .reduce((sum, e) => sum + e.amount, 0);

  const todayNet = todayEarnings - todayExpenses;

  // Member stats - both PENDING_APPROVAL and PENDING are counted
  const pendingMembers = advocates.filter(a => a.status === 'PENDING_APPROVAL' || a.status === 'PENDING').length;
  const approvedMembers = advocates.filter(a => a.status === 'APPROVED').length;

  // Filtered earnings and expenses based on period selector
  const filteredEarnings = earnings.filter(e => {
    if (financePeriodFilter === 'TODAY') return isToday(e.date) || isToday(e.createdAt);
    if (financePeriodFilter === 'MONTH') return isCurrentMonth(e.date) || isCurrentMonth(e.createdAt);
    return true;
  });

  const filteredExpenses = expenses.filter(e => {
    if (financePeriodFilter === 'TODAY') return isToday(e.date) || isToday(e.createdAt);
    if (financePeriodFilter === 'MONTH') return isCurrentMonth(e.date) || isCurrentMonth(e.createdAt);
    return true;
  });

  // Recharts Chart Data
  const monthlyFinanceData = [
    { month: 'Nov 2025', Income: 85000, Expense: 42000 },
    { month: 'Dec 2025', Income: 92000, Expense: 51000 },
    { month: 'Jan 2026', Income: 110000, Expense: 48000 },
    { month: 'Feb 2026', Income: 140000, Expense: 62000 },
    { month: 'Mar 2026', Income: totalRevenue, Expense: totalExpense }
  ];

  const categoryMap: Record<string, number> = {};
  expenses.forEach(ex => {
    categoryMap[ex.category] = (categoryMap[ex.category] || 0) + ex.amount;
  });
  const expensePieData = Object.keys(categoryMap).map(cat => ({
    name: cat,
    value: categoryMap[cat]
  }));

  // Handlers for Member Approvals
  const [isAddAdvocateModalOpen, setIsAddAdvocateModalOpen] = useState(false);
  const [newAdvForm, setNewAdvForm] = useState({
    name: '',
    fatherName: '',
    dob: '15/08/1990',
    barNo: '',
    copNo: '',
    mobile: '',
    email: '',
    password: 'Advocate@123',
    village: '',
    tahsil: 'Ballia Sadar',
    policeStation: 'Kotwali Ballia',
    chamberNo: '',
    experienceYears: 5,
    specialization: 'CRIMINAL, CIVIL',
    photoUrl: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&auto=format&fit=crop&q=80'
  });

  const handleAutoVerifyFromStateRoll = () => {
    const query = (newAdvForm.barNo || newAdvForm.copNo || newAdvForm.mobile).trim().toLowerCase();
    if (!query) {
      showToast('कृपया स्टेट बार से खोजने हेतु पहले Bar Reg. No. या COP No. दर्ज करें।');
      return;
    }
    const matchedRoll = db.getStateBarVoterRoll().find(
      v =>
        v.stateRegNo.toLowerCase().includes(query) ||
        v.copNo.toLowerCase().includes(query) ||
        (v.mobile && v.mobile.includes(query))
    );
    if (matchedRoll) {
      const rollAny = matchedRoll as unknown as Record<string, string | undefined>;
      setNewAdvForm(prev => ({
        ...prev,
        name: matchedRoll.advocateName || prev.name,
        fatherName: rollAny.fatherName || prev.fatherName,
        dob: rollAny.dob || prev.dob,
        barNo: matchedRoll.stateRegNo || prev.barNo,
        copNo: matchedRoll.copNo || prev.copNo,
        mobile: matchedRoll.mobile || prev.mobile,
        email: matchedRoll.email || prev.email,
        tahsil: matchedRoll.tahsil || prev.tahsil,
        chamberNo: matchedRoll.chamberNo || prev.chamberNo
      }));
      showToast(`✅ State Bar Roll से सत्यापित: ${matchedRoll.advocateName}`);
    } else {
      showToast('State Bar Roll में यह नंबर नहीं मिला — आप मैनुअल विवरण भरकर जोड़ सकते हैं।');
    }
  };

  const handleCreateAdvocateByAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdvForm.name.trim() || !newAdvForm.barNo.trim() || !newAdvForm.mobile.trim()) {
      showToast('कृपया अधिवक्ता का नाम, बार रजिस्ट्रेशन नंबर और मोबाइल नंबर अवश्य भरें।');
      return;
    }

    const specs = newAdvForm.specialization
      .split(',')
      .map(s => s.trim().toUpperCase())
      .filter(s => ['CRIMINAL', 'REVENUE', 'CIVIL', 'MATRIMONIAL'].includes(s)) as ('CRIMINAL' | 'REVENUE' | 'CIVIL' | 'MATRIMONIAL')[];

    const newAdv: Advocate = {
      id: 'adv_' + Date.now(),
      name: newAdvForm.name.trim(),
      fatherName: newAdvForm.fatherName.trim() || 'Shri',
      dob: newAdvForm.dob.trim() || '01/01/1990',
      age: 35,
      address: {
        village: newAdvForm.village.trim() || currentTenant.district || 'Ballia',
        post: currentTenant.district || 'Ballia City',
        tahsil: newAdvForm.tahsil.trim() || 'Sadar',
        policeStation: newAdvForm.policeStation.trim() || 'Kotwali',
        district: currentTenant.district || 'Ballia',
        state: currentTenant.state || 'Uttar Pradesh',
        pincode: '277001'
      },
      barNo: newAdvForm.barNo.trim(),
      copNo: newAdvForm.copNo.trim() || 'COP/UP/' + new Date().getFullYear() + '/' + Math.floor(1000 + Math.random() * 9000),
      mobile: newAdvForm.mobile.trim(),
      email: newAdvForm.email.trim() || `${newAdvForm.barNo.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}@barballia.com`,
      password: newAdvForm.password.trim() || 'Advocate@123',
      photoUrl: newAdvForm.photoUrl.trim() || 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&auto=format&fit=crop&q=80',
      status: 'APPROVED',
      role: 'advocate',
      tenantId: currentTenant.id,
      validTill: '31/12/2027',
      createdAt: todayStr,
      rating: 4.9,
      reviewCount: 1,
      specialization: specs.length > 0 ? specs : ['CRIMINAL', 'CIVIL'],
      isTopCriminalLawyer: false,
      chamberNo: newAdvForm.chamberNo.trim() || 'Bar Hall Chamber',
      experienceYears: Number(newAdvForm.experienceYears) || 5
    };

    db.addAdvocate(newAdv);
    setIsAddAdvocateModalOpen(false);
    setNewAdvForm({
      name: '',
      fatherName: '',
      dob: '15/08/1990',
      barNo: '',
      copNo: '',
      mobile: '',
      email: '',
      password: 'Advocate@123',
      village: '',
      tahsil: 'Ballia Sadar',
      policeStation: 'Kotwali Ballia',
      chamberNo: '',
      experienceYears: 5,
      specialization: 'CRIMINAL, CIVIL',
      photoUrl: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&auto=format&fit=crop&q=80'
    });
    refreshData();
    showToast(`✅ अधिवक्ता "${newAdv.name}" (${newAdv.barNo}) को बार सदस्य के रूप में सफलतापूर्वक जोड़ दिया गया!`);
  };

  const handleApprove = (advId: string) => {
    db.updateAdvocate(advId, { status: 'APPROVED' });
    refreshData();
    showToast('Member advocate application approved successfully!');
  };

  const handleReject = (advId: string) => {
    db.updateAdvocate(advId, { status: 'REJECTED' });
    refreshData();
    showToast('Member application marked as rejected.');
  };

  const handleDeleteAdvocate = (adv: Advocate) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Advocate Record (अधिवक्ता विवरण डिलीट करें)',
      message: `क्या आप अधिवक्ता "${adv.name}" (${adv.barNo}) का रिकॉर्ड बार सिस्टम से स्थायी रूप से हटाना/डिलीट करना चाहते हैं?`,
      confirmLabel: 'Yes, Delete (हाँ, डिलीट करें)',
      danger: true,
      onConfirm: () => {
        db.deleteAdvocate(adv.id);
        refreshData();
        showToast(`Advocate "${adv.name}" deleted successfully.`);
        setConfirmModal(null);
      }
    });
  };

  const handleToggleTopCriminal = (adv: Advocate) => {
    db.updateAdvocate(adv.id, { isTopCriminalLawyer: !adv.isTopCriminalLawyer });
    refreshData();
    showToast(`Updated emergency counsel status for ${adv.name}`);
  };

  // Handlers for Expenses
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle || !expAmount) return;

    const newExp: Expense = {
      id: 'exp_' + Date.now(),
      purposeTitle: expTitle,
      amount: Number(expAmount),
      date: expDate || todayStr,
      category: expCategory || 'Bar Maintenance',
      mode: expMode,
      voucherNo: expVoucher || 'VCH/' + new Date().getFullYear() + '/' + Date.now().toString().slice(-4),
      approvedBy: 'Secretary & President, Ballia Bar',
      createdAt: todayStr
    };

    db.addExpense(newExp);
    setIsAddExpenseOpen(false);
    setExpTitle('');
    setExpVoucher('');
    refreshData();
    showToast(`Recorded expense of ₹${expAmount.toLocaleString('en-IN')}`);
  };

  const handleDeleteExpense = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Expense Record (व्यय प्रविष्टि हटाएं)',
      message: 'Are you sure you want to delete this expense record from the ledger?',
      confirmLabel: 'Yes, Delete (हटाएं)',
      danger: true,
      onConfirm: () => {
        db.deleteExpense(id);
        refreshData();
        showToast('Expense entry removed from ledger.');
        setConfirmModal(null);
      }
    });
  };

  // Handlers for Earnings / Income
  const handleAddEarning = (e: React.FormEvent) => {
    e.preventDefault();
    if (!earnAdvName || !earnAmount) return;

    const newEarn: Earning = {
      id: 'earn_' + Date.now(),
      advocateId: 'adv_manual_' + Date.now(),
      advocateName: earnAdvName,
      barNo: earnBarNo || 'UP/GEN/' + new Date().getFullYear(),
      amount: Number(earnAmount),
      purpose: earnPurpose || 'Annual Membership Subscription',
      mode: earnMode,
      txnId: earnTxnId || 'MANUAL/CASH/' + Date.now().toString().slice(-5),
      date: earnDate || todayStr,
      createdAt: todayStr
    };

    db.addEarning(newEarn);
    setIsAddEarningOpen(false);
    setEarnAdvName('');
    setEarnBarNo('');
    setEarnTxnId('');
    refreshData();
    showToast(`Recorded income receipt of ₹${earnAmount.toLocaleString('en-IN')}`);
  };

  const handleDeleteEarning = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Income Receipt (आय प्रविष्टि हटाएं)',
      message: 'Are you sure you want to delete this earning receipt from the ledger?',
      confirmLabel: 'Yes, Delete (हटाएं)',
      danger: true,
      onConfirm: () => {
        db.deleteEarning(id);
        refreshData();
        showToast('Income entry removed from ledger.');
        setConfirmModal(null);
      }
    });
  };

  // Handlers for Categories
  const openAddCategoryModal = (type: 'INCOME' | 'EXPENSE') => {
    setEditingCategory(null);
    setCatType(type);
    setCatName('');
    setCatHindiName('');
    setCatDesc('');
    setIsCategoryModalOpen(true);
  };

  const openEditCategoryModal = (cat: FinanceCategory) => {
    setEditingCategory(cat);
    setCatType(cat.type);
    setCatName(cat.name);
    setCatHindiName(cat.hindiName || '');
    setCatDesc(cat.description || '');
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    if (editingCategory) {
      const updated: FinanceCategory = {
        ...editingCategory,
        name: catName.trim(),
        hindiName: catHindiName.trim() || undefined,
        type: catType,
        description: catDesc.trim() || undefined
      };
      db.updateFinanceCategory(updated);
      showToast(`Category "${updated.name}" updated successfully!`);
    } else {
      const newCat: FinanceCategory = {
        id: 'fcat_' + Date.now(),
        name: catName.trim(),
        hindiName: catHindiName.trim() || undefined,
        type: catType,
        description: catDesc.trim() || undefined
      };
      db.addFinanceCategory(newCat);
      showToast(`New ${catType} category added!`);
    }

    setIsCategoryModalOpen(false);
    refreshData();
  };

  const handleDeleteCategory = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Category (श्रेणी हटाएं)',
      message: `Are you sure you want to delete the category "${name}"? Future financial transactions will no longer list this category.`,
      confirmLabel: 'Yes, Delete (हटाएं)',
      danger: true,
      onConfirm: () => {
        db.deleteFinanceCategory(id);
        refreshData();
        showToast(`Category "${name}" deleted successfully.`);
        setConfirmModal(null);
      }
    });
  };

  // Handlers for Election Posts
  const openAddPostModal = () => {
    setEditingPost(null);
    setPostTitle('');
    setPostHindiTitle('');
    setPostKey('');
    setPostDesc('');
    setPostOrder(electionPosts.length + 1);
    setPostSeatsCount(1);
    setIsPostModalOpen(true);
  };

  const openEditPostModal = (p: ElectionPost) => {
    setEditingPost(p);
    setPostTitle(p.title);
    setPostHindiTitle(p.hindiTitle);
    setPostKey(p.key);
    setPostDesc(p.description || '');
    setPostOrder(p.order || 1);
    setPostSeatsCount(p.seatsCount || 1);
    setIsPostModalOpen(true);
  };

  const handleSavePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim()) return;

    const generatedKey = postKey.trim() || postTitle.trim().toUpperCase().replace(/[^A-Z0-9]/g, '_');
    const safeSeatsCount = Math.max(1, Number(postSeatsCount) || 1);

    if (editingPost) {
      const updated: ElectionPost = {
        ...editingPost,
        title: postTitle.trim(),
        hindiTitle: postHindiTitle.trim() || postTitle.trim(),
        key: generatedKey,
        description: postDesc.trim() || undefined,
        order: Number(postOrder) || 1,
        seatsCount: safeSeatsCount
      };
      db.updateElectionPost(updated);
      showToast(`Election post "${updated.title}" (${safeSeatsCount} Seats) updated.`);
    } else {
      const newPost: ElectionPost = {
        id: 'post_' + Date.now(),
        title: postTitle.trim(),
        hindiTitle: postHindiTitle.trim() || postTitle.trim(),
        key: generatedKey,
        description: postDesc.trim() || undefined,
        order: Number(postOrder) || 1,
        seatsCount: safeSeatsCount
      };
      db.addElectionPost(newPost);
      showToast(`Added new election post: "${newPost.title}" with ${safeSeatsCount} seats`);
    }

    setIsPostModalOpen(false);
    refreshData();
  };

  const handleDeletePost = (id: string, title: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Election Post (पद हटाएं)',
      message: `Are you sure you want to delete the election post "${title}"?`,
      confirmLabel: 'Yes, Delete Post (पद हटाएं)',
      danger: true,
      onConfirm: () => {
        db.deleteElectionPost(id);
        refreshData();
        showToast(`Election post "${title}" deleted.`);
        setConfirmModal(null);
      }
    });
  };

  // Handlers for Election Candidates
  const openAddCandidateModal = () => {
    setEditingCandidate(null);
    setCandName('');
    setCandBarNo('');
    setCandPost(electionPosts[0]?.key || 'PRESIDENT');
    setCandPhoto('');
    setCandAgenda('');
    setIsCandidateModalOpen(true);
  };

  const openEditCandidateModal = (cand: ElectionCandidate) => {
    setEditingCandidate(cand);
    setCandName(cand.name);
    setCandBarNo(cand.barNo);
    setCandPost(cand.post);
    setCandPhoto(cand.photoUrl);
    setCandAgenda(cand.agenda);
    setIsCandidateModalOpen(true);
  };

  const handleSaveCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candName.trim() || !candBarNo.trim()) return;

    if (editingCandidate) {
      const updated: ElectionCandidate = {
        ...editingCandidate,
        name: candName.trim(),
        barNo: candBarNo.trim().toUpperCase(),
        post: candPost,
        photoUrl: candPhoto.trim() || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
        agenda: candAgenda.trim()
      };
      db.updateElectionCandidate(updated);
      showToast(`Candidate "${updated.name}" updated!`);
    } else {
      const newCand: ElectionCandidate = {
        id: 'cand_' + Date.now(),
        name: candName.trim(),
        barNo: candBarNo.trim().toUpperCase(),
        post: candPost,
        photoUrl: candPhoto.trim() || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
        agenda: candAgenda.trim(),
        votesCount: 0
      };
      db.addElectionCandidate(newCand);
      showToast(`Added candidate "${newCand.name}" for ${candPost}`);
    }

    setIsCandidateModalOpen(false);
    refreshData();
  };

  const handleDeleteCandidate = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Remove Candidate (प्रत्याशी हटाएं)',
      message: `Are you sure you want to remove candidate "${name}" from the election ballot?`,
      confirmLabel: 'Yes, Remove (हटाएं)',
      danger: true,
      onConfirm: () => {
        db.deleteElectionCandidate(id);
        refreshData();
        showToast(`Candidate "${name}" removed.`);
        setConfirmModal(null);
      }
    });
  };

  const handleResetVotes = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Reset Ballot Box (मतपेटिका रीसेट करें)',
      message: 'Are you sure you want to reset all candidate votes to zero and clear ballot records? This will restart the election tally from zero.',
      confirmLabel: 'Yes, Reset Votes (रीसेट करें)',
      danger: true,
      onConfirm: () => {
        db.resetElectionVotes();
        refreshData();
        showToast('All election votes have been reset to zero.');
        setConfirmModal(null);
      }
    });
  };

  // ==========================================
  // HANDLERS FOR STATE BAR COUNCIL ELECTIONS
  // ==========================================
  const openAddStatePostModal = () => {
    setEditingStatePost(null);
    setStatePostTitle('');
    setStatePostHindiTitle('');
    setStatePostKey('');
    setStatePostDesc('');
    setStatePostOrder(statePosts.length + 1);
    setStatePostSeats(1);
    setStatePostCategory('Council');
    setIsStatePostModalOpen(true);
  };

  const openEditStatePostModal = (p: StateBarElectionPost) => {
    setEditingStatePost(p);
    setStatePostTitle(p.title);
    setStatePostHindiTitle(p.hindiTitle);
    setStatePostKey(p.key);
    setStatePostDesc(p.description || '');
    setStatePostOrder(p.order || 1);
    setStatePostSeats(p.seatsCount || 1);
    setStatePostCategory(p.category || 'Council');
    setIsStatePostModalOpen(true);
  };

  const handleSaveStatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!statePostTitle.trim() || !statePostHindiTitle.trim()) return;

    const key = (statePostKey || statePostTitle.toUpperCase().replace(/\s+/g, '_')).trim();
    const safeSeatsCount = Math.max(1, Number(statePostSeats) || 1);

    if (editingStatePost) {
      const updated: StateBarElectionPost = {
        ...editingStatePost,
        title: statePostTitle.trim(),
        hindiTitle: statePostHindiTitle.trim(),
        key,
        description: statePostDesc.trim(),
        order: Number(statePostOrder) || 1,
        seatsCount: safeSeatsCount,
        category: statePostCategory
      };
      db.updateStateBarElectionPost(updated);
      showToast(`State Bar Post "${updated.title}" updated.`);
    } else {
      const newPost: StateBarElectionPost = {
        id: 'sb_post_' + Date.now(),
        title: statePostTitle.trim(),
        hindiTitle: statePostHindiTitle.trim(),
        key,
        description: statePostDesc.trim(),
        order: Number(statePostOrder) || (statePosts.length + 1),
        seatsCount: safeSeatsCount,
        category: statePostCategory
      };
      db.addStateBarElectionPost(newPost);
      showToast(`Added State Bar Post "${newPost.title}" (${safeSeatsCount} Seats).`);
    }

    setIsStatePostModalOpen(false);
    refreshData();
  };

  const handleDeleteStatePost = (id: string, title: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete State Election Post (राज्य पद हटाएं)',
      message: `Are you sure you want to delete State Bar Council post "${title}"?`,
      confirmLabel: 'Yes, Delete (हटाएं)',
      danger: true,
      onConfirm: () => {
        db.deleteStateBarElectionPost(id);
        refreshData();
        showToast(`State Election post "${title}" deleted.`);
        setConfirmModal(null);
      }
    });
  };

  const openAddStateCandModal = () => {
    setEditingStateCand(null);
    setStateCandName('');
    setStateCandHindiName('');
    setStateCandStateReg('');
    setStateCandCopNo('');
    setStateCandDistrict('Ballia (बलिया)');
    setStateCandPost(statePosts[0]?.key || 'STATE_CHAIRMAN');
    setStateCandStanding(15);
    setStateCandDesignation('');
    setStateCandPhoto('');
    setStateCandAgenda('');
    setIsStateCandModalOpen(true);
  };

  const openEditStateCandModal = (cand: StateBarElectionCandidate) => {
    setEditingStateCand(cand);
    setStateCandName(cand.name);
    setStateCandHindiName(cand.hindiName || '');
    setStateCandStateReg(cand.stateRegNo);
    setStateCandCopNo(cand.copNo);
    setStateCandDistrict(cand.districtBar);
    setStateCandPost(cand.post);
    setStateCandStanding(cand.standingYears || 10);
    setStateCandDesignation(cand.designation || '');
    setStateCandPhoto(cand.photoUrl);
    setStateCandAgenda(cand.agenda);
    setIsStateCandModalOpen(true);
  };

  const handleSaveStateCand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stateCandName.trim() || !stateCandStateReg.trim() || !stateCandCopNo.trim()) return;

    if (editingStateCand) {
      const updated: StateBarElectionCandidate = {
        ...editingStateCand,
        name: stateCandName.trim(),
        hindiName: stateCandHindiName.trim() || undefined,
        stateRegNo: stateCandStateReg.trim().toUpperCase(),
        copNo: stateCandCopNo.trim().toUpperCase(),
        districtBar: stateCandDistrict,
        post: stateCandPost,
        standingYears: Number(stateCandStanding) || 10,
        designation: stateCandDesignation.trim() || undefined,
        photoUrl: stateCandPhoto.trim() || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
        agenda: stateCandAgenda.trim()
      };
      db.updateStateBarElectionCandidate(updated);
      showToast(`State Candidate "${updated.name}" updated!`);
    } else {
      const newCand: StateBarElectionCandidate = {
        id: 'sb_cand_' + Date.now(),
        name: stateCandName.trim(),
        hindiName: stateCandHindiName.trim() || undefined,
        stateRegNo: stateCandStateReg.trim().toUpperCase(),
        copNo: stateCandCopNo.trim().toUpperCase(),
        districtBar: stateCandDistrict,
        post: stateCandPost,
        standingYears: Number(stateCandStanding) || 10,
        designation: stateCandDesignation.trim() || undefined,
        photoUrl: stateCandPhoto.trim() || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
        agenda: stateCandAgenda.trim(),
        votesCount: 0,
        districtVoteBreakdown: {}
      };
      db.addStateBarElectionCandidate(newCand);
      showToast(`Added State Candidate "${newCand.name}" from ${stateCandDistrict}`);
    }

    setIsStateCandModalOpen(false);
    refreshData();
  };

  const handleDeleteStateCand = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Remove State Candidate (राज्य प्रत्याशी हटाएं)',
      message: `Are you sure you want to remove State Bar Council candidate "${name}"?`,
      confirmLabel: 'Yes, Remove (हटाएं)',
      danger: true,
      onConfirm: () => {
        db.deleteStateBarElectionCandidate(id);
        refreshData();
        showToast(`State Candidate "${name}" removed.`);
        setConfirmModal(null);
      }
    });
  };

  const handleResetStateVotes = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Reset State Ballot Box (राज्य मतपेटिका रीसेट करें)',
      message: 'Are you sure you want to reset all State Bar Council candidate votes to zero and clear all state digital audit records across 75 districts? This action is irreversible.',
      confirmLabel: 'Yes, Reset State Votes',
      danger: true,
      onConfirm: () => {
        db.resetStateBarVotes();
        refreshData();
        showToast('All State Bar Council election votes have been reset to zero.');
        setConfirmModal(null);
      }
    });
  };

  // ==========================================
  // HANDLERS FOR 75 DISTRICTS MASTER VOTER ROLL
  // ==========================================
  const openAddStateVoterModal = () => {
    setEditingStateVoter(null);
    setStateVoterFormName('');
    setStateVoterFormHindiName('');
    setStateVoterFormRegNo('');
    setStateVoterFormCopNo('');
    setStateVoterFormDistrict(stateVoterDistrictFilter !== 'ALL' ? stateVoterDistrictFilter : 'Ballia (बलिया)');
    setStateVoterFormTahsil('Ballia Sadar');
    setStateVoterFormMobile('');
    setStateVoterFormEmail('');
    setStateVoterFormChamber('');
    setStateVoterFormExp(10);
    setStateVoterFormSpec('CRIMINAL, CIVIL');
    setStateVoterFormStatus('APPROVED');
    setStateVoterFormCopValid(true);
    setIsStateVoterModalOpen(true);
  };

  const openEditStateVoterModal = (voter: StateBarVoterEligibility) => {
    setEditingStateVoter(voter);
    setStateVoterFormName(voter.advocateName);
    setStateVoterFormHindiName(voter.hindiName || '');
    setStateVoterFormRegNo(voter.stateRegNo);
    setStateVoterFormCopNo(voter.copNo);
    setStateVoterFormDistrict(voter.districtBar);
    setStateVoterFormTahsil(voter.tahsil || 'Sadar');
    setStateVoterFormMobile(voter.mobile || '');
    setStateVoterFormEmail(voter.email || '');
    setStateVoterFormChamber(voter.chamberNo || '');
    setStateVoterFormExp(voter.experienceYears || 10);
    setStateVoterFormSpec(voter.specialization?.join(', ') || 'CRIMINAL, CIVIL');
    setStateVoterFormStatus(voter.status);
    setStateVoterFormCopValid(voter.isCopValid);
    setIsStateVoterModalOpen(true);
  };

  const handleSaveStateVoter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stateVoterFormName.trim() || !stateVoterFormRegNo.trim() || !stateVoterFormCopNo.trim()) {
      showToast('Advocate Name, State Bar Reg No, and COP No are required.');
      return;
    }

    const specs = stateVoterFormSpec.split(',').map(s => s.trim()).filter(Boolean);

    const voterObj: StateBarVoterEligibility = {
      advocateName: stateVoterFormName.trim(),
      hindiName: stateVoterFormHindiName.trim() || undefined,
      stateRegNo: stateVoterFormRegNo.trim().toUpperCase(),
      copNo: stateVoterFormCopNo.trim().toUpperCase(),
      districtBar: stateVoterFormDistrict,
      tahsil: stateVoterFormTahsil.trim() || 'Sadar',
      mobile: stateVoterFormMobile.trim() || undefined,
      email: stateVoterFormEmail.trim() || undefined,
      chamberNo: stateVoterFormChamber.trim() || undefined,
      experienceYears: Number(stateVoterFormExp) || 5,
      specialization: specs.length > 0 ? specs : ['CIVIL', 'CRIMINAL'],
      isCopValid: stateVoterFormCopValid,
      status: stateVoterFormStatus,
      photoUrl: editingStateVoter?.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'
    };

    if (editingStateVoter) {
      db.updateStateBarVoter(editingStateVoter.stateRegNo, voterObj);
      showToast(`State Voter "${voterObj.advocateName}" updated!`);
    } else {
      db.addStateBarVoter(voterObj);
      showToast(`Added "${voterObj.advocateName}" to State Voter Roll (${stateVoterFormDistrict})!`);
    }

    setIsStateVoterModalOpen(false);
    refreshData();
  };

  const handleDeleteStateVoter = (regNo: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Remove Advocate from State Roll (मतदाता सूची से हटाएं)',
      message: `Are you sure you want to remove Advocate "${name}" (Reg: ${regNo}) from the State Bar Council voter roll?`,
      confirmLabel: 'Yes, Remove (हटाएं)',
      danger: true,
      onConfirm: () => {
        db.deleteStateBarVoter(regNo);
        refreshData();
        showToast(`Advocate "${name}" removed from State Voter Roll.`);
        setConfirmModal(null);
      }
    });
  };

  const handleToggleVoterCop = (regNo: string) => {
    const newVal = db.toggleStateBarVoterCop(regNo);
    refreshData();
    showToast(`COP validity for ${regNo} set to: ${newVal ? 'VALID (सक्रिय)' : 'SUSPENDED (निलंबित)'}`);
  };

  const handleBroadcastStateElection = (turnOn: boolean) => {
    const updated: StateBarElectionConfig = {
      ...stateConfig,
      isEnabled: turnOn,
      status: turnOn ? 'VotingOpen' : 'Closed'
    };
    db.updateStateBarConfig(updated);
    db.broadcastStateElectionLiveNotification(turnOn);
    setStateConfig(updated);
    refreshData();
    showToast(turnOn ? '🟢 State Bar Council E-Voting turned ON & Broadcasted across all 75 Districts!' : '🔴 State Bar Council E-Voting turned OFF.');
  };

  const openPrintRollModal = (district: string) => {
    setPrintRollDistrict(district === 'ALL' ? 'Ballia (बलिया)' : district);
    setIsPrintRollModalOpen(true);
  };

  // Handlers for Committee Members
  const openAddCommitteeModal = () => {
    setEditingCommittee(null);
    setCommName('');
    setCommPost('');
    setCommHindiPost('');
    setCommSession('2026-2027');
    setCommBarNo('');
    setCommMobile('');
    setCommEmail('');
    setCommPhoto('');
    setCommIsCurrent(true);
    setCommOrder(committee.length + 1);
    setIsCommitteeModalOpen(true);
  };

  const openEditCommitteeModal = (m: CommitteeMember) => {
    setEditingCommittee(m);
    setCommName(m.name);
    setCommPost(m.post);
    setCommHindiPost(m.hindiPost || '');
    setCommSession(m.sessionYear);
    setCommBarNo(m.barNo);
    setCommMobile(m.mobile);
    setCommEmail(m.email || '');
    setCommPhoto(m.photo);
    setCommIsCurrent(m.isCurrent);
    setCommOrder(m.order || 1);
    setIsCommitteeModalOpen(true);
  };

  const handleSaveCommittee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commName.trim() || !commPost.trim()) return;

    if (editingCommittee) {
      const updated: CommitteeMember = {
        ...editingCommittee,
        name: commName.trim(),
        post: commPost.trim(),
        hindiPost: commHindiPost.trim() || undefined,
        sessionYear: commSession.trim(),
        barNo: commBarNo.trim(),
        mobile: commMobile.trim(),
        email: commEmail.trim() || undefined,
        photo: commPhoto.trim() || 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&auto=format&fit=crop&q=80',
        isCurrent: commIsCurrent,
        order: Number(commOrder) || 1
      };
      db.updateCommitteeMember(updated);
      showToast(`Committee member "${updated.name}" updated!`);
    } else {
      const newMember: CommitteeMember = {
        id: 'comm_' + Date.now(),
        name: commName.trim(),
        post: commPost.trim(),
        hindiPost: commHindiPost.trim() || undefined,
        sessionYear: commSession.trim() || '2026-2027',
        barNo: commBarNo.trim(),
        mobile: commMobile.trim(),
        email: commEmail.trim() || undefined,
        photo: commPhoto.trim() || 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&auto=format&fit=crop&q=80',
        isCurrent: commIsCurrent,
        order: Number(commOrder) || 1
      };
      db.addCommitteeMember(newMember);
      showToast(`Added "${newMember.name}" to Executive Committee!`);
    }

    setIsCommitteeModalOpen(false);
    refreshData();
  };

  const handleDeleteCommittee = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Remove Committee Member (कार्यकारिणी सदस्य हटाएं)',
      message: `Are you sure you want to remove "${name}" from the Executive Committee?`,
      confirmLabel: 'Yes, Remove (हटाएं)',
      danger: true,
      onConfirm: () => {
        db.deleteCommitteeMember(id);
        refreshData();
        showToast(`Committee member "${name}" removed.`);
        setConfirmModal(null);
      }
    });
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) return;

    const newNotif: NotificationItem = {
      id: 'notif_' + Date.now(),
      title: notifTitle.trim(),
      message: notifMessage.trim(),
      targetRole: 'all',
      isRead: false,
      createdAt: todayStr
    };

    db.addNotification(newNotif);

    // Trigger local & mobile push notification for general Bar Notice
    sendLocalPushNotification(
      `📢 ${notifTitle.trim()}`,
      notifMessage.trim(),
      'bar-notice-' + Date.now()
    );

    // Cross-device broadcast chime and pop-up alert
    try {
      await broadcastMessage(notifTitle.trim(), notifMessage.trim(), {
        category: 'notice',
        senderName: currentUser?.name || 'बार एसोसिएशन (Bar Association)'
      });
    } catch (err) {
      console.warn('Realtime broadcast notice error:', err);
    }

    setNotifSuccess(true);
    setNotifTitle('');
    setNotifMessage('');
    refreshData();
    setTimeout(() => setNotifSuccess(false), 4000);
    showToast('📢 Bar announcement broadcasted across all devices & Cloud Firestore!');
  };

  const handleDeleteBroadcast = (id: string) => {
    db.deleteNotification(id);
    refreshData();
    showToast('Broadcast notice removed.');
  };

  // Courts Master Handlers
  const openAddCourtModal = () => {
    setEditingCourt(null);
    setCourtFormName('');
    setCourtFormHindiName('');
    setCourtFormType('District & Sessions Court');
    setCourtFormRoomNo('');
    setCourtFormPresidingOfficer('');
    setCourtFormOrder(courts.length + 1);
    setCourtFormIsActive(true);
    setIsCourtModalOpen(true);
  };

  const openEditCourtModal = (court: CourtMaster) => {
    setEditingCourt(court);
    setCourtFormName(court.name);
    setCourtFormHindiName(court.hindiName || '');
    setCourtFormType(court.type);
    setCourtFormRoomNo(court.roomNo || '');
    setCourtFormPresidingOfficer(court.presidingOfficer || '');
    setCourtFormOrder(court.order || 1);
    setCourtFormIsActive(court.isActive !== false);
    setIsCourtModalOpen(true);
  };

  const handleSaveCourt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courtFormName.trim()) return;

    if (editingCourt) {
      const updated: CourtMaster = {
        ...editingCourt,
        name: courtFormName.trim(),
        hindiName: courtFormHindiName.trim() || undefined,
        type: courtFormType,
        roomNo: courtFormRoomNo.trim() || undefined,
        presidingOfficer: courtFormPresidingOfficer.trim() || undefined,
        order: Number(courtFormOrder) || 1,
        isActive: courtFormIsActive
      };
      db.updateCourt(editingCourt.id, updated);
      showToast(`Court "${updated.name}" updated successfully!`);
    } else {
      const newCourt: CourtMaster = {
        id: 'court_' + Date.now(),
        name: courtFormName.trim(),
        hindiName: courtFormHindiName.trim() || undefined,
        type: courtFormType,
        roomNo: courtFormRoomNo.trim() || undefined,
        presidingOfficer: courtFormPresidingOfficer.trim() || undefined,
        order: Number(courtFormOrder) || 1,
        isActive: courtFormIsActive
      };
      db.addCourt(newCourt);
      showToast(`Added new court "${newCourt.name}"!`);
    }

    setIsCourtModalOpen(false);
    refreshData();
  };

  const handleDeleteCourt = (court: CourtMaster) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Court / Forum (न्यायालय हटाएं)',
      message: `Are you sure you want to delete "${court.name}"? Advocates will no longer see it in dropdown selections.`,
      confirmLabel: 'Yes, Delete (हटाएं)',
      danger: true,
      onConfirm: () => {
        db.deleteCourt(court.id);
        refreshData();
        showToast(`Court "${court.name}" deleted.`);
        setConfirmModal(null);
      }
    });
  };

  const handleToggleCourtActive = (court: CourtMaster) => {
    const updated: CourtMaster = {
      ...court,
      isActive: !court.isActive
    };
    db.updateCourt(court.id, updated);
    refreshData();
    showToast(`Court "${court.name}" marked as ${updated.isActive ? 'Active' : 'Inactive'}.`);
  };

  const handleResetCourts = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Reset Court Directory (न्यायालय सूची रीसेट करें)',
      message: 'Are you sure you want to restore the default judicial courts list for Ballia (District & Sessions, Special POCSO, CJM, ACJM, Civil Judges, SDM Revenue, etc.)?',
      confirmLabel: 'Yes, Reset to Defaults (रीसेट करें)',
      danger: true,
      onConfirm: () => {
        db.resetCourts();
        refreshData();
        showToast('Default courts directory restored!');
        setConfirmModal(null);
      }
    });
  };

  // Case Stages Master Handlers
  const openAddStageModal = () => {
    setEditingStage(null);
    setStageFormName('');
    setStageFormHindiName('');
    setStageFormCategory('General');
    setStageFormOrder(caseStages.length + 1);
    setStageFormDescription('');
    setStageFormIsActive(true);
    setIsStageModalOpen(true);
  };

  const openEditStageModal = (stage: CaseStageMaster) => {
    setEditingStage(stage);
    setStageFormName(stage.name);
    setStageFormHindiName(stage.hindiName || '');
    setStageFormCategory(stage.category || 'General');
    setStageFormOrder(stage.order || 1);
    setStageFormDescription(stage.description || '');
    setStageFormIsActive(stage.isActive !== false);
    setIsStageModalOpen(true);
  };

  const handleSaveStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stageFormName.trim()) return;

    if (editingStage) {
      const updated: CaseStageMaster = {
        ...editingStage,
        name: stageFormName.trim(),
        hindiName: stageFormHindiName.trim() || undefined,
        category: stageFormCategory,
        order: Number(stageFormOrder) || 1,
        description: stageFormDescription.trim() || undefined,
        isActive: stageFormIsActive
      };
      db.updateCaseStage(editingStage.id, updated);
      showToast(`Case stage "${updated.name}" updated!`);
    } else {
      const newStage: CaseStageMaster = {
        id: 'stage_' + Date.now(),
        name: stageFormName.trim(),
        hindiName: stageFormHindiName.trim() || undefined,
        category: stageFormCategory,
        order: Number(stageFormOrder) || 1,
        description: stageFormDescription.trim() || undefined,
        isActive: stageFormIsActive
      };
      db.addCaseStage(newStage);
      showToast(`Added new case stage "${newStage.name}"!`);
    }

    setIsStageModalOpen(false);
    refreshData();
  };

  const handleDeleteStage = (stage: CaseStageMaster) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Case Stage (प्रक्रम हटाएं)',
      message: `Are you sure you want to delete stage "${stage.name}"? Advocates will no longer see it in dropdown selections.`,
      confirmLabel: 'Yes, Delete (हटाएं)',
      danger: true,
      onConfirm: () => {
        db.deleteCaseStage(stage.id);
        refreshData();
        showToast(`Case stage "${stage.name}" deleted.`);
        setConfirmModal(null);
      }
    });
  };

  const handleToggleStageActive = (stage: CaseStageMaster) => {
    const updated: CaseStageMaster = {
      ...stage,
      isActive: !stage.isActive
    };
    db.updateCaseStage(stage.id, updated);
    refreshData();
    showToast(`Stage "${stage.name}" marked as ${updated.isActive ? 'Active' : 'Inactive'}.`);
  };

  const handleResetStages = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Reset Case Stages (वाद प्रक्रम सूची रीसेट करें)',
      message: 'Are you sure you want to restore the standard default judicial case stages (Bail, Summons, W.S., Charge framing, Evidence, Arguments, Judgment, Execution, etc.)?',
      confirmLabel: 'Yes, Reset to Defaults (रीसेट करें)',
      danger: true,
      onConfirm: () => {
        db.resetCaseStages();
        refreshData();
        showToast('Default case stages restored!');
        setConfirmModal(null);
      }
    });
  };

  const filteredCourts = courts.filter(c => {
    const matchesType = courtTypeFilter === 'ALL' || c.type === courtTypeFilter;
    const q = courtSearch.trim().toLowerCase();
    const matchesSearch = !q ||
      c.name.toLowerCase().includes(q) ||
      (c.hindiName || '').toLowerCase().includes(q) ||
      (c.roomNo || '').toLowerCase().includes(q) ||
      (c.presidingOfficer || '').toLowerCase().includes(q);
    return matchesType && matchesSearch;
  });

  const filteredStages = caseStages.filter(s => {
    const matchesCat = stageCategoryFilter === 'ALL' || s.category === stageCategoryFilter;
    const q = stageSearch.trim().toLowerCase();
    const matchesSearch = !q ||
      s.name.toLowerCase().includes(q) ||
      (s.hindiName || '').toLowerCase().includes(q) ||
      (s.description || '').toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const filteredAdvocates = advocates
    .filter(a => {
      const matchesFilter =
        memberFilter === 'ALL' ||
        (memberFilter === 'PENDING' && (a.status === 'PENDING_APPROVAL' || a.status === 'PENDING')) ||
        (memberFilter === 'APPROVED' && a.status === 'APPROVED') ||
        (memberFilter === 'REJECTED' && a.status === 'REJECTED');

      const q = (searchMember || '').trim().toLowerCase();
      const matchesSearch =
        !q ||
        (a.name || '').toLowerCase().includes(q) ||
        (a.barNo || '').toLowerCase().includes(q) ||
        (a.mobile || '').includes(q);

      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      // Pending applications always float to the top
      const isPendingA = a.status === 'PENDING' || a.status === 'PENDING_APPROVAL';
      const isPendingB = b.status === 'PENDING' || b.status === 'PENDING_APPROVAL';
      if (isPendingA && !isPendingB) return -1;
      if (!isPendingA && isPendingB) return 1;
      return 0;
    });

  const filteredCommittee = committee.filter(m => {
    if (selectedCommitteeSession === 'ALL') return true;
    if (selectedCommitteeSession === 'CURRENT') return m.isCurrent;
    if (selectedCommitteeSession === 'ARCHIVE') return !m.isCurrent;
    return m.sessionYear === selectedCommitteeSession;
  });

  const uniqueSessions = Array.from(new Set(committee.map(c => c.sessionYear))).filter(Boolean);

  const incomeCategories = categories.filter(c => c.type === 'INCOME');
  const expenseCategories = categories.filter(c => c.type === 'EXPENSE');

  const filteredStateVoters = stateVoters.filter(v => {
    const matchesDistrict = stateVoterDistrictFilter === 'ALL' || v.districtBar === stateVoterDistrictFilter || v.districtBar.includes(stateVoterDistrictFilter.split(' ')[0]);
    const q = (stateVoterSearch || '').trim().toLowerCase();
    const matchesSearch = !q ||
      v.advocateName.toLowerCase().includes(q) ||
      (v.hindiName || '').toLowerCase().includes(q) ||
      v.stateRegNo.toLowerCase().includes(q) ||
      v.copNo.toLowerCase().includes(q) ||
      v.districtBar.toLowerCase().includes(q) ||
      (v.mobile || '').includes(q) ||
      (v.email || '').toLowerCase().includes(q) ||
      (v.chamberNo || '').toLowerCase().includes(q) ||
      (v.tahsil || '').toLowerCase().includes(q);

    const hasVoted = db.hasAdvocateVotedAnyStatePost(v.stateRegNo, v.copNo);
    let matchesStatus = true;
    if (stateVoterStatusFilter === 'VOTED') {
      matchesStatus = hasVoted;
    } else if (stateVoterStatusFilter === 'NOT_VOTED') {
      matchesStatus = !hasVoted;
    } else if (stateVoterStatusFilter === 'COP_VALID') {
      matchesStatus = v.isCopValid;
    } else if (stateVoterStatusFilter === 'COP_INVALID') {
      matchesStatus = !v.isCopValid;
    }

    return matchesDistrict && matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-amber-500 text-slate-950 font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce border border-amber-400">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-xs">{toastMessage}</span>
        </div>
      )}

      {/* Admin Panel Main Header Banner (Tier 2 Bar Admin) */}
      <div className="rounded-3xl bg-slate-900 border border-amber-500/30 p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-500/10 flex-shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border flex items-center gap-1 ${
                  currentUser?.role === 'state_bar_admin'
                    ? 'bg-red-600/30 text-red-300 border-red-500/50'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  <Landmark className="w-3 h-3" />
                  {currentUser?.role === 'state_bar_admin'
                    ? '🔴 State Bar Council Chief Election Admin'
                    : 'Bar Association Admin'}
                </span>
                <span className="text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded border border-blue-500/30">
                  Plan: {currentTenant.plan?.toUpperCase() || 'ENTERPRISE'}
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded border ${
                  currentTenant.status === 'active'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                }`}>
                  {currentTenant.status === 'active' ? '● License Active' : '● Expired / Suspended'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Today: {todayStr}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-100 mt-1">
                {currentUser?.role === 'state_bar_admin'
                  ? '🏛️ State Bar Council of Uttar Pradesh - Election Administration Room'
                  : currentTenant.name || 'Bar Association Secretariat & Accounts'}
              </h1>
              <p className="text-xs text-slate-400 flex flex-wrap items-center gap-2 mt-0.5">
                <span>{currentTenant.district ? `${currentTenant.district}, ${currentTenant.state || 'India'}` : 'Civil Court'}</span>
                <span>•</span>
                <span className="font-mono text-slate-400">License Key: <strong className="text-amber-400">{currentTenant.licenseKey || 'NYAAY-ENT-BALLIA-2026'}</strong></span>
                {currentTenant.validUntil && (
                  <>
                    <span>•</span>
                    <span className="text-emerald-400 font-medium">Valid Till: {currentTenant.validUntil}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto justify-end">
            {db.isModuleEnabled('state_bar_verify', currentTenant.id) && onNavigateToStateBarPortal && (
              <button
                onClick={onNavigateToStateBarPortal}
                className="px-3 py-2 rounded-xl bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-500/50 text-xs font-bold flex items-center gap-1.5 transition-all shadow"
                title="State Bar Voter Verification & Read Portal"
              >
                <Landmark className="w-3.5 h-3.5 text-red-400" />
                <span className="hidden sm:inline">🔴 State Bar Voter Verification</span>
                <span className="sm:hidden">State Bar</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('license_profile')}
              className={`px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 border transition-all ${
                activeTab === 'license_profile'
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-500/30'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>License &amp; Profile</span>
            </button>

            {db.isModuleEnabled('finance', currentTenant.id) && (
              <button
                onClick={() => exportFinanceLedgerToExcel(earnings, expenses)}
                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition-all"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Export Ledger (.XLSX)</span>
              </button>
            )}

            <button
              onClick={onLogout}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs border border-slate-700 transition-all"
            >
              Logout Admin
            </button>
          </div>
        </div>

        {/* Dashboard Financial & Operational Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
          
          {/* Today's Earnings */}
          <div className="bg-gradient-to-br from-emerald-950/50 via-slate-900 to-slate-950 border border-emerald-500/40 rounded-2xl p-4 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between text-emerald-400 text-xs mb-1">
              <span className="font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Today's Earnings
              </span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400">
              ₹ {todayEarnings.toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">आज की कुल आय</p>
          </div>

          {/* Today's Expenses */}
          <div className="bg-gradient-to-br from-rose-950/50 via-slate-900 to-slate-950 border border-rose-500/40 rounded-2xl p-4 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between text-rose-400 text-xs mb-1">
              <span className="font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Today's Expenses
              </span>
              <TrendingDown className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-rose-400">
              ₹ {todayExpenses.toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">आज का कुल व्यय</p>
          </div>

          {/* Today's Net Balance */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Today's Net</span>
              <IndianRupee className="w-4 h-4 text-amber-400" />
            </div>
            <div className={`text-xl font-bold ${todayNet >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              ₹ {todayNet.toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">दैनिक शेष अंतर</p>
          </div>

          {/* Total Revenue */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Total Revenue (Cr)</span>
              <IndianRupee className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-slate-100">
              ₹ {totalRevenue.toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">कुल संचित आय</p>
          </div>

          {/* Net Reserve Fund */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Net Reserve Fund</span>
              <IndianRupee className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-xl font-bold text-blue-400">
              ₹ {netReserve.toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">शुद्ध बार कोष</p>
          </div>

          {/* Approved & Pending Members */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Members Status</span>
              <Users className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl font-bold text-slate-100 flex items-center gap-1.5">
              <span>{approvedMembers}</span>
              {pendingMembers > 0 && (
                <span className="text-xs bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full border border-amber-500/30">
                  +{pendingMembers} new
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">स्वीकृत अधिवक्ता</p>
          </div>

        </div>
      </div>

      {/* DISTRICT BAR ADMIN DASHBOARD STATE BAR COUNCIL LIVE ELECTION NOTICE */}
      {(stateConfig.isEnabled || stateConfig.status === 'VotingOpen') && (
        <div className="rounded-2xl bg-gradient-to-r from-red-950/80 via-slate-900 to-amber-950/60 border-2 border-red-500/60 p-4 sm:p-5 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-red-600/30 text-red-400 border border-red-500/50 flex items-center justify-center flex-shrink-0 animate-pulse">
              <Landmark className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-red-600 text-white font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  STATE ELECTION LIVE
                </span>
                <span className="text-[11px] font-bold text-amber-300">
                  {stateConfig.stateBarCouncilName || 'Bar Council of Uttar Pradesh'} • {stateConfig.termYear || '2026-2027'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  All 75 District Bar Associations
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-100 mt-0.5">
                राज्य बार काउंसिल सामान्य निर्वाचन 2026-2027 समस्त जिलों में सक्रिय है।
              </h3>
              <p className="text-xs text-slate-300">
                इस जिला बार के कुल <strong className="text-amber-400">{stateVoters.filter(v => v.districtBar.includes(currentTenant.district || 'Ballia')).length}</strong> अधिवक्ता मतदाता सूची में पंजीकृत हैं (कुल राज्य मतदाता: <strong className="text-emerald-400">{stateVoters.length}</strong>)।
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto justify-end">
            {onNavigateToStateBarPortal && (
              <button
                onClick={onNavigateToStateBarPortal}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow"
              >
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>जिला मतदाता सूची देखें (Voter List)</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        
        <button
          onClick={() => setActiveTab('members')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'members'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-300 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Member Approvals ({pendingMembers})</span>
        </button>

        {db.isModuleEnabled('state_bar_verify', currentTenant.id) && onNavigateToStateBarPortal && (
          <button
            onClick={onNavigateToStateBarPortal}
            className="px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap bg-red-950/60 hover:bg-red-900/80 text-red-200 border border-red-500/50 shadow"
            title="Open Advocate & COP Verification Portal"
          >
            <Landmark className="w-4 h-4 text-red-400" />
            <span>🔍 State Bar Advocate &amp; COP Verification</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('finance')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'finance'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-300 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <IndianRupee className="w-4 h-4" />
          <span>Finance &amp; Ledger (आय-व्यय)</span>
          {!db.isModuleEnabled('finance', currentTenant.id) && (
            <Lock className="w-3 h-3 text-amber-400 ml-0.5" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'categories'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-300 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Edit Categories (श्रेणी प्रबंधन)</span>
        </button>

        <button
          onClick={() => setActiveTab('elections')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'elections'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-300 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Vote className="w-4 h-4" />
          <span>Elections &amp; Posts (चुनाव पद)</span>
          {!db.isModuleEnabled('election', currentTenant.id) && (
            <Lock className="w-3 h-3 text-amber-400 ml-0.5" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('committee')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'committee'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-300 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Executive Committee (प्रबंधकारिणी)</span>
        </button>

        <button
          onClick={() => setActiveTab('broadcast')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'broadcast'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-300 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Broadcast Notices</span>
          {!db.isModuleEnabled('broadcast', currentTenant.id) && (
            <Lock className="w-3 h-3 text-amber-400 ml-0.5" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('courts_stages')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'courts_stages'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-300 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Courts &amp; Stages (न्यायालय व प्रक्रम)</span>
          {!db.isModuleEnabled('courts_stages', currentTenant.id) && (
            <Lock className="w-3 h-3 text-amber-400 ml-0.5" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('license_profile')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'license_profile'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-300 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Bar License &amp; Profile (लाइसेंस)</span>
        </button>
      </div>

      {/* TAB 1: MEMBER APPROVALS */}
      {activeTab === 'members' && (
        <div className="space-y-4">

          {/* Pending Applications Alert Banner */}
          {pendingMembers > 0 && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-600/15 to-slate-900 border-2 border-amber-500/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-amber-500/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/30 border border-amber-400 flex items-center justify-center flex-shrink-0 animate-pulse">
                  <UserPlus className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                    <span>⚠️ {pendingMembers} नए अधिवक्ताओं का पंजीकरण अनुमोदन (Approval) हेतु प्रतीक्षारत है</span>
                    <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase">Action Required</span>
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    नए पंजीकृत अधिवक्ताओं का विवरण नीचे तालिका में सबसे ऊपर प्रदर्शित है। विवरण एवं दस्तावेज़ की समीक्षा कर 'Approve' करें।
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                <button
                  type="button"
                  onClick={() => setMemberFilter('PENDING')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow ${
                    memberFilter === 'PENDING'
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>केवल लंबित आवेदन देखें ({pendingMembers})</span>
                </button>
                {memberFilter === 'PENDING' && (
                  <button
                    type="button"
                    onClick={() => setMemberFilter('ALL')}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    सभी सदस्य देखें
                  </button>
                )}
              </div>
            </div>
          )}
          
          {/* Filters & + Add New Advocate Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setMemberFilter(st)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${
                    memberFilter === st
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  {st === 'PENDING' ? `PENDING (${pendingMembers})` : st}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="relative">
                <input
                  type="text"
                  value={searchMember}
                  onChange={(e) => setSearchMember(e.target.value)}
                  placeholder="Search by Name, Bar No, Phone..."
                  className="w-full sm:w-64 bg-slate-800 border border-slate-700 text-xs text-slate-100 rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:border-amber-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>

              <button
                type="button"
                onClick={() => setIsAddAdvocateModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all whitespace-nowrap"
              >
                <Plus className="w-4 h-4 text-slate-950" />
                <span>+ Add New Advocate (नया सदस्य जोड़ें)</span>
              </button>
            </div>
          </div>

          {/* Members Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">Advocate Details</th>
                    <th className="py-3.5 px-4">Bar Council &amp; COP</th>
                    <th className="py-3.5 px-4">Tahsil &amp; Address</th>
                    <th className="py-3.5 px-4">Specialization</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-center">Top Criminal</th>
                    <th className="py-3.5 px-4 text-right">Approval Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {filteredAdvocates.map((adv) => {
                    const isAdvPending = adv.status === 'PENDING' || adv.status === 'PENDING_APPROVAL';
                    return (
                    <tr
                      key={adv.id}
                      className={`transition-colors ${
                        isAdvPending
                          ? 'bg-amber-500/10 hover:bg-amber-500/15 border-l-4 border-l-amber-500'
                          : 'hover:bg-slate-800/50'
                      }`}
                    >
                      
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img src={adv.photoUrl} alt={adv.name} className="w-9 h-9 rounded-xl object-cover border border-amber-500/30" />
                          <div>
                            <p className="font-bold text-slate-100 text-xs">{adv.name}</p>
                            <p className="text-[11px] text-slate-400">S/o {adv.fatherName} • {adv.mobile}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-amber-400 font-mono">{adv.barNo}</span>
                        <span className="text-[10px] text-slate-500 block">COP: {adv.copNo}</span>
                      </td>

                      <td className="py-3.5 px-4 text-[11px]">
                        <span>{adv.address?.village || 'Ballia'}, Tahsil {adv.address?.tahsil || 'Sadar'}</span>
                        <span className="text-[10px] text-slate-500 block">P.S. {adv.address?.policeStation || 'Kotwali'}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                          {(adv.specialization || []).join(', ')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            adv.status === 'APPROVED'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : adv.status === 'PENDING_APPROVAL'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : 'bg-red-500/20 text-red-300 border-red-500/30'
                          }`}
                        >
                          {adv.status}
                        </span>
                      </td>

                      {/* Top Criminal Lawyer Flag */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleTopCriminal(adv)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            adv.isTopCriminalLawyer
                              ? 'bg-red-500/20 text-red-400 border-red-500/40 font-bold'
                              : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-300'
                          }`}
                          title="Toggle Emergency Counsel helpline status"
                        >
                          <Briefcase className="w-3.5 h-3.5" />
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {adv.status !== 'APPROVED' && (
                            <button
                              onClick={() => handleApprove(adv.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 shadow"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Approve</span>
                            </button>
                          )}

                          {adv.status !== 'REJECTED' && (
                            <button
                              onClick={() => handleReject(adv.id)}
                              className="px-2.5 py-1 rounded-lg bg-amber-600/80 hover:bg-amber-600 text-white font-bold text-[10px] flex items-center gap-1"
                            >
                              <XCircle className="w-3 h-3" />
                              <span>Reject</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteAdvocate(adv)}
                            className="px-2 py-1 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/40 font-bold text-[10px] flex items-center gap-1 transition-colors"
                            title="Delete advocate permanently"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FINANCE & ACCOUNTS LEDGER */}
      {activeTab === 'finance' && (
        <div className="space-y-6">
          
          {/* Action Row: Period Filter & Record Buttons */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-amber-400" />
                Financial Accounts &amp; General Ledger
              </h3>
              <p className="text-xs text-slate-400">
                Audited Income &amp; Expenditure with Today's Live Tracking ({todayStr})
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              
              {/* Period Filter */}
              <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
                <button
                  onClick={() => setFinancePeriodFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    financePeriodFilter === 'ALL' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-300'
                  }`}
                >
                  All Time
                </button>
                <button
                  onClick={() => setFinancePeriodFilter('TODAY')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    financePeriodFilter === 'TODAY' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-300'
                  }`}
                >
                  Today (आज)
                </button>
                <button
                  onClick={() => setFinancePeriodFilter('MONTH')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    financePeriodFilter === 'MONTH' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-300'
                  }`}
                >
                  This Month
                </button>
              </div>

              {/* Record Income Button */}
              <button
                onClick={() => setIsAddEarningOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>+ Record Income</span>
              </button>

              {/* Record Expense Button */}
              <button
                onClick={() => setIsAddExpenseOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>+ Record Expense</span>
              </button>
            </div>
          </div>

          {/* Today's Highlight Summary Box */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-300 block">Today's Inflow (आज की आय)</span>
                <span className="text-2xl font-black text-emerald-400">₹ {todayEarnings.toLocaleString('en-IN')}</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  {earnings.filter(e => isToday(e.date) || isToday(e.createdAt)).length} Receipts today
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-rose-950/40 border border-rose-500/30 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-rose-300 block">Today's Outflow (आज का व्यय)</span>
                <span className="text-2xl font-black text-rose-400">₹ {todayExpenses.toLocaleString('en-IN')}</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  {expenses.filter(e => isToday(e.date) || isToday(e.createdAt)).length} Vouchers today
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-300 block">Today's Net Margin (दैनिक शेष)</span>
                <span className={`text-2xl font-black ${todayNet >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  ₹ {todayNet.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  {todayNet >= 0 ? 'Surplus Inflow' : 'Deficit Outflow'}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <IndianRupee className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Monthly Trend Bar Chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <h4 className="font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-400" />
                Monthly Income vs Expenditure Trend
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyFinanceData}>
                    <XAxis dataKey="month" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Expense Breakdown Pie Chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <h4 className="font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-amber-400" />
                Expenditure Category Allocation
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expensePieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={75}
                      label={({ name, percent }: { name?: string; percent?: number }) => `${name || ''} ${((percent || 0) * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {expensePieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Income Entries Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h4 className="font-bold text-xs text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Income Ledger (सदस्यता एवं विविध आय)
              </h4>
              <span className="text-xs text-slate-400">{filteredEarnings.length} Records displayed</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-semibold text-[10px]">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Advocate / Contributor</th>
                    <th className="py-3 px-4">Bar Reg. No</th>
                    <th className="py-3 px-4">Purpose / Category</th>
                    <th className="py-3 px-4">Mode / Txn ID</th>
                    <th className="py-3 px-4 text-right">Amount (₹)</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {filteredEarnings.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 text-slate-400">
                        {e.date}
                        {isToday(e.date) && (
                          <span className="ml-1.5 text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-bold">
                            Today
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-100">{e.advocateName}</td>
                      <td className="py-3 px-4 text-amber-400 font-mono">{e.barNo}</td>
                      <td className="py-3 px-4">
                        <span className="bg-slate-800 text-slate-200 px-2 py-0.5 rounded text-[11px]">
                          {e.purpose}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{e.mode} ({e.txnId})</td>
                      <td className="py-3 px-4 text-right font-extrabold text-emerald-400">₹ {e.amount.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleDeleteEarning(e.id)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                          title="Delete income entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredEarnings.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-slate-500">
                        No income entries for the selected period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Expenses Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h4 className="font-bold text-xs text-rose-400 uppercase tracking-wider flex items-center gap-2">
                <TrendingDown className="w-4 h-4" />
                Expenditure Ledger (बार व्यय एवं वाउचर)
              </h4>
              <span className="text-xs text-slate-400">{filteredExpenses.length} Records displayed</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-semibold text-[10px]">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Expense Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Voucher No</th>
                    <th className="py-3 px-4">Payment Mode</th>
                    <th className="py-3 px-4 text-right">Amount (₹)</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {filteredExpenses.map((ex) => (
                    <tr key={ex.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 text-slate-400">
                        {ex.date}
                        {isToday(ex.date) && (
                          <span className="ml-1.5 text-[9px] bg-rose-500/20 text-rose-400 px-1.5 py-0.2 rounded font-bold">
                            Today
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-100">{ex.purposeTitle}</td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          {ex.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{ex.voucherNo}</td>
                      <td className="py-3 px-4 text-slate-400">{ex.mode}</td>
                      <td className="py-3 px-4 text-right font-extrabold text-rose-400">₹ {ex.amount.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleDeleteExpense(ex.id)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                          title="Delete expense entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredExpenses.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-slate-500">
                        No expense entries for the selected period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: EDITABLE CATEGORIES (EARNINGS & EXPENSES) */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                Finance Category Configuration (आय एवं व्यय श्रेणी प्रबंधन)
              </h3>
              <p className="text-xs text-slate-400">
                Admins can create, edit, or delete custom income heads and expenditure budget categories.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => openAddCategoryModal('INCOME')}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Income Category</span>
              </button>
              <button
                onClick={() => openAddCategoryModal('EXPENSE')}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Expense Category</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Income Categories List */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h4 className="font-bold text-sm text-emerald-400 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Income Categories ({incomeCategories.length})
                </h4>
                <span className="text-[11px] text-slate-400">Used during payment receipts</span>
              </div>

              <div className="space-y-2.5">
                {incomeCategories.map(cat => (
                  <div
                    key={cat.id}
                    className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between hover:border-emerald-500/40 transition-colors"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-100">{cat.name}</p>
                      {cat.hindiName && (
                        <p className="text-[11px] text-amber-400">{cat.hindiName}</p>
                      )}
                      {cat.description && (
                        <p className="text-[10px] text-slate-400 mt-0.5">{cat.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditCategoryModal(cat)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                        title="Edit category"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400"
                        title="Delete category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Expense Categories List */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h4 className="font-bold text-sm text-rose-400 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4" />
                  Expense Categories ({expenseCategories.length})
                </h4>
                <span className="text-[11px] text-slate-400">Used during expense recording</span>
              </div>

              <div className="space-y-2.5">
                {expenseCategories.map(cat => (
                  <div
                    key={cat.id}
                    className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between hover:border-rose-500/40 transition-colors"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-100">{cat.name}</p>
                      {cat.hindiName && (
                        <p className="text-[11px] text-rose-300">{cat.hindiName}</p>
                      )}
                      {cat.description && (
                        <p className="text-[10px] text-slate-400 mt-0.5">{cat.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditCategoryModal(cat)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                        title="Edit category"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400"
                        title="Delete category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 4: DISTRICT BAR ELECTIONS & POSTS MANAGEMENT */}
      {activeTab === 'elections' && (
        <div className="space-y-6">
          {/* District Bar Election ON / OFF Master Switchboard */}
          <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 border border-amber-500/40 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                      District Bar Election Master Control
                    </span>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                      db.getDistrictBarElectionConfig().status === 'VotingOpen'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-red-500/20 text-red-300 border border-red-500/40'
                    }`}>
                      Status: {db.getDistrictBarElectionConfig().status}
                    </span>
                  </div>
                  <h4 className="text-base font-black text-white mt-1">
                    जिला बार एसोसिएशन चुनाव ON / OFF मास्टर स्विचबोर्ड
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    यहाँ से मतदान चालू (VotingOpen) करने पर ही सभी अधिवक्ताओं के होम पेज और फूटर में जिला बार चुनाव का लाइव फ्लैग प्रदर्शित होगा।
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      db.toggleDistrictBarElectionStatus('VotingOpen');
                      setElectionAdminSubTab('district');
                      showToast('🟢 District Bar Association Election is now LIVE! Footer flag enabled.');
                    }}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow ${
                      db.getDistrictBarElectionConfig().status === 'VotingOpen'
                        ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    🟢 मतदान चालू करें (Voting Open)
                  </button>

                  <button
                    onClick={() => {
                      db.toggleDistrictBarElectionStatus('VotingClosed');
                      setElectionAdminSubTab('district');
                      showToast('🔴 District Bar Association Election voting closed. Footer flag hidden.');
                    }}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow ${
                      db.getDistrictBarElectionConfig().status === 'VotingClosed'
                        ? 'bg-red-600 text-white ring-2 ring-red-400'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    🔴 मतदान बंद करें (Voting Closed)
                  </button>

                  <button
                    onClick={() => {
                      db.toggleDistrictBarElectionStatus('ResultsDeclared');
                      setElectionAdminSubTab('district');
                      showToast('🏆 District Bar Association Election Results declared!');
                    }}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow ${
                      db.getDistrictBarElectionConfig().status === 'ResultsDeclared'
                        ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    🏆 परिणाम घोषित करें (Declare Results)
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <Vote className="w-5 h-5 text-amber-400" />
                    Annual Bar Election Portal &amp; Post Configuration
                  </h3>
                  <p className="text-xs text-slate-400">
                    Admin configuration for Election Posts (अध्यक्ष, महामंत्री, कोषाध्यक्ष आदि) and Candidate profiles for {currentTenant.name}.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={openAddPostModal}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add Election Post</span>
                  </button>

                  <button
                    onClick={openAddCandidateModal}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>+ Add Candidate</span>
                  </button>

                  <button
                    onClick={handleResetVotes}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-950 text-rose-300 border border-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-all"
                    title="Reset ballot box votes to 0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Ballot Box</span>
                  </button>
                </div>
              </div>

              {/* Section 1: Election Posts Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-3 p-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="font-bold text-xs text-amber-400 uppercase tracking-wider">
                    Configured Election Posts ({electionPosts.length})
                  </h4>
                  <span className="text-[11px] text-slate-400">Posts appear in Election Portal ballot tabs</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
                  {electionPosts.map((p) => {
                    const candCount = candidates.filter(c => c.post === p.key).length;
                    return (
                      <div
                        key={p.id}
                        className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono bg-slate-800 text-amber-400 px-2 py-0.5 rounded font-bold">
                              Order #{p.order || 1} • {p.key}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => openEditPostModal(p)}
                                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                                title="Edit Post"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeletePost(p.id, p.title)}
                                className="p-1 rounded bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400"
                                title="Delete Post"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            <h5 className="font-bold text-sm text-slate-100">{p.title}</h5>
                            <span className="text-[11px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-lg">
                              {p.seatsCount || 1} Seats (पद)
                            </span>
                          </div>
                          <p className="text-xs text-amber-300 font-semibold">{p.hindiTitle}</p>
                          {p.description && (
                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-2">{p.description}</p>
                          )}
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Total Seats: <strong className="text-amber-400">{p.seatsCount || 1}</strong></span>
                          <span className="font-bold text-slate-200 bg-slate-800 px-2 py-0.5 rounded">
                            {candCount} Nominees
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: Nominated Candidates Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-3 p-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="font-bold text-xs text-blue-400 uppercase tracking-wider">
                    Nominated Candidates ({candidates.length})
                  </h4>
                  <span className="text-[11px] text-slate-400">Candidates with active ballots</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                  {candidates.map((cand) => (
                    <div
                      key={cand.id}
                      className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-blue-500/40 transition-all space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={cand.photoUrl}
                          alt={cand.name}
                          className="w-12 h-12 rounded-xl object-cover border border-amber-500/40 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] uppercase font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                            {cand.post}
                          </span>
                          <h5 className="font-bold text-xs sm:text-sm text-slate-100 truncate mt-1">{cand.name}</h5>
                          <p className="text-[10px] text-slate-400 font-mono">Bar: {cand.barNo}</p>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-300 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 line-clamp-2 italic">
                        "{cand.agenda}"
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <Vote className="w-3.5 h-3.5" /> {cand.votesCount || 0} Votes Cast
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditCandidateModal(cand)}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3" /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCandidate(cand.id, cand.name)}
                            className="p-1 rounded bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

      {/* TAB 5: EXECUTIVE COMMITTEE MANAGEMENT */}
      {activeTab === 'committee' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                Executive Committee Management (प्रबंधकारिणी / कार्यकारिणी समिति)
              </h3>
              <p className="text-xs text-slate-400">
                Official governing council office bearers and executive members of Criminal &amp; Revenue Bar Ballia.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Session Filter */}
              <select
                value={selectedCommitteeSession}
                onChange={(e) => setSelectedCommitteeSession(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
              >
                <option value="ALL">All Sessions</option>
                <option value="CURRENT">Current Committee Only</option>
                <option value="ARCHIVE">Archive / Past Committees</option>
                {uniqueSessions.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <button
                onClick={openAddCommitteeModal}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Add Committee Member</span>
              </button>
            </div>
          </div>

          {/* Committee Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCommittee.map((mem) => (
              <div
                key={mem.id}
                className={`rounded-2xl bg-slate-900 border p-5 shadow-xl transition-all flex flex-col justify-between ${
                  mem.isCurrent ? 'border-amber-500/40 hover:border-amber-500' : 'border-slate-800 opacity-80'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      mem.isCurrent ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {mem.sessionYear} • {mem.isCurrent ? 'Current' : 'Past Archive'}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditCommitteeModal(mem)}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCommittee(mem.id, mem.name)}
                        className="p-1 rounded bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 pt-1">
                    <img
                      src={mem.photo}
                      alt={mem.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-500/40 shadow-md flex-shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-slate-100">{mem.name}</h4>
                      <p className="text-xs font-semibold text-amber-400">{mem.post}</p>
                      {mem.hindiPost && (
                        <p className="text-[11px] text-slate-400">{mem.hindiPost}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
                    <p className="flex items-center gap-2">
                      <span className="text-slate-500">Bar No:</span>
                      <span className="font-mono text-amber-400">{mem.barNo}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-3 h-3 text-slate-500" />
                      <a href={`tel:${mem.mobile}`} className="hover:text-amber-300">{mem.mobile}</a>
                    </p>
                    {mem.email && (
                      <p className="flex items-center gap-2">
                        <Mail className="w-3 h-3 text-slate-500" />
                        <span className="text-slate-400">{mem.email}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>Display Order: #{mem.order || 1}</span>
                  <span className={mem.isCurrent ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                    {mem.isCurrent ? '● Active In Office' : 'Tenure Completed'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: BROADCAST NOTICE */}
      {activeTab === 'broadcast' && (
        <div className="space-y-6 max-w-3xl">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-400" />
                Send Bar Association Notice / Announcement (सूचना प्रसारण)
              </h3>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Cloud Synced Across Devices</span>
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Broadcast emergency court holidays, general body meetings, strike circulars, or bar council orders to all member advocates in real-time.
            </p>

            {notifSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Announcement successfully broadcasted to all advocate devices and synchronized to Cloud Firestore!</span>
              </div>
            )}

            <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Notice Title / बाबत *</label>
                <input
                  type="text"
                  required
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  placeholder="उदा. आवश्यक आमसभा सूचना / होली अवकाश / विधिक हड़ताल परिपत्र"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Notice Message / सूचना विवरण *</label>
                <textarea
                  rows={4}
                  required
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  placeholder="समस्त सम्मानित अधिवक्ता साथियों को सूचित किया जाता है कि बार सभागार में दोपहर 03:30 बजे आवश्यक बैठक आयोजित है..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <span>🔔 रियल-टाइम नोटिफिकेशन + ऑडियो अलर्ट</span>
                </span>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Broadcast Notice (अभी प्रसारित करें)</span>
                </button>
              </div>
            </form>
          </div>

          {/* Broadcast Notices History */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>📜 Sent Broadcast Notices History (प्रसारित सूचनाओं का इतिहास)</span>
              </h4>
              <span className="text-xs text-amber-400 font-mono font-bold">
                {notifications.length} Notices
              </span>
            </div>

            {notifications.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">अभी तक कोई प्रसारण सूचना जारी नहीं की गई है।</p>
            ) : (
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/80 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-100 text-sm">{n.title}</span>
                        <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded font-mono">
                          {n.createdAt || todayStr}
                        </span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">
                          ✓ Live on All Devices
                        </span>
                      </div>
                      <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-line">{n.message}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteBroadcast(n.id)}
                      title="Delete Notice"
                      className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 7: COURTS & CASE STAGES MASTER DIRECTORY */}
      {activeTab === 'courts_stages' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded border border-amber-500/30">
                  Judicial Standard Data
                </span>
                <span className="text-[10px] text-slate-400">
                  Total Courts: {courts.length} • Total Stages: {caseStages.length}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-100 mt-1 flex items-center gap-2">
                <Scale className="w-5 h-5 text-amber-400" />
                Courts &amp; Case Stages Master Directory (न्यायालय एवं वाद प्रक्रम प्रबंधन)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Standardize dropdown menus for advocates when adding clients, logging case hearings, and tracking judicial stages in Ballia Courts.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={openAddCourtModal}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Court / Forum</span>
              </button>
              <button
                onClick={openAddStageModal}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Case Stage</span>
              </button>
              <button
                onClick={() => {
                  if (courtsSubTab === 'courts') {
                    handleResetCourts();
                  } else {
                    handleResetStages();
                  }
                }}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1.5 border border-slate-700 transition-all"
                title="Restore default Ballia courts and standard stages"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>
            </div>
          </div>

          {/* Sub Tab Switcher: Customizer vs Courts vs Stages */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
            <button
              onClick={() => setCourtsSubTab('customizer')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                courtsSubTab === 'customizer'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Dropdown Customizer (तहसील, थाना, कोर्ट)</span>
            </button>

            <button
              onClick={() => setCourtsSubTab('courts')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                courtsSubTab === 'courts'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Courts &amp; Judicial Forums ({courts.length})</span>
            </button>

            <button
              onClick={() => setCourtsSubTab('stages')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                courtsSubTab === 'stages'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <ListChecks className="w-4 h-4" />
              <span>Case Stages &amp; Process ({caseStages.length})</span>
            </button>
          </div>

          {/* SUBTAB 0: MASTER DROPDOWN CUSTOMIZER */}
          {courtsSubTab === 'customizer' && (
            <TenantDropdownCustomizer
              initialTenantId={currentTenant.id}
              allowTenantSelect={false}
              onConfigUpdated={refreshData}
            />
          )}

          {/* SUBTAB 1: COURTS LIST */}
          {courtsSubTab === 'courts' && (
            <div className="space-y-4">
              {/* Search & Type Filters */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={courtSearch}
                    onChange={(e) => setCourtSearch(e.target.value)}
                    placeholder="Search by court name, Hindi name, room number, or presiding officer..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                  {courtSearch && (
                    <button
                      onClick={() => setCourtSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Type Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                  {[
                    { key: 'ALL', label: 'All Types' },
                    { key: 'District & Sessions Court', label: 'Sessions' },
                    { key: 'Magistrate Court', label: 'Magistrate' },
                    { key: 'Civil Court', label: 'Civil' },
                    { key: 'Revenue Court', label: 'Revenue' },
                    { key: 'Tribunal / Forum', label: 'Tribunal' }
                  ].map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setCourtTypeFilter(t.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                        courtTypeFilter === t.key
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-transparent'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Courts Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4 font-semibold w-12 text-center">#</th>
                        <th className="py-3 px-4 font-semibold">Court / Forum Name (न्यायालय का नाम)</th>
                        <th className="py-3 px-4 font-semibold">Classification (प्रकार)</th>
                        <th className="py-3 px-4 font-semibold">Presiding Officer &amp; Room</th>
                        <th className="py-3 px-4 font-semibold text-center">Dropdown Status</th>
                        <th className="py-3 px-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {filteredCourts.length > 0 ? (
                        filteredCourts.map((court, idx) => {
                          const typeBadgeColor =
                            court.type === 'District & Sessions Court'
                              ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                              : court.type === 'Magistrate Court'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : court.type === 'Civil Court'
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                              : court.type === 'Revenue Court'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';

                          return (
                            <tr key={court.id} className="hover:bg-slate-800/40 transition-colors">
                              <td className="py-3 px-4 text-center font-mono text-slate-500 text-[11px]">
                                {court.order || idx + 1}
                              </td>
                              <td className="py-3 px-4">
                                <p className="font-bold text-slate-100 text-xs">{court.name}</p>
                                {court.hindiName && (
                                  <p className="text-[11px] text-amber-400/90 font-medium mt-0.5">
                                    {court.hindiName}
                                  </p>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${typeBadgeColor}`}>
                                  {court.type}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <p className="text-slate-200 text-xs font-medium">
                                  {court.presidingOfficer || 'Presiding Judicial Officer'}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-0.5">
                                  {court.roomNo || 'Main Court Building'}
                                </p>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <button
                                  onClick={() => handleToggleCourtActive(court)}
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                                    court.isActive !== false
                                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                                  }`}
                                  title="Click to toggle Active / Inactive in advocate dropdowns"
                                >
                                  {court.isActive !== false ? '● Active' : '○ Inactive'}
                                </button>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => openEditCourtModal(court)}
                                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                                    title="Edit Court Details"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCourt(court)}
                                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 transition-colors"
                                    title="Delete Court"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                            No courts found matching your criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB 2: CASE STAGES LIST */}
          {courtsSubTab === 'stages' && (
            <div className="space-y-4">
              {/* Search & Category Filters */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={stageSearch}
                    onChange={(e) => setStageSearch(e.target.value)}
                    placeholder="Search by stage name, Hindi name, or description..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                  {stageSearch && (
                    <button
                      onClick={() => setStageSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Category Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                  {[
                    { key: 'ALL', label: 'All Categories' },
                    { key: 'General', label: 'General' },
                    { key: 'Criminal', label: 'Criminal' },
                    { key: 'Civil', label: 'Civil' },
                    { key: 'Revenue', label: 'Revenue' }
                  ].map((c) => (
                    <button
                      key={c.key}
                      onClick={() => setStageCategoryFilter(c.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                        stageCategoryFilter === c.key
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-transparent'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stages Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4 font-semibold w-12 text-center">#</th>
                        <th className="py-3 px-4 font-semibold">Case Stage (वाद प्रक्रम / स्थिति)</th>
                        <th className="py-3 px-4 font-semibold">Category (शाखा)</th>
                        <th className="py-3 px-4 font-semibold">Sequence &amp; Notes</th>
                        <th className="py-3 px-4 font-semibold text-center">Dropdown Status</th>
                        <th className="py-3 px-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {filteredStages.length > 0 ? (
                        filteredStages.map((stage, idx) => {
                          const catBadgeColor =
                            stage.category === 'Criminal'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                              : stage.category === 'Civil'
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                              : stage.category === 'Revenue'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : 'bg-blue-500/20 text-blue-300 border-blue-500/30';

                          return (
                            <tr key={stage.id} className="hover:bg-slate-800/40 transition-colors">
                              <td className="py-3 px-4 text-center font-mono text-slate-500 text-[11px]">
                                {stage.order || idx + 1}
                              </td>
                              <td className="py-3 px-4">
                                <p className="font-bold text-slate-100 text-xs">{stage.name}</p>
                                {stage.hindiName && (
                                  <p className="text-[11px] text-amber-400/90 font-medium mt-0.5">
                                    {stage.hindiName}
                                  </p>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${catBadgeColor}`}>
                                  {stage.category || 'General'}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <p className="text-slate-300 text-xs">
                                  Stage Order: <span className="font-mono text-amber-400">{stage.order || idx + 1}</span>
                                </p>
                                {stage.description && (
                                  <p className="text-[10px] text-slate-400 mt-0.5 max-w-xs truncate">
                                    {stage.description}
                                  </p>
                                )}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <button
                                  onClick={() => handleToggleStageActive(stage)}
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                                    stage.isActive !== false
                                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                                  }`}
                                  title="Click to toggle Active / Inactive in advocate dropdowns"
                                >
                                  {stage.isActive !== false ? '● Active' : '○ Inactive'}
                                </button>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => openEditStageModal(stage)}
                                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                                    title="Edit Stage Details"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteStage(stage)}
                                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 transition-colors"
                                    title="Delete Stage"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                            No case stages found matching your criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 8: BAR LICENSE & ORGANIZATION PROFILE */}
      {activeTab === 'license_profile' && (
        <div className="space-y-6">
          
          {/* Top Bar Summary Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Building2 className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
                      {currentTenant.code || 'BALLIA-BAR'}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                      currentTenant.status === 'active'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    }`}>
                      {currentTenant.status === 'active' ? '● Licensed & Active' : '● Inactive'}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-100 mt-1">
                    {currentTenant.name}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {currentTenant.affiliation || 'Bar Council of Uttar Pradesh'} • {currentTenant.district || 'Ballia'}, {currentTenant.state || 'Uttar Pradesh'}
                  </p>
                </div>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-right">
                <p className="text-[11px] text-slate-400">Software Edition</p>
                <p className="text-sm font-bold text-amber-400 uppercase tracking-wide">
                  {currentTenant.plan} Edition
                </p>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-6">
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <p className="text-[11px] text-slate-400">Software License Key</p>
                <p className="text-xs font-mono font-bold text-amber-400 truncate mt-1">
                  {currentTenant.licenseKey || 'NYAAY-ENT-BALLIA-2026'}
                </p>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <p className="text-[11px] text-slate-400">License Validity</p>
                <p className="text-xs font-bold text-emerald-400 mt-1">
                  {currentTenant.validUntil || 'Lifetime / 2026-2027'}
                </p>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <p className="text-[11px] text-slate-400">Advocate Quota</p>
                <p className="text-xs font-bold text-slate-100 mt-1">
                  {advocates.length} / {currentTenant.maxAdvocates || 'Unlimited'} Members
                </p>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <p className="text-[11px] text-slate-400">Enabled Modules</p>
                <p className="text-xs font-bold text-blue-400 mt-1">
                  {ALL_FEATURE_MODULES.filter(m => currentTenant.modules?.[m.key] !== false).length} / {ALL_FEATURE_MODULES.length} Active
                </p>
              </div>
            </div>
          </div>

          {/* Central Judicial Identity & Master App Icon Card (Super Admin Controlled) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-950 p-1 border border-amber-400/40 shadow-lg flex-shrink-0 flex items-center justify-center">
                <AdvocateLogo variant="auto" className="w-full h-full" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-amber-500/30">
                    Official Judicial Emblem • केन्द्रीय ऐप पहचान
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    🔒 Super Admin Exclusive
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">
                  Central PWA App Icon &amp; System Manifest
                </h3>
                <p className="text-xs text-slate-400 max-w-xl">
                  ऐप आइकन, लोगो और PWA मेनिफेस्ट केवल प्लेटफ़ॉर्म सुपर एडमिन द्वारा केंद्रीय स्तर पर नियंत्रित है। बार स्तर पर अलग से ब्रांडिंग अनुमत नहीं है ताकि पूरे न्यायिक नेटवर्क में एक समान प्रमाणित पहचान बनी रहे।
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-bold flex-shrink-0">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Standard Verified Seal</span>
            </div>
          </div>

          {/* Module Capabilities Grid */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                <span>Feature Modules &amp; Subscribed Capabilities (अनुमोदित मॉड्यूल्स)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Features configured for your Bar Association by the platform administrator.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {ALL_FEATURE_MODULES.map((mod) => {
                const isEnabled = currentTenant.modules?.[mod.key] !== false;
                return (
                  <div
                    key={mod.key}
                    className={`p-4 rounded-xl border transition-all ${
                      isEnabled
                        ? 'bg-slate-950/70 border-emerald-500/30 shadow-sm'
                        : 'bg-slate-950/40 border-slate-800/80 opacity-70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                          {mod.name}
                        </h4>
                        <p className="text-[10px] text-slate-400">{mod.hindiName}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isEnabled
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {isEnabled ? '✓ Enabled' : '🔒 Locked'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {mod.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Need Customization / Module Activation Note */}
            <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-blue-500/10 border border-amber-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-amber-300">
                  Need additional modules or customized Bar rules?
                </p>
                <p className="text-[11px] text-slate-400">
                  To turn on locked modules, request custom electoral bylaws, or extend advocate member quotas, contact the platform Super Admin.
                </p>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-mono text-slate-300 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                  support@nyaaysahayogi.in
                </span>
              </div>
            </div>
          </div>

          {/* Bar Organization Official Records Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Scale className="w-5 h-5 text-blue-400" />
              <span>Official Organization Record Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Official Bar Name</span>
                <span className="font-bold text-slate-200 mt-0.5 block">{currentTenant.name}</span>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Registration / Reg No.</span>
                <span className="font-bold text-slate-200 mt-0.5 block">{currentTenant.registrationNo || 'BAR/UP/BLA/001'}</span>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Bar Council Affiliation</span>
                <span className="font-bold text-slate-200 mt-0.5 block">{currentTenant.affiliation || 'Bar Council of Uttar Pradesh (BCUP)'}</span>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">District &amp; State</span>
                <span className="font-bold text-slate-200 mt-0.5 block">{currentTenant.district || 'Ballia'}, {currentTenant.state || 'Uttar Pradesh'}</span>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Official Contact Phone</span>
                <span className="font-bold text-slate-200 mt-0.5 block">{currentTenant.contactPhone || '+91 9415988800'}</span>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Official Secretariat Email</span>
                <span className="font-bold text-slate-200 mt-0.5 block">{currentTenant.contactEmail || 'balliabarassociation@gmail.com'}</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* MODAL 1: RECORD EXPENSE */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-slate-100 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-rose-400" />
                Record Bar Association Expense
              </h3>
              <button onClick={() => setIsAddExpenseOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Expense Title / Purpose *</label>
                <input
                  type="text"
                  required
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  placeholder="e.g. Purchase of Supreme Court Judgments Reporter"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={expAmount}
                    onChange={(e) => setExpAmount(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-bold text-rose-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Date *</label>
                  <input
                    type="text"
                    required
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    placeholder="DD/MM/YYYY"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-300">Category *</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddExpenseOpen(false);
                      openAddCategoryModal('EXPENSE');
                    }}
                    className="text-[10px] text-amber-400 hover:underline flex items-center gap-1"
                  >
                    + Add New Category
                  </button>
                </div>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                >
                  {expenseCategories.map(cat => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name} {cat.hindiName ? `(${cat.hindiName})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Payment Mode</label>
                  <select
                    value={expMode}
                    onChange={(e) => setExpMode(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="UPI / QR">UPI / QR</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Voucher No.</label>
                  <input
                    type="text"
                    value={expVoucher}
                    onChange={(e) => setExpVoucher(e.target.value)}
                    placeholder="VCH/2026/0412"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddExpenseOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RECORD INCOME / EARNING */}
      {isAddEarningOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-slate-100 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                Record Bar Association Income
              </h3>
              <button onClick={() => setIsAddEarningOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddEarning} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Member Advocate / Payer Name *</label>
                <input
                  type="text"
                  required
                  value={earnAdvName}
                  onChange={(e) => setEarnAdvName(e.target.value)}
                  placeholder="e.g. Adv. Shri Manoj Kumar"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Bar Reg. No</label>
                  <input
                    type="text"
                    value={earnBarNo}
                    onChange={(e) => setEarnBarNo(e.target.value)}
                    placeholder="UP/3421/2008"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={earnAmount}
                    onChange={(e) => setEarnAmount(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-bold text-emerald-400"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-300">Income Purpose / Category *</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddEarningOpen(false);
                      openAddCategoryModal('INCOME');
                    }}
                    className="text-[10px] text-amber-400 hover:underline flex items-center gap-1"
                  >
                    + Add New Category
                  </button>
                </div>
                <select
                  value={earnPurpose}
                  onChange={(e) => setEarnPurpose(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                >
                  {incomeCategories.map(cat => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name} {cat.hindiName ? `(${cat.hindiName})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Payment Mode</label>
                  <select
                    value={earnMode}
                    onChange={(e) => setEarnMode(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  >
                    <option value="UPI / QR">UPI / QR</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Razorpay">Razorpay Online</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Receipt / Txn ID</label>
                  <input
                    type="text"
                    value={earnTxnId}
                    onChange={(e) => setEarnTxnId(e.target.value)}
                    placeholder="TXN/2026/8921"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Date *</label>
                <input
                  type="text"
                  required
                  value={earnDate}
                  onChange={(e) => setEarnDate(e.target.value)}
                  placeholder="DD/MM/YYYY"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddEarningOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow"
                >
                  Save Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT / ADD CATEGORY */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-slate-100 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                {editingCategory ? 'Edit Finance Category' : `Add New ${catType} Category`}
              </h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Category Type *</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCatType('INCOME')}
                    className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                      catType === 'INCOME' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    Income (आय)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCatType('EXPENSE')}
                    className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                      catType === 'EXPENSE' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    Expense (व्यय)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Category Name (English) *</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Legal Aid Welfare / Chamber Allotment"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Category Name (Hindi / हिन्दी)</label>
                <input
                  type="text"
                  value={catHindiName}
                  onChange={(e) => setCatHindiName(e.target.value)}
                  placeholder="उदा. अधिवक्ता चिकित्सा व मृत्यु राहत सहायता"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Purpose of this category and usage instructions"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: EDIT / ADD ELECTION POST */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-slate-100 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <Vote className="w-5 h-5 text-amber-400" />
                {editingPost ? 'Edit Election Post' : 'Add New Election Post'}
              </h3>
              <button onClick={() => setIsPostModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSavePost} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Post Title (English) *</label>
                <input
                  type="text"
                  required
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="e.g. Senior Vice President"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Post Title (Hindi / हिन्दी) *</label>
                <input
                  type="text"
                  required
                  value={postHindiTitle}
                  onChange={(e) => setPostHindiTitle(e.target.value)}
                  placeholder="उदा. वरिष्ठ उपाध्यक्ष"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Unique Key / Code</label>
                  <input
                    type="text"
                    value={postKey}
                    onChange={(e) => setPostKey(e.target.value)}
                    placeholder="SR_VICE_PRESIDENT"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono uppercase text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Total Seats (पद संख्या) *</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={postSeatsCount}
                    onChange={(e) => setPostSeatsCount(Math.max(1, Number(e.target.value)))}
                    placeholder="e.g. 1 or 10"
                    className="w-full bg-slate-800 border border-amber-500/50 rounded-xl px-3 py-2 text-amber-300 font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Display Order</label>
                  <input
                    type="number"
                    min="1"
                    value={postOrder}
                    onChange={(e) => setPostOrder(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Description / Eligibility</label>
                <textarea
                  rows={2}
                  value={postDesc}
                  onChange={(e) => setPostDesc(e.target.value)}
                  placeholder="e.g. Senior bar member with minimum 20 years continuous practice"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow"
                >
                  Save Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: EDIT / ADD CANDIDATE */}
      {isCandidateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-slate-100 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-400" />
                {editingCandidate ? 'Edit Election Candidate' : 'Add Election Candidate'}
              </h3>
              <button onClick={() => setIsCandidateModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveCandidate} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Candidate Full Name *</label>
                <input
                  type="text"
                  required
                  value={candName}
                  onChange={(e) => setCandName(e.target.value)}
                  placeholder="Adv. Shri Rakesh Kumar Pandey"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Bar Reg. No *</label>
                  <input
                    type="text"
                    required
                    value={candBarNo}
                    onChange={(e) => setCandBarNo(e.target.value)}
                    placeholder="UP/2415/2001"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Election Post *</label>
                  <select
                    value={candPost}
                    onChange={(e) => setCandPost(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  >
                    {electionPosts.map(p => (
                      <option key={p.id} value={p.key}>
                        {p.title} ({p.hindiTitle}) - {p.seatsCount || 1} Seats
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Device Photo Upload (Replaces text URL) */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-300 flex items-center justify-between">
                  <span>Candidate Photo (डिवाइस से फोटो अपलोड करें)</span>
                  {candPhoto && (
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Photo Selected
                    </span>
                  )}
                </label>

                <div className="flex items-center gap-3 p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                  {candPhoto ? (
                    <div className="relative group flex-shrink-0">
                      <img
                        src={candPhoto}
                        alt="Candidate preview"
                        className="w-14 h-14 rounded-xl object-cover border-2 border-amber-500/50 shadow"
                      />
                      <button
                        type="button"
                        onClick={() => setCandPhoto('')}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] shadow hover:bg-rose-500"
                        title="Remove photo"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-slate-800 border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500 text-[9px] flex-shrink-0">
                      <ImageIcon className="w-5 h-5 text-slate-400 mb-0.5" />
                      <span>No Photo</span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold shadow transition-all">
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>{candPhoto ? 'Change Photo (फोटो बदलें)' : 'Upload from Device (डिवाइस से चुनें)'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              if (typeof reader.result === 'string') {
                                setCandPhoto(reader.result);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Choose portrait photo from your device (JPG, PNG, JPEG)
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Election Manifesto / Key Agenda</label>
                <textarea
                  rows={3}
                  value={candAgenda}
                  onChange={(e) => setCandAgenda(e.target.value)}
                  placeholder="e.g. Free medical insurance for young advocates, digitization of Ballia Bar Library"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCandidateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow"
                >
                  Save Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5B: EDIT / ADD STATE BAR COUNCIL POST */}
      {isStatePostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border-2 border-amber-500/40 shadow-2xl p-6 text-slate-100 space-y-4 my-8 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <Landmark className="w-5 h-5 text-amber-400" />
                {editingStatePost ? 'Edit State Council Post' : 'Add New State Council Post'}
              </h3>
              <button onClick={() => setIsStatePostModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveStatePost} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">State Post Title (English) *</label>
                <input
                  type="text"
                  required
                  value={statePostTitle}
                  onChange={(e) => setStatePostTitle(e.target.value)}
                  placeholder="e.g. Chairman, State Bar Council"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">State Post Title (Hindi / हिन्दी) *</label>
                <input
                  type="text"
                  required
                  value={statePostHindiTitle}
                  onChange={(e) => setStatePostHindiTitle(e.target.value)}
                  placeholder="उदा. अध्यक्ष, राज्य विधिज्ञ परिषद"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Unique Key</label>
                  <input
                    type="text"
                    value={statePostKey}
                    onChange={(e) => setStatePostKey(e.target.value)}
                    placeholder="STATE_CHAIRMAN"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono uppercase text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Total Seats *</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={statePostSeats}
                    onChange={(e) => setStatePostSeats(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-slate-800 border border-amber-500/50 rounded-xl px-3 py-2 text-amber-300 font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={statePostCategory}
                    onChange={(e) => setStatePostCategory(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2 py-2 text-slate-100 text-xs"
                  >
                    <option value="Apex">Apex</option>
                    <option value="Council">Council</option>
                    <option value="Welfare">Welfare</option>
                    <option value="Disciplinary">Disciplinary</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Description &amp; State Mandate</label>
                <textarea
                  rows={2}
                  value={statePostDesc}
                  onChange={(e) => setStatePostDesc(e.target.value)}
                  placeholder="Statutory role of this State Bar Council representative"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsStatePostModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow"
                >
                  Save State Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5C: EDIT / ADD STATE BAR COUNCIL CANDIDATE */}
      {isStateCandModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border-2 border-blue-500/40 shadow-2xl p-6 text-slate-100 space-y-4 my-8 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-400" />
                {editingStateCand ? 'Edit State Council Candidate' : 'Add State Council Candidate'}
              </h3>
              <button onClick={() => setIsStateCandModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveStateCand} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Candidate Name (English) *</label>
                  <input
                    type="text"
                    required
                    value={stateCandName}
                    onChange={(e) => setStateCandName(e.target.value)}
                    placeholder="Adv. Shri O. P. Singh"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Name in Hindi</label>
                  <input
                    type="text"
                    value={stateCandHindiName}
                    onChange={(e) => setStateCandHindiName(e.target.value)}
                    placeholder="उदा. श्री ओ. पी. सिंह"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">State Reg / Enrollment No *</label>
                  <input
                    type="text"
                    required
                    value={stateCandStateReg}
                    onChange={(e) => setStateCandStateReg(e.target.value)}
                    placeholder="UP/1084/1990"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">COP Number *</label>
                  <input
                    type="text"
                    required
                    value={stateCandCopNo}
                    onChange={(e) => setStateCandCopNo(e.target.value)}
                    placeholder="COP/UP/1990/1084"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">District Bar Affiliation *</label>
                  <select
                    value={stateCandDistrict}
                    onChange={(e) => setStateCandDistrict(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs"
                  >
                    {ALL_UP_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">State Council Post *</label>
                  <select
                    value={stateCandPost}
                    onChange={(e) => setStateCandPost(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs"
                  >
                    {statePosts.map(p => (
                      <option key={p.id} value={p.key}>
                        {p.title} ({p.hindiTitle})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Standing Years (अनुभव वर्ष)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={stateCandStanding}
                    onChange={(e) => setStateCandStanding(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Designation / Title</label>
                  <input
                    type="text"
                    value={stateCandDesignation}
                    onChange={(e) => setStateCandDesignation(e.target.value)}
                    placeholder="e.g. Senior Advocate / Former President"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              {/* Photo Upload */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-300">Candidate Photo</label>
                <div className="flex items-center gap-3 p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                  {stateCandPhoto ? (
                    <div className="relative flex-shrink-0">
                      <img
                        src={stateCandPhoto}
                        alt="State Candidate"
                        className="w-14 h-14 rounded-xl object-cover border-2 border-amber-500/50 shadow"
                      />
                      <button
                        type="button"
                        onClick={() => setStateCandPhoto('')}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px]"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-slate-800 border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500 text-[9px] flex-shrink-0">
                      <ImageIcon className="w-5 h-5 text-slate-400 mb-0.5" />
                      <span>No Photo</span>
                    </div>
                  )}

                  <div className="flex-1">
                    <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold cursor-pointer border border-slate-700">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setStateCandPhoto(reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">State Vision &amp; Manifesto</label>
                <textarea
                  rows={2}
                  value={stateCandAgenda}
                  onChange={(e) => setStateCandAgenda(e.target.value)}
                  placeholder="Key state-wide welfare and infrastructure agenda"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsStateCandModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow"
                >
                  Save State Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: EDIT / ADD COMMITTEE MEMBER */}
      {isCommitteeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-slate-100 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                {editingCommittee ? 'Edit Executive Committee Member' : 'Add Executive Committee Member'}
              </h3>
              <button onClick={() => setIsCommitteeModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveCommittee} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Member Advocate Name *</label>
                <input
                  type="text"
                  required
                  value={commName}
                  onChange={(e) => setCommName(e.target.value)}
                  placeholder="Adv. Shri O. P. Singh"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Post / Designation *</label>
                  <input
                    type="text"
                    required
                    value={commPost}
                    onChange={(e) => setCommPost(e.target.value)}
                    placeholder="President (अध्यक्ष)"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Hindi Designation</label>
                  <input
                    type="text"
                    value={commHindiPost}
                    onChange={(e) => setCommHindiPost(e.target.value)}
                    placeholder="अध्यक्ष"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Session Year *</label>
                  <input
                    type="text"
                    required
                    value={commSession}
                    onChange={(e) => setCommSession(e.target.value)}
                    placeholder="2026-2027"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Bar Reg. No</label>
                  <input
                    type="text"
                    value={commBarNo}
                    onChange={(e) => setCommBarNo(e.target.value)}
                    placeholder="1084/1990"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Mobile No.</label>
                  <input
                    type="tel"
                    value={commMobile}
                    onChange={(e) => setCommMobile(e.target.value)}
                    placeholder="9415988800"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Display Order</label>
                  <input
                    type="number"
                    min="1"
                    value={commOrder}
                    onChange={(e) => setCommOrder(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              {/* Committee Photo Upload */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-300 flex items-center justify-between">
                  <span>Member Photo (फोटो अपलोड करें)</span>
                  {commPhoto && (
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Photo Selected
                    </span>
                  )}
                </label>

                <div className="flex items-center gap-3 p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                  {commPhoto ? (
                    <div className="relative group flex-shrink-0">
                      <img
                        src={commPhoto}
                        alt="Member preview"
                        className="w-14 h-14 rounded-xl object-cover border-2 border-amber-500/50 shadow"
                      />
                      <button
                        type="button"
                        onClick={() => setCommPhoto('')}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] shadow hover:bg-rose-500"
                        title="Remove photo"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-slate-800 border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500 text-[9px] flex-shrink-0">
                      <ImageIcon className="w-5 h-5 text-slate-400 mb-0.5" />
                      <span>No Photo</span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold shadow transition-all">
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>{commPhoto ? 'Change Photo (फोटो बदलें)' : 'Upload from Device (डिवाइस से चुनें)'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              if (typeof reader.result === 'string') {
                                setCommPhoto(reader.result);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Choose member portrait from device (JPG, PNG)
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Status</label>
                <label className="flex items-center gap-2 text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={commIsCurrent}
                    onChange={(e) => setCommIsCurrent(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-800 border-slate-700"
                  />
                  <span>Currently Active Executive Committee Member</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCommitteeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow"
                >
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT COURT */}
      {isCourtModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-slate-100 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-400" />
                {editingCourt ? 'Edit Court / Forum (न्यायालय विवरण संपादित करें)' : 'Add New Court / Forum (नया न्यायालय जोड़ें)'}
              </h3>
              <button
                type="button"
                onClick={() => setIsCourtModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCourt} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Court / Forum Name (English) *
                </label>
                <input
                  type="text"
                  required
                  value={courtFormName}
                  onChange={(e) => setCourtFormName(e.target.value)}
                  placeholder="e.g. Court of Civil Judge (Senior Division), Ballia"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Court / Forum Name (हिंदी में)
                </label>
                <input
                  type="text"
                  value={courtFormHindiName}
                  onChange={(e) => setCourtFormHindiName(e.target.value)}
                  placeholder="उदा. न्यायालय सिविल जज (सीनियर डिवीजन), बलिया"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Court Classification *
                  </label>
                  <select
                    value={courtFormType}
                    onChange={(e) => setCourtFormType(e.target.value as CourtType)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="District & Sessions Court">District &amp; Sessions Court</option>
                    <option value="Magistrate Court">Magistrate Court</option>
                    <option value="Civil Court">Civil Court</option>
                    <option value="Revenue Court">Revenue Court</option>
                    <option value="Tribunal / Forum">Tribunal / Forum</option>
                    <option value="Other">Other Court / Forum</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Court Room / Hall No.
                  </label>
                  <input
                    type="text"
                    value={courtFormRoomNo}
                    onChange={(e) => setCourtFormRoomNo(e.target.value)}
                    placeholder="e.g. Room No. 4, Old Building"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Presiding Judicial Officer / Designation
                  </label>
                  <input
                    type="text"
                    value={courtFormPresidingOfficer}
                    onChange={(e) => setCourtFormPresidingOfficer(e.target.value)}
                    placeholder="e.g. Civil Judge (S.D.) / Addl. District Judge"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Sort / Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={courtFormOrder}
                    onChange={(e) => setCourtFormOrder(Number(e.target.value) || 1)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-200">Active in Advocate Dropdowns</p>
                  <p className="text-[11px] text-slate-400">If unchecked, advocates will not see this court in client modal selections.</p>
                </div>
                <input
                  type="checkbox"
                  id="courtIsActiveCheckbox"
                  checked={courtFormIsActive}
                  onChange={(e) => setCourtFormIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCourtModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
                >
                  Cancel (रद्द करें)
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20 transition-all"
                >
                  {editingCourt ? 'Update Court Details' : 'Add Court'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT CASE STAGE */}
      {isStageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-slate-100 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-blue-400" />
                {editingStage ? 'Edit Case Stage (वाद प्रक्रम संपादित करें)' : 'Add New Case Stage (नया वाद प्रक्रम जोड़ें)'}
              </h3>
              <button
                type="button"
                onClick={() => setIsStageModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStage} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Case Stage Name (English) *
                </label>
                <input
                  type="text"
                  required
                  value={stageFormName}
                  onChange={(e) => setStageFormName(e.target.value)}
                  placeholder="e.g. Evidence / गवाही (PW/DW)"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Case Stage Name (हिंदी में)
                </label>
                <input
                  type="text"
                  value={stageFormHindiName}
                  onChange={(e) => setStageFormHindiName(e.target.value)}
                  placeholder="उदा. साक्ष्य वादी / साक्ष्य प्रतिवादी / गवाही"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Jurisdiction / Category *
                  </label>
                  <select
                    value={stageFormCategory}
                    onChange={(e) => setStageFormCategory(e.target.value as 'General' | 'Criminal' | 'Civil' | 'Revenue')}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="General">General (सामान्य)</option>
                    <option value="Criminal">Criminal (फौजदारी)</option>
                    <option value="Civil">Civil (दीवानी)</option>
                    <option value="Revenue">Revenue (राजस्व)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Process Sequence Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={stageFormOrder}
                    onChange={(e) => setStageFormOrder(Number(e.target.value) || 1)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Stage Description / Notes for Advocate
                </label>
                <textarea
                  rows={2}
                  value={stageFormDescription}
                  onChange={(e) => setStageFormDescription(e.target.value)}
                  placeholder="e.g. Recording of oral testimony or cross-examination of witnesses."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-200">Active in Advocate Dropdowns</p>
                  <p className="text-[11px] text-slate-400">If unchecked, advocates will not see this stage in client modal selections.</p>
                </div>
                <input
                  type="checkbox"
                  id="stageIsActiveCheckbox"
                  checked={stageFormIsActive}
                  onChange={(e) => setStageFormIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-500 focus:ring-blue-400 accent-blue-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsStageModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
                >
                  Cancel (रद्द करें)
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/20 transition-all"
                >
                  {editingStage ? 'Update Case Stage' : 'Add Case Stage'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT STATE BAR COUNCIL VOTER (75 Districts Roll) */}
      {isStateVoterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-3xl bg-slate-900 border-2 border-emerald-500/40 shadow-2xl p-6 text-slate-100 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-100">
                    {editingStateVoter ? 'Edit State Voter Advocate Profile' : 'Add Advocate to State Voter Roll (75 Districts)'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Bar Council of Uttar Pradesh General Election Voter Registration
                  </p>
                </div>
              </div>
              <button onClick={() => setIsStateVoterModalOpen(false)} className="text-slate-400 hover:text-white text-lg">✕</button>
            </div>

            <form onSubmit={handleSaveStateVoter} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Advocate Full Name (English) *</label>
                  <input
                    type="text"
                    required
                    value={stateVoterFormName}
                    onChange={(e) => setStateVoterFormName(e.target.value)}
                    placeholder="Adv. Shri Anand Swaroop Shukla"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-emerald-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Hindi Name (हिन्दी नाम)</label>
                  <input
                    type="text"
                    value={stateVoterFormHindiName}
                    onChange={(e) => setStateVoterFormHindiName(e.target.value)}
                    placeholder="उदा. आनन्द स्वरूप शुक्ला"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-emerald-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">State Bar Council Enrollment No. *</label>
                  <input
                    type="text"
                    required
                    value={stateVoterFormRegNo}
                    onChange={(e) => setStateVoterFormRegNo(e.target.value)}
                    placeholder="UP/3412/1992"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-emerald-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Certificate of Practice (COP) No. *</label>
                  <input
                    type="text"
                    required
                    value={stateVoterFormCopNo}
                    onChange={(e) => setStateVoterFormCopNo(e.target.value)}
                    placeholder="COP/UP/1992/3412"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-emerald-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">District Bar Association (जिला बार संघ) *</label>
                  <select
                    value={stateVoterFormDistrict}
                    onChange={(e) => setStateVoterFormDistrict(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-semibold focus:border-emerald-400 focus:outline-none"
                  >
                    {ALL_UP_DISTRICTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Tahsil / Court Campus</label>
                  <input
                    type="text"
                    value={stateVoterFormTahsil}
                    onChange={(e) => setStateVoterFormTahsil(e.target.value)}
                    placeholder="Sadar / Bansdih / Rasra"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-emerald-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Mobile No.</label>
                  <input
                    type="text"
                    value={stateVoterFormMobile}
                    onChange={(e) => setStateVoterFormMobile(e.target.value)}
                    placeholder="9415XXXXXX"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-emerald-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Email ID</label>
                  <input
                    type="email"
                    value={stateVoterFormEmail}
                    onChange={(e) => setStateVoterFormEmail(e.target.value)}
                    placeholder="advocate@bar.in"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-emerald-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Standing (Years)</label>
                  <input
                    type="number"
                    min="1"
                    value={stateVoterFormExp}
                    onChange={(e) => setStateVoterFormExp(Number(e.target.value) || 1)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-emerald-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Chamber / Office No.</label>
                  <input
                    type="text"
                    value={stateVoterFormChamber}
                    onChange={(e) => setStateVoterFormChamber(e.target.value)}
                    placeholder="Chamber 12, Senior Lawyers Hall"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-emerald-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Practice Areas (Comma separated)</label>
                  <input
                    type="text"
                    value={stateVoterFormSpec}
                    onChange={(e) => setStateVoterFormSpec(e.target.value)}
                    placeholder="CRIMINAL, REVENUE, CIVIL"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-emerald-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-200">Active Certificate of Practice (COP)</p>
                  <p className="text-[10px] text-slate-400">Only advocates with verified COP are allowed to cast state ballots.</p>
                </div>
                <input
                  type="checkbox"
                  id="voterCopCheckbox"
                  checked={stateVoterFormCopValid}
                  onChange={(e) => setStateVoterFormCopValid(e.target.checked)}
                  className="w-5 h-5 rounded text-emerald-500 focus:ring-emerald-400 accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsStateVoterModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/20"
                >
                  {editingStateVoter ? 'Update Voter Profile' : 'Save to State Voter Roll'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PRINT DISTRICT-WISE VOTER ROLL (Official Printable Roster) */}
      {isPrintRollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 overflow-y-auto">
          <div className="w-full max-w-4xl rounded-3xl bg-white text-slate-950 shadow-2xl p-6 sm:p-8 space-y-6 my-8 print:p-0 print:shadow-none">
            
            {/* Action buttons (hidden on print) */}
            <div className="flex items-center justify-between border-b pb-4 print:hidden">
              <div className="flex items-center gap-2">
                <span className="bg-amber-100 text-amber-900 px-3 py-1 rounded-lg text-xs font-bold">
                  Official Printable Voter Roster
                </span>
                <select
                  value={printRollDistrict}
                  onChange={(e) => setPrintRollDistrict(e.target.value)}
                  className="border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-800"
                >
                  <option value="ALL">All 75 Districts (समस्त 75 जिले)</option>
                  {ALL_UP_DISTRICTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs flex items-center gap-1.5 shadow"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Now (प्रिंट करें)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrintRollModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Printable Official Document Header */}
            <div className="text-center space-y-1.5 border-b-2 border-slate-900 pb-4">
              <div className="inline-block px-3 py-0.5 rounded border border-slate-800 text-[10px] font-bold uppercase tracking-widest text-slate-800">
                Form IV • Advocates Act 1961 • Bar Council of Uttar Pradesh
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight uppercase">
                BAR COUNCIL OF UTTAR PRADESH, PRAYAGRAJ
              </h2>
              <h3 className="text-sm font-bold text-slate-800 uppercase">
                राज्य विधिज्ञ परिषद उत्तर प्रदेश - सामान्य निर्वाचन {stateConfig.termYear || '2026-2027'}
              </h3>
              <p className="text-xs font-semibold text-slate-700">
                जिला बार संघ अधिकृत मतदाता सूची (Official District Voter Roll): <strong className="text-slate-950">{printRollDistrict === 'ALL' ? 'समस्त 75 जिले (All Districts of UP)' : printRollDistrict}</strong>
              </p>
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-600 pt-2">
                <span>Date of Issue: {todayStr}</span>
                <span>Chief Election Officer: {stateConfig.chiefElectionOfficer}</span>
                <span>Total Enrolled: {stateVoters.filter(v => printRollDistrict === 'ALL' || v.districtBar === printRollDistrict || v.districtBar.includes(printRollDistrict.split(' ')[0])).length}</span>
              </div>
            </div>

            {/* Printable Roster Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-300 border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-900 text-[10px] uppercase font-bold">
                    <th className="border border-slate-300 p-2 text-center w-10">S.No</th>
                    <th className="border border-slate-300 p-2">Advocate Name &amp; Father's Name</th>
                    <th className="border border-slate-300 p-2">State Reg. No.</th>
                    <th className="border border-slate-300 p-2">COP No.</th>
                    <th className="border border-slate-300 p-2">District Bar &amp; Tahsil</th>
                    <th className="border border-slate-300 p-2 text-center">COP Status</th>
                    <th className="border border-slate-300 p-2 text-center">Voting Status</th>
                    <th className="border border-slate-300 p-2 text-center w-24">Voter Signature</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-[11px]">
                  {stateVoters
                    .filter(v => printRollDistrict === 'ALL' || v.districtBar === printRollDistrict || v.districtBar.includes(printRollDistrict.split(' ')[0]))
                    .map((v, idx) => {
                      const hasVoted = db.hasAdvocateVotedAnyStatePost(v.stateRegNo, v.copNo);
                      return (
                        <tr key={v.stateRegNo} className="hover:bg-slate-50">
                          <td className="border border-slate-300 p-2 text-center font-mono text-slate-600 font-bold">{idx + 1}</td>
                          <td className="border border-slate-300 p-2">
                            <div className="font-bold text-slate-900">{v.advocateName}</div>
                            {v.hindiName && <div className="text-[10px] text-slate-600">{v.hindiName}</div>}
                          </td>
                          <td className="border border-slate-300 p-2 font-mono font-bold text-slate-900">{v.stateRegNo}</td>
                          <td className="border border-slate-300 p-2 font-mono text-slate-700">{v.copNo}</td>
                          <td className="border border-slate-300 p-2">
                            <div className="font-medium text-slate-800">{v.districtBar}</div>
                            <div className="text-[10px] text-slate-500">Tahsil: {v.tahsil || 'Sadar'}</div>
                          </td>
                          <td className="border border-slate-300 p-2 text-center font-bold text-[10px]">
                            {v.isCopValid ? (
                              <span className="text-emerald-800">✅ VALID</span>
                            ) : (
                              <span className="text-rose-800">❌ SUSPENDED</span>
                            )}
                          </td>
                          <td className="border border-slate-300 p-2 text-center font-bold text-[10px]">
                            {hasVoted ? (
                              <span className="text-emerald-800">🗳️ VOTED</span>
                            ) : (
                              <span className="text-slate-500">PENDING</span>
                            )}
                          </td>
                          <td className="border border-slate-300 p-2 text-center">
                            <div className="h-6 border-b border-dashed border-slate-400"></div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* Official Certification Footer */}
            <div className="pt-6 grid grid-cols-3 text-center text-xs font-bold text-slate-800 border-t border-slate-300">
              <div className="space-y-6">
                <p>Prepared &amp; Verified By</p>
                <p className="border-t border-slate-400 pt-1 text-[10px] text-slate-600">Assistant Returning Officer</p>
              </div>
              <div className="space-y-6">
                <p>District Bar Association Seal</p>
                <p className="border-t border-slate-400 pt-1 text-[10px] text-slate-600">President / General Secretary</p>
              </div>
              <div className="space-y-6">
                <p>Chief Election Officer</p>
                <p className="border-t border-slate-400 pt-1 text-[10px] text-slate-600">Bar Council of Uttar Pradesh</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD NEW ADVOCATE / MEMBER MODAL (DISTRICT BAR ADMIN) */}
      {isAddAdvocateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-amber-500/40 shadow-2xl p-6 sm:p-8 text-slate-100 space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-100">
                    + Add New Advocate / Bar Member (नया अधिवक्ता सदस्य जोड़ें)
                  </h3>
                  <p className="text-xs text-slate-400">
                    {currentTenant.name} • डायरेक्ट अप्रूवल व डिजिटल बार आईडी जारी करें
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddAdvocateModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAdvocateByAdmin} className="space-y-4 text-xs">
              {/* Bar Reg No & COP with State Roll Auto-Verify */}
              <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Landmark className="w-4 h-4 text-amber-400" />
                    <span>Step 1: बार काउंसिल पंजीकरण व COP संख्या</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleAutoVerifyFromStateRoll}
                    className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] flex items-center gap-1.5 shadow transition-all"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>🔍 State Bar Roll से ऑटो-फिल करें</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      State Bar Registration No. (बार पंजीकरण संख्या) *
                    </label>
                    <input
                      type="text"
                      required
                      value={newAdvForm.barNo}
                      onChange={(e) => setNewAdvForm({ ...newAdvForm, barNo: e.target.value })}
                      placeholder="e.g. UP/04512/2018 or 1250/2015"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      COP Number (सी.ओ.पी. संख्या)
                    </label>
                    <input
                      type="text"
                      value={newAdvForm.copNo}
                      onChange={(e) => setNewAdvForm({ ...newAdvForm, copNo: e.target.value })}
                      placeholder="e.g. COP/UP/2018/5512"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Personal & Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Advocate Full Name (अधिवक्ता का नाम) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newAdvForm.name}
                    onChange={(e) => setNewAdvForm({ ...newAdvForm, name: e.target.value })}
                    placeholder="e.g. Adv. Rajesh Kumar Singh"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Father's / Husband's Name (पिता/पति का नाम) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newAdvForm.fatherName}
                    onChange={(e) => setNewAdvForm({ ...newAdvForm, fatherName: e.target.value })}
                    placeholder="e.g. Late Ramnath Singh"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Mobile Number (मोबाइल नंबर) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newAdvForm.mobile}
                    onChange={(e) => setNewAdvForm({ ...newAdvForm, mobile: e.target.value })}
                    placeholder="e.g. 9415223344"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Date of Birth (जन्मतिथि)
                  </label>
                  <input
                    type="text"
                    value={newAdvForm.dob}
                    onChange={(e) => setNewAdvForm({ ...newAdvForm, dob: e.target.value })}
                    placeholder="DD/MM/YYYY"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Email ID (लॉगिन ईमेल)
                  </label>
                  <input
                    type="email"
                    value={newAdvForm.email}
                    onChange={(e) => setNewAdvForm({ ...newAdvForm, email: e.target.value })}
                    placeholder="advocate@example.com"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Login Password (लॉगिन पासवर्ड)
                  </label>
                  <input
                    type="text"
                    value={newAdvForm.password}
                    onChange={(e) => setNewAdvForm({ ...newAdvForm, password: e.target.value })}
                    placeholder="Advocate@123"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-amber-300 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Tahsil (तहसील)
                  </label>
                  <input
                    type="text"
                    value={newAdvForm.tahsil}
                    onChange={(e) => setNewAdvForm({ ...newAdvForm, tahsil: e.target.value })}
                    placeholder="e.g. Ballia Sadar / Rasra / Bansdih"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Chamber / Seat No. (चैंबर / सीट संख्या)
                  </label>
                  <input
                    type="text"
                    value={newAdvForm.chamberNo}
                    onChange={(e) => setNewAdvForm({ ...newAdvForm, chamberNo: e.target.value })}
                    placeholder="e.g. Chamber No. 24, Civil Court Compound"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-300 mb-1">
                    Specialization (विशेषज्ञता - कॉमा से अलग करें)
                  </label>
                  <input
                    type="text"
                    value={newAdvForm.specialization}
                    onChange={(e) => setNewAdvForm({ ...newAdvForm, specialization: e.target.value })}
                    placeholder="CRIMINAL, CIVIL, REVENUE, MATRIMONIAL"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddAdvocateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  Cancel (रद्द करें)
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>Save &amp; Approve Member (सदस्य जोड़ें)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOG MODAL (Reliable, In-App, Iframe Compatible) */}
      {confirmModal && confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-slate-100 space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-100">{confirmModal.title}</h3>
                <p className="text-xs text-slate-400">Confirmation required</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
              {confirmModal.message}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors"
              >
                Cancel (रद्द करें)
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className={`px-5 py-2 rounded-xl font-bold text-xs shadow-lg transition-all ${
                  confirmModal.danger
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                }`}
              >
                {confirmModal.confirmLabel || 'Confirm Action'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
