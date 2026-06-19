/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Video, Sparkles, Sliders, Play, RotateCcw, Copy, Check, Cpu,
  Download, FileVideo, Layout, AlertTriangle, ShieldCheck, Layers, HelpCircle,
  Film, Compass, Camera, Zap, Anchor, Wind, Eye, RefreshCw, Layers2, Maximize, Clock,
  Image, Info, Flame, ToggleLeft, Activity, ListOrdered, Share2, Upload, Trash2, VideoOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ModelType } from '../types';

interface VideoPromptDesignerProps {
  lang: 'ar' | 'en';
  onSendToTester: (promptText: string) => void;
  onLogPrompt: (item: {
    originalText: string;
    optimizedText: string;
    model: ModelType;
    tone: string;
    category: string;
    actionType: 'generate' | 'refine' | 'translate' | 'reverse';
    isFallback?: boolean;
  }) => void;
}

// 1. VIDEO CATEGORIES
interface VideoCategory {
  id: string;
  labelAr: string;
  labelEn: string;
  icon: string;
  defaultSubjectAr: string;
  defaultSubjectEn: string;
  startingPosAr: string;
  startingPosEn: string;
  motionBrushAr: string;
  motionBrushEn: string;
}

const VIDEO_CATEGORIES: VideoCategory[] = [
  {
    id: 'drone',
    labelAr: 'درون / تصوير جوي (Drone)',
    labelEn: 'Drone / Aerial Shot',
    icon: 'drone',
    defaultSubjectAr: 'أمواج المحيط الفيروزية ترتطم بالصخور البركانية السوداء ونشاط زبد البحر الأبيض',
    defaultSubjectEn: 'crashing turquoise ocean waves against dark volcanic basalt rocks, producing rich white sea foam',
    startingPosAr: 'ارتفاع شاهق يبلغ 120 متراً فوق المحيط',
    startingPosEn: 'a high altitude of 100 meters above the sea level',
    motionBrushAr: 'الأمواج: حركة موجية سريعة بنسبة 70%، زبد البحر: تدفق حركي بنسبة 50%، الصخور واليابسة: ثابتة تماماً.',
    motionBrushEn: 'Waves: High motion (70% strength), Sea Foam: Medium dynamic drift (50%), Volcanic Rocks: Static (0%).'
  },
  {
    id: 'cinematic',
    labelAr: 'سينمائي درامي (Cinematic)',
    labelEn: 'Cinematic Narrative',
    icon: 'film',
    defaultSubjectAr: 'رائد فضاء وحيد ينظر إلى كوكب نيون عملاق من نافذة محطة فضائية مهجورة',
    defaultSubjectEn: 'a lonely astronaut looking out at a majestic glowing ring-planet from the window of an abandoned orbital space station',
    startingPosAr: 'لقطة مقربة من كتف الكابتن',
    startingPosEn: 'a close-up over-the-shoulder perspective',
    motionBrushAr: 'الغيوم الفضائية والسديم: حركة غازية بطيئة جداً بنسبة 30%، انعكاس الأضواء على الخوذة: لمعان ديناميكي.',
    motionBrushEn: 'Cosmic Nebula: Fluid gaseous slow drift (30%), Helmet Visor: Reflected ambient light shimmer, Astronaut: Subtle breathing motion.'
  },
  {
    id: 'product',
    labelAr: 'استعراض المنتجات (Product Showcase)',
    labelEn: 'Product Showcase',
    icon: 'box',
    defaultSubjectAr: 'زجاجة عطر فاخرة من الكريستال الأسود تتناثر حولها قطرات الماء المتجمدة ببطء شديد',
    defaultSubjectEn: 'a luxurious black crystal perfume bottle with splashing micro water droplets slow-motion freezing in mid-air',
    startingPosAr: 'زاوية منخفضة ترسم هيبة المنتج',
    startingPosEn: 'a dramatic low-angle extreme close-up centering the brand seal',
    motionBrushAr: 'قطرات الماء: اندفاع فيزيائي سريع يتوزع في الفضاء، انعكاس الزجاجة: شروق بريق ضوئي ناعم.',
    motionBrushEn: 'Water droplets: High explosive splintering motion (80%), Perfume Glass: Subtle rotation reflections (10%), Logo: Razor sharp static.'
  },
  {
    id: 'nature',
    labelAr: 'طبيعة ومناظر طبيعية (Nature)',
    labelEn: 'Nature / Landscape',
    icon: 'mountain',
    defaultSubjectAr: 'شلال مهيب يتدفق بين الجبال الضبابية الخضراء في أيسلندا أثناء شروق الشمس الذهبي',
    defaultSubjectEn: 'a majestic waterfall cascading down emerald-green cliffs in mystic Iceland during a warm golden sunrise',
    startingPosAr: 'لقطة عريضة على مستوى الأرض',
    startingPosEn: 'a wide panoramic establishing view looking up',
    motionBrushAr: 'المياه المتدفقة: حركة هيدروليكية رأسية سرعة 90%، رذاذ الضباب: تصاعد بطيء بنسبة 40%، العشب: تموج طفيف مع الريح.',
    motionBrushEn: 'Cascade water: High vertical fluid speed (90%), Rising mist spray: Soft turbulence (40%), Pine trees / Moss: Micro-swaying (15%).'
  },
  {
    id: 'abstract',
    labelAr: 'حركة تجريدية (Abstract Motion)',
    labelEn: 'Abstract / Sci-Fi Fluid',
    icon: 'activity',
    defaultSubjectAr: 'منحوتات معدنية سائلة ذات ألوان هولوغرافية تتدفق وتتشابك مع نبضات ضوء النيون',
    defaultSubjectEn: 'fluid liquid metallic sculptures with iridescent holographic colors merging and morphing slowly with pulsating neon core lights',
    startingPosAr: 'داخل حيز رقمي ومظلم غير محدود',
    startingPosEn: 'within an endless dark digital void close range',
    motionBrushAr: 'المعدن السائل: تموجات جزيئية متناسقة بنسبة 60%، بريق الهولوغرام: تحول لوني تفاعلي بنسبة 80%.',
    motionBrushEn: 'Chrome Liquid: Harmonic coordinate morphing (60%), Holographic chromatic aberration: High speed pulsing (80%).'
  },
  {
    id: 'portrait',
    labelAr: 'شخصيات وبورتريه (Portrait)',
    labelEn: 'Portrait & Character',
    icon: 'user',
    defaultSubjectAr: 'شابة من سايبربانك بشعر نيون وردي تنظر برصانة في مطر شوارع طوكيو المضيئة بالنيون',
    defaultSubjectEn: 'a cyberpunk warrior girl with glowing pink fiber-optic hair, standing calm as rain drizzling down her face in busy Tokyo neon streets',
    startingPosAr: 'البورتريه المقرب من زاوية ثلاثة أرباع',
    startingPosEn: 'a medium three-quarter close-up portrait lock',
    motionBrushAr: 'خصلات الشعر الضوئية: تموج ناعم، قطرات المطر: انسياب متساقط، أضواء خلفية المدينة: بوكيه متأرجح.',
    motionBrushEn: 'Fiber optic hair: Steady flowing energy wave, Raindrops: Falling micro lines, Background city bustle: Soft out-of-focus dynamic blur.'
  },
  {
    id: 'urban',
    labelAr: 'عمران ومعمار (Urban / Architecture)',
    labelEn: 'Urban / Architecture',
    icon: 'building',
    defaultSubjectAr: 'مدينة مستقبلية مستوحاة من العمارة العضوية مليئة بالحدائق المعلقة والطائرات الذاتية بين الأبراج',
    defaultSubjectEn: 'a futuristic sustainable megacity with spectacular organic wood-glass high-rises, hanging vertical forests, and flying sky-trams',
    startingPosAr: 'لقطة سينمائية منزلقة بين المباني',
    startingPosEn: 'a sleek architectural gliding dolly shot through sky bridges',
    motionBrushAr: 'المركبات الجوية: طيران أفقي مستقر، أوراق الأشجار المعلقة: تموج منسق مع الرياح الموسمية.',
    motionBrushEn: 'Sky-trams: Uniform cruising speed (50%), Hanging gardens foliage: Natural wind-swaying (20%), Sky clouds: Horizon creep (10%).'
  },
  {
    id: 'fantasy',
    labelAr: 'فانتازيا وخيال علمي (Fantasy / Sci-Fi)',
    labelEn: 'Fantasy / Sci-Fi Epic',
    icon: 'sparkles',
    defaultSubjectAr: 'بوابة أثرية حجرية عملاقة تشع بفيض من السحر الكوني تطفو فوق تلال عائمة مكسوة بالخزامى',
    defaultSubjectEn: 'a colossal ancient stone archway crackling with cosmic stellar magic rift, floating suspended above lavender covered sky-islands',
    startingPosAr: 'قاعدة البوابة الحجرية محاذية لخط الأفق',
    startingPosEn: 'the foot of the ancient stone ruins aligned to rule of thirds',
    motionBrushAr: 'الصدع السحري: دوامات طاقة جزيئية مضيئة 90%، الغبار الكوني الذهبى: جسيمات عائمة في الهواء.',
    motionBrushEn: 'Magic portal vortex: High speed swirling physics (90%), Lavender fields: Atmospheric micro wind, Floating rocks: Anti-gravity micro jitter.'
  }
];

// 2. STYLE PRESETS
interface StylePreset {
  id: string;
  labelAr: string;
  labelEn: string;
  prefix: string;
}

