import React, { useState } from 'react';
import { PlusCircle, X, Layers, AlertCircle } from 'lucide-react';
import { PaymentTermKey, Programme } from '../types';
import { generateMilestones } from '../utils/storage';
import { formatUSD, formatDate } from '../utils/dateUtils';

interface AddProgrammeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProgramme: (programme: Programme) => void;
}

export const AddProgrammeModal: React.FC<AddProgrammeModalProps> = ({
  isOpen,
  onClose,
  onAddProgramme,
}) => {
  const [title, setTitle] = useState('');
  const [vendor, setVendor] = useState('');
  const [contractRef, setContractRef] = useState('');
  const [signDate, setSignDate] = useState<string>(() => formatDate(new Date()));
  const [amount, setAmount] = useState<number | ''>(25000);
  const [termKey, setTermKey] = useState<PaymentTermKey>('30_70');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentAmount = typeof amount === 'number' ? amount : 0;
  const previewMilestones = generateMilestones(currentAmount, termKey);

  const termsLabelMap: Record<PaymentTermKey, string> = {
    '30_70': '30% Signing / 70% Material Delivery',
    '50_50': '50% Signing / 50% Material Delivery',
    '100_delivery': '100% On Delivery',
    '20_40_40': '20% Signing / 40% Delivery / 40% Broadcast',
    custom: 'Custom Split',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !vendor.trim() || !amount || Number(amount) <= 0) {
      setErrorMsg('Please enter all required fields (Title, Vendor, and a valid Amount).');
      return;
    }

    const newProgramme: Programme = {
      id: 'prog_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      title: title.trim(),
      vendor: vendor.trim(),
      contractRef: contractRef.trim() || `CON-${Date.now().toString().slice(-4)}`,
      totalAmount: Number(amount),
      termKey,
      termsLabel: termsLabelMap[termKey] || termKey,
      milestones: generateMilestones(Number(amount), termKey),
      createdAt: formatDate(new Date()),
      agreementSignDate: signDate || formatDate(new Date()),
      rightsType: 'Linear & Digital Rights',
      currency: 'MYR',
    };

    onAddProgramme(newProgramme);
    // Reset form
    setTitle('');
    setVendor('');
    setContractRef('');
    setSignDate(formatDate(new Date()));
    setAmount(25000);
    setTermKey('30_70');
    setErrorMsg(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000f21]/80 backdrop-blur-xs p-4">
      <div className="bg-[#0b1c30] border border-[#1b2b3f] max-w-xl w-full rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#102034] border-b border-[#1b2b3f] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#4d8eff] text-[#00285d] flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#d3e4fe]">
                Register New Programme
              </h3>
              <p className="text-xs text-[#8c909f]">
                Configure licensing terms and milestone disbursement splits
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#8c909f] hover:text-[#d3e4fe] rounded p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Programme Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8c909f]">
              Programme Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Nordic Crime: Oslo Solitude S2"
              required
              className="h-10 px-3.5 bg-[#000f21] text-[#d3e4fe] placeholder:text-[#424754] rounded border border-[#1b2b3f] outline-none text-xs focus:border-[#4d8eff] transition-colors"
            />
          </div>

          {/* Vendor and Amount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8c909f]">
                Distributor / Vendor <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                placeholder="e.g. ZDF Studios GmbH"
                required
                className="h-10 px-3.5 bg-[#000f21] text-[#d3e4fe] placeholder:text-[#424754] rounded border border-[#1b2b3f] outline-none text-xs focus:border-[#4d8eff] transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8c909f]">
                Total Contract Value (MYR) <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-[#8c909f] text-xs font-semibold">
                  RM
                </span>
                <input
                  type="number"
                  min="100"
                  step="100"
                  value={amount}
                  onChange={(e) =>
                    setAmount(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  placeholder="25000"
                  required
                  className="w-full h-10 pl-11 pr-3 bg-[#000f21] text-[#d3e4fe] rounded border border-[#1b2b3f] outline-none text-xs tabular-nums focus:border-[#4d8eff] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Contract Reference & Agreement Sign Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8c909f]">
                Contract Reference Code (Optional)
              </label>
              <input
                type="text"
                value={contractRef}
                onChange={(e) => setContractRef(e.target.value)}
                placeholder="e.g. ZDF-LIC-2026-V1"
                className="h-10 px-3.5 bg-[#000f21] text-[#d3e4fe] placeholder:text-[#424754] rounded border border-[#1b2b3f] outline-none text-xs focus:border-[#4d8eff] transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8c909f]">
                Agreement Sign Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={signDate}
                onChange={(e) => setSignDate(e.target.value)}
                required
                className="h-10 px-3.5 bg-[#000f21] text-[#d3e4fe] rounded border border-[#1b2b3f] outline-none text-xs focus:border-[#4d8eff] transition-colors cursor-pointer"
              />
            </div>
          </div>

          {/* Payment Terms Split Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8c909f]">
              Disbursement Milestone Split
            </label>
            <select
              value={termKey}
              onChange={(e) => setTermKey(e.target.value as PaymentTermKey)}
              className="h-10 px-3 bg-[#000f21] text-[#d3e4fe] rounded border border-[#1b2b3f] outline-none text-xs focus:border-[#4d8eff] cursor-pointer"
            >
              <option value="30_70">30% Signing / 70% Material Delivery</option>
              <option value="50_50">50% Signing / 50% Material Delivery</option>
              <option value="100_delivery">100% On Technical Delivery</option>
              <option value="20_40_40">
                20% Signing / 40% Delivery / 40% Broadcast
              </option>
            </select>
          </div>

          {/* Real-Time Preview */}
          <div className="bg-[#000f21] p-3.5 rounded-lg border border-[#1b2b3f] flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-[#adc6ff]">
              <Layers className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Real-Time Milestone Preview
              </span>
            </div>
            <div className="flex flex-col divide-y divide-[#1b2b3f]/70 pt-1">
              {previewMilestones.map((pm, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs py-1.5"
                >
                  <span className="text-[#c2c6d6]">{pm.title}</span>
                  <span className="tabular-nums font-semibold text-[#adc6ff]">
                    {formatUSD(pm.amount)} ({pm.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 h-9 bg-[#102034] hover:bg-[#1b2b3f] text-[#c2c6d6] hover:text-[#d3e4fe] rounded text-xs font-semibold transition-colors border border-[#1b2b3f]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 h-9 bg-[#4d8eff] hover:bg-[#adc6ff] text-[#00285d] rounded text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              Commit Programme Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
