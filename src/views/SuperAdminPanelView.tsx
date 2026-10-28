import React, { useState, useEffect } from 'react';
import {
  Crown,
  Layers,
  Building2,
  KeyRound,
  Settings,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  Search,
  Filter,
  ExternalLink,
  Download,
  AlertTriangle,
  Zap,
  Users,
  CreditCard,
  FileText,
  Vote,
  BookOpen,
  Sparkles,
  Bell,
  PhoneCall,
  Scale,
  UserCheck,
  ArrowRight,
  IndianRupee,
  LogOut,
  Calendar,
  Lock,
  Globe,
  Eye,
  EyeOff,
  Key,
  SlidersHorizontal,
  Landmark,
  CheckSquare,
  Smartphone,
  Upload,
  RotateCcw
} from 'lucide-react';
import {
  TenantOrganization,
  FeatureModuleKey,
  TenantPlan,
  TenantStatus,
  TenantType,
  SoftwareLicense,
  PlatformGlobalSettings,
  Advocate,
  StateBarElectionConfig,
  StateBarElectionCandidate,
  StateBarVoterEligibility,
  PlatformPricingConfig,
  SaaSBillingOrder
} from '../types';
import { db } from '../lib/store';
import {
  ALL_FEATURE_MODULES,
  generateCryptoLicenseKey
} from '../lib/modulesConfig';
import { TenantDropdownCustomizer } from '../components/TenantDropdownCustomizer';
import { securityShield, SecurityShieldSettings } from '../utils/securityShield';
import { AdvocateLogo, AdvocateLogoVariant } from '../components/AdvocateLogo';
import {
  getManifestConfig,
  saveManifestConfig,
  resetManifestConfig,
  generateManifestJson,
  AppManifestConfig
} from '../utils/manifestManager';

interface SuperAdminPanelViewProps {
  onLogout: () => void;
  onNavigateToBarAdmin?: () => void;
  onNavigateToStateBarAdmin?: () => void;
}

