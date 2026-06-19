/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ModelType = 'gemini' | 'chatgpt' | 'claude' | 'midjourney' | 'notebooklm';

export interface PromptTemplate {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  category: string;
  icon: string;
  promptText: string;
  placeholders: {
    key: string;
    labelAr: string;
    labelEn: string;
    placeholderAr: string;
    placeholderEn: string;
    type: 'text' | 'textarea' | 'select';
    options?: string[];
  }[];
}

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
}

export type ActiveTab = 'dashboard' | 'builder' | 'reverse' | 'library' | 'sequence' | 'tester' | 'history' | 'analytics' | 'rap' | 'drone' | 'diffusiondb';

export interface Category {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  icon: string;
}