const STYLE_PRESETS: StylePreset[] = [
  { id: 'realistic', labelAr: 'واقعي فائق (Hyper-Realistic)', labelEn: 'Realistic Photorealism', prefix: 'photorealistic 8k, IMAX video capture, ultra-fine textures, award-winning national geographic style, highly detailed natural structures' },
  { id: 'cinematic', labelAr: 'واقعية سينمائية (Cinematic)', labelEn: 'Cinematic Cinema', prefix: 'cinematic hyper-realism, anamorphic lens flares, beautiful shallow depth of field, blockbuster moody color grading, professional volumetric key lighting' },
  { id: 'anime', labelAr: 'أنمي جيبلي (Ghibli Anime)', labelEn: 'Studio Ghibli Anime', prefix: 'aesthetic Studio Ghibli hand-drawn anime style, vibrant watercolor backgrounds, rich painted shading, nostalgic high-quality anime cel animation' },
  { id: 'cyberpunk', labelAr: 'سايبربانك نيون (Cyberpunk Neon)', labelEn: 'Cyberpunk Neon Noir', prefix: 'cyberpunk neon noir aesthetic, high-contrast saturated primary colors, misty rain slick concrete, glowing holographic overlays, dark vapor haze' },
  { id: 'vintage', labelAr: 'ريترو كوداك 35مم (Vintage Film)', labelEn: 'Vintage 35mm Kodak', prefix: 'vintage 35mm photograph aesthetic, authentic Kodak film grain, retro warm cinematic color grading, organic light leaks, nostalgia tone' },
  { id: 'minimalist', labelAr: 'بسيط عصري (Minimalist)', labelEn: 'Minimalist Contemporary', prefix: 'minimalist clean contemporary art direction, perfect lighting balance, elegant soft studio shadows, serene neutral shades, high-end design aesthetics' }
];

// 3. CAMERA MOTION EXPERT PRESETS
interface CameraPreset {
  id: string;
  labelAr: string;
  labelEn: string;
  movementText: string;
  transitionText: string;
}

const CAMERA_PRESETS: CameraPreset[] = [
  { id: 'descending', labelAr: 'هبوط عمودي (Descending)', labelEn: 'Descending Crane Shot', movementText: 'slowly descending vertically', transitionText: 'gently floating downwards to focus closely on' },
  { id: 'orbiting', labelAr: 'دوران مداري (Orbiting)', labelEn: 'Orbital Locked Pan', movementText: 'orchestrating a 360-degree perfect orbital tracking shot', transitionText: 'smoothly sweeping around' },
  { id: 'tracking', labelAr: 'متابعة خلفية (Tracking)', labelEn: 'Dynamic Tracking Run', movementText: 'steer organic high-speed tracking camera motion', transitionText: 'smoothly gliding at fixed distance alongside' },
  { id: 'panning', labelAr: 'مسح أفقي (Panning)', labelEn: 'Panoramic Horizontal Pan', movementText: 'sweeping slow horizontal pan', transitionText: 'panning from left to right across' },
  { id: 'tilting', labelAr: 'إمالة رأسية (Tilting)', labelEn: 'Vertical Tilting Lens', movementText: 'slowly tilting upward from base', transitionText: 'seamlessly revealing the majestic height of' },
  { id: 'dollying', labelAr: 'دولي تقريبي (Dollying)', labelEn: 'Cinematic Dolly-In/Out', movementText: 'executing a steady slow dolly zoom in', transitionText: 'slowly increasing visual proximity with' },
  { id: 'zooming', labelAr: 'تقريب عدسي (Zooming)', labelEn: 'Extreme Optical Zoom', movementText: 'smooth steady optic zoom-in technique', transitionText: 'tightening focus on the intricate patterns of' },
  { id: 'flying-through', labelAr: 'عبور حركي (Flying-Through)', labelEn: 'Immersive Fly-Through', movementText: 'flying-through narrow dynamic passages', transitionText: 'zipping seamlessly through keyframes over' },
  { id: 'sweeping', labelAr: 'انسياب مائل (Sweeping)', labelEn: 'Gliding Sweeping Motion', movementText: 'sweeping low altitude arc motion', transitionText: 'glidin and banking sharply above' },
  { id: 'gliding', labelAr: 'تدفق طافي (Gliding)', labelEn: 'Smooth Atmospheric Glide', movementText: 'gliding smoothly like a breeze', transitionText: 'slowly soaring above the horizon level of' }
];

// LIGHTING MOODS PRESETS
interface LightingMood {
  id: string;
  labelAr: string;
  labelEn: string;
  valueEn: string;
}

const LIGHTING_MOODS: LightingMood[] = [
  { id: 'cinematic_golden', labelAr: 'ساعة الغروب الذهبية (Cinematic Golden Hour)', labelEn: 'Cinematic Golden Hour', valueEn: 'warm volumetric golden hour sunlight with long dramatic shadows and sunset glow' },
  { id: 'noir_contrast', labelAr: 'تباين نوار السينمائي (Noir Contrast)', labelEn: 'Noir Contrast', valueEn: 'high-contrast dark film-noir shadows, gritty monochrome lighting accents and raw contrast' },
  { id: 'cyber_neon', labelAr: 'نيون سايبر ملون (Cyber Neon)', labelEn: 'Cyber Neon Glow', valueEn: 'vibrant dual-tone pink and cyan neon twilight highlights, high-contrast dark futuristic grading' },
  { id: 'studio_portrait', labelAr: 'إضاءة استوديو ناعمة (Studio Soft Key)', labelEn: 'Studio Soft Key', valueEn: 'professional clean three-point studio keylighting, soft volumetric diffusion, elegant rim shadows' },
  { id: 'overcast_natural', labelAr: 'ضوء غائم طبيعي (Overcast Natural)', labelEn: 'Overcast & Natural Day', valueEn: 'natural balanced overcast daylight, neutral pristine sky scattering and realistic specular reflections' },
  { id: 'ethereal_mystic', labelAr: 'ضباب إثيري غامض (Ethereal Mystic)', labelEn: 'Ethereal Mystic Fog', valueEn: 'mysterious ethereal twilight beams piercing through dense ground mist atmosphere' }
];

// 4. PLATFORMS CALIB WITH EXACT SPECS
interface EngineParam {
  name: string;
  minMotion: number;
  maxMotion: number;
  defaultMotion: number;
  motionParamName: string;
  isInteger: boolean;
  extraParams: string;
  negativePromptHint: string;
}

const ENGINE_CALIBRATIONS: Record<string, EngineParam> = {
  'Runway Gen-3': {
    name: 'Runway Gen-3',
    minMotion: 1,
    maxMotion: 10,
    defaultMotion: 7,
    motionParamName: '--motion',
    isInteger: true,
    extraParams: '--stable --no-warp',
    negativePromptHint: 'static frames, frozen, low quality text, morphing'
  },
  'Pika Labs 1.5': {
    name: 'Pika Labs 1.5',
    minMotion: 1,
    maxMotion: 4,
    defaultMotion: 2,
    motionParamName: '-m',
    isInteger: true,
    extraParams: '--no-morphing',
    negativePromptHint: 'still image, blurry, text overlay, weird artifacts'
  },
  'Luma Dream Machine': {
    name: 'Luma Dream Machine',
    minMotion: 0.1,
    maxMotion: 1.0,
    defaultMotion: 0.6,
    motionParamName: '--motion-strength',
    isInteger: false,
    extraParams: '--enhance',
    negativePromptHint: 'unstable physics, bad anatomy, text watermarks, raw'
  },
  'Kling AI': {
    name: 'Kling AI',
    minMotion: 1,
    maxMotion: 3, // Low=1, Medium=2, High=3
    defaultMotion: 3,
    motionParamName: '--motion',
    isInteger: true,
    extraParams: '--quality high',
    negativePromptHint: 'distorted physics, static frames, low resolution, ugly styling'
  },
  'Haiper AI': {
    name: 'Haiper AI',
    minMotion: 1,
    maxMotion: 10,
    defaultMotion: 7,
    motionParamName: '--motion',
    isInteger: true,
    extraParams: '--seed random',
    negativePromptHint: 'glitchy transition, dark noise, still render, ugly'
  },
  'Vidu Cinema': {
    name: 'Vidu Cinema',
    minMotion: 1,
    maxMotion: 5,
    defaultMotion: 3,
    motionParamName: '--motion',
    isInteger: true,
    extraParams: '--quality master',
    negativePromptHint: 'low quality, blurry borders, bad transitions, statics'
  }
};

// ----------------------------------------------------
// VEO 3.1 REASSURING LOADING MESSAGES
// ----------------------------------------------------
const REASSURING_MESSAGES_AR = [
  "جاري التحقق واستدعاء خوادم Google Veo 3.1 ⚡...",
  "تحليل تفاصيل الصورة وبؤرة التموضع المادي للعنصر الأساسي...",
  "صياغة مسارات الضوء والانكسارات الحركية وتوزيع الشروق السينمائي...",
  "معايرة حركة الكاميرا وموازنة حركة الإطارات الافتراضية بدقة...",
  "حقن خوارزميات الحيوية وتحريك أجزاء الصورة بلطف (شعر، مياه، غبار)...",
  "حقن معايير الاتساق الزمني لمنع اهتزاز أو تشويه أبعاد المشهد...",
  "توليف نهائي مبهر! نقوم الآن بتجهيز ملف البث المباشر للفيديو الخاص بك ⬇️..."
];

const REASSURING_MESSAGES_EN = [
  "Connecting and waking up global Google Veo 3.1 core ⚡...",
  "Analyzing starting frame aesthetics and segmenting structural boundaries...",
  "Simulating warm cinematic ambient scattering, specular bloom & refractions...",
  "Calibrating complex camera dolly curves to preserve viewport lock...",
  "Synthesizing high fidelity movement details (hair drift, foliage flow, water splashes)...",
  "Securing temporal frame-by-frame lock variables to prevent visual warp...",
  "Assembling MPEG-4 stream wrapper! Readying final product video download ⬇️..."
];

// ----------------------------------------------------
// VEO 3.1 DYNAMIC PRESETS
// ----------------------------------------------------
interface VeoPreset {
  id: string;
  labelAr: string;
  labelEn: string;
  type: 'ad' | 'avatar';
  prompt: string;
}

