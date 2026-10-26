/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Calculator, DollarSign, Zap, CheckCircle2, AlertCircle, 
  Server, Database, Globe, Copy, Check, Sparkles, Sliders, 
  Info, TrendingDown, Layers, HelpCircle, ArrowUpRight
} from 'lucide-react';
import { AppLanguage } from '../types';

interface CostEstimatorProps {
  lang: AppLanguage;
}

type WorkloadType = 'cinema' | 'builder' | 'ideas' | 'mixed';
type GeminiModel = 'flash' | 'pro';
type Currency = 'USD' | 'SAR' | 'EUR' | 'AED';

export default function CostEstimator({ lang }: CostEstimatorProps) {
  // User Inputs
  const [frequency, setFrequency] = useState<'daily' | 'monthly'>('daily');
  const [requestsCount, setRequestsCount] = useState<number>(50);
  const [workload, setWorkload] = useState<WorkloadType>('cinema');
  const [model, setModel] = useState<GeminiModel>('flash');
  const [includeCustomDomain, setIncludeCustomDomain] = useState<boolean>(false);
  const [currency, setCurrency] = useState<Currency>('USD');
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);

  // Conversion rates relative to USD
  const currencyRates: Record<Currency, { symbol: string; rate: number; nameAr: string; nameEn: string }> = {
    USD: { symbol: '$', rate: 1, nameAr: 'دولار أمريكي', nameEn: 'US Dollar' },
    SAR: { symbol: 'ر.س', rate: 3.75, nameAr: 'ريال سعودي', nameEn: 'Saudi Riyal' },
    AED: { symbol: 'د.إ', rate: 3.67, nameAr: 'درهم إماراتي', nameEn: 'UAE Dirham' },
    EUR: { symbol: '€', rate: 0.92, nameAr: 'يورو أوروبي', nameEn: 'Euro' },
  };

  // Workload Token Profiles (Input tokens / Output tokens per single generation)
  const workloadProfiles: Record<WorkloadType, { inputTokens: number; outputTokens: number; titleAr: string; titleEn: string; descAr: string; descEn: string }> = {
    cinema: {
      inputTokens: 750,
      outputTokens: 2200,
      titleAr: 'أفلام وسيناريو كامل مع حوارات ومثبتات الوجه',
      titleEn: 'Cinema Studio (Full Script, Dialogues, Face Anchors)',
      descAr: 'توليد فيلم سينمائي متعدد المشاهد مع نصوص الحوارات، المشاعر، وتوقيت الشفاه.',
      descEn: 'Multi-scene generation with spoken dialogue script, emotion, and lip-sync cues.'
    },
    builder: {
      inputTokens: 350,
      outputTokens: 750,
      titleAr: 'هندسة وتحسين الأوامر والبرومبت',
      titleEn: 'Prompt Engineering & Refinement',
      descAr: 'تحسين أوامر الصور والنصوص، إبراز المتغيرات، وفحص الجودة.',
      descEn: 'Enhancing prompts, dynamic variable highlighting, and quality scores.'
    },
    ideas: {
      inputTokens: 400,
      outputTokens: 1100,
      titleAr: 'توليد حزم الأفكار وسلاسل المشاهد',
      titleEn: 'Prompt Ideas & Sequence Packs',
      descAr: 'توليد 5-10 أفكار إبداعية أو سلسلة من 4 مشاهد متصلة.',
      descEn: 'Batch idea generator or 4-panel storyboard sequences.'
    },
    mixed: {
      inputTokens: 500,
      outputTokens: 1400,
      titleAr: 'استخدام متوازن وشامل (متوسط عام)',
      titleEn: 'Balanced / Mixed Usage Average',
      descAr: 'مزيج واقعي لجميع أدوات المنصة عبر الزوار المختلفين.',
      descEn: 'Realistic blended usage across all platform modules.'
    }
  };

  // Pricing models according to official Google AI Studio pricing (per 1M tokens)
  const modelPricing: Record<GeminiModel, { name: string; inputPerMillion: number; outputPerMillion: number; freeRpm: number; freeRpd: number }> = {
    flash: {
      name: 'Gemini 2.5 / 1.5 Flash (السريع والموصى به)',
      inputPerMillion: 0.075,
      outputPerMillion: 0.30,
      freeRpm: 15,
      freeRpd: 1500 // 1,500 free requests per day in Google AI Studio
    },
    pro: {
      name: 'Gemini 1.5 Pro (النموذج المتقدم عالي الدقة)',
      inputPerMillion: 1.25,
      outputPerMillion: 5.00,
      freeRpm: 2,
      freeRpd: 50
    }
  };

  // Normalization
  const dailyRequests = frequency === 'daily' ? requestsCount : Math.round(requestsCount / 30);
  const monthlyRequests = frequency === 'daily' ? requestsCount * 30 : requestsCount;

  const currentWorkload = workloadProfiles[workload];
  const currentModel = modelPricing[model];

  // Calculations
  const monthlyInputTokens = monthlyRequests * currentWorkload.inputTokens;
  const monthlyOutputTokens = monthlyRequests * currentWorkload.outputTokens;
  const totalMonthlyTokens = monthlyInputTokens + monthlyOutputTokens;

  // Free Tier assessment:
  // In Google AI Studio, free tier offers up to freeRpd requests per day (e.g. 1500 req/day for Flash).
  const isWithinFreeTier = dailyRequests <= currentModel.freeRpd;
  const freeTierDailyUsagePercent = Math.min(100, (dailyRequests / currentModel.freeRpd) * 100);

  // Paid tier pricing (only applies if above free tier, or pay-as-you-go enabled)
  const rawApiCostMonthlyUSD = (
    (monthlyInputTokens / 1_000_000) * currentModel.inputPerMillion +
    (monthlyOutputTokens / 1_000_000) * currentModel.outputPerMillion
  );

  // Actual cost: 0 if within free tier, or raw cost if above
  const actualApiCostUSD = isWithinFreeTier ? 0 : rawApiCostMonthlyUSD;

  // Ancillary costs
  const hostingCostUSD = monthlyRequests > 2_000_000 ? 5.00 : 0.00; // Cloud run provides 2M requests/mo free
  const databaseCostUSD = monthlyRequests > 600_000 ? 3.00 : 0.00; // Firestore provides 50k reads/day free
  const domainCostUSD = includeCustomDomain ? 1.00 : 0.00; // ~$12/yr

  const totalMonthlyCostUSD = actualApiCostUSD + hostingCostUSD + databaseCostUSD + domainCostUSD;
  const curr = currencyRates[currency];

  const formatCost = (costInUSD: number) => {
    const converted = costInUSD * curr.rate;
    if (converted === 0) return `0.00 ${curr.symbol}`;
    if (converted < 0.01) return `< 0.01 ${curr.symbol}`;
    return `${converted.toFixed(2)} ${curr.symbol}`;
  };

  // Presets
  const applyPreset = (presetDailyReq: number, presetWorkload: WorkloadType, presetModel: GeminiModel) => {
    setFrequency('daily');
    setRequestsCount(presetDailyReq);
    setWorkload(presetWorkload);
    setModel(presetModel);
  };

  // Copy Summary
  const handleCopySummary = () => {
    const text = lang === 'ar'
      ? `📊 تقرير تقدير تكلفة تشغيل موقع ArabPrompt:
• معدل الاستخدام: ${dailyRequests.toLocaleString()} طلب يومياً (${monthlyRequests.toLocaleString()} طلب شهرياً)
• نوع المهام: ${currentWorkload.titleAr}
• نموذج الذكاء الاصطناعي: ${currentModel.name}
• تغطية الباقة المجانية لـ Google: ${isWithinFreeTier ? '✅ مغطى بالكامل مجاناً (100% Free)' : '⚠️ تجاوز الحد المجاني (حساب الاستهلاك)'}
• استهلاك الرموز (Tokens) المتوقع: ${(totalMonthlyTokens / 1_000_000).toFixed(2)} مليون رمز شهرياً
• تكلفة الذكاء الاصطناعي (Gemini API): ${formatCost(actualApiCostUSD)} / شهر
• تكلفة استضافة السيرفر (Google Cloud Run): 0.00 $ (ضمن أول 2 مليون طلب مجاناً)
• تكلفة قاعدة البيانات (Firestore): 0.00 $ (ضمن الحد المجاني)
• النطاق المخصص (Domain): ${includeCustomDomain ? formatCost(domainCostUSD) : '0.00 $ (الرابط المجاني)'}
═════════════════════════════
💎 إجمالي الفاتورة المتوقعة: ${formatCost(totalMonthlyCostUSD)} شهرياً`
      : `📊 ArabPrompt Estimated Monthly Hosting & AI Cost:
• Expected Usage: ${dailyRequests.toLocaleString()} req/day (${monthlyRequests.toLocaleString()} req/month)
• Workload: ${currentWorkload.titleEn}
• Model: ${currentModel.name}
• Google Free Tier Status: ${isWithinFreeTier ? '✅ 100% Covered in Free Tier' : '⚠️ Pay-as-you-go threshold'}
• Monthly Tokens: ${(totalMonthlyTokens / 1_000_000).toFixed(2)}M tokens/month
• Gemini API Cost: ${formatCost(actualApiCostUSD)} / month
• Cloud Hosting (Cloud Run): $0.00 (Free up to 2M requests/mo)
• Database (Firestore): $0.00 (Free tier)
• Custom Domain: ${includeCustomDomain ? formatCost(domainCostUSD) : '$0.00 (Free subdomain)'}
═════════════════════════════
💎 Total Estimated Monthly Cost: ${formatCost(totalMonthlyCostUSD)} / month`;

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl shadow-sm p-6 sm:p-8 space-y-8 animate-fade-in" id="gemini-cost-estimator-module">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 dark:border-stone-800 pb-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c29b40]/10 dark:bg-amber-400/10 text-[#9c7524] dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Calculator className="w-3.5 h-3.5 text-[#c29b40]" />
            <span>{lang === 'ar' ? 'حاسبة التكلفة والميزانية الشهرية' : 'Cost & Budget Estimator'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 font-sans">
            {lang === 'ar' ? 'تقدير تكلفة استهلاك Gemini API والموقع' : 'Gemini API & Platform Monthly Cost Estimator'}
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 font-medium max-w-2xl leading-relaxed">
            {lang === 'ar'
              ? 'احسب بدقة التكلفة الشهرية المتوقعة بناءً على عدد الطلبات ونوع المهام. يتيح لك محاكي الأسعار معرفة ما إذا كان موقعك يقع ضمن الباقة المجانية بالكامل أو في حدود الدفع حسب الاستهلاك.'
              : 'Calculate your accurate monthly bill based on your projected daily volume. See whether your workload is 100% free under Google AI Studio limits or pay-as-you-go.'}
          </p>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl self-start md:self-center border border-stone-200/60 dark:border-stone-700">
          {(Object.keys(currencyRates) as Currency[]).map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                currency === c
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Scenario Presets */}
      <div className="space-y-2.5">
        <span className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
          {lang === 'ar' ? '⚡ سيناريوهات جاهزة بنقرة واحدة:' : '⚡ Instant Scenario Presets:'}
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => applyPreset(15, 'mixed', 'flash')}
            className={`p-3 rounded-2xl border text-start transition-all cursor-pointer ${
              dailyRequests === 15 && workload === 'mixed'
                ? 'border-[#c29b40] bg-[#c29b40]/5 dark:bg-amber-400/10 ring-1 ring-[#c29b40]'
                : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 bg-stone-50/50 dark:bg-stone-800/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-stone-900 dark:text-stone-100">
                {lang === 'ar' ? 'صانع محتوى فردي' : 'Solo Creator'}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-bold">
                0.00 $
              </span>
            </div>
            <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1 font-medium">
              {lang === 'ar' ? '15 طلب يومياً (450 شهرياً)' : '15 req/day (450/mo)'}
            </p>
          </button>

          <button
            onClick={() => applyPreset(100, 'cinema', 'flash')}
            className={`p-3 rounded-2xl border text-start transition-all cursor-pointer ${
              dailyRequests === 100 && workload === 'cinema'
                ? 'border-[#c29b40] bg-[#c29b40]/5 dark:bg-amber-400/10 ring-1 ring-[#c29b40]'
                : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 bg-stone-50/50 dark:bg-stone-800/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-stone-900 dark:text-stone-100">
                {lang === 'ar' ? 'استوديو سينمائي' : 'Cinema Studio'}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-bold">
                0.00 $
              </span>
            </div>
            <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1 font-medium">
              {lang === 'ar' ? '100 فيلم يومياً (3,000 شهرياً)' : '100 films/day (3k/mo)'}
            </p>
          </button>

          <button
            onClick={() => applyPreset(1000, 'builder', 'flash')}
            className={`p-3 rounded-2xl border text-start transition-all cursor-pointer ${
              dailyRequests === 1000 && workload === 'builder'
                ? 'border-[#c29b40] bg-[#c29b40]/5 dark:bg-amber-400/10 ring-1 ring-[#c29b40]'
                : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 bg-stone-50/50 dark:bg-stone-800/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-stone-900 dark:text-stone-100">
                {lang === 'ar' ? 'موقع نشط للجمهور' : 'Public Traffic'}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-bold">
                0.00 $
              </span>
            </div>
            <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1 font-medium">
              {lang === 'ar' ? '1,000 طلب يومياً (30 ألف شهرياً)' : '1,000 req/day (30k/mo)'}
            </p>
          </button>

          <button
            onClick={() => applyPreset(5000, 'cinema', 'flash')}
            className={`p-3 rounded-2xl border text-start transition-all cursor-pointer ${
              dailyRequests === 5000
                ? 'border-[#c29b40] bg-[#c29b40]/5 dark:bg-amber-400/10 ring-1 ring-[#c29b40]'
                : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 bg-stone-50/50 dark:bg-stone-800/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-stone-900 dark:text-stone-100">
                {lang === 'ar' ? 'منصة تجارية ضخمة' : 'Enterprise SaaS'}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-300 font-bold">
                ~10-20 $
              </span>
            </div>
            <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1 font-medium">
              {lang === 'ar' ? '5,000 طلب يومياً (150 ألف شهرياً)' : '5,000 req/day (150k/mo)'}
            </p>
          </button>
        </div>
      </div>

      {/* Main Interactive Controls & Results Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Interactive Form Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Request Volume Slider */}
          <div className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-700/60 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-[#c29b40]" />
                <span>{lang === 'ar' ? 'عدد الطلبات المتوقعة:' : 'Expected Request Volume:'}</span>
              </label>

              {/* Toggle Daily / Monthly */}
              <div className="flex items-center gap-1 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg p-0.5 text-2xs font-bold">
                <button
                  onClick={() => setFrequency('daily')}
                  className={`px-2 py-0.5 rounded ${frequency === 'daily' ? 'bg-[#c29b40] text-white' : 'text-stone-500 dark:text-stone-400'}`}
                >
                  {lang === 'ar' ? 'يومياً' : 'Daily'}
                </button>
                <button
                  onClick={() => setFrequency('monthly')}
                  className={`px-2 py-0.5 rounded ${frequency === 'monthly' ? 'bg-[#c29b40] text-white' : 'text-stone-500 dark:text-stone-400'}`}
                >
                  {lang === 'ar' ? 'شهرياً' : 'Monthly'}
                </button>
              </div>
            </div>

            {/* Large Number Input & Quick Steps */}
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={frequency === 'daily' ? 1 : 30}
                max={frequency === 'daily' ? 10000 : 300000}
                step={frequency === 'daily' ? 10 : 300}
                value={requestsCount}
                onChange={(e) => setRequestsCount(Number(e.target.value))}
                className="flex-1 accent-[#c29b40] cursor-pointer h-2 bg-stone-200 dark:bg-stone-700 rounded-lg"
              />
              <div className="flex items-center gap-1 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-1.5 shadow-2xs">
                <input
                  type="number"
                  min="1"
                  max="500000"
                  value={requestsCount}
                  onChange={(e) => setRequestsCount(Math.max(1, Number(e.target.value)))}
                  className="w-20 font-mono text-sm font-black text-stone-900 dark:text-stone-100 bg-transparent text-center focus:outline-none"
                />
                <span className="text-[11px] text-stone-400 font-bold">
                  {frequency === 'daily' ? (lang === 'ar' ? '/يوم' : '/day') : (lang === 'ar' ? '/شهر' : '/mo')}
                </span>
              </div>
            </div>

            {/* Quick buttons */}
            <div className="flex flex-wrap gap-1.5 text-2xs font-bold text-stone-600 dark:text-stone-400">
              <span className="py-1 text-stone-400">{lang === 'ar' ? 'قيم سريعة:' : 'Quick:'}</span>
              {(frequency === 'daily' ? [10, 50, 150, 500, 1500, 5000] : [300, 1500, 4500, 15000, 45000, 150000]).map((num) => (
                <button
                  key={num}
                  onClick={() => setRequestsCount(num)}
                  className={`px-2 py-0.5 rounded-lg border transition ${
                    requestsCount === num
                      ? 'bg-[#c29b40] text-white border-[#c29b40]'
                      : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:border-stone-300'
                  }`}
                >
                  {num.toLocaleString()}
                </button>
              ))}
            </div>

            {/* Free Tier Threshold Indicator */}
            <div className="pt-2 border-t border-stone-200/50 dark:border-stone-700/50 space-y-1.5">
              <div className="flex items-center justify-between text-2xs font-bold">
                <span className="text-stone-600 dark:text-stone-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>{lang === 'ar' ? 'استهلاك حد باقة Google المجانية (1,500 طلب يومياً):' : 'Google Free Tier Quota (1,500 req/day):'}</span>
                </span>
                <span className={isWithinFreeTier ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
                  {dailyRequests.toLocaleString()} / 1,500 ({freeTierDailyUsagePercent.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 rounded-full ${
                    isWithinFreeTier ? 'bg-emerald-500' : 'bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500'
                  }`}
                  style={{ width: `${Math.min(100, freeTierDailyUsagePercent)}%` }}
                />
              </div>
            </div>
          </div>

          {/* 2. Workload Type Selection */}
          <div className="space-y-2">
            <label className="text-xs font-black text-stone-800 dark:text-stone-200 block">
              {lang === 'ar' ? 'طبيعة الأوامر والمهام المستخدمة:' : 'Application Workload Type:'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(Object.keys(workloadProfiles) as WorkloadType[]).map((key) => {
                const item = workloadProfiles[key];
                const isSelected = workload === key;
                return (
                  <button
                    key={key}
                    onClick={() => setWorkload(key)}
                    className={`p-3 rounded-2xl border text-start transition cursor-pointer ${
                      isSelected
                        ? 'border-[#c29b40] bg-[#c29b40]/10 dark:bg-amber-400/15 ring-1 ring-[#c29b40]'
                        : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                        {lang === 'ar' ? item.titleAr : item.titleEn}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#c29b40] shrink-0" />}
                    </div>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1 leading-normal font-medium">
                      {lang === 'ar' ? item.descAr : item.descEn}
                    </p>
                    <span className="text-[10px] font-mono text-[#c29b40] dark:text-amber-400 font-bold mt-1.5 block">
                      ~{(item.inputTokens + item.outputTokens).toLocaleString()} Tokens / طلب
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Gemini Model Choice */}
          <div className="space-y-2">
            <label className="text-xs font-black text-stone-800 dark:text-stone-200 block">
              {lang === 'ar' ? 'نموذج الذكاء الاصطناعي (Gemini):' : 'Gemini AI Model:'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(Object.keys(modelPricing) as GeminiModel[]).map((mKey) => {
                const m = modelPricing[mKey];
                const isSelected = model === mKey;
                return (
                  <button
                    key={mKey}
                    onClick={() => setModel(mKey)}
                    className={`p-3 rounded-2xl border text-start transition cursor-pointer ${
                      isSelected
                        ? 'border-[#c29b40] bg-[#c29b40]/10 dark:bg-amber-400/15 ring-1 ring-[#c29b40]'
                        : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-stone-900 dark:text-stone-100">
                        {mKey === 'flash' ? '⚡ Gemini Flash (الموصى به)' : '🧠 Gemini Pro (متقدم)'}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#c29b40]" />}
                    </div>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1 font-medium">
                      {mKey === 'flash'
                        ? (lang === 'ar' ? 'سرعة فائقة + 1500 طلب مجاناً يومياً (0.075$ / مليون رمز)' : 'Ultra fast, 1,500 req/day free ($0.075 / 1M tokens)')
                        : (lang === 'ar' ? 'تحليل معمق للمشاريع الضخمة (1.25$ / مليون رمز)' : 'Deep complex analysis ($1.25 / 1M tokens)')}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Optional Custom Domain Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-700/60">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#c29b40]" />
                <span>{lang === 'ar' ? 'حجز دومين خاص بالموقع (اختياري مثل .com)' : 'Include Custom Domain (e.g. .com)'}</span>
              </span>
              <span className="text-[10px] text-stone-500 dark:text-stone-400 block font-medium">
                {lang === 'ar' ? 'يكلف حوالي 12$ سنوياً (~ 1$ شهرياً). الرابط الحالي مجاني دائماً.' : 'Costs ~$12/year (~$1/mo). The default cloud link is always free.'}
              </span>
            </div>
            <button
              onClick={() => setIncludeCustomDomain(!includeCustomDomain)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                includeCustomDomain ? 'bg-[#c29b40]' : 'bg-stone-300 dark:bg-stone-600'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  includeCustomDomain ? (lang === 'ar' ? '-translate-x-5' : 'translate-x-5') : 'translate-x-0'
                }`}
              />
            </button>
          </div>

        </div>

        {/* Right Column: Live Bill & Cost Analysis Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Main Total Card */}
          <div className="rounded-3xl p-6 text-white relative overflow-hidden shadow-lg bg-gradient-to-tr from-[#7a5717] via-[#9e7a2b] to-[#c29b40]">
            <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 space-y-4">
              
              <div className="flex items-center justify-between">
                <span className="text-2xs font-bold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-sm">
                  {lang === 'ar' ? 'التكلفة الإجمالية المتوقعة' : 'Estimated Monthly Total'}
                </span>
                
                {isWithinFreeTier ? (
                  <span className="text-2xs font-black bg-emerald-400 text-stone-950 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{lang === 'ar' ? 'باقة مجانية 100%' : '100% Free Tier'}</span>
                  </span>
                ) : (
                  <span className="text-2xs font-bold bg-amber-400/90 text-stone-950 px-2 py-0.5 rounded-full">
                    {lang === 'ar' ? 'دفع حسب الاستخدام' : 'Pay-as-you-go'}
                  </span>
                )}
              </div>

              <div>
                <div className="text-4xl sm:text-5xl font-black font-sans tracking-tight">
                  {formatCost(totalMonthlyCostUSD)}
                </div>
                <p className="text-xs text-white/80 font-medium mt-1">
                  {lang === 'ar' ? 'شهرياً (مقابل ' + monthlyRequests.toLocaleString() + ' طلب في الشهر)' : `per month (for ${monthlyRequests.toLocaleString()} requests/mo)`}
                </p>
              </div>

              {/* Status explanation */}
              <div className="p-3.5 rounded-2xl bg-black/15 backdrop-blur-md text-xs leading-relaxed space-y-1">
                {isWithinFreeTier ? (
                  <>
                    <p className="font-bold flex items-center gap-1.5 text-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                      <span>{lang === 'ar' ? 'لن تدفع أي سنت!' : 'Zero Payment Required!'}</span>
                    </p>
                    <p className="text-white/85 text-[11px]">
                      {lang === 'ar'
                        ? `استهلاكك اليومي (${dailyRequests.toLocaleString()} طلب) يقع بالكامل ضمن حد الـ 1,500 طلب اليومي المجاني الذي تمنحه Google في منصة AI Studio.`
                        : `Your daily usage (${dailyRequests.toLocaleString()} req/day) is well within Google's 1,500 daily free tier limit.`}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-bold text-amber-200 flex items-center gap-1.5">
                      <Info className="w-4 h-4 text-amber-300 shrink-0" />
                      <span>{lang === 'ar' ? 'استهلاك تجاري خارج الحد المجاني' : 'Commercial Usage Beyond Free Tier'}</span>
                    </p>
                    <p className="text-white/85 text-[11px]">
                      {lang === 'ar'
                        ? `طلبك يتجاوز 1,500 طلب يومياً. التكلفة تحسب بسعر ${currentModel.inputPerMillion}$ لمليون رمز مدخل و ${currentModel.outputPerMillion}$ لمليون رمز مخرج، وهي من أرخص الأسعار عالمياً.`
                        : `Your usage exceeds 1,500 req/day. Billed at Google's ultra-low standard rate of $0.075/1M input and $0.30/1M output tokens.`}
                    </p>
                  </>
                )}
              </div>

            </div>
          </div>

          {/* Detailed Itemized Breakdown */}
          <div className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/70 dark:border-stone-700/70 space-y-3">
            <h4 className="text-xs font-black text-stone-900 dark:text-stone-100 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#c29b40]" />
              <span>{lang === 'ar' ? 'تفصيل الفاتورة الشهرية:' : 'Itemized Cost Breakdown:'}</span>
            </h4>

            <div className="space-y-2 text-xs divide-y divide-stone-200/60 dark:divide-stone-700/60">
              
              {/* Gemini API */}
              <div className="pt-2 flex items-center justify-between">
                <div>
                  <span className="font-bold text-stone-800 dark:text-stone-200 block">
                    {lang === 'ar' ? 'الذكاء الاصطناعي (Gemini API)' : 'AI Tokens (Gemini API)'}
                  </span>
                  <span className="text-[10px] text-stone-400 block font-mono">
                    ~{(totalMonthlyTokens / 1_000_000).toFixed(2)}M Tokens / mo
                  </span>
                </div>
                <div className="text-end">
                  <span className={`font-mono font-bold ${isWithinFreeTier ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-900 dark:text-stone-100'}`}>
                    {formatCost(actualApiCostUSD)}
                  </span>
                  {isWithinFreeTier && (
                    <span className="text-[9px] text-stone-400 block line-through">
                      {formatCost(rawApiCostMonthlyUSD)}
                    </span>
                  )}
                </div>
              </div>

              {/* Cloud Run Hosting */}
              <div className="pt-2 flex items-center justify-between">
                <div>
                  <span className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1">
                    <Server className="w-3 h-3 text-stone-400" />
                    <span>{lang === 'ar' ? 'استضافة الخادم (Cloud Run)' : 'Server Hosting (Cloud Run)'}</span>
                  </span>
                  <span className="text-[10px] text-stone-400 block">
                    {lang === 'ar' ? 'مجاناً حتى 2 مليون طلب شهرياً' : 'Free up to 2M req/month'}
                  </span>
                </div>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCost(hostingCostUSD)}
                </span>
              </div>

              {/* Firestore Database */}
              <div className="pt-2 flex items-center justify-between">
                <div>
                  <span className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1">
                    <Database className="w-3 h-3 text-stone-400" />
                    <span>{lang === 'ar' ? 'قاعدة البيانات (Firebase)' : 'Database (Firebase)'}</span>
                  </span>
                  <span className="text-[10px] text-stone-400 block">
                    {lang === 'ar' ? '50,000 قراءة و 20,000 كتابة يومياً مجاناً' : '50k reads & 20k writes/day free'}
                  </span>
                </div>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCost(databaseCostUSD)}
                </span>
              </div>

              {/* Custom domain */}
              {includeCustomDomain && (
                <div className="pt-2 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1">
                      <Globe className="w-3 h-3 text-stone-400" />
                      <span>{lang === 'ar' ? 'اسم النطاق المخصص (.com)' : 'Custom Domain (.com)'}</span>
                    </span>
                    <span className="text-[10px] text-stone-400 block">
                      {lang === 'ar' ? '~12 دولار سنوياً' : '~$12 annually'}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-stone-900 dark:text-stone-100">
                    {formatCost(domainCostUSD)}
                  </span>
                </div>
              )}

            </div>

            {/* Copy / Export Summary Button */}
            <div className="pt-3">
              <button
                onClick={handleCopySummary}
                className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-stone-300 text-stone-700 dark:text-stone-200 text-xs font-bold flex items-center justify-center gap-2 transition active:scale-98 shadow-2xs cursor-pointer"
              >
                {copiedSummary ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 dark:text-emerald-400">
                      {lang === 'ar' ? 'تم نسخ التقرير المالي للحافظة! ✨' : 'Cost Summary Copied! ✨'}
                    </span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#c29b40]" />
                    <span>{lang === 'ar' ? 'نسخ تقرير تقدير التكلفة والميزانية' : 'Copy Budget & Cost Summary'}</span>
                  </>
                )}
              </button>
            </div>

          </div>

          {/* Google AI Studio official note */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 text-[11px] text-amber-900 dark:text-amber-200/90 leading-relaxed space-y-1">
            <span className="font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{lang === 'ar' ? 'معلومة للمطور وصاحب المشروع:' : 'Helpful note for developer & owner:'}</span>
            </span>
            <p>
              {lang === 'ar'
                ? 'لا تتطلب باقة Google AI Studio المجانية إدخال بطاقة ائتمانية للبدء، ولن يتم سحب أي مبالغ أبداً إلا إذا قمت أنت بربط حساب فوترة (Billing Account) وترقية مشروعك يدوياً.'
                : 'Google AI Studio free tier does not require a credit card to start, and will never charge you unless you manually attach a GCP billing account.'}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
