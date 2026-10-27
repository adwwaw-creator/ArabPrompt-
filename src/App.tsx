/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import VisitorCounter from './components/VisitorCounter';
import PromptBuilder from './components/PromptBuilder';
import CinemaMovieStudio from './components/CinemaMovieStudio';
import PromptHistory from './components/PromptHistory';
import PromptReverser from './components/PromptReverser';
import PromptSequence from './components/PromptSequence';
import VideoPromptDesigner from './components/VideoPromptDesigner';
import PromptIdeaGenerator from './components/PromptIdeaGenerator';
import DiffusionDBGuide from './components/DiffusionDBGuide';
import CloudBackupCenter from './components/CloudBackupCenter';
import PrivacySettings from './components/PrivacySettings';
import Pricing from './components/Pricing';
import PromptTemplates from './components/PromptTemplates';
import VisualConceptLibrary from './components/VisualConceptLibrary';
import AuthModal, { AuthMode } from './components/AuthModal';
import CheckoutModal from './components/CheckoutModal';
import PaywallGate from './components/PaywallGate';
import { getSubscription, UserSubscription, SubscriptionPlan, recordGenerationUsage, isPaidSubscriber } from './utils/subscriptionService';
import { BackupMetadata, getBackupConfig, saveBackupConfig, searchGDriveBackup, uploadGDriveBackup, uploadDropboxBackup, backupToDropboxSimulated, backupToICloudSimulated, backupToCustomBackendSimulated } from './utils/cloudBackup';
import { ActiveTab, PromptHistoryItem, ModelType, AppLanguage, SUPPORTED_LANGUAGES } from './types';
import { ToastNotification } from './components/ToastNotification';
import { Sparkles, Crown } from 'lucide-react';
import { User } from 'firebase/auth';
import { initAuth, googleSignIn, logout } from './utils/firebaseAuth';
import {
  syncUserProfile,
  getUserHistory,
  addUserHistoryItem,
  updateUserHistoryItem,
  deleteUserHistoryItem,
  deleteMultipleUserHistoryItems,
  clearUserHistory,
  syncAllHistoryToFirestore,
  testFirestoreConnection
} from './utils/firestoreService';

/**
 * Safely saves the prompt history to localStorage by handling QuotaExceededErrors.
 * If saving fails due to space limits (e.g. from big base64 images in Reverse Prompt),
 * it incrementally optimizes the array (stripping base64 images of older or non-favorite items,
 * and eventually capping/slicing the list) until it successfully saves.
 * Returns the array that was ACTUALLY successfully saved, which might have been optimized.
 */
