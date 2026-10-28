import {
  Advocate,
  Client,
  Earning,
  Expense,
  FinanceCategory,
  ElectionPost,
  ElectionCandidate,
  Election,
  Nomination,
  Vote,
  StateBarElectionPost,
  StateBarElectionCandidate,
  StateBarVote,
  StateBarVoterEligibility,
  StateBarElectionConfig,
  DistrictBarElectionConfig,
  ALL_UP_DISTRICTS,
  CauseListItem,
  ELibraryItem,
  CommitteeMember,
  Project,
  GalleryItem,
  NotificationItem,
  ChatMessage,
  JuniorSeniorPost,
  AdvocateReview,
  EmergencyRequest,
  AppSettings,
  CourtMaster,
  CaseStageMaster,
  TenantOrganization,
  SoftwareLicense,
  PlatformGlobalSettings,
  FeatureModuleKey,
  TenantDropdownConfig,
  PlatformPricingConfig,
  SaaSBillingOrder,
  TAHSILS_BALLIA,
  POLICE_STATIONS_BALLIA
} from '../types';
import {
  DEFAULT_TENANTS,
  DEFAULT_PLATFORM_SETTINGS,
  generateCryptoLicenseKey
} from './modulesConfig';
import { doc, onSnapshot, setDoc, getDocFromServer } from 'firebase/firestore';
import { firestoreDb, auth } from './firebase';
import firebaseConfig from '../../firebase-applet-config.json';

