import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  Unsubscribe,
  getDocs,
  getDoc,
} from 'firebase/firestore';
import { db } from './config';
import { handleFirestoreError, OperationType } from './errors';
import { Programme, EmailNotificationRecord, UserProfile, UserRole, UserPermissions } from '../types';
import { isSystemAdminEmail, ROLE_DEFAULT_PERMISSIONS } from '../utils/rbac';

const PROGRAMMES_COLLECTION = 'programmes';
const USERS_COLLECTION = 'users';
const NOTIFICATIONS_COLLECTION = 'emailNotifications';

// Clean object helper to ensure no undefined values are written to Firestore
function sanitizeData<T extends Record<string, any>>(obj: T): T {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        result[key] = value.map((item) =>
          typeof item === 'object' && item !== null ? sanitizeData(item) : item
        );
      } else if (typeof value === 'object' && value !== null) {
        result[key] = sanitizeData(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result as T;
}

/**
 * Subscribe to real-time changes for a user's programmes
 */
export function subscribeToProgrammes(
  userId: string,
  onSuccess: (programmes: Programme[]) => void,
  onError?: (error: unknown) => void
): Unsubscribe {
  const programmesQuery = query(
    collection(db, PROGRAMMES_COLLECTION),
    where('userId', '==', userId)
  );

  return onSnapshot(
    programmesQuery,
    (snapshot) => {
      const items: Programme[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as Programme);
      });
      // Sort newest first by creation date
      items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      onSuccess(items);
    },
    (error) => {
      console.error('Error listening to programmes:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, PROGRAMMES_COLLECTION);
    }
  );
}

/**
 * Save or update a TV programme document in Firestore
 */
export async function saveProgrammeDoc(
  programme: Programme,
  userId: string
): Promise<void> {
  const docPath = `${PROGRAMMES_COLLECTION}/${programme.id}`;
  try {
    const payload = sanitizeData({
      ...programme,
      userId,
      updatedAt: new Date().toISOString(),
    });
    const docRef = doc(db, PROGRAMMES_COLLECTION, programme.id);
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

/**
 * Delete a TV programme document from Firestore
 */
export async function deleteProgrammeDoc(programmeId: string): Promise<void> {
  const docPath = `${PROGRAMMES_COLLECTION}/${programmeId}`;
  try {
    const docRef = doc(db, PROGRAMMES_COLLECTION, programmeId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

/**
 * Subscribe to all programmes across the platform (Admin privilege)
 */
export function subscribeToAllProgrammes(
  onSuccess: (programmes: Programme[]) => void,
  onError?: (error: unknown) => void
): Unsubscribe {
  const programmesQuery = collection(db, PROGRAMMES_COLLECTION);

  return onSnapshot(
    programmesQuery,
    (snapshot) => {
      const items: Programme[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as Programme);
      });
      items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      onSuccess(items);
    },
    (error) => {
      console.error('Error listening to all programmes:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, PROGRAMMES_COLLECTION);
    }
  );
}

/**
 * Get user profile by userId
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const docPath = `${USERS_COLLECTION}/${userId}`;
  try {
    const docRef = doc(db, USERS_COLLECTION, userId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return snap.data() as UserProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, docPath);
    return null;
  }
}

/**
 * Subscribe to a specific user's profile changes
 */
export function subscribeToUserProfile(
  userId: string,
  onUpdate: (profile: UserProfile | null) => void
): Unsubscribe {
  const docRef = doc(db, USERS_COLLECTION, userId);
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        onUpdate(snap.data() as UserProfile);
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      console.error('Error listening to user profile:', error);
      handleFirestoreError(error, OperationType.GET, `${USERS_COLLECTION}/${userId}`);
    }
  );
}

/**
 * Subscribe to all registered user accounts (Admin privilege)
 */
export function subscribeToAllUsers(
  onSuccess: (users: UserProfile[]) => void,
  onError?: (error: unknown) => void
): Unsubscribe {
  const usersCollectionRef = collection(db, USERS_COLLECTION);

  return onSnapshot(
    usersCollectionRef,
    (snapshot) => {
      const users: UserProfile[] = [];
      snapshot.forEach((docSnap) => {
        users.push(docSnap.data() as UserProfile);
      });
      // Sort admins first, then by email
      users.sort((a, b) => {
        if (a.role === 'admin' && b.role !== 'admin') return -1;
        if (a.role !== 'admin' && b.role === 'admin') return 1;
        return a.email.localeCompare(b.email);
      });
      onSuccess(users);
    },
    (error) => {
      console.error('Error subscribing to all users:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, USERS_COLLECTION);
    }
  );
}

/**
 * Admin assigns level of usage (role) and granular permissions for a user
 */
export async function updateUserRoleAndPermissions(
  targetUserId: string,
  role: UserRole,
  permissions: Partial<UserPermissions>,
  status: 'active' | 'suspended',
  adminEmail: string
): Promise<void> {
  const docPath = `${USERS_COLLECTION}/${targetUserId}`;
  try {
    const docRef = doc(db, USERS_COLLECTION, targetUserId);
    const existingSnap = await getDoc(docRef);
    const existingData = existingSnap.exists() ? existingSnap.data() : {};

    const payload = sanitizeData({
      ...existingData,
      id: targetUserId,
      role,
      permissions,
      status,
      assignedBy: adminEmail,
      updatedAt: new Date().toISOString(),
    });

    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

/**
 * Admin deletes a user record
 */
export async function deleteUserAccountDoc(userId: string): Promise<void> {
  const docPath = `${USERS_COLLECTION}/${userId}`;
  try {
    const docRef = doc(db, USERS_COLLECTION, userId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

/**
 * Save or update user profile upon authentication
 */
export async function saveUserProfile(user: UserProfile): Promise<void> {
  const docPath = `${USERS_COLLECTION}/${user.id}`;
  try {
    const payload = sanitizeData(user);
    const docRef = doc(db, USERS_COLLECTION, user.id);
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

/**
 * Log disbursement remittance notification to Firestore
 */
export async function logEmailNotificationDoc(
  record: EmailNotificationRecord,
  userId: string
): Promise<void> {
  const docPath = `${NOTIFICATIONS_COLLECTION}/${record.id}`;
  try {
    const payload = sanitizeData({
      ...record,
      userId,
    });
    const docRef = doc(db, NOTIFICATIONS_COLLECTION, record.id);
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

/**
 * Sync initial local storage programmes to Firestore if user's cloud collection is empty
 */
export async function seedUserProgrammesIfEmpty(
  localProgrammes: Programme[],
  userId: string
): Promise<void> {
  try {
    const programmesQuery = query(
      collection(db, PROGRAMMES_COLLECTION),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(programmesQuery);
    if (snapshot.empty && localProgrammes.length > 0) {
      for (const prog of localProgrammes) {
        await saveProgrammeDoc(prog, userId);
      }
    }
  } catch (error) {
    console.warn('Initial programme sync skipped or deferred:', error);
  }
}
