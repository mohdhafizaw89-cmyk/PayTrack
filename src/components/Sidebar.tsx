import React from 'react';
import {
  Tv,
  CreditCard,
  Calendar,
  AlertCircle,
  FileText,
  Building2,
  CheckCircle2,
  ArrowLeftRight,
  Lock,
  ShieldCheck,
  X,
  FileSpreadsheet,
  Mail,
  Database,
  Cloud,
  Users,
} from 'lucide-react';
import { FilterTab } from '../types';
import { useAuth } from '../context/AuthContext';
import { ROLE_LABELS } from '../utils/rbac';

interface SidebarProps {
  urgentCount: number;
  currentFilter: FilterTab;
  onSelectFilter: (filter: FilterTab) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  activeNav: string;
  onSelectNav: (nav: string) => void;
  onOpenReportModal?: () => void;
  onOpenEmailModal?: () => void;
  onOpenUserManagement?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  urgentCount,
  currentFilter,
  onSelectFilter,
  mobileOpen,
  onCloseMobile,
  activeNav,
  onSelectNav,
  onOpenReportModal,
  onOpenEmailModal,
  onOpenUserManagement,
}) => {
  const { isCloudConnected, user, role, isAdmin, openAuthModal, signOutUser } = useAuth();
  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-[#0b1c30] border-r border-[#1b2b3f] z-50 flex flex-col justify-between py-6 transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col gap-6">
          {/* Logo / Brand Header */}
          <div className="px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-[#4d8eff] flex items-center justify-center shadow-xs">
                <Tv className="w-5 h-5 text-[#00285d]" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-base text-[#d3e4fe] leading-tight tracking-tight">
                  PAYTRACK
                </span>
                <span className="text-[11px] font-semibold text-[#8c909f] uppercase tracking-wider">
                  Payment Telemetry
                </span>
              </div>
            </div>
            <button
              onClick={onCloseMobile}
              className="lg:hidden text-[#8c909f] hover:text-[#d3e4fe] p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Core Navigation */}
          <div className="px-4">
            <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#8c909f]">
              Core Navigation
            </div>
            <nav className="flex flex-col gap-1 mt-1">
              <button
                type="button"
                onClick={() => {
                  onSelectNav('pipeline');
                  onSelectFilter('all');
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-all ${
                  activeNav === 'pipeline' && currentFilter === 'all'
                    ? 'bg-[#4d8eff] text-[#00285d] font-semibold shadow-xs'
                    : 'text-[#c2c6d6] hover:bg-[#1b2b3f] hover:text-[#d3e4fe]'
                }`}
              >
                <CreditCard className="w-4 h-4 shrink-0" />
                <span>Payment Pipeline</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectNav('schedules');
                  onSelectFilter('all');
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-all ${
                  activeNav === 'schedules'
                    ? 'bg-[#4d8eff] text-[#00285d] font-semibold shadow-xs'
                    : 'text-[#c2c6d6] hover:bg-[#1b2b3f] hover:text-[#d3e4fe]'
                }`}
              >
                <Calendar className="w-4 h-4 shrink-0" />
                <span>Programme Schedules</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectNav('urgent');
                  onSelectFilter('due7');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded text-sm font-medium transition-all ${
                  activeNav === 'urgent' || currentFilter === 'due7'
                    ? 'bg-[#1b2b3f] text-[#d3e4fe] border border-amber-500/30'
                    : 'text-[#c2c6d6] hover:bg-[#1b2b3f] hover:text-[#d3e4fe]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Urgent Milestones</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-[#93000a] text-[#ffdad6] text-[11px] font-bold">
                  {urgentCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onSelectNav('registry')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-all ${
                  activeNav === 'registry'
                    ? 'bg-[#4d8eff] text-[#00285d] font-semibold shadow-xs'
                    : 'text-[#c2c6d6] hover:bg-[#1b2b3f] hover:text-[#d3e4fe]'
                }`}
              >
                <FileText className="w-4 h-4 shrink-0" />
                <span>Contract Registry</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectNav('distributors')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-all ${
                  activeNav === 'distributors'
                    ? 'bg-[#4d8eff] text-[#00285d] font-semibold shadow-xs'
                    : 'text-[#c2c6d6] hover:bg-[#1b2b3f] hover:text-[#d3e4fe]'
                }`}
              >
                <Building2 className="w-4 h-4 shrink-0" />
                <span>Distributor Accounts</span>
              </button>
            </nav>
          </div>

          {/* Disbursement Navigation */}
          <div className="px-4">
            <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#8c909f]">
              Disbursement
            </div>
            <nav className="flex flex-col gap-1 mt-1">
              <button
                type="button"
                onClick={() => onSelectNav('remittance')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-all ${
                  activeNav === 'remittance'
                    ? 'bg-[#4d8eff] text-[#00285d] font-semibold shadow-xs'
                    : 'text-[#c2c6d6] hover:bg-[#1b2b3f] hover:text-[#d3e4fe]'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Remittance Approvals</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectNav('fx')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-all ${
                  activeNav === 'fx'
                    ? 'bg-[#4d8eff] text-[#00285d] font-semibold shadow-xs'
                    : 'text-[#c2c6d6] hover:bg-[#1b2b3f] hover:text-[#d3e4fe]'
                }`}
              >
                <ArrowLeftRight className="w-4 h-4 shrink-0 text-[#adc6ff]" />
                <span>FX & Treasury Audit</span>
              </button>
            </nav>
          </div>

          {/* Reports & Exports Navigation */}
          <div className="px-4">
            <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#8c909f]">
              Reports & Audit
            </div>
            <nav className="flex flex-col gap-1 mt-1">
              <button
                type="button"
                onClick={() => {
                  if (onOpenReportModal) onOpenReportModal();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded text-sm font-medium transition-all text-[#c2c6d6] hover:bg-[#1b2b3f] hover:text-[#d3e4fe] group"
              >
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-4 h-4 shrink-0 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span>Google Sheets Report</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                  CSV
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onOpenEmailModal) onOpenEmailModal();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded text-sm font-medium transition-all text-[#c2c6d6] hover:bg-[#1b2b3f] hover:text-[#d3e4fe] group"
              >
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 shrink-0 text-[#adc6ff] group-hover:scale-110 transition-transform" />
                  <span>Email Payment Alerts</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
              </button>
            </nav>
          </div>

          {/* Administration & RBAC Section */}
          <div className="px-4">
            <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#8c909f] flex items-center justify-between">
              <span>Akses & Pentadbiran</span>
              {isAdmin && (
                <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 text-[9px] font-bold">
                  Admin
                </span>
              )}
            </div>
            <nav className="flex flex-col gap-1 mt-1">
              <button
                type="button"
                onClick={() => {
                  if (onOpenUserManagement) onOpenUserManagement();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded text-sm font-medium transition-all text-[#c2c6d6] hover:bg-indigo-950/30 hover:text-indigo-200 group border border-transparent hover:border-indigo-500/30"
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-indigo-400 group-hover:scale-110 transition-transform" />
                  <span>Pengurusan Pengguna</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                  RBAC
                </span>
              </button>
            </nav>
          </div>
        </div>

        {/* Footer Meta & Financial Cycle */}
        <div className="px-6 flex flex-col gap-3">
          {/* Firebase Database Connection Status */}
          <div className="p-2.5 rounded-lg bg-[#102034] border border-[#1b2b3f] flex flex-col gap-2 shadow-inner">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-[#4d8eff]/10 border border-[#4d8eff]/30 flex items-center justify-center text-[#adc6ff]">
                  <Database className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8c909f]">
                    Firestore Cloud
                  </span>
                  <span className="text-xs font-semibold text-[#d3e4fe]">
                    {user ? 'Akaun Aktif' : 'Log Masuk Diperlukan'}
                  </span>
                </div>
              </div>
              <span
                className={`w-2 h-2 rounded-full ${
                  isCloudConnected ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-amber-400'
                }`}
                title={isCloudConnected ? 'Firestore Connected' : 'Connecting to Firestore'}
              />
            </div>

            {user ? (
              <div className="pt-1.5 border-t border-[#1b2b3f] flex items-center justify-between text-xs">
                <span className="text-[#8c909f] truncate max-w-[120px] text-[11px]" title={user.email || ''}>
                  {user.displayName || user.email?.split('@')[0]}
                </span>
                <button
                  type="button"
                  onClick={signOutUser}
                  className="text-red-400 hover:text-red-300 font-medium text-[11px] cursor-pointer"
                >
                  Log Keluar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal('signin')}
                className="w-full py-1.5 px-2 rounded bg-[#4d8eff]/15 hover:bg-[#4d8eff]/25 text-[#adc6ff] font-semibold text-xs text-center border border-[#4d8eff]/30 transition-colors cursor-pointer"
              >
                Log Masuk / Daftar Akaun
              </button>
            )}
          </div>

          <div className="p-3 rounded bg-[#102034] border border-[#1b2b3f] flex flex-col gap-1 shadow-inner">
            <div className="flex items-center gap-1.5 text-[#8c909f]">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                Financial Cycle
              </span>
            </div>
            <span className="text-xs text-[#d3e4fe] font-semibold">
              Q3 Syndication Lock
            </span>
            <span className="text-xs tabular-nums text-[#bec6e0]">
              Closing in 6d 14h
            </span>
          </div>

          <div className="flex items-center justify-between text-[#8c909f] px-1 text-xs">
            <span>v4.2.8 Enterprise</span>
            <span className="flex items-center gap-1.5 text-[#adc6ff] font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#4d8eff] shadow-xs" />
              <ShieldCheck className="w-3.5 h-3.5" />
              Encrypted
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
