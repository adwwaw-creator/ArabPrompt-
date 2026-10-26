/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppLanguage, SUPPORTED_LANGUAGES } from '../types';

export interface TranslationDictionary {
  // Navigation & Header
  appTitle: string;
  appBadge: string;
  appTagline: string;
  navBuilder: string;
  navCinema: string;
  navVisualLibrary: string;
  navIdeas: string;
  navReverse: string;
  navSequence: string;
  navDrone: string;
  navDiffusionDB: string;
  navHistory: string;
  navPrivacy: string;
  navPricing: string;
  navTemplates: string;
  geminiConnected: string;
  localPreview: string;
  toggleDarkMode: string;
  selectLanguage: string;
  signIn: string;
  cloudBackup: string;
  accountProfile: string;

  // Hero Section
  heroBadge: string;
  heroHeadingPart1: string;
  heroHeadingHighlight: string;
  heroHeadingPart2: string;
  heroDescription: string;
  heroFeature1: string;
  heroFeature2: string;
  heroFeature3: string;
  heroFeature4: string;
  heroCtaStart: string;
  heroCtaExplore: string;

  // Prompt Builder
  step1Title: string;
  conceptLabel: string;
  conceptPlaceholder: string;
  quickPresetsTitle: string;
  modelLabel: string;
  toneLabel: string;
  categoryLabel: string;
  advancedPhotoSpecs: string;
  applyPhotoSpecs: string;
  targetLangLabel: string;
  targetLangSub: string;
  generateBtn: string;
  generatingBtn: string;
  step2Title: string;
  outputReady: string;
  emptyOutputTitle: string;
  emptyOutputSub: string;
  polishBtn: string;
  translateBtn: string;
  copyBtn: string;
  copiedBtn: string;
  saveBtn: string;
  testRunBtn: string;

  // Prompt Quality Score
  qualityScoreTitle: string;
  qualityExcellent: string;
  qualityGood: string;
  qualityAverage: string;
  qualityWeak: string;

  // Reverse Prompt
  reverseTabSingle: string;
  reverseTabMimic: string;
  reverseTabVideo: string;
  uploadAreaText: string;
  uploadAreaSub: string;
  analyzeBtn: string;
  analyzingBtn: string;
  extractedPromptTitle: string;

  // Video Drone Designer
  videoDesignerTitle: string;
  videoDesignerSub: string;
  cameraMovement: string;
  lightingAtmosphere: string;
  motionBrushTitle: string;
  copyFullSuite: string;

  // Common UI
  save: string;
  cancel: string;
  close: string;
  loading: string;
  error: string;
  success: string;
  copiedSuccess: string;
}

