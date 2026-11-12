import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData, User, EMPTY_USER_PERMISSIONS, FULL_USER_PERMISSIONS, normalizePermissions } from '../context/DataContext';
import { resetPassword, resetRateLimit, signInUser, signOutUser } from '../features/auth';
import { RateLimitAlert } from '../components/Navigation';
import { useRateLimitGuard } from '../hooks/useRateLimitGuard';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  authenticateBackendUser,
  completeBackendPasswordReset,
  deleteBackendOwnAccount,
  fetchAdminRegistrationOpen,
  fetchBackendUserStatus,
  googleAuthBackendSync,
  registerBackendSelfUser,
  requestBackendPasswordReset,
} from '../services/userAccessApi';

type GoogleRole = 'faculty' | 'student' | 'consultant';
type RegisterableRole = 'admin' | GoogleRole;

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="splash-screen">
      <div className="animate-slide-up">
        <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mb-6 mx-auto backdrop-blur-sm border border-white/20 shadow-xl shadow-teal-900/30">
          <div className="text-center">
            <i className="fas fa-staff-snake text-3xl text-teal-400" />
            <div className="flex gap-0.5 mt-1 justify-center">
              <div className="w-5 h-1 rounded bg-green-500" />
              <div className="w-5 h-1 rounded bg-white" />
              <div className="w-5 h-1 rounded bg-red-500" />
            </div>
          </div>
        </div>

        <h1 className="text-white text-2xl font-bold text-center mb-1 tracking-tight">Sultanat e Italia</h1>
        <h2 className="text-teal-400 text-lg font-semibold text-center mb-2">Medica LMS</h2>
        <p className="text-gray-400 text-xs text-center max-w-[260px] mx-auto leading-relaxed">
          Your Gateway to Medical Excellence in India & Italy
        </p>
      </div>

      <div className="absolute bottom-16 flex flex-col items-center">
        <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-teal-400/80 text-[11px] font-medium tracking-wide">CONNECTING TO CAMPUS...</p>
      </div>
    </div>
  );
}

