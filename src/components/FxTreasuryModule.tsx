import React, { useState } from 'react';
import {
  ArrowLeftRight,
  Calculator,
  RefreshCw,
  Building2,
  DollarSign,
} from 'lucide-react';
import { Programme } from '../types';
import { formatRM } from '../utils/dateUtils';

interface FxTreasuryModuleProps {
  programmes: Programme[];
  totalVolumeUSD: number;
  immediateOutlayUSD: number;
  totalPaidAmountUSD: number;
  onReturnToPipeline: () => void;
}

type SupportedCurrency = 'USD' | 'RM';

const BENCHMARK_USD_TO_MYR = 4.45;

export const FxTreasuryModule: React.FC<FxTreasuryModuleProps> = ({
  programmes,
  totalVolumeUSD: totalVolumeRM,
  immediateOutlayUSD: immediateOutlayRM,
  totalPaidAmountUSD: totalPaidAmountRM,
  onReturnToPipeline,
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState<SupportedCurrency>('USD');
  const [rateInRM, setRateInRM] = useState<number>(BENCHMARK_USD_TO_MYR);

  const handleRateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setRateInRM(isNaN(val) ? 0 : val);
  };

  const resetToDefaultRate = () => {
    setRateInRM(BENCHMARK_USD_TO_MYR);
  };

  // Convert RM to USD: Amount in USD = Amount in RM / Rate
  const convertRMToUSD = (amountRM: number): number => {
    if (!rateInRM || rateInRM <= 0) return 0;
    return amountRM / rateInRM;
  };

  const formatUSDVal = (amountUSD: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(amountUSD);
  };

  const formatActiveCurrency = (amountRM: number): string => {
    if (selectedCurrency === 'USD') {
      return formatUSDVal(convertRMToUSD(amountRM));
    }
    return formatRM(amountRM);
  };

  const formatSecondaryCurrency = (amountRM: number): string => {
    if (selectedCurrency === 'USD') {
      return formatRM(amountRM);
    }
    return formatUSDVal(convertRMToUSD(amountRM));
  };

  const totalOutstandingsRM = Math.max(0, totalVolumeRM - totalPaidAmountRM);

  return (
    <section className="bg-[#102034] p-5 sm:p-6 rounded-xl border border-[#1b2b3f] shadow-sm flex flex-col gap-6 animate-in fade-in duration-200">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1b2b3f]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-[#4d8eff]/20 text-[#adc6ff] flex items-center justify-center border border-[#4d8eff]/30">
            <ArrowLeftRight className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-[#d3e4fe]">
                FX & Treasury Audit Console
              </h2>
              <span className="px-2 py-0.5 rounded bg-[#000f21] text-[#adc6ff] text-[10px] font-bold uppercase tracking-wider border border-[#1b2b3f]">
                RM ⟷ USD
              </span>
            </div>
            <p className="text-xs text-[#8c909f]">
              Convert and calculate total TV programme commitments between Ringgit Malaysia (RM) and US Dollar (USD)
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onReturnToPipeline}
          className="self-start sm:self-auto px-3.5 py-1.5 rounded bg-[#1b2b3f] hover:bg-[#26364a] text-xs font-semibold text-[#d3e4fe] transition-colors border border-[#334155] shadow-xs"
        >
          ← Return to Payment Pipeline
        </button>
      </div>

      {/* Currency Switcher & Exchange Rate Control Card */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#000f21] border border-[#1b2b3f] flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left: 2-way RM & USD Toggle */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8c909f] flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-[#adc6ff]" />
            Active Display Currency (Toggle RM / USD)
          </label>
          <div className="inline-flex items-center p-1 bg-[#102034] rounded-lg border border-[#1b2b3f] w-fit">
            <button
              type="button"
              onClick={() => setSelectedCurrency('RM')}
              className={`px-4 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedCurrency === 'RM'
                  ? 'bg-emerald-500 text-slate-950 shadow-xs'
                  : 'text-[#c2c6d6] hover:text-[#d3e4fe]'
              }`}
            >
              <span>RM (Ringgit Malaysia)</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCurrency('USD')}
              className={`px-4 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedCurrency === 'USD'
                  ? 'bg-[#4d8eff] text-[#00285d] shadow-xs'
                  : 'text-[#c2c6d6] hover:text-[#d3e4fe]'
              }`}
            >
              <span>USD ($)</span>
            </button>
          </div>
        </div>

        {/* Right: Manual Exchange Rate Input */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="fx-rate-input"
                className="text-[11px] font-semibold uppercase tracking-wider text-[#8c909f] flex items-center gap-1.5"
              >
                <Calculator className="w-3.5 h-3.5 text-amber-400" />
                Manual Exchange Rate (1 USD = RM)
              </label>
              <span className="text-[10px] text-[#adc6ff] font-mono">
                Benchmark: 4.45
              </span>
            </div>

            <div className="relative flex items-center">
              <span className="absolute left-3 text-xs font-semibold text-[#8c909f]">
                1 USD =
              </span>
              <input
                id="fx-rate-input"
                type="number"
                step="0.01"
                min="0.01"
                value={rateInRM || ''}
                onChange={handleRateInputChange}
                placeholder="4.45"
                className="h-9 w-48 pl-16 pr-12 bg-[#102034] text-[#d3e4fe] font-mono text-xs font-bold rounded border border-[#1b2b3f] focus:border-[#4d8eff] focus:bg-[#1b2b3f] outline-none transition-colors"
              />
              <span className="absolute right-3 text-xs font-bold text-emerald-400">
                RM
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={resetToDefaultRate}
            className="h-9 px-3 bg-[#102034] hover:bg-[#1b2b3f] border border-[#1b2b3f] text-[#8c909f] hover:text-[#d3e4fe] rounded text-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            title="Reset to benchmark treasury rate (1 USD = RM 4.45)"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Benchmark Rate</span>
          </button>
        </div>
      </div>

      {/* Primary Financial Metric Display Cards (RM & USD) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Total Portfolio Exposure */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-[#0b1c30] to-[#102034] border border-[#4d8eff]/30 shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8c909f]">
              Total Portfolio Exposure
            </span>
            <span className="px-2 py-0.5 rounded bg-[#4d8eff]/20 text-[#adc6ff] text-[10px] font-bold">
              {selectedCurrency}
            </span>
          </div>

          <div>
            <div className="text-2xl font-bold tabular-nums text-[#adc6ff]">
              {formatActiveCurrency(totalVolumeRM)}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-[#8c909f] mt-1">
              <span>{selectedCurrency === 'USD' ? 'RM Value:' : 'USD Value:'}</span>
              <strong className="text-[#d3e4fe] font-semibold">
                {formatSecondaryCurrency(totalVolumeRM)}
              </strong>
            </div>
          </div>

          <div className="text-[10px] text-[#8c909f] pt-2 border-t border-[#1b2b3f]/60 flex items-center justify-between">
            <span>Rate:</span>
            <span className="font-mono text-[#adc6ff]">1 USD = RM {rateInRM}</span>
          </div>
        </div>

        {/* Card 2: 7-Day Imminent Liquidity Requirement */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-[#0b1c30] via-[#102034] to-amber-950/20 border border-amber-500/30 shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-300">
              7-Day Imminent Outlay
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 text-[10px] font-bold">
              SLA Urgent
            </span>
          </div>

          <div>
            <div className="text-2xl font-bold tabular-nums text-amber-300">
              {formatActiveCurrency(immediateOutlayRM)}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-[#8c909f] mt-1">
              <span>{selectedCurrency === 'USD' ? 'RM Value:' : 'USD Value:'}</span>
              <strong className="text-amber-200 font-semibold">
                {formatSecondaryCurrency(immediateOutlayRM)}
              </strong>
            </div>
          </div>

          <div className="text-[10px] text-amber-200/60 pt-2 border-t border-amber-500/20 flex items-center justify-between">
            <span>Immediate treasury release</span>
            <span className="font-mono">2 Urgent Windows</span>
          </div>
        </div>

        {/* Card 3: Settled Disbursed Volume */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-[#0b1c30] to-[#102034] border border-emerald-500/30 shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-300">
              Settled Disbursements
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
              Cleared
            </span>
          </div>

          <div>
            <div className="text-2xl font-bold tabular-nums text-emerald-400">
              {formatActiveCurrency(totalPaidAmountRM)}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-[#8c909f] mt-1">
              <span>{selectedCurrency === 'USD' ? 'RM Value:' : 'USD Value:'}</span>
              <strong className="text-emerald-300 font-semibold">
                {formatSecondaryCurrency(totalPaidAmountRM)}
              </strong>
            </div>
          </div>

          <div className="text-[10px] text-emerald-200/60 pt-2 border-t border-emerald-500/20 flex items-center justify-between">
            <span>Wire transfer reconciled</span>
            <span className="font-mono">Audited</span>
          </div>
        </div>

        {/* Card 4: Outstanding Treasury Balance */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-[#0b1c30] to-[#102034] border border-[#1b2b3f] shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8c909f]">
              Remaining Outstandings
            </span>
            <span className="px-2 py-0.5 rounded bg-[#1b2b3f] text-[#d3e4fe] text-[10px] font-bold">
              Unsettled
            </span>
          </div>

          <div>
            <div className="text-2xl font-bold tabular-nums text-[#d3e4fe]">
              {formatActiveCurrency(totalOutstandingsRM)}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-[#8c909f] mt-1">
              <span>{selectedCurrency === 'USD' ? 'RM Value:' : 'USD Value:'}</span>
              <strong className="text-[#d3e4fe] font-semibold">
                {formatSecondaryCurrency(totalOutstandingsRM)}
              </strong>
            </div>
          </div>

          <div className="text-[10px] text-[#8c909f] pt-2 border-t border-[#1b2b3f]/60 flex items-center justify-between">
            <span>Future pipeline commitment</span>
            <span className="font-mono">{programmes.length} Contracts</span>
          </div>
        </div>
      </div>

      {/* Contract-by-Contract RM & USD Conversion Ledger */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#adc6ff]" />
            <h3 className="text-sm font-semibold text-[#d3e4fe]">
              Contract-by-Contract FX Conversion Ledger (RM & USD)
            </h3>
          </div>
          <span className="text-[11px] text-[#8c909f]">
            Exchange Rate: 1 USD = RM {rateInRM}
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-[#1b2b3f]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#000f21] text-[#8c909f] text-[11px] font-semibold uppercase tracking-wider border-b border-[#1b2b3f]">
                <th className="py-2.5 px-4">Programme Title</th>
                <th className="py-2.5 px-4">Distributor / Vendor</th>
                <th className="py-2.5 px-4 text-right">Contract (RM)</th>
                <th className="py-2.5 px-4 text-right bg-[#102034]/40 text-[#adc6ff]">
                  Contract (USD)
                </th>
                <th className="py-2.5 px-4 text-right text-emerald-400">
                  Settled ({selectedCurrency})
                </th>
                <th className="py-2.5 px-4 text-right text-amber-300">
                  Pending Due ({selectedCurrency})
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b2b3f]/60 bg-[#0b1c30]/70">
              {programmes.map((prog) => {
                const totalRM = prog.totalAmount || 0;
                const totalUSD = convertRMToUSD(totalRM);

                const paidRM = prog.milestones.reduce(
                  (sum, m) => sum + (m.paid ? m.amount : 0),
                  0
                );

                const pendingDueRM = prog.milestones.reduce(
                  (sum, m) =>
                    sum + (!m.paid && m.materialReceived && m.invoiceReceived ? m.amount : 0),
                  0
                );

                return (
                  <tr key={prog.id} className="hover:bg-[#102034] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-[#d3e4fe]">{prog.title}</span>
                        <span className="text-[10px] text-[#8c909f] font-mono">
                          {prog.contractRef || 'CON-ACTIVE'} • {prog.termsLabel}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#c2c6d6] font-medium">
                      {prog.vendor}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums text-[#d3e4fe] font-medium">
                      {formatRM(totalRM)}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums font-bold text-[#adc6ff] bg-[#102034]/20">
                      {formatUSDVal(totalUSD)}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums font-medium text-emerald-400">
                      {paidRM > 0 ? formatActiveCurrency(paidRM) : '—'}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums font-bold text-amber-300">
                      {pendingDueRM > 0 ? formatActiveCurrency(pendingDueRM) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-[#000f21] font-semibold text-xs border-t border-[#1b2b3f]">
                <td colSpan={2} className="py-3 px-4 text-[#d3e4fe]">
                  Total Portfolio Sum ({programmes.length} Programmes)
                </td>
                <td className="py-3 px-4 text-right tabular-nums text-[#d3e4fe]">
                  {formatRM(totalVolumeRM)}
                </td>
                <td className="py-3 px-4 text-right tabular-nums text-[#adc6ff] font-bold">
                  {formatUSDVal(convertRMToUSD(totalVolumeRM))}
                </td>
                <td className="py-3 px-4 text-right tabular-nums text-emerald-400 font-bold">
                  {formatActiveCurrency(totalPaidAmountRM)}
                </td>
                <td className="py-3 px-4 text-right tabular-nums text-amber-300 font-bold">
                  {formatActiveCurrency(immediateOutlayRM)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </section>
  );
};
