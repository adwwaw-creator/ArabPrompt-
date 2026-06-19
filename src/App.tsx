/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import PromptBuilder from './components/PromptBuilder';
import TemplatesLibrary from './components/TemplatesLibrary';
import PromptTester from './components/PromptTester';
import PromptHistory from './components/PromptHistory';
import PromptReverser from './components/PromptReverser';
import PromptSequence from './components/PromptSequence';
import PromptAnalytics from './components/PromptAnalytics';
import PromptRapEngine from './components/PromptRapEngine';
import ArabPromptDashboard from './components/ArabPromptDashboard';
import VideoPromptDesigner from './components/VideoPromptDesigner';
import DiffusionDBGuide from './components/DiffusionDBGuide';
import CloudBackupCenter from './components/CloudBackupCenter';
import { BackupMetadata, getBackupConfig, saveBackupConfig, searchGDriveBackup, uploadGDriveBackup, uploadDropboxBackup, backupToDropboxSimulated, backupToICloudSimulated, backupToCustomBackendSimulated } from './utils/cloudBackup';
import { ActiveTab, PromptHistoryItem, ModelType } from './types';
import { ToastNotification } from './components/ToastNotification';
import { Sparkles } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [passedPrompt, setPassedPrompt] = useState<string>('');
  
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
      const stored = localStorage.getItem('arabi_prompt_history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);

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
      },
      () => {
        setCurrentUser(null);
        setGoogleAccessToken(null);
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
  }) => {
    const newItem: PromptHistoryItem = {
      id: Math.random().toString(36).substring(2, 9) + Date.now(),
      timestamp: new Date().toISOString(),
      originalText: item.originalText,
      optimizedText: item.optimizedText,
      model: item.model,
      tone: item.tone,
      category: item.category,
      actionType: item.actionType,
      isFallback: item.isFallback,
      styleImage: item.styleImage,
      contentImage: item.contentImage,
      notes: item.notes,
      isMimicMode: item.isMimicMode
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

  const handleSendToTester = (promptText: string) => {
    setPassedPrompt(promptText);
    setActiveTab('tester');
    
    // Smooth scroll down to tester panel if needed
    setTimeout(() => {
      const panel = document.getElementById('prompt-tester-panel');
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
      />

      {/* Main Tab Workspace container */}
      <main className="flex-1 bg-gradient-to-b from-[#f9f8f4] to-[#fbfbfa]">
        {activeTab === 'dashboard' && (
          <ArabPromptDashboard
            lang={lang}
            history={history}
            onClearHistory={handleClearHistory}
            onDeleteHistoryItem={handleDeleteHistoryItem}
            onToggleFavorite={handleToggleFavorite}
            onSendToTester={handleSendToTester}
            onApplyToBuilder={handleApplyToBuilder}
            onLogPrompt={handleLogPrompt}
          />
        )}
        {activeTab === 'builder' && (
          <PromptBuilder 
            lang={lang} 
            onSendToTester={handleSendToTester} 
            onLogPrompt={handleLogPrompt}
            initialValues={builderInitialValues}
          />
        )}
        {activeTab === 'reverse' && (
          <PromptReverser
            lang={lang}
            onSendToTester={handleSendToTester}
            onLogPrompt={handleLogPrompt}
            initialValues={reverserInitialValues}
          />
        )}
        {activeTab === 'library' && (
          <TemplatesLibrary lang={lang} onSendToTester={handleSendToTester} />
        )}
        {activeTab === 'sequence' && (
          <PromptSequence lang={lang} onSendToTester={handleSendToTester} />
        )}
        {activeTab === 'tester' && (
          <PromptTester lang={lang} passedPrompt={passedPrompt} onLogPrompt={handleLogPrompt} />
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
        {activeTab === 'analytics' && (
          <PromptAnalytics lang={lang} history={history} />
        )}
        {activeTab === 'rap' && (
          <PromptRapEngine
            lang={lang}
            onSendToTester={handleSendToTester}
            onLogPrompt={handleLogPrompt}
          />
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
          <p className="text-[10px] text-stone-400">
            {lang === 'ar' 
              ? 'صنع بذكاء عبر نموذج Google Gemini © 2026' 
              : 'Powered securely server-side by Google Gemini © 2026'}
          </p>
        </div>
      </footer>
      <ToastNotification lang={lang} />
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
      />
    </div>
  );
}
