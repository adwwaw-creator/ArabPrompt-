/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CinematicPromptItem {
  id: number;
  category: 'fantasy_epic' | 'sci_fi_cinematic' | 'classical_art' | 'sci_fi_surreal_art' | 'cinematic_portraits';
  categoryNameAr: string;
  categoryNameEn: string;
  titleAr: string;
  subject: string;
  tags: string[];
}

export interface CinematicLibraryMeta {
  title: string;
  titleAr: string;
  total_prompts: number;
  target_engines: string[];
  base_prompt: string;
  base_prompt_flux_clean: string;
  negative_prompt: string;
  flux_overrides: {
    remove_params: string[];
    add_fields: {
      aspect_ratio: string;
      guidance: number;
    };
  };
  categories: Record<string, { range: string; nameAr: string; nameEn: string; icon: string }>;
}

export const CINEMATIC_LIBRARY_META: CinematicLibraryMeta = {
  title: "Cinematic Fantasy / Sci-Fi / Art Library",
  titleAr: "مكتبة البرومتات السينمائية — فانتازيا، خيال علمي، وفنون كلاسيكية",
  total_prompts: 200,
  target_engines: ["Midjourney v6.1", "Flux.1 High-Resolution"],
  base_prompt: "cinematic golden ratio composition, volumetric atmospheric glow, soft rim lighting, 5600K balanced daylight, shot on Hasselblad H6D-100c 85mm f/1.2, photorealistic micro-textures, hyperrealistic, award-winning editorial aesthetic, natural color grading, depth of field, 8k --ar 16:9 --style raw --v 6.1 --q 2 --no deformed anatomy, extra fingers, text, watermark, low contrast, oversaturation, blur",
  base_prompt_flux_clean: "cinematic golden ratio composition, volumetric atmospheric glow, soft rim lighting, 5600K balanced daylight, shot on Hasselblad H6D-100c 85mm f/1.2, photorealistic micro-textures, hyperrealistic, award-winning editorial aesthetic, natural color grading, depth of field, 8k",
  negative_prompt: "deformed anatomy, extra fingers, text, watermark, low contrast, oversaturation, blur, signature, frame, border",
  flux_overrides: {
    remove_params: ["--ar 16:9", "--style raw", "--v 6.1", "--q 2"],
    add_fields: {
      aspect_ratio: "16:9",
      guidance: 3.5
    }
  },
  categories: {
    fantasy_epic: { range: "1-50", nameAr: "فانتازيا ملحمية وأساطير", nameEn: "Fantasy & Epic Myth", icon: "🐉" },
    sci_fi_cinematic: { range: "51-110", nameAr: "سينما الخيال العلمي", nameEn: "Sci-Fi Cinematic", icon: "🚀" },
    classical_art: { range: "111-150", nameAr: "الفنون التشكيلية الكلاسيكية", nameEn: "Classical & Renaissance Art", icon: "🎨" },
    sci_fi_surreal_art: { range: "151-185", nameAr: "سريالية الخيال والغرائبيات", nameEn: "Sci-Fi Surreal & Biomech", icon: "🌌" },
    cinematic_portraits: { range: "186-200", nameAr: "بورتريهات سينمائية فائقة الدقة", nameEn: "Cinematic Character Portraits", icon: "👤" }
  }
};

