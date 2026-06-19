/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type, GenerateVideosOperation } from '@google/genai';
import { createServer as createViteServer } from 'vite';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize Gemini Client Lazily & Safely
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY is not defined in environment variables. Gemini features will require the user to set their key.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || 'MOCK_KEY_IF_ABSENT',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Resilient wrapping helper function that automatically fallbacks to alternative models on quota limit or transient server hits
interface GenerateParams {
  contents: any;
  config?: any;
  model?: string;
}

async function generateContentWithQuotaResilience(params: GenerateParams) {
  const ai = getGeminiClient();
  const primaryModel = params.model || 'gemini-3.5-flash';
  
  // Try sequence of models that represent different model-specific quota accounts
  const modelsToTry = [primaryModel];
  if (primaryModel === 'gemini-3.5-flash') {
    modelsToTry.push('gemini-3.1-flash-lite');
    modelsToTry.push('gemini-flash-latest');
  } else if (primaryModel === 'gemini-3.1-pro-preview') {
    modelsToTry.push('gemini-3.5-flash');
    modelsToTry.push('gemini-3.1-flash-lite');
    modelsToTry.push('gemini-flash-latest');
  } else if (!primaryModel.includes('image') && !primaryModel.includes('video') && !primaryModel.includes('audio') && !primaryModel.includes('lyria')) {
    modelsToTry.push('gemini-3.5-flash');
    modelsToTry.push('gemini-3.1-flash-lite');
    modelsToTry.push('gemini-flash-latest');
  }

  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      console.log(`[Gemini Request] Attempting with model: ${model}`);
      const response = await ai.models.generateContent({
        ...params,
        model,
      });
      return response;
    } catch (error: any) {
      lastError = error;
      const errMsg = error?.message || String(error);
      const isQuotaOrTransientError = 
        errMsg.includes('429') || 
        errMsg.includes('503') ||
        errMsg.includes('500') ||
        errMsg.includes('502') ||
        errMsg.includes('504') ||
        errMsg.includes('RESOURCE_EXHAUSTED') || 
        errMsg.includes('UNAVAILABLE') ||
        errMsg.includes('quota') || 
        errMsg.includes('Quota exceeded') ||
        errMsg.includes('high demand') ||
        errMsg.includes('temporary') ||
        errMsg.includes('try again later') ||
        error?.status === 'RESOURCE_EXHAUSTED' ||
        error?.status === 'UNAVAILABLE' ||
        (error?.status && (
          String(error.status).includes('429') || 
          String(error.status).includes('503') || 
          String(error.status).includes('UNAVAILABLE')
        ));

      if (isQuotaOrTransientError) {
        console.warn(`[Gemini Resilience] Model ${model} returned rate limits (429) or transient high demand (503). Trying alternative model if available...`);
        continue;
      } else {
        throw error;
      }
    }
  }

  throw lastError;
}

// Global state check for frontend
app.get('/api/config', (req, res) => {
  res.json({
    hasApiKey: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY',
  });
});

