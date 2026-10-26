/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Crown, 
  Sparkles, 
  Clock, 
  Zap, 
  ArrowUpRight, 
  AlertOctagon,
  RefreshCw,
  Layers,
  Flame,
  Info,
  PlayCircle,
  Gift,
  Tv,
  X,
  Check
} from 'lucide-react';
import { AppLanguage } from '../types';
import { 
  getUsageStats, 
  UsageStats, 
  SubscriptionPlan,
  UserSubscription,
  claimAdRewardBonus
} from '../utils/subscriptionService';
import AdSenseBanner from './AdSenseBanner';

interface ApiUsageMonitorProps {
  lang: AppLanguage;
  subscription?: UserSubscription;
  onOpenCheckout?: (plan?: SubscriptionPlan) => void;
  compact?: boolean;
}

export default function ApiUsageMonitor({
  lang,
  subscription,
  onOpenCheckout,
  compact = false
}: ApiUsageMonitorProps) {
  const [stats, setStats] = useState<UsageStats>(() => getUsageStats(subscription));
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Google AdSense Rewarded Ad state
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [adTimer, setAdTimer] = useState(5);
  const [adCompleted, setAdCompleted] = useState(false);
  const [rewardMessage, setRewardMessage] = useState<string | null>(null);

  useEffect(() => {
    let interval: any;
    if (isAdModalOpen && adTimer > 0) {
      interval = setInterval(() => {
        setAdTimer((prev) => prev - 1);
      }, 1000);
    } else if (isAdModalOpen && adTimer === 0 && !adCompleted) {
      setAdCompleted(true);
      claimAdRewardBonus();
      setStats(getUsageStats());
      setRewardMessage(
        lang === 'ar' 
          ? '🎉 مبارك! تم إضافة +5 طلبات إضافية إلى حصتك اليومية بنجاح.' 
          : '🎉 Congratulations! +5 bonus requests added to your daily quota.'
      );
    }
    return () => clearInterval(interval);
  }, [isAdModalOpen, adTimer, adCompleted, lang]);

  const handleOpenAdReward = () => {
    setAdTimer(5);
    setAdCompleted(false);
    setRewardMessage(null);
    setIsAdModalOpen(true);
  };

  useEffect(() => {
    const handleUpdate = () => {
      setStats(getUsageStats());
    };

    window.addEventListener('subscription-updated', handleUpdate);
    const interval = setInterval(() => {
      setStats(getUsageStats());
    }, 1000);

    return () => {
      window.removeEventListener('subscription-updated', handleUpdate);
      clearInterval(interval);
    };
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setStats(getUsageStats());
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Color theme based on usage level
  const getMeterColor = () => {
    if (stats.isUnlimited) return 'from-amber-500 to-yellow-400';
    if (stats.isLimitReached) return 'from-rose-600 to-red-500';
    if (stats.isNearLimit) return 'from-amber-500 to-orange-500';
    return 'from-emerald-500 to-teal-400';
  };

  const getMeterTextColor = () => {
    if (stats.isUnlimited) return 'text-amber-500 dark:text-amber-400';
    if (stats.isLimitReached) return 'text-rose-600 dark:text-rose-400';
    if (stats.isNearLimit) return 'text-amber-600 dark:text-amber-400';
    return 'text-emerald-600 dark:text-emerald-400';
  };

  const getStatusBadge = () => {
    if (stats.isUnlimited) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
          <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
          <span>{lang === 'ar' ? 'طلبات غير محدودة' : 'Unlimited Quota'}</span>
        </span>
      );
    }
    if (stats.isLimitReached) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse">
          <AlertOctagon className="w-3 h-3 text-rose-600" />
          <span>{lang === 'ar' ? 'استُهلكت الحصة بالكامل' : 'Limit Reached'}</span>
        </span>
      );
    }
    if (stats.isNearLimit) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          <span>{lang === 'ar' ? 'اقتراب من الحد الأقصى' : 'Near Daily Limit'}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        <span>{lang === 'ar' ? 'الحالة ممتازة' : 'Healthy Quota'}</span>
      </span>
    );
  };

  return (
    <div className="space-y-4 font-sans text-stone-850 dark:text-stone-100" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Header bar of monitor */}
      <div className="flex items-center justify-between pb-2 border-b border-stone-200/80 dark:border-stone-800">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-[#c29b40]/15 text-[#916a24] dark:text-amber-400">
            <Activity className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-black tracking-tight text-stone-900 dark:text-stone-100">
                {lang === 'ar' ? 'مراقبة استهلاك الـ API في الوقت الفعلي' : 'Real-time API Usage Monitor'}
              </h3>
              <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold uppercase tracking-wider">
                LIVE
              </span>
            </div>
            <p className="text-[10px] text-stone-500 dark:text-stone-400">
              {lang === 'ar' ? 'تحديث لحظي متزامن مع كل طلب توليد أو فحص' : 'Live synchronized counter per prompt request'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {getStatusBadge()}
          <button
            type="button"
            onClick={handleManualRefresh}
            className={`p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer ${isRefreshing ? 'animate-spin text-[#c29b40]' : ''}`}
            title={lang === 'ar' ? 'تحديث العداد' : 'Refresh counter'}
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Quota Visualizer Card */}
      <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/90 dark:border-stone-700/80 shadow-xs space-y-4">
        
        {/* Top Tier Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-[#c29b40]" />
            <span className="text-xs font-black text-stone-900 dark:text-stone-100">
              {lang === 'ar' ? stats.planNameAr : stats.planNameEn}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400 font-mono">
            <Clock className="w-3 h-3 text-stone-400" />
            <span>{lang === 'ar' ? 'التجديد بعد:' : 'Resets in:'}</span>
            <span className="font-bold text-stone-850 dark:text-stone-200">{stats.timeUntilReset}</span>
          </div>
        </div>

        {/* Counter Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          
          {/* Card 1: Remaining */}
          <div className={`p-3 rounded-xl border transition-all ${
            stats.isLimitReached
              ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/80'
              : stats.isNearLimit
              ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/80'
              : 'bg-white dark:bg-stone-900 border-stone-200/80 dark:border-stone-700/80'
          }`}>
            <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 block mb-1">
              {lang === 'ar' ? 'الطلبات المتبقية اليوم' : 'Remaining Requests'}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-2xl font-black font-mono tracking-tight ${getMeterTextColor()}`}>
                {stats.isUnlimited ? '∞' : stats.remainingRequests}
              </span>
              {!stats.isUnlimited && (
                <span className="text-[11px] text-stone-400 font-medium">
                  / {stats.maxDailyPrompts}
                </span>
              )}
            </div>
            <p className="text-[9px] text-stone-400 dark:text-stone-500 mt-0.5">
              {stats.isUnlimited 
                ? (lang === 'ar' ? 'رصيد مفتوح بدون قيود' : 'Uncapped usage')
                : (lang === 'ar' ? `متبقي ${stats.remainingRequests} طلباً حتى منتصف الليل` : `${stats.remainingRequests} requests left today`)}
            </p>
          </div>

          {/* Card 2: Used */}
          <div className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-700/80">
            <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 block mb-1">
              {lang === 'ar' ? 'الطلبات المستهلكة اليوم' : 'Used Today'}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black font-mono tracking-tight text-stone-850 dark:text-stone-100">
                {stats.dailyUsageCount}
              </span>
              {!stats.isUnlimited && (
                <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400">
                  ({stats.percentUsed}%)
                </span>
              )}
            </div>
            <p className="text-[9px] text-stone-400 dark:text-stone-500 mt-0.5">
              {lang === 'ar' ? 'توليد أوامر وهندسة عكسية' : 'Prompts and reverse queries'}
            </p>
          </div>

        </div>

        {/* Progress Bar Meter (when capped) */}
        {!stats.isUnlimited ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-bold">
              <span className="text-stone-600 dark:text-stone-400">
                {lang === 'ar' ? 'مؤشر استهلاك الحصة اليومية' : 'Daily Quota Meter'}
              </span>
              <span className={getMeterTextColor()}>
                {stats.percentUsed}% {lang === 'ar' ? 'مستهلك' : 'used'}
              </span>
            </div>

            {/* Meter Bar */}
            <div className="relative w-full h-3 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden p-0.5">
              <div 
                className={`h-full rounded-full bg-gradient-to-r ${getMeterColor()} transition-all duration-500 ease-out`}
                style={{ width: `${Math.min(100, Math.max(stats.dailyUsageCount > 0 ? 3 : 0, stats.percentUsed))}%` }}
              />
            </div>

            {/* Scale Markers */}
            <div className="flex justify-between text-[8px] text-stone-400 font-mono px-0.5">
              <span>0%</span>
              <span>50%</span>
              <span className="text-amber-500 font-bold">80% (تحذير)</span>
              <span className="text-rose-500 font-bold">100%</span>
            </div>
          </div>
        ) : (
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
            <Zap className="w-4 h-4 text-amber-500 shrink-0 fill-amber-500" />
            <span className="text-[11px]">
              {lang === 'ar' 
                ? 'أنت على باقة غير محدودة! يمكنك إرسال آلاف الطلبات بأعلى سرعة معالجة دون قلق من أي عداد.' 
                : 'Unlimited high-speed tier active! Enjoy unrestricted API requests.'}
            </span>
          </div>
        )}

      </div>

      {/* ALERT SECTION: When Near Limit (>= 80% or <= 5 remaining) */}
      {stats.isNearLimit && !stats.isLimitReached && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400 dark:border-amber-600/70 shadow-sm animate-fade-in flex flex-col gap-2.5">
          <div className="flex items-start gap-2.5">
            <div className="p-1 rounded-lg bg-amber-500 text-stone-950 shrink-0 mt-0.5 animate-bounce">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-black text-amber-900 dark:text-amber-200">
                {lang === 'ar' 
                  ? `⚠️ تنبيه استهلاك الرصيد: اقتربت من الحد الأقصى لباقتك!` 
                  : `⚠️ Usage Warning: Approaching Daily API Limit!`}
              </div>
              <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5 leading-relaxed">
                {lang === 'ar'
                  ? `متبقي لديك فقط (${stats.remainingRequests} طلبات) من أصل ${stats.maxDailyPrompts} طلباً اليوم. عند نفادها، سيتوقف التوليد حتى منتصف الليل ما لم تقم بالترقية.`
                  : `You only have ${stats.remainingRequests} requests remaining out of ${stats.maxDailyPrompts} today. Upgrade now to prevent interruption.`}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            {onOpenCheckout && (
              <button
                type="button"
                onClick={() => onOpenCheckout(stats.plan === 'free' ? 'lite' : 'pro')}
                className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-600 via-[#c29b40] to-yellow-500 text-white font-black text-xs shadow-xs hover:opacity-95 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {lang === 'ar' 
                    ? `ترقية باقتك الآن لتفادي التوقف (تبدأ من $5/شهر)` 
                    : `Upgrade Plan to Avoid Interruption (from $5/mo)`}
                </span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}

            {stats.plan === 'free' && stats.bonusPromptsToday < 20 && (
              <button
                type="button"
                onClick={handleOpenAdReward}
                className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <PlayCircle className="w-3.5 h-3.5 text-emerald-200 animate-pulse" />
                <span>{lang === 'ar' ? 'أو شاهد إعلاناً (+5 طلبات)' : 'Or Watch Ad (+5)'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ALERT SECTION: When Limit Reached (0 remaining) */}
      {stats.isLimitReached && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border-2 border-rose-500 shadow-sm animate-fade-in flex flex-col gap-2.5">
          <div className="flex items-start gap-2.5">
            <div className="p-1 rounded-lg bg-rose-600 text-white shrink-0 mt-0.5">
              <AlertOctagon className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-black text-rose-900 dark:text-rose-200">
                {lang === 'ar' 
                  ? '🛑 انتهت حصتك اليومية من طلبات الـ API' 
                  : '🛑 Daily API Quota Exhausted'}
              </div>
              <p className="text-[11px] text-rose-800 dark:text-rose-300 mt-0.5 leading-relaxed">
                {lang === 'ar'
                  ? `لقد استهلكت جميع الـ ${stats.maxDailyPrompts} طلباً المتاحة لباقتك اليوم (${stats.planNameAr}). سيتجدد الرصيد تلقائياً بعد ${stats.timeUntilReset}، أو يمكنك مشاهدة إعلان لفتح 5 طلبات فوراً أو الترقية لمواصلة العمل بلا قيود.`
                  : `You've used all ${stats.maxDailyPrompts} requests for today. Quota resets in ${stats.timeUntilReset}, or watch an ad to get +5 prompts immediately or upgrade to continue unlimited.`}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            {onOpenCheckout && (
              <button
                type="button"
                onClick={() => onOpenCheckout(stats.plan === 'free' ? 'lite' : 'pro')}
                className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 text-white font-black text-xs shadow-xs hover:opacity-95 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>
                  {lang === 'ar' 
                    ? 'الترقية الفورية الآن (تبدأ من $5/شهر)' 
                    : 'Upgrade Now (from $5/mo)'}
                </span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}

            {stats.plan === 'free' && stats.bonusPromptsToday < 20 && (
              <button
                type="button"
                onClick={handleOpenAdReward}
                className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <PlayCircle className="w-3.5 h-3.5 text-emerald-200 animate-pulse" />
                <span>{lang === 'ar' ? '🎬 شاهد إعلاناً (+5 طلبات فوراً)' : '🎬 Watch Ad (+5 Prompts)'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Free Tier Google AdSense Monetization Info Card */}
      {stats.plan === 'free' && !compact && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/25 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#c29b40]/20 text-[#c29b40] flex items-center justify-center shrink-0">
              <Gift className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-stone-900 dark:text-stone-100 text-xs">
                <span>{lang === 'ar' ? 'حصة أدسنس المجانية: 25 طلباً/يوم' : 'AdSense Free Quota: 25 prompts/day'}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500 text-white font-black">
                  Google AdSense
                </span>
              </div>
              <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
                {lang === 'ar' 
                  ? `الحصة المجانية مدعومة بإعلانات أدسنس. تم ربح (+${stats.bonusPromptsToday}/20) طلباً إضافياً اليوم.` 
                  : `Free tier supported by AdSense. Earned (+${stats.bonusPromptsToday}/20) bonus prompts today.`}
              </p>
            </div>
          </div>

          {stats.bonusPromptsToday < 20 ? (
            <button
              type="button"
              onClick={handleOpenAdReward}
              className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-[#c29b40] hover:bg-[#a9842f] text-white font-bold text-[11px] transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0 shadow-2xs"
            >
              <Tv className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'شاهد إعلاناً (+5)' : 'Watch Ad (+5)'}</span>
            </button>
          ) : (
            <span className="text-[10px] font-bold text-stone-400">
              {lang === 'ar' ? 'اكتمل حد المكافآت اليوم (20/20)' : 'Max ad bonus reached (20/20)'}
            </span>
          )}
        </div>
      )}

      {/* Tier Features Overview in Compact Form */}
      {!compact && (
        <div className="p-3 rounded-xl bg-stone-100/70 dark:bg-stone-800/40 border border-stone-200/70 dark:border-stone-700/60 text-[11px] space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-stone-700 dark:text-stone-300">
            <Info className="w-3.5 h-3.5 text-[#c29b40]" />
            <span>{lang === 'ar' ? 'تفاصيل باقتك الحالية:' : 'Current Plan Details:'}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] text-stone-600 dark:text-stone-400">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c29b40]" />
              <span>
                {lang === 'ar' ? 'الحد اليومي:' : 'Daily Allowance:'}{' '}
                <strong className="text-stone-850 dark:text-stone-200">
                  {stats.isUnlimited ? (lang === 'ar' ? 'غير محدود' : 'Unlimited') : `${stats.maxDailyPrompts} طلب`}
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c29b40]" />
              <span>
                {lang === 'ar' ? 'حالة التجديد:' : 'Renewal:'}{' '}
                <strong className="text-stone-850 dark:text-stone-200">
                  {lang === 'ar' ? 'يومي تلقائي (00:00)' : 'Daily 00:00'}
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c29b40]" />
              <span>
                {lang === 'ar' ? 'حفظ السجل:' : 'History:'}{' '}
                <strong className="text-stone-850 dark:text-stone-200">
                  {lang === 'ar' ? 'محلي + سحابي' : 'Local + Cloud'}
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c29b40]" />
              <span>
                {lang === 'ar' ? 'إعلانات أدسنس:' : 'AdSense Ads:'}{' '}
                <strong className={stats.plan === 'free' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}>
                  {stats.plan === 'free' 
                    ? (lang === 'ar' ? 'مفعلة لدعم الباقة' : 'Active (Supported)') 
                    : (lang === 'ar' ? 'معطلة 100% (بدون إعلانات)' : 'Disabled (100% Ad-Free)')}
                </strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Rewarded AdSense Modal */}
      {isAdModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#161513] rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-2xl text-center space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Tv className="w-4 h-4" />
                </div>
                <div className="text-start">
                  <h4 className="text-xs font-black text-stone-900 dark:text-stone-100">
                    {lang === 'ar' ? 'إعلان Google AdSense بمكافأة' : 'Google AdSense Rewarded Ad'}
                  </h4>
                  <p className="text-[10px] text-stone-400">
                    {lang === 'ar' ? 'شاهد الإعلان لفتح +5 طلبات مجاناً' : 'Watch ad to unlock +5 free requests'}
                  </p>
                </div>
              </div>

              {adCompleted && (
                <button
                  onClick={() => setIsAdModalOpen(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Real AdSense Container */}
            <div className="rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50 p-2 min-h-[140px] flex flex-col justify-center">
              <AdSenseBanner 
                client="ca-pub-3312377428939400"
                slot="auto"
                format="auto"
                showPlaceholderBadge={true}
                lang={lang}
              />
            </div>

            {/* Countdown / Status Bar */}
            <div className="space-y-2">
              {!adCompleted ? (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold text-stone-600 dark:text-stone-300">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                      <span>{lang === 'ar' ? 'جاري التحقق من مشاهدة الإعلان...' : 'Validating Ad view...'}</span>
                    </span>
                    <span className="font-mono text-[#c29b40] text-sm font-black">{adTimer}s</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-1000"
                      style={{ width: `${((5 - adTimer) / 5) * 100}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-stone-400">
                    {lang === 'ar' ? 'يرجى الانتظار بضع ثوانٍ للحصول على رصيدك المجاني.' : 'Please wait 5 seconds to claim your bonus quota.'}
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 space-y-2">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-black">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>{rewardMessage}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAdModalOpen(false)}
                    className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition cursor-pointer"
                  >
                    {lang === 'ar' ? 'تم، العودة إلى لوحة التحكم واستخدام الرصيد' : 'Done, return to dashboard'}
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
