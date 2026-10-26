/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ModelType = 'gemini' | 'chatgpt' | 'claude' | 'midjourney' | 'notebooklm' | 'meta';

export type AppLanguage = 'ar' | 'en' | 'fr' | 'es' | 'de' | 'tr' | 'ja' | 'zh';

export interface LanguageOption {
  code: AppLanguage;
  name: string;
  nativeName: string;
  flag: string;
  dir: 'rtl' | 'ltr';
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', dir: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', dir: 'ltr' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', dir: 'ltr' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', dir: 'ltr' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', dir: 'ltr' },
];

export interface PromptHistoryItem {
  id: string;
  timestamp: string;
  originalText: string;
  optimizedText: string;
  translatedText?: string;
  model: ModelType;
  tone: string;
  category: string;
  actionType?: 'generate' | 'refine' | 'translate' | 'reverse';
  isFallback?: boolean;
  styleImage?: string | null;
  contentImage?: string | null;
  notes?: string;
  isMimicMode?: boolean;
  isFavorite?: boolean;
  rating?: number;
  tags?: string[];
}

export type ActiveTab = 'builder' | 'templates' | 'cinema' | 'visual_library' | 'ideas' | 'reverse' | 'sequence' | 'drone' | 'diffusiondb' | 'history' | 'privacy' | 'pricing';

export interface Category {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  icon: string;
}

export interface Scene {
  titleAr: string;
  titleEn: string;
  promptAr: string;
  promptEn: string;
  motion: string;
  intensity: number;
  theme: string;
}

export interface SavedSequence {
  id: string;
  title: string;
  concept: string;
  anchorStyle: string;
  aspectRatio: string;
  transitionEffect: string;
  scenes: Scene[];
  createdAt: string;
  updatedAt: string;
}

export interface CharacterFaceAnchor {
  name: string;
  role: string;
  gender?: string;
  age?: string;
  faceDescriptionAr: string;
  faceDescriptionEn: string;
  consistencyPromptToken: string;
  referenceImage?: string | null;
}

export type ActPhase = 'act1' | 'act2' | 'act3';

export interface ActStructure {
  act1TitleAr: string;
  act1TitleEn: string;
  act1DescriptionAr: string;
  act1DescriptionEn: string;
  act2TitleAr: string;
  act2TitleEn: string;
  act2DescriptionAr: string;
  act2DescriptionEn: string;
  act3TitleAr: string;
  act3TitleEn: string;
  act3DescriptionAr: string;
  act3DescriptionEn: string;
}

export interface ScreenplayTemplate {
  id: string;
  genre: string;
  nameAr: string;
  nameEn: string;
  icon: string;
  taglineAr: string;
  taglineEn: string;
  defaultConceptAr: string;
  defaultConceptEn: string;
  acts: ActStructure;
  suggestedHeroRoleAr: string;
  suggestedHeroRoleEn: string;
  recommendedStyle: string;
}

export interface CinemaScene {
  sceneNumber: number;
  timeRange: string; // e.g. "00:00 - 00:10"
  durationSeconds: number; // 10
  titleAr: string;
  titleEn: string;
  shotType: string;
  cameraMotion: string;
  dramaticActionAr: string;
  screenplaySlug?: string; // e.g. "مشهد خارجي - ليل (EXT. NIGHT)"
  screenplayBeatAr?: string; // Detailed screenplay action beat
  screenplayBeatEn?: string; // Detailed screenplay action beat in English
  dialogueSpeaker?: string; // Character speaking
  dialogueEmotion?: string; // Emotional tone / delivery
  dialogueTiming?: string; // Timing within 10s e.g. "00:03 - 00:08"
  dialogueAr?: string;
  dialogueEn?: string;
  videoPromptEn: string;
  soundDesign?: string;
  motionIntensity?: number;
  actPhase?: ActPhase;
  actLabelAr?: string;
  actLabelEn?: string;
}

export interface StoryPathChoice {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string;
  descriptionAr: string;
  descriptionEn: string;
  badgeAr?: string;
  badgeEn?: string;
  toneAr?: string;
  toneEn?: string;
  outcomePreviewAr?: string;
  outcomePreviewEn?: string;
  promptModifierKeywords?: string[];
  sceneOverrides: {
    sceneNumber: number;
    titleAr?: string;
    titleEn?: string;
    dramaticActionAr?: string;
    screenplayBeatAr?: string;
    screenplayBeatEn?: string;
    dialogueAr?: string;
    dialogueEn?: string;
    dialogueSpeaker?: string;
    dialogueEmotion?: string;
    dialogueTiming?: string;
    videoPromptEn?: string;
    soundDesign?: string;
    cameraMotion?: string;
    shotType?: string;
  }[];
}

export interface MovieProject {
  id: string;
  titleAr: string;
  titleEn: string;
  concept: string;
  genre: string;
  visualStyle: string;
  targetAiModel: string;
  loglineAr: string;
  loglineEn: string;
  storySynopsisAr: string;
  storySynopsisEn: string;
  characterAnchor: CharacterFaceAnchor;
  secondaryCharacterAnchor?: CharacterFaceAnchor;
  scenes: CinemaScene[];
  totalDurationSeconds: number;
  templateId?: string;
  actStructure?: ActStructure;
  availablePaths?: StoryPathChoice[];
  activePathId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SharedSequenceData {
  id: string;
  type: 'storyboard' | 'cinema';
  title: string;
  concept: string;
  anchorStyle?: string;
  aspectRatio?: string;
  transitionEffect?: string;
  scenes: any[];
  characterAnchor?: CharacterFaceAnchor;
  authorName?: string;
  createdAt: string;
  movieProject?: MovieProject;
  storyboardSequence?: SavedSequence;
}

