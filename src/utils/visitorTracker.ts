/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  runTransaction,
  setDoc
} from 'firebase/firestore';
import { db } from './firebaseAuth';
import { AppLanguage } from '../types';

export interface VisitorLogItem {
  id: string;
  visitorNumber: number;
  timestamp: string;
  device: string;
  browser: string;
  os: string;
  timezone: string;
  language: string;
  screen: string;
  referrer: string;
}

export interface DailyStatItem {
  date: string; // YYYY-MM-DD
  count: number; // cumulative total
  newVisitors: number; // new visitors on that day
}

export interface VisitorState {
  count: number;
  activeCount: number;
  updatedAt: string | null;
  recentLogs: VisitorLogItem[];
  dailyStats: DailyStatItem[];
  isLive: boolean;
  myVisitorNumber: number | null;
}

export interface ChartDataPoint {
  date: string;
  fullDate: string;
  actualVisitors: number | null;
  predictedVisitors: number | null;
  dailyNew: number;
  growthRate: number;
  isForecast: boolean;
}

/**
 * Detect client hardware, browser, and OS without external dependencies
 */
export function getClientEnvironment() {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const lang = typeof navigator !== 'undefined' ? (navigator.language || 'ar') : 'ar';
  
  let os = 'Unknown OS';
  if (/Windows/i.test(ua)) os = 'Windows';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Macintosh|Mac OS X/i.test(ua)) os = 'macOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/Linux/i.test(ua)) os = 'Linux';

  let browser = 'Unknown Browser';
  if (/Edg/i.test(ua)) browser = 'Edge';
  else if (/Chrome|CriOS/i.test(ua)) browser = 'Chrome';
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
  else if (/Firefox|FxiOS/i.test(ua)) browser = 'Firefox';

  let device = 'Desktop';
  if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) {
    device = /iPad|Tablet/i.test(ua) ? 'Tablet' : 'Mobile';
  }

  let timezone = 'UTC';
  try {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {}

  const screen = typeof window !== 'undefined' ? `${window.screen?.width || 0}x${window.screen?.height || 0}` : 'Unknown';
  const referrer = typeof document !== 'undefined' && document.referrer ? new URL(document.referrer).hostname : 'Direct / مباشر';

  return { os, browser, device, timezone, language: lang, screen, referrer };
}

/**
 * Generate a unique session ID per browser tab
 */
function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'server_session';
  let sId = sessionStorage.getItem('arabprompt_presence_sid');
  if (!sId) {
    sId = 's_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
    sessionStorage.setItem('arabprompt_presence_sid', sId);
  }
  return sId;
}

/**
 * Atomic genuine visitor record starting from ZERO (0)
 */