export const CINEMATIC_200_PROMPTS: CinematicPromptItem[] = [
  // ==========================================
  // 1. FANTASY EPIC (1-50)
  // ==========================================
  {
    id: 1,
    category: "fantasy_epic",
    categoryNameAr: "فانتازيا ملحمية",
    categoryNameEn: "Epic Fantasy",
    titleAr: "فارس وحيد يواجه تنيناً عتيقاً عملاقاً على حافة هاوية",
    subject: "A lone knight facing a colossal ancient dragon on a cliff edge, floating castle in storm clouds behind",
    tags: ["dragon", "knight", "cliff", "floating castle", "storm"]
  },
  {
    id: 2,
    category: "fantasy_epic",
    categoryNameAr: "فانتازيا ملحمية",
    categoryNameEn: "Epic Fantasy",
    titleAr: "ملكة الإلف على عرش الجذور المتشابكة مع رموز سحرية مضيئة",
    subject: "An elven queen on a throne of intertwined roots, glowing runes floating around her",
    tags: ["elven queen", "nature throne", "glowing runes", "mystic"]
  },
  {
    id: 3,
    category: "fantasy_epic",
    categoryNameAr: "فانتازيا ملحمية",
    categoryNameEn: "Epic Fantasy",
    titleAr: "ساحر في برج متهدم يشكل مجرة من الطاقة السرية بين يديه",
    subject: "A wizard casting a spell in a ruined tower, swirling arcane energy forming a galaxy in his hands",
    tags: ["wizard", "ruined tower", "arcane galaxy", "sorcery"]
  },
  {
    id: 4,
    category: "fantasy_epic",
    categoryNameAr: "فانتازيا ملحمية",
    categoryNameEn: "Epic Fantasy",
    titleAr: "مسبك الأقزام في أعماق الأرض مع أنهار من الذهب المنصهر وسندان مشتعل",
    subject: "A dwarven forge deep underground, molten gold rivers, hammer striking an anvil with sparks",
    tags: ["dwarven forge", "molten gold", "sparks", "underground"]
  },
  {
    id: 5,
    category: "fantasy_epic",
    categoryNameAr: "فانتازيا ملحمية",
    categoryNameEn: "Epic Fantasy",
    titleAr: "طائر الفينيق ينبعث من ساحة معركة محترقة بأجنحة من اللهب الحي",
    subject: "A phoenix rising from a burning battlefield, feathers of living flame",
    tags: ["phoenix", "rebirth", "flame feathers", "battlefield"]
  },
  {
    id: 6,
    category: "fantasy_epic",
    categoryNameAr: "فانتازيا ملحمية",
    categoryNameEn: "Epic Fantasy",
    titleAr: "عملاق حجري أثري يستيقظ في غابة غناء وتتشقق الأغصان عن كتفيه",
    subject: "A giant stone golem awakening in a mossy forest, vines cracking off its shoulders",
    tags: ["stone golem", "mossy forest", "ancient awakening"]
  },
  {
    id: 7,
    category: "fantasy_epic",
    categoryNameAr: "فانتازيا ملحمية",
    categoryNameEn: "Epic Fantasy",
    titleAr: "مدينة الجنيات داخل شجرة عملاقة مضيئة مع فوانيس متدلية بين الأغصان",
    subject: "A fairy city built inside a giant glowing tree, lanterns hanging from branches",
    tags: ["fairy city", "glowing tree", "bioluminescent", "lanterns"]
  },
  {
    id: 8,
    category: "fantasy_epic",
    categoryNameAr: "فانتازيا ملحمية",
    categoryNameEn: "Epic Fantasy",
    titleAr: "ساحر الظلام يستدعي عاصفة رعدية فوق كاتدرائية قوطية",
    subject: "A dark sorcerer summoning a storm above a gothic cathedral, lightning in his palm",
    tags: ["dark sorcerer", "gothic cathedral", "lightning", "storm"]
  },
  {
    id: 9,
    category: "fantasy_epic",
    categoryNameAr: "فانتازيا ملحمية",
    categoryNameEn: "Epic Fantasy",
    titleAr: "فالكيري تهبط على جواد مجنح من سماء الشفق القطبي برمح من ضوء النجوم",
    subject: "A valkyrie descending on a winged horse from an aurora borealis sky, holding a spear of pure starlight",
    tags: ["valkyrie", "pegasus", "aurora borealis", "starlight spear"]
  },
  {
    id: 10,
    category: "fantasy_epic",
    categoryNameAr: "فانتازيا ملحمية",
    categoryNameEn: "Epic Fantasy",
    titleAr: "ثعبان بحري أسطوري يلتف حول منارة أثرية في خضم عاصفة هوجاء",
    subject: "An ancient sea serpent coiling around a lighthouse during a raging tempest, crashing emerald waves",
    tags: ["sea serpent", "lighthouse", "tempest", "emerald waves"]
  },
  {
    id: 11,
    category: "fantasy_epic",
    categoryNameAr: "فانتازيا ملحمية",
    categoryNameEn: "Epic Fantasy",
    titleAr: "قاعة عرش بلورية مجمدة في قمة جبل جليدي مع حراس من الجليد الأزرق",
    subject: "A crystalline throne room frozen inside a glacier summit, frosted blue ice guardians standing watch",
    tags: ["glacier", "ice throne", "crystal", "frost guardians"]
  },
  {
    id: 12,
    category: "fantasy_epic",
    categoryNameAr: "فانتازيا ملحمية",
    categoryNameEn: "Epic Fantasy",
    titleAr: "كيمياوي قديم في مختبر مليء بالأجرام الفلكية السحرية والمخطوطات العتيقة",
    subject: "An ancient alchemist in a laboratory filled with glowing celestial orbs and floating brass astrolabes",
    tags: ["alchemist", "astrolabe", "celestial orbs", "esoteric"]
  },
  {
    id: 13,
    category: "fantasy_epic",
    categoryNameAr: "فانتازيا ملحمية",
    categoryNameEn: "Epic Fantasy",
    titleAr: "بوابة أبعاد سحرية حجرية تتوهج بالأرجواني وسط دائرة أحجار ستونهنج الغامضة",
    subject: "A colossal megalithic portal swirling with violet dimensional vortex energy inside a foggy stone circle",
    tags: ["megalithic portal", "violet vortex", "stone circle", "dimension"]
  },
  {
    id: 14,
    category: "fantasy_epic",
    categoryNameAr: "فانتازيا ملحمية",
    categoryNameEn: "Epic Fantasy",
    titleAr: "قناص من حراس الغابة يمتطي نمر سبابر مدرعاً في وادٍ خريفي ضبابي",
    subject: "A ranger riding an armored sabertooth tiger through a mist-filled autumn valley with golden foliage",
    tags: ["ranger", "armored sabertooth", "autumn valley", "golden leaves"]
  },
  {
    id: 15,
    category: "fantasy_epic",
    categoryNameAr: "فانتازيا ملحمية",
    categoryNameEn: "Epic Fantasy",
    titleAr: "سفينة قرصان شبحية تبحر عبر رمال صحراء قمرية تحت سماء مرصعة بثلاثة أقمار",
    subject: "A phantom ghost galleon sailing across glowing sand dunes under three planetary moons",
    tags: ["ghost galleon", "desert ship", "three moons", "sand dunes"]
  },
  {
    id: 16,
    category: "fantasy_epic",
    categoryNameAr: "فانتازيا ملحمية",
    categoryNameEn: "Epic Fantasy",
    titleAr: "كاهنة نور الشمس تستحضر درعاً من الضوء الذهبي لصد جيش الظلال",
    subject: "A sun priestess summoning a radiant golden light barrier to shield her temple from shadow wraiths",
    tags: ["sun priestess", "light barrier", "temple", "shadow wraiths"]
  },
  {
    id: 17,
    category: "fantasy_epic",
    categoryNameAr: "فانتازيا ملحمية",
    categoryNameEn: "Epic Fantasy",
    titleAr: "قلعة طافية على جزيرة صخرية معلقة في السماء مع شلالات تتدفق نحو الفراغ",
    subject: "A floating celestial sky fortress on inverted earth island with cascading waterfalls pouring into the void",
    tags: ["sky fortress", "floating island", "waterfalls", "celestial"]
  },
  {
    id: 18,
    category: "fantasy_epic",
    categoryNameAr: "فانتازيا ملحمية",
    categoryNameEn: "Epic Fantasy",
    titleAr: "سيدة الذئاب البيضاء تقف على حافة صخرة ثلجية وسط عاصفة بليزارد",
    subject: "A frost queen standing with a pack of dire white wolves on a snow-draped ridge in a howling blizzard",
    tags: ["frost queen", "dire wolves", "blizzard", "arctic ridge"]
  },
  {
    id: 19,
    category: "fantasy_epic",
    categoryNameAr: "فانتازيا ملحمية",
    categoryNameEn: "Epic Fantasy",
    titleAr: "تنين سبجي أسود يخرج من فوهة بركان نشط مع حمم تتساقط كالشلال",
    subject: "An obsidian black dragon emerging from an erupting caldera with rivers of molten magma draping its wings",
    tags: ["obsidian dragon", "volcano", "magma rivers", "caldera"]
  },
  {
    id: 20,
    category: "fantasy_epic",
    categoryNameAr: "فانتازيا ملحمية",
    categoryNameEn: "Epic Fantasy",
    titleAr: "مكتبة أسطورية لا نهائية ترتفع رفوفها حتى الغيوم مع كتب طائرة مسحورة",
    subject: "An infinite mystical library with towering mahogany spiral towers reaching cloud level and flying spellbooks",
    tags: ["infinite library", "spellbooks", "spiral towers", "esoteric"]
  },
  {
    id: 21,
    category: "fantasy_epic",
    categoryNameAr: "فانتازيا ملحمية",
    categoryNameEn: "Epic Fantasy",
    titleAr: "فارس مدرع بدروع من الياقوت الأزرق يسحب سيفاً مقدساً من كتلة نيزكية",
    subject: "A paladin clad in sapphire plate armor pulling a celestial blade from a smoldering glowing meteorite",
    tags: ["paladin", "sapphire armor", "celestial blade", "meteorite"]
  },
  {
    id: 22,
    category: "fantasy_epic",
    categoryNameAr: "فانتازيا ملحمية",
    categoryNameEn: "Epic Fantasy",
    titleAr: "مملكة تحت الماء مشيدة من المرجان المتوهج واللؤلؤ مع أسماك الحوت السحرية",
    subject: "An underwater bioluminescent coral kingdom with pearl spires and glowing manta rays gliding through arches",
    tags: ["underwater kingdom", "bioluminescent coral", "pearl spires", "manta ray"]
  },
  {
    id: 23,
    category: "fantasy_epic",
    categoryNameAr: "فانتازيا ملحمية",
    categoryNameEn: "Epic Fantasy",
    titleAr: "شجرة العالم 'إغدراسيل' بأوراق من النجوم تمتد جذورها عبر أبعاد الكون",
    subject: "The colossal World Tree Yggdrasil with starlight leaves, roots weaving across cosmic nebula rifts",
    tags: ["yggdrasil", "world tree", "nebula roots", "cosmic myth"]
  },
  {
    id: 24,
    category: "fantasy_epic",
    categoryNameAr: "فانتازيا ملحمية",
    categoryNameEn: "Epic Fantasy",
    titleAr: "ساحر بدوي على قمة كثيب رملي يستدعي جنياً عملاقاً من زوبعة نار ورمال",
    subject: "A desert nomad mystic atop a crimson dune summoning a towering djinn from a fiery sand cyclone",
    tags: ["desert nomad", "djinn", "sand cyclone", "crimson dune"]
  },
  {
    id: 25,
    category: "fantasy_epic",
    categoryNameAr: "فانتازيا ملحمية",
    categoryNameEn: "Epic Fantasy",
    titleAr: "معركة ملحمية بين تنين جليدي وتنين ناري في مضيق جبلي شاهق",
    subject: "A clash between a frost wyrm and a fire drake in a narrow alpine gorge, steam explosions and ice shards",
    tags: ["frost wyrm", "fire drake", "dragon battle", "alpine gorge"]
  },
  {
    id: 26,
    category: "fantasy_epic",
    categoryNameAr: "فانتازيا ملحمية",
    categoryNameEn: "Epic Fantasy",
    titleAr: "ساحرة القمر ترقص على بحيرة مرآة عاكسة للنجوم تحت خسوف قمر أحمر",
    subject: "A lunar sorceress dancing on a glassy reflective lake reflecting millions of stars during a blood moon eclipse",
    tags: ["lunar sorceress", "mirror lake", "blood moon", "reflection"]
  },
  {
    id: 27,
    category: "fantasy_epic",
    categoryNameAr: "فانتازيا ملحمية",
    categoryNameEn: "Epic Fantasy",
    titleAr: "حصن قزمي منحوت في جبل شاهق مع شلالات من البرونز وأبواب فولاذية عملاقة",
    subject: "A monumental dwarven fortress carved into an sheer mountain peak with bronze aqueducts and massive rune doors",
    tags: ["dwarven fortress", "rune doors", "mountain peak", "aqueducts"]
  },
  {
    id: 28,
    category: "fantasy_epic",
    categoryNameAr: "فانتازيا ملحمية",
    categoryNameEn: "Epic Fantasy",
    titleAr: "غابة البتولا الفضية المسحورة تسكنها أيايل ذات قرون بلورية متوهجة",
    subject: "An enchanted silver birch forest inhabited by spirit stags with luminous crystal antlers",
    tags: ["spirit stag", "crystal antlers", "silver birch", "enchanted forest"]
  },
  {
    id: 29,
    category: "fantasy_epic",
    categoryNameAr: "فانتازيا ملحمية",
    categoryNameEn: "Epic Fantasy",
    titleAr: "محارب بربري يلوح بفأسين على جسر صخري ضيق يدافع ضد جيش العفاريت",
    subject: "A fierce scarred barbarian warrior dual-wielding heavy axes defending a narrow stone bridge over an abyss",
    tags: ["barbarian", "bridge defense", "abyss", "axes", "epic combat"]
  },
  {
    id: 30,
    category: "fantasy_epic",
    categoryNameAr: "فانتازيا ملحمية",
    categoryNameEn: "Epic Fantasy",
    titleAr: "سوق مسحور في واحة عائمة بين السحب حيث تباع الزجاجات المليئة بالرياح والأحلام",
    subject: "A floating bazaar perched on drifting cloud platforms where genies barter bottled winds and liquid starlight",
    tags: ["floating bazaar", "clouds", "genies", "bottled dreams"]
  },
  {
    id: 31,
    category: "fantasy_epic",
    categoryNameAr: "فانتازيا ملحمية",
    categoryNameEn: "Epic Fantasy",
    titleAr: "مقبرة سيوف أثرية على قمة هضبة خضراء يغطيها الضباب عند شروق الشمس",
    subject: "A misty hill of ancient rusted swords embedded in emerald grass beneath a dramatic golden sunrise",
    tags: ["sword graveyard", "sunrise", "hill", "emerald grass", "legendary"]
  },
  {
    id: 32,
    category: "fantasy_epic",
    categoryNameAr: "فانتازيا ملحمية",
    categoryNameEn: "Epic Fantasy",
    titleAr: "أميرة الظلال ترتدي عباءة من العتمة الحية وتداعب غرابا ذا ثلاثة أعين",
    subject: "A shadow princess draped in living velvet darkness whispering to a three-eyed raven on a gothic parapet",
    tags: ["shadow princess", "three-eyed raven", "gothic", "living darkness"]
  },
  {
    id: 33,
    category: "fantasy_epic",
    categoryNameAr: "فانتازيا ملحمية",
    categoryNameEn: "Epic Fantasy",
    titleAr: "معبد الشمس الأزتيكي العائم فوق غابة مطيرة مع طقوس شعاع الذهب",
    subject: "A floating Mesoamerican sun temple over a dense jungle canopy with a golden laser beam piercing the sky",
    tags: ["sun temple", "jungle canopy", "golden beam", "ancient ruins"]
  },
  {
    id: 34,
    category: "fantasy_epic",
    categoryNameAr: "فانتازيا ملحمية",
    categoryNameEn: "Epic Fantasy",
    titleAr: "وحيد قرن سماوي يسير فوق غيم وردي مشرق تاركاً آثار أقدام من الغبار الكوني",
    subject: "A celestial unicorn trotting across iridescent pastel clouds leaving trails of stardust and prism reflections",
    tags: ["celestial unicorn", "stardust", "pastel clouds", "ethereal"]
  },
  {
    id: 35,
    category: "fantasy_epic",
    categoryNameAr: "فانتازيا ملحمية",
    categoryNameEn: "Epic Fantasy",
    titleAr: "مبارزة فرسان بالرماح في حلبة بطولة ملكية كبرى تحت أعلام ملونة وأمطار ربيعية",
    subject: "A high-stakes royal jousting tournament in a mud arena with heraldic banners fluttering in spring rain",
    tags: ["jousting tournament", "heraldic banners", "royal knights", "spring rain"]
  },
  {
    id: 36,
    category: "fantasy_epic",
    categoryNameAr: "فانتازيا ملحمية",
    categoryNameEn: "Epic Fantasy",
    titleAr: "حطام دروع عملاقة لحرب قديمة بين الآلهة والجبابرة تغطيها الأزهار البرية",
    subject: "The overgrown colossal helmet of a fallen titan resting in a meadow of vibrant scarlet poppies",
    tags: ["fallen titan", "colossal helmet", "poppy meadow", "mythic relics"]
  },
  {
    id: 37,
    category: "fantasy_epic",
    categoryNameAr: "فانتازيا ملحمية",
    categoryNameEn: "Epic Fantasy",
    titleAr: "ملك الموت يقف على ضفاف نهر ستيكس في قارب قديم بانتظار الأرواح",
    subject: "Charon the ferryman standing shrouded in mist on the River Styx steering an ancient skeletal barque",
    tags: ["charon", "river styx", "ferryman", "spectral mist"]
  },
  {
    id: 38,
    category: "fantasy_epic",
    categoryNameAr: "فانتازيا ملحمية",
    categoryNameEn: "Epic Fantasy",
    titleAr: "حكيمة الأعشاب في كوخ خشبي دافئ مضاء بجرار الفطر المضيء والجرعات المتوهجة",
    subject: "A cozy woodland hedge witch brewing a potion in a copper cauldron surrounded by jars of glowing mushrooms",
    tags: ["woodland witch", "potion brewing", "copper cauldron", "glowing mushrooms"]
  },
  {
    id: 39,
    category: "fantasy_epic",
    categoryNameAr: "فانتازيا ملحمية",
    categoryNameEn: "Epic Fantasy",
    titleAr: "سرب من الفراشات الزجاجية الشفافة يحلق حول تمثال رخامي في حديقة مهجورة",
    subject: "A swarm of translucent glass butterflies fluttering around a mossy classical marble nymph sculpture",
    tags: ["glass butterflies", "marble sculpture", "overgrown garden"]
  },
  {
    id: 40,
    category: "fantasy_epic",
    categoryNameAr: "فانتازيا ملحمية",
    categoryNameEn: "Epic Fantasy",
    titleAr: "حارس المنارة النجمية يوجه السفن الفضائية الخيالية عبر حزام الكويكبات بالبلورات",
    subject: "An astral lighthouse keeper focusing a massive multi-faceted amethyst lens into deep space",
    tags: ["astral lighthouse", "amethyst lens", "deep space", "cosmic fantasy"]
  },
  {
    id: 41,
    category: "fantasy_epic",
    categoryNameAr: "فانتازيا ملحمية",
    categoryNameEn: "Epic Fantasy",
    titleAr: "قوس قزح ناري ينبعث من فم أسد مجنح يقف حارساً على معبد الذهب",
    subject: "A winged celestial golden lion breathing a prism arc of pure chromatic fire atop a pyramid pedestal",
    tags: ["celestial lion", "chromatic fire", "gold temple", "wings"]
  },
  {
    id: 42,
    category: "fantasy_epic",
    categoryNameAr: "فانتازيا ملحمية",
    categoryNameEn: "Epic Fantasy",
    titleAr: "كهف بلورات الكوارتز العملاقة مع راهب يتأمل في حالة طفو كامل",
    subject: "A meditating monk levitating inside a geode cavern of towering rose quartz and amethyst crystals",
    tags: ["levitating monk", "geode cavern", "crystals", "serenity"]
  },
  {
    id: 43,
    category: "fantasy_epic",
    categoryNameAr: "فانتازيا ملحمية",
    categoryNameEn: "Epic Fantasy",
    titleAr: "حوريات بحرية بذيول زمردية تجتمع حول سفينة غارقة مليئة بالصناديق الذهبية",
    subject: "Bioluminescent mermaids with emerald scales exploring an ancient Spanish treasure galleon shipwreck",
    tags: ["mermaids", "treasure galleon", "emerald scales", "shipwreck"]
  },
  {
    id: 44,
    category: "fantasy_epic",
    categoryNameAr: "فانتازيا ملحمية",
    categoryNameEn: "Epic Fantasy",
    titleAr: "مدينة تحت الأرض محفورة بالكامل داخل جمجمة تنين كوكبي عملاق",
    subject: "A fantasy cliffside city built entirely inside the hollow fossilized skull of a primordial dragon",
    tags: ["dragon skull city", "fossilized", "fantasy architecture"]
  },
  {
    id: 45,
    category: "fantasy_epic",
    categoryNameAr: "فانتازيا ملحمية",
    categoryNameEn: "Epic Fantasy",
    titleAr: "مهرجان الأقنعة الفينيسي الخيالي في قصر عائم مع بالونات مضيئة وألعاب نارية",
    subject: "A Venetian fantasy masquerade ball on an ornate marble floating terrace with luminous hot air balloons",
    tags: ["venetian masquerade", "floating terrace", "lanterns", "carnival"]
  },
  {
    id: 46,
    category: "fantasy_epic",
    categoryNameAr: "فانتازيا ملحمية",
    categoryNameEn: "Epic Fantasy",
    titleAr: "فارس رمادي على جواد هيكلي يقطع جسراً من الضباب الكثيف في بلاد الموتى",
    subject: "A death knight on a spectral steed traversing a bridge made of solidified grey fog over an endless pit",
    tags: ["death knight", "spectral steed", "fog bridge", "netherworld"]
  },
  {
    id: 47,
    category: "fantasy_epic",
    categoryNameAr: "فانتازيا ملحمية",
    categoryNameEn: "Epic Fantasy",
    titleAr: "صائد الوحوش يقف بجانب وحش كيميرا صريع في سهول ثلجية ملطخة بالدماء",
    subject: "A grizzled monster hunter resting his claymore on a slain chimera in blood-dusted snowy tundra",
    tags: ["monster hunter", "chimera", "claymore", "snowy tundra"]
  },
  {
    id: 48,
    category: "fantasy_epic",
    categoryNameAr: "فانتازيا ملحمية",
    categoryNameEn: "Epic Fantasy",
    titleAr: "معبد الرياح الشاهق بأبراج من الفضة وأجراس رنين هوائية ضخمة تدق مع النسيم",
    subject: "A high-altitude mountain wind temple with towering silver wind-chimes resonating above a sea of clouds",
    tags: ["wind temple", "silver chimes", "cloud sea", "mountain spire"]
  },
  {
    id: 49,
    category: "fantasy_epic",
    categoryNameAr: "فانتازيا ملحمية",
    categoryNameEn: "Epic Fantasy",
    titleAr: "أم ترضع طفلها في مغارة مضيئة بينما تحرسها أنثى غريفين مجنحة",
    subject: "A tender mother and infant resting safely inside a glowing cavern guarded by a gentle resting griffon",
    tags: ["griffon guardian", "maternal", "glowing cavern", "peaceful"]
  },
  {
    id: 50,
    category: "fantasy_epic",
    categoryNameAr: "فانتازيا ملحمية",
    categoryNameEn: "Epic Fantasy",
    titleAr: "تتويج الملك الأسطوري في كاتدرائية من جذوع الأشجار الحية مع تيجان من الضوء",
    subject: "The grand coronation of a high king inside a living redwood cathedral with beams of dawn light creating halos",
    tags: ["coronation", "redwood cathedral", "high king", "divine rays"]
  },

  // ==========================================
  // 2. SCI-FI CINEMATIC (51-110)
  // ==========================================
  {
    id: 51,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "مدينة سايبربانك عملاقة تحت المطر الغزير مع سيارات طائرة ويافطات هولوغرافية",
    subject: "A sprawling cyberpunk megacity in heavy downpour, illuminated by holographic neon advertisements and flying spinners",
    tags: ["cyberpunk", "rain", "holographic billboards", "spinners"]
  },
  {
    id: 52,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "رائد فضاء وحيد يقف على سطح كوكب قرمزي يحدق في ثقب أسود ذي قرص تراكمي هائل",
    subject: "A lone astronaut standing on a crimson alien desert looking up at a gargantuan black hole with a glowing accretion disk",
    tags: ["astronaut", "black hole", "accretion disk", "alien desert"]
  },
  {
    id: 53,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "محطة مدارية فضائية دائرية ضخمة تدور حول كوكب الأرض مع أشعة شروق الشمس",
    subject: "A massive rotating torus orbital space station orbiting Earth with sun flare glinting off solar panels",
    tags: ["torus station", "earth orbit", "solar flare", "space engineering"]
  },
  {
    id: 54,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "سفينة شحن بين النجوم تدخل قفزة السرعة الفائقة عبر نفق زمكاني ملتوي",
    subject: "A colossal interstellar dreadnought breaching hyperspace, light warping and stretching in a chromatic wormhole",
    tags: ["hyperspace", "interstellar dreadnought", "chromatic wormhole"]
  },
  {
    id: 55,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "محارب سايبورغ في صالة تدريب نيون يضبط ذراعه الميكانيكية الشفافة مع أسلاك ألياف ضوئية",
    subject: "A battle-tested cyborg warrior calibrating a transparent carbon-fiber prosthetic arm with illuminated fiber optics",
    tags: ["cyborg", "prosthetic arm", "fiber optics", "neon gym"]
  },
  {
    id: 56,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "مستعمرة مريخية مغطاة بقبة جيوديسية زجاجية عملاقة تحت سماء الغروب الأزرق المريخي",
    subject: "A terraformed Martian colony enclosed under geodesic glass domes illuminated during an alien blue sunset",
    tags: ["mars colony", "geodesic dome", "blue sunset", "terraforming"]
  },
  {
    id: 57,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "آلي حربي ميكا عملاق يقف حارساً في منطقة صناعية مهجورة وسط تساقط الثلوج",
    subject: "A weathered 60-foot military battle mech standing dormant in a snow-covered abandoned industrial shipyard",
    tags: ["battle mech", "snow", "industrial shipyard", "military sci-fi"]
  },
  {
    id: 58,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "غرفة خادم حاسوب كمي متطور مع أنابيب تبريد نيتروجين سائل ومصفوفات ليزر",
    subject: "A supercooled quantum computing core room with glowing liquid nitrogen manifolds and floating ruby laser arrays",
    tags: ["quantum computer", "liquid nitrogen", "laser arrays", "data core"]
  },
  {
    id: 59,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "منجم كويكبات عائم في حزام الكواكب مع مركبات حفر ليزرية تقطع صخور البلاتين",
    subject: "Deep-space asteroid mining rig anchored to an iron-nickel asteroid, high-power plasma cutting beams slicing ore",
    tags: ["asteroid mining", "plasma cutters", "deep space", "industrial"]
  },
  {
    id: 60,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "طبيبة أندرويد تقوم بإصلاح دارات عصبية في مختبر طبي مستقبلي أبيض معقم",
    subject: "An empathetic female android doctor examining synthetic neural pathways in a sterile minimalist clinic",
    tags: ["android doctor", "synthetic neurology", "minimalist clinic", "ai"]
  },
  {
    id: 61,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "قطار رصاصة مغناطيسي هايبرلوب يمر بسرعة فائقة عبر نفق زجاجي في قاع المحيط",
    subject: "A high-speed maglev hyperloop train zooming through a transparent undersea tube surrounded by deep-sea fauna",
    tags: ["hyperloop", "undersea tube", "maglev", "bioluminescent sea"]
  },
  {
    id: 62,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "محقق سايبربانك في شقة مظلمة ينظر من النافذة نحو مدينة غارقة في الضباب الدخاني",
    subject: "A weary trenchcoat cyberpunk detective inside a dimly lit loft smoking by blinds overlooking neon smog",
    tags: ["cyberpunk detective", "trenchcoat", "film noir", "neon smog"]
  },
  {
    id: 63,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "مركبة استكشاف روفر سداسية العجلات تعبر سهول قمر يوروبا الجليدي بجانب كوكب المشتري",
    subject: "A heavy-duty six-wheeled exploration rover traversing the cracked ice plains of Europa with Jupiter looming large",
    tags: ["europa", "jupiter", "ice rover", "planetary exploration"]
  },
  {
    id: 64,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "مختبر نباتات فضائية يزرع أزهاراً متوهجة تمتص إشعاعات النجوم داخل سفينة أجيال",
    subject: "A lush hydroponic arboretum inside a generational colony ship cultivating radiant luminescent alien flora",
    tags: ["hydroponics", "colony ship", "luminescent plants", "botany"]
  },
  {
    id: 65,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "مواجهة طائرات درون قتالية ذاتية القيادة في وادي أودية صحراوية ضيقة",
    subject: "A squadron of stealth autonomous combat drones flying in tight formation through a narrow desert canyon",
    tags: ["combat drones", "stealth", "canyon flight", "autonomous"]
  },
  {
    id: 66,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "بوابة أرضية هائلة لبناء السفن الفضائية في صحراء نيفادا تحت سماء ليلية صافية",
    subject: "A monumental terrestrial spaceport shipyard assembling a 2-kilometer interstellar colony ship at night",
    tags: ["spaceport shipyard", "starship assembly", "night sky", "scaffolding"]
  },
  {
    id: 67,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "سوق سوداء سيبرانية في أزقة طوكيو المستقبلية لبيع رقائق الذاكرة والأعضاء البيونيكية",
    subject: "A crowded subterranean tech bazaar in futuristic Neo-Tokyo selling neural memory drives and bionic components",
    tags: ["tech bazaar", "neo tokyo", "neural chips", "cyberpunk street"]
  },
  {
    id: 68,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "مركبة شمسية شراعية بأشرعة ذهبية رقيقة كالحرير تبحر قرب هالة الشمس المتوهجة",
    subject: "A solar sail vessel with gossamer gold reflective sails catching photon streams near a blazing stellar corona",
    tags: ["solar sail", "stellar corona", "photon stream", "gold foil"]
  },
  {
    id: 69,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "منصة مراقبة فلكية على حافة قرص مجرة درب التبانة تطل على فضاء سحيق",
    subject: "An observation lounge on the rim of the galaxy looking out into the total cosmic dark void between galaxies",
    tags: ["observation deck", "galactic rim", "void", "starfield"]
  },
  {
    id: 70,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "غواصة بحثية مأهولة في محيطات قمر إنسيلادوس تحت كيلومترات من الجليد الصامد",
    subject: "A deep-sea research submarine probing thermal vents in the subterranean ocean of Enceladus",
    tags: ["enceladus", "thermal vents", "submarine", "alien ocean"]
  },
  {
    id: 71,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "طيار مقاتل فضائي في قمرة قيادة هولوغرافية كروية 360 درجة أثناء معركة أسطول",
    subject: "A starfighter pilot inside a 360-degree spherical holographic cockpit maneuvering through heavy fleet fire",
    tags: ["fighter cockpit", "holographic hud", "space battle", "pilot"]
  },
  {
    id: 72,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "بنية دايسون كروية عملاقة تحيط بنجم أبيض قزم لتسخير كل طاقته الإشعاعية",
    subject: "A mega-engineered Dyson swarm array encasing a glowing white dwarf star to harvest complete stellar power",
    tags: ["dyson swarm", "white dwarf", "megastructure", "stellar energy"]
  },
  {
    id: 73,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "سيدة أعمال مستقبلية في مكتب زجاجي معلق على ارتفاع 500 طابق فوق السحاب",
    subject: "A futuristic corporate executive standing in a glass cantilever boardroom 500 floors above cloud layer",
    tags: ["skyscraper boardroom", "above clouds", "corporate sci-fi", "glass"]
  },
  {
    id: 74,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "مستكشف آثار يكتشف مسلة معدنية لكائنات فضائية عتيقة نصف مدفونة في رمال كوكب أحمر",
    subject: "A xenobiologist discovering a massive obsidian alien monolith inscribed with pulsing cyan light in desert dunes",
    tags: ["alien monolith", "cyan runes", "xenobiology", "desert planet"]
  },
  {
    id: 75,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "مختبر استنساخ جيني مع كبسولات شفافة تحتوي على أشكال حياة متطورة في سائل أزرق",
    subject: "A secret bio-engineering cloning bay with rows of illuminated stasis pods suspended in amniotic azure fluid",
    tags: ["cloning bay", "stasis pods", "bio engineering", "amniotic fluid"]
  },
  {
    id: 76,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "دراجة نارية مستقبلية طائرة مضادة للجاذبية تسير بسرعة على طريق نيون معلق",
    subject: "A sleek anti-gravity hoverbike speeding along a magnetic skyway bridge over an illuminated metropolis",
    tags: ["hoverbike", "anti-gravity", "skyway bridge", "speed trail"]
  },
  {
    id: 77,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "مصعد فضائي ضخم يرتفع من منصة بحرية في المحيط الهادئ إلى المدار الثابت",
    subject: "A carbon-nanotube space elevator tether rising straight up from an ocean platform into the starry cosmos",
    tags: ["space elevator", "carbon nanotube", "ocean platform", "geostationary"]
  },
  {
    id: 78,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "روبوت ذكاء اصطناعي يعزف على بيانو أثري في قصر منهار بعد ألف عام من اختفاء البشر",
    subject: "A solitary weathered sentient robot playing an antique grand piano in an overgrown ruined ballroom",
    tags: ["sentient robot", "grand piano", "post-apocalypse", "poignant"]
  },
  {
    id: 79,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "بوابة نقل فوري كمي في مركز بحوث سرن المستقبلي أثناء تشغيلها لأول مرة",
    subject: "A massive particle accelerator teleportation ring opening an event horizon portal in an underground facility",
    tags: ["quantum teleportation", "particle accelerator", "event horizon"]
  },
  {
    id: 80,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "معركة جوية بين مقاتلات خفية في سديم فضائي مشتعل بالألوان الكونية",
    subject: "A high-speed dogfight between angular stealth fighters inside a glowing purple and teal emission nebula",
    tags: ["nebula dogfight", "stealth fighters", "cosmic colors", "ionized gas"]
  },
  {
    id: 81,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "سفينة مستشفى إنسانية تهبط في منطقة منكوبة على كوكب بركاني لإجلاء المدنيين",
    subject: "A gleaming white humanitarian medical evacuation frigate touching down amid volcanic ash and lava geysers",
    tags: ["medical frigate", "evacuation", "volcanic planet", "rescue"]
  },
  {
    id: 82,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "مدينة بيئية عملاقة 'سولاربونك' مغطاة بالحدائق العمودية والألواح الشمسية النباتية",
    subject: "A bright optimistic solarpunk eco-city with vertical hanging forests, clean glass tramways, and solar sails",
    tags: ["solarpunk", "eco-city", "vertical forest", "clean energy"]
  },
  {
    id: 83,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "مهندس صيانة فضاء يرتدي بدلة ثقيلة يقوم بإصلاح تلسكوب فضائي عملاق عاكس",
    subject: "An astronaut spacewalking with an EVA thruster pack repairing the gold hexagonal mirror of a cosmic telescope",
    tags: ["spacewalk", "eva pack", "hexagonal mirror", "space telescope"]
  },
  {
    id: 84,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "سوق سمك ومأكولات ليلية مستقبلية تحت جسر معلق مضاء بالنيون في مدينة شينزن 2099",
    subject: "A vibrant crowded midnight wet market beneath a double-decker maglev highway with neon lanterns and steam",
    tags: ["cyberpunk market", "maglev highway", "steam", "neon lanterns"]
  },
  {
    id: 85,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "بقايا سفينة فضائية أسطورية محطمة منذ قرون تحولت إلى واحة استيطانية",
    subject: "The rusted half-buried hull of a titan-class starship repurposed into a thriving pioneer desert settlement",
    tags: ["derelict starship", "settlement", "desert pioneer", "salvage"]
  },
  {
    id: 86,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "طائرة استطلاع جوي تفوق سرعة الصوت 'ماخ 10' تخترق طبقة الستراتوسفير تاركة أثراً بلازمياً",
    subject: "A Mach 10 hypersonic reconnaissance aircraft skipping off the upper stratosphere leaving an incandescent plasma contrail",
    tags: ["hypersonic", "mach 10", "plasma contrail", "stratosphere"]
  },
  {
    id: 87,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "معبد ذكاء اصطناعي حيث يتعبد البشر أمام حاسوب إلهي يتجسد كأعمدة ضوء ليزرية",
    subject: "A futuristic brutalist cathedral where pilgrims revere a sentient AI deity manifested as a pillar of blinding laser light",
    tags: ["ai cathedral", "brutalist", "laser deity", "cyber religion"]
  },
  {
    id: 88,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "طبيب جراح آلي متعدد الأذرع يجري عملية زرع شبكية إلكترونية معقدة لمريض",
    subject: "A precision micro-surgical robotic array performing bionic retinal implants under focused surgical spotlights",
    tags: ["robotic surgery", "bionic eye", "precision medicine", "cybernetics"]
  },
  {
    id: 89,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "كوكب غازي عملاق مع حلقات ذهبية لامعة بينما تمر من خلالها سفينة بحثية صغيرة",
    subject: "A delicate scientific probe ship skimming through the glittering ice dust of a gas giant's magnificent planetary ring",
    tags: ["gas giant", "planetary ring", "probe ship", "cosmic dust"]
  },
  {
    id: 90,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "قناص سايبورغ مموه يختبئ بين أوراق شجر غابة استوائية رقمية اصطناعية",
    subject: "An active-camouflage cyborg sniper blending seamlessly into a synthetic digital rainforest foliage",
    tags: ["active camouflage", "cyborg sniper", "digital jungle", "stealth"]
  },
  {
    id: 91,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "محطة نووية اندماجية عملاقة على الشاطئ تطلق نبضات من البلازما الزرقاء الصافية",
    subject: "A coastal magnetic tokamak fusion reactor discharging clean blue Cherenkov glow into sea mist at twilight",
    tags: ["fusion reactor", "tokamak", "cherenkov radiation", "clean tech"]
  },
  {
    id: 92,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "شاحنة استكشاف قطبية عابرة للقارات تشق طريقها عبر رمال المريخ الجليدية الجافة",
    subject: "A massive multi-treaded polar exploration crawler grinding through carbon dioxide frost on the Martian ice cap",
    tags: ["polar crawler", "martian ice cap", "treads", "exploration"]
  },
  {
    id: 93,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "مدينة عائمة في سحب كوكب الزهرة مع بالونات هوائية ضخمة من الجرافين المقوى",
    subject: "An aerostat cloud city floating 50 km above the surface of Venus in the temperate habitable cloud layer",
    tags: ["venus cloud city", "aerostat", "floating habitat", "graphene"]
  },
  {
    id: 94,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "مواجهة شرطي آلي ضد متمردين في زقاق مبلل بمياه الأمطار والأضواء الحمراء",
    subject: "A heavy riot-control security android confronting rogue hackers in a rain-slicked alley bathed in crimson sirens",
    tags: ["security android", "hackers", "rain-slicked alley", "crimson sirens"]
  },
  {
    id: 95,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "مكتبة بيانات رقمية عالمية عملاقة تحت الأرض تحتوي على ذاكرة البشرية بأكملها",
    subject: "A subterranean crystalline archive storing the entirety of human knowledge on monolithic diamond storage slabs",
    tags: ["diamond archive", "subterranean data", "monoliths", "human knowledge"]
  },
  {
    id: 96,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "سفينة نقل كوكبية تقترب من قمر تيتان وتخترق غلافه الجوي البرتقالي الكثيف",
    subject: "A heavy atmospheric lander penetrating the hazy orange nitrogen atmosphere of Titan with methane lakes visible below",
    tags: ["titan", "methane lakes", "orange haze", "planetary lander"]
  },
  {
    id: 97,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "مهندس نانو-روبوتات يوجه سحابة من الذرات الذكية لإعادة بناء جزء من جدار محطم",
    subject: "A nanotech engineer commanding a swarm of glowing molecular nanobots re-assembling a shattered alloy bulkhead",
    tags: ["nanobots", "molecular engineering", "repair", "high-tech"]
  },
  {
    id: 98,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "سباق سيارات فائقة السرعة على حلبة مغناطيسية تدور حول فوهة بركانية على قمر صناعي",
    subject: "Anti-gravity hypercar racing along an inverted track suspended over a volcanic lunar impact basin",
    tags: ["anti-gravity racing", "hypercar", "lunar basin", "neon speed"]
  },
  {
    id: 99,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "كائن فضائي ذكي شبه شفاف يتواصل مع علماء الأرض عبر أشكال هندسية ضوئية",
    subject: "A first contact encounter with a bioluminescent crystalline extraterrestrial entity projecting fractal light equations",
    tags: ["first contact", "extraterrestrial", "fractal light", "communication"]
  },
  {
    id: 100,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "محطة شحن طاقة مدارية تبث ليزراً شمسياً فائقاً إلى شبكة كهرباء المدن على الأرض",
    subject: "A space-based solar power satellite beaming microwave energy to a terrestrial rectenna grid at sunrise",
    tags: ["space solar power", "energy beam", "rectenna", "green future"]
  },
  {
    id: 101,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "حفل أوبرا فضائي داخل قاعة انعدام جاذبية مع مغنية تطفو وسط كرات ماء موسيقية",
    subject: "A zero-gravity opera hall with a soprano in a fluid cyber-gown floating amidst dancing acoustic water spheres",
    tags: ["zero gravity", "opera", "floating water", "acoustic design"]
  },
  {
    id: 102,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "حاجز حماية كوكبي ضد النيازك يضيء السماء الليلية بشبكة سداسية زرقاء عند الاصطدام",
    subject: "A planetary defense energy shield glowing in a hexagonal grid as it vaporizes an incoming meteor storm",
    tags: ["energy shield", "hexagonal grid", "meteor storm", "planetary defense"]
  },
  {
    id: 103,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "مختبر سري لدراسة الثقوب الدودية المصغرة في قلب جبل في القطب الجنوبي",
    subject: "A clandestine Antarctic research lab containing a microscopic stable wormhole suspended in magnetic coils",
    tags: ["micro wormhole", "antarctic lab", "magnetic containment", "physics"]
  },
  {
    id: 104,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "سفينة استيطان عملاقة تستعد للنزول على كوكب جديد واعد يشبه الأرض",
    subject: "A colossal ark ship with millions of sleeping colonists entering the orbit of a pristine verdant exoplanet",
    tags: ["ark ship", "exoplanet", "colonization", "new earth"]
  },
  {
    id: 105,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "غواص سايبربانك يستكشف حطام ناطحات سحاب مانهاتن الغارقة بعد فيضان البحار",
    subject: "A cybernetic deep-sea salvage diver exploring the drowned canyons of sunken Manhattan skyscrapers",
    tags: ["sunken manhattan", "cyber diver", "submerged skyscraper", "salvage"]
  },
  {
    id: 106,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "نظام أمني بالذكاء الاصطناعي يتجسد كذئب نيون هندسي يطارد فيروساً في الفضاء الرقمي",
    subject: "A visual metaphor of cybersecurity: a wireframe neon wolf hunting crystalline red malware in cyberspace",
    tags: ["cyberspace", "neon wolf", "malware hunt", "wireframe"]
  },
  {
    id: 107,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "محطة قطار فضائية بين الكواكب في نقطة لاغرانج مع مئات المسافرين ببدلات فضاء خفيفة",
    subject: "A bustling Lagrange point transit terminal with commuters in sleek pressure suits boarding shuttle pods",
    tags: ["lagrange point", "space terminal", "commuters", "shuttle pods"]
  },
  {
    id: 108,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "مركبة زراعية روبوتية ذاتية القيادة تحصد حقول قمح ذهبية شاسعة تحت سماء الغروب",
    subject: "A massive autonomous combine harvester swarm rolling across endless Midwest wheat fields under a crimson dusk",
    tags: ["autonomous harvester", "wheat fields", "agritech", "dusk"]
  },
  {
    id: 109,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "محطة أرصاد جوية في عين إعصار فضائي يدور فوق سطح كوكب عملاق عاصف",
    subject: "A research station anchored inside the calm eye of an atmospheric hyper-hurricane on a tempest world",
    tags: ["hyper-hurricane", "eye of storm", "tempest planet", "research"]
  },
  {
    id: 110,
    category: "sci_fi_cinematic",
    categoryNameAr: "سينما الخيال العلمي",
    categoryNameEn: "Sci-Fi Cinematic",
    titleAr: "رائد فضاء يغرس زهرة عباد شمس طبيعية في تربة أول مستعمرة بشرية خارج المجموعة الشمسية",
    subject: "An astronaut carefully planting a single yellow sunflower into foreign alien soil under a binary sunset",
    tags: ["sunflower", "binary sunset", "first alien garden", "hope"]
  },

  // ==========================================
  // 3. CLASSICAL & RENAISSANCE ART (111-150)
  // ==========================================
  {
    id: 111,
    category: "classical_art",
    categoryNameAr: "فنون كلاسيكية",
    categoryNameEn: "Classical Art",
    titleAr: "لوحة زيتية بأسلوب كارافاجيو: فيلسوف يدرس جمجمة تحت ضوء شمعة خافت بتباين درامي",
    subject: "A Caravaggio chiaroscuro oil painting of an aging philosopher contemplating a skull by a single flickering candle",
    tags: ["caravaggio", "chiaroscuro", "oil painting", "philosopher", "candlelight"]
  },
  {
    id: 112,
    category: "classical_art",
    categoryNameAr: "فنون كلاسيكية",
    categoryNameEn: "Classical Art",
    titleAr: "جدارية عصر النهضة بأسلوب ميكيلانجيلو: خلق النجوم في قبة سقف كاتدرائية فخمة",
    subject: "A Renaissance fresco in the grand style of Michelangelo depicting the birth of constellations across a cathedral vault",
    tags: ["renaissance fresco", "michelangelo", "cathedral vault", "constellations"]
  },
  {
    id: 113,
    category: "classical_art",
    categoryNameAr: "فنون كلاسيكية",
    categoryNameEn: "Classical Art",
    titleAr: "طبيعة صامتة هولندية كلاسيكية: باقة زهور توليب وفاكهة وفراشة مع إضاءة نافذة ناعمة",
    subject: "A Dutch Golden Age still life oil painting with velvet drapery, dewy tulips, ripe figs, and a perched swallowtail butterfly",
    tags: ["dutch golden age", "still life", "tulips", "velvet", "masterpiece"]
  },
  {
    id: 114,
    category: "classical_art",
    categoryNameAr: "فنون كلاسيكية",
    categoryNameEn: "Classical Art",
    titleAr: "لوحة بحرية بأسلوب تيرنر: سفينة شراعية ملكية تصارع أمواج البحر الثائر في عاصفة ذهبية",
    subject: "A J.M.W. Turner oil painting of a tall ship battling turbulent churning sea spray during a dramatic golden tempest",
    tags: ["turner", "turbulent sea", "tall ship", "golden tempest", "romanticism"]
  },
  {
    id: 115,
    category: "classical_art",
    categoryNameAr: "فنون كلاسيكية",
    categoryNameEn: "Classical Art",
    titleAr: "تمثال رخامي كلاسيكي أبيض لإلهة الحكمة أثينا في فناء معبد إغريقي تحت أشعة الشمس",
    subject: "A pristine Carrara marble sculpture of Athena with delicate translucent fabric folds standing in a sunlit Greek colonnade",
    tags: ["carrara marble", "athena", "greek colonnade", "classical sculpture"]
  },
  {
    id: 116,
    category: "classical_art",
    categoryNameAr: "فنون كلاسيكية",
    categoryNameEn: "Classical Art",
    titleAr: "بورتريه نبيلة بأسلوب فيرمير بجانب نافذة مفتوحة مع لؤلؤة متألقة وضوء شمالي هادئ",
    subject: "A Johannes Vermeer interior portrait of a young noblewoman reading a letter by an open casement with pearl earrings",
    tags: ["vermeer", "pearl earring", "casement window", "soft daylight"]
  },
  {
    id: 117,
    category: "classical_art",
    categoryNameAr: "فنون كلاسيكية",
    categoryNameEn: "Classical Art",
    titleAr: "لوحة كلاسيكية بأسلوب رامبرانت: نقابة الجراحين يدرسون مخطوطة تشريح تحت ضوء مصباح دافئ",
    subject: "A Rembrandt-inspired oil painting of scholars crowded around an antique manuscript under warm golden lantern light",
    tags: ["rembrandt", "warm lantern", "impasto", "golden shadows"]
  },
  {
    id: 118,
    category: "classical_art",
    categoryNameAr: "فنون كلاسيكية",
    categoryNameEn: "Classical Art",
    titleAr: "منظر طبيعي رومانسي بأسلوب كاسبار ديفيد فريدريش: مسافر يتأمل بحر الضباب من قمة جبلية",
    subject: "A romantic oil painting in the style of Caspar David Friedrich: a wanderer above a sea of fog on a rocky precipice",
    tags: ["friedrich", "sea of fog", "wanderer", "romanticism", "sublime"]
  },
  {
    id: 119,
    category: "classical_art",
    categoryNameAr: "فنون كلاسيكية",
    categoryNameEn: "Classical Art",
    titleAr: "لوحة بأسلوب ما قبل الرافائيلية: عذراء الغابة تجمع زنابق الماء في جدول مائي بلوري",
    subject: "A Pre-Raphaelite oil painting of a maiden in embroidered brocade gathering water lilies by an enchanted brook",
    tags: ["pre-raphaelite", "water lilies", "brocade gown", "botanical precision"]
  },
  {
    id: 120,
    category: "classical_art",
    categoryNameAr: "فنون كلاسيكية",
    categoryNameEn: "Classical Art",
    titleAr: "وليمة باروكية ملكية داخل قاعة مرايا فرساي مع ثريات كريستال متلألئة وخدم بأزياء مطرزة",
    subject: "A lavish Baroque court banquet inside an opulent hall of mirrors with dripping crystal chandeliers and gold tableware",
    tags: ["baroque banquet", "hall of mirrors", "crystal chandeliers", "gold leaf"]
  },
  {
    id: 121,
    category: "classical_art",
    categoryNameAr: "فنون كلاسيكية",
    categoryNameEn: "Classical Art",
    titleAr: "حديقة أندلسية بأسلوب الرسم الاستشراقي الكلاسيكي: باحة قصر الحمراء مع نافورة وفسيفساء",
    subject: "An Orientalist masterpiece painting of an Alhambra courtyard with ornate zellij mosaics, jasmine, and marble fountain",
    tags: ["orientalist", "alhambra", "zellij mosaics", "fountain", "andalusian"]
  },
  {
    id: 122,
    category: "classical_art",
    categoryNameAr: "فنون كلاسيكية",
    categoryNameEn: "Classical Art",
    titleAr: "لوحة معركة تاريخية بأسلوب جاك لوي دافيد: نابليون يعبر جبال الألب على جواد جامح",
    subject: "A Neoclassical historical oil painting of a heroic commander on a rearing white charger crossing treacherous alpine passes",
    tags: ["neoclassical", "rearing charger", "alpine pass", "heroic portrait"]
  },
  {
    id: 123,
    category: "classical_art",
    categoryNameAr: "فنون كلاسيكية",
    categoryNameEn: "Classical Art",
    titleAr: "لوحة ريفية بأسلوب مونيه الانطباعي: جسر ياباني فوق بركة زنابق ماء مغمورة بضوء الصباح",
    subject: "An Impressionist canvas in Claude Monet's style: a wooden arched bridge spanning a tranquil water lily pond in morning haze",
    tags: ["impressionism", "monet", "water lilies", "arched bridge", "brushwork"]
  },
  {
    id: 124,
    category: "classical_art",
    categoryNameAr: "فنون كلاسيكية",
    categoryNameEn: "Classical Art",
    titleAr: "لوحة ليلية بأسلوب فان جوخ: ليلة مرصعة بالنجوم فوق قرية فرنسية هادئة مع دوامات سديمية",
    subject: "A Vincent van Gogh post-impressionist landscape with swirling starry constellations and thick impasto brush strokes",
    tags: ["van gogh", "starry night", "impasto", "post-impressionism"]
  },
  {
    id: 125,
    category: "classical_art",
    categoryNameAr: "فنون كلاسيكية",
    categoryNameEn: "Classical Art",
    titleAr: "تمثال برونزي كلاسيكي لمحارب أسبرطي بعد الانتصار مع تفاصيل عضلات مشدودة ودروع منحوتة",
    subject: "A patinated classical bronze sculpture of a victorious Spartan warrior resting on his heavy hoplite shield",
    tags: ["bronze sculpture", "spartan warrior", "patina", "hoplite shield"]
  },
  {
    id: 126,
    category: "classical_art",
    categoryNameAr: "فنون كلاسيكية",
    categoryNameEn: "Classical Art",
    titleAr: "لوحة بأسلوب غوستاف كليمت: عناق ذهبي مع نقوش أرت نوفو هندسية وأوراق ذهبية فاخرة",
    subject: "A Gustav Klimt Art Nouveau masterpiece with ornate gold leaf leafing, shimmering geometric spirals, and mosaic patterns",
    tags: ["klimt", "art nouveau", "gold leaf", "geometric mosaics"]
  },
  {
    id: 127,
    category: "classical_art",
    categoryNameAr: "فنون كلاسيكية",
    categoryNameEn: "Classical Art",
    titleAr: "لوحة بأسلوب إدغار ديغا: راقصات باليه في كواليس المسرح تحت ضوء المصابيح الدافئة",
    subject: "An Edgar Degas impressionist pastel painting of ballerina dancers tying their silk ribbons backstage",
    tags: ["degas", "ballerinas", "pastel", "backstage lighting"]
  },
  {
    id: 128,
    category: "classical_art",
    categoryNameAr: "فنون كلاسيكية",
    categoryNameEn: "Classical Art",
    titleAr: "قبة كنيسة أرثوذكسية بيزنطية مليئة بفسيفساء ذهبية تصور القديسين والملائكة",
    subject: "A Byzantine gold mosaic apse dome with intricately tiled celestial saints and archangels glistening in candlelight",
    tags: ["byzantine mosaic", "gold tesserae", "apse dome", "orthodox"]
  },
  {
    id: 129,
    category: "classical_art",
    categoryNameAr: "فنون كلاسيكية",
    categoryNameEn: "Classical Art",
    titleAr: "لوحة طبيعية هادئة بأسلوب جون كونستابل: طاحونة مائية ريفية إنجليزية بجانب نهر هادئ",
    subject: "A John Constable landscape painting of a traditional timber watermill beside a willow-lined English river in summer",
    tags: ["constable", "watermill", "english countryside", "pastoral"]
  },
  {
    id: 130,
    category: "classical_art",
    categoryNameAr: "فنون كلاسيكية",
    categoryNameEn: "Classical Art",
    titleAr: "لوحة بأسلوب ويليام بليك: مخلوق إلهي سماوي يقيس الكون بفرجار ذهبي بين الغيوم",
    subject: "A William Blake visionary illustration of the Ancient of Days measuring the cosmos with golden compasses from a fiery orb",
    tags: ["william blake", "ancient of days", "visionary art", "golden compass"]
  },
  {
    id: 131,
    category: "classical_art",
    categoryNameAr: "فنون كلاسيكية",
    categoryNameEn: "Classical Art",
    titleAr: "لوحة باروكية بأسلوب روبنز: سقوط العمالقة مع أجساد ديناميكية متشابكة في معركة ملحمية",
    subject: "A dynamic Peter Paul Rubens Baroque composition of muscular figures clashing in dramatic mythological turmoil",
    tags: ["rubens", "baroque dynamism", "mythology", "fleshtones"]
  },
  {
    id: 132,
    category: "classical_art",
    categoryNameAr: "فنون كلاسيكية",
    categoryNameEn: "Classical Art",
    titleAr: "حديقة كلاسيكية رومانية مع أشجار السرو العالية وتماثيل الرخام وبحيرة هادئة عند الغسق",
    subject: "An Italianate classical villa garden at dusk with tall slender cypress trees and marble busts reflected in a still pool",
    tags: ["italianate garden", "cypress trees", "marble busts", "dusk"]
  },
  {
    id: 133,
    category: "classical_art",
    categoryNameAr: "فنون كلاسيكية",
    categoryNameEn: "Classical Art",
    titleAr: "لوحة بأسلوب سيزان: أواني فخارية وسلال تفاح مائلة على طاولة خشبية بتكوين تركيبي",
    subject: "A Paul Cézanne post-impressionist still life with sculptural apples, tilted white cloth, and earthy terracotta pottery",
    tags: ["cezanne", "still life", "apples", "post-impressionism"]
  },
  {
    id: 134,
    category: "classical_art",
    categoryNameAr: "فنون كلاسيكية",
    categoryNameEn: "Classical Art",
    titleAr: "لوحة كلاسيكية للمدرسة الفلمنكية: خيميائي ومساعده يراقبون تجربة في ورشة مظلمة",
    subject: "A Flemish Renaissance oil painting of an alchemist and his apprentice tending a glowing hearth in a cluttered workshop",
    tags: ["flemish oil", "alchemist hearth", "cluttered workshop", "detail"]
  },
  {
    id: 135,
    category: "classical_art",
    categoryNameAr: "فنون كلاسيكية",
    categoryNameEn: "Classical Art",
    titleAr: "مخطوطة مذهبة من القرون الوسطى مع حواف مزخرفة بالزهور وحروف كاليغرافية مرصعة بالذهب",
    subject: "A medieval illuminated manuscript page on vellum with gold-leaf miniature illustrations and botanical margins",
    tags: ["illuminated manuscript", "vellum", "gold leaf", "calligraphy"]
  },
  {
    id: 136,
    category: "classical_art",
    categoryNameAr: "فنون كلاسيكية",
    categoryNameEn: "Classical Art",
    titleAr: "تمثال رخامي بأسلوب رودان: 'المفكر' متأملاً على قاعدة صخرية وسط حديقة خريفية",
    subject: "An Auguste Rodin expressive bronze sculpture of a solitary thinker leaning his chin on hand on a rough boulder",
    tags: ["rodin", "the thinker", "expressive bronze", "autumn park"]
  },
  {
    id: 137,
    category: "classical_art",
    categoryNameAr: "فنون كلاسيكية",
    categoryNameEn: "Classical Art",
    titleAr: "لوحة كلاسيكية بأسلوب كاناليتو: القناة الكبرى في البندقية مع الجندول والقصور المائية",
    subject: "A Canaletto veduta masterwork of the Grand Canal in Venice filled with graceful gondolas and baroque palazzi",
    tags: ["canaletto", "venice", "grand canal", "gondolas", "veduta"]
  },
  {
    id: 138,
    category: "classical_art",
    categoryNameAr: "فنون كلاسيكية",
    categoryNameEn: "Classical Art",
    titleAr: "لوحة بورتريه ذاتية بأسلوب دورر: فنان بنظرة ثاقبة وسترة فرو فاخرة وتفاصيل دقيقة للشعر",
    subject: "An Albrecht Dürer self-portrait style with meticulous hair texture, fur-trimmed mantle, and northern light",
    tags: ["albrecht durer", "northern renaissance", "fur mantle", "precision"]
  },
  {
    id: 139,
    category: "classical_art",
    categoryNameAr: "فنون كلاسيكية",
    categoryNameEn: "Classical Art",
    titleAr: "لوحة بأسلوب سورا التنقيطي: نزهة عائلية على ضفاف نهر السين تحت ظلال الأشجار الصيفية",
    subject: "A Georges Seurat pointillist composition of peaceful Sunday strollers beside the river Seine with dappled light",
    tags: ["seurat", "pointillism", "river seine", "summer strollers"]
  },
  {
    id: 140,
    category: "classical_art",
    categoryNameAr: "فنون كلاسيكية",
    categoryNameEn: "Classical Art",
    titleAr: "لوحة ميثولوجية بأسلوب بوتيتشيلي: ولادة فينوس على صدفة لؤلؤية فوق أمواج البحر",
    subject: "A Sandro Botticelli early Renaissance painting of a goddess on a giant scallop shell pushed by wind zephyrs",
    tags: ["botticelli", "birth of venus", "scallop shell", "renaissance"]
  },
  {
    id: 141,
    category: "classical_art",
    categoryNameAr: "فنون كلاسيكية",
    categoryNameEn: "Classical Art",
    titleAr: "لوحة خيل بأسلوب جورج ستابس: فحل عربي أصيل في مرعى خضراء مع سماء درامية",
    subject: "A George Stubbs equestrian oil portrait of an Arabian stallion with muscular anatomy poised in an English pasture",
    tags: ["arabian stallion", "equestrian art", "george stubbs", "anatomy"]
  },
  {
    id: 142,
    category: "classical_art",
    categoryNameAr: "فنون كلاسيكية",
    categoryNameEn: "Classical Art",
    titleAr: "لوحة أوبرا باروكية داخل مسرح باليرمو القديم مع الجمهور في مقصورات مذهبة",
    subject: "An ornate 18th-century opera house performance viewed from upper velvet boxes with candlelit stage chandeliers",
    tags: ["opera house", "palermo", "velvet boxes", "candlelit stage"]
  },
  {
    id: 143,
    category: "classical_art",
    categoryNameAr: "فنون كلاسيكية",
    categoryNameEn: "Classical Art",
    titleAr: "لوحة بأسلوب كازيمير ماليفيتش: تكوين سوبرماتيكي بأشكال هندسية نقية تطفو في فراغ أبيض",
    subject: "A Suprematist abstract art composition with intersecting bold geometric polygons floating in pure white space",
    tags: ["suprematism", "malevich", "geometric abstraction", "avant-garde"]
  },
  {
    id: 144,
    category: "classical_art",
    categoryNameAr: "فنون كلاسيكية",
    categoryNameEn: "Classical Art",
    titleAr: "منمنمة فارسية كلاسيكية معقدة: أمير يصطاد غزالاً في حديقة خرافية مزينة بالذهب واللازورد",
    subject: "A Persian miniature painting with intricate gold leaf foliage, lapis lazuli skies, and mounted court archers",
    tags: ["persian miniature", "lapis lazuli", "gold illumination", "court art"]
  },
  {
    id: 145,
    category: "classical_art",
    categoryNameAr: "فنون كلاسيكية",
    categoryNameEn: "Classical Art",
    titleAr: "لوحة كلاسيكية بأسلوب غويا: قصر ريفي مهجور تحت سماء رمادية مع سرب غربان سوداء",
    subject: "A Francisco Goya moody romantic oil painting of a desolated Spanish manor under dark atmospheric storm clouds",
    tags: ["goya", "moody landscape", "ravens", "storm clouds"]
  },
  {
    id: 146,
    category: "classical_art",
    categoryNameAr: "فنون كلاسيكية",
    categoryNameEn: "Classical Art",
    titleAr: "نقش ياباني كلاسيكي 'أوكييو-إه' بأسلوب هوكوساي: موجة عملاقة أمام جبل فوجي المغطى بالثلوج",
    subject: "A Hokusai ukiyo-e woodblock print depicting a colossal cresting wave framing Mount Fuji in the background",
    tags: ["ukiyo-e", "hokusai", "great wave", "mount fuji", "woodblock"]
  },
  {
    id: 147,
    category: "classical_art",
    categoryNameAr: "فنون كلاسيكية",
    categoryNameEn: "Classical Art",
    titleAr: "لوحة بأسلوب سارجنت: سيدة مجتمع في ثوب سهرة من الساتان الأسود مع انعكاسات ضوء فضية",
    subject: "A John Singer Sargent society portrait of a lady in a sleek black satin evening gown with luminous skin tones",
    tags: ["sargent", "portraiture", "black satin", "brushwork elegance"]
  },
  {
    id: 148,
    category: "classical_art",
    categoryNameAr: "فنون كلاسيكية",
    categoryNameEn: "Classical Art",
    titleAr: "لوحة رومانسية بأسلوب فريدريك تشيرش: شلالات نياجرا مع قوس قزح مزدوج في رذاذ الصباح",
    subject: "A Frederic Edwin Church Hudson River School panorama of roaring waterfalls with a double rainbow in morning mist",
    tags: ["hudson river school", "waterfalls", "double rainbow", "monumental"]
  },
  {
    id: 149,
    category: "classical_art",
    categoryNameAr: "فنون كلاسيكية",
    categoryNameEn: "Classical Art",
    titleAr: "نافذة زجاج معشق قوطية ملونة داخل كاتدرائية نوتردام تخترقها أشعة الشمس",
    subject: "A monumental Gothic stained glass rose window projecting chromatic rainbow beams onto ancient flagstones",
    tags: ["stained glass", "rose window", "gothic cathedral", "chromatic beams"]
  },
  {
    id: 150,
    category: "classical_art",
    categoryNameAr: "فنون كلاسيكية",
    categoryNameEn: "Classical Art",
    titleAr: "لوحة عصر النهضة لورشة ليوناردو دافنشي: تصاميم آلات طيران ومخططات تشريحية على ورق قديم",
    subject: "Leonardo da Vinci's studio desk with mirror-script anatomical parchment drawings, brass calipers, and flying machine models",
    tags: ["da vinci", "anatomical sketch", "flying machine", "parchment"]
  },

  // ==========================================
  // 4. SCI-FI SURREAL & BIOMECH (151-185)
  // ==========================================
  {
    id: 151,
    category: "sci_fi_surreal_art",
    categoryNameAr: "سريالية الخيال والغرائبيات",
    categoryNameEn: "Sci-Fi Surreal & Biomech",
    titleAr: "حديقة بيوميكانيكية بأسلوب إتش آر غيغر مع كابلات عصبية وأزهار هيكلية من الكروم",
    subject: "An H.R. Giger inspired biomechanical garden with polished bone pillars, ribbed neural cables, and chrome lilies",
    tags: ["hr giger", "biomechanical", "chrome lilies", "neural cables"]
  },
  {
    id: 152,
    category: "sci_fi_surreal_art",
    categoryNameAr: "سريالية الخيال والغرائبيات",
    categoryNameEn: "Sci-Fi Surreal & Biomech",
    titleAr: "ساعات قمرية منصهرة تتدلى على فروع أشجار ميتة في صحراء كوكب فضائي بأسلوب دالي",
    subject: "A Salvador Dalí surrealist dreamscape with melting cybernetic clocks draped over dead branches on a red sand desert",
    tags: ["dali", "melting clocks", "cybernetic", "desert dreamscape"]
  },
  {
    id: 153,
    category: "sci_fi_surreal_art",
    categoryNameAr: "سريالية الخيال والغرائبيات",
    categoryNameEn: "Sci-Fi Surreal & Biomech",
    titleAr: "هياكل هندسية متداخلة مستحيلة بأسلوب إيشر: سلالم تصعد في جميع الاتجاهات في الفضاء",
    subject: "An M.C. Escher impossible architectural maze of gravitational staircases weaving through an endless starlit void",
    tags: ["escher", "impossible geometry", "staircases", "gravity defying"]
  },
  {
    id: 154,
    category: "sci_fi_surreal_art",
    categoryNameAr: "سريالية الخيال والغرائبيات",
    categoryNameEn: "Sci-Fi Surreal & Biomech",
    titleAr: "حوت فضائي عملاق يتكون جسده بالكامل من مجرات ونجوم سابحة في فراغ أرجواني",
    subject: "A colossal cosmic whale with skin composed of swirling Andromeda spiral galaxies gliding through nebula dust",
    tags: ["cosmic whale", "galaxy skin", "space leviathan", "nebula"]
  },
  {
    id: 155,
    category: "sci_fi_surreal_art",
    categoryNameAr: "سريالية الخيال والغرائبيات",
    categoryNameEn: "Sci-Fi Surreal & Biomech",
    titleAr: "أهرامات من الكروم العاكس تطفو فوق رمال بيضاء لا نهائية تحت سماء زمردية",
    subject: "Mirrored chrome pyramids hovering silently over an endless white gypsum desert beneath an emerald alien sky",
    tags: ["mirrored pyramids", "chrome", "gypsum desert", "emerald sky"]
  },
  {
    id: 156,
    category: "sci_fi_surreal_art",
    categoryNameAr: "سريالية الخيال والغرائبيات",
    categoryNameEn: "Sci-Fi Surreal & Biomech",
    titleAr: "غابة من الأعصاب الحيوية الشفافة المتوهجة بالضوء الكهربائي تنمو داخل تجويف قمر جليدي",
    subject: "A subterranean crystalline nerve forest with translucent dendrites transmitting pulsed electric bioluminescence",
    tags: ["nerve forest", "dendrites", "bioluminescence", "subterranean"]
  },
  {
    id: 157,
    category: "sci_fi_surreal_art",
    categoryNameAr: "سريالية الخيال والغرائبيات",
    categoryNameEn: "Sci-Fi Surreal & Biomech",
    titleAr: "وجه بشري عملاق يتفتت إلى أسراب من طيور الأوريغامي الذهبية التي تطير نحو الشمس",
    subject: "A colossal marble humanoid face gently disintegrating into thousands of golden origami birds soaring into dawn",
    tags: ["disintegration", "origami birds", "monumental face", "surreal metamorphosis"]
  },
  {
    id: 158,
    category: "sci_fi_surreal_art",
    categoryNameAr: "سريالية الخيال والغرائبيات",
    categoryNameEn: "Sci-Fi Surreal & Biomech",
    titleAr: "مدينة زجاجية ميكروسكوبية كاملة مبنية داخل فقاعة صابون تطفو فوق محيط فضي",
    subject: "An intricate utopian glass city encapsulated entirely inside a shimmering soap bubble floating over a liquid mercury sea",
    tags: ["bubble city", "mercury sea", "miniature utopia", "surrealism"]
  },
  {
    id: 159,
    category: "sci_fi_surreal_art",
    categoryNameAr: "سريالية الخيال والغرائبيات",
    categoryNameEn: "Sci-Fi Surreal & Biomech",
    titleAr: "بوابة مرآة في وسط الصحراء تعكس مدينة نيون مستقبلية في زمن آخر",
    subject: "A freestanding baroque gilded mirror standing in sand dunes, its reflection showing a bustling futuristic neon city",
    tags: ["portal mirror", "timeline portal", "sand dunes", "parallel universe"]
  },
  {
    id: 160,
    category: "sci_fi_surreal_art",
    categoryNameAr: "سريالية الخيال والغرائبيات",
    categoryNameEn: "Sci-Fi Surreal & Biomech",
    titleAr: "شجرة بأسلاك حاسوبية تنمو منها أجهزة هواتف وتلفزيونات قديمة كالثمار",
    subject: "A surreal cyber-tree with motherboard bark and branches bearing glowing CRT monitors and vacuum tubes as fruit",
    tags: ["cyber tree", "motherboard", "crt monitors", "retro tech surrealism"]
  },
  {
    id: 161,
    category: "sci_fi_surreal_art",
    categoryNameAr: "سريالية الخيال والغرائبيات",
    categoryNameEn: "Sci-Fi Surreal & Biomech",
    titleAr: "سفينة شراعية تسير على قضبان سكة حديد معلقة في الهواء وسط سحب وردية",
    subject: "A vintage wooden galleon fitted with locomotive wheels riding aerial train tracks suspended in cotton-candy clouds",
    tags: ["sky galleon", "aerial railway", "cotton clouds", "whimsical sci-fi"]
  },
  {
    id: 162,
    category: "sci_fi_surreal_art",
    categoryNameAr: "سريالية الخيال والغرائبيات",
    categoryNameEn: "Sci-Fi Surreal & Biomech",
    titleAr: "محيط من الكريستال السائل بأمواج هندسية جامدة تعكس شموساً متعددة",
    subject: "A frozen polygonal ocean made of iridescent liquid crystal with angular geometry reflecting three crimson suns",
    tags: ["polygonal ocean", "liquid crystal", "angular waves", "geometry"]
  },
  {
    id: 163,
    category: "sci_fi_surreal_art",
    categoryNameAr: "سريالية الخيال والغرائبيات",
    categoryNameEn: "Sci-Fi Surreal & Biomech",
    titleAr: "قناع نحاسي عملاق نصف مدفون في ثلج قطبي وتخرج من فمه ينابيع ساخنة",
    subject: "A colossal brass Venetian mask submerged in arctic ice with thermal steaming waterfalls pouring from its lips",
    tags: ["brass mask", "arctic ice", "thermal waterfalls", "colossal"]
  },
  {
    id: 164,
    category: "sci_fi_surreal_art",
    categoryNameAr: "سريالية الخيال والغرائبيات",
    categoryNameEn: "Sci-Fi Surreal & Biomech",
    titleAr: "رجل برأس مصباح قديم يجلس على مقعد حديقة تحت سماء تمطر أوراقاً موسيقية",
    subject: "A surreal gentleman with an antique glowing filament Edison bulb as his head sitting in rain of fluttering sheet music",
    tags: ["edison bulb head", "sheet music rain", "magritte", "surreal figure"]
  },
  {
    id: 165,
    category: "sci_fi_surreal_art",
    categoryNameAr: "سريالية الخيال والغرائبيات",
    categoryNameEn: "Sci-Fi Surreal & Biomech",
    titleAr: "فركتلات ماندلبروت ثلاثية الأبعاد تتشكل كمدينة ميكانيكية لا نهائية",
    subject: "A hyper-detailed 3D Mandelbrot fractal morphing into an infinite gothic steampunk clockwork megastructure",
    tags: ["3d fractal", "mandelbrot", "clockwork", "steampunk", "infinite"]
  },
  {
    id: 166,
    category: "sci_fi_surreal_art",
    categoryNameAr: "سريالية الخيال والغرائبيات",
    categoryNameEn: "Sci-Fi Surreal & Biomech",
    titleAr: "كواكب صغيرة كروية بحجم التفاح تتدلى من أغصان شجرة زيتون معتمة",
    subject: "A dark olive tree with branches laden with miniature luminous revolving planets and ringed gas giants as fruit",
    tags: ["miniature planets", "olive tree", "cosmic fruit", "surrealism"]
  },
  {
    id: 167,
    category: "sci_fi_surreal_art",
    categoryNameAr: "سريالية الخيال والغرائبيات",
    categoryNameEn: "Sci-Fi Surreal & Biomech",
    titleAr: "قنديل بحر كوني هائل بحجم مدينة يطفو في الغلاف الجوي العلوي مع مجسات من الألياف الضوئية",
    subject: "A kilometer-wide atmospheric space jellyfish pulsing with pink fiber-optic bioluminescence in low Earth orbit",
    tags: ["space jellyfish", "fiber optics", "megafauna", "orbit"]
  },
  {
    id: 168,
    category: "sci_fi_surreal_art",
    categoryNameAr: "سريالية الخيال والغرائبيات",
    categoryNameEn: "Sci-Fi Surreal & Biomech",
    titleAr: "متاهة من الكتب المفتوحة تشكل جسوراً فوق بحر من الحبر الأسود اللامع",
    subject: "An endless labyrinth of giant leather-bound books acting as bridges over an ocean of glossy black ink",
    tags: ["book bridges", "ink ocean", "literary surrealism", "labyrinth"]
  },
  {
    id: 169,
    category: "sci_fi_surreal_art",
    categoryNameAr: "سريالية الخيال والغرائبيات",
    categoryNameEn: "Sci-Fi Surreal & Biomech",
    titleAr: "عقرب آلي ضخم مصنوع من تروس ساعات سويسرية ذهبية وياقوت أحمر",
    subject: "A mechanical titan scorpion constructed entirely of golden Swiss watch gears, balance wheels, and ruby escapements",
    tags: ["horology scorpion", "swiss watch gears", "rubies", "steampunk"]
  },
  {
    id: 170,
    category: "sci_fi_surreal_art",
    categoryNameAr: "سريالية الخيال والغرائبيات",
    categoryNameEn: "Sci-Fi Surreal & Biomech",
    titleAr: "منظر طبيعي لأرضية رقعة شطرنج متموجة كالأمواج وتتلاطم عليها قطع شطرنج رخامية",
    subject: "An undulating black and white checkered landscape rolling like ocean swells with giant chess pieces floating as ships",
    tags: ["chess landscape", "checkerboard", "surreal swells", "dream"]
  },
  {
    id: 171,
    category: "sci_fi_surreal_art",
    categoryNameAr: "سريالية الخيال والغرائبيات",
    categoryNameEn: "Sci-Fi Surreal & Biomech",
    titleAr: "غواصة على شكل صدفة نوتيلوس بيوميكانيكية تضيء قاع هوة ماريانا السحيقة",
    subject: "A biomechanical nautilus submarine with iridescent pearl plating exploring the abyssal trench with cyan spotlights",
    tags: ["nautilus submarine", "biomech", "mariana trench", "cyan light"]
  },
  {
    id: 172,
    category: "sci_fi_surreal_art",
    categoryNameAr: "سريالية الخيال والغرائبيات",
    categoryNameEn: "Sci-Fi Surreal & Biomech",
    titleAr: "قلب بشري ميكانيكي زجاجي شفاف ينبض بضوء أزرق مع تروس ذهبية تدور داخله",
    subject: "A transparent blown-glass anatomical heart with visible ticking gold clockwork gears and luminous blue plasma ventricles",
    tags: ["glass heart", "clockwork ventricles", "plasma", "anatomical"]
  },
  {
    id: 173,
    category: "sci_fi_surreal_art",
    categoryNameAr: "سريالية الخيال والغرائبيات",
    categoryNameEn: "Sci-Fi Surreal & Biomech",
    titleAr: "طاووس فضائي بريش ذيل يتكون من شاشات تلفزيون مجهرية تعرض ذكريات بشرية مختلفة",
    subject: "A cybernetic peacock displaying tail feathers made of thousands of micro-displays playing candid human home videos",
    tags: ["cyber peacock", "micro displays", "memories", "surreal cybernetics"]
  },
  {
    id: 174,
    category: "sci_fi_surreal_art",
    categoryNameAr: "سريالية الخيال والغرائبيات",
    categoryNameEn: "Sci-Fi Surreal & Biomech",
    titleAr: "شاطئ رملي حيث الرمال كلها مصنوعة من بلورات ملح الماس المصغرة والمحيط سائل ذهبي",
    subject: "A desolate beach where the sand consists of microscopic diamond crystals and the calm waves are liquid molten gold",
    tags: ["diamond sand", "molten gold sea", "luxury surrealism", "glimmer"]
  },
  {
    id: 175,
    category: "sci_fi_surreal_art",
    categoryNameAr: "سريالية الخيال والغرائبيات",
    categoryNameEn: "Sci-Fi Surreal & Biomech",
    titleAr: "درج حجري حلزوني يرتفع من صحراء جرداء ولا ينتهي إلا في هالة قمر مكتمل",
    subject: "An unsupported ancient spiral staircase ascending straight from desert bedrock into the cratered face of the full moon",
    tags: ["spiral staircase", "stairway to moon", "bedrock", "mystic surrealism"]
  },
  {
    id: 176,
    category: "sci_fi_surreal_art",
    categoryNameAr: "سريالية الخيال والغرائبيات",
    categoryNameEn: "Sci-Fi Surreal & Biomech",
    titleAr: "فراشة عملاقة بأجنحة من زجاج معشق كاتدرائية ترفرف فوق مدينة مستقبلية",
    subject: "A titanic moth with wings formed from vibrant medieval stained-glass windows fluttering gently over a modern city",
    tags: ["stained-glass moth", "cathedral wings", "cityscape", "ethereal"]
  },
  {
    id: 177,
    category: "sci_fi_surreal_art",
    categoryNameAr: "سريالية الخيال والغرائبيات",
    categoryNameEn: "Sci-Fi Surreal & Biomech",
    titleAr: "غرفة نوم كلاسيكية تغمرها مياه عذبة شفافة تسبح فيها أسماك كوي اليابانية الملونة",
    subject: "A submerged Victorian bedroom with crystal-clear water where vibrant koi fish glide gracefully around an ornate canopy bed",
    tags: ["submerged bedroom", "koi fish", "victorian canopy", "dreamscape"]
  },
  {
    id: 178,
    category: "sci_fi_surreal_art",
    categoryNameAr: "سريالية الخيال والغرائبيات",
    categoryNameEn: "Sci-Fi Surreal & Biomech",
    titleAr: "رائد فضاء يمسك بالوناً على شكل كوكب الأرض وهو يقف على قمر اصطناعي",
    subject: "A melancholy astronaut holding a single glowing balloon resembling Planet Earth while sitting on a lone satellite",
    tags: ["astronaut balloon", "fragile earth", "lonely satellite", "symbolic"]
  },
  {
    id: 179,
    category: "sci_fi_surreal_art",
    categoryNameAr: "سريالية الخيال والغرائبيات",
    categoryNameEn: "Sci-Fi Surreal & Biomech",
    titleAr: "سحابة بيضاء رعدية محبوسة داخل قارورة زجاجية عتيقة موضوعة على طاولة خشبية",
    subject: "A miniature stormy thunderstorm cloud with visible lightning bolts trapped securely inside an antique apothecary jar",
    tags: ["captured storm", "apothecary jar", "lightning in a bottle", "wonder"]
  },
  {
    id: 180,
    category: "sci_fi_surreal_art",
    categoryNameAr: "سريالية الخيال والغرائبيات",
    categoryNameEn: "Sci-Fi Surreal & Biomech",
    titleAr: "وجه سيدة ينقسم إلى طبقات هندسية ثلاثية الأبعاد تكشف عن مصفوفة كونية",
    subject: "A high-fashion portrait of a woman's face segmented along geometric golden ratio planes revealing a star galaxy inside",
    tags: ["geometric face", "cosmic inner", "golden ratio planes", "fashion surrealism"]
  },
  {
    id: 181,
    category: "sci_fi_surreal_art",
    categoryNameAr: "سريالية الخيال والغرائبيات",
    categoryNameEn: "Sci-Fi Surreal & Biomech",
    titleAr: "جسر خشبي قديم يعبر بين طرفي حزام كويكبات فوق كوكب المشتري",
    subject: "A humble weathered rope-and-plank suspension bridge spanning between two floating asteroids in deep space",
    tags: ["rope bridge", "asteroids", "deep space", "poetic juxtaposition"]
  },
  {
    id: 182,
    category: "sci_fi_surreal_art",
    categoryNameAr: "سريالية الخيال والغرائبيات",
    categoryNameEn: "Sci-Fi Surreal & Biomech",
    titleAr: "شجرة بونساي صغيرة تنمو داخل خوذة رائد فضاء مكسورة على سطح القمر",
    subject: "A delicate blossoming cherry bonsai tree flourishing inside a cracked visor astronaut helmet on lunar soil",
    tags: ["bonsai in helmet", "lunar soil", "rebirth", "poetic sci-fi"]
  },
  {
    id: 183,
    category: "sci_fi_surreal_art",
    categoryNameAr: "سريالية الخيال والغرائبيات",
    categoryNameEn: "Sci-Fi Surreal & Biomech",
    titleAr: "سرب من القلوب المضيئة باللون الوردي تطفو كقناديل البحر في غابة خيزران ليلية",
    subject: "Floating anatomical hearts glowing in soft magenta drifting through a quiet midnight bamboo grove like fireflies",
    tags: ["glowing hearts", "bamboo grove", "midnight", "magenta glow"]
  },
  {
    id: 184,
    category: "sci_fi_surreal_art",
    categoryNameAr: "سريالية الخيال والغرائبيات",
    categoryNameEn: "Sci-Fi Surreal & Biomech",
    titleAr: "مدينة مستقبلية كاملة مبنية على ظهر سلحفاة بحرية عملاقة تسبح في سديم فضائي",
    subject: "A hyper-advanced metropolis constructed on the shell of an ancient cosmic sea turtle swimming through nebula dust",
    tags: ["world turtle", "cosmic shell", "nebula swimmer", "mythic sci-fi"]
  },
  {
    id: 185,
    category: "sci_fi_surreal_art",
    categoryNameAr: "سريالية الخيال والغرائبيات",
    categoryNameEn: "Sci-Fi Surreal & Biomech",
    titleAr: "أيدي إنسان عملاقة تخرج من مياه بحيرة هادئة لتحمل قمراً كاملاً بلطف",
    subject: "Two colossal weathered hands emerging from a glass-still mountain lake cradling the glowing full moon",
    tags: ["cradling moon", "colossal hands", "mountain lake", "serene surrealism"]
  },

  // ==========================================
  // 5. CINEMATIC PORTRAITS (186-200)
  // ==========================================
  {
    id: 186,
    category: "cinematic_portraits",
    categoryNameAr: "بورتريهات سينمائية",
    categoryNameEn: "Cinematic Portraits",
    titleAr: "بورتريه سينمائي مقرب لمحقق سايبربانك مسن مع ندوب وضوء نيون أزرق قرمزي على وجهه",
    subject: "Close-up cinematic portrait of a weathered cyberpunk detective with rain running down his scarred face under split neon rim light",
    tags: ["cyberpunk detective", "scarred", "rain on skin", "split lighting"]
  },
  {
    id: 187,
    category: "cinematic_portraits",
    categoryNameAr: "بورتريهات سينمائية",
    categoryNameEn: "Cinematic Portraits",
    titleAr: "غيشا سايبورغ يابانية بوجه من البورسلين المشقق تكشف عن تروس ذهبية ورموز هولوغرافية",
    subject: "A cybernetic geisha with cracked white porcelain skin revealing gold kintsugi circuits and subtle glowing iris displays",
    tags: ["cyber geisha", "kintsugi circuits", "porcelain skin", "holographic iris"]
  },
  {
    id: 188,
    category: "cinematic_portraits",
    categoryNameAr: "بورتريهات سينمائية",
    categoryNameEn: "Cinematic Portraits",
    titleAr: "ملكة الصحراء البدوية بملامح حادة وعينين عسليتين ووشم حناء هندسي وغطاء رأس نيلي",
    subject: "Intense cinematic portrait of a Bedouin queen with striking amber eyes, intricate gold facial jewelry, and deep indigo veil",
    tags: ["bedouin queen", "amber eyes", "gold jewelry", "indigo veil"]
  },
  {
    id: 189,
    category: "cinematic_portraits",
    categoryNameAr: "بورتريهات سينمائية",
    categoryNameEn: "Cinematic Portraits",
    titleAr: "رائد فضاء في لحظة تأمل بعد الهبوط مع انعكاس كوكب الأرض في قناع خوذته الذهبي",
    subject: "Raw emotional portrait of a female astronaut inside her helmet with teardrops floating and Earth reflected in the gold visor",
    tags: ["astronaut portrait", "floating tear", "earth reflection", "gold visor"]
  },
  {
    id: 190,
    category: "cinematic_portraits",
    categoryNameAr: "بورتريهات سينمائية",
    categoryNameEn: "Cinematic Portraits",
    titleAr: "محارب فايكنغ ملتحٍ بشعر فضي وعينين زرقاوين ثاقبتين في عاصفة ثلجية",
    subject: "Grizzled Norse berserker with braided silver beard, frost in his brows, and piercing ice-blue eyes amid falling snow",
    tags: ["viking berserker", "silver beard", "frost", "piercing blue eyes"]
  },
  {
    id: 191,
    category: "cinematic_portraits",
    categoryNameAr: "بورتريهات سينمائية",
    categoryNameEn: "Cinematic Portraits",
    titleAr: "كاهنة شمسية إفريقية بتاج من الذهب الخالص وطلاء وجه أبيض هندسي تحت ضوء الغروب",
    subject: "High-editorial portrait of an African solar priestess with ornate hammered brass headdress, white ochre patterns, and warm rim light",
    tags: ["solar priestess", "hammered brass", "ochre paint", "warm rim light"]
  },
  {
    id: 192,
    category: "cinematic_portraits",
    categoryNameAr: "بورتريهات سينمائية",
    categoryNameEn: "Cinematic Portraits",
    titleAr: "طيارة مقاتلة مستقبلية مبتسمة بثقة داخل خوذة طيران زجاجية عالية التقنية",
    subject: "Intrepid ace fighter pilot with windblown hair and a confident smirk wearing a composite carbon helmet with head-up display",
    tags: ["ace pilot", "carbon helmet", "hud reflection", "confident"]
  },
  {
    id: 193,
    category: "cinematic_portraits",
    categoryNameAr: "بورتريهات سينمائية",
    categoryNameEn: "Cinematic Portraits",
    titleAr: "أندرويد متأمل بشبه تطابق بشري كامل مع خط تقسيم رفيع متوهج على عنقه",
    subject: "Hyperrealistic android thinker in contemplation, micro-pores and freckles visible, with a single hairline luminescent cyan seam on the neck",
    tags: ["hyperrealistic android", "humanoid", "freckles", "cyan seam"]
  },
  {
    id: 194,
    category: "cinematic_portraits",
    categoryNameAr: "بورتريهات سينمائية",
    categoryNameEn: "Cinematic Portraits",
    titleAr: "صياد قديم في ألاسكا بتجاعيد عميقة وعينين مليئتين بالقصص يرتدي سترة جلد الدب",
    subject: "Intimate documentary portrait of an elderly Alaskan hunter with deep weathered skin folds, frosted mustache, and sheepskin parka",
    tags: ["alaskan hunter", "weathered skin", "sheepskin parka", "documentary"]
  },
  {
    id: 195,
    category: "cinematic_portraits",
    categoryNameAr: "بورتريهات سينمائية",
    categoryNameEn: "Cinematic Portraits",
    titleAr: "أميرة إلفية ذات أذنين مدببتين رقيقتين وعينين بنفسجيتين متوهجتين بنعومة وتاج من أغصان الزيتون",
    subject: "Delicate cinematic portrait of an elven princess with soft luminous violet eyes and an intricate platinum leaf circlet",
    tags: ["elven princess", "violet eyes", "platinum circlet", "ethereal beauty"]
  },
  {
    id: 196,
    category: "cinematic_portraits",
    categoryNameAr: "بورتريهات سينمائية",
    categoryNameEn: "Cinematic Portraits",
    titleAr: "عازف جاز أسود يعزف على بوق نحاسي عتيق مع قطرات عرق تتلألأ تحت أضواء المسرح الزرقاء",
    subject: "Soulful close-up portrait of a jazz trumpeter with closed eyes, sweat beads glistening on brow under deep cobalt stage spotlights",
    tags: ["jazz trumpeter", "sweat beads", "brass horn", "cobalt lighting"]
  },
  {
    id: 197,
    category: "cinematic_portraits",
    categoryNameAr: "بورتريهات سينمائية",
    categoryNameEn: "Cinematic Portraits",
    titleAr: "محاربة أمازونية بنظرة تركيز حديدية وقوس وسهم مشدودين في الغابة المطيرة",
    subject: "Dynamic portrait of an Amazonian archer with drawn recurve bow, focused green eyes, and dappled tropical sunlight across cheekbones",
    tags: ["amazonian archer", "drawn bow", "green eyes", "dappled sunlight"]
  },
  {
    id: 198,
    category: "cinematic_portraits",
    categoryNameAr: "بورتريهات سينمائية",
    categoryNameEn: "Cinematic Portraits",
    titleAr: "عالم نباتات فضائي شاب بنظارات واقية مكبرة يبتسم لاكتشاف بذرة نبات متوهجة",
    subject: "A passionate young astrobotanist with steampunk loupe goggles smiling at a rare bioluminescent seed pod held in gloved hands",
    tags: ["astrobotanist", "loupe goggles", "bioluminescent seed", "curiosity"]
  },
  {
    id: 199,
    category: "cinematic_portraits",
    categoryNameAr: "بورتريهات سينمائية",
    categoryNameEn: "Cinematic Portraits",
    titleAr: "أميرة ثلجية سلافية بتاج كوكوشنيك لؤلؤي فاخر وثوب مخملي مطرز بالفضة",
    subject: "Majestic portrait of a Slavic winter queen wearing an elaborate pearl kokoshnik and silver-embroidered crimson velvet robe",
    tags: ["slavic winter queen", "kokoshnik", "pearls", "crimson velvet"]
  },
  {
    id: 200,
    category: "cinematic_portraits",
    categoryNameAr: "بورتريهات سينمائية",
    categoryNameEn: "Cinematic Portraits",
    titleAr: "فيلسوف كوني عتيق بعينين كأنهما سدم فضائية وشعر أبيض كالشهب المتطايرة",
    subject: "Grand master portrait of an ageless cosmic sage whose eyes contain swirling star clusters and long silver hair flowing weightlessly",
    tags: ["cosmic sage", "star cluster eyes", "weightless silver hair", "transcendent"]
  }
];

