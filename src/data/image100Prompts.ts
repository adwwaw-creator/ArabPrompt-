/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PromptLibraryCard {
  id: number;
  cat: 'portrait' | 'graphic' | 'abstract' | 'illustration' | 'gemini' | string;
  title: string;
  body: string;
  source: string;
}

export interface Image100PromptCard extends PromptLibraryCard {
  subCat: 'nature' | 'portrait' | 'architecture' | 'fantasy' | 'abstract' | 'food_product' | 'anime' | 'animals';
  promptIndex: number;
  aspectRatio: string;
}

export interface Image100Category {
  id: string;
  nameAr: string;
  nameEn: string;
  range: string;
  icon: string;
}

export const IMAGE_100_CATEGORIES: Image100Category[] = [
  { id: 'all', nameAr: 'الكل (100 برومبت)', nameEn: 'All (100 Prompts)', range: '1-100', icon: '🎨' },
  { id: 'nature', nameAr: 'الطبيعة والمناظر', nameEn: 'Nature & Landscapes', range: '1-15', icon: '🌄' },
  { id: 'portrait', nameAr: 'بورتريهات وأشخاص', nameEn: 'Portraits & People', range: '16-30', icon: '👤' },
  { id: 'architecture', nameAr: 'المدن والمعمار', nameEn: 'Cities & Architecture', range: '31-45', icon: '🏙️' },
  { id: 'fantasy', nameAr: 'فن خيالي وفانتازيا', nameEn: 'Fantasy & Magic', range: '46-60', icon: '🎭' },
  { id: 'abstract', nameAr: 'فن رقمي وتجريدي', nameEn: 'Digital & Abstract Art', range: '61-75', icon: '🎨' },
  { id: 'food_product', nameAr: 'طعام ومنتجات', nameEn: 'Food & Products', range: '76-85', icon: '🍽️' },
  { id: 'anime', nameAr: 'أنمي وستايل ياباني', nameEn: 'Anime & Japanese Style', range: '86-95', icon: '🌸' },
  { id: 'animals', nameAr: 'حيوانات', nameEn: 'Animals & Wildlife', range: '96-100', icon: '🐾' },
];

export const IMAGE_SHORTCUTS_CHEAT_SHEET = [
  { term: '--ar', labelAr: 'نسبة الأبعاد (Aspect Ratio)', descAr: '16:9 عريض / 4:5 بورتريه / 1:1 مربع / 3:2 أفقي' },
  { term: '8K, ultra-detailed', labelAr: 'دقة فائقة وتفاصيل خامات', descAr: 'إخراج أعلى مستويات الوضوح والتفاصيل الميكروسكوبية' },
  { term: 'cinematic', labelAr: 'إضاءة سينمائية وتدرج لوني', descAr: 'محاكاة أسلوب الكاميرات السينمائية والعمق الدرامي' },
  { term: 'bokeh', labelAr: 'خلفية ضبابية عازلة (بوكيه)', descAr: 'عزل الهدف بفتحة عدسة واسعة f/1.8 لمظهر جمالي راقٍ' },
  { term: 'golden hour', labelAr: 'إضاءة الغروب الذهبية', descAr: 'أشعة دافئة عنبرية مع ظلال ناعمة وإضاءة حواف محيطية' },
];

