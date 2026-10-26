import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, CheckCircle2, X, Sparkles } from 'lucide-react';
import { AppLanguage } from '../types';

interface OfflineIndicatorProps {
  lang?: AppLanguage;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ lang = 'ar' }) => {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [wasOffline, setWasOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setIsDismissed(false);
      if (wasOffline) {
        setShowReconnected(true);
        const timer = setTimeout(() => {
          setShowReconnected(false);
          setWasOffline(false);
        }, 3500);
        return () => clearTimeout(timer);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      setShowReconnected(false);
      setIsDismissed(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  const isAr = lang === 'ar';

  // Back online subtle toast
  if (showReconnected) {
    return (
      <div 
        dir={isAr ? 'rtl' : 'ltr'}
        className="fixed bottom-4 start-4 z-[99] max-w-sm flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-emerald-900/90 text-white shadow-lg border border-emerald-500/30 backdrop-blur-md animate-in slide-in-from-bottom-3 duration-200 text-xs font-semibold"
      >
        <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
          <Wifi className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-emerald-200 text-xs">
            {isAr ? 'تمت استعادة الاتصال بالإنترنت' : 'Back Online'}
          </p>
          <p className="text-[10px] text-emerald-300/80">
            {isAr ? 'تمت مزامنة البيانات والتطبيق يعمل بكامل طاقته' : 'Connection restored and synchronized'}
          </p>
        </div>
      </div>
    );
  }

  // If online, render nothing
  if (isOnline) {
    return null;
  }

  // If user dismissed the full card, keep a tiny discrete floating dot
  if (isDismissed) {
    return (
      <button
        onClick={() => setIsDismissed(false)}
        dir={isAr ? 'rtl' : 'ltr'}
        className="fixed bottom-4 start-4 z-[99] flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-stone-900/90 text-amber-300 border border-amber-500/30 shadow-lg text-[11px] font-bold backdrop-blur-md hover:bg-stone-800 transition cursor-pointer"
        title={isAr ? 'أنت غير متصل بالإنترنت (اضغط للتفاصيل)' : 'Offline mode active (click for details)'}
      >
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
        <WifiOff className="w-3 h-3 text-amber-400" />
        <span>{isAr ? 'وضع عدم الاتصال' : 'Offline'}</span>
      </button>
    );
  }

  // Subtle, non-intrusive notification
  return (
    <div 
      dir={isAr ? 'rtl' : 'ltr'}
      className="fixed bottom-4 start-4 z-[99] max-w-sm w-[calc(100vw-2rem)] sm:w-auto rounded-2xl bg-[#1e1b17]/95 text-stone-200 shadow-2xl border border-amber-500/25 backdrop-blur-md p-3 animate-in slide-in-from-bottom-3 duration-200"
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <WifiOff className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-black text-amber-300 block">
              {isAr ? 'أنت في وضع عدم الاتصال' : 'You are currently offline'}
            </span>
            <span className="text-[10px] text-stone-400">
              {isAr ? 'انقطع الاتصال بشبكة الإنترنت' : 'Internet connection lost'}
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsDismissed(true)}
          className="p-1 rounded-md text-stone-400 hover:text-stone-200 hover:bg-white/10 transition"
          aria-label={isAr ? 'إخفاء الإشعار' : 'Dismiss notice'}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="bg-stone-900/70 rounded-xl p-2.5 border border-stone-800 text-[11px] leading-relaxed text-stone-300 space-y-1">
        <p className="flex items-center gap-1.5 text-stone-200 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-[#c29b40] shrink-0" />
          <span>
            {isAr 
              ? 'لا تقلق! يمكنك الاستمرار في استخدام الميزات المحلية:' 
              : 'Don’t worry! You can still use local features:'}
          </span>
        </p>
        <ul className="list-disc list-inside text-[10px] text-stone-400 space-y-0.5 ps-1">
          <li>{isAr ? 'صياغة وهندسة الأوامر وتنسيقها محلياً' : 'Drafting and formatting prompts locally'}</li>
          <li>{isAr ? 'استعراض قوالب الأوامر ومكتبة المفاهيم الفنية' : 'Browsing prompt templates and visual libraries'}</li>
          <li>{isAr ? 'الوصول إلى سجل الأوامر المحفوظ على جهازك' : 'Accessing your cached prompt history'}</li>
        </ul>
      </div>
    </div>
  );
};

export default OfflineIndicator;
