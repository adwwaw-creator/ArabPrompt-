/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Sparkles, Dices, Copy, Check, Heart, Search, ArrowRight, ArrowLeft, RefreshCw, Wand2, Lightbulb, ChevronDown, ChevronUp, Layers, Flame } from 'lucide-react';
import { ModelType, AppLanguage } from '../types';
import { showToast } from './ToastNotification';
import { appendSiteUrlToPrompt } from '../utils/brandWatermark';

export interface PromptIdea {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  conceptAr: string;
  conceptEn: string;
  category: 'content' | 'marketing' | 'tech' | 'education' | 'productivity' | 'visual';
  recommendedModel: ModelType;
  recommendedTone: string;
  tags: string[];
}

interface PromptIdeaGeneratorProps {
  lang: AppLanguage;
  onSelectIdea: (idea: {
    concept: string;
    model: ModelType;
    tone: string;
    category: string;
  }) => void;
  compact?: boolean;
}

const CURATED_IDEAS: PromptIdea[] = [
  // 1. Tech & Architecture
  {
    id: 'tech-clean-arch',
    titleAr: 'مراجعة وتصميم معمارية Clean Architecture',
    titleEn: 'Clean Architecture Blueprint & Code Review',
    descriptionAr: 'هندسة بنية برمجية تفصل منطق الأعمال عن أطر العمل وقواعد البيانات لتسهيل التوسع والاختبار.',
    descriptionEn: 'Architectural blueprint separating domain logic from external frameworks for scalable code.',
    conceptAr: 'أريد تصميم معمارية برمجية وفق مبادئ Clean Architecture لتطبيق SaaS مبني بـ TypeScript و Node.js. زوّدني بمخطط المجلدات، طبقات الـ Use Cases و Entities ومنافذ الـ Repositories مع أمثلة كود لاختبارات الوحدة.',
    conceptEn: 'Design a clean architecture pattern for a Node.js TypeScript SaaS backend. Detail domain entities, repository interfaces, use-case interactor layers, and dependency injection examples with unit test stubs.',
    category: 'tech',
    recommendedModel: 'claude',
    recommendedTone: 'صارم ومباشر',
    tags: ['Architecture', 'TypeScript', 'Clean Code', 'Backend']
  },
  {
    id: 'tech-sql-opt',
    titleAr: 'تحسين استعلامات SQL ومعالجة اختناقات الأداء',
    titleEn: 'SQL Query Optimization & Bottleneck Remediation',
    descriptionAr: 'تحليل خطط تنفيذ الاستعلامات وبناء الفهارس المناسبة لتقليل زمن الاستجابة في قواعد البيانات الضخمة.',
    descriptionEn: 'Analyze execution plans and craft composite indexes to eliminate slow query bottlenecks in Postgres.',
    conceptAr: 'لدي استعلام SQL بطيء يستغرق أكثر من 4 ثوانٍ في جدول طلبات يحتوي على 5 ملايين سجل. ساعدني في فحص EXPLAIN ANALYZE، واقتراح فهارس مركبة (Composite Indexes)، وإعادة كتابة الاستعلام لتجنب Full Table Scan.',
    conceptEn: 'Diagnose and optimize a sluggish PostgreSQL query on a 5M-row orders table taking over 4s. Review EXPLAIN ANALYZE, advise on composite indexing strategies, and refactor queries to avoid sequential scans.',
    category: 'tech',
    recommendedModel: 'claude',
    recommendedTone: 'مهني واحترافي',
    tags: ['PostgreSQL', 'Performance', 'Database', 'Indexing']
  },
  {
    id: 'tech-security-audit',
    titleAr: 'فحص أمني وتدقيق ثغرات OWASP لنقاط REST API',
    titleEn: 'OWASP Top 10 Security Audit for REST APIs',
    descriptionAr: 'بروتوكول تدقيق أمني لاكتشاف ثغرات التحقق من الصلاحيات وكسر التخويل وحقن البيانات.',
    descriptionEn: 'Systematic security evaluation covering broken object-level auth, SSRF, and injection vectors.',
    conceptAr: 'قم بدور كبير مهندسي الأمن السيبراني وافحص نقاط نهاية REST API الخاصة بمدفوعات المتجر. ركز على ثغرات BOLA/IDOR، وRate Limiting، وتشفير التوكنات، وقدّم توصيات برمجية مباشرة مع معايير OWASP.',
    conceptEn: 'Act as a Principal Application Security Engineer to audit RESTful checkout endpoints. Focus on BOLA/IDOR, broken authorization, rate-limiting bypasses, and token security, with exact mitigation code snippets.',
    category: 'tech',
    recommendedModel: 'claude',
    recommendedTone: 'صارم ومباشر',
    tags: ['Security', 'OWASP', 'API', 'Cybersecurity']
  },

  // 2. Marketing & Copywriting
  {
    id: 'mkt-pas-ad',
    titleAr: 'حملة إعلانية مقنعة بإطار المشكلة والتفاقم والحل (PAS)',
    titleEn: 'High-Converting Ad Copy using PAS Framework',
    descriptionAr: 'صياغة نصوص إعلانات سريعة التأثير تلمس مشاعر الجمهور وتحفزهم على اتخاذ إجراء فوري.',
    descriptionEn: 'Persuasive direct-response copy that pinpoints pain points and presents irresistible solutions.',
    conceptAr: 'اكتب 3 صيغ إعلانات مدفوعة لمنصة إدارة مهام موجهة للشركات الصغيرة باستخدام إطار PAS (Problem - Agitation - Solution). احرص على خطافات (Hooks) تخطف الانتباه في أول 3 ثوانٍ ودعوة واضحة لاتخاذ إجراء (CTA).',
    conceptEn: 'Write 3 high-converting paid social ad variations for a small-business task management tool using the Problem-Agitation-Solution (PAS) framework. Include punchy 3-second hooks and urgent CTAs.',
    category: 'marketing',
    recommendedModel: 'chatgpt',
    recommendedTone: 'تسويقي مبيعاتي',
    tags: ['Copywriting', 'PAS Framework', 'Ads', 'Conversion']
  },
  {
    id: 'mkt-saas-launch',
    titleAr: 'خطة إطلاق منتج رقمي على Product Hunt ولينكدإن',
    titleEn: 'Digital Product Launch Strategy (Product Hunt & LinkedIn)',
    descriptionAr: 'استراتيجية إطلاق مرحلية تشمل بناء الترقب قبل اليوم الأول، والتفاعل مع مجتمع المطورين.',
    descriptionEn: 'Step-by-step launch roadmap including pre-launch teaser sprints and engagement playbooks.',
    conceptAr: 'ضع خطة إطلاق تفصيلية مدتها 14 يوماً لأداة ذكاء اصطناعي لرواد الأعمال، تشمل نصوص منشورات تشويقية للينكدإن، ورسالة الإطلاق الرسمية على Product Hunt، ورسائل تواصل شخصية للمؤثرين التقنيين.',
    conceptEn: 'Develop a comprehensive 14-day launch blueprint for a new AI productivity SaaS on Product Hunt and LinkedIn. Include teaser social copy, first-comment founder story, and influencer outreach templates.',
    category: 'marketing',
    recommendedModel: 'gemini',
    recommendedTone: 'تسويقي مبيعاتي',
    tags: ['Product Hunt', 'Launch', 'Strategy', 'Growth']
  },

  // 3. Content & Storytelling
  {
    id: 'content-thought-lead',
    titleAr: 'مقال رأي متعمق (Thought Leadership) يكسر الأفكار السائدة',
    titleEn: 'Contrarian Thought Leadership Article',
    descriptionAr: 'طرح وجهة نظر غير تقليدية ومثيرة للتفكير مدعومة بالبيانات والتجارب الواقعية في عالم الأعمال.',
    descriptionEn: 'Compelling essay challenging conventional industry wisdom with reasoned contrarian insights.',
    conceptAr: 'اكتب مسودة مقال متعمق يجادل بأن "العمل عن بُعد يحتاج لإعادة تعريف جذرية وليس مجرد مكالمات زووم". استخدم تشبيهات بلاغية قوية، وأمثلة من شركات رائدة، واختم بتوصيات استراتيجية للقادة.',
    conceptEn: 'Draft an incisive contrarian essay arguing why remote work culture is stagnating through superficial tooling. Provide deep metaphors, case studies, and an actionable manifesto for modern asynchronous leaders.',
    category: 'content',
    recommendedModel: 'gemini',
    recommendedTone: 'إبداعي وحر',
    tags: ['Thought Leadership', 'Essay', 'Remote Work', 'Culture']
  },
  {
    id: 'content-podcast-script',
    titleAr: 'سيناريو بودكاست حواري مشوق مع ضيف خبير',
    titleEn: 'Engaging Interview-Style Podcast Script',
    descriptionAr: 'هيكلة حلقة بودكاست تشمل مقدمة سينمائية، وأسئلة استكشافية عميقة، وتلخيصاً للأفكار الجوهرية.',
    descriptionEn: 'Dynamic interview script with gripping intro monologue, layered deep-dive questions, and wrap-up.',
    conceptAr: 'صغ سيناريو حلقة بودكاست صوتي مدتها 45 دقيقة حول "مستقبل المدن الذكية في الشرق الأوسط". يشمل السيناريو تمهيداً سردياً مؤثراً، و7 أسئلة متدرجة من العموميات إلى الأسرار المهنية، وخاتمة تلخص الدروس.',
    conceptEn: 'Craft a 45-minute conversational podcast outline exploring the future of sustainable smart cities. Include a cinematic opening hook, probing questions that elicit unscripted vulnerability, and a takeaway outro.',
    category: 'content',
    recommendedModel: 'notebooklm',
    recommendedTone: 'إبداعي وحر',
    tags: ['Podcast', 'Scriptwriting', 'Interview', 'Audio']
  },

  // 4. Education & Learning
  {
    id: 'edu-feynman-concept',
    titleAr: 'شرح مفهوم معقد بتقنية فاينمان (تبسيط للأطفال والخبراء)',
    titleEn: 'Feynman Technique Multi-Level Conceptual Explainer',
    descriptionAr: 'تفكيك فكرة علمية أو رياضية معقدة عبر التشبيهات اليومية البسيطة دون الإخلال بالدقة.',
    descriptionEn: 'Deconstruct complex quantum or algorithmic ideas using everyday tangible analogies.',
    conceptAr: 'اشرح مبدأ الحوسبة الكمية (Quantum Computing) ومفهوم التراكب الكمي (Superposition) بأسلوب ريتشارد فاينمان: أولاً لطفل في سن العاشرة بتشبيه كرة تدور، ثم لمهندس برمجيات يريد فهم الاختلاف عن البتات الثنائية.',
    conceptEn: 'Explain Quantum Superposition using the Feynman technique at two distinct levels: first to a 10-year-old child using intuitive everyday analogies, then to a software developer comparing qubits with logic gates.',
    category: 'education',
    recommendedModel: 'gemini',
    recommendedTone: 'تعليمي ومبسط',
    tags: ['Feynman', 'Education', 'Physics', 'Simplicity']
  },
  {
    id: 'edu-curriculum-plan',
    titleAr: 'منهج تعليمي تفاعلي مكثف لمدة 30 يوماً',
    titleEn: '30-Day Project-Based Intensive Learning Curriculum',
    descriptionAr: 'تصميم خارطة طريق تعليمية تعتمد على المشاريع التطبيقية اليومية مع معايير قياس الفهم.',
    descriptionEn: 'Project-first progressive syllabus with daily milestones, hands-on drills, and rubric assessments.',
    conceptAr: 'صمم منهجاً تعليمياً تطبيقياً لتعلم علم البيانات بلغة بايثون خلال 30 يوماً لغير المتخصصين. قسم كل أسبوع إلى موضوع محدد مع مشروع عملي نهاية الأسبوع وتمارين يومية لا تتجاوز 45 دقيقة.',
    conceptEn: 'Construct an intensive 30-day curriculum for learning Data Science with Python for beginners. Organize weekly project milestones, 45-minute daily practice sessions, and portfolio-ready capstones.',
    category: 'education',
    recommendedModel: 'gemini',
    recommendedTone: 'تعليمي ومبسط',
    tags: ['Curriculum', 'Data Science', 'Syllabus', 'Self-Learning']
  },

  // 5. Productivity & Strategy
  {
    id: 'prod-negotiation-coach',
    titleAr: 'محاكي تفاوض افتراضي على زيادة راتب أو عقد تجاري',
    titleEn: 'Executive Negotiation Simulator & Strategy Playbook',
    descriptionAr: 'تدريب تفاعلي يتقمص فيه الذكاء دور مفاوض شرس لمساعدتك على صقل حججك ودحض الاعتراضات.',
    descriptionEn: 'Interactive roleplay where the AI acts as a skeptical executive counter-negotiating your terms.',
    conceptAr: 'تقمص دور مدير تنفيذي صارم يرفض زيادة ميزانية المشروع. أريدك أن تطرح علي اعتراضات صعبة واقعية، وتختبر ردودي بعد كل إجابة، ثم تمنحني تقييماً صريحاً لنقاط القوة والضعف في طريقة تفاوضي.',
    conceptEn: 'Act as a hardened corporate VP reviewing a vendor contract renewal. Counter my proposals with realistic budget constraints, evaluate my responses turn-by-turn, and critique my negotiation tactics objectively.',
    category: 'productivity',
    recommendedModel: 'claude',
    recommendedTone: 'مهني واحترافي',
    tags: ['Negotiation', 'Roleplay', 'Business', 'Executive']
  },
  {
    id: 'prod-decision-matrix',
    titleAr: 'مصفوفة اتخاذ القرارات المصيرية والخيارات الصعبة',
    titleEn: 'Weighted Multi-Criteria Decision Framework',
    descriptionAr: 'هيكلة خيارات معقدة عبر مصفوفة تقييم موضوعية تزن المخاطر والمكاسب وتكلفة الفرصة البديلة.',
    descriptionEn: 'Structured evaluation comparing conflicting strategic avenues using weighted trade-off matrices.',
    conceptAr: 'ساعدني في اتخاذ قرار حاسم بين: البقاء في وظيفة مستقرة براتب مرتفع أو التفرغ لبدء مشروعي التقني الناشئ. أنشئ مصفوفة تفصيلية بالمعايير الموزونة، وتكلفة الفرصة البديلة، وسيناريوهات أسوأ وأفضل الاحتمالات.',
    conceptEn: 'Help me analyze a career crossroads: remaining in a high-earning corporate role vs. bootstrapping my tech startup. Build a weighted decision matrix assessing runway risk, regret minimization, and growth velocity.',
    category: 'productivity',
    recommendedModel: 'gemini',
    recommendedTone: 'مهني واحترافي',
    tags: ['Decision Making', 'Matrix', 'Productivity', 'Strategy']
  },

  // 6. Visual & Midjourney
  {
    id: 'visual-golden-souq',
    titleAr: 'مشهد سينمائي واقعي لسوق عربي تاريخي وقت الغروب',
    titleEn: 'Hyper-Realistic Cinematic Arabian Heritage Souq at Sunset',
    descriptionAr: 'تكوين بصري وثائقي فائق الدقة بأسلوب كاميرات 35mm وتدرجات الضوء الذهبي الدافئ.',
    descriptionEn: 'Documentary portrait bathed in warm golden-hour dusk light with authentic architectural textures.',
    conceptAr: 'صورة وثائقية سينمائية لتاجر بهارات كهل في سوق عربي عتيق وقت الساعة الذهبية. ضوء الشمس ينفذ من خلال فتحات السقف الخشبي مكوناً خطوط ضوء وذرات غبار متطايرة، ملتقطة بعدسة 35mm f/1.4، تفاصيل أقمشة غنية، نسيج فيلم تناظري.',
    conceptEn: 'An authentic cinematic documentary portrait of an elderly spice merchant in an ancient Arabian souq during golden hour. Beams of sun pierce through wooden rafters with floating dust motes, shot on 35mm f/1.4 film.',
    category: 'visual',
    recommendedModel: 'midjourney',
    recommendedTone: 'إبداعي وحر',
    tags: ['Cinematic', 'Midjourney', 'Heritage', 'Golden Hour']
  },
  {
    id: 'visual-cyber-oasis',
    titleAr: 'واحة مستقبلية في عام 2090 (Cyberpunk Oasis Architecture)',
    titleEn: 'Futuristic Eco-Cyberpunk Oasis City (Year 2090)',
    descriptionAr: 'دمج معماري بين الطبيعة الصحراوية والهندسة المستدامة فائقة التقنية وأضواء النيون البنفسجية.',
    descriptionEn: 'Symbiotic blend of brutalist desert earthen architecture with vertical hydroponics and holographic neon.',
    conceptAr: 'مدينة واحة مستقبلية فائقة التقنية في صحراء شاسعة ليلاً. ناطحات سحاب عضوية مصنوعة من طمي مبلور، شلالات مياه ضوئية، ومزارع مائية عمودية تتوهج بألوان السيان والزمرد، زاوية كاميرا واسعة من درون سينمائي بدقة 8k.',
    conceptEn: 'A breathtaking futuristic eco-oasis metropolis in a desert canyon at night. Organic crystallized adobe spires, luminous cyan vertical hydroponic gardens, ultra wide aerial drone view, hyper-detailed 8k render.',
    category: 'visual',
    recommendedModel: 'midjourney',
    recommendedTone: 'إبداعي وحر',
    tags: ['Sci-Fi', 'Cyberpunk', 'Architecture', 'Concept Art']
  },
  {
    id: 'visual-art-director-greenhouse',
    titleAr: 'المخرج الفني البصري: دفيئة مستقبلية في جليد القطب الشمالي (3 مفاهيم)',
    titleEn: 'Visual Art Director: Sub-Zero Arctic Biosphere (3 Concepts Matrix)',
    descriptionAr: 'توليد مفاهيم بصرية سينمائية متقدمة مع مواصفات العدسات وفيزياء الإضاءة وتدرجات الألوان لـ Midjourney و FLUX.',
    descriptionEn: 'Synthesize 3 differentiated visual concepts with technical optics, lighting rigs, palettes, and production prompts for FLUX.1 & Midjourney v6.1.',
    conceptAr: 'المخرج الفني البصري: دفيئة ومحمية نباتية مستقبلية وسط صقيع القطب الشمالي. قبة جيوديسية بألواح زجاجية بلورية مثلجة، بداخلها نباتات استوائية خصبة تشع دفئاً حرارياً برتقالياً في مواجهة عاصفة جليدية باللون السيان بالخارج، ملتقطة بكاميرا Hasselblad H6D-100c وعدسة 35mm f/2.8، إضاءة حجمية وبخار ماء كثيف.',
    conceptEn: 'A high-aesthetic visual art direction concept for a futuristic geothermal biosphere in an arctic wasteland. Geodesic crystalline dome encasing lush subtropical flora glowing with warm amber luminescence against sub-zero cobalt permafrost and drifting snow flurries. Captured on Hasselblad H6D-100c, 35mm f/2.8, volumetric god-rays through frosted glass, teal and amber palette --ar 16:9 --style raw --v 6.1',
    category: 'visual',
    recommendedModel: 'midjourney',
    recommendedTone: 'إبداعي وحر',
    tags: ['Art Director', 'Midjourney v6.1', 'FLUX.1', 'Cinematic Realism', 'Architecture']
  }
];

