import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

interface ToastMessage {
  id: string;
  message: string;
  isError?: boolean;
}

// Utility function to trigger a toast from anywhere without prop drilling
export const showToast = (message: string, isError = false) => {
  const event = new CustomEvent('show-toast', {
    detail: { message, isError }
  });
  window.dispatchEvent(event);
};

export const ToastNotification: React.FC<{ lang: 'ar' | 'en' }> = ({ lang }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; isError?: boolean }>;
      const { message, isError } = customEvent.detail;
      const id = `${Date.now()}-${Math.random()}`;

      setToasts((prev) => [...prev, { id, message, isError }]);

      // Auto-remove after 3.5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    };

    window.addEventListener('show-toast', handleToastEvent);
    return () => {
      window.removeEventListener('show-toast', handleToastEvent);
    };
  }, []);

  return (
    <div 
      className="fixed bottom-6 right-6 left-6 md:left-auto md:max-w-md z-9999 space-y-3 pointer-events-none"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
            className={`pointer-events-auto p-4 rounded-2xl border shadow-xl flex items-start gap-3 backdrop-blur-md bg-stone-900/95 text-stone-100 border-stone-800`}
          >
            <div className="shrink-0 mt-0.5">
              {toast.isError ? (
                <div className="p-1 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
                  <AlertCircle className="w-4 h-4" />
                </div>
              ) : (
                <div className="p-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 animate-pulse">
                  <CheckCircle className="w-4 h-4" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-sans text-xs font-semibold leading-relaxed text-stone-100">
                {toast.message}
              </p>
              <span className="text-[9px] font-sans font-medium text-stone-400 block mt-1 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-[#c29b40]" />
                {lang === 'ar' ? 'تم النسخ بنجاح' : 'Tactile Feedback Verified'}
              </span>
            </div>

            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-stone-400 hover:text-stone-200 text-xs shrink-0 px-1 font-bold transition-colors cursor-pointer"
            >
              ×
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
