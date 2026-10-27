import React, { useState, useEffect } from 'react';
import {
  X, BookOpen, Smartphone, ShieldCheck, Copy, Check, ExternalLink,
  Sparkles, Terminal, RefreshCw, Zap, CreditCard, Apple, CheckCircle2,
  AlertTriangle, Layers, ArrowRight, Share2, Eye
} from 'lucide-react';
import { AppLanguage } from '../types';

interface BlogKnowledgeHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: AppLanguage;
  initialArticleId?: 'sw-guide' | 'ios-iap' | 'sw-diagnostics';
}

export const BlogKnowledgeHubModal: React.FC<BlogKnowledgeHubModalProps> = ({
  isOpen,
  onClose,
  lang = 'ar',
  initialArticleId = 'ios-iap'
}) => {
  const [activeArticle, setActiveArticle] = useState<'ios-iap' | 'sw-guide' | 'sw-diagnostics'>(initialArticleId);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // SW Live Diagnostics state
  const [swSupported, setSwSupported] = useState<boolean>(false);
  const [swRegistered, setSwRegistered] = useState<boolean>(false);
  const [swState, setSwState] = useState<string>('جاري الفحص...');
  const [swScope, setSwScope] = useState<string>('');
  const [cacheKeys, setCacheKeys] = useState<string[]>([]);
  const [isRefreshingSw, setIsRefreshingSw] = useState<boolean>(false);

  useEffect(() => {
    if (initialArticleId) {
      setActiveArticle(initialArticleId);
    }
  }, [initialArticleId, isOpen]);

  // Inspect client service worker state
  useEffect(() => {
    if (!isOpen) return;

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      setSwSupported(true);
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg) {
          setSwRegistered(true);
          setSwScope(reg.scope);
          if (reg.active) setSwState('نشط ويعمل (Active)');
          else if (reg.installing) setSwState('قيد التثبيت (Installing)');
          else if (reg.waiting) setSwState('في وضع الانتظار (Waiting)');
          else setSwState('مُسجل');
        } else {
          setSwRegistered(false);
          setSwState('غير مسجل حالياً');
        }
      }).catch(() => {
        setSwState('تعذر الفحص');
      });

      if ('caches' in window) {
        caches.keys().then((keys) => {
          setCacheKeys(keys);
        }).catch(() => {});
      }
    } else {
      setSwSupported(false);
      setSwState('غير مدعوم في هذا المتصفح');
    }
  }, [isOpen]);

  const refreshSwStatus = async () => {
    setIsRefreshingSw(true);
    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          await reg.update();
          setSwRegistered(true);
          setSwScope(reg.scope);
          setSwState(reg.active ? 'نشط ومحدّث (Active & Updated)' : 'مُسجل');
        }
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        setCacheKeys(keys);
      }
    } catch (e) {
      console.warn('SW status refresh failed:', e);
    } finally {
      setIsRefreshingSw(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  if (!isOpen) return null;

  // Code snippets from article
  const registerSnippet = `<script>
  if (typeof navigator.serviceWorker !== 'undefined') {
    navigator.serviceWorker.register('sw.js')
      .then(reg => console.log('تم تسجيل عامل الخدمة بنجاح بنطاق:', reg.scope))
      .catch(err => console.error('فشل التسجيل:', err));
  }
</script>`;

  const installSnippet = `const CACHE_NAME = 'my-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/offline.html',
  '/icons/icon-192x192.png'
];

self.addEventListener('install', (event) => {
  // تفعيل التخزين المسبق قبل انتهاء التثبيت
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] جارٍ حفظ الأصول في الكاش المسبق...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});`;

  const activateSnippet = `self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] إزالة الكاش القديم:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      // السيطرة فوراً على جميع النوافذ المفتوحة بدون الحاجة لإعادة التحميل
      return self.clients.claim();
    })
  );
});`;

  const fetchSnippet = `self.addEventListener('fetch', (event) => {
  // تجاهل مسارات الـ API لتظل حية مع الخادم
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // إذا وجد الأصل في الكاش، نرجعه فوراً لسرعة فائقة
      if (cachedResponse) {
        return cachedResponse;
      }
      // إن لم يوجد، نجلبه من الشبكة
      return fetch(event.request).catch(() => {
        // إذا انقطع الإنترنت وكانت الصفحة تنقلاً رئيسياً
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
      });
    })
  );
});`;

  const iosIapSnippet = `// التحقق من دعم Apple Pay أو Payment Request API على نظام iOS
if (window.ApplePaySession && ApplePaySession.canMakePayments()) {
  console.log('Apple Pay متاح على جهاز iOS هذا');
}

// مثال معالجة اشتراك عبر Payment Request API القياسي المتوافق مع iOS Safari & PWA
async function initiatePwaPayment() {
  const supportedInstruments = [{
    supportedMethods: 'https://apple.com/apple-pay',
    data: {
      version: 3,
      merchantIdentifier: 'merchant.com.arabiprompt.app',
      countryCode: 'SA',
      currencyCode: 'USD',
      supportedNetworks: ['visa', 'masterCard', 'mada']
    }
  }];

  const paymentDetails = {
    total: {
      label: 'عرب برومبت - باقة المحترفين PRO',
      amount: { currency: 'USD', value: '19.00' }
    }
  };

  const request = new PaymentRequest(supportedInstruments, paymentDetails);
  const response = await request.show();
  await response.complete('success');
}`;

  return (
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center bg-black/75 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl my-auto max-h-[92vh] flex flex-col rounded-2xl bg-[#faf9f6] dark:bg-[#151412] border border-stone-300 dark:border-stone-800 shadow-2xl overflow-hidden text-right rtl">
        
        {/* Header Bar */}
        <div className="shrink-0 p-4 sm:p-5 bg-gradient-to-r from-[#1c1914] via-[#241f17] to-[#161411] text-white border-b border-stone-800">
          <div className="flex items-center justify-between gap-3">
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#916a24] via-[#c29b40] to-[#ecd197] text-stone-950 flex items-center justify-center shrink-0 shadow-md">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-black text-stone-100 font-sans">
                    مدونة المطورين ودليل الـ PWA
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    مقال تقني جديد ✨
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-0.5">
                  مقالات تخصصية وشروحات معتمدة حول تطبيقات الويب التقدمية ونظام iOS وعمال الخدمة
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-white/10 overflow-x-auto no-scrollbar text-xs">
            <button
              onClick={() => setActiveArticle('ios-iap')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                activeArticle === 'ios-iap'
                  ? 'bg-[#c29b40] text-stone-950 shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Apple className="w-4 h-4" />
              <span>مشتريات iOS (In-App Purchases)</span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-stone-950/20">جديد</span>
            </button>

            <button
              onClick={() => setActiveArticle('sw-guide')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                activeArticle === 'sw-guide'
                  ? 'bg-[#c29b40] text-stone-950 shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>مقدمة عن العاملين (Service Workers)</span>
            </button>

            <button
              onClick={() => setActiveArticle('sw-diagnostics')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                activeArticle === 'sw-diagnostics'
                  ? 'bg-[#c29b40] text-stone-950 shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>فاحص العامل في متصفحك</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 text-stone-800 dark:text-stone-200 space-y-6">

          {/* ARTICLE 1: iOS In-App Purchases */}
          {activeArticle === 'ios-iap' && (
            <div className="space-y-6">
              
              {/* Highlight Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-[#c29b40]/10 to-amber-500/5 border border-[#c29b40]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-[#c29b40] text-stone-950 shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-stone-900 dark:text-stone-100">
                      مقال جديد على المدونة: لن تصدق كيف فعّلنا عمليات الشراء داخل التطبيق لتطبيقات الويب التقدمية على نظام iOS!
                    </h3>
                    <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
                      دليل شامل لتجاوز عوائق الدفع في متصفح Safari وApp Store لتشغيل الاشتراكات الرقمية بسلاسة تامة.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 1: Overview */}
              <div className="space-y-2">
                <h4 className="text-base font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#c29b40]" />
                  <span>ثورة تطبيقات الويب التقدمية (PWA) على أجهزة Apple iOS</span>
                </h4>
                <p className="text-xs sm:text-sm leading-relaxed text-stone-600 dark:text-stone-300">
                  لسنوات طويلة كان تفعيل عمليات الشراء داخل التطبيق (In-App Purchases) يُعد العائق الأكبر أمام مطوري الـ PWA على نظام iOS. مع التحديثات الأخيرة لـ WebKit وSafari ودعم Web Push Notifications، أصبح بإمكانك توفير تجربة دفع متكاملة عبر مسارين رئيسيين:
                </p>
              </div>

              {/* Two Approaches Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Method 1: Web-Native PWA + Apple Pay */}
                <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      خارج متجر App Store (بدون عمولة 30%)
                    </span>
                    <Zap className="w-4 h-4 text-[#c29b40]" />
                  </div>
                  <h5 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                    1. استخدام Payment Request API و Apple Pay
                  </h5>
                  <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                    يستفيد من واجهة <code className="text-[#c29b40] font-mono">PaymentRequest</code> القياسية المدمجة في متصفح Safari. يدعم الدفع بضغطة واحدة باستخدام Face ID أو Touch ID عبر بوابة دفع معتمدة مثل Stripe أو PayTabs.
                  </p>
                  <ul className="text-xs space-y-1 text-stone-600 dark:text-stone-300 list-disc list-inside">
                    <li>لا يتطلب انتظار موافقة أبل على التطبيق.</li>
                    <li>يحتفظ بهامش ربح كامل (رسوم بوابة الدفع العادية فقط 2-3%).</li>
                    <li>يعمل عند تثبيت التطبيق على الشاشة الرئيسية (Standalone PWA).</li>
                  </ul>
                </div>

                {/* Method 2: PWABuilder / StoreKit Packaging */}
                <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                      داخل متجر Apple App Store
                    </span>
                    <Apple className="w-4 h-4 text-stone-700 dark:text-stone-300" />
                  </div>
                  <h5 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                    2. التغليف عبر PWABuilder مع إضافات StoreKit
                  </h5>
                  <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                    تقوم أداة PWABuilder أو Capacitor بتغليف موقع الويب التقدمي في مشروع Xcode أصلي مع مكتبة StoreKit. يتم استدعاء الشراء عبر جسر JavaScript بسيط:
                  </p>
                  <ul className="text-xs space-y-1 text-stone-600 dark:text-stone-300 list-disc list-inside">
                    <li>ظهور رسمي على متجر Apple App Store مع تصنيفات وتقييمات.</li>
                    <li>استخدام رصيد حساب Apple ID وبطاقات iTunes للهدايا.</li>
                    <li>مزامنة الاشتراكات التلقائية مع حساب iCloud للمستخدم.</li>
                  </ul>
                </div>
              </div>

              {/* Code Snippet for iOS Payment Request */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-[#c29b40]" />
                    <span>كود فحص وتنفيذ الدفع على Safari / iOS PWA:</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard(iosIapSnippet, 'ios-snippet')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-200 dark:bg-stone-800 hover:bg-[#c29b40] hover:text-stone-950 text-xs font-bold transition cursor-pointer"
                  >
                    {copiedId === 'ios-snippet' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>تم النسخ</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>نسخ الكود</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="relative rounded-xl overflow-hidden bg-stone-950 text-stone-200 p-3.5 font-mono text-[11px] sm:text-xs leading-relaxed dir-ltr text-left border border-stone-800">
                  <pre className="overflow-x-auto whitespace-pre">
                    <code>{iosIapSnippet}</code>
                  </pre>
                </div>
              </div>

              {/* Summary Checklist */}
              <div className="p-4 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                <h5 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>أهم خطوات النجاح عند تقديم تطبيق PWA يحتوي على مشتريات لأبل:</span>
                </h5>
                <ol className="text-xs space-y-1.5 text-stone-600 dark:text-stone-400 list-decimal list-inside leading-relaxed">
                  <li><strong>استعادة المشتريات (Restore Purchases):</strong> توفير زر واضح لاستعادة المشتريات في واجهة الحساب.</li>
                  <li><strong>شروط الاستخدام وسياسة الخصوصية:</strong> وضع روابط فعالة لشروط خدمة EULA وسياسة الخصوصية داخل شاشة الشراء.</li>
                  <li><strong>دعم العمل دون اتصال (Offline Support):</strong> تمكين المستخدم من الوصول للأصول أو الميزات المشحونة حتى عند انقطاع الإنترنت عبر Service Worker.</li>
                </ol>
              </div>

            </div>
          )}

          {/* ARTICLE 2: Complete Service Workers Guide */}
          {activeArticle === 'sw-guide' && (
            <div className="space-y-6">

              {/* Title Section */}
              <div className="border-b border-stone-200 dark:border-stone-800 pb-4">
                <span className="text-[11px] font-bold text-[#c29b40] uppercase tracking-wider">
                  الدليل التقني المرجعي
                </span>
                <h3 className="text-lg sm:text-xl font-black text-stone-900 dark:text-stone-100 mt-1">
                  مقدمة عن العاملين في مجال الخدمات (Service Workers)
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
                  تعتبر خدمة العمال أحد المكونات الرئيسية لتطبيق الويب التقدمي (PWA)، وهي شرط أساسي لكي يكون تطبيقك قابلاً للتثبيت ويعمل بشكل صحيح دون اتصال بالإنترنت.
                </p>
              </div>

              {/* الملخص */}
              <div className="space-y-2">
                <h4 className="text-sm font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#c29b40]" />
                  <span>ملخص: ما هو عامل الخدمة (Service Worker)؟</span>
                </h4>
                <div className="p-3.5 rounded-xl bg-stone-100/80 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 text-xs sm:text-sm leading-relaxed text-stone-700 dark:text-stone-300">
                  تُعدّ خدمات العامل نوعًا خاصًا من خدمات الويب التي تعمل كـ <strong>وسيط (Proxy)</strong> بين تطبيقك والشبكة. تمرّ جميع الطلبات الواردة إلى تطبيق الويب التقدمي أو الصادرة منه عبر خدمة العامل أولاً. يُمكّن هذا خدمة العامل من معالجة الطلبات في حال انقطاع الشبكة.
                  <br /><br />
                  تعتمد خدمات العامل على الأحداث وتعمل بشكل منفصل عن الخيط الرئيسي (Main UI Thread) لتطبيقك. فبدلاً من حظر واجهة المستخدم، تستمع خدمة العامل إلى الأحداث (مثل حدث <code className="text-[#c29b40] font-mono">fetch</code> على سبيل المثال) وتتعامل معها بشكل غير متزامن تماماً.
                </div>
              </div>

              {/* حالات الاستخدام الشائعة */}
              <div className="space-y-2">
                <h4 className="text-sm font-black text-stone-900 dark:text-stone-100">
                  بعض حالات الاستخدام الشائعة للعاملين في مجال الخدمات:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/60 flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-[#c29b40] flex items-center justify-center shrink-0 text-xs font-bold">
                      1
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-stone-900 dark:text-stone-100">الأصول قبل التخزين المؤقت (Pre-caching)</h5>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">تحميل وحفظ ملفات الـ HTML والـ CSS والـ JS والأيقونات الأساسية أثناء تثبيت التطبيق.</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/60 flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-[#c29b40] flex items-center justify-center shrink-0 text-xs font-bold">
                      2
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-stone-900 dark:text-stone-100">معالجة طلبات الأصول (Fetch Handling)</h5>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">تحديد متى يتم استخدام ذاكرة التخزين المؤقت أو طلب الشبكة الحية والرجوع لصفحة Offline عند الانقطاع.</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/60 flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-[#c29b40] flex items-center justify-center shrink-0 text-xs font-bold">
                      3
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-stone-900 dark:text-stone-100">إشعارات الويب (Push Notifications)</h5>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">معالجة الأحداث المتعلقة بإشعارات الويب، ونقرات الإشعارات وتنبيه المستخدم حتى والتطبيق مغلق.</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/60 flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-[#c29b40] flex items-center justify-center shrink-0 text-xs font-bold">
                      4
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-stone-900 dark:text-stone-100">مزامنة التطبيق في الخلفية (Background Sync)</h5>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">تأجيل إرسال البيانات والطلبات غير الناجحة وإعادة إرسالها تلقائياً بمجرد عودة الاتصال.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* إنشاء العامل ونطاقه */}
              <div className="space-y-3">
                <h4 className="text-sm font-black text-stone-900 dark:text-stone-100">
                  إنشاء عامل الخدمة ونطاق العمل (Scope)
                </h4>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                  لإضافة عامل خدمة إلى مشروعك، قم بإنشاء ملف <code className="text-[#c29b40] font-mono">sw.js</code> في جذر مشروعك (Root). من الناحية الفنية، سيكون عامل الخدمة كافياً لجعل تطبيقك قابلاً للتثبيت وناجحاً في اختبارات PWA Builder.
                </p>
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-stone-800 dark:text-stone-200">
                  <strong>قاعدة النطاق (Scope Rule):</strong> سيكون لعامل الخدمة الموجود في جذر مشروعك (<code className="font-mono">/sw.js</code>) نطاق يشمل تطبيقك بالكامل. إذا وضعته في مجلد فرعي مثل <code className="font-mono">/sub/sw.js</code> فسيقتصر نطاقه على ذلك المجلد فقط.
                </div>
              </div>

              {/* التسجيل Registration Snippet */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                    تسجيل عامل الخدمة في <code className="text-[#c29b40] font-mono">index.html</code> أو نقطة الدخول:
                  </span>
                  <button
                    onClick={() => copyToClipboard(registerSnippet, 'reg-snippet')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-200 dark:bg-stone-800 hover:bg-[#c29b40] hover:text-stone-950 text-xs font-bold transition cursor-pointer"
                  >
                    {copiedId === 'reg-snippet' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>تم النسخ</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>نسخ</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="rounded-xl overflow-hidden bg-stone-950 text-stone-200 p-3.5 font-mono text-[11px] sm:text-xs leading-relaxed dir-ltr text-left border border-stone-800">
                  <pre className="overflow-x-auto whitespace-pre">
                    <code>{registerSnippet}</code>
                  </pre>
                </div>
              </div>

              {/* دورة حياة عامل الخدمة (Lifecycle Events) */}
              <div className="space-y-4 pt-2">
                <h4 className="text-base font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-[#c29b40]" />
                  <span>دورة حياة عامل الخدمة (Lifecycle): المراحل الثلاث الأساسية</span>
                </h4>

                {/* 1. Install Event */}
                <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#c29b40] text-stone-950 font-bold text-xs flex items-center justify-center">
                        1
                      </span>
                      <h5 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                        حدث التثبيت (Install Event) — التخزين المؤقت المسبق
                      </h5>
                    </div>
                    <button
                      onClick={() => copyToClipboard(installSnippet, 'install-snippet')}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-[11px] font-bold text-stone-700 dark:text-stone-300 hover:text-[#c29b40]"
                    >
                      {copiedId === 'install-snippet' ? 'تم النسخ ✓' : 'نسخ الكود'}
                    </button>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-400">
                    يتم إطلاق هذا الحدث أول مرة عند اكتشاف المتصفح لعامل جديد. نستخدم <code className="text-[#c29b40] font-mono">event.waitUntil()</code> لضمان اكتمال تحميل وتخزين الأصول قبل انتهاء التثبيت:
                  </p>
                  <div className="rounded-lg bg-stone-950 text-stone-200 p-3 font-mono text-[11px] dir-ltr text-left border border-stone-800">
                    <pre className="overflow-x-auto whitespace-pre">
                      <code>{installSnippet}</code>
                    </pre>
                  </div>
                </div>

                {/* 2. Activate Event */}
                <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#c29b40] text-stone-950 font-bold text-xs flex items-center justify-center">
                        2
                      </span>
                      <h5 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                        حدث التنشيط (Activate Event) — تنظيف الكاش و clients.claim()
                      </h5>
                    </div>
                    <button
                      onClick={() => copyToClipboard(activateSnippet, 'activate-snippet')}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-[11px] font-bold text-stone-700 dark:text-stone-300 hover:text-[#c29b40]"
                    >
                      {copiedId === 'activate-snippet' ? 'تم النسخ ✓' : 'نسخ الكود'}
                    </button>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-400">
                    يتم استدعاؤه بعد اكتمال التثبيت وعندما لا تكون هناك نسخ قديمة مستخدمة. تُستخدم هذه المرحلة لحذف الـ Caches القديمة وتفعيل السيطرة الفورية باستخدام <code className="text-[#c29b40] font-mono">self.clients.claim()</code> دون انتظار إغلاق المتصفح:
                  </p>
                  <div className="rounded-lg bg-stone-950 text-stone-200 p-3 font-mono text-[11px] dir-ltr text-left border border-stone-800">
                    <pre className="overflow-x-auto whitespace-pre">
                      <code>{activateSnippet}</code>
                    </pre>
                  </div>
                </div>

                {/* 3. Fetch Event */}
                <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#c29b40] text-stone-950 font-bold text-xs flex items-center justify-center">
                        3
                      </span>
                      <h5 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                        حدث الجلب (Fetch Event) — اعتراض الطلبات واستراتيجيات الكاش
                      </h5>
                    </div>
                    <button
                      onClick={() => copyToClipboard(fetchSnippet, 'fetch-snippet')}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-[11px] font-bold text-stone-700 dark:text-stone-300 hover:text-[#c29b40]"
                    >
                      {copiedId === 'fetch-snippet' ? 'تم النسخ ✓' : 'نسخ الكود'}
                    </button>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-400">
                    يعترض كل طلب HTTP صادر عن التطبيق. باستخدام <code className="text-[#c29b40] font-mono">event.respondWith()</code> نقوم بالتحقق من الذاكرة المؤقتة، وإذا لم تكن متوفرة نطلب الشبكة، وفي حال انقطاع النت نعرض صفحة <code className="font-mono text-[#c29b40]">offline.html</code> المخصصة:
                  </p>
                  <div className="rounded-lg bg-stone-950 text-stone-200 p-3 font-mono text-[11px] dir-ltr text-left border border-stone-800">
                    <pre className="overflow-x-auto whitespace-pre">
                      <code>{fetchSnippet}</code>
                    </pre>
                  </div>
                </div>

              </div>

              {/* متطلبات الأمان */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-stone-900 dark:text-stone-100">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>متطلبات الأمان الإلزامية لتشغيل العامل (HTTPS Requirement):</span>
                </div>
                <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
                  نظراً لقدرة عامل الخدمة على اعتراض كافة الطلبات وتعديل الردود، فإن المتصفحات تفرض تشغيله فقط عبر بروتوكول آمن <strong>HTTPS</strong>. يُستثنى من ذلك أثناء التطوير المحلي نطاق <code className="font-mono text-[#c29b40]">localhost</code> أو <code className="font-mono text-[#c29b40]">127.0.0.1</code> لتسهيل الاختبار والبرمجة.
                </p>
              </div>

            </div>
          )}

          {/* TAB 3: Live Service Worker Diagnostics */}
          {activeArticle === 'sw-diagnostics' && (
            <div className="space-y-6">
              
              <div className="border-b border-stone-200 dark:border-stone-800 pb-3">
                <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-[#c29b40]" />
                  <span>فاحص حالة عامل الخدمة الحي في متصفحك (Live Diagnostics)</span>
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  يقوم هذا الفاحص باختبار مباشر لما إذا كان متصفحك الحالي قد سجّل عامل الخدمة وذاكرة التخزين المؤقت للكاش.
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
                  <span className="text-[11px] text-stone-400 block font-medium">دعم المتصفح لعامل الخدمة:</span>
                  <div className="flex items-center gap-2 mt-1">
                    {swSupported ? (
                      <>
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">مدعوم بالكامل (navigator.serviceWorker)</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                        <span className="font-bold text-sm text-rose-600 dark:text-rose-400">غير مدعوم في هذه البيئة</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
                  <span className="text-[11px] text-stone-400 block font-medium">حالة التسجيل والتشغيل:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold text-sm text-stone-900 dark:text-stone-100">{swState}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
                  <span className="text-[11px] text-stone-400 block font-medium">نطاق العامل المسجل (Scope):</span>
                  <div className="mt-1 font-mono text-xs text-stone-700 dark:text-stone-300 truncate dir-ltr text-left">
                    {swScope || 'لا يوجد نطاق مسجل حالياً'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
                  <span className="text-[11px] text-stone-400 block font-medium">حزم الكاش المحفوظة (Caches):</span>
                  <div className="mt-1 font-mono text-xs text-[#c29b40] font-bold">
                    {cacheKeys.length > 0 ? cacheKeys.join(', ') : 'لا يوجد حزم كاش بعد أو جاري الفحص'}
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  onClick={refreshSwStatus}
                  disabled={isRefreshingSw}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#c29b40] text-stone-950 font-bold text-xs hover:bg-[#d4ac4d] transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingSw ? 'animate-spin' : ''}`} />
                  <span>تحديث وفحص عامل الخدمة الآن</span>
                </button>

                <button
                  onClick={() => {
                    if ('serviceWorker' in navigator) {
                      navigator.serviceWorker.register('/sw.js').then(() => refreshSwStatus());
                    }
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold text-xs hover:border-[#c29b40] transition cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-[#c29b40]" />
                  <span>إعادة تسجيل sw.js يدوياً</span>
                </button>
              </div>

              {/* Technical notes */}
              <div className="p-3.5 rounded-xl bg-stone-100 dark:bg-stone-900 text-xs text-stone-600 dark:text-stone-400 space-y-1.5">
                <p className="font-bold text-stone-800 dark:text-stone-200">
                  💡 ملاحظة هامة حول معاينة Google AI Studio المدمجة (iFrame Preview):
                </p>
                <p className="leading-relaxed">
                  تمنع بعض المتصفحات تسجيل عمال الخدمة داخل إطارات الـ iFrame المعزولة لأسباب أمنية. لتجربة تثبيت تطبيق الـ PWA وعامل الخدمة واختبار التخزين دون اتصال بكامل طاقته، قم بنشر التطبيق (Deploy) أو فتحه في نافذة متصفح مستقلة.
                </p>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="shrink-0 p-3 sm:p-4 bg-stone-100 dark:bg-[#12110f] border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
            <span className="font-medium">عرب برومبت — مركز المعرفة والتطوير التقني</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-50 text-stone-800 dark:text-stone-200 font-bold transition cursor-pointer"
            >
              إغلاق النافذة
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
