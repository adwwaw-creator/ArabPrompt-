/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Shield, Eye, Database, Info, Trash2, Download, CheckCircle, ShieldAlert, Lock, HelpCircle, HardDrive, RefreshCw, Calculator, DollarSign, Sparkles, BarChart3 } from 'lucide-react';
import { PromptHistoryItem, AppLanguage } from '../types';
import CostEstimator from './CostEstimator';
import UserApiDashboardCharts from './UserApiDashboardCharts';

interface PrivacySettingsProps {
  lang: AppLanguage;
  history: PromptHistoryItem[];
  onClearHistory: () => void;
  currentUser: any;
  onLogout: () => void;
  onNavigateTab?: (tab: string) => void;
}

export default function PrivacySettings({ lang, history, onClearHistory, currentUser, onLogout, onNavigateTab }: PrivacySettingsProps) {
  const [subTab, setSubTab] = useState<'charts' | 'costs' | 'privacy'>('charts');
  
  // Consents State
  const [analyticsConsent, setAnalyticsConsent] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('arabi_prompt_consent_analytics');
      return stored !== 'false'; // default to true
    } catch {
      return true;
    }
  });

  const [recommendationsConsent, setRecommendationsConsent] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('arabi_prompt_consent_recommendations');
      return stored !== 'false'; // default to true
    } catch {
      return true;
    }
  });

  const [localHistoryConsent, setLocalHistoryConsent] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('arabi_prompt_consent_local_history');
      return stored !== 'false'; // default to true
    } catch {
      return true;
    }
  });

  const [cloudSyncConsent, setCloudSyncConsent] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('arabi_prompt_consent_cloud_sync');
      return stored !== 'false'; // default to true
    } catch {
      return true;
    }
  });

  const [autoOptimizeConsent, setAutoOptimizeConsent] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('arabi_prompt_consent_auto_optimize');
      return stored !== 'false'; // default to true
    } catch {
      return true;
    }
  });

  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);
  const [purgeTextConfirm, setPurgeTextConfirm] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Write choices to localStorage on change
  const handleSaveConsent = (type: string, value: boolean) => {
    try {
      localStorage.setItem(`arabi_prompt_consent_${type}`, String(value));
      if (type === 'analytics') setAnalyticsConsent(value);
      if (type === 'recommendations') setRecommendationsConsent(value);
      if (type === 'auto_optimize') {
        setAutoOptimizeConsent(value);
        // Dispatch storage event to keep tabs/components in sync
        window.dispatchEvent(new Event('storage'));
      }
      if (type === 'local_history') {
        setLocalHistoryConsent(value);
        if (!value) {
          // If local history is disabled, ask or clear history
          if (confirm(lang === 'ar' ? 'هل تريد مسح السجل الحالي أيضاً لتأكيد إيقاف الحفظ؟' : 'Do you want to clear your current history too?')) {
            onClearHistory();
          }
        }
      }
      if (type === 'cloud_sync') {
        setCloudSyncConsent(value);
        if (!value) {
          // Disable backup toggles
          const currentConfig = localStorage.getItem('arabi_prompt_backup_config');
          if (currentConfig) {
            try {
              const parsed = JSON.parse(currentConfig);
              parsed.isEnabled = false;
              localStorage.setItem('arabi_prompt_backup_config', JSON.stringify(parsed));
              // Trigger config reload event
              window.dispatchEvent(new Event('storage'));
            } catch {}
          }
        }
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save privacy settings:', err);
    }
  };

  // Export Data Action
  const handleDownloadAllData = () => {
    try {
      const allData = {
        exportedAt: new Date().toISOString(),
        userInfo: currentUser ? {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName
        } : 'anonymous',
        consents: {
          analytics: analyticsConsent,
          recommendations: recommendationsConsent,
          localHistory: localHistoryConsent,
          cloudSync: cloudSyncConsent,
          autoOptimize: autoOptimizeConsent
        },
        historyCount: history.length,
        history: history,
        settings: {
          darkMode: localStorage.getItem('arabi_prompt_dark_mode') === 'true',
          language: lang,
          backupConfig: localStorage.getItem('arabi_prompt_backup_config') || 'none'
        }
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `arab_prompt_privacy_data_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      alert(lang === 'ar' ? 'فشل تصدير البيانات.' : 'Failed to export your privacy data.');
    }
  };

  // Complete data purge
  const handlePurgeAllData = () => {
    if (purgeTextConfirm !== 'DELETE' && purgeTextConfirm !== 'حذف') {
      alert(lang === 'ar' ? 'يرجى كتابة "حذف" للتأكيد.' : 'Please type "DELETE" to confirm.');
      return;
    }

    try {
      // Clear All Local Storage keys related to this app
      const keysToClear = [
        'arabi_prompt_history',
        'arabi_prompt_dark_mode',
        'arabi_prompt_dropbox_token',
        'arabi_prompt_backup_config',
        'arabi_prompt_consent_analytics',
        'arabi_prompt_consent_recommendations',
        'arabi_prompt_consent_local_history',
        'arabi_prompt_consent_cloud_sync',
        'arabi_prompt_consent_auto_optimize'
      ];
      
      keysToClear.forEach(k => {
        try {
          localStorage.removeItem(k);
        } catch {}
      });

      // Clear main history state
      onClearHistory();

      // Sign out
      if (currentUser) {
        onLogout();
      }

      alert(lang === 'ar' ? 'تمت تصفية ومسح جميع بياناتك بنجاح وعادت إعدادات الخصوصية للحالة الافتراضية.' : 'All your data has been purged successfully and privacy consents have been reset.');
      window.location.reload();
    } catch (err) {
      console.error('Purge failed:', err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fade-in" id="settings-and-costs-panel">
      
      {/* Top Banner & Navigation Sub-Tabs */}
      <div className="bg-gradient-to-tr from-[#7d591b] via-[#a8822f] to-[#e4c483] p-6 sm:p-8 rounded-3xl text-white relative overflow-hidden shadow-md">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute left-10 bottom-0 translate-y-10 w-44 h-44 bg-white/15 rounded-full blur-xl pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>{lang === 'ar' ? 'لوحة التحكم والإعدادات' : 'Control Center & Settings'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-sans leading-tight">
              {subTab === 'charts' && (lang === 'ar' ? 'لوحة الرسوم البيانية وتفاصيل استهلاك الأدوات' : 'Visual API Charts & Per-Tool Consumption')}
              {subTab === 'costs' && (lang === 'ar' ? 'حاسبة وتقدير تكلفة استهلاك Gemini API' : 'Gemini API & Platform Cost Estimator')}
              {subTab === 'privacy' && (lang === 'ar' ? 'مركز إعدادات الخصوصية وحماية البيانات' : 'Data Privacy Control Center')}
            </h2>
            <p className="text-sm text-white/90 font-medium leading-relaxed max-w-xl">
              {subTab === 'charts' && (lang === 'ar'
                ? 'رسوم بيانية تفاعلية توضح استهلاك API التقديري والتكلفة الشهرية بحسب عدد الطلبات، مع تفاصيل الاستهلاك لكل أداة وميزة على حدة.'
                : 'Interactive visual charts displaying estimated API usage, monthly cost projections by request volume, and granular per-tool metrics.')}
              {subTab === 'costs' && (lang === 'ar'
                ? 'أداة تفاعلية لحساب استهلاك الرموز (Tokens) وتقدير الفاتورة الشهرية المتوقعة بدقة بحسب عدد الطلبات والنموذج المعتمد.'
                : 'Interactive estimator to calculate token consumption and projected monthly invoices based on request volume and model tier.')}
              {subTab === 'privacy' && (lang === 'ar' 
                ? 'تحكم بشكل كامل في البيانات التي تجمعها المنصة، ونظم موافقاتك أو امسح بياناتك بالكامل في أي وقت تماشياً مع معايير اللائحة العامة لحماية البيانات (GDPR).' 
                : 'Take full control of the data collected, manage your permissions, or purge your account records in alignment with international privacy standards (GDPR).')}
            </p>
          </div>

          <div className="hidden lg:block shrink-0">
            {subTab === 'charts' && (
              <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-inner">
                <BarChart3 className="w-10 h-10 text-white" />
              </div>
            )}
            {subTab === 'costs' && (
              <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-inner">
                <Calculator className="w-10 h-10 text-white" />
              </div>
            )}
            {subTab === 'privacy' && (
              <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-inner">
                <Shield className="w-10 h-10 text-white" />
              </div>
            )}
          </div>
        </div>

        {/* Sub-Navigation Switcher Tabs */}
        <div className="mt-6 pt-5 border-t border-white/20 flex flex-wrap gap-2 relative z-10">
          <button
            onClick={() => setSubTab('charts')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              subTab === 'charts'
                ? 'bg-white text-stone-900 shadow-md ring-2 ring-white/30'
                : 'bg-white/15 hover:bg-white/25 text-white'
            }`}
          >
            <BarChart3 className={`w-4 h-4 ${subTab === 'charts' ? 'text-[#c29b40]' : 'text-white'}`} />
            <span>{lang === 'ar' ? '📊 الرسوم البيانية وتفاصيل الأدوات' : '📊 Visual Charts & Tool Breakdown'}</span>
          </button>

          <button
            onClick={() => setSubTab('costs')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              subTab === 'costs'
                ? 'bg-white text-stone-900 shadow-md ring-2 ring-white/30'
                : 'bg-white/15 hover:bg-white/25 text-white'
            }`}
          >
            <Calculator className={`w-4 h-4 ${subTab === 'costs' ? 'text-[#c29b40]' : 'text-white'}`} />
            <span>{lang === 'ar' ? '💰 حاسبة التكلفة والميزانية' : '💰 Cost & Budget Estimator'}</span>
          </button>

          <button
            onClick={() => setSubTab('privacy')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              subTab === 'privacy'
                ? 'bg-white text-stone-900 shadow-md ring-2 ring-white/30'
                : 'bg-white/15 hover:bg-white/25 text-white'
            }`}
          >
            <Shield className={`w-4 h-4 ${subTab === 'privacy' ? 'text-[#c29b40]' : 'text-white'}`} />
            <span>{lang === 'ar' ? '🛡️ إعدادات الخصوصية والبيانات (GDPR)' : '🛡️ Data Privacy & Consents (GDPR)'}</span>
          </button>
        </div>
      </div>

      {/* Render Charts & Breakdown Tab */}
      {subTab === 'charts' && (
        <UserApiDashboardCharts
          lang={lang}
          history={history}
          onNavigateTab={onNavigateTab}
        />
      )}

      {/* Render Cost Estimator Tab */}
      {subTab === 'costs' && (
        <CostEstimator lang={lang} />
      )}

      {/* Render Privacy & Consents Tab */}
      {subTab === 'privacy' && (
        <>
          {saveSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-bold flex items-center gap-2 animate-bounce">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{lang === 'ar' ? 'تم تحديث تفضيلات الخصوصية الخاصة بك بنجاح! ✨' : 'Your privacy preferences have been updated successfully! ✨'}</span>
            </div>
          )}

          {/* Grid containing Data Map & Consents */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Consents & Settings (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-stone-200/80 rounded-3xl shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-4">
              <Shield className="w-5 h-5 text-[#c29b40]" />
              <h3 className="text-sm font-black text-stone-900 font-sans uppercase tracking-wider">
                {lang === 'ar' ? 'إدارة الموافقات والأذونات' : 'Manage Consents & Permissions'}
              </h3>
            </div>

            <div className="space-y-5">
              
              {/* Local Storage Consent */}
              <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-200/50 hover:bg-stone-50/80 transition-all">
                <div className="space-y-1">
                  <span className="text-xs font-black text-stone-800 block">
                    {lang === 'ar' ? 'حفظ وتخزين السجل محلياً' : 'Local History Storage'}
                  </span>
                  <span className="text-[11px] text-stone-500 font-medium leading-relaxed block">
                    {lang === 'ar' 
                      ? 'يسمح للمنصة بحفظ سجل الأوامر التي تصنعها داخل ذاكرة المتصفح للوصول السريع والنسخ المباشر.' 
                      : 'Allows saving generated and refined prompt logs inside browser memory for quick access and reuse.'}
                  </span>
                </div>
                <button
                  onClick={() => handleSaveConsent('local_history', !localHistoryConsent)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    localHistoryConsent ? 'bg-[#c29b40]' : 'bg-stone-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      localHistoryConsent ? (lang === 'ar' ? '-translate-x-5' : 'translate-x-5') : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Cloud Sync Consent */}
              <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-200/50 hover:bg-stone-50/80 transition-all">
                <div className="space-y-1">
                  <span className="text-xs font-black text-stone-800 block">
                    {lang === 'ar' ? 'المزامنة والنسخ الاحتياطي السحابي' : 'Cloud Sync & Offsite Backups'}
                  </span>
                  <span className="text-[11px] text-stone-500 font-medium leading-relaxed block">
                    {lang === 'ar' 
                      ? 'يسمح برفع السجل ومزامنته مع قواعد البيانات المؤمنة (Firestore) أو Google Drive لتجنب فقدان البيانات.' 
                      : 'Allows backing up your configuration and prompt database to Firestore or GDrive to protect against local cache wipes.'}
                  </span>
                </div>
                <button
                  onClick={() => handleSaveConsent('cloud_sync', !cloudSyncConsent)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    cloudSyncConsent ? 'bg-[#c29b40]' : 'bg-stone-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      cloudSyncConsent ? (lang === 'ar' ? '-translate-x-5' : 'translate-x-5') : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Analytics & AI Quality Consent */}
              <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-200/50 hover:bg-stone-50/80 transition-all">
                <div className="space-y-1">
                  <span className="text-xs font-black text-stone-800 block">
                    {lang === 'ar' ? 'تحليلات الأداء المجهولة وقياس الجودة' : 'Anonymous Analytics & Performance Audit'}
                  </span>
                  <span className="text-[11px] text-stone-500 font-medium leading-relaxed block">
                    {lang === 'ar' 
                      ? 'يسمح بحساب جودة الأوامر وعرض تقارير ذكاء الأداء في لوحة التحليلات الخاصة بك بشكل مجهول وآمن.' 
                      : 'Allows evaluating output quality scores and compiling local dashboard reports entirely anonymously.'}
                  </span>
                </div>
                <button
                  onClick={() => handleSaveConsent('analytics', !analyticsConsent)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    analyticsConsent ? 'bg-[#c29b40]' : 'bg-stone-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      analyticsConsent ? (lang === 'ar' ? '-translate-x-5' : 'translate-x-5') : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Personalized Templates / Recommendations */}
              <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-200/50 hover:bg-stone-50/80 transition-all">
                <div className="space-y-1">
                  <span className="text-xs font-black text-stone-800 block">
                    {lang === 'ar' ? 'التوصيات المخصصة والقوالب المقترحة' : 'Personalized Template Recommendations'}
                  </span>
                  <span className="text-[11px] text-stone-500 font-medium leading-relaxed block">
                    {lang === 'ar' 
                      ? 'تفعيل محرك التوصيات لتخصيص واقتراح قوالب هندسة أوامر تناسب اهتماماتك السابقة تلقائياً.' 
                      : 'Enables our AI recommendation engine to tailor prompt templates that match your frequent writing categories.'}
                  </span>
                </div>
                <button
                  onClick={() => handleSaveConsent('recommendations', !recommendationsConsent)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    recommendationsConsent ? 'bg-[#c29b40]' : 'bg-stone-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      recommendationsConsent ? (lang === 'ar' ? '-translate-x-5' : 'translate-x-5') : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Automatic Prompt Optimization Consent */}
              <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-200/50 hover:bg-stone-50/80 transition-all">
                <div className="space-y-1">
                  <span className="text-xs font-black text-stone-850 block flex items-center gap-1.5">
                    {lang === 'ar' ? 'التحسين التلقائي الفوري للأوامر في المختبر' : 'Instant Auto Prompt Optimization'}
                  </span>
                  <span className="text-[11px] text-stone-500 font-medium leading-relaxed block">
                    {lang === 'ar' 
                      ? 'يسمح للمنصة بتحسين وهندسة برومبت فائق التفاصيل تلقائياً في الخلفية فور الانتهاء من صياغة فكرتك بـ 2.5 ثانية.' 
                      : 'Enables real-time background engineering and prompt synthesis 2.5 seconds after you stop typing in the main sandbox.'}
                  </span>
                </div>
                <button
                  onClick={() => handleSaveConsent('auto_optimize', !autoOptimizeConsent)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    autoOptimizeConsent ? 'bg-[#c29b40]' : 'bg-stone-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      autoOptimizeConsent ? (lang === 'ar' ? '-translate-x-5' : 'translate-x-5') : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

            </div>
          </div>

          {/* Export & Purge Actions */}
          <div className="bg-white border border-stone-200/80 rounded-3xl shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-4">
              <Database className="w-5 h-5 text-stone-600" />
              <h3 className="text-sm font-black text-stone-900 font-sans uppercase tracking-wider">
                {lang === 'ar' ? 'تصدير وحذف البيانات بالكامل' : 'Data Portability & Deletion'}
              </h3>
            </div>

            <p className="text-xs text-stone-500 font-medium leading-relaxed">
              {lang === 'ar' 
                ? 'وفقاً لحق النقل (Right to Portability) وحق النسيان (Right to be Forgotten)، يمكنك تصدير ملف كامل ببياناتك أو تصفية حسابك ومسح السجلات نهائياً.' 
                : 'Pursuant to the rights of data portability and erasure, you can download all stored files and settings or initiate an immediate full database purge.'}
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleDownloadAllData}
                className="flex-1 py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-850 text-white font-black text-xs transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Download className="w-4 h-4 text-amber-500" />
                <span>{lang === 'ar' ? 'تحميل نسختي من البيانات (JSON)' : 'Download All My Data (JSON)'}</span>
              </button>

              <button
                onClick={() => setShowPurgeConfirm(true)}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-850 hover:bg-rose-100 font-black text-xs transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-3xs"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>{lang === 'ar' ? 'حذف وتصفية حسابي بالكامل ⚠️' : 'Purge All My App Data ⚠️'}</span>
              </button>
            </div>

            {showPurgeConfirm && (
              <div className="mt-4 p-4 rounded-2xl bg-rose-50/80 border border-rose-200 space-y-3.5 animate-slide-up">
                <div className="flex gap-2 items-start text-xs text-rose-800">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">{lang === 'ar' ? 'تحذير أمني: هذا الإجراء لا يمكن التراجع عنه!' : 'Critical Alert: This action is irreversible!'}</p>
                    <p className="opacity-90 mt-1 leading-relaxed">
                      {lang === 'ar' 
                        ? 'سيؤدي هذا الإجراء لمسح جميع السجلات المحلية في متصفحك وتصفية التخزين وسجل الأوامر والمزامنة، وإلغاء تسجيل الدخول بالكامل.'
                        : 'This will instantly delete your complete prompt history logs, wipe local cache, clear active backup configurations, and log you out.'}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-stone-700 block">
                    {lang === 'ar' ? 'لتأكيد الحذف، اكتب الكلمة "حذف" في الحقل أدناه:' : 'To confirm, type the word "DELETE" in the input field below:'}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={purgeTextConfirm}
                      onChange={(e) => setPurgeTextConfirm(e.target.value)}
                      placeholder={lang === 'ar' ? 'اكتب "حذف" للتأكيد' : 'Type "DELETE" to confirm'}
                      className="flex-1 bg-white border border-rose-300 rounded-xl px-3 py-2 text-xs font-mono text-stone-900 focus:outline-none focus:ring-1 focus:ring-rose-400"
                    />
                    <button
                      onClick={handlePurgeAllData}
                      className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-black hover:bg-rose-700 transition cursor-pointer"
                    >
                      {lang === 'ar' ? 'تأكيد الحذف النهائي' : 'Confirm Permanent Erasure'}
                    </button>
                    <button
                      onClick={() => {
                        setShowPurgeConfirm(false);
                        setPurgeTextConfirm('');
                      }}
                      className="px-3 py-2 bg-stone-200 hover:bg-stone-300 rounded-xl text-stone-700 text-xs font-bold transition cursor-pointer"
                    >
                      {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Right Column: Data Audit & Transparency Map (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Transparency Map */}
          <div className="bg-white border border-stone-200/80 rounded-3xl shadow-sm p-6 space-y-5">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-4">
              <Eye className="w-5 h-5 text-[#c29b40]" />
              <h3 className="text-sm font-black text-stone-900 font-sans uppercase tracking-wider">
                {lang === 'ar' ? 'خارطة شفافية البيانات المجمعة' : 'Collected Data Transparency Map'}
              </h3>
            </div>

            <div className="space-y-4">
              
              {/* Prompt history info */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-850 flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5 text-[#c29b40]" />
                    <span>{lang === 'ar' ? 'سجل الأوامر وصور الهندسة العكسية' : 'History & Reverse Prompt Images'}</span>
                  </span>
                  <span className="font-mono text-2xs font-bold bg-[#c29b40]/10 text-[#9c7524] px-2 py-0.5 rounded">
                    {history.length} {lang === 'ar' ? 'سجلات' : 'items'}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 font-medium leading-relaxed">
                  {lang === 'ar' 
                    ? 'يتم حفظ أصول الأوامر والنسخ المقواة وصور الميكس محلياً في الذاكرة لتسهيل التحرير المستمر.' 
                    : 'The original and enhanced instructions are retained in your local storage memory to provide prompt templates and logs.'}
                </p>
              </div>

              {/* Server-side / AI Queries */}
              <div className="space-y-1 pt-3 border-t border-stone-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-850 flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 text-[#c29b40]" />
                    <span>{lang === 'ar' ? 'طلبات تحسين الأوامر (Gemini API)' : 'Command Optimizations (Gemini API)'}</span>
                  </span>
                  <span className="font-mono text-2xs font-bold bg-amber-100 text-stone-700 px-2 py-0.5 rounded">
                    {lang === 'ar' ? 'مؤقتة وعابرة' : 'Transient'}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 font-medium leading-relaxed">
                  {lang === 'ar' 
                    ? 'يتم إرسال النصوص والمقاطع لتتم صياغتها وتحسينها في خوادمنا بصورة لحظية مجهولة دون تخزينها على خوادم الذكاء الاصطناعي.' 
                    : 'All text queries sent to enhance prompts, music, images, or structures are processed live without logging, persistent server-side caching, or training.'}
                </p>
              </div>

              {/* Backup configuration */}
              <div className="space-y-1 pt-3 border-t border-stone-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-850 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-[#c29b40]" />
                    <span>{lang === 'ar' ? 'بيانات النسخ السحابي ومفتاح التوثيق' : 'Cloud Backups & Tokens'}</span>
                  </span>
                  <span className="font-mono text-2xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    {currentUser ? 'Firestore Active' : 'Offline'}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 font-medium leading-relaxed">
                  {lang === 'ar' 
                    ? 'مفاتيح الربط والتوثيق (مثل Drive / Dropbox) تُخزن وتُدار محلياً بشكل آمن في متصفحك لضمان أعلى مستويات الأمان.' 
                    : 'External integration access metadata is locked safely in the local scope, used only to dispatch requested operations securely.'}
                </p>
              </div>

            </div>
          </div>

          {/* Retention Policy */}
          <div className="bg-white border border-stone-200/80 rounded-3xl shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-4">
              <Info className="w-5 h-5 text-stone-600" />
              <h3 className="text-sm font-black text-stone-900 font-sans uppercase tracking-wider">
                {lang === 'ar' ? 'سياسة الاحتفاظ بالبيانات والخصوصية' : 'Data Retention & Privacy Policy'}
              </h3>
            </div>

            <div className="text-[11px] text-stone-600 space-y-3.5 leading-relaxed font-medium">
              <div className="p-3 bg-stone-50 rounded-xl space-y-1">
                <span className="font-bold text-stone-800 block">
                  {lang === 'ar' ? '1. ما هي مدة بقاء البيانات؟' : '1. How long is my data stored?'}
                </span>
                <p>
                  {lang === 'ar'
                    ? 'تبقى جميع البيانات والتعليمات المخزنة محلياً نشطة حتى تقوم أنت يدوياً بتصفية السجلات، أو استخدام أداة حذف وتصفية حسابك المدرجة في هذه الصفحة.'
                    : 'Local data resides in your browser memory until you clear site data, or use our dedicated purge options in this menu.'}
                </p>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl space-y-1">
                <span className="font-bold text-stone-800 block">
                  {lang === 'ar' ? '2. الخصوصية الفائقة للأوامر والصور' : '2. Complete Prompt Isolation'}
                </span>
                <p>
                  {lang === 'ar'
                    ? 'الأوامر التي تصيغها هي ملكك بالكامل. نحن لا نقوم ببيع أو مشاركة بياناتك، أو استخدامها لتدريب نماذج الذكاء الاصطناعي الأخرى.'
                    : 'The inputs you submit belong exclusively to you. We do not sell or monetize your data, nor do we employ your prompts for model training.'}
                </p>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl space-y-1">
                <span className="font-bold text-stone-800 block">
                  {lang === 'ar' ? '3. سياسة التخزين السحابي المؤمن' : '3. Secure Cloud Security'}
                </span>
                <p>
                  {lang === 'ar'
                    ? 'في حالة تفعيل المزامنة السحابية عبر قنوات الدعم المتاحة، يتم ترحيل السجلات بالكامل عبر قنوات آمنة مشفرة بطبقة المقابس الآمنة (HTTPS/TLS) لضمان حمايتها من القرصنة.'
                    : 'If cloud syncing is enabled, database payloads are transmitted over secure TLS/HTTPS channels, protecting your history from interception.'}
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
        </>
      )}

    </div>
  );
}
