/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebaseAuth';

export type SubscriptionPlan = 'free' | 'lite' | 'pro' | 'studio';

export interface UserSubscription {
  plan: SubscriptionPlan;
  status: 'active' | 'cancelled' | 'trial' | 'unpaid';
  billingCycle: 'monthly' | 'annual';
  startDate: string;
  renewalDate: string;
  dailyUsageCount: number;
  lastUsageDate: string;
  bonusPromptsToday?: number;
  transactionId?: string;
  paymentMethod?: string;
}

const STORAGE_KEY = 'arabi_prompt_user_subscription';

export const PLAN_LIMITS = {
  free: {
    nameAr: 'غير مشترك (المنصة مدفوعة بالكامل)',
    nameEn: 'Unsubscribed (Paid Only)',
    maxDailyPrompts: 0,
    maxCinemaProjects: 0,
    hasFaceAnchor: false,
    hasShareSequence: false,
    hasVideoReverser: false,
    hasExportPdf: false,
    hasApiAccess: false,
    hasAds: false,
    isPaidOnly: true,
    priceMonthly: 0,
    priceAnnual: 0,
  },
  lite: {
    nameAr: 'باقة الانطلاقة (Lite)',
    nameEn: 'Starter Lite',
    maxDailyPrompts: 100,
    maxCinemaProjects: 10,
    hasFaceAnchor: false,
    hasShareSequence: true,
    hasVideoReverser: true,
    hasExportPdf: true,
    hasApiAccess: false,
    hasAds: false,
    isPaidOnly: true,
    priceMonthly: 5,
    priceAnnual: 42, // ~ $3.50/mo ($42/yr)
  },
  pro: {
    nameAr: 'باقة المحترف (Pro Creator)',
    nameEn: 'Pro Creator',
    maxDailyPrompts: 9999, // unlimited
    maxCinemaProjects: 9999, // unlimited
    hasFaceAnchor: true,
    hasShareSequence: true,
    hasVideoReverser: true,
    hasExportPdf: true,
    hasApiAccess: false,
    hasAds: false,
    isPaidOnly: true,
    priceMonthly: 9,
    priceAnnual: 84, // $7/mo ($84/yr)
  },
  studio: {
    nameAr: 'باقة الاستوديو والشركات (Studio)',
    nameEn: 'Studio & Agency',
    maxDailyPrompts: 99999,
    maxCinemaProjects: 99999,
    hasFaceAnchor: true,
    hasShareSequence: true,
    hasVideoReverser: true,
    hasExportPdf: true,
    hasApiAccess: true,
    hasAds: false,
    isPaidOnly: true,
    priceMonthly: 29,
    priceAnnual: 288, // $24/mo ($288/yr)
  }
};

const DEFAULT_SUBSCRIPTION: UserSubscription = {
  plan: 'free',
  status: 'unpaid',
  billingCycle: 'monthly',
  startDate: new Date().toISOString(),
  renewalDate: new Date().toISOString(),
  dailyUsageCount: 0,
  lastUsageDate: new Date().toISOString().split('T')[0]
};

/**
 * Checks if the user is an active paid subscriber
 */
export function isPaidSubscriber(sub?: UserSubscription): boolean {
  const current = sub || getSubscription();
  return Boolean(
    current &&
    current.status === 'active' &&
    (current.plan === 'lite' || current.plan === 'pro' || current.plan === 'studio')
  );
}

/**
 * Retrieve active subscription from localStorage
 */
export function getSubscription(): UserSubscription {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SUBSCRIPTION;
    const parsed = JSON.parse(raw) as UserSubscription;
    
    // Check if day changed to reset daily count
    const today = new Date().toISOString().split('T')[0];
    if (parsed.lastUsageDate !== today) {
      parsed.dailyUsageCount = 0;
      parsed.bonusPromptsToday = 0;
      parsed.lastUsageDate = today;
      saveSubscriptionLocally(parsed);
    }
    return parsed;
  } catch {
    return DEFAULT_SUBSCRIPTION;
  }
}

export function saveSubscriptionLocally(sub: UserSubscription): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sub));
    // Dispatch custom event to notify all components
    window.dispatchEvent(new CustomEvent('subscription-updated', { detail: sub }));
  } catch (err) {
    console.warn('Failed to save subscription locally:', err);
  }
}

