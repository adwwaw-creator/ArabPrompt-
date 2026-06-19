/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Cpu, Send, RefreshCw, AlertCircle, Sparkles, AlertTriangle, Eye, ArrowUpRight, Check, Globe, Download } from 'lucide-react';
import { VoiceInputButton } from './VoiceInputButton';
import Markdown from 'react-markdown';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';

// Load Prism languages safely
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';

interface PromptTesterProps {
  lang: 'ar' | 'en';
  passedPrompt: string;
  onLogPrompt?: (item: any) => void;
}

export default function PromptTester({ lang, passedPrompt, onLogPrompt }: PromptTesterProps) {
  const [promptText, setPromptText] = useState(passedPrompt);
  const [testingInput, setTestingInput] = useState('');
  const [executing, setExecuting] = useState(false);
  const [testResult, setTestResult] = useState('');
  const [errorStatus, setErrorStatus] = useState('');
  const [saveNotification, setSaveNotification] = useState<string>('');
  const [enableSearch, setEnableSearch] = useState(false);
  const [searchMetadata, setSearchMetadata] = useState<any | null>(null);
  const [workspaceMode, setWorkspaceMode] = useState<'edit' | 'preview'>('edit');

  // HTML renderer components for react-markdown matching our visual typography design
  const customComponents = React.useMemo(() => {
    const processChildren = (children: React.ReactNode): React.ReactNode => {
      return React.Children.map(children, (child) => {
        if (typeof child === 'string') {
          // Highlight [bracketed text]
          const segments = child.split(/(\[[^[\]\r\n]+\])/g);
          return segments.map((seg, i) => {
            if (seg.startsWith('[') && seg.endsWith(']')) {
              return (
                <mark
                  key={i}
                  className="inline-block px-1.5 py-0.5 mx-0.5 rounded bg-amber-500/15 text-[#916a24] border border-amber-500/30 font-bold font-mono text-[11px]"
                  style={{ textShadow: 'none' }}
                >
                  {seg}
                </mark>
              );
            }
            return <span key={i}>{seg}</span>;
          });
        }
        if (React.isValidElement(child)) {
          const props = child.props as any;
          if (props && props.children) {
            return React.cloneElement(child, {
              ...props,
              children: processChildren(props.children)
            } as any);
          }
        }
        return child;
      });
    };

    return {
      p: ({ children }: any) => <p className="mb-3.5 leading-relaxed text-xs sm:text-sm text-stone-750 text-right rtl:text-right font-sans">{processChildren(children)}</p>,
      li: ({ children }: any) => <li className="text-stone-700 text-xs sm:text-sm leading-relaxed mb-1.5 list-disc ml-5 rtl:ml-0 rtl:mr-5 text-right rtl:text-right font-sans">{processChildren(children)}</li>,
      ul: ({ children }: any) => <ul className="mb-4 space-y-1 block list-disc pl-5 rtl:pl-0 rtl:pr-5 text-right rtl:text-right">{children}</ul>,
      ol: ({ children }: any) => <ol className="mb-4 space-y-1 block list-decimal pl-5 rtl:pl-0 rtl:pr-5 text-right rtl:text-right">{children}</ol>,
      h1: ({ children }: any) => <h1 className="text-base font-black text-stone-900 mt-5 mb-2.5 tracking-tight border-b border-stone-200/60 pb-1.5 text-right rtl:text-right font-sans">{processChildren(children)}</h1>,
      h2: ({ children }: any) => <h2 className="text-sm font-bold text-stone-900 mt-4.5 mb-2 tracking-tight text-right rtl:text-right font-sans">{processChildren(children)}</h2>,
      h3: ({ children }: any) => <h3 className="text-xs font-bold text-stone-850 mt-4 mb-1.5 text-right rtl:text-right font-sans">{processChildren(children)}</h3>,
      strong: ({ children }: any) => <strong className="font-extrabold text-stone-900">{processChildren(children)}</strong>,
      em: ({ children }: any) => <em className="italic text-stone-750">{processChildren(children)}</em>,
      code: ({ inline, className, children, ...props }: any) => {
        const match = /language-(\w+)/.exec(className || '');
        const language = match ? match[1] : '';
        const codeText = String(children).replace(/\n$/, '');

        if (!inline) {
          let html = '';
          try {
            const grammar = Prism.languages[language] || Prism.languages.clike || Prism.languages.markup;
            html = Prism.highlight(codeText, grammar, language || 'clike');
          } catch (e) {
            html = codeText.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
          }

          // Highlight bracketed variable placeholders within the highlighted code blocks too!
          html = html.replace(/\[([^\]]+)\]/g, (match, p1) => {
            return `<mark class="bg-amber-500/20 text-amber-300 border border-amber-500/35 px-1 py-0.5 mx-0.5 rounded font-black font-mono select-all shadow-3xs" style="text-shadow: none;">[${p1}]</mark>`;
          });

          return (
            <pre className="bg-stone-950 text-stone-200 border border-stone-800 p-4 rounded-xl font-mono text-[10px] sm:text-[11px] overflow-x-auto leading-relaxed my-3 block max-w-full shadow-inner relative group/code unique-prism-code" dir="ltr">
              <code
                className={`language-${language || 'text'}`}
                dangerouslySetInnerHTML={{ __html: html }}
                {...props}
              />
            </pre>
          );
        }

        const isBracket = codeText.startsWith('[') && codeText.endsWith(']');
        if (isBracket) {
          return (
            <mark
              className="bg-amber-500/15 text-amber-800 border border-amber-500/30 px-1.5 py-0.5 rounded font-black font-mono text-[10px] sm:text-[11px]"
              style={{ textShadow: 'none' }}
              {...props}
            >
              {codeText}
            </mark>
          );
        }

        return (
          <code className="bg-stone-100 px-1.5 py-0.5 rounded font-mono text-[10px] sm:text-[11px] text-[#9c7524] border border-stone-200/50" {...props}>
            {children}
          </code>
        );
      }
    };
  }, [lang]);

  // Sync when a prompt is loaded/passed
  useEffect(() => {
    if (passedPrompt) {
      setPromptText(passedPrompt);
    }
  }, [passedPrompt]);

  const handleManualSave = () => {
    if (!promptText.trim()) return;
    if (onLogPrompt) {
      onLogPrompt({
        originalText: lang === 'ar' ? 'مسودة من مساحة التجربة واللعب' : 'Sandbox custom test prompt',
        optimizedText: promptText,
        model: 'gemini',
        tone: 'sandbox',
        category: 'testing',
        actionType: 'generate',
        isFallback: false
      });
      const successMsg = lang === 'ar' ? '✓ تم الحفظ بنجاح!' : '✓ Safe in history!';
      setSaveNotification(successMsg);
      setTimeout(() => setSaveNotification(''), 3000);
    }
  };

  const handleDownloadMarkdown = () => {
    if (!promptText.trim()) return;
    
    const title = lang === 'ar' ? 'مسودة الأمر البرمجي المطور' : 'Engineered Prompt Draft';
    let markdownContent = `# ${title}\n\n`;
    
    markdownContent += `## ${lang === 'ar' ? 'نص الأمر البرمجي (Prompt Body)' : 'Prompt Body'}\n\n`;
    markdownContent += `\`\`\`plain\n${promptText}\n\`\`\`\n\n`;
    
    if (testingInput.trim()) {
      markdownContent += `## ${lang === 'ar' ? 'المدخل الاختياري المستخدم (Variables/Context)' : 'Optional Run Input Context'}\n\n`;
      markdownContent += `\`\`\`plain\n${testingInput}\n\`\`\`\n\n`;
    }
    
    if (testResult.trim()) {
      markdownContent += `## ${lang === 'ar' ? 'مخرجات استجابة الذكاء الاصطناعي (Gemini Response)' : 'Gemini Execution Output'}\n\n`;
      markdownContent += `${testResult}\n\n`;
    }
    
    markdownContent += `\n---\n*${lang === 'ar' ? 'تم تصدير هذا الملف من مختبر هندسة الأوامر الذكي.' : 'Exported from the AI Prompt Architect Sandbox / Tester.'}*\n`;

    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const dateStr = new Date().toISOString().substring(0, 10);
    const filename = lang === 'ar' 
      ? `أمر-مطور-${dateStr}.md` 
      : `engineered-prompt-${dateStr}.md`;
       
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (promptText.trim() && !executing) {
          e.preventDefault();
          handleTestRun();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        if (promptText.trim()) {
          e.preventDefault();
          handleManualSave();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [promptText, testingInput, executing, lang]);

  const handleTestRun = async () => {
    if (!promptText.trim()) return;

    setExecuting(true);
    setErrorStatus('');
    setTestResult('');
    setSearchMetadata(null);

    try {
      const response = await fetch('/api/test-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptText: promptText,
          enableSearch: enableSearch,
          placeholderValues: {
            'المدخل': testingInput,
            'نص': testingInput,
            'سياق': testingInput,
            'input': testingInput,
            'text': testingInput,
          }
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'فشلت تجربة الأمر. يرجى مراجعة حالة مفتاح الـ API.');
      }

      setTestResult(data.response);
      if (data.groundingMetadata) {
        setSearchMetadata(data.groundingMetadata);
      }
    } catch (err: any) {
      setErrorStatus(err.message || 'فشل الاتصال بالخادم لتجربة الأمر.');
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div id="prompt-tester-panel" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Context info banner */}
      <div className="bg-amber-50/70 border border-amber-200/80 text-amber-900 rounded-xl p-4 text-xs font-semibold mb-8 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-[#c29b40] shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-stone-900 mb-0.5">
            {lang === 'ar' ? 'مرحباً بك في ساحة اللعب ومختبر الأوامر!' : 'Active Prompt Sandbox Simulation'}
          </h4>
          <p className="text-stone-600 font-medium">
            {lang === 'ar'
              ? 'صممنا هذا القسم ليمكّنك من اختبار فاعلية البرومبت الخاص بك فوراً على نموذج Gemini. الصق أي أمر هنا، حدد بعض المتغيرات الإضافية واختبر كفاءة الإجابة!'
              : 'Execute and test your prompts on backend servers using Gemini instantly. Check formatting outputs, verify instructions, and adapt in real-time.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Prompt Input & Configuration area (6 / 12 width) */}
        <section className="lg:col-span-12 xl:col-span-6 bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-4 mb-4 border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#c29b40]" />
                <h3 className="text-sm font-bold text-stone-700">
                  {lang === 'ar' ? '1. ملمس البرومبت النشط قيد التجربة' : '1. Prompt Workspace'}
                </h3>
              </div>
              {promptText.trim() && (
                <button
                  type="button"
                  onClick={handleDownloadMarkdown}
                  className="text-[10px] font-bold text-[#c29b40] hover:text-white bg-amber-50 hover:bg-[#c29b40] border border-[#c29b40]/30 hover:border-[#c29b40] px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  title={lang === 'ar' ? 'تحميل كملف ماركداون (.md)' : 'Download engineered prompt as Markdown (.md)'}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'تحميل كـ Markdown' : 'Download as Markdown'}</span>
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2.5 flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 font-sans">
                    <label htmlFor="tester-prompt-editor" className="block text-xs font-bold text-[#c29b40]">
                      {lang === 'ar' ? 'نص الأمر الكامل (Prompt)' : 'Full Engineered Prompt Draft'}
                    </label>
                    <VoiceInputButton
                      lang={lang}
                      onTranscript={(transcript) => {
                        setPromptText((prev) => {
                          const trimmed = prev.trim();
                          return trimmed ? `${trimmed} ${transcript}` : transcript;
                        });
                      }}
                    />
                  </div>
                  
                  <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg text-[10px] shadow-3xs font-sans select-none">
                    <button
                      type="button"
                      onClick={() => setWorkspaceMode('edit')}
                      className={`px-2.5 py-1 rounded-md transition-all font-bold cursor-pointer ${
                        workspaceMode === 'edit'
                          ? 'bg-white shadow-3xs text-[#c29b40]'
                          : 'text-stone-500 hover:text-stone-850'
                      }`}
                    >
                      {lang === 'ar' ? 'تعديل ✏️' : 'Edit ✏️'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setWorkspaceMode('preview')}
                      className={`px-2.5 py-1 rounded-md transition-all font-bold cursor-pointer ${
                        workspaceMode === 'preview'
                          ? 'bg-white shadow-3xs text-[#c29b40]'
                          : 'text-stone-500 hover:text-stone-850'
                      }`}
                    >
                      {lang === 'ar' ? 'معاينة ملونة 👁️' : 'Highlight Preview 👁️'}
                    </button>
                  </div>
                </div>

                {workspaceMode === 'edit' ? (
                  <textarea
                    id="tester-prompt-editor"
                    rows={10}
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    placeholder={
                      lang === 'ar'
                        ? 'الصق كود البرومبت الذي قمت بتوليده أو اكتب أمراً مخصصاً لتطوير واختباره...'
                        : 'Paste any prompt here to run live tests...'
                    }
                    className="w-full text-xs rounded-xl border border-stone-300 p-4 font-mono leading-relaxed bg-[#fafafa] text-stone-950 focus:outline-none focus:ring-1 focus:ring-[#c29b40] focus:bg-white transition-all text-right rtl:text-right font-sans"
                    dir="auto"
                  />
                ) : (
                  <div 
                    className="w-full text-xs rounded-xl border border-stone-250 p-4 leading-relaxed bg-stone-50/70 text-stone-950 overflow-y-auto min-h-[210px] max-h-[350px] select-text relative text-right rtl:text-right"
                    dir="auto"
                  >
                    <div className="markdown-body text-right rtl:text-right font-sans">
                      <Markdown components={customComponents}>
                        {promptText || (lang === 'ar' ? '*لا يوجد برومبت نشط لعرضه*' : '*No active prompt content to display*')}
                      </Markdown>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="tester-optional-input" className="block text-xs font-bold text-stone-600 flex items-center gap-1.5">
                    <span>{lang === 'ar' ? 'نص إضافي أو سياق للمتغير (اختياري)' : 'Optional placeholder context value'}</span>
                    <span className="text-[10px] font-mono text-stone-400">([المدخل] / [input])</span>
                  </label>
                  <VoiceInputButton
                    lang={lang}
                    onTranscript={(transcript) => {
                      setTestingInput((prev) => {
                        const trimmed = prev.trim();
                        return trimmed ? `${trimmed} ${transcript}` : transcript;
                      });
                    }}
                  />
                </div>
                <textarea
                  id="tester-optional-input"
                  rows={3}
                  value={testingInput}
                  onChange={(e) => setTestingInput(e.target.value)}
                  placeholder={
                    lang === 'ar'
                      ? 'مثال: نص المقال لحوسبته وتلخيصه، أو كود برمجي بحاجة لتوثيق، إلخ.'
                      : 'Paste custom variable inputs, text context blocks...'
                  }
                  className="w-full text-xs rounded-xl border border-stone-300 p-3 bg-white text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#c29b40] font-sans"
                />
              </div>

              {/* Google Search Grounding Section */}
              <div id="google-grounding-section-tester" className="pt-2">
                <label
                  className={`flex items-start gap-3 px-4 py-3 rounded-xl border transition-all cursor-pointer select-none text-xs font-bold ${
                    enableSearch
                      ? 'bg-amber-500/5 border-amber-500/30 text-[#916a24]'
                      : 'bg-white border-stone-200 hover:border-stone-300 text-stone-600 hover:text-stone-800'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={enableSearch}
                    onChange={(e) => setEnableSearch(e.target.checked)}
                    className="rounded text-[#c29b40] focus:ring-[#c29b40] h-4.5 w-4.5 border-stone-300 focus:ring-opacity-50 mt-1 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 font-sans font-bold">
                      <Globe className={`w-4 h-4 ${enableSearch ? 'text-amber-500 animate-pulse' : 'text-stone-400'}`} />
                      <span>{lang === 'ar' ? 'التثبيت في بحث جوجل (Search Grounding)' : 'Ground in Google Search'}</span>
                    </div>
                    <span className="block text-[10px] text-stone-400 font-medium mt-1 leading-relaxed text-right rtl:text-right">
                      {lang === 'ar'
                        ? 'تثبيت وتحقق إضافي من البيانات في صفحات الإنترنت الفعلية وتغذية الإجابة بمصادر حية ومصححة.'
                        : 'Query real-time google searches to anchor replies with citations and up-to-date web pages.'}
                    </span>
                  </div>
                </label>
              </div>

            </div>
          </div>

          <button
            id="playground-run-btn"
            onClick={handleTestRun}
            disabled={executing || !promptText.trim()}
            className={`w-full py-3.5 mt-6 rounded-xl text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
              executing || !promptText.trim()
                ? 'bg-stone-300 cursor-not-allowed shadow-none'
                : 'bg-amber-700 hover:bg-amber-800 shadow-amber-800/10'
            }`}
          >
            {executing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{lang === 'ar' ? 'جاري تجميع واستفسار النموذج اللغوي...' : 'Querying AI model logic...'}</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>{lang === 'ar' ? 'تشغيل وتجربة الأمر البرمجي (Ctrl+Enter)' : 'Run Live Test Playground (Ctrl+Enter)'}</span>
              </>
            )}
          </button>
        </section>

        {/* Live Test Results Workspace area (6 / 12 width) */}
        <section className="lg:col-span-12 xl:col-span-6 bg-stone-50 rounded-2xl border border-stone-200 p-6 sm:p-8 flex flex-col justify-between min-h-[400px]">
          
          <div className="flex items-center justify-between mb-4 border-b border-stone-200/60 pb-3">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#c29b40]" />
              <span className="text-xs font-bold text-stone-600">
                {lang === 'ar' ? '2. مخرجات نموذج الذكاء الاصطناعي (Gemini)' : '2. Model Test Outputs'}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {promptText.trim() && (
                <button
                  type="button"
                  onClick={handleDownloadMarkdown}
                  className="text-[10px] font-bold text-[#c29b40] hover:text-[#916a24] bg-white border border-stone-250 hover:bg-stone-50 px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm font-sans"
                  title={lang === 'ar' ? 'تحميل كملف ماركداون (.md)' : 'Download as Markdown file (.md)'}
                >
                  <Download className="w-3 h-3" />
                  <span>{lang === 'ar' ? 'تحميل كـ Markdown' : 'Download as Markdown'}</span>
                </button>
              )}
              {saveNotification ? (
                <span className="text-[10px] font-black text-emerald-800 px-2.5 py-0.5 bg-emerald-100 rounded-full border border-emerald-300 animate-pulse">
                  {saveNotification}
                </span>
              ) : promptText.trim() ? (
                <button
                  onClick={handleManualSave}
                  className="text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1 rounded-lg transition-all flex items-center gap-1 shadow-sm shrink-0 cursor-pointer"
                  title={lang === 'ar' ? 'حفظ للتاريخ (Ctrl+S)' : 'Save workspace prompt to History (Ctrl+S)'}
                >
                  <Check className="w-3 h-3" />
                  <span>{lang === 'ar' ? 'حفظ (Ctrl+S)' : 'Save (Ctrl+S)'}</span>
                </button>
              ) : null}
            </div>
          </div>

          {/* Loading status */}
          {executing && (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <div className="relative mb-4">
                <div className="w-12 h-12 rounded-full border-4 border-[#c29b40]/20 border-t-[#c29b40] animate-spin" />
                <Cpu className="w-5 h-5 text-[#c29b40] absolute inset-0 m-auto animate-pulse" />
              </div>
              <p className="text-xs font-bold text-stone-700 animate-pulse">
                {lang === 'ar' ? 'جاري قراءة بروتوكول الأمر وتوليد الإجابة الحية...' : 'Assembling headers, applying rules, streaming output...'}
              </p>
              <p className="text-[10px] text-stone-400 mt-1 max-w-xs">
                {lang === 'ar' ? 'يتولى الذكاء الاصطناعي الآن التفكير ومطابقة القيود المدخلة.' : 'Evaluating context parameters on Gemini-3.5-flash.'}
              </p>
            </div>
          )}

          {/* Error outputs */}
          {errorStatus && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 text-xs font-medium flex items-start gap-2.5 my-auto font-sans">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">{lang === 'ar' ? 'فشل الاختبار:' : 'Execution Failed:'}</span> {errorStatus}
                <p className="text-[10px] text-rose-500 mt-1">
                  {lang === 'ar' ? 'يرجى مراجعة إعدادات الـ API والمحاولة مجدداً لربط الكود بـ Google.' : 'Verify process config setup if simulation fails.'}
                </p>
              </div>
            </div>
          )}

          {/* Fallback screen if no run started */}
          {!executing && !testResult && !errorStatus && (
            <div className="flex-1 flex flex-col items-center justify-center text-stone-400 text-center py-12">
              <Cpu className="w-10 h-10 text-stone-300 mb-3" />
              <p className="text-xs font-bold text-stone-600">
                {lang === 'ar' ? 'بانتظار بدء اختبار الأمر' : 'Output Playground Screen'}
              </p>
              <p className="text-[11px] text-stone-400 max-w-xs mt-1">
                {lang === 'ar'
                  ? 'انقر على زر "تشغيل وتجربة الأمر البرمجي" في الطرف المقابل لعرض طريقة استجابة نموذج الذكاء الاصطناعي الفعلي.'
                  : 'Click Run Live Test to pass your engineered prompt directly to the Gemini model and see the structured output.'}
              </p>
            </div>
          )}

          {/* Real responsive result page */}
          {!executing && testResult && (
            <div className="flex-1 flex flex-col justify-start space-y-4">
              <div 
                id="tester-result-scrollbox"
                className="bg-white rounded-xl border border-stone-200 p-4 font-normal text-xs text-stone-900 leading-relaxed overflow-y-auto max-h-[420px] text-right rtl:text-right font-sans"
                dir="auto"
              >
                <div className="markdown-body select-text">
                  <Markdown components={customComponents}>
                    {testResult}
                  </Markdown>
                </div>
              </div>

              {/* Citations panel if grounding results came back */}
              {searchMetadata && (
                <div id="tester-search-citations" className="bg-stone-100/80 border border-stone-200 rounded-xl p-4 space-y-3 font-sans animate-fade-in text-right" dir="rtl">
                  <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
                    <Globe className="w-4 h-4 text-amber-600 animate-pulse" />
                    <span className="text-xs font-bold text-stone-700">
                      {lang === 'ar' ? 'مصادر بحث جوجل المعتمدة (Google Search Anchors)' : 'Google Search Verified Citations'}
                    </span>
                  </div>

                  {searchMetadata.webSearchQueries && searchMetadata.webSearchQueries.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">
                        {lang === 'ar' ? 'استعلامات البحث المنفذة:' : 'Grounding web queries:'}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {searchMetadata.webSearchQueries.map((query: string, i: number) => (
                          <span key={i} className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md text-right">
                            "{query}"
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchMetadata.groundingChunks && searchMetadata.groundingChunks.length > 0 && (
                    <div className="space-y-1.5 dt-2">
                      <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">
                        {lang === 'ar' ? 'الصفحات والمصادر المقتبسة:' : 'Cited web pages:'}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {searchMetadata.groundingChunks.map((chunk: any, i: number) => {
                          const siteName = chunk.web?.title || (lang === 'ar' ? 'مصدر خارجي موثق' : 'Verified Google Citation');
                          const siteUrl = chunk.web?.uri || '#';
                          return (
                            <a
                              key={i}
                              href={siteUrl}
                              target="_blank"
                              rel="noreferrer referrer"
                              className="flex items-center justify-between gap-2 p-2 bg-white border border-stone-250 hover:border-amber-400 rounded-lg text-[10px] text-stone-700 hover:text-[#916a24] font-semibold shadow-sm transition-all text-right cursor-pointer"
                            >
                              <span className="truncate max-w-[190px]">{siteName}</span>
                              <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
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

        </section>

      </div>

    </div>
  );
}
