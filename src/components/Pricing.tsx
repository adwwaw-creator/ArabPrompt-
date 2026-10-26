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
  Globe, Search, MapPin, RotateCcw
} from 'lucide-react';
import { AppLanguage, ActiveTab } from '../types';
import { SubscriptionPlan } from '../utils/subscriptionService';
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
  const proPrice = billingCycle === 'annual' ? 7 : 9;
  const studioPrice = billingCycle === 'annual' ? 24 : 29;

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      
      {/* 1. Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#c29b40]/10 border border-[#c29b40]/30 text-[#9c7524] dark:text-amber-400 text-xs font-black">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isAr ? 'خطط مرنة وأسعار شفافة بدون أي رسوم خفية' : 'Flexible Plans & Transparent Pricing'}</span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 dark:text-stone-100 tracking-tight leading-tight">
          {isAr ? (
            <>
              استثمر في <span className="text-[#c29b40] bg-gradient-to-r from-[#c29b40] to-amber-600 bg-clip-text text-transparent">إتقان أوامرك</span> وصناعة محتواك
            </>
          ) : (
            <>
              Invest in <span className="text-[#c29b40] bg-gradient-to-r from-[#c29b40] to-amber-600 bg-clip-text text-transparent">Prompt Mastery</span> & Production
            </>
          )}
        </h1>

        <p className="text-stone-600 dark:text-stone-400 text-sm sm:text-base leading-relaxed">
          {isAr 
            ? 'سواء كنت مبتدئاً تستكشف عالم الذكاء الاصطناعي، أو صانع أفلام محترفاً، نوفر لك الأدوات الدقيقة لتحويل أفكارك إلى نتائج سينمائية فائقة الدقة.'
            : 'Whether you are just getting started or a professional filmmaker orchestrating multi-scene cinema workflows, we have the precise toolset for your creative ambition.'}
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
                        <span>{isAr ? `تلقائي حسب بلدك (${currentCurrency.countryAr})` : `Auto (${currentCurrency.countryEn})`}</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    {isAr 
                      ? `سعر الصرف الحالي: 1$ = ${currentCurrency.rate} ${currentCurrency.symbolAr}` 
                      : `Current rate: $1 = ${currentCurrency.rate} ${currentCurrency.code}`}
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
                    {/* Search filter */}
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

                    {/* Currencies list */}
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

                    {/* Reset to auto detect */}
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

            {/* Quick Switch Pills for Top Arab & Global Currencies */}
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
                    key={code}
                    type="button"
                    onClick={() => handleSelectCurrency(code)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all flex items-center gap-1 cursor-pointer ${
                      isSelected
                        ? 'bg-[#c29b40] text-white shadow-xs'
                        : 'bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700'
                    }`}
                  >
                    <span>{c.flag}</span>
                    <span>{isAr ? c.symbolAr : c.code}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Billing Toggle */}
        <div className="pt-2 flex items-center justify-center">
          <div className="bg-stone-200/80 dark:bg-stone-900 p-1.5 rounded-2xl flex items-center gap-1 border border-stone-300/80 dark:border-stone-800 shadow-inner">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              {isAr ? 'الدفع الشهري' : 'Monthly Billing'}
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                billingCycle === 'annual'
                  ? 'bg-[#c29b40] text-white shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <span>{isAr ? 'الدفع السنوي' : 'Annual Billing'}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                billingCycle === 'annual' 
                  ? 'bg-black/20 text-white' 
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              }`}>
                {isAr ? 'وفر 25%' : 'Save 25%'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Pricing Tiers Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
        
        {/* Tier 1: Free Starter */}
        <div className="bg-white dark:bg-[#151412] rounded-3xl border border-stone-200 dark:border-stone-800 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative">
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-700 dark:text-stone-300">
                <Zap className="w-5 h-5 text-stone-600 dark:text-stone-400" />
              </div>
              <h3 className="text-lg font-black text-stone-900 dark:text-stone-100">
                {isAr ? 'الباقة المجانية' : 'Starter Free'}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 min-h-[36px]">
                {isAr 
                  ? 'مثالية للتجربة والتعلم واستكشاف إمكانيات صياغة الأوامر العربية.' 
                  : 'Perfect for learning, personal experiments, and basic prompt engineering.'}
              </p>
            </div>

            <div className="flex items-baseline gap-1.5 pt-2 border-t border-stone-100 dark:border-stone-800/80">
              <span className="text-3xl font-black text-stone-900 dark:text-stone-100">{formatPrice(0).fullFormatted}</span>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                {isAr ? '/ مدى الحياة' : '/ lifetime free'}
              </span>
            </div>

            <ul className="space-y-2.5 text-xs text-stone-700 dark:text-stone-300 pt-1">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{isAr ? '25 توليد برومبت ذكي يومياً' : '25 smart prompts / day'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{isAr ? 'مكتبة الصور الفنية (36 برومبت)' : 'Art Library (36 prompts)'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{isAr ? 'استوديو السيناريو (مشروعان شهرياً)' : 'Cinema Studio (2 projects)'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{isAr ? 'هندسة عكسية لصورة فردية' : 'Single image reverse engineering'}</span>
              </li>
              <li className="flex items-center gap-2 text-stone-400">
                <X className="w-4 h-4 text-stone-300 dark:text-stone-700 shrink-0" />
                <span className="line-through">{isAr ? 'تصدير السيناريو PDF' : 'PDF screenplay export'}</span>
              </li>
              <li className="flex items-center gap-2 text-stone-400">
                <X className="w-4 h-4 text-stone-300 dark:text-stone-700 shrink-0" />
                <span className="line-through">{isAr ? 'تثبيت ملامح الوجه Face Anchor' : 'Face anchor consistency'}</span>
              </li>
            </ul>
          </div>

          <div className="pt-6">
            <button
              onClick={() => onNavigateTab ? onNavigateTab('builder') : null}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-100 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isAr ? 'ابدأ الاستخدام مجاناً' : 'Get Started Free'}</span>
              <Arrow className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tier 2: Starter Lite (The Cheapest Paid Plan) */}
        <div className="bg-gradient-to-b from-emerald-500/5 via-white to-white dark:from-emerald-500/10 dark:via-[#161512] dark:to-[#161512] rounded-3xl border-2 border-emerald-500/80 p-6 flex flex-col justify-between shadow-lg relative">
          {/* Best Budget Badge */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-[10px] font-black px-3 py-0.5 rounded-full shadow-md flex items-center gap-1 whitespace-nowrap">
            <Sparkles className="w-3 h-3" />
            <span>{isAr ? 'الأرخص والأوفر سعراً للبدء 💸' : 'Cheapest & Best Starter Plan'}</span>
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
                  ? 'أرخص باقة ممكنة للمبدعين لتجاوز الحدود وتصدير السيناريو بأقل تكلفة.' 
                  : 'The most affordable entry plan to unlock 100 daily prompts & exports.'}
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
                <span>{isAr ? '100 توليد برومبت ذكي يومياً (4x)' : '100 smart prompts / day (4x)'}</span>
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
                <span>{isAr ? 'حفظ سحابي ومزامنة المشاريع' : 'Cloud project backup sync'}</span>
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

        {/* Tier 3: Pro Creator (Featured) */}
        <div className="bg-gradient-to-b from-amber-500/5 via-white to-white dark:from-[#c29b40]/10 dark:via-[#161512] dark:to-[#161512] rounded-3xl border-2 border-[#c29b40] p-6 flex flex-col justify-between shadow-xl relative scale-[1.02]">
          {/* Popular Badge */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#916a24] via-[#c29b40] to-amber-500 text-white text-[10px] font-black px-3 py-0.5 rounded-full shadow-md flex items-center gap-1 whitespace-nowrap">
            <Crown className="w-3 h-3" />
            <span>{isAr ? 'الخيار الأكثر طلباً وشعبية ⭐' : 'Most Popular Plan'}</span>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#c29b40]/20 flex items-center justify-center text-[#9c7524] dark:text-amber-400">
                <Crown className="w-5 h-5 text-[#c29b40]" />
              </div>
              <h3 className="text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <span>{isAr ? 'باقة المحترف (Pro)' : 'Pro Creator'}</span>
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 min-h-[36px]">
                {isAr 
                  ? 'للصناع والمخرجين الذين يحتاجون جودة سينمائية واستخداماً غير محدود.' 
                  : 'For filmmakers demanding unlimited power & face anchors.'}
              </p>
            </div>

            <div className="flex flex-col gap-0.5 pt-2 border-t border-amber-200/50 dark:border-stone-800">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-3xl font-black text-stone-900 dark:text-stone-100">{formatPrice(proPrice).fullFormatted}</span>
                {!formatPrice(proPrice).isUsd && (
                  <span className="text-[11px] font-semibold text-stone-400">
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
                <span>{isAr ? 'توليد وهندسة غير محدودة للأوامر' : 'Unlimited prompt engineering'}</span>
              </li>
              <li className="flex items-center gap-2 font-bold text-stone-900 dark:text-stone-100">
                <CheckCircle2 className="w-4 h-4 text-[#c29b40] shrink-0" />
                <span>{isAr ? 'مشاريع سيناريو أفلام غير محدودة' : 'Unlimited Cinema projects'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#c29b40] shrink-0" />
                <span>{isAr ? 'تثبيت ملامح الوجه (Face Anchor)' : 'Character face anchor system'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#c29b40] shrink-0" />
                <span>{isAr ? 'مشاركة التسلسلات برابط فوري' : 'Share Sequence deep-links'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#c29b40] shrink-0" />
                <span>{isAr ? 'مزامنة سحابية غير محدودة' : 'Unlimited cloud backup'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#c29b40] shrink-0" />
                <span>{isAr ? 'تصدير PDF و Markdown و JSON' : 'Export PDF, Markdown & JSON'}</span>
              </li>
            </ul>
          </div>

          <div className="pt-6">
            <button
              onClick={() => onOpenCheckout ? onOpenCheckout('pro', billingCycle) : (onOpenAuth ? onOpenAuth('login') : null)}
              className="w-full py-2.5 px-4 rounded-xl font-black text-xs bg-gradient-to-r from-[#916a24] via-[#c29b40] to-amber-500 hover:opacity-95 text-white shadow-md shadow-[#c29b40]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>
                {isAr 
                  ? `ترقية إلى باقة Pro (${formatPrice(proPrice).fullFormatted})` 
                  : `Upgrade to Pro (${formatPrice(proPrice).fullFormatted})`}
              </span>
              <Arrow className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tier 4: Studio & Enterprise */}
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
                  ? 'للفرق والوكالات التي تتطلب مفاتيح API خاصة وأداءً فائقاً ودعماً خاصاً.' 
                  : 'For creative teams needing dedicated REST API keys & scale.'}
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
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <span>
                {isAr 
                  ? `تفعيل باقة الاستوديو (${formatPrice(studioPrice).fullFormatted})` 
                  : `Activate Studio (${formatPrice(studioPrice).fullFormatted})`}
              </span>
              <Arrow className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Supported Payment Gateways & Binance Badge */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 py-3 px-5 rounded-2xl bg-white/70 dark:bg-stone-900/40 border border-stone-200/80 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-400">
        <span className="font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-emerald-500" />
          <span>{isAr ? 'دفع آمن ومشفر 100%:' : '100% Secure Checkout:'}</span>
        </span>
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
          <span className="px-2.5 py-1 rounded-lg bg-[#F0B90B]/15 text-[#9c7500] dark:text-[#F0B90B] border border-[#F0B90B]/30 flex items-center gap-1.5 shadow-2xs">
            <span className="w-3.5 h-3.5 rounded-full bg-[#F0B90B] text-black font-black text-[9px] flex items-center justify-center">₿</span>
            <span>Binance Pay (بينانس)</span>
          </span>
          <span className="px-2 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
            Visa / MasterCard
          </span>
          <span className="px-2 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
            مدى Mada
          </span>
          <span className="px-2 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
            Pay & GPay
          </span>
          <span className="px-2 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-blue-600 dark:text-blue-400">
            PayPal
          </span>
        </div>
      </div>

      {/* 3. Monthly Operational Cost Transparency (إجابة مباشرة: كم تكلفة هذا الموقع في الشهر؟) */}
      <div className="rounded-3xl bg-gradient-to-br from-amber-500/10 via-stone-50 to-stone-100 dark:from-stone-900/90 dark:via-stone-900 dark:to-[#171614] border border-[#c29b40]/30 p-6 sm:p-10 space-y-8 shadow-sm">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-[#9c7524] dark:text-amber-400">
              <Info className="w-4 h-4" />
              <span>{isAr ? 'تقرير الشفافية التقنية والمالية' : 'Technical & Financial Transparency'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-stone-100">
              {isAr ? 'كم تبلغ تكلفة تشغيل واستضافة هذا الموقع في الشهر؟' : 'How Much Does It Cost to Run This Site Per Month?'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-2xl leading-relaxed">
              {isAr
                ? 'إليك التفصيل الفعلي للأصول السحابية وتكاليف تشغيل منصة ArabPrompt لخدمة آلاف المستخدمين وصناع المحتوى شهرياً:'
                : 'Here is an open, accurate breakdown of cloud hosting and AI computing costs required to operate ArabPrompt every month:'}
            </p>
          </div>

          <div className="bg-white dark:bg-stone-800/80 rounded-2xl p-4 border border-stone-200 dark:border-stone-700/80 text-center shrink-0">
            <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 block">
              {isAr ? 'الإجمالي التقديري شهرياً' : 'Total Monthly Run Cost'}
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              $0 — $25
            </span>
            {!formatPrice(25).isUsd && (
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 block mt-0.5">
                (~ {formatPrice(0).fullFormatted} — {formatPrice(25).fullFormatted})
              </span>
            )}
            <span className="text-[10px] text-stone-400 block mt-0.5">
              {isAr ? 'حسب حجم الزيارات والاستهلاك' : 'Depending on traffic & volume'}
            </span>
          </div>
        </div>

        {/* Cost breakdown cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Item 1: Hosting & CDN */}
          <div className="bg-white/80 dark:bg-stone-800/50 backdrop-blur-xs rounded-2xl p-5 border border-stone-200/80 dark:border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Server className="w-4 h-4" />
              </div>
              <span className="text-xs font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                $0.00 / mo
              </span>
            </div>
            <div>
              <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                {isAr ? 'استضافة الواجهة وتوزيع CDN' : 'Web Hosting & Edge CDN'}
              </h4>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                {isAr 
                  ? 'مستضاف عبر بنية سحابية حديثة بشهادات SSL وتوزيع عالمي مجاناً بالكامل.' 
                  : 'Zero-cost hosting on modern edge cloud with global CDN, SSL, and instant deploys.'}
              </p>
            </div>
          </div>

          {/* Item 2: Database & Auth */}
          <div className="bg-white/80 dark:bg-stone-800/50 backdrop-blur-xs rounded-2xl p-5 border border-stone-200/80 dark:border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Database className="w-4 h-4" />
              </div>
              <span className="text-xs font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                $0 — $5 / mo
              </span>
            </div>
            <div>
              <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                {isAr ? 'قاعدة البيانات والمصادقة' : 'Database & Auth (Firestore)'}
              </h4>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                {isAr 
                  ? 'باقة Firebase Spark تمنح 50,000 قراءة و 20,000 كتابة يومياً مجاناً، وترتفع قليلاً مع ملايين العمليات.' 
                  : 'Firebase Spark tier covers 50k reads & 20k writes daily free, scaling gently under high volume.'}
              </p>
            </div>
          </div>

          {/* Item 3: Gemini AI API */}
          <div className="bg-white/80 dark:bg-stone-800/50 backdrop-blur-xs rounded-2xl p-5 border border-stone-200/80 dark:border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <Cpu className="w-4 h-4" />
              </div>
              <span className="text-xs font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                $0 — $15 / mo
              </span>
            </div>
            <div>
              <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                {isAr ? 'محرك الذكاء الاصطناعي (Gemini)' : 'Gemini AI Synthesis Model'}
              </h4>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                {isAr 
                  ? 'توفر Google Gemini طبقة مجانية سخية (15 طلب/دقيقة)، وتبلغ تكلفة الـ 1M رمز حوالي $0.075 فقط عند الدفع.' 
                  : 'Free tier grants 15 RPM; paid tier is just ~$0.075 per 1M tokens, translating to $3-$15 for thousands of queries.'}
              </p>
            </div>
          </div>

          {/* Item 4: Maintenance & Domain */}
          <div className="bg-white/80 dark:bg-stone-800/50 backdrop-blur-xs rounded-2xl p-5 border border-stone-200/80 dark:border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-xs font-black px-2 py-0.5 rounded-full bg-stone-100 text-stone-800 dark:bg-stone-700 dark:text-stone-300">
                ~$1 / mo
              </span>
            </div>
            <div>
              <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                {isAr ? 'النطاق والصيانة والأمان' : 'Custom Domain & Security'}
              </h4>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                {isAr 
                  ? 'نطاق رسمي مخصص سنوي ($12 سنوياً أي دولار واحد شهرياً) مع حماية سحابية مستمرة.' 
                  : 'Custom domain averages $12/year (~$1/mo) with automated Cloudflare SSL & protection.'}
              </p>
            </div>
          </div>

        </div>

        {/* Key Takeaway Banner */}
        <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 flex items-start sm:items-center gap-3">
          <HeartHandshake className="w-5 h-5 text-[#c29b40] shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-medium">
            {isAr
              ? 'الخلاصة: يمكنك تشغيل موقع متكامل مثل ArabPrompt بتكلفة تقارب الصفر دولار شهرياً أثناء البداية بفضل الطبقات المجانية لـ Google و Firebase، وعندما ينمو الموقع ليخدم عشرات الآلاف، لا تتعدى التكلفة الإجمالية 25 إلى 45 دولاراً شهرياً فقط!'
              : 'Key Takeaway: You can run an app like ArabPrompt for nearly $0/month in early stages using free tiers from Google & Firebase. At scale with tens of thousands of users, operational expenses stay below $25-$45/month!'}
          </p>
        </div>

        {/* AdSense Free Tier Revenue Model Card */}
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-stone-50 to-amber-500/10 dark:from-emerald-950/30 dark:via-stone-900/60 dark:to-amber-950/20 border border-emerald-500/30 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 dark:border-stone-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black shadow-xs text-sm">
                %
              </div>
              <div>
                <h4 className="text-sm font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <span>{isAr ? 'نموذج الربح من الحصة المجانية عبر إعلانات Google AdSense' : 'Google AdSense Free Tier Monetization Model'}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                    {isAr ? 'حصة الناشر 68%' : '68% Publisher Share'}
                  </span>
                </h4>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  {isAr 
                    ? 'كيف تحقق المنصة أرباحاً تلقائية من الزوار المجانيين قبل حتى أن يقوموا بالترقية' 
                    : 'How the platform monetizes free visitors automatically via ads prior to upgrade'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-3 py-1 rounded-xl bg-white dark:bg-stone-800 border border-emerald-500/30 font-bold text-emerald-600 dark:text-emerald-400">
                {isAr ? 'حصتك: 68% | حصة جوجل: 32%' : 'Publisher: 68% | Google: 32%'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-white/80 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 space-y-1">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                {isAr ? '1. الحصة اليومية المجانية' : '1. Daily Free Allowance'}
              </span>
              <span className="text-base font-black text-stone-900 dark:text-stone-100 block">
                25 {isAr ? 'طلباً يومياً / مستخدم' : 'prompts / day / user'}
              </span>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                {isAr 
                  ? 'يشاهد المستخدم الإعلانات المدمجة أثناء صياغة الأوامر (+ إمكانية ربح 5 طلبات إضافية لكل إعلان مكافأة).' 
                  : 'Users see integrated AdSense units while drafting prompts (+ 5 bonus prompts per rewarded view).'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/80 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 space-y-1">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                {isAr ? '2. معدل الظهور الشهري التقديري' : '2. Monthly Ad Impressions'}
              </span>
              <span className="text-base font-black text-[#c29b40] block">
                100,000+ {isAr ? 'ظهور لكل 1K مستخدم' : 'impressions / 1K users'}
              </span>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                {isAr 
                  ? 'بمعدل 3 إلى 5 إعلانات لكل جلسة عمل وتصدير، يولد 1,000 مستخدم مجاني أكثر من 100 ألف ظهور شهرياً.' 
                  : 'With 3-5 impressions per user session, 1,000 monthly active users generate 100k+ impressions.'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/80 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 space-y-1">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                {isAr ? '3. العائد المالي الصافي المتوقع' : '3. Estimated AdSense Revenue'}
              </span>
              <span className="text-base font-black text-emerald-600 dark:text-emerald-400 block">
                $150 — $450 {isAr ? 'شهرياً' : '/ month'}
              </span>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                {isAr 
                  ? 'تغطي أرباح أدسنس تكاليف الاستضافة بالكامل بأضعاف مضاعفة، بالإضافة لتحويل 3% - 5% منهم لاشتراك الـ 5$ أو 9$.' 
                  : 'AdSense revenue covers hosting costs multiple times over, while converting 3%-5% of users to $5-$9 paid plans.'}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* 4. Interactive Volume & Savings Calculator */}
      <div className="bg-white dark:bg-[#151412] rounded-3xl border border-stone-200 dark:border-stone-800 p-6 sm:p-10 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h3 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100">
            {isAr ? 'احسب استهلاكك وخطة التوفير المناسبة' : 'Calculate Your Monthly Volume & Savings'}
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
            {isAr 
              ? 'حرك المؤشر لتحديد عدد الأوامر والمشاهد التي تنوي إنتاجها شهرياً' 
              : 'Slide to match your anticipated prompt & cinematic scene output per month'}
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-6 pt-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-stone-700 dark:text-stone-300">
              <span>{isAr ? 'حجم الإنتاج الشهري المتوقع:' : 'Estimated Monthly Prompts/Scenes:'}</span>
              <span className="text-base font-black text-[#c29b40]">
                {monthlyPromptsEst} {isAr ? 'برومبت / مشهد' : 'prompts'}
              </span>
            </div>
            
            <input
              type="range"
              min="50"
              max="2000"
              step="50"
              value={monthlyPromptsEst}
              onChange={(e) => setMonthlyPromptsEst(Number(e.target.value))}
              className="w-full h-2.5 bg-stone-200 dark:bg-stone-800 rounded-lg appearance-none cursor-pointer accent-[#c29b40]"
            />
            
            <div className="flex justify-between text-[11px] text-stone-400 font-medium">
              <span>50 {isAr ? '(مبتدئ)' : '(Hobby)'}</span>
              <span>500 {isAr ? '(صانع نشط)' : '(Active Creator)'}</span>
              <span>2,000+ {isAr ? '(استوديو)' : '(Studio Scale)'}</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-start">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                {isAr ? 'الخطة الموصى بها لاحتياجك:' : 'Recommended Plan for You:'}
              </span>
              <div className="text-lg font-black text-stone-900 dark:text-stone-100 flex items-center justify-center sm:justify-start gap-2">
                <Crown className="w-4 h-4 text-[#c29b40]" />
                <span>
                  {monthlyPromptsEst <= 50 
                    ? (isAr ? `الباقة المجانية (${formatPrice(0).fullFormatted}/شهر)` : `Starter Free (${formatPrice(0).fullFormatted}/mo)`)
                    : monthlyPromptsEst <= 250
                    ? (isAr ? `باقة الانطلاقة Lite (${formatPrice(litePrice).fullFormatted}/شهر - الأرخص والأوفر)` : `Starter Lite (${formatPrice(litePrice).fullFormatted}/mo - Best Budget)`)
                    : monthlyPromptsEst <= 800 
                    ? (isAr ? `باقة المحترف Pro (${formatPrice(proPrice).fullFormatted}/شهر)` : `Pro Creator (${formatPrice(proPrice).fullFormatted}/mo)`)
                    : (isAr ? `باقة الاستوديو Studio (${formatPrice(studioPrice).fullFormatted}/شهر)` : `Studio & Agency (${formatPrice(studioPrice).fullFormatted}/mo)`)}
                </span>
              </div>
            </div>

            <div className="text-center sm:text-end">
              <span className="text-[11px] font-bold text-stone-500 block">
                {isAr ? 'الوقت المقدر لتوفيره شهرياً:' : 'Estimated Time Saved:'}
              </span>
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                {Math.round(monthlyPromptsEst * 0.15)} {isAr ? 'ساعة عمل إبداعي' : 'creative hours'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Detailed Feature Comparison Table */}
      <div className="bg-white dark:bg-[#151412] rounded-3xl border border-stone-200 dark:border-stone-800 p-6 sm:p-10 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h3 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100">
            {isAr ? 'مقارنة شاملة لجميع الميزات' : 'Comprehensive Feature Comparison'}
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
            {isAr ? 'تفاصيل كل قدرة وأداة عبر الباقات المختلفة' : 'Detailed breakdown of limits and tools across tiers'}
          </p>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-xs text-start border-collapse">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-400 font-semibold">
                <th className="py-3 px-4 text-start font-bold">{isAr ? 'الميزة / الأداة' : 'Feature / Tool'}</th>
                <th className="py-3 px-4 text-center">{isAr ? 'المجانية' : 'Free'} ({formatPrice(0).fullFormatted})</th>
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
                <td className="py-3 px-4 text-center font-bold">{isAr ? '25 يومياً' : '25/day'}</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400">{isAr ? '100 يومياً' : '100/day'}</td>
                <td className="py-3 px-4 text-center font-black text-emerald-600 dark:text-emerald-400">{isAr ? 'غير محدود' : 'Unlimited'}</td>
                <td className="py-3 px-4 text-center font-black text-emerald-600 dark:text-emerald-400">{isAr ? 'غير محدود' : 'Unlimited'}</td>
              </tr>
              <tr>
                <td className="py-3 px-4">{isAr ? 'توليد ثنائي (مباشر وهندسي)' : 'Dual architecture output'}</td>
                <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-emerald-500 mx-auto" /></td>
                <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-emerald-500 mx-auto" /></td>
                <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-emerald-500 mx-auto" /></td>
                <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-emerald-500 mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-3 px-4">{isAr ? 'مكتبة الصور الفنية (36 برومبت جاهز)' : 'Visual Art Library (36 prompts)'}</td>
                <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-emerald-500 mx-auto" /></td>
                <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-emerald-500 mx-auto" /></td>
                <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-emerald-500 mx-auto" /></td>
                <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-emerald-500 mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-3 px-4">{isAr ? 'هندسة عكسية للصور والفيديو' : 'Reverse Engineering (Image & Video)'}</td>
                <td className="py-3 px-4 text-center">{isAr ? 'صورة واحدة' : 'Single image'}</td>
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
                <td className="py-3 px-4 text-center">{isAr ? 'مشروعان' : '2 projects'}</td>
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
                <td className="py-3 px-4">{isAr ? 'النسخ السحابي (Drive / Firebase)' : 'Cloud Backup Integration'}</td>
                <td className="py-3 px-4 text-center">{isAr ? 'محلي فقط' : 'Local only'}</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-600">{isAr ? 'سحابي (10 مشاريع)' : 'Cloud (10)'}</td>
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
                <td className="py-3 px-4 text-center">{isAr ? 'مجتمعي' : 'Community'}</td>
                <td className="py-3 px-4 text-center">{isAr ? 'بريد قياسي' : 'Standard'}</td>
                <td className="py-3 px-4 text-center">{isAr ? 'أولوية بريدية' : 'Priority Email'}</td>
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
            <span>{isAr ? 'كل ما تود معرفته عن الاشتراكات' : 'Got questions?'}</span>
          </div>
          <h3 className="text-2xl font-black text-stone-900 dark:text-stone-100">
            {isAr ? 'الأسئلة الشائعة حول الفواتير والأسعار' : 'Frequently Asked Questions'}
          </h3>
        </div>

        <div className="space-y-3">
          {[
            {
              qAr: 'هل يمكنني تجربة المنصة مجاناً قبل الاشتراك في أي باقة مدفوعة؟',
              qEn: 'Can I try ArabPrompt completely free before subscribing?',
              aAr: 'نعم بالتأكيد! الباقة المجانية متاحة دائماً بدون الحاجة لإدخال أي بطاقة ائتمانية. يمكنك توليد حتى 25 أمراً يومياً، وتصفح مكتبة الصور الفنية الـ 36 كاملة وتجربة محرر السيناريو.',
              aEn: 'Absolutely! The Starter Free plan is available forever without requiring any credit card. You can synthesize up to 25 prompts daily and use the 36-item art concept library.'
            },
            {
              qAr: 'كيف أستفيد من ميزة مشاركة التسلسلات (Share Sequence)؟',
              qEn: 'How does the Share Sequence feature work?',
              aAr: 'تتيح لك هذه الميزة توليد رابط فريد ومحمي لأي تسلسل مشاهد أو سيناريو قمت ببنائه، بحيث يمكن لأي مخرج أو عميل أو زميل فتح التسلسل مباشرة وتعديله أو نسخه إلى حسابه بضغطة واحدة.',
              aEn: 'Share Sequence generates an instant, persistent cloud link for any multi-scene storyboard or movie screenplay you produce. Anyone with the link can view, remix, or copy it.'
            },
            {
              qAr: 'هل يمكنني إلغاء اشتراكي في أي وقت؟',
              qEn: 'Can I cancel my subscription at any time?',
              aAr: 'نعم بكل سهولة. يمكنك إلغاء التجديد التلقائي في أي وقت بنقرة واحدة من لوحة إدارة حسابك، وستظل ميزات باقتك نشطة حتى نهاية الفترة المدفوعة.',
              aEn: 'Yes, anytime with one click from your profile settings. You will retain all Pro privileges until the end of the current billing cycle.'
            },
            {
              qAr: 'هل يمكنني ربط اشتراكي والدفع عبر حسابي في بينانس (Binance Pay)؟',
              qEn: 'Can I pay or link my subscription with my Binance account (Binance Pay)?',
              aAr: 'نعم بالكامل! يدعم ArabPrompt الدفع الفوري والمباشر عبر Binance Pay والعملات الرقمية المشفرة (خاصة USDT بدون أي رسوم غاز 0% Gas Fees). يمكنك اختيار "Binance Pay" في نافذة الدفع، ومسح رمز الـ QR عبر تطبيق Binance بالجوال أو التحويل لمعرّف الدفع (Pay ID)، وسيتم التحقق التلقائي وتفعيل باقتك على الفور.',
              aEn: 'Yes! ArabPrompt fully supports instant checkout via Binance Pay and cryptocurrencies (notably zero-fee USDT). Select Binance Pay in the checkout window, scan the QR code with your Binance mobile app or transfer to our Pay ID for instant, automated plan activation.'
            },
            {
              qAr: 'ما هي طرق ووسائل الدفع والعملات المقبولة؟',
              qEn: 'What payment methods and currencies do you accept?',
              aAr: 'نقبل بينانس باي (Binance Pay) والعملات الرقمية (USDT / BNB / BTC بدون رسوم تحويل إضافية)، بالإضافة لبطاقات Visa و MasterCard ومدى Mada ومدفوعات Apple Pay و Google Pay و PayPal. كما تتوفر أسعار الاشتراكات بعملتك المحلية تلقائياً بشفافية تامة وبدون أي رسوم خفية.',
              aEn: 'We accept Binance Pay & Crypto (zero-fee USDT / BNB / BTC), Visa, MasterCard, Mada, Apple Pay, Google Pay, and PayPal. Subscriptions are automatically converted and displayed in local currencies with transparent rates and no hidden fees.'
            },
            {
              qAr: 'ما هي الحصة المجانية المتاحة وكيف يتم الربح منها عبر Google AdSense؟',
              qEn: 'What is the free quota and how is it monetized via Google AdSense?',
              aAr: 'تمنح المنصة كل مستخدم حصة مجانية أساسية تبلغ 25 طلباً/برومبت يومياً مجاناً، بالإضافة لفرصة كسب حتى 20 طلباً إضافياً يومياً عبر مشاهدة إعلانات المكافآت (+5 طلبات لكل إعلان). يستفيد صاحب المنصة من حصة أرباح Google AdSense الرسمية البالغة 68% للناشر مقابل 32% لجوجل، مما يولد دخلاً شهرياً مستمراً يغطي تكاليف السيرفرات بالكامل، مع تمتع الباقات المدفوعة بتجربة خالية تماماً من أي إعلانات.',
              aEn: 'The platform provides a free daily allowance of 25 prompt generations (+ up to 20 bonus requests by viewing rewarded ads). The site owner receives the official Google AdSense 68% publisher revenue share (Google retains 32%), providing recurring revenue while paid subscribers enjoy a 100% ad-free environment.'
            },
            {
              qAr: 'هل تتوفر أسعار مخفضة للطلاب والجهات غير الربحية؟',
              qEn: 'Do you offer student and non-profit discounts?',
              aAr: 'نعم! نحن ندعم المواهب وصناع المحتوى الناشئين. يمكنك التواصل مع فريق الدعم وإرفاق إثبات دراسي للحصول على خصم 50% على باقة المحترف السنوية.',
              aEn: 'Yes! We actively support students and non-profit creators. Contact support with your credentials to receive an educational 50% discount on annual plans.'
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
              ? 'انضم لآلاف المخرجين وصناع المحتوى الذين يصوغون أوامرهم بأعلى معايير الدقة والاتساق البصري.'
              : 'Join thousands of directors and digital creators architecting high-fidelity prompts with visual consistency.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 relative">
          <button
            onClick={() => onNavigateTab ? onNavigateTab('builder') : null}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-xs bg-[#c29b40] hover:bg-[#b08b34] text-stone-950 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer font-black"
          >
            <span>{isAr ? 'ابدأ تجربة المنصة مجاناً' : 'Start Free Now'}</span>
            <Arrow className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onOpenAuth ? onOpenAuth('login') : null}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-xs bg-stone-800/80 hover:bg-stone-800 text-stone-200 border border-stone-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{isAr ? 'تسجيل حساب جديد' : 'Create Free Account'}</span>
          </button>
        </div>
      </div>

    </div>
  );
}
