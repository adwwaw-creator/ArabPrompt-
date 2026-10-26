/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  Sparkles, 
  Film, 
  Clock, 
  Play, 
  Copy, 
  Check, 
  ChevronRight, 
  ChevronDown, 
  UserCheck, 
  Layers, 
  Volume2, 
  Camera, 
  Compass, 
  ArrowRight,
  BookOpen,
  Sliders,
  Maximize2
} from 'lucide-react';
import { AppLanguage, MovieProject, CinemaScene, CharacterFaceAnchor } from '../types';
import { ARABIC_HISTORICAL_LEGENDS, HistoricalLegendScreenplay, HistoricalCategory } from '../data/arabicHistoricalLegends';
import { showToast } from './ToastNotification';

interface HistoricalLegendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: AppLanguage;
  onApplyToAiForm: (legend: HistoricalLegendScreenplay) => void;
  onLoadAsActiveProject: (legend: HistoricalLegendScreenplay) => void;
  onApplyToManualMode: (legend: HistoricalLegendScreenplay) => void;
}

export default function HistoricalLegendsModal({
  isOpen,
  onClose,
  lang,
  onApplyToAiForm,
  onLoadAsActiveProject,
  onApplyToManualMode
}: HistoricalLegendsModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<HistoricalCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLegendId, setActiveLegendId] = useState<string>(ARABIC_HISTORICAL_LEGENDS[0]?.id || '');
  const [expandedSceneIdx, setExpandedSceneIdx] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter legends by category and search
  const filteredLegends = useMemo(() => {
    return ARABIC_HISTORICAL_LEGENDS.filter((leg) => {
      const matchCat = selectedCategory === 'all' || leg.category === selectedCategory;
      if (!matchCat) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        leg.titleAr.toLowerCase().includes(q) ||
        leg.titleEn.toLowerCase().includes(q) ||
        leg.hero.name.toLowerCase().includes(q) ||
        leg.conceptAr.toLowerCase().includes(q) ||
        leg.taglineAr.toLowerCase().includes(q) ||
        leg.eraAr.toLowerCase().includes(q)
      );
    });
  }, [selectedCategory, searchQuery]);

  const activeLegend = useMemo(() => {
    return ARABIC_HISTORICAL_LEGENDS.find((l) => l.id === activeLegendId) || filteredLegends[0] || ARABIC_HISTORICAL_LEGENDS[0];
  }, [activeLegendId, filteredLegends]);

  if (!isOpen) return null;

  const handleCopyLegendBeat = (legend: HistoricalLegendScreenplay) => {
    const text = `# 📜 ${legend.titleAr} (${legend.titleEn})
# الحقبة: ${legend.eraAr}
# البطل: ${legend.hero.name} (${legend.hero.featuresAr})
# الحبكة: ${legend.conceptAr}
# الحوار الشهير: [${legend.famousDialogue.speaker}]: "${legend.famousDialogue.textAr}"

### هيكل الفصول الثلاثة:
- الفصل 1 (البداية): ${legend.acts.act1TitleAr} - ${legend.acts.act1DescriptionAr}
- الفصل 2 (الصراع): ${legend.acts.act2TitleAr} - ${legend.acts.act2DescriptionAr}
- الفصل 3 (الذروة): ${legend.acts.act3TitleAr} - ${legend.acts.act3DescriptionAr}
`;
    navigator.clipboard.writeText(text);
    setCopiedId(legend.id);
    showToast(lang === 'ar' ? '✓ تم نسخ ملخص السيناريو التاريخي والفصول!' : '✓ Historical screenplay outline copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-6xl max-h-[92vh] bg-stone-900 border border-[#c29b40]/50 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-stone-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-stone-950 via-stone-900 to-amber-950/40 border-b border-[#c29b40]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#c29b40] to-amber-700 flex items-center justify-center text-stone-950 shadow-md shrink-0">
              <BookOpen className="w-6 h-6 text-stone-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <span>{lang === 'ar' ? 'مكتبة السيناريوهات التاريخية والأساطير العربية' : 'Arabic Historical & Legendary Screenplays'}</span>
                </h2>
                <span className="bg-[#c29b40] text-stone-950 text-[10px] font-mono font-black px-2 py-0.5 rounded-full">
                  {ARABIC_HISTORICAL_LEGENDS.length} {lang === 'ar' ? 'أساطير وقصص' : 'Stories'}
                </span>
              </div>
              <p className="text-xs text-amber-200/80 mt-0.5">
                {lang === 'ar'
                  ? 'سيناريوهات قصيرة متكاملة مستوحاة من بطولات التاريخ وأساطير التراث العربي مع فصول درامية، حوارات منطوقة، وتثبيت وجوه 100%'
                  : 'Curated 10s short screenplays inspired by authentic Arab history and mythology with multi-act arcs and character face anchors'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer border border-stone-700"
              title={lang === 'ar' ? 'إغلاق' : 'Close'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="p-3 sm:px-6 bg-stone-950/70 border-b border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#c29b40] text-stone-950 shadow-xs'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              {lang === 'ar' ? 'الكل' : 'All'} ({ARABIC_HISTORICAL_LEGENDS.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('chivalry')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === 'chivalry'
                  ? 'bg-[#c29b40] text-stone-950 shadow-xs'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              <span>⚔️</span>
              <span>{lang === 'ar' ? 'فروسية وبطولة' : 'Chivalry'}</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('myths')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === 'myths'
                  ? 'bg-[#c29b40] text-stone-950 shadow-xs'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              <span>✨</span>
              <span>{lang === 'ar' ? 'أساطير وخوارق' : 'Myths & Wonder'}</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('kingdoms')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === 'kingdoms'
                  ? 'bg-[#c29b40] text-stone-950 shadow-xs'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              <span>👑</span>
              <span>{lang === 'ar' ? 'ممالك وحضارات' : 'Kingdoms'}</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('valor')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === 'valor'
                  ? 'bg-[#c29b40] text-stone-950 shadow-xs'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              <span>🔥</span>
              <span>{lang === 'ar' ? 'مروءة وشعر' : 'Valor & Poetry'}</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('travels')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === 'travels'
                  ? 'bg-[#c29b40] text-stone-950 shadow-xs'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              <span>🧭</span>
              <span>{lang === 'ar' ? 'رحلات واستكشاف' : 'Travels & Voyages'}</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute right-3 top-3 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'ar' ? 'ابحث عن قصة أو شخصية...' : 'Search legend or hero...'}
              className="w-full text-xs rounded-xl bg-stone-900 border border-stone-700 pr-9 pl-3 py-2 text-white placeholder-stone-500 focus:outline-none focus:border-[#c29b40]"
            />
          </div>
        </div>

        {/* Content Body: Left List (4 cols) | Right Detail & Action Panel (8 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden min-h-[460px]">
          
          {/* Left Column: Screenplay Cards List */}
          <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-l border-stone-800 overflow-y-auto max-h-[300px] lg:max-h-[calc(92vh-170px)] p-3 sm:p-4 space-y-2 bg-stone-950/40">
            {filteredLegends.length === 0 ? (
              <div className="py-12 text-center text-stone-500 text-xs">
                {lang === 'ar' ? 'لا توجد سيناريوهات مطابقة لخيارات البحث.' : 'No screenplays matching search.'}
              </div>
            ) : (
              filteredLegends.map((leg) => {
                const isSelected = activeLegend?.id === leg.id;
                return (
                  <div
                    key={leg.id}
                    onClick={() => {
                      setActiveLegendId(leg.id);
                      setExpandedSceneIdx(null);
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-start relative group ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border-[#c29b40] shadow-md ring-1 ring-[#c29b40]/50'
                        : 'bg-stone-900/60 hover:bg-stone-800/80 border-stone-800/80 text-stone-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xl p-1 bg-stone-800 rounded-lg">{leg.icon}</span>
                        <div>
                          <h3 className={`text-xs font-black line-clamp-1 ${isSelected ? 'text-[#f5d996]' : 'text-stone-100'}`}>
                            {lang === 'ar' ? leg.titleAr : leg.titleEn}
                          </h3>
                          <span className="text-[10px] text-stone-400 font-medium">
                            {lang === 'ar' ? leg.eraAr : leg.eraEn}
                          </span>
                        </div>
                      </div>

                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-stone-800 text-amber-300 border border-amber-500/30 shrink-0">
                        {lang === 'ar' ? leg.categoryLabelAr : leg.categoryLabelEn}
                      </span>
                    </div>

                    <p className="text-[11px] text-stone-400 line-clamp-2 leading-relaxed">
                      {lang === 'ar' ? leg.conceptAr : leg.conceptEn}
                    </p>

                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-stone-800/60 text-[10px]">
                      <span className="text-stone-400 flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-[#c29b40]" />
                        <span>{leg.hero.name}</span>
                      </span>
                      <div className="flex items-center gap-2">
                        {leg.availablePaths && leg.availablePaths.length > 0 && (
                          <span className="text-purple-400 font-bold flex items-center gap-1 bg-purple-950/70 border border-purple-500/30 px-1.5 py-0.5 rounded-md">
                            <span>🧭</span>
                            <span>{leg.availablePaths.length} {lang === 'ar' ? 'مسارات' : 'Paths'}</span>
                          </span>
                        )}
                        <span className="text-[#c29b40] font-mono font-bold flex items-center gap-1">
                          <Film className="w-3 h-3" />
                          <span>{leg.readyScenes.length} {lang === 'ar' ? 'مشاهد (30s)' : 'Scenes (30s)'}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Active Legend Deep Dive & Instant Actions */}
          {activeLegend && (
            <div className="lg:col-span-7 overflow-y-auto max-h-[calc(92vh-170px)] p-4 sm:p-6 space-y-5 bg-stone-900">
              
              {/* Top Hero Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-stone-800 to-stone-850 border border-[#c29b40]/40 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-700/60">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{activeLegend.icon}</span>
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-white">
                        {lang === 'ar' ? activeLegend.titleAr : activeLegend.titleEn}
                      </h2>
                      <div className="flex items-center gap-2 text-xs text-[#f5d996]">
                        <span>🏛️ {lang === 'ar' ? activeLegend.eraAr : activeLegend.eraEn}</span>
                        <span>•</span>
                        <span>{lang === 'ar' ? activeLegend.genreAr : activeLegend.genreEn}</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-[#c29b40] text-stone-950 shrink-0 self-start sm:self-auto font-mono">
                    3 SCENES • 30 SECONDS
                  </span>
                </div>

                <p className="text-xs text-stone-300 leading-relaxed">
                  {lang === 'ar' ? activeLegend.conceptAr : activeLegend.conceptEn}
                </p>

                {/* Famous Dialogue Quote */}
                <div className="p-3 rounded-xl bg-stone-950/60 border border-amber-500/30 flex items-start gap-2.5">
                  <span className="text-amber-400 text-lg leading-none">“</span>
                  <div className="space-y-0.5 flex-1">
                    <p className="text-xs font-semibold text-[#f5d996] italic leading-relaxed">
                      {lang === 'ar' ? activeLegend.famousDialogue.textAr : activeLegend.famousDialogue.textEn}
                    </p>
                    <div className="text-[10px] text-stone-400 flex items-center justify-between">
                      <span>— {activeLegend.famousDialogue.speaker} ({lang === 'ar' ? activeLegend.famousDialogue.emotionAr : activeLegend.famousDialogue.emotionEn})</span>
                      <span className="text-[#c29b40] font-mono">👄 Lip-Sync Ready</span>
                    </div>
                  </div>
                </div>

                {/* Character Face Anchor Details */}
                <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700/80 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-200 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-[#c29b40]" />
                      <span>{lang === 'ar' ? 'مثبت ملامح البطل الموحد (Face Anchor):' : 'Lead Face Anchor:'}</span>
                      <span className="text-[#f5d996] font-black">{activeLegend.hero.name}</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30">
                      LOCKED 100%
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400 leading-normal">
                    {lang === 'ar' ? activeLegend.hero.featuresAr : activeLegend.hero.featuresEn}
                  </p>
                </div>

                {/* Branching Paths Preview */}
                {activeLegend.availablePaths && activeLegend.availablePaths.length > 0 && (
                  <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-200 flex items-center gap-1.5">
                        <Compass className="w-4 h-4 text-purple-400" />
                        <span>{lang === 'ar' ? 'نظام المسارات الدرامية التفاعلية (Choose Your Path):' : 'Interactive Story Branching Paths:'}</span>
                      </span>
                      <span className="text-[10px] text-purple-300 font-mono font-bold bg-purple-900/60 px-2 py-0.5 rounded-md border border-purple-400/40">
                        {activeLegend.availablePaths.length} {lang === 'ar' ? 'مسارات متاحة في الاستوديو' : 'Paths Available'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-0.5">
                      {activeLegend.availablePaths.map(p => (
                        <div key={p.id} className="p-2 rounded-lg bg-stone-900/80 border border-purple-500/20 text-[11px] space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-[#f5d996]">
                            <span>{p.icon}</span>
                            <span className="line-clamp-1">{lang === 'ar' ? p.nameAr : p.nameEn}</span>
                          </div>
                          <p className="text-[10px] text-stone-400 line-clamp-2 leading-relaxed">
                            {lang === 'ar' ? p.descriptionAr : p.descriptionEn}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 3 Action Buttons: Instant Screenplay Load vs AI Studio Form vs Manual Script */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    onLoadAsActiveProject(activeLegend);
                    onClose();
                  }}
                  className="p-3 rounded-2xl bg-gradient-to-r from-[#c29b40] to-amber-600 hover:from-[#a6802f] hover:to-amber-700 text-stone-950 font-black text-xs transition-all flex flex-col items-center justify-center gap-1 shadow-lg shadow-[#c29b40]/20 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="flex items-center gap-1.5">
                    <Play className="w-4 h-4 fill-stone-950" />
                    <span>{lang === 'ar' ? 'تحميل فوري للاستوديو' : 'Load Instant Movie'}</span>
                  </div>
                  <span className="text-[10px] font-bold opacity-80">
                    {lang === 'ar' ? '3 مشاهد جاهزة بدون انتظار' : '3 Ready Scenes • 30s'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onApplyToAiForm(activeLegend);
                    onClose();
                  }}
                  className="p-3 rounded-2xl bg-stone-800 hover:bg-stone-700 text-[#f5d996] border border-[#c29b40]/50 font-bold text-xs transition-all flex flex-col items-center justify-center gap-1 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#c29b40]" />
                    <span>{lang === 'ar' ? 'تطبيق في مولد AI' : 'Apply to AI Studio'}</span>
                  </div>
                  <span className="text-[10px] text-stone-400">
                    {lang === 'ar' ? 'توليد وتخصيص بالذكاء الاصطناعي' : 'Fill generator form'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onApplyToManualMode(activeLegend);
                    onClose();
                  }}
                  className="p-3 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-bold text-xs transition-all flex flex-col items-center justify-center gap-1 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-[#c29b40]" />
                    <span>{lang === 'ar' ? 'فتح بالمحرر اليدوي' : 'Open in Manual Editor'}</span>
                  </div>
                  <span className="text-[10px] text-stone-400">
                    {lang === 'ar' ? 'تعديل الحوار والمشاهد يدوياً' : 'Edit scenes & dialogue'}
                  </span>
                </button>
              </div>

              {/* 3-Act Structure Cards */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#c29b40]" />
                    <span>{lang === 'ar' ? 'هيكل الفصول الثلاثة الملحمي (3-Act Dramatic Arc)' : '3-Act Dramatic Arc'}</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleCopyLegendBeat(activeLegend)}
                    className="text-[11px] font-bold text-[#c29b40] hover:text-[#f5d996] flex items-center gap-1 cursor-pointer"
                  >
                    {copiedId === activeLegend.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">{lang === 'ar' ? 'تم النسخ!' : 'Copied!'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{lang === 'ar' ? 'نسخ ملخص الفصول' : 'Copy Arc Outline'}</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/30 space-y-1 text-xs">
                    <span className="text-[10px] font-bold text-blue-400 block font-mono">
                      {lang === 'ar' ? 'الفصل 1: البداية' : 'ACT I: SETUP'}
                    </span>
                    <h5 className="font-bold text-stone-200">
                      {lang === 'ar' ? activeLegend.acts.act1TitleAr : activeLegend.acts.act1TitleEn}
                    </h5>
                    <p className="text-[10px] text-stone-400 leading-relaxed">
                      {lang === 'ar' ? activeLegend.acts.act1DescriptionAr : activeLegend.acts.act1DescriptionEn}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-1 text-xs">
                    <span className="text-[10px] font-bold text-amber-400 block font-mono">
                      {lang === 'ar' ? 'الفصل 2: الصراع' : 'ACT II: CONFLICT'}
                    </span>
                    <h5 className="font-bold text-stone-200">
                      {lang === 'ar' ? activeLegend.acts.act2TitleAr : activeLegend.acts.act2TitleEn}
                    </h5>
                    <p className="text-[10px] text-stone-400 leading-relaxed">
                      {lang === 'ar' ? activeLegend.acts.act2DescriptionAr : activeLegend.acts.act2DescriptionEn}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-1 text-xs">
                    <span className="text-[10px] font-bold text-emerald-400 block font-mono">
                      {lang === 'ar' ? 'الفصل 3: الذروة' : 'ACT III: CLIMAX'}
                    </span>
                    <h5 className="font-bold text-stone-200">
                      {lang === 'ar' ? activeLegend.acts.act3TitleAr : activeLegend.acts.act3TitleEn}
                    </h5>
                    <p className="text-[10px] text-stone-400 leading-relaxed">
                      {lang === 'ar' ? activeLegend.acts.act3DescriptionAr : activeLegend.acts.act3DescriptionEn}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ready 10-Second Scenes Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5 text-[#c29b40]" />
                    <span>{lang === 'ar' ? `المشاهد السينمائية الجاهزة (${activeLegend.readyScenes.length} مشاهد × 10 ثوانٍ)` : `Ready 10s Scenes (${activeLegend.readyScenes.length})`}</span>
                  </h4>
                  <span className="text-[10px] text-stone-400">
                    {lang === 'ar' ? 'انقر على المشهد لمعاينة البرومبت وحركة الكاميرا' : 'Click to inspect prompt & camera cues'}
                  </span>
                </div>

                <div className="space-y-2">
                  {activeLegend.readyScenes.map((scene, idx) => {
                    const isExpanded = expandedSceneIdx === idx;
                    return (
                      <div 
                        key={idx}
                        className="rounded-2xl border border-stone-800 bg-stone-950/50 overflow-hidden transition-all"
                      >
                        <div 
                          onClick={() => setExpandedSceneIdx(isExpanded ? null : idx)}
                          className="p-3 sm:p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-stone-800/40"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="px-2 py-0.5 rounded-md bg-[#c29b40] text-stone-950 font-bold text-[10px] font-mono">
                              SCENE {idx + 1}
                            </span>
                            <span className="text-[10px] text-stone-400 font-mono">
                              ⏱️ {scene.timeRange}
                            </span>
                            <h5 className="text-xs font-bold text-stone-200">
                              {lang === 'ar' ? scene.titleAr : scene.titleEn}
                            </h5>
                          </div>

                          <div className="flex items-center gap-2">
                            {scene.dialogueAr && (
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-800 text-amber-300 font-bold flex items-center gap-1">
                                <Volume2 className="w-3 h-3 text-[#c29b40]" />
                                <span>{scene.dialogueSpeaker}</span>
                              </span>
                            )}
                            <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </div>
                        </div>

                        {/* Expanded Scene Details */}
                        {isExpanded && (
                          <div className="p-3.5 border-t border-stone-800/80 bg-stone-900/90 space-y-3 text-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                              <div className="p-2 rounded-xl bg-stone-950/60 border border-stone-800">
                                <span className="text-[10px] font-bold text-[#c29b40] block mb-0.5 flex items-center gap-1">
                                  <Camera className="w-3 h-3" />
                                  <span>{lang === 'ar' ? 'حركة ونوع اللقطة:' : 'Camera Motion & Shot:'}</span>
                                </span>
                                <p className="text-stone-300">{scene.shotType} • {scene.cameraMotion}</p>
                              </div>

                              <div className="p-2 rounded-xl bg-stone-950/60 border border-stone-800">
                                <span className="text-[10px] font-bold text-[#c29b40] block mb-0.5 flex items-center gap-1">
                                  <Volume2 className="w-3 h-3" />
                                  <span>{lang === 'ar' ? 'تصميم الصوت:' : 'Sound Design:'}</span>
                                </span>
                                <p className="text-stone-300">{scene.soundDesign}</p>
                              </div>
                            </div>

                            {/* Spoken Dialogue Line */}
                            {scene.dialogueAr && (
                              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-[#c29b40]/30 space-y-1">
                                <div className="flex items-center justify-between text-[10px]">
                                  <span className="font-bold text-[#f5d996]">
                                    🎙️ {scene.dialogueSpeaker} ({scene.dialogueEmotion})
                                  </span>
                                  <span className="text-stone-400 font-mono">{scene.dialogueTiming}</span>
                                </div>
                                <p className="text-xs font-semibold text-white">
                                  "{scene.dialogueAr}"
                                </p>
                              </div>
                            )}

                            {/* Video AI Prompt Preview */}
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-stone-400 block font-mono">
                                🎬 Video AI Prompt (English):
                              </span>
                              <div className="p-2.5 rounded-xl bg-black/60 border border-stone-800 text-[10px] font-mono text-stone-300 leading-relaxed max-h-24 overflow-y-auto">
                                {scene.videoPromptEn}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#c29b40] animate-pulse"></span>
            <span>
              {lang === 'ar'
                ? 'جميع السيناريوهات مجهزة بدقة للمنصات السينمائية (Kling, Runway, Sora, Luma) مع ضبط 10s لكل لقطة.'
                : 'All screenplays optimized for 10-second scene pacing with locked character facial consistency.'}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-bold transition-all cursor-pointer border border-stone-700 self-end sm:self-auto"
          >
            {lang === 'ar' ? 'إغلاق المكتبة' : 'Close Library'}
          </button>
        </div>
      </div>
    </div>
  );
}
