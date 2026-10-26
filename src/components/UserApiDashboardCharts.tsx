/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Layers,
  Sparkles,
  Calculator,
  Sliders,
  DollarSign,
  Zap,
  Info,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Filter,
  Clapperboard,
  PenTool,
  Lightbulb,
  Image as ImageIcon,
  Film,
  Video,
  Database,
  Eye,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  RefreshCw
} from 'lucide-react';
import { AppLanguage, PromptHistoryItem } from '../types';

interface UserApiDashboardChartsProps {
  lang: AppLanguage;
  history?: PromptHistoryItem[];
  onNavigateTab?: (tab: string) => void;
}

export type Currency = 'USD' | 'SAR' | 'AED' | 'EUR';
export type ModelChoice = 'flash' | 'pro';

interface ToolMetric {
  id: string;
  tabKey: string;
  nameAr: string;
  nameEn: string;
  icon: any;
  color: string;
  gradient: string;
  bgColor: string;
  avgInputTokens: number;
  avgOutputTokens: number;
  defaultSharePercent: number; // default proportion of user activity
  descriptionAr: string;
  descriptionEn: string;
  tipAr: string;
  tipEn: string;
}

const TOOLS_CONFIG: ToolMetric[] = [
  {
    id: 'cinema',
    tabKey: 'cinema',
    nameAr: 'استوديو السينما والأفلام',
    nameEn: 'Cinema Movie Studio',
    icon: Clapperboard,
    color: '#eab308', // amber
    gradient: 'from-amber-500 to-amber-600',
    bgColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    avgInputTokens: 750,
    avgOutputTokens: 2200,
    defaultSharePercent: 28,
    descriptionAr: 'توليد سيناريوهات كاملة، حوارات شخصيات، وضبط حركة الكاميرا ومثبتات الوجه.',
    descriptionEn: 'Full cinematic scripts, multi-character dialogues, and face anchor consistency.',
    tipAr: 'يستهلك أكبر عدد من مخرجات النصوص بسبب تفصيل الحوارات والمشاهد المتعددة.',
    tipEn: 'Highest output token consumption due to multi-scene character dialogues.'
  },
  {
    id: 'builder',
    tabKey: 'builder',
    nameAr: 'مُهندس ومُحسّن الأوامر',
    nameEn: 'Prompt Builder & Enhancer',
    icon: PenTool,
    color: '#c29b40', // gold
    gradient: 'from-[#c29b40] to-[#916a24]',
    bgColor: 'bg-[#c29b40]/10 text-[#916a24] dark:text-[#ecd197] border-[#c29b40]/20',
    avgInputTokens: 380,
    avgOutputTokens: 780,
    defaultSharePercent: 24,
    descriptionAr: 'صياغة وتحسين الأوامر النصية، حساب درجات الجودة، واستخراج المتغيرات الديناميكية.',
    descriptionEn: 'Prompt refinement, quality scoring, and dynamic bracket variables.',
    tipAr: 'استهلاك متوازن جداً، وتكلفته منخفضة بفضل الإيجاز وسرعة المعالجة.',
    tipEn: 'Very balanced token footprint, rapid response time and low cost.'
  },
  {
    id: 'ideas',
    tabKey: 'ideas',
    nameAr: 'مُولّد حزم الأفكار الإبداعية',
    nameEn: 'Creative Ideas Generator',
    icon: Lightbulb,
    color: '#06b6d4', // cyan
    gradient: 'from-cyan-500 to-cyan-600',
    bgColor: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
    avgInputTokens: 420,
    avgOutputTokens: 1150,
    defaultSharePercent: 16,
    descriptionAr: 'توليد أفكار مبتكرة في مجالات متعددة كالتصوير السينمائي، المنتجات، والخيال.',
    descriptionEn: 'Generating fresh inspiration packs across film, product, and surrealism.',
    tipAr: 'يولد حزم أفكار مجمعة في استدعاء واحد مما يوفر 40% من تكلفة الطلبات المنفصلة.',
    tipEn: 'Batched prompt output in single request saves ~40% over individual calls.'
  },
  {
    id: 'reverse',
    tabKey: 'reverse',
    nameAr: 'الهندسة العكسية للصور',
    nameEn: 'Prompt Reverser (Vision)',
    icon: ImageIcon,
    color: '#8b5cf6', // purple
    gradient: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    avgInputTokens: 1250, // Image tokens + prompt instructions
    avgOutputTokens: 650,
    defaultSharePercent: 12,
    descriptionAr: 'تحليل الصور بصرياً عبر قدرات Gemini Vision لاستخراج النص الفني وأسلوب الإضاءة.',
    descriptionEn: 'Multimodal vision analysis extracting artistic descriptors and lighting styles.',
    tipAr: 'رموز الإدخال أعلى بسبب حجم بيانات بكسلات الصورة المدخلة للنموذج.',
    tipEn: 'Higher input tokens count because image tiles are vectorized into visual tokens.'
  },
  {
    id: 'sequence',
    tabKey: 'sequence',
    nameAr: 'سلاسل المشاهد والقصص المصورة',
    nameEn: 'Prompt Sequence & Storyboard',
    icon: Film,
    color: '#ec4899', // pink
    gradient: 'from-pink-500 to-pink-600',
    bgColor: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
    avgInputTokens: 580,
    avgOutputTokens: 1450,
    defaultSharePercent: 10,
    descriptionAr: 'بناء 4 مشاهد متصلة زمنياً مع الحفاظ التام على هوية الشخصية والبيئة المحيطة.',
    descriptionEn: '4-step narrative visual sequence with persistent character anchor.',
    tipAr: 'يضمن تكرار وصف الشخصية في الرموز لضمان الثبات البصري بين اللقطات.',
    tipEn: 'Replicates character key descriptors across outputs to ensure seed consistency.'
  },
  {
    id: 'drone',
    tabKey: 'drone',
    nameAr: 'تصميم حركة الفيديو والدرون',
    nameEn: 'Drone & Video Motion Designer',
    icon: Video,
    color: '#10b981', // emerald
    gradient: 'from-emerald-500 to-emerald-600',
    bgColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    avgInputTokens: 420,
    avgOutputTokens: 820,
    defaultSharePercent: 6,
    descriptionAr: 'حساب مسار الكاميرا (FPV, Orbit, Tilt) ومعدل الإطارات وأوامر منصات Runway و Luma.',
    descriptionEn: 'Camera motion vector parameters (FPV, Orbit, Tilt) tuned for video generators.',
    tipAr: 'أوامر مكثفة ودقيقة تقنياً تعطي نتائج سينمائية باستهلاك منخفض.',
    tipEn: 'Technically compact motion commands give cinema results with low token overhead.'
  },
  {
    id: 'diffusiondb',
    tabKey: 'diffusiondb',
    nameAr: 'دليل DiffusionDB وفحص الأوامر',
    nameEn: 'DiffusionDB & Parameter Tuning',
    icon: Database,
    color: '#3b82f6', // blue
    gradient: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    avgInputTokens: 320,
    avgOutputTokens: 620,
    defaultSharePercent: 4,
    descriptionAr: 'البحث في أنماط المبدعين، الكلمات السلبية (Negative Prompts)، والأبعاد القياسية.',
    descriptionEn: 'Exploring creator styles, negative prompts library, and aspect ratios.',
    tipAr: 'استهلاك خفيف جداً يركز على تصنيف الأسلوب ونقاء الكلمات الدلالية.',
    tipEn: 'Lightweight queries focused on taxonomy categorization and negative tags.'
  }
];

