import { FeatureModuleKey, FeatureModuleMeta, TenantOrganization, TenantPlan, PlatformGlobalSettings } from '../types';

export const ALL_FEATURE_MODULES: FeatureModuleMeta[] = [
  {
    key: 'finance',
    name: 'Finance & Accounts Ledger',
    hindiName: 'आय-व्यय व वित्तीय लेजर',
    description: 'Track membership fees, advocate welfare funds, expense vouchers, balance sheets, and Excel ledger reports.',
    icon: 'IndianRupee',
    category: 'FINANCE',
    isPremium: true
  },
  {
    key: 'id_cards',
    name: 'Advocate Digital ID Card & COP',
    hindiName: 'डिजिटल बार पहचान-पत्र व COP सत्यापन',
    description: 'Instant generation of official Bar ID cards with dynamic QR verification, photo, validity, and COP credentials.',
    icon: 'CreditCard',
    category: 'CORE',
    isPremium: false
  },
  {
    key: 'causelist',
    name: 'Daily Court Cause List',
    hindiName: 'दैनिक वाद सूची (Daily Cause List)',
    description: 'Digital live cause list for all District & Subordinate Courts with bench-wise filtering and hearing stage lookup.',
    icon: 'FileText',
    category: 'JUDICIAL',
    isPremium: false
  },
  {
    key: 'election',
    name: 'Bar Election & E-Voting',
    hindiName: 'बार एसोसिएशन चुनाव व ई-वोटिंग',
    description: 'Complete election commission portal, candidate nominations, voter roll verification, and live vote counting.',
    icon: 'Vote',
    category: 'COMMUNICATION',
    isPremium: true
  },
  {
    key: 'elibrary',
    name: 'Legal e-Library & Bare Acts',
    hindiName: 'विधिक ई-लाइब्रेरी व बेर एक्ट्स',
    description: 'Searchable repository of IPC/BNS, CrPC/BNSS, Evidence Act/BSA, UP Revenue Code, High Court rulings, and legal formats.',
    icon: 'BookOpen',
    category: 'AI_AND_TOOLS',
    isPremium: false
  },
  {
    key: 'ai_assistant',
    name: 'AI Legal Assistant (न्याय सहायक)',
    hindiName: 'न्याय सहायक AI विधिक सलाहकार',
    description: 'Interactive intelligent assistant to draft bail petitions, legal notices, research precedents, and case laws.',
    icon: 'Sparkles',
    category: 'AI_AND_TOOLS',
    isPremium: true
  },
  {
    key: 'broadcast',
    name: 'Notice & SMS Broadcast',
    hindiName: 'सूचना व नोटिस ब्रॉडकास्ट (SMS/Alerts)',
    description: 'Broadcast urgent bar association resolutions, condolence meets, strike notices, and meeting agendas to advocates.',
    icon: 'Bell',
    category: 'COMMUNICATION',
    isPremium: false
  },
  {
    key: 'junior_senior',
    name: 'Junior-Senior Chamber Connect',
    hindiName: 'जूनियर-सीनियर कनेक्ट व चेंबर वेकेंसी',
    description: 'Bridge senior advocates offering chamber mentorship/stipends with young enrolling advocates seeking litigation training.',
    icon: 'Users',
    category: 'CORE',
    isPremium: false
  },
  {
    key: 'emergency',
    name: '24x7 Emergency Legal Help',
    hindiName: '24x7 आपातकालीन विधिक सहायता',
    description: 'Citizen emergency helpline routing immediate police station bail and detention legal aid to on-duty bar advocates.',
    icon: 'PhoneCall',
    category: 'CORE',
    isPremium: false
  },
  {
    key: 'courts_stages',
    name: 'Custom Court & Stages Master',
    hindiName: 'न्यायालय व वाद प्रक्रम प्रबंधन',
    description: 'Customize court names, rooms, presiding officers, and procedural stages (Bail, WS, PW/DW, Argument) for advocate dropdowns.',
    icon: 'Scale',
    category: 'JUDICIAL',
    isPremium: true
  },
  {
    key: 'client_portal',
    name: 'Client Case Tracking & Receipt',
    hindiName: 'मुवक्किल केस ट्रैकिंग व रसीद',
    description: 'Allow clients to check their next hearing dates, case status, fees paid, and pending balance with OTP/Case No.',
    icon: 'UserCheck',
    category: 'CORE',
    isPremium: false
  },
  {
    key: 'directory',
    name: 'Public Advocate Directory',
    hindiName: 'सार्वजनिक अधिवक्ता डायरेक्टरी व खोज',
    description: 'Public searchable directory of registered advocates with specialization filters, ratings, reviews, and chamber locations.',
    icon: 'Search',
    category: 'CORE',
    isPremium: false
  },
  {
    key: 'state_bar_verify',
    name: 'State Bar Voter Verification & Read Portal',
    hindiName: 'राज्य बार मतदाता सत्यापन व रीड पोर्टल',
    description: 'Read-only access and voter verification for State Bar Council elections across 75 districts from district bar panel.',
    icon: 'Landmark',
    category: 'COMMUNICATION',
    isPremium: false
  }
];

