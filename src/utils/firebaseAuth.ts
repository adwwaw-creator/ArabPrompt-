/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  signOut
} from 'firebase/auth';
import { getFirestore, setLogLevel } from 'firebase/firestore';
import { AppLanguage } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);

// Silence verbose internal Firebase SDK connection warning logs from clogging the client console
try {
  setLogLevel('silent');
} catch (e) {
  // Ignore
}

/**
 * Standard Google Provider for App Authentication
 * Strictly requests identity & profile without intimidating sensitive drive scopes.
 */
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

/**
 * Specialized Google Provider for Drive Cloud Backup
 */
const googleDriveProvider = new GoogleAuthProvider();
googleDriveProvider.addScope('https://www.googleapis.com/auth/drive.file');
googleDriveProvider.setCustomParameters({
  prompt: 'select_account'
});

export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Flag to indicate if we are in the middle of a sign-in flow.
let isSigningIn = false;
// Cache the access token in memory.
let cachedAccessToken: string | null = null;

// Initialize auth state listener and handle return from signInWithRedirect
export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  // Process redirect results if the user returned from mobile signInWithRedirect
  getRedirectResult(auth)
    .then(async (result) => {
      if (result?.user) {
        let token: string | null = null;
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential?.accessToken) {
          token = credential.accessToken;
        } else {
          try {
            token = await result.user.getIdToken();
          } catch (e) {
            // ignore
          }
        }
        cachedAccessToken = token;
        if (onAuthSuccess) {
          onAuthSuccess(result.user, token);
        }
      }
    })
    .catch((error) => {
      console.warn('Redirect sign-in notice:', error);
    });

  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (!cachedAccessToken) {
        try {
          cachedAccessToken = await user.getIdToken();
        } catch (e) {
          // ignore
        }
      }
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Google Sign In via standard Popup
 * @param withDriveScope Set true only when connecting Google Drive inside Backup Center
 */
export const googleSignIn = async (withDriveScope: boolean = false): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const activeProvider = withDriveScope ? googleDriveProvider : googleProvider;
    const result = await signInWithPopup(auth, activeProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      cachedAccessToken = await result.user.getIdToken();
    } else {
      cachedAccessToken = credential.accessToken;
    }

    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Google Sign In via Full Page Redirect
 * Optimal for mobile browsers (Firefox Android, Safari, Chrome mobile) where popups are blocked or closed.
 */
