/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Sparkles, Copy, Check, Star, Search, Sliders, ArrowUpRight, 
  RotateCcw, Download, Upload, Plus, Layers, Image as ImageIcon, 
  FileText, Wand2, Compass, ShieldCheck, CheckCheck, RefreshCw, 
  Tag, ExternalLink, ArrowRight, ArrowLeft, Eye, Bookmark,
  Cpu, Zap, Code2, Film, Palette, Share2, Music, Smartphone,
  Globe, Megaphone, Trash2, Info, GraduationCap, CheckSquare,
  AlertTriangle, BookOpen, BookCheck, HelpCircle, FileCheck, PenTool,
  FileJson, CheckCircle2, X
} from 'lucide-react';
import { AppLanguage, ModelType } from '../types';
import { DEFAULT_PROMPTS_LIBRARY, PromptLibraryCard } from '../data/promptsLibraryData';
import { showToast } from './ToastNotification';
import CinematicLibraryStudio from './CinematicLibraryStudio';

interface PromptLibraryProps {
  lang: AppLanguage;
  onSendToBuilder?: (promptText: string, model?: ModelType, tone?: string, category?: string) => void;
  onNavigateTab?: (tab: string) => void;
}

// 12 Specialized Domain Rule Sets (including Academic Research)
const DOMAIN_CATEGORIES: Record<string, { nameAr: string; nameEn: string; rulesAr: string; rulesEn: string; icon: any }> = {
  research: {
    nameAr: 'البحث العلمي والدراسات العليا والأكاديمية',
    nameEn: 'Academic Research & Literature Review',
    rulesAr: 'الالتزام الصارم بالمنهجية العلمية الرصينة: تحديد الفجوة المعرفية (Research Gap)، صياغة أسئلة بحثية قابلة للاختبار، استخدام أطر ROPE و APE، تجنب المصادر الوهمية والهلوسة، وتوثيق المراجع بدقة وفق معايير APA 7th Edition.',
    rulesEn: 'Strict adherence to academic rigor: define research gaps, testable hypotheses, conceptual clarity, empirical grounding, ethical AI disclosure, and precise APA-7 citation adherence.',
    icon: GraduationCap
  },
  image: {
    nameAr: 'تصميم صورة واقعية',
    nameEn: 'Photorealistic Image Design',
    rulesAr: 'إخراج وصف بصري دقيق: الموضوع، التكوين، زاوية الكاميرا، نوع العدسة والبعد البؤري، توزيع الإضاءة، الخامات، لوحة الألوان، الخلفية، ونسبة الأبعاد.',
    rulesEn: 'Produce a meticulous visual description: subject, framing, camera angle, lens & focal length, lighting architecture, textures, color palette, background, and aspect ratio.',
    icon: ImageIcon
  },
  poster: {
    nameAr: 'ملصق أو إعلان تجاري',
    nameEn: 'Poster & Commercial Advertisement',
    rulesAr: 'تركيز على العنوان الرئيسي الجذاب، الرسالة الإعلانية، الهوية البصرية، التراتب البصري، المساحة السلبية، نداء اتخاذ الإجراء (CTA)، والنصوص المقروءة.',
    rulesEn: 'Focus on a compelling headline, advertising message, visual identity, visual hierarchy, negative space, strong Call-to-Action (CTA), and legible typography.',
    icon: Megaphone
  },
  logo: {
    nameAr: 'شعار وهوية بصرية للمؤسسات',
    nameEn: 'Logo & Corporate Brand Identity',
    rulesAr: 'شعار مينيمالي بسيط وقابل للتوسيع (Scalable)، أشكال هندسية متناسقة، النسبة الذهبية، دلالات الألوان، الخطوط الطباعية، وتطبيقات الاستخدام.',
    rulesEn: 'Minimalist, scalable vector logo, balanced geometric shapes, golden ratio, color psychology, typography pairing, and versatile brand applications.',
    icon: Palette
  },
  video: {
    nameAr: 'فيديو وسيناريو سينمائي',
    nameEn: 'Cinematic Video & Scene',
    rulesAr: 'تحديد المشاهد والتسلسل الزمني، حركة كاميرا الدرون/الكرين، حركة الشخصيات، الإضاءة المتغيرة، الانتقالات البصرية، الصوت المحيطي، واتساق المشهد.',
    rulesEn: 'Define scenes and chronological pacing, drone/crane camera physics, character movement, dynamic lighting, transitions, ambient sound design, and scene continuity.',
    icon: Film
  },
  series: {
    nameAr: 'سلسلة فيديوهات قصيرة (Reels / TikTok)',
    nameEn: 'Short Video Series (Reels / Shorts)',
    rulesAr: 'تقسيم إلى مشاهد خاطفة (10 ثوانٍ)، خطاف بصري في أول ثانيتين (Hook)، وصف ثابت للشخصيات والأزياء والموقع، وتوزيع الإضاءة لضمان الاستمرارية.',
    rulesEn: 'Divide into snappy 10-second segments, instant 2-second visual hook, consistent character/costume/setting description, and seamless narrative continuity.',
    icon: Zap
  },
  website: {
    nameAr: 'موقع أو صفحة هبوط (Landing Page)',
    nameEn: 'Website & Landing Page UI/UX',
    rulesAr: 'هيكل الصفحة المعماري، تجربة المستخدم (UX)، دعم اللغة العربية RTL، التجاوب مع الجوال، معايير الوصولية، حالات الواجهة التفاعلية، وأزرار التحويل.',
    rulesEn: 'Information architecture, UX wireframing, RTL Arabic support, mobile responsiveness, accessibility standards, interactive UI states, and conversion CTAs.',
    icon: Globe
  },
  app: {
    nameAr: 'تطبيق جوال (Mobile App UI/UX)',
    nameEn: 'Mobile App Interface Design',
    rulesAr: 'تدفقات المستخدم (User Flows)، تصميم الشاشات الرئيسية، نظام التنقل السفلي، حالات الخطأ والتحميل، استجابة اللمس (Haptics)، وتجربة مستخدم سلسة.',
    rulesEn: 'User journey flows, primary screen layouts, bottom navigation, error/empty states, micro-interactions, touch ergonomics, and intuitive mobile ergonomics.',
    icon: Smartphone
  },
  social: {
    nameAr: 'منشور وسائل التواصل الاجتماعي',
    nameEn: 'Social Media Post & Carousel',
    rulesAr: 'تحديد المنصة (X, Instagram, LinkedIn)، المقاس المناسب، الجمهور المستهدف، خطاف يجذب الانتباه، نص مقنع، وتنسيق بصري مع هاشتاغات ذكية.',
    rulesEn: 'Platform targeting (X, IG, LinkedIn), optimal aspect ratio, hook opening, persuasive copy, visual companion prompts, and strategic hashtags.',
    icon: Share2
  },
  product: {
    nameAr: 'تصوير منتجات للمتاجر الإلكترونية',
    nameEn: 'Commercial E-Commerce Product Shoot',
    rulesAr: 'محاكاة خامات المنتج بدقة، إضاءة استوديو ناعمة مزدوجة (Softbox)، زوايا التصوير الماكرو، انعكاسات الزجاج والمعادن، والمنصات الفاخرة.',
    rulesEn: 'Material fidelity, dual softbox studio lighting, macro commercial angles, photorealistic specular reflections and caustics, and luxury staging.',
    icon: Tag
  },
  music: {
    nameAr: 'موسيقى ومؤثرات صوتية (Suno / Udio)',
    nameEn: 'AI Music & Audio Prompting',
    rulesAr: 'النوع الموسيقي (Genre)، الإيقاع وسرعة BPM، الآلات الموسيقية، بنية المقاطع (Verse, Chorus, Bridge)، المزاج العاطفي، وأسلوب أداء الصوت.',
    rulesEn: 'Musical genre, tempo/BPM, instrument orchestration, arrangement structure (Verse/Chorus/Bridge), emotional mood, and vocal delivery style.',
    icon: Music
  },
  text: {
    nameAr: 'كتابة محتوى وتسويق إبداعي (Copywriting)',
    nameEn: 'Creative Copywriting & Content',
    rulesAr: 'الهدف الاستراتيجي، تحديد العميل المثالي، النبرة الصوتية، البنية السردية المقنعة (AIDA/PAS)، الفوائد بدلاً من الميزات، ونداء اتخاذ إجراء لا يقاوم.',
    rulesEn: 'Strategic goal, ideal persona targeting, brand voice, persuasive framework (AIDA/PAS), benefits over features, and an irresistible CTA.',
    icon: FileText
  }
};

const TARGET_MODELS = [
  { id: 'عام — أي نموذج', name: 'عام — أي نموذج ذكاء اصطناعي (Universal)' },
  { id: 'ChatGPT', name: 'ChatGPT (GPT-4o) — الحوار والتفكير والتحليل' },
  { id: 'Gemini', name: 'Google Gemini 2.5 — السياقات الضخمة والأبحاث' },
  { id: 'Claude', name: 'Claude 3.5 Sonnet — الدقة الأكاديمية والبرمجة' },
  { id: 'Midjourney', name: 'Midjourney v6.1 — التوليد الفوتوغرافي الفني' },
  { id: 'FLUX', name: 'FLUX.1 Pro — الواقعية الفائقة وكتابة النصوص' },
  { id: 'Ideogram', name: 'Ideogram v2 — النصوص والطباعة البصرية' },
  { id: 'Leonardo AI', name: 'Leonardo AI — الرسم والتصميم المتنوع' },
  { id: 'Runway', name: 'Runway Gen-3 — الفيديو والمشاهد السينمائية' },
  { id: 'Kling', name: 'Kling AI — الفيديو الواقعي عالي الدقة' },
  { id: 'Veo', name: 'Google Veo — التوليد السينمائي المتقدم' },
  { id: 'Suno', name: 'Suno / Udio — تأليف الأغاني والموسيقى' },
];

export interface OutputLanguageOption {
  id: string;
  labelAr: string;
  labelEn: string;
  promptName: string;
}

export const OUTPUT_LANGUAGE_OPTIONS: OutputLanguageOption[] = [
  { id: 'ar', labelAr: 'Arabic — العربية', labelEn: 'Arabic — العربية', promptName: 'Arabic' },
  { id: 'en', labelAr: 'English', labelEn: 'English', promptName: 'English' },
  { id: 'fr', labelAr: 'French — Français', labelEn: 'French — Français', promptName: 'French' },
  { id: 'darija', labelAr: 'Moroccan Darija — الدارجة المغربية', labelEn: 'Moroccan Darija — الدارجة المغربية', promptName: 'Moroccan Darija (الدارجة المغربية)' },
  { id: 'es', labelAr: 'Spanish — Español', labelEn: 'Spanish — Español', promptName: 'Spanish' },
  { id: 'de', labelAr: 'German — Deutsch', labelEn: 'German — Deutsch', promptName: 'German' },
  { id: 'it', labelAr: 'Italian — Italiano', labelEn: 'Italian — Italiano', promptName: 'Italian' },
  { id: 'pt', labelAr: 'Portuguese — Português', labelEn: 'Portuguese — Português', promptName: 'Portuguese' },
  { id: 'tr', labelAr: 'Turkish — Türkçe', labelEn: 'Turkish — Türkçe', promptName: 'Turkish' },
  { id: 'other', labelAr: 'Other — لغة أخرى', labelEn: 'Other — لغة أخرى', promptName: 'Other' },
];

// Academic AI Disclosure Templates from PDF Guide
const ACADEMIC_DISCLOSURE_TEMPLATES = [
  {
    id: 'lang',
    titleAr: 'نموذج 1: الإفصاح عن المساعدة في التحرير اللغوي وإعادة الصياغة',
    titleEn: 'Model 1: Language Editing & Proofreading Assistance',
    textAr: `أقر أنا الباحث/ة بأنني استخدمت أداة الذكاء الاصطناعي [اسم الأداة، مثلاً: Claude 3.5 / ChatGPT] للمساعدة الحصرية في التدقيق اللغوي، وتحسين الصياغة النحوية، وإعادة صياغة بعض الفقرات لرفع وضوح النص الأكاديمي. أؤكد أن الأفكار والتحليلات والنتائج والاستنتاجات هي نتاج جهدي الشخصي بالكامل، وأتحمل المسؤولية الكاملة عن دقة وسلامة المحتوى العلمي الوارد في هذه الدراسة.`
  },
  {
    id: 'lit',
    titleAr: 'نموذج 2: الإفصاح عن الاستعانة بمراجعة واستكشاف الأدبيات السابقة',
    titleEn: 'Model 2: Literature Review Exploration Assistance',
    textAr: `تمت الاستعانة بأداة الذكاء الاصطناعي [اسم الأداة، مثلاً: Elicit / Scite / Consensus] للمساعدة في استكشاف الدراسات السابقة وتلخيص بعض الأوراق العلمية ذات الصلة. قام الباحث بالرجوع المباشر إلى النصوص الأصلية لكافة المراجع المستشهد بها، وقراءتها نقدياً، والتحقق اليدوي من صحة بياناتها وأرقام الـ DOI الخاصة بها، ولا تتضمن الدراسة أي مراجع مولدة آلياً دون تحقق شخصي.`
  },
  {
    id: 'data',
    titleAr: 'نموذج 3: الإفصاح عن المساعدة في البرمجة الإحصائية وتحليل البيانات',
    titleEn: 'Model 3: Statistical Coding & Data Analysis Assistance',
    textAr: `تم استخدام أداة الذكاء الاصطناعي [اسم الأداة] للمساعدة في كتابة الأكواد البرمجية للتحليل الإحصائي بلغة [R / Python] وتنسيق الجداول الإحصائية. قام الباحث بمراجعة وفحص مخرجات التحليل، والتحقق من افتراضات النماذج الرياضية، وتفسير العلاقات الارتباطية والسببية بناءً على الإطار النظري المعتمد.`
  },
  {
    id: 'international',
    titleAr: 'نموذج 4: الصيغة العامة المتوافقة مع معايير Elsevier و Springer و COPE',
    titleEn: 'Model 4: General Policy Formula (COPE / Elsevier Compliant)',
    textAr: `During the preparation of this manuscript, the author(s) utilized [Tool Name, version] for [reason, e.g., language refinement and structural formatting]. Subsequent to using this tool, the author(s) reviewed and edited the content as necessary and take full responsibility for the integrity and accuracy of the publication.`
  },
  {
    id: 'general_arabic',
    titleAr: 'نموذج 5: الصيغة المعتمدة لجامعات ومؤسسات الدراسات العليا العربية',
    titleEn: 'Model 5: Master Arab Universities Graduate Thesis Disclosure',
    textAr: `تم إعداد هذه الدراسة بالالتزام الصارم بميثاق الأمانة العلمية والأخلاقيات البحثية. تم توظيف أدوات الذكاء الاصطناعي التوليدي كعامل مساند وميسر للعمليات المنهجية (استخراج الكلمات المفتاحية، التدقيق اللغوي، تنظيم المراجع)، مع التحقق الكامل والتام من خلو العمل من الانتحال العلمي، ويقر الباحث بمسؤوليته الأكاديمية والمهنية المطلقة عما ورد فيه.`
  }
];