const CATEGORIES: { id: 'all' | PromptIdea['category']; labelAr: string; labelEn: string }[] = [
  { id: 'all', labelAr: 'جميع المجالات', labelEn: 'All Domains' },
  { id: 'tech', labelAr: 'البرمجة والتقنية', labelEn: 'Tech & Code' },
  { id: 'marketing', labelAr: 'التسويق والمبيعات', labelEn: 'Marketing' },
  { id: 'content', labelAr: 'المحتوى والسرد', labelEn: 'Content & Stories' },
  { id: 'education', labelAr: 'التعليم والتبسيط', labelEn: 'Education' },
  { id: 'productivity', labelAr: 'الإنتاجية والاستشارات', labelEn: 'Productivity' },
  { id: 'visual', labelAr: 'الفنون البصرية والميدجورني', labelEn: 'Visual Arts' },
];

export default function PromptIdeaGenerator({ lang, onSelectIdea, compact = false }: PromptIdeaGeneratorProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | PromptIdea['category']>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('arabprompt_idea_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // AI Generation on demand state
  const [aiTopic, setAiTopic] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [customAiIdeas, setCustomAiIdeas] = useState<PromptIdea[]>([]);

  // Filter ideas
  const filteredIdeas = useMemo(() => {
    const list = [...customAiIdeas, ...CURATED_IDEAS];
    return list.filter((item) => {
      const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
      if (!matchesCat) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.titleAr.toLowerCase().includes(q) ||
        item.titleEn.toLowerCase().includes(q) ||
        item.descriptionAr.toLowerCase().includes(q) ||
        item.descriptionEn.toLowerCase().includes(q) ||
        item.conceptAr.toLowerCase().includes(q) ||
        item.conceptEn.toLowerCase().includes(q) ||
        item.tags.some(t => t.toLowerCase().includes(q))
      );
    });
  }, [selectedCategory, searchQuery, customAiIdeas]);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id];
      try {
        localStorage.setItem('arabprompt_idea_favorites', JSON.stringify(next));
      } catch (err) {
        console.warn('Failed to save idea favorite', err);
      }
      return next;
    });
  };

  const handleCopy = (idea: PromptIdea, e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = lang === 'ar' ? idea.conceptAr : idea.conceptEn;
    navigator.clipboard.writeText(appendSiteUrlToPrompt(textToCopy));
    setCopiedId(idea.id);
    showToast(lang === 'ar' ? 'تم نسخ مسودة الفكرة مع رابط المنصة!' : 'Idea concept copied with ArabPrompt link!', false);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleApply = (idea: PromptIdea) => {
    const conceptText = lang === 'ar' ? idea.conceptAr : idea.conceptEn;
    onSelectIdea({
      concept: conceptText,
      model: idea.recommendedModel,
      tone: idea.recommendedTone,
      category: idea.category
    });
    showToast(
      lang === 'ar' 
        ? `تم تطبيق فكرة "${idea.titleAr}" وضبط الإعدادات تلقائياً!` 
        : `Applied idea "${idea.titleEn}" and adjusted settings!`,
      false
    );
  };

  const handleRandomSurprise = () => {
    const all = [...customAiIdeas, ...CURATED_IDEAS];
    const randomIndex = Math.floor(Math.random() * all.length);
    const chosen = all[randomIndex];
    handleApply(chosen);
  };

  // Generate dynamic custom ideas with Gemini server route
  const handleGenerateAiIdeas = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTopic.trim()) return;

    setIsGeneratingAi(true);
    try {
      const promptText = `
أنت خبير في هندسة الأوامر الذكية (Prompt Engineer). اقترح لي فكرتين فريدتين وغير تقليديتين لأمر ذكاء اصطناعي حول الموضوع التالي:
"${aiTopic}"

المطلوب إخراج النتيجة بتنسيق JSON صارم وبدون كتل كود نصية، كمصفوفة تحتوي على كائنين بالشكل التالي:
[
  {
    "titleAr": "عنوان موجز ومبهر للفكرة بالعربية",
    "titleEn": "Catchy title in English",
    "descriptionAr": "شرح الهدف في سطر واحد بالعربية",
    "descriptionEn": "Brief one line explanation in English",
    "conceptAr": "نص المسودة الأولية التي يكتبها المستخدم في حقل الأمر بالعربية مع سياق وتفاصيل قوية",
    "conceptEn": "Raw detailed prompt starter in English",
    "category": "tech" أو "marketing" أو "content" أو "education" أو "productivity" أو "visual",
    "recommendedModel": "gemini" أو "claude" أو "chatgpt" أو "midjourney",
    "recommendedTone": "مهني واحترافي" أو "إبداعي وحر" أو "صارم ومباشر" أو "تعليمي ومبسط" أو "تسويقي مبيعاتي",
    "tags": ["وسم1", "Tag2"]
  }
]
`;

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          model: 'gemini',
          temperature: 0.8
        })
      });

      if (!response.ok) throw new Error('API failed');

      const data = await response.json();
      const rawOutput = data.result || '';

      // Clean JSON markers if present
      const cleaned = rawOutput.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').trim();
      const parsed = JSON.parse(cleaned);

      if (Array.isArray(parsed) && parsed.length > 0) {
        const mapped: PromptIdea[] = parsed.map((item, idx) => ({
          id: `ai-custom-${Date.now()}-${idx}`,
          titleAr: item.titleAr || aiTopic,
          titleEn: item.titleEn || aiTopic,
          descriptionAr: item.descriptionAr || '',
          descriptionEn: item.descriptionEn || '',
          conceptAr: item.conceptAr || aiTopic,
          conceptEn: item.conceptEn || aiTopic,
          category: item.category || 'content',
          recommendedModel: item.recommendedModel || 'gemini',
          recommendedTone: item.recommendedTone || 'مهني واحترافي',
          tags: item.tags || [aiTopic]
        }));

        setCustomAiIdeas(prev => [...mapped, ...prev]);
        setAiTopic('');
        showToast(
          lang === 'ar' ? 'تم توليد أفكار حصرية بنجاح بواسطة الذكاء الاصطناعي!' : 'Generated fresh custom AI ideas!',
          false
        );
      }
    } catch (err) {
      console.warn('AI idea generation error', err);
      showToast(
        lang === 'ar' ? 'تعذر توليد الفكرة تلقائياً، يمكنك اختيار إحدى الأفكار الجاهزة أدناه.' : 'Could not generate live AI idea, please pick from curated ideas below.',
        true
      );
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <div className="bg-[#fcfbf7] border border-[#c29b40]/25 rounded-2xl overflow-hidden shadow-sm transition-all duration-300">
      
      {/* Header bar with toggle */}
      <div 
        className="px-5 py-4 bg-gradient-to-r from-[#916a24]/10 via-[#c29b40]/15 to-[#ecd197]/20 border-b border-[#c29b40]/20 flex flex-wrap items-center justify-between gap-3 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#c29b40] text-stone-950 flex items-center justify-center font-bold shadow-sm">
            <Lightbulb className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-stone-900 tracking-tight">
                {lang === 'ar' ? 'مُولد ومُلهم الأفكار (Prompt Idea Generator)' : 'Prompt Idea Generator'}
              </h3>
              <span className="text-[10px] font-bold text-[#916a24] bg-[#c29b40]/20 px-2 py-0.5 rounded-full">
                {lang === 'ar' ? 'لتجاوز حاجز الكتابة' : 'Beat Writer\'s Block'}
              </span>
            </div>
            <p className="text-xs text-stone-600 mt-0.5">
              {lang === 'ar'
                ? 'استكشف مواضيع احترافية جاهزة أو اطلب أفكاراً جديدة بنقرة واحدة لتحفيز صياغة الأوامر'
                : 'Browse curated prompt starters or generate custom angles with one click'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleRandomSurprise();
            }}
            className="px-3 py-1.5 rounded-lg bg-white border border-[#c29b40]/40 text-[#916a24] hover:bg-[#c29b40]/15 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
            title={lang === 'ar' ? 'اختر فكرة مباغتة وضعها في المحرر' : 'Surprise me with a random idea'}
          >
            <Dices className="w-3.5 h-3.5 text-[#c29b40]" />
            <span>{lang === 'ar' ? 'نرد الإلهام (فكرة عشوائية)' : 'Surprise Me'}</span>
          </button>

          <button
            type="button"
            className="p-1.5 text-stone-500 hover:text-stone-900 transition-colors"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Expandable Body */}
      {isExpanded && (
        <div className="p-5 space-y-5 animate-in fade-in duration-200">
          
          {/* Controls: AI Generator & Search Filter */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            
            {/* Live AI Idea Generator Input */}
            <form onSubmit={handleGenerateAiIdeas} className="lg:col-span-7 flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder={
                    lang === 'ar'
                      ? 'أدخل موضوعاً لتوليد أفكار ذكية (مثال: التجارة الإلكترونية، الأمن السيبراني...)'
                      : 'Type a topic for live AI angles (e.g., E-commerce, Cybersecurity)...'
                  }
                  className="w-full text-xs rounded-xl border border-stone-300 pl-3 pr-9 py-2.5 bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#c29b40]"
                />
                <Wand2 className="w-4 h-4 text-stone-400 absolute right-3 top-3 rtl:right-auto rtl:left-3" />
              </div>
              <button
                type="submit"
                disabled={isGeneratingAi || !aiTopic.trim()}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-1.5 whitespace-nowrap shadow-xs ${
                  isGeneratingAi || !aiTopic.trim()
                    ? 'bg-stone-300 cursor-not-allowed'
                    : 'bg-[#c29b40] hover:bg-[#a6802f]'
                }`}
              >
                {isGeneratingAi ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                )}
                <span>{lang === 'ar' ? 'توليد أفكار AI' : 'Generate AI Angles'}</span>
              </button>
            </form>

            {/* Keyword Search Filter */}
            <div className="lg:col-span-5 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'ar' ? 'تصفية الأفكار والوسوم...' : 'Filter topics or tags...'}
                className="w-full text-xs rounded-xl border border-stone-300 pl-3 pr-9 py-2.5 bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#c29b40]"
              />
              <Search className="w-4 h-4 text-stone-400 absolute right-3 top-3 rtl:right-auto rtl:left-3" />
            </div>

          </div>

          {/* Category Tabs (Segmented Buttons) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? 'bg-[#c29b40] text-white shadow-xs'
                      : 'bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  {lang === 'ar' ? cat.labelAr : cat.labelEn}
                </button>
              );
            })}
          </div>

          {/* Cards Grid */}
          {filteredIdeas.length === 0 ? (
            <div className="text-center py-8 text-stone-500 text-xs bg-white rounded-xl border border-dashed border-stone-300 p-6">
              <Lightbulb className="w-6 h-6 mx-auto mb-2 text-stone-400 opacity-60" />
              <span>{lang === 'ar' ? 'لم يتم العثور على أفكار تطابق بحثك. جرّب كتابة موضوع آخر في حقل التوليد الذكي أعلاه.' : 'No ideas matched your filter. Try entering a custom topic in the AI field above.'}</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
              {filteredIdeas.map((idea) => {
                const isFav = favorites.includes(idea.id);
                const title = lang === 'ar' ? idea.titleAr : idea.titleEn;
                const desc = lang === 'ar' ? idea.descriptionAr : idea.descriptionEn;
                const conceptPreview = lang === 'ar' ? idea.conceptAr : idea.conceptEn;

                return (
                  <div
                    key={idea.id}
                    className="p-4 rounded-xl border border-stone-200/90 bg-white hover:border-[#c29b40]/60 hover:shadow-sm transition-all duration-200 flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h4 className="text-xs font-black text-stone-900 leading-snug group-hover:text-[#916a24] transition-colors">
                          {title}
                        </h4>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => toggleFavorite(idea.id, e)}
                            className={`p-1 rounded transition-colors ${
                              isFav ? 'text-red-500 hover:text-red-600' : 'text-stone-300 hover:text-stone-500'
                            }`}
                            title={isFav ? 'Remove favorite' : 'Add to favorites'}
                          >
                            <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleCopy(idea, e)}
                            className="p-1 rounded text-stone-400 hover:text-stone-700 transition-colors"
                            title={lang === 'ar' ? 'نسخ نص الفكرة' : 'Copy concept text'}
                          >
                            {copiedId === idea.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-[11px] text-stone-500 leading-relaxed mb-2.5">
                        {desc}
                      </p>

                      {/* Prompt Concept Snippet */}
                      <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200/70 text-[11px] text-stone-700 font-mono line-clamp-2 leading-relaxed mb-3 rtl:text-right">
                        "{conceptPreview}"
                      </div>
                    </div>

                    {/* Metadata & Apply Button */}
                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2 flex-wrap text-[10px] text-stone-500">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-stone-600">
                          {idea.recommendedModel.toUpperCase()}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{idea.recommendedTone}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleApply(idea)}
                        className="px-3 py-1.5 rounded-lg bg-[#c29b40]/10 hover:bg-[#c29b40] text-[#916a24] hover:text-white font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <span>{lang === 'ar' ? 'تطبيق الفكرة' : 'Apply to Editor'}</span>
                        {lang === 'ar' ? <ArrowLeft className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
