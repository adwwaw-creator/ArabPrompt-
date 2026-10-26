/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Sparkles, Copy, Check, RefreshCw, Cpu, Globe, Sliders, AlertCircle, HelpCircle, 
  Share2, Tag, Plus, X, Hash, Image as ImageIcon, LayoutTemplate, Heart, Zap,
  UploadCloud, ImagePlus, Layers, Camera, Palette, Eye, CheckCircle2, Trash2, ArrowDown,
  Wand2, FileText, ListPlus, FileDown, CheckCheck, ChevronDown, ChevronUp, Send
} from 'lucide-react';
import { ModelType, AppLanguage, SUPPORTED_LANGUAGES } from '../types';
import { getTranslation } from '../utils/translations';
import VariableHighlighterEditor from './VariableHighlighterEditor';
import PromptQualityScore from './PromptQualityScore';
import SharePromptToAiModal from './SharePromptToAiModal';
import { showToast } from './ToastNotification';
import { appendSiteUrlToPrompt } from '../utils/brandWatermark';
import AdSenseBanner from './AdSenseBanner';
import AdSensePlaceholder from './AdSensePlaceholder';
import WatchAdInterstitialModal from './WatchAdInterstitialModal';
import { checkGenerationQuota } from '../utils/subscriptionService';

export interface VisualReferenceAnalysis {
  image: string;
  mimeType: string;
  visualDescriptionAr: string;
  visualDescriptionEn: string;
  styleSnippet: string;
  attributes: {
    medium: string;
    lighting: string;
    camera: string;
    composition: string;
    mood: string;
    palette: string[];
  };
  promptSnippet: string;
  fileName?: string;
  isFallback?: boolean;
}

interface PromptBuilderProps {
  lang: AppLanguage;
  onSendToTester: (promptText: string) => void;
  onNavigateToReverse?: () => void;
  onNavigateToTemplates?: () => void;
  onLogPrompt?: (item: {
    originalText: string;
    optimizedText: string;
    model: ModelType;
    tone: string;
    category: string;
    actionType: 'generate' | 'refine' | 'translate' | 'reverse';
    isFallback?: boolean;
    tags?: string[];
    styleImage?: string | null;
  }) => void;
  initialValues?: {
    concept: string;
    model: ModelType;
    tone: string;
    category: string;
  };
}

const CATEGORY_LABELS: Record<string, { ar: string; en: string }> = {
  content: { ar: 'كتابة المحتوى والتدوين', en: 'Content & Blog' },
  marketing: { ar: 'التسويق والإعلانات', en: 'Marketing & Ads' },
  tech: { ar: 'البرمجة والتطوير', en: 'Programming & Tech' },
  education: { ar: 'التعليم والتبسيط', en: 'Education & Learning' },
  productivity: { ar: 'الإنتاجية والأعمال', en: 'Productivity' },
  visual: { ar: 'هندسة الأوامر البصرية', en: 'Prompt Architect' },
};

const getCategoryLabel = (cat: string, currentLang: 'ar' | 'en') => {
  return CATEGORY_LABELS[cat]?.[currentLang] || cat;
};

const CATEGORY_DETECTION_RULES = [
  {
    category: 'tech',
    keywords: [
      'code', 'programming', 'typescript', 'javascript', 'python', 'react', 'html', 'css', 'sql', 
      'database', 'api', 'server', 'developer', 'bug', 'function', 'software', 'java', 'rust', 'c++', 
      'compile', 'framework', 'git', 'github', 'endpoint', 'json', 'yaml', 'docker', 'npm',
      'برمجة', 'كود', 'مطور', 'تطبيق', 'قاعدة بيانات', 'برمجيات', 'خادم'
    ]
  },
  {
    category: 'visual',
    keywords: [
      'photo', 'cinematic', 'visual', 'lighting', 'image', 'selfie', 'render', 'midjourney', 
      'dall-e', 'leica', 'photography', '35mm', 'bokeh', 'portrait', 'camera', 'resolution', 
      'flux', 'stable diffusion', 'aspect ratio', 'shutter', 'sensory', 'vivid', 'ray-traced',
      'صورة', 'تصوير', 'كاميرا', 'إضاءة', 'منظر', 'شاتر', 'غلاف'
    ]
  },
  {
    category: 'marketing',
    keywords: [
      'marketing', 'advertisement', 'ads', 'campaign', 'seo', 'audience', 'brand', 'sales', 
      'copywriting', 'conversion', 'ad copy', 'leads', 'funnel', 'customer', 'retention', 'cro',
      'تسويق', 'مبيعات', 'جمهور', 'إعلان', 'ترويج', 'حملة', 'علامة تجارية'
    ]
  },
  {
    category: 'education',
    keywords: [
      'learn', 'teach', 'course', 'student', 'explain', 'class', 'pedagogy', 'feynman', 
      'study', 'tutorial', 'curriculum', 'grade', 'school', 'lesson', 'concept for beginners',
      'تعليم', 'شرح', 'طالب', 'مدرسة', 'دراسة', 'منهج', 'درس', 'تعلم'
    ]
  },
  {
    category: 'productivity',
    keywords: [
      'productivity', 'business', 'strategy', 'plan', 'swot', 'pestel', 'meeting', 'organize', 
      'finance', 'invest', 'economy', 'budget', 'roadmap', 'schedule', 'task list', 'milestone',
      'أعمال', 'إنتاجية', 'استراتيجية', 'مالية', 'تنظيم', 'ميزانية', 'تخطيط'
    ]
  },
  {
    category: 'content',
    keywords: [
      'blog', 'article', 'story', 'novel', 'lyrics', 'poetry', 'poem', 'lyrics', 'write', 
      'script', 'creative writing', 'draft', 'podcast', 'dialog', 'rhyme', 'rap', 'flow',
      'كتابة', 'مقال', 'قصة', 'رواية', 'شعر', 'سيناريو', 'أغنية'
    ]
  }
];

