/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Image as ImageIcon,
  Sparkles, 
  Copy, 
  Check, 
  Cpu, 
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
  Film
} from 'lucide-react';
import { ModelType } from '../types';
import { showToast } from './ToastNotification';

interface PromptReverserProps {
  lang: 'ar' | 'en';
  onSendToTester: (promptText: string) => void;
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

export default function PromptReverser({ lang, onSendToTester, onLogPrompt, initialValues }: PromptReverserProps) {
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
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    showToast(lang === 'ar' ? '✓ تم نسخ الأمر المستخرج للحافظة!' : '✓ Extracted prompt copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
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

  const loadImage = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg(
        lang === 'ar' 
          ? 'تنبيه: نوع الملف غير مدعوم، يرجى اختيار ملف صورة صالح (JPEG, PNG, WEBP).'
          : 'Unsupported file type. Please select a valid image file (JPEG, PNG, WEBP).'
      );
      return;
    }
    setMimeType(file.type);
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

  const loadTargetImage = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg(
        lang === 'ar' 
          ? 'تنبيه: نوع ملف الصورة لتلقي الأسلوب غير مدعوم.'
          : 'Unsupported target image file type.'
      );
      return;
    }
    setTargetMimeType(file.type);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result && typeof event.target.result === 'string') {
        setTargetImageData(event.target.result);
        setErrorMsg('');
        setExtractedPrompt(''); // reset previous results
      }
    };
    reader.readAsDataURL(file);
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

  const handleAnalyzeImage = async () => {
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

    // Trigger header auto-hide to clear up screen space
    try {
      window.dispatchEvent(new CustomEvent('hide-header'));
    } catch (err) {}

    setLoading(true);
    setErrorMsg('');
    setExtractedPrompt('');
    setIsFallback(false);

    try {
      const response = await fetch('/api/reverse-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageData,
          mimeType,
          targetStyle,
          notes,
          targetImage: reverserMode === 'mimic' ? targetImageData : null,
          targetImageMimeType: reverserMode === 'mimic' ? targetMimeType : null,
          isVideoMode: reverserMode === 'video',
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Server error during analysis');
      }

      const data = await response.json();
      setExtractedPrompt(data.reversePrompt);
      setIsFallback(!!data.isFallback);

      // Log the action to history
      if (onLogPrompt) {
        // Find a brief summary for originalText
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
          optimizedText: data.reversePrompt,
          model: 'gemini',
          tone: reverserMode === 'mimic' ? 'mimicry' : reverserMode === 'video' ? 'video' : targetStyle,
          category: 'general',
          actionType: 'reverse',
          isFallback: data.isFallback,
          styleImage: imageData,
          contentImage: reverserMode === 'mimic' ? targetImageData : null,
          notes,
          isMimicMode: reverserMode === 'mimic'
        });
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(
        lang === 'ar' 
          ? 'حدث عطل أثناء الاتصال بمحرك الاستخراج، يرجى المحاولة لاحقاً.' 
          : 'Could not connect to the prompt extraction engine. Please try again.'
      );
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
      <div className="text-center max-w-3xl mx-auto mb-10">
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

      {/* Mode Selector Tabs (Elegant & Minimalistic Switch) */}
      <div className="flex items-center justify-center mb-10">
        <div className="inline-flex p-1 bg-stone-100 rounded-2xl border border-stone-200 shadow-sm flex-wrap gap-1 sm:gap-0">
          <button
            onClick={() => {
              setReverserMode('image');
              setIsMimicMode(false);
              setExtractedPrompt('');
              setErrorMsg('');
              setImageData(null);
            }}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              reverserMode === 'image'
                ? 'bg-white text-stone-900 shadow-sm font-black border border-stone-200/50'
                : 'text-stone-500 hover:text-stone-800'
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
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              reverserMode === 'mimic'
                ? 'bg-[#c29b40] text-white shadow-sm font-black'
                : 'text-stone-500 hover:text-stone-850'
            }`}
          >
            ✨ {lang === 'ar' ? 'نسخ ودمج الأسلوب البصري (صورتين)' : 'Style Transfer & Mimicry (2 Images)'}
          </button>

          <button
            onClick={() => {
              setReverserMode('video');
              setIsMimicMode(false);
              setExtractedPrompt('');
              setErrorMsg('');
              setImageData(null);
            }}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
              reverserMode === 'video'
                ? 'bg-stone-900 text-white shadow-sm font-black'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-[#c29b40]" />
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
                    <div className="relative w-full max-w-sm mx-auto" onClick={(e) => e.stopPropagation()}>
                      {reverserMode === 'video' ? (
                        <video
                          src={imageData}
                          controls
                          className="rounded-lg max-h-[140px] mx-auto object-contain border border-stone-200 shadow-sm w-full bg-stone-950"
                        />
                      ) : (
                        <img
                          src={imageData}
                          alt="Preview style reference"
                          className="rounded-lg max-h-[140px] mx-auto object-contain border border-stone-200 shadow-sm"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <button
                        onClick={handleRemoveImage}
                        className="absolute -top-3 -right-3 p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full transition-colors shadow"
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
                      <div className="relative w-full max-w-sm mx-auto" onClick={(e) => e.stopPropagation()}>
                        <img
                          src={targetImageData}
                          alt="Preview target subject"
                          className="rounded-lg max-h-[140px] mx-auto object-contain border border-stone-200 shadow-sm"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          onClick={handleRemoveTargetImage}
                          className="absolute -top-3 -right-3 p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full transition-colors shadow"
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
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl leading-relaxed text-right rtl:text-right">
                {errorMsg}
              </div>
            )}

            {/* ACTION BUTTON */}
            <div className="mt-6">
              <button
                onClick={handleAnalyzeImage}
                disabled={loading || !imageData || (reverserMode === 'mimic' && !targetImageData)}
                className={`w-full py-3.5 px-6 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 text-white shadow-md shadow-[#c29b40]/10 ${
                  (!imageData || (reverserMode === 'mimic' && !targetImageData))
                    ? 'bg-stone-300 cursor-not-allowed text-stone-500 shadow-none border-stone-300'
                    : loading
                      ? 'bg-stone-800 cursor-wait'
                      : 'bg-[#c29b40] hover:bg-[#b08b33] active:scale-[0.98]'
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
                    <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
                    <span>
                      {reverserMode === 'video'
                        ? (lang === 'ar' ? 'تفكيك لقطات الفيديو وصياغة الأمر (Ctrl+Enter)' : 'Reverse Video & Extract Prompt (Ctrl+Enter)')
                        : reverserMode === 'mimic'
                          ? (lang === 'ar' ? 'نقل ومحاكاة الأسلوب الفني (Ctrl+Enter)' : 'Blend Styles & Synthesize Blended Prompt (Ctrl+Enter)')
                          : (lang === 'ar' ? 'تفكيك وفك تشفير الأوامر (Ctrl+Enter)' : 'Analyze & Extract Engineered Prompt (Ctrl+Enter)')}
                    </span>
                  </>
                )}
              </button>
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
                      <Cpu className="w-4 h-4 text-[#fff3d6] animate-pulse" />
                      <span>{lang === 'ar' ? 'تجربة في المختبر' : 'Test in Playground'}</span>
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
