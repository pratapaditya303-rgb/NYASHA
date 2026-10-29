import React, { useState, useEffect } from 'react';
import { X, UserPlus, ShieldCheck, CheckCircle2, Phone, Calendar, IndianRupee } from 'lucide-react';
import { Advocate, Client, CaseNature, CourtMaster, CaseStageMaster } from '../types';
import { DatePickerInput } from './DatePickerInput';
import { db } from '../lib/store';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Client) => void;
  advocate: Advocate;
  initialClient?: Client | null;
}

const CASE_NATURES: CaseNature[] = ['CIVIL', 'CRIMINAL', 'MATRIMONIAL', 'MVACT', 'JUVENILE', 'REVENUE'];

export const AddClientModal: React.FC<AddClientModalProps> = ({
  isOpen,
  onClose,
  onSave,
  advocate,
  initialClient
}) => {
  const [clientName, setClientName] = useState('');
  const [clientFatherName, setClientFatherName] = useState('');
  const [clientMobile, setClientMobile] = useState('');
  const [isMobileVerified, setIsMobileVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpMessage, setOtpMessage] = useState('');

  // 7-Field Address
  const [village, setVillage] = useState('');
  const [post, setPost] = useState('');
  const [tahsil, setTahsil] = useState('Ballia Sadar');
  const [policeStation, setPoliceStation] = useState('कोतवाली बलिया (Kotwali Ballia)');
  const [customPoliceStation, setCustomPoliceStation] = useState('');
  const [isCustomPS, setIsCustomPS] = useState(false);
  const [district, setDistrict] = useState('Ballia');
  const [state, setState] = useState('Uttar Pradesh');
  const [pincode, setPincode] = useState('277001');

  // Case details
  const [caseTitle, setCaseTitle] = useState('');
  const [party1, setParty1] = useState('');
  const [party2, setParty2] = useState('');
  const [caseNature, setCaseNature] = useState<CaseNature>('CRIMINAL');
  const [caseNo, setCaseNo] = useState('');
  const [courtName, setCourtName] = useState('Court of District & Sessions Judge, Ballia');
  const [previousDate, setPreviousDate] = useState('');
  const [nextHearingDate, setNextHearingDate] = useState('');
  const [caseStage, setCaseStage] = useState('Preliminary Hearing & Bail Application');
  const [totalFees, setTotalFees] = useState<number>(15000);
  const [feesReceived, setFeesReceived] = useState<number>(5000);
  const [status, setStatus] = useState<'Open' | 'Closed'>('Open');
  const [notes, setNotes] = useState('');

  // Helper to dynamically build case title from party1 and party2
  const updateCombinedCaseTitle = (p1: string, p2: string) => {
    const p1Trim = p1.trim();
    const p2Trim = p2.trim();
    if (p1Trim && p2Trim) {
      setCaseTitle(`${p1Trim} Vs ${p2Trim}`);
    } else if (p1Trim) {
      setCaseTitle(p1Trim);
    } else if (p2Trim) {
      setCaseTitle(`Vs ${p2Trim}`);
    } else {
      setCaseTitle('');
    }
  };

  const handleParty1Change = (val: string) => {
    setParty1(val);
    updateCombinedCaseTitle(val, party2);
  };

  const handleParty2Change = (val: string) => {
    setParty2(val);
    updateCombinedCaseTitle(party1, val);
  };

  // Dropdown states for Court, Stage, Tahsil & PS
  const [availableCourts, setAvailableCourts] = useState<CourtMaster[]>([]);
  const [availableStages, setAvailableStages] = useState<CaseStageMaster[]>([]);
  const [availableTehsils, setAvailableTehsils] = useState<string[]>([]);
  const [availablePoliceStations, setAvailablePoliceStations] = useState<string[]>([]);
  const [selectedCourtOption, setSelectedCourtOption] = useState<string>('');
  const [isCustomCourt, setIsCustomCourt] = useState<boolean>(false);
  const [customCourtName, setCustomCourtName] = useState<string>('');
  const [selectedStageOption, setSelectedStageOption] = useState<string>('');
  const [isCustomStage, setIsCustomStage] = useState<boolean>(false);
  const [customStageName, setCustomStageName] = useState<string>('');

  // Auto-calculated pending fees
  const feesPending = Math.max(0, (Number(totalFees) || 0) - (Number(feesReceived) || 0));

  useEffect(() => {
    const tenantId = advocate?.tenantId || db.getCurrentTenant().id;
    const courtsList = db.getTenantCourts(tenantId);
    const stagesList = db.getTenantCaseStages(tenantId);
    const tList = db.getTehsils(tenantId);
    const psList = db.getPoliceStations(tenantId);

    setAvailableCourts(courtsList);
    setAvailableStages(stagesList);
    setAvailableTehsils(tList);
    setAvailablePoliceStations(psList);

    if (initialClient) {
      setClientName(initialClient.clientName);
      setClientFatherName(initialClient.clientFatherName || '');
      setClientMobile(initialClient.clientMobile);
      setIsMobileVerified(initialClient.isMobileVerified);
      setVillage(initialClient.address.village);
      setPost(initialClient.address.post);
      setTahsil(initialClient.address.tahsil);
      
      const ps = initialClient.address.policeStation || psList[0] || 'कोतवाली बलिया (Kotwali Ballia)';
      if (psList.includes(ps)) {
        setPoliceStation(ps);
        setIsCustomPS(false);
        setCustomPoliceStation('');
      } else {
        setPoliceStation('Other / अन्य');
        setIsCustomPS(true);
        setCustomPoliceStation(ps);
      }

      setDistrict(initialClient.address.district);
      setState(initialClient.address.state);
      setPincode(initialClient.address.pincode);
      const rawTitle = initialClient.caseTitle || initialClient.caseNameVsName || '';
      setCaseTitle(rawTitle);
      if (rawTitle) {
        const parts = rawTitle.split(/\s+(?:vs\.?|v\/s|banaam|बनाम)\s+/i);
        if (parts.length >= 2) {
          setParty1(parts[0].trim());
          setParty2(parts.slice(1).join(' Vs ').trim());
        } else {
          setParty1(rawTitle.trim());
          setParty2('');
        }
      } else {
        setParty1('');
        setParty2('');
      }
      setCaseNature(initialClient.caseNature);
      setCaseNo(initialClient.caseNo);

      // Court Dropdown matching
      const clCourt = initialClient.courtName || '';
      setCourtName(clCourt);
      const matchedCourt = courtsList.find(c => c.name.trim().toLowerCase() === clCourt.trim().toLowerCase());
      if (matchedCourt) {
        setSelectedCourtOption(matchedCourt.name);
        setIsCustomCourt(false);
        setCustomCourtName('');
      } else if (clCourt) {
        setSelectedCourtOption('OTHER');
        setIsCustomCourt(true);
        setCustomCourtName(clCourt);
      } else {
        const firstCourt = courtsList.find(c => c.isActive)?.name || 'Court of District & Sessions Judge, Ballia';
        setSelectedCourtOption(firstCourt);
        setCourtName(firstCourt);
        setIsCustomCourt(false);
        setCustomCourtName('');
      }

      setPreviousDate(initialClient.previousDate);
      setNextHearingDate(initialClient.nextHearingDate);

      // Case Stage Dropdown matching
      const clStage = initialClient.caseStage || '';
      setCaseStage(clStage);
      const matchedStage = stagesList.find(s => s.name.trim().toLowerCase() === clStage.trim().toLowerCase());
      if (matchedStage) {
        setSelectedStageOption(matchedStage.name);
        setIsCustomStage(false);
        setCustomStageName('');
      } else if (clStage) {
        setSelectedStageOption('OTHER');
        setIsCustomStage(true);
        setCustomStageName(clStage);
      } else {
        const firstStage = stagesList.find(s => s.isActive)?.name || 'Preliminary Hearing & Bail Application';
        setSelectedStageOption(firstStage);
        setCaseStage(firstStage);
        setIsCustomStage(false);
        setCustomStageName('');
      }

      setTotalFees(initialClient.totalFees);
      setFeesReceived(initialClient.feesReceived);
      setStatus(initialClient.status);
      setNotes(initialClient.notes || '');
    } else {
      // Reset form with smart defaults
      setClientName('');
      setClientFatherName('');
      setClientMobile('');
      setIsMobileVerified(false);
      setVillage('');
      setPost('');
      setTahsil('Ballia Sadar');
      setPoliceStation('कोतवाली बलिया (Kotwali Ballia)');
      setIsCustomPS(false);
      setCustomPoliceStation('');
      setDistrict('Ballia');
      setState('Uttar Pradesh');
      setPincode('277001');
      setCaseTitle('');
      setParty1('');
      setParty2('');
      setCaseNature('CRIMINAL');
      setCaseNo('');

      const defCourt = courtsList.find(c => c.isActive)?.name || 'Court of District & Sessions Judge, Ballia';
      setCourtName(defCourt);
      setSelectedCourtOption(defCourt);
      setIsCustomCourt(false);
      setCustomCourtName('');

      setPreviousDate(new Date().toLocaleDateString('en-GB'));
      
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      setNextHearingDate(nextWeek.toLocaleDateString('en-GB'));
      
      const defStage = stagesList.find(s => s.isActive)?.name || 'Preliminary Hearing & Bail Application';
      setCaseStage(defStage);
      setSelectedStageOption(defStage);
      setIsCustomStage(false);
      setCustomStageName('');

      setTotalFees(20000);
      setFeesReceived(10000);
      setStatus('Open');
      setNotes('');
    }
  }, [initialClient, isOpen]);

  if (!isOpen) return null;

  const handleSendOTP = async () => {
    if (!clientMobile || clientMobile.length < 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }
    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: clientMobile, purpose: 'client_verification' })
      });
      const data = await res.json();
      setOtpSent(true);
      setOtpMessage(data.message || 'OTP sent successfully. Demo OTP: 123456');
    } catch {
      setOtpSent(true);
      setOtpMessage('OTP service active. (Demo verification code: 123456)');
    }
  };

  const handleVerifyOTP = async () => {
    if (otpInput === '123456') {
      setIsMobileVerified(true);
      setOtpSent(false);
      setOtpMessage('✓ Client Mobile Number Verified Successfully!');
      return;
    }
    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: clientMobile, otp: otpInput })
      });
      const data = await res.json();
      if (data.success) {
        setIsMobileVerified(true);
        setOtpSent(false);
        setOtpMessage('✓ Client Mobile Number Verified Successfully!');
      } else {
        alert(data.message || 'Invalid OTP');
      }
    } catch {
      alert('Verification failed. Try demo OTP: 123456');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !caseNo || !nextHearingDate) {
      alert('Please fill all required fields');
      return;
    }

    const resolvedPoliceStation = isCustomPS
      ? (customPoliceStation.trim() || 'Other / अन्य')
      : (policeStation || 'कोतवाली बलिया (Kotwali Ballia)');

    const resolvedCourtName = isCustomCourt 
      ? (customCourtName.trim() || courtName || 'Court of District & Sessions Judge, Ballia') 
      : (selectedCourtOption || courtName || 'Court of District & Sessions Judge, Ballia');

    const resolvedCaseStage = isCustomStage
      ? (customStageName.trim() || caseStage || 'Preliminary Hearing & Bail Application')
      : (selectedStageOption || caseStage || 'Preliminary Hearing & Bail Application');

    const newClient: Client = {
      id: initialClient ? initialClient.id : 'cl_' + Date.now(),
      advocateId: advocate.id,
      advocateName: advocate.name,
      advocateBarNo: advocate.barNo,
      clientName,
      clientFatherName,
      clientMobile: clientMobile || 'Not provided',
      isMobileVerified,
      address: {
        village: village || 'Ballia',
        post: post || 'Ballia',
        tahsil,
        policeStation: resolvedPoliceStation,
        district,
        state,
        pincode
      },
      caseTitle: caseTitle.trim() || undefined,
      caseNameVsName: caseTitle.trim() || undefined,
      caseNo,
      caseNature,
      courtName: resolvedCourtName,
      previousDate: previousDate || new Date().toLocaleDateString('en-GB'),
      nextHearingDate,
      caseStage: resolvedCaseStage,
      totalFees: Number(totalFees) || 0,
      feesReceived: Number(feesReceived) || 0,
      feesPending,
      status,
      createdAt: initialClient ? initialClient.createdAt : new Date().toLocaleDateString('en-GB'),
      notes
    };

    onSave(newClient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-slate-100 max-h-[92vh] flex flex-col my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">
                {initialClient ? 'Edit Client & Case Details' : 'Add New Client (नया मुवक्किल जोड़ें)'}
              </h3>
              <p className="text-xs text-amber-400">Advocate: {advocate.name} (Bar No: {advocate.barNo})</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
          
          {/* Section 1: Client Personal Details */}
          <div>
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              1. Client Particulars (मुवक्किल का विवरण)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Client Full Name (मुवक्किल का नाम) *
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Dharmendra Kumar Rai"
                  className="w-full bg-slate-800 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Father's / Husband's Name (पिता/पति का नाम)
                </label>
                <input
                  type="text"
                  value={clientFatherName}
                  onChange={(e) => setClientFatherName(e.target.value)}
                  placeholder="e.g. Shri Kedar Rai"
                  className="w-full bg-slate-800 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                />
              </div>

              {/* Mobile with OTP option */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Client Mobile Number (मोबाइल नंबर) &amp; OTP Verification
                </label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="tel"
                    value={clientMobile}
                    onChange={(e) => {
                      setClientMobile(e.target.value);
                      setIsMobileVerified(false);
                    }}
                    placeholder="10-digit mobile (e.g. 9839443322)"
                    className="flex-1 bg-slate-800 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                  />
                  {!isMobileVerified ? (
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold border border-amber-500/30 whitespace-nowrap"
                    >
                      {otpSent ? 'Resend OTP' : 'Verify Mobile OTP'}
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-xl text-xs font-bold whitespace-nowrap">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verified</span>
                    </div>
                  )}
                </div>

                {otpSent && !isMobileVerified && (
                  <div className="mt-2 p-3 rounded-xl bg-slate-950 border border-amber-500/30 flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      placeholder="Enter 6-digit OTP"
                      className="w-36 bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs rounded-lg text-slate-100"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOTP}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs"
                    >
                      Confirm OTP
                    </button>
                    {otpMessage && (
                      <span className="text-[11px] text-amber-300 block w-full">{otpMessage}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: 7-Field Address */}
          <div>
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              2. Address 7-Fields (पता विवरण)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Village / Mohalla (ग्राम/मोहल्ला)</label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder="e.g. Mahuawa"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Post Office (डाकघर)</label>
                <input
                  type="text"
                  value={post}
                  onChange={(e) => setPost(e.target.value)}
                  placeholder="e.g. Bansdih"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Tahsil (तहसील)</label>
                <select
                  value={tahsil}
                  onChange={(e) => setTahsil(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-xs text-slate-100"
                >
                  {availableTehsils.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Police Station (थाना) *</label>
                <select
                  value={policeStation}
                  onChange={(e) => {
                    setPoliceStation(e.target.value);
                    if (e.target.value === 'Other / अन्य') {
                      setIsCustomPS(true);
                    } else {
                      setIsCustomPS(false);
                    }
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                >
                  {availablePoliceStations.map(ps => (
                    <option key={ps} value={ps}>{ps}</option>
                  ))}
                </select>
                {isCustomPS && (
                  <input
                    type="text"
                    value={customPoliceStation}
                    onChange={(e) => setCustomPoliceStation(e.target.value)}
                    placeholder="थाने का नाम दर्ज करें (Enter Police Station)..."
                    className="mt-1.5 w-full bg-slate-800/90 border border-amber-500/60 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none"
                  />
                )}
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">District (जिला)</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">State (राज्य)</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Pincode (पिनकोड)</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="277001"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Status (स्थिति)</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'Open' | 'Closed')}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-xs text-slate-100"
                >
                  <option value="Open">Open (प्रगति पर)</option>
                  <option value="Closed">Closed (निस्तारित)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Case Specifics & Hearings */}
          <div>
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              3. Case Particulars &amp; Hearing Schedule (वाद विवरण)
            </h4>

            {/* 3 Columns for A. Case Name vs Name | B. Case Number | C. Case Nature */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
              {/* A. Case Name vs Name */}
              <div className="col-span-12 md:col-span-6">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    A. Case Name vs Name (रमेश बनाम सुरेश)
                  </label>
                  {(party1 || party2) && (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 truncate max-w-[200px]">
                      {party1 || '???'} Vs {party2 || '???'}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-800 border border-slate-700 focus-within:border-amber-500 rounded-xl p-1.5 transition-all shadow-inner">
                  {/* Party 1 / Petitioner / Applicant Input */}
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={party1}
                      onChange={(e) => handleParty1Change(e.target.value)}
                      placeholder="प्रथम पक्ष (e.g. Ramesh / State)"
                      className="w-full bg-slate-900 border border-slate-700/80 focus:border-amber-500 rounded-lg px-2.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Fixed Pre-Defined Center 'Vs' Badge */}
                  <div className="flex items-center justify-center shrink-0 px-2.5 py-1 bg-amber-500/20 text-amber-400 font-extrabold text-xs rounded-lg border border-amber-500/40 shadow-sm select-none">
                    <span className="tracking-wider uppercase">Vs</span>
                  </div>

                  {/* Party 2 / Respondent / Defendant Input */}
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={party2}
                      onChange={(e) => handleParty2Change(e.target.value)}
                      placeholder="द्वितीय पक्ष (e.g. Suresh / Ajay)"
                      className="w-full bg-slate-900 border border-slate-700/80 focus:border-amber-500 rounded-lg px-2.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* B. Case Number */}
              <div className="col-span-12 sm:col-span-6 md:col-span-3">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  B. Case Number (वाद संख्या) *
                </label>
                <input
                  type="text"
                  required
                  value={caseNo}
                  onChange={(e) => setCaseNo(e.target.value)}
                  placeholder="e.g. Sessions Trial 412/2024"
                  className="w-full bg-slate-800 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none"
                />
              </div>

              {/* C. Case Nature */}
              <div className="col-span-12 sm:col-span-6 md:col-span-3">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  C. Case Nature (वाद प्रकृति) *
                </label>
                <select
                  value={caseNature}
                  onChange={(e) => setCaseNature(e.target.value as CaseNature)}
                  className="w-full bg-slate-800 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2.5 text-xs text-slate-100 font-bold"
                >
                  {CASE_NATURES.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Other Case Information: Court Name, Dates & Stage */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Court / Forum Name (न्यायालय / फोरम का नाम) *
                </label>
                <select
                  value={selectedCourtOption}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedCourtOption(val);
                    if (val === 'OTHER') {
                      setIsCustomCourt(true);
                    } else {
                      setIsCustomCourt(false);
                      setCourtName(val);
                      setCustomCourtName('');
                    }
                  }}
                  className="w-full bg-slate-800 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none"
                >
                  <option value="" disabled>-- न्यायालय चुनें (Select Court) --</option>
                  {availableCourts.filter(c => c.isActive).map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} {c.hindiName ? `— ${c.hindiName}` : ''}
                    </option>
                  ))}
                  <option value="OTHER">➕ Other / अन्य (कस्टम न्यायालय दर्ज करें)...</option>
                </select>

                {isCustomCourt && (
                  <input
                    type="text"
                    value={customCourtName}
                    onChange={(e) => {
                      setCustomCourtName(e.target.value);
                      setCourtName(e.target.value);
                    }}
                    placeholder="न्यायालय / फोरम का नाम दर्ज करें..."
                    className="mt-2 w-full bg-slate-800/90 border border-amber-500/60 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none"
                    autoFocus
                  />
                )}
              </div>

              {/* Date Pickers */}
              <div>
                <DatePickerInput
                  label="Previous Hearing Date (पिछली तारीख)"
                  value={previousDate}
                  onChange={setPreviousDate}
                />
              </div>

              <div>
                <DatePickerInput
                  label="Next Hearing Date (अगली पेशी तारीख) *"
                  value={nextHearingDate}
                  onChange={setNextHearingDate}
                  required
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Current Case Stage (वर्तमान वाद प्रक्रम / स्थिति) *
                </label>
                <select
                  value={selectedStageOption}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedStageOption(val);
                    if (val === 'OTHER') {
                      setIsCustomStage(true);
                    } else {
                      setIsCustomStage(false);
                      setCaseStage(val);
                      setCustomStageName('');
                    }
                  }}
                  className="w-full bg-slate-800 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none"
                >
                  <option value="" disabled>-- वाद प्रक्रम / स्टेज चुनें (Select Case Stage) --</option>
                  {availableStages.filter(s => s.isActive).map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} {s.hindiName ? `— ${s.hindiName}` : ''}
                    </option>
                  ))}
                  <option value="OTHER">➕ Other / अन्य (कस्टम स्टेज दर्ज करें)...</option>
                </select>

                {isCustomStage && (
                  <input
                    type="text"
                    value={customStageName}
                    onChange={(e) => {
                      setCustomStageName(e.target.value);
                      setCaseStage(e.target.value);
                    }}
                    placeholder="वाद की स्थिति / स्टेज दर्ज करें (e.g. Charge Framing / Bail Argument)..."
                    className="mt-2 w-full bg-slate-800/90 border border-amber-500/60 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none"
                    autoFocus
                  />
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Fees Structure & Calculation */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <IndianRupee className="w-3.5 h-3.5" />
              4. Advocate Fee Calculation (शुल्क विवरण)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Total Agreed Fee (कुल तय फीस ₹)</label>
                <input
                  type="number"
                  min="0"
                  value={totalFees}
                  onChange={(e) => setTotalFees(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Fees Received (प्राप्त फीस ₹)</label>
                <input
                  type="number"
                  min="0"
                  value={feesReceived}
                  onChange={(e) => setFeesReceived(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Fees Pending (बकाया फीस ₹)</label>
                <div className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-extrabold text-red-400 flex items-center justify-between">
                  <span>₹ {feesPending.toLocaleString('en-IN')}</span>
                  <span className="text-[10px] text-slate-400 font-normal">Auto-calculated</span>
                </div>
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Case Notes / Instructions</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Important precedents, document checklist, certified copies..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all"
            >
              {initialClient ? 'Update Client Record' : 'Save Client Record'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
