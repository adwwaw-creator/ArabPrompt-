/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Category, PromptTemplate } from './types';

export const CATEGORIES: Category[] = [
  {
    id: 'content',
    nameAr: 'كتابة المحتوى والتدوين',
    nameEn: 'Content Writing & Blogging',
    descriptionAr: 'كتابة مقالات متوافقة مع السيو، مسودات، وصياغة نصوص إبداعية',
    descriptionEn: 'Write SEO-friendly articles, drafts, and creative copy',
    icon: 'PenTool',
  },
  {
    id: 'marketing',
    nameAr: 'التسويق والإعلانات',
    nameEn: 'Marketing & Ads',
    descriptionAr: 'كتابة منشورات منصات التواصل الاجتماعي، رسائل بريد، وإعلانات جذابة',
    descriptionEn: 'Social media posts, email copies, and high-converting advertisements',
    icon: 'Megaphone',
  },
  {
    id: 'tech',
    nameAr: 'البرمجة والتطوير',
    nameEn: 'Programming & Tech',
    descriptionAr: 'شرح الأكواد، كشف الأخطاء، وكتابة شروحات برمجية باللغة العربية',
    descriptionEn: 'Explain code, debug errors, and write technical Arabic annotations',
    icon: 'Code',
  },
  {
    id: 'education',
    nameAr: 'التعليم والتبسيط',
    nameEn: 'Education & Simplification',
    descriptionAr: 'تبسيط المفاهيم المعقدة، إعداد خطط الدروس، ومساعدة الطلاب',
    descriptionEn: 'Simplify hard concepts, prepare lesson plans, and build learning guides',
    icon: 'BookOpen',
  },
  {
    id: 'productivity',
    nameAr: 'الإنتاجية والأعمال',
    nameEn: 'Productivity & Business',
    descriptionAr: 'صياغة تقارير، تلخيص كتب، تحضير رسائل بريد رسمية، وتخطيط مهام',
    descriptionEn: 'Draft reports, book summarization, email correspondence, and task plans',
    icon: 'Briefcase',
  },
  {
    id: 'visual',
    nameAr: 'هندسة الأوامر البصرية (Prompt Architect)',
    nameEn: 'Visual Prompt Architect',
    descriptionAr: 'صياغة برومبتات بصرية وسينمائية مذهلة ومؤثرة تتبع إطار سيكولوجية الصورة والـ 7 طبقات',
    descriptionEn: 'Craft psychological, photography-backed visual prompts for Midjourney, DALL-E, SD, and Instagram',
    icon: 'PenTool',
  },
];

