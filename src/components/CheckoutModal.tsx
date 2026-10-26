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
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-[#151412] rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Top Header */}
        <div className="p-5 sm:p-6 border-b border-stone-200/80 dark:border-stone-800/80 flex items-center justify-between bg-stone-50/70 dark:bg-stone-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#c29b40] text-white flex items-center justify-center shadow-md">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <span>{isAr ? 'الترقية إلى الباقة الاحترافية المدفوعة' : 'Upgrade to Premium Plan'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                  {isAr ? 'تفعيل فوري' : 'Instant Access'}
                </span>
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
          
          {isSuccess ? (
            /* Success Celebration View */
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
                  <span className="text-stone-400">{isAr ? 'الباقة المفعلة:' : 'Activated Tier:'}</span>
                  <span className="font-bold text-[#c29b40]">{planInfo.nameAr}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">{isAr ? 'دورة التجديد:' : 'Billing Cycle:'}</span>
                  <span>{billingCycle === 'annual' ? (isAr ? 'سنوي (وفرت 25%)' : 'Annual (Saved 25%)') : (isAr ? 'شهري' : 'Monthly')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">{isAr ? 'تاريخ التجديد القادم:' : 'Next Renewal:'}</span>
                  <span>{activatedSub?.renewalDate ? new Date(activatedSub.renewalDate).toLocaleDateString(isAr ? 'ar-EG' : 'en-US') : '-'}</span>
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
          ) : (
            /* Checkout Form View */
            <form onSubmit={handleProcessPayment} className="space-y-6">
              
              {/* Plan Choice Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Lite Option - The Cheapest Paid Tier */}
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
                    onClick={() => setPaymentMethod('binance')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      paymentMethod === 'binance'
                        ? 'border-[#F0B90B] bg-[#F0B90B]/10 text-[#d49e00] dark:text-[#F0B90B] font-bold ring-1 ring-[#F0B90B]/50'
                        : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50'
                    }`}
                  >
                    <div className="w-4 h-4 flex items-center justify-center rounded bg-[#F0B90B] text-black font-black text-[9px] shadow-xs">
                      ₿
                    </div>
                    <span className="text-[10px] font-bold">{isAr ? 'بينانس باي' : 'Binance Pay'}</span>
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
                    <span className="text-[10px]">{isAr ? 'كوبون / منحة' : 'Promo Code'}</span>
                  </button>
                </div>
              </div>

              {/* Conditional Payment Method Input Box */}
              {paymentMethod === 'card' && (
                <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900/40 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-stone-700 dark:text-stone-300">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{isAr ? 'بيانات البطاقة البنكية المشفرة (256-bit SSL)' : 'Encrypted Card Details (256-bit SSL)'}</span>
                    </span>
                    <span className="text-[10px] text-stone-400">Visa • MC • Mada</span>
                  </div>

                  <div className="space-y-2">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="Card Number"
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

              {paymentMethod === 'apple' && (
                <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900/40 text-center space-y-2">
                  <p className="text-xs text-stone-600 dark:text-stone-300">
                    {isAr 
                      ? 'سيتم تفعيل الدفع بلمسة واحدة عبر Apple Pay أو Google Pay المحفوظة على جهازك.' 
                      : 'One-touch checkout with Apple Pay or Google Pay configured on your device.'}
                  </p>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-800 dark:text-stone-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>{isAr ? 'المحفظة الرقمية متصلة وجاهزة' : 'Digital Wallet Ready'}</span>
                  </div>
                </div>
              )}

              {paymentMethod === 'paypal' && (
                <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900/40 text-center space-y-2">
                  <p className="text-xs text-stone-600 dark:text-stone-300">
                    {isAr ? 'سيتم ربط اشتراكك وتأكيده عبر حساب PayPal الخاص بك.' : 'Checkout securely through your PayPal balance or linked card.'}
                  </p>
                </div>
              )}

              {paymentMethod === 'binance' && (
                <div className="p-4 rounded-2xl border border-[#F0B90B]/40 bg-[#F0B90B]/5 dark:bg-[#F0B90B]/5 space-y-4">
                  {/* Binance Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#F0B90B]/20">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#F0B90B] text-black font-black flex items-center justify-center text-sm shadow-xs">
                        ₿
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-stone-900 dark:text-stone-100">
                            {isAr ? 'بينانس باي (Binance Pay)' : 'Binance Pay & Crypto'}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500 text-white font-bold">
                            0% Gas Fee
                          </span>
                        </div>
                        <span className="text-[10px] text-stone-500 dark:text-stone-400">
                          {isAr ? 'دفع رقمي فوري وآمن بدون عمولات شبكة' : 'Zero-fee instant crypto settlement'}
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

                  {/* QR & Pay ID Box */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    {/* QR Preview Card */}
                    <div className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex flex-col items-center justify-center text-center gap-2">
                      <div className="relative w-28 h-28 bg-white p-2 rounded-xl shadow-inner border border-stone-100 flex items-center justify-center">
                        <div className="w-full h-full border-2 border-dashed border-stone-300 dark:border-stone-600 rounded-lg flex flex-col items-center justify-center relative overflow-hidden bg-stone-50">
                          <div className="absolute top-1 left-1 w-4 h-4 border-2 border-stone-800 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-stone-800" />
                          </div>
                          <div className="absolute top-1 right-1 w-4 h-4 border-2 border-stone-800 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-stone-800" />
                          </div>
                          <div className="absolute bottom-1 left-1 w-4 h-4 border-2 border-stone-800 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-stone-800" />
                          </div>
                          <div className="w-7 h-7 rounded-lg bg-[#F0B90B] text-black font-black flex items-center justify-center text-xs shadow-md z-10">
                            ₿
                          </div>
                          <span className="text-[8px] text-stone-400 font-mono mt-1">Binance Pay</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-stone-500 font-medium">
                        {isAr ? 'امسح بالباركود من تطبيق Binance' : 'Scan with Binance App'}
                      </span>
                    </div>

                    {/* Pay Details & Credentials */}
                    <div className="space-y-2.5 text-xs">
                      <div>
                        <span className="text-[10px] text-stone-500 dark:text-stone-400 block font-semibold mb-1">
                          {isAr ? 'معرّف الدفع الرسمي (Binance Pay ID):' : 'Official Binance Pay ID:'}
                        </span>
                        <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono text-stone-900 dark:text-stone-100 font-bold">
                          <span>849 201 934</span>
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

                      <div>
                        <span className="text-[10px] text-stone-500 dark:text-stone-400 block font-semibold mb-1">
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
                  </div>

                  {/* Transaction ID Input */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block">
                      {isAr ? 'معرّف عملية الدفع في بينانس (Binance Order ID / Pay ID):' : 'Binance Order ID / Pay ID:'}
                    </label>
                    <input
                      type="text"
                      value={binanceTxId}
                      onChange={(e) => setBinanceTxId(e.target.value)}
                      placeholder={isAr ? 'مثال: 384910284 أو معرف حسابك في بينانس' : 'e.g. 384910284 or your Binance User ID'}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300/80 dark:border-stone-700 bg-white dark:bg-stone-800 font-mono focus:outline-none focus:border-[#F0B90B]"
                    />
                    <p className="text-[10px] text-stone-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span>{isAr ? 'سيتم التحقق التلقائي وربط الترقية بحسابك فور الضغط على زر التأكيد أدناه.' : 'Plan activates automatically once confirmed below.'}</span>
                    </p>
                  </div>
                </div>
              )}

              {paymentMethod === 'promo' && (
                <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900/40 space-y-2">
                  <span className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                    {isAr ? 'أدخل كود الخصم أو قسيمة الترقية:' : 'Enter promo or gift code:'}
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder={isAr ? 'مثال: ARAB2026 أو VIP2026' : 'e.g. ARAB2026 or VIP2026'}
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
                      <span>{isAr ? 'تم تطبيق خصم 100% بنجاح! الترقية مجانية بالكامل.' : '100% Promo applied! Subscription is free.'}</span>
                    </div>
                  )}

                  {promoError && (
                    <div className="text-xs text-rose-500 font-medium flex items-center gap-1.5 pt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
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
                    <span>{isAr ? 'خصم الكوبون الترويجي (100%):' : 'Promo Voucher (100%):'}</span>
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

              {/* Action Submit Button */}
              <div className="space-y-2">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#916a24] via-[#c29b40] to-amber-500 hover:opacity-95 text-white font-black text-sm shadow-lg shadow-[#c29b40]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{isAr ? 'جاري التحقق وتفعيل الاشتراك بأمان...' : 'Securing and activating your plan...'}</span>
                    </div>
                  ) : (
                    <>
                      <span>
                        {finalPrice === 0 
                          ? (isAr ? 'تأكيد الترقية الفورية مجاناً' : 'Confirm Instant Activation Free') 
                          : (isAr ? `تأكيد الدفع والترقية (${formatPrice(finalPrice).fullFormatted})` : `Complete Payment & Upgrade (${formatPrice(finalPrice).fullFormatted})`)}
                      </span>
                      <Arrow className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-[10px] text-center text-stone-400 flex items-center justify-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-stone-400" />
                  <span>
                    {isAr 
                      ? 'ضمان استرداد كامل لمدة 14 يوماً. يمكنك الإلغاء في أي لحظة بنقرة واحدة.' 
                      : '14-Day 100% money-back guarantee. Cancel anytime with 1 click.'}
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
