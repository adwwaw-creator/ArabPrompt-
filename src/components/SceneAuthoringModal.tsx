/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Sliders, 
  Play, 
  Check, 
  Clapperboard, 
  Film, 
  UserCheck, 
  Layers, 
  Camera, 
  Volume2, 
  Compass, 
  RotateCcw,
  Wand2,
  Mic,
  FileText,
  AlertCircle,
  Lightbulb,
  CheckCircle2,
  HelpCircle,
  MessageSquare,
  Copy,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLanguage, MovieProject, CinemaScene } from '../types';
import { showToast } from './ToastNotification';
import { appendSiteUrlToPrompt } from '../utils/brandWatermark';
import { 
  generateLocalDialogueSuggestions, 
  refineSceneWithLocalAi, 
  DialogueContextSuggestion 
} from '../utils/localSceneDesigner';

interface SceneAuthoringModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: AppLanguage;
  activeProject: MovieProject;
  onAddScene: (newScene: CinemaScene) => void;
}

const QUICK_IDEA_CHIPS = [
  { ar: '⚔️ مواجهة واشتباك حاسم بالسيوف', en: 'Heroic sword duel showdown', tone: 'حماسي وملحمي', shot: 'Low Angle Heroic' },
  { ar: '🗝️ اكتشاف سر قديم أو وثيقة غامضة', en: 'Uncovering ancient secret or parchment', tone: 'غموض وتوتر', shot: 'Extreme Close-Up' },
  { ar: '🗣️ حوار مشحون واعتراف مصيري', en: 'Intense dialogue & fateful confession', tone: 'تأثر عاطفي', shot: 'Medium Cinematic Shot' },
  { ar: '🏃 مطاردة وهروب يحبس الأنفاس', en: 'Breathless escape & chase', tone: 'حركة سريعة وتوتر', shot: 'Dynamic Tracking Shot' },
  { ar: '🌅 لحظة نصر وتأمل مع شروق الشمس', en: 'Triumphant dawn reflection', tone: 'فخر وهدوء مهيب', shot: 'High Angle Drone Sweep' },
  { ar: '🚨 اكتشاف خيانة أو كمين مفاجئ', en: 'Ambush trap discovery', tone: 'صدمة وذهول', shot: 'Dutch Angle Dramatic' }
];

const SHOT_TYPES = [
  'Medium Cinematic Shot',
  'Extreme Close-Up (Eyes & Lips)',
  'Low Angle Heroic',
  'High Angle Drone Sweep',
  'Over-the-Shoulder Dialogue Shot',
  'Dutch Angle Dramatic',
  '360 Orbit Cinematic',
  'Wide Establishing Shot'
];

const CAMERA_MOTIONS = [
  'Slow Dolly In (10s)',
  'Smooth Push-In on Subject',
  'Dynamic Tracking Following Action',
  'Handheld Cinematic Shake (Action Beat)',
  'Subtle 360 Orbit Sweep',
  'Slow Crane Down (10s)',
  'Steady Static Frame with Dynamic Character Motion'
];

const DIALOGUE_EMOTIONS = [
  'نبرة حازمة وحاسمة',
  'همس متوتر يحمل تحذيراً دفيناً',
  'تأثر عاطفي وصدق عميق',
  'صدمة وذهول غير متوقع',
  'نبرة فروسية وكبرياء محارب',
  'هدوء حكيم ووقار مهيب',
  'غضب متصاعد وثقة مطلقة'
];

