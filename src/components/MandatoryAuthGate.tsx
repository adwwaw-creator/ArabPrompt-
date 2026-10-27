/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  User as UserIcon,
  UserPlus,
  LogIn,
  KeyRound,
  Send,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Loader2,
  Globe,
  ArrowRight
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  googleSignIn,
  googleSignInRedirect,
  emailSignIn,
  emailSignUp,
  resetPassword,
  getAuthErrorMessage,
  AuthErrorMessageResult,
  isMobileDevice
} from '../utils/firebaseAuth';
import { AppLanguage, SUPPORTED_LANGUAGES } from '../types';

interface MandatoryAuthGateProps {
  lang: AppLanguage;
  onSetLang: (lang: AppLanguage) => void;
  onAuthSuccess: (user: User) => void;
}

export default function MandatoryAuthGate({
  lang,
  onSetLang,
  onAuthSuccess
}: MandatoryAuthGateProps) {
  const [subMode, setSubMode] = useState<'login' | 'signup' | 'forgot'>('login');
  
  // Pre-fill email if previously entered or saved
  const [email, setEmail] = useState(() => {
    try {
      return localStorage.getItem('arabprompt_remembered_email') || '';
    } catch {
      return '';
    }
  });

  // Form fields
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status
  const [isLoading, setIsLoading] = useState(false);
  const [errorInfo, setErrorInfo] = useState<AuthErrorMessageResult | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Email Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorInfo(null);
    setSuccessMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setErrorInfo({
        title: lang === 'ar' ? 'بيانات ناقصة' : 'Missing Credentials',
        message: lang === 'ar' ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور للمتابعة.' : 'Please enter your email and password.'
      });
      return;
    }

    setIsLoading(true);
    try {
      const user = await emailSignIn(trimmedEmail, password);
      try {
        localStorage.setItem('arabprompt_remembered_email', trimmedEmail);
      } catch (e) {
        // ignore
      }
      setSuccessMessage(lang === 'ar' ? 'تم تسجيل الدخول بنجاح! جاري تحويلك...' : 'Signed in successfully! Redirecting...');
      setTimeout(() => {
        onAuthSuccess(user);
      }, 500);
    } catch (err: any) {
      console.error('Email sign-in failed:', err);
      const friendly = getAuthErrorMessage(err, lang);
      setErrorInfo(friendly);
    } finally {
      setIsLoading(false);
    }
  };

  // Email Sign Up
  const handleSignUp = async (e: React.FormEvent) => {
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
        message: lang === 'ar' ? 'يجب ألا تقل كلمة المرور عن 6 أحرف أو أرقام.' : 'Password must be at least 6 characters.'
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
      const user = await emailSignUp(trimmedEmail, password, name.trim());
      try {
        localStorage.setItem('arabprompt_remembered_email', trimmedEmail);
      } catch (e) {
        // ignore
      }
      setSuccessMessage(
        lang === 'ar'
          ? 'تم إنشاء الحساب بنجاح! تم إرسال رابط تأكيد إلى بريدك.'
          : 'Account created successfully! Verification email sent.'
      );
      setTimeout(() => {
        onAuthSuccess(user);
      }, 900);
    } catch (err: any) {
      console.error('Email sign-up failed:', err);
      const friendly = getAuthErrorMessage(err, lang);
      setErrorInfo(friendly);
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot Password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorInfo(null);
    setSuccessMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorInfo({
        title: lang === 'ar' ? 'البريد الإلكتروني مطلوب' : 'Email Required',
        message: lang === 'ar' ? 'يرجى إدخال البريد الإلكتروني لاستلام رابط الاستعادة.' : 'Please enter your email address to receive the reset link.'
      });
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(trimmedEmail);
      setSuccessMessage(
        lang === 'ar'
          ? 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني بنجاح.'
          : 'Password reset link has been sent to your email.'
      );
    } catch (err: any) {
      console.error('Password reset failed:', err);
      const friendly = getAuthErrorMessage(err, lang);
      setErrorInfo(friendly);
    } finally {
      setIsLoading(false);
    }
  };

  // Google Sign In (Popup)
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorInfo(null);
    setSuccessMessage(null);
    try {
      const result = await googleSignIn(false);
      if (result?.user) {
        if (result.user.email) {
          try {
            localStorage.setItem('arabprompt_remembered_email', result.user.email.toLowerCase().trim());
          } catch (e) {
            // ignore
          }
        }
        setSuccessMessage(lang === 'ar' ? 'تم تسجيل الدخول بنجاح! جاري تحويلك...' : 'Signed in successfully! Redirecting...');
        setTimeout(() => {
          onAuthSuccess(result.user);
        }, 500);
      }
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      const friendly = getAuthErrorMessage(err, lang);
      setErrorInfo(friendly);
    } finally {
      setIsLoading(false);
    }
  };

  // Google Sign In (Direct Page Redirect - recommended on mobile browsers)
  const handleGoogleSignInRedirect = async () => {
    setIsLoading(true);
    setErrorInfo(null);
    setSuccessMessage(lang === 'ar' ? 'جاري تحويلك إلى Google للمصادقة المباشرة...' : 'Redirecting to Google for direct authentication...');
    try {
      await googleSignInRedirect(false);
    } catch (err: any) {
      console.error('Google redirect sign-in error:', err);
      const friendly = getAuthErrorMessage(err, lang);
      setErrorInfo(friendly);
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-between items-center p-4 sm:p-6 select-none relative overflow-hidden"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Background Decorative Glow Elements */}
      <div className="absolute top-[-10%] start-[-10%] w-[450px] h-[450px] rounded-full bg-gradient-to-br from-[#c29b40]/15 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] end-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-amber-600/10 to-transparent blur-3xl pointer-events-none" />

      {/* Top Bar with Language Selector */}
      <header className="w-full max-w-5xl flex items-center justify-between pt-2 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#916a24] via-[#c29b40] to-[#ecd197] flex items-center justify-center text-white shadow-md ring-2 ring-[#c29b40]/25">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-black tracking-wide font-serif text-white">
            عرب برومبت — ArabPrompt
          </span>
        </div>

        {/* Language Switch */}
        <div className="flex items-center gap-1 bg-stone-900/90 border border-stone-800 p-1 rounded-xl text-xs">
          <Globe className="w-3.5 h-3.5 text-stone-400 ms-1" />
          {SUPPORTED_LANGUAGES.slice(0, 3).map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => onSetLang(item.code)}
              className={`px-2 py-0.5 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                lang === item.code
                  ? 'bg-[#c29b40] text-stone-950 shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              {item.flag} {item.code.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="w-full max-w-md my-auto py-6 z-10 animate-fade-in">
        <div className="bg-stone-900/90 backdrop-blur-xl border border-stone-800 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
          
          {/* Top mandatory badge */}
          <div className="flex items-center justify-center mb-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-[#ecd197] text-xs font-black shadow-xs">
              <Lock className="w-3.5 h-3.5 text-[#c29b40]" />
              <span>{lang === 'ar' ? '🔒 تسجيل الدخول بالبريد إلزامي' : '🔒 Mandatory Email Access'}</span>
            </div>
          </div>

          <div className="text-center space-y-1 mb-6">
            <h1 className="text-lg sm:text-xl font-black text-white tracking-tight font-sans">
              {subMode === 'signup'
                ? (lang === 'ar' ? 'إنشاء حساب جديد بالبريد الإلكتروني' : 'Create New Account with Email')
                : subMode === 'forgot'
                ? (lang === 'ar' ? 'استعادة كلمة المرور' : 'Reset Your Password')
                : (lang === 'ar' ? 'تسجيل الدخول إلى منصة عرب برومبت' : 'Sign in to ArabPrompt Platform')}
            </h1>
            <p className="text-xs text-stone-400 font-medium leading-relaxed">
              {lang === 'ar'
                ? 'لحماية وتشفير مسوداتك وأوامرك ومزامنتها سحابياً، يتطلب استخدام المنصة تسجيل الدخول بالبريد.'
                : 'Sign in with your email to protect, sync, and access the AI prompt engineering suite.'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          {subMode !== 'forgot' && (
            <div className="grid grid-cols-2 p-1 bg-stone-950/80 border border-stone-800/80 rounded-2xl mb-5">
              <button
                type="button"
                onClick={() => {
                  setSubMode('login');
                  setErrorInfo(null);
                  setSuccessMessage(null);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  subMode === 'login'
                    ? 'bg-gradient-to-r from-[#916a24] to-[#c29b40] text-white shadow-xs'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSubMode('signup');
                  setErrorInfo(null);
                  setSuccessMessage(null);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  subMode === 'signup'
                    ? 'bg-gradient-to-r from-[#916a24] to-[#c29b40] text-white shadow-xs'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'إنشاء حساب جديد' : 'Sign Up'}</span>
              </button>
            </div>
          )}

          {/* Error Message Banner */}
          {errorInfo && (
            <div className="p-3.5 rounded-2xl bg-rose-950/70 border border-rose-800 text-xs text-rose-200 mb-4 animate-shake shadow-lg">
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-rose-300">{errorInfo.title}</div>
                    <div className="text-[11px] text-rose-200/90 mt-0.5 leading-relaxed">{errorInfo.message}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setErrorInfo(null)}
                  className="text-rose-400 hover:text-white p-1 text-sm font-bold transition cursor-pointer"
                  title={lang === 'ar' ? 'إغلاق' : 'Close'}
                >
                  ✕
                </button>
              </div>

              {/* Action buttons inside error banner */}
              {errorInfo.isPopupError && (
                <div className="mt-3 pt-2.5 border-t border-rose-800/60 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleGoogleSignInRedirect}
                    disabled={isLoading}
                    className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-[#916a24] to-[#c29b40] text-white font-bold text-[11px] flex items-center gap-1.5 shadow-sm hover:opacity-95 transition cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'المتابعة بالتحويل المباشر (حل بديل للهاتف)' : 'Continue via Direct Redirect'}</span>
                  </button>
                </div>
              )}

              {errorInfo.isUserNotFound && subMode === 'login' && (
                <div className="mt-3 pt-2.5 border-t border-rose-800/60 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSubMode('signup');
                      setErrorInfo(null);
                    }}
                    className="py-1.5 px-3 rounded-xl bg-amber-500 text-stone-950 font-black text-[11px] flex items-center gap-1.5 shadow-sm hover:opacity-95 transition cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'إنشاء حساب جديد بهذا البريد الآن' : 'Create Account with this Email'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Success Message Banner */}
          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-800 flex items-start gap-2.5 text-xs text-emerald-200 mb-4 shadow-lg">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-[11px] font-bold leading-relaxed">{successMessage}</div>
            </div>
          )}

          {/* FORM 1: LOGIN */}
          {subMode === 'login' && (
            <form onSubmit={handleSignIn} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-stone-300 mb-1">
                  {lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'} <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-500 absolute top-3 start-3 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    dir="ltr"
                    className="w-full ps-9 pe-3 py-2.5 rounded-xl border border-stone-750 bg-stone-950/70 text-xs text-stone-100 placeholder-stone-600 focus:outline-hidden focus:ring-2 focus:ring-[#c29b40]/50"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-stone-300">
                    {lang === 'ar' ? 'كلمة المرور' : 'Password'} <span className="text-amber-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setSubMode('forgot');
                      setErrorInfo(null);
                      setSuccessMessage(null);
                    }}
                    className="text-[11px] text-[#c29b40] hover:underline font-bold cursor-pointer"
                  >
                    {lang === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-500 absolute top-3 start-3 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    dir="ltr"
                    className="w-full ps-9 pe-9 py-2.5 rounded-xl border border-stone-750 bg-stone-950/70 text-xs text-stone-100 placeholder-stone-600 focus:outline-hidden focus:ring-2 focus:ring-[#c29b40]/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-2.5 end-3 text-stone-500 hover:text-stone-300 transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#916a24] via-[#c29b40] to-[#ecd197] text-stone-950 font-black text-xs flex items-center justify-center gap-2 hover:opacity-95 transition shadow-md cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>{lang === 'ar' ? 'تسجيل الدخول للمنصة' : 'Sign In to ArabPrompt'}</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSubMode('signup');
                    setErrorInfo(null);
                  }}
                  className="text-[11px] text-stone-400 hover:text-amber-300 transition cursor-pointer"
                >
                  {lang === 'ar' ? (
                    <>
                      ليس لديك حساب بعد؟ <span className="font-bold text-[#c29b40] underline underline-offset-2">إنشاء حساب جديد بالبريد</span>
                    </>
                  ) : (
                    <>
                      Don't have an account? <span className="font-bold text-[#c29b40] underline underline-offset-2">Create new account</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* FORM 2: SIGN UP */}
          {subMode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-stone-300 mb-1">
                  {lang === 'ar' ? 'الاسم الكامل (اختياري)' : 'Full Name (Optional)'}
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-stone-500 absolute top-3 start-3 pointer-events-none" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={lang === 'ar' ? 'مثال: أحمد محمد' : 'e.g. John Doe'}
                    className="w-full ps-9 pe-3 py-2.5 rounded-xl border border-stone-750 bg-stone-950/70 text-xs text-stone-100 placeholder-stone-600 focus:outline-hidden focus:ring-2 focus:ring-[#c29b40]/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-300 mb-1">
                  {lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'} <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-500 absolute top-3 start-3 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    dir="ltr"
                    className="w-full ps-9 pe-3 py-2.5 rounded-xl border border-stone-750 bg-stone-950/70 text-xs text-stone-100 placeholder-stone-600 focus:outline-hidden focus:ring-2 focus:ring-[#c29b40]/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-300 mb-1">
                  {lang === 'ar' ? 'كلمة المرور' : 'Password'} <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-500 absolute top-3 start-3 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={lang === 'ar' ? '6 أحرف أو أرقام على الأقل' : 'At least 6 characters'}
                    dir="ltr"
                    className="w-full ps-9 pe-9 py-2.5 rounded-xl border border-stone-750 bg-stone-950/70 text-xs text-stone-100 placeholder-stone-600 focus:outline-hidden focus:ring-2 focus:ring-[#c29b40]/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-2.5 end-3 text-stone-500 hover:text-stone-300 transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-300 mb-1">
                  {lang === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'} <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-500 absolute top-3 start-3 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={lang === 'ar' ? 'أعد إدخال كلمة المرور' : 'Re-enter your password'}
                    dir="ltr"
                    className="w-full ps-9 pe-3 py-2.5 rounded-xl border border-stone-750 bg-stone-950/70 text-xs text-stone-100 placeholder-stone-600 focus:outline-hidden focus:ring-2 focus:ring-[#c29b40]/50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#916a24] via-[#c29b40] to-[#ecd197] text-stone-950 font-black text-xs flex items-center justify-center gap-2 hover:opacity-95 transition shadow-md cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>{lang === 'ar' ? 'إنشاء حساب جديد والدخول' : 'Create Account & Enter'}</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSubMode('login');
                    setErrorInfo(null);
                  }}
                  className="text-[11px] text-stone-400 hover:text-amber-300 transition cursor-pointer"
                >
                  {lang === 'ar' ? (
                    <>
                      لديك حساب بالفعل؟ <span className="font-bold text-[#c29b40] underline underline-offset-2">تسجيل الدخول</span>
                    </>
                  ) : (
                    <>
                      Already have an account? <span className="font-bold text-[#c29b40] underline underline-offset-2">Sign in</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* FORM 3: FORGOT PASSWORD */}
          {subMode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-3.5">
              <div className="p-3 rounded-xl bg-stone-950/80 border border-stone-800 text-[11px] text-stone-300 leading-relaxed">
                {lang === 'ar'
                  ? 'أدخل بريدك الإلكتروني وسنرسل لك رابطاً مباشراً لتعيين كلمة مرور جديدة.'
                  : 'Enter your email address and we will send you a secure password reset link.'}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-300 mb-1">
                  {lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-500 absolute top-3 start-3 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    dir="ltr"
                    className="w-full ps-9 pe-3 py-2.5 rounded-xl border border-stone-750 bg-stone-950/70 text-xs text-stone-100 placeholder-stone-600 focus:outline-hidden focus:ring-2 focus:ring-[#c29b40]/50"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSubMode('login');
                    setErrorInfo(null);
                  }}
                  className="w-1/3 py-2.5 px-3 rounded-xl border border-stone-750 text-xs font-bold text-stone-300 hover:bg-stone-800 cursor-pointer"
                >
                  {lang === 'ar' ? 'العودة' : 'Back'}
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#c29b40] text-stone-950 font-black text-xs flex items-center justify-center gap-2 hover:opacity-95 transition shadow-sm cursor-pointer disabled:opacity-60"
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

          {/* Alternative: Google Sign-in */}
          <div className="mt-5 pt-4 border-t border-stone-800/80">
            <div className="relative flex items-center justify-center mb-3">
              <span className="bg-stone-900 px-3 text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                {lang === 'ar' ? 'أو المتابعة السريعة' : 'Or quick continue'}
              </span>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl border border-stone-750 bg-stone-950 hover:bg-stone-850 text-stone-200 font-bold text-xs flex items-center justify-center gap-2.5 transition cursor-pointer shadow-xs disabled:opacity-60"
              >
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
                <span>{lang === 'ar' ? 'المتابعة بحساب Google' : 'Continue with Google Account'}</span>
              </button>

              <button
                type="button"
                onClick={handleGoogleSignInRedirect}
                disabled={isLoading}
                className="w-full py-1.5 px-3 text-[11px] text-stone-400 hover:text-amber-400 transition flex items-center justify-center gap-1.5 cursor-pointer"
                title={lang === 'ar' ? 'حل مخصص لمتصفحات الهاتف لتجنب حظر النوافذ' : 'Direct redirect for mobile browsers'}
              >
                <LogIn className="w-3 h-3 text-[#c29b40]" />
                <span>{lang === 'ar' ? 'أو الدخول المباشر بحساب Google (حل بديل للهاتف)' : 'Or Direct Google Redirect (Mobile fix)'}</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Security Guarantee */}
      <footer className="w-full max-w-md text-center py-2 z-10 space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-[#c29b40]" />
          <span>
            {lang === 'ar'
              ? 'مزامنة مشفرة سحابياً ومحمية بالكامل عبر Firebase Firestore'
              : 'End-to-end encrypted cloud sync powered by Firebase'}
          </span>
        </div>
        <p className="text-[10px] text-stone-600">
          © 2026 ArabPrompt Studio. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
