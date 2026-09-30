import React, { useState } from 'react';
import {
  Mail,
  Check,
  Send,
  Copy,
  ExternalLink,
  X,
  History,
  ShieldCheck,
  Settings,
  BellRing,
} from 'lucide-react';
import { EmailNotificationRecord } from '../types';
import {
  getNotificationEmail,
  setNotificationEmail,
  isAutoEmailAlertsEnabled,
  setAutoEmailAlertsEnabled,
  getEmailHistory,
  openMailtoDraft,
} from '../utils/emailService';
import { formatRM } from '../utils/dateUtils';

interface EmailNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (message: string, type?: 'info' | 'success' | 'urgent') => void;
  lastSentNotification?: EmailNotificationRecord | null;
}

export const EmailNotificationModal: React.FC<EmailNotificationModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
  lastSentNotification,
}) => {
  const [email, setEmail] = useState<string>(() => getNotificationEmail());
  const [isAutoEnabled, setIsAutoEnabled] = useState<boolean>(() => isAutoEmailAlertsEnabled());
  const [emailSaved, setEmailSaved] = useState<boolean>(false);
  const [history, setHistory] = useState<EmailNotificationRecord[]>(() => getEmailHistory());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      onShowToast('Sila masukkan alamat emel yang sah.', 'urgent');
      return;
    }
    setNotificationEmail(email);
    setEmailSaved(true);
    setTimeout(() => setEmailSaved(false), 2000);
    onShowToast(`Emel notifikasi dikemas kini ke: ${email}`, 'success');
  };

  const handleToggleAuto = () => {
    const next = !isAutoEnabled;
    setIsAutoEnabled(next);
    setAutoEmailAlertsEnabled(next);
    onShowToast(
      next
        ? 'Notifikasi automatik diaktifkan setiap kali bayaran dilangsaikan!'
        : 'Notifikasi automatik emel dimatikan.',
      'info'
    );
  };

  const handleCopyEmailText = async (record: EmailNotificationRecord) => {
    try {
      await navigator.clipboard.writeText(`${record.subject}\n\n${record.body}`);
      setCopiedId(record.id);
      setTimeout(() => setCopiedId(null), 2000);
      onShowToast('Teks emel telah disalin ke papan klip!', 'success');
    } catch {
      onShowToast('Gagal menyalin teks emel.', 'urgent');
    }
  };

  const handleSendTestEmail = () => {
    const testRecord: EmailNotificationRecord = {
      id: `test-${Date.now()}`,
      recipientEmail: email,
      programmeTitle: 'MAHARAJALAWAK MEGA 2026',
      contractRef: 'CON-MEDIA-PRIMA-TEST',
      vendor: 'Astro Productions & Distribution',
      milestoneTitle: 'First Milestone (50% Upon Delivery)',
      amount: 450000,
      paidDate: new Date().toISOString().split('T')[0],
      sentAt: new Date().toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      subject: `[PayTrack Test] Payment Disbursement Advice: MAHARAJALAWAK MEGA 2026 - RM 450,000`,
      body: `PAYMENT DISBURSEMENT ADVICE (TEST NOTIFICATION)
======================================================
Recipient: ${email}
Status: VERIFIED & TESTED
Timestamp: ${new Date().toLocaleString('en-MY')}

Programme: MAHARAJALAWAK MEGA 2026
Contract Ref: CON-MEDIA-PRIMA-TEST
Amount Settled: RM 450,000.00
SLA Settlement: Verified

This confirms that payment notifications will be dispatched to your inbox (${email}) whenever any TV programme payment is marked as paid.`,
      status: 'sent',
    };

    setHistory((prev) => [testRecord, ...prev]);
    openMailtoDraft(testRecord);
    onShowToast(`Notifikasi ujian dihantar ke ${email}!`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#102034] border border-[#1b2b3f] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#1b2b3f] flex items-center justify-between bg-[#0b1c30]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4d8eff]/15 border border-[#4d8eff]/30 flex items-center justify-center text-[#adc6ff]">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-[#d3e4fe]">
                  Konfigurasi Notifikasi Emel Bayaran
                </h3>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                  Auto-Alert Active
                </span>
              </div>
              <p className="text-xs text-[#8c909f]">
                Hantar notifikasi pengesahan pembayaran (*Payment Disbursement Advice*) terus ke emel anda
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
          {/* Email Settings Card */}
          <div className="p-4 rounded-xl bg-[#000f21] border border-[#1b2b3f] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#8c909f] flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-[#adc6ff]" />
                Alamat Emel Penerima (*Recipient Email*)
              </span>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAutoEnabled}
                  onChange={handleToggleAuto}
                  className="rounded border-[#1b2b3f] text-[#4d8eff] focus:ring-0 cursor-pointer"
                />
                <span className="text-xs font-semibold text-[#d3e4fe]">
                  Auto-Hantar Semasa Bayaran
                </span>
              </label>
            </div>

            <form onSubmit={handleSaveEmail} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Mail className="w-4 h-4 text-[#8c909f] absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cth: hafiz.wahab@mediaprima.com.my"
                  className="w-full h-10 pl-9 pr-3.5 bg-[#102034] text-[#d3e4fe] rounded-lg border border-[#1b2b3f] outline-none text-xs focus:border-[#4d8eff] transition-colors"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="h-10 px-4 rounded-lg bg-[#4d8eff] hover:bg-[#adc6ff] text-[#00285d] text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 shadow-xs"
                >
                  {emailSaved ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-900" />
                      <span>Disimpan!</span>
                    </>
                  ) : (
                    <span>Simpan Emel</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleSendTestEmail}
                  className="h-10 px-3.5 rounded-lg bg-[#1b2b3f] hover:bg-[#26364a] text-[#adc6ff] text-xs font-semibold transition-colors border border-[#334155] flex items-center gap-1.5"
                  title="Uji hantar emel notifikasi"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Uji Emel</span>
                </button>
              </div>
            </form>

            <div className="flex items-center gap-2 text-[11px] text-[#8c909f]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                Setiap kali butang <strong>&quot;Mark as Paid&quot;</strong> ditekan pada mana-mana milestone, sistem akan menjana notifikasi perbankan lengkap ke emel ini.
              </span>
            </div>
          </div>

          {/* Last Dispatched Notification Highlight (if any) */}
          {lastSentNotification && (
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <BellRing className="w-4 h-4 text-emerald-400 animate-bounce" />
                  Notifikasi Terkini Dihantar:
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">
                  {lastSentNotification.sentAt}
                </span>
              </div>
              <p className="text-xs text-[#d3e4fe] font-semibold">
                {lastSentNotification.subject}
              </p>
              <div className="flex items-center justify-between text-[11px] text-[#8c909f] pt-1">
                <span>Nilai: {formatRM(lastSentNotification.amount)}</span>
                <button
                  type="button"
                  onClick={() => openMailtoDraft(lastSentNotification)}
                  className="text-[#adc6ff] hover:underline flex items-center gap-1 font-semibold"
                >
                  <ExternalLink className="w-3 h-3" />
                  Buka dalam Aplikasi Emel
                </button>
              </div>
            </div>
          )}

          {/* Notification History Log */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#8c909f] flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-[#adc6ff]" />
                Log Sejarah Notifikasi Bayaran ({history.length})
              </span>
              <span className="text-[10px] text-[#8c909f]">
                Disimpan dalam peranti tempatan
              </span>
            </div>

            {history.length === 0 ? (
              <div className="p-6 rounded-xl bg-[#000f21] border border-[#1b2b3f] text-center flex flex-col items-center gap-2">
                <Mail className="w-8 h-8 text-[#424754]" />
                <span className="text-xs text-[#8c909f]">
                  Belum ada notifikasi bayaran dihantar. Tandakan bayaran pada program untuk menghantar secara automatik.
                </span>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {history.map((record) => (
                  <div
                    key={record.id}
                    className="p-3 rounded-lg bg-[#000f21] border border-[#1b2b3f] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#d3e4fe]">{record.programmeTitle}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 font-bold">
                          {formatRM(record.amount)}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#8c909f]">
                        {record.milestoneTitle} • Penerima: {record.recipientEmail} • {record.sentAt}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopyEmailText(record)}
                        className="px-2.5 py-1 rounded bg-[#102034] hover:bg-[#1b2b3f] text-[#8c909f] hover:text-[#d3e4fe] text-[11px] font-semibold border border-[#1b2b3f] flex items-center gap-1 transition-colors"
                        title="Salin teks emel"
                      >
                        {copiedId === record.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>Salin</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openMailtoDraft(record)}
                        className="px-2.5 py-1 rounded bg-[#102034] hover:bg-[#1b2b3f] text-[#adc6ff] text-[11px] font-semibold border border-[#1b2b3f] flex items-center gap-1 transition-colors"
                        title="Buka dalam aplikasi emel anda"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Buka Emel</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0b1c30] border-t border-[#1b2b3f] flex items-center justify-between">
          <span className="text-[11px] text-[#8c909f]">
            Status: Notifikasi automatik aktif ke <strong>{email}</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#1b2b3f] hover:bg-[#26364a] text-xs font-semibold text-[#d3e4fe] transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
