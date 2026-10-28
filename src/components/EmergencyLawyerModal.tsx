import React, { useState } from 'react';
import { PhoneCall, AlertTriangle, X, CheckCircle2, ShieldAlert, User, Phone, MapPin } from 'lucide-react';
import { db } from '../lib/store';
import { Advocate } from '../types';

interface EmergencyLawyerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyLawyerModal: React.FC<EmergencyLawyerModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [problem, setProblem] = useState('');
  const [location, setLocation] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [topLawyers, setTopLawyers] = useState<Advocate[]>([]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !mobile || !problem) return;

    // Save request
    db.addEmergencyRequest({
      id: 'emg_' + Date.now(),
      name,
      mobile,
      problem,
      location: location || 'Ballia District',
      timestamp: new Date().toLocaleString(),
      status: 'New'
    });

    // Notify & Fetch Top 5 Criminal Lawyers
    const allAdvocates = db.getAdvocates().filter(a => a.status === 'APPROVED');
    const criminalSpecialists = allAdvocates.filter(a => a.isTopCriminalLawyer || a.specialization.includes('CRIMINAL'));
    const selected = criminalSpecialists.slice(0, 5);
    setTopLawyers(selected);
    setSubmitted(true);
  };

  const handleReset = () => {
    setName('');
    setMobile('');
    setProblem('');
    setLocation('');
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-red-500/40 shadow-2xl p-6 text-slate-100 relative">
        
        {/* Close Button */}
        <button
          onClick={handleReset}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <div>
            <div className="flex items-center gap-3 pb-3 mb-4 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-red-400">
                  तुरंत वकील चाहिए? (Emergency Criminal Legal Aid)
                </h3>
                <p className="text-xs text-slate-400">
                  Criminal &amp; Revenue Bar Association, Ballia Rapid Response
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4 bg-slate-950/50 p-3 rounded-xl border border-slate-800">
              यदि थाना (Police Station) हिरासत, गिरफ्तारी, प्राथमिकी (FIR), अवैध कस्टडी अथवा आपातकालीन जमानत संबंधी सहायता चाहिए तो तुरंत यह फॉर्म भरें। बार एसोसिएशन के <strong>शीर्ष 5 आपराधिक अधिवक्ता (Top Criminal Lawyers)</strong> का सीधा संपर्क प्राप्त होगा।
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  आपका पूरा नाम (Your Name) *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="उदा. अमित कुमार राय"
                  className="w-full bg-slate-800 border border-slate-700 focus:border-red-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  मोबाइल नंबर (10-Digit Mobile No.) *
                </label>
                <input
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="उदा. 9839XXXXXX"
                  className="w-full bg-slate-800 border border-slate-700 focus:border-red-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  थाना / स्थान (Police Station / Location in Ballia)
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="उदा. कोतवाली बलिया / थाना फेफना / रसड़ा"
                  className="w-full bg-slate-800 border border-slate-700 focus:border-red-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  समस्या का संक्षेप विवरण (Legal Emergency Details) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  placeholder="मामला: गिरफ्तारी, पुलिस पूछताछ, शांतिभंग (151/107/116), गैर-जमानती वारंट, या अन्य..."
                  className="w-full bg-slate-800 border border-slate-700 focus:border-red-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition-all transform hover:-translate-y-0.5"
              >
                तुरंत 5 वरिष्ठ वकीलों से संपर्क करें (Get Top 5 Lawyers)
              </button>
            </form>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 pb-3 mb-4 border-b border-slate-800 text-emerald-400">
              <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-base text-slate-100">आपातकालीन सूचना प्रेषित! (Request Logged)</h3>
                <p className="text-xs text-slate-400">नीचे दिए गए शीर्ष अधिवक्ताओं से तुरंत सीधा संपर्क करें:</p>
              </div>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1 mb-4">
              {topLawyers.map((adv) => (
                <div
                  key={adv.id}
                  className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={adv.photoUrl}
                      alt={adv.name}
                      className="w-10 h-10 rounded-full object-cover border border-amber-500/40"
                    />
                    <div>
                      <h4 className="font-bold text-xs text-slate-100">{adv.name}</h4>
                      <p className="text-[10px] text-amber-400 font-semibold">Bar No: {adv.barNo}</p>
                      <p className="text-[10px] text-slate-400">{adv.chamberNo || 'Ballia Court'}</p>
                    </div>
                  </div>

                  <a
                    href={`tel:${adv.mobile}`}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-colors whitespace-nowrap"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Now</span>
                  </a>
                </div>
              ))}
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 text-center">
              बार एसोसिएशन बलिया हेल्पडेस्क: <strong className="text-amber-300">+91 9415988800</strong>
            </div>

            <button
              onClick={handleReset}
              className="mt-4 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
            >
              Close / बंद करें
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
