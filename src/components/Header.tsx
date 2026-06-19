/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { ActiveTab } from '../types';
import { Sparkles, Globe, Cpu, History, Layers, PenTool, CheckCircle, AlertCircle, Image, Film, BarChart3, Music, Sun, Moon, Video, Database, Layout, Cloud } from 'lucide-react';
import { BackupMetadata } from '../utils/cloudBackup';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  lang: 'ar' | 'en';
  setLang: (lang: 'ar' | 'en') => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  backupConfig: BackupMetadata;
  onOpenBackupCenter: () => void;
}

export default function Header({ activeTab, setActiveTab, lang, setLang, darkMode, setDarkMode, backupConfig, onOpenBackupCenter }: HeaderProps) {
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);

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

  // Support custom actions to hide or show on demand (e.g., when focusing editors or clicking main actions)
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
        // Automatically hide navigation to free up maximum real estate for mobile on-screen keyboards
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

  const menuItems = [
    { id: 'dashboard', labelAr: 'مختبر برو المدمج', labelEn: 'Pro Dashboard', icon: Layout },
    { id: 'builder', labelAr: 'مُهندس الأوامر', labelEn: 'Prompt Builder', icon: PenTool },
    { id: 'reverse', labelAr: 'الهندسة العكسية', labelEn: 'Reverse Prompt', icon: Image },
    { id: 'library', labelAr: 'مكتبة القوالب', labelEn: 'Prompt Library', icon: Layers },
    { id: 'sequence', labelAr: 'سلسلة صور/فيديو', labelEn: 'Sequence/Animate', icon: Film },
    { id: 'drone', labelAr: 'تصميم أوامر الفيديو', labelEn: 'Video Designer', icon: Video },
    { id: 'tester', labelAr: 'مختبر الأوامر', labelEn: 'Playground', icon: Cpu },
    { id: 'rap', labelAr: 'محرك راب الدارجة', labelEn: 'Moroccan Rap AI', icon: Music },
    { id: 'diffusiondb', labelAr: 'قاعدة بيانات الانتشار', labelEn: 'DiffusionDB', icon: Database },
    { id: 'history', labelAr: 'سجل الأوامر', labelEn: 'History', icon: History },
    { id: 'analytics', labelAr: 'التقارير والتحليلات', labelEn: 'Reports & Analytics', icon: BarChart3 },
  ];

  return (
    <>
      {/* Invisible/translucent top click catcher when header is hidden to easily retrieve it */}
      {!visible && (
        <div
          onClick={() => setVisible(true)}
          className="fixed top-0 left-0 right-0 h-4 bg-gradient-to-b from-[#c29b40]/15 to-transparent cursor-pointer z-[100] flex justify-center items-start group select-none transition-all hover:h-6 duration-200"
          title={lang === 'ar' ? 'انقر هنا لإظهار قائمة التصفح' : 'Tap to show menu navigation Bar'}
        >
          <div className="bg-[#c29b40] text-stone-950 text-[10px] sm:text-xs px-3.5 py-0.5 rounded-b-xl shadow-md font-black flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity translate-y-[-2px] group-hover:translate-y-0 duration-200">
            <span>{lang === 'ar' ? 'إظهار شريط التصفح' : 'Tap to Show Menu'}</span>
            <span className="text-[8px] animate-bounce">▼</span>
          </div>
        </div>
      )}

      <header className={`border-b border-stone-200 bg-[#fbfaf8] sticky top-0 z-50 transition-all duration-350 transform origin-top ${
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
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#1c1a16] flex items-center gap-1.5 font-sans">
                <span>ArabPrompt</span>
                <span className="text-xs font-semibold px-2 py-0.5 bg-[#c29b40]/10 text-[#9c7524] rounded-full">
                  عربي
                </span>
              </h1>
              <p className="text-xs text-stone-500 font-medium">
                {lang === 'ar' ? 'هندسة وصياغة التعليمات البرمجية' : 'Next-Generation Prompt Engineering Core'}
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1 rtl:space-x-reverse">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id as ActiveTab)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? 'bg-[#c29b40] text-[#fcfbfa] shadow-md shadow-[#c29b40]/10 border border-[#b38d35]'
                      : 'text-stone-600 hover:text-[#c29b40] hover:bg-[#c29b40]/5 border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{lang === 'ar' ? item.labelAr : item.labelEn}</span>
                </button>
              );
            })}
          </nav>

          {/* Utilities Panel */}
          <div className="flex items-center gap-3">
            
            {/* API Status Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-stone-200/80 bg-stone-50 text-[11px] font-medium text-stone-600">
              {apiOnline === null ? (
                <div className="w-2 h-2 rounded-full bg-stone-300 animate-pulse" />
              ) : apiOnline ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{lang === 'ar' ? 'نموذج Gemini جاهز' : 'Gemini Engine Connected'}</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                  <span>{lang === 'ar' ? 'معاينة محلية' : 'Local Preview'}</span>
                </>
              )}
            </div>

            {/* Cloud Backup Toggle Button */}
            <button
              id="cloud-backup-toggle-btn"
              onClick={onOpenBackupCenter}
              className="relative flex items-center justify-center p-2.5 rounded-xl border border-stone-300/80 bg-white hover:bg-stone-50 text-stone-700 hover:text-[#c29b40] transition-all cursor-pointer shadow-3xs dark:bg-stone-900 dark:border-stone-800 dark:text-stone-300 dark:hover:text-amber-500"
              title={lang === 'ar' ? 'مركز النسخ الاحتياطي السحابي' : 'Cloud Backup Settings'}
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
              className="flex items-center justify-center p-2.5 rounded-xl border border-stone-300/80 bg-white hover:bg-stone-50 text-stone-700 hover:text-[#c29b40] transition-all cursor-pointer shadow-3xs dark:bg-stone-900 dark:border-stone-800 dark:text-stone-300 dark:hover:text-amber-500"
              title={lang === 'ar' ? 'تبديل المظهر الليلي' : 'Toggle Dark Mode'}
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-amber-500 animate-[spin_10s_linear_infinite]" />
              ) : (
                <Moon className="w-4 h-4 text-stone-500" />
              )}
            </button>

            {/* Language Toggle */}
            <button
              id="lang-toggle-btn"
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-stone-300/80 bg-white hover:bg-stone-50 text-stone-700 hover:text-[#c29b40] transition-all text-xs font-bold"
            >
              <Globe className="w-3.5 h-3.5 text-stone-500" />
              <span>{lang === 'ar' ? 'English (En)' : 'العربية (Ar)'}</span>
            </button>
          </div>

        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden border-t border-stone-100 py-3 overflow-x-auto gap-1 text-xs no-scrollbar scroll-smooth whitespace-nowrap px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as ActiveTab)}
                className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl font-bold transition-all shrink-0 w-24 ${
                  isActive
                    ? 'text-[#c29b40] bg-[#c29b40]/10 font-bold'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[11px] mt-0.5">{lang === 'ar' ? item.labelAr : item.labelEn}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  </>
);
}
