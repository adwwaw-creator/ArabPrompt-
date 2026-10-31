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
  Lock,
  ShieldCheck
} from 'lucide-react';
import { AppLanguage } from '../types';
import { 
  getUsageStats, 
  UsageStats, 
  SubscriptionPlan,
  UserSubscription
} from '../utils/subscriptionService';

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
    if (!stats.isPaid) return 'from-rose-600 to-red-500';
    if (stats.isUnlimited) return 'from-amber-500 to-yellow-400';
    if (stats.isLimitReached) return 'from-rose-600 to-red-500';
    if (stats.isNearLimit) return 'from-amber-500 to-orange-500';
    return 'from-emerald-500 to-teal-400';
  };

  const getMeterTextColor = () => {
    if (!stats.isPaid) return 'text-rose-600 dark:text-rose-400';
    if (stats.isUnlimited) return 'text-amber-500 dark:text-amber-400';
    if (stats.isLimitReached) return 'text-rose-600 dark:text-rose-400';
    if (stats.isNearLimit) return 'text-amber-600 dark:text-amber-400';
    return 'text-emerald-600 dark:text-emerald-400';
  };

  const getStatusBadge = () => {
    if (!stats.isPaid) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
          <Lock className="w-3 h-3 text-rose-500" />
          <span>{lang === 'ar' ? 'غير مشترك (المنصة مدفوعة)' : 'Unpaid (Paid Only)'}</span>
        </span>
      );
    }
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
          <AlertTriangle className="w-3 h-3 text-amber-500" />
          <span>{lang === 'ar' ? 'أوشكت الحصة على النفاد (80%+)' : 'Near Limit (80%+)'}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
        <span>{lang === 'ar' ? 'نشط ومستقر' : 'Optimal'}</span>
      </span>
    );
  };

  return (
    <div className="w-full space-y-4 text-start font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Main Quota Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#181715] border border-stone-200/90 dark:border-stone-800 shadow-sm space-y-4">
        
        {/* Header Row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#c29b40]/15 dark:bg-[#c29b40]/25 flex items-center justify-center text-[#9c7524] dark:text-amber-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <span>{lang === 'ar' ? 'رصيد طلبات الـ API والميزات' : 'API Quota & Plan Status'}</span>
                {getStatusBadge()}
              </h4>
              <p className="text-[10px] text-stone-500 dark:text-stone-400">
                {lang === 'ar' ? 'منصة مدفوعة بالكامل | خوادم مخصصة بدون إعلانات' : '100% Paid Platform | Dedicated GPUs, Zero Ads'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleManualRefresh}
            className={`w-7 h-7 rounded-xl flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer ${isRefreshing ? 'animate-spin' : ''}`}
            title={lang === 'ar' ? 'تحديث العداد لحظياً' : 'Refresh'}
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Stats Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
          
          {/* Plan Pill */}
          <div className="p-3 rounded-2xl bg-stone-50/80 dark:bg-stone-900/60 border border-stone-200/60 dark:border-stone-800">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
              {lang === 'ar' ? 'الباقة الحالية' : 'Current Plan'}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Crown className="w-3.5 h-3.5 text-[#c29b40]" />
              <span className="font-black text-sm text-stone-900 dark:text-stone-100">
                {stats.isPaid ? stats.planNameAr : (lang === 'ar' ? 'غير مشترك' : 'Unsubscribed')}
              </span>
            </div>
            <span className="text-[9px] text-[#9c7524] dark:text-amber-400 font-bold block mt-0.5">
              {stats.isPaid ? (lang === 'ar' ? 'اشتراك مدفوع نشط' : 'Active Paid Member') : (lang === 'ar' ? 'يلزم باقة مدفوعة' : 'Subscription Required')}
            </span>
          </div>

          {/* Remaining Requests */}
          <div className="p-3 rounded-2xl bg-stone-50/80 dark:bg-stone-900/60 border border-stone-200/60 dark:border-stone-800">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
              {lang === 'ar' ? 'الرصيد المتبقي اليوم' : 'Remaining Quota'}
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className={`text-2xl font-black font-mono tracking-tight ${getMeterTextColor()}`}>
                {!stats.isPaid ? '0' : (stats.isUnlimited ? '∞' : stats.remainingRequests)}
              </span>
              {stats.isPaid && !stats.isUnlimited && (
                <span className="text-[10px] text-stone-400">
                  / {stats.maxDailyPrompts}
                </span>
              )}
            </div>
            <span className="text-[9px] text-stone-400 dark:text-stone-500 block mt-0.5">
              {!stats.isPaid ? (lang === 'ar' ? 'المنصة مدفوعة بالكامل' : 'Paid only') : (stats.isUnlimited ? (lang === 'ar' ? 'توليد غير محدود' : 'Unlimited') : (lang === 'ar' ? 'طلب متبقٍ اليوم' : 'requests remaining'))}
            </span>
          </div>

          {/* Usage Today */}
          <div className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-stone-50/80 dark:bg-stone-900/60 border border-stone-200/60 dark:border-stone-800">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
              {lang === 'ar' ? 'الاستهلاك اليوم' : 'Used Today'}
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black font-mono tracking-tight text-stone-850 dark:text-stone-100">
                {stats.dailyUsageCount}
              </span>
              {stats.isPaid && !stats.isUnlimited && (
                <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400">
                  ({stats.percentUsed}%)
                </span>
              )}
            </div>
            <p className="text-[9px] text-stone-400 dark:text-stone-500 mt-0.5">
              {lang === 'ar' ? 'توليد أوامر وهندسة سينمائية' : 'Prompts and screenplay tasks'}
            </p>
          </div>

        </div>

        {/* Progress Bar Meter */}
        {stats.isPaid && !stats.isUnlimited ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-bold">
              <span className="text-stone-600 dark:text-stone-400">
                {lang === 'ar' ? 'مؤشر استهلاك الحصة اليومية' : 'Daily Quota Meter'}
              </span>
              <span className={getMeterTextColor()}>
                {stats.percentUsed}% {lang === 'ar' ? 'مستهلك' : 'used'}
              </span>
            </div>

            <div className="relative w-full h-3 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden p-0.5">
              <div 
                className={`h-full rounded-full bg-gradient-to-r ${getMeterColor()} transition-all duration-500 ease-out`}
                style={{ width: `${Math.min(100, Math.max(stats.dailyUsageCount > 0 ? 3 : 0, stats.percentUsed))}%` }}
              />
            </div>

            <div className="flex justify-between text-[8px] text-stone-400 font-mono px-0.5">
              <span>0%</span>
              <span>50%</span>
              <span className="text-amber-500 font-bold">80%</span>
              <span className="text-rose-500 font-bold">100%</span>
            </div>
          </div>
        ) : stats.isPaid && stats.isUnlimited ? (
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
            <Zap className="w-4 h-4 text-amber-500 shrink-0 fill-amber-500" />
            <span className="text-[11px]">
              {lang === 'ar' 
                ? 'أنت على باقة غير محدودة! تمتع بأقصى سرعة معالجة وخوادم GPU محجوزة بلا انقطاع وبدون إعلانات.' 
                : 'Unlimited high-speed tier active! Enjoy unrestricted API requests with zero latency.'}
            </span>
          </div>
        ) : null}

      </div>

      {/* ALERT SECTION: When User is Unpaid (Requires Paid Subscription) */}
      {!stats.isPaid && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-amber-500/10 border-2 border-[#c29b40]/50 shadow-sm space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-xl bg-[#c29b40] text-white shrink-0 mt-0.5">
              <Crown className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-black text-stone-900 dark:text-stone-100">
                {lang === 'ar' 
                  ? '💎 المنصة مدفوعة بالكامل — اشترك الآن للبدء' 
                  : '💎 100% Paid Platform — Subscribe to Start'}
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                {lang === 'ar'
                  ? 'تم تخصيص خوادم معالجة مخصصة ونماذج Gemini 2026 المتقدمة حصرياً للمشتركين فقط. اختر باقتك المفضلة واستمتع بإنتاج سينمائي غير محدود وبدون أي إعلانات.'
                  : 'ArabPrompt is a fully paid, subscription-only platform with dedicated GPU compute, zero latency, and zero ads.'}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                if (onOpenCheckout) onOpenCheckout('pro');
                window.dispatchEvent(new CustomEvent('open-checkout', { detail: { plan: 'pro' } }));
              }}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#916a24] via-[#c29b40] to-amber-500 text-white font-black text-xs shadow-md hover:opacity-95 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'اشترك الآن في باقة Pro ($7/شهر)' : 'Subscribe to Pro ($7/mo)'}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                if (onOpenCheckout) onOpenCheckout('lite');
                window.dispatchEvent(new CustomEvent('open-checkout', { detail: { plan: 'lite' } }));
              }}
              className="py-2.5 px-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs hover:bg-stone-50 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>{lang === 'ar' ? 'باقة Lite الأرخص ($3.50/شهر)' : 'Starter Lite ($3.50/mo)'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ALERT SECTION: When Limit Reached */}
      {stats.isPaid && stats.isLimitReached && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border-2 border-rose-500 shadow-sm animate-fade-in flex flex-col gap-2.5">
          <div className="flex items-start gap-2.5">
            <div className="p-1 rounded-lg bg-rose-600 text-white shrink-0 mt-0.5">
              <AlertOctagon className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-black text-rose-900 dark:text-rose-200">
                {lang === 'ar' ? '🛑 استُهلكت كامل حصة باقة Lite لليوم' : '🛑 Daily Quota Limit Reached'}
              </div>
              <p className="text-[11px] text-rose-800 dark:text-rose-300 mt-0.5 leading-relaxed">
                {lang === 'ar'
                  ? `استهلكت جميع الـ ${stats.maxDailyPrompts} طلباً لليوم. سيتجدد الرصيد عند منتصف الليل، أو يمكنك الترقية إلى باقة المحترف (Pro) للاستمتاع بطلبات غير محدودة فوراً.`
                  : `You reached your daily limit. Upgrade to Pro Creator for unlimited generations.`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (onOpenCheckout) onOpenCheckout('pro');
              window.dispatchEvent(new CustomEvent('open-checkout', { detail: { plan: 'pro' } }));
            }}
            className="py-2 px-3 rounded-xl bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 text-white font-black text-xs shadow-xs hover:opacity-95 transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'الترقية إلى باقة Pro غير المحدودة والدفع فوراً' : 'Upgrade to Unlimited Pro & Pay'}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
}