function saveHistorySafely(items: PromptHistoryItem[]): PromptHistoryItem[] {
  const KEY = 'arabi_prompt_history';
  try {
    const consent = localStorage.getItem('arabi_prompt_consent_local_history');
    if (consent === 'false') {
      localStorage.removeItem(KEY);
      return [];
    }
    localStorage.setItem(KEY, JSON.stringify(items));
    return items;
  } catch (err: any) {
    console.warn('LocalStorage quota warning or failure. Attempting optimization to prevent crash...', err);
    
    // First stage of optimization: keep styleImage/contentImage ONLY for the 3 most recent entries
    try {
      const optimized = items.map((item, index) => {
        if (index >= 3 && (item.styleImage || item.contentImage)) {
          return { ...item, styleImage: null, contentImage: null };
        }
        return item;
      });
      localStorage.setItem(KEY, JSON.stringify(optimized));
      return optimized;
    } catch (e1) {
      // Second stage: strip images from ALL items
      try {
        const withoutImages = items.map(item => {
          if (item.styleImage || item.contentImage) {
            return { ...item, styleImage: null, contentImage: null };
          }
          return item;
        });
        localStorage.setItem(KEY, JSON.stringify(withoutImages));
        return withoutImages;
      } catch (e2) {
        // Third stage: clear images and slice array to latest 100 entries
        try {
          const sliced100 = items
            .map(item => ({ ...item, styleImage: null, contentImage: null }))
            .slice(0, 100);
          localStorage.setItem(KEY, JSON.stringify(sliced100));
          return sliced100;
        } catch (e3) {
          // Absolute last resort: slice to newest 30 entries
          try {
            const sliced30 = items
              .map(item => ({ ...item, styleImage: null, contentImage: null }))
              .slice(0, 30);
            localStorage.setItem(KEY, JSON.stringify(sliced30));
            return sliced30;
          } catch (e4) {
            console.error('Failed to save even heavily optimized history:', e4);
            return items; // fallback to returning original if literally everything fails
          }
        }
      }
    }
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    try {
      const search = window.location.search;
      if (search) {
        const params = new URLSearchParams(search);
        const tab = params.get('tab') as ActiveTab;
        if (tab && ['builder', 'templates', 'cinema', 'visual_library', 'ideas', 'reverse', 'sequence', 'drone', 'diffusiondb', 'history', 'privacy', 'pricing'].includes(tab)) {
          return tab;
        }
        if (params.get('seq') || params.get('sequenceId') || params.get('sharedSeq') || params.get('sseq')) {
          return 'sequence';
        }
        if (params.get('movie_seq') || params.get('sharedMovie') || params.get('smovie')) {
          return 'cinema';
        }
      }
    } catch {}
    return 'builder';
  });
  const [lang, setLang] = useState<AppLanguage>(() => {
    try {
      const saved = localStorage.getItem('arabi_prompt_lang') as AppLanguage;
      if (saved && SUPPORTED_LANGUAGES.some(l => l.code === saved)) {
        return saved;
      }
    } catch {}
    return 'ar';
  });
  const [passedPrompt, setPassedPrompt] = useState<string>('');

  useEffect(() => {
    const opt = SUPPORTED_LANGUAGES.find(l => l.code === lang);
    document.documentElement.dir = opt ? opt.dir : (lang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.lang = lang;
    try {
      localStorage.setItem('arabi_prompt_lang', lang);
    } catch {}
  }, [lang]);
  
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('arabi_prompt_dark_mode');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    try {
      localStorage.setItem('arabi_prompt_dark_mode', String(darkMode));
    } catch {}
  }, [darkMode]);

  const [history, setHistory] = useState<PromptHistoryItem[]>(() => {
    try {
      const consent = localStorage.getItem('arabi_prompt_consent_local_history');
      if (consent === 'false') {
        return [];
      }
      const stored = localStorage.getItem('arabi_prompt_history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthMode>('login');

  const handleOpenAuth = (mode: AuthMode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  // User Subscription State
  const [subscription, setSubscription] = useState<UserSubscription>(() => getSubscription());
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState<SubscriptionPlan>('pro');
  const [checkoutBillingCycle, setCheckoutBillingCycle] = useState<'monthly' | 'annual'>('annual');

  const handleOpenCheckout = (plan: SubscriptionPlan = 'pro', cycle: 'monthly' | 'annual' = 'annual') => {
    setCheckoutPlan(plan);
    setCheckoutBillingCycle(cycle);
    setIsCheckoutModalOpen(true);
  };

  useEffect(() => {
    const handleSubUpdated = (e: any) => {
      if (e.detail) {
        setSubscription(e.detail);
      }
    };
    window.addEventListener('subscription-updated', handleSubUpdated);
    const handleCheckoutEvent = (e: any) => {
      const plan = e.detail?.plan || 'lite';
      const cycle = e.detail?.billingCycle || 'annual';
      handleOpenCheckout(plan, cycle);
    };
    window.addEventListener('open-checkout', handleCheckoutEvent);

    return () => {
      window.removeEventListener('subscription-updated', handleSubUpdated);
      window.removeEventListener('open-checkout', handleCheckoutEvent);
    };
  }, []);

  // Centralized Cloud Backup State & Control
  const [backupConfig, setBackupConfigState] = useState<BackupMetadata>(() => getBackupConfig());
  const [isCloudBackingUp, setIsCloudBackingUp] = useState(false);
  const [isCloudRestoring, setIsCloudRestoring] = useState(false);
  const [isBackupCenterOpen, setIsBackupCenterOpen] = useState(false);

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
    saveBackupConfig(updated);
  };

  useEffect(() => {
    // Audit check on mount
    testFirestoreConnection();

    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setGoogleAccessToken(token);
        setAuthChecking(false);
      },
      () => {
        setCurrentUser(null);
        setGoogleAccessToken(null);
        setAuthChecking(false);
      }
    );
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // Periodic Scheduled Auto-Backup Daemon
  useEffect(() => {
    const runAutoBackup = async () => {
      // Don't auto-sync if disabled or manual/instant intervals
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
          console.log(`Global scheduled '${backupConfig.provider}' cloud backup triggered...`);
          if (backupConfig.provider === 'google-drive' && googleAccessToken) {
            const fileId = await searchGDriveBackup(googleAccessToken);
            await uploadGDriveBackup(googleAccessToken, history, fileId);
          } else if (backupConfig.provider === 'dropbox') {
            const dToken = localStorage.getItem('arabi_prompt_dropbox_token');
            if (dToken) {
              await uploadDropboxBackup(dToken, history);
            } else {
              await backupToDropboxSimulated(history);
            }
          } else if (backupConfig.provider === 'firebase' && currentUser) {
            await syncAllHistoryToFirestore(currentUser.uid, history);
          } else if (backupConfig.provider === 'icloud') {
            await backupToICloudSimulated(history);
          } else if (backupConfig.provider === 'custom-backend') {
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
          console.log(`Global scheduled '${backupConfig.provider}' cloud backup completed!`);
        } catch (err) {
          console.error(`Global scheduled '${backupConfig.provider}' backup failed:`, err);
        }
      }
    };
    
    runAutoBackup();
    const intervalTimer = setInterval(runAutoBackup, 5 * 60 * 1000); // Check every 5 minutes
    return () => clearInterval(intervalTimer);
  }, [googleAccessToken, history, backupConfig, currentUser]);

  // Instant continuous auto-sync effect
  useEffect(() => {
    let active = true;
    const runInstantBackup = async () => {
      if (!backupConfig.isEnabled || !backupConfig.provider || backupConfig.interval !== 'instant' || history.length === 0) return;
      
      const lastBackup = backupConfig.lastBackupTime;
      if (lastBackup) {
        const diffMs = Date.now() - new Date(lastBackup).getTime();
        if (diffMs < 5000) return; // rate limit 5s
      }

      console.log('Global instant daemon sync triggered for:', backupConfig.provider);
      try {
        if (backupConfig.provider === 'google-drive' && googleAccessToken) {
          const fileId = await searchGDriveBackup(googleAccessToken);
          await uploadGDriveBackup(googleAccessToken, history, fileId);
        } else if (backupConfig.provider === 'dropbox') {
          const dToken = localStorage.getItem('arabi_prompt_dropbox_token');
          if (dToken) {
            await uploadDropboxBackup(dToken, history);
          } else {
            await backupToDropboxSimulated(history);
          }
        } else if (backupConfig.provider === 'firebase' && currentUser) {
          await syncAllHistoryToFirestore(currentUser.uid, history);
        } else if (backupConfig.provider === 'icloud') {
          await backupToICloudSimulated(history);
        } else if (backupConfig.provider === 'custom-backend') {
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
          console.log('Global instant auto-sync backup succeeded.');
        }
      } catch (err) {
        console.warn('Global instant automated sync had a non-fatal error:', err);
      }
    };

    const timer = setTimeout(() => {
      runInstantBackup();
    }, 1200);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [history, backupConfig, googleAccessToken, currentUser]);

  // Guard access to 'privacy' (Costs & Privacy) - strictly private to adwwaw@gmail.com
  useEffect(() => {
    if (activeTab === 'privacy' && !authChecking) {
      if (currentUser?.email?.toLowerCase() !== 'adwwaw@gmail.com') {
        setActiveTab('builder');
      }
    }
  }, [activeTab, currentUser, authChecking]);

  // Synchronize layout when currentUser state shifts
  useEffect(() => {
    async function syncData() {
      if (currentUser) {
        let localHistory: PromptHistoryItem[] = [];
        try {
          const stored = localStorage.getItem('arabi_prompt_history');
          localHistory = stored ? JSON.parse(stored) : [];
        } catch {}

        try {
          // Attempt profile sync but do not let it block history load if offline
          try {
            await syncUserProfile(currentUser);
          } catch (profileErr) {
            console.warn("User profile remote synchronization skipped/offline:", profileErr);
          }

          const merged = await syncAllHistoryToFirestore(currentUser.uid, localHistory);
          const savedMerged = saveHistorySafely(merged);
          setHistory(savedMerged);
        } catch (err) {
          console.error("Failed to sync profile or history on login, falling back to local storage:", err);
          setHistory(localHistory);
        }
      } else {
        try {
          const stored = localStorage.getItem('arabi_prompt_history');
          setHistory(stored ? JSON.parse(stored) : []);
        } catch {
          setHistory([]);
        }
      }
    }
    syncData();
  }, [currentUser]);

  const handleGoogleSignIn = async () => {
    try {
      const result = await googleSignIn();
      if (result) {
        setCurrentUser(result.user);
        setGoogleAccessToken(result.accessToken);
        return result;
      }
    } catch (err) {
      console.error('Sign in failed:', err);
    }
    return null;
  };

  const handleLogout = async () => {
    try {
      await logout();
      setCurrentUser(null);
      setGoogleAccessToken(null);
      setAuthModalMode('login');
      setIsAuthModalOpen(true);
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  };

  const [builderInitialValues, setBuilderInitialValues] = useState<{
    concept: string;
    model: ModelType;
    tone: string;
    category: string;
  } | undefined>(undefined);

  const [reverserInitialValues, setReverserInitialValues] = useState<{
    styleImage: string | null;
    contentImage: string | null;
    notes: string;
    isMimicMode: boolean;
  } | undefined>(undefined);

  const handleLogPrompt = (item: {
    originalText: string;
    optimizedText: string;
    model: ModelType;
    tone: string;
    category: string;
    actionType: 'generate' | 'refine' | 'translate' | 'reverse';
    isFallback?: boolean;
    styleImage?: string | null;
    contentImage?: string | null;
    notes?: string;
    isMimicMode?: boolean;
    tags?: string[];
  }) => {
    const newItem: PromptHistoryItem = {
      id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      timestamp: new Date().toISOString(),
      originalText: item.originalText || '',
      optimizedText: item.optimizedText || '',
      model: item.model || 'gemini',
      tone: item.tone || 'مهني واحترافي',
      category: item.category || 'content',
      actionType: item.actionType || 'generate',
      tags: item.tags || [],
      ...(item.isFallback !== undefined ? { isFallback: item.isFallback } : {}),
      ...(item.styleImage ? { styleImage: item.styleImage } : {}),
      ...(item.contentImage ? { contentImage: item.contentImage } : {}),
      ...(item.notes ? { notes: item.notes } : {}),
      ...(item.isMimicMode !== undefined ? { isMimicMode: item.isMimicMode } : {})
    };

    setHistory((prev) => {
      const updated = [newItem, ...prev];
      return saveHistorySafely(updated);
    });

    if (currentUser) {
      addUserHistoryItem(currentUser.uid, newItem).catch((err) => {
        console.error('Failed to save log item to Firestore:', err);
      });
    }

    // Increment daily plan usage
    recordGenerationUsage(currentUser?.uid);
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('arabi_prompt_history');
    } catch (err) {
      console.error('Failed to clear history from localStorage:', err);
    }

    if (currentUser) {
      clearUserHistory(currentUser.uid).catch((err) => {
        console.error('Failed to clear history in Firestore:', err);
      });
    }
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      return saveHistorySafely(updated);
    });

    if (currentUser) {
      deleteUserHistoryItem(currentUser.uid, id).catch((err) => {
        console.error('Failed to delete history item in Firestore:', err);
      });
    }
  };

  const handleDeleteMultipleHistoryItems = (ids: string[]) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => !ids.includes(item.id));
      return saveHistorySafely(updated);
    });

    if (currentUser) {
      deleteMultipleUserHistoryItems(currentUser.uid, ids).catch((err) => {
        console.error('Failed to dual bulk-delete history items in Firestore:', err);
      });
    }
  };

  const handleToggleFavorite = (id: string) => {
    let nextFavState = false;
    setHistory((prev) => {
      const updated = prev.map((item) => {
        if (item.id === id) {
          nextFavState = !item.isFavorite;
          return { ...item, isFavorite: nextFavState };
        }
        return item;
      });
      return saveHistorySafely(updated);
    });

    if (currentUser) {
      updateUserHistoryItem(currentUser.uid, id, { isFavorite: nextFavState }).catch((err) => {
        console.error('Failed to update favorite status in Firestore:', err);
      });
    }
  };

  const handleSetRating = (id: string, rating: number) => {
    setHistory((prev) => {
      const updated = prev.map((item) => {
        if (item.id === id) {
          return { ...item, rating };
        }
        return item;
      });
      return saveHistorySafely(updated);
    });

    if (currentUser) {
      updateUserHistoryItem(currentUser.uid, id, { rating }).catch((err) => {
        console.error('Failed to update rating in Firestore:', err);
      });
    }
  };

  const handleUpdateTags = (id: string, tags: string[]) => {
    setHistory((prev) => {
      const updated = prev.map((item) => {
        if (item.id === id) {
          return { ...item, tags };
        }
        return item;
      });
      return saveHistorySafely(updated);
    });

    if (currentUser) {
      updateUserHistoryItem(currentUser.uid, id, { tags }).catch((err) => {
        console.error('Failed to update tags in Firestore:', err);
      });
    }
  };

  const handleBulkUpdateTags = (ids: string[], newTag: string) => {
    const cleanTag = newTag.trim().replace(/^#+/, '');
    if (!cleanTag) return;

    setHistory((prev) => {
      const updated = prev.map((item) => {
        if (ids.includes(item.id)) {
          const currentTags = item.tags || [];
          if (!currentTags.includes(cleanTag)) {
            const nextTags = [...currentTags, cleanTag];
            if (currentUser) {
              updateUserHistoryItem(currentUser.uid, item.id, { tags: nextTags }).catch((err) => {
                console.error('Failed to update tags in Firestore:', err);
              });
            }
            return { ...item, tags: nextTags };
          }
        }
        return item;
      });
      return saveHistorySafely(updated);
    });
  };

  const handleRestoreHistory = (importedItems: PromptHistoryItem[]) => {
    setHistory((prev) => {
      const existingIds = new Set(prev.map((item) => item.id));
      const filteredImported = importedItems.filter((item) => !existingIds.has(item.id));
      const updated = [...filteredImported, ...prev];
      const saved = saveHistorySafely(updated);

      if (currentUser) {
        syncAllHistoryToFirestore(currentUser.uid, saved).then((merged) => {
          setHistory(merged);
        }).catch((err) => {
          console.error('Failed to sync restored history to Firestore:', err);
        });
      }

      return saved;
    });
  };

  const handleApplyToBuilder = (originalText: string, model: ModelType, tone: string, category: string) => {
    setBuilderInitialValues({
      concept: originalText,
      model,
      tone,
      category
    });
    setActiveTab('builder');
    setTimeout(() => {
      const builderSection = document.getElementById('prompt-builder-panel');
      if (builderSection) {
        builderSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleApplyIdeaToBuilder = (data: { concept: string; model: ModelType; tone: string; category: string }) => {
    setBuilderInitialValues({
      concept: data.concept,
      model: data.model,
      tone: data.tone,
      category: data.category
    });
    setActiveTab('builder');
    setTimeout(() => {
      const panel = document.getElementById('prompt-builder-panel');
      if (panel) {
        panel.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleSendToTester = (promptText: string) => {
    setPassedPrompt(promptText);
    setBuilderInitialValues({
      concept: promptText,
      model: 'gemini',
      tone: 'مهني واحترافي',
      category: 'content'
    });
    setActiveTab('builder');
    
    // Smooth scroll down to builder panel
    setTimeout(() => {
      const panel = document.getElementById('prompt-builder-panel');
      if (panel) {
        panel.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleGetStarted = () => {
    setActiveTab('builder');
    setTimeout(() => {
      const builderSection = document.getElementById('prompt-builder-panel');
      if (builderSection) {
        builderSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleApplyToReverser = (
    styleImage: string | null | undefined,
    contentImage: string | null | undefined,
    notes: string | undefined,
    isMimicMode: boolean | undefined
  ) => {
    setReverserInitialValues({
      styleImage: styleImage || null,
      contentImage: contentImage || null,
      notes: notes || '',
      isMimicMode: !!isMimicMode
    });
    setActiveTab('reverse');
    setTimeout(() => {
      const panel = document.getElementById('prompt-reverser-panel');
      if (panel) {
        panel.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div 
      className="min-h-screen flex flex-col bg-[#faf9f6]" 
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        lang={lang} 
        setLang={setLang} 
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        backupConfig={backupConfig}
        onOpenBackupCenter={() => setIsBackupCenterOpen(true)}
        user={currentUser}
        onOpenAuth={handleOpenAuth}
        subscription={subscription}
        onOpenCheckout={handleOpenCheckout}
      />

      {/* Sticky Paid Platform Notice Bar */}
      {!isPaidSubscriber(subscription) ? (
        <div className="bg-gradient-to-r from-stone-900 via-[#1c1a16] to-stone-900 text-white text-xs px-4 py-2 border-b border-[#c29b40]/30 shadow-md">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-start">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="font-bold text-amber-300">
                {lang === 'ar' ? '💎 تنبيه: منصة عرب برومبت مدفوعة بالكامل 100%:' : '💎 100% Paid Platform Notice:'}
              </span>
              <span className="text-stone-300 text-[11px]">
                {lang === 'ar' 
                  ? 'جميع الميزات تتطلب اشتراكاً نشطاً للاستفادة من سرعة المعالجة الفائقة ونماذج الذكاء الاصطناعي وبدون إعلانات.' 
                  : 'All tools require an active paid plan for dedicated GPU compute and zero ads.'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenCheckout('pro')}
                className="px-3 py-1 rounded-lg bg-gradient-to-r from-[#916a24] via-[#c29b40] to-amber-500 text-white font-black text-[11px] shadow-xs hover:opacity-95 transition-all cursor-pointer flex items-center gap-1"
              >
                <Crown className="w-3 h-3" />
                <span>{lang === 'ar' ? 'اشترك الآن' : 'Subscribe Now'}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('pricing')}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-stone-200 font-bold text-[11px] transition-all cursor-pointer"
              >
                <span>{lang === 'ar' ? 'الباقات والأسعار' : 'Pricing'}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#c29b40]/10 border-b border-[#c29b40]/25 text-[#916a24] dark:text-amber-300 text-xs px-4 py-1.5 shadow-2xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-[11px] font-bold">
              <Crown className="w-3.5 h-3.5 text-[#c29b40]" />
              <span>
                {lang === 'ar' 
                  ? `أهلاً بك! عضويتك المدفوعة نشطة (${subscription.plan === 'studio' ? 'باقة الاستوديو' : subscription.plan === 'lite' ? 'باقة الانطلاقة' : 'باقة المحترف'}) — كافة الميزات مفعلة بالكامل وبدون إعلانات.` 
                  : `Active Paid Membership (${subscription.plan.toUpperCase()}) — All tools unlocked with zero ads.`}
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleOpenCheckout(subscription.plan)}
              className="text-[10px] underline font-bold hover:opacity-80 cursor-pointer"
            >
              {lang === 'ar' ? 'إدارة الاشتراك' : 'Manage Subscription'}
            </button>
          </div>
        </div>
      )}

      {/* Main Tab Workspace container */}
      <main className="flex-1 bg-gradient-to-b from-[#f9f8f4] to-[#fbfbfa]">
        {/* If user is unpaid and visiting interactive workspace tabs, show prominent PaywallGate at top */}
        {!isPaidSubscriber(subscription) && ['builder', 'cinema', 'reverse', 'sequence', 'drone', 'ideas'].includes(activeTab) && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
            <PaywallGate 
              lang={lang} 
              onOpenCheckout={handleOpenCheckout} 
              onNavigatePricing={() => setActiveTab('pricing')} 
            />
          </div>
        )}
        {activeTab === 'builder' && (
          <PromptBuilder 
            lang={lang} 
            onSendToTester={handleSendToTester} 
            onNavigateToReverse={() => setActiveTab('reverse')}
            onNavigateToTemplates={() => setActiveTab('templates')}
            onLogPrompt={handleLogPrompt}
            initialValues={builderInitialValues}
          />
        )}

        {activeTab === 'templates' && (
          <PromptTemplates
            lang={lang}
            onSendToBuilder={(promptText, model, tone, category) => {
              setPassedPrompt(promptText);
              setBuilderInitialValues({
                concept: promptText,
                model: model || 'gemini',
                tone: tone || 'احترافي',
                category: category || 'creative'
              });
              setActiveTab('builder');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateTab={(tab) => setActiveTab(tab as ActiveTab)}
          />
        )}

        {activeTab === 'cinema' && (
          <CinemaMovieStudio
            lang={lang}
            user={currentUser}
            onSendToTester={handleSendToTester}
            onLogPrompt={handleLogPrompt}
          />
        )}

        {activeTab === 'visual_library' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <VisualConceptLibrary
              lang={lang}
              onSendToBuilder={(promptText, model) => {
                setPassedPrompt(promptText);
                setBuilderInitialValues({
                  concept: promptText,
                  model: model || 'midjourney',
                  tone: 'إبداعي وحر',
                  category: 'creative'
                });
                setActiveTab('builder');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        )}

        {activeTab === 'ideas' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-[#916a24]/10 via-[#c29b40]/15 to-[#ecd197]/20 p-6 rounded-3xl border border-[#c29b40]/30 shadow-xs">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#c29b40] text-white flex items-center justify-center shadow-md">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-stone-900 tracking-tight font-sans">
                    {lang === 'ar' ? 'مختبر ومُولد الأفكار الذكية (Prompt Idea Generator)' : 'Prompt Idea Generator Workspace'}
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                    {lang === 'ar' 
                      ? 'مساحة مخصصة متكاملة لتجاوز حاجز الكتابة، واستكشاف زوايا أوامر غير تقليدية، وتوليد أفكار حية عبر الذكاء الاصطناعي.' 
                      : 'Dedicated creative workspace to brainstorm cutting-edge prompt angles and generate live AI ideas.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('builder')}
                className="px-4 py-2 rounded-xl bg-white border border-[#c29b40]/40 text-[#916a24] hover:bg-[#c29b40]/10 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span>{lang === 'ar' ? 'الذهاب إلى مُهندس الأوامر' : 'Go to Builder'}</span>
                {lang === 'ar' ? <span>←</span> : <span>→</span>}
              </button>
            </div>

            <PromptIdeaGenerator
              lang={lang}
              onSelectIdea={handleApplyIdeaToBuilder}
              compact={false}
            />
          </div>
        )}
        {activeTab === 'reverse' && (
          <PromptReverser
            lang={lang}
            onSendToTester={handleSendToTester}
            onNavigateToBuilder={() => setActiveTab('builder')}
            onLogPrompt={handleLogPrompt}
            initialValues={reverserInitialValues}
          />
        )}
        {activeTab === 'sequence' && (
          <PromptSequence lang={lang} onSendToTester={handleSendToTester} />
        )}
        {activeTab === 'drone' && (
          <VideoPromptDesigner
            lang={lang}
            onSendToTester={handleSendToTester}
            onLogPrompt={handleLogPrompt}
          />
        )}
        {activeTab === 'diffusiondb' && (
          <DiffusionDBGuide
            lang={lang}
            onSendToTester={handleSendToTester}
          />
        )}
        {activeTab === 'history' && (
          <PromptHistory
            lang={lang}
            history={history}
            onClearHistory={handleClearHistory}
            onDeleteHistoryItem={handleDeleteHistoryItem}
            onDeleteMultipleHistoryItems={handleDeleteMultipleHistoryItems}
            onToggleFavorite={handleToggleFavorite}
            onSetRating={handleSetRating}
            onSendToTester={handleSendToTester}
            onApplyToBuilder={handleApplyToBuilder}
            onApplyToReverser={handleApplyToReverser}
            onRestoreHistory={handleRestoreHistory}
            onUpdateTags={handleUpdateTags}
            onBulkUpdateTags={handleBulkUpdateTags}
            user={currentUser}
            accessToken={googleAccessToken}
            onGoogleSignIn={handleGoogleSignIn}
            onLogout={handleLogout}
            backupConfig={backupConfig}
            onConfigChange={handleConfigChange}
            isCloudBackingUp={isCloudBackingUp}
            setIsCloudBackingUp={setIsCloudBackingUp}
            isCloudRestoring={isCloudRestoring}
            setIsCloudRestoring={setIsCloudRestoring}
          />
        )}
        {activeTab === 'privacy' && currentUser?.email?.toLowerCase() === 'adwwaw@gmail.com' && (
          <PrivacySettings
            lang={lang}
            history={history}
            onClearHistory={handleClearHistory}
            currentUser={currentUser}
            onLogout={handleLogout}
            onNavigateTab={(tab) => setActiveTab(tab as ActiveTab)}
          />
        )}
        {activeTab === 'pricing' && (
          <Pricing
            lang={lang}
            onNavigateTab={(tab) => setActiveTab(tab as ActiveTab)}
            onOpenAuth={handleOpenAuth}
            onOpenCheckout={handleOpenCheckout}
          />
        )}
      </main>

      {/* Hero section explanation cards (placed below the main workspace view so it doesn't take up top space) */}
      <HeroSection lang={lang} onGetStarted={handleGetStarted} />

      {/* Decorative footer */}
      <footer className="border-t border-stone-200 bg-[#fbfbf9] py-8 text-center text-xs text-stone-500 font-medium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-2">
          <p className="font-sans flex items-center justify-center gap-1.5 text-stone-600">
            <Sparkles className="w-3.5 h-3.5 text-[#c29b40]" />
            <span>
              {lang === 'ar' 
                ? 'عرب برومبت — مُطوّر لتأمين أفضل معايير الجودة لهندسة الأوامر العربية' 
                : 'ArabPrompt — Designed with focus on Arabic Prompt Quality & AI Standards'}
            </span>
          </p>

          {/* Real verified unique visitor counter (Private to admin only) */}
          <div className="pt-2 flex justify-center">
            <VisitorCounter
              lang={lang}
              variant="footer"
              currentUser={currentUser}
              onOpenAuth={handleOpenAuth}
            />
          </div>

          <p className="text-[10px] text-stone-400">
            {lang === 'ar' 
              ? 'صنع بذكاء عبر نموذج Google Gemini © 2026' 
              : 'Powered securely server-side by Google Gemini © 2026'}
          </p>
        </div>
      </footer>
      <ToastNotification lang={lang} onOpenCheckout={handleOpenCheckout} />
      <CloudBackupCenter
        isOpen={isBackupCenterOpen}
        onClose={() => setIsBackupCenterOpen(false)}
        lang={lang}
        history={history}
        onRestoreHistory={handleRestoreHistory}
        user={currentUser}
        accessToken={googleAccessToken}
        onGoogleSignIn={handleGoogleSignIn}
        onLogout={handleLogout}
        backupConfig={backupConfig}
        handleConfigChange={handleConfigChange}
        isCloudBackingUp={isCloudBackingUp}
        setIsCloudBackingUp={setIsCloudBackingUp}
        isCloudRestoring={isCloudRestoring}
        setIsCloudRestoring={setIsCloudRestoring}
        onOpenAuthModal={handleOpenAuth}
      />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        lang={lang}
        currentUser={currentUser}
        initialMode={authModalMode}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthModalOpen(false);
        }}
        onLogout={handleLogout}
        onOpenApiDashboard={() => setActiveTab('privacy')}
        onOpenCheckout={handleOpenCheckout}
      />
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        lang={lang}
        initialPlan={checkoutPlan}
        initialBillingCycle={checkoutBillingCycle}
        user={currentUser}
        onSubscriptionSuccess={(newSub) => {
          setSubscription(newSub);
        }}
      />
    </div>
  );
}