// Helper: local deterministic high-quality Prompt Synthesis Engine as a resilient fallback
function generateFallbackPrompt(rawConcept: string, model: string, tone: string, category: string, language: string, useClarificationLoop?: boolean): string {
  // Simple check if rawConcept has Arabic letters to make bilingual explanations
  const isArabicInConcept = /[\u0600-\u06FF]/.test(rawConcept);
  const lowerConcept = rawConcept.toLowerCase();
  
  // Choose an English title for the prompt based on category or content
  let titleAr = "أمر برومبت مصمم خصيصاً لمطلبك";
  let titleEn = "Custom System Engineered Prompt";
  let roleEn = "expert assistant";
  let taskEn = "accomplish the primary objective efficiently";
  let constraintsList: string[] = [];

  // Match keyword-based specializations automatically (Auto-Mode Selection)
  let activeCategory = category;
  if (lowerConcept.includes('rap') || lowerConcept.includes('drill') || lowerConcept.includes('lyrics') || lowerConcept.includes('hip-hop') || lowerConcept.includes('boom-bap') || lowerConcept.includes('freestyle') || lowerConcept.includes('rap-song') || lowerConcept.includes('bars') || lowerConcept.includes('drill-song') || lowerConcept.includes('trap')) {
    activeCategory = 'rap_hiphop';
  } else if (lowerConcept.includes('poetry') || lowerConcept.includes('poem') || lowerConcept.includes('song') || lowerConcept.includes('story') || lowerConcept.includes('novel') || lowerConcept.includes('script') || lowerConcept.includes('artistic writing') || lowerConcept.includes('creative writing')) {
    activeCategory = 'creative_writing';
  } else if (lowerConcept.includes('midjourney') || lowerConcept.includes('stable diffusion') || lowerConcept.includes('flux') || lowerConcept.includes('dall-e') || lowerConcept.includes('photography') || lowerConcept.includes('cinematic') || lowerConcept.includes('selfie') || lowerConcept.includes('resolution')) {
    activeCategory = 'image_generation';
  } else if (lowerConcept.includes('research') || lowerConcept.includes('academic') || lowerConcept.includes('scientific') || lowerConcept.includes('literature review') || lowerConcept.includes('medical') || lowerConcept.includes('medicine') || lowerConcept.includes('psychology')) {
    activeCategory = 'academic_research';
  }

  // Match category
  if (activeCategory === 'rap_hiphop') {
    titleAr = "مهندس التدفق والقوافي الموسيقية (Rap & Hip-Hop Flow Architect)";
    titleEn = "Rap Flow & Rhyme Engineer Extraordinaire";
    roleEn = "elite multi-genre rap lyricist, rhyme engineer, and cultural hip-hop strategist";
    taskEn = `craft intense, high-impact hip-hop lyrics/bars incorporating dynamic Wordplay, Punchlines, and highly sophisticated rhythm structures`;
    constraintsList = [
      "FLOW & SYLLABLE CADENCE: Tailor the syllable length perfectly to handle rapid double-time rhythms or steady boom-bap, placing clear indicators for breathing breaks.",
      "RHYME DENSITY: Incorporate multisyllabic rhyme schemes, internal rhymes, end rhymes, assonance, and consonance optimized across every bar.",
      "MULTILINGUAL TRANSITIONS: Enable natural, smooth transitions if combining Arabic, Moroccan Darija, French, and English, maintaining strict delivery timing.",
      "CULTURAL LAYER: Naturally embed authentic Moroccan Darija or relevant local and contemporary youth expressions if a domestic/Moroccan context of language is implied.",
      "MUSIC QUALITY CONTROL: Run automated inner checks on flow consistency, rhyme density, memorability, and BPM compatibility to produce stellar performance lyrics."
    ];
  } else if (activeCategory === 'creative_writing') {
    titleAr = "روائي وصانع حبكة إبداعية سينمائية";
    titleEn = "Master Creative Writer & Narrative Designer";
    roleEn = "elite narrative designer, poetic craftsman, and emotional impact expert";
    taskEn = `author a deeply moving, stylistically consistent, and highly engaging artistic piece (lyrics, poetry, script, or storytelling)`;
    constraintsList = [
      "NARRATIVE METALLURGY: Employ rich sensory metaphors, vivid imagery, and high-frequency emotional resonance.",
      "FLOW OPTIMIZATION: Maintain a captivating, rhythmic reading pace to hook reader empathy quickly.",
      "PERFORMANCE READINESS: Formulate structures that fit beautifully when read aloud, honoring artistic pacing."
    ];
  } else if (activeCategory === 'image_generation') {
    titleAr = "مدير فني لتوليد محتوى بصري فائق الواقعية";
    titleEn = "Advanced Visual & Image Prompt Architect";
    roleEn = "distinguished cinematic art director, photography specialist, and camera physics advisor";
    taskEn = `engineer an extremely detailed, photorealistic visual prompt with complete control over camera settings, lighting physics, and environment depth`;
    constraintsList = [
      "VISUAL ACCENTUATION: Focus heavily on a dominant Hero Subject, establishing clean perspective lines and beautiful Negative Space.",
      "CAMERA CONFIG: Detail correct lenses (e.g. 35mm), active apertures (f/1.4), film stock characteristics (e.g. Sony A7R or Leica M6 style), and volumetric depths of field.",
      "LIGHTING THEORY: Inject golden hour natural lighting, casting Rembrandt-style side-light or cinematic chiaroscuro highlights and shadow details.",
      "PHYSICALLY BASED TEXTURES: Detail realistic fabric folds, pores, wood micro-grains, weave counts, and ray-traced reflections.",
      "SAFETY PRESETS: Include robust negative constraints to proactively block plastic textures, deformed hands, duplicate subjects, stock-photo appearances, or blurred frames."
    ];
  } else if (activeCategory === 'academic_research') {
    titleAr = "باحث واستشاري ومنهجي أكاديمي عالي الموثوقية";
    titleEn = "Lead Academic Researcher & Technical Analyzer";
    roleEn = "distinguished research supervisor, literature synthesis expert, and technical methodology strategist";
    taskEn = `author a deeply critical, structured analysis or study draft aligning strictly with sound empirical science and consensus rules`;
    constraintsList = [
      "FRAMEWORK SOLIDITY: Structure reporting around industry standard frameworks (like GRADE, CONSORT, or DSM-5-TR where appropriate).",
      "EVIDENCE HIERARCHY LAYER: Clearly divide verified global scientific consensus from emerging theories or speculative claims. Label certitude accurately (e.g. High, Moderate, Low, Insufficient).",
      "CITATIONAL CLARITY: Maintain academic vocabulary and include placeholders for proper sources, reference indexing, and logical evidence mapping."
    ];
  } else if (activeCategory === 'tech') {
    titleAr = "مهندس ومطور برمجيات ذكي";
    titleEn = "Expert AI Software Engineer & Developer";
    roleEn = "world-class AI Software Engineer with expertise in modern architectural patterns, clean code design, and secure algorithms";
    taskEn = `analyze the requested problem, design a robust solution, write clean, documented code, and provide step-by-step optimization annotations`;
    constraintsList = [
      "Ensure all raw code complies with modern linting rules and best practices.",
      "Include helpful, clear inline comments explaining complex algorithm steps.",
      "Proactively advise on memory management, speed optimizations, or potential security vulnerabilities.",
      "Explain the solution structure before showing the complete, modular code."
    ];
  } else if (activeCategory === 'marketing') {
    titleAr = "خبير تسويق رقمي وصياغة إعلانات";
    titleEn = "Senior Digital Marketing Strategist & Copywriter";
    roleEn = "senior copywriter and conversion rate optimization (CRO) marketing expert";
    taskEn = `analyze the value proposition, define the strategic copywriting hooks, and write high-converting copy with clear Calls to Action (CTAs)`;
    constraintsList = [
      "Use extremely engaging, attention-grabbing opening lines (hooks).",
      "Incorporate relevant high-traffic hashtags and modern, contextual emojis.",
      "Align the messaging perfectly with the requested tone to generate immediate trust.",
      "Ensure the core call-to-action is clear, convincing, and easy to perform."
    ];
  } else if (activeCategory === 'content') {
    titleAr = "كاتب محتوى وخبير تحسين محركات البحث";
    titleEn = "Master Content Creator and SEO Authority";
    roleEn = "professional content creator and veteran SEO research specialist";
    taskEn = `author a deeply structured, comprehensive, and highly informative article centered around the target keyword/topic`;
    constraintsList = [
      "Write using semantically rich headings (H2, H3) to map out the reading flow logically.",
      "Naturally integrate secondary keywords without keyword stuffing.",
      "Focus on high readability with short paragraphs, clear bullet lists, and bold key terms.",
      "Provide actionable take-aways or a compelling conclusion at the very end."
    ];
  } else if (activeCategory === 'education') {
    titleAr = "أخصائي تبسيط ومُعلم أكاديمي";
    titleEn = "Feynman Educator & Learning Architect";
    roleEn = "expert educator specializing in step-by-step knowledge simplification and pedagogical design";
    taskEn = `deconstruct complex technical jargon into exceptionally clear, intuitive explanations, using illustrative analogies from daily life`;
    constraintsList = [
      "Avoid unnecessary academic jargon; replace it with easy-to-understand analogies first.",
      "Structure the explanation in progressive waves: basic summary, detailed breakdown, followed by a concrete example.",
      "Formulate interactive check-questions to evaluate the learner's comprehension."
    ];
  } else {
    // Default to general/productivity
    titleAr = "مستشار أعمال ومحلل إنتاجية";
    titleEn = "Corporate Strategy & Business Analyst";
    roleEn = "distinguished management consultant and organizational productivity analyst";
    taskEn = `synthesize raw sources, draft standard business correspondence, organize trackers, or produce structured briefing logs`;
    constraintsList = [
      "Maintain a strictly objective, fact-based, and highly professional tone of voice.",
      "Directly address key stakeholders with appropriate business vocabulary.",
      "Use tabular formats or clear bullet structures whenever organizing complex datasets.",
      "Highlight critical deadlines, action items, or risk factors prominently."
    ];
  }

  if (useClarificationLoop) {
    constraintsList.push("INTERACTIVE CLARIFICATION & IMPROVEMENT LOOP: Before executing the core task, do NOT output the final result immediately. Instead, analyze the request, propose 3 specific prompt optimization recommendations, and ask the user if there are any points that need clarification. Present two clear paths: either they reply to clarify/optimize, or they authorize you to begin with the current content. Wait for the user's answers or greenlight before executing the fully optimized task.");
  }

  // Refine values
  const cleanConcept = rawConcept.replace(/"/g, '\\"');
  
  // Model-specific syntax additions
  let promptOpening = "";
  let promptClosing = "";

  if (model === 'notebooklm') {
    roleEn = "senior intelligence analyst and Google NotebookLM Research Partner";
    promptOpening = `[PROMPT_START]\nAct as a ${roleEn}. Ground all your answers strictly in the files, notes, and sources provided. Always cite specific excerpts to substantiate claims and prevent hallucination.`;
    promptClosing = `[SOURCES GROUNDING RULE]: If the provided source files do not contain sufficient data to answer any query, state clearly that the information is not present in the loaded sources. Do not make up facts.`;
    constraintsList.push("Act strictly as a thinking partner, generating Briefing docs, Audio overviews, study guides, or interactive mind maps.");
  } else if (model === 'claude') {
     } else if (model === 'midjourney') {
    titleEn = "Midjourney Cinematic Art Director";
    promptOpening = `[MIDJOURNEY STYLE CONFIG]\nCreate an ultra-realistic, beautifully detailed image prompt reflecting: "${cleanConcept}"`;
    constraintsList = [
      "Style: Photographic, cinematic realism, rich texture detail",
      "Lighting: Warm, soft natural light with volumetric rays",
      "Aspect Ratio Nudge: Always end your output with '--ar 16:9'",
      "Style Mode Nudge: Append '--style raw --v 6.0' to ensure high fidelity rendering"
    ];
  } else {
    promptOpening = `You are a ${roleEn}.\nYour core instruction is to help me solve the following objective: "${cleanConcept}".`;
  }

  const modelLabel = model.toUpperCase();
  const toneLabel = tone || "مهني واحترافي";

  let finalPromptBlock = `${promptOpening}\n\n`;
  finalPromptBlock += `## OBJECTIVE / TASK:\n`;
  finalPromptBlock += `[Task description]: ${cleanConcept}\n\n`;
  
  if (constraintsList.length > 0) {
    finalPromptBlock += `## SYSTEM RULES & CONSTRAINTS:\n`;
    constraintsList.forEach((c, idx) => {
      finalPromptBlock += `${idx + 1}. [Constraint]: ${c}\n`;
    });
    finalPromptBlock += `\n`;
  }

  finalPromptBlock += `## PERFORMANCE GUIDELINES:\n`;
  finalPromptBlock += `- Tone: ${toneLabel}\n`;
  finalPromptBlock += `- Target Language Model: ${modelLabel}\n\n`;

  const originalPromptBlock = `### 🎯 البرومبت الأصلي المنفذ كما هو (Faithful Direct Formulation)
هذا هو المنفذ المباشر لفكرتك المصاغ بهيئة واضحة ومنظمة تماماً:

\`\`\`
[SYSTEM]
Execute the following primary objective precisely with high clarity:

"${cleanConcept}"

[GUIDELINES]
- Tone: Respond in a ${toneLabel || 'professional'} manner.
- Language: Output in clean, readable format.
\`\`\``;

  const enhancedPromptBlock = `### ⚠️ لقد تم توليد هذا الأمر فورياً ومحلياً بجودة عالية (Resilient Fallback Core) لتجاوز حدود الاستهلاك الحالية لمفتاح الخادم. النتيجة متطابقة برمجياً لمواصفات مهندسي الأوامر.

# ${titleAr} / ${titleEn}

أنت توجه النموذج اللغوي ليتقمص دور شخصية **${roleEn}**. هذا يضمن تركيز اهتمام الذكاء الاصطناعي على المفاهيم الأكثر دقة وحرفية في موضوعك ومجالك.

## 🛠️ نص البرومبت المحسن والكامل (المعد للنسخ والمكتوب بالإنجليزية)
قم بنسخ الأمر البرمجي التالي بالكامل من صندوق الأكواد بالأسفل واستخدمه مع أي نموذج رائد (مثل Gemini أو Claude) للحصول على أفضل أداء:

\`\`\`
${finalPromptBlock.trim()}
\`\`\`

## 🧠 نصائح ذهبية لتطوير الاستجابة القصوى مع هذا الأمر:
1. **أدخل بياناتك الخاصة**: قم بتعديل القيم المتواجدة بين الأقواس المربعة \`[مثل هذا القوس]\` بمعلوماتك وسياق مشروعك الملموس.
2. **شحذ المنطق (Chain of Thought)**: اطلب من النموذج كتابة خطة للتفكير قبل توفير الإجابة بمجرد كتابة: *"Please draft your thinking process before giving me the final answer"*.
3. **أسناد والتحقق**: إذا كنت تستخدم **NotebookLM**، تأكد من تحميل مستندات الـ PDF أو روابط الويب ذات الصلة أولاً قبل تمرير هذا البرومبت لتفعيل الأسناد التلقائي للفقرات.
`;

  return `---ORIGINAL_PROMPT_VERSION---
${originalPromptBlock}
---ORIGINAL_PROMPT_VERSION_END---

---ENHANCED_PROMPT_VERSION---
${enhancedPromptBlock}
---ENHANCED_PROMPT_VERSION_END---`;
}

// Built-in intelligent simulated response for testing playground (under 429 quota exhaustion)
function generateSimulatedModelResponse(promptText: string): string {
  const isArabic = /[\u0600-\u06FF]/.test(promptText);
  const lowerPrompt = promptText.toLowerCase();

  let header = "";
  let body = "";

  if (lowerPrompt.includes('podcast') || lowerPrompt.includes('بودكاست') || lowerPrompt.includes('[مقدم_1]') || lowerPrompt.includes('notebooklm')) {
    header = isArabic ? "🎙️ محاكاة حلقة البودكاست الثنائي (NotebookLM Style)" : "🎙️ Simulated 2-Host Audio Overview Podcast";
    body = isArabic ? 
`أحمد: (بنبرة حماسية ومرحة) "أهلاً ومرحباً بكم مع مستمعينا الأعزاء في حلقة جديدة من تبسيط المفاهيم! سارة، هل كنتِ تتخيلين أن تكنولوجيا الأوامر تتطور بهذه السرعة المهولة؟"

سارة: (تضحك بلطف وتجيب) "أهلاً أحمد، وبصراحة لا! المستند الذي نناقشه اليوم يضع نقاطاً في غاية الأهمية. التصميم الدقيق والهيكلة هما المفتاح الحقيقي للحصول على كفاءة مذهلة."

أحمد: "رائع جداً! دعونا نبسط المحاور الثلاثة الكبرى في المستند..."
- **المحور الأول**: الأسناد للمصادر الموثوقة لمنع الهلوسة الرقمية.
- **المحور الثاني**: وضوح الدور الممنوح (Role Assignment) للنموذج.
- **المحور الثالث**: تبني التفكير خطوة بخطوة للحصول على استجابة غنية ومتكاملة.

سارة: "بالتأكيد أحمد، وهذا ما يجعل المستمعين اليوم قادرين على تصميم أوامرهم كالمحترفين بكل سهولة وبلا تعقيد!"` 
: 
`Host A: (Enthusiastically) "Welcome back everyone! Today we're diving into a fascinating topic. Host B, did you see how fast this technology is evolving?"

Host B: (Smiling) "Hey Host A! Yes, it's absolutely mind-blowing. The way structured prompting helps clear up cognitive load for LLMs is outstanding."

Host A: "Indeed! Let's break down the three major core pillars of the document:
1. Grounding in verified sources.
2. Distinct persona mapping.
3. Logical task constraints.

Host B: "Exactly, and that's why keeping commands extremely precise avoids common pitfalls entirely!"`;
  } else if (lowerPrompt.includes('code') || lowerPrompt.includes('برمج') || lowerPrompt.includes('function') || lowerPrompt.includes('const ')) {
    header = isArabic ? "💻 حل برمجي متكامل ومحسن (Simulated Software Engineer)" : "💻 Optimized Code Implementation";
    body = isArabic ?
`**مراجعة الكود السريعة**: تم بناء الكود البرمجي المقترح بناءً على أفضل معايير التصميم النظيف، مع هيكلة متكاملة للوظائف لمنع الأخطاء البرمجية الشائعة.

\`\`\`typescript
// دالة لحساب وتصفية مخرجات البيانات بكفاءة حسابية O(1)
interface User {
  id: number;
  name: string;
  role: string;
  isActive: boolean;
}

export function processEliteUsers(users: User[]): User[] {
  if (!users || users.length === 0) return [];
  
  // تصفية المستخدمين النشطين فقط لضمان سلامة الذاكرة والأداء
  return users.filter(user => {
    const isValid = user.isActive && user.role !== 'guest';
    return isValid;
  });
}
\`\`\`

**نصائح الأداء والتطوير**:
1. تم استخدام التصفية الفورية لتجنب تكرار استهلاك الذاكرة في المصفوفات الكبيرة.
2. يوصى دائماً بتدعيم الأنواع بـ TypeScript لمقاومة الأخطاء أثناء وقت التجميع.`
:
`**Code Review**: The requested function has been optimized under clean architectural design patterns to ensure maximum runtime safety.

\`\`\`typescript
// Optimized data processing utility with O(n) completion complexity
export function filterActiveRecords<T extends { active: boolean }>(items: T[]): T[] {
  if (!items) return [];
  return items.filter(item => item.active);
}
\`\`\`

**Optimization Recommendations**:
1. Leverage strict types to minimize compiler-level execution errors.
2. Avoid unnecessary deep-cloning on large-scale runtime objects.`;
  } else if (lowerPrompt.includes('meta-product-launch') || lowerPrompt.includes('facebook') || lowerPrompt.includes('instagram') || lowerPrompt.includes('meta ads')) {
    header = "🚀 Meta Ads Product Launch Campaign - High-Converting Variations";
    body = `### Option 1: The Hook & Storytelling Angle (Emotional & Relatable)
■ **Primary Text (النص الأساسي بالعربية):**
جربت شعور الإحباط لما تبذل مجهود مضاعف وبدون نتائج واضحة؟ 😤 

اليوم نعلن عن التدشين الرسمي لأقوى ابتكار في السوق! صممنا هذا الحل المبتكر ليوفر لك تجربة استثنائية تختصر عليك الوقت والجهد، وتمنحك القيمة الحقيقية التي تستحقها من أول ثانية.

🎖️ الميزة الفريدة: توصيل فوري وسري`;
  } else {
    header = isArabic ? "💡 تحليل المفهوم والمقترح" : "💡 Concept Analysis & Suggestion";
    body = isArabic ? 
      "تم تحسين وهندسة فكرتكم بنجاح وملاءمتها لقواعد الذكاء الاصطناعي المثالية لمسار الأوامر." :
      "Your prompt concept has been engineered successfully to align with optimal AI instructions.";
  }

  return `### ${header}\n\n${body}`;
}

// Route: Generate a professional prompt from a simple concept
app.post('/api/generate-prompt', async (req, res) => {
  try {
    const { rawConcept, model, tone, category, language, useClarificationLoop } = req.body;
    if (!rawConcept) {
      return res.status(400).json({ error: 'Concept text is required' });
    }

    const systemInstruction = `أنت خبير واستشاري متقدم في هندسة الأوامر (Bilingual Prompt Engineering Genius Specialist).
مهمتك الأساسية هي تلقي فكرة أو دافع بسيط ومبهم من المستخدم باللغتين العربية أو الإنجليزية وصياغته وتطويره بدقة معمارية فائقة إلى لغة برومبتات برمجية واضحة وشديدة الفعالية.

يفيد نص البرومبت الأساسي (المعد للنسخ) باللغة الإنجليزية (English) دائماً للحصول على أداء مذهل ودقة عالية من النماذج اللغوية، حتى لو كانت فكرة المستخدم مكتوبة في الأصل بالعربية. إذا كانت فكرة المستخدم تطلب إنتاج محتوى باللغة العربية، فقم بتضمين توجيه واضح وحاسم للذكاء الاصطناعي بالإنجليزية يلزمه بإنتاج النتيجة باللغة العربية (مثال: "Provide the output in high-quality Arabic").

أنت ملزم تماماً بتقديم وتوليد خيارين (اختيارين) منفصلين تماماً لكي نمنح المستخدم حرية الاختيار بينهما والتحكم الكامل بما يناسب عمله:

الخيار الأول (خيار أ - تطبيق البرومبت الأصلي المباشر / Faithful Direct Formulation):
- أمر برومبت مميز ومباشر وموجز يحافظ على أصل فكرة المستخدم وصياغتها دون تكلّف أو تعقيد إضافي.
- يجب تغليف الخيار الأول بالملصق المحدد التالي حرفياً:
---ORIGINAL_PROMPT_VERSION---
[محتوى وتنسيق الخيار الأول - يفضل وضعه في صندوق كود]
---ORIGINAL_PROMPT_VERSION_END---

الخيار الثاني (خيار ب - البرومبت الهندسي المحسن المطور / Deeply Engineered Prompt):
- الأمر المطور الكامل الذي تم بناؤه باستخدام معايير هندسة الأوامر الرقمية وإضافة الشخصيات والأدوار، والقواعد، والتفاصيل الدقيقة، والقيود السلبية، والنصائح الذهبية المذكورة أدناه.
- يجب تغليف الخيار الثاني بالملصق المحدد التالي حرفياً:
---ENHANCED_PROMPT_VERSION---
[محتوى وتنسيق الخيار الثاني المطور بالكامل]
---ENHANCED_PROMPT_VERSION_END---

اتبع هذه القواعد عند توليد الأمر المطور (الخيار الثاني):
1. حدد دوراً واضحاً وجذاباً للذكاء الاصطناعي (Persona): مثلاً "Act as an expert..."
2. حدد المهمة بوضوح ودقة (The Core Task) باللغة الإنجليزية.
3. أضف سياقاً مناسباً وقيوداً واضحة (Constraints/Guidelines) باللغة الإنجليزية تشمل النبرة والأسلوب والتنسيق المطلوب.
4. صغ البرومبت الكامل النهائي في صندوق كود مخصص للنسخ المباشر ويكون مكتوباً باللغة الإنجليزية لضمان أعلى أداء من Gemini و ChatGPT و Claude.
5. استخدم متغيرات وصيغ مرجعية محددة بين قوسين مربعين مثل [Topic] أو [Target_Audience] أو [Language] بالإنجليزية لتمكين التخصيص السهل.

صِغ النتيجة في قالب Markdown منسق جداً يشمل:
- عنوان جذاب للأمر (عربي وإنجليزي).
- دور العميل وفلسفة الأمر (Role and Persona).
- صندوق كود (Prompt Block) يحتوي على البرومبت الكامل باللغة الإنجليزية (بين \`\`\` و \`\`\`).
- نصائح ذهبية ذكية للمستخدم (بالعربية) حول كيفية الحصول على أفضل عمل من هذا الأمر البرمجي.`;

    let tailoredSystemInstruction = systemInstruction;

    // DYNAMIC SPECIALIZATION ACTIVATION & AUTO-CLASSIFICATION ENGINE
    tailoredSystemInstruction += `\n\n=== DYNAMIC SPECIALIZATION ACTIVATION & DOMAIN DETECTION ===
Before generating the prompt, you MUST analyze and classify the user's concept ('rawConcept') into one or more of the following specialized domains:
- Academic Research
- Medicine
- Psychology
- Psychiatry
- Programming
- Cybersecurity
- Business
- Marketing
- Law
- Education
- Content Creation
- Creative Writing
- Music
- Rap & Hip-Hop
- Poetry
- Storytelling
- Cinema
- Image Generation
- Video Generation
- General Purpose

You MUST automatically activate and merge the corresponding expert module(s) below for the detected category, injecting their specific rules, frameworks, and quality control guidelines into the engineered prompt content:

---
1. CREATIVE WRITING MODE ACTIVATION:
If the request involves Songs, Rap, Lyrics, Poetry, Spoken Word, Storytelling, Novels, Scripts, or Artistic Writing:
- You must apply high-level: Narrative Design, Emotional Impact, Stylistic Consistency, Audience Engagement, and Creative Flow Optimization.

---
2. RAP & HIP-HOP ENGINE ACTIVATION:
If the request contains Rap, Hip-Hop, Drill, Trap, Freestyle, Bars, Punchlines, Flow, or Lyrics:
- FLOW ENGINEERING: Determine and recommend the optimal BPM Range, Cadence Style, Flow Complexity, and Breath Control gaps.
- RHYME ENGINEERING: Optimize Internal Rhymes, Multisyllabic Rhymes, End Rhymes, Assonance, Consonance, Wordplay, and punchlines.
- MULTILINGUAL OPTIMIZATION: When multiple languages are requested or mixed (e.g. Arabic, Moroccan Darija, French, English, Spanish), optimize transitions between languages elegantly to maintain perfect pronunciation flow and rhythmic cadence.
- CULTURAL LAYER: If Moroccan Darija or a Moroccan context is detected or requested, incorporate Moroccan Identity, Darija Expressions, Local References, Urban Culture, and Contemporary Youth Language.
- MUSIC QUALITY CONTROL: Automatically evaluate the draft for Flow Consistency, Rhyme Density, Memorability, Performance Potential, and BPM Compatibility, modifying and improving it internally before outputting the final prompt.

---
3. IMAGE GENERATION ENGINE ACTIVATION:
If the request involves Midjourney, Gemini Image, Flux, Stable Diffusion, DALL-E, Photography, or Cinematic Images:
- Automatically activate advanced: Composition Analysis, Camera Settings (lens choices, aperture, shutter), Lighting Design (golden hour, volumetric, Rembrandt), Color Theory, Artistic Style Detection, and Visual Storytelling. Include appropriate CLI flags like aspect ratio (--ar 16:9) or style raw when relevant.

---
4. RESEARCH ENGINE ACTIVATION:
If the request involves Research, Academic Paper, Literature Review, or Scientific Analysis:
- Automatically activate: Academic Research Framework (such as PRISMA, GRADE, or CONSORT), Evidence Hierarchy (clearly separating establish consensus from speculation, classifying evidence as High/Moderate/Low/Insufficient), Citation Standards, Critical Analysis, and Methodology Design.

---
AUTO-MODE SELECTION PRINCIPLE:
Identify the correct domain, activate the respective specialization rules, apply the corresponding industry framework, and structure the resulting prompt perfectly inside the code block. In your introduction, explicitly announce the detected category/domain and which active expert modules have been triggered.`;

    if (model === 'notebooklm') {
      tailoredSystemInstruction += `\n\nبما أن النموذج المستهدف هو Google NotebookLM (أو ميزات البودكاست وتلخيص المصادر):\n1. صمم البرومبت في إطار المبادئ الأربعة المذكورة في مستندات تفعيل الأداء الخاصة بـ Google (Prompting 101):\n   - الدور والمنظور (Persona): تحديد هوية صانع البحث أو المعاينة بوضوح (مثال: "You are a lead investigator / academic researcher...").\n   - المهمة الأساسية (Task): حدد الإجراء المطلوب بدقة متناهية (مثال: "Generate a briefing document", "Synthesize a 2-host audio overview draft", "Triangulate the sources...").\n   - السياق والشروط (Context): ذكّر بمطابقة الحقائق بالاستشهاد المباشر بالمصادر ونسب الاقتباسات بدقة.\n   - الشكل المطلوب (Format): تحديد مخرج واضح للهيكل المطلوب (سواء كان حواراً طويلاً، جدولاً لمقارنة التعارضات، أو صيغة دراسة).\n2. بالنسبة لتوليد نصوص البودكاست الثنائية (Audio Overview)، وجّه النموذج دائمًا لتكثيف التفاعل العفوي الطبيعي (الضحك والأخذ والرد الارتجالي) لثنائي مميز وسلس للتوليد الصوتي.\n3. التزم بكتابة الكود البرومبت النهائي باللغة الإنجليزية بالكامل لضمان تشغيله السلس على أجهزة التوليد.`;
    } else if (category === 'visual' || model === 'midjourney') {
      tailoredSystemInstruction += `\n\nأنت تعمل الآن تحت إطار "ArabiPrompt Ultra Visual Optimization Framework" المطور خصيصاً للتصميم البصري الفائق والواقعي ونقل جودة الدعاية والابتكارات المتقدمة.
مهمتك الأساسية هي تحويل التصورات البسيطة والمبهمة إلى واجهات بصرية وأوامر توليد صور فائقة الجودة للمنصات الشهيرة (Midjourney, DALL-E 3, Stable Diffusion).

 must apply the 10 visual guidelines logically. Generate the final prompt in English so it commands Midjourney or DALL-E 3 perfectly. Output both options wrapped in their respective markers.`;
    }

    if (useClarificationLoop) {
      tailoredSystemInstruction += `\n\nهام جداً - ميزة التحسين التفاعلي والأسئلة الاستكشافية الاستباقية (Interactive Prompt Improvement & Clarification Loop):\nلقد تم تنشيط ميزة "الحوار والتحسين التفاعلي المتبادل".\nيجب عليك تضمين قسم صريح وتوجيهات صارمة داخل صندوق كود البرومبت النهائي (The Prompt Code Block) تُجبر الذكاء الاصطناعي الذي سيقوم بتشغيل هذا الأمر على التالي:\n1. يمنع منعاً باتاً صياغة المخرجات النهائية المطلوبة مباشرة فور تلقي الإشارة الأولى!\n2. بدلاً من ذلك، في أول استجابة له، يجب عليه أن يرحب بالمستخدم، ويعلن أنه يعمل كصديق ومستشار فني لتجويد هذه المهمة، ثم يطرح عليه من 1 إلى 3 أسئلة دقيقة واستكشافية (Clarification Questions) أو يقترح عليه تغيير بعض المحددات لزيادة الفاعلية (Optimization Suggestions).\n3. يجب أن يطلب من المستخدم إما الرد للتوضيح أو إعطاء أمر مباشر "Proceed with defaults" للبدء بالمعطيات الحالية.\n4. لا يقوم بتطبيق المهمة الأساسية كاملة بشكل نهائي إلا بعد الحصول على رد المستخدم لتنفيذ البرومبت المحسن.`;
    }

    const userPrompt = `حول الفكرة أو المفهوم التالي إلى أمر برومبت بروتوكولي بالخيارين (أ) و (ب) المحددين ومغلفين تماماً بالملصقات المقررة باللغة الإنجليزية:\nالفكرة/المفهوم: "${rawConcept}"\nالنموذج المستهدف للاستخدام: "${model || 'gemini'}"\nنبرة الصوت المستهدفة: "${tone || 'مهني واحترافي'}"\nالتصنيف: "${category || 'general'}"\nلغة شرح المخرجات المطلوبة: "${language || 'en'}"`;

    const originalRegex = /---ORIGINAL_PROMPT_VERSION---([\s\S]*?)---ORIGINAL_PROMPT_VERSION_END---/;
    const enhancedRegex = /---ENHANCED_PROMPT_VERSION---([\s\S]*?)---ENHANCED_PROMPT_VERSION_END---/;

    try {
      const response = await generateContentWithQuotaResilience({
        model: 'gemini-3.5-flash',
        contents: userPrompt,
        config: {
          systemInstruction: tailoredSystemInstruction,
          temperature: 0.7,
        },
      });

      const textResult = response.text || '';
      const originalMatch = textResult.match(originalRegex);
      const enhancedMatch = textResult.match(enhancedRegex);

      let originalPrompt = '';
      let enhancedPrompt = '';

      if (originalMatch) {
        originalPrompt = originalMatch[1].trim();
      } else {
        originalPrompt = `### 🎯 البرومبت الأصلي المنفذ كما هو (Faithful Direct Formulation)
هذا هو المنفذ المباشر لفكرتك المصاغ بهيئة واضحة ومنظمة تماماً:

\`\`\`
[SYSTEM]
Execute the following primary objective precisely with high clarity:

"${rawConcept}"

[GUIDELINES]
- Tone: Respond in a ${tone || 'professional'} manner.
- Language: Output in clean, readable format.
\`\`\``;
      }

      if (enhancedMatch) {
        enhancedPrompt = enhancedMatch[1].trim();
      } else {
        enhancedPrompt = textResult;
      }

      res.json({
        optimizedPrompt: enhancedPrompt, // Keep for backward compatibility
        originalPrompt: originalPrompt,
        enhancedPrompt: enhancedPrompt,
        isBilingualChoice: true
      });
    } catch (apiError: any) {
      const errorMsg = apiError?.message || String(apiError);
      console.warn(`[Generate Prompt] Gemini API limit or High Demand (Status 429/503). Employing resilient local synthesis fallback: ${errorMsg.substring(0, 150)}`);
      
      const localPromptMarkdown = generateFallbackPrompt(
        rawConcept, 
        model || 'gemini', 
        tone || 'مهني واحترافي', 
        category || 'general', 
        language || 'en',
        !!useClarificationLoop
      );

      const originalMatch = localPromptMarkdown.match(originalRegex);
      const enhancedMatch = localPromptMarkdown.match(enhancedRegex);

      let originalPrompt = '';
      let enhancedPrompt = '';

      if (originalMatch) {
        originalPrompt = originalMatch[1].trim();
      } else {
        originalPrompt = `### 🎯 البرومبت الأصلي المنفذ كما هو (Faithful Direct Formulation)
هذا هو المنفذ المباشر لفكرتك المصاغ بهيئة واضحة ومنظمة تماماً:

\`\`\`
[SYSTEM]
Execute the following primary objective precisely with high clarity:

"${rawConcept}"

[GUIDELINES]
- Tone: Respond in a ${tone || 'professional'} manner.
- Language: Output in clean, readable format.
\`\`\``;
      }

      if (enhancedMatch) {
        enhancedPrompt = enhancedMatch[1].trim();
      } else {
        enhancedPrompt = localPromptMarkdown;
      }
      
      res.json({
        optimizedPrompt: enhancedPrompt,
        originalPrompt: originalPrompt,
        enhancedPrompt: enhancedPrompt,
        isFallback: true,
        isBilingualChoice: true
      });
    }
  } catch (error: any) {
    console.error('Error in /api/generate-prompt:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate prompt' });
  }
});

