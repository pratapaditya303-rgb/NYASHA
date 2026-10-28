import React, { useState, useEffect } from 'react';
import { BookOpen, Search, FileText, Copy, CheckCircle2, Plus, Trash2, Upload, ExternalLink, Download, Maximize2, Minimize2, Sparkles } from 'lucide-react';
import { LegalResource } from '../types';
import { db } from '../lib/store';
import { AdvocateLogo } from '../components/AdvocateLogo';

const OFFICIAL_BARE_ACT_PORTALS = [
  {
    name: 'BNS 2023 (भारतीय न्याय संहिता)',
    url: 'https://www.indiacode.nic.in/handle/123456789/20062',
    badge: 'Act No. 45 of 2023'
  },
  {
    name: 'BNSS 2023 (भारतीय नागरिक सुरक्षा संहिता)',
    url: 'https://www.indiacode.nic.in/handle/123456789/20099',
    badge: 'Act No. 46 of 2023'
  },
  {
    name: 'BSA 2023 (भारतीय साक्ष्य अधिनियम)',
    url: 'https://www.indiacode.nic.in/handle/123456789/20063',
    badge: 'Act No. 47 of 2023'
  },
  {
    name: 'UP Revenue Code 2006 (उ.प्र. राजस्व संहिता)',
    url: 'https://bor.up.nic.in/',
    badge: 'UP Act No. 8 of 2012'
  },
  {
    name: 'IndiaCode All Central & State Bare Acts',
    url: 'https://www.indiacode.nic.in/',
    badge: 'Govt. of India Official'
  }
];

