/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Film, Sparkles, Sliders, ArrowLeft, ArrowRight, Play, Pause, RefreshCw, 
  Trash2, Plus, Copy, Check, Info, HelpCircle, Shuffle, Video, Clapperboard,
  Download, Eye, EyeOff, ListOrdered, Share2, SkipBack, SkipForward, Repeat, Clock,
  Save, FolderOpen, Bookmark, Upload, Edit3, X, Calendar, Layers, FileDown, PlusCircle,
  Search, FileText, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { showToast } from './ToastNotification';
import { Scene, SavedSequence, AppLanguage } from '../types';
import { auth } from '../utils/firebaseAuth';
import { appendSiteUrlToPrompt } from '../utils/brandWatermark';
import { 
  getUserSequences, 
  saveUserSequence, 
  deleteUserSequence, 
  syncAllSequencesToFirestore,
  createSharedSequence,
  getSharedSequence,
  encodeSequenceToHash,
  decodeSequenceFromHash
} from '../utils/firestoreService';
import ShareSequenceModal from './ShareSequenceModal';

interface PromptSequenceProps {
  lang: AppLanguage;
  onSendToTester?: (promptText: string) => void;
}

const LOCAL_STORAGE_KEY = 'arabprompt_saved_video_sequences';

const loadLocalSequences = (): SavedSequence[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading saved sequences from localStorage:', e);
    return [];
  }
};

