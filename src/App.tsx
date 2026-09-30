/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CloudDownload,
  RotateCcw,
  PlusCircle,
  FileSpreadsheet,
  Download,
  Building2,
  FileText,
  CheckCircle2,
  ArrowLeftRight,
  Mail,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { Programme, Milestone, FilterTab, UrgentMilestoneItem, ToastMessage, EmailNotificationRecord } from './types';
import {
  loadStoredProgrammes,
  saveStoredProgrammes,
  getInitialSampleData,
} from './utils/storage';
import {
  formatDate,
  addDays,
  getDaysDiffFromToday,
  formatUSD,
  formatRM,
} from './utils/dateUtils';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { UrgentAlerts } from './components/UrgentAlerts';
import { ProgrammeList } from './components/ProgrammeList';
import { AddProgrammeModal } from './components/AddProgrammeModal';
import { EditProgrammeModal } from './components/EditProgrammeModal';
import { Toast } from './components/Toast';
import { FxTreasuryModule } from './components/FxTreasuryModule';
import { GoogleSheetsReportModal } from './components/GoogleSheetsReportModal';
import { EmailNotificationModal } from './components/EmailNotificationModal';
import { SendPaymentEmailModal } from './components/SendPaymentEmailModal';
import { UserManagementModal } from './components/UserManagementModal';
import { AuthModal } from './components/AuthModal';
import {
  sendPaymentDisbursementEmail,
  isAutoEmailAlertsEnabled,
  getNotificationEmail,
} from './utils/emailService';
import { useAuth } from './context/AuthContext';
import {
  subscribeToProgrammes,
  subscribeToAllProgrammes,
  saveProgrammeDoc,
  deleteProgrammeDoc,
  logEmailNotificationDoc,
} from './firebase/service';