export default function UserApiDashboardCharts({
  lang,
  history = [],
  onNavigateTab
}: UserApiDashboardChartsProps) {
  // Configurable controls
  const [totalMonthlyRequests, setTotalMonthlyRequests] = useState<number>(3000);
  const [model, setModel] = useState<ModelChoice>('flash');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [selectedToolId, setSelectedToolId] = useState<string>('all');
  const [chartView, setChartView] = useState<'cost' | 'tokens' | 'requests'>('cost');
  const [copied, setCopied] = useState<boolean>(false);
  const [customShares, setCustomShares] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    TOOLS_CONFIG.forEach(t => { map[t.id] = t.defaultSharePercent; });
    return map;
  });

  const isAr = lang === 'ar';

  // Currency definition
  const currencyRates: Record<Currency, { symbol: string; rate: number; nameAr: string; nameEn: string }> = {
    USD: { symbol: '$', rate: 1, nameAr: 'دولار أمريكي', nameEn: 'US Dollar' },
    SAR: { symbol: 'ر.س', rate: 3.75, nameAr: 'ريال سعودي', nameEn: 'Saudi Riyal' },
    AED: { symbol: 'د.إ', rate: 3.67, nameAr: 'درهم إماراتي', nameEn: 'UAE Dirham' },
    EUR: { symbol: '€', rate: 0.92, nameAr: 'يورو أوروبي', nameEn: 'Euro' },
  };

  const curr = currencyRates[currency];

  // Official Google AI Studio Gemini Token Pricing (per 1,000,000 tokens)
  const pricingModel = useMemo(() => {
    if (model === 'flash') {
      return {
        nameAr: 'Gemini 2.5 / 1.5 Flash (سريع، اقتصادي، موصى به)',
        nameEn: 'Gemini 2.5 / 1.5 Flash (Fast, Economical, Recommended)',
        inputPerMillion: 0.075,
        outputPerMillion: 0.30,
        freeQuotaDaily: 1500, // 1500 free requests per day in AI Studio
        freeQuotaMonthly: 45000,
      };
    } else {
      return {
        nameAr: 'Gemini 1.5 Pro (نموذج متقدم، فائق الذكاء)',
        nameEn: 'Gemini 1.5 Pro (Advanced High Intelligence)',
        inputPerMillion: 1.25,
        outputPerMillion: 5.00,
        freeQuotaDaily: 50,
        freeQuotaMonthly: 1500,
      };
    }
  }, [model]);

  // Actual history metrics
  const actualUsageSummary = useMemo(() => {
    const totalCount = history.length;
    const toolCounts: Record<string, number> = {};
    history.forEach(item => {
      const cat = (item.category || item.actionType || 'builder').toLowerCase();
      let matchedId = 'builder';
      if (cat.includes('cinema') || cat.includes('movie')) matchedId = 'cinema';
      else if (cat.includes('idea')) matchedId = 'ideas';
      else if (cat.includes('reverse') || cat.includes('image')) matchedId = 'reverse';
      else if (cat.includes('sequence') || cat.includes('story')) matchedId = 'sequence';
      else if (cat.includes('drone') || cat.includes('video')) matchedId = 'drone';
      else if (cat.includes('diffusion')) matchedId = 'diffusiondb';
      toolCounts[matchedId] = (toolCounts[matchedId] || 0) + 1;
    });
    return { totalCount, toolCounts };
  }, [history]);

  // Calculate detailed per-tool breakdown
  const toolStats = useMemo(() => {
    const dailyRequests = Math.round(totalMonthlyRequests / 30);
    const isUnderFreeQuota = totalMonthlyRequests <= pricingModel.freeQuotaMonthly;

    return TOOLS_CONFIG.map(tool => {
      const share = customShares[tool.id] ?? tool.defaultSharePercent;
      const monthlyReqs = Math.round((totalMonthlyRequests * share) / 100);
      const dailyReqs = Math.round(monthlyReqs / 30);

      const monthlyInputTokens = monthlyReqs * tool.avgInputTokens;
      const monthlyOutputTokens = monthlyReqs * tool.avgOutputTokens;
      const totalTokens = monthlyInputTokens + monthlyOutputTokens;

      // Base pay-as-you-go cost in USD
      const costInputUSD = (monthlyInputTokens / 1_000_000) * pricingModel.inputPerMillion;
      const costOutputUSD = (monthlyOutputTokens / 1_000_000) * pricingModel.outputPerMillion;
      const rawCostUSD = costInputUSD + costOutputUSD;

      // If within Google AI Studio free tier quota, effective cost is 0
      const actualCostUSD = isUnderFreeQuota ? 0 : rawCostUSD;
      const actualCostConverted = actualCostUSD * curr.rate;
      const rawCostConverted = rawCostUSD * curr.rate;

      const historyCount = actualUsageSummary.toolCounts[tool.id] || 0;

      return {
        ...tool,
        share,
        monthlyReqs,
        dailyReqs,
        monthlyInputTokens,
        monthlyOutputTokens,
        totalTokens,
        rawCostUSD,
        actualCostUSD,
        actualCostConverted,
        rawCostConverted,
        historyCount
      };
    });
  }, [totalMonthlyRequests, customShares, pricingModel, curr.rate, actualUsageSummary]);

  // Overall totals
  const overallTotals = useMemo(() => {
    const totalTokens = toolStats.reduce((sum, t) => sum + t.totalTokens, 0);
    const totalInputTokens = toolStats.reduce((sum, t) => sum + t.monthlyInputTokens, 0);
    const totalOutputTokens = toolStats.reduce((sum, t) => sum + t.monthlyOutputTokens, 0);
    const totalRawCostUSD = toolStats.reduce((sum, t) => sum + t.rawCostUSD, 0);
    const isUnderFreeQuota = totalMonthlyRequests <= pricingModel.freeQuotaMonthly;
    const totalActualCostUSD = isUnderFreeQuota ? 0 : totalRawCostUSD;

    const freeTierPercent = Math.min(100, Math.round((totalMonthlyRequests / pricingModel.freeQuotaMonthly) * 100));

    return {
      totalTokens,
      totalInputTokens,
      totalOutputTokens,
      totalRawCostUSD,
      totalActualCostUSD,
      totalActualCostConverted: totalActualCostUSD * curr.rate,
      totalRawCostConverted: totalRawCostUSD * curr.rate,
      isUnderFreeQuota,
      freeTierPercent,
      dailyRequests: Math.round(totalMonthlyRequests / 30),
      remainingFreeReqs: Math.max(0, pricingModel.freeQuotaMonthly - totalMonthlyRequests)
    };
  }, [toolStats, totalMonthlyRequests, pricingModel, curr.rate]);

  // Max value for bar scaling
  const maxBarValue = useMemo(() => {
    if (chartView === 'cost') {
      const maxCost = Math.max(...toolStats.map(t => t.rawCostConverted), 0.01);
      return maxCost;
    }
    if (chartView === 'tokens') {
      const maxTok = Math.max(...toolStats.map(t => t.totalTokens), 1000);
      return maxTok;
    }
    return Math.max(...toolStats.map(t => t.monthlyReqs), 10);
  }, [toolStats, chartView]);

  // Filtered tools or selected tool
  const displayedTools = useMemo(() => {
    if (selectedToolId === 'all') return toolStats;
    return toolStats.filter(t => t.id === selectedToolId);
  }, [toolStats, selectedToolId]);

  // Copy report
  const handleCopyReport = () => {
    const reportText = `
📊 ${isAr ? 'تقرير استهلاك وتحليل تكاليف Gemini API' : 'Gemini API Usage & Cost Analytics Report'}
-------------------------------------------------------
⚡ ${isAr ? 'النموذج المختار' : 'Model'}: ${isAr ? pricingModel.nameAr : pricingModel.nameEn}
📅 ${isAr ? 'إجمالي الطلبات الشهرية' : 'Total Monthly Requests'}: ${totalMonthlyRequests.toLocaleString()} (${overallTotals.dailyRequests} ${isAr ? 'طلب/يوم' : 'req/day'})
🪙 ${isAr ? 'إجمالي الرموز المستهلكة' : 'Total Tokens'}: ${(overallTotals.totalTokens / 1_000_000).toFixed(2)}M Tokens
🎁 ${isAr ? 'حصة Google AI Studio المجانية' : 'Google Free Tier Status'}: ${overallTotals.isUnderFreeQuota ? (isAr ? 'مغطى مجاناً بالكامل (0.00)' : '100% Free Quota Covered ($0.00)') : (isAr ? 'فوق الحصة المجانية' : 'Exceeds Free Quota')}
💵 ${isAr ? 'التكلفة الشهرية الفعلية' : 'Estimated Monthly Invoice'}: ${curr.symbol} ${overallTotals.totalActualCostConverted.toFixed(2)}
-------------------------------------------------------
${isAr ? 'تفصيل استهلاك الأدوات' : 'Tools Breakdown'}:
${toolStats.map(t => `• ${isAr ? t.nameAr : t.nameEn}: ${t.monthlyReqs.toLocaleString()} ${isAr ? 'طلب' : 'reqs'} | ${(t.totalTokens / 1000).toFixed(0)}K tokens | ${curr.symbol} ${t.rawCostConverted.toFixed(3)}`).join('\n')}
-------------------------------------------------------
${isAr ? 'تم الإنشاء بواسطة منصة عرب برومبت' : 'Generated by ArabPrompt Platform'}
    `.trim();

    navigator.clipboard.writeText(reportText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  return (
    <div className="space-y-8 animate-fade-in text-stone-900 dark:text-stone-100" id="user-api-dashboard-charts">
      
      {/* 1. Header Card with Title, Controls, and Summary Chips */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200/90 dark:border-stone-800 shadow-sm relative overflow-hidden">
        {/* Subtle accent glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#c29b40]/10 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-stone-100 dark:border-stone-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c29b40]/10 border border-[#c29b40]/20 text-[#916a24] dark:text-[#ecd197] text-xs font-bold mb-3">
              <BarChart3 className="w-3.5 h-3.5 animate-pulse" />
              <span>{isAr ? 'لوحة تحكم استهلاك الـ API والرسوم البيانية' : 'API Usage Analytics & Visual Charts'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-sans tracking-tight">
              {isAr ? 'تحليل استهلاك النماذج وتوزيع التكاليف' : 'Model Consumption & Cost Distribution'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1 max-w-2xl font-medium leading-relaxed">
              {isAr
                ? 'استكشف رسوماً بيانية تفاعلية تحسب استهلاك الرموز (Tokens)، التكلفة الشهرية المحسوبة، وتفاصيل الحصة المجانية لكل ميزة وأداة على حدة.'
                : 'Explore interactive visual charts detailing token consumption, projected monthly invoices, and per-tool breakdowns with free-tier tracking.'}
            </p>
          </div>

          {/* Quick Actions & Currency Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Currency selector */}
            <div className="inline-flex items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-2xl border border-stone-200 dark:border-stone-700">
              {(['USD', 'SAR', 'AED', 'EUR'] as Currency[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    currency === c
                      ? 'bg-white dark:bg-stone-900 text-[#916a24] dark:text-amber-400 shadow-sm border border-stone-200 dark:border-stone-700'
                      : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-100'
                  }`}
                >
                  {currencyRates[c].symbol} {c}
                </button>
              ))}
            </div>

            {/* Copy report button */}
            <button
              onClick={handleCopyReport}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-bold border border-stone-200 dark:border-stone-700 transition cursor-pointer"
              title={isAr ? 'نسخ تقرير التحليل' : 'Copy Analysis Report'}
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ التقرير' : 'Copy Report')}</span>
            </button>
          </div>
        </div>

        {/* 2. Top Summary Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          
          {/* Card 1: Estimated Monthly Invoice */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 relative">
            <div className="flex items-center justify-between text-xs font-bold text-amber-700 dark:text-amber-400 mb-1">
              <span>{isAr ? 'الفاتورة الشهرية المتوقعة' : 'Est. Monthly Invoice'}</span>
              <DollarSign className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-sans text-stone-900 dark:text-white flex items-baseline gap-1">
              <span>{curr.symbol}</span>
              <span>{overallTotals.totalActualCostConverted.toFixed(2)}</span>
            </div>
            <div className="mt-2 text-[11px] font-medium flex items-center gap-1">
              {overallTotals.isUnderFreeQuota ? (
                <span className="text-emerald-700 dark:text-emerald-400 font-bold inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {isAr ? '0.00 مجاناً (ضمن كوتة Google المجانية)' : 'Free $0.00 (In Google Free Quota)'}
                </span>
              ) : (
                <span className="text-amber-700 dark:text-amber-400 font-bold">
                  {isAr ? `توفير تلقائي بقيمة ${curr.symbol} ${(pricingModel.freeQuotaMonthly * (pricingModel.inputPerMillion + pricingModel.outputPerMillion) / 1000 * curr.rate).toFixed(1)}` : 'Pay as you go'}
                </span>
              )}
            </div>
          </div>

          {/* Card 2: Total Monthly Requests */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-800">
            <div className="flex items-center justify-between text-xs font-bold text-stone-500 dark:text-stone-400 mb-1">
              <span>{isAr ? 'حجم الطلبات التقديري' : 'Monthly Requests'}</span>
              <Zap className="w-4 h-4 text-[#c29b40]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-sans text-stone-900 dark:text-white">
              {totalMonthlyRequests.toLocaleString()}
            </div>
            <div className="mt-2 text-[11px] text-stone-500 dark:text-stone-400 font-medium">
              ≈ {overallTotals.dailyRequests.toLocaleString()} {isAr ? 'طلب في اليوم الواحد' : 'requests per day'}
            </div>
          </div>

          {/* Card 3: Free Tier Quota Progress */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">
              <span>{isAr ? 'حصة الذكاء الاصطناعي المجانية' : 'Google Free Tier Quota'}</span>
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-sans text-emerald-700 dark:text-emerald-400">
              {overallTotals.freeTierPercent}%
            </div>
            <div className="mt-2">
              <div className="w-full bg-stone-200 dark:bg-stone-700 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    overallTotals.freeTierPercent >= 100 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, overallTotals.freeTierPercent)}%` }}
                />
              </div>
              <p className="text-[10px] text-emerald-800 dark:text-emerald-300 font-medium mt-1">
                {overallTotals.isUnderFreeQuota
                  ? (isAr ? `متبقي ${overallTotals.remainingFreeReqs.toLocaleString()} طلب مجاني هذا الشهر` : `${overallTotals.remainingFreeReqs.toLocaleString()} free reqs remaining`)
                  : (isAr ? 'تجاوزت الحصة المجانية، يحاسب بالاستهلاك' : 'Exceeded free tier, pay-per-use')}
              </p>
            </div>
          </div>

          {/* Card 4: Total Token Volume */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-800">
            <div className="flex items-center justify-between text-xs font-bold text-stone-500 dark:text-stone-400 mb-1">
              <span>{isAr ? 'إجمالي الرموز (Tokens)' : 'Total Tokens'}</span>
              <Layers className="w-4 h-4 text-cyan-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-sans text-stone-900 dark:text-white">
              {(overallTotals.totalTokens / 1_000_000).toFixed(2)}M
            </div>
            <div className="mt-2 text-[11px] text-stone-500 dark:text-stone-400 font-medium flex items-center justify-between">
              <span>{isAr ? 'مدخلات:' : 'In:'} {(overallTotals.totalInputTokens / 1_000_000).toFixed(2)}M</span>
              <span>{isAr ? 'مخرجات:' : 'Out:'} {(overallTotals.totalOutputTokens / 1_000_000).toFixed(2)}M</span>
            </div>
          </div>

        </div>

        {/* 3. Interactive Request Slider & Model Picker */}
        <div className="mt-6 pt-6 border-t border-stone-100 dark:border-stone-800 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Slider */}
          <div className="md:col-span-7 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-stone-700 dark:text-stone-300">
              <label htmlFor="req-slider" className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#c29b40]" />
                <span>{isAr ? 'عدّل عدد الطلبات الشهرية المتوقعة:' : 'Adjust projected monthly requests:'}</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="50"
                  max="100000"
                  step="50"
                  value={totalMonthlyRequests}
                  onChange={(e) => setTotalMonthlyRequests(Math.max(10, Math.min(200000, Number(e.target.value) || 0)))}
                  className="w-24 text-center px-2 py-1 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-black text-xs text-stone-900 dark:text-white"
                />
                <span className="text-stone-500 text-xs font-bold">{isAr ? 'طلب/شهر' : 'req/mo'}</span>
              </div>
            </div>

            <input
              id="req-slider"
              type="range"
              min="100"
              max="60000"
              step="100"
              value={totalMonthlyRequests}
              onChange={(e) => setTotalMonthlyRequests(Number(e.target.value))}
              className="w-full accent-[#c29b40] cursor-pointer h-2 bg-stone-200 dark:bg-stone-700 rounded-lg"
            />

            {/* Preset shortcuts */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-bold text-stone-400">{isAr ? 'نماذج سريعة:' : 'Quick Presets:'}</span>
              {[
                { label: isAr ? 'هادئ (500)' : 'Light (500)', val: 500 },
                { label: isAr ? 'نشط (3,000)' : 'Active (3k)', val: 3000 },
                { label: isAr ? 'استوديو (15,000)' : 'Studio (15k)', val: 15000 },
                { label: isAr ? 'أقصى مجاني (45,000)' : 'Max Free (45k)', val: 45000 },
              ].map((p) => (
                <button
                  key={p.val}
                  onClick={() => setTotalMonthlyRequests(p.val)}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    totalMonthlyRequests === p.val
                      ? 'bg-[#c29b40] text-white shadow-xs'
                      : 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Model Switcher */}
          <div className="md:col-span-5 bg-stone-50 dark:bg-stone-800/80 p-3.5 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-2">
            <span className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#c29b40]" />
              <span>{isAr ? 'نموذج الذكاء الاصطناعي:' : 'AI Model Tier:'}</span>
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setModel('flash')}
                className={`p-2 rounded-xl text-left rtl:text-right transition cursor-pointer border ${
                  model === 'flash'
                    ? 'bg-white dark:bg-stone-900 border-[#c29b40] text-[#916a24] dark:text-amber-400 shadow-sm ring-1 ring-[#c29b40]/30'
                    : 'bg-transparent border-transparent hover:bg-stone-200/50 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-400'
                }`}
              >
                <div className="text-xs font-black">Gemini Flash</div>
                <div className="text-[10px] text-stone-500 dark:text-stone-400">
                  {isAr ? '1,500 طلب/يوم مجاناً' : '1,500 req/day free'}
                </div>
              </button>

              <button
                onClick={() => setModel('pro')}
                className={`p-2 rounded-xl text-left rtl:text-right transition cursor-pointer border ${
                  model === 'pro'
                    ? 'bg-white dark:bg-stone-900 border-[#c29b40] text-[#916a24] dark:text-amber-400 shadow-sm ring-1 ring-[#c29b40]/30'
                    : 'bg-transparent border-transparent hover:bg-stone-200/50 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-400'
                }`}
              >
                <div className="text-xs font-black">Gemini Pro</div>
                <div className="text-[10px] text-stone-500 dark:text-stone-400">
                  {isAr ? '50 طلب/يوم مجاناً' : '50 req/day free'}
                </div>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* 4. Chart Views & Tool Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Metric Selector (Cost vs Tokens vs Requests) */}
        <div className="flex items-center gap-1.5 bg-stone-200/70 dark:bg-stone-800 p-1 rounded-2xl border border-stone-200 dark:border-stone-700">
          <button
            onClick={() => setChartView('cost')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              chartView === 'cost'
                ? 'bg-white dark:bg-stone-900 text-[#916a24] dark:text-amber-400 shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>{isAr ? 'الرسم البياني للتكلفة' : 'Cost Distribution'}</span>
          </button>

          <button
            onClick={() => setChartView('tokens')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              chartView === 'tokens'
                ? 'bg-white dark:bg-stone-900 text-[#916a24] dark:text-amber-400 shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isAr ? 'استهلاك الرموز (Tokens)' : 'Token Consumption'}</span>
          </button>

          <button
            onClick={() => setChartView('requests')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              chartView === 'requests'
                ? 'bg-white dark:bg-stone-900 text-[#916a24] dark:text-amber-400 shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{isAr ? 'توزيع الطلبات' : 'Request Volume'}</span>
          </button>
        </div>

        {/* Tool Filter Dropdown / All Button */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-stone-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>{isAr ? 'تصفية حسب الأداة:' : 'Filter Tool:'}</span>
          </span>
          <select
            value={selectedToolId}
            onChange={(e) => setSelectedToolId(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-800 dark:text-stone-200 cursor-pointer shadow-xs focus:ring-2 focus:ring-[#c29b40]/30"
          >
            <option value="all">{isAr ? '✨ جميع الأدوات والميزات معاً' : '✨ All Features & Tools'}</option>
            {TOOLS_CONFIG.map((t) => (
              <option key={t.id} value={t.id}>
                {isAr ? t.nameAr : t.nameEn}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* 5. Main Visual Bar Chart (Interactive Responsive Bars) */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200/90 dark:border-stone-800 shadow-sm space-y-6">
        
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2 font-bold text-sm text-stone-800 dark:text-stone-200">
            <BarChart3 className="w-4 h-4 text-[#c29b40]" />
            <span>
              {chartView === 'cost' && (isAr ? 'مقارنة التكلفة الشهرية التقديرية لكل ميزة' : 'Monthly Cost Comparison by Feature')}
              {chartView === 'tokens' && (isAr ? 'مقارنة استهلاك الرموز (Tokens) الإجمالي' : 'Total Token Footprint by Feature')}
              {chartView === 'requests' && (isAr ? 'توزيع عدد الاستدعاءات الشهرية' : 'Monthly Request Count by Feature')}
            </span>
          </div>

          <span className="text-xs text-stone-500 font-medium">
            {chartView === 'cost' && `${curr.symbol} (${curr.nameAr})`}
            {chartView === 'tokens' && (isAr ? 'رمز (Token)' : 'Tokens')}
            {chartView === 'requests' && (isAr ? 'طلب استدعاء' : 'Requests')}
          </span>
        </div>

        {/* Bars Container */}
        <div className="space-y-4">
          {displayedTools.map((tool) => {
            const Icon = tool.icon;
            
            // Calculate proportional width
            let currentVal = 0;
            let displayVal = '';
            
            if (chartView === 'cost') {
              currentVal = tool.rawCostConverted;
              displayVal = `${curr.symbol} ${tool.rawCostConverted.toFixed(2)}`;
            } else if (chartView === 'tokens') {
              currentVal = tool.totalTokens;
              displayVal = `${(tool.totalTokens / 1000).toLocaleString()}K`;
            } else {
              currentVal = tool.monthlyReqs;
              displayVal = `${tool.monthlyReqs.toLocaleString()} ${isAr ? 'طلب' : 'reqs'}`;
            }

            const barPercent = Math.max(8, Math.min(100, (currentVal / maxBarValue) * 100));

            return (
              <div 
                key={tool.id} 
                className="group p-3 sm:p-4 rounded-2xl bg-stone-50 hover:bg-stone-100/80 dark:bg-stone-800/40 dark:hover:bg-stone-800/80 border border-stone-200/60 dark:border-stone-800 transition-all"
              >
                {/* Tool Title & Quick Numbers */}
                <div className="flex items-center justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl ${tool.bgColor}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
                        <span>{isAr ? tool.nameAr : tool.nameEn}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300">
                          {tool.share}% {isAr ? 'من النشاط' : 'activity'}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 hidden sm:block">
                        {isAr ? tool.descriptionAr : tool.descriptionEn}
                      </p>
                    </div>
                  </div>

                  <div className="text-right rtl:text-left shrink-0">
                    <div className="text-xs sm:text-sm font-black text-stone-900 dark:text-white font-mono">
                      {displayVal}
                    </div>
                    <div className="text-[10px] text-stone-400 font-medium">
                      {overallTotals.isUnderFreeQuota && chartView === 'cost' ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          {isAr ? '0.00 (مجاني)' : '0.00 (Free)'}
                        </span>
                      ) : (
                        `${tool.monthlyReqs.toLocaleString()} ${isAr ? 'استدعاء' : 'calls'}`
                      )}
                    </div>
                  </div>
                </div>

                {/* The Visual Bar */}
                <div className="w-full bg-stone-200 dark:bg-stone-700/60 h-3.5 rounded-full overflow-hidden p-0.5 shadow-inner">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${tool.gradient} transition-all duration-700 group-hover:brightness-110 shadow-sm`}
                    style={{ width: `${barPercent}%` }}
                  />
                </div>

                {/* Sub-bar token breakdown info */}
                <div className="flex flex-wrap items-center justify-between text-[10px] text-stone-500 dark:text-stone-400 mt-2 pt-1 font-mono">
                  <span>
                    📥 {isAr ? 'متوسط المدخلات:' : 'Avg In:'} {tool.avgInputTokens.toLocaleString()} tokens
                  </span>
                  <span>
                    📤 {isAr ? 'متوسط المخرجات:' : 'Avg Out:'} {tool.avgOutputTokens.toLocaleString()} tokens
                  </span>
                  <span>
                    ⚡ {isAr ? 'تكلفة الألف استدعاء:' : 'Cost per 1k:'} {curr.symbol} {(((tool.avgInputTokens * 1000 / 1_000_000) * pricingModel.inputPerMillion + (tool.avgOutputTokens * 1000 / 1_000_000) * pricingModel.outputPerMillion) * curr.rate).toFixed(3)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Free Quota Banner Note */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500 text-white shadow-sm shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-emerald-900 dark:text-emerald-300">
                {isAr ? 'ميزة مجانية حصرية من Google AI Studio' : 'Official Google AI Studio Free Tier'}
              </h4>
              <p className="text-xs text-emerald-800/80 dark:text-emerald-400/90 font-medium leading-relaxed">
                {isAr
                  ? `أنت تحصل على حتى ${pricingModel.freeQuotaDaily.toLocaleString()} طلب يومياً (ما يعادل ${pricingModel.freeQuotaMonthly.toLocaleString()} طلب شهرياً) بدون الحاجة لإضافة بطاقة ائتمان.`
                  : `You receive up to ${pricingModel.freeQuotaDaily.toLocaleString()} daily requests (${pricingModel.freeQuotaMonthly.toLocaleString()}/mo) completely free of charge.`}
              </p>
            </div>
          </div>

          <div className="shrink-0 self-end sm:self-center">
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-black shadow-xs">
              <span>{isAr ? '0.00$ مجاني تماماً' : '$0.00 Free Tier'}</span>
            </span>
          </div>
        </div>

      </div>

      {/* 6. Detailed Per-Tool Breakdown Cards (مع إمكانية عرض تفاصيل الاستهلاك لكل ميزة على حدة) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#c29b40]" />
            <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 font-sans">
              {isAr ? 'تفاصيل استهلاك كل أداة وميزة على حدة' : 'Detailed Per-Feature Consumption Breakdown'}
            </h3>
          </div>
          <span className="text-xs text-stone-500 font-medium">
            {displayedTools.length} {isAr ? 'ميزات معروضة' : 'features displayed'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200/90 dark:border-stone-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-stone-100 dark:border-stone-800">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-2xl ${tool.bgColor} border`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-stone-900 dark:text-stone-100">
                          {isAr ? tool.nameAr : tool.nameEn}
                        </h4>
                        <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">
                          {tool.tabKey} • {tool.share}% {isAr ? 'من الحجم العام' : 'of traffic'}
                        </span>
                      </div>
                    </div>

                    {/* Navigation shortcut */}
                    {onNavigateTab && (
                      <button
                        onClick={() => onNavigateTab(tool.tabKey)}
                        className="p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition cursor-pointer"
                        title={isAr ? `الانتقال إلى ${tool.nameAr}` : `Go to ${tool.nameEn}`}
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Metrics 3-column stats */}
                  <div className="grid grid-cols-3 gap-2 py-4 text-center">
                    <div className="p-2 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60">
                      <div className="text-[10px] font-bold text-stone-500 dark:text-stone-400">
                        {isAr ? 'الطلبات' : 'Requests'}
                      </div>
                      <div className="text-xs sm:text-sm font-black text-stone-900 dark:text-white mt-0.5">
                        {tool.monthlyReqs.toLocaleString()}
                      </div>
                      <div className="text-[9px] text-stone-400">
                        {tool.dailyReqs}/day
                      </div>
                    </div>

                    <div className="p-2 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60">
                      <div className="text-[10px] font-bold text-stone-500 dark:text-stone-400">
                        {isAr ? 'الرموز' : 'Tokens'}
                      </div>
                      <div className="text-xs sm:text-sm font-black text-stone-900 dark:text-white mt-0.5">
                        {(tool.totalTokens / 1000).toFixed(0)}K
                      </div>
                      <div className="text-[9px] text-stone-400">
                        {Math.round((tool.totalTokens / overallTotals.totalTokens) * 100)}% {isAr ? 'من الكل' : 'total'}
                      </div>
                    </div>

                    <div className="p-2 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                      <div className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
                        {isAr ? 'التكلفة' : 'Cost'}
                      </div>
                      <div className="text-xs sm:text-sm font-black text-stone-900 dark:text-white mt-0.5">
                        {curr.symbol} {tool.rawCostConverted.toFixed(2)}
                      </div>
                      <div className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">
                        {overallTotals.isUnderFreeQuota ? (isAr ? 'مغطى مجاناً' : 'Free tier') : `${curr.symbol} ${tool.actualCostConverted.toFixed(2)}`}
                      </div>
                    </div>
                  </div>

                  {/* Token details breakdown */}
                  <div className="space-y-1.5 text-xs text-stone-600 dark:text-stone-400 bg-stone-50 dark:bg-stone-800/40 p-3 rounded-2xl">
                    <div className="flex justify-between items-center text-[11px]">
                      <span>{isAr ? 'متوسط رموز المدخلات (Prompt):' : 'Avg Input Tokens:'}</span>
                      <span className="font-bold font-mono text-stone-900 dark:text-stone-200">{tool.avgInputTokens} tokens</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span>{isAr ? 'متوسط رموز المخرجات (AI Result):' : 'Avg Output Tokens:'}</span>
                      <span className="font-bold font-mono text-stone-900 dark:text-stone-200">{tool.avgOutputTokens} tokens</span>
                    </div>
                    {tool.historyCount > 0 && (
                      <div className="flex justify-between items-center text-[11px] pt-1 border-t border-stone-200/60 dark:border-stone-700/60 text-[#916a24] dark:text-[#ecd197]">
                        <span>{isAr ? 'استخدامك الفعلي المسجل:' : 'Your Real Recorded Prompts:'}</span>
                        <span className="font-bold font-mono">{tool.historyCount} {isAr ? 'عملية' : 'items'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Efficiency Tip */}
                <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-start gap-2 text-[11px] text-stone-500 dark:text-stone-400">
                  <Info className="w-3.5 h-3.5 text-[#c29b40] shrink-0 mt-0.5" />
                  <p className="leading-snug">
                    <strong className="text-stone-700 dark:text-stone-300 font-bold">
                      {isAr ? 'تحليل الكفاءة:' : 'Efficiency Tip:'}
                    </strong>{' '}
                    {isAr ? tool.tipAr : tool.tipEn}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7. Bottom Comparative Insights & Budget Planning */}
      <div className="bg-stone-900 text-stone-100 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-lg">
        <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 w-64 h-64 bg-[#c29b40]/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{isAr ? 'خطة إدارة الميزانية والنمو' : 'Budget & Scale Optimization'}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black font-sans">
              {isAr ? 'كيف تستفيد من أعلى جودة بأقل تكلفة؟' : 'Maximizing AI Quality with Minimal Cost'}
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 font-medium max-w-2xl leading-relaxed">
              {isAr
                ? 'نموذج Gemini Flash يمنحك استجابة فائقة السرعة مع توفير بنسبة 94% مقارنة بنماذج Pro. استخدم Flash لتوليد الأفكار وهندسة الأوامر، واستعن بنموذج Pro للسيناريوهات السينمائية المعقدة للحصول على التوازن الأمثل.'
                : 'Gemini Flash gives lightning-fast generation while reducing token spend by ~94% compared to Pro models. Blend Flash for ideas and builders, reserving Pro for complex multi-act cinema scripts.'}
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => {
                setModel('flash');
                setTotalMonthlyRequests(3000);
              }}
              className="px-4 py-2.5 rounded-2xl bg-[#c29b40] hover:bg-[#b38d35] text-stone-950 font-black text-xs transition shadow-sm cursor-pointer"
            >
              {isAr ? '⚡ ضبط التكوين الاقتصادي الأمثل' : '⚡ Set Optimal Free/Eco Tier'}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