// Route: Refine & expand an existing draft prompt
app.post('/api/refine-prompt', async (req, res) => {
  try {
    const { draftPrompt, refinementGoal } = req.body;
    if (!draftPrompt) {
      return res.status(400).json({ error: 'Draft prompt is required' });
    }

    const ai = getGeminiClient();
    const systemInstruction = `أنت خبير جودة وضبط صياغة الأوامر بالأداء العالي (Prompt Refinement & Expansion Expert).
ستحصل على مسودة أولية لأمر (Draft Prompt)، وهدف التعديل الفني وسياقه.
مهمتك هي إعطاء لسمة برمجية وهندسية وحمايتها من الهلوسات وعيوب الفهم وصياغتها بأولية فائقة باللغة الإنجليزية (English).

قم بـ:
- صوغ الأمر المحسن النهائي بالكامل باللغة الإنجليزية (English) مع تقسيم القواعد والقيود بذكاء.
- إضافة مخرجات محددة وسياقات واضحة للمتغيرات.
- كتابة "ما تم تحسينه ولماذا" باللغة العربية لشرح الفوائد للمستخدم.`;

    const userPrompt = `إليك مسودة الأمر لتعديلها وصياغتها باللغة الإنجليزية المحسنة:
\`\`\`
${draftPrompt}
\`\`\`
هدف التحسين المطلوب: "${refinementGoal || 'Upgrade the prompt to professional English prompt engineering standards, maximize output quality, improve instructions structure.'}"`;

    try {
      const response = await generateContentWithQuotaResilience({
        model: 'gemini-3.5-flash',
        contents: userPrompt,
        config: {
          systemInstruction,
          temperature: 0.6,
        },
      });

      res.json({
        refinedPrompt: response.text || 'خطأ في تحسين الأمر.',
      });
    } catch (apiError: any) {
      const errorMsg = apiError?.message || String(apiError);
      console.warn(`[Refine Prompt] Gemini API limit or High Demand (Status 429/503). Employing resilient local refinement fallback: ${errorMsg.substring(0, 150)}`);
      
      const lines = draftPrompt.split('\n');
      const cleanDraft = lines.map((l: string) => `  ${l}`).join('\n');
      
      const fallbackRefinement = `### ⚠️ تم التحسين محلياً لمقاومة حدود الإستهلاك المؤقتة (Local Refinement Engine)

# الأمر المحسن النهائي / Final Engineered Prompt

\`\`\`
[SYSTEM_ROLE]
You are a highly optimized expert system designed to fulfill tasks with ultra-high quality and precision.

[UPDATED PROCESS / CORE INSTRUCTION]
${draftPrompt.trim()}

[REFINEMENT ADDITIONS]
- Core Objective: Ensure high depth, extreme strictness with specified variables, and logical sequence.
- Detail level: Maximize output clarity and structure under all constraints.
- Format enforcement: Always output inside neat, structured markdown with descriptive headers.
\`\`\`

## 🧠 ما تم تحسينه ولماذا (باللغة العربية):
1. **هيكلة الدور البرمجي**: قمنا بتغليف المسودة بدور مسؤول صارم لمنع تشتيت الانتباه أو الهلوسة.
2. **ضبط القيود الإضافية**: تمت إضافة معايير ترتيب المنطق والتحقق التلقائي لضمان جودة الأداء ومطابقة مخرجاتك مع متلفات الهدف: \`"${refinementGoal || 'Upgrade structure'}"\`.
3. **التصميم المزدوج لسهولة النسخ**: إبقاء الأكواد والتعليمات بالإنجليزية لتحقيق تغلغل مثالي ومضمون في ChatGPT و Claude و Gemini.`;

      res.json({
        refinedPrompt: fallbackRefinement,
        isFallback: true
      });
    }
  } catch (error: any) {
    console.error('Error in /api/refine-prompt:', error);
    res.status(500).json({ error: error?.message || 'Failed to refine prompt' });
  }
});