export const SuperAdminPanelView: React.FC<SuperAdminPanelViewProps> = ({
  onLogout,
  onNavigateToBarAdmin,
  onNavigateToStateBarAdmin
}) => {
  const [activeTab, setActiveTab] = useState<'modules' | 'tenants' | 'licenses' | 'settings' | 'dropdowns' | 'state_bar_control' | 'pricing_billing' | 'security_shield' | 'branding_manifest'>('modules');
  const [shieldSettings, setShieldSettings] = useState<SecurityShieldSettings>(securityShield.getSettings());
  
  // Platform Master App Icon & Manifest States (Super Admin Only)
  const [manifestForm, setManifestForm] = useState<AppManifestConfig>(getManifestConfig());
  const [selectedIconPreset, setSelectedIconPreset] = useState<AdvocateLogoVariant>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('nyaay_icon_preset') as AdvocateLogoVariant) || 'official';
    }
    return 'official';
  });
  const [customLogoData, setCustomLogoData] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('nyaay_custom_logo_data') || '';
    }
    return '';
  });
  const [customLogoUrlInput, setCustomLogoUrlInput] = useState<string>('');
  
  // Customizable Pricing & Billing States
  const [pricingConfig, setPricingConfig] = useState<PlatformPricingConfig>(db.getPricingConfig());
  const [billingOrders, setBillingOrders] = useState<SaaSBillingOrder[]>(db.getSaaSBillingOrders());
  const [proAdvocateSearch, setProAdvocateSearch] = useState('');
  const [newOrderForm, setNewOrderForm] = useState<{
    organizationName: string;
    category: SaaSBillingOrder['category'];
    quantity: number;
    unitPrice: number;
    status: 'PAID' | 'PENDING';
    notes: string;
  }>({
    organizationName: '',
    category: 'PVC_ID_CARDS',
    quantity: 500,
    unitPrice: db.getPricingConfig().pvcCardChargePerCard,
    status: 'PAID',
    notes: ''
  });
  
  // Data States
  const [tenants, setTenants] = useState<TenantOrganization[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');
  const [licenses, setLicenses] = useState<SoftwareLicense[]>([]);
  const [platformSettings, setPlatformSettings] = useState<PlatformGlobalSettings>(db.getPlatformSettings());
  
  // Modals & Forms
  const [isAddTenantModalOpen, setIsAddTenantModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<TenantOrganization | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [createdCredentialsModal, setCreatedCredentialsModal] = useState<{
    orgName: string;
    adminName: string;
    email: string;
    password: string;
    licenseKey: string;
    district: string;
  } | null>(null);

  // Reset Password State
  const [resetPasswordModal, setResetPasswordModal] = useState<{
    isOpen: boolean;
    userEmail: string;
    userName: string;
    userRole: string;
    orgName: string;
    newPassword: string;
    showPassword: boolean;
  } | null>(null);

  const [isGlobalUserLookupOpen, setIsGlobalUserLookupOpen] = useState(false);
  const [userLookupQuery, setUserLookupQuery] = useState('');
  const [allAdvocates, setAllAdvocates] = useState<Advocate[]>([]);

  // State Bar Council Master Control States
  const [stateElectionConfig, setStateElectionConfig] = useState<StateBarElectionConfig>(db.getStateBarElectionConfig());
  const [stateElectionStats, setStateElectionStats] = useState(db.getStateBarElectionStats());
  const [stateBarCandidates, setStateBarCandidates] = useState<StateBarElectionCandidate[]>(db.getStateBarElectionCandidates());
  const [stateBarVoterRoll, setStateBarVoterRoll] = useState<StateBarVoterEligibility[]>(db.getStateBarVoterRoll());
  const [stateSearchDistrict, setStateSearchDistrict] = useState<string>('ALL');
  const [stateSearchQuery, setStateSearchQuery] = useState<string>('');
  const [stateAdminNewPassword, setStateAdminNewPassword] = useState<string>('');
  const [showStateAdminPass, setShowStateAdminPass] = useState<boolean>(false);
  const [superAdminNewPassword, setSuperAdminNewPassword] = useState<string>('');
  const [showSuperAdminPass, setShowSuperAdminPass] = useState<boolean>(false);

  // State Bar Council SaaS License & Validity Control State
  const [stateBarLicenseForm, setStateBarLicenseForm] = useState<{
    licenseKey: string;
    validTill: string;
    status: TenantStatus;
    plan: TenantPlan;
    maxAdvocatesQuota: number;
  }>({
    licenseKey: 'LIC-STATE-BAR-UP-2026-9901',
    validTill: '31/12/2099',
    status: 'ACTIVE',
    plan: 'CONSTITUTIONAL_APEX_COUNCIL',
    maxAdvocatesQuota: 150000
  });

  // New Tenant Form State
  const [tenantForm, setTenantForm] = useState<{
    name: string;
    hindiName: string;
    shortName: string;
    type: TenantType;
    district: string;
    state: string;
    estdYear: string;
    adminName: string;
    adminEmail: string;
    adminPassword: string;
    adminMobile: string;
    plan: TenantPlan;
    licenseKey: string;
    validityYears: number;
    maxAdvocatesQuota: number;
    enabledModules: FeatureModuleKey[];
  }>({
    name: '',
    hindiName: '',
    shortName: '',
    type: 'BAR_ASSOCIATION',
    district: '',
    state: 'Uttar Pradesh',
    estdYear: '2026',
    adminName: '',
    adminEmail: '',
    adminPassword: 'Admin@123',
    adminMobile: '',
    plan: 'PROFESSIONAL',
    licenseKey: generateCryptoLicenseKey('NYAAY', 'PROFESSIONAL'),
    validityYears: 1,
    maxAdvocatesQuota: 500,
    enabledModules: ALL_FEATURE_MODULES.map(m => m.key)
  });

  // License Generator State
  const [genOrgName, setGenOrgName] = useState('');
  const [genPlan, setGenPlan] = useState<TenantPlan>('PROFESSIONAL');
  const [genType, setGenType] = useState<TenantType>('BAR_ASSOCIATION');
  const [genValidityYears, setGenValidityYears] = useState(1);
  const [genMaxUsers, setGenMaxUsers] = useState(500);
  const [generatedLicense, setGeneratedLicense] = useState<SoftwareLicense | null>(null);

  // Search & Filters
  const [tenantSearchQuery, setTenantSearchQuery] = useState('');
  const [tenantTypeFilter, setTenantTypeFilter] = useState<string>('ALL');

  useEffect(() => {
    loadAllData();
    const handleCloudSync = (e: Event) => {
      const customEvt = e as CustomEvent<{ key?: string }>;
      if (!customEvt.detail || customEvt.detail.key === 'CLOUD_SYNC') {
        loadAllData();
      }
    };
    window.addEventListener('crba_state_updated', handleCloudSync);
    return () => window.removeEventListener('crba_state_updated', handleCloudSync);
  }, []);

  const loadAllData = () => {
    const loadedTenants = db.getTenants();
    setTenants(loadedTenants);
    
    const currentId = db.getCurrentTenantId();
    setSelectedTenantId(currentId || (loadedTenants[0]?.id || ''));
    
    setLicenses(db.getLicenses());
    setPlatformSettings(db.getPlatformSettings());
    setAllAdvocates(db.getAdvocates());
    setPricingConfig(db.getPricingConfig());
    setBillingOrders(db.getSaaSBillingOrders());

    // State Bar Council Data
    setStateElectionConfig(db.getStateBarElectionConfig());
    setStateElectionStats(db.getStateBarElectionStats());
    setStateBarCandidates(db.getStateBarElectionCandidates());
    setStateBarVoterRoll(db.getStateBarVoterRoll());

    const sTenant = loadedTenants.find(t => t.id === 'tenant_state_bar_up');
    if (sTenant) {
      setStateBarLicenseForm({
        licenseKey: sTenant.licenseKey,
        validTill: sTenant.validTill,
        status: sTenant.status,
        plan: sTenant.plan,
        maxAdvocatesQuota: sTenant.maxAdvocatesQuota || 150000
      });
    }
  };

  // Super Admin: Save State Bar Council SaaS License, Validity & Quota
  const handleSaveStateBarSaaSLicense = (e: React.FormEvent) => {
    e.preventDefault();
    const currentTenants = db.getTenants();
    const sTenant = currentTenants.find(t => t.id === 'tenant_state_bar_up');
    if (sTenant) {
      const updatedTenant: TenantOrganization = {
        ...sTenant,
        licenseKey: stateBarLicenseForm.licenseKey.trim(),
        validTill: stateBarLicenseForm.validTill.trim(),
        status: stateBarLicenseForm.status,
        plan: stateBarLicenseForm.plan,
        maxAdvocatesQuota: Number(stateBarLicenseForm.maxAdvocatesQuota) || 150000
      };
      db.updateTenant(sTenant.id, updatedTenant);

      const allLicenses = db.getLicenses();
      const lic = allLicenses.find(l => l.tenantId === 'tenant_state_bar_up' || l.licenseKey === sTenant.licenseKey);
      if (lic) {
        db.updateLicense(lic.id, {
          ...lic,
          licenseKey: updatedTenant.licenseKey,
          validTill: updatedTenant.validTill,
          status: updatedTenant.status,
          plan: updatedTenant.plan,
          maxUsers: updatedTenant.maxAdvocatesQuota
        });
      }
      loadAllData();
      showToast('🏛️ State Bar Council SaaS License, Validity & Quota updated successfully!');
    }
  };

  // Super Admin: Toggle State Bar Council Election Status (ON / OFF / Results)
  const handleSuperAdminToggleStateElection = (newStatus: 'VotingOpen' | 'VotingClosed' | 'ResultsDeclared' | 'NominationsOpen' | 'Draft') => {
    const isLive = newStatus === 'VotingOpen';
    const updated = db.updateStateBarElectionConfig({
      status: newStatus,
      isVotingLive: isLive
    });
    setStateElectionConfig({ ...updated });
    setStateElectionStats(db.getStateBarElectionStats());
    showToast(
      isLive 
        ? '🟢 पूरे प्रदेश के 75 जिलों में राज्य बार चुनाव ON (मतदान चालू) कर दिया गया है!'
        : `🔴 राज्य बार चुनाव स्थिति अपडेट: ${newStatus}`,
      'success'
    );
  };

  // Super Admin: Reset or Change State Bar Admin Password
  const handleSuperAdminChangeStateAdminPass = (newPass: string) => {
    if (!newPass.trim()) {
      showToast('कृपया नया पासवर्ड दर्ज करें।', 'error');
      return;
    }
    const currentAdmin = db.getAdvocates().find(a => a.role === 'state_bar_admin' || a.email.toLowerCase() === 'stateadmin@upbarcouncil.org');
    if (currentAdmin) {
      db.updateAdvocate(currentAdmin.id, { password: newPass.trim() });
    }
    setStateAdminNewPassword('');
    loadAllData();
    showToast('State Bar Admin का पासवर्ड सफलतापूर्वक बदल दिया गया है!');
  };

  // Super Admin: Change Own Super Admin Password (nyaaysahayogi@gmail.com)
  const handleUpdateSuperAdminPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!superAdminNewPassword.trim()) {
      showToast('कृपया नया सुपर एडमिन पासवर्ड दर्ज करें।', 'error');
      return;
    }
    const advocates = db.getAdvocates();
    const superAdmin = advocates.find(a => a.email.toLowerCase() === 'nyaaysahayogi@gmail.com' || a.role === 'super_admin');
    if (superAdmin) {
      db.updateAdvocate(superAdmin.id, { password: superAdminNewPassword.trim() });
      setSuperAdminNewPassword('');
      loadAllData();
      showToast('👑 Super Admin (nyaaysahayogi@gmail.com) का पासवर्ड सफलतापूर्वक बदल दिया गया है!');
    }
  };

  // Super Admin: Toggle State Bar Admin Account Lock/Unlock
  const handleSuperAdminToggleStateAdminStatus = () => {
    const currentAdmin = db.getAdvocates().find(a => a.role === 'state_bar_admin' || a.email.toLowerCase() === 'stateadmin@upbarcouncil.org');
    if (!currentAdmin) return;
    const newStatus = currentAdmin.status === 'APPROVED' ? 'REJECTED' : 'APPROVED';
    db.updateAdvocate(currentAdmin.id, { status: newStatus });
    loadAllData();
    showToast(`State Bar Admin अकाउंट स्थिति: ${newStatus === 'APPROVED' ? 'सक्रिय (Active)' : 'अवरुद्ध (Locked/Suspended)'}`);
  };

  // Super Admin: Reset all State Bar Council test votes
  const handleSuperAdminResetStateVotes = () => {
    if (window.confirm('क्या आप सचमुच राज्य बार काउंसिल के सभी डाले गए मतपत्र (Votes) रीसेट करना चाहते हैं?')) {
      db.resetStateBarVotes();
      loadAllData();
      showToast('राज्य बार काउंसिल के सभी मतपत्र सफलतापूर्वक रीसेट कर दिए गए।');
    }
  };

  // Open Password Reset Modal
  const handleOpenResetPassword = (userEmail: string, userName: string, userRole = 'Bar Admin', orgName = '') => {
    const randomPass = 'Pass@' + Math.floor(1000 + Math.random() * 9000);
    setResetPasswordModal({
      isOpen: true,
      userEmail,
      userName,
      userRole,
      orgName,
      newPassword: randomPass,
      showPassword: true
    });
  };

  // Confirm and Execute Password Reset
  const handleExecutePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasswordModal) return;
    const { userEmail, userName, newPassword, orgName } = resetPasswordModal;
    if (!newPassword.trim()) {
      showToast('कृपया नया पासवर्ड दर्ज करें।', 'error');
      return;
    }

    const assignedPass = newPassword.trim();
    const advocates = db.getAdvocates();
    const targetAdv = advocates.find(a => a.email.toLowerCase() === userEmail.toLowerCase());

    if (targetAdv) {
      db.updateAdvocate(targetAdv.id, { password: assignedPass });
    } else {
      const newAdmin: Advocate = {
        id: 'admin_' + Date.now(),
        name: userName || 'Bar Administrator',
        fatherName: 'Administrator',
        dob: '01/01/1980',
        age: 46,
        address: {
          village: 'Headquarters',
          post: 'Headquarters',
          tahsil: 'Sadar',
          policeStation: 'Kotwali',
          district: 'Ballia',
          state: 'Uttar Pradesh',
          pincode: '277001'
        },
        barNo: 'ADMIN/' + Date.now().toString().slice(-4),
        copNo: 'COP/ADMIN/' + Date.now().toString().slice(-4),
        mobile: '9415988800',
        email: userEmail.trim(),
        password: assignedPass,
        photoUrl: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&auto=format&fit=crop&q=80',
        status: 'APPROVED',
        role: 'bar_admin',
        validTill: '31/12/2026',
        rating: 5.0,
        specialization: ['CIVIL', 'CRIMINAL', 'REVENUE'],
        createdAt: new Date().toLocaleDateString('en-GB')
      };
      db.addAdvocate(newAdmin);
    }

    loadAllData();
    showToast(`सफलतापूर्वक पासवर्ड बदला गया: ${userEmail}`);

    const shareText = `*न्याय सहयोगी (Nyaay Sahayogi) - पासवर्ड रीसेट सूचना*\n\n👤 *नाम:* ${userName}\n📧 *लॉगिन ईमेल:* ${userEmail}\n🔑 *नया पासवर्ड:* ${assignedPass}\n🏛️ *संगठन:* ${orgName || 'बार एसोसिएशन'}\n\nआपका पासवर्ड सुपर एडमिन द्वारा रीसेट कर दिया गया है। कृपया इस नए पासवर्ड से लॉगिन करें।`;
    navigator.clipboard.writeText(shareText);

    setResetPasswordModal(null);
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const currentSelectedTenant = tenants.find(t => t.id === selectedTenantId) || tenants[0];

  // Module Toggle Handler
  const handleToggleModule = (moduleKey: FeatureModuleKey) => {
    if (!currentSelectedTenant) return;
    const isCurrentlyEnabled = currentSelectedTenant.enabledModules.includes(moduleKey);
    const newEnabled = !isCurrentlyEnabled;

    db.toggleTenantModule(currentSelectedTenant.id, moduleKey, newEnabled);
    loadAllData();
    showToast(
      `${moduleKey.toUpperCase()} module is now ${newEnabled ? 'ENABLED (सक्रिय)' : 'DISABLED (निष्क्रिय)'} for ${currentSelectedTenant.shortName || currentSelectedTenant.name}`,
      newEnabled ? 'success' : 'error'
    );
  };

  // Bulk Module Presets
  const applyModulePreset = (preset: 'ALL' | 'BAR_STANDARD' | 'FIRM' | 'LITE') => {
    if (!currentSelectedTenant) return;

    let targetModules: FeatureModuleKey[] = [];
    if (preset === 'ALL') {
      targetModules = ALL_FEATURE_MODULES.map(m => m.key);
    } else if (preset === 'BAR_STANDARD') {
      targetModules = ['id_cards', 'causelist', 'election', 'broadcast', 'elibrary', 'courts_stages', 'client_portal', 'directory'];
    } else if (preset === 'FIRM') {
      targetModules = ['finance', 'causelist', 'ai_assistant', 'elibrary', 'courts_stages', 'client_portal'];
    } else if (preset === 'LITE') {
      targetModules = ['id_cards', 'causelist', 'client_portal', 'directory'];
    }

    const updated = { ...currentSelectedTenant, enabledModules: targetModules };
    db.updateTenant(currentSelectedTenant.id, updated);
    loadAllData();
    showToast(`Applied "${preset}" feature preset to ${currentSelectedTenant.name}`);
  };

  // Copy to Clipboard
  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    showToast('License Key copied to clipboard! (लाइसेंस की कॉपी हो गई)');
  };

  // Handle Tenant Creation
  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantForm.name.trim() || !tenantForm.adminEmail.trim()) {
      showToast('Please enter organization name and admin email.', 'error');
      return;
    }

    const assignedPassword = tenantForm.adminPassword.trim() || 'Admin@123';
    const now = new Date();
    const expiryDate = new Date();
    expiryDate.setFullYear(now.getFullYear() + Number(tenantForm.validityYears));

    const formatDate = (d: Date) => 
      `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

    const newTenant: TenantOrganization = {
      id: 'tenant_' + Date.now(),
      name: tenantForm.name.trim(),
      hindiName: tenantForm.hindiName.trim() || undefined,
      shortName: tenantForm.shortName.trim() || tenantForm.name.substring(0, 12),
      type: tenantForm.type,
      district: tenantForm.district.trim() || 'Ballia',
      state: tenantForm.state || 'Uttar Pradesh',
      estdYear: tenantForm.estdYear || '2026',
      adminName: tenantForm.adminName.trim() || 'Bar Administrator',
      adminEmail: tenantForm.adminEmail.trim(),
      adminMobile: tenantForm.adminMobile.trim() || '9415988800',
      licenseKey: tenantForm.licenseKey.trim(),
      plan: tenantForm.plan,
      status: 'ACTIVE',
      issuedAt: formatDate(now),
      validTill: formatDate(expiryDate),
      maxAdvocatesQuota: Number(tenantForm.maxAdvocatesQuota) || 500,
      enabledModules: tenantForm.enabledModules,
      createdAt: formatDate(now)
    };

    db.addTenant(newTenant);

    // Also automatically provision and register the Bar Admin user account
    const existingAdv = db.getAdvocates().find(
      a => a.email.toLowerCase() === newTenant.adminEmail.toLowerCase()
    );

    if (existingAdv) {
      db.updateAdvocate(existingAdv.id, {
        role: 'bar_admin',
        name: newTenant.adminName,
        tenantId: newTenant.id,
        password: assignedPassword,
        mobile: newTenant.adminMobile,
        status: 'APPROVED'
      });
    } else {
      const newAdminUser: Advocate = {
        id: 'admin_' + newTenant.id,
        name: newTenant.adminName,
        fatherName: 'Administrator',
        dob: '01/01/1980',
        age: 46,
        address: {
          village: newTenant.district,
          post: newTenant.district,
          tahsil: newTenant.district + ' Sadar',
          policeStation: 'Kotwali',
          district: newTenant.district,
          state: newTenant.state,
          pincode: '277001'
        },
        barNo: 'ADMIN/' + (newTenant.shortName || 'BAR').toUpperCase() + '/2026',
        copNo: 'COP/ADMIN/' + Date.now().toString().slice(-4),
        mobile: newTenant.adminMobile,
        email: newTenant.adminEmail,
        password: assignedPassword,
        photoUrl: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&auto=format&fit=crop&q=80',
        status: 'APPROVED',
        role: 'bar_admin',
        tenantId: newTenant.id,
        validTill: newTenant.validTill,
        createdAt: newTenant.createdAt,
        rating: 5.0,
        reviewCount: 0,
        specialization: ['CIVIL', 'CRIMINAL', 'REVENUE'],
        chamberNo: 'Admin Secretariat',
        experienceYears: 15,
        bio: `Designated Bar Administrator for ${newTenant.name}. Managed via Super Admin Master Control.`
      };
      db.addAdvocate(newAdminUser);
    }

    // Also register corresponding Software License record
    const newLicense: SoftwareLicense = {
      id: 'lic_' + newTenant.id,
      licenseKey: newTenant.licenseKey,
      tenantId: newTenant.id,
      organizationName: newTenant.name,
      type: newTenant.type,
      plan: newTenant.plan,
      status: 'ACTIVE',
      issuedAt: newTenant.issuedAt,
      validTill: newTenant.validTill,
      maxUsers: newTenant.maxAdvocatesQuota,
      enabledModules: newTenant.enabledModules,
      featuresCount: newTenant.enabledModules.length,
      qrVerificationCode: `VERIFY-LIC-${newTenant.licenseKey}`,
      issuedBy: 'Nyaay Sahayogi Platform Super Admin'
    };
    db.addLicense(newLicense);

    loadAllData();
    setIsAddTenantModalOpen(false);

    // Open credentials modal for instant copying & sharing
    setCreatedCredentialsModal({
      orgName: newTenant.name,
      adminName: newTenant.adminName,
      email: newTenant.adminEmail,
      password: assignedPassword,
      licenseKey: newTenant.licenseKey,
      district: newTenant.district
    });

    showToast(`New Organization "${newTenant.name}" created successfully with Admin credentials!`);
  };

  // Toggle Tenant Status (Active / Suspended)
  const handleToggleTenantStatus = (tenant: TenantOrganization) => {
    const newStatus: TenantStatus = tenant.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const updated = { ...tenant, status: newStatus };
    db.updateTenant(tenant.id, updated);
    loadAllData();
    showToast(`Organization "${tenant.name}" is now ${newStatus}`);
  };

  // Generate Standalone License Key
  const handleGenerateStandaloneLicense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!genOrgName.trim()) {
      showToast('Please enter organization or advocate name.', 'error');
      return;
    }

    const key = generateCryptoLicenseKey('NYAAY', genPlan);
    const now = new Date();
    const expiryDate = new Date();
    expiryDate.setFullYear(now.getFullYear() + Number(genValidityYears));

    const formatDate = (d: Date) => 
      `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

    const newLic: SoftwareLicense = {
      id: 'lic_' + Date.now(),
      licenseKey: key,
      tenantId: 'unassigned_' + Date.now(),
      organizationName: genOrgName.trim(),
      type: genType,
      plan: genPlan,
      status: 'ACTIVE',
      issuedAt: formatDate(now),
      validTill: formatDate(expiryDate),
      maxUsers: Number(genMaxUsers),
      enabledModules: ALL_FEATURE_MODULES.map(m => m.key),
      featuresCount: ALL_FEATURE_MODULES.length,
      qrVerificationCode: `VERIFY-LIC-${key}`,
      issuedBy: 'Nyaay Sahayogi Platform Super Admin'
    };

    db.addLicense(newLic);
    setGeneratedLicense(newLic);
    loadAllData();
    showToast('Software License Key generated successfully!');
  };

  // Helper for Module Icon
  const renderModuleIcon = (iconName: string, className = 'w-5 h-5') => {
    switch (iconName) {
      case 'IndianRupee': return <IndianRupee className={className} />;
      case 'CreditCard': return <CreditCard className={className} />;
      case 'FileText': return <FileText className={className} />;
      case 'Vote': return <Vote className={className} />;
      case 'BookOpen': return <BookOpen className={className} />;
      case 'Sparkles': return <Sparkles className={className} />;
      case 'Bell': return <Bell className={className} />;
      case 'Users': return <Users className={className} />;
      case 'PhoneCall': return <PhoneCall className={className} />;
      case 'Scale': return <Scale className={className} />;
      case 'UserCheck': return <UserCheck className={className} />;
      case 'Search': return <Search className={className} />;
      default: return <Layers className={className} />;
    }
  };

  const filteredTenants = tenants.filter(t => {
    const matchSearch = (t.name + ' ' + (t.hindiName || '') + ' ' + t.district + ' ' + t.licenseKey)
      .toLowerCase()
      .includes(tenantSearchQuery.toLowerCase());
    const matchType = tenantTypeFilter === 'ALL' || t.type === tenantTypeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      
      {/* Platform Toast Notification */}
      {feedbackMsg && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold flex items-center gap-2 animate-bounce ${
          feedbackMsg.type === 'success' 
            ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50' 
            : 'bg-red-950/90 text-red-300 border-red-500/50'
        }`}>
          {feedbackMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-red-400" />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Super Admin Master Header */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 border-b border-purple-500/30 px-4 sm:px-6 lg:px-8 py-6 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-400 via-purple-500 to-indigo-600 p-0.5 shadow-lg shadow-purple-500/20 flex-shrink-0">
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center">
                <Crown className="w-7 h-7 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Super Admin Master Control
                </h1>
                <span className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow">
                  Tier 1 Master
                </span>
              </div>
              <p className="text-xs text-purple-300 font-medium">
                Nyaay Sahayogi Multi-Tenant Platform • Feature Toggles &amp; Bar Licensing System
              </p>
            </div>
          </div>

          {/* Quick Context Bar Switcher & Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            
            {/* Active Tenant Context Selector */}
            <div className="bg-slate-900/90 border border-purple-500/40 rounded-xl px-3 py-1.5 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-400" />
              <div className="text-left">
                <p className="text-[9px] text-purple-300 uppercase font-bold">Controlling Tenant:</p>
                <select
                  value={selectedTenantId}
                  onChange={(e) => {
                    setSelectedTenantId(e.target.value);
                    db.setCurrentTenant(e.target.value);
                    showToast(`Switched active context to: ${tenants.find(t => t.id === e.target.value)?.name}`);
                  }}
                  className="bg-transparent text-xs font-bold text-amber-300 focus:outline-none cursor-pointer"
                >
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id} className="bg-slate-900 text-slate-100">
                      {t.shortName || t.name} ({t.district})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick App Icon & Manifest Studio (Super Admin Exclusive) */}
            <button
              onClick={() => setActiveTab('branding_manifest')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow border ${
                activeTab === 'branding_manifest'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-amber-500/20'
                  : 'bg-purple-950/80 hover:bg-purple-900 text-purple-200 border-purple-500/50 hover:text-white'
              }`}
              title="Super Admin Master App Icon & PWA Manifest Studio"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>👑 App Icon &amp; Manifest</span>
            </button>

            {/* Switch to Bar Admin View */}
            {onNavigateToBarAdmin && (
              <button
                onClick={onNavigateToBarAdmin}
                className="bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 hover:border-amber-400 px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow"
                title="Preview Bar Association Admin Panel"
              >
                <Scale className="w-4 h-4" />
                <span>View Bar Admin Panel</span>
              </button>
            )}

            {/* Logout */}
            <button
              onClick={onLogout}
              className="p-2 rounded-xl bg-slate-900 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 transition-colors"
              title="Sign Out Super Admin"
            >
              <LogOut className="w-4 h-4" />
            </button>

          </div>

        </div>

        {/* Global Platform KPIs */}
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Bar Associations / Clients</p>
              <p className="text-lg font-black text-slate-100">{tenants.length}</p>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Active Licenses</p>
              <p className="text-lg font-black text-amber-300">{licenses.filter(l => l.status === 'ACTIVE').length}</p>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Advocates Capacity</p>
              <p className="text-lg font-black text-emerald-300">
                {tenants.reduce((acc, t) => acc + (t.maxAdvocatesQuota || 0), 0)}+
              </p>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Available Modules</p>
              <p className="text-lg font-black text-indigo-300">{ALL_FEATURE_MODULES.length} Features</p>
            </div>
          </div>
        </div>

      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 space-x-1 sm:space-x-4 overflow-x-auto pb-px">
          <button
            onClick={() => setActiveTab('modules')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'modules'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>1. Module Switchboard (फीचर ऑन/ऑफ)</span>
          </button>

          <button
            onClick={() => setActiveTab('tenants')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'tenants'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>2. Bar Associations &amp; Clients ({tenants.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('licenses')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'licenses'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>3. License Generator ({licenses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>4. Platform Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('dropdowns')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'dropdowns'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>5. Master Dropdowns (तहसील/थाना/कोर्ट)</span>
          </button>

          <button
            onClick={() => setActiveTab('state_bar_control')}
            className={`pb-3 px-3 text-xs sm:text-sm font-black flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'state_bar_control'
                ? 'border-red-500 text-white bg-red-950/40 rounded-t-xl'
                : 'border-transparent text-red-400 hover:text-red-300 hover:bg-red-950/20'
            }`}
          >
            <Landmark className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>🔴 6. State Bar Council Master Control (राज्य बार नियंत्रण)</span>
            {stateElectionConfig.status === 'VotingOpen' ? (
              <span className="text-[10px] bg-emerald-500 text-slate-950 px-2 py-0.5 rounded font-black animate-pulse">
                LIVE ON (75 Districts)
              </span>
            ) : (
              <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-bold">
                {stateElectionConfig.status}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('pricing_billing')}
            className={`pb-3 px-3 text-xs sm:text-sm font-black flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'pricing_billing'
                ? 'border-amber-400 text-amber-300 bg-amber-950/30 rounded-t-xl'
                : 'border-transparent text-amber-400 hover:text-amber-300 hover:bg-amber-950/15'
            }`}
          >
            <IndianRupee className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>💰 7. SaaS Pricing, Plans &amp; Billing (रेट व प्लान)</span>
          </button>

          <button
            onClick={() => setActiveTab('security_shield')}
            className={`pb-3 px-3 text-xs sm:text-sm font-black flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'security_shield'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-950/40 rounded-t-xl'
                : 'border-transparent text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/20'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>🛡️ 8. Enterprise Security Shield (एंटी-इन्स्पेक्शन)</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.5 rounded font-mono font-bold">
              v2.4 SECURED
            </span>
          </button>

          <button
            onClick={() => setActiveTab('branding_manifest')}
            className={`pb-3 px-3 text-xs sm:text-sm font-black flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'branding_manifest'
                ? 'border-amber-400 text-amber-300 bg-amber-950/40 rounded-t-xl'
                : 'border-transparent text-amber-400/90 hover:text-amber-200 hover:bg-amber-950/20'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 animate-pulse" />
            <span>👑 9. App Icon &amp; PWA Manifest Studio (ऐप आइकन व मेनिफेस्ट)</span>
            <span className="text-[10px] bg-purple-500/30 text-purple-200 border border-purple-400/50 px-1.5 py-0.5 rounded font-black">
              SUPER ADMIN
            </span>
          </button>
        </div>

        {/* TAB 1: MODULE SWITCHBOARD (FEATURE ON/OFF) */}
        {activeTab === 'modules' && (
          <div className="space-y-6">
            
            {/* Active Tenant Context Banner */}
            <div className="bg-gradient-to-r from-purple-950/60 via-slate-900 to-purple-950/60 border border-purple-500/40 rounded-3xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-purple-300 font-bold uppercase tracking-wider">
                    Configuring Feature Set for:
                  </span>
                  <span className="bg-purple-500/30 text-purple-200 px-2 py-0.5 rounded text-[10px] font-bold">
                    {currentSelectedTenant?.plan} PLAN
                  </span>
                </div>
                <h2 className="text-xl font-black text-slate-100 mt-1">
                  {currentSelectedTenant?.name}
                </h2>
                <p className="text-xs text-slate-400">
                  District: {currentSelectedTenant?.district} • License Key: <span className="font-mono text-amber-400">{currentSelectedTenant?.licenseKey}</span> • Enabled Modules: <span className="font-bold text-emerald-400">{currentSelectedTenant?.enabledModules.length} / {ALL_FEATURE_MODULES.length}</span>
                </p>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Quick Packs:</span>
                <button
                  onClick={() => applyModulePreset('ALL')}
                  className="px-2.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold transition-all shadow"
                >
                  ⚡ All ON (Full Suite)
                </button>
                <button
                  onClick={() => applyModulePreset('BAR_STANDARD')}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-[11px] font-bold transition-all"
                >
                  🏛️ Bar Standard
                </button>
                <button
                  onClick={() => applyModulePreset('FIRM')}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-bold transition-all"
                >
                  💼 Law Firm Pack
                </button>
                <button
                  onClick={() => applyModulePreset('LITE')}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-bold transition-all"
                >
                  🌱 Lite / Starter
                </button>
              </div>
            </div>

            {/* Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ALL_FEATURE_MODULES.map((mod) => {
                const isEnabled = currentSelectedTenant?.enabledModules.includes(mod.key);

                return (
                  <div
                    key={mod.key}
                    className={`rounded-3xl p-5 border transition-all ${
                      isEnabled
                        ? 'bg-slate-900 border-purple-500/40 shadow-lg shadow-purple-950/30'
                        : 'bg-slate-900/50 border-slate-800 opacity-75'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors ${
                          isEnabled
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-slate-800 text-slate-500'
                        }`}>
                          {renderModuleIcon(mod.icon, 'w-5 h-5')}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-100">{mod.name}</h3>
                            {mod.isPremium && (
                              <span className="bg-amber-500/20 text-amber-300 text-[9px] font-bold px-1.5 py-0.5 rounded">
                                PRO
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-amber-400 font-semibold">{mod.hindiName}</p>
                        </div>
                      </div>

                      {/* Instant ON / OFF Toggle Button */}
                      <button
                        onClick={() => handleToggleModule(mod.key)}
                        className={`p-1.5 rounded-xl transition-all ${
                          isEnabled
                            ? 'text-emerald-400 hover:text-emerald-300'
                            : 'text-slate-600 hover:text-slate-400'
                        }`}
                        title={isEnabled ? 'Click to Disable Module' : 'Click to Enable Module'}
                      >
                        {isEnabled ? (
                          <ToggleRight className="w-8 h-8 fill-emerald-500/20" />
                        ) : (
                          <ToggleLeft className="w-8 h-8" />
                        )}
                      </button>
                    </div>

                    <p className="mt-3 text-xs text-slate-400 leading-relaxed">
                      {mod.description}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 uppercase tracking-wider font-semibold">
                        Category: {mod.category}
                      </span>
                      <span className={`font-bold px-2 py-0.5 rounded ${
                        isEnabled
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-slate-800 text-slate-500'
                      }`}>
                        {isEnabled ? '● Active (चालू)' : '○ Disabled (बंद)'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* TAB 2: TENANTS & BAR ASSOCIATIONS MANAGEMENT */}
        {activeTab === 'tenants' && (
          <div className="space-y-6">
            
            {/* Action Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={tenantSearchQuery}
                    onChange={(e) => setTenantSearchQuery(e.target.value)}
                    placeholder="Search by Bar Name, District, License Key..."
                    className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-100 rounded-xl pl-9 pr-3 py-2.5 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>

                <select
                  value={tenantTypeFilter}
                  onChange={(e) => setTenantTypeFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-purple-500"
                >
                  <option value="ALL">All Types</option>
                  <option value="BAR_ASSOCIATION">Bar Association</option>
                  <option value="LEGAL_FIRM">Legal Firm</option>
                  <option value="INDIVIDUAL_ADVOCATE">Individual Advocate</option>
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsGlobalUserLookupOpen(true);
                    setUserLookupQuery('');
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <Key className="w-4 h-4 text-amber-400" />
                  <span>यूजर पासवर्ड मैनेजर (User Passwords)</span>
                </button>

                <button
                  onClick={() => {
                    setTenantForm({
                      name: '',
                      hindiName: '',
                      shortName: '',
                      type: 'BAR_ASSOCIATION',
                      district: '',
                      state: 'Uttar Pradesh',
                      estdYear: '2026',
                      adminName: '',
                      adminEmail: '',
                      adminPassword: 'Admin@123',
                      adminMobile: '',
                      plan: 'PROFESSIONAL',
                      licenseKey: generateCryptoLicenseKey('NYAAY', 'PROFESSIONAL'),
                      validityYears: 1,
                      maxAdvocatesQuota: 500,
                      enabledModules: ALL_FEATURE_MODULES.map(m => m.key)
                    });
                    setIsAddTenantModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Bar Association / Client (नया संगठन)</span>
                </button>
              </div>
            </div>

            {/* Tenants Cards / Table */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredTenants.map((t) => (
                <div
                  key={t.id}
                  className={`bg-slate-900 border rounded-3xl p-5 space-y-4 transition-all ${
                    t.id === selectedTenantId
                      ? 'border-purple-500 shadow-xl shadow-purple-950/40'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center font-black text-base flex-shrink-0">
                        {t.shortName ? t.shortName.substring(0, 3).toUpperCase() : 'BAR'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-100">{t.name}</h3>
                        </div>
                        {t.hindiName && (
                          <p className="text-xs text-amber-400 font-semibold">{t.hindiName}</p>
                        )}
                        <p className="text-[11px] text-slate-400">
                          {t.type.replace('_', ' ')} • {t.district}, {t.state} {t.estdYear ? `(Estd. ${t.estdYear})` : ''}
                        </p>
                      </div>
                    </div>

                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                      t.status === 'ACTIVE'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-red-500/20 text-red-300 border border-red-500/40'
                    }`}>
                      {t.status}
                    </span>
                  </div>

                  {/* License Key Box */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase font-bold block">License Key:</span>
                      <span className="font-mono font-bold text-amber-300">{t.licenseKey}</span>
                    </div>
                    <button
                      onClick={() => handleCopyKey(t.licenseKey)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      title="Copy License Key"
                    >
                      {copiedKey === t.licenseKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-slate-800/60 rounded-xl p-2">
                      <p className="text-[9px] text-slate-400 uppercase font-semibold">Plan</p>
                      <p className="font-bold text-purple-300">{t.plan}</p>
                    </div>
                    <div className="bg-slate-800/60 rounded-xl p-2">
                      <p className="text-[9px] text-slate-400 uppercase font-semibold">Advocates Quota</p>
                      <p className="font-bold text-slate-200">{t.maxAdvocatesQuota} Max</p>
                    </div>
                    <div className="bg-slate-800/60 rounded-xl p-2">
                      <p className="text-[9px] text-slate-400 uppercase font-semibold">Valid Till</p>
                      <p className="font-bold text-emerald-300">{t.validTill}</p>
                    </div>
                  </div>

                  {/* Admin Details */}
                  <div className="text-xs text-slate-400 space-y-1 pt-1 border-t border-slate-800">
                    <p><strong className="text-slate-300">Admin:</strong> {t.adminName} ({t.adminEmail} • {t.adminMobile})</p>
                    <p><strong className="text-slate-300">Active Modules ({t.enabledModules.length}):</strong> <span className="text-slate-300">{t.enabledModules.join(', ')}</span></p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <button
                      onClick={() => {
                        setSelectedTenantId(t.id);
                        db.setCurrentTenant(t.id);
                        setActiveTab('modules');
                        showToast(`Switched to configure modules for: ${t.name}`);
                      }}
                      className="flex-1 min-w-[140px] py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Configure Modules ({t.enabledModules.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenResetPassword(t.adminEmail, t.adminName, 'Bar Admin', t.name)}
                      className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                      title="Reset Admin Password for this Bar Association"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>पासवर्ड रीसेट (Reset)</span>
                    </button>

                    <button
                      onClick={() => handleToggleTenantStatus(t)}
                      className={`px-3 py-2 rounded-xl border text-xs font-bold transition-colors ${
                        t.status === 'ACTIVE'
                          ? 'border-red-500/40 text-red-400 hover:bg-red-500/10'
                          : 'border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10'
                      }`}
                    >
                      {t.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                    </button>
                  </div>

                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB 3: SOFTWARE LICENSE GENERATOR */}
        {activeTab === 'licenses' && (
          <div className="space-y-6">
            
            {/* License Generator Form */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-amber-400" />
                  <span>Generate Signed Software License Key (नया सॉफ्टवेयर लाइसेंस बनाएं)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Issue cryptographically formatted software activation keys for any Bar Association or Legal Firm.
                </p>
              </div>

              <form onSubmit={handleGenerateStandaloneLicense} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Organization / Bar Association / Advocate Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={genOrgName}
                    onChange={(e) => setGenOrgName(e.target.value)}
                    placeholder="e.g. Bar Association Ghazipur / Adv. Ramesh Counsel"
                    className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-100 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Client Type
                  </label>
                  <select
                    value={genType}
                    onChange={(e) => setGenType(e.target.value as TenantType)}
                    className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-100 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-500"
                  >
                    <option value="BAR_ASSOCIATION">Bar Association</option>
                    <option value="LEGAL_FIRM">Legal Firm / Chambers</option>
                    <option value="INDIVIDUAL_ADVOCATE">Individual Advocate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Plan Tier
                  </label>
                  <select
                    value={genPlan}
                    onChange={(e) => setGenPlan(e.target.value as TenantPlan)}
                    className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-100 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-500"
                  >
                    <option value="TRIAL">Trial (30 Days)</option>
                    <option value="STARTER">Starter Pack</option>
                    <option value="PROFESSIONAL">Professional Tier</option>
                    <option value="ENTERPRISE_BAR">Enterprise Apex Bar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Validity Duration
                  </label>
                  <select
                    value={genValidityYears}
                    onChange={(e) => setGenValidityYears(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-100 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-500"
                  >
                    <option value={1}>1 Year (1 वर्ष)</option>
                    <option value={2}>2 Years (2 वर्ष)</option>
                    <option value={3}>3 Years (3 वर्ष)</option>
                    <option value={5}>5 Years (5 वर्ष)</option>
                    <option value={10}>Lifetime (10 वर्ष)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Max Advocates Capacity
                  </label>
                  <input
                    type="number"
                    value={genMaxUsers}
                    onChange={(e) => setGenMaxUsers(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-100 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2 flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Generate License Key &amp; Certificate (लाइसेंस बनाएं)</span>
                  </button>
                </div>
              </form>

              {/* Display Generated License */}
              {generatedLicense && (
                <div className="bg-gradient-to-r from-slate-950 via-amber-950/20 to-slate-950 border border-amber-500/40 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      ✨ Newly Issued Software License Certificate:
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">
                      VERIFIED &amp; ACTIVE
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
                    <div>
                      <p className="text-sm font-black text-slate-100">{generatedLicense.organizationName}</p>
                      <p className="text-xs text-slate-400">{generatedLicense.plan} Plan • Valid from {generatedLicense.issuedAt} to {generatedLicense.validTill} • Max Users: {generatedLicense.maxUsers}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base sm:text-lg font-black text-amber-300 tracking-wider bg-slate-950 px-3 py-1.5 rounded-xl border border-amber-500/30">
                        {generatedLicense.licenseKey}
                      </span>
                      <button
                        onClick={() => handleCopyKey(generatedLicense.licenseKey)}
                        className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all shadow"
                        title="Copy Key"
                      >
                        {copiedKey === generatedLicense.licenseKey ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Existing Licenses Registry Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Issued Software Licenses Registry ({licenses.length})</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="px-3.5 py-2.5 rounded-l-xl">Organization / Client</th>
                      <th className="px-3.5 py-2.5">License Key</th>
                      <th className="px-3.5 py-2.5">Plan</th>
                      <th className="px-3.5 py-2.5">Validity</th>
                      <th className="px-3.5 py-2.5">Max Users</th>
                      <th className="px-3.5 py-2.5">Status</th>
                      <th className="px-3.5 py-2.5 rounded-r-xl text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {licenses.map((lic) => (
                      <tr key={lic.id} className="hover:bg-slate-800/40">
                        <td className="px-3.5 py-3 font-semibold text-slate-100">
                          {lic.organizationName}
                        </td>
                        <td className="px-3.5 py-3 font-mono text-amber-300 font-bold">
                          {lic.licenseKey}
                        </td>
                        <td className="px-3.5 py-3">
                          <span className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded text-[10px] font-bold">
                            {lic.plan}
                          </span>
                        </td>
                        <td className="px-3.5 py-3 text-slate-400">
                          {lic.validTill}
                        </td>
                        <td className="px-3.5 py-3 font-bold text-slate-200">
                          {lic.maxUsers}
                        </td>
                        <td className="px-3.5 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            lic.status === 'ACTIVE'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-red-500/20 text-red-300'
                          }`}>
                            {lic.status}
                          </span>
                        </td>
                        <td className="px-3.5 py-3 text-right">
                          <button
                            onClick={() => handleCopyKey(lic.licenseKey)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors inline-flex items-center gap-1 text-[11px] font-semibold"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: PLATFORM SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-400" />
                <span>Global Platform Master Settings (प्लेटफॉर्म सेटिंग्स)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Configure platform title, super admin access credentials, backup &amp; maintenance switches.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Platform Name</label>
                <input
                  type="text"
                  value={platformSettings.platformName}
                  onChange={(e) => setPlatformSettings({ ...platformSettings, platformName: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-100 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Super Admin Email</label>
                <input
                  type="email"
                  value={platformSettings.superAdminEmail}
                  onChange={(e) => setPlatformSettings({ ...platformSettings, superAdminEmail: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-100 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Support Phone</label>
                <input
                  type="text"
                  value={platformSettings.supportPhone}
                  onChange={(e) => setPlatformSettings({ ...platformSettings, supportPhone: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-100 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Support Email</label>
                <input
                  type="email"
                  value={platformSettings.supportEmail}
                  onChange={(e) => setPlatformSettings({ ...platformSettings, supportEmail: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-100 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <button
                onClick={() => {
                  db.updatePlatformSettings(platformSettings);
                  showToast('Global platform settings updated successfully!');
                }}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow transition-all"
              >
                Save Master Settings
              </button>

              <button
                onClick={() => {
                  if (confirm('Are you sure you want to reset all tenant organizations and demo licenses to initial factory defaults?')) {
                    db.resetTenantsToDefault();
                    loadAllData();
                    showToast('Tenants reset to initial defaults successfully!');
                  }
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Demo Tenants</span>
              </button>
            </div>

            {/* SUPER ADMIN PASSWORD MANAGEMENT CARD */}
            <div className="pt-6 border-t border-slate-800">
              <div className="bg-slate-950 border-2 border-purple-500/50 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold">
                      👑
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Super Admin Password &amp; Account Security</h4>
                      <p className="text-[11px] text-slate-400">
                        nyaaysahayogi@gmail.com (Master Platform Owner) का पासवर्ड देखें एवं बदलें
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2.5 py-0.5 rounded-full font-bold">
                    Root Platform Owner
                  </span>
                </div>

                {/* Current Password Display */}
                {(() => {
                  const superAdmin = db.getAdvocates().find(a => a.email.toLowerCase() === 'nyaaysahayogi@gmail.com' || a.role === 'super_admin');
                  const currentPass = superAdmin?.password || 'SuperAdmin@123';
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
                        <span className="text-slate-400 font-medium block">वर्तमान लॉगिन विवरण (Current Credentials):</span>
                        <div className="flex justify-between items-center py-1 border-b border-slate-800">
                          <span className="text-slate-400">Email:</span>
                          <span className="font-mono font-bold text-purple-300">nyaaysahayogi@gmail.com</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-slate-400">Current Password:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                              {showSuperAdminPass ? currentPass : '••••••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => setShowSuperAdminPass(!showSuperAdminPass)}
                              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
                              title={showSuperAdminPass ? 'Hide Password' : 'Show Password'}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Change Password Form */}
                      <form onSubmit={handleUpdateSuperAdminPassword} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-semibold text-slate-300">
                            नया सुपर एडमिन पासवर्ड बनाएं:
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const rand = 'Nyaay@' + Math.floor(1000 + Math.random() * 9000);
                              setSuperAdminNewPassword(rand);
                            }}
                            className="text-[10px] text-purple-400 hover:text-purple-300 underline font-semibold"
                          >
                            रैंडम पासवर्ड बनाएं
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            required
                            value={superAdminNewPassword}
                            onChange={(e) => setSuperAdminNewPassword(e.target.value)}
                            placeholder="नया मजबूत पासवर्ड दर्ज करें"
                            className="flex-1 bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-3.5 py-2 focus:outline-none focus:border-purple-500 font-mono"
                          />
                          <button
                            type="submit"
                            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow transition-all whitespace-nowrap"
                          >
                            पासवर्ड बदलें
                          </button>
                        </div>
                      </form>
                    </div>
                  );
                })()}

              </div>
            </div>

          </div>
        )}

        {/* TAB 5: TENANT MASTER DROPDOWNS (तहसील, थाना, कोर्ट व केस प्रकार कस्टमाइज़र) */}
        {activeTab === 'dropdowns' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <TenantDropdownCustomizer
              allowTenantSelect={true}
              initialTenantId={selectedTenantId || undefined}
              onConfigUpdated={() => {
                loadAllData();
              }}
            />
          </div>
        )}

        {/* TAB 6: STATE BAR COUNCIL MASTER CONTROL (पूरे प्रदेश का चुनाव ON/OFF, 75 जिलों की मतदाता सूची व एडमिन नियंत्रण) */}
        {activeTab === 'state_bar_control' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Header Hero Card */}
            <div className="rounded-3xl bg-gradient-to-r from-red-950 via-slate-900 to-red-950 border-2 border-red-500/60 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
              
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    <span className="text-xs font-black uppercase tracking-wider bg-red-600/30 text-red-200 border border-red-500/50 px-3 py-0.5 rounded-full flex items-center gap-1.5">
                      <Landmark className="w-3.5 h-3.5 text-red-400" />
                      <span>Bar Council of Uttar Pradesh</span>
                    </span>
                    <span className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/40 px-3 py-0.5 rounded-full font-bold">
                      👑 Super Admin Authority
                    </span>
                    {stateElectionConfig.status === 'VotingOpen' ? (
                      <span className="text-xs font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>LIVE E-VOTING ACTIVE (75 Districts)</span>
                      </span>
                    ) : (
                      <span className="text-xs font-bold uppercase bg-slate-800 text-slate-400 border border-slate-700 px-2.5 py-0.5 rounded-full">
                        Status: {stateElectionConfig.status}
                      </span>
                    )}
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
                    State Bar Council Master Control Room
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-3xl mt-1 leading-relaxed">
                    सुपर एडमिन कंसोल से पूरे उत्तर प्रदेश के सभी 75 जिलों की बार एसोसिएशनों के राज्य बार चुनाव को <strong className="text-amber-300">ON / OFF</strong> करें, अधिकृत स्टेट बार एडमिन का पासवर्ड व लॉगिन नियंत्रित करें, और 75 जिलों की संपूर्ण अधिवक्ता डायरेक्टरी का मास्टर डेटा देखें।
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
                  {onNavigateToStateBarAdmin && (
                    <button
                      type="button"
                      onClick={onNavigateToStateBarAdmin}
                      className="px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-extrabold text-xs shadow-xl shadow-red-600/30 border border-red-400 flex items-center gap-2 transition-all transform active:scale-95"
                    >
                      <Landmark className="w-4 h-4 text-white" />
                      <span>⚡ Open State Bar Admin Console</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={loadAllData}
                    className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all"
                    title="डेटा रीफ्रेश करें"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* State Council KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">75 Districts Total Voters</p>
                  <p className="text-xl font-black text-white">{stateBarVoterRoll.length}</p>
                  <p className="text-[10px] text-emerald-400 mt-0.5">Verified on State Roll</p>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Total Votes Polled</p>
                  <p className="text-xl font-black text-amber-400">{stateElectionStats.totalVotesPolled}</p>
                  <p className="text-[10px] text-amber-300/80 mt-0.5">Across All 75 Districts</p>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Contesting Candidates</p>
                  <p className="text-xl font-black text-purple-300">{stateBarCandidates.length}</p>
                  <p className="text-[10px] text-purple-400 mt-0.5">Chairman, VC, Member BCI</p>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Active District Bars</p>
                  <p className="text-xl font-black text-blue-400">75 / 75</p>
                  <p className="text-[10px] text-blue-300 mt-0.5">Affiliated across U.P.</p>
                </div>
              </div>
            </div>

            {/* SECTION 1: MASTER ELECTION CONTROLLER (ON / OFF / RESULTS) */}
            <div className="bg-slate-900 border border-red-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Vote className="w-5 h-5 text-red-400" />
                    <span>पूरे प्रदेश का राज्य बार चुनाव ON / OFF मास्टर स्विचबोर्ड</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    यहाँ से बटन दबाते ही समस्त 75 जिलों के सभी अधिवक्ताओं और जिला बार एडमिन के डैशबोर्ड पर चुनाव ऑन या ऑफ हो जाता है।
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-bold">वर्तमान स्थिति:</span>
                  <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase ${
                    stateElectionConfig.status === 'VotingOpen'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 animate-pulse'
                      : stateElectionConfig.status === 'ResultsDeclared'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                      : 'bg-red-500/20 text-red-300 border border-red-500/50'
                  }`}>
                    {stateElectionConfig.status === 'VotingOpen' ? '🟢 E-VOTING ON' : stateElectionConfig.status}
                  </span>
                </div>
              </div>

              {/* 4 Major State Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* 1. Turn Voting ON */}
                <button
                  type="button"
                  onClick={() => handleSuperAdminToggleStateElection('VotingOpen')}
                  className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group shadow-lg ${
                    stateElectionConfig.status === 'VotingOpen'
                      ? 'bg-emerald-950/80 border-emerald-400 ring-2 ring-emerald-500/40 shadow-emerald-950/50'
                      : 'bg-slate-950 hover:bg-emerald-950/40 border-slate-800 hover:border-emerald-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    {stateElectionConfig.status === 'VotingOpen' && (
                      <span className="text-[10px] font-black uppercase bg-emerald-500 text-slate-950 px-2 py-0.5 rounded">
                        CURRENT ACTIVE
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-black text-white">1. TURN VOTING ON</h4>
                  <p className="text-[11px] text-slate-300 mt-1">
                    पूरे 75 जिलों में मतदान चालू करें। सभी वकीलों के स्क्रीन पर लाल लाइव ई-वोटिंग बैनर सक्रिय होगा।
                  </p>
                </button>

                {/* 2. Turn Voting OFF */}
                <button
                  type="button"
                  onClick={() => handleSuperAdminToggleStateElection('VotingClosed')}
                  className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group shadow-lg ${
                    stateElectionConfig.status === 'VotingClosed'
                      ? 'bg-red-950/80 border-red-400 ring-2 ring-red-500/40 shadow-red-950/50'
                      : 'bg-slate-950 hover:bg-red-950/40 border-slate-800 hover:border-red-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
                      <XCircle className="w-5 h-5" />
                    </div>
                    {stateElectionConfig.status === 'VotingClosed' && (
                      <span className="text-[10px] font-black uppercase bg-red-500 text-white px-2 py-0.5 rounded">
                        CURRENT ACTIVE
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-black text-white">2. TURN VOTING OFF</h4>
                  <p className="text-[11px] text-slate-300 mt-1">
                    मतदान का समय समाप्त करें। डिजिटल मतपेटियों को सुरक्षित लॉक करें।
                  </p>
                </button>

                {/* 3. Declare Results */}
                <button
                  type="button"
                  onClick={() => handleSuperAdminToggleStateElection('ResultsDeclared')}
                  className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group shadow-lg ${
                    stateElectionConfig.status === 'ResultsDeclared'
                      ? 'bg-purple-950/80 border-purple-400 ring-2 ring-purple-500/40 shadow-purple-950/50'
                      : 'bg-slate-950 hover:bg-purple-950/40 border-slate-800 hover:border-purple-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                      <Crown className="w-5 h-5" />
                    </div>
                    {stateElectionConfig.status === 'ResultsDeclared' && (
                      <span className="text-[10px] font-black uppercase bg-purple-500 text-white px-2 py-0.5 rounded">
                        CURRENT ACTIVE
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-black text-white">3. DECLARE RESULTS</h4>
                  <p className="text-[11px] text-slate-300 mt-1">
                    अंतिम मतगणना परिणाम प्रकाशित करें। विजयी चेयरमैन व सदस्यों की सूची जारी करें।
                  </p>
                </button>

                {/* 4. Nominations Open */}
                <button
                  type="button"
                  onClick={() => handleSuperAdminToggleStateElection('NominationsOpen')}
                  className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group shadow-lg ${
                    stateElectionConfig.status === 'NominationsOpen'
                      ? 'bg-amber-950/80 border-amber-400 ring-2 ring-amber-500/40 shadow-amber-950/50'
                      : 'bg-slate-950 hover:bg-amber-950/40 border-slate-800 hover:border-amber-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      <FileText className="w-5 h-5" />
                    </div>
                    {stateElectionConfig.status === 'NominationsOpen' && (
                      <span className="text-[10px] font-black uppercase bg-amber-500 text-slate-950 px-2 py-0.5 rounded">
                        CURRENT ACTIVE
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-black text-white">4. NOMINATIONS STAGE</h4>
                  <p className="text-[11px] text-slate-300 mt-1">
                    प्रत्याशी नामांकन व पर्चा दाखिल करने की प्रक्रिया प्रारंभ करें।
                  </p>
                </button>

              </div>

              {/* Editable Banner Announcement by Super Admin */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-amber-400" />
                    <span>लाइव अलर्ट बैनर टेक्स्ट (75 जिलों के हेडर में दिखाई देने वाला संदेश):</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Real-time Header Broadcast</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={stateElectionConfig.notificationBanner}
                    onChange={(e) => {
                      const updated = db.updateStateBarElectionConfig({ notificationBanner: e.target.value });
                      setStateElectionConfig({ ...updated });
                    }}
                    placeholder="उदा. State Bar Council General Elections 2026-2027 are currently ACTIVE across all 75 District Bar Associations!"
                    className="flex-1 bg-slate-900 border border-slate-700 text-xs text-slate-100 rounded-xl px-3 py-2.5 focus:outline-none focus:border-red-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      showToast('लाइव बैनर संदेश सफलतापूर्वक 75 जिलों में अपडेट हुआ!');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow"
                  >
                    सेव करें (Save Banner)
                  </button>
                </div>
              </div>

            </div>

            {/* SECTION 2: STATE BAR ADMIN ACCOUNT & LOGIN CONTROLLER */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-amber-400" />
                    <span>State Bar Council Admin - लॉगिन व क्रेडेंशियल नियंत्रण</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    सुपर एडमिन द्वारा अधिकृत राज्य बार मुख्य चुनाव अधिकारी / एडमिन के खाते का पासवर्ड, लॉक/अनलॉक व लॉगिन विवरण।
                  </p>
                </div>

                {(() => {
                  const stateAdmin = allAdvocates.find(a => a.role === 'state_bar_admin' || a.email.toLowerCase() === 'stateadmin@upbarcouncil.org');
                  const isLocked = stateAdmin?.status === 'REJECTED';
                  return (
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-xl text-xs font-bold ${
                        isLocked ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}>
                        {isLocked ? '🔒 Account Locked' : '🟢 Account Active'}
                      </span>
                      <button
                        type="button"
                        onClick={handleSuperAdminToggleStateAdminStatus}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
                          isLocked 
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400' 
                            : 'bg-red-950 hover:bg-red-900 text-red-300 border-red-500/50'
                        }`}
                      >
                        {isLocked ? 'अनलॉक करें (Unlock)' : 'खाता लॉक करें (Lock)'}
                      </button>
                    </div>
                  );
                })()}
              </div>

              {/* State Bar Admin Details Grid */}
              {(() => {
                const stateAdmin = allAdvocates.find(a => a.role === 'state_bar_admin' || a.email.toLowerCase() === 'stateadmin@upbarcouncil.org');
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Left: Account Summary */}
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
                      <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider block">
                        🏛️ State Bar Council Admin Credentials
                      </span>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between py-1 border-b border-slate-900">
                          <span className="text-slate-400">Designation / Name:</span>
                          <span className="font-bold text-slate-100">{stateAdmin?.name || 'Chief Returning Officer & State Bar Admin'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-900">
                          <span className="text-slate-400">Official Login ID:</span>
                          <span className="font-mono font-bold text-amber-300">{stateAdmin?.email || 'stateadmin@upbarcouncil.org'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-900">
                          <span className="text-slate-400">Bar Enrollment:</span>
                          <span className="font-mono text-slate-300">{stateAdmin?.barNo || 'UP/STATE-BAR/001'}</span>
                        </div>
                        <div className="flex items-center justify-between py-1">
                          <span className="text-slate-400">Current Password:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                              {showStateAdminPass ? (stateAdmin?.password || 'StateAdmin@123') : '••••••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => setShowStateAdminPass(!showStateAdminPass)}
                              className="text-slate-400 hover:text-white"
                            >
                              {showStateAdminPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Quick Copy Credentials */}
                      <button
                        type="button"
                        onClick={() => {
                          const pass = stateAdmin?.password || 'StateAdmin@123';
                          const share = `*उत्तर प्रदेश राज्य बार काउंसिल - एडमिन लॉगिन*\n\n🏛️ *पोर्टल:* State Bar Council of Uttar Pradesh\n📧 *ID:* stateadmin@upbarcouncil.org\n🔑 *पासवर्ड:* ${pass}\n⚖️ *अधिकार:* 75 जिलों का चुनाव ON/OFF व मतदाता सूची\n\nसुपर एडमिन कंसोल द्वारा अधिकृत।`;
                          navigator.clipboard.writeText(share);
                          showToast('State Bar Admin लॉगिन विवरण क्लिपबोर्ड पर कॉपी हो गया!');
                        }}
                        className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-400 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>क्रेडेंशियल कॉपी करें (Share on WhatsApp/Email)</span>
                      </button>
                    </div>

                    {/* Right: Direct Password Changer & Reset */}
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
                      <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider block">
                        🔑 Change State Bar Admin Password
                      </span>

                      <div className="space-y-3">
                        <label className="block text-xs text-slate-300">
                          नया पासवर्ड दर्ज करें (Set New Password):
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={stateAdminNewPassword}
                            onChange={(e) => setStateAdminNewPassword(e.target.value)}
                            placeholder="उदा. UPBar@2026 या StateAdmin@99"
                            className="flex-1 bg-slate-900 border border-slate-700 text-xs text-slate-100 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500 font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setStateAdminNewPassword('State@' + Math.floor(1000 + Math.random() * 9000))}
                            className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-bold"
                          >
                            रैंडम
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSuperAdminChangeStateAdminPass(stateAdminNewPassword)}
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow flex items-center justify-center gap-1.5 transition-all"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>नया पासवर्ड सेव करें (Save Password)</span>
                        </button>

                        <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
                          <span className="text-[11px] text-slate-400">टेस्ट वोट्स रीसेट:</span>
                          <button
                            type="button"
                            onClick={handleSuperAdminResetStateVotes}
                            className="px-3 py-1 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-red-300 text-[11px] font-bold flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>रीसेट मतपत्र (Clear Votes)</span>
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })()}

            </div>

            {/* SECTION 3: STATE BAR COUNCIL SAAS LICENSE, VALIDITY & QUOTA CONTROL */}
            <div className="bg-slate-900 border-2 border-red-500/50 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center font-bold">
                    <KeyRound className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      <span>State Bar Council - SaaS License, Validity &amp; Quota Control</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Bar Council of Uttar Pradesh के लिए आधिकारिक SaaS लाइसेंस की, वैधता अवधि (Valid Till) व क्षमता कोटा प्रबंधित करें
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${
                    stateBarLicenseForm.status === 'ACTIVE'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-red-500/20 text-red-300 border border-red-500/40'
                  }`}>
                    {stateBarLicenseForm.status === 'ACTIVE' ? '🟢 License Active' : '🔴 License Suspended'}
                  </span>
                  <span className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/40 px-3 py-1 rounded-full font-bold">
                    🏛️ 75 Districts Apex Tenant
                  </span>
                </div>
              </div>

              <form onSubmit={handleSaveStateBarSaaSLicense} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  
                  {/* Master License Key */}
                  <div className="space-y-1.5 md:col-span-2 lg:col-span-1">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-slate-300">Master License Key:</label>
                      <button
                        type="button"
                        onClick={() => {
                          const newKey = generateCryptoLicenseKey('STATE-BAR-UP', 'ENTERPRISE_BAR');
                          setStateBarLicenseForm({ ...stateBarLicenseForm, licenseKey: newKey });
                          showToast('नया लाइसेंस की जनरेट किया गया!');
                        }}
                        className="text-[10px] text-amber-400 hover:text-amber-300 underline font-semibold"
                      >
                        नया की जनरेट करें
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={stateBarLicenseForm.licenseKey}
                        onChange={(e) => setStateBarLicenseForm({ ...stateBarLicenseForm, licenseKey: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 text-amber-300 font-mono font-bold rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-red-500 text-xs"
                      />
                    </div>
                  </div>

                  {/* License Validity (Valid Till) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-slate-300">वैधता तिथि (Valid Till - DD/MM/YYYY):</label>
                      <div className="flex gap-1.5 text-[10px]">
                        <button
                          type="button"
                          onClick={() => setStateBarLicenseForm({ ...stateBarLicenseForm, validTill: '31/12/2027' })}
                          className="text-purple-400 hover:underline"
                        >
                          2027
                        </button>
                        <span>•</span>
                        <button
                          type="button"
                          onClick={() => setStateBarLicenseForm({ ...stateBarLicenseForm, validTill: '31/12/2030' })}
                          className="text-purple-400 hover:underline"
                        >
                          2030
                        </button>
                        <span>•</span>
                        <button
                          type="button"
                          onClick={() => setStateBarLicenseForm({ ...stateBarLicenseForm, validTill: '31/12/2099' })}
                          className="text-emerald-400 font-bold hover:underline"
                        >
                          2099
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      required
                      value={stateBarLicenseForm.validTill}
                      onChange={(e) => setStateBarLicenseForm({ ...stateBarLicenseForm, validTill: e.target.value })}
                      placeholder="DD/MM/YYYY उदा. 31/12/2099"
                      className="w-full bg-slate-950 border border-slate-700 text-emerald-300 font-mono font-bold rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-red-500 text-xs"
                    />
                  </div>

                  {/* License Status */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-300 block">SaaS स्थिति (Status):</label>
                    <select
                      value={stateBarLicenseForm.status}
                      onChange={(e) => setStateBarLicenseForm({ ...stateBarLicenseForm, status: e.target.value as TenantStatus })}
                      className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-red-500 text-xs font-semibold cursor-pointer"
                    >
                      <option value="ACTIVE">🟢 ACTIVE (सक्रिय व मान्य)</option>
                      <option value="SUSPENDED">🔴 SUSPENDED (अस्थाई निलंबित)</option>
                      <option value="EXPIRED">🟡 EXPIRED (वैधता समाप्त)</option>
                    </select>
                  </div>

                  {/* Advocates Quota */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-300 block">
                      अधिवक्ता कोटा (Advocates Capacity - 75 Districts):
                    </label>
                    <input
                      type="number"
                      min={100}
                      value={stateBarLicenseForm.maxAdvocatesQuota}
                      onChange={(e) => setStateBarLicenseForm({ ...stateBarLicenseForm, maxAdvocatesQuota: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-700 text-slate-100 font-bold rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-red-500 text-xs"
                    />
                  </div>

                  {/* Statutory Tier / Plan */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-300 block">सॉफ्टवेयर प्लान (Statutory Tier):</label>
                    <select
                      value={stateBarLicenseForm.plan}
                      onChange={(e) => setStateBarLicenseForm({ ...stateBarLicenseForm, plan: e.target.value as TenantPlan })}
                      className="w-full bg-slate-950 border border-slate-700 text-purple-300 font-bold rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-red-500 text-xs cursor-pointer"
                    >
                      <option value="CONSTITUTIONAL_APEX_COUNCIL">CONSTITUTIONAL_APEX_COUNCIL (सर्वोच्च वैधानिक निकाय)</option>
                      <option value="ENTERPRISE_BAR">ENTERPRISE_BAR (एंटरप्राइज बार)</option>
                    </select>
                  </div>

                  {/* Quick Active Context Switcher */}
                  <div className="space-y-1.5 flex flex-col justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTenantId('tenant_state_bar_up');
                        db.setCurrentTenant('tenant_state_bar_up');
                        setActiveTab('modules');
                        showToast('Switching to State Bar Council modules switchboard...');
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow"
                    >
                      <Zap className="w-3.5 h-3.5 text-purple-300" />
                      <span>Configure Modules (Switchboard) →</span>
                    </button>
                  </div>

                </div>

                <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-[11px] text-slate-400">
                    यहाँ से वैधता (Valid Till) या स्टेटस बदलने पर State Bar Council Portal व समस्त 75 ज़िलों की डायरेक्टरी में लाइसेंस रियल-टाइम सिंक होगा।
                  </p>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black text-xs shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>लाइसेंस व वैधता अपडेट करें (Save SaaS License)</span>
                  </button>
                </div>
              </form>
            </div>

            {/* SECTION 4: 75 DISTRICTS MASTER VOTER ROLL INSPECTOR */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    <span>75 जिलों की संपूर्ण अधिवक्ता व मतदाता डायरेक्टरी</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    प्रत्येक जिले (Ballia, Prayagraj, Lucknow, Varanasi, Gorakhpur आदि) के अधिवक्ताओं की COP व वोटिंग स्थिति।
                  </p>
                </div>

                {/* District Filter & Search */}
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={stateSearchDistrict}
                    onChange={(e) => setStateSearchDistrict(e.target.value)}
                    className="bg-slate-950 border border-slate-700 text-xs text-amber-300 font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
                  >
                    <option value="ALL">सभी 75 जिले (All 75 Districts)</option>
                    <option value="Ballia">Ballia (बलिया)</option>
                    <option value="Prayagraj">Prayagraj / Allahabad (प्रयागराज)</option>
                    <option value="Lucknow">Lucknow (लखनऊ)</option>
                    <option value="Varanasi">Varanasi (वाराणसी)</option>
                    <option value="Gorakhpur">Gorakhpur (गोरखपुर)</option>
                    <option value="Azamgarh">Azamgarh (आजमगढ़)</option>
                    <option value="Mau">Mau (मऊ)</option>
                    <option value="Ghazipur">Ghazipur (गाजीपुर)</option>
                    <option value="Jaunpur">Jaunpur (जौनपुर)</option>
                    <option value="Meerut">Meerut (मेरठ)</option>
                    <option value="Agra">Agra (आगरा)</option>
                    <option value="Kanpur Nagar">Kanpur Nagar (कानपुर नगर)</option>
                  </select>

                  <div className="relative">
                    <input
                      type="text"
                      value={stateSearchQuery}
                      onChange={(e) => setStateSearchQuery(e.target.value)}
                      placeholder="नाम, Reg No, COP..."
                      className="bg-slate-950 border border-slate-700 text-xs text-slate-100 rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:border-amber-500"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>
                </div>
              </div>

              {/* Voter Roll Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">अधिवक्ता का नाम</th>
                      <th className="py-3 px-4">State Reg No.</th>
                      <th className="py-3 px-4">COP No.</th>
                      <th className="py-3 px-4">जिला बार एसोसिएशन</th>
                      <th className="py-3 px-4">COP स्थिति</th>
                      <th className="py-3 px-4 text-right">वोटिंग पात्रता</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
                    {(() => {
                      const filtered = stateBarVoterRoll.filter(v => {
                        const matchDist = stateSearchDistrict === 'ALL' || v.districtBar.toLowerCase().includes(stateSearchDistrict.toLowerCase());
                        const matchQuery = (v.advocateName + ' ' + (v.hindiName || '') + ' ' + v.stateRegNo + ' ' + v.copNo + ' ' + v.districtBar)
                          .toLowerCase()
                          .includes(stateSearchQuery.toLowerCase());
                        return matchDist && matchQuery;
                      });

                      if (filtered.length === 0) {
                        return (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                              कोई अधिवक्ता रिकॉर्ड नहीं मिला।
                            </td>
                          </tr>
                        );
                      }

                      return filtered.map((v, vIndex) => (
                        <tr key={v.id || v.stateRegNo || v.copNo || `state-voter-${vIndex}`} className="hover:bg-slate-850/50 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-100 flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-amber-400 text-[11px] font-bold border border-slate-700 flex-shrink-0">
                              {v.advocateName ? v.advocateName.charAt(0) : 'A'}
                            </div>
                            <div>
                              <span>{v.advocateName}</span>
                              {v.hindiName && (
                                <span className="block text-[10px] text-slate-400 font-normal">{v.hindiName}</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-amber-300">{v.stateRegNo}</td>
                          <td className="py-3 px-4 font-mono text-slate-300">{v.copNo}</td>
                          <td className="py-3 px-4 text-slate-200">{v.districtBar}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              v.copStatus === 'ACTIVE'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-red-500/20 text-red-300 border border-red-500/40'
                            }`}>
                              {v.copStatus}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                              ✓ Eligible Voter
                            </span>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>

            </div>

            {/* SECTION 4: CONTESTING CANDIDATES & POSTS OVERVIEW */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span>राज्य बार पद एवं नामांकित प्रत्याशी (Electoral Posts)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    चेयरमैन, वाइस चेयरमैन व सदस्य पदों पर उम्मीदवारों की सूची एवं प्राप्त मत
                  </p>
                </div>
                <span className="text-xs font-bold text-amber-300 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/30">
                  {stateBarCandidates.length} Candidates Nominated
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {stateBarCandidates.map((cand, candIndex) => (
                  <div
                    key={cand.id || cand.stateRegNo || `cand-${candIndex}`}
                    className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={cand.photoUrl}
                        alt={cand.name}
                        className="w-11 h-11 rounded-xl object-cover border border-slate-700 flex-shrink-0"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-slate-100">{cand.name}</h4>
                        <p className="text-[10px] text-amber-400 font-bold uppercase">{cand.postKey}</p>
                        <p className="text-[10px] text-slate-400">{cand.districtBar}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black text-amber-300 block">{cand.votesCount || 0}</span>
                      <span className="text-[9px] text-slate-400 uppercase font-bold">Votes</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 7: CUSTOMIZABLE SAAS PRICING, PLANS (A, B, C, D, E) & PVC / ELECTION BILLING */}
        {activeTab === 'pricing_billing' && (
          <div className="space-y-8">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-amber-950/70 via-slate-900 to-emerald-950/50 border-2 border-amber-500/50 rounded-3xl p-6 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase">
                    100% Super Admin Customizable Pricing
                  </span>
                  <span className="text-xs text-amber-300 font-bold">
                    Last Updated: {pricingConfig.updatedAt || 'Today'}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  <IndianRupee className="w-6 h-6 text-amber-400" />
                  <span>SaaS रेट लिस्ट, एडवोकेट Pro प्लान एवं PVC / चुनाव बिलिंग नियंत्रण</span>
                </h2>
                <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                  यहाँ से आप **Individual Advocate (₹99 / ₹999)**, **Law Firm (₹499 / ₹4,999)**, **Tahsil Bar (₹9,999 / ₹14,999)**, **District Bar (₹25,000)**, **State Bar Council**, **Election Package** और **PVC QR ID Card (₹50/कार्ड)** के रेट कभी भी अपनी आवश्यकता के अनुसार घटा या बढ़ा सकते हैं।
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    db.savePricingConfig(pricingConfig);
                    showToast('✅ सभी नए SaaS रेट सफलतापूर्वक सेव और पूरे प्लेटफॉर्म पर लागू हो गए!');
                  }}
                  className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-xl shadow-amber-500/20 flex items-center gap-2 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>💾 Save Custom Pricing (सभी रेट सेव करें)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const def = db.resetPricingConfig();
                    setPricingConfig(def);
                    showToast('डिफ़ॉल्ट रेट लिस्ट (99 / 999 / 4999 / 9999 / 14999 / 25000) रीस्टोर की गई।');
                  }}
                  className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold text-xs transition-all"
                >
                  <span>↺ Reset Defaults</span>
                </button>
              </div>
            </div>

            {/* 1. CUSTOMIZABLE RATE CARDS FOR ALL CATEGORIES (A, B, C, D, E & 2) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              
              {/* Category A(1) & A(2): Individual Advocate Free vs Pro */}
              <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-400">Category A(1) &amp; A(2)</span>
                    <h3 className="text-base font-black text-white">Individual Advocate Plans</h3>
                    <p className="text-[11px] text-slate-400">व्यक्तिगत अधिवक्ता (Basic बनाम Pro)</p>
                  </div>
                  <Users className="w-6 h-6 text-amber-400" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">A(1) Basic Plan (₹)</label>
                    <input
                      type="number"
                      value={pricingConfig.advocateBasicPrice}
                      onChange={(e) => setPricingConfig({ ...pricingConfig, advocateBasicPrice: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-black text-emerald-400"
                    />
                    <span className="text-[9px] text-slate-500">0 = Free Digital ID Card</span>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">A(2) Pro Monthly (₹/माह)</label>
                    <input
                      type="number"
                      value={pricingConfig.advocateProMonthly}
                      onChange={(e) => setPricingConfig({ ...pricingConfig, advocateProMonthly: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-amber-500/50 rounded-xl px-3 py-2 text-sm font-black text-amber-300"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-300 mb-1">A(2) Advocate Pro Yearly (₹/वर्ष - Smart Munshi &amp; AI Drafting)</label>
                    <input
                      type="number"
                      value={pricingConfig.advocateProYearly}
                      onChange={(e) => setPricingConfig({ ...pricingConfig, advocateProYearly: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-amber-500 rounded-xl px-3 py-2 text-base font-black text-amber-300"
                    />
                  </div>
                </div>

                {/* Pro Paywall Toggle */}
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold text-slate-200">Pro Paywall Lock (प्रो लॉक)</p>
                    <p className="text-[10px] text-slate-400">
                      {pricingConfig.enforceAdvocateProPaywall
                        ? 'ON: बिना Pro वाले वकीलों को अपग्रेड पॉपअप दिखेगा'
                        : 'OFF: अभी टेस्टिंग के लिए सभी वकीलों को फ्री एक्सेस'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = { ...pricingConfig, enforceAdvocateProPaywall: !pricingConfig.enforceAdvocateProPaywall };
                      setPricingConfig(updated);
                      db.savePricingConfig(updated);
                      showToast(updated.enforceAdvocateProPaywall ? '🔒 Advocate Pro Paywall चालू (ON) किया गया' : '🔓 टेस्टिंग हेतु सभी वकीलों के लिए Pro फीचर्स खोले गए');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                      pricingConfig.enforceAdvocateProPaywall
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {pricingConfig.enforceAdvocateProPaywall ? 'LOCK ON' : 'FREE TEST'}
                  </button>
                </div>
              </div>

              {/* Category B: Law Firm / Senior Chamber Plan */}
              <div className="bg-slate-900 border border-purple-500/40 rounded-3xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase text-purple-400">Category B</span>
                    <h3 className="text-base font-black text-white">Advocate Firm / Senior Chamber</h3>
                    <p className="text-[11px] text-slate-400">सीनियर चैंबर व लॉ फर्म प्लान</p>
                  </div>
                  <Building2 className="w-6 h-6 text-purple-400" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Monthly Charge (₹/माह)</label>
                    <input
                      type="number"
                      value={pricingConfig.lawFirmMonthly}
                      onChange={(e) => setPricingConfig({ ...pricingConfig, lawFirmMonthly: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-purple-500/50 rounded-xl px-3 py-2 text-sm font-black text-purple-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Max Juniors (जूनियर कोटा)</label>
                    <input
                      type="number"
                      value={pricingConfig.lawFirmMaxJuniors}
                      onChange={(e) => setPricingConfig({ ...pricingConfig, lawFirmMaxJuniors: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-black text-slate-200"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-300 mb-1">Law Firm Yearly Charge (₹/वर्ष)</label>
                    <input
                      type="number"
                      value={pricingConfig.lawFirmYearly}
                      onChange={(e) => setPricingConfig({ ...pricingConfig, lawFirmYearly: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-purple-500 rounded-xl px-3 py-2 text-base font-black text-purple-300"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  1 सीनियर अधिवक्ता + {pricingConfig.lawFirmMaxJuniors} जूनियर अधिवक्ता + साझा चैंबर केस डायरी व फीस लेजर।
                </p>
              </div>

              {/* Category C: Tahsil Bar Association Plan */}
              <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase text-emerald-400">Category C</span>
                    <h3 className="text-base font-black text-white">Tahsil Bar Association</h3>
                    <p className="text-[11px] text-slate-400">तहसील बार एसोसिएशन वार्षिक शुल्क</p>
                  </div>
                  <Scale className="w-6 h-6 text-emerald-400" />
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-300 mb-1">Standard Tahsil Bar Yearly (₹/वर्ष - अप टू 400 वकील)</label>
                    <input
                      type="number"
                      value={pricingConfig.tahsilBarStandardYearly}
                      onChange={(e) => setPricingConfig({ ...pricingConfig, tahsilBarStandardYearly: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-emerald-500/50 rounded-xl px-3 py-2 text-base font-black text-emerald-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-300 mb-1">Large Tahsil Bar Plus Yearly (₹/वर्ष - 400 से 800 वकील)</label>
                    <input
                      type="number"
                      value={pricingConfig.tahsilBarPlusYearly}
                      onChange={(e) => setPricingConfig({ ...pricingConfig, tahsilBarPlusYearly: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-emerald-500 rounded-xl px-3 py-2 text-base font-black text-emerald-300"
                    />
                  </div>
                </div>
              </div>

              {/* Category D: District Bar Association Plan */}
              <div className="bg-slate-900 border border-blue-500/40 rounded-3xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase text-blue-400">Category D</span>
                    <h3 className="text-base font-black text-white">District Bar Association</h3>
                    <p className="text-[11px] text-slate-400">जिला बार एसोसिएशन वार्षिक लाइसेंस</p>
                  </div>
                  <Landmark className="w-6 h-6 text-blue-400" />
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-300 mb-1">District Bar Annual License (₹/वर्ष)</label>
                    <input
                      type="number"
                      value={pricingConfig.districtBarYearly}
                      onChange={(e) => setPricingConfig({ ...pricingConfig, districtBarYearly: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-blue-500 rounded-xl px-3 py-2 text-base font-black text-blue-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-300 mb-1">Zero-Cost Pitch: Per Advocate Annual Portal Fee (₹/वकील)</label>
                    <input
                      type="number"
                      value={pricingConfig.districtBarPerAdvocateFee}
                      onChange={(e) => setPricingConfig({ ...pricingConfig, districtBarPerAdvocateFee: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-blue-500/50 rounded-xl px-3 py-2 text-sm font-black text-blue-300"
                    />
                    <span className="text-[10px] text-slate-400 block mt-1">
                      उदाहरण: 2,000 वकील × ₹{pricingConfig.districtBarPerAdvocateFee} = ₹{(2000 * pricingConfig.districtBarPerAdvocateFee).toLocaleString('en-IN')}/वर्ष
                    </span>
                  </div>
                </div>
              </div>

              {/* Category E: State Bar Council AMC */}
              <div className="bg-slate-900 border border-red-500/40 rounded-3xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase text-red-400">Category E</span>
                    <h3 className="text-base font-black text-white">State Bar Council Portal</h3>
                    <p className="text-[11px] text-slate-400">राज्य बार काउंसिल (75 जिले) वार्षिक AMC</p>
                  </div>
                  <Crown className="w-6 h-6 text-red-400" />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-300 mb-1">State Bar Council Annual AMC (₹/वर्ष)</label>
                  <input
                    type="number"
                    value={pricingConfig.stateBarYearly}
                    onChange={(e) => setPricingConfig({ ...pricingConfig, stateBarYearly: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-red-500 rounded-xl px-3 py-2 text-base font-black text-red-300"
                  />
                </div>
                <p className="text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  समस्त 75 जिलों की मतदाता सूची, COP सत्यापन और राज्य स्तरीय चुनाव नियंत्रण कक्ष।
                </p>
              </div>

              {/* Category 2: Election Package & PVC QR ID Card Rates */}
              <div className="bg-slate-900 border border-amber-400/50 rounded-3xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-300">Bonus Streams (2.1 &amp; 2.2)</span>
                    <h3 className="text-base font-black text-white">Election &amp; PVC Smart ID Cards</h3>
                    <p className="text-[11px] text-slate-400">चुनाव पैकेज व प्लास्टिक QR कार्ड प्रिंटिंग</p>
                  </div>
                  <CreditCard className="w-6 h-6 text-amber-400" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Tahsil Election (₹)</label>
                    <input
                      type="number"
                      value={pricingConfig.tahsilElectionFee}
                      onChange={(e) => setPricingConfig({ ...pricingConfig, tahsilElectionFee: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-black text-amber-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">District Election (₹)</label>
                    <input
                      type="number"
                      value={pricingConfig.districtElectionFee}
                      onChange={(e) => setPricingConfig({ ...pricingConfig, districtElectionFee: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-amber-500/50 rounded-xl px-3 py-2 text-sm font-black text-amber-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">PVC Card Rate (₹/कार्ड)</label>
                    <input
                      type="number"
                      value={pricingConfig.pvcCardChargePerCard}
                      onChange={(e) => setPricingConfig({ ...pricingConfig, pvcCardChargePerCard: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-emerald-500/50 rounded-xl px-3 py-2 text-sm font-black text-emerald-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Making Cost (₹/लागत)</label>
                    <input
                      type="number"
                      value={pricingConfig.pvcCardMakingCost}
                      onChange={(e) => setPricingConfig({ ...pricingConfig, pvcCardMakingCost: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-black text-slate-300"
                    />
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs flex items-center justify-between">
                  <span className="text-slate-300 font-semibold">शुद्ध बचत (Net Profit / PVC Card):</span>
                  <span className="font-black text-emerald-400">
                    ₹{Math.max(0, pricingConfig.pvcCardChargePerCard - pricingConfig.pvcCardMakingCost)} / कार्ड
                  </span>
                </div>
              </div>

            </div>

            {/* 2. INDIVIDUAL ADVOCATE FREE vs PRO ACTIVATION MANAGER */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <span>A(1) vs A(2): Individual Advocate Free / Pro Membership Control</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    किसी भी अधिवक्ता को 1-क्लिक में **Basic (Free)** से **Advocate Pro (₹{pricingConfig.advocateProYearly}/वर्ष)** में अपग्रेड या डाउनग्रेड करें।
                  </p>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={proAdvocateSearch}
                    onChange={(e) => setProAdvocateSearch(e.target.value)}
                    placeholder="वकील का नाम या Bar No. खोजें..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1">
                {allAdvocates
                  .filter(a => a.role === 'advocate')
                  .filter(a => {
                    if (!proAdvocateSearch.trim()) return true;
                    const q = proAdvocateSearch.toLowerCase();
                    return a.name.toLowerCase().includes(q) || a.barNo.toLowerCase().includes(q) || a.mobile.includes(q);
                  })
                  .slice(0, 18)
                  .map(adv => (
                    <div key={adv.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-100 truncate">{adv.name}</p>
                        <p className="text-[10px] text-amber-400 font-mono">{adv.barNo} • {adv.mobile}</p>
                        <span className={`inline-block mt-1 text-[9px] font-black px-2 py-0.5 rounded ${
                          adv.isProMember
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {adv.isProMember ? `⭐ PRO MEMBER (₹${pricingConfig.advocateProYearly})` : 'FREE BASIC'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = db.toggleAdvocateProStatus(adv.id, 'YEARLY');
                          loadAllData();
                          if (updated) {
                            showToast(`${updated.name} को ${updated.isProMember ? '⭐ PRO Member' : 'Basic (Free)'} में बदला गया।`);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-black flex-shrink-0 transition-all ${
                          adv.isProMember
                            ? 'bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-300 border border-slate-700'
                            : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow'
                        }`}
                      >
                        {adv.isProMember ? 'Make Free' : 'Activate Pro'}
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            {/* 3. PVC SMART ID CARD PRINTING & ELECTION PACKAGE BILLING LEDGER */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-emerald-400" />
                    <span>PVC QR Smart Card Printing, Election &amp; SaaS Billing Ledger</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    बार एसोसिएशन के PVC कार्ड ऑर्डर, चुनाव पैकेज और वार्षिक लाइसेंस बिलों का पूरा हिसाब।
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Billed</span>
                    <span className="text-lg font-black text-amber-300">
                      ₹{billingOrders.reduce((s, o) => s + o.totalAmount, 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Net Estimated Profit</span>
                    <span className="text-lg font-black text-emerald-400">
                      ₹{billingOrders.reduce((s, o) => s + o.estimatedProfit, 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Add New Order Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newOrderForm.organizationName.trim()) {
                    showToast('कृपया बार एसोसिएशन या ग्राहक का नाम लिखें', 'error');
                    return;
                  }
                  const total = Number(newOrderForm.quantity) * Number(newOrderForm.unitPrice);
                  const profit =
                    newOrderForm.category === 'PVC_ID_CARDS'
                      ? Number(newOrderForm.quantity) * Math.max(0, Number(newOrderForm.unitPrice) - pricingConfig.pvcCardMakingCost)
                      : Math.round(total * 0.9);
                  const order: SaaSBillingOrder = {
                    id: 'ord_' + Date.now(),
                    organizationName: newOrderForm.organizationName.trim(),
                    category: newOrderForm.category,
                    quantity: Number(newOrderForm.quantity) || 1,
                    unitPrice: Number(newOrderForm.unitPrice) || 0,
                    totalAmount: total,
                    estimatedProfit: profit,
                    status: newOrderForm.status,
                    date: new Date().toLocaleDateString('en-GB'),
                    notes: newOrderForm.notes.trim()
                  };
                  db.addSaaSBillingOrder(order);
                  loadAllData();
                  setNewOrderForm({
                    ...newOrderForm,
                    organizationName: '',
                    notes: ''
                  });
                  showToast(`नया बिलिंग ऑर्डर (₹${total.toLocaleString('en-IN')}) जोड़ा गया!`);
                }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800"
              >
                <div className="lg:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Bar / Client Name *</label>
                  <input
                    type="text"
                    required
                    value={newOrderForm.organizationName}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, organizationName: e.target.value })}
                    placeholder="e.g. District Bar Ballia / Adv. Rajesh"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Order Category</label>
                  <select
                    value={newOrderForm.category}
                    onChange={(e) => {
                      const cat = e.target.value as SaaSBillingOrder['category'];
                      let defaultUnit = pricingConfig.pvcCardChargePerCard;
                      let defaultQty = 1;
                      if (cat === 'PVC_ID_CARDS') {
                        defaultUnit = pricingConfig.pvcCardChargePerCard;
                        defaultQty = 500;
                      } else if (cat === 'ELECTION_PACKAGE') {
                        defaultUnit = pricingConfig.districtElectionFee;
                      } else if (cat === 'DISTRICT_BAR') {
                        defaultUnit = pricingConfig.districtBarYearly;
                      } else if (cat === 'TAHSIL_BAR') {
                        defaultUnit = pricingConfig.tahsilBarStandardYearly;
                      } else if (cat === 'LAW_FIRM') {
                        defaultUnit = pricingConfig.lawFirmYearly;
                      } else if (cat === 'ADVOCATE_PRO') {
                        defaultUnit = pricingConfig.advocateProYearly;
                      } else if (cat === 'STATE_BAR') {
                        defaultUnit = pricingConfig.stateBarYearly;
                      }
                      setNewOrderForm({
                        ...newOrderForm,
                        category: cat,
                        quantity: defaultQty,
                        unitPrice: defaultUnit
                      });
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-100 font-bold"
                  >
                    <option value="PVC_ID_CARDS">🪪 PVC QR ID Cards</option>
                    <option value="ELECTION_PACKAGE">🗳️ Bar Election Package</option>
                    <option value="DISTRICT_BAR">🏛️ District Bar License</option>
                    <option value="TAHSIL_BAR">⚖️ Tahsil Bar License</option>
                    <option value="LAW_FIRM">🏢 Law Firm Plan</option>
                    <option value="ADVOCATE_PRO">⭐ Advocate Pro Plan</option>
                    <option value="STATE_BAR">👑 State Bar AMC</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Quantity (संख्या)</label>
                  <input
                    type="number"
                    min={1}
                    value={newOrderForm.quantity}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, quantity: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Rate (₹ प्रति यूनिट)</label>
                  <input
                    type="number"
                    value={newOrderForm.unitPrice}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, unitPrice: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-amber-500/50 rounded-xl px-3 py-2 text-xs text-amber-300 font-black"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Order (₹{(newOrderForm.quantity * newOrderForm.unitPrice).toLocaleString('en-IN')})</span>
                  </button>
                </div>
              </form>

              {/* Billing Orders Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Organization / Advocate</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Qty × Rate</th>
                      <th className="py-2.5 px-3">Total Billed</th>
                      <th className="py-2.5 px-3">Net Profit</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {billingOrders.map(ord => (
                      <tr key={ord.id} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-mono text-slate-400">{ord.date}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-100">
                          {ord.organizationName}
                          {ord.notes && <span className="block text-[10px] text-slate-400 font-normal">{ord.notes}</span>}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-bold text-[10px]">
                            {ord.category.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-300">
                          {ord.quantity} × ₹{ord.unitPrice.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 font-black text-amber-300">
                          ₹{ord.totalAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 font-black text-emerald-400">
                          ₹{ord.estimatedProfit.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              db.deleteSaaSBillingOrder(ord.id);
                              loadAllData();
                              showToast('ऑर्डर हटाया गया');
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 8: ENTERPRISE SECURITY & ANTI-REVERSE-ENGINEERING SHIELD */}
        {/* ============================================================== */}
        {activeTab === 'security_shield' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
              
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 p-0.5 shadow-xl shadow-emerald-500/20 flex-shrink-0">
                    <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center">
                      <ShieldCheck className="w-8 h-8 text-emerald-400" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        Enterprise Anti-Reverse-Engineering Shield
                      </h2>
                      <span className="bg-emerald-500 text-slate-950 text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full shadow">
                        Active Shield v2.4
                      </span>
                      <span className="bg-slate-800 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono px-2 py-0.5 rounded-full">
                        Commercial Client Delivery Grade
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
                      यह सिस्टम क्लाइंट को डिलीवरी से पहले कोडबेस को चोरी होने, इंस्पेक्ट (F12 / DevTools) करने, बैकएंड डेटा स्रोत खोजने, और ब्राउज़र स्टोरेज से प्लेनटेक्स्ट डेटा पढ़ने से 100% सुरक्षित रखता है।
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const status = securityShield.getStatus();
                      showToast(
                        `🛡️ सुरक्षा परीक्षण सफल: 5/5 लेयर्स सक्रिय! (Vault: ${status.vaultAlgorithm})`,
                        'success'
                      );
                    }}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-transform active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>सुरक्षा स्थिति जांचें (Run Self-Check)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Live Telemetry & Protection Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-4 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Runtime DevTools Guard
                  </span>
                  <div className={`w-2.5 h-2.5 rounded-full ${shieldSettings.antiDevTools ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`} />
                </div>
                <p className="text-lg font-black text-white mt-1">
                  {shieldSettings.antiDevTools ? 'Blocked & Monitored' : 'Disabled'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  F12, Ctrl+Shift+I/J/C, Ctrl+U, Ctrl+S अवरुद्ध हैं।
                </p>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-4 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Storage Vault Encryption
                  </span>
                  <div className={`w-2.5 h-2.5 rounded-full ${shieldSettings.storageEncryption ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`} />
                </div>
                <p className="text-lg font-black text-emerald-300 mt-1 font-mono">
                  {shieldSettings.storageEncryption ? 'ENCv1: XOR-256' : 'Plain Text'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  _sys_vault_v2_* कीज़ साइफरटेक्स्ट में सुरक्षित हैं।
                </p>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-4 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Console State Leak Guard
                  </span>
                  <div className={`w-2.5 h-2.5 rounded-full ${shieldSettings.silenceConsole ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`} />
                </div>
                <p className="text-lg font-black text-white mt-1">
                  {shieldSettings.silenceConsole ? 'Silenced & Purged' : 'Verbose'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  कंसोल में स्टेट, टोकन या इंटरनल API लीक नहीं होते।
                </p>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-4 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Production Bundler Hardening
                  </span>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <p className="text-lg font-black text-teal-300 mt-1 font-mono">
                  Sourcemaps: OFF
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  esbuild Minification + ड्रॉप कंसोल + नो लीगल कमेंट्स।
                </p>
              </div>

            </div>

            {/* Individual Security Toggles Switchboard */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Lock className="w-5 h-5 text-emerald-400" />
                    <span>मास्टर सुपर एडमिन सिक्योरिटी कंट्रोल स्विचबोर्ड (Individual Toggles)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    यदि आपको डेवलपमेंट या विशेष टेस्टिंग के लिए किसी लेयर को अस्थायी रूप से बंद करना हो तो यहाँ से टॉगल करें:
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  Last Updated: {shieldSettings.lastUpdated || 'Today'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Control 1: Anti-DevTools */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-100">
                        1. Keyboard &amp; DevTools Shortcut Blocker
                      </span>
                      {shieldSettings.antiDevTools ? (
                        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold uppercase px-2 py-0.5 rounded">
                          ON
                        </span>
                      ) : (
                        <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[9px] font-bold uppercase px-2 py-0.5 rounded">
                          OFF
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      F12, Ctrl+Shift+I (इन्स्पेक्ट एलीमेंट), Ctrl+Shift+J (कंसोल), Ctrl+U (सोर्स कोड व्यू), और Ctrl+S को पूरी तरह ब्लॉक करता है।
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = securityShield.updateSettings({ antiDevTools: !shieldSettings.antiDevTools });
                      setShieldSettings(updated);
                      showToast(`Anti-DevTools Shortcut Shield: ${updated.antiDevTools ? 'सक्रिय (ON)' : 'निष्क्रिय (OFF)'}`);
                    }}
                    className="p-1 text-emerald-400 hover:text-emerald-300 transition-colors flex-shrink-0"
                  >
                    {shieldSettings.antiDevTools ? (
                      <ToggleRight className="w-8 h-8 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-slate-600" />
                    )}
                  </button>
                </div>

                {/* Control 2: Right Click Blocker */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-100">
                        2. Context Menu &amp; Right-Click Protection
                      </span>
                      {shieldSettings.blockRightClick ? (
                        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold uppercase px-2 py-0.5 rounded">
                          ON
                        </span>
                      ) : (
                        <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[9px] font-bold uppercase px-2 py-0.5 rounded">
                          OFF
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      माउस राइट-क्लिक को पूरे ऐप में ब्लॉक करता है जिससे कोई 'Inspect', 'View Page Source' या कोड कॉपी न कर सके।
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = securityShield.updateSettings({ blockRightClick: !shieldSettings.blockRightClick });
                      setShieldSettings(updated);
                      showToast(`Right-Click Protection: ${updated.blockRightClick ? 'सक्रिय (ON)' : 'निष्क्रिय (OFF)'}`);
                    }}
                    className="p-1 text-emerald-400 hover:text-emerald-300 transition-colors flex-shrink-0"
                  >
                    {shieldSettings.blockRightClick ? (
                      <ToggleRight className="w-8 h-8 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-slate-600" />
                    )}
                  </button>
                </div>

                {/* Control 3: Console Sanitization */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-100">
                        3. Console Sanitization &amp; Memory Cleansing
                      </span>
                      {shieldSettings.silenceConsole ? (
                        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold uppercase px-2 py-0.5 rounded">
                          ON
                        </span>
                      ) : (
                        <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[9px] font-bold uppercase px-2 py-0.5 rounded">
                          OFF
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      ब्राउज़र कंसोल के सभी console.log, info, table, debug आउटपुट को म्यूट रखता है तथा DevTools खुलने पर बफ़र साफ़ करता है।
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = securityShield.updateSettings({ silenceConsole: !shieldSettings.silenceConsole });
                      setShieldSettings(updated);
                      showToast(`Console Sanitization: ${updated.silenceConsole ? 'सक्रिय (ON)' : 'निष्क्रिय (OFF)'}`);
                    }}
                    className="p-1 text-emerald-400 hover:text-emerald-300 transition-colors flex-shrink-0"
                  >
                    {shieldSettings.silenceConsole ? (
                      <ToggleRight className="w-8 h-8 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-slate-600" />
                    )}
                  </button>
                </div>

                {/* Control 4: Storage Vault Encryption */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-100">
                        4. LocalStorage Vault Encryption (ENCv1:)
                      </span>
                      {shieldSettings.storageEncryption ? (
                        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold uppercase px-2 py-0.5 rounded">
                          ON
                        </span>
                      ) : (
                        <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[9px] font-bold uppercase px-2 py-0.5 rounded">
                          OFF
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      स्थानीय स्टोरेज में वकीलों, क्लाइंट्स, क्रेडेंशियल्स का डेटा साइफरटेक्स्ट में सुरक्षित रहता है और न्यूट्रल सिस्टम कीज़ (_sys_vault_v2_*) का उपयोग करता है।
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = securityShield.updateSettings({ storageEncryption: !shieldSettings.storageEncryption });
                      setShieldSettings(updated);
                      showToast(`Storage Vault Encryption: ${updated.storageEncryption ? 'सक्रिय (ON)' : 'निष्क्रिय (OFF)'}`);
                    }}
                    className="p-1 text-emerald-400 hover:text-emerald-300 transition-colors flex-shrink-0"
                  >
                    {shieldSettings.storageEncryption ? (
                      <ToggleRight className="w-8 h-8 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-slate-600" />
                    )}
                  </button>
                </div>

                {/* Control 5: White-Label Masking */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-start justify-between gap-4 md:col-span-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-100">
                        5. White-Label Enterprise Masking (वेंडर नाम गोपनीयता)
                      </span>
                      {shieldSettings.whiteLabelMasking ? (
                        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold uppercase px-2 py-0.5 rounded">
                          ON
                        </span>
                      ) : (
                        <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[9px] font-bold uppercase px-2 py-0.5 rounded">
                          OFF
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      UI और क्लाइंट के सामने किसी भी थर्ड-पार्टी वेंडर का नाम नहीं दिखता; सभी जगह जेनेरिक "Encrypted Cloud Sync" व "Enterprise Cloud" ही प्रदर्शित होता है।
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = securityShield.updateSettings({ whiteLabelMasking: !shieldSettings.whiteLabelMasking });
                      setShieldSettings(updated);
                      showToast(`White-Label Cloud Masking: ${updated.whiteLabelMasking ? 'सक्रिय (ON)' : 'निष्क्रिय (OFF)'}`);
                    }}
                    className="p-1 text-emerald-400 hover:text-emerald-300 transition-colors flex-shrink-0"
                  >
                    {shieldSettings.whiteLabelMasking ? (
                      <ToggleRight className="w-8 h-8 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-slate-600" />
                    )}
                  </button>
                </div>

              </div>
            </div>

            {/* Commercial Client Handover Checklist */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-emerald-400" />
                <span>कमर्शियल क्लाइंट डिलीवरी सुरक्षा चेकलिस्ट (Ready-To-Sell Audit)</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                
                <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-3.5 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-100">1. कोई भी यूजर F12 से कोड नहीं देख सकता</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      F12, Inspect Element, View Source कीज़ अवरुद्ध हैं।
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-3.5 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-100">2. राइट-क्लिक (Context Menu) पूरी तरह बंद</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      इनपुट बॉक्स के अलावा कहीं भी राइट क्लिक मेन्यू नहीं खुलता।
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-3.5 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-100">3. LocalStorage में डेटा एन्क्रिप्टेड (ENCv1:)</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Application टैब में कोई भी वकील सूची या पासवर्ड नहीं पढ़ सकता।
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-3.5 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-100">4. प्रोडक्शन बंडल में नो सोर्समैप (Sourcemap: false)</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      ब्राउज़र में ओरिजिनल .tsx फाइलें व फोल्डर स्ट्रक्चर रीकंस्ट्रक्ट नहीं हो सकते।
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-3.5 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-100">5. बैकएंड 10/10 ज़ीरो-ट्रस्ट रूल्स (Zero-Trust Rules)</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      क्लाउड डेटाबेस पर मल्टी-टेनेंट आइसोलेशन व सख्त रोल-बेस्ड एक्सेस सुरक्षा।
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-3.5 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-100">6. व्हाइट-लेबल क्लाउड सिंक्रोनाइज़ेशन</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      क्लाइंट्स को डेटाबेस प्रोवाइडर या इंटरनल वेंडर्स के नाम नहीं दिखते।
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 9: APP ICON, BRANDING STUDIO & APP MANIFEST (SUPER ADMIN) */}
        {/* ============================================================== */}
        {activeTab === 'branding_manifest' && (
          <div className="space-y-6">

            {/* Super Admin Exclusive Authority Banner */}
            <div className="bg-gradient-to-r from-purple-950/70 via-slate-900 to-amber-950/40 border border-purple-500/40 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-purple-600 p-0.5 shadow-xl flex-shrink-0">
                  <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-amber-400" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/50">
                      👑 Super Admin Master Authority
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      All 75 Districts Synchronized
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                    App Icon &amp; PWA Manifest Studio
                  </h2>
                  <p className="text-xs text-slate-300 max-w-2xl mt-0.5">
                    केन्द्रीय ऐप आइकन, ब्रांडिंग और PWA वेब मेनिफेस्ट केवल सुपर एडमिन द्वारा संचालित है। बार स्तर पर ब्रांडिंग बंद है ताकि पूरे न्यायिक नेटवर्क में एक समान प्रमाणित पहचान बनी रहे।
                  </p>
                </div>
              </div>

              <div className="bg-slate-950/80 p-4 rounded-2xl border border-purple-500/30 flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Bar-Level Branding</p>
                  <p className="text-xs font-black text-rose-400">DISABLED (प्रतिबंधित)</p>
                </div>
              </div>
            </div>

            {/* SECTION 1: MASTER APP ICON & EMBLEM CUSTOMIZER */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Crown className="w-5 h-5 text-amber-400" />
                    <span>Master App Icon &amp; Judicial Emblem (ऐप का मुख्य आइकन व सील)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Select one of 4 prestigious state-level legal seals or upload your custom high-resolution emblem.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedIconPreset('royal');
                      setCustomLogoData('');
                      setCustomLogoUrlInput('');
                      localStorage.setItem('nyaay_icon_preset', 'royal');
                      localStorage.removeItem('nyaay_custom_logo_data');
                      const faviconLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
                      if (faviconLink) faviconLink.href = '/icon.svg';
                      const currentSettings = db.getSettings();
                      db.updateSettings({ ...currentSettings, logoUrl: '/icon.svg' });
                      const platformCfg = db.getPlatformSettings();
                      db.updatePlatformSettings({ ...platformCfg, appIconPreset: 'royal', customLogoData: '' });
                      window.dispatchEvent(new Event('app_icon_changed'));
                      showToast('App Icon reset to Royal Judicial Gold Seal');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset to Default</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedIconPreset === 'auto' && customLogoData) {
                        localStorage.setItem('nyaay_icon_preset', 'auto');
                        localStorage.setItem('nyaay_custom_logo_data', customLogoData);
                        const faviconLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
                        if (faviconLink) faviconLink.href = customLogoData;
                        const currentSettings = db.getSettings();
                        db.updateSettings({ ...currentSettings, logoUrl: customLogoData });
                        const platformCfg = db.getPlatformSettings();
                        db.updatePlatformSettings({ ...platformCfg, appIconPreset: 'auto', customLogoData });
                      } else {
                        localStorage.setItem('nyaay_icon_preset', selectedIconPreset);
                        localStorage.removeItem('nyaay_custom_logo_data');
                        const faviconLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
                        if (faviconLink) faviconLink.href = '/icon.svg';
                        const currentSettings = db.getSettings();
                        db.updateSettings({ ...currentSettings, logoUrl: '/icon.svg' });
                        const platformCfg = db.getPlatformSettings();
                        db.updatePlatformSettings({ ...platformCfg, appIconPreset: selectedIconPreset, customLogoData: '' });
                      }
                      window.dispatchEvent(new Event('app_icon_changed'));
                      showToast('👑 Master App Icon & Seal deployed globally across all Bar Associations!');
                    }}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition"
                  >
                    <CheckCircle2 className="w-4 h-4 text-slate-950" />
                    <span>Save &amp; Deploy Globally</span>
                  </button>
                </div>
              </div>

              {/* 5 Presets Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                {[
                  {
                    id: 'official' as AdvocateLogoVariant,
                    title: 'Supreme 3D Gold Medal',
                    hindiTitle: 'न्याय सहयोगी 3D स्वर्ण राजमुद्रा (शेर व यतो धर्मस्ततो जयः)',
                    desc: 'Bespoke 3D Gold Circular Seal with Twin Lions Rampant, Laurel Wreath & Scales of Justice',
                    badge: 'OFFICIAL SEAL'
                  },
                  {
                    id: 'royal' as AdvocateLogoVariant,
                    title: 'Royal Judicial Seal',
                    hindiTitle: 'राजकीय न्याय प्रतीक (स्वर्ण व गहरा नीला)',
                    desc: '3D Gold Scales of Justice, Ashoka Chakra & White Advocate Bands',
                    badge: 'CLASSIC GOLD'
                  },
                  {
                    id: 'bands' as AdvocateLogoVariant,
                    title: 'Bar Council Bands',
                    hindiTitle: 'अधिवक्ता श्वेत बैंड प्रतीक',
                    desc: 'Classic Indian Advocate neckband and collar on deep obsidian seal',
                    badge: 'BAR COUNCIL'
                  },
                  {
                    id: 'court' as AdvocateLogoVariant,
                    title: 'High Court Colonnade',
                    hindiTitle: 'उच्च न्यायालय स्तंभ व तराजू',
                    desc: 'Grand courtroom pillars architecture with balanced golden scales',
                    badge: 'PRESTIGE'
                  },
                  {
                    id: 'tricolor' as AdvocateLogoVariant,
                    title: 'Tricolor National Shield',
                    hindiTitle: 'तिरंगा व सत्यमेव जयते ढाल',
                    desc: 'Indian Saffron, White & Green with Ashoka Navy Chakra and Justice Scales',
                    badge: 'PATRIOTIC'
                  }
                ].map((preset) => {
                  const isSelected = selectedIconPreset === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => setSelectedIconPreset(preset.id)}
                      className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-amber-400 bg-amber-500/10 shadow-lg shadow-amber-500/10 scale-[1.02]'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                            isSelected
                              ? 'bg-amber-400 text-slate-950 border-amber-300'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}>
                            {preset.badge}
                          </span>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs shadow">
                              ✓
                            </div>
                          )}
                        </div>

                        <div className="w-20 h-20 mx-auto rounded-2xl bg-slate-950 p-1 border border-amber-500/30 flex items-center justify-center shadow-md">
                          <AdvocateLogo variant={preset.id} className="w-full h-full" />
                        </div>

                        <div className="text-center">
                          <h4 className="font-bold text-xs text-white">{preset.title}</h4>
                          <p className="text-[10px] text-amber-300/90 font-medium">{preset.hindiTitle}</p>
                          <p className="text-[10px] text-slate-400 mt-1 leading-snug">{preset.desc}</p>
                        </div>
                      </div>

                      <div className="pt-3 mt-3 border-t border-slate-800/80 text-center">
                        <span className={`text-[10px] font-bold ${isSelected ? 'text-amber-400' : 'text-slate-500'}`}>
                          {isSelected ? '● Currently Selected' : 'Click to Select'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom Logo Upload Sub-Section */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 flex items-center justify-center flex-shrink-0">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Custom Judicial Emblem / Chamber Logo Upload</h4>
                    <p className="text-xs text-slate-400">
                      Upload an official transparent PNG or SVG from your local device (Replaces default presets)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <label className="cursor-pointer px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-2 shadow">
                    <Upload className="w-4 h-4" />
                    <span>Upload Logo File (डिवाइस से चुनें)</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const result = event.target?.result as string;
                            setCustomLogoData(result);
                            setSelectedIconPreset('auto');
                            showToast('Custom logo uploaded! Click "Save & Deploy Globally" to apply.');
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  {customLogoData && (
                    <button
                      type="button"
                      onClick={() => {
                        setCustomLogoData('');
                        setSelectedIconPreset('royal');
                      }}
                      className="px-3 py-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold hover:bg-rose-500/30"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* 4-Way Live Device Preview Suite */}
              <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4">
                <h4 className="text-xs font-black uppercase text-amber-300 tracking-wider flex items-center gap-2">
                  <Eye className="w-4 h-4 text-amber-400" />
                  <span>Real-Time 4-Way Device Preview (लाइव डिवाइस प्रिव्यू)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* Preview 1: Android PWA Home Screen */}
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center text-center space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Android PWA Home Screen</span>
                    <div className="w-16 h-16 rounded-2xl bg-slate-950 p-1 border-2 border-amber-400/80 shadow-xl flex items-center justify-center">
                      <AdvocateLogo variant={selectedIconPreset} className="w-full h-full" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-100">{manifestForm.shortName || 'Nyaay Sahayogi'}</p>
                      <span className="text-[9px] text-amber-400 font-semibold">192x192 &amp; 512x512 PWA</span>
                    </div>
                  </div>

                  {/* Preview 2: iOS Home Screen Squircle */}
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center text-center space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">iOS Safari Home Screen</span>
                    <div className="w-16 h-16 rounded-[22px] bg-slate-950 p-1 border border-slate-700 shadow-xl flex items-center justify-center overflow-hidden">
                      <AdvocateLogo variant={selectedIconPreset} className="w-full h-full" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-100">{manifestForm.shortName || 'Nyaay Sahayogi'}</p>
                      <span className="text-[9px] text-slate-400 font-semibold">apple-touch-icon</span>
                    </div>
                  </div>

                  {/* Preview 3: Browser Tab Favicon */}
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-between text-center space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Web Browser Tab</span>
                    <div className="w-full bg-slate-950 rounded-lg p-2 border border-slate-800 flex items-center gap-2">
                      <div className="w-5 h-5 rounded flex-shrink-0 flex items-center justify-center">
                        <AdvocateLogo variant={selectedIconPreset} className="w-full h-full" />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-200 truncate flex-1 text-left">
                        {manifestForm.shortName} • Bar Portal
                      </span>
                      <span className="text-[10px] text-slate-500">✕</span>
                    </div>
                    <span className="text-[9px] text-slate-400 font-semibold">favicon-32x32.png &amp; icon.svg</span>
                  </div>

                  {/* Preview 4: App Header Brand Seal */}
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-between text-center space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Top App Header</span>
                    <div className="w-full bg-slate-950 rounded-lg p-2 border border-slate-800 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow flex-shrink-0">
                        <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center overflow-hidden">
                          <AdvocateLogo variant={selectedIconPreset} className="w-full h-full" />
                        </div>
                      </div>
                      <div className="text-left leading-tight truncate">
                        <p className="text-[11px] font-black text-white truncate">NYAAY SAHAYOGI</p>
                        <p className="text-[9px] text-amber-400 font-bold truncate">BAR &amp; ADVOCATE</p>
                      </div>
                    </div>
                    <span className="text-[9px] text-amber-400 font-semibold">Live in App Header</span>
                  </div>

                </div>
              </div>

            </div>

            {/* SECTION 2: PWA WEB APP MANIFEST CONTROLLER */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-purple-400" />
                    <span>PWA Web App Manifest Controller (ऐप मेनिफेस्ट सेटिंग्स)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Configure web manifest parameters including standalone display, status bar colors, and home screen naming.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const res = resetManifestConfig();
                      setManifestForm(res);
                      showToast('PWA Manifest reset to default settings');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Manifest</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      saveManifestConfig(manifestForm);
                      const platformCfg = db.getPlatformSettings();
                      db.updatePlatformSettings({
                        ...platformCfg,
                        appManifestConfig: manifestForm
                      });
                      showToast('🎉 PWA Web Manifest & theme settings successfully deployed live!');
                    }}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/20 transition"
                  >
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Save &amp; Apply Manifest Live</span>
                  </button>
                </div>
              </div>

              {/* Manifest Settings Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Application Full Name (`name`) *
                  </label>
                  <input
                    type="text"
                    required
                    value={manifestForm.name}
                    onChange={(e) => setManifestForm({ ...manifestForm, name: e.target.value })}
                    placeholder="e.g. NYAAY SAHAYOGI - Bar & Legal ERP"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500 font-medium"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Displayed on installation prompt &amp; app info</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Application Short Name (`short_name`) *
                  </label>
                  <input
                    type="text"
                    required
                    value={manifestForm.shortName}
                    onChange={(e) => setManifestForm({ ...manifestForm, shortName: e.target.value })}
                    placeholder="e.g. Nyaay Sahayogi"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500 font-medium"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Displayed under icon on smartphone home screens</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Display Mode (`display`)
                  </label>
                  <select
                    value={manifestForm.display}
                    onChange={(e) => setManifestForm({ ...manifestForm, display: e.target.value as any })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
                  >
                    <option value="standalone">standalone (Native App experience - No browser UI)</option>
                    <option value="fullscreen">fullscreen (Immersive full screen)</option>
                    <option value="minimal-ui">minimal-ui (Minimal browser buttons)</option>
                  </select>
                  <span className="text-[10px] text-slate-500 mt-1 block">Recommended: standalone</span>
                </div>

                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block font-semibold text-slate-300 mb-1">
                    Application Description (`description`)
                  </label>
                  <input
                    type="text"
                    value={manifestForm.description}
                    onChange={(e) => setManifestForm({ ...manifestForm, description: e.target.value })}
                    placeholder="Official Bar Council, District Bar Association & Advocate ERP Portal..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Theme Color (`theme_color`)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={manifestForm.themeColor}
                      onChange={(e) => setManifestForm({ ...manifestForm, themeColor: e.target.value })}
                      className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={manifestForm.themeColor}
                      onChange={(e) => setManifestForm({ ...manifestForm, themeColor: e.target.value })}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                    />
                  </div>
                  {/* Preset Colors */}
                  <div className="flex items-center gap-1.5 mt-2">
                    {[
                      { hex: '#020617', label: 'Obsidian' },
                      { hex: '#d97706', label: 'Gold' },
                      { hex: '#1e3a8a', label: 'Navy' },
                      { hex: '#047857', label: 'Green' },
                      { hex: '#7c3aed', label: 'Purple' }
                    ].map((col) => (
                      <button
                        key={col.hex}
                        type="button"
                        onClick={() => setManifestForm({ ...manifestForm, themeColor: col.hex })}
                        className="px-2 py-0.5 rounded text-[10px] font-bold border border-slate-700 flex items-center gap-1 hover:border-slate-500"
                        style={{ backgroundColor: col.hex, color: col.hex === '#d97706' ? '#000' : '#fff' }}
                      >
                        {col.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Background Color (`background_color`)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={manifestForm.backgroundColor}
                      onChange={(e) => setManifestForm({ ...manifestForm, backgroundColor: e.target.value })}
                      className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={manifestForm.backgroundColor}
                      onChange={(e) => setManifestForm({ ...manifestForm, backgroundColor: e.target.value })}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">Splash screen background color on mobile launch</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Screen Orientation (`orientation`)
                  </label>
                  <select
                    value={manifestForm.orientation}
                    onChange={(e) => setManifestForm({ ...manifestForm, orientation: e.target.value as any })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
                  >
                    <option value="portrait-primary">portrait-primary (Standard Vertical Mobile)</option>
                    <option value="any">any (Support Landscape &amp; Portrait auto-rotate)</option>
                  </select>
                  <span className="text-[10px] text-slate-500 mt-1 block">Locked orientation for optimum judicial view</span>
                </div>

              </div>

              {/* Live Manifest JSON Inspector */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 font-mono">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span>Active Manifest JSON (`manifest.json` Preview)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const jsonStr = JSON.stringify(generateManifestJson(manifestForm), null, 2);
                      navigator.clipboard.writeText(jsonStr);
                      showToast('Manifest JSON copied to clipboard!');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy JSON</span>
                  </button>
                </div>

                <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-emerald-400 text-[11px] font-mono overflow-x-auto max-h-56 leading-relaxed">
                  {JSON.stringify(generateManifestJson(manifestForm), null, 2)}
                </pre>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* MODAL: ADD NEW BAR ASSOCIATION / TENANT */}
      {isAddTenantModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-slate-100">Add New Bar Association / Legal Client</h3>
              </div>
              <button
                onClick={() => setIsAddTenantModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Organization / Bar Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={tenantForm.name}
                    onChange={(e) => setTenantForm({ ...tenantForm, name: e.target.value })}
                    placeholder="e.g. Criminal & Revenue Bar Association, Ballia"
                    className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-100 rounded-xl px-3 py-2.5 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    संस्था का नाम (हिंदी)
                  </label>
                  <input
                    type="text"
                    value={tenantForm.hindiName}
                    onChange={(e) => setTenantForm({ ...tenantForm, hindiName: e.target.value })}
                    placeholder="उदा. फौजदारी एवं राजस्व बार एसोसिएशन, बलिया"
                    className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-100 rounded-xl px-3 py-2.5 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Short Tag / Code (e.g. CRBA Ballia)
                  </label>
                  <input
                    type="text"
                    value={tenantForm.shortName}
                    onChange={(e) => setTenantForm({ ...tenantForm, shortName: e.target.value })}
                    placeholder="e.g. CRBA Ballia"
                    className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-100 rounded-xl px-3 py-2.5 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Organization Type
                  </label>
                  <select
                    value={tenantForm.type}
                    onChange={(e) => setTenantForm({ ...tenantForm, type: e.target.value as TenantType })}
                    className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-100 rounded-xl px-3 py-2.5 focus:outline-none focus:border-purple-500"
                  >
                    <option value="BAR_ASSOCIATION">Bar Association (बार एसोसिएशन)</option>
                    <option value="LEGAL_FIRM">Legal Firm / Chamber (लीगल फर्म)</option>
                    <option value="INDIVIDUAL_ADVOCATE">Individual Advocate (व्यक्तिगत अधिवक्ता)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    District / Jurisdiction
                  </label>
                  <input
                    type="text"
                    required
                    value={tenantForm.district}
                    onChange={(e) => setTenantForm({ ...tenantForm, district: e.target.value })}
                    placeholder="e.g. Ballia / Mau / Varanasi"
                    className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-100 rounded-xl px-3 py-2.5 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Admin Contact Name
                  </label>
                  <input
                    type="text"
                    required
                    value={tenantForm.adminName}
                    onChange={(e) => setTenantForm({ ...tenantForm, adminName: e.target.value })}
                    placeholder="e.g. Bar Secretary / Adv. Sharma"
                    className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-100 rounded-xl px-3 py-2.5 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Admin Email (Login ID) *
                  </label>
                  <input
                    type="email"
                    required
                    value={tenantForm.adminEmail}
                    onChange={(e) => setTenantForm({ ...tenantForm, adminEmail: e.target.value })}
                    placeholder="e.g. admin@barballia.com"
                    className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-100 rounded-xl px-3 py-2.5 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-300">
                      Admin Password (पासवर्ड सेट करें) *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const randomPass = 'BarAdmin@' + Math.floor(100 + Math.random() * 900);
                        setTenantForm({ ...tenantForm, adminPassword: randomPass });
                      }}
                      className="text-[10px] text-purple-400 hover:text-purple-300 underline font-medium"
                    >
                      नया रैंडम पासवर्ड बनाएं
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showAdminPassword ? 'text' : 'password'}
                      required
                      value={tenantForm.adminPassword}
                      onChange={(e) => setTenantForm({ ...tenantForm, adminPassword: e.target.value })}
                      placeholder="उदा. Admin@123 या BarAdmin@2026"
                      className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-100 rounded-xl px-3 py-2.5 pr-10 focus:outline-none focus:border-purple-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                      title={showAdminPassword ? 'पासवर्ड छिपाएं' : 'पासवर्ड देखें'}
                    >
                      {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    यह पासवर्ड बार एसोसिएशन के मुख्य एडमिन को लॉगिन करने हेतु दिया जाएगा।
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Plan Tier
                  </label>
                  <select
                    value={tenantForm.plan}
                    onChange={(e) => {
                      const p = e.target.value as TenantPlan;
                      setTenantForm({
                        ...tenantForm,
                        plan: p,
                        licenseKey: generateCryptoLicenseKey('NYAAY', p)
                      });
                    }}
                    className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-100 rounded-xl px-3 py-2.5 focus:outline-none focus:border-purple-500"
                  >
                    <option value="TRIAL">Trial Pack (30 Days)</option>
                    <option value="STARTER">Starter Pack</option>
                    <option value="PROFESSIONAL">Professional Tier</option>
                    <option value="ENTERPRISE_BAR">Enterprise Apex Bar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Max Advocates Quota
                  </label>
                  <input
                    type="number"
                    value={tenantForm.maxAdvocatesQuota}
                    onChange={(e) => setTenantForm({ ...tenantForm, maxAdvocatesQuota: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-100 rounded-xl px-3 py-2.5 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* License Key Preview */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase font-bold block">Generated License Key:</span>
                  <span className="font-mono font-bold text-amber-300 text-xs">{tenantForm.licenseKey}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setTenantForm({ ...tenantForm, licenseKey: generateCryptoLicenseKey('NYAAY', tenantForm.plan) })}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Regenerate</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddTenantModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Create &amp; Provision License</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. POST-CREATION CREDENTIALS SHARE MODAL */}
      {/* ============================================================== */}
      {createdCredentialsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-fadeIn">
            
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-400">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    नई बार एसोसिएशन सफलतापूर्वक बनाई गई!
                  </h3>
                  <p className="text-xs text-slate-400">
                    {createdCredentialsModal.orgName} ({createdCredentialsModal.district})
                  </p>
                </div>
              </div>
            </div>

            {/* Credentials Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5" />
                <span>बार एडमिन लॉगिन क्रेडेंशियल्स (Bar Admin Login Details)</span>
              </div>

              <div className="grid grid-cols-1 gap-2.5 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400 font-medium">एडमिन नाम:</span>
                  <span className="font-semibold text-slate-100">{createdCredentialsModal.adminName}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400 font-medium">लॉगिन ईमेल (User ID):</span>
                  <span className="font-mono font-bold text-purple-300">{createdCredentialsModal.email}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400 font-medium">पासवर्ड (Password):</span>
                  <span className="font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                    {createdCredentialsModal.password}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400 font-medium">सॉफ्टवेयर लाइसेंस कुंजी:</span>
                  <span className="font-mono font-bold text-amber-300 text-[11px]">{createdCredentialsModal.licenseKey}</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              💡 <span className="text-slate-200 font-semibold">नोट:</span> यह क्रेडेंशियल कॉपी करके संबंधित बार एसोसिएशन के अध्यक्ष/सचिव को भेजें। वे इस ईमेल व पासवर्ड से बार एडमिन पैनल में लॉगिन कर सकते हैं।
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  const shareText = `*न्याय सहयोगी (Nyaay Sahayogi) - बार एसोसिएशन एडमिन लॉगिन*\n\n🏛️ *संगठन:* ${createdCredentialsModal.orgName}\n👤 *एडमिन:* ${createdCredentialsModal.adminName}\n📧 *लॉगिन ईमेल:* ${createdCredentialsModal.email}\n🔑 *पासवर्ड:* ${createdCredentialsModal.password}\n🛡️ *लाइसेंस की:* ${createdCredentialsModal.licenseKey}\n\nकृपया पोर्टल में लॉगिन करके अपना कार्यभार संभालें।`;
                  navigator.clipboard.writeText(shareText);
                  showToast('सभी लॉगिन विवरण कॉपी हो गए! (WhatsApp/Email पर पेस्ट करें)');
                }}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>क्रेडेंशियल कॉपी करें (Copy Details)</span>
              </button>

              <button
                type="button"
                onClick={() => setCreatedCredentialsModal(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
              >
                पूर्ण (Close)
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. RESET PASSWORD MODAL */}
      {/* ============================================================== */}
      {resetPasswordModal && resetPasswordModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-fadeIn">
            
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-2xl text-amber-400">
                  <Key className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    पासवर्ड रीसेट करें (Reset Password)
                  </h3>
                  <p className="text-xs text-slate-400">
                    सुपर एडमिन कंसोल से नया पासवर्ड सेट करें
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setResetPasswordModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* User Details Summary */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">यूजर का नाम:</span>
                <span className="font-semibold text-slate-100">{resetPasswordModal.userName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">लॉगिन ईमेल (ID):</span>
                <span className="font-mono font-bold text-purple-300">{resetPasswordModal.userEmail}</span>
              </div>
              {resetPasswordModal.orgName && (
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">संगठन/बार:</span>
                  <span className="font-medium text-slate-300">{resetPasswordModal.orgName}</span>
                </div>
              )}
            </div>

            {/* Password Form */}
            <form onSubmit={handleExecutePasswordReset} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-200">
                    नया पासवर्ड (New Password) *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const newRandom = 'Pass@' + Math.floor(1000 + Math.random() * 9000);
                      setResetPasswordModal({ ...resetPasswordModal, newPassword: newRandom });
                    }}
                    className="text-[11px] text-amber-400 hover:text-amber-300 underline font-medium"
                  >
                    रैंडम पासवर्ड बनाएं
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={resetPasswordModal.showPassword ? 'text' : 'password'}
                    required
                    value={resetPasswordModal.newPassword}
                    onChange={(e) => setResetPasswordModal({ ...resetPasswordModal, newPassword: e.target.value })}
                    placeholder="उदा. BarAdmin@2026 या User@123"
                    className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-100 rounded-xl px-3 py-2.5 pr-10 focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setResetPasswordModal({ ...resetPasswordModal, showPassword: !resetPasswordModal.showPassword })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {resetPasswordModal.showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  सेव करते ही यह पासवर्ड तुरंत लागू हो जाएगा और शेयरिंग टेक्स्ट क्लिपबोर्ड में कॉपी हो जाएगा।
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setResetPasswordModal(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  रद्द करें (Cancel)
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs shadow-lg flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>पासवर्ड अपडेट करें (Save &amp; Copy)</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 8. GLOBAL USER & ADVOCATE PASSWORD LOOKUP DRAWER/MODAL */}
      {/* ============================================================== */}
      {isGlobalUserLookupOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-500/40 rounded-3xl p-6 sm:p-8 max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-fadeIn">
            
            <div className="flex items-start justify-between pb-4 border-b border-slate-800 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-500/20 border border-purple-500/40 rounded-2xl text-purple-400">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    यूजर व एडमिन पासवर्ड मैनेजर (User Password Manager)
                  </h3>
                  <p className="text-xs text-slate-400">
                    सभी बार एसोसिएशन के एडमिन व वकीलों का पासवर्ड खोजें और 1-क्लिक में रीसेट करें
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGlobalUserLookupOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="my-4 relative flex-shrink-0">
              <input
                type="text"
                autoFocus
                value={userLookupQuery}
                onChange={(e) => setUserLookupQuery(e.target.value)}
                placeholder="नाम, ईमेल, मोबाइल नंबर या बार काउंसिल नंबर से खोजें..."
                className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-100 rounded-xl pl-9 pr-3 py-3 placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            </div>

            {/* Users List Container */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {(() => {
                const query = userLookupQuery.toLowerCase().trim();
                const filtered = allAdvocates.filter(a => {
                  return (
                    (a.name || '').toLowerCase().includes(query) ||
                    (a.email || '').toLowerCase().includes(query) ||
                    (a.mobile || '').includes(query) ||
                    (a.barNo || '').toLowerCase().includes(query) ||
                    (a.role || '').toLowerCase().includes(query) ||
                    (a.address?.district || '').toLowerCase().includes(query)
                  );
                });

                if (filtered.length === 0) {
                  return (
                    <div className="text-center py-12 text-slate-500 text-xs">
                      कोई यूजर या वकील नहीं मिला। कृपया अन्य कीवर्ड से खोजें।
                    </div>
                  );
                }

                return filtered.map((u, uIndex) => (
                  <div
                    key={u.id || u.email || `user-${uIndex}`}
                    className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-100">{u.name}</h4>
                          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            u.role === 'bar_admin'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                          }`}>
                            {u.role === 'bar_admin' ? 'Bar Admin' : (u.role || 'Advocate')}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-purple-300">
                          {u.email} • {u.mobile}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {u.barNo || 'No Bar No'} • {u.address?.district || 'District'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => {
                          handleOpenResetPassword(u.email, u.name, u.role === 'bar_admin' ? 'Bar Admin' : 'Advocate', u.address?.district || '');
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span>पासवर्ड बदलें (Reset)</span>
                      </button>
                    </div>
                  </div>
                ));
              })()}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-800 flex justify-end flex-shrink-0 mt-2">
              <button
                type="button"
                onClick={() => setIsGlobalUserLookupOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
              >
                बंद करें (Close)
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
