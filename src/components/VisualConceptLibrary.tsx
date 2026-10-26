/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Copy, 
  Check, 
  ExternalLink, 
  Layers, 
  Eye, 
  X, 
  Download, 
  FileJson, 
  FileText, 
  Sparkles, 
  Camera, 
  Sun, 
  Palette as PaletteIcon, 
  Film, 
  Maximize2,
  Wand2,
  Grid,
  List
} from 'lucide-react';
import { AppLanguage, ModelType } from '../types';
import { VISUAL_CONCEPTS_LIBRARY, GENRE_CATEGORIES, VisualConceptItem } from '../data/visualConceptsData';
import { showToast } from './ToastNotification';
import { appendSiteUrlToPrompt } from '../utils/brandWatermark';

interface VisualConceptLibraryProps {
  lang: AppLanguage;
  onSendToBuilder: (prompt: string, model?: ModelType) => void;
}

export default function VisualConceptLibrary({ lang, onSendToBuilder }: VisualConceptLibraryProps) {
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModalConcept, setActiveModalConcept] = useState<VisualConceptItem | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const isAr = lang === 'ar';

  // Filter concepts
  const filteredConcepts = useMemo(() => {
    return VISUAL_CONCEPTS_LIBRARY.filter((c) => {
      const matchGenre = selectedGenre === 'all' || c.genreKey === selectedGenre;
      if (!matchGenre) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        c.title.toLowerCase().includes(q) ||
        c.titleEn.toLowerCase().includes(q) ||
        c.narrative.toLowerCase().includes(q) ||
        c.narrativeEn.toLowerCase().includes(q) ||
        c.genre.toLowerCase().includes(q) ||
        c.mood.toLowerCase().includes(q) ||
        c.master_prompt.toLowerCase().includes(q)
      );
    });
  }, [selectedGenre, searchQuery]);

  const handleCopy = (text: string, key: string, label: string) => {
    const textWithBranding = appendSiteUrlToPrompt(text);
    navigator.clipboard.writeText(textWithBranding).then(() => {
      setCopiedKey(key);
      showToast(isAr ? `✓ تم نسخ ${label}` : `✓ Copied ${label}`, false);
      setTimeout(() => setCopiedKey(null), 2000);
    });
  };

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex).then(() => {
      showToast(isAr ? `✓ تم نسخ الكود: ${hex}` : `✓ Copied hex: ${hex}`, false);
    });
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(VISUAL_CONCEPTS_LIBRARY, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'visual_concepts_library.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(isAr ? '✓ تم تنزيل ملف JSON للمكتبة' : '✓ Downloaded library JSON', false);
  };

  const handleExportMarkdown = () => {
    let md = `# Visual Art Director & Prompt Synthesizer Library (36 Concepts)\n\n`;
    VISUAL_CONCEPTS_LIBRARY.forEach((c) => {
      md += `## ${c.id}. ${c.title} (${c.titleEn})\n`;
      md += `- **Genre:** ${c.genre} (${c.genreEn})\n`;
      md += `- **Mood:** ${c.mood} | **Aspect Ratio:** ${c.aspect_ratio}\n`;
      md += `- **Narrative:** ${c.narrative}\n`;
      md += `- **Composition:** ${c.composition}\n`;
      md += `- **Optics:** ${c.optics}\n`;
      md += `- **Lighting:** ${c.lighting}\n`;
      md += `- **Palette:** ${c.palette.join(', ')}\n`;
      md += `- **Textures:** ${c.textures}\n\n`;
      md += `### Master Prompt:\n\`\`\`\n${c.master_prompt} --ar ${c.aspect_ratio} --style raw --v 6.1\n\`\`\`\n\n`;
      md += `### Natural Prompt:\n> ${c.natural_prompt}\n\n---\n\n`;
    });
    md += `\nEngineered via ArabPrompt: https://arabiprompt.ai.studio\n`;

    const dataStr = 'data:text/markdown;charset=utf-8,' + encodeURIComponent(md);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'visual_library.md');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(isAr ? '✓ تم تنزيل ملف Markdown' : '✓ Downloaded library Markdown', false);
  };

  const handleCopyBatchMidjourney = () => {
    const batchText = filteredConcepts
      .map((c) => `${c.master_prompt} --ar ${c.aspect_ratio} --style raw --v 6.1`)
      .join('\n\n');
    navigator.clipboard.writeText(appendSiteUrlToPrompt(batchText)).then(() => {
      showToast(
        isAr 
          ? `✓ تم نسخ حزمة أوامر ${filteredConcepts.length} لـ Midjourney` 
          : `✓ Copied ${filteredConcepts.length} batch prompts for Midjourney`,
        false
      );
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-stone-900 via-stone-950 to-amber-950/40 p-6 sm:p-8 text-stone-100 border border-stone-800 shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAr ? 'محرك الإخراج الفني البصري' : 'Visual Art Director & Synthesizer'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
            {isAr ? '📚 مكتبة المفاهيم البصرية الفائقة' : '📚 High-Aesthetic Visual Concept Library'}
          </h1>
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
            {isAr
              ? '36 مفهوماً بصرياً موزعاً عبر 10 أجناس فنية متخصصة (رياضة، سينما، أفلام، خيال، فانتازيا، تاريخ، رعب، خيال علمي، طبيعة، بورتريه) بمعايير التصوير الفوتوغرافي الاحترافي وفيزياء الإضاءة وهندسة العدسات المتقدمة.'
              : '36 production-grade visual concepts across 10 distinct genres calibrated for Midjourney v6.1, FLUX.1 Pro, and DALL-E 3 with exact optics, lighting rigs, and calibrated color palettes.'}
          </p>

          {/* Quick Actions */}
          <div className="pt-2 flex flex-wrap gap-2.5 items-center">
            <button
              onClick={handleCopyBatchMidjourney}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-all shadow-md active:scale-95"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{isAr ? 'نسخ دفعة أوامر Midjourney المعروضة' : 'Copy Visible Midjourney Batch'}</span>
            </button>
            <button
              onClick={handleExportJson}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium border border-stone-700 transition-all active:scale-95"
            >
              <FileJson className="w-3.5 h-3.5 text-amber-400" />
              <span>{isAr ? 'تصدير JSON' : 'Export JSON'}</span>
            </button>
            <button
              onClick={handleExportMarkdown}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium border border-stone-700 transition-all active:scale-95"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isAr ? 'تصدير Markdown' : 'Export Markdown'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Control Bar: Search + Genre Filter + View Switch */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'ابحث بالعنوان، السرد، المزاج، أو الكلمات المفتاحية...' : 'Search by title, narrative, mood, optics...'}
              className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Stats & View Mode Toggle */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end text-xs text-stone-500 dark:text-stone-400">
            <span>
              {isAr ? `عرض ${filteredConcepts.length} من أصل 36 مفهوماً` : `Showing ${filteredConcepts.length} of 36 concepts`}
            </span>
            <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-0.5 rounded-lg border border-stone-200 dark:border-stone-700">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-stone-900 text-amber-600 dark:text-amber-400 shadow-xs' : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'}`}
                title={isAr ? 'عرض شبكي' : 'Grid View'}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-stone-900 text-amber-600 dark:text-amber-400 shadow-xs' : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'}`}
                title={isAr ? 'عرض جدولي مدمج' : 'List View'}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Genre Filter Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {GENRE_CATEGORIES.map((cat) => {
            const isActive = selectedGenre === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedGenre(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-amber-500 text-stone-950 shadow-sm scale-105'
                    : 'bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700/60'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{isAr ? cat.labelAr : cat.labelEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Concepts Display */}
      {filteredConcepts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-stone-900 rounded-2xl border border-dashed border-stone-300 dark:border-stone-800 p-8">
          <Layers className="w-12 h-12 mx-auto text-stone-400 mb-3 opacity-60" />
          <h3 className="text-stone-800 dark:text-stone-200 font-bold text-base">
            {isAr ? 'لم يتم العثور على مفاهيم تطابق بحثك' : 'No visual concepts match your search'}
          </h3>
          <p className="text-stone-500 dark:text-stone-400 text-xs mt-1">
            {isAr ? 'جرّب البحث بكلمات عامة أو اختر تصنيفاً آخر' : 'Try searching different keywords or choose another genre filter'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredConcepts.map((concept) => (
            <div
              key={concept.id}
              className="group flex flex-col bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-amber-500/60 dark:hover:border-amber-500/60 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              {/* Color Palette Top Banner */}
              <div className="h-10 w-full flex relative group/palette cursor-pointer">
                {concept.palette.map((color, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleCopyHex(color)}
                    style={{ backgroundColor: color }}
                    className="flex-1 transition-all duration-300 hover:flex-[2] relative flex items-center justify-center group/swatch"
                    title={`${color} (انقر للنسخ)`}
                  >
                    <span className="opacity-0 group-hover/swatch:opacity-100 text-[10px] font-mono font-bold text-white bg-black/60 px-1 py-0.5 rounded shadow-xs select-none">
                      {color}
                    </span>
                  </div>
                ))}
                {/* Genre Tag Over Banner */}
                <div className="absolute top-2 right-2 bg-stone-950/80 backdrop-blur-xs text-amber-300 border border-amber-500/40 text-[11px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                  {concept.genre}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                    <span className="font-mono font-bold text-amber-600 dark:text-amber-400">#{concept.id}</span>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-[10px] font-mono">
                        📐 {concept.aspect_ratio}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 text-[10px] font-medium border border-amber-200 dark:border-amber-900/60">
                        🎭 {concept.mood}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-bold text-stone-900 dark:text-white text-base group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {concept.title}
                  </h3>
                  <p className="text-stone-600 dark:text-stone-300 text-xs line-clamp-3 leading-relaxed">
                    {concept.narrative}
                  </p>
                </div>

                {/* Optics & Lighting preview */}
                <div className="bg-stone-50 dark:bg-stone-950/60 rounded-xl p-2.5 text-[11px] space-y-1.5 border border-stone-100 dark:border-stone-800/80 text-stone-600 dark:text-stone-400">
                  <div className="flex items-start gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span className="line-clamp-1"><strong>{isAr ? 'العدسة:' : 'Optics:'}</strong> {concept.optics}</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span className="line-clamp-1"><strong>{isAr ? 'الإضاءة:' : 'Light:'}</strong> {concept.lighting}</span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-2 flex items-center justify-between gap-1.5 border-t border-stone-100 dark:border-stone-800">
                  <button
                    onClick={() => setActiveModalConcept(concept)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-500" />
                    <span>{isAr ? 'تفاصيل' : 'Details'}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopy(`${concept.master_prompt} --ar ${concept.aspect_ratio} --style raw --v 6.1`, `master-${concept.id}`, 'Master Prompt')}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-700 dark:text-stone-200 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800/60 transition-all"
                      title={isAr ? 'نسخ أمر Midjourney/FLUX الرئيسي' : 'Copy Master Prompt'}
                    >
                      {copiedKey === `master-${concept.id}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-amber-500" />}
                      <span className="text-[11px] font-bold">Midjourney</span>
                    </button>

                    <button
                      onClick={() => onSendToBuilder(`${concept.master_prompt} --ar ${concept.aspect_ratio} --style raw --v 6.1`, 'midjourney')}
                      className="p-1.5 rounded-lg text-stone-700 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 hover:bg-amber-500 hover:text-stone-950 transition-all"
                      title={isAr ? 'إرسال إلى مهندس الأوامر' : 'Send to Prompt Builder'}
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List / Table Mode */
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead className="bg-stone-50 dark:bg-stone-950 text-stone-500 dark:text-stone-400 border-b border-stone-200 dark:border-stone-800 uppercase font-semibold">
                <tr>
                  <th className="p-3 text-center w-12">#</th>
                  <th className="p-3">{isAr ? 'الجنس' : 'Genre'}</th>
                  <th className="p-3">{isAr ? 'العنوان والمفهوم' : 'Title & Concept'}</th>
                  <th className="p-3 text-center">{isAr ? 'النسبة' : 'Ratio'}</th>
                  <th className="p-3">{isAr ? 'اللوحة اللونية' : 'Palette'}</th>
                  <th className="p-3 text-center">{isAr ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {filteredConcepts.map((concept) => (
                  <tr key={concept.id} className="hover:bg-stone-50/80 dark:hover:bg-stone-800/40 transition-colors">
                    <td className="p-3 text-center font-mono font-bold text-amber-600 dark:text-amber-400">{concept.id}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                        {concept.genre}
                      </span>
                    </td>
                    <td className="p-3 max-w-sm">
                      <div className="font-bold text-stone-900 dark:text-stone-100">{concept.title}</div>
                      <div className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-1">{concept.narrative}</div>
                    </td>
                    <td className="p-3 text-center font-mono text-stone-600 dark:text-stone-400">{concept.aspect_ratio}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        {concept.palette.map((c, i) => (
                          <div
                            key={i}
                            onClick={() => handleCopyHex(c)}
                            style={{ backgroundColor: c }}
                            className="w-5 h-5 rounded-md border border-stone-200 dark:border-stone-700 cursor-pointer hover:scale-110 transition-transform"
                            title={c}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setActiveModalConcept(concept)}
                          className="p-1.5 rounded-md bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200"
                          title={isAr ? 'عرض التفاصيل' : 'View Details'}
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-500" />
                        </button>
                        <button
                          onClick={() => handleCopy(`${concept.master_prompt} --ar ${concept.aspect_ratio} --style raw --v 6.1`, `master-${concept.id}`, 'Master Prompt')}
                          className="p-1.5 rounded-md bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-600 dark:text-amber-300"
                          title={isAr ? 'نسخ أمر Midjourney' : 'Copy Midjourney Prompt'}
                        >
                          {copiedKey === `master-${concept.id}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => onSendToBuilder(`${concept.master_prompt} --ar ${concept.aspect_ratio} --style raw --v 6.1`, 'midjourney')}
                          className="p-1.5 rounded-md bg-stone-100 dark:bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-stone-700 dark:text-stone-200"
                          title={isAr ? 'إرسال للمهندس' : 'Send to Builder'}
                        >
                          <Wand2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Comprehensive Detail Modal */}
      {activeModalConcept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-stone-900 border border-amber-500/40 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative text-right">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between z-20">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900">
                  #{activeModalConcept.id}
                </span>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white">
                    {activeModalConcept.title}
                  </h2>
                  <p className="text-xs text-stone-500 dark:text-stone-400 font-mono">
                    {activeModalConcept.titleEn}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModalConcept(null)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 text-sm">
              {/* Badges bar */}
              <div className="flex flex-wrap gap-2 items-center text-xs">
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold">
                  {activeModalConcept.genre} ({activeModalConcept.genreEn})
                </span>
                <span className="px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 font-mono">
                  📐 {activeModalConcept.aspect_ratio}
                </span>
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 font-medium">
                  🎭 {activeModalConcept.mood}
                </span>
              </div>

              {/* 1. Narrative Section */}
              <div className="space-y-2 bg-stone-50 dark:bg-stone-950/70 p-4 rounded-xl border border-stone-200 dark:border-stone-800">
                <h4 className="font-bold text-stone-900 dark:text-amber-400 text-xs flex items-center gap-1.5">
                  <Film className="w-4 h-4 text-amber-500" />
                  <span>{isAr ? '1. السياق السردي والمعماري (Thematic Narrative)' : '1. Thematic Narrative'}</span>
                </h4>
                <p className="text-stone-700 dark:text-stone-300 leading-relaxed text-xs sm:text-sm">
                  {activeModalConcept.narrative}
                </p>
                <p className="text-stone-500 dark:text-stone-400 text-xs italic font-serif">
                  "{activeModalConcept.narrativeEn}"
                </p>
              </div>

              {/* 2. Technical Art Direction Matrix */}
              <div className="space-y-3">
                <h4 className="font-bold text-stone-900 dark:text-amber-400 text-xs flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-amber-500" />
                  <span>{isAr ? '2. مصفوفة الإخراج الفني الهندسي (Technical Matrix)' : '2. Technical Art Direction Matrix'}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 space-y-1">
                    <span className="font-bold text-stone-900 dark:text-stone-200 block">{isAr ? '📐 التكوين والتأطير:' : 'Composition:'}</span>
                    <p className="text-stone-600 dark:text-stone-400">{activeModalConcept.composition}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 space-y-1">
                    <span className="font-bold text-stone-900 dark:text-stone-200 block">{isAr ? '📷 العدسة ومواصفات الكاميرا:' : 'Optics & Gear:'}</span>
                    <p className="text-stone-600 dark:text-stone-400">{activeModalConcept.optics}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 space-y-1">
                    <span className="font-bold text-stone-900 dark:text-stone-200 block">{isAr ? '💡 فيزياء الإضاءة والغلاف الجوي:' : 'Lighting & Atmosphere:'}</span>
                    <p className="text-stone-600 dark:text-stone-400">{activeModalConcept.lighting}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 space-y-1">
                    <span className="font-bold text-stone-900 dark:text-stone-200 block">{isAr ? '🧱 الملامس والخامات الفيزيائية:' : 'Textures & Finishes:'}</span>
                    <p className="text-stone-600 dark:text-stone-400">{activeModalConcept.textures}</p>
                  </div>
                </div>
              </div>

              {/* 3. Color Palette Swatches */}
              <div className="space-y-2">
                <h4 className="font-bold text-stone-900 dark:text-amber-400 text-xs flex items-center gap-1.5">
                  <PaletteIcon className="w-4 h-4 text-amber-500" />
                  <span>{isAr ? '3. اللوحة اللونية المعتمدة (Color Grading Palette)' : '3. Color Grading Palette'}</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {activeModalConcept.palette.map((hex, i) => (
                    <div
                      key={i}
                      onClick={() => handleCopyHex(hex)}
                      className="group/hex p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 flex items-center gap-2.5 cursor-pointer hover:border-amber-500/60 transition-all"
                    >
                      <div
                        style={{ backgroundColor: hex }}
                        className="w-7 h-7 rounded-lg shadow-xs border border-black/20"
                      />
                      <div className="font-mono text-xs font-bold text-stone-800 dark:text-stone-200 group-hover/hex:text-amber-500">
                        {hex}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Production Prompts */}
              <div className="space-y-4 pt-2">
                {/* Master Prompt */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isAr ? 'الأمر الرئيسي لـ Midjourney / FLUX.1 Pro (Master Prompt):' : 'Master Production Prompt (Midjourney / FLUX.1):'}</span>
                    </h5>
                    <button
                      onClick={() => handleCopy(`${activeModalConcept.master_prompt} --ar ${activeModalConcept.aspect_ratio} --style raw --v 6.1`, `modal-master`, 'Master Prompt')}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-all shadow-xs"
                    >
                      {copiedKey === 'modal-master' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isAr ? 'نسخ الأمر' : 'Copy Prompt'}</span>
                    </button>
                  </div>
                  <div className="p-3.5 rounded-xl bg-stone-950 text-stone-200 font-mono text-xs text-left direction-ltr leading-relaxed border border-stone-800 select-all">
                    {activeModalConcept.master_prompt} --ar {activeModalConcept.aspect_ratio} --style raw --v 6.1
                  </div>
                </div>

                {/* Natural Language Prompt */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Film className="w-3.5 h-3.5" />
                      <span>{isAr ? 'الوصف السردي لـ DALL-E 3 ونماذج الانتشار (Natural Language):' : 'Natural Language Prompt (DALL-E 3 / Diffusion):'}</span>
                    </h5>
                    <button
                      onClick={() => handleCopy(activeModalConcept.natural_prompt, 'modal-natural', 'Natural Prompt')}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-medium transition-all"
                    >
                      {copiedKey === 'modal-natural' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isAr ? 'نسخ النص' : 'Copy Text'}</span>
                    </button>
                  </div>
                  <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-950/80 text-stone-800 dark:text-stone-300 text-xs leading-relaxed border border-stone-200 dark:border-stone-800 select-all">
                    {activeModalConcept.natural_prompt}
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
                <button
                  onClick={() => {
                    onSendToBuilder(`${activeModalConcept.master_prompt} --ar ${activeModalConcept.aspect_ratio} --style raw --v 6.1`, 'midjourney');
                    setActiveModalConcept(null);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs transition-all shadow-md active:scale-95"
                >
                  <Wand2 className="w-4 h-4" />
                  <span>{isAr ? 'فتح وتعديل في مُهندس الأوامر' : 'Open in Prompt Builder'}</span>
                </button>

                <button
                  onClick={() => setActiveModalConcept(null)}
                  className="px-4 py-2 rounded-xl text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs transition-all"
                >
                  {isAr ? 'إغلاق' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
