/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Bot,
  Globe,
  Compass,
  MessageSquare,
  Image as ImageIcon,
  Cpu,
  Layers,
  Send,
  BookOpen,
  Code2
} from 'lucide-react';
import { AppLanguage } from '../types';
import { showToast } from './ToastNotification';

export interface AiToolOption {
  id: string;
  name: string;
  nameAr: string;
  category: 'chat' | 'search' | 'image' | 'developer' | 'notebook';
  badge: string;
  badgeColor: string;
  descriptionAr: string;
  descriptionEn: string;
  iconBg: string;
  getUrl: (prompt: string) => string;
  formatPrompt?: (prompt: string) => string;
}

export const AI_TOOLS: AiToolOption[] = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    nameAr: 'جوجل جيمني',
    category: 'chat',
    badge: 'Gemini 2.5',
    badgeColor: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
    descriptionAr: 'نموذج جوجل الذكي للمحادثة، البرمجة، والتحليل المنطقي السريع',
    descriptionEn: 'Google multimodal assistant for reasoning, text & coding',
    iconBg: 'from-blue-600 via-indigo-600 to-cyan-500',
    getUrl: () => 'https://gemini.google.com/app'
  },
  {
    id: 'chatgpt',
    name: 'OpenAI ChatGPT',
    nameAr: 'شات جي بي تي',
    category: 'chat',
    badge: 'GPT-4o',
    badgeColor: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
    descriptionAr: 'منصة OpenAI الأشهر للمحادثة وصياغة الحلول الإبداعية',
    descriptionEn: 'OpenAI conversational assistant with direct query prefill',
    iconBg: 'from-emerald-600 via-teal-600 to-green-500',
    getUrl: (prompt) => `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    nameAr: 'أنثروبيك كلود',
    category: 'chat',
    badge: 'Claude 3.5',
    badgeColor: 'bg-amber-500/10 text-amber-850 dark:text-amber-300 border-amber-500/20',
    descriptionAr: 'الأفضل في التحليل الدقيق، الكتابة الطبيعية المتقدمة، وهندسة الأكواد',
    descriptionEn: 'Anthropic AI acclaimed for nuanced reasoning, writing & programming',
    iconBg: 'from-amber-600 via-orange-600 to-yellow-600',
    getUrl: (prompt) => `https://claude.ai/new?q=${encodeURIComponent(prompt)}`
  },
  {
    id: 'perplexity',
    name: 'Perplexity AI',
    nameAr: 'بيربلكسيتي',
    category: 'search',
    badge: 'Live Search',
    badgeColor: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/20',
    descriptionAr: 'محرك إجابات ذكي مع البحث المباشر وتوثيق المصادر الفورية',
    descriptionEn: 'AI search engine that answers with real-time citations',
    iconBg: 'from-cyan-600 via-teal-600 to-sky-500',
    getUrl: (prompt) => `https://www.perplexity.ai/search?q=${encodeURIComponent(prompt)}`
  },
  {
    id: 'copilot',
    name: 'Microsoft Copilot',
    nameAr: 'مايكروسوفت كوبايلوت',
    category: 'chat',
    badge: 'GPT-4 + Web',
    badgeColor: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20',
    descriptionAr: 'مساعد مايكروسوفت الشامل المدعوم ببحث Bing وتوليد الصور',
    descriptionEn: 'Microsoft assistant powered by web grounding & GPT-4',
    iconBg: 'from-purple-600 via-indigo-600 to-pink-500',
    getUrl: (prompt) => `https://copilot.microsoft.com/?q=${encodeURIComponent(prompt)}`
  },
  {
    id: 'aistudio',
    name: 'Google AI Studio',
    nameAr: 'جوجل ستوديو المطورين',
    category: 'developer',
    badge: 'Dev Suite',
    badgeColor: 'bg-stone-500/10 text-stone-700 dark:text-stone-300 border-stone-500/20',
    descriptionAr: 'بيئة المطورين لاختبار نماذج Gemini وضبط معلمات System Instructions',
    descriptionEn: 'Developer console for testing Gemini models & system instructions',
    iconBg: 'from-stone-700 via-stone-800 to-stone-900',
    getUrl: () => 'https://aistudio.google.com/prompts/new_chat'
  },
  {
    id: 'notebooklm',
    name: 'Google NotebookLM',
    nameAr: 'جوجل نوت بوك إل إم',
    category: 'notebook',
    badge: 'Research',
    badgeColor: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20',
    descriptionAr: 'مفكرة بحثية ذكية متخصصة في تلخيص وتنظيم مصادر المعرفة',
    descriptionEn: 'Personalized AI collaborator grounded in your reference documents',
    iconBg: 'from-rose-600 via-pink-600 to-red-500',
    getUrl: () => 'https://notebooklm.google.com/'
  },
  {
    id: 'midjourney',
    name: 'Midjourney / Discord',
    nameAr: 'ميدجورني ديسكورد',
    category: 'image',
    badge: 'v6.1',
    badgeColor: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20',
    descriptionAr: 'توليد الصور الفنية — يتم نسخ الأمر بصيغة /imagine prompt: تلقائياً',
    descriptionEn: 'Text-to-image generator (copies formatted with /imagine prompt:)',
    iconBg: 'from-indigo-700 via-blue-800 to-violet-900',
    formatPrompt: (p) => (p.startsWith('/imagine') ? p : `/imagine prompt: ${p}`),
    getUrl: () => 'https://discord.com/app'
  },
  {
    id: 'mistral',
    name: 'Mistral Le Chat',
    nameAr: 'ميسترال لوشات',
    category: 'chat',
    badge: 'Mistral Large',
    badgeColor: 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20',
    descriptionAr: 'المنصة الأوروبية الرائدة لنماذج الذكاء الاصطناعي المفتوحة',
    descriptionEn: 'European frontier open models for multilingual conversational chat',
    iconBg: 'from-orange-600 via-amber-600 to-red-500',
    getUrl: () => 'https://chat.mistral.ai/chat'
  },
  {
    id: 'poe',
    name: 'Poe by Quora',
    nameAr: 'منصة بو (Poe)',
    category: 'chat',
    badge: 'Multi-Bot',
    badgeColor: 'bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20',
    descriptionAr: 'واجهة موحدة تتيح التحدث مع مئات البوتات والنماذج المتنوعة',
    descriptionEn: 'Unified hub granting access to multiple state-of-the-art bots',
    iconBg: 'from-violet-600 via-purple-700 to-indigo-800',
    getUrl: () => 'https://poe.com/'
  }
];

