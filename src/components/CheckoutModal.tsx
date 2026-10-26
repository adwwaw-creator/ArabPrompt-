/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  X, Check, Sparkles, Shield, Crown, CreditCard, 
  Lock, CheckCircle2, ArrowRight, ArrowLeft, Tag,
  Zap, Star, Award, AlertCircle, Copy, CheckCheck, QrCode, Coins
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

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: AppLanguage;
  initialPlan?: SubscriptionPlan;
  initialBillingCycle?: 'monthly' | 'annual';
  user: User | null;
  onSubscriptionSuccess?: (sub: UserSubscription) => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  lang,
  initialPlan = 'pro',
  initialBillingCycle = 'annual',
  user,
  onSubscriptionSuccess
}: CheckoutModalProps) {
  const isAr = lang === 'ar';
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(initialPlan === 'free' ? 'lite' : initialPlan);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>(initialBillingCycle);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple' | 'paypal' | 'binance' | 'promo'>('card');
  
  // Binance Pay State
  const [binancePayIdCopied, setBinancePayIdCopied] = useState(false);
  const [binanceWalletCopied, setBinanceWalletCopied] = useState(false);
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
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [cardName, setCardName] = useState(user?.displayName || 'عضو مميز');

  // Promo code state
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [activatedSub, setActivatedSub] = useState<UserSubscription | null>(null);

  const planInfo = PLAN_LIMITS[selectedPlan];
  const originalPrice = billingCycle === 'annual' ? planInfo.priceAnnual : planInfo.priceMonthly;
  const finalPrice = promoApplied ? 0 : originalPrice;

  const handleApplyPromo = () => {
    setPromoError('');
    const code = promoCode.trim().toUpperCase();
    if (['ARAB2026', 'PROMPTPRO', 'VIP2026', 'FREEPRO', 'STUDIO100', 'SAVE100'].includes(code)) {
      setPromoApplied(true);
      setPromoError('');
    } else {
      setPromoError(isAr ? 'كود الخصم غير صالح أو منتهي الصلاحية' : 'Invalid or expired coupon code');
    }
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Realistic smooth simulated processing
      await new Promise(resolve => setTimeout(resolve, 1400));

      const newSub = await upgradeSubscription(
        selectedPlan,
        billingCycle,
        promoApplied ? 'promo_voucher' : paymentMethod,
        user?.uid
      );

      setActivatedSub(newSub);
      setIsSuccess(true);
      setIsProcessing(false);

      if (onSubscriptionSuccess) {
        onSubscriptionSuccess(newSub);
      }
    } catch (err) {
      console.error('Payment processing failed:', err);
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 bg-stone-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md sm:max-w-xl md:max-w-2xl bg-white dark:bg-[#151412] rounded-2xl sm:rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[88vh]"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Top Header - Compact for Mobile */}
        <div className="px-3.5 py-2.5 sm:px-5 sm:py-4 border-b border-stone-200/80 dark:border-stone-800/80 flex items-center justify-between bg-stone-50/70 dark:bg-stone-900/40 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#c29b40] text-white flex items-center justify-center shadow-md shrink-0">
              <Crown className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base md:text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-1.5 sm:gap-2">
                <span>{isAr ? 'الترقية إلى باقة ArabPrompt' : 'Upgrade to Premium Plan'}</span>
                <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                  {isAr ? 'تفعيل فوري' : 'Instant Access'}
                </span>
              </h3>
              <p className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 line-clamp-1">
                {isAr ? 'إلغاء قيود الاستخدام وفتح الاستوديو السينمائي والميزات المتقدمة' : 'Unlock unlimited prompt synthesis and cinema studio workflows'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body - Ergonomic Scrollbar & Proportions */}
        <div className="p-3 sm:p-5 overflow-y-auto space-y-3 sm:space-y-4 custom-scrollbar">
          
          {isSuccess ? (
            /* Success Celebration View */
            <div className="text-center py-4 sm:py-6 space-y-3 sm:space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>

              <div className="space-y-1">
                <h4 className="text-base sm:text-xl font-black text-stone-900 dark:text-stone-100">
                  {isAr ? '🎉 مبارك! تم تفعيل اشتراكك بنجاح' : '🎉 Congratulations! Your plan is active'}
                </h4>
                <p className="text-[11px] sm:text-xs text-stone-600 dark:text-stone-400 max-w-md mx-auto">
                  {isAr 
                    ? `أنت الآن مشترك في ${planInfo.nameAr}. تم رفع كافة القيود اليومية وتفعيل أدوات السيناريو ومثبت الوجه السحابي لحسابك.` 
                    : `You are now on ${planInfo.nameEn}. All limits are unlocked and cinema studio features are ready for you.`}
                </p>
              </div>

              {/* Receipt Snippet */}
              <div className="max-w-md mx-auto p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 text-xs text-stone-700 dark:text-stone-300 space-y-1.5 text-start">
                <div className="flex justify-between text-[11px]">
                  <span className="text-stone-400">{isAr ? 'رقم العملية:' : 'Transaction ID:'}</span>
                  <span className="font-mono font-bold text-stone-900 dark:text-stone-100">{activatedSub?.transactionId}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-stone-400">{isAr ? 'الباقة المفعلة:' : 'Activated Tier:'}</span>
                  <span className="font-bold text-[#c29b40]">{planInfo.nameAr}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-stone-400">{isAr ? 'دورة التجديد:' : 'Billing Cycle:'}</span>
                  <span>{billingCycle === 'annual' ? (isAr ? 'سنوي (وفرت 25%)' : 'Annual (Saved 25%)') : (isAr ? 'شهري' : 'Monthly')}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-stone-400">{isAr ? 'تاريخ التجديد القادم:' : 'Next Renewal:'}</span>
                  <span>{activatedSub?.renewalDate ? new Date(activatedSub.renewalDate).toLocaleDateString(isAr ? 'ar-EG' : 'en-US') : '-'}</span>
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#916a24] via-[#c29b40] to-amber-500 text-white font-black text-xs shadow-md transition-all cursor-pointer hover:opacity-95"
                >
                  {isAr ? 'ابدأ الاستمتاع بميزاتك الآن ⚡' : 'Start Creating Now ⚡'}
                </button>
              </div>
            </div>
          ) : (
            /* Checkout Form View */
            <form onSubmit={handleProcessPayment} className="space-y-3 sm:space-y-4">
              
              {/* Plan Choice Selector - 3 columns side-by-side to save mobile screen space */}
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
                {/* Lite Option - The Cheapest Paid Tier */}
                <button
                  type="button"
                  onClick={() => setSelectedPlan('lite')}
                  className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl border text-start transition-all cursor-pointer relative flex flex-col justify-between ${
                    selectedPlan === 'lite'
                      ? 'border-emerald-500 bg-emerald-500/10 ring-1 sm:ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] sm:text-xs font-black text-stone-900 dark:text-stone-100 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span className="truncate">{isAr ? 'Lite' : 'Lite'}</span>
                    </span>
                    {selectedPlan === 'lite' && <Check className="w-3 h-3 text-emerald-600 shrink-0" />}
                  </div>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-xs sm:text-base font-black text-emerald-600 dark:text-emerald-400 truncate">
                      {formatPrice(billingCycle === 'annual' ? 3.50 : 5.00).fullFormatted}
                    </span>
                    <span className="text-[8px] sm:text-[9px] text-stone-400 shrink-0">{isAr ? '/ش' : '/mo'}</span>
                  </div>
                  <span className="text-[8px] sm:text-[9px] text-emerald-700 dark:text-emerald-400 font-bold truncate mt-0.5 block">
                    {isAr ? 'الأرخص 💸' : 'Budget'}
                  </span>
                </button>

                {/* Pro Option */}
                <button
                  type="button"
                  onClick={() => setSelectedPlan('pro')}
                  className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl border text-start transition-all cursor-pointer relative flex flex-col justify-between ${
                    selectedPlan === 'pro'
                      ? 'border-[#c29b40] bg-[#c29b40]/10 ring-1 sm:ring-2 ring-[#c29b40]/20 shadow-xs'
                      : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] sm:text-xs font-black text-stone-900 dark:text-stone-100 flex items-center gap-1">
                      <Crown className="w-3 h-3 text-[#c29b40] shrink-0" />
                      <span className="truncate">{isAr ? 'Pro' : 'Pro'}</span>
                    </span>
                    {selectedPlan === 'pro' && <Check className="w-3 h-3 text-[#c29b40] shrink-0" />}
                  </div>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-xs sm:text-base font-black text-stone-900 dark:text-stone-100 truncate">
                      {formatPrice(billingCycle === 'annual' ? 7 : 9).fullFormatted}
                    </span>
                    <span className="text-[8px] sm:text-[9px] text-stone-400 shrink-0">{isAr ? '/ش' : '/mo'}</span>
                  </div>
                  <span className="text-[8px] sm:text-[9px] text-[#9c7524] dark:text-amber-400 font-bold truncate mt-0.5 block">
                    {isAr ? 'الأكثر طلباً ⭐' : 'Unlimited'}
                  </span>
                </button>

                {/* Studio Option */}
                <button
                  type="button"
                  onClick={() => setSelectedPlan('studio')}
                  className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl border text-start transition-all cursor-pointer relative flex flex-col justify-between ${
                    selectedPlan === 'studio'
                      ? 'border-purple-500 bg-purple-500/10 ring-1 sm:ring-2 ring-purple-500/20 shadow-xs'
                      : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] sm:text-xs font-black text-stone-900 dark:text-stone-100 flex items-center gap-1">
                      <Crown className="w-3 h-3 text-purple-600 dark:text-purple-400 shrink-0" />
                      <span className="truncate">{isAr ? 'استوديو' : 'Studio'}</span>
                    </span>
                    {selectedPlan === 'studio' && <Check className="w-3 h-3 text-purple-600 shrink-0" />}
                  </div>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-xs sm:text-base font-black text-stone-900 dark:text-stone-100 truncate">
                      {formatPrice(billingCycle === 'annual' ? 24 : 29).fullFormatted}
                    </span>
                    <span className="text-[8px] sm:text-[9px] text-stone-400 shrink-0">{isAr ? '/ش' : '/mo'}</span>
                  </div>
                  <span className="text-[8px] sm:text-[9px] text-purple-700 dark:text-purple-400 font-bold truncate mt-0.5 block">
                    {isAr ? 'API وفرق' : 'API & Teams'}
                  </span>
                </button>
              </div>

              {/* Billing Cycle Switch - Compact */}
              <div className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-stone-100 dark:bg-stone-900 text-[11px] sm:text-xs font-bold">
                <span className="text-stone-700 dark:text-stone-300 text-[11px] sm:text-xs">
                  {isAr ? 'فترة التجديد:' : 'Billing Term:'}
                </span>

                <div className="flex items-center gap-1 bg-white dark:bg-stone-800 p-0.5 sm:p-1 rounded-lg sm:rounded-xl border border-stone-200 dark:border-stone-700">
                  <button
                    type="button"
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-md sm:rounded-lg text-[10px] sm:text-xs transition-colors cursor-pointer ${
                      billingCycle === 'monthly' ? 'bg-[#c29b40] text-white shadow-xs font-bold' : 'text-stone-500'
                    }`}
                  >
                    {isAr ? 'شهري' : 'Monthly'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle('annual')}
                    className={`px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-md sm:rounded-lg text-[10px] sm:text-xs transition-colors cursor-pointer flex items-center gap-1 ${
                      billingCycle === 'annual' ? 'bg-[#c29b40] text-white shadow-xs font-bold' : 'text-stone-500'
                    }`}
                  >
                    <span>{isAr ? 'سنوي' : 'Annual'}</span>
                    <span className="text-[8px] sm:text-[9px] bg-emerald-500 text-white px-1 py-0.2 rounded-full font-black">
                      -25%
                    </span>
                  </button>
                </div>
              </div>

              {/* Payment Method Selector - 5 Methods in 1 Row on Mobile */}
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-[11px] sm:text-xs font-bold text-stone-700 dark:text-stone-300 block">
                  {isAr ? 'طريقة الدفع:' : 'Payment Method:'}
                </label>

                <div className="grid grid-cols-5 gap-1 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 sm:gap-1 ${
                      paymentMethod === 'card'
                        ? 'border-[#c29b40] bg-[#c29b40]/10 text-[#9c7524] dark:text-amber-400 font-bold'
                        : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="text-[8px] sm:text-[10px] truncate max-w-full">{isAr ? 'بطاقة' : 'Card'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('apple')}
                    className={`p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 sm:gap-1 ${
                      paymentMethod === 'apple'
                        ? 'border-[#c29b40] bg-[#c29b40]/10 text-[#9c7524] dark:text-amber-400 font-bold'
                        : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-black leading-none">Pay</span>
                    <span className="text-[8px] sm:text-[10px] truncate max-w-full">Apple</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('paypal')}
                    className={`p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 sm:gap-1 ${
                      paymentMethod === 'paypal'
                        ? 'border-[#c29b40] bg-[#c29b40]/10 text-[#9c7524] dark:text-amber-400 font-bold'
                        : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-black text-blue-600 leading-none">P</span>
                    <span className="text-[8px] sm:text-[10px] truncate max-w-full">PayPal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('binance')}
                    className={`p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 sm:gap-1 ${
                      paymentMethod === 'binance'
                        ? 'border-[#F0B90B] bg-[#F0B90B]/10 text-[#d49e00] dark:text-[#F0B90B] font-bold ring-1 ring-[#F0B90B]/50'
                        : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50'
                    }`}
                  >
                    <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex items-center justify-center rounded bg-[#F0B90B] text-black font-black text-[8px] sm:text-[9px] shadow-xs">
                      ₿
                    </div>
                    <span className="text-[8px] sm:text-[10px] truncate max-w-full">{isAr ? 'بينانس' : 'Binance'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('promo')}
                    className={`p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 sm:gap-1 ${
                      paymentMethod === 'promo'
                        ? 'border-[#c29b40] bg-[#c29b40]/10 text-[#9c7524] dark:text-amber-400 font-bold'
                        : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50'
                    }`}
                  >
                    <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="text-[8px] sm:text-[10px] truncate max-w-full">{isAr ? 'كوبون' : 'Promo'}</span>
                  </button>
                </div>
              </div>

              {/* Conditional Payment Method Input Box - Compact */}
              {paymentMethod === 'card' && (
                <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900/40 space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold text-stone-700 dark:text-stone-300">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3 h-3 text-emerald-500" />
                      <span>{isAr ? 'بيانات البطاقة (256-bit SSL)' : 'Card Details (SSL)'}</span>
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-stone-400">Visa • MC • Mada</span>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="Card Number"
                      className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs rounded-lg sm:rounded-xl border border-stone-300/80 dark:border-stone-700 bg-white dark:bg-stone-800 font-mono tracking-wider focus:outline-none focus:border-[#c29b40]"
                      required
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs rounded-lg sm:rounded-xl border border-stone-300/80 dark:border-stone-700 bg-white dark:bg-stone-800 font-mono text-center focus:outline-none focus:border-[#c29b40]"
                        required
                      />
                      <input
                        type="text"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        placeholder="CVC"
                        className="px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs rounded-lg sm:rounded-xl border border-stone-300/80 dark:border-stone-700 bg-white dark:bg-stone-800 font-mono text-center focus:outline-none focus:border-[#c29b40]"
                        required
                      />
                    </div>

                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder={isAr ? 'الاسم كما هو مدون على البطاقة' : 'Cardholder Name'}
                      className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs rounded-lg sm:rounded-xl border border-stone-300/80 dark:border-stone-700 bg-white dark:bg-stone-800 focus:outline-none focus:border-[#c29b40]"
                      required
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'apple' && (
                <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900/40 text-center space-y-1.5">
                  <p className="text-[11px] sm:text-xs text-stone-600 dark:text-stone-300">
                    {isAr 
                      ? 'سيتم تفعيل الدفع بلمسة واحدة عبر Apple Pay أو Google Pay المحفوظة على هاتفك.' 
                      : 'One-touch checkout with Apple Pay or Google Pay configured on your phone.'}
                  </p>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-800 dark:text-stone-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{isAr ? 'المحفظة الرقمية متصلة وجاهزة' : 'Digital Wallet Ready'}</span>
                  </div>
                </div>
              )}

              {paymentMethod === 'paypal' && (
                <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900/40 text-center space-y-1.5">
                  <p className="text-[11px] sm:text-xs text-stone-600 dark:text-stone-300">
                    {isAr ? 'سيتم ربط اشتراكك وتأكيده عبر حساب PayPal الخاص بك.' : 'Checkout securely through your PayPal balance or linked card.'}
                  </p>
                </div>
              )}

              {paymentMethod === 'binance' && (
                <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-[#F0B90B]/40 bg-[#F0B90B]/5 space-y-2.5 sm:space-y-3">
                  {/* Binance Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-[#F0B90B]/20">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-lg bg-[#F0B90B] text-black font-black flex items-center justify-center text-xs shadow-xs">
                        ₿
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] sm:text-xs font-black text-stone-900 dark:text-stone-100">
                            {isAr ? 'بينانس باي (Binance Pay)' : 'Binance Pay'}
                          </span>
                          <span className="text-[8px] px-1.5 py-0.2 rounded-full bg-emerald-500 text-white font-bold">
                            0% Fee
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Coin selector */}
                    <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-0.5 rounded-lg text-[9px] font-bold">
                      {(['USDT', 'BNB', 'BTC'] as const).map((coin) => (
                        <button
                          key={coin}
                          type="button"
                          onClick={() => setCryptoAsset(coin)}
                          className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
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

                  {/* QR & Pay ID Box */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 items-center">
                    {/* Pay Details & Credentials */}
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-[9px] sm:text-[10px] text-stone-500 dark:text-stone-400 block font-semibold mb-0.5">
                          {isAr ? 'معرّف الدفع (Binance Pay ID):' : 'Binance Pay ID:'}
                        </span>
                        <div className="flex items-center justify-between p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono text-stone-900 dark:text-stone-100 font-bold text-[11px]">
                          <span>849 201 934</span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText('849201934');
                              setBinancePayIdCopied(true);
                              setTimeout(() => setBinancePayIdCopied(false), 2000);
                            }}
                            className="p-1 text-stone-400 hover:text-[#d49e00] dark:hover:text-[#F0B90B] transition-colors cursor-pointer flex items-center gap-0.5 text-[9px]"
                          >
                            {binancePayIdCopied ? (
                              <span className="text-emerald-500 font-bold flex items-center gap-0.5">
                                <CheckCheck className="w-3 h-3" />
                                {isAr ? 'تم' : 'Done'}
                              </span>
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="text-[9px] sm:text-[10px] text-stone-500 dark:text-stone-400 block font-semibold mb-0.5">
                          {isAr ? 'المبلغ المطلوب سداده:' : 'Amount to Send:'}
                        </span>
                        <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-amber-500/10 border border-amber-500/20 font-mono font-bold text-stone-900 dark:text-stone-100 flex items-center justify-between text-[11px]">
                          <span className="text-[#c29b40] dark:text-[#F0B90B]">
                            {cryptoAsset === 'USDT' && `${finalPrice}.00 USDT`}
                            {cryptoAsset === 'BNB' && `${(finalPrice / 620).toFixed(4)} BNB`}
                            {cryptoAsset === 'BTC' && `${(finalPrice / 92000).toFixed(6)} BTC`}
                          </span>
                          <span className="text-[9px] text-stone-400">
                            ≈ ${finalPrice} USD
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* QR Code */}
                    <div className="p-2 rounded-lg sm:rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-center gap-2">
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-white p-1 rounded-lg border border-stone-100 flex items-center justify-center">
                        <div className="w-full h-full border border-dashed border-stone-300 dark:border-stone-600 rounded flex flex-col items-center justify-center bg-stone-50">
                          <div className="w-5 h-5 rounded bg-[#F0B90B] text-black font-black flex items-center justify-center text-[9px] shadow-xs">
                            ₿
                          </div>
                          <span className="text-[6px] text-stone-400 font-mono">Binance Pay</span>
                        </div>
                      </div>
                      <span className="text-[9px] text-stone-500 font-medium leading-tight">
                        {isAr ? 'امسح من تطبيق Binance للمتابعة' : 'Scan with Binance App'}
                      </span>
                    </div>
                  </div>

                  {/* Transaction ID Input */}
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={binanceTxId}
                      onChange={(e) => setBinanceTxId(e.target.value)}
                      placeholder={isAr ? 'أدخل معرّف الطلب أو حساب بينانس للتحقق التلقائي' : 'Binance Order ID / Pay ID'}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-300/80 dark:border-stone-700 bg-white dark:bg-stone-800 font-mono focus:outline-none focus:border-[#F0B90B]"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'promo' && (
                <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900/40 space-y-1.5">
                  <span className="text-[11px] sm:text-xs font-bold text-stone-700 dark:text-stone-300 block">
                    {isAr ? 'أدخل كود الخصم أو القسيمة:' : 'Enter promo or gift code:'}
                  </span>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder={isAr ? 'مثال: ARAB2026 أو VIP2026' : 'e.g. ARAB2026'}
                      className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-stone-300/80 dark:border-stone-700 bg-white dark:bg-stone-800 uppercase tracking-wider font-bold focus:outline-none focus:border-[#c29b40]"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      className="px-3 py-1.5 rounded-lg bg-[#c29b40] hover:bg-[#b08b33] text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      {isAr ? 'تطبيق' : 'Apply'}
                    </button>
                  </div>

                  {promoApplied && (
                    <div className="text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>{isAr ? 'تم تطبيق خصم 100% بنجاح! الترقية مجانية بالكامل.' : '100% Promo applied!'}</span>
                    </div>
                  )}

                  {promoError && (
                    <div className="text-[10px] sm:text-xs text-rose-500 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{promoError}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Order Summary & Total - Sleek Compact Bar */}
              <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 space-y-1.5 text-[11px] sm:text-xs">
                <div className="flex justify-between items-center text-stone-700 dark:text-stone-300">
                  <span>{planInfo.nameAr} ({billingCycle === 'annual' ? (isAr ? 'سنوي' : 'Annual') : (isAr ? 'شهري' : 'Monthly')})</span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-bold">{formatPrice(originalPrice).fullFormatted}</span>
                    {!formatPrice(originalPrice).isUsd && (
                      <span className="text-[9px] text-stone-400 font-mono">(${originalPrice})</span>
                    )}
                  </div>
                </div>
                {promoApplied && (
                  <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                    <span>{isAr ? 'خصم الكوبون (100%):' : 'Promo (100%):'}</span>
                    <span>-{formatPrice(originalPrice).fullFormatted}</span>
                  </div>
                )}
                <div className="border-t border-amber-500/20 pt-1.5 flex justify-between items-center text-xs sm:text-sm font-black text-stone-900 dark:text-stone-100">
                  <span>{isAr ? 'المبلغ الإجمالي:' : 'Total Amount:'}</span>
                  <div className="text-end">
                    <span className="text-base sm:text-lg text-[#c29b40] font-mono block leading-none">
                      {finalPrice === 0 ? (isAr ? 'مجاناً $0' : '$0 Free') : formatPrice(finalPrice).fullFormatted}
                    </span>
                    {finalPrice > 0 && !formatPrice(finalPrice).isUsd && (
                      <span className="text-[9px] text-stone-400 block font-normal">
                        ({formatPrice(finalPrice).usdFormatted} USD)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Submit Button */}
              <div className="space-y-1.5 pt-0.5">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-2.5 sm:py-3.5 px-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#916a24] via-[#c29b40] to-amber-500 hover:opacity-95 text-white font-black text-xs sm:text-sm shadow-md shadow-[#c29b40]/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{isAr ? 'جاري التحقق وتفعيل الاشتراك...' : 'Activating plan...'}</span>
                    </div>
                  ) : (
                    <>
                      <span>
                        {finalPrice === 0 
                          ? (isAr ? 'تأكيد الترقية الفورية مجاناً' : 'Confirm Instant Activation Free') 
                          : (isAr ? `تأكيد الدفع والترقية (${formatPrice(finalPrice).fullFormatted})` : `Complete Payment (${formatPrice(finalPrice).fullFormatted})`)}
                      </span>
                      <Arrow className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </>
                  )}
                </button>

                <p className="text-[9px] text-center text-stone-400 flex items-center justify-center gap-1">
                  <Shield className="w-3 h-3 text-stone-400" />
                  <span>
                    {isAr 
                      ? 'ضمان استرداد 14 يوماً. إلغاء بنقرة واحدة.' 
                      : '14-Day 100% money-back guarantee. Cancel anytime.'}
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
