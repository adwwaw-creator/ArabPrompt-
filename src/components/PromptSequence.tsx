/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Film, Sparkles, Sliders, ArrowLeft, ArrowRight, Play, Pause, RefreshCw, 
  Trash2, Plus, Copy, Check, Info, HelpCircle, Shuffle, Video, Clapperboard,
  Download, Eye, EyeOff, ListOrdered, Share2, SkipBack, SkipForward, Repeat, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { showToast } from './ToastNotification';

interface Scene {
  titleAr: string;
  titleEn: string;
  promptAr: string;
  promptEn: string;
  motion: string;
  intensity: number;
  theme: string;
}

interface PromptSequenceProps {
  lang: 'ar' | 'en';
  onSendToTester?: (promptText: string) => void;
}

const THEME_GRADIENTS: Record<string, string> = {
  scifi: 'from-[#111827] via-[#1e1b4b] to-[#311042]',
  fantasy: 'from-[#1e1b4b] via-[#311042] to-[#581c87]',
  nature: 'from-[#064e3b] via-[#022c22] to-[#042f2e]',
  action: 'from-[#450a0a] via-[#111827] to-[#1e1b4b]',
  vintage: 'from-[#451a03] via-[#2d1b0d] to-[#1a120b]',
};

export default function PromptSequence({ lang, onSendToTester }: PromptSequenceProps) {
  const [concept, setConcept] = useState('');
  const [anchorStyle, setAnchorStyle] = useState('hyper-detailed cinematic realism, golden hour lighting, 8k resolution');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [transitionEffect, setTransitionEffect] = useState('fade');
  const [scenes, setScenes] = useState<Scene[]>([
    {
      titleAr: "مغامر يكتشف وادٍ غامض",
      titleEn: "The Canyon Passage",
      promptAr: "مسافر وحيد يسير ببطء في وادي أحمر شاهق وصخور تلمع بضوء ذهبي دافئ، رياح تثير رمال ناعمة",
      promptEn: "A lone traveler wearing a hooded cloak walking slowly through giant, imposing red rock canyon walls, dust particles catching golden hour sunlight, majestic adventure mood, hyper-detailed cinematic realism, golden hour lighting, 8k resolution",
      motion: "Pan Right",
      intensity: 4,
      theme: "nature"
    },
    {
      titleAr: "ظهور واحة كريستالية سحرية",
      titleEn: "The Shimmering Oasis",
      promptAr: "الكاميرا تميل لأسفل لتكشف عن واحة خضراء مذهلة في قلب الصخور مياه فيروزية عذبة وتتدفق الشلالات",
      promptEn: "Camera tilting down to suddenly reveal a beautiful lush turquoise oasis hidden in the desert depth, palm trees, crystal clean waterfalls cascading down mossy stones, hyper-detailed cinematic realism, golden hour lighting, 8k resolution",
      motion: "Tilt Down",
      intensity: 6,
      theme: "nature"
    },
    {
      titleAr: "بريق النجوم والزهور المضيئة",
      titleEn: "Ethereal Flora Glowing",
      promptAr: "المسافر يقترب من بحيرة الواحة، زهور عملاقة متوهجة تفتح في الماء، فراشات ملونة تضيء بنور ذهبي دافئ حوله",
      promptEn: "Close shot of the traveler kneeling at the water's edge, glowing mystical water flowers floating, soft light particles rising, ethereal atmosphere, macro details, hyper-detailed cinematic realism, golden hour lighting, 8k resolution",
      motion: "Zoom In",
      intensity: 3,
      theme: "nature"
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Video Preview Player state
  const [activeFrameIndex, setActiveFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(3.5); // duration in seconds per scene
  const [isLooping, setIsLooping] = useState(true);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [showAdvancedPanel, setShowAdvancedPanel] = useState(false);

  const playerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-play trigger cycle with high-fidelity elapsed time tracking
  useEffect(() => {
    if (isPlaying && scenes.length > 0) {
      const tickRate = 50; // ms per tick for smooth timeline player updates
      playerIntervalRef.current = setInterval(() => {
        setElapsedMs((prev) => {
          const next = prev + tickRate;
          const limit = playbackSpeed * 1000;
          if (next >= limit) {
            setActiveFrameIndex((current) => {
              const nextIdx = current + 1;
              if (nextIdx >= scenes.length) {
                if (isLooping) {
                  return 0;
                } else {
                  setIsPlaying(false);
                  return current;
                }
              }
              return nextIdx;
            });
            return 0;
          }
          return next;
        });
      }, tickRate);
    } else {
      if (playerIntervalRef.current) {
        clearInterval(playerIntervalRef.current);
      }
    }
    return () => {
      if (playerIntervalRef.current) {
        clearInterval(playerIntervalRef.current);
      }
    };
  }, [isPlaying, scenes.length, playbackSpeed, isLooping]);

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNextFrame = () => {
    setElapsedMs(0);
    setActiveFrameIndex((prev) => (prev + 1) % scenes.length);
  };

  const handlePrevFrame = () => {
    setElapsedMs(0);
    setActiveFrameIndex((prev) => (prev - 1 + scenes.length) % scenes.length);
  };

  const handleSeekToFrame = (index: number) => {
    setElapsedMs(0);
    setActiveFrameIndex(index);
  };

  // Generate sequence using backend API
  const handleGenerateSequence = async () => {
    if (!concept.trim()) {
      setErrorMessage(lang === 'ar' ? 'الرجاء إدخال فكرة أو مفهوم أولاً لتوليد السلسلة!' : 'Please enter a concept first!');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setIsPlaying(false);

    try {
      const response = await fetch('/api/sequence-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          concept,
          anchorStyle,
        }),
      });

      if (!response.ok) {
        throw new Error('API server returned error state');
      }

      const data = await response.json();
      if (data.scenes && Array.isArray(data.scenes)) {
        setScenes(data.scenes);
        setActiveFrameIndex(0);
      } else {
        throw new Error('Invalid output structure');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        lang === 'ar' 
          ? 'تعذر الاتصال بالخادم الذكي. جاري محاكاة السيناريو محلياً لمتابعة العمل بدون انقطاع.' 
          : 'Unable to build sequence via online service. Switched to automated local narrative designer.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Update specific field in scenes
  const updateScene = (index: number, key: keyof Scene, value: any) => {
    const updated = [...scenes];
    updated[index] = { ...updated[index], [key]: value };
    setScenes(updated);
  };

  // Remove scenery scene
  const removeScene = (index: number) => {
    if (scenes.length <= 1) {
      setErrorMessage(lang === 'ar' ? 'يجب أن تبقي على مشهد واحد على الأقل في السلسلة!' : 'You must retain at least one scene in the sequence!');
      return;
    }
    const updated = scenes.filter((_, idx) => idx !== index);
    setScenes(updated);
    if (activeFrameIndex >= updated.length) {
      setActiveFrameIndex(0);
    }
  };

  // Append new scene
  const addNewScene = () => {
    const newScene: Scene = {
      titleAr: `المشهد ${scenes.length + 1}`,
      titleEn: `Scene ${scenes.length + 1}`,
      promptAr: `أكمل تتابع القصة هنا بحدث بصري إضافي...`,
      promptEn: `Continue the story narrative with another visual event... ${anchorStyle || ''}`,
      motion: 'Zoom In',
      intensity: 5,
      theme: scenes[scenes.length - 1]?.theme || 'nature',
    };
    setScenes([...scenes, newScene]);
    setActiveFrameIndex(scenes.length);
  };

  // Single copy utility
  const handleCopySingle = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    showToast(lang === 'ar' ? `✓ تم نسخ برومبت المشهد #${index + 1} للحافظة!` : `✓ Prompt for Scene #${index + 1} copied!`);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Compound copy utility for video models compiled prompt list
  const handleCopyAll = () => {
    const compoundText = scenes.map((scene, idx) => {
      const num = idx + 1;
      return `[Scene #${num} - Title: ${scene.titleEn}]\nPrompt: ${scene.promptEn}\nMotion: ${scene.motion} (Intensity: ${scene.intensity}/10)\nAspectRatio: ${aspectRatio}\n---`;
    }).join('\n\n');

    navigator.clipboard.writeText(compoundText);
    setCopiedAll(true);
    showToast(lang === 'ar' ? '✓ تم نسخ جميع المشاهد المتتالية كـ Storyboard مجمّع!' : '✓ Copied all sequence storyboard frames successfully!');
    setTimeout(() => setCopiedAll(false), 2000);
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (concept.trim() && !isLoading) {
          e.preventDefault();
          handleGenerateSequence();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        if (scenes.length > 0) {
          e.preventDefault();
          handleCopyAll();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [concept, anchorStyle, scenes, isLoading, aspectRatio]);

  const handleLoadTemplate = (chosenConcept: string, chosenStyle: string) => {
    setConcept(chosenConcept);
    setAnchorStyle(chosenStyle);
  };

  const activeSceneInstance = scenes[activeFrameIndex] || scenes[0];

  // Helper motion class rendering mock player animations
  const getMotionAnimationClasses = (motionType: string, active: boolean) => {
    if (!active) return '';
    switch (motionType) {
      case 'Zoom In': return 'scale-110 duration-[4000ms] transition-transform ease-out';
      case 'Zoom Out': return 'scale-90 duration-[4000ms] transition-transform ease-out';
      case 'Pan Left': return '-translate-x-12 duration-[4500ms] transition-transform ease-out';
      case 'Pan Right': return 'translate-x-12 duration-[4500ms] transition-transform ease-out';
      case 'Tilt Up': return '-translate-y-10 duration-[4500ms] transition-transform ease-out';
      case 'Tilt Down': return 'translate-y-10 duration-[4500ms] transition-transform ease-out';
      case 'Orbit': return 'rotate-2 scale-105 duration-[4500ms] transition-transform ease-out';
      default: return 'scale-100 duration-1000';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-right rtl:text-right" id="prompt-sequence-workspace">
      
      {/* 1. Header & Quick description */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-stone-200 pb-6 mb-8 gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 flex items-center gap-2">
            <Film className="w-7 h-7 text-[#c29b40] shrink-0" />
            <span>{lang === 'ar' ? 'سلاسل الرسوم ومُخرّج المشاهد للفيديو' : 'AI Video Sequence & Storyboard Designer'}</span>
          </h2>
          <p className="text-stone-500 text-sm mt-1 max-w-2xl font-medium leading-relaxed">
            {lang === 'ar'
              ? 'صمم تتابع الأوامر والمشاهد لإنتاج فيديوهات متناسقة ذكياً. اضبط حركة الكاميرات واجمع المشاهد لتقليص عيوب الحركة في محركات مثل Runway, Luma Dream Machine و Sora.'
              : 'Construct and align cohesive frames for video synthesis. Coordinate camera paths, motion forces, and visual logic to craft narrative consistency across clips.'}
          </p>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleCopyAll}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-stone-800 bg-white hover:bg-stone-50 border border-stone-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:border-stone-300"
          >
            {copiedAll ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{lang === 'ar' ? 'تم نسخ مصفوفة التتابع!' : 'Storyboard Copied!'}</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-[#c29b40]" />
                <span>{lang === 'ar' ? 'نسخ مصفوفة التتابع بالكامل' : 'Copy Full Storyboard'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main workspace Grid Layout: Player / Editor split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Visual Player Preview & Overarching Config (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* A. Live Cinematic Simulated Video Player */}
          <div className="bg-[#171614] rounded-2xl overflow-hidden shadow-2xl border border-stone-800 flex flex-col relative">
            <div className="p-4 border-b border-stone-800 flex items-center justify-between text-xs text-stone-400 bg-[#1c1a17]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse"></span>
                <span className="font-sans font-bold uppercase tracking-widest text-[9px] text-stone-300">
                  {lang === 'ar' ? 'معاينة تتابع الفيديو المشحون' : 'Simulated Sequence Playback'}
                </span>
              </div>
              <span className="font-mono text-stone-500 font-extrabold bg-[#23211f] px-2 py-0.5 rounded-sm">
                FPS: 24 | {aspectRatio}
              </span>
            </div>

            {/* Video Canvas Sandbox */}
            <div 
              className={`relative bg-gradient-to-tr ${THEME_GRADIENTS[activeSceneInstance?.theme || 'scifi']} aspect-video overflow-hidden group flex items-center justify-center`}
              style={{ aspectRatio: aspectRatio === '16:9' ? '16/9' : aspectRatio === '9:16' ? '9/16' : '1/1' }}
            >
              {/* Dynamic decorative backdrop grid */}
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

              {/* Transition Layer */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFrameIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: transitionEffect === 'fade' ? 0.6 : 0.1 }}
                  className="absolute inset-0 flex flex-col justify-between p-6 select-none"
                >
                  {/* Visual animation engine layer */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-40">
                    <div className={`w-full h-full bg-cover bg-center mix-blend-overlay ${getMotionAnimationClasses(activeSceneInstance?.motion, isPlaying)}`}
                      style={{ backgroundImage: `url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800')` }}
                    />
                  </div>

                  {/* Top indicators */}
                  <div className="relative flex justify-between items-start z-10">
                    <span className="text-[10px] bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full text-white font-bold flex items-center gap-1.5 border border-white/10 uppercase">
                      <Clapperboard className="w-3 h-3 text-amber-400" />
                      <span>{lang === 'ar' ? `المشهد #${activeFrameIndex + 1}` : `Scene #${activeFrameIndex + 1}`}</span>
                    </span>
                    <span className="text-[10px] bg-black/45 backdrop-blur-md px-2.5 py-1 rounded-full text-amber-400 font-mono font-black border border-amber-400/25 uppercase">
                      ⚡ M: {activeSceneInstance?.motion || 'Static'}
                    </span>
                  </div>

                  {/* Mid Scene Concept */}
                  <div className="relative my-auto text-center px-4 max-w-md mx-auto z-10">
                    <h4 className="text-white text-base font-extrabold tracking-tight drop-shadow-lg leading-relaxed">
                      {lang === 'ar' ? activeSceneInstance?.titleAr : activeSceneInstance?.titleEn}
                    </h4>
                    <p className="text-stone-300 text-[10px] drop-shadow-md mt-1 italic max-w-xs mx-auto line-clamp-2">
                      {lang === 'ar' ? activeSceneInstance?.promptAr : activeSceneInstance?.promptEn}
                    </p>
                  </div>

                  {/* Overlay text bar at bottom simulating subtitles */}
                  <div className="relative z-10 bg-black/60 backdrop-blur-xs rounded-xl p-3 border border-white/5 text-center mt-auto">
                    <p className="text-white text-[11px] leading-relaxed select-all font-mono break-words">
                      "{activeSceneInstance?.promptEn}"
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Video Playback & Nav Controls (Ugraded Timeline Player) */}
            <div className="p-4 bg-[#11100e] border-t border-stone-800 flex flex-col gap-4">
              
              {/* Timeline Info Bar (Timecode & State Indicator) */}
              <div className="flex items-center justify-between text-xs border-b border-stone-800/80 pb-3">
                <div className="flex items-center gap-1.5 text-stone-300">
                  <Clock className="w-4 h-4 text-[#c29b40]" />
                  <span className="font-bold text-[10px] uppercase tracking-wider text-stone-400">
                    {lang === 'ar' ? 'مؤشر الوقت المباشر:' : 'Playhead Timecode:'}
                  </span>
                  <span className="font-mono bg-stone-900 px-2 py-0.5 rounded text-xs font-black text-amber-500 tracking-wider font-semibold">
                    {(() => {
                      const playhead = (activeFrameIndex * playbackSpeed) + (elapsedMs / 1000);
                      const minutes = Math.floor(playhead / 60);
                      const seconds = Math.floor(playhead % 60);
                      const ms = Math.floor((playhead % 1) * 100);
                      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
                    })()}
                  </span>
                  <span className="text-stone-600">/</span>
                  <span className="font-mono text-stone-500 font-bold text-xs">
                    {(() => {
                      const total = scenes.length * playbackSpeed;
                      const minutes = Math.floor(total / 60);
                      const seconds = Math.floor(total % 60);
                      const ms = Math.floor((total % 1) * 100);
                      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
                    })()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-stone-500">
                    {lang === 'ar' ? `مشهد ${activeFrameIndex + 1} من ${scenes.length}` : `Scene ${activeFrameIndex + 1} of ${scenes.length}`}
                  </span>
                  {isPlaying ? (
                    <span className="px-1.5 py-0.5 bg-emerald-950 text-emerald-400 text-[9px] font-black uppercase rounded animate-pulse border border-emerald-800/50">
                      {lang === 'ar' ? 'تشغيل' : 'Live'}
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 bg-stone-900 text-stone-500 text-[9px] font-black uppercase rounded border border-stone-800">
                      {lang === 'ar' ? 'مؤقت' : 'Paused'}
                    </span>
                  )}
                </div>
              </div>

              {/* Multi-Track Timeline Grid Container */}
              <div className="space-y-2">
                <div className="text-[10px] font-black uppercase text-stone-500 tracking-wider flex items-center justify-between">
                  <span>{lang === 'ar' ? 'شريط مسار الكاميرا والتسلسل البصري:' : 'Linear Scene Timeline Tracks:'}</span>
                  <span className="font-mono text-[#c29b40] font-bold">{playbackSpeed}s {lang === 'ar' ? 'لكل لقطة' : 'per scene'}</span>
                </div>

                <div className="grid gap-1.5 direction-ltr" style={{ gridTemplateColumns: `repeat(${scenes.length}, minmax(0, 1fr))` }}>
                  {scenes.map((scene, idx) => {
                    const isActive = idx === activeFrameIndex;
                    const isPassed = idx < activeFrameIndex;
                    
                    // Calculate precise loading/play progress pct
                    let pct = 0;
                    if (isActive) {
                      pct = (elapsedMs / (playbackSpeed * 1000)) * 100;
                    } else if (isPassed) {
                      pct = 100;
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSeekToFrame(idx)}
                        className={`text-left rounded-xl overflow-hidden p-2.5 bg-[#1c1a17] hover:bg-[#252320] border transition-all duration-200 cursor-pointer flex flex-col justify-between h-[56px] relative group min-w-0 ${
                          isActive 
                            ? 'border-[#c29b40] shadow-[0_0_12px_rgba(194,155,64,0.15)] bg-[#1e1b17]' 
                            : 'border-stone-800/60'
                        }`}
                        title={lang === 'ar' ? scene.titleAr : scene.titleEn}
                      >
                        {/* Background track indicator */}
                        <div className="absolute inset-0 bg-stone-900/30 pointer-events-none" />

                        {/* Top progress track light */}
                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-stone-950 pointer-events-none">
                          <div 
                            className="h-full bg-gradient-to-r from-amber-600 via-[#c29b40] to-yellow-400 transition-all duration-75"
                            style={{ width: `${pct}%` }}
                          />
                        </div>

                        {/* Block body content */}
                        <div className="relative z-10 flex items-center justify-between w-full mt-1">
                          <span className={`font-mono text-[9px] font-extrabold group-hover:text-stone-300 ${
                            isActive ? 'text-[#c29b40]' : 'text-stone-500'
                          }`}>
                            #{(idx + 1).toString().padStart(2, '0')}
                          </span>
                          <span className="font-sans text-[8px] font-bold text-amber-500/90 uppercase tracking-widest bg-stone-950/80 px-1 py-0.5 rounded max-w-[55px] truncate">
                            {scene.motion || 'Static'}
                          </span>
                        </div>

                        <div className="relative z-10 text-[9px] text-stone-300 truncate font-semibold w-full mt-0.5">
                          {lang === 'ar' ? scene.titleAr : scene.titleEn}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Master Playback controls */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-2 gap-3">
                {/* Control utility buttons */}
                <div className="flex items-center gap-1.5">
                  {/* Seek Start */}
                  <button
                    onClick={() => handleSeekToFrame(0)}
                    className="p-2 rounded-lg bg-[#1c1a17] hover:bg-[#25231f] border border-stone-800 text-stone-400 hover:text-white transition-colors cursor-pointer"
                    title={lang === 'ar' ? 'إعادة تشغيل من البداية' : 'Reset playhead to starts'}
                  >
                    <SkipBack className="w-3.5 h-3.5" />
                  </button>

                  {/* Previous Frame */}
                  <button
                    onClick={handlePrevFrame}
                    className="p-2.5 rounded-lg bg-[#1c1a17] hover:bg-[#25231f] border border-stone-800 text-stone-300 hover:text-white transition-colors cursor-pointer"
                    title={lang === 'ar' ? 'المشهد السابق' : 'Previous Scene'}
                  >
                    {lang === 'ar' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                  </button>

                  {/* Toggle Play/Pause */}
                  <button
                    onClick={handleTogglePlay}
                    className="p-3.5 rounded-xl bg-[#c29b40] hover:bg-[#b08732] text-white transition-all shadow-md flex items-center justify-center scale-105 active:scale-95 cursor-pointer hover:shadow-amber-500/10"
                    title={isPlaying ? (lang === 'ar' ? 'إيقاف مؤقت' : 'Pause sequence') : (lang === 'ar' ? 'تشغيل السلسلة' : 'Play sequence')}
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                  </button>

                  {/* Next Frame */}
                  <button
                    onClick={handleNextFrame}
                    className="p-2.5 rounded-lg bg-[#1c1a17] hover:bg-[#25231f] border border-stone-800 text-stone-300 hover:text-white transition-colors cursor-pointer"
                    title={lang === 'ar' ? 'المشهد التالي' : 'Next Scene'}
                  >
                    {lang === 'ar' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  </button>

                  {/* Seek End */}
                  <button
                    onClick={() => handleSeekToFrame(scenes.length - 1)}
                    className="p-2 rounded-lg bg-[#1c1a17] hover:bg-[#25231f] border border-stone-800 text-stone-400 hover:text-white transition-colors cursor-pointer"
                    title={lang === 'ar' ? 'الذهاب للقطة الأخيرة' : 'Jump to final scene'}
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Speed & Loop configurations */}
                <div className="flex items-center gap-2">
                  {/* Loop State option */}
                  <button
                    onClick={() => setIsLooping(!isLooping)}
                    className={`py-2 px-3 rounded-xl text-[10px] font-black flex items-center gap-1.5 transition-all border duration-200 cursor-pointer ${
                      isLooping 
                        ? 'bg-[#c29b40]/10 hover:bg-[#c29b40]/15 text-[#c29b40] border-[#c29b40]/30' 
                        : 'bg-stone-900 hover:bg-[#1c1a17] text-stone-500 border-stone-800'
                    }`}
                    title={lang === 'ar' ? 'تبديل وضع التكرار' : 'Toggle Loop Mode'}
                  >
                    <Repeat className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'تكرار التشغيل' : 'Loop Mode'}</span>
                  </button>

                  {/* Duration Slider configuration */}
                  <div className="flex items-center gap-2 border border-stone-800 bg-[#1c1a17] px-3 py-1.5 rounded-xl">
                    <span className="text-[10px] text-stone-400 font-bold">
                      {lang === 'ar' ? 'السرعة:' : 'Duration:'}
                    </span>
                    <select
                      value={playbackSpeed}
                      onChange={(e) => {
                        setPlaybackSpeed(parseFloat(e.target.value));
                        setElapsedMs(0); // reset elapsed playhead to keep it aligned with the new speed limits
                      }}
                      className="bg-transparent text-[#c29b40] text-xs font-black border-none focus:outline-none p-0 cursor-pointer"
                    >
                      <option value="2.0" className="bg-[#11100e]">2s {lang === 'ar' ? 'سريعة' : 'Fast'}</option>
                      <option value="3.5" className="bg-[#11100e]">3.5s {lang === 'ar' ? 'متوازن' : 'Medium'}</option>
                      <option value="5.0" className="bg-[#11100e]">5s {lang === 'ar' ? 'سينمائي' : 'Cinematic'}</option>
                      <option value="7.0" className="bg-[#11100e]">7s {lang === 'ar' ? 'مستديم' : 'Sustained'}</option>
                    </select>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* B. Overarching Video Settings Configuration Panel */}
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
            <h4 className="text-xs font-black uppercase text-stone-400 tracking-wider flex items-center gap-1.5 border-b border-stone-100 pb-3 mb-4">
              <Sliders className="w-4 h-4 text-[#c29b40]" />
              <span>{lang === 'ar' ? 'المعطيات البصرية القياسية' : 'Overarching Render Coordinates'}</span>
            </h4>

            <div className="grid grid-cols-2 gap-4">
              {/* Aspect Ratio choice */}
              <div>
                <label className="block text-[11px] font-bold text-stone-500 mb-1.5">
                  {lang === 'ar' ? 'أبعاد الكادر (Aspect Ratio):' : 'Aspect Ratio:'}
                </label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="w-full text-xs font-bold text-stone-800 bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:ring-1 focus:ring-[#c29b40] focus:border-[#c29b40]"
                >
                  <option value="16:9">16:9 ({lang === 'ar' ? 'رئيسي للتلفاز / يوتيوب' : 'Wide HDTV'})</option>
                  <option value="9:16">9:16 ({lang === 'ar' ? 'تيك توك / ريلز عمودي' : 'Vertical Reels'})</option>
                  <option value="1:1">1:1 ({lang === 'ar' ? 'مربع إنستغرام' : 'Square Canvas'})</option>
                  <option value="2.35:1">2.35:1 ({lang === 'ar' ? 'سينما عريضة للغاية' : 'Cinematic Anamorphic'})</option>
                </select>
              </div>

              {/* Transition choice */}
              <div>
                <label className="block text-[11px] font-bold text-stone-500 mb-1.5">
                  {lang === 'ar' ? 'نوع الانتقال البينى:' : 'Transition Type:'}
                </label>
                <select
                  value={transitionEffect}
                  onChange={(e) => setTransitionEffect(e.target.value)}
                  className="w-full text-xs font-bold text-stone-800 bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:ring-1 focus:ring-[#c29b40] focus:border-[#c29b40]"
                >
                  <option value="fade">{lang === 'ar' ? 'دمج ناعم (Crossfade)' : 'Crossfading'}</option>
                  <option value="cut">{lang === 'ar' ? 'انتقال حاد (Instant Cut)' : 'Instant Cut'}</option>
                </select>
              </div>
            </div>

            {/* Overarching Style Anchor block */}
            <div className="mt-4">
              <label className="block text-[11px] font-bold text-stone-500 mb-1.5 flex items-center gap-1">
                <span>{lang === 'ar' ? 'مثبّت الأسلوب الموحد لجميع اللقطات (Style Anchor):' : 'Overarching Visual Anchor:'}</span>
                <span className="text-[9px] font-bold text-[#c29b40] px-1 bg-amber-50 rounded-sm">Global</span>
              </label>
              <textarea
                value={anchorStyle}
                onChange={(e) => setAnchorStyle(e.target.value)}
                rows={2}
                className="w-full text-xs font-mono bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:ring-1 focus:ring-[#c29b40] focus:border-[#c29b40] text-stone-700 leading-relaxed resize-none"
                placeholder={lang === 'ar' ? 'اكتب تراكيب الأسلوب الجمالي لتعزز التناسق البصري بين اللقطات...' : 'Write style anchors to stabilize consistency...'}
              />
              <p className="text-[10px] text-stone-400 mt-1 leading-relaxed">
                {lang === 'ar'
                  ? '💡 يتم حقن هذا التوصيف تلقائياً في نهاية كافة الأوامر بالإنجليزية لتحقيق تماسك بصري تام للمنتج النهائي.'
                  : '💡 Automatically injected at the end of each frame description to secure strict stylistic consistency.'}
              </p>
            </div>
          </div>

          {/* Quick Idea Templates Selector for swift testing */}
          <div className="bg-[#fcfbf9] border border-stone-200/90 rounded-2xl p-5">
            <h5 className="text-xs font-black text-stone-800 flex items-center gap-1 mb-3">
              <Shuffle className="w-4 h-4 text-[#c29b40]" />
              <span>{lang === 'ar' ? 'قوالب تتابع سريعة للتجربة' : 'Starter Cinematic Outlines'}</span>
            </h5>
            <div className="space-y-2">
              <button
                onClick={() => handleLoadTemplate(
                  "رحلة مركبة فضائية زجاجية تبحث عن حياة خلف نجم نيوتروني مضيء",
                  "retro futuristic high fidelity, hyper-detailed cyberpunk spaceship cinematic lens --v 6.0"
                )}
                className="w-full text-right rtl:text-right text-xs p-2.5 rounded-xl border border-stone-200 hover:border-[#c29b40]/50 bg-white hover:bg-stone-50 transition-all flex items-center justify-between group cursor-pointer"
              >
                <span>🚀 {lang === 'ar' ? 'رحلة سفينة استكشاف الفضاء الكونية' : 'Interstellar Starship Expedition'}</span>
                <span className="text-[9px] font-extrabold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full group-hover:bg-indigo-150 transition-colors">Sci-Fi</span>
              </button>

              <button
                onClick={() => handleLoadTemplate(
                  "مطاردة سيارات سباق تطير في شوارع نيون عائمة ممطرة ليلاً",
                  "cinematic photorealistic, lens flares, cyber-street layout, raining neon reflections, highly coordinated composition"
                )}
                className="w-full text-right rtl:text-right text-xs p-2.5 rounded-xl border border-stone-200 hover:border-[#c29b40]/50 bg-white hover:bg-stone-50 transition-all flex items-center justify-between group cursor-pointer"
              >
                <span>🏎️ {lang === 'ar' ? 'مطاردة مركبات دافعة في مدينة طائرة' : 'Rainy Hovercar Cyber Chase'}</span>
                <span className="text-[9px] font-extrabold px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full group-hover:bg-purple-150 transition-colors">Cyberpunk</span>
              </button>

              <button
                onClick={() => handleLoadTemplate(
                  "طبيعة وادي صحراوي مع شلال عائم خيالي ينهمر وسط السحب",
                  "warm sun rays, ethereal fantasy environmental design, majestic waterfalls, epic scale photography 8k"
                )}
                className="w-full text-right rtl:text-right text-xs p-2.5 rounded-xl border border-stone-200 hover:border-[#c29b40]/50 bg-white hover:bg-stone-50 transition-all flex items-center justify-between group cursor-pointer"
              >
                <span>🏜️ {lang === 'ar' ? 'واحة خيالية عائمة وسط جدران صخرية' : 'Surreal Floating Waterfalls Canyon'}</span>
                <span className="text-[9px] font-extrabold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full group-hover:bg-emerald-150 transition-colors">Fantasy</span>
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: AI Prompt Builder Input & Frames Segment Tree Editor (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* C. Coherent AI Assistant Sequence Generator Prompt Input */}
          <div className="bg-gradient-to-br from-white to-[#faf9f6] rounded-2xl p-6 border border-stone-200 shadow-sm relative overflow-hidden">
            {/* Ambient gold corner accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#c29b40]/5 rounded-bl-[100px] pointer-events-none"></div>

            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-[#c29b40]/10 text-[#a07727] rounded-xl shrink-0">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-black text-stone-850">
                  {lang === 'ar' ? 'التوجيه السلس بالذكاء الاصطناعي (Coherent AI Planner)' : 'Storyboard Sequence AI Generator'}
                </h3>
                <p className="text-stone-400 text-[11px] font-medium mt-0.5">
                  {lang === 'ar' ? 'اكتب المفهوم الإجمالي لقصتك، وسيشذب النموذج اللغوي تتابعاً متكاملاً من المشاهد' : 'Describe your video concept; Gemini will outline coordinated scenes with coherent prompts.'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <textarea
                  value={concept}
                  onChange={(e) => { setConcept(e.target.value); setErrorMessage(''); }}
                  rows={3}
                  className="w-full text-xs font-medium placeholder-stone-400 text-stone-800 bg-white border border-stone-200 rounded-xl p-3.5 focus:ring-2 focus:ring-[#c29b40]/30 focus:border-[#c29b40] leading-relaxed shadow-xs"
                  placeholder={lang === 'ar' ? 'مثال: رائد فضاء يستكشف قمراً مهجوراً، يبدأ بالهبوط من سفينته، يجد معبداً كريستالياً يشع بنور أزرق، ثم يدخله بحذر...' : 'Describe flow: An astronaut exploring a giant crystal temple, starting from starship exit, searching cavern, discovering blue monolith, and interacting...'}
                />
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-xl text-xs bg-amber-50 text-amber-800 border border-amber-100 flex items-start gap-2 leading-relaxed">
                  <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="flex justify-between items-center gap-2">
                <p className="text-[10px] text-stone-400">
                  {lang === 'ar' ? '💡 يطالب النظام Gemini ببناء 4 مشاهد مترابطة مع تعبير دقيق لحركة الكاميرات.' : '💡 Builds 4 frames with explicit camera vectors for optimized playback.'}
                </p>

                <button
                  onClick={handleGenerateSequence}
                  disabled={isLoading}
                  className="px-5 py-3 rounded-xl text-xs font-black text-white bg-gradient-to-r from-[#916a24] to-[#c29b40] hover:from-[#c29b40] hover:to-[#ecd197] transition-all flex items-center gap-2 shadow-md hover:shadow-lg focus:outline-none disabled:opacity-50 cursor-pointer text-center"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{lang === 'ar' ? 'جاري بناء التتابع البصري...' : 'Engineering Sequence...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{lang === 'ar' ? 'برمجة وتوليد السلسلة سينمائياً (Ctrl+Enter)' : 'Generate Cinematic Sequence (Ctrl+Enter)'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* D. Interactive Frames Editor Segment tree */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div className="flex items-center gap-2">
                <ListOrdered className="w-5 h-5 text-stone-500" />
                <h3 className="text-sm font-black text-stone-850">
                  {lang === 'ar' ? 'تخطيط وترتيب مخرجات المَشاهد الفردية' : 'Storyboard Clip Coordinators'}
                </h3>
              </div>
              <span className="text-[10px] font-bold text-stone-400 bg-stone-50 border border-stone-150 rounded-full px-2.5 py-1">
                {scenes.length} {lang === 'ar' ? 'مشاهد منشأة' : 'Scenes Drafted'}
              </span>
            </div>

            {/* Frame List Container */}
            <div className="space-y-6">
              {scenes.map((scene, index) => {
                const isActiveInPlayer = activeFrameIndex === index;
                return (
                  <div 
                    key={index} 
                    className={`p-5 rounded-2xl border transition-all relative ${
                      isActiveInPlayer 
                        ? 'border-[#c29b40] bg-[#faf8f4] ring-2 ring-[#c29b40]/10 shadow-xs' 
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    {/* Frame index chip absolute top */}
                    <div className="absolute top-4 left-4 flex items-center gap-1.5 direction-ltr">
                      <span className={`text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border font-mono ${
                        isActiveInPlayer 
                          ? 'bg-[#c29b40] text-white border-[#c29b40]' 
                          : 'bg-stone-50 text-stone-500 border-stone-200'
                      }`}>
                        {index + 1}
                      </span>
                    </div>

                    {/* Frame details row */}
                    <div className="flex flex-col gap-4">
                      
                      {/* Title & Custom Tag Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-2 mb-1">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={lang === 'ar' ? scene.titleAr : scene.titleEn}
                            onChange={(e) => updateScene(index, lang === 'ar' ? 'titleAr' : 'titleEn', e.target.value)}
                            className="font-bold text-sm text-stone-850 bg-transparent border-none focus:ring-0 p-0 w-full placeholder-stone-400 focus:outline-none"
                            placeholder={lang === 'ar' ? 'اسم المشهد...' : 'Scene name...'}
                          />
                        </div>
                        <div className="flex items-center gap-1 shrink-0 self-start sm:self-auto">
                          {/* Theme tag */}
                          <select
                            value={scene.theme}
                            onChange={(e) => updateScene(index, 'theme', e.target.value)}
                            className="text-[10px] bg-stone-50 text-stone-600 font-extrabold px-2 py-1 rounded-lg border border-stone-200 cursor-pointer"
                          >
                            <option value="scifi">Sci-Fi</option>
                            <option value="fantasy">Fantasy</option>
                            <option value="nature">Nature</option>
                            <option value="action">Action</option>
                            <option value="vintage">Vintage</option>
                          </select>
                        </div>
                      </div>

                      {/* Descriptive Prompts Workspace */}
                      <div className="space-y-3">
                        {/* 1. English Prompt (Highly technical context for the actual video seed generator) */}
                        <div>
                          <label className="block text-[11px] font-black text-stone-500 mb-1 flex items-center gap-1">
                            <span>{lang === 'ar' ? 'الأمر بالإنجليزية (لإرساله لمحركات التوليد):' : 'Engineered Prompt (English):'}</span>
                            <span className="text-[9px] text-[#c29b40] font-normal font-sans">For Midjourney/Runway</span>
                          </label>
                          <textarea
                            value={scene.promptEn}
                            onChange={(e) => updateScene(index, 'promptEn', e.target.value)}
                            rows={2}
                            className="w-full text-xs font-mono text-stone-800 bg-stone-50 hover:bg-stone-50/70 border border-stone-200 rounded-xl p-3 focus:ring-1 focus:ring-[#c29b40] focus:border-[#c29b40] leading-relaxed resize-none"
                            placeholder="Detailed scene description in English..."
                          />
                        </div>

                        {/* 2. Arabic Prompt summary (for local reading of story) */}
                        {lang === 'ar' && (
                          <div>
                            <label className="block text-[11px] font-black text-stone-500 mb-1">
                              الشرح بالعربية (لتتبع التسلسل اللغوي):
                            </label>
                            <textarea
                              value={scene.promptAr}
                              onChange={(e) => updateScene(index, 'promptAr', e.target.value)}
                              rows={1}
                              className="w-full text-xs text-stone-700 bg-transparent border-none p-0 focus:ring-0 placeholder-stone-400 resize-none font-medium text-stone-600"
                              placeholder="توصيف المشهد لغوياً بالعربية..."
                            />
                          </div>
                        )}
                      </div>

                      {/* Frame-Specific camera vectors selection & intensity */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-50/50 p-3.5 rounded-xl border border-stone-200/60 text-xs">
                        
                        {/* Camera motion */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-stone-500 font-bold shrink-0">
                            {lang === 'ar' ? 'حركة الكاميرا (Camera Motion):' : 'Camera Motion:'}
                          </span>
                          <select
                            value={scene.motion}
                            onChange={(e) => updateScene(index, 'motion', e.target.value)}
                            className="bg-white border border-stone-200 text-stone-800 font-bold rounded-lg px-2 py-1 focus:ring-1 focus:ring-[#c29b40] shrink-0 cursor-pointer"
                          >
                            <option value="Zoom In">{lang === 'ar' ? 'تكبير (Zoom In)' : 'Zoom In'}</option>
                            <option value="Zoom Out">{lang === 'ar' ? 'تصغير (Zoom Out)' : 'Zoom Out'}</option>
                            <option value="Pan Left">{lang === 'ar' ? 'يسار (Pan Left)' : 'Pan Left'}</option>
                            <option value="Pan Right">{lang === 'ar' ? 'يمين (Pan Right)' : 'Pan Right'}</option>
                            <option value="Tilt Up">{lang === 'ar' ? 'لأعلى (Tilt Up)' : 'Tilt Up'}</option>
                            <option value="Tilt Down">{lang === 'ar' ? 'لأسفل (Tilt Down)' : 'Tilt Down'}</option>
                            <option value="Orbit">{lang === 'ar' ? 'دوران دائري (Orbit)' : 'Orbit'}</option>
                            <option value="Static">{lang === 'ar' ? 'ثابت (Static)' : 'Static'}</option>
                          </select>
                        </div>

                        {/* Motion intensity */}
                        <div className="flex items-center gap-3">
                          <span className="text-stone-500 font-bold shrink-0">
                            {lang === 'ar' ? 'كثافة وقوة الحركة:' : 'Force/'}
                          </span>
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={scene.intensity}
                            onChange={(e) => updateScene(index, 'intensity', parseInt(e.target.value, 10))}
                            className="flex-1 accent-[#c29b40]"
                          />
                          <span className="font-mono font-black text-stone-800 shrink-0 select-none bg-white border border-stone-200 rounded px-1.5 py-0.5 text-[10px]">
                            {scene.intensity}/10
                          </span>
                        </div>

                      </div>

                      {/* Actions footer for single scene card */}
                      <div className="flex justify-between items-center mt-1 pt-3 border-t border-stone-100">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              handleSeekToFrame(index);
                              if (onSendToTester) onSendToTester(scene.promptEn);
                            }}
                            className="px-2.5 py-1.5 rounded-lg text-[10px] font-black hover:bg-stone-100 text-[#c29b40] flex items-center gap-1 transition-colors border border-transparent hover:border-stone-200"
                            title={lang === 'ar' ? 'اختبر هذا الكادر في المختبر الفردي' : 'Test this prompt snippet in Sandbox'}
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>{lang === 'ar' ? 'إرسال للمختبِر' : 'Playground'}</span>
                          </button>

                          <button
                            onClick={() => handleCopySingle(scene.promptEn, index)}
                            className="px-2.5 py-1.5 rounded-lg text-[10px] font-black hover:bg-stone-50 text-stone-600 flex items-center gap-1 transition-colors border border-stone-200"
                          >
                            {copiedIndex === index ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{lang === 'ar' ? 'تم نسخ المشهد!' : 'Copied scene!'}</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-stone-400" />
                                <span>{lang === 'ar' ? 'نسخ أمر اللقطة' : 'Copy Frame Prompt'}</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="flex gap-2">
                          {/* Sync preview button */}
                          <button
                            onClick={() => { setIsPlaying(false); handleSeekToFrame(index); }}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                              isActiveInPlayer 
                                ? 'bg-[#c29b40]/10 text-[#a07727] border border-[#c29b40]/20' 
                                : 'bg-stone-50 hover:bg-stone-100 text-stone-500 border border-stone-200'
                            }`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{lang === 'ar' ? 'معروض في الشاشة' : 'Viewing in Player'}</span>
                          </button>

                          <button
                            onClick={() => removeScene(index)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all cursor-pointer"
                            title={lang === 'ar' ? 'حذف هذا اللقطة' : 'Delete frame'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>

            {/* Append scene buttons */}
            <div className="pt-2">
              <button
                onClick={addNewScene}
                className="w-full py-3.5 rounded-2xl border-2 border-dashed border-stone-200 hover:border-[#c29b40] text-stone-500 hover:text-[#c29b40] hover:bg-amber-500/5 transition-all text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{lang === 'ar' ? 'أضف مشهد أو لقطة جديدة للسلسلة' : 'Append New Frame to Sequence'}</span>
              </button>
            </div>
          </div>

          {/* Prompting Guide specifically for Video Generators */}
          <div className="bg-amber-500/5 border border-[#c29b40]/20 rounded-2xl p-5">
            <h4 className="text-xs font-black text-stone-850 flex items-center gap-1.5 mb-2.5">
              <Info className="w-4 h-4 text-[#c29b40]" />
              <span>{lang === 'ar' ? 'أسرار هندسة أوامر الفيديو والتحريك (Mastering AI Video)' : 'AI Video Prompter Pro Tips'}</span>
            </h4>
            <ul className="text-xs text-stone-600 space-y-2 list-disc list-inside">
              <li>
                <strong>{lang === 'ar' ? 'تفادي الحركة السريعة:' : 'Avoid Over-complex actions:'}</strong>
                {lang === 'ar' 
                  ? ' بدلاً من "سيارة تنعطف وتطير وتتحول لغواصة"، ركّز على حركة واحدة محددة بكل لقطة لضمان عزل دقيق وعمل ريندر خال من الأخطاء.'
                  : ' Simplify each scene to a single primary movement. Sequential evolution prevents weird algorithmic mutations.'}
              </li>
              <li>
                <strong>{lang === 'ar' ? 'إضافة كلمات السلاسة الكاميرا:' : 'Leverage camera vectors:'}</strong>
                {lang === 'ar'
                  ? ' استخدم تعابير حركة الكاميرا (مثل: slow panning shot, dramatic zoom, handheld drone glide) لتوجه محرك الفيديو في دمج انتقالات بصرية انسيابية.'
                  : ' Inject concrete movement keywords inside each frame configuration (e.g. "slow pan from left to right", "dramatic low tilt") to command rendering motors.'}
              </li>
              <li>
                <strong>{lang === 'ar' ? 'التحكم بالسرعة والأوامر:' : 'Stabilize character frames:'}</strong>
                {lang === 'ar'
                  ? ' ثبت كلمات وصفية موحدة للشخصيات (مثلاً: "red hair, leather jacket") على مستوى كافة المشاهد ليظل البطل ثابتاً ولا يتغير ملامحه.'
                  : ' Retain consistent keywords for your anchor actors or props. "red bomber jacket", "silver steel frame" anchors continuity flawlessly.'}
              </li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