/**
 * Generates the full Midjourney v6.1 prompt formatted with standard camera, lighting & engine flags
 */
export function formatMidjourneyPrompt(item: CinematicPromptItem, customAspectRatio?: string): string {
  const ar = customAspectRatio || "16:9";
  const base = CINEMATIC_LIBRARY_META.base_prompt.replace(/--ar \d+:\d+/, `--ar ${ar}`);
  return `${item.subject}, ${base}`;
}

/**
 * Generates the clean Flux.1 High-Resolution prompt & parameter configuration
 */
export function formatFluxPrompt(item: CinematicPromptItem, customAspectRatio?: string, customGuidance?: number): {
  prompt: string;
  negative_prompt: string;
  parameters: {
    aspect_ratio: string;
    guidance: number;
    shot_on: string;
  };
} {
  const ar = customAspectRatio || CINEMATIC_LIBRARY_META.flux_overrides.add_fields.aspect_ratio;
  const guidance = customGuidance !== undefined ? customGuidance : CINEMATIC_LIBRARY_META.flux_overrides.add_fields.guidance;

  return {
    prompt: `${item.subject}, ${CINEMATIC_LIBRARY_META.base_prompt_flux_clean}`,
    negative_prompt: CINEMATIC_LIBRARY_META.negative_prompt,
    parameters: {
      aspect_ratio: ar,
      guidance: guidance,
      shot_on: "Hasselblad H6D-100c 85mm f/1.2"
    }
  };
}

/**
 * Returns formatted Flux.1 JSON output string ready for API integration
 */
export function formatFluxJson(item: CinematicPromptItem, customAspectRatio?: string, customGuidance?: number): string {
  const fluxObj = formatFluxPrompt(item, customAspectRatio, customGuidance);
  return JSON.stringify(fluxObj, null, 2);
}
