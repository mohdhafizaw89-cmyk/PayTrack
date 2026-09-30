import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  FileCheck2,
  Receipt,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';
import { UrgentMilestoneItem } from '../types';
import { formatUSD } from '../utils/dateUtils';

interface UrgentAlertsProps {
  urgentItems: UrgentMilestoneItem[];
  onMarkAsPaid: (programmeId: string, milestoneId: string) => void;
}

export const UrgentAlerts: React.FC<UrgentAlertsProps> = ({
  urgentItems,
  onMarkAsPaid,
}) => {
  return (
    <section className="flex flex-col gap-3">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="absolute w-4 h-4 rounded-full bg-amber-400/40 animate-ping" />
          </div>
          <h2 className="text-base font-semibold text-[#d3e4fe] flex items-center gap-2 flex-wrap">
            Executive Urgent Milestones
            <span className="text-xs font-normal text-[#8c909f]">
              (Both Material & Invoice Verified)
            </span>
          </h2>
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8c909f] self-start sm:self-auto px-2 py-0.5 rounded bg-[#102034] border border-[#1b2b3f]">
          Automated 7-Day Protocol
        </span>
      </div>

      {/* Alert Cards Container */}
      {urgentItems.length === 0 ? (
        <div className="bg-[#102034]/70 border border-[#1b2b3f] p-6 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[#c2c6d6]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#d3e4fe]">
                No Payments Due Within Next 7 Days
              </h4>
              <p className="text-xs text-[#8c909f]">
                All completed deliverables are settled or awaiting verification packages.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-[#000f21] text-emerald-400 border border-emerald-500/20 rounded text-[11px] uppercase font-bold tracking-wider">
            SLA Compliant
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {urgentItems.map((item) => {
            const { programmeId, programmeTitle, vendor, milestone, daysLeft, dueDate } = item;

            let badgeColor = 'bg-amber-400/20 text-amber-300 border border-amber-500/30';
            let badgeText = `DUE IN ${daysLeft} DAYS`;
            let cardGlow = 'bg-gradient-to-br from-[#102034] via-[#102034] to-amber-950/30 border-amber-500/30';

            if (daysLeft < 0) {
              badgeColor = 'bg-[#93000a] text-[#ffdad6] border border-red-500/40';
              badgeText = `${Math.abs(daysLeft)}D OVERDUE`;
              cardGlow = 'bg-gradient-to-br from-[#102034] via-[#102034] to-rose-950/40 border-red-500/40';
            } else if (daysLeft === 0) {
              badgeColor = 'bg-red-500 text-white font-bold animate-pulse border border-red-400';
              badgeText = 'DUE TODAY';
              cardGlow = 'bg-gradient-to-br from-[#102034] via-[#102034] to-rose-950/40 border-red-500/50';
            }

            return (
              <div
                key={`${programmeId}_${milestone.id}`}
                className={`p-5 rounded-xl border shadow-sm ${cardGlow} flex flex-col justify-between gap-4 transition-all hover:shadow-md`}
              >
                {/* Card Header */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8c909f] truncate">
                      {vendor}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider shrink-0 ${badgeColor}`}>
                      {badgeText}
                    </span>
                  </div>

                  <h4
                    className="text-base font-semibold text-[#d3e4fe] truncate leading-snug"
                    title={programmeTitle}
                  >
                    {programmeTitle}
                  </h4>

                  <div className="text-xs text-[#c2c6d6] flex items-center gap-1.5">
                    <FileCheck2 className="w-3.5 h-3.5 text-[#4d8eff] shrink-0" />
                    <span className="truncate">{milestone.title}</span>
                  </div>
                </div>

                {/* Financial Figure Box */}
                <div className="flex items-baseline justify-between pt-1 bg-[#000f21]/70 px-3 py-2 rounded border border-[#1b2b3f]/60">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-semibold text-[#8c909f] tracking-wider">
                      Remittance Due
                    </span>
                    <span className="text-xl font-bold tabular-nums text-amber-300">
                      {formatUSD(milestone.amount)}
                    </span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] uppercase font-semibold text-[#8c909f] tracking-wider">
                      Deadline
                    </span>
                    <span className="text-xs font-semibold tabular-nums text-[#d3e4fe]">
                      {dueDate}
                    </span>
                  </div>
                </div>

                {/* Receipt Verification Stamps */}
                <div className="grid grid-cols-2 gap-2 text-xs text-[#8c909f]">
                  <div className="flex items-center gap-1.5 bg-[#1b2b3f]/40 px-2 py-1 rounded border border-[#1b2b3f]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate text-[11px]">
                      Mat: {milestone.materialDate || 'VERIFIED'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-[#1b2b3f]/40 px-2 py-1 rounded border border-[#1b2b3f]">
                    <Receipt className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate text-[11px]">
                      Inv: {milestone.invoiceDate || 'VERIFIED'}
                    </span>
                  </div>
                </div>

                {/* Instant Action CTA */}
                <button
                  type="button"
                  onClick={() => onMarkAsPaid(programmeId, milestone.id)}
                  className="w-full h-9 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Mark as Paid Now</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
