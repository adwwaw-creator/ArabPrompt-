import React, { useState } from 'react';
import { 
  X, Smartphone, CheckCircle, Download, ExternalLink, Copy, Check, 
  Terminal, ShieldCheck, Sparkles
} from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall';

interface GooglePlayGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GooglePlayGuideModal: React.FC<GooglePlayGuideModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'quick' | 'pwabuilder' | 'bubblewrap' | 'assetlinks'>('quick');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://arabprompt.com';

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const bubblewrapCommand = `npm i -g @bubblewrap/cli
bubblewrap init --manifest="${currentOrigin}/manifest.webmanifest"
bubblewrap build`;

  const assetLinksJson = `[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.arabprompt.app",
      "sha256_cert_fingerprints": [
        "14:6D:E9:7F:0E:52:91:7E:EA:E0:9F:BE:76:A6:E6:71:0B:0E:02:16:43:8E:18:04:15:49:A9:C7:CE:01:23:45"
      ]
    }
  }
]`;

  return (
    <div 
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 backdrop-blur-xs p-2.5 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg my-auto max-h-[90vh] flex flex-col rounded-2xl bg-[#faf9f6] dark:bg-[#161513] border border-stone-300/80 dark:border-stone-800 shadow-2xl overflow-hidden text-right rtl">
        
        {/* Compact Header Bar */}
        <div className="shrink-0 p-3.5 sm:p-4 bg-gradient-to-r from-[#1a1713] via-[#221e18] to-[#141210] text-white border-b border-stone-800">
          <div className="flex items-center justify-between gap-2">
            
            {/* Title & Icon */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-tr from-[#916a24] via-[#c29b40] to-[#ecd197] text-stone-950 flex items-center justify-center shrink-0 shadow-sm">
                <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h2 className="text-sm sm:text-base font-black text-stone-100 truncate">
                    تطبيق Google Play
                  </h2>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
                    جاهز للمتجر ✓
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-stone-400 truncate">
                  حزمة أندرويد جاهزة للنشر والتثبيت الفوري
                </p>
              </div>
            </div>

            {/* Close Button with generous click target */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 active:scale-95 transition shrink-0"
              aria-label="إغلاق النافذة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Micro Readiness Checklist */}
          <div className="flex items-center gap-3 pt-2 mt-2 border-t border-white/10 text-[10px] text-emerald-400 overflow-x-auto no-scrollbar">
            <span className="flex items-center gap-1 shrink-0">
              <CheckCircle className="w-3 h-3" />
              <span>Manifest</span>
            </span>
            <span className="text-stone-600">•</span>
            <span className="flex items-center gap-1 shrink-0">
              <CheckCircle className="w-3 h-3" />
              <span>أيقونات 512px</span>
            </span>
            <span className="text-stone-600">•</span>
            <span className="flex items-center gap-1 shrink-0">
              <CheckCircle className="w-3 h-3" />
              <span>Service Worker</span>
            </span>
            <span className="text-stone-600">•</span>
            <span className="flex items-center gap-1 shrink-0">
              <CheckCircle className="w-3 h-3" />
              <span>AssetLinks</span>
            </span>
          </div>
        </div>

        {/* Compact Navigation Tabs */}
        <div className="shrink-0 flex border-b border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-900/80 p-1 overflow-x-auto no-scrollbar gap-1 text-[11px] font-bold">
          <button
            onClick={() => setActiveTab('quick')}
            className={`px-2.5 py-1.5 rounded-lg transition shrink-0 flex items-center gap-1 ${
              activeTab === 'quick'
                ? 'bg-white dark:bg-stone-800 text-[#916a24] dark:text-amber-400 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>تثبيت فوري</span>
          </button>

          <button
            onClick={() => setActiveTab('pwabuilder')}
            className={`px-2.5 py-1.5 rounded-lg transition shrink-0 flex items-center gap-1 ${
              activeTab === 'pwabuilder'
                ? 'bg-white dark:bg-stone-800 text-[#916a24] dark:text-amber-400 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            <Smartphone className="w-3 h-3" />
            <span>PWABuilder (الأسهل)</span>
          </button>

          <button
            onClick={() => setActiveTab('bubblewrap')}
            className={`px-2.5 py-1.5 rounded-lg transition shrink-0 flex items-center gap-1 ${
              activeTab === 'bubblewrap'
                ? 'bg-white dark:bg-stone-800 text-[#916a24] dark:text-amber-400 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            <Terminal className="w-3 h-3" />
            <span>أداة Bubblewrap</span>
          </button>

          <button
            onClick={() => setActiveTab('assetlinks')}
            className={`px-2.5 py-1.5 rounded-lg transition shrink-0 flex items-center gap-1 ${
              activeTab === 'assetlinks'
                ? 'bg-white dark:bg-stone-800 text-[#916a24] dark:text-amber-400 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            <span>AssetLinks</span>
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 text-stone-700 dark:text-stone-300 text-xs space-y-3">
          
          {/* TAB 1: QUICK INSTALL */}
          {activeTab === 'quick' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-[#c29b40]/25 text-stone-800 dark:text-stone-200">
                <div className="flex items-center gap-1.5 font-bold text-xs mb-1 text-stone-900 dark:text-stone-100">
                  <Sparkles className="w-3.5 h-3.5 text-[#c29b40]" />
                  <span>تثبيت التطبيق على جهازك بنقرة واحدة</span>
                </div>
                <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed mb-2.5">
                  ArabPrompt يعمل كتطبيق كامل بملء الشاشة مع حفظ البيانات بدون الحاجة لتنزيل أي ملف.
                </p>

                {isInstalled ? (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>التطبيق مثبت بالفعل على هذا الجهاز!</span>
                  </div>
                ) : isInstallable ? (
                  <button
                    onClick={install}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-[#916a24] via-[#c29b40] to-[#b38d35] text-white font-bold text-xs shadow-sm hover:brightness-105 active:scale-98 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تثبيت ArabPrompt الآن على هاتفك</span>
                  </button>
                ) : (
                  <div className="text-[11px] text-stone-600 dark:text-stone-400 bg-white dark:bg-stone-900 p-2 rounded-lg border border-stone-200 dark:border-stone-800 leading-relaxed">
                    💡 من متصفح Chrome اضغط على زر القائمة (⋮) ثم اختر <strong>"إضافة إلى الشاشة الرئيسية"</strong>.
                  </div>
                )}
              </div>

              {/* 3 Step Roadmap */}
              <div className="space-y-1.5 pt-1">
                <span className="font-bold text-[11px] text-stone-800 dark:text-stone-200 block">
                  خارطة إطلاق التطبيق على Google Play:
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800">
                    <span className="w-5 h-5 rounded-full bg-[#c29b40] text-stone-950 font-black text-[10px] inline-flex items-center justify-center mb-1">1</span>
                    <p className="font-bold text-stone-900 dark:text-stone-100 text-[11px]">ملف .aab</p>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400">توليده عبر PWABuilder بدقيقة واحدة.</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800">
                    <span className="w-5 h-5 rounded-full bg-[#c29b40] text-stone-950 font-black text-[10px] inline-flex items-center justify-center mb-1">2</span>
                    <p className="font-bold text-stone-900 dark:text-stone-100 text-[11px]">حساب المطور</p>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400">حساب Google Play Console (25$ لمرة واحدة).</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800">
                    <span className="w-5 h-5 rounded-full bg-[#c29b40] text-stone-950 font-black text-[10px] inline-flex items-center justify-center mb-1">3</span>
                    <p className="font-bold text-stone-900 dark:text-stone-100 text-[11px]">النشر والمراجعة</p>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400">رفع الملف والوصف ونشره للمستخدمين.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PWABUILDER */}
          {activeTab === 'pwabuilder' && (
            <div className="space-y-2.5">
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-900 dark:text-blue-300 text-[11px] leading-relaxed">
                <strong>PWABuilder:</strong> الأداة الرسمية الموصى بها من Google لتحويل موقعك إلى حزمة أندرويد <code className="font-mono bg-blue-500/20 px-1 rounded">.aab</code> جاهزة لمتجر Google Play بدون برمجة.
              </div>

              <div className="space-y-2 bg-stone-100 dark:bg-stone-900 p-3 rounded-xl border border-stone-200 dark:border-stone-800 text-[11px]">
                <div>
                  <span className="font-bold text-stone-900 dark:text-stone-100 block mb-1">1. رابط موقعك لفحصه:</span>
                  <div className="flex items-center gap-1.5 bg-white dark:bg-stone-800 p-1.5 rounded-lg font-mono text-[10px] text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                    <span className="truncate flex-1">{currentOrigin}</span>
                    <button
                      onClick={() => copyToClipboard(currentOrigin, 'url')}
                      className="px-2 py-0.5 rounded bg-[#c29b40] text-stone-950 font-sans font-bold flex items-center gap-1 text-[10px] shrink-0"
                    >
                      {copiedText === 'url' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedText === 'url' ? 'تم' : 'نسخ'}</span>
                    </button>
                  </div>
                </div>

                <div className="pt-1">
                  <span className="font-bold text-stone-900 dark:text-stone-100 block mb-0.5">2. اسم الحزمة (Package ID):</span>
                  <code className="inline-block font-mono bg-stone-200 dark:bg-stone-800 px-1.5 py-0.5 rounded text-amber-700 dark:text-amber-400 text-[10px]">
                    com.arabprompt.app
                  </code>
                </div>

                <div className="pt-1">
                  <span className="font-bold text-stone-900 dark:text-stone-100 block mb-0.5">3. تحميل ملف النشر:</span>
                  <p className="text-stone-500 dark:text-stone-400 text-[10px]">اضغط على <strong>Generate Package</strong> لتحميل حزمة Google Play Bundle.</p>
                </div>
              </div>

              <a
                href="https://www.pwabuilder.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#c29b40] text-stone-950 font-bold text-xs hover:bg-[#b38d35] active:scale-98 transition shadow-xs"
              >
                <span>فتح موقع PWABuilder</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* TAB 3: BUBBLEWRAP */}
          {activeTab === 'bubblewrap' && (
            <div className="space-y-2.5 text-[11px]">
              <p className="text-stone-600 dark:text-stone-400">
                أداة سطر الأوامر الرسمية من مهندسي Google Chrome:
              </p>

              <div className="relative bg-stone-950 text-stone-200 p-2.5 rounded-xl font-mono text-[10px] border border-stone-800 ltr text-left">
                <button
                  onClick={() => copyToClipboard(bubblewrapCommand, 'cli')}
                  className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-stone-800 text-stone-300 font-sans text-[10px] flex items-center gap-1"
                >
                  {copiedText === 'cli' ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                  <span>{copiedText === 'cli' ? 'تم' : 'نسخ'}</span>
                </button>
                <pre className="overflow-x-auto whitespace-pre pr-12">{bubblewrapCommand}</pre>
              </div>

              <p className="text-stone-500 dark:text-stone-400 text-[10px]">
                تولد تلقائياً ملف <code className="text-amber-500">app-release-bundle.aab</code> متوافق مع Play Store.
              </p>
            </div>
          )}

          {/* TAB 4: ASSETLINKS */}
          {activeTab === 'assetlinks' && (
            <div className="space-y-2.5 text-[11px]">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-stone-800 dark:text-stone-200 leading-relaxed text-[10px]">
                ملف <code className="font-mono bg-emerald-500/20 px-1 rounded">public/.well-known/assetlinks.json</code> مضاف بالفعل لمشروعك، وهو المسؤول عن فتح التطبيق <strong>بملء الشاشة بدون شريط عنوان المتصفح</strong>.
              </div>

              <div className="relative bg-stone-950 text-emerald-400 p-2.5 rounded-xl font-mono text-[9px] sm:text-[10px] border border-stone-800 ltr text-left max-h-36 overflow-y-auto">
                <button
                  onClick={() => copyToClipboard(assetLinksJson, 'assetlinks')}
                  className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-stone-800 text-stone-300 font-sans text-[10px] flex items-center gap-1"
                >
                  {copiedText === 'assetlinks' ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                  <span>{copiedText === 'assetlinks' ? 'تم' : 'نسخ'}</span>
                </button>
                <pre className="overflow-x-auto whitespace-pre">{assetLinksJson}</pre>
              </div>

              <p className="text-stone-500 dark:text-stone-400 text-[10px]">
                💡 بعد الرفع على Play Console انسخ بصمة SHA-256 من قسم App Integrity والصقها في هذا الملف.
              </p>
            </div>
          )}

        </div>

        {/* Compact Footer */}
        <div className="shrink-0 p-2.5 sm:p-3 bg-stone-100 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex justify-between items-center text-[11px]">
          <span className="text-stone-500 dark:text-stone-400">
            ArabPrompt • جاهز للنشر
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold hover:bg-stone-300 dark:hover:bg-stone-700 active:scale-95 transition"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
