import React from 'react';
import { Film, AlertTriangle, Package, CheckCircle2 } from 'lucide-react';
import { formatUSD } from '../utils/dateUtils';

interface MetricCardsProps {
  activeCount: number;
  totalVolume: number;
  urgentDueCount: number;
  immediateCashOutlay: number;
  pendingDeliverablesCount: number;
  totalPaidAmount: number;
  settledMilestonesCount: number;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  activeCount,
  totalVolume,
  urgentDueCount,
  immediateCashOutlay,
  pendingDeliverablesCount,
  totalPaidAmount,
  settledMilestonesCount,
}) => {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* 1. Active Programmes */}
      <div className="bg-[#102034] p-5 rounded-xl border border-[#1b2b3f] shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-[#334155] transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8c909f]">
            Active Programmes
          </span>
          <Film className="w-5 h-5 text-[#8c909f] group-hover:text-[#adc6ff] transition-colors" />
        </div>
        <div className="my-3 flex items-baseline gap-2">
          <span className="text-3xl lg:text-4xl font-semibold tabular-nums text-[#d3e4fe] tracking-tight">
            {activeCount}
          </span>
          <span className="text-xs text-[#bec6e0]">Contracts active</span>
        </div>
        <div className="flex items-center justify-between text-xs text-[#8c909f] pt-1 bg-[#000f21]/60 px-3 py-1.5 rounded border border-[#1b2b3f]/50">
          <span>Portfolio Volume:</span>
          <span className="tabular-nums font-semibold text-[#d3e4fe]">
            {formatUSD(totalVolume)}
          </span>
        </div>
      </div>

      {/* 2. Payments Due <= 7 Days (Critical SLA) */}
      <div className="bg-gradient-to-br from-[#102034] via-[#102034] to-amber-950/25 p-5 rounded-xl border border-amber-500/30 shadow-xs flex flex-col justify-between relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_#f59e0b]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
              Payments Due ≤ 7 Days
            </span>
          </div>
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
        </div>
        <div className="my-3 flex items-baseline gap-2">
          <span className="text-3xl lg:text-4xl font-semibold tabular-nums text-amber-400 tracking-tight">
            {urgentDueCount}
          </span>
          <span className="text-xs text-amber-200/80">Urgent SLA windows</span>
        </div>
        <div className="flex items-center justify-between text-xs text-[#8c909f] pt-1 bg-[#000f21]/60 px-3 py-1.5 rounded border border-amber-500/20">
          <span>Immediate Cash Outlay:</span>
          <span className="tabular-nums font-bold text-amber-300">
            {formatUSD(immediateCashOutlay)}
          </span>
        </div>
      </div>

      {/* 3. Pending Deliverables */}
      <div className="bg-[#102034] p-5 rounded-xl border border-[#1b2b3f] shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-[#334155] transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8c909f]">
            Pending Deliverables
          </span>
          <Package className="w-5 h-5 text-[#8c909f] group-hover:text-[#c0c1ff] transition-colors" />
        </div>
        <div className="my-3 flex items-baseline gap-2">
          <span className="text-3xl lg:text-4xl font-semibold tabular-nums text-[#c0c1ff] tracking-tight">
            {pendingDeliverablesCount}
          </span>
          <span className="text-xs text-[#bec6e0]">Unsatisfied stages</span>
        </div>
        <div className="flex items-center justify-between text-xs text-[#8c909f] pt-1 bg-[#000f21]/60 px-3 py-1.5 rounded border border-[#1b2b3f]/50">
          <span>Awaiting Material / Inv</span>
          <span className="text-xs font-medium text-[#4d8eff]">Tracked Daily</span>
        </div>
      </div>

      {/* 4. Disbursed To Date */}
      <div className="bg-[#102034] p-5 rounded-xl border border-[#1b2b3f] shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-[#334155] transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8c909f]">
            Disbursed To Date
          </span>
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        </div>
        <div className="my-3 flex items-baseline gap-2">
          <span className="text-3xl lg:text-4xl font-semibold tabular-nums text-emerald-400 tracking-tight">
            {formatUSD(totalPaidAmount)}
          </span>
          <span className="text-xs text-[#bec6e0]">Settled</span>
        </div>
        <div className="flex items-center justify-between text-xs text-[#8c909f] pt-1 bg-[#000f21]/60 px-3 py-1.5 rounded border border-[#1b2b3f]/50">
          <span>Settled Milestones:</span>
          <span className="tabular-nums font-semibold text-emerald-300">
            {settledMilestonesCount} Stages
          </span>
        </div>
      </div>
    </section>
  );
};
