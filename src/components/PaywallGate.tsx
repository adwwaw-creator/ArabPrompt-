/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Crown, Sparkles, Shield, Zap, Lock, ArrowLeft, ArrowRight, 
  CheckCircle2, Film, Check, Star, KeyRound 
} from 'lucide-react';
import { AppLanguage, ActiveTab } from '../types';
import { SubscriptionPlan, upgradeSubscription } from '../utils/subscriptionService';

interface PaywallGateProps {
  lang: AppLanguage;
  onOpenCheckout: (plan?: SubscriptionPlan) => void;
  onNavigatePricing?: () => void;
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

export default function PaywallGate({
  lang,
  onOpenCheckout,
  onNavigatePricing,
  title,
  subtitle,
  compact = false
}: PaywallGateProps) {
  const isAr = lang === 'ar';
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  const [quickCode, setQuickCode] = useState('');
  const [quickError, setQuickError] = useState('');
  const [quickSuccess, setQuickSuccess] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  const handleApplyQuickCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuickError('');
    const code = quickCode.trim().toUpperCase();
    if (['VIP2026', 'PROMPTPRO', 'FULLACCESS', 'ARAB2026', 'PAID100', 'ADWWAW'].includes(code)) {
      setIsActivating(true);
      await new Promise(r => setTimeout(r, 600));
      await upgradeSubscription('pro', 'annual', 'vip_voucher');
      setIsActivating(false);
      setQuickSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 700);
    } else {
      setQuickError(isAr ? 'كود الاشتراك غير صالح أو منتهي' : 'Invalid or expired access pass');
    }
  };

  const handleInstantTestPass = async () => {
    setIsActivating(true);
    await new Promise(r => setTimeout(r, 500));
    await upgradeSubscription('pro', 'annual', 'instant_demo_pass');
    setIsActivating(false);
    setQuickSuccess(true);
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  if (compact) {
    return (
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 text-center space-y-3 shadow-sm">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-300 text-xs font-black">
          <Lock className="w-3.5 h-3.5 text-amber-600" />
          <span>{isAr ? 'منصة مدفوعة بالكامل' : '100% Paid Platform'}</span>
        </div>
        <h4 className="text-sm sm:text-base font-black text-stone-900 dark:text-stone-100">
          {title || (isAr ? 'يتطلب هذا الإجراء اشتراكاً نشطاً' : 'This feature requires an active paid plan')}
        </h4>
        <p className="text-xs text-stone-600 dark:text-stone-400 max-w-md mx-auto">
          {subtitle || (isAr ? 'اشترك الآن للوصول غير المحدود لجميع ميزات صياغة الأوامر ونماذج الذكاء الاصطناعي وبدون إعلانات.' : 'Subscribe now for full unlimited access to all AI prompt engineering tools with zero ads.')}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => onOpenCheckout('pro')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#916a24] via-[#c29b40] to-amber-500 text-white font-black text-xs shadow-md hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Crown className="w-3.5 h-3.5" />
            <span>{isAr ? 'ترقية واشتراك فوري' : 'Subscribe Now'}</span>
          </button>
          {onNavigatePricing && (
            <button
              type="button"
              onClick={onNavigatePricing}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold hover:bg-stone-50 transition-all cursor-pointer"
            >
              <span>{isAr ? 'عرض الخطط والأسعار' : 'View Plans'}</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="my-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#fcfbfa] via-white to-amber-500/5 dark:from-[#181715] dark:via-[#151412] dark:to-amber-950/20 border-2 border-[#c29b40]/40 shadow-xl relative overflow-hidden">
      {/* Background glow decoration */}
      <div className="absolute top-0 end-0 -mt-10 -me-10 w-48 h-48 bg-[#c29b40]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 start-0 -mb-10 -ms-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
        
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#c29b40]/20 via-amber-500/20 to-[#c29b40]/20 border border-[#c29b40]/40 text-[#916a24] dark:text-amber-300 text-xs font-black shadow-xs">
          <Crown className="w-4 h-4 text-[#c29b40]" />
          <span>{isAr ? '💎 منصة احترافية مدفوعة بالكامل 100%' : '💎 100% Fully Paid Exclusive Platform'}</span>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-stone-900 dark:text-stone-100 tracking-tight leading-snug">
            {title || (
              isAr ? (
                <>
                  أهلاً بك في <span className="text-[#c29b40] bg-gradient-to-r from-[#c29b40] to-amber-600 bg-clip-text text-transparent">عرب برومبت</span> — اشتراك مميز لتجربة استثنائية
                </>
              ) : (
                <>
                  Welcome to <span className="text-[#c29b40] bg-gradient-to-r from-[#c29b40] to-amber-600 bg-clip-text text-transparent">ArabPrompt</span> — Premium Paid Platform
                </>
              )
            )}
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-2xl mx-auto leading-relaxed">
            {subtitle || (
              isAr
                ? 'تم تحويل المنصة بالكامل إلى نموذج اشتراك مدفوع لضمان حجز طاقة معالجة مخصصة وفائقة السرعة عبر نماذج Gemini المتقدمة، مع إزالة الإعلانات كلياً وتوفير دقة سينمائية غير محدودة.'
                : 'ArabPrompt is a fully paid, subscription-only platform providing dedicated GPU compute, Gemini advanced model access, zero ads, and unlimited cinematic engineering.'
            )}
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-start pt-2">
          <div className="p-4 rounded-2xl bg-white dark:bg-stone-900/90 border border-stone-200 dark:border-stone-800 shadow-xs space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
              <Zap className="w-4 h-4" />
            </div>
            <h5 className="text-xs font-black text-stone-900 dark:text-stone-100">
              {isAr ? 'سرعة استجابة مخصصة' : 'Dedicated Speed'}
            </h5>
            <p className="text-[11px] text-stone-500 leading-normal">
              {isAr ? 'أولوية معالجة فورية بدون طوابير أو اختناقات' : 'Zero queue latency with reserved model throughput'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-stone-900/90 border border-stone-200 dark:border-stone-800 shadow-xs space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
              <Film className="w-4 h-4" />
            </div>
            <h5 className="text-xs font-black text-stone-900 dark:text-stone-100">
              {isAr ? 'أدوات سينمائية غير محدودة' : 'Unlimited Cinema Tools'}
            </h5>
            <p className="text-[11px] text-stone-500 leading-normal">
              {isAr ? 'تثبيت الوجوه، سيناريوهات، سلاسل مشاهد، وهندسة عكسية' : 'Face anchor, screenplays, reverse prompts & 4K suites'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-stone-900/90 border border-stone-200 dark:border-stone-800 shadow-xs space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
              <Shield className="w-4 h-4" />
            </div>
            <h5 className="text-xs font-black text-stone-900 dark:text-stone-100">
              {isAr ? '100% خالية من الإعلانات' : '100% Ad-Free & Private'}
            </h5>
            <p className="text-[11px] text-stone-500 leading-normal">
              {isAr ? 'بيئة عمل نقية وسحابية مشفرة تحفظ خصوصية مشاريعك' : 'Pure creative workspace with encrypted cloud backup'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            id="paywall-cta-subscribe-btn"
            onClick={() => onOpenCheckout('pro')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#916a24] via-[#c29b40] to-amber-500 hover:from-[#7e5c1d] hover:to-amber-600 text-white font-black text-sm shadow-lg shadow-[#c29b40]/25 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Crown className="w-4 h-4" />
            <span>{isAr ? 'اشترك الآن في باقة المحترف ($7/شهرياً)' : 'Subscribe to Pro Creator ($7/mo)'}</span>
            <Arrow className="w-4 h-4" />
          </button>

          {onNavigatePricing && (
            <button
              type="button"
              id="paywall-cta-pricing-btn"
              onClick={onNavigatePricing}
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>{isAr ? 'مقارنة كافة الباقات والأسعار' : 'Compare All Plans'}</span>
            </button>
          )}

          <button
            type="button"
            id="paywall-cta-test-btn"
            onClick={handleInstantTestPass}
            disabled={isActivating || quickSuccess}
            className="w-full sm:w-auto px-4 py-3.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-[#916a24] dark:text-amber-300 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            title={isAr ? 'تفعيل فوري لتجربة المنصة' : 'Instant 1-Click Demo Pass'}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{quickSuccess ? (isAr ? '✓ تم التفعيل!' : '✓ Activated!') : (isAr ? 'تفعيل فوري للتجربة' : '1-Click Instant Pass')}</span>
          </button>
        </div>

        {/* Quick voucher / VIP access form */}
        <div className="pt-3 border-t border-stone-200/80 dark:border-stone-800 max-w-md mx-auto">
          <form onSubmit={handleApplyQuickCode} className="flex items-center gap-2">
            <div className="relative flex-1">
              <KeyRound className="w-3.5 h-3.5 text-stone-400 absolute start-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={quickCode}
                onChange={(e) => {
                  setQuickCode(e.target.value);
                  setQuickError('');
                }}
                placeholder={isAr ? 'لديك كود VIP أو اشتراك مؤسسي؟ (مثال: VIP2026)' : 'Have VIP code? (e.g. VIP2026)'}
                className="w-full ps-9 pe-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs font-mono text-stone-800 dark:text-stone-200 placeholder:text-stone-400 focus:outline-none focus:border-[#c29b40]"
              />
            </div>
            <button
              type="submit"
              disabled={!quickCode.trim() || isActivating || quickSuccess}
              className="px-3.5 py-2 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-950 text-xs font-bold hover:bg-stone-800 transition-all cursor-pointer disabled:opacity-40"
            >
              {isActivating ? '...' : (isAr ? 'تفعيل' : 'Redeem')}
            </button>
          </form>
          {quickError && (
            <p className="text-[11px] text-rose-500 font-medium text-start mt-1.5">
              {quickError}
            </p>
          )}
          {quickSuccess && (
            <p className="text-[11px] text-emerald-600 font-bold text-start mt-1.5">
              {isAr ? '✓ تم تفعيل الاشتراك بنجاح! يتم تحديث الصفحة...' : '✓ Subscription activated successfully! Refreshing...'}
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
