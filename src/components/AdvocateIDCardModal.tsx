import React from 'react';
import { X, ShieldCheck, Download } from 'lucide-react';
import { Advocate } from '../types';
import { AdvocateIDCard } from './AdvocateIDCard';

interface AdvocateIDCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  advocate: Advocate;
  onNavigate?: (route: string, param?: string) => void;
}

export const AdvocateIDCardModal: React.FC<AdvocateIDCardModalProps> = ({
  isOpen,
  onClose,
  advocate,
  onNavigate
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col items-center">
        
        {/* Modal Header */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">
                Official Digital Bar ID Card (पहचान पत्र)
              </h3>
              <p className="text-[11px] text-slate-400">
                District Court Campus, Ballia • ISO/CR80 Standard
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* The Digital ID Card Component */}
        <div className="w-full flex justify-center py-2">
          <AdvocateIDCard advocate={advocate} onNavigate={onNavigate} />
        </div>

        {/* Note */}
        <p className="text-[10px] text-slate-500 text-center mt-4">
          Certified by Criminal &amp; Revenue Bar Association, District Court, Ballia. Scannable by any mobile device.
        </p>

      </div>
    </div>
  );
};