export const IMAGE_100_PROMPTS: Image100PromptCard[] = [
  // 🌄 الطبيعة والمناظر (1-15)
  {
    id: 301,
    promptIndex: 1,
    cat: 'image_100',
    subCat: 'nature',
    aspectRatio: '16:9',
    title: 'شلال استوائي مهيب وسط غابة مطيرة مع خيوط الشمس (Majestic Tropical Waterfall)',
    body: 'Majestic waterfall in a tropical rainforest, mist rising, lush green foliage, sunbeams through canopy, photorealistic, 8K --ar 16:9',
    source: 'باقة الـ 100 برومبت للصور — الطبيعة والمناظر'
  },
  {
    id: 302,
    promptIndex: 2,
    cat: 'image_100',
    subCat: 'nature',
    aspectRatio: '16:9',
    title: 'حقول لافندر لامتناهية عند الغروب في بروفانس بفرنسا (Endless Provence Lavender Fields)',
    body: 'Endless lavender fields at sunset, purple hues, rolling hills, warm golden light, Provence France, cinematic --ar 16:9',
    source: 'باقة الـ 100 برومبت للصور — الطبيعة والمناظر'
  },
  {
    id: 303,
    promptIndex: 3,
    cat: 'image_100',
    subCat: 'nature',
    aspectRatio: '16:9',
    title: 'الشفق القطبي فوق بحيرة متجمدة وسماء مرصعة بالنجوم (Northern Lights Over Frozen Lake)',
    body: 'Northern lights over a frozen lake, starry sky, snow-covered pine trees, reflection in ice, ultra detailed --ar 16:9',
    source: 'باقة الـ 100 برومبت للصور — الطبيعة والمناظر'
  },
  {
    id: 304,
    promptIndex: 4,
    cat: 'image_100',
    subCat: 'nature',
    aspectRatio: '3:2',
    title: 'كثبان رملية صحراوية عند الشروق وظلال ممتدة (Desert Dunes Sunrise Minimalist)',
    body: 'Desert dunes at sunrise, soft curves, warm orange sand, long shadows, minimalist composition --ar 3:2',
    source: 'باقة الـ 100 برومبت للصور — الطبيعة والمناظر'
  },
  {
    id: 305,
    promptIndex: 5,
    cat: 'image_100',
    subCat: 'nature',
    aspectRatio: '16:9',
    title: 'ممر غابة خريفية مغطى بأوراق ذهبية وضباب حالم (Autumn Forest Path with Fallen Leaves)',
    body: 'Autumn forest path covered in fallen leaves, golden and red colors, soft mist, dreamy atmosphere --ar 16:9',
    source: 'باقة الـ 100 برومبت للصور — الطبيعة والمناظر'
  },
  {
    id: 306,
    promptIndex: 6,
    cat: 'image_100',
    subCat: 'nature',
    aspectRatio: '16:9',
    title: 'أمواج محيط عاتية تتكسر على جروف صخرية وسماء عاصفة (Dramatic Ocean Waves on Rocky Cliffs)',
    body: 'Dramatic ocean waves crashing on rocky cliffs, stormy sky, moody lighting, long exposure --ar 16:9',
    source: 'باقة الـ 100 برومبت للصور — الطبيعة والمناظر'
  },
  {
    id: 307,
    promptIndex: 7,
    cat: 'image_100',
    subCat: 'nature',
    aspectRatio: '16:9',
    title: 'أشجار أزهار الكرز على ضفاف نهر في صباح ربيعي (Cherry Blossom Trees Along River)',
    body: 'Cherry blossom trees along a river, pink petals floating, spring morning, soft pastel tones --ar 16:9',
    source: 'باقة الـ 100 برومبت للصور — الطبيعة والمناظر'
  },
  {
    id: 308,
    promptIndex: 8,
    cat: 'image_100',
    subCat: 'nature',
    aspectRatio: '3:2',
    title: 'قمة جبلية ثلجية فوق السحب بأسلوب ناشيونال جيوغرافيك (Snowy Mountain Peak Above Clouds)',
    body: 'Snowy mountain peak above clouds, alpenglow, clear blue sky, majestic scale, National Geographic style --ar 3:2',
    source: 'باقة الـ 100 برومبت للصور — الطبيعة والمناظر'
  },
  {
    id: 309,
    promptIndex: 9,
    cat: 'image_100',
    subCat: 'nature',
    aspectRatio: '16:9',
    title: 'شاطئ متوهج حيوياً بأمواج زرقاء مضيئة ليلاً (Bioluminescent Beach at Night)',
    body: 'Bioluminescent beach at night, glowing blue waves, starry sky, magical atmosphere --ar 16:9',
    source: 'باقة الـ 100 برومبت للصور — الطبيعة والمناظر'
  },
  {
    id: 310,
    promptIndex: 10,
    cat: 'image_100',
    subCat: 'nature',
    aspectRatio: '16:9',
    title: 'مدرجات أرز خضراء في بالي بلقطة جوية صباحية (Bali Green Rice Terraces Aerial)',
    body: 'Green rice terraces in Bali, morning mist, tropical light, aerial view, vibrant green --ar 16:9',
    source: 'باقة الـ 100 برومبت للصور — الطبيعة والمناظر'
  },
  {
    id: 311,
    promptIndex: 11,
    cat: 'image_100',
    subCat: 'nature',
    aspectRatio: '16:9',
    title: 'شاطئ الرمال السوداء في أيسلندا مع جبال الجليد (Icelandic Black Sand Beach with Icebergs)',
    body: 'Icelandic black sand beach with icebergs, dramatic contrast, moody sky, cinematic --ar 16:9',
    source: 'باقة الـ 100 برومبت للصور — الطبيعة والمناظر'
  },
  {
    id: 312,
    promptIndex: 12,
    cat: 'image_100',
    subCat: 'nature',
    aspectRatio: '16:9',
    title: 'حقل دوار الشمس تحت سماء صيفية بزاوية تصوير منخفضة (Sunflower Field Summer Sky Low Angle)',
    body: 'Sunflower field under a dramatic summer sky, warm tones, low angle shot, vibrant --ar 16:9',
    source: 'باقة الـ 100 برومبت للصور — الطبيعة والمناظر'
  },
  {
    id: 313,
    promptIndex: 13,
    cat: 'image_100',
    subCat: 'nature',
    aspectRatio: '4:5',
    title: 'غابة صنوبر ضبابية عند الفجر بأجواء غامضة (Foggy Pine Forest at Dawn)',
    body: 'Foggy pine forest at dawn, mysterious atmosphere, soft light rays, muted tones --ar 4:5',
    source: 'باقة الـ 100 برومبت للصور — الطبيعة والمناظر'
  },
  {
    id: 314,
    promptIndex: 14,
    cat: 'image_100',
    subCat: 'nature',
    aspectRatio: '16:9',
    title: 'مشهد شعاب مرجانية ملونة وكريستالية تحت الماء (Crystal Clear Coral Reef Underwater)',
    body: 'Coral reef underwater scene, colorful fish, sunbeams through water, crystal clear, vibrant --ar 16:9',
    source: 'باقة الـ 100 برومبت للصور — الطبيعة والمناظر'
  },
  {
    id: 315,
    promptIndex: 15,
    cat: 'image_100',
    subCat: 'nature',
    aspectRatio: '16:9',
    title: 'ثوران بركاني ليلي وتدفق الحمم البركانية المتوهجة (Night Volcanic Eruption Glowing Lava)',
    body: 'Volcanic eruption at night, glowing lava, smoke, dramatic contrast, powerful composition --ar 16:9',
    source: 'باقة الـ 100 برومبت للصور — الطبيعة والمناظر'
  },

  // 👤 بورتريهات وأشخاص (16-30)
  {
    id: 316,
    promptIndex: 16,
    cat: 'image_100',
    subCat: 'portrait',
    aspectRatio: '4:5',
    title: 'بورتريه أبيض وأسود لرجل مسن بتجاعيد عميقة وعينين معبرتين (Elderly Man Storytelling Eyes)',
    body: 'Portrait of an elderly man with weathered face, deep wrinkles, warm light, storytelling eyes, black and white photography --ar 4:5',
    source: 'باقة الـ 100 برومبت للصور — بورتريهات وأشخاص'
  },
  {
    id: 317,
    promptIndex: 17,
    cat: 'image_100',
    subCat: 'portrait',
    aspectRatio: '4:5',
    title: 'شابة بشعر مموج مع إضاءة خلفية ذهبية وبوكيه ناعم (Young Woman Curly Hair Golden Hour)',
    body: 'Young woman with curly hair, golden hour backlight, soft bokeh, natural makeup, film photography --ar 4:5',
    source: 'باقة الـ 100 برومبت للصور — بورتريهات وأشخاص'
  },
  {
    id: 318,
    promptIndex: 18,
    cat: 'image_100',
    subCat: 'portrait',
    aspectRatio: '4:5',
    title: 'طفل يضحك بعفوية وبهجة تحت المطر (Child Laughing in the Rain Splashing Water)',
    body: 'Child laughing in the rain, joyful expression, splashing water, candid style, vibrant --ar 4:5',
    source: 'باقة الـ 100 برومبت للصور — بورتريهات وأشخاص'
  },
  {
    id: 319,
    promptIndex: 19,
    cat: 'image_100',
    subCat: 'portrait',
    aspectRatio: '4:5',
    title: 'سيدة أنيقة بفستان أحمر وإضاءة استوديو درامية للأزياء (Fashion Editorial Red Dress Studio)',
    body: 'Elegant woman in a red dress, dramatic studio lighting, black background, fashion editorial --ar 4:5',
    source: 'باقة الـ 100 برومبت للصور — بورتريهات وأشخاص'
  },
  {
    id: 320,
    promptIndex: 20,
    cat: 'image_100',
    subCat: 'portrait',
    aspectRatio: '4:5',
    title: 'بورتريه سينمائي لرجل ببدلة مفصلة وإضاءة غامضة حادة (Man in Tailored Suit Cinematic Portrait)',
    body: 'Man in a tailored suit, cinematic portrait, moody lighting, sharp jawline, professional photography --ar 4:5',
    source: 'باقة الـ 100 برومبت للصور — بورتريهات وأشخاص'
  },
  {
    id: 321,
    promptIndex: 21,
    cat: 'image_100',
    subCat: 'portrait',
    aspectRatio: '4:5',
    title: 'راقص في منتصف قفزة استوديو مع أقمشة انسيابية (Dancer Mid-Leap Flowing Fabric)',
    body: 'Dancer mid-leap, flowing fabric, motion blur, artistic studio lighting, dynamic pose --ar 4:5',
    source: 'باقة الـ 100 برومبت للصور — بورتريهات وأشخاص'
  },
  {
    id: 322,
    promptIndex: 22,
    cat: 'image_100',
    subCat: 'portrait',
    aspectRatio: '16:9',
    title: 'ظلال ثنائي رومانسي في أفق الغروب الدافئ (Romantic Couple Silhouette Sunset Sky)',
    body: 'Couple silhouetted against a sunset sky, romantic, warm tones, minimalist composition --ar 16:9',
    source: 'باقة الـ 100 برومبت للصور — بورتريهات وأشخاص'
  },
  {
    id: 323,
    promptIndex: 23,
    cat: 'image_100',
    subCat: 'portrait',
    aspectRatio: '4:5',
    title: 'بورتريه شوارع لعازف جيتار بإضاءة طبيعية عفوية (Street Musician with Guitar Urban)',
    body: 'Street portrait of a musician with guitar, urban background, natural light, candid moment --ar 4:5',
    source: 'باقة الـ 100 برومبت للصور — بورتريهات وأشخاص'
  },
  {
    id: 324,
    promptIndex: 24,
    cat: 'image_100',
    subCat: 'portrait',
    aspectRatio: '4:5',
    title: 'سيدة بكيمونو ياباني تقليدي بين أزهار الكرز (Woman in Traditional Japanese Kimono)',
    body: 'Woman with traditional Japanese kimono, cherry blossoms background, soft light, elegant --ar 4:5',
    source: 'باقة الـ 100 برومبت للصور — بورتريهات وأشخاص'
  },
  {
    id: 325,
    promptIndex: 25,
    cat: 'image_100',
    subCat: 'portrait',
    aspectRatio: '4:5',
    title: 'فتاة بنمش ناعم في حقل زهور بألوان باستيل حالمة (Freckled Girl in Flower Field Pastel)',
    body: 'Freckled girl in a flower field, soft natural light, dreamy bokeh, pastel tones --ar 4:5',
    source: 'باقة الـ 100 برومبت للصور — بورتريهات وأشخاص'
  },
  {
    id: 326,
    promptIndex: 26,
    cat: 'image_100',
    subCat: 'portrait',
    aspectRatio: '16:9',
    title: 'راكب أمواج يسير على الشاطئ في ضوء الغروب السينمائي (Surfer on Beach Sunset Cinematic)',
    body: 'Surfer walking on beach at sunset, wet hair, golden light, cinematic --ar 16:9',
    source: 'باقة الـ 100 برومبت للصور — بورتريهات وأشخاص'
  },
  {
    id: 327,
    promptIndex: 27,
    cat: 'image_100',
    subCat: 'portrait',
    aspectRatio: '1:1',
    title: 'صورة شخصية مهنية لرائدة أعمال بخلفية استوديو نظيفة (Businesswoman Professional Headshot)',
    body: 'Professional headshot of a businesswoman, clean background, soft studio light, confident smile --ar 1:1',
    source: 'باقة الـ 100 برومبت للصور — بورتريهات وأشخاص'
  },
  {
    id: 328,
    promptIndex: 28,
    cat: 'image_100',
    subCat: 'portrait',
    aspectRatio: '4:5',
    title: 'صياد مسن يصلح شباك الصيد بنمط وثائقي واقعي (Old Fisherman Mending Nets Documentary)',
    body: 'Old fisherman mending nets, weathered hands, documentary style, natural light --ar 4:5',
    source: 'باقة الـ 100 برومبت للصور — بورتريهات وأشخاص'
  },
  {
    id: 329,
    promptIndex: 29,
    cat: 'image_100',
    subCat: 'portrait',
    aspectRatio: '4:5',
    title: 'راقصة باليه في استوديو مظلم تحت كشاف ضوء درامي (Ballet Dancer Dark Studio Spotlight)',
    body: 'Ballet dancer in a dark studio, dramatic spotlight, graceful pose, artistic --ar 4:5',
    source: 'باقة الـ 100 برومبت للصور — بورتريهات وأشخاص'
  },
  {
    id: 330,
    promptIndex: 30,
    cat: 'image_100',
    subCat: 'portrait',
    aspectRatio: '4:5',
    title: 'امرأة بمظلة في شارع ممطر مع انعكاسات أضواء النيون (Rainy City Street Woman with Umbrella)',
    body: 'Woman with umbrella in rainy city street, neon reflections, cinematic mood --ar 4:5',
    source: 'باقة الـ 100 برومبت للصور — بورتريهات وأشخاص'
  },

  // 🏙️ المدن والمعمار (31-45)
  {
    id: 331,
    promptIndex: 31,
    cat: 'image_100',
    subCat: 'architecture',
    aspectRatio: '16:9',
    title: 'أفق مدينة مستقبلية ليلاً بسيارات طائرة وأجواء سايبربانك (Futuristic Cyberpunk City Skyline)',
    body: 'Futuristic city skyline at night, neon lights, flying cars, cyberpunk aesthetic --ar 16:9',
    source: 'باقة الـ 100 برومبت للصور — المدن والمعمار'
  },
  {
    id: 332,
    promptIndex: 32,
    cat: 'image_100',
    subCat: 'architecture',
    aspectRatio: '16:9',
    title: 'شارع طوكيو ليلاً مع المطر وانعكاسات لوحات النيون (Tokyo Street at Night Rain Neon)',
    body: 'Tokyo street at night, rain, neon signs, reflections, cinematic --ar 16:9',
    source: 'باقة الـ 100 برومبت للصور — المدن والمعمار'
  },
  {
    id: 333,
    promptIndex: 33,
    cat: 'image_100',
    subCat: 'architecture',
    aspectRatio: '16:9',
    title: 'مقهى باريسي في ظهيرة ماطرة بعمارة دافئة ساحرة (Parisian Café Rainy Afternoon)',
    body: 'Parisian café on a rainy afternoon, charming architecture, warm light --ar 16:9',
    source: 'باقة الـ 100 برومبت للصور — المدن والمعمار'
  },
  {
    id: 334,
    promptIndex: 34,
    cat: 'image_100',
    subCat: 'architecture',
    aspectRatio: '4:5',
    title: 'ناطحة سحاب زجاجية حديثة بزاوية تصوير منخفضة وانعكاس السماء (Modern Glass Skyscraper Low Angle)',
    body: 'Modern glass skyscraper, low angle shot, blue sky reflection, minimalist --ar 4:5',
    source: 'باقة الـ 100 برومبت للصور — المدن والمعمار'
  },
  {
    id: 335,
    promptIndex: 35,
    cat: 'image_100',
    subCat: 'architecture',
    aspectRatio: '16:9',
    title: 'قنوات البندقية عند الشروق مع قوارب الجندول وضباب خفيف (Venice Canal at Sunrise Gondolas)',
    body: 'Venice canal at sunrise, gondolas, soft mist, warm light, romantic --ar 16:9',
    source: 'باقة الـ 100 برومبت للصور — المدن والمعمار'
  },
  {
    id: 336,
    promptIndex: 36,
    cat: 'image_100',
    subCat: 'architecture',
    aspectRatio: '16:9',
    title: 'زقاق أوروبي قديم مرصوف بالحجارة ومنازل ملونة (Old European Cobblestone Street)',
    body: 'Old European cobblestone street, colorful houses, morning light, charming --ar 16:9',
    source: 'باقة الـ 100 برومبت للصور — المدن والمعمار'
  },
  {
    id: 337,
    promptIndex: 37,
    cat: 'image_100',
    subCat: 'architecture',
    aspectRatio: '16:9',
    title: 'أفق دبي عند الغسق مع ناطحات السحاب وسماء بنفسجية (Dubai Skyline at Dusk Aerial)',
    body: 'Dubai skyline at dusk, towering skyscrapers, purple sky, aerial view --ar 16:9',
    source: 'باقة الـ 100 برومبت للصور — المدن والمعمار'
  },
  {
    id: 338,
    promptIndex: 38,
    cat: 'image_100',
    subCat: 'architecture',
    aspectRatio: '16:9',
    title: 'مصنع صناعي مهجور ونوافذ مكسورة مع خيوط الشمس (Abandoned Industrial Factory Sunlight)',
    body: 'Abandoned industrial factory, broken windows, sunlight streaming in, urban exploration --ar 16:9',
    source: 'باقة الـ 100 برومبت للصور — المدن والمعمار'
  },
  {
    id: 339,
    promptIndex: 39,
    cat: 'image_100',
    subCat: 'architecture',
    aspectRatio: '1:1',
    title: 'عمارة بيضاء مينيمالية وظلال هندسية تحت ضوء شمس ساطع (Minimalist White Geometric Architecture)',
    body: 'Minimalist white architecture, geometric shadows, bright sunlight, abstract --ar 1:1',
    source: 'باقة الـ 100 برومبت للصور — المدن والمعمار'
  },
  {
    id: 340,
    promptIndex: 40,
    cat: 'image_100',
    subCat: 'architecture',
    aspectRatio: '16:9',
    title: 'مدينة نيويورك من الأعلى ليلاً مع شبكة شوارع متوهجة (New York City Aerial Night Grid)',
    body: 'New York City from above at night, glowing grid of lights, aerial --ar 16:9',
    source: 'باقة الـ 100 برومبت للصور — المدن والمعمار'
  },
  {
    id: 341,
    promptIndex: 41,
    cat: 'image_100',
    subCat: 'architecture',
    aspectRatio: '4:5',
    title: 'فناء رياض مغربي تقليدي بزليج أندلسي ونافورة مياه دافئة (Traditional Moroccan Riad Courtyard)',
    body: 'Traditional Moroccan riad courtyard, intricate tiles, fountain, warm light --ar 4:5',
    source: 'باقة الـ 100 برومبت للصور — المدن والمعمار'
  },
  {
    id: 342,
    promptIndex: 42,
    cat: 'image_100',
    subCat: 'architecture',
    aspectRatio: '16:9',
    title: 'جسر فوق نهر هادئ مع انعكاسات الشفق وسكون الطبيعة (Bridge Over Calm River Sunset)',
    body: 'Bridge over a calm river at sunset, reflection, serene atmosphere --ar 16:9',
    source: 'باقة الـ 100 برومبت للصور — المدن والمعمار'
  },
  {
    id: 343,
    promptIndex: 43,
    cat: 'image_100',
    subCat: 'architecture',
    aspectRatio: '16:9',
    title: 'مدينة بيئية مستقبلية بأسطح خضراء مستدامة وألواح شمسية (Futuristic Eco-City Green Rooftops)',
    body: 'Futuristic eco-city with green rooftops, solar panels, clean design --ar 16:9',
    source: 'باقة الـ 100 برومبت للصور — المدن والمعمار'
  },
  {
    id: 344,
    promptIndex: 44,
    cat: 'image_100',
    subCat: 'architecture',
    aspectRatio: '16:9',
    title: 'مكتبة تاريخية عريقة بأرفف كتب شاهقة وإضاءة دافئة (Historic Grand Library Interior)',
    body: 'Historic library interior, tall bookshelves, warm light, grand architecture --ar 16:9',
    source: 'باقة الـ 100 برومبت للصور — المدن والمعمار'
  },
  {
    id: 345,
    promptIndex: 45,
    cat: 'image_100',
    subCat: 'architecture',
    aspectRatio: '16:9',
    title: 'سوق ليلي في بانكوك بأضواء ملونة وطاقة حيوية مفعمة (Night Market in Bangkok Vibrant Energy)',
    body: 'Night market in Bangkok, colorful lights, busy street, vibrant energy --ar 16:9',
    source: 'باقة الـ 100 برومبت للصور — المدن والمعمار'
  },

  // 🎭 فن خيالي وفانتازيا (46-60)
  {
    id: 346,
    promptIndex: 46,
    cat: 'image_100',
    subCat: 'fantasy',
    aspectRatio: '16:9',
    title: 'تنين أسطوري رابض على قمة جبلية وسماء درامية (Dragon Perched on Mountain Peak)',
    body: 'Dragon perched on a mountain peak, epic scale, dramatic sky, fantasy concept art --ar 16:9',
    source: 'باقة الـ 100 برومبت للصور — فن خيالي وفانتازيا'
  },
  {
    id: 347,
    promptIndex: 47,
    cat: 'image_100',
    subCat: 'fantasy',
    aspectRatio: '16:9',
    title: 'قلعة سحرية عائمة بين السحب بنوافذ متوهجة (Enchanted Castle Floating in Clouds)',
    body: 'Enchanted castle floating in the clouds, glowing windows, magical atmosphere --ar 16:9',
    source: 'باقة الـ 100 برومبت للصور — فن خيالي وفانتازيا'
  },
  {
    id: 348,
    promptIndex: 48,
    cat: 'image_100',
    subCat: 'fantasy',
    aspectRatio: '4:5',
    title: 'جنية بأجنحة متوهجة تجلس على فطر في غابة سحرية (Fairy on Mushroom Glowing Wings)',
    body: 'Fairy sitting on a mushroom, glowing wings, magical forest, soft light --ar 4:5',
    source: 'باقة الـ 100 برومبت للصور — فن خيالي وفانتازيا'
  },
  {
    id: 349,
    promptIndex: 49,
    cat: 'image_100',
    subCat: 'fantasy',
    aspectRatio: '4:5',
    title: 'ساحر قديم يلقي تعويذة برموز سحرية متوهجة ورداء مظلم (Ancient Wizard Casting Spell Runes)',
    body: 'Ancient wizard casting a spell, glowing runes, dark robes, dramatic lighting --ar 4:5',
    source: 'باقة الـ 100 برومبت للصور — فن خيالي وفانتازيا'
  },
  {
    id: 350,
    promptIndex: 50,
    cat: 'image_100',
    subCat: 'fantasy',
    aspectRatio: '16:9',
    title: 'مدينة حوريات البحر تحت الماء بأبراج مرجانية وأضواء حالمة (Underwater Mermaid City Coral Towers)',
    body: 'Underwater mermaid city, coral towers, glowing lights, fantasy --ar 16:9',
    source: 'باقة الـ 100 برومبت للصور — فن خيالي وفانتازيا'
  },
  {
    id: 351,
    promptIndex: 51,
    cat: 'image_100',
    subCat: 'fantasy',
    aspectRatio: '4:5',
    title: 'أميرة محاربة بسيف طاقة متوهج وخلفية سينمائية ملحمية (Warrior Princess Glowing Sword Fantasy)',
    body: 'Warrior princess with glowing sword, epic background, cinematic fantasy --ar 4:5',
    source: 'باقة الـ 100 برومبت للصور — فن خيالي وفانتازيا'
  },
  {
    id: 352,
    promptIndex: 52,
    cat: 'image_100',
    subCat: 'fantasy',
    aspectRatio: '16:9',
    title: 'بوابة سحرية لعالم موازٍ في قلب غابة بأطراف متوهجة (Portal to Another World in Forest)',
    body: 'Portal to another world in a forest, glowing edges, mysterious --ar 16:9',
    source: 'باقة الـ 100 برومبت للصور — فن خيالي وفانتازيا'
  },
  {
    id: 353,
    promptIndex: 53,
    cat: 'image_100',
    subCat: 'fantasy',
    aspectRatio: '4:5',
    title: 'إلهة سماوية أثيرية محاطة بالنجوم وتوهج كوني أنيق (Celestial Goddess Surrounded by Stars)',
    body: 'Celestial goddess surrounded by stars, ethereal glow, elegant, fantasy art --ar 4:5',
    source: 'باقة الـ 100 برومبت للصور — فن خيالي وفانتازيا'
  },
  {
    id: 354,
    promptIndex: 54,
    cat: 'image_100',
    subCat: 'fantasy',
    aspectRatio: '16:9',
    title: 'قصر قوطي مسكون على تلة مع بدر مكتمل وضباب كثيف (Haunted Gothic Mansion Full Moon)',
    body: 'Haunted mansion on a hill, full moon, fog, gothic atmosphere --ar 16:9',
    source: 'باقة الـ 100 برومبت للصور — فن خيالي وفانتازيا'
  },
  {
    id: 355,
    promptIndex: 55,
    cat: 'image_100',
    subCat: 'fantasy',
    aspectRatio: '16:9',
    title: 'طائر الفينيق ينبعث من الرماد مع ألسنة اللهب وسماء ملحمية (Phoenix Rising from Ashes Epic Flames)',
    body: 'Phoenix rising from ashes, flames, dramatic sky, epic fantasy --ar 16:9',
    source: 'باقة الـ 100 برومبت للصور — فن خيالي وفانتازيا'
  },
  {
    id: 356,
    promptIndex: 56,
    cat: 'image_100',
    subCat: 'fantasy',
    aspectRatio: '16:9',
    title: 'مدينة الجان مشيدة داخل أشجار عملاقة مع شلالات متدفقة (Elven City in Giant Trees Waterfalls)',
    body: 'Elven city built in giant trees, waterfalls, magical light --ar 16:9',
    source: 'باقة الـ 100 برومبت للصور — فن خيالي وفانتازيا'
  },
  {
    id: 357,
    promptIndex: 57,
    cat: 'image_100',
    subCat: 'fantasy',
    aspectRatio: '16:9',
    title: 'منطاد ستيم بانك طائر فوق مدينة فيكتورية بين السحب (Steampunk Airship Over Victorian City)',
    body: 'Steampunk airship flying over Victorian city, clouds, adventure --ar 16:9',
    source: 'باقة الـ 100 برومبت للصور — فن خيالي وفانتازيا'
  },
  {
    id: 358,
    promptIndex: 58,
    cat: 'image_100',
    subCat: 'fantasy',
    aspectRatio: '16:9',
    title: 'كهف بلوري بأحجار كريمة متوهجة وطبيعة خيالية باهرة (Crystal Cave with Glowing Gems Landscape)',
    body: 'Crystal cave with glowing gems, magical light, fantasy landscape --ar 16:9',
    source: 'باقة الـ 100 برومبت للصور — فن خيالي وفانتازيا'
  },
  {
    id: 359,
    promptIndex: 59,
    cat: 'image_100',
    subCat: 'fantasy',
    aspectRatio: '4:5',
    title: 'فارس بدرع فضي لامع في ساحة معركة أسطورية بلقطة سينمائية (Knight in Shining Armor Epic Battlefield)',
    body: 'Knight in shining armor, dramatic pose, epic battlefield, cinematic --ar 4:5',
    source: 'باقة الـ 100 برومبت للصور — فن خيالي وفانتازيا'
  },
  {
    id: 360,
    promptIndex: 60,
    cat: 'image_100',
    subCat: 'fantasy',
    aspectRatio: '4:5',
    title: 'روح الغابة الأثيرية المتشكلة من أوراق الشجر والضوء النقي (Forest Spirit of Leaves and Light)',
    body: 'Forest spirit made of leaves and light, ethereal, magical --ar 4:5',
    source: 'باقة الـ 100 برومبت للصور — فن خيالي وفانتازيا'
  },

  // 🎨 فن رقمي وتجريدي (61-75)
  {
    id: 361,
    promptIndex: 61,
    cat: 'image_100',
    subCat: 'abstract',
    aspectRatio: '1:1',
    title: 'فن سائل تجريدي بتموجات الذهبي والأزرق الفيروزي الرخامي (Abstract Fluid Gold & Teal Marble)',
    body: 'Abstract fluid art, swirling gold and teal, elegant marble texture --ar 1:1',
    source: 'باقة الـ 100 برومبت للصور — فن رقمي وتجريدي'
  },
  {
    id: 362,
    promptIndex: 62,
    cat: 'image_100',
    subCat: 'abstract',
    aspectRatio: '1:1',
    title: 'تكوين تجريدي هندسي بألوان جريئة وفن عصري مينيمالي (Geometric Abstract Modern Bold Art)',
    body: 'Geometric abstract composition, bold colors, minimalist, modern art --ar 1:1',
    source: 'باقة الـ 100 برومبت للصور — فن رقمي وتجريدي'
  },
  {
    id: 363,
    promptIndex: 63,
    cat: 'image_100',
    subCat: 'abstract',
    aspectRatio: '1:1',
    title: 'ضربات ألوان مائية حيوية متداخلة بتعبير فني إبداعي (Watercolor Splash Bleeding Colors Expressive)',
    body: 'Watercolor splash, vibrant colors bleeding, artistic, expressive --ar 1:1',
    source: 'باقة الـ 100 برومبت للصور — فن رقمي وتجريدي'
  },
  {
    id: 364,
    promptIndex: 64,
    cat: 'image_100',
    subCat: 'abstract',
    aspectRatio: '1:1',
    title: 'مجسمات ثلاثية الأبعاد بتدرجات ناعمة وألوان باستيل مستقبلية (3D Rendered Soft Pastel Abstract)',
    body: '3D rendered abstract shapes, soft gradients, pastel colors, futuristic --ar 1:1',
    source: 'باقة الـ 100 برومبت للصور — فن رقمي وتجريدي'
  },
  {
    id: 365,
    promptIndex: 65,
    cat: 'image_100',
    subCat: 'abstract',
    aspectRatio: '4:5',
    title: 'بورتريه فن الخلل الرقمي بألوان نيون وتشويش سايبربانك (Glitch Art Portrait Neon Distortion)',
    body: 'Glitch art portrait, neon colors, digital distortion, cyberpunk --ar 4:5',
    source: 'باقة الـ 100 برومبت للصور — فن رقمي وتجريدي'
  },
  {
    id: 366,
    promptIndex: 66,
    cat: 'image_100',
    subCat: 'abstract',
    aspectRatio: '1:1',
    title: 'نمط كاليديوسكوب متناظر بدقة هندسية وألوان حيوية مدهشة (Intricate Symmetrical Kaleidoscope)',
    body: 'Kaleidoscope pattern, symmetrical, vibrant colors, intricate --ar 1:1',
    source: 'باقة الـ 100 برومبت للصور — فن رقمي وتجريدي'
  },
  {
    id: 367,
    promptIndex: 67,
    cat: 'image_100',
    subCat: 'abstract',
    aspectRatio: '1:1',
    title: 'معدن سائل تجريدي بانعكاسات كروم مصقولة ومظهر مستقبلي (Liquid Metal Chrome Reflections Sleek)',
    body: 'Liquid metal abstract, chrome reflections, futuristic, sleek --ar 1:1',
    source: 'باقة الـ 100 برومبت للصور — فن رقمي وتجريدي'
  },
  {
    id: 368,
    promptIndex: 68,
    cat: 'image_100',
    subCat: 'abstract',
    aspectRatio: '1:1',
    title: 'دوامات دخان ملونة على خلفية سوداء بإضاءة درامية أنيقة (Colorful Smoke Swirls on Black Background)',
    body: 'Colorful smoke swirls on black background, elegant, dramatic --ar 1:1',
    source: 'باقة الـ 100 برومبت للصور — فن رقمي وتجريدي'
  },
  {
    id: 369,
    promptIndex: 69,
    cat: 'image_100',
    subCat: 'abstract',
    aspectRatio: '16:9',
    title: 'فن قص الورق متعدد الطبقات لمشهد طبيعي بعمق بصري (Layered Paper Cut Art Landscape Depth)',
    body: 'Paper cut art landscape, layered colors, depth, intricate --ar 16:9',
    source: 'باقة الـ 100 برومبت للصور — فن رقمي وتجريدي'
  },
  {
    id: 370,
    promptIndex: 70,
    cat: 'image_100',
    subCat: 'abstract',
    aspectRatio: '16:9',
    title: 'شبكة هندسية نيون ريترو-مستقبلية بخطوط متوهجة وسماء ليلية (Neon Geometric Grid Retro-Futuristic)',
    body: 'Neon geometric grid, retro-futuristic, glowing lines, dark background --ar 16:9',
    source: 'باقة الـ 100 برومبت للصور — فن رقمي وتجريدي'
  },
  {
    id: 371,
    promptIndex: 71,
    cat: 'image_100',
    subCat: 'abstract',
    aspectRatio: '1:1',
    title: 'رسم خطي مينيمالي بخط متصل واحد أنيق على خلفية بيضاء (Minimalist Single Continuous Line Art)',
    body: 'Minimalist line art, single continuous line, elegant, white background --ar 1:1',
    source: 'باقة الـ 100 برومبت للصور — فن رقمي وتجريدي'
  },
  {
    id: 372,
    promptIndex: 72,
    cat: 'image_100',
    subCat: 'abstract',
    aspectRatio: '1:1',
    title: 'أنماط كسورية سايكدلية آسرة بتفاصيل دقيقة وألوان ساحرة (Psychedelic Fractal Patterns Vibrant)',
    body: 'Psychedelic fractal patterns, vibrant colors, hypnotic, detailed --ar 1:1',
    source: 'باقة الـ 100 برومبت للصور — فن رقمي وتجريدي'
  },
  {
    id: 373,
    promptIndex: 73,
    cat: 'image_100',
    subCat: 'abstract',
    aspectRatio: '1:1',
    title: 'خامة ذهبية معدنية فاخرة بتفاصيل سطحية بارزة ولامعة (Metallic Gold Texture Luxurious Surface)',
    body: 'Metallic gold texture, elegant, luxurious, detailed surface --ar 1:1',
    source: 'باقة الـ 100 برومبت للصور — فن رقمي وتجريدي'
  },
  {
    id: 374,
    promptIndex: 74,
    cat: 'image_100',
    subCat: 'abstract',
    aspectRatio: '1:1',
    title: 'عالم مصغر متساوي القياس (Isometric) بتفاصيل لطيفة وباستيل (Isometric Miniature World Pastel Cute)',
    body: 'Isometric miniature world, cute detailed, pastel colors --ar 1:1',
    source: 'باقة الـ 100 برومبت للصور — فن رقمي وتجريدي'
  },
  {
    id: 375,
    promptIndex: 75,
    cat: 'image_100',
    subCat: 'abstract',
    aspectRatio: '4:5',
    title: 'بورتريه تعريض مزدوج مدمج مع عناصر الطبيعة بأسلوب فني حالم (Double Exposure Portrait with Nature)',
    body: 'Double exposure portrait with nature, artistic, dreamy, layered --ar 4:5',
    source: 'باقة الـ 100 برومبت للصور — فن رقمي وتجريدي'
  },

  // 🍽️ طعام ومنتجات (76-85)
  {
    id: 376,
    promptIndex: 76,
    cat: 'image_100',
    subCat: 'food_product',
    aspectRatio: '4:5',
    title: 'برجر جورميه فاخر مع جبن ذائب وإضاءة ماكرو احترافية (Gourmet Burger Melting Cheese Macro)',
    body: 'Gourmet burger with melting cheese, dramatic lighting, dark background, macro --ar 4:5',
    source: 'باقة الـ 100 برومبت للصور — طعام ومنتجات'
  },
  {
    id: 377,
    promptIndex: 77,
    cat: 'image_100',
    subCat: 'food_product',
    aspectRatio: '4:5',
    title: 'طبق سوشي ياباني طازج بتقديم راقٍ وإضاءة ناعمة (Fresh Sushi Platter Japanese Style)',
    body: 'Fresh sushi platter, elegant presentation, soft light, Japanese style --ar 4:5',
    source: 'باقة الـ 100 برومبت للصور — طعام ومنتجات'
  },
  {
    id: 378,
    promptIndex: 78,
    cat: 'image_100',
    subCat: 'food_product',
    aspectRatio: '4:5',
    title: 'كوب قهوة برسمة لاتيه متقنة على طاولة خشبية دافئة (Coffee Cup Latte Art Rustic Table)',
    body: 'Coffee cup with latte art, rustic wooden table, morning light, cozy --ar 4:5',
    source: 'باقة الـ 100 برومبت للصور — طعام ومنتجات'
  },
  {
    id: 379,
    promptIndex: 79,
    cat: 'image_100',
    subCat: 'food_product',
    aspectRatio: '1:1',
    title: 'حبات ماكرون فرنسية ملونة متراصة بنعومة مخبز باريسي (Colorful Macarons French Patisserie)',
    body: 'Colorful macarons stacked, pastel background, soft light, French patisserie --ar 1:1',
    source: 'باقة الـ 100 برومبت للصور — طعام ومنتجات'
  },
  {
    id: 380,
    promptIndex: 80,
    cat: 'image_100',
    subCat: 'food_product',
    aspectRatio: '4:5',
    title: 'زجاجة عطر فاخرة مع قطرات ماء نقية وإضاءة استوديو درامية (Luxury Perfume Bottle Water Droplets)',
    body: 'Luxury perfume bottle, water droplets, dramatic lighting, elegant --ar 4:5',
    source: 'باقة الـ 100 برومبت للصور — طعام ومنتجات'
  },
  {
    id: 381,
    promptIndex: 81,
    cat: 'image_100',
    subCat: 'food_product',
    aspectRatio: '1:1',
    title: 'تناثر فواكه طازجة في الماء بتصوير عالي السرعة (Fresh Fruit Splash in Water High Speed)',
    body: 'Fresh fruit splash in water, vibrant colors, high speed photography --ar 1:1',
    source: 'باقة الـ 100 برومبت للصور — طعام ومنتجات'
  },
  {
    id: 382,
    promptIndex: 82,
    cat: 'image_100',
    subCat: 'food_product',
    aspectRatio: '1:1',
    title: 'لوح شوكولاتة حرفي فاخر بلمسات ذهبية وخلفية داكنة (Artisan Chocolate Bar Gold Accents)',
    body: 'Artisan chocolate bar, dark background, gold accents, luxurious --ar 1:1',
    source: 'باقة الـ 100 برومبت للصور — طعام ومنتجات'
  },
  {
    id: 383,
    promptIndex: 83,
    cat: 'image_100',
    subCat: 'food_product',
    aspectRatio: '4:5',
    title: 'كوكتيل مميز بزينة متوهجة وخلفية بار سينمائية هادئة (Cocktail Glowing Garnish Cinematic Bar)',
    body: 'Cocktail with glowing garnish, dark bar background, cinematic --ar 4:5',
    source: 'باقة الـ 100 برومبت للصور — طعام ومنتجات'
  },
  {
    id: 384,
    promptIndex: 84,
    cat: 'image_100',
    subCat: 'food_product',
    aspectRatio: '4:5',
    title: 'خبز ريفي طازج خارج من الفرن بإضاءة دافئة وقشرة مقرمشة (Freshly Baked Bread Rustic Artisan)',
    body: 'Freshly baked bread, rustic setting, warm light, artisan style --ar 4:5',
    source: 'باقة الـ 100 برومبت للصور — طعام ومنتجات'
  },
  {
    id: 385,
    promptIndex: 85,
    cat: 'image_100',
    subCat: 'food_product',
    aspectRatio: '1:1',
    title: 'لقطة منتج لحذاء رياضي عصري بزاوية ديناميكية وإضاءة استوديو (Sneaker Dynamic Commercial Shot)',
    body: 'Sneaker product shot, dynamic angle, studio lighting, vibrant --ar 1:1',
    source: 'باقة الـ 100 برومبت للصور — طعام ومنتجات'
  },

  // 🌸 أنمي وستايل ياباني (86-95)
  {
    id: 386,
    promptIndex: 86,
    cat: 'image_100',
    subCat: 'anime',
    aspectRatio: '16:9',
    title: 'فتاة أنمي على رصيف القطار وقت الغروب بأسلوب ماكوتو شينكاي (Makoto Shinkai Anime Train Platform)',
    body: 'Anime girl on train platform at sunset, cherry blossoms, Makoto Shinkai style --ar 16:9',
    source: 'باقة الـ 100 برومبت للصور — أنمي وستايل ياباني'
  },
  {
    id: 387,
    promptIndex: 87,
    cat: 'image_100',
    subCat: 'anime',
    aspectRatio: '16:9',
    title: 'طبيعة أنمي ساحرة وتلال خضراء وسحب قطنية بأسلوب استوديو جيبلي (Studio Ghibli Lush Anime Landscape)',
    body: 'Anime landscape, rolling hills, blue sky, fluffy clouds, Studio Ghibli style --ar 16:9',
    source: 'باقة الـ 100 برومبت للصور — أنمي وستايل ياباني'
  },
  {
    id: 388,
    promptIndex: 88,
    cat: 'image_100',
    subCat: 'anime',
    aspectRatio: '4:5',
    title: 'فتى أنمي شونين بسيف مع وضعية درامية وخلفية ملحمية (Epic Shonen Anime Boy with Sword)',
    body: 'Anime boy with sword, dramatic pose, epic background, shonen style --ar 4:5',
    source: 'باقة الـ 100 برومبت للصور — أنمي وستايل ياباني'
  },
  {
    id: 389,
    promptIndex: 89,
    cat: 'image_100',
    subCat: 'anime',
    aspectRatio: '16:9',
    title: 'غرفة أنمي دافئة ومريحة بنباتات خضراء وتفاصيل داخلية دقيقة (Cozy Detailed Anime Room Interior)',
    body: 'Cozy anime room, warm light, plants, detailed interior --ar 16:9',
    source: 'باقة الـ 100 برومبت للصور — أنمي وستايل ياباني'
  },
  {
    id: 390,
    promptIndex: 90,
    cat: 'image_100',
    subCat: 'anime',
    aspectRatio: '16:9',
    title: 'شارع مدينة أنمي ليلاً مع أمطار ولوحات نيون سينمائية (Rainy Neon Anime City Street at Night)',
    body: 'Anime city street at night, neon signs, rain, cinematic --ar 16:9',
    source: 'باقة الـ 100 برومبت للصور — أنمي وستايل ياباني'
  },
  {
    id: 391,
    promptIndex: 91,
    cat: 'image_100',
    subCat: 'anime',
    aspectRatio: '1:1',
    title: 'شخصية تشيبي يابانية لطيفة وملونة بخلفية بسيطة (Cute Colorful Chibi Character Simple Background)',
    body: 'Chibi character, cute, colorful, simple background --ar 1:1',
    source: 'باقة الـ 100 برومبت للصور — أنمي وستايل ياباني'
  },
  {
    id: 392,
    promptIndex: 92,
    cat: 'image_100',
    subCat: 'anime',
    aspectRatio: '4:5',
    title: 'رسمة أنمي شهية لطبق رامين ساخن مع تصاعد البخار (Appetizing Anime Steaming Ramen Bowl)',
    body: 'Anime food illustration, ramen bowl, steam, detailed, appetizing --ar 4:5',
    source: 'باقة الـ 100 برومبت للصور — أنمي وستايل ياباني'
  },
  {
    id: 393,
    promptIndex: 93,
    cat: 'image_100',
    subCat: 'anime',
    aspectRatio: '4:5',
    title: 'محارب أنمي بعينين متوهجتين في أجواء مظلمة درامية (Anime Warrior Glowing Eyes Dark Mood)',
    body: 'Anime warrior with glowing eyes, dark atmosphere, dramatic --ar 4:5',
    source: 'باقة الـ 100 برومبت للصور — أنمي وستايل ياباني'
  },
  {
    id: 394,
    promptIndex: 94,
    cat: 'image_100',
    subCat: 'anime',
    aspectRatio: '16:9',
    title: 'ثنائي أنمي رومانسي تحت مظلة واحدة تحت المطر بألوان ناعمة (Romantic Anime Couple Under Rainy Umbrella)',
    body: 'Anime couple under umbrella in rain, romantic, soft colors --ar 16:9',
    source: 'باقة الـ 100 برومبت للصور — أنمي وستايل ياباني'
  },
  {
    id: 395,
    promptIndex: 95,
    cat: 'image_100',
    subCat: 'anime',
    aspectRatio: '4:5',
    title: 'فتاة أنمي ساحرة مع عصا سحرية متوهجة وبريق خيالي (Magical Anime Girl with Glowing Staff)',
    body: 'Anime magical girl with glowing staff, sparkles, fantasy --ar 4:5',
    source: 'باقة الـ 100 برومبت للصور — أنمي وستايل ياباني'
  },

  // 🐾 حيوانات (96-100)
  {
    id: 396,
    promptIndex: 96,
    cat: 'image_100',
    subCat: 'animals',
    aspectRatio: '4:5',
    title: 'بورتريه أسد مهيب بنظرة واثقة وفراء دقيق تحت الضوء الذهبي (Majestic Lion Golden Light Portrait)',
    body: 'Majestic lion portrait, golden light, detailed fur, powerful gaze --ar 4:5',
    source: 'باقة الـ 100 برومبت للصور — حيوانات'
  },
  {
    id: 397,
    promptIndex: 97,
    cat: 'image_100',
    subCat: 'animals',
    aspectRatio: '4:5',
    title: 'ببغاء استوائي بريش زاهي وتفاصيل فائقة في غابة خضراء (Vibrant Tropical Forest Parrot)',
    body: 'Colorful parrot in tropical forest, vibrant feathers, sharp detail --ar 4:5',
    source: 'باقة الـ 100 برومبت للصور — حيوانات'
  },
  {
    id: 398,
    promptIndex: 98,
    cat: 'image_100',
    subCat: 'animals',
    aspectRatio: '1:1',
    title: 'جرو لطيف في حقل أزهار بإضاءة ناعمة وخلفية بوكيه حالمة (Cute Puppy in Flower Field Bokeh)',
    body: 'Cute puppy in a flower field, soft light, adorable, bokeh --ar 1:1',
    source: 'باقة الـ 100 برومبت للصور — حيوانات'
  },
  {
    id: 399,
    promptIndex: 99,
    cat: 'image_100',
    subCat: 'animals',
    aspectRatio: '4:5',
    title: 'طائر طنان يحوم قرب زهرة بتجميد حركة فائق وتصوير ماكرو (Macro Hummingbird Hovering Near Flower)',
    body: 'Hummingbird hovering near a flower, motion frozen, macro, vibrant --ar 4:5',
    source: 'باقة الـ 100 برومبت للصور — حيوانات'
  },
  {
    id: 400,
    promptIndex: 100,
    cat: 'image_100',
    subCat: 'animals',
    aspectRatio: '16:9',
    title: 'خيال فيل أفريقي عند الغروب في السافانا مع سماء درامية (African Savanna Elephant Silhouette Sunset)',
    body: 'Elephant silhouette at sunset in savanna, dramatic sky, African landscape --ar 16:9',
    source: 'باقة الـ 100 برومبت للصور — حيوانات'
  }
];
