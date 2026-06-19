/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Database, 
  Layers, 
  Download, 
  Terminal, 
  FileText, 
  Copy, 
  Check, 
  HelpCircle, 
  Cpu, 
  CpuIcon,
  Sparkles, 
  Eye, 
  AlertTriangle, 
  Info, 
  ShieldAlert, 
  Sliders, 
  Settings, 
  BookOpen,
  ArrowLeft,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

interface DiffusionDBGuideProps {
  lang: 'ar' | 'en';
  onSendToTester: (promptText: string) => void;
}

export default function DiffusionDBGuide({ lang, onSendToTester }: DiffusionDBGuideProps) {
  const [activePanel, setActivePanel] = useState<'overview' | 'schema' | 'script-generator' | 'insights'>('overview');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  
  // Interactive Script Generator state
  const [downloadStartIndex, setDownloadStartIndex] = useState<number>(1);
  const [downloadEndIndex, setDownloadEndIndex] = useState<number>(5);
  const [isLargeDataset, setIsLargeDataset] = useState<boolean>(false);
  const [shouldUnzip, setShouldUnzip] = useState<boolean>(true);
  const [customOutputDir, setCustomOutputDir] = useState<string>('images/');

  // Interactive Schema active field
  const [activeSchemaField, setActiveSchemaField] = useState<string>('image_name');

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // DiffusionDB stats & facts
  const stats = [
    {
      id: 'stat-total-images',
      titleAr: 'إجمالي الصور المتوفرة',
      titleEn: 'Total Available Images',
      value: '14,000,000',
      subtitleAr: 'أكبر مكتبة صور توليدية حقيقية',
      subtitleEn: 'Largest real generative gallery',
      color: 'from-[#c29b40]/20 to-[#af872e]/5 text-[#c29b40]'
    },
    {
      id: 'stat-unique-prompts',
      titleAr: 'المطالبات الفردية الفريدة',
      titleEn: 'Unique Unique Prompts',
      value: '1,800,000+',
      subtitleAr: 'صياغات هندسية كتبها مستخدمون حقيقيون',
      subtitleEn: 'Real hand-crafted raw prompts',
      color: 'from-amber-500/10 to-transparent text-amber-600 dark:text-amber-500'
    },
    {
      id: 'stat-total-volume',
      titleAr: 'الحجم التخزيني الكلي',
      titleEn: 'Total Dataset Footprint',
      value: '6.5 TB',
      subtitleAr: 'منقسم بالتناسق لسهولة التحميل الجزئي',
      subtitleEn: 'Modular structure for partial download',
      color: 'from-stone-500/10 to-transparent text-stone-600 dark:text-stone-300'
    },
    {
      id: 'stat-metadata-size',
      titleAr: 'بيانات التعريف (Parquet)',
      titleEn: 'Metadata Schema size',
      value: '14,000,052 صف',
      subtitleAr: 'استعلام واستقصاء فوري بدون صور',
      subtitleEn: 'Instant queries without image binaries',
      color: 'from-emerald-500/10 to-transparent text-emerald-600 dark:text-emerald-400'
    }
  ];

  // Schema dictionary definitions
  const schemaFields: Record<string, {
    type: string;
    descAr: string;
    descEn: string;
    adviceAr: string;
    adviceEn: string;
  }> = {
    image_name: {
      type: 'string',
      descAr: 'اسم ملف الصورة المشفر عشوائياً باستخدام UUID الإصدار 4.',
      descEn: 'Randomly encrypted UUID v4 filename of the generated image.',
      adviceAr: 'يمثل المفتاح الأساسي للربط المباشر بين الصورة وبياناتها المرفقة في ملف الـ JSON الملحق بالـ ZIP.',
      adviceEn: 'Represents the primary key for matching the image file with its JSON annotations inside any zip part.'
    },
    prompt: {
      type: 'string',
      descAr: 'نص التوجيه أو الأمر (Prompt) الحقيقي والكامل الذي كتبه المستخدم لإنتاج هذه اللقطة.',
      descEn: 'The full raw prompt text provided by the human user to initiate Stable Diffusion.',
      adviceAr: 'دماغ المحاكاة! استخدم هذا الحقل لتعلم الأنماط، الكلمات الإرشادية، التكرار اللغوي ومقارنتها بمخرج جماليات البكسلات.',
      adviceEn: 'Use this string to study token weighting, modifier effectiveness, or to train prompt expansion utilities.'
    },
    part_id: {
      type: 'uint16',
      descAr: 'معرف المجلد الجزئي أو المجلد الفرعي (part-0xxxxx) الذي تقع ضمنه الصورة.',
      descEn: 'The specific folder catalog ID (part-0xxxxx) containing this image.',
      adviceAr: 'يساعدك في كتابة خوارزميات تحميل سريعة تقوم فقط بسحب الأرشيف المحدد من هجين ملقمات PoloClub دون تحميل البقية.',
      adviceEn: 'Enables downloading selective archives from HuggingFace without loading the entire Multi-terabyte archive.'
    },
    seed: {
      type: 'uint32',
      descAr: 'البذرة العشوائية (Seed) الدقيقة المستعملة لتوجيه الضوضاء الكمية لعملية التوليد.',
      descEn: 'The absolute random seed used by the generator for deterministic noise initialization.',
      adviceAr: 'ثبّت هذه البذرة مع تثبيت المعلمات الفائقة المرافقة لتحصل تاريخياً على بكسلات متماثلة ومستمرة أثناء ترقية النماذج.',
      adviceEn: 'Combine this seed with identical CFG/steps to accurately reproduce identical images across compatible SD runtimes.'
    },
    step: {
      type: 'uint16',
      descAr: 'عدد خطوات إزالة التشويش التدريجية (Denoising steps).',
      descEn: 'The total number of iterative steps executed to subtract noise.',
      adviceAr: 'القيم المثالية تتراوح عادة بين 30 إلى 50 خطوة. تحديد خطوات أعلى نادراً ما يدعم التباين بل يضاعف زمن المعالجة سدى.',
      adviceEn: 'Most images were generated with 50 steps. Useful for researching step-threshold rendering qualities.'
    },
    cfg: {
      type: 'float32',
      descAr: 'مقياس مطابقة النص (CFG Scale) - معلمة التوجيه الإرشادي للالتزام بالأوامر المكتوبة.',
      descEn: 'Classifier-Free Guidance (CFG Scale) measuring constraint tightness to text.',
      adviceAr: 'ارتفاع الـ CFG فوق 12 يولد صوراً متباينة الألوان ومحروقة الحواف. النسبة الذهبية للانتشار المستقر تقع بين 7 و10.',
      adviceEn: 'Values below 5 are blurry, while values above 12 lead to over-saturation. Optimal is roughly 7.0 to 10.0.'
    },
    sampler: {
      type: 'uint8',
      descAr: 'خوارزمية العينات والمؤخذات المعتمدة لإعادة التجميع المتناسق لبنية البكسل.',
      descEn: 'The numerical ID representing the sampler technique configuration.',
      adviceAr: 'القيم المقترنة: {1: "ddim", 2: "plms", 3: "k_euler", 4: "k_euler_ancestral", 5: "k_heun", 6: "k_dpm_2", 7: "k_dpm_2_ancestral", 8: "k_lms", 9: "others"}.',
      adviceEn: 'Sampler mapping: 1 (ddim), 2 (plms), 3 (k_euler), 4 (k_euler_ancestral), 5 (k_heun), 6 (k_dpm_2), 7 (k_dpm_2_ancestral), 8 (k_lms), 9 (others).'
    },
    image_nsfw: {
      type: 'float32',
      descAr: 'احتمالية احتواء ملف الصورة على مشاهد أو تفاصيل غير لائقة بالعمل.',
      descEn: 'Probability score of containing unsafe or explicit visual content.',
      adviceAr: 'تم الفحص بواسطة فلتر الأمان العصبي LAION المتطور. النتيجة (2.0) تعني أن الصورة حُجبت بالكامل وتم تشويشها تاريخياً.',
      adviceEn: 'Calculated using LAION Safety Detector. Values range from 0 to 1. An explicit 2.0 flags blurred system censorship.'
    },
    prompt_nsfw: {
      type: 'float32',
      descAr: 'احتمالية احتواء النص المكتوب على لغة أو تلميحات سامة أو غير مناسبة.',
      descEn: 'Text-based toxicity and adult-content rating generated via Detoxicy.',
      adviceAr: 'تطابق مستويات الكلمات البذيئة والسموم اللفظية. نوصي باستبعاد أي سجلات ترتفع فيها النسبة عن 0.1 لفلترة دقيقة وصافية.',
      adviceEn: 'Generated using Detoxicy library. We suggest setting a prompt filter threshold below 0.1 for clean model pipelines.'
    }
  };

  // Curated templates extracted from DiffusionDB behaviors
  const topInspirations = [
    {
      id: 'insp-1',
      titleAr: 'الأسلوب السائل العاكس',
      titleEn: 'Liquid Metal Organic',
      prompt: 'small liquid sculpture, corvette, gooey, highly reflective, futuristic studio light, ray tracing, 8k, photorealistic',
      notesAr: 'نمط يتميز بتركيز فائق على الانعكاس واللمعان، مستوحى من مطالبات DiffusionDB الناجحة.',
      notesEn: 'High reflection modifier extracted from successful DiffusionDB material prompts.'
    },
    {
      id: 'insp-2',
      titleAr: 'تأثير البوكيه السردي للمجسمات',
      titleEn: 'Macro Bokeh Toy Model',
      prompt: 'miniature detailed cute character in a romantic cozy Italian restaurant, highly detailed, tilt shift, macro portrait, bokeh',
      notesAr: 'يستغل عمق الماكرو والتأطير لإعطاء انطباع اللعبة المصغرة فائقة الجودة.',
      notesEn: 'Leverages macro depth modifiers and tiny toys aesthetics with high score ratings.'
    },
    {
      id: 'insp-3',
      titleAr: 'الصورة المتناظرة الخيالية',
      titleEn: 'Symmetrical Vintage Illustration',
      prompt: 'symmetrical realistic portrait of a wild sci-fi space voyager, concept art by Studio Ghibli, masterpiece, vintage aesthetic',
      notesAr: 'تنسيق متناظر يفرز تكويناً بصرياً متوازناً وجذاباً مستوحى من تصاميم الجرافيك والتوضيح.',
      notesEn: 'Classic centered composition leveraging historical artist modifiers.'
    }
  ];

  // Dynamic code generation for the Python Downloader Script
  const generatePythonDownloadCode = () => {
    const isLarge = isLargeDataset ? 'True' : 'False';
    const folderArgs = isLargeDataset ? 'diffusiondb-large-part-1' : 'images';
    const zipCode = shouldUnzip ? ' -z' : '';
    const outputDir = customOutputDir.trim() || 'images/';
    
    return `# -*- coding: utf-8 -*-
"""
DiffusionDB Downloader Client - Generated via ArabPrompt Studio
Dataset: ${isLargeDataset ? 'DiffusionDB Large (14M, 6.5TB)' : 'DiffusionDB 2M (2M, 1.6TB)'}
Files: part-${String(downloadStartIndex).padStart(6, '0')} to part-${String(downloadEndIndex).padStart(6, '0')}
"""

import os
import subprocess
import urllib.request

def download_diffusion_db():
    start_idx = ${downloadStartIndex}
    end_idx = ${downloadEndIndex}
    is_large = ${isLarge}
    output_directory = "${outputDir}"
    
    # 1. Download official downloader script from PoloClub
    downloader_url = "https://raw.githubusercontent.com/poloclub/diffusiondb/main/download.py"
    script_name = "download.py"
    
    print(f"[*] Downloading helper client from {downloader_url}...")
    urllib.request.urlretrieve(downloader_url, script_name)
    
    # 2. Craft Command line arguments based on your selected range
    large_flag = " -l" if is_large else ""
    unzip_flag = " -z" if ${shouldUnzip ? 'True' : 'False'} else ""
    
    command = f"python {script_name} -i {start_idx} -r {end_idx} -o {output_directory}{large_flag}{unzip_flag}"
    print(f"[*] Ready! Executing local subprocess shell:")
    print(f"    {command}\\n")
    
    try:
        subprocess.run(command, shell=True, check=True)
        print("[+] Sync complete! Files exported successfully to:", output_directory)
    except Exception as e:
        print("[!] Error running downloader:", e)

if __name__ == "__main__":
    download_diffusion_db()`;
  };

  const generateHuggingFaceCode = () => {
    return `from datasets import load_dataset

# Load a micro random subset of 1,000 images and metadata definitions instantly
dataset = load_dataset('poloclub/diffusiondb', 'large_random_1k')

# Take a peek at the first row item from the table
first_item = dataset['train'][0]
print("Image Name:", first_item["image_name"])
print("Prompt String:", first_item["prompt"])
print("CFG Scale Guideline Color:", first_item["cfg"])`;
  };

  const generatePandasCode = () => {
    return `import pandas as pd
from urllib.request import urlretrieve

# Download the metadata Parquet table containing prompt records exclusively
parquet_url = "https://huggingface.co/datasets/poloclub/diffusiondb/resolve/main/metadata.parquet"
local_parquet = "metadata.parquet"

print("[*] Retrieving metadata records stream of 2,000,000 rows...")
urlretrieve(parquet_url, local_parquet)

# Load the column-oriented parquet table instantly using Pandas pandas datatypes
df = pd.read_parquet(local_parquet)
print("[+] Loaded! Dataset shape:", df.shape)

# Query prompts containing specific stylistic modifiers
vintage_art = df[df['prompt'].str.contains('vintage gothic', case=False, na=False)]
print(vintage_art[['image_name', 'prompt', 'cfg']].head(10))`;
  };

  return (
    <div id="diffusion-db-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in font-sans">
      
      {/* Upper Title Section */}
      <div className="border-b border-stone-200 pb-6 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest font-black text-[#c29b40] bg-[#c29b40]/10 px-3 py-1 rounded-full border border-[#c29b40]/20">
            {lang === 'ar' ? 'البحوث والمشروعات المفتوحة' : 'Open-Source AI Dataset Reference'}
          </span>
          <h2 className="text-2xl font-black text-stone-900 mt-2 flex items-center gap-2 dark:text-stone-100">
            <Database className="w-6 h-6 text-[#c29b40]" />
            <span>
              {lang === 'ar' ? 'قاعدة بيانات الانتشار: DiffusionDB' : 'DiffusionDB Reference & Toolkit'}
            </span>
          </h2>
          <p className="text-xs text-stone-500 mt-1 dark:text-stone-400">
            {lang === 'ar' 
              ? 'دليلك الشامل ومُوجّه الأدوات العملي لأول وأولى قواعد البيانات الضخمة التي تحتوي على ١٤ مليون برومبت وصورة مولّدة بالذكاء الاصطناعي.' 
              : 'Interactive developer client, schemas explore, and engineering prompt patterns for the first scale Stable Diffusion text-to-image dataset.'}
          </p>
        </div>

        {/* HuggingFace Link Hook */}
        <a 
          href="https://huggingface.co/datasets/poloclub/diffusiondb" 
          target="_blank" 
          referrerPolicy="no-referrer"
          className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-xs font-bold text-stone-700 transition-all shadow-sm shadow-stone-100 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-300"
        >
          <ExternalLink className="w-4 h-4 text-[#c29b40]" />
          <span>🤗 {lang === 'ar' ? 'مجموعة البيانات في Hugging Face' : 'HF Dataset Hub'}</span>
        </a>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((st) => (
          <div 
            id={st.id} 
            key={st.id}
            className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm dark:bg-stone-900 dark:border-stone-800 overflow-hidden relative group"
          >
            <div className={`absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-gradient-to-tr ${st.color} opacity-40 group-hover:scale-125 transition-all duration-500`} />
            <span className="text-[10px] font-extrabold text-stone-400 block tracking-wide">
              {lang === 'ar' ? st.titleAr : st.titleEn}
            </span>
            <span className="text-2xl font-black text-stone-900 dark:text-stone-100 mt-1 block">
              {st.value}
            </span>
            <span className="text-[10px] text-stone-500 dark:text-stone-400 mt-1 block font-medium">
              {lang === 'ar' ? st.subtitleAr : st.subtitleEn}
            </span>
          </div>
        ))}
      </div>

      {/* Main layout Grid (12 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left column: Menu Panels selection (3 cols) */}
        <div className="lg:col-span-3 flex flex-col gap-2">
          <button
            id="panel-btn-overview"
            onClick={() => setActivePanel('overview')}
            className={`w-full text-right rtl:text-right p-3.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-2.5 ${
              activePanel === 'overview'
                ? 'bg-[#c29b40] text-white border-[#af862e] shadow-md shadow-[#c29b40]/10'
                : 'bg-white text-stone-700 border-stone-200 hover:text-[#c29b40] hover:bg-stone-50 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-300'
            }`}
          >
            <Info className="w-4 h-4 shrink-0" />
            <span>{lang === 'ar' ? 'نظرة عامة والملخص' : 'Dataset Overview'}</span>
          </button>

          <button
            id="panel-btn-schema"
            onClick={() => setActivePanel('schema')}
            className={`w-full text-right rtl:text-right p-3.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-2.5 ${
              activePanel === 'schema'
                ? 'bg-[#c29b40] text-white border-[#af862e] shadow-md shadow-[#c29b40]/10'
                : 'bg-white text-stone-700 border-stone-200 hover:text-[#c29b40] hover:bg-stone-50 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-300'
            }`}
          >
            <Layers className="w-4 h-4 shrink-0" />
            <span>{lang === 'ar' ? 'مخطط وبنية البيانات الوصفية' : 'Columns Schema Dictionary'}</span>
          </button>

          <button
            id="panel-btn-script"
            onClick={() => setActivePanel('script-generator')}
            className={`w-full text-right rtl:text-right p-3.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-2.5 ${
              activePanel === 'script-generator'
                ? 'bg-[#c29b40] text-white border-[#af862e] shadow-md shadow-[#c29b40]/10'
                : 'bg-white text-stone-700 border-stone-200 hover:text-[#c29b40] hover:bg-stone-50 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-300'
            }`}
          >
            <Terminal className="w-4 h-4 shrink-0" />
            <span>{lang === 'ar' ? 'مُولد برامج وأكواد التنزيل' : 'Interactive Python Downloader'}</span>
          </button>

          <button
            id="panel-btn-insights"
            onClick={() => setActivePanel('insights')}
            className={`w-full text-right rtl:text-right p-3.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-2.5 ${
              activePanel === 'insights'
                ? 'bg-[#c29b40] text-white border-[#af862e] shadow-md shadow-[#c29b40]/10'
                : 'bg-white text-stone-700 border-stone-200 hover:text-[#c29b40] hover:bg-stone-50 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-300'
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span>{lang === 'ar' ? 'أنماط ودروس الصياغة' : 'Prompt Engineer Insights'}</span>
          </button>

          <div className="mt-4 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-[10px] leading-relaxed text-amber-700 dark:text-amber-400">
            <ShieldAlert className="w-4 h-4 mb-1 text-amber-500" />
            <span>
              {lang === 'ar' 
                ? 'تنبيه: تحتوي قاعدة البيانات على مطالبات أصلية غير مفلترة من مستخدمين عامين. لتجنب ظهور أي محتوى غير لائق في مشروعاتك، ننصح دائماً بوضع تصفية (Filter) تستبعد الصفوف ذات القيم الأعلى من 0.1 في image_nsfw و prompt_nsfw.'
                : 'Notice: DiffusionDB contains raw uncensored user prompts. Ensure you apply image_nsfw and prompt_nsfw thresholds in your query logic.'}
            </span>
          </div>
        </div>

        {/* Right column: Active Panel displays (9 cols) */}
        <div className="lg:col-span-9 bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs dark:bg-stone-900 dark:border-stone-800">
          
          {/* Panel 1: Overview and summaries */}
          {activePanel === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-stone-850 dark:text-stone-100">
                  {lang === 'ar' ? 'ملخص ووصف مجموعة البيانات' : 'Dataset Background & Context'}
                </h3>
                <p className="text-xs text-stone-500 line-relaxed mt-2 dark:text-stone-400">
                  {lang === 'ar'
                    ? 'الانتشار المستقر (Stable Diffusion) أفرز ثورة خلاقة تمكن متبني التقنية والمهندسين من بناء أعمال مبهرة بعبارات نصية بسيطة. تهدف مجموعة بيانات DiffusionDB المصدرية لسد الفجوة الكبرى بين التفاعل البشري وتنبؤ البكسلات بتأمين ملايين الصياغات والمعلمات الحقيقية لأغراض التدريب والتطوير.'
                    : 'DiffusionDB is the first large-scale text-to-image prompt gallery dataset. It aggregates 14 million images generated by Stable Diffusion together with the precise user-specified text prompts and hyperparameters.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-stone-150 bg-stone-50/50 dark:bg-stone-850 dark:border-stone-800">
                  <h4 className="text-xs font-black text-stone-800 dark:text-stone-200">
                    {lang === 'ar' ? 'مجموعتان جزئيتان لتلبية احتياجاتك' : 'Two Subsets Configs'}
                  </h4>
                  <ul className="text-xs text-stone-500 dark:text-stone-400 space-y-2 mt-2 leading-relaxed">
                    <li>
                      <strong>DiffusionDB 2M:</strong> {lang === 'ar' ? 'مليونان من الصور بصيغة PNG غير المتأثرة وخالية الفجوات وحجمها إجمالي ١.٦ تيرابايت.' : '2 million non-compressed PNG images with full parameter annotation (1.6 TB total size).'}
                    </li>
                    <li>
                      <strong>DiffusionDB Large:</strong> {lang === 'ar' ? 'المجموعة الشاملة وتضم ١٤ مليون صورة مولدة مخرجة بصيغة WebP خفيفة غير المضغوطة وبمجموع ٦.٥ تيرابايت.' : 'Extended corpus of 14 million images stored in lightweight WebP formats (6.5 TB total).'}
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-stone-150 bg-stone-50/50 dark:bg-stone-850 dark:border-stone-800">
                  <h4 className="text-xs font-black text-stone-800 dark:text-stone-200">
                    {lang === 'ar' ? 'الآفاق ومجالات البحث المدعومة' : 'Research Opportunities'}
                  </h4>
                  <ul className="text-xs text-stone-500 dark:text-stone-400 space-y-2 mt-2 leading-relaxed">
                    <li>
                      <strong>{lang === 'ar' ? 'فهم تفاعل المعلمات:' : 'Prompt-model interaction:'}</strong> {lang === 'ar' ? 'دراسة العلاقات المعقدة والتباينات بين الأوامر وخواص العينات.' : 'Evaluating spatial relationships and visual styles associated with specific prompt sequences.'}
                    </li>
                    <li>
                      <strong>{lang === 'ar' ? 'كشف التزييف والخداع:' : 'Deepfake Research:'}</strong> {lang === 'ar' ? 'مكافحة التزييف وتنمية تقييمات تميز البكسلات الاصطناعية.' : 'Benchmark generators validation to evaluate artificial pixels and detect digital visual alterations.'}
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-[#c29b40]/5 rounded-xl border border-[#c29b40]/15 p-4 text-xs text-stone-700 dark:text-stone-300">
                <h4 className="font-extrabold text-stone-900 dark:text-stone-200 flex items-center gap-1.5 mb-1.5">
                  <Sparkles className="w-4 h-4 text-[#c29b40]" />
                  <span>{lang === 'ar' ? 'بُنية الملفات الهجينة والمنقسمة' : 'Modular Modular File Structure'}</span>
                </h4>
                <p className="leading-relaxed">
                  {lang === 'ar'
                    ? 'يتم تجزئة الصور والأرشيف لتسهيل دمجها وتمريرها. يحتوي كل مجلد على ألف صورة متناسقة الأرقام وبجانبها ملف JSON يجمع أسماء هذه الملفات بمعلمات توليدها (التوجيه، البذور، تكرار العينات، خطوات CFG). يطلق على كل ملف JSON اسم المجلد المماثل له مثل part-000001.json.'
                    : 'To make download speeds practical, the dataset is distributed in modular zip archives containing 1,000 images each. Along with the thousand images, a matching JSON manifest catalogs generating attributes (Prompt, Seed, Sampler, steps, CFG) key-value paired.'}
                </p>
              </div>
            </div>
          )}

          {/* Panel 2: Interactive Columns Schema Dictionary */}
          {activePanel === 'schema' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-stone-850 dark:text-stone-100">
                  {lang === 'ar' ? 'معجم وقاموس مخطط البيانات (Parquet & JSON)' : 'Metadata Schema Dictionary'}
                </h3>
                <p className="text-xs text-stone-500 line-relaxed mt-1 dark:text-stone-400">
                  {lang === 'ar'
                    ? 'انقر على أسماء الحقول لعرض شرح العمود، نوعه البرمجي، والتوجيه التقني الأمثل لاستغلاله في كود التصفية الخاص بك.'
                    : 'Select a dataset column field from the index layout to read type specification, parameter constraints, and production-ready querying tips.'}
                </p>
              </div>

              {/* Grid layout schemas */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Fields Index List */}
                <div className="md:col-span-4 flex flex-col gap-1.5">
                  {Object.keys(schemaFields).map((fieldName) => {
                    const isSelected = activeSchemaField === fieldName;
                    const fieldVal = schemaFields[fieldName];
                    return (
                      <button
                        key={fieldName}
                        id={`field-tab-${fieldName}`}
                        onClick={() => setActiveSchemaField(fieldName)}
                        className={`text-right rtl:text-right p-2.5 rounded-lg border text-xs font-mono transition-all flex items-center justify-between pointer-events-auto ${
                          isSelected
                            ? 'bg-[#c29b40]/10 text-[#967123] border-[#c29b40] font-bold'
                            : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200 dark:bg-stone-850 dark:border-stone-800 dark:text-stone-300'
                        }`}
                      >
                        <span>{fieldName}</span>
                        <span className="text-[10px] text-stone-400 shrink-0 font-sans px-1.5 py-0.5 bg-white border border-stone-200 rounded-md dark:bg-stone-900 dark:border-stone-800">
                          {fieldVal.type}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Field Details View */}
                <div className="md:col-span-8 p-6 rounded-2xl border border-stone-200/80 bg-stone-50/50 dark:bg-stone-850 dark:border-stone-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-4">
                      <span className="text-base font-mono font-black text-stone-900 dark:text-stone-100 italic">
                        {activeSchemaField}
                      </span>
                      <span className="text-xs font-bold font-sans text-stone-500 bg-white border border-stone-200 px-3 py-1 rounded-full dark:bg-stone-900 dark:border-stone-800 dark:text-stone-300">
                        {schemaFields[activeSchemaField]?.type}
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider font-extrabold text-stone-400 block mb-1">
                          {lang === 'ar' ? 'الوصف الوظيفي لـ Gemini' : 'Column Objective'}
                        </span>
                        <p className="text-xs text-stone-700 leading-relaxed dark:text-stone-300 font-sans">
                          {lang === 'ar' ? schemaFields[activeSchemaField]?.descAr : schemaFields[activeSchemaField]?.descEn}
                        </p>
                      </div>

                      <div>
                        <span className="text-[9px] uppercase tracking-wider font-extrabold text-stone-400 block mb-1">
                          {lang === 'ar' ? 'إرشاد الاستعلام وتصنيع التصفية' : 'Engineering Implementation Tip'}
                        </span>
                        <p className="text-xs text-[#967123] leading-relaxed font-sans bg-[#c29b40]/5 p-3 rounded-xl border border-[#c29b40]/10">
                          {lang === 'ar' ? schemaFields[activeSchemaField]?.adviceAr : schemaFields[activeSchemaField]?.adviceEn}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-stone-200 text-[10px] text-stone-400 flex items-center gap-1.5 font-sans">
                    <Info className="w-3.5 h-3.5 text-[#c29b40] shrink-0" />
                    <span>
                      {lang === 'ar' 
                        ? 'تُخزّن هذه الأعمدة في جداول Parquet المضغوطة بكفاءة لتمكين التحميل الفوري للأبحاث.' 
                        : 'Schema mapping represents the standardized schema of metadata.parquet and metadata-large.parquet.'}
                    </span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Panel 3: Interactive Downloader & Client script maker */}
          {activePanel === 'script-generator' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-stone-850 dark:text-stone-100">
                  {lang === 'ar' ? 'مصنع كود تحميل وتنزيل الأرشيف التفاعلي' : 'Interactive Python Script Hub'}
                </h3>
                <p className="text-xs text-stone-500 line-relaxed mt-1 dark:text-stone-400">
                  {lang === 'ar'
                    ? 'حدد خصائص المدى والمجلد، وسيجري تشكيل كود Python مخصص للتحميل التلقائي فوراً.'
                    : 'Configure index ranges and properties to produce custom script blocks ready to copy-paste directly to your terminal environment.'}
                </p>
              </div>

              {/* Slider config parameters */}
              <div className="p-5 rounded-2xl border border-stone-200 bg-stone-50/50 dark:bg-stone-850 dark:border-stone-800 space-y-4">
                <span className="text-xs font-black text-stone-800 block mb-2 dark:text-stone-200">
                  {lang === 'ar' ? '١. خصائص ومعايير تحميل الملفات:' : '1. Configure Range Rules:'}
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Range start */}
                  <div>
                    <label className="text-xs font-bold text-stone-600 block mb-1.5">
                      {lang === 'ar' ? `رقم الملف للبدء (البداية Index): ${downloadStartIndex}` : `Start File Index: ${downloadStartIndex}`}
                    </label>
                    <input 
                      id="range-start-slider"
                      type="range" 
                      min={1} 
                      max={isLargeDataset ? 14000 : 2000} 
                      value={downloadStartIndex}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setDownloadStartIndex(val);
                        if (val > downloadEndIndex) {
                          setDownloadEndIndex(val);
                        }
                      }}
                      className="w-full accent-[#c29b40]"
                    />
                  </div>

                  {/* Range end */}
                  <div>
                    <label className="text-xs font-bold text-stone-600 block mb-1.5">
                      {lang === 'ar' ? `رقم الملف النهائي (النهاية Index): ${downloadEndIndex}` : `End File Index: ${downloadEndIndex}`}
                    </label>
                    <input 
                      id="range-end-slider"
                      type="range" 
                      min={downloadStartIndex} 
                      max={isLargeDataset ? 14000 : 2000} 
                      value={downloadEndIndex}
                      onChange={(e) => setDownloadEndIndex(Number(e.target.value))}
                      className="w-full accent-[#c29b40]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-stone-200/60 pt-4">
                  
                  {/* Dataset partition selector */}
                  <div>
                    <span className="text-xs font-bold text-stone-700 block mb-1.5">
                      {lang === 'ar' ? 'فئة قاعدة البيانات الفرعية:' : 'Dataset Sub-Config:'}
                    </span>
                    <div className="flex gap-2">
                      <button
                        id="btn-sub-2m"
                        onClick={() => {
                          setIsLargeDataset(false);
                          if (downloadStartIndex > 2000) setDownloadStartIndex(1);
                          if (downloadEndIndex > 2000) setDownloadEndIndex(5);
                        }}
                        className={`flex-1 py-1.5 px-3 rounded-lg border text-xs font-black transition-all ${
                          !isLargeDataset ? 'bg-[#c29b40] text-white border-[#af862e]' : 'bg-white text-stone-600'
                        }`}
                      >
                        2M
                      </button>
                      <button
                        id="btn-sub-large"
                        onClick={() => setIsLargeDataset(true)}
                        className={`flex-1 py-1.5 px-3 rounded-lg border text-xs font-black transition-all ${
                          isLargeDataset ? 'bg-[#c29b40] text-white border-[#af862e]' : 'bg-white text-stone-600'
                        }`}
                      >
                        Large
                      </button>
                    </div>
                  </div>

                  {/* Toggle unzip options */}
                  <div>
                    <span className="text-xs font-bold text-stone-700 block mb-1.5">
                      {lang === 'ar' ? 'فك ضغط الأرشيف تلقائياً:' : 'Unzip archives:'}
                    </span>
                    <div className="flex gap-2">
                      <button
                        id="btn-unzip-yes"
                        onClick={() => setShouldUnzip(true)}
                        className={`flex-1 py-1.5 px-3 rounded-lg border text-xs font-black transition-all ${
                          shouldUnzip ? 'bg-[#c29b40] text-white border-[#af862e]' : 'bg-white text-stone-600'
                        }`}
                      >
                        {lang === 'ar' ? 'نعم (Unzip)' : 'Yes'}
                      </button>
                      <button
                        id="btn-unzip-no"
                        onClick={() => setShouldUnzip(false)}
                        className={`flex-1 py-1.5 px-3 rounded-lg border text-xs font-black transition-all ${
                          !shouldUnzip ? 'bg-[#c29b40] text-white border-[#af862e]' : 'bg-white text-stone-600'
                        }`}
                      >
                        {lang === 'ar' ? 'لا (Keep .zip)' : 'No'}
                      </button>
                    </div>
                  </div>

                  {/* Custom Out directory */}
                  <div>
                    <span className="text-xs font-bold text-[#443f34] dark:text-[#f4f0e6] block mb-1.5">
                      {lang === 'ar' ? 'مجلد الحفظ المحلي:' : 'Target Save Path:'}
                    </span>
                    <input 
                      id="input-out-dir"
                      type="text" 
                      value={customOutputDir}
                      onChange={(e) => setCustomOutputDir(e.target.value)}
                      placeholder="images/"
                      className="w-full text-xs rounded-lg border border-stone-300 p-1.5 bg-white text-stone-850 focus:ring-1 focus:ring-[#c29b40] focus:outline-none"
                    />
                  </div>

                </div>
              </div>

              {/* Code display boxes grid */}
              <div className="space-y-4">
                
                {/* 1. Custom Python download code client */}
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 dark:bg-stone-850 dark:border-stone-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-stone-800 dark:text-stone-200">
                      {lang === 'ar' ? 'أ) سكريبت التحميل المخصص ( download_client.py ):' : 'a) Generated Custom Loading Client ( download_client.py )'}
                    </span>
                    <button
                      id="btn-copy-py"
                      onClick={() => handleCopy(generatePythonDownloadCode(), 'py-code')}
                      className="px-2.5 py-1 text-[10px] font-bold bg-stone-200 hover:bg-stone-300 rounded-lg flex items-center gap-1 text-stone-700 transition-all cursor-pointer dark:bg-stone-800 dark:text-stone-300"
                    >
                      {copiedText === 'py-code' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedText === 'py-code' ? (lang === 'ar' ? 'تم نسخ الكود' : 'Copied!') : (lang === 'ar' ? 'نسخ سكريبت بايثون' : 'Copy Python Script')}</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-stone-900 border border-stone-800 text-[#ecd197] text-[10px] rounded-xl overflow-x-auto font-mono max-h-56 leading-relaxed">
                    <code>{generatePythonDownloadCode()}</code>
                  </pre>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 2. Hugging Face dataset load */}
                  <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 dark:bg-stone-850 dark:border-stone-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-stone-850 dark:text-stone-200">
                        {lang === 'ar' ? 'ب) تحميل HuggingFace السريع (١٠٠٠ سطر):' : 'b) HuggingFace Quick Load (1k rows)'}
                      </span>
                      <button
                        id="btn-copy-hf"
                        onClick={() => handleCopy(generateHuggingFaceCode(), 'hf-code')}
                        className="px-2 py-0.5 text-[10px] font-bold bg-stone-200 hover:bg-stone-350 rounded-md text-stone-700 cursor-pointer dark:bg-stone-800 dark:text-stone-300"
                      >
                        {copiedText === 'hf-code' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <pre className="p-3 bg-stone-900 border border-stone-850 text-emerald-400 text-[10px] rounded-xl overflow-x-auto font-mono max-h-40 leading-relaxed">
                      <code>{generateHuggingFaceCode()}</code>
                    </pre>
                  </div>

                  {/* 3. Parquet text metadata only using pandas */}
                  <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 dark:bg-stone-850 dark:border-stone-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-stone-850 dark:text-stone-200">
                        {lang === 'ar' ? 'ج) سحب وقراءة البيانات النصية البحتة (Pandas):' : 'c) Load Parquet Metadata with Pandas'}
                      </span>
                      <button
                        id="btn-copy-pd"
                        onClick={() => handleCopy(generatePandasCode(), 'pd-code')}
                        className="px-2 py-0.5 text-[10px] font-bold bg-stone-200 hover:bg-stone-350 rounded-md text-stone-700 cursor-pointer dark:bg-stone-800 dark:text-stone-300"
                      >
                        {copiedText === 'pd-code' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <pre className="p-3 bg-stone-900 border border-stone-850 text-blue-400 text-[10px] rounded-xl overflow-x-auto font-mono max-h-40 leading-relaxed">
                      <code>{generatePandasCode()}</code>
                    </pre>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Panel 4: Prompts Insights & modifiers studies */}
          {activePanel === 'insights' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-stone-850 dark:text-stone-100">
                  {lang === 'ar' ? 'أنماط صياغة الأوامر المستخلصة من ملايين الفحوصات' : 'Scientific Prompt Engineering Lessons'}
                </h3>
                <p className="text-xs text-stone-500 line-relaxed mt-1 dark:text-stone-400">
                  {lang === 'ar'
                    ? 'أثبتت نتائج دراسة DiffusionDB أن بعض الكلمات الدلالية تؤثر جوهرياً على التباين والألوان، بينما تشكل أخرى مجرد تشويش زائد. إليك أكثر الأنماط الفعالة التي يمكنك تجربتها فوراً:'
                    : 'Research on DiffusionDB shows that many user keywords acts as "spells". Select an optimized inspiration below to copy or sandbox load instantly.'}
                </p>
              </div>

              {/* Grid cards for models insights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {topInspirations.map((isp) => (
                  <div 
                    id={isp.id} 
                    key={isp.id} 
                    className="p-5 rounded-2xl border border-stone-200 bg-stone-50/50 hover:border-[#c29b40]/30 transition-all flex flex-col justify-between dark:bg-stone-850 dark:border-stone-800"
                  >
                    <div>
                      <span className="text-[10px] uppercase font-black tracking-wider text-[#9c7524] px-2 py-1 bg-[#c29b40]/10 rounded-lg block w-max">
                        {lang === 'ar' ? isp.titleAr : isp.titleEn}
                      </span>
                      <p className="text-xs text-stone-500 mt-2 italic font-serif leading-relaxed dark:text-stone-400">
                        "{isp.prompt}"
                      </p>
                      <p className="text-[10px] text-stone-400 mt-3 font-sans leading-relaxed">
                        {lang === 'ar' ? isp.notesAr : isp.notesEn}
                      </p>
                    </div>

                    <div className="flex gap-2 mt-4 pt-3 border-t border-stone-200">
                      <button
                        id={`btn-copy-${isp.id}`}
                        onClick={() => handleCopy(isp.prompt, isp.id)}
                        className="flex-1 py-1.5 px-3 font-extrabold text-[10px] bg-stone-200 text-stone-700 rounded-lg text-center cursor-pointer transition-all hover:bg-stone-300 dark:bg-stone-800 dark:text-stone-300"
                      >
                        {copiedText === isp.id ? (lang === 'ar' ? 'تم النسخ' : 'Copied!') : (lang === 'ar' ? 'نسخ اللفظ' : 'Copy Prompt')}
                      </button>
                      <button
                        id={`btn-run-${isp.id}`}
                        onClick={() => onSendToTester(isp.prompt)}
                        className="flex-1 py-1.5 px-3 font-extrabold text-[10px] bg-[#c29b40] text-white rounded-lg text-center cursor-pointer transition-all hover:bg-[#a6802f]"
                      >
                        {lang === 'ar' ? 'تجربة بالمختبر' : 'Test Sandbox'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Research rules list */}
              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3 dark:bg-stone-850 dark:border-stone-800">
                <span className="text-xs font-black text-stone-800 dark:text-stone-200 block">
                  {lang === 'ar' ? 'التوجيهات المستخلصة لترقية وجودة الصياغة البصرية:' : 'General Prompt Optimization Insights:'}
                </span>
                <ul className="text-xs text-stone-600 space-y-2 leading-relaxed list-disc list-inside dark:text-stone-400">
                  <li>
                    <strong>{lang === 'ar' ? 'فصل الكلمات بالفواصل:' : 'Comma separation delimiters:'}</strong> {lang === 'ar' ? 'تستعمل مطالبات Stable Diffusion الفواصل بكثافة لتقديم مرشحات الألوان وأنماط الفنانين المرموقين، مما يعطي كتل تفصيلية واضحة للترسيم.' : 'Many popular prompts construct comma-separated keyword blocks to append art directors, rendering libraries, and focus specifications.'}
                  </li>
                  <li>
                    <strong>{lang === 'ar' ? 'تحيز الحاضنة ديسكورد:' : 'Community Discord bias:'}</strong> {lang === 'ar' ? 'تم جمع هذه البيانات من المستخدمين المبكرين، مما يعني احتوائها على أنماط مصورة ناضجة تعكس استخدام فلاتر وإضافات احترافية لخبراء توليد.' : 'The dataset represents early-adopter creations, heavily tilted towards stylistic illustrations, anime, fantasy characters, and professional portfolios.'}
                  </li>
                  <li>
                    <strong>{lang === 'ar' ? 'عدم قابلية التعميم الكلي:' : 'Generalization borders:'}</strong> {lang === 'ar' ? 'لاحظ أن الأوامر التي تصنع نتائجاً مذهلة في Stable Diffusion قد تختلف قليلاً عند استخدامها في DALL-E 2 أو Midjourney v6 بسبب اختلاف الحلقات الدلالية المسبقة.' : 'An optimization keyword working effectively inside standard Stable Diffusion models might behave slightly differently inside Midjourney or Dall-E.'}
                  </li>
                </ul>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
