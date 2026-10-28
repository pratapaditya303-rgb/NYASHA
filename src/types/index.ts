export interface Address {
  village: string;
  post: string;
  tahsil: string;
  policeStation: string;
  district: string;
  state: string;
  pincode: string;
}

export const POLICE_STATIONS_BALLIA = [
  'कोतवाली बलिया (Kotwali Ballia)',
  'बांसडीह रोड (Bansdih Road)',
  'बांसडीह कोतवाली (Bansdih Kotwali)',
  'सहतवार (Sahatwar)',
  'रेवती (Reoti)',
  'सुखपुरा (Sukhpura)',
  'सिकंदरपुर (Sikanderpur)',
  'उभांव (Ubhawn / Belthra Road)',
  'बैरिया (Bairia)',
  'दुबहड़ (Dubhar)',
  'हल्दी (Haldi)',
  'फेफना (Phephana)',
  'रसड़ा कोतवाली (Rasara Kotwali)',
  'नरहीं (Narahin)',
  'चितबड़ागांव (Chitbara Gaon)',
  'नगरा (Nagara)',
  'गड़वार (Garwar)',
  'दोकटी (Dokati)',
  'खेजुरी (Khejuri)',
  'मनियर (Maniar)',
  'भीमपुरा (Bhimpura)',
  'पकरी (Pakari)',
  'जी.आर.पी. बलिया (G.R.P. Ballia - रेलवे पुलिस)',
  'Other / अन्य'
];

export const TAHSILS_BALLIA = [
  'Ballia Sadar',
  'Bansdih',
  'Rasra',
  'Bairia',
  'Sikanderpur',
  'Belthara Road'
];

export type CaseNature = 'CIVIL' | 'CRIMINAL' | 'MATRIMONIAL' | 'MVACT' | 'JUVENILE' | 'REVENUE';
export type SpecializationType = CaseNature;

export type AdvocateStatus = 'PENDING' | 'APPROVED' | 'BLOCKED' | 'REJECTED' | 'PENDING_APPROVAL';

export interface AdvocateReview {
  id: string;
  advocateId: string;
  clientName: string;
  clientMobile?: string;
  caseNo?: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
}

export type UserRole = 'advocate' | 'admin' | 'bar_admin' | 'super_admin' | 'state_bar_admin';

export interface Advocate {
  id: string;
  name: string;
  fatherName: string;
  dob: string; // DD/MM/YYYY
  age: number;
  address: Address;
  barNo: string; // Regex: ^[0-9]{1,6}/[0-9]{4}$ or UP/XXXXX/YYYY
  copNo: string;
  mobile: string;
  email: string;
  password?: string;
  photoUrl: string;
  certificateUrl?: string;
  status: AdvocateStatus;
  role: UserRole;
  tenantId?: string; // Links advocate to a specific Bar Association / Tenant Org
  affiliatedBar?: string; // e.g. "Criminal & Revenue Bar Association, Ballia" or "District Bar Association, Varanasi"
  validTill: string; // DD/MM/YYYY
  createdAt: string;
  rating: number;
  reviewCount?: number;
  reviewsCount?: number;
  reviews?: AdvocateReview[];
  specialization: CaseNature[];
  isTopCriminalLawyer?: boolean;
  chamberNo?: string;
  experienceYears?: number;
  bio?: string;
  isProMember?: boolean;
  proPlanType?: 'FREE' | 'MONTHLY' | 'YEARLY';
  proValidTill?: string;
}

export interface Client {
  id: string;
  advocateId: string;
  advocateName: string;
  advocateBarNo: string;
  clientName: string;
  clientFatherName?: string;
  clientMobile: string;
  isMobileVerified: boolean;
  address: Address;
  caseTitle?: string; // A. Case Name vs Name (e.g. Ramesh vs Suresh / रमेश बनाम सुरेश)
  caseNameVsName?: string; // Synonym
  caseNo: string; // B. Case No (वाद संख्या)
  caseNature: CaseNature; // C. Case Nature (वाद प्रकृति)
  courtName: string;
  previousDate: string; // DD/MM/YYYY
  nextHearingDate: string; // DD/MM/YYYY
  caseStage: string;
  totalFees: number;
  feesReceived: number;
  feesPending: number; // auto calc: totalFees - feesReceived
  status: 'Open' | 'Closed';
  createdAt: string;
  notes?: string;
}