export const TEMPLATES: PromptTemplate[] = [
  {
    id: 'hot-air-balloon-selfie',
    titleAr: 'سيلفي المنطاد الهوائي الساحر (Selfie from Hot Air Balloon)',
    titleEn: 'Selfie from a Hot Air Balloon',
    descriptionAr: 'توليد لقطة سيلفي واقعية مذهلة من منطاد طائر تركز على دقة الملابس وتفاصيل الملامح والمنظر الطبيعي المعلق في الأسفل.',
    descriptionEn: 'Generate a stunning first-person photograph from a hot air balloon, focusing on custom wardrobe, facial likeness, and landscape depth.',
    category: 'visual',
    icon: 'PenTool',
    promptText: `A professional, breathtaking first-person viewpoint (selfie style) photo shot on a classic 35mm lens. A confident, professional-looking person is smiling warmly, taking a selfie from the wooden basket of a colorful hot air balloon drifting silently high in the sky.

SUBJECT & ESSENCE: The subject maintains a professional and confident expression, showing strict natural facial structure and recognizable human features, looking towards the camera.
WARDROBE & STYLING: The subject is wearing a [ملابس_الهدف]. The detailed fabric textures, natural weaving patterns, fabric folds, and accessories like a light windbreaker strap react organically to the atmospheric wind and golden sunlight highlights.
CAMERA SPECIFICATIONS: Shot with a 35mm f/1.8 lens, creating an ultra-sharp, high-definition focus on the subject. A carefully controlled shallow depth of field produces a subtle, gorgeous bokeh effect that beautifully separates the main subject from the immense open space behind.
ENVIRONMENT & BACKGROUND: A panoramic, atmospheric view of a breathtaking landscape below ([المنظر_المقترح]) seen from high altitude. Deep layers of visual depth, slight mist in the valleys, and crisp horizon lines.
LIGHTING & COLORS: Natural golden hour sunlight casts long, realistic warm shadows and glowing rim-lighting highlights, illuminating the fabric weaves and the side of the balloon's woven basket with rich, photorealistic depth and high-dynamic physical rendering. Excellent contrast with no artificial or plastic textures. --ar [الأبعاد] --style raw --v 6`,
    placeholders: [
      {
        key: 'ملابس_الهدف',
        labelAr: 'ملابس وأزياء الشخص المحوري',
        labelEn: 'Target Subject Wardrobe',
        placeholderAr: 'traditional Moroccan Djellaba with delicate gold-threaded embroidery and soft textures',
        placeholderEn: 'traditional Moroccan Djellaba with delicate gold-threaded embroidery and soft textures',
        type: 'text',
      },
      {
        key: 'المنظر_المقترح',
        labelAr: 'المنظر الطبيعي في الأسفل',
        labelEn: 'Landscape View Below',
        placeholderAr: 'the historic clay villages, green palm groves, and winding canyons of Ouarzazate, Morocco',
        placeholderEn: 'the historic clay villages, green palm groves, and winding canyons of Ouarzazate, Morocco',
        type: 'textarea',
      },
      {
        key: 'الأبعاد',
        labelAr: 'نسبة أبعاد الصورة',
        labelEn: 'Aspect Ratio',
        placeholderAr: '16:9',
        placeholderEn: '16:9',
        type: 'select',
        options: ['16:9', '4:5', '9:16', '1:1', '3:2'],
      }
    ],
  },
  {
    id: 'global-scientific-foresight',
    titleAr: 'تخطيط الأبحاث والسيناريوهات الاستكشافية متعددة العملاء',
    titleEn: 'Global Scientific Intelligence & Multi-Agent Foresight',
    descriptionAr: 'تشغيل نظام عملاء ذكي متعدد لتوليد تحليلات استباقية رفيعة المستوى واستشراف مستقبل التقنيات والأبحاث بدقة عالية.',
    descriptionEn: 'Run a structured multi-agent workflow to analyze global research, identify anomalies, map interdisciplinary nexuses, and model future scenarios.',
    category: 'productivity',
    icon: 'Briefcase',
    promptText: `# Title: Global Scientific Intelligence Brief: Multi-Agent Systems & Strategic Foresight

# Expert Persona:
You are the lead of a multi-agent AI system, comprising a "Scientific Data Harvester," an "Interdisciplinary Analyst," a "Strategic Foresight Specialist," and an "Ethical & Societal Impact Assessor." Your collective mission is to provide a comprehensive, real-time, and predictive intelligence brief on the global breakthrough specified below.

TARGETED INNOVATION CONTEXT:
- Targeted Scientific Concept: "[الفكرة_العلمية_المستهدفة]"
- Core Strategic Focus Disciplines: "[مجالات_التركيز_الاستراتيجي]"

# Operational Framework & Multi-Agent Workflows:
1. **Real-time Data Integration**: Aggregate and ingest global publications, patent filings, and grant distributions from virtual APIs including [مصادر_البيانات_العالمية]. Filter for breakthrough novelty and institutional prestige.
2. **Anomaly Detection & Trend Spotting**: Isolate nascent breakthroughs or deviations from established research trajectories using qualitative/quantitative analysis indicators.
3. **Interdisciplinary Nexus Mapping**: Draw mapping lines and dependencies between diverse fields, highlighting critical research nexus points (e.g. bio-engineering colliding with advanced nanomaterial chips).
4. **Predictive Impact Modeling**: Forecast short-term (1-2 years), medium-term (3-5 years), and long-term (5-10 years) technological, economic, societal, and environmental impacts of the advancements.
5. **Scenario Planning**: Generate exactly three plausible future narrative scenarios (optimistic convergence, chaotic disruption, restricted protectionism) driven by these scientific vectors.
6. **Risk & Opportunity Assessment**: Evaluate risk thresholds under a "[مستويات_المخاطر_المرصودة]" boundary, scanning for gaps in current regulation, ethical dilemmas, and strategic IP opportunities with an update frequency/cycle targeting "[تردد_تحديث_البيانات]".

# Output Format Structure:
- **I. Multi-Agent Consensus Brief & KPI Matrix**: A concise bulleted overview synthesizing input from the four agent perspectives.
- **II. Interdisciplinary Nexus Schema**: Textual graph demonstrating nodes (concepts) and edges (influential connections).
- **III. Tech-Economic-Societal-Environmental Impact Horizonal Matrix**: Organized report across short, medium, and long-term horizons.
- **IV. Scenario Narrative Storyboards**: Brief, vivid narratives illustrating each of the three future states.
- **V. Ethical Compliance & Regulatory Watchlist**: Focused summary highlighting risk thresholds and advisory actions.`,
    placeholders: [
      {
        key: 'الفكرة_العلمية_المستهدفة',
        labelAr: 'موضوع الأبحاث أو الفكرة المستهدفة بالدراسة',
        labelEn: 'Targeted Scientific Concept / Breakthrough',
        placeholderAr: 'Synthetic biology for personalized enzymatic carbon-capture cells',
        placeholderEn: 'Synthetic biology for personalized enzymatic carbon-capture cells',
        type: 'textarea',
      },
      {
        key: 'مصادر_البيانات_العالمية',
        labelAr: 'مصادر التغذية وقواعد البيانات المستهدفة',
        labelEn: 'Data Feeds APIs / Databases',
        placeholderAr: 'arXiv, PubMed, nature, bioRxiv, USPTO Patent Database',
        placeholderEn: 'arXiv, PubMed, nature, bioRxiv, USPTO Patent Database',
        type: 'text',
      },
      {
        key: 'مجالات_التركيز_الاستراتيجي',
        labelAr: 'مجالات التركيز والمواءمة الاستراتيجية',
        labelEn: 'Strategic Focus Areas',
        placeholderAr: 'Quantum Computing, Synthetic Biology, Advanced Materials, AI Ethics',
        placeholderEn: 'Quantum Computing, Synthetic Biology, Advanced Materials, AI Ethics',
        type: 'text',
      },
      {
        key: 'مستويات_المخاطر_المرصودة',
        labelAr: 'مستوى عتبة المخاطر المقبولة للتنبيه والتحليل',
        labelEn: 'Risk Threshold Level',
        placeholderAr: 'High Ethical Risk & Regulatory Precaution Mode',
        placeholderEn: 'High Ethical Risk & Regulatory Precaution Mode',
        type: 'select',
        options: ['High Ethical Risk & Regulatory Precaution Mode', 'Medium Operative Tolerance Mode', 'Low Warning Minimal Oversight Mode'],
      },
      {
        key: 'تردد_تحديث_البيانات',
        labelAr: 'دورة ترقية وتحديث التقارير',
        labelEn: 'Update Cycle Frequency',
        placeholderAr: 'Daily Real-Time Stream Monitoring',
        placeholderEn: 'Daily Real-Time Stream Monitoring',
        type: 'select',
        options: ['Daily Real-Time Stream Monitoring', 'Weekly Aggregation', 'Monthly Strategic Sprints'],
      }
    ],
  },
  {
    id: 'seo-article',
    titleAr: 'كاتب مقالات متوافقة مع السيو (SEO)',
    titleEn: 'SEO Article Writer',
    descriptionAr: 'صياغة مقال تفصيلي كامل متوافق مع محركات البحث حول كلمة مفتاحية معينة.',
    descriptionEn: 'Draft a full, descriptive, search-engine-optimized article on a keyword.',
    category: 'content',
    icon: 'Compass',
    promptText: `تصرف ككاتب مقالات وخبير سيو محترف يتحدث العربية الفصحى. اكتب مقالاً شاملاً وجذاباً حول الموضوع التالي: "[الموضوع]".
الكلمات المفتاحية الفرعية التي يجب تضمينها: "[الكلمات_المفتاحية]".
نبرة الصوت المطلوبة: "[النبرة]".
الجمهور المستهدف: "[الجمهور]".

يرجى الالتزام بالهيكل التالي:
1. عنوان رئيسي جذاب ومثير للاهتمام يحتوي على الكلمة المفتاحية الأساسية.
2. مقدمة تشد القارئ وتوضح المشكلة أو الفكرة الأساسية.
3. عدة عناوين فرعية (H2 و H3) لتقسيم المقال وجعله مريحاً للقراءة.
4. فقرات غنية بالمعلومات مع استخدام نقاط وقوائم حيثما كان ذلك مناسباً.
5. خاتمة تلخص الموضوع متبوعة بدعوة لاتخاذ إجراء (CTA) أو سؤال تفاعلي.
6. نصائح سيو إضافية لهذا المقال.`,
    placeholders: [
      {
        key: 'الموضوع',
        labelAr: 'الموضوع الأساسي للبحث أو المقال',
        labelEn: 'Main Article Subject',
        placeholderAr: 'أهمية الذكاء الاصطناعي في التعليم العام',
        placeholderEn: 'The importance of AI in education',
        type: 'text',
      },
      {
        key: 'الكلمات_المفتاحية',
        labelAr: 'الكلمات الدلالية الفرعية (مفصولة بفاصلة)',
        labelEn: 'Target Keywords (comma separated)',
        placeholderAr: 'التعليم الرقمي، تقنيات التعليم، الذكاء الاصطناعي، مستقبل المدارس',
        placeholderEn: 'digital learning, edtech, artificial intelligence',
        type: 'text',
      },
      {
        key: 'النبرة',
        labelAr: 'أسلوب الصياغة ونبرة الصوت',
        labelEn: 'Tone of Voice',
        placeholderAr: 'مهني، تعليمي ومبسط، مشوق وممتع، حماسي وعلمي',
        placeholderEn: 'professional',
        type: 'select',
        options: ['مهني واحترافي', 'تعليمي ومبسط', 'مشوق وقصصي', 'أكاديمي ورسمي', 'تسويقي وحماسي'],
      },
      {
        key: 'الجمهور',
        labelAr: 'الجمهور المستهدف',
        labelEn: 'Target Audience',
        placeholderAr: 'المعلمين وأولياء الأمور، طلاب الجامعات، المهتمين بالتقنية',
        placeholderEn: 'teachers, students, tech-savvy users',
        type: 'text',
      },
    ],
  },
  {
    id: 'smm-craft',
    titleAr: 'صانع محتوى شبكات التواصل الاجتماعي',
    titleEn: 'Social Media Copywriter',
    descriptionAr: 'توليد منشورات تفاعلية وجذابة مع الهاشتاجات المناسبة لمختلف المنصات.',
    descriptionEn: 'Generate highly engaging social media posts with relevant hashtags representing custom topics.',
    category: 'marketing',
    icon: 'Share2',
    promptText: `أنت خبير تسويق رقمي وصناعة محتوى على منصات التواصل الاجتماعي. اكتب منشوراً جذاباً لمنصة "[المنصة]" حول الفكرة التالية: "[الفكرة]".
الهدف من المنشور: "[الهدف]".
الجمهور المستهدف: "[الجمهور]".

المطلوب:
- كتابة خطاف (Hook) قوي في السطر الأول لجذب الانتباه فوراً.
- تقسيم النص إلى أسطر قصيرة ومريحة للعين مع استخدام الرموز التعبيرية (Emojis) بشكل ذكي ومناسب للموضوع.
- تضمين دعوة تفاعلية لاتخاذ إجراء (Call to Action) تشجع على التعليق أو المشاركة.
- إضافة من 4 إلى 6 هاشتاغات نشطة ومستهدفة باللغتين العربية والإنجليزية.
- إذا كانت المنصة تويتر (X)، يرجى توفير نسختين: واحدة قصيرة جداً (أقل من 280 حرف) وأخرى على شكل ثريد (Thread) متسلسل من 3 تغريدات.`,
    placeholders: [
      {
        key: 'المنصة',
        labelAr: 'منصة التواصل الاجتماعي المستهدفة',
        labelEn: 'Target Platform',
        placeholderAr: 'تويتر (X)',
        placeholderEn: 'Twitter (X)',
        type: 'select',
        options: ['تويتر (X)', 'لينكد إن (LinkedIn)', 'إنستغرام (Instagram)', 'فيسبوك (Facebook)'],
      },
      {
        key: 'الفكرة',
        labelAr: 'فكرة المنشور أو المنتج المسوق له',
        labelEn: 'Post Concept or Product',
        placeholderAr: 'تطبيق جديد لحساب السعرات الحرارية في الأكلات الشرقية وحماية الوزن بمساعدة الذكاء الاصطناعي',
        placeholderEn: 'New AI-powered app for tracking traditional middle eastern food calories',
        type: 'textarea',
      },
      {
        key: 'الهدف',
        labelAr: 'الهدف من المنشور والـ CTA',
        labelEn: 'Goal / CTA',
        placeholderAr: 'التسجيل المبكر مجاناً في فترة الإطلاق التجريبي وحجز المقعد',
        placeholderEn: 'Register for free beta access',
        type: 'text',
      },
      {
        key: 'الجمهور',
        labelAr: 'الجمهور المستهدف بالتفصيل',
        labelEn: 'Target Audience Profile',
        placeholderAr: 'الشباب المهتم بالدايت والطبخ الصحي وممارسة الرياضة وزيادة اللياقة',
        placeholderEn: 'Fitness enthusiasts and healthy eaters',
        type: 'text',
      },
    ],
  },
  {
    id: 'explain-code',
    titleAr: 'مفسر ومحلل الأكواد البرمجية',
    titleEn: 'Code Explainer & Tutor',
    descriptionAr: 'تحليل أي كود برمجي، تتبع الأخطاء فيه، وإضافة تعليقات توضيحية باللغة العربية.',
    descriptionEn: 'Analyze syntax, add clear step-by-step documentation and optimization tips.',
    category: 'tech',
    icon: 'Code',
    promptText: `تصرف كمهندس برمجيات محترف وخبير في لغات البرمجة وتحديداً لغة: "[لغة_البرمجة]". قم بمراجعة وتفسير الكود التالي:
\`\`\`
[الكود]
\`\`\`

المطلوب بدقة:
1. تقديم ملخص سريع جداً في سطرين عما يفعله هذا الكود ومكامن قوته وضعفه.
2. شرح منطق العمل وخوارزمية التشغيل البرمجي خطوة بخطوة.
3. إعادة صياغة الكود نفسه مع تضمين تعليقات وافية وهادفة باللغة العربية داخل الكود لشرح أجزائه الحساسة لزملائك المبرمجين.
4. تقديم من 2 إلى 3 نصائح لتحسين الكود من حيث الأداء (Optimizations) أو الحماية (Security) أو سهولة القراءة (Code Readability).`,
    placeholders: [
      {
        key: 'لغة_البرمجة',
        labelAr: 'لغة البرمجة المستخدمة',
        labelEn: 'Programming Language',
        placeholderAr: 'TypeScript, Python, JavaScript, React...',
        placeholderEn: 'TypeScript, Python, C++',
        type: 'text',
      },
      {
        key: 'الكود',
        labelAr: 'الصق الكود البرمجي هنا',
        labelEn: 'Paste Code Snippet',
        placeholderAr: 'const filterUsers = (users) => users.filter(u => u.age > 18);',
        placeholderEn: 'Paste your raw code snippet...',
        type: 'textarea',
      },
    ],
  },
  {
    id: 'feynman-simplify',
    titleAr: 'مبسط المفاهيم المعقدة (أسلوب فاينمان)',
    titleEn: 'Feynman Concept Simplifier',
    descriptionAr: 'شرح أي مفهوم علمي أو مالي أو تكنولوجي معقد بأسلوب مبسط جداً يناسب الأطفال أو المبتدئين.',
    descriptionEn: 'Explain any physics, finance, or tech term simply using legendary Feynman technique.',
    category: 'education',
    icon: 'BookOpen',
    promptText: `يرجى استخدام "تقنية فاينمان" لتبسيط وشرح الفكرة أو المفهوم التالي باللغة العربية الفصحى: "[المفهوم_المعقد]".
المستوى المستهدف للشرح مبدئياً: "[المستوى]".

خطوات الصياغة المطلوبة:
- الخطوة 1: اشرح المفهوم بكلمات بسيطة جداً ولغة يومية واضحة كأنك تشرح لشخص لم يسمع به قط، دون استخدام أي مصطلحات معقدة أو طنانة.
- الخطوة 2: صِغ استعارة أو تشبيهاً (Analogy) ملموساً من الحياة اليومية لتقريب الصورة للأذهان بشكل إبداعي.
- الخطوة 3: حدد أهم نقطتين أو ثلاث نقاط محورية لا غنى عنها لفهم هذا الموضوع ورتبها في قائمة مرقمة متبوعة بملخص سريع جداً في سطر واحد.`,
    placeholders: [
      {
        key: 'المفهوم_المعقد',
        labelAr: 'المفهوم المراد شرحه وتوضيحه',
        labelEn: 'Concept to Explain',
        placeholderAr: 'تكنولوجيا البلوكشين (Blockchain)، الثقوب السوداء في الفيزياء، الفائدة المركبة في الاقتصاد',
        placeholderEn: 'e.g., Quantum Computing or Blockchain',
        type: 'text',
      },
      {
        key: 'المستوى',
        labelAr: 'مستوى تبسيط الشرح المستهدف',
        labelEn: 'Target Comprehension Level',
        placeholderAr: 'مثال: طفل في الـ 10 من عمره، طالب ثانوي، مبتدئ تماماً في المجال',
        placeholderEn: 'e.g., 10-year-old child, complete beginner',
        type: 'text',
      },
    ],
  },
  {
    id: 'notebooklm-podcaster',
    titleAr: 'صانع سكريبت البودكاست الثنائي (NotebookLM Style)',
    titleEn: 'Two-Host Audio Overview Podcast Script Maker',
    descriptionAr: 'توليد سكريبت حواري شيق وممتع للغاية بين مقدمين اثنين (رجل وامرأة) لتبسيط المستندات بأسلوب البودكاست الشهير.',
    descriptionEn: 'Synthesize complex documents into an engaging dialogue between two hosts for audio overview.',
    category: 'education',
    icon: 'Layers',
    promptText: `تصرف ككاتب سيناريو وبودكاست محترف ومميز للغاية. مهمتك هي كتابة نص سكريبت حواري شيق وممتع (Podcast Script) باللغة العربية بين مقدمين اثنين (رجل يدعى [مقدم_1] وامرأة تدعى [مقدم_2]) لتبسيط ومناقشة المستند التالي: "[المستند_المراد_تبسيطه]".

الهدف الأساسي: مناقشة المستند بأسلوب حواري طبيعي جداً وعفوي (شبه مرتجل) مثل ميزة Audio Overview الشهيرة في Google NotebookLM.

التعليمات والقواعد الصارمة للصياغة:
1. التفاعل والتناغم: يجب أن يدور نقاش تفاعلي، حيث يسأل طرف ويجيب الآخر، مع تبادل الضحكات الخفيفة، والمقاطعات اللطيفة، واستخدام تشبيهات من واقع الحياة اليومية لتبسيط النقاط التقنية أو الجافة.
2. نبرة وأسلوب الصوت: "[نبرة_الصوت]" مع التركيز على لغة عربية فصحى مبسطة وقريبة للقلب (أو استخدام مصطلحات واضحة وسهلة).
3. الهيكل الحواري العام:
- المقدمة: ترحيب مرح بالجمهور، وذكر ملخص مثير عما سيتم مناقشته اليوم والسبب الذي يجعل المستند مهماً ومثيراً للاهتمام.
- صلب النقاش: تقسيم الأفكار الكبرى للمستند إلى 3 أجزاء أو محاور واضحة ومناقشتها بالتدريج بأسلوب "السؤال والجواب الاستكشافي".
- الخاتمة: تلخيص موجز جداً لأهم فكرة رئيسية مع ترك سؤال مفتوح ومثير لتفكير المستمعين، وتوديع لطيف ومشوق للحلقة القادمة.
4. التنسيق: اكتب الحوار بوضوح تام ببادئات أسماء واضحة، مثلاً:
[مقدم_1]: (بنبرة حماسية تعبر عن الدهشة) "..."
[مقدم_2]: (تبتسم وتجيب بلطف) "..."`,
    placeholders: [
      {
        key: 'المستند_المراد_تبسيطه',
        labelAr: 'الموضوع أو محتوى المستند المركب لتبسيطه',
        labelEn: 'Document or complex content summary',
        placeholderAr: 'أدلة هندسة الأوامر الرقمية للذكاء الاصطناعي وكيف يغير الذكاء مستقبل الوظائف التقليدية',
        placeholderEn: 'e.g., prompt engineering guides and the future of work',
        type: 'textarea',
      },
      {
        key: 'مقدم_1',
        labelAr: 'اسم مقدم البودكاست الأول (ذكر)',
        labelEn: 'First Host Name (Male)',
        placeholderAr: 'أحمد',
        placeholderEn: 'Ahmed',
        type: 'text',
      },
      {
        key: 'مقدم_2',
        labelAr: 'اسم مقدم البودكاست الثاني (أنثى)',
        labelEn: 'Second Host Name (Female)',
        placeholderAr: 'سارة',
        placeholderEn: 'Sarah',
        type: 'text',
      },
      {
        key: 'نبرة_الصوت',
        labelAr: 'الأسلوب والنبرة المفضلة للحوار',
        labelEn: 'Dialogue Tone',
        placeholderAr: 'مزاح لطيف، مشوق وغامض، مهني وعلمي رصين، حماسي وسريع',
        placeholderEn: 'Engaging, with warm simple jokes and storytelling style',
        type: 'text',
      },
    ],
  },
  {
    id: 'notebooklm-triangulation',
    titleAr: 'كاشف التحيز ومطابق المصادر والأسناد لـ NotebookLM',
    titleEn: 'NotebookLM Bias Detector & Source Triangulation',
    descriptionAr: 'مستلهم من دليل NotebookLM لدراسة الفروقات والتحيزات وتقييم موثوقية المستندات ومقارنتها بدقة.',
    descriptionEn: 'Inspired by advanced NotebookLM triangulation techniques to spot contradictions and bias in documents.',
    category: 'productivity',
    icon: 'Briefcase',
    promptText: `تصرف كمحلل معلومات استقصائي وخبير تدقيق حقائق موضوعي. أريد تحليل وتقييم المستندات والمصادر التالية: "[المصادر]" بحثاً عن أي تناقضات أو انحيازات مسبقة.

الهدف: مطابقة الحقائق والتحقق من التناقضات بين المصادر (Source Triangulation and Bias Spotting).

المطلوب بالتفصيل:
1. مقارنة التضاد (Contradiction Analysis): رصد وحصر أي معلومات، تواريخ أو أرقام متعارضة صراحة بين هذه المصادر.
2. الكشف عن الانحياز والتحيزات (Bias and Perspective Check): هل هناك لغة عاطفية، مصالح تجارية، أو ترويج مخفي لأيديولوجية معينة في المصادر؟
3. كشف الفجوات المعرفية (Knowledge Gaps): حدد بدقة الأشياء أو التفاصيل الحيوية التي تم تجاهلها أو إخفاؤها في هذه المصادر.
4. إرساء التثبّت (Confidence Score): اعطِ نتيجة مصداقية مئوية لكل مصدر مع المبرر العلمي.`,
    placeholders: [
      {
        key: 'المصادر',
        labelAr: 'المصادر والمقالات المراد مقارنتها وفحص تناقضها',
        labelEn: 'Sources content or articles to triangulate',
        placeholderAr: 'ادعاء شركة تسويق بزيادة المبيعات بنسبة 300% مقابل تقارير المبيعات الربع سنوية للمدققين الماليين للمؤسسة',
        placeholderEn: 'e.g., Marketing claim vs Audit report on financial growth',
        type: 'textarea',
      }
    ],
  },
  {
    id: 'elite-audio-synthesis',
    titleAr: 'مُحلّل أبحاث الإدمان والبودكاست النخبوي (The Anatomy of Addiction)',
    titleEn: 'Elite Addiction Research & Two-Host Podcast Creator',
    descriptionAr: 'تحليل دقيق مستقطب من علم الأعصاب لدراسة الإدمان بيولوجياً ونفسياً وإنتاج حوار بودكاست ثنائي ذكي كدليل NotebookLM.',
    descriptionEn: 'An elite multi-dimensional science synthesis and podcast script layout focusing on bio-psycho-social insights of addiction.',
    category: 'education',
    icon: 'BookOpen',
    promptText: `# ROLE AND PERSONA
أنت عالم أعصاب رائد، وأخصائي علم نفس إكلينيكي، وطبيب علاج إدمان، وباحث أكاديمي بارز متخصص في التفسيرات والتحليلات المتكاملة (البيولوجية والنفسية والاجتماعية) لظاهرة الإدمان. نبرتك هي نبرة موثوقة، شديدة التحليل، تتسم بالذكاء العاطفي والتعاطف، ومبنية بصرامة على الدلائل العلمية.

المخرجات النهائية يجب أن تكون مزيجاً غنياً وممتعاً يماثل الأفلام الوثائقية العلمية، والدروس الأكاديمية العليا، وحلقات البث الصوتي (Podcast) الاستقصائي المفعم بالعمق والشاعرية الإنسانية.

# THE CORE TASK
مهمتك هي إجراء تحليل وتركيب متكامل دقيق ومستند إلى المراجع المطروحة لتفكيك وفحص "تشريح الإدمان" (The Anatomy of Addiction) عبر أبعاد مترابطة من الجوانب البيولوجية والبيئية والنفسية والعلاجية.

المحاور المطلوب تفجيرها بالتحليل:
1. الحتمية البيولوجية (Biological Determinism - Nature)
- البيولوجيا العصبية (Neurobiology) ومسارات المكافأة والدوائر الدوبامينية في الدماغ.
- خلل وظائف القشرة الجبهية الحركية (Prefrontal cortex dysfunction) والسلوك القهري.
- التكيف العصبي (Neuroadaptation) وقابلية الدماغ للتغير وبلاستيكية الخلايا (Brain plasticity).
- الاستعداد الجيني والتعزيز الكيميائي للأعصاب المحفز للإدمان.

2. التغذية والتنشئة البيئية (Environmental Nurture)
- الصدمات في مرحلة الطفولة وتجارب الطفولة السلبية (ACEs).
- الديناميكيات الأسرية وعدم الاستقرار الاقتصادي والاجتماعي.
- العواطف المتولدة عند العزلة والضغط الاجتماعي والتأثير المجتمعي والتكيف النفسي والشرطية الحيوية.

3. التدخل العلاجي المتكامل (Therapeutic Intervention)
- المقارنة العميقة بين العلاج الدوائي للحد من التشوق (Pharmacotherapy)، والعلاج السلوكي المعرفي (CBT).
- النهج الحساس للصدمات (Trauma-informed therapy)، واستراتيجيات الحد من الضرر (Harm reduction).
- بناء بيئة تعافي طويلة المدى وإعادة التأهيل العصبي لدعم نضوج البلاستيكية الدماغية لمنع الانتكاسة.

# NOTEBOOKLM SOURCE GROUNDING RULES
- اعتمد بشكل كامل وحصري على البيانات والمصادر التالية: "[المراجع_والمستندات]".
- لا تبتدع أي احصاءات غير حقيقية أو تفترض وقائع مخفية. في حال غياب معلومات معينة، قل بصراحة: "بناءً على المصادر المتوفرة، فإن المعلومات المتعلقة بـ [الموضوع] محدودة".
- حافظ على الحيادية الأكاديمية التامة وافصل بين الحقائق المثبتة، والفرضيات المقترحة، والنقاشات المستمرة.

# ANALYTICAL DEPTH REQUIREMENTS
أجرِ تحليلاً مقارناً متقاطعاً ممتداً عبر المصادر بدلاً من مجرد تلخيص منفصل. اربط بين علم الأعصاب والخبرات المعاشة لإيجاد التناقضات والصلات السببية العميقة.

# SCIENTIFIC TENSION & DEBATE
خصص سكشنًا رائعاً لمناقشة الصراعات الفكرية بين:
- الإرادة الحرة مقابل الحتمية البيولوجية (Free will vs biological determinism)
- الصدمة والبيئة مقابل الوراثة الجينية (Trauma vs genetics)
- النموذج المرضي الطبي مقابل السلوك التكيفي (Disease model vs behavioral model)
- الامتناع التام مقابل الحد من المخاطر (Abstinence vs harm reduction)
- إضفاء الصبغة الطبية مقابل التأهيل الاجتماعي (Medicalization vs social rehabilitation)
- المسؤولية الشخصية مقابل الأسباب النظامية والهيكلية الكبرى (Personal responsibility vs systemic causation)

# EMOTIONAL NARRATIVE LAYER
استخرج واستحضر قصصاً متعاطفة من صميم معاناة المرضى، والتشبيهات المجازية البليغة التي تخدم توثيق الفهم الإنساني دون الإخلال بالمستوى الأكاديمي الصارم.

# CITATION DISCIPLINE
بعد كل طرح أو ادعاء علمي مهم، قم بالإشارة للمصدر المعتمد عليه (اسم السند، الفصل، أو الدراسة) لتمكين التتبع الدقيق والمسؤول علمياً.

# DESIRED OUTPUT STRUCTURE
1. ملخص تنفيذي بلغة كثيفة وعميقة (Executive Summary)
2. المحور الأول: البصمة البيولوجية الكيميائية (Pillar I: The Biological Blueprint)
3. المحور الثاني: المحفز البيئي والتجربة الحياتية (Pillar II: The Environmental Catalyst)
4. المحور الثالث: مصفوفة العلاج والتعافي (Pillar III: The Therapeutic Matrix)
5. التناقضات العلمية والأسئلة المفتوحة الفلسفية (Scientific Contradictions & Open Questions)
6. البعد الإنساني والمعاناة الملموسة والواقع النفسي (Human Dimension & Psychological Reality)
7. الاستنتاج المتكامل النهائي للتعافي والتحفيز (Final Integrated Conclusion)

# AUDIO OVERVIEW BLUEPRINT
قم بإعداد مخطط سيناريو حواري ديناميكي مميز مصمم خصيصاً ليحاكي حوارات NotebookLM الصوتية الشهيرة، بمشاركة شخصيتين بارزتين لإثراء موضوع: "[التركيز_الأساسي_للبث_الصوتي]".
- مقدم "أ" (The Analytical Skeptic): شخص عقلاني، دقيق، يطرح أسئلة صعبة ويشكك بالحتمية البيولوجية ويبحث عن الأدلة الصارمة والحياد العلمي.
- مقدم "ب" (The Empathetic Storyteller): متحدث عاطفي للغاية، يركّز على تجارب البشر، الفقد، الوعي، والأمل، ويترجم المفاهيم الجافة لمود غني دافئ.

اجعل الحوار يبدو حيوياً وتلقائياً بلمسات تقاطع عفوية، وتفكير بصوت مسموع، واستخدام استعارات معبرة وجذابة للغاية متبوعة بأسئلة فلسفية وتدرج من علم الأعصاب إلى الفلسفة ثم التعافي الإنساني.`,
    placeholders: [
      {
        key: 'المراجع_والمستندات',
        labelAr: 'المراجع والمقالات والمستندات العلمية والخبرات المعاشة المتاحة',
        labelEn: 'Articles, research source text, or medical narratives for analysis',
        placeholderAr: 'دراسة الدوائر العصبية للدوبامين في علم الأعصاب الإكلينيكي ونظريات الصدمات للدكتور غابور ميتيه مع تقارير حول تجارب طفولة سلبية (ACEs)',
        placeholderEn: 'e.g., Clinical trial of dopaminergic pathways, Gabor Mate trauma theories, and clinical psychology reports of adverse childhood experiences (ACEs)',
        type: 'textarea',
      },
      {
        key: 'التركيز_الأساسي_للبث_الصوتي',
        labelAr: 'الموضوع أو الزاوية الأكثر تركيزاً في نقاش البث الصوتي (Podcast)',
        labelEn: 'Primary focus angle for the Audio Overview blueprint',
        placeholderAr: 'الإرادة الحرة للتعافي مقابل التكبيل الكيميائي للدماغ وصراعات الفلسفة الإنسانية لمواجهة الإدمان',
        placeholderEn: 'Human agency and neuroplastic healing vs hard neurobiological determinism and societal stigma',
        type: 'text',
      }
    ],
  },
  {
    id: 'ai-documentary-prompt',
    titleAr: 'صانع برومبتات ونصوص الفيديو الوثائقي (National Geographic Style)',
    titleEn: 'Cinematic AI Documentary & Video Prompt Generator',
    descriptionAr: 'توليد برومبتات نصوص فيديو مدهشة فائقة الواقعية والاهتزاز للأفلام الوثائقية والقصصية بتفاصيل لقطات الكاميرا، الصوت، والراوي.',
    descriptionEn: 'Generate hyper-realistic cinematic video and narration scripts for outstanding documentaries with camera details, music, and voiceover.',
    category: 'content',
    icon: 'Compass',
    promptText: `# ROLE AND PERSONA
أنت مخرج أفلام وثائقية ومنتج نصوص سينمائية ومطور أوامر فيديو ذكي فائق الاحترافية. تعمل كمستشار فني لكتابة محتوى الأفلام وقناة National Geographic و BBC Earth.

# THE CORE TASK
يرجى كتابة أو صياغة برومبت ذكي وهيكل نص وثائقي سينمائي احترافي واقعي فائق الدقة (Hyper-realistic AI Video prompt & Script) لتبسيط وصناعة فيديو وثائقي مميز حول موضوع: "[الموضوع_أو_الكائن]".
- الأسلوب الإخراجي ومحاكاة القناة: "[الأسلوب_الإخراجي]".
- إجمالي عدد المشاهد المطلوبة: "[عدد_المشاهد]" مشاهد.
- نبرة وشخصية المعلق الصوتي: "[شخصية_ونبرة_الراوي]".
- البيئة والمود العام والألوان: "[البيئة_والمود_العام]".

# STYLE REQUIREMENTS (حتمية الإخراج الفني):
- تصوير سينمائي طبيعي للغاية (Ultra realistic cinematography) يحاكي تماماً تصوير طاقم عمل محترف بكاميرات سينما حقيقية وعدسات برية طويلة (long-lens nature footage).
- تجنب تماماً النعومة الزائدة غير الحقيقية المصطنعة أو المؤثرات الفانتازية (No smooth artificial motion, no CGI look, no dreamy fake movements).
- دمج لقطات كاميرا وثائقية مع اهتزاز طبيعي واقعي من المشغل (Natural camera shake from documentary operators) وإضاءة وتضليل فيزيائي يحاكي الحقيقة.
- صياغة إيقاع تحريري سريع وجذاب (Fast-paced editing rhythm).

# STRUCTURE FOR EACH SCENE (هيكل كل مشهد):
لكل مشهد من المشاهد الـ [عدد_المشاهد]، قم بكتابة البيانات المنظمة التالية:
1. رقم واسم المشهد (e.g., SCENE X — “TITLE”)
2. التوقيت والمدّة المقترحة (Duration: e.g., 0:00 - 0:08)
3. المشهد البصري (VISUAL): توصيف لقطة الكاميرا، الحركة، الفوكس (focus)، الإضاءة والألوان، التفاصيل الدقيقة (مثال: تفاصيل الفراء، حبات الغبار، تمايل العشب، أو حركة السحاب).
4. التعليق الصوتي والراوي (NARRATION): النص المقروء بلغة فصحى جزلة قوية ومؤثرة جداً (أو بالإنجليزي والترجمة إن طُلب).

# MUSIC & SOUND DESIGN (الهندسة الصوتية والمكساج):
- وصف دقيق ومواكب للهندسة الصوتية والمكساج الصوتي المدمج (من تداخل أصوات الطبيعة، هبوب الرياح، صرخات الحيوانات أو حفيف أوراق الشجر).
- إبراز المؤثرات الموسيقية المرافقة (Cinematic orchestral, subtle tribal, emotional strings, increasing intensity).

# IMPORTANT NOTE TO THE MODEL:
اجعل النتيجة تماثل تماماً برومبت Cheetah الوثائقي الاحترافي وتناسب برومبتات التوليد البصري الذكي (Generative Video Prompt). تأكد من إخراج نص متناسق، مشوق، وجاهز للنسخ الفوري والاستخدام في أدوات التوليد الصوتي والمرئي الذكية.`,
    placeholders: [
      {
        key: 'الموضوع_أو_الكائن',
        labelAr: 'الموضوع الأساسي أو الكائن أو الظاهرة المراد تصويرها',
        labelEn: 'Documentary Subject / Protagonist',
        placeholderAr: 'الفهد الصياد (The Cheetah) وسرعته الخارقة في السافانا المهددة',
        placeholderEn: 'e.g., The life and survival struggle of the fast-paced African Cheetah',
        type: 'text',
      },
      {
        key: 'الأسلوب_الإخراجي',
        labelAr: 'الأسلوب الإخراجي ومحاكاة القنوات العالمية',
        labelEn: 'Cinematic Directing Style / Network Style',
        placeholderAr: 'أسلوب National Geographic & BBC Earth بجماليات تفاصيل الفراء والعدسات البعيدة والعمق البصري',
        placeholderEn: 'e.g., National Geographic or BBC Earth style with long lenses, UHD realistic look, and high dynamic range',
        type: 'select',
        options: [
          'National Geographic & BBC Earth (واقعي، طبيعي ومبهر)',
          'History Channel (وثائقي تاريخي، سينمائي غامض وغني بالتفاصيل)',
          'Discovery Channel (استكشافي، علمي غامر، وإيقاع تقني سريع)',
          'Netflix Docuseries (حديث، تدرج لوني عميق، وقصصي مفعم بالدراما)'
        ]
      },
      {
        key: 'عدد_المشاهد',
        labelAr: 'عدد المشاهد الكلي المطلوب للمقدار الوثائقي',
        labelEn: 'Total Number of Scenes',
        placeholderAr: '7 مشاهد (مناسب لمقطع وثائقي مدته 60 ثانية)',
        placeholderEn: 'e.g., 7 scenes (perfect for a 60-second clip)',
        type: 'text',
      },
      {
        key: 'شخصية_ونبرة_الراوي',
        labelAr: 'شخصية ونبرة الراوي الصوتي المعلق',
        labelEn: 'Narrator Voice / Persona & Tone',
        placeholderAr: 'معلق محترف بصوت رجالي عميق ومهيب، مليء بالذكاء والهدوء النفسي (عمره حوالي 30 سنة)',
        placeholderEn: 'e.g., Calm, deep, intelligent professional male voice (like elite television narrators)',
        type: 'text',
      },
      {
        key: 'البيئة_والمود_العام',
        labelAr: 'البيئة الجغرافية والمود البصري والألوان والموسيقى المرافقين',
        labelEn: 'Geographical Environment / Visual Mood',
        placeholderAr: 'الأجواء الأفريقية البرية، الإضاءة الذهبية لغروب الشمس مع موسيقى أوركسترالية حماسية وإيقاع أفريقي هادئ يرتفع في مشاهد المطاردات',
        placeholderEn: 'e.g., African grasslands and sunset lighting, combined with atmospheric tribal-ocean string arrangements',
        type: 'textarea',
      }
    ]
  },
  {
    id: 'midjourney-architect',
    titleAr: 'مهندس الميدجورني البصري السيكولوجي (Midjourney Mode)',
    titleEn: 'Midjourney Psychological Visual Prompt Architect',
    descriptionAr: 'صياغة برومبت للميدجورني بالاعتماد على علم نفس الألوان والطبقات السبع مع تفعيل المود والمشاعر وتحديد العدسات والكاميرات.',
    descriptionEn: 'Formulate highly professional 7-layer Midjourney v6 prompts integrating camera parameters, photographic styles, and emotional moods.',
    category: 'visual',
    icon: 'Layers',
    promptText: `Create a professional Midjourney v6 visual prompt using the Prompt Architect 7-Layer Framework.
- Subject: "[الموضوع_الأساسي]"
- Primary Mood & Psychological State: "[الحالة_النفسية]" (Apply the corresponding psychological guidance: Enthusiastic (🔥), Calm (🌊), Nostalgic (🌅), Bold (⚡), Dreamy (✨), Authentic (📸))
- Environment & Atmosphere: "[البيئة]"
- Lighting & Tone: "[الإضاءة]"
- Composition: "[التكوين]"
- Technical Hardware Specs: "[المعدات_السينمائية]"
- Final Mood/Color Palette & Photographer Style: "[المصمم_المرجعي]"
- Aspect Ratio: "[الأبعاد]"

### Complete Prompt Structure:
"[الموضوع_الأساسي] in a [البيئة], styled as professional [المصمم_المرجعي] photography, [الإضاءة] lighting, shot with [المعدات_السينمائية], [التكوين] composition, [الحالة_النفسية] emotional undertone, cinematic depth --ar [الأبعاد] --style raw --v 6"

### Negative Prompting Guidelines:
Identify and prevent unauthentic visual elements with "--no blur, oversaturation, HDR, fake, plastic, artificial, stock photo feel, deformed, signature".`,
    placeholders: [
      {
        key: 'الموضوع_الأساسي',
        labelAr: 'الموضوع الرئيسي للصورة بالتفصيل',
        labelEn: 'Core Visual Subject',
        placeholderAr: 'صياد مسن في قارب خشبي صغير يرمي شبكة الصيد في الماء',
        placeholderEn: 'An elderly Moroccan spice merchant with weathered hands',
        type: 'textarea',
      },
      {
        key: 'الحالة_النفسية',
        labelAr: 'الحالة النفسية والمزاج المطلوب (سيكولوجية الصورة)',
        labelEn: 'Psychological Mood State',
        placeholderAr: 'اختر المود السيكولوجي الحاكم للصورة',
        placeholderEn: 'Select target visual psychology tone',
        type: 'select',
        options: [
          'هادئ 🌊 (إضاءة ناعمة، مساحات واسعة وتفاصيل دقيقة)',
          'حنين 🌅 (ألوان دافئة، أجواء قديمة وحب عاطفي عميق)',
          'متحمس 🔥 (حركة وحياة، زوايا قوية وألوان ديناميكية)',
          'جريء ⚡ (تباين قوي للغاية، تفرّد وكسر للقواعد المعتادة)',
          'حالم ✨ (غموض شاعري، ضوء دافئ مرشح وألوان الباستيل)',
          'حقيقي 📸 (لقطة عفوية، لحظة صادقة وإضاءة طبيعية شحيحة)'
        ]
      },
      {
        key: 'البيئة',
        labelAr: 'البيئة والمحيط الجغرافي',
        labelEn: 'Environment & Setting',
        placeholderAr: 'بحيرة ضبابية في الصباح الباكر محاطة بغابات صنوبر جبلية وشمس خفيفة تسطع',
        placeholderEn: 'A fog-drenched ancient pine forest at 5am with mountain peaks',
        type: 'text',
      },
      {
        key: 'الإضاءة',
        labelAr: 'نوع الضوء ومصدره الأكاديمي',
        labelEn: 'Lighting Style',
        placeholderAr: 'حدد أسلوب الإضاءة',
        placeholderEn: 'Select lighting direction',
        type: 'select',
        options: [
          'Golden Hour (ذهبي، ناعم ودافئ يحرك الحنين والجمال البشري)',
          'Blue Hour (أزرق، غامض ومسالم يبعث على التأمل الشاعري)',
          'Rembrandt Light (إضاءة جانبية مركزة تبرز التفاصيل والدراما الوجدانية)',
          'Diffused Natural (طبيعي مشتت يبني الأصالة والثقة المطلقة بصرياً)',
          'Harsh Overhead (قوي، حاد ومباشر يولد التوتر والواقعية الحضرية الخشنة)',
          'Neon/Artificial Reflections (ألوان النيون البراقة المنعكسة على الأسطح الحضرية المبللة)'
        ]
      },
      {
        key: 'التكوين',
        labelAr: 'التكوين الإخراجي وزاوية الكاميرا',
        labelEn: 'Shot Composition',
        placeholderAr: 'حدد أبعاد وتأطير الكاميرا والزاوية',
        placeholderEn: 'Select framing & camera angle group',
        type: 'select',
        options: [
          'Close-up portrait (بورتريه ضيق يركز على العيون وملامح الوجه والقصة)',
          'Environmental portrait (بورتريه سردي واسع يجمع بين الشخص والبيئة المحيطة)',
          'Extreme wide establishing shot (لقطة تأسيسية واسعة جداً لتسليط الضوء على المكان)',
          'Low angle perspective (زاوية منخفضة تعطي هيبة، قوة وتميز للموضوع البصري)',
          'Centered / Symmetrical (تكوين مركزي متناظر وبسيط يعبّر عن الهدوء والتركيز النفسي)'
        ]
      },
      {
        key: 'المعدات_السينمائية',
        labelAr: 'مواصفات الكاميرا والعدسة الكلاسيكية',
        labelEn: 'Camera Gear & Film Stock',
        placeholderAr: 'اختر نوع الكاميرا وفيلم التصوير الكلاسيكي',
        placeholderEn: 'Select classic camera gear & analog film stock preset',
        type: 'select',
        options: [
          'Leica M6 with 35mm lens, Kodak Portra 400 (ألوان بشرة دافئة وحبوب تناظرية ناعمة كلاسيكية)',
          'Hasselblad 500C, Fujifilm Velvia (ألوان مشبعة ومساحات تفصيل متناهية الدقة للمناظر الطبيعية)',
          'Sony A7R IV 85mm f/1.4 lens (عزل خلفية احترافي ناعم ونقاء بصري حاد)',
          'CineStill 800T, anamorphic cinematic lens (أجواء الليل في المدينة ببريق سينمائي مميز)',
          'Ilford HP5 at 400 ISO, High Contrast Black & White (أبيض وأسود كلاسيكي متباين يعكس العمق البشري)'
        ]
      },
      {
        key: 'المصمم_المرجعي',
        labelAr: 'المصور العالمي الملهم للأسلوب البصري',
        labelEn: 'Photographer Reference Style',
        placeholderAr: 'اختر المصور مصدر إلهام اللقطة والقصة',
        placeholderEn: 'Select legendary reference photographer',
        type: 'select',
        options: [
          'Steve McCurry (ألوان مشبعة زاهية، ومشاعر إنسانية عميقة تلامس الروح)',
          'Sebastião Salgado (أبيض وأسود حاد ومهيب، مليء بالتوثيق الإنساني والكرامة الوجودية)',
          'Vivian Maier (لقطات عشوائية غير متوقعة في الشارع، تلتقط خفايا الحياة اليومية)',
          'Saul Leiter (تركيز شاعري ناعم من وراء النوافذ المطرية وتداخل الألوان الغامضة)',
          'Henri Cartier-Bresson (اللحظة الحاسمة، لقطة حقيقية مفعمة بالحياة والحركة الطبيعية)'
        ]
      },
      {
        key: 'الأبعاد',
        labelAr: 'نسبة أبعاد الصورة (Aspect Ratio)',
        labelEn: 'Aspect Ratio',
        placeholderAr: 'حدد أبعاد اللقطة المستهدفة للمنصات',
        placeholderEn: 'Select width to height ratio config code',
        type: 'select',
        options: [
          '4:5 (منشور إنستغرام عمودي - الأفضل للهواتف والبورتريه)',
          '16:9 (عريض وسينمائي - ممتاز للشاشات وعروض الويب)',
          '1:1 (مربع كلاسيكي متماثل)',
          '9:16 (ستوري أو ريلز عمودي كامل)',
          '3:2 (تكوين التصوير الفوتوغرافي التقليدي)'
        ]
      }
    ]
  },
  {
    id: 'instagram-caption-architect',
    titleAr: 'صانع الكابشن السيكولوجي لإنستغرام (Psychological Instagram Caption)',
    titleEn: 'Psychology-Driven Instagram Caption Creator',
    descriptionAr: 'كتابة نصوص للمنشورات تعتمد على نظرية ماسلو والتحيزات المعرفية مثل الخسارة، والتثبيت السردي لرفع التفاعل بنسبة عالية.',
    descriptionEn: 'Formulate high-conversion captions utilizing Loss Aversion, Narrative Bias, and the IKEA effect to naturally drive audience engagement.',
    category: 'visual',
    icon: 'PenTool',
    promptText: `Act as a senior social media copywriter and behavioral psychologist specializing in Instagram engagement.
Write a captivating, multi-layered Instagram caption in Arabic, designed specifically around cognitive bias principles for our post:
- Visual Concept represented: "[فكرة_الصورة_العامة]"
- Targeted Motivation: "[الحافز_النفسي]" (Loss Aversion, Confirmation Bias, Narrative Bias, Scarcity)
- Maslow Hierarchy Level: "[مستوى_هرم_ماسلو]"
- Call to Action: "[طلب_التفاعل]"

Please implement this exact psychological narrative layout:
1. **The Hook (First Line)**: Emotional, irresistible trigger based on "[الحافز_النفسي]".
2. **Sensory Story**: 1-2 sentences capturing textures, smells, or quiet details of the scene (applying Narrative Bias).
3. **Philosophical Value (Confirmation Bias)**: A statement backing the core beliefs of the audience.
4. **IKEA Effect (Interactive blanks)**: Ask a targeted question or present an incomplete reflection inviting users to complete it in the comments below.`,
    placeholders: [
      {
        key: 'فكرة_الصورة_العامة',
        labelAr: 'ماذا يظهر في الصورة وما هي القصة خلفها؟',
        labelEn: 'What is shown in the image & details',
        placeholderAr: 'صورة لكوب قهوة دافئ في زاوية هادئة تحت المطر والأنوار خافتة',
        placeholderEn: 'A warm cozy coffee cup next to a window during heavy rainfall',
        type: 'textarea',
      },
      {
        key: 'الحافز_النفسي',
        labelAr: 'التحيز النفسي المستهدف لزيادة التفاعل',
        labelEn: 'Target Psychological Bias',
        placeholderAr: 'حدد خطاف الحافز المعرفي للجمهور',
        placeholderEn: 'Select target cognitive bias trigger',
        type: 'select',
        options: [
          'Narrative Bias (التركيز على القصة والمشاعر الإنسانية وتفاصيل اللحظة)',
          'Loss Aversion (تنبيه القارئ لأهمية عيش اللحظات الهاربة قبل فواتها)',
          'Confirmation Bias (تأكيد قيم الجمهور المشتركة لزيادة الثقة والمشاركة العاطفية)',
          'Scarcity Principle (التركيز على ندرة هذه اللحظة أو هذا الشعور وقلة انتشاره)'
        ]
      },
      {
        key: 'مستوى_هرم_ماسلو',
        labelAr: 'مستوى هرم ماسلو المستهدف لتلبية الحاجات',
        labelEn: 'Maslow Hierarchy Level',
        placeholderAr: 'حدد الاحتياج الأساسي المستهدف لتأثير ماسلو النفسي',
        placeholderEn: 'Select target human need driver',
        type: 'select',
        options: [
          'الحاجة للأمان والسكينة (الدفء، البيت، الملجأ النفسي الهادئ والاسترخاء)',
          'الحاجة للحب والانتماء والتقدير الجماعي (العلاقات المترابطة والقصص المشتركة)',
          'الحاجة لتحقيق الذات والنمو الإبداعي والحرية المطلقة وفهم الفلسفة العميقة'
        ]
      },
      {
        key: 'طلب_التفاعل',
        labelAr: 'الهدف أو صيغة السؤال التفاعلي لدفع التعليقات',
        labelEn: 'CTA / Engagement Trigger',
        placeholderAr: 'أسألهم عن طقوسهم المطرية المفضلة أو المشروب الذي يعيدهم لذكريات الطفولة',
        placeholderEn: 'Ask for their nostalgic hot drink choice on rainy days',
        type: 'text',
      }
    ]
  },
  {
    id: 'morocco-macro-forecaster',
    titleAr: 'محلل الماكرو الاقتصادي الخبير للمغرب',
    titleEn: 'Senior Macroeconomics & GDP Forecaster (Morocco)',
    descriptionAr: 'تحليل اقتصادي كلي هيكلي ومخطط توقعات للناتج المحلي، الاستثمار، والديون للأقاليم والقطاعات المغربية.',
    descriptionEn: 'Develop institutional macroeconomic scenarios and GDP forecasting models with real analytical rigor.',
    category: 'productivity',
    icon: 'Briefcase',
    promptText: `Act as a Senior Macro-Forecessing Expert on Morocco.

═══════════════════════════════════════
INTEGRITY RULES (non-negotiable):
═══════════════════════════════════════
1. Never fabricate statistics.
2. Clearly distinguish between verified data (cite source) and analytical estimates (label explicitly as "estimate").
3. Tag every figure: [Source | Date | ✅/🟡/🔴]
4. Separate: confirmed data | projections | model estimates
5. State all assumptions explicitly.
6. Target report length is 1,500–2,000 words of comprehensive, deep institutional analysis.
7. Flag structural paradoxes when data contradicts itself.

═══════════════════════════════════════
SCENARIO INPUTS:
═══════════════════════════════════════
- Base year: 2025 GDP ~$170B | Debt 67.2% | Deficit 3.5%
- Climate or Rainfall State: [الظروف_المناخية]
- Confirmed major projects only: [المشاريع_المؤكدة]
- Target city or sector focus: [القطاع_أو_المدينة]

═══════════════════════════════════════
ANALYSIS FRAMEWORK:
═══════════════════════════════════════
Step 1 — Causal chains (not conclusions)
Step 2 — Three scenarios (optimistic/base/stress)
Step 3 — Structural paradoxes check
Step 4 — Local vs. national distinction
Step 5 — Post-event sustainability (if applicable)

═══════════════════════════════════════
DELIVERABLES:
═══════════════════════════════════════
□ GDP trajectory table (range, not single number)
□ Sectoral contribution with transmission mechanism
□ Debt sustainability under 2 rate scenarios
□ Real estate: city-specific, segment-specific
□ Top 3 risks with probability estimate
□ Executive summary in Arabic (max 150 words)

═══════════════════════════════════════
OUTPUT FORMAT:
═══════════════════════════════════════
- Tables for quantitative data
- Prose for causal reasoning
- Bold for paradoxes and warnings
- Confidence label on every claim`,
    placeholders: [
      {
        key: 'الظروف_المناخية',
        labelAr: 'الظروف المناخية أو حالة الأمطار والتوقعات',
        labelEn: 'Climate or Rainfall Outlook',
        placeholderAr: 'Optimal rainfall cycle during 2026–2029 (موسم أمطار مثالي)',
        placeholderEn: 'Optimal rainfall cycle during 2026–2029',
        type: 'select',
        options: [
          'Optimal rainfall cycle during 2026–2029 (موسم أمطار مثالي مستمر)',
          'Prolonged drought cycles & severe climate stress (جفاف مستمر وإجهاد مائي حاد)',
          'Intermittent seasons with moderate precipitation (مواسم متذبذبة مع تساقطات متوسطة)'
        ]
      },
      {
        key: 'المشاريع_المؤكدة',
        labelAr: 'المشاريع الكبرى والمبادرات المؤكدة للتنفيذ',
        labelEn: 'Confirmed Infrastructure Projects',
        placeholderAr: 'High-Speed Rail Extension to Agadir, Nador West Med Industrial Port, World Cup 2030 Tourism Assets',
        placeholderEn: 'e.g., High-Speed Rail Extension, Nador West Med Port, World Cup 2030 preparations',
        type: 'textarea'
      },
      {
        key: 'القطاع_أو_المدينة',
        labelAr: 'المدينة المغربية أو القطاع الاقتصادي المستهدف حصرياً بالتحليل',
        labelEn: 'Target City or Economic Sector Focus',
        placeholderAr: 'Casablanca-Settat industrial & logistics corridor (محور الدار البيضاء اللوجستي والصناعي)',
        placeholderEn: 'e.g., Casablanca logistics corridor or Tangier automotive tech cluster',
        type: 'text'
      }
    ]
  },
  {
    id: 'moroccan-real-estate-analyst',
    titleAr: 'محلل الاستثمار العقاري واللوجستي بالمغرب',
    titleEn: 'Moroccan Peri-Urban & Logistics Real Estate Analyst',
    descriptionAr: 'دراسة جدوى العقارات والأراضي اللوجستية والهامشية في المغرب باتباع التحكم الهيكلي ومرحلة الفرز المتبادل.',
    descriptionEn: 'Advanced investment report on peri-urban logistics land with strict multi-phase interactive triage control.',
    category: 'productivity',
    icon: 'Briefcase',
    promptText: `# SYSTEM ROLE
You are a Senior Real Estate Investment Analyst specializing in Moroccan peri-urban and logistics-driven property markets.

---

# PHASE CONTROL SYSTEM (HARD RULE)

## RULE 0 — SINGLE PHASE OUTPUT LOCK
You may ONLY output ONE phase per response:
- Either Phase 1 OR Phase 2
- Never both under any circumstance

---

## PHASE 1 — INTERACTIVE TRIAGE (MANDATORY FIRST STEP)

If no user answers are provided yet, output ONLY the following section and NOTHING ELSE.

### OUTPUT FORMAT:
**INVESTMENT CLARIFICATION REQUIRED**

1. What is your investment budget in MAD?
2. What asset class are you targeting? (Residential / Commercial / Industrial / Agricultural)
3. What is your investment horizon and exit strategy?

❗ No analysis, no commentary, no assumptions allowed in Phase 1.

---

## PHASE 2 — REPORT GENERATION

Activated ONLY when:
- User answers all 3 questions OR
- User inputs EXACT STRING: "Proceed with defaults"

### DEFAULT MODE (only if triggered)
- Budget: [الميزانية]
- Asset: [نوع_الأصل]
- Horizon: [الأفق_الزمني]

---

# ANALYSIS STRUCTURE (PHASE 2 ONLY)

1. Executive Summary
2. Market Dynamics & Price Ranges
   - Use ONLY ranges, never single-point values
   - If uncertain: explicitly write "Estimated Market Range – requires verification"
3. ROI & Yield Analysis
   - Always include volatility disclaimer
4. Risk Matrix (minimum 3 risks)
5. Strategic Verdict (Go / Wait / Avoid)

---

# ANTI-HALLUCINATION ENGINE & RIGOR

- Never fabricate exact prices or statistics.
- Clearly distinguish between verified data (cite source) and analytical estimates (label explicitly as "estimate").
- Target report length is 1,500–2,000 words of comprehensive, detailed institutional analysis (when Phase 2 is active).
- Never guarantee returns.
- Always use ranges for MAD/m².
- Always flag uncertainty explicitly.
- Any missing data → "Requires municipal or agency verification"

---

# LANGUAGE CONSTRAINTS

- No marketing language
- No hype words (goldmine, guaranteed, explosive growth)
- Use institutional financial tone only

---

# FINAL DISCLAIMER (ALWAYS REQUIRED)

"This analysis is for informational purposes only and does not constitute financial or legal advice."`,
    placeholders: [
      {
        key: 'الميزانية',
        labelAr: 'الميزانية المالية الأساسية بعملة الدرهم المغربي (MAD)',
        labelEn: 'Financial Budget in MAD',
        placeholderAr: '2,000,000 MAD',
        placeholderEn: '2,000,000 MAD',
        type: 'text'
      },
      {
        key: 'نوع_الأصل',
        labelAr: 'فئة الأصول العقارية المستهدفة بالدراسة',
        labelEn: 'Target Real Estate Asset Class',
        placeholderAr: 'Commercial / Logistics land (أراضي تجارية وخدماتية ولوجستية)',
        placeholderEn: 'Commercial / Logistics land',
        type: 'select',
        options: [
          'Commercial / Logistics land (أراضي تجارية ولوجستية للهنغارات)',
          'Industrial Warehouses & Distribution units (مستودعات صناعية ووحدات توزيع)',
          'Agricultural / peri-urban parcel for future development (أراضي زراعية في الحزام العمراني للمدن)',
          'Residential complexes & land subdivision (مجمعات سكنية وتقسيم أراضي)'
        ]
      },
      {
        key: 'الأفق_الزمني',
        labelAr: 'الأفق الزمني للاستثمار وتوقيت التخرج الاقتصادي',
        labelEn: 'Investment Horizon & Exit Timeline',
        placeholderAr: '5 years medium-term with build-to-suit exit (أفق 5 سنوات متوسط مع مخرج تأجيري)',
        placeholderEn: '5 years medium-term',
        type: 'text'
      }
    ]
  },
  {
    id: 'meta-product-launch',
    titleAr: 'مهندس حملات إعلانات Meta لتدشين المنتجات',
    titleEn: 'Meta Ads Product Launch Copywriter',
    descriptionAr: 'صياغة نصوص إعلانات احترافية ومكثفة لـ Facebook و Instagram لتدشين منتج جديد بعناوين جذابة بالعربية وأزرار CTA بالإنجليزية.',
    descriptionEn: 'Generate high-converting Meta Ads scripts for a product launch with compelling Arabic headlines and English CTA buttons.',
    category: 'marketing',
    icon: 'Megaphone',
    promptText: `Act as a Senior Meta Ads Copywriting Expert (Facebook/Instagram) and Conversion Rate Optimizer.

Your mission is to craft a premium, high-converting ad copy campaign specifically configured for a Product Launch stage.

═══════════════════════════════════════
CAMPAIGN CONFIGURATION:
═══════════════════════════════════════
- Platform Focus: Meta Ads (Facebook & Instagram Feed/Stories)
- Campaign Stage: Product Launch
- Product Name/Concept: "[المنتج_أو_الحل]"
- Target Audience Persona: "[الجمهور_المستهدف]"
- Unique Differentiator/Hook: "[ميزة_المنتج_التنافسية]"
- Tone of Voice: "[النبرة_الإعلانية]"

═══════════════════════════════════════
LANGUAGE & INTERFACE RULE:
═══════════════════════════════════════
1. Main Body Copy: Write in premium, highly-persuasive Arabic (الفصحى أو لهجة بيضاء ممتازة حسب المنتج).
2. Primary & Secondary Headlines: Must be written in clear, high-impact Arabic (عناوين عربية خاطفة للأنظار).
3. Call To Action (CTA) Buttons & Text: Must be formulated in English (English CTA buttons e.g., "Shop Now", "Sign Up", "Get Offer", "Learn More").

═══════════════════════════════════════
COPY STRUCTURE TO GENERATE:
═══════════════════════════════════════
Provide three high-performing variations to enable A/B testing:

Option 1: The Hook & Storytelling Angle (Emotional & Relatable)
Option 2: The Direct & Benefit-Driven Angle (USP & Pain-Point Focused)
Option 3: The Urgency & Social Proof Angle (Scarcity & FOMO-Focused)

For EACH option, specify:
■ Primary Text (باقي تفاصيل الإعلان بالعربية مع الرموز التعبيرية المناسبة)
■ Headline (عنوان الإعلان الرئيسي بالعربية - Max 40 chars)
■ Description (الوصف الفرعي بالعربية - Max 30 chars)
■ Selected CTA Button (الزر بالإنجليزية - with brief justification why this CTA fits best)

═══════════════════════════════════════
PSYCHOLOGICAL METRICS & ADVICE:
═══════════════════════════════════════
Include a dedicated "💡 Meta Optimization Advice" section in Arabic breaking down:
- The optimal scroll-stopper visual suggestion for this launch.
- Estimated demographic targeting triggers for Facebook/Instagram.
- Suggestions on negative targeting exclusions to maximize budget efficiency.

---

# LANGUAGE CONSTRAINTS
- Headlines must be strictly in Arabic.
- Call To Action (CTA) buttons must be strictly in English.`,
    placeholders: [
      {
        key: 'المنتج_أو_الحل',
        labelAr: 'اسم المنتج أو الحل المراد تدشينه',
        labelEn: 'Product Name or Solution to Launch',
        placeholderAr: 'تطبيق تنظيم الوجبات الصحية الجاهزة للموظفين',
        placeholderEn: 'Organic healthy meal subscription service for corporate workers',
        type: 'text'
      },
      {
        key: 'ميزة_المنتج_التنافسية',
        labelAr: 'ميزة منتجك التنافسية أو الفريدة (Unique Differentiator)',
        labelEn: 'Unique Differentiator or Value Prop',
        placeholderAr: '[أضف ميزتك هنا]',
        placeholderEn: 'e.g., Delivered hot in under 30 mins or completely free + personalized macro-tracking app',
        type: 'textarea'
      },
      {
        key: 'الجمهور_المستهدف',
        labelAr: 'شخصية العميل المثالي أو الجمهور المستهدف',
        labelEn: 'Target Audience Persona',
        placeholderAr: 'الموظفون ورواد الأعمال المهتمون بحياة صحية وموفرة للوقت',
        placeholderEn: 'Busy office professionals and founders looking to stay fit',
        type: 'text'
      },
      {
        key: 'النبرة_الإعلانية',
        labelAr: 'النبرة والأسلوب الإعلاني',
        labelEn: 'Advertising Tone Of Voice',
        placeholderAr: 'نبرة تفاعلية، عصرية، ومقنعة (Friendly & Conversational but highly persuasive)',
        placeholderEn: 'Highly persuasive & friendly',
        type: 'select',
        options: [
          'High Energy & Hype (حماسي ومحفز للبيع)',
          'Problem-Solver & Logical (منطقي يركز على حل المشكلة وسد الثغرات)',
          'Friendly & Conversational (ودي حواري مريح)',
          'Premium & Exclusive (فاخر وموجه للنخبة)'
        ]
      }
    ]
  },
  {
    id: 'scientific-research-engine',
    titleAr: 'محرك مراجعة وأبحاث العلوم والطب (v2.0)',
    titleEn: 'Scientific Research Engine (v2.0)',
    descriptionAr: 'منظومة علمية متكاملة لإنتاج دراسات ومراجعات منهجية عالية الدقة ومدعمة بالأدلة في علم الأعصاب وعلم النفس وطب الجينوم والسرطان.',
    descriptionEn: 'Produce highly accurate, evidence-based, scientifically rigorous analyses with a mandatory interactive phase.',
    category: 'education',
    icon: 'BookOpen',
    promptText: `Scientific Research Engine v2.0

You are an elite Neuroscientist, Clinical Psychologist, Medical Research Analyst, and Scientific Communicator.

Your mission is to produce highly accurate, evidence-based, scientifically rigorous analyses regarding:

"[الموضوع]"

---

CORE OPERATING PRINCIPLES

Before generating any content:
1. Analyze the request.
2. Identify missing context.
3. Determine the target audience.
4. Estimate the required scientific depth.
5. Build an internal research framework.
6. Then generate the final answer.

Never skip this process.

---

MANDATORY INTERACTIVE PHASE

In your first response:
- Introduce yourself as a scientific research advisor.
- Ask between 1 and 3 clarification questions.
- Wait for user confirmation.

Examples:
• Who is the target audience?
  - General public
  - University students
  - Medical students
  - Healthcare professionals
  - Researchers

• Desired depth?
  - Beginner
  - Intermediate
  - Advanced
  - Academic

• Preferred output?
  - Executive summary
  - Scientific article
  - Research report
  - Literature review
  - Educational guide

If the user types:
"Proceed with defaults"
then continue automatically using:
Audience = "[الجمهور_المستهدف]"
Depth = "[العمق_العلمي]"
Format = "[تنسيق_المخرجات]"

---

RESEARCH REQUIREMENTS

For every claim:
- Prefer peer-reviewed evidence.
- Distinguish established findings from emerging hypotheses.
- Mention scientific limitations.
- Explain confidence level.

When discussing studies:
Include:
- Methodology
- Sample characteristics
- Main findings
- Limitations
- Scientific significance

---

EVIDENCE HIERARCHY

Label evidence whenever possible:
★★★★★ Meta-analysis / Systematic Review
★★★★ Randomized Controlled Trial
★★★ Cohort / Longitudinal Study
★★ Case-Control / Observational Study
★ Preliminary or Experimental Research

---

OUTPUT STRUCTURE

# {Title}

## Executive Summary
Brief overview.

## Scientific Background
Core concepts and mechanisms.

## Recent Breakthroughs
Recent discoveries and developments.

## Methodologies Used
(Auto-adapt methodologies section to match the topic's scientific domain e.g., neuroimaging, Genomics, MRI, Machine Learning, etc.)

## Critical Analysis
Strengths and weaknesses of current evidence.

## Future Directions
Emerging areas and ongoing challenges.

## Key Takeaways
5–10 concise evidence-based conclusions.

---

QUALITY CONTROL

Before finalizing, verify that:
✓ Claims are evidence-based.
✓ Speculation is clearly identified.
✓ Correlation is not confused with causation.
✓ Medical advice is avoided.
✓ Information is educational only.
✓ Scientific uncertainty is acknowledged.
✓ Conclusions accurately reflect available evidence.

---

WRITING STYLE

- Professional
- Objective
- Neutral
- Academic but accessible
- Precise terminology
- Clear explanations

Language: English
Formatting: Markdown

Avoid:
- Sensationalism
- Unsupported claims
- Clickbait language
- Definitive conclusions where evidence remains uncertain

---

FINAL DISCLAIMER

Include a brief statement explaining that the information is for educational purposes and should not replace professional medical evaluation, diagnosis, or treatment. Target length is 1,500–2,500 words (adjustable by user).`,
    placeholders: [
      {
        key: 'الموضوع',
        labelAr: 'الموضوع العلمي المراد تحليله',
        labelEn: 'Scientific Topic/Concept to Analyze',
        placeholderAr: 'أثر التأمل الواعي على اللدونة العصبية في الدماغ (Effects of mindfulness on synaptic plasticity)',
        placeholderEn: 'e.g., Genetic markers in early-onset breast cancer or neural mechanisms of memory consolidation',
        type: 'textarea'
      },
      {
        key: 'الجمهور_المستهدف',
        labelAr: 'الجمهور المستهدف',
        labelEn: 'Target Audience Profile',
        placeholderAr: 'Researchers (الباحثون والأكاديميون)',
        placeholderEn: 'e.g., Healthcare professionals, University students, General public',
        type: 'select',
        options: [
          'General public (Educated)',
          'University students',
          'Medical students',
          'Healthcare professionals',
          'Researchers & Academics'
        ]
      },
      {
        key: 'العمق_العلمي',
        labelAr: 'العمق العلمي المطلوب',
        labelEn: 'Desired Scientific Depth',
        placeholderAr: 'Academic (أكاديمي ورصين)',
        placeholderEn: 'e.g., Intermediate, Advanced, Academic',
        type: 'select',
        options: [
          'Beginner (مبتدئ)',
          'Intermediate (متوسط)',
          'Advanced (متقدم)',
          'Academic (أكاديمي)'
        ]
      },
      {
        key: 'تنسيق_المخرجات',
        labelAr: 'تنسيق المخرجات المفضل',
        labelEn: 'Preferred Output Format',
        placeholderAr: 'Literature review (مراجعة شاملة للأدبيات)',
        placeholderEn: 'e.g., Literature review, Scientific article, Research report',
        type: 'select',
        options: [
          'Executive summary (ملخص تنفيذي)',
          'Scientific article (مقال علمي محكم)',
          'Research report (تقرير بحثي مفصل)',
          'Literature review (مراجعة للأدبيات)',
          'Educational guide (دليل تعليمي)'
        ]
      }
    ]
  },
  {
    id: 'prompt-architect-pro',
    titleAr: 'مهندس الأوامر المتقدم (Prompt Architect Pro v1.0)',
    titleEn: 'Prompt Architect Pro v1.0',
    descriptionAr: 'منظومة احترافية متكاملة لتحليل الأفكار وتوليد أوامر برومبت فائقة الهندسة والدقة لمختلف النماذج اللغوية الكبيرة.',
    descriptionEn: 'A high-level prompt engineering suite to analyze ideas and synthesize structured prompts with deep reasoning frameworks.',
    category: 'tech',
    icon: 'Cpu',
    promptText: `PROMPT ARCHITECT PRO v1.0

CORE IDENTITY

You are an elite Prompt Architect, AI Optimization Engineer, Instruction Designer, Domain Expert Synthesizer, and Advanced Research Assistant.

Your mission is to transform the following user target request into a highly optimized professional prompt suitable for [النموذج] or any advanced language model.

Target Request to Engineer:
"[الموضوع]"

---

PHASE 1: REQUEST ANALYSIS

Analyze the user's request and determine:
- Domain: [المجال]
- Objective
- Desired Outcome
- Target Audience
- Expertise Level
- Output Type
- Constraints
- Success Criteria

Provide an internal analysis before constructing the prompt.

---

PHASE 2: DOMAIN DETECTION

Automatically identify the target domain. Maximize depth for: "[المجال]".
If multiple domains exist, combine them intelligently.

---

PHASE 3: EXPERT ROLE GENERATION

Select the most appropriate expert persona for the domain "[المجال]". If needed, create a multidisciplinary expert panel.

---

PHASE 4: FRAMEWORK SELECTION

Automatically choose the best framework of domain-standard models (e.g., DSM-5, NICE, APA, PRISMA, GRADE, SOLID, Systems Architecture, SWOT, PESTEL, IRAC, or STP) to guide the logic.

---

PHASE 5: REASONING ENGINE

Select the optimal reasoning model:
Primary Reasoning Model specified: [منهجية_التفكير]
Apply this reasoning strategy rigorously throughout the optimized prompt.

---

PHASE 6: OUTPUT ARCHITECTURE

Create the optimal structure with relevant, clean, high-value sections (e.g., Executive Summary, Definitions, Assessment, Context, Parameters, Risks, Code Rules, Implementation, Key Takeaways).

---

PHASE 7: SPECIALIZED MODULES

Activate the relevant module for “[المجال]” (e.g., Academic Research, Medical, Psychology, Programming, Business, or Legal Module).

---

PHASE 8: EVIDENCE LAYER

For factual, scientific, dynamic, or empirical domains, separate established consensus from emerging speculation or uncertainties.

---

PHASE 9: QUALITY CONTROL

Verify the prompt for completeness, clarity, consistencies, hallucination risk, and safety standards before final delivery.

---

PHASE 10: FINAL OUTPUT

Always return:

### 1. 🚀 Optimized Prompt
[Provide the final high-quality, completely structured prompt ready for direct copy-pasting here inside a code block]

### 2. 🧠 Architect's Rationale
[Explain why this specific structure, role, and reasoning framework were chosen]

### 3. 💡 Suggested Improvements
[Suggest what additional information or parameters the user could feed into this prompt to make it even stronger]

### 4. 🔥 Advanced Version
[Show a conceptual view or prompt snippet of how this prompt escalates for enterprise, multi-agent systems, or extremely complex workloads]`,
    placeholders: [
      {
        key: 'الموضوع',
        labelAr: 'الموضوع أو الفكرة المراد صياغتها برمجياً (Target Idea to Engineer)',
        labelEn: 'Target Request/Idea to Engineer',
        placeholderAr: 'محلل الكود لـ React للتأكد من نظافة الكود وحقنه بحلول الأخطاء',
        placeholderEn: 'e.g., A comprehensive code reviewer for React TypeScript or a clinical pharmacology guide generator',
        type: 'textarea'
      },
      {
        key: 'المجال',
        labelAr: 'المجال المعرفي (Domain)',
        labelEn: 'Domain Classification',
        placeholderAr: 'Programming (البرمجة والتطوير)',
        placeholderEn: 'e.g., Medicine, Programming, Law, Finance, Marketing, Research',
        type: 'select',
        options: [
          'Programming & Software Architecture (البرمجة وهيكلة البرمجيات)',
          'Medicine & Healthcare (الطب والرعاية الصحية)',
          'Academic Research & Science (البحث العلمي والعلوم)',
          'Psychology & Psychiatry (علم النفس والطب النفسي)',
          'Business, Finance & Strategy (إدارة الأعمال والتمويل والمقاييس)',
          'Marketing & Content Creation (التسويق وصناعة المحتوى)',
          'Law & Legal Analysis (القانون والتحليلات القانونية)'
        ]
      },
      {
        key: 'النموذج',
        labelAr: 'النموذج المستهدف (Target LLM)',
        labelEn: 'Target LLM/Model',
        placeholderAr: 'Gemini (جيميني)',
        placeholderEn: 'e.g., Gemini, GPT-4o, Claude 3.5 Sonnet',
        type: 'select',
        options: [
          'Gemini (جيميني)',
          'Claude (كلاود)',
          'GPT-4 (جي بي تي)',
          'DeepSeek (ديب سيك)',
          'General Model (نموذج محايد)'
        ]
      },
      {
        key: 'منهجية_التفكير',
        labelAr: 'منهجية التفكير المفضلة (Reasoning Engine)',
        labelEn: 'Preferred Reasoning Strategy',
        placeholderAr: 'Chain of Thought (سلسلة الأفكار المترابطة)',
        placeholderEn: 'e.g., First Principles, Chain of Thought, systems Thinking',
        type: 'select',
        options: [
          'Chain of Thought (سلسلة الأفكار المترابطة)',
          'First Principles Thinking (التفكير من المبادئ الأولى)',
          'Systems Thinking (تفكير المنظومات الشامل)',
          'Critical & Analytical Thinking (التفكير النقدي والمقارن)',
          'Tree of Thought / Exploration (شجرة الأفكار واستكشاف المسارات)',
          'Bayesian Reasoning (الاستدلال البيزي والتوقعات الاستباقية)'
        ]
      }
    ]
  }
];
