/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, ArrowLeft, ArrowRight, Zap, Check, Eye } from 'lucide-react';
import VisitorCounter from './VisitorCounter';

interface HeroSectionProps {
  lang: 'ar' | 'en';
  onGetStarted: () => void;
}

export default function HeroSection({ lang, onGetStarted }: HeroSectionProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#fdfcf9] to-[#f7f5ef] border-b border-stone-200/60 py-12 md:py-20">
      
      {/* Decorative Warm background blur effects */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-80 h-80 bg-[#c29b40]/5 rounded-full blur-3xl" />
      <div className="absolute top-1/4 right-1/4 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        {/* Badge Intro */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#c29b40]/10 border border-[#c29b40]/15 text-[#916a24] text-xs font-bold mb-6 hover:scale-105 transition-all">
          <Sparkles className="w-3.5 h-3.5" />
          <span>
            {lang === 'ar' 
              ? 'الجيل التالي من صياغة تكنولوجيا التعليمات' 
              : 'The Pinnacle of Arabic Prompt Engineering'}
          </span>
        </div>

        {/* Primary Heading */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#1c1a16] tracking-tight max-w-4xl mx-auto leading-[1.2] font-sans">
          {lang === 'ar' ? (
            <>
              اكتب أفكارك بوضوح، وسيتولى <span className="bg-gradient-to-r from-[#8c6a1e] to-[#c29b40] bg-clip-text text-transparent">الذكاء الاصطناعي</span> صياغة البرومبت المثالي
            </>
          ) : (
            <>
              Speak Your Idea. We Build the <span className="bg-gradient-to-r from-[#8c6a1e] to-[#c29b40] bg-clip-text text-transparent">Ultimate AI Prompt</span>
            </>
          )}
        </h2>

        {/* Sub-description */}
        <p className="mt-5 text-sm sm:text-base md:text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
          {lang === 'ar' 
            ? 'منصة صياغة وهندسة أوامر ذكية متخصصة لتعزيز مخرجات النماذج اللغوية الكبيرة. صمم قالبك، حسن الصياغة لتقليص الأخطاء، وحول أفكارك البسيطة لتعليمات دقيقة للغاية.' 
            : 'Convert standard descriptive sketches into structured core parameters for LLMs. Minimize model hallucinations, optimize formatting rules, and test outputs instantly.'}
        </p>

        {/* Interactive Action buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            id="hero-cta-btn"
            onClick={onGetStarted}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#c29b40] hover:bg-[#a6802f] text-white font-bold text-sm shadow-lg shadow-[#c29b40]/20 hover:shadow-xl transition-all flex items-center justify-center gap-2 border border-[#916a24]"
          >
            <span>{lang === 'ar' ? 'ابدأ ك مهندس برومبت الآن' : 'Start Designing Prompts'}</span>
            {lang === 'ar' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Unique Analytics & Visitor Counter */}
        <div className="mt-8 flex justify-center">
          <VisitorCounter lang={lang} />
        </div>

        {/* Features list (Clean structural bento layout) */}
        <div className="mt-14 max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-right rtl:text-right">
          
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-stone-200/80 hover:border-[#c29b40]/40 transition-all duration-300 relative group">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4 font-bold">
              <Zap className="w-5 h-5 text-[#c29b40]" />
            </div>
            <h3 className="font-bold text-stone-800 text-base mb-2">
              {lang === 'ar' ? 'تحسين صياغة فوري' : 'Instant Prompt Optimizer'}
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              {lang === 'ar'
                ? 'تحويل الأفكار البسيطة والقصيرة لتوجيهات كاملة مبنية على الأدوار والقيود والتعليمات الصارمة لبرمجة الذكاء.'
                : 'Expands standard commands with custom system roles, target outputs, constraints, and negative examples.'}
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-stone-200/80 hover:border-[#c29b40]/40 transition-all duration-300 relative group">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center mb-4 font-bold">
              <Check className="w-5 h-5 text-[#c29b40]" />
            </div>
            <h3 className="font-bold text-stone-800 text-base mb-2">
              {lang === 'ar' ? 'مكتبة قوالب جاهزة ومتغيرة' : 'Placeholder Templating'}
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              {lang === 'ar'
                ? 'استخدام قوالب مخصصة للأعمال، البرمجة والتسويق مع متغيرات تفاعلية تمكنك من حشو التفاصيل وتخصيص السياق.'
                : 'Bento-grid matching categories of business and programming tasks with custom variables ready to copy.'}
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-stone-200/80 hover:border-[#c29b40]/40 transition-all duration-300 relative group">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-4 font-bold">
              <Eye className="w-5 h-5 text-[#c29b40]" />
            </div>
            <h3 className="font-bold text-stone-800 text-base mb-2">
              {lang === 'ar' ? 'مختبر اختبار متكامل' : 'AI Testing Sandbox'}
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              {lang === 'ar'
                ? 'جرب البرومبت الجديد مباشرة من داخل المنصة لتراجع فاعليته وتتأكد من دقة إجابة الذكاء الاصطناعي.'
                : 'Inspect outputs live using our sandbox, avoiding tedious copy-pastes between chat tabs.'}
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
