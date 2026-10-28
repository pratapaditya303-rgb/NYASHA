import React, { useState } from 'react';
import {
  Users,
  FileText,
  IndianRupee,
  Calendar,
  Plus,
  Search,
  Filter,
  Download,
  Phone,
  CheckCircle2,
  Clock,
  Printer,
  Bell,
  Trash2,
  Edit,
  ShieldCheck,
  CreditCard,
  Scale,
  Sparkles,
  QrCode,
  MessageSquare,
  Vote,
  Landmark,
  ChevronRight,
  Award,
  AlertCircle
} from 'lucide-react';
import { Advocate, Client, CaseNature } from '../types';
import { db } from '../lib/store';
import { AddClientModal } from '../components/AddClientModal';
import { RazorpayModal } from '../components/RazorpayModal';
import { AdvocateIDCardModal } from '../components/AdvocateIDCardModal';
import {
  generateAdvocateIDCardPDF,
  generateAdvocateSlipPDF,
  generateVakalatnamaPDF,
  generateAffidavitPDF
} from '../lib/pdfGenerator';

interface AdvocateDashboardViewProps {
  advocate: Advocate;
  onLogout: () => void;
  onNavigate?: (route: string) => void;
}

const CASE_NATURES: Array<CaseNature | 'ALL'> = [
  'ALL',
  'CRIMINAL',
  'REVENUE',
  'CIVIL',
  'MATRIMONIAL',
  'MVACT',
  'JUVENILE'
];