export type EarningPurpose = string;
export type PaymentMode = 'UPI' | 'Cash' | 'Online' | 'Razorpay' | 'UPI / QR' | 'Debit/Credit Card' | 'Net Banking' | string;

export interface FinanceCategory {
  id: string;
  name: string;
  hindiName?: string;
  type: 'INCOME' | 'EXPENSE';
  description?: string;
}

export interface Earning {
  id: string;
  date: string; // DD/MM/YYYY
  advocateId: string;
  advocateName: string;
  barNo: string;
  amount: number;
  purpose: EarningPurpose;
  mode: PaymentMode;
  txnId: string;
  notes?: string;
  createdAt: string;
}

export type ExpenseCategory = string;

export interface Expense {
  id: string;
  date: string; // DD/MM/YYYY
  amount: number;
  purposeTitle: string;
  category: ExpenseCategory;
  mode: string;
  voucherNo?: string;
  approvedBy?: string;
  billPhotoUrl?: string;
  createdAt?: string;
}

export type ElectionStatus = 'Upcoming' | 'NominationOpen' | 'VotingOpen' | 'Closed' | 'ResultDeclared' | 'VotingClosed' | 'ResultsDeclared' | 'NominationsOpen' | 'Draft';

export interface ElectionPost {
  id: string;
  key: string;
  title: string;
  hindiTitle: string;
  description?: string;
  order: number;
  seatsCount: number; // Post संख्या / Total Seats (e.g., President: 1, Executive Member: 10)
}

export interface ElectionCandidate {
  id: string;
  name: string;
  barNo: string;
  post: string;
  photoUrl: string;
  agenda: string;
  votesCount: number;
  status?: string;
}

export interface Election {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  nominationStart: string;
  nominationEnd: string;
  status: ElectionStatus;
  showResultPublic: boolean;
  posts: string[];
}