export const DEFAULT_TENANTS: TenantOrganization[] = [
  {
    id: 'tenant_state_bar_up',
    name: 'Bar Council of Uttar Pradesh (राज्य विधिज्ञ परिषद उ.प्र.)',
    hindiName: 'राज्य विधिज्ञ परिषद, उत्तर प्रदेश (75 ज़िले)',
    shortName: '🏛️ UP State Bar Council',
    type: 'STATE_BAR_COUNCIL',
    district: '75 Districts (Statewide - Prayagraj / Lucknow)',
    state: 'Uttar Pradesh',
    estdYear: '1961',
    barCouncilAffiliation: 'Apex Statutory Regulatory Council under Advocates Act, 1961',
    adminName: 'Secretary / Chief Election Officer, Bar Council of UP',
    adminEmail: 'stateadmin@upbarcouncil.org',
    adminMobile: '9415123456',
    licenseKey: 'LIC-STATE-BAR-UP-2026-9901',
    plan: 'CONSTITUTIONAL_APEX_COUNCIL',
    status: 'ACTIVE',
    issuedAt: '01/01/2026',
    validTill: '31/12/2099',
    maxAdvocatesQuota: 150000,
    enabledModules: [
      'finance',
      'id_cards',
      'causelist',
      'election',
      'elibrary',
      'ai_assistant',
      'broadcast',
      'junior_senior',
      'emergency',
      'courts_stages',
      'client_portal',
      'directory'
    ],
    presidentName: 'Hon. Chairman, Bar Council of Uttar Pradesh',
    generalSecretaryName: 'Secretary, State Bar Council',
    treasurerName: 'Treasurer, State Bar Council',
    officialAddress: 'Bar Council Bhawan, High Court Campus, Prayagraj, UP - 211001',
    customNotes: 'Apex Statutory Regulatory Council governing all 75 District Bar Associations across Uttar Pradesh.',
    createdAt: '01/01/1961'
  },
  {
    id: 'tenant_ballia_01',
    name: 'Criminal & Revenue Bar Association, Ballia',
    hindiName: 'फौजदारी एवं राजस्व बार एसोसिएशन, बलिया (उ.प्र.)',
    shortName: 'CRBA Ballia',
    type: 'BAR_ASSOCIATION',
    district: 'Ballia',
    state: 'Uttar Pradesh',
    estdYear: '1950',
    barCouncilAffiliation: 'Affiliated to Bar Council of Uttar Pradesh (Enr. UP-BAL-01)',
    adminName: 'Shri O. P. Singh (President) / General Secretary',
    adminEmail: 'admin@barballia.com',
    adminMobile: '9415988800',
    licenseKey: 'NYAAY-BAL-2026-X89K-PR0',
    plan: 'ENTERPRISE_BAR',
    status: 'ACTIVE',
    issuedAt: '01/01/2026',
    validTill: '31/12/2027',
    maxAdvocatesQuota: 1500,
    enabledModules: [
      'finance',
      'id_cards',
      'causelist',
      'election',
      'elibrary',
      'ai_assistant',
      'broadcast',
      'junior_senior',
      'emergency',
      'courts_stages',
      'client_portal',
      'directory'
    ],
    presidentName: 'Shri O. P. Singh',
    generalSecretaryName: 'Shri Arvind Kumar Tiwari',
    treasurerName: 'Shri B. N. Mishra',
    officialAddress: 'District Court Campus, Civil Lines, Bahadurpur, Ballia, UP - 277001',
    customNotes: 'Main Apex Bar Association of District Ballia with full modules active.',
    createdAt: '01/01/2024'
  },
  {
    id: 'tenant_mau_02',
    name: 'Civil Court Bar Association, Mau',
    hindiName: 'दीवानी न्यायालय बार एसोसिएशन, मऊ (उ.प्र.)',
    shortName: 'CCBA Mau',
    type: 'BAR_ASSOCIATION',
    district: 'Mau',
    state: 'Uttar Pradesh',
    estdYear: '1989',
    barCouncilAffiliation: 'Affiliated to Bar Council of UP (Enr. UP-MAU-04)',
    adminName: 'Adv. R. K. Rai (Secretary)',
    adminEmail: 'admin@barmau.org',
    adminMobile: '9450123456',
    licenseKey: 'NYAAY-MAU-2026-K72B-STD',
    plan: 'PROFESSIONAL',
    status: 'ACTIVE',
    issuedAt: '15/01/2026',
    validTill: '14/01/2027',
    maxAdvocatesQuota: 500,
    enabledModules: [
      'id_cards',
      'causelist',
      'elibrary',
      'ai_assistant',
      'broadcast',
      'junior_senior',
      'courts_stages',
      'client_portal',
      'directory'
    ],
    presidentName: 'Shri S. K. Upadhyay',
    generalSecretaryName: 'Adv. R. K. Rai',
    officialAddress: 'Civil Court Compound, Mau Nath Bhanjan, UP - 275101',
    customNotes: 'Mau district bar with Professional tier license.',
    createdAt: '15/01/2026'
  },
  {
    id: 'tenant_azamgarh_03',
    name: 'District Bar Association, Azamgarh',
    hindiName: 'जिला बार एसोसिएशन, आज़मगढ़ (उ.प्र.)',
    shortName: 'DBA Azamgarh',
    type: 'BAR_ASSOCIATION',
    district: 'Azamgarh',
    state: 'Uttar Pradesh',
    estdYear: '1962',
    barCouncilAffiliation: 'Bar Council of UP',
    adminName: 'Adv. Sanjay Yadav',
    adminEmail: 'admin@barazamgarh.in',
    adminMobile: '9838012345',
    licenseKey: 'NYAAY-AZM-2026-Q99P-STR',
    plan: 'STARTER',
    status: 'ACTIVE',
    issuedAt: '01/02/2026',
    validTill: '01/08/2026',
    maxAdvocatesQuota: 250,
    enabledModules: [
      'id_cards',
      'causelist',
      'broadcast',
      'client_portal',
      'directory'
    ],
    officialAddress: 'District Court Campus, Azamgarh - 276001',
    createdAt: '01/02/2026'
  },
  {
    id: 'tenant_firm_04',
    name: 'Tripathi & Partners Legal Chambers',
    hindiName: 'त्रिपाठी एवं पार्टनर्स विधिक चेंबर',
    shortName: 'Tripathi Law',
    type: 'LEGAL_FIRM',
    district: 'Lucknow',
    state: 'Uttar Pradesh',
    estdYear: '2015',
    adminName: 'Senior Adv. Alok Tripathi',
    adminEmail: 'alok@tripathilaw.in',
    adminMobile: '9918234567',
    licenseKey: 'NYAAY-FRM-2026-L44X-PRO',
    plan: 'PROFESSIONAL',
    status: 'ACTIVE',
    issuedAt: '10/02/2026',
    validTill: '09/02/2027',
    maxAdvocatesQuota: 50,
    enabledModules: [
      'finance',
      'causelist',
      'ai_assistant',
      'elibrary',
      'courts_stages',
      'client_portal'
    ],
    officialAddress: 'High Court Chamber Block B-14, Vibhuti Khand, Lucknow',
    createdAt: '10/02/2026'
  },
  {
    id: 'tenant_adv_05',
    name: 'Adv. R. K. Sharma Criminal Law Chamber',
    hindiName: 'अधिवक्ता आर. के. शर्मा क्रिमिनल चेंबर',
    shortName: 'Sharma Law',
    type: 'INDIVIDUAL_ADVOCATE',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    estdYear: '2008',
    adminName: 'Adv. R. K. Sharma',
    adminEmail: 'rksharma@varanasilaw.com',
    adminMobile: '9452098765',
    licenseKey: 'NYAAY-ADV-2026-S11Z-TRI',
    plan: 'TRIAL',
    status: 'ACTIVE',
    issuedAt: '01/03/2026',
    validTill: '01/04/2026',
    maxAdvocatesQuota: 10,
    enabledModules: [
      'id_cards',
      'causelist',
      'ai_assistant',
      'client_portal'
    ],
    officialAddress: 'Chamber 8, Collectorate Compound, Varanasi',
    createdAt: '01/03/2026'
  }
];

