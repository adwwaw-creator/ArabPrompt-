/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CinemaScene, CharacterFaceAnchor } from '../types';
import { appendSiteUrlToPrompt } from './brandWatermark';

export interface DialogueContextSuggestion {
  type: 'dramatic' | 'subtext' | 'punchy' | 'emotional';
  styleLabelAr: string;
  styleLabelEn: string;
  dialogueAr: string;
  dialogueEn: string;
  emotionAr: string;
  subtextReasonAr: string;
}

/**
 * High-fidelity Local AI Dialogue Stylist:
 * Generates 4 contextually adapted stylistic variations of dialogue
 * based on scene beat, genre, protagonist, and act phase with zero latency.
 */
export function generateLocalDialogueSuggestions(
  currentDialogue: string,
  sceneContext: {
    sceneBeat?: string;
    sceneTitle?: string;
    speakerName?: string;
    genre?: string;
    actPhase?: string;
    concept?: string;
  }
): DialogueContextSuggestion[] {
  const current = (currentDialogue || '').trim();
  const beat = (sceneContext.sceneBeat || sceneContext.sceneTitle || '').trim();
  const speaker = (sceneContext.speakerName || 'البطل').trim();
  const genre = (sceneContext.genre || 'دراما وإثارة').trim();
  const isAct3 = sceneContext.actPhase === 'act3';
  const isAct1 = sceneContext.actPhase === 'act1';

  // Extract core keywords from current dialogue or scene beat
  const words = (current || beat || 'الحدث').split(/\s+/).filter(w => w.length > 2);
  const focalTopic = words.slice(0, 3).join(' ') || 'هذا الموقف';

  // 1. Dramatic Escalation
  let dramaticAr = current
    ? `${current.replace(/[.!؟]+$/, '')}.. لن نتردد لحظة واحدة بعد الآن!`
    : (isAct3 
        ? `وصلنا إلى نقطة اللاعودة.. مصيرنا بالكامل يتحدد هنا الآن!` 
        : `انظر إلى ما حولك.. خطوة واحدة خاطئة وستنهار الخطة بأكملها!`);
  let dramaticEn = isAct3
    ? `We have reached the point of no return.. our fate is decided right here, right now!`
    : `One single misstep now and everything we fought for collapses!`;

  // 2. Cinematic Subtext (Realism & Restraint)
  let subtextAr = current
    ? `الصمت هنا أبلغ من الكلام.. تعرف جيداً ما علينا فعله، أليس كذلك؟`
    : `لا تنظر إلى الخلف.. دع الريح تسبقنا والعيون تراقب بصمت.`;
  let subtextEn = `The silence here is telling.. you know what must be done, don't you?`;

  // 3. Punchy (Concise for 10s Pacing & Crisp Lip-Sync)
  const shortText = current ? current.split(' ').slice(0, 5).join(' ') : 'تحرك فوراً';
  let punchyAr = `${shortText}.. الآن وبدون تردد!`;
  let punchyEn = `Make the move right now, without hesitation!`;

  // 4. Emotional Depth (Vulnerability & Resonant Bonds)
  let emotionalAr = isAct1
    ? `مهما تباعدت الطرق، أعدك ألا أترك هذا العهد يضيع في مهب الريح.`
    : `لم أخض كل هذه المعارك لأتراجع الآن.. نحن نصنع قدرنا بأيدينا.`;
  let emotionalEn = isAct1
    ? `No matter how perilous the road, I will not let our promise fade away.`
    : `I did not endure all these trials to surrender now.. we carve our own destiny.`;

  return [
    {
      type: 'dramatic',
      styleLabelAr: 'تصعيد درامي ومواجهة حاسمة',
      styleLabelEn: 'Dramatic Escalation',
      dialogueAr: dramaticAr,
      dialogueEn: dramaticEn,
      emotionAr: 'نبرة حازمة مشحونة بالتوتر والصراع',
      subtextReasonAr: 'رفع وتيرة الخطر المباشر وربط الحوار بعواقب اللحظة الحاسمة في المشهد.'
    },
    {
      type: 'subtext',
      styleLabelAr: 'تلميح ذكي وواقعية سينمائية (Subtext)',
      styleLabelEn: 'Cinematic Subtext',
      dialogueAr: subtextAr,
      dialogueEn: subtextEn,
      emotionAr: 'همس هادئ يحمل تحذيراً باطناً',
      subtextReasonAr: 'تجنب المباشرة ومنح المشهد عمقاً وغموضاً نفسياً يثير فضول المشاهد.'
    },
    {
      type: 'punchy',
      styleLabelAr: 'موجزة ومكثفة لـ 10 ثوانٍ (10s Pacing)',
      styleLabelEn: 'Punchy 10s Screenplay Beat',
      dialogueAr: punchyAr,
      dialogueEn: punchyEn,
      emotionAr: 'نبرة سريعة قاطعة وواثقة',
      subtextReasonAr: 'تقليص عدد الكلمات لضمان دقة توقيت النطق وتزامن حركة الشفاه المثالي (Lip-Sync).'
    },
    {
      type: 'emotional',
      styleLabelAr: 'عمق نفسي وتأثير وجداني',
      styleLabelEn: 'Emotional Depth & Stakes',
      dialogueAr: emotionalAr,
      dialogueEn: emotionalEn,
      emotionAr: 'نبرة صدق ووفاء وتأثر عميق',
      subtextReasonAr: 'إبراز الدوافع الإنسانية الصادقة والروابط العاطفية التي تحرك الشخصية.'
    }
  ];
}

