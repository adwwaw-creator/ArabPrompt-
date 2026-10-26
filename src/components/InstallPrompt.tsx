import React, { useState, useEffect } from 'react';
import { Download, Smartphone } from 'lucide-react';
import { AppLanguage } from '../types';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface InstallPromptProps {
  lang?: AppLanguage;
  className?: string;
  onInstalled?: () => void;
}

export const InstallPrompt: React.FC<InstallPromptProps> = ({ 
  lang = 'ar',
  className = '',
  onInstalled
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Check if app is already running in standalone (installed) mode
    const checkStandalone = () => {
      const isStandalone = 
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        document.referrer.includes('android-app://');
      setIsInstalled(isStandalone);
    };

    checkStandalone();

    // Listen for the native beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent browser's default ambient bar
      e.preventDefault();
      // Stash the event so it can be triggered on user action
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Listen for successful installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setIsInstalling(false);
      if (onInstalled) {
        onInstalled();
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [onInstalled]);

  // Handle user clicking the Install App button
  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    setIsInstalling(true);
    try {
      // Show the native browser install prompt
      await deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } catch (err) {
      console.warn('Install prompt was cancelled or encountered an issue:', err);
    } finally {
      setIsInstalling(false);
    }
  };

  // Only render the custom button when the app is eligible and ready for installation
  if (!deferredPrompt || isInstalled) {
    return null;
  }

  const isAr = lang === 'ar';
  const label = isAr ? 'تثبيت التطبيق' : 'Install App';

  return (
    <button
      id="pwa-install-prompt-btn"
      onClick={handleInstallClick}
      disabled={isInstalling}
      className={`group relative inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-[#916a24] via-[#c29b40] to-[#b38d35] text-white shadow-xs hover:shadow-md hover:brightness-105 active:scale-95 transition-all duration-200 cursor-pointer shrink-0 animate-in fade-in zoom-in-95 ${className}`}
      title={isAr ? 'تثبيت التطبيق كـ PWA على هاتفك' : 'Install Arabiprompt as a PWA on your phone'}
      aria-label={label}
    >
      <Download className="w-3.5 h-3.5 text-amber-200 group-hover:translate-y-0.5 transition-transform" />
      <span className="font-sans font-bold tracking-tight">{label}</span>
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping" />
    </button>
  );
};

export default InstallPrompt;