export default function App() {
  const { user, role, isAdmin, hasPermission, openAuthModal } = useAuth();
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [currentFilter, setCurrentFilter] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeNav, setActiveNav] = useState<string>('pipeline');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState<boolean>(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState<boolean>(false);
  const [emailModalTarget, setEmailModalTarget] = useState<{
    programme: Programme;
    milestone: Milestone;
  } | null>(null);
  const [lastSentNotification, setLastSentNotification] = useState<EmailNotificationRecord | null>(null);
  const [editingProgramme, setEditingProgramme] = useState<Programme | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('paytrack_theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  // Real-time synchronization with Firebase Firestore (Admins see all programmes; regular users see their tenant programmes)
  useEffect(() => {
    if (!user) {
      // Clear data immediately when signed out to guarantee account privacy
      setProgrammes([]);
      return;
    }

    const unsubscribe = isAdmin
      ? subscribeToAllProgrammes(
          (cloudProgrammes) => {
            setProgrammes(cloudProgrammes);
          },
          (err) => {
            console.warn('Realtime all programmes subscription error:', err);
          }
        )
      : subscribeToProgrammes(
          user.uid,
          (cloudProgrammes) => {
            setProgrammes(cloudProgrammes);
          },
          (err) => {
            console.warn('Realtime subscription error:', err);
          }
        );

    return () => unsubscribe();
  }, [user, isAdmin]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
    localStorage.setItem('paytrack_theme', theme);
  }, [theme]);

  // Toast dispatch
  const showToast = useCallback((message: string, type: ToastMessage['type'] = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      showToast(next === 'light' ? 'Switched to Light Mode' : 'Switched to Dark Mode', 'info');
      return next;
    });
  }, [showToast]);

  // Save to localStorage whenever programmes state updates
  useEffect(() => {
    saveStoredProgrammes(programmes);
  }, [programmes]);

  // Evaluate single milestone
  const evaluateMilestone = useCallback((m: Milestone) => {
    if (m.paid) {
      return { status: 'PAID' as const };
    }
    if (m.materialReceived && m.invoiceReceived) {
      let compDate = m.invoiceDate;
      if (m.materialDate && m.invoiceDate) {
        compDate = m.materialDate > m.invoiceDate ? m.materialDate : m.invoiceDate;
      } else if (m.materialDate) {
        compDate = m.materialDate;
      }
      const dueDate = m.dueDate || addDays(compDate || formatDate(new Date()), 7);
      const daysLeft = getDaysDiffFromToday(dueDate);

      return {
        status: 'PENDING_PAYMENT' as const,
        dueDate,
        daysLeft,
      };
    }
    return {
      status: 'AWAITING_DELIVERABLES' as const,
    };
  }, []);

  // Urgent milestones list (both received, not paid, daysLeft <= 7)
  const urgentMilestones = useMemo<UrgentMilestoneItem[]>(() => {
    const urgents: UrgentMilestoneItem[] = [];

    programmes.forEach((prog) => {
      prog.milestones.forEach((m) => {
        if (!m.paid && m.materialReceived && m.invoiceReceived) {
          const evalRes = evaluateMilestone(m);
          if (evalRes.status === 'PENDING_PAYMENT') {
            const days = evalRes.daysLeft ?? 0;
            let status: UrgentMilestoneItem['status'] = 'UPCOMING';
            if (days < 0) status = 'OVERDUE';
            else if (days === 0) status = 'DUE_TODAY';
            else if (days <= 7) status = 'URGENT';

            urgents.push({
              programmeId: prog.id,
              programmeTitle: prog.title,
              vendor: prog.vendor,
              milestone: m,
              daysLeft: days,
              dueDate: evalRes.dueDate,
              status,
            });
          }
        }
      });
    });

    // Sort: most urgent (lowest daysLeft) first
    return urgents.sort((a, b) => a.daysLeft - b.daysLeft);
  }, [programmes, evaluateMilestone]);

  // Quick KPI statistics calculations
  const stats = useMemo(() => {
    let totalVolume = 0;
    let totalPaidAmount = 0;
    let settledMilestonesCount = 0;
    let pendingDeliverablesCount = 0;
    let urgentDueAmount = 0;
    let urgentDueCount = 0;

    programmes.forEach((prog) => {
      totalVolume += Number(prog.totalAmount) || 0;
      prog.milestones.forEach((m) => {
        const amt = Number(m.amount) || 0;
        if (m.paid) {
          totalPaidAmount += amt;
          settledMilestonesCount++;
        } else {
          if (m.materialReceived && m.invoiceReceived) {
            urgentDueCount++;
            urgentDueAmount += amt;
          } else {
            pendingDeliverablesCount++;
          }
        }
      });
    });

    const awaitingCount = programmes.filter((p) =>
      p.milestones.some((m) => !m.paid && (!m.materialReceived || !m.invoiceReceived))
    ).length;

    const due7Count = programmes.filter((p) =>
      p.milestones.some((m) => !m.paid && m.materialReceived && m.invoiceReceived)
    ).length;

    const fullyPaidCount = programmes.filter(
      (p) => p.milestones.length > 0 && p.milestones.every((m) => m.paid)
    ).length;

    return {
      activeCount: programmes.length,
      totalVolume,
      urgentDueCount,
      immediateCashOutlay: urgentDueAmount,
      pendingDeliverablesCount,
      totalPaidAmount,
      settledMilestonesCount,
      totalOutstandings: Math.max(0, totalVolume - totalPaidAmount),
      tabCounts: {
        all: programmes.length,
        due7: due7Count,
        awaiting: awaitingCount,
        paid: fullyPaidCount,
      },
    };
  }, [programmes]);

  // Toggle Material Received Checkbox
  const handleToggleMaterial = useCallback(
    (programmeId: string, milestoneId: string, checked: boolean) => {
      setProgrammes((prev) =>
        prev.map((prog) => {
          if (prog.id !== programmeId) return prog;

          const updatedMilestones = prog.milestones.map((m) => {
            if (m.id !== milestoneId) return m;

            const todayStr = formatDate(new Date());
            const newMaterial = checked;
            const newMaterialDate = checked ? todayStr : null;

            let newDueDate = m.dueDate;

            // Strict 7-Day rule trigger when BOTH are verified
            if (newMaterial && m.invoiceReceived) {
              const compDate = m.invoiceDate && m.invoiceDate > todayStr ? m.invoiceDate : todayStr;
              newDueDate = addDays(compDate, 7);
              showToast(
                `Automated 7-day payment SLA triggered for "${m.title}"! Due on ${newDueDate}`,
                'warning'
              );
            } else if (!newMaterial) {
              newDueDate = null;
            }

            return {
              ...m,
              materialReceived: newMaterial,
              materialDate: newMaterialDate,
              dueDate: newDueDate,
            };
          });

          const updatedProg = { ...prog, milestones: updatedMilestones };
          if (user) {
            saveProgrammeDoc(updatedProg, user.uid).catch(console.error);
          }
          return updatedProg;
        })
      );
    },
    [user, showToast]
  );

  // Toggle Invoice Received Checkbox
  const handleToggleInvoice = useCallback(
    (programmeId: string, milestoneId: string, checked: boolean) => {
      setProgrammes((prev) =>
        prev.map((prog) => {
          if (prog.id !== programmeId) return prog;

          const updatedMilestones = prog.milestones.map((m) => {
            if (m.id !== milestoneId) return m;

            const todayStr = formatDate(new Date());
            const newInvoice = checked;
            const newInvoiceDate = checked ? todayStr : null;

            let newDueDate = m.dueDate;

            // Strict 7-Day rule trigger when BOTH are verified
            if (m.materialReceived && newInvoice) {
              const compDate = m.materialDate && m.materialDate > todayStr ? m.materialDate : todayStr;
              newDueDate = addDays(compDate, 7);
              showToast(
                `Automated 7-day payment SLA triggered for "${m.title}"! Due on ${newDueDate}`,
                'warning'
              );
            } else if (!newInvoice) {
              newDueDate = null;
            }

            return {
              ...m,
              invoiceReceived: newInvoice,
              invoiceDate: newInvoiceDate,
              dueDate: newDueDate,
            };
          });

          const updatedProg = { ...prog, milestones: updatedMilestones };
          if (user) {
            saveProgrammeDoc(updatedProg, user.uid).catch(console.error);
          }
          return updatedProg;
        })
      );
    },
    [user, showToast]
  );

  // Mark as Paid
  const handleMarkAsPaid = useCallback(
    (programmeId: string, milestoneId: string) => {
      const todayStr = formatDate(new Date());

      setProgrammes((prev) =>
        prev.map((prog) => {
          if (prog.id !== programmeId) return prog;

          let createdRecord: EmailNotificationRecord | null = null;
          const updatedMilestones = prog.milestones.map((m) => {
            if (m.id !== milestoneId) return m;

            const updatedMilestone = {
              ...m,
              paid: true,
              paidDate: todayStr,
            };

            showToast(
              `Payment of ${formatRM(m.amount)} settled for "${prog.title}"!`,
              'success'
            );

            // Send notification to user email if enabled
            if (isAutoEmailAlertsEnabled()) {
              createdRecord = sendPaymentDisbursementEmail(prog, updatedMilestone);
              setLastSentNotification(createdRecord);
              showToast(
                `📧 Notifikasi bayaran dihantar ke ${getNotificationEmail()}!`,
                'info'
              );
            }

            return updatedMilestone;
          });

          const updatedProg = { ...prog, milestones: updatedMilestones };
          const justPaidMilestone = updatedMilestones.find((m) => m.id === milestoneId);
          if (justPaidMilestone) {
            setEmailModalTarget({ programme: updatedProg, milestone: justPaidMilestone });
          }

          if (user) {
            saveProgrammeDoc(updatedProg, user.uid).catch(console.error);
            if (createdRecord) {
              logEmailNotificationDoc(createdRecord, user.uid).catch(console.error);
            }
          }
          return updatedProg;
        })
      );
    },
    [user, showToast]
  );

  // Delete Programme
  const handleDeleteProgramme = useCallback(
    (programmeId: string) => {
      const prog = programmes.find((p) => p.id === programmeId);
      if (
        window.confirm(
          `Are you sure you want to delete "${prog?.title || 'this programme'}" and all associated milestone records?`
        )
      ) {
        setProgrammes((prev) => prev.filter((p) => p.id !== programmeId));
        if (user) {
          deleteProgrammeDoc(programmeId).catch(console.error);
        }
        showToast('Programme schedule removed successfully.', 'info');
      }
    },
    [user, programmes, showToast]
  );

  // Add Programme
  const handleAddProgramme = useCallback(
    (newProgramme: Programme) => {
      setProgrammes((prev) => [newProgramme, ...prev]);
      if (user) {
        saveProgrammeDoc(newProgramme, user.uid).catch(console.error);
      }
      showToast(`"${newProgramme.title}" added to active payment pipeline!`, 'success');
    },
    [user, showToast]
  );

  // Update Programme
  const handleUpdateProgramme = useCallback(
    (updated: Programme) => {
      setProgrammes((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      if (user) {
        saveProgrammeDoc(updated, user.uid).catch(console.error);
      }
      showToast(`Updated details for "${updated.title}".`, 'info');
    },
    [user, showToast]
  );

  // Load realistic samples
  const handleLoadSampleData = useCallback(async () => {
    if (!user) {
      openAuthModal('signin');
      showToast('Sila log masuk atau daftar akaun untuk menyimpan data ke akaun Firebase anda.', 'info');
      return;
    }
    const samples = getInitialSampleData();
    setProgrammes(samples);
    try {
      for (const prog of samples) {
        await saveProgrammeDoc(prog, user.uid);
      }
      showToast('3 contoh kontrak industri berjaya disimpan ke akaun Firebase anda!', 'success');
    } catch (err) {
      console.error('Error saving samples to Firestore:', err);
      showToast('Gagal memuat naik contoh ke Firebase.', 'error');
    }
  }, [user, openAuthModal, showToast]);

  // Reset all system data
  const handleResetData = useCallback(async () => {
    if (window.confirm('Adakah anda pasti mahu memadam semua data program dari akaun Firebase anda?')) {
      if (user) {
        try {
          for (const prog of programmes) {
            await deleteProgrammeDoc(prog.id);
          }
        } catch (err) {
          console.error('Error clearing Firestore documents:', err);
        }
      }
      setProgrammes([]);
      showToast('Semua data program telah dipadam dari akaun anda.', 'info');
    }
  }, [user, programmes, showToast]);

  // Export JSON backup
  const handleExportJSON = useCallback(() => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(programmes, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `PayTrack_Backup_${formatDate(new Date())}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Exported PayTrack database backup JSON.', 'success');
  }, [programmes, showToast]);

  // Filter programmes for the list view
  const filteredProgrammes = useMemo(() => {
    return programmes.filter((prog) => {
      const matchSearch =
        prog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prog.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (prog.contractRef && prog.contractRef.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchSearch) return false;

      if (currentFilter === 'due7') {
        return prog.milestones.some((m) => !m.paid && m.materialReceived && m.invoiceReceived);
      }
      if (currentFilter === 'awaiting') {
        return prog.milestones.some((m) => !m.paid && (!m.materialReceived || !m.invoiceReceived));
      }
      if (currentFilter === 'paid') {
        return prog.milestones.length > 0 && prog.milestones.every((m) => m.paid);
      }
      return true;
    });
  }, [programmes, currentFilter, searchQuery]);

  return (
    <div className="bg-[#031427] text-[#d3e4fe] min-h-screen flex flex-col font-sans">
      {/* Toast Notification Container */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Fixed Left Sidebar */}
      <Sidebar
        urgentCount={stats.urgentDueCount}
        currentFilter={currentFilter}
        onSelectFilter={(filter) => {
          setCurrentFilter(filter);
          setActiveNav('pipeline');
        }}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        activeNav={activeNav}
        onSelectNav={(nav) => {
          setActiveNav(nav);
          setMobileMenuOpen(false);
        }}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenEmailModal={() => setIsEmailModalOpen(true)}
        onOpenUserManagement={() => setIsUserManagementOpen(true)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top Telemetry Header */}
        <Header
          urgentCount={stats.urgentDueCount}
          activeCount={stats.activeCount}
          totalOutstandings={stats.totalOutstandings}
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onSearchFocus={() => {
            const input = document.getElementById('search-programme-input');
            if (input) input.focus();
          }}
          onOpenEmailModal={() => setIsEmailModalOpen(true)}
          onOpenUserManagement={() => setIsUserManagementOpen(true)}
        />

        {/* Workspace Canvas */}
        <main className="w-full pt-20 px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 max-w-7xl mx-auto">
          {/* Empty User Account State */}
          {user && programmes.length === 0 && (
            <div className="p-8 rounded-2xl bg-[#102034] border border-[#1b2b3f] text-center flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#4d8eff]/15 text-[#adc6ff] flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-[#4d8eff]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#d3e4fe]">
                  Akaun Anda Sedia: Tiada Kontrak Lagi
                </h3>
                <p className="text-xs text-[#8c909f] max-w-md mt-1">
                  Anda telah log masuk sebagai <strong>{user.email || user.displayName}</strong>. Data anda disimpan secara peribadi di Firebase Firestore. Tambah program TV pertama anda atau muat 3 contoh kontrak penyiaran untuk memulakan.
                </p>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4d8eff] hover:bg-[#387bf6] text-[#00285d] text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ Tambah Program Baharu</span>
                </button>
                <button
                  type="button"
                  onClick={handleLoadSampleData}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0b1c30] hover:bg-[#1b2b3f] text-[#d3e4fe] border border-[#1b2b3f] text-xs font-semibold transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-emerald-400" />
                  <span>Muat 3 Contoh Kontrak</span>
                </button>
              </div>
            </div>
          )}

          {/* Nav Tab Content switchers if secondary screens clicked */}
          {activeNav === 'registry' && (
            <section className="bg-[#102034] p-6 rounded-xl border border-[#1b2b3f] shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-[#4d8eff]/20 text-[#adc6ff] flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-[#d3e4fe]">
                      Contract Registry View
                    </h2>
                    <p className="text-xs text-[#8c909f]">
                      Legal reference ledger, rights classification and total values
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveNav('pipeline')}
                  className="px-3 py-1.5 rounded bg-[#1b2b3f] hover:bg-[#26364a] text-xs font-medium text-[#d3e4fe] transition-colors"
                >
                  Return to Payment Pipeline
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#000f21] text-[#8c909f] font-semibold uppercase tracking-wider border-b border-[#1b2b3f]">
                      <th className="py-2.5 px-4">Contract Ref</th>
                      <th className="py-2.5 px-4">Programme Title</th>
                      <th className="py-2.5 px-4">Distributor</th>
                      <th className="py-2.5 px-4">Sign Date</th>
                      <th className="py-2.5 px-4">Rights Category</th>
                      <th className="py-2.5 px-4 text-right">Contract Value</th>
                      <th className="py-2.5 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1b2b3f]/60">
                    {programmes.map((p) => {
                      const settled = p.milestones.every((m) => m.paid);
                      return (
                        <tr key={p.id} className="hover:bg-[#1b2b3f]/30">
                          <td className="py-3 px-4 font-mono text-[#adc6ff]">
                            {p.contractRef || 'CON-UNASSIGNED'}
                          </td>
                          <td className="py-3 px-4 font-medium text-[#d3e4fe]">
                            {p.title}
                          </td>
                          <td className="py-3 px-4 text-[#c2c6d6]">{p.vendor}</td>
                          <td className="py-3 px-4 text-[#adc6ff] font-mono">{p.agreementSignDate || p.createdAt}</td>
                          <td className="py-3 px-4 text-[#8c909f]">
                            {p.rightsType || 'Linear & Digital'}
                          </td>
                          <td className="py-3 px-4 text-right tabular-nums font-semibold text-[#d3e4fe]">
                            {formatUSD(p.totalAmount)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                settled
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-[#4d8eff]/20 text-[#adc6ff]'
                              }`}
                            >
                              {settled ? 'Settled' : 'Active'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeNav === 'distributors' && (
            <section className="bg-[#102034] p-6 rounded-xl border border-[#1b2b3f] shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-[#4d8eff]/20 text-[#adc6ff] flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-[#d3e4fe]">
                      Distributor Accounts Portfolio
                    </h2>
                    <p className="text-xs text-[#8c909f]">
                      Aggregated vendor exposures and active disbursement pipelines
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveNav('pipeline')}
                  className="px-3 py-1.5 rounded bg-[#1b2b3f] hover:bg-[#26364a] text-xs font-medium text-[#d3e4fe] transition-colors"
                >
                  Return to Payment Pipeline
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Array.from(new Set(programmes.map((p) => p.vendor))).map((vendorName) => {
                  const vendorProgs = programmes.filter((p) => p.vendor === vendorName);
                  const vendorTotal = vendorProgs.reduce((sum, p) => sum + p.totalAmount, 0);
                  const vendorPaid = vendorProgs.reduce(
                    (sum, p) =>
                      sum +
                      p.milestones.reduce((mSum, m) => mSum + (m.paid ? m.amount : 0), 0),
                    0
                  );

                  return (
                    <div
                      key={vendorName}
                      className="p-4 rounded-lg bg-[#000f21] border border-[#1b2b3f] flex flex-col justify-between gap-3"
                    >
                      <div>
                        <span className="text-[10px] font-semibold text-[#8c909f] uppercase tracking-wider">
                          Distributor / Licensor
                        </span>
                        <h4 className="text-sm font-semibold text-[#d3e4fe]">{vendorName}</h4>
                      </div>
                      <div className="text-xs text-[#8c909f] flex flex-col gap-1">
                        <div className="flex justify-between">
                          <span>Active Titles:</span>
                          <strong className="text-[#d3e4fe]">{vendorProgs.length}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Volume:</span>
                          <strong className="text-[#d3e4fe]">{formatUSD(vendorTotal)}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Disbursed:</span>
                          <strong className="text-emerald-400">{formatUSD(vendorPaid)}</strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {activeNav === 'remittance' && (
            <section className="bg-[#102034] p-6 rounded-xl border border-[#1b2b3f] shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-[#d3e4fe]">
                      Settled Remittance Approvals
                    </h2>
                    <p className="text-xs text-[#8c909f]">
                      Historical log of fully processed wire transfers and milestone releases
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveNav('pipeline')}
                  className="px-3 py-1.5 rounded bg-[#1b2b3f] hover:bg-[#26364a] text-xs font-medium text-[#d3e4fe] transition-colors"
                >
                  Return to Payment Pipeline
                </button>
              </div>

              <div className="space-y-2">
                {programmes
                  .flatMap((p) =>
                    p.milestones
                      .filter((m) => m.paid)
                      .map((m) => ({ programme: p, milestone: m }))
                  )
                  .map(({ programme, milestone }) => (
                    <div
                      key={`${programme.id}_${milestone.id}`}
                      className="p-3 rounded-lg bg-[#000f21] border border-[#1b2b3f] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div>
                          <span className="font-semibold text-[#d3e4fe]">
                            {programme.title}
                          </span>
                          <span className="text-[#8c909f] ml-2 font-mono">
                            • {milestone.title} ({programme.vendor})
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-emerald-400 font-bold tabular-nums">
                          {formatUSD(milestone.amount)}
                        </span>
                        <span className="text-[#8c909f] tabular-nums">
                          Settled on {milestone.paidDate || 'Recorded'}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          )}

          {activeNav === 'fx' && (
            <FxTreasuryModule
              programmes={programmes}
              totalVolumeUSD={stats.totalVolume}
              immediateOutlayUSD={stats.immediateCashOutlay}
              totalPaidAmountUSD={stats.totalPaidAmount}
              onReturnToPipeline={() => setActiveNav('pipeline')}
            />
          )}

          {/* Operational Header & Primary Actions */}
          <section className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-[#102034] p-5 rounded-xl border border-[#1b2b3f] shadow-sm relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#4d8eff]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col gap-1 z-10">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-[#4d8eff] text-[#00285d] text-[11px] font-bold uppercase tracking-wider">
                  PRD V1 Telemetry
                </span>
                <span className="text-[#8c909f] text-xs">·</span>
                <span className="text-[#c2c6d6] text-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
                  Automated SLA Engine Active
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-semibold text-[#d3e4fe] tracking-tight">
                TV Programme Payment Tracker & Reminder
              </h1>
              <p className="text-xs sm:text-sm text-[#8c909f] max-w-2xl leading-relaxed">
                Automated linear & digital rights disbursement pipeline. Strict 7-day payment settlement countdown triggers when both physical/digital delivery material and vendor invoice are verified.
              </p>
            </div>

            {/* Quick Ops Actions Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 z-10 shrink-0">
              <button
                type="button"
                onClick={handleLoadSampleData}
                className="flex items-center gap-1.5 px-3 h-9 bg-[#1b2b3f] hover:bg-[#2a3a4f] text-[#d3e4fe] rounded text-xs font-medium transition-colors border border-[#334155] shadow-xs active:scale-95"
                title="Populate test dataset with 3 programmes"
              >
                <CloudDownload className="w-4 h-4 text-[#adc6ff]" />
                <span>Load Realistic Sample Data</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveNav(activeNav === 'fx' ? 'pipeline' : 'fx')}
                className={`flex items-center gap-1.5 px-3 h-9 rounded text-xs font-semibold transition-all border shadow-xs active:scale-95 ${
                  activeNav === 'fx'
                    ? 'bg-[#4d8eff] text-[#00285d] border-[#4d8eff] shadow-[0_0_12px_rgba(77,142,255,0.4)]'
                    : 'bg-[#1b2b3f] hover:bg-[#2a3a4f] text-[#d3e4fe] border-[#334155]'
                }`}
                title="Toggle FX & Treasury Currency Switcher (RM & USD)"
              >
                <ArrowLeftRight className={`w-4 h-4 ${activeNav === 'fx' ? 'text-[#00285d]' : 'text-[#adc6ff]'}`} />
                <span>FX Exposure ({activeNav === 'fx' ? 'Close' : 'RM/USD'})</span>
              </button>

              <button
                type="button"
                onClick={() => setIsReportModalOpen(true)}
                className="flex items-center gap-1.5 px-3 h-9 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
                title="Jana Laporan Format Google Sheets (CSV/TSV)"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Laporan Google Sheets</span>
              </button>

              <button
                type="button"
                onClick={() => setIsEmailModalOpen(true)}
                className="flex items-center gap-1.5 px-3 h-9 bg-[#1b2b3f] hover:bg-[#2a3a4f] text-[#d3e4fe] border border-[#334155] rounded text-xs font-semibold transition-all shadow-xs active:scale-95 cursor-pointer"
                title="Konfigurasi Emel Notifikasi Bayaran"
              >
                <Mail className="w-4 h-4 text-emerald-400" />
                <span>Notifikasi Emel</span>
              </button>

              {/* Admin Access & RBAC Controls */}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setIsUserManagementOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 h-9 bg-indigo-950/40 hover:bg-indigo-900/50 text-indigo-300 border border-indigo-500/40 rounded text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
                  title="Urus pengguna dan tetapkan tahap penggunaan (RBAC)"
                >
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <span>Urus Pengguna (RBAC)</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleExportJSON}
                className="hidden sm:flex items-center gap-1.5 px-3 h-9 bg-[#1b2b3f] hover:bg-[#2a3a4f] text-[#d3e4fe] rounded text-xs font-medium transition-colors border border-[#334155] shadow-xs"
                title="Export database JSON"
              >
                <Download className="w-4 h-4 text-[#adc6ff]" />
                <span>Export Backup</span>
              </button>

              {hasPermission('canCreateProgramme') ? (
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 h-9 bg-[#4d8eff] hover:bg-[#adc6ff] text-[#00285d] rounded text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add Programme</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="flex items-center gap-1.5 px-4 h-9 bg-[#1b2b3f]/60 text-[#8c909f] border border-[#1b2b3f] rounded text-xs font-medium cursor-not-allowed opacity-60"
                  title="Perlu peranan Editor atau Admin untuk menambah kontrak program baharu"
                >
                  <Lock className="w-3.5 h-3.5 text-[#8c909f]" />
                  <span>Add Programme (Restricted)</span>
                </button>
              )}
            </div>
          </section>

          {/* Metric KPI Cards with Linear Visualizations */}
          <MetricCards
            activeCount={stats.activeCount}
            totalVolume={stats.totalVolume}
            urgentDueCount={stats.urgentDueCount}
            immediateCashOutlay={stats.immediateCashOutlay}
            pendingDeliverablesCount={stats.pendingDeliverablesCount}
            totalPaidAmount={stats.totalPaidAmount}
            settledMilestonesCount={stats.settledMilestonesCount}
          />

          {/* Executive Urgent Payment Alerts Section (High Visibility) */}
          <UrgentAlerts
            urgentItems={urgentMilestones}
            onMarkAsPaid={handleMarkAsPaid}
          />

          {/* Programme Master List & Sub-Tables */}
          <ProgrammeList
            programmes={filteredProgrammes}
            currentFilter={currentFilter}
            onFilterChange={setCurrentFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onToggleMaterial={handleToggleMaterial}
            onToggleInvoice={handleToggleInvoice}
            onMarkAsPaid={handleMarkAsPaid}
            onDeleteProgramme={handleDeleteProgramme}
            onEditProgramme={(prog) => setEditingProgramme(prog)}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onSendPaymentEmail={(prog, milestone) => setEmailModalTarget({ programme: prog, milestone })}
            tabCounts={stats.tabCounts}
          />
        </main>
      </div>

      {/* Add Programme Modal */}
      <AddProgrammeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddProgramme={handleAddProgramme}
      />

      {/* Edit Programme Modal */}
      <EditProgrammeModal
        isOpen={!!editingProgramme}
        programme={editingProgramme}
        onClose={() => setEditingProgramme(null)}
        onUpdateProgramme={handleUpdateProgramme}
      />

      {/* Google Sheets Report Generator Modal */}
      <GoogleSheetsReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        programmes={programmes}
        onShowToast={showToast}
      />

      {/* Email Notification Settings & Log Modal */}
      <EmailNotificationModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        onShowToast={showToast}
        lastSentNotification={lastSentNotification}
      />

      {/* Send Payment Paid Notification via Email Modal */}
      <SendPaymentEmailModal
        isOpen={!!emailModalTarget}
        programme={emailModalTarget?.programme || null}
        milestone={emailModalTarget?.milestone || null}
        onClose={() => setEmailModalTarget(null)}
        onShowToast={showToast}
        onEmailSent={(record) => setLastSentNotification(record)}
      />

      {/* Admin User Management & Usage Level Assignment (RBAC) Modal */}
      <UserManagementModal
        isOpen={isUserManagementOpen}
        onClose={() => setIsUserManagementOpen(false)}
        onShowToast={showToast}
      />

      {/* Multiple Login & Sign Up Authentication Modal */}
      <AuthModal />
    </div>
  );
}
