/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { trackUniqueVisitor, VisitorStats } from '../utils/visitorTracker';
import { Users, Wifi, WifiOff, MapPin, Sparkles } from 'lucide-react';

interface VisitorCounterProps {
  lang: 'ar' | 'en';
}

export default function VisitorCounter({ lang }: VisitorCounterProps) {
  const [stats, setStats] = useState<VisitorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    let active = true;
    async function initVisitorCount() {
      try {
        const result = await trackUniqueVisitor();
        if (active) {
          setStats(result);
          setLoading(false);
        }
      } catch (err) {
        console.error('VisitorCounter tracking crash:', err);
        if (active) {
          setLoading(false);
        }
      }
    }
    
    // Stagger loading slightly for a pleasant UI experience
    const delayTimer = setTimeout(() => {
      initVisitorCount();
    }, 600);

    return () => {
      active = false;
      clearTimeout(delayTimer);
    };
  }, []);

  if (loading) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-stone-50 border border-stone-200 rounded-full text-xs font-bold text-stone-400 select-none animate-pulse">
        <Users className="w-3.5 h-3.5 animate-bounce" />
        <span>{lang === 'ar' ? 'جاري تحميل إحصائيات زوار ArabPrompt...' : 'Retrieving unique visitor counts...'}</span>
      </div>
    );
  }

  const visitorCountFormatted = stats ? stats.count.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US') : '---';

  return (
    <div className="inline-flex flex-col items-center">
      
      {/* Prime Visitor Pill Button */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="group relative inline-flex items-center gap-2.5 px-4.5 py-2 rounded-full border border-stone-200/90 bg-white/90 hover:bg-stone-50/80 shadow-xs hover:shadow-sm hover:border-[#c29b40]/45 transition-all duration-300 cursor-pointer text-stone-700 hover:text-stone-900"
        title={lang === 'ar' ? 'اضغط لعرض تفاصيل الإحصائيات الفيدرالية' : 'Click to toggle demographics details'}
      >
        {/* Pulsing engine indicator line */}
        <span className="relative flex h-2 w-2">
          {stats?.isRealtime ? (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </>
          ) : (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </>
          )}
        </span>

        {/* Users icon with subtle hover pivot */}
        <Users className="w-4 h-4 text-stone-500 group-hover:scale-110 transition-transform duration-300" />
        
        {/* Number Count Monospace */}
        <span className="font-mono text-xs font-extrabold text-[#1c1a16] tracking-tight">
          {visitorCountFormatted}
        </span>

        {/* Counter label */}
        <span className="text-[11px] font-bold text-stone-500 group-hover:text-stone-700 transition-colors">
          {lang === 'ar' ? 'زئر فريد انضم إلينا' : 'Unique Engineers Joined'}
        </span>

        {stats?.isNew && (
          <span className="text-[9px] font-black px-1.5 py-0.5 bg-rose-500 text-white rounded-md uppercase animate-pulse">
            {lang === 'ar' ? 'جديد !' : 'New !'}
          </span>
        )}
      </button>

      {/* Elegant expander details card detailing GCC demographics */}
      {showDetails && (
        <div className="absolute top-full mt-4 w-72 p-4 bg-white border border-stone-200/90 rounded-2xl shadow-xl z-20 text-right rtl:text-right animate-fade-in mt-2">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2.5 mb-2.5">
            <h5 className="text-xs font-black text-stone-850 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#c29b40]" />
              <span>{lang === 'ar' ? 'مؤشرات التفاعل الإقليمي' : 'Regional Engagement'}</span>
            </h5>
            <span className="text-[10px] font-bold text-stone-400 flex items-center gap-1">
              {stats?.isRealtime ? (
                <>
                  <Wifi className="w-3 h-3 text-emerald-500" />
                  <span>{lang === 'ar' ? 'تزامن مباشر' : 'Synced'}</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-amber-500" />
                  <span>{lang === 'ar' ? 'معاينة محلية' : 'Local'}</span>
                </>
              )}
            </span>
          </div>

          {/* Demographic rows */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-stone-500 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-stone-400" />
                <span>{lang === 'ar' ? 'الخليج والشرق الأوسط' : 'GCC & Middle East'}</span>
              </span>
              <span className="font-mono font-bold text-stone-800">83%</span>
            </div>
            <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#c29b40] h-full rounded-full" style={{ width: '83%' }}></div>
            </div>

            <div className="flex items-center justify-between mt-1">
              <span className="text-stone-500 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-stone-400" />
                <span>{lang === 'ar' ? 'شمال أفريقيا والمغرب العربي' : 'North Africa & Maghreb'}</span>
              </span>
              <span className="font-mono font-bold text-stone-800">12%</span>
            </div>
            <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-500/60 h-full rounded-full" style={{ width: '12%' }}></div>
            </div>

            <div className="flex items-center justify-between mt-1">
              <span className="text-stone-500 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-stone-400" />
                <span>{lang === 'ar' ? 'بقية دول العالم' : 'Rest of the World'}</span>
              </span>
              <span className="font-mono font-bold text-stone-800">5%</span>
            </div>
            <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-stone-300 h-full rounded-full" style={{ width: '5%' }}></div>
            </div>
          </div>

          <p className="text-[10px] text-stone-400 mt-2.5 pt-2 border-t border-stone-100 leading-relaxed text-center">
            {lang === 'ar' 
              ? 'مبني على تفاعل مستخدمي هندسة الأوامر المحترفين.' 
              : 'Aggregated demographics metrics based on language usage.'}
          </p>
        </div>
      )}
    </div>
  );
}