/**
 * Persist subscription to Firestore if user is authenticated
 */
export async function syncSubscriptionToFirestore(userId: string, sub: UserSubscription): Promise<void> {
  if (!userId) return;
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      plan: sub.plan,
      subscriptionStatus: sub.status,
      billingCycle: sub.billingCycle,
      renewalDate: sub.renewalDate,
      dailyUsageCount: sub.dailyUsageCount,
      lastUsageDate: sub.lastUsageDate,
      lastActive: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('Failed to sync subscription to Firestore:', err);
  }
}

/**
 * Upgrades or activates a paid subscription
 */
export async function upgradeSubscription(
  plan: SubscriptionPlan,
  billingCycle: 'monthly' | 'annual',
  paymentMethod: string = 'card',
  userId?: string
): Promise<UserSubscription> {
  const targetPlan = (plan === 'free' ? 'pro' : plan) as SubscriptionPlan;
  const now = new Date();
  const renewal = new Date();
  if (billingCycle === 'annual') {
    renewal.setFullYear(now.getFullYear() + 1);
  } else {
    renewal.setMonth(now.getMonth() + 1);
  }

  const txId = 'TXN_' + Math.random().toString(36).substring(2, 9).toUpperCase() + Date.now().toString(36).toUpperCase();

  const updated: UserSubscription = {
    plan: targetPlan,
    status: 'active',
    billingCycle,
    startDate: now.toISOString(),
    renewalDate: renewal.toISOString(),
    dailyUsageCount: 0,
    lastUsageDate: now.toISOString().split('T')[0],
    transactionId: txId,
    paymentMethod
  };

  saveSubscriptionLocally(updated);

  if (userId) {
    await syncSubscriptionToFirestore(userId, updated);
  }

  return updated;
}

/**
 * Check if the user is allowed to make a generation under current plan limits
 */
export function checkGenerationQuota(): { 
  allowed: boolean; 
  remaining: number; 
  max: number; 
  plan: SubscriptionPlan;
  isPaid: boolean;
  requiresSubscription: boolean;
} {
  const sub = getSubscription();
  const paid = isPaidSubscriber(sub);

  if (!paid) {
    return {
      allowed: false,
      remaining: 0,
      max: 0,
      plan: sub.plan,
      isPaid: false,
      requiresSubscription: true
    };
  }

  const limits = PLAN_LIMITS[sub.plan] || PLAN_LIMITS.pro;
  const max = limits.maxDailyPrompts;
  
  if (max >= 9999) {
    return { allowed: true, remaining: 9999, max, plan: sub.plan, isPaid: true, requiresSubscription: false };
  }

  const remaining = Math.max(0, max - sub.dailyUsageCount);
  return {
    allowed: remaining > 0,
    remaining,
    max,
    plan: sub.plan,
    isPaid: true,
    requiresSubscription: false
  };
}

/**
 * Increment daily usage counter by 1 and detect 80%, 90%, 100% threshold crossings
 */
export function recordGenerationUsage(userId?: string): {
  thresholdReached: 80 | 90 | 100 | null;
  used: number;
  remaining: number;
  max: number;
} {
  const sub = getSubscription();
  const limits = PLAN_LIMITS[sub.plan] || PLAN_LIMITS.pro;
  const max = limits.maxDailyPrompts;
  const prevCount = sub.dailyUsageCount;
  
  sub.dailyUsageCount += 1;
  sub.lastUsageDate = new Date().toISOString().split('T')[0];
  saveSubscriptionLocally(sub);

  if (userId) {
    syncSubscriptionToFirestore(userId, sub).catch(() => {});
  }

  let thresholdReached: 80 | 90 | 100 | null = null;

  if (max < 9999) {
    const used = sub.dailyUsageCount;
    const remaining = Math.max(0, max - used);
    const prevRemaining = Math.max(0, max - prevCount);

    const t80 = Math.ceil(max * 0.8);
    const t90 = Math.ceil(max * 0.9);

    if (used >= max && prevRemaining > 0) {
      thresholdReached = 100;
    } else if (used >= t90 && prevCount < t90) {
      thresholdReached = 90;
    } else if (used >= t80 && prevCount < t80) {
      thresholdReached = 80;
    }

    if (thresholdReached) {
      try {
        window.dispatchEvent(new CustomEvent('quota-threshold-reached', {
          detail: {
            threshold: thresholdReached,
            used,
            remaining,
            max,
            plan: sub.plan
          }
        }));
      } catch (e) {
        console.warn('Failed to dispatch quota threshold event:', e);
      }
    }
  }

  return {
    thresholdReached,
    used: sub.dailyUsageCount,
    remaining: Math.max(0, max - sub.dailyUsageCount),
    max
  };
}

