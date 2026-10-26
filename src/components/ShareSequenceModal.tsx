/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, Share2, Copy, Check, ExternalLink, MessageCircle, Send, 
  Twitter, Mail, Globe, Film, Sparkles, CheckCircle2, Clapperboard, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { showToast } from './ToastNotification';
import { AppLanguage } from '../types';

interface ShareSequenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: AppLanguage;
  shareUrl: string;
  title: string;
  concept?: string;
  scenesCount: number;
  sequenceType?: 'storyboard' | 'cinema';
  styleOrGenre?: string;
  previewScenes?: { title: string; prompt: string }[];
}

export default function ShareSequenceModal({
  isOpen,
  onClose,
  lang,
  shareUrl,
  title,
  concept,
  scenesCount,
  sequenceType = 'storyboard',
  styleOrGenre,
  previewScenes = []
}: ShareSequenceModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeShareTarget, setActiveShareTarget] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      showToast(lang === 'ar' ? '✓ تم نسخ رابط مشاركة السلسلة إلى الحافظة!' : '✓ Sequence share link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const input = document.getElementById('share-url-input') as HTMLInputElement;
      if (input) {
        input.select();
        document.execCommand('copy');
        setCopied(true);
        showToast(lang === 'ar' ? '✓ تم نسخ الرابط!' : '✓ Link copied!');
        setTimeout(() => setCopied(false), 2500);
      }
    }
  };

  const shareText = lang === 'ar'
    ? `🎬 شاهد وافحص سلسلة المشاهد والبرومبتات: "${title}" عبر منصة عرب برومبت (ArabPrompt):\n`
    : `🎬 Check out this curated AI prompt sequence: "${title}" on ArabPrompt:\n`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `${shareText}\n${concept ? concept.slice(0, 100) + '...' : ''}`,
          url: shareUrl
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const shareLinks = {
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}&hashtags=ArabPrompt,AIVideo,Prompts`,
    email: `mailto:?subject=${encodeURIComponent(lang === 'ar' ? `مشاركة سلسلة مشاهد: ${title}` : `Shared Sequence: ${title}`)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 text-stone-850 flex flex-col max-h-[90vh]"
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
        >
          {/* Modal Header */}
          <div className="relative p-6 bg-gradient-to-br from-[#1c1a17] via-[#25221e] to-[#181614] text-white border-b border-stone-800">
            {/* Ambient gold glow */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#c29b40]/15 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#916a24] to-[#c29b40] text-white flex items-center justify-center shadow-lg shadow-[#c29b40]/25">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black tracking-tight">
                      {lang === 'ar' ? 'مشاركة سلسلة المشاهد والبرومبتات' : 'Share Sequence Prompts'}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#c29b40]/20 text-[#ecd197] border border-[#c29b40]/40 uppercase">
                      {sequenceType === 'cinema' 
                        ? (lang === 'ar' ? 'سينما 10 ثوانٍ' : 'Cinema 10s') 
                        : (lang === 'ar' ? 'ستوري بورد' : 'Storyboard')}
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {lang === 'ar' 
                      ? 'رابط فريد يمكن للجميع فتحه لاستعراض المشاهد والأوامر وتشغيل المحاكاة' 
                      : 'Unique shareable link allowing anyone to view scenes, simulation & copy prompts'}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title={lang === 'ar' ? 'إغلاق' : 'Close'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-5 overflow-y-auto">
            {/* Sequence Brief Card */}
            <div className="bg-[#faf8f4] border border-[#ecd197]/50 rounded-2xl p-4 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#c29b40]/30 text-[#916a24] flex items-center justify-center shrink-0 shadow-2xs">
                <Clapperboard className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-extrabold text-sm text-stone-900 truncate">
                    {title || (lang === 'ar' ? 'سلسلة مشاهد غير معنونة' : 'Untitled Sequence')}
                  </h4>
                  <span className="shrink-0 px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-black rounded-md">
                    {scenesCount} {lang === 'ar' ? 'مشاهد' : 'Scenes'}
                  </span>
                </div>
                {concept && (
                  <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">
                    {concept}
                  </p>
                )}
                {styleOrGenre && (
                  <div className="mt-2 text-[10px] text-stone-500 flex items-center gap-1 font-mono">
                    <Sparkles className="w-3 h-3 text-[#c29b40]" />
                    <span className="truncate max-w-xs">{styleOrGenre}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Generated Link Box */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-700">
                {lang === 'ar' ? 'الرابط الفريد المباشر للسلسلة:' : 'Unique Direct Sequence Link:'}
              </label>
              
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    id="share-url-input"
                    type="text"
                    readOnly
                    value={shareUrl}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    className="w-full text-xs font-mono bg-stone-50 border border-stone-200 rounded-xl py-2.5 px-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#c29b40]/30 direction-ltr select-all"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-xs ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#c29b40] hover:bg-[#a6802f] text-white hover:shadow-md'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{lang === 'ar' ? 'تم النسخ!' : 'Copied!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>{lang === 'ar' ? 'نسخ الرابط' : 'Copy Link'}</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-stone-500">
                {lang === 'ar'
                  ? '💡 عند فتح هذا الرابط في أي جهاز، ستُحمّل جميع مشاهد وأوامر هذه السلسلة فوراً.'
                  : '💡 Anyone opening this link will immediately load the full sequence and prompts.'}
              </p>
            </div>

            {/* Social & Direct Apps Share Grid */}
            <div className="space-y-2.5 pt-1 border-t border-stone-100">
              <span className="block text-xs font-bold text-stone-700">
                {lang === 'ar' ? 'مشاركة سريعة عبر التطبيقات:' : 'Quick Share to Apps:'}
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* WhatsApp */}
                <a
                  href={shareLinks.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl border border-stone-200 hover:border-emerald-400 bg-white hover:bg-emerald-50/50 text-stone-800 transition-all flex items-center justify-center gap-2 text-xs font-bold shadow-2xs group"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                  <span>WhatsApp</span>
                </a>

                {/* Telegram */}
                <a
                  href={shareLinks.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl border border-stone-200 hover:border-sky-400 bg-white hover:bg-sky-50/50 text-stone-800 transition-all flex items-center justify-center gap-2 text-xs font-bold shadow-2xs group"
                >
                  <Send className="w-4 h-4 text-sky-500 group-hover:scale-110 transition-transform" />
                  <span>Telegram</span>
                </a>

                {/* Twitter / X */}
                <a
                  href={shareLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl border border-stone-200 hover:border-stone-900 bg-white hover:bg-stone-100 text-stone-800 transition-all flex items-center justify-center gap-2 text-xs font-bold shadow-2xs group"
                >
                  <Twitter className="w-4 h-4 text-stone-800 group-hover:scale-110 transition-transform" />
                  <span>X / Twitter</span>
                </a>

                {/* Email */}
                <a
                  href={shareLinks.email}
                  className="p-2.5 rounded-xl border border-stone-200 hover:border-amber-400 bg-white hover:bg-amber-50/50 text-stone-800 transition-all flex items-center justify-center gap-2 text-xs font-bold shadow-2xs group"
                >
                  <Mail className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
                  <span>{lang === 'ar' ? 'البريد' : 'Email'}</span>
                </a>
              </div>

              {/* Native Mobile Share Button */}
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="w-full mt-2 py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#c29b40]" />
                  <span>{lang === 'ar' ? 'المزيد من خيارات المشاركة في هاتفك...' : 'More device share options...'}</span>
                </button>
              )}
            </div>

            {/* Quick Preview of included scenes */}
            {previewScenes.length > 0 && (
              <div className="pt-2 border-t border-stone-100 space-y-2">
                <span className="block text-xs font-bold text-stone-500">
                  {lang === 'ar' ? 'معاينة عيّنة من المشاهد المشمولة في الرابط:' : 'Sample of included scenes:'}
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {previewScenes.slice(0, 3).map((scene, i) => (
                    <div key={i} className="text-[11px] p-2 bg-stone-50 rounded-lg border border-stone-200/70">
                      <div className="font-bold text-stone-800 flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-amber-100 text-[#916a24] text-[9px] flex items-center justify-center font-mono">
                          {i + 1}
                        </span>
                        <span className="truncate">{scene.title}</span>
                      </div>
                      <p className="text-stone-500 font-mono text-[10px] truncate mt-0.5 dir-ltr text-left">
                        {scene.prompt}
                      </p>
                    </div>
                  ))}
                  {previewScenes.length > 3 && (
                    <div className="text-[10px] text-stone-400 text-center font-semibold py-1">
                      {lang === 'ar' 
                        ? `+ و ${previewScenes.length - 3} مشاهد أخرى جاهزة للاستعراض`
                        : `+ and ${previewScenes.length - 3} more scenes ready to view`}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-stone-500">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{lang === 'ar' ? 'جاهز للمشاركة المباشرة' : 'Ready to share directly'}</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-100 text-stone-700 font-bold text-xs transition-colors cursor-pointer"
            >
              {lang === 'ar' ? 'إغلاق النافذة' : 'Close'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
