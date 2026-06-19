/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PromptEvaluation {
  score: number; // 0 - 100
  clarity: number; // 0 - 100
  context: number; // 0 - 100
  ambiguity: number; // 0 - 100 (Higher is BETTER, meaning less ambiguity)
  ratings: {
    clarity: 'Excellent' | 'Good' | 'Needs Work' | 'Poor';
    context: 'Dense' | 'Moderate' | 'Sparse';
    ambiguity: 'Low Risk' | 'Medium Risk' | 'High Risk';
  };
  checklist: Array<{
    id: string;
    label: { ar: string; en: string };
    status: 'good' | 'warning' | 'info';
    feedback: { ar: string; en: string };
  }>;
  vagueTermsFound: string[];
}

/**
 * Rules and patterns for prompt analysis
 */
export function evaluatePrompt(text: string): PromptEvaluation {
  if (!text || !text.trim()) {
    return {
      score: 0,
      clarity: 0,
      context: 0,
      ambiguity: 0,
      ratings: { clarity: 'Poor', context: 'Sparse', ambiguity: 'High Risk' },
      checklist: [],
      vagueTermsFound: [],
    };
  }

  const cleanText = text.trim();
  const lowerText = cleanText.toLowerCase();

  // -----------------------------------------
  // 1. CLARITY SCORING (Max 100)
  // -----------------------------------------
  let clarity = 30; // base score for having text

  const hasPersona = /act as|you are|أنت|دورك|أنت تعمل|تقمص/i.test(lowerText);
  if (hasPersona) clarity += 25;

  const hasTask = /task|goal|objective|مهمتك|المهمة|الهدف|instructions/i.test(lowerText);
  if (hasTask) clarity += 25;

  const hasTarget = /input|user|data|audience|target|الجمهور|المدخلات|البيانات/i.test(lowerText);
  if (hasTarget) clarity += 20;

  clarity = Math.min(clarity, 100);

  // -----------------------------------------
  // 2. CONTEXT SCORING (Max 100)
  // -----------------------------------------
  let context = 10;

  // Length check
  if (cleanText.length > 600) {
    context += 30;
  } else if (cleanText.length > 250) {
    context += 20;
  } else if (cleanText.length > 80) {
    context += 10;
  }

  const hasFormat = /format|output|structure|json|markdown|تنسيق|المخرج|قالب/i.test(lowerText);
  if (hasFormat) context += 25;

  const hasVariables = /\[[^[\]]+\]/.test(cleanText); // Matches [bracket_variables]
  if (hasVariables) context += 25;

  const hasLists = /(-|\*|\d+\.)/.test(cleanText) || /example|مثال|نموذج/i.test(lowerText);
  if (hasLists) context += 10;

  context = Math.min(context, 100);

  // -----------------------------------------
  // 3. AMBIGUITY / SAFETY SCORING (Max 100, higher is better/less ambiguous)
  // -----------------------------------------
  let ambiguityScore = 100;
  const vagueTermsFound: string[] = [];

  // Positive: Having negative boundaries / exclusions reduces ambiguity
  const hasConstraints = /avoid|do not|never|--no|منع|لا تقم|تجنب|يمنع/i.test(lowerText);
  if (hasConstraints) {
    ambiguityScore += 10;
  }

  // Deductions for vague words
  if (/as soon as possible|at early|في أقرب وقت/i.test(lowerText)) {
    ambiguityScore -= 20;
    vagueTermsFound.push(text.includes('في أقرب وقت') ? 'في أقرب وقت' : 'As soon as possible');
  }
  if (/etc|et cetera|إلخ|وغيرها|أو ما شابه/i.test(lowerText)) {
    ambiguityScore -= 15;
    vagueTermsFound.push(text.includes('إلخ') ? 'إلخ / وغيرها' : 'etc.');
  }
  if (/somehow|maybe|perhaps|نوعا ما|ربما|قد/i.test(lowerText)) {
    ambiguityScore -= 15;
    vagueTermsFound.push(text.includes('ربما') ? 'ربما / نوعاً ما' : 'maybe / somehow');
  }
  if (/\b(nice|good|perfect|cool|رائع|جميل|ممتاز)\b/i.test(lowerText)) {
    ambiguityScore -= 10;
    vagueTermsFound.push(text.includes('رائع') ? 'رائع / جميل (تعبيرات ذاتية)' : 'good/nice (subjective)');
  }

  ambiguityScore = Math.max(15, Math.min(ambiguityScore, 100));

  // -----------------------------------------
  // OVERALL WEIGHTED SCORE
  // -----------------------------------------
  const score = Math.round(clarity * 0.35 + context * 0.35 + ambiguityScore * 0.30);

  // -----------------------------------------
  // RATING LABELS
  // -----------------------------------------
  let clarityRating: 'Excellent' | 'Good' | 'Needs Work' | 'Poor' = 'Poor';
  if (clarity >= 80) clarityRating = 'Excellent';
  else if (clarity >= 60) clarityRating = 'Good';
  else if (clarity >= 40) clarityRating = 'Needs Work';

  let contextRating: 'Dense' | 'Moderate' | 'Sparse' = 'Sparse';
  if (context >= 75) contextRating = 'Dense';
  else if (context >= 45) contextRating = 'Moderate';

  let ambiguityRating: 'Low Risk' | 'Medium Risk' | 'High Risk' = 'High Risk';
  if (ambiguityScore >= 80) ambiguityRating = 'Low Risk';
  else if (ambiguityScore >= 50) ambiguityRating = 'Medium Risk';

  // -----------------------------------------
  // CHECKLIST GENERATION
  // -----------------------------------------
  const checklist: PromptEvaluation['checklist'] = [];

  // Item 1: Persona
  checklist.push({
    id: 'persona',
    label: {
      ar: 'تحديد الهوية والدور (Persona)',
      en: 'Persona & Role Definition',
    },
    status: hasPersona ? 'good' : 'warning',
    feedback: {
      ar: hasPersona 
        ? 'ممتاز! قمت بتحديد دور واضح وذكي للخبير.' 
        : 'نوصي ببدء الأمر بـ "Act as expert..." أو "تقمص دور خبير..." لمنح الذكاء الاصطناعي سياقاً معرفياً سليماً.',
      en: hasPersona
        ? 'Perfect! A clear expert role has been defined.'
        : 'Recommended to prefix with "Act as an expert..." to establish domain expertise.',
    },
  });

  // Item 2: Task
  checklist.push({
    id: 'task',
    label: {
      ar: 'وضوح المهمة الأساسية (Task)',
      en: 'Core Task Specification',
    },
    status: hasTask ? 'good' : 'warning',
    feedback: {
      ar: hasTask
        ? 'رائع! قمت بصياغة مهمة رئيسية مباشرة بشكل رائع.'
        : 'حدد المهمة المطلوبة بدقة (مثال: "Create a detailed list..." أو "صمم دراسة...").',
      en: hasTask
        ? 'Great! The primary instruction/task is clearly communicated.'
        : 'Specify the primary command precisely (e.g., "Analyze the following...", "Formulate a list...").',
    },
  });

  // Item 3: Formatting & Output
  checklist.push({
    id: 'format',
    label: {
      ar: 'قواعد التنسيق والمخرج (Output Format)',
      en: 'Output Structure & Format',
    },
    status: hasFormat ? 'good' : 'warning',
    feedback: {
      ar: hasFormat
        ? 'جاهز! قمت بتضمين شروط لهيكلة المخرجات (أشبه بـ Markdown/JSON).'
        : 'حدد شكل النتيجة النهائية (على هيئة جدول، كود بركاني، نقاط مرقمة، أو Markdown منسق).',
      en: hasFormat
        ? 'Validated! Format requirements or template structures are clearly included.'
        : 'Define how the target AI should format the response (e.g. use Markdown, JSON block, tables).',
    },
  });

  // Item 4: Customizable Variables
  checklist.push({
    id: 'variables',
    label: {
      ar: 'المتغيرات الديناميكية [ ]',
      en: 'Dynamic Placeholder Tags',
    },
    status: hasVariables ? 'good' : 'info',
    feedback: {
      ar: hasVariables
        ? 'رائع! البرومبت مجهز بمتغيرات تفاعلية يمكن استبدالها لاحقاً.'
        : 'أضف متغيرات بين معقوفين مثل [الموضوع] أو [Budget] لتسهيل تفوير مرونة للأمر وإعادة استخدامه.',
      en: hasVariables
        ? 'Excellent! Bracketed placeholders allow quick and easy context customization.'
        : 'Wrap customizable values in brackets, e.g., [Topic] or [Audience], to make this prompt reusable.',
    },
  });

  // Item 5: Constraints / Boundaries
  checklist.push({
    id: 'constraints',
    label: {
      ar: 'الضوابط والحدود السلبية (Exclusions)',
      en: 'Negative Exclusions & Constraints',
    },
    status: hasConstraints ? 'good' : 'info',
    feedback: {
      ar: hasConstraints
        ? 'ممتاز! تم تضمين توجيهات سالبة أو قيود تمنع الهلوسة بذكاء.'
        : 'نوصي بوضع حدود مثل "لا تذكر فرضيات" أو "Avoid jargon..." لتقليص الانحراف التوليدي.',
      en: hasConstraints
        ? 'Splendid! Negative instructions exist to safely restrict undesired content.'
        : 'Add negative exclusions like "Do not explain rules" or "avoid cliché marketing hype" to bound the AI.',
    },
  });

  // Item 6: Ambiguity Risk (Warning)
  if (vagueTermsFound.length > 0) {
    checklist.push({
      id: 'vague_terms',
      label: {
        ar: 'مخاطر العبارات المطاطة بـ (Ambiguity Risk)',
        en: 'Subjective / Vague Term Danger',
      },
      status: 'warning',
      feedback: {
        ar: `العبارات التالية ممتازة للمشاعر ولكنها تقلل من دقة الآلة: (${vagueTermsFound.join(', ')}). حاول استخدام أرقام ومقاييس حادة وملموسة للوصول لنتائج أفضل.`,
        en: `These vague terms weaken instructions: (${vagueTermsFound.join(', ')}). Use precise integers, strict character/word counts, or specific formats instead of subjective qualifiers.`,
      },
    });
  }

  return {
    score,
    clarity,
    context,
    ambiguity: ambiguityScore,
    ratings: {
      clarity: clarityRating,
      context: contextRating,
      ambiguity: ambiguityRating,
    },
    checklist,
    vagueTermsFound,
  };
}