/**
 * Downgrades or cancels auto-renewal
 */
export async function cancelSubscription(userId?: string): Promise<UserSubscription> {
  const sub = getSubscription();
  sub.status = 'cancelled';
  saveSubscriptionLocally(sub);

  if (userId) {
    await syncSubscriptionToFirestore(userId, sub);
  }
  return sub;
}

export interface UsageStats {
  plan: SubscriptionPlan;
  planNameAr: string;
  planNameEn: string;
  dailyUsageCount: number;
  maxDailyPrompts: number;
  bonusPromptsToday: number;
  remainingRequests: number;
  percentUsed: number;
  percentRemaining: number;
  isUnlimited: boolean;
  isNearLimit: boolean;
  isLimitReached: boolean;
  isPaid: boolean;
  timeUntilReset: string;
  statusLevel: 'normal' | 'warning' | 'critical' | 'unlimited' | 'unpaid';
}

/**
 * Calculates remaining time until daily quota reset (local midnight)
 */
export function getTimeUntilMidnightReset(): string {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setHours(24, 0, 0, 0);
  const diffMs = Math.max(0, tomorrow.getTime() - now.getTime());
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Legacy ad reward function stub (kept for backwards-compatibility; zero ads on paid platform)
 */
export function claimAdRewardBonus(userId?: string): { success: boolean; newRemaining: number; totalBonusToday: number } {
  return { success: false, newRemaining: 0, totalBonusToday: 0 };
}

/**
 * Computes real-time usage statistics and warning thresholds
 */
export function getUsageStats(subParam?: UserSubscription): UsageStats {
  const sub = subParam || getSubscription();
  const paid = isPaidSubscriber(sub);
  const limits = PLAN_LIMITS[sub.plan] || PLAN_LIMITS.free;

  if (!paid) {
    return {
      plan: sub.plan,
      planNameAr: 'غير مشترك (المنصة مدفوعة بالكامل)',
      planNameEn: 'Unsubscribed (Paid Only)',
      dailyUsageCount: 0,
      maxDailyPrompts: 0,
      bonusPromptsToday: 0,
      remainingRequests: 0,
      percentUsed: 100,
      percentRemaining: 0,
      isUnlimited: false,
      isNearLimit: false,
      isLimitReached: true,
      isPaid: false,
      timeUntilReset: getTimeUntilMidnightReset(),
      statusLevel: 'unpaid'
    };
  }

  const isUnlimited = limits.maxDailyPrompts >= 9999;
  const max = limits.maxDailyPrompts;
  const used = sub.dailyUsageCount;
  const remaining = isUnlimited ? 9999 : Math.max(0, max - used);
  const percentUsed = isUnlimited ? 0 : Math.min(100, Math.round((used / max) * 100));
  const percentRemaining = isUnlimited ? 100 : Math.max(0, 100 - percentUsed);
  const isLimitReached = !isUnlimited && remaining <= 0;
  const isNearLimit = !isUnlimited && !isLimitReached && (percentUsed >= 80 || remaining <= 5);

  let statusLevel: 'normal' | 'warning' | 'critical' | 'unlimited' | 'unpaid' = 'normal';
  if (isUnlimited) {
    statusLevel = 'unlimited';
  } else if (isLimitReached) {
    statusLevel = 'critical';
  } else if (isNearLimit) {
    statusLevel = 'warning';
  }

  return {
    plan: sub.plan,
    planNameAr: limits.nameAr,
    planNameEn: limits.nameEn,
    dailyUsageCount: used,
    maxDailyPrompts: max,
    bonusPromptsToday: 0,
    remainingRequests: remaining,
    percentUsed,
    percentRemaining,
    isUnlimited,
    isNearLimit,
    isLimitReached,
    isPaid: true,
    timeUntilReset: getTimeUntilMidnightReset(),
    statusLevel
  };
}
