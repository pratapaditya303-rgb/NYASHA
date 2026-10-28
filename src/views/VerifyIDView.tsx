import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, QrCode, CheckCircle2, AlertTriangle, Download, Calendar, MapPin, UserCheck } from 'lucide-react';
import { Advocate } from '../types';
import { db } from '../lib/store';
import { generateAdvocateIDCardPDF } from '../lib/pdfGenerator';
import { AdvocateIDCard } from '../components/AdvocateIDCard';

export const VerifyIDView: React.FC<{ initialBarNo?: string }> = ({ initialBarNo }) => {
  const [barNo, setBarNo] = useState(initialBarNo || '');
  const [searched, setSearched] = useState(false);
  const [advocate, setAdvocate] = useState<Advocate | null>(null);

  useEffect(() => {
    if (initialBarNo) {
      handleSearch(initialBarNo);
    }
  }, [initialBarNo]);

  const handleSearch = (query?: string) => {
    const q = (query || barNo).trim().toUpperCase();
    if (!q) return;

    setSearched(true);
    const found = db.getAdvocateByBarNo(q);
    setAdvocate(found || null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto mb-3">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
          Bar Membership &amp; Digital QR ID Verification
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Official statutory registry of Criminal &amp; Revenue Bar Association, District Court Ballia (U.P.)
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
        <label className="block text-xs font-semibold text-slate-300">
          Enter Bar Council Registration Number (बार काउंसिल पंजीकरण संख्या दर्ज करें):
        </label>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={barNo}
              onChange={(e) => setBarNo(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="e.g. UP/4321/2005 or UP/8902/2012"
              className="w-full bg-slate-800 border border-slate-700 focus:border-amber-500 text-xs sm:text-sm text-slate-100 rounded-xl pl-10 pr-4 py-3 placeholder-slate-500 focus:outline-none uppercase font-mono"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          </div>

          <button
            onClick={() => handleSearch()}
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verify Member</span>
          </button>
        </div>

        {/* Quick Demo chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] text-slate-400">
          <span>Quick verify demo:</span>
          {['UP/4321/2005', 'UP/8902/2012', 'UP/1245/1998'].map((sample) => (
            <button
              key={sample}
              onClick={() => {
                setBarNo(sample);
                handleSearch(sample);
              }}
              className="bg-slate-800 hover:bg-slate-700 text-amber-300 px-2 py-0.5 rounded border border-slate-700"
            >
              {sample}
            </button>
          ))}
        </div>
      </div>

      {/* Results Box */}
      {searched && (
        <div>
          {advocate ? (
            <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
              
              {/* Header Certificate Banner */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                      OFFICIALLY VERIFIED &amp; ACTIVE MEMBER
                    </span>
                    <h3 className="font-bold text-lg text-slate-100 mt-1">
                      {(advocate.name || '').toUpperCase()}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => generateAdvocateIDCardPDF(advocate)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Verified ID Card</span>
                </button>
              </div>

              {/* Official Digital Bar ID Card Display */}
              <div className="py-2 flex flex-col items-center justify-center border-b border-slate-800 pb-6">
                <p className="text-xs font-semibold text-amber-400 mb-3 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Official Digital Bar ID Card with Live QR Verification &amp; Bar Seal
                </p>
                <AdvocateIDCard advocate={advocate} />
              </div>

              {/* Verified Advocate Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Photo & Bar Badge */}
                <div className="flex flex-col items-center justify-center p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-center">
                  <img
                    src={advocate.photoUrl}
                    alt={advocate.name}
                    className="w-24 h-24 rounded-2xl object-cover border-2 border-amber-500/40 shadow-lg"
                  />
                  <div>
                    <p className="font-bold text-xs text-amber-400 font-mono">{advocate.barNo}</p>
                    <p className="text-[10px] text-slate-400">COP: {advocate.copNo}</p>
                  </div>
                </div>

                {/* Info Fields */}
                <div className="md:col-span-2 space-y-2.5 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                      <span className="text-slate-500 text-[10px] block">Father's Name:</span>
                      <span className="font-semibold text-slate-200">{advocate.fatherName}</span>
                    </div>

                    <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                      <span className="text-slate-500 text-[10px] block">Date of Birth &amp; Age:</span>
                      <span className="font-semibold text-slate-200">{advocate.dob} ({advocate.age || 42} Yrs)</span>
                    </div>

                    <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                      <span className="text-slate-500 text-[10px] block">Contact Mobile:</span>
                      <span className="font-semibold text-slate-200">+91 {advocate.mobile}</span>
                    </div>

                    <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                      <span className="text-slate-500 text-[10px] block">Valid Till:</span>
                      <span className="font-bold text-amber-400">{advocate.validTill || '31/12/2026'}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">7-Field Registered Address:</span>
                    <span className="font-medium text-slate-300">
                      {advocate.address.village}, Post {advocate.address.post}, P.S. {advocate.address.policeStation}, Tahsil {advocate.address.tahsil}, Dist: {advocate.address.district} ({advocate.address.pincode})
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Specialization Areas:</span>
                      <span className="font-bold text-slate-200">{advocate.specialization.join(', ')}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Chamber:</span>
                      <span className="font-bold text-amber-300">{advocate.chamberNo || 'Ballia Court'}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Administrative Footer Note */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 text-center">
                This verification is certified by the Secretary &amp; President, Criminal &amp; Revenue Bar Association, Ballia.
              </div>

            </div>
          ) : (
            <div className="p-8 bg-slate-900 border border-red-500/30 rounded-2xl text-center space-y-3">
              <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
              <h3 className="font-bold text-base text-slate-100">No Record Found for "{barNo}"</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                The entered Bar registration number is not found in the verified database. Please check the spelling or contact the Bar Association Secretariat at <strong>9415988800</strong>.
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