interface SharePromptToAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  promptText: string;
  lang: AppLanguage;
  model?: string;
  tone?: string;
}

export default function SharePromptToAiModal({
  isOpen,
  onClose,
  promptText,
  lang,
  model,
  tone
}: SharePromptToAiModalProps) {
  const [copiedFormat, setCopiedFormat] = useState<'raw' | 'midjourney' | 'markdown' | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'chat' | 'search' | 'image' | 'developer'>('all');
  const [lastLaunchedTool, setLastLaunchedTool] = useState<string | null>(null);

  if (!isOpen) return null;

  const cleanPrompt = promptText?.trim() || '';

  // Copy helper
  const handleCopyFormatted = (format: 'raw' | 'midjourney' | 'markdown') => {
    let textToCopy = cleanPrompt;
    if (format === 'midjourney') {
      textToCopy = cleanPrompt.startsWith('/imagine') ? cleanPrompt : `/imagine prompt: ${cleanPrompt}`;
    } else if (format === 'markdown') {
      textToCopy = `\`\`\`prompt\n${cleanPrompt}\n\`\`\``;
    }

    navigator.clipboard.writeText(textToCopy);
    setCopiedFormat(format);
    showToast(
      lang === 'ar'
        ? '✓ تم نسخ الأمر إلى الحافظة بنجاح، يمكنك لصقه مباشرة في أي أداة ذكاء اصطناعي!'
        : '✓ Prompt copied to clipboard, ready to paste in any AI tool!'
    );
    setTimeout(() => setCopiedFormat(null), 2200);
  };

  // Launch AI Tool
  const handleLaunchTool = (tool: AiToolOption) => {
    // 1. Copy formatted prompt to clipboard so user can just Ctrl+V
    const textToCopy = tool.formatPrompt ? tool.formatPrompt(cleanPrompt) : cleanPrompt;
    navigator.clipboard.writeText(textToCopy);

    setLastLaunchedTool(tool.id);
    showToast(
      lang === 'ar'
        ? `✓ تم نسخ الأمر وفتح ${tool.nameAr} في نافذة جديدة!`
        : `✓ Prompt copied! Opening ${tool.name} in a new tab...`
    );

    setTimeout(() => setLastLaunchedTool(null), 3000);
  };

  // Web Share API
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: lang === 'ar' ? 'أمر برومبت من عرب برومبت' : 'Prompt from ArabPrompt',
          text: cleanPrompt
        });
        showToast(lang === 'ar' ? '✓ تمت المشاركة بنجاح' : '✓ Shared successfully');
      } catch (err) {
        // User cancelled share
      }
    } else {
      handleCopyFormatted('raw');
    }
  };

  const filteredTools = AI_TOOLS.filter((t) => {
    if (selectedCategory === 'all') return true;
    return t.category === selectedCategory;
  });

  const wordCount = cleanPrompt ? cleanPrompt.split(/\s+/).filter(Boolean).length : 0;
  const charCount = cleanPrompt.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div
        className="w-full max-w-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-[#fdfcfa] dark:bg-stone-900/90">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#916a24] via-[#c29b40] to-[#ecd197] flex items-center justify-center text-white shadow-md ring-2 ring-[#c29b40]/20">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 font-sans">
                  {lang === 'ar' ? 'مشاركة البرومبت مع أدوات الذكاء الاصطناعي' : 'Share Prompt to AI Tools'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#c29b40]/15 text-[#8c6a1e] dark:text-amber-400 border border-[#c29b40]/30 hidden sm:inline-flex">
                  Gemini · ChatGPT · Claude
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {lang === 'ar'
                  ? 'انسخ الأمر أو افتحه مباشرة بنقرة واحدة داخل أداتك المفضلة'
                  : '1-click copy & launch into your preferred AI engine'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">

          {/* Prompt Preview Snippet Card */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-850/60 border border-stone-200/80 dark:border-stone-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#c29b40]" />
                <span>{lang === 'ar' ? 'نص البرومبت الجاهز للمشاركة:' : 'Engineered Prompt Preview:'}</span>
              </span>

              <div className="flex items-center gap-2 text-[11px] text-stone-400 font-mono">
                <span>{wordCount} {lang === 'ar' ? 'كلمة' : 'words'}</span>
                <span>·</span>
                <span>{charCount} {lang === 'ar' ? 'حرف' : 'chars'}</span>
              </div>
            </div>

            <div className="p-3 bg-white dark:bg-stone-900 rounded-xl border border-stone-200/70 dark:border-stone-700/70 text-xs font-sans text-stone-800 dark:text-stone-200 leading-relaxed max-h-32 overflow-y-auto whitespace-pre-wrap select-text">
              {cleanPrompt || (lang === 'ar' ? '(لا يوجد نص برومبت محدد)' : '(No prompt text)')}
            </div>

            {/* Quick Copy Format Chips */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleCopyFormatted('raw')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    copiedFormat === 'raw'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:border-[#c29b40]'
                  }`}
                >
                  {copiedFormat === 'raw' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3 text-[#c29b40]" />}
                  <span>{copiedFormat === 'raw' ? (lang === 'ar' ? 'تم النسخ!' : 'Copied!') : (lang === 'ar' ? 'نسخ النص العادي' : 'Copy Plain')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopyFormatted('midjourney')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    copiedFormat === 'midjourney'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:border-indigo-400'
                  }`}
                  title={lang === 'ar' ? 'نسخ مسبوقاً بـ /imagine prompt:' : 'Copy with /imagine prompt:'}
                >
                  {copiedFormat === 'midjourney' ? <Check className="w-3 h-3" /> : <ImageIcon className="w-3 h-3 text-indigo-500" />}
                  <span>/imagine Midjourney</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopyFormatted('markdown')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    copiedFormat === 'markdown'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:border-[#c29b40]'
                  }`}
                >
                  <Code2 className="w-3 h-3 text-stone-400" />
                  <span>Markdown Code</span>
                </button>
              </div>

              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="px-3 py-1.5 rounded-lg bg-[#c29b40]/15 hover:bg-[#c29b40]/25 text-[#8c6a1e] dark:text-amber-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-[#c29b40]/30"
                  title={lang === 'ar' ? 'مشاركة عبر واتساب، تيليجرام أو التطبيقات' : 'Share via system apps'}
                >
                  <Share2 className="w-3 h-3" />
                  <span>{lang === 'ar' ? 'مشاركة بالجهاز' : 'Device Share'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-[#c29b40]" />
              <span>{lang === 'ar' ? 'اختر الأداة للإطلاق الفوري:' : 'Select AI Tool to Launch:'}</span>
            </span>

            <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-white dark:bg-stone-700 text-[#8c6a1e] dark:text-amber-300 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {lang === 'ar' ? 'الكل' : 'All'}
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('chat')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedCategory === 'chat'
                    ? 'bg-white dark:bg-stone-700 text-[#8c6a1e] dark:text-amber-300 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {lang === 'ar' ? 'المحادثة والنصوص' : 'Chat & LLM'}
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('search')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedCategory === 'search'
                    ? 'bg-white dark:bg-stone-700 text-[#8c6a1e] dark:text-amber-300 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {lang === 'ar' ? 'البحث الذكي' : 'Search'}
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('image')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedCategory === 'image'
                    ? 'bg-white dark:bg-stone-700 text-[#8c6a1e] dark:text-amber-300 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {lang === 'ar' ? 'توليد الصور' : 'Images'}
              </button>
            </div>
          </div>

          {/* AI Tools Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredTools.map((tool) => {
              const targetUrl = tool.getUrl(cleanPrompt);
              const isRecent = lastLaunchedTool === tool.id;

              return (
                <div
                  key={tool.id}
                  className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 hover:border-[#c29b40]/60 dark:hover:border-[#c29b40]/60 transition-all hover:shadow-md flex flex-col justify-between gap-3 group"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${tool.iconBg} flex items-center justify-center text-white shadow-xs font-bold text-xs`}
                        >
                          {tool.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                            <span>{lang === 'ar' ? tool.nameAr : tool.name}</span>
                          </h4>
                          <span className="text-[10px] text-stone-400 font-medium">
                            {tool.name}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${tool.badgeColor}`}
                      >
                        {tool.badge}
                      </span>
                    </div>

                    <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
                      {lang === 'ar' ? tool.descriptionAr : tool.descriptionEn}
                    </p>
                  </div>

                  {/* Launch Anchor Button */}
                  <div className="pt-2 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between">
                    <span className="text-[10px] text-stone-400 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span>{lang === 'ar' ? 'ينسخ ويلصق مباشرة' : 'Auto-copies prompt'}</span>
                    </span>

                    <a
                      href={targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleLaunchTool(tool)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-3xs ${
                        isRecent
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#c29b40] hover:bg-[#b38d35] text-white group-hover:scale-102'
                      }`}
                    >
                      <span>
                        {isRecent
                          ? (lang === 'ar' ? 'تم الفتح والنسخ!' : 'Launched!')
                          : (lang === 'ar' ? 'فتح بالأداة' : 'Open')}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Helpful Tip */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-[#c29b40]/25 text-xs text-[#8c6a1e] dark:text-amber-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0 text-[#c29b40]" />
            <span>
              {lang === 'ar'
                ? '💡 عند النقر على أي أداة، يتم نسخ الأمر الهندسي إلى الحافظة تلقائياً وفتح الأداة في علامة تبويب جديدة لتتمكن من لصقه فوراً بمجرد الضغط على Ctrl+V.'
                : '💡 Clicking any tool automatically copies the engineered prompt and opens the target AI tool in a new tab for immediate paste with Ctrl+V.'}
            </span>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-stone-200 dark:border-stone-800 bg-[#fdfcfa] dark:bg-stone-900/90 text-xs">
          <span className="text-stone-400 text-[11px]">
            {lang === 'ar'
              ? 'يدعم الربط المباشر مع 10+ منصات ونماذج ذكاء اصطناعي رائدة'
              : 'Direct integration with 10+ top AI frontier platforms'}
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-bold transition-all cursor-pointer shadow-sm"
          >
            {lang === 'ar' ? 'إغلاق النافذة' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
}
