import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import {
  auth,
  loginWithGoogle,
  loginWithEmail,
  registerWithEmail,
  logoutUser,
  testConnection,
} from '../firebase/config';
import {
  saveUserProfile,
  getUserProfile,
  subscribeToUserProfile,
} from '../firebase/service';
import { UserProfile, UserRole, UserPermissions } from '../types';
import {
  isSystemAdminEmail,
  ROLE_DEFAULT_PERMISSIONS,
  getUserRole,
  hasPermission as checkPermission,
} from '../utils/rbac';

export type AuthMode = 'signin' | 'signup';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  role: UserRole;
  isAdmin: boolean;
  permissions: UserPermissions;
  hasPermission: (permission: keyof UserPermissions) => boolean;
  isLoading: boolean;
  isCloudConnected: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, displayName?: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  isAuthModalOpen: boolean;
  authModalMode: AuthMode;
  openAuthModal: (mode?: AuthMode) => void;
  closeAuthModal: () => void;
  setAuthModalMode: (mode: AuthMode) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<AuthMode>('signin');

  useEffect(() => {
    testConnection().catch(() => {
      setIsCloudConnected(false);
    });

    let profileUnsub: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(
      auth,
      async (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
          const userEmail = currentUser.email || '';
          const isAdminUser = isSystemAdminEmail(userEmail);

          try {
            // Check existing profile in Firestore
            const existingProfile = await getUserProfile(currentUser.uid);
            const resolvedRole: UserRole = isAdminUser
              ? 'admin'
              : existingProfile?.role || 'viewer';

            const defaultPerms = ROLE_DEFAULT_PERMISSIONS[resolvedRole];
            const mergedPermissions = {
              ...defaultPerms,
              ...(existingProfile?.permissions || {}),
              ...(isAdminUser ? ROLE_DEFAULT_PERMISSIONS.admin : {}),
            };

            const profile: UserProfile = {
              id: currentUser.uid,
              email: userEmail,
              displayName: currentUser.displayName || existingProfile?.displayName || undefined,
              photoURL: currentUser.photoURL || existingProfile?.photoURL || undefined,
              role: resolvedRole,
              permissions: mergedPermissions,
              status: existingProfile?.status || 'active',
              createdAt: existingProfile?.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              assignedBy: isAdminUser ? 'System Bootstrapper' : existingProfile?.assignedBy,
            };

            setUserProfile(profile);

            // Persist synced profile
            await saveUserProfile(profile);

            // Listen to real-time profile updates (e.g. if an Admin updates their role or permissions in real-time)
            profileUnsub = subscribeToUserProfile(currentUser.uid, (updatedProfile) => {
              if (updatedProfile) {
                const liveIsAdmin = isSystemAdminEmail(updatedProfile.email);
                const finalRole: UserRole = liveIsAdmin ? 'admin' : updatedProfile.role;
                setUserProfile({
                  ...updatedProfile,
                  role: finalRole,
                  permissions: {
                    ...ROLE_DEFAULT_PERMISSIONS[finalRole],
                    ...(updatedProfile.permissions || {}),
                    ...(liveIsAdmin ? ROLE_DEFAULT_PERMISSIONS.admin : {}),
                  },
                });
              }
            });
          } catch (err) {
            console.warn('Could not sync user profile to Firestore:', err);
            // Fallback local profile
            const fallbackRole: UserRole = isAdminUser ? 'admin' : 'viewer';
            setUserProfile({
              id: currentUser.uid,
              email: userEmail,
              displayName: currentUser.displayName || undefined,
              photoURL: currentUser.photoURL || undefined,
              role: fallbackRole,
              permissions: ROLE_DEFAULT_PERMISSIONS[fallbackRole],
              status: 'active',
              createdAt: new Date().toISOString(),
            });
          }
        } else {
          setUserProfile(null);
          if (profileUnsub) {
            profileUnsub();
            profileUnsub = null;
          }
        }
        setIsLoading(false);
      },
      (error) => {
        console.error('Auth state listener error:', error);
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribeAuth();
      if (profileUnsub) profileUnsub();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      await loginWithGoogle();
      setIsAuthModalOpen(false);
    } catch (error) {
      console.error('Google Sign-In failed:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      await loginWithEmail(email, pass);
      setIsAuthModalOpen(false);
    } catch (error) {
      console.error('Email Sign-In failed:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, displayName?: string) => {
    try {
      await registerWithEmail(email, pass, displayName);
      setIsAuthModalOpen(false);
    } catch (error) {
      console.error('Email Registration failed:', error);
      throw error;
    }
  };

  const signOutUser = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    }
  };

  const openAuthModal = (mode: AuthMode = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const currentRole: UserRole = getUserRole(userProfile, user?.email);
  const currentIsAdmin: boolean = isSystemAdminEmail(user?.email) || currentRole === 'admin';
  const effectivePermissions: UserPermissions = {
    ...ROLE_DEFAULT_PERMISSIONS[currentRole],
    ...(userProfile?.permissions || {}),
    ...(currentIsAdmin ? ROLE_DEFAULT_PERMISSIONS.admin : {}),
  };

  const hasPerm = (permission: keyof UserPermissions): boolean => {
    return checkPermission(userProfile, user?.email, permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        role: currentRole,
        isAdmin: currentIsAdmin,
        permissions: effectivePermissions,
        hasPermission: hasPerm,
        isLoading,
        isCloudConnected,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOutUser,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        setAuthModalMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