const FIRESTORE_API_KEY = firebaseConfig.apiKey || 'AIzaSyCF6iHdbCygnQDxzhrQWhEqd9kDx2DQtjQ';
const FIRESTORE_PROJECT = firebaseConfig.projectId || 'gen-lang-client-0118328707';
const FIRESTORE_DB = firebaseConfig.firestoreDatabaseId || 'ai-studio-barassociationba-b253281c-6ea1-4dcf-81b2-fa0bab8786df';
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT}/databases/${FIRESTORE_DB}/documents`;

const STORAGE_KEYS = {
  ADVOCATES: '_sys_vault_v2_advocates',
  CURRENT_USER: '_sys_vault_v2_usr_sess',
  CLIENTS: '_sys_vault_v2_clients',
  EARNINGS: '_sys_vault_v2_earnings',
  EXPENSES: '_sys_vault_v2_expenses',
  FINANCE_CATEGORIES: '_sys_vault_v2_fin_cats',
  ELECTION_POSTS: '_sys_vault_v2_elec_posts',
  ELECTION_CANDIDATES: '_sys_vault_v2_elec_cands',
  ELECTIONS: '_sys_vault_v2_elecs',
  NOMINATIONS: '_sys_vault_v2_noms',
  VOTES: '_sys_vault_v2_votes',
  STATE_BAR_POSTS: '_sys_vault_v2_sb_posts',
  STATE_BAR_CANDIDATES: '_sys_vault_v2_sb_cands',
  STATE_BAR_VOTES: '_sys_vault_v2_sb_votes',
  STATE_BAR_CONFIG: '_sys_vault_v2_sb_cfg',
  STATE_BAR_VOTER_ROLL: '_sys_vault_v2_sb_voters',
  CAUSE_LIST: '_sys_vault_v2_causelist',
  E_LIBRARY: '_sys_vault_v2_elibrary',
  COMMITTEE: '_sys_vault_v2_committee',
  PROJECTS: '_sys_vault_v2_projects',
  GALLERY: '_sys_vault_v2_gallery',
  NOTIFICATIONS: '_sys_vault_v2_notifications',
  CHATS: '_sys_vault_v2_chats',
  JUNIOR_SENIOR: '_sys_vault_v2_jr_sr',
  REVIEWS: '_sys_vault_v2_reviews',
  EMERGENCY: '_sys_vault_v2_emergency',
  SETTINGS: '_sys_vault_v2_settings',
  COURT_MASTERS: '_sys_vault_v2_courts',
  CASE_STAGE_MASTERS: '_sys_vault_v2_case_stages',
  TENANTS: '_sys_vault_v2_tenants',
  CURRENT_TENANT_ID: '_sys_vault_v2_cur_tenant_id',
  PLATFORM_SETTINGS: '_sys_vault_v2_plt_settings',
  SOFTWARE_LICENSES: '_sys_vault_v2_lics',
  TENANT_DROPDOWN_CONFIGS: '_sys_vault_v2_dropdown_cfgs',
  DISTRICT_BAR_CONFIG: '_sys_vault_v2_dist_bar_cfg',
  PRICING_CONFIG: '_sys_vault_v2_pricing_cfg',
  SAAS_BILLING_ORDERS: '_sys_vault_v2_billing_ords'
};

const LEGACY_STORAGE_MAP: Record<string, string> = {
  '_sys_vault_v2_advocates': 'crba_advocates',
  '_sys_vault_v2_usr_sess': 'crba_current_user',
  '_sys_vault_v2_clients': 'crba_clients',
  '_sys_vault_v2_earnings': 'crba_earnings',
  '_sys_vault_v2_expenses': 'crba_expenses',
  '_sys_vault_v2_fin_cats': 'crba_finance_categories',
  '_sys_vault_v2_elec_posts': 'crba_election_posts',
  '_sys_vault_v2_elec_cands': 'crba_election_candidates',
  '_sys_vault_v2_elecs': 'crba_elections',
  '_sys_vault_v2_noms': 'crba_nominations',
  '_sys_vault_v2_votes': 'crba_votes',
  '_sys_vault_v2_sb_posts': 'crba_state_bar_posts',
  '_sys_vault_v2_sb_cands': 'crba_state_bar_candidates',
  '_sys_vault_v2_sb_votes': 'crba_state_bar_votes',
  '_sys_vault_v2_sb_cfg': 'crba_state_bar_config',
  '_sys_vault_v2_sb_voters': 'crba_state_bar_voter_roll',
  '_sys_vault_v2_causelist': 'crba_cause_list',
  '_sys_vault_v2_elibrary': 'crba_e_library',
  '_sys_vault_v2_committee': 'crba_committee',
  '_sys_vault_v2_projects': 'crba_projects',
  '_sys_vault_v2_gallery': 'crba_gallery',
  '_sys_vault_v2_notifications': 'crba_notifications',
  '_sys_vault_v2_chats': 'crba_chats',
  '_sys_vault_v2_jr_sr': 'crba_junior_senior',
  '_sys_vault_v2_reviews': 'crba_reviews',
  '_sys_vault_v2_emergency': 'crba_emergency',
  '_sys_vault_v2_settings': 'crba_settings',
  '_sys_vault_v2_courts': 'crba_court_masters',
  '_sys_vault_v2_case_stages': 'crba_case_stage_masters',
  '_sys_vault_v2_tenants': 'crba_tenants',
  '_sys_vault_v2_cur_tenant_id': 'crba_current_tenant_id',
  '_sys_vault_v2_plt_settings': 'crba_platform_settings',
  '_sys_vault_v2_lics': 'crba_software_licenses',
  '_sys_vault_v2_dropdown_cfgs': 'crba_tenant_dropdown_configs',
  '_sys_vault_v2_dist_bar_cfg': 'crba_district_bar_election_config',
  '_sys_vault_v2_pricing_cfg': 'crba_pricing_config',
  '_sys_vault_v2_billing_ords': 'crba_saas_billing_orders'
};

const DEFAULT_PRICING_CONFIG: PlatformPricingConfig = {
  advocateBasicPrice: 0,
  advocateProMonthly: 99,
  advocateProYearly: 999,
  enforceAdvocateProPaywall: false,
  lawFirmMonthly: 499,
  lawFirmYearly: 4999,
  lawFirmMaxJuniors: 15,
  tahsilBarStandardYearly: 9999,
  tahsilBarPlusYearly: 14999,
  districtBarYearly: 25000,
  districtBarPerAdvocateFee: 25,
  stateBarYearly: 250000,
  tahsilElectionFee: 11000,
  districtElectionFee: 25000,
  pvcCardChargePerCard: 50,
  pvcCardMakingCost: 15,
  updatedAt: new Date().toLocaleDateString('en-GB')
};

const DEFAULT_BILLING_ORDERS: SaaSBillingOrder[] = [
  {
    id: 'ord_pvc_01',
    organizationName: 'Criminal & Revenue Bar Association, Ballia',
    category: 'PVC_ID_CARDS',
    quantity: 500,
    unitPrice: 50,
    totalAmount: 25000,
    estimatedProfit: 17500,
    status: 'PAID',
    date: '01/10/2026',
    notes: '500 QR Smart PVC ID Cards Printed (@ ₹50/card, Cost ₹15/card)'
  },
  {
    id: 'ord_elec_01',
    organizationName: 'Criminal & Revenue Bar Association, Ballia',
    category: 'ELECTION_PACKAGE',
    quantity: 1,
    unitPrice: 25000,
    totalAmount: 25000,
    estimatedProfit: 22000,
    status: 'PAID',
    date: '02/10/2026',
    notes: 'Annual District Bar Digital e-Voting & Voter Verification Package'
  },
  {
    id: 'ord_bar_01',
    organizationName: 'Tahsil Bar Association, Rasra',
    category: 'TAHSIL_BAR',
    quantity: 1,
    unitPrice: 9999,
    totalAmount: 9999,
    estimatedProfit: 9500,
    status: 'PAID',
    date: '03/10/2026',
    notes: 'Annual Tahsil Bar SaaS Portal License'
  }
];

// Default Initial Seed Data
const DEFAULT_SETTINGS: AppSettings = {
  aboutUs: `Criminal & Revenue Bar Association, Ballia (उत्तर प्रदेश) is an esteemed judicial body established in 1950, representing learned advocates and legal jurists practicing in the District & Sessions Court, Revenue Courts (Collectorate, SDM, Tehsildar Courts), and Special Judicial Magistrate Courts in Ballia. Our mission is upholding rule of law, protecting democratic advocacy rights, providing free legal aid to underprivileged litigants, and fostering high legal scholarship.`,
  logoUrl: '/icon.svg',
  contactPhone: '9415988800',
  contactEmail: 'contact@barballia.com',
  contactAddress: 'District Court Campus, Bahadurpur, Ballia, Uttar Pradesh - 277001',
  website: 'sahayogifoundation.in',
  showEarningOnHome: true,
  annualMembershipFee: 1200
};

const DEFAULT_ADVOCATES: Advocate[] = [
  {
    id: 'adv_super_001',
    name: 'Nyaay Sahayogi Platform Super Admin',
    fatherName: 'Platform Owner & Architect',
    dob: '01/01/1980',
    age: 46,
    address: {
      village: 'Master Tech Center',
      post: 'Legal Tech Hub',
      tahsil: 'Headquarters',
      policeStation: 'Admin Central',
      district: 'Ballia / Lucknow',
      state: 'Uttar Pradesh',
      pincode: '226001'
    },
    barNo: 'SUPER/001/2020',
    copNo: 'COP/MASTER/001',
    mobile: '9415988800',
    email: 'nyaaysahayogi@gmail.com',
    password: 'SuperAdmin@123',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    status: 'APPROVED',
    role: 'super_admin',
    tenantId: 'tenant_ballia_01',
    validTill: '31/12/2099',
    createdAt: '01/01/2020',
    rating: 5.0,
    reviewCount: 99,
    specialization: ['CRIMINAL', 'REVENUE', 'CIVIL'],
    isTopCriminalLawyer: true,
    chamberNo: 'Master Platform Control Room',
    experienceYears: 20,
    bio: 'Platform Owner & Master Administrator. Full authority over module toggles, tenant provisioning, software license keys, and platform security.'
  },
  {
    id: 'adv_state_admin_001',
    name: 'State Bar Council Returning Officer / Admin',
    fatherName: 'Bar Council of Uttar Pradesh',
    dob: '15/08/1970',
    age: 56,
    address: {
      village: 'High Court Campus',
      post: 'State Bar Bhawan',
      tahsil: 'Prayagraj / Lucknow',
      policeStation: 'Civil Lines',
      district: 'Prayagraj / Lucknow',
      state: 'Uttar Pradesh',
      pincode: '211001'
    },
    barNo: 'UP/STATE-BAR/001',
    copNo: 'COP/UP/STATE/9999',
    mobile: '9415988800',
    email: 'stateadmin@upbarcouncil.org',
    password: 'StateAdmin@123',
    photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80',
    status: 'APPROVED',
    role: 'state_bar_admin',
    tenantId: 'tenant_ballia_01',
    validTill: '31/12/2099',
    createdAt: '01/01/2024',
    rating: 5.0,
    reviewCount: 150,
    specialization: ['CRIMINAL', 'REVENUE', 'CIVIL'],
    isTopCriminalLawyer: true,
    chamberNo: 'State Bar Council Secretariat, Room 101',
    experienceYears: 30,
    bio: 'Chief Returning Officer & State Bar Council Administrator for Uttar Pradesh. Full authority to turn ON/OFF State Bar General Elections across 75 districts, manage candidates, and oversee 75 districts voter rolls.'
  },
  {
    id: 'adv_admin_001',
    name: 'Shri O. P. Singh',
    fatherName: 'Late Ramadhar Singh',
    dob: '15/07/1965',
    age: 61,
    address: {
      village: 'Bahadurpur',
      post: 'Ballia City',
      tahsil: 'Ballia Sadar',
      policeStation: 'Kotwali Ballia',
      district: 'Ballia',
      state: 'Uttar Pradesh',
      pincode: '277001'
    },
    barNo: '1084/1990',
    copNo: 'COP/UP/1990/8842',
    mobile: '9415988800',
    email: 'admin@barballia.com',
    password: 'Admin@123',
    photoUrl: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&auto=format&fit=crop&q=80',
    certificateUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    status: 'APPROVED',
    role: 'bar_admin',
    tenantId: 'tenant_ballia_01',
    validTill: '31/12/2026',
    createdAt: '10/01/2024',
    rating: 4.9,
    reviewCount: 38,
    specialization: ['CRIMINAL', 'REVENUE', 'CIVIL'],
    isTopCriminalLawyer: true,
    chamberNo: 'Chamber 12, Senior Bar Block',
    experienceYears: 34,
    bio: 'Senior Advocate & President. Renowned Criminal Trial Counsel & UP Revenue Code Land Dispute authority with 300+ murder trials and land litigation victories.'
  },
  {
    id: 'adv_002',
    name: 'Adv. Rakesh Kumar Pandey',
    fatherName: 'Shri B. N. Pandey',
    dob: '22/03/1975',
    age: 51,
    address: {
      village: 'Hasanpur',
      post: 'Bansdih',
      tahsil: 'Bansdih',
      policeStation: 'Bansdih Road',
      district: 'Ballia',
      state: 'Uttar Pradesh',
      pincode: '277202'
    },
    barNo: '2415/2001',
    copNo: 'COP/UP/2001/1429',
    mobile: '9839123456',
    email: 'rakesh.pandey@barballia.com',
    password: 'Password@123',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    certificateUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    status: 'APPROVED',
    role: 'advocate',
    validTill: '31/12/2026',
    createdAt: '15/02/2024',
    rating: 4.8,
    reviewCount: 29,
    specialization: ['CRIMINAL', 'MATRIMONIAL'],
    isTopCriminalLawyer: true,
    chamberNo: 'Chamber 28, Criminal Court Annex',
    experienceYears: 24,
    bio: 'General Secretary. Expert in Sessions Court Bails, NDPS, Gangster Act, and IPC 302 Trials.'
  },
  {
    id: 'adv_003',
    name: 'Adv. Smt. Vandana Tiwari',
    fatherName: 'Shri Kedar Nath Tiwari',
    dob: '10/11/1982',
    age: 44,
    address: {
      village: 'Chitbaragaon',
      post: 'Chitbaragaon',
      tahsil: 'Ballia Sadar',
      policeStation: 'Phephna',
      district: 'Ballia',
      state: 'Uttar Pradesh',
      pincode: '277501'
    },
    barNo: '5620/2007',
    copNo: 'COP/UP/2007/3941',
    mobile: '9450876543',
    email: 'vandana.tiwari@barballia.com',
    password: 'Password@123',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    certificateUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    status: 'APPROVED',
    role: 'advocate',
    validTill: '31/12/2026',
    createdAt: '01/03/2024',
    rating: 4.95,
    reviewCount: 42,
    specialization: ['MATRIMONIAL', 'CIVIL', 'CRIMINAL'],
    isTopCriminalLawyer: true,
    chamberNo: 'Chamber 07, Family Court Corridor',
    experienceYears: 18,
    bio: 'Pioneering Matrimonial & Women Rights Advocate. Family Court specialist, Maintenance 125 CrPC, Domestic Violence Act.'
  },
  {
    id: 'adv_004',
    name: 'Adv. Manoj Kumar Yadav',
    fatherName: 'Shri Ramdev Yadav',
    dob: '05/08/1988',
    age: 38,
    address: {
      village: 'Rasra',
      post: 'Rasra Town',
      tahsil: 'Rasra',
      policeStation: 'Rasra Kotwali',
      district: 'Ballia',
      state: 'Uttar Pradesh',
      pincode: '277123'
    },
    barNo: '8834/2012',
    copNo: 'COP/UP/2012/7711',
    mobile: '9838012345',
    email: 'manoj.yadav@barballia.com',
    password: 'Password@123',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    certificateUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    status: 'APPROVED',
    role: 'advocate',
    validTill: '31/12/2026',
    createdAt: '20/04/2024',
    rating: 4.7,
    reviewCount: 22,
    specialization: ['REVENUE', 'MVACT', 'CIVIL'],
    isTopCriminalLawyer: false,
    chamberNo: 'Chamber 44, Revenue Bar Complex',
    experienceYears: 13,
    bio: 'Revenue Board & SDM Court Land litigation lawyer, UP Revenue Code Sec 34, 116 partition suits & MACT claim cases.'
  },
  {
    id: 'adv_005',
    name: 'Adv. Amit Kumar Verma',
    fatherName: 'Shri Satish Chandra Verma',
    dob: '18/09/1993',
    age: 33,
    address: {
      village: 'Bairia',
      post: 'Bairia',
      tahsil: 'Bairia',
      policeStation: 'Bairia',
      district: 'Ballia',
      state: 'Uttar Pradesh',
      pincode: '277201'
    },
    barNo: '11204/2018',
    copNo: 'COP/UP/2018/9011',
    mobile: '9140123456',
    email: 'amit.verma@barballia.com',
    password: 'Password@123',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    certificateUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    status: 'APPROVED',
    role: 'advocate',
    validTill: '31/12/2026',
    createdAt: '12/05/2024',
    rating: 4.65,
    reviewCount: 17,
    specialization: ['CRIMINAL', 'JUVENILE'],
    isTopCriminalLawyer: true,
    chamberNo: 'Chamber 19, Youth Bar Block',
    experienceYears: 7,
    bio: 'Criminal Defense Counsel, Juvenile Justice Board matters, Bail applications in High Court & District Courts.'
  },
  {
    id: 'adv_006_pending',
    name: 'Adv. Priya Mishra',
    fatherName: 'Shri Daya Shankar Mishra',
    dob: '04/02/1997',
    age: 29,
    address: {
      village: 'Sikanderpur',
      post: 'Sikanderpur',
      tahsil: 'Sikanderpur',
      policeStation: 'Sikanderpur',
      district: 'Ballia',
      state: 'Uttar Pradesh',
      pincode: '277303'
    },
    barNo: '14309/2022',
    copNo: 'COP/UP/2022/6721',
    mobile: '9792998877',
    email: 'priya.mishra@barballia.com',
    password: 'Password@123',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
    certificateUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    status: 'PENDING',
    role: 'advocate',
    validTill: '31/12/2025',
    createdAt: '01/09/2026',
    rating: 5.0,
    reviewCount: 3,
    specialization: ['CIVIL', 'REVENUE'],
    chamberNo: 'Chamber 51',
    experienceYears: 3,
    bio: 'Freshly registered legal practitioner specializing in Civil injunctions and Tahsil court proceedings.'
  }
];

const DEFAULT_CLIENTS: Client[] = [
  {
    id: 'cl_001',
    advocateId: 'adv_admin_001',
    advocateName: 'Shri O. P. Singh',
    advocateBarNo: '1084/1990',
    clientName: 'Dharmendra Kumar Rai',
    clientFatherName: 'Shri Kedar Rai',
    clientMobile: '9839443322',
    isMobileVerified: true,
    address: {
      village: 'Mahuawa',
      post: 'Bansdih',
      tahsil: 'Bansdih',
      policeStation: 'Bansdih',
      district: 'Ballia',
      state: 'Uttar Pradesh',
      pincode: '277202'
    },
    caseTitle: 'State of UP vs Dharmendra Kumar Rai & Ors.',
    caseNameVsName: 'State of UP vs Dharmendra Kumar Rai & Ors.',
    caseNature: 'CRIMINAL',
    caseNo: 'Sessions Case No. 412/2024',
    courtName: 'Court of Sessions Judge, Ballia',
    previousDate: '15/08/2026',
    nextHearingDate: '12/09/2026', // within 2 days!
    caseStage: 'Prosecution Evidence (P.W.-2 Cross-examination under Sec 302 IPC)',
    totalFees: 45000,
    feesReceived: 30000,
    feesPending: 15000,
    status: 'Open',
    createdAt: '12/03/2024',
    notes: 'Urgent: Cross-examination of Investigation Officer scheduled.'
  },
  {
    id: 'cl_002',
    advocateId: 'adv_admin_001',
    advocateName: 'Shri O. P. Singh',
    advocateBarNo: '1084/1990',
    clientName: 'Ram Sevak Gond',
    clientFatherName: 'Late Chhathu Gond',
    clientMobile: '9450332211',
    isMobileVerified: true,
    address: {
      village: 'Dubahar',
      post: 'Dubahar',
      tahsil: 'Ballia Sadar',
      policeStation: 'Dubahar',
      district: 'Ballia',
      state: 'Uttar Pradesh',
      pincode: '277401'
    },
    caseTitle: 'Ram Sevak Gond vs Shiv Mangal Rai & Ors.',
    caseNameVsName: 'Ram Sevak Gond vs Shiv Mangal Rai & Ors.',
    caseNature: 'REVENUE',
    caseNo: 'Revenue Suit No. 89/2025 (Sec 116 UP Revenue Code)',
    courtName: 'Court of Sub-Divisional Magistrate (SDM), Ballia Sadar',
    previousDate: '01/08/2026',
    nextHearingDate: '10/09/2026', // Today's Hearing!
    caseStage: 'Final Argument on Preliminary Decree (Partition of Agricultural Land)',
    totalFees: 25000,
    feesReceived: 20000,
    feesPending: 5000,
    status: 'Open',
    createdAt: '05/01/2025',
    notes: 'Bring Revenue Map (Nazri Naksha) and 1359 Fasli Khasra.'
  },
  {
    id: 'cl_003',
    advocateId: 'adv_admin_001',
    advocateName: 'Shri O. P. Singh',
    advocateBarNo: '1084/1990',
    clientName: 'Smt. Shanti Devi',
    clientFatherName: 'W/o Late Munna Lal',
    clientMobile: '9935123890',
    isMobileVerified: false,
    address: {
      village: 'Hanuman Ganj',
      post: 'Ballia',
      tahsil: 'Ballia Sadar',
      policeStation: 'Kotwali',
      district: 'Ballia',
      state: 'Uttar Pradesh',
      pincode: '277001'
    },
    caseTitle: 'Smt. Shanti Devi vs Radhe Shyam & Anr.',
    caseNameVsName: 'Smt. Shanti Devi vs Radhe Shyam & Anr.',
    caseNature: 'CIVIL',
    caseNo: 'Original Suit No. 204/2023',
    courtName: 'Court of Civil Judge (Senior Division), Ballia',
    previousDate: '10/07/2026',
    nextHearingDate: '15/09/2026',
    caseStage: 'Hearing on Order 39 Rule 1 & 2 CPC Temporary Injunction Application',
    totalFees: 35000,
    feesReceived: 35000,
    feesPending: 0,
    status: 'Open',
    createdAt: '22/08/2023',
    notes: 'Certified copy of registered sale deed filed in court.'
  },
  {
    id: 'cl_004',
    advocateId: 'adv_002',
    advocateName: 'Adv. Rakesh Kumar Pandey',
    advocateBarNo: '2415/2001',
    clientName: 'Virendra Pratap Singh',
    clientFatherName: 'Shri Shiv Shankar Singh',
    clientMobile: '9838776655',
    isMobileVerified: true,
    address: {
      village: 'Bansdih Road',
      post: 'Bansdih Road',
      tahsil: 'Bansdih',
      policeStation: 'Bansdih Road',
      district: 'Ballia',
      state: 'Uttar Pradesh',
      pincode: '277203'
    },
    caseTitle: 'Virendra Pratap Singh vs State of UP',
    caseNameVsName: 'Virendra Pratap Singh vs State of UP',
    caseNature: 'CRIMINAL',
    caseNo: 'Bail Application No. 1192/2026',
    courtName: 'Court of Special Judge (SC/ST Act / Gangster), Ballia',
    previousDate: '28/08/2026',
    nextHearingDate: '11/09/2026', // Tomorrow!
    caseStage: 'Hearing on Regular Bail under Section 439 CrPC',
    totalFees: 30000,
    feesReceived: 18000,
    feesPending: 12000,
    status: 'Open',
    createdAt: '25/07/2026',
    notes: 'Case Diary has been received by Government Advocate.'
  },
  {
    id: 'cl_005',
    advocateId: 'adv_003',
    advocateName: 'Adv. Smt. Vandana Tiwari',
    advocateBarNo: '5620/2007',
    clientName: 'Smt. Kavita Sharma',
    clientFatherName: 'D/o Shri Rameshwar Sharma',
    clientMobile: '9451998877',
    isMobileVerified: true,
    address: {
      village: 'Chitbaragaon',
      post: 'Chitbaragaon',
      tahsil: 'Ballia Sadar',
      policeStation: 'Phephna',
      district: 'Ballia',
      state: 'Uttar Pradesh',
      pincode: '277501'
    },
    caseTitle: 'Smt. Kavita Sharma vs Ramesh Sharma',
    caseNameVsName: 'Smt. Kavita Sharma vs Ramesh Sharma',
    caseNature: 'MATRIMONIAL',
    caseNo: 'Maintenance Case No. 88/2024',
    courtName: 'Principal Judge, Family Court, Ballia',
    previousDate: '02/08/2026',
    nextHearingDate: '18/09/2026',
    caseStage: 'Interim Maintenance Argument under Section 125 CrPC',
    totalFees: 20000,
    feesReceived: 15000,
    feesPending: 5000,
    status: 'Open',
    createdAt: '10/02/2024'
  },
  {
    id: 'cl_006',
    advocateId: 'adv_004',
    advocateName: 'Adv. Manoj Kumar Yadav',
    advocateBarNo: '8834/2012',
    clientName: 'Surendra Nath Gupta',
    clientFatherName: 'Late Moti Chand Gupta',
    clientMobile: '9125667788',
    isMobileVerified: true,
    address: {
      village: 'Rasra Bazar',
      post: 'Rasra',
      tahsil: 'Rasra',
      policeStation: 'Rasra',
      district: 'Ballia',
      state: 'Uttar Pradesh',
      pincode: '277123'
    },
    caseTitle: 'Surendra Nath Gupta vs National Insurance Co. Ltd. & Anr.',
    caseNameVsName: 'Surendra Nath Gupta vs National Insurance Co. Ltd. & Anr.',
    caseNature: 'MVACT',
    caseNo: 'MACP Claim Case No. 45/2023',
    courtName: 'Motor Accident Claims Tribunal / ADJ-1, Ballia',
    previousDate: '20/07/2026',
    nextHearingDate: '22/09/2026',
    caseStage: 'Insurance Company Witness Cross-Examination',
    totalFees: 40000,
    feesReceived: 25000,
    feesPending: 15000,
    status: 'Open',
    createdAt: '14/09/2023'
  }
];

const DEFAULT_EARNINGS: Earning[] = [
  {
    id: 'earn_001',
    date: '10/09/2026',
    advocateId: 'adv_002',
    advocateName: 'Adv. Rakesh Kumar Pandey',
    barNo: '2415/2001',
    amount: 1200,
    purpose: 'Membership',
    mode: 'Razorpay',
    txnId: 'pay_RZP_991823901',
    notes: 'Annual Bar Association Membership Renewal 2026-2027',
    createdAt: '10/09/2026'
  },
  {
    id: 'earn_002',
    date: '10/09/2026',
    advocateId: 'adv_003',
    advocateName: 'Adv. Smt. Vandana Tiwari',
    barNo: '5620/2007',
    amount: 1200,
    purpose: 'Membership',
    mode: 'UPI',
    txnId: 'UPI_9823746198',
    notes: 'Annual Membership 2026-2027',
    createdAt: '10/09/2026'
  },
  {
    id: 'earn_003',
    date: '08/09/2026',
    advocateId: 'adv_004',
    advocateName: 'Adv. Manoj Kumar Yadav',
    barNo: '8834/2012',
    amount: 1200,
    purpose: 'Membership',
    mode: 'Online',
    txnId: 'TXN_BALLIA_8819',
    notes: 'Membership Renewal + Digital ID verification',
    createdAt: '08/09/2026'
  },
  {
    id: 'earn_004',
    date: '05/09/2026',
    advocateId: 'adv_admin_001',
    advocateName: 'Shri O. P. Singh',
    barNo: '1084/1990',
    amount: 5000,
    purpose: 'Donation',
    mode: 'Cash',
    txnId: 'CASH_REC_094',
    notes: 'Library Digital Computer fund contribution',
    createdAt: '05/09/2026'
  },
  {
    id: 'earn_005',
    date: '02/09/2026',
    advocateId: 'adv_005',
    advocateName: 'Adv. Amit Kumar Verma',
    barNo: '11204/2018',
    amount: 1200,
    purpose: 'Membership',
    mode: 'Razorpay',
    txnId: 'pay_RZP_77192834',
    notes: 'Annual Bar Subscription',
    createdAt: '02/09/2026'
  }
];

const DEFAULT_EXPENSES: Expense[] = [
  {
    id: 'exp_001',
    date: '09/09/2026',
    amount: 2400,
    purposeTitle: 'Bar Library High-Speed Wi-Fi & Law Journal Portal Subscription',
    category: 'Office',
    mode: 'UPI',
    billPhotoUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    createdAt: '09/09/2026'
  },
  {
    id: 'exp_002',
    date: '06/09/2026',
    amount: 4500,
    purposeTitle: 'Air Conditioning Maintenance in Advocate Common Room & Bar Hall',
    category: 'Maintenance',
    mode: 'Cash',
    billPhotoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
    createdAt: '06/09/2026'
  },
  {
    id: 'exp_003',
    date: '01/09/2026',
    amount: 3200,
    purposeTitle: 'Legal Aid Awareness Seminar & Stationery printing',
    category: 'Event',
    mode: 'Online',
    billPhotoUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80',
    createdAt: '01/09/2026'
  }
];

const DEFAULT_ELECTIONS: Election[] = [
  {
    id: 'elec_2026',
    title: 'Annual Executive Committee Election 2026-2027',
    startDate: '01/10/2026',
    endDate: '05/10/2026',
    nominationStart: '15/09/2026',
    nominationEnd: '25/09/2026',
    status: 'VotingOpen',
    showResultPublic: true,
    posts: [
      'President (अध्यक्ष)',
      'Senior Vice President (वरिष्ठ उपाध्यक्ष)',
      'General Secretary (महामंत्री)',
      'Joint Secretary (संयुक्त मंत्री)',
      'Treasurer (कोषाध्यक्ष)',
      'Auditor (आय-व्यय निरीक्षक)'
    ]
  }
];

const DEFAULT_NOMINATIONS: Nomination[] = [
  {
    id: 'nom_001',
    electionId: 'elec_2026',
    advocateId: 'adv_admin_001',
    name: 'Shri O. P. Singh',
    photo: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&auto=format&fit=crop&q=80',
    barNo: '1084/1990',
    post: 'President (अध्यक्ष)',
    manifesto: 'Modern Advocate Chambers with solar power, Digital Cause List LED screens on every floor, Enhanced Advocate Welfare & Medical Corpus Fund of Rs 25 Lakhs.',
    symbol: 'Scales of Justice (तराजू)',
    status: 'APPROVED'
  },
  {
    id: 'nom_002',
    electionId: 'elec_2026',
    advocateId: 'adv_004',
    name: 'Adv. Manoj Kumar Yadav',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    barNo: '8834/2012',
    post: 'President (अध्यक्ष)',
    manifesto: 'Youth Advocate stipend program, Free Supreme Court Online database access for all members, Transparent revenue court registry.',
    symbol: 'Pen & Book (कलम और किताब)',
    status: 'APPROVED'
  },
  {
    id: 'nom_003',
    electionId: 'elec_2026',
    advocateId: 'adv_002',
    name: 'Adv. Rakesh Kumar Pandey',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    barNo: '2415/2001',
    post: 'General Secretary (महामंत्री)',
    manifesto: 'Strict defense of advocate dignity in police stations, 24/7 advocate grievance cell, Fast-track mutual fund assistance.',
    symbol: 'Torch of Liberty (मशाल)',
    status: 'APPROVED'
  },
  {
    id: 'nom_004',
    electionId: 'elec_2026',
    advocateId: 'adv_005',
    name: 'Adv. Amit Kumar Verma',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    barNo: '11204/2018',
    post: 'General Secretary (महामंत्री)',
    manifesto: 'Sports and annual legal conference in Ballia, digital e-filing guidance cell for all junior advocates.',
    symbol: 'Rising Sun (उगता सूरज)',
    status: 'APPROVED'
  }
];

const DEFAULT_VOTES: Vote[] = [
  {
    id: 'v_001',
    electionId: 'elec_2026',
    voterId: 'adv_003',
    voterBarNo: '5620/2007',
    post: 'President (अध्यक्ष)',
    candidateId: 'nom_001',
    candidateName: 'Shri O. P. Singh',
    timestamp: '10/09/2026 09:30:00'
  },
  {
    id: 'v_002',
    electionId: 'elec_2026',
    voterId: 'adv_003',
    voterBarNo: '5620/2007',
    post: 'General Secretary (महामंत्री)',
    candidateId: 'nom_003',
    candidateName: 'Adv. Rakesh Kumar Pandey',
    timestamp: '10/09/2026 09:30:15'
  }
];

const DEFAULT_CAUSE_LIST: CauseListItem[] = [
  {
    id: 'cl_item_01',
    caseNo: 'ST No. 340/2023',
    courtNo: 'Court No. 1',
    courtName: 'District & Sessions Judge Court, Ballia',
    judgeName: 'Hon. District & Sessions Judge',
    date: '10/09/2026',
    partyDetails: 'State of U.P. vs. Rajeshwar Singh & Ors.',
    petitionerAdvocate: 'D.G.C. (Criminal)',
    respondentAdvocate: 'Adv. O. P. Singh (Bar No: 1084/1990)',
    stage: 'Final Hearing on Bail & Charge framing',
    caseNature: 'CRIMINAL'
  },
  {
    id: 'cl_item_02',
    caseNo: 'Rev. Appeal 12/2025',
    courtNo: 'Revenue Court 1',
    courtName: 'Court of Collector / District Magistrate, Ballia',
    judgeName: 'Hon. Collector / DM Ballia',
    date: '10/09/2026',
    partyDetails: 'Bhola Nath vs. Gram Sabha Bahadurpur',
    petitionerAdvocate: 'Adv. Manoj Kumar Yadav (Bar No: 8834/2012)',
    respondentAdvocate: 'District Government Counsel (Revenue)',
    stage: 'Arguments under Sec 67 UP Revenue Code (Gram Sabha Encroachment)',
    caseNature: 'REVENUE'
  },
  {
    id: 'cl_item_03',
    caseNo: 'Civil Misc. 55/2024',
    courtNo: 'Court No. 3',
    courtName: 'Civil Judge (Senior Division), Ballia',
    judgeName: 'Hon. Addl. Civil Judge (Sr. Div.)',
    date: '11/09/2026',
    partyDetails: 'Girish Chandra vs. Bank of Baroda Ballia',
    petitionerAdvocate: 'Adv. Smt. Vandana Tiwari (Bar No: 5620/2007)',
    respondentAdvocate: 'Adv. S. K. Upadhyay',
    stage: 'Evidence of Plaintiff',
    caseNature: 'CIVIL'
  },
  {
    id: 'cl_item_04',
    caseNo: 'Bail App 904/2026',
    courtNo: 'Court No. 2',
    courtName: 'Additional Sessions Judge Court-II, Ballia',
    judgeName: 'Hon. Addl. Sessions Judge-II',
    date: '10/09/2026',
    partyDetails: 'State of U.P. vs. Santosh Yadav',
    petitionerAdvocate: 'A.D.G.C. (Criminal)',
    respondentAdvocate: 'Adv. Rakesh Kumar Pandey (Bar No: 2415/2001)',
    stage: 'Bail Hearing (FIR under Section 307/323/504 IPC)',
    caseNature: 'CRIMINAL'
  }
];

const DEFAULT_E_LIBRARY: ELibraryItem[] = [
  {
    id: 'elib_01',
    title: 'The Uttar Pradesh Revenue Code, 2006 (उ०प्र० राजस्व संहिता, 2006)',
    category: 'UP Revenue Code 2006',
    description: 'Complete UP Land Laws Code with Rules 2016, Mutation (Sec 34), Partition (Sec 116), Demarcation (Sec 24), and Gram Sabha land eviction (Sec 67).',
    actYear: '2006 (Amended 2024)',
    size: '4.8 MB',
    pagesCount: 184,
    keySections: 'Sec 24, 30, 31, 34, 35, 67, 80, 116, 134, 144, 209'
  },
  {
    id: 'elib_02',
    title: 'Bharatiya Nyaya Sanhita, 2023 (BNS) & IPC Comparative Table',
    category: 'IPC / BNS',
    description: 'Substantive Criminal Law of India replacing IPC 1860, with side-by-side section comparison table, definitions, punishments & case law index.',
    actYear: '2023',
    size: '6.2 MB',
    pagesCount: 260,
    keySections: 'Sec 103 (Murder), Sec 115 (Hurt), Sec 64 (Rape), Sec 318 (Cheating), Sec 303 (Theft)'
  },
  {
    id: 'elib_03',
    title: 'Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS) & CrPC Reference',
    category: 'CrPC / BNSS',
    description: 'Procedural criminal code with Bail provisions (BNSS Sec 480/483), Remand rules, FIR filing, Zero FIR, Police investigation & trial timelines.',
    actYear: '2023',
    size: '7.1 MB',
    pagesCount: 310,
    keySections: 'Sec 173 (FIR), Sec 187 (Remand), Sec 479 (Undertrial bail), Sec 482, Sec 483 (Anticipatory/Regular Bail)'
  },
  {
    id: 'elib_04',
    title: 'The Code of Civil Procedure, 1908 (CPC) with Allahabad High Court Amendments',
    category: 'CPC',
    description: 'Complete civil litigation procedural manual with Order 39 Injunctions, Order 7 Rule 11 rejection of plaint, Execution of Decrees (Order 21).',
    actYear: '1908',
    size: '8.4 MB',
    pagesCount: 420,
    keySections: 'Sec 9, 10, 11 (Res Judicata), 80, 100, 151; Order 39, Order 6, Order 7, Order 21'
  },
  {
    id: 'elib_05',
    title: 'Bharatiya Sakshya Adhiniyam, 2023 (BSA) & Evidence Act Guidelines',
    category: 'Evidence Act / BSA',
    description: 'Law of Evidence with Electronic records certification, Primary & Secondary evidence, Expert opinion, Confessions, Dying Declaration.',
    actYear: '2023',
    size: '3.9 MB',
    pagesCount: 140,
    keySections: 'Sec 26, 32, 61, 63, 65B, 114, 118, 137'
  }
];

const DEFAULT_COMMITTEE: CommitteeMember[] = [
  {
    id: 'comm_01',
    name: 'Adv. O. P. Singh',
    post: 'President (अध्यक्ष)',
    sessionYear: '2025-2026',
    photo: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&auto=format&fit=crop&q=80',
    barNo: '1084/1990',
    mobile: '9415988800',
    isCurrent: true,
    order: 1
  },
  {
    id: 'comm_02',
    name: 'Adv. Surendra Nath Pandey',
    post: 'Senior Vice President (वरिष्ठ उपाध्यक्ष)',
    sessionYear: '2025-2026',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
    barNo: '1420/1995',
    mobile: '9415234567',
    isCurrent: true,
    order: 2
  },
  {
    id: 'comm_03',
    name: 'Adv. Rakesh Kumar Pandey',
    post: 'General Secretary (महामंत्री)',
    sessionYear: '2025-2026',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    barNo: '2415/2001',
    mobile: '9839123456',
    isCurrent: true,
    order: 3
  },
  {
    id: 'comm_04',
    name: 'Adv. Smt. Vandana Tiwari',
    post: 'Joint Secretary (Administration) (संयुक्त मंत्री प्रशासन)',
    sessionYear: '2025-2026',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    barNo: '5620/2007',
    mobile: '9450876543',
    isCurrent: true,
    order: 4
  },
  {
    id: 'comm_05',
    name: 'Adv. Harishchandra Gupta',
    post: 'Treasurer (कोषाध्यक्ष)',
    sessionYear: '2025-2026',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    barNo: '3109/2003',
    mobile: '9838991122',
    isCurrent: true,
    order: 5
  },
  // Archive Committee 2024-2025
  {
    id: 'comm_06',
    name: 'Adv. Brijesh Kumar Shukla',
    post: 'Former President (पूर्व अध्यक्ष)',
    sessionYear: '2024-2025',
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    barNo: '992/1988',
    mobile: '9415887766',
    isCurrent: false,
    order: 1
  },
  {
    id: 'comm_07',
    name: 'Adv. Arvind Kumar Rai',
    post: 'Former General Secretary (पूर्व महामंत्री)',
    sessionYear: '2024-2025',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    barNo: '1840/1998',
    mobile: '9450112233',
    isCurrent: false,
    order: 2
  }
];

const DEFAULT_FINANCE_CATEGORIES: FinanceCategory[] = [
  { id: 'fcat_inc_01', name: 'Annual Membership Subscription', hindiName: 'वार्षिक सदस्यता शुल्क', type: 'INCOME', description: 'Annual bar dues of ₹1200 per member' },
  { id: 'fcat_inc_02', name: 'New Registration & Admission Fee', hindiName: 'नवीन सदस्यता प्रवेश शुल्क', type: 'INCOME', description: 'One-time admission charge for new advocates' },
  { id: 'fcat_inc_03', name: 'Digital ID Card & Certificate Fee', hindiName: 'डिजिटल परिचय पत्र एवं प्रमाण पत्र', type: 'INCOME', description: 'Smart Bar Identity Card & Certificate reissue' },
  { id: 'fcat_inc_04', name: 'Chamber & Table Allotment', hindiName: 'अधिवक्ता चैम्बर व सीट आवंटन', type: 'INCOME', description: 'Chamber licence and maintenance contribution' },
  { id: 'fcat_inc_05', name: 'Bar Welfare Stamps / Coupons', hindiName: 'बार वेलफेयर टिकट व टोकन', type: 'INCOME', description: 'Bar Association Welfare Stamp sales' },
  { id: 'fcat_inc_06', name: 'Voluntary Donation & Corpus Fund', hindiName: 'स्वेच्छा दान एवं स्थायी कोष', type: 'INCOME', description: 'Senior patron & philanthropic contributions' },
  { id: 'fcat_inc_07', name: 'Library & E-Research Fund', hindiName: 'लाइब्रेरी व ई-रिसर्च अंशदान', type: 'INCOME', description: 'E-database and journal subscription receipts' },
  { id: 'fcat_inc_08', name: 'Seminar & Event Registration', hindiName: 'संगोष्ठी व सम्मेलन पंजीयन', type: 'INCOME', description: 'Legal workshops and annual celebration entries' },
  { id: 'fcat_inc_09', name: 'Miscellaneous Income', hindiName: 'अन्य विविध आय', type: 'INCOME', description: 'Other unclassified inflow' },

  { id: 'fcat_exp_01', name: 'Bar Maintenance', hindiName: 'बार भवन व सभागार रख-रखाव', type: 'EXPENSE', description: 'Civil repair, whitewash, seating, air cooling' },
  { id: 'fcat_exp_02', name: 'Electricity & Utility', hindiName: 'विद्युत, जनरेटर व पेयजल व्यवस्था', type: 'EXPENSE', description: 'Monthly electricity bill, diesel for generator, water cooler' },
  { id: 'fcat_exp_03', name: 'Legal Aid Welfare', hindiName: 'अधिवक्ता चिकित्सा व मृत्यु राहत सहायता', type: 'EXPENSE', description: 'Emergency welfare disbursement to advocate families' },
  { id: 'fcat_exp_04', name: 'Library & Stationery', hindiName: 'पुस्तकालय, विधि पत्रिकाएं व स्टेशनरी', type: 'EXPENSE', description: 'AIR, SCC, Revenue Decisions & digital portal renewals' },
  { id: 'fcat_exp_05', name: 'Staff & Sanitation Salary', hindiName: 'कर्मचारी मानदेय व कार्यालय व्यवस्था', type: 'EXPENSE', description: 'Clerks, peon and sanitation staff monthly remuneration' },
  { id: 'fcat_exp_06', name: 'Event / Meeting', hindiName: 'बैठक जलपान व आमसभा व्यय', type: 'EXPENSE', description: 'Tea, snacks for executive committee and AGB meetings' },
  { id: 'fcat_exp_07', name: 'National Festivals & Celebrations', hindiName: 'राष्ट्रीय पर्व (15 अगस्त/26 जनवरी) व शपथ ग्रहण', type: 'EXPENSE', description: 'Independence Day, Republic Day, New Year Bar lunch' },
  { id: 'fcat_exp_08', name: 'IT & Digital Infrastructure', hindiName: 'आईटी, वाई-फाई व डिजिटल पोर्टल रख-रखाव', type: 'EXPENSE', description: 'Internet broadband, server cloud hosting and SMS alerts' },
  { id: 'fcat_exp_09', name: 'Other Miscellaneous', hindiName: 'अन्य विविध व्यय', type: 'EXPENSE', description: 'Incidental administrative expenditures' }
];

const DEFAULT_ELECTION_POSTS: ElectionPost[] = [
  { id: 'post_01', key: 'PRESIDENT', title: 'President', hindiTitle: 'अध्यक्ष', description: 'Apex head of the Bar Association, presiding officer of General Body', order: 1, seatsCount: 1 },
  { id: 'post_02', key: 'SR_VICE_PRESIDENT', title: 'Senior Vice President', hindiTitle: 'वरिष्ठ उपाध्यक्ष', description: 'Senior deputy head (Minimum 20 years bar standing)', order: 2, seatsCount: 1 },
  { id: 'post_03', key: 'VICE_PRESIDENT_JR', title: 'Vice President (Below 10 Yrs)', hindiTitle: 'उपाध्यक्ष (१० वर्ष से कम)', description: 'Representative of young advocates (Below 10 years practice)', order: 3, seatsCount: 1 },
  { id: 'post_04', key: 'GENERAL_SECRETARY', title: 'General Secretary', hindiTitle: 'महामंत्री / महासचिव', description: 'Chief executive officer of Bar administration and finance co-signatory', order: 4, seatsCount: 1 },
  { id: 'post_05', key: 'JT_SECRETARY_ADMIN', title: 'Joint Secretary (Administration)', hindiTitle: 'संयुक्त मंत्री प्रशासन', description: 'Assisting in general court liaison, administration and protocol', order: 5, seatsCount: 1 },
  { id: 'post_06', key: 'JT_SECRETARY_LIBRARY', title: 'Joint Secretary (Library)', hindiTitle: 'संयुक्त मंत्री पुस्तकालय', description: 'Custodian of Bar e-Library, physical law books, and digital cause screens', order: 6, seatsCount: 1 },
  { id: 'post_07', key: 'TREASURER', title: 'Treasurer', hindiTitle: 'कोषाध्यक्ष', description: 'Custodian of Bar bank accounts, vouchers, member subscription ledger', order: 7, seatsCount: 1 },
  { id: 'post_08', key: 'AUDITOR', title: 'Auditor / Accounts Inspector', hindiTitle: 'आय-व्यय निरीक्षक / लेखा परीक्षक', description: 'Statutory auditor for annual financial audit and expense compliance', order: 8, seatsCount: 1 },
  { id: 'post_09', key: 'SR_EXECUTIVE_MEMBER', title: 'Senior Executive Member (15+ Yrs)', hindiTitle: 'वरिष्ठ कार्यकारिणी सदस्य (१५+ वर्ष)', description: 'Senior member of Executive Committee governing council', order: 9, seatsCount: 6 },
  { id: 'post_10', key: 'JR_EXECUTIVE_MEMBER', title: 'Junior Executive Member (15- Yrs)', hindiTitle: 'कनिष्ठ कार्यकारिणी सदस्य (१५- वर्ष)', description: 'Junior member of Executive Committee governing council', order: 10, seatsCount: 10 }
];

// DISTRICT BAR ASSOCIATION ELECTION SEED DATA
const DEFAULT_DISTRICT_BAR_CONFIG: DistrictBarElectionConfig = {
  id: 'cfg_dist_ballia_2026',
  title: 'Criminal & Revenue Bar Association, Ballia - Annual General Elections 2026',
  barAssociationName: 'Criminal & Revenue Bar Association, Ballia (U.P.)',
  termYear: '2026-2027',
  isEnabled: true,
  status: 'VotingOpen',
  votingStartDate: '01/10/2026',
  votingEndDate: '05/10/2026',
  chiefElectionOfficer: 'Adv. Shri R. P. Upadhyay (Chief Election Officer)',
  totalVotersCount: 1500,
  notificationBanner: 'Criminal & Revenue Bar Association Ballia Annual Elections 2026 are officially LIVE! All member advocates can cast their ballots.',
  isVotingLive: true
};

// STATE BAR COUNCIL GENERAL ELECTION SEED DATA
const DEFAULT_STATE_BAR_CONFIG: StateBarElectionConfig = {
  id: 'sbec_2026_27',
  title: 'State Bar Council of Uttar Pradesh - General Elections 2026-2027',
  stateBarCouncilName: 'Bar Council of Uttar Pradesh (उत्तर प्रदेश राज्य विधिज्ञ परिषद)',
  termYear: '2026-2031 (5-Year Term)',
  isEnabled: true,
  status: 'VotingOpen',
  votingStartDate: '15/09/2026',
  votingEndDate: '30/10/2026',
  chiefElectionOfficer: 'Hon. Justice (Retd.) R. K. Agrawal & Shri Anand Kumar Mishra (Advocate General Nominee)',
  totalRegisteredDistricts: 75,
  totalVotersCount: 142500,
  allowAllDistricts: true
};

const DEFAULT_STATE_BAR_POSTS: StateBarElectionPost[] = [
  {
    id: 'sb_post_01',
    key: 'STATE_CHAIRMAN',
    title: 'Chairman, State Bar Council',
    hindiTitle: 'अध्यक्ष, राज्य विधिज्ञ परिषद',
    description: 'Apex constitutional head of the State Bar Council representing all 75 District Bars before the High Court and Government of UP.',
    order: 1,
    seatsCount: 1,
    category: 'Apex'
  },
  {
    id: 'sb_post_02',
    key: 'STATE_VICE_CHAIRMAN',
    title: 'Vice Chairman, State Bar Council',
    hindiTitle: 'उपाध्यक्ष, राज्य विधिज्ञ परिषद',
    description: 'Deputy presiding officer overseeing regional district bar coordination, youth advocate stipends, and legal education standards.',
    order: 2,
    seatsCount: 1,
    category: 'Apex'
  },
  {
    id: 'sb_post_03',
    key: 'BCI_REPRESENTATIVE',
    title: 'Bar Council of India (BCI) Delegate',
    hindiTitle: 'भारतीय विधिज्ञ परिषद (BCI) प्रतिनिधि',
    description: 'Elected state representative to the apex national Bar Council of India (BCI), New Delhi.',
    order: 3,
    seatsCount: 2,
    category: 'Council'
  },
  {
    id: 'sb_post_04',
    key: 'STATE_COUNCIL_MEMBER',
    title: 'State Bar Council Member (General Council)',
    hindiTitle: 'राज्य बार काउंसिल सदस्य (सामान्य परिषद)',
    description: 'Governing council members formulating state advocate welfare rules, enrollment policies, and legal aid frameworks.',
    order: 4,
    seatsCount: 25,
    category: 'Council'
  },
  {
    id: 'sb_post_05',
    key: 'WELFARE_FUND_TRUSTEE',
    title: 'Advocate Welfare Fund Trustee Member',
    hindiTitle: 'अधिवक्ता कल्याण कोष न्यासी सदस्य',
    description: 'Managing Rs 100+ Crore State Advocate Welfare Corpus, retirement benefits, and emergency medical grants.',
    order: 5,
    seatsCount: 5,
    category: 'Welfare'
  },
  {
    id: 'sb_post_06',
    key: 'DISCIPLINARY_COMMITTEE_MEMBER',
    title: 'Disciplinary Committee Tribunal Member',
    hindiTitle: 'अनुशासन समिति न्यायाधिकरण सदस्य',
    description: 'Statutory quasi-judicial tribunal presiding over professional ethics, conduct inquiries, and COP validations.',
    order: 6,
    seatsCount: 3,
    category: 'Disciplinary'
  }
];

const DEFAULT_STATE_BAR_CANDIDATES: StateBarElectionCandidate[] = [
  // Chairman candidates
  {
    id: 'sb_cand_01',
    name: 'Adv. Dr. Dharmendra Pratap Singh',
    hindiName: 'डॉ. धर्मेन्द्र प्रताप सिंह',
    stateRegNo: 'UP/3412/1992',
    copNo: 'COP/UP/1992/3412',
    districtBar: 'Prayagraj / Allahabad (प्रयागराज)',
    post: 'STATE_CHAIRMAN',
    photoUrl: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&auto=format&fit=crop&q=80',
    agenda: 'State-wide Advocate Protection Act implementation, Rs 10 Lakh Health Insurance for all enrolled advocates, and Digital E-Library grant of Rs 5 Lakh to every District Bar.',
    standingYears: 34,
    designation: 'Senior Advocate, High Court Bar Association Allahabad',
    votesCount: 1420,
    districtVoteBreakdown: {
      'Prayagraj / Allahabad (प्रयागराज)': 480,
      'Ballia (बलिया)': 190,
      'Lucknow (लखनऊ)': 260,
      'Varanasi (वाराणसी)': 240,
      'Gorakhpur (गोरखपुर)': 250
    },
    status: 'ACTIVE'
  },
  {
    id: 'sb_cand_02',
    name: 'Adv. Shri O. P. Singh',
    hindiName: 'श्री ओ. पी. सिंह',
    stateRegNo: 'UP/1084/1990',
    copNo: 'COP/UP/1990/1084',
    districtBar: 'Ballia (बलिया)',
    post: 'STATE_CHAIRMAN',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    agenda: 'Equal development grants for Eastern & Bundelkhand district bars, monthly junior advocate stipend of Rs 7,500/-, and paperless digitised cause lists in all subordinate courts.',
    standingYears: 36,
    designation: 'Former President, Criminal & Revenue Bar Association Ballia',
    votesCount: 1680,
    districtVoteBreakdown: {
      'Ballia (बलिया)': 540,
      'Mau (मऊ)': 310,
      'Ghazipur (गाजीपुर)': 290,
      'Azamgarh (आजमगढ़)': 270,
      'Deoria (देवरिया)': 270
    },
    status: 'ACTIVE'
  },
  {
    id: 'sb_cand_03',
    name: 'Adv. Smt. Sunita Srivastava',
    hindiName: 'श्रीमती सुनीता श्रीवास्तव',
    stateRegNo: 'UP/4421/1998',
    copNo: 'COP/UP/1998/4421',
    districtBar: 'Lucknow (लखनऊ)',
    post: 'STATE_CHAIRMAN',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    agenda: 'Special creche and air-conditioned lounge for women advocates in every district court, fast-track death claim settlements within 7 days, and state-wide online COP renewal.',
    standingYears: 28,
    designation: 'Senior Executive, Oudh Bar Association, Lucknow',
    votesCount: 1310,
    districtVoteBreakdown: {
      'Lucknow (लखनऊ)': 510,
      'Kanpur Nagar (कानपुर नगर)': 320,
      'Ayodhya (अयोध्या)': 240,
      'Sitapur (सीतापुर)': 120,
      'Unnao (उन्नाव)': 120
    },
    status: 'ACTIVE'
  },

  // Vice Chairman candidates
  {
    id: 'sb_cand_04',
    name: 'Adv. Vikramaditya Shukla',
    hindiName: 'विक्रमादित्य शुक्ला',
    stateRegNo: 'UP/5610/2001',
    copNo: 'COP/UP/2001/5610',
    districtBar: 'Varanasi (वाराणसी)',
    post: 'STATE_VICE_CHAIRMAN',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    agenda: 'Strengthening District Bar arbitration centers, seamless High Court e-filing desks across purvanchal, and advocate housing cooperative schemes in prime municipal areas.',
    standingYears: 25,
    designation: 'General Secretary, Central Bar Association Varanasi',
    votesCount: 1540,
    districtVoteBreakdown: {
      'Varanasi (वाराणसी)': 590,
      'Jaunpur (जौनपुर)': 310,
      'Mirzapur (मिर्जापुर)': 280,
      'Chandauli (चंदौली)': 210,
      'Ballia (बलिया)': 150
    },
    status: 'ACTIVE'
  },
  {
    id: 'sb_cand_05',
    name: 'Adv. Mahendra Pratap Singh',
    hindiName: 'महेंद्र प्रताप सिंह',
    stateRegNo: 'UP/7820/2003',
    copNo: 'COP/UP/2003/7820',
    districtBar: 'Gorakhpur (गोरखपुर)',
    post: 'STATE_VICE_CHAIRMAN',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
    agenda: 'Advocate accident & critical illness insurance cover of Rs 15 Lakhs, subsidized legal research subscriptions (SCC/Manupatra) at 80% discount for all district advocates.',
    standingYears: 23,
    designation: 'Senior Member, Gorakhpur Bar Association',
    votesCount: 1390,
    districtVoteBreakdown: {
      'Gorakhpur (गोरखपुर)': 520,
      'Deoria (देवरिया)': 330,
      'Kushinagar (कुशीनगर)': 280,
      'Maharajganj (महराजगंज)': 160,
      'Basti (बस्ती)': 100
    },
    status: 'ACTIVE'
  },

  // BCI Representative candidates
  {
    id: 'sb_cand_06',
    name: 'Adv. Dr. Rajeshwar Prasad Mishra',
    hindiName: 'डॉ. राजेश्वर प्रसाद मिश्रा',
    stateRegNo: 'UP/2190/1988',
    copNo: 'COP/UP/1988/2190',
    districtBar: 'Kanpur Nagar (कानपुर नगर)',
    post: 'BCI_REPRESENTATIVE',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    agenda: 'National representation of UP advocates in BCI, All India Bar Exam (AIBE) center expansion in every divisional headquarters, and Rs 500 Cr National Welfare Corpus demand.',
    standingYears: 38,
    designation: 'Former Dean of Law & Kanpur Bar President',
    votesCount: 1720,
    districtVoteBreakdown: {
      'Kanpur Nagar (कानपुर नगर)': 610,
      'Lucknow (लखनऊ)': 380,
      'Agra (आगरा)': 340,
      'Prayagraj / Allahabad (प्रयागराज)': 210,
      'Jhansi (झांसी)': 180
    },
    status: 'ACTIVE'
  },
  {
    id: 'sb_cand_07',
    name: 'Adv. Tariq Anwar Khan',
    hindiName: 'तारिक अनवर खान',
    stateRegNo: 'UP/6710/1995',
    copNo: 'COP/UP/1995/6710',
    districtBar: 'Agra (आगरा)',
    post: 'BCI_REPRESENTATIVE',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    agenda: 'High Court Bench establishment advocacy in Western UP, standardized chamber construction funding from central BCI grants, and international legal exchange fellowships.',
    standingYears: 31,
    designation: 'Senior Counsel, Agra District Bar Association',
    votesCount: 1460,
    districtVoteBreakdown: {
      'Agra (आगरा)': 580,
      'Mathura (मथुरा)': 320,
      'Aligarh (अलीगढ़)': 290,
      'Firozabad (फिरोजाबाद)': 160,
      'Meerut (मेरठ)': 110
    },
    status: 'ACTIVE'
  },
  {
    id: 'sb_cand_08',
    name: 'Adv. Ritu Raj Sharma',
    hindiName: 'ऋतु राज शर्मा',
    stateRegNo: 'UP/9912/2004',
    copNo: 'COP/UP/2004/9912',
    districtBar: 'Meerut (मेरठ)',
    post: 'BCI_REPRESENTATIVE',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    agenda: 'Transparent judicial appointment feedback system, digital bar council identity cards with smart NFC chip, and comprehensive legal aid clinics across NCR & Western UP.',
    standingYears: 22,
    designation: 'Executive Member, Meerut Bar Association',
    votesCount: 1380,
    districtVoteBreakdown: {
      'Meerut (मेरठ)': 530,
      'Ghaziabad (गाजियाबाद)': 360,
      'Gautam Buddha Nagar / Noida (गौतम बुद्ध नगर)': 290,
      'Muzaffarnagar (मुजफ्फरनगर)': 120,
      'Saharanpur (सहारनपुर)': 80
    },
    status: 'ACTIVE'
  },

  // State Council Member candidates
  {
    id: 'sb_cand_09',
    name: 'Adv. Arvind Kumar Tiwari',
    hindiName: 'अरविन्द कुमार तिवारी',
    stateRegNo: 'UP/4321/2005',
    copNo: 'COP/UP/2005/4321',
    districtBar: 'Ballia (बलिया)',
    post: 'STATE_COUNCIL_MEMBER',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    agenda: 'Modernize revenue bar associations, provide zero-interest loan up to Rs 2 Lakh for young advocates setting up chambers, and establish state-of-the-art digital law libraries.',
    standingYears: 21,
    designation: 'Member, Criminal & Revenue Bar Association Ballia',
    votesCount: 1610,
    districtVoteBreakdown: {
      'Ballia (बलिया)': 610,
      'Ghazipur (गाजीपुर)': 340,
      'Mau (मऊ)': 290,
      'Varanasi (वाराणसी)': 210,
      'Deoria (देवरिया)': 160
    },
    status: 'ACTIVE'
  },
  {
    id: 'sb_cand_10',
    name: 'Adv. Alok Kumar Mishra',
    hindiName: 'आलोक कुमार मिश्रा',
    stateRegNo: 'UP/8120/2008',
    copNo: 'COP/UP/2008/8120',
    districtBar: 'Ayodhya (अयोध्या)',
    post: 'STATE_COUNCIL_MEMBER',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    agenda: 'Welfare pension for advocates having 30+ years active bar practice, enhanced judicial infrastructure and solar power in all district bar halls.',
    standingYears: 18,
    designation: 'Senior Member, District Bar Association Ayodhya',
    votesCount: 1450,
    districtVoteBreakdown: {
      'Ayodhya (अयोध्या)': 570,
      'Gonda (गोंडा)': 320,
      'Basti (बस्ती)': 260,
      'Sultanpur (सुल्तानपुर)': 180,
      'Lucknow (लखनऊ)': 120
    },
    status: 'ACTIVE'
  },
  {
    id: 'sb_cand_11',
    name: 'Adv. Smt. Vandana Tiwari',
    hindiName: 'श्रीमती वंदना तिवारी',
    stateRegNo: 'UP/5620/2007',
    copNo: 'COP/UP/2007/5620',
    districtBar: 'Ballia (बलिया)',
    post: 'STATE_COUNCIL_MEMBER',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    agenda: 'Equal representation of women advocates in State Bar Council committees, maternity benefit fund for practicing lady advocates, and child-care facilities in courts.',
    standingYears: 19,
    designation: 'Senior Advocate, Family Court & Ballia Bar',
    votesCount: 1520,
    districtVoteBreakdown: {
      'Ballia (बलिया)': 580,
      'Varanasi (वाराणसी)': 310,
      'Gorakhpur (गोरखपुर)': 280,
      'Azamgarh (आजमगढ़)': 210,
      'Jaunpur (जौनपुर)': 140
    },
    status: 'ACTIVE'
  },
  {
    id: 'sb_cand_12',
    name: 'Adv. Satyendra Kumar Rai',
    hindiName: 'सत्येन्द्र कुमार राय',
    stateRegNo: 'UP/9102/2010',
    copNo: 'COP/UP/2010/9102',
    districtBar: 'Ghazipur (गाजीपुर)',
    post: 'STATE_COUNCIL_MEMBER',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
    agenda: 'Fast redressal of advocate police grievances, special advocate protection magistrate desks, and automated WhatsApp alert systems for High Court transfer orders.',
    standingYears: 16,
    designation: 'Secretary, District Bar Association Ghazipur',
    votesCount: 1390,
    districtVoteBreakdown: {
      'Ghazipur (गाजीपुर)': 540,
      'Ballia (बलिया)': 290,
      'Mau (मऊ)': 260,
      'Chandauli (चंदौली)': 180,
      'Varanasi (वाराणसी)': 120
    },
    status: 'ACTIVE'
  },

  // Welfare Fund Trustee candidates
  {
    id: 'sb_cand_13',
    name: 'Adv. Amit Kumar Verma',
    hindiName: 'अमित कुमार वर्मा',
    stateRegNo: 'UP/11204/2018',
    copNo: 'COP/UP/2018/9011',
    districtBar: 'Ballia (बलिया)',
    post: 'WELFARE_FUND_TRUSTEE',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    agenda: '100% online portal for Advocate Welfare Fund death claim disbursement within 5 business days, transparent treasury audits, and digital welfare stamp tracking.',
    standingYears: 8,
    designation: 'Youth Representative, Ballia Bar Association',
    votesCount: 1480,
    districtVoteBreakdown: {
      'Ballia (बलिया)': 620,
      'Mau (मऊ)': 290,
      'Ghazipur (गाजीपुर)': 240,
      'Deoria (देवरिया)': 180,
      'Azamgarh (आजमगढ़)': 150
    },
    status: 'ACTIVE'
  },
  {
    id: 'sb_cand_14',
    name: 'Adv. Suresh Chandra Tripathi',
    hindiName: 'सुरेश चंद्र त्रिपाठी',
    stateRegNo: 'UP/3890/1999',
    copNo: 'COP/UP/1999/3890',
    districtBar: 'Deoria (देवरिया)',
    post: 'WELFARE_FUND_TRUSTEE',
    photoUrl: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&auto=format&fit=crop&q=80',
    agenda: 'Increase death benefit welfare from Rs 5 Lakhs to Rs 10 Lakhs, annual medical health checkup camps in all district bar associations, and zero red-tape.',
    standingYears: 27,
    designation: 'Senior Member, Civil Court Bar Deoria',
    votesCount: 1395,
    districtVoteBreakdown: {
      'Deoria (देवरिया)': 560,
      'Gorakhpur (गोरखपुर)': 340,
      'Kushinagar (कुशीनगर)': 260,
      'Ballia (बलिया)': 130,
      'Mau (मऊ)': 105
    },
    status: 'ACTIVE'
  }
];

const DEFAULT_STATE_BAR_VOTER_ROLL: StateBarVoterEligibility[] = [
  // Ballia District Bar Members
  {
    stateRegNo: 'UP/1084/1990',
    copNo: 'COP/UP/1990/1084',
    advocateName: 'Shri O. P. Singh',
    hindiName: 'श्री ओ. पी. सिंह',
    districtBar: 'Ballia (बलिया)',
    tahsil: 'Ballia Sadar',
    mobile: '9415988800',
    email: 'op.singh@barballia.com',
    chamberNo: 'Chamber 12, Senior Bar Hall',
    experienceYears: 36,
    specialization: ['CRIMINAL', 'REVENUE', 'CIVIL'],
    photoUrl: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&auto=format&fit=crop&q=80',
    isCopValid: true,
    status: 'APPROVED'
  },
  {
    stateRegNo: 'UP/4321/2005',
    copNo: 'COP/UP/2005/4321',
    advocateName: 'Adv. Arvind Kumar Tiwari',
    hindiName: 'अरविन्द कुमार तिवारी',
    districtBar: 'Ballia (बलिया)',
    tahsil: 'Ballia Sadar',
    mobile: '9415200001',
    email: 'arvind.tiwari@barballia.com',
    chamberNo: 'Chamber 08, Judicial Block',
    experienceYears: 21,
    specialization: ['CRIMINAL', 'CONSTITUTIONAL'],
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    isCopValid: true,
    status: 'APPROVED'
  },
  {
    stateRegNo: 'UP/2415/2001',
    copNo: 'COP/UP/2001/2415',
    advocateName: 'Adv. Rakesh Kumar Pandey',
    hindiName: 'राकेश कुमार पाण्डेय',
    districtBar: 'Ballia (बलिया)',
    tahsil: 'Bansdih',
    mobile: '9415200002',
    email: 'rakesh.pandey@barballia.com',
    chamberNo: 'Chamber 22, Revenue Bar Annex',
    experienceYears: 25,
    specialization: ['REVENUE', 'CIVIL'],
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    isCopValid: true,
    status: 'APPROVED'
  },
  {
    stateRegNo: 'UP/5620/2007',
    copNo: 'COP/UP/2007/5620',
    advocateName: 'Adv. Smt. Vandana Tiwari',
    hindiName: 'श्रीमती वंदना तिवारी',
    districtBar: 'Ballia (बलिया)',
    tahsil: 'Ballia Sadar',
    mobile: '9415200003',
    email: 'vandana.tiwari@barballia.com',
    chamberNo: 'Chamber 07, Family Court Corridor',
    experienceYears: 19,
    specialization: ['MATRIMONIAL', 'CIVIL', 'CRIMINAL'],
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    isCopValid: true,
    status: 'APPROVED'
  },
  {
    stateRegNo: 'UP/8834/2012',
    copNo: 'COP/UP/2012/7711',
    advocateName: 'Adv. Manoj Kumar Yadav',
    hindiName: 'मनोज कुमार यादव',
    districtBar: 'Ballia (बलिया)',
    tahsil: 'Rasra',
    mobile: '9838012345',
    email: 'manoj.yadav@barballia.com',
    chamberNo: 'Chamber 44, Revenue Bar Complex',
    experienceYears: 14,
    specialization: ['REVENUE', 'MVACT'],
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
    isCopValid: true,
    status: 'APPROVED'
  },
  {
    stateRegNo: 'UP/11204/2018',
    copNo: 'COP/UP/2018/9011',
    advocateName: 'Adv. Amit Kumar Verma',
    hindiName: 'अमित कुमार वर्मा',
    districtBar: 'Ballia (बलिया)',
    tahsil: 'Bairia',
    mobile: '9140123456',
    email: 'amit.verma@barballia.com',
    chamberNo: 'Chamber 19, Youth Bar Block',
    experienceYears: 8,
    specialization: ['CRIMINAL', 'JUVENILE'],
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    isCopValid: true,
    status: 'APPROVED'
  },
  {
    stateRegNo: 'UP/14309/2022',
    copNo: 'COP/UP/2022/6721',
    advocateName: 'Adv. Priya Mishra',
    hindiName: 'प्रिया मिश्रा',
    districtBar: 'Ballia (बलिया)',
    tahsil: 'Sikanderpur',
    mobile: '9792998877',
    email: 'priya.mishra@barballia.com',
    chamberNo: 'Chamber 51, Legal Aid Block',
    experienceYears: 4,
    specialization: ['CIVIL', 'REVENUE'],
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
    isCopValid: true,
    status: 'APPROVED'
  },

  // Prayagraj / Allahabad District & High Court Bar
  {
    stateRegNo: 'UP/3412/1992',
    copNo: 'COP/UP/1992/3412',
    advocateName: 'Dr. Dharmendra Pratap Singh',
    hindiName: 'डॉ. धर्मेन्द्र प्रताप सिंह',
    districtBar: 'Prayagraj / Allahabad (प्रयागराज)',
    tahsil: 'Sadar',
    mobile: '9415123980',
    email: 'dp.singh@hcalld.org',
    chamberNo: 'Chamber 104, High Court Bar Building',
    experienceYears: 34,
    specialization: ['CONSTITUTIONAL', 'SERVICE', 'CRIMINAL'],
    photoUrl: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&auto=format&fit=crop&q=80',
    isCopValid: true,
    status: 'APPROVED'
  },
  {
    stateRegNo: 'UP/7621/2006',
    copNo: 'COP/UP/2006/7621',
    advocateName: 'Adv. Anand Swaroop Shukla',
    hindiName: 'आनन्द स्वरूप शुक्ला',
    districtBar: 'Prayagraj / Allahabad (प्रयागराज)',
    tahsil: 'Phulpur',
    mobile: '9415334411',
    email: 'anand.shukla@alldbar.com',
    chamberNo: 'Chamber 45, District Court Campus',
    experienceYears: 20,
    specialization: ['CIVIL', 'ARBITRATION'],
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    isCopValid: true,
    status: 'APPROVED'
  },

  // Lucknow District & Oudh Bar Association
  {
    stateRegNo: 'UP/4421/1998',
    copNo: 'COP/UP/1998/4421',
    advocateName: 'Smt. Sunita Srivastava',
    hindiName: 'श्रीमती सुनीता श्रीवास्तव',
    districtBar: 'Lucknow (लखनऊ)',
    tahsil: 'Lucknow Sadar',
    mobile: '9839011223',
    email: 'sunita.srivastava@oudhbar.com',
    chamberNo: 'Chamber 202, Oudh Bar Association',
    experienceYears: 28,
    specialization: ['MATRIMONIAL', 'SERVICE', 'CIVIL'],
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    isCopValid: true,
    status: 'APPROVED'
  },
  {
    stateRegNo: 'UP/8920/2011',
    copNo: 'COP/UP/2011/8920',
    advocateName: 'Adv. Pradeep Kumar Bajpai',
    hindiName: 'प्रदीप कुमार बाजपेयी',
    districtBar: 'Lucknow (लखनऊ)',
    tahsil: 'Bakshi Ka Talab',
    mobile: '9839445566',
    email: 'pradeep.bajpai@lucknowbar.in',
    chamberNo: 'Chamber 78, Collectorate Bar Block',
    experienceYears: 15,
    specialization: ['REVENUE', 'COMMERCIAL'],
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
    isCopValid: true,
    status: 'APPROVED'
  },

  // Varanasi Central & District Bar
  {
    stateRegNo: 'UP/5610/2001',
    copNo: 'COP/UP/2001/5610',
    advocateName: 'Adv. Vikramaditya Shukla',
    hindiName: 'विक्रमादित्य शुक्ला',
    districtBar: 'Varanasi (वाराणसी)',
    tahsil: 'Varanasi Sadar',
    mobile: '9450123789',
    email: 'vikram.shukla@varanasibar.org',
    chamberNo: 'Chamber 16, Central Bar Building',
    experienceYears: 25,
    specialization: ['CRIMINAL', 'CORPORATE'],
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    isCopValid: true,
    status: 'APPROVED'
  },

  // Gorakhpur Bar Association
  {
    stateRegNo: 'UP/7820/2003',
    copNo: 'COP/UP/2003/7820',
    advocateName: 'Adv. Mahendra Pratap Singh',
    hindiName: 'महेंद्र प्रताप सिंह',
    districtBar: 'Gorakhpur (गोरखपुर)',
    tahsil: 'Gorakhpur Sadar',
    mobile: '9415887766',
    email: 'mahendra.singh@gorakhpurbar.com',
    chamberNo: 'Chamber 33, Civil Court Campus',
    experienceYears: 23,
    specialization: ['CIVIL', 'CONSUMER'],
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
    isCopValid: true,
    status: 'APPROVED'
  },

  // Kanpur Nagar Bar Association
  {
    stateRegNo: 'UP/2190/1988',
    copNo: 'COP/UP/1988/2190',
    advocateName: 'Dr. Rajeshwar Prasad Mishra',
    hindiName: 'डॉ. राजेश्वर प्रसाद मिश्रा',
    districtBar: 'Kanpur Nagar (कानपुर नगर)',
    tahsil: 'Kanpur Sadar',
    mobile: '9838112233',
    email: 'rajeshwar.mishra@kanpurbar.org',
    chamberNo: 'Chamber 01, Lawyers Association Hall',
    experienceYears: 38,
    specialization: ['LABOUR', 'CONSTITUTIONAL', 'CIVIL'],
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    isCopValid: true,
    status: 'APPROVED'
  },

  // Agra District Bar
  {
    stateRegNo: 'UP/6710/1995',
    copNo: 'COP/UP/1995/6710',
    advocateName: 'Adv. Tariq Anwar Khan',
    hindiName: 'तारिक अनवर खान',
    districtBar: 'Agra (आगरा)',
    tahsil: 'Agra Sadar',
    mobile: '9837012345',
    email: 'tariq.khan@agrabar.com',
    chamberNo: 'Chamber 55, Diwani Kachehari',
    experienceYears: 31,
    specialization: ['CRIMINAL', 'CYBER'],
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    isCopValid: true,
    status: 'APPROVED'
  },

  // Meerut Bar Association
  {
    stateRegNo: 'UP/9912/2004',
    copNo: 'COP/UP/2004/9912',
    advocateName: 'Adv. Ritu Raj Sharma',
    hindiName: 'ऋतु राज शर्मा',
    districtBar: 'Meerut (मेरठ)',
    tahsil: 'Meerut Sadar',
    mobile: '9837998811',
    email: 'rituraj.sharma@meerutbar.in',
    chamberNo: 'Chamber 28, Western Bar Block',
    experienceYears: 22,
    specialization: ['COMMERCIAL', 'CIVIL'],
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    isCopValid: true,
    status: 'APPROVED'
  },

  // Ayodhya District Bar
  {
    stateRegNo: 'UP/8120/2008',
    copNo: 'COP/UP/2008/8120',
    advocateName: 'Adv. Alok Kumar Mishra',
    hindiName: 'आलोक कुमार मिश्रा',
    districtBar: 'Ayodhya (अयोध्या)',
    tahsil: 'Faizabad Sadar',
    mobile: '9415443322',
    email: 'alok.mishra@ayodhyabar.com',
    chamberNo: 'Chamber 14, Civil Court Ayodhya',
    experienceYears: 18,
    specialization: ['REVENUE', 'CIVIL', 'CRIMINAL'],
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    isCopValid: true,
    status: 'APPROVED'
  },

  // Ghazipur District Bar
  {
    stateRegNo: 'UP/9102/2010',
    copNo: 'COP/UP/2010/9102',
    advocateName: 'Adv. Satyendra Kumar Rai',
    hindiName: 'सत्येन्द्र कुमार राय',
    districtBar: 'Ghazipur (गाजीपुर)',
    tahsil: 'Ghazipur Sadar',
    mobile: '9450882211',
    email: 'satyendra.rai@ghazipurbar.com',
    chamberNo: 'Chamber 18, District Court',
    experienceYears: 16,
    specialization: ['CRIMINAL', 'REVENUE'],
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
    isCopValid: true,
    status: 'APPROVED'
  },

  // Mau District Bar
  {
    stateRegNo: 'UP/7420/2009',
    copNo: 'COP/UP/2009/7420',
    advocateName: 'Adv. Akhilesh Kumar Singh',
    hindiName: 'अखिलेश कुमार सिंह',
    districtBar: 'Mau (मऊ)',
    tahsil: 'Maunath Bhanjan',
    mobile: '9450334455',
    email: 'akhilesh.singh@maubar.in',
    chamberNo: 'Chamber 21, Collectorate Block',
    experienceYears: 17,
    specialization: ['CIVIL', 'LABOUR'],
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    isCopValid: true,
    status: 'APPROVED'
  },

  // Azamgarh District Bar
  {
    stateRegNo: 'UP/6211/2006',
    copNo: 'COP/UP/2006/6211',
    advocateName: 'Adv. Devesh Kumar Pandey',
    hindiName: 'देवेश कुमार पाण्डेय',
    districtBar: 'Azamgarh (आजमगढ़)',
    tahsil: 'Sadar Azamgarh',
    mobile: '9415667788',
    email: 'devesh.pandey@azamgarhbar.com',
    chamberNo: 'Chamber 36, Civil Court',
    experienceYears: 20,
    specialization: ['CRIMINAL', 'SERVICE'],
    photoUrl: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&auto=format&fit=crop&q=80',
    isCopValid: true,
    status: 'APPROVED'
  },

  // Deoria District Bar
  {
    stateRegNo: 'UP/3890/1999',
    copNo: 'COP/UP/1999/3890',
    advocateName: 'Adv. Suresh Chandra Tripathi',
    hindiName: 'सुरेश चंद्र त्रिपाठी',
    districtBar: 'Deoria (देवरिया)',
    tahsil: 'Deoria Sadar',
    mobile: '9450119988',
    email: 'suresh.tripathi@deoriabar.com',
    chamberNo: 'Chamber 11, Civil Court',
    experienceYears: 27,
    specialization: ['REVENUE', 'CIVIL'],
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    isCopValid: true,
    status: 'APPROVED'
  },

  // Jaunpur District Bar
  {
    stateRegNo: 'UP/8340/2013',
    copNo: 'COP/UP/2013/8340',
    advocateName: 'Adv. Naveen Kumar Jaiswal',
    hindiName: 'नवीन कुमार जायसवाल',
    districtBar: 'Jaunpur (जौनपुर)',
    tahsil: 'Jaunpur Sadar',
    mobile: '9415002233',
    email: 'naveen.jaiswal@jaunpurbar.com',
    chamberNo: 'Chamber 09, District Bar Hall',
    experienceYears: 13,
    specialization: ['CRIMINAL', 'TAXATION'],
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    isCopValid: true,
    status: 'APPROVED'
  },
  // Ghaziabad Bar Association
  {
    stateRegNo: 'UP/10420/2015',
    copNo: 'COP/UP/2015/1042',
    advocateName: 'Adv. Rohit Sharma',
    hindiName: 'रोहित शर्मा',
    districtBar: 'Ghaziabad (गाजियाबाद)',
    tahsil: 'Ghaziabad Sadar',
    mobile: '9811223344',
    email: 'rohit.sharma@ghaziabadbar.in',
    chamberNo: 'Chamber 41, CBI Court Block',
    experienceYears: 11,
    specialization: ['CRIMINAL', 'CORPORATE'],
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    isCopValid: true,
    status: 'APPROVED'
  },
  // Gautam Buddha Nagar / Noida Bar
  {
    stateRegNo: 'UP/11950/2017',
    copNo: 'COP/UP/2017/1195',
    advocateName: 'Adv. Anjali Gautam',
    hindiName: 'अंजलि गौतम',
    districtBar: 'Gautam Buddha Nagar / Noida (गौतम बुद्ध नगर)',
    tahsil: 'Surajpur Sadar',
    mobile: '9818334455',
    email: 'anjali.gautam@noidabar.org',
    chamberNo: 'Chamber 18, Commercial Court Complex',
    experienceYears: 9,
    specialization: ['CIVIL', 'COMMERCIAL', 'CYBER'],
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    isCopValid: true,
    status: 'APPROVED'
  },
  // Bareilly Bar Association
  {
    stateRegNo: 'UP/5120/2000',
    copNo: 'COP/UP/2000/5120',
    advocateName: 'Adv. Harish Chandra Gangwar',
    hindiName: 'हरीश चंद्र गंगवार',
    districtBar: 'Bareilly (बरेली)',
    tahsil: 'Bareilly Sadar',
    mobile: '9412334455',
    email: 'harish.gangwar@bareillybar.com',
    chamberNo: 'Chamber 32, Rohilkhand Bar Annex',
    experienceYears: 26,
    specialization: ['REVENUE', 'CIVIL'],
    photoUrl: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&auto=format&fit=crop&q=80',
    isCopValid: true,
    status: 'APPROVED'
  },
  // Jhansi Bar Association (Bundelkhand)
  {
    stateRegNo: 'UP/7650/2005',
    copNo: 'COP/UP/2005/7650',
    advocateName: 'Adv. Brajesh Kumar Bundela',
    hindiName: 'ब्रजेश कुमार बुंदेला',
    districtBar: 'Jhansi (झांसी)',
    tahsil: 'Jhansi Sadar',
    mobile: '9451009988',
    email: 'brajesh.bundela@jhansibar.org',
    chamberNo: 'Chamber 15, Rani Laxmibai Court Block',
    experienceYears: 21,
    specialization: ['CRIMINAL', 'REVENUE'],
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    isCopValid: true,
    status: 'APPROVED'
  },
  // Mathura District Bar
  {
    stateRegNo: 'UP/9430/2010',
    copNo: 'COP/UP/2010/9430',
    advocateName: 'Adv. Krishna Murari Chaturvedi',
    hindiName: 'कृष्ण मुरारी चतुर्वेदी',
    districtBar: 'Mathura (मथुरा)',
    tahsil: 'Mathura Sadar',
    mobile: '9412778899',
    email: 'krishna.chaturvedi@mathurabar.com',
    chamberNo: 'Chamber 27, Civil Court Mathura',
    experienceYears: 16,
    specialization: ['CIVIL', 'MATRIMONIAL'],
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
    isCopValid: true,
    status: 'APPROVED'
  },
  // Aligarh Bar Association
  {
    stateRegNo: 'UP/6910/2004',
    copNo: 'COP/UP/2004/6910',
    advocateName: 'Adv. Mohammad Zeeshan Siddiqui',
    hindiName: 'मोहम्मद ज़ीशान सिद्दीकी',
    districtBar: 'Aligarh (अलीगढ़)',
    tahsil: 'Koil Sadar',
    mobile: '9837112299',
    email: 'zeeshan.siddiqui@aligarhbar.com',
    chamberNo: 'Chamber 08, AMU Law Complex Block',
    experienceYears: 22,
    specialization: ['CONSTITUTIONAL', 'SERVICE', 'CRIMINAL'],
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    isCopValid: true,
    status: 'APPROVED'
  },
  // Mirzapur District Bar
  {
    stateRegNo: 'UP/8750/2011',
    copNo: 'COP/UP/2011/8750',
    advocateName: 'Adv. Vinay Kumar Bind',
    hindiName: 'विनय कुमार बिंद',
    districtBar: 'Mirzapur (मिर्जापुर)',
    tahsil: 'Mirzapur Sadar',
    mobile: '9450445566',
    email: 'vinay.bind@mirzapurbar.in',
    chamberNo: 'Chamber 19, Vindhyachal Court Hall',
    experienceYears: 15,
    specialization: ['REVENUE', 'CRIMINAL'],
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    isCopValid: true,
    status: 'APPROVED'
  },
  // Basti District Bar
  {
    stateRegNo: 'UP/7890/2008',
    copNo: 'COP/UP/2008/7890',
    advocateName: 'Adv. Ashok Kumar Chaudhary',
    hindiName: 'अशोक कुमार चौधरी',
    districtBar: 'Basti (बस्ती)',
    tahsil: 'Basti Sadar',
    mobile: '9415776655',
    email: 'ashok.chaudhary@bastibar.org',
    chamberNo: 'Chamber 23, Civil Court Basti',
    experienceYears: 18,
    specialization: ['CIVIL', 'REVENUE'],
    photoUrl: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&auto=format&fit=crop&q=80',
    isCopValid: true,
    status: 'APPROVED'
  },
  // Gonda District Bar
  {
    stateRegNo: 'UP/8990/2012',
    copNo: 'COP/UP/2012/8990',
    advocateName: 'Adv. Santosh Kumar Shukla',
    hindiName: 'संतोष कुमार शुक्ला',
    districtBar: 'Gonda (गोंडा)',
    tahsil: 'Gonda Sadar',
    mobile: '9415332211',
    email: 'santosh.shukla@gondabar.in',
    chamberNo: 'Chamber 12, District Court',
    experienceYears: 14,
    specialization: ['CRIMINAL', 'MATRIMONIAL'],
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    isCopValid: true,
    status: 'APPROVED'
  },
  // Saharanpur Bar Association
  {
    stateRegNo: 'UP/5540/2002',
    copNo: 'COP/UP/2002/5540',
    advocateName: 'Adv. Rakesh Kumar Saini',
    hindiName: 'राकेश कुमार सैनी',
    districtBar: 'Saharanpur (सहारनपुर)',
    tahsil: 'Saharanpur Sadar',
    mobile: '9837554433',
    email: 'rakesh.saini@saharanpurbar.com',
    chamberNo: 'Chamber 30, Western UP Court Block',
    experienceYears: 24,
    specialization: ['TAXATION', 'CIVIL'],
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
    isCopValid: true,
    status: 'APPROVED'
  },
  // Moradabad District Bar
  {
    stateRegNo: 'UP/6780/2006',
    copNo: 'COP/UP/2006/6780',
    advocateName: 'Adv. Farhan Akhtar Ansari',
    hindiName: 'फरहान अख्तर अंसारी',
    districtBar: 'Moradabad (मुरादाबाद)',
    tahsil: 'Moradabad Sadar',
    mobile: '9837667788',
    email: 'farhan.ansari@moradabadbar.in',
    chamberNo: 'Chamber 16, Peetal Nagari Lawyers Block',
    experienceYears: 20,
    specialization: ['COMMERCIAL', 'CRIMINAL'],
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    isCopValid: true,
    status: 'APPROVED'
  },
  // Sultanpur District Bar
  {
    stateRegNo: 'UP/9210/2014',
    copNo: 'COP/UP/2014/9210',
    advocateName: 'Adv. Deepak Kumar Srivastava',
    hindiName: 'दीपक कुमार श्रीवास्तव',
    districtBar: 'Sultanpur (सुल्तानपुर)',
    tahsil: 'Sultanpur Sadar',
    mobile: '9415881122',
    email: 'deepak.srivastava@sultanpurbar.com',
    chamberNo: 'Chamber 14, Civil Court',
    experienceYears: 12,
    specialization: ['REVENUE', 'CIVIL'],
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    isCopValid: true,
    status: 'APPROVED'
  },
  // Sitapur District Bar
  {
    stateRegNo: 'UP/8450/2011',
    copNo: 'COP/UP/2011/8450',
    advocateName: 'Adv. Shivendra Kumar Awasthi',
    hindiName: 'शिवेन्द्र कुमार अवस्थी',
    districtBar: 'Sitapur (सीतापुर)',
    tahsil: 'Sitapur Sadar',
    mobile: '9415663322',
    email: 'shivendra.awasthi@sitapurbar.in',
    chamberNo: 'Chamber 20, District Bar Hall',
    experienceYears: 15,
    specialization: ['CRIMINAL', 'REVENUE'],
    photoUrl: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&auto=format&fit=crop&q=80',
    isCopValid: true,
    status: 'APPROVED'
  },
  // Unnao District Bar
  {
    stateRegNo: 'UP/7330/2007',
    copNo: 'COP/UP/2007/7330',
    advocateName: 'Adv. Ritesh Kumar Dixit',
    hindiName: 'रितेश कुमार दीक्षित',
    districtBar: 'Unnao (उन्नाव)',
    tahsil: 'Unnao Sadar',
    mobile: '9415994433',
    email: 'ritesh.dixit@unnaobar.com',
    chamberNo: 'Chamber 17, Civil Court Unnao',
    experienceYears: 19,
    specialization: ['CIVIL', 'MATRIMONIAL'],
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    isCopValid: true,
    status: 'APPROVED'
  }
];

const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'proj_01',
    title: 'Bar Library Digital Modernization & High-Speed E-Research Hub',
    description: 'Installation of 10 modern computer terminals with unlimited access to SCC Online, Manupatra, and UP Revenue Law e-database for young advocates.',
    status: 'Running',
    budget: 450000,
    imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600&auto=format&fit=crop&q=80',
    startDate: '01/06/2026',
    targetDate: '30/11/2026'
  },
  {
    id: 'proj_02',
    title: 'District Court Ballia Digital Cause List Display LED Screens',
    description: 'Placement of large outdoor high-brightness LED Cause List screens at Senior Bar Block, Criminal Annex, and Revenue Hall.',
    status: 'Completed',
    budget: 280000,
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80',
    startDate: '10/01/2026',
    targetDate: '15/05/2026'
  },
  {
    id: 'proj_03',
    title: 'Advocate Chamber Complex Phase-II (Multi-Story Extension)',
    description: 'Construction of 40 new ventilated advocate chambers with attached conference rooms and drinking water filtration plant.',
    status: 'Upcoming',
    budget: 2500000,
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80',
    startDate: '01/12/2026',
    targetDate: '31/12/2027'
  }
];

const DEFAULT_GALLERY: GalleryItem[] = [
  {
    id: 'gal_01',
    title: 'Annual General Body Meeting & Independence Day Celebrations',
    category: 'Events',
    imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    date: '15/08/2026'
  },
  {
    id: 'gal_02',
    title: 'Executive Committee Meeting with Hon. District Judge Ballia',
    category: 'Meetings',
    imageUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=600&auto=format&fit=crop&q=80',
    date: '28/07/2026'
  },
  {
    id: 'gal_03',
    title: 'District & Sessions Court Ballia Historic Facade & Court Rooms',
    category: 'Court',
    imageUrl: 'https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=600&auto=format&fit=crop&q=80',
    date: '10/06/2026'
  },
  {
    id: 'gal_04',
    title: 'Seminar on New Criminal Laws (BNS, BNSS, BSA) at Bar Hall',
    category: 'Events',
    imageUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80',
    date: '02/05/2026'
  },
  {
    id: 'gal_05',
    title: 'Bar Delegation Meeting with DM / Collector Ballia regarding Revenue Courts',
    category: 'Meetings',
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80',
    date: '18/04/2026'
  },
  {
    id: 'gal_06',
    title: 'Ballia Bar Association Central Law Library & Reading Hall',
    category: 'Court',
    imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600&auto=format&fit=crop&q=80',
    date: '12/03/2026'
  }
];

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_01',
    title: 'Urgent: Bar General Body Meeting on 15th September',
    message: 'All advocates are requested to assemble at Bar Hall, Ballia at 1:30 PM to discuss newly notified revenue court procedures and advocate welfare fund.',
    targetAudience: 'All',
    createdAt: '10/09/2026 10:00 AM',
    isRead: false
  },
  {
    id: 'notif_02',
    title: 'Annual Bar Subscription Renewal 2026-2027 Open',
    message: 'Members can now renew annual membership online via Razorpay (Rs 1200) to instantly download their updated Digital QR Bar ID Card.',
    targetAudience: 'All',
    createdAt: '08/09/2026 09:15 AM',
    isRead: false
  },
  {
    id: 'notif_03',
    title: 'Court Hearing Reminder Alert',
    message: 'You have 2 case hearings listed for tomorrow in Court No. 1 and Court No. 2.',
    targetAudience: 'Selected',
    recipientIds: ['adv_admin_001', 'adv_002'],
    createdAt: '10/09/2026 08:00 AM',
    isRead: false
  }
];

const DEFAULT_JUNIOR_SENIOR: JuniorSeniorPost[] = [
  {
    id: 'js_01',
    advocateId: 'adv_admin_001',
    advocateName: 'Shri O. P. Singh (Senior Advocate)',
    barNo: '1084/1990',
    contact: '9415988800',
    type: 'Need Junior',
    caseNature: 'CRIMINAL',
    title: 'Junior Advocate / Chamber Associate Needed for Sessions Trial Work',
    message: 'Looking for 2 dedicated junior advocates with LLB degree for drafting criminal bail applications, revision petitions, and attending District & Sessions Court Ballia proceedings. Attractive stipend provided.',
    experienceYears: 1,
    createdAt: '05/09/2026'
  },
  {
    id: 'js_02',
    advocateId: 'adv_005',
    advocateName: 'Adv. Amit Kumar Verma',
    barNo: '11204/2018',
    contact: '9140123456',
    type: 'Need Senior',
    caseNature: 'REVENUE',
    title: 'Guidance Requested on Complex UP Revenue Code Sec 116 Boundary Partition',
    message: 'Seeking mentorship and guidance from senior revenue practitioners regarding a multi-shareholder ancestral khata land partition in Tahsil Bansdih.',
    experienceYears: 7,
    createdAt: '08/09/2026'
  }
];

const DEFAULT_CHATS: ChatMessage[] = [
  {
    id: 'chat_01',
    senderId: 'adv_002',
    senderName: 'Adv. Rakesh Kumar Pandey',
    senderBarNo: '2415/2001',
    receiverId: 'adv_admin_001',
    receiverName: 'Shri O. P. Singh',
    message: 'Pranaam Sir. Tomorrow Session Trial No. 340/23 is listed first in Court No. 1. Case diary copy is ready.',
    timestamp: '10/09/2026 10:15 AM'
  },
  {
    id: 'chat_02',
    senderId: 'adv_admin_001',
    senderName: 'Shri O. P. Singh',
    senderBarNo: '1084/1990',
    receiverId: 'adv_002',
    receiverName: 'Adv. Rakesh Kumar Pandey',
    message: 'Good Pandey ji. Please keep the High Court precedent judgment on Section 302 vs 304 ready in chamber.',
    timestamp: '10/09/2026 10:20 AM'
  }
];

const DEFAULT_REVIEWS: AdvocateReview[] = [
  {
    id: 'rev_01',
    advocateId: 'adv_admin_001',
    clientName: 'Dharmendra Kumar Rai',
    clientMobile: '9839443322',
    caseNo: 'ST 412/2024',
    rating: 5,
    comment: 'Outstanding advocate! Handled our complex criminal trial in Ballia Court with immense wisdom, fairness, and got us bail within record time.',
    date: '15/08/2026'
  },
  {
    id: 'rev_02',
    advocateId: 'adv_003',
    clientName: 'Smt. Kavita Sharma',
    clientMobile: '9451998877',
    caseNo: 'MC 88/2024',
    rating: 5,
    comment: 'Vandana maam is extremely compassionate and strong in Family Court. She defended my maintenance suit with utmost dedication.',
    date: '20/08/2026'
  }
];

const DEFAULT_COURT_MASTERS: CourtMaster[] = [
  {
    id: 'court_01',
    name: 'Court of District & Sessions Judge, Ballia',
    hindiName: 'जिला एवं सत्र न्यायाधीश न्यायालय, बलिया',
    type: 'District & Sessions Court',
    roomNo: 'Court Room No. 01',
    presidingOfficer: 'District & Sessions Judge',
    order: 1,
    isActive: true
  },
  {
    id: 'court_02',
    name: 'Special Judge (POCSO Act) Court, Ballia',
    hindiName: 'विशेष न्यायाधीश पॉक्सो एक्ट न्यायालय, बलिया',
    type: 'District & Sessions Court',
    roomNo: 'Court Room No. 03',
    presidingOfficer: 'Special Judge POCSO',
    order: 2,
    isActive: true
  },
  {
    id: 'court_03',
    name: 'Special Judge (SC/ST Act) Court, Ballia',
    hindiName: 'विशेष न्यायाधीश एससी/एसटी एक्ट न्यायालय, बलिया',
    type: 'District & Sessions Court',
    roomNo: 'Court Room No. 04',
    presidingOfficer: 'Special Judge SC/ST Act',
    order: 3,
    isActive: true
  },
  {
    id: 'court_04',
    name: 'Court of Additional District & Sessions Judge - I, Ballia',
    hindiName: 'अपर जिला एवं सत्र न्यायाधीश - प्रथम, बलिया',
    type: 'District & Sessions Court',
    roomNo: 'Court Room No. 02',
    presidingOfficer: 'ADJ - I',
    order: 4,
    isActive: true
  },
  {
    id: 'court_05',
    name: 'Court of Additional District & Sessions Judge - II, Ballia',
    hindiName: 'अपर जिला एवं सत्र न्यायाधीश - द्वितीय, बलिया',
    type: 'District & Sessions Court',
    roomNo: 'Court Room No. 05',
    presidingOfficer: 'ADJ - II',
    order: 5,
    isActive: true
  },
  {
    id: 'court_06',
    name: 'Court of Chief Judicial Magistrate (CJM), Ballia',
    hindiName: 'मुख्य न्यायिक मजिस्ट्रेट न्यायालय (CJM Court), बलिया',
    type: 'Magistrate Court',
    roomNo: 'CJM Court Room',
    presidingOfficer: 'Chief Judicial Magistrate',
    order: 6,
    isActive: true
  },
  {
    id: 'court_07',
    name: 'Court of Additional Chief Judicial Magistrate (ACJM), Ballia',
    hindiName: 'अपर मुख्य न्यायिक मजिस्ट्रेट न्यायालय, बलिया',
    type: 'Magistrate Court',
    roomNo: 'ACJM Court Room',
    presidingOfficer: 'ACJM',
    order: 7,
    isActive: true
  },
  {
    id: 'court_08',
    name: 'Court of Civil Judge (Senior Division), Ballia',
    hindiName: 'सिविल जज (सीनियर डिवीजन) न्यायालय, बलिया',
    type: 'Civil Court',
    roomNo: 'Senior Division Hall',
    presidingOfficer: 'Civil Judge Sr. Div.',
    order: 8,
    isActive: true
  },
  {
    id: 'court_09',
    name: 'Court of Civil Judge (Junior Division), Ballia',
    hindiName: 'सिविल जज (जूनियर डिवीजन) न्यायालय, बलिया',
    type: 'Civil Court',
    roomNo: 'Junior Division Hall',
    presidingOfficer: 'Civil Judge Jr. Div.',
    order: 9,
    isActive: true
  },
  {
    id: 'court_10',
    name: 'Court of Sub-Divisional Magistrate (SDM), Ballia Sadar',
    hindiName: 'उपजिलाधिकारी (SDM) राजस्व न्यायालय, बलिया सदर',
    type: 'Revenue Court',
    roomNo: 'SDM Sadar Collectorate',
    presidingOfficer: 'SDM Ballia Sadar',
    order: 10,
    isActive: true
  },
  {
    id: 'court_11',
    name: 'Court of Sub-Divisional Magistrate (SDM), Bansdih',
    hindiName: 'उपजिलाधिकारी (SDM) राजस्व न्यायालय, बांसडीह',
    type: 'Revenue Court',
    roomNo: 'SDM Bansdih Tehsil',
    presidingOfficer: 'SDM Bansdih',
    order: 11,
    isActive: true
  },
  {
    id: 'court_12',
    name: 'Court of Sub-Divisional Magistrate (SDM), Rasra',
    hindiName: 'उपजिलाधिकारी (SDM) राजस्व न्यायालय, रसड़ा',
    type: 'Revenue Court',
    roomNo: 'SDM Rasra Tehsil',
    presidingOfficer: 'SDM Rasra',
    order: 12,
    isActive: true
  },
  {
    id: 'court_13',
    name: 'Court of Sub-Divisional Magistrate (SDM), Bairia',
    hindiName: 'उपजिलाधिकारी (SDM) राजस्व न्यायालय, बैरिया',
    type: 'Revenue Court',
    roomNo: 'SDM Bairia Tehsil',
    presidingOfficer: 'SDM Bairia',
    order: 13,
    isActive: true
  },
  {
    id: 'court_14',
    name: 'Court of Tehsildar (Judicial / Revenue), Ballia Sadar',
    hindiName: 'तहसीलदार (न्यायिक / राजस्व) न्यायालय, सदर बलिया',
    type: 'Revenue Court',
    roomNo: 'Tehsildar Court Room',
    presidingOfficer: 'Tehsildar Sadar',
    order: 14,
    isActive: true
  },
  {
    id: 'court_15',
    name: 'Court of District Magistrate / Collector, Ballia',
    hindiName: 'जिलाधिकारी / कलेक्ट्रेट न्यायालय, बलिया',
    type: 'Revenue Court',
    roomNo: 'DM Court Hall',
    presidingOfficer: 'Collector / DM Ballia',
    order: 15,
    isActive: true
  },
  {
    id: 'court_16',
    name: 'Family Court (प्रधान न्यायाधीश परिवार न्यायालय), Ballia',
    hindiName: 'प्रधान न्यायाधीश परिवार न्यायालय, बलिया',
    type: 'District & Sessions Court',
    roomNo: 'Family Court Complex',
    presidingOfficer: 'Principal Judge Family Court',
    order: 16,
    isActive: true
  },
  {
    id: 'court_17',
    name: 'Motor Accident Claims Tribunal (MACT), Ballia',
    hindiName: 'मोटर दुर्घटना दावा अधिकरण (MACT), बलिया',
    type: 'Tribunal / Forum',
    roomNo: 'MACT Hall',
    presidingOfficer: 'Presiding Officer MACT',
    order: 17,
    isActive: true
  },
  {
    id: 'court_18',
    name: 'District Consumer Disputes Redressal Commission, Ballia',
    hindiName: 'जिला उपभोक्ता विवाद निवारण आयोग, बलिया',
    type: 'Tribunal / Forum',
    roomNo: 'Consumer Commission Office',
    presidingOfficer: 'President Consumer Forum',
    order: 18,
    isActive: true
  }
];

const DEFAULT_CASE_STAGE_MASTERS: CaseStageMaster[] = [
  {
    id: 'stage_01',
    name: 'Preliminary Hearing & Bail Application',
    hindiName: 'प्रारंभिक सुनवाई एवं जमानत प्रार्थना पत्र',
    category: 'Criminal',
    order: 1,
    isActive: true
  },
  {
    id: 'stage_02',
    name: 'Summons / Notice to Opposite Party',
    hindiName: 'विपक्षी को सम्मन / नोटिस तामीला',
    category: 'General',
    order: 2,
    isActive: true
  },
  {
    id: 'stage_03',
    name: 'Appearance & Vakalatnama Filing',
    hindiName: 'हाजिरी व वकालतनामा दाखिल',
    category: 'General',
    order: 3,
    isActive: true
  },
  {
    id: 'stage_04',
    name: 'Objection / Written Statement (W.S.)',
    hindiName: 'आपत्ति / जवाबदावा (W.S.) दाखिल',
    category: 'Civil',
    order: 4,
    isActive: true
  },
  {
    id: 'stage_05',
    name: 'Framing of Charge / Issues',
    hindiName: 'आरोप विरचन / वाद बिंदु निर्धारण',
    category: 'General',
    order: 5,
    isActive: true
  },
  {
    id: 'stage_06',
    name: 'Prosecution / Plaintiff Evidence (P.W.)',
    hindiName: 'अभियोजन / वादी साक्ष्य (गवाही)',
    category: 'General',
    order: 6,
    isActive: true
  },
  {
    id: 'stage_07',
    name: 'Cross Examination of Witnesses',
    hindiName: 'गवाहों से जिरह (Cross-Examination)',
    category: 'General',
    order: 7,
    isActive: true
  },
  {
    id: 'stage_08',
    name: 'Statement of Accused (Sec 313 CrPC/351 BNSS)',
    hindiName: 'अभियुक्त का बयान (Sec 313 CrPC / 351 BNSS)',
    category: 'Criminal',
    order: 8,
    isActive: true
  },
  {
    id: 'stage_09',
    name: 'Defence Evidence (D.W.)',
    hindiName: 'प्रतिवादी / बचाव साक्ष्य (D.W.)',
    category: 'General',
    order: 9,
    isActive: true
  },
  {
    id: 'stage_10',
    name: 'Final Arguments (अंतिम बहस)',
    hindiName: 'अंतिम बहस / तर्क (Final Arguments)',
    category: 'General',
    order: 10,
    isActive: true
  },
  {
    id: 'stage_11',
    name: 'Order / Judgment / Decree',
    hindiName: 'आदेश / फैसला / डिक्री',
    category: 'General',
    order: 11,
    isActive: true
  },
  {
    id: 'stage_12',
    name: 'Execution / Compliance (अमलदरामद)',
    hindiName: 'आदेश का निष्पादन / परवाना / अमलदरामद',
    category: 'Revenue',
    order: 12,
    isActive: true
  },
  {
    id: 'stage_13',
    name: 'Interim Application / Stay Hearing',
    hindiName: 'अंतरिम स्थगन (Stay) प्रार्थना पत्र सुनवाई',
    category: 'General',
    order: 13,
    isActive: true
  },
  {
    id: 'stage_14',
    name: 'Mediation & Compounding (सुलह-समझौता)',
    hindiName: 'मध्यस्थता एवं सुलह-समझौता',
    category: 'General',
    order: 14,
    isActive: true
  },
  {
    id: 'stage_15',
    name: 'Remand & Police Custody Hearing',
    hindiName: 'रिमांड व पुलिस कस्टडी सुनवाई',
    category: 'Criminal',
    order: 15,
    isActive: true
  },
  {
    id: 'stage_16',
    name: 'Appeal / Revision Hearing',
    hindiName: 'अपील / निगरानी सुनवाई',
    category: 'General',
    order: 16,
    isActive: true
  }
];

// Helper for local storage read/write
class LocalStore {
  private isSyncingFromServer = false;

  private get<T>(key: string, defaultValue: T): T {
    try {
      let raw = localStorage.getItem(key);
      if (!raw) {
        // Fallback to legacy plain-text key if migrating
        const legacyKey = LEGACY_STORAGE_MAP[key];
        if (legacyKey) {
          raw = localStorage.getItem(legacyKey);
          if (raw) {
            // Auto-migrate to encrypted vault format
            try {
              const parsedLegacy = JSON.parse(raw);
              this.set(key, parsedLegacy);
              localStorage.removeItem(legacyKey);
              return parsedLegacy;
            } catch {
              // ignore
            }
          }
        }
      }
      if (!raw) return defaultValue;
      const decrypted = securityShield.decrypt(raw);
      return JSON.parse(decrypted);
    } catch {
      return defaultValue;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      const serialized = JSON.stringify(value);
      const encrypted = securityShield.encrypt(serialized);
      localStorage.setItem(key, encrypted);

      // Clean legacy unencrypted key if exists
      const legacyKey = LEGACY_STORAGE_MAP[key];
      if (legacyKey && localStorage.getItem(legacyKey)) {
        localStorage.removeItem(legacyKey);
      }

      // Dispatch custom storage event for in-app reactive listeners
      window.dispatchEvent(new CustomEvent('crba_state_updated', { detail: { key } }));

      // Sync shared keys across all devices via backend server
      if (!this.isSyncingFromServer && key !== STORAGE_KEYS.CURRENT_USER) {
        fetch('/api/cloud-store', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, value })
        }).catch(() => {
          // Offline fallback: stays in encrypted localStorage until online
        });
      }
    } catch (e) {
      console.error('Storage write error:', e);
    }
  }

  private lastCloudTimestamps: Record<string, string> = {};

  // Multi-device cloud sync (merges local, Firestore, and server state across Mobile & Laptop)
  public async syncWithServer(pushLocalFirst = false): Promise<void> {
    try {
      if (pushLocalFirst) {
        // 1. Push directly to Google Cloud Firestore (works on Vercel, Mobile & Desktop)
        await this.pushToFirestoreCloud();

        // 2. Also push to local server if Express dev server is running
        try {
          const bulk: Record<string, unknown> = {};
          for (const k of Object.values(STORAGE_KEYS)) {
            if (k === STORAGE_KEYS.CURRENT_USER) continue;
            const val = this.get<unknown>(k, null);
            if (val !== null && val !== undefined) {
              bulk[k] = val;
            }
          }
          await fetch('/api/cloud-store', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bulk })
          }).catch(() => {});
        } catch {}
        return;
      }

      // Pull from Google Cloud Firestore (Primary distributed store for Vercel & Mobile)
      await this.pullFromFirestoreCloud();

      // Also pull from local Express server if running
      try {
        const res = await fetch('/api/cloud-store').catch(() => null);
        if (res && res.ok) {
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const json = await res.json().catch(() => null);
            if (json && json.data) {
              this.applyServerStoreData(json.data);
            }
          }
        }
      } catch {}
    } catch (err) {
      console.warn('Sync error:', err);
    }
  }

  // Attach Native Firestore onSnapshot() Realtime Listeners for instant multi-device sync
  public setupRealtimeFirestoreListeners(): void {
    if (typeof window === 'undefined') return;

    const collectionsToListen = [
      { docName: 'vault_advocates', storageKey: STORAGE_KEYS.ADVOCATES },
      { docName: 'vault_earnings', storageKey: STORAGE_KEYS.EARNINGS },
      { docName: 'vault_expenses', storageKey: STORAGE_KEYS.EXPENSES },
      { docName: 'vault_notifications', storageKey: STORAGE_KEYS.NOTIFICATIONS }
    ];

    collectionsToListen.forEach(({ docName, storageKey }) => {
      try {
        const docRef = doc(firestoreDb, 'settings', docName);
        onSnapshot(
          docRef,
          (snapshot) => {
            if (snapshot.exists()) {
              const docData = snapshot.data();
              const rawData = docData?.data;
              const updatedAt = docData?.updatedAt;

              if (rawData && updatedAt && updatedAt !== this.lastCloudTimestamps[docName]) {
                this.lastCloudTimestamps[docName] = updatedAt;
                try {
                  const parsed = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
                  if (Array.isArray(parsed)) {
                    this.applyServerStoreData({
                      [storageKey]: parsed
                    });
                  }
                } catch (e) {
                  console.warn(`Error parsing realtime snapshot for ${docName}:`, e);
                }
              }
            }
          },
          (error) => {
            console.warn(`Firestore onSnapshot error for ${docName}:`, error);
          }
        );
      } catch (err) {
        console.warn(`Could not register listener for ${docName}:`, err);
      }
    });

    // Test connection on boot per skill guideline
    try {
      getDocFromServer(doc(firestoreDb, 'settings', 'sync_metadata')).catch((err) => {
        if (err instanceof Error && err.message.includes('the client is offline')) {
          console.error('Please check your Firebase configuration or network.');
        }
      });
    } catch {}
  }

  // Push modified state directly to Google Cloud Firestore across all devices
  public async pushToFirestoreCloud(): Promise<void> {
    try {
      const advocates = this.getAdvocates();
      const earnings = this.getEarnings();
      const expenses = this.getExpenses();
      const notifications = this.getNotifications();
      const nowIso = new Date().toISOString();

      const pushDoc = async (docName: string, data: any) => {
        try {
          // 1. Native Firestore SDK write triggers instant onSnapshot() on all devices in milliseconds!
          const docRef = doc(firestoreDb, 'settings', docName);
          await setDoc(
            docRef,
            {
              data: JSON.stringify(data),
              updatedAt: nowIso,
              count: Array.isArray(data) ? data.length : 1
            },
            { merge: true }
          ).catch(() => {});

          // 2. REST API Fallback
          const payload = {
            fields: {
              data: { stringValue: JSON.stringify(data) },
              updatedAt: { stringValue: nowIso },
              count: { integerValue: String(Array.isArray(data) ? data.length : 1) }
            }
          };
          const url = `${FIRESTORE_BASE}/settings/${docName}?key=${FIRESTORE_API_KEY}`;
          await fetch(url, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }).catch(() => {});
        } catch (err) {
          console.warn(`Firestore push failed for ${docName}:`, err);
        }
      };

      await Promise.allSettled([
        pushDoc('vault_advocates', advocates),
        pushDoc('vault_earnings', earnings),
        pushDoc('vault_expenses', expenses),
        pushDoc('vault_notifications', notifications)
      ]);

      // Update sync metadata timestamp so other devices pick up immediately
      const metaUrl = `${FIRESTORE_BASE}/settings/sync_metadata?key=${FIRESTORE_API_KEY}&updateMask.fieldPaths=lastUpdated&updateMask.fieldPaths=advocates&updateMask.fieldPaths=earnings&updateMask.fieldPaths=expenses&updateMask.fieldPaths=notifications`;
      await fetch(metaUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            lastUpdated: { stringValue: nowIso },
            advocates: { stringValue: nowIso },
            earnings: { stringValue: nowIso },
            expenses: { stringValue: nowIso },
            notifications: { stringValue: nowIso }
          }
        })
      }).catch(() => {});
    } catch (e) {
      console.warn('Firestore cloud push error:', e);
    }
  }

  // Pull latest advocates, earnings, expenses, and notifications from Google Cloud Firestore
  public async pullFromFirestoreCloud(): Promise<void> {
    try {
      const pullDoc = async (docName: string, storageKey: string) => {
        try {
          const url = `${FIRESTORE_BASE}/settings/${docName}?key=${FIRESTORE_API_KEY}`;
          const res = await fetch(url);
          if (!res.ok) return;
          const doc = await res.json();
          const updatedAt = doc?.fields?.updatedAt?.stringValue || '';
          const rawData = doc?.fields?.data?.stringValue;
          if (rawData && updatedAt && updatedAt !== this.lastCloudTimestamps[docName]) {
            this.lastCloudTimestamps[docName] = updatedAt;
            const parsed = JSON.parse(rawData);
            if (Array.isArray(parsed)) {
              this.applyServerStoreData({
                [storageKey]: parsed
              });
            }
          }
        } catch (e) {
          console.warn(`Firestore pull error for ${docName}:`, e);
        }
      };

      await Promise.allSettled([
        pullDoc('vault_advocates', STORAGE_KEYS.ADVOCATES),
        pullDoc('vault_earnings', STORAGE_KEYS.EARNINGS),
        pullDoc('vault_expenses', STORAGE_KEYS.EXPENSES),
        pullDoc('vault_notifications', STORAGE_KEYS.NOTIFICATIONS)
      ]);
    } catch (e) {
      console.warn('Firestore cloud pull error:', e);
    }
  }

  private applyServerStoreData(serverData?: Record<string, unknown>): void {
    if (!serverData || typeof serverData !== 'object') return;
    this.isSyncingFromServer = true;
    let anyUpdated = false;
    try {
      const isPending = (item: any) => item && (item.status === 'PENDING' || item.status === 'PENDING_APPROVAL');

      for (const [k, v] of Object.entries(serverData)) {
        if (k === STORAGE_KEYS.CURRENT_USER || k === '_vault_version' || v === undefined) continue;
        const currentVal = this.get<unknown>(k, null);

        let finalVal: unknown = v;
        let shouldUpdate = false;

        // For Earnings, Expenses, and Notifications: Cloud Firestore holds the authoritative list
        if (
          k === STORAGE_KEYS.EARNINGS ||
          k === STORAGE_KEYS.EXPENSES ||
          k === STORAGE_KEYS.NOTIFICATIONS
        ) {
          if (Array.isArray(v)) {
            finalVal = v;
            shouldUpdate = JSON.stringify(finalVal) !== JSON.stringify(currentVal);
          }
        } else if (Array.isArray(currentVal) && Array.isArray(v)) {
          // Smart merge for Advocates & other collections
          const map = new Map<string, any>();
          for (const item of currentVal) {
            if (item && typeof item === 'object') {
              const uid = String(item.id || item.stateRegNo || item.barNo || item.licenseKey || JSON.stringify(item));
              map.set(uid, item);
            }
          }

          const newItems: any[] = [];
          for (const item of v) {
            if (item && typeof item === 'object') {
              const uid = String(item.id || item.stateRegNo || item.barNo || item.licenseKey || JSON.stringify(item));
              const localItem = map.get(uid);
              if (localItem) {
                // If local or server is APPROVED, preserve APPROVED status (unless explicitly rejected)
                let resolvedStatus = item.status || localItem.status;
                if (localItem.status === 'APPROVED' && item.status !== 'REJECTED') {
                  resolvedStatus = 'APPROVED';
                } else if (item.status === 'APPROVED') {
                  resolvedStatus = 'APPROVED';
                } else if (item.status === 'REJECTED' || localItem.status === 'REJECTED') {
                  resolvedStatus = 'REJECTED';
                }
                const resolvedPassword = item.password || localItem.password;
                map.set(uid, { ...localItem, ...item, status: resolvedStatus, password: resolvedPassword });
              } else {
                newItems.push(item);
              }
            }
          }

          // Prioritize pending registrations to the front of the list
          const combined: any[] = [];
          for (const item of newItems) {
            if (isPending(item)) combined.push(item);
          }
          for (const item of map.values()) {
            if (isPending(item)) combined.unshift(item);
            else combined.push(item);
          }
          for (const item of newItems) {
            if (!isPending(item)) combined.push(item);
          }

          const seen = new Set<string>();
          finalVal = combined.filter(item => {
            if (!item || typeof item !== 'object') return false;
            const uid = String(item.id || item.stateRegNo || item.barNo || item.licenseKey || JSON.stringify(item));
            if (seen.has(uid)) return false;
            seen.add(uid);
            return true;
          });

          shouldUpdate = JSON.stringify(finalVal) !== JSON.stringify(currentVal);
        } else {
          shouldUpdate = JSON.stringify(v) !== JSON.stringify(currentVal);
        }

        if (shouldUpdate) {
          this.set(k, finalVal);
          anyUpdated = true;
        }
      }
      if (anyUpdated) {
        window.dispatchEvent(new CustomEvent('crba_state_updated', { detail: { key: 'CLOUD_SYNC' } }));
      }
    } finally {
      this.isSyncingFromServer = false;
    }
  }

  // Initialize Default State
  public init() {
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      this.set(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ADVOCATES)) {
      this.set(STORAGE_KEYS.ADVOCATES, DEFAULT_ADVOCATES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CLIENTS)) {
      this.set(STORAGE_KEYS.CLIENTS, DEFAULT_CLIENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.EARNINGS)) {
      this.set(STORAGE_KEYS.EARNINGS, DEFAULT_EARNINGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.EXPENSES)) {
      this.set(STORAGE_KEYS.EXPENSES, DEFAULT_EXPENSES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.FINANCE_CATEGORIES)) {
      this.set(STORAGE_KEYS.FINANCE_CATEGORIES, DEFAULT_FINANCE_CATEGORIES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ELECTION_POSTS)) {
      this.set(STORAGE_KEYS.ELECTION_POSTS, DEFAULT_ELECTION_POSTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ELECTIONS)) {
      this.set(STORAGE_KEYS.ELECTIONS, DEFAULT_ELECTIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOMINATIONS)) {
      this.set(STORAGE_KEYS.NOMINATIONS, DEFAULT_NOMINATIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.VOTES)) {
      this.set(STORAGE_KEYS.VOTES, DEFAULT_VOTES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CAUSE_LIST)) {
      this.set(STORAGE_KEYS.CAUSE_LIST, DEFAULT_CAUSE_LIST);
    }
    if (!localStorage.getItem(STORAGE_KEYS.E_LIBRARY)) {
      this.set(STORAGE_KEYS.E_LIBRARY, DEFAULT_E_LIBRARY);
    }
    if (!localStorage.getItem(STORAGE_KEYS.COMMITTEE)) {
      this.set(STORAGE_KEYS.COMMITTEE, DEFAULT_COMMITTEE);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PROJECTS)) {
      this.set(STORAGE_KEYS.PROJECTS, DEFAULT_PROJECTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.GALLERY)) {
      this.set(STORAGE_KEYS.GALLERY, DEFAULT_GALLERY);
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      this.set(STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CHATS)) {
      this.set(STORAGE_KEYS.CHATS, DEFAULT_CHATS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.JUNIOR_SENIOR)) {
      this.set(STORAGE_KEYS.JUNIOR_SENIOR, DEFAULT_JUNIOR_SENIOR);
    }
    if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
      this.set(STORAGE_KEYS.REVIEWS, DEFAULT_REVIEWS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.EMERGENCY)) {
      this.set(STORAGE_KEYS.EMERGENCY, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.COURT_MASTERS)) {
      this.set(STORAGE_KEYS.COURT_MASTERS, DEFAULT_COURT_MASTERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CASE_STAGE_MASTERS)) {
      this.set(STORAGE_KEYS.CASE_STAGE_MASTERS, DEFAULT_CASE_STAGE_MASTERS);
    }

    // Start cross-device real-time cloud listeners & polling
    if (typeof window !== 'undefined') {
      this.setupRealtimeFirestoreListeners();
      this.syncWithServer(false);
      window.addEventListener('focus', () => this.syncWithServer(false));
      setInterval(() => this.syncWithServer(false), 3000);
    }
  }

  // Auth
  public getCurrentUser(): Advocate | null {
    return this.get<Advocate | null>(STORAGE_KEYS.CURRENT_USER, null);
  }

  public setCurrentUser(user: Advocate | null): void {
    this.set(STORAGE_KEYS.CURRENT_USER, user);
  }

  // Advocates
  public getAdvocates(): Advocate[] {
    const list = this.get<Advocate[]>(STORAGE_KEYS.ADVOCATES, DEFAULT_ADVOCATES);
    let changed = false;
    for (const def of DEFAULT_ADVOCATES) {
      const existingIdx = list.findIndex(
        a => a.id === def.id || (a.email && def.email && a.email.toLowerCase() === def.email.toLowerCase())
      );
      if (existingIdx === -1) {
        list.push(def);
        changed = true;
      } else if (def.role === 'super_admin' || def.email.toLowerCase() === 'nyaaysahayogi@gmail.com') {
        // Super Admin can never be rejected or demoted
        if (list[existingIdx].status !== 'APPROVED' || list[existingIdx].role !== 'super_admin') {
          list[existingIdx].status = 'APPROVED';
          list[existingIdx].role = 'super_admin';
          if (!list[existingIdx].password) {
            list[existingIdx].password = 'SuperAdmin@123';
          }
          changed = true;
        }
      }
    }
    if (changed) {
      this.set(STORAGE_KEYS.ADVOCATES, list);
    }
    return list;
  }

  public getAdvocateByBarNo(barNo: string): Advocate | undefined {
    if (!barNo) return undefined;
    const list = this.getAdvocates();
    const cleanBarNo = decodeURIComponent(barNo || '').trim().toLowerCase();
    return list.find(a => (a.barNo || '').toLowerCase() === cleanBarNo || (a.barNo || '').replace(/\//g, '-').toLowerCase() === cleanBarNo);
  }

  public getAdvocateById(id: string): Advocate | undefined {
    return this.getAdvocates().find(a => a.id === id);
  }

  public addAdvocate(advocate: Advocate): void {
    const list = this.getAdvocates();
    if (!advocate.tenantId) {
      advocate.tenantId = this.getCurrentTenant().id || 'tenant_ballia_01';
    }
    // Prevent duplicate entries by id or barNo
    const cleanNewBar = (advocate.barNo || '').trim().toLowerCase();
    const filtered = list.filter(a => a.id !== advocate.id && (!cleanNewBar || (a.barNo || '').trim().toLowerCase() !== cleanNewBar));
    filtered.unshift(advocate);
    this.set(STORAGE_KEYS.ADVOCATES, filtered);
    // Explicit instant sync with server across all devices
    this.syncWithServer(true).catch(() => {});
  }

  public updateAdvocate(advocateOrId: Advocate | string, partial?: Partial<Advocate>): void {
    const list = this.getAdvocates();
    const id = typeof advocateOrId === 'string' ? advocateOrId : advocateOrId.id;
    const idx = list.findIndex(a => a.id === id);
    if (idx !== -1) {
      if (typeof advocateOrId === 'string' && partial) {
        list[idx] = { ...list[idx], ...partial };
      } else if (typeof advocateOrId !== 'string') {
        list[idx] = advocateOrId;
      }
      this.set(STORAGE_KEYS.ADVOCATES, list);
      const cur = this.getCurrentUser();
      if (cur && cur.id === id) {
        this.setCurrentUser(list[idx]);
      }
      // Explicit instant sync with server across all devices
      this.syncWithServer(true).catch(() => {});
    }
  }

  public deleteAdvocate(id: string): void {
    const list = this.getAdvocates();
    const filtered = list.filter(a => a.id !== id);
    this.set(STORAGE_KEYS.ADVOCATES, filtered);
    const cur = this.getCurrentUser();
    if (cur && cur.id === id) {
      this.setCurrentUser(null);
    }
    this.syncWithServer(true).catch(() => {});
    window.dispatchEvent(new CustomEvent('crba_state_updated', { detail: { key: '_sys_vault_v2_advocates' } }));
  }

  // Clients
  public getClients(): Client[] {
    return this.get<Client[]>(STORAGE_KEYS.CLIENTS, DEFAULT_CLIENTS);
  }

  public getClientsByAdvocate(advocateId: string): Client[] {
    return this.getClients().filter(c => c.advocateId === advocateId);
  }

  public addClient(client: Client): void {
    const list = this.getClients();
    list.unshift(client);
    this.set(STORAGE_KEYS.CLIENTS, list);
  }

  public updateClient(clientOrId: Client | string, partial?: Partial<Client>): void {
    const list = this.getClients();
    const id = typeof clientOrId === 'string' ? clientOrId : clientOrId.id;
    const idx = list.findIndex(c => c.id === id);
    if (idx !== -1) {
      if (typeof clientOrId === 'string' && partial) {
        list[idx] = { ...list[idx], ...partial };
      } else if (typeof clientOrId !== 'string') {
        list[idx] = clientOrId;
      }
      this.set(STORAGE_KEYS.CLIENTS, list);
    }
  }

  public deleteClient(clientId: string): void {
    const list = this.getClients().filter(c => c.id !== clientId);
    this.set(STORAGE_KEYS.CLIENTS, list);
  }

  // Earnings
  public getEarnings(): Earning[] {
    return this.get<Earning[]>(STORAGE_KEYS.EARNINGS, DEFAULT_EARNINGS);
  }


  public addEarning(earning: Earning): void {
    const list = this.getEarnings();
    list.unshift(earning);
    this.set(STORAGE_KEYS.EARNINGS, list);
    this.syncWithServer(true).catch(() => {});
    window.dispatchEvent(new CustomEvent('crba_state_updated', { detail: { key: '_sys_vault_v2_earnings' } }));
  }

  public updateEarning(earning: Earning): void {
    const list = this.getEarnings();
    const idx = list.findIndex(e => e.id === earning.id);
    if (idx !== -1) {
      list[idx] = earning;
      this.set(STORAGE_KEYS.EARNINGS, list);
      this.syncWithServer(true).catch(() => {});
      window.dispatchEvent(new CustomEvent('crba_state_updated', { detail: { key: '_sys_vault_v2_earnings' } }));
    }
  }

  public deleteEarning(id: string): void {
    const list = this.getEarnings().filter(e => e.id !== id);
    this.set(STORAGE_KEYS.EARNINGS, list);
    this.syncWithServer(true).catch(() => {});
    window.dispatchEvent(new CustomEvent('crba_state_updated', { detail: { key: '_sys_vault_v2_earnings' } }));
  }

  // Expenses
  public getExpenses(): Expense[] {
    return this.get<Expense[]>(STORAGE_KEYS.EXPENSES, DEFAULT_EXPENSES);
  }

  public addExpense(expense: Expense): void {
    const list = this.getExpenses();
    list.unshift(expense);
    this.set(STORAGE_KEYS.EXPENSES, list);
    this.syncWithServer(true).catch(() => {});
    window.dispatchEvent(new CustomEvent('crba_state_updated', { detail: { key: '_sys_vault_v2_expenses' } }));
  }

  public updateExpense(expense: Expense): void {
    const list = this.getExpenses();
    const idx = list.findIndex(e => e.id === expense.id);
    if (idx !== -1) {
      list[idx] = expense;
      this.set(STORAGE_KEYS.EXPENSES, list);
      this.syncWithServer(true).catch(() => {});
      window.dispatchEvent(new CustomEvent('crba_state_updated', { detail: { key: '_sys_vault_v2_expenses' } }));
    }
  }

  public deleteExpense(id: string): void {
    const list = this.getExpenses().filter(e => e.id !== id);
    this.set(STORAGE_KEYS.EXPENSES, list);
    this.syncWithServer(true).catch(() => {});
    window.dispatchEvent(new CustomEvent('crba_state_updated', { detail: { key: '_sys_vault_v2_expenses' } }));
  }

  // Finance Categories (Editable Income / Expense categories)
  public getFinanceCategories(): FinanceCategory[] {
    return this.get<FinanceCategory[]>(STORAGE_KEYS.FINANCE_CATEGORIES, DEFAULT_FINANCE_CATEGORIES);
  }

  public getIncomeCategories(): FinanceCategory[] {
    return this.getFinanceCategories().filter(c => c.type === 'INCOME');
  }

  public getExpenseCategories(): FinanceCategory[] {
    return this.getFinanceCategories().filter(c => c.type === 'EXPENSE');
  }

  public addFinanceCategory(cat: FinanceCategory): void {
    const list = this.getFinanceCategories();
    list.push(cat);
    this.set(STORAGE_KEYS.FINANCE_CATEGORIES, list);
  }

  public updateFinanceCategory(cat: FinanceCategory): void {
    const list = this.getFinanceCategories();
    const idx = list.findIndex(c => c.id === cat.id);
    if (idx !== -1) {
      list[idx] = cat;
      this.set(STORAGE_KEYS.FINANCE_CATEGORIES, list);
    }
  }

  public deleteFinanceCategory(id: string): void {
    const list = this.getFinanceCategories().filter(c => c.id !== id);
    this.set(STORAGE_KEYS.FINANCE_CATEGORIES, list);
  }

  // Election Posts (Dynamic Election Category/Post Configuration)
  public getElectionPosts(): ElectionPost[] {
    return this.get<ElectionPost[]>(STORAGE_KEYS.ELECTION_POSTS, DEFAULT_ELECTION_POSTS)
      .map(p => ({ ...p, seatsCount: p.seatsCount ?? 1 }))
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  public addElectionPost(post: ElectionPost): void {
    const list = this.getElectionPosts();
    list.push(post);
    this.set(STORAGE_KEYS.ELECTION_POSTS, list);
  }

  public updateElectionPost(post: ElectionPost): void {
    const list = this.getElectionPosts();
    const idx = list.findIndex(p => p.id === post.id);
    if (idx !== -1) {
      list[idx] = post;
      this.set(STORAGE_KEYS.ELECTION_POSTS, list);
    }
  }

  public deleteElectionPost(id: string): void {
    const list = this.getElectionPosts().filter(p => p.id !== id);
    this.set(STORAGE_KEYS.ELECTION_POSTS, list);
  }

  // Elections
  public getElections(): Election[] {
    return this.get<Election[]>(STORAGE_KEYS.ELECTIONS, DEFAULT_ELECTIONS);
  }

  public addElection(election: Election): void {
    const list = this.getElections();
    list.unshift(election);
    this.set(STORAGE_KEYS.ELECTIONS, list);
  }

  public updateElection(election: Election): void {
    const list = this.getElections();
    const idx = list.findIndex(e => e.id === election.id);
    if (idx !== -1) {
      list[idx] = election;
      this.set(STORAGE_KEYS.ELECTIONS, list);
    }
  }

  // Nominations
  public getNominations(): Nomination[] {
    return this.get<Nomination[]>(STORAGE_KEYS.NOMINATIONS, DEFAULT_NOMINATIONS);
  }

  public addNomination(nomination: Nomination): void {
    const list = this.getNominations();
    list.unshift(nomination);
    this.set(STORAGE_KEYS.NOMINATIONS, list);
  }

  public updateNomination(nomination: Nomination): void {
    const list = this.getNominations();
    const idx = list.findIndex(n => n.id === nomination.id);
    if (idx !== -1) {
      list[idx] = nomination;
      this.set(STORAGE_KEYS.NOMINATIONS, list);
    }
  }

  // Votes & Election Candidates
  public getVotes(): Vote[] {
    return this.get<Vote[]>(STORAGE_KEYS.VOTES, DEFAULT_VOTES);
  }

  public getElectionCandidates(): ElectionCandidate[] {
    const defaultCandidates: ElectionCandidate[] = [
      {
        id: 'cand_01',
        name: 'Adv. Shri O. P. Singh',
        barNo: '1084/1990',
        post: 'PRESIDENT',
        photoUrl: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&auto=format&fit=crop&q=80',
        agenda: 'Digitization of Ballia Bar Library, Solar Inverter setup in Bar Hall & Free Med-Insurance for Junior Advocates',
        votesCount: 248
      },
      {
        id: 'cand_02',
        name: 'Adv. Arvind Kumar Tiwari',
        barNo: 'UP/4321/2005',
        post: 'PRESIDENT',
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
        agenda: 'Fast-track chamber allotment, New E-filing kiosks & Modern judicial auditorium in Ballia Court campus',
        votesCount: 215
      },
      {
        id: 'cand_03',
        name: 'Adv. Rakesh Kumar Pandey',
        barNo: '2415/2001',
        post: 'GENERAL_SECRETARY',
        photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
        agenda: 'Strict advocate protection act compliance, fast mutual aid loan fund & daily WhatsApp cause list broadcasts',
        votesCount: 310
      },
      {
        id: 'cand_04',
        name: 'Adv. Manoj Kumar Yadav',
        barNo: '8834/2012',
        post: 'GENERAL_SECRETARY',
        photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
        agenda: 'Revenue court streamline, computerized stamp vendor counter and junior training workshops',
        votesCount: 198
      },
      {
        id: 'cand_05',
        name: 'Adv. Smt. Vandana Tiwari',
        barNo: '5620/2007',
        post: 'SR_VICE_PRESIDENT',
        photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
        agenda: 'Dedicated women advocates lounge, legal aid clinic for domestic cases and digital cause list screens',
        votesCount: 280
      },
      {
        id: 'cand_06',
        name: 'Adv. Amit Kumar Verma',
        barNo: 'UP/8902/2012',
        post: 'TREASURER',
        photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
        agenda: '100% transparent online audit, Razorpay bar dues payment & zero-commission welfare fund ledger',
        votesCount: 265
      }
    ];

    return this.get<ElectionCandidate[]>(STORAGE_KEYS.ELECTION_CANDIDATES, defaultCandidates);
  }

  public addElectionCandidate(cand: ElectionCandidate): void {
    const list = this.getElectionCandidates();
    list.push(cand);
    this.set(STORAGE_KEYS.ELECTION_CANDIDATES, list);
  }

  public updateElectionCandidate(cand: ElectionCandidate): void {
    const list = this.getElectionCandidates();
    const idx = list.findIndex(c => c.id === cand.id);
    if (idx !== -1) {
      list[idx] = cand;
      this.set(STORAGE_KEYS.ELECTION_CANDIDATES, list);
    }
  }

  public deleteElectionCandidate(id: string): void {
    const list = this.getElectionCandidates().filter(c => c.id !== id);
    this.set(STORAGE_KEYS.ELECTION_CANDIDATES, list);
  }

  public resetElectionVotes(): void {
    const cands = this.getElectionCandidates().map(c => ({ ...c, votesCount: 0 }));
    this.set(STORAGE_KEYS.ELECTION_CANDIDATES, cands);
    this.set(STORAGE_KEYS.VOTES, []);
    // Clear vote flags
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith('crba_voted_')) {
        localStorage.removeItem(k);
      }
    });
  }

  public castVote(candidateIdOrVote: string | Vote, voterBarNo?: string): boolean {
    if (typeof candidateIdOrVote === 'string') {
      const candidateId = candidateIdOrVote;
      const bar = voterBarNo || 'UP/UNKNOWN';
      const cands = this.getElectionCandidates();
      const cand = cands.find(c => c.id === candidateId);
      if (!cand) return false;

      // Check if voted
      const votesKey = `crba_voted_${cand.post}_${bar}`;
      if (localStorage.getItem(votesKey)) {
        return false;
      }

      cand.votesCount = (cand.votesCount || 0) + 1;
      this.set('crba_election_candidates', cands);
      localStorage.setItem(votesKey, 'true');
      return true;
    } else {
      const vote = candidateIdOrVote;
      const list = this.getVotes();
      const existing = list.find(v => v.electionId === vote.electionId && v.voterId === vote.voterId && v.post === vote.post);
      if (existing) {
        return false;
      }
      list.push(vote);
      this.set(STORAGE_KEYS.VOTES, list);
      return true;
    }
  }

  // ==========================================
  // DISTRICT BAR ASSOCIATION ELECTION METHODS
  // ==========================================

  public getDistrictBarElectionConfig(): DistrictBarElectionConfig {
    return this.get<DistrictBarElectionConfig>(STORAGE_KEYS.DISTRICT_BAR_CONFIG, DEFAULT_DISTRICT_BAR_CONFIG);
  }

  public updateDistrictBarElectionConfig(cfgOrPartial: Partial<DistrictBarElectionConfig>): DistrictBarElectionConfig {
    const current = this.getDistrictBarElectionConfig();
    const updated = { ...current, ...cfgOrPartial };
    this.set(STORAGE_KEYS.DISTRICT_BAR_CONFIG, updated);
    return updated;
  }

  public toggleDistrictBarElectionStatus(newStatus: 'VotingOpen' | 'VotingClosed' | 'ResultsDeclared' | 'NominationsOpen' | 'Draft'): string {
    const cfg = this.getDistrictBarElectionConfig();
    cfg.status = newStatus;
    cfg.isEnabled = newStatus === 'VotingOpen';
    cfg.isVotingLive = newStatus === 'VotingOpen';
    this.set(STORAGE_KEYS.DISTRICT_BAR_CONFIG, cfg);
    return newStatus;
  }

  // ==========================================
  // STATE LEVEL BAR COUNCIL VOTING SYSTEM METHODS
  // ==========================================

  public getStateBarConfig(): StateBarElectionConfig {
    return this.get<StateBarElectionConfig>(STORAGE_KEYS.STATE_BAR_CONFIG, DEFAULT_STATE_BAR_CONFIG);
  }

  public updateStateBarConfig(cfg: StateBarElectionConfig): void {
    this.set(STORAGE_KEYS.STATE_BAR_CONFIG, cfg);
  }

  public getStateBarElectionConfig(): StateBarElectionConfig {
    return this.getStateBarConfig();
  }

  public updateStateBarElectionConfig(cfgOrPartial: Partial<StateBarElectionConfig>): StateBarElectionConfig {
    const current = this.getStateBarConfig();
    const updated = { ...current, ...cfgOrPartial };
    this.updateStateBarConfig(updated);
    return updated;
  }

  public getStateBarElectionStats() {
    const votes = this.getStateBarVotes();
    const roll = this.getStateBarVoterRoll();
    const cands = this.getStateBarElectionCandidates();
    const cfg = this.getStateBarConfig();
    const uniqueDistricts = new Set(roll.map(r => r.districtBar));
    return {
      totalVotesPolled: votes.length,
      totalVotersInRoll: roll.length,
      totalCandidates: cands.length,
      activeDistrictsCount: uniqueDistricts.size || 75,
      votingOpen: cfg.status === 'VotingOpen' && cfg.isEnabled
    };
  }

  public toggleStateBarEnabled(enabled?: boolean): boolean {
    const cfg = this.getStateBarConfig();
    const newStatus = typeof enabled === 'boolean' ? enabled : !cfg.isEnabled;
    cfg.isEnabled = newStatus;
    this.updateStateBarConfig(cfg);
    return newStatus;
  }

  public getStateBarElectionPosts(): StateBarElectionPost[] {
    return this.get<StateBarElectionPost[]>(STORAGE_KEYS.STATE_BAR_POSTS, DEFAULT_STATE_BAR_POSTS)
      .sort((a, b) => a.order - b.order);
  }

  public addStateBarElectionPost(post: StateBarElectionPost): void {
    const list = this.getStateBarElectionPosts();
    list.push(post);
    this.set(STORAGE_KEYS.STATE_BAR_POSTS, list);
  }

  public updateStateBarElectionPost(post: StateBarElectionPost): void {
    const list = this.getStateBarElectionPosts();
    const idx = list.findIndex(p => p.id === post.id);
    if (idx !== -1) {
      list[idx] = post;
      this.set(STORAGE_KEYS.STATE_BAR_POSTS, list);
    }
  }

  public deleteStateBarElectionPost(id: string): void {
    const list = this.getStateBarElectionPosts().filter(p => p.id !== id);
    this.set(STORAGE_KEYS.STATE_BAR_POSTS, list);
  }

  public getStateBarElectionCandidates(): StateBarElectionCandidate[] {
    return this.get<StateBarElectionCandidate[]>(STORAGE_KEYS.STATE_BAR_CANDIDATES, DEFAULT_STATE_BAR_CANDIDATES);
  }

  public addStateBarElectionCandidate(cand: StateBarElectionCandidate): void {
    const list = this.getStateBarElectionCandidates();
    list.push(cand);
    this.set(STORAGE_KEYS.STATE_BAR_CANDIDATES, list);
  }

  public updateStateBarElectionCandidate(cand: StateBarElectionCandidate): void {
    const list = this.getStateBarElectionCandidates();
    const idx = list.findIndex(c => c.id === cand.id);
    if (idx !== -1) {
      list[idx] = cand;
      this.set(STORAGE_KEYS.STATE_BAR_CANDIDATES, list);
    }
  }

  public deleteStateBarElectionCandidate(id: string): void {
    const list = this.getStateBarElectionCandidates().filter(c => c.id !== id);
    this.set(STORAGE_KEYS.STATE_BAR_CANDIDATES, list);
  }

  public getStateBarVotes(): StateBarVote[] {
    return this.get<StateBarVote[]>(STORAGE_KEYS.STATE_BAR_VOTES, []);
  }

  public getStateBarVoterRoll(): StateBarVoterEligibility[] {
    return this.get<StateBarVoterEligibility[]>(STORAGE_KEYS.STATE_BAR_VOTER_ROLL, DEFAULT_STATE_BAR_VOTER_ROLL);
  }

  public verifyStateBarVoter(
    stateRegNo: string,
    copNo: string,
    districtBar?: string
  ): { eligible: boolean; advocateName: string; districtBar: string; message: string; isCopValid: boolean } {
    const cleanReg = (stateRegNo || '').trim().toUpperCase();
    const cleanCop = (copNo || '').trim().toUpperCase();

    if (!cleanReg || !cleanCop) {
      return {
        eligible: false,
        advocateName: '',
        districtBar: districtBar || 'Unknown District Bar',
        message: 'Please provide both State Bar Council Registration No. and COP (Certificate of Practice) Number.',
        isCopValid: false
      };
    }

    // 1. Check in State Bar Voter Roll
    const voterRoll = this.getStateBarVoterRoll();
    const matchedRoll = voterRoll.find(v => {
      const matchReg = v.stateRegNo.toUpperCase() === cleanReg || v.stateRegNo.replace(/^UP\//, '').toUpperCase() === cleanReg.replace(/^UP\//, '');
      const matchCop = v.copNo.toUpperCase() === cleanCop || v.copNo.replace(/^COP\/UP\//, '').toUpperCase() === cleanCop.replace(/^COP\/UP\//, '');
      return matchReg || matchCop;
    });

    if (matchedRoll) {
      if (matchedRoll.status !== 'APPROVED') {
        return {
          eligible: false,
          advocateName: matchedRoll.advocateName,
          districtBar: matchedRoll.districtBar,
          message: `Advocate registration is currently ${matchedRoll.status}. Only verified practitioners are eligible to vote.`,
          isCopValid: matchedRoll.isCopValid
        };
      }
      return {
        eligible: true,
        advocateName: matchedRoll.advocateName,
        districtBar: matchedRoll.districtBar,
        message: 'Verified Active State Bar Practitioner with valid Certificate of Practice (COP).',
        isCopValid: true
      };
    }

    // 2. Check in Local / Enrolled Advocates Store
    const advocates = this.getAdvocates();
    const matchedAdv = advocates.find(a => {
      const advBar = (a.barNo || '').toUpperCase();
      const advCop = (a.copNo || '').toUpperCase();
      const matchReg = advBar === cleanReg || advBar.replace(/^UP\//, '') === cleanReg.replace(/^UP\//, '');
      const matchCop = advCop === cleanCop || advCop.replace(/^COP\/UP\//, '') === cleanCop.replace(/^COP\/UP\//, '');
      return matchReg || matchCop;
    });

    if (matchedAdv) {
      if (matchedAdv.status !== 'APPROVED') {
        return {
          eligible: false,
          advocateName: matchedAdv.name,
          districtBar: `${matchedAdv.address?.district || 'Ballia'} Bar Association`,
          message: `Advocate profile status is ${matchedAdv.status}. Must be approved for voting.`,
          isCopValid: !!matchedAdv.copNo
        };
      }
      return {
        eligible: true,
        advocateName: matchedAdv.name,
        districtBar: `${matchedAdv.address?.district || 'Ballia'} Bar Association`,
        message: 'Verified Active State Bar Practitioner via District Bar records.',
        isCopValid: true
      };
    }

    // 3. Fallback verification: If formatted properly (e.g. UP/XXXX/YYYY and COP/...)
    // allow practicing members from other 74 districts of UP
    const isValidFormat = (cleanReg.includes('/') || cleanReg.length >= 4) && (cleanCop.includes('/') || cleanCop.length >= 4);
    if (isValidFormat) {
      const detectedDistrict = districtBar || 'District Bar Association';
      return {
        eligible: true,
        advocateName: `Adv. Member (${cleanReg})`,
        districtBar: detectedDistrict,
        message: `Verified State Bar Council Registered Advocate (${detectedDistrict}).`,
        isCopValid: true
      };
    }

    return {
      eligible: false,
      advocateName: '',
      districtBar: districtBar || 'Unknown District Bar',
      message: 'Invalid State Bar Council Registration or COP Number format. Please enter as UP/XXXX/YYYY and COP/UP/YYYY/XXXX.',
      isCopValid: false
    };
  }

  public hasVotedStatePost(stateRegNo: string, copNo: string, postKey: string): boolean {
    const cleanReg = (stateRegNo || '').trim().toUpperCase();
    const cleanCop = (copNo || '').trim().toUpperCase();
    const key = `sb_voted_${postKey}_${cleanReg}_${cleanCop}`;
    if (localStorage.getItem(key)) return true;

    const votes = this.getStateBarVotes();
    return votes.some(v => 
      v.postKey === postKey && 
      (v.voterStateRegNo.toUpperCase() === cleanReg || v.voterCopNo.toUpperCase() === cleanCop)
    );
  }

  public castStateBarVote(data: {
    candidateId: string;
    postKey: string;
    voterStateRegNo: string;
    voterCopNo: string;
    voterDistrictBar: string;
    voterName: string;
  }): { success: boolean; message: string; ballotHash?: string; receipt?: any } {
    const { candidateId, postKey, voterStateRegNo, voterCopNo, voterDistrictBar, voterName } = data;
    const cleanReg = (voterStateRegNo || '').trim().toUpperCase();
    const cleanCop = (voterCopNo || '').trim().toUpperCase();

    if (!cleanReg || !cleanCop) {
      return {
        success: false,
        message: 'State Bar Registration No. and COP No. are mandatory to cast a digital state ballot.'
      };
    }

    // Check if already voted
    if (this.hasVotedStatePost(cleanReg, cleanCop, postKey)) {
      return {
        success: false,
        message: `Voter with State Reg "${cleanReg}" / COP "${cleanCop}" has already cast a ballot for this post.`
      };
    }

    const cands = this.getStateBarElectionCandidates();
    const cand = cands.find(c => c.id === candidateId);
    if (!cand) {
      return {
        success: false,
        message: 'Selected State Bar Council candidate record was not found.'
      };
    }

    // Increment vote count & district breakdown
    cand.votesCount = (cand.votesCount || 0) + 1;
    if (!cand.districtVoteBreakdown) cand.districtVoteBreakdown = {};
    cand.districtVoteBreakdown[voterDistrictBar] = (cand.districtVoteBreakdown[voterDistrictBar] || 0) + 1;
    this.set(STORAGE_KEYS.STATE_BAR_CANDIDATES, cands);

    // Generate cryptographic ballot receipt hash
    const ts = new Date().toISOString();
    const hashPayload = `${cleanReg}|${cleanCop}|${postKey}|${candidateId}|${voterDistrictBar}|${ts}`;
    let hash = 0;
    for (let i = 0; i < hashPayload.length; i++) {
      const char = hashPayload.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    const ballotHash = 'SBC-' + Math.abs(hash).toString(16).toUpperCase().padStart(8, '0') + '-' + Math.floor(1000 + Math.random() * 9000);

    const voteRecord: StateBarVote = {
      id: 'sbv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      postKey,
      candidateId,
      candidateName: cand.name,
      voterStateRegNo: cleanReg,
      voterCopNo: cleanCop,
      voterDistrictBar,
      voterName: voterName || 'Learned Advocate',
      ballotHash,
      timestamp: new Date().toLocaleString('en-IN')
    };

    const votes = this.getStateBarVotes();
    votes.push(voteRecord);
    this.set(STORAGE_KEYS.STATE_BAR_VOTES, votes);

    // Save vote flag in localStorage
    const localKey = `sb_voted_${postKey}_${cleanReg}_${cleanCop}`;
    localStorage.setItem(localKey, 'true');

    return {
      success: true,
      message: `Digital ballot for "${cand.name}" (${postKey}) successfully recorded in State Bar Council digital vault.`,
      ballotHash,
      receipt: voteRecord
    };
  }

  public resetStateBarVotes(): void {
    const cands = this.getStateBarElectionCandidates().map(c => ({
      ...c,
      votesCount: 0,
      districtVoteBreakdown: {}
    }));
    this.set(STORAGE_KEYS.STATE_BAR_CANDIDATES, cands);
    this.set(STORAGE_KEYS.STATE_BAR_VOTES, []);
    // Clear state bar vote local flags
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith('sb_voted_')) {
        localStorage.removeItem(k);
      }
    });
  }

  public addStateBarVoter(voter: StateBarVoterEligibility): void {
    const roll = this.getStateBarVoterRoll();
    const cleanReg = (voter.stateRegNo || '').trim().toUpperCase();
    const existingIdx = roll.findIndex(v => v.stateRegNo.toUpperCase() === cleanReg);
    if (existingIdx !== -1) {
      roll[existingIdx] = voter;
    } else {
      roll.unshift(voter);
    }
    this.set(STORAGE_KEYS.STATE_BAR_VOTER_ROLL, roll);
  }

  public updateStateBarVoter(stateRegNo: string, updated: Partial<StateBarVoterEligibility>): void {
    const roll = this.getStateBarVoterRoll();
    const cleanReg = (stateRegNo || '').trim().toUpperCase();
    const idx = roll.findIndex(v => v.stateRegNo.toUpperCase() === cleanReg);
    if (idx !== -1) {
      roll[idx] = { ...roll[idx], ...updated };
      this.set(STORAGE_KEYS.STATE_BAR_VOTER_ROLL, roll);
    }
  }

  public deleteStateBarVoter(stateRegNo: string): void {
    const roll = this.getStateBarVoterRoll();
    const cleanReg = (stateRegNo || '').trim().toUpperCase();
    const filtered = roll.filter(v => v.stateRegNo.toUpperCase() !== cleanReg);
    this.set(STORAGE_KEYS.STATE_BAR_VOTER_ROLL, filtered);
  }

  public toggleStateBarVoterCop(stateRegNo: string): boolean {
    const roll = this.getStateBarVoterRoll();
    const cleanReg = (stateRegNo || '').trim().toUpperCase();
    const idx = roll.findIndex(v => v.stateRegNo.toUpperCase() === cleanReg);
    if (idx !== -1) {
      roll[idx].isCopValid = !roll[idx].isCopValid;
      this.set(STORAGE_KEYS.STATE_BAR_VOTER_ROLL, roll);
      return roll[idx].isCopValid;
    }
    return false;
  }

  public hasAdvocateVotedAnyStatePost(stateRegNo: string, copNo?: string): boolean {
    const cleanReg = (stateRegNo || '').trim().toUpperCase();
    const cleanCop = (copNo || '').trim().toUpperCase();
    const votes = this.getStateBarVotes();
    return votes.some(v => 
      (cleanReg && v.voterStateRegNo.toUpperCase() === cleanReg) ||
      (cleanCop && v.voterCopNo.toUpperCase() === cleanCop)
    );
  }

  public getStateVotesByVoter(stateRegNo: string, copNo?: string): StateBarVote[] {
    const cleanReg = (stateRegNo || '').trim().toUpperCase();
    const cleanCop = (copNo || '').trim().toUpperCase();
    const votes = this.getStateBarVotes();
    return votes.filter(v => 
      (cleanReg && v.voterStateRegNo.toUpperCase() === cleanReg) ||
      (cleanCop && v.voterCopNo.toUpperCase() === cleanCop)
    );
  }

  public broadcastStateElectionLiveNotification(isOn: boolean): void {
    const cfg = this.getStateBarConfig();
    if (isOn) {
      this.addNotification({
        id: 'notif_sb_live_' + Date.now(),
        title: '🏛️ राज्य बार काउंसिल सामान्य निर्वाचन 2026-2027: E-VOTING ACTIVE',
        message: `Bar Council of Uttar Pradesh General Election is now LIVE across all 75 District Bar Associations. All verified advocate voters with active COP can cast their digital ballots.`,
        targetRole: 'all',
        isRead: false,
        createdAt: new Date().toLocaleDateString('en-GB')
      });
    } else {
      this.addNotification({
        id: 'notif_sb_close_' + Date.now(),
        title: '🏛️ State Bar Council Voting Window Update',
        message: `State Bar Council Election voting status has been updated to: ${cfg.status}.`,
        targetRole: 'all',
        isRead: false,
        createdAt: new Date().toLocaleDateString('en-GB')
      });
    }
  }

  public setAdvocateStatusByStateBar(stateRegNo: string, newStatus: 'ACTIVE' | 'HOLD' | 'SUSPENDED'): void {
    const cleanReg = (stateRegNo || '').trim().toUpperCase();
    
    // 1. Update State Bar Voter Roll
    const roll = this.getStateBarVoterRoll();
    const idx = roll.findIndex(v => v.stateRegNo.toUpperCase() === cleanReg);
    if (idx !== -1) {
      roll[idx].status = newStatus;
      roll[idx].isCopValid = newStatus === 'ACTIVE';
      this.set(STORAGE_KEYS.STATE_BAR_VOTER_ROLL, roll);
    }

    // 2. Sync with matching Advocate in Advocates store
    const advocates = this.getAdvocates();
    const advIdx = advocates.findIndex(a => (a.barNo || '').toUpperCase() === cleanReg);
    if (advIdx !== -1) {
      const advStatus = newStatus === 'ACTIVE' ? 'APPROVED' : newStatus === 'HOLD' ? 'PENDING_APPROVAL' : 'REJECTED';
      advocates[advIdx].status = advStatus;
      this.set(STORAGE_KEYS.ADVOCATES, advocates);
    }
  }

  public bulkSetDistrictAdvocatesStatus(districtName: string, newStatus: 'ACTIVE' | 'HOLD' | 'SUSPENDED'): number {
    const cleanDist = (districtName || '').trim().toLowerCase();
    const roll = this.getStateBarVoterRoll();
    let count = 0;
    
    roll.forEach(v => {
      if (cleanDist === 'all' || v.districtBar.toLowerCase().includes(cleanDist)) {
        v.status = newStatus;
        v.isCopValid = newStatus === 'ACTIVE';
        count++;
        
        // Sync with advocate store
        const advocates = this.getAdvocates();
        const advIdx = advocates.findIndex(a => (a.barNo || '').toUpperCase() === v.stateRegNo.toUpperCase());
        if (advIdx !== -1) {
          advocates[advIdx].status = newStatus === 'ACTIVE' ? 'APPROVED' : newStatus === 'HOLD' ? 'PENDING_APPROVAL' : 'REJECTED';
          this.set(STORAGE_KEYS.ADVOCATES, advocates);
        }
      }
    });

    this.set(STORAGE_KEYS.STATE_BAR_VOTER_ROLL, roll);
    return count;
  }

  public enrollNewAdvocateAtStateBar(data: {
    advocateName: string;
    hindiName?: string;
    stateRegNo?: string;
    copNo?: string;
    districtBar: string;
    tahsil?: string;
    mobile?: string;
    email?: string;
    fatherName?: string;
    dob?: string;
    chamberNo?: string;
    specialization?: string[];
    experienceYears?: number;
    photoUrl?: string;
  }): { stateRegNo: string; copNo: string } {
    const year = new Date().getFullYear();
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const assignedRegNo = (data.stateRegNo || `UP/${randNum}/${year}`).trim().toUpperCase();
    const assignedCopNo = (data.copNo || `COP/UP/${year}/${randNum}`).trim().toUpperCase();

    // 1. Add to State Bar Roll
    const voter: StateBarVoterEligibility = {
      id: 'sb_voter_' + Date.now(),
      stateRegNo: assignedRegNo,
      copNo: assignedCopNo,
      advocateName: data.advocateName.trim(),
      hindiName: data.hindiName?.trim(),
      districtBar: data.districtBar.trim(),
      tahsil: data.tahsil?.trim() || `${data.districtBar} Sadar`,
      mobile: data.mobile?.trim() || '9415000000',
      email: data.email?.trim() || `${assignedRegNo.replace(/\//g, '_').toLowerCase()}@upbarcouncil.org`,
      chamberNo: data.chamberNo?.trim() || `Bar Hall, ${data.districtBar}`,
      experienceYears: data.experienceYears || 5,
      specialization: data.specialization || ['CIVIL', 'CRIMINAL', 'REVENUE'],
      photoUrl: data.photoUrl || 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&auto=format&fit=crop&q=80',
      isCopValid: true,
      status: 'ACTIVE',
      votingStatus: 'PENDING'
    };
    this.addStateBarVoter(voter);

    // 2. Also register in Advocate records so they can immediately be found/login/practice in their District Bar
    const newAdv: import('../types').Advocate = {
      id: 'adv_' + Date.now(),
      name: data.advocateName.trim(),
      fatherName: data.fatherName?.trim() || 'Advocate Guardian',
      dob: data.dob || '01/01/1990',
      age: 36,
      address: {
        village: data.districtBar,
        post: data.districtBar,
        tahsil: data.tahsil || `${data.districtBar} Sadar`,
        policeStation: 'Kotwali',
        district: data.districtBar,
        state: 'Uttar Pradesh',
        pincode: '277001'
      },
      barNo: assignedRegNo,
      copNo: assignedCopNo,
      mobile: data.mobile || '9415000000',
      email: data.email || `${assignedRegNo.replace(/\//g, '_').toLowerCase()}@upbarcouncil.org`,
      password: 'Advocate@123',
      photoUrl: voter.photoUrl || '',
      status: 'APPROVED',
      role: 'advocate',
      validTill: `31/12/${year + 5}`,
      createdAt: new Date().toLocaleDateString('en-GB'),
      rating: 5.0,
      reviewsCount: 0,
      specialization: (data.specialization as import('../types').SpecializationType[]) || ['CIVIL', 'CRIMINAL'],
      chamberNo: voter.chamberNo,
      experienceYears: voter.experienceYears,
      bio: `Enrolled Advocate on State Roll of Bar Council of Uttar Pradesh. Enrollment No: ${assignedRegNo}. District Bar: ${data.districtBar}.`
    };
    this.addAdvocate(newAdv);

    return { stateRegNo: assignedRegNo, copNo: assignedCopNo };
  }

  // Legal Resources / e-Library
  public getLegalResources(): import('../types').LegalResource[] {
    const defaultResources: import('../types').LegalResource[] = [
      {
        id: 'lr_01',
        title: 'Bharatiya Nyaya Sanhita (BNS 2023) vs IPC 1860 Key Mapping',
        actName: 'BNS 2023',
        category: 'CRIMINAL',
        sections: 'Sec 103 (Murder), Sec 115 (Grievous Hurt), Sec 303 (Theft)',
        summary: 'Direct reference mapping of old Indian Penal Code sections to the newly enacted Bharatiya Nyaya Sanhita 2023 with essential elements and legal ingredients.',
        content: `BHARATIYA NYAYA SANHITA (BNS 2023) CORRESPONDING SECTIONS:
- Murder: IPC Sec 302 -> BNS Sec 103(1) [Punishment for Murder]
- Attempt to Murder: IPC Sec 307 -> BNS Sec 109
- Culpable Homicide: IPC Sec 304 -> BNS Sec 105
- Simple Hurt: IPC Sec 323 -> BNS Sec 115(2)
- Grievous Hurt: IPC Sec 325 -> BNS Sec 117(2)
- Rape: IPC Sec 376 -> BNS Sec 64
- Cheating: IPC Sec 420 -> BNS Sec 318(4)
- Forgery: IPC Sec 467/468 -> BNS Sec 336/338
- Criminal Intimidation: IPC Sec 506 -> BNS Sec 351(2)`
      },
      {
        id: 'lr_02',
        title: 'UP Revenue Code 2006 - Mutation, Demarcation & Partition Procedures',
        actName: 'UP Revenue Code',
        category: 'REVENUE',
        sections: 'Section 24 (Haddbandi), Section 34 (Dakhil Kharij), Section 116 (Batwara)',
        summary: 'Standard legal grounds, limitation periods, and statutory forums under the UP Revenue Code 2006 for revenue courts in Ballia (Tahsildar, SDM, Collector).',
        content: `UP REVENUE CODE 2006 - KEY PROVISIONS FOR REVENUE COURTS:
1. Section 34 (Report regarding succession or transfer / नामांतरण / दाखिल खारिज):
   - Forum: Court of Tehsildar / Naib Tehsildar
   - Statutory Period: 30 days for undisputed, 90 days for disputed cases.
   - Requirement: Registered deed / Registered Will / Family settlement + Khatauni extract.

2. Section 24 (Demarcation of boundaries / हदबंदी / पत्थरगड्डी):
   - Forum: Sub-Divisional Officer (SDM Sadar / Bansdih / Rasra / Bairia)
   - Fee: Chalan fee of ₹1000 per Gata number.
   - Procedure: Measurement by Revenue Inspector (RI) and Amin report.

3. Section 116 (Partition of holding / जोत का विभाजन / बंटवारा):
   - Forum: Court of Sub-Divisional Officer (SDM)
   - Parties: All co-tenure holders (सहखातेदार) + Gaon Sabha.
   - Preliminary decree followed by Qura (फांटा) submission by Lekhpal and final decree.`
      },
      {
        id: 'lr_03',
        title: 'Regular Bail Application Format under Section 439 CrPC / Sec 483 BNSS',
        actName: 'BNSS 2023 / CrPC',
        category: 'FORMATS',
        sections: 'Section 483 BNSS (Sec 439 CrPC)',
        summary: 'Ready-to-use bail application template for District & Sessions Court, Ballia with grounds of false implication, parity, and clean antecedents.',
        content: `IN THE COURT OF LEARNED SESSIONS JUDGE, BALLIA (U.P.)
Bail Application No. ________ / 2026

In the Matter of:
[Applicant Name], S/o [Father Name], R/o [Village, Police Station], District Ballia.
... Applicant / Accused
VERSUS
State of Uttar Pradesh through Police Station [P.S. Name], District Ballia.
... Opposite Party

APPLICATION FOR REGULAR BAIL UNDER SECTION 483 OF BHARATIYA NAGARIK SURAKSHA SANHITA (BNSS) / SEC 439 CrPC

The applicant most respectfully begs to state as follows:
1. That the applicant is an innocent law-abiding citizen and has been falsely implicated in Case Crime No. [___/2026], under Sections [___] P.S. [___], District Ballia.
2. That the FIR is delayed by [__] days without any cogent explanation.
3. That no specific role has been assigned to the applicant and general omnibus allegations have been leveled.
4. That the applicant has no previous criminal history and has been languishing in District Jail Ballia since [__/__/2026].
5. That co-accused [___] having similar role has already been granted bail by this Hon'ble Court.

PRAYER: It is therefore prayed that this Hon'ble Court may graciously be pleased to enlarge the applicant on bail during trial.
Advocate for Applicant: [Advocate Name], Criminal & Revenue Bar Association, Ballia.`
      },
      {
        id: 'lr_04',
        title: 'Temporary Injunction Application under Order 39 Rule 1 & 2 CPC',
        actName: 'Civil Procedure Code',
        category: 'CIVIL',
        sections: 'Order 39 Rule 1 & 2 CPC read with Sec 151 CPC',
        summary: 'Standard civil stay application format before Civil Judge (Senior/Junior Division) Ballia for restraining interference in peaceful possession.',
        content: `IN THE COURT OF LEARNED CIVIL JUDGE (SENIOR DIVISION), BALLIA
Original Suit No. _______ / 2026

[Plaintiff Name] vs. [Defendant Name]

APPLICATION FOR TEMPORARY INJUNCTION UNDER ORDER 39 RULES 1 & 2 R/W SECTION 151 C.P.C.

1. That the plaintiff is the absolute owner in possession of the suit property detailed in Schedule A.
2. That the defendants with muscle-men threatened to dispossess the plaintiff illegally on [Date].
3. Prima Facie Case, Balance of Convenience, and Irreparable Injury are all strongly in favor of the plaintiff.

PRAYER: Restrain defendants from altering nature of suit land or dispossessing plaintiff till disposal of suit.`
      }
    ];

    return this.get<import('../types').LegalResource[]>('crba_legal_resources', defaultResources);
  }

  public addLegalResource(resource: import('../types').LegalResource): void {
    const list = this.getLegalResources();
    const idx = list.findIndex(r => r.id === resource.id);
    if (idx !== -1) {
      list[idx] = resource;
    } else {
      list.unshift(resource);
    }
    this.set('crba_legal_resources', list);
  }

  public deleteLegalResource(id: string): void {
    const list = this.getLegalResources().filter(r => r.id !== id);
    this.set('crba_legal_resources', list);
  }

  public clearAllLegalResources(): void {
    this.set('crba_legal_resources', []);
  }

  // Office Bearers
  public getOfficeBearers(): import('../types').OfficeBearer[] {
    const defaultBearers: import('../types').OfficeBearer[] = [
      {
        id: 'ob_01',
        name: 'Shri O. P. Singh',
        designation: 'President',
        hindiDesignation: 'अध्यक्ष',
        barNo: '1084/1990',
        mobile: '9415988800',
        photoUrl: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&auto=format&fit=crop&q=80',
        tenure: '2025 - 2027'
      },
      {
        id: 'ob_02',
        name: 'Adv. Smt. Vandana Tiwari',
        designation: 'Senior Vice President',
        hindiDesignation: 'वरिष्ठ उपाध्यक्ष',
        barNo: '5620/2007',
        mobile: '9450876543',
        photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
        tenure: '2025 - 2027'
      },
      {
        id: 'ob_03',
        name: 'Adv. Rakesh Kumar Pandey',
        designation: 'General Secretary',
        hindiDesignation: 'महासचिव',
        barNo: '2415/2001',
        mobile: '9839123456',
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
        tenure: '2025 - 2027'
      },
      {
        id: 'ob_04',
        name: 'Adv. Amit Kumar Verma',
        designation: 'Treasurer',
        hindiDesignation: 'कोषाध्यक्ष',
        barNo: 'UP/8902/2012',
        mobile: '9415234567',
        photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
        tenure: '2025 - 2027'
      }
    ];

    return this.get<import('../types').OfficeBearer[]>('crba_office_bearers', defaultBearers);
  }

  // Mentorship Openings
  public getMentorshipOpenings(): import('../types').MentorshipOpening[] {
    const defaultOpenings: import('../types').MentorshipOpening[] = [
      {
        id: 'mo_01',
        seniorName: 'Adv. Shri O. P. Singh (Senior Counsel)',
        seniorBarNo: '1084/1990',
        specialization: ['Criminal Sessions Trials', 'UP Revenue Code Appeals'],
        stipend: '₹ 8,500 / Month + Court Brief Share',
        vacancies: 2,
        chamberNo: 'Chamber 12, Senior Bar Block, Ballia Court',
        requirements: 'LLB/LLM Freshers or 1-2 years practice enrolled in UP Bar. Strong passion for cross-examination and trial drafting.',
        applicantsCount: 4
      },
      {
        id: 'mo_02',
        seniorName: 'Adv. Rakesh Kumar Pandey (General Secretary)',
        seniorBarNo: '2415/2001',
        specialization: ['Bail Applications', 'NDPS Act', 'Gangster Act'],
        stipend: '₹ 7,000 / Month',
        vacancies: 3,
        chamberNo: 'Chamber 28, Criminal Annex',
        requirements: 'Dedicated junior advocate for drafting bail bonds, case diary inspection, and filing before CJM & Sessions courts.',
        applicantsCount: 6
      }
    ];

    return this.get<import('../types').MentorshipOpening[]>('crba_mentorship_openings', defaultOpenings);
  }

  public addMentorshipOpening(opening: import('../types').MentorshipOpening): void {
    const list = this.getMentorshipOpenings();
    const idx = list.findIndex(o => o.id === opening.id);
    if (idx !== -1) {
      list[idx] = opening;
    } else {
      list.unshift(opening);
    }
    this.set('crba_mentorship_openings', list);
  }


  // Cause List
  public getCauseList(): CauseListItem[] {
    return this.get<CauseListItem[]>(STORAGE_KEYS.CAUSE_LIST, DEFAULT_CAUSE_LIST);
  }

  public addCauseListItem(item: CauseListItem): void {
    const list = this.getCauseList();
    list.unshift(item);
    this.set(STORAGE_KEYS.CAUSE_LIST, list);
  }

  public deleteCauseListItem(id: string): void {
    const list = this.getCauseList().filter(i => i.id !== id);
    this.set(STORAGE_KEYS.CAUSE_LIST, list);
  }

  // e-Library
  public getELibrary(): ELibraryItem[] {
    return this.get<ELibraryItem[]>(STORAGE_KEYS.E_LIBRARY, DEFAULT_E_LIBRARY);
  }

  public addELibraryItem(item: ELibraryItem): void {
    const list = this.getELibrary();
    list.unshift(item);
    this.set(STORAGE_KEYS.E_LIBRARY, list);
  }

  // Committee (Executive Committee / प्रबंधकारिणी समिति)
  public getCommittee(): CommitteeMember[] {
    return this.get<CommitteeMember[]>(STORAGE_KEYS.COMMITTEE, DEFAULT_COMMITTEE)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  public addCommitteeMember(member: CommitteeMember): void {
    const list = this.getCommittee();
    list.push(member);
    this.set(STORAGE_KEYS.COMMITTEE, list);
  }

  public updateCommitteeMember(member: CommitteeMember): void {
    const list = this.getCommittee();
    const idx = list.findIndex(m => m.id === member.id);
    if (idx !== -1) {
      list[idx] = member;
      this.set(STORAGE_KEYS.COMMITTEE, list);
    }
  }

  public deleteCommitteeMember(id: string): void {
    const list = this.getCommittee().filter(m => m.id !== id);
    this.set(STORAGE_KEYS.COMMITTEE, list);
  }

  // Projects
  public getProjects(): Project[] {
    return this.get<Project[]>(STORAGE_KEYS.PROJECTS, DEFAULT_PROJECTS);
  }

  public addProject(project: Project): void {
    const list = this.getProjects();
    list.unshift(project);
    this.set(STORAGE_KEYS.PROJECTS, list);
  }

  // Gallery
  public getGallery(): GalleryItem[] {
    return this.get<GalleryItem[]>(STORAGE_KEYS.GALLERY, DEFAULT_GALLERY);
  }

  public addGalleryItem(item: GalleryItem): void {
    const list = this.getGallery();
    list.unshift(item);
    this.set(STORAGE_KEYS.GALLERY, list);
  }

  // Notifications
  public getNotifications(): NotificationItem[] {
    return this.get<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS);
  }

  public addNotification(notification: NotificationItem): void {
    const list = this.getNotifications();
    list.unshift(notification);
    this.set(STORAGE_KEYS.NOTIFICATIONS, list);
    this.syncWithServer(true).catch(() => {});
    window.dispatchEvent(new CustomEvent('crba_state_updated', { detail: { key: '_sys_vault_v2_notifications' } }));
  }

  public markNotificationAsRead(id: string): void {
    const list = this.getNotifications();
    const idx = list.findIndex(n => n.id === id);
    if (idx !== -1) {
      list[idx].isRead = true;
      this.set(STORAGE_KEYS.NOTIFICATIONS, list);
      this.syncWithServer(true).catch(() => {});
      window.dispatchEvent(new CustomEvent('crba_state_updated', { detail: { key: '_sys_vault_v2_notifications' } }));
    }
  }

  public deleteNotification(id: string): void {
    const list = this.getNotifications().filter(n => n.id !== id);
    this.set(STORAGE_KEYS.NOTIFICATIONS, list);
    this.syncWithServer(true).catch(() => {});
    window.dispatchEvent(new CustomEvent('crba_state_updated', { detail: { key: '_sys_vault_v2_notifications' } }));
  }

  // Chats
  public getChats(user1Id: string, user2Id: string): ChatMessage[] {
    const all = this.get<ChatMessage[]>(STORAGE_KEYS.CHATS, DEFAULT_CHATS);
    return all.filter(
      c => (c.senderId === user1Id && c.receiverId === user2Id) || (c.senderId === user2Id && c.receiverId === user1Id)
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  public sendChatMessage(message: ChatMessage): void {
    const all = this.get<ChatMessage[]>(STORAGE_KEYS.CHATS, DEFAULT_CHATS);
    all.push(message);
    this.set(STORAGE_KEYS.CHATS, all);
  }

  // Junior-Senior Connect
  public getJuniorSeniorPosts(): JuniorSeniorPost[] {
    return this.get<JuniorSeniorPost[]>(STORAGE_KEYS.JUNIOR_SENIOR, DEFAULT_JUNIOR_SENIOR);
  }

  public addJuniorSeniorPost(post: JuniorSeniorPost): void {
    const list = this.getJuniorSeniorPosts();
    list.unshift(post);
    this.set(STORAGE_KEYS.JUNIOR_SENIOR, list);
  }

  // Reviews
  public getReviews(): AdvocateReview[] {
    return this.get<AdvocateReview[]>(STORAGE_KEYS.REVIEWS, DEFAULT_REVIEWS);
  }

  public addReview(review: AdvocateReview): void {
    const list = this.getReviews();
    list.unshift(review);
    this.set(STORAGE_KEYS.REVIEWS, list);

    // Update advocate average rating
    const advocateReviews = list.filter(r => r.advocateId === review.advocateId);
    const avg = advocateReviews.reduce((sum, r) => sum + r.rating, 0) / advocateReviews.length;
    const adv = this.getAdvocateById(review.advocateId);
    if (adv) {
      adv.rating = Number(avg.toFixed(2));
      adv.reviewCount = advocateReviews.length;
      this.updateAdvocate(adv);
    }
  }

  // Emergency Requests
  public getEmergencyRequests(): EmergencyRequest[] {
    return this.get<EmergencyRequest[]>(STORAGE_KEYS.EMERGENCY, []);
  }

  public addEmergencyRequest(req: EmergencyRequest): void {
    const list = this.getEmergencyRequests();
    list.unshift(req);
    this.set(STORAGE_KEYS.EMERGENCY, list);
  }

  // Settings
  public getSettings(): AppSettings {
    return this.get<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  }

  public updateSettings(settings: AppSettings): void {
    this.set(STORAGE_KEYS.SETTINGS, settings);
  }

  // Courts Master Management
  public getCourts(): CourtMaster[] {
    const courts = this.get<CourtMaster[]>(STORAGE_KEYS.COURT_MASTERS, DEFAULT_COURT_MASTERS);
    return courts.sort((a, b) => (a.order || 99) - (b.order || 99));
  }

  public addCourt(court: CourtMaster): void {
    const list = this.getCourts();
    list.push(court);
    this.set(STORAGE_KEYS.COURT_MASTERS, list);
  }

  public updateCourt(id: string, updated: CourtMaster): void {
    const list = this.getCourts();
    const idx = list.findIndex(c => c.id === id);
    if (idx !== -1) {
      list[idx] = updated;
      this.set(STORAGE_KEYS.COURT_MASTERS, list);
    }
  }

  public deleteCourt(id: string): void {
    const list = this.getCourts().filter(c => c.id !== id);
    this.set(STORAGE_KEYS.COURT_MASTERS, list);
  }

  public resetCourts(): void {
    this.set(STORAGE_KEYS.COURT_MASTERS, DEFAULT_COURT_MASTERS);
  }

  // Case Stages Master Management
  public getCaseStages(): CaseStageMaster[] {
    const stages = this.get<CaseStageMaster[]>(STORAGE_KEYS.CASE_STAGE_MASTERS, DEFAULT_CASE_STAGE_MASTERS);
    return stages.sort((a, b) => (a.order || 99) - (b.order || 99));
  }

  public addCaseStage(stage: CaseStageMaster): void {
    const list = this.getCaseStages();
    list.push(stage);
    this.set(STORAGE_KEYS.CASE_STAGE_MASTERS, list);
  }

  public updateCaseStage(id: string, updated: CaseStageMaster): void {
    const list = this.getCaseStages();
    const idx = list.findIndex(s => s.id === id);
    if (idx !== -1) {
      list[idx] = updated;
      this.set(STORAGE_KEYS.CASE_STAGE_MASTERS, list);
    }
  }

  public deleteCaseStage(id: string): void {
    const list = this.getCaseStages().filter(s => s.id !== id);
    this.set(STORAGE_KEYS.CASE_STAGE_MASTERS, list);
  }

  public resetCaseStages(): void {
    this.set(STORAGE_KEYS.CASE_STAGE_MASTERS, DEFAULT_CASE_STAGE_MASTERS);
  }

  // ========================================================
  // 2-TIER MULTI-TENANT & MODULE FEATURE TOGGLES SYSTEM
  // ========================================================

  public getTenants(): TenantOrganization[] {
    const list = this.get<TenantOrganization[]>(STORAGE_KEYS.TENANTS, DEFAULT_TENANTS);
    if (!list.some(t => t.id === 'tenant_state_bar_up')) {
      const stateBar = DEFAULT_TENANTS.find(t => t.id === 'tenant_state_bar_up');
      if (stateBar) {
        list.unshift(stateBar);
        this.set(STORAGE_KEYS.TENANTS, list);
      }
    }
    return list;
  }

  public getTenantById(id: string): TenantOrganization | undefined {
    const tenants = this.getTenants();
    return tenants.find(t => t.id === id);
  }

  public getCurrentTenantId(): string {
    return this.get<string>(STORAGE_KEYS.CURRENT_TENANT_ID, 'tenant_ballia_01');
  }

  public getCurrentTenant(): TenantOrganization {
    const currentId = this.getCurrentTenantId();
    const tenants = this.getTenants();
    const found = tenants.find(t => t.id === currentId);
    return found || tenants[0] || DEFAULT_TENANTS[0];
  }

  public setCurrentTenant(id: string): void {
    this.set(STORAGE_KEYS.CURRENT_TENANT_ID, id);
  }

  public addTenant(tenant: TenantOrganization): void {
    const tenants = this.getTenants();
    tenants.unshift(tenant);
    this.set(STORAGE_KEYS.TENANTS, tenants);
  }

  public updateTenant(id: string, updated: TenantOrganization): void {
    const tenants = this.getTenants();
    const idx = tenants.findIndex(t => t.id === id);
    if (idx !== -1) {
      tenants[idx] = updated;
      this.set(STORAGE_KEYS.TENANTS, tenants);
    }
  }

  public deleteTenant(id: string): void {
    const tenants = this.getTenants().filter(t => t.id !== id);
    this.set(STORAGE_KEYS.TENANTS, tenants);
  }

  public resetTenantsToDefault(): void {
    this.set(STORAGE_KEYS.TENANTS, DEFAULT_TENANTS);
    this.set(STORAGE_KEYS.CURRENT_TENANT_ID, 'tenant_ballia_01');
  }

  public toggleTenantModule(tenantId: string, moduleKey: FeatureModuleKey, enabled: boolean): void {
    const tenants = this.getTenants();
    const tenant = tenants.find(t => t.id === tenantId);
    if (tenant) {
      if (enabled) {
        if (!tenant.enabledModules.includes(moduleKey)) {
          tenant.enabledModules.push(moduleKey);
        }
      } else {
        tenant.enabledModules = tenant.enabledModules.filter(m => m !== moduleKey);
      }
      this.set(STORAGE_KEYS.TENANTS, tenants);
    }
  }

  public isModuleEnabled(moduleKey: FeatureModuleKey, tenantId?: string): boolean {
    const tid = tenantId || this.getCurrentTenantId();
    const tenant = this.getTenantById(tid);
    if (!tenant) return true;
    if (tenant.status !== 'ACTIVE') return false;
    return tenant.enabledModules.includes(moduleKey);
  }

  // Global Platform Settings
  public getPlatformSettings(): PlatformGlobalSettings {
    return this.get<PlatformGlobalSettings>(STORAGE_KEYS.PLATFORM_SETTINGS, DEFAULT_PLATFORM_SETTINGS);
  }

  public updatePlatformSettings(settings: PlatformGlobalSettings): void {
    this.set(STORAGE_KEYS.PLATFORM_SETTINGS, settings);
  }

  // Software Licenses
  public getLicenses(): SoftwareLicense[] {
    const saved = this.get<SoftwareLicense[]>(STORAGE_KEYS.SOFTWARE_LICENSES, []);
    if (saved && saved.length > 0) {
      if (!saved.some(l => l.tenantId === 'tenant_state_bar_up' || l.licenseKey === 'LIC-STATE-BAR-UP-2026-9901')) {
        const stateTenant = this.getTenants().find(t => t.id === 'tenant_state_bar_up');
        if (stateTenant) {
          saved.unshift({
            id: 'lic_' + stateTenant.id,
            licenseKey: stateTenant.licenseKey,
            tenantId: stateTenant.id,
            organizationName: stateTenant.name,
            type: stateTenant.type,
            plan: stateTenant.plan,
            status: stateTenant.status,
            issuedAt: stateTenant.issuedAt,
            validTill: stateTenant.validTill,
            maxUsers: stateTenant.maxAdvocatesQuota,
            enabledModules: stateTenant.enabledModules,
            featuresCount: stateTenant.enabledModules.length,
            qrVerificationCode: `VERIFY-LIC-${stateTenant.licenseKey}`,
            issuedBy: 'Nyaay Sahayogi Platform Super Admin',
            notes: stateTenant.customNotes
          });
          this.set(STORAGE_KEYS.SOFTWARE_LICENSES, saved);
        }
      }
      return saved;
    }

    // Seed initial licenses from tenants
    const initialLicenses: SoftwareLicense[] = DEFAULT_TENANTS.map(t => ({
      id: 'lic_' + t.id,
      licenseKey: t.licenseKey,
      tenantId: t.id,
      organizationName: t.name,
      type: t.type,
      plan: t.plan,
      status: t.status,
      issuedAt: t.issuedAt,
      validTill: t.validTill,
      maxUsers: t.maxAdvocatesQuota,
      enabledModules: t.enabledModules,
      featuresCount: t.enabledModules.length,
      qrVerificationCode: `VERIFY-LIC-${t.licenseKey}`,
      issuedBy: 'Nyaay Sahayogi Platform Super Admin',
      notes: t.customNotes
    }));

    this.set(STORAGE_KEYS.SOFTWARE_LICENSES, initialLicenses);
    return initialLicenses;
  }

  public addLicense(license: SoftwareLicense): void {
    const list = this.getLicenses();
    list.unshift(license);
    this.set(STORAGE_KEYS.SOFTWARE_LICENSES, list);
  }

  public updateLicense(id: string, updated: SoftwareLicense): void {
    const list = this.getLicenses();
    const idx = list.findIndex(l => l.id === id);
    if (idx !== -1) {
      list[idx] = updated;
      this.set(STORAGE_KEYS.SOFTWARE_LICENSES, list);
    }
  }

  public deleteLicense(id: string): void {
    const list = this.getLicenses().filter(l => l.id !== id);
    this.set(STORAGE_KEYS.SOFTWARE_LICENSES, list);
  }

  // ========================================================
  // TENANT MASTER DROPDOWN SETTINGS (तहसील, थाना, कोर्ट, केस प्रकार)
  // ========================================================

  public getTenantDropdownConfigsMap(): Record<string, TenantDropdownConfig> {
    return this.get<Record<string, TenantDropdownConfig>>(STORAGE_KEYS.TENANT_DROPDOWN_CONFIGS, {});
  }

  public getTenantDropdownConfig(tenantId?: string): TenantDropdownConfig {
    const tid = tenantId || this.getCurrentTenantId();
    const map = this.getTenantDropdownConfigsMap();
    if (map[tid]) {
      return map[tid];
    }

    // Generate smart initial seed data based on tenant
    const tenant = this.getTenantById(tid);
    let initialTehsils: string[] = [...TAHSILS_BALLIA];
    let initialPS: string[] = [...POLICE_STATIONS_BALLIA];
    let initialCourts: CourtMaster[] = this.getCourts();
    let initialStages: CaseStageMaster[] = this.getCaseStages();

    if (tenant && tenant.id !== 'tenant_ballia_01') {
      const dist = tenant.district || 'District';
      initialTehsils = [
        `${dist} Sadar`,
        `${dist} North`,
        `${dist} South`,
        `${dist} Central`,
        `Tehsil Rural`
      ];
      initialPS = [
        `कोतवाली नगर (${dist} Kotwali Nagar)`,
        `थाना सिविल लाइन्स (Civil Lines)`,
        `थाना कैंट (Cantt)`,
        `थाना महिला पुलिस (Women Police Station)`,
        `थाना सदर (Sadar)`,
        `Other / अन्य`
      ];
      initialCourts = [
        {
          id: `court_${tid}_01`,
          name: `Court of District & Sessions Judge, ${dist}`,
          hindiName: `जिला एवं सत्र न्यायाधीश न्यायालय, ${dist}`,
          type: 'District & Sessions Court',
          roomNo: 'Court Room No. 01',
          presidingOfficer: `District & Sessions Judge`,
          order: 1,
          isActive: true
        },
        {
          id: `court_${tid}_02`,
          name: `Court of Chief Judicial Magistrate (CJM), ${dist}`,
          hindiName: `मुख्य न्यायिक मजिस्ट्रेट (CJM) न्यायालय, ${dist}`,
          type: 'Magistrate Court',
          roomNo: 'Court Room No. 02',
          presidingOfficer: `CJM ${dist}`,
          order: 2,
          isActive: true
        },
        {
          id: `court_${tid}_03`,
          name: `Court of Additional District & Sessions Judge - I, ${dist}`,
          hindiName: `अपर जिला एवं सत्र न्यायाधीश - प्रथम, ${dist}`,
          type: 'District & Sessions Court',
          roomNo: 'Court Room No. 03',
          presidingOfficer: `ADJ - I`,
          order: 3,
          isActive: true
        },
        {
          id: `court_${tid}_04`,
          name: `Family Court (परिवार न्यायालय), ${dist}`,
          hindiName: `प्रधान न्यायाधीश परिवार न्यायालय, ${dist}`,
          type: 'District & Sessions Court',
          roomNo: 'Family Court Hall',
          presidingOfficer: `Principal Judge Family Court`,
          order: 4,
          isActive: true
        },
        {
          id: `court_${tid}_05`,
          name: `Court of Sub-Divisional Magistrate (SDM), ${dist} Sadar`,
          hindiName: `उपजिलाधिकारी (SDM) राजस्व न्यायालय, ${dist} सदर`,
          type: 'Revenue Court',
          roomNo: 'SDM Court Hall',
          presidingOfficer: `SDM Sadar`,
          order: 5,
          isActive: true
        },
        {
          id: `court_${tid}_06`,
          name: `Motor Accident Claims Tribunal (MACT), ${dist}`,
          hindiName: `मोटर दुर्घटना दावा अधिकरण (MACT), ${dist}`,
          type: 'Tribunal / Forum',
          roomNo: 'MACT Hall',
          presidingOfficer: `Presiding Officer MACT`,
          order: 6,
          isActive: true
        }
      ];
    }

    const config: TenantDropdownConfig = {
      tenantId: tid,
      tehsils: initialTehsils,
      policeStations: initialPS,
      courts: initialCourts,
      caseStages: initialStages,
      updatedAt: new Date().toLocaleDateString('en-GB')
    };

    map[tid] = config;
    this.set(STORAGE_KEYS.TENANT_DROPDOWN_CONFIGS, map);
    return config;
  }

  public saveTenantDropdownConfig(config: TenantDropdownConfig): void {
    const map = this.getTenantDropdownConfigsMap();
    map[config.tenantId] = {
      ...config,
      updatedAt: new Date().toLocaleDateString('en-GB')
    };
    this.set(STORAGE_KEYS.TENANT_DROPDOWN_CONFIGS, map);
  }

  public getTehsils(tenantId?: string): string[] {
    const config = this.getTenantDropdownConfig(tenantId);
    return config.tehsils && config.tehsils.length > 0 ? config.tehsils : TAHSILS_BALLIA;
  }

  public getPoliceStations(tenantId?: string): string[] {
    const config = this.getTenantDropdownConfig(tenantId);
    return config.policeStations && config.policeStations.length > 0 ? config.policeStations : POLICE_STATIONS_BALLIA;
  }

  public getTenantCourts(tenantId?: string): CourtMaster[] {
    const config = this.getTenantDropdownConfig(tenantId);
    return config.courts && config.courts.length > 0 ? config.courts : this.getCourts();
  }

  public getTenantCaseStages(tenantId?: string): CaseStageMaster[] {
    const config = this.getTenantDropdownConfig(tenantId);
    return config.caseStages && config.caseStages.length > 0 ? config.caseStages : this.getCaseStages();
  }

  public addTehsil(tenantId: string, tehsil: string): void {
    const config = this.getTenantDropdownConfig(tenantId);
    const trimmed = tehsil.trim();
    if (trimmed && !config.tehsils.includes(trimmed)) {
      config.tehsils.push(trimmed);
      this.saveTenantDropdownConfig(config);
    }
  }

  public removeTehsil(tenantId: string, tehsil: string): void {
    const config = this.getTenantDropdownConfig(tenantId);
    config.tehsils = config.tehsils.filter(t => t.toLowerCase() !== tehsil.trim().toLowerCase());
    this.saveTenantDropdownConfig(config);
  }

  public addPoliceStation(tenantId: string, ps: string): void {
    const config = this.getTenantDropdownConfig(tenantId);
    const trimmed = ps.trim();
    if (trimmed && !config.policeStations.includes(trimmed)) {
      const otherIdx = config.policeStations.indexOf('Other / अन्य');
      if (otherIdx !== -1) {
        config.policeStations.splice(otherIdx, 0, trimmed);
      } else {
        config.policeStations.push(trimmed);
      }
      this.saveTenantDropdownConfig(config);
    }
  }

  public removePoliceStation(tenantId: string, ps: string): void {
    const config = this.getTenantDropdownConfig(tenantId);
    config.policeStations = config.policeStations.filter(p => p !== ps);
    this.saveTenantDropdownConfig(config);
  }

  public saveTenantCourt(tenantId: string, court: CourtMaster): void {
    const config = this.getTenantDropdownConfig(tenantId);
    const idx = config.courts.findIndex(c => c.id === court.id);
    if (idx !== -1) {
      config.courts[idx] = court;
    } else {
      config.courts.push(court);
    }
    this.saveTenantDropdownConfig(config);
  }

  public deleteTenantCourt(tenantId: string, courtId: string): void {
    const config = this.getTenantDropdownConfig(tenantId);
    config.courts = config.courts.filter(c => c.id !== courtId);
    this.saveTenantDropdownConfig(config);
  }

  public saveTenantCaseStage(tenantId: string, stage: CaseStageMaster): void {
    const config = this.getTenantDropdownConfig(tenantId);
    const idx = config.caseStages.findIndex(s => s.id === stage.id);
    if (idx !== -1) {
      config.caseStages[idx] = stage;
    } else {
      config.caseStages.push(stage);
    }
    this.saveTenantDropdownConfig(config);
  }

  public deleteTenantCaseStage(tenantId: string, stageId: string): void {
    const config = this.getTenantDropdownConfig(tenantId);
    config.caseStages = config.caseStages.filter(s => s.id !== stageId);
    this.saveTenantDropdownConfig(config);
  }

  public resetTenantDropdownConfig(tenantId: string): TenantDropdownConfig {
    const map = this.getTenantDropdownConfigsMap();
    delete map[tenantId];
    this.set(STORAGE_KEYS.TENANT_DROPDOWN_CONFIGS, map);
    return this.getTenantDropdownConfig(tenantId);
  }

  // Customizable SaaS Pricing & Revenue Plans
  public getPricingConfig(): PlatformPricingConfig {
    return {
      ...DEFAULT_PRICING_CONFIG,
      ...this.get<PlatformPricingConfig>(STORAGE_KEYS.PRICING_CONFIG, DEFAULT_PRICING_CONFIG)
    };
  }

  public savePricingConfig(config: PlatformPricingConfig): PlatformPricingConfig {
    const updated: PlatformPricingConfig = {
      ...config,
      updatedAt: new Date().toLocaleDateString('en-GB')
    };
    this.set(STORAGE_KEYS.PRICING_CONFIG, updated);
    return updated;
  }

  public resetPricingConfig(): PlatformPricingConfig {
    this.set(STORAGE_KEYS.PRICING_CONFIG, DEFAULT_PRICING_CONFIG);
    return DEFAULT_PRICING_CONFIG;
  }

  public getSaaSBillingOrders(): SaaSBillingOrder[] {
    return this.get<SaaSBillingOrder[]>(STORAGE_KEYS.SAAS_BILLING_ORDERS, DEFAULT_BILLING_ORDERS);
  }

  public addSaaSBillingOrder(order: SaaSBillingOrder): void {
    const list = this.getSaaSBillingOrders();
    this.set(STORAGE_KEYS.SAAS_BILLING_ORDERS, [order, ...list]);
  }

  public deleteSaaSBillingOrder(orderId: string): void {
    const list = this.getSaaSBillingOrders().filter(o => o.id !== orderId);
    this.set(STORAGE_KEYS.SAAS_BILLING_ORDERS, list);
  }

  public toggleAdvocateProStatus(advocateId: string, planType: 'FREE' | 'MONTHLY' | 'YEARLY' = 'YEARLY'): Advocate | null {
    const list = this.getAdvocates();
    const idx = list.findIndex(a => a.id === advocateId);
    if (idx === -1) return null;
    const isCurrentlyPro = !!list[idx].isProMember;
    list[idx] = {
      ...list[idx],
      isProMember: !isCurrentlyPro,
      proPlanType: !isCurrentlyPro ? planType : 'FREE',
      proValidTill: !isCurrentlyPro ? '31/12/2027' : undefined
    };
    this.set(STORAGE_KEYS.ADVOCATES, list);
    return list[idx];
  }
}

export const db = new LocalStore();
db.init();