export interface Nomination {
  id: string;
  electionId: string;
  advocateId: string;
  name: string;
  photo: string;
  barNo: string;
  post: string;
  manifesto: string;
  symbol: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface Vote {
  id: string;
  electionId?: string;
  voterId?: string; // Advocate ID
  voterBarNo: string;
  post: string;
  candidateId: string;
  candidateName?: string;
  timestamp: string;
}

// ==========================================
// STATE LEVEL BAR COUNCIL VOTING SYSTEM TYPES
// ==========================================

export interface StateBarElectionPost {
  id: string;
  key: string;
  title: string;
  hindiTitle: string;
  description: string;
  order: number;
  seatsCount: number;
  category?: 'Apex' | 'Council' | 'Welfare' | 'Disciplinary';
}

export interface StateBarElectionCandidate {
  id: string;
  name: string;
  hindiName?: string;
  stateRegNo: string; // State Bar Council Registration / Enrollment No. (e.g., UP/1084/1990)
  copNo: string;      // Certificate of Practice No. (e.g., COP/UP/1990/1084)
  districtBar: string; // District Bar Association (e.g., Ballia, Lucknow, Varanasi, Allahabad, Gorakhpur)
  post: string;       // Key matching StateBarElectionPost.key
  photoUrl: string;
  agenda: string;
  standingYears: number;
  designation?: string;
  votesCount: number;
  districtVoteBreakdown?: Record<string, number>; // District name -> vote count
  status?: 'ACTIVE' | 'WITHDRAWN';
}

export interface StateBarVote {
  id: string;
  postKey: string;
  candidateId: string;
  candidateName: string;
  voterStateRegNo: string;
  voterCopNo: string;
  voterDistrictBar: string;
  voterName: string;
  ballotHash: string; // Digital audit hash
  timestamp: string;
}

export interface StateBarVoterEligibility {
  id?: string;
  stateRegNo: string;
  copNo: string;
  advocateName: string;
  hindiName?: string;
  districtBar: string;
  tahsil?: string;
  mobile?: string;
  email?: string;
  chamberNo?: string;
  experienceYears?: number;
  specialization?: string[];
  photoUrl?: string;
  isCopValid: boolean;
  status: 'APPROVED' | 'PENDING' | 'SUSPENDED' | 'ACTIVE' | 'HOLD';
  votingStatus?: 'VOTED' | 'PENDING';
  votedAt?: string;
  ballotHash?: string;
  votedPosts?: string[];
}

export interface StateBarElectionConfig {
  id: string;
  title: string;
  stateBarCouncilName: string;
  termYear: string;
  isEnabled: boolean; // Master ON/OFF Switch
  status: ElectionStatus;
  votingStartDate: string;
  votingEndDate: string;
  chiefElectionOfficer: string;
  totalRegisteredDistricts: number;
  totalVotersCount: number;
  allowAllDistricts: boolean;
  notificationBanner?: string;
  isVotingLive?: boolean;
}

export interface DistrictBarElectionConfig {
  id: string;
  title: string;
  barAssociationName: string;
  termYear: string;
  isEnabled: boolean;
  status: ElectionStatus;
  votingStartDate: string;
  votingEndDate: string;
  chiefElectionOfficer: string;
  totalVotersCount: number;
  notificationBanner?: string;
  isVotingLive?: boolean;
}

export const ALL_UP_DISTRICTS: string[] = [
  'Ballia (बलिया)',
  'Lucknow (लखनऊ)',
  'Varanasi (वाराणसी)',
  'Prayagraj / Allahabad (प्रयागराज)',
  'Gorakhpur (गोरखपुर)',
  'Kanpur Nagar (कानपुर नगर)',
  'Meerut (मेरठ)',
  'Agra (आगरा)',
  'Bareilly (बरेली)',
  'Aligarh (अलीगढ़)',
  'Moradabad (मुरादाबाद)',
  'Saharanpur (सहारनपुर)',
  'Ghaziabad (गाजियाबाद)',
  'Gautam Buddha Nagar / Noida (गौतम बुद्ध नगर)',
  'Ayodhya (अयोध्या)',
  'Azamgarh (आजमगढ़)',
  'Mau (मऊ)',
  'Ghazipur (गाजीपुर)',
  'Deoria (देवरिया)',
  'Jaunpur (जौनपुर)',
  'Mirzapur (मिर्जापुर)',
  'Sonbhadra (सोनभद्र)',
  'Basti (बस्ती)',
  'Siddharthnagar (सिद्धार्थनगर)',
  'Kushinagar (कुशीनगर)',
  'Maharajganj (महराजगंज)',
  'Sant Kabir Nagar (संत कबीर नगर)',
  'Gonda (गोंडा)',
  'Bahraich (बहराइच)',
  'Balrampur (बलरामपुर)',
  'Shravasti (श्रावस्ती)',
  'Sitapur (सीतापुर)',
  'Hardoi (हरदोई)',
  'Lakhimpur Kheri (लखीमपुर खीरी)',
  'Unnao (उन्नाव)',
  'Rae Bareli (रायबरेली)',
  'Amethi (अमेठी)',
  'Sultanpur (सुल्तानपुर)',
  'Pratapgarh (प्रतापगढ़)',
  'Fatehpur (फतेहपुर)',
  'Kaushambi (कौशाम्बी)',
  'Banda (बांदा)',
  'Chitrakoot (चित्रकूट)',
  'Hamirpur (हमीरपुर)',
  'Mahoba (महोबा)',
  'Jhansi (झांसी)',
  'Lalitpur (ललितपुर)',
  'Jalaun (जालौन)',
  'Etawah (इटावा)',
  'Mainpuri (मैनपुरी)',
  'Kannauj (कन्नौज)',
  'Farrukhabad (फर्रुखाबाद)',
  'Auraiya (औरैया)',
  'Mathura (मथुरा)',
  'Firozabad (फिरोजाबाद)',
  'Etah (एटा)',
  'Kasganj (कासगंज)',
  'Hathras (हाथरस)',
  'Badaun (बदायूं)',
  'Pilibhit (पीलीभीत)',
  'Shahjahanpur (शाहजहांपुर)',
  'Rampur (रामपुर)',
  'Bijnor (बिजनौर)',
  'Amroha (अमरोहा)',
  'Sambhal (संभल)',
  'Muzaffarnagar (मुजफ्फरनगर)',
  'Shamli (शामली)',
  'Baghpat (बागपत)',
  'Bulandshahr (बुलंदशहर)',
  'Hapur (हापुड़)',
  'Chandauli (चंदौली)',
  'Bhadohi (भदोही)'
];

export interface CauseListItem {
  id: string;
  caseNo: string;
  courtNo?: string;
  courtName: string;
  judgeName?: string;
  date: string; // DD/MM/YYYY
  partyDetails?: string; // Petitioner vs Respondent
  parties?: string;
  petitionerAdvocate?: string;
  respondentAdvocate?: string;
  advocateName?: string;
  caseStage?: string;
  stage?: string;
  caseNature?: CaseNature;
  itemNo?: number;
  pdfUrl?: string;
}

export interface LegalResource {
  id: string;
  title: string;
  actName: string;
  category: 'CRIMINAL' | 'REVENUE' | 'CIVIL' | 'FORMATS';
  sections: string;
  summary: string;
  content: string;
  year?: string;
  pdfUrl?: string;
  pdfFileName?: string;
  externalUrl?: string;
  createdAt?: string;
}

export interface ELibraryItem {
  id: string;
  title: string;
  category: 'IPC / BNS' | 'CrPC / BNSS' | 'CPC' | 'UP Revenue Code 2006' | 'Evidence Act / BSA' | 'Other Acts';
  description: string;
  actYear: string;
  downloadUrl?: string;
  size: string;
  pagesCount: number;
  keySections: string;
}

export interface OfficeBearer {
  id: string;
  name: string;
  designation: string;
  hindiDesignation: string;
  barNo: string;
  mobile: string;
  photoUrl: string;
  tenure?: string;
  term?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'Upcoming' | 'Running' | 'Completed';
  budget: number;
  imageUrl: string;
  startDate: string;
  targetDate: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Events' | 'Meetings' | 'Court';
  imageUrl: string;
  date: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderBarNo: string;
  receiverId: string;
  receiverName: string;
  message: string;
  timestamp: string;
}

export interface AppSettings {
  aboutUs: string;
  logoUrl: string;
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
  website: string;
  showEarningOnHome: boolean;
  annualMembershipFee: number;
}

export interface CommitteeMember {
  id: string;
  name: string;
  post: string;
  hindiPost?: string;
  sessionYear: string; // e.g. "2025-2026", "2026-2027"
  photo: string;
  barNo: string;
  mobile: string;
  email?: string;
  chamberNo?: string;
  isCurrent: boolean;
  order: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  link?: string;
  targetAudience?: 'All' | 'Selected';
  targetRole?: 'all' | 'advocate' | 'admin';
  recipientIds?: string[];
  createdAt: string;
  isRead?: boolean;
}

export interface MentorshipOpening {
  id: string;
  seniorName: string;
  seniorBarNo: string;
  specialization: string[];
  stipend: string;
  vacancies: number;
  chamberNo: string;
  requirements: string;
  applicantsCount?: number;
}

export interface JuniorSeniorPost {
  id: string;
  advocateId: string;
  advocateName: string;
  barNo: string;
  contact: string;
  type: 'Need Senior' | 'Need Junior';
  caseNature: CaseNature;
  title: string;
  message: string;
  experienceYears?: number;
  createdAt: string;
}

export interface EmergencyRequest {
  id: string;
  name: string;
  mobile: string;
  problem: string;
  location: string;
  timestamp: string;
  status: 'New' | 'Contacted' | 'Assigned';
}

export type CourtType = 
  | 'District & Sessions Court' 
  | 'Revenue Court' 
  | 'Magistrate Court' 
  | 'Civil Court'
  | 'Tribunal / Forum' 
  | 'High Court' 
  | 'Other';

export interface CourtMaster {
  id: string;
  name: string;
  hindiName?: string;
  type: CourtType;
  roomNo?: string;
  presidingOfficer?: string;
  order?: number;
  isActive: boolean;
}

export interface CaseStageMaster {
  id: string;
  name: string;
  hindiName?: string;
  category: 'Criminal' | 'Civil' | 'Revenue' | 'General';
  description?: string;
  order?: number;
  isActive: boolean;
}

// ==========================================
// 2-TIER ADMIN & LICENSING SYSTEM TYPES
// ==========================================

export type FeatureModuleKey = 
  | 'finance'            // आय-व्यय व वित्तीय लेजर
  | 'id_cards'           // डिजिटल बार आईडी कार्ड व COP क्यूआर सत्यापन
  | 'causelist'          // दैनिक वाद सूची (Daily Cause List)
  | 'election'           // बार एसोसिएशन चुनाव व ई-वोटिंग
  | 'elibrary'           // विधिक ई-लाइब्रेरी व बेर एक्ट्स
  | 'ai_assistant'       // न्याय सहायक AI विधिक सलाहकार
  | 'broadcast'          // सूचना व नोटिस ब्रॉडकास्ट (SMS/Alerts)
  | 'junior_senior'      // जूनियर-सीनियर कनेक्ट व चेंबर वेकेंसी
  | 'emergency'          // 24x7 आपातकालीन विधिक सहायता
  | 'courts_stages'      // न्यायालय व वाद प्रक्रम मास्टर प्रबंधन
  | 'client_portal'      // मुवक्किल केस ट्रैकिंग व ई-रसीद
  | 'directory'          // सार्वजनिक अधिवक्ता डायरेक्टरी व खोज
  | 'state_bar_verify';  // राज्य बार मतदाता सत्यापन व रीड पोर्टल

export interface FeatureModuleMeta {
  key: FeatureModuleKey;
  name: string;
  hindiName: string;
  description: string;
  icon: string;
  category: 'CORE' | 'FINANCE' | 'JUDICIAL' | 'COMMUNICATION' | 'AI_AND_TOOLS';
  isPremium?: boolean;
}

export type TenantPlan = 'TRIAL' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE_BAR' | 'CONSTITUTIONAL_APEX_COUNCIL';
export type TenantStatus = 'ACTIVE' | 'SUSPENDED' | 'EXPIRED';
export type TenantType = 'STATE_BAR_COUNCIL' | 'BAR_ASSOCIATION' | 'LEGAL_FIRM' | 'INDIVIDUAL_ADVOCATE';

export interface TenantOrganization {
  id: string;
  name: string;
  hindiName?: string;
  shortName: string;
  type: TenantType;
  district: string;
  state: string;
  estdYear?: string;
  barCouncilAffiliation?: string;
  