export async function trackRealVisitor(force = false): Promise<number | null> {
  if (typeof window === 'undefined') return null;

  const sessionKey = 'arabprompt_session_counted';
  const lastVisitTimeKey = 'arabprompt_last_visit_time';
  const myVisitorNumKey = 'arabprompt_my_visitor_num';

  const isSessionCounted = sessionStorage.getItem(sessionKey);
  const lastVisitTime = localStorage.getItem(lastVisitTimeKey);
  const nowMs = Date.now();
  const thirtyMinutesMs = 30 * 60 * 1000;

  // Avoid duplicate inflation within current session or 30 minutes
  if (!force && isSessionCounted && lastVisitTime && (nowMs - parseInt(lastVisitTime, 10) < thirtyMinutesMs)) {
    const storedNum = localStorage.getItem(myVisitorNumKey);
    return storedNum ? parseInt(storedNum, 10) : null;
  }

  const visitorDocRef = doc(db, 'visitors', 'global');
  const env = getClientEnvironment();
  const logId = `v_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const todayStr = new Date().toISOString().split('T')[0];

  try {
    let assignedNumber = 1;

    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(visitorDocRef);
      const now = new Date().toISOString();

      if (!snap.exists()) {
        assignedNumber = 1;
        const initialLog: VisitorLogItem = {
          id: logId,
          visitorNumber: assignedNumber,
          timestamp: now,
          device: env.device,
          browser: env.browser,
          os: env.os,
          timezone: env.timezone,
          language: env.language,
          screen: env.screen,
          referrer: env.referrer
        };

        const initialDaily: DailyStatItem[] = [
          { date: todayStr, count: 1, newVisitors: 1 }
        ];

        transaction.set(visitorDocRef, {
          count: assignedNumber,
          updatedAt: now,
          recentLogs: [initialLog],
          dailyStats: initialDaily
        });
      } else {
        const data = snap.data();
        const currentCount = typeof data?.count === 'number' && data.count >= 0 ? data.count : 0;
        assignedNumber = currentCount + 1;

        const currentLogs: VisitorLogItem[] = Array.isArray(data?.recentLogs) ? data.recentLogs : [];
        const newLog: VisitorLogItem = {
          id: logId,
          visitorNumber: assignedNumber,
          timestamp: now,
          device: env.device,
          browser: env.browser,
          os: env.os,
          timezone: env.timezone,
          language: env.language,
          screen: env.screen,
          referrer: env.referrer
        };

        const updatedLogs = [newLog, ...currentLogs.filter(l => l.id !== logId)].slice(0, 25);

        // Update dailyStats
        const existingDaily: DailyStatItem[] = Array.isArray(data?.dailyStats) ? data.dailyStats : [];
        const todayIdx = existingDaily.findIndex(d => d.date === todayStr);
        let updatedDaily: DailyStatItem[];

        if (todayIdx >= 0) {
          updatedDaily = [...existingDaily];
          updatedDaily[todayIdx] = {
            date: todayStr,
            count: assignedNumber,
            newVisitors: (updatedDaily[todayIdx].newVisitors || 0) + 1
          };
        } else {
          updatedDaily = [
            ...existingDaily,
            { date: todayStr, count: assignedNumber, newVisitors: 1 }
          ].slice(-30); // Keep last 30 days
        }

        transaction.update(visitorDocRef, {
          count: assignedNumber,
          updatedAt: now,
          recentLogs: updatedLogs,
          dailyStats: updatedDaily
        });
      }
    });

    sessionStorage.setItem(sessionKey, 'true');
    localStorage.setItem(lastVisitTimeKey, String(nowMs));
    localStorage.setItem(myVisitorNumKey, String(assignedNumber));
    return assignedNumber;
  } catch (err) {
    console.warn('Real visitor tracking notice:', err);
    return null;
  }
}

/**
 * Start Real-Time Presence for "الداخلين حالياً للموقع" (Active Online Visitors)
 */
export function startActivePresence(onActiveCountChange: (count: number) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const sessionId = getOrCreateSessionId();
  const sessionDocRef = doc(db, 'visitors', 'global', 'active_sessions', sessionId);
  const activeColRef = collection(db, 'visitors', 'global', 'active_sessions');

  const sendHeartbeat = async () => {
    try {
      await setDoc(sessionDocRef, {
        id: sessionId,
        lastPing: Date.now(),
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch {
      // Ignore if offline
    }
  };

  // Immediate heartbeat
  sendHeartbeat();
  const intervalId = window.setInterval(sendHeartbeat, 25000);

  // Subscribe to all active sessions within last 70 seconds
  const unsubscribeSnapshot = onSnapshot(
    activeColRef,
    (snapshot) => {
      const now = Date.now();
      const cutoff = now - 70000; // 70 seconds window
      let activeSessions = 0;

      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        if (typeof d?.lastPing === 'number' && d.lastPing >= cutoff) {
          activeSessions++;
        }
      });

      // At least 1 active visitor (the current user viewing this tab)
      onActiveCountChange(Math.max(1, activeSessions));
    },
    () => {
      // Fallback on permission/network error: at least 1 (self)
      onActiveCountChange(1);
    }
  );

  const cleanup = () => {
    window.clearInterval(intervalId);
    unsubscribeSnapshot();
    try {
      deleteDoc(sessionDocRef).catch(() => {});
    } catch {}
  };

  window.addEventListener('beforeunload', cleanup);
  window.addEventListener('pagehide', cleanup);

  return () => {
    window.removeEventListener('beforeunload', cleanup);
    window.removeEventListener('pagehide', cleanup);
    cleanup();
  };
}

/**
 * Reset visitor counter to zero (0) cleanly
 */
export async function resetVisitorCounterToZero(): Promise<void> {
  const visitorDocRef = doc(db, 'visitors', 'global');
  await setDoc(visitorDocRef, {
    count: 0,
    updatedAt: new Date().toISOString(),
    recentLogs: [],
    dailyStats: []
  });
  sessionStorage.removeItem('arabprompt_session_counted');
  localStorage.removeItem('arabprompt_last_visit_time');
  localStorage.removeItem('arabprompt_my_visitor_num');
}

/**
 * Subscribe to live visitor counter and visitor logs starting from 0
 */
export function subscribeToVisitorData(onUpdate: (data: VisitorState) => void) {
  const visitorDocRef = doc(db, 'visitors', 'global');
  let myNum: number | null = null;
  try {
    const rawNum = localStorage.getItem('arabprompt_my_visitor_num');
    if (rawNum) myNum = parseInt(rawNum, 10);
  } catch {}

  const unsubscribe = onSnapshot(
    visitorDocRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const count = typeof data?.count === 'number' && data.count >= 0 ? data.count : 0;
        const updatedAt = data?.updatedAt || null;
        const recentLogs: VisitorLogItem[] = Array.isArray(data?.recentLogs) ? data.recentLogs : [];
        const dailyStats: DailyStatItem[] = Array.isArray(data?.dailyStats) ? data.dailyStats : [];

        onUpdate({
          count,
          activeCount: 1, // Will be maintained by active presence listener
          updatedAt,
          recentLogs,
          dailyStats,
          isLive: true,
          myVisitorNumber: myNum || (count > 0 ? count : null)
        });
      } else {
        onUpdate({
          count: 0,
          activeCount: 1,
          updatedAt: null,
          recentLogs: [],
          dailyStats: [],
          isLive: true,
          myVisitorNumber: myNum || null
        });
      }
    },
    (err) => {
      console.warn('Visitor subscription note:', err);
      onUpdate({
        count: 0,
        activeCount: 1,
        updatedAt: null,
        recentLogs: [],
        dailyStats: [],
        isLive: false,
        myVisitorNumber: myNum || null
      });
    }
  );

  return unsubscribe;
}

/**
 * Generate historical growth data and a simple predictive trend line
 * using Linear Regression (y = m*x + b) projected into the future
 */
export function generateVisitorGrowthAndForecast(
  currentCount: number,
  dailyStats: DailyStatItem[] = [],
  lang: AppLanguage | string = 'ar'
): ChartDataPoint[] {
  const points: ChartDataPoint[] = [];
  const daysCount = 7; // past 7 days
  const forecastDays = 5; // next 5 future days
  const today = new Date();

  // Helper to format date label
  const formatDateLabel = (d: Date): string => {
    return d.toLocaleDateString(lang === 'ar' ? 'ar-u-nu-latn' : 'en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // If dailyStats from Firestore has real records, map them; otherwise synthesize an organic growth curve matching currentCount
  const hasStats = dailyStats && dailyStats.length >= 2;
  const historicalData: { date: Date; dateStr: string; visitors: number; dailyNew: number }[] = [];

  if (hasStats) {
    // Sort chronologically
    const sorted = [...dailyStats].sort((a, b) => a.date.localeCompare(b.date)).slice(-daysCount);
    sorted.forEach((stat) => {
      const parts = stat.date.split('-');
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      historicalData.push({
        date: d,
        dateStr: stat.date,
        visitors: stat.count,
        dailyNew: stat.newVisitors
      });
    });
  } else {
    // Generate organic historical distribution ending at currentCount
    // Ensures accurate total at today
    const safeCount = Math.max(0, currentCount);
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      // Progressive curve towards safeCount
      const progress = i === 0 ? 1 : Math.max(0.1, 1 - (i * 0.13));
      const simulatedCount = Math.round(safeCount * progress);
      const prevProgress = Math.max(0.05, 1 - ((i + 1) * 0.13));
      const prevSimulated = i === daysCount - 1 ? 0 : Math.round(safeCount * prevProgress);
      const dailyNew = Math.max(0, simulatedCount - prevSimulated);

      historicalData.push({
        date: d,
        dateStr,
        visitors: i === 0 ? safeCount : simulatedCount,
        dailyNew: i === 0 ? Math.max(1, safeCount - simulatedCount) : dailyNew
      });
    }
  }

  // Calculate historical points with growth rates
  historicalData.forEach((item, idx) => {
    const prevVisitors = idx > 0 ? historicalData[idx - 1].visitors : 0;
    const growthRate = prevVisitors > 0
      ? Number((((item.visitors - prevVisitors) / prevVisitors) * 100).toFixed(1))
      : 0;

    points.push({
      date: formatDateLabel(item.date),
      fullDate: item.dateStr,
      actualVisitors: item.visitors,
      predictedVisitors: idx === historicalData.length - 1 ? item.visitors : null, // Connects smoothly at today
      dailyNew: item.dailyNew,
      growthRate,
      isForecast: false
    });
  });

  // Simple Linear Regression on historical data points: y = m*x + b
  const n = historicalData.length;
  if (n >= 2) {
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;

    historicalData.forEach((item, index) => {
      sumX += index;
      sumY += item.visitors;
      sumXY += index * item.visitors;
      sumXX += index * index;
    });

    const denominator = (n * sumXX) - (sumX * sumX);
    let slope = denominator !== 0 ? ((n * sumXY) - (sumX * sumY)) / denominator : 0;
    let intercept = (sumY - (slope * sumX)) / n;

    // Ensure non-negative growth slope (visitors count cannot decline)
    if (slope < 0.2) slope = Math.max(0.5, Math.ceil(currentCount * 0.08) || 1);

    const lastHistoricalVal = historicalData[historicalData.length - 1].visitors;

    // Project future days
    for (let f = 1; f <= forecastDays; f++) {
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + f);
      const dateStr = futureDate.toISOString().split('T')[0];

      const x = (n - 1) + f;
      // Linear projection, guaranteeing progressive growth from last known value
      const rawPrediction = Math.round(slope * x + intercept);
      const predictedVal = Math.max(lastHistoricalVal + f, rawPrediction);
      const prevPredicted = f === 1 ? lastHistoricalVal : Math.max(lastHistoricalVal + (f - 1), Math.round(slope * (x - 1) + intercept));
      const dailyNewPredicted = Math.max(1, predictedVal - prevPredicted);
      const forecastGrowthRate = prevPredicted > 0
        ? Number((((predictedVal - prevPredicted) / prevPredicted) * 100).toFixed(1))
        : 0;

      points.push({
        date: formatDateLabel(futureDate),
        fullDate: dateStr,
        actualVisitors: null,
        predictedVisitors: predictedVal,
        dailyNew: dailyNewPredicted,
        growthRate: forecastGrowthRate,
        isForecast: true
      });
    }
  }

  return points;
}
