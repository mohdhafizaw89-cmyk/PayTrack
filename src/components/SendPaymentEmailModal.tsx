import React, { useState, useEffect } from 'react';
import {
  Mail,
  Send,
  Copy,
  ExternalLink,
  X,
  CheckCircle2,
  FileCheck2,
  Building2,
  DollarSign,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Programme, Milestone, EmailNotificationRecord } from '../types';
import { formatUSD, formatRM } from '../utils/dateUtils';
import {
  getNotificationEmail,
  sendPaymentDisbursementEmail,
  openMailtoDraft,
} from '../utils/emailService';
import { useAuth } from '../context/AuthContext';
import { logEmailNotificationDoc } from '../firebase/service';

interface SendPaymentEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  programme: Programme | null;
  milestone: Milestone | null;
  onShowToast: (message: string, type?: 'info' | 'success' | 'urgent') => void;
  onEmailSent?: (record: EmailNotificationRecord) => void;
}

export const SendPaymentEmailModal: React.FC<SendPaymentEmailModalProps> = ({
  isOpen,
  onClose,
  programme,
  milestone,
  onShowToast,
  onEmailSent,
}) => {
  const { user } = useAuth();
  const [recipient, setRecipient] = useState<string>('');
  const [ccEmail, setCcEmail] = useState<string>('');
  const [customNote, setCustomNote] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const defaultEmail = user?.email || getNotificationEmail() || 'finance.broadcast@mediaprima.com.my';
      setRecipient(defaultEmail);
      setCcEmail('accounts.payable@rightsflow.com');
      setCustomNote('Bayaran telah diproses dan diselesaikan mengikut klausa kontrak hak penyiaran.');
      setIsCopied(false);
    }
  }, [isOpen, user]);

  if (!isOpen || !programme || !milestone) return null;

  const formattedUSD = formatUSD(milestone.amount);
  const formattedMYR = formatRM(milestone.amount);
  const paidDate = milestone.paidDate || new Date().toISOString().split('T')[0];
  const contractRef = programme.contractRef || 'CON-MEDIA-PRIMA-2026';

  const emailSubject = `[PAYMENT CLEARED] Payment Remittance Advice: ${programme.title} - ${milestone.title} (${formattedMYR})`;

  const emailBody = `PAYMENT REMITTANCE & DISBURSEMENT ADVICE
======================================================
STATUS: PAYMENT CLEARED & SETTLED
DISPATCH DATE: ${new Date().toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur' })}
SYSTEM REF: TXN-${programme.id.slice(0, 6).toUpperCase()}-${milestone.id.slice(0, 4).toUpperCase()}

1. CONTRACT & PROGRAMME DETAILS:
------------------------------------------------------
Programme Title:       ${programme.title}
Contract Reference:    ${contractRef}
Agreement Sign Date:   ${programme.agreementSignDate || programme.createdAt}
Distributor / Vendor:  ${programme.vendor}
Rights Scope:          ${programme.rightsType || 'Linear Free-to-Air & OTT/Catch-up'}
Total Contract Value:  ${formatUSD(programme.totalAmount)} (${formatRM(programme.totalAmount)})

2. PAYMENT MILESTONE CLEARED:
------------------------------------------------------
Milestone Phase:       ${milestone.title}
Tranche Ratio:         ${milestone.percentage}%
Amount Disbursed:      ${formattedUSD} / ${formattedMYR}
Settlement Date:       ${paidDate}
Material Verification: VERIFIED & ARCHIVED
Vendor Invoice:        MATCHED & PROCESSED

3. AUDIT & REMITTANCE NOTES:
------------------------------------------------------
${customNote ? customNote : 'Payment authorized under TV Rights Acquisition Agreement SLA.'}

======================================================
Notification dispatched to: ${recipient}
CC: ${ccEmail || 'None'}
Generated via RightsFlow PayTrack Telemetry System.`;

  const handleSendAndLog = async () => {
    if (!recipient || !recipient.includes('@')) {
      onShowToast('Sila masukkan alamat emel penerima yang sah.', 'urgent');
      return;
    }

    setIsSending(true);
    try {
      const record = sendPaymentDisbursementEmail(programme, milestone, recipient);

      if (user) {
        await logEmailNotificationDoc(record, user.uid);
      }

      onEmailSent?.(record);
      onShowToast(`Notifikasi pembayaran berjaya direkod dan dihantar ke ${recipient}!`, 'success');
      onClose();
    } catch (err) {
      console.error('Error logging email notification:', err);
      onShowToast('Notifikasi direkod secara lokal. Sila semak sambungan Firebase.', 'info');
      onClose();
    } finally {
      setIsSending(false);
    }
  };

  const handleOpenMailClient = () => {
    if (!recipient || !recipient.includes('@')) {
      onShowToast('Sila masukkan alamat emel penerima yang sah.', 'urgent');
      return;
    }

    const mailtoUrl = `mailto:${encodeURIComponent(recipient)}?cc=${encodeURIComponent(
      ccEmail
    )}&subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

    window.open(mailtoUrl, '_blank');

    // Also record dispatch in background
    handleSendAndLog();
  };

  const handleCopyBody = async () => {
    try {
      await navigator.clipboard.writeText(`${emailSubject}\n\n${emailBody}`);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      onShowToast('Teks baucar/notifikasi pembayaran disalin ke papan klip!', 'success');
    } catch {
      onShowToast('Gagal menyalin teks emel.', 'urgent');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#102034] border border-[#1b2b3f] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#1b2b3f] flex items-center justify-between bg-[#0b1c30]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-[#d3e4fe]">
                  Hantar Notifikasi Bayaran ke Emel
                </h3>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                  Payment Cleared
                </span>
              </div>
              <p className="text-xs text-[#8c909f]">
                Hantar baucar & slip pengesahan bayaran (*Payment Advice*) kepada penerima atau pembekal
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#1b2b3f] hover:bg-[#26364a] text-[#8c909f] hover:text-[#d3e4fe] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col gap-5 overflow-y-auto">
          {/* Programme & Milestone Summary Box */}
          <div className="p-4 rounded-xl bg-[#000f21] border border-[#1b2b3f] grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold text-[#8c909f] tracking-wider">
                Program TV & Kontrak
              </span>
              <span className="font-semibold text-[#d3e4fe] text-sm">
                {programme.title}
              </span>
              <span className="text-[11px] text-[#adc6ff] font-mono">
                {contractRef} • {programme.vendor}
              </span>
            </div>

            <div className="flex flex-col gap-1 sm:text-right">
              <span className="text-[10px] uppercase font-bold text-[#8c909f] tracking-wider">
                Fasa Bayaran & Jumlah
              </span>
              <span className="font-bold text-emerald-400 text-sm">
                {formattedMYR} <span className="text-xs text-[#8c909f]">({formattedUSD})</span>
              </span>
              <span className="text-[11px] text-[#c2c6d6]">
                {milestone.title} ({milestone.percentage}%)
              </span>
            </div>
          </div>

          {/* Form Fields: Recipient, CC, and Custom Note */}
          <div className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#c2c6d6] flex items-center justify-between">
                <span>Alamat Emel Penerima (To) *</span>
                {user?.email && (
                  <button
                    type="button"
                    onClick={() => setRecipient(user.email!)}
                    className="text-[10px] text-[#4d8eff] hover:underline cursor-pointer"
                  >
                    Guna emel saya ({user.email})
                  </button>
                )}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-[#8c909f]" />
                <input
                  type="email"
                  required
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="pembekal@distributor.com atau kewangan@mediaprima.com.my"
                  className="w-full pl-9 pr-3 py-2 bg-[#000f21] border border-[#1b2b3f] rounded-xl text-xs text-[#d3e4fe] placeholder:text-[#424754] focus:outline-none focus:border-[#4d8eff] transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#c2c6d6]">
                Salinan Emel (CC - Pilihan)
              </label>
              <input
                type="text"
                value={ccEmail}
                onChange={(e) => setCcEmail(e.target.value)}
                placeholder="accounts.payable@mediaprima.com.my, finance@broadcast.com"
                className="w-full px-3 py-2 bg-[#000f21] border border-[#1b2b3f] rounded-xl text-xs text-[#d3e4fe] placeholder:text-[#424754] focus:outline-none focus:border-[#4d8eff] transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#c2c6d6]">
                Nota Pembayaran Tambahan (Audit Note)
              </label>
              <textarea
                rows={2}
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Catatan tambahan mengenai pindahan bank atau rujukan resit..."
                className="w-full px-3 py-2 bg-[#000f21] border border-[#1b2b3f] rounded-xl text-xs text-[#d3e4fe] placeholder:text-[#424754] focus:outline-none focus:border-[#4d8eff] transition-colors resize-none"
              />
            </div>
          </div>

          {/* Email Preview Container */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#8c909f]">
                Pratonton Kandungan Emel (*Live Preview*)
              </span>
              <button
                type="button"
                onClick={handleCopyBody}
                className="flex items-center gap-1 text-xs text-[#4d8eff] hover:underline cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{isCopied ? 'Tersalin!' : 'Salin Teks'}</span>
              </button>
            </div>

            <div className="p-3.5 bg-[#000f21] border border-[#1b2b3f] rounded-xl text-xs font-mono text-[#adc6ff] whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed selection:bg-[#4d8eff]/30">
              {emailBody}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#0b1c30] border-t border-[#1b2b3f] flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#1b2b3f] hover:bg-[#26364a] text-xs font-semibold text-[#d3e4fe] transition-colors cursor-pointer"
          >
            Batal
          </button>

          <div className="flex items-center gap-2">
            {/* Open in Outlook / Gmail */}
            <button
              type="button"
              onClick={handleOpenMailClient}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1b2b3f] hover:bg-[#26364a] border border-[#334155] text-xs font-semibold text-[#d3e4fe] transition-all cursor-pointer active:scale-95"
              title="Buka perisian emel lalai anda (Outlook / Gmail / Apple Mail)"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#adc6ff]" />
              <span>Buka di Perisian Emel</span>
            </button>

            {/* Direct Send & Cloud Log */}
            <button
              type="button"
              onClick={handleSendAndLog}
              disabled={isSending}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isSending ? (
                <span className="inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Hantar Notifikasi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
