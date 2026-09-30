import { UserProfile } from '../types';

export type UserRole = 'admin' | 'manager' | 'editor' | 'viewer';

export interface UserPermissions {
  canCreateProgramme: boolean;
  canEditProgramme: boolean;
  canDeleteProgramme: boolean;
  canMarkPaid: boolean;
  canSendEmail: boolean;
  canExportReports: boolean;
  canManageFx: boolean;
  canManageUsers: boolean;
}

export const ADMIN_ACCOUNTS = [
  {
    email: 'mohdhafizaw89@gmail.com',
    name: 'Mohd Hafiz',
    title: 'Lead Super Admin / Rights Director',
    isPrimary: true,
  },
  {
    email: 'admin2@rightsflow.com',
    name: 'Broadcast Operations Admin',
    title: 'Co-Admin / Head of Broadcast Operations',
    isPrimary: false,
  },
];

export const ADMIN_EMAILS: string[] = ADMIN_ACCOUNTS.map((a) => a.email.toLowerCase());

export const ROLE_DEFAULT_PERMISSIONS: Record<UserRole, UserPermissions> = {
  admin: {
    canCreateProgramme: true,
    canEditProgramme: true,
    canDeleteProgramme: true,
    canMarkPaid: true,
    canSendEmail: true,
    canExportReports: true,
    canManageFx: true,
    canManageUsers: true,
  },
  manager: {
    canCreateProgramme: true,
    canEditProgramme: true,
    canDeleteProgramme: false,
    canMarkPaid: true,
    canSendEmail: true,
    canExportReports: true,
    canManageFx: true,
    canManageUsers: false,
  },
  editor: {
    canCreateProgramme: true,
    canEditProgramme: true,
    canDeleteProgramme: false,
    canMarkPaid: false,
    canSendEmail: false,
    canExportReports: true,
    canManageFx: false,
    canManageUsers: false,
  },
  viewer: {
    canCreateProgramme: false,
    canEditProgramme: false,
    canDeleteProgramme: false,
    canMarkPaid: false,
    canSendEmail: false,
    canExportReports: true,
    canManageFx: false,
    canManageUsers: false,
  },
};

export const ROLE_LABELS: Record<UserRole, { label: string; badge: string; desc: string }> = {
  admin: {
    label: 'Pentadbir Penuh (Admin)',
    badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    desc: 'Akses penuh ke semua fungsi sistem, kelulusan bayaran & pengurusan peranan pengguna.',
  },
  manager: {
    label: 'Pengurus Kewangan (Manager)',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    desc: 'Boleh sunting kontrak, luluskan bayaran & hantar notifikasi emel rasmi.',
  },
  editor: {
    label: 'Penyunting Kontrak (Editor)',
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    desc: 'Boleh daftar dan kemas kini program TV serta jadual milestone.',
  },
  viewer: {
    label: 'Pemerhati / Audit (Viewer)',
    badge: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    desc: 'Akses baca sahaja (read-only) untuk semakan lejar, laporan & audit.',
  },
};

export function isSystemAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

export function getUserRole(profile?: UserProfile | null, email?: string | null): UserRole {
  if (isSystemAdminEmail(email || profile?.email)) {
    return 'admin';
  }
  return profile?.role || 'viewer';
}

export function hasPermission(
  profile: UserProfile | null | undefined,
  email: string | null | undefined,
  permission: keyof UserPermissions
): boolean {
  // Master Admin accounts always have full permission
  if (isSystemAdminEmail(email || profile?.email)) {
    return true;
  }
  if (!profile) return false;
  if (profile.status === 'suspended') return false;
  if (profile.role === 'admin') return true;

  return Boolean(profile.permissions?.[permission]);
}
