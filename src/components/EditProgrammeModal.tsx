import React, { useState, useEffect } from 'react';
import { Edit3, X, AlertCircle } from 'lucide-react';
import { Programme } from '../types';

interface EditProgrammeModalProps {
  isOpen: boolean;
  programme: Programme | null;
  onClose: () => void;
  onUpdateProgramme: (updated: Programme) => void;
}

export const EditProgrammeModal: React.FC<EditProgrammeModalProps> = ({
  isOpen,
  programme,
  onClose,
  onUpdateProgramme,
}) => {
  const [title, setTitle] = useState('');
  const [vendor, setVendor] = useState('');
  const [contractRef, setContractRef] = useState('');
  const [signDate, setSignDate] = useState('');
  const [rightsType, setRightsType] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (programme) {
      setTitle(programme.title);
      setVendor(programme.vendor);
      setContractRef(programme.contractRef || '');
      setSignDate(programme.agreementSignDate || programme.createdAt || '');
      setRightsType(programme.rightsType || 'Linear & Digital Rights');
      setErrorMsg(null);
    }
  }, [programme]);

  if (!isOpen || !programme) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !vendor.trim()) {
      setErrorMsg('Please enter both Title and Vendor.');
      return;
    }

    const updated: Programme = {
      ...programme,
      title: title.trim(),
      vendor: vendor.trim(),
      contractRef: contractRef.trim(),
      agreementSignDate: signDate.trim() || programme.createdAt,
      rightsType: rightsType.trim(),
    };

    onUpdateProgramme(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000f21]/80 backdrop-blur-xs p-4">
      <div className="bg-[#0b1c30] border border-[#1b2b3f] max-w-lg w-full rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#102034] border-b border-[#1b2b3f] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#adc6ff] text-[#002e6a] flex items-center justify-center">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#d3e4fe]">
                Edit Programme Details
              </h3>
              <p className="text-xs text-[#8c909f]">
                Update title, distributor, or licensing metadata
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
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {errorMsg && (
            <div className="p-3 rounded bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8c909f]">
              Programme Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="h-10 px-3.5 bg-[#000f21] text-[#d3e4fe] rounded border border-[#1b2b3f] outline-none text-xs focus:border-[#4d8eff] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8c909f]">
              Distributor / Vendor <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              required
              className="h-10 px-3.5 bg-[#000f21] text-[#d3e4fe] rounded border border-[#1b2b3f] outline-none text-xs focus:border-[#4d8eff] transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8c909f]">
                Contract Reference
              </label>
              <input
                type="text"
                value={contractRef}
                onChange={(e) => setContractRef(e.target.value)}
                className="h-10 px-3.5 bg-[#000f21] text-[#d3e4fe] rounded border border-[#1b2b3f] outline-none text-xs focus:border-[#4d8eff] transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8c909f]">
                Agreement Sign Date
              </label>
              <input
                type="date"
                value={signDate}
                onChange={(e) => setSignDate(e.target.value)}
                className="h-10 px-3.5 bg-[#000f21] text-[#d3e4fe] rounded border border-[#1b2b3f] outline-none text-xs focus:border-[#4d8eff] transition-colors cursor-pointer"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8c909f]">
              Rights Scope
            </label>
            <input
              type="text"
              value={rightsType}
              onChange={(e) => setRightsType(e.target.value)}
              placeholder="e.g. Linear & Digital"
              className="h-10 px-3.5 bg-[#000f21] text-[#d3e4fe] rounded border border-[#1b2b3f] outline-none text-xs focus:border-[#4d8eff] transition-colors"
            />
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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
