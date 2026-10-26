/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import { ActiveTab, AppLanguage, SUPPORTED_LANGUAGES } from '../types';
import { getTranslation } from '../utils/translations';
import { 
  Sparkles, Globe, Cpu, History, Layers, PenTool, CheckCircle, AlertCircle, 
  Image, Film, BarChart3, Music, Sun, Moon, Video, Database, Layout, Cloud, 
  Shield, RefreshCw, LogIn, User as UserIcon, Lightbulb, ChevronDown, Check,
  Clapperboard, Calculator, Palette, CreditCard, LayoutTemplate, Crown, Activity
} from 'lucide-react';
import { BackupMetadata } from '../utils/cloudBackup';
import { User } from 'firebase/auth';
import { UserSubscription, SubscriptionPlan, getUsageStats, UsageStats } from '../utils/subscriptionService';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  lang: AppLanguage;
  setLang: (lang: AppLanguage) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  backupConfig: BackupMetadata;
  onOpenBackupCenter: () => void;
  user: User | null;
  onOpenAuth: (mode?: 'login' | 'signup' | 'profile' | 'usage') => void;
  subscription?: UserSubscription;
  onOpenCheckout?: (plan?: SubscriptionPlan) => void;
}

export default function Header({ 
  activeTab, 
  setActiveTab, 
  lang, 
  setLang, 
  darkMode, 
  setDarkMode, 
  backupConfig, 
  onOpenBackupCenter, 
  user, 
  onOpenAuth,
  subscription,
  onOpenCheckout
}: HeaderProps) {
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const [usageStats, setUsageStats] = useState<UsageStats>(() => getUsageStats(subscription));

  useEffect(() => {
    const handleSubUpdated = () => {
      setUsageStats(getUsageStats());
    };
    window.addEventListener('subscription-updated', handleSubUpdated);
    const timer = setInterval(() => {
      setUsageStats(getUsageStats());
    }, 2000);
    return () => {
      window.removeEventListener('subscription-updated', handleSubUpdated);
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (subscription) {
      setUsageStats(getUsageStats(subscription));
    }
  }, [subscription]);

  const t = getTranslation(lang);
  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === lang) || SUPPORTED_LANGUAGES[0];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setIsLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check backend configuration
  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        setApiOnline(data.hasApiKey);
      })
      .catch(() => {
        setApiOnline(false);
      });
  }, []);

  // Set up scroll hide-on-scroll / show-on-scroll-up event listeners
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      
      // Ignore tiny jitter/elastic bounces
      if (Math.abs(prevScrollPos - currentScrollPos) < 10) {
        return;
      }

      if (currentScrollPos > 120) {
        if (prevScrollPos > currentScrollPos) {
          // Scrolling UP -> reveal header
          setVisible(true);
        } else {
          // Scrolling DOWN -> hide header
          setVisible(false);
        }
      } else {
        // Near top of page -> always show
        setVisible(true);
      }
      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollPos]);

  // Support custom actions to hide or show on demand
  useEffect(() => {
    const handleHide = () => setVisible(false);
    const handleShow = () => setVisible(true);

    window.addEventListener('hide-header', handleHide);
    window.addEventListener('show-header', handleShow);

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (
        window.innerWidth < 1024 &&
        target &&
        (target.tagName === 'INPUT' || 
         target.tagName === 'TEXTAREA' || 
         target.getAttribute('contenteditable') === 'true')
      ) {
        setVisible(false);
      }
    };

    document.addEventListener('focusin', handleFocusIn);

    return () => {
      window.removeEventListener('hide-header', handleHide);
      window.removeEventListener('show-header', handleShow);
      document.removeEventListener('focusin', handleFocusIn);
    };
  }, []);

  const isAdmin = user?.email?.toLowerCase() === 'adwwaw@gmail.com';

  const menuItems = [
    { id: 'builder' as ActiveTab, label: t.navBuilder, icon: PenTool },
    { id: 'templates' as ActiveTab, label: t.navTemplates, icon: LayoutTemplate },
    { id: 'reverse' as ActiveTab, label: t.navReverse, icon: Image },
    { id: 'cinema' as ActiveTab, label: t.navCinema, icon: Clapperboard },
    { id: 'visual_library' as ActiveTab, label: t.navVisualLibrary, icon: Palette },
    { id: 'ideas' as ActiveTab, label: t.navIdeas, icon: Lightbulb },
    { id: 'sequence' as ActiveTab, label: t.navSequence, icon: Film },
    { id: 'drone' as ActiveTab, label: t.navDrone, icon: Video },
    { id: 'diffusiondb' as ActiveTab, label: t.navDiffusionDB, icon: Database },
    { id: 'history' as ActiveTab, label: t.navHistory, icon: History },
    ...(isAdmin ? [{ id: 'privacy' as ActiveTab, label: t.navPrivacy, icon: Calculator }] : []),
    { id: 'pricing' as ActiveTab, label: t.navPricing, icon: CreditCard },
  ];

  const formatMobileNavLabel = (id: ActiveTab, label: string) => {
    if (lang === 'ar') {
      switch (id) {
        case 'drone':
          return (
            <span className="flex flex-col items-center leading-[1.1]">
              <span>تصميم</span>
              <span>أوامر الفيديو</span>
            </span>
          );
        case 'builder':
          return (
            <span className="flex flex-col items-center leading-[1.1]">
              <span>مُهندس</span>
              <span>الأوامر</span>
            </span>
          );
        case 'reverse':
          return (
            <span className="flex flex-col items-center leading-[1.1]">
              <span>الهندسة</span>
              <span>العكسية</span>
            </span>
          );
        case 'cinema':
          return (
            <span className="flex flex-col items-center leading-[1.1]">
              <span>أفلام وسيناريو</span>
              <span>AI</span>
            </span>
          );
        case 'visual_library':
          return (
            <span className="flex flex-col items-center leading-[1.1]">
              <span>مكتبة الصور</span>
              <span>الفنية (36)</span>
            </span>
          );
        case 'ideas':
          return (
            <span className="flex flex-col items-center leading-[1.1]">
              <span>مُولد</span>
              <span>الأفكار</span>
            </span>
          );
        case 'sequence':
          return (
            <span className="flex flex-col items-center leading-[1.1]">
              <span>سلسلة</span>
              <span>صور/فيديو</span>
            </span>
          );
        case 'diffusiondb':
          return (
            <span className="flex flex-col items-center leading-[1.1]">
              <span>قاعدة بيانات</span>
              <span>الانتشار</span>
            </span>
          );
        case 'history':
          return (
            <span className="flex flex-col items-center leading-[1.1]">
              <span>سجل</span>
              <span>الأوامر</span>
            </span>
          );
        case 'privacy':
          return (
            <span className="flex flex-col items-center leading-[1.1]">
              <span>التكاليف</span>
              <span>والخصوصية</span>
            </span>
          );
        case 'pricing':
          return (
            <span className="flex flex-col items-center leading-[1.1]">
              <span>الأسعار</span>
              <span>والباقات</span>
            </span>
          );
        case 'templates':
          return (
            <span className="flex flex-col items-center leading-[1.1]">
              <span>قوالب</span>
              <span>الأوامر</span>
            </span>
          );
        default:
          return label;
      }
    }
    return <span className="line-clamp-2 leading-tight text-center">{label}</span>;
  };

  return (
    <>
      {/* Translucent top click catcher when header is hidden */}
      {!visible && (
        <div
          onClick={() => setVisible(true)}
          className="fixed top-0 left-0 right-0 h-4 bg-gradient-to-b from-[#c29b40]/15 to-transparent cursor-pointer z-[100] flex justify-center items-start group select-none transition-all hover:h-6 duration-200"
          title={lang === 'ar' ? 'انقر هنا لإظهار قائمة التصفح' : 'Tap to show navigation bar'}
        >
          <div className="bg-[#c29b40] text-stone-950 text-[10px] sm:text-xs px-3.5 py-0.5 rounded-b-xl shadow-md font-black flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity translate-y-[-2px] group-hover:translate-y-0 duration-200">
            <span>{lang === 'ar' ? 'إظهار شريط التصفح' : 'Tap to Show Menu'}</span>
            <span className="text-[8px] animate-bounce">▼</span>
          </div>
        </div>
      )}

      <header className={`border-b border-stone-200 dark:border-stone-800 bg-[#fbfaf8] dark:bg-[#12110f] sticky top-0 z-50 transition-all duration-350 transform origin-top ${
        visible 
          ? 'translate-y-0 opacity-100 shadow-sm' 
          : '-translate-y-full opacity-0 pointer-events-none shadow-none'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#916a24] via-[#c29b40] to-[#ecd197] flex items-center justify-center text-white shadow-sm ring-2 ring-[#c29b40]/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#1c1a16] dark:text-stone-100 flex items-center gap-1.5 font-sans">
                <span>{t.appTitle}</span>
                <span className="text-xs font-semibold px-2 py-0.5 bg-[#c29b40]/10 text-[#9c7524] dark:text-amber-400 rounded-full">
                  {t.appBadge}
                </span>
              </h1>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                {t.appTagline}
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 rtl:space-x-reverse overflow-x-auto max-w-[55vw] no-scrollbar py-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 xl:px-3.5 rounded-xl text-xs xl:text-sm font-semibold whitespace-nowrap shrink-0 transition-all duration-300 ${
                    isActive
                      ? 'bg-[#c29b40] text-[#fcfbfa] shadow-md shadow-[#c29b40]/10 border border-[#b38d35]'
                      : 'text-stone-600 dark:text-stone-300 hover:text-[#c29b40] dark:hover:text-amber-400 hover:bg-[#c29b40]/5 dark:hover:bg-[#c29b40]/15 border border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Utilities Panel */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* API Status Indicator */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-stone-200/80 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-[11px] font-medium text-stone-600 dark:text-stone-300">
              {apiOnline === null ? (
                <div className="w-2 h-2 rounded-full bg-stone-300 animate-pulse" />
              ) : apiOnline ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t.geminiConnected}</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                  <span>{t.localPreview}</span>
                </>
              )}
            </div>

            {/* Cloud Backup Toggle Button */}
            <button
              id="cloud-backup-toggle-btn"
              onClick={onOpenBackupCenter}
              className="relative flex items-center justify-center p-2.5 rounded-xl border border-stone-300/80 dark:border-stone-800 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-[#c29b40] dark:hover:text-amber-400 transition-all cursor-pointer shadow-3xs"
              title={t.cloudBackup}
            >
              <Cloud className="w-4 h-4 text-[#c29b40]" />
              {backupConfig.isEnabled && backupConfig.provider && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              )}
            </button>

            {/* Dark Mode Toggle */}
            <button
              id="dark-mode-toggle-btn"
              onClick={() => setDarkMode(!darkMode)}
              className="flex items-center justify-center p-2.5 rounded-xl border border-stone-300/80 dark:border-stone-800 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-[#c29b40] dark:hover:text-amber-400 transition-all cursor-pointer shadow-3xs"
              title={t.toggleDarkMode}
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-amber-500 animate-[spin_10s_linear_infinite]" />
              ) : (
                <Moon className="w-4 h-4 text-stone-500" />
              )}
            </button>

            {/* Multi-Language Dropdown Selector */}
            <div className="relative" ref={langRef}>
              <button
                id="lang-selector-btn"
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl border border-stone-300/80 dark:border-stone-800 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-[#c29b40] dark:hover:text-amber-400 transition-all text-xs font-bold cursor-pointer shadow-3xs"
                title={t.selectLanguage}
              >
                <Globe className="w-3.5 h-3.5 text-stone-500" />
                <span className="text-sm leading-none">{currentLangObj.flag}</span>
                <span className="hidden sm:inline font-sans">{currentLangObj.nativeName}</span>
                <ChevronDown className={`w-3 h-3 text-stone-400 transition-transform duration-200 ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isLangDropdownOpen && (
                <div className="absolute top-full mt-2 end-0 w-52 bg-[#fdfcfb] dark:bg-stone-900 rounded-xl shadow-xl border border-stone-200/90 dark:border-stone-800 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 border-b border-stone-100 dark:border-stone-800 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                    {t.selectLanguage}
                  </div>
                  <div className="max-h-64 overflow-y-auto py-1">
                    {SUPPORTED_LANGUAGES.map((item) => (
                      <button
                        key={item.code}
                        onClick={() => {
                          setLang(item.code);
                          setIsLangDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors cursor-pointer ${
                          lang === item.code
                            ? 'bg-[#c29b40]/15 dark:bg-[#c29b40]/25 text-[#916a24] dark:text-amber-400 font-bold'
                            : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100/70 dark:hover:bg-stone-800 font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{item.flag}</span>
                          <span className="font-sans">{item.nativeName}</span>
                          <span className="text-[10px] text-stone-400">({item.name})</span>
                        </div>
                        {lang === item.code && <Check className="w-3.5 h-3.5 text-[#c29b40]" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Real-time API Quota Monitor Indicator */}
            <button
              id="header-realtime-quota-btn"
              onClick={() => onOpenAuth('usage')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-black shadow-3xs cursor-pointer transition-all ${
                usageStats.isLimitReached
                  ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 animate-pulse'
                  : usageStats.isNearLimit
                  ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 ring-1 ring-amber-400/40 animate-pulse'
                  : 'border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:border-[#c29b40]/60'
              }`}
              title={lang === 'ar' ? 'مراقبة استهلاك طلبات الـ API المتبقية في الوقت الفعلي' : 'Real-time remaining API requests'}
            >
              <div className="relative flex items-center justify-center">
                <Activity className={`w-3.5 h-3.5 ${
                  usageStats.isLimitReached
                    ? 'text-rose-600'
                    : usageStats.isNearLimit
                    ? 'text-amber-600'
                    : 'text-[#c29b40]'
                }`} />
                {usageStats.isNearLimit && !usageStats.isLimitReached && (
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                )}
              </div>
              <span className="font-mono font-black text-[11px]">
                {usageStats.isUnlimited ? (
                  lang === 'ar' ? 'طلبات ∞' : '∞ reqs'
                ) : (
                  `${usageStats.remainingRequests}/${usageStats.maxDailyPrompts} ${lang === 'ar' ? 'طلب' : 'left'}`
                )}
              </span>
            </button>

            {/* Subscription Plan Badge or Upgrade Button */}
            {subscription?.plan && subscription.plan !== 'free' ? (
              <button
                id="header-sub-badge"
                onClick={() => onOpenCheckout ? onOpenCheckout(subscription.plan) : null}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-[#c29b40]/50 bg-gradient-to-r from-amber-500/15 via-[#c29b40]/25 to-amber-500/15 text-stone-900 dark:text-stone-100 font-black text-xs shadow-3xs cursor-pointer hover:border-[#c29b40] transition-all"
                title={lang === 'ar' ? 'إدارة الاشتراك المميز' : 'Manage Subscription'}
              >
                <Crown className="w-3.5 h-3.5 text-[#c29b40]" />
                <span className="font-sans font-black text-[11px] tracking-wide">
                  {subscription.plan === 'studio' ? 'STUDIO' : subscription.plan === 'lite' ? 'LITE' : 'PRO'}
                </span>
                <span className="text-[10px] text-amber-500">
                  {subscription.plan === 'lite' ? '⚡' : '⭐'}
                </span>
              </button>
            ) : (
              <button
                id="header-upgrade-btn"
                onClick={() => onOpenCheckout ? onOpenCheckout('lite') : null}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#916a24] via-[#c29b40] to-amber-500 text-white font-black text-xs shadow-3xs hover:opacity-95 transition-all cursor-pointer"
                title={lang === 'ar' ? 'الترقية إلى باقة مميزة' : 'Upgrade Plan'}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{lang === 'ar' ? 'ترقية الباقة' : 'Upgrade'}</span>
              </button>
            )}

            {/* Email / User Auth Button */}
            {user ? (
              <button
                id="header-user-profile-btn"
                onClick={() => onOpenAuth('profile')}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-[#c29b40]/30 bg-[#c29b40]/10 hover:bg-[#c29b40]/20 text-stone-850 dark:text-stone-100 transition-all cursor-pointer shadow-3xs"
                title={t.accountProfile}
              >
                <div className="w-7 h-7 rounded-lg bg-[#c29b40] text-stone-950 font-black text-xs flex items-center justify-center shadow-xs">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : 'U')}
                </div>
                <div className="hidden xl:flex flex-col text-right rtl:text-right ltr:text-left max-w-[120px]">
                  <span className="text-[11px] font-bold text-stone-900 dark:text-stone-100 truncate">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                  <span className="text-[9px] text-[#9c7524] dark:text-amber-400 truncate">
                    {user.email}
                  </span>
                </div>
              </button>
            ) : (
              <button
                id="header-login-btn"
                onClick={() => onOpenAuth('login')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-300/80 dark:border-stone-800 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-[#c29b40] dark:hover:text-amber-400 transition-all text-xs font-bold shadow-3xs cursor-pointer"
                title={t.signIn}
              >
                <LogIn className="w-3.5 h-3.5 text-[#c29b40]" />
                <span className="hidden sm:inline">{t.signIn}</span>
              </button>
            )}
          </div>

        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden border-t border-stone-200/80 dark:border-stone-800 py-2.5 overflow-x-auto gap-1 text-xs no-scrollbar scroll-smooth whitespace-nowrap px-2 bg-[#fbfaf8] dark:bg-[#12110f]">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center gap-1 py-1.5 px-1.5 rounded-xl font-bold transition-all shrink-0 w-[82px] min-h-[64px] ${
                  isActive
                    ? 'text-[#916a24] dark:text-amber-400 bg-[#c29b40]/15 dark:bg-[#c29b40]/25 font-black border border-[#c29b40]/25 dark:border-[#c29b40]/40'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <div className="text-[10px] text-center whitespace-normal break-words max-w-[76px] flex items-center justify-center min-h-[26px]">
                  {formatMobileNavLabel(item.id, item.label)}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  </>
);
}
