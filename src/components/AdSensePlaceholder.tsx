/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, ShieldAlert, Crown, ArrowRight, ArrowLeft, Info, RefreshCw, ExternalLink } from 'lucide-react';
import { AppLanguage } from '../types';

export interface AdSensePlaceholderProps {
  client?: string;
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
  responsive?: boolean;
  minHeight?: number | string;
  className?: string;
  showStatusBadge?: boolean;
  lang?: AppLanguage | string;
  fallbackType?: 'sponsor' | 'pro_promo' | 'adblock_notice' | 'auto';
  onOpenCheckout?: () => void;
}

type AdStatus = 'loading' | 'filled' | 'unfilled' | 'blocked';

export default function AdSensePlaceholder({
  client = 'ca-pub-3312377428939400',
  slot = 'auto',
  format = 'auto',
  responsive = true,
  minHeight = 110,
  className = '',
  showStatusBadge = true,
  lang = 'ar',
  fallbackType = 'auto',
  onOpenCheckout
}: AdSensePlaceholderProps) {
  const adRef = useRef<HTMLModElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isPushed = useRef(false);

  const [adStatus, setAdStatus] = useState<AdStatus>('loading');
  const [isAdBlockDetected, setIsAdBlockDetected] = useState(false);

  const isAr = lang === 'ar';
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  const minHeightStyle = typeof minHeight === 'number' ? `${minHeight}px` : minHeight;

  useEffect(() => {
    let timeoutId: any;
    let checkInterval: any;

    const testAdBlocker = () => {
      if (typeof window === 'undefined') return false;
      if ((window as any).isAdBlockActive) {
        setIsAdBlockDetected(true);
        setAdStatus('blocked');
        return true;
      }
      return false;
    };

    const initAdSense = () => {
      if (testAdBlocker()) return;

      if (!isPushed.current && adRef.current) {
        try {
          if (typeof window !== 'undefined') {
            const adsbygoogle = (window as any).adsbygoogle || [];
            adsbygoogle.push({});
            isPushed.current = true;
          }
        } catch (err: any) {
          console.debug('AdSense push caught:', err);
        }
      }

      // Check if the ad fills within 3 seconds
      let attempts = 0;
      checkInterval = setInterval(() => {
        attempts += 1;
        const ins = adRef.current;
        if (ins) {
          const status = ins.getAttribute('data-ad-status');
          const hasIframe = ins.querySelector('iframe') !== null;
          const height = ins.clientHeight;

          if (status === 'filled' || (hasIframe && height > 20)) {
            setAdStatus('filled');
            clearInterval(checkInterval);
            return;
          }

          if (status === 'unfilled') {
            setAdStatus('unfilled');
            clearInterval(checkInterval);
            return;
          }
        }

        if (attempts >= 12) {
          // Timeout elapsed without fill (common in staging preview URL or before approval)
          clearInterval(checkInterval);
          setAdStatus((prev) => (prev === 'loading' ? 'unfilled' : prev));
        }
      }, 250);
    };

    initAdSense();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [client, slot]);

  const handleTriggerUpgrade = () => {
    if (onOpenCheckout) {
      onOpenCheckout();
    }
    try {
      window.dispatchEvent(new CustomEvent('open-checkout', { detail: { plan: 'lite' } }));
    } catch {}
  };

  return (
    <div
      ref={containerRef}
      className={`w-full overflow-hidden my-3 rounded-2xl border transition-all relative ${
        adStatus === 'filled'
          ? 'bg-transparent border-stone-200/60 dark:border-stone-800'
          : 'bg-gradient-to-r from-amber-500/5 via-stone-100/80 to-amber-500/5 dark:from-stone-900/90 dark:via-[#171614] dark:to-stone-900/90 border-amber-500/20 dark:border-stone-800 shadow-2xs'
      } ${className}`}
      style={{ minHeight: minHeightStyle }}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Top Header Tag */}
      {showStatusBadge && (
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-stone-200/50 dark:border-stone-800/60 text-[10px] text-stone-400 select-none">
          <div className="flex items-center gap-1.5">
            <Info className="w-3 h-3 text-[#c29b40]" />
            <span className="font-bold uppercase tracking-wider">
              {adStatus === 'filled'
                ? isAr ? 'إعلان ممول (Google AdSense)' : 'Sponsored Advertisement'
                : isAr ? 'مساحة إعلانية مدعومة' : 'Supported Ad Space'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {adStatus === 'loading' && (
              <span className="flex items-center gap-1 text-[9px] text-amber-500 font-medium">
                <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                <span>{isAr ? 'جاري التحميل...' : 'Loading ad...'}</span>
              </span>
            )}
            {adStatus === 'blocked' && (
              <span className="flex items-center gap-1 text-[9px] text-rose-500 font-bold">
                <ShieldAlert className="w-3 h-3" />
                <span>{isAr ? 'تم رصد حاصب إعلانات' : 'AdBlocker Detected'}</span>
              </span>
            )}
            {adStatus === 'unfilled' && (
              <span className="text-[9px] text-stone-400 font-mono">
                {isAr ? 'عرض بديل مُحسّن' : 'Promotional Fallback'}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="p-2 sm:p-3 flex flex-col items-center justify-center relative w-full" style={{ minHeight: minHeightStyle }}>
        
        {/* Real Google AdSense Tag - Always block display as mandated by Google AdSense */}
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{
            display: 'block',
            minWidth: '250px',
            minHeight: '90px',
            width: '100%'
          }}
          data-ad-client={client}
          data-ad-slot={slot !== 'auto' ? slot : undefined}
          data-ad-format={format}
          data-full-width-responsive={responsive ? 'true' : 'false'}
        />

        {/* Fallback View: Displayed when AdSense is unfilled, blocked, or in sandbox dev */}
        {adStatus !== 'filled' && (
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 text-start p-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#916a24] via-[#c29b40] to-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
                <Crown className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h5 className="text-xs font-black text-stone-900 dark:text-stone-100">
                    {isAr ? 'ترقية فورية إلى ArabPrompt Pro' : 'Upgrade to ArabPrompt Pro'}
                  </h5>
                  <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-emerald-500 text-white">
                    {isAr ? 'فقط $5/شهر' : 'From $5/mo'}
                  </span>
                </div>
                <p className="text-[11px] text-stone-600 dark:text-stone-400 max-w-md">
                  {isAdBlockDetected
                    ? isAr
                      ? 'تم رصد حاصب إعلانات. يمكنك ترقية حسابك لإلغاء الإعلانات بالكامل والاستمتاع بتوليد غير محدود.'
                      : 'AdBlocker detected. Upgrade to Pro for an ad-free experience & unlimited prompts.'
                    : isAr
                      ? 'تجاوز حدود الاستهلاك اليومية واحصل على تصدير سيناريو احترافي وتجربة خالية 100% من الإعلانات.'
                      : 'Unlock unlimited prompt synthesis, cinema exports, and a 100% ad-free workflow.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleTriggerUpgrade}
              className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-bold text-xs transition-colors flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 dark:text-[#916a24]" />
              <span>{isAr ? 'الترقية الآن' : 'Upgrade Now'}</span>
              <Arrow className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
