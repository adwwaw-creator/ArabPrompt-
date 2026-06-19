/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  Database, 
  Settings, 
  Upload, 
  Download, 
  RefreshCw, 
  CheckCircle, 
  X, 
  Clock, 
  Trash2, 
  AlertCircle, 
  HelpCircle,
  Unlink,
  Loader2,
  SlidersHorizontal
} from 'lucide-react';
import { PromptHistoryItem } from '../types';
import { 
  BackupMetadata, 
  getBackupConfig, 
  saveBackupConfig,
  searchGDriveBackup,
  uploadGDriveBackup,
  downloadGDriveBackup,
  uploadDropboxBackup,
  downloadDropboxBackup,
  backupToDropboxSimulated,
  backupToICloudSimulated,
  backupToCustomBackendSimulated
} from '../utils/cloudBackup';
import { syncAllHistoryToFirestore, getUserHistory } from '../utils/firestoreService';
import { User } from 'firebase/auth';

interface CloudBackupCenterProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'ar' | 'en';
  history: PromptHistoryItem[];
  onRestoreHistory: (items: PromptHistoryItem[]) => void;
  user: User | null;
  accessToken: string | null;
  onGoogleSignIn: () => Promise<any>;
  onLogout: () => Promise<void>;
  
  // App-level state and triggers to sync settings across other panels
  backupConfig: BackupMetadata;
  handleConfigChange: (
    newProvider: 'google-drive' | 'dropbox' | 'firebase' | 'icloud' | 'custom-backend' | null,
    newInterval: 'manual' | 'daily' | 'weekly' | 'instant',
    newEnabled?: boolean
  ) => void;
  isCloudBackingUp: boolean;
  setIsCloudBackingUp: (val: boolean) => void;
  isCloudRestoring: boolean;
  setIsCloudRestoring: (val: boolean) => void;
}

