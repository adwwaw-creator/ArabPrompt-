/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Film, 
  MessageSquare, 
  Lock, 
  Camera, 
  Layers, 
  ArrowRight, 
  Check, 
  Copy, 
  RefreshCw,
  Sliders,
  Award,
  Zap,
  Bookmark
} from 'lucide-react';
import { AppLanguage, MovieProject } from '../types';

export interface TestChecklistItem {
  id: string;
  titleAr: string;
  titleEn: string;
  passed: boolean;
  detailAr: string;
  detailEn: string;
}

export interface TestResultsData {
  score: number;
  durationMs: number;
  isFallback: boolean;
  requestedSceneCount: number;
  actualSceneCount: number;
  totalDurationSeconds: number;
  checklist: TestChecklistItem[];
  summaryAr: string;
  summaryEn: string;
}

export interface StoryScreenplayTesterModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: AppLanguage;
  onLoadProjectToStudio: (project: MovieProject) => void;
  initialConcept?: string;
}

const PRESET_TEST_STORIES = [
  {
    id: 'mystery',
    icon: '🔍',
    titleAr: 'تحقيق وغموض جنائي',
    titleEn: 'Detective Noir Mystery',
    genre: 'غموض وإثارة وتشويق',
    concept: 'محقق جنائي يكتشف أدلة مشفرة داخل خزنة مصرفية قديمة تكشف مؤامرة تزييف كبرى تهدد أمن المدينة.',
    hero: 'المحقق كمال',
    feature: 'معطف داكن، نظرة ثاقبة، لحية خفيفة',
    dialogue: 'انظر إلى هذه الأرقام.. هذه ليست مجرد صدفة بل مسار هروب مخطط له بدقة!'
  },
  {
    id: 'scifi',
    icon: '🪐',
    titleAr: 'خيال علمي ومهمة فضاء',
    titleEn: 'Deep Space Odyssey',
    genre: 'خيال علمي ومستقبلي',
    concept: 'رائدة فضاء في محطة مدارية مهجورة تستقبل إشارة كهرومغناطيسية مجهولة من قاع حفرة جليدية على سطح قمر مجهول.',
    hero: 'الدكتورة ليلى',
    feature: 'بدلة فضاء فضية، خوذة عاكسة، ملامح تركيز عالية',
    dialogue: 'الأجهزة ترصد نبضاً حيوياً تحت الجليد.. علينا النزول لاستكشاف المصدر فوراً!'
  },
  {
    id: 'epic',
    icon: '⚔️',
    titleAr: 'ملحمة تاريخية وفروسية',
    titleEn: 'Historical Heritage Epic',
    genre: 'ملحمي وتاريخي وتراثي',
    concept: 'فارس عربي يقود كتيبة حامية لحماية واحة الرمال الحيوية وقوافل المياه العذبة من هجوم مباغت عند الفجر.',
    hero: 'الفارس طارق',
    feature: 'درع فولاذي تقليدي، عمامة كحلية، سيف عربي أصيل',
    dialogue: 'اثبتوا في مواقعكم واحموا الينابيع.. كرامة هذه الأرض أمانة في أعناقنا اليوم!'
  },
  {
    id: 'nature',
    icon: '🌊',
    titleAr: 'مغامرة وإنقاذ بيئي',
    titleEn: 'Extreme Wilderness Rescue',
    genre: 'مغامرات ووثائقي طبيعة',
    concept: 'فريق استكشاف بيئي يخوض عاصفة عاتية في أعالي جبال السروات لإنقاذ آخر فهد عربي مصاب وتأمين سلامته.',
    hero: 'الخبير فهد',
    feature: 'سترة تسلق خضراء داكنة، نظارة حماية، حبال أمان',
    dialogue: 'تحركوا بحذر شديد.. المنحدر زلق وعلينا الوصول إليه قبل هبوط الضباب الكثيف!'
  }
];