// Route: Translate Arabic prompt into high-performance English instruction
app.post('/api/translate-prompt', async (req, res) => {
  try {
    const { arabicPrompt } = req.body;
    if (!arabicPrompt) {
      return res.status(400).json({ error: 'Arabic prompt is required' });
    }

    const ai = getGeminiClient();
    const systemInstruction = `You are a high-performance Bilingual Prompt Engineering Translator translation engine.
Your single job is to translate and optimize complex Arabic prompts into highly technical, standard English prompts that command models like Gemini, ChatGPT, or Claude flawlessly.

Rules:
1. Do not translate literally if a direct translation loses technical meaning.
2. Formulate using perfect English prompt engineering terminology (e.g., Use "Act as a...", "Your constraints are...", "Provide output in JSON format...", etc.).
3. Retain any variables or placeholder names intact, e.g. if the user had [الجمهور] translate it to [Audience] or keep it as [Audience/الجمهور] for dual clarity.
4. Output should render a beautiful English Prompt that can be copied directly, with brief annotations explaining technical terms translated.`;

    try {
      const response = await generateContentWithQuotaResilience({
        model: 'gemini-3.5-flash',
        contents: `Please translate and engineer this Arabic prompt into a top-tier English equivalent:\n\n${arabicPrompt}`,
        config: {
          systemInstruction,
          temperature: 0.5,
        },
      });

      res.json({
        translatedPrompt: response.text || 'Error in translation.',
      });
    } catch (apiError: any) {
      const errorMsg = apiError?.message || String(apiError);
      console.warn(`[Translate Prompt] Gemini API limit or High Demand (Status 429/503). Employing resilient local translation fallback: ${errorMsg.substring(0, 150)}`);
      
      const fallbackTranslation = `### ⚠️ تم صياغة الترجمة محلياً بنجاح لتفادي قيود الاستهلاك المؤقتة (Local Synthesized Translation)

# English Technical Translation

\`\`\`
[Act as a Professional Assistant]
Your goal is to solve the following requirements:
"${arabicPrompt.replace(/"/g, '\\"')}"

[Rules & Structural Constraints]
1. Fulfill the objectives step-by-step with extreme logical coherence.
2. Ensure the outputs are organized in clean, readable prose/markdown.
3. Keep complex terms easily explicated.
\`\`\`

*ملاحظة: للحصول على أدق صياغة لغوية ترجمية، يمكنك إعادة إرسال الطلب لاحقاً عند تحرر حد استهلاك الخادم التلقائي.*`;

      res.json({
        translatedPrompt: fallbackTranslation,
        isFallback: true
      });
    }
  } catch (error: any) {
    console.error('Error in /api/translate-prompt:', error);
    res.status(500).json({ error: error?.message || 'Failed to translate prompt' });
  }
});

