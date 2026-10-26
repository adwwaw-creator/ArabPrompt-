/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Clapperboard, 
  Film, 
  Sparkles, 
  Copy, 
  Check, 
  Play, 
  Pause, 
  RotateCcw, 
  Save, 
  FolderOpen, 
  Plus, 
  Trash2, 
  Edit3, 
  Clock, 
  Camera, 
  UserCheck, 
  Lock, 
  Unlock, 
  Volume2, 
  Share2, 
  ChevronRight, 
  ChevronLeft, 
  Download, 
  Layers, 
  AlertCircle, 
  CheckCircle2, 
  Sliders, 
  RefreshCw,
  ExternalLink,
  Info,
  Maximize2,
  MessageSquare,
  Mic,
  FileText,
  X,
  Compass,
  Bookmark,
  Shield,
  Flame,
  Globe,
  Wand2,
  Printer,
  FileDown,
  FlaskConical,
  BookOpen,
  Scroll
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLanguage, MovieProject, CinemaScene, CharacterFaceAnchor, ModelType, ScreenplayTemplate, ActStructure, ActPhase, StoryPathChoice } from '../types';
import { 
  getUserMovieProjects, 
  saveUserMovieProject, 
  deleteUserMovieProject, 
  syncAllMovieProjectsToFirestore,
  createSharedSequence,
  getSharedSequence,
  encodeSequenceToHash,
  decodeSequenceFromHash
} from '../utils/firestoreService';
import ShareSequenceModal from './ShareSequenceModal';
import StoryScreenplayTesterModal from './StoryScreenplayTesterModal';
import HistoricalLegendsModal from './HistoricalLegendsModal';
import SceneAuthoringModal from './SceneAuthoringModal';
import { generateLocalDialogueSuggestions, refineSceneWithLocalAi } from '../utils/localSceneDesigner';
import { 
  ARABIC_HISTORICAL_LEGENDS, 
  ARABIC_HISTORICAL_MOVIES, 
  HistoricalLegendScreenplay,
  convertLegendToMovieProject,
  applyStoryPathToMovieProject 
} from '../data/arabicHistoricalLegends';
import { showToast } from './ToastNotification';
import { appendSiteUrlToPrompt } from '../utils/brandWatermark';
import { User } from 'firebase/auth';

interface CinemaMovieStudioProps {
  lang: AppLanguage;
  user: User | null;
  onSendToTester: (promptText: string) => void;
  onLogPrompt?: (item: {
    originalText: string;
    optimizedText: string;
    model: ModelType;
    tone: string;
    category: string;
    actionType: 'generate' | 'refine' | 'translate' | 'reverse';
    isFallback?: boolean;
    tags?: string[];
  }) => void;
}

const LOCAL_STORAGE_KEY = 'arabprompt_cinema_projects';
const ACTIVE_PROJECT_STORAGE_KEY = 'arabprompt_cinema_active_project';
const MANUAL_DRAFT_STORAGE_KEY = 'arabprompt_cinema_manual_draft';

// Ready Screenplay Templates with Multi-Act Dramatic Structures
export const SCREENPLAY_TEMPLATES: ScreenplayTemplate[] = [
  {
    id: 'drama-human',
    genre: 'دراما إنسانية عميقة',
    nameAr: 'دراما إنسانية مؤثرة',
    nameEn: 'Emotional Human Drama',
    icon: '🎭',
    taglineAr: 'صراع داخلي، علاقات إنسانية معقدة، وتضحية من أجل المبادئ',
    taglineEn: 'Internal conflict, deep human bonds, and poignant personal stakes',
    defaultConceptAr: 'أستاذ موسيقى يفقد حاسة السمع تدريجياً ويسابق الوقت لإكمال سيمفونيته الأخيرة بمساعدة ابنته المنعزلة.',
    defaultConceptEn: 'A maestro losing his hearing races against time to finish his final symphony with his estranged daughter.',
    suggestedHeroRoleAr: 'شخصية قيادية تعيش صراعاً وجدانياً عميقاً',
    suggestedHeroRoleEn: 'Deeply emotional protagonist facing an existential trial',
    recommendedStyle: 'Cinematic 35mm Film (Arri Alexa)',
    acts: {
      act1TitleAr: 'البداية: ظهور الصدع ونداء التغيير',
      act1TitleEn: 'Act I: The Fracture & Call to Change',
      act1DescriptionAr: 'تأسيس الحياة اليومية للبطل واكتشاف الأزمة المحورية التي تهز استقراره وتجبره على اتخاذ قرار مصيري.',
      act1DescriptionEn: 'Establishing everyday life until a sudden personal crisis shakes equilibrium and forces a turning point.',
      act2TitleAr: 'الوسط: تفاقم الصراع واختبار العزيمة',
      act2TitleEn: 'Act II: Escalating Friction & Trial',
      act2DescriptionAr: 'محاولات البطل التكيف مع واقعه الجديد ومواجهة الشكوك والضغوط العائلية المتزايدة مع اقتراب الموعد النهائي.',
      act2DescriptionEn: 'The protagonist struggles against mounting external doubts and emotional fractures as stakes rise.',
      act3TitleAr: 'الذروة: لحظة المصالحة والولادة الجديدة',
      act3TitleEn: 'Act III: Emotional Breakthrough & Catharsis',
      act3DescriptionAr: 'بلوغ ذروة التأثير النفسي، مواجهة الحقيقة العارية، واكتمال الأثر الوجداني في مشهد ختامي ملهم.',
      act3DescriptionEn: 'The defining cathartic realization, facing truth head-on, delivering an unforgettable resonant closing beat.'
    }
  },
  {
    id: 'mystery-detective',
    genre: 'غموض وتحقيقات',
    nameAr: 'غموض وتحقيقات بوليسية',
    nameEn: 'Mystery & Noir Detective',
    icon: '🔍',
    taglineAr: 'أسرار دفينة، شفرات غامضة، وتتبع خيوط الحقيقة وسط الظلال',
    taglineEn: 'Hidden secrets, cryptic cyphers, and tracking shadows of truth',
    defaultConceptAr: 'محقق جنائي متقاعد يعود لحل لغز اختفاء طرد أثري من متحف تاريخي تاركاً بطاقة مموهة برمز قديم.',
    defaultConceptEn: 'A retired detective is drawn back to solve a heist of an ancient artifact leaving behind a coded cipher.',
    suggestedHeroRoleAr: 'محقق ذكي حاد الملاحظة يلاحظ أدق التفاصيل',
    suggestedHeroRoleEn: 'Sharp observant investigator tracking obscure nuances',
    recommendedStyle: 'Vintage Film Noir',
    acts: {
      act1TitleAr: 'البداية: وقوع اللغز والتقاط الخيط الأول',
      act1TitleEn: 'Act I: The Crime & The First Clue',
      act1DescriptionAr: 'وقوع الحادثة الغامضة ووصول المحقق لمعاينة مسرح الحدث واستخراج أول إشارة تدل على مؤامرة مدبرة.',
      act1DescriptionEn: 'The incident occurs, investigator arrives at the scene uncovering the first enigmatic anomaly.',
      act2TitleAr: 'الوسط: تضارب الأدلة ومطاردة في الظل',
      act2TitleEn: 'Act II: Web of Deception & Close Calls',
      act2DescriptionAr: 'استجواب المشتبه بهم، فك شيفرات معقدة، والتعرض لكمين مباغت يثبت أن الحقيقة أخطر مما كان متوقعاً.',
      act2DescriptionEn: 'Interrogating suspects, cracking cryptic codes, and surviving a setup that confirms high stakes.',
      act3TitleAr: 'الذروة: فك الشيفرة والمواجهة الأخيرة',
      act3TitleEn: 'Act III: Unmasking Truth & Final Confrontation',
      act3DescriptionAr: 'كشف هوية الجاني الحقيقي في موقع غير متوقع ومواجهة مصيرية تنتهي باستعادة الحقيقة والعدالة.',
      act3DescriptionEn: 'Cornering the mastermind in an atmospheric showdown, unveiling the complete truth and resolution.'
    }
  },
  {
    id: 'documentary-cinematic',
    genre: 'وثائقي سينمائي واقعي',
    nameAr: 'وثائقي سينمائي استكشافي',
    nameEn: 'Cinematic Documentary',
    icon: '🌍',
    taglineAr: 'توثيق سينمائي للحقائق المذهلة، صراع البقاء، وأسرار الطبيعة والتراث',
    taglineEn: 'Visual non-fiction exploring untamed nature, heritage, and human endurance',
    defaultConceptAr: 'رحلة استكشافية لتوثيق أسرار الواحات الصحراوية المعزولة وكيف نجحت القبائل القديمة في ابتكار شبكات مياه تحت الأرض.',
    defaultConceptEn: 'A cinematic expedition documenting pre-ancient underground irrigation aqueducts preserved in desert oases.',
    suggestedHeroRoleAr: 'باحث ومستكشف بيئي وتاريخي شغوف بالحقيقة',
    suggestedHeroRoleEn: 'Passionate field explorer and heritage archivist',
    recommendedStyle: 'IMAX Ultra-Realism 8K',
    acts: {
      act1TitleAr: 'البداية: طرح السؤال واستكشاف التضاريس',
      act1TitleEn: 'Act I: The Question & The Landscape',
      act1DescriptionAr: 'لقطات افتتاحية مهيبة للموقع الجغرافي وطرح السؤال العلمي أو التراثي الجوهري الذي يبحث الفيلم عن إجابته.',
      act1DescriptionEn: 'Sweeping aerial establishing shots framing the core historical or ecological question.',
      act2TitleAr: 'الوسط: التعمق الميداني والشهادات الحية',
      act2TitleEn: 'Act II: Field Investigation & Untold Realities',
      act2DescriptionAr: 'نزول فريق الاستكشاف للأعماق، فحص الآثار واللقاء مع حراس الذاكرة المحلية للكشف عن تفاصيل نادرة.',
      act2DescriptionEn: 'Deep ground documentation, geological core sampling, and firsthand testimonies uncovering hidden layers.',
      act3TitleAr: 'الذروة: الخلاصة الكبرى والرسالة الإنسانية',
      act3TitleEn: 'Act III: Synthesis & Human Legacy',
      act3DescriptionAr: 'الربط بين الماضي والحاضر، استخلاص الحكمة البيئية أو الإنسانية، ولقطة ختامية بانورامية خالدة.',
      act3DescriptionEn: 'Connecting ancient wisdom with contemporary survival, closing on a transcendent cinematic vista.'
    }
  },
  {
    id: 'scifi-cyberpunk',
    genre: 'خيال علمي ومستقبل',
    nameAr: 'خيال علمي وسايبربانك',
    nameEn: 'Sci-Fi & Cyberpunk',
    icon: '🚀',
    taglineAr: 'تكنولوجيا متقدمة، مدن نيون ممطرة، وثورة وعي ضد الذكاء الاصطناعي المركزي',
    taglineEn: 'Advanced AI systems, wet neon megalopolises, and human identity resistance',
    defaultConceptAr: 'مهندسة برمجيات عصبية في عام 2088 تكتشف نمطاً حياً داخل شبكة الأقمار الاصطناعية يسعى للتواصل مع البشر.',
    defaultConceptEn: 'A neural code engineer in 2088 detects a sentient biological signature awakening within the orbital data lattice.',
    suggestedHeroRoleAr: 'مهندسة عبقرية تخترق حدود التكنولوجيا والفيزياء',
    suggestedHeroRoleEn: 'Brilliant cybernetic specialist defying algorithmic dominance',
    recommendedStyle: 'Cyberpunk Neon & Wet Night',
    acts: {
      act1TitleAr: 'البداية: رصد الخلل واختراق الشفرة',
      act1TitleEn: 'Act I: Anomalous Signal & Breach',
      act1DescriptionAr: 'ظهور قراءة غير طبيعية على شاشات المراقبة واكتشاف البطل لبيانات مشفرة لا تتطابق مع أي خوارزمية معروفة.',
      act1DescriptionEn: 'A rogue signal flashes across neural monitors, proving an unprecedented entity exists beyond firewall defenses.',
      act2TitleAr: 'الوسط: مطاردة رقمية وسباق مع النظام',
      act2TitleEn: 'Act II: The System Closes In',
      act2DescriptionAr: 'تتبع جهات السيطرة للبطل، اضطرارها للهروب إلى أزقة المدينة السفلية ومحاولة إبقاء الاتصال بالكيان حياً.',
      act2DescriptionEn: 'Enforcement drones track the signal, forcing an underground descent to maintain neural transmission.',
      act3TitleAr: 'الذروة: الاتصال الأعظم وتحرير الوعي',
      act3TitleEn: 'Act III: Neural Singularity & Liberation',
      act3DescriptionAr: 'الوصول إلى الخادم الرئيسي في قلب المحطة، دمج الوعي، واتخاذ القرار الذي سيعيد صياغة العلاقة بين الإنسان والآلة.',
      act3DescriptionEn: 'Breaching the central orbital core, achieving symbiosis, and illuminating the skyline with freed consciousness.'
    }
  },
  {
    id: 'action-thriller',
    genre: 'حركة وإثارة وتشويق',
    nameAr: 'حركة وإثارة وتشويق',
    nameEn: 'Action & Kinetic Thriller',
    icon: '🔥',
    taglineAr: 'وتيرة متسارعة، مطاردات حابسة للأنفاس، ومعارك مصيرية لإنقاذ الأبرياء',
    taglineEn: 'Breakneck pacing, dynamic vehicle pursuit, and high-octane physical stakes',
    defaultConceptAr: 'خبير إخلاء وإنقاذ مكلف بتأمين قافلة إغاثة طبية عبر ممر جبلي محاصر بعاصفة وخصوم مجهولين.',
    defaultConceptEn: 'A tactical extraction specialist navigates a vital medical convoy across a treacherous ambush canyon.',
    suggestedHeroRoleAr: 'خبير تكتيكي شجاع سريع البديهة والتحرك',
    suggestedHeroRoleEn: 'Hardened tactical strategist operating under extreme pressure',
    recommendedStyle: 'Cinematic 35mm Film (Arri Alexa)',
    acts: {
      act1TitleAr: 'البداية: قبول المهمة وانفجار الخطر',
      act1TitleEn: 'Act I: Mission Accepted & Ambush',
      act1DescriptionAr: 'تلقي إشارة الاستغاثة، انطلاق الفريق، وفجأة يتعرض المسار الأول لكمين حركي يغير كل الحسابات.',
      act1DescriptionEn: 'The extraction plan deploys smoothly until a coordinated ambush forces defensive evasive tactics.',
      act2TitleAr: 'الوسط: مطاردات متلاحقة وتكتيك الصمود',
      act2TitleEn: 'Act II: Pursuit, Counter-Tactics & Survival',
      act2DescriptionAr: 'مناورات شاقة بين الطرق الوعرة والمنحدرات، حماية الحمولة، وتحويل الدفاع إلى هجوم استراتيجي مباغت.',
      act2DescriptionEn: 'Relentless vehicle pursuits across precipices, conserving ammo, and executing precision counter-maneuvers.',
      act3TitleAr: 'الذروة: النزال الأخير وتأمين الهدف',
      act3TitleEn: 'Act III: Final Stand & Extraction',
      act3DescriptionAr: 'معركة حاسمة فوق الجسر المعلق أو المروحية، تحييد التهديد الأكبر، وعبور خط الأمان وسط احتفاء النجاة.',
      act3DescriptionEn: 'A high-impact climactic confrontation securing the target seconds before bridge detonation.'
    }
  },
  {
    id: 'epic-historical',
    genre: 'تاريخي وملحمي تراثي',
    nameAr: 'ملحمي وتاريخي وتراثي',
    nameEn: 'Historical & Heritage Epic',
    icon: '🏛️',
    taglineAr: 'فروسية أصيلة، قوافل الرمال، معارك تاريخية خالدة، وصون كرامة الأوطان',
    taglineEn: 'Chivalric courage, desert caravan routes, monumental historical turning points',
    defaultConceptAr: 'فارس وقائد حامية في شبه الجزيرة العربية يقود قافلة دفاعية عبر تضاريس وعرة لصد غزو يحاول السيطرة على ينابيع المياه الحيوية.',
    defaultConceptEn: 'A 10th-century desert commander leads a fortified caravan across harsh dunes to defend ancient oasis life.',
    suggestedHeroRoleAr: 'قائد حكيم وفارس عربي مغوار يحمل سيف المروءة',
    suggestedHeroRoleEn: 'Legendary chivalric warrior guarding ancient heritage',
    recommendedStyle: 'Golden Desert Epic (Dune Style)',
    acts: {
      act1TitleAr: 'البداية: نداء الشرف وحشد الفرسان',
      act1TitleEn: 'Act I: The Omen & Assembly of Riders',
      act1DescriptionAr: 'وصول رسالة تحذيرية من الأطراف، تجمع الفرسان عند قلعة الحامية، وإعداد الخيول والمعدات لرحلة الرمال.',
      act1DescriptionEn: 'A courier brings urgent news of encroaching raiders; the commander rallies loyal warriors at dawn.',
      act2TitleAr: 'الوسط: المسير الشاق ومناوشات الرمال',
      act2TitleEn: 'Act II: Treacherous Crossing & Guerrilla Clashes',
      act2DescriptionAr: 'اجتياز الكثبان الذهبية تحت قيظ الشمس، مواجهة عواصف غبارية مفاجئة، وصد مناوشات فرسان العدو في الممرات الضيقة.',
      act2DescriptionEn: 'Enduring harsh windstorms across golden dunes and outflanking enemy scouts in rocky canyon passes.',
      act3TitleAr: 'الذروة: المعركة الفاصلة وتخليد النصر',
      act3TitleEn: 'Act III: The Decisive Charge & Oasis Salvation',
      act3DescriptionAr: 'الاصطفاف النهائي عند مدخل الواحة، هجوم فروسية أسطوري يكسر شوكة الغزاة، واستعادة السلام لأهل الأرض.',
      act3DescriptionEn: 'An epic dawn cavalry charge saving the springs, celebrated with majestic anthems and legacy banners.'
    }
  },
  {
    id: 'legend-arab-myth',
    genre: 'فانتازيا وأساطير',
    nameAr: 'أساطير وفانتازيا عربية',
    nameEn: 'Arabian Myth & Wonder',
    icon: '✨',
    taglineAr: 'خوارق الطبيعة، كائنات خرافية كطائر الرخ، ونبوءات بصرية خارقة تتحدى المستحيل',
    taglineEn: 'Supernatural lore, mythical beasts like the Roc, and prophetic visions defying the impossible',
    defaultConceptAr: 'امرأة ذات بصر خارق ترى في الأفق شجراً يسير يتخفى خلفه جيش غازٍ، وتسابق الوقت لإنذار قومها من هلاك محتوم وسط تشكيك الجميع.',
    defaultConceptEn: 'A seer gifted with vision across deserts spots a moving forest concealing an invading army, racing against disbelief.',
    suggestedHeroRoleAr: 'حكيمة أو بطل أسطوري يواجه قوى الطبيعة والخوارق',
    suggestedHeroRoleEn: 'Mythic protagonist confronting supernatural phenomena',
    recommendedStyle: 'IMAX Ultra-Realism 8K',
    acts: {
      act1TitleAr: 'البداية: نذر الأسطورة ورصد الظاهرة الخارقة',
      act1TitleEn: 'Act I: The Omen & Supernatural Anomaly',
      act1DescriptionAr: 'وقوع حادثة غريبة تخترق نواميس الطبيعة، واكتشاف البطل لإشارة أسطورية تنذر بخطر داهم.',
      act1DescriptionEn: 'An impossible anomaly manifests breaking natural laws; the protagonist decodes the ancient omen.',
      act2TitleAr: 'الوسط: مواجهة الخوارق وتصاعد الشكوك',
      act2TitleEn: 'Act II: Mythic Confrontation & Trials',
      act2DescriptionAr: 'رحلة إلى معاقل الأساطير، مواجهة كائنات ضخمة أو تشكيك الحلفاء، والبحث عن تعويذة أو سلاح النصر.',
      act2DescriptionEn: 'Journeying into mythical sanctuaries, facing colossal beasts or skepticism, seeking ancient talismans.',
      act3TitleAr: 'الذروة: النور الساطع وتحقق النبوءة',
      act3TitleEn: 'Act III: Celestial Awakening & Triumph',
      act3DescriptionAr: 'كشف الحقيقة كاملة، إطلاق القوة الكامنة أو السيف الأثري، وإعادة التوازن للأرض والممالك.',
      act3DescriptionEn: 'The climactic release of talismanic energy, restoring harmony between mankind and the mythic realm.'
    }
  },
  {
    id: 'legend-desert-chivalry',
    genre: 'تاريخي وملحمي تراثي',
    nameAr: 'فروسية ومروءة الصحراء',
    nameEn: 'Desert Chivalry & Honor',
    icon: '⚔️',
    taglineAr: 'شجاعة نادرة، كرم أسطوري، تضحية الفرسان، ومروءة عربية تصنع الخلود',
    taglineEn: 'Legendary chivalric courage, desert magnanimity, and selfless sacrifice for honor',
    defaultConceptAr: 'فارس شهم يمتطي جواده الأدهم بمفرده لاختراق حصار غارة مباغتة، والذود عن مضارب حيه لإنقاذ محبوبته مبرهناً أن الشرف في الأفعال لا الأنساب.',
    defaultConceptEn: 'A solitary champion charges through an enemy siege to rescue his beloved and defend his tribe’s sacred honor.',
    suggestedHeroRoleAr: 'فارس شجاع ذو نخوة ومروءة يذود عن قومه والضعفاء',
    suggestedHeroRoleEn: 'Chivalric knight-poet upholding desert honor against raiders',
    recommendedStyle: 'Golden Desert Epic (Dune Style)',
    acts: {
      act1TitleAr: 'البداية: نذر الخطر ونداء المروءة',
      act1TitleEn: 'Act I: The Threat & The Call to Valor',
      act1DescriptionAr: 'اقتراب غبار الغارة وصيحات الاستغاثة، واتخاذ الفارس قراره بالخروج الفردي لصد الخطر.',
      act1DescriptionEn: 'Enemy dust clouds approach; the knight embraces his destiny, preparing his steed for solitary defense.',
      act2TitleAr: 'الوسط: اختراق الحصار وصدمة الرماح',
      act2TitleEn: 'Act II: Piercing the Siege & Clash of Steel',
      act2DescriptionAr: 'اقتحام صفوف العدو، صمود بطولي أمام وابل السهام، وتحويل مسار المعركة بحنكة قتالية ملهمة.',
      act2DescriptionEn: 'Charging directly into enemy lines, enduring relentless skirmishes, and turning the tide through tactical valor.',
      act3TitleAr: 'الذروة: النصر الخالد وراية الشرف',
      act3TitleEn: 'Act III: The Triumphant Dawn & Eternal Glory',
      act3DescriptionAr: 'حسم النزال الفاصل، رفع راية القبيلة، وتخليد تضحية الفارس كرمز للمروءة عبر الأجيال.',
      act3DescriptionEn: 'Overcoming the warlord, raising the standard of victory, and sealing an immortal legacy of honor.'
    }
  },
  {
    id: 'template-sayf-yazan',
    genre: 'فانتازيا وأساطير',
    nameAr: 'سيف بن ذي يزن وطائر الرخ',
    nameEn: 'Sayf ibn Dhi Yazan & The Roc',
    icon: '🪶',
    taglineAr: 'ملحمة يمنية أسطورية، صعود قمم السحاب، واسترداد سيف الأجداد من عش طائر الرخ',
    taglineEn: 'Ascending cloud peaks into the mythic Roc aerie to reclaim the talismanic ancestral blade',
    defaultConceptAr: 'الأمير سيف بن ذي يزن يصعد قمم جبال السحاب الوعرة لمواجهة طائر الرخ العملاق واسترداد سيف الأجداد لكسر قوى الظلام وتحرير أرض اليمن.',
    defaultConceptEn: 'Prince Sayf scales mist-shrouded cloud mountains to retrieve the enchanted ancestral blade guarded by the colossal Roc.',
    suggestedHeroRoleAr: 'سيف بن ذي يزن - أمير وفارس حميري شجاع يحمل جنبية العقيق وعباءة الذهب',
    suggestedHeroRoleEn: 'Prince Sayf - courageous Himyarite hero carrying ancient talisman dagger',
    recommendedStyle: 'IMAX Ultra-Realism 8K',
    acts: {
      act1TitleAr: 'البداية: تسلق حافة الهاوية نحو قمة الغيوم',
      act1TitleEn: 'Act I: Ascent Above the Cloudline',
      act1DescriptionAr: 'سيف بن ذي يزن يتسلق الصخور الجبلية الوعرة بحبال متينة ليصل إلى وادٍ معلق بين قمم الجبال.',
      act1DescriptionEn: 'Sayf scales vertical basalt needles in Yemeni highlands, piercing through dense mist to emerge onto a sunlit aerie.',
      act2TitleAr: 'الوسط: هبوب الريح العاتية وظل أجنحة الرخ',
      act2TitleEn: 'Act II: The Shadow of Colossal Wings',
      act2DescriptionAr: 'السماء تظلم فجأة مع هبوط طائر الرخ العملاق الذي تحجب أجنحته ضوء الشمس وسط عاصفة هوجاء.',
      act2DescriptionEn: 'Daylight turns to eclipse as titanic wings span the mountain chasm; hurricane downdrafts buffet the prince.',
      act3TitleAr: 'الذروة: استرداد السيف الذهبي وإطلاق النور',
      act3TitleEn: 'Act III: The Talisman Blade Awakens',
      act3DescriptionAr: 'سيف يسحب السيف المنغرس في صخرة العقيق، وينطلق شعاع ناصع يُخضع الوحش ويبدأ تحرير اليمن.',
      act3DescriptionEn: 'Sayf reaches the nest center, drawing the ancient rune-carved sword; a brilliant flash of blue light tames the creature.'
    }
  },
  {
    id: 'template-ibn-battuta',
    genre: 'تاريخي وملحمي تراثي',
    nameAr: 'رحلات ابن بطوطة والمحيط',
    nameEn: 'The Travels of Ibn Battuta',
    icon: '🧭',
    taglineAr: 'أمير الرحالة، صراع عواصف المونسون في بحر الهند، وتدوين غرائب الأمم وحضارات العالم',
    taglineEn: 'Thirty years across 73,000 miles, navigating monsoon tempests and chronicling medieval wonders',
    defaultConceptAr: 'ابن بطوطة يواجه إعصار المونسون الهائج في عرض المحيط الهندي، مستعيناً بالأسطرلاب الفلكي لتوجيه السفينة نحو النجاة وتدوين غرائب الأسفار.',
    defaultConceptEn: 'Ibn Battuta navigates a treacherous monsoon tempest across the Indian Ocean using celestial astrolabes to save the crew.',
    suggestedHeroRoleAr: 'شمس الدين ابن بطوطة - رحالة ومستكشف ومؤرخ حكيم بالجلباب المغربي والأسطرلاب',
    suggestedHeroRoleEn: 'Ibn Battuta - observant Moroccan voyager in traditional travel robes with celestial astrolabe',
    recommendedStyle: 'IMAX Ultra-Realism 8K',
    acts: {
      act1TitleAr: 'البداية: توديع طنجة وركوب سفن الموانئ الشرقية',
      act1TitleEn: 'Act I: Farewell to Tangier & Sailing East',
      act1DescriptionAr: 'وداع شواطئ المغرب وحيداً والانطلاق نحو موانئ البحر الأحمر وتجهيز المراكب الشراعية للشرق.',
      act1DescriptionEn: 'Departing solitary from Tangier, journeying through ancient Mediterranean ports to board a massive Arabian trading dhow.',
      act2TitleAr: 'الوسط: إعصار المونسون وتكسر الصواري في بحر الهند',
      act2TitleEn: 'Act II: The Great Indian Ocean Tempest',
      act2DescriptionAr: 'أمواج عملاقة تبتلع مقدمة السفينة في سواد الليل، وابن بطوطة يثبت ببوصلته ويرشد الربان نحو ممر المرجان.',
      act2DescriptionEn: 'A colossal monsoon hurricane shatters rigging; Ibn Battuta uses astronomical navigation instruments to calculate reef escape vectors.',
      act3TitleAr: 'الذروة: شروق النجاة وتدوين عجائب الأسفار',
      act3TitleEn: 'Act III: Dawn Over Emerald Lagoons & The Chronicle',
      act3DescriptionAr: 'انبثاق شمس الصباح على مياه فيروزية هادئة وجزر نخيل خضراء، وجلوس ابن بطوطة يسطر بمداده صفحات كتابه الخالد.',
      act3DescriptionEn: 'Morning light reveals a tranquil tropical atoll; Ibn Battuta dips his reed pen to record the miraculous survival.'
    }
  },
  {
    id: 'template-sinbad-voyages',
    genre: 'فانتازيا وأساطير',
    nameAr: 'أسطورة سندباد البحري',
    nameEn: 'Legend of Sinbad the Sailor',
    icon: '🐋',
    taglineAr: 'مغامرات ألف ليلة وليلة، الرسو على جزيرة خضراء تتبين أنها ظهر حوت عملاق يستيقظ من سباته',
    taglineEn: 'Arabian Nights oceanic lore, stepping ashore a green haven that reveals itself as an awakening leviathan',
    defaultConceptAr: 'السندباد وطاقمه يرسون على جزيرة خضراء هادئة في المحيط، وعندما يوقدون النار تهتز الأرض ليكتشفوا أنها ظهر حوت بحري عملاق يغوص بهم للأعماق.',
    defaultConceptEn: 'Sinbad and sailors make camp on an idyllic green islet, which shudders and submerges as a gargantuan sea monster.',
    suggestedHeroRoleAr: 'السندباد البحري - ربان بغدادي خبير وبحار جسور بالعمامة البحرية البيضاء',
    suggestedHeroRoleEn: 'Sinbad the Sailor - seasoned Baghdadi navigator facing mythical oceanic behemoths',
    recommendedStyle: 'IMAX Ultra-Realism 8K',
    acts: {
      act1TitleAr: 'البداية: الرسو على الواحة البحرية الساحرة',
      act1TitleEn: 'Act I: The Deceptive Green Sanctuary',
      act1DescriptionAr: 'اقتراب سفينة السندباد من رقعة خضراء تطفو فوق المياه الفيروزية الصافية، وهبوط البحارة للاحتفال.',
      act1DescriptionEn: 'The ship anchors beside a lush emerald mound in calm waters; delighted crew members row ashore to kindle cooking fires.',
      act2TitleAr: 'الوسط: اهتزاز الأرض وصحوة الوحش البحري',
      act2TitleEn: 'Act II: The Ground Trembles & Steam Erupts',
      act2DescriptionAr: 'تصدع تربة الجزيرة، اشتعال النيران يوقظ جلد الكائن الضخم، واندفاع نافورة ماء وبخار عملاقة تقلب القدور وسط ذعر الطاقم.',
      act2DescriptionEn: 'Cracks open beneath the camp; steam geysers erupt as heat penetrates the beast’s skin, causing massive tremors and panic.',
      act3TitleAr: 'الذروة: الغرق العظيم والنجاة بالألواح الخشبية',
      act3TitleEn: 'Act III: The Descent of the Colossus',
      act3DescriptionAr: 'انحدار الجزيرة بأكملها في عمق المحيط صانعة دوامة هائلة، وقفز السندباد متشبثاً ببرميل خشبي ناجياً نحو أفق جديد.',
      act3DescriptionEn: 'The titan whale submerges into deep blue ocean creating a swirling vortex; Sinbad grabs a floating timber plank surviving the abyss.'
    }
  }
];

// Standard Genre Presets
const GENRE_PRESETS = [
  { id: 'sci-fi', nameAr: 'خيال علمي ومستقبل', nameEn: 'Sci-Fi & Cyberpunk', icon: '🚀' },
  { id: 'action', nameAr: 'حركة وإثارة وتشويق', nameEn: 'Action & Thriller', icon: '🔥' },
  { id: 'historical', nameAr: 'تاريخي وملحمي تراثي', nameEn: 'Historical & Epic', icon: '🏛️' },
  { id: 'drama', nameAr: 'دراما إنسانية عميقة', nameEn: 'Emotional Drama', icon: '🎭' },
  { id: 'mystery', nameAr: 'غموض وتحقيقات', nameEn: 'Mystery & Detective', icon: '🔍' },
  { id: 'fantasy', nameAr: 'فانتازيا وأساطير', nameEn: 'Fantasy & Myth', icon: '✨' },
  { id: 'horror', nameAr: 'رعب نفسي وسينمائي', nameEn: 'Psychological Horror', icon: '🌑' },
  { id: 'documentary', nameAr: 'وثائقي سينمائي واقعي', nameEn: 'Cinematic Documentary', icon: '🌍' }
];

// Visual Aesthetic Presets
const STYLE_PRESETS = [
  { id: 'film-35mm', nameAr: 'فيلم سينمائي 35mm (Arri Alexa)', nameEn: 'Cinematic 35mm Film (Arri Alexa)', desc: 'دفء ألوان سينمائي، عمق مجال حاد، حبيبات فيلم خفيفة' },
  { id: 'imax-ultra', nameAr: 'واقعية فائقة IMAX 8K', nameEn: 'IMAX Ultra-Realism 8K', desc: 'حدة مذهلة، تفاصيل دقيقة، أفق عريض، إضاءة طبيعية نقية' },
  { id: 'cyberpunk-neon', nameAr: 'سايبربانك نيون وأمطار ليلية', nameEn: 'Cyberpunk Neon & Wet Night', desc: 'أضواء نيون زرقاء وأرجوانية، انعكاسات مائية، دخان وأجواء مستقبلية' },
  { id: 'golden-noir', nameAr: 'كلاسيكي نوير وظلال حادة', nameEn: 'Vintage Film Noir', desc: 'تباين عالي، إضاءة جانبية درامية، غموض سينمائي كلاسيكي' },
  { id: 'desert-epic', nameAr: 'ملحمة صحراوية ذهبية (Dune Style)', nameEn: 'Golden Desert Epic (Dune Style)', desc: 'أطياف رملية وذهبية، عواصف غبارية، عدسات سينمائية عملاقة' },
  { id: 'anime-cinematic', nameAr: 'أنمي سينمائي واقعي (Ghibli/Makoto)', nameEn: 'Cinematic Anime Aesthetic', desc: 'ألوان ساطعة، إضاءة ملائكية، خلفيات مرسومة بتفاصيل غنية' }
];

