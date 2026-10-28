import React, { useState } from 'react';
import { X, ShieldCheck, CreditCard, QrCode, Smartphone, CheckCircle2, Download, IndianRupee, Lock } from 'lucide-react';
import { Advocate, Earning } from '../types';
import { db } from '../lib/store';
import { generateFeeReceiptPDF } from '../lib/pdfGenerator';

interface RazorpayModalProps {
  isOpen: boolean;
  onClose: () => void;
  advocate: Advocate;
  onSuccess: () => void;
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({
  isOpen,
  onClose,
  advocate,
  onSuccess
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('advocate@upi');
  const [cardNumber, setCardNumber] = useState('4312 8899 4432 1029');
  const [expiry, setExpiry] = useState('08/29');
  const [cvv, setCvv] = useState('321');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedEarning, setCompletedEarning] = useState<Earning | null>(null);

  if (!isOpen) return null;

  const handlePay = async () => {
    setIsProcessing(true);

    try {
      // 1. Call server API to create simulated Razorpay Order
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 1200,
          currency: 'INR',
          advocateId: advocate.id,
          advocateName: advocate.name,
          barNo: advocate.barNo,
          purpose: 'Annual Membership Subscription 2026-2027'
        })
      });
      const order = await res.json();

      // Simulate payment network roundtrip
      setTimeout(() => {
        const txnId = 'pay_' + Math.random().toString(36).substring(2, 12).toUpperCase();
        
        const earningRecord: Earning = {
          id: 'ern_' + Date.now(),
          advocateId: advocate.id,
          advocateName: advocate.name,
          barNo: advocate.barNo,
          amount: 1200,
          date: new Date().toLocaleDateString('en-GB'),
          mode: paymentMethod === 'upi' ? 'UPI / QR' : paymentMethod === 'card' ? 'Debit/Credit Card' : 'Net Banking',
          txnId: txnId,
          purpose: 'Annual Membership Subscription',
          notes: `Valid Till Extended for 2026-2027 | Order: ${order.orderId || 'ORD_BALLIA'}`,
          createdAt: new Date().toLocaleDateString('en-GB')
        };

        // Save in Store
        db.addEarning(earningRecord);
        
        // Update advocate validity (+1 year: 31/12/2027)
        db.updateAdvocate(advocate.id, {
          validTill: '31/12/2027',
          status: 'APPROVED'
        });

        setIsProcessing(false);
        setCompletedEarning(earningRecord);
        onSuccess();
      }, 1200);

    } catch {
      setIsProcessing(false);
      alert('Payment processing failed. Please try again.');
    }
  };

  const handleDownloadReceipt = () => {
    if (completedEarning) {
      generateFeeReceiptPDF(completedEarning, advocate);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-amber-500/40 shadow-2xl p-6 text-slate-100 relative">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {!completedEarning ? (
          <div>
            {/* Header */}
            <div className="flex items-center gap-3 pb-3 mb-4 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-100">
                  Razorpay Secure Checkout
                </h3>
                <p className="text-xs text-amber-400">Criminal &amp; Revenue Bar Association, Ballia</p>
              </div>
            </div>

            {/* Subscription Summary */}
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 mb-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Member Name:</span>
                <span className="font-bold text-slate-100">{advocate.name}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Bar Registration No:</span>
                <span className="font-bold text-amber-400">{advocate.barNo}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Subscription Period:</span>
                <span className="font-semibold text-slate-200">1 Year (2026-2027)</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                <span className="font-bold text-slate-200">Total Payable Amount:</span>
                <span className="text-base font-extrabold text-amber-400 flex items-center">
                  ₹ 1,200.00
                </span>
              </div>
            </div>

            {/* Payment Mode Selector */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-300 mb-2">Select Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all ${
                    paymentMethod === 'upi'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Debit / Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all ${
                    paymentMethod === 'netbanking'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <IndianRupee className="w-4 h-4" />
                  <span>NetBanking</span>
                </button>
              </div>
            </div>

            {/* Method Inputs */}
            {paymentMethod === 'upi' && (
              <div className="mb-5 space-y-2">
                <label className="block text-xs text-slate-300">Virtual Payment Address (UPI ID)</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="username@okhdfcbank / gpay"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100"
                />
                <p className="text-[11px] text-slate-500">Supports Google Pay, PhonePe, Paytm, BHIM &amp; QR</p>
              </div>
            )}

            {paymentMethod === 'card' && (
              <div className="mb-5 space-y-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 text-center font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">CVV</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 text-center font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'netbanking' && (
              <div className="mb-5 space-y-2">
                <label className="block text-xs text-slate-300">Select Bank</label>
                <select className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100">
                  <option>State Bank of India (SBI)</option>
                  <option>Punjab National Bank (PNB)</option>
                  <option>HDFC Bank</option>
                  <option>ICICI Bank</option>
                  <option>Bank of Baroda</option>
                  <option>Union Bank of India</option>
                </select>
              </div>
            )}

            {/* Pay Button */}
            <button
              onClick={handlePay}
              disabled={isProcessing}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Processing Razorpay ₹1200...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Pay ₹ 1,200 &amp; Renew Membership</span>
                </>
              )}
            </button>

            <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-slate-500">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>256-Bit SSL Encrypted &amp; PCI-DSS Level 1 Compliant</span>
            </div>
          </div>
        ) : (
          /* Success Screen */
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="font-bold text-lg text-emerald-400">Payment Successful!</h3>
              <p className="text-xs text-slate-300 mt-1">
                Your annual membership and Digital ID Card validity have been renewed up to{' '}
                <strong className="text-amber-400">31/12/2027</strong>.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-left space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Txn ID:</span>
                <span className="text-amber-400">{completedEarning.txnId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount:</span>
                <span className="text-slate-100">₹ {completedEarning.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date:</span>
                <span className="text-slate-100">{completedEarning.date}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={handleDownloadReceipt}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow"
              >
                <Download className="w-4 h-4" />
                <span>Download Official Fee Receipt PDF</span>
              </button>

              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Close / Done
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
