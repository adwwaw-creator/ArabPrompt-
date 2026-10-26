/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  AlertTriangle, 
  AlertOctagon, 
  ArrowUpRight, 
  Zap, 
  Crown,
  X 
} from 'lucide-react';
import { AppLanguage } from '../types';
import { SubscriptionPlan } from '../utils/subscriptionService';

export interface ToastAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'warning' | 'danger';
}

export interface ToastMessage {
  id: string;
  message: string;
  title?: string;
  isError?: boolean;
  type?: 'success' | 'error' | 'warning' | 'critical' | 'quota';
  threshold?: 80 | 90 | 100;
  remaining?: number;
  max?: number;
  action?: ToastAction;
  duration?: number;
}

// Utility function to trigger a normal toast from anywhere without prop drilling
export const showToast = (message: string, isError = false, action?: ToastAction) => {
  const event = new CustomEvent('show-toast', {
    detail: { message, isError, action }
  });
  window.dispatchEvent(event);
};

// Utility function to explicitly trigger a quota warning toast
export const showQuotaWarningToast = (
  threshold: 80 | 90 | 100,
  remaining: number,
  max: number,
  plan: SubscriptionPlan = 'free'
) => {
  const event = new CustomEvent('quota-threshold-reached', {
    detail: { threshold, remaining, max, plan }
  });
  window.dispatchEvent(event);
};

