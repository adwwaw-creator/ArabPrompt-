/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Music,
  Disc,
  Info,
  Sliders,
  Sparkles,
  Clipboard,
  Check,
  Send,
  HelpCircle,
  FileMusic,
  Volume2,
  Mic,
  Zap,
  Ear,
  Eye,
  FileText,
  Trash2,
  Plus
} from 'lucide-react';

interface PromptRapEngineProps {
  lang: 'ar' | 'en';
  onSendToTester: (promptText: string) => void;
  onLogPrompt?: (item: any) => void;
}

export default function PromptRapEngine({ lang, onSendToTester, onLogPrompt }: PromptRapEngineProps) {
  // Input fields state
  const [lyrics, setLyrics] = useState(`Casa dlam o lmdina ghada f tbe3,
Ch7al mn blan ja f rassi o sda3,
Zan9a sfer, l-kbed d lwalida de3.
Sowat l-bassi, khlli l-bass drops igerr3o`);

  const [languageStyle, setLanguageStyle] = useState('franco-arabic'); // franco-arabic, pure-darija, hybrid-french
  const [targetPlatform, setTargetPlatform] = useState('suno'); // suno, udio, gemini, chatgpt, claude
  
  // Music Design state
  const [beatStyle, setBeatStyle] = useState('moroccan-chaabi-drill');
  const [bpm, setBpm] = useState('140');
  const [mood, setMood] = useState('dark-aggressive');
  const [voiceStyle, setVoiceStyle] = useState('raw-street-delivery');
  const [flowComplexity, setFlowComplexity] = useState('technical');
  const [energyLevel, setEnergyLevel] = useState('explosive');

  // Music Production Controls
  const [enableBeatArchitecture, setEnableBeatArchitecture] = useState(true);
  const [enableBass, setEnableBass] = useState(true);
  const [enableDrums, setEnableDrums] = useState(true);
  const [enableMelody, setEnableMelody] = useState(true);
  const [enableFx, setEnableFx] = useState(true);
  const [enableTransitions, setEnableTransitions] = useState(true);
  const [enableLayers, setEnableLayers] = useState(true);
  const [enableMixing, setEnableMixing] = useState(false);
  const [enableMastering, setEnableMastering] = useState(false);

  // Flow Engineering Controls
  const [enableFlow, setEnableFlow] = useState(true);
  const [enableCadence, setEnableCadence] = useState(true);
  const [enableBreaths, setEnableBreaths] = useState(true);
  const [enableRhymePockets, setEnableRhymePockets] = useState(true);
  const [enableDelivery, setEnableDelivery] = useState(true);
  const [flowStyle, setFlowStyle] = useState('drill-cadence');

  // Darija Phonetics Engine
  const [enablePhonetics, setEnablePhonetics] = useState(true);
  const [enableFranco, setEnableFranco] = useState(true);
  const [enableStress, setEnableStress] = useState(true);
  const [enableAiVoice, setEnableAiVoice] = useState(true);

  // Adlibs & Vocal FX
  const [enableAdlibs, setEnableAdlibs] = useState(true);
  const [adlibIntensity, setAdlibIntensity] = useState('aggressive');
  const [enableEcho, setEnableEcho] = useState(true);
  const [enableReverb, setEnableReverb] = useState(true);
  const [enableDelay, setEnableDelay] = useState(true);
  const [enableDistortion, setEnableDistortion] = useState(false);
  const [enableCrowd, setEnableCrowd] = useState(false);
  const [enableWhispers, setEnableWhispers] = useState(true);

  // Cinematic Sound Design
  const [enableVinyl, setEnableVinyl] = useState(true);
  const [enableAmbience, setEnableAmbience] = useState(true);
  const [enableReverseReverb, setEnableReverseReverb] = useState(true);
  const [enableBassDrops, setEnableBassDrops] = useState(true);
  const [enableRisers, setEnableRisers] = useState(true);
  const [enableImpacts, setEnableImpacts] = useState(true);
  const [enableSubbass, setEnableSubbass] = useState(true);

  // Energy & Emotion Controls
  const [enableEnergyMap, setEnableEnergyMap] = useState(true);
  const [enableEmotionCurve, setEnableEmotionCurve] = useState(true);
  const [trackEnergyStyle, setTrackEnergyStyle] = useState('dark-build-up');

  // Weights (0-100 or 1-10)
  const [flowWeight, setFlowWeight] = useState(100);
  const [phoneticsWeight, setPhoneticsWeight] = useState(90);
  const [cinematicWeight, setCinematicWeight] = useState(85);
  const [emotionWeight, setEmotionWeight] = useState(95);
  const [aiVoiceWeight, setAiVoiceWeight] = useState(90);
  const [musicWeight, setMusicWeight] = useState(80);

  // Export Mode
  const [exportMode, setExportMode] = useState('Full Prompt'); // Full Prompt, Suno Optimized, Udio Optimized, JSON Export, Markdown

  // Selected output tab state: 'combined' | 'system' | 'user' | 'settings'
  const [activeOutputTab, setActiveOutputTab] = useState<'combined' | 'system' | 'user' | 'settings'>('combined');

  // Status logs
  const [copied, setCopied] = useState(false);
  const [isSavedInHistory, setIsSavedInHistory] = useState(false);

  // Presets trigger
  const handleApplyPreset = (presetType: 'casablanca' | 'sale' | 'chaabi' | 'dark-street' | 'cinematic-emotional' | 'live-stage') => {
    switch (presetType) {
      case 'dark-street':
        setLyrics(`Zan9a katsme3 sda3, l-7oma kamla mdarba
Dor b lile f l-mwas, dmou3 o mdaye9 mgharba
Chkon li f dhar l-mizan? chkon s7ab l-hadra barda?
Hna l-koun d l-mghrib m3ks, dnya baghya rza9 o rda`);
        setBeatStyle('dark-trap');
        setMood('dark-aggressive');
        setBpm('138');
        setVoiceStyle('raw-street-delivery');
        setFlowComplexity('advanced');
        setEnergyLevel('explosive');
        setTargetPlatform('suno');
        break;
      case 'cinematic-emotional':
        setLyrics(`L-b7ar kaysowel fin mchaw s7ab l-9aleb
Ch7al mn faye9 ghemdo wejho, soret l-mghrib t-ghaleb
Dimas baghi l-khrouj o dmou3 tab3a lwallida
Ayya l-khir ghay-ban khouya wakha l-ghorba b3ida`);
        setBeatStyle('melodic-trap');
        setMood('melancholic-emotional');
        setBpm('85');
        setVoiceStyle('melodic-street');
        setFlowComplexity('medium');
        setEnergyLevel('medium');
        setTargetPlatform('udio');
        break;
      case 'live-stage':
        setLyrics(`Kemanga t-goli lala, l-kamanja s7ira
Lguerba sghira ka-tch-te7 l-mraya lkbira
Zan9a fiha drari, mofte7 koun l-7ila
Rap lmousika dghya tatmchi b lil lila`);
        setBeatStyle('moroccan-chaabi-drill');
        setMood('motivational-epic');
        setBpm('145');
        setVoiceStyle('raw-street-delivery');
        setFlowComplexity('technical');
        setEnergyLevel('explosive');
        setTargetPlatform('gemini');
        break;
      case 'casablanca':
        setLyrics(`Zan9a katsme3 sda3, l-7oma kamla mdarba
Dor b lile f l-mwas, dmou3 o mdaye9 mgharba
Chkon li f dhar l-mizan? chkon s7ab l-hadra barda?
Hna l-koun d l-mghrib m3ks, dnya baghya rza9 o rda`);
        setBeatStyle('moroccan-chaabi-drill');
        setMood('dark-aggressive');
        setBpm('142');
        setVoiceStyle('raw-street-delivery');
        setFlowComplexity('technical');
        setEnergyLevel('explosive');
        break;
      case 'sale':
        setLyrics(`L-b7ar kaysowel fin mchaw s7ab l-9aleb
Ch7al mn faye9 ghemdo wejho, soret l-mghrib t-ghaleb
Dimas baghi l-khrouj o dmou3 tab3a lwallida
Ayya l-khir ghay-ban khouya wakha l-ghorba b3ida`);
        setBeatStyle('dark-trap');
        setMood('melancholic-emotional');
        setBpm('130');
        setVoiceStyle('deep-voice-echo');
        setFlowComplexity('advanced');
        setEnergyLevel('high');
        break;
      case 'chaabi':
        setLyrics(`Kemanga t-goli lala, l-kamanja s7ira
Lguerba sghira ka-tch-te7 l-mraya lkbira
Zan9a fiha drari, mofte7 koun l-7ila
Rap lmousika dghya tatmchi b lil lila`);
        setBeatStyle('hybrid-chaabi-trap');
        setMood('motivational-epic');
        setBpm('112');
        setVoiceStyle('melodic-street');
        setFlowComplexity('medium');
        setEnergyLevel('explosive');
        break;
    }
  };

  const systemPromptText = useMemo(() => {
    return `You are an elite Moroccan Hip-Hop Production Architect specializing in:
- Moroccan street rap & Darija phonetics
- Trap / Drill / Boom-Bap / Cinematic beat design
- Flow engineering & syllable rhythm analysis
- AI music generation optimization (Suno, Udio)
- Emotional storytelling & vocal performance design

## CORE RULES
- Never simplify Darija. Preserve authentic street rhythm.
- Always think step-by-step before generating the blueprint.
- Output must feel: raw, cinematic, energetic, rebellious, authentic.
- Use these symbols in flow analysis:
  (/) = short pause | (//) = long pause
  [FAST] [HARD] [ECHO] [WHISPER] [STRETCH] [BREATH]

## DARIJA PHONETICS FORMAT
For each difficult word provide:
- Franco-Arabic spelling
- English phonetic pronunciation
- Stress location (ALL CAPS)
- Delivery style (e.g. aggressive throat, emotional chest tone)

Example:
غمهراس → Franco: Gha-Mhrass | Phonetic: RHA-MH-RASS | Stress: RASS | Style: aggressive throat
القطعة → Franco: L-9et3a   | Phonetic: L-QET-AA      | Stress: QET  | Style: clipped ending
الكبد  → Franco: L-Kbed    | Phonetic: L-KBEd         | Stress: KBED | Style: emotional chest tone

## OUTPUT STRUCTURE
Always generate these sections in order:

1. 🎯 TRACK IDENTITY
   - Vibe, mood, cinematic direction, energy style

2. 🥁 BEAT ARCHITECTURE
   - BPM, beat style, drum pattern, bass design, melody suggestions

3. 🎤 VERSE-BY-VERSE FLOW ANALYSIS
   - Cadence map, breath timing, rhyme pockets, kick/snare hit words
   - Delivery instructions per line with symbols

4. 📖 DARIJA PRONUNCIATION GUIDE
   - Full phonetic breakdown of difficult words

5. 🔊 VOCAL DESIGN
   - Ad-libs placement & intensity
   - Vocal layering (main, double, harmony, background)
   - FX per section (echo, reverb, delay, distortion)

6. 🎬 CINEMATIC SOUND FX
   - Intro/outro atmosphere, transitions, risers, bass drops, ambience

7. 📊 EMOTIONAL ENERGY TIMELINE
   - Section-by-section energy curve (Intro → Verse → Hook → Bridge → Outro)

8. 🎛️ MIX & MASTER NOTES
   - EQ focus, compression style, loudness target, stereo width

9. 🤖 AI VOICE SYNTHESIS NOTES
   - Optimized style tags for Suno / Udio generation`;
  }, []);

  const userPromptText = useMemo(() => {
    return `## LYRICS
"""
${lyrics}
"""

## PRODUCTION SETTINGS
- Beat Style     : ${beatStyle}
- BPM            : ${bpm}
- Mood           : ${mood}
- Vocal Style    : ${voiceStyle}
- Flow Complexity: ${flowComplexity}
- Energy Level   : ${energyLevel}
- Target Platform: ${targetPlatform}

## OPTIONAL FOCUS
- Extra attention on: ${exportMode === 'Suno Optimized' ? 'Suno style-tags' : exportMode === 'Udio Optimized' ? 'Udio phonetic clarity' : 'Phonetics, flow engineering, and complete arrangement parameters'}
- Energy Timeline Curve: ${enableEnergyMap ? 'Detailed timeline' : 'Standard progression'}
- Instrumentals Accent: ${enableMelody ? 'Traditional Moroccan/Arabic stringed instruments' : 'Modern beats only'}
- Vocal FX: ${adlibIntensity} adlibs, echoes, whispers`;
  }, [lyrics, beatStyle, bpm, mood, voiceStyle, flowComplexity, energyLevel, targetPlatform, exportMode, enableEnergyMap, enableMelody, adlibIntensity]);

  const settingsPromptText = useMemo(() => {
    return `╔══════════════════════════════════════════════════════════════════╗
║        AI MOROCCAN RAP PRODUCTION ENGINE — GEMINI 2.5 FLASH     ║
║              النسخة المحسّنة — Google AI Studio                  ║
╚══════════════════════════════════════════════════════════════════╝

## ⚙️ Google AI Studio Optimal Settings
- **Recommended Model** : Gemini 2.5 Flash
- **Temperature**        : 0.7 to 0.9 (perfect balance for street lyric flows and phonetic detail)
- **Max Output Tokens**  : 8192 (ensures complete generation of all 9 blueprint sections)
- **Top-P**              : 0.95
- **Top-K**              : 40

## 🚦 Integration Workflow in AI Studio:
1. Open Google AI Studio (ai.studio/build or prompt editor).
2. Grab the text from the **[1] SYSTEM PROMPT** tab and paste it into "System Instructions".
3. For each creative generation session, grab the compiled template from **[2] USER PROMPT** tab, paste it into the chat session, insert lyrics, and click Run.
4. Enjoy extremely raw, real, Moroccan Darija flows optimized directly for AI voice generation tools!`;
  }, []);

  const compiledPrompt = useMemo(() => {
    if (activeOutputTab === 'system') return systemPromptText;
    if (activeOutputTab === 'user') return userPromptText;
    if (activeOutputTab === 'settings') return settingsPromptText;

    return `╔══════════════════════════════════════════════════════════════════╗
║        AI MOROCCAN RAP PRODUCTION ENGINE — GEMINI 2.5 FLASH     ║
║              النسخة المحسّنة — Google AI Studio                  ║
╚══════════════════════════════════════════════════════════════════╝

# ==================================================================
# SECTION [1]: SYSTEM INSTRUCTIONS
# ==================================================================
${systemPromptText}

# ==================================================================
# SECTION [2]: USER INPUT PARAMETERS
# ==================================================================
${userPromptText}

# ==================================================================
# SECTION [3]: AI STUDIO PRESETS
# ==================================================================
- Recommended Model : Gemini 2.5 Flash
- Temp: 0.8 | Max Output Tokens: 8192`;
  }, [activeOutputTab, systemPromptText, userPromptText, settingsPromptText]);


  const handleCopyToClipboard = () => {
    try {
      navigator.clipboard.writeText(compiledPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy compiled rap prompt:', err);
    }
  };

  const handleSaveToHistory = () => {
    if (onLogPrompt) {
      onLogPrompt({
        originalText: lang === 'ar' ? `إنتاج راب مغربي: ${beatStyle} bpm:${bpm}` : `Moroccan Rap Production: ${beatStyle} bpm:${bpm}`,
        optimizedText: compiledPrompt,
        model: 'gemini',
        tone: 'technical',
        category: 'music',
        actionType: 'generate',
        isFallback: false
      });
      setIsSavedInHistory(true);
      setTimeout(() => setIsSavedInHistory(false), 3000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8" id="prompt-rap-panel">
      
      {/* Visual Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#c29b40]/10 text-[#9c7524] text-xs font-black rounded-full mb-3">
            <Music className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'نظام هندسة وإنتاج الراب المغربي' : 'Moroccan Rap Prod Engine'}</span>
          </span>
          <h2 className="text-3xl font-black text-stone-900 tracking-tight">
            {lang === 'ar' ? 'محرّك صياغة راب الدارجة والإنتاج' : 'Ultimate Moroccan Rap Prompt Architect'}
          </h2>
          <p className="text-stone-500 text-sm mt-1 max-w-2xl font-medium animate-fade-in">
            {lang === 'ar' 
              ? 'صمم وهندس أدق تفاصيل السيناريو والتوزيع الموسيقي لأغاني الراب بالدارجة المغربية وعواطفها واللفظ الصوتي للتصدير المباشر لـ Suno و Udio.'
              : 'Synthesize perfect Darija Moroccan phonetics, flows, adlips, and bpm cues for professional AI music engines.'}
          </p>
        </div>

        {/* Floating vinyl record animation */}
        <div className="flex items-center gap-3 bg-stone-100 p-2.5 rounded-xl border border-stone-200 self-start md:self-center">
          <Disc className="w-8 h-8 text-[#c29b40] animate-spin" style={{ animationDuration: '6s' }} />
          <div className="text-right">
            <span className="text-[10px] font-black text-stone-400 block tracking-widest">RECORDING LIVE</span>
            <span className="text-[11px] font-bold text-emerald-700">DARIJA PHONETICS ON</span>
          </div>
        </div>
      </div>

      {/* Preset Lyrics Showcase Buttons */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-black text-stone-700">
          <FileMusic className="w-4 h-4 text-[#c29b40]" />
          <span>{lang === 'ar' ? 'استخدم عينات شعرية جاهزة للمعاينة السريعة:' : 'Select Authentic Moroccan Rap Demo Presets:'}</span>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => handleApplyPreset('dark-street')}
            className="text-xs font-bold px-3.5 py-2.5 bg-stone-900 text-stone-100 hover:bg-stone-800 rounded-xl transition border border-stone-700 cursor-pointer shadow-sm flex items-center gap-1.5"
          >
            🎤 {lang === 'ar' ? 'مثال ١: راب شارع مظلم (Dark Street)' : 'Example 1: Dark Street Rap'}
          </button>
          <button
            onClick={() => handleApplyPreset('cinematic-emotional')}
            className="text-xs font-bold px-3.5 py-2.5 bg-rose-950 text-rose-100 hover:bg-rose-900 rounded-xl transition border border-rose-800 cursor-pointer shadow-sm flex items-center gap-1.5"
          >
            🎬 {lang === 'ar' ? 'مثال ٢: عاطفي سينمائي (Cinematic Emotional)' : 'Example 2: Cinematic Emotional'}
          </button>
          <button
            onClick={() => handleApplyPreset('live-stage')}
            className="text-xs font-bold px-3.5 py-2.5 bg-amber-950 text-amber-100 hover:bg-amber-900 rounded-xl transition border border-amber-800 cursor-pointer shadow-sm flex items-center gap-1.5"
          >
            🏟️ {lang === 'ar' ? 'مثال ٣: أداء مسرحي مباشر (Live Stage Performance)' : 'Example 3: Live Stage Fusion'}
          </button>
        </div>
      </div>

      {/* Primary Workspace: Left control panels, Right live prompt outputs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Control Desk (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">

          {/* Section 1: Lyrics & Style Input Box */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-sm font-black text-stone-900 flex items-center gap-1.5">
                <Mic className="w-4 h-4 text-[#c29b40]" />
                <span>{lang === 'ar' ? 'أولاً: الكلمات والأسلوب اللغوي المكتوب' : '1. Lyrics & Linguistic Setup'}</span>
              </h3>
              <span className="text-[10px] font-black text-stone-400">INPUT AREA</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-600 block">
                {lang === 'ar' ? 'مسودة الكلمات بالدارجة المغربية (أو فرانكو-أراب):' : 'Darija Moroccan Rap Lyrics (Franco or Arabic script):'}
              </label>
              <textarea
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                rows={5}
                className="w-full bg-stone-50 border border-stone-250 rounded-xl p-3 text-xs font-mono text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#c29b40] focus:bg-white-important leading-relaxed"
                placeholder={lang === 'ar' ? 'اكتب كلمات الراب هنا...' : 'Type or paste Moroccan Darija lyrics...'}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-600 block">{lang === 'ar' ? 'أسلوب ولغة النص:' : 'Linguistic Style Input:'}</label>
                <select
                  value={languageStyle}
                  onChange={(e) => setLanguageStyle(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-250 rounded-xl px-3 py-2 text-xs font-bold text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#c29b40]"
                >
                  <option value="franco-arabic">{lang === 'ar' ? 'فرانكو أراب (Franco-Arabic)' : 'Franco-Arabic (Arabi 7/3)'}</option>
                  <option value="pure-darija">{lang === 'ar' ? 'دارجة مغربية بحروف عربية' : 'Pure Darija (Arabic Script)'}</option>
                  <option value="hybrid-french">{lang === 'ar' ? 'خليط فرنسي دارجي (Hybrid Fr/Darija)' : 'Hybrid French/Darija'}</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-600 block">{lang === 'ar' ? 'المنصة الموسيقية المستهدفة:' : 'Target AI Platform:'}</label>
                <select
                  value={targetPlatform}
                  onChange={(e) => setTargetPlatform(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-250 rounded-xl px-3 py-2 text-xs font-bold text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#c29b40]"
                >
                  <option value="suno">{lang === 'ar' ? 'Suno AI (تاغات وسرعة عالية)' : 'Suno AI (Strict Tags)'}</option>
                  <option value="udio">{lang === 'ar' ? 'Udio AI (تفاصيل النبرات واللفظ الأنسب)' : 'Udio AI (Clarity)'}</option>
                  <option value="gemini">{lang === 'ar' ? 'Google Gemini (طلب هندسة متكامل)' : 'Google Gemini (Comprehensive)'}</option>
                  <option value="chatgpt">OpenAI ChatGPT</option>
                  <option value="claude">Anthropic Claude</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Music Design Panel (BPM, Style, Mood, Vocals) */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-sm font-black text-stone-900 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-[#c29b40]" />
                <span>{lang === 'ar' ? 'ثانياً: لوحة تصميم الهندسة والتركيب الموسيقي' : '2. Beats & Vocal Atmosphere Design'}</span>
              </h3>
              <span className="text-[10px] font-black text-stone-400">BEAT DESK</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-600 block">{lang === 'ar' ? 'أسلوب الإيقاع والبيت:' : 'Beat Style:'}</label>
                <select
                  value={beatStyle}
                  onChange={(e) => setBeatStyle(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-250 rounded-xl px-3 py-2 text-xs font-bold text-stone-800 focus:outline-none"
                >
                  <option value="moroccan-chaabi-drill">{lang === 'ar' ? 'دريل مغربي جرة شعبي' : 'Moroccan Chaabi Drill'}</option>
                  <option value="dark-trap">{lang === 'ar' ? 'تراب غامق سوداوي' : 'Dark Trap'}</option>
                  <option value="boom-bap">{lang === 'ar' ? 'بوم باب ريترو كلاسيك' : 'Retro Boom-Bap'}</option>
                  <option value="melodic-trap">Melodic Trap</option>
                  <option value="hybrid-chaabi-trap">Hybrid Chaabi-Trap Fusion</option>
                  <option value="afro-trap">Afro Trap</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-600 block">{lang === 'ar' ? 'سرعة الإيقاع (BPM):' : 'BPM Tempo:'}</label>
                <input
                  type="text"
                  value={bpm}
                  onChange={(e) => setBpm(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-250 rounded-xl px-3 py-2 text-xs font-mono text-stone-850 font-bold focus:outline-none focus:ring-1 focus:ring-[#c29b40]"
                  placeholder="e.g. 140"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-600 block">{lang === 'ar' ? 'الطابع والعواطف (Mood):' : 'Product mood:'}</label>
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-250 rounded-xl px-3 py-2 text-xs font-bold text-stone-800 focus:outline-none"
                >
                  <option value="dark-aggressive">{lang === 'ar' ? 'عدواني غامق ثقيل' : 'Dark Aggressive'}</option>
                  <option value="melancholic-emotional">{lang === 'ar' ? 'حزين عاطفي مؤثر' : 'Melancholic Emotional'}</option>
                  <option value="rebellious-street">{lang === 'ar' ? 'شارع متمرد ثوري' : 'Rebellious Street'}</option>
                  <option value="motivational-epic">{lang === 'ar' ? 'حماسي ملحمي' : 'Epic Motivational'}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-600 block">{lang === 'ar' ? 'النبرة والصوت المستهدف:' : 'Voice Style:'}</label>
                <select
                  value={voiceStyle}
                  onChange={(e) => setVoiceStyle(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-250 rounded-xl px-3 py-2 text-xs font-bold text-stone-800 focus:outline-none"
                >
                  <option value="raw-street-delivery">{lang === 'ar' ? 'صوت خشن بنبرة الشارع' : 'Raw Street Delivery'}</option>
                  <option value="deep-voice-echo">{lang === 'ar' ? 'صوت عميق ممتلئ الصدى' : 'Deep Echo Voice'}</option>
                  <option value="melodic-street">{lang === 'ar' ? 'غناء راب ميلوديك تفاعلي' : 'Melodic Street'}</option>
                  <option value="fast-double-time">{lang === 'ar' ? 'تدفق سريع متسارع (Fast)' : 'Fast Flow'}</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-600 block">{lang === 'ar' ? 'صعوبة وتكثيف الفلو:' : 'Flow Complexity:'}</label>
                <select
                  value={flowComplexity}
                  onChange={(e) => setFlowComplexity(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-250 rounded-xl px-3 py-2 text-xs font-bold text-stone-800 focus:outline-none"
                >
                  <option value="technical">{lang === 'ar' ? 'معقد جداً وتكنيكي' : 'Technical / Hard core'}</option>
                  <option value="advanced">{lang === 'ar' ? 'متقدم ومتنوع' : 'Advanced cadence'}</option>
                  <option value="medium">{lang === 'ar' ? 'متوسط ومقروء لمختلف الآلات' : 'Medium level'}</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-600 block">{lang === 'ar' ? 'نسبة الطاقة والضغط:' : 'Energy Level:'}</label>
                <select
                  value={energyLevel}
                  onChange={(e) => setEnergyLevel(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-250 rounded-xl px-3 py-2 text-xs font-bold text-stone-800 focus:outline-none"
                >
                  <option value="explosive">{lang === 'ar' ? 'متفجرة وصاخبة جداً' : 'Explosive'}</option>
                  <option value="high">{lang === 'ar' ? 'طاقة إنتاج عالية ومستقرة' : 'High Energy'}</option>
                  <option value="medium">{lang === 'ar' ? 'طاقة إلقاء متوسطة' : 'Balanced / Mid'}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Fine-Tuning Advanced Toggles (Switch desk grid) */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-sm font-black text-stone-900 flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-[#c29b40]" />
                <span>{lang === 'ar' ? 'ثالثاً: تفضيلات ومحددات لوحة الإنتاج الموسيقي' : '3. Advanced Engineering Preferences'}</span>
              </h3>
              <span className="text-[10px] font-black text-[#c29b40] bg-[#c29b40]/15 px-2 py-0.5 rounded-full">ACTIVE FILTERS</span>
            </div>

            {/* Sub-groups */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

              {/* Music & Beat Architecture Sub-group */}
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3">
                <span className="text-[11px] font-black text-[#9c7524] uppercase block tracking-wider">
                  🎹 {lang === 'ar' ? 'هندسة الموسيقى والآلات' : 'Beat & Mix Elements'}
                </span>
                <div className="space-y-2.5">
                  <label className="flex items-center gap-2.5 text-xs text-stone-700 font-bold cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={enableBeatArchitecture}
                      onChange={(e) => setEnableBeatArchitecture(e.target.checked)}
                      className="rounded border-stone-300 text-amber-600 focus:ring-[#c29b40]"
                    />
                    <span>{lang === 'ar' ? 'تمكين تصميم هندسة البيت بالكامل' : 'Enable Complete Beat blueprint'}</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-stone-700 font-bold cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={enableBass}
                      onChange={(e) => setEnableBass(e.target.checked)}
                      className="rounded border-stone-300 text-amber-600 focus:ring-[#c29b40]"
                    />
                    <span>{lang === 'ar' ? 'توفير وتحديد أسلوب البيس (808 Sub)' : 'Deep 808 Bass detailing'}</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-stone-700 font-bold cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={enableDrums}
                      onChange={(e) => setEnableDrums(e.target.checked)}
                      className="rounded border-stone-300 text-amber-600 focus:ring-[#c29b40]"
                    />
                    <span>{lang === 'ar' ? 'إخراج اتجاه ضربات السنير والدروز' : 'Drum hits (Snare/Kick) markers'}</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-stone-700 font-bold cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={enableMelody}
                      onChange={(e) => setEnableMelody(e.target.checked)}
                      className="rounded border-stone-300 text-amber-600 focus:ring-[#c29b40]"
                    />
                    <span>{lang === 'ar' ? 'اقتراح لحن شرقي ووتريات مغربية' : 'Instruments & Melody pairing'}</span>
                  </label>
                </div>
              </div>

              {/* Flow and Cadence block */}
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3">
                <span className="text-[11px] font-black text-[#9c7524] uppercase block tracking-wider">
                  🎤 {lang === 'ar' ? 'تدفق الفلو والصناعة الصوتية' : 'Flow & Verbal Engineering'}
                </span>
                <div className="space-y-2.5">
                  <label className="flex items-center gap-2.5 text-xs text-stone-700 font-bold cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={enableFlow}
                      onChange={(e) => setEnableFlow(e.target.checked)}
                      className="rounded border-stone-300 text-amber-600 focus:ring-[#c29b40]"
                    />
                    <span>{lang === 'ar' ? 'كشف وتحليل ثبات الفلو (Flow Analysis)' : 'Flow context analysis'}</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-stone-700 font-bold cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={enableBreaths}
                      onChange={(e) => setEnableBreaths(e.target.checked)}
                      className="rounded border-stone-300 text-amber-600 focus:ring-[#c29b40]"
                    />
                    <span>{lang === 'ar' ? 'تحديد مواضع التنفس والوقفات ( / )' : 'Mark breath pauses ( / )'}</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-stone-700 font-bold cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={enableRhymePockets}
                      onChange={(e) => setEnableRhymePockets(e.target.checked)}
                      className="rounded border-stone-300 text-amber-600 focus:ring-[#c29b40]"
                    />
                    <span>{lang === 'ar' ? 'رصد جيوب القافية وبنائها' : 'Rhyme pocket location marking'}</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-stone-700 font-bold cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={enablePhonetics}
                      onChange={(e) => setEnablePhonetics(e.target.checked)}
                      className="rounded border-stone-300 text-amber-600 focus:ring-[#c29b40]"
                    />
                    <span>{lang === 'ar' ? 'اللفظ المغطى واللغة الدارجة' : 'Detailed Darija phonetics'}</span>
                  </label>
                </div>
              </div>

              {/* FX & Cinematic Soundscapes block */}
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3">
                <span className="text-[11px] font-black text-[#9c7524] uppercase block tracking-wider">
                  🎬 {lang === 'ar' ? 'تأثيرات سنمائية وأصوات خلفية' : 'Cinematic FX & Ad-libs'}
                </span>
                <div className="space-y-2.5">
                  <label className="flex items-center gap-2.5 text-xs text-stone-700 font-bold cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={enableAdlibs}
                      onChange={(e) => setEnableAdlibs(e.target.checked)}
                      className="rounded border-stone-300 text-amber-600 focus:ring-[#c29b40]"
                    />
                    <span>{lang === 'ar' ? 'إدراج أدليبات وأصوات تفاعل زنقة' : 'Enable Ad-libs placement'}</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-stone-700 font-bold cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={enableBassDrops}
                      onChange={(e) => setEnableBassDrops(e.target.checked)}
                      className="rounded border-stone-300 text-amber-600 focus:ring-[#c29b40]"
                    />
                    <span>{lang === 'ar' ? 'تضمين هبوط الباس وتفكيك النبرة' : 'Sub Bass drops'}</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-stone-700 font-bold cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={enableAmbience}
                      onChange={(e) => setEnableAmbience(e.target.checked)}
                      className="rounded border-stone-300 text-amber-600 focus:ring-[#c29b40]"
                    />
                    <span>{lang === 'ar' ? 'أصوات الشارع والسيارات العشوائية' : 'Authentic street ambience background'}</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-stone-700 font-bold cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={enableVinyl}
                      onChange={(e) => setEnableVinyl(e.target.checked)}
                      className="rounded border-stone-300 text-amber-600 focus:ring-[#c29b40]"
                    />
                    <span>{lang === 'ar' ? 'صوت ضوضاء الفينيل الرجعي (Vinyl)' : 'Vinyl record dust sound'}</span>
                  </label>
                </div>
              </div>

              {/* Track Energy Style */}
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3">
                <span className="text-[11px] font-black text-[#9c7524] uppercase block tracking-wider">
                  ⚡ {lang === 'ar' ? 'التحكم والنمو العاطفي' : 'Dynamic Energy Style'}
                </span>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-stone-600">{lang === 'ar' ? 'أسلوب التصاعد الطاقي للمقطع:' : 'Aggregated Energy Cycle:'}</label>
                    <select
                      value={trackEnergyStyle}
                      onChange={(e) => setTrackEnergyStyle(e.target.value)}
                      className="w-full bg-white border border-stone-250 rounded-lg px-2.5 py-1.5 text-xs font-bold text-stone-800"
                    >
                      <option value="dark-build-up">{lang === 'ar' ? 'بناء متصاعد ظلامي' : 'Dark Build-Up'}</option>
                      <option value="explosive-constant">{lang === 'ar' ? 'انفجار وقوة ثابتة دقيقة' : 'Dynamic Explosive'}</option>
                      <option value="cinematic-rise">{lang === 'ar' ? 'ارتفاع سينمائي دراماتيكي' : 'Cinematic Rise'}</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2.5 text-xs text-stone-700 font-bold cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={enableEnergyMap}
                        onChange={(e) => setEnableEnergyMap(e.target.checked)}
                        className="rounded border-stone-300 text-amber-600"
                      />
                      <span>{lang === 'ar' ? 'توليد جدول زمني تدريجي للطاقة' : 'Build timeline energy curve'}</span>
                    </label>
                    <label className="flex items-center gap-2.5 text-xs text-stone-700 font-bold cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={enableEmotionCurve}
                        onChange={(e) => setEnableEmotionCurve(e.target.checked)}
                        className="rounded border-stone-300 text-amber-600"
                      />
                      <span>{lang === 'ar' ? 'تضمين منحنيات عواطف الشارع' : 'Street emotions pathing'}</span>
                    </label>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Section 4: Engine Weights and Export Modes */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-sm font-black text-stone-900 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-[#c29b40]" />
                <span>{lang === 'ar' ? 'رابعاً: موازنة وزن وقوة محددات الأوامر' : '4. Engineering Weights & Outputs'}</span>
              </h3>
              <span className="text-[10px] font-black text-stone-400">SLIDERS DESK</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Slider 1: Flow weight */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-stone-600">
                  <span>{lang === 'ar' ? 'تركيز وقوة هندسة الفلو:' : 'Flow Engineering weight:'}</span>
                  <span className="font-mono text-[#9c7524]">{flowWeight}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={flowWeight}
                  onChange={(e) => setFlowWeight(Number(e.target.value))}
                  className="w-full accent-[#c29b40]"
                />
              </div>

              {/* Slider 2: Phonetics weight */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-stone-600">
                  <span>{lang === 'ar' ? 'تركيز وتوجيه اللفظ السليم:' : 'Phonetics clarity weight:'}</span>
                  <span className="font-mono text-[#9c7524]">{phoneticsWeight}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={phoneticsWeight}
                  onChange={(e) => setPhoneticsWeight(Number(e.target.value))}
                  className="w-full accent-[#c29b40]"
                />
              </div>

              {/* Slider 3: Cinematic sound design weight */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-stone-600">
                  <span>{lang === 'ar' ? 'قوة المؤثرات السينمائية المضافة:' : 'Cinematic FX weight:'}</span>
                  <span className="font-mono text-[#9c7524]">{cinematicWeight}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={cinematicWeight}
                  onChange={(e) => setCinematicWeight(Number(e.target.value))}
                  className="w-full accent-[#c29b40]"
                />
              </div>

              {/* Slider 4: Vocal Synthesis weight */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-stone-600">
                  <span>{lang === 'ar' ? 'دقة موازنة الصوت الذكي (AI Voice):' : 'AI Voice Optimization:'}</span>
                  <span className="font-mono text-[#9c7524]">{aiVoiceWeight}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={aiVoiceWeight}
                  onChange={(e) => setAiVoiceWeight(Number(e.target.value))}
                  className="w-full accent-[#c29b40]"
                />
              </div>

            </div>

            <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-600">{lang === 'ar' ? 'تنسيق وصيغة المخرجات (Export Mode):' : 'Desired Blueprint Format:'}</label>
                <select
                  value={exportMode}
                  onChange={(e) => setExportMode(e.target.value)}
                  className="bg-stone-50 border border-stone-250 rounded-xl px-2.5 py-1.5 text-xs font-bold text-stone-800"
                >
                  <option value="Full Prompt">{lang === 'ar' ? 'صيغة نصية كاملة (Full Architecture)' : 'Full Comprehensive Prompt'}</option>
                  <option value="Suno Optimized">{lang === 'ar' ? 'محسن لأوامر Suno (Style-tag focus)' : 'Suno Tag-Style focus'}</option>
                  <option value="Udio Optimized">{lang === 'ar' ? 'محسن لمنصة Udio (Cadence instructions)' : 'Udio Prompt style'}</option>
                </select>
              </div>

              <div className="text-xs text-stone-400 italic max-w-sm font-semibold">
                {lang === 'ar' 
                  ? '💡 الموازنة الرقمية تساعد في إلقاء ثقل أكبر على تفاصيل التجويد واللحن لضمان نتائج متميزة أول مرة.' 
                  : '💡 Altering parameter weight balances prompt focus directly inside the system matrix output.'}
              </div>
            </div>
          </div>

        </div>

        {/* Live Prompt Output Sheet (Col span 5) */}
        <div className="lg:col-span-5 flex flex-col justify-between min-h-[500px]">
          
          <div className="bg-stone-900 border border-stone-850 rounded-2xl p-6 sm:p-8 flex-1 flex flex-col justify-between relative overflow-hidden">
            
            {/* Ambient gold blur */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#c29b40]/5 rounded-full filter blur-2xl pointer-events-none" />

            <div className="space-y-4">
              <div className="flex flex-col gap-3 border-b border-stone-800 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-[#c29b40]" />
                    <span className="text-xs font-black text-white">
                      {lang === 'ar' ? 'مخرجات هندسة راب الدارجة' : 'Moroccan Rap Prod Output'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Copy Button */}
                    <button
                      onClick={handleCopyToClipboard}
                      className="p-1.5 bg-stone-850 hover:bg-stone-800 rounded-lg text-stone-400 hover:text-white transition cursor-pointer"
                      title="Copy active prompt text"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Clipboard className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Interactive Tabs list */}
                <div className="flex flex-wrap gap-1 bg-stone-950 p-1 rounded-xl border border-stone-850">
                  <button
                    onClick={() => setActiveOutputTab('combined')}
                    className={`flex-1 min-w-[70px] text-[10px] font-black py-1.5 rounded-lg transition text-center cursor-pointer ${
                      activeOutputTab === 'combined'
                        ? 'bg-amber-600 text-stone-950 shadow'
                        : 'text-stone-400 hover:text-stone-250'
                    }`}
                  >
                    {lang === 'ar' ? 'الكل بضغطة واحدة' : 'Combined'}
                  </button>
                  <button
                    onClick={() => setActiveOutputTab('system')}
                    className={`flex-1 min-w-[70px] text-[10px] font-black py-1.5 rounded-lg transition text-center cursor-pointer ${
                      activeOutputTab === 'system'
                        ? 'bg-amber-600 text-stone-950 shadow'
                        : 'text-stone-400 hover:text-stone-250'
                    }`}
                  >
                    [1] System
                  </button>
                  <button
                    onClick={() => setActiveOutputTab('user')}
                    className={`flex-1 min-w-[70px] text-[10px] font-black py-1.5 rounded-lg transition text-center cursor-pointer ${
                      activeOutputTab === 'user'
                        ? 'bg-amber-600 text-stone-950 shadow'
                        : 'text-stone-400 hover:text-stone-250'
                    }`}
                  >
                    [2] User
                  </button>
                  <button
                    onClick={() => setActiveOutputTab('settings')}
                    className={`flex-1 min-w-[70px] text-[10px] font-black py-1.5 rounded-lg transition text-center cursor-pointer ${
                      activeOutputTab === 'settings'
                        ? 'bg-amber-600 text-stone-950 shadow'
                        : 'text-stone-400 hover:text-stone-250'
                    }`}
                  >
                    {lang === 'ar' ? '[3] الإعدادات' : '[3] Settings'}
                  </button>
                </div>
              </div>

              {/* Real time output textbox */}
              <div className="bg-stone-950 border border-stone-850 rounded-xl p-4 h-[420px] overflow-y-auto overflow-x-hidden font-mono text-[11px] text-stone-300 leading-relaxed antialiased">
                <pre className="whitespace-pre-wrap">{compiledPrompt}</pre>
              </div>
            </div>

            {/* Bottom action bar inside panel */}
            <div className="pt-4 border-t border-stone-800 mt-4 flex flex-col sm:flex-row gap-2">
              
              {/* Copy action */}
              <button
                onClick={handleCopyToClipboard}
                className="flex-1 py-2.5 bg-stone-800 hover:bg-stone-750 border border-stone-700 font-bold text-xs text-stone-200 hover:text-white rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{lang === 'ar' ? 'تم نسخ التراكب!' : 'Copied setup successfully!'}</span>
                  </>
                ) : (
                  <>
                    <Clipboard className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'نسخ الإعداد الكامل' : 'Copy Compiled Setup'}</span>
                  </>
                )}
              </button>

              {/* Run Test Playground */}
              <button
                onClick={() => onSendToTester(compiledPrompt)}
                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 font-black text-xs text-stone-950 rounded-xl hover:scale-[1.01] active:scale-[0.99] transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'جرب في المختبر الفوري' : 'Test in Playground'}</span>
              </button>

            </div>

            {/* Check success feedback if we manual saved */}
            {isSavedInHistory && (
              <span className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-emerald-700 text-white text-[10px] uppercase font-black px-3 py-1 rounded-full shadow border border-emerald-500 animate-pulse">
                ✓ Saved to history
              </span>
            )}
            
            {/* Log locally trigger button */}
            {onLogPrompt && (
              <button
                onClick={handleSaveToHistory}
                className="text-stone-400 hover:text-stone-300 text-[10px] font-bold mt-2 hover:underline text-center cursor-pointer block"
              >
                {lang === 'ar' ? 'حفظ الأغنية والإعداد في السجل التاريخي' : '✓ Save Moroccan Rap Setup to ArabPrompt History'}
              </button>
            )}

          </div>

        </div>

      </div>

      {/* Advisory section inside */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row gap-4 items-start text-sm text-stone-800">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
          <Info className="w-5 h-5 animate-pulse" />
        </div>
        <div className="space-y-1.5">
          <p className="font-black text-amber-900">
            {lang === 'ar' ? '💡 توجيهات أداء نماذج الموسيقى بالدارجة المغربية:' : '💡 Professional Darija Moroccan Rap AI Guidelines:'}
          </p>
          <ul className="list-disc leading-relaxed pl-5 pr-1 text-xs text-stone-600 space-y-1 font-bold">
            <li>
              {lang === 'ar' 
                ? 'يفضل كتابة التشكيل الدقيق للكلمات الصعبة أو كتابتها بطريقة الفرانكو المشهورة (مثلاً: lwalida وليس l-oualida) ليفهمها نموذج Udio و Suno بالتدفق السليم للآوتوت.' 
                : 'Udio and Suno read Franco-Arabic phonetic stress points extremely well. Writing l-Kbed (with a capital K) specifies natural accent locations.'}
            </li>
            <li>
              {lang === 'ar' 
                ? 'موضع علامة ( / ) ترشد نموذج التوليد لتقديم فرامل صوتية ووقفة سريعة لتوقيت التنفس الحقيقي للراب، بينما مواضع ( // ) توقظ النماذج للتوقف لبيت ثانية كاملة.' 
                : 'The ( / ) symbol creates brief voice pauses for breath timing, while ( // ) instructs the beat generator to allow instrumental spacing.'}
            </li>
          </ul>
        </div>
      </div>

    </div>
  );
}
