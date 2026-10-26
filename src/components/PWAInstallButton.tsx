import React, { useState } from 'react';
import { usePWAInstall } from '../utils/usePWAInstall';
import { Download, Smartphone, Share, CheckCircle2, X, MoreVertical, Sparkles } from 'lucide-react';
import { AppLanguage } from '../types';

interface PWAInstallButtonProps {
  onOpenPlayGuide?: () => void;
  lang?: AppLanguage;
  variant?: 'header' | 'hero' | 'compact';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ 
  onOpenPlayGuide,
  lang = 'ar',
  variant = 'header' 
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showAndroidManualGuide, setShowAndroidManualGuide] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  const isAr = lang === 'ar';
  const buttonLabel = isAr ? 'تثبيت التطبيق' : 'Install App';
  const installedLabel = isAr ? 'التطبيق مثبت' : 'App Installed';

  const handleInstallClick = async () => {
    if (isInstallable) {
      try {
        const success = await install();
        if (success) {
          setInstallSuccess(true);
          setTimeout(() => setInstallSuccess(false), 5000);
        }
      } catch (err) {
        console.warn('Install prompt error:', err);
        setShowAndroidManualGuide(true);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // Browser didn't expose deferred prompt (or already prompted / inside browser view)
      setShowAndroidManualGuide(true);
    }
  };

  // If already running in standalone mode (already installed)
  if (isInstalled || installSuccess) {
    if (variant === 'compact') return null;
    return (
      <button
        onClick={onOpenPlayGuide}
        title={isAr ? 'التطبيق مثبت على جهازك | انقر لخيارات النشر' : 'App is installed on your device'}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all shrink-0"
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
        <span className="hidden sm:inline">{installedLabel}</span>
        <span className="sm:hidden">{isAr ? 'مثبت ✓' : 'Installed'}</span>
      </button>
    );
  }

  return (
    <>
      {/* Primary Install Button in Header */}
      <button
        id="pwa-header-install-btn"
        onClick={handleInstallClick}
        className="group relative inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-[#916a24] via-[#c29b40] to-[#b38d35] text-white shadow-sm hover:shadow-md hover:brightness-105 active:scale-95 transition-all shrink-0 cursor-pointer"
        title={isAr ? 'انقر لتثبيت التطبيق مباشرة على الهاتف أو الحاسوب' : 'Install app as PWA on your device'}
      >
        <Download className="w-3.5 h-3.5 text-amber-200 group-hover:translate-y-0.5 transition-transform" />
        <span className="font-sans tracking-tight">{buttonLabel}</span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping hidden xs:inline-block" />
      </button>

      {/* Manual / Browser Menu Guide (when deferred prompt is unavailable or browser requires manual menu action) */}
      {showAndroidManualGuide && (
        <div 
          className="fixed inset-0 z-[130] flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAndroidManualGuide(false);
          }}
        >
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#161513] border border-stone-200 dark:border-stone-800 p-5 shadow-2xl relative text-right rtl">
            <button
              onClick={() => setShowAndroidManualGuide(false)}
              className="absolute top-3.5 left-3.5 p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
              aria-label="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-[#c29b40]/15 text-[#c29b40] flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-stone-900 dark:text-stone-100">
                  {isAr ? 'تثبيت التطبيق على هاتفك' : 'Install App on your device'}
                </h3>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  {isAr ? 'تطبيق ويب تقدمي (PWA) مستقل وسريع' : 'Progressive Web App installation'}
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-300 mb-3 leading-relaxed">
              {isAr 
                ? 'لتثبيت Arabiprompt كـ تطبيق مستقل على شاشة هاتفك الرئيسية بنقرة واحدة:'
                : 'To install Arabiprompt as a standalone app on your home screen:'}
            </p>

            <div className="space-y-2.5 bg-stone-50 dark:bg-stone-900 p-3 rounded-xl border border-stone-200 dark:border-stone-800 text-xs">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#c29b40] text-stone-950 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                <p className="text-stone-700 dark:text-stone-300 leading-snug">
                  {isAr ? (
                    <>اضغط على زر القائمة <strong className="inline-flex items-center font-mono bg-stone-200 dark:bg-stone-800 px-1 py-0.5 rounded text-[11px]">⋮</strong> أعلى يمين أو يسار المتصفح (Chrome أو Edge أو Samsung Internet).</>
                  ) : (
                    <>Tap browser menu <strong className="inline-flex items-center font-mono bg-stone-200 dark:bg-stone-800 px-1 py-0.5 rounded text-[11px]">⋮</strong> at top corner.</>
                  )}
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#c29b40] text-stone-950 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                <p className="text-stone-700 dark:text-stone-300 leading-snug">
                  {isAr ? (
                    <>اختر <strong>"تثبيت التطبيق" (Install app)</strong> أو <strong>"إضافة إلى الشاشة الرئيسية" (Add to Home screen)</strong>.</>
                  ) : (
                    <>Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</>
                  )}
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">✓</span>
                <p className="text-stone-700 dark:text-stone-300 leading-snug">
                  {isAr ? (
                    <>سيعمل التطبيق بملء الشاشة مع أيقونة خاصة وسرعة فائقة بدون أشرطة المتصفح.</>
                  ) : (
                    <>The app will launch in fullscreen standalone mode with its dedicated home icon.</>
                  )}
                </p>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setShowAndroidManualGuide(false)}
                className="flex-1 py-2 rounded-xl bg-[#c29b40] text-stone-950 font-black text-xs hover:bg-[#b38d35] active:scale-98 transition shadow-xs"
              >
                {isAr ? 'حسناً، فهمت' : 'Got it'}
              </button>

              {onOpenPlayGuide && (
                <button
                  onClick={() => {
                    setShowAndroidManualGuide(false);
                    onOpenPlayGuide();
                  }}
                  className="py-2 px-3 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                >
                  {isAr ? 'دليل Google Play' : 'Google Play'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* iOS Safari Guided Install Sheet */}
      {showIOSGuide && (
        <div 
          className="fixed inset-0 z-[130] flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowIOSGuide(false);
          }}
        >
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#161513] border border-stone-200 dark:border-stone-800 p-5 shadow-2xl relative text-right rtl">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-3.5 left-3.5 p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
              aria-label="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-9 h-9 rounded-xl bg-[#c29b40]/15 text-[#c29b40] flex items-center justify-center mb-3">
              <Share className="w-5 h-5" />
            </div>

            <h3 className="text-sm font-black text-stone-900 dark:text-stone-100 mb-1">
              تثبيت Arabiprompt على iPhone / iPad
            </h3>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mb-3 leading-relaxed">
              لتثبيت التطبيق كأيقونة مستقلة على شاشتك الرئيسية في نظام iOS:
            </p>

            <div className="space-y-2 bg-stone-50 dark:bg-stone-900 p-3 rounded-xl border border-stone-200 dark:border-stone-800 text-xs text-stone-700 dark:text-stone-300">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#c29b40] text-stone-950 font-black text-[11px] flex items-center justify-center shrink-0">1</span>
                <span>اضغط زر <strong>المشاركة (Share)</strong> في شريط Safari.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#c29b40] text-stone-950 font-black text-[11px] flex items-center justify-center shrink-0">2</span>
                <span>اختر <strong>إضافة إلى الشاشة الرئيسية (Add to Home Screen)</strong>.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#c29b40] text-stone-950 font-black text-[11px] flex items-center justify-center shrink-0">3</span>
                <span>اضغط <strong>إضافة (Add)</strong> بالأعلى.</span>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-4 w-full py-2 rounded-xl bg-[#c29b40] text-stone-950 font-black text-xs hover:bg-[#b38d35] transition"
            >
              حسناً، فهمت
            </button>
          </div>
        </div>
      )}
    </>
  );
};