export const DEFAULT_PLATFORM_SETTINGS: PlatformGlobalSettings = {
  platformName: 'Nyaay Sahayogi Platform (न्याय सहयोगी मास्टर प्लेटफॉर्म)',
  platformTagline: 'Apex Multi-Tenant Legal & Bar Association Operating System',
  superAdminEmail: 'nyaaysahayogi@gmail.com',
  supportPhone: '+91 9415988800',
  supportEmail: 'support@nyaaysahayogi.com',
  allowSelfRegistration: true,
  maintenanceMode: false,
  defaultTrialDays: 30,
  globalModuleDefaults: {
    finance: true,
    id_cards: true,
    causelist: true,
    election: true,
    elibrary: true,
    ai_assistant: true,
    broadcast: true,
    junior_senior: true,
    emergency: true,
    courts_stages: true,
    client_portal: true,
    directory: true,
    state_bar_verify: true
  }
};

export function generateCryptoLicenseKey(prefix = 'NYAAY', plan: TenantPlan = 'PROFESSIONAL'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const getRandomChunk = (len: number) => {
    let res = '';
    for (let i = 0; i < len; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  };

  const planCode = 
    plan === 'ENTERPRISE_BAR' ? 'ENT' :
    plan === 'PROFESSIONAL' ? 'PRO' :
    plan === 'STARTER' ? 'STR' : 'TRI';

  const year = new Date().getFullYear();
  const chunk1 = getRandomChunk(4);
  const chunk2 = getRandomChunk(4);

  return `${prefix.toUpperCase()}-${year}-${chunk1}-${chunk2}-${planCode}`;
}