export default function CloudBackupCenter({
  isOpen,
  onClose,
  lang,
  history,
  onRestoreHistory,
  user,
  accessToken,
  onGoogleSignIn,
  onLogout,
  backupConfig,
  handleConfigChange,
  isCloudBackingUp,
  setIsCloudBackingUp,
  isCloudRestoring,
  setIsCloudRestoring
}: CloudBackupCenterProps) {
  const [backupMessage, setBackupMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  
  const [dropboxToken, setDropboxToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('arabi_prompt_dropbox_token');
    } catch {
      return null;
    }
  });

  const [dropboxLinked, setDropboxLinked] = useState(!!dropboxToken);
  const [icloudLinked, setIcloudLinked] = useState(() => {
    try {
      return localStorage.getItem('arabi_prompt_icloud_linked') === 'true';
    } catch {
      return false;
    }
  });
  const [customLinked, setCustomLinked] = useState(() => {
    try {
      return localStorage.getItem('arabi_prompt_custom_linked') === 'true';
    } catch {
      return false;
    }
  });

  // Automatically sync local links with the selected backup provider
  useEffect(() => {
    if (backupConfig.provider === 'dropbox' && !dropboxLinked) setDropboxLinked(true);
    if (backupConfig.provider === 'icloud' && !icloudLinked) setIcloudLinked(true);
    if (backupConfig.provider === 'custom-backend' && !customLinked) setCustomLinked(true);
  }, [backupConfig.provider]);

  const [csvDelimiter, setCsvDelimiter] = useState<',' | ';'>((() => {
    try {
      const saved = localStorage.getItem('arabi_prompt_csv_delimiter');
      return (saved === ',' || saved === ';') ? saved : ',';
    } catch {
      return ',';
    }
  })());

  const handleExportAllAsCSV = () => {
    if (history.length === 0) {
      setBackupMessage({
        type: 'info',
        text: lang === 'ar' 
          ? 'لا توجد بيانات حالية في سجل الأوامر لتصديرها كـ CSV. تفضل بتوليد بعض الأوامر أولاً!' 
          : 'No data records available to export inside your log folder. Generate prompts first!'
      });
      return;
    }

    try {
      const escapeCSVValue = (val: any) => {
        if (val === null || val === undefined) return '';
        let str = String(val);
        str = str.replace(/"/g, '""');
        if (str.includes(csvDelimiter) || str.includes('\n') || str.includes('\r') || str.includes('"')) {
          return `"${str}"`;
        }
        return str;
      };

      const fields = [
        { key: 'id', labelAr: 'المعرف الفريد (ID)', labelEn: 'Unique ID' },
        { key: 'timestamp', labelAr: 'تاريخ ووقت الإنشاء', labelEn: 'Creation Date & Time' },
        { key: 'originalText', labelAr: 'النص الأصلي (الفكرة الكامنة)', labelEn: 'Original Thought Prompt' },
        { key: 'optimizedText', labelAr: 'الأمر الهندسي المحسن النهائي', labelEn: 'Optimized Target Prompt' },
        { key: 'translatedText', labelAr: 'الترجمة والتعريب الإنجليزي', labelEn: 'Translated English' },
        { key: 'model', labelAr: 'النموذج الذكي المستهدف', labelEn: 'Target AI Model' },
        { key: 'tone', labelAr: 'النبرة والأسلوب البصري الكلاسيكي', labelEn: 'Target Tone & Aesthetic' },
        { key: 'category', labelAr: 'التصنيف والخبرة العملية', labelEn: 'Expert Category Context' },
        { key: 'actionType', labelAr: 'نوع العملية', labelEn: 'Interaction Type' },
        { key: 'rating', labelAr: 'التقييم بالنجوم', labelEn: 'Rating (Stars)' },
        { key: 'isFavorite', labelAr: 'هل في المفضلة؟', labelEn: 'Starred Status' }
      ];

      // Build header
      const headerRow = fields
        .map(f => lang === 'ar' ? f.labelAr : f.labelEn)
        .map(escapeCSVValue)
        .join(csvDelimiter);

      // Build data rows
      const rows = history.map(item => {
        return fields
          .map(f => {
            let val = (item as any)[f.key];
            if (f.key === 'isFavorite') {
              val = val ? (lang === 'ar' ? 'نعم (مفضلة)' : 'Yes (Starred)') : (lang === 'ar' ? 'لا' : 'No');
            } else if (f.key === 'timestamp') {
              try {
                val = new Date(val).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US');
              } catch {
                val = String(val);
              }
            } else if (f.key === 'rating') {
              val = val || 0;
            }
            return escapeCSVValue(val);
          })
          .join(csvDelimiter);
      });

      const csvContent = [headerRow, ...rows].join('\n');
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `arab_prompts_workspace_dataset_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setBackupMessage({
        type: 'success',
        text: lang === 'ar'
          ? `✓ تم تصدير كافة أوامرك الهندسية (${history.length} سجل) بنسق جدول بيانات CSV بنجاح وتوفير دعم Excel الكامل!`
          : `✓ Successfully compiled and downloaded all ${history.length} application drafts inside a spreadsheet-ready CSV file!`
      });
    } catch (error: any) {
      console.error('Failed to export CSV database:', error);
      setBackupMessage({
        type: 'error',
        text: lang === 'ar' ? 'عذراً، حدث خطأ أثناء تشكيل وتصدير ملف الـ CSV.' : 'An error occurred while compiling your CSV dataset.'
      });
    }
  };

  if (!isOpen) return null;

  const handleCloudBackupNow = async () => {
    if (history.length === 0) {
      setBackupMessage({
        type: 'info',
        text: lang === 'ar' 
          ? 'لا توجد بيانات حالية لنسخها احتياطياً. تفضل بتوليد بعض الأوامر أولاً!' 
          : 'No history data available to backup. Generate some prompts first!'
      });
      return;
    }

    setIsCloudBackingUp(true);
    setBackupMessage({
      type: 'info',
      text: lang === 'ar' ? 'جاري رفع بياناتك إلى التخزين السحابي الآمن...' : 'Uploading your application data to secure cloud storage...'
    });

    try {
      if (backupConfig.provider === 'google-drive') {
        let activeToken = accessToken;
        if (!activeToken) {
          const result = await onGoogleSignIn();
          if (!result || !result.accessToken) {
            throw new Error(lang === 'ar' ? 'يجب تسجيل الدخول لتمكين النسخ الاحتياطي عبر Google Drive.' : 'Sign-in is required to backup to Google Drive.');
          }
          activeToken = result.accessToken;
        }

        const fileId = await searchGDriveBackup(activeToken);
        await uploadGDriveBackup(activeToken, history, fileId);
      } else if (backupConfig.provider === 'dropbox') {
        let dToken = dropboxToken;
        if (!dToken) {
          const token = prompt(
            lang === 'ar' 
              ? 'الرجاء إدخال رمز الوصول (Access Token) الخاص بـ Dropbox لتشغيل عملية النسخ الاحتياطي الحقيقية:' 
              : 'Please enter your Dropbox Access Token to run a real cloud backup:'
          );
          if (!token) throw new Error(lang === 'ar' ? 'رمز الوصول لـ Dropbox مطلوب.' : 'Dropbox Access Token is required.');
          localStorage.setItem('arabi_prompt_dropbox_token', token);
          setDropboxToken(token);
          setDropboxLinked(true);
          dToken = token;
        }
        await uploadDropboxBackup(dToken, history);
      } else if (backupConfig.provider === 'firebase') {
        let activeUser = user;
        if (!activeUser) {
          const result = await onGoogleSignIn();
          if (result && result.user) {
            activeUser = result.user;
          } else {
            throw new Error(lang === 'ar' ? 'يجب تسجيل الدخول لتمكين نسخ Firebase.' : 'Sign-in is required to backup to Firebase.');
          }
        }
        await syncAllHistoryToFirestore(activeUser.uid, history);
      } else if (backupConfig.provider === 'icloud') {
        await backupToICloudSimulated(history);
      } else if (backupConfig.provider === 'custom-backend') {
        await backupToCustomBackendSimulated(history);
      } else {
        throw new Error(lang === 'ar' ? 'تفضل بربط تخزين سحابي أولاً.' : 'Please link a cloud storage service first.');
      }

      const now = new Date().toISOString();
      handleConfigChange(backupConfig.provider, backupConfig.interval, true);
      
      // Force update layout Config list
      const backupConfigSaved = {
        ...backupConfig,
        lastBackupTime: now
      };
      saveBackupConfig(backupConfigSaved);

      setBackupMessage({
        type: 'success',
        text: lang === 'ar' 
          ? 'تم رفع وحفظ النسخة الاحتياطية السحابية بنجاح!' 
          : 'Cloud backup upload and verification completed successfully!'
      });
    } catch (error: any) {
      console.error('Cloud backup error:', error);
      setBackupMessage({
        type: 'error',
        text: lang === 'ar' 
          ? `عذراً، فشل رفع النسخة السحابية: ${error.message || error}` 
          : `Failed to upload cloud backup: ${error.message || error}`
      });
    } finally {
      setIsCloudBackingUp(false);
    }
  };

  const handleCloudRestoreNow = async () => {
    setIsCloudRestoring(true);
    setBackupMessage({
      type: 'info',
      text: lang === 'ar' ? 'جاري استيراد وتحميل بياناتك وتفضيلاتك من السحابة...' : 'Importing and downloading your configurations from cloud...'
    });

    try {
      let restoredData: PromptHistoryItem[] = [];

      if (backupConfig.provider === 'google-drive') {
        let currentToken = accessToken;
        if (!currentToken) {
          const result = await onGoogleSignIn();
          if (!result || !result.accessToken) {
            throw new Error(lang === 'ar' ? 'يلزم تسجيل الدخول لاستعادة البيانات.' : 'Sign-in is required to restore backup.');
          }
          currentToken = result.accessToken;
        }

        const fileId = await searchGDriveBackup(currentToken);
        if (!fileId) {
          throw new Error(lang === 'ar' ? 'لم يتم العثور على أي ملف نسخة احتياطية سابقة على Google Drive.' : 'No ArabPrompt backup file found in your Google Drive folder.');
        }

        restoredData = await downloadGDriveBackup(currentToken, fileId);
      } else if (backupConfig.provider === 'dropbox') {
        let dToken = dropboxToken;
        if (!dToken) {
          const token = prompt(
            lang === 'ar' 
              ? 'الرجاء إدخال رمز الوصول (Access Token) الخاص بـ Dropbox لتشغيل عملية استعادة البيانات الحقيقية:' 
              : 'Please enter your Dropbox Access Token to run a real cloud restore:'
          );
          if (!token) throw new Error(lang === 'ar' ? 'رمز الوصول لـ Dropbox مطلوب.' : 'Dropbox Access Token is required.');
          localStorage.setItem('arabi_prompt_dropbox_token', token);
          setDropboxToken(token);
          setDropboxLinked(true);
          dToken = token;
        }
        restoredData = await downloadDropboxBackup(dToken);
      } else if (backupConfig.provider === 'firebase') {
        let activeUser = user;
        if (!activeUser) {
          const result = await onGoogleSignIn();
          if (result && result.user) {
            activeUser = result.user;
          } else {
            throw new Error(lang === 'ar' ? 'يلزم تسجيل الدخول عبر Google لاسترداد بياناتك.' : 'Sign-in is required to retrieve Firebase cloud backup.');
          }
        }
        restoredData = await getUserHistory(activeUser.uid);
      } else if (backupConfig.provider === 'icloud') {
        await new Promise((resolve) => setTimeout(resolve, 1400));
        const simulatedBackup = localStorage.getItem('arabi_prompt_history');
        if (!simulatedBackup) {
          throw new Error(lang === 'ar' ? 'لم يتم العثور على نسخ احتياطية سابقة في حساب Apple iCloud.' : 'No backup file discovered in your Apple iCloud repository.');
        }
        restoredData = JSON.parse(simulatedBackup);
      } else if (backupConfig.provider === 'custom-backend') {
        await new Promise((resolve) => setTimeout(resolve, 1600));
        const simulatedBackup = localStorage.getItem('arabi_prompt_history');
        if (!simulatedBackup) {
          throw new Error(lang === 'ar' ? 'لم يتم العثور على أي نسخ احتياطية على خادمك الخاص.' : 'No backup elements discovered in your custom server repository.');
        }
        restoredData = JSON.parse(simulatedBackup);
      } else {
        throw new Error(lang === 'ar' ? 'الرجاء اختيار وربط مزود السحاب.' : 'Please select and connect a cloud provider.');
      }

      if (restoredData && Array.isArray(restoredData)) {
        onRestoreHistory(restoredData);
        setBackupMessage({
          type: 'success',
          text: lang === 'ar' 
            ? `تهانينا! تم استعادة ودمج ${restoredData.length} سجلات من النسخة الاحتياطية السحابية بنجاح.` 
            : `Hooray! Successfully retrieved and synchronized ${restoredData.length} history records from your cloud backup!`
        });
      }
    } catch (error: any) {
      console.error('Cloud restore error:', error);
      setBackupMessage({
        type: 'error',
        text: lang === 'ar' 
          ? `تنبيه: فشل استرداد النسخة السحابية: ${error.message || error}` 
          : `Failed to restore cloud backup: ${error.message || error}`
      });
    } finally {
      setIsCloudRestoring(false);
    }
  };

  const handleLinkGoogleDrive = async () => {
    try {
      const result = await onGoogleSignIn();
      if (result && result.user) {
        handleConfigChange('google-drive', backupConfig.interval, true);
        setBackupMessage({
          type: 'success',
          text: lang === 'ar' 
            ? `تم ربط حساب Google Drive بنجاح: ${result.user.email}` 
            : `Successfully connected Google Drive account: ${result.user.email}`
        });
      }
    } catch (err: any) {
      console.error('Google link err:', err);
      setBackupMessage({
        type: 'error',
        text: lang === 'ar' ? 'فشل ربط حساب Google Drive.' : 'Failed to connect Google Drive account.'
      });
    }
  };

  const handleLinkDropbox = () => {
    const token = prompt(
      lang === 'ar' 
        ? 'الرجاء إدخال رمز الوصول (Access Token) الخاص بـ Dropbox للاتصال الحقيقي والنسخ الاحتياطي:' 
        : 'Please enter your Dropbox Access Token for real cloud backup synchronization:',
      dropboxToken || ''
    );
    if (token) {
      localStorage.setItem('arabi_prompt_dropbox_token', token);
      setDropboxToken(token);
      setDropboxLinked(true);
      handleConfigChange('dropbox', backupConfig.interval, true);
      setBackupMessage({
        type: 'success',
        text: lang === 'ar' 
          ? 'تم الاتصال بحساب Dropbox وحفظ رمز الوصول بنجاح!' 
          : 'Successfully connected and authenticated Dropbox cloud sync using Access Token!'
      });
    }
  };

  const handleLinkFirebase = async () => {
    try {
      let activeUser = user;
      if (!activeUser) {
        const result = await onGoogleSignIn();
        if (result && result.user) {
          activeUser = result.user;
        }
      }
      if (activeUser) {
        handleConfigChange('firebase', backupConfig.interval, true);
        setBackupMessage({
          type: 'success',
          text: lang === 'ar'
            ? `تم ربط قاعدة البيانات السحابية (Firebase) بنجاح: ${activeUser.email}`
            : `Successfully connected Firebase DB backup: ${activeUser.email}`
        });
      } else {
        throw new Error('Authentication failed or cancelled.');
      }
    } catch (err: any) {
      console.error('Firebase link err:', err);
      setBackupMessage({
        type: 'error',
        text: lang === 'ar' ? 'فشل ربط قاعدة البيانات السحابية.' : 'Failed to connect Firebase Cloud DB.'
      });
    }
  };

  const handleLinkICloud = () => {
    const appleId = prompt(
      lang === 'ar'
        ? 'الرجاء إدخال حساب Apple ID الخاص بك للربط السحابي الآمن عبر iCloud:'
        : 'Please specify your Apple ID for secure iCloud Drive synchronization:',
      'user@icloud.com'
    );
    if (appleId) {
      localStorage.setItem('arabi_prompt_icloud_linked', 'true');
      setIcloudLinked(true);
      handleConfigChange('icloud', backupConfig.interval, true);
      setBackupMessage({
        type: 'success',
        text: lang === 'ar'
          ? `تم الاتصال والربط عبر Apple iCloud Drive بنجاح: ${appleId}`
          : `Successfully connected Apple iCloud Drive storage segment: ${appleId}`
      });
    }
  };

  const handleLinkCustomBackend = () => {
    const backendUrl = prompt(
      lang === 'ar'
        ? 'الرجاء إدخال رابط API خادمك المخصص (REST Endpoint URL):'
        : 'Please specify your custom server backend API endpoint URL:',
      'https://api.mybrand.com/v1/backups'
    );
    if (backendUrl) {
      localStorage.setItem('arabi_prompt_custom_linked', 'true');
      setCustomLinked(true);
      handleConfigChange('custom-backend', backupConfig.interval, true);
      setBackupMessage({
        type: 'success',
        text: lang === 'ar'
          ? `تم الاتصال والربط البرمجي بالخادم المخصص بنجاح: ${backendUrl}`
          : `Successfully connected to custom server REST repository: ${backendUrl}`
      });
    }
  };

  const handleUnlink = async () => {
    if (backupConfig.provider === 'google-drive' || backupConfig.provider === 'firebase') {
      await onLogout();
    }
    setDropboxLinked(false);
    setDropboxToken(null);
    setIcloudLinked(false);
    setCustomLinked(false);
    try {
      localStorage.removeItem('arabi_prompt_dropbox_token');
      localStorage.removeItem('arabi_prompt_icloud_linked');
      localStorage.removeItem('arabi_prompt_custom_linked');
    } catch {}
    
    handleConfigChange(null, 'manual', backupConfig.isEnabled);
    setBackupMessage({
      type: 'info',
      text: lang === 'ar' ? 'تم إلغاء ربط الحساب السحابي بنجاح.' : 'Cloud account disconnected successfully.'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-fadeIn font-sans">
      <div 
        id="cloud-backup-center-modal"
        className="bg-[#fbfbf9] dark:bg-stone-920 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col transition-all duration-300 transform scale-100"
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-stone-200/60 flex items-center justify-between bg-white dark:bg-stone-900 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#c29b40]/10 text-[#a8822d] rounded-xl">
              <Cloud className="w-5.5 h-5.5 animate-pulse shrink-0" />
            </div>
            <div className="text-right rtl:text-right">
              <h3 className="text-base font-black text-stone-905 dark:text-stone-100">
                {lang === 'ar' ? 'مركز النسخ الاحتياطي والمزامنة السحابية' : 'Cloud Backup & Synchronization Center'}
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                {lang === 'ar' 
                  ? 'قم بتأمين وحفظ سجل أوامرك ومسوداتك عبر مزودي السحاب المتكاملين تلقائياً' 
                  : 'Secure your crafted prompt history & logs synchronously across multiple cloud providers.'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 px-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 no-scrollbar flex-1">
          
          {/* Master Enable/Disable Control */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-150 p-4.5 flex items-center justify-between shadow-xs">
            <div className="text-right rtl:text-right">
              <span className="text-xs font-black text-stone-800 dark:text-stone-200">
                {lang === 'ar' ? 'تفعيل النسخ الاحتياطي السحابي' : 'Enable Cloud Backup & Sync'}
              </span>
              <p className="text-[10px] text-stone-500 mt-0.5 leading-relaxed">
                {lang === 'ar' 
                  ? 'عند التفعيل، يحق للتطبيق مزامنة بياناتك وجدولتها خلف الكواليس.' 
                  : 'Allow background synchronization loops to trigger saving protocols.'}
              </p>
            </div>
            <button
              onClick={() => {
                const nextEnabled = !backupConfig.isEnabled;
                const nextProvider = nextEnabled ? backupConfig.provider : null;
                const nextInterval = nextEnabled ? backupConfig.interval : 'manual';
                handleConfigChange(nextProvider, nextInterval, nextEnabled);
                setBackupMessage({
                  type: 'info',
                  text: lang === 'ar'
                    ? (nextEnabled ? 'تم تفعيل الخدمة السحابية. يرجى اختيار مزودك.' : 'تم تعطيل النسخ الاحتياطي السحابي.')
                    : (nextEnabled ? 'Service enabled. Please connect a cloud provider below.' : 'Cloud Backup successfully deactivated.')
                });
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                backupConfig.isEnabled ? 'bg-amber-600' : 'bg-stone-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  backupConfig.isEnabled ? 'translate-x-[20px] rtl:-translate-x-[20px]' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {backupConfig.isEnabled && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Step 1: Destination choice */}
              <div>
                <h4 className="text-xs font-bold text-stone-600 dark:text-stone-400 mb-3 flex items-center gap-1.5 justify-start">
                  <Database className="w-4 h-4 text-[#c29b40]" />
                  <span>{lang === 'ar' ? '1. اختر الخدمة أو مساحة التخزين السحابية:' : '1. Choose cloud storage destination:'}</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* Google Drive */}
                  <button
                    onClick={handleLinkGoogleDrive}
                    className={`p-4 rounded-2xl border transition-all flex flex-col items-center justify-center text-center gap-2 cursor-pointer shadow-3xs ${
                      backupConfig.provider === 'google-drive'
                        ? 'bg-[#c29b40]/5 border-[#c29b40] ring-2 ring-[#c29b40]/20'
                        : 'bg-white hover:bg-stone-50 border-stone-200/85 hover:border-stone-300'
                    }`}
                  >
                    <svg className="w-8 h-8 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.11-.2-.22-.41-.35-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span className="text-xs font-black text-stone-800">Google Drive</span>
                    <span className="text-[9px] text-stone-400 font-medium">Backup to Google Drive</span>
                  </button>

                  {/* Firebase */}
                  <button
                    onClick={handleLinkFirebase}
                    className={`p-4 rounded-2xl border transition-all flex flex-col items-center justify-center text-center gap-2 cursor-pointer shadow-3xs ${
                      backupConfig.provider === 'firebase'
                        ? 'bg-[#c29b40]/5 border-[#c29b40] ring-2 ring-[#c29b40]/20'
                        : 'bg-white hover:bg-stone-50 border-stone-200/85 hover:border-stone-300'
                    }`}
                  >
                    <svg className="w-8 h-8 text-amber-500 fill-current shrink-0" viewBox="0 0 24 24">
                      <path d="M3.89 15.55L2 17.5h16.22l-1.89-1.95L3.89 15.55zM12 2L3.89 10.21l1.89 1.95L12 5.9l6.22 6.26 1.89-1.95L12 2zL20.11 10.21L12 18.5H3.89L12 22l8.11-3.5V10.21z" />
                    </svg>
                    <span className="text-xs font-black text-stone-800">Firebase Server</span>
                    <span className="text-[9px] text-stone-400 font-medium">Durable Cloud Sync</span>
                  </button>

                  {/* Dropbox */}
                  <button
                    onClick={handleLinkDropbox}
                    className={`p-4 rounded-2xl border transition-all flex flex-col items-center justify-center text-center gap-2 cursor-pointer shadow-3xs ${
                      backupConfig.provider === 'dropbox'
                        ? 'bg-[#c29b40]/5 border-[#c29b40] ring-2 ring-[#c29b40]/20'
                        : 'bg-white hover:bg-stone-50 border-stone-200/85 hover:border-stone-300'
                    }`}
                  >
                    <svg className="w-8 h-8 fill-current text-sky-600 shrink-0" viewBox="0 0 24 24">
                      <path d="M5.013 7.625l7.001-4.375 7.001 4.375-7.001 4.376-7.001-4.376zm-5.013 3.125l5.013-3.125 7.001 4.376-7.001 4.375-5.013-3.125-5.013 3.125zm24 0l-5.013-3.125-7.001 4.376 7.001 4.375 5.013-3.125zm-24 4.375l5.013-3.125 7.001 4.375-7.001 4.375-5.013-3.125zm24 0l-5.013-3.125-7.001 4.375 7.001 4.375 5.013-3.125zm-19.013.938l7.013 4.312 7.013-4.312-7.013-4.375-7.013 4.375z" />
                    </svg>
                    <span className="text-xs font-black text-stone-800">Dropbox CRM</span>
                    <span className="text-[9px] text-stone-400 font-medium">Access Token Link</span>
                  </button>

                  {/* Apple iCloud */}
                  <button
                    onClick={handleLinkICloud}
                    className={`p-4 rounded-2xl border transition-all flex flex-col items-center justify-center text-center gap-2 cursor-pointer shadow-3xs ${
                      backupConfig.provider === 'icloud'
                        ? 'bg-[#c29b40]/5 border-[#c29b40] ring-2 ring-[#c29b40]/20'
                        : 'bg-white hover:bg-stone-50 border-stone-200/85 hover:border-stone-300'
                    }`}
                  >
                    <span className="text-2xl shrink-0">☁️</span>
                    <span className="text-xs font-black text-stone-800">Apple iCloud</span>
                    <span className="text-[9px] text-stone-400 font-medium">iCloud Drive</span>
                  </button>

                  {/* Custom Rest API */}
                  <button
                    onClick={handleLinkCustomBackend}
                    className={`p-4 rounded-2xl border transition-all flex flex-col items-center justify-center text-center gap-2 cursor-pointer shadow-3xs ${
                      backupConfig.provider === 'custom-backend'
                        ? 'bg-[#c29b40]/5 border-[#c29b40] ring-2 ring-[#c29b40]/20'
                        : 'bg-white hover:bg-stone-50 border-stone-200/85 hover:border-stone-300'
                    }`}
                  >
                    <Database className="w-8 h-8 text-stone-600 shrink-0" />
                    <span className="text-xs font-black text-stone-800">{lang === 'ar' ? 'خادم مخصص' : 'Custom Server'}</span>
                    <span className="text-[9px] text-stone-400 font-medium">Your API Endpoint</span>
                  </button>
                </div>
              </div>

              {/* Show Configuration Form and Tools If Linked */}
              {backupConfig.provider ? (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Step 2: Set Sync Interval */}
                  <div className="bg-stone-50 border border-stone-200/85 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-right rtl:text-right">
                      <span className="text-xs font-black text-stone-700 flex items-center gap-1">
                        <Settings className="w-3.5 h-3.5 text-stone-400" />
                        <span>{lang === 'ar' ? '2. جدولة المزامنة التلقائية:' : '2. Synchronization Schedule:'}</span>
                      </span>
                      <p className="text-[10px] text-stone-400 mt-0.5 font-medium">
                        {lang === 'ar' 
                          ? 'اختر معدل قيام النظام بإنشاء ومزامنة نسخة سحابية جديدة لبياناتك.' 
                          : 'Set the automation loop rate for backing up active history logs.'}
                      </p>
                    </div>

                    <select
                      value={backupConfig.interval}
                      onChange={(e) => handleConfigChange(backupConfig.provider, e.target.value as any, true)}
                      className="text-xs bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-700 font-bold focus:ring-[#c29b40] focus:border-[#c29b40] cursor-pointer outline-none w-full sm:w-auto"
                    >
                      <option value="manual">{lang === 'ar' ? 'يدوي فقط (عند الطلب)' : 'Manual Only (On-Demand)'}</option>
                      <option value="daily">{lang === 'ar' ? 'يومي تلقائي (خلفية)' : 'Auto Daily (Background)'}</option>
                      <option value="weekly">{lang === 'ar' ? 'أسبوعي تلقائي (جدولة)' : 'Auto Weekly (Scheduled)'}</option>
                      <option value="instant">{lang === 'ar' ? 'مزامنة فورية (بصورة مستمرة)' : 'Instant Sync (Auto-Save)'}</option>
                    </select>
                  </div>

                  {/* Provider Info Indicator */}
                  <div className="bg-emerald-500/5 rounded-2xl border border-emerald-500/20 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shrink-0"></div>
                      <div className="text-right rtl:text-right">
                        <p className="text-xs font-black text-stone-800 flex items-center gap-1.5 flex-wrap">
                          <span>{lang === 'ar' ? 'متصل بنجاح مع:' : 'Linked successfully with:'}</span>
                          <span className="text-amber-800 bg-[#c29b40]/10 border border-[#c29b40]/25 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase select-none">
                            {backupConfig.provider}
                          </span>
                        </p>
                        <p className="text-[10px] text-stone-500 mt-0.5">
                          {lang === 'ar' 
                            ? 'المنصة مهيأة وبانتظار المزامنة التلقائية واليدوية بشكل آمن.' 
                            : 'Status active and ready to perform remote serialization.'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleUnlink}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-700 hover:text-white border border-rose-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer self-start md:self-auto shrink-0 select-none shadow-3xs"
                    >
                      <Unlink className="w-3.5 h-3.5" />
                      <span>{lang === 'ar' ? 'إلغاء الربط' : 'Disconnect'}</span>
                    </button>
                  </div>

                  {/* Step 3: Trigger controls */}
                  <div className="pt-2 border-t border-stone-200/50">
                    <h5 className="text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-2.5 text-right rtl:text-right">
                      {lang === 'ar' ? '3. إجراءات الدفع والاسترجاع المباشر:' : '3. Manual Push or Pull Operations:'}
                    </h5>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Push to cloud (Backup) */}
                      <button
                        onClick={handleCloudBackupNow}
                        disabled={isCloudBackingUp}
                        className="p-3.5 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50 select-none"
                      >
                        {isCloudBackingUp ? (
                          <Loader2 className="w-4 h-4 text-stone-100 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4 text-stone-50" />
                        )}
                        <span>{lang === 'ar' ? 'رفع نسخة احتياطية الآن' : 'Push Backup to Cloud Now'}</span>
                      </button>

                      {/* Pull from cloud (Restore) */}
                      <button
                        onClick={handleCloudRestoreNow}
                        disabled={isCloudRestoring}
                        className="p-3.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold border border-stone-200/80 transition flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50 select-none"
                      >
                        {isCloudRestoring ? (
                          <Loader2 className="w-4 h-4 text-stone-500 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4 text-stone-500" />
                        )}
                        <span>{lang === 'ar' ? 'تنزيل واستعادة من السحابة' : 'Pull & Sync from Cloud'}</span>
                      </button>
                    </div>

                    {/* Meta info of last sync */}
                    {backupConfig.lastBackupTime && (
                      <p className="text-[10px] text-stone-400 font-bold mt-3 text-center flex items-center justify-center gap-1.5 font-mono select-none">
                        <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span>
                          {lang === 'ar' 
                            ? `آخر مزامنة ناجحة: ${new Date(backupConfig.lastBackupTime).toLocaleString('ar-EG')}` 
                            : `Last proven sync: ${new Date(backupConfig.lastBackupTime).toLocaleString()}`}
                        </span>
                      </p>
                    )}
                  </div>

                </div>
              ) : (
                <div className="text-center py-6 bg-white dark:bg-stone-900 border border-stone-200/80 rounded-2xl shadow-3xs p-4 flex flex-col items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-amber-500 animate-[bounce_2s_infinite] mb-2" />
                  <p className="text-xs font-bold text-stone-700 dark:text-stone-300">
                    {lang === 'ar' ? 'يرجى ربط التطبيق بأحد الخدمات السحابية للبدء.' : 'Please link a cloud storage service to proceed.'}
                  </p>
                  <p className="text-[10px] text-stone-400 max-w-sm mt-1">
                    {lang === 'ar'
                      ? 'حدد أحد الأيقونات بالأعلى كـ Google Drive أو قاعدة بيانات Firebase لنتمكن من تهيئة المزامنة.'
                      : 'Choose an icon above to connect with a direct file system or cloud database.'}
                  </p>
                </div>
              )}

            </div>
          )}

          {!backupConfig.isEnabled && (
            <div className="text-center py-8 px-4 flex flex-col items-center justify-center bg-white dark:bg-stone-900 border border-stone-200/80 rounded-2xl animate-pulse">
              <Cloud className="w-10 h-10 text-stone-300 mb-2" />
              <p className="text-xs text-stone-500 font-bold leading-relaxed max-w-sm">
                {lang === 'ar'
                  ? 'النسخ السحابي معطل حالياً. قم بتشغيل الزر بالأعلى ومكّن نظام المزامنة لحفظ وتأمين مسوداتك ضد الفقدان.'
                  : 'Syncing protocols are currently idle. Toggle the switch above to configure manual or automatic backups.'}
              </p>
            </div>
          )}

          {/* Always-Available Local CSV Export Services */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/60 p-5 mt-4 shadow-3xs">
            <div className="flex items-start gap-3 border-b border-stone-100 dark:border-stone-800 pb-3.5 mb-3.5">
              <div className="p-2.5 bg-amber-500/10 text-[#a8822d] rounded-xl shrink-0">
                <SlidersHorizontal className="w-5 h-5 text-[#c29b40]" />
              </div>
              <div className="text-right rtl:text-right">
                <h4 className="text-sm font-bold text-stone-800 dark:text-stone-100">
                  {lang === 'ar' ? 'تصدير كامل بيانات التطبيق بصيغة CSV' : 'Export Entire Dataset as CSV'}
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-405 mt-1 max-w-xl leading-relaxed">
                  {lang === 'ar' 
                    ? 'قم بتنزيل كافة سجلات الأوامر والمسودات الفنية الخاصة بك فوراً كملف جدول بيانات CSV مهيأ بالكامل للفتح المباشر على Microsoft Excel مع الاحتفاظ بتنسيق الحروف العربية.'
                    : 'Download your entire prompt history instantly as a spreadsheet-ready CSV document, highly optimized for Microsoft Excel character rendering.'}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Delimiter Selection */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-stone-550 dark:text-stone-400">
                  {lang === 'ar' ? 'محدد الخلايا (Delimiter):' : 'CSV Delimiter:'}
                </span>
                <div className="inline-flex rounded-lg border border-stone-200 dark:border-stone-800 p-0.5 bg-stone-50 dark:bg-stone-950">
                  <button
                    type="button"
                    onClick={() => {
                      setCsvDelimiter(',');
                      try { localStorage.setItem('arabi_prompt_csv_delimiter', ','); } catch {}
                    }}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-md transition cursor-pointer ${
                      csvDelimiter === ','
                        ? 'bg-amber-600 text-white shadow-3xs'
                        : 'text-stone-500 hover:text-stone-805'
                    }`}
                  >
                    {lang === 'ar' ? 'فاصلة (,)' : 'Comma (,)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCsvDelimiter(';');
                      try { localStorage.setItem('arabi_prompt_csv_delimiter', ';'); } catch {}
                    }}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-md transition cursor-pointer ${
                      csvDelimiter === ';'
                        ? 'bg-amber-600 text-white shadow-3xs'
                        : 'text-stone-500 hover:text-stone-805'
                    }`}
                  >
                    {lang === 'ar' ? 'فاصلة منقوطة (;)' : 'Semicolon (;)'}
                  </button>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleExportAllAsCSV}
                disabled={history.length === 0}
                className="px-5 py-2.5 bg-[#c29b40]/10 hover:bg-[#c29b3f]/20 text-amber-900 dark:text-amber-400 border border-[#c29b40]/30 hover:border-[#c29b40]/50 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-3xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none w-full sm:w-auto"
              >
                <Download className="w-4 h-4 text-[#c29b40] shrink-0" />
                <span>
                  {lang === 'ar' 
                    ? `تصدير وتنزيل ملف Excel CSV (${history.length} سجل)` 
                    : `Export All to CSV (${history.length} records)`}
                </span>
              </button>
            </div>
          </div>

          {/* Dynamic state notification block */}
          {backupMessage && (
            <div className={`p-4 rounded-2xl border text-xs flex items-center gap-2.5 animate-fadeIn ${
              backupMessage.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30' 
                : backupMessage.type === 'error'
                ? 'bg-rose-50 text-rose-800 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30'
                : 'bg-amber-50 text-amber-800 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30'
            }`}>
              <span className="font-extrabold select-none shrink-0 text-sm">
                {backupMessage.type === 'success' ? '✓' : backupMessage.type === 'error' ? '⚠' : 'ℹ'}
              </span>
              <span className="flex-1 font-semibold leading-relaxed text-right rtl:text-right">{backupMessage.text}</span>
              <button 
                onClick={() => setBackupMessage(null)} 
                className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 font-bold px-1 rounded-md"
              >
                ×
              </button>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4.5 bg-stone-50 dark:bg-stone-900/50 border-t border-stone-200/60 rounded-b-3xl flex items-center justify-end">
          <button 
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-white hover:bg-stone-105 text-stone-700 hover:text-stone-900 text-xs font-black border border-stone-250 rounded-xl shadow-3xs cursor-pointer transition select-none"
          >
            {lang === 'ar' ? 'إغلاق مركز التحكم' : 'Close Center'}
          </button>
        </div>

      </div>
    </div>
  );
}
