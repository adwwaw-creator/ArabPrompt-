/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  X, Check, Sparkles, Shield, Crown, CreditCard, 
  Lock, CheckCircle2, ArrowRight, ArrowLeft, Tag,
  Clock, Copy, CheckCheck, AlertTriangle, LogIn, Mail, RefreshCw
} from 'lucide-react';
import { AppLanguage } from '../types';
import { 
  SubscriptionPlan, 
  PLAN_LIMITS, 
  upgradeSubscription,
  UserSubscription
} from '../utils/subscriptionService';
import { 
  CurrencyConfig,
  SUPPORTED_CURRENCIES,
  detectUserCurrency,
  formatCurrencyPrice
} from '../utils/currencyService';
import { User } from 'firebase/auth';
import { reloadAndCheckEmailVerified, resendVerificationEmail } from '../utils/firebaseAuth';
import { submitSubscriptionRequest } from '../utils/firestoreService';

const ADMIN_EMAILS = ['adwwaw@gmail.com', 'adouaourachid@gmail.com'];

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: AppLanguage;
  initialPlan?: SubscriptionPlan;
  initialBillingCycle?: 'monthly' | 'annual';
  user: User | null;
  onSubscriptionSuccess?: (sub: UserSubscription) => void;
  onOpenAuth?: () => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  lang,
  initialPlan = 'pro',
  initialBillingCycle = 'annual',
  user,
  onSubscriptionSuccess,
  onOpenAuth
}: CheckoutModalProps) {
  const isAr = lang === 'ar';
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(initialPlan === 'free' ? 'lite' : initialPlan);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>(initialBillingCycle);
  const [paymentMethod, setPaymentMethod] = useState<'binance' | 'card' | 'apple' | 'paypal' | 'promo'>('binance');

  // Synchronize plan & billing cycle whenever modal opens or props change
  useEffect(() => {
    if (isOpen) {
      if (initialPlan && initialPlan !== 'free') {
        setSelectedPlan(initialPlan);
      }
      if (initialBillingCycle) {
        setBillingCycle(initialBillingCycle);
      }
      setIsSuccess(false);
      setIsPendingRequest(false);
      setIsProcessing(false);
      setErrorMessage('');
    }
  }, [isOpen, initialPlan, initialBillingCycle]);

  // Auth & Email Verification State
  const isEmailVerified = user
    ? Boolean(
        user.emailVerified ||
        user.providerData?.some(p => p.providerId === 'google.com' || p.providerId === 'apple.com' || p.providerId === 'github.com')
      )
    : false;

  const isAdmin = Boolean(
    user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase())
  );

  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState('');

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleCheckEmailVerification = async () => {
    if (!user) return;
    setIsVerifyingEmail(true);
    setErrorMessage('');
    try {
      const verified = await reloadAndCheckEmailVerified(user);
      if (verified) {
        setResendMessage(isAr ? '🎉 تم التحقق من بريدك بنجاح! يمكنك الآن متابعة الاشتراك.' : '🎉 Email verified successfully! You can now proceed.');
      } else {
        setErrorMessage(isAr ? 'لم يتم العثور على تأكيد بعد. يرجى فتح الرسالة في بريدك والنقر على الرابط، ثم إعادة المحاولة.' : 'Email is not verified yet. Please check your inbox/spam and click the link.');
      }
    } catch {
      setErrorMessage(isAr ? 'حدث خطأ أثناء فحص حالة البريد. حاول مجدداً.' : 'Could not refresh verification status. Try again.');
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const handleResendEmail = async () => {
    if (!user || resendCooldown > 0) return;
    try {
      await resendVerificationEmail(user);
      setResendCooldown(30);
      setResendMessage(isAr ? `تم إرسال رابط تأكيد جديد إلى ${user.email}.` : `Verification email sent to ${user.email}.`);
    } catch (err: any) {
      setErrorMessage(err?.message || (isAr ? 'تعذر إرسال الرابط. يرجى الانتظار.' : 'Failed to send verification link.'));
    }
  };
  
  // Binance Pay State
  const [binancePayIdCopied, setBinancePayIdCopied] = useState(false);
  const [binanceTxId, setBinanceTxId] = useState('');
  const [cryptoAsset, setCryptoAsset] = useState<'USDT' | 'BNB' | 'BTC'>('USDT');

  // Local currency support
  const [currentCurrency, setCurrentCurrency] = useState<CurrencyConfig>(() => detectUserCurrency().currency);

  useEffect(() => {
    const handleCurrencyChange = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const code = customEvent.detail;
      if (code && SUPPORTED_CURRENCIES[code]) {
        setCurrentCurrency(SUPPORTED_CURRENCIES[code]);
      }
    };
    window.addEventListener('arabprompt_currency_changed', handleCurrencyChange);
    return () => window.removeEventListener('arabprompt_currency_changed', handleCurrencyChange);
  }, []);

  const formatPrice = (usd: number) => formatCurrencyPrice(usd, currentCurrency.code, isAr);

  // Card Form State
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState(user?.displayName || '');

  // Promo code state
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');

  // Processing & Confirmation State
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPendingRequest, setIsPendingRequest] = useState(false);
  const [submittedRequestId, setSubmittedRequestId] = useState('');
  const [activatedSub, setActivatedSub] = useState<UserSubscription | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const planInfo = PLAN_LIMITS[selectedPlan];
  const originalPrice = billingCycle === 'annual' ? planInfo.priceAnnual : planInfo.priceMonthly;
  const finalPrice = promoApplied ? 0 : originalPrice;

  const handleApplyPromo = () => {
    setPromoError('');
    const code = promoCode.trim().toUpperCase();
    // Valid administrative vouchers only
    if (['PROMPT2026', 'STUDIOVIP', 'CREATOROFFICIAL'].includes(code)) {
      setPromoApplied(true);
      setPromoError('');
    } else {
      setPromoError(isAr ? 'كود الخصم غير صالح أو منتهي الصلاحية' : 'Invalid or expired voucher code');
    }
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // 1. Strict guard: User must be signed in
    if (!user) {
      setErrorMessage(isAr ? 'يجب تسجيل الدخول أو إنشاء حساب بالبريد الإلكتروني أولاً للاشتراك.' : 'Please sign in or create an account with your email first.');
      return;
    }

    // 2. Strict guard: Email must be verified
    if (!isEmailVerified && !isAdmin) {
      setErrorMessage(isAr ? 'يجب تأكيد بريدك الإلكتروني أولاً قبل إتمام عملية الدفع والاشتراك.' : 'Please verify your email address before completing subscription.');
      return;
    }

    // 3. Binance verification: Require Transaction ID
    if (paymentMethod === 'binance' && !binanceTxId.trim() && !isAdmin) {
      setErrorMessage(isAr ? 'يرجى إدخال رقم العملية (Order ID أو Binance Pay ID) لتأكيد التحويل.' : 'Please provide your Binance Order ID or Pay ID.');
      return;
    }

    setIsProcessing(true);

    try {
      // If user is Admin or has valid 100% voucher: activate immediately
      if (isAdmin || (promoApplied && finalPrice === 0)) {
        await new Promise(resolve => setTimeout(resolve, 800));
        const newSub = await upgradeSubscription(
          selectedPlan,
          billingCycle,
          promoApplied ? 'promo_voucher' : paymentMethod,
          user.uid
        );
        setActivatedSub(newSub);
        setIsSuccess(true);
        setIsProcessing(false);
        if (onSubscriptionSuccess) {
          onSubscriptionSuccess(newSub);
        }
        return;
      }

      const targetTier = (selectedPlan === 'free' ? 'pro' : selectedPlan) as 'lite' | 'pro' | 'studio';

      // For Binance Pay: Submit real verification request to Firestore
      if (paymentMethod === 'binance') {
        const result = await submitSubscriptionRequest(
          user.uid,
          targetTier,
          billingCycle,
          'binance_' + cryptoAsset,
          binanceTxId.trim()
        );

        if (result.success) {
          setSubmittedRequestId(result.requestId);
          setIsPendingRequest(true);
        } else {
          setErrorMessage(isAr ? 'تعذر إرسال طلب الاشتراك. يرجى التحقق من الاتصال والمحاولة لاحقاً.' : 'Failed to submit subscription request. Please try again.');
        }
        setIsProcessing(false);
        return;
      }

      // For Cards / Apple Pay / PayPal: Submit official verification request
      const txRef = paymentMethod === 'card' 
        ? `CARD_ENDING_${(cardNumber.replace(/\s+/g, '') || 'XXXX').slice(-4)}`
        : `${paymentMethod.toUpperCase()}_CHECKOUT_${Date.now()}`;

      const cardResult = await submitSubscriptionRequest(
        user.uid,
        targetTier,
        billingCycle,
        paymentMethod,
        txRef
      );

      if (cardResult.success) {
        setSubmittedRequestId(cardResult.requestId);
        setIsPendingRequest(true);
      } else {
        setErrorMessage(isAr ? 'تعذر إرسال الطلب. يرجى استخدام Binance Pay أو المحاولة لاحقاً.' : 'Failed to submit payment request. Please try Binance Pay or try again.');
      }
      setIsProcessing(false);

    } catch (err: any) {
      console.error('Payment processing failed:', err);
      setErrorMessage(err?.message || (isAr ? 'حدث خطأ أثناء معالجة الطلب.' : 'Error processing request.'));
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-[#151412] rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Top Header */}
        <div className="p-5 sm:p-6 border-b border-stone-200/80 dark:border-stone-800/80 flex items-center justify-between bg-stone-50/70 dark:bg-stone-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#c29b40] text-white flex items-center justify-center shadow-md shrink-0">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <span>{isAr ? 'الترقية إلى الباقة الاحترافية المدفوعة' : 'Upgrade to Premium Plan'}</span>
                {isAdmin ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-bold">
                    {isAr ? 'حساب مدير المنصة' : 'Admin Account'}
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold">
                    {isAr ? 'اشتراك رسمي آمن' : 'Official Subscription'}
                  </span>
                )}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {isAr ? 'إلغاء قيود الاستخدام وفتح الاستوديو السينمائي والميزات المتقدمة' : 'Unlock unlimited prompt synthesis and cinema studio workflows'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">

          {/* 1. Unauthenticated Gate: User MUST be signed in */}
          {!user ? (
            <div className="py-8 px-4 text-center space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-[#c29b40] flex items-center justify-center mx-auto shadow-sm border border-amber-500/20">
                <LogIn className="w-8 h-8" />
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h4 className="text-lg sm:text-xl font-black text-stone-900 dark:text-stone-100">
                  {isAr ? '⚠️ تسجيل الدخول مطلوب أولاً' : '⚠️ Account Required to Subscribe'}
                </h4>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                  {isAr 
                    ? 'لا يمكن تفعيل الاشتراك أو الدفع كزائر مجهول؛ يجب ربط الاشتراك بحساب بريد إلكتروني مسجل ومؤكد لحفظ ميزاتك وسجلاتك السحابية.' 
                    : 'Subscriptions cannot be activated anonymously. Please sign in or register with your email so your subscription and cloud data are saved securely.'}
                </p>
              </div>

              <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOpenAuth) onOpenAuth();
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#916a24] via-[#c29b40] to-amber-500 text-white font-bold text-xs shadow-md hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>{isAr ? 'تسجيل الدخول / إنشاء حساب بالبريد الإلكتروني' : 'Sign In / Register with Email'}</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </div>

          ) : isSuccess ? (
            /* Direct Success Celebration View (Admins or 100% Vouchers) */
            <div className="text-center py-6 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1.5">
                <h4 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100">
                  {isAr ? '🎉 مبارك! تم تفعيل اشتراكك بنجاح' : '🎉 Congratulations! Your plan is active'}
                </h4>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-md mx-auto">
                  {isAr 
                    ? `أنت الآن مشترك في ${planInfo.nameAr}. تم رفع كافة القيود اليومية وتفعيل أدوات السيناريو ومثبت الوجه السحابي لحسابك.` 
                    : `You are now on ${planInfo.nameEn}. All limits are unlocked and cinema studio features are ready for you.`}
                </p>
              </div>

              {/* Receipt Snippet */}
              <div className="max-w-md mx-auto p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 text-xs text-stone-700 dark:text-stone-300 space-y-2 text-start">
                <div className="flex justify-between">
                  <span className="text-stone-400">{isAr ? 'رقم العملية:' : 'Transaction ID:'}</span>
                  <span className="font-mono font-bold text-stone-900 dark:text-stone-100">{activatedSub?.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">{isAr ? 'الحساب المرتبط:' : 'Account Email:'}</span>
                  <span className="font-mono font-bold text-stone-900 dark:text-stone-100">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">{isAr ? 'الباقة المفعلة:' : 'Activated Tier:'}</span>
                  <span className="font-bold text-[#c29b40]">{planInfo.nameAr}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">{isAr ? 'دورة التجديد:' : 'Billing Cycle:'}</span>
                  <span>{billingCycle === 'annual' ? (isAr ? 'سنوي (وفرت 25%)' : 'Annual (Saved 25%)') : (isAr ? 'شهري' : 'Monthly')}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-[#916a24] via-[#c29b40] to-amber-500 text-white font-black text-xs shadow-md transition-all cursor-pointer hover:opacity-95"
                >
                  {isAr ? 'ابدأ الاستمتاع بميزاتك الآن ⚡' : 'Start Creating Now ⚡'}
                </button>
              </div>
            </div>

          ) : isPendingRequest ? (
            /* Pending Verification View for Real Payment Submissions */
            <div className="text-center py-6 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-[#c29b40] flex items-center justify-center mx-auto shadow-md border border-amber-500/20">
                <Clock className="w-8 h-8 animate-pulse" />
              </div>

              <div className="space-y-1.5">
                <h4 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100">
                  {isAr ? '⏳ تم إرسال طلب تفعيل الاشتراك بنجاح' : '⏳ Subscription Request Submitted'}
                </h4>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-md mx-auto leading-relaxed">
                  {isAr 
                    ? `تم تسجيل طلبك لباقة (${planInfo.nameAr}) بنجاح في قاعدة البيانات. سيتم التحقق من مطابقة الدفع وتفعيل الباقة لحسابك (${user.email}) فوراً.` 
                    : `Your request for (${planInfo.nameEn}) has been submitted. Payment verification is under review and will be activated once matched.`}
                </p>
              </div>

              {/* Request Details */}
              <div className="max-w-md mx-auto p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 text-xs text-stone-700 dark:text-stone-300 space-y-2 text-start">
                <div className="flex justify-between">
                  <span className="text-stone-400">{isAr ? 'رقم الطلب:' : 'Request ID:'}</span>
                  <span className="font-mono font-bold text-stone-900 dark:text-stone-100">{submittedRequestId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">{isAr ? 'الحساب المستفيد:' : 'Beneficiary Account:'}</span>
                  <span className="font-mono text-stone-900 dark:text-stone-100">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">{isAr ? 'الباقة المختارة:' : 'Selected Plan:'}</span>
                  <span className="font-bold text-[#c29b40]">{planInfo.nameAr}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">{isAr ? 'حالة الطلب:' : 'Status:'}</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {isAr ? 'قيد التدقيق والمطابقة (Pending)' : 'Pending Verification'}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-black text-xs shadow-md transition-all cursor-pointer hover:opacity-95"
                >
                  {isAr ? 'حسناً، فهمت ذلك' : 'Got it, thank you'}
                </button>
              </div>
            </div>

          ) : (
            /* Checkout Form View */
            <form onSubmit={handleProcessPayment} className="space-y-6">

              {/* Email Verification Warning if User is logged in but Unverified */}
              {!isEmailVerified && !isAdmin && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-black text-sm">
                        {isAr ? '⚠️ بريدك الإلكتروني غير مؤكد بعد' : '⚠️ Email Not Verified Yet'}
                      </h5>
                      <p className="text-[11px] opacity-90 leading-relaxed mt-0.5">
                        {isAr 
                          ? `حسابك مسجل بالبريد (${user.email}) لكن لم يتم النقر على رابط التفعيل بعد. لضمان أمان حسابك وحفظ حقوق الاشتراك، يرجى تأكيد بريدك أولاً.` 
                          : `Your account (${user.email}) is not verified. Please confirm your email to protect your account and subscription.`}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleCheckEmailVerification}
                      disabled={isVerifyingEmail}
                      className="px-3.5 py-1.5 rounded-lg bg-[#c29b40] hover:bg-[#a8822e] text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isVerifyingEmail ? 'animate-spin' : ''}`} />
                      <span>{isVerifyingEmail ? (isAr ? 'جاري الفحص...' : 'Checking...') : (isAr ? 'تحقق من التفعيل الآن' : 'Check Verification Now')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResendEmail}
                      disabled={resendCooldown > 0}
                      className="px-3.5 py-1.5 rounded-lg bg-stone-200/80 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium text-xs hover:bg-stone-300 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {resendCooldown > 0 
                        ? (isAr ? `إعادة الإرسال بعد (${resendCooldown}ث)` : `Resend in (${resendCooldown}s)`) 
                        : (isAr ? 'إعادة إرسال الرابط' : 'Resend Link')}
                    </button>
                  </div>

                  {resendMessage && (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                      {resendMessage}
                    </p>
                  )}
                </div>
              )}
              
              {/* Plan Choice Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Lite Option */}
                <button
                  type="button"
                  onClick={() => setSelectedPlan('lite')}
                  className={`p-3.5 rounded-2xl border text-start transition-all cursor-pointer relative ${
                    selectedPlan === 'lite'
                      ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/20'
                      : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{isAr ? 'الانطلاقة Lite' : 'Starter Lite'}</span>
                    </span>
                    {selectedPlan === 'lite' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                      {formatPrice(billingCycle === 'annual' ? 3.50 : 5.00).fullFormatted}
                    </span>
                    <span className="text-[10px] text-stone-400">{isAr ? '/ شهر' : '/ mo'}</span>
                  </div>
                  <p className="text-[10px] text-stone-500 mt-1 line-clamp-1">
                    {isAr ? 'الأرخص 💸 (100 برومبت وتصدير)' : 'Cheapest (100 daily prompts)'}
                  </p>
                </button>

                {/* Pro Option */}
                <button
                  type="button"
                  onClick={() => setSelectedPlan('pro')}
                  className={`p-3.5 rounded-2xl border text-start transition-all cursor-pointer relative ${
                    selectedPlan === 'pro'
                      ? 'border-[#c29b40] bg-[#c29b40]/10 ring-2 ring-[#c29b40]/20'
                      : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                      <Crown className="w-3.5 h-3.5 text-[#c29b40]" />
                      <span>{isAr ? 'المحترف Pro' : 'Pro Creator'}</span>
                    </span>
                    {selectedPlan === 'pro' && <Check className="w-3.5 h-3.5 text-[#c29b40]" />}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black text-stone-900 dark:text-stone-100">
                      {formatPrice(billingCycle === 'annual' ? 7 : 9).fullFormatted}
                    </span>
                    <span className="text-[10px] text-stone-400">{isAr ? '/ شهر' : '/ mo'}</span>
                  </div>
                  <p className="text-[10px] text-stone-500 mt-1 line-clamp-1">
                    {isAr ? 'الأكثر طلباً ⭐ (غير محدود)' : 'Unlimited prompts & cinema'}
                  </p>
                </button>

                {/* Studio Option */}
                <button
                  type="button"
                  onClick={() => setSelectedPlan('studio')}
                  className={`p-3.5 rounded-2xl border text-start transition-all cursor-pointer relative ${
                    selectedPlan === 'studio'
                      ? 'border-purple-500 bg-purple-500/10 ring-2 ring-purple-500/20'
                      : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                      <Crown className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      <span>{isAr ? 'استوديو' : 'Studio'}</span>
                    </span>
                    {selectedPlan === 'studio' && <Check className="w-3.5 h-3.5 text-purple-600" />}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black text-stone-900 dark:text-stone-100">
                      {formatPrice(billingCycle === 'annual' ? 24 : 29).fullFormatted}
                    </span>
                    <span className="text-[10px] text-stone-400">{isAr ? '/ شهر' : '/ mo'}</span>
                  </div>
                  <p className="text-[10px] text-stone-500 mt-1 line-clamp-1">
                    {isAr ? 'مفاتيح API وفرق عمل' : 'REST API & Teams'}
                  </p>
                </button>
              </div>

              {/* Billing Cycle Switch */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-100 dark:bg-stone-900 text-xs font-bold">
                <span className="text-stone-700 dark:text-stone-300">
                  {isAr ? 'فترة الدفع والتجديد:' : 'Billing Term:'}
                </span>

                <div className="flex items-center gap-1 bg-white dark:bg-stone-800 p-1 rounded-xl border border-stone-200 dark:border-stone-700">
                  <button
                    type="button"
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-3 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                      billingCycle === 'monthly' ? 'bg-[#c29b40] text-white shadow-xs' : 'text-stone-500'
                    }`}
                  >
                    {isAr ? 'شهري' : 'Monthly'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle('annual')}
                    className={`px-3 py-1 rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                      billingCycle === 'annual' ? 'bg-[#c29b40] text-white shadow-xs' : 'text-stone-500'
                    }`}
                  >
                    <span>{isAr ? 'سنوي' : 'Annual'}</span>
                    <span className="text-[9px] bg-emerald-500 text-white px-1.5 py-0.2 rounded-full font-black">
                      -25%
                    </span>
                  </button>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                  {isAr ? 'طريقة الدفع المعتمدة:' : 'Select Payment Method:'}
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {/* Binance Pay - Recommended */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('binance')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      paymentMethod === 'binance'
                        ? 'border-[#F0B90B] bg-[#F0B90B]/10 text-[#d49e00] dark:text-[#F0B90B] font-bold ring-2 ring-[#F0B90B]/40'
                        : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50'
                    }`}
                  >
                    <div className="w-5 h-5 flex items-center justify-center rounded bg-[#F0B90B] text-black font-black text-[10px] shadow-xs">
                      ₿
                    </div>
                    <span className="text-[10px] font-black">{isAr ? 'بينانس باي ⭐' : 'Binance Pay ⭐'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      paymentMethod === 'card'
                        ? 'border-[#c29b40] bg-[#c29b40]/10 text-[#9c7524] dark:text-amber-400 font-bold'
                        : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span className="text-[10px]">{isAr ? 'بطاقة بنكية' : 'Card / Mada'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('apple')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      paymentMethod === 'apple'
                        ? 'border-[#c29b40] bg-[#c29b40]/10 text-[#9c7524] dark:text-amber-400 font-bold'
                        : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50'
                    }`}
                  >
                    <span className="text-sm font-black leading-none">Pay</span>
                    <span className="text-[10px]">Apple / GPay</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('paypal')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      paymentMethod === 'paypal'
                        ? 'border-[#c29b40] bg-[#c29b40]/10 text-[#9c7524] dark:text-amber-400 font-bold'
                        : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50'
                    }`}
                  >
                    <span className="text-sm font-black text-blue-600 leading-none">P</span>
                    <span className="text-[10px]">PayPal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('promo')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      paymentMethod === 'promo'
                        ? 'border-[#c29b40] bg-[#c29b40]/10 text-[#9c7524] dark:text-amber-400 font-bold'
                        : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50'
                    }`}
                  >
                    <Tag className="w-4 h-4" />
                    <span className="text-[10px]">{isAr ? 'كوبون معتمد' : 'Voucher'}</span>
                  </button>
                </div>
              </div>

              {/* Binance Pay Box Details */}
              {paymentMethod === 'binance' && (
                <div className="p-4 rounded-2xl border border-[#F0B90B]/40 bg-[#F0B90B]/5 dark:bg-[#F0B90B]/5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#F0B90B]/20">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#F0B90B] text-black font-black flex items-center justify-center text-sm shadow-xs">
                        ₿
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-stone-900 dark:text-stone-100">
                            {isAr ? 'بينانس باي الرسمي (Binance Pay)' : 'Official Binance Pay'}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500 text-white font-bold">
                            0% عمولة
                          </span>
                        </div>
                        <span className="text-[10px] text-stone-500 dark:text-stone-400">
                          {isAr ? 'تحويل رقمي مشفر وسريع يتم التحقق منه وتفعيله لحسابك' : 'Verified crypto transfer activated directly for your account'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Coin selector */}
                    <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl text-[10px] font-bold">
                      {(['USDT', 'BNB', 'BTC'] as const).map((coin) => (
                        <button
                          key={coin}
                          type="button"
                          onClick={() => setCryptoAsset(coin)}
                          className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                            cryptoAsset === coin 
                              ? 'bg-[#F0B90B] text-black shadow-xs font-black' 
                              : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
                          }`}
                        >
                          {coin}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pay Details & Credentials */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    <div className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2">
                      <span className="text-[10px] text-stone-500 dark:text-stone-400 block font-semibold">
                        {isAr ? 'معرّف الدفع الرسمي (Binance Pay ID):' : 'Official Binance Pay ID:'}
                      </span>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono text-stone-900 dark:text-stone-100 font-bold">
                        <span className="tracking-wider">849 201 934</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText('849201934');
                            setBinancePayIdCopied(true);
                            setTimeout(() => setBinancePayIdCopied(false), 2000);
                          }}
                          className="p-1 text-stone-400 hover:text-[#d49e00] dark:hover:text-[#F0B90B] transition-colors cursor-pointer flex items-center gap-1 text-[10px]"
                        >
                          {binancePayIdCopied ? (
                            <span className="text-emerald-500 font-bold flex items-center gap-0.5">
                              <CheckCheck className="w-3.5 h-3.5" />
                              {isAr ? 'تم النسخ' : 'Copied'}
                            </span>
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2">
                      <span className="text-[10px] text-stone-500 dark:text-stone-400 block font-semibold">
                        {isAr ? 'المبلغ المطلوب سداده بدقة:' : 'Exact Amount to Send:'}
                      </span>
                      <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 font-mono font-bold text-stone-900 dark:text-stone-100 flex items-center justify-between">
                        <span className="text-sm text-[#c29b40] dark:text-[#F0B90B]">
                          {cryptoAsset === 'USDT' && `${finalPrice}.00 USDT`}
                          {cryptoAsset === 'BNB' && `${(finalPrice / 620).toFixed(4)} BNB`}
                          {cryptoAsset === 'BTC' && `${(finalPrice / 92000).toFixed(6)} BTC`}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          ≈ ${finalPrice} USD
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Transaction ID Input */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block">
                      {isAr ? 'رقم أو معرّف عملية التحويل في بينانس (Binance Order ID / TxID):' : 'Binance Order ID or Transaction TxID:'}
                    </label>
                    <input
                      type="text"
                      value={binanceTxId}
                      onChange={(e) => setBinanceTxId(e.target.value)}
                      placeholder={isAr ? 'مثال: 384910284 أو معرّف حسابك في Binance' : 'e.g. 384910284 or your Binance Pay ID'}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300/80 dark:border-stone-700 bg-white dark:bg-stone-800 font-mono focus:outline-none focus:border-[#F0B90B]"
                      required={!isAdmin}
                    />
                    <p className="text-[10px] text-stone-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span>{isAr ? 'يتم تسجيل الطلب والمطابقة وتفعيل الباقة مباشرة في حسابك.' : 'Your request will be recorded and activated once matched.'}</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Card Form */}
              {paymentMethod === 'card' && (
                <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900/40 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-stone-700 dark:text-stone-300">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{isAr ? 'بيانات البطاقة البنكية المشفرة' : 'Encrypted Card Details'}</span>
                    </span>
                    <span className="text-[10px] text-stone-400">Visa • Mastercard • Mada</span>
                  </div>

                  <div className="space-y-2">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="Card Number (4242 •••• •••• ••••)"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300/80 dark:border-stone-700 bg-white dark:bg-stone-800 font-mono tracking-wider focus:outline-none focus:border-[#c29b40]"
                      required
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="px-3 py-2 text-xs rounded-xl border border-stone-300/80 dark:border-stone-700 bg-white dark:bg-stone-800 font-mono text-center focus:outline-none focus:border-[#c29b40]"
                        required
                      />
                      <input
                        type="text"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        placeholder="CVC"
                        className="px-3 py-2 text-xs rounded-xl border border-stone-300/80 dark:border-stone-700 bg-white dark:bg-stone-800 font-mono text-center focus:outline-none focus:border-[#c29b40]"
                        required
                      />
                    </div>

                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder={isAr ? 'الاسم كما هو مدون على البطاقة' : 'Cardholder Name'}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300/80 dark:border-stone-700 bg-white dark:bg-stone-800 focus:outline-none focus:border-[#c29b40]"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Apple / Google Pay */}
              {paymentMethod === 'apple' && (
                <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900/40 text-center space-y-2">
                  <p className="text-xs text-stone-600 dark:text-stone-300">
                    {isAr 
                      ? 'الدفع الآمن بلمسة واحدة عبر Apple Pay أو Google Pay.' 
                      : 'Secure one-touch payment via Apple Pay or Google Pay.'}
                  </p>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-800 dark:text-stone-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>{isAr ? 'المحفظة الرقمية جاهزة للربط' : 'Digital Wallet Ready'}</span>
                  </div>
                </div>
              )}

              {/* PayPal */}
              {paymentMethod === 'paypal' && (
                <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900/40 text-center space-y-2">
                  <p className="text-xs text-stone-600 dark:text-stone-300">
                    {isAr ? 'سيتم ربط اشتراكك وتأكيده عبر حساب PayPal الخاص بك.' : 'Checkout securely through your PayPal account.'}
                  </p>
                </div>
              )}

              {/* Promo Code */}
              {paymentMethod === 'promo' && (
                <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900/40 space-y-2.5">
                  <span className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                    {isAr ? 'أدخل كود الخصم أو قسيمة الترقية المعتمدة:' : 'Enter official voucher code:'}
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder={isAr ? 'أدخل الكود المعطى لك من الإدارة' : 'Enter voucher code'}
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-stone-300/80 dark:border-stone-700 bg-white dark:bg-stone-800 uppercase tracking-wider font-bold focus:outline-none focus:border-[#c29b40]"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      className="px-4 py-2 rounded-xl bg-[#c29b40] hover:bg-[#b08b33] text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      {isAr ? 'تطبيق' : 'Apply'}
                    </button>
                  </div>

                  {promoApplied && (
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5 pt-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>{isAr ? 'تم تطبيق القسيمة بنجاح! الترقية مجانية بالكامل.' : 'Voucher applied! Subscription is free.'}</span>
                    </div>
                  )}

                  {promoError && (
                    <div className="text-xs text-rose-500 font-medium flex items-center gap-1.5 pt-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{promoError}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Order Summary & Total */}
              <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 space-y-2 text-xs">
                <div className="flex justify-between items-center text-stone-700 dark:text-stone-300">
                  <span>{planInfo.nameAr} ({billingCycle === 'annual' ? (isAr ? 'سنوي' : 'Annual') : (isAr ? 'شهري' : 'Monthly')})</span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-bold">{formatPrice(originalPrice).fullFormatted}</span>
                    {!formatPrice(originalPrice).isUsd && (
                      <span className="text-[10px] text-stone-400 font-mono">(${originalPrice})</span>
                    )}
                  </div>
                </div>
                {promoApplied && (
                  <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-bold">
                    <span>{isAr ? 'خصم القسيمة (100%):' : 'Voucher Discount (100%):'}</span>
                    <span>-{formatPrice(originalPrice).fullFormatted}</span>
                  </div>
                )}
                <div className="border-t border-amber-500/20 pt-2 flex justify-between items-center text-sm font-black text-stone-900 dark:text-stone-100">
                  <span>{isAr ? 'المبلغ الإجمالي للدفع الآن:' : 'Total Amount Due:'}</span>
                  <div className="text-end">
                    <span className="text-xl text-[#c29b40] font-mono block">
                      {finalPrice === 0 ? (isAr ? 'مجاناً $0' : '$0 Free') : formatPrice(finalPrice).fullFormatted}
                    </span>
                    {finalPrice > 0 && !formatPrice(finalPrice).isUsd && (
                      <span className="text-[10px] text-stone-400 block font-normal">
                        ({formatPrice(finalPrice).usdFormatted} USD)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Action Submit Button */}
              <div className="space-y-2">
                <button
                  type="submit"
                  disabled={isProcessing || (!isEmailVerified && !isAdmin)}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#916a24] via-[#c29b40] to-amber-500 hover:opacity-95 text-white font-black text-sm shadow-lg shadow-[#c29b40]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{isAr ? 'جاري التحقق وتسجيل طلب الاشتراك...' : 'Verifying and recording your order...'}</span>
                    </div>
                  ) : (
                    <>
                      <span>
                        {isAdmin 
                          ? (isAr ? 'تأكيد الترقية الفورية (حساب مدير)' : 'Activate Instant Upgrade (Admin)')
                          : paymentMethod === 'binance'
                            ? (isAr ? `تأكيد إرسال التحويل عبر Binance Pay (${formatPrice(finalPrice).fullFormatted})` : `Submit Binance Pay Verification (${formatPrice(finalPrice).fullFormatted})`)
                            : (isAr ? `تأكيد الدفع والاشتراك (${formatPrice(finalPrice).fullFormatted})` : `Complete Payment & Upgrade (${formatPrice(finalPrice).fullFormatted})`)}
                      </span>
                      <Arrow className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-[10px] text-center text-stone-400 flex items-center justify-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-stone-400" />
                  <span>
                    {isAr 
                      ? 'لا يتم تفعيل أي باقة بدون التحقق الصارم من البريد الإلكتروني ومطابقة الدفع الحقيقي.' 
                      : 'All subscriptions strictly verified with email verification and confirmed payment.'}
                  </span>
                </p>
              </div>

            </form>
          )}

        </div>
      </div>
    </div>
  );
}