export const googleSignInRedirect = async (withDriveScope: boolean = false): Promise<void> => {
  try {
    isSigningIn = true;
    const activeProvider = withDriveScope ? googleDriveProvider : googleProvider;
    await signInWithRedirect(auth, activeProvider);
  } catch (error: any) {
    console.error('Redirect sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Sign in with email and password
 */
export const emailSignIn = async (email: string, password: string): Promise<User> => {
  try {
    isSigningIn = true;
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
    cachedAccessToken = await userCredential.user.getIdToken();
    return userCredential.user;
  } catch (error: any) {
    console.error('Email sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Register a new user with email and password
 */
export const emailSignUp = async (email: string, password: string, displayName?: string): Promise<User> => {
  try {
    isSigningIn = true;
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const user = userCredential.user;

    if (displayName && displayName.trim()) {
      try {
        await updateProfile(user, { displayName: displayName.trim() });
      } catch (profileErr) {
        console.warn('Could not set displayName during sign up:', profileErr);
      }
    }

    try {
      await sendEmailVerification(user);
    } catch (verifErr) {
      console.warn('Could not send verification email automatically:', verifErr);
    }

    cachedAccessToken = await user.getIdToken();
    return user;
  } catch (error: any) {
    console.error('Email sign up error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Send password reset email
 */
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email.trim());
  } catch (error: any) {
    console.error('Password reset error:', error);
    throw error;
  }
};

/**
 * Re-send email verification link to current user
 */
export const resendVerificationEmail = async (user: User): Promise<void> => {
  try {
    await sendEmailVerification(user);
  } catch (error: any) {
    console.error('Email verification send error:', error);
    throw error;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

export interface AuthErrorMessageResult {
  title: string;
  message: string;
  isProviderDisabled?: boolean;
  isPopupError?: boolean;
  isUserNotFound?: boolean;
}

/**
 * Translates Firebase Auth error codes into helpful user messages in Arabic and English
 */
export const getAuthErrorMessage = (error: any, lang: AppLanguage = 'ar'): AuthErrorMessageResult => {
  const code = error?.code || '';

  switch (code) {
    case 'auth/operation-not-allowed':
      return {
        title: lang === 'ar' ? 'تسجيل الدخول بالبريد غير مفعّل في لوحة Firebase' : 'Email Sign-in Not Enabled Yet',
        message: lang === 'ar'
          ? 'لتفعيل تسجيل الدخول بالبريد الإلكتروني، يرجى الانتقال إلى Firebase Console > Authentication > Sign-in method وتفعيل خيار (Email/Password).'
          : 'To enable email sign-in, please go to Firebase Console > Authentication > Sign-in method and enable the (Email/Password) provider.',
        isProviderDisabled: true
      };
    case 'auth/user-not-found':
      return {
        title: lang === 'ar' ? 'المستخدم غير مسجل' : 'Account Not Found',
        message: lang === 'ar' 
          ? 'لا يوجد حساب مسجل بهذا البريد الإلكتروني حتى الآن. اضغط زر "إنشاء حساب جديد" أدناه لإنشاء حسابك فوراً.' 
          : 'No user account found with this email. You can create a new account in seconds below.',
        isUserNotFound: true
      };
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return {
        title: lang === 'ar' ? 'بيانات الاعتماد غير صحيحة' : 'Invalid Credentials',
        message: lang === 'ar' 
          ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة، أو لم يتم إنشاء الحساب بعد. يرجى التحقق أو الضغط على "إنشاء حساب جديد".' 
          : 'Invalid email or password. Please verify your details or click "Sign Up" if you have not registered yet.',
        isUserNotFound: true
      };
    case 'auth/email-already-in-use':
      return {
        title: lang === 'ar' ? 'البريد مستخدم بالفعل' : 'Email Already in Use',
        message: lang === 'ar' ? 'هذا البريد الإلكتروني مسجل مسبقاً. يمكنك تسجيل الدخول بدلاً من ذلك.' : 'This email address is already registered. Please sign in instead.'
      };
    case 'auth/weak-password':
      return {
        title: lang === 'ar' ? 'كلمة المرور قصيرة أو ضعيفة' : 'Weak Password',
        message: lang === 'ar' ? 'يجب أن تتكون كلمة المرور من 6 أحرف أو أرقام على الأقل.' : 'Password should be at least 6 characters long.'
      };
    case 'auth/invalid-email':
      return {
        title: lang === 'ar' ? 'صيغة البريد غير صحيحة' : 'Invalid Email Address',
        message: lang === 'ar' ? 'يرجى كتابة عنوان بريد إلكتروني صالح مثل user@example.com.' : 'Please provide a valid email address like user@example.com.'
      };
    case 'auth/too-many-requests':
      return {
        title: lang === 'ar' ? 'محاولات كثيرة جداً' : 'Too Many Requests',
        message: lang === 'ar' ? 'تم حظر الحساب مؤقتاً لأسباب أمنية بسبب تكرار المحاولات الخاطئة. يرجى المحاولة بعد قليل.' : 'Access temporarily disabled due to too many failed attempts. Please try again later.'
      };
    case 'auth/popup-closed-by-user':
      return {
        title: lang === 'ar' ? 'تم إغلاق نافذة المصادقة' : 'Sign-in Popup Closed',
        message: lang === 'ar'
          ? 'تم إغلاق نافذة المصادقة قبل استكمال العملية (يحدث ذلك غالباً في متصفحات الهاتف كـ Firefox بسبب سياسات النوافذ المنبثقة). يمكنك الضغط على "التحويل المباشر" أدناه للمتابعة بسلاسة دون نوافذ، أو إتمام الدخول بالبريد.'
          : 'The authentication window was closed before completion (common on mobile browsers like Firefox). You can use "Direct Redirect" below to continue smoothly without popups, or sign in with email.',
        isPopupError: true
      };
    case 'auth/popup-blocked':
      return {
        title: lang === 'ar' ? 'تم حظر النافذة المنبثقة' : 'Popup Blocked by Browser',
        message: lang === 'ar'
          ? 'قام المتصفح بحظر نافذة Google المنبثقة تلقائياً. اضغط على زر "التحويل المباشر" أدناه لإتمام تسجيل الدخول في نفس الصفحة.'
          : 'Your browser blocked the sign-in popup. Click "Direct Redirect" below to complete sign-in seamlessly on the same page.',
        isPopupError: true
      };
    case 'auth/cancelled-popup-request':
      return {
        title: lang === 'ar' ? 'تم إلغاء الطلب' : 'Request Cancelled',
        message: lang === 'ar'
          ? 'تم إلغاء طلب تسجيل الدخول السابق. يمكنك إعادة المحاولة أو المتابعة بالتحويل المباشر.'
          : 'Previous sign-in request was cancelled. You can retry or use direct redirect.',
        isPopupError: true
      };
    default:
      return {
        title: lang === 'ar' ? 'خطأ في المصادقة' : 'Authentication Error',
        message: error?.message || (lang === 'ar' ? 'حدث خطأ غير متوقع أثناء تسجيل الدخول. حاول مجدداً.' : 'An unexpected authentication error occurred. Please try again.')
      };
  }
};
