import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Copy,
  Check,
  ExternalLink,
  X,
  FileText,
  Calendar,
  Building2,
  AlertTriangle,
} from 'lucide-react';
import { Programme } from '../types';
import { getDaysDiffFromToday } from '../utils/dateUtils';

interface GoogleSheetsReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  programmes: Programme[];
  onShowToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

type ReportType = 'all' | 'urgent7' | 'vendor_summary';

export const GoogleSheetsReportModal: React.FC<GoogleSheetsReportModalProps> = ({
  isOpen,
  onClose,
  programmes,
  onShowToast,
}) => {
  const [reportType, setReportType] = useState<ReportType>('all');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  // Generate rows based on report type
  const generateData = (): { headers: string[]; rows: (string | number)[][] } => {
    if (reportType === 'vendor_summary') {
      const vendorMap = new Map<
        string,
        {
          contractsCount: number;
          totalContractValue: number;
          totalPaid: number;
          pendingDue: number;
          programmes: string[];
        }
      >();

      programmes.forEach((p) => {
        const vendor = p.vendor || 'Unknown Vendor';
        const current = vendorMap.get(vendor) || {
          contractsCount: 0,
          totalContractValue: 0,
          totalPaid: 0,
          pendingDue: 0,
          programmes: [],
        };

        current.contractsCount += 1;
        current.totalContractValue += p.totalAmount || 0;
        current.programmes.push(p.title);

        p.milestones.forEach((m) => {
          if (m.paid) {
            current.totalPaid += m.amount;
          } else if (m.materialReceived && m.invoiceReceived) {
            current.pendingDue += m.amount;
          }
        });

        vendorMap.set(vendor, current);
      });

      const headers = [
        'Distributor / Vendor',
        'Total Contracts',
        'Programmes Licensed',
        'Total Contract Value (RM)',
        'Settled / Paid (RM)',
        'Pending Due (RM)',
        'Remaining Balance (RM)',
      ];

      const rows: (string | number)[][] = [];
      vendorMap.forEach((val, vendor) => {
        const remaining = Math.max(0, val.totalContractValue - val.totalPaid);
        rows.push([
          vendor,
          val.contractsCount,
          val.programmes.join(', '),
          val.totalContractValue.toFixed(2),
          val.totalPaid.toFixed(2),
          val.pendingDue.toFixed(2),
          remaining.toFixed(2),
        ]);
      });

      return { headers, rows };
    }

    if (reportType === 'urgent7') {
      const headers = [
        'Contract Ref',
        'Programme Title',
        'Agreement Sign Date',
        'Distributor / Vendor',
        'Milestone Phase',
        'Milestone %',
        'Disbursement Amount (RM)',
        'Days Left (SLA)',
        'Payment Due Date',
        'Material Verified',
        'Invoice Verified',
        'Status',
      ];

      const rows: (string | number)[][] = [];

      programmes.forEach((p) => {
        p.milestones.forEach((m) => {
          if (!m.paid && m.materialReceived && m.invoiceReceived && m.dueDate) {
            const daysLeft = getDaysDiffFromToday(m.dueDate);
            if (daysLeft !== null && daysLeft <= 7) {
              const status =
                daysLeft < 0
                  ? 'OVERDUE'
                  : daysLeft <= 2
                  ? 'CRITICAL (<48H)'
                  : 'URGENT (<7 DAYS)';

              rows.push([
                p.contractRef || '—',
                p.title,
                p.agreementSignDate || p.createdAt,
                p.vendor,
                m.title,
                `${m.percentage}%`,
                m.amount.toFixed(2),
                daysLeft,
                m.dueDate || '—',
                m.materialReceived ? 'YES' : 'NO',
                m.invoiceReceived ? 'YES' : 'NO',
                status,
              ]);
            }
          }
        });
      });

      return { headers, rows };
    }

    // Default: Full Portfolio & Milestones Breakdown
    const headers = [
      'Contract Ref',
      'Programme Title',
      'Agreement Sign Date',
      'Distributor / Vendor',
      'Rights Scope',
      'Total Value (RM)',
      'Milestone #',
      'Milestone Phase',
      'Percentage (%)',
      'Amount (RM)',
      'Material Received',
      'Invoice Received',
      'Payment Due Date',
      'Settlement Status',
      'Payment Date',
      'Notes',
    ];

    const rows: (string | number)[][] = [];

    programmes.forEach((p) => {
      p.milestones.forEach((m, idx) => {
        let status = 'Pending Delivery/Invoice';
        if (m.paid) {
          status = 'PAID & SETTLED';
        } else if (m.materialReceived && m.invoiceReceived) {
          const dl = getDaysDiffFromToday(m.dueDate);
          if (dl !== null && dl < 0) {
            status = 'OVERDUE';
          } else if (dl !== null && dl <= 2) {
            status = 'CRITICAL (<48H)';
          } else {
            status = 'SLA 7-DAY WINDOW ACTIVE';
          }
        }

        rows.push([
          p.contractRef || '—',
          p.title,
          p.agreementSignDate || p.createdAt,
          p.vendor,
          p.rightsType || 'Linear & Digital',
          p.totalAmount.toFixed(2),
          `M${idx + 1}`,
          m.title,
          m.percentage,
          m.amount.toFixed(2),
          m.materialReceived ? 'YES' : 'NO',
          m.invoiceReceived ? 'YES' : 'NO',
          m.dueDate || 'Pending SLA Trigger',
          status,
          m.paidDate || '—',
          m.notes || '—',
        ]);
      });
    });

    return { headers, rows };
  };

  // Convert to CSV with escaping and UTF-8 BOM
  const generateCSV = (): string => {
    const { headers, rows } = generateData();
    const escapeCell = (val: string | number) => {
      const str = String(val ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headerLine = headers.map(escapeCell).join(',');
    const rowLines = rows.map((r) => r.map(escapeCell).join(','));
    return '\uFEFF' + [headerLine, ...rowLines].join('\r\n');
  };

  // Convert to TSV (Tab-separated) for instant clipboard paste into Google Sheets
  const generateTSV = (): string => {
    const { headers, rows } = generateData();
    const headerLine = headers.join('\t');
    const rowLines = rows.map((r) => r.join('\t'));
    return [headerLine, ...rowLines].join('\n');
  };

  const handleDownloadCSV = () => {
    const csvContent = generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `PayTrack_Report_${reportType}_${dateStr}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onShowToast(`Laporan format Google Sheets (${filename}) berjaya dimuat turun!`, 'success');
  };

  const handleCopyToClipboard = async () => {
    try {
      const tsvContent = generateTSV();
      await navigator.clipboard.writeText(tsvContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      onShowToast('Data disalin ke papan klip! Buka Google Sheets dan tekan Ctrl+V untuk tampal.', 'success');
    } catch {
      onShowToast('Gagal menyalin data ke papan klip.', 'error');
    }
  };

  const handleOpenGoogleSheets = () => {
    window.open('https://sheets.new', '_blank', 'noopener,noreferrer');
  };

  const { rows } = generateData();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#102034] border border-[#1b2b3f] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#1b2b3f] flex items-center justify-between bg-[#0b1c30]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-[#d3e4fe]">
                  Jana Laporan Format Google Sheets
                </h3>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                  Sheets Ready
                </span>
              </div>
              <p className="text-xs text-[#8c909f]">
                Eksport data lejar pembayaran, komitmen tertunggak & status SLA terus ke Google Sheets
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#1b2b3f] hover:bg-[#26364a] text-[#8c909f] hover:text-[#d3e4fe] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex flex-col gap-6 overflow-y-auto">
          {/* Pilih Jenis Laporan */}
          <div className="flex flex-col gap-2.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#8c909f]">
              Pilih Jenis Laporan (*Report Template*)
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option 1: Full Ledger */}
              <button
                type="button"
                onClick={() => setReportType('all')}
                className={`p-3.5 rounded-xl border text-left flex flex-col gap-2 transition-all ${
                  reportType === 'all'
                    ? 'bg-[#4d8eff]/15 border-[#4d8eff] shadow-xs'
                    : 'bg-[#000f21] border-[#1b2b3f] hover:border-[#334155]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <FileText className={`w-4 h-4 ${reportType === 'all' ? 'text-[#adc6ff]' : 'text-[#8c909f]'}`} />
                  {reportType === 'all' && <Check className="w-3.5 h-3.5 text-[#adc6ff]" />}
                </div>
                <div>
                  <span className="text-xs font-bold text-[#d3e4fe] block">
                    Full Portfolio Ledger
                  </span>
                  <span className="text-[11px] text-[#8c909f] leading-snug">
                    Pecahan lengkap semua kontrak & milestone
                  </span>
                </div>
              </button>

              {/* Option 2: 7-Day Urgent Outlay */}
              <button
                type="button"
                onClick={() => setReportType('urgent7')}
                className={`p-3.5 rounded-xl border text-left flex flex-col gap-2 transition-all ${
                  reportType === 'urgent7'
                    ? 'bg-amber-500/15 border-amber-500 shadow-xs'
                    : 'bg-[#000f21] border-[#1b2b3f] hover:border-[#334155]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <AlertTriangle className={`w-4 h-4 ${reportType === 'urgent7' ? 'text-amber-400' : 'text-[#8c909f]'}`} />
                  {reportType === 'urgent7' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </div>
                <div>
                  <span className="text-xs font-bold text-[#d3e4fe] block">
                    7-Day Urgent Outlay
                  </span>
                  <span className="text-[11px] text-[#8c909f] leading-snug">
                    Jadual pembayaran kritikal dalam tempoh 7 hari
                  </span>
                </div>
              </button>

              {/* Option 3: Vendor Summary */}
              <button
                type="button"
                onClick={() => setReportType('vendor_summary')}
                className={`p-3.5 rounded-xl border text-left flex flex-col gap-2 transition-all ${
                  reportType === 'vendor_summary'
                    ? 'bg-emerald-500/15 border-emerald-500 shadow-xs'
                    : 'bg-[#000f21] border-[#1b2b3f] hover:border-[#334155]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Building2 className={`w-4 h-4 ${reportType === 'vendor_summary' ? 'text-emerald-400' : 'text-[#8c909f]'}`} />
                  {reportType === 'vendor_summary' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div>
                  <span className="text-xs font-bold text-[#d3e4fe] block">
                    Vendor Summary
                  </span>
                  <span className="text-[11px] text-[#8c909f] leading-snug">
                    Ringkasan jumlah komitmen mengikut pengedar
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Prviu Ringkas Maklumat */}
          <div className="p-4 rounded-xl bg-[#000f21] border border-[#1b2b3f] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-[#8c909f]" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#d3e4fe]">
                  Jumlah Rekod Baris (*Rows*): {rows.length} entri
                </span>
                <span className="text-[11px] text-[#8c909f]">
                  Format fail: CSV serasi Google Sheets (UTF-8) / Papan Klip Langsung (TSV)
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenGoogleSheets}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#102034] hover:bg-[#1b2b3f] text-[#adc6ff] rounded-lg text-xs font-semibold border border-[#1b2b3f] transition-colors"
              title="Buka Google Sheets di tab baharu"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka Google Sheets</span>
            </button>
          </div>

          {/* Arahan Pantas Import Google Sheets */}
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col gap-2">
            <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4" />
              2 Cara Mudah Membuka Laporan dalam Google Sheets:
            </span>
            <ol className="text-xs text-[#c2c6d6] list-decimal list-inside space-y-1.5 leading-relaxed">
              <li>
                <strong className="text-white">Cara 1 (Salin & Tampal):</strong> Klik butang <em>&quot;Salin untuk Google Sheets&quot;</em> di bawah, buka lembaran di <code>sheets.new</code>, dan tekan <code>Ctrl + V</code> (atau <code>Cmd + V</code>).
              </li>
              <li>
                <strong className="text-white">Cara 2 (Muat Turun Fail):</strong> Klik <em>&quot;Muat Turun Fail CSV&quot;</em>, kemudian di Google Sheets pilih <strong>File → Import → Upload</strong>.
              </li>
            </ol>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 bg-[#0b1c30] border-t border-[#1b2b3f] flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#1b2b3f] hover:bg-[#26364a] text-xs font-semibold text-[#d3e4fe] transition-colors"
          >
            Tutup
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* Salin ke Papan Klip */}
            <button
              type="button"
              onClick={handleCopyToClipboard}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#1b2b3f] hover:bg-[#26364a] text-xs font-bold text-[#d3e4fe] border border-[#334155] transition-colors active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Disalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#adc6ff]" />
                  <span>Salin untuk Google Sheets</span>
                </>
              )}
            </button>

            {/* Muat Turun Fail CSV */}
            <button
              type="button"
              onClick={handleDownloadCSV}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Muat Turun CSV (Google Sheets)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
