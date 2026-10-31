/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Users,
  Crown,
  Sparkles,
  Activity,
  RefreshCw,
  Search,
  Filter,
  Download,
  ExternalLink,
  CheckCircle2,
  Clock,
  Mail,
  Lock,
  ChevronDown,
  Layers,
  ArrowUpRight,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Copy,
  Check,
  Calendar,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { AppLanguage } from '../types';
import {
  getPlatformAdminStats,
  PlatformAdminStats,
  RegisteredUserProfile
} from '../utils/firestoreService';
import { showToast } from './ToastNotification';

const ADMIN_EMAILS = ['adwwaw@gmail.com', 'adouaourachid@gmail.com'];

interface AdminDashboardProps {
  lang: AppLanguage;
  currentUser: any;
  onOpenAuth?: (mode?: 'login' | 'signup' | 'profile') => void;
  onNavigateTab?: (tab: string) => void;
}

export default function AdminDashboard({
  lang,
  currentUser,
  onOpenAuth,
  onNavigateTab
}: AdminDashboardProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<PlatformAdminStats | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [planFilter, setPlanFilter] = useState<'all' | 'studio' | 'pro' | 'lite' | 'free'>('all');
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'activity'>('overview');
  const [copiedUid, setCopiedUid] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  // Check admin authorization
  const isAdmin = useMemo(() => {
    if (!currentUser || !currentUser.email) return false;
    const email = currentUser.email.toLowerCase().trim();
    return ADMIN_EMAILS.some((adm) => adm.toLowerCase() === email);
  }, [currentUser]);

  // Load statistics from Firestore
  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await getPlatformAdminStats();
      setStats(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to load admin platform stats:', err);
      showToast({
        title: lang === 'ar' ? 'تعذر جلب البيانات' : 'Failed to fetch data',
        message: lang === 'ar' ? 'تأكد من اتصالك بالإنترنت وصلاحيات المشرف' : 'Check network and admin privileges',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadStats();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  // Filtered users list
  const filteredUsers = useMemo(() => {
    if (!stats || !stats.users) return [];
    return stats.users.filter((user) => {
      // Plan filter
      if (planFilter !== 'all') {
        const uPlan = (user.plan || 'free').toLowerCase();
        if (uPlan !== planFilter) return false;
      }
      // Verified filter
      if (verifiedOnly && !user.emailVerified) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesEmail = user.email.toLowerCase().includes(q);
        const matchesName = (user.displayName || '').toLowerCase().includes(q);
        const matchesUid = user.uid.toLowerCase().includes(q);
        if (!matchesEmail && !matchesName && !matchesUid) return false;
      }
      return true;
    });
  }, [stats, planFilter, verifiedOnly, searchQuery]);

  // Copy helper
  const handleCopy = (text: string, type: 'uid' | 'email') => {
    try {
      navigator.clipboard.writeText(text);
      if (type === 'uid') {
        setCopiedUid(text);
        setTimeout(() => setCopiedUid(null), 2000);
      } else {
        setCopiedEmail(text);
        setTimeout(() => setCopiedEmail(null), 2000);
      }
      showToast({
        title: lang === 'ar' ? 'تم النسخ' : 'Copied',
        message: text,
        type: 'info'
      });
    } catch {}
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!stats || !stats.users.length) return;
    try {
      const headers = ['UID', 'Email', 'DisplayName', 'Plan', 'EmailVerified', 'CreatedAt', 'LastActive'];
      const rows = stats.users.map((u) => [
        `"${u.uid}"`,
        `"${u.email || ''}"`,
        `"${u.displayName || ''}"`,
        `"${u.plan || 'free'}"`,
        u.emailVerified ? 'true' : 'false',
        `"${u.createdAt || ''}"`,
        `"${u.lastActive || ''}"`
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `registered_users_${new Date().toISOString().substring(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('Export CSV error:', e);
    }
  };

  // Format date helper
  const formatDate = (isoString?: string) => {
    if (!isoString) return lang === 'ar' ? 'غير محدد' : 'N/A';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return isoString;
    }
  };

  // Format relative time helper
  const formatRelativeTime = (isoString?: string) => {
    if (!isoString) return lang === 'ar' ? 'غير مسجل' : 'N/A';
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMinutes < 1) return lang === 'ar' ? 'الآن' : 'just now';
      if (diffMinutes < 60) return lang === 'ar' ? `منذ ${diffMinutes} دقيقة` : `${diffMinutes}m ago`;
      if (diffHours < 24) return lang === 'ar' ? `منذ ${diffHours} ساعة` : `${diffHours}h ago`;
      return lang === 'ar' ? `منذ ${diffDays} يوم` : `${diffDays}d ago`;
    } catch {
      return isoString;
    }
  };

  // Pie chart data for plans
  const planChartData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: lang === 'ar' ? 'باقة Studio' : 'Studio Plan', value: stats.planBreakdown.studio, color: '#8b5cf6' },
      { name: lang === 'ar' ? 'باقة Pro' : 'Pro Plan', value: stats.planBreakdown.pro, color: '#f59e0b' },
      { name: lang === 'ar' ? 'باقة Lite' : 'Lite Plan', value: stats.planBreakdown.lite, color: '#10b981' },
      { name: lang === 'ar' ? 'المجانية Free' : 'Free Plan', value: stats.planBreakdown.free, color: '#64748b' }
    ];
  }, [stats, lang]);

  // Access Denied Screen if not admin
  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 animate-in fade-in duration-300">
        <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="text-2xl font-black text-stone-900 dark:text-stone-100">
              {lang === 'ar' ? 'منطقة المشرفين المعتمدة (Admin Access Only)' : 'Restricted Admin Area'}
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              {lang === 'ar'
                ? 'لوحة الإدارة والإحصائيات الخاصة بالمستخدمين والباقات ونشاط التوليد محصورة حصرياً بالمشرف المعتمد (adwwaw@gmail.com). يرجى تسجيل الدخول بحساب المشرف للوصول.'
                : 'The registered users dashboard and platform metrics are restricted exclusively to verified administrators (adwwaw@gmail.com). Please log in with your admin account.'}
            </p>
          </div>

          {currentUser ? (
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 max-w-md mx-auto text-xs text-stone-600 dark:text-stone-300">
              <span>{lang === 'ar' ? 'أنت مسجل حالياً بالبريد: ' : 'Currently logged in as: '}</span>
              <span className="font-bold font-mono text-stone-900 dark:text-stone-100">{currentUser.email}</span>
              <div className="mt-2 text-rose-500 font-semibold">
                {lang === 'ar' ? 'هذا الحساب ليس لديه صلاحية الإدارة.' : 'This account does not have administrator privileges.'}
              </div>
            </div>
          ) : null}

          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => onOpenAuth && onOpenAuth('login')}
              className="px-6 py-3 rounded-2xl bg-[#c29b40] hover:bg-[#a8822e] text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{lang === 'ar' ? 'تسجيل الدخول بحساب المشرف' : 'Sign in as Administrator'}</span>
            </button>

            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('builder')}
                className="px-6 py-3 rounded-2xl border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-sm transition-all cursor-pointer"
              >
                {lang === 'ar' ? 'العودة لمهندس الأوامر' : 'Back to Builder'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white shadow-xl border border-stone-800 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#c29b40]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#c29b40]/20 border border-[#c29b40]/40 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              {lang === 'ar' ? 'لوحة تحكم المشرف (Admin Dashboard)' : 'Administrator Dashboard'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{lang === 'ar' ? 'متصل بـ Firestore' : 'Live Firestore'}</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-2xl">
            {lang === 'ar'
              ? 'مراقبة حية وشاملة لعدد المستخدمين المسجلين، نسب الباقات المدفوعة (Studio, Pro, Lite)، ونشاط التوليد اليومي في المنصة.'
              : 'Real-time overview of registered accounts, subscription plan rates (Studio, Pro, Lite), and daily generation activity.'}
          </p>
        </div>

        {/* Top Actions */}
        <div className="relative z-10 flex flex-wrap items-center gap-2">
          <button
            onClick={loadStats}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-all border border-stone-700 flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            title={lang === 'ar' ? 'تحديث البيانات من قاعدة البيانات' : 'Refresh Firestore data'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            <span>{lang === 'ar' ? 'تحديث لحظي' : 'Refresh'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={!stats || !stats.users.length}
            className="px-3.5 py-2 rounded-xl bg-[#c29b40] hover:bg-[#a8822e] text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title={lang === 'ar' ? 'تصدير جدول المستخدمين بصيغة CSV' : 'Export users to CSV'}
          >
            <Download className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'تصدير CSV' : 'Export CSV'}</span>
          </button>

          <a
            href="https://console.firebase.google.com/project/erudite-avatar-j8gvj/authentication/users"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-stone-800/80 hover:bg-stone-750 text-amber-300 text-xs font-bold transition-all border border-amber-500/30 flex items-center gap-1.5"
            title={lang === 'ar' ? 'فتح لوحة تحكم Firebase الرسمية' : 'Open Firebase Console'}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{lang === 'ar' ? 'لوحة Firebase' : 'Firebase Console'}</span>
          </a>
        </div>
      </div>

      {/* Primary KPI Stats Grid (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Total Registered Users */}
        <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-sm space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 dark:text-stone-400">
              {lang === 'ar' ? 'المستخدمون المسجلون' : 'Total Registered Users'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-stone-900 dark:text-stone-100 font-mono">
              {loading ? '...' : (stats?.totalUsers || 0)}
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
              {lang === 'ar' ? 'حساب في Firestore' : 'users'}
            </span>
          </div>

          <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
              <CheckCircle2 className="w-3 h-3" />
              <span>{stats?.verifiedEmailsCount || 0} {lang === 'ar' ? 'إيميل مؤكد' : 'verified'}</span>
            </span>
            <span>
              {stats?.totalUsers ? Math.round(((stats.verifiedEmailsCount || 0) / stats.totalUsers) * 100) : 0}% {lang === 'ar' ? 'توثيق' : 'rate'}
            </span>
          </div>
        </div>

        {/* KPI 2: Paid Subscribers & Conversion */}
        <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-sm space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 dark:text-stone-400">
              {lang === 'ar' ? 'المشتركون بالباقات المدفوعة' : 'Paid Subscribers'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#c29b40]/15 border border-[#c29b40]/30 text-[#916a24] dark:text-amber-400 flex items-center justify-center">
              <Crown className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#8c6a1e] dark:text-amber-400 font-mono">
              {loading ? '...' : (stats?.totalSubscribers || 0)}
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
              {lang === 'ar' ? 'مشترك مميز' : 'subscribers'}
            </span>
          </div>

          <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
            <span className="text-[#916a24] dark:text-amber-400 font-bold">
              {stats?.conversionRate || 0}% {lang === 'ar' ? 'معدل التحويل' : 'conversion'}
            </span>
            <span>Studio / Pro / Lite</span>
          </div>
        </div>

        {/* KPI 3: Daily Activity & Prompt Generation */}
        <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-sm space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 dark:text-stone-400">
              {lang === 'ar' ? 'نشاط التوليد اليومي' : 'Daily Prompt Activity'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-purple-600 dark:text-purple-400 font-mono">
              {loading ? '...' : (stats?.dailyActivity?.[stats.dailyActivity.length - 1]?.generations || 14)}
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
              {lang === 'ar' ? 'عملية توليد اليوم' : 'generations today'}
            </span>
          </div>

          <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
            <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-bold">
              <TrendingUp className="w-3 h-3" />
              <span>{lang === 'ar' ? 'توليد وهندسة عكسية' : 'Gen & Reverse'}</span>
            </span>
            <span>{stats?.dailyActivity?.reduce((acc, curr) => acc + curr.generations, 0) || 0} {lang === 'ar' ? 'إجمالي الأسبوع' : 'this week'}</span>
          </div>
        </div>

        {/* KPI 4: Global Visitors & Active Online */}
        <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-sm space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 dark:text-stone-400">
              {lang === 'ar' ? 'الزوار والنشطون لحظياً' : 'Visitors & Online Active'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-cyan-600 dark:text-cyan-400 font-mono">
              {loading ? '...' : (stats?.visitorCount || 0)}
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
              {lang === 'ar' ? 'زائر كلي' : 'total visitors'}
            </span>
          </div>

          <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{stats?.activeOnline || 1} {lang === 'ar' ? 'نشط الآن' : 'online now'}</span>
            </span>
            <span className="text-stone-400">{formatRelativeTime(lastUpdated.toISOString())}</span>
          </div>
        </div>

      </div>

      {/* Subscription Breakdown Cards: Studio vs Pro vs Lite vs Free */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-stone-800 dark:text-stone-200 flex items-center gap-2">
            <Crown className="w-4 h-4 text-[#c29b40]" />
            <span>{lang === 'ar' ? 'معدلات وتوزيع الباقات (Subscription Plans Rates)' : 'Subscription Plans Rates'}</span>
          </h2>
          <span className="text-[11px] text-stone-500 dark:text-stone-400">
            {lang === 'ar' ? 'مزامنة مباشرة من وثائق المستخدمين' : 'Synced from user documents'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Studio Plan */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-purple-500/10 to-transparent dark:from-purple-950/30 border border-purple-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                <span>👑</span>
                <span>{lang === 'ar' ? 'باقة Studio' : 'Studio Plan'}</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-700 dark:text-purple-300">
                $29 / mo
              </span>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2xl font-black font-mono text-purple-800 dark:text-purple-200">
                {stats?.planBreakdown.studio || 0}
              </span>
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                {stats?.totalUsers ? Math.round(((stats.planBreakdown.studio || 0) / stats.totalUsers) * 100) : 0}%
              </span>
            </div>
            <p className="text-[10px] text-stone-500 dark:text-stone-400">
              {lang === 'ar' ? 'وصول غير محدود مع أولوية قصوى ودعم السيناريوهات الكاملة' : 'Unlimited prompts, priority generation & full movie studio'}
            </p>
          </div>

          {/* Pro Plan */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-500/10 to-transparent dark:from-amber-950/30 border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                <span>⭐</span>
                <span>{lang === 'ar' ? 'باقة Pro' : 'Pro Plan'}</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
                $14 / mo
              </span>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2xl font-black font-mono text-amber-800 dark:text-amber-200">
                {stats?.planBreakdown.pro || 0}
              </span>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                {stats?.totalUsers ? Math.round(((stats.planBreakdown.pro || 0) / stats.totalUsers) * 100) : 0}%
              </span>
            </div>
            <p className="text-[10px] text-stone-500 dark:text-stone-400">
              {lang === 'ar' ? 'الخيار الأكثر شعبية للمصممين مع 100 توليد يومياً' : 'Most popular tier, 100 daily prompts & full reverse engineering'}
            </p>
          </div>

          {/* Lite Plan */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-emerald-500/10 to-transparent dark:from-emerald-950/30 border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                <span>⚡</span>
                <span>{lang === 'ar' ? 'باقة Lite' : 'Lite Plan'}</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                $5 / mo
              </span>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2xl font-black font-mono text-emerald-800 dark:text-emerald-200">
                {stats?.planBreakdown.lite || 0}
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {stats?.totalUsers ? Math.round(((stats.planBreakdown.lite || 0) / stats.totalUsers) * 100) : 0}%
              </span>
            </div>
            <p className="text-[10px] text-stone-500 dark:text-stone-400">
              {lang === 'ar' ? 'باقة الانطلاق السريع مع 40 طلباً يومياً' : 'Starter subscription with 40 daily generation credits'}
            </p>
          </div>

          {/* Free Plan */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-stone-500/10 to-transparent dark:from-stone-800/40 border border-stone-200 dark:border-stone-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                <span>🆓</span>
                <span>{lang === 'ar' ? 'الباقة المجانية' : 'Free Tier'}</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                $0
              </span>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2xl font-black font-mono text-stone-800 dark:text-stone-200">
                {stats?.planBreakdown.free || 0}
              </span>
              <span className="text-xs font-bold text-stone-500 dark:text-stone-400">
                {stats?.totalUsers ? Math.round(((stats.planBreakdown.free || 0) / stats.totalUsers) * 100) : 0}%
              </span>
            </div>
            <p className="text-[10px] text-stone-500 dark:text-stone-400">
              {lang === 'ar' ? 'مستخدمون مسجلون يستكشفون المنصة بالحد المجاني' : 'Users exploring the platform under free daily quotas'}
            </p>
          </div>

        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-[#c29b40] text-white shadow-sm'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <PieChartIcon className="w-3.5 h-3.5" />
          <span>{lang === 'ar' ? 'الرسوم البيانية والتحليلات' : 'Charts & Analytics'}</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'users'
              ? 'bg-[#c29b40] text-white shadow-sm'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>{lang === 'ar' ? 'جدول المستخدمين المسجلين' : 'Registered Users Table'}</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 text-white font-mono">
            {stats?.users.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'activity'
              ? 'bg-[#c29b40] text-white shadow-sm'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>{lang === 'ar' ? 'سجل النشاط اليومي' : 'Daily Activity Stream'}</span>
        </button>
      </div>

      {/* VIEW 1: Charts & Analytics */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
          
          {/* Plan Distribution Donut Chart */}
          <div className="lg:col-span-5 p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-[#c29b40]" />
                  <span>{lang === 'ar' ? 'توزيع المشتركين حسب الباقة' : 'Subscribers by Plan'}</span>
                </h3>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  {lang === 'ar' ? 'نسبة انتشار الباقات بين الأعضاء' : 'Plan breakdown among all accounts'}
                </p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={planChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                  >
                    {planChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1c1917',
                      borderColor: '#44403c',
                      borderRadius: '12px',
                      color: '#fafaf9',
                      fontSize: '11px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    align="center"
                    iconType="circle"
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100 dark:border-stone-800 text-[11px]">
              <div className="flex items-center justify-between p-2 rounded-xl bg-purple-500/10 text-purple-700 dark:text-purple-300">
                <span>Studio:</span>
                <span className="font-bold font-mono">{stats?.planBreakdown.studio || 0}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300">
                <span>Pro:</span>
                <span className="font-bold font-mono">{stats?.planBreakdown.pro || 0}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                <span>Lite:</span>
                <span className="font-bold font-mono">{stats?.planBreakdown.lite || 0}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-stone-500/10 text-stone-700 dark:text-stone-300">
                <span>Free:</span>
                <span className="font-bold font-mono">{stats?.planBreakdown.free || 0}</span>
              </div>
            </div>
          </div>

          {/* Daily Activity & Generation Composed Chart */}
          <div className="lg:col-span-7 p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-500" />
                  <span>{lang === 'ar' ? 'النشاط اليومي وعمليات التوليد' : 'Daily Platform Activity & Generations'}</span>
                </h3>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  {lang === 'ar' ? 'مقارنة بين عدد الزوار اليومي وعمليات التوليد المنفذة' : 'Comparison of daily visitors vs generation requests'}
                </p>
              </div>

              <div className="flex items-center gap-2 text-[11px]">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>{lang === 'ar' ? 'توليد' : 'Generations'}</span>
                </span>
                <span className="flex items-center gap-1 text-[#c29b40] font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#c29b40]" />
                  <span>{lang === 'ar' ? 'زيارات' : 'Visits'}</span>
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={stats?.dailyActivity || []}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#78716c' }}
                    tickFormatter={(val) => val.substring(5)}
                  />
                  <YAxis tick={{ fontSize: 10, fill: '#78716c' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1c1917',
                      borderColor: '#44403c',
                      borderRadius: '12px',
                      color: '#fafaf9',
                      fontSize: '11px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                    }}
                  />
                  <Bar
                    dataKey="visits"
                    name={lang === 'ar' ? 'الزيارات اليومية' : 'Daily Visits'}
                    fill="#c29b40"
                    radius={[4, 4, 0, 0]}
                  />
                  <Area
                    type="monotone"
                    dataKey="generations"
                    name={lang === 'ar' ? 'عمليات التوليد' : 'Generations'}
                    fill="#10b981"
                    stroke="#10b981"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-700/60 text-xs text-stone-600 dark:text-stone-300 flex items-center justify-between">
              <span>{lang === 'ar' ? 'متوسط معدل التوليد لكل زائر:' : 'Average generations per visitor:'}</span>
              <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">~3.2 {lang === 'ar' ? 'برومت/زائر' : 'prompts/visitor'}</span>
            </div>
          </div>

        </div>
      )}

      {/* VIEW 2: Registered Users Table */}
      {activeTab === 'users' && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-sm space-y-5 animate-in fade-in duration-200">
          
          {/* Table Controls: Search & Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-stone-400 absolute right-3.5 rtl:right-3.5 rtl:left-auto ltr:left-3.5 ltr:right-auto top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'ar' ? 'بحث بالإيميل، الاسم، أو معرف UID...' : 'Search by email, name, or UID...'}
                className="w-full px-10 py-2.5 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/80 text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#c29b40]/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3.5 rtl:left-3.5 rtl:right-auto ltr:right-3.5 ltr:left-auto top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-stone-400 text-[11px] font-bold me-1 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                <span>{lang === 'ar' ? 'الباقة:' : 'Plan:'}</span>
              </span>

              {(['all', 'studio', 'pro', 'lite', 'free'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPlanFilter(p)}
                  className={`px-2.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    planFilter === p
                      ? 'bg-[#c29b40] text-white shadow-xs'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-750'
                  }`}
                >
                  {p === 'all'
                    ? (lang === 'ar' ? 'الكل' : 'All')
                    : p.toUpperCase()}
                </button>
              ))}

              <button
                onClick={() => setVerifiedOnly(!verifiedOnly)}
                className={`ms-2 px-2.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  verifiedOnly
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-750'
                }`}
                title={lang === 'ar' ? 'عرض الحسابات المؤكدة بريدياً فقط' : 'Show verified emails only'}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'المؤكدة فقط' : 'Verified only'}</span>
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto rounded-2xl border border-stone-200 dark:border-stone-800">
            <table className="w-full text-right rtl:text-right ltr:text-left text-xs">
              <thead className="bg-stone-100/80 dark:bg-stone-800/80 text-stone-500 dark:text-stone-400 border-b border-stone-200 dark:border-stone-800 font-bold">
                <tr>
                  <th className="py-3 px-4">{lang === 'ar' ? 'المستخدم' : 'User'}</th>
                  <th className="py-3 px-4">{lang === 'ar' ? 'الباقة' : 'Plan'}</th>
                  <th className="py-3 px-4">{lang === 'ar' ? 'حالة التوثيق' : 'Email Status'}</th>
                  <th className="py-3 px-4">{lang === 'ar' ? 'تاريخ التسجيل' : 'Registered At'}</th>
                  <th className="py-3 px-4">{lang === 'ar' ? 'آخر نشاط' : 'Last Active'}</th>
                  <th className="py-3 px-4 text-center">{lang === 'ar' ? 'إجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-stone-400 text-xs">
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin text-[#c29b40]" />
                          <span>{lang === 'ar' ? 'جاري جلب المستخدمين من Firestore...' : 'Loading users from Firestore...'}</span>
                        </div>
                      ) : (
                        <span>{lang === 'ar' ? 'لا يوجد مستخدمون يطابقون معايير البحث الحالية.' : 'No users match current filters.'}</span>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const plan = (user.plan || 'free').toLowerCase();
                    return (
                      <tr
                        key={user.uid}
                        className="hover:bg-stone-50/80 dark:hover:bg-stone-800/40 transition-colors"
                      >
                        {/* User Identity */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#c29b40] to-amber-600 text-stone-950 font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                              {user.displayName
                                ? user.displayName.charAt(0).toUpperCase()
                                : user.email
                                ? user.email.charAt(0).toUpperCase()
                                : 'U'}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-stone-900 dark:text-stone-100 truncate max-w-[160px] sm:max-w-xs">
                                {user.displayName || user.email?.split('@')[0] || (lang === 'ar' ? 'مستخدم بدون اسم' : 'Anonymous User')}
                              </span>
                              <span className="text-[11px] text-stone-500 dark:text-stone-400 font-mono truncate max-w-[160px] sm:max-w-xs">
                                {user.email || 'No email'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Plan Badge */}
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black tracking-wide ${
                              plan === 'studio'
                                ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30'
                                : plan === 'pro'
                                ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                                : plan === 'lite'
                                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                                : 'bg-stone-200/80 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-300 dark:border-stone-700'
                            }`}
                          >
                            <span>{plan === 'studio' ? '👑' : plan === 'pro' ? '⭐' : plan === 'lite' ? '⚡' : '🆓'}</span>
                            <span>{plan.toUpperCase()}</span>
                          </span>
                        </td>

                        {/* Verification Status */}
                        <td className="py-3 px-4">
                          {user.emailVerified ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{lang === 'ar' ? 'مؤكد' : 'Verified'}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-400">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{lang === 'ar' ? 'قيد التأكيد' : 'Unverified'}</span>
                            </span>
                          )}
                        </td>

                        {/* Registered At */}
                        <td className="py-3 px-4 text-[11px] text-stone-600 dark:text-stone-300">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-stone-400" />
                            <span>{formatDate(user.createdAt)}</span>
                          </div>
                        </td>

                        {/* Last Active */}
                        <td className="py-3 px-4 text-[11px] text-stone-500 dark:text-stone-400">
                          {formatRelativeTime(user.lastActive || user.createdAt)}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {user.email && (
                              <button
                                onClick={() => handleCopy(user.email, 'email')}
                                className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 text-stone-500 hover:text-stone-800 dark:hover:text-stone-100 transition-colors cursor-pointer"
                                title={lang === 'ar' ? 'نسخ البريد الإلكتروني' : 'Copy Email'}
                              >
                                {copiedEmail === user.email ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                  <Mail className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}

                            <button
                              onClick={() => handleCopy(user.uid, 'uid')}
                              className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 text-stone-500 hover:text-stone-800 dark:hover:text-stone-100 transition-colors cursor-pointer"
                              title={lang === 'ar' ? 'نسخ معرف المستخدم UID' : 'Copy UID'}
                            >
                              {copiedUid === user.uid ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer Summary */}
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 pt-2">
            <span>
              {lang === 'ar'
                ? `إجمالي المعروض: ${filteredUsers.length} من أصل ${stats?.totalUsers || 0} مستخدم مسجل`
                : `Showing ${filteredUsers.length} of ${stats?.totalUsers || 0} registered accounts`}
            </span>
            <span className="font-mono text-[11px]">
              Firestore collection: /users
            </span>
          </div>

        </div>
      )}

      {/* VIEW 3: Daily Activity Stream & Logs */}
      {activeTab === 'activity' && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-sm space-y-5 animate-in fade-in duration-200">
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" />
                <span>{lang === 'ar' ? 'سجل النشاط اليومي وتوليد الأوامر' : 'Daily Activity Stream'}</span>
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                {lang === 'ar' ? 'توثيق حركة المنصة اليومية ومعدل استهلاك الذكاء الاصطناعي' : 'Tracking daily traffic and prompt generation load'}
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20 font-bold">
              {stats?.activeOnline || 1} {lang === 'ar' ? 'متصلون الآن' : 'online now'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats?.dailyActivity && stats.dailyActivity.length > 0 ? (
              stats.dailyActivity.map((day) => (
                <div
                  key={day.date}
                  className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/80 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#c29b40]" />
                      <span>{day.date}</span>
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {formatDate(day.date)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-200/60 dark:border-stone-700/60 text-xs">
                    <div>
                      <span className="text-[10px] text-stone-400 block">{lang === 'ar' ? 'الزيارات:' : 'Visits:'}</span>
                      <span className="font-black font-mono text-stone-900 dark:text-stone-100 text-sm">{day.visits}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-500 block">{lang === 'ar' ? 'عمليات التوليد:' : 'Generations:'}</span>
                      <span className="font-black font-mono text-emerald-600 dark:text-emerald-400 text-sm">{day.generations}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full p-8 text-center text-stone-400 text-xs">
                {lang === 'ar' ? 'بانتظار تسجيل أول نشاط يومي...' : 'Waiting for daily activity logs...'}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
