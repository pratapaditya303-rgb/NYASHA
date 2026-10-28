import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, RefreshCw, ShieldCheck, CheckCircle2, Phone, MapPin, Building, Calendar, Share2, Check } from 'lucide-react';
import { Advocate } from '../types';
import { AdvocateLogo } from './AdvocateLogo';
import { generateAdvocateIDCardPDF } from '../lib/pdfGenerator';

interface AdvocateIDCardProps {
  advocate: Advocate;
  onNavigate?: (route: string, param?: string) => void;
  showActions?: boolean;
}

export const AdvocateIDCard: React.FC<AdvocateIDCardProps> = ({
  advocate,
  onNavigate,
  showActions = true
}) => {
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://barballia.com';
  const verificationUrl = `${origin}/#verify/${encodeURIComponent((advocate.barNo || '').replace(/\//g, '_'))}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await generateAdvocateIDCardPDF(advocate);
    } catch (err) {
      console.error('Failed to generate ID card PDF', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* CARD CONTAINER (Standard CR80 ID Card Proportions: 85.6mm x 54mm ~ 1.58 ratio) */}
      <div className="relative w-full max-w-[440px] aspect-[85.6/54] rounded-2xl overflow-hidden shadow-2xl border border-amber-500/40 bg-slate-900 text-slate-100 flex flex-col justify-between transition-all duration-300 hover:shadow-amber-500/20 hover:border-amber-500/60 select-none">
        
        {!isFlipped ? (
          /* ================= FRONT SIDE ================= */
          <div className="h-full flex flex-col justify-between bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
            
            {/* Header with Navy & Gold Accent & Advocate Logo */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-3 py-2 border-b border-amber-500/50 flex items-center justify-between gap-2 relative">
              <div className="flex items-center gap-2">
                {/* Official Advocate Bands Logo */}
                <div className="p-0.5 rounded-full bg-slate-900 border border-amber-400/60 shadow flex-shrink-0">
                  <AdvocateLogo className="w-8 h-8 sm:w-9 sm:h-9" />
                </div>

                <div className="leading-tight">
                  <p className="font-extrabold text-[10px] sm:text-[11.5px] text-amber-300 tracking-wide uppercase">
                    {advocate.affiliatedBar || 'CRIMINAL & REVENUE BAR ASSOCIATION'}
                  </p>
                  <p className="text-[8px] sm:text-[8.5px] text-slate-200 font-medium uppercase">
                    DISTRICT COURT CAMPUS, {advocate.address?.district || 'BALLIA'} (U.P.)
                  </p>
                  <p className="text-[6.5px] sm:text-[7.5px] text-amber-400/80 font-semibold tracking-wider uppercase">
                    AFFILIATED TO BAR COUNCIL OF UTTAR PRADESH
                  </p>
                </div>
              </div>

              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[7.5px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                  BAR VERIFIED
                </span>
                <span className="text-[7px] text-slate-400 font-mono mt-0.5">COP CERTIFIED</span>
              </div>
            </div>

            {/* Gold Divider Ribbon */}
            <div className="h-0.5 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 w-full" />

            {/* Card Body Grid */}
            <div className="flex-1 px-3 py-2 flex items-center justify-between gap-2.5">
              
              {/* Photo & Bar No Left Column */}
              <div className="flex flex-col items-center flex-shrink-0 text-center">
                <div className="relative">
                  <img
                    src={advocate.photoUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=200&auto=format&fit=crop&q=80'}
                    alt={advocate.name}
                    className="w-16 h-20 sm:w-18 sm:h-22 object-cover rounded-xl border-2 border-amber-400/70 shadow-md bg-slate-800"
                    onError={(e) => {
                      // Fallback if image fails
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 font-black text-[6.5px] px-1 py-0.2 rounded-full uppercase shadow">
                    ADVOCATE
                  </div>
                </div>
                <p className="font-mono font-bold text-[8.5px] text-amber-400 mt-1.5 leading-none">
                  {advocate.barNo}
                </p>
                <p className="text-[7px] text-slate-400 font-mono mt-0.5">
                  COP: {advocate.copNo || 'VERIFIED'}
                </p>
              </div>

              {/* Middle Bio Details */}
              <div className="flex-1 min-w-0 flex flex-col justify-center space-y-0.5 text-slate-200 text-[8.5px] sm:text-[9.5px]">
                <div className="border-b border-slate-800 pb-0.5">
                  <h3 className="font-black text-xs sm:text-sm text-slate-100 uppercase tracking-tight truncate">
                    ADV. {advocate.name}
                  </h3>
                  <p className="text-[7.5px] text-slate-400">
                    S/o: <span className="font-medium text-slate-200">{advocate.fatherName || 'Late Kedar Rai'}</span>
                  </p>
                </div>

                <div className="space-y-0.5 pt-0.5 text-[8px] sm:text-[8.5px]">
                  <p className="truncate">
                    <span className="text-slate-400">DOB / Age:</span>{' '}
                    <span className="font-semibold text-slate-200">{advocate.dob || '15/07/1982'}</span>{' '}
                    <span className="text-slate-400">({advocate.age || 42} Yrs)</span>
                  </p>
                  <p className="truncate">
                    <span className="text-slate-400">Mobile:</span>{' '}
                    <span className="font-bold text-slate-100">+91 {advocate.mobile}</span>
                  </p>
                  <p className="truncate">
                    <span className="text-slate-400">Chamber:</span>{' '}
                    <span className="font-semibold text-amber-300">{advocate.chamberNo || 'Bar Hall, Ballia'}</span>
                  </p>
                  <p className="truncate text-slate-300">
                    <span className="text-slate-400">Address:</span>{' '}
                    {advocate.address?.village || 'Bahadurpur'}, Tahsil {advocate.address?.tahsil || 'Ballia Sadar'}, Dist: Ballia
                  </p>
                  <p className="text-[7.5px] text-emerald-400 font-medium truncate">
                    Practice: {advocate.specialization?.join(', ') || 'Civil, Criminal & Revenue'}
                  </p>
                </div>
              </div>

              {/* Right Column: Real Scannable QR Code */}
              <div className="flex flex-col items-center flex-shrink-0 text-center pl-1 border-l border-slate-800/80">
                <div className="bg-white p-1 rounded-xl shadow-md border border-amber-400/50 flex flex-col items-center">
                  <QRCodeSVG
                    value={verificationUrl}
                    size={64}
                    level="M"
                    includeMargin={false}
                    className="rounded"
                  />
                </div>
                <div className="mt-1 flex items-center gap-0.5 text-[7px] font-bold text-slate-300 bg-slate-800/80 px-1 py-0.5 rounded border border-slate-700">
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                  <span>SCAN TO VERIFY</span>
                </div>
              </div>

            </div>

            {/* Footer Strip with Validity & Signatures */}
            <div className="bg-slate-950 px-3 py-1 border-t border-amber-500/30 flex items-center justify-between text-[7px] sm:text-[8px]">
              <div className="flex items-center gap-1 text-amber-400 font-bold">
                <span>VALID TILL:</span>
                <span className="bg-amber-500/15 border border-amber-500/40 px-1 py-0.2 rounded text-amber-300">
                  {advocate.validTill || '31/12/2026'}
                </span>
              </div>

              <div className="flex items-center gap-3 font-semibold text-slate-300">
                <div className="text-center">
                  <div className="font-cursive text-[8px] text-amber-400/80 italic font-bold">D. K. Rai</div>
                  <span className="text-[6.5px] text-slate-400 uppercase">Gen. Secretary</span>
                </div>
                <div className="text-center">
                  <div className="font-cursive text-[8px] text-amber-400/80 italic font-bold">V. P. Singh</div>
                  <span className="text-[6.5px] text-slate-400 uppercase">President</span>
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* ================= BACK SIDE ================= */
          <div className="h-full flex flex-col justify-between bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-3">
            
            {/* Back Header */}
            <div className="flex items-center justify-between pb-1.5 border-b border-amber-500/40">
              <div className="flex items-center gap-2">
                <AdvocateLogo className="w-6 h-6" />
                <h4 className="font-bold text-[10px] text-amber-300 tracking-wide uppercase">
                  Important Terms &amp; Bar Rules (नियम व शर्तें)
                </h4>
              </div>
              <span className="text-[7.5px] text-slate-400 font-mono">CR80-SEC-BALLIA</span>
            </div>

            {/* Rule List */}
            <div className="space-y-1 text-[7.5px] sm:text-[8px] text-slate-300 py-1 leading-tight">
              <p className="flex items-start gap-1">
                <span className="text-amber-400 font-bold">1.</span>
                <span>This card is the official proof of active membership of the Criminal &amp; Revenue Bar Association, District Court, Ballia.</span>
              </p>
              <p className="flex items-start gap-1">
                <span className="text-amber-400 font-bold">2.</span>
                <span>Entitles the advocate to represent clients across all District Courts, SDM Revenue Courts, and Police Stations of Ballia.</span>
              </p>
              <p className="flex items-start gap-1">
                <span className="text-amber-400 font-bold">3.</span>
                <span>Loss of this card must be immediately reported to the Bar Office and local Police Station.</span>
              </p>
              <p className="flex items-start gap-1">
                <span className="text-amber-400 font-bold">4.</span>
                <span>Any court official or police officer can instantly verify credentials by scanning the front QR code or visiting: <strong className="text-amber-300">barballia.com/verify</strong></span>
              </p>
              <p className="flex items-start gap-1">
                <span className="text-amber-400 font-bold">5.</span>
                <span>Chamber Allotment: <strong className="text-slate-100">{advocate.chamberNo || 'District Court Bar Hall, Ballia'}</strong></span>
              </p>
            </div>

            {/* Emergency & Bar Secretariat Footer */}
            <div className="bg-slate-950/90 rounded-xl p-1.5 border border-slate-800 flex items-center justify-between text-[7px] sm:text-[7.5px]">
              <div className="space-y-0.5">
                <p className="font-bold text-slate-200">Bar Association Secretariat, Civil Court Campus, Ballia (U.P.)</p>
                <p className="text-slate-400">Emergency Helpline: <span className="text-amber-300 font-bold">+91 9415988800</span> • Web: sahayogifoundation.in</p>
              </div>
              <div className="flex-shrink-0">
                <span className="text-[6.5px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  ENCRYPTED DIGITAL ID
                </span>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* ACTION CONTROLS BELOW THE CARD */}
      {showActions && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 w-full max-w-[440px]">
          {/* Flip Toggle */}
          <button
            type="button"
            onClick={() => setIsFlipped(!isFlipped)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span>{isFlipped ? 'Front View (सामने)' : 'Back View (पीछे)'}</span>
          </button>

          {/* Download Official PDF */}
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isDownloading ? 'Downloading...' : 'Download Official Bar ID (PDF)'}</span>
          </button>

          {/* Share/Copy Verification Link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
            title="Copy QR Verification Link"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Copy QR Link</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
