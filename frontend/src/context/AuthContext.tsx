import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  fetchUserProfile,
  signInUser,
  signUpUser,
  signOutUser,
  updateUserPassword,
  EMPTY_USER_PERMISSIONS,
  FULL_USER_PERMISSIONS,
  normalizePermissions,
  type AuthUser,
  type SignInPayload,
  type SignUpPayload,
  type AuthResult,
} from '../features/auth';
import {
  fetchBackendUserStatus,
  googleAuthBackendSync,
} from '../services/userAccessApi';
import type { User } from './DataContext';

interface AuthContextType {
  user: User | null;
  authUser: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isViewingAs: boolean;
  viewingAsUser: User | null;
  isPasswordRecovery: boolean;
  signIn: (payload: SignInPayload) => Promise<AuthResult<AuthUser>>;
  signUp: (payload: SignUpPayload) => Promise<AuthResult<AuthUser>>;
  signOut: () => Promise<void>;
  completePasswordRecovery: (newPassword: string) => Promise<AuthResult<void>>;
  dismissPasswordRecovery: () => void;
  login: (user: User) => void;
  logout: () => void;
  startViewingAs: (targetUser: User, reason: string) => void;
  stopViewingAs: () => void;
  refreshUserAccess: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function toLegacyUser(profile: AuthUser): User {
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    password: '',
    role: profile.role,
    avatar: profile.avatar,
    department: profile.department,
    batch: profile.batch,
    status: profile.status,
    accessPermissions: profile.accessPermissions,
    createdAt: profile.createdAt,
    targetExam: profile.targetExam,
  };
}

function findLocalUserOverride(email?: string, id?: string): User | null {
  try {
    const raw = localStorage.getItem('sim_users');
    if (!raw) return null;
    const list: User[] = JSON.parse(raw);
    const cleanEmail = (email || '').trim().toLowerCase();
    return (
      list.find(
        (u) =>
          (id && u.id === id) ||
          (cleanEmail && u.email?.toLowerCase() === cleanEmail)
      ) || null
    );
  } catch {
    return null;
  }
}

