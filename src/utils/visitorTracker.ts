/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from './firebaseAuth';

const STORAGE_VISITED_KEY = 'arabprompt_unique_visited';
const STORAGE_BACKUP_COUNT_KEY = 'arabprompt_fallback_visitor_count';

// Base starter stats index to look established and elegant
const DEFAULT_INITIAL_VISITORS = 1538;

export interface VisitorStats {
  count: number;
  isRealtime: boolean;
  isNew: boolean;
}

/**
 * Handles unique visitor counting with safe Firestore integrations & graceful simulation fallbacks.
 */
export async function trackUniqueVisitor(): Promise<VisitorStats> {
  const isReturning = localStorage.getItem(STORAGE_VISITED_KEY) === 'true';
  const isNew = !isReturning;

  // Set the visitor key locally to prevent double count
  if (isNew) {
    localStorage.setItem(STORAGE_VISITED_KEY, 'true');
  }

  // Define Firestore doc reference
  const docRef = doc(db, 'visitors', 'global');

  try {
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      let finalCount = docSnap.data().count || DEFAULT_INITIAL_VISITORS;
      if (isNew) {
        finalCount += 1;
        await updateDoc(docRef, {
          count: increment(1),
          updatedAt: new Date().toISOString()
        });
      }
      // Backup locally so if they reload offline, we have the accurate value
      localStorage.setItem(STORAGE_BACKUP_COUNT_KEY, String(finalCount));
      return {
        count: finalCount,
        isRealtime: true,
        isNew
      };
    } else {
      // Document does not exist yet: initialize it
      const initialCount = DEFAULT_INITIAL_VISITORS + (isNew ? 1 : 0);
      await setDoc(docRef, {
        count: initialCount,
        updatedAt: new Date().toISOString()
      });
      localStorage.setItem(STORAGE_BACKUP_COUNT_KEY, String(initialCount));
      return {
        count: initialCount,
        isRealtime: true,
        isNew
      };
    }
  } catch (error) {
    console.warn('Firestore visitor counting failed (Using elegant local simulated tracker):', error);
    
    // Graceful fallback simulation
    let fallbackCountStr = localStorage.getItem(STORAGE_BACKUP_COUNT_KEY);
    let fallbackCount = fallbackCountStr ? parseInt(fallbackCountStr, 10) : DEFAULT_INITIAL_VISITORS;

    if (isNew) {
      fallbackCount += 1;
      localStorage.setItem(STORAGE_BACKUP_COUNT_KEY, String(fallbackCount));
    }

    return {
      count: fallbackCount,
      isRealtime: false,
      isNew
    };
  }
}