const detectCategoryFromText = (text: string): string | null => {
  if (!text || text.trim().length < 3) return null;
  const lower = text.toLowerCase();

  let bestCategory: string | null = null;
  let maxScore = 0;

  for (const rule of CATEGORY_DETECTION_RULES) {
    let score = 0;
    for (const keyword of rule.keywords) {
      if (lower.includes(keyword)) {
        score += 1;
        if (keyword.length > 5) score += 0.5;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestCategory = rule.category;
    }
  }

  return maxScore > 0 ? bestCategory : null;
};

const TONE_OPTIONS = [
  { value: 'مهني واحترافي', labelAr: 'مهني واحترافي', labelEn: 'Professional & Corporate' },
  { value: 'إبداعي وحر', labelAr: 'إبداعي وتخيلي', labelEn: 'Creative & Casual' },
  { value: 'تعليمي ومبسط', labelAr: 'تعليمي ومبسط وشرح مفصل', labelEn: 'Educational & Detailed' },
  { value: 'تسويقي مبيعاتي', labelAr: 'تسويقي ومقنع للمبيعات', labelEn: 'Persuasive & Copywriting' },
  { value: 'صارم ومباشر', labelAr: 'تعليمات صارمة ومباشرة دون كلام فرعي', labelEn: 'Strict, minimal & concise' },
];

function PromptBuilder({ lang, onSendToTester, onNavigateToReverse, onNavigateToTemplates, onLogPrompt, initialValues }: PromptBuilderProps) {
  const t = getTranslation(lang);
  const [concept, setConcept] = useState(initialValues?.concept || '');
  const [model, setModel] = useState<ModelType>(initialValues?.model || 'gemini');
  const [tone, setTone] = useState(initialValues?.tone || 'مهني واحترافي');
  const [category, setCategory] = useState(initialValues?.category || 'content');
  const [language, setLanguage] = useState<AppLanguage>('en');
  const [useClarificationLoop, setUseClarificationLoop] = useState(false);

  // Auto category detection states
  const [hasManuallySelected, setHasManuallySelected] = useState(false);
  const [autoDetectedCategory, setAutoDetectedCategory] = useState<string | null>(null);

  // Visual Prompt Architect custom states
  const [vPlatform, setVPlatform] = useState('Midjourney v6');
  const [vMood, setVMood] = useState('calm');
  const [vLighting, setVLighting] = useState('Golden Hour');
  const [vComposition, setVComposition] = useState('environmental portrait');
  const [vGear, setVGear] = useState('shot on Leica M6 35mm, Kodak Portra 400');
  const [vPhotographer, setVPhotographer] = useState('Steve McCurry style');
  const [isShareAiModalOpen, setIsShareAiModalOpen] = useState(false);
  const [isWatchAdModalOpen, setIsWatchAdModalOpen] = useState(false);

  React.useEffect(() => {
    if (!concept || concept.trim().length < 3) {
      setAutoDetectedCategory(null);
      return;
    }
    const timer = setTimeout(() => {
      const detected = detectCategoryFromText(concept);
      setAutoDetectedCategory(detected);
      
      if (detected && detected !== category && !hasManuallySelected) {
        setCategory(detected);
        if (detected === 'visual') {
          setModel('midjourney');
        }
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [concept, hasManuallySelected, category]);

  React.useEffect(() => {
    if (initialValues) {
      setConcept(initialValues.concept || '');
      setModel(initialValues.model || 'gemini');
      setTone(initialValues.tone || 'مهني واحترافي');
      setCategory(initialValues.category || 'content');
      setHasManuallySelected(false);
    }
  }, [initialValues]);
  
  // App states
  const [loading, setLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState('');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  // Mode switcher: Single Prompt vs Bulk Generation
  const [builderMode, setBuilderMode] = useState<'single' | 'bulk'>('single');

  // Bulk Generation Mode states
  const [bulkInput, setBulkInput] = useState('');
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });
  const [bulkResults, setBulkResults] = useState<Array<{
    id: string;
    topic: string;
    prompt: string;
    status: 'pending' | 'generating' | 'completed' | 'error';
    error?: string;
  }>>([]);
  const [bulkCopiedAll, setBulkCopiedAll] = useState(false);
  const [bulkCopiedId, setBulkCopiedId] = useState<string | null>(null);
  const [bulkExpandedId, setBulkExpandedId] = useState<string | null>(null);

  // Parse comma-separated or newline-separated topics
  const parsedBulkTopics = useMemo(() => {
    if (!bulkInput.trim()) return [];
    return bulkInput
      .split(/[\n,،]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
  }, [bulkInput]);

  // Quick suggestions trigger
  const ideaPresets = [
    { ar: 'كتابة بريد اعتذار رسمي ومحترم لعميل غاضب بسب تأخر تسليم المشروع', en: 'Polite formal apology email to an angry client for project delays' },
    { ar: 'تطوير كود بلغة بايثون يقوم بتحويل الصور الأبيض والأسود لملونة وشرح الكود بالتفصيل', en: 'Python script to colorize black and white images with simple Arabic walk-through' },
    { ar: 'صناعة خطة تسويقية متكاملة لإطلاق خط قهوة سعودية فاخرة في المملكة', en: 'Full marketing plan to launch a luxurious Saudi coffee line' },
    { ar: 'نصائح لتعلم البرمجة من الصفر في 6 أشهر بطريقة مبسطة للمبتدئات', en: '6 months plan for learning programming from scratch tailored for beginners' }
  ];

  const [saveNotification, setSaveNotification] = useState<string>('');

  // Auto-Tagging states
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [isSuggestingTags, setIsSuggestingTags] = useState(false);
  const [customTagInput, setCustomTagInput] = useState('');

  // Visual Reference Drag & Drop & AI Vision Analysis states
  const [visualRef, setVisualRef] = useState<VisualReferenceAnalysis | null>(null);
  const [isAnalyzingVisualRef, setIsAnalyzingVisualRef] = useState(false);
  const [isDragOverVisualRef, setIsDragOverVisualRef] = useState(false);
  const [autoEmbedVisualDescription, setAutoEmbedVisualDescription] = useState(true);
  const [visualRefError, setVisualRefError] = useState<string | null>(null);
  const [copiedHexColor, setCopiedHexColor] = useState<string | null>(null);
  const [previewModalImage, setPreviewModalImage] = useState<string | null>(null);
  const visualFileInputRef = useRef<HTMLInputElement | null>(null);

  const processVisualReferenceFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      const err = lang === 'ar' ? 'يرجى اختيار ملف صورة صالح (JPEG, PNG, WEBP)' : 'Please upload a valid image file (JPEG, PNG, WEBP)';
      setVisualRefError(err);
      showToast(err, true);
      return;
    }

    setVisualRefError(null);
    setIsAnalyzingVisualRef(true);

    try {
      // Read file as Data URL
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Compress/resize if larger than 1200px to ensure quick upload
      const optimizedImage = await new Promise<string>((resolve) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1200;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL(file.type || 'image/jpeg', 0.85));
          } else {
            resolve(dataUrl);
          }
        };
        img.onerror = () => resolve(dataUrl);
        img.src = dataUrl;
      });

      const response = await fetch('/api/analyze-visual-reference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: optimizedImage,
          mimeType: file.type || 'image/jpeg',
          targetPlatform: model
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze reference image');
      }

      const newRef: VisualReferenceAnalysis = {
        image: optimizedImage,
        mimeType: file.type || 'image/jpeg',
        visualDescriptionAr: data.visualDescriptionAr || '',
        visualDescriptionEn: data.visualDescriptionEn || '',
        styleSnippet: data.styleSnippet || '',
        attributes: data.attributes || {
          medium: 'Cinematic Visual',
          lighting: 'Ambient',
          camera: 'Standard',
          composition: 'Balanced',
          mood: 'Atmospheric',
          palette: ['#2D3748', '#C29B40']
        },
        promptSnippet: data.promptSnippet || data.visualDescriptionEn || '',
        fileName: file.name,
        isFallback: data.isFallback
      };

      setVisualRef(newRef);
      setAutoEmbedVisualDescription(true);

      // Auto-tune category if currently default content
      if (category === 'content') {
        setCategory('visual');
        setModel('midjourney');
      }

      showToast(
        lang === 'ar'
          ? '✓ تم استخراج الوصف البصري بنجاح وجاهز للتضمين التلقائي!'
          : '✓ Visual description extracted & ready for automatic embedding!',
        false
      );
    } catch (err: any) {
      console.error('Visual reference analysis error:', err);
      const msg = lang === 'ar' ? 'تعذر تحليل الصورة المرجعية. يرجى المحاولة مرة أخرى.' : 'Failed to analyze reference image. Please try again.';
      setVisualRefError(msg);
      showToast(msg, true);
    } finally {
      setIsAnalyzingVisualRef(false);
    }
  }, [lang, category, model]);

  const handleVisualRefDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverVisualRef(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processVisualReferenceFile(e.dataTransfer.files[0]);
    }
  }, [processVisualReferenceFile]);

  const handleVisualRefDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverVisualRef(true);
  }, []);

  const handleVisualRefDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverVisualRef(false);
  }, []);

  const handleInsertVisualDescriptionIntoConcept = useCallback(() => {
    if (!visualRef) return;
    const textToInsert = lang === 'ar' 
      ? `\n\n[الوصف البصري المستخرج من الصورة المرجعية]: ${visualRef.visualDescriptionAr}\n[الأسلوب البصري المحدد]: ${visualRef.styleSnippet}`
      : `\n\n[Visual Description from Reference]: ${visualRef.visualDescriptionEn}\n[Style]: ${visualRef.styleSnippet}`;
    
    setConcept((prev) => prev.trim() ? `${prev.trim()}\n${textToInsert}` : textToInsert.trim());
    showToast(lang === 'ar' ? '✓ تم إدراج الوصف البصري في حقل الفكرة!' : '✓ Inserted visual description into concept!', false);
  }, [visualRef, lang]);

  const handleCopyHexColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHexColor(hex);
    showToast(lang === 'ar' ? `✓ تم نسخ كود اللون: ${hex}` : `✓ Copied color code: ${hex}`);
    setTimeout(() => setCopiedHexColor(null), 2000);
  };

  const fetchSuggestedTags = useCallback(async (textToAnalyze: string, targetCategory: string) => {
    if (!textToAnalyze || textToAnalyze.trim().length < 5) return;
    setIsSuggestingTags(true);
    try {
      const res = await fetch('/api/suggest-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptText: textToAnalyze,
          category: targetCategory,
          language: lang,
        }),
      });
      const data = await res.json();
      if (Array.isArray(data.tags) && data.tags.length > 0) {
        setSuggestedTags(data.tags);
        setSelectedTags((prev) => (prev.length === 0 ? data.tags.slice(0, 3) : prev));
      }
    } catch (err) {
      console.warn('Failed to fetch auto tags:', err);
    } finally {
      setIsSuggestingTags(false);
    }
  }, [lang]);

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) => 
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const removeTag = useCallback((tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
  }, []);

  const handleAddCustomTag = useCallback(() => {
    const clean = customTagInput.trim().replace(/^#/, '');
    if (clean && !selectedTags.includes(clean)) {
      setSelectedTags((prev) => [...prev, clean]);
      setSuggestedTags((prev) => Array.from(new Set([...prev, clean])));
      setCustomTagInput('');
    }
  }, [customTagInput, selectedTags]);

  const handleManualSave = useCallback(() => {
    if (!currentResult.trim()) return;
    if (onLogPrompt) {
      onLogPrompt({
        originalText: concept || (lang === 'ar' ? 'مسودة مخصصة يدوياً' : 'Manual customized draft'),
        optimizedText: currentResult,
        model,
        tone,
        category,
        actionType: 'refine',
        isFallback: false,
        tags: selectedTags,
        styleImage: visualRef?.image || null
      });
      const successMsg = lang === 'ar' ? '✓ تم الحفظ بنجاح!' : '✓ Saved successfully!';
      setSaveNotification(successMsg);
      setTimeout(() => setSaveNotification(''), 3000);
    }
  }, [currentResult, onLogPrompt, concept, lang, model, tone, category, selectedTags, visualRef]);

  const handleGenerate = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!concept.trim()) return;

    const quota = checkGenerationQuota();
    if (!quota.allowed) {
      setErrorMsg(
        lang === 'ar'
          ? `🛑 لقد استهلكت كامل حصتك اليومية من طلبات الـ API (${quota.max} طلباً). يرجى ترقية باقتك للاستمرار فوراً.`
          : `🛑 You have exhausted your daily API quota (${quota.max} requests). Please upgrade to continue immediately.`
      );
      window.dispatchEvent(new CustomEvent('quota-threshold-reached', {
        detail: { threshold: 100, used: quota.max, remaining: 0, max: quota.max, plan: quota.plan }
      }));
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setCurrentResult('');

    try {
      const visualDescPayload = (visualRef && autoEmbedVisualDescription)
        ? `${visualRef.visualDescriptionEn}\nStyle Directive: ${visualRef.styleSnippet}`
        : undefined;

      const response = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawConcept: concept,
          model,
          tone,
          category,
          language,
          useClarificationLoop,
          visualDescription: visualDescPayload
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'فشل التوليد. يرجى مراجعة إعدادات الخادم.');
      }
      
      const formattedPrompt = appendSiteUrlToPrompt(data.optimizedPrompt);
      setCurrentResult(formattedPrompt);
      
      // Auto-analyze and suggest tags via Gemini
      fetchSuggestedTags(formattedPrompt, category);

      if (onLogPrompt) {
        onLogPrompt({
          originalText: concept,
          optimizedText: formattedPrompt,
          model,
          tone,
          category,
          actionType: 'generate',
          isFallback: data.isFallback,
          tags: selectedTags,
          styleImage: visualRef?.image || null
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ غير متوقع أثناء الاتصال بالخادم.');
    } finally {
      setLoading(false);
    }
  }, [concept, model, tone, category, language, useClarificationLoop, onLogPrompt, fetchSuggestedTags, selectedTags, visualRef, autoEmbedVisualDescription]);

  // Bulk Generation Execution
  const handleBulkGenerate = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (parsedBulkTopics.length === 0) return;

    const quota = checkGenerationQuota();
    if (!quota.allowed) {
      setErrorMsg(
        lang === 'ar'
          ? `🛑 لقد استهلكت كامل حصتك اليومية من طلبات الـ API (${quota.max} طلباً). يرجى ترقية باقتك للاستمرار.`
          : `🛑 You have exhausted your daily API quota (${quota.max} requests). Please upgrade.`
      );
      window.dispatchEvent(new CustomEvent('quota-threshold-reached', {
        detail: { threshold: 100, used: quota.max, remaining: 0, max: quota.max, plan: quota.plan }
      }));
      return;
    }

    setIsBulkGenerating(true);
    setErrorMsg('');

    // Pre-populate items
    const initialItems = parsedBulkTopics.map((topic, index) => ({
      id: `bulk-${Date.now()}-${index}`,
      topic,
      prompt: '',
      status: 'pending' as const,
    }));
    setBulkResults(initialItems);
    setBulkProgress({ current: 0, total: initialItems.length });

    const visualDescPayload = (visualRef && autoEmbedVisualDescription)
      ? `${visualRef.visualDescriptionEn}\nStyle Directive: ${visualRef.styleSnippet}`
      : undefined;

    // Process topics sequentially with live feedback
    for (let i = 0; i < initialItems.length; i++) {
      const item = initialItems[i];
      setBulkProgress({ current: i + 1, total: initialItems.length });

      // Set active item status
      setBulkResults((prev) =>
        prev.map((r, idx) => (idx === i ? { ...r, status: 'generating' } : r))
      );

      try {
        const topicCategory = detectCategoryFromText(item.topic) || category;
        const response = await fetch('/api/generate-prompt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rawConcept: item.topic,
            model,
            tone,
            category: topicCategory,
            language,
            useClarificationLoop,
            visualDescription: visualDescPayload
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to generate prompt');
        }

        const formatted = appendSiteUrlToPrompt(data.optimizedPrompt || data.enhancedPrompt || data.originalPrompt);

        setBulkResults((prev) =>
          prev.map((r, idx) => (idx === i ? { ...r, prompt: formatted, status: 'completed' } : r))
        );

        if (onLogPrompt) {
          onLogPrompt({
            originalText: item.topic,
            optimizedText: formatted,
            model,
            tone,
            category: topicCategory,
            actionType: 'generate',
            tags: selectedTags,
            styleImage: visualRef?.image || null
          });
        }
      } catch (err: any) {
        console.warn(`Error generating bulk item ${i}:`, err);
        setBulkResults((prev) =>
          prev.map((r, idx) => (idx === i ? { ...r, status: 'error', error: err?.message || 'Error generating' } : r))
        );
      }
    }

    setIsBulkGenerating(false);
    showToast(
      lang === 'ar'
        ? `✓ تم الانتهاء من توليد دفعة الأوامر (${initialItems.length} مواضيع)!`
        : `✓ Batch generation completed (${initialItems.length} topics)!`,
      false
    );
  }, [parsedBulkTopics, model, tone, category, language, useClarificationLoop, visualRef, autoEmbedVisualDescription, onLogPrompt, selectedTags, lang]);

  const handleCopyAllBulk = useCallback(() => {
    const completed = bulkResults.filter((r) => r.status === 'completed' && r.prompt);
    if (completed.length === 0) return;

    const combinedText = completed.map((r, idx) => 
      `==============================\n# [${idx + 1}] Topic: ${r.topic}\n==============================\n\n${r.prompt}\n`
    ).join('\n\n');

    navigator.clipboard.writeText(appendSiteUrlToPrompt(combinedText));
    setBulkCopiedAll(true);
    showToast(lang === 'ar' ? `✓ تم نسخ جميع الأوامر المكتملة (${completed.length})!` : `✓ Copied all (${completed.length}) prompts!`);
    setTimeout(() => setBulkCopiedAll(false), 2500);
  }, [bulkResults, lang]);

  const handleExportBulkTxt = useCallback(() => {
    const completed = bulkResults.filter((r) => r.status === 'completed' && r.prompt);
    if (completed.length === 0) return;

    const combinedText = completed.map((r, idx) => 
      `==============================\n# [${idx + 1}] Topic: ${r.topic}\n==============================\n\n${r.prompt}\n`
    ).join('\n\n');

    const blob = new Blob([appendSiteUrlToPrompt(combinedText)], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arabiprompt-bulk-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(lang === 'ar' ? '✓ تم تصدير الملف النصي بنجاح!' : '✓ Exported TXT file successfully!');
  }, [bulkResults, lang]);

  const handleCopySingleBulk = useCallback((id: string, text: string) => {
    navigator.clipboard.writeText(appendSiteUrlToPrompt(text));
    setBulkCopiedId(id);
    showToast(lang === 'ar' ? '✓ تم نسخ الأمر للحافظة!' : '✓ Prompt copied!');
    setTimeout(() => setBulkCopiedId(null), 2000);
  }, [lang]);

  const handleLoadSampleBulkTopics = useCallback(() => {
    const sample = lang === 'ar'
      ? 'استراتيجية تسويق رقمي لمنتج تقني جديد, تطبيق إدارة مهام بـ React و TypeScript, خطة تحسين سيو SEO متقدمة لموقع تجاري, فكرة سيناريو فيلم خيال علمي قصير'
      : 'Digital marketing launch strategy for SaaS, Interactive Task management app in React, Comprehensive e-commerce SEO plan, Sci-fi cinematic short film concept';
    setBulkInput(sample);
  }, [lang]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (concept.trim() && !loading) {
          e.preventDefault();
          handleGenerate();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        if (currentResult.trim()) {
          e.preventDefault();
          handleManualSave();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [concept, loading, currentResult, handleGenerate, handleManualSave]);

  const handleRefine = useCallback(async () => {
    if (!currentResult.trim()) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/refine-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftPrompt: currentResult,
          refinementGoal: lang === 'ar' ? 'أضف المزيد من الحالات والقيود السلبية لمنع الهلوسة' : 'Add negative restrictions and few-shot formatting rules'
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'فشل التعديل.');
      }

      const formattedRefined = appendSiteUrlToPrompt(data.refinedPrompt);
      setCurrentResult(formattedRefined);
      fetchSuggestedTags(formattedRefined, category);
      if (onLogPrompt) {
        onLogPrompt({
          originalText: currentResult,
          optimizedText: formattedRefined,
          model,
          tone,
          category,
          actionType: 'refine',
          isFallback: data.isFallback,
          tags: selectedTags
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'فشلت عملية التحسين اللاحق.');
    } finally {
      setLoading(false);
    }
  }, [currentResult, lang, onLogPrompt, model, tone, category, fetchSuggestedTags, selectedTags]);

  const handleTranslateToEnglish = useCallback(async () => {
    if (!currentResult.trim()) return;

    setIsTranslating(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/translate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          arabicPrompt: currentResult,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'فشلت الترجمة وتوسعة الأمر.');
      }

      const formattedTranslated = appendSiteUrlToPrompt(data.translatedPrompt);
      setCurrentResult(formattedTranslated);
      fetchSuggestedTags(formattedTranslated, category);
      if (onLogPrompt) {
        onLogPrompt({
          originalText: currentResult,
          optimizedText: formattedTranslated,
          model,
          tone,
          category,
          actionType: 'translate',
          isFallback: data.isFallback,
          tags: selectedTags
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء صياغة النسخة الإنجليزية للأمر.');
    } finally {
      setIsTranslating(false);
    }
  }, [currentResult, onLogPrompt, model, tone, category, fetchSuggestedTags, selectedTags]);

  const handleCopy = useCallback(() => {
    if (!currentResult) return;
    navigator.clipboard.writeText(appendSiteUrlToPrompt(currentResult));
    setCopied(true);
    showToast(lang === 'ar' ? '✓ تم النسخ بنجاح للحافظة مع رابط المنصة!' : '✓ Prompt copied to clipboard with ArabPrompt link!');
    setTimeout(() => setCopied(false), 2000);
  }, [currentResult, lang]);

  return (
    <div id="prompt-builder-panel" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Input Configuration Panel (7 / 12 width) */}
        <section className="xl:col-span-7 bg-white rounded-2xl border border-stone-200 shadow-sm p-5 sm:p-8 transition-all hover:border-[#c29b40]/30 duration-300">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 border-b border-stone-100 pb-4">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#c29b40]" />
              <h3 className="text-lg font-bold text-stone-800">
                {lang === 'ar' ? '1. إعداد وصياغة سياق الفكرة المبتكرة' : '1. Define the Core Objectives'}
              </h3>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {onNavigateToTemplates && (
                <button
                  type="button"
                  onClick={onNavigateToTemplates}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-600 text-purple-700 hover:text-white dark:text-purple-300 dark:hover:text-white transition-all text-xs font-bold border border-purple-500/25 cursor-pointer shadow-2xs group"
                  title={lang === 'ar' ? 'استعراض قوالب جاهزة لمجالات الـ SEO، التسويق، والبرمجة' : 'Browse pre-engineered templates'}
                >
                  <LayoutTemplate className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 group-hover:text-white transition-colors" />
                  <span>{lang === 'ar' ? 'قوالب جاهزة' : 'Templates'}</span>
                </button>
              )}
              {onNavigateToReverse && (
                <button
                  type="button"
                  onClick={onNavigateToReverse}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-[#c29b40] text-[#916a24] hover:text-stone-950 transition-all text-xs font-bold border border-[#c29b40]/25 cursor-pointer shadow-2xs group"
                  title={lang === 'ar' ? 'الانتقال إلى الهندسة العكسية لتحليل الصور واستخراج أوامرها' : 'Switch to Reverse Engineering to extract prompt from image'}
                >
                  <ImageIcon className="w-3.5 h-3.5 text-[#c29b40] group-hover:text-stone-950 transition-colors" />
                  <span>{lang === 'ar' ? 'الهندسة العكسية للصورة' : 'Reverse from Image'}</span>
                  <span className="text-[10px] opacity-75">{lang === 'ar' ? '←' : '→'}</span>
                </button>
              )}
            </div>
          </div>

          <form onSubmit={builderMode === 'bulk' ? handleBulkGenerate : handleGenerate} className="space-y-6">
            
            {/* Generation Mode Selector: Single Prompt vs Bulk Generation */}
            <div className="bg-stone-100 dark:bg-stone-800/70 p-1 rounded-xl border border-stone-200 dark:border-stone-700/80 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setBuilderMode('single')}
                className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  builderMode === 'single'
                    ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs border border-stone-200/80 dark:border-stone-700'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-white/40'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#c29b40]" />
                <span>{lang === 'ar' ? 'توليد منفرد' : 'Single Prompt'}</span>
              </button>
              <button
                type="button"
                onClick={() => setBuilderMode('bulk')}
                className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  builderMode === 'bulk'
                    ? 'bg-gradient-to-r from-[#916a24] to-[#c29b40] text-white shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-white/40'
                }`}
              >
                <ListPlus className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'توليد جماعي / دفعات' : 'Bulk Generation'}</span>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full bg-amber-400 text-stone-950">
                  {lang === 'ar' ? 'جديد' : 'NEW'}
                </span>
              </button>
            </div>

            {/* Input fields based on active builder mode */}
            {builderMode === 'bulk' ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label htmlFor="bulk-topics-input" className="block text-sm font-bold text-stone-700 dark:text-stone-300 font-sans">
                    {lang === 'ar' ? 'قائمة المواضيع لتوليد برومبتات لها (مفصولة بفواصل أو أسطر)' : 'Topics for batch prompt generation (comma or line separated)'}
                  </label>
                  <button
                    type="button"
                    onClick={handleLoadSampleBulkTopics}
                    className="text-xs font-bold text-[#916a24] dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{lang === 'ar' ? 'تحميل أمثلة تجريبية' : 'Load sample topics'}</span>
                  </button>
                </div>

                <textarea
                  id="bulk-topics-input"
                  rows={5}
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  placeholder={
                    lang === 'ar'
                      ? 'اكتب عدة مواضيع مفصولة بفواصل أو سطر جديد، مثلاً:\n1. متجر إلكتروني للملابس الرياضية بالذكاء الاصطناعي\n2. شعار ثلاثي الأبعاد لشركة استشارات تقنية\n3. استراتيجية تحسين محركات البحث SEO لمدونة طبية'
                      : 'Enter multiple topics separated by commas or lines, e.g.:\n1. AI Fitness E-commerce Store\n2. 3D Geometric Logo for Tech Startup\n3. SEO Growth Strategy for Medical Blog'
                  }
                  className="w-full text-sm rounded-xl border border-stone-300 dark:border-stone-700 p-4 focus:outline-none focus:ring-2 focus:ring-[#c29b40]/30 focus:border-[#c29b40] bg-[#fdfdfc] dark:bg-stone-900 text-stone-800 dark:text-stone-100 placeholder-stone-400 font-sans"
                />

                {/* Detected topics chip badges */}
                <div className="p-3 rounded-xl bg-stone-100/90 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-stone-750 dark:text-stone-200 flex items-center gap-1.5">
                      <ListPlus className="w-3.5 h-3.5 text-[#c29b40]" />
                      <span>
                        {lang === 'ar'
                          ? `المواضيع المكتشفة (${parsedBulkTopics.length}):`
                          : `Parsed Topics (${parsedBulkTopics.length}):`}
                      </span>
                    </span>
                    {parsedBulkTopics.length > 0 && (
                      <span className="text-[10px] text-stone-500 font-medium">
                        {lang === 'ar' ? 'توليد وهندسة مخصصة لكل موضوع' : 'Custom engineering per topic'}
                      </span>
                    )}
                  </div>

                  {parsedBulkTopics.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                      {parsedBulkTopics.map((topic, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-750 font-medium shadow-2xs"
                        >
                          <span className="w-4 h-4 rounded-full bg-[#c29b40]/20 text-[#916a24] dark:text-amber-400 text-[10px] font-black flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="max-w-[200px] truncate">{topic}</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-stone-500 italic">
                      {lang === 'ar'
                        ? 'لم يتم إدخال مواضيع بعد. أدخل موضوعين على الأقل في المربع أعلاه أو اضغط "تحميل أمثلة تجريبية".'
                        : 'No topics detected yet. Enter at least two topics above or click "Load sample topics".'}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Main prompt input */}
                <div>
                  <label htmlFor="raw-concept-input" className="block text-sm font-bold text-stone-700 mb-2 font-sans">
                    {lang === 'ar' ? 'فكرة الأمر أو المسودة الأولية بكلماتك البسيطة' : 'Input your raw thoughts, questions or code idea'}
                  </label>

                  <textarea
                    id="raw-concept-input"
                    rows={5}
                    required={builderMode === 'single'}
                    value={concept}
                    onChange={(e) => setConcept(e.target.value)}
                    placeholder={
                      lang === 'ar'
                        ? 'اكتب الفكرة الأساسية هنا... ستقوم المنصة بتحويل شتات الكلمات لأمر معقد يشمل دور الذكاء والتعليمات والقيود.'
                        : 'Describe what you want to achieve, explain in your own native words...'
                    }
                    className="w-full text-sm rounded-xl border border-stone-300 p-4 focus:outline-none focus:ring-2 focus:ring-[#c29b40]/30 focus:border-[#c29b40] bg-[#fdfdfc] text-stone-800 placeholder-stone-400 font-sans"
                  />
                </div>

                {/* Quick Presets tags - disappears when the user starts typing */}
                {!concept.trim() && (
                  <div className="transition-all duration-300 animate-in fade-in">
                    <span className="text-xs font-bold text-stone-500 block mb-2">
                      {lang === 'ar' ? '💡 أفكار مقترحة للبدء السريع:' : '💡 Fast suggestions for playground testing:'}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {ideaPresets.map((preset, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setConcept(lang === 'ar' ? preset.ar : preset.en)}
                          className="text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-[#c29b40]/10 hover:text-[#916a24] text-stone-600 transition-all border border-stone-200 max-w-xs truncate text-right rtl:text-right cursor-pointer"
                        >
                          {lang === 'ar' ? preset.ar : preset.en}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* 📸 Visual Reference Drag & Drop & AI Visual Description Section */}
            <div className="bg-stone-50/90 dark:bg-stone-900/60 rounded-2xl border border-stone-200/90 dark:border-stone-800 p-4 space-y-3 transition-all">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#916a24] to-[#c29b40] text-white flex items-center justify-center shadow-xs">
                    <Camera className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-850 dark:text-stone-100 flex items-center gap-1.5 font-sans">
                      <span>{lang === 'ar' ? 'صورة مرجعية واستخراج الوصف البصري' : 'Visual Reference & Drag & Drop AI Analysis'}</span>
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-amber-500/15 text-[#916a24] dark:text-amber-400 border border-amber-500/20">
                        {lang === 'ar' ? 'تضمين تلقائي ✨' : 'Auto Embed ✨'}
                      </span>
                    </h4>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400">
                      {lang === 'ar'
                        ? 'اسحب صورة هنا لتحليل تفاصيلها البصرية (الإضاءة، العدسة، الألوان) وتضمينها فوراً في البرومبت'
                        : 'Drop an image to extract lighting, camera physics, palette and auto-inject into prompt formulation'}
                    </p>
                  </div>
                </div>

                {visualRef && (
                  <button
                    type="button"
                    onClick={() => {
                      setVisualRef(null);
                      showToast(lang === 'ar' ? 'تمت إزالة الصورة المرجعية' : 'Visual reference removed');
                    }}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer text-xs flex items-center gap-1 font-bold"
                    title={lang === 'ar' ? 'إزالة الصورة المرجعية' : 'Remove reference image'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{lang === 'ar' ? 'إزالة' : 'Remove'}</span>
                  </button>
                )}
              </div>

              {/* Hidden File Input for click-to-upload */}
              <input
                ref={visualFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    processVisualReferenceFile(file);
                  }
                  e.target.value = '';
                }}
              />

              {!visualRef ? (
                /* DROP ZONE (EMPTY STATE) */
                <div
                  onDragOver={handleVisualRefDragOver}
                  onDragLeave={handleVisualRefDragLeave}
                  onDrop={handleVisualRefDrop}
                  onClick={() => visualFileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-xl p-5 sm:p-6 transition-all duration-200 cursor-pointer text-center flex flex-col items-center justify-center gap-2 group ${
                    isDragOverVisualRef
                      ? 'border-[#c29b40] bg-[#c29b40]/15 scale-[1.01] shadow-md ring-2 ring-[#c29b40]/30'
                      : 'border-stone-300 dark:border-stone-700 bg-white/70 dark:bg-stone-850/60 hover:border-[#c29b40]/70 hover:bg-[#c29b40]/5'
                  }`}
                >
                  {isAnalyzingVisualRef ? (
                    <div className="py-2 flex flex-col items-center gap-2 animate-pulse">
                      <RefreshCw className="w-6 h-6 text-[#c29b40] animate-spin" />
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-stone-800 dark:text-stone-100 block">
                          {lang === 'ar' ? 'جاري التحليل البصري العميق عبر Google Gemini...' : 'Analyzing visual DNA via Google Gemini...'}
                        </span>
                        <span className="text-[10px] text-stone-500 dark:text-stone-400">
                          {lang === 'ar' ? 'استخلاص الإضاءة، العدسات، النمط الفني، والألوان السائدة' : 'Extracting lighting, camera optics, medium and palette'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 group-hover:bg-[#c29b40]/15 text-stone-500 group-hover:text-[#916a24] dark:group-hover:text-amber-400 flex items-center justify-center transition shadow-2xs">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-stone-700 dark:text-stone-200 group-hover:text-[#916a24] dark:group-hover:text-amber-400 block transition">
                          {lang === 'ar' ? 'اسحب وأفلت صورة مرجعية هنا أو اضغط للتصفح' : 'Drag & drop a reference image here or click to browse'}
                        </span>
                        <p className="text-[10px] text-stone-400 dark:text-stone-500">
                          {lang === 'ar' ? 'يدعم PNG, JPG, WEBP — لاستخراج "الوصف البصري" وتضمينه تلقائياً في البرومبت' : 'Supports PNG, JPG, WEBP — extracts visual description & auto-embeds into prompt'}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                /* ANALYZED REFERENCE CARD */
                <div className="bg-white dark:bg-stone-850 rounded-xl border border-stone-200 dark:border-stone-750 p-3 sm:p-4 shadow-2xs space-y-3 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row gap-3 items-start">
                    {/* Thumbnail Preview */}
                    <div className="relative group shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 bg-stone-100 shadow-2xs">
                      <img
                        src={visualRef.image}
                        alt="Reference preview"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-200 cursor-pointer"
                        onClick={() => setPreviewModalImage(visualRef.image)}
                      />
                      <button
                        type="button"
                        onClick={() => setPreviewModalImage(visualRef.image)}
                        className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition text-[10px] font-bold gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{lang === 'ar' ? 'تكبير' : 'View'}</span>
                      </button>
                    </div>

                    {/* Extracted Visual Description Text */}
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <span className="text-[11px] font-black text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{lang === 'ar' ? 'تم استخراج الوصف البصري بنجاح' : 'Visual Description Extracted'}</span>
                        </span>
                        {visualRef.fileName && (
                          <span className="text-[10px] text-stone-400 truncate max-w-[150px]">
                            {visualRef.fileName}
                          </span>
                        )}
                      </div>

                      {/* Bilingual Description text box */}
                      <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-[11px] text-stone-700 dark:text-stone-300 leading-relaxed max-h-32 overflow-y-auto font-sans">
                        <p className="font-medium">
                          {lang === 'ar' ? visualRef.visualDescriptionAr : visualRef.visualDescriptionEn}
                        </p>
                        {visualRef.styleSnippet && (
                          <div className="mt-1.5 pt-1.5 border-t border-stone-200/60 dark:border-stone-800 text-[10px] text-[#916a24] dark:text-amber-400 font-mono">
                            <span className="font-bold">{lang === 'ar' ? 'صيغة الأسلوب:' : 'Style Clause:'} </span>
                            <span>{visualRef.styleSnippet}</span>
                          </div>
                        )}
                      </div>

                      {/* Visual Attributes Badges */}
                      <div className="flex flex-wrap gap-1.5 pt-0.5 text-[10px]">
                        {visualRef.attributes?.medium && (
                          <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 font-medium">
                            🎨 {visualRef.attributes.medium}
                          </span>
                        )}
                        {visualRef.attributes?.lighting && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-[#916a24] dark:text-amber-400 border border-amber-500/20 font-medium">
                            ☀️ {visualRef.attributes.lighting}
                          </span>
                        )}
                        {visualRef.attributes?.camera && (
                          <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 font-medium">
                            📷 {visualRef.attributes.camera}
                          </span>
                        )}
                        {visualRef.attributes?.mood && (
                          <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20 font-medium">
                            ✨ {visualRef.attributes.mood}
                          </span>
                        )}
                      </div>

                      {/* Palette Dots */}
                      {visualRef.attributes?.palette && visualRef.attributes.palette.length > 0 && (
                        <div className="flex items-center gap-1.5 pt-1">
                          <span className="text-[10px] text-stone-400 font-bold">{lang === 'ar' ? 'لوحة الألوان:' : 'Palette:'}</span>
                          <div className="flex items-center gap-1">
                            {visualRef.attributes.palette.map((hex, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleCopyHexColor(hex)}
                                style={{ backgroundColor: hex }}
                                className="w-4 h-4 rounded-full border border-stone-300 shadow-2xs hover:scale-125 transition cursor-pointer relative group"
                                title={`Copy ${hex}`}
                              >
                                {copiedHexColor === hex && (
                                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] bg-stone-900 text-white px-1 rounded shadow-xs">✓</span>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions & Auto-Embed Toggle */}
                  <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                    {/* Auto-embed toggle */}
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={autoEmbedVisualDescription}
                        onChange={(e) => setAutoEmbedVisualDescription(e.target.checked)}
                        className="w-4 h-4 rounded text-[#c29b40] focus:ring-[#c29b40] cursor-pointer"
                      />
                      <span className="text-[11px] font-bold text-stone-700 dark:text-stone-300">
                        {lang === 'ar' ? 'تضمين الوصف البصري تلقائياً في صياغة البرومبت' : 'Auto-embed visual description into prompt'}
                      </span>
                    </label>

                    {/* Quick helper buttons */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={handleInsertVisualDescriptionIntoConcept}
                        className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-300 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                        title={lang === 'ar' ? 'إدراج نص الوصف البصري في حقل الفكرة لتعديله يدوياً' : 'Insert visual description text into concept textarea'}
                      >
                        <FileText className="w-3 h-3 text-[#c29b40]" />
                        <span>{lang === 'ar' ? 'إدراج في الفكرة ✍️' : 'Insert into Concept'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setCategory('visual');
                          setModel('midjourney');
                          showToast(lang === 'ar' ? '✓ تم ضبط التصنيف على هندسة بصرية و Midjourney' : '✓ Set to Visual category & Midjourney');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-[#916a24] dark:text-amber-400 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer border border-amber-500/20"
                        title={lang === 'ar' ? 'ضبط النموذج على Midjourney وهندسة الأوامر البصرية' : 'Align model to Midjourney visual generation'}
                      >
                        <Wand2 className="w-3 h-3" />
                        <span>{lang === 'ar' ? 'نمط Midjourney 📸' : 'Midjourney Mode'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => visualFileInputRef.current?.click()}
                        className="px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>{lang === 'ar' ? 'استبدال الصورة' : 'Replace Image'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Selection Grid for tuning options */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <div>
                <div className="flex justify-between items-center mb-1.5 flex-wrap gap-1">
                  <label htmlFor="category-select" className="block text-xs font-bold text-stone-600">
                    {lang === 'ar' ? 'مجال وتصنيف الأمر' : 'Category'}
                  </label>
                  {autoDetectedCategory && (
                    <button
                      type="button"
                      onClick={() => {
                        if (autoDetectedCategory !== category) {
                          setCategory(autoDetectedCategory);
                          if (autoDetectedCategory === 'visual') {
                            setModel('midjourney');
                          }
                          setHasManuallySelected(false);
                          showToast(
                            lang === 'ar' 
                              ? `تم ضبط التصنيف تلقائياً إلى: ${getCategoryLabel(autoDetectedCategory, 'ar')}` 
                              : `Auto-adjusted category to: ${getCategoryLabel(autoDetectedCategory, 'en')}`,
                            false
                          );
                        }
                      }}
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border transition-all cursor-pointer select-none ${
                        autoDetectedCategory === category 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' 
                          : 'bg-amber-50 text-amber-800 border-amber-200/60 hover:bg-amber-100 animate-pulse'
                      }`}
                      title={
                        lang === 'ar'
                          ? 'تم تمييز مجال الفكرة المستهدفة تلقائياً. اضغط لإعادة المزامنة.'
                          : 'Idea intent detected. Click to auto-align selection.'
                      }
                    >
                      <Sparkles className="w-2.5 h-2.5 text-[#c29b40]" />
                      <span>
                        {lang === 'ar' 
                          ? `تم الكشف: ${getCategoryLabel(autoDetectedCategory, 'ar')}` 
                          : `Detected: ${getCategoryLabel(autoDetectedCategory, 'en')}`}
                      </span>
                    </button>
                  )}
                </div>
                <select
                  id="category-select"
                  value={category}
                  onChange={(e) => {
                    const catVal = e.target.value;
                    setCategory(catVal);
                    setHasManuallySelected(true);
                    if (catVal === 'visual') {
                      setModel('midjourney');
                    }
                  }}
                  className="w-full text-xs rounded-xl border border-stone-400 p-3 bg-white focus:outline-none focus:ring-1 focus:ring-[#c29b40] text-stone-800"
                >
                  <option value="content">{lang === 'ar' ? 'كتابة المحتوى والتدوين' : 'Content & Blog'}</option>
                  <option value="marketing">{lang === 'ar' ? 'التسويق والإعلانات' : 'Marketing & Ads'}</option>
                  <option value="tech">{lang === 'ar' ? 'البرمجة والتطوير' : 'Programming & Tech'}</option>
                  <option value="education">{lang === 'ar' ? 'التعليم والتبسيط' : 'Education & Learning'}</option>
                  <option value="productivity">{lang === 'ar' ? 'الإنتاجية والأعمال' : 'Productivity'}</option>
                  <option value="visual">{lang === 'ar' ? 'هندسة الأوامر البصرية 📸' : 'Prompt Architect 📸'}</option>
                </select>
              </div>

              <div>
                <label htmlFor="target-model-select" className="block text-xs font-bold text-stone-600 mb-1.5">
                  {lang === 'ar' ? 'النموذج أو المنصة المستهدفة' : 'Target AI Engine'}
                </label>
                <select
                  id="target-model-select"
                  value={model}
                  onChange={(e) => {
                    const engineVal = e.target.value as ModelType;
                    setModel(engineVal);
                    if (engineVal === 'midjourney') {
                      setCategory('visual');
                    }
                  }}
                  className="w-full text-xs rounded-xl border border-stone-400 p-3 bg-white focus:outline-none focus:ring-1 focus:ring-[#c29b40] text-stone-800"
                >
                  <option value="gemini">Google Gemini (الأمثل للأوامر العامة)</option>
                  <option value="chatgpt">OpenAI ChatGPT (ممتاز للمحتوى التفاعلي)</option>
                  <option value="claude">Anthropic Claude (منطقي فائق التفصيل)</option>
                  <option value="notebooklm">Google NotebookLM (تنظيم المصادر وتوليد نصوص البودكاست)</option>
                  <option value="midjourney">Midjourney / DALL-E (الفن البصري والتصوير)</option>
                  <option value="meta">Meta AI / Llama 3 (أوامر الصور والفيديو والنصوص الذكية)</option>
                </select>
              </div>

              <div>
                <label htmlFor="tone-select" className="block text-xs font-bold text-stone-600 mb-1.5">
                  {lang === 'ar' ? 'نبرة وأسلوب الصياغة' : 'Tone & Delivery'}
                </label>
                <select
                  id="tone-select"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full text-xs rounded-xl border border-stone-400 p-3 bg-white focus:outline-none focus:ring-1 focus:ring-[#c29b40] text-stone-800"
                >
                  {TONE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {lang === 'ar' ? opt.labelAr : opt.labelEn}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* Interactive Improvement / Clarification Loop Toggle */}
            <div className="bg-stone-50/80 dark:bg-stone-900/60 p-4 rounded-2xl border border-stone-200/60 dark:border-stone-800 flex items-start gap-3 transition-all hover:bg-stone-50 dark:hover:bg-stone-900/90 hover:border-stone-300 dark:hover:border-stone-700">
              <input
                id="use-clarification-loop"
                type="checkbox"
                checked={useClarificationLoop}
                onChange={(e) => setUseClarificationLoop(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-stone-300 dark:border-stone-700 dark:bg-stone-800 text-[#c29b40] focus:ring-[#c29b40] cursor-pointer"
              />
              <div className="flex-1">
                <label htmlFor="use-clarification-loop" className="block text-xs font-bold text-stone-800 dark:text-stone-200 cursor-pointer select-none">
                  {lang === 'ar' 
                    ? 'تنشيط ميزة الحوار التفاعلي والتوضيح (Clarification & Interactive Improvement Loop)' 
                    : 'Enable Clarification & Interactive Improvement Loop'}
                </label>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">
                  {lang === 'ar' 
                    ? 'يُجبر البرومبت المولد الذكاء الاصطناعي المستهدف على ألا ينفذ المهمة فوراً، بل يرحب بك ويطرح عليك أسئلة استيضاحية وتنبؤات تحسينية أولاً، ولا يصيغ النتائج إلا بعد ردك للحصول على أعلى مستوى من الدقة.' 
                    : 'Instructs the target AI to greet you and propose prompt enhancements via a diagnostic question before applying the prompt, ensuring peak accuracy.'}
                </p>
              </div>
            </div>

            {/* Interactive "PROMPT ARCHITECT" Panel */}
            {(category === 'visual' || model === 'midjourney') && (
              <div className="bg-amber-500/5 p-5 rounded-2xl border border-amber-500/25 space-y-4">
                <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
                  <span className="p-1 px-2 rounded bg-amber-500/10 text-[#a6802f] text-[10px] font-black">
                     v1.0
                  </span>
                  <h4 className="text-sm font-bold text-stone-800 flex items-center gap-1.5">
                    <span>{lang === 'ar' ? 'محاكي هندسة الأوامر البصرية (Prompt Architect)' : 'Visual Prompt Architect Module'}</span>
                    <span className="text-xs font-normal text-stone-500">{lang === 'ar' ? '📸 سيكولوجية الصورة والـ 7 طبقات' : '📸 Core Image Psychology'}</span>
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Platform */}
                  <div>
                    <label className="block text-[10px] font-bold text-amber-800 mb-1">
                      {lang === 'ar' ? 'المنصة البصرية المستهدفة' : 'Target Visual Platform'}
                    </label>
                    <select
                      value={vPlatform}
                      onChange={(e) => setVPlatform(e.target.value)}
                      className="w-full text-xs rounded-lg border border-stone-300 p-2 bg-white text-stone-800"
                    >
                      <option value="Midjourney v6">Midjourney v6 (اللقطات الفوتوغرافية الفنية الفائقة)</option>
                      <option value="DALL-E 3">DALL-E 3 (الدقة والخطوط العربية وانسجام التفاصيل)</option>
                      <option value="Stable Diffusion">Stable Diffusion (التوليف والأوزان الواقعية العميقة)</option>
                      <option value="Instagram Psychological Caption">Instagram Psychological Caption (النصوص السيكولوجية)</option>
                      <option value="Cinematic Video Doc">Cinematic Video BBC/NatGeo (الحركة وسرد الفيديو)</option>
                    </select>
                  </div>

                  {/* Psychological Mood Selection */}
                  <div>
                    <label className="block text-[10px] font-bold text-amber-800 mb-1">
                      {lang === 'ar' ? 'الحالة السيكولوجية للمصمم (المزاج المعرفي)' : 'Image Psychology Mood'}
                    </label>
                    <select
                      value={vMood}
                      onChange={(e) => setVMood(e.target.value)}
                      className="w-full text-xs rounded-lg border border-stone-300 p-2 bg-white text-stone-800"
                    >
                      <option value="calm">هادئ 🌊 ({lang === 'ar' ? 'تفاصيل عريضة مع هدوء لوني مسالم' : 'Serene, soft tones, peaceful'})</option>
                      <option value="nostalgic">حنين 🌅 ({lang === 'ar' ? 'ألوان دافئة تعيد زمن الذكريات والأناقة' : 'Warm gold portrait, nostalgic feeling'})</option>
                      <option value="enthusiastic">متحمس 🔥 ({lang === 'ar' ? 'ألوان غنية صاخبة تعبّر عن القوة والمغامرة والخلود' : 'Vibrant colors, high energy dynamic'})</option>
                      <option value="bold">جريء ⚡ ({lang === 'ar' ? 'تباين قوي وقاسٍ كسر للرتابة المعتادة' : 'Chiaroscuro, high contrast, nonconforming'})</option>
                      <option value="dreamy">حالم ✨ ({lang === 'ar' ? 'ضباب ناعم شاعري وأطياف السريالية الباستيلية' : 'Surrealist pastel, misty light, whimsical'})</option>
                      <option value="authentic">حقيقي 📸 ({lang === 'ar' ? 'تجميد لحظة شارع طبيعية عفوية تماماً' : 'Candid street scene, organic realism'})</option>
                    </select>
                  </div>

                  {/* Lighting Style selection */}
                  <div>
                    <label className="block text-[10px] font-bold text-amber-800 mb-1">
                      {lang === 'ar' ? 'أسلوب ونوع الإضاءة الفوتوغرافية' : 'Lighting Style'}
                    </label>
                    <select
                      value={vLighting}
                      onChange={(e) => setVLighting(e.target.value)}
                      className="w-full text-xs rounded-lg border border-stone-300 p-2 bg-white text-stone-800"
                    >
                      <option value="Golden Hour">Golden Hour (ذهبي، ناعم ينبض بجمال البشر والمكان)</option>
                      <option value="Blue Hour">Blue Hour (أزرق خافت، غامض ومسالم يبعث على التأمل)</option>
                      <option value="Rembrandt light, high contrast chiaroscuro">Rembrandt chiaroscuro (جانبي فني يبرز الملامح والدراما الإنسانية)</option>
                      <option value="Diffused Natural overcast light">Diffused Natural (طبيعي مشتت غائم يمنح اللقطة أصالة ومصداقية)</option>
                      <option value="Harsh Overhead sun lighting">Harsh Overhead (إضاءة عمودية قوية تحاكي الحياة الواقعية الخشنة)</option>
                      <option value="Neon reflections on rain-slicked concrete">Neon reflections (أضواء النيون البراقة المنعكسة على الأسطح المبللة)</option>
                    </select>
                  </div>

                  {/* Composition details */}
                  <div>
                    <label className="block text-[10px] font-bold text-amber-800 mb-1">
                      {lang === 'ar' ? 'التكوين الإخراجي والزاوية الكاميرية' : 'Shot Composition'}
                    </label>
                    <select
                      value={vComposition}
                      onChange={(e) => setVComposition(e.target.value)}
                      className="w-full text-xs rounded-lg border border-stone-300 p-2 bg-white text-stone-800"
                    >
                      <option value="close-up intimate portrait">Close-up portrait (بورتريه سردي ضيق يغوص في تعابير الوجه والعيون)</option>
                      <option value="environmental portrait capturing subject and surroundings">Environmental portrait (بورتريه متوسط يربط الإنسان ببيئته الجغرافية)</option>
                      <option value="extreme wide establishing drone shot">Extreme wide shot (لقطة تأسيسية واسعة جداً تعكس الحجم والمكان)</option>
                      <option value="low-angle heroic epic cinematic perspective">Low-angle perspective (زاوية كاميرا منخفضة تمنح الموضوع فخامة وقوة)</option>
                      <option value="centered symmetrical rule of thirds composition">Centered symmetrical (تكوين مركزي متناظر يعكس الهدوء والتركيز)</option>
                    </select>
                  </div>

                  {/* Gear specifications */}
                  <div>
                    <label className="block text-[10px] font-bold text-amber-800 mb-1">
                      {lang === 'ar' ? 'الكاميرا الكلاسيكية ونوع شريط الفيلم' : 'Camera Gear & Film Stock'}
                    </label>
                    <select
                      value={vGear}
                      onChange={(e) => setVGear(e.target.value)}
                      className="w-full text-xs rounded-lg border border-stone-300 p-2 bg-white text-stone-800"
                    >
                      <option value="shot on Leica M6, 35mm lens, Kodak Portra 400 film">Leica M6 + Portra 400 (كلاسيكي تناظري، نعومة بشرة وحبيبات رائعة)</option>
                      <option value="shot on Hasselblad 500C, Fujifilm Velvia 50 film">Hasselblad 500C + Fujifilm Velvia (تفاصيل متناهية الدقة وجودة طبيعة عتيقة)</option>
                      <option value="shot on Sony A7R IV with premium FE 85mm f/1.4 GM lens">Sony A7R IV + 85mm f/1.4 (عزل خلفية بورتيريه حاد وعصري للغاية)</option>
                      <option value="shot on vintage camera with CineStill 800T tungsen, anamorphic lens">CineStill 800T + Anamorphic (مشاهد الليل الحضرية وأطياف هولو سينمائية)</option>
                      <option value="shot on analog camera, Ilford HP5 Plus 400 black and white film">Ilford HP5 at 400 ISO (أبيض وأسود عتيق متبادل روعة الوثائقيات)</option>
                    </select>
                  </div>

                  {/* Major photographer style inspiration */}
                  <div>
                    <label className="block text-[10px] font-bold text-amber-800 mb-1">
                      {lang === 'ar' ? 'المصور العالمي الملهم (أسلوب الرؤية)' : 'Reference Photography Style'}
                    </label>
                    <select
                      value={vPhotographer}
                      onChange={(e) => setVPhotographer(e.target.value)}
                      className="w-full text-xs rounded-lg border border-stone-300 p-2 bg-white text-stone-800"
                    >
                      <option value="Steve McCurry photography style">Steve McCurry ({lang === 'ar' ? 'ألوان غنية صادقة، ومشاعر تروي القصص' : 'Deep storyteller, vibrant colors'})</option>
                      <option value="Sebastião Salgado social documentary style">Sebastião Salgado ({lang === 'ar' ? 'أبيض وأسود كبرياء الإنسانية والبيئة الواسعة' : 'Towering b&w human documentary'})</option>
                      <option value="Vivian Maier vintage street documentary style">Vivian Maier ({lang === 'ar' ? 'لقطات شارع عفوية رائعة ولحظات غير مرئية' : 'Nostalgic, candid street capture'})</option>
                      <option value="Saul Leiter poetic street reflections style">Saul Leiter ({lang === 'ar' ? 'ألوان شاعرة من وراء نوافذ المطر وضبابية الأسطح' : 'Poetic framing, moody color abstracts'})</option>
                      <option value="Henri Cartier-Bresson decisive moment style">Henri Cartier-Bresson ({lang === 'ar' ? 'اللحظة الحاسمة، تجميد الحركة بقمة انسجامها' : 'Candid decisive moment rhythm'})</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const pSetup = {
                        'Midjourney v6': `--ar 4:5 --style raw --v 6`,
                        'DALL-E 3': `detailed, photorealistic, professional photography, Hasselblad f/2.8`,
                        'Stable Diffusion': `high contrast, sharp focus, 8k resolution`,
                        'Instagram Psychological Caption': `Instagram post format`,
                        'Cinematic Video Doc': `documentary movement, ultra realistic`
                      }[vPlatform] || ``;

                      const mappedMoodText = {
                        calm: 'quiet contemplation, emotional serene and peaceful 🌊',
                        nostalgic: 'bathed in golden nostalgia, old stories and warm longing 🌅',
                        enthusiastic: 'highly energetic, dramatic action and fiery dynamics 🔥',
                        bold: 'unflinching contrast, rule breaker, bold and unique ⚡',
                        dreamy: 'ethereal pastel tones, romantic misty softness ✨',
                        authentic: 'candid capturing, unposed reality and authentic raw feeling 📸'
                      }[vMood] || vMood;

                      const builtSpecs = `A professionally crafted [Subject/الموضوع] in ${vComposition}, set in a detailed [Environment/البيئة] during ${vLighting}, ${vGear}, styled in ${vPhotographer}, conveying a mood of ${mappedMoodText}, engineered for ${vPlatform} ${pSetup}`;

                      if (!concept.trim()) {
                        setConcept(builtSpecs);
                      } else {
                        setConcept(prev => `${prev}\n\n[Prompt Architect Specs]:\n${builtSpecs}`);
                      }
                    }}
                    className="w-full py-2 bg-[#c29b40]/10 text-[#9c7524] hover:bg-[#c29b40]/20 border border-[#c29b40]/30 rounded-lg text-xs font-black transition-all text-center flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>🎯 {lang === 'ar' ? 'دمج معايير التصوير الفوتوغرافي وصياغة الفكرة' : 'Apply Prompt Architect Specs to Concept Box'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Output language options */}
            <div className="border-t border-stone-100 dark:border-stone-800 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                    {t.targetLangLabel}
                  </span>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400">
                    {t.targetLangSub}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-stone-100 dark:bg-stone-900/80 p-1.5 rounded-xl border border-stone-200 dark:border-stone-800">
                {SUPPORTED_LANGUAGES.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => setLanguage(item.code)}
                    className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      language === item.code
                        ? 'bg-white dark:bg-stone-800 text-[#916a24] dark:text-amber-400 shadow-sm border border-[#c29b40]/30 font-black'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-white/50 dark:hover:bg-stone-800/50'
                    }`}
                  >
                    <span>{item.flag}</span>
                    <span>{item.nativeName}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action submit */}
            {builderMode === 'bulk' ? (
              <button
                id="generate-bulk-submit"
                type="submit"
                disabled={isBulkGenerating || parsedBulkTopics.length === 0}
                className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isBulkGenerating || parsedBulkTopics.length === 0
                    ? 'bg-stone-300 dark:bg-stone-800/80 text-stone-500 dark:text-stone-500 border border-transparent dark:border-stone-700/60 cursor-not-allowed shadow-none'
                    : 'bg-gradient-to-r from-[#916a24] via-[#c29b40] to-[#b38d35] hover:opacity-95 shadow-[#c29b40]/25 text-white font-black'
                }`}
              >
                {isBulkGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>
                      {lang === 'ar'
                        ? `جاري توليد الدفعة (${bulkProgress.current} من ${bulkProgress.total})...`
                        : `Generating Batch (${bulkProgress.current}/${bulkProgress.total})...`}
                    </span>
                  </>
                ) : (
                  <>
                    <ListPlus className="w-4 h-4 text-white" />
                    <span>
                      {lang === 'ar'
                        ? `بدء التوليد الجماعي (${parsedBulkTopics.length} برومبت)`
                        : `Generate All Batch Prompts (${parsedBulkTopics.length})`}
                    </span>
                  </>
                )}
              </button>
            ) : (
              <button
                id="generate-prompt-submit"
                type="submit"
                disabled={loading || !concept.trim()}
                className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  loading || !concept.trim()
                    ? 'bg-stone-300 dark:bg-stone-800/80 text-stone-500 dark:text-stone-500 border border-transparent dark:border-stone-700/60 cursor-not-allowed shadow-none'
                    : 'bg-[#c29b40] hover:bg-[#a6802f] shadow-[#c29b40]/20 text-stone-950 font-black'
                }`}
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>{lang === 'ar' ? 'يرجى الانتظار، جاري هندسة وتثبيت المدخلات...' : 'Engineering custom input tokens...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-white" />
                    <span>{lang === 'ar' ? 'توليد وهندسة البرومبت (Ctrl+Enter)' : 'Synthesize and Engineer Prompt (Ctrl+Enter)'}</span>
                  </>
                )}
              </button>
            )}

          </form>
        </section>

        {/* Display Output Workspace Screen (5 / 12 width) */}
        <section className="xl:col-span-5 bg-stone-50 rounded-2xl border border-stone-200 p-5 sm:p-8 min-h-[400px] flex flex-col justify-between relative">
          
          {builderMode === 'bulk' ? (
            <div className="flex-1 flex flex-col justify-between">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-4 border-b border-stone-200/60 pb-3">
                  <div className="flex items-center gap-2 text-stone-700">
                    <ListPlus className="w-4 h-4 text-[#c29b40]" />
                    <span className="text-xs font-bold tracking-wider">
                      {lang === 'ar' ? '2. مخرجات التوليد الجماعي (Bulk Results)' : '2. Bulk Generation Results'}
                    </span>
                  </div>
                  {bulkResults.length > 0 && (
                    <span className="text-[10px] font-bold text-stone-700 px-2 py-0.5 bg-stone-100 rounded-full border border-stone-200">
                      {bulkResults.filter((r) => r.status === 'completed').length} / {bulkResults.length}{' '}
                      {lang === 'ar' ? 'مكتمل' : 'completed'}
                    </span>
                  )}
                </div>

                {/* Bulk Action Toolbar */}
                {bulkResults.length > 0 && (
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-stone-100/90 border border-stone-200">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleCopyAllBulk}
                        disabled={bulkResults.filter((r) => r.status === 'completed').length === 0}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-[#c29b40] hover:bg-[#a6802f] text-stone-950 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {bulkCopiedAll ? (
                          <>
                            <CheckCheck className="w-3.5 h-3.5" />
                            <span>{lang === 'ar' ? 'تم نسخ الكل!' : 'All Copied!'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>{lang === 'ar' ? 'نسخ كافة الأوامر' : 'Copy All'}</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleExportBulkTxt}
                        disabled={bulkResults.filter((r) => r.status === 'completed').length === 0}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-white hover:bg-stone-50 text-stone-700 border border-stone-300 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FileDown className="w-3.5 h-3.5 text-stone-500" />
                        <span>{lang === 'ar' ? 'تصدير كملف TXT' : 'Export TXT'}</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setBulkResults([]);
                        setBulkProgress({ current: 0, total: 0 });
                      }}
                      disabled={isBulkGenerating}
                      className="text-[11px] font-bold text-stone-500 hover:text-rose-600 transition-colors px-2 py-1 cursor-pointer disabled:opacity-50"
                    >
                      {lang === 'ar' ? 'مسح القائمة' : 'Clear List'}
                    </button>
                  </div>
                )}

                {/* Progress Bar when Generating */}
                {isBulkGenerating && (
                  <div className="mb-4 p-4 rounded-xl bg-amber-500/10 border border-[#c29b40]/30 space-y-2.5 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                      <span className="flex items-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 text-[#c29b40] animate-spin" />
                        <span>
                          {lang === 'ar'
                            ? `جاري توليد الأمر (${bulkProgress.current} من ${bulkProgress.total})...`
                            : `Generating prompt (${bulkProgress.current} of ${bulkProgress.total})...`}
                        </span>
                      </span>
                      <span className="font-mono text-[#916a24]">
                        {Math.round((bulkProgress.current / Math.max(bulkProgress.total, 1)) * 100)}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#916a24] to-[#c29b40] transition-all duration-300"
                        style={{
                          width: `${Math.round((bulkProgress.current / Math.max(bulkProgress.total, 1)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Empty state */}
                {bulkResults.length === 0 && !isBulkGenerating && (
                  <div className="py-14 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-[#c29b40] flex items-center justify-center mx-auto">
                      <ListPlus className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-stone-700">
                      {lang === 'ar' ? 'لوحة التوليد الجماعي للأوامر' : 'Bulk Generation Dashboard'}
                    </h3>
                    <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                      {lang === 'ar'
                        ? 'أدخل قائمة مواضيع مفصولة بفواصل أو أسطر في النموذج الجانبي، ثم انقر على "بدء التوليد الجماعي" لتوليد حزمة أوامر هندسية متكاملة بضغطة زر واحدة.'
                        : 'Enter a comma or newline-separated list of topics in the left form and click "Generate All Batch Prompts" to synthesize multiple prompts at once.'}
                    </p>
                    <button
                      type="button"
                      onClick={handleLoadSampleBulkTopics}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-200/80 hover:bg-stone-300 text-stone-800 text-xs font-bold transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#c29b40]" />
                      <span>{lang === 'ar' ? 'تجربة مواضيع جاهزة' : 'Try sample topics'}</span>
                    </button>
                  </div>
                )}

                {/* Bulk Results List */}
                {bulkResults.length > 0 && (
                  <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
                    {bulkResults.map((item, idx) => {
                      const isExpanded = bulkExpandedId === item.id || (!bulkExpandedId && idx === 0);
                      return (
                        <div
                          key={item.id}
                          className="rounded-xl border border-stone-200 bg-white shadow-2xs overflow-hidden transition-all"
                        >
                          {/* Card Header */}
                          <div
                            onClick={() => setBulkExpandedId(isExpanded ? null : item.id)}
                            className="p-3 bg-stone-50/80 hover:bg-stone-100/80 flex items-center justify-between gap-2 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-5 h-5 rounded-full bg-[#c29b40]/20 text-[#916a24] text-[11px] font-black flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <span className="text-xs font-bold text-stone-800 truncate">
                                {item.topic}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {/* Status badge */}
                              {item.status === 'completed' && (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Check className="w-3 h-3" />
                                  <span>{lang === 'ar' ? 'جاهز' : 'Ready'}</span>
                                </span>
                              )}
                              {item.status === 'generating' && (
                                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                  <span>{lang === 'ar' ? 'جاري التوليد...' : 'Generating...'}</span>
                                </span>
                              )}
                              {item.status === 'error' && (
                                <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                                  {lang === 'ar' ? 'خطأ' : 'Error'}
                                </span>
                              )}
                              {item.status === 'pending' && (
                                <span className="text-[10px] font-bold text-stone-500 bg-stone-200/80 px-2 py-0.5 rounded-full">
                                  {lang === 'ar' ? 'قيد الانتظار' : 'Pending'}
                                </span>
                              )}

                              {/* Copy button */}
                              {item.status === 'completed' && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopySingleBulk(item.prompt, item.id);
                                  }}
                                  className="p-1.5 rounded-lg bg-stone-200 hover:bg-[#c29b40] hover:text-stone-950 text-stone-700 transition-colors cursor-pointer"
                                  title={lang === 'ar' ? 'نسخ هذا البرومبت' : 'Copy this prompt'}
                                >
                                  {bulkCopiedId === item.id ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              )}

                              {/* Send to Playground / Tester button */}
                              {item.status === 'completed' && onSendToTester && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSendToTester(item.prompt);
                                  }}
                                  className="p-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-700 transition-colors cursor-pointer"
                                  title={lang === 'ar' ? 'تجربة في المختبر' : 'Test in Playground'}
                                >
                                  <Send className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Expand toggle */}
                              <button
                                type="button"
                                className="p-1 text-stone-400 hover:text-stone-700 transition-colors"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Card Body */}
                          {isExpanded && (
                            <div className="p-3 border-t border-stone-100 text-xs text-stone-700 bg-white">
                              {item.status === 'completed' ? (
                                <div className="space-y-2">
                                  <pre className="whitespace-pre-wrap font-sans text-xs bg-stone-50 p-3 rounded-lg border border-stone-200/70 max-h-60 overflow-y-auto leading-relaxed select-all">
                                    {item.prompt}
                                  </pre>
                                  <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                                    <span>
                                      {lang === 'ar'
                                        ? `الطول: ${item.prompt.length} حرف | الكلمات: ${item.prompt.split(/\s+/).filter(Boolean).length}`
                                        : `Length: ${item.prompt.length} chars | Words: ${item.prompt.split(/\s+/).filter(Boolean).length}`}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleCopySingleBulk(item.prompt, item.id)}
                                      className="font-bold text-[#916a24] hover:underline flex items-center gap-1 cursor-pointer"
                                    >
                                      <Copy className="w-3 h-3" />
                                      <span>
                                        {bulkCopiedId === item.id
                                          ? (lang === 'ar' ? 'تم النسخ!' : 'Copied!')
                                          : (lang === 'ar' ? 'نسخ البرومبت' : 'Copy prompt')}
                                      </span>
                                    </button>
                                  </div>
                                </div>
                              ) : item.status === 'generating' ? (
                                <div className="py-4 flex items-center justify-center gap-2 text-stone-500 animate-pulse">
                                  <RefreshCw className="w-4 h-4 animate-spin text-[#c29b40]" />
                                  <span>{lang === 'ar' ? 'جاري الصياغة بواسطة الذكاء الاصطناعي...' : 'Synthesizing with AI...'}</span>
                                </div>
                              ) : item.status === 'error' ? (
                                <div className="text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                                  <span className="font-bold">{lang === 'ar' ? 'خطأ:' : 'Error:'}</span> {item.error || 'فشل التوليد لهذا الموضوع'}
                                </div>
                              ) : (
                                <div className="text-stone-400 italic py-2 text-center">
                                  {lang === 'ar' ? 'في انتظار دوره في طابور المعالجة...' : 'Waiting in generation queue...'}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-stone-200/60 pb-3">
                  <div className="flex items-center gap-2 text-stone-700">
                    <Cpu className="w-4 h-4 text-[#c29b40]" />
                    <span className="text-xs font-bold tracking-wider">
                      {lang === 'ar' ? '2. مخرجات جودة هندسة الأوامر الحالية' : '2. Engineered Output Workspace'}
                    </span>
                  </div>
                  {saveNotification ? (
                    <span className="text-[10px] font-black text-emerald-800 px-2.5 py-0.5 bg-emerald-100 rounded-full border border-emerald-300 animate-pulse">
                      {saveNotification}
                    </span>
                  ) : currentResult ? (
                    <span className="text-[10px] font-bold text-emerald-700 px-2 py-0.5 bg-emerald-100 rounded-full">
                      {lang === 'ar' ? 'برومبت جاهز' : 'Output compiled'}
                    </span>
                  ) : null}
                </div>

                {/* Loading Pulse Frame with AdSense Banner and Support Request Notice */}
                {loading && (
                  <div className="flex-1 flex flex-col items-center justify-center py-6 px-2 text-center space-y-4">
                    
                    {/* Top Spinner with Prominent "انتظر" Header */}
                    <div className="flex flex-col items-center space-y-2">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-full border-4 border-[#c29b40]/25 border-t-[#c29b40] animate-spin" />
                        <Sparkles className="w-6 h-6 text-[#c29b40] absolute inset-0 m-auto animate-pulse" />
                      </div>
                      
                      {/* Prominent "انتظر" Badge / Title */}
                      <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500/15 border border-[#c29b40]/35 text-[#916a24] dark:text-amber-400 font-black text-xs sm:text-sm shadow-xs animate-pulse">
                        <span>⏳</span>
                        <span>{lang === 'ar' ? 'انتظر... جاري تصميم وهندسة البرومبت' : 'Please wait... Engineering your prompt'}</span>
                      </div>

                      <p className="text-xs font-bold text-stone-700 dark:text-stone-300">
                        {lang === 'ar' ? 'جاري الصياغة الفلسفية للأمر بواسطة Gemini...' : 'Structuring rules, variable boundaries, and personas...'}
                      </p>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 max-w-sm">
                        {lang === 'ar' ? 'نقوم بكتابة الهياكل البرمجية والتعليقات والقيود المناسبة لتصغير الهلوسة.' : 'Refining target variables to prevent incorrect answers.'}
                      </p>
                    </div>

                    {/* Support Request Banner - طلب الدعم بمشاهدة الإشهار */}
                    <div className="w-full max-w-md mx-auto p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#c29b40]/15 to-amber-500/10 border border-[#c29b40]/40 shadow-xs text-center space-y-2 animate-in fade-in">
                      <div className="flex items-center justify-center gap-1.5 text-xs font-black text-[#916a24] dark:text-amber-400">
                        <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
                        <span>
                          {lang === 'ar' 
                            ? 'طلب دعم: مشاهدتك للإشهار تدعم استمرار المنصة مجاناً ❤️' 
                            : 'Support Us: Viewing this ad keeps ArabPrompt 100% free ❤️'}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed font-medium">
                        {lang === 'ar' 
                          ? 'منصة «عرب برومبت» مجانية تماماً وبدون اشتراكات إجبارية. دعمك البسيط بمشاهدة هذا الإعلان أثناء إعداد وهندسة البرومبت يساعدنا على تغطية تكاليف الاستضافة ونماذج الذكاء الاصطناعي.' 
                          : 'ArabPrompt is completely free. Your kind support by watching this advertisement while your prompt is engineered helps cover our server and AI model costs.'}
                      </p>
                      <div className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 dark:text-amber-200 bg-amber-200/60 dark:bg-amber-950/60 px-3 py-1 rounded-full border border-amber-400/40">
                        <span>👁️</span>
                        <span>{lang === 'ar' ? 'شكراً لمشاهدتك ودعمك الكريم!' : 'Thank you for watching and supporting!'}</span>
                      </div>
                    </div>

                    {/* Google AdSense Banner displayed directly during prompt generation */}
                    <div className="w-full max-w-md mx-auto">
                      <AdSenseBanner
                        client="ca-pub-3312377428939400"
                        lang={lang}
                        showPlaceholderBadge={true}
                        minHeight={110}
                      />
                    </div>

                    {/* Progress Bar indicator */}
                    <div className="w-48 h-1.5 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#916a24] via-[#c29b40] to-amber-400 rounded-full animate-pulse w-3/4" />
                    </div>
                  </div>
                )}

                {/* Error Message Box */}
                {errorMsg && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 text-xs font-medium flex items-start gap-2.5 mb-4 font-sans">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">{lang === 'ar' ? 'خطأ تقني:' : 'Gemini Error:'}</span> {errorMsg}
                      <p className="text-[10px] text-rose-500 mt-1">
                        {lang === 'ar' ? 'يرجى مراجعة إدخال مفتاح الـ API في قائمة "Settings" بالأعلى إذا لم يتم توفيره.' : 'Verify process credentials if locally simulating the server.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Empty fallback screen */}
                {!loading && !currentResult && !errorMsg && (
                  <div className="flex-1 flex flex-col items-center justify-center py-12 text-stone-400 text-center">
                    <Sparkles className="w-10 h-10 text-stone-300 mb-3" />
                    <p className="text-xs font-bold text-stone-600">
                      {lang === 'ar' ? 'بانتظار الصياغة والتوليد المباشر' : 'Your engineered prompt appears here'}
                    </p>
                    <p className="text-[11px] text-stone-400 max-w-xs mt-1">
                      {lang === 'ar'
                        ? 'يرجى ملء تفاصيل الفكرة في القائمة الجانبية ثم النقر على "توليد" ليظهر لك الكود المحسن للنسخ المباشر.'
                        : 'Specify an idea or a prompt draft in the left configurations panel, then click generating.'}
                    </p>
                  </div>
                )}

                {/* Render result text */}
                {!loading && currentResult && (
                  <div className="flex-1 flex flex-col justify-between">
                    
                    {/* Visual Reference Integration Indicator */}
                    {visualRef && autoEmbedVisualDescription && (
                      <div className="mb-3 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500/15 via-[#c29b40]/20 to-amber-500/15 border border-[#c29b40]/30 text-[11px] text-[#916a24] dark:text-amber-400 font-bold flex items-center justify-between gap-2 shadow-2xs">
                        <div className="flex items-center gap-2">
                          <Camera className="w-4 h-4 text-[#c29b40] shrink-0" />
                          <span>
                            {lang === 'ar' 
                              ? 'تم تضمين الوصف البصري والخصائص المستخلصة من صورتك المرجعية في هذا البرومبت' 
                              : 'Visual description & DNA from reference image embedded in this prompt'}
                          </span>
                        </div>
                        {visualRef.attributes?.medium && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/80 dark:bg-stone-850 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                            {visualRef.attributes.medium}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Real-time Prompt Quality Score Diagnostics */}
                    <PromptQualityScore promptText={currentResult} lang={lang} />

                    {/* Output Scroll area */}
                    <VariableHighlighterEditor
                      value={currentResult}
                      onChange={setCurrentResult}
                      dir={language === 'ar' ? 'rtl' : 'ltr'}
                      lang={lang}
                      placeholder={lang === 'ar' ? 'هنا سيظهر البرومبت الهندسي...' : 'System prompt appears here...'}
                    />
                    <p className="text-[10px] text-stone-500 mt-2 text-right rtl:text-right">
                      {lang === 'ar' 
                        ? '💡 يمكنك تعديل البرومبت مباشرة! المتغيرات المحاطة بـ [ ] سيتم إبرازها تلقائياً بوضوح.' 
                        : '💡 Click inside to edit the prompt! Variables enclosed in [ ] are automatically highlighted.'
                      }
                    </p>

                    {/* AI Auto-Tagging & Taxonomy Manager */}
                    <div className="mt-3.5 p-3 rounded-xl bg-stone-100/90 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300 text-xs font-bold">
                          <Tag className="w-3.5 h-3.5 text-[#c29b40]" />
                          <span>{lang === 'ar' ? 'الوسوم التنظيمية الذكية (Smart Tags):' : 'Organizational Tags:'}</span>
                          {selectedTags.length > 0 && (
                            <span className="text-[10px] font-mono bg-[#c29b40]/20 text-[#916a24] dark:text-amber-300 px-1.5 py-0.5 rounded-full font-bold">
                              {selectedTags.length}
                            </span>
                          )}
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => fetchSuggestedTags(currentResult || concept, category)}
                          disabled={isSuggestingTags}
                          className="text-[11px] font-bold text-[#916a24] hover:text-[#78551b] dark:text-amber-400 flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-[#c29b40]/10 transition-all cursor-pointer"
                          title={lang === 'ar' ? 'إعادة تحليل واقتراح وسوم بالذكاء الاصطناعي' : 'Re-analyze and suggest tags with Gemini'}
                        >
                          <Sparkles className={`w-3 h-3 ${isSuggestingTags ? 'animate-spin text-[#c29b40]' : 'text-[#c29b40]'}`} />
                          <span>{isSuggestingTags ? (lang === 'ar' ? 'جاري التحليل...' : 'Analyzing...') : (lang === 'ar' ? 'اقتراح وسوم AI' : 'Auto-Suggest Tags')}</span>
                        </button>
                      </div>

                      {/* Tag pills list */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {Array.from(new Set([...selectedTags, ...suggestedTags])).map((tag) => {
                          const isSelected = selectedTags.includes(tag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => toggleTag(tag)}
                              className={`text-xs px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer border ${
                                isSelected
                                  ? 'bg-[#c29b40] text-stone-950 border-[#b38d35] shadow-xs'
                                  : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-300 dark:border-stone-700 hover:border-stone-400 hover:bg-stone-50'
                              }`}
                            >
                              {isSelected ? <Check className="w-3 h-3 text-stone-950" /> : <Hash className="w-3 h-3 text-stone-400" />}
                              <span>{tag}</span>
                              {isSelected && (
                                <span
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeTag(tag);
                                  }}
                                  className="hover:text-rose-700 ml-0.5 cursor-pointer"
                                  title={lang === 'ar' ? 'إزالة' : 'Remove'}
                                >
                                  <X className="w-2.5 h-2.5" />
                                </span>
                              )}
                            </button>
                          );
                        })}

                        {/* Custom Tag Input */}
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={customTagInput}
                            onChange={(e) => setCustomTagInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddCustomTag();
                              }
                            }}
                            placeholder={lang === 'ar' ? '+ أضف وسماً...' : '+ Add tag...'}
                            className="text-[11px] px-2 py-1 rounded-lg border border-dashed border-stone-300 dark:border-stone-700 bg-white/80 dark:bg-stone-800/80 focus:bg-white focus:outline-none focus:border-[#c29b40] w-24 text-stone-700 dark:text-stone-200 placeholder-stone-400"
                          />
                          {customTagInput.trim() && (
                            <button
                              type="button"
                              onClick={handleAddCustomTag}
                              className="p-1 rounded-md bg-[#c29b40] text-stone-950 text-xs font-bold hover:bg-[#a6802f] transition-all cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Polish adjustments Actions */}
                    <div className="mt-4 pt-3 border-t border-stone-200/60 flex flex-col md:flex-row gap-3 items-stretch md:items-center md:justify-between">
                      
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          id="refine-prompt-btn"
                          onClick={handleRefine}
                          disabled={loading}
                          className="px-3.5 py-2.5 sm:py-1.5 text-xs font-bold rounded-lg border border-[#c29b40]/30 hover:border-[#c29b40] text-stone-800 hover:text-[#916a24] bg-white transition-all flex items-center justify-center gap-1.5 w-full sm:w-auto cursor-pointer"
                        >
                          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                          <span>{lang === 'ar' ? 'تلميع وضبط إضافي' : 'Auto Polish'}</span>
                        </button>

                        <button
                          id="translate-prompt-btn"
                          onClick={handleTranslateToEnglish}
                          disabled={isTranslating}
                          className="px-3.5 py-2.5 sm:py-1.5 text-xs font-bold rounded-lg border border-[#c29b40]/30 hover:border-[#c29b40] text-stone-800 hover:text-[#916a24] bg-white transition-all flex items-center justify-center gap-1.5 w-full sm:w-auto cursor-pointer"
                        >
                          <Globe className="w-3.5 h-3.5 text-stone-500" />
                          <span>{lang === 'ar' ? 'تعريب فوري (Ar -> En)' : 'Optimize code to English version'}</span>
                        </button>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        {/* Share to AI Tools Button */}
                        <button
                          id="share-ai-prompt-btn"
                          type="button"
                          onClick={() => setIsShareAiModalOpen(true)}
                          className="px-3.5 py-2.5 font-bold text-xs text-white bg-gradient-to-r from-[#916a24] via-[#c29b40] to-[#b38d35] hover:opacity-95 rounded-lg transition-all flex items-center justify-center gap-1.5 w-full sm:w-auto cursor-pointer shadow-xs border border-[#b38d35]"
                          title={lang === 'ar' ? 'مشاركة وفتح البرومبت في جيمني، شات جي بي تي، كلود...' : 'Share to Gemini, ChatGPT, Claude...'}
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>{lang === 'ar' ? 'مشاركة مع أدوات الذكاء' : 'Share to AI'}</span>
                        </button>

                        <button
                          id="copy-prompt-btn"
                          onClick={handleCopy}
                          className="px-3.5 py-2.5 font-bold text-xs text-stone-700 bg-stone-200 hover:bg-stone-300 rounded-lg transition-all flex items-center justify-center gap-1 w-full sm:w-auto cursor-pointer"
                        >
                          {copied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-700" />
                              <span className="text-emerald-700">تم النسخ!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>نسخ البرومبت</span>
                            </>
                          )}
                        </button>

                        <button
                          id="manual-save-prompt-btn"
                          onClick={handleManualSave}
                          className="px-3.5 py-2.5 font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all flex items-center justify-center gap-1 w-full sm:w-auto cursor-pointer"
                          title={lang === 'ar' ? 'حفظ في السجل (Ctrl+S)' : 'Save to History (Ctrl+S)'}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{lang === 'ar' ? 'حفظ (Ctrl+S)' : 'Save (Ctrl+S)'}</span>
                        </button>
                      </div>

                    </div>

                  </div>
                )}
              </div>
            </div>
          )}

          {/* AdSense Unit / Smart Fallback Wrapper */}
          <div className="pt-2">
            <AdSensePlaceholder
              client="ca-pub-3312377428939400"
              lang={lang}
              format="horizontal"
              responsive={true}
              showStatusBadge={true}
              minHeight={110}
            />
          </div>

        </section>

      </div>

      {/* Share to AI Tools Modal */}
      <SharePromptToAiModal
        isOpen={isShareAiModalOpen}
        onClose={() => setIsShareAiModalOpen(false)}
        promptText={currentResult}
        lang={lang}
        model={model}
        tone={tone}
      />

      {/* Visual Reference Zoom Preview Modal */}
      {previewModalImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setPreviewModalImage(null)}
        >
          <div
            className="relative max-w-3xl max-h-[85vh] bg-white dark:bg-stone-900 p-2.5 rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#c29b40]" />
                <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  {lang === 'ar' ? 'معاينة الصورة المرجعية' : 'Reference Image Preview'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModalImage(null)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 flex items-center justify-center">
              <img
                src={previewModalImage}
                alt="Full reference preview"
                className="max-h-[72vh] max-w-full rounded-2xl object-contain shadow-sm"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default React.memo(PromptBuilder);
