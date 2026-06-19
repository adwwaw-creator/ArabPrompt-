/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Gauge, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  Shield,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { evaluatePrompt } from '../utils/promptEvaluator';

interface PromptQualityScoreProps {
  promptText: string;
  lang: 'ar' | 'en';
}

export default function PromptQualityScore({ promptText, lang }: PromptQualityScoreProps) {
  const [showDetailedChecklist, setShowDetailedChecklist] = useState(false);

  // Compute scoring and diagnostics in real time
  const evaluation = React.useMemo(() => evaluatePrompt(promptText), [promptText]);

  if (!promptText || !promptText.trim()) return null;

  const { score, clarity, context, ambiguity, ratings, checklist } = evaluation;

  // Visual helper for score colors
  const getScoreColor = (val: number) => {
    if (val >= 80) return {
      bgColor: 'bg-emerald-500/10',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-500/20',
      barColor: 'bg-emerald-500',
      lightText: 'text-emerald-600',
      iconColor: 'text-emerald-600'
    };
    if (val >= 50) return {
      bgColor: 'bg-amber-500/10',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-500/20',
      barColor: 'bg-amber-500',
      lightText: 'text-amber-600',
      iconColor: 'text-amber-500'
    };
    return {
      bgColor: 'bg-rose-500/10',
      textColor: 'text-rose-700',
      borderColor: 'border-rose-500/20',
      barColor: 'bg-rose-500',
      lightText: 'text-rose-600',
      iconColor: 'text-rose-600'
    };
  };

  const getSubRatingBadgeStyle = (category: 'clarity' | 'context' | 'ambiguity', val: string) => {
    if (category === 'clarity') {
      if (val === 'Excellent') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      if (val === 'Good') return 'bg-teal-50 text-teal-700 border-teal-200';
      if (val === 'Needs Work') return 'bg-amber-50 text-amber-700 border-amber-200';
      return 'bg-rose-50 text-rose-700 border-rose-200';
    } else if (category === 'context') {
      if (val === 'Dense') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      if (val === 'Moderate') return 'bg-blue-50 text-blue-700 border-blue-200';
      return 'bg-amber-50 text-amber-700 border-amber-200';
    } else { // ambiguity
      if (val === 'Low Risk') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      if (val === 'Medium Risk') return 'bg-amber-50 text-amber-700 border-amber-200';
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
  };

  const theme = getScoreColor(score);

  // Localization labels
  const labels = {
    title: lang === 'ar' ? 'مؤشر جودة صياغة البرومبت' : 'Prompt Quality Diagnostics',
    subtitle: lang === 'ar' ? 'تقييم فوري للوضوح، السياق وقدرة تحديد المهمة' : 'Immediate structural analysis for clarity, depth, and risk',
    overallScore: lang === 'ar' ? 'التقييم العام' : 'Overall Score',
    clarityLabel: lang === 'ar' ? 'الوضوح (Clarity)' : 'Clarity',
    contextLabel: lang === 'ar' ? 'السياق والتفاصيل (Context)' : 'Context Depth',
    ambiguityLabel: lang === 'ar' ? 'تقليل اللبس (Unambiguity)' : 'Clarity/Risk',
    expandChecklist: lang === 'ar' ? 'عرض تفاصيل الفحص وتوصيات التحسين' : 'Show Diagnostic Details & Optimization Advice',
    collapseChecklist: lang === 'ar' ? 'إخفاء تفاصيل الفحص وتوصيات التحسين' : 'Hide Diagnostic Details & Optimization Advice',
    gradeExcellent: lang === 'ar' ? 'احترافي ممتاز' : 'Exceptional',
    gradeGood: lang === 'ar' ? 'جيد جداً' : 'High Quality',
    gradeWarning: lang === 'ar' ? 'يحتاج تحسين' : 'Needs Optimization',
  };

  const getOverallGradeText = () => {
    if (score >= 85) return labels.gradeExcellent;
    if (score >= 65) return labels.gradeGood;
    return labels.gradeWarning;
  };

  return (
    <div className={`rounded-2xl border ${theme.borderColor} ${theme.bgColor} p-4 sm:p-5 transition-all duration-300 self-stretch mb-4 shadow-sm`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200/15">
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-lg bg-white/70 shadow-sm ${theme.textColor}`}>
            <Gauge className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-stone-800 flex items-center gap-1.5">
              <span>{labels.title}</span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border bg-white ${theme.textColor}`}>
                {getOverallGradeText()}
              </span>
            </h4>
            <p className="text-[11px] text-stone-500/90 mt-0.5">
              {labels.subtitle}
            </p>
          </div>
        </div>

        {/* Big Circular/Bubble Score */}
        <div className="flex items-center gap-2 bg-white/90 px-3 py-1.5 rounded-xl border border-stone-200/40 shadow-sm self-start sm:self-center">
          <div className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
            {labels.overallScore}
          </div>
          <div className={`text-lg sm:text-xl font-black ${theme.textColor}`}>
            {score}<span className="text-xs text-stone-400 font-medium">/100</span>
          </div>
        </div>
      </div>

      {/* Progress Bars and Ratings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 pt-3.5 pb-2">
        {/* Clarity metric card */}
        <div className="bg-white/50 hover:bg-white/80 p-3 rounded-xl border border-stone-200/10 transition-all shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] sm:text-xs font-bold text-stone-600 block">
              {labels.clarityLabel}
            </span>
            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase ${getSubRatingBadgeStyle('clarity', ratings.clarity)}`}>
              {lang === 'ar' ? (
                ratings.clarity === 'Excellent' ? 'ممتاز' :
                ratings.clarity === 'Good' ? 'جيد' :
                ratings.clarity === 'Needs Work' ? 'بحاجة لضبط' : 'ضعيف'
              ) : ratings.clarity}
            </span>
          </div>
          <div className="w-full bg-stone-200/50 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${clarity}%` }}
            />
          </div>
          <span className="text-[9px] text-stone-400 block mt-1.5 text-right font-mono">
            {clarity}%
          </span>
        </div>

        {/* Context depth card */}
        <div className="bg-white/50 hover:bg-white/80 p-3 rounded-xl border border-stone-200/10 transition-all shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] sm:text-xs font-bold text-stone-600 block">
              {labels.contextLabel}
            </span>
            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase ${getSubRatingBadgeStyle('context', ratings.context)}`}>
              {lang === 'ar' ? (
                ratings.context === 'Dense' ? 'غني ومفصل' :
                ratings.context === 'Moderate' ? 'متوسط التفاصيل' : 'محدود الصياغة'
              ) : ratings.context}
            </span>
          </div>
          <div className="w-full bg-stone-200/50 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-sky-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${context}%` }}
            />
          </div>
          <span className="text-[9px] text-stone-400 block mt-1.5 text-right font-mono">
            {context}%
          </span>
        </div>

        {/* Ambiguity metric card */}
        <div className="bg-white/50 hover:bg-white/80 p-3 rounded-xl border border-stone-200/10 transition-all shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] sm:text-xs font-bold text-stone-600 block">
              {labels.ambiguityLabel}
            </span>
            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase ${getSubRatingBadgeStyle('ambiguity', ratings.ambiguity)}`}>
              {lang === 'ar' ? (
                ratings.ambiguity === 'Low Risk' ? 'قليل اللبس' :
                ratings.ambiguity === 'Medium Risk' ? 'لبس محتمل' : 'خطر مبهم عالٍ'
              ) : ratings.ambiguity}
            </span>
          </div>
          <div className="w-full bg-stone-200/50 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-amber-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${ambiguity}%` }}
            />
          </div>
          <span className="text-[9px] text-stone-400 block mt-1.5 text-right font-mono">
            {ambiguity}%
          </span>
        </div>
      </div>

      {/* Accordion Toggle for Detailed Diagnostics Advice */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowDetailedChecklist(!showDetailedChecklist)}
          className="w-full py-1.5 px-3 rounded-lg bg-white/40 hover:bg-white/80 border border-stone-200/20 text-[11px] font-bold text-stone-700 transition-all flex items-center justify-between gap-1.5 cursor-pointer shadow-2xs"
        >
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#c29b40]" />
            <span>{showDetailedChecklist ? labels.collapseChecklist : labels.expandChecklist}</span>
          </span>
          {showDetailedChecklist ? (
            <ChevronUp className="w-3.5 h-3.5 text-stone-500" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
          )}
        </button>

        {showDetailedChecklist && (
          <div className="mt-3 bg-white/90 rounded-xl border border-stone-200/30 p-3.5 space-y-3 shadow-inner animate-fadeIn">
            {checklist.map((item) => (
              <div 
                key={item.id} 
                className="flex items-start gap-2.5 text-xs pb-2.5 border-b border-stone-100 last:border-b-0 last:pb-0"
              >
                {item.status === 'good' && (
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                )}
                {item.status === 'warning' && (
                  <AlertTriangle className="w-4 h-4 text-amber-500/90 shrink-0 mt-0.5" />
                )}
                {item.status === 'info' && (
                  <Info className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                )}

                <div className="flex-1">
                  <div className="font-bold text-stone-800 flex items-center gap-1.5">
                    <span>{lang === 'ar' ? item.label.ar : item.label.en}</span>
                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded ${
                      item.status === 'good' ? 'bg-emerald-100 text-emerald-800' :
                      item.status === 'warning' ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'
                    }`}>
                      {lang === 'ar' ? (
                        item.status === 'good' ? 'متحقق' :
                        item.status === 'warning' ? 'توصية هامة' : 'ميزة اختيارية'
                      ) : item.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">
                    {lang === 'ar' ? item.feedback.ar : item.feedback.en}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
