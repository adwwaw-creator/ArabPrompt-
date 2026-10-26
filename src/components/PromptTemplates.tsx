/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Copy, Check, Sparkles, Filter, Code2, TrendingUp, 
  Megaphone, Share2, Briefcase, Feather, GraduationCap, 
  ExternalLink, Star, Sliders, RotateCcw, ArrowRight, ArrowLeft,
  SlidersHorizontal, CheckCircle2, Bookmark, Eye, Terminal,
  Cpu, Zap, Compass, ChevronDown, ChevronUp
} from 'lucide-react';
import { AppLanguage, ModelType, ActiveTab } from '../types';

export interface TemplateVariable {
  id: string;
  nameAr: string;
  nameEn: string;
  placeholderAr: string;
  placeholderEn: string;
  defaultVal: string;
}

export interface PromptTemplateItem {
  id: string;
  category: 'seo' | 'marketing' | 'coding' | 'social' | 'business' | 'creative' | 'academic';
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  model: ModelType;
  tone: string;
  difficulty: 'مبتدئ' | 'متوسط' | 'متقدم';
  tags: string[];
  variables: TemplateVariable[];
  promptTemplateAr: string;
  promptTemplateEn: string;
}

interface PromptTemplatesProps {
  lang: AppLanguage;
  onSendToBuilder: (promptText: string, model?: ModelType, tone?: string, category?: string) => void;
  onNavigateTab?: (tab: ActiveTab) => void;
}

