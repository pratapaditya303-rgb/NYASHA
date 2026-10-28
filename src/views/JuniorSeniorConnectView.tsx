import React, { useState } from 'react';
import { Users, Briefcase, MessageSquare, Send, CheckCircle2, UserCheck, Award, MapPin } from 'lucide-react';
import { MentorshipOpening, Advocate } from '../types';
import { db } from '../lib/store';

interface JuniorSeniorConnectViewProps {
  currentUser: Advocate | null;
  onNavigate: (route: string) => void;
}

export const JuniorSeniorConnectView: React.FC<JuniorSeniorConnectViewProps> = ({
  currentUser,
  onNavigate
}) => {
  const [openings, setOpenings] = useState<MentorshipOpening[]>(db.getMentorshipOpenings());
  const [selectedOpening, setSelectedOpening] = useState<MentorshipOpening | null>(null);
  const [appliedSuccess, setAppliedSuccess] = useState(false);
  const [applicationText, setApplicationText] = useState('');
  const [juniorName, setJuniorName] = useState(currentUser ? currentUser.name : '');
  const [juniorBarNo, setJuniorBarNo] = useState(currentUser ? currentUser.barNo : '');

  // Discussion forum state
  const [forumPosts, setForumPosts] = useState([
    {
      id: 'fp1',
      author: 'Adv. Alok Rai',
      role: 'Junior Member',
      topic: 'Question on Sec 34 UP Revenue Code',
      text: 'In an uncontested will-based mutation before Tahsildar Sadar Ballia, is statement of marginal witness mandatory if probate is not requested?',
      replies: 3,
      time: '2 hours ago'
    },
    {
      id: 'fp2',
      author: 'Adv. Arvind Kumar Tiwari',
      role: 'Senior Advocate',
      topic: 'Supreme Court Ruling on Sec 438 Bail',
      text: 'Sharing recent citation regarding anticipatory bail in non-bailable FIRs without 41A notice. Always annex the notice acknowledgment in Annexure A-1.',
      replies: 7,
      time: 'Yesterday'
    }
  ]);
  const [newPostText, setNewPostText] = useState('');
  const [newPostTopic, setNewPostTopic] = useState('');

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOpening) return;

    db.addMentorshipOpening({
      ...selectedOpening,
      applicantsCount: (selectedOpening.applicantsCount || 0) + 1
    });

    setAppliedSuccess(true);
    setTimeout(() => {
      setAppliedSuccess(false);
      setSelectedOpening(null);
    }, 2500);
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim() || !newPostTopic.trim()) return;

    const post = {
      id: 'fp_' + Date.now(),
      author: currentUser ? currentUser.name : 'Advocate Member',
      role: currentUser ? (currentUser.isTopCriminalLawyer ? 'Senior Advocate' : 'Member') : 'Member',
      topic: newPostTopic,
      text: newPostText,
      replies: 0,
      time: 'Just now'
    };

    setForumPosts([post, ...forumPosts]);
    setNewPostTopic('');
    setNewPostText('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100">
              Junior-Senior Connect &amp; Chamber Mentorship (वरिष्ठ-कनिष्ठ मंच)
            </h1>
            <p className="text-xs text-slate-400">
              Chamber pupilage, court training opportunities, and peer legal discussions for Ballia Bar
            </p>
          </div>
        </div>
      </div>

      {/* Senior Chamber Openings Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-amber-400" />
            Senior Chamber Openings in Ballia Court
          </h2>
          <span className="text-xs text-amber-400 font-semibold">{openings.length} Active Openings</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {openings.map((op) => (
            <div
              key={op.id}
              className="rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 p-5 shadow-xl transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      Chamber Training
                    </span>
                    <h3 className="font-bold text-base text-slate-100 mt-1">{op.seniorName}</h3>
                    <p className="text-xs text-amber-400 font-medium">Bar Registration: {op.seniorBarNo}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 block">
                      {op.stipend}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1 block">Vacancies: {op.vacancies}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>Specialization: <strong>{op.specialization.join(', ')}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>Chamber: {op.chamberNo}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  "{op.requirements}"
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  {op.applicantsCount || 2} Junior Advocates Applied
                </span>
                <button
                  onClick={() => setSelectedOpening(op)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow transition-all"
                >
                  Apply for Chamber Pupilage
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Discussion Board / Forum */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-amber-400" />
          Ballia Bar Judicial Forum &amp; Q&amp;A
        </h2>

        {/* Create Post Box */}
        <form onSubmit={handleCreatePost} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <input
            type="text"
            required
            value={newPostTopic}
            onChange={(e) => setNewPostTopic(e.target.value)}
            placeholder="Topic / Query Title (e.g. Injunction Under Order 39, Bail in NDPS...)"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
          <textarea
            rows={3}
            required
            value={newPostText}
            onChange={(e) => setNewPostText(e.target.value)}
            placeholder="Explain the legal question, procedural doubt or share a High Court/Supreme Court ruling..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Post to Discussion Forum</span>
            </button>
          </div>
        </form>

        {/* Forum Posts List */}
        <div className="space-y-3">
          {forumPosts.map((fp) => (
            <div key={fp.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-100">{fp.author}</span>
                  <span className="text-[10px] bg-slate-800 text-amber-300 px-2 py-0.5 rounded-full border border-slate-700">
                    {fp.role}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500">{fp.time}</span>
              </div>
              <h4 className="font-bold text-amber-400 text-xs">{fp.topic}</h4>
              <p className="text-slate-300 leading-relaxed">{fp.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Apply Modal */}
      {selectedOpening && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-slate-100">Apply for Mentorship</h3>
              <button onClick={() => setSelectedOpening(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {!appliedSuccess ? (
              <form onSubmit={handleApply} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Applying to Senior Advocate:</label>
                  <p className="p-2.5 rounded-xl bg-slate-950 text-amber-400 font-bold border border-slate-800">
                    {selectedOpening.seniorName} ({selectedOpening.seniorBarNo})
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={juniorName}
                    onChange={(e) => setJuniorName(e.target.value)}
                    placeholder="Adv. Rajesh Gupta"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Your Bar Registration No *</label>
                  <input
                    type="text"
                    required
                    value={juniorBarNo}
                    onChange={(e) => setJuniorBarNo(e.target.value)}
                    placeholder="UP11234/2023"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Brief Statement of Interest</label>
                  <textarea
                    rows={3}
                    value={applicationText}
                    onChange={(e) => setApplicationText(e.target.value)}
                    placeholder="I am passionate about learning criminal cross-examination and revenue court drafting..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow"
                >
                  Submit Application
                </button>
              </form>
            ) : (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-base text-slate-100">Application Submitted!</h4>
                <p className="text-xs text-slate-400">
                  Senior Advocate {selectedOpening.seniorName} has been notified. You will be contacted via mobile.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