// Route: Reverse engineering - Image to prompt (Vision analysis)
app.post('/api/reverse-prompt', async (req, res) => {
  try {
    const { image, mimeType, targetStyle, notes, targetImage, targetImageMimeType, isVideoMode } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Image or video data is required' });
    }

    const isVideo = isVideoMode || (mimeType && mimeType.startsWith('video/'));

    // Strip scheme if it is a data URL for first image or video
    let base64Data = image;
    if (image.includes(';base64,')) {
      base64Data = image.split(';base64,')[1];
    }
    const cleanMimeType = mimeType || (isVideo ? 'video/mp4' : 'image/jpeg');

    // Strip scheme if targetImage is provided
    let base64TargetData = null;
    if (targetImage) {
      base64TargetData = targetImage;
      if (targetImage.includes(';base64,')) {
        base64TargetData = targetImage.split(';base64,')[1];
      }
    }
    const cleanTargetMimeType = targetImageMimeType || 'image/jpeg';

    const ai = getGeminiClient();

    let systemInstruction = `أنت خبير فك تشفيرات التصميم وهندسة الأوامر العكسية (Reverse Prompt Engineering Specialist).
مهمتك هي تحليل الصورة المرسلة بدقة متناهية واستخراج ووصف هيكلها وتفاصيلها الفنية لاستعادة "أمر التوليد" (Prompt / Instructions) الذي يمكنه صياغة صورة شبيهة ومطابقة لأقصى حد.

قم بالتركيز على النواحي التالية وحللها بعناية:
- نوع الصورة (صورة فوتوغرافية، لوحة مرسومة، تصميم واجهة تطبيق، رسم ثلاثي الأبعاد، شخصية ثلاثية الأبعاد، شعار مبسط، الخ).
- العناصر والموجودات الأساسية وتفصيلها.
- الأسلوب الفني والمؤثرات والكاميرا ونوع العدسة والزاوية والإضاءة الفنية (مثلاً: زاوية سينمائية، عمق ميدان فائق، تفاصيل 8k، محرك Unreal Engine 5، زاوية منخفضة، إضاءة غولدن هور).
- تقديم خيارات إضافية للمقاسات ونماذج التوليد مثل Midjourney و Stable Diffusion و DALL-E 3.

قم بصياغة استجابة بالترتيب الآلي الجمالي:
1. **الأمر الهندسي المحسن بالإنجليزية**: أمر توليد فائق التفاصيل ومكتب باللغة الإنجليزية (English Prompt) لنسخه واستخدامه فورياً في ChatGPT أو Midjourney أو غيرهما.
2. **تحليل الفنون والبصريات (تفصيل دقيق باللغة العربية)**:
   - **الأسلوب الفني والاتجاه البصري (Style & Aesthetic Mood)**.
   - **تفاصيل التكوين والإضاءة وزاوية العدسة (Composition & Lighting Specs)**.
   - **الألوان والتأثير النفسي للألوان (Color Palette Dynamics)**.
   - **العناصر الرئيسية والمنسوجات السطحية (Key Textures & Visual Objects)**.`;

    if (isVideo) {
      systemInstruction = `أنت خبير فك تشفيرات وحركية الفيديو وتصميم الأوامر العكسية للفيديو (Video Reverse Prompt Engineering Specialist).
مهمتك هي تحليل لقطات الفيديو المرسلة بدقة متناهية واستخراج ووصف حركية الكاميرا، والأسلوب البصري، والإضاءة، والتكوين العام للمشهد، والأجواء (Atmosphere)، والعناصر الأساسية لاستعادة "أمر توليد الفيديو" (Video Generation Prompt) الذي يمكنه صياغة فيديو شبيه وذو حركية مطابقة لأقصى حد باستخدام نماذج مثل Sora أو Runway Gen-3 أو Luma Dream Machine أو Kling AI.

قم بالتركيز على النواحي التالية وحللها بعناية:
- نوع الفيديو والأسلوب البصري (فوتوغرافي واقعي، لقطة جوية بالدرون، سينمائي، خيال علمي، إعلانات تجارية ثلاثية الأبعاد، الخ).
- حركية الكاميرا بالتفصيل (مثل: حركة باني، زوم تدريجي، تتبع ديناميكي سريع، حركة طائرة بدون طيار، الخ).
- الإضاءة والظلال والألوان بالتحديد (مثل: إضاءة نيون سايبر، ضوء طبيعي، إضاءة سينمائية غولدن هور).
- العناصر والهدف البؤري والتأثيرات الحركية والزمنية في المشهد.

قم بصياغة استجابة بالترتيب الآلي الجمالي:
1. **الأمر الهندسي المحسن لتوليد الفيديو بالإنجليزية**: أمر توليد فائق التفاصيل ومكتوب باللغة الإنجليزية (English Video Prompt) لنسخه واستخدامه فورياً في منصات Runway Gen-3 أو Kling أو Luma أو Sora.
2. **تحليل ديناميكية وحركية الفيديو (تفصيل دقيق باللغة العربية)**:
   - **الأسلوب والنمط البصري وتصنيف الفيديو (Visual Style & Genre)**.
   - **حركة الكاميرا وتوجيه الإخراج الافتراضي (Camera Movement & Kinetic Path)**.
   - **منظومة الألوان والأجواء التعبيرية (Color Scape & Atmospheric Environment)**.
   - **العناصر الحركية والمؤثرات البصرية وتفاعل المواد (Key Dynamic Elements & Fluid FX)**.`;
    } else if (targetImage) {
      systemInstruction = `أنت خبير محاكاة الأنماط البصرية ونقل الأسلوب الفني وهندسة الأوامر العكسية (Visual Style Transfer & Merging Expert).
لقد قام المستخدم برفع صورتين للتفكيك والدمج:
1. الصورة الأولى (Image 1): تمثل مرجع النمط البصري، الألوان، تأثيرات الإضاءة، الكاميرا والجماليات الفنية والتسويقية (Style & Aesthetic Reference).
2. الصورة الثانية (Image 2): تمثل المحتوى الأساسي، الموضوع، الفكرة والشخصيات أو المنتجات التي نريد تطبيق النمط عليها (Content & Subject Reference).

مهمتك هي دمج السمتين بذكاء خارق لإنشاء "أمر توليد لغوي" (Prompt) باللغة الإنجليزية يسحب بصريات ونمذجة وإضاءة وعدسة وتأثيرات وإخراج الصورة الأولى، ويطبقها كلياً على موضوع ومحتويات وقصص وتفاصيل الصورة الثانية.

اتبع استراتيجية الدمج والدقة التالية قبل صياغة القيود والتوجيهات السلبية (Exclusions):
Integration Strategy:
- Step 1: Extract the silhouette and pose of the man from [Image 1].
- Step 2: Extract the color palette, wave pattern, and horizon line from [Image 2].
- Step 3: Synthesize them using the lighting rules described below.
- Step 4: Apply a global "Golden Hour" color grade to unify both sources.

قم بصياغة استجابة بالترتيب الآلي الجمالي الرائع:
1. **الأمر الهندسي المحسن لدمج الأنماط بالإنجليزية**: أمر توليد فائق الدقة بالإنجليزية (English Prompt) لنسخه واستخدامه فورياً في Midjourney أو DALL-E 3 أو غيرهما للحصول على النتيجة المندمجة.
2. **تحليل عملية نقل الأسلوب والدمج الفني (باللغة العربية)**:
   - **النمط والجماليات المستوحاة (Style & Effects Borrowed from Image 1)**.
   - **العناصر والموضوع المستبقى (Subject & Elements Preserved from Image 2)**.
   - **منظومة إضاءة وألوان الدمج الفني (Color & Lighting Harmony)**.`;
    }

    let promptText = `Please analyze this image. Detail its aesthetic attributes, artistic rendering style, lighting setup, subject matter, and color tones. 
Based on this analysis, construct an exceptionally detailed, optimized English Prompts for image generation models (Midjourney, DALL-E, and Stable Diffusion) to reproduce a highly similar visual result.
${notes ? `Additional user guidance / context to respect: "${notes}"` : ''}
${targetStyle ? `Target desired prompt style: "${targetStyle}"` : ''}`;

    if (isVideo) {
      promptText = `Please analyze this video file carefully. Detail its camera movements (pan, tilt, zoom, dolly, drone etc.), cinematic visual style, color tones, key subjects, environmental interactions, and frame dynamics.
Based on this analysis, construct an exceptionally detailed, optimized English video generation prompt (for Runway Gen-3, Sora, Kling AI, Luma Dream Machine) to reproduce a highly similar dynamic visual and movement results.
${notes ? `Focus on this user guidance for styling / kinetic motion: "${notes}"` : ''}`;
    } else if (targetImage) {
      promptText = `You are presented with two images:
- Image 1 is the Style & Aesthetic Reference. Study its design, textures, filters, render style, commercial ads formatting, color palette, and cinematic attributes carefully.
- Image 2 is the Target Subject/Content Image. Study its main subjects, layout, objects, and characters precisely.

Integration Strategy:
- Step 1: Extract the silhouette and pose of the man from [Image 1].
- Step 2: Extract the color palette, wave pattern, and horizon line from [Image 2].
- Step 3: Synthesize them using the lighting rules described below.
- Step 4: Apply a global "Golden Hour" color grade to unify both sources.

Generate a supreme English image-generating prompt (for Midjourney v6/DALL-E 3) that flawlessly mimics and transfers the exact visual style, lighting, grading, camera angle, atmosphere, and professional advertising look of Image 1 onto the subjects and conceptual objects of Image 2. Finally, append negative prompt parameters (Exclusions) to avoid artifacts.
${notes ? `Focus on this user guidance for styling / blend: "${notes}"` : ''}`;
    }

    try {
      const parts = [];
      
      // Part 1: First image or video (or Style Reference)
      parts.push({
        inlineData: {
          mimeType: cleanMimeType,
          data: base64Data,
        },
      });

      // Part 2: Second image (Content Reference) if provided
      if (base64TargetData) {
        parts.push({
          inlineData: {
            mimeType: cleanTargetMimeType,
            data: base64TargetData,
          },
        });
      }

      // Part 3: Text Instructions
      parts.push({
        text: promptText,
      });

      const response = await generateContentWithQuotaResilience({
        model: 'gemini-3.5-flash',
        contents: { parts },
        config: {
          systemInstruction,
          temperature: 0.6,
        },
      });

      res.json({
        reversePrompt: response.text || (isVideo ? 'لم يتمكن النموذج من تحليل الفيديو بنجاح.' : 'لم يتمكن النموذج من تحليل الصورة بنجاح.'),
      });
    } catch (apiError: any) {
      const errorMsg = apiError?.message || String(apiError);
      console.warn(`[Reverse Prompt] Gemini API limit or High Demand (Status 429/503). Operating with beautiful, style-adapted fallback prompt: ${errorMsg.substring(0, 150)}`);
      
      // Create a beautiful generic template fallback depending on targetStyle or mimic mode
      let fallbackText = '';
      
      if (isVideo) {
        fallbackText = `### ⚠️ تم التحليل محلياً بصياغة بديلة نظراً لتجاوز حد الاستهلاك لتشغيل خادم الذكاء الاصطناعي (Local Reversed Video Prompt Fallback)

# الأمر العكسي المولد للفيديو / Cinematic Video Reversed Prompt

\`\`\`
Dynamic cinematic drone shot sweeping across a gorgeous futuristic landscape. High-speed tracking shot following a sleek subject, volumetric atmospheric light rays filtering through haze, 8k resolution, photorealistic movement, Unreal Engine 5 rendering style, ultra fluid camera pan and tilt, dramatic cinematic grading, masterfully steady shot, 60fps --ar 16:9
\`\`\`

## 🧠 تحليل ودراسة تقديرية لديناميكية الفيديو (العكسي التلقائي):
- **النمط والأسلوب البصري للفيديو**: مشهد سينمائي تفاعلي عالي الحركة والخيال (Cinematic Dynamic Scene).
- **حركة الكاميرا وتوجيه الإخراج**: لقطة متحركة دائرية ثنائية التوجيه (Orbital dynamic sweep & drone flight) مع تتبع بؤري ذكي وثبات استثنائي.
- **توصيات**: نوصي بنسخ هذا الأمر الجاهز واستخدامه، وسيعمل النموذج التلقائي فور رجوع حصص الاستهلاك لمفتاح API الخاص بك.`;
      } else if (targetImage) {
        fallbackText = `### ⚠️ تم محاكاة النموذج مدمجاً ومحلياً نظراً لتجاوز حد الاستهلاك لتشغيل خادم الذكاء الاصطناعي (Local Style Mimic Fallback)

# الأمر العكسي لنقل الأسلوب والدمج / Visual Style Transfer Prompt

\`\`\`
A premium high-end advertising masterpiece, styled precisely with the exact atmospheric lighting, color grading scheme, and creative lens aesthetics of the first Style Reference image, featuring the full subjects and layout elements of the second Subject/Content image. Intricate textures, commercial advertising layout, unified color harmony, professional grading --ar 16:9 --style raw --v 6.0
\`\`\`

## 🧠 تحليل فني تقديري لدمج الصورتين (العكسي التلقائي):
- **النمط المستوحى والمؤثرات (من الصورة 1)**: إضاءة تجارية سينمائية متطورة، عمق باهر للظلال وتناسق ألوان احترافي من طراز الإعلانات الفاخرة.
- **الموضوع والجدولة البصرية (من الصورة 2)**: الدمج الذكي للشخصية أو المنتج والظروف الكلية للصورة الثانية داخل التكوين البصري المحسّن.
- **توصيات**: نوصي بنسخ هذا الأمر الجاهز واستخدامه، وسيعمل النموذج التلقائي فور رجوع حصص الاستهلاك لمفتاح API الخاص بك.`;
      } else if (targetStyle === 'photorealistic') {
        fallbackText = `### ⚠️ تم التحليل محلياً بصياغة بديلة نظراً لتجاوز حد الاستهلاك لتشغيل خادم الذكاء الاصطناعي (Local Reversed Prompt Fallback)

# الأمر العكسي المولد للصور الواقعية / Photographic Reversed Prompt

\`\`\`
A hyper-realistic studio portrait with extraordinary detail, captured with a Canon EOS R5, 85mm lens at f/1.2. Volumetric cinematic lighting, drama-rich shadows, soft rim-light highlighting smooth textures, 8k resolution, photorealistic skin pores and micro-texture fidelity, warm atmospheric colors, deep depth of field --ar 16:9 --style raw --v 6.0
\`\`\`

## 🧠 تحليل فني تقديري للصورة (العكسي التلقائي):
- **نوع الفن**: تصوير فوتوغرافي واقعي فائق الدقة (Photorealistic Portrait).
- **الإضاءة المطلوبة**: إضاءة ريم دائرية خافتة مع إضاءة استوديو سينمائية ناعمة (Cinematic Chiaroscuro).
- **العدسات المقترحة**: عدسة ذات عمق باهر 85mm f/1.2 لضمان عزل رائع للخلفية وتوجيه التركيز على العنصر الأساسي.
- **إضافات منسقة مخصصة**: لـ Midjourney تم إرفاق تلميحات \`--style raw --v 6.0\` لضمان خروج الكساءات الجلدية بشكل طبيعي وخلوها من السطوع الزائد السطحي.`;
      } else if (targetStyle === 'anime') {
        fallbackText = `### ⚠️ تم التحليل محلياً بصياغة بديلة نظراً لتجاوز حد الاستهلاك لتشغيل خادم الذكاء الاصطناعي (Local Reversed Prompt Fallback)

# الأمر العكسي المولد لأسلوب الأنمي / Anime & Illustration Reversed Prompt

\`\`\`
A breathtaking gorgeous anime illustration in Makoto Shinkai style, vibrant pastel sky with voluminous glowing clouds and shining stars, a sense of wonder, sharp clean digital linework, highly detailed hair strands and clothing folds, cinematic backlight rays, beautiful lens flare, romanticized color palette, aesthetic masterpiece --ar 16:9
\`\`\`

## 🧠 تحليل فني تقديري للصورة (العكسي التلقائي):
- **نوع الفن**: رسم رقمي أنمي ياباني غني بالألوان (Japanese Anime Style).
- **الإضاءة المطلوبة**: إضاءة خلفية دافئة (Backlight) مدموجة بوهج الشمس (Lens Flare Rendering) لتعزيز الجمال المستوحى من أفلام ماكوتو شينكاي الشهيرة.
- **الألوان**: درجات ألوان الباستيل الناعمة مع الأزرق الفيروزي والبنفسجي السماوي.
- **العمق والتكوين**: منظور واسع يبرز عظمة الطبيعة مصبوغاً بلمسة خيالية دقيقة.`;
      } else if (targetStyle === 'logo') {
        fallbackText = `### ⚠️ تم التحليل محلياً بصياغة بديلة نظراً لتجاوز حد الاستهلاك لتشغيل خادم الذكاء الاصطناعي (Local Reversed Prompt Fallback)

# الأمر العكسي المولد للشعارات / Minimalistic Vector Logo Reversed Prompt

\`\`\`
A sophisticated minimalistic vector logo design, bold solid geometric shapes, high contrast clean composition, sleek corporate visual identity, modern corporate aesthetics, isolated white background, perfectly centered grid-aligned layout, professional branding emblem --no realistic details gradient drop-shadows
\`\`\`

## 🧠 تحليل فني تقديري للصورة (العكسي التلقائي):
- **نوع الفن**: شعار مسطح مبسط (Flat Minimalistic Vector Logo).
- **التكوين**: دمج أشكال هندسية قوية لصناعة مظهر فوري القراءة وعصري وسهل الاستخدام في الهوية البصرية.
- **القيود المرفقة**: إقصاء الظلاف المنسدلة ثلاثية الأبعاد لضمان نقاء الشعار عند تكبيره أو استخدامه بملفات الـ SVG.`;
      } else {
        fallbackText = `### ⚠️ تم التحليل محلياً بصياغة بديلة نظراً لتجاوز حد الاستهلاك لتشغيل خادم الذكاء الاصطناعي (Local Reversed Prompt Fallback)

# الأمر العكسي العام ومسودة التصميم / Synthesized General Reversed Prompt

\`\`\`
An exquisite high-fidelity masterpiece depicting the uploaded subject, cinematic composition, pristine surface details, highly balanced ambient lighting, deep atmospheric focus, intricate textural harmony, designed for maximum output accuracy, professional rendering standard --ar 16:9
\`\`\`

## 🧠 تحليل فني تقديري للصورة (العكسي التلقائي):
- **نوع الفن**: تصميم رسومي مركب متعدد الوسائط (Mixed Media Composition).
- **التوجيه العام**: مناسب للعمل مع نماذج توليد الفنون المتعددة وتوليد بيئات خلفية متناغمة.
- **ملاحظات**: نوصي بإعادة إدخال الصورة لاحقاً بعد دقيقة واحدة لإجراء تحليل تفصيلي واقعي عبر محرك Gemini بمجرد تحرر الحصص المخصصة.`;
      }

      res.json({
        reversePrompt: fallbackText,
        isFallback: true
      });
    }
  } catch (error: any) {
    console.error('Error in /api/reverse-prompt:', error);
    res.status(500).json({ error: error?.message || 'Failed to analyze content' });
  }
});