export function LoginScreen() {
  const { signIn, login } = useAuth();
  const { users, addUser, updateUser, deleteOwnUserAccount, canRegisterAdmin, refreshUsersFromBackend } = useData();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [registerInitialRole, setRegisterInitialRole] = useState<RegisterableRole | undefined>(undefined);
  const [remoteAdminOpen, setRemoteAdminOpen] = useState<boolean | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotMode, setForgotMode] = useState<'request' | 'code'>('request');
  const [forgotEmail, setForgotEmail] = useState('');
  const [generatedResetCode, setGeneratedResetCode] = useState<string | null>(null);
  const [offlineResetMeta, setOfflineResetMeta] = useState<{ email: string; code: string; expiresAt: number } | null>(null);
  const [resetCodeInput, setResetCodeInput] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [forgotStatus, setForgotStatus] = useState<{ message: string; isError: boolean } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState<{ message: string; isError: boolean } | null>(null);
  const [error, setError] = useState('');
  const [pendingNotice, setPendingNotice] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [googleNameInput, setGoogleNameInput] = useState('');
  const [googleRoleInput, setGoogleRoleInput] = useState<GoogleRole>('student');
  const [googleError, setGoogleError] = useState('');
  const [googleNotice, setGoogleNotice] = useState('');
  const loginRateLimit = useRateLimitGuard('auth:login', {
    roleOverride: 'guest',
    actorIdOverride: email.trim().toLowerCase() || 'guest',
  });
  const googleRateLimit = useRateLimitGuard('auth:google', {
    roleOverride: 'guest',
    actorIdOverride: googleEmailInput.trim().toLowerCase() || 'google-oauth',
  });
  const forgotRateLimit = useRateLimitGuard('auth:forgot_password', {
    roleOverride: 'guest',
    actorIdOverride: forgotEmail.trim().toLowerCase() || 'forgot',
  });

  useEffect(() => {
    let active = true;
    fetchAdminRegistrationOpen().then((open) => {
      if (active && open !== null) {
        setRemoteAdminOpen(open);
      }
    });
    return () => { active = false; };
  }, [showRegister]);

  const showAdminSetup = remoteAdminOpen !== null ? remoteAdminOpen : canRegisterAdmin;

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError('');
    setPendingNotice('');
    try {
      if (isSupabaseConfigured()) {
        const { error: oauthError } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
            queryParams: {
              prompt: 'select_account',
            },
          },
        });
        if (oauthError) {
          console.warn('[LoginScreen] Supabase Google OAuth error, launching Google sign in modal:', oauthError);
          setShowGoogleModal(true);
        }
      } else {
        setShowGoogleModal(true);
      }
    } catch (err: any) {
      console.warn('[LoginScreen] Google sign-in fallback:', err);
      setShowGoogleModal(true);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleConfirmGoogleAccount = async (targetEmail: string, targetName?: string, selectedRole?: GoogleRole) => {
    const cleanEmail = targetEmail.trim().toLowerCase();
    setGoogleError('');
    setGoogleNotice('');
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setGoogleError('Please enter a valid Google email address.');
      return;
    }

    const googleRateCheck = googleRateLimit.tryConsume(cleanEmail, 'guest');
    if (!googleRateCheck.allowed) {
      setGoogleError(googleRateCheck.message);
      return;
    }

    const chosenRole: GoogleRole = selectedRole || googleRoleInput || 'student';
    const displayName = (targetName || '').trim() || cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

    const remoteSync = await googleAuthBackendSync({
      email: cleanEmail,
      name: displayName,
      role: chosenRole,
    });
    const localExisting = users.find((u) => u.email.toLowerCase() === cleanEmail);
    const remoteUser = remoteSync.ok ? remoteSync.data?.user : undefined;
    const isNewGoogle = remoteUser ? Boolean(remoteSync.data?.isNew) : !localExisting;
    const resolvedUser: User | undefined = remoteUser
      ? {
        ...remoteUser,
        password: localExisting?.password || '',
        accessPermissions: normalizePermissions(remoteUser.accessPermissions, remoteUser.status === 'active'),
      }
      : localExisting;

    if (resolvedUser && !isNewGoogle) {
      if (resolvedUser.status === 'pending') {
        setGoogleNotice('Your account is awaiting Administrator approval. You cannot access portal resources until Admin allows your account.');
        return;
      }
      if (resolvedUser.status === 'suspended') {
        setGoogleError('Your account has been suspended. Please contact the administrator.');
        return;
      }
      resetRateLimit('auth:google', 'guest', cleanEmail);
      login(resolvedUser);
      setShowGoogleModal(false);
      return;
    }

    const newGoogleUser: User = resolvedUser || {
      id: `u-google-${Date.now()}`,
      name: displayName,
      email: cleanEmail,
      phone: '',
      password: '',
      role: chosenRole,
      batch: '',
      avatar: chosenRole === 'faculty' ? '👨‍⚕️' : chosenRole === 'consultant' ? '💼' : '🎓',
      targetExam: chosenRole === 'student' ? 'NEET & IMAT' : '',
      department: chosenRole === 'consultant' ? 'Study Abroad & Consular Services' : 'Medical Sciences',
      status: 'pending',
      accessPermissions: { ...EMPTY_USER_PERMISSIONS },
      createdAt: new Date().toISOString(),
    };

    addUser(newGoogleUser);
    refreshUsersFromBackend().catch(() => { });
    setGoogleNotice('Your Google account has been registered and is awaiting Administrator approval before you can access resources.');
  };

  const handleLogin = async () => {
    setError('');
    setPendingNotice('');
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const rateCheck = loginRateLimit.tryConsume(cleanEmail, 'guest');
    if (!rateCheck.allowed) {
      setError(rateCheck.message);
      return;
    }

    setIsLoading(true);

    try {
      // 1. Check authoritative backend directory first if online
      const remoteAuth = await authenticateBackendUser(cleanEmail, password);
      if (remoteAuth.ok && remoteAuth.data?.user) {
        const remoteUser: User = {
          ...remoteAuth.data.user,
          password,
          accessPermissions: normalizePermissions(
            remoteAuth.data.user.accessPermissions,
            remoteAuth.data.user.status === 'active'
          ),
        };
        if (remoteUser.status === 'pending') {
          setPendingNotice('Your account is registered and awaiting Administrator approval. Please wait until an Admin allows your account.');
          setIsLoading(false);
          return;
        }
        if (remoteUser.status === 'suspended') {
          setError('Your account has been suspended. Please contact the administrator.');
          setIsLoading(false);
          return;
        }
        resetRateLimit('auth:login', 'guest', cleanEmail);
        login(remoteUser);
        setIsLoading(false);
        return;
      }

      // 2. Attempt Supabase Auth login if client is configured
      let supabaseErrorMessage = '';
      if (isSupabaseConfigured()) {
        const result = await signIn({ email: cleanEmail, password });
        if (result.success) {
          setIsLoading(false);
          return;
        }
        if (result.error === 'PENDING_APPROVAL') {
          setPendingNotice('Your account is registered and awaiting Administrator approval. Please wait until an Admin allows your account.');
          setIsLoading(false);
          return;
        }
        supabaseErrorMessage = result.error || '';
      }

      // 3. Offline / Local prototype fallback (check backend status override if user exists locally)
      const localUser = users.find(u => u.email.toLowerCase() === cleanEmail && u.password === password);
      if (localUser) {
        const remoteStatus = await fetchBackendUserStatus({ email: localUser.email, id: localUser.id });
        const effectiveStatus = remoteStatus?.status || localUser.status;
        if (effectiveStatus === 'pending') {
          setPendingNotice('Your account is registered and awaiting Administrator approval. You cannot access portal resources until an Admin allows your account.');
          setIsLoading(false);
          return;
        }
        if (effectiveStatus === 'suspended') {
          setError('Your account has been suspended. Contact administrator.');
          setIsLoading(false);
          return;
        }
        resetRateLimit('auth:login', 'guest', cleanEmail);
        login({
          ...localUser,
          ...(remoteStatus ? {
            status: remoteStatus.status,
            batch: remoteStatus.batch,
            accessPermissions: remoteStatus.accessPermissions,
            role: remoteStatus.role,
          } : {}),
        });
      } else {
        setError((!remoteAuth.networkError && remoteAuth.error) || supabaseErrorMessage || 'Invalid email or password.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected login error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateLocalFallbackCode = () => {
    const bytes = new Uint8Array(4);
    try {
      window.crypto.getRandomValues(bytes);
    } catch {
      for (let i = 0; i < 4; i += 1) bytes[i] = Math.floor(Math.random() * 256);
    }
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    return `${hex.slice(0, 4)}-${hex.slice(4)}`;
  };

  const generateOneTimeResetCode = async (targetEmail: string) => {
    const cleanForgot = targetEmail.trim().toLowerCase();
    if (!cleanForgot || !cleanForgot.includes('@')) {
      setForgotStatus({ message: 'Please enter a valid registered email address.', isError: true });
      return;
    }

    const rateCheck = forgotRateLimit.tryConsume(cleanForgot, 'guest');
    if (!rateCheck.allowed) {
      setForgotStatus({ message: rateCheck.message, isError: true });
      return;
    }

    setIsResettingPassword(true);
    setForgotStatus({ message: 'Generating one-time reset code...', isError: false });
    try {
      const backendReq = await requestBackendPasswordReset(cleanForgot);
      if (backendReq.ok && backendReq.data?.resetCode) {
        setGeneratedResetCode(backendReq.data.resetCode);
        setOfflineResetMeta(null);
        setForgotMode('code');
        refreshUsersFromBackend().catch(() => {});
        setForgotStatus({
          message: 'One-time reset code generated below. Enter it with your new password.',
          isError: false,
        });
        return;
      }

      if (!backendReq.networkError) {
        setGeneratedResetCode(null);
        setForgotStatus({
          message: backendReq.error || 'No account found with that email address.',
          isError: true,
        });
        return;
      }

      // Offline fallback when Express backend is unreachable
      const localMatch = users.find((u) => u.email.toLowerCase() === cleanForgot);
      if (!localMatch) {
        setGeneratedResetCode(null);
        setForgotStatus({
          message: 'No account found with that email address.',
          isError: true,
        });
        return;
      }

      const code = generateLocalFallbackCode();
      setOfflineResetMeta({
        email: cleanForgot,
        code: code.replace(/[^A-Z0-9]/g, ''),
        expiresAt: Date.now() + 2 * 60 * 1000,
      });
      setGeneratedResetCode(code);
      setForgotMode('code');
      setForgotStatus({
        message: 'One-time reset code generated below. Enter it with your new password.',
        isError: false,
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  const openForgotModal = (initialMode: 'request' | 'code' = 'request') => {
    const prefilled = email.trim();
    setForgotMode(prefilled.includes('@') ? 'code' : initialMode);
    setForgotEmail(prefilled);
    setGeneratedResetCode(null);
    setOfflineResetMeta(null);
    setForgotStatus(null);
    setResetCodeInput('');
    setResetNewPassword('');
    setResetConfirmPassword('');
    setShowForgotModal(true);
    if (prefilled.includes('@')) {
      generateOneTimeResetCode(prefilled);
    }
  };

  const handleForgotPassword = async () => {
    const cleanForgot = forgotEmail.trim().toLowerCase();
    if (!cleanForgot || !cleanForgot.includes('@')) {
      setForgotStatus({ message: 'Please enter a valid registered email address.', isError: true });
      return;
    }

    if (forgotMode === 'request') {
      await generateOneTimeResetCode(cleanForgot);
      return;
    }

    if (!resetCodeInput.trim()) {
      setForgotStatus({ message: 'Enter the generated one-time reset code.', isError: true });
      return;
    }
    if (resetNewPassword.length < 6) {
      setForgotStatus({ message: 'New password must be at least 6 characters.', isError: true });
      return;
    }
    if (resetNewPassword !== resetConfirmPassword) {
      setForgotStatus({ message: 'Passwords do not match.', isError: true });
      return;
    }

    setIsResettingPassword(true);
    try {
      setForgotStatus({ message: 'Verifying reset code and updating password...', isError: false });
      const resetRes = await completeBackendPasswordReset({
        email: cleanForgot,
        code: resetCodeInput.trim(),
        newPassword: resetNewPassword,
      });

      if (resetRes.ok && resetRes.data?.success) {
        const localMatch = users.find((u) => u.email.toLowerCase() === cleanForgot);
        if (localMatch) {
          updateUser(localMatch.id, { password: resetNewPassword });
        }
        resetRateLimit('auth:login', 'guest', cleanForgot);
        refreshUsersFromBackend().catch(() => {});
        setEmail(cleanForgot);
        setPassword('');
        setGeneratedResetCode(null);
        setForgotStatus({
          message: 'Password updated! You can now sign in with your new password.',
          isError: false,
        });
        setTimeout(() => {
          setShowForgotModal(false);
          setForgotStatus(null);
        }, 1800);
        return;
      }

      if (!resetRes.networkError) {
        setForgotStatus({
          message: resetRes.error || 'Could not reset password with that code.',
          isError: true,
        });
        return;
      }

      const normalizedInput = resetCodeInput.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
      const localMatch = users.find((u) => u.email.toLowerCase() === cleanForgot);
      if (
        localMatch &&
        offlineResetMeta &&
        offlineResetMeta.email === cleanForgot &&
        offlineResetMeta.expiresAt > Date.now() &&
        offlineResetMeta.code === normalizedInput
      ) {
        updateUser(localMatch.id, { password: resetNewPassword });
        setOfflineResetMeta(null);
        setGeneratedResetCode(null);
        resetRateLimit('auth:login', 'guest', cleanForgot);
        setEmail(cleanForgot);
        setPassword('');
        setForgotStatus({
          message: 'Password updated! You can now sign in with your new password.',
          isError: false,
        });
        setTimeout(() => {
          setShowForgotModal(false);
          setForgotStatus(null);
        }, 1800);
      } else {
        setForgotStatus({
          message: 'Invalid or expired reset code. Generate a fresh code and try again.',
          isError: true,
        });
      }
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleSendSupabaseRecoveryEmail = async () => {
    const cleanForgot = forgotEmail.trim().toLowerCase();
    if (!cleanForgot || !cleanForgot.includes('@')) {
      setForgotStatus({ message: 'Please enter a valid registered email address.', isError: true });
      return;
    }
    setIsResettingPassword(true);
    setForgotStatus({ message: 'Sending recovery link...', isError: false });
    try {
      const result = await resetPassword(cleanForgot);
      setForgotStatus(
        result.success
          ? { message: 'Password recovery email sent! Open the link in your inbox.', isError: false }
          : { message: result.error || 'Failed to send recovery link.', isError: true }
      );
    } finally {
      setIsResettingPassword(false);
    }
  };

  const openDeleteModal = () => {
    setDeleteEmail(email);
    setDeletePassword('');
    setDeleteStatus(null);
    setShowDeleteModal(true);
  };

  const handleDeleteOwnAccount = async () => {
    const cleanEmail = deleteEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !deletePassword) {
      setDeleteStatus({ message: 'Please enter your account email and password.', isError: true });
      return;
    }

    const rateCheck = loginRateLimit.tryConsume(cleanEmail, 'guest');
    if (!rateCheck.allowed) {
      setDeleteStatus({ message: rateCheck.message, isError: true });
      return;
    }

    setIsDeletingAccount(true);
    setDeleteStatus(null);
    try {
      const backendRes = await deleteBackendOwnAccount(cleanEmail, deletePassword);

      if (backendRes.ok && backendRes.data?.success) {
        resetRateLimit('auth:login', 'guest', cleanEmail);
        if (typeof backendRes.data.adminRegistrationOpen === 'boolean') {
          setRemoteAdminOpen(backendRes.data.adminRegistrationOpen);
        }
        deleteOwnUserAccount(cleanEmail, backendRes.data.deletedId);
        if (email.trim().toLowerCase() === cleanEmail) {
          setEmail('');
          setPassword('');
        }
        setDeleteStatus({
          message: `Account for ${cleanEmail} has been permanently deleted.`,
          isError: false,
        });
        setTimeout(() => {
          setShowDeleteModal(false);
          setDeleteStatus(null);
          setDeletePassword('');
        }, 1600);
        return;
      }

      if (!backendRes.networkError) {
        setDeleteStatus({
          message: backendRes.error || 'Invalid email or password.',
          isError: true,
        });
        return;
      }

      // Offline / local fallback verification when backend server is unreachable
      const localMatch = users.find(
        (u) => u.email.toLowerCase() === cleanEmail && u.password === deletePassword
      );
      let supabaseVerified = false;
      if (!localMatch && isSupabaseConfigured()) {
        const sbRes = await signInUser({ email: cleanEmail, password: deletePassword });
        if (sbRes.success) {
          supabaseVerified = true;
          await signOutUser().catch(() => {});
        }
      }

      if (localMatch || supabaseVerified) {
        resetRateLimit('auth:login', 'guest', cleanEmail);
        deleteOwnUserAccount(cleanEmail, localMatch?.id);
        if (email.trim().toLowerCase() === cleanEmail) {
          setEmail('');
          setPassword('');
        }
        setDeleteStatus({
          message: `Account for ${cleanEmail} has been permanently deleted.`,
          isError: false,
        });
        setTimeout(() => {
          setShowDeleteModal(false);
          setDeleteStatus(null);
          setDeletePassword('');
        }, 1600);
      } else {
        setDeleteStatus({
          message: 'Invalid email or password.',
          isError: true,
        });
      }
    } finally {
      setIsDeletingAccount(false);
    }
  };

  if (showRegister) {
    return (
      <RegisterScreen
        initialRole={registerInitialRole}
        onAdminRegistered={() => setRemoteAdminOpen(false)}
        onBack={() => {
          setShowRegister(false);
          setRegisterInitialRole(undefined);
        }}
      />
    );
  }

  return (
    <div className="h-full max-h-[100dvh] w-full overflow-y-auto overflow-x-clip smooth-scroll bg-gradient-to-b from-[#0f2b46] to-[#1a3a5c] flex flex-col">
      <div className="italy-accent shrink-0">
        <div className="green" /><div className="white" /><div className="red" />
      </div>

      <div className="flex-1 flex flex-col px-6 py-8">
        <div className="w-full max-w-md mx-auto my-auto">
          <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/20 shadow-lg shadow-teal-900/30">
            <i className="fas fa-staff-snake text-2xl text-teal-400" />
          </div>
          <h1 className="text-white text-xl font-bold tracking-tight">Sultanat e Italia Medica</h1>
          <p className="text-gray-400 text-xs mt-1">Medical Competitive Exam LMS • Portal Access</p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Email address"
              className="w-full pl-11 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 text-sm focus:outline-none focus:border-teal-400 transition"
            />
          </div>

          <div className="relative">
            <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Password"
              className="w-full pl-11 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 text-sm focus:outline-none focus:border-teal-400 transition"
            />
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg px-3 py-2.5 animate-slide-up">
              <p className="text-red-300 text-xs flex items-center gap-1.5">
                <i className="fas fa-exclamation-circle text-red-400" />
                <span>{error}</span>
              </p>
            </div>
          )}

          {pendingNotice && (
            <div className="bg-amber-500/20 border border-amber-400/50 rounded-xl px-3.5 py-3 animate-slide-up">
              <div className="flex items-start gap-2">
                <i className="fas fa-clock text-amber-300 text-sm mt-0.5" />
                <div>
                  <p className="text-amber-200 text-xs font-bold">Pending Admin Approval</p>
                  <p className="text-amber-100/90 text-[11px] mt-0.5 leading-relaxed">{pendingNotice}</p>
                </div>
              </div>
            </div>
          )}

          <RateLimitAlert
            message={loginRateLimit.limitError}
            retryAfterSeconds={loginRateLimit.retryAfterSeconds}
            policyLabel={loginRateLimit.policyLabel}
            variant="dark"
          />

          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400 text-[11px] flex items-center gap-1">
              <i className="fas fa-shield-alt text-teal-400" /> Supabase Secured
            </span>
            <button
              type="button"
              onClick={() => openForgotModal('request')}
              className="text-teal-400 hover:text-teal-300 transition font-medium"
            >
              Forgot Password?
            </button>
          </div>

          <button
            onClick={handleLogin}
            disabled={isLoading || loginRateLimit.isBlocked}
            className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-teal-500/30 active:scale-[0.98] transition disabled:opacity-70 cursor-pointer"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>

          {/* Sign in with Google Facility */}
          <div className="pt-2">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px bg-white/15 flex-1" />
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Or continue with</span>
              <div className="h-px bg-white/15 flex-1" />
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isLoading}
              className="w-full py-3 px-4 bg-white hover:bg-gray-100 active:scale-[0.98] text-gray-800 rounded-xl font-semibold text-sm border border-gray-200 shadow-md flex items-center justify-center gap-3 transition cursor-pointer disabled:opacity-70"
            >
              {isGoogleLoading ? (
                <span className="flex items-center justify-center gap-2 text-gray-700">
                  <span className="w-4 h-4 border-2 border-gray-400 border-t-gray-800 rounded-full animate-spin" />
                  Connecting Google Account...
                </span>
              ) : (
                <>
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
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
                  <span className="font-bold text-gray-800">Sign in with Google</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-px bg-white/15 flex-1" />
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">New to the portal?</span>
            <div className="h-px bg-white/15 flex-1" />
          </div>

          <button
            type="button"
            onClick={() => {
              setRegisterInitialRole(undefined);
              setShowRegister(true);
            }}
            className="w-full py-3 px-4 bg-white/10 hover:bg-white/15 active:scale-[0.98] text-white border border-white/25 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <i className="fas fa-user-plus text-teal-300" />
            <span>Sign Up</span>
          </button>

          <button
            type="button"
            onClick={openDeleteModal}
            className="w-full py-2.5 px-4 bg-red-500/15 hover:bg-red-500/25 active:scale-[0.98] text-red-200 border border-red-400/35 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <i className="fas fa-user-times text-red-300" />
            <span>Delete Account</span>
          </button>

          {showAdminSetup && (
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => {
                  setRegisterInitialRole('admin');
                  setShowRegister(true);
                }}
                className="w-full py-2.5 px-4 bg-teal-500/15 hover:bg-teal-500/25 border border-teal-400/40 text-teal-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <i className="fas fa-user-shield text-teal-300" />
                <span>Admin Registration</span>
                <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-teal-400/20 text-teal-200">
                  One-Time Setup
                </span>
              </button>
              <p className="text-[10px] text-center text-gray-400">
                Available once for initial Administrator setup. Automatically disabled after registration.
              </p>
            </div>
          )}
        </div>
        </div>
      </div>

      <div className="shrink-0 px-6 pb-6 text-center">
        <p className="text-gray-500 text-xs">© 2026 Sultanat e Italia Medica • All Rights Reserved</p>
      </div>

      {/* Forgot Password / Recovery Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto smooth-scroll">
          <div className="bg-[#12283e] border border-white/20 rounded-2xl p-6 w-full max-w-sm shadow-2xl my-auto max-h-[90dvh] overflow-y-auto smooth-scroll">
            <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center mx-auto mb-3">
              <i className="fas fa-key text-teal-400 text-xl" />
            </div>
            <h3 className="text-white text-base font-bold text-center mb-1">Reset Password</h3>
            <p className="text-gray-400 text-xs text-center mb-3">
              {forgotMode === 'request'
                ? 'Enter your registered email to automatically generate a one-time reset code on screen.'
                : 'Use your generated one-time code below to set a new password.'}
            </p>

            <div className="grid grid-cols-2 gap-1.5 bg-white/5 p-1 rounded-xl mb-3">
              <button
                type="button"
                onClick={() => { setForgotMode('request'); setForgotStatus(null); }}
                className={`py-1.5 rounded-lg text-[11px] font-semibold transition ${forgotMode === 'request' ? 'bg-teal-500 text-white' : 'text-gray-300 hover:text-white'
                  }`}
              >
                Generate Code
              </button>
              <button
                type="button"
                onClick={() => { setForgotMode('code'); setForgotStatus(null); }}
                className={`py-1.5 rounded-lg text-[11px] font-semibold transition ${forgotMode === 'code' ? 'bg-teal-500 text-white' : 'text-gray-300 hover:text-white'
                  }`}
              >
                Use Reset Code
              </button>
            </div>

            <div className="space-y-2.5 mb-3">
              <div className="flex gap-1.5">
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Your registered email"
                  className="flex-1 min-w-0 px-3.5 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 text-sm focus:outline-none focus:border-teal-400"
                />
                {forgotMode === 'code' && (
                  <button
                    type="button"
                    disabled={isResettingPassword || forgotRateLimit.isBlocked}
                    onClick={() => generateOneTimeResetCode(forgotEmail)}
                    className="px-3 py-2 bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/40 text-teal-200 rounded-xl text-[11px] font-bold shrink-0 transition disabled:opacity-50"
                  >
                    New Code
                  </button>
                )}
              </div>

              {generatedResetCode && (
                <div className="p-3 bg-teal-500/15 border border-teal-400/40 rounded-xl flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-teal-300">
                      One-Time Reset Code (2 min)
                    </p>
                    <p className="text-base font-mono font-extrabold text-white tracking-widest mt-0.5">
                      {generatedResetCode}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setResetCodeInput(generatedResetCode);
                      setForgotMode('code');
                    }}
                    className="px-2.5 py-1.5 bg-teal-500 hover:bg-teal-400 text-[#0f2b46] rounded-lg text-[11px] font-bold transition shrink-0"
                  >
                    Auto-Fill
                  </button>
                </div>
              )}

              {forgotMode === 'code' && (
                <>
                  <input
                    type="text"
                    value={resetCodeInput}
                    onChange={(e) => setResetCodeInput(e.target.value.toUpperCase())}
                    placeholder="One-Time Code (e.g. A1B2-C3D4)"
                    className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 text-sm font-mono tracking-wider focus:outline-none focus:border-teal-400"
                  />
                  <input
                    type="password"
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    placeholder="New password (min 6 characters)"
                    className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 text-sm focus:outline-none focus:border-teal-400"
                  />
                  <input
                    type="password"
                    value={resetConfirmPassword}
                    onChange={(e) => setResetConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 text-sm focus:outline-none focus:border-teal-400"
                  />
                </>
              )}
            </div>

            {forgotStatus && (
              <p className={`text-xs mb-3 text-center leading-relaxed ${forgotStatus.isError ? 'text-red-400' : 'text-teal-300'}`}>
                {forgotStatus.message}
              </p>
            )}
            <div className="mb-3">
              <RateLimitAlert
                message={forgotRateLimit.limitError}
                retryAfterSeconds={forgotRateLimit.retryAfterSeconds}
                policyLabel={forgotRateLimit.policyLabel}
                variant="dark"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setShowForgotModal(false); setForgotStatus(null); setGeneratedResetCode(null); }}
                className="flex-1 py-2.5 bg-white/10 text-gray-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={isResettingPassword || (forgotMode === 'request' && forgotRateLimit.isBlocked)}
                className="flex-1 py-2.5 bg-teal-500 text-white rounded-xl text-xs font-semibold disabled:opacity-50"
              >
                {isResettingPassword
                  ? 'Processing...'
                  : forgotMode === 'code'
                    ? 'Update Password'
                    : 'Generate One-Time Code'}
              </button>
            </div>
            {isSupabaseConfigured() && (
              <button
                type="button"
                onClick={handleSendSupabaseRecoveryEmail}
                disabled={isResettingPassword}
                className="w-full mt-2 py-2 text-[11px] text-teal-300 hover:text-teal-200 underline"
              >
                Or send Supabase recovery email instead
              </button>
            )}
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto smooth-scroll">
          <div className="bg-[#12283e] border border-red-400/30 rounded-2xl p-6 w-full max-w-sm shadow-2xl my-auto max-h-[90dvh] overflow-y-auto smooth-scroll">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-3">
              <i className="fas fa-user-times text-red-400 text-xl" />
            </div>
            <h3 className="text-white text-base font-bold text-center mb-1">Delete Account</h3>
            <p className="text-gray-400 text-xs text-center mb-4">
              Enter your registered email and password to permanently delete that account.
            </p>

            <div className="space-y-2.5 mb-3">
              <input
                type="email"
                value={deleteEmail}
                onChange={(e) => setDeleteEmail(e.target.value)}
                placeholder="Account email"
                className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 text-sm focus:outline-none focus:border-red-400"
              />
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleDeleteOwnAccount()}
                placeholder="Account password"
                className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 text-sm focus:outline-none focus:border-red-400"
              />
            </div>

            {deleteStatus && (
              <p className={`text-xs mb-3 text-center leading-relaxed ${deleteStatus.isError ? 'text-red-400' : 'text-teal-300'}`}>
                {deleteStatus.message}
              </p>
            )}

            <div className="mb-3">
              <RateLimitAlert
                message={loginRateLimit.limitError}
                retryAfterSeconds={loginRateLimit.retryAfterSeconds}
                policyLabel={loginRateLimit.policyLabel}
                variant="dark"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setShowDeleteModal(false); setDeleteStatus(null); setDeletePassword(''); }}
                className="flex-1 py-2.5 bg-white/10 text-gray-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteOwnAccount}
                disabled={isDeletingAccount || loginRateLimit.isBlocked}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold disabled:opacity-50"
              >
                {isDeletingAccount ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Account Sign-In Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto smooth-scroll animate-fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-gray-100 flex flex-col text-left my-auto max-h-[90dvh] overflow-y-auto smooth-scroll">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <div>
                  <h3 className="text-sm font-bold text-gray-800">Sign in with Google</h3>
                  <p className="text-[10px] text-gray-500">to continue to Sultanat e Italia Medica</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setShowGoogleModal(false); setGoogleError(''); setGoogleNotice(''); }}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center text-xs transition"
              >
                <i className="fas fa-times" />
              </button>
            </div>

            <div className="py-3 space-y-2.5">
              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Enter your Google Email</label>
                <input
                  type="email"
                  value={googleEmailInput}
                  onChange={(e) => { setGoogleEmailInput(e.target.value); setGoogleError(''); setGoogleNotice(''); }}
                  placeholder="your.email@gmail.com"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Your Full Name (Optional)</label>
                <input
                  type="text"
                  value={googleNameInput}
                  onChange={(e) => setGoogleNameInput(e.target.value)}
                  placeholder="e.g. Alex Turner"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Account Role (for New Registrations)</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {([
                    { id: 'student', label: 'Student' },
                    { id: 'faculty', label: 'Faculty' },
                    { id: 'consultant', label: 'Consultant' },
                  ] as const).map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setGoogleRoleInput(r.id)}
                      className={`py-1.5 rounded-lg text-[11px] font-bold border transition ${googleRoleInput === r.id
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                        }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {googleError && (
                <p className="text-xs text-red-600 font-medium">{googleError}</p>
              )}

              <RateLimitAlert
                message={googleRateLimit.limitError}
                retryAfterSeconds={googleRateLimit.retryAfterSeconds}
                policyLabel={googleRateLimit.policyLabel}
              />

              {googleNotice && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 leading-relaxed">
                  <span className="font-bold block mb-0.5"><i className="fas fa-clock mr-1 text-amber-600" />Pending Admin Approval</span>
                  {googleNotice}
                </div>
              )}

              <button
                type="button"
                disabled={googleRateLimit.isBlocked}
                onClick={() => handleConfirmGoogleAccount(googleEmailInput, googleNameInput, googleRoleInput)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer mt-1 disabled:opacity-60"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#ffffff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#ffffff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#ffffff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              {users.some(u => u.role !== 'admin' && u.status === 'active') && (
                <div className="pt-2.5 border-t border-gray-100">
                  <p className="text-[10px] text-gray-500 font-semibold mb-1.5">Or choose an approved account:</p>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1 smooth-scroll">
                    {users.filter(u => u.role === 'student' && u.status === 'active').map((student) => (
                      <button
                        key={student.id}
                        type="button"
                        onClick={() => handleConfirmGoogleAccount(student.email, student.name, 'student')}
                        className="w-full p-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-left flex items-center justify-between transition cursor-pointer border border-gray-100"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold flex items-center justify-center">
                            {student.name.charAt(0)}
                          </span>
                          <div>
                            <p className="text-xs font-semibold text-gray-800">{student.name}</p>
                            <p className="text-[10px] text-gray-400 truncate max-w-[170px]">{student.email}</p>
                          </div>
                        </div>
                        <i className="fas fa-chevron-right text-gray-300 text-[10px]" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RegisterScreen({
  onBack,
  initialRole,
  onAdminRegistered,
}: {
  onBack: () => void;
  initialRole?: RegisterableRole;
  onAdminRegistered?: () => void;
}) {
  const { signUp, login } = useAuth();
  const { addUser, users, canRegisterAdmin, refreshUsersFromBackend } = useData();
  const [step, setStep] = useState(initialRole === 'admin' && canRegisterAdmin ? 2 : 1);
  const [remoteAdminOpen, setRemoteAdminOpen] = useState<boolean | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: (initialRole === 'admin' && canRegisterAdmin ? 'admin' : (initialRole || 'student')) as RegisterableRole,
    targetExam: '',
    department: '',
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState<{ title: string; message: string; isAdmin: boolean; createdUser?: User } | null>(null);
  const [error, setError] = useState('');
  const registerRateLimit = useRateLimitGuard('auth:register', {
    roleOverride: formData.role,
    actorIdOverride: formData.email.trim().toLowerCase() || `signup-${formData.role}`,
  });

  useEffect(() => {
    let active = true;
    fetchAdminRegistrationOpen().then((open) => {
      if (active && open !== null) {
        setRemoteAdminOpen(open);
      }
    });
    return () => { active = false; };
  }, []);

  const showAdminOption = remoteAdminOpen !== null ? remoteAdminOpen : canRegisterAdmin;

  useEffect(() => {
    if (!showAdminOption && formData.role === 'admin') {
      setFormData(prev => ({ ...prev, role: 'student' }));
      setStep(1);
    }
  }, [showAdminOption, formData.role]);

  const getRoleAvatar = (r: RegisterableRole) =>
    r === 'admin' ? '👨‍💼' : r === 'faculty' ? '👨‍⚕️' : r === 'consultant' ? '💼' : '👩‍🎓';

  const handleRegister = async () => {
    setError('');

    const cleanName = formData.name.trim();
    const cleanEmail = formData.email.trim().toLowerCase();
    const isAdminSignup = formData.role === 'admin';

    if (!cleanName || !cleanEmail || !formData.password) {
      setError('Please fill all required fields.');
      return;
    }

    if (isAdminSignup && !showAdminOption) {
      setError('Administrator registration is already closed because an Admin is registered.');
      setFormData(prev => ({ ...prev, role: 'student' }));
      setStep(1);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service to continue.');
      return;
    }

    if (users.find(u => u.email.toLowerCase() === cleanEmail)) {
      setError('Email is already registered.');
      return;
    }

    const regRateCheck = registerRateLimit.tryConsume(cleanEmail || `signup-${formData.role}`, formData.role);
    if (!regRateCheck.allowed) {
      setError(regRateCheck.message);
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Register in shared backend store
      const backendRes = await registerBackendSelfUser({
        name: cleanName,
        email: cleanEmail,
        phone: formData.phone.trim(),
        password: formData.password,
        role: formData.role,
        department: formData.department.trim(),
        targetExam: formData.targetExam,
      });

      if (!backendRes.networkError && !backendRes.ok) {
        if (backendRes.status === 403 && isAdminSignup) {
          setRemoteAdminOpen(false);
          setFormData(prev => ({ ...prev, role: 'student' }));
        }
        setError(backendRes.error || 'Registration failed.');
        setIsSubmitting(false);
        return;
      }

      const nextStatus = isAdminSignup ? 'active' : 'pending';
      const nextPerms = isAdminSignup ? { ...FULL_USER_PERMISSIONS } : { ...EMPTY_USER_PERMISSIONS };

      // 2. Register in Supabase Auth if configured
      if (isSupabaseConfigured()) {
        const result = await signUp({
          email: cleanEmail,
          password: formData.password,
          fullName: cleanName,
          phone: formData.phone.trim(),
          role: formData.role,
          department: formData.department.trim(),
          targetExam: formData.targetExam,
          status: nextStatus,
          accessPermissions: nextPerms,
          autoLogin: false,
        });

        if (!result.success) {
          const msg = (result.error || '').toLowerCase();
          const isDuplicateOrInvalid =
            msg.includes('already registered') ||
            msg.includes('already exists') ||
            msg.includes('invalid') ||
            msg.includes('password');
          if (isDuplicateOrInvalid) {
            setError(result.error || 'Registration failed in Supabase.');
            setIsSubmitting(false);
            return;
          }
          console.warn('[RegisterScreen] Non-fatal Supabase signup warning:', result.error);
        }
      }

      const createdUserRecord: User = {
        id: backendRes.data?.user?.id || `u-${Date.now()}`,
        name: cleanName,
        email: cleanEmail,
        phone: formData.phone.trim(),
        password: formData.password,
        role: formData.role,
        avatar: getRoleAvatar(formData.role),
        batch: isAdminSignup ? 'All' : '',
        status: nextStatus,
        accessPermissions: nextPerms,
        ...(isAdminSignup ? { selfRegisteredAdmin: true } : {}),
        department: isAdminSignup ? (formData.department.trim() || 'Academic Directorate') : formData.department.trim(),
        targetExam: formData.targetExam,
        createdAt: backendRes.data?.user?.createdAt || new Date().toISOString(),
      };

      addUser(createdUserRecord);

      if (isAdminSignup) {
        try { localStorage.setItem('sim_first_admin_registered_v1', 'true'); } catch { }
        setRemoteAdminOpen(false);
        onAdminRegistered?.();
      }

      refreshUsersFromBackend().catch(() => { });
      setSuccessNotice(
        isAdminSignup
          ? {
            title: 'Administrator Registered',
            message:
              'Your Academy Administrator account is active with full portal access. First-time Admin registration is now removed. You can now allow all users and manage resources.',
            isAdmin: true,
            createdUser: createdUserRecord,
          }
          : {
            title: 'Registration Submitted',
            message:
              'Your account has been registered and is awaiting Administrator approval. You will only be able to access your resources (branch, courses, quizzes, announcements, notifications) after an Admin allows your account.',
            isAdmin: false,
          }
      );
    } catch (err: any) {
      setError(err.message || 'An unexpected registration error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const roleOptions: {
    id: RegisterableRole;
    label: string;
    desc: string;
    icon: string;
    badge?: string;
  }[] = [
      { id: 'student', label: 'Medical Aspirant (Student)', desc: 'NEET, IMAT, UCAT exam prep, DPPs, mocks & lecture notes', icon: 'fa-graduation-cap' },
      { id: 'faculty', label: 'Faculty & Medical Doctor', desc: 'Create curriculum, author medical questions & upload resources', icon: 'fa-user-md' },
      ...(showAdminOption
        ? [{ id: 'admin' as RegisterableRole, label: 'Academy Administrator', desc: 'First-time setup: approve users & manage batches, courses & resources', icon: 'fa-user-shield', badge: 'First-Time Setup' }]
        : []),
      { id: 'consultant', label: 'Consultant Agent (Study Abroad)', desc: 'Passport, HRD, Apostille, Scholarship docs, Universitaly & IMAT verification', icon: 'fa-briefcase' },
    ];

  return (
    <div className="h-full max-h-[100dvh] w-full overflow-y-auto overflow-x-clip smooth-scroll bg-gradient-to-b from-[#0f2b46] to-[#1a3a5c] flex flex-col">
      <div className="italy-accent shrink-0">
        <div className="green" /><div className="white" /><div className="red" />
      </div>

      <div className="shrink-0 px-4 py-4 flex items-center gap-3">
        <button onClick={onBack} className="text-white text-lg p-2 rounded-lg hover:bg-white/10 transition">
          <i className="fas fa-arrow-left" />
        </button>
        <h1 className="text-white text-lg font-bold">Create Account</h1>
      </div>

      <div className="flex-1 px-6 py-4 max-w-md w-full mx-auto">
        {/* Step Progress Bar */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${s <= step ? 'bg-teal-400' : 'bg-white/20'
                }`}
            />
          ))}
        </div>

        {successNotice ? (
          <div className="text-center py-10 px-3 animate-slide-up space-y-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto border ${successNotice.isAdmin
                ? 'bg-teal-500/20 text-teal-300 border-teal-400/40'
                : 'bg-amber-500/20 text-amber-300 border-amber-400/40'
              }`}>
              <i className={`fas ${successNotice.isAdmin ? 'fa-user-shield' : 'fa-user-clock'} text-2xl`} />
            </div>
            <h3 className="text-white text-lg font-bold">{successNotice.title}</h3>
            <p className={`text-xs leading-relaxed bg-white/5 border border-white/10 rounded-xl p-3.5 ${successNotice.isAdmin ? 'text-teal-200' : 'text-amber-200'
              }`}>
              {successNotice.message}
            </p>
            {successNotice.isAdmin && successNotice.createdUser && (
              <button
                type="button"
                onClick={() => login(successNotice.createdUser!)}
                className="btn-primary w-full mt-2"
              >
                <i className="fas fa-user-shield mr-2" />
                Enter Admin Portal
              </button>
            )}
            <button
              type="button"
              onClick={onBack}
              className={successNotice.isAdmin && successNotice.createdUser ? 'btn-secondary w-full' : 'btn-primary w-full mt-2'}
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <>
            {step === 1 && (
              <div className="space-y-4 animate-slide-up">
                <div>
                  <h2 className="text-white text-lg font-semibold">Select Your Role</h2>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {showAdminOption
                      ? 'Administrator setup is available for the first Admin only. Students, Faculty, and Consultants require Admin approval.'
                      : 'Students, Faculty, and Consultant Agents can register here. Admin approval is required before access is granted.'}
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  {roleOptions.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => updateField('role', r.id)}
                      className={`w-full p-4 rounded-xl flex items-center gap-4 text-left transition ${formData.role === r.id
                          ? 'bg-teal-500/20 border-2 border-teal-400 shadow-lg shadow-teal-500/10'
                          : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                        }`}
                    >
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg ${formData.role === r.id ? 'bg-teal-400 text-[#0f2b46]' : 'bg-white/10 text-teal-400'
                        }`}>
                        <i className={`fas ${r.icon}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-white font-semibold text-sm">{r.label}</p>
                          {r.badge && (
                            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-400/20 text-teal-300 border border-teal-400/30">
                              {r.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 text-xs mt-0.5">{r.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <button onClick={() => setStep(2)} className="btn-primary mt-6 w-full">
                  Continue <i className="fas fa-arrow-right ml-1" />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-slide-up">
                <div>
                  <h2 className="text-white text-lg font-semibold">Personal Information</h2>
                  <p className="text-gray-400 text-xs mt-0.5">Please provide your official contact details.</p>
                </div>

                <input
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="Full Name *"
                  className="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 text-sm focus:outline-none focus:border-teal-400"
                />
                <input
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="Email Address *"
                  type="email"
                  className="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 text-sm focus:outline-none focus:border-teal-400"
                />
                <input
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="Phone Number (e.g. +91 / +39)"
                  type="tel"
                  className="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 text-sm focus:outline-none focus:border-teal-400"
                />

                {formData.role === 'student' && (
                  <div>
                    <label className="text-gray-300 text-xs font-medium block mb-1">Target Competitive Exam</label>
                    <select
                      value={formData.targetExam}
                      onChange={(e) => updateField('targetExam', e.target.value)}
                      className="w-full px-4 py-3.5 bg-[#173351] border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:border-teal-400"
                    >
                      <option value="">Select Target Exam</option>
                      <option value="NEET">NEET-UG (National Eligibility cum Entrance Test)</option>
                      <option value="IMAT">IMAT (International Medical Admissions Test - Italy)</option>
                      <option value="UCAT">UCAT (University Clinical Aptitude Test)</option>
                      <option value="MCAT">MCAT (Medical College Admission Test)</option>
                    </select>
                  </div>
                )}

                {formData.role === 'faculty' && (
                  <input
                    value={formData.department}
                    onChange={(e) => updateField('department', e.target.value)}
                    placeholder="Department (e.g. Anatomy, Physiology, Chemistry)"
                    className="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 text-sm focus:outline-none focus:border-teal-400"
                  />
                )}

                {formData.role === 'consultant' && (
                  <input
                    value={formData.department}
                    onChange={(e) => updateField('department', e.target.value)}
                    placeholder="Consultancy Specialization (e.g. Italy IMAT / HRD & Apostille)"
                    className="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 text-sm focus:outline-none focus:border-teal-400"
                  />
                )}

                {formData.role === 'admin' && (
                  <input
                    value={formData.department}
                    onChange={(e) => updateField('department', e.target.value)}
                    placeholder="Directorate / Institution Title (optional)"
                    className="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 text-sm focus:outline-none focus:border-teal-400"
                  />
                )}

                {error && (
                  <div className="bg-red-500/20 border border-red-500/50 rounded-lg px-3 py-2.5">
                    <p className="text-red-300 text-xs flex items-center gap-1.5">
                      <i className="fas fa-exclamation-circle text-red-400" />
                      <span>{error}</span>
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button onClick={() => { setError(''); setStep(1); }} className="btn-secondary flex-1">
                    Back
                  </button>
                  <button
                    onClick={() => {
                      if (!formData.name.trim() || !formData.email.trim()) {
                        setError('Please fill in your name and email.');
                        return;
                      }
                      setError('');
                      setStep(3);
                    }}
                    className="btn-primary flex-1"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-slide-up">
                <div>
                  <h2 className="text-white text-lg font-semibold">Security & Password</h2>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {formData.role === 'admin'
                      ? 'Create a strong password for your primary Academy Administrator account.'
                      : 'Create a password. Access remains locked until an Administrator allows your account.'}
                  </p>
                </div>

                <input
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  placeholder="Create Password (min. 6 characters) *"
                  type="password"
                  className="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 text-sm focus:outline-none focus:border-teal-400"
                />
                <input
                  value={formData.confirmPassword}
                  onChange={(e) => updateField('confirmPassword', e.target.value)}
                  placeholder="Confirm Password *"
                  type="password"
                  className="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 text-sm focus:outline-none focus:border-teal-400"
                />

                {error && (
                  <div className="bg-red-500/20 border border-red-500/50 rounded-lg px-3 py-2.5">
                    <p className="text-red-300 text-xs flex items-center gap-1.5">
                      <i className="fas fa-exclamation-circle text-red-400" />
                      <span>{error}</span>
                    </p>
                  </div>
                )}

                <RateLimitAlert
                  message={registerRateLimit.limitError}
                  retryAfterSeconds={registerRateLimit.retryAfterSeconds}
                  policyLabel={registerRateLimit.policyLabel}
                  variant="dark"
                />

                <label className="flex items-start gap-2.5 mt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 accent-teal-400"
                  />
                  <span className="text-gray-300 text-xs leading-relaxed">
                    I agree to the Sultanat e Italia Medica Honor Code, Privacy Policy, and Academic Terms.
                  </span>
                </label>

                <div className="flex gap-3 pt-3">
                  <button onClick={() => setStep(2)} className="btn-secondary flex-1" disabled={isSubmitting}>
                    Back
                  </button>
                  <button
                    onClick={handleRegister}
                    disabled={isSubmitting || registerRateLimit.isBlocked}
                    className="btn-primary flex-1 disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating...
                      </span>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function PendingApprovalScreen({ user }: { user: User }) {
  const { logout, refreshUserAccess } = useAuth();
  const { refreshUsersFromBackend } = useData();
  const [checking, setChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const approvalCheckLimit = useRateLimitGuard('approval:status_check', {
    roleOverride: user.role,
    actorIdOverride: user.id || user.email,
  });

  const handleCheckApproval = async () => {
    const rateCheck = approvalCheckLimit.tryConsume(user.id || user.email, user.role);
    if (!rateCheck.allowed) {
      setStatusMessage(rateCheck.message);
      return;
    }
    setChecking(true);
    setStatusMessage('');
    try {
      await refreshUsersFromBackend();
      const updated = await refreshUserAccess();
      if (updated && updated.status === 'pending') {
        setStatusMessage('Still awaiting Administrator approval. Please check again shortly.');
      }
    } finally {
      setChecking(false);
    }
  };

  const isSuspended = user.status === 'suspended';

  return (
    <div className="h-full max-h-[100dvh] w-full overflow-y-auto overflow-x-clip smooth-scroll bg-gradient-to-b from-[#0f2b46] to-[#1a3a5c] flex flex-col">
      <div className="italy-accent shrink-0">
        <div className="green" /><div className="white" /><div className="red" />
      </div>

      <div className="flex-1 flex flex-col px-6 py-8">
        <div className="w-full max-w-md mx-auto my-auto bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl p-6 text-center space-y-4 shadow-xl">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto border ${isSuspended
              ? 'bg-red-500/20 text-red-300 border-red-400/40'
              : 'bg-amber-500/20 text-amber-300 border-amber-400/40'
            }`}>
            <i className={`fas ${isSuspended ? 'fa-ban' : 'fa-user-clock'} text-2xl`} />
          </div>

          <div>
            <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-2 ${isSuspended ? 'bg-red-500/30 text-red-200' : 'bg-amber-500/30 text-amber-200'
              }`}>
              {isSuspended ? 'Access Suspended' : 'Pending Admin Approval'}
            </span>
            <h2 className="text-white text-lg font-bold">{user.name}</h2>
            <p className="text-gray-300 text-xs">{user.email} • {user.role.toUpperCase()}</p>
          </div>

          <p className="text-gray-200 text-xs leading-relaxed">
            {isSuspended
              ? 'Your account access has been suspended by the Academy Administrator. Resources, branches, courses, quizzes, announcements, and notifications are currently unavailable.'
              : 'Your registration is complete, but an Administrator must allow your account before you can access branches, courses, resources, quizzes, announcements, or notifications.'}
          </p>

          <div className="flex flex-wrap justify-center gap-1.5 pt-1">
            {['Resources', 'Branch', 'Courses', 'Quizzes', 'Announcements', 'Notifications'].map((item) => (
              <span key={item} className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-300 border border-white/10 flex items-center gap-1">
                <i className="fas fa-lock text-[8px] text-amber-300" />
                {item}
              </span>
            ))}
          </div>

          {statusMessage && (
            <p className="text-amber-200 text-[11px] bg-amber-500/15 border border-amber-400/30 rounded-xl px-3 py-2">
              {statusMessage}
            </p>
          )}

          <RateLimitAlert
            message={approvalCheckLimit.limitError}
            retryAfterSeconds={approvalCheckLimit.retryAfterSeconds}
            policyLabel={approvalCheckLimit.policyLabel}
            variant="dark"
          />

          <div className="space-y-2.5 pt-2">
            {!isSuspended && (
              <button
                type="button"
                onClick={handleCheckApproval}
                disabled={checking || approvalCheckLimit.isBlocked}
                className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-[#0f2b46] rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 disabled:opacity-70"
              >
                <i className={`fas ${checking ? 'fa-spinner fa-spin' : 'fa-sync-alt'}`} />
                <span>{checking ? 'Checking Approval Status...' : 'Check Approval Status'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={logout}
              className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold text-xs border border-white/15 transition flex items-center justify-center gap-2"
            >
              <i className="fas fa-sign-out-alt" />
              <span>Sign Out / Return to Login</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
