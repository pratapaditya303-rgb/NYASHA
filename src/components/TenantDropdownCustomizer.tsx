import React, { useState, useEffect } from 'react';
import {
  Building2,
  MapPin,
  Shield,
  Scale,
  Plus,
  Trash2,
  Edit3,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  SlidersHorizontal,
  Gavel,
  X,
  PlusCircle,
  Check
} from 'lucide-react';
import { db } from '../lib/store';
import {
  CourtMaster,
  CaseStageMaster,
  CourtType,
  TenantOrganization,
  TenantDropdownConfig
} from '../types';

interface TenantDropdownCustomizerProps {
  initialTenantId?: string;
  allowTenantSelect?: boolean;
  onConfigUpdated?: () => void;
}

export const TenantDropdownCustomizer: React.FC<TenantDropdownCustomizerProps> = ({
  initialTenantId,
  allowTenantSelect = true,
  onConfigUpdated
}) => {
  const tenants = db.getTenants();
  const currentTenant = db.getCurrentTenant();

  const [selectedTenantId, setSelectedTenantId] = useState<string>(
    initialTenantId || currentTenant.id || 'tenant_ballia_01'
  );

  const [activeSubTab, setActiveSubTab] = useState<'tehsils' | 'thanas' | 'courts' | 'stages'>('tehsils');
  const [config, setConfig] = useState<TenantDropdownConfig>(db.getTenantDropdownConfig(selectedTenantId));
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [courtTypeFilter, setCourtTypeFilter] = useState<string>('ALL');
  const [stageCategoryFilter, setStageCategoryFilter] = useState<string>('ALL');

  // New Items State
  const [newTehsilName, setNewTehsilName] = useState('');
  const [newPoliceStationName, setNewPoliceStationName] = useState('');

  // Bulk add modal/input
  const [isBulkTehsilOpen, setIsBulkTehsilOpen] = useState(false);
  const [bulkTehsilInput, setBulkTehsilInput] = useState('');
  const [isBulkPSOpen, setIsBulkPSOpen] = useState(false);
  const [bulkPSInput, setBulkPSInput] = useState('');

  // Court Modal
  const [isCourtModalOpen, setIsCourtModalOpen] = useState(false);
  const [editingCourt, setEditingCourt] = useState<CourtMaster | null>(null);
  const [courtForm, setCourtForm] = useState<{
    name: string;
    hindiName: string;
    type: CourtType;
    roomNo: string;
    presidingOfficer: string;
    order: number;
    isActive: boolean;
  }>({
    name: '',
    hindiName: '',
    type: 'District & Sessions Court',
    roomNo: '',
    presidingOfficer: '',
    order: 1,
    isActive: true
  });

  // Stage Modal
  const [isStageModalOpen, setIsStageModalOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<CaseStageMaster | null>(null);
  const [stageForm, setStageForm] = useState<{
    name: string;
    hindiName: string;
    category: 'General' | 'Criminal' | 'Civil' | 'Revenue';
    order: number;
    description: string;
    isActive: boolean;
  }>({
    name: '',
    hindiName: '',
    category: 'General',
    order: 1,
    description: '',
    isActive: true
  });

  // Confirm Modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    danger?: boolean;
    onConfirm: () => void;
  } | null>(null);

  const selectedTenant = tenants.find(t => t.id === selectedTenantId) || currentTenant;

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const loadConfigForTenant = (tid: string) => {
    const loaded = db.getTenantDropdownConfig(tid);
    setConfig(loaded);
  };

  useEffect(() => {
    loadConfigForTenant(selectedTenantId);
  }, [selectedTenantId]);

  const handleTenantChange = (tid: string) => {
    setSelectedTenantId(tid);
    loadConfigForTenant(tid);
    showToast(`स्विच किया गया: ${tenants.find(t => t.id === tid)?.name || tid}`, 'info');
  };

  // Tehsil Handlers
  const handleAddTehsil = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newTehsilName.trim();
    if (!trimmed) return;
    if (config.tehsils.some(t => t.toLowerCase() === trimmed.toLowerCase())) {
      showToast('यह तहसील पहले से सूची में मौजूद है!', 'error');
      return;
    }
    db.addTehsil(selectedTenantId, trimmed);
    const updated = db.getTenantDropdownConfig(selectedTenantId);
    setConfig(updated);
    setNewTehsilName('');
    showToast(`तहसील "${trimmed}" सफलतापूर्वक जोड़ी गई`);
    if (onConfigUpdated) onConfigUpdated();
  };

  const handleBulkAddTehsils = () => {
    const lines = bulkTehsilInput.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
    if (lines.length === 0) return;
    let addedCount = 0;
    lines.forEach(name => {
      if (!config.tehsils.some(t => t.toLowerCase() === name.toLowerCase())) {
        db.addTehsil(selectedTenantId, name);
        addedCount++;
      }
    });
    const updated = db.getTenantDropdownConfig(selectedTenantId);
    setConfig(updated);
    setBulkTehsilInput('');
    setIsBulkTehsilOpen(false);
    showToast(`${addedCount} नई तहसीलें जोड़ी गईं!`);
    if (onConfigUpdated) onConfigUpdated();
  };

  const handleDeleteTehsil = (tehsil: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'तहसील हटाएं',
      message: `क्या आप "${tehsil}" को इस बार एसोसिएशन के ड्रॉपडाउन से हटाना चाहते हैं?`,
      danger: true,
      onConfirm: () => {
        db.removeTehsil(selectedTenantId, tehsil);
        const updated = db.getTenantDropdownConfig(selectedTenantId);
        setConfig(updated);
        showToast(`तहसील "${tehsil}" हटाई गई`, 'info');
        setConfirmModal(null);
        if (onConfigUpdated) onConfigUpdated();
      }
    });
  };

  // Police Station Handlers
  const handleAddPoliceStation = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newPoliceStationName.trim();
    if (!trimmed) return;
    if (config.policeStations.some(p => p.toLowerCase() === trimmed.toLowerCase())) {
      showToast('यह थाना पहले से सूची में मौजूद है!', 'error');
      return;
    }
    db.addPoliceStation(selectedTenantId, trimmed);
    const updated = db.getTenantDropdownConfig(selectedTenantId);
    setConfig(updated);
    setNewPoliceStationName('');
    showToast(`थाना "${trimmed}" सफलतापूर्वक जोड़ा गया`);
    if (onConfigUpdated) onConfigUpdated();
  };

  const handleBulkAddPS = () => {
    const lines = bulkPSInput.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
    if (lines.length === 0) return;
    let addedCount = 0;
    lines.forEach(name => {
      if (!config.policeStations.some(p => p.toLowerCase() === name.toLowerCase())) {
        db.addPoliceStation(selectedTenantId, name);
        addedCount++;
      }
    });
    const updated = db.getTenantDropdownConfig(selectedTenantId);
    setConfig(updated);
    setBulkPSInput('');
    setIsBulkPSOpen(false);
    showToast(`${addedCount} नए थाने/चौकियाँ जोड़ी गईं!`);
    if (onConfigUpdated) onConfigUpdated();
  };

  const handleDeletePoliceStation = (ps: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'थाना/चौकी हटाएं',
      message: `क्या आप "${ps}" को इस बार एसोसिएशन के ड्रॉपडाउन से हटाना चाहते हैं?`,
      danger: true,
      onConfirm: () => {
        db.removePoliceStation(selectedTenantId, ps);
        const updated = db.getTenantDropdownConfig(selectedTenantId);
        setConfig(updated);
        showToast(`थाना "${ps}" हटाया गया`, 'info');
        setConfirmModal(null);
        if (onConfigUpdated) onConfigUpdated();
      }
    });
  };

  // Court Handlers
  const handleOpenCourtModal = (court?: CourtMaster) => {
    if (court) {
      setEditingCourt(court);
      setCourtForm({
        name: court.name,
        hindiName: court.hindiName || '',
        type: court.type,
        roomNo: court.roomNo || '',
        presidingOfficer: court.presidingOfficer || '',
        order: court.order || 1,
        isActive: court.isActive !== false
      });
    } else {
      setEditingCourt(null);
      setCourtForm({
        name: '',
        hindiName: '',
        type: 'District & Sessions Court',
        roomNo: '',
        presidingOfficer: '',
        order: (config.courts?.length || 0) + 1,
        isActive: true
      });
    }
    setIsCourtModalOpen(true);
  };

  const handleSaveCourt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courtForm.name.trim()) {
      showToast('कृपया न्यायालय का नाम दर्ज करें', 'error');
      return;
    }

    const courtObj: CourtMaster = {
      id: editingCourt ? editingCourt.id : `court_${selectedTenantId}_${Date.now()}`,
      name: courtForm.name.trim(),
      hindiName: courtForm.hindiName.trim(),
      type: courtForm.type,
      roomNo: courtForm.roomNo.trim() || undefined,
      presidingOfficer: courtForm.presidingOfficer.trim() || undefined,
      order: Number(courtForm.order) || 1,
      isActive: courtForm.isActive
    };

    db.saveTenantCourt(selectedTenantId, courtObj);
    const updated = db.getTenantDropdownConfig(selectedTenantId);
    setConfig(updated);
    setIsCourtModalOpen(false);
    showToast(editingCourt ? 'न्यायालय जानकारी अपडेट की गई' : 'नया न्यायालय जोड़ा गया');
    if (onConfigUpdated) onConfigUpdated();
  };

  const handleDeleteCourt = (courtId: string, courtName: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'न्यायालय हटाएं',
      message: `क्या आप "${courtName}" को सूची से हटाना चाहते हैं?`,
      danger: true,
      onConfirm: () => {
        db.deleteTenantCourt(selectedTenantId, courtId);
        const updated = db.getTenantDropdownConfig(selectedTenantId);
        setConfig(updated);
        showToast('न्यायालय हटाया गया', 'info');
        setConfirmModal(null);
        if (onConfigUpdated) onConfigUpdated();
      }
    });
  };

  // Case Stage Handlers
  const handleOpenStageModal = (stage?: CaseStageMaster) => {
    if (stage) {
      setEditingStage(stage);
      setStageForm({
        name: stage.name,
        hindiName: stage.hindiName || '',
        category: stage.category || 'General',
        order: stage.order || 1,
        description: stage.description || '',
        isActive: stage.isActive !== false
      });
    } else {
      setEditingStage(null);
      setStageForm({
        name: '',
        hindiName: '',
        category: 'General',
        order: (config.caseStages?.length || 0) + 1,
        description: '',
        isActive: true
      });
    }
    setIsStageModalOpen(true);
  };

  const handleSaveStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stageForm.name.trim()) {
      showToast('कृपया प्रक्रम का नाम दर्ज करें', 'error');
      return;
    }

    const stageObj: CaseStageMaster = {
      id: editingStage ? editingStage.id : `stage_${selectedTenantId}_${Date.now()}`,
      name: stageForm.name.trim(),
      hindiName: stageForm.hindiName.trim(),
      category: stageForm.category,
      order: Number(stageForm.order) || 1,
      description: stageForm.description.trim() || undefined,
      isActive: stageForm.isActive
    };

    db.saveTenantCaseStage(selectedTenantId, stageObj);
    const updated = db.getTenantDropdownConfig(selectedTenantId);
    setConfig(updated);
    setIsStageModalOpen(false);
    showToast(editingStage ? 'प्रक्रम अपडेट किया गया' : 'नया वाद प्रक्रम जोड़ा गया');
    if (onConfigUpdated) onConfigUpdated();
  };

  const handleDeleteStage = (stageId: string, stageName: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'केस प्रक्रम हटाएं',
      message: `क्या आप "${stageName}" को सूची से हटाना चाहते हैं?`,
      danger: true,
      onConfirm: () => {
        db.deleteTenantCaseStage(selectedTenantId, stageId);
        const updated = db.getTenantDropdownConfig(selectedTenantId);
        setConfig(updated);
        showToast('केस प्रक्रम हटाया गया', 'info');
        setConfirmModal(null);
        if (onConfigUpdated) onConfigUpdated();
      }
    });
  };

  // Reset to Defaults
  const handleResetDefaults = () => {
    setConfirmModal({
      isOpen: true,
      title: 'डिफ़ॉल्ट सेटिंग्स रीसेट करें',
      message: `क्या आप "${selectedTenant.name}" के लिए सभी तहसील, थाने व कोर्ट की सूची को मूल प्रारंभिक डेटा पर रीसेट करना चाहते हैं?`,
      danger: true,
      onConfirm: () => {
        const reset = db.resetTenantDropdownConfig(selectedTenantId);
        setConfig(reset);
        showToast('ड्रॉपडाउन सेटिंग्स सफलतापूर्वक रीसेट की गईं!');
        setConfirmModal(null);
        if (onConfigUpdated) onConfigUpdated();
      }
    });
  };

  // Filtering
  const filteredTehsils = (config.tehsils || []).filter(t =>
    t.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPS = (config.policeStations || []).filter(p =>
    p.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCourts = (config.courts || []).filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.hindiName && c.hindiName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.roomNo && c.roomNo.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = courtTypeFilter === 'ALL' || c.type === courtTypeFilter;
    return matchesSearch && matchesType;
  });

  const filteredStages = (config.caseStages || []).filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.hindiName && s.hindiName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = stageCategoryFilter === 'ALL' || s.category === stageCategoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-sm font-medium border shadow-lg transition-all ${
            toastMsg.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : toastMsg.type === 'info'
              ? 'bg-indigo-50 border-indigo-200 text-indigo-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMsg.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            )}
            <span>{toastMsg.text}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Tenant Selector */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-700">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Tenant Master Dropdown Settings (कस्टमाइज़र)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              प्रत्येक बार एसोसिएशन के लिए ज़िला तहसील, थाने, न्यायालय व वाद प्रक्रम सीधे स्क्रीन से जोड़ें, संशोधित करें या हटाएं।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {allowTenantSelect && (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <Building2 className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-semibold text-slate-600">बार एसोसिएशन:</span>
                <select
                  value={selectedTenantId}
                  onChange={e => handleTenantChange(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 border-none outline-none cursor-pointer pr-4"
                >
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.district || 'All Districts'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800 text-xs font-semibold rounded-xl transition bg-slate-50 hover:bg-slate-100"
              title="मूल डिफ़ॉल्ट डेटा पर रीसेट करें"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              डिफ़ॉल्ट रीसेट
            </button>
          </div>
        </div>

        {/* Selected Tenant Summary Badge */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">{selectedTenant.name}</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono text-[11px]">
              ID: {selectedTenant.id}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold text-[11px]">
              ज़िला: {selectedTenant.district || 'Ballia'}
            </span>
          </div>
          <div className="text-slate-400">
            अंतिम अपडेट: {config.updatedAt || 'आज'}
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => {
            setActiveSubTab('tehsils');
            setSearchQuery('');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition ${
            activeSubTab === 'tehsils'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <MapPin className="w-4 h-4 text-emerald-400" />
          तहसील सूची
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] ${
              activeSubTab === 'tehsils' ? 'bg-slate-800 text-emerald-300' : 'bg-slate-100 text-slate-700'
            }`}
          >
            {config.tehsils?.length || 0}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveSubTab('thanas');
            setSearchQuery('');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition ${
            activeSubTab === 'thanas'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Shield className="w-4 h-4 text-blue-400" />
          थाने व चौकियां
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] ${
              activeSubTab === 'thanas' ? 'bg-slate-800 text-blue-300' : 'bg-slate-100 text-slate-700'
            }`}
          >
            {config.policeStations?.length || 0}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveSubTab('courts');
            setSearchQuery('');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition ${
            activeSubTab === 'courts'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Gavel className="w-4 h-4 text-amber-400" />
          न्यायालय व फ़ोरम
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] ${
              activeSubTab === 'courts' ? 'bg-slate-800 text-amber-300' : 'bg-slate-100 text-slate-700'
            }`}
          >
            {config.courts?.length || 0}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveSubTab('stages');
            setSearchQuery('');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition ${
            activeSubTab === 'stages'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Scale className="w-4 h-4 text-purple-400" />
          केस प्रकार व प्रक्रम
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] ${
              activeSubTab === 'stages' ? 'bg-slate-800 text-purple-300' : 'bg-slate-100 text-slate-700'
            }`}
          >
            {config.caseStages?.length || 0}
          </span>
        </button>
      </div>

      {/* SUBTAB 1: TEHSILS */}
      {activeSubTab === 'tehsils' && (
        <div className="space-y-4">
          {/* Add Form & Search */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
            <form onSubmit={handleAddTehsil} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="नई तहसील का नाम दर्ज करें (उदा. Ballia Sadar, बैरिया, रसड़ा...)"
                  value={newTehsilName}
                  onChange={e => setNewTehsilName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={!newTehsilName.trim()}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
                >
                  <Plus className="w-4 h-4" />
                  तहसील जोड़ें
                </button>
                <button
                  type="button"
                  onClick={() => setIsBulkTehsilOpen(!isBulkTehsilOpen)}
                  className="px-3 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
                >
                  <PlusCircle className="w-4 h-4 text-emerald-600" />
                  एक साथ कई जोड़ें
                </button>
              </div>
            </form>

            {/* Bulk Add Accordion */}
            {isBulkTehsilOpen && (
              <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-2">
                <div className="text-xs font-semibold text-emerald-900">
                  एक साथ कई तहसीलें जोड़ें (अल्पविराम या नई पंक्ति में नाम दर्ज करें):
                </div>
                <textarea
                  rows={3}
                  value={bulkTehsilInput}
                  onChange={e => setBulkTehsilInput(e.target.value)}
                  placeholder="Bansdih, Rasra, Bairia, Sikanderpur, Belthara Road..."
                  className="w-full bg-white border border-emerald-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsBulkTehsilOpen(false)}
                    className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                  >
                    रद्द करें
                  </button>
                  <button
                    onClick={handleBulkAddTehsils}
                    className="px-3 py-1.5 bg-emerald-700 text-white text-xs font-bold rounded-lg hover:bg-emerald-800"
                  >
                    इन्हें सुरक्षित करें
                  </button>
                </div>
              </div>
            )}

            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="तहसील खोजें..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Tehsils Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredTehsils.length > 0 ? (
              filteredTehsils.map((tehsil, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center justify-between hover:border-slate-300 hover:shadow-sm transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-[10px] font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-800">{tehsil}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteTehsil(tehsil)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="हटाएं"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-full py-8 text-center bg-white border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
                कोई तहसील नहीं मिली
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 2: POLICE STATIONS */}
      {activeSubTab === 'thanas' && (
        <div className="space-y-4">
          {/* Add Form & Search */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
            <form onSubmit={handleAddPoliceStation} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="नए थाने/चौकी का नाम दर्ज करें (उदा. फेफना, कोतवाली, सुखपुरा...)"
                  value={newPoliceStationName}
                  onChange={e => setNewPoliceStationName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={!newPoliceStationName.trim()}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
                >
                  <Plus className="w-4 h-4" />
                  थाना जोड़ें
                </button>
                <button
                  type="button"
                  onClick={() => setIsBulkPSOpen(!isBulkPSOpen)}
                  className="px-3 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
                >
                  <PlusCircle className="w-4 h-4 text-blue-600" />
                  एक साथ कई जोड़ें
                </button>
              </div>
            </form>

            {/* Bulk Add Accordion */}
            {isBulkPSOpen && (
              <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-xl space-y-2">
                <div className="text-xs font-semibold text-blue-900">
                  एक साथ कई थाने/चौकियाँ जोड़ें (अल्पविराम या नई पंक्ति में नाम दर्ज करें):
                </div>
                <textarea
                  rows={3}
                  value={bulkPSInput}
                  onChange={e => setBulkPSInput(e.target.value)}
                  placeholder="कोतवाली (Kotwali), फेफना (Phephana), हल्दी (Haldi), नगरा (Nagara)..."
                  className="w-full bg-white border border-blue-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsBulkPSOpen(false)}
                    className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                  >
                    रद्द करें
                  </button>
                  <button
                    onClick={handleBulkAddPS}
                    className="px-3 py-1.5 bg-blue-700 text-white text-xs font-bold rounded-lg hover:bg-blue-800"
                  >
                    इन्हें सुरक्षित करें
                  </button>
                </div>
              </div>
            )}

            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="थाना या चौकी खोजें..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Thanas Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredPS.length > 0 ? (
              filteredPS.map((ps, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center justify-between hover:border-slate-300 hover:shadow-sm transition group"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <span className="w-6 h-6 flex-shrink-0 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center text-[10px] font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-800 truncate" title={ps}>
                      {ps}
                    </span>
                  </div>
                  {ps !== 'Other / अन्य' && (
                    <button
                      onClick={() => handleDeletePoliceStation(ps)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition flex-shrink-0"
                      title="हटाएं"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-full py-8 text-center bg-white border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
                कोई थाना नहीं मिला
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 3: COURTS & TRIBUNALS */}
      {activeSubTab === 'courts' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="न्यायालय या कक्ष संख्या खोजें..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <select
                value={courtTypeFilter}
                onChange={e => setCourtTypeFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
              >
                <option value="ALL">सभी न्यायालय प्रकार (All Types)</option>
                <option value="District & Sessions Court">District & Sessions Court</option>
                <option value="Revenue Court">Revenue Court (राजस्व)</option>
                <option value="Magistrate Court">Magistrate Court (न्यायिक)</option>
                <option value="Tribunal / Forum">Tribunal / Forum (अधिकरण)</option>
              </select>
            </div>

            <button
              onClick={() => handleOpenCourtModal()}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              नया न्यायालय जोड़ें
            </button>
          </div>

          {/* Courts List Table/Cards */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">क्र.</th>
                    <th className="py-3 px-4">न्यायालय का नाम (Court Name)</th>
                    <th className="py-3 px-4">न्यायालय प्रकार (Type)</th>
                    <th className="py-3 px-4">कक्ष संख्या (Room No.)</th>
                    <th className="py-3 px-4">पीठासीन अधिकारी (Presiding Officer)</th>
                    <th className="py-3 px-4">स्थिति (Status)</th>
                    <th className="py-3 px-4 text-right">कार्यवाही</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredCourts.length > 0 ? (
                    filteredCourts.map((c, idx) => (
                      <tr key={c.id} className="hover:bg-slate-50/75 transition">
                        <td className="py-3 px-4 font-bold text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{c.name}</div>
                          {c.hindiName && (
                            <div className="text-[11px] text-slate-500">{c.hindiName}</div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                              c.type === 'District & Sessions Court'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : c.type === 'Revenue Court'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : c.type === 'Magistrate Court'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {c.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                          {c.roomNo || '—'}
                        </td>
                        <td className="py-3 px-4 text-slate-600">{c.presidingOfficer || '—'}</td>
                        <td className="py-3 px-4">
                          {c.isActive !== false ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              सक्रिय
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold text-slate-400">निष्क्रिय</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => handleOpenCourtModal(c)}
                              className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                              title="संशोधित करें"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCourt(c.id, c.name)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="हटाएं"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                        कोई न्यायालय नहीं मिला
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: CASE STAGES & TYPES */}
      {activeSubTab === 'stages' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="प्रक्रम का नाम खोजें..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <select
                value={stageCategoryFilter}
                onChange={e => setStageCategoryFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
              >
                <option value="ALL">सभी श्रेणियाँ (All Categories)</option>
                <option value="General">General (सामान्य)</option>
                <option value="Criminal">Criminal (फौजदारी)</option>
                <option value="Civil">Civil (दीवानी)</option>
                <option value="Revenue">Revenue (राजस्व)</option>
              </select>
            </div>

            <button
              onClick={() => handleOpenStageModal()}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              नया वाद प्रक्रम जोड़ें
            </button>
          </div>

          {/* Stages Grid / Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">क्र.</th>
                    <th className="py-3 px-4">वाद प्रक्रम (Stage Name)</th>
                    <th className="py-3 px-4">श्रेणी (Category)</th>
                    <th className="py-3 px-4">क्रम (Order)</th>
                    <th className="py-3 px-4">विवरण (Description)</th>
                    <th className="py-3 px-4 text-right">कार्यवाही</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredStages.length > 0 ? (
                    filteredStages.map((s, idx) => (
                      <tr key={s.id} className="hover:bg-slate-50/75 transition">
                        <td className="py-3 px-4 font-bold text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{s.name}</div>
                          {s.hindiName && (
                            <div className="text-[11px] text-slate-500">{s.hindiName}</div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                              s.category === 'Criminal'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : s.category === 'Revenue'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : s.category === 'Civil'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {s.category || 'General'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                          {s.order || idx + 1}
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-[11px] max-w-xs truncate">
                          {s.description || '—'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => handleOpenStageModal(s)}
                              className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                              title="संशोधित करें"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteStage(s.id, s.name)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="हटाएं"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                        कोई वाद प्रक्रम नहीं मिला
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* COURT MODAL */}
      {isCourtModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {editingCourt ? 'न्यायालय जानकारी संशोधित करें' : 'नया न्यायालय जोड़ें'}
              </h3>
              <button
                onClick={() => setIsCourtModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourt} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  न्यायालय का नाम (अंग्रेज़ी) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. Court of District & Sessions Judge, Ballia"
                  value={courtForm.name}
                  onChange={e => setCourtForm({ ...courtForm, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  न्यायालय का नाम (हिंदी)
                </label>
                <input
                  type="text"
                  placeholder="उदा. जिला एवं सत्र न्यायाधीश न्यायालय"
                  value={courtForm.hindiName}
                  onChange={e => setCourtForm({ ...courtForm, hindiName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    न्यायालय प्रकार *
                  </label>
                  <select
                    value={courtForm.type}
                    onChange={e => setCourtForm({ ...courtForm, type: e.target.value as CourtType })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="District & Sessions Court">District & Sessions Court</option>
                    <option value="Revenue Court">Revenue Court (राजस्व)</option>
                    <option value="Magistrate Court">Magistrate Court (न्यायिक)</option>
                    <option value="Tribunal / Forum">Tribunal / Forum (अधिकरण)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    कक्ष संख्या (Room No.)
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. Court Room No. 01"
                    value={courtForm.roomNo}
                    onChange={e => setCourtForm({ ...courtForm, roomNo: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    पीठासीन अधिकारी पद
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. District & Sessions Judge"
                    value={courtForm.presidingOfficer}
                    onChange={e => setCourtForm({ ...courtForm, presidingOfficer: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">प्रदर्शन क्रम (Order)</label>
                  <input
                    type="number"
                    min="1"
                    value={courtForm.order}
                    onChange={e => setCourtForm({ ...courtForm, order: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCourtModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800"
                >
                  सुरक्षित करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STAGE MODAL */}
      {isStageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {editingStage ? 'वाद प्रक्रम संशोधित करें' : 'नया वाद प्रक्रम जोड़ें'}
              </h3>
              <button
                onClick={() => setIsStageModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStage} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  प्रक्रम का नाम (अंग्रेज़ी) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. Framing of Charges, Arguments, Final Order..."
                  value={stageForm.name}
                  onChange={e => setStageForm({ ...stageForm, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  प्रक्रम का नाम (हिंदी)
                </label>
                <input
                  type="text"
                  placeholder="उदा. आरोप विरचन, साक्ष्य वादी, अंतिम बहस..."
                  value={stageForm.hindiName}
                  onChange={e => setStageForm({ ...stageForm, hindiName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">श्रेणी *</label>
                  <select
                    value={stageForm.category}
                    onChange={e =>
                      setStageForm({
                        ...stageForm,
                        category: e.target.value as 'General' | 'Criminal' | 'Civil' | 'Revenue'
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="General">General (सामान्य)</option>
                    <option value="Criminal">Criminal (फौजदारी)</option>
                    <option value="Civil">Civil (दीवानी)</option>
                    <option value="Revenue">Revenue (राजस्व)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">प्रदर्शन क्रम (Order)</label>
                  <input
                    type="number"
                    min="1"
                    value={stageForm.order}
                    onChange={e => setStageForm({ ...stageForm, order: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">संक्षिप्त विवरण (वैकल्पिक)</label>
                <textarea
                  rows={2}
                  placeholder="इस वाद प्रक्रम का संक्षिप्त विवरण..."
                  value={stageForm.description}
                  onChange={e => setStageForm({ ...stageForm, description: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsStageModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800"
                >
                  सुरक्षित करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM MODAL */}
      {confirmModal && confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm mb-2">{confirmModal.title}</h4>
            <p className="text-xs text-slate-600 mb-4">{confirmModal.message}</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                रद्द करें
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className={`px-3 py-1.5 text-xs font-bold text-white rounded-lg ${
                  confirmModal.danger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-slate-900 hover:bg-slate-800'
                }`}
              >
                स्वीकारें
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