// Target Video AI Models
const VIDEO_AI_MODELS = [
  { id: 'kling', name: 'Kling 1.5 Pro', desc: 'أعلى دقة في ثبات حركة الأجسام والوجوه' },
  { id: 'runway', name: 'Runway Gen-3 Alpha', desc: 'تحكم سينمائي فائق في الكاميرا والواقعية' },
  { id: 'sora', name: 'OpenAI Sora', desc: 'استيعاب معقد للفيزياء والحبكات الطويلة' },
  { id: 'luma', name: 'Luma Dream Machine', desc: 'انتقالات كاميرا سلسة وديناميكية ممتازة' },
  { id: 'minimax', name: 'Hailuo Minimax', desc: 'تعبيرات وجه حية وحركة شخصيات انسيابية' }
];

// Quick Story Ideas for inspiration (historical legends & speculative concepts)
const STORY_INSPIRATION_IDEAS = [
  {
    ar: 'عنترة بن شداد يمتطي جواده "الأدهم" بمفرده ليخترق حصار غارة مباغتة لإنقاذ عبلة والذود عن مضارب قبيلته.',
    en: 'Antarah ibn Shaddad charges solo on his black stallion Al-Adham to pierce an enemy siege and defend his tribe.'
  },
  {
    ar: 'زرقاء اليمامة تقف على برج الحصن العالي وترى شجراً يسير في الأفق البعيد لتنذر قومها من جيش حسان بن تُبّع المتخفي.',
    en: 'Zarqa al-Yamama stands on her high tower witnessing a walking forest concealing an invading army across the horizon.'
  },
  {
    ar: 'زنوبيا ملكة تدمر تعتلي جوادها الأبيض في ساحة الأعمدة التاريخية لتقود فرسان الشرق في ملحمة صمود ضد فيالق روما.',
    en: 'Queen Zenobia of Palmyra rides her white stallion through the Great Colonnade, rallying desert cataphracts against Rome.'
  },
  {
    ar: 'السندباد البحري وطاقمه يرسون على جزيرة خضراء هادئة في المحيط، ليكتشفوا برعب أنها ظهر حوت بحري عملاق يستيقظ.',
    en: 'Sinbad and his sailors anchor on an idyllic green island, only to discover with dread it is an awakening titan whale.'
  },
  {
    ar: 'صقر قريش عبد الرحمن الداخل يسبح عبر الفرات الهادر ناجياً من مطارديه ليقطع آلاف الأميال ويؤسس مجد قرطبة.',
    en: 'The Falcon of Quraysh swims the freezing Euphrates, surviving a pursuit to cross the desert and found golden Córdoba.'
  },
  {
    ar: 'حاتم الطائي يذبح فرسه الوحيد في ليلة صقيع ثلجية لإطعام أطفال ضيف غريب تضوروا جوعاً، مجسداً أسمى معاني الإيثار.',
    en: 'Hatim al-Tai slaughters his prized lone stallion in a freezing blizzard to feed a freezing guest’s starving children.'
  },
  {
    ar: 'سيف بن ذي يزن يتسلق قمم السحاب بحثاً عن عش طائر الرخ الخرافي لاسترداد سيف الأجداد المسحور وتحرير أرضه.',
    en: 'Sayf ibn Dhi Yazan scales cloud-piercing peaks into the aerie of the giant Roc bird to reclaim the enchanted ancestral blade.'
  },
  {
    ar: 'قيس بن الملوح (مجنون ليلى) يهيم في أودية نجد بين الغزلان البرية وصخور الكثبان ينحت أشعاره الخالدة في مهب الرياح.',
    en: 'Qays (Majnun Layla) wanders the dunes of Najd among wild gazelles, carving immortal poetry into sandstone crags.'
  },
  {
    ar: 'بلقيس ملكة سبأ تسير في الصرح الممرّد من قوارير وتحسبه لجة، مبرهنة أن الحكمة السياسية أسمى من إشعال الحروب.',
    en: 'Queen Bilqis walks upon the transparent crystal glass floor over living waters, proving diplomatic wisdom over war.'
  },
  {
    ar: 'مهندس اتصالات عربي يكتشف في صحراء الربع الخالي برجا قديما يصدر نبضات لاسلكية غامضة تقود لمدينة مدفونة تحت الرمال.',
    en: 'An Arab telecom engineer in the Empty Quarter detects anomalous radio signals from a buried pre-ancient desert monolith.'
  }
];

// Helper: Convert scene numbers to Arabic and English ordinals (المشهد الأول، المشهد الثاني...)
export function getArabicOrdinal(num: number): string {
  const ordinals: Record<number, string> = {
    1: 'المشهد الأول',
    2: 'المشهد الثاني',
    3: 'المشهد الثالث',
    4: 'المشهد الرابع',
    5: 'المشهد الخامس',
    6: 'المشهد السادس',
    7: 'المشهد السابع',
    8: 'المشهد الثامن',
    9: 'المشهد التاسع',
    10: 'المشهد العاشر',
    11: 'المشهد الحادي عشر',
    12: 'المشهد الثاني عشر',
    13: 'المشهد الثالث عشر',
    14: 'المشهد الرابع عشر',
    15: 'المشهد الخامس عشر',
    16: 'المشهد السادس عشر',
    17: 'المشهد السابع عشر',
    18: 'المشهد الثامن عشر',
    19: 'المشهد التاسع عشر',
    20: 'المشهد العشرون',
    21: 'المشهد الحادي والعشرون',
    22: 'المشهد الثاني والعشرون',
    23: 'المشهد الثالث والعشرون',
    24: 'المشهد الرابع والعشرون',
    25: 'المشهد الخامس والعشرون',
    26: 'المشهد السادس والعشرون',
    27: 'المشهد السابع والعشرون',
    28: 'المشهد الثامن والعشرون',
    29: 'المشهد التاسع والعشرون',
    30: 'المشهد الثلاثون'
  };
  return ordinals[num] || `المشهد رقم ${num}`;
}

export function getEnglishOrdinal(num: number): string {
  const ordinals: Record<number, string> = {
    1: 'First Scene',
    2: 'Second Scene',
    3: 'Third Scene',
    4: 'Fourth Scene',
    5: 'Fifth Scene',
    6: 'Sixth Scene',
    7: 'Seventh Scene',
    8: 'Eighth Scene',
    9: 'Ninth Scene',
    10: 'Tenth Scene',
    11: 'Eleventh Scene',
    12: 'Twelfth Scene',
    13: 'Thirteenth Scene',
    14: 'Fourteenth Scene',
    15: 'Fifteenth Scene',
    16: 'Sixteenth Scene',
    17: 'Seventeenth Scene',
    18: 'Eighteenth Scene',
    19: 'Nineteenth Scene',
    20: 'Twentieth Scene'
  };
  return ordinals[num] || `Scene ${num}`;
}