const VEO_PRESETS: VeoPreset[] = [
  {
    id: 'ad_luxury',
    labelAr: 'إعلان عطر/منتج فاخر (Luxury Ad)',
    labelEn: 'Luxury Product Showcase',
    type: 'ad',
    prompt: 'A premium slow motion atmospheric advertising showcasing this product, perfect rotating display on a sleek stage, surrounding warm golden lights, soft smoky volumetric haze, pristine detail focus, bokeh, studio setup'
  },
  {
    id: 'ad_splash',
    labelAr: 'قطرات الماء ورذاذ منعش (Splash Ad)',
    labelEn: 'Fresh Water Splashes',
    type: 'ad',
    prompt: 'A slow-motion product shoot, extreme close-up of this item with crystal water droplets exploding and splashing dynamically in mid-air, backlit cinematic studio lighting, green clean foliage reflections, active energy'
  },
  {
    id: 'ad_neon',
    labelAr: 'إعلان نيون وتتبع ليزري (Laser Glow)',
    labelEn: 'Futuristic Cyber Laser',
    type: 'ad',
    prompt: 'Dynamic technological advertise showcase of this modern product, glowing neon pink and cyan laser lines sweeping smoothly across the sleek surface, metallic cyber reflections, dark sleek carbon background'
  },
  {
    id: 'avatar_wind',
    labelAr: 'شعر يتطاير ونسيم عليل (Wind Flutter)',
    labelEn: 'Soft Portrait Wind',
    type: 'avatar',
    prompt: 'A gentle cinematic breeze blowing, soft hair locks fluttering and moving naturally in the wind, subtle friendly smile and soft breathing, camera slowly shifting left, warm sunset rays, highly detailed portrait'
  },
  {
    id: 'avatar_neon_rain',
    labelAr: 'أجواء مطر سايبر المضيئة (Cyber Rain)',
    labelEn: 'Cyberpunk Neon Rain',
    type: 'avatar',
    prompt: 'High contrast neon highlights flickering in the background of a busy Tokyo street, character hair glowing slightly, steam rising, atmospheric cinematic rain falling down softly, subtle camera drift and breathing'
  },
  {
    id: 'avatar_dramatic',
    labelAr: 'بورتريه سينمائي هادئ (Studio Portrait)',
    labelEn: 'Chiaroscuro Studio Portrait',
    type: 'avatar',
    prompt: 'A moody dramatic studio portrait, elegant soft head turn, slow breathing motion, emotional look, beautiful soft chiaroscuro rim lighting, shadow play, shallow depth of field'
  }
];

