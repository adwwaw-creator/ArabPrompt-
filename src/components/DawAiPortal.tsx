/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Sparkles, BookOpen, PenTool, Clapperboard, Film, Image as ImageIcon, 
  Video, Palette, Lightbulb, GraduationCap, ArrowLeft, ArrowRight, 
  ExternalLink, ShieldCheck, Zap, Database, Layers, CheckCircle2, Info, Crown
} from 'lucide-react';
import { ActiveTab, AppLanguage } from '../types';

interface DawAiPortalProps {
  lang: AppLanguage;
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenAuth?: () => void;
  onOpenCheckout?: () => void;
}

export default function DawAiPortal({ lang, onNavigateTab, onOpenAuth, onOpenCheckout }: DawAiPortalProps) {
  const isAr = lang === 'ar';
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  const quickTools = [
    {
      id: 'library' as ActiveTab,
      titleAr: 'مكتبة البرومتات ومولّد الأوامر (0 API)',
      titleEn: 'DawAi Prompt Library & Meta-Synthesizer',
      descAr: '110+ قالب جاهز في البورتريه، الجرافيك، Gemini، والبحث العلمي مع دمج فوري لأفكارك دون استهلاك رصيد أو مفاتيح API.',
      descEn: '110+ curated prompts across portrait, graphic, Gemini & research with 0-API client-side prompt fusion.',
      icon: BookOpen,
      badgeAr: '100% مجاني',
      badgeEn: '100% Free',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    },
    {
      id: 'builder' as ActiveTab,
      titleAr: 'مُهندس الأوامر الذكي (ArabiPrompt Pro)',
      titleEn: 'Advanced AI Prompt Builder Studio',
      descAr: 'صياغة بروتوكولية دقيقة ومزدوجة (مباشرة ومتعمقة) تدعم أحدث نماذج Gemini وChatGPT وClaude وMidjourney.',
      descEn: 'Precision dual-mode engineering calibrated for top-tier LLMs and image models.',
      icon: PenTool,
      badgeAr: 'احترافي Pro',
      badgeEn: 'Pro Studio',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    },
    {
      id: 'cinema' as ActiveTab,
      titleAr: 'سينما المشاهد والأفلام AI',
      titleEn: 'Cinema Movie & Screenplay Studio',
      descAr: 'تأليف المشاهد السينمائية المتسلسلة، حركة الكاميرات، اتساق الشخصيات، وتوليد لقطات الأفلام ثلاثية الأبعاد.',
      descEn: 'Choreograph cinematic scenes, character consistency, dynamic camera physics, and script generation.',
      icon: Clapperboard,
      badgeAr: 'استوديو سينما',
      badgeEn: 'Cinema Suite',
      badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    },
    {
      id: 'reverse' as ActiveTab,
      titleAr: 'الهندسة العكسية للصور والمشاهد',
      titleEn: 'Multimodal Image & Video Reverse Engineering',
      descAr: 'استخراج الأوامر الهندسية الدقيقة والبارامترات البصرية الخفية من الصور ومقاطع الفيديو بنقرة واحدة.',
      descEn: 'Deconstruct visual assets to extract latent lighting, focal lenses, framing, and master prompts.',
      icon: ImageIcon,
      badgeAr: 'تحليل بصري',
      badgeEn: 'Visual Engine',
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    },
    {
      id: 'drone' as ActiveTab,
      titleAr: 'مصمم أوامر الفيديو والدرون',
      titleEn: 'Drone Camera & Video Prompt Designer',
      descAr: 'هندسة مسارات طيران كاميرات الدرون، سرعة الشتر، الإضاءة الحجمية، وحركات الفيديو السينمائي.',
      descEn: 'Design drone flight paths, volumetric lighting, FPS, camera tilt, pan, and motion dynamics.',
      icon: Video,
      badgeAr: 'فيديو متقدم',
      badgeEn: 'Drone Paths',
      badgeColor: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-200 dark:border-sky-800',
    },
    {
      id: 'visual_library' as ActiveTab,
      titleAr: 'مكتبة الصور الفنية (36 أسلوباً)',
      titleEn: 'Visual Concept & Style Library (36 Styles)',
      descAr: 'استكشاف الأساليب الفنية والمدارس التصويرية المختلفة مع أوامر جاهزة للتطبيق في استوديو الأوامر.',
      descEn: 'Explore 36 distinctive artistic movements, lighting palettes, and photorealistic benchmarks.',
      icon: Palette,
      badgeAr: '36 أسلوباً',
      badgeEn: '36 Styles',
      badgeColor: 'bg-[#c29b40]/15 text-[#916a24] dark:text-amber-400 border-[#c29b40]/30',
    },
  ];

  const handleTriggerCheckout = () => {
    if (onOpenCheckout) {
      onOpenCheckout();
    } else {
      window.dispatchEvent(new CustomEvent('open-checkout', { detail: { plan: 'pro' } }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-fade-in">
      
      {/* 1. Grand Hero Banner (Unified ArabPrompt Golden & Stone Aesthetic) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1c1a16] via-stone-900 to-[#282116] text-white p-7 sm:p-10 shadow-xl border border-[#c29b40]/35">
        {/* Warm Golden Glow Accents */}
        <div className="absolute top-0 end-0 -mt-10 -me-10 w-72 h-72 bg-[#c29b40]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 start-0 -mb-10 -ms-10 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#c29b40]/20 border border-[#c29b40]/40 text-amber-300 text-xs font-black shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#c29b40]" />
            <span>
              {isAr 
                ? 'بوابة DawAi الإبداعية المتكاملة • ArabPrompt Studio Suite' 
                : 'DawAi Unified Creative Gateway • ArabPrompt Studio Suite'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            {isAr ? (
              <>
                إبداعك يبدأ من{' '}
                <span className="bg-gradient-to-r from-[#ecd197] via-[#c29b40] to-amber-400 bg-clip-text text-transparent">
                  DawAi
                </span>
              </>
            ) : (
              <>
                Your Creativity Starts with{' '}
                <span className="bg-gradient-to-r from-[#ecd197] via-[#c29b40] to-amber-400 bg-clip-text text-transparent">
                  DawAi
                </span>
              </>
            )}
          </h1>

          <p className="text-sm sm:text-base text-stone-300 leading-relaxed max-w-2xl">
            {isAr 
              ? 'منصة موحدة تجمع بين استوديو ArabiPrompt المتطور لصياغة الأوامر الهندسية والأفلام، ومكتبة برومتات ذكية تضم 110+ قالب جاهز مع مولّد أوامر يعمل محلياً دون استهلاك رصيد أو مفاتيح API.' 
              : 'A unified creative workspace merging the ArabiPrompt AI studio with an in-browser prompt library containing 110+ production-grade prompts and a 0-API meta-synthesizer.'}
          </p>

          {/* Hero Quick Navigation & Upgrade Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => onNavigateTab('builder')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#916a24] via-[#c29b40] to-amber-500 hover:from-[#7e5c1d] hover:to-amber-600 text-white font-black text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>{isAr ? '✦ الدخول إلى مُهندس الأوامر' : '✦ Launch Prompt Builder'}</span>
              <Arrow className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('library')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer backdrop-blur-sm"
            >
              <BookOpen className="w-4 h-4 text-amber-300" />
              <span>{isAr ? '📚 مكتبة البرومتات (110+ قالب)' : '📚 Prompt Library (110+)'}</span>
            </button>

            <button
              type="button"
              onClick={handleTriggerCheckout}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-[#c29b40]/30 to-amber-500/20 hover:from-amber-500/30 hover:to-amber-500/30 text-amber-300 border border-[#c29b40]/60 font-black text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Crown className="w-4 h-4 text-amber-400" />
              <span>{isAr ? 'الترقية والاشتراك والدفع' : 'Upgrade & Pay'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. The Two Primary Destination Gateways */}
      <section className="space-y-4" aria-label="خدمات DawAi">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-black text-stone-900 dark:text-stone-100 flex items-center gap-2 font-sans">
            <span className="w-2.5 h-2.5 rounded-full bg-[#c29b40]" />
            <span>{isAr ? 'اختر وجهتك في DawAi' : 'Choose Your Pathway'}</span>
          </h2>
          <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
            {isAr ? 'بوابات متكاملة وسلسة' : 'Integrated Creative Gateways'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          
          {/* Tile 1: ArabiPrompt Pro Studio */}
          <article className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-amber-500/5 via-white to-white dark:from-[#c29b40]/10 dark:via-[#161512] dark:to-[#161512] border-2 border-[#c29b40] p-6 sm:p-8 shadow-xl flex flex-col justify-between group transition-all duration-300 hover:shadow-2xl">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#c29b40]/20 flex items-center justify-center text-[#9c7524] dark:text-amber-400">
                  <Crown className="w-6 h-6 text-[#c29b40]" />
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-[#c29b40]/15 text-[#916a24] dark:text-amber-400 border border-[#c29b40]/30 font-black">
                  {isAr ? 'الاستوديو الاحترافي المتقدم ⭐' : 'Pro Studio Suite'}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100">
                  {isAr ? 'استوديو ArabiPrompt Pro' : 'ArabiPrompt Pro Suite'}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                  {isAr 
                    ? 'انتقل إلى استوديو ArabiPrompt المتكامل لتوليد وصياغة الأوامر الهندسية المزدوجة، سينما المشاهد والأفلام، تثبيت الشخصيات، الهندسة العكسية، وتصميم مسارات الفيديو والدرون.' 
                    : 'Step into the complete engineering suite for dual-output prompts, cinema screenplay synthesis, character face anchoring, and drone camera motion.'}
                </p>
              </div>

              {/* Micro feature pills */}
              <div className="grid grid-cols-2 gap-2.5 pt-2 text-xs text-stone-700 dark:text-stone-300">
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-[#c29b40] shrink-0" />
                  <span>{isAr ? 'مُهندس أوامر متقدم' : 'Advanced Builder'}</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-[#c29b40] shrink-0" />
                  <span>{isAr ? 'سينما وأفلام AI' : 'Cinema Movie Studio'}</span>
                </div>
                <div className="flex items-center gap-1.5 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-[#c29b40] shrink-0" />
                  <span>{isAr ? 'هندسة عكسية للصور' : 'Image Reverse Engine'}</span>
                </div>
                <div className="flex items-center gap-1.5 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-[#c29b40] shrink-0" />
                  <span>{isAr ? 'فيديو ومسارات درون' : 'Drone Video Paths'}</span>
                </div>
              </div>
            </div>

            <div className="pt-6 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => onNavigateTab('builder')}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#916a24] via-[#c29b40] to-amber-500 hover:opacity-95 text-white font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isAr ? 'الدخول إلى الاستوديو' : 'Launch Studio'}</span>
                <Arrow className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleTriggerCheckout}
                className="py-3 px-4 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-950 font-black text-xs sm:text-sm shadow-sm hover:opacity-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>{isAr ? 'الترقية والدفع' : 'Upgrade'}</span>
              </button>
            </div>
          </article>

          {/* Tile 2: DawAi Free Library & Meta-Synthesizer */}
          <article className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#161512] border border-stone-200/90 dark:border-stone-800 p-6 sm:p-8 shadow-lg flex flex-col justify-between group transition-all duration-300 hover:shadow-xl hover:border-[#c29b40]/60">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 dark:bg-cyan-950/40 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                  <BookOpen className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 font-bold">
                  {isAr ? '110+ قالب • بدون أي API' : 'Free Library • 0 API Needed'}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100">
                  {isAr ? 'مكتبة البرومتات ومولّد الأوامر' : 'DawAi Prompts Library & Synthesizer'}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                  {isAr 
                    ? '110+ برومت وقالب جاهز في البورتريه، الجرافيك، التجريدي، الرسوم، Gemini، والبحث العلمي، مع مولّد أوامر فوري يدمج فكرتك ويصنع أمراً احترافياً لأي نموذج دون استهلاك رصيد.' 
                    : '110+ verified prompts in portrait, graphic, abstract, illustration, Gemini, and academic research with a client-side command compiler.'}
                </p>
              </div>

              {/* Micro feature pills */}
              <div className="grid grid-cols-2 gap-2.5 pt-2 text-xs text-stone-700 dark:text-stone-300">
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                  <span>{isAr ? '110+ قالب مدقق وموثق' : '110+ Curated Prompts'}</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                  <span>{isAr ? 'مولّد أوامر بـ 0 API' : '0-API Meta-Generator'}</span>
                </div>
                <div className="flex items-center gap-1.5 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                  <span>{isAr ? 'قوالب البحث العلمي (ROPE)' : 'Academic Research Hub'}</span>
                </div>
                <div className="flex items-center gap-1.5 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                  <span>{isAr ? 'تصدير واستيراد JSON' : 'Local JSON Backup'}</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="button"
                onClick={() => onNavigateTab('library')}
                className="w-full py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-850 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-950 font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isAr ? 'فتح مكتبة البرومتات والمولّد ←' : 'Open Prompt Library & Generator'}</span>
                <Arrow className="w-4 h-4" />
              </button>
            </div>
          </article>

        </div>
      </section>

      {/* 3. Live Statistics Grid (Unified Card Aesthetic) */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-[#161512] p-4 sm:p-5 text-center shadow-xs">
          <strong className="block text-2xl sm:text-3xl font-black text-[#916a24] dark:text-amber-400 font-mono">110+</strong>
          <span className="text-xs text-stone-500 dark:text-stone-400 mt-1 block font-medium">
            {isAr ? 'قوالب وبرومتات جاهزة' : 'Curated Prompts'}
          </span>
        </div>

        <div className="rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-[#161512] p-4 sm:p-5 text-center shadow-xs">
          <strong className="block text-2xl sm:text-3xl font-black text-cyan-600 dark:text-cyan-400 font-mono">7+</strong>
          <span className="text-xs text-stone-500 dark:text-stone-400 mt-1 block font-medium">
            {isAr ? 'تصنيفات تخصصية' : 'Distinct Categories'}
          </span>
        </div>

        <div className="rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-[#161512] p-4 sm:p-5 text-center shadow-xs">
          <strong className="block text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">0</strong>
          <span className="text-xs text-stone-500 dark:text-stone-400 mt-1 block font-medium">
            {isAr ? 'مفاتيح API مطلوبة للمكتبة' : 'API Keys Required'}
          </span>
        </div>

        <div className="rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-[#161512] p-4 sm:p-5 text-center shadow-xs">
          <strong className="block text-2xl sm:text-3xl font-black text-amber-500 font-mono">12+</strong>
          <span className="text-xs text-stone-500 dark:text-stone-400 mt-1 block font-medium">
            {isAr ? 'استوديوهات وأدوات متكاملة' : 'Creative AI Studios'}
          </span>
        </div>
      </section>

      {/* 4. Extended Suite Tools Grid (Harmonized with ArabPrompt) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-stone-900 dark:text-stone-100 flex items-center gap-2 font-sans">
              <Sparkles className="w-5 h-5 text-[#c29b40]" />
              <span>{isAr ? 'مختبرات واستوديوهات المنصة' : 'Creative Studios & Labs'}</span>
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              {isAr ? 'انتقل مباشرة إلى أي استوديو مخصص لتوليد الأوامر السينمائية والبصرية والبحثية' : 'Direct access to specialized prompt synthesis suites'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('library')}
            className="self-start sm:self-auto text-xs font-bold text-[#916a24] dark:text-amber-400 hover:underline flex items-center gap-1 transition cursor-pointer"
          >
            <span>{isAr ? 'عرض الكل في المكتبة' : 'View Library'}</span>
            <Arrow className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickTools.map(tool => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                onClick={() => onNavigateTab(tool.id)}
                className="rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-[#161512] hover:border-[#c29b40]/70 dark:hover:border-[#c29b40]/70 p-5 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[#c29b40]/15 dark:bg-[#c29b40]/25 flex items-center justify-center text-[#916a24] dark:text-amber-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${tool.badgeColor}`}>
                      {isAr ? tool.badgeAr : tool.badgeEn}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-stone-900 dark:text-stone-100 text-base group-hover:text-[#916a24] dark:group-hover:text-amber-400 transition">
                      {isAr ? tool.titleAr : tool.titleEn}
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                      {isAr ? tool.descAr : tool.descEn}
                    </p>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between text-xs font-bold text-[#916a24] dark:text-amber-400 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform">
                  <span>{isAr ? 'فتح الأداة' : 'Launch Studio'}</span>
                  <Arrow className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Academic Protocol & Safe Usage Notice Banner */}
      <section className="rounded-2xl border border-[#c29b40]/30 bg-gradient-to-r from-[#c29b40]/10 via-amber-500/5 to-transparent p-5 sm:p-6 text-stone-700 dark:text-stone-300 text-xs sm:text-sm space-y-2 shadow-2xs">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-[#c29b40] shrink-0 mt-0.5" />
          <div className="space-y-1 leading-relaxed">
            <p className="font-bold text-stone-900 dark:text-stone-100">
              {isAr ? 'ملاحظة تشغيلية وميثاق الاستخدام الآمن:' : 'Operational Notice & Usage Protocol:'}
            </p>
            <p className="text-stone-600 dark:text-stone-400">
              {isAr 
                ? 'DawAi بوابة شاملة ومستقلة؛ مكتبة البرومتات ومولّد الأوامر يعملان بالكامل محلياً داخل المتصفح (Client-side)، وتُحفظ المفضلة والتعديلات على جهازك دون إرسال بيانات إلى خوادم خارجية ودون استهلاك رصيد أو طلب أي مفاتيح API. أدوات البحث العلمي مصممة لتمكين الباحثين وتتطلب مراجعة بشرية للنتائج.' 
                : 'DawAi is an independent creative portal; the prompts library and meta-synthesizer run entirely inside your browser with 0 API calls required. Favorites and edits are stored locally on your device.'}
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
