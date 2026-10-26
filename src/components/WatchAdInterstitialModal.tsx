/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Sparkles, 
  Play, 
  Check, 
  Heart, 
  Film, 
  Clock, 
  Crown, 
  ExternalLink,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLanguage } from '../types';
import { showToast } from './ToastNotification';
import AdSenseBanner from './AdSenseBanner';

export interface WatchAdInterstitialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardUnlocked: () => void;
  lang: AppLanguage;
  rewardType?: 'skip_wait' | 'unlock_scenario' | 'fast_track';
  title?: string;
  description?: string;
  scenarioName?: string;
  client?: string;
}

export default function WatchAdInterstitialModal({
  isOpen,
  onClose,
  onRewardUnlocked,
  lang,
  rewardType = 'skip_wait',
  title,
  description,
  scenarioName,
  client = 'ca-pub-3312377428939400'
}: WatchAdInterstitialModalProps) {
  const isAr = lang === 'ar';
  const COUNTDOWN_SECONDS = 5;
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [canSkip, setCanSkip] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);

  // Reset timer on open
  useEffect(() => {
    if (!isOpen) {
      setCountdown(COUNTDOWN_SECONDS);
      setCanSkip(false);
      setHasClaimed(false);
      return;
    }

    setCountdown(COUNTDOWN_SECONDS);
    setCanSkip(false);
    setHasClaimed(false);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanSkip(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClaimReward = () => {
    if (hasClaimed) return;
    setHasClaimed(true);

    showToast(
      isAr 
        ? '🎉 شكراً لدعمك الكريم! تم تأكيد المشاهدة وفتح الميزة بنجاح.' 
        : '🎉 Thank you for your support! Reward unlocked successfully.'
    );

    onRewardUnlocked();
    onClose();
  };

  const defaultTitle = isAr
    ? (rewardType === 'unlock_scenario'
        ? `فتح السيناريو الأسطوري: ${scenarioName || 'المميز'}`
        : 'تخطي وقت الانتظار ودعم منصة عرب برومبت')
    : (rewardType === 'unlock_scenario'
        ? `Unlock Legendary Scenario: ${scenarioName || 'Premium'}`
        : 'Watch Ad to Skip Wait & Support ArabPrompt');

  const defaultDesc = isAr
    ? 'منصة ArabPrompt مجانية 100%. من خلال مشاهدة هذا الإعلان القصير، فإنك تساهم بشكل مباشر في تغطية تكاليف الخوادم ونماذج الذكاء الاصطناعي (Gemini)، وفي المقابل تتخطى الانتظار فورياً وتفتح المزايا السينمائية الممتازة.'
    : 'ArabPrompt is 100% free. By viewing this short sponsored ad, you directly support our servers and AI models, and in return bypass wait times and unlock premium scenarios.';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-stone-900 border border-[#c29b40]/60 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-stone-100"
        onClick={(e) => e.stopPropagation()}
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-stone-950 via-stone-900 to-amber-950/40 border-b border-[#c29b40]/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#c29b40] to-amber-600 flex items-center justify-center text-stone-950 shadow-md shrink-0">
              {rewardType === 'unlock_scenario' ? (
                <Film className="w-5 h-5 stroke-[2.2]" />
              ) : (
                <Zap className="w-5 h-5 stroke-[2.2]" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white">
                  {title || defaultTitle}
                </h3>
                <span className="bg-[#c29b40] text-stone-950 text-[10px] font-mono font-black px-2 py-0.5 rounded-full">
                  {rewardType === 'unlock_scenario' ? (isAr ? 'فتح أسطورة' : 'UNLOCK') : (isAr ? 'تخطي فوري' : 'SKIP AD')}
                </span>
              </div>
              <p className="text-[11px] text-amber-200/80 mt-0.5">
                {isAr ? 'دعم مجاني للمنصة عبر مشاهدة الإعلان' : 'Free platform support via ad viewing'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer border border-stone-700"
            title={isAr ? 'إغلاق' : 'Close'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">
          
          {/* Supportive Thank You Card */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-[#c29b40]/40 flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-[#c29b40]/20 text-[#f5d996] flex items-center justify-center shrink-0 mt-0.5">
              <Heart className="w-4 h-4 text-rose-400 fill-rose-400 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h5 className="text-xs font-black text-[#f5d996] flex items-center gap-1.5">
                <span>{isAr ? 'شكراً لدعمك استمرار ArabPrompt مجاناً ❤️' : 'Thank you for keeping ArabPrompt free ❤️'}</span>
              </h5>
              <p className="text-[11px] text-stone-300 leading-relaxed font-medium">
                {description || defaultDesc}
              </p>
            </div>
          </div>

          {/* Interstitial AdSense Banner Space */}
          <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800 text-center space-y-2">
            <div className="flex items-center justify-between text-[10px] text-stone-400 px-1 border-b border-stone-850 pb-1.5">
              <span className="font-bold flex items-center gap-1 text-[#c29b40]">
                <span>📢</span>
                <span>{isAr ? 'إشهار معتمد من Google AdSense' : 'Google AdSense Sponsor'}</span>
              </span>
              <span className="font-mono text-stone-500">ID: {client}</span>
            </div>

            {/* Live Google AdSense Banner */}
            <div className="w-full flex items-center justify-center min-h-[140px] bg-stone-900/60 rounded-xl overflow-hidden">
              <AdSenseBanner
                client={client}
                lang={lang}
                showPlaceholderBadge={false}
                minHeight={130}
              />
            </div>
          </div>

          {/* Countdown & Timer Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[11px] font-bold text-stone-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#c29b40]" />
                {canSkip ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" />
                    <span>{isAr ? 'تم اكتمال وقت المشاهدة بنجاح! جاهز للتخطي' : 'Ad time completed! Ready to skip'}</span>
                  </span>
                ) : (
                  <span>
                    {isAr 
                      ? `يرجى الانتظار ${countdown} ثوانٍ لتأكيد الدعم وتفعيل زر التخطي...` 
                      : `Please watch for ${countdown}s to enable skip...`}
                  </span>
                )}
              </span>

              <span className="font-mono font-black text-xs text-[#f5d996]">
                {canSkip ? '0s' : `${countdown}s`}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden relative">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: canSkip ? '100%' : `${((COUNTDOWN_SECONDS - countdown) / COUNTDOWN_SECONDS) * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-amber-600 via-[#c29b40] to-emerald-400 rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 sm:p-5 bg-stone-950 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-stone-400 flex items-center gap-1.5 self-start sm:self-auto">
            <span>✨</span>
            <span>
              {isAr 
                ? 'مشاهدتك للإعلان تعوض تكاليف الحوسبة وتفتح ميزات حصرية' 
                : 'Ad views offset compute costs and unlock features'}
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 sm:w-auto px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs transition-all cursor-pointer"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>

            <button
              type="button"
              onClick={handleClaimReward}
              disabled={!canSkip}
              className={`w-2/3 sm:w-auto px-6 py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
                canSkip
                  ? 'bg-gradient-to-r from-emerald-500 via-[#c29b40] to-amber-500 hover:from-emerald-400 hover:to-amber-400 text-stone-950 shadow-emerald-500/20 scale-[1.02] active:scale-[0.98]'
                  : 'bg-stone-800 text-stone-500 border border-stone-700 cursor-not-allowed opacity-60'
              }`}
            >
              {canSkip ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>
                    {isAr
                      ? (rewardType === 'unlock_scenario' ? 'فتح السيناريو والمتابعة فوراً 🎬' : 'تخطي ومتابعة فوراً ⚡')
                      : (rewardType === 'unlock_scenario' ? 'Unlock Scenario & Proceed 🎬' : 'Skip & Continue Now ⚡')}
                  </span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  <span>
                    {isAr ? `تخطي بعد (${countdown}s)` : `Skip in (${countdown}s)`}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
