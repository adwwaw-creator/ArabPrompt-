/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  writeBatch,
  query,
  orderBy,
  getDocFromServer
} from 'firebase/firestore';
import { db, auth } from './firebaseAuth';
import { PromptHistoryItem } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

/**
 * Custom error handler to capture detailed Firestore operation info as JSON string.
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Validates connection state on load per skill rules.
 */
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'visitors', 'global'));
  } catch (error: any) {
    const isOffline = error instanceof Error && 
      (error.message.includes('the client is offline') || 
       error.message.includes('unavailable') || 
       error.message.includes('Could not reach Cloud Firestore backend') ||
       (error as any).code === 'unavailable');
    
    if (isOffline) {
      console.warn("Firestore is operating in offline mode. Local persistence and cache will be used.", error?.message || error);
    } else {
      console.error("Firestore connection check failed:", error?.message || error);
    }
  }
}

/**
 * Sync user profile to users/{userId} on Google Sign-In.
 */
export async function syncUserProfile(user: any): Promise<void> {
  const userRef = doc(db, 'users', user.uid);
  const path = `users/${user.uid}`;
  try {
    const snap = await getDoc(userRef);
    const now = new Date().toISOString();
    if (!snap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        emailVerified: user.emailVerified || false,
        createdAt: now,
        lastActive: now
      });
    } else {
      await updateDoc(userRef, {
        lastActive: now
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Retrieve user nested history logs ordered by generation date.
 */
export async function getUserHistory(userId: string): Promise<PromptHistoryItem[]> {
  const path = `users/${userId}/history`;
  try {
    const colRef = collection(db, 'users', userId, 'history');
    const q = query(colRef, orderBy('timestamp', 'desc'));
    const snap = await getDocs(q);
    const items: PromptHistoryItem[] = [];
    snap.forEach((doc) => {
      items.push(doc.data() as PromptHistoryItem);
    });
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

/**
 * Saves a new prompt logging record to users/{userId}/history/{itemId}.
 */
export async function addUserHistoryItem(userId: string, item: PromptHistoryItem): Promise<void> {
  const path = `users/${userId}/history/${item.id}`;
  try {
    // Ensure parent user profile exists first (relational sync blueprint/Master Gate helper)
    await syncUserProfile({
      uid: userId,
      email: auth.currentUser?.email,
      displayName: auth.currentUser?.displayName,
      photoURL: auth.currentUser?.photoURL,
      emailVerified: auth.currentUser?.emailVerified
    });

    const docRef = doc(db, 'users', userId, 'history', item.id);
    await setDoc(docRef, item);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Updates an attribute inside a single history record.
 */
export async function updateUserHistoryItem(userId: string, itemId: string, updates: Partial<PromptHistoryItem>): Promise<void> {
  const path = `users/${userId}/history/${itemId}`;
  try {
    const docRef = doc(db, 'users', userId, 'history', itemId);
    await updateDoc(docRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Exclude or delete a specific history record globally.
 */
export async function deleteUserHistoryItem(userId: string, itemId: string): Promise<void> {
  const path = `users/${userId}/history/${itemId}`;
  try {
    const docRef = doc(db, 'users', userId, 'history', itemId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Exclude or delete multiple history records globally.
 */
export async function deleteMultipleUserHistoryItems(userId: string, itemIds: string[]): Promise<void> {
  const path = `users/${userId}/history`;
  try {
    const batch = writeBatch(db);
    itemIds.forEach((itemId) => {
      const docRef = doc(db, 'users', userId, 'history', itemId);
      batch.delete(docRef);
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Complete teardown of an authenticated history log context.
 */
export async function clearUserHistory(userId: string): Promise<void> {
  const path = `users/${userId}/history`;
  try {
    const colRef = collection(db, 'users', userId, 'history');
    const snap = await getDocs(colRef);
    const batch = writeBatch(db);
    snap.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Merges local and Firestore collections, ensuring local records upload.
 */
export async function syncAllHistoryToFirestore(userId: string, localItems: PromptHistoryItem[]): Promise<PromptHistoryItem[]> {
  const path = `users/${userId}/history`;
  try {
    // 1. Force ensure user profile is in sync
    await syncUserProfile({
      uid: userId,
      email: auth.currentUser?.email,
      displayName: auth.currentUser?.displayName,
      photoURL: auth.currentUser?.photoURL,
      emailVerified: auth.currentUser?.emailVerified
    });

    // 2. Fetch server-side documents
    const serverItems = await getUserHistory(userId);
    const serverIds = new Set(serverItems.map(item => item.id));

    // 3. Find missing items that were generated prior to login or stored locally
    const toUpload = localItems.filter(item => !serverIds.has(item.id));
    if (toUpload.length > 0) {
      const batch = writeBatch(db);
      toUpload.forEach((item) => {
        const docRef = doc(db, 'users', userId, 'history', item.id);
        batch.set(docRef, item);
      });
      await batch.commit();
    }

    // 4. Return combined records
    return await getUserHistory(userId);
  } catch (error) {
    console.warn("Firestore syncAllHistoryToFirestore skipped due to connectivity issue. Operating on offline local items:", error);
    return localItems;
  }
}
