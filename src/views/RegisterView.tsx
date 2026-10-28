import React, { useState, useMemo } from 'react';
import { UserPlus, ShieldCheck, Upload, CheckCircle2, AlertCircle, ArrowRight, Scale, Info } from 'lucide-react';
import { Advocate, SpecializationType, ALL_UP_DISTRICTS } from '../types';
import { db } from '../lib/store';
import { DatePickerInput } from '../components/DatePickerInput';

interface RegisterViewProps {
  onNavigate: (route: string) => void;
  onRegistered: (adv: Advocate) => void;
}

const SPECIALIZATION_OPTIONS: SpecializationType[] = [
  'CRIMINAL',
  'REVENUE',
  'CIVIL',
  'MATRIMONIAL',
  'MVACT'
];

export const RegisterView: React.FC<RegisterViewProps> = ({ onNavigate, onRegistered }) => {
  // Personal Details
  const [name, setName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [dob, setDob] = useState('15/08/1988');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');

  const currentTenant = db.getCurrentTenant();
  const allTenants = db.getTenants();
  const tehsils = db.getTehsils(currentTenant.id);
  const policeStations = db.getPoliceStations(currentTenant.id);

  // Construct Bar Association options for selection across UP's 75 districts
  const barAssociationOptions = useMemo(() => {
    const list: { name: string; district: string; tenantId?: string }[] = [];
    
    // 1. Existing registered tenants
    allTenants.forEach(t => {
      list.push({
        name: t.name,
        district: t.district || 'Ballia',
        tenantId: t.id
      });
    });

    // 2. Add UP 75 District Bar Associations if not already present
    ALL_UP_DISTRICTS.forEach(distStr => {
      const pureDist = distStr.split('(')[0].trim();
      const defaultBarName = `District Bar Association, ${pureDist}`;
      const exists = list.some(l => l.name.toLowerCase().includes(pureDist.toLowerCase()) || l.district.toLowerCase() === pureDist.toLowerCase());
      if (!exists) {
        list.push({
          name: defaultBarName,
          district: pureDist,
          tenantId: `tenant_dist_${pureDist.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
        });
      }
    });

    return list;
  }, [allTenants]);

  const [selectedBarName, setSelectedBarName] = useState<string>(
    currentTenant?.name || 'Criminal & Revenue Bar Association, Ballia'
  );

  // 7-Field Address
  const [village, setVillage] = useState('');
  const [post, setPost] = useState('');
  const [tahsil, setTahsil] = useState(tehsils[0] || 'Ballia Sadar');
  const [policeStation, setPoliceStation] = useState(policeStations[0] || 'कोतवाली बलिया (Kotwali Ballia)');
  const [customPoliceStation, setCustomPoliceStation] = useState('');
  const [isCustomPS, setIsCustomPS] = useState(false);
  const [district, setDistrict] = useState('Ballia');
  const [state, setState] = useState('Uttar Pradesh');
  const [pincode, setPincode] = useState('277001');

  // Professional details
  const [barNo, setBarNo] = useState('');
  const [copNo, setCopNo] = useState('');
  const [chamberNo, setChamberNo] = useState('');
  const [specializations, setSpecializations] = useState<SpecializationType[]>(['CRIMINAL', 'REVENUE']);

  // Document Uploads (Simulated base64)
  const [photoUrl, setPhotoUrl] = useState<string>('https://images.unsplash.com/photo-1556157382-97eda2d62296?w=300&h=300&fit=crop');
  const [certificateName, setCertificateName] = useState<string>('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Live Age Calculator: CurrentYear - DOBYear
  const calculateAge = (dobString: string): number => {
    if (!dobString || !dobString.includes('/')) return 35;
    const parts = dobString.split('/');
    if (parts.length === 3) {
      const birthYear = parseInt(parts[2], 10);
      const currentYear = new Date().getFullYear();
      if (!isNaN(birthYear) && birthYear > 1920 && birthYear <= currentYear) {
        return currentYear - birthYear;
      }
    }
    return 35;
  };

  const currentAge = calculateAge(dob);

  const toggleSpecialization = (spec: SpecializationType) => {
    if (specializations.includes(spec)) {
      if (specializations.length > 1) {
        setSpecializations(specializations.filter(s => s !== spec));
      }
    } else {
      setSpecializations([...specializations, spec]);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvt) => {
        const rawResult = uploadEvt.target?.result as string;
        if (!rawResult) return;
        // Compress using off-screen canvas to ensure fast multi-device sync
        const img = new Image();
        img.onload = () => {
          const maxDim = 320;
          let { width, height } = img;
          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            setPhotoUrl(canvas.toDataURL('image/jpeg', 0.82));
          } else {
            setPhotoUrl(rawResult);
          }
        };
        img.src = rawResult;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCertificateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCertificateName(file.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validate Bar Council No format (Regex validation UP/XXXXX/YYYY or UPXXXXX/YYYY)
    const barRegex = /^UP(\/|\d|\s)\d{1,6}\/\d{4}$/i;
    const cleanBar = barNo.trim().toUpperCase();
    if (!cleanBar.startsWith('UP')) {
      setErrorMessage('Bar Council Enrollment Number must begin with UP (e.g. UP/4321/2005)');
      return;
    }

    if (!cleanBar.includes('/')) {
      setErrorMessage('Please include slash year format in Bar No (e.g. UP/4321/2005)');
      return;
    }

    if (mobile.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number');
      return;
    }

    const resolvedPoliceStation = isCustomPS
      ? (customPoliceStation.trim() || 'Other / अन्य')
      : (policeStation || 'कोतवाली बलिया (Kotwali Ballia)');

    const selectedBarObj = barAssociationOptions.find(b => b.name === selectedBarName) || {
      name: selectedBarName,
      district: currentTenant?.district || district || 'Ballia',
      tenantId: currentTenant?.id || 'tenant_ballia_01'
    };

    const newAdvocate: Advocate = {
      id: 'adv_' + Date.now(),
      name,
      fatherName,
      dob,
      age: currentAge,
      email,
      mobile,
      password: password || 'barballia123',
      role: 'advocate',
      status: 'PENDING_APPROVAL', // Module 1: status PENDING_APPROVAL
      tenantId: selectedBarObj.tenantId || currentTenant?.id || 'tenant_ballia_01',
      affiliatedBar: selectedBarObj.name,
      barNo: cleanBar,
      copNo: copNo || `COP/UP/${Date.now().toString().slice(-5)}`,
      chamberNo: chamberNo || 'District Court Bar Hall',
      specialization: specializations,
      address: {
        village: village || 'Ballia',
        post: post || 'Ballia',
        tahsil,
        policeStation: resolvedPoliceStation,
        district: selectedBarObj.district || district || 'Ballia',
        state: currentTenant?.state || state || 'Uttar Pradesh',
        pincode
      },
      photoUrl,
      validTill: '31/12/2026',
      rating: 5.0,
      reviewsCount: 0,
      reviews: [],
      createdAt: new Date().toLocaleDateString('en-GB')
    };

    db.addAdvocate(newAdvocate);
    await db.syncWithServer(true).catch(() => {});
    window.dispatchEvent(new CustomEvent('crba_state_updated', { detail: { key: '_sys_vault_v2_advocates' } }));
    setIsSuccess(true);
    onRegistered(newAdvocate);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto mb-2">
          <UserPlus className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
          Advocate Membership Registration (अधिवक्ता पंजीकरण)
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Criminal &amp; Revenue Bar Association, District Court Campus, Ballia (U.P.)
        </p>
      </div>

      {!isSuccess ? (
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8">
          
          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Personal Details & Age Calculation */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              1. Personal Particulars &amp; Date of Birth (व्यक्तिगत विवरण)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Advocate Full Name (पूरा नाम) *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Adv. Rajesh Kumar Singh"
                  className="w-full bg-slate-800 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Father's Name (पिता का नाम) *
                </label>
                <input
                  type="text"
                  required
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  placeholder="e.g. Shri Ram Narain Singh"
                  className="w-full bg-slate-800 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                />
              </div>

              {/* DOB Picker & Live Age calculation */}
              <div>
                <DatePickerInput
                  label="Date of Birth (जन्म तिथि - DD/MM/YYYY) *"
                  value={dob}
                  onChange={setDob}
                  required
                  minYear={1940}
                  maxYear={2005}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Live Calculated Age (वर्तमान आयु)
                </label>
                <div className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-amber-300 flex items-center justify-between">
                  <span>{currentAge} Years Old</span>
                  <span className="text-[10px] text-slate-500 font-normal">(CurrentYear - DOBYear)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Mobile Number (10-Digit Mobile) *
                </label>
                <input
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="9839XXXXXX"
                  className="w-full bg-slate-800 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="advocate@barballia.com"
                  className="w-full bg-slate-800 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: 7-Field Address */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              2. Permanent Residential Address (7-Fields Address)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Village / Mohalla *</label>
                <input
                  type="text"
                  required
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder="e.g. Bahadurpur"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Post Office *</label>
                <input
                  type="text"
                  required
                  value={post}
                  onChange={(e) => setPost(e.target.value)}
                  placeholder="e.g. Ballia Head Post"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Tahsil *</label>
                <select
                  value={tahsil}
                  onChange={(e) => setTahsil(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-xs text-slate-100 font-bold"
                >
                  {tehsils.map((t) => (
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
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                >
                  {policeStations.map(ps => (
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
                <label className="block text-[11px] font-medium text-slate-300 mb-1">District *</label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">State *</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Pincode *</label>
                <input
                  type="text"
                  required
                  pattern="[0-9]{6}"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="277001"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Chamber / Seat No.</label>
                <input
                  type="text"
                  value={chamberNo}
                  onChange={(e) => setChamberNo(e.target.value)}
                  placeholder="e.g. Chamber 42, Bar Block"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Bar Council Registration & Specialization */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              3. Bar Council Enrollment &amp; District Bar Association (पंजीकरण व सम्बद्ध बार एसोसिएशन)
            </h3>

            {/* Enrolled District Bar Association Selection */}
            <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl space-y-2">
              <label className="block text-xs font-extrabold text-amber-300 flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Affiliated District Bar Association (जिले की सम्बद्ध बार एसोसिएशन) *</span>
              </label>
              <select
                value={selectedBarName}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedBarName(val);
                  const match = barAssociationOptions.find(b => b.name === val);
                  if (match) {
                    setDistrict(match.district);
                  }
                }}
                className="w-full bg-slate-800 border border-amber-500/60 text-amber-300 font-bold focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none shadow-inner"
              >
                {barAssociationOptions.map((opt) => (
                  <option key={opt.name} value={opt.name}>
                    {opt.name} — [जिला: {opt.district}]
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-amber-200/80 flex items-center gap-1.5 pt-1">
                <Info className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>अधिवक्ता जिस जिला बार में नामांकित हैं, उसका चयन करें। पंजीकरण का डाटा सीधे संबंधित जिला बार और राज्य बार पोर्टल पर सिंक होगा।</span>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Bar Council Enrollment No. (UP/XXXXX/YYYY) *
                </label>
                <input
                  type="text"
                  required
                  value={barNo}
                  onChange={(e) => setBarNo(e.target.value)}
                  placeholder="e.g. UP/5512/2014"
                  className="w-full bg-slate-800 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none uppercase font-mono"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">As registered with Bar Council of Uttar Pradesh</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Certificate of Practice (COP) No.
                </label>
                <input
                  type="text"
                  value={copNo}
                  onChange={(e) => setCopNo(e.target.value)}
                  placeholder="e.g. COP/UP/2016/7821"
                  className="w-full bg-slate-800 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none uppercase font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Specialization Practice Areas (विशेषज्ञता क्षेत्र) *
                </label>
                <div className="flex flex-wrap gap-2">
                  {SPECIALIZATION_OPTIONS.map((spec) => {
                    const isSelected = specializations.includes(spec);
                    return (
                      <button
                        type="button"
                        key={spec}
                        onClick={() => toggleSpecialization(spec)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '} {spec}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Portal Password (पासवर्ड बनाएं) *
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create secure password for your advocate login"
                  className="w-full bg-slate-800 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Document & Photo Upload */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              4. Photo &amp; Bar Certificate Upload (दस्तावेज़ अपलोड)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-4">
                <img
                  src={photoUrl}
                  alt="Advocate Preview"
                  className="w-14 h-14 rounded-xl object-cover border border-amber-500/40 flex-shrink-0"
                />
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-200 mb-1">Passport Size Photo *</label>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold cursor-pointer border border-slate-700">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-slate-800 text-amber-400 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-200 mb-1">Bar Enrollment Certificate *</label>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold cursor-pointer border border-slate-700">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{certificateName || 'Upload PDF / Image'}</span>
                    <input type="file" accept=".pdf,image/*" onChange={handleCertificateUpload} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-400">
              Already registered with Ballia Bar?{' '}
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="text-amber-400 hover:underline font-bold"
              >
                Sign In here
              </button>
            </p>

            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Submit Registration (पंजीकरण जमा करें)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>
      ) : (
        /* Success Screen */
        <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-8 text-center space-y-4 max-w-xl mx-auto shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h3 className="text-xl font-bold text-slate-100">
            Registration Submitted Successfully! (पंजीकरण सफलतापूर्वक दर्ज)
          </h3>

          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-300 flex items-start gap-2.5 text-left">
            <span className="text-base flex-shrink-0">⏳</span>
            <div>
              <p className="font-bold">स्थिति: बार एडमिन सत्यापन हेतु लंबित (PENDING_APPROVAL)</p>
              <p className="text-[11px] text-slate-300 mt-0.5">
                सुरक्षा एवं बार नियमों के अनुसार, बार एसोसिएशन एडमिन द्वारा आपके प्रमाण पत्र एवं बार पंजीकरण का सत्यापन व अनुमोदन (Approve) किए जाने के बाद ही आप लॉगिन कर पाएंगे।
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-amber-300 font-mono text-left space-y-1">
            <p>Advocate: {name}</p>
            <p>Affiliated Bar: {selectedBarName}</p>
            <p>Bar Council No: {barNo}</p>
            <p>Tahsil / District: {tahsil} ({district})</p>
            <p className="text-amber-400 font-bold">Status: ⏳ PENDING_APPROVAL (Admin Approval Required)</p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onNavigate('home')}
              className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow"
            >
              Back to Home (मुख्य पृष्ठ)
            </button>
            <button
              onClick={() => onNavigate('login')}
              className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700"
            >
              Check Login Status (लॉगिन स्थिति देखें)
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