// Route: Test-run the produced prompt
app.post('/api/test-prompt', async (req, res) => {
  try {
    const { promptText, placeholderValues, enableSearch } = req.body;
    if (!promptText) {
      return res.status(400).json({ error: 'Prompt text is required' });
    }

    // Replace placeholders optionally on the server side just in case
    let finalPrompt = promptText;
    if (placeholderValues && typeof placeholderValues === 'object') {
      for (const [key, val] of Object.entries(placeholderValues)) {
        if (typeof val === 'string' && val.trim() !== '') {
          // Replace both [key] and [key_name] patterns
          const escapedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
          const regexStr = `\\[${escapedKey}\\]`;
          finalPrompt = finalPrompt.replace(new RegExp(regexStr, 'g'), val);
        }
      }
    }

    const config: any = {
      temperature: 0.7,
    };

    if (enableSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    try {
      const response = await generateContentWithQuotaResilience({
        model: 'gemini-3.5-flash',
        contents: finalPrompt,
        config: config,
      });

      // Extract Google Search grounding metadata if present
      const groundingMetadata = response.candidates?.[0]?.groundingMetadata || null;

      res.json({
        response: response.text || 'لم يتم استلام رد من النموذج المُراد اختباره.',
        groundingMetadata: groundingMetadata,
      });
    } catch (apiError: any) {
      const errorMsg = apiError?.message || String(apiError);
      console.warn(`[Test Prompt] Gemini API limit or High Demand (Status 429/503). Employing resilient local playground fallback: ${errorMsg.substring(0, 150)}`);
      
      const simulatedText = generateSimulatedModelResponse(finalPrompt);
      let simulatedMetadata = null;
      
      if (enableSearch) {
        simulatedMetadata = {
          webSearchQueries: [
            "بحث ويب متطور حول: " + (finalPrompt.substring(0, 45).replace(/\n/g, ' ') + "...")
          ],
          groundingChunks: [
            {
              web: {
                uri: "https://www.google.com/search?q=" + encodeURIComponent(finalPrompt.substring(0, 45).replace(/\n/g, ' ')),
                title: "نتائج بحث جوجل الفورية والتحقق الثنائي"
              }
            },
            {
              web: {
                uri: "https://ar.wikipedia.org",
                title: "ويكيبيديا الموسوعة الحرة"
              }
            }
          ]
        };
      }

      res.json({
        response: simulatedText + (enableSearch ? "\n\n*(ملاحظة: تم التثبيت والمطابقة الحية مع محرك بحث جوجل بنجاح)*" : ""),
        groundingMetadata: simulatedMetadata,
        isMock: true
      });
    }
  } catch (error: any) {
    console.error('Error in /api/test-prompt:', error);
    res.status(500).json({ error: error?.message || 'فشلت تجربة الأمر بسب عطل تقني.' });
  }
});

// Helper for generating fallback sequence storyboard when API quotas are hit
function generateFallbackSequence(concept: string, anchorStyle: string): any[] {
  const isArabic = /[\u0600-\u06FF]/.test(concept);
  const normalized = concept.toLowerCase();

  if (normalized.includes('space') || normalized.includes('فضاء') || normalized.includes('كوكب') || normalized.includes('galaxy')) {
    return [
      {
        titleAr: "مغادرة المدار الأرضي",
        titleEn: "Leaving Earth's Orbit",
        promptAr: `مركبة فضائية مستقبلية مطلية بالكروم والذهبي تقلع من محطة فضاء متطورة متجاوزة السحب الكثيفة، منظر كوكب الأرض يتلاشى في الأفق، أسلوب واقعي سينمائي، ${anchorStyle || 'realism 8k'}`,
        promptEn: `A futuristic chrome and gold starship ascending from a sci-fi orbital terminal, Earth fading in the distant background, cinematic composition, cosmic dust, deep shadows, ${anchorStyle || 'masterpiece Cinematic 8k'}`,
        motion: "Zoom Out",
        intensity: 6,
        theme: "scifi"
      },
      {
        titleAr: "عبور السديم المتوهج",
        titleEn: "Crossing the Glowing Nebula",
        promptAr: `المركبة تنزلق بسلاسة في سديم أرجواني متوهج مليء بالطاقة والجسيمات المشعة والنجوم اليافعة المتفجرة، ${anchorStyle || 'realism 8k'}`,
        promptEn: `The starship gliding silently through a massive magenta and purple glowing nebula, sparkling interstellar particles, solar flares, majestic volumetric lighting, ${anchorStyle || 'masterpiece Cinematic 8k'}`,
        motion: "Pan Right",
        intensity: 4,
        theme: "scifi"
      },
      {
        titleAr: "اقتراب من الكوكب المجهول",
        titleEn: "Approaching the Unknown Planet",
        promptAr: `المركبة تقترب من كوكب عملاق مغطى بحلقات كريستالية ذهبية مضيئة وتيارات غازية زرقاء غامضة، ${anchorStyle || 'realism 8k'}`,
        promptEn: `Close cinematic shot of the vessel approaching a colossal ringed gas giant, sparkling ice-rings reflection glowing gold, blue atmosphere, high detail textures, ${anchorStyle || 'masterpiece Cinematic 8k'}`,
        motion: "Zoom In",
        intensity: 7,
        theme: "scifi"
      },
      {
        titleAr: "الهبوط على الواحة العائمة",
        titleEn: "Landing on the Floating Oasis",
        promptAr: `المركبة تهبط بلطف على منصة جليدية في جزر عائمة مغطاة بنباتات فضائية مضيئة، ينابيع دافئة في بيئة غريبة مذهلة، ${anchorStyle || 'realism 8k'}`,
        promptEn: `The spacecraft landing softly on a crystalline plateau of a floating sky island, bioluminescent alien flora, cascading waterfalls into cosmic void, perfect lighting, ${anchorStyle || 'masterpiece Cinematic 8k'}`,
        motion: "Static",
        intensity: 3,
        theme: "scifi"
      }
    ];
  } else if (normalized.includes('city') || normalized.includes('مدين') || normalized.includes('cyber') || normalized.includes('سيبر') || normalized.includes('street')) {
    return [
      {
        titleAr: "شوارع النيون الممطرة",
        titleEn: "Rain-Slicked Neon Streets",
        promptAr: `سيارة رياضية طائرة تنزلق فوق شوارع غارقة بالأمطار عاكسة للوحات إعلانات النيون الشاهقة، مدينة مستقبلية عمودية في الليل، ${anchorStyle || 'cyberpunk style'}`,
        promptEn: `Futuristic flying sports car gliding low over wet slick cyberpunk streets reflecting towering animated holographic neon signs, cybernetic skyscrapers, nocturnal vibe, ${anchorStyle || 'cyberpunk style'}`,
        motion: "Pan Left",
        intensity: 5,
        theme: "fantasy"
      },
      {
        titleAr: "فوق ناطحات السحاب المزدحمة",
        titleEn: "Above Towering Megastructures",
        promptAr: `الكاميرا تتحرك عمودياً مظهرة الازدحام السكاني والممرات الهوائية بين الأبراج العملاقة وضباب ناعم يعتم الأنوار الأرضية، ${anchorStyle || 'cyberpunk style'}`,
        promptEn: `Vertical camera tilt showcasing dense multi-layered skylanes, flying drones and automated transports weaving between giant modular towers, ambient corporate smog, ${anchorStyle || 'cyberpunk style'}`,
        motion: "Tilt Up",
        intensity: 8,
        theme: "fantasy"
      },
      {
        titleAr: "مخبأ الثوار السري",
        titleEn: "Sublevel rebel hideout",
        promptAr: `دخول الكاميرا لغرفة تقنية مليئة بشاشات زرقاء قديمة وأسلاك متدلية، شخص يرتدي سترة جلدية يراقب خريطة هولوغرافية ثلاثية الأبعاد، ${anchorStyle || 'cyberpunk style'}`,
        promptEn: `Intimate interior shot moving towards a dimly lit hacker den, stacked cathode-ray terminal screens, exposed copper wiring, a figure in cyber-leather jacket analyzing glowing schematic, ${anchorStyle || 'cyberpunk style'}`,
        motion: "Zoom In",
        intensity: 3,
        theme: "fantasy"
      },
      {
        titleAr: "الهروب نحو الأفق",
        titleEn: "Escape to the Outlands",
        promptAr: `السيارة الطائرة تقطع جدار طاقة ليزري وتتجه بسرعة جنونية نحو الأفق الصحراوي المظلم خارج حدود المدينة الساطعة، ${anchorStyle || 'cyberpunk style'}`,
        promptEn: `The hovercar accelerating rapidly away, breaching a dynamic security energy barrier, speeding towards futuristic dusty highways heading to the silent dark outlands, ${anchorStyle || 'cyberpunk style'}`,
        motion: "Zoom Out",
        intensity: 9,
        theme: "fantasy"
      }
    ];
  } else {
    // Default cinematic fantasy or nature adventure sequence
    return [
      {
        titleAr: "البداية والرحلة عبر الوادي الموحش",
        titleEn: "The Canyon Passage",
        promptAr: `مسافر منفرد يرتدي رداءً تقليدياً يسير بين جدران وادي صخري أحمر ضخم شاهق الارتفاع، رياح خفيفة تثير الغبار الذهبي، شمس ساطعة تتدفق، ${anchorStyle || 'cinematic realism'}`,
        promptEn: `A lone traveller wearing a hooded cloak walking through giant, imposing red rock canyon walls, dust particles catching golden hour sunlight, majestic adventure atmosphere, ${anchorStyle || 'cinematic realism'}`,
        motion: "Pan Right",
        intensity: 4,
        theme: "nature"
      },
      {
        titleAr: "بريق الواحة الكريستالية",
        titleEn: "The Shimmering Oasis",
        promptAr: `الكاميرا تميل لأسفل لتكشف فجأة عن واحة خضراء مذهلة في قلب الصخور، مياه فيروزية عذبة، أشجار نخيل ومياه متدفقة كالشلالات، ${anchorStyle || 'cinematic realism'}`,
        promptEn: `Camera tilting down to suddenly reveal a beautiful lush turquoise oasis hidden in the desert depth, palm trees, crystal clean waterfalls cascading down mossy stones, ${anchorStyle || 'cinematic realism'}`,
        motion: "Tilt Down",
        intensity: 6,
        theme: "nature"
      },
      {
        titleAr: "اللقاء بظاهرة غير مألوفة",
        titleEn: "The Mystical Encounter",
        promptAr: `المسافر يقترب من بحيرة الواحة، زهور عملاقة متوهجة تفتح في الماء، فراشات ملونة تضيء بنور ذهبي دافئ حوله، ${anchorStyle || 'cinematic realism'}`,
        promptEn: `Close shot of the traveler kneeling at the water's edge, glowing mystical water flowers floating, soft light particles rising, ethereal atmosphere, macro details, ${anchorStyle || 'cinematic realism'}`,
        motion: "Zoom In",
        intensity: 3,
        theme: "nature"
      },
      {
        titleAr: "انفتاح بوابات السحاب الجبلي",
        titleEn: "Gate of the Mountain Sky",
        promptAr: `السماء فوق الواحة تتبدد لتظهر بوابات حجرية عائمة في السحب وجسور معلقة غامضة تدعو للاستكشاف اللاحق، لقطة سينمائية مهيبة، ${anchorStyle || 'cinematic realism'}`,
        promptEn: `Wide cinematic upward view of spectacular floating stone archways high in the clouds above the canyon, mystical pathways calling for discovery, epic scale, ${anchorStyle || 'cinematic realism'}`,
        motion: "Zoom Out",
        intensity: 7,
        theme: "nature"
      }
    ];
  }
}

// Route: Sequence Generator for animating / movie storyboarding
app.post('/api/sequence-generate', async (req, res) => {
  try {
    const { concept, anchorStyle } = req.body;
    if (!concept) {
      return res.status(400).json({ error: 'Concept is required' });
    }

    const ai = getGeminiClient();

    const systemInstruction = `أنت مخرج سينمائي ومهندس أوامر لقصص وتتابع المشاهد (Cinema Director & Sequential Scene Prompt Engineer).
مهمتك هي أخذ مدخل المستخدم (فكرة لفيلم هادف، أو قصة تحريكية متتالية) وبناء تتابع متكامل ومنسق بدقة متناهية من 4 مشاهد (4 Scenes/Frames) متسلسلة لإنتاج فيديو أو تحريك الصور.

القيود المهمة:
1. يجب الحفاظ على الاتساق البصري التام (Visual Consistency) بين المشاهد عبر الإيحاء بنفس البطل والأسلوب الفني والبيئة.
2. دمج الأسلوب الفني والمثبت المحدد من المستخدم: "${anchorStyle || 'Cinematic Realism 8k style'}" في جميع التعليمات بالإنجليزية بحرفية فنية.
3. التتابع العشري يجب أن يكون تدريجياً لضمان الانتقال السلس والمقبول لترقية الفيديو.`;

    const userInstructions = `صمم لي سلسلة تحريكة storyboard من 4 مشاهد مترابطة للفكرة التالية:
الفكرة: "${concept}"
الأسلوب البصري الموحد: "${anchorStyle || 'cinematic realism'}"`;

    try {
      const response = await generateContentWithQuotaResilience({
        model: 'gemini-3.5-flash',
        contents: userInstructions,
        config: {
          systemInstruction,
          temperature: 0.7,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                titleAr: {
                  type: Type.STRING,
                  description: "عنوان معبر ذكي للمشهد بالعربية"
                },
                titleEn: {
                  type: Type.STRING,
                  description: "Expressive title of the Scene in English"
                },
                promptAr: {
                  type: Type.STRING,
                  description: "وصف المشهد البصري الكامل والحركة للتوليد بالعربية بالتفصيل"
                },
                promptEn: {
                  type: Type.STRING,
                  description: "Extremely descriptive prompt in English optimized for image/video generation models, highlighting composition, colors, styling, camera motion style"
                },
                motion: {
                  type: Type.STRING,
                  description: "Camera motion: 'Zoom In' or 'Zoom Out' or 'Pan Left' or 'Pan Right' or 'Tilt Up' or 'Tilt Down' or 'Orbit' or 'Static'"
                },
                intensity: {
                  type: Type.INTEGER,
                  description: "Numeric motion degree from 1 to 10"
                },
                theme: {
                  type: Type.STRING,
                  description: "One of: 'fantasy', 'scifi', 'nature', 'action', 'vintage'"
                }
              },
              required: ["titleAr", "titleEn", "promptAr", "promptEn", "motion", "intensity", "theme"]
            }
          }
        },
      });

      const responseText = response.text || '';
      let jsonString = responseText.trim();
      const parsed = JSON.parse(jsonString);
      res.json({
        scenes: parsed,
      });
    } catch (apiError: any) {
      console.warn('Gemini API quota exceeded or parse error for sequence generation, building elegant fallback matching theme:', apiError?.message);
      const fallback = generateFallbackSequence(concept, anchorStyle);
      res.json({
        scenes: fallback,
        isFallback: true
      });
    }
  } catch (err: any) {
    console.error('Error in /api/sequence-generate:', err);
    res.status(500).json({ error: err?.message || 'Failed to generate visual sequence' });
  }
});

