/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState, useMemo } from 'react';
import Markdown from 'react-markdown';
import {
  PenTool,
  Eye,
  Bold,
  Italic,
  Heading,
  List,
  Code,
  Tag,
  Sparkles,
  Clipboard,
  Check,
  RotateCcw,
  Info
} from 'lucide-react';

interface VariableHighlighterEditorProps {
  value: string;
  onChange: (val: string) => void;
  dir: 'ltr' | 'rtl';
  placeholder?: string;
  lang: 'ar' | 'en';
}

export default function VariableHighlighterEditor({
  value,
  onChange,
  dir,
  placeholder,
  lang,
}: VariableHighlighterEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [isCopiedAll, setIsCopiedAll] = useState(false);
  const [copiedVar, setCopiedVar] = useState<string | null>(null);

  // Translation helpers
  const t = {
    edit: lang === 'ar' ? 'تعديل الصياغة' : 'Edit Prompt',
    preview: lang === 'ar' ? 'معاينة المخرجات' : 'Live Preview',
    bold: lang === 'ar' ? 'بخط عريض' : 'Bold',
    italic: lang === 'ar' ? 'بخط مائل' : 'Italic',
    heading: lang === 'ar' ? 'عنوان' : 'Heading',
    list: lang === 'ar' ? 'قائمة نقطية' : 'Bullet List',
    code: lang === 'ar' ? 'كتلة برمجية' : 'Code Block',
    insertVar: lang === 'ar' ? 'إدراج متغير' : 'Insert Variable',
    copyAll: lang === 'ar' ? 'نسخ البرومبت' : 'Copy Prompt',
    copied: lang === 'ar' ? 'تم النسخ!' : 'Copied!',
    clear: lang === 'ar' ? 'تفراغ' : 'Clear',
    characters: lang === 'ar' ? 'حرف' : 'characters',
    words: lang === 'ar' ? 'كلمة' : 'words',
    emptyPreview: lang === 'ar' ? 'اكتب بعض الأوامر أو النصوص في علامة تبويب "تعديل" لتراها منسقة بشكل تفاعلي هنا.' : 'Type some content in the Edit tab to see it formatted interactively here.',
    placeholderText: placeholder || (lang === 'ar' ? 'اكتب البرومبت هنا واستخدم [المتغيرات] المحاطة بأقواس...' : 'Write prompt here and wrap [variables] in brackets...'),
  };

  // Synchronize scrolling of textarea to backdrop element
  const handleScroll = () => {
    if (textareaRef.current && backdropRef.current) {
      backdropRef.current.scrollTop = textareaRef.current.scrollTop;
      backdropRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const renderHighlighted = (text: string) => {
    if (!text) {
      return (
        <span className="text-stone-300 italic">
          {t.placeholderText}
        </span>
      );
    }

    // Split text by variables enclosing brackets matching [var_name]
    const segments = text.split(/(\[[^[\]\r\n]+\])/g);

    return segments.map((seg, i) => {
      if (seg.startsWith('[') && seg.endsWith(']')) {
        return (
          <mark
            key={i}
            className="inline-block px-1.5 py-0.5 mx-0.5 rounded bg-amber-500/15 text-amber-800 border border-amber-500/30 font-bold select-all font-mono text-[11px]"
            style={{ textShadow: 'none' }}
          >
            {seg}
          </mark>
        );
      }
      return <span key={i}>{seg}</span>;
    });
  };

  // Insert formatting template at cursor position
  const insertAtCursor = (beforeText: string, afterText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;
    
    const selectedText = currentText.substring(start, end);
    const replacement = beforeText + selectedText + afterText;
    
    const newValue = currentText.substring(0, start) + replacement + currentText.substring(end);
    onChange(newValue);

    // Set focus back and select inserted content
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + beforeText.length + selectedText.length + afterText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);
  };

  const handleCopyAll = () => {
    if (!value) return;
    try {
      navigator.clipboard.writeText(value);
      setIsCopiedAll(true);
      setTimeout(() => setIsCopiedAll(false), 2000);
    } catch (err) {
      console.error('Failed to copy prompt:', err);
    }
  };

  const charCount = value ? value.length : 0;
  const wordCount = value ? value.trim().split(/\s+/).filter(Boolean).length : 0;

  // Process text to turn [var_name] into beautiful clickable badges
  const renderMarkdownText = (text: string) => {
    if (typeof text !== 'string') return text;
    const segments = text.split(/(\[[^[\]\r\n]+\])/g);
    return segments.map((seg, i) => {
      if (seg.startsWith('[') && seg.endsWith(']')) {
        const isJustCopied = copiedVar === seg;
        return (
          <button
            key={i}
            type="button"
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border font-bold text-[11px] font-mono cursor-pointer transition-all duration-150 active:scale-95 mx-0.5 ${
              isJustCopied
                ? 'bg-emerald-500/15 text-emerald-700 border-emerald-500/35 shadow-3xs'
                : 'bg-amber-600/10 text-stone-900 border-[#c29b40]/30 hover:bg-[#c29b40]/15'
            }`}
            title={lang === 'ar' ? `اضغط لنسخ المتغير: ${seg}` : `Click to copy variable: ${seg}`}
            onClick={(e) => {
              e.stopPropagation();
              try {
                navigator.clipboard.writeText(seg);
                setCopiedVar(seg);
                setTimeout(() => setCopiedVar(null), 1500);
              } catch (err) {
                console.error('Failed to copy variable:', err);
              }
            }}
          >
            {isJustCopied ? (
              <Check className="w-3 h-3 text-emerald-600 animate-bounce" />
            ) : (
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
            )}
            <span>{seg}</span>
          </button>
        );
      }
      return seg;
    });
  };

  // HTML renderer components for react-markdown matching our visual typography design
  const customComponents = useMemo(() => {
    const processChildren = (children: React.ReactNode): React.ReactNode => {
      return React.Children.map(children, (child) => {
        if (typeof child === 'string') {
          return renderMarkdownText(child);
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
      p: ({ children }: any) => <p className="mb-3.5 text-stone-750 leading-relaxed text-xs sm:text-sm">{processChildren(children)}</p>,
      li: ({ children }: any) => <li className="text-stone-700 text-xs sm:text-sm leading-relaxed mb-1.5 list-disc ml-5 rtl:ml-0 rtl:mr-5">{processChildren(children)}</li>,
      ul: ({ children }: any) => <ul className="mb-4 space-y-1 block list-disc pl-5 rtl:pl-0 rtl:pr-5">{children}</ul>,
      ol: ({ children }: any) => <ol className="mb-4 space-y-1 block list-decimal pl-5 rtl:pl-0 rtl:pr-5">{children}</ol>,
      h1: ({ children }: any) => <h1 className="text-lg sm:text-xl font-black text-stone-900 mt-6 mb-3 tracking-tight border-b border-stone-200/60 pb-1.5">{processChildren(children)}</h1>,
      h2: ({ children }: any) => <h2 className="text-md sm:text-lg font-bold text-stone-900 mt-5 mb-2.5 tracking-tight">{processChildren(children)}</h2>,
      h3: ({ children }: any) => <h3 className="text-sm sm:text-md font-bold text-stone-850 mt-4 mb-2">{processChildren(children)}</h3>,
      strong: ({ children }: any) => <strong className="font-extrabold text-stone-900">{processChildren(children)}</strong>,
      em: ({ children }: any) => <em className="italic text-stone-750">{processChildren(children)}</em>,
      code: ({ inline, className, children, ...props }: any) => {
        return !inline ? (
          <pre className="bg-stone-900 border border-stone-800 p-4 rounded-xl font-mono text-[10px] sm:text-[11px] text-stone-200 overflow-x-auto leading-relaxed my-3.5 block max-w-full shadow-inner">
            <code className={className} {...props}>
              {children}
            </code>
          </pre>
        ) : (
          <code className="bg-stone-100 px-1.5 py-0.5 rounded font-mono text-[10px] sm:text-[11px] text-[#9c7524] border border-stone-200/50" {...props}>
            {children}
          </code>
        );
      }
    };
  }, [copiedVar, lang]);

  useEffect(() => {
    handleScroll();
  }, [value]);

  return (
    <div className="relative border border-stone-250 rounded-2xl bg-white focus-within:ring-2 focus-within:ring-[#c29b40]/25 focus-within:border-[#c29b40] overflow-hidden flex flex-col group min-h-[380px] shadow-sm">
      
      {/* 1. Header Control Desk bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-stone-50 border-b border-stone-200/70 select-none">
        
        {/* Left Side: Dual View Tabs */}
        <div className="flex items-center gap-1 bg-stone-150 p-1 rounded-xl border border-stone-200/40">
          <button
            type="button"
            onClick={() => setViewMode('edit')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-black transition cursor-pointer ${
              viewMode === 'edit'
                ? 'bg-amber-600 text-stone-950 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>{t.edit}</span>
          </button>
          
          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-black transition cursor-pointer ${
              viewMode === 'preview'
                ? 'bg-amber-600 text-stone-950 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{t.preview}</span>
          </button>
        </div>

        {/* Right Side: Document Stats + Clipboard actions */}
        <div className="flex items-center gap-2.5">
          {/* Realtime stats tracker */}
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold text-stone-400 font-mono">
            <span>{charCount} {t.characters}</span>
            <span className="text-stone-200">•</span>
            <span>{wordCount} {t.words}</span>
          </div>

          <div className="h-4 w-px bg-stone-200 hidden sm:block mx-1" />

          {/* Prompt quick copier */}
          <button
            type="button"
            onClick={handleCopyAll}
            disabled={!value}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border font-bold text-xs transition cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed ${
              isCopiedAll
                ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30'
                : 'bg-white hover:bg-stone-50 text-stone-600 border-stone-200 shadow-2xs'
            }`}
            title={t.copyAll}
          >
            {isCopiedAll ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.copied}</span>
              </>
            ) : (
              <>
                <Clipboard className="w-3.5 h-3.5" />
                <span>{t.copyAll}</span>
              </>
            )}
          </button>

          {/* Quick Clear drafts */}
          <button
            type="button"
            onClick={() => onChange('')}
            disabled={!value}
            className="p-1.5 hover:bg-rose-50 text-stone-400 hover:text-rose-600 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer border border-transparent hover:border-rose-100"
            title={t.clear}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* 2. Formatting Markdown Toolbar (Only visible in editing mode) */}
      {viewMode === 'edit' && (
        <div className="flex flex-wrap items-center gap-1 px-3 py-2 bg-stone-50/50 border-b border-stone-200/40 select-none">
          
          <button
            type="button"
            onClick={() => insertAtCursor('**', '**')}
            className="p-1.5 hover:bg-stone-150 rounded-lg text-stone-600 hover:text-stone-900 transition cursor-pointer"
            title={t.bold}
          >
            <Bold className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => insertAtCursor('*', '*')}
            className="p-1.5 hover:bg-stone-150 rounded-lg text-stone-600 hover:text-stone-900 transition cursor-pointer"
            title={t.italic}
          >
            <Italic className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => insertAtCursor('\n### ', '')}
            className="p-1.5 hover:bg-stone-150 rounded-lg text-stone-600 hover:text-stone-900 transition cursor-pointer"
            title={t.heading}
          >
            <Heading className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => insertAtCursor('\n- ', '')}
            className="p-1.5 hover:bg-stone-150 rounded-lg text-stone-600 hover:text-stone-900 transition cursor-pointer"
            title={t.list}
          >
            <List className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => insertAtCursor('\n```\n', '\n```\n')}
            className="p-1.5 hover:bg-stone-150 rounded-lg text-stone-600 hover:text-stone-900 transition cursor-pointer"
            title={t.code}
          >
            <Code className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-4 bg-stone-200 mx-1.5" />

          {/* Quick variable tag injector */}
          <button
            type="button"
            onClick={() => insertAtCursor('[', ']')}
            className="flex items-center gap-1.5 px-3 py-1 hover:bg-[#c29b40]/10 border border-[#c29b40]/25 rounded-lg text-[#9c7524] hover:text-[#7f5d1b] font-black text-[10px] sm:text-[11px] transition cursor-pointer shadow-3xs"
            title={t.insertVar}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>{t.insertVar}</span>
          </button>

          <span className="text-[10px] text-stone-400 font-bold ml-auto font-sans flex items-center gap-1 rtl:mr-auto rtl:ml-0">
            <Info className="w-3 h-3 text-stone-300" />
            <span>{lang === 'ar' ? 'استخدم [لكتابة المتغيرات]' : 'Use [brackets] for user variables'}</span>
          </span>

        </div>
      )}

      {/* 3. Editor Workspace */}
      <div className="flex-1 min-h-[350px] relative flex flex-col bg-[#fdfdfc]">
        {viewMode === 'edit' ? (
          <>
            {/* Real-time Backdrop highlighters */}
            <div
              ref={backdropRef}
              className="absolute inset-0 p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap break-words overflow-y-auto select-none pointer-events-none text-stone-700/90"
              style={{
                boxSizing: 'border-box',
                fontFamily: 'JetBrains Mono, SFMono-Regular, Consolas, monospace',
                letterSpacing: 'normal',
                wordSpacing: 'normal',
              }}
              dir={dir}
            >
              {renderHighlighted(value)}
              <span className="invisible block h-4">{"\n"}</span>
            </div>

            {/* Editing Translucent text area overlay */}
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onScroll={handleScroll}
              placeholder={t.placeholderText}
              className="absolute inset-0 w-full h-full p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap break-words bg-transparent text-transparent caret-stone-855 border-none outline-none resize-none overflow-y-auto focus:ring-0 select-text"
              style={{
                boxSizing: 'border-box',
                fontFamily: 'JetBrains Mono, SFMono-Regular, Consolas, monospace',
                letterSpacing: 'normal',
                wordSpacing: 'normal',
              }}
              dir={dir}
            />
          </>
        ) : (
          /* Live Markdown Preview */
          <div 
            className="absolute inset-0 p-5 sm:p-7 overflow-y-auto bg-stone-50/45 select-text"
            dir={dir}
          >
            {value ? (
              <div className="markdown-body max-w-none text-right rtl:text-right">
                <Markdown components={customComponents}>
                  {value}
                </Markdown>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center space-y-3">
                <Sparkles className="w-9 h-9 text-[#c29b40] animate-pulse opacity-50" />
                <p className="text-xs text-stone-400 font-bold max-w-md leading-relaxed">
                  {t.emptyPreview}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