async function resolveAuthoritativeProfile(profile: AuthUser): Promise<AuthUser> {
  // Check backend user access store first (multi-browser/Render authoritative state)
  const remote = await fetchBackendUserStatus({ email: profile.email, id: profile.id });
  if (remote) {
    return {
      ...profile,
      role: remote.role || profile.role,
      batch: remote.batch ?? profile.batch,
      status: remote.role === 'admin' ? 'active' : remote.status,
      accessPermissions:
        remote.role === 'admin'
          ? { ...FULL_USER_PERMISSIONS }
          : normalizePermissions(remote.accessPermissions, remote.status === 'active'),
    };
  }

  // Fallback to local sim_users store if offline
  const localMatch = findLocalUserOverride(profile.email, profile.id);
  if (localMatch) {
    return {
      ...profile,
      role: localMatch.role || profile.role,
      batch: localMatch.batch ?? profile.batch,
      status: localMatch.role === 'admin' ? 'active' : localMatch.status,
      accessPermissions:
        localMatch.role === 'admin'
          ? { ...FULL_USER_PERMISSIONS }
          : normalizePermissions(localMatch.accessPermissions, localMatch.status === 'active'),
    };
  }

  // Newly seen OAuth/Supabase user not yet registered in directory -> ensure registered as pending on backend
  if (profile.role !== 'admin') {
    const synced = await googleAuthBackendSync({
      email: profile.email,
      name: profile.name,
      role: profile.role === 'faculty' || profile.role === 'consultant' ? profile.role : 'student',
    });
    if (synced.ok && synced.data?.user) {
      const u = synced.data.user;
      return {
        ...profile,
        role: u.role,
        batch: u.batch,
        status: u.status,
        accessPermissions: normalizePermissions(u.accessPermissions, u.status === 'active'),
      };
    }
    return {
      ...profile,
      status: profile.status || 'pending',
      accessPermissions:
        profile.status === 'active'
          ? normalizePermissions(profile.accessPermissions, true)
          : { ...EMPTY_USER_PERMISSIONS },
    };
  }

  return profile;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('currentUser');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isViewingAs, setIsViewingAs] = useState(false);
  const [viewingAsUser, setViewingAsUser] = useState<User | null>(null);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const suppressNextSignInRef = React.useRef(false);

  const applyAuthenticatedProfile = useCallback((profile: AuthUser) => {
    setAuthUser(profile);
    const legacy = toLegacyUser(profile);
    setUser(legacy);
    localStorage.setItem('currentUser', JSON.stringify(legacy));
  }, []);

  // Initialize session and listen for auth state changes
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      if (!isSupabaseConfigured()) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('[AuthContext] Session retrieval notice:', error.message);
        }

        if (session?.user && mounted) {
          const rawProfile = await fetchUserProfile(
            session.user.id,
            session.user.email,
            session.user.user_metadata
          );

          if (rawProfile && mounted) {
            const profile = await resolveAuthoritativeProfile(rawProfile);
            if (mounted) {
              applyAuthenticatedProfile(profile);
            }
          }
        }
      } catch (err) {
        console.error('[AuthContext] Init auth error:', err);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    initAuth();

    // Subscribe to auth state changes from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === 'PASSWORD_RECOVERY') {
          setIsPasswordRecovery(true);
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED' || event === 'PASSWORD_RECOVERY') {
          if (suppressNextSignInRef.current) {
            suppressNextSignInRef.current = false;
            return;
          }
          if (session?.user) {
            const rawProfile = await fetchUserProfile(
              session.user.id,
              session.user.email,
              session.user.user_metadata
            );
            if (rawProfile && mounted) {
              const profile = await resolveAuthoritativeProfile(rawProfile);
              if (mounted) {
                applyAuthenticatedProfile(profile);
              }
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setIsPasswordRecovery(false);
          setAuthUser(null);
          setUser(null);
          setIsViewingAs(false);
          setViewingAsUser(null);
          localStorage.removeItem('currentUser');
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [applyAuthenticatedProfile]);

  const signIn = async (payload: SignInPayload): Promise<AuthResult<AuthUser>> => {
    setIsLoading(true);
    try {
      const result = await signInUser(payload);
      if (result.success && result.data) {
        const profile = await resolveAuthoritativeProfile(result.data);
        if (profile.status !== 'active') {
          suppressNextSignInRef.current = true;
          await signOutUser();
          setAuthUser(null);
          setUser(null);
          localStorage.removeItem('currentUser');
          return {
            success: false,
            data: profile,
            error:
              profile.status === 'pending'
                ? 'PENDING_APPROVAL'
                : 'Your account has been suspended. Please contact the administrator.',
          };
        }
        applyAuthenticatedProfile(profile);
        return { success: true, data: profile };
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (payload: SignUpPayload): Promise<AuthResult<AuthUser>> => {
    setIsLoading(true);
    try {
      const shouldSkipSession =
        payload.autoLogin === false ||
        (payload.role !== 'admin' && (payload.status || 'pending') !== 'active');
      if (shouldSkipSession) {
        suppressNextSignInRef.current = true;
      }
      const result = await signUpUser(payload);
      if (result.success && result.data) {
        if (result.data.status !== 'active' || payload.autoLogin === false) {
          // Wait for explicit sign-in / admin approval before entering dashboard
          await signOutUser();
          setAuthUser(null);
          setUser(null);
          localStorage.removeItem('currentUser');
          return result;
        }
        applyAuthenticatedProfile(result.data);
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await signOutUser();
      setIsPasswordRecovery(false);
      setAuthUser(null);
      setUser(null);
      setIsViewingAs(false);
      setViewingAsUser(null);
      localStorage.removeItem('currentUser');
    } finally {
      setIsLoading(false);
    }
  };

  const completePasswordRecovery = async (newPassword: string): Promise<AuthResult<void>> => {
    const result = await updateUserPassword(newPassword);
    if (result.success) {
      setIsPasswordRecovery(false);
    }
    return result;
  };

  const dismissPasswordRecovery = () => {
    setIsPasswordRecovery(false);
  };

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const logout = () => {
    signOut();
  };

  const startViewingAs = (targetUser: User, reason: string) => {
    setIsViewingAs(true);
    setViewingAsUser(targetUser);
    console.log(`[AUDIT] Admin ${user?.name} started viewing as ${targetUser.name}. Reason: ${reason}`);
  };

  const stopViewingAs = () => {
    console.log(`[AUDIT] Admin ${user?.name} stopped viewing as ${viewingAsUser?.name}`);
    setIsViewingAs(false);
    setViewingAsUser(null);
  };

  const refreshUserAccess = useCallback(async (): Promise<User | null> => {
    if (!user) return null;
    const remote = await fetchBackendUserStatus({ email: user.email, id: user.id });
    if (remote) {
      const updated: User = {
        ...user,
        role: remote.role || user.role,
        batch: remote.batch ?? user.batch,
        status: remote.role === 'admin' ? 'active' : remote.status,
        accessPermissions:
          remote.role === 'admin'
            ? { ...FULL_USER_PERMISSIONS }
            : normalizePermissions(remote.accessPermissions, remote.status === 'active'),
      };
      setUser(updated);
      localStorage.setItem('currentUser', JSON.stringify(updated));
      return updated;
    }
    const localMatch = findLocalUserOverride(user.email, user.id);
    if (localMatch) {
      const updated: User = {
        ...user,
        role: localMatch.role || user.role,
        batch: localMatch.batch ?? user.batch,
        status: localMatch.role === 'admin' ? 'active' : localMatch.status,
        accessPermissions:
          localMatch.role === 'admin'
            ? { ...FULL_USER_PERMISSIONS }
            : normalizePermissions(localMatch.accessPermissions, localMatch.status === 'active'),
      };
      setUser(updated);
      localStorage.setItem('currentUser', JSON.stringify(updated));
      return updated;
    }
    return user;
  }, [user]);

  const syncCurrentWithLocalUsers = useCallback(() => {
    setUser((prev) => {
      if (!prev) return prev;
      const localMatch = findLocalUserOverride(prev.email, prev.id);
      if (!localMatch) return prev;
      const nextStatus = localMatch.role === 'admin' ? 'active' : localMatch.status;
      const nextPerms =
        localMatch.role === 'admin'
          ? { ...FULL_USER_PERMISSIONS }
          : normalizePermissions(localMatch.accessPermissions, nextStatus === 'active');
      const changed =
        prev.status !== nextStatus ||
        prev.batch !== localMatch.batch ||
        prev.role !== localMatch.role ||
        JSON.stringify(prev.accessPermissions || {}) !== JSON.stringify(nextPerms);
      if (!changed) return prev;
      const updated: User = {
        ...prev,
        role: localMatch.role || prev.role,
        batch: localMatch.batch ?? prev.batch,
        status: nextStatus,
        accessPermissions: nextPerms,
      };
      localStorage.setItem('currentUser', JSON.stringify(updated));
      return updated;
    });
    setViewingAsUser((prev) => {
      if (!prev) return prev;
      const localMatch = findLocalUserOverride(prev.email, prev.id);
      if (!localMatch) return prev;
      return { ...prev, ...localMatch, password: '' };
    });
  }, []);

  useEffect(() => {
    const handleSync = () => syncCurrentWithLocalUsers();
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'sim_users') syncCurrentWithLocalUsers();
    };
    window.addEventListener('lms-users-updated', handleSync);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('lms-users-updated', handleSync);
      window.removeEventListener('storage', handleStorage);
    };
  }, [syncCurrentWithLocalUsers]);

  const effectiveUser = isViewingAs && viewingAsUser ? viewingAsUser : user;

  return (
    <AuthContext.Provider
      value={{
        user: effectiveUser,
        authUser,
        isAuthenticated: !!effectiveUser,
        isLoading,
        isViewingAs,
        viewingAsUser,
        isPasswordRecovery,
        signIn,
        signUp,
        signOut,
        completePasswordRecovery,
        dismissPasswordRecovery,
        login,
        logout,
        startViewingAs,
        stopViewingAs,
        refreshUserAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