// Academic Prompt Engineering Frameworks from PDF Guide
const ACADEMIC_FRAMEWORKS = [
  {
    id: 'rope',
    name: 'إطار ROPE (الأكثر دقة للأطروحات)',
    parts: 'الدور (Role) • الهدف (Objective) • السياق (Place/Context) • المخرجات (Expectation)',
    descAr: 'الإطار الأمثل لصياغة الإشكاليات والأسئلة البحثية وتحديد حدود الدراسة.',
    exampleAr: `Role: أنت أستاذ مناهج بحث علمي وخبير في القياس والتقويم.
Objective: صياغة مشكلة بحثية دقيقة وأسئلة فرعية حول أثر الذكاء الاصطناعي في التعليم الجامعي.
Place/Context: كليات العلوم الإنسانية في الجامعات العربية خلال العام 2026.
Expectation: فقرة محكمة تحدد المشكلة، و3 أسئلة قابلة للقياس بصيغة أكاديمية رصينة.`
  },
  {
    id: 'ape',
    name: 'إطار APE (العملي السريع)',
    parts: 'الإجراء (Action) • الغرض (Purpose) • التوقع (Expectation)',
    descAr: 'مناسب لمهام التلخيص، وإعادة الصياغة، والمقارنة المنهجية.',
    exampleAr: `Action: قارن بين المنهج الوصفي التحليلي والمنهج شبه التجريبي.
Purpose: لاختيار المنهج الأنسب لدراسة أثر بيئة تدريب تفاعلية على التحصيل.
Expectation: جدول مقارنة يوضح: الأداة، حجم العينة، ضبط المتغيرات، ونقاط القوة والضعف.`
  },
  {
    id: 'coast',
    name: 'إطار COAST (المشاريع والخطط المعقدة)',
    parts: 'السياق (Context) • الهدف (Objective) • الإجراءات (Actions) • السيناريو (Scenario) • المهمة (Task)',
    descAr: 'يستخدم لتصميم خطط البحث الكاملة (Research Proposals).',
    exampleAr: `Context: باحث دراسات عليا يعد خطة بحثية لنيل درجة الدكتوراه في الإدارة.
Objective: إعداد خطة متكاملة لدراسة القيادة التحويلية ودورها في الابتكار المؤسسي.
Actions: تحديد الفجوة المعرفية، النظريات المفسرة، ومجتمع الدراسة.
Scenario: شركات التقنية الناشئة في منطقة الخليج العربي.
Task: مسودة مقترح بحثي أكاديمي محكم مكون من 4 محاور رئيسية.`
  },
  {
    id: 'cot',
    name: 'سلسلة الأفكار (Chain-of-Thought)',
    parts: 'التفكير المتدرج خطوة بخطوة قبل استخراج النتيجة',
    descAr: 'يمنع التسرع والهلوسة في التحليلات الإحصائية وتفسير العلاقات المعقدة.',
    exampleAr: `حلل العلاقة بين المتغيرين، ولكن قبل إعطاء الاستنتاج فكر خطوة بخطوة:
1. حدد المتغير المستقل والتابع والوسيط.
2. قيّم نوع الارتباط الممكن (طردي، عكسي، غير خطي).
3. اقترح الاختبار الإحصائي المناسب وقدم التبرير العلمي.`
  }
];

// AI Words & Clichés To Avoid (From PDF Appendix 4)
const AI_CLICHES_DATA = [
  { ar: 'تسليط الضوء على...', en: 'sheds light on / highlights', alternativeAr: 'يوضح، يكشف، يبرز، يبين التحليل' },
  { ar: 'مغيّر لقواعد اللعبة', en: 'game-changer / revolutionary', alternativeAr: 'تطور هام، ذو أثر نوعي، تحول منهجي' },
  { ar: 'غوص عميق / التعمق في', en: 'delve into / deep dive', alternativeAr: 'دراسة متعمقة، فحص دقيق، استقصاء' },
  { ar: 'في الختام / ختاماً', en: 'in conclusion / to sum up', alternativeAr: 'يتضح مما سبق، تؤكد النتائج، يخلص البحث' },
  { ar: 'نسيج / مزيج فريد', en: 'tapestry / rich tapestry', alternativeAr: 'منظومة، سياق مركب، تشكيلة من العوامل' },
  { ar: 'رائد / لا مثيل له', en: 'pioneering / unprecedented', alternativeAr: 'مبادرة أولى، دراسة حديثة، متقدم' },
  { ar: 'استثمار / توظيف مفرط', en: 'leverage / harness', alternativeAr: 'استخدام، تطبيق، الاستفادة من' },
  { ar: 'عالم / فضاء واسع', en: 'realm / landscape', alternativeAr: 'مجال، ميدان، بيئة، قطاع' },
  { ar: 'سلاح ذو حدين', en: 'double-edged sword', alternativeAr: 'ينطوي على مزايا وتحديات متزامنة' },
  { ar: 'لا يقتصر على بل يمتد', en: 'not only but also', alternativeAr: 'يشمل كذلك، ويغطي إضافياً' },
];