  // Administrator Contact
  adminName: string;
  adminEmail: string;
  adminMobile: string;
  
  // License & Subscription
  licenseKey: string;
  plan: TenantPlan;
  status: TenantStatus;
  issuedAt: string;     // DD/MM/YYYY
  validTill: string;    // DD/MM/YYYY
  maxAdvocatesQuota: number;
  
  // Enabled Modules
  enabledModules: FeatureModuleKey[];
  
  // Branding & Configuration
  logoUrl?: string;
  presidentName?: string;
  generalSecretaryName?: string;
  treasurerName?: string;
  officialAddress?: string;
  customNotes?: string;
  createdAt: string;
}

export interface SoftwareLicense {
  id: string;
  licenseKey: string;
  tenantId: string;
  organizationName: string;
  type: TenantType;
  plan: TenantPlan;
  status: TenantStatus;
  issuedAt: string;
  validTill: string;
  maxUsers: number;
  enabledModules: FeatureModuleKey[];
  featuresCount: number;
  qrVerificationCode: string;
  issuedBy: string;
  notes?: string;
}

export interface PlatformGlobalSettings {
  platformName: string;
  platformTagline: string;
  superAdminEmail: string;
  supportPhone: string;
  supportEmail: string;
  allowSelfRegistration: boolean;
  maintenanceMode: boolean;
  defaultTrialDays: number;
  globalModuleDefaults: Record<FeatureModuleKey, boolean>;
  appManifestConfig?: {
    name: string;
    shortName: string;
    description: string;
    themeColor: string;
    backgroundColor: string;
    display: 'standalone' | 'fullscreen' | 'minimal-ui';
    orientation: 'portrait-primary' | 'any';
  };
  appIconPreset?: string;
  customLogoData?: string;
}

export interface TenantDropdownConfig {
  tenantId: string;
  tehsils: string[];
  policeStations: string[];
  courts: CourtMaster[];
  caseStages: CaseStageMaster[];
  updatedAt?: string;
}

export interface PlatformPricingConfig {
  advocateBasicPrice: number;
  advocateProMonthly: number;
  advocateProYearly: number;
  enforceAdvocateProPaywall: boolean;
  lawFirmMonthly: number;
  lawFirmYearly: number;
  lawFirmMaxJuniors: number;
  tahsilBarStandardYearly: number;
  tahsilBarPlusYearly: number;
  districtBarYearly: number;
  districtBarPerAdvocateFee: number;
  stateBarYearly: number;
  tahsilElectionFee: number;
  districtElectionFee: number;
  pvcCardChargePerCard: number;
  pvcCardMakingCost: number;
  updatedAt?: string;
}

export interface SaaSBillingOrder {
  id: string;
  organizationName: string;
  category: 'ADVOCATE_PRO' | 'LAW_FIRM' | 'TAHSIL_BAR' | 'DISTRICT_BAR' | 'STATE_BAR' | 'ELECTION_PACKAGE' | 'PVC_ID_CARDS';
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  estimatedProfit: number;
  status: 'PAID' | 'PENDING';
  date: string;
  notes?: string;
}



