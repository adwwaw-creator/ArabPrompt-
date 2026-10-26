/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  User as UserIcon,
  CheckCircle,
  AlertCircle,
  Loader2,
  LogOut,
  Sparkles,
  Cloud,
  ShieldCheck,
  BarChart3,
  Crown,
  Activity,
  Layers,
  Zap
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  googleSignIn,
  getAuthErrorMessage
} from '../utils/firebaseAuth';
import { AppLanguage } from '../types';
import { getSubscription, PLAN_LIMITS, SubscriptionPlan } from '../utils/subscriptionService';
import ApiUsageMonitor from './ApiUsageMonitor';

export type AuthMode = 'login' | 'signup' | 'profile' | 'usage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: AppLanguage;
  currentUser: User | null;
  initialMode?: AuthMode;
  onAuthSuccess?: (user: User) => void;
  onLogout?: () => void;
  onOpenApiDashboard?: () => void;
  onOpenCheckout?: (plan?: SubscriptionPlan) => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  lang,
  currentUser,
  initialMode = 'usage',
  onAuthSuccess,
  onLogout,
  onOpenApiDashboard,
  onOpenCheckout
}: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'usage' | 'profile' | 'plans'>(
    initialMode === 'login' || initialMode === 'signup' || initialMode === 'profile' ? 'profile' : 'usage'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorInfo, setErrorInfo] = useState<{ title: string; message: string } | null>(null);
  const sub = getSubscription();

  // Reset tab when modal opens or initialMode changes
  React.useEffect(() => {
    if (isOpen) {
      if (initialMode === 'usage') setActiveTab('usage');
      else if (initialMode === 'login' || initialMode === 'signup' || initialMode === 'profile') setActiveTab('profile');
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleGoogleSubmit = async () => {
    setIsLoading(true);
    setErrorInfo(null);
    try {
      const result = await googleSignIn();
      if (result?.user) {
        if (onAuthSuccess) onAuthSuccess(result.user);
        setActiveTab('usage');
      }
    } catch (err: any) {
      console.error('Google sign in error:', err);
      const friendly = getAuthErrorMessage(err, lang);
      setErrorInfo(friendly);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-3xl shadow-2xl overflow-hidden transition-all text-stone-850 dark:text-stone-100 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
      >
        {/* Modal Top Header */}
        <div className="relative px-5 pt-5 pb-3 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#916a24] via-[#c29b40] to-[#ecd197] flex items-center justify-center text-white shadow-sm ring-2 ring-[#c29b40]/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-stone-900 dark:text-stone-50 font-sans">
                {lang === 'ar' ? 'لوحة تحكم المستخدم والاستهلاك' : 'User Dashboard & Quota'}
              </h2>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
                {currentUser 
                  ? (lang === 'ar' ? `مرحباً، ${currentUser.displayName || currentUser.email}` : `Welcome, ${currentUser.displayName || currentUser.email}`)
                  : (lang === 'ar' ? 'متابعة استهلاك الـ API والحصة اليومية' : 'Monitor API quota and usage in real time')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
            title={lang === 'ar' ? 'إغلاق' : 'Close'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex border-b border-stone-100 dark:border-stone-800 px-5 pt-2 bg-stone-50/70 dark:bg-stone-900/70 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('usage')}
            className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 text-xs font-black transition cursor-pointer ${
              activeTab === 'usage'
                ? 'border-[#c29b40] text-[#916a24] dark:text-amber-400'
                : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'مراقبة الـ API والرصيد' : 'API Usage Monitor'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 text-xs font-black transition cursor-pointer ${
              activeTab === 'profile'
                ? 'border-[#c29b40] text-[#916a24] dark:text-amber-400'
                : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            {currentUser ? <UserIcon className="w-3.5 h-3.5" /> : <Cloud className="w-3.5 h-3.5" />}
            <span>{lang === 'ar' ? 'الحساب والمزامنة' : 'Account & Sync'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('plans')}
            className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 text-xs font-black transition cursor-pointer ${
              activeTab === 'plans'
                ? 'border-[#c29b40] text-[#916a24] dark:text-amber-400'
                : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span>{lang === 'ar' ? 'الباقات والترقية' : 'Plans & Upgrade'}</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* Error Banner */}
          {errorInfo && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">{errorInfo.title}</div>
                <div className="text-[11px] text-rose-600 dark:text-rose-300 mt-0.5">{errorInfo.message}</div>
              </div>
            </div>
          )}

          {/* TAB 1: REAL-TIME API USAGE MONITOR */}
          {activeTab === 'usage' && (
            <div className="space-y-4">
              <ApiUsageMonitor
                lang={lang}
                subscription={sub}
                onOpenCheckout={(plan) => {
                  onClose();
                  if (onOpenCheckout) onOpenCheckout(plan);
                }}
              />

              {/* Admin API Cost Analytics Access */}
              {currentUser?.email?.toLowerCase() === 'adwwaw@gmail.com' && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onOpenApiDashboard) onOpenApiDashboard();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl border border-[#c29b40]/30 bg-[#c29b40]/10 hover:bg-[#c29b40]/20 text-[#916a24] dark:text-amber-400 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <BarChart3 className="w-4 h-4 text-[#c29b40]" />
                    <span>{lang === 'ar' ? '📊 لوحة تحليلات تكاليف الـ API المتقدمة' : '📊 Advanced API Cost & Token Analytics'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PROFILE & CLOUD SYNC */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              {currentUser ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-700/80 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#c29b40]/15 border border-[#c29b40]/30 flex items-center justify-center text-lg font-black text-[#9c7524] dark:text-amber-400">
                      {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : (currentUser.email ? currentUser.email.charAt(0).toUpperCase() : 'U')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-sm text-stone-900 dark:text-stone-100 truncate">
                        {currentUser.displayName || (lang === 'ar' ? 'مستخدم عرب برومبت' : 'ArabPrompt User')}
                      </div>
                      <div className="text-xs text-stone-500 dark:text-stone-400 truncate">
                        {currentUser.email}
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-1">
                          <CheckCircle className="w-2.5 h-2.5" />
                          <span>{lang === 'ar' ? 'متصل بالمزامنة السحابية الفورية' : 'Instant Cloud Sync Active'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/70 dark:border-stone-700/60 text-xs space-y-2 text-stone-600 dark:text-stone-300">
                    <div className="font-bold text-stone-850 dark:text-stone-100 flex items-center gap-1.5">
                      <Cloud className="w-4 h-4 text-[#c29b40]" />
                      <span>{lang === 'ar' ? 'بيانات المزامنة السحابية:' : 'Cloud Sync Info:'}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      {lang === 'ar'
                        ? 'يتم حفظ وتحديث مسوداتك وأوامرك تلقائياً وبشكل مشفر في قاعدة بياناتك السحابية الخاصة مع كل عملية توليد أو تعديل.'
                        : 'Your prompts and drafts are automatically synced securely with Firestore upon each generation.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (onLogout) onLogout();
                      onClose();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 hover:bg-rose-100 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-600" />
                    <span>{lang === 'ar' ? 'تسجيل الخروج من الحساب' : 'Sign Out'}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#c29b40]/10 border border-[#c29b40]/25 text-xs text-[#916a24] dark:text-amber-300 leading-relaxed space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-stone-850 dark:text-stone-100">
                      <ShieldCheck className="w-4 h-4 text-[#c29b40]" />
                      <span>{lang === 'ar' ? 'تسجيل الدخول اختياري بالكامل' : 'Sign-in is 100% Optional'}</span>
                    </div>
                    <p className="text-[11px] text-stone-600 dark:text-stone-300">
                      {lang === 'ar'
                        ? 'يمكنك متابعة رصيدك واستخدام كافة المولدات كضيف. سجل دخولك إذا أردت مزامنة سجلك وأوامرك سحابياً عبر مختلف أجهزتك.'
                        : 'You can monitor quota and use all builders as guest. Sign in if you want multi-device cloud backup.'}
                    </p>
                  </div>

                  {/* Google Sign In Button */}
                  <button
                    type="button"
                    onClick={handleGoogleSubmit}
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl border border-stone-200 dark:border-stone-700 bg-white hover:bg-stone-50 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-850 dark:text-stone-100 font-bold text-xs flex items-center justify-center gap-2.5 transition cursor-pointer shadow-sm hover:border-[#c29b40]/50"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#c29b40]" />
                    ) : (
                      <>
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                        <span>{lang === 'ar' ? 'المتابعة بحساب Google للمزامنة' : 'Continue with Google for Sync'}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PLANS & UPGRADE */}
          {activeTab === 'plans' && (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#c29b40]/15 to-amber-500/10 border border-[#c29b40]/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 block">
                    {lang === 'ar' ? 'باقتك الحالية:' : 'Current Plan:'}
                  </span>
                  <div className="text-sm font-black text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <Crown className="w-4 h-4 text-[#c29b40]" />
                    <span>{PLAN_LIMITS[sub.plan].nameAr}</span>
                  </div>
                </div>

                <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold ${
                  sub.plan !== 'free'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                }`}>
                  {sub.plan !== 'free' ? (lang === 'ar' ? 'اشتراك نشط ⭐' : 'Active Plan') : (lang === 'ar' ? 'مجاني' : 'Free')}
                </span>
              </div>

              {/* Quick Plan Choices */}
              <div className="space-y-2 pt-1">
                {/* Lite Option */}
                <div className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                  sub.plan === 'lite' 
                    ? 'border-[#c29b40] bg-[#c29b40]/10 ring-1 ring-[#c29b40]' 
                    : 'border-stone-200 dark:border-stone-800 hover:border-[#c29b40]/50 bg-white dark:bg-stone-900'
                }`}>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-stone-900 dark:text-stone-100">
                        {PLAN_LIMITS.lite.nameAr}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 font-bold">
                        {lang === 'ar' ? 'أرخص باقة ⚡' : 'Best Value'}
                      </span>
                    </div>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400">
                      {lang === 'ar' ? '100 طلب/يوم + هندسة عكسية + تصدير PDF' : '100 prompts/day + Reverse + PDF Export'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-black text-stone-900 dark:text-stone-100">
                      $5<span className="text-[9px] font-normal text-stone-400">/شهر</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onOpenCheckout) onOpenCheckout('lite');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#916a24] to-[#c29b40] text-white text-[10px] font-black hover:opacity-95 cursor-pointer"
                    >
                      {sub.plan === 'lite' ? (lang === 'ar' ? 'باقتك الحالية' : 'Current') : (lang === 'ar' ? 'اختيار' : 'Select')}
                    </button>
                  </div>
                </div>

                {/* Pro Option */}
                <div className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                  sub.plan === 'pro' 
                    ? 'border-[#c29b40] bg-[#c29b40]/10 ring-1 ring-[#c29b40]' 
                    : 'border-stone-200 dark:border-stone-800 hover:border-[#c29b40]/50 bg-white dark:bg-stone-900'
                }`}>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-stone-900 dark:text-stone-100">
                        {PLAN_LIMITS.pro.nameAr}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 font-bold">
                        {lang === 'ar' ? 'غير محدود ⭐' : 'Unlimited'}
                      </span>
                    </div>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400">
                      {lang === 'ar' ? 'طلبات غير محدودة + تثبيت الوجوه والشخصيات' : 'Unlimited prompts + Face Anchor'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-black text-stone-900 dark:text-stone-100">
                      $7<span className="text-[9px] font-normal text-stone-400">/شهر</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onOpenCheckout) onOpenCheckout('pro');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#c29b40] text-white text-[10px] font-black hover:opacity-95 cursor-pointer"
                    >
                      {sub.plan === 'pro' ? (lang === 'ar' ? 'باقتك الحالية' : 'Current') : (lang === 'ar' ? 'اختيار' : 'Select')}
                    </button>
                  </div>
                </div>

                {/* Studio Option */}
                <div className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                  sub.plan === 'studio' 
                    ? 'border-[#c29b40] bg-[#c29b40]/10 ring-1 ring-[#c29b40]' 
                    : 'border-stone-200 dark:border-stone-800 hover:border-[#c29b40]/50 bg-white dark:bg-stone-900'
                }`}>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-stone-900 dark:text-stone-100">
                        {PLAN_LIMITS.studio.nameAr}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 font-bold">
                        {lang === 'ar' ? 'مفتاح API خاص' : 'REST API Key'}
                      </span>
                    </div>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400">
                      {lang === 'ar' ? 'استوديو كامل + تكامل برمجي مباشر' : 'Full studio + API endpoint integration'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-black text-stone-900 dark:text-stone-100">
                      $24<span className="text-[9px] font-normal text-stone-400">/شهر</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onOpenCheckout) onOpenCheckout('studio');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 text-[10px] font-black hover:opacity-95 cursor-pointer"
                    >
                      {sub.plan === 'studio' ? (lang === 'ar' ? 'باقتك الحالية' : 'Current') : (lang === 'ar' ? 'اختيار' : 'Select')}
                    </button>
                  </div>
                </div>
              </div>

              {sub.plan !== 'free' && (
                <div className="pt-2 text-center">
                  <p className="text-[11px] text-stone-500">
                    {lang === 'ar' 
                      ? `ينتهي اشتراكك الحالي أو يتجدد في: ${new Date(sub.renewalDate).toLocaleDateString('ar-EG')}` 
                      : `Renewal date: ${new Date(sub.renewalDate).toLocaleDateString()}`}
                  </p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
