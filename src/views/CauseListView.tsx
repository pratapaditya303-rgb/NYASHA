import React, { useState } from 'react';
import { Calendar, Search, Filter, Printer, Download, Scale, Clock, FileText } from 'lucide-react';
import { CauseListItem } from '../types';
import { db } from '../lib/store';
import { DatePickerInput } from '../components/DatePickerInput';
import { useRealtimeCollection } from '../hooks/useRealtimeCollection';

export const CauseListView: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toLocaleDateString('en-GB'));
  const [selectedCourt, setSelectedCourt] = useState<string>('ALL');
  const [searchAdvocate, setSearchAdvocate] = useState('');

  const { data: cloudCauseList } = useRealtimeCollection<CauseListItem>('causelist');
  const localCauseList = db.getCauseList();
  const causeList = cloudCauseList && cloudCauseList.length > 0 ? cloudCauseList : localCauseList;

  const courts = [
    'ALL',
    'Court of District & Sessions Judge, Ballia',
    'Court of Addl. District Judge-I (ADJ-1), Ballia',
    'Court of Chief Judicial Magistrate (CJM), Ballia',
    'Court of SDM Revenue, Sadar Ballia',
    'Court of SDM Revenue, Bansdih'
  ];

  const filteredItems = causeList.filter((item) => {
    const q = (searchAdvocate || '').trim().toLowerCase();
    const courtQuery = (selectedCourt || 'ALL').toLowerCase();

    const matchesCourt =
      selectedCourt === 'ALL' ||
      (item.courtName || '').toLowerCase().includes(courtQuery) ||
      courtQuery.includes((item.courtName || '').toLowerCase());

    const advocateStr = `${item.advocateName || ''} ${item.petitionerAdvocate || ''} ${item.respondentAdvocate || ''}`.toLowerCase();
    const caseNoStr = (item.caseNo || '').toLowerCase();
    const partiesStr = `${item.parties || ''} ${item.partyDetails || ''}`.toLowerCase();

    const matchesAdvocate =
      !q ||
      advocateStr.includes(q) ||
      caseNoStr.includes(q) ||
      partiesStr.includes(q);

    return matchesCourt && matchesAdvocate;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100">
              Daily Cause List (दैनिक वाद सूची)
            </h1>
            <p className="text-xs text-slate-400">
              District &amp; Sessions Court and Revenue Courts, Ballia (U.P.)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Print Cause List</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Select Listing Date</label>
          <DatePickerInput
            value={selectedDate}
            onChange={setSelectedDate}
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Select Court / Forum</label>
          <select
            value={selectedCourt}
            onChange={(e) => setSelectedCourt(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500 font-medium"
          >
            {courts.map((c) => (
              <option key={c} value={c}>{c === 'ALL' ? 'All Courts (समस्त न्यायालय)' : c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Search Case / Advocate</label>
          <div className="relative">
            <input
              type="text"
              value={searchAdvocate}
              onChange={(e) => setSearchAdvocate(e.target.value)}
              placeholder="e.g. Adv. Arvind, Bail 342, State..."
              className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-amber-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
        </div>
      </div>

      {/* Cause List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-slate-200">
              Listing for Date: <span className="text-amber-400">{selectedDate}</span>
            </span>
          </div>
          <span className="text-slate-400 font-semibold">{filteredItems.length} Cases Listed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 w-12 text-center">Sr.</th>
                <th className="py-3 px-4">Court / Forum</th>
                <th className="py-3 px-4">Case Number</th>
                <th className="py-3 px-4">Cause Title (Parties)</th>
                <th className="py-3 px-4">Advocate for Petitioner / Resp.</th>
                <th className="py-3 px-4">Stage / Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredItems.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-center text-slate-500">{item.itemNo || idx + 1}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-200">{item.courtName}</td>
                  <td className="py-3.5 px-4 font-bold text-amber-400 whitespace-nowrap">{item.caseNo}</td>
                  <td className="py-3.5 px-4 font-medium max-w-xs">{item.parties}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-100">{item.advocateName}</span>
                    <span className="text-[10px] text-slate-500 block">Criminal &amp; Revenue Bar</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-1 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 font-semibold text-[10px]">
                      {item.stage}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredItems.length === 0 && (
          <div className="py-12 text-center text-slate-500 space-y-2">
            <FileText className="w-8 h-8 mx-auto text-slate-600" />
            <p className="text-xs font-semibold text-slate-400">No cases found matching the criteria for {selectedDate}.</p>
          </div>
        )}
      </div>

    </div>
  );
};
