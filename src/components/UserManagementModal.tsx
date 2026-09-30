import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  Users,
  UserPlus,
  Check,
  X,
  AlertTriangle,
  Lock,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Sliders,
  CheckCircle2,
  Building,
} from 'lucide-react';
import { UserProfile, UserRole, UserPermissions } from '../types';
import {
  ADMIN_ACCOUNTS,
  ROLE_LABELS,
  ROLE_DEFAULT_PERMISSIONS,
  isSystemAdminEmail,
} from '../utils/rbac';
import {
  subscribeToAllUsers,
  updateUserRoleAndPermissions,
} from '../firebase/service';
import { useAuth } from '../context/AuthContext';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (message: string, type?: 'info' | 'success' | 'urgent') => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const { user: currentUser, userProfile: currentUserProfile, isAdmin } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);

  // Invite/Assign new user form state
  const [newEmail, setNewEmail] = useState<string>('');
  const [newName, setNewName] = useState<string>('');
  const [newRole, setNewRole] = useState<UserRole>('editor');
  const [isAddingUser, setIsAddingUser] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    const unsubscribe = subscribeToAllUsers(
      (userList) => {
        // Ensure both default admin accounts are represented in the list even if offline
        const populatedList = [...userList];
        ADMIN_ACCOUNTS.forEach((adminAcc) => {
          const exists = populatedList.some(
            (u) => u.email.toLowerCase() === adminAcc.email.toLowerCase()
          );
          if (!exists) {
            populatedList.unshift({
              id: `sys-${adminAcc.email.replace(/[@.]/g, '-')}`,
              email: adminAcc.email,
              displayName: adminAcc.name,
              role: 'admin',
              permissions: ROLE_DEFAULT_PERMISSIONS.admin,
              status: 'active',
              createdAt: '2026-01-01T00:00:00.000Z',
              assignedBy: 'System Bootstrap',
            });
          }
        });
        setUsers(populatedList);
        setLoading(false);
      },
      (err) => {
        console.warn('Could not subscribe to all users:', err);
        // Fallback with preset accounts
        setUsers(
          ADMIN_ACCOUNTS.map((acc, idx) => ({
            id: `admin-${idx + 1}`,
            email: acc.email,
            displayName: acc.name,
            role: 'admin',
            permissions: ROLE_DEFAULT_PERMISSIONS.admin,
            status: 'active',
            createdAt: '2026-01-01T00:00:00.000Z',
          }))
        );
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRoleChange = async (targetUser: UserProfile, newRole: UserRole) => {
    if (!isAdmin) {
      onShowToast('Hanya akaun Pentadbir (Admin) dibenarkan menukar peranan pengguna.', 'urgent');
      return;
    }

    if (isSystemAdminEmail(targetUser.email) && newRole !== 'admin') {
      onShowToast('Akaun Master Admin sistem tidak boleh diturunkan taraf peranan.', 'urgent');
      return;
    }

    setSavingUserId(targetUser.id);
    try {
      const newPerms = {
        ...ROLE_DEFAULT_PERMISSIONS[newRole],
        ...(targetUser.permissions || {}),
      };

      await updateUserRoleAndPermissions(
        targetUser.id,
        newRole,
        newPerms,
        targetUser.status || 'active',
        currentUser?.email || 'admin'
      );

      // Local state update for immediate snappy feedback
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, role: newRole, permissions: newPerms } : u))
      );

      onShowToast(
        `Peranan untuk ${targetUser.email} dikemaskini kepada: ${ROLE_LABELS[newRole].label}`,
        'success'
      );
    } catch (err) {
      console.error('Failed to update user role:', err);
      onShowToast('Gagal mengemas kini peranan pengguna di pangkalan data.', 'urgent');
    } finally {
      setSavingUserId(null);
    }
  };

  const handleTogglePermission = async (
    targetUser: UserProfile,
    permKey: keyof UserPermissions
  ) => {
    if (!isAdmin) {
      onShowToast('Hanya akaun Pentadbir dibenarkan mengubah suai kebenaran modul.', 'urgent');
      return;
    }

    if (isSystemAdminEmail(targetUser.email)) {
      onShowToast('Akaun Pentadbir Utama sentiasa mempunyai akses penuh ke semua fungsi.', 'info');
      return;
    }

    setSavingUserId(targetUser.id);
    try {
      const currentPerms = {
        ...ROLE_DEFAULT_PERMISSIONS[targetUser.role],
        ...(targetUser.permissions || {}),
      };
      const updatedPerms = {
        ...currentPerms,
        [permKey]: !currentPerms[permKey],
      };

      await updateUserRoleAndPermissions(
        targetUser.id,
        targetUser.role,
        updatedPerms,
        targetUser.status || 'active',
        currentUser?.email || 'admin'
      );

      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, permissions: updatedPerms } : u))
      );

      onShowToast(`Kebenaran [${permKey}] untuk ${targetUser.email} telah dikemas kini.`, 'info');
    } catch (err) {
      console.error('Failed to toggle permission:', err);
      onShowToast('Gagal mengemas kini kebenaran modul.', 'urgent');
    } finally {
      setSavingUserId(null);
    }
  };

  const handleToggleStatus = async (targetUser: UserProfile) => {
    if (!isAdmin) {
      onShowToast('Hanya akaun Pentadbir dibenarkan menggantung akses pengguna.', 'urgent');
      return;
    }

    if (isSystemAdminEmail(targetUser.email)) {
      onShowToast('Akaun Pentadbir Utama tidak boleh digantung akses.', 'urgent');
      return;
    }

    const nextStatus = targetUser.status === 'suspended' ? 'active' : 'suspended';
    setSavingUserId(targetUser.id);
    try {
      await updateUserRoleAndPermissions(
        targetUser.id,
        targetUser.role,
        targetUser.permissions || ROLE_DEFAULT_PERMISSIONS[targetUser.role],
        nextStatus,
        currentUser?.email || 'admin'
      );

      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, status: nextStatus } : u))
      );

      onShowToast(
        `Status akaun ${targetUser.email} kini: ${nextStatus === 'active' ? 'Aktif' : 'Digantung (Suspended)'}`,
        nextStatus === 'active' ? 'success' : 'urgent'
      );
    } catch (err) {
      console.error('Failed to change user status:', err);
      onShowToast('Gagal menukar status akaun.', 'urgent');
    } finally {
      setSavingUserId(null);
    }
  };

  const handleAddNewUserAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes('@')) {
      onShowToast('Sila masukkan alamat emel yang sah.', 'urgent');
      return;
    }

    setIsAddingUser(true);
    try {
      const generatedId = `usr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const permissions = ROLE_DEFAULT_PERMISSIONS[newRole];

      await updateUserRoleAndPermissions(
        generatedId,
        newRole,
        permissions,
        'active',
        currentUser?.email || 'admin'
      );

      const createdUser: UserProfile = {
        id: generatedId,
        email: newEmail.trim().toLowerCase(),
        displayName: newName.trim() || undefined,
        role: newRole,
        permissions,
        status: 'active',
        createdAt: new Date().toISOString(),
        assignedBy: currentUser?.email || 'admin',
      };

      setUsers((prev) => [createdUser, ...prev]);
      setNewEmail('');
      setNewName('');
      setNewRole('editor');
      onShowToast(
        `Akaun baharu untuk ${newEmail} berjaya didaftarkan dengan peranan ${ROLE_LABELS[newRole].label}!`,
        'success'
      );
    } catch (err) {
      console.error('Error adding user assignment:', err);
      onShowToast('Gagal mendaftar tahap peranan pengguna baharu.', 'urgent');
    } finally {
      setIsAddingUser(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#102034] border border-[#1b2b3f] rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#1b2b3f] flex items-center justify-between bg-[#0b1c30]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#d3e4fe]">
                  Pengurusan Pengguna & Tahap Akses (RBAC)
                </h3>
                <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
                  2 Master Admins
                </span>
              </div>
              <p className="text-xs text-[#8c909f]">
                Dua akaun pentadbir utama berkuasa penuh mengurus peranan & had akses bagi setiap kakitangan
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

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex flex-col gap-6">
          {/* Two Master Admin Highlight Cards */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-[#adc6ff] uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              2 Akaun Pentadbir Utama (Access All Functions)
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ADMIN_ACCOUNTS.map((admin, idx) => {
                const isCurrentLogged = currentUser?.email?.toLowerCase() === admin.email.toLowerCase();
                return (
                  <div
                    key={admin.email}
                    className={`p-4 rounded-xl border flex flex-col justify-between gap-2.5 transition-all ${
                      isCurrentLogged
                        ? 'bg-indigo-950/30 border-indigo-500/50 shadow-md ring-1 ring-indigo-500/30'
                        : 'bg-[#000f21] border-[#1b2b3f]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-bold flex items-center justify-center text-xs">
                          A{idx + 1}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-[#d3e4fe] flex items-center gap-1.5">
                            <span>{admin.name}</span>
                            {isCurrentLogged && (
                              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">
                                Akaun Semasa
                              </span>
                            )}
                          </h4>
                          <span className="text-[11px] text-[#adc6ff] font-mono">
                            {admin.email}
                          </span>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px] font-bold shrink-0">
                        {admin.isPrimary ? 'Super Admin' : 'Co-Admin'}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#8c909f] leading-snug">
                      {admin.title}. Mempunyai hak cipta, kemas kini, kelulusan bayaran, notifikasi emel & penetapan tahap peranan pengguna lain.
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form: Assign / Register New User with Usage Level */}
          <div className="p-4 rounded-xl bg-[#000f21] border border-[#1b2b3f] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#d3e4fe] flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-emerald-400" />
                Tetapkan Tahap Penggunaan Pengguna Baharu (*Assign Usage Level*)
              </span>
            </div>

            <form onSubmit={handleAddNewUserAssignment} className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              <div className="sm:col-span-1">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nama Pengguna (cth: Siti Sarah)"
                  className="w-full px-3 py-2 bg-[#102034] border border-[#1b2b3f] rounded-lg text-xs text-[#d3e4fe] placeholder:text-[#424754] focus:outline-none focus:border-[#4d8eff]"
                />
              </div>

              <div className="sm:col-span-1">
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Emel Pengguna (*)"
                  className="w-full px-3 py-2 bg-[#102034] border border-[#1b2b3f] rounded-lg text-xs text-[#d3e4fe] placeholder:text-[#424754] focus:outline-none focus:border-[#4d8eff]"
                />
              </div>

              <div className="sm:col-span-1">
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-[#102034] border border-[#1b2b3f] rounded-lg text-xs text-[#d3e4fe] focus:outline-none focus:border-[#4d8eff]"
                >
                  <option value="admin">Pentadbir Penuh (Admin)</option>
                  <option value="manager">Pengurus Kewangan (Manager)</option>
                  <option value="editor">Penyunting Kontrak (Editor)</option>
                  <option value="viewer">Pemerhati / Audit (Viewer)</option>
                </select>
              </div>

              <div className="sm:col-span-1">
                <button
                  type="submit"
                  disabled={isAddingUser}
                  className="w-full h-full min-h-[36px] px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isAddingUser ? 'Menyimpan...' : 'Simpan Peranan'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* List of All Registered Users */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#adc6ff] uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#4d8eff]" />
                Senarai Pengguna & Kawalan Tahap Penggunaan ({users.length})
              </span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-[#8c909f]">
                Memuatkan senarai pengguna dari Cloud Firestore...
              </div>
            ) : users.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-[#000f21] border border-[#1b2b3f] text-xs text-[#8c909f]">
                Tiada pengguna berdaftar selain akaun pentadbir.
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {users.map((targetUser) => {
                  const isSysAdmin = isSystemAdminEmail(targetUser.email);
                  const isExpanded = expandedUserId === targetUser.id;
                  const currentRole = targetUser.role || (isSysAdmin ? 'admin' : 'viewer');
                  const roleConfig = ROLE_LABELS[currentRole] || ROLE_LABELS.viewer;
                  const isSuspended = targetUser.status === 'suspended';

                  const effectivePerms: UserPermissions = {
                    ...ROLE_DEFAULT_PERMISSIONS[currentRole],
                    ...(targetUser.permissions || {}),
                    ...(isSysAdmin ? ROLE_DEFAULT_PERMISSIONS.admin : {}),
                  };

                  return (
                    <div
                      key={targetUser.id}
                      className={`rounded-xl border transition-all ${
                        isSuspended
                          ? 'bg-red-950/10 border-red-500/20 opacity-75'
                          : 'bg-[#000f21] border-[#1b2b3f]'
                      }`}
                    >
                      {/* User Row Header */}
                      <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0 ${
                              currentRole === 'admin'
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                                : currentRole === 'manager'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : currentRole === 'editor'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                                : 'bg-slate-500/20 text-slate-300 border border-slate-500/40'
                            }`}
                          >
                            {targetUser.displayName
                              ? targetUser.displayName[0]
                              : targetUser.email[0]}
                          </div>

                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[#d3e4fe]">
                                {targetUser.displayName || targetUser.email.split('@')[0]}
                              </span>
                              {isSuspended && (
                                <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 text-[9px] font-bold">
                                  Digantung
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-[#8c909f] font-mono">
                              {targetUser.email}
                            </span>
                          </div>
                        </div>

                        {/* Actions & Role Selector */}
                        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                          {/* Role Selector */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-[#8c909f] hidden sm:inline">Peranan:</span>
                            <select
                              value={currentRole}
                              disabled={isSysAdmin || savingUserId === targetUser.id || !isAdmin}
                              onChange={(e) => handleRoleChange(targetUser, e.target.value as UserRole)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border outline-none cursor-pointer transition-colors ${
                                roleConfig.badge
                              } ${
                                isSysAdmin ? 'opacity-80 cursor-not-allowed' : 'hover:border-[#4d8eff]'
                              }`}
                            >
                              <option value="admin" className="bg-[#102034] text-[#d3e4fe]">
                                Pentadbir (Admin)
                              </option>
                              <option value="manager" className="bg-[#102034] text-[#d3e4fe]">
                                Pengurus (Manager)
                              </option>
                              <option value="editor" className="bg-[#102034] text-[#d3e4fe]">
                                Penyunting (Editor)
                              </option>
                              <option value="viewer" className="bg-[#102034] text-[#d3e4fe]">
                                Pemerhati (Viewer)
                              </option>
                            </select>
                          </div>

                          {/* Granular Permission Toggle Dropdown */}
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedUserId(isExpanded ? null : targetUser.id)
                            }
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#102034] hover:bg-[#1b2b3f] text-[#d3e4fe] border border-[#1b2b3f] text-xs font-medium transition-colors cursor-pointer"
                            title="Konfigurasi kebenaran fungsi terperinci"
                          >
                            <Sliders className="w-3.5 h-3.5 text-[#adc6ff]" />
                            <span className="hidden md:inline">Kebenaran</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3 h-3 text-[#8c909f]" />
                            ) : (
                              <ChevronDown className="w-3 h-3 text-[#8c909f]" />
                            )}
                          </button>

                          {/* Suspend / Activate Button */}
                          {!isSysAdmin && (
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(targetUser)}
                              disabled={savingUserId === targetUser.id}
                              className={`p-1.5 rounded-lg text-xs border transition-colors cursor-pointer ${
                                isSuspended
                                  ? 'bg-emerald-950/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-900/30'
                                  : 'bg-red-950/20 text-red-400 border-red-500/30 hover:bg-red-900/30'
                              }`}
                              title={isSuspended ? 'Aktifkan Semula Akaun' : 'Gantung Akses Akaun'}
                            >
                              {isSuspended ? (
                                <UserCheck className="w-3.5 h-3.5" />
                              ) : (
                                <Lock className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Expanded Granular Permissions Panel */}
                      {isExpanded && (
                        <div className="p-4 border-t border-[#1b2b3f] bg-[#071322] rounded-b-xl flex flex-col gap-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-[#adc6ff]">
                              Kebenaran Modul Terperinci ({targetUser.email}):
                            </span>
                            <span className="text-[11px] text-[#8c909f]">
                              {isSysAdmin
                                ? 'Master Admin memiliki semua hak akses secara kekal'
                                : 'Klik untuk membenarkan atau menyekat fungsi tertentu'}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                            {[
                              {
                                key: 'canCreateProgramme' as keyof UserPermissions,
                                label: 'Cipta Program TV',
                                desc: 'Daftar kontrak & jadual',
                              },
                              {
                                key: 'canEditProgramme' as keyof UserPermissions,
                                label: 'Sunting Kontrak',
                                desc: 'Ubah terma & milestone',
                              },
                              {
                                key: 'canDeleteProgramme' as keyof UserPermissions,
                                label: 'Padam Kontrak',
                                desc: 'Hapus rekod dari sistem',
                              },
                              {
                                key: 'canMarkPaid' as keyof UserPermissions,
                                label: 'Luluskan Bayaran',
                                desc: 'Tanda milestone Settled',
                              },
                              {
                                key: 'canSendEmail' as keyof UserPermissions,
                                label: 'Hantar Emel Notifikasi',
                                desc: 'Hantar slip baucar bayaran',
                              },
                              {
                                key: 'canExportReports' as keyof UserPermissions,
                                label: 'Eksport Laporan / Sheets',
                                desc: 'Muat turun Google Sheets / CSV',
                              },
                              {
                                key: 'canManageFx' as keyof UserPermissions,
                                label: 'Modul FX Treasury',
                                desc: 'Kadar pertukaran mata wang',
                              },
                              {
                                key: 'canManageUsers' as keyof UserPermissions,
                                label: 'Pengurusan Pengguna',
                                desc: 'Tugaskan peranan lain',
                              },
                            ].map((perm) => {
                              const isGranted = Boolean(effectivePerms[perm.key]);
                              return (
                                <button
                                  key={perm.key}
                                  type="button"
                                  disabled={isSysAdmin || savingUserId === targetUser.id || !isAdmin}
                                  onClick={() => handleTogglePermission(targetUser, perm.key)}
                                  className={`p-2.5 rounded-lg border text-left flex items-start gap-2 transition-all ${
                                    isGranted
                                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                                      : 'bg-[#102034] border-[#1b2b3f] text-[#8c909f]'
                                  } ${
                                    isSysAdmin || !isAdmin
                                      ? 'cursor-default'
                                      : 'hover:border-[#4d8eff] cursor-pointer'
                                  }`}
                                >
                                  <div
                                    className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 ${
                                      isGranted
                                        ? 'bg-emerald-500 text-slate-950'
                                        : 'bg-[#1b2b3f] text-[#8c909f]'
                                    }`}
                                  >
                                    {isGranted && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-semibold leading-tight text-xs text-[#d3e4fe]">
                                      {perm.label}
                                    </span>
                                    <span className="text-[10px] text-[#8c909f]">
                                      {perm.desc}
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0b1c30] border-t border-[#1b2b3f] flex items-center justify-between">
          <div className="text-xs text-[#8c909f] flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Perubahan disimpan secara masa-nyata (*real-time sync*) ke Firebase Firestore.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#1b2b3f] hover:bg-[#26364a] text-xs font-semibold text-[#d3e4fe] transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
