/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Sparkles, Search, Copy, Check, ExternalLink, Download, 
  FileJson, Sliders, Film, Layers, Palette, Eye, Wand2,
  Bookmark, ArrowRight, ArrowLeft, RefreshCw, Cpu, Star, 
  HelpCircle, CheckCircle2, ChevronRight, X
} from 'lucide-react';
import { AppLanguage, ModelType } from '../types';
import { 
  CINEMATIC_200_PROMPTS, 
  CINEMATIC_LIBRARY_META, 
  CinematicPromptItem, 
  formatMidjourneyPrompt, 
  formatFluxPrompt, 
  formatFluxJson 
} from '../data/cinematic200Library';
import { showToast } from './ToastNotification';
import { appendSiteUrlToPrompt } from '../utils/brandWatermark';

interface CinematicLibraryStudioProps {
  lang: AppLanguage;
  onSendToBuilder?: (promptText: string, model?: ModelType, tone?: string, category?: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export default function CinematicLibraryStudio({
  lang,
  onSendToBuilder,
  onNavigateTab
}: CinematicLibraryStudioProps) {
  const isAr = lang === 'ar';
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  // Selected Category filter
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Selected Engine Tab for prompt copying: 'midjourney' | 'flux' | 'subject'
  const [targetEngine, setTargetEngine] = useState<'midjourney' | 'flux' | 'subject'>('midjourney');
  
  // Custom aspect ratio override
  const [aspectRatio, setAspectRatio] = useState<string>('16:9');
  const [guidanceScale, setGuidanceScale] = useState<number>(3.5);

  // Modal active item
  const [modalItem, setModalItem] = useState<CinematicPromptItem | null>(null);

  // Copied indicator
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [copiedEngine, setCopiedEngine] = useState<string | null>(null);

  // Filtered prompt list
  const filteredPrompts = useMemo(() => {
    return CINEMATIC_200_PROMPTS.filter((item) => {
      const matchCat = selectedCat === 'all' || item.category === selectedCat;
      if (!matchCat) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        item.subject.toLowerCase().includes(q) ||
        item.titleAr.toLowerCase().includes(q) ||
        item.categoryNameAr.toLowerCase().includes(q) ||
        item.categoryNameEn.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q)) ||
        String(item.id) === q
      );
    });
  }, [selectedCat, searchQuery]);

  const handleCopyPrompt = (item: CinematicPromptItem, engine: 'midjourney' | 'flux' | 'subject') => {
    let textToCopy = '';
    let label = '';

    if (engine === 'midjourney') {
      textToCopy = formatMidjourneyPrompt(item, aspectRatio);
      label = isAr ? 'برومبت Midjourney v6.1' : 'Midjourney v6.1 prompt';
    } else if (engine === 'flux') {
      const fluxObj = formatFluxPrompt(item, aspectRatio, guidanceScale);
      textToCopy = `${fluxObj.prompt}\n\n[Negative Prompt]:\n${fluxObj.negative_prompt}\n\n[Parameters]: aspect_ratio="${fluxObj.parameters.aspect_ratio}", guidance=${fluxObj.parameters.guidance}`;
      label = isAr ? 'برومبت ومحددات Flux.1' : 'Flux.1 High-Resolution prompt';
    } else {
      textToCopy = item.subject;
      label = isAr ? 'الموضوع الأساسي' : 'Subject prompt';
    }

    const branded = appendSiteUrlToPrompt(textToCopy);
    navigator.clipboard.writeText(branded).then(() => {
      setCopiedId(item.id);
      setCopiedEngine(engine);
      showToast(isAr ? `✓ تم نسخ ${label} بنجاح!` : `✓ Copied ${label}!`, false);
      setTimeout(() => {
        setCopiedId(null);
        setCopiedEngine(null);
      }, 2000);
    });
  };

  const handleCopyFluxJson = (item: CinematicPromptItem) => {
    const jsonStr = formatFluxJson(item, aspectRatio, guidanceScale);
    navigator.clipboard.writeText(jsonStr).then(() => {
      showToast(isAr ? '✓ تم نسخ كود JSON المخصص لـ Flux.1' : '✓ Copied Flux.1 JSON configuration!', false);
    });
  };

  const handleSendToAppBuilder = (item: CinematicPromptItem) => {
    if (!onSendToBuilder) return;
    const promptText = targetEngine === 'midjourney' 
      ? formatMidjourneyPrompt(item, aspectRatio)
      : formatFluxPrompt(item, aspectRatio, guidanceScale).prompt;
    
    onSendToBuilder(promptText, targetEngine === 'midjourney' ? 'midjourney' : 'gemini', 'سينمائي واحترافي', 'creative');
    showToast(isAr ? '✓ تم فتح البرومبت في مهندس الأوامر' : '✓ Opened in Prompt Builder', false);
  };

  const handleExportAllJson = () => {
    const payload = {
      meta: CINEMATIC_LIBRARY_META,
      selected_engine_preview: targetEngine,
      total_exported: filteredPrompts.length,
      prompts: filteredPrompts.map((p) => ({
        id: p.id,
        category: p.category,
        title_ar: p.titleAr,
        subject_en: p.subject,
        midjourney_v6_1: formatMidjourneyPrompt(p, aspectRatio),
        flux_1_high_res: formatFluxPrompt(p, aspectRatio, guidanceScale)
      }))
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cinematic_200_library_${selectedCat}_${targetEngine}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(isAr ? '✓ تم تنزيل ملف JSON للمكتبة السينمائية' : '✓ Downloaded Cinematic Library JSON', false);
  };

  return (
    <div className="space-y-6" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Hero Header Section */}
      <div className="bg-gradient-to-br from-[#1c1a16] via-stone-900 to-black text-white rounded-3xl p-6 sm:p-8 border border-[#c29b40]/40 shadow-xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -end-24 w-72 h-72 bg-[#c29b40]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -start-24 w-72 h-72 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c29b40]/20 border border-[#c29b40]/40 text-amber-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{isAr ? 'المكتبة الفائقة المحدثة 2026' : 'Ultimate 2026 Edition'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>200 برومبت سينمائي جاهز</span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white font-sans">
              {isAr ? '🎬 مكتبة البرومتات السينمائية الفائقة (Midjourney v6.1 & Flux.1)' : '🎬 Cinematic Fantasy, Sci-Fi & Art 200 Prompt Library'}
            </h1>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              {isAr
                ? 'مجموعة محكمة من 200 برومبت احترافي موزعة على 5 مجالات كبرى (الفانتازيا الملحمية، سينما الخيال العلمي، الفنون الكلاسيكية والنهضة، السريالية والبيوميكانيك، والبورتريهات السينمائية). مصممة بدقة كاميرات Hasselblad وإضاءة 5600K المتوازنة، ومجهزة للنسخ المباشر لكل من Midjourney v6.1 و Flux.1.'
                : 'Curated 200 cinematic prompts across 5 epic genres (Fantasy, Sci-Fi, Classical Renaissance, Surreal Biomech, and Character Portraits). Formatted with Hasselblad H6D-100c optics, 5600K daylight, and ready for instant Midjourney v6.1 & Flux.1 production.'}
            </p>
          </div>

          {/* Quick Stats Box */}
          <div className="flex sm:flex-col gap-3 shrink-0">
            <button
              type="button"
              onClick={handleExportAllJson}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#916a24] via-[#c29b40] to-amber-500 hover:opacity-95 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition"
            >
              <FileJson className="w-4 h-4" />
              <span>{isAr ? 'تصدير الكل JSON' : 'Export All JSON'}</span>
            </button>
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab('cinema')}
                className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-stone-200 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition"
              >
                <Film className="w-4 h-4 text-amber-400" />
                <span>{isAr ? 'استوديو السينما والأفلام' : 'Cinema Movie Studio'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Control Toolbar: Engine Switcher & Aspect Ratio */}
      <div className="bg-white dark:bg-[#151412] p-4 sm:p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Engine Selector Tabs */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-stone-500 dark:text-stone-400">
              {isAr ? 'اختر محرك التوليد المستهدف (الصيغة التلقائية للنسخ):' : 'Select Target Generator Engine (Auto Format):'}
            </label>
            <div className="inline-flex p-1 bg-stone-100 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
              <button
                type="button"
                onClick={() => setTargetEngine('midjourney')}
                className={`py-1.5 px-3 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                  targetEngine === 'midjourney'
                    ? 'bg-[#c29b40] text-stone-950 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Midjourney v6.1</span>
              </button>

              <button
                type="button"
                onClick={() => setTargetEngine('flux')}
                className={`py-1.5 px-3 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                  targetEngine === 'flux'
                    ? 'bg-[#c29b40] text-stone-950 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Flux.1 High-Resolution</span>
              </button>

              <button
                type="button"
                onClick={() => setTargetEngine('subject')}
                className={`py-1.5 px-3 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                  targetEngine === 'subject'
                    ? 'bg-[#c29b40] text-stone-950 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                <span>{isAr ? 'الموضوع فقط' : 'Subject Only'}</span>
              </button>
            </div>
          </div>

          {/* Aspect Ratio Selector */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-stone-500 dark:text-stone-400">
              {isAr ? 'نسبة الأبعاد (Aspect Ratio):' : 'Aspect Ratio:'}
            </label>
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { val: '16:9', label: '16:9 (سينمائي عريض)' },
                { val: '9:16', label: '9:16 (ستوري وجوال)' },
                { val: '1:1', label: '1:1 (مربع)' },
                { val: '4:5', label: '4:5 (بورتريه)' },
                { val: '21:9', label: '21:9 (بانوراما فائقة)' },
              ].map((ar) => (
                <button
                  key={ar.val}
                  type="button"
                  onClick={() => setAspectRatio(ar.val)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
                    aspectRatio === ar.val
                      ? 'bg-stone-900 text-white dark:bg-amber-400 dark:text-stone-950 border-transparent shadow-xs'
                      : 'bg-stone-50 dark:bg-stone-850 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-750 hover:bg-stone-100'
                  }`}
                >
                  {ar.val}
                </button>
              ))}
            </div>
          </div>

          {/* Flux Guidance scale (visible when Flux is chosen) */}
          {targetEngine === 'flux' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-stone-500 dark:text-stone-400">
                <span>{isAr ? 'مقياس التوجيه (Guidance):' : 'Guidance Scale:'}</span>
                <span className="text-[#916a24] dark:text-amber-400 font-mono">{guidanceScale}</span>
              </div>
              <input
                type="range"
                min={1.5}
                max={7.0}
                step={0.5}
                value={guidanceScale}
                onChange={(e) => setGuidanceScale(parseFloat(e.target.value))}
                className="w-36 accent-[#c29b40] cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Engine Prompt Formula Preview banner */}
        <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 text-xs font-mono text-stone-600 dark:text-stone-300 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-bold text-[#c29b40]">
              {targetEngine === 'midjourney' ? 'Midjourney v6.1 Formula:' : targetEngine === 'flux' ? 'Flux.1 High-Res Formula:' : 'Raw Subject:'}
            </span>
          </div>
          <div className="text-[11px] truncate select-all">
            {targetEngine === 'midjourney' ? (
              <span>/imagine prompt: [Subject], {CINEMATIC_LIBRARY_META.base_prompt.replace(/--ar \d+:\d+/, `--ar ${aspectRatio}`)}</span>
            ) : targetEngine === 'flux' ? (
              <span>[Subject], {CINEMATIC_LIBRARY_META.base_prompt_flux_clean} (guidance: {guidanceScale}, ar: {aspectRatio})</span>
            ) : (
              <span>[Subject]</span>
            )}
          </div>
        </div>
      </div>

      {/* Category Pills & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCat('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
              selectedCat === 'all'
                ? 'bg-[#c29b40] text-stone-950 border-[#b38d35] shadow-xs'
                : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:bg-stone-100'
            }`}
          >
            <span>{isAr ? 'الكل (200 برومبت)' : 'All (200 Prompts)'}</span>
          </button>

          {Object.entries(CINEMATIC_LIBRARY_META.categories).map(([catKey, catInfo]) => (
            <button
              key={catKey}
              type="button"
              onClick={() => setSelectedCat(catKey)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer border flex items-center gap-1.5 ${
                selectedCat === catKey
                  ? 'bg-[#c29b40] text-stone-950 border-[#b38d35] shadow-xs'
                  : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:bg-stone-100'
              }`}
            >
              <span>{catInfo.icon}</span>
              <span>{isAr ? catInfo.nameAr : catInfo.nameEn}</span>
              <span className="text-[10px] opacity-75 font-mono">({catInfo.range})</span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className={`w-3.5 h-3.5 text-stone-400 absolute top-1/2 -translate-y-1/2 ${isAr ? 'right-3' : 'left-3'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAr ? 'ابحث في الـ 200 برومبت...' : 'Search 200 prompts...'}
            className={`w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-xs py-2 text-stone-900 dark:text-stone-100 placeholder-stone-400 ${
              isAr ? 'pr-9 pl-3' : 'pl-9 pr-3'
            }`}
          />
        </div>
      </div>

      {/* Prompts Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPrompts.map((item) => {
          const isCopied = copiedId === item.id;
          const catMeta = CINEMATIC_LIBRARY_META.categories[item.category];

          return (
            <div
              key={item.id}
              className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#151412] border border-stone-200/90 dark:border-stone-800 hover:border-[#c29b40]/50 transition shadow-xs flex flex-col justify-between space-y-3.5 group"
            >
              <div className="space-y-2.5">
                {/* Card Top: ID Badge & Category */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-6 h-6 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-mono font-bold text-xs flex items-center justify-center">
                      #{item.id}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-[#916a24] dark:text-amber-400 font-bold flex items-center gap-1">
                      <span>{catMeta?.icon || '🎨'}</span>
                      <span>{isAr ? item.categoryNameAr : item.categoryNameEn}</span>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setModalItem(item)}
                    className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition cursor-pointer"
                    title={isAr ? 'عرض التفاصيل والمقارنة' : 'View full details & comparison'}
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Arabic Title */}
                <h3 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 leading-snug">
                  {item.titleAr}
                </h3>

                {/* English Subject Text */}
                <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/80 border border-stone-200/70 dark:border-stone-800/80 text-xs text-stone-700 dark:text-stone-300 font-mono leading-relaxed select-text">
                  {item.subject}
                </div>

                {/* Stylistic Tags */}
                <div className="flex flex-wrap gap-1">
                  {item.tags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-1">
                  {/* Primary Copy Button matching selected targetEngine */}
                  <button
                    type="button"
                    onClick={() => handleCopyPrompt(item, targetEngine)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                      isCopied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#c29b40] hover:bg-[#b08b34] text-stone-950'
                    }`}
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>
                      {isCopied 
                        ? (isAr ? 'تم النسخ!' : 'Copied!') 
                        : targetEngine === 'midjourney' 
                        ? (isAr ? 'نسخ Midjourney v6.1' : 'Copy Midjourney')
                        : targetEngine === 'flux' 
                        ? (isAr ? 'نسخ Flux.1' : 'Copy Flux.1') 
                        : (isAr ? 'نسخ الموضوع' : 'Copy Subject')}
                    </span>
                  </button>

                  {/* Flux JSON Copy Shortcut Button */}
                  <button
                    type="button"
                    onClick={() => handleCopyFluxJson(item)}
                    className="p-2 rounded-xl border border-stone-200 dark:border-stone-750 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 text-stone-700 dark:text-stone-300 transition cursor-pointer"
                    title={isAr ? 'نسخ كود Flux.1 JSON المهيكل' : 'Copy Flux.1 JSON payload'}
                  >
                    <FileJson className="w-3.5 h-3.5 text-[#c29b40]" />
                  </button>

                  {/* Send to Builder */}
                  {onSendToBuilder && (
                    <button
                      type="button"
                      onClick={() => handleSendToAppBuilder(item)}
                      className="p-2 rounded-xl border border-stone-200 dark:border-stone-750 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 text-stone-700 dark:text-stone-300 transition cursor-pointer"
                      title={isAr ? 'فتح في مهندس الأوامر' : 'Open in Prompt Builder'}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPrompts.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-[#151412] rounded-3xl border border-stone-200 dark:border-stone-800 space-y-2">
          <p className="text-sm font-bold text-stone-700 dark:text-stone-300">
            {isAr ? 'لم يتم العثور على برومتات تطابق بحثك' : 'No prompts match your search query'}
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCat('all');
              setSearchQuery('');
            }}
            className="text-xs text-[#c29b40] font-bold underline cursor-pointer"
          >
            {isAr ? 'إعادة ضبط الفلاتر' : 'Reset filters'}
          </button>
        </div>
      )}

      {/* Modal: In-Depth Comparison & Customizer for a Selected Prompt */}
      {modalItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-xs animate-fade-in"
          onClick={() => setModalItem(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-stone-900 dark:text-stone-100"
            onClick={(e) => e.stopPropagation()}
            dir={isAr ? 'rtl' : 'ltr'}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between shrink-0 bg-stone-50/50 dark:bg-stone-850/50">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#c29b40] text-stone-950 font-black text-xs flex items-center justify-center">
                  #{modalItem.id}
                </span>
                <div>
                  <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                    {modalItem.titleAr}
                  </h3>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400">
                    {isAr ? modalItem.categoryNameAr : modalItem.categoryNameEn}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalItem(null)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {/* English Subject */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-stone-500">
                  {isAr ? 'موضوع المشهد السينمائي (English Subject):' : 'Scene Subject Description:'}
                </label>
                <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800 font-mono text-xs text-stone-800 dark:text-stone-200 leading-relaxed select-text">
                  {modalItem.subject}
                </div>
              </div>

              {/* Midjourney Formatted Block */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-amber-800 dark:text-amber-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>صيغة Midjourney v6.1 الكاملة:</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyPrompt(modalItem, 'midjourney')}
                    className="text-[11px] text-[#916a24] dark:text-amber-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{isAr ? 'نسخ الأمر' : 'Copy command'}</span>
                  </button>
                </div>
                <div className="p-3 rounded-xl bg-stone-950 text-stone-200 font-mono text-xs leading-relaxed select-text border border-stone-850">
                  {formatMidjourneyPrompt(modalItem, aspectRatio)}
                </div>
              </div>

              {/* Flux.1 Formatted Block */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>صيغة Flux.1 High-Resolution المجهزة:</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyFluxJson(modalItem)}
                      className="text-[11px] text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                    >
                      {isAr ? 'نسخ كود JSON' : 'Copy JSON'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyPrompt(modalItem, 'flux')}
                      className="text-[11px] text-[#916a24] dark:text-amber-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{isAr ? 'نسخ النص' : 'Copy prompt'}</span>
                    </button>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-stone-950 text-stone-200 font-mono text-xs leading-relaxed select-text border border-stone-850 space-y-2">
                  <div>
                    <span className="text-emerald-400 font-bold">[Prompt]:</span>{' '}
                    <span>{formatFluxPrompt(modalItem, aspectRatio, guidanceScale).prompt}</span>
                  </div>
                  <div>
                    <span className="text-rose-400 font-bold">[Negative]:</span>{' '}
                    <span className="text-stone-400">{CINEMATIC_LIBRARY_META.negative_prompt}</span>
                  </div>
                  <div className="text-[11px] text-stone-400 pt-1 border-t border-stone-850">
                    aspect_ratio: "{aspectRatio}", guidance: {guidanceScale}, lens: "85mm f/1.2"
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-850/50 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setModalItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyPrompt(modalItem, 'midjourney')}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#916a24] via-[#c29b40] to-amber-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{isAr ? 'نسخ Midjourney' : 'Copy Midjourney'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCopyPrompt(modalItem, 'flux')}
                  className="px-3.5 py-2 rounded-xl bg-stone-900 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{isAr ? 'نسخ Flux.1' : 'Copy Flux.1'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
