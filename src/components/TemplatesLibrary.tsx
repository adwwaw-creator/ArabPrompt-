/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CATEGORIES, TEMPLATES } from '../data';
import { PromptTemplate } from '../types';
import { Layers, HelpCircle, Copy, Check, Cpu, Sparkles, Filter, ChevronLeft, ChevronRight, PenTool, BookOpen, Megaphone, Code, Briefcase } from 'lucide-react';
import { showToast } from './ToastNotification';

interface TemplatesLibraryProps {
  lang: 'ar' | 'en';
  onSendToTester: (promptText: string) => void;
}

export default function TemplatesLibrary({ lang, onSendToTester }: TemplatesLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTemplate, setActiveTemplate] = useState<PromptTemplate | null>(null);
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>({});
  const [compiledPrompt, setCompiledPrompt] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Map string icon names to Lucide icon components
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'PenTool': return PenTool;
      case 'BookOpen': return BookOpen;
      case 'Megaphone': return Megaphone;
      case 'Code': return Code;
      case 'Briefcase': return Briefcase;
      default: return Layers;
    }
  };

  // Reset values when template shifts
  useEffect(() => {
    if (activeTemplate) {
      const initialVals: Record<string, string> = {};
      activeTemplate.placeholders.forEach((pl) => {
        initialVals[pl.key] = pl.options ? pl.options[0] : '';
      });
      setPlaceholderValues(initialVals);
    }
  }, [activeTemplate]);

  // Compile the prompt text based on current placeholder values in real-time
  useEffect(() => {
    if (activeTemplate) {
      let result = activeTemplate.promptText;
      let allFilled = true;
      activeTemplate.placeholders.forEach((pl) => {
        const val = placeholderValues[pl.key] || '';
        const regexStr = '\\[\\s*' + pl.key + '\\s*\\]';
        result = result.replace(new RegExp(regexStr, 'g'), val || `[${lang === 'ar' ? pl.labelAr : pl.labelEn}]`);
      });
      setCompiledPrompt(result);
    }
  }, [placeholderValues, activeTemplate, lang]);

  const handleCopy = () => {
    if (!compiledPrompt) return;
    navigator.clipboard.writeText(compiledPrompt);
    setCopied(true);
    showToast(lang === 'ar' ? '✓ تم نسخ قالب البرومبت المجمّع بنجاح!' : '✓ Compiled template copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredTemplates = selectedCategory === 'all'
    ? TEMPLATES
    : TEMPLATES.filter((t) => t.category === selectedCategory);

  return (
    <div id="templates-library-panel" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {!activeTemplate ? (
        // Library Grid View
        <div>
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h3 className="text-xl font-bold text-stone-800">
                {lang === 'ar' ? 'مكتبة القوالب البرمجية الجاهزة' : 'Curated Custom Prompt Libraries'}
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                {lang === 'ar' ? 'تصفح العشرات من الأوامر الاحترافية الجاهزة للتعديل والتخصيص المباشر' : 'Pick a template, easily configure custom placeholders, and copy or run instantly'}
              </p>
            </div>

            {/* Filter tags (bilingually) */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all border ${
                  selectedCategory === 'all'
                    ? 'bg-[#c29b40] text-white border-[#916a24] shadow-sm'
                    : 'bg-white text-stone-600 hover:text-stone-900 border-stone-200'
                }`}
              >
                {lang === 'ar' ? 'الكل' : 'All Templates'}
              </button>
              {CATEGORIES.map((cat) => {
                const Icon = getCategoryIcon(cat.icon);
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition-all border flex items-center gap-1.5 ${
                      selectedCategory === cat.id
                        ? 'bg-[#c29b40] text-white border-[#916a24] shadow-sm'
                        : 'bg-white text-stone-600 hover:text-[#c29b40] border-stone-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? cat.nameAr : cat.nameEn}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Prompt Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTemplates.map((tmpl) => {
              return (
                <button
                  key={tmpl.id}
                  onClick={() => setActiveTemplate(tmpl)}
                  className="bg-white rounded-2xl border border-stone-200 p-6 text-right rtl:text-right hover:border-[#c29b40]/50 hover:shadow-md hover:scale-[1.01] transition-all text-stone-800 cursor-pointer flex flex-col justify-between align-stretch text-glow group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-[#c29b40]/10 text-[#9c7524] flex items-center justify-center">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-stone-100 rounded-lg text-stone-500">
                        {tmpl.category}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-stone-900 mb-2 group-hover:text-[#916a24] transition-colors font-sans">
                      {lang === 'ar' ? tmpl.titleAr : tmpl.titleEn}
                    </h4>
                    
                    <p className="text-xs text-stone-500 leading-relaxed mb-4">
                      {lang === 'ar' ? tmpl.descriptionAr : tmpl.descriptionEn}
                    </p>
                  </div>

                  <div className="border-t border-stone-100 pt-3 flex items-center justify-between text-xs text-[#c29b40] font-bold">
                    <span>{tmpl.placeholders.length} {lang === 'ar' ? 'متغيرات للتخصيص' : 'variables'}</span>
                    <span className="flex items-center gap-1 hover:underline">
                      {lang === 'ar' ? 'تخصيص ونسخ' : 'Customize & Use'}
                      {lang === 'ar' ? <ChevronLeft className="w-3 h-3 group-hover:-translate-x-1 transition-all" /> : <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-all" />}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

        </div>
      ) : (
        // Active Customization Screen
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden p-6 sm:p-8 animate-fade-in">
          
          {/* Breadcrumbs Action */}
          <button
            onClick={() => setActiveTemplate(null)}
            className="mb-6 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 hover:text-[#916a24] hover:bg-stone-50 text-xs font-bold transition-all"
          >
            {lang === 'ar' ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            <span>{lang === 'ar' ? 'الرجوع لجميع القوالب' : 'Back to library templates'}</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Inputs Panel (5 / 12 width) */}
            <div className="lg:col-span-12 xl:col-span-5 space-y-6">
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">
                  {lang === 'ar' ? 'تخصيص المتغيرات' : 'Customizing variables'}
                </span>
                <h4 className="text-lg font-black text-stone-900 mb-1">
                  {lang === 'ar' ? activeTemplate.titleAr : activeTemplate.titleEn}
                </h4>
                <p className="text-xs text-stone-500 font-sans">
                  {lang === 'ar' ? activeTemplate.descriptionAr : activeTemplate.descriptionEn}
                </p>
              </div>

              {/* Dynamic Form Generation */}
              <div className="space-y-4 border-t border-stone-150 pt-4">
                {activeTemplate.placeholders.map((pl) => {
                  return (
                    <div key={pl.key}>
                      <label htmlFor={`placeholder-${pl.key}`} className="block text-xs font-bold text-stone-700 mb-1.5">
                        {lang === 'ar' ? pl.labelAr : pl.labelEn}
                        <span className="text-stone-400 select-none text-[10px] ml-1 font-mono">[{pl.key}]</span>
                      </label>
                      
                      {pl.type === 'select' && pl.options ? (
                        <select
                          id={`placeholder-${pl.key}`}
                          value={placeholderValues[pl.key] || ''}
                          onChange={(e) => setPlaceholderValues(prev => ({ ...prev, [pl.key]: e.target.value }))}
                          className="w-full text-xs rounded-xl border border-stone-300 p-2.5 bg-white text-stone-800"
                        >
                          {pl.options.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : pl.type === 'textarea' ? (
                        <textarea
                          id={`placeholder-${pl.key}`}
                          rows={3}
                          value={placeholderValues[pl.key] || ''}
                          onChange={(e) => setPlaceholderValues(prev => ({ ...prev, [pl.key]: e.target.value }))}
                          placeholder={lang === 'ar' ? pl.placeholderAr : pl.placeholderEn}
                          className="w-full text-xs rounded-xl border border-stone-300 p-2.5 bg-white text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#c29b40] font-sans"
                        />
                      ) : (
                        <input
                          id={`placeholder-${pl.key}`}
                          type="text"
                          value={placeholderValues[pl.key] || ''}
                          onChange={(e) => setPlaceholderValues(prev => ({ ...prev, [pl.key]: e.target.value }))}
                          placeholder={lang === 'ar' ? pl.placeholderAr : pl.placeholderEn}
                          className="w-full text-xs rounded-xl border border-stone-300 p-2.5 bg-white text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#c29b40] font-sans"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Result compiled Panel (7 / 12 width) */}
            <div className="lg:col-span-12 xl:col-span-7 bg-stone-50 rounded-2xl border border-stone-250 p-6 flex flex-col justify-between">
              <div>
                <h5 className="text-xs font-bold text-stone-600 mb-3 block tracking-wide">
                  {lang === 'ar' ? 'الأمر المشكل والجاهز بالمتغيرات المباشرة' : 'Compiled real-time custom prompt output'}
                </h5>
                <div 
                  id="compiled-template-output-box" 
                  className="bg-white rounded-xl border border-stone-200 p-4 font-mono text-xs text-stone-850 leading-relaxed overflow-y-auto max-h-[350px] whitespace-pre-wrap select-all text-right rtl:text-right font-sans"
                  dir="rtl"
                >
                  {compiledPrompt}
                </div>
              </div>

              {/* Actions panel */}
              <div className="mt-6 pt-4 border-t border-stone-200/60 flex items-center justify-end gap-3">
                <button
                  id="template-copy-btn"
                  onClick={handleCopy}
                  className="px-5 py-2.5 font-bold text-xs text-stone-700 bg-stone-200 hover:bg-stone-300 rounded-xl transition-all flex items-center gap-1.5"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-700 font-bold" />
                      <span className="text-emerald-700">تم نسخ قالبك!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>{lang === 'ar' ? 'نسخ ومصادقة سريعة' : 'Copy customized prompt'}</span>
                    </>
                  )}
                </button>

                <button
                  id="template-sandbox-send"
                  onClick={() => onSendToTester(compiledPrompt)}
                  className="px-5 py-2.5 font-bold text-xs text-white bg-amber-700 hover:bg-amber-800 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-amber-800/10"
                >
                  <Cpu className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'نقل إلى مختبر الأوامر لتجربته' : 'Load into AI Playground'}</span>
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