/**
 * Local AI Scene Designer & Refiner:
 * Dynamically re-engineers a scene's lip-sync timing, emotion, English subtitle,
 * and comprehensive Runway/Luma/Sora video prompt when dialogue changes.
 */
export function refineSceneWithLocalAi(
  scene: CinemaScene,
  newDialogueAr: string,
  options?: {
    newDialogueEn?: string;
    newEmotion?: string;
    newSpeaker?: string;
    characterAnchor?: CharacterFaceAnchor;
    visualStyle?: string;
    targetAiModel?: string;
  }
): CinemaScene {
  const cleanAr = (newDialogueAr || '').trim();
  const speaker = options?.newSpeaker || scene.dialogueSpeaker || options?.characterAnchor?.name || 'البطل';
  const emotion = options?.newEmotion || scene.dialogueEmotion || detectEmotionFromArabic(cleanAr);
  
  // Calculate natural lip-sync timing based on word count within 10-second scene window
  const words = cleanAr.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  
  // Parse base scene start timestamp e.g. "00:20 - 00:30"
  let startSec = (scene.sceneNumber - 1) * 10;
  const timeMatch = (scene.timeRange || '').match(/(\d+):(\d+)/);
  if (timeMatch) {
    startSec = parseInt(timeMatch[1], 10) * 60 + parseInt(timeMatch[2], 10);
  }

  let lipSyncStart = startSec + 2;
  let lipSyncDuration = Math.min(6, Math.max(2, Math.round(wordCount * 0.55)));
  let lipSyncEnd = Math.min(startSec + 9, lipSyncStart + lipSyncDuration);

  const pad = (n: number) => n < 10 ? `0${n}` : `${n}`;
  const lipSyncTiming = `${pad(Math.floor(lipSyncStart / 60))}:${pad(lipSyncStart % 60)} - ${pad(Math.floor(lipSyncEnd / 60))}:${pad(lipSyncEnd % 60)}`;

  // English translation or fallback subtitle
  const cleanEn = options?.newDialogueEn || scene.dialogueEn || generateQuickEnglishTranslation(cleanAr);

  // Character Anchor token
  const anchorToken = options?.characterAnchor?.consistencyPromptToken || '';
  const visualStyle = options?.visualStyle || 'Cinematic 35mm Film';
  const targetAiModel = options?.targetAiModel || 'Runway Gen-3 Alpha';
  const shotType = scene.shotType || 'Medium Cinematic Shot';
  const cameraMotion = scene.cameraMotion || 'Slow Dolly In (10s)';
  const action = scene.screenplayBeatEn || scene.dramaticActionAr || 'Dramatic narrative screenplay action';
  const sound = scene.soundDesign || 'Atmospheric cinematic ambiance';

  // Construct or update master video prompt
  let updatedPrompt = scene.videoPromptEn || '';
  const lipSyncDirective = `[CHARACTER SPOKEN DIALOGUE & LIP-SYNC]: ${speaker} speaks (${emotion}) at ${lipSyncTiming}: "${cleanAr}" ("${cleanEn}"), perfectly synchronized natural lip-sync and mouth movement, expressive facial acting.`;

  if (!updatedPrompt || updatedPrompt.length < 30) {
    updatedPrompt = `${anchorToken} Scene ${scene.sceneNumber} (${scene.timeRange}, 10s duration). ${shotType}, ${cameraMotion}. [SCREENPLAY ACTION]: ${action}. ${lipSyncDirective} [CINEMATOGRAPHY]: ${visualStyle}, 8k photorealistic, volumetric atmosphere, optimized for ${targetAiModel}. [SOUND DESIGN]: ${sound}.`;
  } else {
    // Replace existing dialogue block or append
    const lipSyncRegex = /\[CHARACTER SPOKEN DIALOGUE & LIP-SYNC\]:[^\[]*/gi;
    if (lipSyncRegex.test(updatedPrompt)) {
      updatedPrompt = updatedPrompt.replace(lipSyncRegex, `${lipSyncDirective} `);
    } else {
      updatedPrompt = `${updatedPrompt} ${lipSyncDirective}`;
    }
  }

  updatedPrompt = appendSiteUrlToPrompt(updatedPrompt);

  return {
    ...scene,
    dialogueAr: cleanAr,
    dialogueEn: cleanEn,
    dialogueSpeaker: speaker,
    dialogueEmotion: emotion,
    dialogueTiming: lipSyncTiming,
    videoPromptEn: updatedPrompt
  };
}

/**
 * Emotion heuristic classifier from Arabic syntax and keywords
 */
function detectEmotionFromArabic(text: string): string {
  if (!text) return 'نبرة هادئة ومتزنة';
  if (text.includes('!') || text.includes('فوراً') || text.includes('الآن') || text.includes('احذر')) {
    return 'نبرة حازمة ومتوترة';
  }
  if (text.includes('؟') || text.includes('كيف') || text.includes('لماذا') || text.includes('أليس')) {
    return 'همس متوتر وتساؤل مشحون بالشك';
  }
  if (text.includes('عهد') || text.includes('أعدك') || text.includes('معاً') || text.includes('لن أترك')) {
    return 'تأثر عاطفي وصدق عميق';
  }
  if (text.includes('النصر') || text.includes('المجد') || text.includes('صمدنا') || text.includes('شرف')) {
    return 'نبرة فروسية وكبرياء وانتصار';
  }
  return 'نبرة تركيز وحزم';
}

/**
 * Quick semantic English subtitle approximation
 */
function generateQuickEnglishTranslation(arabicText: string): string {
  if (!arabicText) return '';
  if (arabicText.includes('قبل فوات الأوان') || arabicText.includes('لا مجال للتردد')) {
    return 'We must make our move now before it is too late!';
  }
  if (arabicText.includes('انتبه') || arabicText.includes('احذر')) {
    return 'Stay sharp and vigilant.. danger is all around us!';
  }
  if (arabicText.includes('نقطة اللاعودة') || arabicText.includes('مصيرنا')) {
    return 'Our fate is decided here.. hold your ground!';
  }
  if (arabicText.includes('أعدك') || arabicText.includes('لن أترك')) {
    return 'I promise you, we will see this through together.';
  }
  return 'Stay focused and move with calculated precision.';
}
