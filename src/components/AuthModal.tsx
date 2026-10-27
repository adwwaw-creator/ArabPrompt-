/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  User as UserIcon,
  CheckCircle,
  AlertCircle,
  Loader2,
  LogOut,
  Sparkles,
  Cloud,
  ShieldCheck,
  BarChart3,
  Crown,
  Activity,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  KeyRound,
  Send
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  googleSignIn,
  emailSignIn,
  emailSignUp,
  resetPassword,
  resendVerificationEmail,
  getAuthErrorMessage
} from '../utils/firebaseAuth';
import { AppLanguage } from '../types';
import { getSubscription, PLAN_LIMITS, SubscriptionPlan } from '../utils/subscriptionService';
import ApiUsageMonitor from './ApiUsageMonitor';

export type AuthMode = 'login' | 'signup' | 'profile' | 'usage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: AppLanguage;
  currentUser: User | null;
  initialMode?: AuthMode;
  isMandatory?: boolean;
  onAuthSuccess?: (user: User) => void;
  onLogout?: () => void;
  onOpenApiDashboard?: () => void;
  onOpenCheckout?: (plan?: SubscriptionPlan) => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  lang,
  currentUser,
  initialMode = 'usage',
  isMandatory: customIsMandatory,
  onAuthSuccess,
  onLogout,
  onOpenApiDashboard,
  onOpenCheckout
}: AuthModalProps) {
  const isMandatory = customIsMandatory !== undefined ? customIsMandatory : !currentUser;

  const [activeTab, setActiveTab] = useState<'usage' | 'profile' | 'plans'>(
    initialMode === 'login' || initialMode === 'signup' || initialMode === 'profile' ? 'profile' : 'usage'
  );

  // Email Auth sub-state: 'login' | 'signup' | 'forgot'
  const [authSubMode, setAuthSubMode] = useState<'login' | 'signup' | 'forgot'>(
    initialMode === 'signup' ? 'signup' : 'login'
  );

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status States
  const [isLoading, setIsLoading] = useState(false);
  const [errorInfo, setErrorInfo] = useState<{ title: string; message: string } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);

  const sub = getSubscription();

  // Reset tab and mode when modal opens or initialMode changes
  useEffect(() => {
    if (isOpen) {
      setErrorInfo(null);
      setSuccessMessage(null);
      if (initialMode === 'usage') {
        setActiveTab('usage');
      } else if (initialMode === 'signup') {
        setActiveTab('profile');
        setAuthSubMode('signup');
      } else {
        setActiveTab('profile');
        setAuthSubMode('login');
      }
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  // Google Sign-In Handler
  const handleGoogleSubmit = async () => {
    setIsLoading(true);
    setErrorInfo(null);
    setSuccessMessage(null);
    try {
      const result = await googleSignIn();
      if (result?.user) {
        if (onAuthSuccess) onAuthSuccess(result.user);
        setActiveTab('usage');
      }
    } catch (err: any) {
      console.error('Google sign in error:', err);
      const friendly = getAuthErrorMessage(err, lang);
      setErrorInfo(friendly);
    } finally {
      setIsLoading(false);
    }
  };

  // Email Sign-Up Handler
  const handleEmailSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorInfo(null);
    setSuccessMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorInfo({
        title: lang === 'ar' ? 'البريد الإلكتروني مطلوب' : 'Email Required',
        message: lang === 'ar' ? 'يرجى إدخال عنوان البريد الإلكتروني.' : 'Please enter your email address.'
      });
      return;
    }

    if (!password || password.length < 6) {
      setErrorInfo({
        title: lang === 'ar' ? 'كلمة المرور قصيرة' : 'Password Too Short',
        message: lang === 'ar' ? 'يجب أن تتكون كلمة المرور من 6 أحرف أو أرقام على الأقل.' : 'Password must be at least 6 characters.'
      });
      return;
    }

    if (password !== confirmPassword) {
      setErrorInfo({
        title: lang === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords Do Not Match',
        message: lang === 'ar' ? 'يرجى التأكد من تطابق كلمة المرور وتأكيدها.' : 'Please ensure password and confirm password match.'
      });
      return;
    }

    setIsLoading(true);
    try {
      const newUser = await emailSignUp(trimmedEmail, password, name.trim());
      setSuccessMessage(
        lang === 'ar'
          ? 'تم إنشاء الحساب بنجاح! تم إرسال رابط تأكيد إلى بريدك الإلكتروني.'
          : 'Account created successfully! A verification email has been sent.'
      );
      if (onAuthSuccess) {
        onAuthSuccess(newUser);
      }
      setTimeout(() => {
        setActiveTab('usage');
      }, 1400);
    } catch (err: any) {
      console.error('Email sign up error:', err);
      const friendly = getAuthErrorMessage(err, lang);
      setErrorInfo(friendly);
    } finally {
      setIsLoading(false);
    }
  };

  // Email Sign-In Handler
  const handleEmailSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorInfo(null);
    setSuccessMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setErrorInfo({
        title: lang === 'ar' ? 'بيانات ناقصة' : 'Missing Credentials',
        message: lang === 'ar' ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور.' : 'Please enter both email and password.'
      });
      return;
    }

    setIsLoading(true);
    try {
      const signedInUser = await emailSignIn(trimmedEmail, password);
      setSuccessMessage(
        lang === 'ar' ? 'تم تسجيل الدخول بنجاح!' : 'Signed in successfully!'
      );
      if (onAuthSuccess) {
        onAuthSuccess(signedInUser);
      }
      setTimeout(() => {
        setActiveTab('usage');
      }, 800);
    } catch (err: any) {
      console.error('Email sign in error:', err);
      const friendly = getAuthErrorMessage(err, lang);
      setErrorInfo(friendly);
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot Password Handler
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorInfo(null);
    setSuccessMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorInfo({
        title: lang === 'ar' ? 'البريد الإلكتروني مطلوب' : 'Email Required',
        message: lang === 'ar' ? 'يرجى كتابة بريدك الإلكتروني لنتمكن من إرسال رابط الاستعادة.' : 'Please enter your email to receive the reset link.'
      });
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(trimmedEmail);
      setSuccessMessage(
        lang === 'ar'
          ? 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني. يرجى مراجعة صندوق الوارد والبريد غير الهام (Spam).'
          : 'Password reset link sent to your email. Please check your inbox and spam folder.'
      );
    } catch (err: any) {
      console.error('Password reset error:', err);
      const friendly = getAuthErrorMessage(err, lang);
      setErrorInfo(friendly);
    } finally {
      setIsLoading(false);
    }
  };

  // Resend Email Verification Handler
  const handleResendVerification = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    setErrorInfo(null);
    try {
      await resendVerificationEmail(currentUser);
      setVerificationSent(true);
      setSuccessMessage(
        lang === 'ar'
          ? 'تمت إعادة إرسال رابط التحقق إلى بريدك الإلكتروني.'
          : 'Verification link has been resent to your email.'
      );
    } catch (err: any) {
      const friendly = getAuthErrorMessage(err, lang);
      setErrorInfo(friendly);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/75 backdrop-blur-xs animate-fade-in"
      onClick={() => {
        if (!isMandatory) onClose();
      }}
    >
      <div
        className="relative w-full max-w-md sm:max-w-lg bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-3xl shadow-2xl overflow-hidden transition-all text-stone-850 dark:text-stone-100 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
      >
        {/* Modal Top Header */}
        <div className="relative px-5 pt-4 pb-3 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#916a24] via-[#c29b40] to-[#ecd197] flex items-center justify-center text-white shadow-sm ring-2 ring-[#c29b40]/20">
              {currentUser ? <Activity className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-tight text-stone-900 dark:text-stone-50 font-sans">
                {currentUser
                  ? (lang === 'ar' ? 'لوحة تحكم الحساب والاستهلاك' : 'Account & Quota Dashboard')
                  : (authSubMode === 'signup'
                      ? (lang === 'ar' ? '🔒 إنشاء حساب بالإيميل (إلزامي)' : '🔒 Register with Email (Required)')
                      : (lang === 'ar' ? '🔒 تسجيل الدخول بالإيميل (إلزامي)' : '🔒 Sign In with Email (Required)'))}
              </h2>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium truncate max-w-[240px] sm:max-w-[320px]">
                {currentUser 
                  ? (lang === 'ar' ? `مرحباً، ${currentUser.displayName || currentUser.email}` : `Welcome, ${currentUser.displayName || currentUser.email}`)
                  : (lang === 'ar' ? 'تسجيل الدخول إلزامي للوصول إلى المنصة والمولدات' : 'Sign in is required to access tools & builders')}
              </p>
            </div>
          </div>

          {isMandatory ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[#916a24] dark:text-amber-400 text-[11px] font-bold select-none">
              <Lock className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'دخول إلزامي' : 'Required'}</span>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
              title={lang === 'ar' ? 'إغلاق' : 'Close'}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dashboard Navigation Tabs */}
        {currentUser ? (
          <div className="flex border-b border-stone-100 dark:border-stone-800 px-4 sm:px-5 pt-1.5 bg-stone-50/70 dark:bg-stone-900/70 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-1.5 py-2 px-3 border-b-2 text-xs font-black transition cursor-pointer ${
                activeTab === 'profile'
                  ? 'border-[#c29b40] text-[#916a24] dark:text-amber-400'
                  : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'الملف الشخصي' : 'Profile'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('usage')}
              className={`flex items-center gap-1.5 py-2 px-3 border-b-2 text-xs font-black transition cursor-pointer ${
                activeTab === 'usage'
                  ? 'border-[#c29b40] text-[#916a24] dark:text-amber-400'
                  : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'مراقبة الرصيد' : 'Usage & Quota'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('plans')}
              className={`flex items-center gap-1.5 py-2 px-3 border-b-2 text-xs font-black transition cursor-pointer ${
                activeTab === 'plans'
                  ? 'border-[#c29b40] text-[#916a24] dark:text-amber-400'
                  : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-amber-500" />
              <span>{lang === 'ar' ? 'الباقات والترقية' : 'Plans & Upgrade'}</span>
            </button>
          </div>
        ) : (
          <div className="px-5 py-2 bg-amber-500/10 border-b border-amber-500/20 text-[11px] font-bold text-amber-900 dark:text-amber-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#c29b40]" />
              <span>{lang === 'ar' ? 'يرجى تسجيل الدخول أو إنشاء حساب بالبريد للمتابعة' : 'Please register or sign in with email to continue'}</span>
            </span>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* Error Banner */}
          {errorInfo && (
            <div className="p-3 sm:p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-200 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">{errorInfo.title}</div>
                <div className="text-[11px] text-rose-600 dark:text-rose-300 mt-0.5 leading-relaxed">{errorInfo.message}</div>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="p-3 sm:p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-200">
              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-[11px] font-bold leading-relaxed">{successMessage}</div>
            </div>
          )}

          {/* TAB 1: PROFILE & AUTHENTICATION */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              {currentUser ? (
                /* Authenticated User Profile View */
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-700/80 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#c29b40]/15 border border-[#c29b40]/30 flex items-center justify-center text-lg font-black text-[#9c7524] dark:text-amber-400 shrink-0">
                      {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : (currentUser.email ? currentUser.email.charAt(0).toUpperCase() : 'U')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-sm text-stone-900 dark:text-stone-100 truncate">
                        {currentUser.displayName || (lang === 'ar' ? 'مستخدم عرب برومبت' : 'ArabPrompt User')}
                      </div>
                      <div className="text-xs text-stone-500 dark:text-stone-400 truncate">
                        {currentUser.email}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-1">
                          <CheckCircle className="w-2.5 h-2.5" />
                          <span>{lang === 'ar' ? 'متصل بالمزامنة السحابية' : 'Cloud Sync Active'}</span>
                        </span>
                        {currentUser.emailVerified ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-bold">
                            {lang === 'ar' ? 'بريد موثق ✓' : 'Verified Email'}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleResendVerification}
                            disabled={isLoading || verificationSent}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold hover:underline cursor-pointer"
                          >
                            {verificationSent
                              ? (lang === 'ar' ? 'تم إرسال رابط التوثيق' : 'Verification Sent')
                              : (lang === 'ar' ? 'اضغط لتوثيق البريد' : 'Verify Email')}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/70 dark:border-stone-700/60 text-xs space-y-1.5 text-stone-600 dark:text-stone-300">
                    <div className="font-bold text-stone-850 dark:text-stone-100 flex items-center gap-1.5">
                      <Cloud className="w-4 h-4 text-[#c29b40]" />
                      <span>{lang === 'ar' ? 'بيانات المزامنة السحابية:' : 'Cloud Sync Info:'}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      {lang === 'ar'
                        ? 'يتم حفظ وتحديث مسوداتك وأوامرك تلقائياً وبشكل مشفر في قاعدة بياناتك السحابية الخاصة مع كل عملية توليد أو تعديل.'
                        : 'Your prompts and drafts are automatically synced securely with Firestore upon each generation.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (onLogout) onLogout();
                      onClose();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 hover:bg-rose-100 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-600" />
                    <span>{lang === 'ar' ? 'تسجيل الخروج من الحساب' : 'Sign Out'}</span>
                  </button>
                </div>
              ) : (
                /* Unauthenticated View: Sign Up / Sign In Forms */
                <div className="space-y-4">
                  {/* Mode Switcher Buttons */}
                  <div className="grid grid-cols-2 p-1 bg-stone-100 dark:bg-stone-800 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthSubMode('signup');
                        setErrorInfo(null);
                        setSuccessMessage(null);
                      }}
                      className={`py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        authSubMode === 'signup'
                          ? 'bg-white dark:bg-stone-700 text-[#916a24] dark:text-amber-400 shadow-xs'
                          : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                      }`}
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>{lang === 'ar' ? 'تسجيل جديد بالإيميل' : 'Register with Email'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAuthSubMode('login');
                        setErrorInfo(null);
                        setSuccessMessage(null);
                      }}
                      className={`py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        authSubMode === 'login' || authSubMode === 'forgot'
                          ? 'bg-white dark:bg-stone-700 text-[#916a24] dark:text-amber-400 shadow-xs'
                          : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                      }`}
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>{lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}</span>
                    </button>
                  </div>

                  {/* FORM 1: EMAIL SIGN-UP */}
                  {authSubMode === 'signup' && (
                    <form onSubmit={handleEmailSignUpSubmit} className="space-y-3">
                      {/* Name Field */}
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                          {lang === 'ar' ? 'الاسم الكامل (اختياري)' : 'Full Name (Optional)'}
                        </label>
                        <div className="relative">
                          <UserIcon className="w-4 h-4 text-stone-400 absolute top-3 start-3 pointer-events-none" />
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={lang === 'ar' ? 'مثال: أحمد محمد' : 'e.g. John Doe'}
                            className="w-full ps-9 pe-3 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-[#c29b40]/50"
                          />
                        </div>
                      </div>

                      {/* Email Field */}
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                          {lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'} <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-stone-400 absolute top-3 start-3 pointer-events-none" />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={lang === 'ar' ? 'name@example.com' : 'name@example.com'}
                            dir="ltr"
                            className="w-full ps-9 pe-3 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-[#c29b40]/50"
                          />
                        </div>
                      </div>

                      {/* Password Field */}
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                          {lang === 'ar' ? 'كلمة المرور' : 'Password'} <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-stone-400 absolute top-3 start-3 pointer-events-none" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={lang === 'ar' ? '6 أحرف أو أرقام على الأقل' : 'At least 6 characters'}
                            dir="ltr"
                            className="w-full ps-9 pe-9 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-[#c29b40]/50"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute top-2.5 end-3 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Confirm Password Field */}
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                          {lang === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'} <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-stone-400 absolute top-3 start-3 pointer-events-none" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            minLength={6}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder={lang === 'ar' ? 'أعد كتابة كلمة المرور' : 'Re-enter password'}
                            dir="ltr"
                            className="w-full ps-9 pe-3 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-[#c29b40]/50"
                          />
                        </div>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#916a24] via-[#c29b40] to-[#b38a32] text-white font-black text-xs flex items-center justify-center gap-2 hover:opacity-95 transition shadow-sm cursor-pointer disabled:opacity-60"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4" />
                            <span>{lang === 'ar' ? 'إنشاء حساب جديد مجاناً' : 'Create Free Account'}</span>
                          </>
                        )}
                      </button>

                      <div className="text-[10px] text-center text-stone-500 dark:text-stone-400 pt-1">
                        {lang === 'ar' ? 'بالتسجيل أنت توافق على شروط الاستخدام وحفظ مسوداتك بأمان.' : 'By signing up, you agree to secure encrypted cloud sync.'}
                      </div>
                    </form>
                  )}

                  {/* FORM 2: EMAIL SIGN-IN */}
                  {authSubMode === 'login' && (
                    <form onSubmit={handleEmailSignInSubmit} className="space-y-3">
                      {/* Email Field */}
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                          {lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-stone-400 absolute top-3 start-3 pointer-events-none" />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            dir="ltr"
                            className="w-full ps-9 pe-3 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-[#c29b40]/50"
                          />
                        </div>
                      </div>

                      {/* Password Field */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300">
                            {lang === 'ar' ? 'كلمة المرور' : 'Password'}
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setAuthSubMode('forgot');
                              setErrorInfo(null);
                              setSuccessMessage(null);
                            }}
                            className="text-[10px] text-[#916a24] dark:text-amber-400 hover:underline font-bold cursor-pointer"
                          >
                            {lang === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-stone-400 absolute top-3 start-3 pointer-events-none" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            dir="ltr"
                            className="w-full ps-9 pe-9 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-[#c29b40]/50"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute top-2.5 end-3 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#916a24] via-[#c29b40] to-[#b38a32] text-white font-black text-xs flex items-center justify-center gap-2 hover:opacity-95 transition shadow-sm cursor-pointer disabled:opacity-60"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <LogIn className="w-4 h-4" />
                            <span>{lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}

                  {/* FORM 3: FORGOT PASSWORD */}
                  {authSubMode === 'forgot' && (
                    <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
                      <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800 text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed">
                        {lang === 'ar'
                          ? 'أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور فوراً.'
                          : 'Enter your email address and we will immediately send you a password reset link.'}
                      </div>

                      {/* Email Field */}
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                          {lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-stone-400 absolute top-3 start-3 pointer-events-none" />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            dir="ltr"
                            className="w-full ps-9 pe-3 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-[#c29b40]/50"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setAuthSubMode('login');
                            setErrorInfo(null);
                          }}
                          className="w-1/3 py-2.5 px-3 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer"
                        >
                          {lang === 'ar' ? 'العودة' : 'Back'}
                        </button>

                        <button
                          type="submit"
                          disabled={isLoading}
                          className="flex-1 py-2.5 px-4 rounded-xl bg-[#c29b40] text-white font-black text-xs flex items-center justify-center gap-2 hover:opacity-95 transition shadow-sm cursor-pointer disabled:opacity-60"
                        >
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              <span>{lang === 'ar' ? 'إرسال رابط الاستعادة' : 'Send Reset Link'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* DIVIDER */}
                  <div className="relative flex items-center justify-center my-3">
                    <div className="border-t border-stone-200 dark:border-stone-700 w-full" />
                    <span className="bg-white dark:bg-stone-900 px-3 text-[10px] font-bold text-stone-400 uppercase tracking-wider shrink-0">
                      {lang === 'ar' ? 'أو المتابعة السريعة' : 'Or quick continue'}
                    </span>
                  </div>

                  {/* Google Sign In Button */}
                  <button
                    type="button"
                    onClick={handleGoogleSubmit}
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 rounded-xl border border-stone-200 dark:border-stone-700 bg-white hover:bg-stone-50 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-850 dark:text-stone-100 font-bold text-xs flex items-center justify-center gap-2.5 transition cursor-pointer shadow-xs hover:border-[#c29b40]/50 disabled:opacity-60"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#c29b40]" />
                    ) : (
                      <>
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                        <span>{lang === 'ar' ? 'المتابعة بضغطة واحدة بحساب Google' : 'Continue with Google Account'}</span>
                      </>
                    )}
                  </button>

                  {/* Informative notice */}
                  <div className={`p-3 rounded-2xl ${isMandatory ? 'bg-amber-500/10 border-amber-500/30' : 'bg-[#c29b40]/10 border-[#c29b40]/20'} border text-[11px] text-stone-700 dark:text-stone-300 leading-relaxed space-y-1`}>
                    <div className="font-bold flex items-center gap-1.5 text-stone-900 dark:text-stone-100">
                      <Lock className="w-3.5 h-3.5 text-[#c29b40]" />
                      <span>{lang === 'ar' ? 'تسجيل الدخول إلزامي للاستخدام' : 'Mandatory Email Access'}</span>
                    </div>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400">
                      {lang === 'ar'
                        ? 'يتطلب استخدام منصة عرب برومبت ومولدات الذكاء الاصطناعي إنشاء حساب أو تسجيل الدخول بالبريد الإلكتروني لحفظ أعمالك بأمان.'
                        : 'Accessing ArabPrompt and AI prompt generators requires an email account to safeguard your data and projects.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: REAL-TIME API USAGE MONITOR */}
          {activeTab === 'usage' && (
            <div className="space-y-4">
              <ApiUsageMonitor
                lang={lang}
                subscription={sub}
                onOpenCheckout={(plan) => {
                  onClose();
                  if (onOpenCheckout) onOpenCheckout(plan);
                }}
              />

              {/* Admin API Cost Analytics Access */}
              {Boolean(currentUser?.email && ['adwwaw@gmail.com', 'adouaourachid@gmail.com'].includes(currentUser.email.toLowerCase().trim())) && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onOpenApiDashboard) onOpenApiDashboard();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl border border-[#c29b40]/30 bg-[#c29b40]/10 hover:bg-[#c29b40]/20 text-[#916a24] dark:text-amber-400 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <BarChart3 className="w-4 h-4 text-[#c29b40]" />
                    <span>{lang === 'ar' ? '📊 لوحة تحليلات تكاليف الـ API المتقدمة' : '📊 Advanced API Cost & Token Analytics'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PLANS & UPGRADE */}
          {activeTab === 'plans' && (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#c29b40]/15 to-amber-500/10 border border-[#c29b40]/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 block">
                    {lang === 'ar' ? 'باقتك الحالية:' : 'Current Plan:'}
                  </span>
                  <div className="text-sm font-black text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <Crown className="w-4 h-4 text-[#c29b40]" />
                    <span>{PLAN_LIMITS[sub.plan].nameAr}</span>
                  </div>
                </div>

                <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold ${
                  sub.plan !== 'free'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                }`}>
                  {sub.plan !== 'free' ? (lang === 'ar' ? 'اشتراك نشط ⭐' : 'Active Plan') : (lang === 'ar' ? 'مجاني' : 'Free')}
                </span>
              </div>

              {/* Quick Plan Choices */}
              <div className="space-y-2 pt-1">
                {/* Lite Option */}
                <div className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                  sub.plan === 'lite' 
                    ? 'border-[#c29b40] bg-[#c29b40]/10 ring-1 ring-[#c29b40]' 
                    : 'border-stone-200 dark:border-stone-800 hover:border-[#c29b40]/50 bg-white dark:bg-stone-900'
                }`}>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-stone-900 dark:text-stone-100">
                        {PLAN_LIMITS.lite.nameAr}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 font-bold">
                        {lang === 'ar' ? 'أرخص باقة ⚡' : 'Best Value'}
                      </span>
                    </div>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400">
                      {lang === 'ar' ? '100 طلب/يوم + هندسة عكسية + تصدير PDF' : '100 prompts/day + Reverse + PDF Export'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-black text-stone-900 dark:text-stone-100">
                      $5<span className="text-[9px] font-normal text-stone-400">/شهر</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onOpenCheckout) onOpenCheckout('lite');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#916a24] to-[#c29b40] text-white text-[10px] font-black hover:opacity-95 cursor-pointer"
                    >
                      {sub.plan === 'lite' ? (lang === 'ar' ? 'باقتك الحالية' : 'Current') : (lang === 'ar' ? 'اختيار' : 'Select')}
                    </button>
                  </div>
                </div>

                {/* Pro Option */}
                <div className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                  sub.plan === 'pro' 
                    ? 'border-[#c29b40] bg-[#c29b40]/10 ring-1 ring-[#c29b40]' 
                    : 'border-stone-200 dark:border-stone-800 hover:border-[#c29b40]/50 bg-white dark:bg-stone-900'
                }`}>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-stone-900 dark:text-stone-100">
                        {PLAN_LIMITS.pro.nameAr}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 font-bold">
                        {lang === 'ar' ? 'غير محدود ⭐' : 'Unlimited'}
                      </span>
                    </div>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400">
                      {lang === 'ar' ? 'طلبات غير محدودة + تثبيت الوجوه والشخصيات' : 'Unlimited prompts + Face Anchor'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-black text-stone-900 dark:text-stone-100">
                      $7<span className="text-[9px] font-normal text-stone-400">/شهر</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onOpenCheckout) onOpenCheckout('pro');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#c29b40] text-white text-[10px] font-black hover:opacity-95 cursor-pointer"
                    >
                      {sub.plan === 'pro' ? (lang === 'ar' ? 'باقتك الحالية' : 'Current') : (lang === 'ar' ? 'اختيار' : 'Select')}
                    </button>
                  </div>
                </div>

                {/* Studio Option */}
                <div className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                  sub.plan === 'studio' 
                    ? 'border-[#c29b40] bg-[#c29b40]/10 ring-1 ring-[#c29b40]' 
                    : 'border-stone-200 dark:border-stone-800 hover:border-[#c29b40]/50 bg-white dark:bg-stone-900'
                }`}>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-stone-900 dark:text-stone-100">
                        {PLAN_LIMITS.studio.nameAr}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 font-bold">
                        {lang === 'ar' ? 'مفتاح API خاص' : 'REST API Key'}
                      </span>
                    </div>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400">
                      {lang === 'ar' ? 'استوديو كامل + تكامل برمجي مباشر' : 'Full studio + API endpoint integration'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-black text-stone-900 dark:text-stone-100">
                      $24<span className="text-[9px] font-normal text-stone-400">/شهر</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onOpenCheckout) onOpenCheckout('studio');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 text-[10px] font-black hover:opacity-95 cursor-pointer"
                    >
                      {sub.plan === 'studio' ? (lang === 'ar' ? 'باقتك الحالية' : 'Current') : (lang === 'ar' ? 'اختيار' : 'Select')}
                    </button>
                  </div>
                </div>
              </div>

              {sub.plan !== 'free' && (
                <div className="pt-2 text-center">
                  <p className="text-[11px] text-stone-500">
                    {lang === 'ar' 
                      ? `ينتهي اشتراكك الحالي أو يتجدد في: ${new Date(sub.renewalDate).toLocaleDateString('ar-EG')}` 
                      : `Renewal date: ${new Date(sub.renewalDate).toLocaleDateString()}`}
                  </p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