export default function SceneAuthoringModal({
  isOpen,
  onClose,
  lang,
  activeProject,
  onAddScene
}: SceneAuthoringModalProps) {
  const nextSceneNumber = (activeProject?.scenes?.length || 0) + 1;
  const startSec = (nextSceneNumber - 1) * 10;
  const endSec = nextSceneNumber * 10;
  const startMinStr = String(Math.floor(startSec / 60)).padStart(2, '0');
  const startSecStr = String(startSec % 60).padStart(2, '0');
  const endMinStr = String(Math.floor(endSec / 60)).padStart(2, '0');
  const endSecStr = String(endSec % 60).padStart(2, '0');
  const timeRange = `${startMinStr}:${startSecStr} - ${endMinStr}:${endSecStr}`;

  // Tab mode
  const [creationTab, setCreationTab] = useState<'ai' | 'manual'>('ai');

  // AI Prompt Co-Director State
  const [aiIdea, setAiIdea] = useState('');
  const [aiTone, setAiTone] = useState('نبرة حازمة ومؤثرة');
  const [aiShot, setAiShot] = useState('Medium Cinematic Shot');
  const [aiMotion, setAiMotion] = useState('Slow Dolly In (10s)');
  const [aiAct, setAiAct] = useState<'act1' | 'act2' | 'act3'>(
    nextSceneNumber <= 2 ? 'act1' : (nextSceneNumber <= 4 ? 'act2' : 'act3')
  );
  const [isGenerating, setIsGenerating] = useState(false);

  // Draft Scene State (can be edited manually or populated by AI)
  const heroName = activeProject?.characterAnchor?.name || 'البطل';
  const [draftTitleAr, setDraftTitleAr] = useState(`مشهد ${nextSceneNumber}: `);
  const [draftTitleEn, setDraftTitleEn] = useState(`Scene ${nextSceneNumber}: `);
  const [draftScreenplayBeatAr, setDraftScreenplayBeatAr] = useState('');
  const [draftScreenplayBeatEn, setDraftScreenplayBeatEn] = useState('');
  const [draftDialogueSpeaker, setDraftDialogueSpeaker] = useState(heroName);
  const [draftDialogueAr, setDraftDialogueAr] = useState('');
  const [draftDialogueEn, setDraftDialogueEn] = useState('');
  const [draftDialogueEmotion, setDraftDialogueEmotion] = useState('نبرة حازمة وحاسمة');
  const [draftDialogueTiming, setDraftDialogueTiming] = useState(`${startMinStr}:${String(startSec + 3).padStart(2, '0')} - ${endMinStr}:${String(endSec - 2).padStart(2, '0')}`);
  const [draftShotType, setDraftShotType] = useState('Medium Cinematic Shot');
  const [draftCameraMotion, setDraftCameraMotion] = useState('Slow Dolly In (10s)');
  const [draftSoundDesign, setDraftSoundDesign] = useState('Atmospheric cinematic ambiance, crisp vocal resonance');
  const [draftVideoPromptEn, setDraftVideoPromptEn] = useState('');
  const [draftActPhase, setDraftActPhase] = useState<'act1' | 'act2' | 'act3'>(
    nextSceneNumber <= 2 ? 'act1' : (nextSceneNumber <= 4 ? 'act2' : 'act3')
  );
  const [hasGeneratedResult, setHasGeneratedResult] = useState(false);

  // Smart Contextual Style Suggestions State & Local AI Designer
  const [modalSuggestions, setModalSuggestions] = useState<DialogueContextSuggestion[] | null>(null);
  const [activeSuggestionTarget, setActiveSuggestionTarget] = useState<'ai_preview' | 'manual' | null>(null);

  // Smart Contextual Style Suggestions Trigger (Local AI)
  const handleOpenSmartDialogueSuggestions = (target: 'ai_preview' | 'manual') => {
    if (activeSuggestionTarget === target && modalSuggestions) {
      setModalSuggestions(null);
      setActiveSuggestionTarget(null);
      return;
    }

    const suggestions = generateLocalDialogueSuggestions(draftDialogueAr, {
      sceneBeat: draftScreenplayBeatAr,
      sceneTitle: draftTitleAr,
      speakerName: draftDialogueSpeaker || heroName,
      genre: activeProject?.genre,
      actPhase: draftActPhase,
      concept: activeProject?.concept
    });

    setModalSuggestions(suggestions);
    setActiveSuggestionTarget(target);
    showToast(
      lang === 'ar'
        ? '💡 تم توليد 4 صيغ أسلوبية ذكية بالذكاء الاصطناعي المحلي!'
        : '💡 4 contextual style variations generated!'
    );
  };

  // Apply selected suggestion with Local AI Scene Refiner
  const handleApplyModalSuggestion = (sug: DialogueContextSuggestion) => {
    setDraftDialogueAr(sug.dialogueAr);
    if (sug.dialogueEn) setDraftDialogueEn(sug.dialogueEn);
    if (sug.emotionAr) setDraftDialogueEmotion(sug.emotionAr);

    // Build temporary scene model for local AI refiner
    const tempScene: CinemaScene = {
      sceneNumber: nextSceneNumber,
      timeRange,
      durationSeconds: 10,
      titleAr: draftTitleAr,
      titleEn: draftTitleEn,
      screenplaySlug: `المشهد ${nextSceneNumber}: [${timeRange}]`,
      screenplayBeatAr: draftScreenplayBeatAr,
      screenplayBeatEn: draftScreenplayBeatEn || draftScreenplayBeatAr,
      dramaticActionAr: draftScreenplayBeatAr,
      dialogueSpeaker: draftDialogueSpeaker || heroName,
      dialogueEmotion: sug.emotionAr,
      dialogueTiming: draftDialogueTiming,
      dialogueAr: sug.dialogueAr,
      dialogueEn: sug.dialogueEn,
      shotType: draftShotType,
      cameraMotion: draftCameraMotion,
      soundDesign: draftSoundDesign,
      motionIntensity: 6,
      videoPromptEn: draftVideoPromptEn,
      actPhase: draftActPhase
    };

    const refined = refineSceneWithLocalAi(tempScene, sug.dialogueAr, {
      newDialogueEn: sug.dialogueEn,
      newEmotion: sug.emotionAr,
      newSpeaker: draftDialogueSpeaker || heroName,
      characterAnchor: activeProject?.characterAnchor,
      visualStyle: activeProject?.visualStyle,
      targetAiModel: activeProject?.targetAiModel
    });

    setDraftDialogueTiming(refined.dialogueTiming || draftDialogueTiming);
    setDraftVideoPromptEn(refined.videoPromptEn);
    setModalSuggestions(null);
    setActiveSuggestionTarget(null);

    showToast(
      lang === 'ar'
        ? '✓ تم تطبيق الاقتراح وإعادة ضبط توقيت حركة الشفاه والبرومبت محلياً!'
        : '✓ Style suggestion applied and scene refined with local AI!'
    );
  };

  // Handle direct manual dialogue typing with automatic local AI timing calculation
  const handleDraftDialogueChange = (newVal: string) => {
    setDraftDialogueAr(newVal);

    // Quick recalculation of lip-sync timing based on word count
    const words = newVal.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    let lipSyncStart = startSec + 2;
    let lipSyncDuration = Math.min(6, Math.max(2, Math.round(wordCount * 0.55)));
    let lipSyncEnd = Math.min(startSec + 9, lipSyncStart + lipSyncDuration);
    const pad = (n: number) => n < 10 ? `0${n}` : `${n}`;
    const newTiming = `${pad(Math.floor(lipSyncStart / 60))}:${pad(lipSyncStart % 60)} - ${pad(Math.floor(lipSyncEnd / 60))}:${pad(lipSyncEnd % 60)}`;
    setDraftDialogueTiming(newTiming);
  };

  // Render contextual suggestions panel in modal
  const renderModalSuggestionsPanel = (target: 'ai_preview' | 'manual') => {
    if (activeSuggestionTarget !== target || !modalSuggestions) return null;

    return (
      <div className="mt-3 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-b from-amber-500/10 via-stone-900 to-stone-950 border border-amber-400/50 space-y-3 shadow-lg animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-stone-800 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#c29b40] text-stone-950 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xs font-black text-amber-200 block">
                {lang === 'ar' ? 'اقتراحات الأسلوب الذكية (Local AI Stylist)' : 'Smart Contextual Style Suggestions'}
              </span>
              <span className="text-[10px] text-stone-400 font-medium">
                {lang === 'ar' ? 'صيغ بديلة مصممة بالذكاء الاصطناعي المحلي لتناسب سياق المشهد' : 'Alternative phrasing tailored to scene context'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setModalSuggestions(null);
              setActiveSuggestionTarget(null);
            }}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-all cursor-pointer"
            title={lang === 'ar' ? 'إغلاق الاقتراحات' : 'Close'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {modalSuggestions.map((sug, sIdx) => {
            let badgeStyle = 'bg-rose-950/80 text-rose-300 border-rose-800';
            let badgeIcon = '⚔️';
            if (sug.type === 'subtext') {
              badgeStyle = 'bg-sky-950/80 text-sky-300 border-sky-800';
              badgeIcon = '🎭';
            } else if (sug.type === 'punchy') {
              badgeStyle = 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
              badgeIcon = '⏱️';
            } else if (sug.type === 'emotional') {
              badgeStyle = 'bg-purple-950/80 text-purple-300 border-purple-800';
              badgeIcon = '🌊';
            }

            return (
              <div
                key={sIdx}
                className="p-3 rounded-xl bg-stone-900/90 border border-stone-800 hover:border-[#c29b40] transition-all space-y-2 shadow-sm flex flex-col justify-between group"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${badgeStyle}`}>
                      <span>{badgeIcon}</span>
                      <span>{lang === 'ar' ? sug.styleLabelAr : sug.styleLabelEn}</span>
                    </span>
                    <span className="text-[10px] text-amber-300/80 font-mono italic truncate max-w-[120px]">
                      {sug.emotionAr}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-white leading-relaxed font-serif bg-black/40 p-2.5 rounded-lg border border-stone-800">
                    "{sug.dialogueAr}"
                  </div>

                  {sug.dialogueEn && (
                    <div className="text-[10px] text-stone-400 italic px-1 font-mono">
                      "{sug.dialogueEn}"
                    </div>
                  )}

                  {sug.subtextReasonAr && (
                    <p className="text-[10px] text-stone-400 leading-relaxed pt-1 border-t border-stone-800/80">
                      <span className="font-bold text-stone-300">{lang === 'ar' ? 'الهدف الدرامي: ' : 'Rationale: '}</span>
                      {sug.subtextReasonAr}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-stone-800 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(sug.dialogueAr);
                      showToast(lang === 'ar' ? 'تم نسخ الجملة.' : 'Copied.');
                    }}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-all cursor-pointer"
                    title={lang === 'ar' ? 'نسخ الجملة' : 'Copy'}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyModalSuggestion(sug)}
                    className="px-3 py-1.5 rounded-lg bg-[#c29b40] hover:bg-[#a6802f] text-stone-950 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 hover:scale-[1.02]"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>{lang === 'ar' ? 'تطبيق الصيغة' : 'Apply'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Sync default speaker if project hero changes
  useEffect(() => {
    if (activeProject?.characterAnchor?.name) {
      setDraftDialogueSpeaker(activeProject.characterAnchor.name);
    }
  }, [activeProject]);

  if (!isOpen) return null;

  // Auto compile master prompt for manual entries
  const handleCompilePromptFromFields = () => {
    const anchor = activeProject?.characterAnchor?.consistencyPromptToken || '';
    const style = activeProject?.visualStyle || 'Cinematic 35mm Film';
    const model = activeProject?.targetAiModel || 'Runway Gen-3 Alpha';
    const action = draftScreenplayBeatEn || draftScreenplayBeatAr || 'Dramatic narrative action beat';
    const speaker = draftDialogueSpeaker || heroName;
    const dialAr = draftDialogueAr || '';
    const dialEn = draftDialogueEn || dialAr;
    const emotion = draftDialogueEmotion || 'intense';
    const timing = draftDialogueTiming || '00:03 - 00:08';
    const sound = draftSoundDesign || 'Cinematic soundscape';

    const compiled = `${anchor} Scene ${nextSceneNumber} (${timeRange}, 10s duration). ${draftShotType}, ${draftCameraMotion}. [SCREENPLAY ACTION]: ${action}. [CHARACTER SPOKEN DIALOGUE & LIP-SYNC]: ${speaker} speaks (${emotion}) at ${timing}: "${dialAr}" ("${dialEn}"), natural synchronized mouth and lip movements. [CINEMATOGRAPHY]: ${style}, 8k photorealistic, volumetric atmosphere, optimized for ${model}. [SOUND DESIGN]: ${sound}.`;

    const finalWithBrand = appendSiteUrlToPrompt(compiled);
    setDraftVideoPromptEn(finalWithBrand);
    showToast(lang === 'ar' ? '✓ تم تجميع وتوليد برومبت الفيديو بنجاح!' : '✓ Video prompt compiled!');
  };

  // AI Co-Director: Generate full 10-second scene from idea
  const handleDesignSceneWithAI = async () => {
    if (!aiIdea.trim()) {
      showToast(lang === 'ar' ? 'يرجى كتابة أو وصف فكرة المشهد أولاً.' : 'Please enter scene concept or idea first.', true);
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/cinema-design-single-scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userIdea: aiIdea.trim(),
          sceneNumber: nextSceneNumber,
          timeRange,
          movieConcept: activeProject.concept,
          movieTitle: activeProject.titleAr,
          genre: activeProject.genre,
          visualStyle: activeProject.visualStyle,
          targetAiModel: activeProject.targetAiModel,
          characterAnchor: activeProject.characterAnchor,
          desiredShotType: aiShot,
          desiredCameraMotion: aiMotion,
          desiredTone: aiTone,
          actPhase: aiAct
        })
      });

      if (!response.ok) throw new Error('Failed to design scene');
      const data = await response.json();
      const sc = data.scene;

      if (sc) {
        setDraftTitleAr(sc.titleAr || `المشهد ${nextSceneNumber}: تصاعد الحدث`);
        setDraftTitleEn(sc.titleEn || `Scene ${nextSceneNumber}: Dramatic Turn`);
        setDraftScreenplayBeatAr(sc.screenplayBeatAr || sc.dramaticActionAr || '');
        setDraftScreenplayBeatEn(sc.screenplayBeatEn || '');
        setDraftDialogueSpeaker(sc.dialogueSpeaker || heroName);
        setDraftDialogueAr(sc.dialogueAr || '');
        setDraftDialogueEn(sc.dialogueEn || '');
        setDraftDialogueEmotion(sc.dialogueEmotion || aiTone);
        setDraftDialogueTiming(sc.dialogueTiming || draftDialogueTiming);
        setDraftShotType(sc.shotType || aiShot);
        setDraftCameraMotion(sc.cameraMotion || aiMotion);
        setDraftSoundDesign(sc.soundDesign || draftSoundDesign);
        setDraftVideoPromptEn(sc.videoPromptEn || '');
        setDraftActPhase(sc.actPhase || aiAct);
        setHasGeneratedResult(true);

        showToast(
          lang === 'ar'
            ? '✨ تم فهم الفكرة وتصميم المشهد بالسيناريو والحوار وبرومبت الفيديو بنجاح!'
            : '✨ Scene authored and designed with AI successfully!'
        );
      }
    } catch (err: any) {
      console.error('Error designing scene:', err);
      showToast(lang === 'ar' ? 'حدث خطأ أثناء الاتصال بالخادم، تم استخدام المعالج البديل.' : 'Fallback applied.', true);
    } finally {
      setIsGenerating(false);
    }
  };

  // Final Action: Insert into active project timeline
  const handleConfirmInsertScene = () => {
    const finalTitleAr = draftTitleAr.trim() || `المشهد ${nextSceneNumber}: مشهد جديد`;
    const finalBeatAr = draftScreenplayBeatAr.trim() || `يتحرك ${heroName} بتركيز شديد في بيئة المشهد متفاعلاً مع تسلسل الأحداث.`;
    
    // Auto compile prompt if empty
    let finalPrompt = draftVideoPromptEn.trim();
    if (!finalPrompt) {
      const anchor = activeProject?.characterAnchor?.consistencyPromptToken || '';
      finalPrompt = appendSiteUrlToPrompt(
        `${anchor} Scene ${nextSceneNumber} (${timeRange}, 10s duration). ${draftShotType}, ${draftCameraMotion}. [SCREENPLAY ACTION]: ${draftScreenplayBeatEn || finalBeatAr}. [CHARACTER SPOKEN DIALOGUE & LIP-SYNC]: ${draftDialogueSpeaker} speaks (${draftDialogueEmotion}) at ${draftDialogueTiming}: "${draftDialogueAr}" ("${draftDialogueEn || draftDialogueAr}"), natural mouth sync. [CINEMATOGRAPHY]: ${activeProject.visualStyle}, 8k photorealistic. [SOUND DESIGN]: ${draftSoundDesign}.`
      );
    }

    const newScene: CinemaScene = {
      sceneNumber: nextSceneNumber,
      timeRange,
      durationSeconds: 10,
      titleAr: finalTitleAr,
      titleEn: draftTitleEn.trim() || `Scene ${nextSceneNumber}`,
      screenplaySlug: `المشهد ${nextSceneNumber}: داخلي/خارجي - لقطة سينمائية [${timeRange}]`,
      screenplayBeatAr: finalBeatAr,
      screenplayBeatEn: draftScreenplayBeatEn.trim() || finalBeatAr,
      dramaticActionAr: finalBeatAr,
      dialogueSpeaker: draftDialogueSpeaker.trim() || heroName,
      dialogueEmotion: draftDialogueEmotion.trim() || 'نبرة حازمة ومؤثرة',
      dialogueTiming: draftDialogueTiming.trim() || `${startMinStr}:${String(startSec + 3).padStart(2, '0')} - ${endMinStr}:${String(endSec - 2).padStart(2, '0')}`,
      dialogueAr: draftDialogueAr.trim(),
      dialogueEn: draftDialogueEn.trim(),
      shotType: draftShotType,
      cameraMotion: draftCameraMotion,
      soundDesign: draftSoundDesign,
      motionIntensity: 6,
      videoPromptEn: finalPrompt,
      actPhase: draftActPhase,
      actLabelAr: draftActPhase === 'act1' ? 'الفصل الأول: البداية' : (draftActPhase === 'act3' ? 'الفصل الثالث: الذروة' : 'الفصل الثاني: الصراع'),
      actLabelEn: draftActPhase === 'act1' ? 'Act I: Setup' : (draftActPhase === 'act3' ? 'Act III: Climax' : 'Act II: Conflict')
    };

    onAddScene(newScene);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-5xl max-h-[92vh] bg-stone-900 border border-[#c29b40]/60 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-stone-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-stone-950 via-stone-900 to-amber-950/40 border-b border-[#c29b40]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#c29b40] to-amber-700 flex items-center justify-center text-stone-950 shadow-md shrink-0">
              <Clapperboard className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <span>{lang === 'ar' ? 'إعداد وتصميم مشهد سينمائي جديد (10s Scene Studio)' : 'Author New 10-Second Scene'}</span>
                </h3>
                <span className="bg-[#c29b40] text-stone-950 text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full">
                  #{nextSceneNumber} • {timeRange}
                </span>
              </div>
              <p className="text-xs text-amber-200/80 mt-0.5">
                {lang === 'ar' 
                  ? 'أدخل السيناريو والحوار يدوياً أو صف فكرتك للمساعد الذكي ليفهمها ويصمم مشهداً سينمائياً مذهلاً بدقة 100%' 
                  : 'Enter screenplay & dialogue manually or describe your idea to AI Co-Director to author an astonishing 10s scene.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {activeProject?.characterAnchor?.name && (
              <span className="text-[10px] font-mono font-bold text-stone-300 bg-stone-800/80 px-2.5 py-1 rounded-xl border border-stone-700 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-[#c29b40]" />
                <span className="text-[#f5d996]">{activeProject.characterAnchor.name}</span>
              </span>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer border border-stone-700"
              title={lang === 'ar' ? 'إغلاق' : 'Close'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selection Bar */}
        <div className="p-3 sm:px-6 bg-stone-950/80 border-b border-stone-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCreationTab('ai')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                creationTab === 'ai'
                  ? 'bg-gradient-to-r from-[#c29b40] to-amber-600 text-stone-950 shadow-md shadow-[#c29b40]/20'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{lang === 'ar' ? 'التصميم الذكي التفاعلي (AI Co-Director)' : 'Interactive AI Co-Director'}</span>
            </button>

            <button
              type="button"
              onClick={() => setCreationTab('manual')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                creationTab === 'manual'
                  ? 'bg-gradient-to-r from-[#c29b40] to-amber-600 text-stone-950 shadow-md shadow-[#c29b40]/20'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>{lang === 'ar' ? 'الإدخال اليدوي المباشر (Manual Screenplay)' : 'Manual Entry'}</span>
            </button>
          </div>

          <span className="text-[11px] text-stone-400 hidden sm:block">
            {lang === 'ar' ? `المشهد سيضاف في التوقيت: ${timeRange}` : `Target timestamp: ${timeRange}`}
          </span>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* TAB 1: AI CO-DIRECTOR & PROMPT UNDERSTANDING */}
          {creationTab === 'ai' && (
            <div className="space-y-5">
              {/* Prompt Idea Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/20 via-stone-850 to-stone-900 border border-[#c29b40]/40 shadow-sm space-y-3.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-amber-200 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-[#c29b40]" />
                    <span>{lang === 'ar' ? 'صف فكرتك أو الحدث الذي تريده في هذا المشهد (10 ثوانٍ):' : 'Describe your scene idea or event for this 10-second beat:'}</span>
                  </label>
                  <span className="text-[10px] text-amber-400 font-mono font-bold bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-500/30">
                    SMART PARSER
                  </span>
                </div>

                <textarea
                  rows={3}
                  value={aiIdea}
                  onChange={(e) => setAiIdea(e.target.value)}
                  placeholder={lang === 'ar' 
                    ? 'مثال: البطل يقتحم البوابة الصخرية تحت أمطار رعدية غزيرة، ويلتقي حليفه السري ويهمس له بكلمة السر قبل وصول الحراس، مع لقطة سينمائية تركز على توتر عينيه...' 
                    : 'e.g. Hero charges into the fortress under thunderstorm, whispers the secret code to ally before guards arrive...'}
                  className="w-full text-xs rounded-xl bg-stone-900 border border-stone-700 p-3.5 text-white placeholder-stone-500 focus:outline-none focus:border-[#c29b40] leading-relaxed"
                />

                {/* Quick Idea Inspiration Chips */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-stone-400 font-bold block">
                    {lang === 'ar' ? 'أفكار سريعة ومقترحة للمشهد بنقرة واحدة:' : 'Quick ideas & inspiration chips:'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_IDEA_CHIPS.map((chip, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setAiIdea(chip.ar);
                          setAiTone(chip.tone);
                          setAiShot(chip.shot);
                        }}
                        className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-amber-200 border border-stone-700/80 transition-all cursor-pointer"
                      >
                        {lang === 'ar' ? chip.ar : chip.en}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interactive Questions & Director Guidance Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-stone-700/60">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 mb-1">
                      {lang === 'ar' ? 'نبرة الحوار والمشاعر:' : 'Dialogue Emotion / Tone:'}
                    </label>
                    <select
                      value={aiTone}
                      onChange={(e) => setAiTone(e.target.value)}
                      className="w-full text-xs rounded-lg bg-stone-900 border border-stone-700 p-2 text-white focus:outline-none focus:border-[#c29b40]"
                    >
                      {DIALOGUE_EMOTIONS.map((em, i) => (
                        <option key={i} value={em}>{em}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 mb-1">
                      {lang === 'ar' ? 'زاوية اللقطة والكاميرا:' : 'Camera Shot Type:'}
                    </label>
                    <select
                      value={aiShot}
                      onChange={(e) => setAiShot(e.target.value)}
                      className="w-full text-xs rounded-lg bg-stone-900 border border-stone-700 p-2 text-white focus:outline-none focus:border-[#c29b40]"
                    >
                      {SHOT_TYPES.map((sh, i) => (
                        <option key={i} value={sh}>{sh}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 mb-1">
                      {lang === 'ar' ? 'حركة الكاميرا (10s):' : 'Camera Motion (10s):'}
                    </label>
                    <select
                      value={aiMotion}
                      onChange={(e) => setAiMotion(e.target.value)}
                      className="w-full text-xs rounded-lg bg-stone-900 border border-stone-700 p-2 text-white focus:outline-none focus:border-[#c29b40]"
                    >
                      {CAMERA_MOTIONS.map((mo, i) => (
                        <option key={i} value={mo}>{mo}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 mb-1">
                      {lang === 'ar' ? 'الفصل الدرامي:' : 'Act Structure Phase:'}
                    </label>
                    <select
                      value={aiAct}
                      onChange={(e) => setAiAct(e.target.value as any)}
                      className="w-full text-xs rounded-lg bg-stone-900 border border-stone-700 p-2 text-white focus:outline-none focus:border-[#c29b40]"
                    >
                      <option value="act1">{lang === 'ar' ? '🎬 الفصل 1: البداية (Act I)' : 'Act I: Setup'}</option>
                      <option value="act2">{lang === 'ar' ? '⚔️ الفصل 2: الصراع (Act II)' : 'Act II: Conflict'}</option>
                      <option value="act3">{lang === 'ar' ? '🏆 الفصل 3: الذروة (Act III)' : 'Act III: Climax'}</option>
                    </select>
                  </div>
                </div>

                {/* Generate Button */}
                <div className="pt-2 flex items-center justify-end">
                  <button
                    type="button"
                    disabled={isGenerating || !aiIdea.trim()}
                    onClick={handleDesignSceneWithAI}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#c29b40] to-amber-600 hover:from-[#a6802f] hover:to-amber-700 disabled:opacity-50 text-stone-950 font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#c29b40]/20 cursor-pointer disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                        <span>{lang === 'ar' ? 'جاري فهم الفكرة وتصميم المشهد بذكاء...' : 'Designing Scene with AI...'}</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 stroke-[2.5]" />
                        <span>{lang === 'ar' ? 'فهم الفكرة وتصميم المشهد بذكاء 🪄' : 'Understand Idea & Author Scene 🪄'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* LIVE SCENE PREVIEW & DIRECT ADJUSTMENTS (Shown if generated or user starts filling) */}
              {hasGeneratedResult && (
                <div className="p-5 rounded-2xl bg-stone-950/80 border border-[#c29b40]/50 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-stone-800">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold flex items-center gap-1 text-xs">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{lang === 'ar' ? 'تم تصميم المشهد بنجاح! يمكنك التعديل المباشر عليه أدناه:' : 'Scene Authored! Adjust fields directly below:'}</span>
                      </span>
                    </div>

                    <span className="text-[10px] font-mono font-bold bg-[#c29b40] text-stone-950 px-2 py-0.5 rounded-md">
                      READY FOR TIMELINE
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[10px] font-bold text-stone-400 mb-1">
                        {lang === 'ar' ? 'عنوان المشهد بالعربية:' : 'Arabic Scene Title:'}
                      </label>
                      <input
                        type="text"
                        value={draftTitleAr}
                        onChange={(e) => setDraftTitleAr(e.target.value)}
                        className="w-full text-xs rounded-xl bg-stone-900 border border-stone-700 p-2.5 text-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-stone-400 mb-1">
                        {lang === 'ar' ? 'عنوان المشهد بالإنجليزية:' : 'English Scene Title:'}
                      </label>
                      <input
                        type="text"
                        value={draftTitleEn}
                        onChange={(e) => setDraftTitleEn(e.target.value)}
                        className="w-full text-xs rounded-xl bg-stone-900 border border-stone-700 p-2.5 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 mb-1">
                      {lang === 'ar' ? '🎬 نص السيناريو والحدث الدرامي (Arabic Screenplay Beat):' : 'Screenplay Dramatic Action Beat:'}
                    </label>
                    <textarea
                      rows={2}
                      value={draftScreenplayBeatAr}
                      onChange={(e) => setDraftScreenplayBeatAr(e.target.value)}
                      className="w-full text-xs rounded-xl bg-stone-900 border border-stone-700 p-2.5 text-white leading-relaxed font-medium"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
                          <Mic className="w-3.5 h-3.5 text-[#c29b40]" />
                          <span>{lang === 'ar' ? 'الحوار المنطوق ومشاعر الأداء (Spoken Dialogue & Lip-Sync):' : 'Spoken Dialogue & Lip-Sync:'}</span>
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                          <span>⚡</span>
                          <span>{lang === 'ar' ? 'ذكاء محلي' : 'Local AI'}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-amber-400 font-mono">👄 Lip-Sync Timing: {draftDialogueTiming}</span>
                        <button
                          type="button"
                          onClick={() => handleOpenSmartDialogueSuggestions('ai_preview')}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all flex items-center gap-1 cursor-pointer border shadow-xs active:scale-95 ${
                            activeSuggestionTarget === 'ai_preview'
                              ? 'bg-[#c29b40] text-stone-950 border-[#c29b40]'
                              : 'bg-amber-500/20 hover:bg-[#c29b40] text-amber-200 hover:text-stone-950 border-[#c29b40]/60'
                          }`}
                          title={lang === 'ar' ? 'اقتراح ذكي: تحسينات أسلوبية للنص بناءً على سياق المشهد' : 'Smart Style Suggestions'}
                        >
                          <Sparkles className="w-3 h-3 text-[#c29b40]" />
                          <span>{lang === 'ar' ? '💡 اقتراح ذكي' : '💡 Smart Style'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[9px] font-bold text-stone-400 mb-0.5">{lang === 'ar' ? 'المتحدث:' : 'Speaker:'}</label>
                        <input
                          type="text"
                          value={draftDialogueSpeaker}
                          onChange={(e) => setDraftDialogueSpeaker(e.target.value)}
                          className="w-full text-xs rounded-lg bg-stone-900 border border-stone-700 p-2 text-[#f5d996] font-bold"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[9px] font-bold text-stone-400 mb-0.5">{lang === 'ar' ? 'الحوار المنطوق بالعربية:' : 'Arabic Dialogue:'}</label>
                        <input
                          type="text"
                          value={draftDialogueAr}
                          onChange={(e) => handleDraftDialogueChange(e.target.value)}
                          placeholder={lang === 'ar' ? 'أدخل الحوار يدوياً أو اختر اقتراح ذكي...' : 'Type dialogue or choose Smart Style...'}
                          className="w-full text-xs rounded-lg bg-stone-900 border border-stone-700 p-2 text-white font-bold"
                        />
                      </div>
                    </div>

                    {renderModalSuggestionsPanel('ai_preview')}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-bold text-stone-400">
                        {lang === 'ar' ? '🚀 أمر الفيديو السينمائي الشامل (English AI Video Prompt):' : 'Master English Video Prompt:'}
                      </label>
                      <button
                        type="button"
                        onClick={handleCompilePromptFromFields}
                        className="text-[10px] font-bold text-[#c29b40] hover:text-[#f5d996] cursor-pointer"
                      >
                        {lang === 'ar' ? '🔄 إعادة تجميع البرومبت' : '🔄 Re-compile Prompt'}
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      value={draftVideoPromptEn}
                      onChange={(e) => setDraftVideoPromptEn(e.target.value)}
                      className="w-full text-xs font-mono rounded-xl bg-stone-900 border border-stone-700 p-2.5 text-stone-200 leading-relaxed"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MANUAL SCREENPLAY & DIALOGUE AUTHORING */}
          {creationTab === 'manual' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-amber-300 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#c29b40]" />
                    <span>{lang === 'ar' ? 'أدخل تفاصيل المشهد والسيناريو يدوياً بدقة:' : 'Author Scene Elements Manually:'}</span>
                  </h4>
                  <span className="text-[10px] text-stone-400 font-mono">10 SECONDS DURATION</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-stone-400 mb-1">{lang === 'ar' ? 'عنوان المشهد بالعربية:' : 'Arabic Title:'}</label>
                    <input
                      type="text"
                      value={draftTitleAr}
                      onChange={(e) => setDraftTitleAr(e.target.value)}
                      placeholder={lang === 'ar' ? 'مثال: المشهد الرابع: مواجهة الحصن' : 'Scene Title'}
                      className="w-full text-xs rounded-xl bg-stone-900 border border-stone-700 p-2.5 text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 mb-1">{lang === 'ar' ? 'الفصل الدرامي:' : 'Act:'}</label>
                    <select
                      value={draftActPhase}
                      onChange={(e) => setDraftActPhase(e.target.value as any)}
                      className="w-full text-xs rounded-xl bg-stone-900 border border-stone-700 p-2.5 text-white"
                    >
                      <option value="act1">{lang === 'ar' ? '🎬 الفصل 1: البداية' : 'Act I: Setup'}</option>
                      <option value="act2">{lang === 'ar' ? '⚔️ الفصل 2: الصراع' : 'Act II: Conflict'}</option>
                      <option value="act3">{lang === 'ar' ? '🏆 الفصل 3: الذروة' : 'Act III: Climax'}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-400 mb-1">
                    {lang === 'ar' ? '🎬 نص السيناريو والحدث الدرامي (Arabic Screenplay Beat):' : 'Screenplay Narrative Action Beat:'}
                  </label>
                  <textarea
                    rows={2}
                    value={draftScreenplayBeatAr}
                    onChange={(e) => setDraftScreenplayBeatAr(e.target.value)}
                    placeholder={lang === 'ar' ? 'اكتب ما تفعله الشخصية بدقة وتفاعلها مع المحيط في هذه الـ 10 ثوانٍ...' : 'Describe character action beat...'}
                    className="w-full text-xs rounded-xl bg-stone-900 border border-stone-700 p-2.5 text-white leading-relaxed"
                  />
                </div>

                {/* Spoken Dialogue Form */}
                <div className="p-3.5 rounded-xl bg-stone-900/90 border border-stone-700/80 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#f5d996] flex items-center gap-1.5">
                        <Mic className="w-3.5 h-3.5 text-[#c29b40]" />
                        <span>{lang === 'ar' ? 'الحوار المنطوق (Spoken Dialogue & Lip-Sync):' : 'Spoken Dialogue:'}</span>
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                        <span>⚡</span>
                        <span>{lang === 'ar' ? 'ذكاء محلي' : 'Local AI'}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenSmartDialogueSuggestions('manual')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all flex items-center gap-1 cursor-pointer border shadow-xs active:scale-95 ${
                          activeSuggestionTarget === 'manual'
                            ? 'bg-[#c29b40] text-stone-950 border-[#c29b40]'
                            : 'bg-amber-500/20 hover:bg-[#c29b40] text-amber-200 hover:text-stone-950 border-[#c29b40]/60'
                        }`}
                        title={lang === 'ar' ? 'اقتراح ذكي: تحسينات أسلوبية للنص بناءً على سياق المشهد' : 'Smart Style Suggestions'}
                      >
                        <Sparkles className="w-3 h-3 text-[#c29b40]" />
                        <span>{lang === 'ar' ? '💡 اقتراح ذكي' : '💡 Smart Style'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[9px] font-bold text-stone-400 mb-0.5">{lang === 'ar' ? 'اسم المتحدث:' : 'Speaker Name:'}</label>
                      <input
                        type="text"
                        value={draftDialogueSpeaker}
                        onChange={(e) => setDraftDialogueSpeaker(e.target.value)}
                        className="w-full text-xs rounded-lg bg-stone-950 border border-stone-700 p-2 text-amber-200 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-stone-400 mb-0.5">{lang === 'ar' ? 'نبرة ومشاعر الإلقاء:' : 'Emotion / Tone:'}</label>
                      <input
                        type="text"
                        value={draftDialogueEmotion}
                        onChange={(e) => setDraftDialogueEmotion(e.target.value)}
                        placeholder="نبرة حازمة ومؤثرة"
                        className="w-full text-xs rounded-lg bg-stone-950 border border-stone-700 p-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-stone-400 mb-0.5">{lang === 'ar' ? 'توقيت نطق الجملة (Lip-sync):' : 'Timing Range:'}</label>
                      <input
                        type="text"
                        value={draftDialogueTiming}
                        onChange={(e) => setDraftDialogueTiming(e.target.value)}
                        className="w-full text-xs font-mono rounded-lg bg-stone-950 border border-stone-700 p-2 text-stone-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[9px] font-bold text-stone-400 mb-0.5">{lang === 'ar' ? 'الجملة المنطوقة بالعربية:' : 'Arabic Dialogue:'}</label>
                      <input
                        type="text"
                        value={draftDialogueAr}
                        onChange={(e) => handleDraftDialogueChange(e.target.value)}
                        placeholder="مثال: اثبت مكانك.. لن نتراجع بعد كل ما خضناه!"
                        className="w-full text-xs rounded-lg bg-stone-950 border border-stone-700 p-2 text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-stone-400 mb-0.5">{lang === 'ar' ? 'الترجمة الإنجليزية للحوار:' : 'English Subtitle:'}</label>
                      <input
                        type="text"
                        value={draftDialogueEn}
                        onChange={(e) => setDraftDialogueEn(e.target.value)}
                        placeholder="e.g. Hold your ground.. we will not retreat!"
                        className="w-full text-xs rounded-lg bg-stone-950 border border-stone-700 p-2 text-stone-300 font-mono"
                      />
                    </div>
                  </div>

                  {renderModalSuggestionsPanel('manual')}
                </div>

                {/* Camera & Sound */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[9px] font-bold text-stone-400 mb-1">{lang === 'ar' ? 'نوع اللقطة:' : 'Shot Type:'}</label>
                    <select
                      value={draftShotType}
                      onChange={(e) => setDraftShotType(e.target.value)}
                      className="w-full text-xs rounded-lg bg-stone-900 border border-stone-700 p-2 text-white"
                    >
                      {SHOT_TYPES.map((s, i) => (
                        <option key={i} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-stone-400 mb-1">{lang === 'ar' ? 'حركة الكاميرا:' : 'Camera Motion:'}</label>
                    <select
                      value={draftCameraMotion}
                      onChange={(e) => setDraftCameraMotion(e.target.value)}
                      className="w-full text-xs rounded-lg bg-stone-900 border border-stone-700 p-2 text-white"
                    >
                      {CAMERA_MOTIONS.map((m, i) => (
                        <option key={i} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-stone-400 mb-1">{lang === 'ar' ? 'المؤثرات الصوتية والموسيقى:' : 'Sound Design:'}</label>
                    <input
                      type="text"
                      value={draftSoundDesign}
                      onChange={(e) => setDraftSoundDesign(e.target.value)}
                      className="w-full text-xs rounded-lg bg-stone-900 border border-stone-700 p-2 text-stone-300"
                    />
                  </div>
                </div>

                {/* Video Prompt Area */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-bold text-stone-400">
                      {lang === 'ar' ? 'برومبت الفيديو (English Video Prompt):' : 'English Video Prompt:'}
                    </label>
                    <button
                      type="button"
                      onClick={handleCompilePromptFromFields}
                      className="text-[10px] font-bold text-[#c29b40] hover:text-[#f5d996] flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{lang === 'ar' ? 'توليد البرومبت من السيناريو والحوار' : 'Compile Prompt'}</span>
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={draftVideoPromptEn}
                    onChange={(e) => setDraftVideoPromptEn(e.target.value)}
                    placeholder="Click 'Compile Prompt' above or write custom Runway/Luma prompt..."
                    className="w-full text-xs font-mono rounded-xl bg-stone-900 border border-stone-700 p-2.5 text-stone-200"
                  />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Action Footer */}
        <div className="p-4 sm:p-5 bg-stone-950 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-stone-400 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              {lang === 'ar' ? `المشهد جاهز للإدراج بتوقيت (${timeRange}) 10 ثوانٍ` : `Ready to insert at (${timeRange}) 10s duration`}
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 sm:w-auto px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs transition-all cursor-pointer"
            >
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>

            <button
              type="button"
              onClick={handleConfirmInsertScene}
              className="w-1/2 sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#c29b40] to-amber-600 hover:from-[#a6802f] hover:to-amber-700 text-stone-950 font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#c29b40]/20 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
            >
              <Clapperboard className="w-4 h-4 stroke-[2.5]" />
              <span>{lang === 'ar' ? 'إدراج المشهد في تسلسل الفيلم 🎬' : 'Insert Scene into Timeline 🎬'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