export const ToastNotification: React.FC<{ 
  lang: AppLanguage;
  onOpenCheckout?: (plan?: SubscriptionPlan) => void;
}> = ({ lang, onOpenCheckout }) => {
  const isAr = lang === 'ar';
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    // 1. Standard toast listener
    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; isError?: boolean; action?: ToastAction }>;
      const { message, isError, action } = customEvent.detail;
      const id = `${Date.now()}-${Math.random()}`;

      setToasts((prev) => [...prev, { 
        id, 
        message, 
        isError, 
        type: isError ? 'error' : 'success',
        action 
      }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    };

    // 2. Quota threshold crossings listener (80%, 90%, 100%)
    const handleQuotaThreshold = (e: Event) => {
      const customEvent = e as CustomEvent<{
        threshold: 80 | 90 | 100;
        used: number;
        remaining: number;
        max: number;
        plan: SubscriptionPlan;
      }>;
      const { threshold, remaining, max, plan } = customEvent.detail;
      const id = `quota-${threshold}-${Date.now()}`;

      let title = '';
      let message = '';
      let actionLabel = '';
      let type: 'warning' | 'critical' = 'warning';

      if (threshold === 80) {
        type = 'warning';
        title = isAr ? '⚠️ تنبيه: استهلكت 80% من باقتك اليوم!' : '⚠️ Warning: 80% of Daily Quota Used!';
        message = isAr 
          ? `متبقي لديك (${remaining} طلبات) فقط من أصل ${max} طلباً مسموحاً بها في باقتك. سارع بالترقية لتفادي توقف الخدمة.`
          : `You only have ${remaining} requests remaining out of ${max}. Upgrade now to avoid disruption.`;
        actionLabel = isAr ? 'ترقية الباقة ($5/شهر) ⚡' : 'Upgrade Plan ($5/mo) ⚡';
      } else if (threshold === 90) {
        type = 'warning';
        title = isAr ? '🚨 تحذير عاجل: استهلكت 90% من باقتك!' : '🚨 Urgent: 90% of Quota Consumed!';
        message = isAr 
          ? `أنت على وشك استنفاد الرصيد اليومي بالكامل (متبقي فقط ${remaining} طلبات). رَقِّ باقتك الآن لتوليد غير محدود.`
          : `Almost out of daily requests! Only ${remaining} prompts left today. Upgrade for unlimited access.`;
        actionLabel = isAr ? 'ترقية فورية الآن ⚡' : 'Upgrade Instantly ⚡';
      } else {
        type = 'critical';
        title = isAr ? '🛑 انتهت حصتك اليومية من الـ API (100%)' : '🛑 Daily API Quota 100% Exhausted';
        message = isAr 
          ? `لقد وصلت للحد الأقصى لباقتك اليوم (${max} طلباً). سيتجدد رصيدك عند منتصف الليل، أو يمكنك الترقية فوراً للاستمرار.`
          : `You've reached your daily limit of ${max} requests. Resets at midnight, or upgrade now to resume.`;
        actionLabel = isAr ? 'فتح الرصيد والترقية فوراً' : 'Unlock Quota Now';
      }

      const targetPlanToUpgrade: SubscriptionPlan = plan === 'free' ? 'lite' : 'pro';

      const toastItem: ToastMessage = {
        id,
        title,
        message,
        type,
        threshold,
        remaining,
        max,
        action: {
          label: actionLabel,
          variant: threshold === 100 ? 'danger' : 'warning',
          onClick: () => {
            if (onOpenCheckout) {
              onOpenCheckout(targetPlanToUpgrade);
            } else {
              window.dispatchEvent(new CustomEvent('open-checkout', { 
                detail: { plan: targetPlanToUpgrade } 
              }));
            }
          }
        }
      };

      setToasts((prev) => {
        // Prevent stacking duplicate threshold messages of same type
        const filtered = prev.filter(t => t.threshold !== threshold);
        return [...filtered, toastItem];
      });

      // Give user 10 seconds to read and interact with quota alerts
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 10000);
    };

    window.addEventListener('show-toast', handleToastEvent);
    window.addEventListener('quota-threshold-reached', handleQuotaThreshold);

    return () => {
      window.removeEventListener('show-toast', handleToastEvent);
      window.removeEventListener('quota-threshold-reached', handleQuotaThreshold);
    };
  }, [isAr, onOpenCheckout]);

  if (toasts.length === 0) return null;

  return (
    <div 
      className="fixed bottom-6 right-6 left-6 md:left-auto md:max-w-md z-[9999] space-y-3 pointer-events-none"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {toasts.map((toast) => {
        const isQuota = toast.threshold !== undefined;

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl border shadow-2xl backdrop-blur-md transition-all duration-300 transform translate-y-0 opacity-100 animate-in fade-in slide-in-from-bottom-3 ${
              toast.threshold === 100
                ? 'bg-rose-950/95 text-stone-100 border-2 border-rose-500 shadow-rose-950/50'
                : toast.threshold === 90
                ? 'bg-amber-950/95 text-stone-100 border-2 border-orange-500 shadow-orange-950/50'
                : toast.threshold === 80
                ? 'bg-amber-950/95 text-stone-100 border-2 border-amber-400 shadow-amber-950/50'
                : toast.isError
                ? 'bg-stone-900/95 text-stone-100 border-rose-800'
                : 'bg-stone-900/95 text-stone-100 border-stone-800'
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="shrink-0 mt-0.5">
                {toast.threshold === 100 ? (
                  <div className="p-1.5 rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-400 animate-pulse">
                    <AlertOctagon className="w-5 h-5" />
                  </div>
                ) : toast.threshold === 90 ? (
                  <div className="p-1.5 rounded-xl bg-orange-500/20 border border-orange-500/50 text-orange-400 animate-bounce">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                ) : toast.threshold === 80 ? (
                  <div className="p-1.5 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-400">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                ) : toast.isError ? (
                  <div className="p-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="p-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Text Body */}
              <div className="flex-1 min-w-0">
                {toast.title && (
                  <h4 className="font-sans text-xs font-black tracking-tight mb-1 text-white flex items-center justify-between">
                    <span>{toast.title}</span>
                    {toast.threshold && (
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                        toast.threshold === 100 
                          ? 'bg-rose-500 text-white' 
                          : 'bg-amber-500 text-stone-950'
                      }`}>
                        {toast.threshold}%
                      </span>
                    )}
                  </h4>
                )}

                <p className="font-sans text-xs font-medium leading-relaxed text-stone-200">
                  {toast.message}
                </p>

                {/* Interactive Action Button for Upgrades */}
                {toast.action && (
                  <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (toast.action?.onClick) toast.action.onClick();
                        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
                      }}
                      className={`w-full py-2 px-3 rounded-xl font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md ${
                        toast.threshold === 100
                          ? 'bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white'
                          : 'bg-gradient-to-r from-amber-500 via-[#c29b40] to-yellow-500 hover:opacity-95 text-stone-950 font-black'
                      }`}
                    >
                      <Crown className="w-3.5 h-3.5" />
                      <span>{toast.action.label}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {!isQuota && (
                  <span className="text-[9px] font-sans font-medium text-stone-400 block mt-1 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-[#c29b40]" />
                    {isAr ? 'منصة عرب برومبت الذكية' : 'ArabPrompt Intelligent Engine'}
                  </span>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="text-stone-400 hover:text-stone-100 text-xs shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title={isAr ? 'إغلاق الإشعار' : 'Dismiss'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