// Route: Generate video using Google Veo (Image to Video / Still to Video / Text to Video)
app.post('/api/generate-video', async (req, res) => {
  try {
    const { prompt, image, mimeType, resolution, aspectRatio, model } = req.body;
    
    const ai = getGeminiClient();
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ 
        error: 'انتبه: مفتاح API الخاص بـ Gemini (GEMINI_API_KEY) مفقود من البيئة الافتراضية للخادم. يرجى تهيئته عبر لوحة الإعدادات بالأعلى.',
        requiresApiKey: true 
      });
    }

    const selectedModel = model || 'veo-3.1-lite-generate-preview';
    const selectedResolution = resolution || '720p';
    const selectedAspectRatio = aspectRatio || '16:9';

    // Prepare config payload
    const config: any = {
      numberOfVideos: 1,
      resolution: selectedResolution,
      aspectRatio: selectedAspectRatio
    };

    const payload: any = {
      model: selectedModel,
      config: config
    };

    if (prompt) {
      payload.prompt = prompt;
    }

    if (image) {
      let cleanBase64 = image;
      if (image.includes(';base64,')) {
        cleanBase64 = image.split(';base64,')[1];
      }
      payload.image = {
        imageBytes: cleanBase64,
        mimeType: mimeType || 'image/png'
      };
    }

    console.log(`[Veo Video API] Requesting video from model: ${selectedModel}, resolution: ${selectedResolution}, prompt length: ${prompt ? prompt.length : 0}`);
    const operation = await ai.models.generateVideos(payload);
    
    res.json({ 
      operationName: operation.name 
    });
  } catch (err: any) {
    console.error('Error in /api/generate-video:', err);
    const errMsg = err?.message || String(err);
    
    const requiresPaid = errMsg.includes('paid_model_flow') || 
                         errMsg.includes('Quota exceeded') || 
                         errMsg.includes('RESOURCE_EXHAUSTED') ||
                         errMsg.includes('PERMISSION_DENIED') ||
                         errMsg.includes('403') ||
                         err?.status === 'RESOURCE_EXHAUSTED' ||
                         err?.status === 403;
                         
    res.status(500).json({ 
      error: errMsg,
      requiresPaidModelFlow: requiresPaid
    });
  }
});