export const ELibraryView: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'CRIMINAL' | 'REVENUE' | 'CIVIL' | 'FORMATS'>('ALL');
  const [search, setSearch] = useState('');
  const [selectedResource, setSelectedResource] = useState<LegalResource | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [resources, setResources] = useState<LegalResource[]>(db.getLegalResources());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isFullscreenReader, setIsFullscreenReader] = useState(false);

  const getEmbeddablePdfUrl = (url?: string, pdfUrl?: string): string | null => {
    if (pdfUrl) return pdfUrl;
    if (!url) return null;
    
    if (url.includes('drive.google.com')) {
      const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
      if (fileIdMatch && fileIdMatch[1]) {
        return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
      }
    }
    
    if (url.toLowerCase().endsWith('.pdf') || url.includes('pdf')) {
      return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
    }

    return url;
  };

  const [form, setForm] = useState<{
    title: string;
    actName: string;
    category: 'CRIMINAL' | 'REVENUE' | 'CIVIL' | 'FORMATS';
    sections: string;
    summary: string;
    content: string;
    externalUrl: string;
    pdfUrl: string;
    pdfFileName: string;
  }>({
    title: '',
    actName: '',
    category: 'CRIMINAL',
    sections: '',
    summary: '',
    content: '',
    externalUrl: '',
    pdfUrl: '',
    pdfFileName: ''
  });

  useEffect(() => {
    const refresh = () => setResources(db.getLegalResources());
    window.addEventListener('crba_state_updated', refresh);
    return () => window.removeEventListener('crba_state_updated', refresh);
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const filteredResources = resources.filter(r => {
    const matchesCategory = activeCategory === 'ALL' || r.category === activeCategory;
    const q = (search || '').trim().toLowerCase();
    const matchesSearch =
      !q ||
      (r.title || '').toLowerCase().includes(q) ||
      (r.actName || '').toLowerCase().includes(q) ||
      (r.sections || '').toLowerCase().includes(q) ||
      (r.summary || '').toLowerCase().includes(q) ||
      (r.content || '').toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      showToast('⚠️ 3 MB से बड़ी PDF के लिए कृपया Google Drive या बाहरी लिंक (External URL) का प्रयोग करें।');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(prev => ({
        ...prev,
        pdfUrl: reader.result as string,
        pdfFileName: file.name
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleAddBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.actName.trim()) {
      showToast('कृपया पुस्तक का शीर्षक और कानून का नाम भरें।');
      return;
    }

    const newBook: LegalResource = {
      id: 'lr_' + Date.now(),
      title: form.title.trim(),
      actName: form.actName.trim(),
      category: form.category,
      sections: form.sections.trim() || 'Complete Bare Act / Reference',
      summary: form.summary.trim() || `${form.title.trim()} (${form.actName.trim()})`,
      content: form.content.trim() || `${form.title.trim()}\nAct: ${form.actName.trim()}\nSections: ${form.sections.trim()}\n\n${form.summary.trim()}`,
      externalUrl: form.externalUrl.trim() || undefined,
      pdfUrl: form.pdfUrl || undefined,
      pdfFileName: form.pdfFileName || undefined,
      createdAt: new Date().toLocaleDateString('en-GB')
    };

    db.addLegalResource(newBook);
    setResources(db.getLegalResources());
    setIsAddModalOpen(false);
    setForm({
      title: '',
      actName: '',
      category: 'CRIMINAL',
      sections: '',
      summary: '',
      content: '',
      externalUrl: '',
      pdfUrl: '',
      pdfFileName: ''
    });
    showToast('📚 नई विधिक पुस्तक / बेयर एक्ट ई-लाइब्रेरी में सफलतापूर्वक जोड़ दी गई!');
  };

  const handleClearAllDemo = () => {
    if (window.confirm('क्या आप ई-लाइब्रेरी की सभी पुस्तकें/डेमो बुक्स हटाना चाहते हैं? इसके बाद आप अपनी नई पुस्तकें व PDF अपलोड कर सकेंगे।')) {
      db.clearAllLegalResources();
      setResources([]);
      showToast('🗑️ ई-लाइब्रेरी से सभी पुस्तकें सफलतापूर्वक हटा दी गईं!');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {toastMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100">
              Legal e-Library &amp; Real Bare Acts (विधि ई-लाइब्रेरी व पुस्तकें)
            </h1>
            <p className="text-xs text-slate-400">
              BNS, BNSS, BSA, IPC, CrPC, UP Revenue Code 2006, PDF Books &amp; Official Govt. IndiaCode Links
            </p>
          </div>
        </div>

        <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="w-full sm:w-64 relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Book, Section, Act, or Keyword..."
              className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 text-xs text-slate-100 rounded-xl pl-9 pr-3.5 py-2.5 placeholder-slate-500 focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>

          {resources.length > 0 && (
            <button
              type="button"
              onClick={handleClearAllDemo}
              className="px-3.5 py-2.5 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-300 hover:text-white font-bold text-xs border border-red-500/40 flex items-center justify-center gap-1.5 whitespace-nowrap transition-all shadow"
              title="ई-लाइब्रेरी की सभी डेमो पुस्तकें एक साथ हटाएं"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
              <span>डेमो पुस्तकें हटाएं (Clear All)</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 whitespace-nowrap transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Real Book / PDF (नई किताब जोड़ें)</span>
          </button>
        </div>
      </div>

      {/* Official Government of India (IndiaCode) Live Bare Acts Bar */}
      <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            🏛️ भारत सरकार (IndiaCode &amp; UP Board of Revenue) आधिकारिक पूर्ण बेयर एक्ट पोर्टल:
          </span>
          <span className="text-[10px] text-slate-400 hidden sm:inline">Click to open official Gazette PDF / Act</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {OFFICIAL_BARE_ACT_PORTALS.map((portal) => (
            <a
              key={portal.name}
              href={portal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 text-xs font-bold text-slate-200 hover:text-amber-300 transition-all"
            >
              <span>{portal.name}</span>
              <span className="text-[9px] bg-amber-500/15 text-amber-300 px-1.5 py-0.5 rounded font-mono">{portal.badge}</span>
              <ExternalLink className="w-3 h-3 text-amber-400" />
            </a>
          ))}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {(['ALL', 'CRIMINAL', 'REVENUE', 'CIVIL', 'FORMATS'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`text-xs px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
              activeCategory === cat
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {cat === 'ALL' && `All Books & Acts (${resources.length})`}
            {cat === 'CRIMINAL' && 'Criminal (BNS / BNSS / IPC)'}
            {cat === 'REVENUE' && 'UP Revenue Code 2006'}
            {cat === 'CIVIL' && 'Civil & CPC'}
            {cat === 'FORMATS' && 'Legal Drafts & Templates'}
          </button>
        ))}
      </div>

      {/* Grid of Legal Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((res) => (
          <div
            key={res.id}
            className="rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 p-5 shadow-xl transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  {res.actName}
                </span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded">
                  {res.sections}
                </span>
              </div>

              <h3 className="font-bold text-sm text-slate-100 mb-2 leading-snug">
                {res.title}
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 mb-4">
                {res.summary}
              </p>

              {(res.pdfFileName || res.externalUrl) && (
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {res.pdfFileName && (
                    <span className="text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-lg font-semibold flex items-center gap-1">
                      <FileText className="w-3 h-3" /> PDF: {res.pdfFileName}
                    </span>
                  )}
                  {res.externalUrl && (
                    <span className="text-[10px] bg-blue-500/15 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-lg font-semibold flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" /> External Book Link
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={() => setSelectedResource(res)}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
              >
                Read Full Book / Text
              </button>

              {res.pdfUrl && (
                <a
                  href={res.pdfUrl}
                  download={res.pdfFileName || `${res.title}.pdf`}
                  title="Download PDF Book"
                  className="p-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition-colors"
                >
                  <Download className="w-4 h-4" />
                </a>
              )}

              {res.externalUrl && (
                <a
                  href={res.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open External Book / PDF Link"
                  className="p-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}

              <button
                onClick={() => handleCopy(res.content, res.id)}
                title="Copy content"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition-colors"
              >
                {copiedId === res.id ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>

              <button
                onClick={() => {
                  if (window.confirm(`क्या आप "${res.title}" पुस्तक को ई-लाइब्रेरी से हटाना चाहते हैं?`)) {
                    db.deleteLegalResource(res.id);
                    setResources(db.getLegalResources());
                    showToast('🗑️ पुस्तक सफलतापूर्वक हटाई गई');
                  }
                }}
                title="Delete Book (पुस्तक हटाएं)"
                className="p-2 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Add Real Book / Bare Act / PDF */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-amber-500/40 shadow-2xl p-6 text-slate-100 my-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-400">Add to Digital Law Library</span>
                <h3 className="text-lg font-bold text-white">नई विधिक पुस्तक / बेयर एक्ट / PDF जोड़ें</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddBookSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-300 mb-1">Book / Bare Act Title (पुस्तक का नाम) *</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Bharatiya Nagarik Suraksha Sanhita (BNSS 2023) Full Handbook"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Act / Law Short Name (कानून का नाम) *</label>
                  <input
                    type="text"
                    required
                    value={form.actName}
                    onChange={(e) => setForm({ ...form, actName: e.target.value })}
                    placeholder="e.g. BNSS 2023 / Hindu Marriage Act"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Category (श्रेणी) *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 font-bold"
                  >
                    <option value="CRIMINAL">Criminal (BNS / BNSS / IPC)</option>
                    <option value="REVENUE">UP Revenue Code 2006</option>
                    <option value="CIVIL">Civil &amp; CPC / Family Law</option>
                    <option value="FORMATS">Legal Drafts &amp; Templates</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-300 mb-1">Key Sections / Chapters (प्रमुख धाराएं)</label>
                  <input
                    type="text"
                    value={form.sections}
                    onChange={(e) => setForm({ ...form, sections: e.target.value })}
                    placeholder="e.g. Section 1 to 531 /Sec 480, 482 Bail Provisions"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-300 mb-1">Short Summary (संक्षिप्त विवरण)</label>
                  <input
                    type="text"
                    value={form.summary}
                    onChange={(e) => setForm({ ...form, summary: e.target.value })}
                    placeholder="इस पुस्तक या कानून के मुख्य बिंदुओं का संक्षिप्त विवरण..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100"
                  />
                </div>

                {/* Option 1: External PDF / Google Drive / IndiaCode URL */}
                <div>
                  <label className="block font-bold text-amber-300 mb-1">
                    1. Google Drive / IndiaCode PDF Link (बड़ी किताबों के लिए बेस्ट)
                  </label>
                  <input
                    type="url"
                    value={form.externalUrl}
                    onChange={(e) => setForm({ ...form, externalUrl: e.target.value })}
                    placeholder="https://drive.google.com/... or https://indiacode.nic.in/..."
                    className="w-full bg-slate-950 border border-amber-500/40 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>

                {/* Option 2: Direct PDF File Upload */}
                <div>
                  <label className="block font-bold text-emerald-300 mb-1">
                    2. या सीधे PDF फाइल अपलोड करें (Up to 3 MB)
                  </label>
                  <label className="w-full flex items-center justify-center gap-2 bg-slate-950 hover:bg-slate-800 border border-emerald-500/40 rounded-xl px-3 py-2 text-emerald-300 font-bold cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <span className="truncate">{form.pdfFileName || 'Choose PDF File...'}</span>
                    <input type="file" accept=".pdf" onChange={handlePdfUpload} className="hidden" />
                  </label>
                </div>

                {/* Option 3: Full Text / Sections Content */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-300 mb-1">
                    3. Full Book Text / Bare Act Sections / Notes (पूरा पाठ या धाराएं पेस्ट करें)
                  </label>
                  <textarea
                    rows={6}
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    placeholder="यहाँ बेयर एक्ट की धाराएं, महत्वपूर्ण जजमेंट या पूरा पाठ पेस्ट करें..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-100 font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-lg"
                >
                  💾 Save Book to e-Library
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal View: CLASSIC ROYAL LEATHER COVER BOOK READER */}
      {selectedResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-fade-in">
          
          {/* Main Leather Binding Book Spine Frame */}
          <div className={`w-full transition-all duration-300 relative flex flex-col my-auto rounded-3xl shadow-2xl bg-gradient-to-br from-[#3b1c0e] via-[#210e05] to-[#3a1b0d] border-4 border-amber-500/70 ring-8 ring-amber-950/80 p-3 sm:p-5 text-slate-100 ${
            isFullscreenReader ? 'max-w-none h-[96vh]' : 'max-w-5xl max-h-[92vh]'
          }`}>
            
            {/* Gold Filigree Corner Ornaments */}
            <div className="absolute top-2 left-3 text-amber-400/80 text-xl pointer-events-none font-serif">✦</div>
            <div className="absolute top-2 right-3 text-amber-400/80 text-xl pointer-events-none font-serif">✦</div>
            <div className="absolute bottom-2 left-3 text-amber-400/80 text-xl pointer-events-none font-serif">✦</div>
            <div className="absolute bottom-2 right-3 text-amber-400/80 text-xl pointer-events-none font-serif">✦</div>

            {/* Silk Ribbon Bookmark */}
            <div className="absolute top-0 right-16 w-5 h-16 bg-gradient-to-b from-red-700 via-red-600 to-red-800 shadow-md rounded-b-md border-x border-red-900 pointer-events-none z-20 flex items-end justify-center pb-1">
              <span className="text-[8px] text-amber-300 font-serif font-bold">★</span>
            </div>

            {/* Leather Header Toolbar */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-amber-500/30 px-2 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-serif text-sm shadow">
                  ⚖️
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 font-serif block">
                    CLASSIC LEATHER BOUND LEGAL EDITION • {selectedResource.actName}
                  </span>
                  <h3 className="font-serif font-black text-sm sm:text-base text-amber-100 leading-tight">
                    {selectedResource.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFullscreenReader(!isFullscreenReader)}
                  className="px-2.5 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition flex items-center gap-1"
                  title="Toggle Fullscreen Leather Reader View"
                >
                  {isFullscreenReader ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{isFullscreenReader ? 'Exit Fullscreen' : 'Fullscreen'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedResource(null);
                    setIsFullscreenReader(false);
                  }}
                  className="w-8 h-8 rounded-xl bg-amber-500/10 hover:bg-red-500/20 text-amber-400 hover:text-red-400 border border-amber-500/30 flex items-center justify-center font-bold transition"
                  title="Close Classic Reader"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* OPEN BOOK 2-PAGE SPREAD (Parchment Pages) */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 overflow-hidden relative rounded-2xl bg-[#1d0a03] p-1.5 border border-amber-600/30 shadow-2xl">
              
              {/* PAGE 1 (LEFT PAGE): Classic Leather Cover & Title Page / Summary */}
              <div className="lg:col-span-4 bg-[#fbf7ee] text-[#2c1a0e] rounded-xl p-4 sm:p-5 border border-[#e2d6be] shadow-inner flex flex-col justify-between overflow-y-auto space-y-4 font-serif">
                
                <div className="space-y-4">
                  {/* Embossed Book Cover Seal Header */}
                  <div className="text-center pb-4 border-b-2 border-dashed border-[#d4af37]/60 space-y-2">
                    <div className="w-16 h-16 mx-auto rounded-full bg-slate-950 p-0.5 border-2 border-[#d4af37] shadow-lg flex items-center justify-center">
                      <AdvocateLogo variant="auto" className="w-full h-full" />
                    </div>
                    <span className="text-[9px] font-black tracking-[0.25em] text-[#8a5a15] uppercase block">
                      SUPREME BAR LIBRARY
                    </span>
                    <h2 className="text-base font-black text-[#1c0f08] leading-tight font-serif uppercase tracking-wide">
                      {selectedResource.title}
                    </h2>
                    <span className="text-[11px] font-bold text-[#b3771b] bg-[#f2e7d0] px-2.5 py-0.5 rounded-full border border-[#d4af37]/40 inline-block">
                      {selectedResource.actName}
                    </span>
                  </div>

                  {/* Chapter / Section Info */}
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-[#633e0d] uppercase text-[10px] tracking-wider">Statutory Provisions / Sections:</p>
                    <p className="font-semibold text-[#211107] bg-[#f4ebd9] p-2 rounded-lg border border-[#e0d2b8]">
                      {selectedResource.sections}
                    </p>
                  </div>

                  {/* Abstract / Summary */}
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-[#633e0d] uppercase text-[10px] tracking-wider">Book Abstract &amp; Legal Context:</p>
                    <div className="text-[11.5px] leading-relaxed text-[#362112] bg-[#f9f3e5] p-3 rounded-xl border border-[#e2d5bd] italic shadow-inner">
                      &quot;{selectedResource.summary}&quot;
                    </div>
                  </div>
                </div>

                {/* Left Page Actions */}
                <div className="pt-3 border-t border-[#e2d5bd] space-y-2">
                  {selectedResource.externalUrl && (
                    <a
                      href={selectedResource.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-3 rounded-xl bg-[#2a1309] hover:bg-[#3d1d0d] text-amber-300 font-sans font-bold text-xs flex items-center justify-center gap-1.5 shadow border border-amber-500/40 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open External Google Drive / PDF Link</span>
                    </a>
                  )}

                  {selectedResource.pdfUrl && (
                    <a
                      href={selectedResource.pdfUrl}
                      download={selectedResource.pdfFileName || `${selectedResource.title}.pdf`}
                      className="w-full py-2 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-sans font-bold text-xs flex items-center justify-center gap-1.5 shadow transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF File ({selectedResource.pdfFileName || 'Book'})</span>
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => handleCopy(selectedResource.content, selectedResource.id)}
                    className="w-full py-2 px-3 rounded-xl bg-[#ebdcc0] hover:bg-[#e2d0b0] text-[#331c0a] font-sans font-bold text-xs flex items-center justify-center gap-1.5 border border-[#c2ad8b] transition"
                  >
                    {copiedId === selectedResource.id ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Copied Text to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#8a5a15]" />
                        <span>Copy Full Legal Text</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* PAGE 2 (RIGHT PAGE): Embedded Google Drive / PDF Interactive Reader */}
              <div className="lg:col-span-8 bg-[#fdfbf7] text-[#1c1008] rounded-xl border border-[#e2d6be] shadow-inner flex flex-col overflow-hidden relative">
                
                {/* Book Spine Crease Effect */}
                <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/15 via-black/5 to-transparent pointer-events-none z-10" />

                {/* If Google Drive or PDF embed URL exists, embed directly in the leather book reader! */}
                {getEmbeddablePdfUrl(selectedResource.externalUrl, selectedResource.pdfUrl) ? (
                  <div className="w-full h-full flex flex-col">
                    <div className="bg-[#f0e6d2] px-3 py-1.5 border-b border-[#d8c8a8] flex items-center justify-between text-[11px] font-sans font-bold text-[#543611]">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                        <span>📖 Interactive PDF / Google Drive Leather Book Reader</span>
                      </span>
                      {selectedResource.externalUrl && (
                        <a
                          href={selectedResource.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-800 hover:text-amber-950 underline flex items-center gap-1"
                        >
                          <span>Direct Drive Link</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <iframe
                      src={getEmbeddablePdfUrl(selectedResource.externalUrl, selectedResource.pdfUrl) || ''}
                      className="w-full flex-1 border-0 rounded-b-xl min-h-[420px]"
                      title={`Classic Book View - ${selectedResource.title}`}
                      allow="autoplay"
                    />
                  </div>
                ) : (
                  /* Fallback to Parchment Paper Legal Text */
                  <div className="p-5 sm:p-6 overflow-y-auto flex-1 font-serif text-xs leading-relaxed space-y-4 text-[#211208]">
                    <div className="border-b border-[#e2d5bd] pb-2 flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase text-[#8a5a15] font-bold">Parchment Page View • Text Volume</span>
                      <span className="text-[10px] text-[#8a5a15] font-bold">Official Record</span>
                    </div>
                    <div className="whitespace-pre-wrap font-serif text-[12px] leading-relaxed text-[#211208] p-2 bg-[#f8f2e6] rounded-xl border border-[#e2d5bd]">
                      {selectedResource.content}
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

