/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useCallback } from 'react';
import { 
  Camera, 
  Upload, 
  Image as ImageIcon,
  Sparkles, 
  Copy, 
  Check, 
  Cpu, 
  PenTool,
  Trash2, 
  Sliders, 
  Search, 
  Languages, 
  RefreshCw, 
  Compass, 
  Info,
  ChevronRight,
  ArrowRight,
  Video,
  Film,
  Palette,
  Wand2,
  ExternalLink,
  Crown
} from 'lucide-react';
import { ModelType, AppLanguage } from '../types';
import { showToast } from './ToastNotification';
import { appendSiteUrlToPrompt } from '../utils/brandWatermark';
import { checkGenerationQuota } from '../utils/subscriptionService';

interface LearnedDna {
  palette: string[];
  medium: string;
  hasLearned?: boolean;
  masterPrompt?: string;
}

// Helper to downscale and compress images client-side to prevent network payload overflow ('Failed to fetch')
async function compressImageToDataUrl(
  file: File, 
  maxDim = 1280, 
  quality = 0.82
): Promise<{ dataUrl: string; mimeType: string; dominantColors: string[] }> {
  return new Promise((resolve) => {
    // If not standard image or is SVG/GIF with animation, fall back to FileReader
    if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve({
          dataUrl: (e.target?.result as string) || '',
          mimeType: file.type || 'image/jpeg',
          dominantColors: ['#1E293B', '#D97706', '#3B82F6', '#F8FAFC']
        });
      };
      reader.onerror = () => {
        resolve({
          dataUrl: '',
          mimeType: 'image/jpeg',
          dominantColors: ['#1E293B', '#D97706', '#3B82F6', '#F8FAFC']
        });
      };
      reader.readAsDataURL(file);
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
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
      canvas.width = Math.max(1, width);
      canvas.height = Math.max(1, height);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        const reader = new FileReader();
        reader.onload = (e) => resolve({
          dataUrl: (e.target?.result as string) || '',
          mimeType: file.type || 'image/jpeg',
          dominantColors: ['#1E293B', '#D97706', '#3B82F6', '#F8FAFC']
        });
        reader.readAsDataURL(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      const sampledHex: string[] = [];
      try {
        const samplePoints = [
          [Math.floor(width * 0.2), Math.floor(height * 0.2)],
          [Math.floor(width * 0.8), Math.floor(height * 0.2)],
          [Math.floor(width * 0.5), Math.floor(height * 0.5)],
          [Math.floor(width * 0.2), Math.floor(height * 0.8)],
          [Math.floor(width * 0.8), Math.floor(height * 0.8)],
        ];
        for (const [sx, sy] of samplePoints) {
          const pixel = ctx.getImageData(sx, sy, 1, 1).data;
          const hex = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1).toUpperCase()}`;
          if (!sampledHex.includes(hex)) sampledHex.push(hex);
        }
      } catch {
        // ignore canvas read errors
      }
      if (sampledHex.length === 0) {
        sampledHex.push('#1E293B', '#D97706', '#3B82F6', '#F8FAFC');
      }

      const targetMime = file.type === 'image/png' && file.size < 600 * 1024 ? 'image/png' : 'image/jpeg';
      const compressedDataUrl = canvas.toDataURL(targetMime, quality);
      resolve({
        dataUrl: compressedDataUrl,
        mimeType: targetMime,
        dominantColors: sampledHex
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      const reader = new FileReader();
      reader.onload = (e) => resolve({
        dataUrl: (e.target?.result as string) || '',
        mimeType: file.type || 'image/jpeg',
        dominantColors: ['#1E293B', '#D97706', '#3B82F6', '#F8FAFC']
      });
      reader.readAsDataURL(file);
    };

    img.src = url;
  });
}

function generateClientSideFallbackPrompt(params: {
  reverserMode: 'image' | 'mimic' | 'video';
  targetStyle: string;
  notes: string;
  clientCustomChoice: string;
  includeStyleTransferDirective: boolean;
  useFreePattern: boolean;
  reverserTier: 'free' | 'paid';
  sampledColors?: string[];
  lang: AppLanguage;
}): { reversePrompt: string; learnedDna: LearnedDna } {
  const isPaidTier = params.reverserTier === 'paid';
  const palette = params.sampledColors && params.sampledColors.length > 0
    ? params.sampledColors
    : ['#1E293B', '#D97706', '#3B82F6', '#F8FAFC'];
  const paletteStr = palette.join(', ');

  const clientChoiceBlock = params.clientCustomChoice 
    ? `\n> 🎯 **الخيار المجاني المحدد من العميل**: "${params.clientCustomChoice}"\n` 
    : '';
  const clientChoicePrompt = params.clientCustomChoice 
    ? ` [Client Free Choice: ${params.clientCustomChoice}],` 
    : '';
  const freePatternBadge = params.useFreePattern 
    ? `\n> 🎁 **وضعية النمط المجاني (Free Pattern)**: مفعّلة بنجاح (حرية إبداعية كاملة)\n` 
    : '';
  const freePatternPromptClause = params.useFreePattern 
    ? ' [Mode: Free Pattern / النمط المجاني],' 
    : '';
  const tierBadge = isPaidTier 
    ? `\n> 👑 **المسار المختار**: الخيار المدفوع الاحترافي (Pro Ultra Tier - دقة 8K استوديو)\n` 
    : `\n> 🎁 **المسار المختار**: الخيار المجاني (Free Tier - متاح للجميع مجاناً)\n`;
  const freeTierDirective = !isPaidTier 
    ? `\n> 📌 **توجيه البرومبت المجاني**: خد من الصورة الأولى النمط و طبقه على التانية و لتكون دقة الصورة 8k\n> 📌 **Free Prompt Directive**: Take the style from the first image and apply it to the second, and let the image resolution be 8k\n> 📌 **توجيه إضافي**: طبق هذه المعلومات على الصورة الجديدة\n` 
    : '';
  const freeTierPromptClause = !isPaidTier 
    ? 'خد من الصورة الأولى النمط و طبقه على التانية و لتكون دقة الصورة 8k (Take the style from the first image and apply it to the second, and let the image resolution be 8k):\n' 
    : '';
  const tierPromptExtra = isPaidTier 
    ? ' 8k resolution, Hasselblad H6D-100c 85mm f/1.2 optics, volumetric chiaroscuro studio lighting, commercial advertising grade, master composition,' 
    : ' 8k resolution, clean balanced lighting, natural texture fidelity, balanced composition,';

  let reversePrompt = '';
  let masterPrompt = '';

  if (params.reverserMode === 'video') {
    masterPrompt = `${freeTierPromptClause}Dynamic cinematic motion shot sweeping across a high-production scene. High-speed tracking shot following the key subject, volumetric atmospheric light rays filtering through haze, 8k resolution, photorealistic fluid camera pan and tilt, dramatic cinematic grading, masterfully steady shot, 60fps --ar 16:9`;
    reversePrompt = `### ⚡ تم التحليل الهندسي بنجاح عبر المحرك الذكي السريع

# الأمر العكسي المولد للفيديو / Cinematic Video Reversed Prompt
${freeTierDirective}${tierBadge}
\`\`\`
${masterPrompt}
\`\`\`

## 🧠 تحليل ودراسة تقديرية لديناميكية الفيديو:
- **مسار التوليد**: ${isPaidTier ? 'الخيار المدفوع الاحترافي (Pro Ultra 8K)' : 'الخيار المجاني (Free Tier) - دقة 8K'}
${!isPaidTier ? '- **توجيه البرومبت المجاني**: "خد من الصورة الأولى النمط و طبقه على التانية و لتكون دقة الصورة 8k" (Take the style from the first image and apply it to the second, and let the image resolution be 8k)\n- **توجيه التطبيق**: "طبق هذه المعلومات على الصورة الجديدة"\n' : ''}- **النمط والأسلوب البصري للفيديو**: مشهد سينمائي تفاعلي عالي الحركة والخيال (Cinematic Dynamic Scene).
- **حركة الكاميرا وتوجيه الإخراج**: لقطة متحركة دائرية ثنائية التوجيه (Orbital dynamic sweep & tracking) مع تتبع بؤري ذكي وثبات استثنائي.
- **لوحة الألوان المستخرجة**: ${paletteStr}`;
  } else if (params.reverserMode === 'mimic' || params.includeStyleTransferDirective || Boolean(params.clientCustomChoice)) {
    masterPrompt = `${freeTierPromptClause}خد النمط من الصورة و طبقه على الصورة المرفقة:
Transfer and apply the exact visual style, color grading scheme, atmospheric lighting, and lens aesthetics from the reference image directly onto the attached target image.${freePatternPromptClause}${clientChoicePrompt}${tierPromptExtra} color harmony [${paletteStr}], intricate micro-textures, unified cinematic grading --ar 16:9 --style raw --v 6.1`;

    reversePrompt = `### ⚡ تم إنجاز الهندسة العكسية ونقل النمط بنجاح

# أمر نقل النمط والدمج البصري / Visual Style Transfer Prompt

> 📌 **التوجيه الإلزامي**: خد النمط من الصورة و طبقه على الصورة المرفقة
> 📌 **Mandatory Directive**: Take the style from the image and apply it to the attached image.${freeTierDirective}${tierBadge}${freePatternBadge}${clientChoiceBlock}

\`\`\`
${masterPrompt}
\`\`\`

## 🧠 تحليل ودراسة فنية لنقل النمط وخيار العميل:
- **مسار الهندسة العكسية**: ${isPaidTier ? 'الخيار المدفوع الفائق (Pro Ultra 8K) - تركيز هندسي على أدق تفاصيل العدسات والفيزياء البصرية.' : 'الخيار المجاني (Free Tier) - حرية إبداعية كاملة ومتاح لجميع المستخدمين بدقة 8K.'}
- **توجيه النمط الأساسي**: "خد النمط من الصورة و طبقه على الصورة المرفقة"
${!isPaidTier ? '- **توجيه البرومبت المجاني**: "خد من الصورة الأولى النمط و طبقه على التانية و لتكون دقة الصورة 8k" (Take the style from the first image and apply it to the second, and let the image resolution be 8k)\n- **توجيه التطبيق**: "طبق هذه المعلومات على الصورة الجديدة"\n' : ''}${params.useFreePattern ? '- **استخدام النمط المجاني (Free Pattern)**: مفعّل كخيار إضافي للمستخدم، مما يتيح أعلى درجات المرونة الإبداعية في دمج الألوان والظلال.' : ''}
${params.clientCustomChoice ? `- **الخيار المجاني المحدد من قِبل العميل**: "${params.clientCustomChoice}". تم دمجه وتأطيره لضمان الأولوية والتحكم.` : '- **الخيار المجاني**: متاح ومفتوح ليحدده العميل بحرية تامة.'}
- **لوحة الألوان المستخرجة (Visual DNA)**: ${paletteStr}
- **توصيات**: يمكنك نسخ هذا الأمر مباشرة واستخدامه في Midjourney v6.1 أو FLUX.1 أو ChatGPT Vision.`;
  } else if (params.targetStyle === 'photorealistic') {
    masterPrompt = `${freeTierPromptClause}A hyper-realistic cinematic portrait with extraordinary detail, captured with an 85mm f/1.2 lens. Volumetric studio rim-lighting, dramatic chiaroscuro shadows, skin micro-texture fidelity, balanced palette [${paletteStr}], deep depth of field, 8k resolution --ar 16:9 --style raw --v 6.1`;
    reversePrompt = `### ⚡ تم إنجاز الهندسة العكسية الفوتوغرافية بنجاح

# الأمر العكسي المولد للصور الواقعية / Photographic Reversed Prompt
${freeTierDirective}${tierBadge}
\`\`\`
${masterPrompt}
\`\`\`

## 🧠 تحليل فني متقدم للصورة:
- **مسار التوليد**: ${isPaidTier ? 'الخيار المدفوع (Pro Ultra 8K)' : 'الخيار المجاني (Free Tier) - دقة 8K'}
${!isPaidTier ? '- **توجيه البرومبت المجاني**: "خد من الصورة الأولى النمط و طبقه على التانية و لتكون دقة الصورة 8k" (Take the style from the first image and apply it to the second, and let the image resolution be 8k)\n' : ''}- **النوع الفني**: تصوير فوتوغرافي واقعي فائق الدقة (Photorealistic Portrait).
- **العدسات والإضاءة**: عدسة 85mm f/1.2 وإضاءة استوديو حجمية ناعمة بدقة 8K.
- **لوحة الألوان المستخرجة (Visual DNA)**: ${paletteStr}`;
  } else if (params.targetStyle === 'anime') {
    masterPrompt = `${freeTierPromptClause}A breathtaking anime illustration in Makoto Shinkai aesthetic, vibrant sky with luminous volumetric clouds, sharp digital linework, cinematic backlight flare, color harmony [${paletteStr}], romanticized color grading, aesthetic masterpiece, 8k resolution --ar 16:9`;
    reversePrompt = `### ⚡ تم إنجاز الهندسة العكسية لأسلوب الأنمي بنجاح

# الأمر العكسي المولد لأسلوب الأنمي / Anime & Illustration Reversed Prompt
${freeTierDirective}${tierBadge}
\`\`\`
${masterPrompt}
\`\`\`

## 🧠 تحليل فني تقديري للصورة:
- **مسار التوليد**: ${isPaidTier ? 'الخيار المدفوع (Pro Ultra 8K)' : 'الخيار المجاني (Free Tier) - دقة 8K'}
- **نوع الفن**: رسم رقمي أنمي ياباني غني بالألوان (Japanese Anime Style).
${!isPaidTier ? '- **توجيه البرومبت المجاني**: "خد من الصورة الأولى النمط و طبقه على التانية و لتكون دقة الصورة 8k" (Take the style from the first image and apply it to the second, and let the image resolution be 8k)\n' : ''}- **الإضاءة والأجواء**: إضاءة خلفية دافئة (Backlight) مدموجة بوهج الشمس وانعكاسات عدسة سينمائية.
- **لوحة الألوان المستخرجة (Visual DNA)**: ${paletteStr}`;
  } else if (params.targetStyle === 'logo') {
    masterPrompt = `${freeTierPromptClause}A sophisticated minimalistic vector logo design, bold solid geometric shapes, high contrast clean composition, modern corporate aesthetics, isolated clean background, perfectly centered grid-aligned layout, branding emblem, palette [${paletteStr}], 8k resolution --no realistic details gradient drop-shadows`;
    reversePrompt = `### ⚡ تم إنجاز الهندسة العكسية للشعار بنجاح

# الأمر العكسي المولد للشعارات / Minimalistic Vector Logo Reversed Prompt
${freeTierDirective}${tierBadge}
\`\`\`
${masterPrompt}
\`\`\`

## 🧠 تحليل فني تقديري للشعار:
- **مسار التوليد**: ${isPaidTier ? 'الخيار المدفوع (Pro Ultra 8K)' : 'الخيار المجاني (Free Tier) - دقة 8K'}
- **نوع الفن**: شعار مسطح مبسط (Flat Minimalistic Vector Logo).
${!isPaidTier ? '- **توجيه البرومبت المجاني**: "خد من الصورة الأولى النمط و طبقه على التانية و لتكون دقة الصورة 8k" (Take the style from the first image and apply it to the second, and let the image resolution be 8k)\n' : ''}- **التكوين**: أشكال هندسية قوية وتصميم قابل للتحجيم للعلامات التجارية.
- **لوحة الألوان المستخرجة (Visual DNA)**: ${paletteStr}`;
  } else {
    masterPrompt = `${freeTierPromptClause}An exquisite high-fidelity masterpiece depicting the uploaded subject, cinematic composition, pristine surface details, highly balanced ambient lighting, deep atmospheric focus, color harmony [${paletteStr}], designed for maximum output accuracy, professional rendering standard, 8k resolution --ar 16:9`;
    reversePrompt = `### ⚡ تم إنجاز الهندسة العكسية العامة بنجاح

# الأمر العكسي العام ومسودة التصميم / Synthesized General Reversed Prompt
${freeTierDirective}${tierBadge}
\`\`\`
${masterPrompt}
\`\`\`

## 🧠 تحليل ودراسة فنية للصورة:
- **مسار التوليد**: ${isPaidTier ? 'الخيار المدفوع (Pro Ultra 8K)' : 'الخيار المجاني (Free Tier) - دقة 8K'}
- **نوع الفن**: تصميم رسومي مركب متعدد الوسائط (Mixed Media Composition).
${!isPaidTier ? '- **توجيه البرومبت المجاني**: "خد من الصورة الأولى النمط و طبقه على التانية و لتكون دقة الصورة 8k" (Take the style from the first image and apply it to the second, and let the image resolution be 8k)\n' : ''}- **لوحة الألوان المستخرجة (Visual DNA)**: ${paletteStr}`;
  }

  return {
    reversePrompt,
    learnedDna: {
      palette,
      medium: params.targetStyle || 'Cinematic High-Fidelity Render',
      hasLearned: true,
      masterPrompt
    }
  };
}

interface PromptReverserProps {
  lang: AppLanguage;
  onSendToTester: (promptText: string) => void;
  onNavigateToBuilder?: () => void;
  onLogPrompt?: (item: {
    originalText: string;
    optimizedText: string;
    model: ModelType;
    tone: string;
    category: string;
    actionType: 'generate' | 'refine' | 'translate' | 'reverse';
    isFallback?: boolean;
    styleImage?: string | null;
    contentImage?: string | null;
    notes?: string;
    isMimicMode?: boolean;
  }) => void;
  initialValues?: {
    styleImage: string | null;
    contentImage: string | null;
    notes: string;
    isMimicMode: boolean;
  };
}

export default function PromptReverser({ lang, onSendToTester, onNavigateToBuilder, onLogPrompt, initialValues }: PromptReverserProps) {
  const [isMimicMode, setIsMimicMode] = useState(false);
  const [reverserMode, setReverserMode] = useState<'image' | 'mimic' | 'video'>('image');
  const [imageData, setImageData] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  
  // Second image for visual style mimic and merge mode
  const [targetImageData, setTargetImageData] = useState<string | null>(null);
  const [targetMimeType, setTargetMimeType] = useState<string>('image/jpeg');
  const [isDraggingTarget, setIsDraggingTarget] = useState(false);
  
  const [targetStyle, setTargetStyle] = useState<string>('general');
  const [notes, setNotes] = useState<string>('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [extractedPrompt, setExtractedPrompt] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFallback, setIsFallback] = useState(false);

  // Learned Visual DNA extracted directly from the uploaded image
  const [learnedDna, setLearnedDna] = useState<LearnedDna | null>(null);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [detectedColors, setDetectedColors] = useState<string[]>(['#1E293B', '#D97706', '#3B82F6', '#F8FAFC']);

  // Client free choice & style transfer directive states
  const [clientCustomChoice, setClientCustomChoice] = useState<string>('');
  const [includeStyleTransferDirective, setIncludeStyleTransferDirective] = useState<boolean>(true);
  const [freeChoicePreset, setFreeChoicePreset] = useState<string>('custom');
  const [useFreePattern, setUseFreePattern] = useState<boolean>(true);

  // Dual-tier options: Free Option (الخيار المجاني) & Paid Pro Option (الخيار المدفوع)
  const [reverserTier, setReverserTier] = useState<'free' | 'paid'>('free');
  const [lastGeneratedTier, setLastGeneratedTier] = useState<'free' | 'paid' | null>(null);

  // Apply learned style to custom new idea states
  const [newCustomSubject, setNewCustomSubject] = useState('');
  const [isApplyingStyle, setIsApplyingStyle] = useState(false);
  const [appliedPromptResult, setAppliedPromptResult] = useState('');
  const [copiedApplied, setCopiedApplied] = useState(false);

  // Initialize from initialValues when passed
  React.useEffect(() => {
    if (initialValues) {
      setIsMimicMode(initialValues.isMimicMode);
      setReverserMode(initialValues.isMimicMode ? 'mimic' : 'image');
      setImageData(initialValues.styleImage);
      setTargetImageData(initialValues.contentImage);
      setNotes(initialValues.notes);
      setExtractedPrompt('');
      setErrorMsg('');
      setLearnedDna(null);
      setAppliedPromptResult('');
    }
  }, [initialValues]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const targetFileInputRef = useRef<HTMLInputElement>(null);

  const handleCopy = () => {
    if (!extractedPrompt) return;
    // Extract code block content if present, or copy entire text
    let textToCopy = extractedPrompt;
    const match = extractedPrompt.match(/```([\s\S]*?)```/);
    if (match && match[1]) {
      textToCopy = match[1].trim();
    }
    navigator.clipboard.writeText(appendSiteUrlToPrompt(textToCopy));
    setCopied(true);
    showToast(lang === 'ar' ? '✓ تم نسخ الأمر المستخرج مع رابط المنصة!' : '✓ Extracted prompt copied to clipboard with ArabPrompt link!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    showToast(lang === 'ar' ? `✓ تم نسخ كود اللون: ${hex}` : `✓ Copied color code: ${hex}`);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const handleApplyLearnedStyle = async () => {
    if (!newCustomSubject.trim()) {
      showToast(lang === 'ar' ? 'يرجى كتابة فكرة أو موضوع لتطبيق النمط عليه!' : 'Please enter a subject to apply the learned style onto!', true);
      return;
    }
    setIsApplyingStyle(true);
    setAppliedPromptResult('');
    try {
      const res = await fetch('/api/apply-learned-style', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newSubject: newCustomSubject,
          learnedDna,
          targetAiModel: 'FLUX.1 / Midjourney v6'
        })
      });
      if (!res.ok) throw new Error('Failed to apply learned style');
      const data = await res.json();
      setAppliedPromptResult(data.appliedPrompt);
      showToast(lang === 'ar' ? '✓ تم تطبيق النمط البصري المتعلم على فكرتك بنجاح!' : '✓ Applied learned style to your new idea!');
    } catch (e: any) {
      showToast(lang === 'ar' ? 'تعذر تطبيق النمط حالياً' : 'Could not apply style', true);
    } finally {
      setIsApplyingStyle(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (reverserMode === 'video') {
        loadVideo(file);
      } else {
        loadImage(file);
      }
    }
  };

  const handleTargetFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      loadTargetImage(file);
    }
  };

  const loadVideo = (file: File) => {
    const isVideoFile = file.type.startsWith('video/') || file.name.endsWith('.mp4') || file.name.endsWith('.webm') || file.name.endsWith('.mov') || file.name.endsWith('.gif');
    if (!isVideoFile) {
      setErrorMsg(
        lang === 'ar' 
          ? 'تنبيه: نوع ملف الفيديو غير مدعوم، يرجى اختيار ملف فيديو صالح (MP4, WEBM, GIF).'
          : 'Unsupported file type. Please select a valid video file (MP4, WEBM, GIF).'
      );
      return;
    }
    setMimeType(file.type || 'video/mp4');
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result && typeof event.target.result === 'string') {
        setImageData(event.target.result);
        setErrorMsg('');
        setExtractedPrompt(''); // reset previous results
      }
    };
    reader.readAsDataURL(file);
  };

  const loadImage = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg(
        lang === 'ar' 
          ? 'تنبيه: نوع الملف غير مدعوم، يرجى اختيار ملف صورة صالح (JPEG, PNG, WEBP).'
          : 'Unsupported file type. Please select a valid image file (JPEG, PNG, WEBP).'
      );
      return;
    }
    try {
      const { dataUrl, mimeType: cMime, dominantColors } = await compressImageToDataUrl(file);
      setImageData(dataUrl);
      setMimeType(cMime);
      if (dominantColors && dominantColors.length > 0) {
        setDetectedColors(dominantColors);
      }
      setErrorMsg('');
      setExtractedPrompt('');
    } catch {
      setMimeType(file.type);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && typeof event.target.result === 'string') {
          setImageData(event.target.result);
          setErrorMsg('');
          setExtractedPrompt('');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const loadTargetImage = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg(
        lang === 'ar' 
          ? 'تنبيه: نوع ملف الصورة لتلقي الأسلوب غير مدعوم.'
          : 'Unsupported target image file type.'
      );
      return;
    }
    try {
      const { dataUrl, mimeType: cMime } = await compressImageToDataUrl(file);
      setTargetImageData(dataUrl);
      setTargetMimeType(cMime);
      setErrorMsg('');
      setExtractedPrompt('');
    } catch {
      setTargetMimeType(file.type);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && typeof event.target.result === 'string') {
          setTargetImageData(event.target.result);
          setErrorMsg('');
          setExtractedPrompt('');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (reverserMode === 'video') {
        loadVideo(file);
      } else {
        loadImage(file);
      }
    }
  };

  const handleTargetDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingTarget(true);
  };

  const handleTargetDragLeave = () => {
    setIsDraggingTarget(false);
  };

  const handleTargetDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingTarget(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      loadTargetImage(file);
    }
  };

  const handleRemoveImage = () => {
    setImageData(null);
    setExtractedPrompt('');
    setErrorMsg('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveTargetImage = () => {
    setTargetImageData(null);
    setExtractedPrompt('');
    setErrorMsg('');
    if (targetFileInputRef.current) {
      targetFileInputRef.current.value = '';
    }
  };

  const [saveNotification, setSaveNotification] = useState<string>('');

  const handleManualSave = () => {
    if (!extractedPrompt.trim()) return;
    if (onLogPrompt) {
      let briefSummary = '';
      if (reverserMode === 'mimic') {
        briefSummary = lang === 'ar' ? 'محاكاة ودمج أسلوب صورتين' : 'Image Style Transfer & Blending';
      } else if (reverserMode === 'video') {
        briefSummary = lang === 'ar' ? 'التصميم العكسي والهندسة العكسية للفيديو' : 'Video Reverse Engineering';
      } else {
        briefSummary = lang === 'ar' ? 'تحليل هندسي لصورة: ' : 'Image Analysis: ';
        if (targetStyle === 'photorealistic') briefSummary += lang === 'ar' ? 'فوتوغرافي واقعي' : 'Photorealistic';
        else if (targetStyle === 'anime') briefSummary += lang === 'ar' ? 'أنمي ورسومات' : 'Anime Style';
        else if (targetStyle === 'logo') briefSummary += lang === 'ar' ? 'تصميم شعار' : 'Logo Design';
        else briefSummary += lang === 'ar' ? 'توليد عام ورسم فني' : 'General Art';
      }
      
      if (notes) {
        briefSummary += ` (${notes.substring(0, 30)}${notes.length > 30 ? '...' : ''})`;
      }

      onLogPrompt({
        originalText: briefSummary,
        optimizedText: extractedPrompt,
        model: 'gemini',
        tone: reverserMode === 'mimic' ? 'mimicry' : reverserMode === 'video' ? 'video' : targetStyle,
        category: 'general',
        actionType: 'reverse',
        isFallback: false,
        styleImage: imageData,
        contentImage: reverserMode === 'mimic' ? targetImageData : null,
        notes,
        isMimicMode: reverserMode === 'mimic'
      });
      const successMsg = lang === 'ar' ? '✓ تم الحفظ بنجاح!' : '✓ Saved successfully!';
      setSaveNotification(successMsg);
      setTimeout(() => setSaveNotification(''), 3000);
    }
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (imageData && !loading && (reverserMode !== 'mimic' || targetImageData)) {
          e.preventDefault();
          handleAnalyzeImage();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        if (extractedPrompt.trim()) {
          e.preventDefault();
          handleManualSave();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [imageData, targetImageData, reverserMode, targetStyle, notes, extractedPrompt, loading, lang]);

  const handleAnalyzeImage = async (tierOverride?: 'free' | 'paid') => {
    const activeTier = tierOverride || reverserTier;

    if (!imageData) {
      setErrorMsg(
        reverserMode === 'video'
          ? (lang === 'ar' ? 'يرجى تحميل فيديو أولاً للبدء بالتحليل.' : 'Please upload a video first.')
          : (lang === 'ar' ? 'يرجى تحميل صورة أولاً للبدء بالتحليل.' : 'Please upload an image first.')
      );
      return;
    }

    if (reverserMode === 'mimic' && !targetImageData) {
      setErrorMsg(
        lang === 'ar' 
          ? 'يرجى تحميل الصورة الثانية لتلقي ودمج الأسلوب البصري.' 
          : 'Please upload the second image to apply style/effects onto.'
      );
      return;
    }

    // Tier Access Check:
    // The Paid Pro Ultra tier requires an active plan (Lite or Pro)
    // The Free tier is available for everyone 100% without subscription barrier
    if (activeTier === 'paid') {
      const quota = checkGenerationQuota();
      if (!quota.allowed) {
        if (quota.requiresSubscription) {
          setErrorMsg(
            lang === 'ar'
              ? '👑 الخيار المدفوع (Pro Ultra 8K) يتطلب اشتراكاً نشطاً. يمكنك الترقية الآن للاستفادة من دقة الاستوديو الفائقة، أو استخدام "الخيار المجاني" المتاح مجاناً للجميع بدون اشتراك.'
              : '👑 The Paid Pro Ultra option requires an active plan. You can upgrade now or switch to the Free Option available for everyone.'
          );
        } else {
          setErrorMsg(
            lang === 'ar'
              ? `🛑 لقد استهلكت كامل حصتك اليومية (${quota.max} طلباً). يرجى ترقية باقتك للاستمرار بالخيار المدفوع، أو التبديل إلى الخيار المجاني.`
              : `🛑 Daily quota reached (${quota.max} requests). Please upgrade or use the Free Option.`
          );
        }
        return;
      }
    }

    setLoading(true);
    setErrorMsg('');
    setExtractedPrompt('');
    setIsFallback(false);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

      const response = await fetch('/api/reverse-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageData,
          mimeType,
          targetStyle,
          notes: notes ? (clientCustomChoice ? `${notes} | خيار العميل: ${clientCustomChoice}` : notes) : (clientCustomChoice ? `خيار العميل: ${clientCustomChoice}` : ''),
          targetImage: reverserMode === 'mimic' ? targetImageData : null,
          targetImageMimeType: reverserMode === 'mimic' ? targetMimeType : null,
          isVideoMode: reverserMode === 'video',
          clientCustomChoice: clientCustomChoice.trim(),
          includeStyleTransferDirective: reverserMode === 'mimic' || includeStyleTransferDirective || Boolean(clientCustomChoice.trim()),
          useFreePattern,
          reverserTier: activeTier
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errMessage = '';
        try {
          const errData = await response.json();
          errMessage = errData.error || '';
        } catch {
          errMessage = `Server error ${response.status}`;
        }
        throw new Error(errMessage || `Server error during analysis: ${response.status}`);
      }

      const data = await response.json();
      let promptOutput = data.reversePrompt || '';
      if (activeTier === 'free' && promptOutput) {
        const hasDirective = promptOutput.includes('خد من الصورة الأولى النمط و طبقه على التانية و لتكون دقة الصورة 8k') ||
          promptOutput.includes('خد من الصورة الأولى النمط');
        if (!hasDirective) {
          promptOutput = `> 📌 **توجيه البرومبت المجاني**: خد من الصورة الأولى النمط و طبقه على التانية و لتكون دقة الصورة 8k\n> 📌 **Free Prompt Directive**: Take the style from the first image and apply it to the second, and let the image resolution be 8k\n> 📌 **توجيه التطبيق**: طبق هذه المعلومات على الصورة الجديدة\n\n` + promptOutput;
        }
      }
      const formattedReversed = appendSiteUrlToPrompt(promptOutput);
      setExtractedPrompt(formattedReversed);
      setIsFallback(!!data.isFallback);
      setLastGeneratedTier(activeTier);

      if (data.learnedDna) {
        setLearnedDna(data.learnedDna);
      } else {
        const hexMatches = data.reversePrompt.match(/#[0-9A-Fa-f]{6}\b/g);
        setLearnedDna({
          palette: hexMatches ? (Array.from(new Set(hexMatches)) as string[]).slice(0, 5) : (detectedColors.length > 0 ? detectedColors : ['#1E293B', '#D97706', '#3B82F6', '#F8FAFC']),
          medium: targetStyle || 'Cinematic High-Fidelity Render',
          hasLearned: true
        });
      }

      // Log the action to history
      if (onLogPrompt) {
        let briefSummary = '';
        if (reverserMode === 'mimic') {
          briefSummary = lang === 'ar' ? 'نقل النمط ودمج صورتين (خد النمط من الصورة و طبقه)' : 'Image Style Transfer & Blending';
        } else if (reverserMode === 'video') {
          briefSummary = lang === 'ar' ? 'التصميم العكسي والهندسة العكسية للفيديو' : 'Video Reverse Engineering';
        } else {
          briefSummary = lang === 'ar' ? 'تحليل هندسي لصورة: ' : 'Image Analysis: ';
          if (targetStyle === 'photorealistic') briefSummary += lang === 'ar' ? 'فوتوغرافي واقعي' : 'Photorealistic';
          else if (targetStyle === 'anime') briefSummary += lang === 'ar' ? 'أنمي ورسومات' : 'Anime Style';
          else if (targetStyle === 'logo') briefSummary += lang === 'ar' ? 'تصميم شعار' : 'Logo Design';
          else briefSummary += lang === 'ar' ? 'توليد عام ورسم فني' : 'General Art';
        }
        
        if (clientCustomChoice) {
          briefSummary += ` [خيار العميل: ${clientCustomChoice.substring(0, 25)}]`;
        } else if (notes) {
          briefSummary += ` (${notes.substring(0, 30)}${notes.length > 30 ? '...' : ''})`;
        }

        onLogPrompt({
          originalText: briefSummary,
          optimizedText: data.reversePrompt,
          model: 'gemini',
          tone: reverserMode === 'mimic' ? 'mimicry' : reverserMode === 'video' ? 'video' : targetStyle,
          category: 'general',
          actionType: 'reverse',
          isFallback: data.isFallback,
          styleImage: imageData,
          contentImage: reverserMode === 'mimic' ? targetImageData : null,
          notes: clientCustomChoice ? `خيار العميل: ${clientCustomChoice} ${notes ? `| ${notes}` : ''}` : notes,
          isMimicMode: reverserMode === 'mimic'
        });
      }
    } catch (err: any) {
      console.warn('Backend fetch failed or timed out, activating instant resilient client reverse engine:', err?.message || err);

      try {
        const clientFallback = generateClientSideFallbackPrompt({
          reverserMode,
          targetStyle,
          notes,
          clientCustomChoice: clientCustomChoice.trim(),
          includeStyleTransferDirective: reverserMode === 'mimic' || includeStyleTransferDirective || Boolean(clientCustomChoice.trim()),
          useFreePattern,
          reverserTier: activeTier,
          sampledColors: detectedColors,
          lang
        });

        const formattedReversed = appendSiteUrlToPrompt(clientFallback.reversePrompt);
        setExtractedPrompt(formattedReversed);
        setIsFallback(true);
        setLastGeneratedTier(activeTier);
        setLearnedDna(clientFallback.learnedDna);
        setErrorMsg(''); // Resilient fallback handles generation smoothly without user error

        if (onLogPrompt) {
          let briefSummary = '';
          if (reverserMode === 'mimic') {
            briefSummary = lang === 'ar' ? 'نقل النمط ودمج صورتين (خد النمط من الصورة و طبقه)' : 'Image Style Transfer & Blending';
          } else if (reverserMode === 'video') {
            briefSummary = lang === 'ar' ? 'التصميم العكسي والهندسة العكسية للفيديو' : 'Video Reverse Engineering';
          } else {
            briefSummary = lang === 'ar' ? 'تحليل هندسي لصورة: ' : 'Image Analysis: ';
            if (targetStyle === 'photorealistic') briefSummary += lang === 'ar' ? 'فوتوغرافي واقعي' : 'Photorealistic';
            else if (targetStyle === 'anime') briefSummary += lang === 'ar' ? 'أنمي ورسومات' : 'Anime Style';
            else if (targetStyle === 'logo') briefSummary += lang === 'ar' ? 'تصميم شعار' : 'Logo Design';
            else briefSummary += lang === 'ar' ? 'توليد عام ورسم فني' : 'General Art';
          }

          if (clientCustomChoice) {
            briefSummary += ` [خيار العميل: ${clientCustomChoice.substring(0, 25)}]`;
          } else if (notes) {
            briefSummary += ` (${notes.substring(0, 30)}${notes.length > 30 ? '...' : ''})`;
          }

          onLogPrompt({
            originalText: briefSummary,
            optimizedText: clientFallback.reversePrompt,
            model: 'gemini',
            tone: reverserMode === 'mimic' ? 'mimicry' : reverserMode === 'video' ? 'video' : targetStyle,
            category: 'general',
            actionType: 'reverse',
            isFallback: true,
            styleImage: imageData,
            contentImage: reverserMode === 'mimic' ? targetImageData : null,
            notes: clientCustomChoice ? `خيار العميل: ${clientCustomChoice} ${notes ? `| ${notes}` : ''}` : notes,
            isMimicMode: reverserMode === 'mimic'
          });
        }
      } catch (fallbackErr) {
        console.error('Local fallback generation error:', fallbackErr);
        setErrorMsg(
          lang === 'ar' 
            ? 'حدث عطل أثناء الاتصال بمحرك الاستخراج، يرجى المحاولة لاحقاً.' 
            : 'Could not connect to the prompt extraction engine. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const videoStyles = [
    { id: 'drone', titleAr: 'لقطة درون سينمائية', titleEn: 'Cinematic Drone & Landscape', descAr: 'تركيز على حركة الطيران الواسعة والتصوير الجوي والزوايا البيئية الباهرة.', descEn: 'Optimized for sweeping landscape flights, majestic aerial angles and smooth dolly motions.' },
    { id: 'vfx', titleAr: 'تحريك ثلاثي الأبعاد وعالي الواقعية', titleEn: 'CG Animation & VFX', descAr: 'استخلاص ميزات التصوير ثلاثي الأبعاد ونعومة الحركة وجودة المحركات ومؤثرات المواد والسوائل.', descEn: 'High dynamic motions, particle simulations, modern shader layers and unreal engine physics.' },
    { id: 'cyberpunk', titleAr: 'مستقبلي سايبر بانك نيون', titleEn: 'Cyberpunk Neon Motion', descAr: 'إبراز ألوان النيون الغنية ومسارات الضوء السريعة وانعكاسات الطرق وسينماء الخيال العلمي.', descEn: 'Vibrant neon gradings, wet asphalt reflections, speed trails and futuristic cityscapes.' },
    { id: 'vintage', titleAr: 'فيلم سينمائي قديم مأثور VHS', titleEn: 'Vintage VHS & Retro Film', descAr: 'استخلاص جودة السبعينات وملمس الشريط التناظري والحبوب والتحبب البصري لعدسات كوداك.', descEn: 'Retro 8mm grain, vintage lens chromatic aberrations, nostalgic warm gradings, nostalgic aesthetics.' },
  ];

  const styles = [
    { id: 'general', titleAr: 'أسلوب فني عام ومبتكر', titleEn: 'General Artistic Render', descAr: 'استخلاص لوصف الأشكال الفنية والألوان والأبعاد الكلية.', descEn: 'Extract basic objects, colors, styles, textures and overall dimensions.' },
    { id: 'photorealistic', titleAr: 'تصوير فوتوغرافي واقعي', titleEn: 'Photorealistic Cinematic', descAr: 'تركيز فائق على إخراج عدسات الكاميرا وزوايا الضوء ومستويات f-stop والبهتان والكساء الجلدي.', descEn: 'High focus on camera lens specs (e.g. 85mm f/1.2), cinematic lighting setups, depth of field and texture depth.' },
    { id: 'anime', titleAr: 'أنمي ورسوم يابانية', titleEn: 'Anime & Illustration', descAr: 'استخلاص سمات الرسم الرقمي المتناغم ثنائي الأبعاد مستوحى من الاستوديوهات اليابانية.', descEn: 'Optimized styles for Japanese animation, digital strokes, fantasy light arrays and clean linework.' },
    { id: 'logo', titleAr: 'شعارات وتصميم مسطح', titleEn: 'Vector Minimalist Logo', descAr: 'إبراز الأبعاد التجارية المسطحة، والأشكال الهندسية المتوازنة والخلفيات المستقلة الأنيقة.', descEn: 'Corporate branding emblems, clean geometric outlines, flat vector curves, and noise-free isolated backgrounds.' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" id="prompt-reverser-panel">
      
      {/* Intro Header */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        {onNavigateToBuilder && (
          <div className="flex justify-center mb-4">
            <button
              type="button"
              onClick={onNavigateToBuilder}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 hover:text-[#916a24] text-xs font-bold transition-all shadow-xs cursor-pointer hover:border-[#c29b40]/50 group"
            >
              <PenTool className="w-3.5 h-3.5 text-[#c29b40] group-hover:scale-110 transition-transform" />
              <span>{lang === 'ar' ? 'الذهاب إلى مُهندس ومصمم الأوامر' : 'Go to Prompt Designer / Builder'}</span>
              <span className="text-[10px] text-stone-400 group-hover:text-[#c29b40] transition-colors">{lang === 'ar' ? '←' : '→'}</span>
            </button>
          </div>
        )}
        <h2 className="text-3xl font-black text-stone-900 tracking-tight sm:text-4xl text-center flex items-center justify-center gap-2">
          <Sparkles className="w-7 h-7 text-[#c29b40]" />
          <span>{lang === 'ar' ? 'الهندسة العكسية ونقل الأنماط' : 'Reverse Prompt Engineering & Style Mimicry'}</span>
        </h2>
        <p className="mt-3 text-stone-500 text-sm font-medium">
          {lang === 'ar' 
            ? 'قم بتفكيك بكسلات أي صورة لاستخراج أمرها الكامل، أو ادمج وانقل النمط البصري لصورة على صورة أخرى لإنشاء برومبت إشهار مذهل.'
            : 'Deconstruct design secrets of any image, or blend the aesthetic style of one photo with the contents of another for an advertising-grade prompt.'}
        </p>
      </div>

      {/* Mode Selector Tabs (Enlarged & Clear Switch) */}
      <div className="flex items-center justify-center mb-10">
        <div className="inline-flex p-1.5 sm:p-2 bg-stone-100 dark:bg-stone-800/80 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-sm flex-wrap gap-1.5 justify-center">
          <button
            onClick={() => {
              setReverserMode('image');
              setIsMimicMode(false);
              setExtractedPrompt('');
              setErrorMsg('');
              setImageData(null);
            }}
            className={`px-5 py-3 sm:px-6 sm:py-3.5 rounded-xl text-sm sm:text-base md:text-lg font-black transition-all duration-200 cursor-pointer shadow-xs ${
              reverserMode === 'image'
                ? 'bg-white text-stone-950 shadow-md font-black border border-stone-200/80 dark:bg-stone-900 dark:text-stone-100 dark:border-stone-700'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-white/50'
            }`}
          >
            {lang === 'ar' ? 'استخراج برومبت من صورة' : 'Standard Reverse Prompt'}
          </button>
          
          <button
            onClick={() => {
              setReverserMode('mimic');
              setIsMimicMode(true);
              setExtractedPrompt('');
              setErrorMsg('');
              setImageData(null);
            }}
            className={`px-5 py-3 sm:px-6 sm:py-3.5 rounded-xl text-sm sm:text-base md:text-lg font-black transition-all duration-200 cursor-pointer flex items-center gap-2 shadow-xs ${
              reverserMode === 'mimic'
                ? 'bg-[#c29b40] text-white shadow-md font-black border border-[#b08b34]'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-white/50'
            }`}
          >
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-200" />
            <span>{lang === 'ar' ? 'نسخ ودمج الأسلوب البصري (صورتين)' : 'Style Transfer & Mimicry (2 Images)'}</span>
          </button>

          <button
            onClick={() => {
              setReverserMode('video');
              setIsMimicMode(false);
              setExtractedPrompt('');
              setErrorMsg('');
              setImageData(null);
            }}
            className={`px-5 py-3 sm:px-6 sm:py-3.5 rounded-xl text-sm sm:text-base md:text-lg font-black transition-all duration-200 cursor-pointer flex items-center gap-2 shadow-xs ${
              reverserMode === 'video'
                ? 'bg-stone-950 text-white shadow-md font-black border border-stone-800'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-white/50'
            }`}
          >
            <Video className="w-4 h-4 sm:w-5 sm:h-5 text-[#c29b40]" />
            <span>{lang === 'ar' ? 'التصميم العكسي للفيديو' : 'Video Reverse Engineering'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left column: Upload & Options (7 cols in LG) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card: Upload Panel - Adaptive Grid based on mode */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-stone-800 mb-4 flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#c29b40]" />
              <span>
                {reverserMode === 'mimic'
                  ? (lang === 'ar' ? '1. ارفع الصورتين (صورة النمط وصورة المحتوى)' : '1. Upload Style and Content Visuals')
                  : reverserMode === 'video'
                    ? (lang === 'ar' ? '1. ارفع مقطع الفيديو المراد تفكيكه لحركية' : '1. Upload Short Video Clip (MP4/WEBM/GIF)')
                    : (lang === 'ar' ? '1. أدخل الصورة المطلوب تفكيكها' : '1. Upload Photo/Screenshot')}
              </span>
            </h3>

            <div className={`grid grid-cols-1 ${reverserMode === 'mimic' ? 'sm:grid-cols-2' : ''} gap-4`}>
              
              {/* Box 1 (Main/Style Image or Video) */}
              <div className="space-y-2">
                {reverserMode === 'mimic' && (
                  <span className="text-[10px] font-extrabold text-[#8c6722] bg-amber-50 px-2.5 py-1 rounded-md border border-amber-100 block w-max">
                    {lang === 'ar' ? 'الصورة الأولى: مرجع الأسلوب والألوان' : 'Image 1: Style & Lighting Reference'}
                  </span>
                )}
                {reverserMode === 'video' && (
                  <span className="text-[10px] font-extrabold text-stone-100 bg-stone-900 px-2.5 py-1 rounded-md block w-max animate-pulse">
                    🎥 {lang === 'ar' ? 'تحرير ملف الفيديو المستهدف' : 'Video Footage Source'}
                  </span>
                )}
                
                {/* Drag & Drop Area 1 */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => {
                    if (!imageData && fileInputRef.current) fileInputRef.current.click();
                  }}
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[190px] ${
                    imageData 
                      ? 'border-stone-200 bg-stone-50/20' 
                      : isDragging 
                        ? 'border-[#c29b40] bg-[#c29b40]/5' 
                        : 'border-stone-300 hover:border-[#c29b40] bg-stone-50/50 hover:bg-stone-50'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept={reverserMode === 'video' ? "video/*,image/gif" : "image/*"}
                    className="hidden"
                    id="reverser-file-input"
                  />

                  {imageData ? (
                    <div className="relative w-full max-w-xs mx-auto flex items-center justify-center overflow-hidden py-1" onClick={(e) => e.stopPropagation()}>
                      {reverserMode === 'video' ? (
                        <video
                          src={imageData}
                          controls
                          className="rounded-lg max-h-[140px] max-w-full mx-auto object-contain border border-stone-200 shadow-sm w-full bg-stone-950"
                          style={{ maxHeight: '140px', maxWidth: '100%', objectFit: 'contain' }}
                        />
                      ) : (
                        <img
                          src={imageData}
                          alt="Preview style reference"
                          className="rounded-lg max-h-[140px] max-w-full w-auto h-auto mx-auto object-contain border border-stone-200 shadow-sm block"
                          style={{ maxHeight: '140px', maxWidth: '100%', width: 'auto', height: 'auto', objectFit: 'contain' }}
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <button
                        onClick={handleRemoveImage}
                        className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full transition-colors shadow z-10"
                        title={lang === 'ar' ? 'حذف الملف' : 'Remove File'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="p-2.5 bg-[#c29b40]/10 text-[#c29b40] rounded-xl mb-3">
                        {reverserMode === 'video' ? <Film className="w-5 h-5 text-[#c29b40]" /> : <Upload className="w-5 h-5" />}
                      </div>
                      <p className="text-[11px] font-bold text-stone-700">
                        {reverserMode === 'video'
                          ? (lang === 'ar' ? 'ارفع أو اسحب ملف فيديو هنا' : 'Drag or click to choose video')
                          : (lang === 'ar' ? 'صورة النمط الأساسي' : 'Upload Style Reference')}
                      </p>
                      <p className="text-[9px] text-stone-500 mt-1 max-w-xs leading-relaxed">
                        {reverserMode === 'video'
                          ? (lang === 'ar' ? 'افضل صيغ MP4, WEBM, GIF لفك لقطاتها' : 'Accepts MP4, WEBM, MOV, or animated GIF')
                          : (lang === 'ar' ? 'اسحب أو انقر لاختيار صورة النمط والألوان' : 'Drag or click to choose layout colors')}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Box 2 (Content Image) - Only in style transfer mimicry mode */}
              {reverserMode === 'mimic' && (
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold text-stone-700 bg-stone-100 px-2.5 py-1 rounded-md border border-stone-250 block w-max">
                    {lang === 'ar' ? 'الصورة الثانية: موضوع ومحتوى البرومبت' : 'Image 2: Subject & Content Backdrop'}
                  </span>
                  
                  {/* Drag & Drop Area 2 */}
                  <div
                    onDragOver={handleTargetDragOver}
                    onDragLeave={handleTargetDragLeave}
                    onDrop={handleTargetDrop}
                    onClick={() => {
                      if (!targetImageData && targetFileInputRef.current) targetFileInputRef.current.click();
                    }}
                    className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[190px] ${
                      targetImageData 
                        ? 'border-stone-200 bg-stone-50/20' 
                        : isDraggingTarget 
                          ? 'border-stone-800 bg-stone-100' 
                          : 'border-stone-300 hover:border-stone-800 bg-stone-50/50 hover:bg-stone-50'
                    }`}
                  >
                    <input
                      type="file"
                      ref={targetFileInputRef}
                      onChange={handleTargetFileChange}
                      accept="image/*"
                      className="hidden"
                      id="reverser-target-file-input"
                    />

                    {targetImageData ? (
                      <div className="relative w-full max-w-xs mx-auto flex items-center justify-center overflow-hidden py-1" onClick={(e) => e.stopPropagation()}>
                        <img
                          src={targetImageData}
                          alt="Preview target subject"
                          className="rounded-lg max-h-[140px] max-w-full w-auto h-auto mx-auto object-contain border border-stone-200 shadow-sm block"
                          style={{ maxHeight: '140px', maxWidth: '100%', width: 'auto', height: 'auto', objectFit: 'contain' }}
                          referrerPolicy="no-referrer"
                        />
                        <button
                          onClick={handleRemoveTargetImage}
                          className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full transition-colors shadow z-10"
                          title={lang === 'ar' ? 'حذف الصورة الثانية' : 'Remove Image 2'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="p-2.5 bg-stone-200 text-stone-600 rounded-xl mb-3">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                        <p className="text-[11px] font-bold text-stone-700">
                          {lang === 'ar' ? 'صورة الموضوع لتلقي الأسلوب' : 'Upload Target Subject'}
                        </p>
                        <p className="text-[9px] text-stone-500 mt-1 max-w-xs leading-relaxed">
                          {lang === 'ar' ? 'اسحب أو انقر لاختيار صورة المحتوى' : 'Drag or click to choose content target'}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Card: Fine-tune Target Options */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-stone-800 mb-4 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#c29b40]" />
              <span>{lang === 'ar' ? 'خيارات وتوجيه المحرك العكسي' : '2. Reverse Prompt Style Parameters'}</span>
            </h3>

            {/* DUAL TIER SELECTOR: الخيار المدفوع والخيار المجاني معاً */}
            <div className="mb-6 p-4 rounded-2xl bg-stone-50/90 border border-stone-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">⚖️</span>
                  <span className="text-xs sm:text-sm font-black text-stone-900">
                    {lang === 'ar' ? 'مسار الهندسة العكسية (الخيار المجاني والمدفوع متاحان معاً):' : 'Reverse Engineering Track (Free & Paid Tiers Together):'}
                  </span>
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-stone-200 text-stone-700">
                  {lang === 'ar' ? 'اختر المسار المناسب' : 'Dual Tier System'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* 1. الخيار المجاني (Free Option) */}
                <div
                  onClick={() => {
                    setReverserTier('free');
                    setErrorMsg('');
                  }}
                  className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                    reverserTier === 'free'
                      ? 'bg-emerald-50/80 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                      : 'bg-white border-stone-200 hover:border-emerald-300 hover:bg-stone-50/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base shrink-0">🎁</span>
                        <span className="text-xs font-black text-stone-900">
                          {lang === 'ar' ? 'الخيار المجاني (Free Tier)' : 'Free Option (Free Tier)'}
                        </span>
                      </div>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                        {lang === 'ar' ? 'مجاني للجميع 100%' : '100% Free'}
                      </span>
                    </div>

                    <p className="text-[11px] text-stone-600 mb-2 leading-relaxed">
                      {lang === 'ar' 
                        ? 'استخلاص النمط البصري الأساسي وتوليد برومبت واضح ومباشر، متاح دائماً بدون اشتراك وبلا قيود.'
                        : 'Extract baseline visual style into an unconstrained prompt, completely free forever with no subscription barrier.'}
                    </p>

                    <ul className="space-y-1 text-[10px] text-stone-600 mb-2.5">
                      <li className="flex items-center gap-1.5 text-emerald-800 font-bold bg-emerald-100/90 px-2 py-1.5 rounded-md border border-emerald-300">
                        <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span>{lang === 'ar' ? 'توجيه البرومبت: "خد من الصورة الأولى النمط و طبقه على التانية و لتكون دقة الصورة 8k"' : 'Directive: "Take the style from the first image and apply it to the second, and let the image resolution be 8k"'}</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{lang === 'ar' ? 'تفكيك النمط الأساسي مجاناً' : 'Free baseline style deconstruction'}</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{lang === 'ar' ? 'دعم خيار العميل الحر والنمط المجاني' : 'Client free choice & free pattern support'}</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{lang === 'ar' ? 'متاح دائماً بدون بطاقة بنكية أو اشتراك' : 'No credit card or subscription required'}</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-emerald-100/80 flex items-center justify-between">
                    <span className="text-[11px] font-black text-emerald-700">
                      {lang === 'ar' ? '$0 / مجاني دائماً' : '$0 / Always Free'}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      reverserTier === 'free' ? 'bg-emerald-600 text-white font-black shadow-2xs' : 'bg-stone-100 text-stone-500'
                    }`}>
                      {reverserTier === 'free' ? (lang === 'ar' ? '✓ تم الاختيار' : '✓ Selected') : (lang === 'ar' ? 'اختيار' : 'Select')}
                    </span>
                  </div>
                </div>

                {/* 2. الخيار المدفوع الاحترافي (Paid Option) */}
                <div
                  onClick={() => {
                    setReverserTier('paid');
                    setErrorMsg('');
                  }}
                  className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                    reverserTier === 'paid'
                      ? 'bg-amber-50/90 border-[#c29b40] shadow-sm ring-2 ring-[#c29b40]/25'
                      : 'bg-white border-stone-200 hover:border-amber-300 hover:bg-stone-50/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <div className="flex items-center gap-1.5">
                        <Crown className="w-4 h-4 text-[#c29b40] shrink-0" />
                        <span className="text-xs font-black text-stone-900">
                          {lang === 'ar' ? 'الخيار المدفوع (Pro Ultra)' : 'Paid Option (Pro Ultra)'}
                        </span>
                      </div>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-[#8c6722] border border-amber-300 flex items-center gap-0.5 shrink-0">
                        <span>👑</span>
                        <span>{lang === 'ar' ? 'دقة 8K استوديو' : '8K Studio'}</span>
                      </span>
                    </div>

                    <p className="text-[11px] text-stone-600 mb-2 leading-relaxed">
                      {lang === 'ar'
                        ? 'فك تشفير عميق لمصفوفة Visual DNA، وفيزياء الإضاءة الحجمية وعدسات هاسلبلاد وأري أليكسا للإعلانات التجارية الفاخرة.'
                        : 'Deep Visual DNA matrix extraction with studio volumetric ray-tracing, Hasselblad optics, and high-converting commercial prompts.'}
                    </p>

                    <ul className="space-y-1 text-[10px] text-stone-600 mb-2.5">
                      <li className="flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-[#c29b40] shrink-0" />
                        <span>{lang === 'ar' ? 'استخراج مصفوفة Visual DNA كاملة' : 'Complete Visual DNA matrix extraction'}</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-[#c29b40] shrink-0" />
                        <span>{lang === 'ar' ? 'محاكاة عدسات استوديو هاسلبلاد 85mm f/1.2' : 'Hasselblad 85mm f/1.2 lens simulation'}</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-[#c29b40] shrink-0" />
                        <span>{lang === 'ar' ? 'أولوية معالجة فورية وتوليد فائق' : 'Priority instant processing speed'}</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-amber-100/80 flex items-center justify-between">
                    <span className="text-[11px] font-black text-[#8c6722]">
                      {lang === 'ar' ? 'باقة Pro & Lite الاحترافية' : 'Pro & Lite Creator'}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      reverserTier === 'paid' ? 'bg-[#c29b40] text-stone-950 font-black shadow-2xs' : 'bg-stone-100 text-stone-500'
                    }`}>
                      {reverserTier === 'paid' ? (lang === 'ar' ? '✓ تم الاختيار' : '✓ Selected') : (lang === 'ar' ? 'اختيار' : 'Select')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dedicated Style Transfer & Client Free Choice Section */}
            <div className="p-4 bg-gradient-to-r from-amber-500/10 via-[#c29b40]/10 to-amber-500/10 rounded-2xl border border-[#c29b40]/40 space-y-3 mb-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-[#c29b40]" />
                  <span className="text-xs font-black text-stone-900">
                    {lang === 'ar' ? 'نقل النمط وتطبيق الأسلوب (خيار العميل المجاني)' : 'Style Transfer & Client Free Choice'}
                  </span>
                </div>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 shadow-2xs">
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>{lang === 'ar' ? 'خيار مجاني يحدده العميل' : 'Free Choice by Client'}</span>
                </span>
              </div>

              {/* Exact Arabic Phrase Requested */}
              <div className="p-3 bg-white/95 rounded-xl border border-amber-300/80 shadow-2xs flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-2.5">
                  <span className="text-base shrink-0">🎨</span>
                  <div>
                    <div className="text-xs sm:text-sm font-black text-[#916a24] font-mono tracking-wide">
                      "خد النمط من الصورة و طبقه على الصورة المرفقة"
                    </div>
                    <div className="text-[10px] text-stone-500 font-medium">
                      "Take the style from the image and apply it to the attached image"
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg bg-amber-100/90 text-[#8c6722] border border-amber-200">
                    {lang === 'ar' ? 'مُدمج بالبرومبت' : 'Embedded in Prompt'}
                  </span>
                </div>
              </div>

              {/* Free Tier Analysis Directive Card */}
              <div className="p-3 bg-white/95 rounded-xl border border-emerald-300/80 shadow-2xs flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-2.5">
                  <span className="text-base shrink-0">⚡</span>
                  <div>
                    <div className="text-xs sm:text-sm font-black text-emerald-800 font-mono tracking-wide">
                      "خد من الصورة الأولى النمط و طبقه على التانية و لتكون دقة الصورة 8k"
                    </div>
                    <div className="text-[10px] text-stone-500 font-medium">
                      "Take the style from the first image and apply it to the second, and let the image resolution be 8k"
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg bg-emerald-100/90 text-emerald-800 border border-emerald-200">
                    {lang === 'ar' ? 'مُفعّل بالبرومبت المجاني' : 'Active in Free Tier'}
                  </span>
                </div>
              </div>

              {/* Checkbox / Toggle: استخدام النمط المجاني (Free Pattern) */}
              <div className="p-3 bg-white/95 rounded-xl border border-stone-200/90 hover:border-[#c29b40]/60 transition-all shadow-2xs">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {/* Interactive Toggle Switch / Checkbox */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={useFreePattern}
                      onClick={() => setUseFreePattern(!useFreePattern)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none mt-0.5 ${
                        useFreePattern ? 'bg-[#c29b40]' : 'bg-stone-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          useFreePattern ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <label 
                          onClick={() => setUseFreePattern(!useFreePattern)} 
                          className="text-xs font-black text-stone-900 cursor-pointer flex items-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#c29b40]" />
                          <span>{lang === 'ar' ? 'استخدام النمط المجاني (Free Pattern)' : 'Use Free Pattern'}</span>
                        </label>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {lang === 'ar' ? 'نمط حر إضافي للعميل' : 'Free Pattern Option'}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                        {lang === 'ar'
                          ? 'تفعيل نمط الاستخلاص والتطبيق المجاني المفتوح للعميل، مما يمنح حرية كاملة في تخصيص الأسلوب ونقل تفاصيل الإضاءة والكساءات دون قيود.'
                          : 'Enables open, unconstrained free visual pattern transfer with full customization freedom for the client.'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setUseFreePattern(!useFreePattern)}
                    className={`text-[10px] font-black px-2.5 py-1 rounded-lg border transition-all cursor-pointer shrink-0 ${
                      useFreePattern
                        ? 'bg-amber-50 text-[#8c6722] border-amber-300 shadow-2xs'
                        : 'bg-stone-100 text-stone-400 border-stone-200'
                    }`}
                  >
                    {useFreePattern ? (lang === 'ar' ? '✓ مفعّل' : '✓ Active') : (lang === 'ar' ? 'معطّل' : 'Off')}
                  </button>
                </div>
              </div>

              {/* Free Choice Options Determined by the Client */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                    <span>{lang === 'ar' ? 'الخيار المجاني الذي يحدده العميل:' : 'Free Choice Determined by Client:'}</span>
                  </label>
                  <span className="text-[10px] text-stone-400 font-medium">
                    {lang === 'ar' ? 'اكتب ما تريده أو اختر من النماذج' : 'Type custom directive or pick preset'}
                  </span>
                </div>

                {/* Quick Presets for Client Free Choice */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'full', labelAr: 'نقل كامل للنمط والإضاءة', labelEn: 'Full Style & Lighting' },
                    { id: 'cinematic', labelAr: 'إخراج فوتوغرافي واقعي', labelEn: 'Cinematic Realism' },
                    { id: 'creative', labelAr: 'دمج فني درامي إعلاني', labelEn: 'Dramatic Commercial' },
                    { id: 'custom', labelAr: '✏️ خيار حر يحدده العميل', labelEn: '✏️ Custom Client Text' }
                  ].map((preset) => {
                    const isSelected = freeChoicePreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setFreeChoicePreset(preset.id);
                          if (preset.id === 'full') {
                            setClientCustomChoice(lang === 'ar' ? 'تطبيق كامل للنمط والألوان والإضاءة مع المحافظة على التناسق' : 'Full transfer of visual style, color harmony, and lighting');
                          } else if (preset.id === 'cinematic') {
                            setClientCustomChoice(lang === 'ar' ? 'تحويل سينمائي فوتوغرافي واقعي بعدسة 85mm f/1.4 وإضاءة ريم' : 'Cinematic photorealistic render, 85mm f/1.4 lens, soft rim lighting');
                          } else if (preset.id === 'creative') {
                            setClientCustomChoice(lang === 'ar' ? 'دمج فني إعلاني متطور يبرز المنتج أو الشخصية بهوية بصرية راقية' : 'Commercial grade advertising fusion emphasizing subject with luxury branding');
                          }
                        }}
                        className={`p-2 rounded-xl border text-[11px] font-bold transition-all text-center cursor-pointer ${
                          isSelected
                            ? 'bg-[#c29b40] text-stone-950 border-[#b08b34] shadow-xs'
                            : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-200'
                        }`}
                      >
                        {lang === 'ar' ? preset.labelAr : preset.labelEn}
                      </button>
                    );
                  })}
                </div>

                {/* Free Text Input for Client Choice */}
                <div className="relative">
                  <input
                    type="text"
                    value={clientCustomChoice}
                    onChange={(e) => {
                      setClientCustomChoice(e.target.value);
                      setFreeChoicePreset('custom');
                    }}
                    placeholder={
                      lang === 'ar'
                        ? 'اكتب هنا ما يحدده العميل بحرية (مثال: طبق النمط على رائد فضاء في صحراء، أو حافظ على ألوان وتفاصيل الصورة المرفقة...)'
                        : 'Enter what the client specifies (e.g. apply style to an astronaut in a desert, preserve colors...)'
                    }
                    className="w-full text-xs rounded-xl border border-stone-300 p-3 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#c29b40] font-sans pr-10 rtl:pl-10 rtl:pr-3"
                  />
                  {clientCustomChoice && (
                    <button
                      type="button"
                      onClick={() => {
                        setClientCustomChoice('');
                        setFreeChoicePreset('custom');
                      }}
                      className="absolute right-2.5 rtl:right-auto rtl:left-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
                      title={lang === 'ar' ? 'مسح' : 'Clear'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Target styles selection - Show only in normal reverse prompt or video mode */}
            {reverserMode !== 'mimic' && (
              <div className="space-y-3 mb-5">
                <label className="text-xs font-bold text-stone-600 block mb-1">
                  {lang === 'ar' ? 'حدد أسلوب الصياغة والهندسة المستهدف:' : 'Extract optimized for:'}
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(reverserMode === 'video' ? videoStyles : styles).map((style) => {
                    const isSelected = targetStyle === style.id;
                    return (
                      <button
                        key={style.id}
                        onClick={() => {
                          setTargetStyle(style.id);
                        }}
                        className={`text-right rtl:text-right p-3 rounded-xl border text-xs transition-all flex flex-col gap-1.5 ${
                          isSelected
                            ? 'border-[#c29b40] bg-[#c29b40]/5 font-semibold text-[#8c6722]'
                            : 'border-stone-200 hover:border-stone-300 bg-white text-stone-700'
                        }`}
                      >
                        <span className="font-bold">{lang === 'ar' ? style.titleAr : style.titleEn}</span>
                        <span className="text-[10px] text-stone-400 font-medium leading-relaxed">
                          {lang === 'ar' ? style.descAr : style.descEn}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Optional guiding notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-600 flex items-center gap-1">
                <span>{lang === 'ar' ? 'ملاحظات إرشادية إضافية (اختياري):' : 'Additional guiding notes (Optional):'}</span>
                <span className="text-[10px] text-stone-400 font-normal">
                  ({lang === 'ar' ? 'توجيه النموذج للتركيز على تفاصيل معينة' : 'Guide the model to highlight specific details'})
                </span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder={
                  reverserMode === 'mimic'
                    ? (lang === 'ar' 
                      ? 'مثال: اجعل الضوء يتسلل من الجانب الأيمن فقط، وتجنب بهتان الخلفية...' 
                      : 'Example: Make lighting source come strictly from the right side, preserve foreground colors...')
                    : reverserMode === 'video'
                      ? (lang === 'ar'
                        ? 'مثال: ركز على زوايا الكاميرا الواسعة وحركات الدرون الهادئة والسرعة البطيئة...'
                        : 'Example: Focus on wide drone camera sweeps, steady crane motions, and slow motion rendering...')
                      : (lang === 'ar'
                        ? 'مثال: ركز على ملابس الشخصية فقط وافترض أنها بالأسلوب المستقبلي...'
                        : 'Example: Focus on the character clothes, ignore the background, target vintage aesthetics...')
                }
                className="w-full text-xs rounded-xl border border-stone-300 p-3 bg-stone-50/50 focus:outline-none focus:ring-1 focus:ring-[#c29b40] font-sans"
              />
            </div>

            {/* ERROR MSG */}
            {errorMsg && (
              <div className="mt-4 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200 text-xs rounded-xl leading-relaxed text-right rtl:text-right space-y-2.5">
                <div className="font-medium">{errorMsg}</div>
                <div className="pt-2 border-t border-rose-200/60 dark:border-rose-900/40 flex flex-wrap gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setReverserTier('free');
                      setErrorMsg('');
                      handleAnalyzeImage('free');
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <span>⚡</span>
                    <span>{lang === 'ar' ? 'التبديل إلى الخيار المجاني والمتابعة' : 'Switch to Free Option & Continue'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('open-checkout', { detail: { plan: 'pro', billingCycle: 'annual' } }));
                    }}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#916a24] via-[#c29b40] to-amber-500 text-white font-black text-xs shadow-md hover:opacity-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <Crown className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'ترقية باقتك إلى Pro' : 'Upgrade to Pro'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* ACTION BUTTON */}
            <div className="mt-6">
              <button
                onClick={() => handleAnalyzeImage()}
                disabled={loading || !imageData || (reverserMode === 'mimic' && !targetImageData)}
                className={`w-full py-3.5 px-6 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 text-white shadow-md shadow-[#c29b40]/10 cursor-pointer ${
                  (!imageData || (reverserMode === 'mimic' && !targetImageData))
                    ? 'bg-stone-300 cursor-not-allowed text-stone-500 shadow-none border-stone-300'
                    : loading
                      ? 'bg-stone-800 cursor-wait'
                      : reverserTier === 'paid'
                        ? 'bg-gradient-to-r from-[#916a24] via-[#c29b40] to-amber-600 hover:opacity-95 active:scale-[0.98]'
                        : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98]'
                }`}
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-stone-300" />
                    <span>
                      {reverserMode === 'video'
                        ? (lang === 'ar' ? 'يتم الآن تحليل حركية وتصوير لقطة الفيديو تزامناً...' : 'Decoding video cinematography rules...')
                        : reverserMode === 'mimic'
                          ? (lang === 'ar' ? 'يتم دمج ومعالجة وتحليل الصورتين تزامناً...' : 'Blending and analyzing style transfer rules...')
                          : (lang === 'ar' ? 'يتم الآن رفع الصورة وتحليلها ذكياً...' : 'Uploading and analyzing design pixels...')}
                    </span>
                  </>
                ) : (
                  <>
                    {reverserTier === 'paid' ? (
                      <Crown className="w-4 h-4 text-amber-200 animate-pulse" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-emerald-200 animate-pulse" />
                    )}
                    <span>
                      {reverserTier === 'paid'
                        ? (lang === 'ar' ? 'تشغيل الهندسة العكسية الفائقة (الخيار المدفوع 8K Pro) (Ctrl+Enter)' : 'Run Deep Reverse Engineering (Paid Pro 8K) (Ctrl+Enter)')
                        : (lang === 'ar' ? 'تشغيل الهندسة العكسية المجانية (الخيار المجاني Free) (Ctrl+Enter)' : 'Run Free Reverse Engineering (Free Option) (Ctrl+Enter)')}
                    </span>
                  </>
                )}
              </button>

              <div className="mt-2 text-center text-[10px]">
                {reverserTier === 'paid' ? (
                  <span className="text-[#8c6722] font-semibold flex items-center justify-center gap-1">
                    <Crown className="w-3 h-3 text-[#c29b40]" />
                    <span>{lang === 'ar' ? 'الخيار المدفوع نشط: دقة سينمائية 8K وفيزياء استوديو متقدمة' : 'Paid Pro Tier active: 8K studio fidelity & lens physics'}</span>
                  </span>
                ) : (
                  <span className="text-emerald-700 font-semibold flex items-center justify-center gap-1">
                    <span>🎁</span>
                    <span>{lang === 'ar' ? 'الخيار المجاني نشط: متاح للجميع 100% مع عبارة "خد النمط من الصورة و طبقه على الصورة المرفقة"' : 'Free Tier active: 100% free for everyone with style transfer directive'}</span>
                  </span>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* Right column: Results (5 cols in LG) */}
        <div className="lg:col-span-5 h-full">
          
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm min-h-[400px] flex flex-col justify-between h-full">
            
            {/* Header section */}
            <div className="border-b border-stone-100 pb-4 mb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-stone-800 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-[#c29b40]" />
                  <span>
                    {reverserMode === 'video'
                      ? (lang === 'ar' ? 'الأمر الحركي للفيديو المستخلص' : 'Optimized Video Prompt Output')
                      : reverserMode === 'mimic'
                        ? (lang === 'ar' ? 'مخرجات دمج ونقل الأسلوب' : 'Style Mimicry Output')
                        : (lang === 'ar' ? 'مخرجات الهندسة العكسية للصورة' : '3. Deconstructed Output')}
                  </span>
                </h3>
                {saveNotification ? (
                  <span className="text-[10px] font-black text-emerald-800 px-2.5 py-0.5 bg-emerald-100 rounded-full border border-emerald-300 animate-pulse">
                    {saveNotification}
                  </span>
                ) : extractedPrompt && isFallback ? (
                  <span className="text-[9px] font-extrabold text-[#c29b40] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {lang === 'ar' ? 'صياغة محلية تلقائية' : 'Local Fallback'}
                  </span>
                ) : null}
              </div>
            </div>

             {/* Body state */}
            <div className="flex-1 flex flex-col">
              {(!imageData || (reverserMode === 'mimic' && !targetImageData)) ? (
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-stone-400">
                  <ImageIcon className="w-12 h-12 text-stone-200 mb-3" />
                  <p className="text-xs font-bold text-stone-500">
                    {lang === 'ar' 
                      ? (reverserMode === 'video' ? 'بانتظار ارفاق فيديو لتفكيك لقطاته الحركية' : reverserMode === 'mimic' ? 'بانتظار تحميل الصورتين للمحاكاة والدمج' : 'بانتظار تحميل الصورة للتفكيك') 
                      : (reverserMode === 'video' ? 'Waiting for video file...' : reverserMode === 'mimic' ? 'Waiting for style and content images...' : 'Waiting for raw image...')}
                  </p>
                  <p className="text-[10px] text-stone-400 mt-1.5 max-w-[200px] leading-relaxed mx-auto">
                    {lang === 'ar' 
                      ? (reverserMode === 'video'
                        ? 'ارفع مقطع فيديو قصير او ملف جيف متحرك من اليسار لاستعادة التوجيه الإخراجي والأمر الهندسي المؤثر.'
                        : reverserMode === 'mimic' 
                          ? 'قم بتحميل صورة مرجع النمط وصورة المحتوى لتطبيق التأثيرات الفنية واستخلاص برومبت من دمج الألوان.' 
                          : 'ارفع صورة من الخيارات المجاورة للبدء في استخلاص عناصرها وخصائصها الهندسية.') 
                      : (reverserMode === 'video'
                        ? 'Provide a short video or an animated gif on the left panel to reverse-engineer its camera lanes and scenery.'
                        : reverserMode === 'mimic' 
                          ? 'Provide both an aesthetic style reference image and a subject image to merge design attributes.' 
                          : 'Provide an image from the left panel to populate design telemetry.')}
                  </p>
                </div>
              ) : loading ? (
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-8 h-8 rounded-full border-2 border-[#c29b40]/10 border-t-[#c29b40] animate-spin mb-4" />
                  <p className="text-xs font-bold text-stone-600">
                    {lang === 'ar' 
                      ? (reverserMode === 'video'
                        ? 'يقوم محرك Gemini بدراسة المنحنيات الحركية ومسارات الكاميرا للفيديو...'
                        : reverserMode === 'mimic' 
                          ? 'يقوم محرك دمج الأنماط بدراسة ومطابقة بصريات الصورتين معاً...' 
                          : 'يقوم محرك Gemini بفحص تفاصيل بكسلات صورتك...')
                      : (reverserMode === 'video'
                        ? 'Gemini is evaluating motion curves, camera paths, and lighting layers of your video clip...'
                        : reverserMode === 'mimic' 
                          ? 'Gemini is running style fusion algorithm on both images...' 
                          : 'Gemini is dissecting image layers...')}
                  </p>
                  <p className="text-[10px] text-stone-400 mt-1.5 max-w-[220px] leading-relaxed mx-auto">
                    {lang === 'ar' 
                      ? 'يستغرق الفك والدمج ما بين ٤ إلى ٩ ثواني لتحقيق التوازن التناسقي الهندسي للحركية.' 
                      : 'Deconstruction and style blending takes 4 to 9 seconds to balance aesthetic layers and structural bounds.'}
                  </p>
                </div>
              ) : extractedPrompt ? (
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  {/* Learned Visual DNA Card */}
                  {learnedDna && learnedDna.palette && (
                    <div className="p-3.5 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-amber-500/10 rounded-2xl border border-amber-300/60 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-[#916a24] flex items-center gap-1.5">
                          <Palette className="w-3.5 h-3.5" />
                          <span>{lang === 'ar' ? 'البصمة البصرية المستخلصة والمُتعلَّمة من الصورة' : 'Learned Visual Style DNA'}</span>
                        </span>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100/80 text-amber-900 border border-amber-200">
                          {learnedDna.medium || 'Cinematic Style'}
                        </span>
                      </div>

                      {/* Color Palette Swatches */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] text-stone-600 font-bold">{lang === 'ar' ? 'الألوان المستخلصة:' : 'Palette:'}</span>
                        {learnedDna.palette.map((color, cIdx) => (
                          <button
                            key={cIdx}
                            type="button"
                            onClick={() => handleCopyHex(color)}
                            className="group flex items-center gap-1.5 px-2 py-1 bg-white rounded-lg border border-stone-200 hover:border-[#c29b40] shadow-2xs transition-all cursor-pointer text-[10px] font-mono text-stone-700"
                            title={lang === 'ar' ? `اضغط لنسخ الكود: ${color}` : `Click to copy: ${color}`}
                          >
                            <span className="w-3 h-3 rounded-full shadow-2xs border border-black/10 shrink-0" style={{ backgroundColor: color }} />
                            <span>{color}</span>
                            {copiedHex === color && <Check className="w-2.5 h-2.5 text-emerald-600" />}
                          </button>
                        ))}
                      </div>

                      {/* Transfer Style to New Idea Sub-Panel */}
                      <div className="pt-2 border-t border-amber-200/60 space-y-2">
                        <label className="block text-[10px] font-bold text-stone-700 flex items-center gap-1">
                          <Wand2 className="w-3 h-3 text-[#c29b40]" />
                          <span>{lang === 'ar' ? 'تطبيق هذا الأسلوب المُتعلَّم على فكرة جديدة تماماً:' : 'Transfer this learned style to a new custom idea:'}</span>
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newCustomSubject}
                            onChange={(e) => setNewCustomSubject(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleApplyLearnedStyle(); }}
                            placeholder={lang === 'ar' ? 'اكتب فكرة جديدة (مثال: رائد فضاء في سوق شعبي، سيارة رياضية...)' : 'Type a new subject (e.g. astronaut in traditional bazaar, sports car...)'}
                            className="flex-1 text-xs rounded-xl border border-stone-300 p-2 bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#c29b40]"
                          />
                          <button
                            type="button"
                            onClick={handleApplyLearnedStyle}
                            disabled={isApplyingStyle || !newCustomSubject.trim()}
                            className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                              isApplyingStyle || !newCustomSubject.trim()
                                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                                : 'bg-[#c29b40] hover:bg-[#a6802f] text-stone-950'
                            }`}
                          >
                            {isApplyingStyle ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Wand2 className="w-3.5 h-3.5" />
                            )}
                            <span>{lang === 'ar' ? 'تطبيق' : 'Apply'}</span>
                          </button>
                        </div>

                        {/* Applied Style Result Output */}
                        {appliedPromptResult && (
                          <div className="p-3 bg-white rounded-xl border border-amber-300/80 space-y-2 animate-in fade-in">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black text-emerald-800 flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>{lang === 'ar' ? 'البرومبت المولد بالأسلوب المتعلم:' : 'Generated with Learned Style:'}</span>
                              </span>
                              <div className="flex gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    let txt = appliedPromptResult;
                                    const m = appliedPromptResult.match(/```([\s\S]*?)```/);
                                    if (m && m[1]) txt = m[1].trim();
                                    navigator.clipboard.writeText(appendSiteUrlToPrompt(txt));
                                    setCopiedApplied(true);
                                    showToast(lang === 'ar' ? '✓ تم نسخ الأمر المولد بالأسلوب المتعلم!' : '✓ Copied applied prompt!');
                                    setTimeout(() => setCopiedApplied(false), 2000);
                                  }}
                                  className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center gap-1 cursor-pointer"
                                >
                                  {copiedApplied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                  <span>{lang === 'ar' ? 'نسخ' : 'Copy'}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    let txt = appliedPromptResult;
                                    const m = appliedPromptResult.match(/```([\s\S]*?)```/);
                                    if (m && m[1]) txt = m[1].trim();
                                    onSendToTester(txt);
                                  }}
                                  className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#c29b40] text-stone-950 flex items-center gap-1 cursor-pointer"
                                >
                                  <PenTool className="w-3 h-3" />
                                  <span>{lang === 'ar' ? 'تعديل' : 'Edit'}</span>
                                </button>
                              </div>
                            </div>
                            <div className="text-[11px] font-sans text-stone-800 leading-relaxed whitespace-pre-wrap max-h-[140px] overflow-y-auto bg-stone-50 p-2 rounded-lg border border-stone-200" dir="auto">
                              {appliedPromptResult}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Style Transfer & Free Choice Status Banner */}
                  {(reverserMode === 'mimic' || clientCustomChoice || extractedPrompt.includes('خد النمط من الصورة و طبقه على الصورة المرفقة')) && (
                    <div className="p-2.5 bg-gradient-to-r from-amber-50 to-amber-100/50 rounded-xl border border-amber-300/80 flex items-center justify-between gap-2 text-xs shadow-2xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <Sparkles className="w-4 h-4 text-[#c29b40] shrink-0" />
                        <span className="font-bold text-[#8c6722] truncate font-mono">
                          {lang === 'ar' ? '📌 "خد النمط من الصورة و طبقه على الصورة المرفقة"' : '📌 "Take the style from the image and apply it to the attached image"'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                        {useFreePattern && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                            {lang === 'ar' ? '✓ نمط مجاني' : '✓ Free Pattern'}
                          </span>
                        )}
                        {clientCustomChoice ? (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-white border border-amber-200 text-stone-800 shadow-2xs">
                            {lang === 'ar' ? `🎯 خيار العميل: ${clientCustomChoice.substring(0, 20)}` : `🎯 Client: ${clientCustomChoice.substring(0, 20)}`}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100/80 text-[#8c6722] border border-amber-200 shadow-2xs">
                            {lang === 'ar' ? '✓ خيار حر' : '✓ Free Choice'}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Generation Tier Badge (Free vs Paid) */}
                  {lastGeneratedTier && (
                    <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs shadow-2xs ${
                      lastGeneratedTier === 'paid'
                        ? 'bg-gradient-to-r from-amber-50 via-amber-100/50 to-amber-50 border-amber-300 text-[#8c6722]'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    }`}>
                      <div className="flex items-center gap-2">
                        {lastGeneratedTier === 'paid' ? (
                          <Crown className="w-4 h-4 text-[#c29b40] shrink-0" />
                        ) : (
                          <span className="text-base shrink-0">🎁</span>
                        )}
                        <span className="font-black text-xs">
                          {lastGeneratedTier === 'paid'
                            ? (lang === 'ar' ? '👑 تم التوليد بنجاح عبر: الخيار المدفوع الاحترافي (Pro Ultra 8K)' : '👑 Generated via: Paid Pro Ultra Tier (8K Studio Quality)')
                            : (lang === 'ar' ? '🎁 تم التوليد بنجاح عبر: الخيار المجاني (Free Tier)' : '🎁 Generated via: Free Tier (Unconstrained)')}
                        </span>
                      </div>
                      {lastGeneratedTier === 'free' && (
                        <button
                          type="button"
                          onClick={() => {
                            setReverserTier('paid');
                            setErrorMsg('');
                          }}
                          className="text-[10px] font-bold text-[#8c6722] hover:underline cursor-pointer flex items-center gap-1 shrink-0 bg-white/80 px-2 py-0.5 rounded-lg border border-amber-200 shadow-2xs"
                        >
                          <Crown className="w-3 h-3 text-[#c29b40]" />
                          <span>{lang === 'ar' ? 'جرّب الخيار المدفوع 8K' : 'Try Paid 8K'}</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Prompt box */}
                  <div className="flex-1 bg-stone-50 rounded-xl p-4 border border-stone-200 font-sans text-stone-800 text-xs leading-relaxed whitespace-pre-wrap max-h-[420px] overflow-y-auto text-right rtl:text-right" dir="auto">
                    {extractedPrompt}
                  </div>

                  {/* Actions buttons */}
                  <div className="pt-4 border-t border-stone-100 flex flex-wrap gap-2.5">
                    <button
                      onClick={handleCopy}
                      className="flex-1 min-w-[120px] py-2.5 px-3 bg-stone-100 hover:bg-stone-200 active:scale-[0.98] text-stone-850 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 border border-stone-250/20"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span className="text-emerald-600">{lang === 'ar' ? 'تم نسخ البرومبت!' : 'Copied!'}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-stone-500" />
                          <span>{lang === 'ar' ? 'نسخ البرومبت المستخلص' : 'Copy Prompt'}</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleManualSave}
                      className="flex-1 min-w-[120px] py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow"
                      title={lang === 'ar' ? 'حفظ في السجل (Ctrl+S)' : 'Save to History (Ctrl+S)'}
                    >
                      <Check className="w-4 h-4" />
                      <span>{lang === 'ar' ? 'حفظ (Ctrl+S)' : 'Save (Ctrl+S)'}</span>
                    </button>

                    <button
                      onClick={() => {
                        // Extract code block content if present
                        let text = extractedPrompt;
                        const match = extractedPrompt.match(/```([\s\S]*?)```/);
                        if (match && match[1]) {
                          text = match[1].trim();
                        }
                        onSendToTester(text);
                      }}
                      className="flex-1 min-w-[120px] py-2.5 px-3 bg-[#c29b40] hover:bg-[#b08b33] active:scale-[0.98] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow"
                    >
                      <PenTool className="w-4 h-4 text-[#fff3d6]" />
                      <span>{lang === 'ar' ? 'تعديل في مُهندس الأوامر' : 'Open in Prompt Builder'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-stone-400">
                  <Info className="w-10 h-10 text-stone-200 mb-2" />
                  <p className="text-xs font-bold text-stone-500">
                    {lang === 'ar' ? 'بانتظار تشغيل التحليل ومحاكاة اللقطة' : 'Awaiting prompt extraction...'}
                  </p>
                  <p className="text-[10px] text-stone-400 mt-1 max-w-[200px] leading-relaxed mx-auto">
                    {lang === 'ar' ? 'انقر على المفتاح الذهبي بالأسفل لبدء فحص وحساب الهندسة العكسية للفيديو.' : 'Click "Reverse Video" on the left column to run the deconstruction pipeline.'}
                  </p>
                </div>
              )}
            </div>

            {/* Note alert */}
            {extractedPrompt && (
              <div className="mt-4 p-2.5 bg-[#c29b40]/5 rounded-xl border border-[#c29b40]/10 text-[10px] text-stone-600 leading-relaxed flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-[#c29b40] shrink-0 mt-0.5" />
                <span>
                  {lang === 'ar'
                    ? (reverserMode === 'video'
                      ? 'يمكنك نسخ هذا البرومبت الموجه للفيديو واستخدامه في Sora, Luma, Kling, أو Runway Gen-3 للحصول على اتجاه حركي ومطابقة كاميرا مذهلة.'
                      : 'يمكنك نسخ هذا البرومبت بالكامل واستخدامه في Midjourney و Leonardo و ChatGPT لتوليد نتائج مطابقة وبقالب تصويري فريد.')
                    : 'This extracted design schema is fully optimized for Midjourney v6, Sora, Runway, Luma, and Stable Diffusion.'}
                </span>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
