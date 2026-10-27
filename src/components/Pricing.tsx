/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Check, X, Sparkles, Zap, Shield, Crown, HelpCircle, 
  ChevronDown, ChevronUp, Server, Database, Cpu, 
  ArrowRight, ArrowLeft, HeartHandshake, CheckCircle2,
  Layers, Clapperboard, Video, Film, Cloud, Info,
  Globe, Search, MapPin, RotateCcw, Lock, KeyRound, Coins
} from 'lucide-react';
import { AppLanguage, ActiveTab } from '../types';
import { SubscriptionPlan, upgradeSubscription } from '../utils/subscriptionService';
import { 
  CurrencyConfig, 
  SUPPORTED_CURRENCIES, 
  POPULAR_CURRENCIES, 
  detectUserCurrency, 
  setUserCurrency, 
  formatCurrencyPrice 
} from '../utils/currencyService';

interface PricingProps {
  lang: AppLanguage;
  onNavigateTab?: (tab: ActiveTab) => void;
  onOpenAuth?: (mode?: 'login' | 'profile') => void;
  onOpenCheckout?: (plan: SubscriptionPlan, billingCycle?: 'monthly' | 'annual') => void;
}

export default function Pricing({ lang, onNavigateTab, onOpenAuth, onOpenCheckout }: PricingProps) {
  const isAr = lang === 'ar';
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [monthlyPromptsEst, setMonthlyPromptsEst] = useState<number>(350);

  // Local currency state based on user's country / preference
  const [currentCurrency, setCurrentCurrency] = useState<CurrencyConfig>(() => detectUserCurrency().currency);
  const [isAutoDetected, setIsAutoDetected] = useState<boolean>(() => detectUserCurrency().isAutoDetected);
  const [isCurrencySelectorOpen, setIsCurrencySelectorOpen] = useState(false);
  const [currencySearchQuery, setCurrencySearchQuery] = useState('');

  // Quick Voucher state
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherMsg, setVoucherMsg] = useState<{ text: string; success: boolean } | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);

  // Sync currency changes across app
  useEffect(() => {
    const handleCurrencyChange = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const code = customEvent.detail;
      if (code && SUPPORTED_CURRENCIES[code]) {
        setCurrentCurrency(SUPPORTED_CURRENCIES[code]);
        setIsAutoDetected(false);
      }
    };
    window.addEventListener('arabprompt_currency_changed', handleCurrencyChange);
    return () => window.removeEventListener('arabprompt_currency_changed', handleCurrencyChange);
  }, []);

  const handleSelectCurrency = (code: string) => {
    if (SUPPORTED_CURRENCIES[code]) {
      setCurrentCurrency(SUPPORTED_CURRENCIES[code]);
      setIsAutoDetected(false);
      setUserCurrency(code);
      setIsCurrencySelectorOpen(false);
    }
  };

  const handleResetToAutoDetect = () => {
    try {
      localStorage.removeItem('arabprompt_preferred_currency');
    } catch {
      // ignore
    }
    const detected = detectUserCurrency();
    setCurrentCurrency(detected.currency);
    setIsAutoDetected(true);
    setIsCurrencySelectorOpen(false);
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // Pricing calculations (base in USD)
  const litePrice = billingCycle === 'annual' ? 3.50 : 5.00;
  const proPrice = billingCycle === 'annual' ? 7.00 : 9.00;
  const studioPrice = billingCycle === 'annual' ? 24.00 : 29.00;

  // Local currency formatter helper
  const formatPrice = (usd: number) => formatCurrencyPrice(usd, currentCurrency.code, isAr);

  // Filtered currencies for search
  const filteredCurrencies = Object.values(SUPPORTED_CURRENCIES).filter((c) => {
    const query = currencySearchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      c.code.toLowerCase().includes(query) ||
      c.nameAr.toLowerCase().includes(query) ||
      c.nameEn.toLowerCase().includes(query) ||
      c.countryAr.toLowerCase().includes(query) ||
      c.countryEn.toLowerCase().includes(query) ||
      c.symbolAr.toLowerCase().includes(query)
    );
  });

  const handleRedeemVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    setVoucherMsg(null);
    const code = voucherCode.trim().toUpperCase();
    if (['VIP2026', 'PROMPTPRO', 'FULLACCESS', 'ARAB2026', 'PAID100', 'ADWWAW'].includes(code)) {
      setIsRedeeming(true);
      await new Promise(r => setTimeout(r, 600));
      await upgradeSubscription('pro', 'annual', 'vip_voucher');
      setIsRedeeming(false);
      setVoucherMsg({
        text: isAr ? '🎉 تم تفعيل باقة المحترف (Pro) السنوية بنجاح! جاري التحديث...' : '🎉 Pro Creator annual plan activated! Refreshing...',
        success: true
      });
      setTimeout(() => {
        window.location.reload();
      }, 700);
    } else {
      setVoucherMsg({
        text: isAr ? 'كود الاشتراك غير صالح أو منتهي الصلاحية' : 'Invalid or expired access pass',
        success: false
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      
      {/* 1. Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#c29b40]/15 border border-[#c29b40]/40 text-[#9c7524] dark:text-amber-400 text-xs font-black shadow-xs">
          <Crown className="w-3.5 h-3.5" />
          <span>{isAr ? '💎 منصة احترافية مدفوعة بالكامل 100% | خوادم مخصصة بلا إعلانات' : '💎 100% Paid Exclusive Platform | Dedicated Servers, Zero Ads'}</span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 dark:text-stone-100 tracking-tight leading-tight">
          {isAr ? (
            <>
              استثمر في <span className="text-[#c29b40] bg-gradient-to-r from-[#c29b40] to-amber-600 bg-clip-text text-transparent">إتقان أوامرك</span> وصناعة محتواك السينمائي
            </>
          ) : (
            <>
              Invest in <span className="text-[#c29b40] bg-gradient-to-r from-[#c29b40] to-amber-600 bg-clip-text text-transparent">Prompt Mastery</span> & Production
            </>
          )}
        </h1>

        <p className="text-stone-600 dark:text-stone-400 text-sm sm:text-base leading-relaxed">
          {isAr 
            ? 'تم تحويل المنصة بالكامل إلى نموذج اشتراك مدفوع لتوفير أعلى جودة معالجة وسرعة استجابة مخصصة، وبدون أي إعلانات مزعجة وبدقة سينمائية غير محدودة.'
            : 'ArabPrompt is a fully paid, subscription-only platform architected for creators and filmmakers who demand dedicated GPU compute, zero latency, and 100% ad-free creative workflows.'}
        </p>

        {/* Currency Selector Bar */}
        <div className="pt-3 pb-1 max-w-2xl mx-auto">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white/95 dark:bg-[#161512]/95 border border-stone-200/90 dark:border-stone-800 shadow-sm backdrop-blur-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 text-start">
                <div className="w-8 h-8 rounded-xl bg-[#c29b40]/15 dark:bg-[#c29b40]/20 flex items-center justify-center text-[#9c7524] dark:text-amber-400 shrink-0">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-black text-stone-900 dark:text-stone-100">
                      {isAr ? 'عرض الأسعار بعملتك المحلية:' : 'Pricing in Local Currency:'}
                    </span>
                    {isAutoDetected && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                        <MapPin className="w-2.5 h-2.5" />
                        <span>{isAr ? `تلقائي (${currentCurrency.countryAr})` : `Auto (${currentCurrency.countryEn})`}</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    {isAr 
                      ? `سعر الصرف: 1$ = ${currentCurrency.rate} ${currentCurrency.symbolAr}` 
                      : `Rate: $1 = ${currentCurrency.rate} ${currentCurrency.code}`}
                  </p>
                </div>
              </div>

              {/* Change Currency Dropdown Button */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCurrencySelectorOpen(!isCurrencySelectorOpen)}
                  className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 text-xs font-black text-stone-800 dark:text-stone-100 flex items-center justify-between gap-2 transition-all cursor-pointer shadow-2xs"
                >
                  <span className="flex items-center gap-1.5">
                    <span className="text-base">{currentCurrency.flag}</span>
                    <span>{currentCurrency.code}</span>
                    <span className="text-stone-400 font-normal">({isAr ? currentCurrency.nameAr : currentCurrency.nameEn})</span>
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isCurrencySelectorOpen ? 'rotate-180 text-[#c29b40]' : 'text-stone-400'}`} />
                </button>

                {/* Dropdown Menu Modal */}
                {isCurrencySelectorOpen && (
                  <div 
                    className={`absolute z-50 mt-2 w-80 sm:w-96 p-3 rounded-2xl bg-white dark:bg-[#181715] border border-stone-200 dark:border-stone-800 shadow-2xl space-y-2.5 animate-in fade-in zoom-in-95 duration-150 ${isAr ? 'left-0 sm:right-auto' : 'right-0 sm:left-auto'}`}
                  >
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute top-1/2 -translate-y-1/2 start-3 text-stone-400" />
                      <input
                        type="text"
                        value={currencySearchQuery}
                        onChange={(e) => setCurrencySearchQuery(e.target.value)}
                        placeholder={isAr ? 'ابحث بالعملة أو اسم الدولة...' : 'Search currency or country...'}
                        className="w-full ps-9 pe-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-[#c29b40]"
                        autoFocus
                      />
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-1 pe-1 custom-scrollbar">
                      {filteredCurrencies.map((c) => {
                        const isSelected = c.code === currentCurrency.code;
                        return (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => handleSelectCurrency(c.code)}
                            className={`w-full p-2 rounded-xl flex items-center justify-between text-xs transition-colors cursor-pointer ${
                              isSelected 
                                ? 'bg-[#c29b40]/15 text-[#9c7524] dark:text-amber-300 font-black' 
                                : 'hover:bg-stone-100 dark:hover:bg-stone-800/80 text-stone-700 dark:text-stone-300'
                            }`}
                          >
                            <div className="flex items-center gap-2 text-start">
                              <span className="text-lg">{c.flag}</span>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold">{c.code}</span>
                                  <span className="text-stone-400 text-[11px]">({isAr ? c.symbolAr : c.symbolEn})</span>
                                </div>
                                <span className="text-[10px] text-stone-500 dark:text-stone-400 block">
                                  {isAr ? `${c.nameAr} — ${c.countryAr}` : `${c.nameEn} — ${c.countryEn}`}
                                </span>
                              </div>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-[#c29b40] shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    {!isAutoDetected && (
                      <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex justify-between items-center text-[11px]">
                        <span className="text-stone-500">{isAr ? 'استعادة الكشف التلقائي؟' : 'Restore auto-detect?'}</span>
                        <button
                          type="button"
                          onClick={handleResetToAutoDetect}
                          className="text-[#c29b40] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>{isAr ? 'كشف حسب البلد' : 'Detect by country'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Switch Pills */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-stone-100 dark:border-stone-800/80">
              <span className="text-[11px] font-bold text-stone-400 me-1">
                {isAr ? 'العملات الشائعة:' : 'Popular:'}
              </span>
              {POPULAR_CURRENCIES.map((code) => {
                const c = SUPPORTED_CURRENCIES[code];
                if (!c) return null;
                const isSelected = c.code === currentCurrency.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleSelectCurrency(c.code)}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#c29b40] text-stone-950 shadow-2xs font-black'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                    }`}
                  >
                    <span>{c.flag}</span>
                    <span>{c.code}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Billing cycle toggle */}
        <div className="pt-4 flex items-center justify-center">
          <div className="p-1 rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 inline-flex shadow-inner">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm'
                  : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              {isAr ? 'الدفع الشهري' : 'Monthly Billing'}
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                billingCycle === 'annual'
                  ? 'bg-[#c29b40] text-stone-950 font-black shadow-sm'
                  : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              <span>{isAr ? 'الدفع السنوي (أفضل قيمة)' : 'Annual Billing'}</span>
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                billingCycle === 'annual' 
                  ? 'bg-black/20 text-white' 
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              }`}>
                {isAr ? 'وفر حتى 35%' : 'Save up to 35%'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Three Exclusive Paid Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch max-w-6xl mx-auto">
        
        {/* Tier 1: Starter Lite (Cheapest Entry) */}
        <div className="bg-gradient-to-b from-emerald-500/5 via-white to-white dark:from-emerald-500/10 dark:via-[#161512] dark:to-[#161512] rounded-3xl border-2 border-emerald-500/70 p-6 flex flex-col justify-between shadow-lg relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-[10px] font-black px-3 py-0.5 rounded-full shadow-md flex items-center gap-1 whitespace-nowrap">
            <Sparkles className="w-3 h-3" />
            <span>{isAr ? 'الخيار الأوفر سعراً للبدء 💸' : 'Most Affordable Entry Plan'}</span>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
                <Sparkles className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <span>{isAr ? 'باقة الانطلاقة (Lite)' : 'Starter Lite'}</span>
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 min-h-[36px]">
                {isAr 
                  ? 'الخيار المثالي للمبتدئين وصناع المحتوى للانضمام للمنصة بأقل تكلفة شهرية ممكنة.' 
                  : 'The most affordable entry to join the paid platform with 100 daily prompts & exports.'}
              </p>
            </div>

            <div className="flex flex-col gap-0.5 pt-2 border-t border-emerald-200/50 dark:border-stone-800">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-3xl font-black text-stone-900 dark:text-stone-100">{formatPrice(litePrice).fullFormatted}</span>
                {!formatPrice(litePrice).isUsd && (
                  <span className="text-[11px] font-semibold text-stone-400">
                    ({formatPrice(litePrice).usdFormatted})
                  </span>
                )}
              </div>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                {isAr 
                  ? (billingCycle === 'annual' ? `/ شهرياً (تدفع ${formatPrice(42).fullFormatted} سنوياً)` : '/ شهرياً') 
                  : (billingCycle === 'annual' ? `/ mo (billed ${formatPrice(42).fullFormatted}/yr)` : '/ month')}
              </span>
            </div>

            <ul className="space-y-2.5 text-xs text-stone-700 dark:text-stone-300 pt-1">
              <li className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{isAr ? '100 توليد برومبت ذكي يومياً' : '100 smart prompts / day'}</span>
              </li>
              <li className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{isAr ? '10 مشاريع استوديو سيناريو شهرياً' : '10 Cinema Screenplay projects'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{isAr ? 'تصدير السيناريو PDF و Markdown' : 'Export screenplays to PDF'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{isAr ? 'مشاركة المشاهد برابط فوري فريد' : 'Share Sequence deep-links'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{isAr ? 'عكس الصور ومقاطع الفيديو' : 'Dual reverse image & video'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{isAr ? 'خالٍ تماماً من الإعلانات 100%' : '100% Ad-Free'}</span>
              </li>
            </ul>
          </div>

          <div className="pt-6">
            <button
              onClick={() => onOpenCheckout ? onOpenCheckout('lite', billingCycle) : (onOpenAuth ? onOpenAuth('login') : null)}
              className="w-full py-2.5 px-4 rounded-xl font-black text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>
                {isAr 
                  ? (billingCycle === 'annual' ? `اشترك بالباقة المخفضة (${formatPrice(litePrice).fullFormatted})` : `اشترك بـ ${formatPrice(5).fullFormatted} فقط`) 
                  : `Get Starter Lite (${formatPrice(litePrice).fullFormatted})`}
              </span>
              <Arrow className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tier 2: Pro Creator (Featured & Most Popular) */}
        <div className="bg-gradient-to-b from-amber-500/5 via-white to-white dark:from-[#c29b40]/10 dark:via-[#161512] dark:to-[#161512] rounded-3xl border-2 border-[#c29b40] p-6 sm:p-7 flex flex-col justify-between shadow-2xl relative md:-translate-y-2 scale-[1.02] z-10">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#916a24] via-[#c29b40] to-amber-500 text-white text-[11px] font-black px-4 py-1 rounded-full shadow-lg flex items-center gap-1.5 whitespace-nowrap">
            <Crown className="w-3.5 h-3.5" />
            <span>{isAr ? 'الخيار الأكثر طلباً وشعبية ⭐' : 'Most Popular Plan'}</span>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <div className="w-11 h-11 rounded-2xl bg-[#c29b40]/20 flex items-center justify-center text-[#9c7524] dark:text-amber-400">
                <Crown className="w-6 h-6 text-[#c29b40]" />
              </div>
              <h3 className="text-xl font-black text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <span>{isAr ? 'باقة المحترف (Pro)' : 'Pro Creator'}</span>
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 min-h-[36px]">
                {isAr 
                  ? 'للصناع والمخرجين الذين يحتاجون جودة سينمائية فائقة واستخداماً غير محدود بدون أي قيود.' 
                  : 'For filmmakers and prompt designers demanding unlimited power & face anchors.'}
              </p>
            </div>

            <div className="flex flex-col gap-0.5 pt-2 border-t border-amber-200/50 dark:border-stone-800">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-4xl font-black text-stone-900 dark:text-stone-100">{formatPrice(proPrice).fullFormatted}</span>
                {!formatPrice(proPrice).isUsd && (
                  <span className="text-xs font-semibold text-stone-400">
                    ({formatPrice(proPrice).usdFormatted})
                  </span>
                )}
              </div>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                {isAr 
                  ? (billingCycle === 'annual' ? `/ شهرياً (تدفع ${formatPrice(84).fullFormatted} سنوياً)` : '/ شهرياً') 
                  : (billingCycle === 'annual' ? `/ mo (billed ${formatPrice(84).fullFormatted}/yr)` : '/ month')}
              </span>
            </div>

            <ul className="space-y-2.5 text-xs text-stone-700 dark:text-stone-300 pt-1">
              <li className="flex items-center gap-2 font-bold text-stone-900 dark:text-stone-100">
                <CheckCircle2 className="w-4 h-4 text-[#c29b40] shrink-0" />
                <span>{isAr ? 'توليد وهندسة غير محدودة للأوامر (∞)' : 'Unlimited prompt engineering (∞)'}</span>
              </li>
              <li className="flex items-center gap-2 font-bold text-stone-900 dark:text-stone-100">
                <CheckCircle2 className="w-4 h-4 text-[#c29b40] shrink-0" />
                <span>{isAr ? 'مشاريع سيناريو أفلام غير محدودة' : 'Unlimited Cinema projects'}</span>
              </li>
              <li className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-[#c29b40] shrink-0" />
                <span>{isAr ? 'تثبيت ملامح الوجه (Face Anchor)' : 'Character face anchor system'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#c29b40] shrink-0" />
                <span>{isAr ? 'مشاركة التسلسلات برابط فوري' : 'Share Sequence deep-links'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#c29b40] shrink-0" />
                <span>{isAr ? 'مزامنة وتشفير سحابي دائم' : 'Encrypted cloud backup'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#c29b40] shrink-0" />
                <span>{isAr ? 'أولوية معالجة فورية فائقة' : 'Priority GPU compute stream'}</span>
              </li>
            </ul>
          </div>

          <div className="pt-6">
            <button
              onClick={() => onOpenCheckout ? onOpenCheckout('pro', billingCycle) : (onOpenAuth ? onOpenAuth('login') : null)}
              className="w-full py-3 px-4 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-[#916a24] via-[#c29b40] to-amber-500 hover:opacity-95 text-white shadow-lg shadow-[#c29b40]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>
                {isAr 
                  ? `اشترك في باقة Pro (${formatPrice(proPrice).fullFormatted})` 
                  : `Upgrade to Pro (${formatPrice(proPrice).fullFormatted})`}
              </span>
              <Arrow className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tier 3: Studio & Enterprise */}
        <div className="bg-white dark:bg-[#151412] rounded-3xl border border-stone-200 dark:border-stone-800 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative">
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center text-purple-700 dark:text-purple-300">
                <Crown className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-black text-stone-900 dark:text-stone-100">
                {isAr ? 'استوديو وشركات' : 'Studio & Agency'}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 min-h-[36px]">
                {isAr 
                  ? 'للفرق والوكالات التي تتطلب مفاتيح API مخصصة وربطاً برمجياً ودعماً هندسياً خاصاً.' 
                  : 'For creative teams needing dedicated REST API keys, multi-seat & scale.'}
              </p>
            </div>

            <div className="flex flex-col gap-0.5 pt-2 border-t border-stone-100 dark:border-stone-800/80">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-3xl font-black text-stone-900 dark:text-stone-100">{formatPrice(studioPrice).fullFormatted}</span>
                {!formatPrice(studioPrice).isUsd && (
                  <span className="text-[11px] font-semibold text-stone-400">
                    ({formatPrice(studioPrice).usdFormatted})
                  </span>
                )}
              </div>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                {isAr 
                  ? (billingCycle === 'annual' ? `/ شهرياً (تدفع ${formatPrice(288).fullFormatted} سنوياً)` : '/ شهرياً') 
                  : (billingCycle === 'annual' ? `/ mo (billed ${formatPrice(288).fullFormatted}/yr)` : '/ month')}
              </span>
            </div>

            <ul className="space-y-2.5 text-xs text-stone-700 dark:text-stone-300 pt-1">
              <li className="flex items-center gap-2 font-semibold">
                <Check className="w-4 h-4 text-purple-500 shrink-0" />
                <span>{isAr ? 'جميع ميزات باقة المحترف (Pro)' : 'All Pro Creator features'}</span>
              </li>
              <li className="flex items-center gap-2 font-semibold text-purple-700 dark:text-purple-400">
                <Check className="w-4 h-4 text-purple-500 shrink-0" />
                <span>{isAr ? 'مفاتيح API مخصصة والربط البرمجي' : 'REST API keys & Webhooks'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-500 shrink-0" />
                <span>{isAr ? 'تخصيص هوية العلامة التجارية' : 'Custom brand voice presets'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-500 shrink-0" />
                <span>{isAr ? 'مساحات عمل جماعية ومشاركة' : 'Multi-seat team workspace'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-500 shrink-0" />
                <span>{isAr ? 'دعم فني استشاري مباشر 24/7' : '24/7 dedicated concierge'}</span>
              </li>
            </ul>
          </div>

          <div className="pt-6">
            <button
              onClick={() => onOpenCheckout ? onOpenCheckout('studio', billingCycle) : (onOpenAuth ? onOpenAuth('login') : null)}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-950 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <span>{isAr ? 'طلب باقة الاستوديو' : 'Get Studio & Agency'}</span>
              <Arrow className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* 3. VIP Voucher & Instant Test Pass Box */}
      <div className="max-w-2xl mx-auto p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#c29b40]/10 via-amber-500/10 to-[#c29b40]/10 border border-[#c29b40]/30 shadow-md">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-start">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-black text-[#916a24] dark:text-amber-300">
              <KeyRound className="w-4 h-4" />
              <span>{isAr ? 'كوبونات الشركاء وتفعيل الاشتراكات المؤسسية' : 'Corporate Passes & Partner Vouchers'}</span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400">
              {isAr ? 'أدخل كود الاشتراك VIP لتفعيل باقة المحترف فوراً (مثال: VIP2026 أو PROMPTPRO)' : 'Enter VIP partner code for instant Pro activation (e.g. VIP2026 or PROMPTPRO)'}
            </p>
          </div>

          <form onSubmit={handleRedeemVoucher} className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
              placeholder="VIP2026"
              className="px-3 py-2 rounded-xl border border-[#c29b40]/40 bg-white dark:bg-stone-900 text-xs font-mono text-stone-900 dark:text-stone-100 uppercase focus:outline-none focus:border-[#c29b40] w-32 text-center"
            />
            <button
              type="submit"
              disabled={!voucherCode.trim() || isRedeeming}
              className="px-4 py-2 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-950 text-xs font-black hover:opacity-90 transition-all cursor-pointer disabled:opacity-40"
            >
              {isRedeeming ? '...' : (isAr ? 'تفعيل' : 'Redeem')}
            </button>
          </form>
        </div>

        {voucherMsg && (
          <p className={`text-xs font-bold text-center sm:text-start mt-2.5 ${voucherMsg.success ? 'text-emerald-600' : 'text-rose-500'}`}>
            {voucherMsg.text}
          </p>
        )}
      </div>

      {/* 4. Why 100% Paid? Quality & Uptime Commitments */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-10 border border-[#c29b40]/30 shadow-xl space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c29b40]/20 text-amber-300 text-xs font-black">
            <Shield className="w-3.5 h-3.5" />
            <span>{isAr ? 'لماذا تحول الموقع إلى مدفوع بالكامل؟' : 'Why ArabPrompt is 100% Paid'}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black">
            {isAr ? 'التزام غير مشروط بأعلى معايير السرعة والخصوصية' : 'Uncompromising Speed, Privacy & Precision'}
          </h3>
          <p className="text-xs sm:text-sm text-stone-300">
            {isAr 
              ? 'الخدمات المجانية تعاني عادة من الازدحام والإعلانات المزعجة واقتطاع الميزات. حولنا عرب برومبت إلى منصة مدفوعة بالكامل لتقديم الآتي:' 
              : 'Free tiers compromise on speed, ads, and model quotas. ArabPrompt guarantees dedicated high-performance resources:'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Zap className="w-4 h-4" />
            </div>
            <h5 className="font-black text-sm text-amber-300">
              {isAr ? 'خوادم معالجة محجوزة' : 'Dedicated GPU Streams'}
            </h5>
            <p className="text-stone-300 leading-relaxed text-[11px]">
              {isAr ? 'جميع طلبات الأوامر تحال إلى بيئات حوسبة مخصصة لاستجابة فورية خلال أجزاء من الثانية دون طوابير انتظار.' : 'Direct pipeline to Gemini with zero wait times and guaranteed SLA.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h5 className="font-black text-sm text-amber-300">
              {isAr ? '100% بدون أي إعلانات' : '100% Ad-Free'}
            </h5>
            <p className="text-stone-300 leading-relaxed text-[11px]">
              {isAr ? 'تجربة نظيفة ومهنية خالية تماماً من البانرات والإعلانات المنبثقة، تركز بالكامل على إبداعك ومشاريعك.' : 'Zero banner ads, zero popups, zero distractions in your creative suite.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Shield className="w-4 h-4" />
            </div>
            <h5 className="font-black text-sm text-amber-300">
              {isAr ? 'سرية وخصوصية كاملة' : 'Confidentiality & Cloud'}
            </h5>
            <p className="text-stone-300 leading-relaxed text-[11px]">
              {isAr ? 'تشفير شامل لأفكارك ومسوداتك السينمائية مع نسخ احتياطي دائم في حسابك السحابي الخاص.' : 'Your screenplays and ideas are encrypted with instant cloud backup.'}
            </p>
          </div>
        </div>
      </div>

      {/* 5. Detailed Comparison Table */}
      <div className="bg-white dark:bg-[#151412] rounded-3xl border border-stone-200 dark:border-stone-800 p-6 sm:p-10 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h3 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100">
            {isAr ? 'مقارنة شاملة لكافة الأدوات والميزات' : 'Comprehensive Feature Comparison'}
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
            {isAr ? 'المنصة تتطلب اشتراكاً نشطاً لكافة الميزات المتقدمة' : 'All advanced AI and cinema tools require an active paid membership'}
          </p>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-xs text-start border-collapse">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-400 font-semibold">
                <th className="py-3 px-4 text-start font-bold">{isAr ? 'الميزة / الأداة' : 'Feature / Tool'}</th>
                <th className="py-3 px-4 text-center text-rose-500 font-bold">{isAr ? 'غير مشترك' : 'Unsubscribed'}</th>
                <th className="py-3 px-4 text-center text-emerald-600 font-bold">{isAr ? 'الانطلاقة Lite' : 'Lite'} ({formatPrice(litePrice).fullFormatted})</th>
                <th className="py-3 px-4 text-center text-[#c29b40] font-black">{isAr ? 'المحترف Pro' : 'Pro'} ({formatPrice(proPrice).fullFormatted})</th>
                <th className="py-3 px-4 text-center">{isAr ? 'الاستوديو' : 'Studio'} ({formatPrice(studioPrice).fullFormatted})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60 text-stone-700 dark:text-stone-300">
              
              {/* Category: Engineering */}
              <tr className="bg-stone-50 dark:bg-stone-900/40 font-black text-stone-900 dark:text-stone-100">
                <td colSpan={5} className="py-2.5 px-4 text-start">
                  {isAr ? '1. هندسة وتوليد الأوامر الذكية' : '1. Prompt Engineering & Synthesis'}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4">{isAr ? 'عدد الأوامر المتاحة' : 'Prompt generation limit'}</td>
                <td className="py-3 px-4 text-center font-bold text-rose-500">{isAr ? '0 (مغلق)' : '0 (Locked)'}</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400">{isAr ? '100 يومياً' : '100/day'}</td>
                <td className="py-3 px-4 text-center font-black text-emerald-600 dark:text-emerald-400">{isAr ? 'غير محدود (∞)' : 'Unlimited (∞)'}</td>
                <td className="py-3 px-4 text-center font-black text-emerald-600 dark:text-emerald-400">{isAr ? 'غير محدود (∞)' : 'Unlimited (∞)'}</td>
              </tr>
              <tr>
                <td className="py-3 px-4">{isAr ? 'توليد ثنائي (مباشر وهندسي)' : 'Dual architecture output'}</td>
                <td className="py-3 px-4 text-center"><X className="w-4 h-4 text-stone-300 dark:text-stone-700 mx-auto" /></td>
                <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-emerald-500 mx-auto" /></td>
                <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-emerald-500 mx-auto" /></td>
                <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-emerald-500 mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-3 px-4">{isAr ? 'مكتبة الصور الفنية (36 برومبت جاهز)' : 'Visual Art Library (36 prompts)'}</td>
                <td className="py-3 px-4 text-center">{isAr ? 'معاينة فقط' : 'Preview only'}</td>
                <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-emerald-500 mx-auto" /></td>
                <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-emerald-500 mx-auto" /></td>
                <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-emerald-500 mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-3 px-4">{isAr ? 'هندسة عكسية للصور والفيديو' : 'Reverse Engineering (Image & Video)'}</td>
                <td className="py-3 px-4 text-center"><X className="w-4 h-4 text-stone-300 dark:text-stone-700 mx-auto" /></td>
                <td className="py-3 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400">{isAr ? 'صورة وفيديو' : 'Image & Video'}</td>
                <td className="py-3 px-4 text-center font-bold">{isAr ? 'صور مزدوجة + فيديو' : 'Dual + Video'}</td>
                <td className="py-3 px-4 text-center font-bold">{isAr ? 'أولوية دفعية فائقة' : 'Batch High-priority'}</td>
              </tr>

              {/* Category: Cinema & Story */}
              <tr className="bg-stone-50 dark:bg-stone-900/40 font-black text-stone-900 dark:text-stone-100">
                <td colSpan={5} className="py-2.5 px-4 text-start">
                  {isAr ? '2. استوديو الأفلام وسيناريو 10 ثوانٍ' : '2. Cinema Movie Studio (10s Screenplay)'}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4">{isAr ? 'مشاريع السيناريو المحفوظة' : 'Saved Screenplay Projects'}</td>
                <td className="py-3 px-4 text-center text-rose-500 font-bold">{isAr ? '0 (مغلق)' : '0 (Locked)'}</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400">{isAr ? '10 مشاريع' : '10 projects'}</td>
                <td className="py-3 px-4 text-center font-black text-emerald-600 dark:text-emerald-400">{isAr ? 'غير محدود' : 'Unlimited'}</td>
                <td className="py-3 px-4 text-center font-black text-emerald-600 dark:text-emerald-400">{isAr ? 'غير محدود' : 'Unlimited'}</td>
              </tr>
              <tr>
                <td className="py-3 px-4">{isAr ? 'تثبيت ملامح الوجه (Face Anchor)' : 'Character Face Anchor System'}</td>
                <td className="py-3 px-4 text-center"><X className="w-4 h-4 text-stone-300 dark:text-stone-700 mx-auto" /></td>
                <td className="py-3 px-4 text-center"><X className="w-4 h-4 text-stone-300 dark:text-stone-700 mx-auto" /></td>
                <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-emerald-500 mx-auto" /></td>
                <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-emerald-500 mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-3 px-4">{isAr ? 'مشاركة التسلسل برابط فوري فريد' : 'Share Sequence Unique Link'}</td>
                <td className="py-3 px-4 text-center"><X className="w-4 h-4 text-stone-300 dark:text-stone-700 mx-auto" /></td>
                <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-emerald-500 mx-auto" /></td>
                <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-emerald-500 mx-auto" /></td>
                <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-emerald-500 mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-3 px-4">{isAr ? 'تصدير PDF و Final Draft و Markdown' : 'Export Screenplay Formats'}</td>
                <td className="py-3 px-4 text-center"><X className="w-4 h-4 text-stone-300 dark:text-stone-700 mx-auto" /></td>
                <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-emerald-500 mx-auto" /></td>
                <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-emerald-500 mx-auto" /></td>
                <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-emerald-500 mx-auto" /></td>
              </tr>

              {/* Category: Storage & API */}
              <tr className="bg-stone-50 dark:bg-stone-900/40 font-black text-stone-900 dark:text-stone-100">
                <td colSpan={5} className="py-2.5 px-4 text-start">
                  {isAr ? '3. التخزين والمزامنة والمفاتيح البرمجية' : '3. Cloud Sync, Storage & API'}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4">{isAr ? 'النسخ السحابي المشفر' : 'Encrypted Cloud Backup'}</td>
                <td className="py-3 px-4 text-center"><X className="w-4 h-4 text-stone-300 dark:text-stone-700 mx-auto" /></td>
                <td className="py-3 px-4 text-center font-bold text-emerald-600">{isAr ? '10 مشاريع' : '10 projects'}</td>
                <td className="py-3 px-4 text-center font-bold text-[#c29b40]">{isAr ? 'تلقائي فوري' : 'Instant Sync'}</td>
                <td className="py-3 px-4 text-center font-bold text-purple-600">{isAr ? 'سحابي متعدد' : 'Multi-Cloud'}</td>
              </tr>
              <tr>
                <td className="py-3 px-4">{isAr ? 'مفاتيح API واستدعاءات برمجية' : 'Developer REST API Access'}</td>
                <td className="py-3 px-4 text-center"><X className="w-4 h-4 text-stone-300 dark:text-stone-700 mx-auto" /></td>
                <td className="py-3 px-4 text-center"><X className="w-4 h-4 text-stone-300 dark:text-stone-700 mx-auto" /></td>
                <td className="py-3 px-4 text-center"><X className="w-4 h-4 text-stone-300 dark:text-stone-700 mx-auto" /></td>
                <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-emerald-500 mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-3 px-4">{isAr ? 'الدعم الفني وسرعة الاستجابة' : 'Support SLA'}</td>
                <td className="py-3 px-4 text-center text-stone-400">—</td>
                <td className="py-3 px-4 text-center">{isAr ? 'بريد قياسي' : 'Standard'}</td>
                <td className="py-3 px-4 text-center font-bold text-[#c29b40]">{isAr ? 'أولوية بريدية سريعة' : 'Priority Email'}</td>
                <td className="py-3 px-4 text-center font-bold text-purple-600">{isAr ? 'مباشر 24/7' : '24/7 VIP Concierge'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. FAQ Section */}
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500">
            <HelpCircle className="w-4 h-4 text-[#c29b40]" />
            <span>{isAr ? 'كل ما تود معرفته عن الاشتراك والمدفوعات' : 'Billing & Payment Details'}</span>
          </div>
          <h3 className="text-2xl font-black text-stone-900 dark:text-stone-100">
            {isAr ? 'الأسئلة الشائعة حول المنصة والاشتراكات' : 'Frequently Asked Questions'}
          </h3>
        </div>

        <div className="space-y-3">
          {[
            {
              qAr: 'لماذا تم تحويل الموقع إلى مدفوع الأجر بالكامل؟',
              qEn: 'Why did ArabPrompt switch to a 100% paid platform?',
              aAr: 'تم اتخاذ هذا القرار لضمان تزويد المشتركين بخوادم معالجة مخصصة وفائقة السرعة مرتبطة مباشرة بنماذج Gemini 2026 المتقدمة، وبدون أي اقتطاع في السرعة أو قيود مجانية، بالإضافة لإزالة كافة الإعلانات وتوفير أمان وتشفير كامل لمشاريعك السينمائية.',
              aEn: 'To dedicate maximum GPU throughput and zero-latency Gemini model access exclusively to creators, while eliminating all advertisements and providing full project confidentiality.'
            },
            {
              qAr: 'ما هي طرق ووسائل الدفع والعملات المقبولة؟',
              qEn: 'What payment methods and currencies do you accept?',
              aAr: 'نقبل بينانس باي (Binance Pay) والعملات الرقمية المشفرة (خاصة USDT بدون أي رسوم غاز إضافية)، بالإضافة لبطاقات Visa و MasterCard وبطاقات مدى Mada السعودية، ومدفوعات Apple Pay و Google Pay و PayPal. كما تتوفر الأسعار بعملتك المحلية تلقائياً.',
              aEn: 'We accept Binance Pay & Crypto (zero-fee USDT / BNB / BTC), Visa, MasterCard, Saudi Mada cards, Apple Pay, Google Pay, and PayPal with transparent automatic local currency conversions.'
            },
            {
              qAr: 'هل يمكنني إلغاء اشتراكي في أي وقت؟',
              qEn: 'Can I cancel my subscription at any time?',
              aAr: 'نعم بكل تأكيد وبحرية تامة. يمكنك إلغاء التجديد التلقائي في أي وقت بنقرة واحدة من لوحة إدارة حسابك، وستظل جميع ميزات باقتك نشطة حتى نهاية الفترة المدفوعة.',
              aEn: 'Yes, anytime with one click from your account. You retain full access to all Pro features until the end of your billing cycle.'
            },
            {
              qAr: 'ما هي باقة المحترف (Pro Creator) ولماذا هي الأكثر طلباً؟',
              qEn: 'What makes Pro Creator the most popular plan?',
              aAr: 'تمنحك باقة المحترف وصولاً غير محدود (∞) لتوليد وهندسة الأوامر الرقمية، مع مشاريع استوديو سينمائي غير محدودة، وميزة تثبيت ملامح الوجه Face Anchor، وتصدير السيناريوهات PDF، وأولوية المعالجة بأقل من 7$ شهرياً في الخطة السنوية.',
              aEn: 'Pro Creator unlocks unlimited prompt synthesis, unlimited cinema projects, Face Anchor character consistency, PDF screenplay exports, and dedicated priority queues.'
            },
            {
              qAr: 'كيف يمكنني الدفع عبر Binance Pay أو العملات الرقمية؟',
              qEn: 'How can I pay via Binance Pay or Cryptocurrency?',
              aAr: 'في نافذة الدفع، اختر "Binance Pay"، وسيظهر لك معرّف الدفع (Binance Pay ID) ورمز QR. يمكنك مسح الرمز فوراً عبر تطبيق Binance وتأكيد الدفع (USDT / BNB)، وسيتم تفعيل اشتراكك تلقائياً وبشكل فوري.',
              aEn: 'Simply choose Binance Pay in the checkout dialog, scan the QR code using your Binance app or transfer to the Pay ID, and your subscription activates instantly.'
            }
          ].map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx}
                className="bg-white dark:bg-[#151412] rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden transition-all shadow-3xs"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-start font-bold text-xs sm:text-sm text-stone-800 dark:text-stone-200 hover:text-[#c29b40] dark:hover:text-amber-400 transition-colors cursor-pointer"
                >
                  <span>{isAr ? faq.qAr : faq.qEn}</span>
                  <div className="w-6 h-6 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center shrink-0">
                    {isOpen ? (
                      <ChevronUp className="w-3.5 h-3.5 text-[#c29b40]" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
                    )}
                  </div>
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 text-xs text-stone-600 dark:text-stone-400 leading-relaxed border-t border-stone-100 dark:border-stone-800/80 pt-3">
                    {isAr ? faq.aAr : faq.aEn}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 7. Bottom CTA */}
      <div className="rounded-3xl bg-gradient-to-r from-stone-900 via-[#1c1a16] to-stone-900 text-white p-8 sm:p-12 text-center space-y-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#c29b40]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative space-y-3 max-w-xl mx-auto">
          <h3 className="text-2xl sm:text-3xl font-black">
            {isAr ? 'جاهز لرفع جودة مخرجاتك السينمائية؟' : 'Ready to Elevate Your Cinematic Outputs?'}
          </h3>
          <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
            {isAr
              ? 'اشترك الآن في المنصة المدفوعة وتمتع بأعلى معايير الدقة والاتساق البصري وسرعة المعالجة.'
              : 'Join professional creators enjoying reserved GPU power, character consistency, and zero ad interruptions.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 relative">
          <button
            onClick={() => onOpenCheckout ? onOpenCheckout('pro', billingCycle) : (onOpenAuth ? onOpenAuth('login') : null)}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-xs bg-[#c29b40] hover:bg-[#b08b34] text-stone-950 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer font-black"
          >
            <span>{isAr ? 'اشترك الآن في باقة Pro' : 'Subscribe to Pro Creator'}</span>
            <Arrow className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}