export default function VideoPromptDesigner({ lang, onSendToTester, onLogPrompt }: VideoPromptDesignerProps) {
  // Navigation internal tab
  const [activeOutputTab, setActiveOutputTab] = useState<'positive' | 'negative' | 'platform' | 'motion' | 'path' | 'all'>('positive');
  
  // App state
  const [selectedCategory, setSelectedCategory] = useState<string>('drone');
  const [selectedStyle, setSelectedStyle] = useState<string>('realistic');
  const [selectedCamera, setSelectedCamera] = useState<string>('descending');
  const [selectedLightingMood, setSelectedLightingMood] = useState<string>('cinematic_golden');
  const [customSubject, setCustomSubject] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('Runway Gen-3');
  
  // ----------------------------------------------------
  // GOOGLE VEO 3.1 LIVE VIDEO GENERATOR & ANIMATOR STATES
  // ----------------------------------------------------
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedImageMimeType, setUploadedImageMimeType] = useState<string>('image/png');
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const [veoPrompt, setVeoPrompt] = useState<string>('');
  const [veoModel, setVeoModel] = useState<string>('veo-3.1-lite-generate-preview');
  const [veoResolution, setVeoResolution] = useState<string>('1080p');
  const [veoAspectRatio, setVeoAspectRatio] = useState<string>('16:9');
  
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [veoMessageIndex, setVeoMessageIndex] = useState<number>(0);
  const [veoError, setVeoError] = useState<string | null>(null);
  const [generatedVideoBlobUrl, setGeneratedVideoBlobUrl] = useState<string | null>(null);
  const [videoOperationName, setVideoOperationName] = useState<string | null>(null);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  
  // Parameters
  const [motionVal, setMotionVal] = useState<number>(7);
  const [videoDuration, setVideoDuration] = useState<number>(4);
  const [aspectRatio, setAspectRatio] = useState<string>('16:9');
  const [frameRate, setFrameRate] = useState<number>(24);
  const [resolution, setResolution] = useState<string>('4K UHD');
  
  // Variations state
  const [selectedVariationType, setSelectedVariationType] = useState<'cinematic' | 'slow_mo' | 'sports_action' | 'macro'>('cinematic');
  const [physicsIntegrity, setPhysicsIntegrity] = useState<boolean>(true);
  
  // Notification alert on screen toast
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [isExpanding, setIsExpanding] = useState<boolean>(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);

  // Auto update motion slider ranges on platform swap
  useEffect(() => {
    const calib = ENGINE_CALIBRATIONS[selectedPlatform];
    if (calib) {
      setMotionVal(calib.defaultMotion);
    }
  }, [selectedPlatform]);

  // Sync category defaults if the input field is empty
  const activeCategoryObj = VIDEO_CATEGORIES.find(c => c.id === selectedCategory) || VIDEO_CATEGORIES[0];
  const activeStyleObj = STYLE_PRESETS.find(s => s.id === selectedStyle) || STYLE_PRESETS[0];
  const activeCameraObj = CAMERA_PRESETS.find(cam => cam.id === selectedCamera) || CAMERA_PRESETS[0];

  const currentSubject = customSubject.trim() 
    ? customSubject.trim() 
    : (lang === 'ar' ? activeCategoryObj.defaultSubjectAr : activeCategoryObj.defaultSubjectEn);

  const currentStartingPos = lang === 'ar' ? activeCategoryObj.startingPosAr : activeCategoryObj.startingPosEn;

  // ----------------------------------------------------
  // ADVANCED PROMPT BUILDERS MEETING THE 5 REQUIREMENT FIELDS
  // ----------------------------------------------------
  
  // Camera motion structure text mapping
  const buildPositivePrompt = (): string => {
    const stylePrefix = activeStyleObj.prefix;
    const movement = activeCameraObj.movementText;
    const starting = currentStartingPos;
    const transition = activeCameraObj.transitionText;
    const focalElement = currentSubject;
    
    // Selected Lighting Mood from dropdown
    const activeMoodObj = LIGHTING_MOODS.find(m => m.id === selectedLightingMood) || LIGHTING_MOODS[0];
    const lightingStyle = activeMoodObj.valueEn;

    let technicalSpecs = `${resolution} resolution, running hyper-fluid at ${frameRate}fps, rich photorealistic details`;
    if (selectedVariationType === 'slow_mo') {
      technicalSpecs = `${resolution} extreme slow-motion captures, 120fps high speed temporal consistency, razor-sharp detail render`;
    } else if (selectedVariationType === 'sports_action') {
      technicalSpecs = `${resolution} cinematic dynamic motion tracking, 60fps fast shutter tracking depth`;
    }

    const calib = ENGINE_CALIBRATIONS[selectedPlatform];
    let stabilityParams = calib ? calib.extraParams : '--stable';
    if (physicsIntegrity) {
      stabilityParams += ' --stable_flow_dynamics --horizon_lock';
    }
    
    // Core prompt integration (RULE #1):
    // {CAMERA_TYPE} {MOVEMENT_PATTERN} from {STARTING_POSITION}, {TRANSITION_ACTION} above/around {FOCAL_ELEMENT}, {LIGHTING_STYLE}, {TECHNICAL_SPECS}, {STABILITY_PARAMS}
    return `${activeCameraObj.labelEn} executing ${movement} from ${starting}, ${transition} ${focalElement}, bathed in ${lightingStyle}, featuring ${technicalSpecs}, parameters: ${stabilityParams_builder()} --ar ${aspectRatio}`;
  };

  const stabilityParams_builder = (): string => {
    const calib = ENGINE_CALIBRATIONS[selectedPlatform];
    if (!calib) return '--stable';
    const motionStrValue = calib.isInteger ? Math.round(motionVal).toString() : motionVal.toFixed(1);
    let output = `${calib.motionParamName} ${motionStrValue} ${calib.extraParams}`;
    if (physicsIntegrity) {
      output += ' --no_warp';
    }
    return output;
  };

  const buildNegativePrompt = (): string => {
    const calib = ENGINE_CALIBRATIONS[selectedPlatform];
    const engineSpec = calib ? calib.negativePromptHint : 'static, frozen frame';
    return `static frames, frozen still image, blur, extreme compression artifacts, distortion, morphing, unnatural physics, text overlays, watermarks, brand logos, low quality, noise, flicker, out of frame`;
  };

  const buildPlatformSettings = (): string => {
    const calib = ENGINE_CALIBRATIONS[selectedPlatform];
    const mValue = calib ? (calib.isInteger ? Math.round(motionVal).toString() : motionVal.toFixed(1)) : motionVal;
    return `- Platform: ${selectedPlatform}\n- Motion Strength Scale Value: ${mValue}/${calib ? calib.maxMotion : 10}\n- Active Duration: ${videoDuration} seconds\n- Target Resolution: ${resolution}\n- Screen Aspect Ratio: ${aspectRatio}\n- Camera Framerate: ${frameRate} FPS\n- Special CLI Parameters: ${stabilityParams_builder()} --ar ${aspectRatio}`;
  };

  const buildMotionBrushRegions = (): string => {
    return activeCategoryObj.motionBrushEn;
  };

  const buildCameraPath = (): string => {
    const mName = activeCameraObj.labelEn;
    const move = activeCameraObj.movementText;
    const starting = currentStartingPos;
    
    return `1. INITIAL CORNER: Position cameras at ${starting}.\n2. FLIGHT TRANSITION: Launch ${move} across the focal vector during first 50% of timeline.\n3. CONVERGE CONTEXT: Glide smoothly and focus attention precisely on ${currentSubject.substring(0, 40)}...\n4. FLIGHT HORIZON: Bind perspective to lock horizons with continuous ${frameRate}fps tracking consistency.`;
  };

  // Compile entire suite in raw markdown format
  const compileAllMarkdown = (): string => {
    return `### **VIDEO GENERATION SUITE FOR PROMPT ENGINEERS**\n\n` +
           `**POSITIVE PROMPT:**\n\`\`\`text\n${buildPositivePrompt()}\n\`\`\`\n\n` +
           `**NEGATIVE PROMPT:**\n\`\`\`text\n${buildNegativePrompt()}\n\`\`\`\n\n` +
           `**PLATFORM SETTINGS:**\n\`\`\`yaml\n${buildPlatformSettings()}\n\`\`\`\n\n` +
           `**MOTION BRUSH REGIONS:**\n- ${buildMotionBrushRegions()}\n\n` +
           `**CAMERA PATH PLAN:**\n${buildCameraPath()}`;
  };

  // UI Interactive action triggers
  const handleCopySection = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  // Expand with Gemini Core API call
  const handleAIEnhanceVideoSubject = async () => {
    const termToExpand = customSubject.trim() || activeCategoryObj.defaultSubjectEn;
    setIsExpanding(true);
    setAiMessage(null);

    try {
      const response = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawConcept: termToExpand,
          concept: termToExpand,
          model: 'midjourney',
          tone: 'Hyper-detailed cinematic focal elements, rich texturing, organic volumetric light reflections',
          category: 'video',
          language: lang
        })
      });

      if (!response.ok) throw new Error('Failed');
      const data = await response.json();
      const promptResult = data.optimizedPrompt || data.optimizedText;
      if (promptResult) {
        let textResult = promptResult.replace(/```text/g, '').replace(/```/g, '').trim();
        setCustomSubject(textResult);
        setAiMessage(
          lang === 'ar'
            ? 'تم توسيع بؤرة المشهد والتفاصيل الفيزيائية بنجاح باستخدام الذكاء الاصطناعي!'
            : 'Focal details and motion physics expanded successfully via core AI model!'
        );
      }
    } catch (e) {
      console.error(e);
      // Fallback expansion logic to preserve continuous production
      setCustomSubject(`${termToExpand}, incredibly detailed glass reflections, high-fidelity mapping, dynamic shadows, volumetric ambient scattering`);
      setAiMessage(
        lang === 'ar'
          ? 'تم تعزيز عناصر المشهد محلياً لتفادي انقطاع الاتصال.'
          : 'Enhanced locally with structural physical microdetails (Offline mode resilience).'
      );
    } finally {
      setIsExpanding(false);
    }
  };

  const handleRegisterToHistory = () => {
    onLogPrompt({
      originalText: `Video Master Suite [${selectedCategory} | ${selectedPlatform}]`,
      optimizedText: compileAllMarkdown(),
      model: 'midjourney',
      tone: `Platform optimized video settings logged`,
      category: 'video',
      actionType: 'generate'
    });
    setCopiedSection('log-history');
    setTimeout(() => setCopiedSection(null), 2500);
  };

  // ----------------------------------------------------
  // GOOGLE VEO 3.1 DYNAMIC HANDLERS
  // ----------------------------------------------------
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError(lang === 'ar' ? 'يرجى تحميل ملف صورة صالح (JPEG, PNG)' : 'Please upload a valid image file');
      return;
    }

    if (file.size > 8 * 1024 * 1024) { // 8MB limit
      setUploadError(lang === 'ar' ? 'حجم الصورة كبير جداً. يرجى اختيار صورة أقل من 8 ميجابايت.' : 'File size is too large. Max is 8MB.');
      return;
    }

    setUploadError(null);
    setUploadedImageMimeType(file.type);

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImage(reader.result as string);
    };
    reader.onerror = () => {
      setUploadError(lang === 'ar' ? 'حدث خطأ أثناء قراءة ملف الصورة.' : 'Error reading the image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError(lang === 'ar' ? 'يرجى إسقاط ملف صورة صالح (JPEG, PNG)' : 'Please drop a valid image file');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setUploadError(lang === 'ar' ? 'حجم الصورة كبير جداً. الحد الأقصى 8 ميجابايت.' : 'File is too large. Max limit is 8MB.');
      return;
    }

    setUploadError(null);
    setUploadedImageMimeType(file.type);

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearUploadedImage = () => {
    setUploadedImage(null);
    setUploadError(null);
  };

  const selectVeoPreset = (preset: typeof VEO_PRESETS[0]) => {
    setActivePresetId(preset.id);
    setVeoPrompt(preset.prompt);
  };

  const importEngineeredPrompt = () => {
    const engineered = buildPositivePrompt();
    setVeoPrompt(engineered);
    setActivePresetId(null);
  };

  const handleGenerateVeoVideo = async () => {
    setIsGenerating(true);
    setVeoError(null);
    setGeneratedVideoBlobUrl(null);
    setVeoMessageIndex(0);

    const activePrompt = veoPrompt.trim() || buildPositivePrompt();

    try {
      console.log('[Veo Client] Requesting video generation from backend...');
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: activePrompt,
          image: uploadedImage,
          mimeType: uploadedImageMimeType,
          resolution: veoResolution,
          aspectRatio: veoAspectRatio,
          model: veoModel
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to start video generation');
      }

      const operationName = data.operationName;
      setVideoOperationName(operationName);
      
      // Poll
      pollVideoStatus(operationName);
    } catch (err: any) {
      console.error('[Veo Client] Generation error:', err);
      if (err?.message && (err.message.includes('403') || err.message.includes('permission_denied') || err.message.includes('Quota exceeded') || err.message.includes('paid_model_flow'))) {
        setVeoError(
          lang === 'ar'
            ? 'خطأ: يتطلب استدعاء نموذج Veo 3.1 تفعيل الحساب ذو المزايا المدفوعة (Paid Model Flow) أو تهيئة مفتاح خادم مفعل عليه الفوترة في لوحة إعدادات المنصة.'
            : 'Error: Veo 3.1 video generation requires a Paid Tier API key. Please check your credentials or upgrade in the standard platform Settings.'
        );
      } else {
        setVeoError(err?.message || 'Error occurred starting video generation');
      }
      setIsGenerating(false);
    }
  };

  const pollVideoStatus = async (operationName: string) => {
    let pollInterval = 8000;
    let maxAttempts = 50;
    let attempts = 0;

    const timer = setInterval(async () => {
      attempts++;
      
      // Increment reassuring messages visually
      setVeoMessageIndex((prev) => (prev + 1) % REASSURING_MESSAGES_AR.length);

      if (attempts > maxAttempts) {
        clearInterval(timer);
        setVeoError(lang === 'ar' ? 'انتهت المهلة الزمنية لمعاينة حالة الفيديو. يرجى إعادة المحاولة.' : 'Status check timed out. Please try again.');
        setIsGenerating(false);
        return;
      }

      try {
        const response = await fetch('/api/video-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Status check failed');
        }

        if (data.done) {
          clearInterval(timer);
          
          if (data.error) {
            throw new Error(data.error?.message || 'Google Veo failed to generate the video.');
          }

          downloadGeneratedVideo(operationName);
        }
      } catch (err: any) {
        clearInterval(timer);
        console.error('[Veo Client] Poll failure:', err);
        setVeoError(err?.message || 'Error checking video generation status.');
        setIsGenerating(false);
      }
    }, pollInterval);
  };

  const downloadGeneratedVideo = async (operationName: string) => {
    try {
      const response = await fetch('/api/video-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationName })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch final video stream');
      }

      const videoBlob = await response.blob();
      const localUrl = URL.createObjectURL(videoBlob);
      setGeneratedVideoBlobUrl(localUrl);

      // Log to history
      onLogPrompt({
        originalText: veoPrompt.trim() ? (`Veo 3.1: ` + veoPrompt.substring(0, 50)) : 'Google Veo 3.1 Generated Video',
        optimizedText: `Operation Name: ${operationName}\nPreset Used: ${activePresetId || 'Custom'}\nResolution: ${veoResolution}\nAspect Ratio: ${veoAspectRatio}\nBlob URI successfully mapped server-side.`,
        model: 'veo-3.1-lite-generate-preview' as any,
        tone: 'Cinematic High Fidelity',
        category: 'video',
        actionType: 'generate'
      });
    } catch (err: any) {
      console.error('[Veo Client] Stream download error:', err);
      setVeoError(err?.message || 'Error streaming final video file from Google.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div id="video-expert-prompter" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Visual Header Grid Panel */}
      <div className="bg-gradient-to-tr from-neutral-900 via-stone-900 to-indigo-950 rounded-3xl p-6 sm:p-10 text-white shadow-2xl border border-indigo-500/15 relative overflow-hidden mb-10">
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-indigo-500/20 backdrop-blur-md rounded-full text-[11px] font-black tracking-widest text-indigo-300 border border-indigo-500/30 uppercase">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
              <span>{lang === 'ar' ? 'نموذج محاكاة مخرج أفلام الذكاء الاصطناعي' : 'AI CINEMATIC PRODUCER PIPELINE'}</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight font-sans leading-tight">
              {lang === 'ar' ? 'مطور ومنشئ أوامر الفيديو الاحترافية 🎬' : 'Professional AI Video Prompt Workstation 🎬'}
            </h2>
            
            <p className="text-xs sm:text-sm text-stone-300 max-w-3xl font-medium leading-relaxed">
              {lang === 'ar'
                ? 'مستشار ومهيكل للبرومتات المتكاملة والمخصصة لكل منصات الفيديو العالمية. يقوم تلقائياً بضبط مسار الكاميرا، نسب الزوايا، التعديل الحركي للفرشاة، والصيغ السلبية لمنع التشوهات البصرية.'
                : 'Configure industry-optimized physical and camera instructions for Runway, Luma, Pika, Kling, or Vidu. Enforces negative parameters, focal constraints, and multi-axes flight paths.'}
            </p>
          </div>

          <div className="bg-white/10 dark:bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/15 max-w-xs self-stretch md:self-auto flex flex-col justify-between">
            <span className="text-[10px] text-indigo-300 font-extrabold uppercase tracking-wide flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" />
              {lang === 'ar' ? 'مؤشرات الاتساق الفيزيائي' : 'TEMPORAL CONSISTENCY'}
            </span>
            <p className="text-[11px] text-stone-200 mt-1 font-medium leading-normal">
              {lang === 'ar' ? 'الأوامر تدعم الحفاظ على ثبات الوجوه وحساب زبد الماء ديناميكياً.' : 'Strictly formatted with horizon-locks and motion damping to bypass morphing.'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Left Parameter Panel (7 Columns) */}
        <section className="xl:col-span-7 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-880 shadow-sm p-6 sm:p-8 space-y-8">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-150 dark:border-stone-800 pb-4">
            <div className="flex items-center gap-2.5">
              <Sliders className="w-5.5 h-5.5 text-indigo-600 dark:text-indigo-400" />
              <div>
                <h3 className="text-lg font-black text-stone-900 dark:text-stone-105 font-sans">
                  {lang === 'ar' ? 'لوحة تحكم معايير الإنتاج' : 'Producer Configuration Panel'}
                </h3>
                <p className="text-[11px] text-stone-400 font-medium">Calibrate styles, optics & platform parameters</p>
              </div>
            </div>
            <span className="text-xs font-mono bg-stone-100 dark:bg-stone-950 text-stone-500 px-3 py-1 rounded-lg">CALIB V1.3</span>
          </div>

          {/* Step 1: Video Category Selection */}
          <div className="space-y-3">
            <label className="text-xs font-black text-stone-700 dark:text-stone-300 uppercase tracking-wider block">
              {lang === 'ar' ? '1. فئة ونطاق الحركة للفيديو (Video Category):' : '1. Target Video Category & Dynamics:'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {VIDEO_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setCustomSubject(''); // Reset to default for the category unless user wants to write custom
                    }}
                    className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col justify-between h-24 items-center ${
                      isSelected
                        ? 'bg-indigo-500/5 dark:bg-indigo-950/20 border-indigo-500 text-indigo-900 dark:text-indigo-400 shadow-md shadow-indigo-500/5'
                        : 'bg-stone-50 hover:bg-stone-100 dark:bg-stone-950 dark:hover:bg-stone-900 border-stone-250 dark:border-stone-800 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center text-xs font-bold text-stone-700 dark:text-indigo-300">
                      <span className="capitalize">{cat.id.substring(0, 2)}</span>
                    </div>
                    <span className="text-[11px] font-black truncate w-full mt-2.5">
                      {lang === 'ar' ? cat.labelAr.split(' ')[0] : cat.labelEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subject Field Input with AI generation option */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-stone-700 dark:text-stone-300 uppercase tracking-wider flex items-center gap-1">
                <Compass className="w-4 h-4 text-emerald-500 animate-pulse" />
                <span>{lang === 'ar' ? '2. فكرة الفيديو أو العنصر البؤري (Scene Idea):' : '2. Write scene idea or focal subject:'}</span>
              </label>
              
              <button
                type="button"
                disabled={isExpanding}
                onClick={handleAIEnhanceVideoSubject}
                className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:underline flex items-center gap-1.5 disabled:opacity-50 cursor-pointer bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20"
              >
                {isExpanding ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{lang === 'ar' ? 'جاري توسيع أبعاد المشهد...' : 'Expanding Physics...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-indigo-505 animate-pulse" />
                    <span>{lang === 'ar' ? 'تعزيز حركة العناصر بالذكاء الاصطناعي 🌟' : 'AI Microdetail Expand 🌟'}</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
              rows={3}
              placeholder={lang === 'ar' ? `مثال افتراضي للفئة: ${activeCategoryObj.defaultSubjectAr}` : `e.g. ${activeCategoryObj.defaultSubjectEn}`}
              className="w-full text-xs font-bold rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-800 dark:text-stone-200 p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/35 transition leading-relaxed resize-none"
            />

            <div className="flex justify-start">
              <button
                type="button"
                disabled={isExpanding}
                onClick={handleAIEnhanceVideoSubject}
                className="w-full sm:w-auto px-5 py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white font-black text-xs rounded-xl shadow-lg shadow-indigo-505/10 hover:shadow-indigo-500/20 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer"
              >
                {isExpanding ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                    <span>{lang === 'ar' ? 'جاري صياغة وتصميم البرومت...' : 'Designing Advanced Prompt...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-white animate-pulse shrink-0" />
                    <span>{lang === 'ar' ? 'توليد البرومت بالذكاء الاصطناعي ✨' : 'Generate Prompt with AI ✨'}</span>
                  </>
                )}
              </button>
            </div>
            
            {aiMessage && (
              <div className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 px-3 py-2 rounded-xl border border-emerald-500/15 flex items-center gap-1.5 animate-fadeIn">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{aiMessage}</span>
              </div>
            )}
            
            <p className="text-[10px] text-stone-400 leading-normal">
              {lang === 'ar' ? 'نصيحة: ابدأ بعنصر ثابت أو متحرك ببطء، وسيقوم المولد بصنع الارتداد البصري حوله.' : 'Tip: Describe the key object, characters or bodies. The director module automatically chains relative speed vector modifiers.'}
            </p>
          </div>

          {/* Step 3: Combined Style, Camera Motion & Lighting Mood selects */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Style Preset */}
            <div className="space-y-2">
              <label className="text-xs font-black text-stone-700 dark:text-stone-300 uppercase block">
                {lang === 'ar' ? '3. المظهر البصري (Style):' : '3. Art style / preset:'}
              </label>
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="w-full text-xs font-bold rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-800 dark:text-stone-200 px-3.5 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-505/35 duration-200 cursor-pointer"
              >
                {STYLE_PRESETS.map((style) => (
                  <option key={style.id} value={style.id}>
                    {lang === 'ar' ? style.labelAr : style.labelEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Camera Motion Selection */}
            <div className="space-y-2">
              <label className="text-xs font-black text-stone-700 dark:text-stone-300 uppercase block">
                {lang === 'ar' ? '4. حركية الكاميرا (Camera Path):' : '4. Camera movement:'}
              </label>
              <select
                value={selectedCamera}
                onChange={(e) => setSelectedCamera(e.target.value)}
                className="w-full text-xs font-bold rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-800 dark:text-stone-200 px-3.5 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-505/35 duration-200 cursor-pointer"
              >
                {CAMERA_PRESETS.map((cam) => (
                  <option key={cam.id} value={cam.id}>
                    {lang === 'ar' ? cam.labelAr : cam.labelEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Lighting Mood Selection */}
            <div className="space-y-2">
              <label className="text-xs font-black text-stone-700 dark:text-stone-300 uppercase block">
                {lang === 'ar' ? '5. تأثير وجودة الإضاءة (Lighting Mood):' : '5. Ambient lighting mood:'}
              </label>
              <select
                value={selectedLightingMood}
                onChange={(e) => setSelectedLightingMood(e.target.value)}
                className="w-full text-xs font-bold rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-800 dark:text-stone-200 px-3.5 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-505/35 duration-200 cursor-pointer"
              >
                {LIGHTING_MOODS.map((mood) => (
                  <option key={mood.id} value={mood.id}>
                    {lang === 'ar' ? mood.labelAr : mood.labelEn}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Target Engine & Motion Strengths */}
          <div className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-805 space-y-5">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Select Engine Platform */}
              <div className="space-y-2.5">
                <label className="text-xs font-black text-stone-800 dark:text-stone-300 uppercase block">
                  {lang === 'ar' ? '6. منصة توليد الفيديو المستهدفة:' : '6. Selected AI video platform engine:'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.keys(ENGINE_CALIBRATIONS).map((pName) => {
                    const isSelected = selectedPlatform === pName;
                    return (
                      <button
                        key={pName}
                        type="button"
                        onClick={() => setSelectedPlatform(pName)}
                        className={`py-2 text-[10px] font-black rounded-lg border transition duration-200 cursor-pointer ${
                          isSelected
                            ? 'bg-neutral-900 border-neutral-900 text-white shadow-sm'
                            : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-stone-300 text-stone-600 dark:text-stone-400'
                        }`}
                      >
                        {pName.split(' ')[0]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Motion strength slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-stone-850 dark:text-stone-300 uppercase">
                    {lang === 'ar' ? 'معامل سرعة شدة الحركة (Motion Strength):' : 'Digital motion strength value:'}
                  </span>
                  <span className="text-xs font-black font-mono text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20 px-2.5 py-0.5 rounded-md">
                    {motionVal} / {ENGINE_CALIBRATIONS[selectedPlatform]?.maxMotion || 10}
                  </span>
                </div>
                
                <input
                  type="range"
                  min={ENGINE_CALIBRATIONS[selectedPlatform]?.minMotion || 1}
                  max={ENGINE_CALIBRATIONS[selectedPlatform]?.maxMotion || 10}
                  step={ENGINE_CALIBRATIONS[selectedPlatform]?.isInteger ? 1 : 0.1}
                  value={motionVal}
                  onChange={(e) => setMotionVal(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-stone-200 dark:bg-stone-800 rounded-lg appearance-none"
                />
                
                <div className="flex justify-between text-[9px] text-stone-400 font-extrabold uppercase">
                  <span>{lang === 'ar' ? 'حركة ناعمة وهادئة' : 'Ambient flow'}</span>
                  <span>{lang === 'ar' ? 'حركة فيزيائية عاصفة' : 'Violent turbulence'}</span>
                </div>
              </div>

            </div>

            {/* Video Metadata parameters sub-grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-stone-150 dark:border-stone-800">
              
              {/* Aspect Ratio */}
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-stone-400 dark:text-stone-500 uppercase">{lang === 'ar' ? 'نسبة شاشة العرض (Ratio):' : 'ASPECT RATIO:'}</span>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="w-full text-xs font-bold rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 px-2 py-1.5 cursor-pointer"
                >
                  <option value="16:9">16:9 Cinema</option>
                  <option value="9:16">9:16 Tiktok</option>
                  <option value="1:1">1:1 Square</option>
                  <option value="21:9">21:9 Ultra-Wide</option>
                </select>
              </div>

              {/* Framerate */}
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-stone-400 dark:text-stone-500 uppercase">{lang === 'ar' ? 'معدل الإطارات (FPS):' : 'FPS RATE:'}</span>
                <select
                  value={frameRate}
                  onChange={(e) => setFrameRate(Number(e.target.value))}
                  className="w-full text-xs font-bold rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 px-2 py-1.5 cursor-pointer"
                >
                  <option value={24}>24 FPS Film</option>
                  <option value={30}>30 FPS Standard</option>
                  <option value={60}>60 FPS Smooth</option>
                </select>
              </div>

              {/* Resolution selection */}
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-stone-400 dark:text-stone-500 uppercase">{lang === 'ar' ? 'الدقة والجودة المظهرية:' : 'OUTPUT QUALITY:'}</span>
                <select
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  className="w-full text-xs font-bold rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 px-2 py-1.5 cursor-pointer"
                >
                  <option value="4K UHD">4K UHD Master</option>
                  <option value="1080p FHD">1080p Full HD</option>
                  <option value="720p HD">720p Mobile optimized</option>
                </select>
              </div>

              {/* Duration slider in unit selector */}
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-stone-400 dark:text-stone-500 uppercase">{lang === 'ar' ? 'مدة التوليد (Duration):' : 'SCENE TIME:'}</span>
                <select
                  value={videoDuration}
                  onChange={(e) => setVideoDuration(Number(e.target.value))}
                  className="w-full text-xs font-bold rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 px-2 py-1.5 cursor-pointer"
                >
                  <option value={4}>4 Seconds scene</option>
                  <option value={5}>5 Seconds slow</option>
                  <option value={10}>10 Seconds extended</option>
                </select>
              </div>

            </div>

          </div>

          {/* Preset variations selection (Beginner, Intermediate, Advanced style options) */}
          <div className="space-y-3">
            <span className="text-xs font-black text-stone-700 dark:text-stone-300 block uppercase tracking-wider">
              {lang === 'ar' ? 'خيارات المحاكاة والتحسين الفيزيائي:' : 'Calibrate Production Variations & Speed Modifiers:'}
            </span>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
              
              <button
                type="button"
                onClick={() => setSelectedVariationType('cinematic')}
                className={`py-3 px-2 text-center rounded-xl border text-[11px] font-black flex flex-col items-center justify-center gap-1 cursor-pointer transition ${
                  selectedVariationType === 'cinematic'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white dark:bg-stone-950 text-stone-700 dark:text-stone-400 border-stone-200 dark:border-stone-800'
                }`}
              >
                <span>{lang === 'ar' ? 'واقعية سينمائية' : 'Cinematic Standard'}</span>
                <span className="text-[9px] opacity-75 font-normal">Ideal for storytelling</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedVariationType('slow_mo')}
                className={`py-3 px-2 text-center rounded-xl border text-[11px] font-black flex flex-col items-center justify-center gap-1 cursor-pointer transition ${
                  selectedVariationType === 'slow_mo'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white dark:bg-stone-950 text-stone-700 dark:text-stone-400 border-stone-200 dark:border-stone-800'
                }`}
              >
                <span>{lang === 'ar' ? 'حركة فائقة البطء ❄️' : 'Ultra Slow-Motion ❄️'}</span>
                <span className="text-[9px] opacity-75 font-normal">Freeze splash actions</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedVariationType('sports_action')}
                className={`py-3 px-2 text-center rounded-xl border text-[11px] font-black flex flex-col items-center justify-center gap-1 cursor-pointer transition ${
                  selectedVariationType === 'sports_action'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white dark:bg-stone-950 text-stone-700 dark:text-stone-400 border-stone-200 dark:border-stone-800'
                }`}
              >
                <span>{lang === 'ar' ? 'سرعة رياضية عالية ⚡' : 'Dynamic Sports FPV ⚡'}</span>
                <span className="text-[9px] opacity-75 font-normal">Fast sweeping action</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedVariationType('macro')}
                className={`py-3 px-2 text-center rounded-xl border text-[11px] font-black flex flex-col items-center justify-center gap-1 cursor-pointer transition ${
                  selectedVariationType === 'macro'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white dark:bg-stone-950 text-stone-700 dark:text-stone-400 border-stone-200 dark:border-stone-800'
                }`}
              >
                <span>{lang === 'ar' ? 'تقريب ماكرو مفرط' : 'Extreme Macro Shot'}</span>
                <span className="text-[9px] opacity-75 font-normal">Rich organic fibers</span>
              </button>

            </div>

            {/* Smart physics toggle button */}
            <div className="flex items-center justify-between p-4 bg-emerald-500/5 dark:bg-emerald-950/10 border border-emerald-500/10 rounded-2xl">
              <div className="flex gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-xs font-black text-stone-800 dark:text-stone-200">
                    {lang === 'ar' ? 'منشط الاتساق الفيزيائي التراكمي (Horizon Stabilization Guard)' : 'Temporal Physics Consistency Guard'}
                  </h4>
                  <p className="text-[10px] text-stone-450">
                    {lang === 'ar' ? 'يمنع تشويه الوجوه وتشوهات الكاميرا بمحاذاة خط الأفق.' : 'Prevents sudden camera warping, object splitting, and environment disintegration.'}
                  </p>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => setPhysicsIntegrity(!physicsIntegrity)}
                className={`w-11 h-6 rounded-full p-1 transition-all cursor-pointer ${physicsIntegrity ? 'bg-emerald-600 justify-end' : 'bg-stone-300 dark:bg-stone-800 justify-start'} flex items-center`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
              </button>
            </div>

          </div>

        </section>

        {/* Right Output Suite Board (5 Columns) */}
        <section className="xl:col-span-5 flex flex-col justify-between align-stretch gap-6 h-full">
          
          <div className="bg-stone-50 dark:bg-stone-950 rounded-3xl border border-stone-200 dark:border-stone-880 p-5 sm:p-7 space-y-5 shadow-sm">
            
            {/* Header Readout label */}
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <FileVideo className="w-5 h-5 text-indigo-600 animate-pulse" />
                <h4 className="text-sm font-extrabold text-stone-900 dark:text-stone-100 font-sans tracking-wide">
                  {lang === 'ar' ? 'معمل المخرج ومعاينة البرومبت السينمائي' : 'Cinema Shot Output Suite'}
                </h4>
              </div>
              <span className="text-[9px] bg-indigo-500/10 text-indigo-600 font-black px-2 py-0.5 rounded uppercase">PRO COMPLIANT</span>
            </div>

            {/* Visual Output Segment Selection Switch */}
            <div className="flex bg-stone-150 dark:bg-stone-900 p-1 rounded-xl gap-1">
              {(['positive', 'negative', 'platform', 'motion', 'path', 'all'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveOutputTab(tab)}
                  className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all cursor-pointer ${
                    activeOutputTab === tab
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                  }`}
                >
                  {tab === 'all' ? (lang === 'ar' ? 'الكل 📝' : 'All') : tab}
                </button>
              ))}
            </div>

            {/* Interactive Output Preview Box */}
            <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 shadow-inner relative min-h-[300px] flex flex-col justify-between">
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeOutputTab}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-1.5 text-[9px] text-stone-400 font-black uppercase">
                    <span>
                      {activeOutputTab === 'positive' && '1. positive prompt output'}
                      {activeOutputTab === 'negative' && '2. negative prompt output'}
                      {activeOutputTab === 'platform' && '3. custom platform overrides'}
                      {activeOutputTab === 'motion' && '4. motion brush highlights'}
                      {activeOutputTab === 'path' && '5. dynamic camera flight plan'}
                      {activeOutputTab === 'all' && 'Full Comprehensive Markdown block'}
                    </span>
                    <span className="text-emerald-600">Active Node</span>
                  </div>

                  {activeOutputTab === 'positive' && (
                    <p className="text-stone-800 dark:text-stone-105 font-mono text-xs sm:text-[13px] leading-relaxed tracking-wide font-medium">
                      {buildPositivePrompt()}
                    </p>
                  )}

                  {activeOutputTab === 'negative' && (
                    <p className="text-rose-700 dark:text-rose-400 font-mono text-xs leading-relaxed font-bold">
                      {buildNegativePrompt()}
                    </p>
                  )}

                  {activeOutputTab === 'platform' && (
                    <pre className="text-stone-755 dark:text-stone-300 font-mono text-xs whitespace-pre-wrap leading-relaxed font-black p-2.5 rounded bg-stone-55 dark:bg-stone-950">
                      {buildPlatformSettings()}
                    </pre>
                  )}

                  {activeOutputTab === 'motion' && (
                    <div className="space-y-2">
                      <p className="text-teal-700 dark:text-teal-400 font-mono text-xs font-bold leading-relaxed">
                        {buildMotionBrushRegions()}
                      </p>
                      <div className="text-[10px] text-stone-400 uppercase tracking-widest leading-normal">
                        Note: Painting the corresponding coordinates inside the engine GUI with designated values drastically decreases render issues.
                      </div>
                    </div>
                  )}

                  {activeOutputTab === 'path' && (
                    <pre className="text-indigo-700 dark:text-indigo-400 font-mono text-xs whitespace-pre-wrap leading-relaxed font-bold">
                      {buildCameraPath()}
                    </pre>
                  )}

                  {activeOutputTab === 'all' && (
                    <pre className="text-stone-700 dark:text-stone-200 font-mono text-[10px] whitespace-pre-wrap leading-relaxed p-2.5 rounded bg-stone-50 dark:bg-stone-950 overflow-auto max-h-[300px]">
                      {compileAllMarkdown()}
                    </pre>
                  )}

                </motion.div>
              </AnimatePresence>

              {/* Clipboard & system success indicator */}
              <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 min-h-[25px]">
                <AnimatePresence>
                  {copiedSection && (
                    <motion.div
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-xs font-bold text-emerald-600 flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>
                        {copiedSection === 'log-history' 
                          ? (lang === 'ar' ? 'تم حفظ المجموعة البرومبتية بالكامل في السجل العام!' : 'Successfully registered settings group to central local log!')
                          : (lang === 'ar' ? `تم نسخ ${copiedSection} إلى حافظة جهازك!` : `Copied active ${copiedSection} code to clipboard!`)}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>

            {/* Platform Advice and Conflict Checker Warnings */}
            {selectedStyle === 'anime' && selectedCategory === 'drone' && (
              <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 flex items-start gap-2.5 text-[11px] text-amber-800 dark:text-amber-400 font-bold leading-relaxed">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <p>
                  {lang === 'ar'
                    ? 'تنبيه الاتساق: تصوير الدرون الجوي لزبد البحر الفعلي قد يؤدي لنتائج عشوائية مع أسلوب الأنمي المرسوم يدوياً، يوصى بالتبديل لأسلوب واقعي فائق.'
                    : 'Aesthetic Warning: FPV drone wave foam dynamics may look strange when paired with Anime watercolor style. Best results are achieved with Realistic preset.'}
                </p>
              </div>
            )}

            {/* Segment Controls: Multi-action bottom buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
              
              <button
                type="button"
                onClick={() => {
                  let textToCopy = '';
                  if (activeOutputTab === 'positive') textToCopy = buildPositivePrompt();
                  else if (activeOutputTab === 'negative') textToCopy = buildNegativePrompt();
                  else if (activeOutputTab === 'platform') textToCopy = buildPlatformSettings();
                  else if (activeOutputTab === 'motion') textToCopy = buildMotionBrushRegions();
                  else if (activeOutputTab === 'path') textToCopy = buildCameraPath();
                  else textToCopy = compileAllMarkdown();
                  
                  handleCopySection(textToCopy, activeOutputTab);
                }}
                className="py-3.5 text-xs font-black rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                <span>{lang === 'ar' ? 'نسخ القسم المحدد الحالي' : 'Copy Selected Element'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleCopySection(compileAllMarkdown(), 'all-markdown');
                  handleRegisterToHistory();
                }}
                className="py-3.5 text-xs font-black rounded-xl bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-850 dark:text-stone-105 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{lang === 'ar' ? 'حفظ المجموعة بالسجل ⬇️' : 'Log All To History ⬇️'}</span>
              </button>

            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => onSendToTester(buildPositivePrompt())}
                className="w-full py-4 text-xs font-black rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/10 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Cpu className="w-4.5 h-4.5" />
                <span>{lang === 'ar' ? 'إرسال البرومبت الإيجابي للمختبر 🚀' : 'Send Positive Prompt to Test Sandbox 🚀'}</span>
              </button>
            </div>

          </div>

          {/* Quick tips list */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-880 p-5 space-y-3 shadow-sm">
            <span className="text-[11px] font-black text-indigo-600 uppercase tracking-widest block flex items-center gap-1">
              <Info className="w-3.5 h-3.5" />
              {lang === 'ar' ? 'معايير جودة التوليد السينمائي' : 'PRODUCER OPTIMAL CALIBRATION TIPS'}
            </span>
            <ul className="text-[11px] text-stone-605 dark:text-stone-400 space-y-1.5 leading-normal font-medium list-disc list-inside">
              <li>{lang === 'ar' ? 'المنصات تفضل التسميات الإنجليزية التامة لبناء المولدات البصرية بشكل أفضل.' : 'AI Engines understand camera vector commands best when adjectives follow strict spatial coordinates.'}</li>
              <li>{lang === 'ar' ? 'النسبة المثالية لـ Runway هي 16:9 للحفاظ على دقة تتبع العناصر.' : 'Runway Gen-3 works best natively on standard cinematic aspect ratios like 16:9.'}</li>
              <li>{lang === 'ar' ? 'ثبات معايير التموضع يمنع التحلل الضوئي وتلاشي الأقطار.' : 'Focal lock stabilization parameters drastically avoid physical drift errors over long video generation runs.'}</li>
            </ul>
          </div>

        </section>

      </div>

      {/* ---------------------------------------------------- */}
      {/* VEO 3.1 DYNAMIC GENERATION & ANIMATION DASHBOARD */}
      {/* ---------------------------------------------------- */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="mt-12 bg-gradient-to-br from-[#121110] to-[#1e1c1a] text-stone-100 rounded-3xl border border-[#c29b40]/15 shadow-2xl p-6 sm:p-10 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#c29b40]/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* Title & Description of Veo generator */}
        <div className="relative z-10 border-b border-[#c29b40]/15 pb-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#c29b40]/20 rounded-full text-[10px] font-black tracking-widest text-[#ecd197] border border-[#c29b40]/30 uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'توليد حركي فوري — Google Veo 3.1' : 'Live Image-to-Video Engine — Veo 3.1'}</span>
            </div>
            <h3 className="text-2xl font-black font-sans tracking-tight text-white">
              {lang === 'ar' ? 'معمل تحريك الصور وصناعة الإعلانات الفاخرة ⚡' : 'Veo 3.1 Image Animator & Video Ad Creator ⚡'}
            </h3>
            <p className="text-xs text-stone-400 max-w-4xl font-medium leading-relaxed font-sans">
              {lang === 'ar'
                ? 'ارفع صورة لمنتجك لتحويلها فورياً إلى إعلان احترافي، أو ارفع صورتك الشخصية لمنحها قبلة الحياة وتحريك خصلات الشعر والملامح بذكاء وبطريقة مادية فائقة الواقعية.'
                : 'Upload a product image to render high-conversion video ads instantly, or animate any profile/character avatar with hyper-realistic cinematic fluid dynamics and steady camera pacing.'}
            </p>
          </div>
          
          <div className="flex gap-2.5 shrink-0 self-start sm:self-center">
            <button
              onClick={importEngineeredPrompt}
              className="px-4 py-2 bg-[#c29b40]/15 hover:bg-[#c29b40]/25 text-[#ecd197] font-black text-xs rounded-xl border border-[#c29b40]/30 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Cpu className="w-4 h-4" />
              <span>{lang === 'ar' ? 'استيراد البرومبت المصمم 🪄' : 'Import Engineered Prompt 🪄'}</span>
            </button>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Column A: Inputs (Image drag zone, Presets, Prompts) */}
          <div className="space-y-6">
            
            {/* Image attachment slot */}
            <div className="space-y-2.5">
              <label className="text-xs font-black text-stone-300 uppercase tracking-wider block flex items-center gap-1.5">
                <Image className="w-4 h-4 text-[#c29b40]" />
                <span>{lang === 'ar' ? 'أضف صورتك للتحريك (منتج أو شخصية):' : 'Attach starting image (Product or Character):'}</span>
              </label>

              {/* Upload field */}
              {!uploadedImage ? (
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-stone-850 hover:border-[#c29b40]/40 rounded-2xl p-6 text-center cursor-pointer bg-stone-950/40 hover:bg-stone-950/70 transition duration-200 group relative"
                >
                  <input
                    type="file"
                    id="veo-image-input"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="space-y-3">
                    <div className="w-11 h-11 rounded-full bg-stone-905 flex items-center justify-center mx-auto text-stone-400 group-hover:text-[#ecd197] transition-colors">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-stone-300">
                        {lang === 'ar' ? 'اسحب وأفلت صورتك هنا، أو انقر للتصفح' : 'Drag and drop your image here, or click to browse'}
                      </p>
                      <p className="text-[10px] text-stone-500 font-medium">JPEG, PNG, WEBP (Max 8MB)</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-stone-950/70 rounded-2xl p-4 border border-stone-800 flex items-center gap-4 relative">
                  <img
                    src={uploadedImage}
                    alt="Uploaded source"
                    className="w-20 h-20 rounded-xl object-cover border border-stone-800 shadow-inner bg-stone-900 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-white truncate">
                      {lang === 'ar' ? 'تم تحميل الصورة بنجاح' : 'Source Image Loaded'}
                    </p>
                    <p className="text-[10px] text-stone-500 font-medium font-mono uppercase mt-0.5">
                      {uploadedImageMimeType} | OK
                    </p>
                    <p className="text-[10px] text-[#ecd197] mt-1.5 flex items-center gap-1 font-bold">
                      <Sparkles className="w-3 h-3 animate-ping" />
                      {lang === 'ar' ? 'جاهز للمزج وتحريك المكونات' : 'Aligned for animation synthesis'}
                    </p>
                  </div>
                  <button
                    onClick={clearUploadedImage}
                    className="p-2 bg-red-950/40 text-red-400 border border-red-900/30 hover:bg-red-905/40 rounded-xl transition cursor-pointer self-center"
                    title={lang === 'ar' ? 'حذف الصورة' : 'Remove Image'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              {uploadError && (
                <p className="text-xs font-bold text-red-450 mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{uploadError}</span>
                </p>
              )}
            </div>

            {/* Presets Grid */}
            <div className="space-y-2.5">
              <label className="text-xs font-black text-stone-300 uppercase tracking-wider block flex items-center gap-1.5">
                <Layout className="w-4 h-4 text-[#c29b40]" />
                <span>{lang === 'ar' ? 'قوالب حركة مسبقة الضبط (Product & Character Presets):' : 'Pre-calibrated Motion Presets:'}</span>
              </label>

              <div className="space-y-4">
                {/* Product Ad presets */}
                <div>
                  <span className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest block mb-1.5 font-sans">
                    {lang === 'ar' ? '✦ إعلانات المنتجات الديناميكية (Dynamic Ads):' : '✦ DYNAMIC PRODUCT SHOWCASES:'}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {VEO_PRESETS.filter(p => p.type === 'ad').map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => selectVeoPreset(preset)}
                        className={`px-3 py-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer truncate ${
                          activePresetId === preset.id
                            ? 'bg-[#c29b40]/15 border-[#c29b40] text-[#ecd197]'
                            : 'bg-stone-900 hover:bg-stone-850 border-stone-800 text-stone-300 text-center'
                        }`}
                      >
                        {lang === 'ar' ? preset.labelAr.split(' ')[0] : preset.labelEn}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Character assets */}
                <div>
                  <span className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest block mb-1.5 font-sans">
                    {lang === 'ar' ? '✦ تحريك الصور والبورتريه (Avatar Animation):' : '✦ AVATAR & CHARACTER MOVEMENT:'}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {VEO_PRESETS.filter(p => p.type === 'avatar').map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => selectVeoPreset(preset)}
                        className={`px-3 py-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer truncate ${
                          activePresetId === preset.id
                            ? 'bg-[#c29b40]/15 border-[#c29b40] text-[#ecd197]'
                            : 'bg-stone-900 hover:bg-stone-850 border-stone-800 text-stone-300 text-center'
                        }`}
                      >
                        {lang === 'ar' ? preset.labelAr.split(' ')[0] : preset.labelEn}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Custom Instruction Fields */}
            <div className="space-y-2">
              <label className="text-xs font-black text-stone-300 uppercase tracking-wider block flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-[#c29b40]" />
                <span>{lang === 'ar' ? 'تعديل أو صياغة توجيهات الحركة للفيديو (Prompt):' : 'Motion descriptions and detail prompts:'}</span>
              </label>
              <textarea
                value={veoPrompt}
                onChange={(e) => {
                  setVeoPrompt(e.target.value);
                  setActivePresetId(null);
                }}
                rows={3}
                placeholder={lang === 'ar' ? 'اكتب تفاصيل الإعلان أو نمط تحريك ملامح الصورة هنا بالإنجليزية للنتائج الفائقة...' : 'Describe how you want to animate the image or frame. E.g. rotating showcase with golden glitter...'}
                className="w-full text-xs font-bold rounded-2xl border border-stone-800 bg-stone-950 text-stone-200 p-4 focus:outline-none focus:ring-2 focus:ring-[#c29b40]/30 transition leading-relaxed resize-none"
              />
            </div>

            {/* Advanced configurations */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-wider block font-sans">
                  {lang === 'ar' ? 'دقة العرض المستهدفة:' : 'Target Resolution:'}
                </label>
                <select
                  value={veoResolution}
                  onChange={(e) => setVeoResolution(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-xs font-bold text-white focus:outline-none focus:border-[#c29b40]/40"
                >
                  <option value="720p">720p HD (Fast)</option>
                  <option value="1080p">1080p Full HD (Recommended)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-wider block font-sans">
                  {lang === 'ar' ? 'أبعاد امتداد المشهد:' : 'Viewport Aspect Ratio:'}
                </label>
                <select
                  value={veoAspectRatio}
                  onChange={(e) => setVeoAspectRatio(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-xs font-bold text-white focus:outline-none focus:border-[#c29b40]/40"
                >
                  <option value="16:9">16:9 Landscape (Ads/Cinema)</option>
                  <option value="9:16">9:16 Vertical (TikTok/Reels/Shorts)</option>
                </select>
              </div>
            </div>

            {/* Generate Trigger Button */}
            <button
              onClick={handleGenerateVeoVideo}
              disabled={isGenerating}
              className="w-full py-4 bg-gradient-to-r from-[#916a24] via-[#c29b40] to-[#ecd197] hover:from-[#c29b40] hover:to-[#ecd197] disabled:from-stone-850 disabled:to-stone-850 text-stone-950 hover:text-black font-black text-sm rounded-xl shadow-xl shadow-[#c29b45]/10 hover:shadow-[#c29b40]/25 transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer disabled:cursor-not-allowed disabled:text-stone-505"
            >
              <Video className="w-5 h-5 animate-pulse" />
              <span>{lang === 'ar' ? 'ابدأ معالجة وتوليد فيديو Veo 3.1 🎬' : 'Generate Veo 3.1 Cinematic Video 🎬'}</span>
            </button>

          </div>

          {/* Column B: Output Preview Screen & Status Poller */}
          <div className="bg-stone-950/60 rounded-3xl border border-stone-800 p-6 flex flex-col justify-center items-center min-h-[350px] relative">
            
            <AnimatePresence mode="wait">
              
              {/* 1. INITIAL EMPTY STATE */}
              {!isGenerating && !generatedVideoBlobUrl && !veoError && (
                <motion.div
                  key="initial"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center p-6 space-y-4"
                >
                  <div className="w-16 h-16 rounded-full bg-stone-900 flex items-center justify-center mx-auto text-stone-600 animate-pulse">
                    <VideoOff className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-stone-300 font-sans">
                      {lang === 'ar' ? 'بانتظار تصميم المشهد ومعاينة الحركة' : 'Awaiting Video Synthesis'}
                    </h4>
                    <p className="text-[11px] text-stone-500 max-w-sm mx-auto font-medium leading-relaxed font-sans">
                      {lang === 'ar'
                        ? 'ارفع صورة للمنتج أو دمج القوالب الجاهزة واضغط على زر التوليد لبدء صياغة إعلانات الفيديو أو البورتريه فائق الجودة.'
                        : 'Upload your reference JPEG/PNG image, apply motion templates and click Generate to run Google Veo video creation pipeline.'}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* 2. GENERATION LOADING SCREENS */}
              {isGenerating && (
                <motion.div
                  key="loader"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full text-center p-4 space-y-6 flex flex-col items-center"
                >
                  {/* Glowing custom solar/veo pulsar loading visual */}
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <div className="absolute inset-x-0 inset-y-0 rounded-full border-4 border-[#c29b40]/10" />
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                      className="absolute inset-x-0 inset-y-0 rounded-full border-t-4 border-l-4 border-r-4 border-transparent border-t-[#c29b40] border-l-[#ecd197]"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                      className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#916a24]/30 to-[#c29b40]/30 backdrop-blur-md border border-[#c29b40]/40 flex items-center justify-center text-white text-xs font-black"
                    >
                      VEO 3
                    </motion.div>
                  </div>

                  {/* Progressive mock percentage tracking to enhance reassurance */}
                  <div className="w-full max-w-xs space-y-2">
                    <div className="flex justify-between items-center text-[10px] text-stone-500 font-extrabold font-mono uppercase tracking-widest">
                      <span>{lang === 'ar' ? 'معالجة الفيديو' : 'VIDEO COMPILING'}</span>
                      <span className="text-[#ecd197] animate-pulse">
                        {Math.min(10 + veoMessageIndex * 13, 98)}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-stone-900 rounded-full overflow-hidden border border-stone-800">
                      <motion.div
                        initial={{ width: '0%' }}
                        animate={{ width: `${Math.min(15 + veoMessageIndex * 14, 98)}%` }}
                        transition={{ duration: 1 }}
                        className="h-full bg-gradient-to-r from-[#916a24] via-[#c29b40] to-[#ecd197] rounded-full"
                      />
                    </div>
                  </div>

                  {/* Reassuring text messaging alerts */}
                  <div className="space-y-2 max-w-md">
                    <p className="text-xs font-black text-[#ecd197] animate-pulse leading-relaxed font-sans">
                      {lang === 'ar' ? REASSURING_MESSAGES_AR[veoMessageIndex] : REASSURING_MESSAGES_EN[veoMessageIndex]}
                    </p>
                    <p className="text-[10px] text-stone-500 font-medium leading-relaxed font-sans">
                      {lang === 'ar'
                        ? 'تستغرق عملية معالجة وصقل الفيديو من دقيقة واحدة إلى دقيقتين عادةً. لا تغلق هذه الصفحة، فنحن نقوم بمتابعة طلبك باستمرار.'
                        : 'Video synthesis typically takes 1 to 2 minutes. Do not close this panel, our backend is actively polling on your behalf.'}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* 3. ERROR RECOVERY VIEW */}
              {veoError && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full p-4 space-y-4 text-center"
                >
                  <div className="w-14 h-14 rounded-full bg-red-950/40 text-red-400 flex items-center justify-center mx-auto border border-red-900/30">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-black text-red-500 font-sans">
                      {lang === 'ar' ? 'انقطع الاتصال أو فشل التوليد' : 'Generation Pipeline Interrupted'}
                    </h4>
                    <p className="text-[11px] text-stone-400 max-w-md mx-auto leading-relaxed font-semibold">
                      {veoError}
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={handleGenerateVeoVideo}
                      className="px-5 py-2 bg-stone-900 hover:bg-stone-850 border border-stone-800 text-xs font-bold rounded-lg text-white transition cursor-pointer"
                    >
                      {lang === 'ar' ? 'إعادة محاولة الاتصال' : 'Retry Connection'}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* 4. SUCCESS COMPLETED VIDEO PREVIEW */}
              {generatedVideoBlobUrl && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full space-y-4"
                >
                  {/* Video player */}
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-stone-800 bg-black aspect-video group">
                    <video
                      src={generatedVideoBlobUrl}
                      controls
                      autoPlay
                      loop
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-[#c29b40] text-stone-950 font-black text-[9px] px-2.5 py-1 rounded-md shadow-md uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 animate-pulse" />
                      VEO 3.1 COMPLIANT
                    </div>
                  </div>

                  {/* Actions bar */}
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <p className="text-[11px] text-[#ecd197] font-black flex items-center gap-1 px-3 py-1 bg-[#c29b40]/10 rounded-lg border border-[#c29b40]/20 flex-1 font-sans">
                      <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{lang === 'ar' ? 'تم تحويل وتأمين الفيديو بنجاح!' : 'Video synthesis completed flawlessly!'}</span>
                    </p>
                    
                    <a
                      href={generatedVideoBlobUrl}
                      download="veo-3.1-arabprompt.mp4"
                      className="px-4 py-2 bg-stone-900 border border-stone-800 hover:bg-stone-800 text-stone-105 font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Download className="w-4 h-4" />
                      <span>{lang === 'ar' ? 'تحميل العرض (MP4) ⬇️' : 'Download Video (MP4) ⬇️'}</span>
                    </a>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>

          </div>

        </div>
      </motion.div>

    </div>
  );
}