export const TRANSLATIONS: Record<AppLanguage, TranslationDictionary> = {
  ar: {
    appTitle: 'ArabPrompt',
    appBadge: 'عربي',
    appTagline: 'هندسة وصياغة التعليمات البرمجية والأوامر الذكية',
    navBuilder: 'مُهندس الأوامر',
    navCinema: 'أفلام وسيناريو AI',
    navVisualLibrary: 'مكتبة الصور الفنية (36)',
    navIdeas: 'مُولد الأفكار',
    navReverse: 'الهندسة العكسية',
    navSequence: 'سلسلة صور/فيديو',
    navDrone: 'تصميم أوامر الفيديو',
    navDiffusionDB: 'قاعدة بيانات الانتشار',
    navHistory: 'سجل الأوامر',
    navPrivacy: 'التكاليف والخصوصية',
    navPricing: 'الأسعار والباقات',
    navTemplates: 'قوالب الأوامر',
    geminiConnected: 'نموذج Gemini جاهز',
    localPreview: 'معاينة محلية',
    toggleDarkMode: 'المظهر الليلي',
    selectLanguage: 'اختر لغة الواجهة',
    signIn: 'تسجيل الدخول',
    cloudBackup: 'النسخ الاحتياطي السحابي',
    accountProfile: 'إدارة الحساب',

    heroBadge: '✨ المنصة الأولى عربياً لهندسة وتوليف الأوامر',
    heroHeadingPart1: 'هندسة أوامر الذكاء الاصطناعي',
    heroHeadingHighlight: 'بدقة واحترافية فائقة',
    heroHeadingPart2: 'لمختلف النماذج العالمية',
    heroDescription: 'حوّل أفكارك البسيطة ومسوداتك إلى برومبتات بروتوكولية دقيقة ومحكمة متوافقة مع أحدث نماذج الذكاء الاصطناعي التوليدي مثل Gemini و ChatGPT و Claude و Midjourney.',
    heroFeature1: 'توليد ثنائي الخيار (مباشر وهندسي مطور)',
    heroFeature2: 'هندسة عكسية فورية للصور ومقاطع الفيديو',
    heroFeature3: 'تصميم مسارات كاميرا الدرون والحركة الفيزيائية',
    heroFeature4: 'لوحة فحص جودة وتماسك البرومبت لحظياً',
    heroCtaStart: 'ابدأ هندسة أمرك الآن',
    heroCtaExplore: 'استكشف بنك الأفكار الذكي',

    step1Title: '1. إعداد وصياغة سياق الفكرة المبتكرة',
    conceptLabel: 'فكرة الأمر أو المسودة الأولية بكلماتك البسيطة',
    conceptPlaceholder: 'اكتب الفكرة الأساسية هنا... ستقوم المنصة بتحويل شتات الكلمات لأمر معقد يشمل دور الذكاء والتعليمات والقيود.',
    quickPresetsTitle: '💡 أفكار مقترحة للبدء السريع:',
    modelLabel: 'نموذج الذكاء المستهدف',
    toneLabel: 'نبرة الصوت وأسلوب التخاطب',
    categoryLabel: 'تصنيف ومجال الأمر',
    advancedPhotoSpecs: '📸 خيارات الإخراج السينمائي والتصوير الفوتوغرافي الاحترافي',
    applyPhotoSpecs: '🎯 دمج معايير التصوير الفوتوغرافي وصياغة الفكرة',
    targetLangLabel: 'لغة الأمر الأساسي المراد إنتاجه',
    targetLangSub: 'بأي لغة تود كتابة البرومبت النهائي؟',
    generateBtn: 'توليد وهندسة البرومبت (Ctrl+Enter)',
    generatingBtn: 'يرجى الانتظار، جاري هندسة وتثبيت المدخلات...',
    step2Title: '2. مخرجات جودة هندسة الأوامر الحالية',
    outputReady: 'برومبت جاهز',
    emptyOutputTitle: 'بانتظار الصياغة والتوليد المباشر',
    emptyOutputSub: 'يرجى ملء تفاصيل الفكرة في القائمة الجانبية ثم النقر على "توليد" ليظهر لك الكود المحسن للنسخ المباشر.',
    polishBtn: 'تلميع وضبط إضافي',
    translateBtn: 'ترجمة وتوسعة بالإنجليزية',
    copyBtn: 'نسخ البرومبت',
    copiedBtn: 'تم النسخ!',
    saveBtn: 'حفظ في السجل',
    testRunBtn: 'تشغيل واختبار الأمر',

    qualityScoreTitle: 'مؤشر قوة وجودة هندسة البرومبت',
    qualityExcellent: 'ممتاز وعالي الدقة',
    qualityGood: 'جيد ومكتمل المعايير',
    qualityAverage: 'متوسط يحتاج تفاصيل إضافية',
    qualityWeak: 'بسيط يفضل تعزيزه بمزيد من القيود',

    reverseTabSingle: 'تحليل صورة واحدة',
    reverseTabMimic: 'محاكاة ودمج أسلوب صورتين',
    reverseTabVideo: 'الهندسة العكسية للفيديو',
    uploadAreaText: 'انقر لرفع ملف وسائط أو اسحبه هنا',
    uploadAreaSub: 'يدعم صيغ JPG, PNG, WebP ومقاطع MP4 القصيرة',
    analyzeBtn: 'تحليل واستخراج البرومبت الهندسي',
    analyzingBtn: 'جاري فحص العناصر البصرية والتكوين...',
    extractedPromptTitle: 'الأمر البرمجي المستخرج بدقة',

    videoDesignerTitle: 'تصميم أوامر الفيديو وحركة الكاميرات',
    videoDesignerSub: 'تحكم في مسارات الدرون، زوايا اللقطة، سرعة الغالق، والفيزياء الحركية لموديلات الفيديو',
    cameraMovement: 'حركة ومسار الكاميرا',
    lightingAtmosphere: 'الإضاءة والجو المحيط',
    motionBrushTitle: 'مناطق فرشاة الحركة الذكية',
    copyFullSuite: 'نسخ حزمة أوامر الفيديو بالكامل',

    save: 'حفظ',
    cancel: 'إلغاء',
    close: 'إغلاق',
    loading: 'جاري التحميل...',
    error: 'حدث خطأ',
    success: 'تم بنجاح',
    copiedSuccess: '✓ تم النسخ بنجاح للحافظة مع رابط المنصة!'
  },

  en: {
    appTitle: 'ArabPrompt',
    appBadge: 'PRO',
    appTagline: 'Advanced AI Prompt Engineering & Synthesis Core',
    navBuilder: 'Prompt Builder',
    navCinema: 'Cinema Studio',
    navVisualLibrary: 'Visual Art Library',
    navIdeas: 'Idea Generator',
    navReverse: 'Reverse Prompt',
    navSequence: 'Sequence/Animate',
    navDrone: 'Video Designer',
    navDiffusionDB: 'DiffusionDB',
    navHistory: 'History',
    navPrivacy: 'Costs & Privacy',
    navPricing: 'Pricing & Plans',
    navTemplates: 'Prompt Templates',
    geminiConnected: 'Gemini Engine Connected',
    localPreview: 'Local Preview',
    toggleDarkMode: 'Dark Mode',
    selectLanguage: 'Select Language',
    signIn: 'Sign In',
    cloudBackup: 'Cloud Backup',
    accountProfile: 'Account Profile',

    heroBadge: '✨ Next-Gen AI Prompt Engineering Platform',
    heroHeadingPart1: 'Master AI Prompt Engineering with',
    heroHeadingHighlight: 'Unrivaled Precision',
    heroHeadingPart2: 'for Global AI Models',
    heroDescription: 'Transform raw concepts and simple drafts into structured, persona-driven, production-ready prompts calibrated for Gemini, ChatGPT, Claude, Midjourney, and Sora.',
    heroFeature1: 'Dual-Output Architecture (Direct & Deeply Engineered)',
    heroFeature2: 'Instant Multimodal Reverse Engineering (Images & Videos)',
    heroFeature3: 'Cinematic Drone & Camera Path Choreography',
    heroFeature4: 'Live Prompt Coherence & Quality Diagnostic Gauge',
    heroCtaStart: 'Start Engineering Now',
    heroCtaExplore: 'Explore Idea Sparks',

    step1Title: '1. Define the Core Objectives',
    conceptLabel: 'Raw Prompt Concept or Idea in Your Own Words',
    conceptPlaceholder: 'Describe what you want to achieve... The engine synthesizes roles, context, guidelines, and constraints.',
    quickPresetsTitle: '💡 Fast Suggestions for Playground Testing:',
    modelLabel: 'Target AI Model',
    toneLabel: 'Voice & Interaction Tone',
    categoryLabel: 'Category & Domain',
    advancedPhotoSpecs: '📸 Professional Cinematic & Photography Specs',
    applyPhotoSpecs: '🎯 Apply Prompt Architect Specs to Concept Box',
    targetLangLabel: 'Target Prompt Language',
    targetLangSub: 'Which language should the final prompt be output in?',
    generateBtn: 'Synthesize and Engineer Prompt (Ctrl+Enter)',
    generatingBtn: 'Structuring rules, variable boundaries, and personas...',
    step2Title: '2. Engineered Output Workspace',
    outputReady: 'Output compiled',
    emptyOutputTitle: 'Your engineered prompt appears here',
    emptyOutputSub: 'Specify an idea or prompt draft on the left, then click generating to get optimized code ready for copying.',
    polishBtn: 'Auto Polish',
    translateBtn: 'Expand to English Version',
    copyBtn: 'Copy Prompt',
    copiedBtn: 'Copied!',
    saveBtn: 'Save to History',
    testRunBtn: 'Test Prompt',

    qualityScoreTitle: 'Prompt Quality & Coherence Gauge',
    qualityExcellent: 'Excellent & High-Fidelity',
    qualityGood: 'Good & Well-Structured',
    qualityAverage: 'Moderate, needs more constraints',
    qualityWeak: 'Basic, add more details and boundaries',

    reverseTabSingle: 'Single Image Analysis',
    reverseTabMimic: 'Dual Image Style Transfer',
    reverseTabVideo: 'Video Reverse Engineering',
    uploadAreaText: 'Click to upload or drag & drop media',
    uploadAreaSub: 'Supports JPG, PNG, WebP, and short MP4 video clips',
    analyzeBtn: 'Reverse-Engineer Prompt',
    analyzingBtn: 'Analyzing visual tokens, composition, and optics...',
    extractedPromptTitle: 'Extracted Engineered Prompt',

    videoDesignerTitle: 'Video & Drone Prompt Designer',
    videoDesignerSub: 'Choreograph camera paths, shutter speeds, volumetric lighting, and physical motion dynamics for video models.',
    cameraMovement: 'Camera Path & Motion',
    lightingAtmosphere: 'Lighting & Atmosphere',
    motionBrushTitle: 'Smart Motion Brush Regions',
    copyFullSuite: 'Copy Full Video Prompt Suite',

    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    loading: 'Loading...',
    error: 'An error occurred',
    success: 'Success',
    copiedSuccess: '✓ Prompt copied to clipboard with ArabPrompt link!'
  },

  fr: {
    appTitle: 'ArabPrompt',
    appBadge: 'FR',
    appTagline: 'Ingénierie avancée des invites et synthèse IA',
    navBuilder: 'Générateur de Prompts',
    navCinema: 'Studio Cinéma',
    navVisualLibrary: 'Bibliothèque Visuelle',
    navIdeas: 'Générateur d’Idées',
    navReverse: 'Ingénierie Inverse',
    navSequence: 'Séquence/Animation',
    navDrone: 'Concepteur Vidéo',
    navDiffusionDB: 'DiffusionDB',
    navHistory: 'Historique',
    navPrivacy: 'Confidentialité & Sécurité',
    navPricing: 'Tarifs & Abonnements',
    navTemplates: 'Modèles de Prompts',
    geminiConnected: 'Moteur Gemini Connecté',
    localPreview: 'Aperçu Local',
    toggleDarkMode: 'Mode Sombre',
    selectLanguage: 'Choisir la langue',
    signIn: 'Connexion',
    cloudBackup: 'Sauvegarde Cloud',
    accountProfile: 'Profil & Compte',

    heroBadge: '✨ Plateforme d’ingénierie d’invites IA nouvelle génération',
    heroHeadingPart1: 'Maîtrisez l’ingénierie des invites IA avec une',
    heroHeadingHighlight: 'Précision Remarquable',
    heroHeadingPart2: 'pour les modèles mondiaux',
    heroDescription: 'Transformez vos idées brutes en invites structurées, riches en rôles et prêtes pour la production sur Gemini, ChatGPT, Claude, Midjourney et Sora.',
    heroFeature1: 'Architecture à double sortie (Directe et Approfondie)',
    heroFeature2: 'Ingénierie inverse multimodale (Images et Vidéos)',
    heroFeature3: 'Chorégraphie cinématographique de caméra drone',
    heroFeature4: 'Jauge de qualité et de cohérence en temps réel',
    heroCtaStart: 'Commencer l’ingénierie',
    heroCtaExplore: 'Découvrir la banque d’idées',

    step1Title: '1. Définir les objectifs clés',
    conceptLabel: 'Concept brut ou brouillon dans vos propres mots',
    conceptPlaceholder: 'Décrivez ce que vous souhaitez accomplir... Le moteur synthétisera les rôles, directives et contraintes.',
    quickPresetsTitle: '💡 Suggestions rapides pour tester :',
    modelLabel: 'Modèle IA cible',
    toneLabel: 'Ton et style de communication',
    categoryLabel: 'Catégorie et domaine',
    advancedPhotoSpecs: '📸 Spécifications cinématographiques et photographiques',
    applyPhotoSpecs: '🎯 Appliquer les spécifications au concept',
    targetLangLabel: 'Langue de l’invite cible',
    targetLangSub: 'En quelle langue le prompt final doit-il être rédigé ?',
    generateBtn: 'Synthétiser et générer l’invite (Ctrl+Entrée)',
    generatingBtn: 'Structuration des règles, rôles et variables...',
    step2Title: '2. Espace de travail de l’invite générée',
    outputReady: 'Invite compilée',
    emptyOutputTitle: 'Votre invite apparaîtra ici',
    emptyOutputSub: 'Spécifiez une idée à gauche, puis cliquez sur générer pour obtenir un code optimisé.',
    polishBtn: 'Polir et affiner',
    translateBtn: 'Version anglaise optimisée',
    copyBtn: 'Copier l’invite',
    copiedBtn: 'Copié !',
    saveBtn: 'Enregistrer dans l’historique',
    testRunBtn: 'Tester l’invite',

    qualityScoreTitle: 'Jauge de qualité et de cohérence',
    qualityExcellent: 'Excellent et haute fidélité',
    qualityGood: 'Bon et bien structuré',
    qualityAverage: 'Moyen, manque de contraintes',
    qualityWeak: 'Basique, ajoutez plus de détails',

    reverseTabSingle: 'Analyse d’image unique',
    reverseTabMimic: 'Transfert de style à deux images',
    reverseTabVideo: 'Ingénierie inverse vidéo',
    uploadAreaText: 'Cliquez ou déposez un média ici',
    uploadAreaSub: 'Prend en charge JPG, PNG, WebP et courts clips MP4',
    analyzeBtn: 'Analyser et inverser l’invite',
    analyzingBtn: 'Analyse des éléments visuels et de l’optique...',
    extractedPromptTitle: 'Invite technique extraite',

    videoDesignerTitle: 'Concepteur d’invites vidéo & drone',
    videoDesignerSub: 'Chorégraphiez les mouvements de caméra, vitesse d’obturation et lumière volumétrique.',
    cameraMovement: 'Mouvement de caméra',
    lightingAtmosphere: 'Éclairage et ambiance',
    motionBrushTitle: 'Pinceau de mouvement intelligent',
    copyFullSuite: 'Copier la suite vidéo complète',

    save: 'Enregistrer',
    cancel: 'Annuler',
    close: 'Fermer',
    loading: 'Chargement...',
    error: 'Une erreur s’est produite',
    success: 'Succès',
    copiedSuccess: '✓ Invite copiée avec le lien ArabPrompt !'
  },

  es: {
    appTitle: 'ArabPrompt',
    appBadge: 'ES',
    appTagline: 'Ingeniería avanzada de prompts y síntesis de IA',
    navBuilder: 'Constructor de Prompts',
    navCinema: 'Estudio de Cine',
    navVisualLibrary: 'Biblioteca Visual',
    navIdeas: 'Generador de Ideas',
    navReverse: 'Ingeniería Inversa',
    navSequence: 'Secuencia/Animar',
    navDrone: 'Diseñador de Video',
    navDiffusionDB: 'DiffusionDB',
    navHistory: 'Historial',
    navPrivacy: 'Privacidad y Seguridad',
    navPricing: 'Precios y Planes',
    navTemplates: 'Plantillas de Prompts',
    geminiConnected: 'Motor Gemini Conectado',
    localPreview: 'Vista previa local',
    toggleDarkMode: 'Modo Oscuro',
    selectLanguage: 'Seleccionar idioma',
    signIn: 'Iniciar sesión',
    cloudBackup: 'Copia en la nube',
    accountProfile: 'Perfil de cuenta',

    heroBadge: '✨ Plataforma de ingeniería de prompts de nueva generación',
    heroHeadingPart1: 'Domine la ingeniería de prompts de IA con',
    heroHeadingHighlight: 'Precisión Inigualable',
    heroHeadingPart2: 'para modelos globales',
    heroDescription: 'Transforme conceptos e ideas simples en prompts estructurados y listos para producción en Gemini, ChatGPT, Claude, Midjourney y Sora.',
    heroFeature1: 'Arquitectura de doble salida (Directa y Desarrollada)',
    heroFeature2: 'Ingeniería inversa multimodal (Imágenes y Videos)',
    heroFeature3: 'Trayectorias cinematográficas de cámara de dron',
    heroFeature4: 'Diagnóstico en tiempo real de coherencia del prompt',
    heroCtaStart: 'Comenzar ingeniería',
    heroCtaExplore: 'Explorar banco de ideas',

    step1Title: '1. Definir los objetivos principales',
    conceptLabel: 'Concepto inicial o borrador en sus propias palabras',
    conceptPlaceholder: 'Describa lo que desea lograr... El motor sintetizará roles, contexto, directrices y límites.',
    quickPresetsTitle: '💡 Sugerencias rápidas para probar:',
    modelLabel: 'Modelo de IA objetivo',
    toneLabel: 'Tono de voz y estilo',
    categoryLabel: 'Categoría y dominio',
    advancedPhotoSpecs: '📸 Opciones cinematográficas y fotográficas',
    applyPhotoSpecs: '🎯 Aplicar especificaciones al concepto',
    targetLangLabel: 'Idioma del prompt resultante',
    targetLangSub: '¿En qué idioma debe redactarse el prompt final?',
    generateBtn: 'Sintetizar y generar prompt (Ctrl+Enter)',
    generatingBtn: 'Estructurando reglas, roles y variables...',
    step2Title: '2. Espacio de trabajo de salida generada',
    outputReady: 'Prompt compilado',
    emptyOutputTitle: 'Su prompt generado aparecerá aquí',
    emptyOutputSub: 'Especifique una idea a la izquierda y haga clic en generar para obtener código optimizado.',
    polishBtn: 'Pulir y afinar',
    translateBtn: 'Expandir a versión en inglés',
    copyBtn: 'Copiar prompt',
    copiedBtn: '¡Copiado!',
    saveBtn: 'Guardar en historial',
    testRunBtn: 'Probar prompt',

    qualityScoreTitle: 'Indicador de calidad y coherencia del prompt',
    qualityExcellent: 'Excelente y de alta fidelidad',
    qualityGood: 'Bueno y bien estructurado',
    qualityAverage: 'Moderado, necesita más restricciones',
    qualityWeak: 'Básico, agregue más detalles y límites',

    reverseTabSingle: 'Análisis de imagen individual',
    reverseTabMimic: 'Transferencia de estilo entre dos imágenes',
    reverseTabVideo: 'Ingeniería inversa de video',
    uploadAreaText: 'Haga clic para subir o arrastre archivos aquí',
    uploadAreaSub: 'Compatible con JPG, PNG, WebP y clips cortos MP4',
    analyzeBtn: 'Realizar ingeniería inversa',
    analyzingBtn: 'Analizando composición, iluminación y óptica...',
    extractedPromptTitle: 'Prompt técnico extraído',

    videoDesignerTitle: 'Diseñador de prompts para video y dron',
    videoDesignerSub: 'Controle trayectorias de cámara, iluminación volumétrica y dinámicas de movimiento físico.',
    cameraMovement: 'Movimiento de cámara',
    lightingAtmosphere: 'Iluminación y atmósfera',
    motionBrushTitle: 'Regiones de pincel de movimiento',
    copyFullSuite: 'Copiar paquete completo de video',

    save: 'Guardar',
    cancel: 'Cancelar',
    close: 'Cerrar',
    loading: 'Cargando...',
    error: 'Ocurrió un error',
    success: 'Éxito',
    copiedSuccess: '✓ ¡Prompt copiado con el enlace de ArabPrompt!'
  },

  de: {
    appTitle: 'ArabPrompt',
    appBadge: 'DE',
    appTagline: 'KI-Prompt-Engineering und Synthese-Plattform',
    navBuilder: 'Prompt-Builder',
    navCinema: 'Kino Studio',
    navVisualLibrary: 'Visuelle Bibliothek',
    navIdeas: 'Ideen-Generator',
    navReverse: 'Reverse-Engineering',
    navSequence: 'Sequenz/Animation',
    navDrone: 'Video-Designer',
    navDiffusionDB: 'DiffusionDB',
    navHistory: 'Verlauf',
    navPrivacy: 'Datenschutz & Sicherheit',
    navPricing: 'Preise & Tarife',
    navTemplates: 'Prompt-Vorlagen',
    geminiConnected: 'Gemini-Engine Verbunden',
    localPreview: 'Lokale Vorschau',
    toggleDarkMode: 'Dunkelmodus',
    selectLanguage: 'Sprache wählen',
    signIn: 'Anmelden',
    cloudBackup: 'Cloud-Sicherung',
    accountProfile: 'Kontoprofil',

    heroBadge: '✨ Next-Gen KI-Prompt-Engineering-Plattform',
    heroHeadingPart1: 'Meistern Sie KI-Prompt-Engineering mit',
    heroHeadingHighlight: 'Höchster Präzision',
    heroHeadingPart2: 'für globale KI-Modelle',
    heroDescription: 'Verwandeln Sie rohe Ideen und Entwürfe in hochpräzise, rollenbasierte Prompts für Gemini, ChatGPT, Claude, Midjourney und Sora.',
    heroFeature1: 'Duale Ausgabe-Architektur (Direkt & Tief entwickelt)',
    heroFeature2: 'Multimodales Reverse-Engineering (Bilder & Videos)',
    heroFeature3: 'Kinematografische Drohnen- & Kamerabewegungen',
    heroFeature4: 'Echtzeit-Diagnoseanzeige für Prompt-Qualität',
    heroCtaStart: 'Jetzt entwickeln',
    heroCtaExplore: 'Ideen-Sparks erkunden',

    step1Title: '1. Kernziele definieren',
    conceptLabel: 'Rohe Prompt-Idee in eigenen Worten',
    conceptPlaceholder: 'Beschreiben Sie Ihr Ziel... Die Engine strukturiert Rollen, Richtlinien und Bedingungen.',
    quickPresetsTitle: '💡 Schnelle Vorschläge zum Testen:',
    modelLabel: 'Ziel-KI-Modell',
    toneLabel: 'Tonfall und Stil',
    categoryLabel: 'Kategorie und Bereich',
    advancedPhotoSpecs: '📸 Kamera- und Fotospezifikationen',
    applyPhotoSpecs: '🎯 Spezifikationen anwenden',
    targetLangLabel: 'Zielsprache des Prompts',
    targetLangSub: 'In welcher Sprache soll der finale Prompt ausgegeben werden?',
    generateBtn: 'Prompt synthetisieren (Strg+Enter)',
    generatingBtn: 'Strukturiere Regeln, Rollen und Variablen...',
    step2Title: '2. Entwickelter Ausgabe-Arbeitsbereich',
    outputReady: 'Prompt kompiliert',
    emptyOutputTitle: 'Ihr Prompt erscheint hier',
    emptyOutputSub: 'Geben Sie links eine Idee ein und klicken Sie auf Generieren.',
    polishBtn: 'Automatisch verfeinern',
    translateBtn: 'Auf Englisch erweitern',
    copyBtn: 'Prompt kopieren',
    copiedBtn: 'Kopiert!',
    saveBtn: 'Im Verlauf speichern',
    testRunBtn: 'Prompt testen',

    qualityScoreTitle: 'Qualitäts- & Kohärenzanzeige',
    qualityExcellent: 'Hervorragend und hochpräzise',
    qualityGood: 'Gut und strukturiert',
    qualityAverage: 'Mittelmäßig, benötigt mehr Details',
    qualityWeak: 'Grundlegend, bitte Rahmenbedingungen ergänzen',

    reverseTabSingle: 'Einzelbildanalyse',
    reverseTabMimic: 'Stilübertragung zweier Bilder',
    reverseTabVideo: 'Video-Reverse-Engineering',
    uploadAreaText: 'Klicken zum Hochladen oder Datei hierher ziehen',
    uploadAreaSub: 'Unterstützt JPG, PNG, WebP und kurze MP4-Videos',
    analyzeBtn: 'Reverse-Engineering starten',
    analyzingBtn: 'Analysiere visuelle Elemente und Optik...',
    extractedPromptTitle: 'Extrahierter technischer Prompt',

    videoDesignerTitle: 'Video- & Drohnen-Prompt-Designer',
    videoDesignerSub: 'Choreografieren Sie Kamerabewegungen, Verschlusszeiten und volumetrisches Licht.',
    cameraMovement: 'Kamerabewegung',
    lightingAtmosphere: 'Beleuchtung & Atmosphäre',
    motionBrushTitle: 'Intelligente Bewegungspinsel',
    copyFullSuite: 'Komplette Video-Suite kopieren',

    save: 'Speichern',
    cancel: 'Abbrechen',
    close: 'Schließen',
    loading: 'Laden...',
    error: 'Ein Fehler ist aufgetreten',
    success: 'Erfolgreich',
    copiedSuccess: '✓ Prompt mit ArabPrompt-Link kopiert!'
  },

  tr: {
    appTitle: 'ArabPrompt',
    appBadge: 'TR',
    appTagline: 'Gelişmiş Yapay Zeka Prompt Mühendisliği ve Sentezi',
    navBuilder: 'Prompt Mühendisi',
    navCinema: 'Sinema Stüdyosu',
    navVisualLibrary: 'Görsel Kütüphane',
    navIdeas: 'Fikir Üretici',
    navReverse: 'Tersine Mühendislik',
    navSequence: 'Dizi/Canlandırma',
    navDrone: 'Video Tasarımcısı',
    navDiffusionDB: 'DiffusionDB',
    navHistory: 'Geçmiş',
    navPrivacy: 'Gizlilik ve Güvenlik',
    navPricing: 'Fiyatlandırma & Paketler',
    navTemplates: 'Prompt Şablonları',
    geminiConnected: 'Gemini Motoru Bağlandı',
    localPreview: 'Yerel Önizleme',
    toggleDarkMode: 'Karanlık Mod',
    selectLanguage: 'Dil Seçin',
    signIn: 'Giriş Yap',
    cloudBackup: 'Bulut Yedekleme',
    accountProfile: 'Hesap Profili',

    heroBadge: '✨ Yeni Nesil Yapay Zeka Prompt Mühendisliği Platformu',
    heroHeadingPart1: 'Yapay Zeka Prompt Mühendisliğini',
    heroHeadingHighlight: 'Üstün Hassasiyetle',
    heroHeadingPart2: 'Küresel Modeller İçin Yönetin',
    heroDescription: 'Ham fikirlerinizi ve taslaklarınızı Gemini, ChatGPT, Claude, Midjourney ve Sora için yapılandırılmış, profesyonel promptlara dönüştürün.',
    heroFeature1: 'Çift Çıktı Mimarisi (Doğrudan ve Derinlemesine Geliştirilmiş)',
    heroFeature2: 'Görsel ve Video İçin Anında Tersine Mühendislik',
    heroFeature3: 'Sinematik Drone ve Kamera Yolu Koreografisi',
    heroFeature4: 'Canlı Prompt Tutarlılık ve Kalite Göstergesi',
    heroCtaStart: 'Şimdi Mühendisliğe Başlayın',
    heroCtaExplore: 'Fikir Bankasını Keşfedin',

    step1Title: '1. Temel Hedefleri Belirleyin',
    conceptLabel: 'Kendi Kelimelerinizle Ham Fikir veya Taslak',
    conceptPlaceholder: 'Elde etmek istediğiniz sonucu anlatın... Motor roller, kurallar ve kısıtlamalar sentezleyecektir.',
    quickPresetsTitle: '💡 Hızlı Başlangıç Önerileri:',
    modelLabel: 'Hedef Yapay Zeka Modeli',
    toneLabel: 'Ses Tonu ve İletişim Tarzı',
    categoryLabel: 'Kategori ve Alan',
    advancedPhotoSpecs: '📸 Sinematik ve Fotoğrafik Özellikler',
    applyPhotoSpecs: '🎯 Fotoğraf Kriterlerini Fikre Dahil Et',
    targetLangLabel: 'Hedef Prompt Dili',
    targetLangSub: 'Son prompt hangi dilde oluşturulsun?',
    generateBtn: 'Promptu Sentezle ve Üret (Ctrl+Enter)',
    generatingBtn: 'Kurallar, roller ve değişkenler yapılandırılıyor...',
    step2Title: '2. Üretilen Prompt Çalışma Alanı',
    outputReady: 'Prompt hazır',
    emptyOutputTitle: 'Geliştirilen promptunuz burada görünecektir',
    emptyOutputSub: 'Soldaki panele fikrinizi yazın ve optimize edilmiş kodu almak için ürete tıklayın.',
    polishBtn: 'Otomatik İyileştir',
    translateBtn: 'İngilizceye Çevir ve Genişlet',
    copyBtn: 'Promptu Kopyala',
    copiedBtn: 'Kopyalandı!',
    saveBtn: 'Geçmişe Kaydet',
    testRunBtn: 'Promptu Test Et',

    qualityScoreTitle: 'Prompt Kalite ve Tutarlılık Göstergesi',
    qualityExcellent: 'Mükemmel ve Yüksek Hassasiyetli',
    qualityGood: 'İyi ve Yapılandırılmış',
    qualityAverage: 'Orta, daha fazla kurala ihtiyaç var',
    qualityWeak: 'Temel, lütfen daha fazla ayrıntı ekleyin',

    reverseTabSingle: 'Tek Görsel Analizi',
    reverseTabMimic: 'İki Görsel Stil Aktarımı',
    reverseTabVideo: 'Video Tersine Mühendislik',
    uploadAreaText: 'Yüklemek için tıklayın veya dosyayı buraya sürükleyin',
    uploadAreaSub: 'JPG, PNG, WebP ve kısa MP4 videoları desteklenir',
    analyzeBtn: 'Promptu Tersine Mühendislikle Çıkar',
    analyzingBtn: 'Görsel öğeler ve optik kompozisyon inceleniyor...',
    extractedPromptTitle: 'Çıkarılan Teknik Prompt',

    videoDesignerTitle: 'Video ve Drone Prompt Tasarımcısı',
    videoDesignerSub: 'Kamera yollarını, deklanşör hızlarını ve hacimsel ışıklandırmayı yönetin.',
    cameraMovement: 'Kamera Hareketi',
    lightingAtmosphere: 'Aydınlatma ve Atmosfer',
    motionBrushTitle: 'Akıllı Hareket Fırçası',
    copyFullSuite: 'Tüm Video Paketini Kopyala',

    save: 'Kaydet',
    cancel: 'İptal',
    close: 'Kapat',
    loading: 'Yükleniyor...',
    error: 'Bir hata oluştu',
    success: 'Başarılı',
    copiedSuccess: '✓ Prompt, ArabPrompt bağlantısıyla panoya kopyalandı!'
  },

  ja: {
    appTitle: 'ArabPrompt',
    appBadge: 'JA',
    appTagline: '次世代AIプロンプトエンジニアリング＆シンセシス',
    navBuilder: 'プロンプトビルダー',
    navCinema: 'シネマスタジオ',
    navVisualLibrary: 'ビジュアルライブラリ',
    navIdeas: 'アイデア生成',
    navReverse: 'リバースプロンプト',
    navSequence: 'シーケンス/動画',
    navDrone: '映像・ドローン設計',
    navDiffusionDB: 'DiffusionDB',
    navHistory: '履歴',
    navPrivacy: 'プライバシーと安全性',
    navPricing: '料金プラン',
    navTemplates: 'プロンプトテンプレート',
    geminiConnected: 'Geminiエンジン接続済',
    localPreview: 'ローカルプレビュー',
    toggleDarkMode: 'ダークモード切替',
    selectLanguage: '言語を選択',
    signIn: 'ログイン',
    cloudBackup: 'クラウドバックアップ',
    accountProfile: 'アカウント設定',

    heroBadge: '✨ 次世代AIプロンプトエンジニアリング統合環境',
    heroHeadingPart1: 'AIプロンプトエンジニアリングを',
    heroHeadingHighlight: '圧倒的な精度で',
    heroHeadingPart2: '世界の主要モデル向けに最適化',
    heroDescription: 'シンプルな下書きやアイデアを、Gemini、ChatGPT、Claude、Midjourney、Sora向けに構造化された本番用プロンプトに変換します。',
    heroFeature1: 'デュアル出力アーキテクチャ（即時型＆ディープ設計型）',
    heroFeature2: '画像・動画の即時マルチモーダルリバースエンジニアリング',
    heroFeature3: '映画レベルのドローンカメラ軌道＆運動物理シミュレーション',
    heroFeature4: 'リアルタイムのプロンプト品質・一貫性診断メーター',
    heroCtaStart: 'プロンプトを作成する',
    heroCtaExplore: 'アイデアバンクを見る',

    step1Title: '1. コア目標とコンセプトの設定',
    conceptLabel: 'プロンプトの原案・アイデア（自由記述）',
    conceptPlaceholder: '達成したい内容を入力してください... エンジンが役割、ガイドライン、制約を合成します。',
    quickPresetsTitle: '💡 クイックテスト用プリセット：',
    modelLabel: '対象AIモデル',
    toneLabel: 'トーンと文体',
    categoryLabel: 'カテゴリ・分野',
    advancedPhotoSpecs: '📸 プロ仕様の映画撮影・ライティング設定',
    applyPhotoSpecs: '🎯 撮影パラメータをコンセプトに適用',
    targetLangLabel: '生成プロンプトの言語',
    targetLangSub: 'プロンプトを出力する言語を選択してください',
    generateBtn: 'プロンプトを合成・生成 (Ctrl+Enter)',
    generatingBtn: 'ルール、役割、変数を構築中...',
    step2Title: '2. 設計済みプロンプト作業スペース',
    outputReady: '生成完了',
    emptyOutputTitle: 'ここに生成されたプロンプトが表示されます',
    emptyOutputSub: '左パネルにアイデアを入力して「生成」をクリックしてください。',
    polishBtn: '自動リファイン',
    translateBtn: '英語へ拡張・最適化',
    copyBtn: 'プロンプトをコピー',
    copiedBtn: 'コピー完了！',
    saveBtn: '履歴に保存',
    testRunBtn: 'テスト実行',

    qualityScoreTitle: 'プロンプト品質＆一貫性スコア',
    qualityExcellent: '極めて高精度・完成度高',
    qualityGood: '良好・構造化済',
    qualityAverage: '平均的・制約の追加推奨',
    qualityWeak: '基礎的・詳細の追加を推奨',

    reverseTabSingle: '単一画像解析',
    reverseTabMimic: '2枚の画像スタイル統合',
    reverseTabVideo: '動画リバースエンジニアリング',
    uploadAreaText: 'クリックまたはドラッグ＆ドロップでメディアをアップロード',
    uploadAreaSub: 'JPG, PNG, WebP および 短尺MP4動画に対応',
    analyzeBtn: 'リバースプロンプトを実行',
    analyzingBtn: '構図、光、光学パラメータを解析中...',
    extractedPromptTitle: '抽出されたエンジニアリングプロンプト',

    videoDesignerTitle: '動画＆ドローンプロンプト設計',
    videoDesignerSub: 'カメラパス、シャッタースピード、空気感を精密にコントロール。',
    cameraMovement: 'カメラワーク＆移動',
    lightingAtmosphere: 'ライティング＆雰囲気',
    motionBrushTitle: 'スマートモーションブラシ',
    copyFullSuite: '動画プロンプト一式をコピー',

    save: '保存',
    cancel: 'キャンセル',
    close: '閉じる',
    loading: '読み込み中...',
    error: 'エラーが発生しました',
    success: '成功',
    copiedSuccess: '✓ ArabPromptのリンク付きでコピーしました！'
  },

  zh: {
    appTitle: 'ArabPrompt',
    appBadge: '中文',
    appTagline: '下一代人工智能提示词工程与合成核心',
    navBuilder: '提示词架构师',
    navCinema: 'AI 电影编剧',
    navVisualLibrary: '视觉概念库 (36)',
    navIdeas: '创意灵感库',
    navReverse: '逆向提示工程',
    navSequence: '分镜/序列视频',
    navDrone: '运镜视频设计',
    navDiffusionDB: 'DiffusionDB数据库',
    navHistory: '提示词历史',
    navPrivacy: '隐私与安全中心',
    navPricing: '价格与方案',
    navTemplates: '提示词模板',
    geminiConnected: 'Gemini引擎已连接',
    localPreview: '本地离线预览',
    toggleDarkMode: '夜间深色模式',
    selectLanguage: '选择界面语言',
    signIn: '登录账户',
    cloudBackup: '云端同步备份',
    accountProfile: '个人账户设置',

    heroBadge: '✨ 下一代AI提示词工程与合成工作站',
    heroHeadingPart1: '以卓越的精确度掌控',
    heroHeadingHighlight: 'AI提示词工程',
    heroHeadingPart2: '赋能全球主流大模型',
    heroDescription: '将简单的想法与草稿转化为结构严谨、角色鲜明的高性能Prompt，完美适配Gemini、ChatGPT、Claude、Midjourney与Sora。',
    heroFeature1: '双路输出架构（快速直出与深度工程构建）',
    heroFeature2: '多模态即时逆向工程（支持图像与视频反推）',
    heroFeature3: '电影级无人机航拍运镜与物理动能编排',
    heroFeature4: '实时提示词质量、逻辑度与约束诊断仪',
    heroCtaStart: '立即开启提示词构建',
    heroCtaExplore: '浏览创意灵感库',

    step1Title: '1. 设定核心目标与提示词背景',
    conceptLabel: '原始创意或初步想法（用您的直白语言输入）',
    conceptPlaceholder: '描述您想要实现的目标... 平台将自动合成智能角色、任务指引、参数约束与边界条件。',
    quickPresetsTitle: '💡 快速测试预设建议：',
    modelLabel: '目标AI大模型',
    toneLabel: '语调风格与沟通偏好',
    categoryLabel: '提示词所属领域与分类',
    advancedPhotoSpecs: '📸 电影级机位镜头与专业摄影参数配置',
    applyPhotoSpecs: '🎯 将运镜与摄影规范合并至概念框',
    targetLangLabel: '生成目标提示词语言',
    targetLangSub: '最终提示词希望以哪种语言输出？',
    generateBtn: '合成并构建提示词 (Ctrl+Enter)',
    generatingBtn: '正在深度构建规则、角色与变量边界...',
    step2Title: '2. 高质量工程化提示词输出工作区',
    outputReady: '提示词已编译就绪',
    emptyOutputTitle: '构建的高级提示词将显示在此处',
    emptyOutputSub: '请在左侧配置面板中填写想法细节，然后点击“生成”以获取可直接复制的优化代码。',
    polishBtn: '深度润色调优',
    translateBtn: '一键转换为英文专业版',
    copyBtn: '复制提示词',
    copiedBtn: '已复制！',
    saveBtn: '保存至历史记录',
    testRunBtn: '测试运行提示词',

    qualityScoreTitle: '提示词质量与逻辑严谨度指标',
    qualityExcellent: '极佳（高保真高精度）',
    qualityGood: '良好（结构规范完备）',
    qualityAverage: '中等（建议补充约束边界）',
    qualityWeak: '基础（建议丰富细节与变量）',

    reverseTabSingle: '单图深度反推分析',
    reverseTabMimic: '双图风格迁移与结构融合',
    reverseTabVideo: '视频运镜与光影逆向工程',
    uploadAreaText: '点击上传媒体文件或将其拖放至此处',
    uploadAreaSub: '支持 JPG, PNG, WebP 格式图片及短篇 MP4 视频',
    analyzeBtn: '逆向推导工程化提示词',
    analyzingBtn: '正在深度解析视觉元素、景深与光学参数...',
    extractedPromptTitle: '精准逆向提取的技术提示词',

    videoDesignerTitle: '视频运镜与无人机镜头提示词设计',
    videoDesignerSub: '精确调控无人机航线、快门速度、体积光与动态物理力学。',
    cameraMovement: '相机运动轨迹与运镜方式',
    lightingAtmosphere: '照明条件与环境氛围',
    motionBrushTitle: '智能运动笔刷遮罩区',
    copyFullSuite: '复制整套视频生成提示词组件',

    save: '保存',
    cancel: '取消',
    close: '关闭',
    loading: '加载中...',
    error: '发生错误',
    success: '操作成功',
    copiedSuccess: '✓ 提示词已成功复制到剪贴板（附带平台直达链接）！'
  }
};

/**
 * Returns translation strings with fallback to Arabic then English
 */
export function getTranslation(lang: AppLanguage): TranslationDictionary {
  return TRANSLATIONS[lang] || TRANSLATIONS['ar'] || TRANSLATIONS['en'];
}