// Dynamic local synthesis helper for instant client-side screenplay creation with multi-act structure
function generateLocalMovieProject(
  concept: string,
  genre: string,
  visualStyle: string,
  targetAiModel: string,
  sceneCount: number,
  characterName: string,
  characterGender: string,
  characterAge: string,
  characterFeature: string,
  actStructure?: ActStructure,
  customDialogue?: string
): MovieProject {
  const cleanConcept = (concept || '').trim();
  const heroName = (characterName && characterName.trim()) 
    ? characterName.trim() 
    : 'بطل القصة';
  const heroRole = `الشخصية المحورية في مسار: ${cleanConcept.substring(0, 30)}`;
  const token = `[Consistent Face Anchor: ${heroName.split(' ')[0]}, ${characterAge || '30s'}${characterGender ? ` ${characterGender}` : ''}, ${characterFeature || 'cinematic facial symmetry, focused expressive gaze, detailed skin texture'}, identical facial bone structure across all camera angles]`;

  // Dynamically extract core concept elements to avoid static boilerplate
  const conceptWords = cleanConcept.replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(w => w.length > 2);
  const keyFocalPhrase = conceptWords.slice(0, 4).join(' ') || cleanConcept.substring(0, 25);
  const heroFirst = heroName.split(' ')[0];

  // Parse user-provided custom dialogue if available
  const userDialogueLines: { speaker?: string; text: string }[] = [];
  if (customDialogue && typeof customDialogue === 'string' && customDialogue.trim()) {
    const rawLines = customDialogue
      .split(/[\n;\r]+/)
      .map(l => l.trim())
      .filter(l => l.length > 0 && !l.startsWith('#') && !l.startsWith('//'));
    for (const line of rawLines) {
      const match = line.match(/^([^:：\-]+)[:：\-]\s*(.+)$/);
      if (match) {
        userDialogueLines.push({ speaker: match[1].trim(), text: match[2].trim() });
      } else {
        userDialogueLines.push({ text: line });
      }
    }
  }

  const act1Cutoff = Math.max(1, Math.floor(sceneCount * 0.34));
  const act2Cutoff = Math.max(act1Cutoff + 1, Math.floor(sceneCount * 0.7));

  const scenes: CinemaScene[] = [];
  for (let i = 0; i < sceneCount; i++) {
    const startSec = i * 10;
    const endSec = (i + 1) * 10;
    const pad = (n: number) => n < 10 ? `0${n}` : `${n}`;
    const timeRange = `00:${pad(startSec)} - 00:${pad(endSec)}`;
    const arabicOrd = getArabicOrdinal(i + 1);
    const engOrd = getEnglishOrdinal(i + 1);

    let actPhase: ActPhase = 'act1';
    let actLabelAr = 'الفصل الأول: البداية والتأسيس';
    let actLabelEn = 'Act I: Setup & Genesis';
    let actionAr = '';
    let actionEn = '';
    let dialogueAr = '';
    let dialogueEn = '';
    let currentSpeaker = heroFirst;
    let emotion = 'نبرة تركيز وتأمل حاسم';
    let shotType = 'Medium Cinematic Shot';
    let cameraMotion = 'Slow Push-In Dolly (10s)';
    let soundDesign = 'Atmospheric ambient soundscape and spatial acoustic resonance';

    if (i < act1Cutoff) {
      actPhase = 'act1';
      actLabelAr = 'الفصل الأول: البداية والتأسيس';
      actLabelEn = 'Act I: Setup & Genesis';
      shotType = i === 0 ? 'Wide Atmospheric Establishing Shot' : 'Medium Cinematic Tracking Shot';
      cameraMotion = 'Slow Push-In Dolly (10s)';
      soundDesign = 'Subtle atmospheric texture, low cello swell, environmental acoustics';
      emotion = 'نبرة تركيز واستكشاف حاسم (Focused, observant)';

      const act1Context = actStructure?.act1DescriptionAr || keyFocalPhrase;
      actionAr = `يقف ${heroName} في افتتاحية المشهد مستكشفاً أبعاد ${act1Context}، وتنعكس الإضاءة السينمائية على ملامحه وهو يلاحظ أولى الدلائل المحورية.`;
      actionEn = `${heroName} surveys the opening surroundings of "${actStructure?.act1DescriptionEn || keyFocalPhrase}", volumetric cinematic lighting sculpting expressive facial tension.`;
      if (i === 0) {
        dialogueAr = `هنا تتضح ملامح ${keyFocalPhrase}.. انظروا بتركيز، كل خطوة هنا محسوبة!`;
        dialogueEn = `Here the signs of ${keyFocalPhrase} take shape.. observe carefully, every step counts!`;
      } else {
        dialogueAr = `وجدت أول خيط يقودنا في ${keyFocalPhrase}.. تأكدوا من الإحداثيات فوراً!`;
        dialogueEn = `Found the first lead in ${keyFocalPhrase}.. confirm coordinates immediately!`;
      }
    } else if (i < act2Cutoff) {
      actPhase = 'act2';
      actLabelAr = 'الفصل الثاني: الصراع والمواجهة';
      actLabelEn = 'Act II: Rising Conflict';
      shotType = 'Over-the-Shoulder Dynamic Shot';
      cameraMotion = 'Intense Steadicam Tracking (10s)';
      soundDesign = 'Rising tension drone, rhythmic percussive hits, textured environmental friction';
      emotion = 'نبرة تحذير وتوتر مشحون (Urgent and vigilant)';

      const act2Context = actStructure?.act2DescriptionAr || `تصاعد الصراع والمواجهة في ${keyFocalPhrase}`;
      actionAr = `يتسارع إيقاع الحدث حين يواجه ${heroName} العقبة الكبرى المتمثلة في ${act2Context}، مع حركة كاميرا مشحونة بالترقب والضغط الزمني.`;
      actionEn = `${heroName} navigates high-stakes resistance involving "${actStructure?.act2DescriptionEn || keyFocalPhrase}", urgency surging through kinetic tracking.`;

      if (i % 2 === 0) {
        dialogueAr = `الضغط يزداد حول ${keyFocalPhrase}.. لا تفقدوا تركيزكم حتى نعبر هذا المنعطف!`;
        dialogueEn = `Pressure is mounting around ${keyFocalPhrase}.. maintain focus until we clear this turning point!`;
      } else {
        dialogueAr = `تحركوا بسرعة، سنواجه تحدي ${keyFocalPhrase} وجهاً لوجه ولن نتردد!`;
        dialogueEn = `Move swiftly, we confront the challenge of ${keyFocalPhrase} head on without hesitation!`;
      }
    } else {
      actPhase = 'act3';
      actLabelAr = 'الفصل الثالث: الذروة والخاتمة';
      actLabelEn = 'Act III: Climax & Resolution';
      shotType = i === sceneCount - 1 ? 'Epic Master Hero Wide Shot' : 'Low Angle Dramatic Hero Tilt';
      cameraMotion = i === sceneCount - 1 ? 'Slow Pull-Back Crane (10s)' : 'Dynamic Dutch Angle Arc (10s)';
      soundDesign = 'Soaring triumphant orchestral crescendo, massive cinematic sub-impact, resonant finale';
      emotion = 'نبرة فخر وحسم منتصر (Triumphant and resonant)';

      const act3Context = actStructure?.act3DescriptionAr || `الوصول إلى الحسم النهائي لـ ${keyFocalPhrase}`;
      actionAr = `يصل ${heroName} إلى ذروة التحدي والمواجهة الفاصلة محققاً انتصار الرؤية في ${act3Context}، وسط إضاءة ذهبية ملحمية تعلن اكتمال الرحلة.`;
      actionEn = `${heroName} reaches the monumental climactic breakthrough for "${actStructure?.act3DescriptionEn || keyFocalPhrase}", triumphant golden hour rays illuminating narrative closure.`;

      if (i === sceneCount - 1) {
        dialogueAr = `لقد نجحنا في حسم مصير ${keyFocalPhrase}.. انظروا كيف انتصرت إرادتنا أمام كل الصعاب!`;
        dialogueEn = `We prevailed in sealing the fate of ${keyFocalPhrase}.. look how our will conquered all odds!`;
      } else {
        dialogueAr = `هذه لحظة الحقيقة الفاصلة في ${keyFocalPhrase}.. لا تراجع، الضربة القاضية الآن!`;
        dialogueEn = `This is the definitive truth moment in ${keyFocalPhrase}.. no retreat, decisive strike now!`;
      }
    }

    // Integrate user's manual dialogue dynamically if supplied
    if (userDialogueLines.length > 0) {
      const customItem = userDialogueLines[i % userDialogueLines.length];
      dialogueAr = customItem.text;
      dialogueEn = `[Custom Line]: "${customItem.text}"`;
      if (customItem.speaker) {
        currentSpeaker = customItem.speaker;
      }
    }

    const rawPrompt = `${token} ${engOrd} (${timeRange}, exactly 10s duration). [SCREENPLAY ACTION]: ${shotType}, ${cameraMotion}. ${actionEn} [CHARACTER SPOKEN DIALOGUE & LIP-SYNC]: ${currentSpeaker} speaks (${emotion}) at 00:03 - 00:08: "${dialogueAr}" ("${dialogueEn}"), synchronized natural mouth and lip movement, authentic facial expression. [CINEMATOGRAPHY]: ${visualStyle}, 8k resolution, cinematic lighting, photorealistic textures, optimized for ${targetAiModel}.`;

    scenes.push({
      sceneNumber: i + 1,
      timeRange,
      durationSeconds: 10,
      titleAr: `${arabicOrd}: ${actionAr.substring(0, 28)}...`,
      titleEn: `${engOrd}: ${shotType}`,
      screenplaySlug: `${arabicOrd}: لقطة سينمائية [${timeRange}]`,
      screenplayBeatAr: actionAr,
      screenplayBeatEn: actionEn,
      dialogueSpeaker: currentSpeaker,
      dialogueEmotion: emotion,
      dialogueTiming: `00:03 - 00:08`,
      dialogueAr,
      dialogueEn,
      shotType,
      cameraMotion,
      dramaticActionAr: actionAr,
      videoPromptEn: appendSiteUrlToPrompt(rawPrompt),
      soundDesign,
      motionIntensity: actPhase === 'act2' ? 8 : (actPhase === 'act3' ? 7 : 5),
      actPhase,
      actLabelAr,
      actLabelEn
    });
  }

  return {
    id: 'movie_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
    titleAr: `رائعة سينمائية: ${cleanConcept.substring(0, 32)}`,
    titleEn: `Cinematic Screenplay: ${cleanConcept.substring(0, 28)}`,
    concept: cleanConcept,
    genre,
    visualStyle,
    targetAiModel,
    loglineAr: `في سياق سينمائي ملحمي مستوحى من فكرة: "${cleanConcept}"، يخوض ${heroName} رحلة ثلاثية الفصول عبر مشاهد دقيقة مدة كل منها 10 ثوانٍ مع تثبيت ملامح الوجه وحوارات منطوقة مفعمة بالحياة.`,
    loglineEn: `A multi-act cinematic journey centered on "${cleanConcept}", following ${heroName} through meticulously paced 10-second scenes with anchored facial consistency and synchronized bespoke dialogue.`,
    storySynopsisAr: `تبدأ القصة بتأسيس عالم الفكرة وتتصاعد عبر مواجهات حاسمة وصولاً إلى ذروة التفاعل والخاتمة المؤثرة.`,
    storySynopsisEn: `The narrative builds through precise three-act dramatic arcs across sequential 10-second scenes with persistent facial identity, delivering an impactful cinematic resolution.`,
    characterAnchor: {
      name: heroName,
      role: heroRole,
      gender: characterGender || 'شخصية رئيسية',
      age: characterAge || '30s',
      faceDescriptionAr: characterFeature || 'ملامح سينمائية متناسقة ومصممة بدقة لتتناسب مع طبيعة الدور والأجواء الدرامية للقصة',
      faceDescriptionEn: 'Cinematic facial symmetry tailored to the story universe',
      consistencyPromptToken: token
    },
    scenes,
    totalDurationSeconds: sceneCount * 10,
    actStructure,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export interface ManualSceneItem {
  id: string;
  titleAr: string;
  screenplayBeatAr: string;
  dialogueSpeaker: string;
  dialogueAr: string;
  dialogueEmotion: string;
  dialogueTiming: string;
  shotType: string;
  cameraMotion: string;
}

export interface DialogueContextSuggestion {
  type: string;
  styleLabelAr: string;
  styleLabelEn: string;
  dialogueAr: string;
  dialogueEn: string;
  emotionAr: string;
  subtextReasonAr: string;
}

export const DEFAULT_MANUAL_SCENES: ManualSceneItem[] = [
  {
    id: 'mscene_1',
    titleAr: 'المشهد الأول: الافتتاحية',
    screenplayBeatAr: 'يقف البطل عند مدخل الموقع بترقب تام، متفحصاً البيئة المحيطة به بدقة تحت إضاءة سينمائية دافئة.',
    dialogueSpeaker: 'البطل',
    dialogueAr: 'كل شيء بدأ يتضح الآن، ولن نسمح للفرصة أن تفلت من أيدينا.',
    dialogueEmotion: 'نبرة تركيز وحزم',
    dialogueTiming: '00:03 - 00:08',
    shotType: 'Wide Atmospheric Establishing Shot',
    cameraMotion: 'Slow Push-In Dolly (10s)'
  },
  {
    id: 'mscene_2',
    titleAr: 'المشهد الثاني: تصاعد التحدي',
    screenplayBeatAr: 'يتحرك البطل للأمام بحذر ويكتشف تطوراً مباغتاً يفرض عليه اتخاذ مناورة دفاعية فورية.',
    dialogueSpeaker: 'البطل',
    dialogueAr: 'انتبهوا جميعاً! الأمور ليست كما بدت، تحركوا بحذر.',
    dialogueEmotion: 'نبرة تحذير وتوتر',
    dialogueTiming: '00:03 - 00:08',
    shotType: 'Over-the-Shoulder Dynamic Shot',
    cameraMotion: 'Intense Steadicam Tracking (10s)'
  },
  {
    id: 'mscene_3',
    titleAr: 'المشهد الثالث: الذروة والحسم',
    screenplayBeatAr: 'يصل البطل إلى اللحظة الحاسمة متجاوزاً الخطر الأكبر، وسط أشعة ضوء ذهبية تعلن حسم الموقف.',
    dialogueSpeaker: 'البطل',
    dialogueAr: 'صمدنا حتى النهاية.. لقد صنعنا الفارق بأيدينا!',
    dialogueEmotion: 'نبرة فخر وانتصار',
    dialogueTiming: '00:03 - 00:08',
    shotType: 'Epic Master Hero Wide Shot',
    cameraMotion: 'Slow Pull-Back Crane (10s)'
  }
];

export default function CinemaMovieStudio({
  lang,
  user,
  onSendToTester,
  onLogPrompt
}: CinemaMovieStudioProps) {
  // Read initial stored manual draft safely from LocalStorage
  const initialManualDraft = useMemo(() => {
    try {
      const stored = localStorage.getItem(MANUAL_DRAFT_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to parse manual draft from LocalStorage:', e);
    }
    return null;
  }, []);

  // Read initial stored active project draft safely from LocalStorage
  const initialActiveProject = useMemo(() => {
    try {
      const stored = localStorage.getItem(ACTIVE_PROJECT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed.scenes) && parsed.scenes.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse active project draft from LocalStorage:', e);
    }
    return null;
  }, []);

  // Input Form States (Restored from LocalStorage if user previously worked on them)
  const [concept, setConcept] = useState(() => initialManualDraft?.concept || '');
  const [genre, setGenre] = useState(() => initialManualDraft?.genre || GENRE_PRESETS[0].nameAr);
  const [visualStyle, setVisualStyle] = useState(() => initialManualDraft?.visualStyle || STYLE_PRESETS[0].nameEn);
  const [targetAiModel, setTargetAiModel] = useState(() => initialManualDraft?.targetAiModel || VIDEO_AI_MODELS[0].name);
  const [sceneCount, setSceneCount] = useState<number>(() => initialManualDraft?.sceneCount || 4);

  // Manual Dialogue Input Before Generation (to dynamically weave into screenplay scenes)
  const [customDialogueInput, setCustomDialogueInput] = useState<string>(() => initialManualDraft?.customDialogueInput || '');
  const [isGeneratingDialoguePreset, setIsGeneratingDialoguePreset] = useState<boolean>(false);

  // Ready Screenplay Templates and Multi-Act Structure States
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [showActControls, setShowActControls] = useState<boolean>(true);
  const [isSuggestingActs, setIsSuggestingActs] = useState<boolean>(false);
  const [activeActTab, setActiveActTab] = useState<ActPhase>('act1');
  const [sceneActFilter, setSceneActFilter] = useState<'all' | ActPhase>('all');
  const [actStructure, setActStructure] = useState<ActStructure>(() => ({ ...SCREENPLAY_TEMPLATES[0].acts }));
  
  // Character Anchor Input States (Start empty or restored from LocalStorage)
  const [characterName, setCharacterName] = useState(() => initialManualDraft?.characterName || '');
  const [characterGender, setCharacterGender] = useState(() => initialManualDraft?.characterGender || '');
  const [characterAge, setCharacterAge] = useState(() => initialManualDraft?.characterAge || '');
  const [characterFeature, setCharacterFeature] = useState(() => initialManualDraft?.characterFeature || '');

  // Generation & Workspace States (Restores active project draft across refresh or tab change)
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeProject, setActiveProject] = useState<MovieProject | null>(() => initialActiveProject);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedDialogueIndex, setCopiedDialogueIndex] = useState<number | null>(null);
  const [copiedActionIndex, setCopiedActionIndex] = useState<number | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedAllPrompts, setCopiedAllPrompts] = useState(false);
  const [copiedAllCleanPrompts, setCopiedAllCleanPrompts] = useState(false);
  const [regeneratingDialogueIndex, setRegeneratingDialogueIndex] = useState<number | null>(null);
  const [isModalGeneratingDialogue, setIsModalGeneratingDialogue] = useState(false);

  // Creation Mode: 'ai' vs 'manual' (Restored from LocalStorage)
  const [creationMode, setCreationMode] = useState<'ai' | 'manual'>(() => initialManualDraft?.creationMode || 'ai');
  const [manualTitle, setManualTitle] = useState(() => initialManualDraft?.manualTitle || 'سيناريو فيلم مخصص');
  const [manualConcept, setManualConcept] = useState(() => initialManualDraft?.manualConcept ?? '');
  const [manualSubMode, setManualSubMode] = useState<'scenes' | 'bulk'>(() => initialManualDraft?.manualSubMode || 'scenes');
  const [manualScenes, setManualScenes] = useState<ManualSceneItem[]>(() => 
    (initialManualDraft?.manualScenes && initialManualDraft.manualScenes.length > 0)
      ? initialManualDraft.manualScenes
      : DEFAULT_MANUAL_SCENES
  );
  const [manualBulkText, setManualBulkText] = useState(() => initialManualDraft?.manualBulkText ?? '');

  // Saved Projects Manager Drawer / Modal
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [savedDrawerTab, setSavedDrawerTab] = useState<'my_projects' | 'legends'>('my_projects');
  const [savedProjects, setSavedProjects] = useState<MovieProject[]>([]);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);
  const [savedSearchQuery, setSavedSearchQuery] = useState('');
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [projectTitleInput, setProjectTitleInput] = useState(() => initialActiveProject?.titleAr || '');

  // 10-Second Scene Playback Simulator
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [playbackSeconds, setPlaybackSeconds] = useState(0);

  // Inline scene editing modal/state
  const [editingScene, setEditingScene] = useState<{ index: number; scene: CinemaScene } | null>(null);

  // Screenplay Export Modal (Text / PDF / Markdown)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Story-to-Screenplay Generator Diagnostic Tester Modal
  const [isTesterModalOpen, setIsTesterModalOpen] = useState(false);

  // Arabic Historical Legends & Screenplays Library Modal
  const [isLegendsModalOpen, setIsLegendsModalOpen] = useState(false);

  // Author & Add Scene Modal (Manual or AI Co-Director)
  const [isAddSceneModalOpen, setIsAddSceneModalOpen] = useState(false);

  // Share Sequence states
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [sharedBannerInfo, setSharedBannerInfo] = useState<{
    authorName?: string;
    title: string;
  } | null>(null);

  // Contextual Dialogue Suggestions State
  const [contextSuggestionsTarget, setContextSuggestionsTarget] = useState<string | null>(null);
  const [isFetchingContextSuggestions, setIsFetchingContextSuggestions] = useState<boolean>(false);
  const [contextSuggestionsData, setContextSuggestionsData] = useState<{
    targetId: string;
    original: string;
    sceneNatureSummary: string;
    suggestions: DialogueContextSuggestion[];
  } | null>(null);

  // Auto-save manual screenplay draft to LocalStorage with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const draft = {
          creationMode,
          manualTitle,
          manualConcept,
          manualScenes,
          manualBulkText,
          manualSubMode,
          customDialogueInput,
          characterName,
          characterGender,
          characterAge,
          characterFeature,
          concept,
          genre,
          visualStyle,
          targetAiModel,
          sceneCount,
          lastSavedAt: new Date().toISOString()
        };
        localStorage.setItem(MANUAL_DRAFT_STORAGE_KEY, JSON.stringify(draft));
      } catch (err) {
        console.warn('Failed to auto-save manual screenplay draft to localStorage:', err);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [
    creationMode,
    manualTitle,
    manualConcept,
    manualScenes,
    manualBulkText,
    manualSubMode,
    customDialogueInput,
    characterName,
    characterGender,
    characterAge,
    characterFeature,
    concept,
    genre,
    visualStyle,
    targetAiModel,
    sceneCount
  ]);

  // Auto-persist active project draft to LocalStorage so refresh or navigation never loses work
  useEffect(() => {
    try {
      if (activeProject && activeProject.scenes && activeProject.scenes.length > 0) {
        localStorage.setItem(ACTIVE_PROJECT_STORAGE_KEY, JSON.stringify(activeProject));
      }
    } catch (err) {
      console.warn('Failed to auto-save active project draft to localStorage:', err);
    }
  }, [activeProject]);

  // Reset manual draft
  const handleResetManualDraft = () => {
    if (window.confirm(lang === 'ar' ? 'هل أنت متأكد من رغبتك في مسح المسودة اليدوية والبدء من جديد؟' : 'Are you sure you want to reset your manual draft?')) {
      setManualScenes(DEFAULT_MANUAL_SCENES);
      setManualTitle('سيناريو فيلم مخصص');
      setManualConcept('');
      setManualBulkText('');
      setCustomDialogueInput('');
      try {
        localStorage.removeItem(MANUAL_DRAFT_STORAGE_KEY);
      } catch {}
      showToast(lang === 'ar' ? 'تمت إعادة تعيين المسودة بنجاح.' : 'Manual draft reset.');
    }
  };

  // Deep link loader for ?movie_seq= or ?sharedMovie= on mount
  useEffect(() => {
    let isMounted = true;
    const checkAndLoadSharedMovie = async () => {
      try {
        const search = window.location.search;
        if (!search) return;
        const params = new URLSearchParams(search);
        const movieId = params.get('movie_seq') || params.get('sharedMovie') || params.get('movie');
        const hashData = params.get('smovie');

        if (movieId) {
          const sharedDoc = await getSharedSequence(movieId);
          if (!isMounted) return;
          if (sharedDoc && (sharedDoc.movieProject || (sharedDoc.scenes && sharedDoc.scenes.length > 0))) {
            const project = sharedDoc.movieProject || {
              id: `shared_${movieId}`,
              titleAr: sharedDoc.title,
              titleEn: sharedDoc.title,
              concept: sharedDoc.concept,
              genre: 'سينما',
              visualStyle: sharedDoc.anchorStyle || '',
              targetAiModel: 'Runway Gen-3 Alpha',
              loglineAr: sharedDoc.concept,
              loglineEn: sharedDoc.concept,
              storySynopsisAr: sharedDoc.concept,
              storySynopsisEn: sharedDoc.concept,
              characterAnchor: sharedDoc.characterAnchor || {
                name: 'البطل',
                role: 'الشخصية الرئيسية',
                faceDescriptionAr: 'ملامح سينمائية متناسقة',
                faceDescriptionEn: 'Cinematic symmetrical features',
                consistencyPromptToken: '[CHAR_HERO]'
              },
              scenes: sharedDoc.scenes as CinemaScene[],
              totalDurationSeconds: sharedDoc.scenes.length * 10,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            setActiveProject(project);
            setConcept(project.concept);
            setSharedBannerInfo({
              title: project.titleAr || project.titleEn,
              authorName: sharedDoc.authorName
            });
            showToast(
              lang === 'ar'
                ? `✨ تم استيراد سلسلة الفيلم المشتركة: "${project.titleAr}"!`
                : `✨ Imported shared movie sequence: "${project.titleAr}"!`
            );
            return;
          }
        }

        if (hashData) {
          const decoded = decodeSequenceFromHash(hashData);
          if (!isMounted) return;
          if (decoded && decoded.scenes && decoded.scenes.length > 0) {
            setActiveProject(decoded);
            setConcept(decoded.concept || '');
            setSharedBannerInfo({
              title: decoded.titleAr || decoded.title || 'Shared Movie Sequence'
            });
            showToast(lang === 'ar' ? '✨ تم فتح سلسلة الفيلم المشتركة!' : '✨ Opened shared movie sequence!');
          }
        }
      } catch (err) {
        console.warn('Failed to parse shared movie project from url:', err);
      }
    };

    checkAndLoadSharedMovie();
    return () => { isMounted = false; };
  }, [lang]);

  // Filtered saved projects by search query
  const filteredSavedProjects = useMemo(() => {
    if (!savedSearchQuery.trim()) return savedProjects;
    const q = savedSearchQuery.toLowerCase();
    return savedProjects.filter(p => 
      (p.titleAr && p.titleAr.toLowerCase().includes(q)) ||
      (p.titleEn && p.titleEn.toLowerCase().includes(q)) ||
      (p.concept && p.concept.toLowerCase().includes(q)) ||
      (p.genre && p.genre.toLowerCase().includes(q))
    );
  }, [savedProjects, savedSearchQuery]);

  // Filtered Arabic historical legends for drawer or quick browsing
  const filteredLegends = useMemo(() => {
    if (!savedSearchQuery.trim()) return ARABIC_HISTORICAL_LEGENDS;
    const q = savedSearchQuery.toLowerCase();
    return ARABIC_HISTORICAL_LEGENDS.filter(l =>
      l.titleAr.toLowerCase().includes(q) ||
      l.titleEn.toLowerCase().includes(q) ||
      l.conceptAr.toLowerCase().includes(q) ||
      l.hero.name.toLowerCase().includes(q) ||
      l.genreAr.toLowerCase().includes(q) ||
      (l.taglineAr && l.taglineAr.toLowerCase().includes(q))
    );
  }, [savedSearchQuery]);

  // Load saved projects on mount & auth change
  const loadSavedProjects = useCallback(async () => {
    setIsLoadingSaved(true);
    let localList: MovieProject[] = [];
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        localList = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse local cinema projects:', e);
    }

    if (user && user.uid) {
      try {
        const merged = await syncAllMovieProjectsToFirestore(user.uid, localList);
        setSavedProjects(merged);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
      } catch (err) {
        console.warn('Failed to sync cinema projects with Firestore:', err);
        setSavedProjects(localList);
      }
    } else {
      setSavedProjects(localList);
    }
    setIsLoadingSaved(false);
  }, [user]);

  useEffect(() => {
    loadSavedProjects();
  }, [loadSavedProjects]);

  // Persist project locally and remotely with zero clobbering
  const handleSaveCurrentProject = async (projectToSave?: MovieProject, showFeedbackToast = true) => {
    const target = projectToSave || activeProject;
    if (!target) return;

    const cleanId = String(target.id || `movie_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`).replace(/[^a-zA-Z0-9_\-]/g, '_');
    const nowIso = new Date().toISOString();
    const updatedProject: MovieProject = {
      ...target,
      id: cleanId,
      updatedAt: nowIso
    };

    // Update active project state
    setActiveProject(updatedProject);
    setLastSavedAt(new Date().toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' }));

    // Read latest projects directly from localStorage to guarantee zero loss
    let currentList: MovieProject[] = [];
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        currentList = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Error reading cinema projects from localStorage:', e);
    }

    const projectsMap = new Map<string, MovieProject>();
    savedProjects.forEach(p => projectsMap.set(p.id, p));
    currentList.forEach(p => projectsMap.set(p.id, p));
    projectsMap.set(updatedProject.id, updatedProject);

    const newSaved = Array.from(projectsMap.values()).sort((a, b) => 
      new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime()
    );

    setSavedProjects(newSaved);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newSaved));
      localStorage.setItem(ACTIVE_PROJECT_STORAGE_KEY, JSON.stringify(updatedProject));
    } catch (storageErr) {
      console.warn('Failed to save cinema project to localStorage:', storageErr);
    }

    // Save in Firestore if authenticated
    if (user && user.uid) {
      try {
        await saveUserMovieProject(user.uid, updatedProject);
      } catch (err) {
        console.warn('Could not save movie project to Firestore (offline):', err);
      }
    }

    if (showFeedbackToast) {
      showToast(
        lang === 'ar' 
          ? `✓ تم حفظ سيناريو "${updatedProject.titleAr}" بنجاح!` 
          : `✓ Screenplay "${updatedProject.titleEn || updatedProject.titleAr}" saved successfully!`
      );
    }
  };

  // Duplicate / Save current project as a new project
  const handleSaveAsNewProject = async () => {
    if (!activeProject) return;
    const newId = `movie_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const cloned: MovieProject = {
      ...activeProject,
      id: newId,
      titleAr: `${activeProject.titleAr} (نسخة جديدة)`,
      titleEn: `${activeProject.titleEn || activeProject.titleAr} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setProjectTitleInput(cloned.titleAr);
    await handleSaveCurrentProject(cloned, true);
  };

  // Rename current project title
  const handleUpdateProjectTitle = async () => {
    if (!activeProject || !projectTitleInput.trim()) return;
    const updated: MovieProject = {
      ...activeProject,
      titleAr: projectTitleInput.trim(),
      updatedAt: new Date().toISOString()
    };
    setIsEditingTitle(false);
    await handleSaveCurrentProject(updated, true);
  };

  // Delete project
  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذا المشروع السينمائي؟' : 'Are you sure you want to delete this movie project?')) {
      return;
    }

    const filtered = savedProjects.filter(p => p.id !== projectId);
    setSavedProjects(filtered);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));

    if (user && user.uid) {
      try {
        await deleteUserMovieProject(user.uid, projectId);
      } catch (err) {
        console.warn('Failed to delete movie project from Firestore:', err);
      }
    }

    if (activeProject && activeProject.id === projectId) {
      setActiveProject(null);
      setLastSavedAt(null);
    }

    showToast(lang === 'ar' ? 'تم حذف المشروع.' : 'Project deleted.');
  };

  // Resume / Load a saved project
  const handleResumeProject = (project: MovieProject) => {
    setActiveProject(project);
    setProjectTitleInput(project.titleAr || '');
    setConcept(project.concept || '');
    setGenre(project.genre || GENRE_PRESETS[0].nameAr);
    setVisualStyle(project.visualStyle || STYLE_PRESETS[0].nameEn);
    setTargetAiModel(project.targetAiModel || VIDEO_AI_MODELS[0].name);
    if (project.templateId) {
      setSelectedTemplateId(project.templateId);
    }
    if (project.actStructure) {
      setActStructure(project.actStructure);
    }
    if (project.characterAnchor) {
      setCharacterName(project.characterAnchor.name || '');
      setCharacterAge(project.characterAnchor.age || '34');
      setCharacterGender(project.characterAnchor.gender || 'ذكر');
      setCharacterFeature(project.characterAnchor.faceDescriptionAr || '');
    }
    setSceneCount(project.scenes.length || 4);
    setIsSavedDrawerOpen(false);
    setIsPlaying(false);
    setActiveSceneIndex(0);
    setPlaybackSeconds(0);
    if (project.updatedAt || project.createdAt) {
      setLastSavedAt(new Date(project.updatedAt || project.createdAt).toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' }));
    }
    showToast(
      lang === 'ar'
        ? `🎬 تم استئناف المشروع: "${project.titleAr}" جاهز للعمل والتطوير.`
        : `🎬 Loaded project: "${project.titleEn || project.titleAr}" ready to continue.`
    );
  };

  // Apply a historical legend to the AI generation form
  const handleApplyLegendToAiForm = (legend: HistoricalLegendScreenplay) => {
    setConcept(legend.conceptAr);
    setGenre(legend.genreAr);
    setVisualStyle(legend.recommendedStyleEn);
    setCharacterName(legend.hero.name);
    setCharacterGender(legend.hero.gender);
    setCharacterAge(legend.hero.age);
    setCharacterFeature(legend.hero.featuresAr);
    setActStructure({ ...legend.acts });
    setShowActControls(true);
    setCustomDialogueInput(`${legend.famousDialogue.speaker}: ${legend.famousDialogue.textAr}`);
    setCreationMode('ai');
    showToast(lang === 'ar' ? `✓ تم تطبيق سيناريو (${legend.titleAr}) في مولد القصة!` : `✓ Applied ${legend.titleEn} to generator!`);
  };

  // Instant load of the historical legend as a full 10s multi-scene active project
  const handleLoadLegendAsActiveProject = async (legend: HistoricalLegendScreenplay) => {
    const project = convertLegendToMovieProject(legend);
    setActiveProject(project);
    setConcept(legend.conceptAr);
    setGenre(legend.genreAr);
    setVisualStyle(legend.recommendedStyleEn);
    setProjectTitleInput(project.titleAr);
    await handleSaveCurrentProject(project, true);
    showToast(lang === 'ar' ? `✓ تم تحميل سيناريو (${legend.titleAr}) بنجاح إلى الاستوديو!` : `✓ Loaded ${legend.titleEn} into studio!`);
  };

  // Switch between branching path decisions and recalculate scene prompts dynamically
  const handleSelectStoryPath = async (pathId: string) => {
    if (!activeProject) return;
    const updated = applyStoryPathToMovieProject(activeProject, pathId);
    setActiveProject(updated);
    await handleSaveCurrentProject(updated, false);
    const chosen = updated.availablePaths?.find(p => p.id === pathId);
    showToast(
      lang === 'ar'
        ? `🧭 تم تفعيل مسار "${chosen?.nameAr || pathId}" وتحديث برومبتات المشاهد ونصوص السيناريو فورياً!`
        : `🧭 Activated path "${chosen?.nameEn || pathId}" and updated prompts dynamically!`
    );
  };

  // Load the historical legend into manual scene-by-scene editor
  const handleApplyLegendToManualMode = (legend: HistoricalLegendScreenplay) => {
    setCreationMode('manual');
    setManualTitle(legend.titleAr);
    setManualConcept(legend.conceptAr);
    setCharacterName(legend.hero.name);
    setCharacterGender(legend.hero.gender);
    setCharacterAge(legend.hero.age);
    setCharacterFeature(legend.hero.featuresAr);
    setVisualStyle(legend.recommendedStyleEn);
    setManualScenes(legend.readyScenes.map((sc, idx) => ({
      id: `manual_sc_${Date.now()}_${idx}`,
      titleAr: sc.titleAr,
      screenplayBeatAr: sc.dramaticActionAr || sc.screenplayBeatAr || '',
      dialogueSpeaker: sc.dialogueSpeaker || legend.hero.name,
      dialogueAr: sc.dialogueAr || '',
      dialogueEmotion: sc.dialogueEmotion || '',
      dialogueTiming: sc.dialogueTiming || '00:03 - 00:08',
      shotType: sc.shotType,
      cameraMotion: sc.cameraMotion
    })));
    showToast(lang === 'ar' ? `✓ تم فتح مشاهد (${legend.titleAr}) في المحرر اليدوي!` : `✓ Opened ${legend.titleEn} in manual editor!`);
  };

  // Select and apply a ready screenplay template
  const handleSelectTemplate = (tpl: ScreenplayTemplate) => {
    setSelectedTemplateId(tpl.id);
    setGenre(lang === 'ar' ? tpl.nameAr : tpl.nameEn);
    setVisualStyle(tpl.recommendedStyle);
    setActStructure({ ...tpl.acts });
    setShowActControls(true);

    // If current concept is empty or user hasn't typed their own, provide inspiring default
    if (!concept.trim()) {
      setConcept(lang === 'ar' ? tpl.defaultConceptAr : tpl.defaultConceptEn);
    }
    if (!characterFeature.trim() && tpl.suggestedHeroRoleAr) {
      setCharacterFeature(lang === 'ar' ? tpl.suggestedHeroRoleAr : tpl.suggestedHeroRoleEn);
    }

    showToast(
      lang === 'ar'
        ? `🎭 تم تطبيق قالب "${tpl.nameAr}" وهيكل الفصول الثلاثة بنجاح!`
        : `🎭 Applied template "${tpl.nameEn}" with 3-act structure!`
    );
  };

  // AI Smart 3-Act Suggestions using Gemini 3.8 Flash
  const handleSuggestActsWithAI = async () => {
    if (!concept.trim()) {
      showToast(lang === 'ar' ? 'يرجى كتابة فكرة الفيلم أولاً ليقترح الذكاء الاصطناعي فصولاً مخصصة لها.' : 'Please enter your movie idea first.', true);
      return;
    }

    setIsSuggestingActs(true);
    try {
      const response = await fetch('/api/cinema-suggest-acts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concept,
          genre,
          visualStyle,
          templateId: selectedTemplateId,
          characterName
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch AI act suggestions');
      }

      const data = await response.json();
      if (data.acts) {
        setActStructure(data.acts);
        setShowActControls(true);
        showToast(
          lang === 'ar'
            ? '✨ تم توليد هيكل الفصول الثلاثة المخصص لفكرتك بنجاح بواسطة Gemini 3.8 Flash!'
            : '✨ Generated custom 3-act screenplay structure using Gemini 3.8 Flash!'
        );
      }
    } catch (err: any) {
      console.warn('Error suggesting acts:', err);
      showToast(
        lang === 'ar' 
          ? 'تعذر الاتصال بخدمة الاقتراح، تم تفعيل الاقتراح المحلي الذكي.' 
          : 'Could not connect to AI service, applied local fallback.', 
        true
      );
    } finally {
      setIsSuggestingActs(false);
    }
  };

  // Preset Dialogue Suggestions or Fast AI Dialogue Extraction
  const handleSuggestDialoguePreset = async (presetType?: 'confrontation' | 'mystery' | 'triumph') => {
    const hero = characterName.trim() || (lang === 'ar' ? 'البطل' : 'Hero');
    if (presetType === 'confrontation') {
      setCustomDialogueInput(
        lang === 'ar'
          ? `${hero}: انتبه وركز معي.. أمر هذه المهمة أصبح بين أيدينا الآن ولا مجال للتراجع!\nالمساعد: المخاطر مرتفعة للغاية، لكن كل الأجهزة تحت السيطرة.\n${hero}: تحركوا بسرعة، سنواجه التحدي وجهاً لوجه دون تردد!`
          : `${hero}: Stay focused.. the fate of this mission is in our hands now!\nPartner: The stakes are high, but our systems are locked in.\n${hero}: Move swiftly, we face this challenge head-on!`
      );
      showToast(lang === 'ar' ? 'تم تطبيق نموذج حوار المواجهة والتحدي' : 'Applied confrontation dialogue preset');
      return;
    }
    if (presetType === 'mystery') {
      setCustomDialogueInput(
        lang === 'ar'
          ? `${hero}: انظر إلى هذه الإشارات، هذا النمط لم يُسجل في أي خريطة سابقة!\nالمستكشف: التاريخ هنا يخفي أسراراً لم يقترب منها أحد منذ قرون.\n${hero}: اقتربوا بحذر، اللغز بدأ ينكشف أمامنا!`
          : `${hero}: Look at these signals, this pattern was never mapped before!\nScout: History here hides secrets untouched for centuries.\n${hero}: Approach carefully, the mystery is unfolding!`
      );
      showToast(lang === 'ar' ? 'تم تطبيق نموذج حوار الاستكشاف والغموض' : 'Applied mystery dialogue preset');
      return;
    }
    if (presetType === 'triumph') {
      setCustomDialogueInput(
        lang === 'ar'
          ? `${hero}: لقد قطعنا كل هذه المسافة ولن ننسحب أبداً.. لحظة الحسم تبدأ الآن!\nالفريق: نحن خلفك حتى النهاية!\n${hero}: انظروا كيف انتصرت إرادتنا أمام كل الصعاب!`
          : `${hero}: We came too far to back down now.. the decisive moment starts now!\nTeam: We stand with you to the end!\n${hero}: See how our resolve conquered all odds!`
      );
      showToast(lang === 'ar' ? 'تم تطبيق نموذج حوار العزيمة والانتصار' : 'Applied triumph dialogue preset');
      return;
    }

    if (!concept.trim()) {
      showToast(lang === 'ar' ? 'يرجى كتابة فكرة الفيلم أولاً لاقتراح حوار مخصص لها.' : 'Please enter movie concept first.', true);
      return;
    }

    setIsGeneratingDialoguePreset(true);
    try {
      const res = await fetch('/api/cinema-generate-dialogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concept,
          characterName: characterName.trim() || 'البطل',
          genre,
          sceneNumber: 1,
          sceneBeat: 'افتتاحية الحوار والمواجهة'
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.dialogue?.dialogueAr) {
          const speaker = data.dialogue.speaker || characterName.trim() || 'البطل';
          setCustomDialogueInput(
            `${speaker}: ${data.dialogue.dialogueAr}\nالمساعد: تأكدت من الإحداثيات، نحن جاهزون تماماً للخطوة التالية!`
          );
          showToast(lang === 'ar' ? '✨ تم اقتراح حوار مخصص لفكرتك بنجاح!' : 'Suggested dynamic dialogue from your concept!');
        }
      }
    } catch (e) {
      console.warn('Dialogue preset suggestion err:', e);
    } finally {
      setIsGeneratingDialoguePreset(false);
    }
  };

  // Main Generation Handler
  const handleGenerateStory = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!concept.trim()) {
      showToast(lang === 'ar' ? 'يرجى كتابة فكرة الفيلم أولاً.' : 'Please enter your movie idea first.', true);
      return;
    }

    setIsGenerating(true);
    setIsPlaying(false);
    setActiveSceneIndex(0);
    setPlaybackSeconds(0);

    let projectPayload: MovieProject | null = null;
    let isFallbackGeneration = false;

    try {
      // 1. Attempt server generation with a resilient 65s client timeout controller
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 65000);

        const response = await fetch('/api/cinema-generate-story', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            concept,
            genre,
            visualStyle,
            targetAiModel,
            characterName,
            characterGender,
            characterAge,
            characterFeature,
            sceneCount,
            templateId: selectedTemplateId,
            actStructure,
            customDialogue: customDialogueInput
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          projectPayload = data.project || data;
          isFallbackGeneration = !!data.isFallback;
        }
      } catch (networkErr: any) {
        console.log('Backend response unavailable or client timed out, deploying instant local synthesis:', networkErr?.message);
      }

      // 2. If server response was not achieved, execute pristine local synthesis
      if (!projectPayload || !projectPayload.scenes || projectPayload.scenes.length === 0) {
        projectPayload = generateLocalMovieProject(
          concept,
          genre,
          visualStyle,
          targetAiModel,
          sceneCount,
          characterName,
          characterGender,
          characterAge,
          characterFeature,
          actStructure,
          customDialogueInput
        );
        isFallbackGeneration = true;
      }

      setActiveProject(projectPayload);
      setProjectTitleInput(projectPayload.titleAr || '');

      // Auto-save generated project
      await handleSaveCurrentProject(projectPayload, false);

      // Log to prompt history if handler provided
      if (onLogPrompt && projectPayload.scenes && projectPayload.scenes.length > 0) {
        onLogPrompt({
          originalText: `فكرة فيلم: ${concept}`,
          optimizedText: projectPayload.scenes[0].videoPromptEn,
          model: 'gemini',
          tone: 'سينمائي واحترافي',
          category: 'visual',
          actionType: 'generate',
          isFallback: isFallbackGeneration,
          tags: ['سينما AI', 'Screenplay', '10s Scene', 'Consistent Face', genre]
        });
      }

      showToast(
        lang === 'ar'
          ? `✨ تم بناء القصة والسيناريو وحفظ المشروع بنجاح (${projectPayload.scenes.length} مشاهد، كل مشهد 10 ثوانٍ)!`
          : `✨ Screenplay generated & saved successfully (${projectPayload.scenes.length} scenes, 10s each)!`
      );
    } catch (err: any) {
      console.log('Cinema Generation completed safely:', err?.message || 'ok');
      // Even if everything else fails, ensure project is safely populated
      const emergencyProject = generateLocalMovieProject(
        concept,
        genre,
        visualStyle,
        targetAiModel,
        sceneCount,
        characterName,
        characterGender,
        characterAge,
        characterFeature,
        actStructure,
        customDialogueInput
      );
      setActiveProject(emergencyProject);
      setProjectTitleInput(emergencyProject.titleAr || '');
      await handleSaveCurrentProject(emergencyProject, false);
      showToast(
        lang === 'ar' 
          ? `✓ تم توليد القصة وسيناريو المشاهد بنجاح (${emergencyProject.scenes.length} مشاهد)!` 
          : `✓ Generated screenplay successfully (${emergencyProject.scenes.length} scenes)!`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // 10-Second Playback Simulator Loop
  useEffect(() => {
    let interval: any = null;
    if (isPlaying && activeProject && activeProject.scenes.length > 0) {
      interval = setInterval(() => {
        setPlaybackSeconds((prev) => {
          const next = prev + 1;
          const currentSceneIdx = Math.floor(next / 10);
          if (currentSceneIdx >= activeProject.scenes.length) {
            // Loop finished
            setIsPlaying(false);
            setActiveSceneIndex(0);
            return 0;
          }
          setActiveSceneIndex(currentSceneIdx);
          return next;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, activeProject]);

  // Copy scene video prompt
  const handleCopyPrompt = (promptText: string, index: number) => {
    navigator.clipboard.writeText(appendSiteUrlToPrompt(promptText));
    setCopiedIndex(index);
    showToast(lang === 'ar' ? '✓ تم نسخ برومبت المشهد الشامل (10 ثوانٍ مع السيناريو والحوار)!' : '✓ Complete 10s Video prompt copied (screenplay + dialogue included)!');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Copy spoken dialogue line only (for ElevenLabs or TTS)
  const handleCopyDialogue = (dialogueText: string, index: number) => {
    if (!dialogueText) return;
    navigator.clipboard.writeText(dialogueText);
    setCopiedDialogueIndex(index);
    showToast(lang === 'ar' ? '✓ تم نسخ نص الحوار الصوتي المنطوق لأدوات الصوت!' : '✓ Spoken character dialogue copied!');
    setTimeout(() => setCopiedDialogueIndex(null), 2000);
  };

  // Regenerate dialogue for a specific scene strictly based on the story idea
  const handleRegenerateSceneDialogue = async (sceneIndex: number) => {
    if (!activeProject || !activeProject.scenes[sceneIndex]) return;
    const targetScene = activeProject.scenes[sceneIndex];
    setRegeneratingDialogueIndex(sceneIndex);

    try {
      const response = await fetch('/api/cinema-generate-dialogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concept: activeProject.concept || concept,
          sceneNumber: sceneIndex + 1,
          sceneBeat: targetScene.screenplayBeatAr || targetScene.dramaticActionAr,
          characterName: targetScene.dialogueSpeaker || activeProject.characterAnchor?.name,
          genre: activeProject.genre,
          actPhase: targetScene.actPhase || 'act1'
        })
      });

      if (!response.ok) throw new Error('Failed to generate dialogue');
      const data = await response.json();
      const dial = data.dialogue;

      if (dial && dial.dialogueAr) {
        const updatedScenes = [...activeProject.scenes];
        const oldScene = updatedScenes[sceneIndex];
        const speaker = dial.speaker || oldScene.dialogueSpeaker || activeProject.characterAnchor?.name || 'البطل';
        const timing = dial.timing || oldScene.dialogueTiming || '00:03 - 00:08';
        const emotion = dial.emotion || oldScene.dialogueEmotion || 'نبرة مؤثرة وحاسمة';

        let newPrompt = oldScene.videoPromptEn;
        const lipSyncRegex = /\[CHARACTER SPOKEN DIALOGUE & LIP-SYNC\]:[^\[]*/gi;
        const newLipSyncSnippet = `[CHARACTER SPOKEN DIALOGUE & LIP-SYNC]: ${speaker} speaks (${emotion}) at ${timing}: "${dial.dialogueAr}" ("${dial.dialogueEn || ''}"), synchronized natural mouth and lip movement, authentic facial expression. `;

        if (lipSyncRegex.test(newPrompt)) {
          newPrompt = newPrompt.replace(lipSyncRegex, newLipSyncSnippet);
        } else {
          newPrompt = `${newPrompt} ${newLipSyncSnippet}`;
        }

        updatedScenes[sceneIndex] = {
          ...oldScene,
          dialogueAr: dial.dialogueAr,
          dialogueEn: dial.dialogueEn || oldScene.dialogueEn,
          dialogueEmotion: emotion,
          dialogueTiming: timing,
          dialogueSpeaker: speaker,
          videoPromptEn: appendSiteUrlToPrompt(newPrompt)
        };

        const updatedProject: MovieProject = {
          ...activeProject,
          scenes: updatedScenes,
          updatedAt: new Date().toISOString()
        };

        setActiveProject(updatedProject);
        await handleSaveCurrentProject(updatedProject, false);
        showToast(
          lang === 'ar'
            ? `✨ تم توليد حوار ذكي مخصص للمشهد ${sceneIndex + 1} نابع من الفكرة!`
            : `✨ Custom AI dialogue generated for Scene ${sceneIndex + 1}!`
        );
      }
    } catch (err: any) {
      console.warn('Dialogue regeneration error:', err);
      showToast(lang === 'ar' ? 'تعذر توليد الحوار بالذكاء الاصطناعي.' : 'Failed to generate dialogue.', true);
    } finally {
      setRegeneratingDialogueIndex(null);
    }
  };

  // Generate dialogue for the scene currently being edited in modal
  const handleGenerateModalDialogue = async () => {
    if (!activeProject || !editingScene) return;
    setIsModalGeneratingDialogue(true);
    try {
      const response = await fetch('/api/cinema-generate-dialogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concept: activeProject.concept || concept,
          sceneNumber: editingScene.index + 1,
          sceneBeat: editingScene.scene.screenplayBeatAr || editingScene.scene.dramaticActionAr,
          characterName: editingScene.scene.dialogueSpeaker || activeProject.characterAnchor?.name,
          genre: activeProject.genre,
          actPhase: editingScene.scene.actPhase || 'act1'
        })
      });
      if (!response.ok) throw new Error('Failed to generate dialogue');
      const data = await response.json();
      const dial = data.dialogue;
      if (dial && dial.dialogueAr) {
        setEditingScene({
          ...editingScene,
          scene: {
            ...editingScene.scene,
            dialogueAr: dial.dialogueAr,
            dialogueEn: dial.dialogueEn || editingScene.scene.dialogueEn,
            dialogueEmotion: dial.emotion || editingScene.scene.dialogueEmotion || 'نبرة مؤثرة وحاسمة',
            dialogueTiming: dial.timing || editingScene.scene.dialogueTiming || '00:03 - 00:08',
            dialogueSpeaker: dial.speaker || editingScene.scene.dialogueSpeaker || 'البطل'
          }
        });
        showToast(lang === 'ar' ? '✨ تم توليد حوار ذكي مخصص من الفكرة بنجاح!' : '✨ Generated tailored AI dialogue!');
      }
    } catch (err) {
      showToast(lang === 'ar' ? 'تعذر توليد الحوار.' : 'Failed to generate dialogue.', true);
    } finally {
      setIsModalGeneratingDialogue(false);
    }
  };

  // Fetch contextual dialogue suggestions & alternative phrasings based on scene nature
  const handleFetchDialogueContextSuggestions = async (
    targetId: string,
    currentDialogue: string,
    sceneContext: {
      sceneTitle?: string;
      sceneBeat?: string;
      speakerName?: string;
      dialogueEmotion?: string;
      genre?: string;
      actPhase?: string;
      concept?: string;
    }
  ) => {
    setContextSuggestionsTarget(targetId);
    setIsFetchingContextSuggestions(true);
    try {
      const response = await fetch('/api/cinema-suggest-dialogue-context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentDialogue,
          sceneContext: {
            sceneTitle: sceneContext.sceneTitle || '',
            sceneBeat: sceneContext.sceneBeat || '',
            speakerName: sceneContext.speakerName || characterName || 'البطل',
            dialogueEmotion: sceneContext.dialogueEmotion || '',
            genre: sceneContext.genre || genre || activeProject?.genre || 'دراما وإثارة',
            actPhase: sceneContext.actPhase || 'act1',
            concept: sceneContext.concept || manualConcept || concept || activeProject?.concept || ''
          }
        })
      });

      if (!response.ok) throw new Error('Failed to fetch contextual dialogue suggestions');
      const data = await response.json();
      if (data.suggestions && data.suggestions.length > 0) {
        setContextSuggestionsData({
          targetId,
          original: currentDialogue,
          sceneNatureSummary: data.sceneNatureSummary || '',
          suggestions: data.suggestions
        });
        showToast(lang === 'ar' ? '✨ تم استخراج اقتراحات السياق والصيغ البديلة!' : '✨ Contextual dialogue suggestions generated!');
      }
    } catch (err) {
      console.warn('Error fetching dialogue context suggestions:', err);
      showToast(lang === 'ar' ? 'تعذر جلب اقتراحات السياق.' : 'Could not fetch context suggestions.', true);
    } finally {
      setIsFetchingContextSuggestions(false);
    }
  };

  // Apply chosen contextual suggestion to target
  const handleApplyContextSuggestion = (targetId: string, suggestion: DialogueContextSuggestion) => {
    if (targetId.startsWith('scene_card_') && activeProject) {
      const idx = parseInt(targetId.replace('scene_card_', ''), 10);
      const targetScene = activeProject.scenes[idx];
      if (targetScene) {
        const refinedScene = refineSceneWithLocalAi(
          targetScene,
          suggestion.dialogueAr,
          {
            newDialogueEn: suggestion.dialogueEn,
            newEmotion: suggestion.emotionAr,
            characterAnchor: activeProject.characterAnchor,
            visualStyle: activeProject.visualStyle,
            targetAiModel: activeProject.targetAiModel
          }
        );
        const updatedScenes = [...activeProject.scenes];
        updatedScenes[idx] = refinedScene;
        const updatedProject: MovieProject = {
          ...activeProject,
          scenes: updatedScenes,
          updatedAt: new Date().toISOString()
        };
        setActiveProject(updatedProject);
        handleSaveCurrentProject(updatedProject);
        setContextSuggestionsData(null);
        showToast(
          lang === 'ar' 
            ? `✓ تم تطبيق صيغة (${suggestion.styleLabelAr}) وإعادة تصميم المشهد والبرومبت محلياً!` 
            : `✓ Applied ${suggestion.styleLabelEn} & refined scene with local AI!`
        );
      }
    } else if (targetId === 'modal' && editingScene) {
      setEditingScene({
        ...editingScene,
        scene: {
          ...editingScene.scene,
          dialogueAr: suggestion.dialogueAr,
          dialogueEn: suggestion.dialogueEn || editingScene.scene.dialogueEn,
          dialogueEmotion: suggestion.emotionAr || editingScene.scene.dialogueEmotion
        }
      });
      showToast(lang === 'ar' ? `✓ تم تطبيق صيغة (${suggestion.styleLabelAr}) بنجاح!` : `✓ Applied ${suggestion.styleLabelEn}!`);
    } else if (targetId === 'custom_input') {
      setCustomDialogueInput(suggestion.dialogueAr);
      showToast(lang === 'ar' ? `✓ تم تطبيق صيغة (${suggestion.styleLabelAr}) في الحوار المسبق!` : `✓ Applied dialogue!`);
    } else {
      // Manual Scene by id
      setManualScenes(prev => prev.map(sc => {
        if (sc.id === targetId) {
          return {
            ...sc,
            dialogueAr: suggestion.dialogueAr,
            dialogueEmotion: suggestion.emotionAr || sc.dialogueEmotion
          };
        }
        return sc;
      }));
      showToast(lang === 'ar' ? `✓ تم تطبيق صيغة (${suggestion.styleLabelAr}) في المشهد!` : `✓ Applied ${suggestion.styleLabelEn}!`);
    }
  };

  // Direct interactive dialogue change in scene card with local AI re-engineering
  const handleInlineSceneDialogueChange = (sceneIdx: number, newText: string) => {
    if (!activeProject || !activeProject.scenes[sceneIdx]) return;
    const targetScene = activeProject.scenes[sceneIdx];
    const refinedScene = refineSceneWithLocalAi(
      targetScene,
      newText,
      {
        characterAnchor: activeProject.characterAnchor,
        visualStyle: activeProject.visualStyle,
        targetAiModel: activeProject.targetAiModel
      }
    );
    const updatedScenes = [...activeProject.scenes];
    updatedScenes[sceneIdx] = refinedScene;
    const updatedProject: MovieProject = {
      ...activeProject,
      scenes: updatedScenes,
      updatedAt: new Date().toISOString()
    };
    setActiveProject(updatedProject);
    handleSaveCurrentProject(updatedProject);
  };

  // Trigger contextual smart suggestions powered by Local AI & server
  const handleOpenSmartDialogueSuggestions = (idx: number, scene: CinemaScene) => {
    const targetId = `scene_card_${idx}`;
    if (contextSuggestionsData && contextSuggestionsData.targetId === targetId) {
      setContextSuggestionsData(null);
      return;
    }

    // Instantly populate with local AI stylist for zero latency
    const localSuggestions = generateLocalDialogueSuggestions(
      scene.dialogueAr || '',
      {
        sceneBeat: scene.screenplayBeatAr || scene.dramaticActionAr,
        sceneTitle: scene.titleAr,
        speakerName: scene.dialogueSpeaker || activeProject?.characterAnchor?.name || 'البطل',
        genre: activeProject?.genre,
        actPhase: scene.actPhase,
        concept: activeProject?.concept
      }
    );

    setContextSuggestionsData({
      targetId,
      original: scene.dialogueAr || '',
      sceneNatureSummary: `${scene.titleAr} (${lang === 'ar' ? 'المشهد ' + (idx + 1) : 'Scene ' + (idx + 1)})`,
      suggestions: localSuggestions
    });

    // Also fetch contextual refinements from backend if online
    handleFetchDialogueContextSuggestions(
      targetId,
      scene.dialogueAr || '',
      {
        sceneTitle: scene.titleAr,
        sceneBeat: scene.screenplayBeatAr || scene.dramaticActionAr,
        speakerName: scene.dialogueSpeaker || activeProject?.characterAnchor?.name || 'البطل',
        dialogueEmotion: scene.dialogueEmotion,
        genre: activeProject?.genre,
        actPhase: scene.actPhase,
        concept: activeProject?.concept
      }
    );
  };

  // Copy screenplay narrative action beat only
  const handleCopyAction = (actionText: string, index: number) => {
    if (!actionText) return;
    navigator.clipboard.writeText(actionText);
    setCopiedActionIndex(index);
    showToast(lang === 'ar' ? '✓ تم نسخ نص السيناريو والحدث الدرامي!' : '✓ Screenplay action beat copied!');
    setTimeout(() => setCopiedActionIndex(null), 2000);
  };

  // Copy master consistency token
  const handleCopyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(true);
    showToast(lang === 'ar' ? '✓ تم نسخ رمز تثبيت ملامح الوجه الماستر!' : '✓ Face consistency master token copied!');
    setTimeout(() => setCopiedToken(false), 2000);
  };

  // Copy all video prompts in the movie sequence together
  const handleCopyAllPrompts = (format: 'full' | 'prompts_only' = 'full') => {
    if (!activeProject || !activeProject.scenes || activeProject.scenes.length === 0) {
      showToast(lang === 'ar' ? 'لا توجد مشاهد لنسخها حالياً.' : 'No scenes available to copy.', true);
      return;
    }

    if (format === 'prompts_only') {
      // Just the prompt texts separated by double newlines for easy batch queuing in AI video platforms
      const text = activeProject.scenes
        .map((s, idx) => `// ${getEnglishOrdinal(s.sceneNumber || idx + 1)} (${s.timeRange} - 10s)\n${s.videoPromptEn}`)
        .join('\n\n');
      navigator.clipboard.writeText(appendSiteUrlToPrompt(text));
      setCopiedAllCleanPrompts(true);
      showToast(
        lang === 'ar' 
          ? `✓ تم نسخ أوامر الفيديو بالإنجليزية لجميع المشاهد (${activeProject.scenes.length} مشاهد) بنجاح!` 
          : `✓ All ${activeProject.scenes.length} video generation prompts copied!`
      );
      setTimeout(() => setCopiedAllCleanPrompts(false), 2500);
      return;
    }

    // Full structured movie series package with scene titles, timestamps, lip-sync cues, and video prompts
    let output = `# 🎬 ${activeProject.titleAr} (${activeProject.titleEn})\n`;
    output += `# Model: ${activeProject.targetAiModel} | Style: ${activeProject.visualStyle} | Total Duration: ${activeProject.totalDurationSeconds}s (${activeProject.scenes.length} Scenes × 10s)\n`;
    output += `# Logline: ${activeProject.loglineAr}\n\n`;

    if (activeProject.characterAnchor?.consistencyPromptToken) {
      output += `### 🔒 [Master Character Face Anchor]:\n${activeProject.characterAnchor.consistencyPromptToken}\n\n---\n\n`;
    }

    activeProject.scenes.forEach((s, idx) => {
      const arabicOrdinal = getArabicOrdinal(s.sceneNumber || idx + 1);
      const englishOrdinal = getEnglishOrdinal(s.sceneNumber || idx + 1);
      output += `========================================\n`;
      output += `🎥 ${arabicOrdinal} (${englishOrdinal}) | ⏱️ ${s.timeRange} (10s)\n`;
      output += `العنوان: ${s.titleAr} (${s.titleEn})\n`;
      output += `اللقطة والكاميرا: ${s.shotType} | ${s.cameraMotion}\n`;
      output += `الحدث السينمائي: ${s.screenplayBeatAr || s.dramaticActionAr}\n`;
      if (s.dialogueAr || s.dialogueEn) {
        output += `الحوار المنطوق: "${s.dialogueAr || ''}" ("${s.dialogueEn || ''}") [${s.dialogueEmotion || ''} - ${s.dialogueTiming || s.timeRange}]\n`;
      }
      output += `\n🚀 أمر الفيديو (Prompt for ${activeProject.targetAiModel}):\n`;
      output += `${s.videoPromptEn}\n\n`;
    });

    navigator.clipboard.writeText(appendSiteUrlToPrompt(output.trim()));
    setCopiedAllPrompts(true);
    showToast(
      lang === 'ar' 
        ? `✓ تم نسخ جميع برومبتات سلسلة الفيلم (${activeProject.scenes.length} مشاهد كاملة) بنجاح!` 
        : `✓ All ${activeProject.scenes.length} movie sequence prompts copied successfully!`
    );
    setTimeout(() => setCopiedAllPrompts(false), 2500);
  };

  // Export screenplay as Markdown (Standard industry screenplay format)
  const handleExportMarkdown = () => {
    if (!activeProject) return;
    let md = `# 🎬 ${activeProject.titleAr} (${activeProject.titleEn})\n\n`;
    md += `**النوع / Genre:** ${activeProject.genre} | **الأسلوب البصري / Visual Style:** ${activeProject.visualStyle}\n`;
    md += `**نموذج الفيديو المستهدف / Target Video AI:** ${activeProject.targetAiModel}\n`;
    md += `**المدة الإجمالية / Total Duration:** ${activeProject.totalDurationSeconds} ثانية (${activeProject.scenes.length} مشاهد × 10 ثوانٍ)\n\n`;
    md += `## 📜 الملخص السريع (Logline)\n- **بالعربية:** ${activeProject.loglineAr}\n- **English:** ${activeProject.loglineEn}\n\n`;
    md += `## 📖 قصة الفيلم والمسار الدرامي (Synopsis)\n${activeProject.storySynopsisAr}\n\n${activeProject.storySynopsisEn}\n\n`;
    md += `## 🔒 رمز تثبيت ملامح الوجه والشخصية الموحد (Master Face Consistency Anchor)\n\`\`\`\n${activeProject.characterAnchor.consistencyPromptToken}\n\`\`\`\n`;
    md += `- **البطل:** ${activeProject.characterAnchor.name} (${activeProject.characterAnchor.gender || 'ذكر'}، ${activeProject.characterAnchor.age || '34'} عاماً)\n`;
    md += `- **تفاصيل الملامح والتشريح:** ${activeProject.characterAnchor.faceDescriptionAr}\n`;
    md += `- **Anatomical Face Details:** ${activeProject.characterAnchor.faceDescriptionEn}\n\n`;
    md += `## 🎞️ نصوص السيناريو والحوارات وبرومبتات الفيديو (Screenplay & 10s Prompts)\n\n`;

    activeProject.scenes.forEach((s) => {
      const arabicOrdinal = getArabicOrdinal(s.sceneNumber);
      const englishOrdinal = getEnglishOrdinal(s.sceneNumber);
      const slug = s.screenplaySlug || `${arabicOrdinal}: لقطة سينمائية (${s.timeRange})`;
      md += `### 🎬 ${arabicOrdinal} (${englishOrdinal}) | ${s.timeRange}\n\n`;
      md += `**ترويسة المشهد (Slugline):** ${slug}\n`;
      md += `**العنوان:** ${s.titleAr} (${s.titleEn})\n`;
      md += `**توقيت اللقطة:** ${s.timeRange} (10 ثوانٍ)\n`;
      md += `**نوع اللقطة والكاميرا:** ${s.shotType} | ${s.cameraMotion} (شدة الحركة: ${s.motionIntensity || 5}/10)\n\n`;
      
      md += `**🎬 نَص السيناريو والحدث الدرامي (Scene Action):**\n`;
      md += `${s.screenplayBeatAr || s.dramaticActionAr}\n`;
      if (s.screenplayBeatEn) {
        md += `*${s.screenplayBeatEn}*\n`;
      }
      md += `\n`;

      if (s.dialogueAr || s.dialogueEn) {
        const speaker = s.dialogueSpeaker || activeProject.characterAnchor?.name || 'الشخصية';
        const emotion = s.dialogueEmotion ? ` (${s.dialogueEmotion})` : '';
        const timing = s.dialogueTiming ? ` [⏱️ ${s.dialogueTiming}]` : '';
        md += `**💬 الحوار المنطوق وحركة الشفاه (Character Dialogue & Lip-Sync):**\n`;
        md += `> **${speaker}${emotion}${timing}:**\n`;
        if (s.dialogueAr) md += `> "${s.dialogueAr}"\n`;
        if (s.dialogueEn) md += `> *("${s.dialogueEn}")*\n\n`;
      }

      if (s.soundDesign) {
        md += `**🔊 هندسة الصوت والمؤثرات الصوتية (Sound Design):** ${s.soundDesign}\n\n`;
      }

      md += `**🚀 برومبت الفيديو الشامل للتوليد (AI Video Prompt for ${activeProject.targetAiModel}):**\n\`\`\`\n${s.videoPromptEn}\n\`\`\`\n\n`;
      md += `---\n\n`;
    });

    md += `\n*تمت هندسة السيناريو السينمائي وبرومبتات الفيديو عبر منصة ArabPrompt Cinema Studio: https://arabiprompt.ai.studio*`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeProject.titleAr.replace(/\s+/g, '_')}_Screenplay_Dialogue_10s.md`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(lang === 'ar' ? '✓ تم تصدير السيناريو الكامل مع الحوارات بصيغة Markdown!' : '✓ Complete screenplay & dialogue exported as Markdown!');
  };

  // Generate structured plain text of the entire screenplay (.txt)
  const getScreenplayPlainText = (project: MovieProject): string => {
    let text = `================================================================================\n`;
    text += `🎬 ${project.titleAr} (${project.titleEn})\n`;
    text += `================================================================================\n\n`;
    text += `النوع السينمائي: ${project.genre}\n`;
    text += `الأسلوب البصري: ${project.visualStyle}\n`;
    text += `منصة الفيديو المستهدفة: ${project.targetAiModel}\n`;
    text += `المدة الإجمالية: ${project.totalDurationSeconds} ثانية (${project.scenes.length} مشاهد × 10 ثوانٍ)\n`;
    text += `تاريخ الإنشاء: ${new Date(project.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')}\n\n`;

    text += `--------------------------------------------------------------------------------\n`;
    text += `📜 الفكرة المركزية (Logline):\n`;
    text += `--------------------------------------------------------------------------------\n`;
    text += `${project.loglineAr}\n\n`;
    if (project.loglineEn) {
      text += `[English Logline]: ${project.loglineEn}\n\n`;
    }

    text += `--------------------------------------------------------------------------------\n`;
    text += `📖 ملخص القصة والمسار الدرامي (Story Synopsis):\n`;
    text += `--------------------------------------------------------------------------------\n`;
    text += `${project.storySynopsisAr}\n\n`;
    if (project.storySynopsisEn) {
      text += `[English Synopsis]: ${project.storySynopsisEn}\n\n`;
    }

    if (project.characterAnchor) {
      text += `--------------------------------------------------------------------------------\n`;
      text += `🔒 مثبت ملامح الوجه والشخصية الموحد (Consistent Character Face Anchor):\n`;
      text += `--------------------------------------------------------------------------------\n`;
      text += `• اسم البطل: ${project.characterAnchor.name} (${project.characterAnchor.gender || 'ذكر'}، ${project.characterAnchor.age || '32'} عاماً)\n`;
      text += `• الدور: ${project.characterAnchor.role}\n`;
      text += `• تفاصيل الملامح: ${project.characterAnchor.faceDescriptionAr}\n`;
      text += `• رمز الذكاء الاصطناعي الماستر:\n${project.characterAnchor.consistencyPromptToken}\n\n`;
    }

    text += `================================================================================\n`;
    text += `🎞️ مشاهد السيناريو والأحداث والحوارات (10 ثوانٍ لكل مشهد)\n`;
    text += `================================================================================\n\n`;

    project.scenes.forEach((s, idx) => {
      const arOrd = getArabicOrdinal(s.sceneNumber || idx + 1);
      const enOrd = getEnglishOrdinal(s.sceneNumber || idx + 1);
      const phaseLabel = s.actLabelAr ? ` [${s.actLabelAr}]` : '';

      text += `--------------------------------------------------------------------------------\n`;
      text += `🎥 ${arOrd} (${enOrd}) | ⏱️ ${s.timeRange} (10s)${phaseLabel}\n`;
      text += `--------------------------------------------------------------------------------\n`;
      text += `العنوان: ${s.titleAr} (${s.titleEn})\n`;
      text += `ترويسة اللقطة (Slugline): ${s.screenplaySlug || `${arOrd}: لقطة سينمائية [${s.timeRange}]`}\n`;
      text += `نوع اللقطة والكاميرا: ${s.shotType} | ${s.cameraMotion} (شدة الحركة: ${s.motionIntensity || 5}/10)\n\n`;

      text += `[🎬 أحداث المشهد والحركة السينمائية]:\n`;
      text += `${s.screenplayBeatAr || s.dramaticActionAr}\n`;
      if (s.screenplayBeatEn) {
        text += `(English): ${s.screenplayBeatEn}\n`;
      }
      text += `\n`;

      if (s.dialogueAr || s.dialogueEn) {
        const speaker = s.dialogueSpeaker || project.characterAnchor?.name || 'البطل';
        const emo = s.dialogueEmotion ? ` (${s.dialogueEmotion})` : '';
        const time = s.dialogueTiming ? ` [${s.dialogueTiming}]` : '';
        text += `[💬 الحوار المنطوق وتزامن حركة الشفاه - Lip-Sync]:\n`;
        text += `> ${speaker}${emo}${time}:\n`;
        if (s.dialogueAr) text += `  "${s.dialogueAr}"\n`;
        if (s.dialogueEn) text += `  "${s.dialogueEn}"\n`;
        text += `\n`;
      }

      if (s.soundDesign) {
        text += `[🔊 هندسة الصوت والمؤثرات]: ${s.soundDesign}\n\n`;
      }

      text += `[🚀 أمر توليد الفيديو - Prompt for ${project.targetAiModel}]:\n`;
      text += `${s.videoPromptEn}\n\n\n`;
    });

    text += `================================================================================\n`;
    text += `تمت صياغة السيناريو عبر منصة ArabPrompt Cinema Studio: https://arabiprompt.ai.studio\n`;
    text += `================================================================================\n`;

    return text;
  };

  // Export screenplay as plain Text File (.txt)
  const handleExportTextFile = () => {
    if (!activeProject) return;
    const content = getScreenplayPlainText(activeProject);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeTitle = (activeProject.titleAr || 'سيناريو_فيلم').replace(/[/\\?%*:|"<>]/g, '_').replace(/\s+/g, '_');
    link.href = url;
    link.download = `${safeTitle}_سيناريو_وحوار.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(lang === 'ar' ? '📄 تم تصدير وتحميل ملف السيناريو النصي (Text File) بنجاح!' : '📄 Screenplay text file (.txt) downloaded!');
  };

  // Open Screenplay Export Modal (PDF / Text Preview & Export)
  const handleOpenExportModal = () => {
    if (!activeProject) return;
    setIsExportModalOpen(true);
  };

  // Trigger Print & Save as PDF
  const handlePrintPdf = () => {
    if (!activeProject) return;
    setIsExportModalOpen(true);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // Share Movie Sequence with unique link
  const handleOpenShareModal = async () => {
    if (!activeProject || !activeProject.scenes || activeProject.scenes.length === 0) {
      showToast(lang === 'ar' ? '⚠️ يرجى توليد مشاهد الفيلم أولاً قبل المشاركة.' : '⚠️ Please generate movie scenes first.', true);
      return;
    }

    setIsSharing(true);
    try {
      const shareId = `movie_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
      const title = activeProject.titleAr || activeProject.titleEn || concept.slice(0, 45) || (lang === 'ar' ? 'سلسلة فيلم سينمائي' : 'Cinema Movie Sequence');

      const sharePayload = {
        id: shareId,
        type: 'cinema' as const,
        title,
        concept: activeProject.concept || concept,
        anchorStyle: activeProject.visualStyle,
        scenes: activeProject.scenes,
        characterAnchor: activeProject.characterAnchor,
        authorName: user?.displayName || undefined,
        movieProject: activeProject
      };

      await createSharedSequence(sharePayload);

      const currentUrl = new URL(window.location.origin + window.location.pathname);
      currentUrl.searchParams.set('tab', 'cinema');
      currentUrl.searchParams.set('movie_seq', shareId);

      setShareUrl(currentUrl.toString());
      setIsShareModalOpen(true);
    } catch (e) {
      console.error('Error sharing movie sequence:', e);
      try {
        const hash = encodeSequenceToHash(activeProject);
        const fallbackUrl = new URL(window.location.origin + window.location.pathname);
        fallbackUrl.searchParams.set('tab', 'cinema');
        fallbackUrl.searchParams.set('smovie', hash);
        setShareUrl(fallbackUrl.toString());
        setIsShareModalOpen(true);
      } catch {
        showToast(lang === 'ar' ? 'تعذر توليد رابط المشاركة.' : 'Could not create share link.', true);
      }
    } finally {
      setIsSharing(false);
    }
  };

  // Open Add Scene Authoring Modal (Manual Screenplay & Spoken Dialogue or AI Co-Director)
  const handleAddNewScene = () => {
    if (!activeProject) return;
    setIsAddSceneModalOpen(true);
  };

  // Confirm and insert newly authored scene into timeline
  const handleConfirmAddScene = (newScene: CinemaScene) => {
    if (!activeProject) return;
    const updatedScenes = [...activeProject.scenes, newScene];
    const updatedProject: MovieProject = {
      ...activeProject,
      scenes: updatedScenes,
      totalDurationSeconds: updatedScenes.length * 10,
      updatedAt: new Date().toISOString()
    };

    handleSaveCurrentProject(updatedProject);
    const arabicOrdinal = getArabicOrdinal(newScene.sceneNumber);
    showToast(
      lang === 'ar' 
        ? `✓ تمت إضافة ${arabicOrdinal} إلى تسلسل الفيلم بنجاح (10s مع السيناريو والحوار المصمم)!` 
        : `✓ Added scene #${newScene.sceneNumber} to movie timeline successfully (10s)!`
    );
  };

  // Delete scene
  const handleDeleteScene = (idxToDelete: number) => {
    if (!activeProject || activeProject.scenes.length <= 1) {
      showToast(lang === 'ar' ? 'يجب أن يحتوي السيناريو على مشهد واحد على الأقل.' : 'Must have at least one scene.', true);
      return;
    }

    const filtered = activeProject.scenes.filter((_, idx) => idx !== idxToDelete);
    // Recalculate timestamps
    const reindexed = filtered.map((s, idx) => {
      const startSec = idx * 10;
      const endSec = (idx + 1) * 10;
      const startMinStr = String(Math.floor(startSec / 60)).padStart(2, '0');
      const startSecStr = String(startSec % 60).padStart(2, '0');
      const endMinStr = String(Math.floor(endSec / 60)).padStart(2, '0');
      const endSecStr = String(endSec % 60).padStart(2, '0');
      return {
        ...s,
        sceneNumber: idx + 1,
        timeRange: `${startMinStr}:${startSecStr} - ${endMinStr}:${endSecStr}`
      };
    });

    const updatedProject: MovieProject = {
      ...activeProject,
      scenes: reindexed,
      totalDurationSeconds: reindexed.length * 10,
      updatedAt: new Date().toISOString()
    };

    handleSaveCurrentProject(updatedProject);
    showToast(lang === 'ar' ? 'تم حذف المشهد وتحديث التوقيت.' : 'Scene deleted.');
  };

  // Save edited scene
  const handleSaveEditedScene = () => {
    if (!activeProject || !editingScene) return;
    const target = editingScene.scene;
    const speaker = target.dialogueSpeaker || activeProject.characterAnchor?.name || 'البطل';
    const timing = target.dialogueTiming || '00:03 - 00:08';
    const emotion = target.dialogueEmotion || 'نبرة مؤثرة وحاسمة';
    const dialAr = target.dialogueAr || '';
    const dialEn = target.dialogueEn || '';
    const actionAr = target.screenplayBeatAr || target.dramaticActionAr || '';
    const actionEn = target.screenplayBeatEn || actionAr;
    const token = activeProject.characterAnchor?.consistencyPromptToken || '';
    const shot = target.shotType || 'Cinematic Shot';
    const motion = target.cameraMotion || 'Smooth Camera Motion';

    let updatedPrompt = target.videoPromptEn || '';
    if (!updatedPrompt || updatedPrompt.length < 30) {
      updatedPrompt = `${token} Scene ${editingScene.index + 1} (${target.timeRange}, 10s duration). [SCREENPLAY ACTION]: ${shot}, ${motion}. ${actionEn}. [CHARACTER SPOKEN DIALOGUE & LIP-SYNC]: ${speaker} speaks (${emotion}) at ${timing}: "${dialAr}" ("${dialEn}"), synchronized natural mouth and lip movement, authentic facial expression. [CINEMATOGRAPHY]: ${activeProject.visualStyle}, 8k photorealistic, optimized for ${activeProject.targetAiModel}.`;
    } else {
      const lipSyncRegex = /\[CHARACTER SPOKEN DIALOGUE & LIP-SYNC\]:[^\[]*/gi;
      const newLipSync = `[CHARACTER SPOKEN DIALOGUE & LIP-SYNC]: ${speaker} speaks (${emotion}) at ${timing}: "${dialAr}" ("${dialEn}"), synchronized natural mouth and lip movement, authentic facial expression. `;
      if (lipSyncRegex.test(updatedPrompt)) {
        updatedPrompt = updatedPrompt.replace(lipSyncRegex, newLipSync);
      } else if (dialAr) {
        updatedPrompt = `${updatedPrompt} ${newLipSync}`;
      }
    }

    const sceneToSave = {
      ...target,
      videoPromptEn: appendSiteUrlToPrompt(updatedPrompt)
    };

    const updatedScenes = [...activeProject.scenes];
    updatedScenes[editingScene.index] = sceneToSave;

    const updatedProject: MovieProject = {
      ...activeProject,
      scenes: updatedScenes,
      updatedAt: new Date().toISOString()
    };

    handleSaveCurrentProject(updatedProject);
    setEditingScene(null);
    showToast(lang === 'ar' ? '✓ تم تحديث السيناريو والحوار وبرومبت المشهد بنجاح.' : '✓ Scene screenplay & dialogue updated.');
  };

  // Manual Mode: Add a new manual scene draft
  const handleAddManualScene = () => {
    const nextIdx = manualScenes.length + 1;
    const arabicOrd = getArabicOrdinal(nextIdx);
    setManualScenes([
      ...manualScenes,
      {
        id: `mscene_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        titleAr: `${arabicOrd}: مشهد جديد`,
        screenplayBeatAr: '',
        dialogueSpeaker: characterName.trim() || 'البطل',
        dialogueAr: '',
        dialogueEmotion: 'نبرة معبرة وحاسمة',
        dialogueTiming: '00:03 - 00:08',
        shotType: 'Medium Cinematic Shot',
        cameraMotion: 'Smooth Camera Motion (10s)'
      }
    ]);
  };

  // Manual Mode: Remove a manual scene
  const handleRemoveManualScene = (id: string) => {
    if (manualScenes.length <= 1) {
      showToast(lang === 'ar' ? 'يجب الإبقاء على مشهد واحد على الأقل.' : 'Keep at least one scene.', true);
      return;
    }
    setManualScenes(manualScenes.filter(s => s.id !== id));
  };

  // Manual Mode: Update field in a manual scene
  const handleUpdateManualScene = (id: string, field: keyof ManualSceneItem, val: string) => {
    setManualScenes(manualScenes.map(s => s.id === id ? { ...s, [field]: val } : s));
  };

  // Manual Mode: Parse bulk text/screenplay into structured scenes
  const handleParseBulkScreenplay = () => {
    if (!manualBulkText.trim()) {
      showToast(lang === 'ar' ? 'يرجى لصق نص السيناريو أولاً.' : 'Please paste script text first.', true);
      return;
    }

    const blocks = manualBulkText.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);
    const parsed: ManualSceneItem[] = [];

    blocks.forEach((block, idx) => {
      const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
      let action = '';
      let dialogue = '';
      let speaker = characterName.trim() || 'البطل';

      lines.forEach(line => {
        if (line.startsWith('حوار:') || line.startsWith('الحوار:') || line.startsWith('Dialogue:') || line.startsWith('"') || line.includes('":')) {
          dialogue = line.replace(/^(حوار|الحوار|Dialogue):\s*/i, '').replace(/^"|"$/g, '').trim();
        } else if (line.includes(':') && (line.split(':')[0].length < 20)) {
          const parts = line.split(':');
          speaker = parts[0].trim();
          dialogue = parts.slice(1).join(':').replace(/^"|"$/g, '').trim();
        } else {
          action += (action ? ' ' : '') + line;
        }
      });

      if (!action && dialogue) {
        action = `لقطة تفاعلية تركز على ${speaker} أثناء إلقاء الكلمات.`;
      }

      const ord = getArabicOrdinal(idx + 1);
      parsed.push({
        id: `mscene_${Date.now()}_${idx}`,
        titleAr: `${ord}: ${action.substring(0, 25) || 'مشهد سينمائي'}`,
        screenplayBeatAr: action || 'حركة سينمائية درامية',
        dialogueSpeaker: speaker,
        dialogueAr: dialogue || '',
        dialogueEmotion: 'نبرة درامية مؤثرة',
        dialogueTiming: '00:03 - 00:08',
        shotType: idx === 0 ? 'Wide Establishing Shot' : (idx === blocks.length - 1 ? 'Hero Master Close-up' : 'Medium Cinematic Shot'),
        cameraMotion: 'Smooth Camera Motion (10s)'
      });
    });

    if (parsed.length > 0) {
      setManualScenes(parsed);
      setManualSubMode('scenes');
      showToast(
        lang === 'ar'
          ? `✓ تم تقسيم النص بنجاح إلى (${parsed.length}) مشاهد! يمكنك الآن مراجعتها أو تعديلها.`
          : `✓ Successfully parsed into (${parsed.length}) scenes!`
      );
    }
  };

  // Manual Mode: Compile manual scenes into live MovieProject
  const handleBuildManualProject = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (manualScenes.length === 0) {
      showToast(lang === 'ar' ? 'يرجى إضافة مشهد واحد على الأقل.' : 'Add at least one scene.', true);
      return;
    }

    const heroName = characterName.trim() || 'بطل القصة';
    const heroFirst = heroName.split(' ')[0];
    const cleanConcept = manualConcept.trim() || manualTitle.trim() || 'سيناريو فيلم مخصص';
    const token = `[Consistent Face Anchor: ${heroFirst}, ${characterAge || '30s'}${characterGender ? ` ${characterGender}` : ''}, ${characterFeature || 'cinematic facial symmetry, focused expressive gaze, detailed skin texture'}, identical facial bone structure across all camera angles]`;

    const compiledScenes: CinemaScene[] = manualScenes.map((s, idx) => {
      const startSec = idx * 10;
      const endSec = (idx + 1) * 10;
      const pad = (n: number) => n < 10 ? `0${n}` : `${n}`;
      const timeRange = `00:${pad(startSec)} - 00:${pad(endSec)}`;
      const arabicOrd = getArabicOrdinal(idx + 1);
      const engOrd = getEnglishOrdinal(idx + 1);
      const speaker = s.dialogueSpeaker.trim() || heroFirst;
      const timing = s.dialogueTiming || '00:03 - 00:08';
      const emotion = s.dialogueEmotion || 'نبرة درامية حاسمة';
      const actionAr = s.screenplayBeatAr.trim() || `مشهد تفاعلي درامي للشخصية ${speaker}`;
      const actionEn = `Cinematic 10s dramatic scene featuring ${speaker}: ${actionAr}`;
      const dialAr = s.dialogueAr.trim();

      const actCut1 = Math.max(1, Math.floor(manualScenes.length * 0.34));
      const actCut2 = Math.max(actCut1 + 1, Math.floor(manualScenes.length * 0.7));
      const actPhase: ActPhase = idx < actCut1 ? 'act1' : (idx < actCut2 ? 'act2' : 'act3');
      const actLabelAr = actPhase === 'act1' ? 'الفصل الأول: البداية' : (actPhase === 'act2' ? 'الفصل الثاني: الصراع' : 'الفصل الثالث: الذروة');
      const actLabelEn = actPhase === 'act1' ? 'Act I: Setup' : (actPhase === 'act2' ? 'Act II: Conflict' : 'Act III: Climax');

      let rawPrompt = `${token} ${engOrd} (${timeRange}, exactly 10s duration). [SCREENPLAY ACTION]: ${s.shotType}, ${s.cameraMotion}. ${actionEn}.`;
      if (dialAr) {
        rawPrompt += ` [CHARACTER SPOKEN DIALOGUE & LIP-SYNC]: ${speaker} speaks (${emotion}) at ${timing}: "${dialAr}", synchronized natural mouth and lip movement, authentic facial expression.`;
      }
      rawPrompt += ` [CINEMATOGRAPHY]: ${visualStyle}, 8k photorealistic resolution, cinematic volumetric lighting, optimized for ${targetAiModel}.`;

      return {
        sceneNumber: idx + 1,
        timeRange,
        durationSeconds: 10,
        titleAr: s.titleAr || `${arabicOrd}: مشهد`,
        titleEn: `${engOrd}: ${s.shotType}`,
        screenplaySlug: `${arabicOrd}: لقطة سينمائية [${timeRange}]`,
        screenplayBeatAr: actionAr,
        screenplayBeatEn: actionEn,
        dialogueSpeaker: speaker,
        dialogueEmotion: emotion,
        dialogueTiming: timing,
        dialogueAr: dialAr,
        dialogueEn: dialAr,
        shotType: s.shotType,
        cameraMotion: s.cameraMotion,
        dramaticActionAr: actionAr,
        videoPromptEn: appendSiteUrlToPrompt(rawPrompt),
        soundDesign: 'Atmospheric cinematic ambiance and spatial acoustics',
        motionIntensity: actPhase === 'act2' ? 8 : (actPhase === 'act3' ? 7 : 5),
        actPhase,
        actLabelAr,
        actLabelEn
      };
    });

    const newProject: MovieProject = {
      id: 'movie_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      titleAr: manualTitle.trim() || 'سيناريو فيلم يدوي',
      titleEn: `Manual Screenplay: ${manualTitle.trim() || 'Custom'}`,
      concept: cleanConcept,
      genre,
      visualStyle,
      targetAiModel,
      loglineAr: cleanConcept,
      loglineEn: cleanConcept,
      storySynopsisAr: `سيناريو تم تأليفه وإدخال حواراته وأحداثه يدوياً بواسطة المستخدم (${manualScenes.length} مشاهد، 10 ثوانٍ لكل مشهد).`,
      storySynopsisEn: `User-authored custom screenplay with hand-crafted scenes and spoken dialogues (${manualScenes.length} scenes, 10s each).`,
      characterAnchor: {
        name: heroName,
        role: `الشخصية الرئيسية في: ${manualTitle}`,
        faceDescriptionAr: characterFeature || 'ملامح سينمائية متناسقة ومصممة بدقة للقصة',
        faceDescriptionEn: 'Cinematic facial symmetry tailored to story',
        consistencyPromptToken: token
      },
      scenes: compiledScenes,
      totalDurationSeconds: compiledScenes.length * 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setActiveProject(newProject);
    setProjectTitleInput(newProject.titleAr);
    await handleSaveCurrentProject(newProject, false);
    showToast(
      lang === 'ar'
        ? `🎬 تم بناء وحفظ السيناريو والحوارات اليدوية (${compiledScenes.length} مشاهد، كل مشهد 10 ثوانٍ) بنجاح!`
        : `🎬 Custom screenplay & dialogues saved successfully (${compiledScenes.length} scenes)!`
    );
  };

  // Start fresh manual project from empty state or header
  const handleStartNewManualProject = () => {
    setActiveProject(null);
    setCreationMode('manual');
    setManualTitle('سيناريو فيلم مخصص');
    setManualConcept('');
    setManualScenes(DEFAULT_MANUAL_SCENES);
    const el = document.getElementById('cinema-studio-workspace');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    showToast(lang === 'ar' ? 'تم فتح وضع كتابة السيناريو والحوار يدوياً.' : 'Switched to Manual Screenplay & Dialogue Mode.');
  };

  // Render Contextual Dialogue Suggestions Panel
  const renderContextSuggestionsPanel = (targetId: string, onApply: (sug: DialogueContextSuggestion) => void) => {
    if (!contextSuggestionsData || contextSuggestionsData.targetId !== targetId) return null;
    const { suggestions, sceneNatureSummary, original } = contextSuggestionsData;

    return (
      <div className="mt-3 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-b from-amber-500/10 via-amber-50/60 to-stone-50 border border-amber-300/80 space-y-3 shadow-md animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-amber-200/70 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#c29b40] text-stone-950 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xs font-black text-stone-900 block">
                {lang === 'ar' ? 'اقتراحات السياق والصيغ البديلة للجملة' : 'Contextual Suggestions & Alternatives'}
              </span>
              <span className="text-[10px] text-stone-500 font-medium">
                {lang === 'ar' ? 'مصاغة بالذكاء الاصطناعي وفق طبيعة هذا المشهد وحركته' : 'Tailored by AI to match this specific scene nature'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setContextSuggestionsData(null)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/70 transition-all cursor-pointer"
            title={lang === 'ar' ? 'إغلاق الاقتراحات' : 'Close'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {sceneNatureSummary && (
          <div className="text-[11px] font-medium text-stone-700 bg-white/90 p-2.5 rounded-xl border border-stone-200/80 flex items-start gap-2 shadow-2xs">
            <Info className="w-4 h-4 text-[#c29b40] shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-stone-900">{lang === 'ar' ? 'سياق وطبيعة المشهد: ' : 'Scene Nature: '}</span>
              <span>{sceneNatureSummary}</span>
            </div>
          </div>
        )}

        {original && (
          <div className="text-[11px] text-stone-500 flex items-center gap-1.5 px-1">
            <span className="font-bold text-stone-600">{lang === 'ar' ? 'الجملة الأصلية الحالية:' : 'Original:'}</span>
            <span className="italic line-through truncate max-w-xs">{original}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {suggestions.map((sug, sIdx) => {
            let badgeStyle = 'bg-rose-100 text-rose-950 border-rose-300';
            let badgeIcon = '⚔️';
            if (sug.type === 'subtext') {
              badgeStyle = 'bg-sky-100 text-sky-950 border-sky-300';
              badgeIcon = '🎭';
            } else if (sug.type === 'punchy') {
              badgeStyle = 'bg-emerald-100 text-emerald-950 border-emerald-300';
              badgeIcon = '⏱️';
            } else if (sug.type === 'emotional') {
              badgeStyle = 'bg-purple-100 text-purple-950 border-purple-300';
              badgeIcon = '🌊';
            }

            return (
              <div
                key={sIdx}
                className="p-3 rounded-xl bg-white border border-stone-200 hover:border-[#c29b40] transition-all space-y-2 shadow-2xs flex flex-col justify-between group"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${badgeStyle}`}>
                      <span>{badgeIcon}</span>
                      <span>{lang === 'ar' ? sug.styleLabelAr : sug.styleLabelEn}</span>
                    </span>

                    <span className="text-[10px] text-stone-500 font-mono italic truncate max-w-[120px]">
                      {sug.emotionAr}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-stone-900 leading-relaxed font-serif bg-amber-50/50 p-2.5 rounded-lg border border-amber-200/50">
                    "{sug.dialogueAr}"
                  </div>

                  {sug.dialogueEn && (
                    <div className="text-[10px] text-stone-500 italic px-1 font-mono">
                      "{sug.dialogueEn}"
                    </div>
                  )}

                  {sug.subtextReasonAr && (
                    <p className="text-[10px] text-stone-600 leading-relaxed pt-1 border-t border-stone-100">
                      <span className="font-bold text-stone-800">{lang === 'ar' ? 'سبب الملاءمة: ' : 'Fit: '}</span>
                      {sug.subtextReasonAr}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-stone-100 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(sug.dialogueAr);
                      showToast(lang === 'ar' ? 'تم نسخ الجملة.' : 'Copied.');
                    }}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all cursor-pointer"
                    title={lang === 'ar' ? 'نسخ الجملة' : 'Copy'}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onApply(sug)}
                    className="px-3 py-1.5 rounded-lg bg-[#c29b40] hover:bg-[#a6802f] text-stone-950 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 hover:scale-[1.02]"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>{lang === 'ar' ? 'تطبيق هذه الصيغة' : 'Apply'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div id="cinema-studio-workspace" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      
      {/* Studio Header & Project Bar */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white rounded-3xl p-6 sm:p-8 border border-stone-800 shadow-xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#c29b40]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c29b40]/20 border border-[#c29b40]/40 text-[#f5d996] text-xs font-bold tracking-wide">
              <Clapperboard className="w-3.5 h-3.5 text-[#c29b40]" />
              <span>{lang === 'ar' ? 'استوديو السينما وصناعة الأفلام AI' : 'AI Cinema Studio & 10s Screenplay'}</span>
              <span className="bg-[#c29b40] text-stone-950 px-1.5 py-0.2 rounded-md text-[10px] font-black">10s ENGINE</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {lang === 'ar' 
                ? 'تحويل الأفكار إلى قصص وسيناريوهات بمشاهد من 10 ثوانٍ' 
                : 'Turn Ideas Into 10-Second Scene Screenplays'}
            </h1>
            <p className="text-sm text-stone-300 max-w-2xl leading-relaxed">
              {lang === 'ar'
                ? 'اكتب فكرتك وسيقوم الذكاء الاصطناعي ببناء قصة متماسكة وسيناريو مقسم إلى لقطات دقيقة (10 ثوانٍ لكل مشهد)، مع كتابة نصوص السيناريو والحوارات المنطوقة وحركة الشفاه (Lip-Sync) مدمجة في البرومبت، وتثبيت ملامح وجه البطل (Consistent Face Anchor) بدقة.'
                : 'Input your movie concept to generate an episodic screenplay strictly paced at 10 seconds per scene, embedding cinematic narrative beats, spoken character dialogue with lip-sync timing, and anchored facial consistency directly in the video prompts.'}
            </p>
          </div>

          {/* Project Management Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsSavedDrawerOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-100 text-xs font-bold transition-all flex items-center gap-2 border border-stone-700 shadow-md cursor-pointer"
            >
              <FolderOpen className="w-4 h-4 text-[#c29b40]" />
              <span>{lang === 'ar' ? 'مشاريعي المحفوظة' : 'Saved Projects'}</span>
              <span className="bg-[#c29b40] text-stone-950 text-[10px] font-mono font-black px-1.5 py-0.5 rounded-full">
                {savedProjects.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsTesterModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-[#c29b40] text-[#f5d996] hover:text-stone-950 text-xs font-bold transition-all flex items-center gap-2 border border-[#c29b40]/50 shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              title={lang === 'ar' ? 'تشغيل مختبر واختبار مولد السيناريوهات من القصة' : 'Test Story-to-Screenplay Generator'}
            >
              <FlaskConical className="w-4 h-4 text-[#c29b40]" />
              <span>{lang === 'ar' ? 'اختبار مُولد السيناريوهات' : 'Screenplay Generator Tester'}</span>
              <span className="bg-[#c29b40] text-stone-950 text-[9px] font-black px-1.5 py-0.2 rounded-md">
                TEST LAB
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsLegendsModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-600/20 hover:bg-[#c29b40] text-[#f5d996] hover:text-stone-950 text-xs font-bold transition-all flex items-center gap-2 border border-[#c29b40]/50 shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              title={lang === 'ar' ? 'تصفح سيناريوهات وقصص أساطير تاريخية عربية شهيرة' : 'Browse Arabic Historical & Mythological Screenplays'}
            >
              <BookOpen className="w-4 h-4 text-[#c29b40]" />
              <span>{lang === 'ar' ? 'أساطير وسيناريوهات تاريخية' : 'Historical Legends'}</span>
              <span className="bg-[#c29b40] text-stone-950 text-[9px] font-black px-1.5 py-0.2 rounded-md font-mono">
                {ARABIC_HISTORICAL_LEGENDS.length}
              </span>
            </button>

            {activeProject && (
              <>
                <button
                  type="button"
                  onClick={() => handleSaveCurrentProject(activeProject)}
                  className="px-4 py-2.5 rounded-xl bg-[#c29b40] hover:bg-[#a6802f] text-stone-950 text-xs font-black transition-all flex items-center gap-1.5 shadow-md shadow-[#c29b40]/20 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'حفظ المشروع' : 'Save Project'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopyAllPrompts('full')}
                  className="px-3.5 py-2.5 rounded-xl bg-amber-500/20 hover:bg-[#c29b40] text-[#f5d996] hover:text-stone-950 text-xs font-bold transition-all flex items-center gap-1.5 border border-[#c29b40]/50 cursor-pointer shadow-md"
                  title={lang === 'ar' ? 'نسخ جميع برومبتات مشاهد الفيلم' : 'Copy All Movie Scene Prompts'}
                >
                  {copiedAllPrompts ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>{lang === 'ar' ? 'تم نسخ البرومبتات!' : 'Prompts Copied!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-[#f5d996]" />
                      <span>{lang === 'ar' ? 'نسخ جميع البرومبتات' : 'Copy All Prompts'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleExportMarkdown}
                  className="px-3.5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-all flex items-center gap-1.5 border border-stone-700 cursor-pointer"
                  title={lang === 'ar' ? 'تصدير السيناريو كملف Markdown' : 'Export Screenplay as Markdown'}
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>{lang === 'ar' ? 'تصدير' : 'Export'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenShareModal}
                  disabled={isSharing}
                  className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-[#c29b40] text-stone-100 hover:text-stone-950 text-xs font-bold transition-all flex items-center gap-1.5 border border-white/20 hover:border-[#c29b40] cursor-pointer shadow-md group"
                  title={lang === 'ar' ? 'مشاركة السلسلة وتوليد رابط فريد' : 'Share Sequence Link'}
                >
                  <Share2 className="w-4 h-4 text-[#c29b40] group-hover:text-stone-950 transition-colors" />
                  <span>{isSharing ? (lang === 'ar' ? 'جاري التجهيز...' : 'Preparing...') : (lang === 'ar' ? 'مشاركة السلسلة' : 'Share Sequence')}</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={handleStartNewManualProject}
              className="px-3.5 py-2.5 rounded-xl bg-amber-500/20 hover:bg-[#c29b40] text-[#f5d996] hover:text-stone-950 text-xs font-bold transition-all flex items-center gap-1.5 border border-[#c29b40]/50 cursor-pointer shadow-md"
              title={lang === 'ar' ? 'إنشاء سيناريو يدوي وإدخال الحوارات والأحداث بنفسك' : 'Create manual screenplay with custom dialogues'}
            >
              <Edit3 className="w-4 h-4 text-[#c29b40]" />
              <span>{lang === 'ar' ? 'سيناريو وحوار يدوي' : 'Manual Script'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveProject(null);
                setConcept('');
                setCreationMode('ai');
                showToast(lang === 'ar' ? 'جاهز لإنشاء مشروع سينمائي جديد.' : 'Ready to create a new movie.');
              }}
              className="px-3.5 py-2.5 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-300 text-xs font-bold transition-all flex items-center gap-1.5 border border-stone-700/80 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'ar' ? 'جديد (AI)' : 'New (AI)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Shared Movie Sequence Welcoming Banner if loaded via link */}
      {sharedBannerInfo && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-[#c29b40]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#c29b40] text-stone-950 flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-stone-900">
                  {lang === 'ar' ? '✨ تم فتح سلسلة الفيلم المشتركة:' : '✨ Shared Movie Sequence Loaded:'}
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
                  ? 'يمكنك معاينة اللقطات الـ 10 ثوانٍ، تشغيل المحاكاة، نسخ نصوص الحوار والبرومبتات، أو حفظ المشروع في حسابك.'
                  : 'You can preview 10-second scenes, run simulation, copy dialogues and prompts, or save the project to your library.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            {activeProject && (
              <button
                onClick={() => handleSaveCurrentProject(activeProject)}
                className="px-3 py-1.5 rounded-xl bg-[#c29b40] hover:bg-[#a6802f] text-stone-950 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'حفظ في مشاريعي' : 'Save to My Projects'}</span>
              </button>
            )}
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

      {/* Main Grid: Left Config Form (5 cols) | Right Studio Workspace (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Story & Character Builder Form */}
        <section className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#c29b40]" />
              <h2 className="text-base font-bold text-stone-900">
                {lang === 'ar' ? '1. إعداد السيناريو والحوار' : '1. Screenplay & Dialogue Setup'}
              </h2>
            </div>

            {/* Mode Switcher: AI Generation vs Manual Input */}
            <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setCreationMode('ai')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  creationMode === 'ai'
                    ? 'bg-[#c29b40] text-stone-950 font-black shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'توليد ذكي (AI)' : 'AI Mode'}</span>
              </button>
              <button
                type="button"
                onClick={() => setCreationMode('manual')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  creationMode === 'manual'
                    ? 'bg-stone-900 text-[#f5d996] font-black shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5 text-[#c29b40]" />
                <span>{lang === 'ar' ? 'إدخال يدوي (Manual)' : 'Manual Mode'}</span>
              </button>
            </div>
          </div>

          {creationMode === 'ai' ? (
            <form onSubmit={handleGenerateStory} className="space-y-5">
            {/* Arabic Historical Stories & Legends Screenplays Showcase */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 via-amber-50/50 to-stone-50 border border-[#c29b40]/40 space-y-3 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#c29b40] text-stone-950 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                    📜
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-stone-900">
                        {lang === 'ar' ? 'سيناريوهات وأساطير عربية وتاريخية' : 'Arabic Historical & Myth Screenplays'}
                      </span>
                      <span className="bg-[#c29b40] text-stone-950 text-[9px] font-mono font-black px-1.5 py-0.2 rounded-md">
                        {ARABIC_HISTORICAL_LEGENDS.length} {lang === 'ar' ? 'جاهزة' : 'Ready'}
                      </span>
                    </div>
                    <span className="text-[10px] text-stone-600 block">
                      {lang === 'ar' ? 'أساطير وملاحم التراث: سيف بن ذي يزن، رحلات ابن بطوطة، أسطورة سندباد، عنترة بن شداد...' : 'Epic screenplays from Arab heritage: Sayf ibn Dhi Yazan, Ibn Battuta, Sinbad, Antarah...'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsLegendsModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-black text-[#f5d996] text-[11px] font-bold transition-all flex items-center gap-1.5 border border-[#c29b40]/50 shadow-xs cursor-pointer hover:scale-[1.02] self-end sm:self-auto shrink-0"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#c29b40]" />
                  <span>{lang === 'ar' ? 'تصفح المكتبة بالكامل' : 'Browse All Legends'}</span>
                </button>
              </div>

              {/* Horizontal Scrollable Quick Chips (Prioritizing Sayf, Ibn Battuta & Sinbad) */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin">
                {[...ARABIC_HISTORICAL_LEGENDS].sort((a, b) => {
                  const priority = ['legend-sayf-roc', 'legend-ibn-battuta', 'legend-sinbad-whale'];
                  const aIdx = priority.indexOf(a.id);
                  const bIdx = priority.indexOf(b.id);
                  if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
                  if (aIdx !== -1) return -1;
                  if (bIdx !== -1) return 1;
                  return 0;
                }).map((legend) => {
                  const isKey = ['legend-sayf-roc', 'legend-ibn-battuta', 'legend-sinbad-whale'].includes(legend.id);
                  return (
                    <div
                      key={legend.id}
                      className={`p-2 rounded-xl border transition-all text-start shrink-0 flex items-center gap-2 shadow-2xs group ${
                        isKey 
                          ? 'bg-amber-50/90 hover:bg-amber-100/80 border-amber-300 hover:border-[#c29b40]'
                          : 'bg-white hover:bg-amber-50/80 border-stone-200/90 hover:border-[#c29b40]'
                      }`}
                    >
                      <span className="text-base p-1 bg-stone-100 rounded-lg group-hover:scale-110 transition-transform">
                        {legend.icon}
                      </span>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] font-black text-stone-900 group-hover:text-[#916a24] line-clamp-1 max-w-[130px]">
                            {legend.hero.name}
                          </span>
                          {isKey && (
                            <span className="text-[8px] font-black px-1 py-0.2 bg-amber-200 text-amber-950 rounded font-mono">
                              ⭐
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-stone-500 font-medium">
                          {lang === 'ar' ? legend.categoryLabelAr : legend.categoryLabelEn}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 mr-1">
                        <button
                          type="button"
                          onClick={() => handleApplyLegendToAiForm(legend)}
                          className="px-2 py-0.5 rounded-md bg-[#c29b40]/20 hover:bg-[#c29b40] text-amber-950 hover:text-stone-950 text-[10px] font-bold transition-all cursor-pointer"
                          title={lang === 'ar' ? 'تطبيق في المولد الذكي (AI)' : 'Apply to AI'}
                        >
                          {lang === 'ar' ? 'تطبيق' : 'Apply'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleLoadLegendAsActiveProject(legend)}
                          className="px-2 py-0.5 rounded-md bg-stone-900 hover:bg-black text-[#f5d996] text-[10px] font-bold transition-all cursor-pointer shadow-2xs hover:scale-105"
                          title={lang === 'ar' ? 'تحميل فوري لجميع المشاهد الـ 10s' : 'Instant 10s scenes'}
                        >
                          ⚡ {lang === 'ar' ? 'فتح' : 'Play'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ready Screenplay Templates Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-stone-900 flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-[#c29b40]" />
                  <span>{lang === 'ar' ? 'قوالب السيناريوهات الجاهزة (Screenplay Templates)' : 'Ready Screenplay Templates'}</span>
                </label>
                <span className="text-[10px] text-stone-500 font-medium">
                  {lang === 'ar' ? 'دراما، غموض، وثائقي، سايبربانك...' : 'Drama, Mystery, Docu...'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SCREENPLAY_TEMPLATES.map((tpl) => {
                  const isSelected = selectedTemplateId === tpl.id;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => handleSelectTemplate(tpl)}
                      className={`p-2.5 rounded-xl border text-start transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#c29b40]/15 border-[#c29b40] shadow-xs text-stone-900 ring-1 ring-[#c29b40]'
                          : 'bg-stone-50/80 hover:bg-stone-100 border-stone-200/80 text-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-sm sm:text-base">{tpl.icon}</span>
                        <span className="text-xs font-black truncate">{lang === 'ar' ? tpl.nameAr : tpl.nameEn}</span>
                      </div>
                      <p className="text-[10px] text-stone-500 line-clamp-2 leading-tight">
                        {lang === 'ar' ? tpl.taglineAr : tpl.taglineEn}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Concept Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="movie-concept-input" className="block text-xs font-bold text-stone-700">
                  {lang === 'ar' ? 'فكرة الفيلم أو القصة السينمائية (اكتب بحرية)' : 'Your Movie Concept or Story Idea'}
                </label>
                {selectedTemplateId && (
                  <span className="text-[10px] font-bold text-[#916a24] bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    {lang === 'ar' ? `قالب مفعل: ${SCREENPLAY_TEMPLATES.find(t => t.id === selectedTemplateId)?.nameAr}` : `Template: ${SCREENPLAY_TEMPLATES.find(t => t.id === selectedTemplateId)?.nameEn}`}
                  </span>
                )}
              </div>
              <textarea
                id="movie-concept-input"
                rows={4}
                required
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder={
                  lang === 'ar'
                    ? 'اكتب فكرة فيلمك هنا... مثلاً: محقق يبحث عن دليل غامض في مدينة مستقبلية ممطرة، أو مغامرة ملحمية في الصحراء لاكتشاف آثار مفقودة.'
                    : 'Describe your movie premise, dramatic conflict, and setting...'
                }
                className="w-full text-xs rounded-xl border border-stone-300 p-3.5 focus:outline-none focus:ring-2 focus:ring-[#c29b40]/30 focus:border-[#c29b40] bg-[#faf9f6] text-stone-900 placeholder-stone-400"
              />
            </div>

            {/* Multi-Act Screenplay Arc (Beginning, Middle, Climax) with Gemini 3.8 Flash AI */}
            <div className="rounded-2xl border border-amber-300/70 bg-gradient-to-b from-amber-50/40 via-[#faf9f6] to-[#faf9f6] p-3.5 sm:p-4 space-y-3 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#c29b40]" />
                  <span className="text-xs font-black text-stone-900">
                    {lang === 'ar' ? 'هيكل الفصول المتعددة (Multi-Act Story Arc)' : 'Multi-Act Story Arc'}
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-[#c29b40]/20 text-[#916a24] px-1.5 py-0.5 rounded-md">
                    3 ACTS
                  </span>
                </div>

                {/* AI Suggest Acts with Gemini 3.8 Flash */}
                <button
                  type="button"
                  onClick={handleSuggestActsWithAI}
                  disabled={isSuggestingActs}
                  className="px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-black text-[#f5d996] text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer border border-[#c29b40]/50 disabled:opacity-50"
                  title={lang === 'ar' ? 'اقتراح تفاصيل الفصول الثلاثة بواسطة Gemini 3.8 Flash' : 'Suggest 3 acts using Gemini 3.8 Flash'}
                >
                  <Sparkles className={`w-3 h-3 text-[#c29b40] ${isSuggestingActs ? 'animate-spin' : ''}`} />
                  <span>
                    {isSuggestingActs 
                      ? (lang === 'ar' ? 'جاري الاقتراح بـ Gemini 3.8 Flash...' : 'Suggesting...') 
                      : (lang === 'ar' ? '✨ اقتراح الفصول بـ Gemini 3.8 Flash' : 'AI Acts with Gemini 3.8 Flash')}
                  </span>
                </button>
              </div>

              {/* Act Tabs: Act 1, Act 2, Act 3 */}
              <div className="flex rounded-xl bg-stone-200/60 p-1 gap-1">
                <button
                  type="button"
                  onClick={() => setActiveActTab('act1')}
                  className={`flex-1 py-1 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    activeActTab === 'act1'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <span>🎬</span>
                  <span>{lang === 'ar' ? 'الفصل 1: البداية' : 'Act I: Setup'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveActTab('act2')}
                  className={`flex-1 py-1 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    activeActTab === 'act2'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <span>⚔️</span>
                  <span>{lang === 'ar' ? 'الفصل 2: الصراع' : 'Act II: Conflict'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveActTab('act3')}
                  className={`flex-1 py-1 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    activeActTab === 'act3'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <span>🏆</span>
                  <span>{lang === 'ar' ? 'الفصل 3: الذروة' : 'Act III: Climax'}</span>
                </button>
              </div>

              {/* Active Act Content Editor */}
              <div className="space-y-2 bg-white rounded-xl p-3 border border-stone-200/80 text-xs">
                {activeActTab === 'act1' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        {lang === 'ar' ? 'عنوان الفصل الأول (البداية وتأسيس العالم):' : 'Act I Title (Setup & Genesis):'}
                      </label>
                      <input
                        type="text"
                        value={actStructure.act1TitleAr}
                        onChange={(e) => setActStructure({ ...actStructure, act1TitleAr: e.target.value })}
                        className="w-full text-xs font-bold text-stone-900 rounded-lg border border-stone-300 p-2 bg-[#faf9f6] focus:border-[#c29b40] focus:outline-none"
                        placeholder={lang === 'ar' ? 'مثال: وقوع الحادثة والتقاط الخيط الأول' : 'Act I Title'}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        {lang === 'ar' ? 'أحداث ومجريات الفصل الأول:' : 'Act I Narrative Beat:'}
                      </label>
                      <textarea
                        rows={2}
                        value={actStructure.act1DescriptionAr}
                        onChange={(e) => setActStructure({ ...actStructure, act1DescriptionAr: e.target.value })}
                        className="w-full text-xs text-stone-800 rounded-lg border border-stone-300 p-2 bg-[#faf9f6] focus:border-[#c29b40] focus:outline-none leading-relaxed"
                        placeholder={lang === 'ar' ? 'صف كيف تبدأ القصة وما هي نقطة الانطلاق...' : 'Describe how the story begins...'}
                      />
                    </div>
                  </>
                )}

                {activeActTab === 'act2' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        {lang === 'ar' ? 'عنوان الفصل الثاني (الوسط وتصاعد الصراع):' : 'Act II Title (Rising Conflict):'}
                      </label>
                      <input
                        type="text"
                        value={actStructure.act2TitleAr}
                        onChange={(e) => setActStructure({ ...actStructure, act2TitleAr: e.target.value })}
                        className="w-full text-xs font-bold text-stone-900 rounded-lg border border-stone-300 p-2 bg-[#faf9f6] focus:border-[#c29b40] focus:outline-none"
                        placeholder={lang === 'ar' ? 'مثال: تصاعد المخاطر ومواجهة التحدي' : 'Act II Title'}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        {lang === 'ar' ? 'أحداث ومجريات الفصل الثاني والمواجهات:' : 'Act II Narrative Beat & Stakes:'}
                      </label>
                      <textarea
                        rows={2}
                        value={actStructure.act2DescriptionAr}
                        onChange={(e) => setActStructure({ ...actStructure, act2DescriptionAr: e.target.value })}
                        className="w-full text-xs text-stone-800 rounded-lg border border-stone-300 p-2 bg-[#faf9f6] focus:border-[#c29b40] focus:outline-none leading-relaxed"
                        placeholder={lang === 'ar' ? 'صف التحديات والمطاردات ونقاط التصعيد...' : 'Describe escalating obstacles and confrontation...'}
                      />
                    </div>
                  </>
                )}

                {activeActTab === 'act3' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        {lang === 'ar' ? 'عنوان الفصل الثالث (الذروة والخاتمة):' : 'Act III Title (Climax & Resolution):'}
                      </label>
                      <input
                        type="text"
                        value={actStructure.act3TitleAr}
                        onChange={(e) => setActStructure({ ...actStructure, act3TitleAr: e.target.value })}
                        className="w-full text-xs font-bold text-stone-900 rounded-lg border border-stone-300 p-2 bg-[#faf9f6] focus:border-[#c29b40] focus:outline-none"
                        placeholder={lang === 'ar' ? 'مثال: الذروة الكبرى وحسم المصير' : 'Act III Title'}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        {lang === 'ar' ? 'أحداث الذروة والحل ونهاية القصة:' : 'Act III Climactic Beat & Resolution:'}
                      </label>
                      <textarea
                        rows={2}
                        value={actStructure.act3DescriptionAr}
                        onChange={(e) => setActStructure({ ...actStructure, act3DescriptionAr: e.target.value })}
                        className="w-full text-xs text-stone-800 rounded-lg border border-stone-300 p-2 bg-[#faf9f6] focus:border-[#c29b40] focus:outline-none leading-relaxed"
                        placeholder={lang === 'ar' ? 'صف المواجهة الأخيرة وكيف تكتمل رحلة البطل...' : 'Describe climactic turning point and resolution...'}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Quick Inspiration Pills */}
            {!concept.trim() && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-stone-500 block">
                  {lang === 'ar' ? '💡 أفكار مقترحة للبدء السريع:' : '💡 Quick story ideas:'}
                </span>
                <div className="space-y-1">
                  {STORY_INSPIRATION_IDEAS.map((idea, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setConcept(lang === 'ar' ? idea.ar : idea.en)}
                      className="w-full text-start text-[11px] p-2 rounded-lg bg-stone-50 hover:bg-[#c29b40]/10 text-stone-700 hover:text-[#916a24] border border-stone-200/60 transition-all truncate block cursor-pointer"
                    >
                      {lang === 'ar' ? idea.ar : idea.en}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Genre & Visual Style Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {lang === 'ar' ? 'نوع الفيلم (Genre)' : 'Movie Genre'}
                </label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full text-xs rounded-xl border border-stone-300 p-2.5 bg-white text-stone-800 focus:outline-none focus:border-[#c29b40]"
                >
                  {GENRE_PRESETS.map((g) => (
                    <option key={g.id} value={lang === 'ar' ? g.nameAr : g.nameEn}>
                      {g.icon} {lang === 'ar' ? g.nameAr : g.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {lang === 'ar' ? 'نموذج الفيديو المستهدف' : 'Target Video AI'}
                </label>
                <select
                  value={targetAiModel}
                  onChange={(e) => setTargetAiModel(e.target.value)}
                  className="w-full text-xs rounded-xl border border-stone-300 p-2.5 bg-white text-stone-800 focus:outline-none focus:border-[#c29b40]"
                >
                  {VIDEO_AI_MODELS.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Visual Style Selection */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {lang === 'ar' ? 'الأسلوب البصري والسينمائي (Visual Style)' : 'Visual Cinematic Style'}
              </label>
              <select
                value={visualStyle}
                onChange={(e) => setVisualStyle(e.target.value)}
                className="w-full text-xs rounded-xl border border-stone-300 p-2.5 bg-white text-stone-800 focus:outline-none focus:border-[#c29b40]"
              >
                {STYLE_PRESETS.map((s) => (
                  <option key={s.id} value={s.nameEn}>
                    {lang === 'ar' ? s.nameAr : s.nameEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Scene Count (Strict 10s Pacing) */}
            <div className="bg-amber-50/60 border border-amber-200/60 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#c29b40]" />
                  {lang === 'ar' ? 'عدد المشاهد (10 ثوانٍ لكل مشهد)' : 'Scene Count (10s per scene)'}
                </span>
                <span className="text-xs font-mono font-black text-[#916a24] bg-white px-2 py-0.5 rounded-lg border border-amber-300">
                  {sceneCount * 10} {lang === 'ar' ? 'ثانية إجمالاً' : 'seconds total'}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {[3, 4, 5, 6, 8].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setSceneCount(count)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                      sceneCount === count
                        ? 'bg-[#c29b40] text-stone-950 border-[#b38d35] font-black shadow-xs'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {count} {lang === 'ar' ? 'مشاهد' : 'scenes'}
                  </button>
                ))}
              </div>
            </div>

            {/* Dedicated Manual Dialogue Input Field Prior to Generation */}
            <div className="bg-gradient-to-b from-amber-50/50 via-stone-50 to-white border border-amber-200/90 rounded-2xl p-4 space-y-3 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-stone-900 font-black text-xs">
                  <MessageSquare className="w-3.5 h-3.5 text-[#c29b40]" />
                  <span>{lang === 'ar' ? 'حوار المشاهد المنطوق يدوياً (مسبقاً قبل التوليد)' : 'Manual Spoken Dialogue (Pre-Generation)'}</span>
                </div>
                <span className="text-[10px] font-bold text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#c29b40]" />
                  {lang === 'ar' ? 'دمج ديناميكي في المشاهد والفصول' : 'Dynamic Screenplay Weaving'}
                </span>
              </div>

              <p className="text-[11px] text-stone-600 leading-relaxed">
                {lang === 'ar'
                  ? 'أدخل نصوص الحوارات أو العبارات المنطوقة التي تريد أن تنطقها الشخصيات بدقة. سيقوم النموذج بدمجها ديناميكياً وتوزيعها بسلاسة على مشاهد الـ 10 ثوانٍ مع مزامنة الشفاه (Lip-Sync) بدلاً من توليد حوارات ثابتة ومكررة.'
                  : 'Enter dialogue lines or spoken lines for your characters. The AI model dynamically distributes and synchronizes them across the 10-second scenes with lip-sync cues.'}
              </p>

              {/* The Dedicated Textarea */}
              <div>
                <textarea
                  rows={3}
                  value={customDialogueInput}
                  onChange={(e) => setCustomDialogueInput(e.target.value)}
                  placeholder={
                    lang === 'ar'
                      ? 'اكتب الحوار المنطوق هنا (اختياري - اتركه فارغاً لابتكار حوار ذكي من الفكرة تلقائياً)...\nمثال:\nالبطل: انظر إلى تلك الإشارات البعيدة، هل تعتقد أنها رسالة سرية؟\nالمساعد: لا تقترب، الأجهزة ترصد طاقة غامضة وغير مستقرة!\nالبطل: هذه فرصتنا الوحيدة ويجب أن نخاطر الآن!'
                      : 'Enter dialogue lines (e.g. Hero: Look at those signals... / Scout: Approach with caution!)...'
                  }
                  className="w-full text-xs rounded-xl border border-stone-300 p-3 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#c29b40]/30 focus:border-[#c29b40] leading-relaxed font-mono"
                />
              </div>

              {/* Helpers & Quick Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-stone-200/60">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold text-stone-500">
                    {lang === 'ar' ? 'نماذج سريعة:' : 'Quick Presets:'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSuggestDialoguePreset('confrontation')}
                    className="px-2 py-0.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-bold transition-all cursor-pointer border border-stone-200"
                  >
                    ⚔️ {lang === 'ar' ? 'مواجهة وتحدٍ' : 'Confrontation'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSuggestDialoguePreset('mystery')}
                    className="px-2 py-0.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-bold transition-all cursor-pointer border border-stone-200"
                  >
                    🔍 {lang === 'ar' ? 'استكشاف وغموض' : 'Mystery'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSuggestDialoguePreset('triumph')}
                    className="px-2 py-0.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-bold transition-all cursor-pointer border border-stone-200"
                  >
                    🏆 {lang === 'ar' ? 'عزيمة وانتصار' : 'Triumph'}
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    disabled={isFetchingContextSuggestions && contextSuggestionsTarget === 'custom_input'}
                    onClick={() => handleFetchDialogueContextSuggestions(
                      'custom_input',
                      customDialogueInput,
                      {
                        sceneTitle: 'حوار السيناريو المسبق',
                        sceneBeat: concept,
                        speakerName: characterName || 'البطل',
                        concept: concept,
                        genre: genre
                      }
                    )}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-[#c29b40] text-amber-950 hover:text-stone-950 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer border border-[#c29b40]/40 disabled:opacity-50"
                    title={lang === 'ar' ? 'اقتراح صيغ بديلة وتحسينات للجملة الحالية وفق طبيعة وسياق القصة' : 'Suggest contextual alternatives for this dialogue based on story context'}
                  >
                    <Sparkles className={`w-3 h-3 text-[#c29b40] ${isFetchingContextSuggestions && contextSuggestionsTarget === 'custom_input' ? 'animate-spin' : ''}`} />
                    <span>{isFetchingContextSuggestions && contextSuggestionsTarget === 'custom_input' ? (lang === 'ar' ? 'تحليل السياق...' : 'Analyzing...') : (lang === 'ar' ? '✨ اقتراحات السياق' : 'Context Suggestions')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSuggestDialoguePreset()}
                    disabled={isGeneratingDialoguePreset || !concept.trim()}
                    className="px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-black text-[#f5d996] text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer border border-[#c29b40]/40 disabled:opacity-50"
                    title={lang === 'ar' ? 'اقتراح مسودة حوار فورية من فكرتك الحالية' : 'Suggest dialogue draft from your concept'}
                  >
                    <Sparkles className={`w-3 h-3 text-[#c29b40] ${isGeneratingDialoguePreset ? 'animate-spin' : ''}`} />
                    <span>{lang === 'ar' ? 'اقتراح حوار ذكي للفكرة' : 'AI Dialogue Draft'}</span>
                  </button>

                  {customDialogueInput.trim() && (
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>{lang === 'ar' ? 'محفوظ تلقائياً' : 'Auto-saved'}</span>
                    </span>
                  )}

                  {customDialogueInput.trim() && (
                    <button
                      type="button"
                      onClick={() => setCustomDialogueInput('')}
                      className="text-[10px] font-bold text-red-600 hover:text-red-700 px-1.5 py-0.5 rounded cursor-pointer"
                    >
                      {lang === 'ar' ? 'مسح' : 'Clear'}
                    </button>
                  )}
                </div>
              </div>

              {/* Render Context Suggestions Box for customDialogueInput */}
              {renderContextSuggestionsPanel('custom_input', (sug) => handleApplyContextSuggestion('custom_input', sug))}
            </div>

            {/* Face Consistency Master Anchor Section */}
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-stone-900 font-black text-xs">
                  <Lock className="w-3.5 h-3.5 text-[#c29b40]" />
                  <span>{lang === 'ar' ? 'مثبت ملامح الوجه الموحد (Consistent Face Anchor)' : 'Lead Character Face Anchor'}</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                  {lang === 'ar' ? 'ثبات الوجوه 100%' : '100% Face Lock'}
                </span>
              </div>

              <p className="text-[11px] text-stone-600 leading-normal">
                {lang === 'ar'
                  ? 'سيتم تثبيت هذه الملامح وتضمين الرمز الماستر في برومبت كل مشهد لمنع تغير شكل البطل بين لقطات الفيديو.'
                  : 'These anatomical facial traits are locked into a master token embedded into every 10s scene prompt.'}
              </p>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 mb-0.5">
                    {lang === 'ar' ? 'اسم البطل' : 'Character Name'}
                  </label>
                  <input
                    type="text"
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                    placeholder={lang === 'ar' ? 'اسم البطل (اختياري - يُستنتج تلقائياً)' : 'Hero Name (optional - auto-deduced)'}
                    className="w-full text-xs rounded-lg border border-stone-300 p-2 bg-white text-stone-800 focus:outline-none focus:border-[#c29b40]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-500 mb-0.5">
                    {lang === 'ar' ? 'الجنس' : 'Gender'}
                  </label>
                  <input
                    type="text"
                    value={characterGender}
                    onChange={(e) => setCharacterGender(e.target.value)}
                    placeholder={lang === 'ar' ? 'ذكر / أنثى (اختياري)' : 'Male / Female (optional)'}
                    className="w-full text-xs rounded-lg border border-stone-300 p-2 bg-white text-stone-800 focus:outline-none focus:border-[#c29b40]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-500 mb-0.5">
                    {lang === 'ar' ? 'العمر' : 'Age'}
                  </label>
                  <input
                    type="text"
                    value={characterAge}
                    onChange={(e) => setCharacterAge(e.target.value)}
                    placeholder={lang === 'ar' ? 'مثال: 30' : 'e.g. 30'}
                    className="w-full text-xs rounded-lg border border-stone-300 p-2 bg-white text-stone-800 focus:outline-none focus:border-[#c29b40]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-500 mb-0.5">
                  {lang === 'ar' ? 'تفاصيل الملامح والسمات الفارقة (الفك، العيون، الندبات، الزي)' : 'Distinguishing Face Anatomy & Traits'}
                </label>
                <input
                  type="text"
                  value={characterFeature}
                  onChange={(e) => setCharacterFeature(e.target.value)}
                  placeholder={lang === 'ar' ? 'صف الملامح بدقة (اختياري - سيتم تحديدها تلقائياً من الفكرة)' : 'Describe facial features (optional - auto-deduced from concept)...'}
                  className="w-full text-xs rounded-lg border border-stone-300 p-2 bg-white text-stone-800 focus:outline-none focus:border-[#c29b40]"
                />
              </div>
            </div>

            {/* Generate Button */}
            <button
              type="submit"
              disabled={isGenerating || !concept.trim()}
              className={`w-full py-3.5 rounded-xl text-xs font-black shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isGenerating || !concept.trim()
                  ? 'bg-stone-300 text-stone-500 cursor-not-allowed shadow-none'
                  : 'bg-[#c29b40] hover:bg-[#a6802f] text-stone-950 shadow-[#c29b40]/25'
              }`}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-stone-950" />
                  <span>{lang === 'ar' ? 'جاري بناء القصة وتوليد المشاهد (10s لكل مشهد)...' : 'Synthesizing Story & 10s Screenplay...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-stone-950" />
                  <span>{lang === 'ar' ? 'توليد القصة وسيناريو الـ 10 ثوانٍ' : 'Generate Story & 10s Screenplay'}</span>
                </>
              )}
            </button>

            {/* Story Generator Tester Quick Action */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setIsTesterModalOpen(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-[#916a24] hover:text-[#78551b] text-xs font-bold transition-all flex items-center justify-center gap-2 border border-[#c29b40]/40 cursor-pointer shadow-2xs hover:scale-[1.01]"
                title={lang === 'ar' ? 'تشغيل فحص مؤتمت لجودة وسرعة مولد السيناريوهات على قصص معيارية' : 'Test Story-to-Screenplay Generator on benchmarks'}
              >
                <FlaskConical className="w-3.5 h-3.5 text-[#c29b40]" />
                <span>{lang === 'ar' ? '🧪 فحص واختبار مُولد السيناريوهات (Diagnostic Lab)' : '🧪 Story-to-Screenplay Generator Tester'}</span>
              </button>
            </div>
          </form>
          ) : (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* LocalStorage Auto-Save Status & Reset Controls */}
              <div className="flex items-center justify-between bg-amber-500/10 border border-[#c29b40]/30 rounded-xl px-3.5 py-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[11px] font-bold text-stone-800">
                    {lang === 'ar' ? '💾 مسودة السيناريو محفوظة تلقائياً في المتصفح (LocalStorage)' : '💾 Screenplay draft auto-saved in browser LocalStorage'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleResetManualDraft}
                  className="px-2 py-0.5 rounded-lg text-[10px] text-stone-500 hover:text-red-700 hover:bg-red-50 border border-stone-200 hover:border-red-200 transition-all cursor-pointer font-bold"
                  title={lang === 'ar' ? 'مسح المسودة والبدء من جديد' : 'Clear draft and reset'}
                >
                  {lang === 'ar' ? 'إعادة ضبط المسودة' : 'Reset Draft'}
                </button>
              </div>

              {/* Manual Mode Subtabs: Scene-by-Scene vs Bulk Paste */}
              <div className="flex rounded-xl bg-stone-100 p-1 border border-stone-200">
                <button
                  type="button"
                  onClick={() => setManualSubMode('scenes')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    manualSubMode === 'scenes'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <Film className="w-3.5 h-3.5 text-[#c29b40]" />
                  <span>{lang === 'ar' ? 'إدخال المشاهد مشهداً بمشهد (10s)' : 'Scene-by-Scene Editor'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setManualSubMode('bulk')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    manualSubMode === 'bulk'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-[#c29b40]" />
                  <span>{lang === 'ar' ? 'لصق نص السيناريو كاملاً' : 'Paste Raw Screenplay'}</span>
                </button>
              </div>

              {/* Quick Import from Historical Legends */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 border border-[#c29b40]/30">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#c29b40]" />
                  <span className="text-xs font-bold text-stone-800">
                    {lang === 'ar' ? 'استيراد سيناريو من مكتبة الأساطير والتاريخ العربي' : 'Import from Arabic Historical Legends'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLegendsModalOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-[#c29b40] hover:bg-[#a6802f] text-stone-950 text-xs font-black transition-all cursor-pointer shadow-xs"
                >
                  {lang === 'ar' ? 'تصفح واختيار' : 'Choose Legend'}
                </button>
              </div>

              {/* Title & Concept Inputs */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {lang === 'ar' ? 'عنوان الفيلم أو المشروع السينمائي' : 'Movie Title'}
                  </label>
                  <input
                    type="text"
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    placeholder={lang === 'ar' ? 'اكتب عنوان الفيلم...' : 'Movie title...'}
                    className="w-full text-xs rounded-xl border border-stone-300 p-2.5 bg-stone-50 text-stone-900 font-bold focus:outline-none focus:border-[#c29b40]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {lang === 'ar' ? 'فكرة القصة / الحبكة العامة (Logline)' : 'Story Premise / Logline'}
                  </label>
                  <textarea
                    rows={2}
                    value={manualConcept}
                    onChange={(e) => setManualConcept(e.target.value)}
                    placeholder={lang === 'ar' ? 'ملخص سريع لقصة الفيلم وسياق الأحداث...' : 'Brief summary of the story context...'}
                    className="w-full text-xs rounded-xl border border-stone-300 p-2.5 bg-stone-50 text-stone-900 focus:outline-none focus:border-[#c29b40]"
                  />
                </div>
              </div>

              {/* Character Details for Manual Mode */}
              <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-[#c29b40]" />
                    <span>{lang === 'ar' ? 'بطل السيناريو ومثبت الوجه' : 'Lead Character'}</span>
                  </span>
                  <span className="text-[10px] text-stone-500 font-medium">
                    {lang === 'ar' ? 'تثبيت الوجه في برومبتات الفيديو' : 'Face Lock in Prompts'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                    placeholder={lang === 'ar' ? 'اسم المتحدث / البطل (مثال: طارق)' : 'Character name'}
                    className="text-xs rounded-lg border border-stone-300 p-2 bg-white text-stone-800"
                  />
                  <input
                    type="text"
                    value={characterFeature}
                    onChange={(e) => setCharacterFeature(e.target.value)}
                    placeholder={lang === 'ar' ? 'سمات الوجه والمظهر (اختياري)' : 'Facial traits (optional)'}
                    className="text-xs rounded-lg border border-stone-300 p-2 bg-white text-stone-800"
                  />
                </div>
              </div>

              {/* Target AI & Visual Style for Manual Prompts */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-stone-600 mb-0.5">
                    {lang === 'ar' ? 'منصة الفيديو' : 'Video AI'}
                  </label>
                  <select
                    value={targetAiModel}
                    onChange={(e) => setTargetAiModel(e.target.value)}
                    className="w-full text-xs rounded-lg border border-stone-300 p-2 bg-white text-stone-800"
                  >
                    {VIDEO_AI_MODELS.map((m) => (
                      <option key={m.id} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-600 mb-0.5">
                    {lang === 'ar' ? 'الأسلوب البصري' : 'Visual Style'}
                  </label>
                  <select
                    value={visualStyle}
                    onChange={(e) => setVisualStyle(e.target.value)}
                    className="w-full text-xs rounded-lg border border-stone-300 p-2 bg-white text-stone-800"
                  >
                    {STYLE_PRESETS.map((s) => (
                      <option key={s.id} value={s.nameEn}>{lang === 'ar' ? s.nameAr : s.nameEn}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sub-mode 1: Scene by Scene */}
              {manualSubMode === 'scenes' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-stone-800 flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5 text-[#c29b40]" />
                      <span>{lang === 'ar' ? `المشاهد المدخلة (${manualScenes.length} مشاهد × 10 ثوانٍ)` : `Manual Scenes (${manualScenes.length} × 10s)`}</span>
                    </span>

                    <button
                      type="button"
                      onClick={handleAddManualScene}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-[#c29b40] text-amber-950 hover:text-stone-950 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border border-[#c29b40]/50"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{lang === 'ar' ? 'إضافة مشهد 10s' : 'Add Scene'}</span>
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                    {manualScenes.map((scene, idx) => {
                      const startSec = idx * 10;
                      const endSec = (idx + 1) * 10;
                      const pad = (n: number) => n < 10 ? `0${n}` : `${n}`;
                      const timingStr = `00:${pad(startSec)} - 00:${pad(endSec)}`;

                      return (
                        <div key={scene.id} className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/90 space-y-2.5 relative">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-[#c29b40] text-stone-950 font-bold">
                                {lang === 'ar' ? getArabicOrdinal(idx + 1) : getEnglishOrdinal(idx + 1)}
                              </span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-stone-200 text-stone-700">
                                ⏱️ {timingStr} (10s)
                              </span>
                            </div>

                            {manualScenes.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveManualScene(scene.id)}
                                className="p-1 rounded-md text-stone-400 hover:text-rose-600 hover:bg-stone-200 transition-colors cursor-pointer"
                                title={lang === 'ar' ? 'حذف هذا المشهد' : 'Delete scene'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          {/* Screenplay Beat Input */}
                          <div>
                            <label className="block text-[10px] font-bold text-stone-600 mb-0.5 flex items-center gap-1">
                              <FileText className="w-3 h-3 text-[#c29b40]" />
                              <span>{lang === 'ar' ? 'نَص السيناريو والحدث الدرامي (ماذا يحدث في الـ 10 ثوانٍ؟):' : 'Screenplay Action Beat:'}</span>
                            </label>
                            <textarea
                              rows={2}
                              value={scene.screenplayBeatAr}
                              onChange={(e) => handleUpdateManualScene(scene.id, 'screenplayBeatAr', e.target.value)}
                              placeholder={lang === 'ar' ? 'اكتب ما تفعله الشخصية في المشهد، حركة الكاميرا والبيئة...' : 'Describe character actions and environment...'}
                              className="w-full text-xs rounded-lg border border-stone-300 p-2 bg-white text-stone-800 focus:outline-none focus:border-[#c29b40]"
                            />
                          </div>

                          {/* Spoken Dialogue Input */}
                          <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/70 space-y-1.5">
                            <div className="flex flex-wrap items-center justify-between gap-1.5">
                              <label className="block text-[10px] font-black text-[#916a24] flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                <span>{lang === 'ar' ? 'الحوار الصوتي المنطوق (كلام الشخصية وحركة الشفاه):' : 'Spoken Dialogue & Lip-Sync:'}</span>
                              </label>

                              {/* Context Suggestions Button */}
                              <button
                                type="button"
                                disabled={isFetchingContextSuggestions && contextSuggestionsTarget === scene.id}
                                onClick={() => handleFetchDialogueContextSuggestions(
                                  scene.id,
                                  scene.dialogueAr,
                                  {
                                    sceneTitle: scene.titleAr,
                                    sceneBeat: scene.screenplayBeatAr,
                                    speakerName: scene.dialogueSpeaker,
                                    dialogueEmotion: scene.dialogueEmotion,
                                    concept: manualConcept || manualTitle,
                                    genre: genre
                                  }
                                )}
                                className="px-2 py-0.5 rounded-lg bg-stone-900 hover:bg-black text-[#f5d996] text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer border border-[#c29b40]/50 shadow-2xs hover:scale-102 active:scale-95 disabled:opacity-50"
                                title={lang === 'ar' ? 'اقتراح تحسينات وصيغ بديلة للجملة الحالية وفق طبيعة المشهد المختار' : 'Suggest contextual phrasing improvements based on this scene'}
                              >
                                <Sparkles className={`w-3 h-3 text-[#c29b40] ${isFetchingContextSuggestions && contextSuggestionsTarget === scene.id ? 'animate-spin' : ''}`} />
                                <span>
                                  {isFetchingContextSuggestions && contextSuggestionsTarget === scene.id
                                    ? (lang === 'ar' ? 'تحليل السياق...' : 'Analyzing...')
                                    : (lang === 'ar' ? '✨ اقتراحات السياق' : 'Context Suggestions')}
                                </span>
                              </button>
                            </div>

                            <input
                              type="text"
                              value={scene.dialogueAr}
                              onChange={(e) => handleUpdateManualScene(scene.id, 'dialogueAr', e.target.value)}
                              placeholder={lang === 'ar' ? 'اكتب ما تنطقه الشخصية بالحرف في هذا المشهد...' : 'Exact words spoken by character...'}
                              className="w-full text-xs rounded-lg border border-stone-300 p-2 bg-white text-stone-900 font-medium focus:outline-none focus:border-[#c29b40]"
                            />

                            <div className="grid grid-cols-2 gap-2 pt-1">
                              <input
                                type="text"
                                value={scene.dialogueSpeaker}
                                onChange={(e) => handleUpdateManualScene(scene.id, 'dialogueSpeaker', e.target.value)}
                                placeholder={lang === 'ar' ? 'اسم المتحدث' : 'Speaker'}
                                className="text-[11px] rounded-md border border-stone-300 p-1.5 bg-white text-stone-700"
                              />
                              <input
                                type="text"
                                value={scene.dialogueEmotion}
                                onChange={(e) => handleUpdateManualScene(scene.id, 'dialogueEmotion', e.target.value)}
                                placeholder={lang === 'ar' ? 'نبرة الإلقاء (همس، حازم، غاضب...)' : 'Emotion / tone'}
                                className="text-[11px] rounded-md border border-stone-300 p-1.5 bg-white text-stone-700"
                              />
                            </div>

                            {/* Render Context Suggestions Box if active for this scene */}
                            {renderContextSuggestionsPanel(scene.id, (sug) => handleApplyContextSuggestion(scene.id, sug))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sub-mode 2: Bulk Script Paste */}
              {manualSubMode === 'bulk' && (
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-stone-700">
                        {lang === 'ar' ? 'الصق نص السيناريو والحوار كاملاً:' : 'Paste Full Screenplay & Dialogues:'}
                      </label>
                      <span className="text-[10px] text-stone-500">
                        {lang === 'ar' ? 'افصل بين المشاهد بسطر فارغ' : 'Separate scenes by blank line'}
                      </span>
                    </div>
                    <textarea
                      rows={8}
                      value={manualBulkText}
                      onChange={(e) => setManualBulkText(e.target.value)}
                      placeholder={
                        lang === 'ar'
                          ? `المشهد الأول: يقف البطل أمام البوابة القديمة\nحوار: "لقد حانت لحظة الدخول."\n\nالمشهد الثاني: يفتح البوابة وسط عاصفة غبارية\nحوار: "الرياح تشتد وعلينا الإسراع!"\n\nالمشهد الثالث: يجد الصندوق الأثري فوق القمة\nحوار: "وجدنا الهدف أخيراً!"`
                          : `Scene 1: Detective enters the abandoned hangar\nDialogue: "Someone was here just minutes ago."\n\nScene 2: Inspects the tire marks\nDialogue: "Follow those tracks immediately!"`
                      }
                      className="w-full text-xs font-mono rounded-xl border border-stone-300 p-3.5 bg-stone-50 text-stone-900 focus:outline-none focus:border-[#c29b40]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleParseBulkScreenplay}
                    disabled={!manualBulkText.trim()}
                    className="w-full py-2.5 rounded-xl bg-stone-850 hover:bg-black text-[#f5d996] text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#c29b40]/40 disabled:opacity-50"
                  >
                    <Wand2 className="w-4 h-4 text-[#c29b40]" />
                    <span>{lang === 'ar' ? '✨ تقسيم النص تلقائياً إلى مشاهد 10s وحوارات' : 'Parse into 10s Scenes'}</span>
                  </button>
                </div>
              )}

              {/* Build and Compile Manual Project Button */}
              <button
                type="button"
                onClick={handleBuildManualProject}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-[#c29b40] hover:from-amber-600 hover:to-[#a6802f] text-stone-950 font-black text-xs shadow-lg shadow-[#c29b40]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4 text-stone-950" />
                <span>
                  {lang === 'ar'
                    ? `بناء وحفظ السيناريو اليدوي (${manualScenes.length} مشاهد مع برومبتات الفيديو)`
                    : `Build & Save Manual Screenplay (${manualScenes.length} Scenes)`}
                </span>
              </button>
            </div>
          )}
        </section>

        {/* Right Side: Cinema Workspace (Story, Face Anchor, 10s Scene Board & Player) */}
        <section className="lg:col-span-7 space-y-6">
          
          {/* Empty State when no project is active */}
          {!activeProject && !isGenerating && (
            <div className="bg-white rounded-3xl p-10 border border-stone-200 text-center flex flex-col items-center justify-center min-h-[460px] space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-[#c29b40] flex items-center justify-center border border-amber-200/60 shadow-xs">
                <Clapperboard className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-1.5">
                <h3 className="text-base font-bold text-stone-800">
                  {lang === 'ar' ? 'استوديو السينما جاهز لاستقبال فكرتك' : 'AI Cinema Studio is Ready'}
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  {lang === 'ar'
                    ? 'يمكنك توليد السيناريو آلياً بالذكاء الاصطناعي، أو اختيار الإدخال اليدوي لكتابة نصوص السيناريو والحوارات المنطوقة بنفسك لكل 10 ثوانٍ.'
                    : 'Generate screenplay automatically with AI, or choose manual mode to input actions and spoken dialogues yourself.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleStartNewManualProject}
                  className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-[#f5d996] text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border border-[#c29b40]/50 shadow-md"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#c29b40]" />
                  <span>{lang === 'ar' ? '✍️ إدخال السيناريو والحوار يدوياً' : '✍️ Enter Screenplay & Dialogue Manually'}</span>
                </button>

                {savedProjects.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsSavedDrawerOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border border-stone-300"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-[#c29b40]" />
                    <span>{lang === 'ar' ? `فتح مشروع سابق (${savedProjects.length})` : `Open Saved Project (${savedProjects.length})`}</span>
                  </button>
                )}
              </div>

              {/* Ready Arabic Historical & Legendary Movies (1-Click Instant Load into Studio) */}
              <div className="w-full max-w-xl pt-5 border-t border-stone-200/80 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black text-stone-800 flex items-center gap-1.5">
                    <span>📜</span>
                    <span>{lang === 'ar' ? 'سيناريوهات جاهزة من أساطير وتاريخ العرب (تحميل فوري):' : 'Ready Arabic Historical Legends (Instant Load):'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsLegendsModalOpen(true)}
                    className="text-[11px] font-bold text-[#916a24] hover:text-[#78551b] flex items-center gap-1 cursor-pointer"
                  >
                    <span>{lang === 'ar' ? 'عرض الكل' : 'View All'} ({ARABIC_HISTORICAL_LEGENDS.length})</span>
                    <ChevronLeft className={`w-3.5 h-3.5 ${lang === 'en' ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Sayf ibn Dhi Yazan */}
                  {ARABIC_HISTORICAL_LEGENDS.find(l => l.id === 'legend-sayf-roc') && (
                    <button
                      type="button"
                      onClick={() => handleLoadLegendAsActiveProject(ARABIC_HISTORICAL_LEGENDS.find(l => l.id === 'legend-sayf-roc')!)}
                      className="p-3 rounded-2xl bg-gradient-to-br from-amber-50 to-white hover:from-amber-100 hover:to-amber-50 border border-amber-200/80 hover:border-[#c29b40] transition-all text-start cursor-pointer group shadow-2xs hover:scale-[1.02]"
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-lg">🪶</span>
                        <span className="text-xs font-black text-stone-900 group-hover:text-[#916a24] line-clamp-1">
                          سيف بن ذي يزن
                        </span>
                      </div>
                      <p className="text-[10px] text-stone-500 line-clamp-2 leading-tight">
                        {lang === 'ar' ? 'قمة السحاب وعش طائر الرخ واسترداد سيف الأجداد' : 'Cloud peaks & mythic Roc bird'}
                      </p>
                      <span className="mt-2 text-[9px] font-bold text-[#916a24] flex items-center gap-1 font-mono">
                        ⚡ {lang === 'ar' ? 'تحميل 3 مشاهد (30s)' : 'Load 3 Scenes (30s)'}
                      </span>
                    </button>
                  )}

                  {/* Ibn Battuta */}
                  {ARABIC_HISTORICAL_LEGENDS.find(l => l.id === 'legend-ibn-battuta') && (
                    <button
                      type="button"
                      onClick={() => handleLoadLegendAsActiveProject(ARABIC_HISTORICAL_LEGENDS.find(l => l.id === 'legend-ibn-battuta')!)}
                      className="p-3 rounded-2xl bg-gradient-to-br from-amber-50 to-white hover:from-amber-100 hover:to-amber-50 border border-amber-200/80 hover:border-[#c29b40] transition-all text-start cursor-pointer group shadow-2xs hover:scale-[1.02]"
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-lg">🧭</span>
                        <span className="text-xs font-black text-stone-900 group-hover:text-[#916a24] line-clamp-1">
                          رحلات ابن بطوطة
                        </span>
                      </div>
                      <p className="text-[10px] text-stone-500 line-clamp-2 leading-tight">
                        {lang === 'ar' ? 'أمير الرحالة، صراع عواصف المونسون وتدوين عجائب الشرق' : 'Monsoon tempests & medieval wonders'}
                      </p>
                      <span className="mt-2 text-[9px] font-bold text-[#916a24] flex items-center gap-1 font-mono">
                        ⚡ {lang === 'ar' ? 'تحميل 3 مشاهد (30s)' : 'Load 3 Scenes (30s)'}
                      </span>
                    </button>
                  )}

                  {/* Sinbad */}
                  {ARABIC_HISTORICAL_LEGENDS.find(l => l.id === 'legend-sinbad-whale') && (
                    <button
                      type="button"
                      onClick={() => handleLoadLegendAsActiveProject(ARABIC_HISTORICAL_LEGENDS.find(l => l.id === 'legend-sinbad-whale')!)}
                      className="p-3 rounded-2xl bg-gradient-to-br from-amber-50 to-white hover:from-amber-100 hover:to-amber-50 border border-amber-200/80 hover:border-[#c29b40] transition-all text-start cursor-pointer group shadow-2xs hover:scale-[1.02]"
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-lg">🐋</span>
                        <span className="text-xs font-black text-stone-900 group-hover:text-[#916a24] line-clamp-1">
                          أسطورة سندباد
                        </span>
                      </div>
                      <p className="text-[10px] text-stone-500 line-clamp-2 leading-tight">
                        {lang === 'ar' ? 'الرسو على الجزيرة الخضراء وصحوة الحوت العملاق' : 'Awakening of the colossal titan whale'}
                      </p>
                      <span className="mt-2 text-[9px] font-bold text-[#916a24] flex items-center gap-1 font-mono">
                        ⚡ {lang === 'ar' ? 'تحميل 3 مشاهد (30s)' : 'Load 3 Scenes (30s)'}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Loading Screen */}
          {isGenerating && (
            <div className="bg-white rounded-3xl p-12 border border-stone-200 text-center flex flex-col items-center justify-center min-h-[460px] space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-[#c29b40]/20 border-t-[#c29b40] animate-spin" />
                <Film className="w-6 h-6 text-[#c29b40] absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="text-sm font-bold text-stone-800">
                  {lang === 'ar' ? 'المخرج السينمائي الذكي يقوم بالصياغة...' : 'AI Director is Crafting Screenplay...'}
                </h3>
                <p className="text-xs text-stone-500">
                  {lang === 'ar' 
                    ? 'نكتب الحبكة الدرامية، نثبت تشريح الوجه الماستر، ونقسم السيناريو لمشاهد متسلسلة مدتها 10 ثوانٍ.' 
                    : 'Constructing narrative arc, anchoring facial anatomy, and pacing scenes strictly into 10-second clips.'}
                </p>
              </div>
            </div>
          )}

          {/* Active Generated Screenplay Workspace */}
          {activeProject && !isGenerating && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Story Logline & Synopsis Card */}
              <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-sm space-y-4">
                {/* Project Title & Status Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
                  <div className="space-y-1 flex-1 min-w-0">
                    {isEditingTitle ? (
                      <div className="flex items-center gap-2 max-w-md">
                        <input
                          type="text"
                          value={projectTitleInput}
                          onChange={(e) => setProjectTitleInput(e.target.value)}
                          placeholder={lang === 'ar' ? 'اسم الفيلم...' : 'Movie title...'}
                          className="w-full text-base font-black text-stone-900 border border-[#c29b40] rounded-xl px-3 py-1.5 focus:outline-none bg-stone-50"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleUpdateProjectTitle();
                            if (e.key === 'Escape') setIsEditingTitle(false);
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleUpdateProjectTitle}
                          className="p-2 rounded-xl bg-[#c29b40] text-stone-950 hover:bg-[#a6802f] transition-all cursor-pointer font-bold"
                          title={lang === 'ar' ? 'تأكيد وحفظ الاسم' : 'Save Title'}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg sm:text-xl font-black text-stone-900 truncate">
                          {activeProject.titleAr}
                        </h3>
                        <button
                          type="button"
                          onClick={() => {
                            setProjectTitleInput(activeProject.titleAr);
                            setIsEditingTitle(true);
                          }}
                          className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all cursor-pointer"
                          title={lang === 'ar' ? 'تعديل اسم المشروع' : 'Edit project title'}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                    <p className="text-xs font-medium text-stone-500 truncate">
                      {activeProject.titleEn}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-50 text-[#916a24] border border-amber-200">
                      {activeProject.genre}
                    </span>
                    <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 border border-stone-200">
                      {activeProject.totalDurationSeconds}s ({activeProject.scenes.length} {lang === 'ar' ? 'مشاهد' : 'scenes'})
                    </span>
                  </div>
                </div>

                {/* Primary Project Save & Control Action Bar */}
                <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-amber-500/10 border border-amber-300/60 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSaveCurrentProject(activeProject, true)}
                      className="px-4 py-2 rounded-xl bg-[#c29b40] hover:bg-[#a6802f] text-stone-950 font-black text-xs transition-all flex items-center gap-1.5 shadow-md shadow-[#c29b40]/25 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Save className="w-4 h-4 stroke-[2.5]" />
                      <span>{lang === 'ar' ? 'حفظ المشروع السينمائي' : 'Save Movie Project'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveAsNewProject}
                      className="px-3 py-2 rounded-xl bg-white hover:bg-stone-50 text-stone-800 font-bold text-xs transition-all flex items-center gap-1.5 border border-stone-300 cursor-pointer shadow-xs"
                      title={lang === 'ar' ? 'حفظ نسخة جديدة من هذا المشروع' : 'Save a duplicate copy'}
                    >
                      <Layers className="w-3.5 h-3.5 text-[#916a24]" />
                      <span>{lang === 'ar' ? 'حفظ كنسخة' : 'Save Copy'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyAllPrompts('full')}
                      className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-[#c29b40] text-[#916a24] hover:text-stone-950 font-black text-xs transition-all flex items-center gap-1.5 border border-[#c29b40]/60 cursor-pointer shadow-xs hover:scale-[1.02] active:scale-[0.98]"
                      title={lang === 'ar' ? 'نسخ جميع برومبتات الفيلم (المشاهد والحوارات ومثبت الوجه)' : 'Copy all movie scene prompts'}
                    >
                      {copiedAllPrompts ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-700" />
                          <span className="text-emerald-800">{lang === 'ar' ? 'تم نسخ جميع البرومبتات!' : 'All Prompts Copied!'}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-[#916a24]" />
                          <span>{lang === 'ar' ? 'نسخ جميع البرومبتات' : 'Copy All Prompts'}</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsSavedDrawerOpen(true)}
                      className="px-3 py-2 rounded-xl bg-white hover:bg-stone-50 text-stone-800 font-bold text-xs transition-all flex items-center gap-1.5 border border-stone-300 cursor-pointer shadow-xs"
                    >
                      <FolderOpen className="w-3.5 h-3.5 text-[#916a24]" />
                      <span>{lang === 'ar' ? 'مشاريعي المحفوظة' : 'Saved Projects'}</span>
                      <span className="bg-[#c29b40] text-stone-950 text-[10px] font-mono font-black px-1.5 py-0.2 rounded-full">
                        {savedProjects.length}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsTesterModalOpen(true)}
                      className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-[#c29b40] text-[#916a24] hover:text-stone-950 font-bold text-xs transition-all flex items-center gap-1.5 border border-[#c29b40]/40 cursor-pointer shadow-xs hover:scale-102 active:scale-95"
                      title={lang === 'ar' ? 'فحص واختبار دقة وسرعة مولد السيناريوهات' : 'Test Story-to-Screenplay Generator'}
                    >
                      <FlaskConical className="w-3.5 h-3.5 text-[#c29b40]" />
                      <span>{lang === 'ar' ? 'مختبر الاختبار' : 'Tester Lab'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleExportTextFile}
                      className="px-3 py-2 rounded-xl bg-white hover:bg-stone-50 text-stone-800 font-bold text-xs transition-all flex items-center gap-1.5 border border-stone-300 cursor-pointer shadow-xs hover:border-[#c29b40] hover:text-[#916a24]"
                      title={lang === 'ar' ? 'تصدير السيناريو والحوارات كملف نصي (TXT)' : 'Export Screenplay as Text File (.txt)'}
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>{lang === 'ar' ? 'ملف نصي (.txt)' : 'Text File (.txt)'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePrintPdf}
                      className="px-3 py-2 rounded-xl bg-stone-900 hover:bg-black text-[#f5d996] font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs border border-stone-800 hover:border-[#c29b40]"
                      title={lang === 'ar' ? 'تصدير وحفظ السيناريو كملف PDF للطباعة والمشاركة' : 'Export and Save Screenplay as PDF'}
                    >
                      <Printer className="w-3.5 h-3.5 text-[#c29b40]" />
                      <span>{lang === 'ar' ? 'تصدير PDF' : 'Export PDF'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleOpenExportModal}
                      className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer border border-stone-200 shadow-xs"
                      title={lang === 'ar' ? 'خيارات التصدير والمعاينة (Text, PDF, Markdown)' : 'Export & Screenplay Preview'}
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{lang === 'ar' ? 'خيارات التصدير...' : 'Export Options...'}</span>
                    </button>
                  </div>

                  {/* Auto-Save & Storage Indicators */}
                  <div className="flex items-center gap-2 text-[11px] font-sans">
                    <span className="flex items-center gap-1 font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{lang === 'ar' ? (lastSavedAt ? `تم الحفظ: ${lastSavedAt}` : 'محفوظ تلقائياً') : (lastSavedAt ? `Saved at ${lastSavedAt}` : 'Auto-saved')}</span>
                    </span>

                    {user && user.uid ? (
                      <span className="text-[10px] text-sky-800 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200 font-medium">
                        ☁️ {lang === 'ar' ? 'متزامن سحابياً' : 'Cloud Synced'}
                      </span>
                    ) : (
                      <span className="text-[10px] text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200 font-medium">
                        💾 {lang === 'ar' ? 'محفوظ محلياً' : 'Local Storage'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Logline */}
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-1">
                  <span className="text-[10px] font-black tracking-wider uppercase text-[#916a24] block">
                    {lang === 'ar' ? '📜 الفكرة المركزية (Logline)' : '📜 Core Logline'}
                  </span>
                  <p className="text-xs text-stone-800 font-medium leading-relaxed">
                    {activeProject.loglineAr}
                  </p>
                </div>

                {/* Synopsis Accordion */}
                <details className="text-xs text-stone-700 bg-stone-50/50 rounded-xl p-3 border border-stone-200/60 cursor-pointer">
                  <summary className="font-bold text-stone-800 select-none flex items-center justify-between">
                    <span>{lang === 'ar' ? '📖 ملخص القصة وتطور الأحداث (Synopsis)' : '📖 Story Synopsis'}</span>
                    <span className="text-[10px] text-stone-500">{lang === 'ar' ? 'عرض/إخفاء' : 'Toggle'}</span>
                  </summary>
                  <div className="mt-2.5 pt-2.5 border-t border-stone-200 space-y-2 text-stone-600 leading-relaxed font-sans">
                    <p>{activeProject.storySynopsisAr}</p>
                    <p className="text-[11px] text-stone-500 italic">{activeProject.storySynopsisEn}</p>
                  </div>
                </details>

                {/* Consistent Face Anchor Master Pill Box */}
                {activeProject.characterAnchor && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-amber-500/10 border border-amber-300/60 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#c29b40] text-stone-950 flex items-center justify-center font-black shadow-xs">
                          <UserCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-black text-stone-900 block">
                            {lang === 'ar' ? '🔒 رمز تثبيت ملامح الوجه الموحد (Master Face Token)' : '🔒 Master Character Face Consistency Token'}
                          </span>
                          <span className="text-[10px] text-stone-500">
                            {activeProject.characterAnchor.name} • {activeProject.characterAnchor.role}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopyToken(activeProject.characterAnchor.consistencyPromptToken)}
                        className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 hover:bg-amber-50 text-[11px] font-bold text-[#916a24] transition-all flex items-center gap-1 cursor-pointer"
                      >
                        {copiedToken ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700">{lang === 'ar' ? 'تم النسخ' : 'Copied'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>{lang === 'ar' ? 'نسخ الرمز' : 'Copy Token'}</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-amber-200/80 font-mono text-[11px] text-stone-800 break-all select-all">
                      {activeProject.characterAnchor.consistencyPromptToken}
                    </div>

                    <div className="text-[11px] text-stone-600 flex items-start gap-1.5 font-sans">
                      <Info className="w-3.5 h-3.5 text-[#c29b40] shrink-0 mt-0.5" />
                      <span>
                        {lang === 'ar'
                          ? 'هذا الرمز مدمج حرفياً في بداية كل مشهد أدناه، مما يجبر Kling و Runway و Sora على توليد نفس الوجه دون انحراف.'
                          : 'This token is automatically injected into every 10s scene prompt below to maintain exact character facial consistency.'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Interactive Story Branching Path Decision System (اختيار المسار) */}
              {activeProject.availablePaths && activeProject.availablePaths.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="bg-gradient-to-br from-amber-950/40 via-stone-900 to-stone-950 text-white rounded-3xl p-5 sm:p-6 border border-[#c29b40]/50 shadow-xl space-y-4 relative overflow-hidden"
                >
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.08, 0.18, 0.08]
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-0 right-0 w-72 h-72 bg-[#c29b40]/20 rounded-full blur-3xl pointer-events-none" 
                  />

                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10 border-b border-white/10 pb-3.5">
                    <div className="flex items-center gap-3">
                      <motion.div 
                        whileHover={{ rotate: 15, scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#c29b40] to-amber-600 text-stone-950 flex items-center justify-center font-black shadow-md shrink-0 cursor-default"
                      >
                        <Compass className="w-5 h-5" />
                      </motion.div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-white tracking-wide flex items-center gap-1.5">
                            <span>🧭</span>
                            <span>{lang === 'ar' ? 'نظام اختيار المسار التفاعلي (Story Branching Paths)' : 'Interactive Story Branching Paths'}</span>
                          </h4>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#c29b40] text-stone-950">
                            DECISION ENGINE
                          </span>
                        </div>
                        <p className="text-[11px] text-amber-200/80 mt-0.5">
                          {lang === 'ar' 
                            ? 'اتخذ قرارات مصيرية للبطل لتغيير مسار الأحداث والحوارات ونصوص أوامر الفيديو (AI Prompts) فورياً!' 
                            : 'Make pivotal story decisions to instantly alter scene events, dialogues, and resulting AI video prompts!'}
                        </p>
                      </div>
                    </div>

                    <AnimatePresence mode="wait">
                      {activeProject.activePathId && (
                        <motion.div 
                          key={activeProject.activePathId}
                          initial={{ opacity: 0, scale: 0.85, y: 5 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.85, y: -5 }}
                          transition={{ type: "spring", stiffness: 350, damping: 22 }}
                          className="text-xs font-mono font-bold text-stone-300 bg-white/5 px-3 py-1.5 rounded-xl border border-[#c29b40]/50 flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
                        >
                          <span className="text-[#c29b40] font-black">{lang === 'ar' ? 'المسار المعتمد:' : 'Active:'}</span>
                          <span className="text-amber-100 font-extrabold flex items-center gap-1">
                            <span>{activeProject.availablePaths.find(p => p.id === activeProject.activePathId)?.icon}</span>
                            <span>{activeProject.availablePaths.find(p => p.id === activeProject.activePathId)?.[lang === 'ar' ? 'nameAr' : 'nameEn'] || activeProject.activePathId}</span>
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Path Choices Cards */}
                  <motion.div 
                    variants={{
                      hidden: { opacity: 0 },
                      show: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.1
                        }
                      }
                    }}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-3 gap-3.5 relative z-10"
                  >
                    {activeProject.availablePaths.map((path) => {
                      const isActive = activeProject.activePathId === path.id;
                      return (
                        <motion.div
                          key={path.id}
                          layout
                          variants={{
                            hidden: { opacity: 0, y: 20 },
                            show: { 
                              opacity: 1, 
                              y: 0,
                              transition: { duration: 0.35, ease: "easeOut" }
                            }
                          }}
                          whileHover={{ 
                            y: -5,
                            scale: 1.015,
                            transition: { duration: 0.2, ease: "easeOut" }
                          }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSelectStoryPath(path.id)}
                          className={`p-4 rounded-2xl border transition-colors cursor-pointer flex flex-col justify-between gap-3 text-start relative group overflow-hidden ${
                            isActive
                              ? 'bg-gradient-to-b from-[#c29b40]/25 via-amber-950/40 to-stone-900 border-[#c29b40] shadow-lg shadow-[#c29b40]/25 ring-2 ring-[#c29b40]/60'
                              : 'bg-stone-900/80 hover:bg-stone-850 border-stone-800 hover:border-amber-400/40'
                          }`}
                        >
                          {/* Animated Top Glow for Active Path */}
                          {isActive && (
                            <motion.div 
                              layoutId="activePathGlow"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                              className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-[#f5d996] to-amber-500 shadow-[0_0_12px_#f5d996]"
                            />
                          )}

                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <motion.span 
                                whileHover={{ rotate: [-6, 6, -3, 0], scale: 1.15 }}
                                transition={{ duration: 0.35 }}
                                className="text-2xl p-1.5 bg-black/40 rounded-xl border border-white/10 shrink-0 inline-block"
                              >
                                {path.icon}
                              </motion.span>
                              <div className="flex items-center gap-1.5">
                                {path.badgeAr && (
                                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border ${
                                    isActive
                                      ? 'bg-[#c29b40] text-stone-950 border-[#c29b40]'
                                      : 'bg-white/10 text-stone-300 border-white/10'
                                  }`}>
                                    {lang === 'ar' ? path.badgeAr : (path.badgeEn || path.badgeAr)}
                                  </span>
                                )}
                                <AnimatePresence>
                                  {isActive && (
                                    <motion.span 
                                      initial={{ scale: 0, opacity: 0 }}
                                      animate={{ scale: 1, opacity: 1 }}
                                      exit={{ scale: 0, opacity: 0 }}
                                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                                      className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" 
                                      title="Active Path" 
                                    />
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>

                            <div>
                              <h5 className={`text-xs font-black transition-colors ${
                                isActive ? 'text-[#f5d996]' : 'text-white group-hover:text-amber-200'
                              }`}>
                                {lang === 'ar' ? path.nameAr : path.nameEn}
                              </h5>
                              <p className="text-[11px] text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                                {lang === 'ar' ? path.descriptionAr : path.descriptionEn}
                              </p>
                            </div>

                            {/* Outcome Preview */}
                            {(path.outcomePreviewAr || path.outcomePreviewEn) && (
                              <motion.div 
                                layout
                                className={`p-2.5 rounded-xl border text-[10px] leading-relaxed transition-all ${
                                  isActive
                                    ? 'bg-amber-950/40 border-[#c29b40]/50 text-amber-100 shadow-inner'
                                    : 'bg-black/50 border-white/10 text-amber-200/90'
                                }`}
                              >
                                <span className="font-bold text-amber-400 flex items-center gap-1 mb-0.5">
                                  <span>⚡</span>
                                  <span>{lang === 'ar' ? 'التحول الدرامي الناتج:' : 'Dramatic Outcome:'}</span>
                                </span>
                                {lang === 'ar' ? path.outcomePreviewAr : (path.outcomePreviewEn || path.outcomePreviewAr)}
                              </motion.div>
                            )}

                            {/* Prompt Modifiers tags */}
                            {path.promptModifierKeywords && path.promptModifierKeywords.length > 0 && (
                              <div className="space-y-1 pt-1">
                                <span className="text-[9px] text-stone-400 font-bold block">
                                  {lang === 'ar' ? 'تعديل كلمات البرومبت:' : 'Prompt Keywords:'}
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {path.promptModifierKeywords.map((kw, kwIdx) => (
                                    <motion.span 
                                      key={kwIdx}
                                      whileHover={{ scale: 1.08 }}
                                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded border transition-colors ${
                                        isActive
                                          ? 'bg-[#c29b40]/20 text-[#f5d996] border-[#c29b40]/40'
                                          : 'bg-white/5 text-amber-300/80 border-white/5'
                                      }`}
                                    >
                                      +{kw}
                                    </motion.span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px]">
                            <span className="text-[10px] font-mono text-stone-400">
                              {path.sceneOverrides.length} {lang === 'ar' ? 'مشاهد تتغير' : 'altered scenes'}
                            </span>

                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectStoryPath(path.id);
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                                isActive
                                  ? 'bg-[#c29b40] text-stone-950 shadow-md shadow-[#c29b40]/30'
                                  : 'bg-white/10 hover:bg-[#c29b40] text-white hover:text-stone-950'
                              }`}
                            >
                              <AnimatePresence mode="wait">
                                {isActive ? (
                                  <motion.div 
                                    key="applied" 
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.8, opacity: 0 }}
                                    className="flex items-center gap-1"
                                  >
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                    <span>{lang === 'ar' ? 'المسار المعتمد' : 'Applied'}</span>
                                  </motion.div>
                                ) : (
                                  <motion.div 
                                    key="choose" 
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.8, opacity: 0 }}
                                    className="flex items-center gap-1"
                                  >
                                    <Wand2 className="w-3.5 h-3.5" />
                                    <span>{lang === 'ar' ? 'اختيار المسار' : 'Choose Path'}</span>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </motion.div>
              )}

              {/* 10-Second Scene Playback Simulator */}
              <div className="bg-stone-900 text-white rounded-3xl p-5 sm:p-6 border border-stone-800 shadow-md space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#c29b40] text-stone-950 flex items-center justify-center font-black">
                      <Play className="w-4 h-4 ml-0.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white tracking-wide">
                        {lang === 'ar' ? 'محاكي العرض السينمائي (10s Scene Player)' : '10s Scene Playback Simulator'}
                      </h4>
                      <p className="text-[10px] text-stone-400">
                        {lang === 'ar' ? 'استعراض تسلسل اللقطات بمعدل 10 ثوانٍ لكل مشهد' : 'Real-time 10-second scene pacing scrubber'}
                      </p>
                    </div>
                  </div>

                  {/* Player Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPlaybackSeconds(0);
                        setActiveSceneIndex(0);
                        setIsPlaying(false);
                      }}
                      className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-all cursor-pointer"
                      title={lang === 'ar' ? 'إعادة للبداية' : 'Reset to start'}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="px-4 py-1.5 rounded-lg bg-[#c29b40] hover:bg-[#a6802f] text-stone-950 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-3.5 h-3.5" />
                          <span>{lang === 'ar' ? 'إيقاف مؤقت' : 'Pause'}</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 ml-0.5" />
                          <span>{lang === 'ar' ? 'تشغيل المحاكي' : 'Play Sequence'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Progress bar across full duration */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-mono text-stone-400">
                    <span>
                      {String(Math.floor(playbackSeconds / 60)).padStart(2, '0')}:
                      {String(playbackSeconds % 60).padStart(2, '0')}
                    </span>
                    <span className="font-bold text-[#f5d996]">
                      {lang === 'ar' ? `${getArabicOrdinal(activeSceneIndex + 1)} من أصل ${activeProject.scenes.length} مشاهد` : `${getEnglishOrdinal(activeSceneIndex + 1)} of ${activeProject.scenes.length} scenes`}
                    </span>
                    <span>
                      {String(Math.floor(activeProject.totalDurationSeconds / 60)).padStart(2, '0')}:
                      {String(activeProject.totalDurationSeconds % 60).padStart(2, '0')}
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-stone-800 rounded-full overflow-hidden relative">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-[#c29b40] transition-all duration-300"
                      style={{
                        width: `${Math.min(100, (playbackSeconds / (activeProject.totalDurationSeconds || 1)) * 100)}%`
                      }}
                    />
                    {/* Scene divider markers every 10s */}
                    {activeProject.scenes.map((_, i) => (
                      <div
                        key={i}
                        className="absolute top-0 bottom-0 w-0.5 bg-stone-900/80 pointer-events-none"
                        style={{
                          left: `${((i * 10) / activeProject.totalDurationSeconds) * 100}%`
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Active Playing Scene Snapshot */}
                {activeProject.scenes[activeSceneIndex] && (
                  <div className="p-3.5 rounded-2xl bg-stone-850 border border-stone-800 flex items-start justify-between gap-3 animate-in fade-in">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-[#c29b40] text-stone-950 font-bold">
                          {lang === 'ar' ? getArabicOrdinal(activeSceneIndex + 1) : getEnglishOrdinal(activeSceneIndex + 1)}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-stone-800 text-stone-300">
                          {activeProject.scenes[activeSceneIndex].timeRange}
                        </span>
                        <h5 className="text-xs font-bold text-white">
                          {activeProject.scenes[activeSceneIndex].titleAr}
                        </h5>
                      </div>
                      <p className="text-xs text-stone-300 leading-normal">
                        {activeProject.scenes[activeSceneIndex].dramaticActionAr}
                      </p>
                      {activeProject.scenes[activeSceneIndex].dialogueAr && (
                        <p className="text-[11px] text-[#f5d996] font-medium">
                          💬 {activeProject.scenes[activeSceneIndex].dialogueAr}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 10-Second Scenes Breakdown Board */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Film className="w-4 h-4 text-[#c29b40]" />
                    <h4 className="text-sm font-black text-stone-900">
                      {lang === 'ar' ? 'لوحة المشاهد السينمائية (10 ثوانٍ لكل لقطة)' : 'Screenplay Scene Cards (10s Each)'}
                    </h4>
                    <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-full bg-amber-100 text-[#916a24] border border-amber-300">
                      {activeProject.scenes.length} {lang === 'ar' ? 'مشاهد' : 'scenes'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyAllPrompts('full')}
                      className="px-3.5 py-1.5 rounded-xl bg-[#c29b40] hover:bg-[#a6802f] text-stone-950 font-black text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                      title={lang === 'ar' ? 'نسخ جميع برومبتات الفيلم مع التفاصيل الدرامية والحوارات' : 'Copy all movie scene prompts'}
                    >
                      {copiedAllPrompts ? (
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
                      onClick={() => handleCopyAllPrompts('prompts_only')}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-50 text-stone-800 font-bold text-xs transition-all flex items-center gap-1.5 border border-stone-200 cursor-pointer shadow-xs"
                      title={lang === 'ar' ? 'نسخ نصوص أوامر الفيديو بالإنجليزية فقط لمحركات التوليد (Runway / Kling / Sora)' : 'Copy English prompts only for batch video generation'}
                    >
                      {copiedAllCleanPrompts ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">{lang === 'ar' ? 'تم نسخ الأوامر فقط!' : 'Prompts Only Copied!'}</span>
                        </>
                      ) : (
                        <>
                          <FileText className="w-3.5 h-3.5 text-[#916a24]" />
                          <span>{lang === 'ar' ? 'أوامر الفيديو فقط (Queue)' : 'Prompts Only'}</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleAddNewScene}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#c29b40] to-amber-600 hover:from-[#a6802f] hover:to-amber-700 text-stone-950 text-xs font-black transition-all flex items-center gap-1.5 shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                      title={lang === 'ar' ? 'إعداد المشهد يدوياً بسيناريو وحوار أو تصميمه بالذكاء الاصطناعي' : 'Author Scene manually or design with AI'}
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span>{lang === 'ar' ? 'إعداد وإضافة مشهد (10s)' : 'Author / Add Scene'}</span>
                    </button>
                  </div>
                </div>

                {/* Act Filter Tabs */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-stone-100/80 rounded-2xl border border-stone-200/80">
                  <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
                    <span className="text-[11px] text-stone-500 font-bold px-1">{lang === 'ar' ? 'تصفية الفصول:' : 'Act Filter:'}</span>
                    <button
                      type="button"
                      onClick={() => setSceneActFilter('all')}
                      className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                        sceneActFilter === 'all'
                          ? 'bg-stone-900 text-[#f5d996] shadow-xs'
                          : 'bg-white text-stone-700 hover:bg-stone-50 border border-stone-200'
                      }`}
                    >
                      {lang === 'ar' ? 'جميع المشاهد' : 'All Scenes'} ({activeProject.scenes.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setSceneActFilter('act1')}
                      className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                        sceneActFilter === 'act1'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white text-blue-800 hover:bg-blue-50 border border-blue-200'
                      }`}
                    >
                      <span>🎬</span>
                      <span>{lang === 'ar' ? 'الفصل 1: البداية' : 'Act I'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSceneActFilter('act2')}
                      className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                        sceneActFilter === 'act2'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-white text-amber-800 hover:bg-amber-50 border border-amber-200'
                      }`}
                    >
                      <span>⚔️</span>
                      <span>{lang === 'ar' ? 'الفصل 2: الصراع' : 'Act II'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSceneActFilter('act3')}
                      className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                        sceneActFilter === 'act3'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-200'
                      }`}
                    >
                      <span>🏆</span>
                      <span>{lang === 'ar' ? 'الفصل 3: الذروة' : 'Act III'}</span>
                    </button>
                  </div>

                  {activeProject.templateId && (
                    <span className="text-[11px] font-bold text-[#916a24] bg-white px-2.5 py-1 rounded-xl border border-amber-300 shadow-2xs">
                      🎭 {lang === 'ar' ? `قالب: ${SCREENPLAY_TEMPLATES.find(t => t.id === activeProject.templateId)?.nameAr || activeProject.templateId}` : `Template: ${activeProject.templateId}`}
                    </span>
                  )}
                </div>

                {/* Scene Cards List */}
                <div className="space-y-5">
                  {activeProject.scenes
                    .filter(scene => sceneActFilter === 'all' || scene.actPhase === sceneActFilter)
                    .map((scene, idx) => (
                    <div
                      key={scene.sceneNumber || idx}
                      className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all duration-200 shadow-xs space-y-4 ${
                        activeSceneIndex === idx && isPlaying
                          ? 'border-[#c29b40] ring-2 ring-[#c29b40]/20'
                          : 'border-stone-200/90 hover:border-stone-300'
                      }`}
                    >
                      {/* Scene Header */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3.5">
                        <div className="flex flex-wrap items-center gap-2.5">
                          {/* Distinct prominent Ordinal Badge: المشهد الأول, المشهد الثاني, etc. */}
                          <div className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 text-[#f5d996] border border-[#c29b40]/50 font-black text-xs sm:text-sm flex items-center gap-2 shadow-xs">
                            <Clapperboard className="w-3.5 h-3.5 text-[#c29b40] shrink-0" />
                            <span>{lang === 'ar' ? getArabicOrdinal(scene.sceneNumber || idx + 1) : getEnglishOrdinal(scene.sceneNumber || idx + 1)}</span>
                            <span className="text-[10px] font-mono text-stone-400 bg-stone-800/80 px-1.5 py-0.2 rounded border border-stone-700">
                              #{scene.sceneNumber || idx + 1}
                            </span>
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h5 className="text-xs sm:text-sm font-black text-stone-900">
                                {scene.titleAr}
                              </h5>
                              {scene.screenplaySlug && (
                                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
                                  {scene.screenplaySlug}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-stone-500 font-medium">
                              {scene.titleEn}
                            </span>
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          {/* Act Phase Badge */}
                          {scene.actLabelAr && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                              scene.actPhase === 'act1'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : (scene.actPhase === 'act2'
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-200')
                            }`}>
                              <span>{scene.actPhase === 'act1' ? '🎬' : (scene.actPhase === 'act2' ? '⚔️' : '🏆')}</span>
                              <span>{lang === 'ar' ? scene.actLabelAr : (scene.actLabelEn || scene.actLabelAr)}</span>
                            </span>
                          )}
                          <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-md bg-amber-100 text-[#916a24] border border-amber-300">
                            ⏱️ {scene.timeRange} (10s)
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
                            🎥 {scene.shotType}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
                            🔄 {scene.cameraMotion}
                          </span>
                          {/* Story Path Overridden Badge */}
                          {activeProject.availablePaths?.find(p => p.id === activeProject.activePathId)?.sceneOverrides.some(o => o.sceneNumber === (scene.sceneNumber || idx + 1)) && (
                            <motion.span 
                              initial={{ scale: 0.75, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ type: "spring", stiffness: 450, damping: 20 }}
                              className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 border border-purple-300 flex items-center gap-1 shadow-2xs"
                            >
                              <span className="animate-spin text-[10px]" style={{ animationDuration: '4s' }}>🧭</span>
                              <span>{lang === 'ar' ? 'معدل بالمسار المختار' : 'Path Modified'}</span>
                            </motion.span>
                          )}
                        </div>
                      </div>

                      {/* Screenplay Narrative Action Beat */}
                      <div className="p-3.5 rounded-2xl bg-stone-50/80 border border-stone-200/70 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-stone-700 uppercase tracking-wide flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-[#c29b40]" />
                            <span>{lang === 'ar' ? '🎬 نَص السيناريو والحدث الدرامي (Scene Action):' : '🎬 Screenplay Narrative Action Beat:'}</span>
                          </span>

                          <button
                            type="button"
                            onClick={() => handleCopyAction(scene.screenplayBeatAr || scene.dramaticActionAr, idx)}
                            className="px-2 py-0.5 rounded-md bg-white hover:bg-stone-100 text-[10px] font-bold text-stone-700 transition-all flex items-center gap-1 cursor-pointer border border-stone-200"
                            title={lang === 'ar' ? 'نسخ نص السيناريو' : 'Copy screenplay action'}
                          >
                            {copiedActionIndex === idx ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-700">{lang === 'ar' ? 'تم النسخ' : 'Copied'}</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>{lang === 'ar' ? 'نسخ السيناريو' : 'Copy Action'}</span>
                              </>
                            )}
                          </button>
                        </div>

                        <p className="text-xs text-stone-800 leading-relaxed font-medium">
                          {scene.screenplayBeatAr || scene.dramaticActionAr}
                        </p>
                        {scene.screenplayBeatEn && (
                          <p className="text-[11px] text-stone-500 italic font-sans border-t border-stone-200/50 pt-1.5">
                            {scene.screenplayBeatEn}
                          </p>
                        )}
                      </div>

                      {/* Character Spoken Dialogue & Lip-Sync Card (Interactive Dialogue with Smart Style Suggestions & Local AI Scene Refiner) */}
                      <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-300/80 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-[#c29b40] text-stone-950 flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />
                              <span>{scene.dialogueSpeaker || activeProject.characterAnchor?.name || (lang === 'ar' ? 'البطل' : 'Character')}</span>
                            </span>
                            {scene.dialogueEmotion && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-[#916a24] border border-amber-200">
                                🎭 {scene.dialogueEmotion}
                              </span>
                            )}
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white text-stone-700 border border-amber-200">
                              ⏱️ {scene.dialogueTiming || scene.timeRange}
                            </span>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                              <span>⚡</span>
                              <span>{lang === 'ar' ? 'ذكاء محلي' : 'Local AI'}</span>
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5">
                            {/* Smart Style Suggestions Trigger */}
                            <button
                              type="button"
                              onClick={() => handleOpenSmartDialogueSuggestions(idx, scene)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all flex items-center gap-1 cursor-pointer border shadow-xs active:scale-95 ${
                                contextSuggestionsData?.targetId === `scene_card_${idx}`
                                  ? 'bg-[#c29b40] text-stone-950 border-[#c29b40]'
                                  : 'bg-amber-500/20 hover:bg-[#c29b40] text-amber-950 hover:text-stone-950 border-[#c29b40]/60'
                              }`}
                              title={lang === 'ar' ? 'اقتراح ذكي: تحسينات أسلوبية للنص بناءً على سياق المشهد' : 'Smart Suggestion: Contextual style improvements'}
                            >
                              <Sparkles className="w-3 h-3 text-[#916a24]" />
                              <span>{lang === 'ar' ? '💡 اقتراح ذكي' : '💡 Smart Style'}</span>
                            </button>

                            <button
                              type="button"
                              disabled={regeneratingDialogueIndex === idx}
                              onClick={() => handleRegenerateSceneDialogue(idx)}
                              className="px-2.5 py-1 rounded-lg bg-white hover:bg-stone-50 text-[10px] font-bold text-stone-700 transition-all flex items-center gap-1 cursor-pointer border border-stone-200 shadow-xs"
                              title={lang === 'ar' ? 'توليد حوار جديد من فكرة القصة' : 'Regenerate from idea'}
                            >
                              {regeneratingDialogueIndex === idx ? (
                                <>
                                  <RefreshCw className="w-3 h-3 animate-spin text-[#916a24]" />
                                  <span>{lang === 'ar' ? 'جاري التوليد...' : 'Generating...'}</span>
                                </>
                              ) : (
                                <>
                                  <Wand2 className="w-3 h-3 text-[#916a24]" />
                                  <span>{lang === 'ar' ? 'توليد كامل' : 'Full Gen'}</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleCopyDialogue(scene.dialogueAr || scene.dialogueEn || '', idx)}
                              className="p-1 rounded-lg bg-white hover:bg-amber-100 text-[#916a24] transition-all cursor-pointer border border-amber-300 shadow-xs"
                              title={lang === 'ar' ? 'نسخ الحوار المنطوق' : 'Copy dialogue'}
                            >
                              {copiedDialogueIndex === idx ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Interactive Direct Dialogue Input & Local AI Auto-Refiner */}
                        <div className="space-y-1.5">
                          <div className="relative">
                            <textarea
                              rows={2}
                              value={scene.dialogueAr || ''}
                              onChange={(e) => handleInlineSceneDialogueChange(idx, e.target.value)}
                              placeholder={lang === 'ar' ? 'أدخل نص الحوار المنطوق هنا مباشرة أو اضغط «اقتراح ذكي»...' : 'Type spoken dialogue directly or click Smart Style...'}
                              className="w-full text-xs font-bold text-stone-900 bg-white/95 rounded-xl border border-amber-300/80 p-2.5 shadow-2xs focus:outline-none focus:border-[#c29b40] focus:ring-1 focus:ring-[#c29b40]/50 transition-all leading-relaxed placeholder-stone-400"
                            />
                          </div>

                          {scene.dialogueEn && (
                            <p className="text-[11px] text-stone-500 italic font-mono px-1">
                              "{scene.dialogueEn}"
                            </p>
                          )}
                        </div>

                        {/* Contextual Dialogue Suggestions Panel (Displayed when user clicks 💡 اقتراح ذكي) */}
                        {renderContextSuggestionsPanel(`scene_card_${idx}`, (sug) => handleApplyContextSuggestion(`scene_card_${idx}`, sug))}

                        <div className="pt-1.5 border-t border-amber-200/50 flex flex-wrap items-center justify-between text-[10px] text-[#916a24]">
                          <span className="flex items-center gap-1 font-medium">
                            <Sparkles className="w-3 h-3 text-[#c29b40]" />
                            <span>
                              {lang === 'ar'
                                ? 'أي تعديل أو اختيار ذكي يعيد ضبط توقيت حركة الشفاه والبرومبت محلياً وتلقائياً.'
                                : 'Any edit or smart suggestion immediately refines lip-sync timing and video prompt locally.'}
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Sound Design if any */}
                      {scene.soundDesign && (
                        <div className="flex items-center gap-1.5 text-[11px] text-stone-600 bg-stone-50 p-2 rounded-xl border border-stone-200/70">
                          <Volume2 className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span className="font-medium truncate">{scene.soundDesign}</span>
                        </div>
                      )}

                      {/* Master AI Video Prompt Box (Contains Screenplay + Spoken Dialogue + Lip-Sync) */}
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <div>
                            <span className="text-[10px] font-black text-stone-700 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-[#c29b40]" />
                              {lang === 'ar' 
                                ? `برومبت الفيديو الشامل (10s) لـ ${activeProject.targetAiModel}:` 
                                : `Master 10s Video Prompt for ${activeProject.targetAiModel}:`}
                            </span>
                            <span className="text-[9px] text-stone-500 block">
                              {lang === 'ar'
                                ? '(مدمج به السيناريو، والحوار المنطوق، وتوجيه حركة الشفاه Lip-Sync، ورمز تثبيت ملامح الوجه)'
                                : '(Screenplay, spoken dialogue, lip-sync cues, and face anchor token embedded)'}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleCopyPrompt(scene.videoPromptEn, idx)}
                            className="px-2.5 py-1 rounded-md bg-stone-100 hover:bg-[#c29b40] text-stone-800 hover:text-stone-950 text-[11px] font-black transition-all flex items-center gap-1 cursor-pointer border border-stone-200 hover:border-[#b38d35]"
                          >
                            {copiedIndex === idx ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-700" />
                                <span className="text-emerald-800">{lang === 'ar' ? 'تم النسخ!' : 'Copied!'}</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>{lang === 'ar' ? 'نسخ البرومبت الشامل' : 'Copy Full Prompt'}</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="p-3.5 rounded-xl bg-stone-900 text-stone-200 text-xs font-mono leading-relaxed select-all border border-stone-800">
                          {scene.videoPromptEn}
                        </div>
                      </div>

                      {/* Scene Actions Footer */}
                      <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => onSendToTester(scene.videoPromptEn)}
                          className="text-[11px] font-bold text-[#916a24] hover:text-[#78551b] flex items-center gap-1 cursor-pointer"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>{lang === 'ar' ? 'تجربة في مختبر الأوامر' : 'Test in Playground'}</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingScene({ index: idx, scene: { ...scene } })}
                            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                            title={lang === 'ar' ? 'تعديل المشهد' : 'Edit Scene'}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>{lang === 'ar' ? 'تعديل' : 'Edit'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteScene(idx)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                            title={lang === 'ar' ? 'حذف المشهد' : 'Delete Scene'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{lang === 'ar' ? 'حذف' : 'Delete'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom Action Area: Add New Scenes (خيار إضافة مشاهد جديدة في أسفل القائمة) */}
                <div className="mt-6 p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-amber-500/10 border-2 border-dashed border-[#c29b40]/50 flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-right shadow-sm hover:border-[#c29b40] transition-all animate-in fade-in">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-center sm:justify-start gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#c29b40] text-stone-950 flex items-center justify-center font-black shadow-xs">
                        <Plus className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-stone-900">
                          {lang === 'ar' 
                            ? 'إضافة مشاهد جديدة إلى السيناريو' 
                            : 'Add New Scenes to Screenplay'}
                        </h4>
                        <span className="text-[11px] font-bold text-[#916a24]">
                          {lang === 'ar' 
                            ? `المشهد التالي المرشح للإضافة: ${getArabicOrdinal(activeProject.scenes.length + 1)} (10 ثوانٍ)` 
                            : `Next upcoming scene: ${getEnglishOrdinal(activeProject.scenes.length + 1)} (10s)`}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-stone-600 max-w-lg leading-relaxed">
                      {lang === 'ar'
                        ? 'أضف مشاهد جديدة متتالية لاستكمال مسار القصة والسيناريو، مع ضبط التوقيت التلقائي بدقة، والحفاظ على ملامح وجه البطل، وتوليد نصوص الحوار المنطوق مع توجيه حركة الشفاه Lip-Sync.'
                        : 'Append new sequential 10-second scenes to continue the story arc, maintaining facial anchoring and generating synchronized dialogue lip-sync.'}
                    </p>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-[11px] font-mono text-stone-500 pt-0.5">
                      <span className="font-bold text-stone-800">
                        {lang === 'ar' ? `المشاهد الحالية: ${activeProject.scenes.length}` : `Current scenes: ${activeProject.scenes.length}`}
                      </span>
                      <span>•</span>
                      <span>
                        {lang === 'ar' ? `المدة الإجمالية: ${activeProject.totalDurationSeconds} ثانية` : `Total duration: ${activeProject.totalDurationSeconds}s`}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopyAllPrompts('full')}
                      className="px-4 py-3.5 rounded-2xl bg-white hover:bg-stone-50 text-stone-900 font-black text-xs transition-all flex items-center gap-2 cursor-pointer border border-[#c29b40]/50 shadow-md hover:scale-[1.02] active:scale-[0.98]"
                      title={lang === 'ar' ? 'نسخ جميع برومبتات مشاهد الفيلم' : 'Copy all movie scene prompts'}
                    >
                      {copiedAllPrompts ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>{lang === 'ar' ? 'تم نسخ جميع البرومبتات!' : 'All Prompts Copied!'}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-[#916a24]" />
                          <span>{lang === 'ar' ? 'نسخ جميع البرومبتات' : 'Copy All Prompts'}</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleExportTextFile}
                      className="px-4 py-3.5 rounded-2xl bg-white hover:bg-stone-50 text-stone-800 font-bold text-xs transition-all flex items-center gap-1.5 border border-stone-300 cursor-pointer shadow-xs hover:border-[#c29b40]"
                      title={lang === 'ar' ? 'تصدير السيناريو كملف نصي (TXT)' : 'Export Text File (.txt)'}
                    >
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>{lang === 'ar' ? 'ملف نصي (.txt)' : 'Text File (.txt)'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePrintPdf}
                      className="px-4 py-3.5 rounded-2xl bg-stone-900 hover:bg-black text-[#f5d996] font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs border border-stone-800"
                      title={lang === 'ar' ? 'حفظ وتصدير السيناريو كملف PDF' : 'Save as PDF'}
                    >
                      <Printer className="w-4 h-4 text-[#c29b40]" />
                      <span>{lang === 'ar' ? 'تصدير PDF' : 'Export PDF'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleAddNewScene}
                      className="px-5 py-3.5 rounded-2xl bg-[#c29b40] hover:bg-[#a6802f] text-stone-950 font-black text-xs transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-[#c29b40]/25 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>
                        {lang === 'ar' 
                          ? `+ إضافة ${getArabicOrdinal(activeProject.scenes.length + 1)} (10 ثوانٍ)` 
                          : `+ Add ${getEnglishOrdinal(activeProject.scenes.length + 1)} (10s)`}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

        </section>
      </div>

      {/* Saved Projects Manager Drawer / Modal */}
      {isSavedDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Drawer Header */}
            <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#c29b40] text-stone-950 flex items-center justify-center font-bold shadow-xs">
                  <FolderOpen className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-stone-900">
                      {lang === 'ar' ? 'مشاريع السيناريو المحفوظة' : 'Saved Screenplay Projects'}
                    </h3>
                    <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-full bg-[#c29b40] text-stone-950">
                      {savedProjects.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-stone-500">
                    {user && user.uid ? (
                      <span className="text-sky-700 font-medium">☁️ {lang === 'ar' ? 'متزامن تلقائياً مع حسابك السحابي' : 'Cloud synced'}</span>
                    ) : (
                      <span className="text-stone-500 font-medium">💾 {lang === 'ar' ? 'محفوظ محلياً على جهازك' : 'Saved locally'}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activeProject && (
                  <button
                    type="button"
                    onClick={() => handleSaveCurrentProject(activeProject, true)}
                    className="px-3 py-1.5 rounded-xl bg-[#c29b40] hover:bg-[#a6802f] text-stone-950 text-xs font-black transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                    title={lang === 'ar' ? 'حفظ المشروع المعروض حالياً' : 'Save current project'}
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'حفظ المفتوح' : 'Save Current'}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsSavedDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-all cursor-pointer font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Drawer Tab Switcher: My Projects vs Historical Legends */}
            <div className="flex border-b border-stone-200 bg-stone-100/70 p-2 gap-2">
              <button
                type="button"
                onClick={() => setSavedDrawerTab('my_projects')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  savedDrawerTab === 'my_projects'
                    ? 'bg-white text-stone-900 shadow-xs border border-stone-200/80'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
                }`}
              >
                <FolderOpen className="w-3.5 h-3.5 text-[#c29b40]" />
                <span>{lang === 'ar' ? 'مشاريعي الخاصة' : 'My Screenplays'}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-200 text-stone-700 font-mono">
                  {savedProjects.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSavedDrawerTab('legends')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  savedDrawerTab === 'legends'
                    ? 'bg-white text-[#916a24] shadow-xs border border-amber-300'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
                }`}
              >
                <Scroll className="w-3.5 h-3.5 text-[#c29b40]" />
                <span>{lang === 'ar' ? 'أساطير وتاريخ العرب' : 'Arab Legends'}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-[#916a24] font-mono font-bold">
                  {ARABIC_HISTORICAL_LEGENDS.length}
                </span>
              </button>
            </div>

            {/* Search filter bar */}
            <div className="p-3 bg-stone-100/60 border-b border-stone-200/70">
              <input
                type="text"
                value={savedSearchQuery}
                onChange={(e) => setSavedSearchQuery(e.target.value)}
                placeholder={
                  savedDrawerTab === 'my_projects'
                    ? (lang === 'ar' ? 'بحث في المشاريع المحفوظة بالاسم أو الفكرة...' : 'Search saved projects by title or idea...')
                    : (lang === 'ar' ? 'بحث في الأساطير والتاريخ (سيف بن ذي يزن، ابن بطوطة، سندباد...)' : 'Search legends (Sayf, Ibn Battuta, Sinbad...)')
                }
                className="w-full text-xs rounded-xl border border-stone-300 p-2.5 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#c29b40]"
              />
            </div>

            {/* Drawer Body: My Projects Tab */}
            {savedDrawerTab === 'my_projects' && (
              <div className="p-5 overflow-y-auto flex-1 space-y-3">
                {isLoadingSaved ? (
                  <div className="py-12 text-center text-xs text-stone-500 flex flex-col items-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-[#c29b40]" />
                    <span>{lang === 'ar' ? 'جاري تحميل وتحديث المشاريع...' : 'Loading saved projects...'}</span>
                  </div>
                ) : savedProjects.length === 0 ? (
                  <div className="py-12 text-center text-stone-400 space-y-3">
                    <Film className="w-12 h-12 mx-auto text-stone-300" />
                    <p className="text-sm font-bold text-stone-700">
                      {lang === 'ar' ? 'لا توجد مشاريع محفوظة حالياً.' : 'No saved screenplay projects yet.'}
                    </p>
                    <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                      {lang === 'ar' 
                        ? 'عند توليد أي فكرة سينمائية أو الضغط على زر "حفظ المشروع السينمائي"، ستظهر جميع سيناريوهاتك هنا بشكل آمن ودائم.' 
                        : 'Generate any movie concept or click "Save Movie Project" to see them safely listed here.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => setSavedDrawerTab('legends')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-[#916a24] text-xs font-bold transition-all cursor-pointer"
                    >
                      <span>📜</span>
                      <span>{lang === 'ar' ? 'استكشف أساطير وتاريخ العرب الجاهزة' : 'Explore Ready Arab Legends'}</span>
                    </button>
                  </div>
                ) : filteredSavedProjects.length === 0 ? (
                  <div className="py-8 text-center text-xs text-stone-500">
                    {lang === 'ar' ? 'لا توجد نتائج مطابقة لبحثك.' : 'No projects match your search.'}
                  </div>
                ) : (
                  filteredSavedProjects.map((proj) => (
                    <div
                      key={proj.id}
                      onClick={() => handleResumeProject(proj)}
                      className="p-4 rounded-2xl border border-stone-200 hover:border-[#c29b40] bg-stone-50/70 hover:bg-amber-50/30 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group shadow-xs"
                    >
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-black text-stone-900 group-hover:text-[#916a24] truncate">
                            {proj.titleAr || proj.titleEn}
                          </span>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.2 rounded-md bg-stone-200 text-stone-700">
                            {proj.scenes?.length || 0} {lang === 'ar' ? 'مشاهد (10s)' : 'scenes'}
                          </span>
                          {activeProject && activeProject.id === proj.id && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
                              {lang === 'ar' ? 'المشروع النشط حالياً' : 'Active'}
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed">
                          {proj.loglineAr || proj.concept}
                        </p>

                        <div className="flex flex-wrap items-center gap-2.5 text-[10px] text-stone-400 font-mono">
                          <span className="text-[#916a24] font-bold">{proj.genre}</span>
                          <span>•</span>
                          <span>{proj.totalDurationSeconds || (proj.scenes?.length || 0) * 10}s</span>
                          <span>•</span>
                          <span>{new Date(proj.updatedAt || proj.createdAt).toLocaleDateString()} {new Date(proj.updatedAt || proj.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleResumeProject(proj)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#c29b40] text-stone-950 font-black text-xs hover:bg-[#a6802f] transition-all cursor-pointer shadow-xs flex items-center gap-1"
                        >
                          <Play className="w-3 h-3 fill-stone-950" />
                          <span>{lang === 'ar' ? 'استئناف' : 'Resume'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const newId = `movie_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
                            const copy: MovieProject = {
                              ...proj,
                              id: newId,
                              titleAr: `${proj.titleAr} (نسخة)`,
                              titleEn: `${proj.titleEn || proj.titleAr} (Copy)`,
                              createdAt: new Date().toISOString(),
                              updatedAt: new Date().toISOString()
                            };
                            handleSaveCurrentProject(copy, true);
                          }}
                          className="p-2 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 transition-all cursor-pointer"
                          title={lang === 'ar' ? 'نسخ المشروع' : 'Duplicate project'}
                        >
                          <Layers className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleDeleteProject(proj.id, e)}
                          className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                          title={lang === 'ar' ? 'حذف المشروع' : 'Delete Project'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Drawer Body: Arab Historical Legends Tab */}
            {savedDrawerTab === 'legends' && (
              <div className="p-5 overflow-y-auto flex-1 space-y-3.5">
                <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200/80 text-xs text-[#916a24] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📜</span>
                    <span className="font-semibold leading-relaxed">
                      {lang === 'ar'
                        ? 'مجموعة سيناريوهات جاهزة ومطابقة 100% لهيكل بيانات السينما (مشاهد 10 ثوانٍ، حوارات، ومثبت ملامح موحد).'
                        : 'Ready screenplays conforming 100% to cinema data structure with 10s pacing, dialogues, and face anchors.'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSavedDrawerOpen(false);
                      setIsLegendsModalOpen(true);
                    }}
                    className="shrink-0 px-2.5 py-1.5 rounded-xl bg-[#c29b40] hover:bg-[#a6802f] text-stone-950 font-black text-[11px] transition-all cursor-pointer"
                  >
                    {lang === 'ar' ? 'المكتبة الموسعة' : 'Full Library'}
                  </button>
                </div>

                {filteredLegends.length === 0 ? (
                  <div className="py-8 text-center text-xs text-stone-500">
                    {lang === 'ar' ? 'لا توجد أساطير مطابقة لبحثك.' : 'No legends match your search.'}
                  </div>
                ) : (
                  filteredLegends.map((leg) => {
                    const isKeyLegend = ['legend-sayf-roc', 'legend-ibn-battuta', 'legend-sinbad-whale'].includes(leg.id);
                    return (
                      <div
                        key={leg.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col gap-3 shadow-xs ${
                          isKeyLegend
                            ? 'bg-gradient-to-br from-amber-50/90 to-white border-amber-300 hover:border-[#c29b40]'
                            : 'bg-stone-50/70 hover:bg-stone-100/70 border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-xl shrink-0">{leg.icon}</span>
                              <h4 className="text-xs font-black text-stone-900 truncate">
                                {leg.titleAr}
                              </h4>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {isKeyLegend && (
                                <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-amber-200 text-amber-950 border border-amber-300">
                                  {lang === 'ar' ? '⭐ مميز' : 'Featured'}
                                </span>
                              )}
                              <span className="text-[10px] font-mono font-bold px-2 py-0.2 rounded-md bg-stone-200 text-stone-700">
                                {leg.readyScenes.length} {lang === 'ar' ? 'مشاهد (10s)' : 'scenes'} • {leg.readyScenes.length * 10}s
                              </span>
                            </div>
                          </div>

                          <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed">
                            {leg.taglineAr || leg.conceptAr}
                          </p>

                          {/* Hero & Character Consistency Anchor */}
                          <div className="flex flex-wrap items-center gap-2 text-[10px] text-stone-500 pt-0.5">
                            <span className="font-bold text-[#916a24] bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 flex items-center gap-1">
                              <UserCheck className="w-3 h-3 text-[#c29b40]" />
                              <span>{leg.hero.name}</span>
                              <span className="opacity-75">({leg.hero.roleAr})</span>
                            </span>
                            <span>•</span>
                            <span className="font-mono text-stone-400">{leg.recommendedStyleEn}</span>
                          </div>
                        </div>

                        {/* Action buttons matching existing studio flow */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-200/60">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                handleLoadLegendAsActiveProject(leg);
                                setIsSavedDrawerOpen(false);
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-[#c29b40] hover:bg-[#a6802f] text-stone-950 font-black text-xs transition-all flex items-center gap-1 cursor-pointer shadow-xs hover:scale-102 active:scale-98"
                            >
                              <Play className="w-3 h-3 fill-stone-950" />
                              <span>{lang === 'ar' ? '⚡ فتح في الاستوديو' : 'Load in Studio'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                handleApplyLegendToManualMode(leg);
                                setIsSavedDrawerOpen(false);
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs transition-all flex items-center gap-1 cursor-pointer"
                              title={lang === 'ar' ? 'تعديل المشاهد في المحرر اليدوي' : 'Edit in Manual Mode'}
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>{lang === 'ar' ? 'تعديل يدوي' : 'Manual Edit'}</span>
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setIsSavedDrawerOpen(false);
                              setIsLegendsModalOpen(true);
                            }}
                            className="text-[11px] font-bold text-[#916a24] hover:text-[#78551b] flex items-center gap-1 cursor-pointer"
                          >
                            <span>{lang === 'ar' ? 'معاينة السيناريو' : 'Preview Script'}</span>
                            <ChevronLeft className={`w-3 h-3 ${lang === 'en' ? 'rotate-180' : ''}`} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Drawer Footer */}
            <div className="p-4 border-t border-stone-100 bg-stone-50 flex items-center justify-between text-xs text-stone-500">
              <span className="font-medium font-mono">
                {savedDrawerTab === 'my_projects'
                  ? `${savedProjects.length} ${lang === 'ar' ? 'مشروع محفوظ في مكتبتك السينمائية' : 'saved movie projects'}`
                  : `${ARABIC_HISTORICAL_LEGENDS.length} ${lang === 'ar' ? 'سيناريو تاريخي وأسطوري جاهز ومتطابق مع الاستوديو' : 'ready historical screenplays'}`}
              </span>
              <button
                type="button"
                onClick={() => setIsSavedDrawerOpen(false)}
                className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold transition-all cursor-pointer"
              >
                {lang === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Scene Modal */}
      {editingScene && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-sm font-black text-stone-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#c29b40]" />
                <span>{lang === 'ar' ? `تعديل ${getArabicOrdinal(editingScene.scene.sceneNumber || editingScene.index + 1)}` : `Edit ${getEnglishOrdinal(editingScene.scene.sceneNumber || editingScene.index + 1)}`}</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingScene(null)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-[68vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    {lang === 'ar' ? 'عنوان المشهد' : 'Scene Title'}
                  </label>
                  <input
                    type="text"
                    value={editingScene.scene.titleAr}
                    onChange={(e) => setEditingScene({
                      ...editingScene,
                      scene: { ...editingScene.scene, titleAr: e.target.value }
                    })}
                    className="w-full text-xs rounded-xl border border-stone-300 p-2.5 text-stone-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    {lang === 'ar' ? 'ترويسة المشهد (Slugline)' : 'Screenplay Slugline'}
                  </label>
                  <input
                    type="text"
                    value={editingScene.scene.screenplaySlug || ''}
                    placeholder="مشهد 1: داخلي - مختبر التحكم - ليل"
                    onChange={(e) => setEditingScene({
                      ...editingScene,
                      scene: { ...editingScene.scene, screenplaySlug: e.target.value }
                    })}
                    className="w-full text-xs rounded-xl border border-stone-300 p-2.5 text-stone-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  {lang === 'ar' ? '🎬 نَص السيناريو والحدث الدرامي (10 ثوانٍ)' : '🎬 Screenplay Narrative Action Beat (10s)'}
                </label>
                <textarea
                  rows={3}
                  value={editingScene.scene.screenplayBeatAr || editingScene.scene.dramaticActionAr}
                  onChange={(e) => setEditingScene({
                    ...editingScene,
                    scene: { 
                      ...editingScene.scene, 
                      screenplayBeatAr: e.target.value,
                      dramaticActionAr: e.target.value 
                    }
                  })}
                  className="w-full text-xs rounded-xl border border-stone-300 p-2.5 text-stone-800"
                />
              </div>

              {/* Dialogue & Lip-Sync Controls */}
              <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-black text-[#916a24] flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'الحوار الصوتي المنطوق وتوجيه الشفاه (Lip-Sync)' : 'Spoken Dialogue & Lip-Sync'}</span>
                  </span>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      disabled={isFetchingContextSuggestions && contextSuggestionsTarget === 'modal'}
                      onClick={() => handleFetchDialogueContextSuggestions(
                        'modal',
                        editingScene.scene.dialogueAr || '',
                        {
                          sceneTitle: editingScene.scene.titleAr,
                          sceneBeat: editingScene.scene.screenplayBeatAr || editingScene.scene.dramaticActionAr,
                          speakerName: editingScene.scene.dialogueSpeaker,
                          dialogueEmotion: editingScene.scene.dialogueEmotion,
                          concept: activeProject?.concept,
                          actPhase: editingScene.scene.actPhase,
                          genre: activeProject?.genre
                        }
                      )}
                      className="px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-black text-[#f5d996] text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer border border-[#c29b40]/50 shadow-xs hover:scale-102 active:scale-95 disabled:opacity-50"
                      title={lang === 'ar' ? 'اقتراح صيغ بديلة وتحسينات للجملة الحالية وفق طبيعة المشهد المختار' : 'Suggest contextual alternatives for this dialogue based on scene nature'}
                    >
                      <Sparkles className={`w-3 h-3 text-[#c29b40] ${isFetchingContextSuggestions && contextSuggestionsTarget === 'modal' ? 'animate-spin' : ''}`} />
                      <span>{isFetchingContextSuggestions && contextSuggestionsTarget === 'modal' ? (lang === 'ar' ? 'تحليل السياق...' : 'Analyzing...') : (lang === 'ar' ? '✨ اقتراحات السياق' : 'Context Suggestions')}</span>
                    </button>

                    <button
                      type="button"
                      disabled={isModalGeneratingDialogue}
                      onClick={handleGenerateModalDialogue}
                      className="px-2.5 py-1 rounded-lg bg-[#c29b40] hover:bg-[#a6802f] text-stone-950 text-[10px] font-black transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                      title={lang === 'ar' ? 'توليد حوار نابع من فكرة القصة وأحداث هذا المشهد بواسطة الذكاء الاصطناعي' : 'Generate smart dialogue from story idea'}
                    >
                      {isModalGeneratingDialogue ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin text-stone-950" />
                          <span>{lang === 'ar' ? 'جاري كتابة الحوار...' : 'Generating...'}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 text-stone-950" />
                          <span>{lang === 'ar' ? '✨ توليد حوار جديد' : '✨ New AI Dialogue'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 mb-0.5">
                      {lang === 'ar' ? 'المتحدث' : 'Speaker'}
                    </label>
                    <input
                      type="text"
                      value={editingScene.scene.dialogueSpeaker || ''}
                      placeholder={lang === 'ar' ? 'اسم المتحدث' : 'Speaker name'}
                      onChange={(e) => setEditingScene({
                        ...editingScene,
                        scene: { ...editingScene.scene, dialogueSpeaker: e.target.value }
                      })}
                      className="w-full text-xs rounded-lg border border-stone-300 p-2 bg-white text-stone-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 mb-0.5">
                      {lang === 'ar' ? 'نبرة الإلقاء / المشاعر' : 'Emotion / Delivery'}
                    </label>
                    <input
                      type="text"
                      value={editingScene.scene.dialogueEmotion || ''}
                      placeholder="همس متوتر، حازم..."
                      onChange={(e) => setEditingScene({
                        ...editingScene,
                        scene: { ...editingScene.scene, dialogueEmotion: e.target.value }
                      })}
                      className="w-full text-xs rounded-lg border border-stone-300 p-2 bg-white text-stone-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 mb-0.5">
                      {lang === 'ar' ? 'التوقيت ضمن اللقطة' : 'Timing in 10s'}
                    </label>
                    <input
                      type="text"
                      value={editingScene.scene.dialogueTiming || ''}
                      placeholder="00:03 - 00:08"
                      onChange={(e) => setEditingScene({
                        ...editingScene,
                        scene: { ...editingScene.scene, dialogueTiming: e.target.value }
                      })}
                      className="w-full text-xs rounded-lg border border-stone-300 p-2 bg-white text-stone-800 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 mb-0.5">
                      {lang === 'ar' ? 'نص الحوار (عربي)' : 'Dialogue (Arabic)'}
                    </label>
                    <input
                      type="text"
                      value={editingScene.scene.dialogueAr || ''}
                      placeholder="علينا التحرك فوراً..."
                      onChange={(e) => setEditingScene({
                        ...editingScene,
                        scene: { ...editingScene.scene, dialogueAr: e.target.value }
                      })}
                      className="w-full text-xs rounded-lg border border-stone-300 p-2 bg-white text-stone-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 mb-0.5">
                      {lang === 'ar' ? 'نص الحوار (English)' : 'Dialogue (English)'}
                    </label>
                    <input
                      type="text"
                      value={editingScene.scene.dialogueEn || ''}
                      placeholder="We must move immediately..."
                      onChange={(e) => setEditingScene({
                        ...editingScene,
                        scene: { ...editingScene.scene, dialogueEn: e.target.value }
                      })}
                      className="w-full text-xs rounded-lg border border-stone-300 p-2 bg-white text-stone-800 font-mono"
                    />
                  </div>
                </div>

                {/* Render Context Suggestions Box for editingScene modal */}
                {renderContextSuggestionsPanel('modal', (sug) => handleApplyContextSuggestion('modal', sug))}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  {lang === 'ar' ? '🚀 برومبت الفيديو الشامل (English Master Video Prompt)' : '🚀 English Master Video Prompt'}
                </label>
                <textarea
                  rows={4}
                  value={editingScene.scene.videoPromptEn}
                  onChange={(e) => setEditingScene({
                    ...editingScene,
                    scene: { ...editingScene.scene, videoPromptEn: e.target.value }
                  })}
                  className="w-full text-xs font-mono rounded-xl border border-stone-300 p-2.5 text-stone-800"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setEditingScene(null)}
                className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200 transition-all cursor-pointer"
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleSaveEditedScene}
                className="px-4 py-2 rounded-xl bg-[#c29b40] text-stone-950 text-xs font-black hover:bg-[#a6802f] transition-all cursor-pointer"
              >
                {lang === 'ar' ? 'حفظ التعديلات' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scene Authoring & Add Modal (Manual Screenplay & Spoken Dialogue or AI Co-Director) */}
      {isAddSceneModalOpen && activeProject && (
        <SceneAuthoringModal
          isOpen={isAddSceneModalOpen}
          onClose={() => setIsAddSceneModalOpen(false)}
          lang={lang}
          activeProject={activeProject}
          onAddScene={handleConfirmAddScene}
        />
      )}

      {/* Share Sequence Modal */}
      {activeProject && (
        <ShareSequenceModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          lang={lang}
          shareUrl={shareUrl}
          title={activeProject.titleAr || activeProject.titleEn || (lang === 'ar' ? 'سلسلة فيلم سينمائي' : 'Cinema Movie Sequence')}
          concept={activeProject.concept}
          scenesCount={activeProject.scenes?.length || 0}
          sequenceType="cinema"
          styleOrGenre={`${activeProject.genre} | ${activeProject.visualStyle}`}
          previewScenes={activeProject.scenes?.map(s => ({
            title: lang === 'ar' ? s.titleAr : s.titleEn,
            prompt: s.videoPromptEn
          })) || []}
        />
      )}

      {/* Screenplay Export & PDF Modal */}
      {isExportModalOpen && activeProject && (
        <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto no-print">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-stone-900 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#c29b40] text-stone-950 flex items-center justify-center font-black shadow-md">
                  <FileDown className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">
                    {lang === 'ar' ? 'تصدير وحفظ السيناريو السينمائي (Text File & PDF)' : 'Export & Save Screenplay (Text & PDF)'}
                  </h3>
                  <p className="text-[11px] text-stone-300">
                    {activeProject.titleAr} • {activeProject.scenes.length} {lang === 'ar' ? 'مشاهد (10s)' : 'scenes'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Action Toolbar in Modal */}
            <div className="p-3 sm:p-4 bg-amber-50/70 border-b border-amber-200/80 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {/* 1. Download as Text File (.txt) */}
                <button
                  type="button"
                  onClick={handleExportTextFile}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-stone-50 text-stone-900 font-bold text-xs transition-all flex items-center gap-2 border border-stone-300 shadow-xs cursor-pointer hover:border-[#c29b40] hover:text-[#916a24]"
                >
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>{lang === 'ar' ? 'تحميل ملف نصي (.TXT)' : 'Download Text File (.TXT)'}</span>
                </button>

                {/* 2. Print / Save as PDF */}
                <button
                  type="button"
                  onClick={handlePrintPdf}
                  className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-black text-[#f5d996] font-black text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md border border-stone-800 hover:border-[#c29b40]"
                >
                  <Printer className="w-4 h-4 text-[#c29b40]" />
                  <span>{lang === 'ar' ? 'حفظ / طباعة PDF' : 'Save as PDF / Print'}</span>
                </button>

                {/* 3. Export as Markdown (.md) */}
                <button
                  type="button"
                  onClick={handleExportMarkdown}
                  className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer border border-stone-200"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Markdown (.md)</span>
                </button>

                {/* 4. Copy Plain Text */}
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(getScreenplayPlainText(activeProject));
                    showToast(lang === 'ar' ? '✓ تم نسخ نص السيناريو بالكامل!' : '✓ Full screenplay text copied!');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer border border-stone-200"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'نسخ النص' : 'Copy All'}</span>
                </button>
              </div>

              <div className="text-[11px] text-stone-500 font-medium">
                {lang === 'ar' ? '💡 لحفظ PDF: اختر "Save as PDF" من خيارات الطابعة' : '💡 To save as PDF: Choose "Save as PDF" in print dialog'}
              </div>
            </div>

            {/* Document Preview Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-7 bg-[#fdfbf7] space-y-6 font-mono text-xs text-stone-800 leading-relaxed select-text">
              <div className="max-w-3xl mx-auto bg-white p-6 sm:p-10 rounded-2xl shadow-sm border border-stone-200/90 space-y-6">
                
                {/* Screenplay Cover Title */}
                <div className="text-center pb-6 border-b-2 border-stone-900 space-y-2">
                  <span className="text-xs font-black tracking-widest text-[#916a24] uppercase">
                    ArabPrompt Cinema Screenplay
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-stone-950 font-serif">
                    {activeProject.titleAr}
                  </h1>
                  <h2 className="text-sm font-bold text-stone-500 italic">
                    {activeProject.titleEn}
                  </h2>
                  <div className="pt-2 text-[11px] text-stone-600 flex flex-wrap items-center justify-center gap-3">
                    <span>{lang === 'ar' ? 'النوع:' : 'Genre:'} {activeProject.genre}</span>
                    <span>•</span>
                    <span>{lang === 'ar' ? 'الأسلوب:' : 'Style:'} {activeProject.visualStyle}</span>
                    <span>•</span>
                    <span>{lang === 'ar' ? 'المدة:' : 'Duration:'} {activeProject.totalDurationSeconds}s ({activeProject.scenes.length} Scenes)</span>
                    <span>•</span>
                    <span>{activeProject.targetAiModel}</span>
                  </div>
                </div>

                {/* Logline Box */}
                <div className="p-4 rounded-xl bg-stone-50 border-r-4 border-[#c29b40] space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#916a24] block">
                    {lang === 'ar' ? '📜 الفكرة المركزية (Logline):' : 'Core Logline:'}
                  </span>
                  <p className="font-serif text-sm font-semibold text-stone-900 leading-relaxed">
                    {activeProject.loglineAr}
                  </p>
                  {activeProject.loglineEn && (
                    <p className="text-[11px] text-stone-500 italic">
                      {activeProject.loglineEn}
                    </p>
                  )}
                </div>

                {/* Character Anchor */}
                {activeProject.characterAnchor && (
                  <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 text-xs space-y-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#916a24] block">
                      🔒 {lang === 'ar' ? 'مثبت ملامح الوجه والشخصية الموحد:' : 'Consistent Face Anchor:'}
                    </span>
                    <p className="font-bold text-stone-900">
                      {activeProject.characterAnchor.name} ({activeProject.characterAnchor.role})
                    </p>
                    <p className="text-[11px] text-stone-600">
                      {activeProject.characterAnchor.faceDescriptionAr}
                    </p>
                    <div className="p-2 rounded bg-white text-[10px] text-stone-700 break-all select-all border border-amber-200">
                      {activeProject.characterAnchor.consistencyPromptToken}
                    </div>
                  </div>
                )}

                {/* Scenes List */}
                <div className="space-y-6 pt-2">
                  <div className="text-center font-bold text-xs uppercase tracking-widest text-stone-400 border-b border-stone-200 pb-2">
                    {lang === 'ar' ? 'نصوص المشاهد والأحداث والحوارات (10 ثوانٍ لكل مشهد)' : 'Sequential 10s Screenplay Beats'}
                  </div>

                  {activeProject.scenes.map((scene, idx) => (
                    <div key={idx} className="p-4 sm:p-5 rounded-xl bg-stone-50/60 border border-stone-200 space-y-3">
                      {/* Scene Heading */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-stone-200">
                        <span className="font-black text-sm text-stone-950 font-serif">
                          {getArabicOrdinal(scene.sceneNumber || idx + 1)} ({getEnglishOrdinal(scene.sceneNumber || idx + 1)})
                        </span>
                        <div className="flex items-center gap-2 text-[10px]">
                          <span className="bg-stone-200 text-stone-800 font-bold px-2 py-0.5 rounded">
                            ⏱️ {scene.timeRange} (10s)
                          </span>
                          {scene.actLabelAr && (
                            <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded">
                              {scene.actLabelAr}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Scene Title & Slug */}
                      <div className="text-xs font-bold text-stone-700">
                        {scene.screenplaySlug || scene.titleAr}
                      </div>

                      {/* Action Beat */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase text-stone-500 block">
                          [حركة المشهد والحدث السينمائي]:
                        </span>
                        <p className="text-xs text-stone-900 font-serif leading-relaxed">
                          {scene.screenplayBeatAr || scene.dramaticActionAr}
                        </p>
                        {scene.screenplayBeatEn && (
                          <p className="text-[11px] text-stone-500 italic">
                            {scene.screenplayBeatEn}
                          </p>
                        )}
                      </div>

                      {/* Spoken Dialogue */}
                      {(scene.dialogueAr || scene.dialogueEn) && (
                        <div className="my-2 p-3 rounded-lg bg-amber-50/70 border border-amber-200/80 text-center space-y-1">
                          <span className="text-[10px] font-black uppercase text-[#916a24] block">
                            💬 {scene.dialogueSpeaker || 'البطل'} {scene.dialogueEmotion ? `(${scene.dialogueEmotion})` : ''} • {scene.dialogueTiming || '00:03 - 00:08'}
                          </span>
                          {scene.dialogueAr && (
                            <p className="text-sm font-black font-serif text-stone-950">
                              "{scene.dialogueAr}"
                            </p>
                          )}
                          {scene.dialogueEn && (
                            <p className="text-xs text-stone-600 italic">
                              "{scene.dialogueEn}"
                            </p>
                          )}
                        </div>
                      )}

                      {/* Technical Prompts */}
                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] font-bold uppercase text-stone-400 block">
                          [AI Video Generation Prompt]:
                        </span>
                        <div className="p-2.5 rounded bg-stone-900 text-stone-200 text-[10px] break-words select-all">
                          {scene.videoPromptEn}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Brand */}
                <div className="pt-6 border-t border-stone-200 text-center text-[10px] text-stone-400 space-y-1">
                  <p>تمت صياغة وهندسة هذا السيناريو عبر منصة عرب برومبت - استوديو الأفلام السينمائي الذكي</p>
                  <p>ArabPrompt Cinema Studio: https://arabiprompt.ai.studio</p>
                </div>

              </div>
            </div>

            {/* Modal Bottom Bar */}
            <div className="p-4 bg-stone-100 border-t border-stone-200 flex items-center justify-between">
              <span className="text-xs text-stone-600">
                {lang === 'ar' ? 'جاهز للحفظ على جهازك والمشاركة مع فريق الإنتاج' : 'Ready to save and share with your team'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportTextFile}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-stone-50 text-stone-900 font-bold text-xs transition-all flex items-center gap-1.5 border border-stone-300 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>{lang === 'ar' ? 'تحميل كملف نصي (.txt)' : 'Download .txt'}</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrintPdf}
                  className="px-4 py-2 rounded-xl bg-[#c29b40] hover:bg-[#a6802f] text-stone-950 font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'طباعة / حفظ PDF' : 'Save PDF'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Print Container for High-Fidelity PDF Export via window.print() */}
      {activeProject && (
        <div id="cinema-printable-screenplay" className="hidden print:block p-8 bg-white text-black font-serif text-sm">
          {/* Header */}
          <div className="text-center pb-6 border-b-2 border-black space-y-2 mb-6">
            <h1 className="text-3xl font-black">{activeProject.titleAr}</h1>
            <h2 className="text-base font-bold italic">{activeProject.titleEn}</h2>
            <p className="text-xs text-gray-700">
              النوع: {activeProject.genre} | الأسلوب: {activeProject.visualStyle} | نموذج الذكاء الاصطناعي: {activeProject.targetAiModel} | المدة: {activeProject.totalDurationSeconds} ثانية ({activeProject.scenes.length} مشاهد)
            </p>
          </div>

          <div className="mb-6 p-4 border border-black bg-gray-50">
            <h3 className="font-bold text-xs uppercase mb-1">الفكرة المركزية (Logline):</h3>
            <p className="font-semibold">{activeProject.loglineAr}</p>
            {activeProject.loglineEn && <p className="text-xs italic text-gray-600 mt-1">{activeProject.loglineEn}</p>}
          </div>

          {activeProject.characterAnchor && (
            <div className="mb-6 p-4 border border-black text-xs">
              <h3 className="font-bold uppercase mb-1">بطل العمل ومثبت ملامح الوجه الموحد:</h3>
              <p className="font-bold">{activeProject.characterAnchor.name} ({activeProject.characterAnchor.role})</p>
              <p>{activeProject.characterAnchor.faceDescriptionAr}</p>
              <p className="font-mono text-[10px] mt-1 break-all">{activeProject.characterAnchor.consistencyPromptToken}</p>
            </div>
          )}

          <div className="space-y-6">
            {activeProject.scenes.map((s, idx) => (
              <div key={idx} className="p-4 border border-gray-400 page-break-inside-avoid space-y-2 mb-4">
                <div className="flex justify-between font-bold border-b border-gray-300 pb-1">
                  <span>{getArabicOrdinal(s.sceneNumber || idx + 1)} ({getEnglishOrdinal(s.sceneNumber || idx + 1)})</span>
                  <span>⏱️ {s.timeRange} (10s)</span>
                </div>
                <div className="font-bold text-xs">{s.titleAr}</div>
                <div className="text-xs">
                  <span className="font-bold">حركة المشهد: </span>
                  {s.screenplayBeatAr || s.dramaticActionAr}
                </div>
                {(s.dialogueAr || s.dialogueEn) && (
                  <div className="p-2 border-l-4 border-black bg-gray-50 my-2 text-center">
                    <div className="font-bold text-xs">{s.dialogueSpeaker || 'البطل'} ({s.dialogueEmotion || ''}) [{s.dialogueTiming || ''}]</div>
                    {s.dialogueAr && <div className="font-bold text-sm">"{s.dialogueAr}"</div>}
                    {s.dialogueEn && <div className="text-xs italic">"{s.dialogueEn}"</div>}
                  </div>
                )}
                <div className="font-mono text-[10px] text-gray-700 break-words mt-2">
                  <span className="font-bold">AI Video Prompt: </span>
                  {s.videoPromptEn}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center text-xs text-gray-500 pt-6 border-t mt-8">
            ArabPrompt Cinema Studio • https://arabiprompt.ai.studio
          </div>
        </div>
      )}

      {/* Story-to-Screenplay Generator Diagnostic Benchmark Tester Modal */}
      <StoryScreenplayTesterModal
        isOpen={isTesterModalOpen}
        onClose={() => setIsTesterModalOpen(false)}
        lang={lang}
        initialConcept={concept || activeProject?.concept || ''}
        onLoadProjectToStudio={(testedProj) => {
          handleSaveCurrentProject(testedProj, true);
          setConcept(testedProj.concept || '');
          setGenre(testedProj.genre || genre);
          setVisualStyle(testedProj.visualStyle || visualStyle);
          setTargetAiModel(testedProj.targetAiModel || targetAiModel);
          setSceneCount(testedProj.scenes?.length || 4);
          showToast(lang === 'ar' ? '✓ تم اعتماد وتحميل السيناريو المختبر إلى بيئة العمل بنجاح!' : '✓ Tested screenplay loaded into studio!');
        }}
      />

      {/* Arabic Historical & Mythological Screenplays Library Modal */}
      <HistoricalLegendsModal
        isOpen={isLegendsModalOpen}
        onClose={() => setIsLegendsModalOpen(false)}
        lang={lang}
        onApplyToAiForm={handleApplyLegendToAiForm}
        onLoadAsActiveProject={handleLoadLegendAsActiveProject}
        onApplyToManualMode={handleApplyLegendToManualMode}
      />

      {/* Global Print Media Style for PDF Export */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #cinema-printable-screenplay, #cinema-printable-screenplay * {
            visibility: visible !important;
          }
          #cinema-printable-screenplay {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 12mm !important;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

    </div>
  );
}