export default function StoryScreenplayTesterModal({
  isOpen,
  onClose,
  lang,
  onLoadProjectToStudio,
  initialConcept = ''
}: StoryScreenplayTesterModalProps) {
  const [testConcept, setTestConcept] = useState(initialConcept || PRESET_TEST_STORIES[0].concept);
  const [testGenre, setTestGenre] = useState(PRESET_TEST_STORIES[0].genre);
  const [testHeroName, setTestHeroName] = useState(PRESET_TEST_STORIES[0].hero);
  const [testHeroFeature, setTestHeroFeature] = useState(PRESET_TEST_STORIES[0].feature);
  const [testCustomDialogue, setTestCustomDialogue] = useState(PRESET_TEST_STORIES[0].dialogue);
  const [testSceneCount, setTestSceneCount] = useState<number>(4);
  const [testModel, setTestModel] = useState('Runway Gen-3 Alpha');
  const [testStyle, setTestStyle] = useState('Cinematic 35mm Film (Arri Alexa)');

  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testResults, setTestResults] = useState<TestResultsData | null>(null);
  const [testedProject, setTestedProject] = useState<MovieProject | null>(null);
  const [elapsedTimer, setElapsedTimer] = useState<number>(0);
  const [copiedPromptIdx, setCopiedPromptIdx] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: typeof PRESET_TEST_STORIES[0]) => {
    setTestConcept(preset.concept);
    setTestGenre(preset.genre);
    setTestHeroName(preset.hero);
    setTestHeroFeature(preset.feature);
    setTestCustomDialogue(preset.dialogue);
  };

  const handleRunGeneratorTest = async () => {
    if (!testConcept.trim()) return;
    setIsRunningTest(true);
    setTestResults(null);
    setTestedProject(null);
    setElapsedTimer(0);

    const timerInterval = setInterval(() => {
      setElapsedTimer(prev => prev + 100);
    }, 100);

    try {
      const response = await fetch('/api/cinema-test-story-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concept: testConcept,
          genre: testGenre,
          visualStyle: testStyle,
          targetAiModel: testModel,
          sceneCount: testSceneCount,
          characterName: testHeroName,
          characterGender: 'ذكر',
          characterAge: '34',
          characterFeature: testHeroFeature,
          customDialogue: testCustomDialogue
        })
      });

      if (!response.ok) throw new Error('Test request failed');
      const data = await response.json();
      if (data.testResults && data.project) {
        setTestResults(data.testResults);
        setTestedProject(data.project);
      }
    } catch (err) {
      console.error('Error running story generator test:', err);
    } finally {
      clearInterval(timerInterval);
      setIsRunningTest(false);
    }
  };

  const handleLoadToStudio = () => {
    if (testedProject) {
      onLoadProjectToStudio(testedProject);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto no-print">
      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-stone-100 flex items-center justify-between bg-stone-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#c29b40] text-stone-950 flex items-center justify-center font-black shadow-md">
              <Zap className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white">
                  {lang === 'ar' ? 'مختبر واختبار مُولد السيناريوهات من القصة' : 'Story-to-Screenplay Generator Diagnostic Lab'}
                </h3>
                <span className="bg-[#c29b40] text-stone-950 text-[10px] font-mono font-black px-1.5 py-0.2 rounded-md">
                  BENCHMARK
                </span>
              </div>
              <p className="text-[11px] text-stone-300">
                {lang === 'ar' 
                  ? 'اختبار شامل ومؤتمت لقياس سرعة التوليد، دقة فصول السيناريو، حوارات الـ 10 ثوانٍ، وثبات ملامح البطل الماستر' 
                  : 'Automated test suite verifying latency, 10s pacing, dialogue lip-sync, and facial consistency.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-stone-50/60">
          
          {/* Preset Benchmark Stories */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-stone-900 flex items-center gap-1.5">
                <Bookmark className="w-4 h-4 text-[#c29b40]" />
                <span>{lang === 'ar' ? 'قصص وسيناريوهات معيارية للاختبار السريع (Benchmark Presets):' : 'Benchmark Test Story Presets:'}</span>
              </span>
              <span className="text-[10px] text-stone-500 font-medium">
                {lang === 'ar' ? 'اختر قصة لاختبارها فوراً' : 'Select to benchmark instantly'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {PRESET_TEST_STORIES.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className={`p-3 rounded-2xl border text-right transition-all cursor-pointer space-y-1.5 flex flex-col justify-between ${
                    testConcept === preset.concept
                      ? 'bg-amber-500/10 border-[#c29b40] shadow-xs'
                      : 'bg-white border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{preset.icon}</span>
                    <span className="text-xs font-bold text-stone-900">{preset.titleAr}</span>
                  </div>
                  <p className="text-[10px] text-stone-500 line-clamp-2 leading-relaxed">
                    {preset.concept}
                  </p>
                  <span className="text-[9px] font-bold text-[#916a24] bg-amber-100/70 px-1.5 py-0.5 rounded self-start">
                    بطل: {preset.hero}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Test Configuration Form */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
              <span className="text-xs font-black text-stone-800 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-[#c29b40]" />
                <span>{lang === 'ar' ? 'إعدادات قصة الاختبار ومحددات النموذج' : 'Test Story & Model Parameters'}</span>
              </span>
              <span className="text-[10px] font-mono text-stone-400">
                AI CINEMA TEST RUNNER
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {lang === 'ar' ? 'فكرة القصة المراد اختبار المولد عليها:' : 'Story Premise under Test:'}
                </label>
                <textarea
                  rows={2}
                  value={testConcept}
                  onChange={(e) => setTestConcept(e.target.value)}
                  placeholder={lang === 'ar' ? 'اكتب أي فكرة أو قصة تريد اختبار التوليد عليها...' : 'Enter story concept...'}
                  className="w-full text-xs rounded-xl border border-stone-300 p-2.5 bg-stone-50 text-stone-900 focus:outline-none focus:border-[#c29b40]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-stone-600 mb-0.5">
                    {lang === 'ar' ? 'التصنيف الدرامي' : 'Genre'}
                  </label>
                  <input
                    type="text"
                    value={testGenre}
                    onChange={(e) => setTestGenre(e.target.value)}
                    className="w-full text-xs rounded-lg border border-stone-300 p-2 bg-stone-50 text-stone-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-600 mb-0.5">
                    {lang === 'ar' ? 'اسم البطل' : 'Character'}
                  </label>
                  <input
                    type="text"
                    value={testHeroName}
                    onChange={(e) => setTestHeroName(e.target.value)}
                    className="w-full text-xs rounded-lg border border-stone-300 p-2 bg-stone-50 text-stone-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-600 mb-0.5">
                    {lang === 'ar' ? 'عدد المشاهد للاختبار (10s)' : 'Scene Count'}
                  </label>
                  <select
                    value={testSceneCount}
                    onChange={(e) => setTestSceneCount(Number(e.target.value))}
                    className="w-full text-xs rounded-lg border border-stone-300 p-2 bg-stone-50 text-stone-800 font-mono"
                  >
                    <option value={3}>3 مشاهد (30 ثانية)</option>
                    <option value={4}>4 مشاهد (40 ثانية) - معيار موصى به</option>
                    <option value={5}>5 مشاهد (50 ثانية)</option>
                    <option value={6}>6 مشاهد (60 ثانية)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-600 mb-0.5">
                  {lang === 'ar' ? 'حوار منطوق مخصص للاختبار (لفحص قدرة المولد على الدمج الديناميكي):' : 'Test Dialogue Line (to verify dynamic lip-sync weaving):'}
                </label>
                <input
                  type="text"
                  value={testCustomDialogue}
                  onChange={(e) => setTestCustomDialogue(e.target.value)}
                  placeholder={lang === 'ar' ? 'اكتب حواراً لاختبار دمجه...' : 'Custom test dialogue line...'}
                  className="w-full text-xs rounded-lg border border-stone-300 p-2 bg-stone-50 text-stone-800"
                />
              </div>
            </div>

            {/* Run Button */}
            <div className="pt-2">
              <button
                type="button"
                disabled={isRunningTest || !testConcept.trim()}
                onClick={handleRunGeneratorTest}
                className={`w-full py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                  isRunningTest || !testConcept.trim()
                    ? 'bg-stone-300 text-stone-500 cursor-not-allowed shadow-none'
                    : 'bg-[#c29b40] hover:bg-[#a6802f] text-stone-950 shadow-[#c29b40]/25 hover:scale-[1.01]'
                }`}
              >
                {isRunningTest ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-stone-950" />
                    <span>
                      {lang === 'ar' 
                        ? `جاري تشغيل الفحص وتوليد السيناريو... (${(elapsedTimer / 1000).toFixed(1)}s)` 
                        : `Running diagnostic benchmark... (${(elapsedTimer / 1000).toFixed(1)}s)`}
                    </span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 text-stone-950 fill-stone-950" />
                    <span>{lang === 'ar' ? '🚀 بدء اختبار التوليد الشامل (Run Generator Test)' : '🚀 Run Generator Benchmark Test'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Test Results & Diagnostic Scorecard */}
          {testResults && (
            <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-sm space-y-5 animate-in fade-in duration-300">
              
              {/* Scorecard Top Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-stone-900 to-stone-850 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-[#c29b40] text-stone-950 flex flex-col items-center justify-center font-black shadow-md">
                    <span className="text-xl leading-none">{testResults.score}</span>
                    <span className="text-[9px] font-mono">%</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-white">
                        {lang === 'ar' ? 'نتيجة الفحص وجودة السيناريو' : 'Cinematic Benchmark Score'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {testResults.score >= 90 ? 'ممتاز (Excellent)' : 'جيد جداً (Good)'}
                      </span>
                    </div>
                    <p className="text-xs text-stone-300 mt-0.5">
                      {testResults.summaryAr}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <div className="text-left bg-stone-800/80 px-3 py-1.5 rounded-xl border border-stone-700">
                    <span className="text-[10px] text-stone-400 block font-mono">LATENCY</span>
                    <span className="text-xs font-black font-mono text-[#f5d996]">
                      {(testResults.durationMs / 1000).toFixed(2)}s
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleLoadToStudio}
                    className="px-4 py-2.5 rounded-xl bg-[#c29b40] hover:bg-[#a6802f] text-stone-950 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                    title={lang === 'ar' ? 'تحميل هذا السيناريو للاستوديو للعمل عليه وتصديره' : 'Load into studio workspace'}
                  >
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    <span>{lang === 'ar' ? 'تحميل السيناريو للاستوديو' : 'Load to Studio'}</span>
                  </button>
                </div>
              </div>

              {/* 6 Automated Verification Checkpoints */}
              <div className="space-y-2">
                <span className="text-xs font-black text-stone-800 block">
                  {lang === 'ar' ? 'معايير الفحص والتحقق المؤتمتة (Diagnostic Checklist):' : 'Automated Diagnostic Checklist:'}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {testResults.checklist.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl border border-stone-200/80 bg-stone-50/50 space-y-1"
                    >
                      <div className="flex items-center gap-2">
                        {item.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                        )}
                        <span className="text-xs font-bold text-stone-900 truncate">
                          {item.titleAr}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600 leading-normal">
                        {item.detailAr}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Preview of Tested Generated Scenes */}
              {testedProject && testedProject.scenes && (
                <div className="space-y-3 pt-3 border-t border-stone-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-stone-800 flex items-center gap-1.5">
                      <Film className="w-4 h-4 text-[#c29b40]" />
                      <span>
                        {lang === 'ar' 
                          ? `معاينة مشاهد السيناريو الناتج (${testedProject.scenes.length} مشاهد × 10 ثوانٍ):` 
                          : `Preview Generated Scenes (${testedProject.scenes.length} × 10s):`}
                      </span>
                    </span>

                    <button
                      type="button"
                      onClick={handleLoadToStudio}
                      className="text-xs font-bold text-[#916a24] hover:text-[#78551b] flex items-center gap-1 cursor-pointer"
                    >
                      <span>{lang === 'ar' ? 'اعتماد وتحميل السيناريو بالكامل' : 'Accept & Load Full Screenplay'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {testedProject.scenes.map((scene, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-white border border-stone-200 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="bg-[#c29b40] text-stone-950 font-bold px-2 py-0.5 rounded text-[10px]">
                              مشهد {scene.sceneNumber || idx + 1}
                            </span>
                            <span className="font-mono text-stone-500 text-[10px]">
                              ⏱️ {scene.timeRange} (10s)
                            </span>
                            {scene.actLabelAr && (
                              <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded text-[10px]">
                                {scene.actLabelAr}
                              </span>
                            )}
                          </div>
                          <span className="text-stone-700 font-bold text-[11px]">
                            {scene.titleAr}
                          </span>
                        </div>

                        <p className="text-stone-700 text-xs font-serif">
                          {scene.screenplayBeatAr || scene.dramaticActionAr}
                        </p>

                        {scene.dialogueAr && (
                          <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-200/60 text-xs">
                            <span className="font-bold text-[#916a24]">
                              💬 {scene.dialogueSpeaker || 'البطل'} ({scene.dialogueEmotion || 'حازم'}):
                            </span>
                            <span className="text-stone-900 font-serif font-black mr-1">
                              "{scene.dialogueAr}"
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-100">
                          <span className="text-[10px] text-stone-500 font-mono truncate max-w-md">
                            Prompt: {scene.videoPromptEn?.slice(0, 90)}...
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(scene.videoPromptEn);
                              setCopiedPromptIdx(idx);
                              setTimeout(() => setCopiedPromptIdx(null), 2000);
                            }}
                            className="p-1 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all cursor-pointer flex items-center gap-1 text-[10px]"
                          >
                            {copiedPromptIdx === idx ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedPromptIdx === idx ? 'تم النسخ' : 'نسخ'}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-stone-100 bg-stone-50 flex items-center justify-between text-xs">
          <div className="text-stone-500 font-medium">
            {lang === 'ar' 
              ? '💡 يتيح لك هذا المختبر اختبار دقة خوارزمية التوليد ومطابقتها لمعايير الـ 10 ثوانٍ السينمائية قبل الإنتاج' 
              : '💡 Test the generation pipeline compliance with strict 10-second scene pacing before final render'}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold transition-all cursor-pointer"
            >
              {lang === 'ar' ? 'إغلاق' : 'Close'}
            </button>
            {testedProject && (
              <button
                type="button"
                onClick={handleLoadToStudio}
                className="px-4 py-2 rounded-xl bg-[#c29b40] hover:bg-[#a6802f] text-stone-950 font-black transition-all cursor-pointer"
              >
                {lang === 'ar' ? 'تحميل إلى الاستوديو' : 'Load to Studio'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