const TEMPLATES: PromptTemplateItem[] = [
  // 1. SEO & Growth
  {
    id: 'seo-cluster',
    category: 'seo',
    titleAr: 'بناء استراتيجية مجموعات الكلمات المفتاحية ومحتوى الركائز (Topic Clusters)',
    titleEn: 'Topic Clusters & Pillar Content Keyword Architecture',
    descriptionAr: 'هندسة خطة محتوى متكاملة تستهدف الهيمنة على نتائج بحث Google عبر ركائز رئيسية وعناقيد داعمة.',
    descriptionEn: 'Architect an authoritative topic cluster strategy with pillar pages and supporting cluster articles for Google dominance.',
    model: 'gemini',
    tone: 'استشاري وخبير SEO',
    difficulty: 'متقدم',
    tags: ['SEO', 'Keyword Research', 'Topic Clusters', 'E-E-A-T'],
    variables: [
      { id: 'niche', nameAr: 'المجال / التخصص', nameEn: 'Niche / Industry', placeholderAr: 'مثال: التجارة الإلكترونية، الذكاء الاصطناعي للأعمال', placeholderEn: 'e.g. E-commerce logistics, AI in B2B', defaultVal: 'التجارة الإلكترونية والدروبشيبينغ' },
      { id: 'target_audience', nameAr: 'الجمهور المستهدف', nameEn: 'Target Audience', placeholderAr: 'مثال: رواد الأعمال المبتدئين في الخليج', placeholderEn: 'e.g. Early-stage startup founders', defaultVal: 'رواد الأعمال وأصحاب المتاجر في الشرق الأوسط' },
      { id: 'primary_goal', nameAr: 'الهدف الرئيسي', nameEn: 'Primary Goal', placeholderAr: 'مثال: رفع الزيارات المجانية واكتساب العملاء', placeholderEn: 'e.g. Attract high-intent search traffic', defaultVal: 'زيادة حركة الزيارات المجانية وتحقيق المبيعات' }
    ],
    promptTemplateAr: `بصفتك كبير استشاريي تحسين محركات البحث (SEO Director) المتخصص في استراتيجيات معايير Google E-E-A-T:

المجال المستهدف: {{niche}}
الجمهور المستهدف: {{target_audience}}
الهدف الأساسي: {{primary_goal}}

المطلوب إعداد استراتيجية Topic Clusters تفصيلية في جدول منظم تشمل:
1. تحديد 3 صفحات ركيزة رئيسية (Pillar Pages) ذات نية بحث عريضة (Commercial / Informational).
2. لكل صفحة ركيزة، حدد 5 عناقيد محتوى فرعية (Cluster Topics) تستهدف كلمات مفتاحية دقيقة (Long-tail Keywords) مع توضيح نية البحث (Search Intent) وصعوبة المنافسة المتوقعة.
3. خطة الروابط الداخلية (Internal Linking Architecture) لتدوير سلطة الدومين بين المقالات الداعمة والصفحة الأساسية.
4. مخطط Schema Markup مقترح وكلمات LSI ذات الصلة الدلالية لتغطية الكيان المعرفي كاملاً.`,
    promptTemplateEn: `Act as a Senior SEO Director specializing in modern semantic search and Google E-E-A-T architecture:

Niche: {{niche}}
Target Audience: {{target_audience}}
Primary Objective: {{primary_goal}}

Deliver a comprehensive Topic Cluster Blueprint in markdown tables:
1. 3 Core Pillar Pages targeting broad-intent head terms (Commercial & Informational).
2. 5 Supporting Sub-Cluster Articles per Pillar Page targeting high-intent long-tail keywords, explicitly noting Search Intent (Informational, Transactional) and estimated KD difficulty.
3. Internal linking flow architecture defining how link equity should circulate between clusters and pillars.
4. Recommended Structured Data (Schema markup) and semantic LSI entities to establish comprehensive entity authority.`
  },
  {
    id: 'seo-eeat-article',
    category: 'seo',
    titleAr: 'صياغة مقال متكامل متوافق 100% مع معايير E-E-A-T وتحديثات Google المفيدة',
    titleEn: 'High-Authority E-E-A-T Long-Form Article Generator',
    descriptionAr: 'كتابة مقال تحليلي عميق يظهر الخبرة العملية، المصداقية، وتنسيقات الاقتباس والمصادر الموثوقة.',
    descriptionEn: 'Generate an in-depth, original article adhering to Google Helpful Content & E-E-A-T standards with practical data.',
    model: 'claude',
    tone: 'أكاديمي تحليلي وموثوق',
    difficulty: 'متقدم',
    tags: ['Helpful Content', 'E-E-A-T', 'Blogging', 'Google Ranking'],
    variables: [
      { id: 'keyword', nameAr: 'الكلمة المفتاحية الرئيسية', nameEn: 'Target Keyword', placeholderAr: 'مثال: أفضل استراتيجيات التسويق بالمحتوى 2026', placeholderEn: 'e.g. Next-Gen Cloud Security Protocols', defaultVal: 'أفضل استراتيجيات التسويق بالمحتوى لعام 2026' },
      { id: 'author_exp', nameAr: 'خبرة الكاتب / الزاوية الحصرية', nameEn: 'Author Experience / Unique Angle', placeholderAr: 'مثال: دراسة حالة على 50 حملة إعلانية حقيقية', placeholderEn: 'e.g. Case study with 10k production nodes', defaultVal: 'تحليل عملي مستند إلى تجارب حقيقية وبيانات ميدانية' },
      { id: 'word_count', nameAr: 'طول المقال التقريبي', nameEn: 'Target Length', placeholderAr: 'مثال: 1800 كلمة', placeholderEn: 'e.g. 1500 words', defaultVal: '1500 - 2000 كلمة' }
    ],
    promptTemplateAr: `اكتب مقالاً تحليلياً استثنائياً ومرجعياً حول: "{{keyword}}".

معايير الجودة والإخراج:
- تبنّ زاوية الخبرة الميدانية الحقيقية: "{{author_exp}}".
- الطول المستهدف: {{word_count}}.
- الهيكل:
  * عنوان رئيسي (H1) فائق الجاذبية والوضوح متضمن الكلمة المفتاحية.
  * ملخص تنفيذي (Key Takeaways) في 3 نقاط محورية سريعة للقارئ المستعجل.
  * عناوين فرعية (H2, H3) تجيب بدقة وبدون حشو أو لغو مكرر على استفسارات المستخدم.
  * فقرة "تجارب وأخطاء شائعة تجنب الوقوع فيها" لإبراز المصداقية والتجربة الشخصية (Experience).
  * جدول مقارنة إحصائي أو خطوات عملية قابلة للتنفيذ فوراً.
  * قسم أسئلة شائعة (FAQ) مع إجابات موجزة متوافقة مع مقتطفات Google المتميزة (Featured Snippets).`,
    promptTemplateEn: `Write an authoritative, reference-grade deep-dive guide on: "{{keyword}}".

Strict Quality Constraints:
- Adopt the practitioner persona with real-world empirical proof: "{{author_exp}}".
- Target Word Count: {{word_count}}.
- Structure:
  * High-CTR, descriptive H1 title containing the exact keyword without clickbait.
  * Executive Takeaways bullet box at the very top for high dwell-time satisfaction.
  * Structured H2 & H3 hierarchy answering sub-queries with zero redundant fluff.
  * "Field Experiments & Lessons Learned" section providing genuine first-hand Experience signals.
  * Actionable step-by-step checklist or comparative benchmark table.
  * Concise FAQ section crafted to capture Google Featured Snippets and People Also Ask questions.`
  },

  // 2. Marketing & Copywriting
  {
    id: 'mkt-pas-ad',
    category: 'marketing',
    titleAr: 'صياغة نصوص إعلانات ممولة بنموذج PAS (المشكلة - التحفيز - الحل)',
    titleEn: 'PAS Framework High-Converting Paid Social Ad Copy',
    descriptionAr: 'كتابة نصوص إعلانات لمنصات Meta و TikTok تشد الانتباه من أول ثانيتين وتحفز على الشراء الفوري.',
    descriptionEn: 'Produce high-converting ad copy for Meta and TikTok leveraging the Problem-Agitate-Solution psychological framework.',
    model: 'gemini',
    tone: 'تسويقي إقناعي وجذاب',
    difficulty: 'مبتدئ',
    tags: ['Meta Ads', 'TikTok Ads', 'PAS Copywriting', 'Conversion'],
    variables: [
      { id: 'product_name', nameAr: 'اسم المنتج أو الخدمة', nameEn: 'Product / Service Name', placeholderAr: 'مثال: نظام إدارة المشاريع الذكي TaskFlow', placeholderEn: 'e.g. OmniFlow CRM', defaultVal: 'تطبيق تنظيم المهام الذكي TaskPro' },
      { id: 'pain_point', nameAr: 'نقطة الألم والمعاناة الحالية', nameEn: 'Customer Pain Point', placeholderAr: 'مثال: ضياع الوقت وتشتت الفريق بين عدة تطبيقات', placeholderEn: 'e.g. Wasting 15 hrs/week in context switching', defaultVal: 'تشتت المهام وضياع المواعيد النهائية بين الرسائل المتفرقة' },
      { id: 'offer', nameAr: 'العرض والحافز (Offer & CTA)', nameEn: 'Offer & CTA', placeholderAr: 'مثال: تجربة مجانية 14 يوماً بدون بطاقة', placeholderEn: 'e.g. 14-day free trial no credit card required', defaultVal: 'تجربة مجانية لمدة 14 يوماً مع تدريب مجاني لفريقك' }
    ],
    promptTemplateAr: `بصفتك كاتب إعلانات محترف (Direct Response Copywriter) حائز على جوائز في تحقيق أعلى عوائد إعلانية (ROAS):

المنتج/الخدمة: {{product_name}}
المشكلة الأساسية للعميل: {{pain_point}}
العرض والدعوة لاتخاذ إجراء: {{offer}}

المطلوب كتابة 3 نماذج إعلانية إبداعية مختلفة بنموذج PAS:
النموذج 1: أسلوب الخطاف الصادم والقصير لمنصة TikTok و Instagram Reels (يشمل التوجيهات البصرية للثواني الثلاث الأولى).
النموذج 2: نص إعلاني سردي (Storytelling) لفيسبوك وإنستغرام يروي معاناة العميل وكيف وجد الحل.
النموذج 3: نص مباشر وموجز يركز على الأرقام والعائد السريع على الاستثمار (ROI).

لكل نموذج، وفر 3 خطافات بديلة (Hook Options) وعنوان رئيسي مغناطيسي (Headline) وزر CTA واضح.`,
    promptTemplateEn: `Act as an elite Direct Response Copywriter specialized in driving record-breaking ROAS across Meta, TikTok, and YouTube:

Product / Service: {{product_name}}
Core Customer Frustration: {{pain_point}}
Offer & Call-to-Action: {{offer}}

Produce 3 distinct high-converting ad variations using the PAS (Problem-Agitate-Solution) framework:
Variation 1: Fast-paced Short-Form Video script (TikTok/Reels) with visual direction for the first 3-second hook.
Variation 2: Narrative Story-driven feed copy for Meta illustrating the transition from frustration to relief.
Variation 3: Punchy, metric-driven B2B copy emphasizing quantifiable ROI and friction-free onboarding.

Provide 3 scroll-stopping hook alternatives and a crisp CTA button label for each variation.`
  },
  {
    id: 'mkt-landing-page',
    category: 'marketing',
    titleAr: 'هندسة محتوى صفحة هبوط SaaS ذات معدل تحويل مرتفع (AIDA Framework)',
    titleEn: 'High-Converting SaaS Landing Page Complete Architecture',
    descriptionAr: 'صياغة نصوص جميع أقسام صفحة الهبوط من قسم الهيرو حتى تذييل الصفحة مع إزالة اعتراضات الشراء.',
    descriptionEn: 'Craft complete copy for all landing page sections from Hero to Social Proof and Objection-killing FAQs.',
    model: 'claude',
    tone: 'احترافي وجذاب وثاقب',
    difficulty: 'متقدم',
    tags: ['Landing Page', 'SaaS Copywriting', 'Conversion Rate', 'AIDA'],
    variables: [
      { id: 'solution_name', nameAr: 'اسم المنصة أو الحل', nameEn: 'SaaS Platform Name', placeholderAr: 'مثال: منصة ركاز لتحليل العقود القانونية', placeholderEn: 'e.g. LegalPulse AI', defaultVal: 'منصة فلو لتحليل العقود الذكية' },
      { id: 'target_b2b', nameAr: 'شريحة العملاء المستهدفة', nameEn: 'Target B2B Segment', placeholderAr: 'مثال: المحامون ومديرو الإدارات القانونية', placeholderEn: 'e.g. Legal counsels & corporate directors', defaultVal: 'مديرو الإدارات القانونية والمحامون المستقلون' },
      { id: 'key_benefit', nameAr: 'الميزة التنافسية الأكبر', nameEn: 'Core Unique Benefit', placeholderAr: 'مثال: مراجعة العقود في دقيقتين بدلاً من 4 ساعات', placeholderEn: 'e.g. Review 50-page contracts in 90 seconds', defaultVal: 'مراجعة وكشف ثغرات العقود في 90 ثانية بدقة 99%' }
    ],
    promptTemplateAr: `بصفتك خبير استراتيجيات تحويل صفحات الهبوط (CRO & Landing Page Copywriter):

اسم الحل: {{solution_name}}
الشريحة المستهدفة: {{target_b2b}}
الفائدة التنافسية الكبرى: {{key_benefit}}

قم بصياغة نصوص صفحة الهبوط بالكامل وفق أفضل ممارسات التحويل الرقمي:
1. قسم الهيرو (Hero Section):
   - شارة جذب علوية (Badge).
   - عنوان رئيسي (H1) قوي يركز على النتيجة وليس الميزة.
   - عنوان فرعي داعم من سطرين يوضح كيفية العمل.
   - زر اتخاذ إجراء أساسي وثانوي (Primary & Secondary CTA) مع نص تخفيف المخاطر (مثال: لا حاجة لبطاقة ائتمانية).
2. شريط إثبات المصداقية (Social Proof Bar): صيغ أرقام وشهادات موثوقة.
3. قسم المشكلة والمفارقة (Before vs. After): جدول أو نقاط تبرز تكلفة عدم استخدام الحل.
4. قسم الميزات المحولة لفوائد (Feature-to-Benefit Matrix): 3 ميزات رئيسية مصاغة بلغة النتيجة المادية للعميل.
5. قسم تفكيك الاعتراضات (Objection Handling FAQ): 4 أسئلة حاسمة عن الأمان، السرعة، والتكامل.`,
    promptTemplateEn: `Act as a world-class Conversion Rate Optimization (CRO) Lead and Senior SaaS Copywriter:

Product Name: {{solution_name}}
Target Audience: {{target_b2b}}
Core Transformation / Value: {{key_benefit}}

Craft the complete, production-ready landing page copy structured as follows:
1. Above-the-Fold Hero Section:
   - Eyebrow badge positioning authority.
   - High-impact H1 focusing strictly on the desired outcome, not technical features.
   - Two-line supporting subheadline clarifying the mechanism of action.
   - Primary and Secondary CTA button text paired with anxiety-reducing microcopy (e.g. No setup fee, instant onboarding).
2. Social Proof & Trust Ticker: Credible metric badges.
3. The Cost of Inaction / Transformation Contrast: Vivid Before vs After contrast.
4. Feature-to-Benefit Engine: 3 core features translated into concrete business milestones (time saved, revenue unlocked).
5. Objection-Killing FAQ: 4 high-friction questions regarding security, migration, and compliance addressed with precision.`
  },

  // 3. Coding & Software Engineering
  {
    id: 'code-review-audit',
    category: 'coding',
    titleAr: 'مراجعة وتدقيق كود احترافي (الأداء، الأمان، وهندسة الكود النظيف)',
    titleEn: 'Senior Staff Engineer Code Review & Vulnerability Audit',
    descriptionAr: 'فحص الشيفرة البرمجية بحثاً عن ثغرات الأمان، تسريبات الذاكرة، اختناقات الأداء، وتقديم كود معاد صياغته.',
    descriptionEn: 'Deep-dive security and performance code review uncovering race conditions, memory leaks, and anti-patterns.',
    model: 'claude',
    tone: 'مهندس برمجيات أول وصارم',
    difficulty: 'متقدم',
    tags: ['Code Review', 'Clean Code', 'Security', 'Refactoring', 'TypeScript'],
    variables: [
      { id: 'language_stack', nameAr: 'لغة البرمجة وإطار العمل', nameEn: 'Language & Framework', placeholderAr: 'مثال: TypeScript / React / Node.js', placeholderEn: 'e.g. Go / PostgreSQL / Docker', defaultVal: 'TypeScript, React 19, Tailwind CSS' },
      { id: 'code_snippet', nameAr: 'الكود أو الوظيفة المراد فحصها', nameEn: 'Code Snippet to Review', placeholderAr: 'الصق الدالة أو الكود هنا', placeholderEn: 'Paste function or code here', defaultVal: 'const [data, setData] = useState(null);\nuseEffect(() => {\n  fetch("/api/items").then(r => r.json()).then(setData);\n}, []);' },
      { id: 'priority_focus', nameAr: 'أولوية التدقيق', nameEn: 'Audit Priority Focus', placeholderAr: 'مثال: منع هجمات XSS وحالات التسابق وتكرار الريندر', placeholderEn: 'e.g. Memory leaks, race conditions, type safety', defaultVal: 'الأمان، منع حالات التسابق (Race Conditions)، ومعالجة الأخطاء' }
    ],
    promptTemplateAr: `بصفتك مهندس برمجيات قيادي (Principal Software Architect & Security Auditor):

البيئة والتقنيات: {{language_stack}}
أولوية الفحص: {{priority_focus}}

قم بمراجعة الكود البرمجي التالي بدقة متناهية:
\`\`\`
{{code_snippet}}
\`\`\`

المطلوب تقديم تقرير تدقيق يغطي:
1. الثغرات الأمنية ونقاط الضعف المحتملة (Security Vulnerabilities) مع تصنيف خطورتها (Low / Medium / High / Critical).
2. اختناقات الأداء (Performance Bottlenecks) وحالات التسابق (Race Conditions) أو تسريبات الذاكرة.
3. التوافق مع مبادئ SOLID و Clean Code وتفادي مكافحة الأنماط (Anti-patterns).
4. الشيفرة البرمجية المحسنة بالكامل (Refactored Production-Ready Code) مع تعليقات توضيحية ومعالجة قوية للأخطاء (Graceful Error Handling) وتأمين الأنواع (Strict Typing).`,
    promptTemplateEn: `Act as a Principal Software Architect and Security Auditor specializing in robust enterprise systems:

Stack / Environment: {{language_stack}}
Audit Priority: {{priority_focus}}

Critique the following code snippet with ruthless precision:
\`\`\`
{{code_snippet}}
\`\`\`

Deliver a structured review addressing:
1. Vulnerabilities & Edge Cases with CVSS-style severity indicators (Low / Medium / High / Critical).
2. Concurrency hazards, race conditions, memory leakage, or unnecessary re-renders.
3. Adherence to SOLID principles, idiomatic standards, and type soundness.
4. The pristine, refactored production-ready code complete with defensive error handling, abort controllers/cleanup, and strict typing.`
  },
  {
    id: 'code-db-schema',
    category: 'coding',
    titleAr: 'تصميم بنية قاعدة بيانات علائقية متقدمة (PostgreSQL Schema & Indexes)',
    titleEn: 'Advanced Relational Database Schema & Indexing Blueprint',
    descriptionAr: 'بناء هيكل الجداول والعلاقات والمفاتيح والمؤشرات واستعلامات الأداء العالي للنظم الموزعة.',
    descriptionEn: 'Design normalized SQL schemas with optimized indexes, foreign keys, constraints, and audit trails.',
    model: 'gemini',
    tone: 'خبير قواعد بيانات ونظم',
    difficulty: 'متقدم',
    tags: ['PostgreSQL', 'Database Design', 'SQL', 'Indexes', 'Performance'],
    variables: [
      { id: 'app_domain', nameAr: 'طبيعة التطبيق والنشاط', nameEn: 'Application Domain', placeholderAr: 'مثال: تطبيق حجز مواعيد وتطبيب عن بعد', placeholderEn: 'e.g. Multi-tenant B2B Billing & Invoicing', defaultVal: 'نظام إدارة اشتراكات ومشاريع سيناريو الفيديو' },
      { id: 'scale_requirements', nameAr: 'حجم البيانات المتوقع', nameEn: 'Data Scale & Traffic', placeholderAr: 'مثال: 100 ألف مستخدم ومليون عملية يومياً', placeholderEn: 'e.g. 500k DAU, write-heavy analytics', defaultVal: '50,000 مستخدم نشط مع تحديثات مستمرة للمشاهد' },
      { id: 'features_list', nameAr: 'الميزات والكيانات الأساسية', nameEn: 'Core Entities & Features', placeholderAr: 'مثال: المستخدمين، المشاريع، المشاهد، التراخيص، الفواتير', placeholderEn: 'e.g. Users, Teams, Projects, Scenes, Billing', defaultVal: 'المستخدمين، مشاريع الأفلام، المشاهد، الشخصيات، التراخيص' }
    ],
    promptTemplateAr: `بصفتك كبير مهندسي قواعد البيانات (Staff Database Architect):

مجال التطبيق: {{app_domain}}
حجم البيانات ومتطلبات النطاق: {{scale_requirements}}
الكيانات والميزات: {{features_list}}

المطلوب تصميم بنية قاعدة بيانات PostgreSQL معيارية ومتوافقة مع أعلى معايير الإنتاج:
1. كود DDL كامل لإنشاء الجداول (Tables) متضمناً المفاتيح الأساسية (UUIDv7 أو BIGINT)، والمفاتيح الأجنبية مع قيود ON DELETE المناسبة.
2. قيود التدقيق (CHECK Constraints) والطوابع الزمنية الدقيقة (created_at, updated_at with trigger).
3. استراتيجية الفهرسة الذكية (Composite, Partial, GIN Indexes) لتسريع الاستعلامات الأكثر تكراراً بدون إبطاء عمليات الكتابة.
4. استعلامات SQL نموذجية للعمليات الأكثر تعقيداً (مثل استرجاع مشروع بكافة مشاهده وشخصياته في استعلام واحد محسن بنظام JSON Aggregation).`,
    promptTemplateEn: `Act as a Staff Database Architect specializing in high-throughput PostgreSQL architectures:

System Domain: {{app_domain}}
Scale / Concurrency Target: {{scale_requirements}}
Core Entities: {{features_list}}

Architect a comprehensive, normalized PostgreSQL schema:
1. Production DDL scripts with modern UUIDv7 or BIGINT keys, foreign keys with strict ON DELETE policies, and normalization (3NF where practical).
2. Robust data integrity rules (CHECK constraints, NOT NULL guarantees, UTC timestamps with auto-updating triggers).
3. Strategic indexing plan (Composite B-tree, Partial, and GIN indexes) tailored for query workloads while minimizing write amplification.
4. Optimized example queries demonstrating complex joins using JSONB aggregation to fetch nested entity graphs in a single round-trip.`
  },

  // 4. Social Media & Content Creation
  {
    id: 'social-viral-thread',
    category: 'social',
    titleAr: 'صياغة ثريد فيروسي عالي القيمة لمنصة X (تويتر سابقاً)',
    titleEn: 'Viral High-Engagement X (Twitter) Mega-Thread',
    descriptionAr: 'كتابة سلسلة تغريدات تجذب الآلاف من خلال خطاف لا يقاوم، سرد معلوماتي ثري، ودعوة ذكية لإعادة التغريد.',
    descriptionEn: 'Structure a viral, high-retention X thread combining psychological hooks, scannable insights, and CTA.',
    model: 'gemini',
    tone: 'حيوي وجذاب ومكثف',
    difficulty: 'مبتدئ',
    tags: ['X Thread', 'Twitter Growth', 'Viral Content', 'Personal Branding'],
    variables: [
      { id: 'topic', nameAr: 'الموضوع الرئيسي للثريد', nameEn: 'Thread Topic', placeholderAr: 'مثال: 7 أدوات ذكاء اصطناعي ستغير صناعة الأفلام', placeholderEn: 'e.g. 7 AI frameworks that replaced my marketing team', defaultVal: '7 أسرار في هندسة الأوامر ستجعل نماذج الذكاء الاصطناعي تعطيك نتائج عبقرية' },
      { id: 'audience_identity', nameAr: 'الجمهور الموجه له الثريد', nameEn: 'Target Audience Profile', placeholderAr: 'مثال: صناع المحتوى والمصممون', placeholderEn: 'e.g. Indie hackers & video creators', defaultVal: 'صناع المحتوى والمصممون والمطورون المستقلون' },
      { id: 'cta_goal', nameAr: 'الهدف من التغريدة الأخيرة (CTA)', nameEn: 'End CTA Goal', placeholderAr: 'مثال: متابعة الحساب وإعادة التغريد لتعميم الفائدة', placeholderEn: 'e.g. Retweet & join free newsletter', defaultVal: 'متابعة الحساب وإعادة نشر التغريدة الأولى وحفظ الثريد' }
    ],
    promptTemplateAr: `بصفتك خبير نمو منصة X (تويتر) ومؤلف محتوى فيروسي حققت تغريداته ملايين المشاهدات:

موضوع الثريد: {{topic}}
الجمهور المستهدف: {{audience_identity}}
الهدف الختامي: {{cta_goal}}

قم بصياغة ثريد احترافي من 7 إلى 9 تغريدات وفق القواعد الصارمة التالية:
- التغريدة الأولى (Hook): استخدم معادلة الفضول والنتيجة غير المتوقعة لإجبار القارئ على النقر لقراءة المزيد، واختمها برمز (👇).
- التغريدات من 2 إلى 7: كل تغريدة تقدم فائدة حصرية ملموسة، سهلة المسح البصري (Scannable)، مع جمل قصيرة ونقاط واضحة وأمثلة عملية، بدون حشو لغوي.
- التغريدة قبل الأخيرة: خلاصة ذهبية في سطرين تلخص الفكرة الجوهرية.
- التغريدة الختامية (CTA): دعوة محفزة ومقنعة لتحقيق: "{{cta_goal}}".`,
    promptTemplateEn: `Act as an elite X (Twitter) Growth Strategist whose threads consistently accumulate millions of impressions:

Topic: {{topic}}
Target Audience: {{audience_identity}}
Final CTA: {{cta_goal}}

Deliver an impactful 7 to 9 tweet master thread engineered for viral retention:
- Tweet 1 (The Hook): Leverages high contrast, curiosity, and undeniable payoff to compel the click. End with a subtle indicator (🧵👇).
- Tweets 2-7 (The Value Blocks): Each tweet contains an actionable, punchy insight. Keep syntax scannable, whitespace generous, and eliminate throat-clearing preamble.
- Penultimate Tweet: A memorable synthesis condensing the entire philosophy into two unforgettable lines.
- Final Tweet (The Conversion): Seamless CTA delivering on "{{cta_goal}}" while rewarding the reader for finishing.`
  },

  // 5. Business, Strategy & Consulting
  {
    id: 'biz-swot-strategy',
    category: 'business',
    titleAr: 'تحليل SWOT و PESTLE استراتيجي معمق لدخول السوق والتوسع',
    titleEn: 'Executive SWOT & PESTLE Strategic Market Expansion',
    descriptionAr: 'تقييم شامل لنقاط القوة والضعف والفرص والتهديدات مع مصفوفة مبادرات تنفيذية ذات أولوية.',
    descriptionEn: 'Synthesize internal capabilities and external macro forces into an actionable strategic roadmap.',
    model: 'claude',
    tone: 'استشاري إدارة استراتيجية (McKinsey Style)',
    difficulty: 'متقدم',
    tags: ['SWOT', 'PESTLE', 'Business Strategy', 'Market Entry', 'Consulting'],
    variables: [
      { id: 'company_desc', nameAr: 'وصف الشركة أو المشروع', nameEn: 'Company / Venture Overview', placeholderAr: 'مثال: منصة عربية ناشئة لهندسة الأوامر الرقمية وتوليد الفيديو', placeholderEn: 'e.g. Bootstrapped AI Video Creation SaaS', defaultVal: 'منصة عربية متخصصة في هندسة الأوامر السينمائية والذكاء الاصطناعي' },
      { id: 'target_market', nameAr: 'السوق والمنطقة المستهدفة', nameEn: 'Target Market / Region', placeholderAr: 'مثال: السعودية والإمارات ومنطقة الشرق الأوسط وشمال أفريقيا', placeholderEn: 'e.g. GCC & MENA creative agencies', defaultVal: 'أسواق الخليج العربي والمبدعين المستقلين' },
      { id: 'main_competitors', nameAr: 'المنافسون أو البدائل المباشرة', nameEn: 'Main Competitors / Alternatives', placeholderAr: 'مثال: الأدوات الإنجليزية غير المعربة والحلول اليدوية', placeholderEn: 'e.g. Generic English prompt tools & manual scripting', defaultVal: 'المنصات العالمية الإنجليزية غير المتوافقة مع المحتوى العربي' }
    ],
    promptTemplateAr: `بصفتك شريكاً إدارياً وخبيراً استراتيجياً في كبرى بيوت الاستشارات العالمية:

المشروع: {{company_desc}}
السوق المستهدف: {{target_market}}
المنافسة والبدائل: {{main_competitors}}

المطلوب إعداد تحليل استراتيجي تنفيذي متكامل يشمل:
1. مصفوفة SWOT المتقدمة: مع ربط كل نقطة ضعف بفرصة مقابلة، وتحويل نقاط القوة إلى حواجز منافسة دفاعية (Moats).
2. مسح عوامل PESTLE الماكرو-بيئية (السياسية، الاقتصادية، الاجتماعية، التكنولوجية، القانونية، البيئية) الخاصة بالسوق المستهدف.
3. مصفوفة المواجهة (TOWS Matrix): تقديم 4 استراتيجيات هجومية ودفاعية محددة.
4. خارطة طريق تنفيذية من 3 مراحل (المرحلة 1: التموضع السريع، المرحلة 2: بناء الشراكات، المرحلة 3: التوسع والاستدامة المالية).`,
    promptTemplateEn: `Act as a Senior Partner at a premier global management consultancy:

Venture: {{company_desc}}
Target Territory: {{target_market}}
Competitive Arena: {{main_competitors}}

Deliver an executive strategic assessment consisting of:
1. Advanced SWOT Matrix: Map internal strengths to defensible moats and pair weaknesses with proactive mitigation hedges.
2. PESTLE Environmental Scan tailored specifically to the regional dynamics of {{target_market}}.
3. Actionable TOWS Confrontation Strategies: Define clear Maxi-Maxi (growth) and Mini-Maxi (pivoting) strategic plays.
4. A 3-Phase Execution Roadmap (Phase 1: Beachhead Capture, Phase 2: Moat Deepening, Phase 3: Scalable Flywheel).`
  },

  // 6. Creative Writing & Storytelling
  {
    id: 'creative-subtext-scene',
    category: 'creative',
    titleAr: 'كتابة مشهد سينمائي مشحون بالتوتر والحديث الباطن (Subtext Dialogue)',
    titleEn: 'High-Tension Cinematic Scene with Dramatic Subtext',
    descriptionAr: 'صياغة سيناريو احترافي بتنسيق قياسي يعتمد على ما لا يقال بين الشخصيات، مع وصف حركي سينمائي.',
    descriptionEn: 'Script a gripping scene adhering to standard screenplay formatting where characters speak around what they really mean.',
    model: 'claude',
    tone: 'سينمائي درامي مشحون',
    difficulty: 'متوسط',
    tags: ['Screenplay', 'Subtext', 'Cinema', 'Creative Writing', 'Drama'],
    variables: [
      { id: 'character_a', nameAr: 'الشخصية الأولى وسرها الخفي', nameEn: 'Character A & Hidden Objective', placeholderAr: 'مثال: محقق متقاعد يعلم أن ابنه متورط في القضية', placeholderEn: 'e.g. Veteran detective protecting his corrupt son', defaultVal: 'مخرج وثائقي مخضرم يعلم أن زميله سرق فكرة فيلمه الأخير' },
      { id: 'character_b', nameAr: 'الشخصية الثانية وسرها الخفي', nameEn: 'Character B & Hidden Objective', placeholderAr: 'مثال: زميل يحاول التظاهر بالبراءة والحصول على توقيعه', placeholderEn: 'e.g. Young ambitious producer seeking a signature', defaultVal: 'الزميل الشاب الطموح الذي يحاول إقناعه بالتنازل ودياً' },
      { id: 'scene_setting', nameAr: 'المكان والزمان (Slugline)', nameEn: 'Scene Location & Time', placeholderAr: 'مثال: مشهد داخلي - مقهى قديم تحت المطر - ليل', placeholderEn: 'e.g. INT. DOWNTOWN DINER - RAINY NIGHT', defaultVal: 'مشهد داخلي - غرفة مونتاج مظلمة ومضاءة فقط بشاشة المونتاج - ليل' }
    ],
    promptTemplateAr: `بصفتك سيناريست حائز على جوائز في الكتابة الدرامية السينمائية:

المكان والزمان: {{scene_setting}}
الشخصية الأولى وخلفيتها: {{character_a}}
الشخصية الثانية وخلفيتها: {{character_b}}

اكتب مشهداً سينمائياً بطول 3 إلى 4 دقائق بتنسيق السيناريو الاحترافي القياسي (Industry Standard Screenplay):
- تجنب الحديث المباشر عما يشعر به الأبطال (No "On-the-Nose" Dialogue). يجب أن يكون الصراع الحقيقي مدفوناً تحت السطح (Subtext)، بينما يتحدثون في الظاهر عن شيء تافه (مثل شريط المونتاج أو القهوة الباردة).
- استخدم حركات جسدية بصرية (Action Beats) تظهر التوتر وتكسر رتابة الحوار.
- امنح كل شخصية إيقاعاً لغوياً مميزاً ونبرة صوت مختلفة تعكس مكانتها النفسية في المشهد.
- اختم المشهد بضربة درامية (Button) توحي بالانفجار القادم بدون أن تفض الصراع كاملاً.`,
    promptTemplateEn: `Act as an award-winning feature screenwriter:

Slugline / Setting: {{scene_setting}}
Character A & Hidden Objective: {{character_a}}
Character B & Hidden Objective: {{character_b}}

Script a 3-4 minute dramatic scene formatted to industry screenplay standards:
- Strictly prohibit "on-the-nose" dialogue. Characters must speak through intense dramatic subtext—discussing an innocuous subject while locked in psychological warfare.
- Integrate purposeful action beats and sensory micro-actions (sound of rain, buzzing monitor, cold coffee) that externalize internal friction.
- Differentiate distinct vocal cadences and power dynamics.
- Conclude on a resonant dramatic button that heightens anticipation for the inevitable climax.`
  },

  // 7. Academic & Research
  {
    id: 'academic-lit-review',
    category: 'academic',
    titleAr: 'تأليف مراجعة منهجية للدراسات السابقة وتحديد الفجوة البحثية',
    titleEn: 'Systematic Literature Review & Research Gap Synthesizer',
    descriptionAr: 'تحليل مقارن للنظريات والمدارس العلمية واستخلاص الفجوة المعرفية لصياغة أطروحات محكمة.',
    descriptionEn: 'Synthesize academic literature, contrast prevailing paradigms, and isolate the empirical research gap.',
    model: 'claude',
    tone: 'أكاديمي رصين ومحكم',
    difficulty: 'متقدم',
    tags: ['Academic Research', 'Literature Review', 'Thesis', 'Methodology'],
    variables: [
      { id: 'research_topic', nameAr: 'عنوان أو موضوع البحث الأكاديمي', nameEn: 'Research Title / Topic', placeholderAr: 'مثال: أثر نماذج الذكاء التوليدي على كفاءة التعليم العالي', placeholderEn: 'e.g. Generative AI efficacy in tertiary education pedagogy', defaultVal: 'أثر الذكاء الاصطناعي التوليدي في تحسين مهارات التفكير النقدي لدى الطلاب' },
      { id: 'theoretical_framework', nameAr: 'الإطار النظري المقترح', nameEn: 'Theoretical Framework', placeholderAr: 'مثال: النظرية البنائية في التعلم', placeholderEn: 'e.g. Constructivist learning theory', defaultVal: 'النظرية البنائية ونظرية الحمل المعرفي (Cognitive Load Theory)' },
      { id: 'methodology_type', nameAr: 'نوع المنهجية البحثية', nameEn: 'Research Methodology', placeholderAr: 'مثال: منهج تجريبي مقارن مع عينة ضابطة', placeholderEn: 'e.g. Mixed-methods quasi-experimental design', defaultVal: 'منهج وصفي تحليلي مقارن متعدد الوسائط' }
    ],
    promptTemplateAr: `بصفتك أستاذاً جامعياً ومحكماً في كبرى الدوريات العلمية المصنفة (Scopus / Web of Science):

موضوع البحث: {{research_topic}}
الإطار النظري: {{theoretical_framework}}
المنهجية: {{methodology_type}}

المطلوب إعداد مسودة مراجعة دراسات سابقة (Literature Review Synthesis) تشمل:
1. تأطير المشكلة البحثية وربطها المباشر بالإطار النظري المختار.
2. تصنيف الدراسات السابقة إلى اتجاهين فكريين رئيسيين (الاتجاه المؤيد والمتحفظ) مع المقارنة بين استنتاجاتهما العلمية.
3. تحديد "الفجوة البحثية" (Research Gap) بدقة متناهية وإبراز مساهمة هذا البحث في سدها.
4. صياغة 3 أسئلة بحثية محكمة وفرضيات قابلة للقياس والاختبار الإحصائي.`,
    promptTemplateEn: `Act as a Tenured Research Professor and peer reviewer for Q1 peer-reviewed academic journals:

Research Topic: {{research_topic}}
Theoretical Foundation: {{theoretical_framework}}
Methodological Design: {{methodology_type}}

Draft a rigorous Literature Review Synthesis comprising:
1. Problem contextualization tethered strictly to the nominated theoretical framework.
2. Thematic taxonomy organizing prior seminal literature into contrasting schools of thought, critiquing methodological limitations.
3. Laser-focused articulation of the empirical Research Gap and the theoretical contribution of this inquiry.
4. Three tightly constructed research questions and corresponding testable hypotheses.`
  }
];