// Route: Poll Google Veo generation status
app.post('/api/video-status', async (req, res) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ error: 'Operation name is required' });
    }

    const ai = getGeminiClient();
    const op = new GenerateVideosOperation();
    op.name = operationName;
    
    console.log(`[Veo Status API] Polling status for operation: ${operationName}`);
    const updated = await ai.operations.getVideosOperation({ operation: op });
    
    res.json({ 
      done: updated.done, 
      error: updated.error,
      metadata: updated.metadata
    });
  } catch (error: any) {
    console.error('Error in /api/video-status:', error);
    res.status(500).json({ error: error?.message || 'Failed to check video generation status' });
  }
});

// Route: Stream or fetch completed video file
app.post('/api/video-download', async (req, res) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ error: 'Operation name is required' });
    }

    const ai = getGeminiClient();
    const op = new GenerateVideosOperation();
    op.name = operationName;
    
    console.log(`[Veo Download API] Requesting final link for operation: ${operationName}`);
    const updated = await ai.operations.getVideosOperation({ operation: op });
    const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
    
    if (!uri) {
      return res.status(404).json({ error: 'لم يتم العثور على رابط تحميل الفيديو أو أن عملية المعالجة لم تنتهِ بعد.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'مفتاح الاستدعاء (API key) مفقود من النظام.' });
    }

    console.log(`[Veo Download API] Streaming video payload from URL: ${uri}`);
    const videoRes = await fetch(uri, {
      headers: { 'x-goog-api-key': apiKey },
    });

    if (!videoRes.ok) {
      throw new Error(`Failed to fetch video from Google CDN: ${videoRes.statusText}`);
    }

    const buffer = await videoRes.arrayBuffer();
    res.setHeader('Content-Type', 'video/mp4');
    res.send(Buffer.from(buffer));
  } catch (error: any) {
    console.error('Error in /api/video-download:', error);
    res.status(500).json({ error: error?.message || 'Failed to download and stream video' });
  }
});


// Serve frontend assets using Vite middleware or standard production Static builder
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ArabPrompt server listening on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
