import React from 'react';
import {
  Search,
  X,
  Trash2,
  Edit2,
  Check,
  AlertTriangle,
  Clock,
  FolderX,
  CreditCard,
  FileCheck2,
  Receipt,
  Wallet,
  FileSignature,
} from 'lucide-react';
import { Programme, FilterTab } from '../types';
import { formatUSD, getDaysDiffFromToday } from '../utils/dateUtils';

interface ProgrammeListProps {
  programmes: Programme[];
  currentFilter: FilterTab;
  onFilterChange: (filter: FilterTab) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onToggleMaterial: (programmeId: string, milestoneId: string, checked: boolean) => void;
  onToggleInvoice: (programmeId: string, milestoneId: string, checked: boolean) => void;
  onMarkAsPaid: (programmeId: string, milestoneId: string) => void;
  onDeleteProgramme: (programmeId: string) => void;
  onEditProgramme: (programme: Programme) => void;
  tabCounts: {
    all: number;
    due7: number;
    awaiting: number;
    paid: number;
  };
}

export const ProgrammeList: React.FC<ProgrammeListProps> = ({
  programmes,
  currentFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  onToggleMaterial,
  onToggleInvoice,
  onMarkAsPaid,
  onDeleteProgramme,
  onEditProgramme,
  tabCounts,
}) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Search, Filter & Content Controls Bar */}
      <section className="bg-[#0b1c30] p-3 rounded-xl border border-[#1b2b3f] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => onFilterChange('all')}
            className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-all ${
              currentFilter === 'all'
                ? 'bg-[#adc6ff] text-[#002e6a] shadow-xs'
                : 'text-[#c2c6d6] hover:text-[#d3e4fe] hover:bg-[#1b2b3f]'
            }`}
          >
            All Programmes ({tabCounts.all})
          </button>

          <button
            type="button"
            onClick={() => onFilterChange('due7')}
            className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-all ${
              currentFilter === 'due7'
                ? 'bg-amber-400 text-amber-950 font-bold shadow-xs'
                : 'text-[#c2c6d6] hover:text-[#d3e4fe] hover:bg-[#1b2b3f]'
            }`}
          >
            Pending Payment (≤ 7 Days) ({tabCounts.due7})
          </button>

          <button
            type="button"
            onClick={() => onFilterChange('awaiting')}
            className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-all ${
              currentFilter === 'awaiting'
                ? 'bg-[#adc6ff] text-[#002e6a] shadow-xs'
                : 'text-[#c2c6d6] hover:text-[#d3e4fe] hover:bg-[#1b2b3f]'
            }`}
          >
            Awaiting Deliverables ({tabCounts.awaiting})
          </button>

          <button
            type="button"
            onClick={() => onFilterChange('paid')}
            className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-all ${
              currentFilter === 'paid'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                : 'text-[#c2c6d6] hover:text-[#d3e4fe] hover:bg-[#1b2b3f]'
            }`}
          >
            Fully Settled ({tabCounts.paid})
          </button>
        </div>

        {/* Search Input Box */}
        <div className="flex items-center gap-2 w-full md:w-80 shrink-0">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-[#8c909f]" />
            <input
              type="text"
              id="search-programme-input"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search programme or vendor..."
              className="w-full h-9 pl-9 pr-3 bg-[#000f21] text-[#d3e4fe] placeholder:text-[#8c909f] text-xs rounded border border-[#1b2b3f] outline-none focus:border-[#4d8eff] focus:bg-[#102034] transition-all"
            />
          </div>
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="h-9 px-2 bg-[#000f21] border border-[#1b2b3f] text-[#8c909f] hover:text-[#d3e4fe] rounded flex items-center justify-center transition-colors"
              title="Clear Search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </section>

      {/* Programme Master List */}
      <section className="flex flex-col gap-5">
        {programmes.length === 0 ? (
          <div className="bg-[#102034] border border-[#1b2b3f] p-12 rounded-xl text-center flex flex-col items-center justify-center gap-3 text-[#8c909f]">
            <FolderX className="w-12 h-12 text-[#424754]" />
            <span className="text-base font-semibold text-[#d3e4fe]">
              No Programmes Found
            </span>
            <p className="text-xs text-[#8c909f] max-w-md">
              There are no rights agreements matching your current filter criteria or search keyword. Try clearing filters or load sample data.
            </p>
          </div>
        ) : (
          programmes.map((prog) => {
            const totalAmt = Number(prog.totalAmount) || 0;
            const paidAmt = prog.milestones.reduce(
              (acc, m) => acc + (m.paid ? Number(m.amount) : 0),
              0
            );
            const progressPercent = totalAmt > 0 ? Math.round((paidAmt / totalAmt) * 100) : 0;
            const isComplete = prog.milestones.every((m) => m.paid);

            return (
              <div
                key={prog.id}
                className="bg-[#102034] rounded-xl border border-[#1b2b3f] shadow-sm overflow-hidden flex flex-col transition-all hover:border-[#334155]"
              >
                {/* Programme Header Row */}
                <div className="p-4 lg:p-5 bg-[#1b2b3f]/60 border-b border-[#1b2b3f] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          isComplete
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-[#4d8eff]/20 text-[#adc6ff] border border-[#4d8eff]/30'
                        }`}
                      >
                        {isComplete ? '100% Settled' : 'Active Pipeline'}
                      </span>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8c909f]">
                        {prog.vendor}
                      </span>
                      {prog.contractRef && (
                        <span className="text-[10px] px-1.5 py-0.2 bg-[#000f21] text-[#8c909f] rounded border border-[#1b2b3f]">
                          Ref: {prog.contractRef}
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold text-[#d3e4fe] tracking-tight leading-snug">
                      {prog.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-[#c2c6d6] text-xs">
                      <span className="flex items-center gap-1.5 bg-[#000f21] px-2 py-0.5 rounded border border-[#1b2b3f] text-[#adc6ff]">
                        <FileSignature className="w-3.5 h-3.5 text-[#4d8eff]" />
                        <span>Signed: <strong className="text-[#d3e4fe]">{prog.agreementSignDate || prog.createdAt}</strong></span>
                      </span>
                      <span className="text-[#424754]">·</span>
                      <span className="flex items-center gap-1.5">
                        <Receipt className="w-3.5 h-3.5 text-[#8c909f]" />
                        <span>Terms: {prog.termsLabel || prog.termKey}</span>
                      </span>
                      <span className="text-[#424754]">·</span>
                      <span className="flex items-center gap-1.5 tabular-nums">
                        <Wallet className="w-3.5 h-3.5 text-[#8c909f]" />
                        <span>
                          Total: <strong className="text-[#d3e4fe] font-semibold">{formatUSD(totalAmt)}</strong>
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Header Right Progress Bar & Actions */}
                  <div className="flex items-center justify-between lg:justify-end gap-6 shrink-0">
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8c909f]">
                        Disbursement Progress
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-28 sm:w-36 h-2 rounded-full bg-[#000f21] overflow-hidden border border-[#1b2b3f]">
                          <div
                            className={`h-full transition-all duration-500 ${
                              isComplete ? 'bg-emerald-400' : 'bg-[#4d8eff]'
                            }`}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold tabular-nums text-[#d3e4fe]">
                          {progressPercent}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onEditProgramme(prog)}
                        className="h-8 w-8 rounded bg-[#000f21] text-[#8c909f] hover:text-[#adc6ff] hover:bg-[#1b2b3f] border border-[#1b2b3f] flex items-center justify-center transition-colors"
                        title="Edit Programme Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteProgramme(prog.id)}
                        className="h-8 w-8 rounded bg-[#000f21] text-[#8c909f] hover:text-red-400 hover:bg-red-950/20 border border-[#1b2b3f] flex items-center justify-center transition-colors"
                        title="Delete Programme"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Milestones Sub-Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#000f21] text-[#8c909f] text-[11px] font-semibold uppercase tracking-wider border-b border-[#1b2b3f]">
                        <th className="py-2.5 px-4 lg:px-6">Milestone Phase</th>
                        <th className="py-2.5 px-4 text-right">Milestone Amount</th>
                        <th className="py-2.5 px-4 text-center">Deliverables Verification</th>
                        <th className="py-2.5 px-4">SLA Payment Status</th>
                        <th className="py-2.5 px-4 lg:px-6 text-right">Settlement Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1b2b3f]/60">
                      {prog.milestones.map((m) => {
                        const isPaid = m.paid;
                        const bothReceived = m.materialReceived && m.invoiceReceived;
                        const isPending = !isPaid && bothReceived;
                        const daysLeft = isPending ? getDaysDiffFromToday(m.dueDate) : null;

                        let statusBadge = null;

                        if (isPaid) {
                          statusBadge = (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold uppercase tracking-wider">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-xs" />
                              PAID ({m.paidDate || 'Settled'})
                            </span>
                          );
                        } else if (isPending) {
                          const isUrgent = daysLeft !== null && daysLeft <= 7;
                          const isOverdue = daysLeft !== null && daysLeft < 0;

                          let badgeClass = 'bg-[#4d8eff]/20 text-[#adc6ff] border border-[#4d8eff]/40';
                          let alertText = `${daysLeft}D LEFT`;

                          if (isOverdue) {
                            badgeClass = 'bg-[#93000a] text-[#ffdad6] border border-red-500/50';
                            alertText = `${Math.abs(daysLeft!)}D OVERDUE`;
                          } else if (daysLeft === 0) {
                            badgeClass = 'bg-red-500 text-white font-bold animate-pulse border border-red-400';
                            alertText = 'DUE TODAY';
                          } else if (isUrgent) {
                            badgeClass = 'bg-amber-400/20 text-amber-300 border border-amber-500/30 animate-pulse';
                          }

                          statusBadge = (
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider ${badgeClass}`}>
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                              PENDING: DUE {m.dueDate || 'Calculated'} ({alertText})
                            </span>
                          );
                        } else {
                          statusBadge = (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1b2b3f] text-[#8c909f] border border-[#1b2b3f] text-[11px] uppercase tracking-wider">
                              <Clock className="w-3.5 h-3.5 shrink-0" />
                              Awaiting Deliverables
                            </span>
                          );
                        }

                        return (
                          <tr
                            key={m.id}
                            className="hover:bg-[#1b2b3f]/30 transition-colors"
                          >
                            {/* Phase Title & Split Allocation */}
                            <td className="py-3.5 px-4 lg:px-6">
                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-[#d3e4fe]">
                                  {m.title}
                                </span>
                                <span className="text-[11px] text-[#8c909f]">
                                  Disbursement Allocation: {m.percentage}%
                                </span>
                              </div>
                            </td>

                            {/* Milestone Amount */}
                            <td className="py-3.5 px-4 text-right tabular-nums text-xs font-semibold text-[#d3e4fe]">
                              {formatUSD(m.amount)}
                            </td>

                            {/* Verification Checkboxes */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center justify-center gap-6">
                                {/* Material Checkbox */}
                                <label className="flex flex-col items-center gap-1 cursor-pointer select-none group/check">
                                  <div className="flex items-center gap-1.5">
                                    <input
                                      type="checkbox"
                                      checked={m.materialReceived}
                                      disabled={isPaid}
                                      onChange={(e) =>
                                        onToggleMaterial(prog.id, m.id, e.target.checked)
                                      }
                                      className="w-4 h-4 rounded bg-[#000f21] border-[#334155] text-[#4d8eff] focus:ring-0 cursor-pointer accent-[#4d8eff] disabled:opacity-40"
                                    />
                                    <span
                                      className={`text-[11px] font-semibold ${
                                        m.materialReceived
                                          ? 'text-[#adc6ff]'
                                          : 'text-[#8c909f] group-hover/check:text-[#d3e4fe]'
                                      }`}
                                    >
                                      Material
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-[#8c909f] max-w-[85px] truncate">
                                    {m.materialReceived ? (m.materialDate || 'Recorded') : 'Not Received'}
                                  </span>
                                </label>

                                {/* Invoice Checkbox */}
                                <label className="flex flex-col items-center gap-1 cursor-pointer select-none group/check">
                                  <div className="flex items-center gap-1.5">
                                    <input
                                      type="checkbox"
                                      checked={m.invoiceReceived}
                                      disabled={isPaid}
                                      onChange={(e) =>
                                        onToggleInvoice(prog.id, m.id, e.target.checked)
                                      }
                                      className="w-4 h-4 rounded bg-[#000f21] border-[#334155] text-[#4d8eff] focus:ring-0 cursor-pointer accent-[#4d8eff] disabled:opacity-40"
                                    />
                                    <span
                                      className={`text-[11px] font-semibold ${
                                        m.invoiceReceived
                                          ? 'text-[#adc6ff]'
                                          : 'text-[#8c909f] group-hover/check:text-[#d3e4fe]'
                                      }`}
                                    >
                                      Invoice
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-[#8c909f] max-w-[85px] truncate">
                                    {m.invoiceReceived ? (m.invoiceDate || 'Recorded') : 'Not Received'}
                                  </span>
                                </label>
                              </div>
                            </td>

                            {/* SLA Payment Status */}
                            <td className="py-3.5 px-4">{statusBadge}</td>

                            {/* Settlement Action */}
                            <td className="py-3.5 px-4 lg:px-6 text-right">
                              {isPaid ? (
                                <span className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
                                  <Check className="w-4 h-4" />
                                  <span>Settled</span>
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  disabled={!isPending}
                                  onClick={() => onMarkAsPaid(prog.id, m.id)}
                                  className={`h-8 px-3.5 rounded text-xs font-semibold transition-all ${
                                    isPending
                                      ? 'bg-[#4d8eff] text-[#00285d] hover:bg-[#adc6ff] shadow-xs active:scale-95'
                                      : 'bg-[#1b2b3f] text-[#8c909f] cursor-not-allowed opacity-40'
                                  }`}
                                  title={
                                    isPending
                                      ? 'Mark this milestone disbursement as settled'
                                      : 'Awaiting both material delivery & invoice verification before settlement'
                                  }
                                >
                                  Mark as Paid
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
};
