/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Cpu, Layers, Music, History, BarChart3, Sparkles, Send, Copy, Check, 
  Terminal, ExternalLink, Settings, Info, RefreshCw, AlertTriangle, Eye,
  Sliders, Plus, Play, HelpCircle, ArrowRight, Save, Download, Upload, Trash2, Briefcase, FolderOpen,
  Globe, ArrowUpRight
} from 'lucide-react';
import { PromptHistoryItem, ModelType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { VoiceInputButton } from './VoiceInputButton';
import { showToast } from './ToastNotification';

interface ArabPromptDashboardProps {
  lang: 'ar' | 'en';
  history: PromptHistoryItem[];
  onClearHistory: () => void;
  onDeleteHistoryItem: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onSendToTester: (promptText: string) => void;
  onApplyToBuilder: (originalText: string, model: ModelType, tone: string, category: string) => void;
  onLogPrompt: (item: any) => void;
}

// Predefined professional templates that load into the compiler with variables!
const PRESET_TEMPLATES = [
  {
    id: 'temp-1',
    titleAr: 'مُصحح ومُحسن الأكواد البرمجية',
    titleEn: 'Advanced Code Debugger & Refactorer',
    category: 'code',
    text: `You are a Senior Principal Software Engineer. Analyze the following {language} code for performance bottlenecks, memory leaks, and architectural flaws:
\`\`\`{language}
{code_snippet}
\`\`\`
Provide a refactored version adhering to {paradigm} standards, with clear explanations for any optimization introduced.`
  },
  {
    id: 'temp-2',
    titleAr: 'إعلان تسويقي لمنتج فاخر',
    titleEn: 'Luxury Copywriting Campaign',
    category: 'creative',
    text: `صمم حملة إعلانية عاطفية فخمة لمنتج {product_name} المستهدف للمستهلكين من فئة {target_audience} في منطقة {market_region}. ركز على نبل المكونات، وعراقة الحضور بأسلوب {tone_style}.`
  },
  {
    id: 'temp-3',
    titleAr: 'موجه الرسوم الفنية الفائقة الواقعية',
    titleEn: 'Hyper-Realistic Midjourney Art Director',
    category: 'art',
    text: `A cinematic photorealistic shot of {subject} in the setting of {environment}, shot on 85mm anamorphic lens, lighting by {light_style}, octane render, high-contrast, atmospheric chiaroscuro, {aspect_ratio} aspect ratio.`
  },
  {
    id: 'temp-4',
    titleAr: 'تلخيص واستقصاء مقال أكاديمي',
    titleEn: 'Academic Paper Summarizer',
    category: 'education',
    text: `أنت باحث أكاديمي متمز. قم بتلخيص الورقة العلمية التالية التي تناقش موضوع {paper_theme}، موضحاً المنهجية المتبعة، وأهم {key_findings}، مع صياغة النقد المنهجي بأسلوب {complexity_level}.`
  }
];

// Fun Moroccan Rap themes that generate rap prompts!
const RAP_THEMES = [
  { id: 'theme-1', titleAr: 'غربة الغربة والاتكال البشري', titleEn: 'Loneliness and Struggle', prompt: 'اكتب كلمات راب مغربي (الدارجة) حزينة جداً تتناول موضوع الغربة، فراق الوالدين والاعتماد على النفس بمصطلحات زقاقية أصيلة...' },
  { id: 'theme-2', titleAr: 'الأمل العالي، الطموح والكفاح', titleEn: 'Ambition & Hard Work', prompt: 'اكتب راب مغربي حماسي يعبر عن الصعود من القاع إلى القمة، مواجهة الأصدقاء المزيفين، وبناء المجد بجهد شخصي ممزوج بالدارجة المغربية الفصيحة...' },
  { id: 'theme-3', titleAr: 'نقد اجتماعي ومجتمعي نقدي (Clash)', titleEn: 'Social Critique & Clash', prompt: 'قم بصياغة كلاش راب مغربي قوي موجه ضد النفاق الاجتماعي، السطحية في تقديس المظاهر، وواقع الشارع المغربي بالدارجة الدارجة الحقيقية...' }
];

export default function ArabPromptDashboard({
  lang,
  history,
  onClearHistory,
  onDeleteHistoryItem,
  onToggleFavorite,
  onSendToTester,
  onApplyToBuilder,
  onLogPrompt
}: ArabPromptDashboardProps) {
  
  // Inner selected Tab corresponding to the user's shared sidebar
  const [activeSubTab, setActiveSubTab] = useState<'lab' | 'library' | 'rap' | 'history' | 'analytics' | 'projects'>('lab');
  
  // Project saving inputs state
  const [newProjectName, setNewProjectName] = useState<string>('');
  const [newProjectDescription, setNewProjectDescription] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Define Project configuration interface
  interface SavedProjectConfig {
    id: string;
    name: string;
    description: string;
    editorText: string;
    variableValues: Record<string, string>;
    targetModel: string;
    timestamp: string;
  }

  // Load / Store Local storage projects
  const [savedProjects, setSavedProjects] = useState<SavedProjectConfig[]>(() => {
    try {
      const saved = localStorage.getItem('arab_prompt_saved_projects');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load saved projects', e);
    }
    return [
      {
        id: 'proj-default-1',
        name: lang === 'ar' ? 'نموذج برومبت الكابتن والمصحح الممتاز' : 'Premium Captain Debugger Script',
        description: lang === 'ar' ? 'موجه مبرمج أول مخصص لمراجعة الثغرات البرمجية وحلها بلغة بايثون وتعديل الأقسام غير الفعالة.' : 'Senior engineer instructions optimized to scan complex Python applications with variables preset.',
        editorText: `You are a Senior Principal Software Engineer. Analyze the following {language} code for performance bottlenecks, memory leaks, and architectural flaws:\n\`\`\`{language}\n{code_snippet}\n\`\`\`\nProvide a refactored version adhering to {paradigm} standards, with clear explanations for any optimization introduced.`,
        variableValues: {
          language: 'python',
          code_snippet: 'def calculate_sum(arr):\n    result = 0\n    for x in arr:\n        result += x\n    return result',
          paradigm: 'Functional programming'
        },
        targetModel: 'gemini-3.5-flash',
        timestamp: new Date().toISOString()
      },
      {
        id: 'proj-default-2',
        name: lang === 'ar' ? 'إعلان كوكاكولا تسويقي تفاعلي' : 'Coca-Cola Marketing Interactive Ad',
        description: lang === 'ar' ? 'نموذج تسويقي حديث يبرز قيمة المنتج والحدث الموسمي المستهدف والمدينة لإنتاج محتوى ترويجي استثنائي.' : 'Modern copywriting model detailing seasonal events and city options to craft viral marketing drafts.',
        editorText: `صمم حملة إعلانية عاطفية فخمة لمنتج {product_name} المستهدف للمستهلكين من فئة {target_audience} في منطقة {market_region}. ركز على نبل المكونات، وعراقة الحضور بأسلوب {tone_style}.`,
        variableValues: {
          product_name: lang === 'ar' ? 'كوكاكولا زيرو الصيفية' : 'Coca-Cola Zero Summer Pack',
          target_audience: lang === 'ar' ? 'الشباب وعشاق الموسيقى' : 'Gen-Z and music lovers',
          market_region: lang === 'ar' ? 'المملكة المغربية وشمال أفريقيا' : 'Morocco and North Africa',
          tone_style: lang === 'ar' ? 'حماسي وشبابي منعش' : 'Energetic and refreshing'
        },
        targetModel: 'gemini-3.5-flash',
        timestamp: new Date().toISOString()
      }
    ];
  });

  // Master Applet Data Export & Backup states
  const [exportIncludeProjects, setExportIncludeProjects] = useState<boolean>(true);
  const [exportIncludeHistory, setExportIncludeHistory] = useState<boolean>(true);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'markdown'>('json');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('arab_prompt_saved_projects', JSON.stringify(savedProjects));
    } catch (e) {
      console.error('Failed to preserve projects', e);
    }
  }, [savedProjects]);

  const handleSaveActiveProject = (name: string, description: string) => {
    if (!name.trim()) return;
    const newProj: SavedProjectConfig = {
      id: 'proj-' + Date.now(),
      name: name.trim(),
      description: description.trim() || (lang === 'ar' ? 'مشروع مخصص مفرغ بدون وصف للسرعة' : 'No description provided'),
      editorText,
      variableValues,
      targetModel,
      timestamp: new Date().toISOString()
    };
    setSavedProjects(prev => [newProj, ...prev]);
    setNewProjectName('');
    setNewProjectDescription('');
    setSuccessNotification(lang === 'ar' ? '✓ تم حفظ هذا التكوين بنجاح وتلقيم الحزمة!' : '✓ Workspace configuration compiled and saved successfully!');
    setTimeout(() => setSuccessNotification(''), 3000);
  };

  const handleLoadProject = (proj: SavedProjectConfig) => {
    setEditorText(proj.editorText);
    setVariableValues(proj.variableValues || {});
    setTargetModel(proj.targetModel || 'gemini-3.5-flash');
    setSuccessNotification(lang === 'ar' ? `✓ تم استعادة التكوين: "${proj.name}" بنجاح!` : `✓ Restored project configuration: "${proj.name}"!`);
    setTimeout(() => setSuccessNotification(''), 3000);
  };

  const handleDeleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedProjects(prev => prev.filter(p => p.id !== id));
    setSuccessNotification(lang === 'ar' ? '✓ تم حذف التكوين بنجاح.' : '✓ Configuration deleted successfully.');
    setTimeout(() => setSuccessNotification(''), 3000);
  };

  const handleExportProjectJSON = (proj: SavedProjectConfig, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const cleanProj = {
      app: "ArabPromptPro",
      version: "1.0",
      type: "single_config",
      name: proj.name,
      description: proj.description,
      editorText: proj.editorText,
      variableValues: proj.variableValues,
      targetModel: proj.targetModel,
      timestamp: proj.timestamp
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cleanProj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    const fileName = `${proj.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_config.json`;
    downloadAnchor.setAttribute("download", fileName);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportAllProjectsJSON = () => {
    const payload = {
      app: "ArabPromptPro",
      version: "1.0",
      type: "bundle_config",
      exportedAt: new Date().toISOString(),
      projects: savedProjects
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `arab_prompt_all_setups_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleMasterExport = () => {
    setIsExporting(true);
    
    try {
      const selectedSources: string[] = [];
      if (exportIncludeProjects) selectedSources.push('projects');
      if (exportIncludeHistory) selectedSources.push('history');
      
      if (selectedSources.length === 0) {
        showToast(
          lang === 'ar' ? '⚠️ يرجى تحديد مصدر بيانات واحد على الأقل للتصدير!' : '⚠️ Please select at least one data source to export!',
          true
        );
        setIsExporting(false);
        return;
      }
      
      const pData = exportIncludeProjects ? savedProjects : [];
      const hData = exportIncludeHistory ? history : [];
      
      if (exportFormat === 'json') {
        const payload = {
          app: "ArabPromptPro",
          version: "1.1",
          type: "full_archive_backup",
          exportedAt: new Date().toISOString(),
          metadata: {
            languageMode: lang,
            userEmail: "adwwaw@gmail.com"
          },
          datasets: {
            projects: exportIncludeProjects ? pData : null,
            history: exportIncludeHistory ? hData : null
          }
        };
        
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `arab_prompt_master_backup_${Date.now()}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        
        showToast(
          lang === 'ar' ? '✓ تم تصدير حزمة JSON الشاملة بنجاح!' : '✓ Master JSON backup pack downloaded successfully!'
        );
      } 
      else if (exportFormat === 'csv') {
        let downloadedCount = 0;
        
        if (exportIncludeProjects && pData.length > 0) {
          const csvHeaders = ["Project ID", "Project Name", "Description", "Model", "Prompt Template", "Variables Count", "Timestamp"].join(",");
          const csvRows = pData.map(proj => [
            `"${proj.id.replace(/"/g, '""')}"`,
            `"${proj.name.replace(/"/g, '""')}"`,
            `"${(proj.description || '').replace(/"/g, '""')}"`,
            `"${(proj.targetModel || 'gemini-3.5-flash').replace(/"/g, '""')}"`,
            `"${proj.editorText.replace(/\r?\n/g, ' ').replace(/"/g, '""')}"`,
            Object.keys(proj.variableValues || {}).length,
            `"${proj.timestamp}"`
          ].join(","));
          
          const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + encodeURIComponent([csvHeaders, ...csvRows].join("\n"));
          const downloadAnchor = document.createElement('a');
          downloadAnchor.setAttribute("href", csvContent);
          downloadAnchor.setAttribute("download", `arab_prompt_projects_${Date.now()}.csv`);
          document.body.appendChild(downloadAnchor);
          downloadAnchor.click();
          downloadAnchor.remove();
          downloadedCount++;
        }
        
        if (exportIncludeHistory && hData.length > 0) {
          const csvHeaders = ["History ID", "Timestamp", "Model", "Category", "Rating Stars", "Tone/Style", "Original Text Input", "Engineered Output", "Translated Output", "Is Favorite"].join(",");
          const csvRows = hData.map(item => [
            `"${item.id.replace(/"/g, '""')}"`,
            `"${item.timestamp}"`,
            `"${item.model.replace(/"/g, '""')}"`,
            `"${item.category.replace(/"/g, '""')}"`,
            `"${'★'.repeat(item.rating || 0) + '☆'.repeat(5 - (item.rating || 0))}"`,
            `"${(item.tone || '').replace(/"/g, '""')}"`,
            `"${item.originalText.replace(/\r?\n/g, ' ').replace(/"/g, '""')}"`,
            `"${item.optimizedText.replace(/\r?\n/g, ' ').replace(/"/g, '""')}"`,
            `"${(item.translatedText || '').replace(/\r?\n/g, ' ').replace(/"/g, '""')}"`,
            item.isFavorite ? "YES" : "NO"
          ].join(","));
          
          const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + encodeURIComponent([csvHeaders, ...csvRows].join("\n"));
          setTimeout(() => {
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", csvContent);
            downloadAnchor.setAttribute("download", `arab_prompt_history_${Date.now()}.csv`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
          }, 400);
          downloadedCount++;
        }
        
        if (downloadedCount === 0) {
          showToast(
            lang === 'ar' ? 'ℹ️ تم تخطي التصدير لعدم وجود بيانات حالياً.' : 'ℹ️ Selected sources are empty, nothing to export.',
            true
          );
        } else if (downloadedCount < selectedSources.length) {
          showToast(
            lang === 'ar' ? '✓ تم تصدير البيانات المتوفرة (تم تغافل الفئات الفارغة).' : '✓ Exported available categories (empty ones skipped).'
          );
        } else {
          showToast(
            lang === 'ar' ? '✓ تم غرس وتحميل جداول CSV بنجاح!' : '✓ CSV spreadsheets downloaded successfully!'
          );
        }
      } 
      else if (exportFormat === 'markdown') {
        let md = `# ArabPrompt Pro - Master Workspace Compendium\n\n`;
        md += `- **Exported On:** ${new Date().toLocaleString()}\n`;
        md += `- **Language Mode:** ${lang.toUpperCase()}\n`;
        md += `- **Active Platform User:** adwwaw@gmail.com\n\n`;
        md += `--- \n\n`;
        
        if (exportIncludeProjects) {
          md += `## 📂 Saved Workspace Projects (${pData.length})\n\n`;
          if (pData.length === 0) {
            md += `*No saved projects in this category.*\n\n`;
          } else {
            pData.forEach((proj, idx) => {
              md += `### ${idx + 1}. Project Name: "${proj.name || 'Untitled'}"\n`;
              md += `- **Project UID:** \`${proj.id}\`\n`;
              md += `- **Model Preference:** \`${proj.targetModel || 'gemini'}\`\n`;
              md += `- **Saved At:** ${new Date(proj.timestamp).toLocaleString()}\n`;
              if (proj.description) md += `- **Description:** ${proj.description}\n`;
              
              md += `\n#### Prompt Blueprint Template:\n`;
              md += `\`\`\`\n${proj.editorText}\n\`\`\`\n`;
              
              if (proj.variableValues && Object.keys(proj.variableValues).length > 0) {
                md += `\n#### Bound Project Variables:\n`;
                Object.keys(proj.variableValues).forEach(k => {
                  md += `- **{${k}}**: ${proj.variableValues[k]}\n`;
                });
              }
              md += `\n---\n\n`;
            });
          }
        }
        
        if (exportIncludeHistory) {
          md += `## 📜 Prompt Engineering Logs (${hData.length})\n\n`;
          if (hData.length === 0) {
            md += `*No interaction histories logged.*\n\n`;
          } else {
            hData.forEach((item, idx) => {
              const stars = '★'.repeat(item.rating || 0) + '☆'.repeat(5 - (item.rating || 0));
              md += `### ${idx + 1}. Log ID: #${item.id}\n`;
              md += `- **Date:** ${new Date(item.timestamp).toLocaleString()}\n`;
              md += `- **Model Target:** \`${item.model}\`\n`;
              md += `- **Category Target:** \`${item.category}\`\n`;
              if (item.tone) md += `- **Tone Selection:** \`${item.tone}\`\n`;
              md += `- **User Rating:** ${stars}\n`;
              md += `- **Is Marked Favorite:** ${item.isFavorite ? 'Yes ⭐' : 'No'}\n`;
              
              md += `\n#### Original User Raw Intention:\n`;
              md += `> ${item.originalText}\n`;
              
              md += `\n#### Engineered System Instructions:\n`;
              md += `\`\`\`markdown\n${item.optimizedText}\n\`\`\`\n`;
              
              if (item.translatedText) {
                md += `\n#### Translated Arabic/English Output Alternative:\n`;
                md += `\`\`\`markdown\n${item.translatedText}\n\`\`\`\n`;
              }
              md += `\n---\n\n`;
            });
          }
        }
        
        const dataStr = "data:text/markdown;charset=utf-8,\uFEFF" + encodeURIComponent(md);
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `arab_prompt_dossier_${Date.now()}.md`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        
        showToast(
          lang === 'ar' ? '✓ تم تحميل ملف Markdown الشامل بنجاح!' : '✓ Master Markdown compendium downloaded successfully!'
        );
      }
    } catch (e: any) {
      console.error(e);
      showToast(
        lang === 'ar' ? '❌ خطأ أثناء توليد الملف!' : '❌ Error during compiling data export: ' + e.message,
        true
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const file = e.target.files?.[0];
    if (!file) return;

    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        
        // Bundle imports
        if (parsed.app === "ArabPromptPro" && parsed.type === "bundle_config" && Array.isArray(parsed.projects)) {
          const validatedProjects: SavedProjectConfig[] = [];
          parsed.projects.forEach((proj: any) => {
            if (proj.name && proj.editorText) {
              validatedProjects.push({
                id: proj.id || 'proj-imported-' + Math.random().toString(36).substring(4),
                name: proj.name,
                description: proj.description || '',
                editorText: proj.editorText,
                variableValues: proj.variableValues || {},
                targetModel: proj.targetModel || 'gemini-3.5-flash',
                timestamp: proj.timestamp || new Date().toISOString()
              });
            }
          });
          
          if (validatedProjects.length > 0) {
            setSavedProjects(prev => [...validatedProjects, ...prev]);
            setSuccessNotification(lang === 'ar' 
              ? `✓ تم استيراد حزمة تحتوي على ${validatedProjects.length} مشاريع بنجاح!` 
              : `✓ Successfully imported bundle with ${validatedProjects.length} designs!`);
            setTimeout(() => setSuccessNotification(''), 3050);
          } else {
            setErrorStatus(lang === 'ar' ? 'لم يتم العثور على أي مشاريع صالحة في الحزمة.' : 'No items found in the uploaded JSON bundle.');
          }
        } 
        // Single project loader
        else if (parsed.editorText !== undefined) {
          const singleProj: SavedProjectConfig = {
            id: parsed.id || 'proj-imported-' + Date.now(),
            name: parsed.name || (lang === 'ar' ? 'تكوين مستورد' : 'Imported Configuration'),
            description: parsed.description || (lang === 'ar' ? 'تم استيراده من ملف خارجي' : 'Imported via design JSON config'),
            editorText: parsed.editorText,
            variableValues: parsed.variableValues || {},
            targetModel: parsed.targetModel || 'gemini-3.5-flash',
            timestamp: parsed.timestamp || new Date().toISOString()
          };
          
          setSavedProjects(prev => [singleProj, ...prev]);
          handleLoadProject(singleProj);
          setSuccessNotification(lang === 'ar' ? '✓ تم استيراد وتطبيق التكوين بنجاح!' : '✓ Project imported and applied to the workspace!');
          setTimeout(() => setSuccessNotification(''), 3000);
        } else {
          throw new Error('الملف المرفوع لا يحتوي على صياغة برومبت صالحة.');
        }
      } catch (err: any) {
        setErrorStatus(lang === 'ar' ? 'خطأ في قراءة ملف JSON: ' + err.message : 'Error parsing JSON config file: ' + err.message);
      }
    };
    fileReader.readAsText(file);
    e.target.value = '';
  };

  const handleExportActiveWorkspace = () => {
    const activeSample: SavedProjectConfig = {
      id: 'active-export-' + Date.now(),
      name: lang === 'ar' ? 'محتويات_المحرر_النشط' : 'active_workspace_draft',
      description: lang === 'ar' ? 'تصدير تلقائي لمحتويات محرر الأوامر الحالي' : 'Automatic active design spec draft export',
      editorText,
      variableValues,
      targetModel,
      timestamp: new Date().toISOString()
    };
    handleExportProjectJSON(activeSample);
  };

  const handleTriggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Prompter inputs and outputs state
  const [editorText, setEditorText] = useState<string>(
    `صمم لي حملة تسويقية لـ {product_name} الموجه لجمهور {target_audience} في مدينة {city}.`
  );
  const [variableValues, setVariableValues] = useState<Record<string, string>>({
    product_name: lang === 'ar' ? 'العطور الشرقية النادرة' : 'Oud Majestic Scent',
    target_audience: lang === 'ar' ? 'رجال وسيدات الأعمال من فئة النخبة' : 'Premium luxury business elites',
    city: lang === 'ar' ? 'الرياض وجدة' : 'Riyadh and Dubai'
  });
  
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [testResponse, setTestResponse] = useState<string>('');
  const [errorStatus, setErrorStatus] = useState<string>('');
  const [promptCopied, setPromptCopied] = useState<boolean>(false);
  const [targetModel, setTargetModel] = useState<string>('gemini-3.5-flash');
  const [successNotification, setSuccessNotification] = useState<string>('');
  const [reportCopied, setReportCopied] = useState<boolean>(false);
  const [enableSearch, setEnableSearch] = useState<boolean>(false);
  const [searchMetadata, setSearchMetadata] = useState<any | null>(null);

  // Auto variable extraction regex scanner
  // Matches {variable_name} or [variable_name]
  useEffect(() => {
    const regex = /\{([^}]+)\}|\[([^\]]+)\]/g;
    const foundVars: string[] = [];
    let match;
    while ((match = regex.exec(editorText)) !== null) {
      const varName = match[1] || match[2];
      if (varName && !foundVars.includes(varName)) {
        foundVars.push(varName);
      }
    }

    // Keep existing values, set defaults for newly discovered ones
    setVariableValues(prev => {
      const updated = { ...prev };
      foundVars.forEach(v => {
        if (updated[v] === undefined) {
          updated[v] = '';
        }
      });
      return updated;
    });
  }, [editorText]);

  // Compiled output getter
  const getCompiledPrompt = () => {
    let result = editorText;
    Object.entries(variableValues).forEach(([key, val]) => {
      const escapedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      // replace {key}
      const regexBraces = new RegExp(`\\{${escapedKey}\\}`, 'g');
      // replace [key]
      const regexBrackets = new RegExp(`\\[${escapedKey}\\]`, 'g');
      
      const replacement = val.trim() || `{${key}}`;
      result = result.replace(regexBraces, replacement).replace(regexBrackets, replacement);
    });
    return result;
  };

  // Keyboard shortcut Ctrl+Enter to test prompt
  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleExecutePrompt();
      }
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [editorText, variableValues]);

  // Execute/Test compiled prompt on real backend via api
  const handleExecutePrompt = async () => {
    const finalPrompt = getCompiledPrompt().trim();
    if (!finalPrompt) return;

    setIsExecuting(true);
    setErrorStatus('');
    setTestResponse('');
    setSearchMetadata(null);

    try {
      const response = await fetch('/api/test-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptText: finalPrompt,
          enableSearch: enableSearch,
          placeholderValues: {} // Already resolved client-side in compiled output
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'فشل الاتصال بالنموذج اللغوي.');
      }

      setTestResponse(data.response);
      if (data.groundingMetadata) {
        setSearchMetadata(data.groundingMetadata);
      }
      
      // Log to history
      onLogPrompt({
        originalText: editorText.length > 100 ? editorText.substring(0, 100) + '...' : editorText,
        optimizedText: finalPrompt,
        model: 'gemini',
        tone: 'professional',
        category: 'developer_lab',
        actionType: 'generate'
      });

    } catch (err: any) {
      setErrorStatus(err.message || 'حدث خطأ أثناء الاتصال بالخادم.');
    } finally {
      setIsExecuting(false);
    }
  };

  // Handle high quality prompts refinement (AI Refiner)
  const handleAIRefinePrompt = async () => {
    const finalPrompt = getCompiledPrompt().trim();
    if (!finalPrompt) return;

    setIsExecuting(true);
    setErrorStatus('');
    setTestResponse('');

    try {
      const response = await fetch('/api/refine-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftPrompt: finalPrompt,
          refinementGoal: lang === 'ar' ? 'تحسين صياغة وهيكلية الأمر بالكامل وجعله فائق الدقة' : 'Polishing variables structure, formatting rules and enhancing constraints'
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'فشلت معالجة صقل برومبت الذكاء الاصطناعي.');
      }

      setEditorText(data.refinedPrompt);
      setSuccessNotification(lang === 'ar' ? '✓ تم صقل الكود وإعادة التغذية الذكية بالكامل!' : '✓ Prompt refined and updated flawlessly!');
      setTimeout(() => setSuccessNotification(''), 3000);

    } catch (err: any) {
      setErrorStatus(err.message || 'حدث خطأ أثناء صقل البرومبت.');
    } finally {
      setIsExecuting(false);
    }
  };

  // Quick Translate Prompt To English
  const handleTranslatePrompt = async () => {
    const finalPrompt = getCompiledPrompt().trim();
    if (!finalPrompt) return;

    setIsExecuting(true);
    setErrorStatus('');
    setTestResponse('');

    try {
      const response = await fetch('/api/translate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptText: finalPrompt })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to translate prompt.');
      }

      setEditorText(data.translatedText);
      setSuccessNotification(lang === 'ar' ? '✓ تم الترجمة للهندسة الإنجليزية المثالية!' : '✓ Translated with perfect accuracy!');
      setTimeout(() => setSuccessNotification(''), 3000);

    } catch (err: any) {
      setErrorStatus(err.message || 'Error executing AI translation.');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCopyCompiled = () => {
    const final = getCompiledPrompt();
    navigator.clipboard.writeText(final);
    setPromptCopied(true);
    showToast(lang === 'ar' ? '✓ تم نسخ الأمر المجمّع للحافظة!' : '✓ Compiled prompt copied to clipboard!');
    setTimeout(() => setPromptCopied(false), 2000);
  };

  const handleExportAsMarkdown = (textToDownload?: string, customMeta?: string) => {
    const text = textToDownload || getCompiledPrompt();
    const dateStr = new Date().toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US');
    const modelUsed = customMeta || targetModel;
    const mdContent = `# ${lang === 'ar' ? 'مخرجات برومبت المترابطة مجمّعة' : 'Compiled Prompt Output'}\n\n` +
      `*${lang === 'ar' ? 'تم التوليد في ' : 'Generated on '} **${dateStr}** ${lang === 'ar' ? 'باستخدام' : 'via'} **ArabPromptPro**.*\n\n` +
      `## ${lang === 'ar' ? 'معلومات تكوين النموذج' : 'Model Configurations'}\n` +
      `- **Model Engine / AI Engine**: \`${modelUsed}\`\n` +
      `- **Variables count**: ${Object.keys(variableValues).length} ${lang === 'ar' ? 'متغيرات نشطة' : 'active variables'}\n\n` +
      `---\n\n` +
      `## ${lang === 'ar' ? 'نص البرومبت المجمّع' : 'Compiled Prompt'}\n\n` +
      `\`\`\`text\n${text}\n\`\`\`\n\n` +
      `*Generated with 🐪 ArabPromptPro - Enterprise Prompt Engineer Environment.*`;

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `arabprompt_${Date.now()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setSuccessNotification(lang === 'ar' ? '✓ تم تصدير الملف كـ Markdown بنجاح!' : '✓ Prompt exported as Markdown (.md) successfully!');
    setTimeout(() => setSuccessNotification(''), 3000);
  };

  const handleExportAsJSON = (textToDownload?: string, customMeta?: string) => {
    const text = textToDownload || getCompiledPrompt();
    const jsonPayload = {
      app: "ArabPromptPro",
      version: "1.0",
      exportedAt: new Date().toISOString(),
      engine: customMeta || targetModel,
      rawTemplate: editorText,
      variables: variableValues,
      compiledResult: text
    };

    const blob = new Blob([JSON.stringify(jsonPayload, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `arabprompt_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setSuccessNotification(lang === 'ar' ? '✓ تم تصدير الملف كـ JSON بنجاح!' : '✓ Prompt exported as JSON successfully!');
    setTimeout(() => setSuccessNotification(''), 3000);
  };

  const handleCopyFullMarkdownReport = () => {
    const dateTime = new Date().toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US');
    let variablesContent = '';
    const varKeys = Object.keys(variableValues);
    if (varKeys.length > 0) {
      variablesContent = varKeys.map(key => `- **${key}**: ${variableValues[key] || '*(فارغ / Empty)*'}`).join('\n');
    } else {
      variablesContent = lang === 'ar' ? '*لا توجد متغيرات نشطة حالياً*' : '*No active variables defined.*';
    }

    let searchContent = '';
    if (searchMetadata) {
      const queries = searchMetadata.webSearchQueries?.map((q: string) => `\`"${q}"\``).join(', ') || '';
      const anchors = searchMetadata.groundingChunks?.map((chunk: any) => {
        const title = chunk.web?.title || 'Verified Web Info';
        const uri = chunk.web?.uri || '#';
        return `- [${title}](${uri})`;
      }).join('\n') || '';

      searchContent = `### 🔍 Google Search Grounding Info\n` +
        (queries ? `- **Queries Executed**: ${queries}\n` : '') +
        (anchors ? `\n**Verified Sources Cited:**\n${anchors}\n` : '');
    }

    const report = 
      `# 🐪 ArabPromptPro - Prompt Design & Configuration Report\n` +
      `*Generated on **${dateTime}** via ArabPromptPro workspace.*\n\n` +
      `## ⚙️ Model Context Specification\n` +
      `- **AI Engine Model**: \`${targetModel}\`\n` +
      `- **Framework Format**: Arabic / Multilingual High Fidelity Prompting\n\n` +
      `---\n\n` +
      `## 📝 Prompt Variables Configuration\n` +
      `${variablesContent}\n\n` +
      `---\n\n` +
      `## 🗂️ Central Template Blueprint\n` +
      `\`\`\`text\n` +
      `${editorText}\n` +
      `\`\`\`\n\n` +
      `---\n\n` +
      `## 🚀 Compiled Prompt (Ready to Execute)\n` +
      `\`\`\`text\n` +
      `${getCompiledPrompt()}\n` +
      `\`\`\`\n\n` +
      (testResponse ? (
        `---\n\n` +
        `## 🤖 Simulated/Tested AI Response\n` +
        `\`\`\`text\n` +
        `${testResponse}\n` +
        `\`\`\`\n\n`
      ) : '') +
      (searchContent ? `\n${searchContent}\n` : '') +
      `\n*Generated with 🐪 ArabPromptPro - Enterprise Prompt Engineer Environment.*`;

    navigator.clipboard.writeText(report);
    setReportCopied(true);
    showToast(lang === 'ar' ? '✓ تم نسخ تقرير مخرجات البرومبت والإعدادات بصيغة Markdown بنجاح!' : '✓ Prompt configuration and results copied as Markdown!');
    setSuccessNotification(lang === 'ar' ? '✓ تم نسخ تقرير مخرجات البرومبت والإعدادات بصيغة Markdown بنجاح!' : '✓ Prompt configuration and results copied as Markdown!');
    setTimeout(() => {
      setReportCopied(false);
      setSuccessNotification('');
    }, 4000);
  };

  const handleLoadTemplate = (txt: string) => {
    setEditorText(txt);
    setActiveSubTab('lab');
    setSuccessNotification(lang === 'ar' ? '✓ تم نقل القالب للمحرر المركزي!' : '✓ Loaded successfully in the active editor!');
    setTimeout(() => setSuccessNotification(''), 3000);
  };

  // --------------------------------------------------------
  // STATS COMPUTATION FOR REPORTS
  // --------------------------------------------------------
  const stats = React.useMemo(() => {
    const total = history.length || 12; // fallback to graceful stats
    const favs = history.filter(h => h.isFavorite).length || 4;
    return {
      total,
      favs,
      expansion: '3.4x',
      accuracy: '98%'
    };
  }, [history]);

  return (
    <div id="arab-prompt-pro-dashboard" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Intro visual banner */}
      <div className="bg-gradient-to-r from-stone-900 to-stone-950 text-white rounded-3xl p-6 border border-stone-800 shadow-xl mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#c29b40]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#c29b40]/15 rounded-full text-[10px] font-black tracking-widest text-[#ecd197] border border-[#c29b40]/30 uppercase">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>{lang === 'ar' ? 'لوحة العمل الفنية المتكاملة' : 'UNIFIED DEVELOPER DESK'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none flex items-center gap-2">
            {lang === 'ar' ? 'عرب برومبت برو — مختبر الأوامر المهني ⚡' : 'ArabPrompt Pro — Advanced Engineering Console ⚡'}
          </h2>
          <p className="text-xs text-stone-400 font-medium">
            {lang === 'ar'
              ? 'مكتبة عمل مدمجة تتيح لك كتابة الأوامر، سحب المتغيرات ديناميكياً، التحسين بالذكاء الاصطناعي، تتبع السجلات والتحليلات في مساحة عمل واحدة.'
              : 'Write code templates, extract variables automatically on the fly, run fast iterations, view history logs and check performance reports.'}
          </p>
        </div>
        <div className="flex items-center gap-2 relative z-10 bg-stone-950 p-2.5 rounded-2xl border border-stone-850 shrink-0">
          <div className="text-right">
            <p className="text-[9px] font-black text-stone-400 uppercase">{lang === 'ar' ? 'حالة المنصة' : 'Server Engine'}</p>
            <p className="text-xs font-bold text-emerald-400">● {lang === 'ar' ? 'الشبكة متصلة' : 'Connected Live'}</p>
          </div>
        </div>
      </div>

      {/* Grid: Main sidebar and workspace container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left-hand Sidebar navigation (using the user's explicit items layout) */}
        <nav className="lg:col-span-3 bg-white rounded-3xl border border-stone-200/80 p-5 space-y-4">
          <div className="pb-3 border-b border-stone-100 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#c29b40]" />
            <span className="text-xs font-black text-stone-700 tracking-wider">
              {lang === 'ar' ? 'قائمة تصفح المختبر' : 'LABORATORY SELECTOR'}
            </span>
          </div>

          <ul className="space-y-1.5" id="dashboard-sidebar-menu">
            {[
              { id: 'lab', labelAr: 'مختبر الأوامر', labelEn: 'Command Sandbox', icon: Cpu },
              { id: 'projects', labelAr: 'حزم الاستيراد والتصدير', labelEn: 'Project Setups (JSON)', icon: Briefcase },
              { id: 'library', labelAr: 'مكتبة القوالب', labelEn: 'Templates Library', icon: Layers },
              { id: 'rap', labelAr: 'محرك راب الدارجة', labelEn: 'Moroccan Rap Engine', icon: Music },
              { id: 'history', labelAr: 'سجل الأوامر', labelEn: 'Prompt History Logs', icon: History },
              { id: 'analytics', labelAr: 'التقارير والتحليلات', labelEn: 'Insights & Reports', icon: BarChart3 }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSubTab === tab.id;
              return (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveSubTab(tab.id as any)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-[#c29b40] text-white shadow-md shadow-[#c29b40]/15'
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{lang === 'ar' ? tab.labelAr : tab.labelEn}</span>
                    </div>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 pt-4 border-t border-stone-100 p-3 bg-stone-50 rounded-2xl text-[11px] text-stone-500 font-medium font-sans">
            <p className="font-bold text-stone-750 flex items-center gap-1 mb-1">
              <Info className="w-3.5 h-3.5 text-[#c29b40]" />
              {lang === 'ar' ? 'تعليمات الاختصار' : 'Keyboard Shortcut'}
            </p>
            <p className="leading-relaxed text-stone-500">
              {lang === 'ar'
                ? 'انقر على مفتاحي Ctrl + Enter داخل المحرر المركزي في مساحة العمل لتشغيل وتجربة الأمر فوراً!'
                : 'Press Ctrl + Enter inside prompt editor anytime to instantly query the sandbox.'}
            </p>
          </div>
        </nav>

        {/* Right-hand Main Sub-tab Workspace renderer */}
        <section className="lg:col-span-9 bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 min-h-[500px]">
          
          <AnimatePresence mode="wait">
            
            {/* SUBTAB 1: PRO PROMPTER LABORATORY WITH DYNAMIC EXTRACTION */}
            {activeSubTab === 'lab' && (
              <motion.div
                key="lab-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Header banner and notification */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-100 pb-4 mb-4 gap-4">
                  <div>
                    <h3 className="text-lg font-black text-stone-900 font-sans">
                      {lang === 'ar' ? 'محرر البرومبت المركزي (Prompt Sandbox editor)' : 'Dynamic Prompt Sandbox'}
                    </h3>
                    <p className="text-xs text-stone-400 font-semibold mt-0.5">
                      {lang === 'ar' 
                        ? 'اكتب برومبتك محاطاً بـ {اسم_المتغير} ليتم إنتاج حقول الإدخال والدمج ديناميكياً.'
                        : 'Enclose custom fields in {brackets} to extract variables on the sidebar instantly.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Hidden Native File Input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept=".json"
                      className="hidden"
                    />
                    
                    <button
                      onClick={handleTriggerFileInput}
                      title={lang === 'ar' ? 'استيراد تهيئة JSON خارجي' : 'Import external JSON config'}
                      className="px-3 py-1.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl transition text-stone-600 hover:text-stone-900 cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#c29b40]" />
                      <span className="hidden sm:inline">{lang === 'ar' ? 'استيراد' : 'Import JSON'}</span>
                    </button>

                    <button
                      onClick={handleExportActiveWorkspace}
                      title={lang === 'ar' ? 'تصدير مسودة المحرر الحالية كـ JSON' : 'Export current draft workspace as JSON'}
                      className="px-3 py-1.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl transition text-stone-600 hover:text-stone-900 cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                    >
                      <Download className="w-3.5 h-3.5 text-[#c29b40]" />
                      <span className="hidden sm:inline">{lang === 'ar' ? 'تصدير' : 'Export JSON'}</span>
                    </button>

                    <select
                      value={targetModel}
                      onChange={(e) => setTargetModel(e.target.value)}
                      className="bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-stone-800 focus:outline-none"
                    >
                      <option value="gemini-3.5-flash">Gemini 3.5 Flash</option>
                      <option value="claude-3-haiku">Claude 3.5 Sonnet</option>
                      <option value="gpt-4o-mini">GPT-4o Mini</option>
                    </select>
                  </div>
                </div>

                {successNotification && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold font-sans"
                  >
                    {successNotification}
                  </motion.div>
                )}

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column: Editor & Dynamic variables */}
                  <div className="xl:col-span-8 space-y-5">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-extrabold text-[#c29b40] uppercase tracking-wider block font-sans">
                          {lang === 'ar' ? 'مساحة تحرير القالب المركزي:' : 'Prompt framework template:'}
                        </label>
                        <VoiceInputButton
                          lang={lang}
                          onTranscript={(transcript) => {
                            setEditorText((prev) => {
                              const trimmed = prev.trim();
                              return trimmed ? `${trimmed} ${transcript}` : transcript;
                            });
                          }}
                        />
                      </div>
                      <textarea
                        value={editorText}
                        onChange={(e) => setEditorText(e.target.value)}
                        rows={7}
                        className="w-full bg-[#fdfdfc] border border-stone-300 rounded-2xl p-4 text-xs font-semibold leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#c29b40]/30 transition-all font-sans"
                        placeholder={lang === 'ar' ? 'اكتب برومبتك هنا...' : 'Write custom templates here...'}
                      />
                    </div>

                    {/* AI Actions panel */}
                    <div className="flex flex-wrap gap-2 pt-1 border-t border-stone-50">
                      <button
                        onClick={handleAIRefinePrompt}
                        disabled={isExecuting}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-stone-950 hover:text-black font-black text-xs rounded-xl flex items-center gap-1.5 shadow transition-all cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{lang === 'ar' ? 'تحسين بالذكاء الاصطناعي 🪄' : 'AI Craft Polish 🪄'}</span>
                      </button>

                      <button
                        onClick={handleTranslatePrompt}
                        disabled={isExecuting}
                        className="px-4 py-2 bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 hover:text-stone-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Settings className="w-4 h-4 text-stone-400" />
                        <span>{lang === 'ar' ? 'ترجمة تلقائية للإنجليزية' : 'Optimize to English'}</span>
                      </button>

                      <button
                        onClick={handleExecutePrompt}
                        disabled={isExecuting}
                        className="px-4 py-2 bg-[#ecd197]/20 hover:bg-[#ecd197]/40 text-[#593d0d] font-black text-xs rounded-xl flex items-center gap-1.5 border border-[#c29b40]/30 transition-all cursor-pointer shrink-0"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>{lang === 'ar' ? 'تشغيل وتجربة البرومبت' : 'Run Scenario Test'}</span>
                      </button>
                    </div>

                    {/* Google Search Grounding toggle for execution */}
                    <div className="pt-1 select-none">
                      <label
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all cursor-pointer text-[11px] font-bold ${
                          enableSearch
                            ? 'bg-amber-500/5 border-amber-500/35 text-[#886217]'
                            : 'bg-stone-50/50 border-stone-200 hover:border-stone-300 text-stone-600 hover:text-stone-800'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={enableSearch}
                          onChange={(e) => setEnableSearch(e.target.checked)}
                          className="rounded text-[#c29b40] focus:ring-[#c29b40] h-4 w-4 border-stone-300 cursor-pointer focus:ring-opacity-50"
                        />
                        <div className="flex items-center gap-1.5 flex-1 text-right rtl:text-right" dir="rtl">
                          <Globe className={`w-3.5 h-3.5 shrink-0 ${enableSearch ? 'text-amber-500 animate-pulse' : 'text-stone-400'}`} />
                          <div>
                            <span className="block text-[11px]">
                              {lang === 'ar' ? 'التثبيت في بحث جوجل (Google Search)' : 'Anchor/Ground in Google Search'}
                            </span>
                            <span className="block text-[9px] text-stone-400 font-normal">
                              {lang === 'ar' ? 'البحث عن المعلومات المحدثة والحقائق في جوجل تلقائياً لتثبيت إجابة الذكاء الاصطناعي.' : 'Perform dynamic live searches to ground prompt parameters before generating answer.'}
                            </span>
                          </div>
                        </div>
                      </label>
                    </div>

                    {/* Dynamic inputs form block */}
                    {Object.keys(variableValues).length > 0 && (
                      <div className="bg-stone-50 rounded-2xl p-4 sm:p-6 border border-stone-150 space-y-4">
                        <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                          <h4 className="text-xs font-black text-stone-700 uppercase tracking-widest block font-sans">
                            {lang === 'ar' ? 'المتغيرات المستخرجة ديناميكياً:' : 'Extracted Variables Control Panel:'}
                          </h4>
                          <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded-full border border-amber-200 uppercase">
                            {Object.keys(variableValues).length} Variables Found
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {Object.entries(variableValues).map(([key, val]) => (
                            <div key={key} className="space-y-1">
                              <label className="text-[11px] font-black text-stone-500 uppercase tracking-wider block font-sans truncate">
                                {key} :
                              </label>
                              <input
                                type="text"
                                value={val}
                                onChange={(e) => setVariableValues(prev => ({ ...prev, [key]: e.target.value }))}
                                placeholder={lang === 'ar' ? 'أدخل قيمة هذا المتغير...' : `Define ${key}...`}
                                className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#c29b40]"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Live compiled preview and Terminal logger */}
                  <div className="xl:col-span-4 space-y-5">
                    
                    {/* Real-time compiled output panel */}
                    <div className="bg-[#fcfbf9] border border-amber-300/3c rounded-2xl p-5 space-y-3 shadow-sm relative">
                      <div className="flex justify-between items-center text-[10px] font-extrabold text-stone-400 tracking-wider">
                        <span>{lang === 'ar' ? 'مخرجات برومبت المترابطة مجمّعة:' : 'COMPILED WORKSPACE PROMPT:'}</span>
                        <button
                          onClick={handleCopyCompiled}
                          className="text-[#9c7524] hover:text-[#c29b40] font-black transition-all flex items-center gap-1 text-[10px] border border-stone-200 hover:bg-stone-50 rounded-lg px-2 py-1 cursor-pointer"
                        >
                          {promptCopied ? (
                            <>
                              <Check className="w-3" />
                              <span>{lang === 'ar' ? 'تم النسخ!' : 'Copied!'}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3" />
                              <span>{lang === 'ar' ? 'نسخ' : 'Copy'}</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="text-xs bg-white border border-stone-150 p-3.5 rounded-xl block leading-relaxed max-h-48 overflow-y-auto font-mono text-[#c29b40]/90 text-right font-sans">
                        {getCompiledPrompt()}
                      </div>

                      <div className="flex flex-col gap-2 pt-2 border-t border-stone-100">
                        <div className="flex flex-col sm:flex-row items-center gap-2">
                          <button
                            onClick={() => handleExportAsMarkdown()}
                            className="w-full sm:flex-1 py-1.5 px-2 border border-stone-200 hover:border-[#c29b40]/30 bg-white hover:bg-stone-50 rounded-lg text-[10px] font-bold text-stone-600 hover:text-[#9c7524] transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Download className="w-3 h-3 text-[#c29b40]" />
                            <span>{lang === 'ar' ? 'تحميل Markdown (.md)' : 'Download MD (.md)'}</span>
                          </button>
                          <button
                            onClick={() => handleExportAsJSON()}
                            className="w-full sm:flex-1 py-1.5 px-2 border border-stone-200 hover:border-[#c29b40]/30 bg-white hover:bg-stone-50 rounded-lg text-[10px] font-bold text-stone-600 hover:text-[#9c7524] transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Download className="w-3 h-3 text-stone-400" />
                            <span>{lang === 'ar' ? 'تحميل ملف JSON' : 'Download JSON'}</span>
                          </button>
                        </div>
                        <button
                          onClick={handleCopyFullMarkdownReport}
                          className="w-full py-1.5 px-2 border border-amber-200 bg-amber-50/50 hover:bg-amber-100/50 rounded-lg text-[10px] font-bold text-amber-900 hover:text-amber-950 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          {reportCopied ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600 animate-bounce" />
                              <span className="text-emerald-700">{lang === 'ar' ? 'تم نسخ التقرير الشامل!' : 'Copied Full Report!'}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-[#c29b40]" />
                              <span>{lang === 'ar' ? 'نسخ التقرير الشامل كـ Markdown' : 'Copy Full Config & Result Report (Markdown)'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Simulation logs screen */}
                    <div className="bg-stone-900 text-stone-100 rounded-2xl p-5 border border-stone-800 space-y-3 shadow-inner min-h-[220px]">
                      <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                        <div className="flex items-center gap-2">
                          <Terminal className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="text-[10px] font-black text-stone-400 tracking-widest uppercase">
                            {lang === 'ar' ? 'مخرجات نموذج تجربة الـ AI' : 'Live Simulation Log'}
                          </span>
                        </div>
                        {isExecuting && (
                          <span className="text-[9px] font-semibold text-[#ecd197] animate-pulse">
                            Querying Live Core...
                          </span>
                        )}
                      </div>

                      <div className="space-y-4">
                        {isExecuting && (
                          <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
                            <RefreshCw className="w-7 h-7 text-[#c29b40] animate-spin mb-2" />
                            <p className="text-[11px] font-bold text-stone-400 animate-pulse">
                              {lang === 'ar' ? 'جاري استدعاء الخوادم...' : 'Executing LLM matrix queries...'}
                            </p>
                          </div>
                        )}

                        {errorStatus && (
                          <div className="p-3 bg-red-950/40 border border-red-900/30 rounded-xl text-[11px] flex items-start gap-2 text-red-350 leading-relaxed font-sans mt-2">
                            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                            <p>{errorStatus}</p>
                          </div>
                        )}

                        {!isExecuting && !testResponse && !errorStatus && (
                          <div className="text-center py-12 text-stone-500 space-y-2">
                            <Cpu className="w-9 h-9 text-stone-600 mx-auto" />
                            <p className="text-[10px] font-bold">
                              {lang === 'ar' ? 'اضغط تشغيل في اليسار لعرض المخرجات' : 'Ready for execution query'}
                            </p>
                          </div>
                        )}

                        {!isExecuting && testResponse && (
                          <div className="space-y-4">
                            <div className="bg-stone-950 p-4 rounded-xl border border-stone-850 text-[11px] leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap font-sans text-stone-300 text-right" dir="auto">
                              {testResponse}
                            </div>

                            {/* Google Search ground truth citations for dashboard simulation */}
                            {searchMetadata && (
                              <div className="bg-stone-900 border border-stone-800 p-3.5 rounded-xl space-y-2.5 font-sans animate-fade-in text-right" dir="rtl">
                                <div className="flex items-center gap-1.5 border-b border-stone-800 pb-2">
                                  <Globe className="w-3.5 h-3.5 text-amber-500 animate-pulse shrink-0" />
                                  <span className="text-[10px] font-bold text-stone-300">
                                    {lang === 'ar' ? 'مراجع تم التحقق منها عبر بحث جوجل:' : 'Google Search Verified Anchors:'}
                                  </span>
                                </div>

                                {searchMetadata.webSearchQueries && searchMetadata.webSearchQueries.length > 0 && (
                                  <div className="space-y-1">
                                    <span className="text-[9px] font-bold text-stone-500">
                                      {lang === 'ar' ? 'كلمات البحث المتطابقة:' : 'Query executed:'}
                                    </span>
                                    <div className="flex flex-wrap gap-1">
                                      {searchMetadata.webSearchQueries.map((query: string, i: number) => (
                                        <span key={i} className="text-[9px] font-semibold text-amber-400/90 bg-amber-950/40 border border-amber-900/30 px-1.5 py-0.5 rounded">
                                          "{query}"
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {searchMetadata.groundingChunks && searchMetadata.groundingChunks.length > 0 && (
                                  <div className="space-y-1.5 pt-1">
                                    <span className="text-[9px] font-bold text-stone-500">
                                      {lang === 'ar' ? 'عناوين الصفحات المقتبسة:' : 'Cited websites:'}
                                    </span>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-right">
                                      {searchMetadata.groundingChunks.map((chunk: any, i: number) => {
                                        const siteName = chunk.web?.title || (lang === 'ar' ? 'رابط مصدر وب خارجي' : 'External reference site');
                                        const siteUrl = chunk.web?.uri || '#';
                                        return (
                                          <a
                                            key={i}
                                            href={siteUrl}
                                            target="_blank"
                                            rel="noreferrer referrer"
                                            className="flex items-center justify-between gap-1.5 p-2 bg-stone-950 border border-stone-850 hover:border-amber-600/40 rounded-lg text-[9px] text-stone-350 hover:text-amber-300 transition-all text-right cursor-pointer"
                                          >
                                            <span className="truncate max-w-[170px]">{siteName}</span>
                                            <ArrowUpRight className="w-3 h-3 text-stone-500 shrink-0" />
                                          </a>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                    </div>

                  </div>

                </div>
              </motion.div>
            )}

            {/* SUBTAB 2: INTERACTIVE TEMPLATE CATALOG WITH ONE-CLICK LOADER */}
            {activeSubTab === 'library' && (
              <motion.div
                key="library-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                <div className="border-b border-stone-100 pb-3">
                  <h3 className="text-lg font-black text-stone-900 font-sans">
                    {lang === 'ar' ? 'مكتبة مسبقة التهيئة بالأوامر' : 'AI Prompt Framework Presets'}
                  </h3>
                  <p className="text-xs text-stone-400 font-semibold mt-0.5">
                    {lang === 'ar' 
                      ? 'حدد قالب العمل، وانقر عليه لنقله فوراً في مساحة تجربة مسودة المحرر اللفظي.'
                      : 'Choose presets, load them dynamically in the compiler, fill extracted boxes and execute.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {PRESET_TEMPLATES.map((tpl) => (
                    <div
                      key={tpl.id}
                      className="border border-stone-200 rounded-2xl p-5 hover:border-[#c29b40] transition duration-200 bg-[#fafafa] flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[9px] font-black uppercase tracking-widest text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                            {tpl.category}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-stone-850 mb-2 font-sans">
                          {lang === 'ar' ? tpl.titleAr : tpl.titleEn}
                        </h4>
                        <p className="text-[11px] text-stone-550 leading-relaxed max-h-24 overflow-hidden text-ellipsis line-clamp-3 font-mono">
                          {tpl.text}
                        </p>
                      </div>
                      <button
                        onClick={() => handleLoadTemplate(tpl.text)}
                        className="mt-4 w-full py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl cursor-pointer transition flex items-center justify-center gap-1"
                      >
                        <span>{lang === 'ar' ? 'تطبيق وحقن القالب ⚡' : 'Inject & Build ⚡'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* SUBTAB 3: MOROCCAN RAP ENGINE WITH ONE-CLICK LYRICS GENERATION */}
            {activeSubTab === 'rap' && (
              <motion.div
                key="rap-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="border-b border-stone-100 pb-3">
                  <h3 className="text-lg font-black text-stone-900 font-sans">
                    {lang === 'ar' ? 'محرك راب الدارجة المغربية' : 'Moroccan Rap Lyrics Blueprint'}
                  </h3>
                  <p className="text-xs text-stone-400 font-semibold mt-0.5">
                    {lang === 'ar' 
                      ? 'اختر السمة الفنية والوزنية للراب الدارجة ليتم نقل تعليمات كتابتها لتعديل متغيراته.'
                      : 'Load Moroccan Darija themes, output professional lyrics structured natively with high rhymes.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {RAP_THEMES.map((theme) => (
                    <div
                      key={theme.id}
                      className="bg-stone-50 border border-stone-150 p-5 rounded-2xl flex flex-col justify-between"
                    >
                      <div>
                        <Music className="w-7 h-7 text-[#c29b40] mb-3" />
                        <h4 className="text-xs font-black text-stone-850 mb-1 font-sans">
                          {lang === 'ar' ? theme.titleAr : theme.titleEn}
                        </h4>
                        <p className="text-[10px] text-stone-500 leading-relaxed font-sans">
                          {lang === 'ar' 
                            ? 'نمط كتابة يركز على الكلاش والقوافي المغربية الكلاسيكية.'
                            : 'Authentic lyrics template with classic hiphop beats references.'}
                        </p>
                      </div>
                      <button
                        onClick={() => handleLoadTemplate(theme.prompt)}
                        className="mt-4 py-2 bg-amber-600 hover:bg-amber-700 text-stone-950 font-black text-[11px] rounded-xl cursor-pointer transition flex items-center justify-center gap-1"
                      >
                        <span>{lang === 'ar' ? 'توليد المخطط الزمني' : 'Use Theme Prompt'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* SUBTAB 4: LOGS AND HISTORY BACKUP RETRIEVER */}
            {activeSubTab === 'history' && (
              <motion.div
                key="history-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                <div className="flex justify-between items-center border-b border-stone-100 pb-3">
                  <div>
                    <h3 className="text-lg font-black text-[#1c1a16] font-sans">
                      {lang === 'ar' ? 'سجل الأوامر في المختبر' : 'Lab Interaction History Logs'}
                    </h3>
                    <p className="text-xs text-stone-400 font-semibold mt-0.5">
                      {lang === 'ar' ? 'استعرض آخر الأوامر التي قمت بتوليدها وتجربتها.' : 'Review your previously generated or refined outputs.'}
                    </p>
                  </div>
                </div>

                {history.length === 0 ? (
                  <div className="text-center py-12 text-stone-450 border border-dashed rounded-3xl border-stone-200">
                    <History className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                    <p className="text-xs font-bold">{lang === 'ar' ? 'لم يتم حفظ محاولات حتى الآن' : 'Your interaction history is temporarily empty'}</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
                    {history.map((item) => (
                      <div
                        key={item.id}
                        className="border border-stone-200 rounded-2xl p-4 bg-stone-50 hover:bg-white transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                      >
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] bg-stone-200 text-stone-800 font-black rounded px-2 py-0.5 uppercase">
                              {item.category || 'general'}
                            </span>
                            <span className="text-[9px] text-stone-400 font-mono">
                              {new Date(item.timestamp).toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-stone-800 truncate font-sans">
                            {item.originalText}
                          </p>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            onClick={() => handleLoadTemplate(item.optimizedText)}
                            className="px-2.5 py-1.5 bg-stone-900 text-white rounded-lg hover:bg-stone-800 text-[10px] font-bold cursor-pointer transition flex items-center gap-1"
                          >
                            <span>{lang === 'ar' ? 'استعادة ⚡' : 'Inject'}</span>
                          </button>
                          <button
                            onClick={() => handleExportAsMarkdown(item.optimizedText, item.category)}
                            title={lang === 'ar' ? 'تصدير كـ Markdown' : 'Export as Markdown'}
                            className="p-1.5 bg-white border border-stone-250 text-stone-600 hover:text-[#c29b40] hover:border-[#c29b40] rounded-lg cursor-pointer transition flex items-center justify-center"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleExportAsJSON(item.optimizedText, item.category)}
                            title={lang === 'ar' ? 'تصدير كـ JSON' : 'Export as JSON'}
                            className="px-2 py-1 bg-white border border-stone-250 text-stone-600 hover:text-[#c29b40] hover:border-[#c29b40] rounded-lg cursor-pointer transition text-[9px] font-mono font-bold flex items-center justify-center"
                          >
                            JSON
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* SUBTAB 5: MOCK METRICS CHART AND PDF REPORT COMPILER */}
            {activeSubTab === 'analytics' && (
              <motion.div
                key="analytics-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="border-b border-stone-100 pb-3">
                  <h3 className="text-lg font-black text-stone-900 font-sans">
                    {lang === 'ar' ? 'التقارير والاستهلاك ومقاييس الجودة' : 'Live Insights & Quality metrics'}
                  </h3>
                  <p className="text-xs text-stone-400 font-semibold mt-0.5">
                    {lang === 'ar' ? 'تحليلات تفصيلية عن جودة صياغة البرومبتات النشطة ومعدل التوسع.' : 'Telemetry records analyzing prompt lift ratio and context density.'}
                  </p>
                </div>

                {/* Scorecards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-stone-50 p-4 rounded-2xl border border-stone-150 text-center">
                    <p className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest">{lang === 'ar' ? 'عدد التوليد المفعّل' : 'TOTAL QUERIES'}</p>
                    <h4 className="text-2xl font-black text-stone-850 mt-1 font-sans">{stats.total}</h4>
                  </div>
                  <div className="bg-stone-50 p-4 rounded-2xl border border-stone-150 text-center">
                    <p className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest">{lang === 'ar' ? 'دقة المدخلات الرمزية' : 'SYNTAX COVERAGE'}</p>
                    <h4 className="text-2xl font-black text-[#c29b40] mt-1 font-sans">{stats.accuracy}</h4>
                  </div>
                  <div className="bg-stone-50 p-4 rounded-2xl border border-stone-150 text-center">
                    <p className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest">{lang === 'ar' ? 'نسبة توسيع الصياغة' : 'EXPANSION MULTIPLE'}</p>
                    <h4 className="text-2xl font-black text-amber-700 mt-1 font-sans">{stats.expansion}</h4>
                  </div>
                  <div className="bg-stone-50 p-4 rounded-2xl border border-stone-150 text-center">
                    <p className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest">{lang === 'ar' ? 'المفضلة الذهبية' : 'FAVORITES LOG'}</p>
                    <h4 className="text-2xl font-black text-emerald-600 mt-1 font-sans">{stats.favs}</h4>
                  </div>
                </div>

                {/* Simple Custom SVG Visualizations */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                  <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-3">
                    <h4 className="text-xs font-black text-stone-700 uppercase tracking-wider block font-sans">
                      {lang === 'ar' ? 'توزع الأوامر حسب قنوات الذكاء الاصطناعي:' : 'System models telemetry distribution:'}
                    </h4>
                    
                    <div className="space-y-2.5">
                      {[
                        { name: 'Gemini 3.5 Core', percent: 75, color: 'bg-[#c29b40]' },
                        { name: 'Claude 3.5 Sonnet', percent: 15, color: 'bg-[#ced240]' },
                        { name: 'GPT-4o API', percent: 10, color: 'bg-emerald-600' }
                      ].map(model => (
                        <div key={model.name} className="space-y-1">
                          <div className="flex justify-between text-[11px] font-bold text-stone-600 font-sans">
                            <span>{model.name}</span>
                            <span>{model.percent}%</span>
                          </div>
                          <div className="h-2.5 bg-stone-100 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${model.percent}%` }}
                              transition={{ duration: 0.6 }}
                              className={`h-full ${model.color}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-black text-stone-700 uppercase tracking-wider block font-sans mb-1">
                        {lang === 'ar' ? 'معامل التوسيع الفني (Enrichment)' : 'Context Efficiency Index'}
                      </h4>
                      <p className="text-[11px] text-stone-500 leading-relaxed font-sans">
                        {lang === 'ar'
                          ? 'يقيس المحرك كمية السياق والضوابط التي تمت إضافتها للتأكد من خروج الرد بأعلى التفاصيل وأقل الهلوسات الممكنة.'
                          : 'Tracks added structured details and instructions to guarantee highly customized output results.'}
                      </p>
                    </div>

                    <div className="text-xs italic bg-stone-50 p-3 rounded-xl border border-stone-150 leading-relaxed font-sans text-[#c29b40]">
                      {lang === 'ar'
                        ? '💡 نصيحة مهنية: استخدام المتغيرات داخل الأقواس {..} يرفع دقة معالجة استيعاب النموذج للشروط بنسبة 42%!'
                        : '💡 Advisor Tip: Enclosing parameters within curly brackets yields 42% faster model prompt matching!'}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeSubTab === 'projects' && (
              <motion.div
                key="projects-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Header and overview */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-stone-100 pb-4 mb-4 gap-4">
                  <div>
                    <h3 className="text-lg font-black text-stone-900 font-sans">
                      {lang === 'ar' ? 'إدارة وتصدير مشاريع صياغة الأوامر 📂' : 'Workspace Projects & JSON Configurations 📂'}
                    </h3>
                    <p className="text-xs text-stone-400 font-semibold mt-0.5 font-sans">
                      {lang === 'ar'
                        ? 'احفظ بيئة العمل وصياغة المتغيرات كملفات JSON سريعة، وشاركها مع أفراد فريقك بدقة تامة.'
                        : 'Export template structure, variables and parameters as JSON config files to share with teammates.'}
                    </p>
                  </div>
                  
                  {/* Global Actions */}
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept=".json"
                      className="hidden"
                    />
                    <button
                      onClick={handleTriggerFileInput}
                      className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span className="font-sans">{lang === 'ar' ? 'استيراد ملف JSON 📤' : 'Import JSON config'}</span>
                    </button>
                    {savedProjects.length > 0 && (
                      <button
                        onClick={handleExportAllProjectsJSON}
                        className="px-3.5 py-2 bg-[#ecd197]/20 hover:bg-[#ecd197]/40 text-[#593d0d] font-black text-xs rounded-xl flex items-center gap-1.5 border border-[#c29b40]/30 transition cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="font-sans">{lang === 'ar' ? 'تصدير الكل (حزمة) 📦' : 'Export Pack (Bundle)'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {successNotification && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold font-sans"
                  >
                    {successNotification}
                  </motion.div>
                )}

                {errorStatus && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-bold font-sans flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <p>{errorStatus}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                  
                  {/* Left block: Save Current Workspace */}
                  <div className="xl:col-span-5 bg-stone-50 border border-stone-200/60 rounded-2xl p-5 space-y-4">
                    <h4 className="text-xs font-black text-[#c29b40] uppercase tracking-wider font-sans flex items-center gap-1.5">
                      <Save className="w-4 h-4" />
                      <span>{lang === 'ar' ? 'حفظ مساحة العمل الحالية:' : 'Save active workspace draft:'}</span>
                    </h4>
                    
                    <div className="text-stone-500 text-[11px] leading-relaxed font-semibold font-sans">
                      {lang === 'ar'
                        ? 'سيقوم هذا الإجراء بالتقاط القالب الفعال الحالي ومحرر المتغيرات وقيمها لحفظها كاسم مشروع محلي قابل للتصدير.'
                        : 'Quickly lock current sandbox template context, model properties & any custom variables filled below into a local template.'}
                    </div>

                    <div className="space-y-3.5">
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-stone-600 block uppercase font-sans">
                          {lang === 'ar' ? 'اسم المشروع / التكوين:' : 'Configuration/Setup Name:'}
                        </label>
                        <input
                          type="text"
                          value={newProjectName}
                          onChange={(e) => setNewProjectName(e.target.value)}
                          placeholder={lang === 'ar' ? 'مثال: نموذج_الجرائم_المعلوماتية_الأولية' : 'e.g. Translation_Quality_Agent'}
                          className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#c29b40] font-sans"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-stone-600 block uppercase font-sans">
                          {lang === 'ar' ? 'وصف المشروع (اختياري):' : 'Project description (Optional):'}
                        </label>
                        <textarea
                          value={newProjectDescription}
                          onChange={(e) => setNewProjectDescription(e.target.value)}
                          placeholder={lang === 'ar' ? 'وصف موجز للميزات والمدخلات ومستهدفات الاستخدام...' : 'Brief summary of what this prompt model focuses on...'}
                          rows={3}
                          className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#c29b40] font-sans"
                        />
                      </div>

                      <button
                        onClick={() => handleSaveActiveProject(newProjectName, newProjectDescription)}
                        disabled={!newProjectName.trim()}
                        className={`w-full py-2.5 rounded-xl font-black text-xs transition flex items-center justify-center gap-1.5 cursor-pointer font-sans ${
                          newProjectName.trim()
                            ? 'bg-[#c29b40] hover:bg-[#b08735] text-white shadow-md shadow-[#c29b40]/15'
                            : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                        <span>{lang === 'ar' ? 'حفظ مساحة المحرر الحالية 📥' : 'Save current Workspace'}</span>
                      </button>
                    </div>

                    <div className="pt-2 border-t border-stone-200/80 space-y-2">
                      <h5 className="text-[10px] font-extrabold text-stone-700 uppercase tracking-widest block font-sans">
                        {lang === 'ar' ? 'معلومات التصدير المباشر:' : 'ACTIVE SANDBOX METADATA WHICH WILL BE CAPTURED:'}
                      </h5>
                      <div className="bg-stone-100/50 rounded-xl p-3 text-[10px] text-stone-500 space-y-1 font-mono">
                        <p className="truncate"><span className="font-bold">Text:</span> {editorText.substring(0, 45)}...</p>
                        <p><span className="font-bold">Vars Count:</span> {Object.keys(variableValues).length}</p>
                        <p><span className="font-bold">Model Engine:</span> {targetModel}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right block: List of saved projects */}
                  <div className="xl:col-span-7 space-y-4">
                    <h4 className="text-xs font-black text-stone-700 uppercase tracking-widest block font-sans mb-1">
                      {lang === 'ar' ? 'قائمة المشروعات المحفوظة محلياً:' : 'Saved Project Configurations Library:'}
                    </h4>

                    {savedProjects.length === 0 ? (
                      <div className="text-center py-16 text-stone-400 border border-dashed rounded-3xl border-stone-200 bg-stone-50/50">
                        <FolderOpen className="w-12 h-12 text-stone-300 mx-auto mb-2" />
                        <p className="text-xs font-bold text-stone-500 font-sans">
                          {lang === 'ar' ? 'لا يوجد مشروعات محفوظة حتى الآن.' : 'No saved prompt setups inside this environment yet.'}
                        </p>
                        <p className="text-[10px] text-stone-400 mt-1 max-w-xs mx-auto font-sans">
                          {lang === 'ar'
                            ? 'استخدم النموذج في اليسار لحفظ إعدادات العمل الفعال أو قم بسحب وإسقاط ملف JSON خارجي.'
                            : 'Fill the left form to lock your active progress or import external JSON configurators directly.'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                        {savedProjects.map((proj) => {
                          const varsCount = Object.keys(proj.variableValues || {}).length;
                          return (
                            <div
                              key={proj.id}
                              className="border border-stone-200 hover:border-[#c29b40] rounded-2xl p-5 bg-white hover:bg-stone-50/30 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden"
                            >
                              <div className="space-y-1.5 flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[9px] bg-[#c29b40]/15 text-[#8f6e24] font-black rounded-full px-2.5 py-0.5 uppercase tracking-wide border border-[#c29b40]/25 font-mono">
                                    {proj.targetModel || 'gemini'}
                                  </span>
                                  <span className="text-[9px] bg-stone-150 text-stone-700 font-extrabold rounded-full px-2.5 py-0.5 uppercase tracking-wide font-mono">
                                    {varsCount} {varsCount === 1 ? 'Var' : 'Vars'}
                                  </span>
                                  <span className="text-[8px] text-stone-400 font-mono">
                                    {new Date(proj.timestamp).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                                  </span>
                                </div>
                                <h4 className="text-xs font-black text-stone-900 font-sans leading-none truncate block">
                                  {proj.name}
                                </h4>
                                <p className="text-[11px] text-stone-500 leading-relaxed font-sans line-clamp-2">
                                  {proj.description}
                                </p>
                              </div>

                              <div className="flex gap-2 shrink-0 self-end md:self-auto">
                                <button
                                  onClick={() => handleLoadProject(proj)}
                                  title={lang === 'ar' ? 'تحميل التكوين للعلبة' : 'Load variables into editor'}
                                  className="px-3 py-1.5 bg-stone-900 text-white rounded-xl hover:bg-stone-800 text-[10px] font-bold cursor-pointer transition flex items-center gap-1 font-sans"
                                >
                                  <Play className="w-3 h-3 shrink-0" />
                                  <span>{lang === 'ar' ? 'تطبيق ⚡' : 'Inject'}</span>
                                </button>
                                
                                <button
                                  onClick={(e) => handleExportProjectJSON(proj, e)}
                                  title={lang === 'ar' ? 'تصدير كملف JSON' : 'Export setup as JSON file'}
                                  className="p-1.5 bg-white text-stone-600 rounded-xl border border-stone-200 hover:border-[#c29b40] hover:text-[#c29b40] transition cursor-pointer"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={(e) => handleDeleteProject(proj.id, e)}
                                  title={lang === 'ar' ? 'حذف هذا التكوين' : 'Delete config file'}
                                  className="p-1.5 bg-white text-stone-400 rounded-xl border border-stone-200 hover:border-red-600 hover:text-red-600 transition cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                </div>

                {/* Master export tool section */}
                <div id="master-export-section" className="mt-8 pt-8 border-t border-stone-200/80 font-sans">
                  <div className="bg-gradient-to-br from-stone-50 to-stone-100/50 rounded-2xl border border-stone-200 p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-4 mb-5">
                      <div className="space-y-1">
                        <h4 className="text-sm font-black text-stone-900 flex items-center gap-2">
                          <Download className="w-4 h-4 text-[#c29b40]" />
                          <span>
                            {lang === 'ar'
                              ? 'مركز تصدير البيانات والنسخ الاحتياطي الشامل'
                              : 'Master Data Export & Backup Center'}
                          </span>
                        </h4>
                        <p className="text-[11px] text-stone-500 font-medium">
                          {lang === 'ar'
                            ? 'قم بتنزيل كافة معلوماتك، ومشاريعك، وسجلات الأوامر المحفوظة وتأمينها كملف احتياطي على جهازك.'
                            : 'Compile and download your entire workspace configuration, saved setups, and prompt histories locally.'}
                        </p>
                      </div>
                      <span className="text-[9px] font-black bg-[#c29b40]/10 text-[#8f6e24] px-2.5 py-1 rounded-full uppercase tracking-wider self-start md:self-auto">
                        {lang === 'ar' ? 'التزام الخصوصية التامة 🔒' : '100% Client-Side Privacy 🔒'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                      {/* Section 1: Choose Datasets */}
                      <div className="space-y-3">
                        <h5 className="text-[10px] font-extrabold text-stone-700 tracking-wider uppercase block">
                          {lang === 'ar' ? '١. حدد فئات البيانات:' : '1. SELECT DATA SOURCES:'}
                        </h5>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2.5 p-3 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={exportIncludeProjects}
                              onChange={(e) => setExportIncludeProjects(e.target.checked)}
                              className="w-4 h-4 text-[#c29b40] rounded border-stone-300 focus:ring-[#c29b40] accent-[#c29b40]"
                            />
                            <div>
                              <p className="text-xs font-bold text-stone-900 leading-tight">
                                {lang === 'ar' ? 'المشاريع وصياغات المحرر' : 'Workspace Projects'}
                              </p>
                              <p className="text-[10px] text-stone-400 font-mono mt-0.5">
                                {savedProjects.length} {savedProjects.length === 1 ? 'Project' : 'Projects'} Saved
                              </p>
                            </div>
                          </label>

                          <label className="flex items-center gap-2.5 p-3 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={exportIncludeHistory}
                              onChange={(e) => setExportIncludeHistory(e.target.checked)}
                              className="w-4 h-4 text-[#c29b40] rounded border-stone-300 focus:ring-[#c29b40] accent-[#c29b40]"
                            />
                            <div>
                              <p className="text-xs font-bold text-stone-900 leading-tight">
                                {lang === 'ar' ? 'أرشيف التحسين والسجلات' : 'Prompt Engineering Logs'}
                              </p>
                              <p className="text-[10px] text-stone-400 font-mono mt-0.5">
                                {history.length} {history.length === 1 ? 'Item' : 'Items'} Recorded
                              </p>
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* Section 2: Choose File Format */}
                      <div className="space-y-3">
                        <h5 className="text-[10px] font-extrabold text-stone-700 tracking-wider uppercase block font-sans">
                          {lang === 'ar' ? '٢. حدد تنسيق وصيغة التصدير:' : '2. CHOOSE EXPORT FORMAT:'}
                        </h5>
                        <div className="grid grid-cols-1 gap-2">
                          {[
                            { id: 'json', title: 'JSON Archive', descAr: 'نسخة احتياطية كاملة مدمجة (.json)', descEn: 'Fully structured backup archive (.json)' },
                            { id: 'csv', title: 'CSV Spreadsheets', descAr: 'جداول تحليلات إكسيل منفصلة (.csv)', descEn: 'Flat spreadsheet dashboards (.csv)' },
                            { id: 'markdown', title: 'Markdown Dossier', descAr: 'مستند مراجعة مهني منسق (.md)', descEn: 'Elegant human-readable technical report (.md)' },
                          ].map(fmt => (
                            <button
                              key={fmt.id}
                              type="button"
                              onClick={() => setExportFormat(fmt.id as any)}
                              className={`flex flex-col items-start p-3 border rounded-xl text-left transition cursor-pointer font-sans w-full ${
                                exportFormat === fmt.id
                                  ? 'bg-amber-50/20 border-[#c29b40] text-[#c29b40] shadow-sm'
                                  : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                              }`}
                              dir={lang === 'ar' ? 'rtl' : 'ltr'}
                            >
                              <span className="text-xs font-extrabold block">
                                {fmt.title} {exportFormat === fmt.id && '✓'}
                              </span>
                              <span className="text-[10px] text-stone-400 font-medium leading-normal mt-0.5">
                                {lang === 'ar' ? fmt.descAr : fmt.descEn}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Section 3: Summary & Trigger Action */}
                      <div className="space-y-3 bg-stone-200/40 border border-stone-200 p-4 rounded-xl flex flex-col justify-between h-full">
                        <div>
                          <h5 className="text-[10px] font-extrabold text-stone-700 tracking-wider uppercase block font-sans mb-2">
                            {lang === 'ar' ? 'ملخص الحزمة وصناعتها:' : 'COMPILED PACKAGE SUMMARY:'}
                          </h5>
                          <ul className="space-y-1.5 text-[11px] text-stone-600 font-medium font-sans">
                            <li className="flex justify-between">
                              <span>{lang === 'ar' ? 'المشاريع המرفقة:' : 'Projects Included:'}</span>
                              <span className="font-mono font-bold text-stone-800">
                                {exportIncludeProjects ? (savedProjects.length > 0 ? (lang === 'ar' ? `${savedProjects.length} عنصر` : `${savedProjects.length} items`) : (lang === 'ar' ? 'فارغ' : 'none')) : (lang === 'ar' ? 'مستبعد' : 'excluded')}
                              </span>
                            </li>
                            <li className="flex justify-between">
                              <span>{lang === 'ar' ? 'سجلات السير المرفقة:' : 'Histories Included:'}</span>
                              <span className="font-mono font-bold text-stone-800">
                                {exportIncludeHistory ? (history.length > 0 ? (lang === 'ar' ? `${history.length} عنصر` : `${history.length} items`) : (lang === 'ar' ? 'فارغ' : 'none')) : (lang === 'ar' ? 'مستبعد' : 'excluded')}
                              </span>
                            </li>
                            <li className="flex justify-between border-t border-stone-250/60 pt-1.5 mt-1.5">
                              <span>{lang === 'ar' ? 'التنسيق المستهدف:' : 'Backup Target Format:'}</span>
                              <span className="uppercase font-mono font-black text-[#c29b40]">
                                .{exportFormat}
                              </span>
                            </li>
                          </ul>
                        </div>

                        <div className="pt-4">
                          <button
                            type="button"
                            onClick={handleMasterExport}
                            disabled={isExporting || (!exportIncludeProjects && !exportIncludeHistory)}
                            className={`w-full py-3 rounded-xl font-black text-xs transition duration-205 flex items-center justify-center gap-1.5 text-white cursor-pointer shadow-md shadow-[#c29b40]/15 ${
                              isExporting || (!exportIncludeProjects && !exportIncludeHistory)
                                ? 'bg-stone-300 text-stone-500 shadow-none cursor-not-allowed'
                                : 'bg-[#c29b40] hover:bg-[#b08735]'
                            }`}
                          >
                            <Download className="w-4 h-4" />
                            <span>
                              {isExporting 
                                ? (lang === 'ar' ? 'جاري تجهيز الملفات...' : 'Compiling raw data...') 
                                : (lang === 'ar' ? 'تجهيز وتحميل حزمة البيانات الشاملة ⚡' : 'Generate & Download Data Pack ⚡')}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </motion.div>
            )}

          </AnimatePresence>

        </section>

      </div>

    </div>
  );
}
