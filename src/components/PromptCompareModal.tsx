/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { PromptHistoryItem, AppLanguage, ModelType } from '../types';
import {
  X,
  ArrowLeftRight,
  Copy,
  Check,
  Send,
  Sliders,
  Sparkles,
  TrendingUp,
  Columns,
  ListFilter,
  FileText,
  Clock,
  Tag,
  Cpu,
  Layers,
  ChevronDown,
  Info,
  Maximize2,
  Minimize2,
  Printer,
  Search,
  CheckCircle2,
  PlusCircle,
  MinusCircle,
  Share2
} from 'lucide-react';
import { computeWordDiff, calculatePromptMetrics } from '../utils/diffUtils';
import { showToast } from './ToastNotification';
import SharePromptToAiModal from './SharePromptToAiModal';

interface PromptCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: PromptHistoryItem[];
  lang: AppLanguage;
  initialPromptAId?: string | null;
  initialPromptBId?: string | null;
  onApplyToBuilder?: (originalText: string, model: any, tone: string, category: string) => void;
  onSendToTester?: (promptText: string) => void;
}

export default function PromptCompareModal({
  isOpen,
  onClose,
  history,
  lang,
  initialPromptAId,
  initialPromptBId,
  onApplyToBuilder,
  onSendToTester
}: PromptCompareModalProps) {
  // Sort history newest first
  const sortedHistory = useMemo(() => {
    return [...history].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [history]);

  // Selected item IDs
  const [selectedIdA, setSelectedIdA] = useState<string>(() => {
    if (initialPromptAId && history.some((h) => h.id === initialPromptAId)) {
      return initialPromptAId;
    }
    return sortedHistory[1]?.id || sortedHistory[0]?.id || '';
  });

  const [selectedIdB, setSelectedIdB] = useState<string>(() => {
    if (initialPromptBId && history.some((h) => h.id === initialPromptBId)) {
      return initialPromptBId;
    }
    return sortedHistory[0]?.id || '';
  });

  // UI state
  const [activeField, setActiveField] = useState<'optimized' | 'original' | 'translated'>('optimized');
  const [viewMode, setViewMode] = useState<'side-by-side' | 'unified'>('side-by-side');
  const [highlightDiff, setHighlightDiff] = useState<boolean>(true);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [copiedSide, setCopiedSide] = useState<'A' | 'B' | null>(null);
  const [shareTargetPrompt, setShareTargetPrompt] = useState<string | null>(null);

  // Search filter for dropdowns
  const [searchA, setSearchA] = useState('');
  const [searchB, setSearchB] = useState('');
  const [isDropdownAOpen, setIsDropdownAOpen] = useState(false);
  const [isDropdownBOpen, setIsDropdownBOpen] = useState(false);

  // Sync initial IDs when modal re-opens or props change
  React.useEffect(() => {
    if (initialPromptAId && history.some((h) => h.id === initialPromptAId)) {
      setSelectedIdA(initialPromptAId);
    }
    if (initialPromptBId && history.some((h) => h.id === initialPromptBId)) {
      setSelectedIdB(initialPromptBId);
    }
  }, [initialPromptAId, initialPromptBId, history]);

  // Active prompt objects
  const promptA = useMemo(() => {
    return history.find((h) => h.id === selectedIdA) || sortedHistory[1] || sortedHistory[0];
  }, [history, selectedIdA, sortedHistory]);

  const promptB = useMemo(() => {
    return history.find((h) => h.id === selectedIdB) || sortedHistory[0];
  }, [history, selectedIdB, sortedHistory]);

  // Get active text based on selected field
  const getText = (prompt?: PromptHistoryItem) => {
    if (!prompt) return '';
    if (activeField === 'original') return prompt.originalText || '';
    if (activeField === 'translated') return prompt.translatedText || prompt.optimizedText || '';
    return prompt.optimizedText || prompt.originalText || '';
  };

  const textA = useMemo(() => getText(promptA), [promptA, activeField]);
  const textB = useMemo(() => getText(promptB), [promptB, activeField]);

  // Compute Diff & Metrics
  const diffResult = useMemo(() => {
    return computeWordDiff(textA, textB);
  }, [textA, textB]);

  const metricsA = useMemo(() => calculatePromptMetrics(textA), [textA]);
  const metricsB = useMemo(() => calculatePromptMetrics(textB), [textB]);

  // Swap sides
  const handleSwap = () => {
    setSelectedIdA(selectedIdB);
    setSelectedIdB(selectedIdA);
  };

  // Copy helper
  const handleCopy = (text: string, side: 'A' | 'B') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedSide(side);
    showToast(
      lang === 'ar'
        ? `✓ تم نسخ ${side === 'A' ? 'الأمر (أ)' : 'الأمر (ب)'} إلى الحافظة بنجاح!`
        : `✓ Copied prompt (${side}) to clipboard!`
    );
    setTimeout(() => setCopiedSide(null), 2000);
  };

  // Format date helper
  const formatDate = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return (
        d.toLocaleTimeString(lang === 'ar' ? 'ar-u-nu-latn' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit'
        }) +
        ' · ' +
        d.toLocaleDateString(lang === 'ar' ? 'ar-u-nu-latn' : 'en-US', {
          month: 'short',
          day: 'numeric'
        })
      );
    } catch {
      return '';
    }
  };

  // Model display helper
  const formatModel = (model: ModelType | string) => {
    switch (model) {
      case 'gemini':
        return 'Google Gemini 2.5';
      case 'chatgpt':
        return 'ChatGPT 4o';
      case 'claude':
        return 'Claude 3.5 Sonnet';
      case 'midjourney':
        return 'Midjourney v6';
      case 'notebooklm':
        return 'NotebookLM';
      case 'meta':
        return 'Meta Llama 3';
      default:
        return model || 'AI Model';
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div
        className={`w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl shadow-2xl flex flex-col transition-all overflow-hidden ${
          isFullScreen
            ? 'h-[98vh] max-w-[98vw]'
            : 'max-h-[92vh] max-w-6xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 dark:border-stone-800 bg-[#fdfcfa] dark:bg-stone-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#916a24] via-[#c29b40] to-[#ecd197] flex items-center justify-center text-white shadow-md ring-2 ring-[#c29b40]/20">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 font-sans">
                  {lang === 'ar' ? 'أداة مقارنة البرومبت' : 'Prompt Comparison Tool'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#c29b40]/15 text-[#8c6a1e] dark:text-amber-300 border border-[#c29b40]/30">
                  {lang === 'ar' ? 'جنباً إلى جنب' : 'Side-by-Side Diff'}
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {lang === 'ar'
                  ? 'قارن بين نسختين من الأوامر واكتشف التحسينات والفروقات اللفظية والتقنية'
                  : 'Compare two prompt iterations and inspect structural, textual, and stylistic improvements'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-2 rounded-xl text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              title={isFullScreen ? (lang === 'ar' ? 'تصغير' : 'Exit Fullscreen') : (lang === 'ar' ? 'ملء الشاشة' : 'Fullscreen')}
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Check if user has at least 2 items to compare */}
        {history.length < 2 ? (
          <div className="p-8 text-center space-y-4 my-auto">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/10 text-[#c29b40] flex items-center justify-center">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="font-bold text-base text-stone-800 dark:text-stone-100">
                {lang === 'ar' ? 'سجل الأوامر يحتوي على أقل من أمرين' : 'Need at least two prompts to compare'}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {lang === 'ar'
                  ? 'يرجى إنشاء وتوليد أوامر برومبت إضافية في السجل حتى تتمكن أداة المقارنة من تحليل الفروقات جنباً إلى جنب.'
                  : 'Please generate or save more prompts into your history so the comparison tool can display side-by-side improvements.'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#c29b40] text-white font-bold text-xs hover:bg-[#b38d35] transition-all cursor-pointer"
            >
              {lang === 'ar' ? 'حسناً، فهمت' : 'Got it'}
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">

            {/* Prompt Selection Bar (Prompt A ⇄ Prompt B) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-stone-50 dark:bg-stone-800/60 p-3.5 rounded-2xl border border-stone-200/80 dark:border-stone-800">
              
              {/* Selector A */}
              <div className="md:col-span-5 relative">
                <label className="block text-[11px] font-bold text-stone-500 dark:text-stone-400 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span>{lang === 'ar' ? 'الأمر (أ) — النسخة المرجعية أو السابقة' : 'Prompt (A) — Reference / Baseline'}</span>
                  </span>
                  {promptA && <span className="text-[10px] text-stone-400">{formatDate(promptA.timestamp)}</span>}
                </label>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownAOpen(!isDropdownAOpen);
                      setIsDropdownBOpen(false);
                    }}
                    className="w-full text-right rtl:text-right ltr:text-left px-3 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 hover:border-[#c29b40] text-xs font-bold flex items-center justify-between gap-2 shadow-3xs cursor-pointer"
                  >
                    <span className="truncate">
                      {promptA ? promptA.originalText || promptA.optimizedText : (lang === 'ar' ? 'اختر أمراً...' : 'Select prompt...')}
                    </span>
                    <ChevronDown className="w-4 h-4 shrink-0 text-stone-400" />
                  </button>

                  {/* Dropdown Menu A */}
                  {isDropdownAOpen && (
                    <div className="absolute top-full mt-1.5 inset-x-0 z-30 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-2xl shadow-xl p-2 max-h-60 overflow-y-auto space-y-1">
                      <div className="relative mb-2">
                        <Search className="w-3.5 h-3.5 absolute right-2.5 rtl:right-2.5 rtl:left-auto ltr:left-2.5 ltr:right-auto top-2.5 text-stone-400" />
                        <input
                          type="text"
                          placeholder={lang === 'ar' ? 'بحث في السجل...' : 'Search history...'}
                          value={searchA}
                          onChange={(e) => setSearchA(e.target.value)}
                          className="w-full text-xs py-1.5 px-7 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-1 focus:ring-[#c29b40]"
                        />
                      </div>
                      {sortedHistory
                        .filter((item) =>
                          item.originalText.toLowerCase().includes(searchA.toLowerCase()) ||
                          item.optimizedText.toLowerCase().includes(searchA.toLowerCase())
                        )
                        .map((item) => (
                          <div
                            key={item.id}
                            onClick={() => {
                              setSelectedIdA(item.id);
                              setIsDropdownAOpen(false);
                            }}
                            className={`p-2 rounded-xl text-xs cursor-pointer transition-colors flex flex-col gap-0.5 ${
                              item.id === selectedIdA
                                ? 'bg-[#c29b40]/15 text-[#8c6a1e] dark:text-amber-300 font-bold'
                                : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                            }`}
                          >
                            <span className="truncate">{item.originalText || item.optimizedText}</span>
                            <span className="text-[10px] text-stone-400 flex items-center justify-between">
                              <span>{formatModel(item.model)}</span>
                              <span>{formatDate(item.timestamp)}</span>
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Swap Button */}
              <div className="md:col-span-2 flex justify-center py-1">
                <button
                  type="button"
                  onClick={handleSwap}
                  className="px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 hover:bg-[#c29b40]/10 hover:border-[#c29b40]/40 text-stone-700 dark:text-stone-200 text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                  title={lang === 'ar' ? 'تبديل الطرفين (A ⇄ B)' : 'Swap Prompts (A ⇄ B)'}
                >
                  <ArrowLeftRight className="w-3.5 h-3.5 text-[#c29b40]" />
                  <span>{lang === 'ar' ? 'تبديل' : 'Swap'}</span>
                </button>
              </div>

              {/* Selector B */}
              <div className="md:col-span-5 relative">
                <label className="block text-[11px] font-bold text-stone-500 dark:text-stone-400 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>{lang === 'ar' ? 'الأمر (ب) — النسخة المحسنة أو المقارنة' : 'Prompt (B) — Improved / Target'}</span>
                  </span>
                  {promptB && <span className="text-[10px] text-stone-400">{formatDate(promptB.timestamp)}</span>}
                </label>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownBOpen(!isDropdownBOpen);
                      setIsDropdownAOpen(false);
                    }}
                    className="w-full text-right rtl:text-right ltr:text-left px-3 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 hover:border-[#c29b40] text-xs font-bold flex items-center justify-between gap-2 shadow-3xs cursor-pointer"
                  >
                    <span className="truncate">
                      {promptB ? promptB.originalText || promptB.optimizedText : (lang === 'ar' ? 'اختر أمراً...' : 'Select prompt...')}
                    </span>
                    <ChevronDown className="w-4 h-4 shrink-0 text-stone-400" />
                  </button>

                  {/* Dropdown Menu B */}
                  {isDropdownBOpen && (
                    <div className="absolute top-full mt-1.5 inset-x-0 z-30 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-2xl shadow-xl p-2 max-h-60 overflow-y-auto space-y-1">
                      <div className="relative mb-2">
                        <Search className="w-3.5 h-3.5 absolute right-2.5 rtl:right-2.5 rtl:left-auto ltr:left-2.5 ltr:right-auto top-2.5 text-stone-400" />
                        <input
                          type="text"
                          placeholder={lang === 'ar' ? 'بحث في السجل...' : 'Search history...'}
                          value={searchB}
                          onChange={(e) => setSearchB(e.target.value)}
                          className="w-full text-xs py-1.5 px-7 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-1 focus:ring-[#c29b40]"
                        />
                      </div>
                      {sortedHistory
                        .filter((item) =>
                          item.originalText.toLowerCase().includes(searchB.toLowerCase()) ||
                          item.optimizedText.toLowerCase().includes(searchB.toLowerCase())
                        )
                        .map((item) => (
                          <div
                            key={item.id}
                            onClick={() => {
                              setSelectedIdB(item.id);
                              setIsDropdownBOpen(false);
                            }}
                            className={`p-2 rounded-xl text-xs cursor-pointer transition-colors flex flex-col gap-0.5 ${
                              item.id === selectedIdB
                                ? 'bg-[#c29b40]/15 text-[#8c6a1e] dark:text-amber-300 font-bold'
                                : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                            }`}
                          >
                            <span className="truncate">{item.originalText || item.optimizedText}</span>
                            <span className="text-[10px] text-stone-400 flex items-center justify-between">
                              <span>{formatModel(item.model)}</span>
                              <span>{formatDate(item.timestamp)}</span>
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Mode & Field Controls Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-stone-100 dark:border-stone-800">
              
              {/* Field Filter Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setActiveField('optimized')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    activeField === 'optimized'
                      ? 'bg-white dark:bg-stone-700 text-[#8c6a1e] dark:text-amber-300 shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                >
                  {lang === 'ar' ? 'الأمر الهندسي المحسن' : 'Optimized Prompt'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveField('original')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    activeField === 'original'
                      ? 'bg-white dark:bg-stone-700 text-[#8c6a1e] dark:text-amber-300 shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                >
                  {lang === 'ar' ? 'الفكرة الأصلية' : 'Original Thought'}
                </button>
                {Boolean(promptA?.translatedText || promptB?.translatedText) && (
                  <button
                    type="button"
                    onClick={() => setActiveField('translated')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      activeField === 'translated'
                        ? 'bg-white dark:bg-stone-700 text-[#8c6a1e] dark:text-amber-300 shadow-xs'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                    }`}
                  >
                    {lang === 'ar' ? 'الترجمة الإنجليزية' : 'English Translation'}
                  </button>
                )}
              </div>

              {/* View Layout & Diff Switches */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={() => setViewMode('side-by-side')}
                    className={`px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      viewMode === 'side-by-side'
                        ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                    title={lang === 'ar' ? 'عرض عمودين جنباً إلى جنب' : 'Side by Side View'}
                  >
                    <Columns className="w-3.5 h-3.5 text-[#c29b40]" />
                    <span>{lang === 'ar' ? 'جنباً إلى جنب' : 'Side-by-Side'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewMode('unified')}
                    className={`px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      viewMode === 'unified'
                        ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                    title={lang === 'ar' ? 'عرض التغييرات المدمجة' : 'Unified Diff View'}
                  >
                    <ListFilter className="w-3.5 h-3.5 text-[#c29b40]" />
                    <span>{lang === 'ar' ? 'عرض مدمج' : 'Unified'}</span>
                  </button>
                </div>

                {/* Highlight switch */}
                <button
                  type="button"
                  onClick={() => setHighlightDiff(!highlightDiff)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                    highlightDiff
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                      : 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    {highlightDiff
                      ? (lang === 'ar' ? 'تمكين التمييز الملون' : 'Diff Highlights On')
                      : (lang === 'ar' ? 'النص الخام' : 'Plain Text')}
                  </span>
                </button>
              </div>

            </div>

            {/* Analytical Comparison Cards (Improvement Highlights) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Word Count */}
              <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-800 space-y-1">
                <span className="text-[10px] text-stone-400 font-bold block">
                  {lang === 'ar' ? 'عدد الكلمات والتفصيل:' : 'Word Count:'}
                </span>
                <div className="flex items-baseline justify-between">
                  <div className="flex items-center gap-1 font-mono font-black text-sm">
                    <span className="text-rose-600 dark:text-rose-400">{metricsA.wordsCount}</span>
                    <span className="text-stone-400 text-xs">→</span>
                    <span className="text-emerald-600 dark:text-emerald-400">{metricsB.wordsCount}</span>
                  </div>
                  {metricsA.wordsCount > 0 && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                        metricsB.wordsCount >= metricsA.wordsCount
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {metricsB.wordsCount >= metricsA.wordsCount ? '+' : ''}
                      {Math.round(((metricsB.wordsCount - metricsA.wordsCount) / metricsA.wordsCount) * 100)}%
                    </span>
                  )}
                </div>
              </div>

              {/* Token Estimate */}
              <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-800 space-y-1">
                <span className="text-[10px] text-stone-400 font-bold block">
                  {lang === 'ar' ? 'تقدير التوكنز (Tokens):' : 'Tokens Estimate:'}
                </span>
                <div className="flex items-center gap-1 font-mono font-black text-sm text-stone-800 dark:text-stone-200">
                  <span className="text-rose-600 dark:text-rose-400">~{metricsA.tokensEstimate}</span>
                  <span className="text-stone-400 text-xs">→</span>
                  <span className="text-emerald-600 dark:text-emerald-400">~{metricsB.tokensEstimate}</span>
                </div>
              </div>

              {/* Added / Modified Words */}
              <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-800 space-y-1">
                <span className="text-[10px] text-stone-400 font-bold block">
                  {lang === 'ar' ? 'الكلمات المضافة / المعدلة:' : 'Words Added / Changed:'}
                </span>
                <div className="flex items-center gap-2 font-mono font-black text-sm">
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs">
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>+{diffResult.addedCount}</span>
                  </span>
                  <span className="flex items-center gap-1 text-rose-500 text-xs">
                    <MinusCircle className="w-3.5 h-3.5" />
                    <span>-{diffResult.removedCount}</span>
                  </span>
                </div>
              </div>

              {/* AI Model Shift */}
              <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-800 space-y-1">
                <span className="text-[10px] text-stone-400 font-bold block">
                  {lang === 'ar' ? 'النموذج الذكي المستهدف:' : 'Target Model Shift:'}
                </span>
                <div className="text-xs font-bold truncate text-stone-700 dark:text-stone-300">
                  {promptA?.model === promptB?.model ? (
                    <span>{formatModel(promptA?.model || 'gemini')}</span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <span className="truncate">{promptA?.model}</span>
                      <span>→</span>
                      <span className="text-[#8c6a1e] dark:text-amber-400 truncate">{promptB?.model}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Side-by-Side View */}
            {viewMode === 'side-by-side' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Column A Card */}
                <div className="flex flex-col rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-[#fffdfd] dark:bg-stone-900 overflow-hidden shadow-xs">
                  {/* Card Header A */}
                  <div className="p-3.5 border-b border-rose-100 dark:border-rose-950/60 bg-rose-50/40 dark:bg-rose-950/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                      <span className="font-bold text-xs text-rose-900 dark:text-rose-300">
                        {lang === 'ar' ? 'الأمر (أ) — النسخة الأصلية' : 'Prompt (A) — Original Version'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleCopy(textA, 'A')}
                        className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-stone-800 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
                        title={lang === 'ar' ? 'نسخ الأمر' : 'Copy prompt'}
                      >
                        {copiedSide === 'A' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      {onApplyToBuilder && promptA && (
                        <button
                          type="button"
                          onClick={() => {
                            onApplyToBuilder(promptA.originalText, promptA.model, promptA.tone, promptA.category);
                            onClose();
                            showToast(lang === 'ar' ? 'تم استيراد الأمر (أ) إلى المولد!' : 'Prompt A applied to builder!');
                          }}
                          className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-stone-800 text-stone-500 hover:text-[#c29b40] transition-colors cursor-pointer"
                          title={lang === 'ar' ? 'تطبيق في المولد' : 'Apply to builder'}
                        >
                          <Sliders className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onSendToTester && (
                        <button
                          type="button"
                          onClick={() => {
                            onSendToTester(textA);
                            onClose();
                          }}
                          className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-stone-800 text-stone-500 hover:text-emerald-600 transition-colors cursor-pointer"
                          title={lang === 'ar' ? 'فحص في المنصة' : 'Send to tester'}
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setShareTargetPrompt(textA)}
                        className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-stone-800 text-stone-500 hover:text-[#c29b40] transition-colors cursor-pointer"
                        title={lang === 'ar' ? 'مشاركة مع أدوات الذكاء (جيمني، شات جي بي تي، كلود...)' : 'Share to AI Tools'}
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Metadata Chips A */}
                  {promptA && (
                    <div className="px-3.5 py-2 bg-stone-50/60 dark:bg-stone-800/40 border-b border-stone-100 dark:border-stone-800 flex flex-wrap items-center gap-2 text-[10px] text-stone-500">
                      <span className="font-semibold text-stone-700 dark:text-stone-300">
                        {formatModel(promptA.model)}
                      </span>
                      <span>·</span>
                      <span>{promptA.tone}</span>
                      <span>·</span>
                      <span>{promptA.category}</span>
                      {promptA.tags && promptA.tags.length > 0 && (
                        <span className="text-[#8c6a1e] dark:text-amber-400 font-medium">
                          #{promptA.tags.join(' #')}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Text Content A */}
                  <div className="p-4 flex-1 overflow-y-auto max-h-80 min-h-48 text-xs leading-relaxed text-stone-800 dark:text-stone-200 font-sans whitespace-pre-wrap select-text">
                    {highlightDiff ? (
                      diffResult.partsA.map((part, idx) => (
                        <span
                          key={idx}
                          className={
                            part.removed
                              ? 'bg-rose-500/20 text-rose-800 dark:text-rose-200 line-through rounded-xs px-0.5'
                              : ''
                          }
                        >
                          {part.value}
                        </span>
                      ))
                    ) : (
                      textA || (lang === 'ar' ? '(فارغ)' : '(empty)')
                    )}
                  </div>
                </div>

                {/* Column B Card */}
                <div className="flex flex-col rounded-2xl border border-emerald-200 dark:border-emerald-900/40 bg-[#fafffd] dark:bg-stone-900 overflow-hidden shadow-xs">
                  {/* Card Header B */}
                  <div className="p-3.5 border-b border-emerald-100 dark:border-emerald-950/60 bg-emerald-50/40 dark:bg-emerald-950/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                      <span className="font-bold text-xs text-emerald-900 dark:text-emerald-300">
                        {lang === 'ar' ? 'الأمر (ب) — النسخة المحسنة' : 'Prompt (B) — Improved Version'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleCopy(textB, 'B')}
                        className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-stone-800 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
                        title={lang === 'ar' ? 'نسخ الأمر' : 'Copy prompt'}
                      >
                        {copiedSide === 'B' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      {onApplyToBuilder && promptB && (
                        <button
                          type="button"
                          onClick={() => {
                            onApplyToBuilder(promptB.originalText, promptB.model, promptB.tone, promptB.category);
                            onClose();
                            showToast(lang === 'ar' ? 'تم استيراد الأمر (ب) إلى المولد!' : 'Prompt B applied to builder!');
                          }}
                          className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-stone-800 text-stone-500 hover:text-[#c29b40] transition-colors cursor-pointer"
                          title={lang === 'ar' ? 'تطبيق في المولد' : 'Apply to builder'}
                        >
                          <Sliders className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onSendToTester && (
                        <button
                          type="button"
                          onClick={() => {
                            onSendToTester(textB);
                            onClose();
                          }}
                          className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-stone-800 text-stone-500 hover:text-emerald-600 transition-colors cursor-pointer"
                          title={lang === 'ar' ? 'فحص في المنصة' : 'Send to tester'}
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setShareTargetPrompt(textB)}
                        className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-stone-800 text-stone-500 hover:text-[#c29b40] transition-colors cursor-pointer"
                        title={lang === 'ar' ? 'مشاركة مع أدوات الذكاء (جيمني، شات جي بي تي، كلود...)' : 'Share to AI Tools'}
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Metadata Chips B */}
                  {promptB && (
                    <div className="px-3.5 py-2 bg-stone-50/60 dark:bg-stone-800/40 border-b border-stone-100 dark:border-stone-800 flex flex-wrap items-center gap-2 text-[10px] text-stone-500">
                      <span className="font-semibold text-stone-700 dark:text-stone-300">
                        {formatModel(promptB.model)}
                      </span>
                      <span>·</span>
                      <span>{promptB.tone}</span>
                      <span>·</span>
                      <span>{promptB.category}</span>
                      {promptB.tags && promptB.tags.length > 0 && (
                        <span className="text-[#8c6a1e] dark:text-amber-400 font-medium">
                          #{promptB.tags.join(' #')}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Text Content B */}
                  <div className="p-4 flex-1 overflow-y-auto max-h-80 min-h-48 text-xs leading-relaxed text-stone-800 dark:text-stone-200 font-sans whitespace-pre-wrap select-text">
                    {highlightDiff ? (
                      diffResult.partsB.map((part, idx) => (
                        <span
                          key={idx}
                          className={
                            part.added
                              ? 'bg-emerald-500/25 text-emerald-900 dark:text-emerald-200 font-semibold rounded-xs px-0.5'
                              : ''
                          }
                        >
                          {part.value}
                        </span>
                      ))
                    ) : (
                      textB || (lang === 'ar' ? '(فارغ)' : '(empty)')
                    )}
                  </div>
                </div>

              </div>
            ) : (
              /* Unified Diff View */
              <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-850/50 max-h-96 overflow-y-auto">
                <div className="flex items-center gap-4 text-[11px] mb-3 pb-2 border-b border-stone-200/60 dark:border-stone-800 text-stone-500 font-semibold">
                  <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-xs"></span>
                    <span>{lang === 'ar' ? 'كلمات تمت إضافتها في (ب)' : 'Added in (B)'}</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400">
                    <span className="w-2.5 h-2.5 bg-rose-500 rounded-xs"></span>
                    <span>{lang === 'ar' ? 'كلمات تم حذفها من (أ)' : 'Removed from (A)'}</span>
                  </span>
                </div>

                <div className="text-xs leading-relaxed font-sans whitespace-pre-wrap select-text text-stone-800 dark:text-stone-200">
                  {diffResult.unified.map((part, idx) => {
                    if (part.added) {
                      return (
                        <span key={idx} className="bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 font-bold px-1 rounded-xs">
                          {part.value}
                        </span>
                      );
                    }
                    if (part.removed) {
                      return (
                        <span key={idx} className="bg-rose-500/20 text-rose-800 dark:text-rose-200 line-through px-1 rounded-xs">
                          {part.value}
                        </span>
                      );
                    }
                    return <span key={idx}>{part.value}</span>;
                  })}
                </div>
              </div>
            )}

            {/* Qualitative Improvement Breakdown Banner */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-[#c29b40]/25 text-xs text-stone-700 dark:text-stone-300 space-y-2">
              <div className="font-bold flex items-center gap-2 text-[#8c6a1e] dark:text-amber-300">
                <Sparkles className="w-4 h-4 text-[#c29b40]" />
                <span>{lang === 'ar' ? 'تحليل التطور الهندسي للأمر:' : 'Engineering Improvement Breakdown:'}</span>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>
                    {metricsB.wordsCount >= metricsA.wordsCount
                      ? (lang === 'ar'
                          ? `توسيع في الصياغة والتفاصيل بنسبة +${Math.round(((metricsB.wordsCount - metricsA.wordsCount) / Math.max(1, metricsA.wordsCount)) * 100)}% لتوجيه الذكاء الاصطناعي بشكل أدق.`
                          : `Vocabulary expanded by +${Math.round(((metricsB.wordsCount - metricsA.wordsCount) / Math.max(1, metricsA.wordsCount)) * 100)}% for richer AI guidance.`)
                      : (lang === 'ar'
                          ? 'تكثيف وتبسيط للصياغة لحذف الحشو والتركيز على الكلمات المفتاحية.'
                          : 'Concise simplification eliminating filler words.')}
                  </span>
                </li>

                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>
                    {lang === 'ar'
                      ? `تم استخدام ${metricsB.uniqueWordsCount} كلمة فريدة في النسخة (ب) مقارنة بـ ${metricsA.uniqueWordsCount} في النسخة (أ).`
                      : `Used ${metricsB.uniqueWordsCount} unique words in (B) vs ${metricsA.uniqueWordsCount} in (A).`}
                  </span>
                </li>
              </ul>
            </div>

          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 border-t border-stone-200 dark:border-stone-800 bg-[#fdfcfa] dark:bg-stone-900/90 text-xs">
          <div className="text-stone-400 text-[11px]">
            {lang === 'ar'
              ? 'يمكنك تبديل الأمرين أو تغيير الحقل المراد مقارنته من القوائم العلوية.'
              : 'Switch prompts or active comparison fields from the top selectors.'}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-bold transition-all cursor-pointer shadow-sm"
          >
            {lang === 'ar' ? 'إغلاق الأداة' : 'Close Comparison'}
          </button>
        </div>

        {/* Share to AI Modal */}
        {shareTargetPrompt && (
          <SharePromptToAiModal
            isOpen={Boolean(shareTargetPrompt)}
            onClose={() => setShareTargetPrompt(null)}
            promptText={shareTargetPrompt}
            lang={lang}
          />
        )}

      </div>
    </div>
  );
}
