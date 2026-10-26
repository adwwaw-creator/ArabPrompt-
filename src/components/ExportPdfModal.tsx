/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Printer,
  Download,
  X,
  Check,
  Star,
  FileText,
  Sliders,
  Eye,
  Settings,
  Sparkles,
  Layers,
  Calendar,
  Tag,
  CheckSquare,
  Square,
  BookOpen
} from 'lucide-react';
import { PromptHistoryItem, AppLanguage, ModelType } from '../types';
import { showToast } from './ToastNotification';

interface ExportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: PromptHistoryItem[];
  filteredHistory: PromptHistoryItem[];
  selectedIds: string[];
  lang: AppLanguage;
  initialScope?: 'all' | 'favorites' | 'filtered' | 'selected';
  initialSingleItem?: PromptHistoryItem | null;
}

export default function ExportPdfModal({
  isOpen,
  onClose,
  history,
  filteredHistory,
  selectedIds,
  lang,
  initialScope = 'all',
  initialSingleItem = null
}: ExportPdfModalProps) {
  // If single item passed, default to single item mode
  const [scope, setScope] = useState<'all' | 'favorites' | 'filtered' | 'selected' | 'single'>(() => {
    if (initialSingleItem) return 'single';
    if (initialScope === 'selected' && selectedIds.length > 0) return 'selected';
    if (initialScope === 'favorites') return 'favorites';
    if (initialScope === 'filtered') return 'filtered';
    return 'all';
  });

  const [activeTab, setActiveTab] = useState<'options' | 'preview'>('options');
  const [theme, setTheme] = useState<'gold' | 'minimal' | 'modern'>('gold');

  // Content Inclusions
  const [includeCover, setIncludeCover] = useState<boolean>(true);
  const [includeOriginal, setIncludeOriginal] = useState<boolean>(true);
  const [includeOptimized, setIncludeOptimized] = useState<boolean>(true);
  const [includeTranslated, setIncludeTranslated] = useState<boolean>(true);
  const [includeMetadata, setIncludeMetadata] = useState<boolean>(true);
  const [includeRatings, setIncludeRatings] = useState<boolean>(true);
  const [includeTags, setIncludeTags] = useState<boolean>(true);
  const [pageBreakPerPrompt, setPageBreakPerPrompt] = useState<boolean>(true);

  const isArabic = lang === 'ar';

  // Calculate items to export based on selected scope
  const targetItems = useMemo(() => {
    if (initialSingleItem && scope === 'single') {
      return [initialSingleItem];
    }
    switch (scope) {
      case 'favorites':
        return history.filter((item) => Boolean(item.isFavorite));
      case 'filtered':
        return filteredHistory;
      case 'selected':
        return history.filter((item) => selectedIds.includes(item.id));
      case 'all':
      default:
        return history;
    }
  }, [scope, history, filteredHistory, selectedIds, initialSingleItem]);

  const favoritesCount = useMemo(() => {
    return history.filter((h) => Boolean(h.isFavorite)).length;
  }, [history]);

  // Model label helper
  const getModelLabel = (model: ModelType | string): string => {
    switch (model) {
      case 'gemini':
        return 'Google Gemini 2.5';
      case 'chatgpt':
        return 'OpenAI ChatGPT';
      case 'claude':
        return 'Anthropic Claude';
      case 'notebooklm':
        return 'Google NotebookLM';
      case 'midjourney':
        return 'Midjourney v6.1';
      case 'meta':
        return 'Meta AI / Llama 3';
      default:
        return String(model);
    }
  };

  // Generate the HTML Document for print/PDF
  const generateDocumentHTML = (): string => {
    const documentTitle = isArabic
      ? 'سجل الأوامر الهندسية المعتمدة — ArabPrompt'
      : 'ArabPrompt - Approved Engineered Prompt Specifications';

    const now = new Date();
    const formattedDate = now.toLocaleDateString(isArabic ? 'ar-u-nu-latn' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const formattedTime = now.toLocaleTimeString(isArabic ? 'ar-u-nu-latn' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    // Theme color variables
    let themeCss = '';
    if (theme === 'gold') {
      themeCss = `
        --brand-color: #916a24;
        --brand-accent: #c29b40;
        --brand-bg: #fdfaf3;
        --border-color: #e8dfcb;
        --text-main: #292524;
        --text-muted: #78716c;
        --card-bg: #faf7f0;
      `;
    } else if (theme === 'minimal') {
      themeCss = `
        --brand-color: #1c1917;
        --brand-accent: #44403c;
        --brand-bg: #f5f5f4;
        --border-color: #e7e5e4;
        --text-main: #1c1917;
        --text-muted: #78716c;
        --card-bg: #fcfcfc;
      `;
    } else {
      themeCss = `
        --brand-color: #0f766e;
        --brand-accent: #14b8a6;
        --brand-bg: #f0fdfa;
        --border-color: #ccfbf1;
        --text-main: #134e4a;
        --text-muted: #5eead4;
        --card-bg: #f7fee7;
      `;
    }

    // Cover Page HTML
    let coverHTML = '';
    if (includeCover && targetItems.length > 1) {
      coverHTML = `
      <div class="cover-page page-break">
        <div class="cover-content">
          <div class="cover-badge">✦ ARABPROMPT DOCUMENT ✦</div>
          <h1 class="cover-title">${isArabic ? 'سجل الأوامر الهندسية المعتمدة' : 'Official Engineered Prompt Specification'}</h1>
          <p class="cover-subtitle">
            ${isArabic
              ? 'وثيقة مرجعية منسقة للأوامر والتعليمات البرمجية المهندسة لنماذج الذكاء الاصطناعي التوليدي'
              : 'Official curated repository of optimized prompts for frontier generative AI models'}
          </p>

          <div class="cover-divider"></div>

          <div class="cover-stats-grid">
            <div class="cover-stat-box">
              <span class="cover-stat-label">${isArabic ? 'إجمالي الأوامر' : 'Total Prompts'}</span>
              <span class="cover-stat-val">${targetItems.length}</span>
            </div>
            <div class="cover-stat-box">
              <span class="cover-stat-label">${isArabic ? 'الأوامر المفضلة' : 'Starred Prompts'}</span>
              <span class="cover-stat-val">★ ${targetItems.filter(i => i.isFavorite).length}</span>
            </div>
            <div class="cover-stat-box">
              <span class="cover-stat-label">${isArabic ? 'تاريخ التوثيق' : 'Date Exported'}</span>
              <span class="cover-stat-val" style="font-size: 14px;">${formattedDate}</span>
            </div>
          </div>

          <div class="cover-toc">
            <h3>${isArabic ? 'فهرس الأوامر السريع:' : 'Quick Table of Contents:'}</h3>
            <ol class="toc-list">
              ${targetItems.slice(0, 15).map((item, idx) => `
                <li>
                  <span class="toc-title">${idx + 1}. ${(item.originalText || item.optimizedText).slice(0, 75)}...</span>
                  <span class="toc-model">${getModelLabel(item.model)}</span>
                </li>
              `).join('')}
              ${targetItems.length > 15 ? `<li class="toc-more">${isArabic ? `... والمزيد (${targetItems.length - 15} أمر آخر)` : `... and ${targetItems.length - 15} more prompts`}</li>` : ''}
            </ol>
          </div>

          <div class="cover-footer">
            <span>ArabPrompt AI Suite © 2026</span>
            <span>${formattedDate} · ${formattedTime}</span>
          </div>
        </div>
      </div>
      `;
    }

    // Prompts List HTML
    let itemsHTML = '';
    targetItems.forEach((item, index) => {
      const isLast = index === targetItems.length - 1;
      const dateStr = new Date(item.timestamp).toLocaleString(isArabic ? 'ar-u-nu-latn' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const ratingStars = item.rating
        ? '★'.repeat(item.rating) + '☆'.repeat(5 - item.rating)
        : (isArabic ? 'غير مقيم' : 'Unrated');

      itemsHTML += `
      <div class="prompt-card ${pageBreakPerPrompt && !isLast ? 'page-break' : ''}">
        
        <!-- Header -->
        <div class="card-header">
          <div class="card-brand">
            <span class="brand-sparkle">✦</span>
            <span class="brand-name">ArabPrompt</span>
            <span class="item-number">#${index + 1}</span>
          </div>
          <div class="card-id-box">
            <span class="item-id">ID: ${item.id.substring(0, 8).toUpperCase()}</span>
            ${item.isFavorite ? `<span class="favorite-badge">★ ${isArabic ? 'مفضلة' : 'Favorite'}</span>` : ''}
          </div>
        </div>

        <div class="accent-bar"></div>

        <!-- Metadata Grid -->
        ${includeMetadata ? `
        <div class="meta-container">
          <div class="meta-cell">
            <span class="meta-label">${isArabic ? 'التاريخ والوقت:' : 'Date & Time:'}</span>
            <span class="meta-value">${dateStr}</span>
          </div>
          <div class="meta-cell">
            <span class="meta-label">${isArabic ? 'النموذج المخصص:' : 'Target AI Model:'}</span>
            <span class="meta-value highlight">${getModelLabel(item.model)}</span>
          </div>
          <div class="meta-cell">
            <span class="meta-label">${isArabic ? 'النبرة والأسلوب:' : 'Tone & Style:'}</span>
            <span class="meta-value">${item.tone || (isArabic ? 'تلقائي' : 'Default')}</span>
          </div>
          <div class="meta-cell">
            <span class="meta-label">${isArabic ? 'التصنيف:' : 'Category:'}</span>
            <span class="meta-value">${item.category}</span>
          </div>
          ${includeRatings ? `
          <div class="meta-cell">
            <span class="meta-label">${isArabic ? 'التقييم:' : 'Quality Rating:'}</span>
            <span class="meta-value rating-stars">${ratingStars}</span>
          </div>
          ` : ''}
        </div>
        ` : ''}

        <!-- Tags List -->
        ${includeTags && item.tags && item.tags.length > 0 ? `
        <div class="tags-container">
          <span class="tags-label">${isArabic ? 'الوسوم:' : 'Tags:'}</span>
          ${item.tags.map(t => `<span class="tag-pill">#${t}</span>`).join(' ')}
        </div>
        ` : ''}

        <!-- Section 1: Original Thought -->
        ${includeOriginal ? `
        <div class="content-block">
          <div class="block-title">
            <span class="block-number">01</span>
            <span>${isArabic ? 'الفكرة الأساسية / المدخل الأولي' : 'Original Draft & Raw Idea'}</span>
          </div>
          <div class="block-text amiri-font" dir="auto">${item.originalText}</div>
        </div>
        ` : ''}

        <!-- Section 2: Approved Optimized Prompt -->
        ${includeOptimized ? `
        <div class="content-block active-block">
          <div class="block-title amber-title">
            <span class="block-number amber-badge">02</span>
            <span>${isArabic ? 'الأمر الهندسي المعتمد (النسخ والتشغيل)' : 'Approved Target Engineered Prompt (Deployable)'}</span>
          </div>
          <div class="block-text mono-font code-box" dir="ltr">${item.optimizedText}</div>
        </div>
        ` : ''}

        <!-- Section 3: Translation (Optional) -->
        ${includeTranslated && item.translatedText ? `
        <div class="content-block">
          <div class="block-title">
            <span class="block-number">03</span>
            <span>${isArabic ? 'الترجمة والتعريب الإنجليزي' : 'English Translation / Auxiliary'}</span>
          </div>
          <div class="block-text sans-font" dir="ltr">${item.translatedText}</div>
        </div>
        ` : ''}

        <!-- Footer -->
        <div class="card-footer">
          <span>ArabPrompt — Engineered Prompt Suite</span>
          <span>${item.id}</span>
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
          ${themeCss}
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: #f7f7f7;
          color: var(--text-main);
          font-size: 13px;
          line-height: 1.5;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .amiri-font {
          font-family: 'Amiri', serif;
          font-size: 14.5px;
          line-height: 1.65;
        }
        .mono-font {
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 12px;
          line-height: 1.5;
        }
        .sans-font {
          font-family: 'Inter', sans-serif;
        }

        /* Page Layout */
        .cover-page,
        .prompt-card {
          max-width: 820px;
          margin: 25px auto;
          background: #ffffff;
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 35px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.03);
          position: relative;
        }

        @media print {
          body {
            background: #fff;
          }
          .cover-page,
          .prompt-card {
            border: none;
            box-shadow: none;
            margin: 0;
            padding: 20px;
            max-width: 100%;
            border-radius: 0;
          }
          .page-break {
            page-break-after: always;
            break-after: page;
          }
        }

        /* Cover Page Styling */
        .cover-page {
          min-height: 90vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          background: linear-gradient(to bottom, #ffffff, var(--brand-bg));
        }
        .cover-content {
          width: 100%;
        }
        .cover-badge {
          display: inline-block;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 2px;
          color: var(--brand-accent);
          background: rgba(194,155,64,0.12);
          padding: 6px 14px;
          border-radius: 20px;
          margin-bottom: 20px;
        }
        .cover-title {
          font-size: 26px;
          font-weight: 900;
          color: var(--brand-color);
          margin-bottom: 12px;
        }
        .cover-subtitle {
          font-size: 13.5px;
          color: var(--text-muted);
          max-width: 600px;
          margin: 0 auto 30px auto;
          line-height: 1.6;
        }
        .cover-divider {
          width: 80px;
          height: 3px;
          background: var(--brand-accent);
          margin: 0 auto 35px auto;
          border-radius: 2px;
        }
        .cover-stats-grid {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-bottom: 40px;
        }
        .cover-stat-box {
          background: #ffffff;
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 16px 24px;
          min-width: 150px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.02);
        }
        .cover-stat-label {
          display: block;
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 600;
          margin-bottom: 4px;
        }
        .cover-stat-val {
          font-size: 22px;
          font-weight: 800;
          color: var(--brand-color);
        }
        .cover-toc {
          text-align: right;
          rtl:text-align: right;
          background: #ffffff;
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 20px;
          max-width: 650px;
          margin: 0 auto 35px auto;
        }
        html[dir="ltr"] .cover-toc {
          text-align: left;
        }
        .cover-toc h3 {
          font-size: 13px;
          font-weight: 800;
          color: var(--brand-color);
          margin-bottom: 12px;
          border-bottom: 1px dashed var(--border-color);
          padding-bottom: 8px;
        }
        .toc-list {
          list-style: none;
          font-size: 12px;
          space-y: 6px;
        }
        .toc-list li {
          display: flex;
          justify-content: space-between;
          padding: 5px 0;
          border-bottom: 1px dotted rgba(0,0,0,0.05);
        }
        .toc-title {
          font-weight: 600;
          color: var(--text-main);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 450px;
        }
        .toc-model {
          color: var(--brand-accent);
          font-weight: 700;
          font-size: 11px;
        }
        .cover-footer {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: var(--text-muted);
          border-top: 1px solid var(--border-color);
          padding-top: 15px;
        }

        /* Prompt Card Styling */
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .card-brand {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .brand-sparkle {
          color: var(--brand-accent);
          font-size: 20px;
        }
        .brand-name {
          font-weight: 800;
          font-size: 16px;
          color: var(--text-main);
        }
        .item-number {
          background: rgba(194,155,64,0.15);
          color: var(--brand-color);
          padding: 2px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          margin-left: 8px;
          rtl:margin-right: 8px;
          rtl:margin-left: 0;
        }
        .card-id-box {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .item-id {
          font-size: 11px;
          color: var(--text-muted);
          font-family: monospace;
          font-weight: 600;
        }
        .favorite-badge {
          background: #fef3c7;
          color: #b45309;
          border: 1px solid #fde68a;
          padding: 2px 8px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: bold;
        }
        .accent-bar {
          height: 2.5px;
          background: linear-gradient(to right, var(--brand-accent), transparent);
          border-radius: 2px;
          margin-bottom: 20px;
        }
        html[dir="rtl"] .accent-bar {
          background: linear-gradient(to left, var(--brand-accent), transparent);
        }

        /* Meta Grid */
        .meta-container {
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 14px 18px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
          margin-bottom: 20px;
        }
        .meta-cell {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .meta-label {
          font-size: 10.5px;
          font-weight: 700;
          color: var(--text-muted);
        }
        .meta-value {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-main);
        }
        .meta-value.highlight {
          color: var(--brand-color);
          font-weight: 700;
        }
        .rating-stars {
          color: #d97706;
          font-size: 12px;
        }

        /* Tags */
        .tags-container {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          margin-bottom: 18px;
          font-size: 11px;
        }
        .tags-label {
          font-weight: bold;
          color: var(--text-muted);
        }
        .tag-pill {
          background: #f5f5f4;
          border: 1px solid #e7e5e4;
          padding: 2px 8px;
          border-radius: 6px;
          font-weight: 600;
          color: #44403c;
        }

        /* Content Blocks */
        .content-block {
          border: 1px solid var(--border-color);
          border-radius: 12px;
          margin-bottom: 20px;
          overflow: hidden;
        }
        .content-block.active-block {
          border-color: rgba(194,155,64,0.4);
        }
        .block-title {
          background: #f9f9f8;
          padding: 10px 14px;
          font-size: 12px;
          font-weight: 700;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-main);
        }
        .amber-title {
          background: var(--brand-bg);
          color: var(--brand-color);
        }
        .block-number {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          border-radius: 5px;
          background: #e7e5e4;
          color: #57534e;
          font-size: 10px;
          font-weight: bold;
        }
        .amber-badge {
          background: var(--brand-accent);
          color: #ffffff;
        }
        .block-text {
          padding: 16px;
          white-space: pre-wrap;
          word-break: break-word;
        }
        .code-box {
          background: var(--brand-bg);
          border-left: 3px solid var(--brand-accent);
          rtl:border-left: none;
          rtl:border-right: 3px solid var(--brand-accent);
          color: #1c1917;
        }

        /* Footer */
        .card-footer {
          display: flex;
          justify-content: space-between;
          font-size: 9.5px;
          color: var(--text-muted);
          border-top: 1px solid var(--border-color);
          padding-top: 12px;
          margin-top: 15px;
        }
      </style>
    </head>
    <body>
      ${coverHTML}
      ${itemsHTML}
    </body>
    </html>
    `;
  };

  // Direct Browser Print & Save as PDF trigger
  const handlePrint = () => {
    try {
      const htmlContent = generateDocumentHTML();
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      iframe.id = 'export-pdf-print-frame';

      const existing = document.getElementById('export-pdf-print-frame');
      if (existing) existing.remove();

      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document || iframe.contentDocument;
      if (!doc) throw new Error('Could not access print context');

      doc.open();
      doc.write(htmlContent);
      doc.close();

      showToast(
        isArabic
          ? `✓ جاري تجهيز ${targetItems.length} أمر في وثيقة PDF للطباعة أو الحفظ...`
          : `✓ Preparing ${targetItems.length} prompts for PDF print/save...`
      );

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (e) {
          console.warn('iframe print invoke:', e);
        }
        setTimeout(() => {
          if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
        }, 60000);
      }, 700);

    } catch (err: any) {
      console.error(err);
      showToast(isArabic ? 'عذراً، فشل تصدير الـ PDF' : 'Failed to export PDF', true);
    }
  };

  // Download styled standalone HTML/PDF document file
  const handleDownloadDigitalFile = () => {
    try {
      const htmlContent = generateDocumentHTML();
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const fileName = `ArabPrompt-History-${scope}-${new Date().toISOString().slice(0, 10)}.html`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast(
        isArabic
          ? '✓ تم تحميل الوثيقة المنسقة بنجاح! يمكنك فتحها وطباعتها كـ PDF في أي وقت.'
          : '✓ Styled document downloaded! You can open and print as PDF anytime.'
      );
    } catch (err) {
      console.error(err);
      showToast(isArabic ? 'فشل تحميل الملف' : 'Download failed', true);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div
        className="w-full max-w-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-[#fdfcfa] dark:bg-stone-900/90">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#916a24] via-[#c29b40] to-[#ecd197] flex items-center justify-center text-white shadow-md ring-2 ring-[#c29b40]/20">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 font-sans">
                  {isArabic ? 'تصدير سجل الأوامر كملف PDF منسق' : 'Export Prompt History to Styled PDF'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#c29b40]/15 text-[#8c6a1e] dark:text-amber-400 border border-[#c29b40]/30 hidden sm:inline-flex">
                  {targetItems.length} {isArabic ? 'أمر محدد للتصدير' : 'prompts to export'}
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {isArabic
                  ? 'طباعة ورقية رسمية أو حفظ رقمي لبرومبتاتك المفضلة وسجلاتك الهندسية'
                  : 'Official print-ready layout or digital backup for your favorite engineered prompts'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher: Options vs Live Preview */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('options')}
            className={`pb-2.5 px-3 font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'options'
                ? 'border-[#c29b40] text-[#8c6a1e] dark:text-amber-400'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{isArabic ? 'خيارات وتخصيص التصدير' : 'Export Options'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`pb-2.5 px-3 font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'preview'
                ? 'border-[#c29b40] text-[#8c6a1e] dark:text-amber-400'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isArabic ? 'معاينة المستند المنسق' : 'Live Document Preview'}</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {activeTab === 'options' ? (
            <>
              {/* Scope Selector: All, Favorites, Filtered, Selected */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                  {isArabic ? '1. اختر نطاق الأوامر المراد تصديرها:' : '1. Select Prompts Scope to Export:'}
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  
                  {/* Option: Favorites Only (Specifically requested) */}
                  <button
                    type="button"
                    onClick={() => setScope('favorites')}
                    className={`p-3.5 rounded-2xl border text-right rtl:text-right ltr:text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                      scope === 'favorites'
                        ? 'bg-amber-500/10 border-[#c29b40] ring-1 ring-[#c29b40] text-[#8c6a1e] dark:text-amber-300 font-bold'
                        : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:border-amber-300 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-bold text-xs">
                        <Star className={`w-4 h-4 ${scope === 'favorites' ? 'fill-amber-500 text-amber-500' : 'text-amber-500'}`} />
                        <span>{isArabic ? 'الأوامر المفضلة فقط' : 'Favorite Prompts'}</span>
                      </span>
                      <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-amber-500/15">
                        {favoritesCount}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 font-normal leading-relaxed">
                      {isArabic
                        ? 'تصدير كافة البرومبتات التي ميزتها بنجمة في مفضلتك'
                        : 'Export all prompts marked with a star in your favorites'}
                    </p>
                  </button>

                  {/* Option: All History */}
                  <button
                    type="button"
                    onClick={() => setScope('all')}
                    className={`p-3.5 rounded-2xl border text-right rtl:text-right ltr:text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                      scope === 'all'
                        ? 'bg-amber-500/10 border-[#c29b40] ring-1 ring-[#c29b40] text-[#8c6a1e] dark:text-amber-300 font-bold'
                        : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:border-amber-300 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-bold text-xs">
                        <Layers className="w-4 h-4 text-[#c29b40]" />
                        <span>{isArabic ? 'كامل سجل الأوامر' : 'Entire History'}</span>
                      </span>
                      <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-700">
                        {history.length}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 font-normal leading-relaxed">
                      {isArabic
                        ? 'تصدير كافة الأوامر والمسودات المسجلة في التطبيق'
                        : 'Comprehensive export of all saved prompts in history'}
                    </p>
                  </button>

                  {/* Option: Filtered view */}
                  <button
                    type="button"
                    onClick={() => setScope('filtered')}
                    className={`p-3.5 rounded-2xl border text-right rtl:text-right ltr:text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                      scope === 'filtered'
                        ? 'bg-amber-500/10 border-[#c29b40] ring-1 ring-[#c29b40] text-[#8c6a1e] dark:text-amber-300 font-bold'
                        : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:border-amber-300 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-bold text-xs">
                        <Sliders className="w-4 h-4 text-stone-500" />
                        <span>{isArabic ? 'الأوامر المصفاة حالياً' : 'Current Filtered'}</span>
                      </span>
                      <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-700">
                        {filteredHistory.length}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 font-normal leading-relaxed">
                      {isArabic
                        ? 'تصدير ما يطابق بحثك الحالي وتصفية النموذج والوسوم'
                        : 'Export prompts matching current search & tag filters'}
                    </p>
                  </button>

                  {/* Option: Selected (if any) */}
                  {selectedIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setScope('selected')}
                      className={`p-3.5 rounded-2xl border text-right rtl:text-right ltr:text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                        scope === 'selected'
                          ? 'bg-amber-500/10 border-[#c29b40] ring-1 ring-[#c29b40] text-[#8c6a1e] dark:text-amber-300 font-bold'
                          : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:border-amber-300 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-bold text-xs">
                          <CheckSquare className="w-4 h-4 text-[#c29b40]" />
                          <span>{isArabic ? 'المحددة يدوياً' : 'Selected Prompts'}</span>
                        </span>
                        <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-700">
                          {selectedIds.length}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 font-normal leading-relaxed">
                        {isArabic ? 'تصدير العناصر التي حددتها بمربعات الاختيار' : 'Export checked items'}
                      </p>
                    </button>
                  )}

                </div>
              </div>

              {/* Theme Selection */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                  {isArabic ? '2. مظهر وتنسيق الوثيقة:' : '2. Document Styling Theme:'}
                </label>

                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setTheme('gold')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      theme === 'gold'
                        ? 'bg-amber-500/10 border-[#c29b40] text-[#8c6a1e] dark:text-amber-300 font-bold'
                        : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    <span className="text-sm block">🏛️</span>
                    <span className="text-xs font-bold mt-1 block">
                      {isArabic ? 'الذهبي الفاخر' : 'Gold Luxury'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme('minimal')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      theme === 'minimal'
                        ? 'bg-stone-100 dark:bg-stone-700 border-stone-900 dark:border-stone-300 text-stone-900 dark:text-stone-100 font-bold'
                        : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    <span className="text-sm block">📄</span>
                    <span className="text-xs font-bold mt-1 block">
                      {isArabic ? 'الأبيض البسيط' : 'Clean Minimal'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme('modern')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      theme === 'modern'
                        ? 'bg-teal-500/10 border-teal-600 text-teal-800 dark:text-teal-300 font-bold'
                        : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    <span className="text-sm block">⚡</span>
                    <span className="text-xs font-bold mt-1 block">
                      {isArabic ? 'التقني الحديث' : 'Modern Teal'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Inclusions & Sections Toggles */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                  {isArabic ? '3. محتويات وأقسام الوثيقة:' : '3. Content Sections to Include:'}
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeCover}
                      onChange={(e) => setIncludeCover(e.target.checked)}
                      className="rounded accent-[#c29b40]"
                    />
                    <span>{isArabic ? 'صفحة غلاف رسمية وفهرس للأوامر' : 'Official Cover Page & TOC'}</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeOptimized}
                      onChange={(e) => setIncludeOptimized(e.target.checked)}
                      className="rounded accent-[#c29b40]"
                    />
                    <span>{isArabic ? 'الأمر الهندسي المعتمد (الكود النهائي)' : 'Approved Engineered Prompt'}</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeOriginal}
                      onChange={(e) => setIncludeOriginal(e.target.checked)}
                      className="rounded accent-[#c29b40]"
                    />
                    <span>{isArabic ? 'الفكرة الأصلية والمسودة الأولية' : 'Original Raw Prompt Idea'}</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeMetadata}
                      onChange={(e) => setIncludeMetadata(e.target.checked)}
                      className="rounded accent-[#c29b40]"
                    />
                    <span>{isArabic ? 'بطاقة البيانات (النموذج، النبرة، التاريخ)' : 'Metadata Specs Card'}</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeTranslated}
                      onChange={(e) => setIncludeTranslated(e.target.checked)}
                      className="rounded accent-[#c29b40]"
                    />
                    <span>{isArabic ? 'الترجمة والتعريب المساعد' : 'English Translation Version'}</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pageBreakPerPrompt}
                      onChange={(e) => setPageBreakPerPrompt(e.target.checked)}
                      className="rounded accent-[#c29b40]"
                    />
                    <span>{isArabic ? 'فاصل صفحات (كل أمر في صفحة A4)' : 'Page Break per prompt'}</span>
                  </label>
                </div>
              </div>
            </>
          ) : (
            /* Live Document Preview */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span className="font-bold flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#c29b40]" />
                  <span>{isArabic ? 'معاينة حية للمستند قبل الطباعة والحفظ:' : 'Live Document Preview:'}</span>
                </span>
                <span>{targetItems.length} {isArabic ? 'أمر متاح' : 'prompts'}</span>
              </div>

              <div className="w-full h-96 rounded-2xl border border-stone-200 dark:border-stone-700 bg-white overflow-hidden shadow-inner">
                <iframe
                  title="PDF Preview"
                  srcDoc={generateDocumentHTML()}
                  className="w-full h-full border-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 sm:p-5 border-t border-stone-200 dark:border-stone-800 bg-[#fdfcfa] dark:bg-stone-900/90 text-xs">
          
          <div className="text-stone-500 dark:text-stone-400 text-xs">
            {isArabic ? (
              <span>
                سيتم تصدير <strong className="text-stone-900 dark:text-stone-100 font-mono font-bold">{targetItems.length}</strong> أمر بتنسيق جاهز للطباعة والحفظ كـ PDF.
              </span>
            ) : (
              <span>
                Exporting <strong className="text-stone-900 dark:text-stone-100 font-mono font-bold">{targetItems.length}</strong> prompts into a styled PDF.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleDownloadDigitalFile}
              disabled={targetItems.length === 0}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
              title={isArabic ? 'تحميل كملف مستند رقمي جاهز للطباعة' : 'Download Digital Document'}
            >
              <Download className="w-3.5 h-3.5 text-[#c29b40]" />
              <span>{isArabic ? 'تحميل الوثيقة' : 'Download Doc'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              disabled={targetItems.length === 0}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#916a24] via-[#c29b40] to-[#b38d35] hover:opacity-95 text-white font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
            >
              <Printer className="w-4 h-4" />
              <span>{isArabic ? 'طباعة وحفظ كـ PDF' : 'Print / Save as PDF'}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
