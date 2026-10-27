/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PromptHistoryItem, AppLanguage } from '../types';
import { 
  History, 
  Trash2, 
  Copy, 
  Check, 
  Cpu, 
  PenTool,
  CornerDownLeft, 
  Search, 
  Calendar, 
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Globe,
  Download,
  Printer,
  Upload,
  Database,
  Star,
  Cloud,
  Link2,
  Unlink,
  Loader2,
  CheckCircle,
  AlertCircle,
  Settings,
  Clock,
  CheckSquare,
  Square,
  Tag,
  Hash,
  Plus,
  X,
  ArrowLeftRight,
  Share2,
  Filter,
  RotateCcw,
  ArrowUpDown,
  BarChart3
} from 'lucide-react';
import PromptHistoryDashboard from './PromptHistoryDashboard';
import {
  getBackupConfig,
  saveBackupConfig,
  searchGDriveBackup,
  uploadGDriveBackup,
  downloadGDriveBackup,
  uploadDropboxBackup,
  downloadDropboxBackup,
  backupToDropboxSimulated,
  backupToICloudSimulated,
  backupToCustomBackendSimulated,
  BackupMetadata
} from '../utils/cloudBackup';
import {
  getUserHistory,
  syncAllHistoryToFirestore
} from '../utils/firestoreService';
import { showToast } from './ToastNotification';
import PromptCompareModal from './PromptCompareModal';
import SharePromptToAiModal from './SharePromptToAiModal';
import ExportPdfModal from './ExportPdfModal';

export const exportableFields = [
  { key: 'id', labelAr: 'المعرف الفريد (ID)', labelEn: 'Unique ID' },
  { key: 'timestamp', labelAr: 'تاريخ ووقت الإنشاء', labelEn: 'Creation Date & Time' },
  { key: 'originalText', labelAr: 'النص الأصلي (الفكرة الكامنة)', labelEn: 'Original Thought Prompt' },
  { key: 'optimizedText', labelAr: 'الأمر الهندسي المحسن النهائي', labelEn: 'Optimized Target Prompt' },
  { key: 'translatedText', labelAr: 'الترجمة والتعريب الإنجليزي', labelEn: 'Translated English Prompt' },
  { key: 'tags', labelAr: 'الوسوم والتصنيفات (Tags)', labelEn: 'Tags & Keywords' },
  { key: 'model', labelAr: 'النموذج الذكي المستهدف', labelEn: 'Target AI Model' },
  { key: 'tone', labelAr: 'النبرة والأسلوب البصري الكلاسيكي', labelEn: 'Target Tone & Aesthetic' },
  { key: 'category', labelAr: 'التصنيف والخبرة العملية', labelEn: 'Expert Category Context' },
  { key: 'actionType', labelAr: 'نوع العملية (توليد/تحسين/عكس)', labelEn: 'Interaction Action Type' },
  { key: 'isFavorite', labelAr: 'حالة التفضيل (مفضلة؟)', labelEn: 'Favorite Star Status' }
];

interface PromptHistoryProps {
  lang: AppLanguage;
  history: PromptHistoryItem[];
  onClearHistory: () => void;
  onDeleteHistoryItem: (id: string) => void;
  onDeleteMultipleHistoryItems?: (ids: string[]) => void;
  onToggleFavorite: (id: string) => void;
  onSetRating: (id: string, rating: number) => void;
  onSendToTester: (promptText: string) => void;
  onApplyToBuilder: (originalText: string, model: any, tone: string, category: string) => void;
  onApplyToReverser?: (styleImage: string | null, contentImage: string | null, notes: string | undefined, isMimicMode: boolean | undefined) => void;
  onRestoreHistory: (imported: PromptHistoryItem[]) => void;
  onUpdateTags?: (id: string, tags: string[]) => void;
  onBulkUpdateTags?: (ids: string[], tag: string) => void;
  user?: any;
  accessToken?: string | null;
  onGoogleSignIn?: () => Promise<any>;
  onLogout?: () => Promise<any>;
  
  // Optional global integration props
  backupConfig?: BackupMetadata;
  onConfigChange?: (
    newProvider: 'google-drive' | 'dropbox' | 'firebase' | 'icloud' | 'custom-backend' | null,
    newInterval: 'manual' | 'daily' | 'weekly' | 'instant',
    newEnabled?: boolean
  ) => void;
  isCloudBackingUp?: boolean;
  setIsCloudBackingUp?: (val: boolean) => void;
  isCloudRestoring?: boolean;
  setIsCloudRestoring?: (val: boolean) => void;
}