const saveLocalSequences = (items: SavedSequence[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving sequences to localStorage:', e);
  }
};

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
  // Starts completely empty - strictly generated upon user idea entry
  const [scenes, setScenes] = useState<Scene[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Saved Sequences & Project State
  const [savedSequences, setSavedSequences] = useState<SavedSequence[]>(() => loadLocalSequences());
  const [currentSequenceId, setCurrentSequenceId] = useState<string | null>(null);
  const [sequenceTitle, setSequenceTitle] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState<boolean>(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);
  const [saveTitleInput, setSaveTitleInput] = useState<string>('');
  const [searchSavedQuery, setSearchSavedQuery] = useState<string>('');
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const importFileInputRef = useRef<HTMLInputElement | null>(null);

  // Share Sequence states
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [sharedBannerInfo, setSharedBannerInfo] = useState<{
    authorName?: string;
    title: string;
  } | null>(null);

  // Deep Link loader: inspect ?seq= / ?sequenceId= / ?sseq= on mount
  useEffect(() => {
    let isMounted = true;
    const checkAndLoadSharedSequence = async () => {
      try {
        const search = window.location.search;
        if (!search) return;
        const params = new URLSearchParams(search);
        const seqId = params.get('seq') || params.get('sequenceId') || params.get('sharedSeq');
        const hashData = params.get('sseq') || params.get('sharedData');

        if (seqId) {
          const sharedDoc = await getSharedSequence(seqId);
          if (!isMounted) return;
          if (sharedDoc && sharedDoc.scenes && sharedDoc.scenes.length > 0) {
            setScenes(sharedDoc.scenes);
            if (sharedDoc.concept) setConcept(sharedDoc.concept);
            if (sharedDoc.anchorStyle) setAnchorStyle(sharedDoc.anchorStyle);
            if (sharedDoc.aspectRatio) setAspectRatio(sharedDoc.aspectRatio);
            if (sharedDoc.transitionEffect) setTransitionEffect(sharedDoc.transitionEffect);
            setSequenceTitle(sharedDoc.title || 'Shared Sequence');
            setCurrentSequenceId(`shared_${seqId}`);
            setHasUnsavedChanges(true); // Allows saving into their personal collection
            setSharedBannerInfo({
              title: sharedDoc.title || (lang === 'ar' ? 'سلسلة مشتركة' : 'Shared Sequence'),
              authorName: sharedDoc.authorName
            });
            showToast(
              lang === 'ar' 
                ? `✨ تم تحميل السلسلة المشتركة: "${sharedDoc.title}" بنجاح!` 
                : `✨ Loaded shared sequence: "${sharedDoc.title}" successfully!`
            );
            return;
          }
        }

        if (hashData) {
          const decoded = decodeSequenceFromHash(hashData);
          if (!isMounted) return;
          if (decoded && decoded.scenes && decoded.scenes.length > 0) {
            setScenes(decoded.scenes);
            if (decoded.concept) setConcept(decoded.concept);
            if (decoded.anchorStyle) setAnchorStyle(decoded.anchorStyle);
            if (decoded.aspectRatio) setAspectRatio(decoded.aspectRatio);
            if (decoded.transitionEffect) setTransitionEffect(decoded.transitionEffect);
            setSequenceTitle(decoded.title || 'Shared Sequence');
            setHasUnsavedChanges(true);
            setSharedBannerInfo({
              title: decoded.title || 'Shared Sequence',
              authorName: decoded.authorName
            });
            showToast(
              lang === 'ar' 
                ? `✨ تم فتح السلسلة المشتركة بنجاح!` 
                : `✨ Loaded shared sequence successfully!`
            );
          }
        }
      } catch (err) {
        console.warn('Could not load shared sequence from URL params:', err);
      }
    };

    checkAndLoadSharedSequence();
    return () => { isMounted = false; };
  }, [lang]);


  // Sync with Firestore if authenticated
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const currentLocal = loadLocalSequences();
          const synced = await syncAllSequencesToFirestore(user.uid, currentLocal);
          setSavedSequences(synced);
          saveLocalSequences(synced);
        } catch (e) {
          console.warn('Syncing sequences with Firestore offline/skipped:', e);
        }
      }
    });
    return () => unsubscribe();
  }, []);

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

  // Client-side intelligent fallback storyboard generator for offline or network issues
  const generateClientFallbackScenes = (rawConcept: string, styleText: string): Scene[] => {
    const norm = (rawConcept || '').toLowerCase();
    const style = styleText || 'hyper-detailed cinematic realism, golden hour lighting, 8k resolution';

    if (norm.includes('space') || norm.includes('فضاء') || norm.includes('كوكب') || norm.includes('galaxy') || norm.includes('star')) {
      return [
        {
          titleAr: "مغادرة المدار الأرضي",
          titleEn: "Leaving Earth's Orbit",
          promptAr: `مركبة استكشافية متطورة تقلع من محطة مدارية باتجاه الفضاء السحيق، انحناء كوكب الأرض يلمع في الأفق، ${style}`,
          promptEn: `A futuristic sleek starship ascending from an orbital station into deep space, Earth curve shimmering with atmospheric glow, cosmic dust particles, dramatic rim lighting, ${style}`,
          motion: "Zoom Out",
          intensity: 6,
          theme: "scifi"
        },
        {
          titleAr: "عبور السديم النجمي المتوهج",
          titleEn: "Crossing the Glowing Nebula",
          promptAr: `المركبة تنزلق عبر سديم أرجواني متوهج مليء بالطاقة والجسيمات المشعة والنجوم اليافعة، ${style}`,
          promptEn: `The starship gliding through a vibrant purple and cyan nebula cloud, glowing stellar dust and newborn stars illuminating hull reflections, ${style}`,
          motion: "Pan Right",
          intensity: 5,
          theme: "scifi"
        },
        {
          titleAr: "اقتراب من الكوكب المجهول",
          titleEn: "Approaching the Unknown Planet",
          promptAr: `المركبة تقترب من كوكب عملاق محاط بحلقات كريستالية ذهبية مضيئة وتيارات غازية زرقاء غامضة، ${style}`,
          promptEn: `Cinematic close shot of the spacecraft approaching a mysterious colossal ringed planet, golden reflections on crystalline ice rings, deep space shadows, ${style}`,
          motion: "Zoom In",
          intensity: 7,
          theme: "scifi"
        },
        {
          titleAr: "الهبوط على الواحة الفضائية العائمة",
          titleEn: "Touchdown on the Floating Biosphere",
          promptAr: `المركبة تهبط بلطف على منصة جليدية في جزر عائمة مغطاة بنباتات بيولوجية مضيئة، ${style}`,
          promptEn: `The starship landing smoothly on an alien cliff face, bioluminescent exotic flora glowing in warm twilight, cascading waterfalls into deep space, ${style}`,
          motion: "Static",
          intensity: 3,
          theme: "scifi"
        }
      ];
    }

    if (norm.includes('city') || norm.includes('مدينة') || norm.includes('cyber') || norm.includes('سايبر') || norm.includes('street') || norm.includes('شارع')) {
      return [
        {
          titleAr: "أزقة النيون وشوارع المطر",
          titleEn: "Rain-Slicked Neon Alley",
          promptAr: `مركبة طائرة تنزلق فوق شوارع مبللة بالأمطار تعكس لافتات النيون والشاشات الهولوغرافية الضخمة لمدينة عمودية، ${style}`,
          promptEn: `Futuristic hovercar gliding through rain-slicked cyberpunk streets reflecting massive animated holographic billboards, towering megacity architecture at night, ${style}`,
          motion: "Pan Left",
          intensity: 5,
          theme: "fantasy"
        },
        {
          titleAr: "بين ناطحات السحاب الشاهقة",
          titleEn: "Between Towering Megastructures",
          promptAr: `الكاميرا تتحرك للأعلى كاشفة عن مسارات النقل الجوي والجسور المعلقة بين الأبراج السحابية وسط ضباب ناعم، ${style}`,
          promptEn: `Upward camera tilt revealing busy multi-level aerial skyways, drones and flying vehicles weaving between cloud-piercing monolithic structures, ${style}`,
          motion: "Tilt Up",
          intensity: 7,
          theme: "fantasy"
        },
        {
          titleAr: "الرؤية من شرفة البطل",
          titleEn: "Protagonist Overlook",
          promptAr: `لقطة متوسطة لشخصية ترتدي معطفاً تقنياً تقف على حافة شرفة مرتفعة وتحدق في أضواء المدينة المترامية، ${style}`,
          promptEn: `Atmospheric medium shot of an enigmatic protagonist in techwear coat standing on a rain-swept high-rise balcony looking over the vibrant metropolis horizon, ${style}`,
          motion: "Zoom In",
          intensity: 4,
          theme: "fantasy"
        },
        {
          titleAr: "الانطلاق نحو المجهول",
          titleEn: "Acceleration into the Grid",
          promptAr: `انطلاق سريع للمركبة واختراقها جدار ضوئي نحو الأفق البعيد للمدينة في حركة ديناميكية ملحمية، ${style}`,
          promptEn: `Dynamic high-speed tracking shot as the hover vehicle accelerates past glowing laser checkpoints toward the city boundaries, light streaks, cinematic blur, ${style}`,
          motion: "Zoom Out",
          intensity: 8,
          theme: "fantasy"
        }
      ];
    }

    // General cinematic narrative sequence
    const shortLabel = rawConcept.length > 25 ? `${rawConcept.slice(0, 25)}...` : rawConcept;
    return [
      {
        titleAr: "بداية الرحلة والتمهيد الدرامي",
        titleEn: `Chapter I: Journey Begins (${shortLabel})`,
        promptAr: `مشهد افتتاحي واسع ومؤثر يجسد فكرة: "${rawConcept}". شخصية أو عنصر محوري يدخل البيئة المحيطة، إضاءة سينمائية عميقة وتفاصيل غنية، ${style}`,
        promptEn: `Establishing wide cinematic shot introducing the world of "${rawConcept}". A focal subject emerges into a vast, detailed environment with rich atmosphere and dramatic rim lighting, ${style}`,
        motion: "Pan Right",
        intensity: 5,
        theme: "nature"
      },
      {
        titleAr: "تصاعد الحدث والاستكشاف",
        titleEn: "Chapter II: Rising Discovery",
        promptAr: `الكاميرا تقترب ببطء لتكشف تفاصيل جديدة وأسرار غير متوقعة تتفاعل مع بؤرة المشهد: "${rawConcept}"، عمق ميدان فني، ${style}`,
        promptEn: `Slow dynamic camera movement delving deeper into the environment, revealing intricate hidden details and subtle atmospheric tension around "${rawConcept}", ${style}`,
        motion: "Tilt Down",
        intensity: 6,
        theme: "nature"
      },
      {
        titleAr: "لحظة الذروة والتفاعل الحاسم",
        titleEn: "Chapter III: The Climax & Encounter",
        promptAr: `لقطة قريبة وملحمية تركز على انفعالات الحدث وتفاصيله الدقيقة، طاقة بصرية متوهجة وإضاءة مشبعة، ${style}`,
        promptEn: `Close cinematic dramatic angle capturing the pinnacle moment of the sequence, high-contrast chiaroscuro lighting, emotional resonance and micro-texture depth, ${style}`,
        motion: "Zoom In",
        intensity: 4,
        theme: "nature"
      },
      {
        titleAr: "الخاتمة والأفق المفتوح",
        titleEn: "Chapter IV: The Unfolding Horizon",
        promptAr: `الكاميرا تبتعد ببطء كاشفة عن مشهد بانورامي ختامي يترك انطباعاً مبهراً وممتداً في الأفق، ${style}`,
        promptEn: `Grand panoramic pull-back shot revealing the expansive aftermath, epic scale with golden hour volumetric light rays cascading across the horizon, ${style}`,
        motion: "Zoom Out",
        intensity: 7,
        theme: "nature"
      }
    ];
  };

  // Generate sequence using backend API with graceful local fallback
  const handleGenerateSequence = async () => {
    if (!concept.trim()) {
      setErrorMessage(lang === 'ar' ? 'الرجاء إدخال فكرة أو مفهوم أولاً لتوليد السلسلة!' : 'Please enter a concept first!');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setIsPlaying(false);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9500);

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
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('API server returned error state');
      }

      const data = await response.json();
      if (data.scenes && Array.isArray(data.scenes) && data.scenes.length > 0) {
        setScenes(data.scenes);
        setActiveFrameIndex(0);
        setHasUnsavedChanges(true);
        if (data.isFallback) {
          showToast(
            lang === 'ar'
              ? 'تم تصميم تسلسل المشاهد بنجاح عبر المحاكي السردي الذكي'
              : 'Storyboard sequence generated via narrative fallback engine'
          );
        } else {
          showToast(
            lang === 'ar'
              ? '✓ تم توليد تسلسل المشاهد بنجاح!'
              : '✓ Sequence storyboard generated successfully!'
          );
        }
      } else {
        throw new Error('Invalid output structure');
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.warn('Backend sequence generation failed or timed out, generating local fallback sequence:', err);
      // Immediately generate local client fallback storyboard so user experience is smooth and non-blocking
      const fallbackScenes = generateClientFallbackScenes(concept, anchorStyle);
      setScenes(fallbackScenes);
      setActiveFrameIndex(0);
      setHasUnsavedChanges(true);
      showToast(
        lang === 'ar' 
          ? 'تم توليد السلسلة بنجاح عبر المحاكي السردي المدمج' 
          : 'Storyboard sequence generated via built-in narrative designer'
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
    setHasUnsavedChanges(true);
  };

  // Remove scenery scene
  const removeScene = (index: number) => {
    if (scenes.length <= 1) {
      setErrorMessage(lang === 'ar' ? 'يجب أن تبقي على مشهد واحد على الأقل في السلسلة!' : 'You must retain at least one scene in the sequence!');
      return;
    }
    const updated = scenes.filter((_, idx) => idx !== index);
    setScenes(updated);
    setHasUnsavedChanges(true);
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
    setHasUnsavedChanges(true);
    setActiveFrameIndex(scenes.length);
  };

  // Single copy utility
  const handleCopySingle = (text: string, index: number) => {
    navigator.clipboard.writeText(appendSiteUrlToPrompt(text));
    setCopiedIndex(index);
    showToast(lang === 'ar' ? `✓ تم نسخ برومبت المشهد #${index + 1} مع رابط المنصة!` : `✓ Prompt for Scene #${index + 1} copied with ArabPrompt link!`);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Compound copy utility for video models compiled prompt list
  const handleCopyAll = () => {
    const compoundText = scenes.map((scene, idx) => {
      const num = idx + 1;
      return `[Scene #${num} - Title: ${scene.titleEn}]\nPrompt: ${scene.promptEn}\nMotion: ${scene.motion} (Intensity: ${scene.intensity}/10)\nAspectRatio: ${aspectRatio}\n---`;
    }).join('\n\n');

    navigator.clipboard.writeText(appendSiteUrlToPrompt(compoundText));
    setCopiedAll(true);
    showToast(lang === 'ar' ? '✓ تم نسخ جميع المشاهد المتتالية كـ Storyboard مع رابط المنصة!' : '✓ Copied all sequence storyboard frames with ArabPrompt link!');
    setTimeout(() => setCopiedAll(false), 2000);
  };

  // Open Save Modal (or Quick Save if already named)
  const handleOpenSaveModal = () => {
    const defaultTitle = sequenceTitle || (concept.trim() ? concept.trim().slice(0, 35) : (lang === 'ar' ? 'مشروع سلسلة سينمائية' : 'Cinematic Sequence Project'));
    setSaveTitleInput(defaultTitle);
    setIsSaveModalOpen(true);
  };

  const handleConfirmSave = async (titleToUse: string, asNewCopy: boolean = false) => {
    const finalTitle = titleToUse.trim() || (lang === 'ar' ? 'سلسلة فيديو بدون عنوان' : 'Untitled Sequence');
    const now = new Date().toISOString();
    const idToUse = (!asNewCopy && currentSequenceId) ? currentSequenceId : `seq_${Date.now()}`;

    const seqToSave: SavedSequence = {
      id: idToUse,
      title: finalTitle,
      concept,
      anchorStyle,
      aspectRatio,
      transitionEffect,
      scenes,
      createdAt: (!asNewCopy && currentSequenceId) 
        ? (savedSequences.find(s => s.id === currentSequenceId)?.createdAt || now) 
        : now,
      updatedAt: now,
    };

    setIsSaving(true);
    try {
      const existingIdx = savedSequences.findIndex(s => s.id === idToUse);
      let updatedList: SavedSequence[];
      if (existingIdx >= 0) {
        updatedList = [...savedSequences];
        updatedList[existingIdx] = seqToSave;
      } else {
        updatedList = [seqToSave, ...savedSequences];
      }

      setSavedSequences(updatedList);
      saveLocalSequences(updatedList);
      setCurrentSequenceId(idToUse);
      setSequenceTitle(finalTitle);
      setHasUnsavedChanges(false);
      setLastSavedTime(new Date().toLocaleTimeString(lang === 'ar' ? 'ar-u-nu-latn' : 'en-US', { hour: '2-digit', minute: '2-digit' }));
      setIsSaveModalOpen(false);

      if (auth.currentUser) {
        saveUserSequence(auth.currentUser.uid, seqToSave).catch(err => {
          console.warn('Error saving sequence to Firestore:', err);
        });
      }

      showToast(lang === 'ar' ? `✓ تم حفظ سلسلة "${finalTitle}" بنجاح!` : `✓ Saved sequence "${finalTitle}" successfully!`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickSave = () => {
    if (currentSequenceId) {
      handleConfirmSave(sequenceTitle || (concept.slice(0, 35) || (lang === 'ar' ? 'مشروع السلسلة' : 'Sequence Project')), false);
    } else {
      handleOpenSaveModal();
    }
  };

  const handleOpenShareModal = async () => {
    if (scenes.length === 0) {
      showToast(
        lang === 'ar'
          ? '⚠️ لا توجد مشاهد حالياً. أنشئ أو ولّد مشاهد لمشاركتها.'
          : '⚠️ No scenes to share yet. Generate or add scenes first.',
        true
      );
      return;
    }

    setIsSharing(true);
    try {
      const finalTitle = sequenceTitle.trim() || (concept ? concept.slice(0, 45) : '') || (lang === 'ar' ? 'سلسلة مشاهد سينمائية' : 'Storyboard Cinematic Sequence');
      const shareId = `seq_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

      const sharePayload = {
        id: shareId,
        type: 'storyboard' as const,
        title: finalTitle,
        concept,
        anchorStyle,
        aspectRatio,
        transitionEffect,
        scenes,
        authorName: auth.currentUser?.displayName || undefined,
        storyboardSequence: {
          id: currentSequenceId || `seq_${Date.now()}`,
          title: finalTitle,
          concept,
          anchorStyle,
          aspectRatio,
          transitionEffect,
          scenes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };

      // 1. Save snapshot to Firestore shared_sequences
      await createSharedSequence(sharePayload);

      // 2. Build direct URL
      const currentUrl = new URL(window.location.origin + window.location.pathname);
      currentUrl.searchParams.set('tab', 'sequence');
      currentUrl.searchParams.set('seq', shareId);

      setShareUrl(currentUrl.toString());
      setIsShareModalOpen(true);
    } catch (e) {
      console.error('Error generating share link:', e);
      // Fallback with encoded data
      try {
        const hash = encodeSequenceToHash({
          title: sequenceTitle || concept.slice(0, 40),
          concept,
          anchorStyle,
          aspectRatio,
          transitionEffect,
          scenes
        });
        const fallbackUrl = new URL(window.location.origin + window.location.pathname);
        fallbackUrl.searchParams.set('tab', 'sequence');
        fallbackUrl.searchParams.set('sseq', hash);
        setShareUrl(fallbackUrl.toString());
        setIsShareModalOpen(true);
      } catch {
        showToast(lang === 'ar' ? 'تعذر إنشاء رابط المشاركة.' : 'Could not create share link.', true);
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleLoadSequence = (seq: SavedSequence) => {
    setConcept(seq.concept || '');
    setAnchorStyle(seq.anchorStyle || '');
    setAspectRatio(seq.aspectRatio || '16:9');
    setTransitionEffect(seq.transitionEffect || 'fade');
    setScenes(seq.scenes && seq.scenes.length > 0 ? seq.scenes : [
      {
        titleAr: "المشهد 1",
        titleEn: "Scene 1",
        promptAr: "توصيف المشهد...",
        promptEn: "Scene description...",
        motion: "Zoom In",
        intensity: 5,
        theme: "nature"
      }
    ]);
    setCurrentSequenceId(seq.id);
    setSequenceTitle(seq.title);
    setActiveFrameIndex(0);
    setElapsedMs(0);
    setIsPlaying(false);
    setHasUnsavedChanges(false);
    setLastSavedTime(new Date(seq.updatedAt).toLocaleTimeString(lang === 'ar' ? 'ar-u-nu-latn' : 'en-US', { hour: '2-digit', minute: '2-digit' }));
    setIsSavedDrawerOpen(false);

    showToast(
      lang === 'ar' 
        ? `✓ تم تحميل سلسلة "${seq.title}" بنجاح! يمكنك إكمال العمل عليها الآن.` 
        : `✓ Loaded sequence "${seq.title}"! You can now continue editing.`
    );
  };

  const handleDeleteSequence = async (id: string, title: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm(lang === 'ar' ? `هل أنت متأكد من حذف سلسلة "${title}"؟` : `Are you sure you want to delete "${title}"?`)) {
      return;
    }

    const updated = savedSequences.filter(s => s.id !== id);
    setSavedSequences(updated);
    saveLocalSequences(updated);

    if (currentSequenceId === id) {
      setCurrentSequenceId(null);
      setSequenceTitle('');
      setHasUnsavedChanges(true);
    }

    if (auth.currentUser) {
      deleteUserSequence(auth.currentUser.uid, id).catch(err => {
        console.warn('Error deleting sequence from Firestore:', err);
      });
    }

    showToast(lang === 'ar' ? `تم حذف السلسلة بنجاح.` : `Sequence deleted successfully.`);
  };

  const handleDuplicateSequence = (seq: SavedSequence, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newId = `seq_${Date.now()}`;
    const copyTitle = `${seq.title} (${lang === 'ar' ? 'نسخة' : 'Copy'})`;
    const now = new Date().toISOString();
    const duplicate: SavedSequence = {
      ...seq,
      id: newId,
      title: copyTitle,
      createdAt: now,
      updatedAt: now,
    };

    const updated = [duplicate, ...savedSequences];
    setSavedSequences(updated);
    saveLocalSequences(updated);

    if (auth.currentUser) {
      saveUserSequence(auth.currentUser.uid, duplicate).catch(err => console.warn(err));
    }

    showToast(lang === 'ar' ? `✓ تم إنشاء نسخة من السلسلة بنجاح!` : `✓ Duplicated sequence successfully!`);
  };

  const handleNewSequence = () => {
    if (hasUnsavedChanges) {
      if (!window.confirm(lang === 'ar' ? 'لديك تعديلات غير محفوظة. هل تريد بدء مشروع جديد؟' : 'You have unsaved changes. Start a new project?')) {
        return;
      }
    }
    setConcept('');
    setAnchorStyle('hyper-detailed cinematic realism, golden hour lighting, 8k resolution');
    setAspectRatio('16:9');
    setTransitionEffect('fade');
    setScenes([
      {
        titleAr: "مشهد البداية",
        titleEn: "Opening Scene",
        promptAr: "اكتب وصف المشهد الافتتاحي هنا...",
        promptEn: "Describe opening scene here...",
        motion: "Pan Right",
        intensity: 4,
        theme: "nature"
      }
    ]);
    setCurrentSequenceId(null);
    setSequenceTitle('');
    setHasUnsavedChanges(false);
    setLastSavedTime(null);
    setActiveFrameIndex(0);
    setElapsedMs(0);
    setIsPlaying(false);
    setIsSavedDrawerOpen(false);
    showToast(lang === 'ar' ? 'تم بدء سلسلة فيديو جديدة!' : 'Started a new blank video sequence!');
  };

  const handleExportSequence = (seq: SavedSequence, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(seq, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${seq.title.replace(/[^\w\u0600-\u06FF]/g, '_')}_sequence.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(lang === 'ar' ? '✓ تم تصدير ملف السلسلة بنجاح!' : '✓ Exported sequence JSON!');
  };

  const handleImportSequenceFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (!parsed.scenes || !Array.isArray(parsed.scenes)) {
          throw new Error('Invalid sequence file');
        }
        const now = new Date().toISOString();
        const importedSeq: SavedSequence = {
          id: `seq_${Date.now()}`,
          title: parsed.title ? `${parsed.title} (${lang === 'ar' ? 'مستورد' : 'Imported'})` : (lang === 'ar' ? 'سلسلة مستوردة' : 'Imported Sequence'),
          concept: parsed.concept || '',
          anchorStyle: parsed.anchorStyle || '',
          aspectRatio: parsed.aspectRatio || '16:9',
          transitionEffect: parsed.transitionEffect || 'fade',
          scenes: parsed.scenes,
          createdAt: now,
          updatedAt: now,
        };

        const updated = [importedSeq, ...savedSequences];
        setSavedSequences(updated);
        saveLocalSequences(updated);
        handleLoadSequence(importedSeq);
        showToast(lang === 'ar' ? '✓ تم استيراد السلسلة وتحميلها بنجاح!' : '✓ Imported and loaded sequence successfully!');
      } catch (err) {
        console.error(err);
        showToast(lang === 'ar' ? '⚠️ فشل استيراد الملف: تأكد من أنه ملف JSON لسلسلة صالحة.' : '⚠️ Invalid sequence file.');
      }
    };
    reader.readAsText(file);
    if (importFileInputRef.current) {
      importFileInputRef.current.value = '';
    }
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
        e.preventDefault();
        handleQuickSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [concept, anchorStyle, scenes, isLoading, aspectRatio, transitionEffect, currentSequenceId, sequenceTitle, savedSequences]);

  const handleLoadTemplate = (chosenConcept: string, chosenStyle: string) => {
    setConcept(chosenConcept);
    setAnchorStyle(chosenStyle);
    setHasUnsavedChanges(true);
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
      
      {/* Hidden File Input for Importing Sequences */}
      <input
        type="file"
        ref={importFileInputRef}
        onChange={handleImportSequenceFile}
        accept=".json"
        className="hidden"
      />

      {/* 1. Header & Quick description */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-stone-200 pb-6 mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 flex items-center gap-2">
              <Film className="w-7 h-7 text-[#c29b40] shrink-0" />
              <span>{lang === 'ar' ? 'سلاسل الرسوم ومُخرّج المشاهد للفيديو' : 'AI Video Sequence & Storyboard Designer'}</span>
            </h2>

            {/* Active Project Pill Badge */}
            {currentSequenceId && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-[#916a24] text-xs font-bold shadow-2xs">
                <Bookmark className="w-3.5 h-3.5 fill-amber-500/20" />
                <span className="truncate max-w-[180px] sm:max-w-[240px]">{sequenceTitle}</span>
                {hasUnsavedChanges ? (
                  <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 bg-amber-100/80 px-1.5 py-0.5 rounded-full font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                    {lang === 'ar' ? 'تعديلات غير محفوظة' : 'Unsaved'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full font-semibold">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    {lang === 'ar' ? 'محفوظ' : 'Saved'}
                  </span>
                )}
              </div>
            )}
          </div>

          <p className="text-stone-500 text-sm mt-1 max-w-2xl font-medium leading-relaxed">
            {lang === 'ar'
              ? 'صمم تتابع الأوامر والمشاهد لإنتاج فيديوهات متناسقة ذكياً. احفظ مسودة مشروعك في أي لحظة للرجوع إليها واستكمالها لاحقاً.'
              : 'Construct and align cohesive frames for video synthesis. Save your storyboard anytime to resume editing seamlessly.'}
          </p>

          {lastSavedTime && (
            <p className="text-[11px] text-stone-400 mt-1 flex items-center gap-1 font-mono">
              <Clock className="w-3 h-3 text-[#c29b40]" />
              <span>{lang === 'ar' ? `آخر حفظ: ${lastSavedTime}` : `Last saved: ${lastSavedTime}`}</span>
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {/* Saved Sequences Drawer Button */}
          <button
            onClick={() => setIsSavedDrawerOpen(true)}
            className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 hover:border-[#c29b40]/50 transition-all flex items-center gap-2 cursor-pointer shadow-xs group"
            title={lang === 'ar' ? 'عرض السلاسل المحفوظة والمشاريع السابقة' : 'Open Saved Sequences'}
          >
            <FolderOpen className="w-4 h-4 text-[#c29b40] group-hover:scale-110 transition-transform" />
            <span>{lang === 'ar' ? 'السلاسل المحفوظة' : 'Saved Sequences'}</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-stone-100 text-stone-700 group-hover:bg-[#c29b40] group-hover:text-white transition-colors">
              {savedSequences.length}
            </span>
          </button>

          {/* Save Sequence Button */}
          <button
            onClick={handleQuickSave}
            disabled={isSaving}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
              hasUnsavedChanges || !currentSequenceId
                ? 'bg-[#c29b40] hover:bg-[#b08732] text-white shadow-[#c29b40]/20'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200'
            }`}
            title={lang === 'ar' ? 'حفظ سلسلة الفيديو الحالية للعودة إليها لاحقاً (Ctrl+S)' : 'Save current sequence to resume later (Ctrl+S)'}
          >
            <Save className={`w-4 h-4 ${hasUnsavedChanges ? 'animate-bounce' : ''}`} />
            <span>
              {isSaving
                ? (lang === 'ar' ? 'جاري الحفظ...' : 'Saving...')
                : currentSequenceId
                ? (hasUnsavedChanges
                    ? (lang === 'ar' ? 'حفظ التعديلات' : 'Save Changes')
                    : (lang === 'ar' ? 'تم الحفظ ✓' : 'Saved ✓'))
                : (lang === 'ar' ? 'حفظ السلسلة' : 'Save Sequence')}
            </span>
          </button>

          {/* New blank sequence button */}
          <button
            onClick={handleNewSequence}
            className="p-2.5 rounded-xl text-xs font-bold text-stone-600 bg-white hover:bg-stone-50 border border-stone-200 hover:border-stone-300 transition-all cursor-pointer shadow-xs"
            title={lang === 'ar' ? 'بدء مشروع سلسلة جديدة فارغة' : 'New Blank Project'}
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Copy Full Storyboard Button */}
          <button
            onClick={handleCopyAll}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-stone-800 bg-white hover:bg-stone-50 border border-stone-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs hover:border-stone-300"
            title={lang === 'ar' ? 'نسخ مصفوفة التتابع بالكامل' : 'Copy Full Storyboard'}
          >
            {copiedAll ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{lang === 'ar' ? 'تم النسخ!' : 'Copied!'}</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-[#c29b40]" />
                <span>{lang === 'ar' ? 'نسخ المصفوفة' : 'Copy Storyboard'}</span>
              </>
            )}
          </button>

          {/* Share Sequence Button */}
          <button
            onClick={handleOpenShareModal}
            disabled={scenes.length === 0 || isSharing}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-stone-800 bg-white hover:bg-amber-50 hover:text-[#916a24] border border-stone-200 hover:border-[#c29b40]/60 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed group"
            title={lang === 'ar' ? 'مشاركة السلسلة وتوليد رابط فريد (Share)' : 'Share Sequence & Generate Unique Link'}
          >
            <Share2 className="w-4 h-4 text-[#c29b40] group-hover:scale-110 transition-transform" />
            <span>{isSharing ? (lang === 'ar' ? 'جاري التجهيز...' : 'Preparing...') : (lang === 'ar' ? 'مشاركة السلسلة' : 'Share Sequence')}</span>
          </button>
        </div>
      </div>

      {/* Shared Sequence Welcoming Banner if loaded via deep link */}
      {sharedBannerInfo && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-[#c29b40]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#c29b40] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-stone-900">
                  {lang === 'ar' ? '✨ تم فتح السلسلة المشتركة:' : '✨ Shared Sequence Loaded:'}
                </span>
                <span className="text-xs font-extrabold text-[#916a24] bg-white px-2 py-0.5 rounded-md border border-[#c29b40]/20">
                  "{sharedBannerInfo.title}"
                </span>
                {sharedBannerInfo.authorName && (
                  <span className="text-[11px] text-stone-500">
                    {lang === 'ar' ? `بواسطة ${sharedBannerInfo.authorName}` : `by ${sharedBannerInfo.authorName}`}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-600 mt-0.5">
                {lang === 'ar'
                  ? 'يمكنك معاينة اللقطات عبر المشغّل، نسخ الأوامر لمحركات التوليد، أو حفظ هذه السلسلة في مشاريعك الخاصة.'
                  : 'You can preview frames in player, copy prompts to generators, or save this sequence into your own library.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              onClick={() => handleQuickSave()}
              className="px-3 py-1.5 rounded-xl bg-[#c29b40] hover:bg-[#a6802f] text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'حفظ في مشاريعي' : 'Save to My Projects'}</span>
            </button>
            <button
              onClick={() => setSharedBannerInfo(null)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              title={lang === 'ar' ? 'إخفاء' : 'Dismiss'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

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

              {scenes.length === 0 ? (
                <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center space-y-2 select-none">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#c29b40]">
                    <Film className="w-6 h-6" />
                  </div>
                  <h4 className="text-white text-xs font-bold">
                    {lang === 'ar' ? 'شاشة المحاكاة بانتظار توليد فكرتك' : 'Simulation screen awaiting concept'}
                  </h4>
                  <p className="text-stone-400 text-[10px] max-w-xs leading-relaxed">
                    {lang === 'ar' ? 'أدخل فكرتك في اللوحة الجانبية واضغط "برمجة وتوليد السلسلة" لتنشيط المشاهد.' : 'Enter your concept on the side to simulate scenes and camera movements.'}
                  </p>
                </div>
              ) : (
                /* Transition Layer */
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
              )}
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
                  onChange={(e) => { setAspectRatio(e.target.value); setHasUnsavedChanges(true); }}
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
                  onChange={(e) => { setTransitionEffect(e.target.value); setHasUnsavedChanges(true); }}
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
                onChange={(e) => { setAnchorStyle(e.target.value); setHasUnsavedChanges(true); }}
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
                  onChange={(e) => { setConcept(e.target.value); setErrorMessage(''); setHasUnsavedChanges(true); }}
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
              <div className="flex items-center gap-2">
                {scenes.length > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={handleCopyAll}
                      className="px-3 py-1.5 rounded-xl bg-[#c29b40] hover:bg-[#a6802f] text-stone-950 font-black text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                      title={lang === 'ar' ? 'نسخ جميع برومبتات السلسلة دفعة واحدة' : 'Copy All Sequence Prompts'}
                    >
                      {copiedAll ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-stone-950" />
                          <span>{lang === 'ar' ? 'تم نسخ جميع البرومبتات!' : 'All Prompts Copied!'}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>{lang === 'ar' ? 'نسخ جميع البرومبتات' : 'Copy All Prompts'}</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleOpenShareModal}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-50 text-stone-800 font-bold text-xs transition-all flex items-center gap-1.5 border border-stone-200 shadow-2xs cursor-pointer hover:border-[#c29b40]/50"
                      title={lang === 'ar' ? 'مشاركة السلسلة وتوليد رابط فريد' : 'Share Sequence & Generate Unique Link'}
                    >
                      <Share2 className="w-3.5 h-3.5 text-[#c29b40]" />
                      <span>{lang === 'ar' ? 'مشاركة' : 'Share'}</span>
                    </button>
                  </>
                )}
                <span className="text-[10px] font-bold text-stone-400 bg-stone-50 border border-stone-150 rounded-full px-2.5 py-1">
                  {scenes.length} {lang === 'ar' ? 'مشاهد منشأة' : 'Scenes Drafted'}
                </span>
              </div>
            </div>

            {/* Frame List Container */}
            <div className="space-y-6">
              {scenes.length === 0 ? (
                <div className="bg-stone-50/70 rounded-2xl border-2 border-dashed border-stone-200 p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#c29b40] flex items-center justify-center mx-auto border border-amber-200">
                    <Clapperboard className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-stone-800">
                      {lang === 'ar' ? 'لا توجد مشاهد مسبقة - السلسلة تنتظر فكرتك الخاصة' : 'No pre-set scenes - Awaiting your concept'}
                    </h4>
                    <p className="text-[11px] text-stone-500 max-w-sm mx-auto leading-relaxed">
                      {lang === 'ar'
                        ? 'اكتب فكرة الفيلم في المربع بالأعلى واضغط على "برمجة وتوليد السلسلة سينمائياً" لتوليد مشاهد فيلمك المخصصة بالكامل.'
                        : 'Type your movie idea above and click "Generate Cinematic Sequence" to build your custom scenes.'}
                    </p>
                  </div>
                </div>
              ) : (
                scenes.map((scene, index) => {
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
                            title={lang === 'ar' ? 'تعديل هذا الكادر في مُهندس الأوامر' : 'Edit this prompt snippet in Builder'}
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>{lang === 'ar' ? 'إرسال للمهندس' : 'To Builder'}</span>
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
              }))}
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

      {/* Save Sequence Modal */}
      <AnimatePresence>
        {isSaveModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-md p-6 overflow-hidden text-right rtl:text-right relative"
            >
              <div className="flex items-center justify-between mb-4 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-50 text-[#c29b40] rounded-xl">
                    <Save className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-stone-900">
                      {lang === 'ar' ? 'حفظ مشروع سلسلة الفيديو' : 'Save Video Sequence Project'}
                    </h3>
                    <p className="text-[11px] text-stone-400">
                      {lang === 'ar' ? 'احفظ تقدمك الحالي للعودة إليه وإكماله في أي وقت' : 'Save your storyboard to resume editing anytime'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSaveModalOpen(false)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    {lang === 'ar' ? 'عنوان أو اسم المشروع:' : 'Project Title:'}
                  </label>
                  <input
                    type="text"
                    value={saveTitleInput}
                    onChange={(e) => setSaveTitleInput(e.target.value)}
                    placeholder={lang === 'ar' ? 'مثال: رحلة استكشاف الكهف الكريستالي' : 'e.g. Crystal Cave Expedition'}
                    className="w-full text-xs font-semibold p-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#c29b40]/30 focus:border-[#c29b40] bg-stone-50/50"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleConfirmSave(saveTitleInput, false);
                      }
                    }}
                  />
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/70 text-[11px] text-stone-500 space-y-1">
                  <div className="flex justify-between">
                    <span>{lang === 'ar' ? 'عدد المشاهد المضمّنة:' : 'Scenes count:'}</span>
                    <strong className="text-stone-800">{scenes.length} {lang === 'ar' ? 'مشاهد' : 'scenes'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>{lang === 'ar' ? 'أبعاد الكادر:' : 'Aspect Ratio:'}</span>
                    <strong className="text-stone-800">{aspectRatio}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>{lang === 'ar' ? 'حالة التخزين:' : 'Storage:'}</span>
                    <strong className="text-emerald-700">{auth.currentUser ? (lang === 'ar' ? 'محلي + سحابي (Firestore)' : 'Local + Cloud Firestore') : (lang === 'ar' ? 'تخزين محلي آمن' : 'Local Storage')}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => handleConfirmSave(saveTitleInput, false)}
                    disabled={isSaving}
                    className="flex-1 py-2.5 px-4 bg-[#c29b40] hover:bg-[#b08732] text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? (lang === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (lang === 'ar' ? 'حفظ ومتابعة العمل' : 'Save Project')}</span>
                  </button>

                  {currentSequenceId && (
                    <button
                      onClick={() => handleConfirmSave(saveTitleInput, true)}
                      disabled={isSaving}
                      className="py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                      title={lang === 'ar' ? 'حفظ كنسخة جديدة مستقلة' : 'Save as a separate copy'}
                    >
                      {lang === 'ar' ? 'حفظ كنسخة جديدة' : 'Save as Copy'}
                    </button>
                  )}

                  <button
                    onClick={() => setIsSaveModalOpen(false)}
                    className="py-2.5 px-3 bg-white hover:bg-stone-50 text-stone-600 border border-stone-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Saved Sequences Drawer / Modal */}
      <AnimatePresence>
        {isSavedDrawerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden text-right rtl:text-right relative"
            >
              {/* Drawer Header */}
              <div className="p-5 sm:p-6 border-b border-stone-100 bg-gradient-to-r from-stone-50 via-white to-stone-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-[#c29b40] flex items-center justify-center shadow-xs">
                    <FolderOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black text-stone-900">
                        {lang === 'ar' ? 'سلاسل الفيديو والمشاريع المحفوظة' : 'Saved Video Sequence Projects'}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-xs font-black bg-[#c29b40]/10 text-[#916a24]">
                        {savedSequences.length}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {lang === 'ar' ? 'اختر أي سلسلة لمتابعة تحريرها وإكمالها، أو صدّرها كملف للمشاركة' : 'Resume any storyboard to continue crafting, or export it'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => importFileInputRef.current?.click()}
                    className="px-3 py-1.5 text-xs font-bold text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    title={lang === 'ar' ? 'استيراد مشروع سلسلة من ملف JSON' : 'Import sequence from JSON'}
                  >
                    <Upload className="w-3.5 h-3.5 text-[#c29b40]" />
                    <span className="hidden sm:inline">{lang === 'ar' ? 'استيراد JSON' : 'Import JSON'}</span>
                  </button>

                  <button
                    onClick={() => setIsSavedDrawerOpen(false)}
                    className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="p-4 border-b border-stone-100 bg-[#fdfdfc]">
                <div className="relative">
                  <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none rtl:right-3.5 ltr:left-3.5 rtl:left-auto" />
                  <input
                    type="text"
                    value={searchSavedQuery}
                    onChange={(e) => setSearchSavedQuery(e.target.value)}
                    placeholder={lang === 'ar' ? 'ابحث في المشاريع بالاسم أو الفكرة...' : 'Search projects by name or concept...'}
                    className="w-full text-xs font-semibold py-2.5 px-10 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#c29b40]/30 focus:border-[#c29b40] bg-white shadow-2xs"
                  />
                  {searchSavedQuery && (
                    <button
                      onClick={() => setSearchSavedQuery('')}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs font-bold cursor-pointer rtl:left-3 rtl:right-auto"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Sequences List */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3.5 bg-stone-50/40">
                {savedSequences.length === 0 ? (
                  <div className="text-center py-12 px-4 bg-white rounded-2xl border border-dashed border-stone-200 space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-50 text-[#c29b40] flex items-center justify-center">
                      <Film className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-black text-stone-800">
                      {lang === 'ar' ? 'لا توجد سلاسل محفوظة حتى الآن' : 'No saved sequences yet'}
                    </h4>
                    <p className="text-xs text-stone-400 max-w-sm mx-auto">
                      {lang === 'ar' 
                        ? 'يمكنك حفظ السلسلة المفتوحة حالياً للرجوع إليها وإكمال تحرير مشاهدها في أي وقت.'
                        : 'You can save your current storyboard now and return to continue crafting frames later.'}
                    </p>
                    <button
                      onClick={() => {
                        setIsSavedDrawerOpen(false);
                        handleOpenSaveModal();
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black text-white bg-[#c29b40] hover:bg-[#b08732] shadow-sm cursor-pointer transition-all"
                    >
                      <Save className="w-4 h-4" />
                      <span>{lang === 'ar' ? 'حفظ السلسلة الحالية الآن' : 'Save Current Sequence'}</span>
                    </button>
                  </div>
                ) : (
                  (() => {
                    const filtered = savedSequences.filter(s => 
                      !searchSavedQuery || 
                      s.title.toLowerCase().includes(searchSavedQuery.toLowerCase()) ||
                      s.concept.toLowerCase().includes(searchSavedQuery.toLowerCase())
                    );

                    if (filtered.length === 0) {
                      return (
                        <div className="text-center py-10 text-stone-400 text-xs">
                          {lang === 'ar' ? 'لا توجد نتائج مطابقة لبحثك.' : 'No matching projects found.'}
                        </div>
                      );
                    }

                    return filtered.map((seq) => {
                      const isActive = seq.id === currentSequenceId;
                      return (
                        <div
                          key={seq.id}
                          className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all duration-200 space-y-3 relative group hover:shadow-md ${
                            isActive 
                              ? 'border-[#c29b40] ring-2 ring-[#c29b40]/20 bg-amber-50/10' 
                              : 'border-stone-200 hover:border-stone-300'
                          }`}
                        >
                          {/* Item Top Row */}
                          <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div className="space-y-1 flex-1 min-w-[200px]">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-black text-stone-900 leading-snug">
                                  {seq.title}
                                </h4>
                                {isActive && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                    {lang === 'ar' ? 'السلسلة المفتوحة حالياً' : 'Currently Active'}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-stone-400 flex items-center gap-2 flex-wrap font-mono">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(seq.updatedAt).toLocaleDateString(lang === 'ar' ? 'ar-u-nu-latn' : 'en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </p>
                            </div>

                            {/* Badges */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-stone-100 text-stone-700 border border-stone-200 flex items-center gap-1">
                                <Layers className="w-3 h-3 text-[#c29b40]" />
                                {seq.scenes?.length || 0} {lang === 'ar' ? 'مشاهد' : 'scenes'}
                              </span>
                              <span className="px-2 py-1 rounded-lg text-[10px] font-extrabold bg-stone-100 text-stone-600 border border-stone-200">
                                {seq.aspectRatio || '16:9'}
                              </span>
                            </div>
                          </div>

                          {/* Concept Preview */}
                          {seq.concept && (
                            <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                              {seq.concept}
                            </p>
                          )}

                          {/* Item Action Buttons */}
                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-100 flex-wrap">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleLoadSequence(seq)}
                                className="px-4 py-2 rounded-xl text-xs font-black text-white bg-[#c29b40] hover:bg-[#b08732] transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                              >
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>{lang === 'ar' ? 'متابعة وإكمال العمل 🚀' : 'Resume & Edit 🚀'}</span>
                              </button>

                              <button
                                onClick={(e) => handleDuplicateSequence(seq, e)}
                                className="p-2 rounded-xl text-xs font-bold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 transition-all cursor-pointer"
                                title={lang === 'ar' ? 'تكرار كنسخة جديدة' : 'Duplicate project'}
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={(e) => handleExportSequence(seq, e)}
                                className="p-2 rounded-xl text-xs font-bold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 transition-all cursor-pointer"
                                title={lang === 'ar' ? 'تصدير كملف JSON' : 'Export JSON file'}
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <button
                              onClick={(e) => handleDeleteSequence(seq.id, seq.title, e)}
                              className="p-2 rounded-xl text-xs font-bold text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-all cursor-pointer"
                              title={lang === 'ar' ? 'حذف هذه السلسلة' : 'Delete sequence'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    });
                  })()
                )}
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-stone-100 bg-stone-50/80 flex items-center justify-between flex-wrap gap-2">
                <button
                  onClick={handleNewSequence}
                  className="px-3.5 py-2 text-xs font-bold text-stone-700 hover:text-stone-900 bg-white hover:bg-stone-100 border border-stone-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Plus className="w-4 h-4 text-[#c29b40]" />
                  <span>{lang === 'ar' ? 'بدء مشروع جديد فارغ' : 'Start Blank Project'}</span>
                </button>

                <button
                  onClick={() => setIsSavedDrawerOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-stone-600 hover:text-stone-900 bg-white hover:bg-stone-100 border border-stone-200 rounded-xl transition-all cursor-pointer"
                >
                  {lang === 'ar' ? 'إغلاق النافذة' : 'Close'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Share Sequence Modal */}
      <ShareSequenceModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        lang={lang}
        shareUrl={shareUrl}
        title={sequenceTitle || concept.slice(0, 45) || (lang === 'ar' ? 'سلسلة مشاهد فيديو' : 'Video Storyboard Sequence')}
        concept={concept}
        scenesCount={scenes.length}
        sequenceType="storyboard"
        styleOrGenre={anchorStyle}
        previewScenes={scenes.map(s => ({
          title: lang === 'ar' ? s.titleAr : s.titleEn,
          prompt: s.promptEn
        }))}
      />
    </div>
  );
}