export default function PromptLibrary({ lang, onSendToBuilder, onNavigateTab }: PromptLibraryProps) {
  const isAr = lang === 'ar';
  const Arrow = isAr ? ArrowLeft : ArrowRight;
  const generatorSectionRef = useRef<HTMLDivElement>(null);

  // Active view: 'generator' (synthesizer & 115 cards) vs 'cinematic_200' (Midjourney & Flux.1 library) vs 'academic_hub' (research guide & disclosures)
  const [activeMainView, setActiveMainView] = useState<'generator' | 'cinematic_200' | 'academic_hub'>('generator');

  // ==========================================
  // 1. Library State (Prompts Library Cards)
  // ==========================================
  const [libraryCards, setLibraryCards] = useState<PromptLibraryCard[]>(() => {
    try {
      const stored = localStorage.getItem('arabiprompt_custom_library');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const defaultMap = new Map(DEFAULT_PROMPTS_LIBRARY.map(d => [d.id, d]));
          // Keep user-created custom cards, but sync default cards with latest English bodies and metadata
          const updated = parsed.map((p: any) => {
            if (defaultMap.has(p.id)) {
              return defaultMap.get(p.id)!;
            }
            return p;
          });
          const existingIds = new Set(updated.map((p: any) => p.id));
          const missing = DEFAULT_PROMPTS_LIBRARY.filter(p => !existingIds.has(p.id));
          const merged = [...updated, ...missing];
          localStorage.setItem('arabiprompt_custom_library', JSON.stringify(merged));
          return merged;
        }
      }
    } catch {}
    return DEFAULT_PROMPTS_LIBRARY;
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [favoritesOnly, setFavoritesOnly] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem('arabiprompt_library_favs');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [copiedCardId, setCopiedCardId] = useState<number | null>(null);
  const [copiedTemplateId, setCopiedTemplateId] = useState<string | null>(null);
  const [clicheCheckerInput, setClicheCheckerInput] = useState<string>('');

  // ==========================================
  // 2. Meta-Prompt Synthesizer State (0-API Fusion)
  // ==========================================
  const [ideaText, setIdeaText] = useState<string>('');
  const [selectedDomain, setSelectedDomain] = useState<string>('image');
  const [targetModel, setTargetModel] = useState<string>('عام — أي نموذج');
  const [outputLanguage, setOutputLanguage] = useState<string>('ar');
  const [customOutputLanguage, setCustomOutputLanguage] = useState<string>('');
  const [detailLevel, setDetailLevel] = useState<'short' | 'balanced' | 'deep'>('balanced');
  const [targetAudience, setTargetAudience] = useState<string>('');

  // Options matching DawAi-library.html
  const [executeImmediately, setExecuteImmediately] = useState<boolean>(true);
  const [provideVariants, setProvideVariants] = useState<boolean>(true);
  const [addNegativePrompt, setAddNegativePrompt] = useState<boolean>(true);
  const [addBrandCredit, setAddBrandCredit] = useState<boolean>(false);
  const [addWebsiteCredit, setAddWebsiteCredit] = useState<boolean>(false);

  // Sample campaign template state
  const [useSampleTemplate, setUseSampleTemplate] = useState<boolean>(false);
  const [sampleProductName, setSampleProductName] = useState<string>('العطور الشرقية النادرة');
  const [sampleAudience, setSampleAudience] = useState<string>('رجال وسيدات الأعمال من فئة النخبة');
  const [sampleCity, setSampleCity] = useState<string>('الرياض وجدة');

  // Output
  const [synthesizedPrompt, setSynthesizedPrompt] = useState<string>('');
  const [isCopiedOutput, setIsCopiedOutput] = useState<boolean>(false);

  // Saved Meta-Prompt Favorites (storageKey: arabiprompt_favorites_v1)
  const [savedFavorites, setSavedFavorites] = useState<{ title: string; text: string; date?: string }[]>(() => {
    try {
      const stored = localStorage.getItem('arabiprompt_favorites_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.filter(v => v && typeof v.text === 'string' && typeof v.title === 'string').slice(0, 100);
        }
      }
    } catch {}
    return [];
  });

  // Local Manager Form & Editing state
  const [editingCardId, setEditingCardId] = useState<number | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardCategory, setNewCardCategory] = useState('research');
  const [newCardBody, setNewCardBody] = useState('');

  // Structured JSON Export / Backup & Sharing state
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [exportIncludeSaved, setExportIncludeSaved] = useState<boolean>(true);
  const [exportIncludeFavCards, setExportIncludeFavCards] = useState<boolean>(true);
  const [exportIncludeAllCards, setExportIncludeAllCards] = useState<boolean>(false);
  const [isJsonCopied, setIsJsonCopied] = useState<boolean>(false);

  // Thesis Checklist state (12 items)
  const [checklistItems, setChecklistItems] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem('arabiprompt_thesis_checklist');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const toggleChecklistItem = (id: string) => {
    setChecklistItems(prev => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem('arabiprompt_thesis_checklist', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Persist favorites
  const toggleFavorite = (id: number) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      try {
        localStorage.setItem('arabiprompt_library_favs', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Save Meta-Prompt to local favorites
  const handleSaveFavorite = () => {
    if (!synthesizedPrompt) return;
    const title = (ideaText.trim() || 'أمر مولّد').slice(0, 65);
    const newItem = {
      title,
      text: synthesizedPrompt,
      date: new Date().toISOString()
    };
    const updated = [newItem, ...savedFavorites.filter(item => item.text !== synthesizedPrompt)].slice(0, 100);
    setSavedFavorites(updated);
    try {
      localStorage.setItem('arabiprompt_favorites_v1', JSON.stringify(updated));
      showToast(isAr ? '✓ تم حفظ الأمر في المفضلة المحلية!' : '✓ Saved to local favorites!', false);
    } catch {}
  };

  const handleDeleteFavorite = (idx: number) => {
    const updated = savedFavorites.filter((_, i) => i !== idx);
    setSavedFavorites(updated);
    try {
      localStorage.setItem('arabiprompt_favorites_v1', JSON.stringify(updated));
      showToast(isAr ? '✓ تم حذف الأمر من المفضلة' : '✓ Removed from favorites', false);
    } catch {}
  };

  // Generate structured JSON payload for backup or sharing
  const getStructuredExportPayload = () => {
    const savedItems = exportIncludeSaved
      ? savedFavorites.map((fav, idx) => ({
          id: `saved-meta-${idx + 1}`,
          title: fav.title,
          promptText: fav.text,
          savedAt: fav.date || new Date().toISOString(),
          category: 'synthesized_meta_prompt'
        }))
      : [];

    const favoriteCards = exportIncludeFavCards
      ? libraryCards
          .filter(c => favorites.includes(c.id))
          .map(c => ({
            id: c.id,
            title: c.title,
            category: c.cat,
            promptText: c.body,
            source: c.source
          }))
      : [];

    const allCustomCards = exportIncludeAllCards
      ? libraryCards.map(c => ({
          id: c.id,
          title: c.title,
          category: c.cat,
          promptText: c.body,
          source: c.source
        }))
      : [];

    const totalCount = savedItems.length + favoriteCards.length + (exportIncludeAllCards ? allCustomCards.length : 0);

    return {
      version: '1.0' as const,
      app: 'ArabiPrompt & DawAi Platform',
      exportedAt: new Date().toISOString(),
      sourceUrl: 'https://arabiprompt.ai.studio/',
      type: 'structured_prompts_backup' as const,
      summary: {
        totalItems: totalCount,
        savedMetaPromptsCount: savedItems.length,
        favoriteLibraryPromptsCount: favoriteCards.length,
        totalCustomLibraryCards: exportIncludeAllCards ? allCustomCards.length : 0
      },
      savedMetaPrompts: savedItems,
      favoriteLibraryPrompts: favoriteCards,
      ...(exportIncludeAllCards ? { allLibraryCards: allCustomCards } : {})
    };
  };

  // Direct download of structured JSON file
  const handleDownloadStructuredExport = () => {
    const payload = getStructuredExportPayload();
    if (payload.summary.totalItems === 0) {
      showToast(isAr ? 'لم يتم تحديد أي برومتات للتصدير' : 'No prompts selected for export', true);
      return;
    }
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    a.download = `arabiprompt-prompts-backup-${dateStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(isAr ? `✓ تم تصدير ${payload.summary.totalItems} أمراً كملف JSON مهيكل!` : `✓ Exported ${payload.summary.totalItems} prompts as structured JSON!`, false);
  };

  // Direct copy of structured JSON to clipboard
  const handleCopyStructuredJson = () => {
    const payload = getStructuredExportPayload();
    if (payload.summary.totalItems === 0) {
      showToast(isAr ? 'لم يتم تحديد أي برومتات للنسخ' : 'No prompts selected', true);
      return;
    }
    const jsonStr = JSON.stringify(payload, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setIsJsonCopied(true);
    showToast(isAr ? '✓ تم نسخ ملف JSON المهيكل إلى الحافظة بنجاح!' : '✓ Structured JSON copied to clipboard!', false);
    setTimeout(() => setIsJsonCopied(false), 2000);
  };

  const handleExportFavoritesJson = () => {
    handleDownloadStructuredExport();
  };

  // Smart JSON importer: supports structured format as well as legacy favorites arrays
  const handleImportFavoritesJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        let importedCount = 0;

        // Structured JSON format
        if (parsed && typeof parsed === 'object') {
          // 1. Saved meta prompts
          if (Array.isArray(parsed.savedMetaPrompts) && parsed.savedMetaPrompts.length > 0) {
            const cleanSaved = parsed.savedMetaPrompts
              .filter((x: any) => x && (x.promptText || x.text || x.prompt))
              .map((x: any) => ({
                title: x.title || 'أمر محفوظ',
                text: x.promptText || x.text || x.prompt,
                date: x.savedAt || x.date || new Date().toISOString()
              }));
            if (cleanSaved.length > 0) {
              setSavedFavorites(prev => {
                const existing = new Set(prev.map(p => p.text));
                const additions = cleanSaved.filter((c: any) => !existing.has(c.text));
                const merged = [...additions, ...prev].slice(0, 150);
                localStorage.setItem('arabiprompt_favorites_v1', JSON.stringify(merged));
                return merged;
              });
              importedCount += cleanSaved.length;
            }
          }

          // 2. Favorite library prompts
          if (Array.isArray(parsed.favoriteLibraryPrompts) && parsed.favoriteLibraryPrompts.length > 0) {
            const cleanFavCards = parsed.favoriteLibraryPrompts
              .filter((c: any) => c && (c.promptText || c.body || c.prompt))
              .map((c: any) => ({
                id: typeof c.id === 'number' ? c.id : Date.now() + Math.floor(Math.random() * 10000),
                title: c.title || 'قالب مميز',
                cat: c.category || c.cat || 'research',
                body: c.promptText || c.body || c.prompt,
                source: c.source || (isAr ? 'مستورد من ملف JSON' : 'Imported from JSON')
              }));

            setLibraryCards(prev => {
              const existingIds = new Set(prev.map(x => x.id));
              const additions = cleanFavCards.filter((c: any) => !existingIds.has(c.id));
              const merged = [...additions, ...prev];
              localStorage.setItem('arabiprompt_custom_library', JSON.stringify(merged));
              return merged;
            });

            const newFavIds = cleanFavCards.map((c: any) => c.id);
            setFavorites(prev => {
              const mergedFavs = Array.from(new Set([...prev, ...newFavIds]));
              localStorage.setItem('arabiprompt_library_favs', JSON.stringify(mergedFavs));
              return mergedFavs;
            });
            importedCount += cleanFavCards.length;
          }

          // 3. Fallback for legacy flat array of saved favorites
          if (Array.isArray(parsed) && parsed.length > 0) {
            if (parsed.some((x: any) => x && typeof x.text === 'string')) {
              const clean = parsed.filter(x => x && typeof x.title === 'string' && typeof x.text === 'string');
              setSavedFavorites(prev => {
                const merged = [...clean, ...prev].slice(0, 150);
                localStorage.setItem('arabiprompt_favorites_v1', JSON.stringify(merged));
                return merged;
              });
              importedCount += clean.length;
            } else if (parsed.some((x: any) => x && typeof x.body === 'string')) {
              setLibraryCards(parsed);
              localStorage.setItem('arabiprompt_custom_library', JSON.stringify(parsed));
              importedCount += parsed.length;
            }
          }
        }

        if (importedCount > 0) {
          showToast(isAr ? `✓ تم استيراد وتحديث ${importedCount} برومبت بنجاح!` : `✓ Imported ${importedCount} prompts!`, false);
          setIsExportModalOpen(false);
        } else {
          showToast(isAr ? 'لم يتم العثور على برومتات صالحة في الملف' : 'No valid prompts found in file', true);
        }
      } catch {
        showToast(isAr ? 'ملف JSON غير صالح' : 'Invalid JSON file', true);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Build the Meta-Prompt (Algorithmic Fusion with 0 API calls - English Prompt with Custom Output Language)
  const handleSynthesizePrompt = () => {
    let finalIdea = ideaText.trim();

    if (useSampleTemplate) {
      const sampleText = `صمم لي حملة تسويقية لـ [${sampleProductName || 'المنتج'}] الموجه لجمهور [${sampleAudience || 'الجمهور المستهدف'}] في مدينة [${sampleCity || 'المدينة'}].`;
      finalIdea = sampleText + (finalIdea ? `\nتفاصيل إضافية: ${finalIdea}` : '');
    }

    if (!finalIdea) {
      showToast(isAr ? 'اكتب فكرتك أولاً أو اختر برومت من المكتبة بالأسفل!' : 'Please enter your idea first or select a prompt below!', true);
      return;
    }

    const domainInfo = DOMAIN_CATEGORIES[selectedDomain] || DOMAIN_CATEGORIES.image;

    // 1. Resolve Customer-Selected Output Language
    const selectedLangObj = OUTPUT_LANGUAGE_OPTIONS.find(l => l.id === outputLanguage) || OUTPUT_LANGUAGE_OPTIONS[0];
    const customerSelectedLang = outputLanguage === 'other'
      ? (customOutputLanguage.trim() || 'Arabic')
      : selectedLangObj.promptName;

    // 2. Map Domain-Specific Special Content Rules
    let specialContentRule = '';
    switch (selectedDomain) {
      case 'research':
        specialContentRule = `For scientific research:\nWrite the research content and methodological analysis in ${customerSelectedLang} while preserving established scientific and academic terminology.`;
        break;
      case 'image':
      case 'poster':
      case 'logo':
      case 'product':
        specialContentRule = `For images:\nKeep the image-generation instructions in English, but specify that any visible text inside the image must use ${customerSelectedLang}.`;
        break;
      case 'video':
      case 'series':
        specialContentRule = `For videos:\nKeep the production instructions in English, but specify ${customerSelectedLang} for dialogue, narration, and subtitles when applicable.`;
        break;
      case 'music':
        specialContentRule = `For music:\nWrite the music-production instructions in English, but specify ${customerSelectedLang} for lyrics and vocals.`;
        break;
      case 'website':
      case 'app':
        specialContentRule = `For programming:\nWrite the development prompt in English. Use ${customerSelectedLang} for the application's user interface and user-facing text. Preserve programming language syntax, API names, and technical identifiers.`;
        break;
      case 'text':
      case 'social':
      default:
        specialContentRule = `For text generation:\nProduce the final text, copy, headings, and descriptions in ${customerSelectedLang}.`;
        break;
    }

    const detailMap = {
      short: 'Concise, direct, and actionable parameters',
      balanced: 'Balanced with practical real-world specifications and engineering depth',
      deep: 'Deeply structured with exhaustive technical parameters, constraints, and professional scaffolding'
    };
    const detailDesc = detailMap[detailLevel] || detailMap.balanced;

    // Build extra directives
    const extrasList: string[] = [];
    if (executeImmediately) {
      extrasList.push(
        `Execution Mandate: After formulating the master prompt, instruct the target AI to execute the idea fully and present the final deliverable in ${customerSelectedLang} without delay.`
      );
    }
    if (provideVariants) {
      extrasList.push(
        'Provide 3 distinct prompt variations (Hero, In-Depth, and Rapid) and highlight the optimal choice with clear rationale.'
      );
    }
    if (addNegativePrompt) {
      extrasList.push(
        'Include an explicit Negative Prompt block to avoid defects, clichés, distortions, and hallucinations.'
      );
    }
    if (addBrandCredit) {
      extrasList.push(
        'When the output is visual or graphic, embed "Daw Ai" as an elegant, subtle brand signature.'
      );
    }
    if (addWebsiteCredit) {
      extrasList.push(
        'Where appropriate for attribution or documentation, include "https://arabiprompt.ai.studio/" as clear reference URL.'
      );
    }

    const extrasText = extrasList.length > 0 
      ? extrasList.map((item, idx) => `${idx + 1}. ${item}`).join('\n') 
      : '';

    // ALWAYS GENERATE THE PROMPT IN ENGLISH.
    // ALWAYS CONFIGURE THE PROMPT TO PRODUCE ITS FINAL RESULT IN THE CUSTOMER'S SELECTED LANGUAGE.
    const compiled = `You are a Senior AI Prompt Engineer responsible for generating professional AI prompts inside the free DawAi / ArabiPrompt Prompt Library.

## CORE LANGUAGE RULE
Every generated AI prompt MUST be written in professional English.
However, the language of the final result produced when that prompt is used MUST be selected by the customer (${customerSelectedLang}).

[Reference Concept / User Idea]:
"""
${finalIdea}
"""

[Execution Specifications]:
- Professional Domain: ${domainInfo.nameEn}
- Target Platform / Model: ${targetModel}
- Target Audience: ${targetAudience.trim() || 'Specialized professional and academic audience derived from context'}
- Prompt Language: English (Fixed for maximum model fidelity and consistency)
- Customer Output Language: ${customerSelectedLang}
- Detail Level: ${detailDesc}

[Domain Engineering Guidelines for ${domainInfo.nameEn}]:
${domainInfo.rulesEn}

[Operational Protocols & Strict Rules]:
1. Preserve the core essence, intentionality, and technical requirements of the user's idea.
2. Engineer the prompt utilizing proven parameter architectures for ${targetModel}.
3. Add precision without hallucinating unsupported parameters or false capabilities.
4. Keep all system instructions and guidelines strictly in English.

[MANDATORY OUTPUT LANGUAGE REQUIREMENT]:
OUTPUT LANGUAGE REQUIREMENT:
Generate the final result in ${customerSelectedLang}. All explanations, descriptions, headings, and user-facing content must use this language unless the task explicitly requires another language.

[Special Content Rules]:
${specialContentRule}
${extrasText ? `\n[Additional Directives]:\n${extrasText}\n` : ''}
Begin now by delivering the master prompt in English, configured strictly to produce the final result in ${customerSelectedLang}.`;

    setSynthesizedPrompt(compiled);

    // Scroll smoothly to output
    setTimeout(() => {
      const outputElem = document.getElementById('meta-prompt-output-section');
      if (outputElem) {
        outputElem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);

    showToast(
      isAr 
        ? `✓ تم توليد البرومبت بالإنجليزية بلغة نتيجة (${customerSelectedLang}) مجاناً!` 
        : `✓ English prompt generated with output language (${customerSelectedLang})!`, 
      false
    );
  };

  // Copy synthesized prompt
  const handleCopySynthesized = () => {
    if (!synthesizedPrompt) return;
    navigator.clipboard.writeText(synthesizedPrompt);
    setIsCopiedOutput(true);
    showToast(isAr ? '✓ تم النسخ للحافظة بنجاح!' : '✓ Prompt copied to clipboard!', false);
    setTimeout(() => setIsCopiedOutput(false), 2000);
  };

  // Export TXT
  const handleExportTxt = () => {
    if (!synthesizedPrompt) return;
    const blob = new Blob([synthesizedPrompt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ArabPrompt-Meta-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(isAr ? '✓ تم تصدير الملف بنجاح!' : '✓ TXT file exported!', false);
  };

  // Load a library card into the synthesizer
  const handleInjectCardIntoSynthesizer = (card: PromptLibraryCard) => {
    setIdeaText(card.body);
    setUseSampleTemplate(false);

    // Map category
    if (card.cat === 'research') {
      setSelectedDomain('research');
      setTargetModel('ChatGPT (GPT-4o)');
      setDetailLevel('deep');
    } else if (card.cat === 'nanobanana') {
      setSelectedDomain('image');
      setTargetModel('Midjourney v6.1 — التوليد الفوتوغرافي الفني');
      setDetailLevel('deep');
    } else if (card.cat === 'prompts_chat') {
      if (card.title.includes('صورة') || card.title.includes('استوديو') || card.title.includes('مشهد') || card.title.includes('فستان') || card.title.includes('فوتوغرافية')) {
        setSelectedDomain('image');
        setTargetModel('Midjourney v6.1 — التوليد الفوتوغرافي الفني');
      } else if (card.title.includes('فيديو') || card.title.includes('فيلم') || card.title.includes('إعلان')) {
        setSelectedDomain('video');
        setTargetModel('Runway Gen-3 — الفيديو والمشاهد السينمائية');
      } else {
        setSelectedDomain('text');
        setTargetModel('Claude 3.5 Sonnet — الدقة الأكاديمية والبرمجة');
      }
      setDetailLevel('deep');
    } else if (card.cat === 'portrait' || card.cat === 'abstract' || card.cat === 'illustration') {
      setSelectedDomain('image');
      setTargetModel('Midjourney v6');
    } else if (card.cat === 'graphic') {
      setSelectedDomain('poster');
      setTargetModel('Midjourney v6');
    } else if (card.cat === 'gemini') {
      setSelectedDomain('text');
      setTargetModel('Google Gemini 2.5');
    }

    if (generatorSectionRef.current) {
      generatorSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }

    showToast(isAr ? `✓ تم إدراج أمر "${card.title}" في حقل المولد!` : `✓ Loaded "${card.title}" into the generator!`, false);
  };

  // Copy card prompt directly
  const handleCopyCard = (card: PromptLibraryCard) => {
    const textToCopy = `${card.body}\n\n---\n🌐 المصدر: مكتبة ArabPrompt | https://arabiprompt.ai.studio/`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedCardId(card.id);
    showToast(isAr ? '✓ تم نسخ البرومبت بنجاح!' : '✓ Prompt copied!', false);
    setTimeout(() => setCopiedCardId(null), 2000);
  };

  // Copy disclosure template
  const handleCopyDisclosure = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTemplateId(id);
    showToast(isAr ? '✓ تم نسخ نموذج الإفصاح للحافظة!' : '✓ Disclosure template copied!', false);
    setTimeout(() => setCopiedTemplateId(null), 2000);
  };

  // Filtered Cards List
  const filteredCards = useMemo(() => {
    return libraryCards.filter(card => {
      // Category filter
      if (selectedCategory !== 'all' && card.cat !== selectedCategory) {
        return false;
      }
      // Favorites filter
      if (favoritesOnly && !favorites.includes(card.id)) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = card.title.toLowerCase().includes(q);
        const matchBody = card.body.toLowerCase().includes(q);
        const matchSource = card.source.toLowerCase().includes(q);
        if (!matchTitle && !matchBody && !matchSource) {
          return false;
        }
      }
      return true;
    });
  }, [libraryCards, selectedCategory, favoritesOnly, favorites, searchQuery]);

  // Categories config for tabs (Includes Prompts.Chat, Nano Banana & Research!)
  const libraryTabs = useMemo(() => [
    { id: 'all', labelAr: '🌟 الكل', labelEn: 'All Prompts', count: libraryCards.length },
    { id: 'prompts_chat', labelAr: '💬 روائع prompts.chat', labelEn: 'prompts.chat Showcase', count: libraryCards.filter(c => c.cat === 'prompts_chat').length },
    { id: 'nanobanana', labelAr: '🍌 كتاب النانو والتوليد (Promptbook)', labelEn: 'Nano Banana & Promptbook', count: libraryCards.filter(c => c.cat === 'nanobanana').length },
    { id: 'research', labelAr: '🎓 البحث العلمي والأكاديمي', labelEn: 'Academic Research', count: libraryCards.filter(c => c.cat === 'research').length },
    { id: 'portrait', labelAr: '👤 بورتريه واقعي وسينمائي', labelEn: 'Portraits', count: libraryCards.filter(c => c.cat === 'portrait').length },
    { id: 'graphic', labelAr: '🎨 جرافيك وملصقات وشعارات', labelEn: 'Graphic & Posters', count: libraryCards.filter(c => c.cat === 'graphic').length },
    { id: 'abstract', labelAr: '🔮 فن تجريدي ورمزي', labelEn: 'Abstract Art', count: libraryCards.filter(c => c.cat === 'abstract').length },
    { id: 'illustration', labelAr: '🖌️ رسوم توضيحية وثلاثية الأبعاد', labelEn: 'Illustrations & 3D', count: libraryCards.filter(c => c.cat === 'illustration').length },
    { id: 'gemini', labelAr: '💎 أوامر Gemini المتقدمة', labelEn: 'Gemini Advanced', count: libraryCards.filter(c => c.cat === 'gemini').length },
  ], [libraryCards]);

  // Local Manager Functions
  const handleStartEditCard = (card: PromptLibraryCard) => {
    setEditingCardId(card.id);
    setNewCardTitle(card.title);
    setNewCardCategory(card.cat);
    setNewCardBody(card.body);
    const manager = document.getElementById('local-manager-section');
    if (manager) {
      manager.scrollIntoView({ behavior: 'smooth' });
    }
    showToast(isAr ? `تعديل: "${card.title}"` : `Editing: "${card.title}"`, false);
  };

  const handleCancelEdit = () => {
    setEditingCardId(null);
    setNewCardTitle('');
    setNewCardCategory('research');
    setNewCardBody('');
  };

  const handleDeleteCard = (cardId: number) => {
    if (window.confirm(isAr ? 'هل أنت متأكد من حذف هذا البرومبت محلياً؟' : 'Delete this prompt locally?')) {
      const updated = libraryCards.filter(c => c.id !== cardId);
      setLibraryCards(updated);
      try {
        localStorage.setItem('arabiprompt_custom_library', JSON.stringify(updated));
        showToast(isAr ? '✓ تم حذف البرومبت بنجاح' : '✓ Prompt deleted locally', false);
      } catch {}
    }
  };

  const handleSaveCardUpsert = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newCardTitle.trim() || !newCardBody.trim()) {
      showToast(isAr ? 'يرجى كتابة عنوان البرومبت ونصه' : 'Please fill in title and body', true);
      return;
    }

    if (editingCardId !== null) {
      const updated = libraryCards.map(c => 
        c.id === editingCardId 
          ? { ...c, title: newCardTitle.trim(), cat: newCardCategory, body: newCardBody.trim() } 
          : c
      );
      setLibraryCards(updated);
      try {
        localStorage.setItem('arabiprompt_custom_library', JSON.stringify(updated));
      } catch {}
      setEditingCardId(null);
      setNewCardTitle('');
      setNewCardBody('');
      setIsAddModalOpen(false);
      showToast(isAr ? '✓ تم تحديث البرومبت بنجاح!' : '✓ Prompt updated successfully!', false);
    } else {
      const newCard: PromptLibraryCard = {
        id: Date.now(),
        title: newCardTitle.trim(),
        cat: newCardCategory,
        body: newCardBody.trim(),
        source: isAr ? 'أمر مخصص من المستخدم' : 'Custom user prompt'
      };
      const updated = [newCard, ...libraryCards];
      setLibraryCards(updated);
      try {
        localStorage.setItem('arabiprompt_custom_library', JSON.stringify(updated));
      } catch {}
      setNewCardTitle('');
      setNewCardBody('');
      setIsAddModalOpen(false);
      showToast(isAr ? '✓ تمت إضافة البرومبت للمكتبة بنجاح!' : '✓ New prompt added to library!', false);
    }
  };

  const handleAddNewCard = (e: React.FormEvent) => {
    handleSaveCardUpsert(e);
  };

  const handleExportLibraryJson = () => {
    const jsonStr = JSON.stringify(libraryCards, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arabiprompt-library-${libraryCards.length}-cards.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(isAr ? '✓ تم تصدير ملف المكتبة بنجاح!' : '✓ Library JSON exported!', false);
  };

  const handleImportLibraryJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setLibraryCards(parsed);
          localStorage.setItem('arabiprompt_custom_library', JSON.stringify(parsed));
          showToast(isAr ? `✓ تم استيراد ${parsed.length} قالباً للمكتبة!` : `✓ Imported ${parsed.length} cards!`, false);
        } else {
          showToast(isAr ? 'الملف غير صالح؛ يجب أن يحتوي على مصفوفة بطاقات.' : 'Invalid JSON file format.', true);
        }
      } catch (err) {
        showToast(isAr ? 'حدث خطأ أثناء قراءة ملف الـ JSON.' : 'Failed to parse JSON file.', true);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetToDefaults = () => {
    if (window.confirm(isAr ? 'هل تريد استعادة كامل برومبتات المكتبة الأصلية (115 أمراً)؟' : 'Reset library to default 115 prompts?')) {
      setLibraryCards(DEFAULT_PROMPTS_LIBRARY);
      try {
        localStorage.removeItem('arabiprompt_custom_library');
      } catch {}
      showToast(isAr ? '✓ تمت استعادة المكتبة الافتراضية الأصلية!' : '✓ Reset to default library prompts!', false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1c1a16] via-stone-900 to-[#282116] text-white p-6 sm:p-10 shadow-xl border border-[#c29b40]/35">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#c29b40]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Breadcrumb back to DawAi Home */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <button
            type="button"
            onClick={() => onNavigateTab?.('dawai')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#c29b40]/40 bg-[#c29b40]/15 hover:bg-[#c29b40]/25 text-amber-300 text-xs font-bold transition cursor-pointer"
          >
            <span>{isAr ? '← بوابة DawAi' : '← DawAi Portal'}</span>
          </button>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-950/40 text-emerald-300 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Daw Ai • 100% مجاني • دون API</span>
          </span>
        </div>

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c29b40]/20 border border-[#c29b40]/40 text-amber-300 text-xs font-black">
              <Zap className="w-3.5 h-3.5 text-[#c29b40]" />
              <span>DawAi Prompt Library & Command Synthesizer</span>
            </div>

            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight leading-snug">
              {isAr ? (
                <>
                  DawAi — <span className="bg-gradient-to-r from-[#ecd197] via-[#c29b40] to-amber-400 bg-clip-text text-transparent">مكتبة البرومتات</span> ومولّد الأوامر الفورية
                </>
              ) : (
                <>
                  DawAi — <span className="bg-gradient-to-r from-[#ecd197] via-[#c29b40] to-amber-400 bg-clip-text text-transparent">Prompt Library</span> & Command Synthesizer
                </>
              )}
            </h1>

            <p className="text-stone-300 text-xs sm:text-[13px] leading-relaxed">
              {isAr 
                ? 'اكتب فكرتك، واختر القالب، ثم انسخ أمراً جاهزاً إلى أي ذكاء اصطناعي ليُنشئ لك برومت التصميم النهائي أولاً وينفّذ الفكرة. بدون استدعاء أي خادم أو مفاتيح API، مع حفظ كامل بياناتك وتعديلاتك محلياً.' 
                : 'Write your raw concept, choose a domain template, then copy a ready master command to any AI engine to craft the final prompt and execute it immediately with 0 API calls.'}
            </p>

            {/* In-page quick jump buttons matching DawAi-library.html nav */}
            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
              <a 
                href="#generator-section"
                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-white font-bold transition border border-white/10"
              >
                ⚡ {isAr ? 'مولّد الأوامر' : 'Generator'}
              </a>
              <a 
                href="#library-section"
                className="px-3 py-1.5 rounded-full bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 font-bold transition border border-cyan-500/30"
              >
                📚 {isAr ? 'مكتبة البرومتات' : 'Library'}
              </a>
              <a 
                href="#saved-favorites-section"
                className="px-3 py-1.5 rounded-full bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-bold transition border border-amber-500/30"
              >
                ⭐ {isAr ? 'المفضلة المحلية' : 'Favorites'}
              </a>
              <a 
                href="#local-manager-section"
                className="px-3 py-1.5 rounded-full bg-purple-500/15 hover:bg-purple-500/25 text-[#ded5ff] font-bold transition border border-purple-500/30"
              >
                🛠️ {isAr ? 'إدارة القوالب' : 'Template Manager'}
              </a>

              {/* Dedicated Structured Export / Share Button */}
              <button
                type="button"
                onClick={() => {
                  setExportIncludeSaved(true);
                  setExportIncludeFavCards(true);
                  setExportIncludeAllCards(false);
                  setIsExportModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/25 to-yellow-500/20 hover:from-amber-500/35 hover:to-yellow-500/30 text-amber-300 font-bold transition border border-amber-400/40 flex items-center gap-1.5 cursor-pointer shadow-xs"
                title={isAr ? 'تصدير المفضلة والمحفوظات كملف JSON مهيكل' : 'Export saved and favorite prompts as structured JSON'}
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>{isAr ? '📦 تصدير المفضلة (JSON)' : '📦 Export Favs (JSON)'}</span>
                {(savedFavorites.length > 0 || favorites.length > 0) && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-200 text-[10px] font-mono">
                    {savedFavorites.length + favorites.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Quick Stats & View Switcher */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
            {/* View Switcher: 200 Cinematic Library */}
            <button
              onClick={() => setActiveMainView(activeMainView === 'cinematic_200' ? 'generator' : 'cinematic_200')}
              className={`p-2.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer border shadow-sm ${
                activeMainView === 'cinematic_200'
                  ? 'bg-gradient-to-r from-[#916a24] via-[#c29b40] to-amber-500 text-white border-amber-300'
                  : 'bg-stone-800/90 text-amber-300 border-amber-500/40 hover:bg-stone-750'
              }`}
            >
              <Film className="w-4 h-4 text-amber-400" />
              <span>{activeMainView === 'cinematic_200' ? (isAr ? 'العودة لمولد الأوامر' : 'Back to Generator') : (isAr ? '🎬 مكتبة السينما 200 برومبت' : '🎬 200 Cinematic Prompts')}</span>
            </button>

            {/* View Switcher: Academic Hub */}
            <button
              onClick={() => setActiveMainView(activeMainView === 'academic_hub' ? 'generator' : 'academic_hub')}
              className={`p-2.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                activeMainView === 'academic_hub'
                  ? 'bg-[#c29b40] text-stone-950 border-[#b38d35] shadow-md'
                  : 'bg-stone-800/90 text-stone-200 border-stone-700 hover:bg-stone-700'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>{activeMainView === 'academic_hub' ? (isAr ? 'العودة لمولد الأوامر' : 'Back to Generator') : (isAr ? '🎓 حقيبة الباحث الأكاديمي' : '🎓 Academic Hub')}</span>
            </button>

            <div className="bg-stone-800/60 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-stone-700/80 text-center flex items-center justify-between text-[11px] text-stone-400">
              <span>{isAr ? 'إجمالي البرومتات:' : 'Total Prompts:'}</span>
              <span className="font-bold text-amber-400 font-mono">315+</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main View Router */}
      {activeMainView === 'academic_hub' ? (
        /* ============================================================== */
        /* ACADEMIC RESEARCH HUB (Derived from Noor-Book PDF Guide 2026)  */
        /* ============================================================== */
        <div className="space-y-10 animate-in fade-in duration-300">
          
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-[#916a24] dark:text-amber-400 text-xs font-black">
                  دليل عملي معتمد 2026
                </span>
                <h2 className="text-lg font-black text-stone-900 dark:text-stone-100">
                  {isAr ? '🎓 حقيبة وأدوات الباحث العلمي في عصر الذكاء الاصطناعي' : '🎓 Academic Researcher AI Toolkit & Ethical Guidelines'}
                </h2>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                {isAr 
                  ? 'مرجع أكاديمي متكامل مستوحى من أحدث الأدلة العلمية؛ لتوظيف الذكاء الاصطناعي بمسؤولية ونزاهة في كافة مراحل إعداد الرسائل والأطروحات.' 
                  : 'Complete ethical research guidelines, AI disclosure templates, prompt frameworks, and cliché buster.'}
              </p>
            </div>

            <button
              onClick={() => setActiveMainView('generator')}
              className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-xs font-bold text-stone-800 dark:text-stone-200 transition-colors cursor-pointer self-start sm:self-auto"
            >
              {isAr ? '← العودة للمكتبة والمولد' : '← Back to Library'}
            </button>
          </div>

          {/* 1. Academic AI Disclosure Templates Section */}
          <section className="bg-white dark:bg-[#151412] rounded-3xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 space-y-5 shadow-sm">
            <div className="flex items-center gap-2.5 border-b border-stone-100 dark:border-stone-800 pb-3">
              <FileCheck className="w-5 h-5 text-[#c29b40]" />
              <div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  {isAr ? '١. نماذج الإفصاح الأكاديمي الرسمية عن استخدام الذكاء الاصطناعي' : '1. Official Academic AI Disclosure Templates'}
                </h3>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  {isAr ? 'صيغ جاهزة للنسخ المباشر تتوافق مع معايير الجامعات ولجان الأخلاقيات والمجلات المصنفة (COPE / Scopus / Elsevier)' : 'Ready-to-copy disclosure formulas compliant with university ethics committees and international publishers'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ACADEMIC_DISCLOSURE_TEMPLATES.map((tmpl) => {
                const isCopied = copiedTemplateId === tmpl.id;
                return (
                  <div 
                    key={tmpl.id} 
                    className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-stone-850 dark:text-stone-200 block">
                        {isAr ? tmpl.titleAr : tmpl.titleEn}
                      </span>
                      <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed font-sans bg-white dark:bg-stone-950 p-3 rounded-xl border border-stone-100 dark:border-stone-850 select-text">
                        {tmpl.textAr}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyDisclosure(tmpl.id, tmpl.textAr)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        isCopied 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-[#c29b40] hover:bg-[#b08b34] text-stone-950 font-black'
                      }`}
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? (isAr ? 'تم النسخ بنجاح!' : 'Copied!') : (isAr ? 'نسخ هذا النموذج' : 'Copy Template')}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 2. Academic Prompt Engineering Frameworks */}
          <section className="bg-white dark:bg-[#151412] rounded-3xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 space-y-5 shadow-sm">
            <div className="flex items-center gap-2.5 border-b border-stone-100 dark:border-stone-800 pb-3">
              <Compass className="w-5 h-5 text-[#c29b40]" />
              <div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  {isAr ? '٢. أطر هندسة الأوامر الأكاديمية (ROPE / APE / COAST / Chain-of-Thought)' : '2. Academic Prompt Engineering Frameworks'}
                </h3>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  {isAr ? 'هياكل مثبتة علمياً لتوجيه نماذج الذكاء الاصطناعي بكفاءة ومنع التسطيح المعرفي' : 'Scientifically structured frameworks to eliminate hallucinations and extract profound analytical insights'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ACADEMIC_FRAMEWORKS.map((fw) => (
                <div 
                  key={fw.id} 
                  className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2.5 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-amber-800 dark:text-amber-400">
                        {fw.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-stone-500 dark:text-stone-400 font-mono block">
                      {fw.parts}
                    </span>
                    <p className="text-xs text-stone-700 dark:text-stone-300 font-medium">
                      {fw.descAr}
                    </p>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-stone-950 border border-stone-200/80 dark:border-stone-800 text-[11px] font-mono leading-relaxed text-stone-600 dark:text-stone-400 whitespace-pre-wrap select-text">
                      {fw.exampleAr}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIdeaText(fw.exampleAr);
                      setSelectedDomain('research');
                      setActiveMainView('generator');
                      if (generatorSectionRef.current) {
                        generatorSectionRef.current.scrollIntoView({ behavior: 'smooth' });
                      }
                      showToast(isAr ? '✓ تم إدراج نموذج الإطار في المولد!' : '✓ Loaded framework into generator!', false);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-stone-200 hover:bg-[#c29b40] hover:text-stone-950 text-stone-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>{isAr ? 'استخدام هذا الإطار في مولد البرومت' : 'Use in Prompt Synthesizer'}</span>
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* 3. AI Cliché Buster & Words To Avoid */}
          <section className="bg-white dark:bg-[#151412] rounded-3xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 space-y-5 shadow-sm">
            <div className="flex items-center gap-2.5 border-b border-stone-100 dark:border-stone-800 pb-3">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  {isAr ? '٣. فلتر الكلمات والعبارات النمطية للذكاء الاصطناعي (AI Cliché Buster)' : '3. AI Clichés & Words to Avoid in Academic Writing'}
                </h3>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  {isAr ? 'كلمات وتعبيرات نمطية تكشف النصوص المولدة آلياً وتفقد البحث أصالته العلمية، مع البدائل الرصينة المقترحة' : 'Common filler phrases that flag AI-generated text; replace them with genuine human scholarship'}
                </p>
              </div>
            </div>

            {/* Quick Cliché Interactive Scanner */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2.5">
              <label className="block text-xs font-bold text-amber-900 dark:text-amber-300">
                {isAr ? '🔍 فاحص الكلمات النمطية المباشر (الصق فقرة من بحثك لفحصها):' : '🔍 Instant Cliché Scanner (Paste a paragraph to scan):'}
              </label>
              <textarea
                rows={2}
                value={clicheCheckerInput}
                onChange={(e) => setClicheCheckerInput(e.target.value)}
                placeholder={isAr ? 'الصق نص مسودة بحثك هنا...' : 'Paste draft text to inspect...'}
                className="w-full text-xs rounded-xl border border-stone-300 dark:border-stone-700 p-2.5 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
              />
              {clicheCheckerInput.trim() && (
                <div className="text-xs pt-1">
                  {(() => {
                    const detected = AI_CLICHES_DATA.filter(item => 
                      clicheCheckerInput.toLowerCase().includes(item.ar.toLowerCase()) || 
                      clicheCheckerInput.toLowerCase().includes(item.en.toLowerCase())
                    );
                    if (detected.length === 0) {
                      return (
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>{isAr ? 'ممتاز! لم يتم رصد كلمات نمطية واضحة في النص.' : 'Clean! No obvious AI clichés detected.'}</span>
                        </span>
                      );
                    }
                    return (
                      <div className="space-y-1">
                        <span className="text-rose-700 dark:text-rose-400 font-bold block">
                          ⚠️ تم رصد {detected.length} تعبير/كلمة نمطية ينصح باستبدالها:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {detected.map((d, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-[10px] font-bold">
                              {d.ar} ← البديل: {d.alternativeAr}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Cliché Table */}
            <div className="overflow-x-auto rounded-2xl border border-stone-200 dark:border-stone-800">
              <table className="w-full text-xs text-start">
                <thead className="bg-stone-100 dark:bg-stone-900 text-stone-700 dark:text-stone-300 font-bold border-b border-stone-200 dark:border-stone-800">
                  <tr>
                    <th className="p-3 text-start">{isAr ? 'العبارة النمطية (تجنبها)' : 'AI Cliché'}</th>
                    <th className="p-3 text-start">{isAr ? 'المقابل الشائع بالإنجليزية' : 'English equivalent'}</th>
                    <th className="p-3 text-start text-emerald-700 dark:text-emerald-400">{isAr ? 'البديل الأكاديمي الرصين' : 'Academic Alternative'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-700 dark:text-stone-300">
                  {AI_CLICHES_DATA.map((item, idx) => (
                    <tr key={idx} className="hover:bg-stone-50 dark:hover:bg-stone-900/50">
                      <td className="p-3 font-bold text-rose-700 dark:text-rose-400 font-sans">{item.ar}</td>
                      <td className="p-3 font-mono text-[11px] text-stone-500">{item.en}</td>
                      <td className="p-3 font-bold text-emerald-700 dark:text-emerald-400 font-sans">{item.alternativeAr}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 4. Interactive Pre-Submission Thesis Checklist */}
          <section className="bg-white dark:bg-[#151412] rounded-3xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 space-y-4 shadow-sm">
            <div className="flex items-center gap-2.5 border-b border-stone-100 dark:border-stone-800 pb-3">
              <BookCheck className="w-5 h-5 text-[#c29b40]" />
              <div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  {isAr ? '٤. قائمة الفحص والمراجعة الشاملة للرسائل العلمية قبل التسليم' : '4. Pre-Submission Thesis & Research Checklist'}
                </h3>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  {isAr ? '10 معايير منهجية أساسية يجب التحقق منها قبل تقديم بحثك للجنة المناقشة أو المجلة العلمية' : '10 core methodological checkpoints before final committee submission or peer review'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {[
                { id: 'c1', title: 'وضوح وأصالة مشكلة البحث وتحديد الفجوة المعرفية بدقة' },
                { id: 'c2', title: 'اتساق أسئلة البحث مع الأهداف والفرضيات القابلة للاختبار' },
                { id: 'c3', title: 'ملاءمة المنهج العلمي وحساب حجم العينة بطريقة إحصائية سليمة' },
                { id: 'c4', title: 'التحقق من صدق وثبات أدوات الدراسة (الاستبيان/المقابلة)' },
                { id: 'c5', title: 'مناقشة النتائج وربطها بالدراسات السابقة وليس مجرد سرد الأرقام' },
                { id: 'c6', title: 'صياغة توصيات إجرائية عملية قابلة للتطبيق وبحوث مستقبلية' },
                { id: 'c7', title: 'التحقق اليدوي التام من صحة كافة المراجع وأرقام الـ DOI وعدم وجود مراجع وهمية' },
                { id: 'c8', title: 'توثيق المراجع داخل النص وفي القائمة وفق الإصدار السابع لـ APA 7th بدقة' },
                { id: 'c9', title: 'إدراج نموذج الإفصاح عن استخدام الذكاء الاصطناعي بكل شفافية وأمانة علمية' },
                { id: 'c10', title: 'مراجعة النص وخلوه من الكلمات والعبارات النمطية للذكاء الاصطناعي (AI Clichés)' },
              ].map((item) => {
                const isChecked = !!checklistItems[item.id];
                return (
                  <label 
                    key={item.id}
                    onClick={() => toggleChecklistItem(item.id)}
                    className={`p-3 rounded-2xl border transition-all flex items-start gap-2.5 cursor-pointer ${
                      isChecked 
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 font-bold' 
                        : 'bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="mt-0.5 h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="leading-relaxed select-none">{item.title}</span>
                  </label>
                );
              })}
            </div>

            {/* Checklist progress bar */}
            <div className="pt-2 flex items-center justify-between text-xs font-bold text-stone-600 dark:text-stone-400">
              <span>
                {isAr ? 'نسبة استيفاء معايير الجاهزية:' : 'Readiness Progress:'}{' '}
                {Object.values(checklistItems).filter(Boolean).length} / 10
              </span>
              <div className="w-48 h-2 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#c29b40] transition-all duration-300"
                  style={{ width: `${(Object.values(checklistItems).filter(Boolean).length / 10) * 100}%` }}
                />
              </div>
            </div>
          </section>

          {/* 5. Recommended Academic Verification Tools */}
          <section className="bg-stone-100 dark:bg-stone-900/60 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-bold text-sm">
              <Globe className="w-4 h-4 text-[#c29b40]" />
              <span>{isAr ? '٥. أدوات التحقق الأكاديمي واكتشاف الأخطاء الموصى بها في الدليل' : '5. Recommended Academic Verification & Citation Tools'}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs text-center">
              {[
                { name: 'Scite.ai', desc: 'فحص الاستشهادات الذكية والدعم' },
                { name: 'Elicit.com', desc: 'استخراج الأوراق وتلخيص المنهجية' },
                { name: 'Consensus.app', desc: 'إجماع الأدبيات بالذكاء الاصطناعي' },
                { name: 'ResearchRabbit', desc: 'خرائط شبكات المراجع المتصلة' },
                { name: 'Zotero', desc: 'إدارة وتوثيق المراجع APA7 مجاناً' },
                { name: 'CrossRef / DOI', desc: 'التحقق الرسمي من أصالة المرجع' },
              ].map((tool, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-1">
                  <span className="font-bold text-[#c29b40] block">{tool.name}</span>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 block leading-tight">{tool.desc}</span>
                </div>
              ))}
            </div>
          </section>

        </div>
      ) : activeMainView === 'cinematic_200' ? (
        /* ============================================================== */
        /* CINEMATIC FANTASY, SCI-FI & ART 200 PROMPT STUDIO VIEW        */
        /* ============================================================== */
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
            <button
              type="button"
              onClick={() => setActiveMainView('generator')}
              className="px-3.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-xs font-bold text-stone-800 dark:text-stone-200 transition cursor-pointer flex items-center gap-1.5"
            >
              <Arrow className="w-3.5 h-3.5" />
              <span>{isAr ? 'العودة لمولد الأوامر الأساسي' : 'Back to Prompt Synthesizer'}</span>
            </button>

            <span className="text-xs font-bold text-[#c29b40]">
              {isAr ? '200 برومبت سينمائي جاهز للنسخ المباشر' : '200 Production-Ready Cinematic Prompts'}
            </span>
          </div>

          <CinematicLibraryStudio
            lang={lang}
            onSendToBuilder={onSendToBuilder}
            onNavigateTab={onNavigateTab}
          />
        </div>
      ) : (
        /* ============================================================== */
        /* GENERATOR & FULL LIBRARY SHOWCASE VIEW                         */
        /* ============================================================== */
        <>
          {/* Prominent Cinematic 200 Library Banner */}
          <div className="bg-gradient-to-r from-stone-900 via-[#1c1a16] to-stone-900 border border-[#c29b40]/50 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#916a24] to-[#c29b40] text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
                <Film className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                    200 برومبت Midjourney v6.1 & Flux.1
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-white">
                    {isAr ? 'مكتبة البرومتات السينمائية الفائقة (فانتازيا وخيال علمي وفنون)' : 'Cinematic Fantasy / Sci-Fi / Art Library'}
                  </h3>
                </div>
                <p className="text-[11px] text-stone-300 mt-0.5">
                  {isAr
                    ? '200 برومبت سينمائي احترافي بنظام الكاميرات والعدسات 85mm f/1.2 والإضاءة، مجهزة للنسخ بضغطة زر لكل محرك.'
                    : '200 production-ready cinematic prompts with 85mm f/1.2 lenses and 5600K lighting for Midjourney & Flux.1.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveMainView('cinematic_200')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#916a24] via-[#c29b40] to-amber-500 hover:opacity-95 text-white text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-sm"
            >
              <span>{isAr ? 'تصفح مكتبة الـ 200 برومبت' : 'Browse 200 Prompts'}</span>
              <Arrow className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Prominent Academic Hub Banner inside Main View */}
          <div className="bg-gradient-to-r from-amber-500/15 via-[#c29b40]/20 to-amber-500/15 border border-[#c29b40]/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#c29b40] text-stone-950 flex items-center justify-center font-bold shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                  {isAr ? 'جديد: حقيبة الباحث الأكاديمي ودليل إعداد الأطروحات 2026' : 'New: Academic Researcher AI Toolkit & Thesis Guidelines'}
                </h3>
                <p className="text-[11px] text-stone-600 dark:text-stone-400">
                  {isAr 
                    ? '25 برومبت بحثي محكّم، 5 نماذج إفصاح رسمية، أطر هندسة الأوامر (ROPE / APE)، وفلتر الكلمات النمطية.'
                    : '25 peer-reviewed research prompts, 5 disclosure templates, ROPE frameworks, and cliché scanner.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveMainView('academic_hub')}
              className="px-4 py-2 rounded-xl bg-[#c29b40] hover:bg-[#b08b34] text-stone-950 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
            >
              <span>{isAr ? 'فتح الحقيبة الأكاديمية' : 'Open Academic Hub'}</span>
              <Arrow className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* ============================================================== */}
          {/* SECTION 1: ⚙️ مُولّف البرومتات الذكي (Meta-Prompt Fusion Engine) */}
          {/* ============================================================== */}
          <div 
            ref={generatorSectionRef}
            className="bg-white dark:bg-[#151412] rounded-3xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 shadow-sm space-y-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#c29b40]/15 text-[#916a24] dark:text-amber-400 flex items-center justify-center font-bold">
                  <Wand2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                    {isAr ? '١. هندسة وتوليف الفكرة مع البرومبت (بدون استدعاء API)' : '1. Idea Fusion & Meta-Prompt Synthesizer'}
                  </h2>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    {isAr ? `اكتب فكرتك أو اختر نموذجاً من الـ ${libraryCards.length} بطاقة أدناه لدمجها تلقائياً` : `Type your concept or pick from the ${libraryCards.length} templates below to fuse instantly`}
                  </p>
                </div>
              </div>

              {/* Preset Campaign Template Toggle */}
              <button
                type="button"
                onClick={() => setUseSampleTemplate(!useSampleTemplate)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                  useSampleTemplate 
                    ? 'bg-[#c29b40] text-stone-950 border-[#b38d35]' 
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{isAr ? 'استخدام قالب حملة تسويقية بمتغيرات' : 'Use Marketing Campaign Variables Template'}</span>
              </button>
            </div>

            {/* Step 1: Idea Input Form */}
            <div className="space-y-4">
              
              {/* Sample Variables inputs (if toggled) */}
              {useSampleTemplate && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-[#c29b40]/30 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-300">
                    <span className="flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-[#c29b40]" />
                      <span>{isAr ? 'متغيرات الحملة التسويقية الجاهزة:' : 'Marketing Campaign Variables:'}</span>
                    </span>
                    <span className="text-[10px] text-stone-500">
                      {isAr ? 'تُدمج تلقائياً في نص الفكرة' : 'Auto-injected into concept'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                        {isAr ? 'اسم المنتج أو الخدمة:' : 'Product Name:'}
                      </label>
                      <input
                        type="text"
                        value={sampleProductName}
                        onChange={(e) => setSampleProductName(e.target.value)}
                        placeholder="مثال: العطور الشرقية النادرة"
                        className="w-full text-xs rounded-xl border border-stone-300 dark:border-stone-700 p-2.5 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                        {isAr ? 'الجمهور المستهدف:' : 'Target Audience:'}
                      </label>
                      <input
                        type="text"
                        value={sampleAudience}
                        onChange={(e) => setSampleAudience(e.target.value)}
                        placeholder="مثال: رجال وسيدات الأعمال"
                        className="w-full text-xs rounded-xl border border-stone-300 dark:border-stone-700 p-2.5 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                        {isAr ? 'المدينة أو السوق المستهدف:' : 'City / Region:'}
                      </label>
                      <input
                        type="text"
                        value={sampleCity}
                        onChange={(e) => setSampleCity(e.target.value)}
                        placeholder="مثال: الرياض وجدة"
                        className="w-full text-xs rounded-xl border border-stone-300 dark:border-stone-700 p-2.5 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Main Idea Textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-stone-700 dark:text-stone-300">
                  <label htmlFor="idea-textarea">
                    {isAr ? 'ما الذي تريد تصميمه أو دراسته أو تنفيذه؟ (اكتب فكرتك بحرية بكلماتك البسيطة):' : 'What do you want to design, research or execute? (Write freely):'}
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-stone-400 font-mono font-normal">
                      {ideaText.length} {isAr ? 'حرف' : 'chars'}
                    </span>
                    {ideaText && (
                      <button
                        type="button"
                        onClick={() => setIdeaText('')}
                        className="text-[10px] text-stone-400 hover:text-rose-600 transition-colors"
                      >
                        {isAr ? 'مسح' : 'Clear'}
                      </button>
                    )}
                  </div>
                </div>

                <textarea
                  id="idea-textarea"
                  rows={4}
                  value={ideaText}
                  onChange={(e) => setIdeaText(e.target.value)}
                  placeholder={
                    isAr 
                      ? 'اكتب الفكرة هنا... مثلاً: دراسة أكاديمية عن أثر الذكاء الاصطناعي في جودة التعليم العالي وصياغة مشكلة البحث، أو صورة سينمائية لرجل أعمال، أو ملصق ترويجي لتطبيق...'
                      : 'Enter your idea here... e.g. Academic research on AI in higher education, or a cinematic portrait, or a modern logo...'
                  }
                  className="w-full text-xs sm:text-sm rounded-2xl border border-stone-300 dark:border-stone-700 p-3.5 bg-[#fdfdfc] dark:bg-stone-900 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-[#c29b40]/30 focus:border-[#c29b40]"
                />
              </div>

              {/* Quick Idea Preset Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-stone-500 font-bold">
                  {isAr ? '💡 أفكار سريعة للبدء:' : '💡 Fast Ideas:'}
                </span>
                {[
                  { labelAr: '🎓 صياغة مشكلة بحث وفجوة معرفية', textAr: 'تحويل موضوع أثر التحول الرقمي في الإدارة العامة إلى مشكلة بحثية دقيقة مع تحديد الفجوة المعرفية وصياغة 3 أسئلة رئيسية' },
                  { labelAr: '🎓 استبيان مقياس ليكرت الخماسي', textAr: 'تصميم استبيان علمي وفق مقياس ليكرت الخماسي لقياس الرضا الوظيفي والاحتراق المهني لدى الكادر الطبي' },
                  { labelAr: 'بورتريه سينمائي نيون', textAr: 'صورة شخصية سينمائية مقربة مع شريط ضوء نيون بنفسجي ينحت ملامح الوجه في بيئة ليلية غامضة' },
                  { labelAr: 'شعار مينيمالي فاخر', textAr: 'شعار هندسي بسيط يدمج الحرف الأول مع رمز السحابة الذهبية بأسلوب سويسري حديث' },
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setIdeaText(preset.textAr)}
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-850 hover:bg-[#c29b40]/15 hover:text-[#916a24] dark:hover:text-amber-400 text-stone-600 dark:text-stone-400 font-medium transition-all cursor-pointer border border-stone-200 dark:border-stone-800"
                  >
                    {preset.labelAr}
                  </button>
                ))}
              </div>

              {/* Step 2: Controls & Target Configuration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-3 border-t border-stone-100 dark:border-stone-800">
                
                {/* Category / Domain Selector */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-750 dark:text-stone-300 mb-1.5">
                    {isAr ? 'المجال التخصصي:' : 'Domain / Category:'}
                  </label>
                  <select
                    value={selectedDomain}
                    onChange={(e) => setSelectedDomain(e.target.value)}
                    className="w-full text-xs rounded-xl border border-stone-300 dark:border-stone-700 p-2.5 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 font-medium"
                  >
                    {Object.entries(DOMAIN_CATEGORIES).map(([key, item]) => (
                      <option key={key} value={key}>
                        {isAr ? item.nameAr : item.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Target AI Model */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-750 dark:text-stone-300 mb-1.5">
                    {isAr ? 'المنصة أو النموذج المستهدف:' : 'Target AI Model:'}
                  </label>
                  <select
                    value={targetModel}
                    onChange={(e) => setTargetModel(e.target.value)}
                    className="w-full text-xs rounded-xl border border-stone-300 dark:border-stone-700 p-2.5 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 font-medium"
                  >
                    {TARGET_MODELS.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                {/* Customer Language Selection: "لغة النتيجة — Output Language" */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-bold text-stone-750 dark:text-stone-300">
                      {isAr ? 'لغة النتيجة — Output Language:' : 'Output Language — لغة النتيجة:'}
                    </label>
                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-amber-500/15 text-[#916a24] dark:text-amber-400 border border-amber-500/20">
                      {isAr ? 'البرومبت إنجليزي دائماً 🔤' : 'Prompt in English 🔤'}
                    </span>
                  </div>
                  <select
                    value={outputLanguage}
                    onChange={(e) => setOutputLanguage(e.target.value)}
                    className="w-full text-xs rounded-xl border border-stone-300 dark:border-stone-700 p-2.5 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 font-medium"
                  >
                    {OUTPUT_LANGUAGE_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {isAr ? opt.labelAr : opt.labelEn}
                      </option>
                    ))}
                  </select>

                  {outputLanguage === 'other' && (
                    <input
                      type="text"
                      value={customOutputLanguage}
                      onChange={(e) => setCustomOutputLanguage(e.target.value)}
                      placeholder={isAr ? 'اكتب لغة النتيجة يدوياً (مثال: اليابانية، الروسية...)' : 'Type custom language (e.g., Japanese)...'}
                      className="mt-2 w-full text-xs rounded-xl border border-stone-300 dark:border-stone-700 p-2 bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-medium animate-in fade-in"
                    />
                  )}
                </div>

                {/* Detail Level */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-750 dark:text-stone-300 mb-1.5">
                    {isAr ? 'مستوى التفصيل الهندسي:' : 'Engineering Depth:'}
                  </label>
                  <select
                    value={detailLevel}
                    onChange={(e) => setDetailLevel(e.target.value as any)}
                    className="w-full text-xs rounded-xl border border-stone-300 dark:border-stone-700 p-2.5 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 font-medium"
                  >
                    <option value="short">{isAr ? 'موجز ودقيق' : 'Concise'}</option>
                    <option value="balanced">{isAr ? 'متوازن مع تفاصيل عملية' : 'Balanced'}</option>
                    <option value="deep">{isAr ? 'شديد التفصيل المنهجي والأكاديمي (موصى به)' : 'Deep Academic & Technical (Recommended)'}</option>
                  </select>
                </div>

              </div>

              {/* Target Audience Optional Input */}
              <div>
                <label className="block text-[11px] font-bold text-stone-750 dark:text-stone-300 mb-1">
                  {isAr ? 'الجمهور أو العينة المستهدفة (اختياري لتخصيص نبرة البرومت):' : 'Target Audience / Sample (Optional):'}
                </label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder={isAr ? 'مثال: أساتذة وطلاب الدراسات العليا، محكمو المجلات العلمية، المستهلكون المستهدفون...' : 'e.g. Peer reviewers, graduate students, consumers...'}
                  className="w-full text-xs rounded-xl border border-stone-300 dark:border-stone-700 p-2.5 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 placeholder-stone-400"
                />
              </div>

              {/* Step 3: Rules & Checkbox Directives */}
              <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 space-y-3">
                <span className="block text-xs font-bold text-stone-800 dark:text-stone-200">
                  {isAr ? '٣. قواعد اختيارية لتوجيه الذكاء الاصطناعي:' : '3. Optional Prompt Generation Rules:'}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  
                  {/* Directive 1: Execute Immediately */}
                  <label className="flex items-start gap-2.5 cursor-pointer p-2.5 rounded-xl hover:bg-white dark:hover:bg-stone-800 transition-colors border border-transparent hover:border-amber-400/30">
                    <input
                      type="checkbox"
                      checked={executeImmediately}
                      onChange={(e) => setExecuteImmediately(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-stone-300 text-[#c29b40] focus:ring-[#c29b40]"
                    />
                    <div className="leading-tight">
                      <span className="font-bold text-amber-800 dark:text-amber-300 block">
                        {isAr ? '⚡ أمر الذكاء الاصطناعي بتنفيذ الفكرة فوراً بعد توليد البرومبت' : '⚡ Execute Concept Immediately after Prompt Generation'}
                      </span>
                      <span className="text-[10px] text-stone-500 dark:text-stone-400">
                        {isAr ? 'يُلزم النموذج بصياغة البرومبت ثم تقديم الناتج الشامل المكتمل مباشرة' : 'Instructs AI to engineer the prompt and produce the complete deliverable'}
                      </span>
                    </div>
                  </label>

                  {/* Directive 2: 3 Variations */}
                  <label className="flex items-start gap-2.5 cursor-pointer p-2.5 rounded-xl hover:bg-white dark:hover:bg-stone-800 transition-colors">
                    <input
                      type="checkbox"
                      checked={provideVariants}
                      onChange={(e) => setProvideVariants(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-stone-300 text-[#c29b40] focus:ring-[#c29b40]"
                    />
                    <div className="leading-tight">
                      <span className="font-bold text-stone-800 dark:text-stone-200 block">
                        {isAr ? 'اطلب 3 صيغ بديلة للبرومت' : 'Request 3 Alternate Prompt Variations'}
                      </span>
                      <span className="text-[10px] text-stone-500 dark:text-stone-400">
                        {isAr ? 'نسخة رئيسية، نسخة متعمقة، ونسخة سريعة مع تمييز الأقوى' : 'Hero, in-depth, and rapid formulations'}
                      </span>
                    </div>
                  </label>

                  {/* Directive 3: Negative Constraints */}
                  <label className="flex items-start gap-2.5 cursor-pointer p-2.5 rounded-xl hover:bg-white dark:hover:bg-stone-800 transition-colors">
                    <input
                      type="checkbox"
                      checked={addNegativePrompt}
                      onChange={(e) => setAddNegativePrompt(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-stone-300 text-[#c29b40] focus:ring-[#c29b40]"
                    />
                    <div className="leading-tight">
                      <span className="font-bold text-stone-800 dark:text-stone-200 block">
                        {isAr ? 'أضف قيوداً سلبية لتجنب العيوب (Negative Prompt)' : 'Add Negative Constraints to Avoid Flaws'}
                      </span>
                      <span className="text-[10px] text-stone-500 dark:text-stone-400">
                        {isAr ? 'حظر الكلمات النمطية، والتشوهات، والادعاءات الوهمية' : 'Prevents AI tropes, visual deformities, and hallucinations'}
                      </span>
                    </div>
                  </label>

                  {/* Directive 4: Daw Ai Brand Signature */}
                  <label className="flex items-start gap-2.5 cursor-pointer p-2.5 rounded-xl hover:bg-white dark:hover:bg-stone-800 transition-colors">
                    <input
                      type="checkbox"
                      checked={addBrandCredit}
                      onChange={(e) => setAddBrandCredit(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-stone-300 text-[#c29b40] focus:ring-[#c29b40]"
                    />
                    <div className="leading-tight">
                      <span className="font-bold text-stone-800 dark:text-stone-200 block">
                        {isAr ? 'اطلب إضافة توقيع Daw Ai إلى التصميم' : 'Include "Daw Ai" Brand Signature'}
                      </span>
                      <span className="text-[10px] text-stone-500 dark:text-stone-400">
                        {isAr ? 'توقيع فني أنيق كعلامة للمصمم' : 'Subtle elegant signature mark'}
                      </span>
                    </div>
                  </label>

                  {/* Directive 5: ArabiPrompt Website URL */}
                  <label className="flex items-start gap-2.5 cursor-pointer p-2.5 rounded-xl hover:bg-white dark:hover:bg-stone-800 transition-colors">
                    <input
                      type="checkbox"
                      checked={addWebsiteCredit}
                      onChange={(e) => setAddWebsiteCredit(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-stone-300 text-[#c29b40] focus:ring-[#c29b40]"
                    />
                    <div className="leading-tight">
                      <span className="font-bold text-stone-800 dark:text-stone-200 block">
                        {isAr ? 'اطلب تضمين رابط ArabiPrompt عند الملاءمة' : 'Include ArabiPrompt URL Link'}
                      </span>
                      <span className="text-[10px] text-stone-500 dark:text-stone-400">
                        {isAr ? 'https://arabiprompt.ai.studio/' : 'Attribution website URL'}
                      </span>
                    </div>
                  </label>

                </div>

                {/* Step 3 Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSynthesizePrompt}
                    className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:opacity-95 text-white font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>{isAr ? '⚡ توليد البرومبت — مجاناً (Generate Prompt — Free)' : '⚡ Generate Prompt — Free'}</span>
                    <Arrow className="w-4 h-4 text-white" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIdeaText('');
                      setTargetAudience('');
                      setSynthesizedPrompt('');
                      showToast(isAr ? 'تم مسح الحقول' : 'Fields cleared', false);
                    }}
                    className="px-4 py-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 text-xs font-bold transition-all border border-stone-300 dark:border-stone-700 cursor-pointer"
                  >
                    {isAr ? 'مسح الحقول' : 'Reset Fields'}
                  </button>
                </div>
              </div>

            </div>

            {/* Synthesized Output Display */}
            {synthesizedPrompt && (
              <div 
                id="meta-prompt-output-section"
                className="p-5 sm:p-6 rounded-2xl bg-stone-900 text-stone-100 border border-stone-800 space-y-4 animate-in fade-in duration-300"
              >
                {/* Output Language Attribution Banner */}
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-[#c29b40]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-stone-200 font-bold flex-wrap">
                    <span className="text-base">🔤</span>
                    <span>{isAr ? 'البرومبت مُهندس بالإنجليزية الاحترافية دائماً' : 'Prompt Engineered in Professional English'}</span>
                    <span className="text-stone-500">•</span>
                    <span className="text-amber-300">
                      {isAr ? 'لغة النتيجة المحددة: ' : 'Output Result Language: '}
                      <strong className="underline underline-offset-2">
                        {outputLanguage === 'other' ? (customOutputLanguage || 'Other') : (OUTPUT_LANGUAGE_OPTIONS.find(l => l.id === outputLanguage)?.labelAr || 'العربية')}
                      </strong>
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-400 font-mono">
                    DawAi / ArabiPrompt (100% Free • 0 API)
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-amber-300">
                        {isAr ? '٤. انسخ البرومبت الإنجليزي واستخدمه مع أي نموذج:' : '4. Copy English Prompt & Use with Any AI:'}
                      </h3>
                      <p className="text-[10px] text-stone-400">
                        {isAr ? 'البرومبت بالإنجليزية لضمان دقة الاستجابة، وسينتج النموذج النتيجة باللغة التي حددتها.' : 'Prompt is in English for maximum AI adherence; output will be generated in your selected language.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Control 7: Copy Prompt */}
                    <button
                      type="button"
                      onClick={handleCopySynthesized}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        isCopiedOutput
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#c29b40] hover:bg-[#b08b34] text-stone-950 font-black'
                      }`}
                    >
                      {isCopiedOutput ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopiedOutput ? (isAr ? 'تم النسخ ✓' : 'Copied!') : (isAr ? 'نسخ البرومبت' : 'Copy Prompt')}</span>
                    </button>

                    {/* Control 8: Regenerate Prompt */}
                    <button
                      type="button"
                      onClick={handleSynthesizePrompt}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-stone-800 hover:bg-stone-750 text-amber-300 transition-all flex items-center gap-1.5 cursor-pointer border border-stone-700"
                      title={isAr ? 'إعادة التوليد' : 'Regenerate Prompt'}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{isAr ? 'إعادة التوليد' : 'Regenerate'}</span>
                    </button>

                    {/* Control 9: Save Prompt */}
                    <button
                      type="button"
                      onClick={handleSaveFavorite}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 transition-all flex items-center gap-1.5 cursor-pointer border border-amber-500/30"
                      title={isAr ? 'حفظ البرومبت' : 'Save prompt'}
                    >
                      <Star className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isAr ? 'حفظ البرومبت' : 'Save Prompt'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleExportTxt}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-stone-800 hover:bg-stone-700 text-stone-200 transition-all flex items-center gap-1.5 cursor-pointer border border-stone-700"
                      title={isAr ? 'تنزيل TXT' : 'Download TXT'}
                    >
                      <Download className="w-3.5 h-3.5 text-stone-400" />
                      <span>{isAr ? 'تنزيل TXT' : 'Download TXT'}</span>
                    </button>

                    {onSendToBuilder && (
                      <button
                        type="button"
                        onClick={() => onSendToBuilder(synthesizedPrompt, 'gemini', 'احترافي', 'content')}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 transition-all flex items-center gap-1.5 cursor-pointer border border-purple-500/30"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>{isAr ? 'فتح في المُهندس' : 'Builder'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Prompt Codebox */}
                <div className="bg-stone-950 p-4 rounded-xl text-xs font-mono leading-relaxed max-h-96 overflow-y-auto whitespace-pre-wrap select-text border border-stone-850 text-stone-200">
                  {synthesizedPrompt}
                </div>
              </div>
            )}

            {/* Local Favorites Section matching DawAi-library.html */}
            <div id="saved-favorites-section" className="p-5 sm:p-6 rounded-2xl bg-stone-50 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 dark:border-stone-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span>{isAr ? 'المفضلة المحلية للأوامر المولّدة' : 'Local Meta-Prompt Favorites'}</span>
                  </h3>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    {isAr ? 'تُحفظ في هذا المتصفح فقط؛ قد تُفقد عند حذف بيانات المتصفح.' : 'Stored locally in this browser; backed up via JSON export.'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setExportIncludeSaved(true);
                      setExportIncludeFavCards(false);
                      setExportIncludeAllCards(false);
                      setIsExportModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#c29b40] hover:bg-[#b08b34] text-stone-950 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title={isAr ? 'تصدير الأوامر المحفوظة في ملف JSON مهيكل للمشاركة أو النسخ الاحتياطي' : 'Export saved prompts as structured JSON'}
                  >
                    <FileJson className="w-3.5 h-3.5 text-stone-950" />
                    <span>{isAr ? 'تصدير JSON مهيكل' : 'Structured JSON Export'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportFavoritesJson}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-stone-800 hover:bg-stone-100 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 transition flex items-center gap-1.5 cursor-pointer"
                    title={isAr ? 'تنزيل فوري للملف' : 'Direct download'}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isAr ? 'تنزيل سريع' : 'Download'}</span>
                  </button>

                  <label className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-stone-800 hover:bg-stone-100 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 transition flex items-center gap-1.5 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isAr ? 'استيراد JSON' : 'Import JSON'}</span>
                    <input
                      type="file"
                      accept=".json,application/json"
                      onChange={handleImportFavoritesJson}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {savedFavorites.length === 0 ? (
                <p className="text-xs text-stone-400 py-3 text-center">
                  {isAr ? 'لا توجد برومتات محفوظة في المفضلة بعد. اضغط على "حفظ في المفضلة" عند توليف أي أمر.' : 'No saved favorites yet.'}
                </p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {savedFavorites.map((fav, i) => (
                    <div 
                      key={i}
                      className="p-3 rounded-xl bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-750 flex items-center justify-between gap-3 text-xs"
                    >
                      <span className="font-bold text-stone-800 dark:text-stone-200 truncate flex-1">
                        {fav.title}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setSynthesizedPrompt(fav.text);
                            const outSec = document.getElementById('meta-prompt-output-section');
                            if (outSec) outSec.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 text-stone-800 dark:text-stone-200 font-bold transition cursor-pointer"
                        >
                          {isAr ? 'عرض' : 'View'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteFavorite(i)}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold transition cursor-pointer"
                        >
                          {isAr ? 'حذف' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ============================================================== */}
          {/* SECTION 2: 📚 مكتبة الـ 115 برومبت المصنفة (Cards Showcase)    */}
          {/* ============================================================== */}
          <div className="space-y-6">
            
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
                    {isAr ? '📚 مكتبة النماذج الجاهزة — 115 برومبت مصنّف' : '📚 Curated Prompt Library — 115 Domain Templates'}
                  </h2>
                  <span className="text-xs font-black px-2 py-0.5 rounded-full bg-[#c29b40]/20 text-[#916a24] dark:text-amber-400">
                    {filteredCards.length}
                  </span>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  {isAr ? 'انقر على "دمج في المولد" لأي بطاقة لتضمينها فوراً في مولف الأوامر بالأعلى' : 'Click "Fuse in Generator" on any card to load it directly into the synthesizer'}
                </p>
              </div>

              {/* Search & Favorites Toggle */}
              <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
                <div className="relative flex-1 sm:w-64">
                  <Search className={`w-3.5 h-3.5 text-stone-400 absolute top-1/2 -translate-y-1/2 ${isAr ? 'right-3' : 'left-3'}`} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isAr ? `ابحث في الـ ${libraryCards.length} أمراً...` : `Search ${libraryCards.length} prompts...`}
                    className={`w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-xs py-2 text-stone-900 dark:text-stone-100 placeholder-stone-400 ${
                      isAr ? 'pr-9 pl-3' : 'pl-9 pr-3'
                    }`}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setFavoritesOnly(!favoritesOnly)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 border ${
                    favoritesOnly
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                      : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:bg-stone-100'
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 ${favoritesOnly ? 'fill-current' : ''}`} />
                  <span>{isAr ? 'المفضلة' : 'Favorites'}</span>
                  {favorites.length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-white font-mono">
                      {favorites.length}
                    </span>
                  )}
                </button>

                {favorites.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setExportIncludeSaved(false);
                      setExportIncludeFavCards(true);
                      setExportIncludeAllCards(false);
                      setIsExportModalOpen(true);
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 border bg-amber-500/10 hover:bg-amber-500/20 text-[#916a24] dark:text-amber-400 border-amber-500/30"
                    title={isAr ? 'تصدير قوالب المكتبة المفضلة كملف JSON مهيكل' : 'Export favorite cards as structured JSON'}
                  >
                    <FileJson className="w-3.5 h-3.5" />
                    <span>{isAr ? 'تصدير المفضلة JSON' : 'Export Favs JSON'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Category Horizontal Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {libraryTabs.map((tab) => {
                const isActive = selectedCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedCategory(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-[#c29b40] text-stone-950 font-black shadow-xs'
                        : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200/80 dark:border-stone-800'
                    }`}
                  >
                    <span>{isAr ? tab.labelAr : tab.labelEn}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-stone-950/20 text-stone-950' : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Grid of Prompt Cards */}
            {filteredCards.length === 0 ? (
              <div className="bg-white dark:bg-[#151412] rounded-3xl border border-stone-200 dark:border-stone-800 p-12 text-center space-y-3">
                <Search className="w-8 h-8 text-stone-400 mx-auto" />
                <h4 className="text-sm font-bold text-stone-800 dark:text-stone-200">
                  {isAr ? 'لم يتم العثور على أوامر مطابقة للبحث' : 'No matching prompts found'}
                </h4>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setFavoritesOnly(false);
                  }}
                  className="text-xs font-bold text-[#c29b40] hover:underline cursor-pointer"
                >
                  {isAr ? 'إعادة ضبط عوامل التصفية' : 'Reset filters'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCards.map((card) => {
                  const isFav = favorites.includes(card.id);
                  const isCopied = copiedCardId === card.id;

                  return (
                    <div
                      key={card.id}
                      className="bg-white dark:bg-[#151412] rounded-2xl border border-stone-200 dark:border-stone-800 p-4 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all space-y-3 hover:border-[#c29b40]/40 group"
                    >
                      <div className="space-y-2">
                        {/* Header badge & favorite */}
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                            card.cat === 'research'
                              ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30'
                              : card.cat === 'nanobanana'
                              ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/40'
                              : card.cat === 'prompts_chat'
                              ? 'bg-sky-500/15 text-sky-800 dark:text-sky-300 border-sky-500/35'
                              : 'bg-[#c29b40]/15 text-[#916a24] dark:text-amber-400 border-[#c29b40]/25'
                          }`}>
                            #{card.cat === 'nanobanana' ? 'Nano Banana' : card.cat === 'prompts_chat' ? 'prompts.chat' : card.cat}
                          </span>

                          <button
                            type="button"
                            onClick={() => toggleFavorite(card.id)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isFav
                                ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                                : 'text-stone-300 dark:text-stone-600 hover:text-amber-500'
                            }`}
                            title={isFav ? (isAr ? 'إزالة من المفضلة' : 'Remove favorite') : (isAr ? 'إضافة للمفضلة' : 'Add to favorites')}
                          >
                            <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                          </button>
                        </div>

                        {/* Title */}
                        <h3 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 leading-snug line-clamp-2">
                          {card.title}
                        </h3>

                        {/* Body text snippet */}
                        <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed line-clamp-4 bg-stone-50 dark:bg-stone-900/80 p-2.5 rounded-xl border border-stone-100 dark:border-stone-800/80 font-mono">
                          {card.body}
                        </p>
                      </div>

                      {/* Card Actions */}
                      <div className="pt-2 border-t border-stone-100 dark:border-stone-800/80 flex items-center gap-1.5 flex-wrap">
                        
                        {/* Inject in generator button */}
                        <button
                          type="button"
                          onClick={() => handleInjectCardIntoSynthesizer(card)}
                          className="flex-1 py-1.5 px-2.5 rounded-xl bg-[#c29b40] hover:bg-[#b08b34] text-stone-950 font-black text-[11px] transition-all flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                          title={isAr ? 'إدراج في المولد بالأعلى لتوليف برومبت متكامل' : 'Inject into synthesizer'}
                        >
                          <Wand2 className="w-3 h-3" />
                          <span>{isAr ? 'دمج في المولد ⚡' : 'Fuse in Generator'}</span>
                        </button>

                        {/* Copy directly */}
                        <button
                          type="button"
                          onClick={() => handleCopyCard(card)}
                          className={`p-1.5 rounded-xl transition-all cursor-pointer border ${
                            isCopied
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-200'
                          }`}
                          title={isAr ? 'نسخ نص البرومبت مباشرة' : 'Copy prompt text'}
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>

                        {/* Edit card */}
                        <button
                          type="button"
                          onClick={() => handleStartEditCard(card)}
                          className="p-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 text-[11px] font-bold transition cursor-pointer"
                          title={isAr ? 'تعديل البرومبت في لوحة الإدارة' : 'Edit prompt'}
                        >
                          <PenTool className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete card */}
                        <button
                          type="button"
                          onClick={() => handleDeleteCard(card.id)}
                          className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 text-[11px] font-bold transition cursor-pointer"
                          title={isAr ? 'حذف البرومبت محلياً' : 'Delete prompt'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>

          {/* ============================================================== */}
          {/* SECTION 3: 🛠️ لوحة إدارة محلية (Local Template Manager)         */}
          {/* ============================================================== */}
          <div id="local-manager-section" className="bg-white dark:bg-[#151412] rounded-3xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#c29b40]" />
                    <span>{isAr ? '🛠️ لوحة إدارة محلية لمكتبة البرومتات' : '🛠️ Local Library Manager'}</span>
                  </h3>
                  {editingCardId !== null && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 font-bold border border-amber-500/30">
                      {isAr ? 'وضع التعديل نشط' : 'Edit Mode Active'}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                  {isAr 
                    ? 'تُحفظ الإضافات والتعديلات في هذا المتصفح فقط. استخدم تصدير JSON للاحتفاظ بنسخة احتياطية.' 
                    : 'Changes are stored in this browser only. Use JSON export for off-site backup.'}
                </p>
              </div>

              {/* Reset to 115 defaults */}
              <button
                type="button"
                onClick={handleResetToDefaults}
                className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-600 dark:text-stone-400 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer"
                title={isAr ? 'استعادة كامل البرومبتات الأصلية (115 أمراً)' : 'Reset library to default 115 prompts'}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isAr ? 'استعادة الأصلية (115)' : 'Reset Defaults'}</span>
              </button>
            </div>

            {/* Upsert Form */}
            <form onSubmit={handleSaveCardUpsert} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                    {isAr ? 'عنوان البرومت:' : 'Prompt Title:'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newCardTitle}
                    onChange={(e) => setNewCardTitle(e.target.value)}
                    placeholder={isAr ? 'مثال: بورتريه سينمائي تحت المطر' : 'e.g. Cinematic portrait under rain'}
                    className="w-full text-xs rounded-xl border border-stone-300 dark:border-stone-700 p-2.5 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                    {isAr ? 'الفئة والتصنيف:' : 'Category:'}
                  </label>
                  <select
                    value={newCardCategory}
                    onChange={(e) => setNewCardCategory(e.target.value)}
                    className="w-full text-xs rounded-xl border border-stone-300 dark:border-stone-700 p-2.5 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-medium"
                  >
                    <option value="prompts_chat">{isAr ? '💬 مستودع prompts.chat' : 'prompts.chat Showcase'}</option>
                    <option value="nanobanana">{isAr ? 'كتاب النانو والتوليد (nanobanana)' : 'Nano Banana Promptbook'}</option>
                    <option value="research">{isAr ? 'بحث علمي (research)' : 'Academic Research'}</option>
                    <option value="portrait">{isAr ? 'بورتريه (portrait)' : 'Portrait'}</option>
                    <option value="graphic">{isAr ? 'جرافيك (graphic)' : 'Graphic'}</option>
                    <option value="abstract">{isAr ? 'تجريدي (abstract)' : 'Abstract'}</option>
                    <option value="illustration">{isAr ? 'رسوم توضيحية (illustration)' : 'Illustration'}</option>
                    <option value="gemini">{isAr ? 'Gemini (gemini)' : 'Gemini'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  {isAr ? 'نص البرومت الكامل:' : 'Prompt Body Text:'}
                </label>
                <textarea
                  required
                  rows={4}
                  value={newCardBody}
                  onChange={(e) => setNewCardBody(e.target.value)}
                  placeholder={isAr ? 'اكتب النص الهندسي بالتفصيل...' : 'Enter prompt body text...'}
                  className="w-full text-xs rounded-xl border border-stone-300 dark:border-stone-700 p-3 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-mono"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-black bg-[#c29b40] hover:bg-[#b08b34] text-stone-950 transition cursor-pointer shadow-xs"
                  >
                    {editingCardId !== null 
                      ? (isAr ? 'حفظ التعديلات ✓' : 'Update Prompt ✓') 
                      : (isAr ? 'حفظ البرومت في المكتبة' : 'Save to Library')}
                  </button>

                  {editingCardId !== null && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 transition cursor-pointer"
                    >
                      {isAr ? 'إلغاء التعديل' : 'Cancel Edit'}
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportLibraryJson}
                    className="px-3.5 py-2 rounded-xl bg-white dark:bg-stone-800 hover:bg-stone-50 border border-stone-300 dark:border-stone-700 text-xs font-bold text-stone-800 dark:text-stone-200 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-stone-500" />
                    <span>{isAr ? 'تصدير المكتبة JSON' : 'Export JSON'}</span>
                  </button>

                  <label className="px-3.5 py-2 rounded-xl bg-white dark:bg-stone-800 hover:bg-stone-50 border border-stone-300 dark:border-stone-700 text-xs font-bold text-stone-800 dark:text-stone-200 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-stone-500" />
                    <span>{isAr ? 'استيراد مكتبة JSON' : 'Import JSON'}</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportLibraryJson}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </form>
          </div>

          {/* ============================================================== */}
          {/* SECTION 4: 📖 مراجع ومصادر المكتبة (Attribution Citations)      */}
          {/* ============================================================== */}
          <div className="p-5 sm:p-6 rounded-2xl bg-amber-500/10 border border-[#c29b40]/30 space-y-3 text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
            <h4 className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#c29b40]" />
              <span>{isAr ? '📖 مراجع ومصادر مكتبة الأوامر المهندسة:' : '📖 Curated Prompts Reference Guides:'}</span>
            </h4>
            <div className="space-y-1.5">
              <p>
                <strong className="text-amber-800 dark:text-amber-300">١. كتاب The Promptbook (Nano Banana / MEF University):</strong>{' '}
                {isAr
                  ? '30 قالباً احترافياً للتوليد البصري التجاري، أوزان العناصر (::)، البرومبت السلبي، التحكم برقم البذرة (--seed)، معامل الفوضى (--c)، دراسات أساليب الفنانين ورندرات Octane و Unreal Engine.'
                  : '30 production prompts for commercial 3D renders, multi-weighting (::), negative prompting, seed consistency, chaos parameters, and master artist styles.'}
              </p>
              <p>
                <strong className="text-purple-800 dark:text-purple-300">٢. كتاب برومبتات الذكاء الاصطناعي للباحثين (2026):</strong>{' '}
                {isAr 
                  ? '25 قالباً أكاديمياً محكّماً لمراجعة الأدبيات، أطر ROPE و APE، كشف الفجوة البحثية، تحكيم الأقران، وتوثيق APA الإصدار السابع.'
                  : '25 academic research prompts for literature review, ROPE frameworks, research gap analysis, peer review simulation, and APA-7 citation formatting.'}
              </p>
              <p>
                <strong className="text-sky-800 dark:text-sky-300">٣. مستودع ومجتمع prompts.chat العالمي الشهير:</strong>{' '}
                {isAr
                  ? '28 برومت متقدم شمل استوديو 808 Bento، الرسوم المتحركة الإسلامية 9:16، مراجعة الأكواد CodeRabbit، أمان البريد الإلكتروني Rule of Two، تدقيق تيرافورم Nginx و SQL، إرشادات كارباثي البرمجية، وتخطيط الحياة اليومية.'
                  : '28 advanced prompts including 808 Bento studio portraits, 9:16 motion graphics, CodeRabbit review, Rule of Two email security, Terraform & Nginx hardening, SQL audits, and Karpathy LLM guidelines.'}
              </p>
            </div>
          </div>
        </>
      )}

      {/* Add Custom Prompt Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#1c1a16] rounded-3xl border border-stone-200 dark:border-stone-800 max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#c29b40]" />
                <span>{isAr ? 'إضافة برومبت جديد للمكتبة' : 'Add New Custom Prompt'}</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewCard} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  {isAr ? 'عنوان البرومبت:' : 'Title:'}
                </label>
                <input
                  type="text"
                  required
                  value={newCardTitle}
                  onChange={(e) => setNewCardTitle(e.target.value)}
                  placeholder={isAr ? 'مثال: بورتريه سينمائي كلاسيكي أو فكرة بحثية' : 'e.g. Classic black & white portrait'}
                  className="w-full text-xs rounded-xl border border-stone-300 dark:border-stone-700 p-2.5 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  {isAr ? 'التصنيف:' : 'Category:'}
                </label>
                <select
                  value={newCardCategory}
                  onChange={(e) => setNewCardCategory(e.target.value)}
                  className="w-full text-xs rounded-xl border border-stone-300 dark:border-stone-700 p-2.5 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                >
                  <option value="prompts_chat">{isAr ? '💬 مستودع prompts.chat العالمي' : 'prompts.chat Showcase'}</option>
                  <option value="nanobanana">{isAr ? '🍌 كتاب النانو والتوليد (Nano Banana & Promptbook)' : 'Nano Banana Promptbook'}</option>
                  <option value="research">{isAr ? 'بحث علمي ودراسات عليا (Research)' : 'Research'}</option>
                  <option value="portrait">{isAr ? 'بورتريه (Portrait)' : 'Portrait'}</option>
                  <option value="graphic">{isAr ? 'جرافيك وشعارات (Graphic & Logo)' : 'Graphic'}</option>
                  <option value="abstract">{isAr ? 'فن تجريدي (Abstract)' : 'Abstract'}</option>
                  <option value="illustration">{isAr ? 'رسوم توضيحية (Illustration)' : 'Illustration'}</option>
                  <option value="gemini">{isAr ? 'أوامر Gemini' : 'Gemini'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  {isAr ? 'نص البرومبت الكامل:' : 'Prompt Text:'}
                </label>
                <textarea
                  required
                  rows={4}
                  value={newCardBody}
                  onChange={(e) => setNewCardBody(e.target.value)}
                  placeholder={isAr ? 'اكتب نص البرومبت بالتفصيل...' : 'Write prompt details...'}
                  className="w-full text-xs rounded-xl border border-stone-300 dark:border-stone-700 p-2.5 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#c29b40] hover:bg-[#b08b34] text-stone-950 font-black"
                >
                  {isAr ? 'حفظ في المكتبة' : 'Save to Library'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Structured JSON Export / Backup & Sharing Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#181613] rounded-3xl border border-stone-350 dark:border-stone-750 max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-stone-200 dark:border-stone-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
                  <FileJson className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100">
                    {isAr ? '📦 تصدير ومشاركة الأوامر المحفوظة والمفضلة (JSON مهيكل)' : '📦 Export & Share Saved Prompts (Structured JSON)'}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    {isAr 
                      ? 'إنشاء ملف JSON موحد ومنظّم يحتوي على بياناتك الفكرية ومفضلاتك للنسخ الاحتياطي أو النقل أو المشاركة.' 
                      : 'Generate a single structured JSON file containing your saved and favorite prompts for backup or sharing.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Checkbox selector options */}
            <div className="space-y-3">
              <span className="block text-xs font-bold text-stone-750 dark:text-stone-300">
                {isAr ? 'اختر المحتويات المراد تضمينها في ملف الـ JSON المهيكل:' : 'Select contents to include in structured JSON:'}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Option 1: Saved meta prompts */}
                <label className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                  exportIncludeSaved 
                    ? 'bg-amber-500/10 border-amber-500/40 text-stone-900 dark:text-stone-100' 
                    : 'bg-stone-50 dark:bg-stone-900/60 border-stone-200 dark:border-stone-800 text-stone-500'
                }`}>
                  <input
                    type="checkbox"
                    checked={exportIncludeSaved}
                    onChange={(e) => setExportIncludeSaved(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-stone-300 text-[#c29b40] focus:ring-[#c29b40]"
                  />
                  <div className="flex-1 leading-tight">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold">{isAr ? 'الأوامر المولدة المحفوظة' : 'Saved Meta-Prompts'}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-amber-500/20 text-[#916a24] dark:text-amber-400 font-bold">
                        {savedFavorites.length}
                      </span>
                    </div>
                    <span className="text-[10px] text-stone-500 dark:text-stone-400 block mt-1">
                      {isAr ? 'أوامر التوليف المكتملة المحفوظة من الخطوة 4' : 'Synthesized master prompts from Step 4'}
                    </span>
                  </div>
                </label>

                {/* Option 2: Favorite library prompts */}
                <label className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                  exportIncludeFavCards 
                    ? 'bg-amber-500/10 border-amber-500/40 text-stone-900 dark:text-stone-100' 
                    : 'bg-stone-50 dark:bg-stone-900/60 border-stone-200 dark:border-stone-800 text-stone-500'
                }`}>
                  <input
                    type="checkbox"
                    checked={exportIncludeFavCards}
                    onChange={(e) => setExportIncludeFavCards(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-stone-300 text-[#c29b40] focus:ring-[#c29b40]"
                  />
                  <div className="flex-1 leading-tight">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold">{isAr ? 'قوالب المكتبة المفضلة (⭐)' : 'Favorite Library Templates'}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-amber-500/20 text-[#916a24] dark:text-amber-400 font-bold">
                        {favorites.length}
                      </span>
                    </div>
                    <span className="text-[10px] text-stone-500 dark:text-stone-400 block mt-1">
                      {isAr ? 'البطاقات المعلمة بنجمة في تصنيفات المكتبة' : 'Starred prompt cards in the catalog'}
                    </span>
                  </div>
                </label>
              </div>

              {/* Option 3: All custom cards */}
              <label className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 text-xs ${
                exportIncludeAllCards 
                  ? 'bg-purple-500/10 border-purple-500/40 text-stone-900 dark:text-stone-100' 
                  : 'bg-stone-50 dark:bg-stone-900/60 border-stone-200 dark:border-stone-800 text-stone-500'
              }`}>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={exportIncludeAllCards}
                    onChange={(e) => setExportIncludeAllCards(e.target.checked)}
                    className="h-4 w-4 rounded border-stone-300 text-purple-600 focus:ring-purple-600"
                  />
                  <span className="font-bold">
                    {isAr ? 'تضمين كافة بطاقات المكتبة الـ 115 والبطاقات المخصصة' : 'Include all 115 library & custom cards'}
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-700 dark:text-purple-300 font-bold">
                  {libraryCards.length}
                </span>
              </label>
            </div>

            {/* Live Structure Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                <span className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{isAr ? 'معاينة هيكل الـ JSON الموحّد (نسخة 1.0):' : 'Structured JSON Schema Preview (v1.0):'}</span>
                </span>
                <span className="text-[10px] font-mono text-stone-400">
                  {getStructuredExportPayload().summary.totalItems} {isAr ? 'عنصر إجمالي' : 'total items'}
                </span>
              </div>

              <div className="bg-stone-950 p-3.5 rounded-2xl text-[11px] font-mono leading-relaxed max-h-48 overflow-y-auto text-emerald-400 border border-stone-850 select-text">
                <pre>{JSON.stringify(getStructuredExportPayload(), null, 2)}</pre>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <label className="px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border border-stone-300 dark:border-stone-700">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isAr ? 'استرجاع من JSON' : 'Restore from JSON'}</span>
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleImportFavoritesJson}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyStructuredJson}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                    isJsonCopied
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 border-stone-300 dark:border-stone-700'
                  }`}
                >
                  {isJsonCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isJsonCopied ? (isAr ? 'تم النسخ ✓' : 'Copied!') : (isAr ? 'نسخ JSON للمشاركة' : 'Copy JSON')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadStructuredExport}
                  className="px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-[#916a24] via-[#c29b40] to-[#b08b34] hover:opacity-95 text-stone-950 transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Download className="w-4 h-4 text-stone-950" />
                  <span>{isAr ? 'تنزيل ملف JSON (.json)' : 'Download JSON (.json)'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