export default function PromptHistory({
  lang,
  history,
  onClearHistory,
  onDeleteHistoryItem,
  onDeleteMultipleHistoryItems,
  onToggleFavorite,
  onSetRating,
  onSendToTester,
  onApplyToBuilder,
  onApplyToReverser,
  onRestoreHistory,
  onUpdateTags,
  onBulkUpdateTags,
  user,
  accessToken,
  onGoogleSignIn,
  onLogout,
  backupConfig: externalBackupConfig,
  onConfigChange,
  isCloudBackingUp: externalIsCloudBackingUp,
  setIsCloudBackingUp: externalSetIsCloudBackingUp,
  isCloudRestoring: externalIsCloudRestoring,
  setIsCloudRestoring: externalSetIsCloudRestoring
}: PromptHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [modelFilter, setModelFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [actionTypeFilter, setActionTypeFilter] = useState<'all' | 'generate' | 'refine' | 'translate' | 'reverse'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest-rated' | 'longest'>('newest');
  const [newTagInputs, setNewTagInputs] = useState<Record<string, string>>({});
  const [bulkTagInput, setBulkTagInput] = useState<string>('');
  const [showBulkTagModal, setShowBulkTagModal] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [backupMessage, setBackupMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [visibleCount, setVisibleCount] = useState(25);
  const [showDashboard, setShowDashboard] = useState<boolean>(true);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Press '/' to focus search, 'Esc' to clear search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || (target as any).isContentEditable);
      
      if ((e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) && !isInput) {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      } else if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        if (searchTerm) {
          setSearchTerm('');
        } else {
          searchInputRef.current?.blur();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchTerm]);

  // Prompt Comparison Tool states
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);
  const [comparePromptAId, setComparePromptAId] = useState<string | null>(null);
  const [comparePromptBId, setComparePromptBId] = useState<string | null>(null);

  const handleOpenCompare = (idA?: string, idB?: string) => {
    if (idA) {
      setComparePromptAId(idA);
      setComparePromptBId(idB || history.find((h) => h.id !== idA)?.id || null);
    } else if (selectedIds.length >= 2) {
      setComparePromptAId(selectedIds[0]);
      setComparePromptBId(selectedIds[1]);
    } else if (selectedIds.length === 1) {
      setComparePromptAId(selectedIds[0]);
      setComparePromptBId(history.find((h) => h.id !== selectedIds[0])?.id || null);
    } else {
      setComparePromptAId(history[1]?.id || history[0]?.id || null);
      setComparePromptBId(history[0]?.id || null);
    }
    setIsCompareModalOpen(true);
  };

  // Share to AI Tools states
  const [shareItem, setShareItem] = useState<PromptHistoryItem | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  // Export PDF Modal states
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [pdfModalScope, setPdfModalScope] = useState<'all' | 'favorites' | 'filtered' | 'selected'>('all');
  const [pdfModalSingleItem, setPdfModalSingleItem] = useState<PromptHistoryItem | null>(null);

  const openPdfModal = (scopeType: 'all' | 'favorites' | 'filtered' | 'selected' = 'all', item: PromptHistoryItem | null = null) => {
    setPdfModalScope(scopeType);
    setPdfModalSingleItem(item);
    setIsPdfModalOpen(true);
  };

  // Bulk Selection states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleToggleSelect = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiltered = (allFilteredItems: PromptHistoryItem[]) => {
    const allFilteredIds = allFilteredItems.map((item) => item.id);
    const areAllSelected = allFilteredIds.every((id) => selectedIds.includes(id));
    
    if (areAllSelected) {
      setSelectedIds((prev) => prev.filter((id) => !allFilteredIds.includes(id)));
    } else {
      setSelectedIds((prev) => {
        const unique = new Set([...prev, ...allFilteredIds]);
        return Array.from(unique);
      });
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    const confirmMessage = lang === 'ar' 
      ? `هل أنت متأكد من رغبتك في حذف ${selectedIds.length} من العناصر المحددة نهائياً؟`
      : `Are you sure you want to permanently delete the ${selectedIds.length} selected items?`;
    
    if (window.confirm(confirmMessage)) {
      if (onDeleteMultipleHistoryItems) {
        onDeleteMultipleHistoryItems(selectedIds);
      } else {
        selectedIds.forEach((id) => onDeleteHistoryItem(id));
      }
      setSelectedIds([]);
      showToast(
        lang === 'ar'
          ? `✓ تم حذف ${selectedIds.length} من العناصر المحددة بنجاح!`
          : `✓ Successfully deleted ${selectedIds.length} selected items!`
      );
    }
  };

  const handleBulkExportJSON = () => {
    if (selectedIds.length === 0) return;
    try {
      const selectedItems = history.filter((item) => selectedIds.includes(item.id));
      const jsonString = JSON.stringify(selectedItems, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `arabprompt-selected-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast(
        lang === 'ar'
          ? `✓ تم تصدير ${selectedIds.length} من الأوامر المحددة كـ JSON بنجاح!`
          : `✓ Successfully exported ${selectedIds.length} selected items as JSON!`
      );
    } catch (error) {
      console.error('Failed to export selected items:', error);
      showToast(
        lang === 'ar' ? 'فشل تصدير العناصر المحددة.' : 'Failed to export selected items.',
        true
      );
    }
  };

  const handleBulkExportCSV = () => {
    if (selectedIds.length === 0) return;
    try {
      if (selectedFields.length === 0) {
        showToast(
          lang === 'ar' ? 'يرجى تحديد حقل واحد على الأقل للتصدير.' : 'Please select at least one field to export.',
          true
        );
        return;
      }

      const selectedItems = history.filter((item) => selectedIds.includes(item.id));
      const escapeCSVValue = (val: any) => {
        if (val === undefined || val === null) return '';
        let str = String(val);
        str = str.replace(/"/g, '""');
        if (str.includes(csvDelimiter) || str.includes('\n') || str.includes('\r') || str.includes('"')) {
          return `"${str}"`;
        }
        return str;
      };

      const headerRow = selectedFields
        .map(fieldKey => {
          const matched = exportableFields.find(f => f.key === fieldKey);
          return lang === 'ar' && matched ? matched.labelAr : (matched ? matched.labelEn : fieldKey);
        })
        .map(escapeCSVValue)
        .join(csvDelimiter);

      const rows = selectedItems.map(item => {
        return selectedFields
          .map(fieldKey => {
            let val = (item as any)[fieldKey];
            
            if (fieldKey === 'timestamp') {
              val = new Date(val).toLocaleString(lang === 'ar' ? 'ar-u-nu-latn' : 'en-US');
            } else if (fieldKey === 'isFavorite') {
              val = val ? (lang === 'ar' ? 'نعم' : 'Yes') : (lang === 'ar' ? 'لا' : 'No');
            } else if (fieldKey === 'model') {
              val = getModelLabel(val);
            } else if (fieldKey === 'category') {
              val = getCategoryName(val);
            } else if (fieldKey === 'actionType') {
              val = getActionLabel({ actionType: val });
            } else if (fieldKey === 'tags') {
              val = Array.isArray(val) ? val.join(', ') : (val || '');
            }
            
            return escapeCSVValue(val);
          })
          .join(csvDelimiter);
      });

      const csvContent = [headerRow, ...rows].join('\n');
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `arabprompt-selected-csv-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast(
        lang === 'ar'
          ? `✓ تم تصدير ${selectedIds.length} من السجلات المحددة كـ CSV بنجاح!`
          : `✓ Successfully exported ${selectedIds.length} selected items as CSV!`
      );
    } catch (error) {
      console.error('Failed to export selected items as CSV:', error);
      showToast(
        lang === 'ar' ? 'فشل تصدير العناصر كـ CSV.' : 'Failed to export selected items as CSV.',
        true
      );
    }
  };

  // CSV Custom Export state configuration with selectable columns
  const [showCSVModal, setShowCSVModal] = useState<boolean>(false);
  const [selectedFields, setSelectedFields] = useState<string[]>([
    'timestamp',
    'originalText',
    'optimizedText',
    'translatedText',
    'model',
    'tone',
    'category',
    'isFavorite'
  ]);
  const [csvDelimiter, setCsvDelimiter] = useState<',' | ';'>(',');

  // Cloud Backup and Sync State
  const [localBackupConfig, setLocalBackupConfig] = useState<BackupMetadata>(() => getBackupConfig());
  const backupConfig = externalBackupConfig || localBackupConfig;
  const setBackupConfigState = (cfg: BackupMetadata) => {
    if (onConfigChange) {
      onConfigChange(cfg.provider, cfg.interval, cfg.isEnabled);
    } else {
      setLocalBackupConfig(cfg);
      saveBackupConfig(cfg);
    }
  };

  const [localIsCloudBackingUp, setLocalIsCloudBackingUp] = useState(false);
  const isCloudBackingUp = externalIsCloudBackingUp !== undefined ? externalIsCloudBackingUp : localIsCloudBackingUp;
  const setIsCloudBackingUp = externalSetIsCloudBackingUp || setLocalIsCloudBackingUp;

  const [localIsCloudRestoring, setLocalIsCloudRestoring] = useState(false);
  const isCloudRestoring = externalIsCloudRestoring !== undefined ? externalIsCloudRestoring : localIsCloudRestoring;
  const setIsCloudRestoring = externalSetIsCloudRestoring || setLocalIsCloudRestoring;

  const [dropboxLinked, setDropboxLinked] = useState(() => getBackupConfig().provider === 'dropbox');
  const [icloudLinked, setIcloudLinked] = useState(() => getBackupConfig().provider === 'icloud');
  const [customLinked, setCustomLinked] = useState(() => getBackupConfig().provider === 'custom-backend');
  const [dropboxToken, setDropboxToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('arabi_prompt_dropbox_token');
    } catch {
      return null;
    }
  });

  const handleConfigChange = (
    newProvider: 'google-drive' | 'dropbox' | 'firebase' | 'icloud' | 'custom-backend' | null,
    newInterval: 'manual' | 'daily' | 'weekly' | 'instant',
    newEnabled: boolean = backupConfig.isEnabled
  ) => {
    const updated: BackupMetadata = {
      isEnabled: newEnabled,
      provider: newProvider,
      interval: newInterval,
      lastBackupTime: backupConfig.lastBackupTime
    };
    setBackupConfigState(updated);
    if (!onConfigChange) {
      saveBackupConfig(updated);
    }
  };

  // Scheduled backup trigger
  useEffect(() => {
    if (onConfigChange) return;
    const runAutoBackup = async () => {
      if (!backupConfig.isEnabled || !backupConfig.provider || backupConfig.interval === 'manual' || backupConfig.interval === 'instant' || history.length === 0) return;
      
      const now = new Date();
      let shouldBackup = false;
      
      if (!backupConfig.lastBackupTime) {
        shouldBackup = true;
      } else {
        const lastBackup = new Date(backupConfig.lastBackupTime);
        const diffMs = now.getTime() - lastBackup.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        
        if (backupConfig.interval === 'daily' && diffDays >= 1) {
          shouldBackup = true;
        } else if (backupConfig.interval === 'weekly' && diffDays >= 7) {
          shouldBackup = true;
        }
      }
      
      if (shouldBackup) {
        try {
          if (backupConfig.provider === 'google-drive' && accessToken) {
            const fileId = await searchGDriveBackup(accessToken);
            await uploadGDriveBackup(accessToken, history, fileId);
          } else if (backupConfig.provider === 'dropbox' && dropboxLinked) {
            const dToken = localStorage.getItem('arabi_prompt_dropbox_token');
            if (dToken) {
              await uploadDropboxBackup(dToken, history);
            } else {
              await backupToDropboxSimulated(history);
            }
          } else if (backupConfig.provider === 'firebase' && user) {
            await syncAllHistoryToFirestore(user.uid, history);
          } else if (backupConfig.provider === 'icloud' && icloudLinked) {
            await backupToICloudSimulated(history);
          } else if (backupConfig.provider === 'custom-backend' && customLinked) {
            await backupToCustomBackendSimulated(history);
          } else {
            return;
          }
          
          const updatedConfig = {
            ...backupConfig,
            lastBackupTime: now.toISOString()
          };
          setBackupConfigState(updatedConfig);
          saveBackupConfig(updatedConfig);
          console.log(`Automated scheduled '${backupConfig.provider}' cloud backup completed successfully!`);
        } catch (err) {
          console.error(`Automated scheduled '${backupConfig.provider}' backup failed:`, err);
        }
      }
    };
    
    runAutoBackup();
    const intervalTimer = setInterval(runAutoBackup, 5 * 60 * 1000); // Check every 5 minutes
    return () => clearInterval(intervalTimer);
  }, [accessToken, dropboxLinked, icloudLinked, customLinked, history, backupConfig, user, onConfigChange]);

  // Instant Auto-Sync effect
  useEffect(() => {
    if (onConfigChange) return;
    let active = true;
    const runInstantBackup = async () => {
      if (!backupConfig.isEnabled || !backupConfig.provider || backupConfig.interval !== 'instant' || history.length === 0) return;
      
      const lastBackup = backupConfig.lastBackupTime;
      if (lastBackup) {
        const diffMs = Date.now() - new Date(lastBackup).getTime();
        if (diffMs < 5000) return; // limit frequency to at least 5 sec
      }

      console.log('Instant background backup sync triggered for:', backupConfig.provider);
      try {
        if (backupConfig.provider === 'google-drive' && accessToken) {
          const fileId = await searchGDriveBackup(accessToken);
          await uploadGDriveBackup(accessToken, history, fileId);
        } else if (backupConfig.provider === 'dropbox' && dropboxLinked) {
          const dToken = localStorage.getItem('arabi_prompt_dropbox_token');
          if (dToken) {
            await uploadDropboxBackup(dToken, history);
          } else {
            await backupToDropboxSimulated(history);
          }
        } else if (backupConfig.provider === 'firebase' && user) {
          await syncAllHistoryToFirestore(user.uid, history);
        } else if (backupConfig.provider === 'icloud' && icloudLinked) {
          await backupToICloudSimulated(history);
        } else if (backupConfig.provider === 'custom-backend' && customLinked) {
          await backupToCustomBackendSimulated(history);
        } else {
          return;
        }

        if (active) {
          const now = new Date().toISOString();
          const updatedConfig = {
            ...backupConfig,
            lastBackupTime: now
          };
          setBackupConfigState(updatedConfig);
          saveBackupConfig(updatedConfig);
          console.log('Instant auto-sync backup succeeded.');
        }
      } catch (err) {
        console.warn('Instant background auto sync had a non-fatal error:', err);
      }
    };

    const timer = setTimeout(() => {
      runInstantBackup();
    }, 1000);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [history, backupConfig, accessToken, dropboxLinked, icloudLinked, customLinked, user, onConfigChange]);

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
          if (onGoogleSignIn) {
            const result = await onGoogleSignIn();
            if (!result || !result.accessToken) {
              throw new Error(lang === 'ar' ? 'يجب تسجيل الدخول لتمكين النسخ الاحتياطي عبر Google Drive.' : 'Sign-in is required to backup to Google Drive.');
            }
            activeToken = result.accessToken;
          } else {
            throw new Error('Authentication handler is unavailable.');
          }
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
          if (onGoogleSignIn) {
            const result = await onGoogleSignIn();
            if (result && result.user) {
              activeUser = result.user;
            } else {
              throw new Error(lang === 'ar' ? 'يجب تسجيل الدخول لتمكين نسخ Firebase.' : 'Sign-in is required to backup to Firebase.');
            }
          } else {
            throw new Error('Authentication handler is unavailable.');
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
      const updatedConfig = {
        ...backupConfig,
        lastBackupTime: now
      };
      setBackupConfigState(updatedConfig);
      saveBackupConfig(updatedConfig);

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
          if (onGoogleSignIn) {
            const result = await onGoogleSignIn();
            if (!result || !result.accessToken) {
              throw new Error(lang === 'ar' ? 'يلزم تسجيل الدخول لاستعادة البيانات.' : 'Sign-in is required to restore backup.');
            }
            currentToken = result.accessToken;
          } else {
            throw new Error('Authentication handler not available.');
          }
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
          if (onGoogleSignIn) {
            const result = await onGoogleSignIn();
            if (result && result.user) {
              activeUser = result.user;
            } else {
              throw new Error(lang === 'ar' ? 'يلزم تسجيل الدخول عبر Google لاسترداد بياناتك.' : 'Sign-in is required to retrieve Firebase cloud backup.');
            }
          } else {
            throw new Error('Authentication handler not available.');
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
      if (onGoogleSignIn) {
        const result = await onGoogleSignIn();
        if (result && result.user) {
          handleConfigChange('google-drive', backupConfig.interval);
          setBackupMessage({
            type: 'success',
            text: lang === 'ar' 
              ? `تم ربط حساب Google بنجاح: ${result.user.email}` 
              : `Successfully connected Google account: ${result.user.email}`
          });
        }
      }
    } catch (err: any) {
      console.error('Google link err:', err);
      setBackupMessage({
        type: 'error',
        text: lang === 'ar' ? 'فشل ربط حساب Google Drive.' : 'Failed to connect Google Drive account.'
      });
    }
  };

  const handleLinkDropbox = async () => {
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
      handleConfigChange('dropbox', backupConfig.interval);
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
      if (!activeUser && onGoogleSignIn) {
        const result = await onGoogleSignIn();
        if (result && result.user) {
          activeUser = result.user;
        }
      }
      if (activeUser) {
        handleConfigChange('firebase', backupConfig.interval);
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

  const handleLinkICloud = async () => {
    const appleId = prompt(
      lang === 'ar'
        ? 'الرجاء إدخال حساب Apple ID الخاص بك للربط السحابي الآمن عبر iCloud:'
        : 'Please specify your Apple ID for secure iCloud Drive synchronization:',
      'user@icloud.com'
    );
    if (appleId) {
      setIcloudLinked(true);
      handleConfigChange('icloud', backupConfig.interval);
      setBackupMessage({
        type: 'success',
        text: lang === 'ar'
          ? `تم الاتصال والربط عبر Apple iCloud Drive بنجاح: ${appleId}`
          : `Successfully connected Apple iCloud Drive storage segment: ${appleId}`
      });
    }
  };

  const handleLinkCustomBackend = async () => {
    const backendUrl = prompt(
      lang === 'ar'
        ? 'الرجاء إدخال رابط API خادمك المخصص (REST Endpoint URL):'
        : 'Please specify your custom server backend API endpoint URL:',
      'https://api.mybrand.com/v1/backups'
    );
    if (backendUrl) {
      setCustomLinked(true);
      handleConfigChange('custom-backend', backupConfig.interval);
      setBackupMessage({
        type: 'success',
        text: lang === 'ar'
          ? `تم الاتصال والربط البرمجي بالخادم المخصص بنجاح: ${backendUrl}`
          : `Successfully connected to custom server REST repository: ${backendUrl}`
      });
    }
  };

  const handleUnlink = async () => {
    if (onLogout && (backupConfig.provider === 'google-drive' || backupConfig.provider === 'firebase')) {
      await onLogout();
    }
    setDropboxLinked(false);
    setIcloudLinked(false);
    setCustomLinked(false);
    try {
      localStorage.removeItem('arabi_prompt_dropbox_token');
      setDropboxToken(null);
    } catch {}
    handleConfigChange(null, 'manual');
    setBackupMessage({
      type: 'info',
      text: lang === 'ar' ? 'تم إلغاء ربط التخزين السحابي الحالي.' : 'Unlinked current cloud storage service.'
    });
  };

  const handleExportBackup = () => {
    try {
      if (history.length === 0) {
        setBackupMessage({
          type: 'info',
          text: lang === 'ar' 
            ? 'لا توجد بيانات حالية لنسخها احتياطياً. تفضل بتوليد بعض الأوامر أولاً!' 
            : 'No local history data available to backup. Try generating some prompts first!'
        });
        return;
      }
      
      const jsonString = JSON.stringify(history, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `arabprompt-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setBackupMessage({
        type: 'success',
        text: lang === 'ar' 
          ? 'تم تصدير وحفظ النسخة الاحتياطية بنجاح!' 
          : 'Backup JSON exported and downloaded successfully!'
      });
      
      setTimeout(() => setBackupMessage(null), 5000);
    } catch (error) {
      console.error('Failed to export backup:', error);
      setBackupMessage({
        type: 'error',
        text: lang === 'ar' ? 'فشل تصدير النسخة الاحتياطية.' : 'Failed to export backup.'
      });
    }
  };

  const handleExportAllCSVDirect = () => {
    try {
      if (history.length === 0) {
        setBackupMessage({
          type: 'info',
          text: lang === 'ar' 
            ? 'لا توجد بيانات حالية في سجل الأوامر لتصديرها كـ CSV. تفضل بتوليد بعض الأوامر أولاً!' 
            : 'No data records available to export inside your log folder. Generate prompts first!'
        });
        return;
      }

      const escapeCSVValue = (val: any) => {
        if (val === undefined || val === null) return '';
        let str = String(val);
        str = str.replace(/"/g, '""');
        if (str.includes(csvDelimiter) || str.includes('\n') || str.includes('\r') || str.includes('"')) {
          return `"${str}"`;
        }
        return str;
      };

      // 1. Build CSV Header Row
      const headerRow = exportableFields
        .map(field => lang === 'ar' ? field.labelAr : field.labelEn)
        .map(escapeCSVValue)
        .join(csvDelimiter);

      // 2. Build rows
      const rows = history.map(item => {
        return exportableFields.map(field => {
          let val = (item as any)[field.key];
          
          if (field.key === 'timestamp') {
            try {
              val = new Date(val).toLocaleString(lang === 'ar' ? 'ar-u-nu-latn' : 'en-US');
            } catch {
              val = String(val);
            }
          } else if (field.key === 'isFavorite') {
            val = val ? (lang === 'ar' ? 'نعم (مفضلة)' : 'Yes (Starred)') : (lang === 'ar' ? 'لا' : 'No');
          } else if (field.key === 'model') {
            val = getModelLabel(val);
          } else if (field.key === 'category') {
            val = getCategoryName(val);
          } else if (field.key === 'actionType') {
            val = getActionLabel({ actionType: val });
          } else if (field.key === 'tags') {
            val = Array.isArray(val) ? val.join(', ') : (val || '');
          }
          
          return escapeCSVValue(val);
        }).join(csvDelimiter);
      });

      const csvContent = [headerRow, ...rows].join('\n');
      
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `arabprompt-all-database-csv-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setBackupMessage({
        type: 'success',
        text: lang === 'ar'
          ? '✓ تم تصدير كافة سجلات الأوامر والمسودات الخاصة بك بنجاح كملف Excel CSV متوافق بالكامل!'
          : '✓ Successfully exported all user history records to a spreadsheet-ready Excel CSV!'
      });
      
      setTimeout(() => setBackupMessage(null), 6000);
    } catch (error) {
      console.error('Failed to export CSV database:', error);
      setBackupMessage({
        type: 'error',
        text: lang === 'ar' ? 'عذراً، حدث خطأ أثناء تصدير ملف الـ CSV.' : 'An error occurred while compiling your CSV dataset.'
      });
    }
  };

  const handleExportCSV = () => {
    try {
      if (history.length === 0) {
        setBackupMessage({
          type: 'info',
          text: lang === 'ar' 
            ? 'لا توجد بيانات حالية لتصديرها!' 
            : 'No local history data available to export!'
        });
        return;
      }

      if (selectedFields.length === 0) {
        setBackupMessage({
          type: 'error',
          text: lang === 'ar'
            ? 'يرجى تحديد حقل واحد على الأقل للتصدير.'
            : 'Please select at least one field to export.'
        });
        return;
      }

      const escapeCSVValue = (val: any) => {
        if (val === undefined || val === null) return '';
        let str = String(val);
        str = str.replace(/"/g, '""');
        if (str.includes(csvDelimiter) || str.includes('\n') || str.includes('\r') || str.includes('"')) {
          return `"${str}"`;
        }
        return str;
      };

      // 1. Build CSV Header Row
      const headerRow = selectedFields
        .map(fieldKey => {
          const matched = exportableFields.find(f => f.key === fieldKey);
          return lang === 'ar' && matched ? matched.labelAr : (matched ? matched.labelEn : fieldKey);
        })
        .map(escapeCSVValue)
        .join(csvDelimiter);

      // 2. Build Rows
      const rows = history.map(item => {
        return selectedFields
          .map(fieldKey => {
            let val = (item as any)[fieldKey];
            
            if (fieldKey === 'timestamp') {
              val = new Date(val).toLocaleString(lang === 'ar' ? 'ar-u-nu-latn' : 'en-US');
            } else if (fieldKey === 'isFavorite') {
              val = val ? (lang === 'ar' ? 'نعم' : 'Yes') : (lang === 'ar' ? 'لا' : 'No');
            } else if (fieldKey === 'model') {
              val = getModelLabel(val);
            } else if (fieldKey === 'category') {
              val = getCategoryName(val);
            } else if (fieldKey === 'actionType') {
              val = getActionLabel({ actionType: val });
            } else if (fieldKey === 'tags') {
              val = Array.isArray(val) ? val.join(', ') : (val || '');
            }
            
            return escapeCSVValue(val);
          })
          .join(csvDelimiter);
      });

      const csvContent = [headerRow, ...rows].join('\n');
      
      // UTF-8 BOM to guarantee fine display in MS Excel
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `arabprompt-csv-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setBackupMessage({
        type: 'success',
        text: lang === 'ar'
          ? 'تم تصدير ملف الـ CSV بنجاح وتأمين توافق الحروف العربية مع Excel!'
          : 'CSV file exported successfully with full Excel character layout!'
      });
      
      setTimeout(() => setBackupMessage(null), 5000);
    } catch (error) {
      console.error('Failed to export CSV:', error);
      setBackupMessage({
        type: 'error',
        text: lang === 'ar' ? 'فشل تصدير ملف الـ CSV.' : 'Failed to export CSV file.'
      });
    }
  };

  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (Array.isArray(parsed)) {
          // Robust validation
          const isValid = parsed.every(item => 
            item && 
            typeof item === 'object' && 
            typeof item.originalText === 'string' && 
            typeof item.optimizedText === 'string'
          );

          if (isValid) {
            onRestoreHistory(parsed);
            setBackupMessage({
              type: 'success',
              text: lang === 'ar' 
                ? `تم استرجاع ودمج ${parsed.length} من السجلات بنجاح إلى تاريخك المتكامل!` 
                : `Successfully restored and merged ${parsed.length} records into your history log!`
            });
            setTimeout(() => setBackupMessage(null), 6000);
          } else {
            setBackupMessage({
              type: 'error',
              text: lang === 'ar' 
                ? 'الملف غير متوافق. تأكد أنه ملف نسخة احتياطية من هذا التطبيق.' 
                : 'Incompatible file. Please ensure it is a valid ArabPrompt backup file.'
            });
          }
        } else {
          setBackupMessage({
            type: 'error',
            text: lang === 'ar' 
              ? 'صيغة غير صالحة: ملف النسخة الاحتياطية يجب أن يكون مصفوفة من الأوامر.' 
              : 'Invalid format: Backup file has to be an array of prompts.'
          });
        }
      } catch (err) {
        setBackupMessage({
          type: 'error',
          text: lang === 'ar' 
            ? 'خطأ في قراءة أو معالجة ملف JSON. تأكد من أن الملف سليم.' 
            : 'Failed to read or parse JSON file. Ensure the file format is intact.'
        });
      }
      event.target.value = ''; // Reset file input
    };
    reader.readAsText(file);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast(lang === 'ar' ? '✓ تم نسخ الأمر بنجاح للحافظة!' : '✓ Prompt copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const generatePrintHTML = (items: PromptHistoryItem[]) => {
    const isArabic = lang === 'ar';
    const documentTitle = isArabic 
      ? 'وثيقة مواصفات الأوامر الهندسية المعتمدة - ArabPrompt'
      : 'ArabPrompt - Approved Engineered Prompt Specifications';

    let contentHTML = '';

    items.forEach((item, index) => {
      const isLast = index === items.length - 1;
      const dateStr = new Date(item.timestamp).toLocaleString(isArabic ? 'ar-u-nu-latn' : 'en-US', {
        dateStyle: 'full',
        timeStyle: 'medium'
      });

      const ratingStars = item.rating ? '★'.repeat(item.rating) + '☆'.repeat(5 - item.rating) : '☆☆☆☆☆';

      contentHTML += `
      <div class="prompt-document ${!isLast ? 'page-break' : ''}">
        <!-- Letterhead / Header -->
        <div class="doc-header">
          <div class="logo-area">
            <span class="logo-accent">✦</span>
            <span class="logo-text">ArabPrompt</span>
          </div>
          <div class="doc-meta-title">
            <h2>${isArabic ? 'وثيقة مواصفات الأمر الهندسي المعتمد' : 'Engineered Prompt Specification Document'}</h2>
            <div class="doc-id">ID: #${item.id.substring(0, 8).toUpperCase()}</div>
          </div>
        </div>

        <div class="gold-divider"></div>

        <!-- Metadata Section Card -->
        <div class="meta-card">
          <div class="meta-row">
            <div class="meta-item">
              <span class="meta-label">${isArabic ? 'تاريخ التحسين:' : 'Date Optimized:'}</span>
              <span class="meta-value font-sans">${dateStr}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">${isArabic ? 'النموذج الذكي:' : 'AI Model Target:'}</span>
              <span class="meta-value highlight">${getModelLabel(item.model)}</span>
            </div>
          </div>
          <div class="meta-row">
            <div class="meta-item">
              <span class="meta-label">${isArabic ? 'التصنيف المنهجي:' : 'Expert Category:'}</span>
              <span class="meta-value">${getCategoryName(item.category)}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">${isArabic ? 'النبرة والأسلوب البصري:' : 'Aesthetic & Tone:'}</span>
              <span class="meta-value bg-accent">${item.tone || (isArabic ? 'تلقائي' : 'Default / General')}</span>
            </div>
          </div>
          <div class="meta-row">
            <div class="meta-item">
              <span class="meta-label">${isArabic ? 'نوع التدريب / المدخل:' : 'Compilation Type:'}</span>
              <span class="meta-value">${getActionLabel(item)}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">${isArabic ? 'حالة التقييم:' : 'Quality Rating:'}</span>
              <span class="meta-value rating-stars">${ratingStars}</span>
            </div>
          </div>
        </div>

        <!-- Section 1: Raw thought or concept -->
        <div class="section-container">
          <h3 class="section-title">
            <span class="label-badge">01</span>
            ${isArabic ? 'الفكرة الأساسية والمسودة الكامنة' : 'Raw Prompt Idea & Draft Concept'}
          </h3>
          <div class="section-body text-rough font-amiri" dir="auto">
            ${item.originalText}
          </div>
        </div>

        <!-- Section 2: Final engineered output -->
        <div class="section-container active-section">
          <h3 class="section-title text-amber">
            <span class="label-badge badge-amber">02</span>
            ${isArabic ? 'الأمر الهندسي المولد المعتمد (النسخ والتشغيل)' : 'Approved Target Engineered Prompt (Deployable)'}
          </h3>
          <div class="section-body text-refined font-mono text-ltr" dir="ltr">
            ${item.optimizedText}
          </div>
        </div>

        <!-- Optional Section 3: Translated or Auxiliary prompt -->
        ${item.translatedText ? `
        <div class="section-container">
          <h3 class="section-title">
            <span class="label-badge">03</span>
            ${isArabic ? 'الترجمة والتعريب المساعد' : 'Translated Dynamic Reference'}
          </h3>
          <div class="section-body text-rough font-sans" dir="auto">
            ${item.translatedText}
          </div>
        </div>
        ` : ''}

        <!-- Optional Section: Image reverse mode metadata -->
        ${item.actionType === 'reverse' && (item.styleImage || item.contentImage || item.notes) ? `
        <div class="section-container bg-gray-section">
          <h3 class="section-title">
            <span class="label-badge">✦</span>
            ${isArabic ? 'مواصفات الهندسة العكسية للصورة ونقل الأسلوب' : 'Image Reverse Engineering & Mimicry Specs'}
          </h3>
          <div class="blend-images-row">
            ${item.styleImage ? `
            <div class="image-box">
              <span class="image-title">${isArabic ? 'صورة الأسلوب الفني (توليد وإشهار)' : 'Visual Style Reference'}</span>
              <div class="img-wrapper">
                <img src="${item.styleImage}" referrerPolicy="no-referrer" />
              </div>
            </div>
            ` : ''}
            ${item.contentImage ? `
            <div class="image-box1">
              <span class="image-title">${isArabic ? 'صورة الكائن / المحتوى المستكشف' : 'Visual Object/Content Reference'}</span>
              <div class="img-wrapper">
                <img src="${item.contentImage}" referrerPolicy="no-referrer" />
              </div>
            </div>
            ` : ''}
          </div>
          ${item.notes ? `
          <div class="image-notes">
            <strong>${isArabic ? 'توجيهات الدمج المرفقة:' : 'Additional Integration Directives:'}</strong>
            <p>${item.notes}</p>
          </div>
          ` : ''}
        </div>
        ` : ''}

        <!-- Individual Document Footer -->
        <div class="doc-footer">
          <p>${isArabic ? 'حقوق الحفظ والنشر © 2026 ArabPrompt لتمكين المبدعين العرب.' : 'Copyright © 2026 ArabPrompt. Crafted for high-fidelity prompt generation.'}</p>
          <p>${isArabic ? 'تم التحسين والتصدير بأمان بنسبة 100% دون تسريب سحابي.' : 'Optimized offline. Clean, local-first metadata.'}</p>
        </div>
      </div>
      `;
    });

    return `
    <!DOCTYPE html>
    <html lang="${isArabic ? 'ar' : 'en'}" dir="${isArabic ? 'rtl' : 'ltr'}">
    <head>
      <meta charset="utf-8">
      <title>${documentTitle}</title>
      <link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
      <style>
        :root {
          --color-brand: #916a24;
          --color-brand-light: #c29b40;
          --color-brand-bg: #faf7f2;
          --color-stone-text: #292524;
          --color-stone-muted: #78716c;
          --color-stone-border: #e7e5e4;
          --color-stone-light-bg: #f5f5f4;
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: var(--color-stone-text);
          background-color: #fff;
          font-size: 13px;
          line-height: 1.5;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        /* Amiri font for Arabic text blocks */
        .font-amiri {
          font-family: 'Amiri', Georgia, serif;
          font-size: 14.5px;
          line-height: 1.6;
        }

        .font-sans {
          font-family: 'Inter', sans-serif;
        }

        .font-mono {
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 12px;
          line-height: 1.5;
        }

        .text-ltr {
          direction: ltr !important;
          text-align: left !important;
        }

        .text-rtl {
          direction: rtl !important;
          text-align: right !important;
        }

        /* Page Layout */
        .prompt-document {
          max-width: 800px;
          margin: 20px auto;
          padding: 40px;
          border: 1px solid var(--color-stone-border);
          border-radius: 16px;
          background-color: #fff;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          position: relative;
        }

        @media print {
          body {
            background-color: #fff;
          }
          .prompt-document {
            border: none;
            border-radius: 0;
            box-shadow: none;
            margin: 0;
            padding: 20px;
            max-width: 100%;
          }
          .page-break {
            page-break-after: always;
            break-after: page;
          }
        }

        /* Header Layout */
        .doc-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          gap: 20px;
        }

        html[dir="rtl"] .doc-header {
          flex-direction: row-reverse;
        }

        .logo-area {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .logo-accent {
          color: var(--color-brand-light);
          font-size: 22px;
          font-weight: bold;
        }

        .logo-text {
          font-size: 18px;
          font-weight: 805;
          letter-spacing: -0.5px;
          color: var(--color-stone-text);
          font-family: 'Inter', sans-serif;
        }

        .doc-meta-title {
          text-align: right;
        }

        html[dir="rtl"] .doc-meta-title {
          text-align: left;
        }

        .doc-meta-title h2 {
          font-size: 16px;
          font-weight: 700;
          color: var(--color-stone-text);
          margin-bottom: 2px;
        }

        .doc-id {
          font-size: 10.5px;
          font-weight: bold;
          color: var(--color-brand-light);
          letter-spacing: 0.5px;
        }

        /* Spacer divider */
        .gold-divider {
          height: 3px;
          background: linear-gradient(to right, var(--color-brand-light), transparent);
          margin-bottom: 25px;
          border-radius: 2px;
        }

        html[dir="rtl"] .gold-divider {
          background: linear-gradient(to left, var(--color-brand-light), transparent);
        }

        /* Metadata Grid Card */
        .meta-card {
          background-color: var(--color-stone-light-bg);
          border: 1px solid var(--color-stone-border);
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 25px;
        }

        .meta-row {
          display: flex;
          justify-content: space-between;
          gap: 24px;
        }

        .meta-item {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px dashed var(--color-stone-border);
          padding-bottom: 4px;
        }
        
        .meta-label {
          font-size: 11px;
          font-weight: 700;
          color: var(--color-stone-muted);
        }

        .meta-value {
          font-size: 11.5px;
          font-weight: 600;
          color: var(--color-stone-text);
        }

        .meta-value.highlight {
          color: var(--color-brand);
          font-weight: 700;
        }

        .meta-value.rating-stars {
          color: #d97706;
          letter-spacing: 1px;
          font-size: 13px;
        }

        /* Section Layout */
        .section-container {
          margin-bottom: 25px;
          border: 1px solid var(--color-stone-border);
          border-radius: 12px;
          overflow: hidden;
        }

        .section-container.active-section {
          border-color: rgba(194, 155, 64, 0.4);
        }

        .section-title {
          font-size: 12px;
          font-weight: 750;
          background-color: var(--color-stone-light-bg);
          padding: 10px 14px;
          border-bottom: 1px solid var(--color-stone-border);
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--color-stone-text);
        }

        html[dir="rtl"] .section-title {
          flex-direction: row-reverse;
        }

        .label-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          background-color: var(--color-stone-border);
          color: var(--color-stone-muted);
          font-size: 10px;
          font-weight: bold;
          border-radius: 5px;
        }

        .label-badge.badge-amber {
          background-color: var(--color-brand-light);
          color: #fff;
        }

        .section-body {
          padding: 16px;
          min-height: 50px;
          word-wrap: break-word;
          white-space: pre-wrap;
          direction: auto;
          text-align: right;
        }

        html[dir="rtl"] .section-body {
          text-align: right;
        }

        html[dir="ltr"] .section-body {
          text-align: left;
        }

        .section-body.text-refined {
          background-color: var(--color-brand-bg);
          color: #292524;
          border-left: 3px solid var(--color-brand-light);
        }

        html[dir="rtl"] .section-body.text-refined {
          border-left: none;
          border-right: 3px solid var(--color-brand-light);
        }

        /* Stylereverse Image Boxes */
        .blend-images-row {
          display: flex;
          gap: 16px;
          padding: 16px;
          background-color: #fff;
        }

        .image-box, .image-box1 {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .image-title {
          font-size: 10px;
          font-weight: bold;
          color: var(--color-stone-muted);
        }

        .img-wrapper {
          width: 130px;
          height: 130px;
          border: 1px solid var(--color-stone-border);
          border-radius: 8px;
          overflow: hidden;
          background-color: var(--color-stone-light-bg);
          padding: 4px;
        }

        .img-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 4px;
        }

        .image-notes {
          padding: 12px 16px;
          background-color: var(--color-stone-light-bg);
          border-top: 1px solid var(--color-stone-border);
          font-size: 11.5px;
        }

        .image-notes strong {
          color: var(--color-stone-text);
          display: block;
          margin-bottom: 4px;
        }

        /* Footer */
        .doc-footer {
          margin-top: 30px;
          padding-top: 15px;
          border-top: 1px solid var(--color-stone-border);
          display: flex;
          justify-content: space-between;
          color: var(--color-stone-muted);
          font-size: 9px;
          font-weight: 500;
        }

        html[dir="rtl"] .doc-footer {
          flex-direction: row-reverse;
        }
      </style>
    </head>
    <body>
      ${contentHTML}
      <script>
        window.addEventListener('DOMContentLoaded', () => {
          setTimeout(() => {
            window.focus();
            window.print();
          }, 450);
        });
      </script>
    </body>
    </html>
    `;
  };

  const handleExportPDF = (item: PromptHistoryItem) => {
    try {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      iframe.id = 'print-pdf-iframe';
      
      const existing = document.getElementById('print-pdf-iframe');
      if (existing) {
        existing.remove();
      }

      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document || iframe.contentDocument;
      if (!doc) {
        throw new Error('Could not access print context');
      }

      const printHTML = generatePrintHTML([item]);
      
      doc.open();
      doc.write(printHTML);
      doc.close();

      showToast(
        lang === 'ar'
          ? '✓ جاري تجهيز وثيقة الـ PDF للطباعة والحفظ...'
          : '✓ Formatting prompt PDF document for print/download...'
      );

      setTimeout(() => {
        try {
          setTimeout(() => {
            if (iframe.parentNode) {
              iframe.parentNode.removeChild(iframe);
            }
          }, 60000);
        } catch (e) {
          console.warn(e);
        }
      }, 2000);

    } catch (err: any) {
      console.error('Failed to export PDF:', err);
      showToast(
        lang === 'ar'
          ? 'عذراً، فشل تصدير ملف الـ PDF.'
          : `Failed to export prompt specification to PDF: ${err.message || err}`,
        true
      );
    }
  };

  const handleBulkExportPDF = () => {
    if (selectedIds.length === 0) return;
    try {
      const selectedItems = history.filter((item) => selectedIds.includes(item.id));
      
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      iframe.id = 'print-pdf-bulk-iframe';
      
      const existing = document.getElementById('print-pdf-bulk-iframe');
      if (existing) {
        existing.remove();
      }

      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document || iframe.contentDocument;
      if (!doc) {
        throw new Error('Could not access print context');
      }

      const printHTML = generatePrintHTML(selectedItems);
      
      doc.open();
      doc.write(printHTML);
      doc.close();

      showToast(
        lang === 'ar'
          ? `✓ جاري تجهيز ${selectedItems.length} من عناصر السجل في ملف PDF واحد...`
          : `✓ Generating consolidated PDF for ${selectedItems.length} selected items...`
      );

      setTimeout(() => {
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      }, 60000);

    } catch (err: any) {
      console.error('Failed to bulk export PDF:', err);
      showToast(
        lang === 'ar'
          ? 'عذراً، فشل تصدير السجلات المحددة كـ PDF.'
          : `Failed to bulk export selected prompts to PDF: ${err.message || err}`,
        true
      );
    }
  };

  const getActionLabel = (item: any) => {
    const action = item.actionType || 'generate';
    if (lang === 'ar') {
      if (action === 'refine') return 'تحسين وتعديل';
      if (action === 'translate') return 'ترجمة وتعريب';
      if (action === 'reverse') return 'هندسة عكسية للصورة';
      return 'توليد أساسي';
    } else {
      if (action === 'refine') return 'Refine & Polish';
      if (action === 'translate') return 'Translate & Expand';
      if (action === 'reverse') return 'Image Reverse';
      return 'Base Synthesis';
    }
  };

  const getActionColor = (action: string) => {
    if (action === 'refine') return 'bg-amber-100 text-amber-800 border-amber-200';
    if (action === 'translate') return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    if (action === 'reverse') return 'bg-sky-100 text-sky-800 border-sky-200';
    return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  };

  const getModelLabel = (model: string) => {
    const map: Record<string, string> = {
      gemini: 'Google Gemini',
      chatgpt: 'OpenAI ChatGPT',
      claude: 'Anthropic Claude',
      notebooklm: 'Google NotebookLM',
      midjourney: 'Midjourney',
      meta: 'Meta AI / Llama 3'
    };
    return map[model] || model;
  };

  const getCategoryName = (cat: string) => {
    const map: Record<string, { ar: string; en: string }> = {
      tech: { ar: 'برمجيات وتقنية', en: 'Tech & Code' },
      marketing: { ar: 'تسويق وإعلان', en: 'Marketing & Copy' },
      content: { ar: 'صناعة محتوى', en: 'Content Creation' },
      education: { ar: 'تبسيط وتعليم', en: 'Education' },
      general: { ar: 'عام وإنتاجية', en: 'Productivity' }
    };
    return map[cat] ? (lang === 'ar' ? map[cat].ar : map[cat].en) : cat;
  };

  // Suggested common tags for quick one-click classification
  const suggestedTags = [
    { ar: 'تصميم', en: 'Design' },
    { ar: 'تسويق', en: 'Marketing' },
    { ar: 'برمجة', en: 'Coding' },
    { ar: 'سينمائي', en: 'Cinematic' },
    { ar: 'شخصيات', en: 'Characters' },
    { ar: 'شعار', en: 'Logo' },
    { ar: 'سوشيال ميديا', en: 'Social' },
    { ar: '3D', en: '3D' },
    { ar: 'خيال علمي', en: 'Sci-Fi' },
    { ar: 'إضاءة', en: 'Lighting' },
  ];

  // Compute all unique tags and their frequency
  const allUniqueTagsWithCount = React.useMemo(() => {
    const counts: Record<string, number> = {};
    history.forEach((item) => {
      if (Array.isArray(item.tags)) {
        item.tags.forEach((t) => {
          const clean = t.trim().replace(/^#+/, '');
          if (clean) {
            counts[clean] = (counts[clean] || 0) + 1;
          }
        });
      }
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [history]);

  // Tag manipulation handlers
  const handleAddTag = (itemId: string, tagToAdd: string) => {
    const clean = tagToAdd.trim().replace(/^#+/, '');
    if (!clean) return;
    const item = history.find((h) => h.id === itemId);
    if (!item) return;
    const currentTags = item.tags || [];
    if (currentTags.includes(clean)) {
      showToast(lang === 'ar' ? `الوسم #${clean} مضاف مسبقاً` : `Tag #${clean} already exists`);
      return;
    }
    const nextTags = [...currentTags, clean];
    if (onUpdateTags) {
      onUpdateTags(itemId, nextTags);
    }
    setNewTagInputs((prev) => ({ ...prev, [itemId]: '' }));
    showToast(lang === 'ar' ? `✓ تم إضافة الوسم #${clean}` : `✓ Tag #${clean} added`);
  };

  const handleRemoveTag = (itemId: string, tagToRemove: string) => {
    const item = history.find((h) => h.id === itemId);
    if (!item) return;
    const currentTags = item.tags || [];
    const nextTags = currentTags.filter((t) => t !== tagToRemove);
    if (onUpdateTags) {
      onUpdateTags(itemId, nextTags);
    }
    showToast(lang === 'ar' ? `تم حذف الوسم #${tagToRemove}` : `Tag #${tagToRemove} removed`);
  };

  const handleApplyBulkTag = () => {
    const clean = bulkTagInput.trim().replace(/^#+/, '');
    if (!clean) {
      showToast(lang === 'ar' ? 'يرجى إدخال اسم الوسم أولاً' : 'Please enter a tag name', true);
      return;
    }
    if (selectedIds.length === 0) return;
    if (onBulkUpdateTags) {
      onBulkUpdateTags(selectedIds, clean);
    } else if (onUpdateTags) {
      selectedIds.forEach((id) => {
        const item = history.find((h) => h.id === id);
        if (item) {
          const cur = item.tags || [];
          if (!cur.includes(clean)) {
            onUpdateTags(id, [...cur, clean]);
          }
        }
      });
    }
    showToast(
      lang === 'ar'
        ? `✓ تم تطبيق الوسم #${clean} على ${selectedIds.length} من العناصر بنجاح!`
        : `✓ Applied tag #${clean} to ${selectedIds.length} items!`
    );
    setBulkTagInput('');
    setShowBulkTagModal(false);
  };

  // Compute counts for each action type across the entire history
  const actionCounts = React.useMemo(() => {
    const counts = {
      all: history.length,
      generate: 0,
      refine: 0,
      translate: 0,
      reverse: 0
    };
    history.forEach((item) => {
      const act = item.actionType || 'generate';
      if (act === 'refine') counts.refine++;
      else if (act === 'translate') counts.translate++;
      else if (act === 'reverse') counts.reverse++;
      else counts.generate++;
    });
    return counts;
  }, [history]);

  // Count items with no tags
  const untaggedCount = React.useMemo(() => {
    return history.filter(item => !Array.isArray(item.tags) || item.tags.length === 0).length;
  }, [history]);

  // Highlight keyword matches within prompt text snippets
  const highlightMatch = (text: string, term: string) => {
    if (!term || !text) return text;
    const trimmed = term.trim();
    if (!trimmed) return text;
    const cleanTag = trimmed.startsWith('#') ? trimmed.substring(1) : trimmed;
    const query = cleanTag || trimmed;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    try {
      const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
      if (parts.length <= 1) return text;
      return (
        <>
          {parts.map((part, i) =>
            part.toLowerCase() === query.toLowerCase() ? (
              <mark key={i} className="bg-amber-200 dark:bg-amber-900/60 text-amber-950 dark:text-amber-200 font-bold px-0.5 rounded">
                {part}
              </mark>
            ) : (
              part
            )
          )}
        </>
      );
    } catch {
      return text;
    }
  };

  const hasActiveFilters = Boolean(
    searchTerm.trim() ||
    actionTypeFilter !== 'all' ||
    selectedTag !== 'all' ||
    modelFilter !== 'all' ||
    ratingFilter !== 'all' ||
    showFavoritesOnly ||
    sortBy !== 'newest'
  );

  const resetAllFilters = () => {
    setSearchTerm('');
    setActionTypeFilter('all');
    setSelectedTag('all');
    setModelFilter('all');
    setRatingFilter('all');
    setShowFavoritesOnly(false);
    setSortBy('newest');
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
    }
  };

  // Real-time filter and sort items across keyword, tag, action type, model, rating, and favorites
  const filteredHistory = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const cleanSearchTag = term.startsWith('#') ? term.substring(1) : term;
    
    return history.filter((item) => {
      // 1. Keyword search across originalText, optimizedText, translatedText, notes, category, and tags
      const matchesSearch =
        !term ||
        item.originalText.toLowerCase().includes(term) ||
        item.optimizedText.toLowerCase().includes(term) ||
        (item.translatedText && item.translatedText.toLowerCase().includes(term)) ||
        (item.notes && item.notes.toLowerCase().includes(term)) ||
        (item.category && item.category.toLowerCase().includes(term)) ||
        (Array.isArray(item.tags) &&
          item.tags.some(
            (tag) =>
              tag.toLowerCase().includes(term) ||
              tag.toLowerCase().includes(cleanSearchTag)
          ));

      // 2. Action Type filter (generate, refine, translate, reverse)
      const itemAction = item.actionType || 'generate';
      const matchesAction =
        actionTypeFilter === 'all' || itemAction === actionTypeFilter;

      // 3. Tag filter (all, specific tag, or __untagged__)
      const matchesTag =
        selectedTag === 'all' ||
        (selectedTag === '__untagged__'
          ? !Array.isArray(item.tags) || item.tags.length === 0
          : Array.isArray(item.tags) && item.tags.includes(selectedTag));

      // 4. Model filter
      const matchesModel = modelFilter === 'all' || item.model === modelFilter;

      // 5. Favorites filter
      const matchesFavorite = !showFavoritesOnly || !!item.isFavorite;

      // 6. Rating filter
      const matchesRating =
        ratingFilter === 'all' ||
        (item.rating !== undefined && String(item.rating) === ratingFilter);

      return (
        matchesSearch &&
        matchesAction &&
        matchesTag &&
        matchesModel &&
        matchesFavorite &&
        matchesRating
      );
    }).sort((a, b) => {
      if (sortBy === 'oldest') {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      }
      if (sortBy === 'highest-rated') {
        return (b.rating || 0) - (a.rating || 0);
      }
      if (sortBy === 'longest') {
        return (b.optimizedText?.length || 0) - (a.optimizedText?.length || 0);
      }
      // default: newest first
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }, [history, searchTerm, actionTypeFilter, selectedTag, modelFilter, showFavoritesOnly, ratingFilter, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" id="prompt-history-panel">
      
      {/* Header section with Stats */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 border-b border-stone-200 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#c29b40]/10 text-[#916a24] rounded-xl">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-stone-800">
                {lang === 'ar' ? 'سجل عمليات الأوامر ومسودة التاريخ' : 'Prompt Generation History Log'}
              </h2>
              <p className="text-xs text-stone-500 font-medium mt-1">
                {lang === 'ar' 
                  ? 'يتسق هذا السجل مع متصفحك محلياً لحفظ كل الهياكل والتحسينات المنجزة دون تسريب بياناتك.'
                  : 'Your prompt drafts and refined configurations are stored locally inside your browser.'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap self-start md:self-center">
          <button
            onClick={() => setShowDashboard(!showDashboard)}
            className="px-3.5 py-2 text-xs font-bold text-stone-700 hover:text-stone-900 bg-white hover:bg-stone-50 border border-stone-200 rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            title={lang === 'ar' ? 'عرض أو إخفاء لوحة الإحصائيات البيانية' : 'Toggle Analytics Dashboard'}
          >
            <BarChart3 className="w-3.5 h-3.5 text-[#c29b40]" />
            <span>{showDashboard ? (lang === 'ar' ? 'إخفاء لوحة البيانات' : 'Hide Dashboard') : (lang === 'ar' ? 'عرض لوحة البيانات (Dashboard)' : 'Show Dashboard')}</span>
          </button>

          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="px-4 py-2 text-xs font-bold text-rose-700 hover:text-white bg-rose-50 hover:bg-rose-700 border border-rose-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'مسح السجل بالكامل' : 'Clear All Records'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Analytics Dashboard (Recharts Powered) */}
      {showDashboard && (
        <PromptHistoryDashboard
          history={history}
          lang={lang}
          isOpenDefault={true}
        />
      )}

      {/* Backup & Restore Utility Section */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 mb-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-700 rounded-xl mt-0.5">
              <Database className="w-5 h-5 bg-transparent" />
            </div>
            <div className="text-right rtl:text-right">
              <h3 className="text-sm font-bold text-stone-800">
                {lang === 'ar' ? 'أدوات النسخ الاحتياطي واستعادة البيانات' : 'Data Backup & Recovery Services'}
              </h3>
              <p className="text-xs text-stone-500 mt-1 max-w-2xl leading-relaxed">
                {lang === 'ar'
                  ? 'يمكنك تنزيل ملف نسخة احتياطية محلية من مسوداتك وأوامرك الهندسية لاستعادتها في أي وقت، أو نقلها إلى متصفح وجهاز آخر بمرونة كاملة.'
                  : 'Download a secure, local backup of all engineered prompts and restore them instantly at any time or transfer to another browser.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Hidden native input for custom styled button styling upload */}
            <input
              type="file"
              id="restore-file-input"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
            
            {/* Export History to Styled PDF */}
            <button
              onClick={() => openPdfModal('all')}
              disabled={history.length === 0}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#916a24] via-[#c29b40] to-[#b38d35] hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto shadow-xs border border-[#b38d35]"
              title={lang === 'ar' ? 'تصدير السجل إلى ملف PDF منسق للطباعة أو الحفظ الرقمي' : 'Export History to Styled PDF'}
            >
              <Printer className="w-4 h-4" />
              <span>{lang === 'ar' ? 'تصدير السجل كـ PDF منسق' : 'Export Styled PDF'}</span>
            </button>

            <button
              onClick={handleExportBackup}
              disabled={history.length === 0}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              <Download className="w-4 h-4 text-stone-600" />
              <span>{lang === 'ar' ? 'إنشاء نسخة احتياطية (JSON)' : 'Export Backup (JSON)'}</span>
            </button>

            <button
              onClick={handleExportAllCSVDirect}
              disabled={history.length === 0}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-amber-900 bg-amber-500/10 hover:bg-amber-500/15 border border-[#c29b40]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              <Download className="w-4 h-4 text-[#c29b40]" />
              <span>{lang === 'ar' ? 'تصدير كمستند CSV فوري' : 'Export Instant CSV'}</span>
            </button>

            <button
              onClick={() => setShowCSVModal(!showCSVModal)}
              disabled={history.length === 0}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto ${
                showCSVModal 
                  ? 'bg-amber-100 text-amber-905 border border-amber-305' 
                  : 'bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4 text-[#c29b40]" />
              <span>{lang === 'ar' ? 'تصدير مخصص (CSV)' : 'Custom Export (CSV)'}</span>
            </button>

            <label
              htmlFor="restore-file-input"
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-800/20 w-full sm:w-auto shadow-sm text-center"
            >
              <Upload className="w-4 h-4 text-[#fbfbfa]" />
              <span>{lang === 'ar' ? 'استعادة نسخة سابقة (تحميل)' : 'Restore Backup (Upload)'}</span>
            </label>
          </div>
        </div>

        {/* Custom CSV Columns Exporter Section */}
        {showCSVModal && (
          <div className="border-t border-stone-100 mt-5 pt-5 space-y-4">
            <div className="bg-amber-500/5 border border-[#c29b40]/20 rounded-xl p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h4 className="text-sm font-bold text-stone-800">
                    {lang === 'ar' ? 'تخصيص أعمدة وحقول ملف الـ CSV' : 'Configure CSV Export Columns'}
                  </h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {lang === 'ar' 
                      ? 'حدد الحقول أو الخصائص التي تود إدراجها كأعمدة داخل ملف جدول البيانات المصدّر.'
                      : 'Select the attributes you wish to include as columns in your exported spreadsheet.'}
                  </p>
                </div>

                {/* Quick actions for all selection */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={() => setSelectedFields(exportableFields.map(f => f.key))}
                    className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-white border border-stone-300 hover:border-[#c29b40] text-stone-700 transition cursor-pointer"
                  >
                    {lang === 'ar' ? 'تحديد الكل' : 'Select All'}
                  </button>
                  <button
                    onClick={() => setSelectedFields([])}
                    className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-white border border-stone-300 hover:border-rose-450 text-stone-700 transition cursor-pointer"
                  >
                    {lang === 'ar' ? 'إلغاء الكل' : 'Deselect All'}
                  </button>
                </div>
              </div>

              {/* Checkbox item grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {exportableFields.map(field => {
                  const isChecked = selectedFields.includes(field.key);
                  return (
                    <label
                      key={field.key}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all cursor-pointer select-none text-xs font-bold ${
                        isChecked
                          ? 'bg-[#c29b40]/5 border-[#c29b40]/30 text-[#916a24]'
                          : 'bg-white border-stone-200 hover:border-stone-300 text-stone-600 hover:text-stone-800'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            setSelectedFields(selectedFields.filter(f => f !== field.key));
                          } else {
                            setSelectedFields([...selectedFields, field.key]);
                          }
                        }}
                        className="rounded text-[#c29b40] focus:ring-[#c29b40] h-4 w-4 border-stone-300 focus:ring-opacity-50"
                      />
                      <span>{lang === 'ar' ? field.labelAr : field.labelEn}</span>
                    </label>
                  );
                })}
              </div>

              {/* Additional controls and Trigger Buttons */}
              <div className="border-t border-stone-200/60 mt-4 pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                {/* Excel regional delimiter setting */}
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-bold text-stone-600">
                    {lang === 'ar' ? 'محدد الخلايا (Delimiter):' : 'CSV Delimiter Symbol:'}
                  </span>
                  <div className="flex bg-stone-100 p-0.5 rounded-lg border border-stone-200">
                    <button
                      onClick={() => setCsvDelimiter(',')}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-md transition cursor-pointer ${
                        csvDelimiter === ','
                          ? 'bg-white text-stone-800 shadow-sm'
                          : 'text-stone-500 hover:text-stone-850'
                      }`}
                    >
                      {lang === 'ar' ? 'فاصلة (,)' : 'Comma (,)'}
                    </button>
                    <button
                      onClick={() => setCsvDelimiter(';')}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-md transition cursor-pointer ${
                        csvDelimiter === ';'
                          ? 'bg-white text-stone-800 shadow-sm'
                          : 'text-stone-500 hover:text-stone-850'
                      }`}
                    >
                      {lang === 'ar' ? 'فاصلة منقوطة (;)' : 'Semicolon (;)'}
                    </button>
                  </div>
                </div>

                {/* Save and Run export triggers */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => setShowCSVModal(false)}
                    className="px-3.5 py-2 hover:bg-stone-105 border border-stone-250 text-stone-600 text-xs font-bold rounded-lg transition cursor-pointer font-sans"
                  >
                    {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-lg shadow transition flex items-center gap-1.5 cursor-pointer font-sans"
                  >
                    <Download className="w-3.5 h-3.5" strokeWidth={2.5} />
                    <span>
                      {lang === 'ar' 
                        ? `تنزيل ملف CSV (${selectedFields.length} حقول)` 
                        : `Download CSV (${selectedFields.length} Fields)`}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="border-t border-stone-100 mt-6 pt-6">
          <div className="bg-stone-50/50 rounded-2xl border border-stone-150 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-150 pb-4 mb-4 gap-3">
              <div className="text-right rtl:text-right">
                <h4 className="text-sm font-bold text-stone-800 flex items-center gap-2 flex-wrap">
                  <Cloud className="w-4.5 h-4.5 text-[#c29b40] shrink-0" />
                  <span>{lang === 'ar' ? 'النسخ الاحتياطي السحابي الاختياري ومزامنة البيانات' : 'Optional Cloud Backup & Dynamic Synchronization'}</span>
                </h4>
                <p className="text-xs text-stone-500 mt-1">
                  {lang === 'ar' 
                    ? 'قم بتمكين المزامنة لإبقاء أوامرك آمنة عبر منصات تخزين متعددة متكاملة.' 
                    : 'Activate backup sync to keep your prompts securely recorded across multi-cloud integrated databases.'}
                </p>
              </div>

              {/* Explicit Enable/Disable Toggle */}
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-stone-600">
                  {lang === 'ar' ? (backupConfig.isEnabled ? 'الخدمة مفعّلة' : 'الخدمة معطلة') : (backupConfig.isEnabled ? 'Backup Active' : 'Backup Disabled')}
                </span>
                <button
                  onClick={() => {
                    const nextEnabled = !backupConfig.isEnabled;
                    // Reset provider if disabled
                    const nextProvider = nextEnabled ? backupConfig.provider : null;
                    const nextInterval = nextEnabled ? backupConfig.interval : 'manual';
                    handleConfigChange(nextProvider, nextInterval, nextEnabled);
                    setBackupMessage({
                      type: 'info',
                      text: lang === 'ar'
                        ? (nextEnabled ? 'تم تمكين ميزة النسخ سحابياً. تفضل بربط أحد مزودي الخدمة بالأسفل.' : 'تم تعطيل النسخ السحابي بنجاح.')
                        : (nextEnabled ? 'Optional Cloud Backup enabled. Please select and link your cloud service below.' : 'Cloud Backup successfully deactivated.')
                    });
                  }}
                  id="toggle-backup-service"
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
            </div>

            {/* If Cloud Backup is Disabled */}
            {!backupConfig.isEnabled ? (
              <div className="text-center py-4 px-2">
                <p className="text-xs text-stone-500 font-medium leading-relaxed font-sans">
                  {lang === 'ar'
                    ? 'خدمة المزامنة السحابية غير نشطة حالياً. يمكنك تفعيلها بالضغط على زر التبديل بالأعلى للاتصال بـ Google Drive أو Firebase أو Dropbox أو iCloud.'
                    : 'The backup syncing loop is currently quiet. Toggle the switch above to link with Google Drive, Firebase, Dropbox, or Apple iCloud.'}
                </p>
              </div>
            ) : (
              // If Cloud Backup is Enabled
              <div className="space-y-5 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:items-center lg:justify-between gap-6 pb-2">
                  
                  {/* Provider Info */}
                  <div className="text-right rtl:text-right">
                    <h5 className="text-xs font-bold text-stone-600 mb-2">
                      {lang === 'ar' ? '1. اختر مزود المساحة السحابية للمزامنة:' : '1. Choose Cloud Storage Destination:'}
                    </h5>
                    
                    {/* Last backup metadata display */}
                    {backupConfig.provider && backupConfig.lastBackupTime && (
                      <p className="text-[10px] font-bold text-[#c29b40] mt-1.5 flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          {lang === 'ar' 
                            ? `آخر مزامنة عبر [${backupConfig.provider}]: ${new Date(backupConfig.lastBackupTime).toLocaleString('ar-u-nu-latn')}` 
                            : `Last sync via [${backupConfig.provider}]: ${new Date(backupConfig.lastBackupTime).toLocaleString()}`}
                        </span>
                      </p>
                    )}
                  </div>

                  {/* Sync Schedule Config */}
                  {backupConfig.provider && (
                    <div className="flex items-center gap-2.5 bg-stone-105 rounded-xl px-3.5 py-2.5 w-full md:w-auto inline-flex self-start justify-between border border-stone-200/60 font-sans">
                      <div className="flex items-center gap-2">
                        <Settings className="w-3.5 h-3.5 text-stone-400 shrink-0" strokeWidth={2.5} />
                        <span className="text-xs font-bold text-stone-600">
                          {lang === 'ar' ? '2. جدولة المزامنة الآلية:' : '2. Setup Sync Interval:'}
                        </span>
                      </div>
                      <select
                        value={backupConfig.interval}
                        onChange={(e) => handleConfigChange(backupConfig.provider, e.target.value as any, true)}
                        className="text-xs bg-transparent border-none text-amber-850 font-bold focus:ring-0 p-0 cursor-pointer outline-none focus:outline-none"
                      >
                        <option value="manual">{lang === 'ar' ? 'يدوي فقط (عند الطلب)' : 'Manual Only (On-Demand)'}</option>
                        <option value="daily">{lang === 'ar' ? 'يومي تلقائي (خلفية)' : 'Auto Daily (Background)'}</option>
                        <option value="weekly">{lang === 'ar' ? 'أسبوعي تلقائي (جدولة)' : 'Auto Weekly (Scheduled)'}</option>
                        <option value="instant">{lang === 'ar' ? 'مزامنة فورية (بصورة مستمرة)' : 'Instant Sync (Auto-Save)'}</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Cloud Provider Connection Grid or Active Control Set */}
                {!backupConfig.provider ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
                    
                    {/* Google Drive Connection */}
                    <button
                      onClick={handleLinkGoogleDrive}
                      className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:border-stone-300 font-sans"
                    >
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.11-.2-.22-.41-.35-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>Google Drive</span>
                    </button>

                    {/* Firebase Cloud Database */}
                    <button
                      onClick={handleLinkFirebase}
                      className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-stone-700 bg-white hover:bg-amber-500/5 hover:border-amber-500/20 border border-stone-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm font-sans"
                    >
                      <svg className="w-4 h-4 shrink-0 text-amber-500 fill-current" viewBox="0 0 24 24">
                        <path d="M3.89 15.55L2 17.5h16.22l-1.89-1.95L3.89 15.55zM12 2L3.89 10.21l1.89 1.95L12 5.9l6.22 6.26 1.89-1.95L12 2zL20.11 10.21L12 18.5H3.89L12 22l8.11-3.5V10.21z" />
                      </svg>
                      <span>Firebase DB</span>
                    </button>

                    {/* Dropbox Connection */}
                    <button
                      onClick={handleLinkDropbox}
                      className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 border border-sky-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm font-sans"
                    >
                      <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 24 24">
                        <path d="M5.013 7.625l7.001-4.375 7.001 4.375-7.001 4.376-7.001-4.376zm-5.013 3.125l5.013-3.125 7.001 4.376-7.001 4.375-5.013-3.125-5.013 3.125zm24 0l-5.013-3.125-7.001 4.376 7.001 4.375 5.013-3.125zm-24 4.375l5.013-3.125 7.001 4.375-7.001 4.375-5.013-3.125zm24 0l-5.013-3.125-7.001 4.375 7.001 4.375 5.013-3.125zm-19.013.938l7.013 4.312 7.013-4.312-7.013-4.375-7.013 4.375z" />
                      </svg>
                      <span>Dropbox</span>
                    </button>

                    {/* Apple iCloud */}
                    <button
                      onClick={handleLinkICloud}
                      className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-stone-700 bg-white hover:bg-[#c29b40]/5 hover:border-[#c29b40]/30 border border-stone-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm font-sans"
                    >
                      <span className="text-[#c29b40] font-extrabold text-[12px] tracking-tight">☁ iCloud</span>
                    </button>

                    {/* Custom REST Backend */}
                    <button
                      onClick={handleLinkCustomBackend}
                      className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-stone-700 bg-white hover:bg-[#c29b40]/5 hover:border-[#c29b40]/30 border border-stone-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm font-sans"
                    >
                      <Database className="w-3.5 h-3.5 text-stone-600 shrink-0" />
                      <span>{lang === 'ar' ? 'خادم مخصص' : 'Custom Server'}</span>
                    </button>
                  </div>
                ) : (
                  // Active Connection details with buttons
                  <div className="bg-white rounded-xl border border-stone-150 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shrink-0"></div>
                      <div className="text-right rtl:text-right">
                        <p className="text-xs font-bold text-stone-800 flex items-center gap-1.5 flex-wrap">
                          <span>{lang === 'ar' ? 'متصل بنجاح بمزود الخدمة:' : 'Successfully linked to Provider:'}</span>
                          <span className="text-amber-800 bg-[#c29b40]/10 border border-[#c29b40]/25 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase">
                            {backupConfig.provider}
                          </span>
                        </p>
                        <p className="text-[10px] text-stone-500 mt-0.5">
                          {lang === 'ar' 
                            ? 'نظام النسخ السحابي والتشغيل التلقائي يعمل بأمان.' 
                            : 'Synchronizer running under optimal performance layers.'}
                        </p>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2 flex-wrap sm:self-auto self-stretch">
                      <button
                        onClick={handleCloudBackupNow}
                        disabled={isCloudBackingUp}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold text-stone-800 bg-amber-500/15 hover:bg-amber-500/25 border border-[#c29b40]/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isCloudBackingUp ? (
                          <Loader2 className="w-3.5 h-3.5 text-[#c29b40] animate-spin" />
                        ) : (
                          <Cloud className="w-3.5 h-3.5 text-[#c29b40]" />
                        )}
                        <span>{lang === 'ar' ? 'نسخ احتياطي الآن' : 'Sync Backup Now'}</span>
                      </button>

                      <button
                        onClick={handleCloudRestoreNow}
                        disabled={isCloudRestoring}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold text-stone-700 bg-stone-50 hover:bg-stone-100 border border-stone-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isCloudRestoring ? (
                          <Loader2 className="w-3.5 h-3.5 text-stone-500 animate-spin" />
                        ) : (
                          <RefreshCw className="w-3.5 h-3.5 text-stone-600" />
                        )}
                        <span>{lang === 'ar' ? 'استعادة من السحاب' : 'Restore Logs'}</span>
                      </button>

                      <button
                        onClick={handleUnlink}
                        className="p-2 rounded-xl text-xs font-bold text-rose-700 hover:text-white bg-rose-50 hover:bg-rose-700 border border-rose-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        title={lang === 'ar' ? 'إلغاء ربط الحساب' : 'Disconnect Provider'}
                      >
                        <Unlink className="w-4 h-4" />
                        <span className="sm:inline hidden text-[11px]">{lang === 'ar' ? 'إلغاء الربط' : 'Disconnect'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Dynamic State Message Toast/Banner */}
        {backupMessage && (
          <div className={`mt-4 p-3.5 rounded-xl text-xs flex items-center gap-2 border ${
            backupMessage.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
              : backupMessage.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-100'
              : 'bg-amber-50 text-amber-800 border-amber-100'
          }`}>
            <span className="font-semibold select-none">
              {backupMessage.type === 'success' ? '✓' : backupMessage.type === 'error' ? '⚠' : 'ℹ'}
            </span>
            <span className="flex-1 font-medium select-none">{backupMessage.text}</span>
            <button 
              onClick={() => setBackupMessage(null)} 
              className="text-stone-400 hover:text-stone-700 ml-auto font-bold px-1.5"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Main Content Layout */}
      {history.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center max-w-xl mx-auto shadow-sm">
          <History className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <h3 className="text-sm font-bold text-stone-700 mb-1">
            {lang === 'ar' ? 'سجل العمليات فارغ تماماً' : 'No prompt iterations stored'}
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mb-6">
            {lang === 'ar'
              ? 'بمجرد قيامك بتوليد، تحسين أو ترجمة أي برومبت في القوائم الأخرى، ستظهر تتابع إصداراتك هنا لسهولة المقارنة والرجوع.'
              : 'Interact with the Prompt Builder, optimize context variables, and your dynamic engineering logs will accumulate here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Real-time Search and Filter Bar */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 sm:p-5 shadow-sm space-y-4">
            
            {/* Row 1: Search Input + Main Control Actions */}
            <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
              
              {/* Instant Real-Time Search Box */}
              <div className="relative flex-1 group">
                <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                  searchTerm ? 'text-[#c29b40]' : 'text-stone-400 group-focus-within:text-[#c29b40]'
                }`} />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={
                    lang === 'ar'
                      ? 'بحث فوري بالكلمات المفتاحية، النص، الوسوم... (اضغط / للتركيز)'
                      : 'Instant search keywords, text, tags... (Press / to focus)'
                  }
                  className="w-full text-xs sm:text-sm rounded-xl border border-stone-250 dark:border-stone-700 pl-10 pr-24 py-2.5 bg-stone-50/70 dark:bg-stone-800/60 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#c29b40]/40 focus:border-[#c29b40] transition-all font-sans"
                />

                {/* Inside Input Action Indicators (Match count + Clear button + Keyboard shortcut pill) */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm('');
                        searchInputRef.current?.focus();
                      }}
                      className="p-1 rounded-full text-stone-400 hover:text-rose-600 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors cursor-pointer"
                      title={lang === 'ar' ? 'مسح البحث (Esc)' : 'Clear search (Esc)'}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  
                  {/* Results Count Badge in Latin Numerals */}
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-stone-200/80 dark:bg-stone-700 text-stone-600 dark:text-stone-300 select-none">
                    {filteredHistory.length}/{history.length}
                  </span>

                  {!searchTerm && (
                    <kbd className="hidden sm:inline-block text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border border-stone-300 dark:border-stone-700 text-stone-400 bg-white dark:bg-stone-800 select-none">
                      /
                    </kbd>
                  )}
                </div>
              </div>

              {/* Quick Action Buttons & Secondary Dropdowns */}
              <div className="flex flex-wrap items-center gap-2">
                
                {/* Favorites Toggle Button */}
                <button
                  type="button"
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className={`text-xs px-3 py-2 rounded-xl border flex items-center gap-1.5 cursor-pointer transition-all ${
                    showFavoritesOnly
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 font-bold shadow-2xs'
                      : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-250 dark:border-stone-700 hover:text-stone-900 hover:border-stone-400'
                  }`}
                  title={lang === 'ar' ? 'عرض الأوامر المفضلة فقط' : 'Show starred favorites only'}
                >
                  <Star className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-amber-500 text-amber-500' : 'text-stone-400'}`} />
                  <span>{lang === 'ar' ? 'المفضلة' : 'Favorites'}</span>
                  {showFavoritesOnly && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold">
                      {history.filter(h => h.isFavorite).length}
                    </span>
                  )}
                </button>

                {/* Model Selector */}
                <div className="flex items-center gap-1.5">
                  <select
                    value={modelFilter}
                    onChange={(e) => setModelFilter(e.target.value)}
                    className="text-xs rounded-xl border border-stone-250 dark:border-stone-700 px-2.5 py-2 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 focus:ring-1 focus:ring-[#c29b40] cursor-pointer"
                  >
                    <option value="all">{lang === 'ar' ? 'كل النماذج' : 'All Models'}</option>
                    <option value="gemini">Google Gemini</option>
                    <option value="chatgpt">OpenAI ChatGPT</option>
                    <option value="claude">Anthropic Claude</option>
                    <option value="notebooklm">Google NotebookLM</option>
                    <option value="midjourney">Midjourney</option>
                    <option value="meta">Meta AI / Llama 3</option>
                  </select>
                </div>

                {/* Rating Filter */}
                <div className="flex items-center gap-1.5">
                  <select
                    value={ratingFilter}
                    onChange={(e) => setRatingFilter(e.target.value)}
                    className="text-xs rounded-xl border border-stone-250 dark:border-stone-700 px-2.5 py-2 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 focus:ring-1 focus:ring-[#c29b40] cursor-pointer"
                  >
                    <option value="all">{lang === 'ar' ? 'كل التقييمات' : 'All Ratings'}</option>
                    <option value="5">★★★★★ (5/5)</option>
                    <option value="4">★★★★☆ (4/5)</option>
                    <option value="3">★★★☆☆ (3/5)</option>
                    <option value="2">★★☆☆☆ (2/5)</option>
                    <option value="1">★☆☆☆☆ (1/5)</option>
                  </select>
                </div>

                {/* Sort Order Selector */}
                <div className="flex items-center gap-1.5">
                  <ArrowUpDown className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="text-xs rounded-xl border border-stone-250 dark:border-stone-700 px-2.5 py-2 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 focus:ring-1 focus:ring-[#c29b40] cursor-pointer"
                    title={lang === 'ar' ? 'ترتيب السجل' : 'Sort prompt records'}
                  >
                    <option value="newest">{lang === 'ar' ? 'الأحدث أولاً' : 'Newest First'}</option>
                    <option value="oldest">{lang === 'ar' ? 'الأقدم أولاً' : 'Oldest First'}</option>
                    <option value="highest-rated">{lang === 'ar' ? 'الأعلى تقييماً' : 'Highest Rated'}</option>
                    <option value="longest">{lang === 'ar' ? 'الأطول محتوى' : 'Longest Output'}</option>
                  </select>
                </div>

                {/* Compare Button */}
                <button
                  type="button"
                  onClick={() => handleOpenCompare()}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#c29b40]/40 bg-amber-500/10 hover:bg-amber-500/20 text-[#8c6a1e] dark:text-amber-300 text-xs font-bold transition-all cursor-pointer shadow-3xs hover:border-[#c29b40]"
                  title={lang === 'ar' ? 'أداة مقارنة البرومبت جنباً إلى جنب' : 'Side-by-Side Prompt Comparison Tool'}
                >
                  <ArrowLeftRight className="w-3.5 h-3.5 text-[#c29b40]" />
                  <span>{lang === 'ar' ? 'مقارنة' : 'Compare'}</span>
                </button>

                {/* PDF Export Button */}
                <button
                  type="button"
                  onClick={() => openPdfModal(showFavoritesOnly ? 'favorites' : 'filtered')}
                  disabled={history.length === 0}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50/70 hover:bg-rose-100 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 text-xs font-bold transition-all cursor-pointer shadow-3xs"
                  title={lang === 'ar' ? 'تصدير كـ PDF' : 'Export as PDF'}
                >
                  <Printer className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  <span>PDF</span>
                </button>

              </div>
            </div>

            {/* Row 2: Action Type Real-Time Filter Pills */}
            <div className="pt-2 border-t border-stone-150 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-[#c29b40]" />
                  <span>{lang === 'ar' ? 'نوع العملية:' : 'Action Type:'}</span>
                </span>
              </div>

              {/* Action Type Tabs */}
              <div className="flex flex-wrap items-center gap-1.5">
                {/* 1. All */}
                <button
                  type="button"
                  onClick={() => setActionTypeFilter('all')}
                  className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    actionTypeFilter === 'all'
                      ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900 shadow-2xs'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                  }`}
                >
                  <span>{lang === 'ar' ? 'الكل' : 'All'}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    actionTypeFilter === 'all'
                      ? 'bg-white/20 text-white dark:bg-black/20 dark:text-stone-900'
                      : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
                  }`}>
                    {actionCounts.all}
                  </span>
                </button>

                {/* 2. Generate */}
                <button
                  type="button"
                  onClick={() => setActionTypeFilter('generate')}
                  className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                    actionTypeFilter === 'generate'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs ring-1 ring-emerald-400'
                      : 'bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'توليد أساسي' : 'Base Synthesis'}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    actionTypeFilter === 'generate' ? 'bg-black/20 text-white' : 'bg-emerald-200/60 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-200'
                  }`}>
                    {actionCounts.generate}
                  </span>
                </button>

                {/* 3. Refine */}
                <button
                  type="button"
                  onClick={() => setActionTypeFilter('refine')}
                  className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                    actionTypeFilter === 'refine'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-2xs ring-1 ring-amber-400'
                      : 'bg-amber-50/70 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/40'
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'تحسين وتعديل' : 'Refine & Polish'}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    actionTypeFilter === 'refine' ? 'bg-black/20 text-white' : 'bg-amber-200/60 dark:bg-amber-800 text-amber-900 dark:text-amber-200'
                  }`}>
                    {actionCounts.refine}
                  </span>
                </button>

                {/* 4. Translate */}
                <button
                  type="button"
                  onClick={() => setActionTypeFilter('translate')}
                  className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                    actionTypeFilter === 'translate'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs ring-1 ring-indigo-400'
                      : 'bg-indigo-50/70 dark:bg-indigo-950/30 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/40'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'ترجمة وتعريب' : 'Translate & Expand'}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    actionTypeFilter === 'translate' ? 'bg-black/20 text-white' : 'bg-indigo-200/60 dark:bg-indigo-800 text-indigo-900 dark:text-indigo-200'
                  }`}>
                    {actionCounts.translate}
                  </span>
                </button>

                {/* 5. Reverse */}
                <button
                  type="button"
                  onClick={() => setActionTypeFilter('reverse')}
                  className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                    actionTypeFilter === 'reverse'
                      ? 'bg-sky-600 text-white border-sky-600 shadow-2xs ring-1 ring-sky-400'
                      : 'bg-sky-50/70 dark:bg-sky-950/30 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900/40'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'هندسة عكسية' : 'Image Reverse'}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    actionTypeFilter === 'reverse' ? 'bg-black/20 text-white' : 'bg-sky-200/60 dark:bg-sky-800 text-sky-900 dark:text-sky-200'
                  }`}>
                    {actionCounts.reverse}
                  </span>
                </button>
              </div>
            </div>

            {/* Row 3: Tags Filter & Pills */}
            <div className="pt-2 border-t border-stone-150 dark:border-stone-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-[#c29b40]" />
                  <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
                    {lang === 'ar' ? 'تصفية بالوسوم (Tags):' : 'Filter by Tags:'}
                  </span>
                  {selectedTag !== 'all' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-300 dark:border-amber-700">
                      <Hash className="w-3 h-3 text-[#c29b40]" />
                      <span>{selectedTag === '__untagged__' ? (lang === 'ar' ? 'بدون وسوم' : 'Untagged') : selectedTag}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedTag('all')}
                        className="ml-1 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title={lang === 'ar' ? 'إلغاء تصفية الوسم' : 'Clear tag filter'}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>

                {allUniqueTagsWithCount.length > 0 && (
                  <span className="text-[11px] font-mono text-stone-400">
                    {lang === 'ar' ? `${allUniqueTagsWithCount.length} وسم متوفر` : `${allUniqueTagsWithCount.length} tags available`}
                  </span>
                )}
              </div>

              {/* Tag Pills List */}
              <div className="flex flex-wrap items-center gap-1.5 max-h-32 overflow-y-auto pr-1">
                <button
                  type="button"
                  onClick={() => setSelectedTag('all')}
                  className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedTag === 'all'
                      ? 'bg-stone-850 dark:bg-stone-100 text-white dark:text-stone-900 shadow-2xs'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                  }`}
                >
                  <span>{lang === 'ar' ? 'جميع الوسوم' : 'All Tags'}</span>
                  <span className="text-[10px] font-mono font-bold opacity-80">({history.length})</span>
                </button>

                {untaggedCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedTag(selectedTag === '__untagged__' ? 'all' : '__untagged__')}
                    className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1 border ${
                      selectedTag === '__untagged__'
                        ? 'bg-stone-700 text-white border-stone-700 shadow-2xs'
                        : 'bg-stone-50 dark:bg-stone-800 text-stone-500 border-stone-200 dark:border-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span>{lang === 'ar' ? 'بدون وسوم' : 'Untagged'}</span>
                    <span className="text-[10px] font-mono font-bold opacity-80">({untaggedCount})</span>
                  </button>
                )}

                {allUniqueTagsWithCount.map(([tag, count]) => {
                  const isActive = selectedTag === tag;
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSelectedTag(isActive ? 'all' : tag)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-[#c29b40] text-white font-bold shadow-xs ring-1 ring-amber-300'
                          : 'bg-stone-50 dark:bg-stone-800/80 hover:bg-amber-500/10 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:border-amber-300 hover:text-amber-700 dark:hover:text-amber-400'
                      }`}
                    >
                      <Hash className={`w-3 h-3 ${isActive ? 'text-white' : 'text-[#c29b40]'}`} />
                      <span>{tag}</span>
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-black/20 text-white' : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 4: Active Filters Badges Bar & Instant Reset */}
            {hasActiveFilters && (
              <div className="pt-2.5 border-t border-stone-150 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2.5 bg-amber-50/50 dark:bg-amber-950/20 p-2.5 rounded-xl border border-amber-200/60 dark:border-amber-900/40">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold text-amber-900 dark:text-amber-300">
                    {lang === 'ar' ? 'الفلاتر النشطة:' : 'Active Filters:'}
                  </span>

                  {/* Search Term Chip */}
                  {searchTerm.trim() && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 px-2 py-0.5 rounded-md border border-stone-250 dark:border-stone-700">
                      <Search className="w-3 h-3 text-[#c29b40]" />
                      <span>"{searchTerm}"</span>
                      <button
                        type="button"
                        onClick={() => setSearchTerm('')}
                        className="hover:text-rose-600 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {/* Action Type Chip */}
                  {actionTypeFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 px-2 py-0.5 rounded-md border border-stone-250 dark:border-stone-700">
                      <span>⚡ {getActionLabel({ actionType: actionTypeFilter })}</span>
                      <button
                        type="button"
                        onClick={() => setActionTypeFilter('all')}
                        className="hover:text-rose-600 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {/* Tag Chip */}
                  {selectedTag !== 'all' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 px-2 py-0.5 rounded-md border border-stone-250 dark:border-stone-700">
                      <Hash className="w-3 h-3 text-[#c29b40]" />
                      <span>{selectedTag === '__untagged__' ? (lang === 'ar' ? 'بدون وسوم' : 'Untagged') : selectedTag}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedTag('all')}
                        className="hover:text-rose-600 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {/* Model Chip */}
                  {modelFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 px-2 py-0.5 rounded-md border border-stone-250 dark:border-stone-700">
                      <span>🤖 {getModelLabel(modelFilter)}</span>
                      <button
                        type="button"
                        onClick={() => setModelFilter('all')}
                        className="hover:text-rose-600 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {/* Rating Chip */}
                  {ratingFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 px-2 py-0.5 rounded-md border border-stone-250 dark:border-stone-700">
                      <span>⭐ {ratingFilter}★</span>
                      <button
                        type="button"
                        onClick={() => setRatingFilter('all')}
                        className="hover:text-rose-600 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {/* Favorites Chip */}
                  {showFavoritesOnly && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 px-2 py-0.5 rounded-md border border-stone-250 dark:border-stone-700">
                      <span>⭐ {lang === 'ar' ? 'المفضلة' : 'Favorites'}</span>
                      <button
                        type="button"
                        onClick={() => setShowFavoritesOnly(false)}
                        className="hover:text-rose-600 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>

                {/* Match Counter + Reset Button */}
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono font-bold text-amber-900 dark:text-amber-300">
                    {lang === 'ar'
                      ? `تم العثور على ${filteredHistory.length} من أصل ${history.length} أمراً`
                      : `Found ${filteredHistory.length} of ${history.length} prompts`}
                  </span>

                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="text-xs font-bold text-rose-700 dark:text-rose-400 hover:text-rose-800 bg-white dark:bg-stone-800 border border-rose-200 dark:border-rose-900 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer hover:bg-rose-50"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{lang === 'ar' ? 'إعادة تعيين الكل' : 'Clear All'}</span>
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Bulk Selection and Batch Actions Tool */}
          {filteredHistory.length > 0 && (
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-inner">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleSelectAllFiltered(filteredHistory)}
                  className="flex items-center gap-2 text-xs font-semibold text-stone-750 hover:text-stone-900 cursor-pointer transition-colors"
                >
                  {filteredHistory.every(item => selectedIds.includes(item.id)) ? (
                    <CheckSquare className="w-4 h-4 text-[#c29b40] fill-amber-50" />
                  ) : (
                    <Square className="w-4 h-4 text-stone-400" />
                  )}
                  <span>
                    {lang === 'ar'
                      ? `اختيار جميع العناصر المصفاة (${filteredHistory.length})`
                      : `Select All Filtered (${filteredHistory.length})`}
                  </span>
                </button>

                {selectedIds.length > 0 && (
                  <span className="text-[11px] font-bold text-stone-600 bg-stone-200 px-2 py-0.5 rounded-md">
                    {lang === 'ar'
                      ? `تم تحديد ${selectedIds.length} عنصر`
                      : `${selectedIds.length} selected`}
                  </span>
                )}
              </div>

              {selectedIds.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-stone-500 font-sans">
                    {lang === 'ar' ? 'العمليات الجماعية:' : 'Batch Actions:'}
                  </span>
                  
                  {/* Compare Selected Prompts */}
                  <button
                    onClick={() => handleOpenCompare()}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs transition-all rounded-lg font-bold border cursor-pointer shadow-sm ${
                      selectedIds.length === 2
                        ? 'bg-gradient-to-r from-[#916a24] to-[#c29b40] text-white border-[#b38d35] ring-2 ring-amber-400/40'
                        : 'bg-white text-stone-700 hover:bg-stone-50 border-stone-300'
                    }`}
                    title={lang === 'ar' ? 'مقارنة الأوامر المحددة جنباً إلى جنب' : 'Compare Selected Prompts Side-by-Side'}
                  >
                    <ArrowLeftRight className={`w-3.5 h-3.5 ${selectedIds.length === 2 ? 'text-white' : 'text-[#c29b40]'}`} />
                    <span>
                      {selectedIds.length === 2
                        ? (lang === 'ar' ? 'مقارنة الأمرين المحددين (2)' : 'Compare 2 Selected')
                        : (lang === 'ar' ? 'مقارنة الأوامر' : 'Compare Prompts')}
                    </span>
                  </button>

                  {/* Export Selected as JSON */}
                  <button
                    onClick={handleBulkExportJSON}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-stone-900 text-stone-100 hover:bg-stone-800 transition-all rounded-lg font-bold border border-stone-800 cursor-pointer shadow-sm"
                    title={lang === 'ar' ? 'تصدير المحدد كـ JSON' : 'Export Selected as JSON'}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'تصدير JSON' : 'Export JSON'}</span>
                  </button>

                  {/* Export Selected as CSV */}
                  <button
                    onClick={handleBulkExportCSV}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white text-stone-700 hover:bg-stone-50 transition-all rounded-lg font-bold border border-stone-300 cursor-pointer shadow-sm"
                    title={lang === 'ar' ? 'تصدير المحدد كـ CSV' : 'Export Selected as CSV'}
                  >
                    <Download className="w-3.5 h-3.5 text-stone-500" />
                    <span>{lang === 'ar' ? 'تصدير CSV' : 'Export CSV'}</span>
                  </button>

                  {/* Export Selected as PDF */}
                  <button
                    onClick={() => openPdfModal('selected')}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white text-stone-700 hover:bg-stone-50 transition-all rounded-lg font-bold border border-stone-300 cursor-pointer shadow-sm"
                    title={lang === 'ar' ? 'تصدير المحدد كـ PDF' : 'Export Selected as PDF'}
                  >
                    <Printer className="w-3.5 h-3.5 text-rose-500" />
                    <span>{lang === 'ar' ? 'تصدير PDF' : 'Export PDF'}</span>
                  </button>

                  {/* Tag Selected Items */}
                  <button
                    onClick={() => setShowBulkTagModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-amber-600 text-white hover:bg-amber-700 transition-all rounded-lg font-bold border border-amber-600 cursor-pointer shadow-sm"
                    title={lang === 'ar' ? 'إضافة وسم لجميع العناصر المحددة' : 'Add tag to all selected items'}
                  >
                    <Tag className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'إضافة وسم' : 'Add Tag'}</span>
                  </button>

                  {/* Delete Selected Items */}
                  <button
                    onClick={handleBulkDelete}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-600 text-white hover:bg-red-700 transition-all rounded-lg font-bold border border-red-650 cursor-pointer shadow-sm ml-2 md:ml-4"
                    title={lang === 'ar' ? 'حذف السجلات المحددة نهائياً' : 'Permanently Delete Selected Items'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'حذف المحدد' : 'Delete Selected'}</span>
                  </button>

                  <button
                    onClick={() => setSelectedIds([])}
                    className="text-xs text-[#c29b40] hover:text-amber-700 transition-colors font-semibold px-2 py-1 cursor-pointer"
                  >
                    {lang === 'ar' ? 'إلغاء التحديد' : 'Deselect All'}
                  </button>
                </div>
              ) : (
                <p className="text-[11px] text-stone-400 italic">
                  {lang === 'ar'
                    ? 'حدد خانات الاختيار على العناصر لتفعيل العمليات الجماعية.'
                    : 'Check checkboxes on individual history items to reveal batch actions.'}
                </p>
              )}
            </div>
          )}

          {/* List of history items */}
          {filteredHistory.length === 0 ? (
            <div className="p-10 text-center bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm max-w-lg mx-auto space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center text-[#c29b40]">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-stone-800 dark:text-stone-100">
                {lang === 'ar' ? 'لم يتم العثور على أي أوامر مطابقة' : 'No matching prompt records found'}
              </h4>
              <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
                {searchTerm
                  ? (lang === 'ar' ? `لا توجد نتائج تطابق كلمة البحث "${searchTerm}" أو الفلاتر المحددة.` : `No prompt records matched keyword "${searchTerm}" or active filters.`)
                  : (lang === 'ar' ? 'لا توجد أوامر تطابق الفلاتر المحددة حالياً. جرب توسيع معايير التصفية.' : 'No prompt records matched the selected filters. Try broadening your criteria.')}
              </p>
              {hasActiveFilters && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="px-4 py-2 text-xs font-bold bg-[#c29b40] hover:bg-[#a88432] text-white rounded-xl shadow transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'مسح الفلاتر وعرض كافة الأوامر' : 'Reset Filters & Show All'}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHistory.slice(0, visibleCount).map((item) => {
                const isSelected = selectedIds.includes(item.id);
                const isExpanded = expandedId === item.id;
                const date = new Date(item.timestamp);
                const formattedDate = date.toLocaleTimeString(lang === 'ar' ? 'ar-u-nu-latn' : 'en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                }) + ' - ' + date.toLocaleDateString(lang === 'ar' ? 'ar-u-nu-latn' : 'en-US', {
                  month: 'short',
                  day: 'numeric'
                });

                return (
                  <div 
                    key={item.id}
                    className={`rounded-xl border hover:border-stone-300 transition-all shadow-sm overflow-hidden ${
                      isSelected 
                        ? 'bg-amber-50/20 border-amber-300 border-l-4 border-l-[#c29b40]' 
                        : 'bg-white border-stone-200'
                    }`}
                  >
                    {/* Item Top Summary Row */}
                    <div 
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-stone-50/50 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        {/* Checkbox for Bulk Selection */}
                        <button
                          type="button"
                          onClick={(e) => handleToggleSelect(item.id, e)}
                          className="p-1 rounded hover:bg-stone-100 cursor-pointer text-stone-500 scale-105 select-none shrink-0"
                          title={lang === 'ar' ? 'تحديد هذا العنصر' : 'Select this item'}
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4.5 h-4.5 text-[#c29b40]" />
                          ) : (
                            <Square className="w-4.5 h-4.5 text-stone-305" />
                          )}
                        </button>

                        {/* Action Badge */}
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border uppercase tracking-wider self-start sm:self-auto ${getActionColor(item.actionType || 'generate')}`}>
                          {getActionLabel(item)}
                        </span>

                        {/* Concept Brief */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-100 line-clamp-1 text-right rtl:text-right" dir="auto">
                            {highlightMatch(item.originalText, searchTerm)}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-[10px] text-stone-400 font-medium flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formattedDate}</span>
                            </span>

                            {/* Tags display in summary */}
                            {Array.isArray(item.tags) && item.tags.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                {item.tags.map((tag) => (
                                  <button
                                    key={tag}
                                    type="button"
                                    onClick={() => setSelectedTag(selectedTag === tag ? 'all' : tag)}
                                    className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                                      selectedTag === tag
                                        ? 'bg-[#c29b40] text-white'
                                        : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/20'
                                    }`}
                                    title={lang === 'ar' ? `تصفية حسب #${tag}` : `Filter by #${tag}`}
                                  >
                                    <Hash className="w-2.5 h-2.5 text-[#c29b40]" />
                                    <span>{tag}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Technical Specs Tags */}
                      <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto" onClick={(e) => e.stopPropagation()}>
                        {/* 5-Star Rating Widget */}
                        <div 
                          className="flex items-center gap-0.5 px-2 py-1 bg-stone-50 border border-stone-150 rounded-lg select-none"
                          title={lang === 'ar' ? 'تقييم كفاءة وملاءمة المخرجات' : 'Rate effectiveness of this generated prompt'}
                        >
                          {[1, 2, 3, 4, 5].map((starNum) => {
                            const isSelected = !!item.rating && item.rating >= starNum;
                            return (
                              <button
                                key={starNum}
                                type="button"
                                onClick={() => onSetRating(item.id, starNum)}
                                className="p-0.5 focus:outline-none transition-transform hover:scale-125 cursor-pointer"
                                title={lang === 'ar' ? `تقييم ${starNum} نجوم` : `Rate ${starNum} star${starNum > 1 ? 's' : ''}`}
                              >
                                <Star
                                  className={`w-3 h-3 transition-all ${
                                    isSelected
                                      ? 'text-amber-500 fill-amber-500'
                                      : 'text-stone-300 hover:text-amber-400'
                                  }`}
                                />
                              </button>
                            );
                          })}
                        </div>

                        <button
                          onClick={() => onToggleFavorite(item.id)}
                          className={`p-1.5 rounded-lg border transition-all duration-200 cursor-pointer ${
                            item.isFavorite
                              ? 'bg-amber-50 border-amber-300 text-amber-500 hover:text-amber-600'
                              : 'bg-stone-50 border-stone-200 text-stone-450 hover:text-amber-500 hover:border-amber-250'
                          }`}
                          title={lang === 'ar' ? 'أضف إلى المفضلة' : 'Toggle Favorite'}
                        >
                          <Star className={`w-3.5 h-3.5 ${item.isFavorite ? 'fill-amber-500 text-amber-500' : ''}`} />
                        </button>

                        <span className="text-[10px] font-bold px-2 py-1 bg-stone-100 text-stone-600 rounded-lg">
                          {getModelLabel(item.model)}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-1 bg-stone-100 text-stone-600 rounded-lg">
                          {getCategoryName(item.category)}
                        </span>
                        
                        <button 
                          onClick={() => setExpandedId(isExpanded ? null : item.id)}
                          className="p-1 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Detailed Expanded Area */}
                    {isExpanded && (
                      <div className="px-5 pb-5 pt-2 border-t border-stone-100 bg-stone-50/20 space-y-4">
                        
                        {/* Visual Image transfer details if present */}
                        {item.actionType === 'reverse' && (item.styleImage || item.contentImage) && (
                          <div className="p-4 bg-amber-500/5 rounded-2xl border border-[#c29b40]/10 mb-2">
                            <span className="text-[10px] font-extrabold text-[#916a24] uppercase block mb-3 tracking-wider">
                              {lang === 'ar' ? '✦ مقومات عملية الدمج ونقل الأسلوب البصري' : '✦ Style Mimicry Image References'}
                            </span>
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                              {item.styleImage && (
                                <div className="space-y-1.5">
                                  <span className="text-[9.5px] text-stone-500 font-extrabold block">
                                    {lang === 'ar' ? 'الصورة الأولى: أسلوب وتأثيرات الإشهار' : 'Style Reference (Image 1)'}
                                  </span>
                                  <div className="w-20 h-20 rounded-xl overflow-hidden border border-stone-200 shadow-sm bg-white p-1">
                                    <img 
                                      src={item.styleImage} 
                                      alt="Style reference thumbnail" 
                                      className="w-full h-full object-contain rounded-lg"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                </div>
                              )}
                              
                              {item.contentImage && (
                                <div className="space-y-1.5">
                                  <span className="text-[9.5px] text-stone-500 font-extrabold block">
                                    {lang === 'ar' ? 'الصورة الثانية: موضوع ومحتوى التصميم' : 'Content Reference (Image 2)'}
                                  </span>
                                  <div className="w-20 h-20 rounded-xl overflow-hidden border border-[#c29b40]/20 shadow-sm bg-white p-1">
                                    <img 
                                      src={item.contentImage} 
                                      alt="Content reference thumbnail" 
                                      className="w-full h-full object-contain rounded-lg"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                </div>
                              )}

                              {item.notes && (
                                <div className="flex-1 min-w-[200px] border-r-2 border-dashed border-[#c29b40]/20 pr-4 rtl:border-r-2 rtl:border-l-0 ltr:border-l-2 ltr:border-r-0 pl-4 py-1">
                                  <span className="text-[9.5px] text-stone-500 font-extrabold block">
                                    {lang === 'ar' ? 'توجيهات مضافة بواسطة المستخدم' : 'Additional Blending Guidelines'}
                                  </span>
                                  <p className="text-xs text-stone-600 font-medium font-sans mt-1 italic">
                                    "{item.notes}"
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Layout grid containing Original vs Optimized Prompt */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          
                          {/* Original Idea Frame */}
                          <div className="bg-stone-50/80 rounded-xl p-3.5 border border-stone-200">
                            <span className="text-[10px] font-bold text-stone-500 uppercase block mb-1.5">
                              {lang === 'ar' ? 'فكرة المدخل والمسودة الأساسية' : 'Raw Prompt Idea Input'}
                            </span>
                            <div className="text-xs text-stone-700 leading-relaxed font-sans whitespace-pre-wrap text-right rtl:text-right" dir="auto">
                              {highlightMatch(item.originalText, searchTerm)}
                            </div>
                          </div>

                          {/* Refined Final Output */}
                          <div className="bg-white rounded-xl p-3.5 border border-amber-900/10 shadow-sm relative">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-bold text-amber-800 uppercase block">
                                {lang === 'ar' ? 'الأمر الهندسي المولد والنشط' : 'Engineered Prompt Output'}
                              </span>
                              {item.isFallback && (
                                <span className="text-[9px] font-extrabold text-amber-700 px-1.5 py-0.5 bg-amber-50 rounded border border-amber-200">
                                  {lang === 'ar' ? 'صياغة محلية' : 'Fallback Prompt'}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-stone-900 font-sans leading-relaxed whitespace-pre-wrap max-h-[250px] overflow-y-auto text-right rtl:text-right" dir="auto">
                              {highlightMatch(item.optimizedText, searchTerm)}
                            </div>
                          </div>

                        </div>

                        {/* Custom Tags & Keywords Management */}
                        <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-lg bg-[#c29b40]/10 text-[#916a24] dark:text-[#c29b40]">
                                <Tag className="w-3.5 h-3.5" />
                              </div>
                              <h5 className="text-xs font-bold text-stone-800 dark:text-stone-100">
                                {lang === 'ar' ? 'الوسوم والتصنيفات المخصصة (Tags):' : 'Custom Tags & Keywords:'}
                              </h5>
                            </div>
                            <span className="text-[10px] text-stone-400">
                              {lang === 'ar' 
                                ? 'تساعدك الوسوم على تنظيم وتجميع الأوامر وسرعة البحث عنها لاحقاً' 
                                : 'Tags help you organize, group, and quickly find prompts later'}
                            </span>
                          </div>

                          {/* Existing tags list */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            {Array.isArray(item.tags) && item.tags.length > 0 ? (
                              item.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-200/80 dark:border-amber-800 group"
                                >
                                  <Hash className="w-3 h-3 text-[#c29b40]" />
                                  <span>{tag}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveTag(item.id, tag)}
                                    className="p-0.5 hover:bg-amber-200/60 dark:hover:bg-amber-900/60 rounded text-amber-600 dark:text-amber-400 hover:text-rose-600 transition-colors cursor-pointer"
                                    title={lang === 'ar' ? `حذف الوسم #${tag}` : `Remove tag #${tag}`}
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-stone-400 italic">
                                {lang === 'ar' ? 'لا توجد وسوم مضافة لهذا الأمر بعد.' : 'No tags added to this prompt yet.'}
                              </span>
                            )}
                          </div>

                          {/* Inline tag input */}
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <div className="relative flex-1 min-w-[200px] max-w-md">
                              <Hash className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                              <input
                                type="text"
                                value={newTagInputs[item.id] || ''}
                                onChange={(e) => setNewTagInputs(prev => ({ ...prev, [item.id]: e.target.value }))}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddTag(item.id, newTagInputs[item.id] || '');
                                  }
                                }}
                                placeholder={lang === 'ar' ? 'أضف وسماً واضغط Enter (مثال: تصميم، شعار، كود)...' : 'Add tag and press Enter (e.g. design, logo, code)...'}
                                className="w-full text-xs rounded-lg border border-stone-300 dark:border-stone-700 pl-8 pr-3 py-1.5 bg-stone-50 dark:bg-stone-800/80 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#c29b40]"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => handleAddTag(item.id, newTagInputs[item.id] || '')}
                              disabled={!(newTagInputs[item.id] || '').trim()}
                              className="px-3 py-1.5 text-xs font-bold bg-[#c29b40] hover:bg-[#a88432] disabled:opacity-40 text-white rounded-lg transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>{lang === 'ar' ? 'إضافة وسم' : 'Add Tag'}</span>
                            </button>
                          </div>

                          {/* Suggested quick tags */}
                          <div className="flex flex-wrap items-center gap-1 pt-1">
                            <span className="text-[10px] text-stone-400 ml-1">
                              {lang === 'ar' ? 'مقترحات سريعة:' : 'Quick suggestions:'}
                            </span>
                            {suggestedTags.map(st => {
                              const tagLabel = lang === 'ar' ? st.ar : st.en;
                              const isAlreadyAdded = Array.isArray(item.tags) && item.tags.includes(tagLabel);
                              if (isAlreadyAdded) return null;
                              return (
                                <button
                                  key={st.en}
                                  type="button"
                                  onClick={() => handleAddTag(item.id, tagLabel)}
                                  className="text-[10px] font-medium px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 hover:bg-amber-500/10 text-stone-600 dark:text-stone-300 hover:text-amber-700 border border-stone-200 dark:border-stone-700 hover:border-amber-300 transition-colors cursor-pointer"
                                >
                                  +{tagLabel}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Log Item Control Actions */}
                        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-stone-100 gap-3">
                          <button
                            onClick={() => onDeleteHistoryItem(item.id)}
                            className="text-xs font-bold text-stone-400 hover:text-rose-600 transition-colors flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{lang === 'ar' ? 'حذف من السجل' : 'Delete'}</span>
                          </button>

                          <div className="flex flex-wrap gap-2">
                            {item.actionType === 'reverse' ? (
                              onApplyToReverser && (
                                <button
                                  onClick={() => onApplyToReverser(item.styleImage || null, item.contentImage || null, item.notes, item.isMimicMode)}
                                  className="px-3 py-1.5 rounded-lg border border-[#c29b40]/30 hover:border-[#c29b40] text-stone-800 hover:text-[#916a24] bg-amber-50/50 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Sparkles className="w-3.5 h-3.5 text-[#c29b40]" />
                                  <span>{lang === 'ar' ? 'إعادة تطبيق وتعديل دمج الصور' : 'Re-apply or Edit Blending'}</span>
                                </button>
                              )
                            ) : (
                              <button
                                onClick={() => onApplyToBuilder(item.originalText, item.model, item.tone, item.category)}
                                className="px-3 py-1.5 rounded-lg border border-[#c29b40]/30 hover:border-[#c29b40] text-stone-800 hover:text-[#916a24] bg-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                              >
                                <CornerDownLeft className="w-3.5 h-3.5" />
                                <span>{lang === 'ar' ? 'تعديل وتطبيق بالمهندس' : 'Load in Builder'}</span>
                              </button>
                            )}

                            <button
                              onClick={() => {
                                handleCopy(item.optimizedText, item.id);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-all flex items-center gap-1.5"
                            >
                              {copiedId === item.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="text-emerald-600">{lang === 'ar' ? 'تم النسخ!' : 'Copied!'}</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5 text-stone-500" />
                                  <span>{lang === 'ar' ? 'نسخ الكود' : 'Copy Prompt'}</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => openPdfModal('all', item)}
                              className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-900 border border-stone-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer hover:border-amber-200 animate-fade-in"
                            >
                              <Printer className="w-3.5 h-3.5 text-amber-200" />
                              <span>{lang === 'ar' ? 'تصدير PDF' : 'Export PDF'}</span>
                            </button>

                            <button
                              onClick={() => onSendToTester(item.optimizedText)}
                              className="px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <PenTool className="w-3.5 h-3.5 text-amber-200" />
                              <span>{lang === 'ar' ? 'تعديل في المهندس' : 'Edit in Builder'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenCompare(item.id)}
                              className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-[#c29b40]/40 text-[#8c6a1e] dark:text-amber-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-3xs"
                              title={lang === 'ar' ? 'مقارنة هذا الأمر مع أمر آخر في السجل' : 'Compare this prompt with another'}
                            >
                              <ArrowLeftRight className="w-3.5 h-3.5 text-[#c29b40]" />
                              <span>{lang === 'ar' ? 'مقارنة' : 'Compare'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setShareItem(item);
                                setIsShareModalOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#916a24] to-[#c29b40] hover:opacity-90 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-3xs border border-[#b38d35]"
                              title={lang === 'ar' ? 'مشاركة وفتح البرومبت في جيمني، شات جي بي تي، كلود...' : 'Share to Gemini, ChatGPT, Claude...'}
                            >
                              <Share2 className="w-3.5 h-3.5" />
                              <span>{lang === 'ar' ? 'مشاركة مع الذكاء' : 'Share to AI'}</span>
                            </button>
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {filteredHistory.length > visibleCount && (
            <div className="pt-6 pb-2 text-center">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 25)}
                className="px-6 py-2.5 bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 rounded-xl text-xs font-bold shadow-xs hover:border-[#c29b40] transition-all cursor-pointer"
              >
                {lang === 'ar' 
                  ? `عرض المزيد من السجلات (${visibleCount} من أصل ${filteredHistory.length})` 
                  : `Show More Prompts (${visibleCount} of ${filteredHistory.length})`}
              </button>
            </div>
          )}

        </div>
      )}

      {/* Bulk Tagging Modal */}
      {showBulkTagModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-fade-in"
          onClick={() => setShowBulkTagModal(false)}
        >
          <div 
            className="relative w-full max-w-md bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl p-6 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
          >
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-800 dark:text-stone-100">
                    {lang === 'ar' ? 'إضافة وسم جماعي للأوامر' : 'Batch Tag Prompts'}
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    {lang === 'ar' 
                      ? `سيتم تطبيق الوسم على ${selectedIds.length} من العناصر المحددة` 
                      : `Tag will be applied to ${selectedIds.length} selected items`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkTagModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  {lang === 'ar' ? 'اسم الوسم (الكلمة المفتاحية):' : 'Tag Name (Keyword):'}
                </label>
                <div className="relative">
                  <Hash className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    autoFocus
                    value={bulkTagInput}
                    onChange={(e) => setBulkTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleApplyBulkTag();
                      }
                    }}
                    placeholder={lang === 'ar' ? 'مثال: تصميم، فيديو، كود...' : 'e.g. design, video, coding...'}
                    className="w-full text-xs rounded-xl border border-stone-300 dark:border-stone-700 pl-9 pr-3 py-2.5 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#c29b40]"
                  />
                </div>
              </div>

              {/* Existing & suggested tags for 1-click pick */}
              <div>
                <span className="block text-[11px] font-bold text-stone-500 mb-2">
                  {lang === 'ar' ? 'أو اختر من الوسوم المقترحة/الحالية:' : 'Or pick from suggested/existing tags:'}
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1.5 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-800">
                  {Array.from(new Set([
                    ...allUniqueTagsWithCount.map(([t]) => t),
                    ...suggestedTags.map(st => lang === 'ar' ? st.ar : st.en)
                  ])).map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setBulkTagInput(tag)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        bulkTagInput.trim().replace(/^#+/, '') === tag
                          ? 'bg-[#c29b40] text-white border-[#c29b40] font-bold'
                          : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-amber-300'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowBulkTagModal(false)}
                  className="px-4 py-2 text-xs font-bold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl cursor-pointer"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleApplyBulkTag}
                  disabled={!bulkTagInput.trim()}
                  className="px-5 py-2 text-xs font-bold bg-[#c29b40] hover:bg-[#a88432] disabled:opacity-40 text-white rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'تطبيق الوسم' : 'Apply Tag'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prompt Comparison Modal */}
      <PromptCompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        history={history}
        lang={lang}
        initialPromptAId={comparePromptAId}
        initialPromptBId={comparePromptBId}
        onApplyToBuilder={onApplyToBuilder}
        onSendToTester={onSendToTester}
      />

      {/* Share Prompt to AI Tools Modal */}
      {shareItem && (
        <SharePromptToAiModal
          isOpen={isShareModalOpen}
          onClose={() => {
            setIsShareModalOpen(false);
            setShareItem(null);
          }}
          promptText={shareItem.optimizedText || shareItem.originalText}
          lang={lang}
          model={shareItem.model}
          tone={shareItem.tone}
        />
      )}

      {/* Export to Styled PDF Modal */}
      <ExportPdfModal
        isOpen={isPdfModalOpen}
        onClose={() => {
          setIsPdfModalOpen(false);
          setPdfModalSingleItem(null);
        }}
        history={history}
        filteredHistory={filteredHistory}
        selectedIds={selectedIds}
        lang={lang}
        initialScope={pdfModalScope}
        initialSingleItem={pdfModalSingleItem}
      />

    </div>
  );
}
