import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Star,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Download,
  Calendar,
  X,
  CheckCircle2,
  Award,
  MessageSquare,
  QrCode
} from 'lucide-react';
import { Advocate, SpecializationType } from '../types';
import { db } from '../lib/store';
import { generateAdvocateIDCardPDF } from '../lib/pdfGenerator';
import { AdvocateIDCardModal } from '../components/AdvocateIDCardModal';

interface AdvocateDirectoryViewProps {
  onNavigate?: (route: string, param?: string) => void;
  selectedAdvocate?: Advocate | null;
  onSelectAdvocate?: (adv: Advocate | null) => void;
}

const SPECIALIZATIONS: Array<SpecializationType | 'ALL'> = [
  'ALL',
  'CRIMINAL',
  'REVENUE',
  'CIVIL',
  'MATRIMONIAL',
  'MVACT'
];

const TAHSILS = [
  'ALL',
  'Ballia Sadar',
  'Bansdih',
  'Rasra',
  'Bairia',
  'Sikanderpur',
  'Belthara Road'
];

export const AdvocateDirectoryView: React.FC<AdvocateDirectoryViewProps> = ({
  onNavigate,
  selectedAdvocate: propSelectedAdvocate,
  onSelectAdvocate: propOnSelectAdvocate
}) => {
  const [internalSelected, setInternalSelected] = useState<Advocate | null>(null);
  const activeAdvocate = propSelectedAdvocate !== undefined ? propSelectedAdvocate : internalSelected;

  const handleSelectAdvocate = (adv: Advocate | null) => {
    if (propOnSelectAdvocate) {
      propOnSelectAdvocate(adv);
    }
    setInternalSelected(adv);
  };

  const [search, setSearch] = useState('');
  const [selectedSpec, setSelectedSpec] = useState<string>('ALL');
  const [selectedTahsil, setSelectedTahsil] = useState<string>('ALL');
  const [viewingIDCardAdvocate, setViewingIDCardAdvocate] = useState<Advocate | null>(null);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Live real-time synced advocates state
  const [allAdvocates, setAllAdvocates] = useState<Advocate[]>(() => db.getAdvocates() || []);

  React.useEffect(() => {
    const refresh = () => {
      setAllAdvocates(db.getAdvocates() || []);
    };
    window.addEventListener('crba_state_updated', refresh);
    const interval = setInterval(refresh, 2000);
    return () => {
      window.removeEventListener('crba_state_updated', refresh);
      clearInterval(interval);
    };
  }, []);

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'APPROVED' | 'PENDING'>('ALL');

  const approvedCount = allAdvocates.filter(a => !a.status || a.status === 'APPROVED').length;
  const pendingCount = allAdvocates.filter(a => a.status === 'PENDING' || a.status === 'PENDING_APPROVAL').length;

  const advocates = allAdvocates.filter(a => {
    if (statusFilter === 'APPROVED') return !a.status || a.status === 'APPROVED';
    if (statusFilter === 'PENDING') return a.status === 'PENDING' || a.status === 'PENDING_APPROVAL';
    return true;
  });

  const filteredAdvocates = advocates.filter(adv => {
    const q = (search || '').trim().toLowerCase();
    const matchesSearch =
      !q ||
      (adv.name || '').toLowerCase().includes(q) ||
      (adv.barNo || '').toLowerCase().includes(q) ||
      (adv.copNo || '').toLowerCase().includes(q) ||
      (adv.address?.village || '').toLowerCase().includes(q) ||
      (adv.address?.district || '').toLowerCase().includes(q) ||
      (adv.chamberNo || '').toLowerCase().includes(q);

    const matchesSpec =
      selectedSpec === 'ALL' || (adv.specialization || []).includes(selectedSpec as SpecializationType);

    const matchesTahsil =
      selectedTahsil === 'ALL' || (adv.address?.tahsil || '') === selectedTahsil;

    return matchesSearch && matchesSpec && matchesTahsil;
  });

  const handleAddReview = (advId: string) => {
    if (!newReviewText.trim() || !newReviewAuthor.trim()) return;

    db.addReview({
      id: 'rev_' + Date.now(),
      advocateId: advId,
      clientName: newReviewAuthor,
      rating: newReviewRating,
      comment: newReviewText,
      date: new Date().toLocaleDateString('en-GB')
    });

    setReviewSubmitted(true);
    setNewReviewText('');
    setNewReviewAuthor('');
    setTimeout(() => setReviewSubmitted(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Title & Search Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-100">
                Ballia Bar Advocate Directory (अधिवक्ता डायरेक्टरी)
              </h1>
              <p className="text-xs text-slate-400">
                Official statutory roster of practicing advocates registered with Criminal &amp; Revenue Bar Association, District Court Ballia
              </p>
            </div>
          </div>
        </div>

        <div className="w-full md:w-80 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Name, Bar No, Chamber, Village..."
            className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 text-xs text-slate-100 rounded-xl pl-9 pr-3.5 py-2.5 placeholder-slate-500 focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>
      </div>

      {/* Filter Tabs & Tahsil Dropdown */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        
        {/* Specialization Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 max-w-full">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1 flex-shrink-0">
            <Filter className="w-3.5 h-3.5" /> Practice Area:
          </span>
          {SPECIALIZATIONS.map((spec) => (
            <button
              key={spec}
              onClick={() => setSelectedSpec(spec)}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
                selectedSpec === spec
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>

        {/* Tahsil Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">Tahsil Filter:</span>
          <select
            value={selectedTahsil}
            onChange={(e) => setSelectedTahsil(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-amber-500"
          >
            {TAHSILS.map((t) => (
              <option key={t} value={t}>{t === 'ALL' ? 'All Tahsils (सभी तहसील)' : t}</option>
            ))}
          </select>
        </div>

        {/* Membership Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold transition-all ${
              statusFilter === 'ALL'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({allAdvocates.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('APPROVED')}
            className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold transition-all ${
              statusFilter === 'APPROVED'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Verified ({approvedCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('PENDING')}
            className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold transition-all ${
              statusFilter === 'PENDING'
                ? 'bg-amber-400 text-slate-950 font-bold shadow'
                : 'text-amber-400 hover:text-amber-300'
            }`}
          >
            ⏳ Pending ({pendingCount})
          </button>
        </div>

      </div>

      {/* Stats Counter Bar */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>Showing <strong>{filteredAdvocates.length}</strong> of <strong>{advocates.length}</strong> registered advocates</span>
        {search && (
          <button
            onClick={() => { setSearch(''); setSelectedSpec('ALL'); setSelectedTahsil('ALL'); }}
            className="text-amber-400 hover:underline text-xs"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Advocate Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAdvocates.map((adv) => (
          <div
            key={adv.id}
            className="rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 p-5 shadow-lg transition-all flex flex-col justify-between"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start gap-3.5">
                <img
                  src={adv.photoUrl || 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&auto=format&fit=crop&q=80'}
                  alt={adv.name || 'Advocate'}
                  className="w-14 h-14 rounded-xl object-cover border-2 border-amber-500/30 flex-shrink-0 bg-slate-800"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&auto=format&fit=crop&q=80';
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 truncate font-mono">
                      {adv.barNo}
                    </span>
                    {(adv.status === 'PENDING' || adv.status === 'PENDING_APPROVAL') && (
                      <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold px-1.5 py-0.5 rounded flex-shrink-0 animate-pulse">
                        ⏳ Under Verification
                      </span>
                    )}
                    {adv.isTopCriminalLawyer && (
                      <span className="text-[9px] bg-red-500/20 text-red-400 font-bold px-1.5 py-0.5 rounded flex-shrink-0">
                        Top Criminal
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-slate-100 truncate mt-1">
                    {adv.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate">
                    S/o {adv.fatherName || '---'}
                  </p>
                </div>
              </div>

              {/* Badges / Specializations */}
              <div className="flex flex-wrap gap-1.5 my-3">
                {(adv.specialization && adv.specialization.length > 0 ? adv.specialization : ['GENERAL', 'CIVIL']).map((spec) => (
                  <span
                    key={spec}
                    className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700"
                  >
                    {spec}
                  </span>
                ))}
              </div>

              {/* Key Details */}
              <div className="space-y-1.5 text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span className="truncate">Tahsil: {adv.address?.tahsil || 'Ballia Sadar'}, Ballia</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span className="truncate">Chamber: {adv.chamberNo || 'Bar Block, District Court'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />
                  <span className="font-bold text-slate-200">{adv.rating || 4.9}</span>
                  <span className="text-slate-500">({adv.reviewCount || adv.reviewsCount || (adv.reviews || []).length || 12} reviews)</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={() => handleSelectAdvocate(adv)}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors text-center"
              >
                View Profile &amp; Reviews
              </button>

              <button
                onClick={() => setViewingIDCardAdvocate(adv)}
                title="View Digital Bar ID Card with QR & Logo"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition-colors"
              >
                <QrCode className="w-4 h-4" />
              </button>

              <button
                onClick={() => generateAdvocateIDCardPDF(adv)}
                title="Download Official Bar ID Card PDF"
                className="p-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredAdvocates.length === 0 && (
        <div className="text-center py-16 bg-slate-900 rounded-2xl border border-slate-800 text-slate-400 space-y-2">
          <Users className="w-8 h-8 mx-auto text-slate-600" />
          <p className="text-sm font-semibold text-slate-300">No advocates match your selected search or filters.</p>
          <p className="text-xs text-slate-500">Try clearing your filters or search keywords.</p>
          <button
            onClick={() => { setSearch(''); setSelectedSpec('ALL'); setSelectedTahsil('ALL'); }}
            className="mt-3 px-4 py-2 bg-slate-800 text-amber-400 text-xs font-semibold rounded-xl"
          >
            Show All Advocates
          </button>
        </div>
      )}

      {/* ADVOCATE PROFILE & REVIEWS MODAL */}
      {activeAdvocate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-slate-100 relative max-h-[92vh] overflow-y-auto my-auto">
            
            <button
              onClick={() => handleSelectAdvocate(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Top Bar of Modal */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pb-4 border-b border-slate-800">
              <img
                src={activeAdvocate.photoUrl || 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&auto=format&fit=crop&q=80'}
                alt={activeAdvocate.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-500/40 shadow"
              />
              <div className="text-center sm:text-left flex-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/30 font-mono">
                    {activeAdvocate.barNo}
                  </span>
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Bar Affiliated
                  </span>
                </div>
                <h3 className="font-bold text-lg text-slate-100 mt-1">
                  Advocate {activeAdvocate.name}
                </h3>
                <p className="text-xs text-slate-400">
                  Son of {activeAdvocate.fatherName || '---'} • Age: {activeAdvocate.age || 40} Yrs
                </p>
                <p className="text-xs text-slate-300 mt-1">
                  Chamber: <strong>{activeAdvocate.chamberNo || 'District Court Bar Hall, Ballia'}</strong>
                </p>
              </div>
            </div>

            {/* Detail Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-slate-500">Bar Council &amp; COP:</span>
                <p className="font-semibold text-slate-200">{activeAdvocate.barNo} • {activeAdvocate.copNo || 'VERIFIED'}</p>
                <p className="text-[11px] text-amber-400">Valid Till: {activeAdvocate.validTill || '31/12/2026'}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-slate-500">Contact &amp; Mobile:</span>
                <p className="font-semibold text-slate-200">+91 {activeAdvocate.mobile}</p>
                <p className="text-[11px] text-slate-400">{activeAdvocate.email || 'advocate@barballia.com'}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1 sm:col-span-2">
                <span className="text-slate-500">Permanent Address (7-Field Roster):</span>
                <p className="font-medium text-slate-200">
                  {activeAdvocate.address?.village || 'Bahadurpur'}, Post: {activeAdvocate.address?.post || 'Ballia'}, P.S: {activeAdvocate.address?.policeStation || 'Kotwali'}, Tahsil: {activeAdvocate.address?.tahsil || 'Ballia Sadar'}, Dist: {activeAdvocate.address?.district || 'Ballia'} - {activeAdvocate.address?.pincode || '277001'}
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap gap-2.5 pt-2 pb-5 border-b border-slate-800">
              <a
                href={`tel:${activeAdvocate.mobile}`}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs text-center flex items-center justify-center gap-2 shadow"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Advocate (+91 {activeAdvocate.mobile})</span>
              </a>

              <button
                onClick={() => setViewingIDCardAdvocate(activeAdvocate)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 border border-slate-700"
              >
                <QrCode className="w-3.5 h-3.5 text-amber-400" />
                <span>View Bar ID Card</span>
              </button>

              <button
                onClick={() => generateAdvocateIDCardPDF(activeAdvocate)}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download ID Card (PDF)</span>
              </button>
            </div>

            {/* REVIEWS & RATINGS SECTION */}
            <div className="pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-amber-400" />
                  Client Reviews &amp; Ratings (मुवक्किल समीक्षा)
                </h4>
                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{activeAdvocate.rating || 4.9} / 5.0</span>
                </div>
              </div>

              {/* Add New Review Box */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
                <span className="font-semibold text-slate-300">Leave a Review for Advocate:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newReviewAuthor}
                    onChange={(e) => setNewReviewAuthor(e.target.value)}
                    placeholder="Your Name (मुवक्किल का नाम)"
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100"
                  />
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 text-[11px]">Rating:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReviewRating(star)}
                        className="p-0.5"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            star <= newReviewRating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  rows={2}
                  value={newReviewText}
                  onChange={(e) => setNewReviewText(e.target.value)}
                  placeholder="Share your experience (e.g. Excellent bail argument, very professional...)"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100"
                />

                <div className="flex items-center justify-between">
                  {reviewSubmitted ? (
                    <span className="text-emerald-400 text-xs font-semibold">✓ Review submitted! Thank you.</span>
                  ) : <span />}
                  <button
                    onClick={() => handleAddReview(activeAdvocate.id)}
                    className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                  >
                    Post Review
                  </button>
                </div>
              </div>

              {/* Past Reviews List */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {(activeAdvocate.reviews || []).length > 0 ? (
                  activeAdvocate.reviews?.map((r: any) => (
                    <div key={r.id || Math.random()} className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200">{r.clientName || r.author || 'Client'}</span>
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {Array.from({ length: Math.max(1, Math.min(5, Number(r.rating) || 5)) }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-300 text-[11px]">{r.comment}</p>
                      <span className="text-[10px] text-slate-500 block">{r.date || ''}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 text-center py-2">No reviews yet. Be the first to review!</p>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Official Digital Bar ID Card Modal */}
      {viewingIDCardAdvocate && (
        <AdvocateIDCardModal
          isOpen={!!viewingIDCardAdvocate}
          onClose={() => setViewingIDCardAdvocate(null)}
          advocate={viewingIDCardAdvocate}
          onNavigate={onNavigate}
        />
      )}

    </div>
  );
};