export default function PromptTemplates({ lang, onSendToBuilder, onNavigateTab }: PromptTemplatesProps) {
  const isAr = lang === 'ar';
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedModel, setSelectedModel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(false);

  // Favorites state persisted in localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('arabi_prompt_template_favs');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      try {
        localStorage.setItem('arabi_prompt_template_favs', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Variable values editor state for each template
  // Record<templateId, Record<variableId, value>>
  const [variableValues, setVariableValues] = useState<Record<string, Record<string, string>>>(() => {
    const initial: Record<string, Record<string, string>> = {};
    TEMPLATES.forEach(tmpl => {
      initial[tmpl.id] = {};
      tmpl.variables.forEach(v => {
        initial[tmpl.id][v.id] = v.defaultVal;
      });
    });
    return initial;
  });

  // Expanded variable editor drawer for specific cards
  const [expandedCustomizerId, setExpandedCustomizerId] = useState<string | null>(null);

  // Copy success feedback tracker
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleVariableChange = (templateId: string, varId: string, val: string) => {
    setVariableValues(prev => ({
      ...prev,
      [templateId]: {
        ...(prev[templateId] || {}),
        [varId]: val
      }
    }));
  };

  const handleResetVariables = (templateId: string) => {
    const tmpl = TEMPLATES.find(t => t.id === templateId);
    if (!tmpl) return;
    const defaults: Record<string, string> = {};
    tmpl.variables.forEach(v => {
      defaults[v.id] = v.defaultVal;
    });
    setVariableValues(prev => ({
      ...prev,
      [templateId]: defaults
    }));
  };

  // Helper to compile the filled prompt
  const getCompiledPrompt = (template: PromptTemplateItem): string => {
    const templateText = isAr ? template.promptTemplateAr : template.promptTemplateEn;
    const values = variableValues[template.id] || {};

    let compiled = templateText;
    template.variables.forEach(v => {
      const val = values[v.id] !== undefined ? values[v.id] : v.defaultVal;
      // replace {{varId}}
      compiled = compiled.replace(new RegExp(`\\{\\{${v.id}\\}\\}`, 'g'), val || `[${isAr ? v.nameAr : v.nameEn}]`);
    });
    return compiled;
  };

  const handleCopy = (template: PromptTemplateItem) => {
    const compiled = getCompiledPrompt(template);
    // Add ArabPrompt subtle signature for completeness
    const textToCopy = `${compiled}\n\n---\n🌐 تمت الهندسة عبر منصة ArabPrompt | https://arabiprompt.ai.studio/`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(template.id);
    setTimeout(() => setCopiedId(null), 2500);

    // Dispatch global toast event if available
    window.dispatchEvent(new CustomEvent('app-toast', {
      detail: {
        message: isAr ? '✓ تم نسخ البرومبت بنجاح للحافظة مع المتغيرات!' : '✓ Prompt copied to clipboard with filled variables!',
        type: 'success'
      }
    }));
  };

  const handleCustomizeInBuilder = (template: PromptTemplateItem) => {
    const compiled = getCompiledPrompt(template);
    onSendToBuilder(compiled, template.model, template.tone, template.category);
  };

  // Category definitions with icons
  const categories = useMemo(() => [
    { id: 'all', nameAr: 'جميع القوالب', nameEn: 'All Templates', icon: Compass, count: TEMPLATES.length },
    { id: 'seo', nameAr: 'SEO والنمو', nameEn: 'SEO & Growth', icon: TrendingUp, count: TEMPLATES.filter(t => t.category === 'seo').length },
    { id: 'marketing', nameAr: 'التسويق والإعلانات', nameEn: 'Marketing & Ads', icon: Megaphone, count: TEMPLATES.filter(t => t.category === 'marketing').length },
    { id: 'coding', nameAr: 'البرمجة وهندسة الكود', nameEn: 'Coding & Arch', icon: Code2, count: TEMPLATES.filter(t => t.category === 'coding').length },
    { id: 'social', nameAr: 'شبكات التواصل', nameEn: 'Social Media', icon: Share2, count: TEMPLATES.filter(t => t.category === 'social').length },
    { id: 'business', nameAr: 'الأعمال والاستراتيجية', nameEn: 'Business & Strategy', icon: Briefcase, count: TEMPLATES.filter(t => t.category === 'business').length },
    { id: 'creative', nameAr: 'الكتابة والسرد الدرامي', nameEn: 'Creative Storytelling', icon: Feather, count: TEMPLATES.filter(t => t.category === 'creative').length },
    { id: 'academic', nameAr: 'البحث الأكاديمي', nameEn: 'Academic & Research', icon: GraduationCap, count: TEMPLATES.filter(t => t.category === 'academic').length },
  ], []);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return TEMPLATES.filter(item => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      // Model filter
      if (selectedModel !== 'all' && item.model !== selectedModel) {
        return false;
      }
      // Favorites filter
      if (onlyFavorites && !favorites.includes(item.id)) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = item.titleAr.toLowerCase().includes(q) || item.titleEn.toLowerCase().includes(q);
        const matchDesc = item.descriptionAr.toLowerCase().includes(q) || item.descriptionEn.toLowerCase().includes(q);
        const matchTags = item.tags.some(tag => tag.toLowerCase().includes(q));
        const matchPrompt = item.promptTemplateAr.toLowerCase().includes(q) || item.promptTemplateEn.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchTags && !matchPrompt) {
          return false;
        }
      }
      return true;
    });
  }, [selectedCategory, selectedModel, onlyFavorites, favorites, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 1. Top Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1c1a16] via-[#26231e] to-stone-900 text-white p-6 sm:p-10 shadow-xl border border-stone-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#c29b40]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c29b40]/20 border border-[#c29b40]/40 text-amber-300 text-xs font-black">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAr ? 'مكتبة قوالب الأوامر التخصصية الجاهزة' : 'Pre-Engineered Domain Prompt Templates'}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              {isAr ? (
                <>
                  قوالب أوامر احترافية <span className="text-[#c29b40]">جاهزة للاستخدام الفوري</span> والتخصيص
                </>
              ) : (
                <>
                  Production-Ready <span className="text-[#c29b40]">Prompt Templates</span> for High Impact
                </>
              )}
            </h1>

            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
              {isAr 
                ? 'وفّر ساعات من التجربة والخطأ. استكشف قوالب مهندسة بعناية لمجالات الـ SEO، كتابة الإعلانات، البرمجة، والسيناريو، وقم بتعبئة المتغيرات بضغطة زر أو نقلها مباشرة لمُهندس الأوامر.'
                : 'Bypass prompt trial-and-error. Deploy battle-tested templates for SEO, Copywriting, Software Architecture, and Cinema Screenwriting with interactive variable fillers.'}
            </p>
          </div>

          {/* Quick stats or shortcut */}
          <div className="flex sm:flex-col gap-3 shrink-0">
            <div className="bg-stone-800/80 backdrop-blur-xs p-4 rounded-2xl border border-stone-700/80 text-center min-w-[130px]">
              <span className="text-2xl font-black text-amber-400 block">{TEMPLATES.length}</span>
              <span className="text-[11px] text-stone-400 font-bold">{isAr ? 'قالب متخصص' : 'Domain Templates'}</span>
            </div>
            
            <button
              onClick={() => onNavigateTab ? onNavigateTab('builder') : null}
              className="bg-[#c29b40] hover:bg-[#b08b34] text-stone-950 font-black px-4 py-3 rounded-2xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <span>{isAr ? 'الذهاب لمُهندس الأوامر' : 'Open Prompt Builder'}</span>
              <Arrow className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Search & Controls Bar */}
      <div className="bg-white dark:bg-[#151412] p-4 sm:p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className={`w-4 h-4 text-stone-400 absolute top-1/2 -translate-y-1/2 ${isAr ? 'right-3.5' : 'left-3.5'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'ابحث بعنوان القالب، الكلمات المفتاحية، أو محتوى الأمر...' : 'Search by template title, keywords, or content...'}
              className={`w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-xs py-2.5 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-[#c29b40]/40 transition-all ${
                isAr ? 'pr-10 pl-4' : 'pl-10 pr-4'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={`absolute top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-xs px-2 ${
                  isAr ? 'left-2' : 'right-2'
                }`}
              >
                ✕
              </button>
            )}
          </div>

          {/* Model Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: 'all', label: isAr ? 'كافة النماذج' : 'All Models' },
              { id: 'gemini', label: 'Gemini' },
              { id: 'claude', label: 'Claude' },
              { id: 'chatgpt', label: 'ChatGPT' },
              { id: 'midjourney', label: 'Midjourney' },
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setSelectedModel(m.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedModel === m.id
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                }`}
              >
                {m.label}
              </button>
            ))}

            {/* Favorites Toggle */}
            <button
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                onlyFavorites
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
              title={isAr ? 'عرض القوالب المفضلة فقط' : 'Show favorited templates only'}
            >
              <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-current' : ''}`} />
              <span>{isAr ? 'المفضلة' : 'Favorites'}</span>
              {favorites.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-white font-mono">
                  {favorites.length}
                </span>
              )}
            </button>
          </div>

        </div>

        {/* Category Horizontal Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-stone-100 dark:border-stone-800/80">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#c29b40] text-stone-950 shadow-sm font-black'
                    : 'bg-stone-100 dark:bg-stone-850 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{isAr ? cat.nameAr : cat.nameEn}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? 'bg-stone-950/20 text-stone-950' : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
                }`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="bg-white dark:bg-[#151412] rounded-3xl border border-stone-200 dark:border-stone-800 p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-[#c29b40] flex items-center justify-center mx-auto">
            <Search className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
              {isAr ? 'لم يتم العثور على قوالب مطابقة' : 'No matching templates found'}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {isAr ? 'جرب تغيير كلمات البحث أو إعادة ضبط الفلاتر لاستعراض جميع القوالب.' : 'Try adjusting your search query or reset filters to view all templates.'}
            </p>
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedModel('all');
              setOnlyFavorites(false);
            }}
            className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-xs font-bold text-stone-800 dark:text-stone-200 transition-colors cursor-pointer"
          >
            {isAr ? 'إعادة ضبط الفلاتر' : 'Reset All Filters'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTemplates.map((template) => {
            const isFav = favorites.includes(template.id);
            const isCustomizing = expandedCustomizerId === template.id;
            const currentValues = variableValues[template.id] || {};
            const compiledPrompt = getCompiledPrompt(template);
            const isCopied = copiedId === template.id;

            return (
              <div
                key={template.id}
                className="bg-white dark:bg-[#151412] rounded-3xl border border-stone-200 dark:border-stone-800 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-all space-y-5"
              >
                {/* Header: Badges & Favorite Button */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-[#c29b40]/15 text-[#9c7524] dark:text-amber-400 border border-[#c29b40]/25 uppercase">
                        {template.category}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                        {template.model.toUpperCase()}
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800/80 text-stone-500">
                        {template.difficulty}
                      </span>
                    </div>

                    <button
                      onClick={(e) => toggleFavorite(template.id, e)}
                      className={`p-2 rounded-xl transition-colors cursor-pointer ${
                        isFav 
                          ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/50' 
                          : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
                      }`}
                      title={isFav ? (isAr ? 'إزالة من المفضلة' : 'Remove favorite') : (isAr ? 'إضافة للمفضلة' : 'Add to favorites')}
                    >
                      <Star className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 leading-snug">
                      {isAr ? template.titleAr : template.titleEn}
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                      {isAr ? template.descriptionAr : template.descriptionEn}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {template.tags.map((tag, tIdx) => (
                      <span 
                        key={tIdx} 
                        className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-850 text-stone-600 dark:text-stone-400 font-medium cursor-pointer hover:bg-stone-200 dark:hover:bg-stone-800"
                        onClick={() => setSearchQuery(tag)}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Variable Customizer Toggle & Drawer */}
                <div className="space-y-3 pt-2 border-t border-stone-100 dark:border-stone-850">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setExpandedCustomizerId(isCustomizing ? null : template.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#c29b40] hover:text-[#916a24] dark:hover:text-amber-300 transition-colors cursor-pointer"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>
                        {isCustomizing 
                          ? (isAr ? 'إخفاء محرر المتغيرات' : 'Hide Variable Editor') 
                          : (isAr ? `تخصيص المتغيرات (${template.variables.length})` : `Customize Variables (${template.variables.length})`)}
                      </span>
                      {isCustomizing ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    <span className="text-[10px] text-stone-400 font-medium">
                      {template.tone}
                    </span>
                  </div>

                  {/* Inline Variable Editor */}
                  {isCustomizing && (
                    <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 space-y-3 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between text-xs font-bold text-stone-700 dark:text-stone-300 pb-1 border-b border-stone-200/60 dark:border-stone-800">
                        <span>{isAr ? 'أدخل تفاصيلك الخاصة لتحديث البرومبت مباشرة:' : 'Fill your details to update prompt in real time:'}</span>
                        <button
                          onClick={() => handleResetVariables(template.id)}
                          className="text-[11px] text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 flex items-center gap-1 cursor-pointer"
                          title={isAr ? 'إعادة ضبط القيم الافتراضية' : 'Reset to defaults'}
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>{isAr ? 'إعادة ضبط' : 'Reset'}</span>
                        </button>
                      </div>

                      <div className="space-y-2.5">
                        {template.variables.map((variable) => (
                          <div key={variable.id} className="space-y-1">
                            <label className="text-[11px] font-bold text-stone-600 dark:text-stone-300 flex items-center justify-between">
                              <span>{isAr ? variable.nameAr : variable.nameEn}</span>
                              <span className="text-[10px] text-stone-400 font-mono">[{variable.id}]</span>
                            </label>
                            <input
                              type="text"
                              value={currentValues[variable.id] !== undefined ? currentValues[variable.id] : variable.defaultVal}
                              onChange={(e) => handleVariableChange(template.id, variable.id, e.target.value)}
                              placeholder={isAr ? variable.placeholderAr : variable.placeholderEn}
                              className="w-full bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-xs px-3 py-2 text-stone-800 dark:text-stone-200 focus:outline-hidden focus:ring-1 focus:ring-[#c29b40]"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Prompt Preview Box */}
                  <div className="relative group">
                    <div className="bg-stone-900 text-stone-200 dark:bg-stone-950 p-4 rounded-2xl text-xs font-mono leading-relaxed max-h-48 overflow-y-auto border border-stone-800 no-scrollbar whitespace-pre-wrap select-text">
                      {compiledPrompt}
                    </div>

                    <div className="absolute top-2.5 left-2.5 rtl:left-auto rtl:right-2.5 opacity-80 group-hover:opacity-100 transition-opacity">
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-800 text-stone-400 border border-stone-700">
                        {isAr ? 'معاينة حية' : 'Live Preview'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                  <button
                    onClick={() => handleCopy(template)}
                    className={`w-full sm:flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isCopied
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-100'
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>{isAr ? 'تم النسخ للحافظة!' : 'Copied!'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
                        <span>{isAr ? 'نسخ البرومبت الجاهز' : 'Copy Prompt'}</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleCustomizeInBuilder(template)}
                    className="w-full sm:flex-1 py-2.5 px-4 rounded-xl text-xs font-black bg-[#c29b40] hover:bg-[#b08b34] text-stone-950 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isAr ? 'تخصيص في المُهندس' : 'Open in Builder'}</span>
                    <Arrow className="w-3 h-3" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* 4. Bottom Suggestion / Educational Box */}
      <div className="rounded-3xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-start">
          <h4 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100">
            {isAr ? 'هل لديك فكرة أو قالب تود ابتكاره من الصفر؟' : 'Have a custom concept you want to engineer from scratch?'}
          </h4>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xl">
            {isAr 
              ? 'انتقل إلى مُهندس الأوامر المتقدم لصياغة وتوليد برومبتات بروتوكولية مخصصة لأي مجال بدقة استثنائية ونماذج متعددة.' 
              : 'Switch to the core Prompt Builder to synthesize role-driven personas, camera choreographies, and constraints.'}
          </p>
        </div>

        <button
          onClick={() => onNavigateTab ? onNavigateTab('builder') : null}
          className="px-6 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-bold text-xs transition-colors shrink-0 flex items-center gap-2 cursor-pointer shadow-sm"
        >
          <span>{isAr ? 'ابدأ في مُهندس الأوامر' : 'Launch Prompt Builder'}</span>
          <Arrow className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