export const AdvocateDashboardView: React.FC<AdvocateDashboardViewProps> = ({
  advocate: initialAdvocate,
  onLogout,
  onNavigate
}) => {
  const [advocate, setAdvocate] = useState<Advocate>(initialAdvocate);
  const [clients, setClients] = useState<Client[]>(db.getClientsByAdvocate(advocate.id));
  const [search, setSearch] = useState('');
  const [selectedNature, setSelectedNature] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'Open' | 'Closed'>('ALL');

  // Modals
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);
  const [isIDCardModalOpen, setIsIDCardModalOpen] = useState(false);
  const [hearingAlertSent, setHearingAlertSent] = useState<string | null>(null);

  const stateConfig = db.getStateBarConfig();
  const hasVotedState = db.hasAdvocateVotedAnyStatePost(advocate.barNo, advocate.copNo);
  const voterVotes = db.getStateVotesByVoter(advocate.barNo, advocate.copNo);

  const refreshData = () => {
    const updatedAdv = db.getAdvocateByBarNo(advocate.barNo) || advocate;
    setAdvocate(updatedAdv);
    setClients(db.getClientsByAdvocate(advocate.id));
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
  }, [advocate.barNo, advocate.id]);

  // Stats
  const totalClients = clients.length;
  const activeCases = clients.filter(c => c.status === 'Open').length;
  const totalReceived = clients.reduce((sum, c) => sum + c.feesReceived, 0);
  const totalPending = clients.reduce((sum, c) => sum + c.feesPending, 0);

  const filteredClients = clients.filter(c => {
    const q = (search || '').trim().toLowerCase();
    const matchesSearch =
      !q ||
      (c.clientName || '').toLowerCase().includes(q) ||
      (c.caseNo || '').toLowerCase().includes(q) ||
      (c.courtName || '').toLowerCase().includes(q) ||
      (c.clientMobile || '').includes(q);

    const matchesNature = selectedNature === 'ALL' || c.caseNature === selectedNature;
    const matchesStatus = selectedStatus === 'ALL' || c.status === selectedStatus;

    return matchesSearch && matchesNature && matchesStatus;
  });

  const handleSaveClient = (client: Client) => {
    if (editingClient) {
      db.updateClient(client.id, client);
    } else {
      db.addClient(client);
    }
    setEditingClient(null);
    refreshData();
  };

  const handleDeleteClient = (clientId: string) => {
    if (window.confirm('Are you sure you want to remove this client record?')) {
      db.deleteClient(clientId);
      refreshData();
    }
  };

  const handleSendHearingAlert = (client: Client) => {
    // Add Notification to store
    db.addNotification({
      id: 'notif_' + Date.now(),
      title: `Upcoming Hearing Alert: ${client.caseNo}`,
      message: `Case for ${client.clientName} is listed before ${client.courtName} on ${client.nextHearingDate}. (Stage: ${client.caseStage})`,
      targetRole: 'advocate',
      isRead: false,
      createdAt: new Date().toLocaleDateString('en-GB')
    });

    setHearingAlertSent(`Hearing SMS/WhatsApp reminder simulated for ${client.clientName} (+91-${client.clientMobile})`);
    setTimeout(() => setHearingAlertSent(null), 3500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Profile & Quick Actions Banner */}
      <div className="rounded-3xl bg-slate-900 border border-slate-700 p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          
          <div className="flex items-center gap-4">
            <img
              src={advocate.photoUrl}
              alt={advocate.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-500/40 shadow-lg"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/30">
                  {advocate.barNo}
                </span>
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Bar Member
                </span>
                <span className="text-[11px] text-slate-400">
                  COP: {advocate.copNo}
                </span>
              </div>
              
              <h1 className="text-xl sm:text-2xl font-bold text-slate-100 mt-1">
                Advocate {advocate.name}
              </h1>

              <p className="text-xs text-slate-400">
                Chamber: {advocate.chamberNo || 'District Court Bar Hall, Ballia'} • Valid Till: <strong className="text-amber-300">{advocate.validTill || '31/12/2026'}</strong>
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={() => setIsIDCardModalOpen(true)}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-100 border border-amber-500/40 hover:border-amber-400 font-bold text-xs flex items-center justify-center gap-2 shadow transition-all"
            >
              <QrCode className="w-4 h-4 text-amber-400" />
              <span>View Bar ID Card</span>
            </button>

            <button
              onClick={() => generateAdvocateIDCardPDF(advocate)}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download ID Card (PDF)</span>
            </button>

            <button
              onClick={() => setIsRazorpayOpen(true)}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center justify-center gap-2 shadow"
            >
              <CreditCard className="w-4 h-4" />
              <span>Renew Membership (₹1200)</span>
            </button>
          </div>

        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Total Clients</span>
              <Users className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl font-bold text-slate-100">{totalClients}</div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Active Cases</span>
              <FileText className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-slate-100">{activeCases}</div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Fees Received</span>
              <IndianRupee className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-emerald-400">₹ {totalReceived.toLocaleString('en-IN')}</div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Fees Pending</span>
              <IndianRupee className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-xl font-bold text-red-400">₹ {totalPending.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>

      {/* Hearing Alert Toast */}
      {hearingAlertSent && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{hearingAlertSent}</span>
        </div>
      )}

      {/* A(1) vs A(2): INDIVIDUAL ADVOCATE PRO PLAN BANNER (Dynamic Pricing from Super Admin) */}
      {(() => {
        const pConfig = db.getPricingConfig();
        if (!pConfig.enforceAdvocateProPaywall && !advocate.isProMember) return null;
        return (
          <div className="rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-950 border border-amber-500/40 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase">
                  {advocate.isProMember ? '⭐ ADVOCATE PRO ACTIVE' : '⚡ UPGRADE TO ADVOCATE PRO'}
                </span>
                <span className="text-xs text-amber-300 font-bold">
                  ₹{pConfig.advocateProMonthly}/माह या ₹{pConfig.advocateProYearly}/वर्ष
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {advocate.isProMember
                  ? `आपका Smart Munshi Case CRM, 8.5"×14" AI Legal Drafting और मुवक्किल WhatsApp अलर्ट प्लान सक्रिय है (Valid till ${advocate.proValidTill || '31/12/2027'})।`
                  : `Smart Munshi Case Diary, मुवक्किल WhatsApp अलर्ट और AI Legal Drafting के लिए Advocate Pro (₹${pConfig.advocateProMonthly}/माह या ₹${pConfig.advocateProYearly}/वर्ष) चुनें।`}
              </p>
            </div>
            {!advocate.isProMember && (
              <button
                type="button"
                onClick={() => {
                  const updated = db.toggleAdvocateProStatus(advocate.id, 'YEARLY');
                  if (updated) {
                    setAdvocate(updated);
                    setHearingAlertSent(`🎉 बधाई! आपका Advocate Pro (₹${pConfig.advocateProYearly}/वर्ष) सफलतापूर्वक सक्रिय हो गया!`);
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg flex-shrink-0"
              >
                Activate Pro (₹{pConfig.advocateProYearly}/yr)
              </button>
            )}
          </div>
        );
      })()}

      {/* STATE BAR COUNCIL GENERAL ELECTION LIVE WIDGET FOR DISTRICT ADVOCATES */}
      {(stateConfig.isEnabled || stateConfig.status === 'VotingOpen') && (
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-900 border-2 border-amber-500/50 p-6 sm:p-7 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase bg-red-600/90 text-white shadow-lg animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  STATE E-VOTING ACTIVE
                </span>
                <span className="text-[11px] font-bold bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-lg border border-amber-500/30">
                  {stateConfig.termYear || '2026-2027'} General Elections
                </span>
                <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg">
                  Across 75 District Bar Associations
                </span>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-100 flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <span>{stateConfig.stateBarCouncilName || 'Bar Council of Uttar Pradesh'}</span>
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  राज्य विधिज्ञ परिषद उत्तर प्रदेश के समस्त पदों (Chairman, Vice Chairman, BCI Delegate, Council Members, Welfare Fund) हेतु ऑनलाइन ई-मतदान जारी है।
                </p>
              </div>

              {/* Voter Credential Verification Badge */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <div className="bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
                  <span className="text-slate-400 text-[10px] block">State Enrollment / Bar No:</span>
                  <span className="font-mono font-bold text-amber-400">{advocate.barNo}</span>
                </div>
                <div className="bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
                  <span className="text-slate-400 text-[10px] block">Certificate of Practice (COP):</span>
                  <span className="font-mono font-bold text-emerald-400">{advocate.copNo || 'COP/UP/2026/VALID'}</span>
                </div>
                <div className="bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
                  <span className="text-slate-400 text-[10px] block">District Association:</span>
                  <span className="font-bold text-slate-200">{advocate.address?.district || 'Ballia'} Bar</span>
                </div>
              </div>
            </div>

            {/* Voting Action / Ballot Status */}
            <div className="w-full lg:w-auto flex flex-col items-stretch lg:items-end gap-3 flex-shrink-0">
              {hasVotedState ? (
                <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-2xl p-4 text-center lg:text-right space-y-1.5">
                  <div className="flex items-center justify-center lg:justify-end gap-1.5 text-emerald-400 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>State Ballot Cast Successfully</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    आप इस राज्य चुनाव में {voterVotes.length} पद(ों) हेतु डिजिटल मतदान कर चुके हैं।
                  </p>
                  {voterVotes[0]?.ballotHash && (
                    <div className="text-[10px] font-mono text-amber-300 bg-slate-950/80 px-2 py-1 rounded border border-amber-500/20 inline-block">
                      Receipt: {voterVotes[0].ballotHash}
                    </div>
                  )}
                  {onNavigate && (
                    <button
                      onClick={() => onNavigate('election')}
                      className="w-full mt-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Vote className="w-3.5 h-3.5" />
                      <span>View State Election Live Tally →</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2 text-center lg:text-right">
                  <div className="inline-flex items-center gap-1.5 text-xs text-amber-300 font-semibold">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Eligible to Cast Digital Ballot</span>
                  </div>
                  <div>
                    {onNavigate ? (
                      <button
                        onClick={() => onNavigate('election')}
                        className="w-full lg:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transform active:scale-95 transition-all"
                      >
                        <Vote className="w-5 h-5 text-slate-950" />
                        <span>राज्य बार चुनाव में वोट डालें (Cast Ballot)</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <a
                        href="#election"
                        className="w-full lg:w-auto px-6 py-3 rounded-2xl bg-amber-500 text-slate-950 font-bold text-sm inline-flex items-center justify-center gap-2"
                      >
                        <Vote className="w-4 h-4" />
                        <span>Cast State Ballot</span>
                      </a>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    One advocate, one vote per post • Cryptographically audited
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CLIENT MANAGEMENT SECTION (Module 4 & 5) */}
      <div className="space-y-4">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2">
              <Scale className="w-5 h-5 text-amber-400" />
              Client Management &amp; Legal Document Generation (वाद प्रबंधन)
            </h2>
            <p className="text-xs text-slate-400">
              Manage client hearings, fee ledgers, and instantly generate Advocate Slip, Vakalatnama, and Affidavit
            </p>
          </div>

          <button
            onClick={() => {
              setEditingClient(null);
              setIsAddClientOpen(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Client (नया मुवक्किल)</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
          
          {/* Nature filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {CASE_NATURES.map((nat) => (
              <button
                key={nat}
                onClick={() => setSelectedNature(nat)}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
                  selectedNature === nat
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {nat}
              </button>
            ))}
          </div>

          {/* Status & Search */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as 'ALL' | 'Open' | 'Closed')}
              className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-2 focus:outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="Open">Open Cases</option>
              <option value="Closed">Closed Cases</option>
            </select>

            <div className="relative flex-1 sm:w-60">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Client or Case No..."
                className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-100 rounded-xl pl-8 pr-3 py-2 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

        </div>

        {/* Clients Table with PDF Generators */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Client Details</th>
                  <th className="py-3.5 px-4">Case &amp; Court Forum</th>
                  <th className="py-3.5 px-4">Hearing Schedule</th>
                  <th className="py-3.5 px-4">Fees Status</th>
                  <th className="py-3.5 px-4 text-center">Legal Docs (PDF)</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-800/50 transition-colors">
                    
                    {/* Client details */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-100 text-xs flex items-center gap-1.5">
                        <span>{client.clientName}</span>
                        {client.isMobileVerified && (
                          <span title="OTP Verified Mobile">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">{client.clientMobile}</p>
                      <p className="text-[10px] text-slate-500">{client.address.village}, Tahsil {client.address.tahsil}</p>
                    </td>

                    {/* Case & Court */}
                    <td className="py-3.5 px-4">
                      {(client.caseTitle || client.caseNameVsName) && (
                        <p className="font-bold text-slate-100 text-xs mb-1 text-amber-300">
                          {client.caseTitle || client.caseNameVsName}
                        </p>
                      )}
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-amber-400">{client.caseNo}</span>
                        <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                          {client.caseNature}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5">{client.courtName}</p>
                      <p className="text-[10px] text-slate-400 italic">{client.caseStage || 'Pending'}</p>
                    </td>

                    {/* Hearing */}
                    <td className="py-3.5 px-4">
                      <div className="text-[11px]">
                        <span className="text-slate-500">Next: </span>
                        <span className="font-bold text-red-400">{client.nextHearingDate}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Prev: {client.previousDate || 'N/A'}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => handleSendHearingAlert(client)}
                          className="inline-flex items-center gap-1 text-[10px] text-amber-400 hover:text-amber-300"
                          title="Send In-App & SMS Hearing Reminder"
                        >
                          <Bell className="w-3 h-3" />
                          <span>Alert</span>
                        </button>
                        <button
                          onClick={() => {
                            const text = encodeURIComponent(
                              `प्रिय ${client.clientName} जी, आपके केस (${client.caseNo}) की अगली सुनवाई की तारीख ${client.nextHearingDate} नियत है। न्यायालय: ${client.courtName} (स्टेज: ${client.caseStage || 'सुनवाई'})। समय पर उपस्थित रहें। - अधिवक्ता ${advocate.name}, बलिया बार एसोसिएशन`
                            );
                            window.open(`https://wa.me/91${client.clientMobile}?text=${text}`, '_blank');
                          }}
                          className="inline-flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300"
                          title="Send Direct WhatsApp Notice to Client"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </button>
                      </div>
                    </td>

                    {/* Fees */}
                    <td className="py-3.5 px-4">
                      <div className="text-[11px]">
                        <span className="text-slate-400">Recv: </span>
                        <span className="font-bold text-emerald-400">₹{client.feesReceived}</span>
                      </div>
                      <div className="text-[11px]">
                        <span className="text-slate-400">Due: </span>
                        <span className="font-bold text-red-400">₹{client.feesPending}</span>
                      </div>
                    </td>

                    {/* Module 5: 3 Document Generators */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex flex-wrap items-center justify-center gap-1.5">
                        <button
                          onClick={() => generateAdvocateSlipPDF(advocate, client)}
                          title="Generate Advocate Slip PDF"
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 text-[10px] font-bold border border-slate-700 flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Adv. Slip</span>
                        </button>

                        <button
                          onClick={() => generateVakalatnamaPDF(advocate, client)}
                          title="Generate Vakalatnama (वकालतनामा) PDF"
                          className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-[10px] font-bold border border-amber-500/30 flex items-center gap-1"
                        >
                          <Scale className="w-3 h-3" />
                          <span>Vakalatnama</span>
                        </button>

                        <button
                          onClick={() => generateAffidavitPDF(advocate, client)}
                          title="Generate Affidavit (शपथ पत्र) PDF"
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold border border-slate-700 flex items-center gap-1"
                        >
                          <ShieldCheck className="w-3 h-3" />
                          <span>Affidavit</span>
                        </button>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditingClient(client);
                            setIsAddClientOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClient(client.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredClients.length === 0 && (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Users className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-xs font-semibold text-slate-400">No client records found.</p>
              <button
                onClick={() => {
                  setEditingClient(null);
                  setIsAddClientOpen(true);
                }}
                className="text-xs text-amber-400 font-bold hover:underline"
              >
                + Add your first client case
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Client Modal */}
      <AddClientModal
        isOpen={isAddClientOpen}
        onClose={() => {
          setIsAddClientOpen(false);
          setEditingClient(null);
        }}
        onSave={handleSaveClient}
        advocate={advocate}
        initialClient={editingClient}
      />

      {/* Razorpay Subscription Renewal Modal */}
      <RazorpayModal
        isOpen={isRazorpayOpen}
        onClose={() => setIsRazorpayOpen(false)}
        advocate={advocate}
        onSuccess={refreshData}
      />

      {/* Official Advocate Digital Bar ID Card Modal */}
      <AdvocateIDCardModal
        isOpen={isIDCardModalOpen}
        onClose={() => setIsIDCardModalOpen(false)}
        advocate={advocate}
      />

    </div>
  );
};
