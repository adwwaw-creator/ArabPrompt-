/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
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

const provider = new GoogleAuthProvider();
// Request Workspace scopes
provider.addScope('https://www.googleapis.com/auth/drive.file');

// Flag to indicate if we are in the middle of a sign-in flow.
let isSigningIn = false;
// Cache the access token in memory.
let cachedAccessToken: string | null = null;

// Initialize auth state listener. Call this on app load.
export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Must be called from a button click or user interaction
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      // In case accessToken wasn't directly returned by credential (e.g. standard email profile), fallback to user token
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

/**
 * Translates Firebase Auth error codes into helpful user messages in Arabic and English
 */
export const getAuthErrorMessage = (error: any, lang: AppLanguage = 'ar'): { title: string; message: string; isProviderDisabled?: boolean } => {
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
        title: lang === 'ar' ? 'المستخدم غير موجود' : 'User Not Found',
        message: lang === 'ar' ? 'لا يوجد حساب مسجل بهذا البريد الإلكتروني. يمكنك إنشاء حساب جديد.' : 'No user account found with this email. You can create a new account.'
      };
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return {
        title: lang === 'ar' ? 'بيانات الاعتماد غير صحيحة' : 'Invalid Credentials',
        message: lang === 'ar' ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى التحقق وإعادة المحاولة.' : 'Invalid email or password. Please verify and try again.'
      };
    case 'auth/email-already-in-use':
      return {
        title: lang === 'ar' ? 'البريد مستخدم بالفعل' : 'Email Already in Use',
        message: lang === 'ar' ? 'هذا البريد الإلكتروني مسجل مسبقاً. يمكنك تسجيل الدخول بدلاً من ذلك.' : 'This email address is already registered. Please sign in instead.'
      };
    case 'auth/weak-password':
      return {
        title: lang === 'ar' ? 'كلمة المرور ضعيفة' : 'Weak Password',
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
        title: lang === 'ar' ? 'تم إغلاق النافذة' : 'Popup Closed',
        message: lang === 'ar' ? 'تم إغلاق نافذة المصادقة قبل استكمال عملية الدخول.' : 'Sign-in popup was closed before completing the process.'
      };
    default:
      return {
        title: lang === 'ar' ? 'خطأ في المصادقة' : 'Authentication Error',
        message: error?.message || (lang === 'ar' ? 'حدث خطأ غير متوقع أثناء تسجيل الدخول. حاول مجدداً.' : 'An unexpected authentication error occurred. Please try again.')
      };
  }
};
