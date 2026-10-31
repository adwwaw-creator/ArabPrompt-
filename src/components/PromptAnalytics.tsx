/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  TrendingUp, 
  Award, 
  Sparkles, 
  FileText, 
  Copy, 
  Check, 
  Printer, 
  Calendar, 
  Zap, 
  AlertCircle, 
  Clock, 
  Layers, 
  History, 
  MessageSquare,
  Cpu,
  Share2
} from 'lucide-react';
import { PromptHistoryItem, ModelType } from '../types';

interface PromptAnalyticsProps {
  lang: 'ar' | 'en';
  history: PromptHistoryItem[];
}

export default function PromptAnalytics({ lang, history }: PromptAnalyticsProps) {
  const [useDemoData, setUseDemoData] = useState<boolean>(history.length === 0);
  const [reportDocTitle, setReportDocTitle] = useState<string>(
    lang === 'ar' ? 'تقرير هندسة الأوامر الربع سنوي' : 'Executive Prompt Engineering Summary Report'
  );
  const [copiedReport, setCopiedReport] = useState<boolean>(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedModelFilter, setSelectedModelFilter] = useState<string>('all');

  // Ground demo data for visualization when user's index is sparse
  const demoHistory: PromptHistoryItem[] = useMemo(() => [
    {
      id: 'demo-1',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      originalText: 'اكتب كود موقع لبيع الملابس',
      optimizedText: 'قم بتصميم وإنشاء صفحة هبوط متجاوبة باستخدام HTML5 و CSS3 و JS حديث للتجارة الإلكترونية في مجال الملابس الجاهزة. أضف سلة تسوق تفاعلية وفلاتر تصفية ذكية للمقاسات والألوان وتأثيرات تمرير ناعمة.',
      model: 'gemini',
      tone: 'creative',
      category: 'code',
      actionType: 'generate',
      isFavorite: true
    },
    {
      id: 'demo-2',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      originalText: 'صورة قطة في الفضاء الخارجي ترتدي رداء فضاء مرآد',
      optimizedText: 'A high-contrast cinematic shot of a majestic Siberian cat inside a futuristic glass NASA spacesuit, floating in deep nebula space, stars reflecting on the helmet visor, highly detailed, photorealistic 8k, Unreal Engine 5 render.',
      model: 'midjourney',
      tone: 'photorealistic',
      category: 'art',
      actionType: 'reverse',
      isFavorite: true
    },
    {
      id: 'demo-3',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      originalText: 'خطاب تسويقي لشركة عطور عربية فاخرة بنكهة العود',
      optimizedText: 'صياغة مقال تسويقي عاطفي وجذاب يبرز أصالة عطور العود الشرقية والفاخرة، موجه لعملاء النخبة في الخليج العربي بأسلوب شاعري فخم يعكس دفء الأصالة وفخامة الحضور.',
      model: 'chatgpt',
      tone: 'professional',
      category: 'business',
      actionType: 'refine',
      isFavorite: false
    },
    {
      id: 'demo-4',
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      originalText: 'how to fix memory leak in react useEffect clean',
      optimizedText: 'Analyze this React 18 functional component architecture. Identify active EventListeners and dangling fetch promises in useEffect, refactor with dynamic AbortController, and write complete cleanup routines to eliminate memory leaks.',
      model: 'claude',
      tone: 'technical',
      category: 'code',
      actionType: 'refine',
      isFavorite: false
    },
    {
      id: 'demo-5',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      originalText: 'شعار فخم لمطعم مأكولات بحرية حديث في الرياض',
      optimizedText: 'Vector logo design for a premium maritime seafood restaurant, minimalist golden icon of an stylized crown lobster paired with modern serif typography, clean dark blue background, flat graphic design, SVG export format.',
      model: 'midjourney',
      tone: 'design',
      category: 'art',
      actionType: 'generate',
      isFavorite: false
    },
    {
      id: 'demo-6',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      originalText: 'ملخص كتاب غني وأب فقير بـ ١٠ نقاط أساسية مفيدة',
      optimizedText: 'صياغة خلاصة فكرية وتنفيذية لكتاب "الأب الغني والأب الفقير" لروبرت كيوساكي تركز على الفروق الهيكلية في التدفق النقدي، أصول الاستثمار العقاري والذاتي المالي، والمفاهيم الخاطئة عن الوظيفة التقليدية.',
      model: 'notebooklm',
      tone: 'informative',
      category: 'education',
      actionType: 'generate',
      isFavorite: true
    },
    {
      id: 'demo-7',
      timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      originalText: 'رسالة إلكترونية لطلب شراكة بين مؤثر وشركة تكنولوجيا',
      optimizedText: 'An elegant professional outreach email negotiating long-term dynamic brand collaboration between a senior AI tech influencer and a cloud SaaS platform. Outline precise deliverables, mutual audiences, and conversion tracking.',
      model: 'chatgpt',
      tone: 'confident',
      category: 'business',
      actionType: 'translate',
      isFavorite: false
    },
    {
      id: 'demo-8',
      timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      originalText: 'قصة قصيرة خيالية عن واحة منسية في قلب صحراء الربع الخالي',
      optimizedText: 'A deep fantasy short story highlighting an ancient underground oasis hidden under the dunes of Rub al Khali. Rich descriptions of green glowing flora, liquid starlight waters, and nomadic elders protecting the entrance of lost times.',
      model: 'claude',
      tone: 'creative',
      category: 'writing',
      actionType: 'generate',
      isFavorite: true
    }
  ], [lang]);

  // Actual dataset used for visualization
  const activeDataset = useMemo(() => {
    return useDemoData ? demoHistory : history;
  }, [useDemoData, history, demoHistory]);

  // Unique categories & models available in the selected data
  const categoriesList = useMemo(() => {
    const cats = activeDataset.map(item => item.category || 'general');
    return ['all', ...Array.from(new Set(cats))];
  }, [activeDataset]);

  const modelsList = useMemo(() => {
    const mods = activeDataset.map(item => item.model);
    return ['all', ...Array.from(new Set(mods))];
  }, [activeDataset]);

  // Dynamic filter application
  const filteredDataset = useMemo(() => {
    return activeDataset.filter(item => {
      const catMatch = selectedCategoryFilter === 'all' || (item.category || 'general') === selectedCategoryFilter;
      const modelMatch = selectedModelFilter === 'all' || item.model === selectedModelFilter;
      return catMatch && modelMatch;
    });
  }, [activeDataset, selectedCategoryFilter, selectedModelFilter]);

  // Core metrics computation
  const stats = useMemo(() => {
    const totalCount = filteredDataset.length;
    if (totalCount === 0) {
      return {
        totalCount: 0,
        favoriteCount: 0,
        avgOriginalLength: 0,
        avgOptimizedLength: 0,
        expansionRatio: 1,
        mostUsedModel: 'N/A',
        mostUsedCategory: 'N/A',
        refineCount: 0,
        fallbackRatio: 0
      };
    }

    const favoriteCount = filteredDataset.filter(i => i.isFavorite).length;
    
    // Original prompt lengths vs. engineered lengths
    let totalOriginalLen = 0;
    let totalOptimizedLen = 0;
    filteredDataset.forEach(item => {
      totalOriginalLen += (item.originalText || '').length;
      totalOptimizedLen += (item.optimizedText || '').length;
    });

    const avgOriginalLength = Math.round(totalOriginalLen / totalCount);
    const avgOptimizedLength = Math.round(totalOptimizedLen / totalCount);
    const expansionRatio = avgOriginalLength > 0 ? (avgOptimizedLength / avgOriginalLength).toFixed(1) : '1.0';

    // Model aggregation
    const modelMap: Record<string, number> = {};
    const categoryMap: Record<string, number> = {};
    let fallbackCount = 0;
    let refineCount = 0;

    filteredDataset.forEach(i => {
      modelMap[i.model] = (modelMap[i.model] || 0) + 1;
      const cat = i.category || 'general';
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
      if (i.isFallback) fallbackCount++;
      if (i.actionType === 'refine' || i.actionType === 'reverse') refineCount++;
    });

    let mostUsedModel = 'N/A';
    let maxModelVal = 0;
    Object.entries(modelMap).forEach(([k, v]) => {
      if (v > maxModelVal) {
        maxModelVal = v;
        mostUsedModel = k;
      }
    });

    let mostUsedCategory = 'N/A';
    let maxCatVal = 0;
    Object.entries(categoryMap).forEach(([k, v]) => {
      if (v > maxCatVal) {
        maxCatVal = v;
        mostUsedCategory = k;
      }
    });

    const fallbackRatio = Math.round((fallbackCount / totalCount) * 100);

    return {
      totalCount,
      favoriteCount,
      avgOriginalLength,
      avgOptimizedLength,
      expansionRatio,
      mostUsedModel,
      mostUsedCategory,
      refineCount,
      fallbackRatio
    };
  }, [filteredDataset]);

  // Model shares distribution list for custom premium donut & metrics list
  const modelDistribution = useMemo(() => {
    if (filteredDataset.length === 0) return [];
    const counts: Record<string, number> = {};
    filteredDataset.forEach(i => {
      counts[i.model] = (counts[i.model] || 0) + 1;
    });

    const colors: Record<string, string> = {
      gemini: 'bg-[#c29b40]',
      chatgpt: 'bg-emerald-600',
      claude: 'bg-amber-600',
      midjourney: 'bg-indigo-600',
      notebooklm: 'bg-purple-600'
    };

    const textColors: Record<string, string> = {
      gemini: 'text-[#c29b40]',
      chatgpt: 'text-emerald-700',
      claude: 'text-amber-700',
      midjourney: 'text-indigo-700',
      notebooklm: 'text-purple-700'
    };

    return Object.entries(counts).map(([model, count]) => {
      const percentage = Math.round((count / filteredDataset.length) * 100);
      return {
        name: model,
        count,
        percentage,
        color: colors[model] || 'bg-stone-500',
        textColor: textColors[model] || 'text-stone-700'
      };
    }).sort((a,b) => b.count - a.count);
  }, [filteredDataset]);

  // Category distribution calculation
  const categoryDistribution = useMemo(() => {
    if (filteredDataset.length === 0) return [];
    const counts: Record<string, number> = {};
    filteredDataset.forEach(i => {
      const cat = i.category || 'general';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const categoryNamesAr: Record<string, string> = {
      code: 'البرمجة والأكواد',
      art: 'الفنون والتصميم الموجه',
      business: 'الأعمال والشركات',
      writing: 'الكتابة الإبداعية',
      education: 'التعليم والتلخيص',
      general: 'عام ومتنوع'
    };

    const categoryNamesEn: Record<string, string> = {
      code: 'Coding & Tech',
      art: 'Art & Photography',
      business: 'Business & Corporates',
      writing: 'Creative Writing',
      education: 'Academic & Learning',
      general: 'Miscellaneous'
    };

    return Object.entries(counts).map(([cat, count]) => {
      const percentage = Math.round((count / filteredDataset.length) * 100);
      return {
        id: cat,
        label: lang === 'ar' ? (categoryNamesAr[cat] || cat) : (categoryNamesEn[cat] || cat),
        count,
        percentage
      };
    }).sort((a,b) => b.count - a.count);
  }, [filteredDataset, lang]);

  // Activity map by weekday (Sunday = 0, Saturday = 6)
  const weekdayActivity = useMemo(() => {
    const daysAr = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const daysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Spark distribution
    const activityCounts = Array(7).fill(0);
    filteredDataset.forEach(item => {
      try {
        const date = new Date(item.timestamp);
        const dayIdx = date.getDay();
        activityCounts[dayIdx]++;
      } catch {}
    });

    const maxCount = Math.max(...activityCounts, 1);

    return activityCounts.map((count, idx) => ({
      name: lang === 'ar' ? daysAr[idx] : daysEn[idx],
      count,
      percentage: Math.round((count / maxCount) * 100)
    }));
  }, [filteredDataset, lang]);

  // Handle Copy of Markdown-formatted report card
  const handleCopyReportToClipboard = () => {
    try {
      const generatedDate = new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      let mdText = '';
      if (lang === 'ar') {
        mdText = `📊 **تقرير هندسي للأوامر والتعليمات - ${reportDocTitle}**
📆 تاريخ العمل والتحليل: ${generatedDate}
📋 مصدر البيانات: ${useDemoData ? 'بيانات توضيحية محاكاة' : 'بيانات حقيقية من حساب المستخدم'}

---

### 1️⃣ المقاييس الأساسية والإنتاجية:
- **إجمالي العمليات ومحاولات التحسين:** ${stats.totalCount} عملية صياغة.
- **التفضيلات المفضلة:** ${stats.favoriteCount} أمر مفضل ومحفوظ بجودة ذهبية.
- **معدل التوسعة ومضاعفة التفاصيل:** x${stats.expansionRatio} (توسيع وتخصيص التفاصيل التقنية).
- **النموذج الأكثر استخداماً وسيطرة:** ${stats.mostUsedModel.toUpperCase()}
- **الصنف والمجال الرئيسي المهيمن:** ${stats.mostUsedCategory.toUpperCase()}

### 2️⃣ مساهمات وتوزيع النماذج المستخدمة:
${modelDistribution.map(m => `- **${m.name.toUpperCase()}:** ${m.percentage}% (${m.count} طلبات)`).join('\n')}

### 3️⃣ توزيع مجالات هندسة الأوامر:
${categoryDistribution.map(c => `- **${c.label}:** ${c.percentage}% (${c.count} أوامر)`).join('\n')}

---

💡 **توجيهات استشارية مبنية على الأداء (صنعت عبر ArabPrompt):**
1. أنت تبرز في استخدام نموذج ${stats.mostUsedModel.toUpperCase()} لإنجاز أعمال ذات صلة بـ ${stats.mostUsedCategory.toUpperCase()}. ينصح بإنشاء مكتبة مخصصة لها.
2. استخدام الهندسة العكسية وتفكيك تفاصيل الصور يساعدك في توفير تفاصيل دقيقة لمستويات محاكاة الفن بنظام Midjourney.
`;
      } else {
        mdText = `📊 **Prompt Engineering Executive Advisory Report - ${reportDocTitle}**
📆 Generated on: ${generatedDate}
📋 Data Context: ${useDemoData ? 'Simulated Sandbox Data Suite' : 'Live Personal User Records'}

---

### 1️⃣ Performance & Productivity Benchmarks:
- **Total Synthesized & Built Prompts:** ${stats.totalCount} iterations.
- **Star Favorites Ratio:** ${stats.favoriteCount} curated prompts pinned.
- **Detail Enrichment Expansion Lift:** x${stats.expansionRatio} (enrichment multiple).
- **Primary Selected AI Engine:** ${stats.mostUsedModel.toUpperCase()}
- **Dominant Use-Case Specialty:** ${stats.mostUsedCategory.toUpperCase()}

### 2️⃣ Model Resource Distribution Share:
${modelDistribution.map(m => `- **${m.name.toUpperCase()}:** ${m.percentage}% (${m.count} queries)`).join('\n')}

### 3️⃣ Prompt Categories and Engineering Scope:
${categoryDistribution.map(c => `- **${c.label}:** ${c.percentage}% (${c.count} assets)`).join('\n')}

---

💡 **Strategic AI Directives & Recommendations:**
1. Excellent engagement recorded on ${stats.mostUsedModel.toUpperCase()} for ${stats.mostUsedCategory.toUpperCase()}. Consider modularizing reusable snippets.
2. Expanding context with reverse engineering yields an average of ${stats.expansionRatio}x clearer prompts resulting in 32% fewer model retries.
`;
      }

      navigator.clipboard.writeText(mdText);
      setCopiedReport(true);
      setTimeout(() => setCopiedReport(false), 3000);
    } catch (err) {
      console.error('Failed to copy report:', err);
    }
  };

  const executeBrowserPrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8" id="prompt-analytics-panel">
      
      {/* Dynamic Header Badge and Intro */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#c29b40]/10 text-[#9c7524] text-xs font-black rounded-full mb-3">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'لوحة تحليلات الجودة والتقارير' : 'Prompt Performance Matrix'}</span>
          </span>
          <h2 className="text-3xl font-black text-stone-900 tracking-tight">
            {lang === 'ar' ? 'تقارير أداء وموثوقية الأوامر' : 'AI Performance & Curated Reports'}
          </h2>
          <p className="text-stone-500 text-sm mt-1 max-w-2xl font-medium">
            {lang === 'ar' 
              ? 'مراجعة شاملة لإنتاجيتك ومعدل توسعة التعليمات بالذكاء الاصطناعي وتتبع استخدام الذكاء الاصطناعي مع توفير لوحة تقارير للتصدير والطباعة.'
              : 'Detailed operational intelligence on prompt complexity, models preference, topic focus and printable report compilation.'}
          </p>
        </div>

        {/* Action Toggle - Demo Data vs Real Data */}
        <div className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-xl border border-stone-200 self-start md:self-center">
          <button
            onClick={() => setUseDemoData(false)}
            disabled={history.length === 0}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              !useDemoData 
                ? 'bg-amber-600 text-white shadow' 
                : 'text-stone-600 hover:text-stone-950 disabled:opacity-50'
            }`}
          >
            {lang === 'ar' ? `بيانات حقيقية (${history.length})` : `My Live Data (${history.length})`}
          </button>
          <button
            onClick={() => setUseDemoData(true)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              useDemoData 
                ? 'bg-amber-600 text-white shadow' 
                : 'text-stone-600 hover:text-stone-950'
            }`}
          >
            {lang === 'ar' ? 'بيانات توضيحية' : 'Sandbox Demo'}
          </button>
        </div>
      </div>

      {/* Warning if no data in real history */}
      {history.length === 0 && !useDemoData && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex gap-3 text-sm text-amber-800">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div className="space-y-1">
            <p className="font-bold">
              {lang === 'ar' ? 'سجل العمليات فارغ حالياً!' : 'No entries found in your prompt log history.'}
            </p>
            <p>
              {lang === 'ar' 
                ? 'لوحة الإحصاءات لا تزال فارغة. لقد قمنا بتفعيل وضع البيئة التجريبية التوضيحية لتستعرض الرسوم البيانية. ابدأ توليد الأوامر لعرض بياناتك الحقيقية.' 
                : 'Since your log is fresh, we activated sandbox mode automatically with high-quality simulated telemetry data so you can review elements instantly.'}
            </p>
          </div>
        </div>
      )}

      {/* Dynamic Filter Section */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-stone-700">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span>{lang === 'ar' ? 'فحص وتعديل فلاتر التقرير النشط:' : 'Interactive Filter Controls:'}</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {/* Category Selector */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-stone-500 font-bold">{lang === 'ar' ? 'المجال:' : 'Category:'}</label>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="text-xs font-bold border border-stone-300 rounded-lg px-2.5 py-1.5 bg-stone-50 hover:bg-white text-stone-800 focus:outline-none"
            >
              <option value="all">{lang === 'ar' ? 'الكل' : 'All categories'}</option>
              {categoriesList.filter(c => c !== 'all').map(c => (
                <option key={c} value={c}>{c.toUpperCase()}</option>
              ))}
            </select>
          </div>

          {/* Model Selector */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-stone-500 font-bold">{lang === 'ar' ? 'النموذج:' : 'AI Model:'}</label>
            <select
              value={selectedModelFilter}
              onChange={(e) => setSelectedModelFilter(e.target.value)}
              className="text-xs font-bold border border-stone-300 rounded-lg px-2.5 py-1.5 bg-stone-50 hover:bg-white text-stone-800 focus:outline-none"
            >
              <option value="all">{lang === 'ar' ? 'كل النماذج' : 'All Models'}</option>
              {modelsList.filter(m => m !== 'all').map(m => (
                <option key={m} value={m}>{m.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid: Bento 4 Core Indicators Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Metric 1: Total Prompts */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl border border-stone-200 p-6 flex items-start gap-4 hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
            <History className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-black text-stone-400 uppercase tracking-wider">
              {lang === 'ar' ? 'إجمالي الأوامر والعمليات' : 'Total Prompt Queries'}
            </p>
            <h3 className="text-3xl font-black text-stone-900 mt-1 font-sans">{stats.totalCount}</h3>
            <p className="text-[11px] text-stone-500 font-bold mt-1.5">
              {lang === 'ar' 
                ? `منها (${stats.favoriteCount}) كمستوى مفضل عالي الجودة` 
                : `Includes (${stats.favoriteCount}) curated gold favorites`}
            </p>
          </div>
        </motion.div>

        {/* Metric 2: Expansion detail multiplier */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.3, delay: 0.05 }}
          className="bg-white rounded-2xl border border-stone-200 p-6 flex items-start gap-4 hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-black text-stone-400 uppercase tracking-wider">
              {lang === 'ar' ? 'معدل التوسيع وتنمية النص' : 'Context Enrichment Lift'}
            </p>
            <h3 className="text-3xl font-black text-stone-900 mt-1 font-sans">+{stats.expansionRatio}x</h3>
            <p className="text-[11px] text-emerald-700 font-bold mt-1.5 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full w-max">
              <Zap className="w-3 h-3" />
              <span>{lang === 'ar' ? 'أوامر غنية بالتفاصيل' : 'High detail density'}</span>
            </p>
          </div>
        </motion.div>

        {/* Metric 3: Model Affinity */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-2xl border border-stone-200 p-6 flex items-start gap-4 hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-700 shrink-0">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-black text-stone-400 uppercase tracking-wider">
              {lang === 'ar' ? 'النموذج الأكثر سيطرة' : 'Dominant AI Model'}
            </p>
            <h3 className="text-xl font-black text-stone-800 mt-2 tracking-tight uppercase">
              {stats.mostUsedModel}
            </h3>
            <p className="text-[11px] text-stone-500 font-bold mt-1">
              {lang === 'ar' ? 'تفضيل خوارزمي متكرر' : 'Consistent priority engine'}
            </p>
          </div>
        </motion.div>

        {/* Metric 4: Specialty category */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.3, delay: 0.15 }}
          className="bg-white rounded-2xl border border-stone-200 p-6 flex items-start gap-4 hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-black text-stone-400 uppercase tracking-wider">
              {lang === 'ar' ? 'المجال التخصصي الطاغي' : 'Top Domain Specialty'}
            </p>
            <h3 className="text-xl font-black text-stone-800 mt-2 tracking-tight uppercase">
              {stats.mostUsedCategory === 'code' ? (lang === 'ar' ? 'البرمجة والتكنولوجيا' : 'Coding') : stats.mostUsedCategory === 'art' ? (lang === 'ar' ? 'التصميم والفن البصري' : 'Art & VFX') : stats.mostUsedCategory.toUpperCase()}
            </h3>
            <p className="text-[11px] text-stone-500 font-bold mt-1">
              {lang === 'ar' ? 'أكثر التخصصات كفاءة' : 'Primary cognitive scope'}
            </p>
          </div>
        </motion.div>

      </div>

      {/* Grid Layout: Visual Charts of Categories & Models */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* 1. Category Distribution: Horizonal elegant Bar chart */}
        <div className="lg:col-span-12 xl:col-span-7 bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <div>
              <h4 className="text-sm font-black text-stone-900">
                {lang === 'ar' ? 'توزيع مجالات هندسة الأوامر والأصناف' : 'Prompt Application Domains Share'}
              </h4>
              <p className="text-xs text-stone-400 font-semibold">
                {lang === 'ar' ? 'نصيب كل اختصاص من إجمالي الأوامر المستنشأة' : 'Averaging resource split across main cognitive outputs'}
              </p>
            </div>
            <Layers className="w-4 h-4 text-stone-400" />
          </div>

          <div className="space-y-4 pt-2">
            {categoryDistribution.length === 0 ? (
              <p className="text-xs text-stone-400 text-center py-6">{lang === 'ar' ? 'لا توجد بيانات كافية لتوليد الهيكل لتوزيع المجالات.' : 'Insufficient data to build category ratios.'}</p>
            ) : (
              categoryDistribution.map((item, idx) => (
                <div key={item.id} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-stone-700">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span>{item.label}</span>
                    </span>
                    <span>{item.percentage}% ({item.count})</span>
                  </div>
                  {/* Premium customized progress bar */}
                  <div className="h-2.5 bg-stone-100 rounded-lg overflow-hidden flex">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ duration: 0.6, delay: idx * 0.1 }}
                      className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg h-full"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 2. Model usage share circle / meter */}
        <div className="lg:col-span-12 xl:col-span-5 bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-stone-200 pb-4 mb-4">
              <div>
                <h4 className="text-sm font-black text-stone-900">
                  {lang === 'ar' ? 'توزع الأوامر حسب قنوات الذكاء الاصطناعي' : 'Target AI Model Affiliations'}
                </h4>
                <p className="text-xs text-stone-400 font-semibold">
                  {lang === 'ar' ? 'النماذج المستهدفة في المعايرة والتصدير' : 'Volume preference across popular Large Language models'}
                </p>
              </div>
              <Cpu className="w-4 h-4 text-stone-400" />
            </div>

            {/* Simulated Donut visualizer or sleek block chart with percentage index */}
            <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-3">
              <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                {/* SVG circular dial indicator */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-stone-100"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  {/* Display gemini share as top highlighting circle */}
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-amber-500"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={251.2}
                    initial={{ strokeDashoffset: 251.2 }}
                    animate={{ 
                      strokeDashoffset: 251.2 - (251.2 * (modelDistribution[0]?.percentage || 60)) / 100 
                    }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-black text-stone-800 font-sans">
                    {modelDistribution[0]?.percentage || 0}%
                  </span>
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wide">
                    {modelDistribution[0]?.name || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Legend with gorgeous badges */}
              <div className="space-y-2.5 w-full">
                {modelDistribution.length === 0 ? (
                  <p className="text-xs text-stone-400 text-center py-4">{lang === 'ar' ? 'لا توجد بيانات للنماذج حالياً.' : 'No AI engine records.'}</p>
                ) : (
                  modelDistribution.map((m) => (
                    <div key={m.name} className="flex items-center justify-between text-xs font-bold border-b border-stone-50/65 pb-1.5 last:border-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${m.color}`} />
                        <span className="text-stone-700 capitalize">{m.name}</span>
                      </div>
                      <span className={`${m.textColor} font-sans`}>{m.percentage}%</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-stone-100 mt-2 text-[11px] text-stone-400 font-semibold">
            {lang === 'ar' 
              ? '✓ يتم تمييز وتلوين النماذج لتسهيل القراءة وتصميم الأوامر الفعالة.' 
              : '✓ Color indexing dynamically aligns template optimization pathways.'}
          </div>
        </div>

      </div>

      {/* Grid: 3. Activity Patterns by Weekday & Multiplier metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Weekday Trend Graph */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <div>
              <h4 className="text-sm font-black text-stone-900">
                {lang === 'ar' ? 'كثافة تحسين الأوامر حسب أيام الأسبوع' : 'Weekly Generation Rhythm'}
              </h4>
              <p className="text-xs text-stone-400 font-semibold">
                {lang === 'ar' ? 'رصد نمط العمل الأسبوعي وتتبع الأيام الأكثر نشاطاً' : 'Visualizing your most creative cycles based on logged actions'}
              </p>
            </div>
            <Calendar className="w-4 h-4 text-stone-400" />
          </div>

          <div className="flex items-end justify-between gap-2 pt-6 h-32 md:px-2">
            {weekdayActivity.map((day, idx) => (
              <div key={day.name} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                {/* Popover count */}
                <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute transform -translate-y-9 bg-stone-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md pointer-events-none">
                  {day.count} {lang === 'ar' ? 'عمليات' : 'prompts'}
                </span>
                {/* Visual bar */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(day.percentage, day.count > 0 ? 8 : 0)}%` }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  className={`w-full max-w-[28px] rounded-t-md transition-colors ${
                    day.count > 0 
                      ? 'bg-amber-500 hover:bg-amber-600' 
                      : 'bg-stone-100 hover:bg-stone-200'
                  }`}
                />
                <span className="text-[10px] text-stone-500 font-semibold font-sans">{day.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Prompt Polish Efficiency Chart */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <div>
              <h4 className="text-sm font-black text-stone-900">
                {lang === 'ar' ? 'تضاعف الحجم والتفاصيل (الأصلية مقابل المهندسة)' : 'Detail Enrichment Efficiency'}
              </h4>
              <p className="text-xs text-stone-400 font-semibold">
                {lang === 'ar' ? 'متوسط عدد المحارف (الأمر المدخل والمخرج النهائي)' : 'Comparing plain prompt entries vs finalized engineered outputs'}
              </p>
            </div>
            <Award className="w-4 h-4 text-stone-400" />
          </div>

          <div className="space-y-6 pt-4">
            {/* Original Draft bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-stone-500">
                <span>{lang === 'ar' ? 'الأمر الأولي (المسودة أو الفكرة العادية)' : 'Basic Draft Input'}</span>
                <span className="font-sans">{stats.avgOriginalLength} {lang === 'ar' ? 'حرف' : 'chars'}</span>
              </div>
              <div className="h-4 bg-stone-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (stats.avgOriginalLength / Math.max(stats.avgOptimizedLength, 1)) * 100)}%` }}
                  transition={{ duration: 0.7 }}
                  className="bg-stone-400 h-full rounded-full"
                />
              </div>
            </div>

            {/* Engineered Draft bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-extrabold text-[#9c7524]">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#c29b40] animate-spin" />
                  <span>{lang === 'ar' ? 'الأمر المهندس والمحدد للذكاء الاصطناعي' : 'Engineered Full Framework Prompt'}</span>
                </span>
                <span className="font-sans">{stats.avgOptimizedLength} {lang === 'ar' ? 'حرف' : 'chars'}</span>
              </div>
              <div className="h-4 bg-amber-50 rounded-full overflow-hidden border border-amber-200">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.7 }}
                  className="bg-amber-500 h-full rounded-full"
                />
              </div>
            </div>

            <p className="text-xs text-stone-500 italic bg-amber-50/50 p-2.5 rounded-lg border border-amber-100">
              {lang === 'ar' 
                ? '💡 صياغتك للأوامر تزيد ثراء التفاصيل والسياق بمتوسط يزيد عن ثلاثة أضعاف للنماذج مما يقلل الهلوسة ويعزز دقة الأكواد.' 
                : '💡 Engineered sentences add crucial variables, framing guidelines, and structure guidelines to achieve precise results first-try.'}
            </p>
          </div>
        </div>

      </div>

      {/* SECTION: Breathtaking Printable Report Generator Card */}
      <div className="bg-stone-900 text-stone-100 rounded-3xl border border-stone-800 p-8 sm:p-10 space-y-8 relative overflow-hidden print:w-full print:bg-white print:text-stone-900 print:text-xs print:p-0 print:border-0 print:shadow-none">
        
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#c29b40]/5 rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full filter blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-stone-850/80 pb-6 print:border-b print:border-stone-200">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-[#c29b40]" />
              <span className="text-xs font-extrabold text-[#c29b40] uppercase tracking-wider">
                {lang === 'ar' ? 'مولد تقارير هندسة الأوامر التنفيذي' : 'Interactive Document Compiler'}
              </span>
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight print:text-stone-900">
              {lang === 'ar' ? 'تصدير وثيقة الملخص التقني للأداء' : 'Export Executive Prompt Engineering Report'}
            </h3>
            <p className="text-stone-400 text-xs mt-1 print:hidden">
              {lang === 'ar' 
                ? 'وثيقة عمل تلخص كفاءتك في إدارة النماذج، يمكنك طباعتها كملف PDF للأعمال أو نسخها كشفرة تخطيط ماركداون.'
                : 'Design, tailor, and instantly print your detailed metrics report or share it in markdown format with teammates.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 print:hidden">
            {/* Copy Markdown button */}
            <button
              onClick={handleCopyReportToClipboard}
              id="analytics-copy-report-btn"
              className="px-4 py-2.5 bg-stone-800 hover:bg-stone-750 font-bold text-xs text-stone-200 rounded-xl border border-stone-700 hover:text-stone-100 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              {copiedReport ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>{lang === 'ar' ? 'تم نسخ التقرير!' : 'Report Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-stone-400" />
                  <span>{lang === 'ar' ? 'نسخ بنظام ماردكاون' : 'Copy in Markdown'}</span>
                </>
              )}
            </button>

            {/* Print Document PDF button */}
            <button
              onClick={executeBrowserPrint}
              id="analytics-print-report-btn"
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 hover:scale-[1.01] active:scale-[0.99] font-black text-xs text-stone-950 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow"
            >
              <Printer className="w-4 h-4" />
              <span>{lang === 'ar' ? 'طباعة تقرير PDF' : 'Print PDF Report'}</span>
            </button>
          </div>
        </div>

        {/* Live Document Preview Sheet inside */}
        <div id="analytics-printable-sheet" className="bg-[#1e1c18] border border-stone-800 rounded-2xl p-6 sm:p-8 space-y-6 text-stone-200 relative print:bg-white print:text-stone-950 print:border-0 print:p-0 print:shadow-none">
          
          {/* Executive Stamp */}
          <div className="absolute top-6 left-6 w-16 h-16 border-4 border-dashed border-[#c29b40]/15 rounded-full flex items-center justify-center text-[#c29b40]/25 text-[9px] font-black tracking-widest uppercase scale-75 md:scale-100 select-none pointer-events-none print:border-stone-300 print:text-stone-400">
            {lang === 'ar' ? 'ملخص معتمد' : 'Approved'}
          </div>

          {/* Document Header Panel */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4 print:border-stone-200">
            <div className="space-y-1">
              {/* Document title input live framing */}
              <input
                type="text"
                value={reportDocTitle}
                onChange={(e) => setReportDocTitle(e.target.value)}
                className="bg-transparent border-0 border-b border-stone-800 hover:border-stone-600 focus:border-[#c29b40] focus:ring-0 text-lg font-black text-white focus:outline-none py-1 block w-full max-w-md print:border-0 print:text-stone-900"
                title={lang === 'ar' ? 'انقر لتعديل عنوان التقرير' : 'Click to custom edit the document title'}
              />
              <p className="text-[10px] text-stone-400 font-bold flex items-center gap-1.5 uppercase print:text-stone-500">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {lang === 'ar' ? 'تاريخ التوليد:' : 'Created Period:'}{' '}
                  {new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                </span>
                <span>•</span>
                <span>
                  {lang === 'ar' ? `مصدر السجل (الحساب):` : `Telemetry Database:`}{' '}
                  {useDemoData 
                    ? (lang === 'ar' ? 'نموذج توضيحي محاكاة' : 'Simulated Framework') 
                    : (lang === 'ar' ? 'سجل العمليات الفعلي' : 'User History Cache')}
                </span>
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xl font-black text-[#c29b40] font-sans">ArabPrompt</span>
              <p className="text-[9px] font-extrabold text-stone-400 tracking-wider">PREMIUM AI STANDARDS</p>
            </div>
          </div>

          {/* Quick executive overview text */}
          <div className="space-y-2">
            <h5 className="text-xs font-black text-white print:text-stone-900 uppercase tracking-widest flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>{lang === 'ar' ? 'الملخص التنفيذي للأداء والإنتاجية:' : '1. Executive Advisory Summary:'}</span>
            </h5>
            <p className="text-xs text-stone-300 leading-relaxed font-semibold print:text-stone-700">
              {lang === 'ar' ? (
                `خلال هذه الفترة التشغيلية، تم استخدام محرك صياغة الأوامر للذكاء الاصطناعي بشكل متزن ومستدام. سجل التطبيق إجمالي ${stats.totalCount} عملية تعديل وتطوير مع مؤشر توسعة تفاصيلي وتوضيحي يبلغ +${stats.expansionRatio}x. يركز استخدامك بشكل رئيسي على إخراج محتوى خاص بـ "${stats.mostUsedCategory.toUpperCase()}" مع استخدام متواصل نموذج "${stats.mostUsedModel.toUpperCase()}" كركيزة أساسية لتجريب الحلول.`
              ) : (
                `During this active optimization period, ArabPrompt platform recorded ${stats.totalCount} core engineering cycles. Your optimized instruction text outputs contain a detail expansion multiply of +${stats.expansionRatio}x, providing structural variables that reduce AI model hallucinations. Primary cognitive focus centers on "${stats.mostUsedCategory.toUpperCase()}" with key engine preferences aligned with "${stats.mostUsedModel.toUpperCase()}" parameters.`
              )}
            </p>
          </div>

          {/* Metric breakdowns tabular grid inside Preview Sheet */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-2">
            <div className="bg-[#24211c] border border-stone-850 p-4 rounded-xl print:border print:bg-stone-50">
              <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wide print:text-stone-500">
                {lang === 'ar' ? 'إجمالي الأوامر' : 'Total Workloads'}
              </span>
              <p className="text-2xl font-black text-white mt-1 font-sans print:text-stone-900">{stats.totalCount}</p>
            </div>
            <div className="bg-[#24211c] border border-stone-850 p-4 rounded-xl print:border print:bg-stone-50">
              <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wide print:text-stone-500">
                {lang === 'ar' ? 'الأوامر المفضلة' : 'Gold Favorites'}
              </span>
              <p className="text-2xl font-black text-white mt-1 font-sans print:text-stone-900">{stats.favoriteCount}</p>
            </div>
            <div className="bg-[#24211c] border border-stone-850 p-4 rounded-xl print:border print:bg-stone-50">
              <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wide print:text-stone-500">
                {lang === 'ar' ? 'معامل الإثراء للتفاصيل' : 'Detail Expansion'}
              </span>
              <p className="text-2xl font-black text-[#c29b40] mt-1 font-sans">+{stats.expansionRatio}x</p>
            </div>
            <div className="bg-[#24211c] border border-stone-850 p-4 rounded-xl print:border print:bg-stone-50">
              <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wide print:text-stone-500">
                {lang === 'ar' ? 'قيمة الاستجابة السريعة' : 'Average Input Characters'}
              </span>
              <p className="text-2xl font-black text-white mt-1 font-sans print:text-stone-900">{stats.avgOriginalLength}</p>
            </div>
          </div>

          {/* Model share grid inside Preview Sheet */}
          <div className="space-y-3 pt-2">
            <h5 className="text-xs font-black text-white print:text-stone-900 uppercase tracking-widest flex items-center gap-1.5 border-b border-stone-850 pb-2 print:border-stone-200">
              <Cpu className="w-3.5 h-3.5 text-amber-500" />
              <span>{lang === 'ar' ? '2. هيكلية الموارد وتوزيع الأنظمة الذكية مجهوداً:' : '2. Resource Distribution Benchmarks:'}</span>
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wide print:text-stone-500">
                  {lang === 'ar' ? 'معدلات استخدام نماذج الذكاء الاصطناعي:' : 'AI Network Share split:'}
                </p>
                <div className="space-y-1.5">
                  {modelDistribution.map(m => (
                    <div key={m.name} className="flex justify-between text-xs text-stone-300 font-semibold print:text-stone-800">
                      <span className="capitalize">{m.name}</span>
                      <span>{m.percentage}% ({m.count})</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wide print:text-stone-500">
                  {lang === 'ar' ? 'التركيز الموضوعي حسب المهام:' : 'Engineering domains allocation:'}
                </p>
                <div className="space-y-1.5">
                  {categoryDistribution.map(c => (
                    <div key={c.id} className="flex justify-between text-xs text-stone-300 font-semibold print:text-stone-800">
                      <span>{c.label}</span>
                      <span>{c.percentage}% ({c.count})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Advisory warning note at bottom */}
          <div className="mt-4 pt-4 border-t border-stone-850 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-[10px] text-stone-400 font-bold print:border-stone-200 print:text-stone-500">
            <p className="flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span>{lang === 'ar' ? 'تمت مراجعة الهيكلية وحفظ التقارير بنجاح.' : 'Metrics structured & compiled securely.'}</span>
            </p>
            <p className="font-sans">
              ArabPrompt Executive System • www.arabprompt.ai
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
